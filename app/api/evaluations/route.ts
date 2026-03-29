import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { criteriaCatalogMap } from "@/lib/data/criteria";
import { prisma } from "@/lib/prisma";
import { calculateEvaluationScore } from "@/lib/services/score";
import { startOfCurrentDay } from "@/lib/utils";
import { evaluationSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }
  if (session.user.role === "MANAGER") {
    return NextResponse.json({ error: "Руководителю доступен только дашборд" }, { status: 403 });
  }

  const json = await request.json();
  const parsed = evaluationSchema.safeParse(json);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Некорректные данные проверки" },
      { status: 400 }
    );
  }

  const { clinicId, answers, notes, photoUrls } = parsed.data;
  const answeredCriteria = new Set(answers.map((answer) => answer.criterionId));

  if (answeredCriteria.size / criteriaCatalogMap.size < 0.8) {
    return NextResponse.json({ error: "Необходимо заполнить минимум 80% критериев" }, { status: 400 });
  }

  const criticalBlockAnswered = new Set<number>();
  const enrichedAnswers: Array<{
    criterionId: string;
    optionId: string;
    selectedScore: number;
    blockId: number;
    isCritical: boolean;
  }> = [];

  for (const answer of answers) {
    const criterion = criteriaCatalogMap.get(answer.criterionId);
    if (!criterion) {
      return NextResponse.json({ error: `Неизвестный критерий: ${answer.criterionId}` }, { status: 400 });
    }

    if (criterion.isCritical) criticalBlockAnswered.add(criterion.blockId);

    enrichedAnswers.push({
      criterionId: answer.criterionId,
      optionId: answer.optionId,
      selectedScore: answer.selectedScore,
      blockId: criterion.blockId,
      isCritical: criterion.isCritical
    });
  }

  if (criticalBlockAnswered.size === 0) {
    return NextResponse.json(
      { error: "Нужно ответить хотя бы на один критический критерий" },
      { status: 400 }
    );
  }

  const evaluationDate = startOfCurrentDay();
  const existing = await prisma.evaluation.findUnique({
    where: {
      clinicId_userId_evaluationDate: {
        clinicId,
        userId: session.user.id,
        evaluationDate
      }
    }
  });

  if (existing) {
    return NextResponse.json(
      { error: "Разрешена только одна проверка одной клиники одним пользователем в день" },
      { status: 409 }
    );
  }

  const score = calculateEvaluationScore(enrichedAnswers);
  const evaluation = await prisma.evaluation.create({
    data: {
      clinicId,
      userId: session.user.id,
      evaluationDate,
      totalScore: score.totalScore,
      totalPercentage: score.totalPercentage,
      criticalCount: score.criticalViolations,
      notes,
      answers: {
        create: answers.map((answer) => ({
          criterionId: answer.criterionId,
          optionId: answer.optionId,
          selectedScore: answer.selectedScore
        }))
      },
      photos: {
        create: photoUrls.map((url) => ({ url }))
      }
    }
  });

  return NextResponse.json({
    id: evaluation.id,
    totalPercentage: score.totalPercentage,
    criticalViolations: score.criticalViolations,
    blocks: score.byBlock
  });
}
