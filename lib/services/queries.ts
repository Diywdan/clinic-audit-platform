import { addDays, format } from "date-fns";

import { BLOCK_CONFIG } from "@/lib/constants";
import { criteriaCatalog } from "@/lib/data/criteria";
import { prisma } from "@/lib/prisma";
import { calculateEvaluationScore } from "@/lib/services/score";
import { getClinicStatus } from "@/lib/utils";

function buildEvaluationDetails(evaluation: {
  id: string;
  createdAt: Date;
  photos: { id: string; url: string }[];
  user: { name: string | null; email: string };
  answers: Array<{
    id?: string;
    criterionId: string;
    optionId?: string | null;
    selectedScore: number;
    criterion: { blockId: number; isCritical: boolean };
  }>;
}) {
  const score = calculateEvaluationScore(
    evaluation.answers.map((answer) => ({
      criterionId: answer.criterionId,
      blockId: answer.criterion.blockId,
      selectedScore: answer.selectedScore,
      isCritical: answer.criterion.isCritical
    }))
  );

  const answerGroups = new Map<
    string,
    Array<{ optionId?: string | null; selectedScore: number }>
  >();
  for (const answer of evaluation.answers) {
    const bucket = answerGroups.get(answer.criterionId) ?? [];
    bucket.push({
      optionId: answer.optionId,
      selectedScore: answer.selectedScore
    });
    answerGroups.set(answer.criterionId, bucket);
  }

  const reportBlocks = Object.values(BLOCK_CONFIG).map((block) => {
    const blockCriteria = criteriaCatalog.filter((criterion) => criterion.blockId === block.id);
    const sectionsMap = new Map<
      string,
      Array<{
        id: string;
        order: number;
        text: string;
        isCritical: boolean;
        answers: Array<{ label: string; score: number }>;
        totalScore: number;
      }>
    >();

    for (const criterion of blockCriteria) {
      const selectedAnswers = [...(answerGroups.get(criterion.id) ?? [])];
      const optionsPool = [...criterion.options];
      const resolvedAnswers = selectedAnswers.map(({ optionId, selectedScore }) => {
        let optionIndex = -1;

        if (optionId) {
          optionIndex = optionsPool.findIndex((option) => option.id === optionId);
        }

        if (optionIndex < 0) {
          optionIndex = optionsPool.findIndex((option) => option.score === selectedScore);
        }

        const option = optionIndex >= 0 ? optionsPool.splice(optionIndex, 1)[0] : undefined;
        return {
          label: option
            ? option.groupLabel
              ? `${option.groupLabel}: ${option.label}`
              : option.label
            : `Выбран вариант с баллом ${selectedScore}`,
          score: selectedScore
        };
      });

      const sectionBucket = sectionsMap.get(criterion.section) ?? [];
      sectionBucket.push({
        id: criterion.id,
        order: criterion.order,
        text: criterion.text,
        isCritical: criterion.isCritical,
        answers: resolvedAnswers,
        totalScore: resolvedAnswers.reduce((sum, item) => sum + item.score, 0)
      });
      sectionsMap.set(criterion.section, sectionBucket);
    }

    const currentBlock = score.byBlock.find((item) => item.blockId === block.id);

    return {
      blockId: block.id,
      name: block.name,
      rawScore: currentBlock?.score ?? 0,
      min: block.min,
      max: block.max,
      normalizedPercent: Math.round((currentBlock?.normalized ?? 0) * 100),
      weight: block.weight,
      contributionPercent: Math.round((currentBlock?.weighted ?? 0) * 1000) / 10,
      sections: Array.from(sectionsMap.entries()).map(([section, criteria]) => ({
        section,
        criteria
      }))
    };
  });

  return {
    id: evaluation.id,
    createdAt: evaluation.createdAt,
    totalPercentage: score.totalPercentage,
    criticalCount: score.criticalViolations,
    user: evaluation.user,
    photos: evaluation.photos,
    status: getClinicStatus(score.totalPercentage),
    score,
    reportBlocks
  };
}

export async function getEvaluationFormData() {
  const clinics = await prisma.clinic.findMany({ orderBy: { name: "asc" } });
  const criteria = [...criteriaCatalog].sort((left, right) => left.order - right.order);

  return { clinics, criteria };
}

export async function getEvaluatorSubmissions(userId: string) {
  return prisma.evaluation.findMany({
    where: { userId },
    include: { clinic: true, photos: true },
    orderBy: { createdAt: "desc" },
    take: 12
  });
}

export async function getDashboardData(filters?: { clinicId?: string; from?: Date; to?: Date }) {
  const where = {
    clinicId: filters?.clinicId || undefined,
    createdAt: {
      gte: filters?.from,
      lte: filters?.to ? addDays(filters.to, 1) : undefined
    }
  };

  const [clinics, evaluations] = await Promise.all([
    prisma.clinic.findMany({ orderBy: { name: "asc" } }),
    prisma.evaluation.findMany({
      where,
      include: { clinic: true, answers: { include: { criterion: true } } },
      orderBy: { createdAt: "asc" }
    })
  ]);

  const grouped = new Map<
    string,
    {
      clinicId: string;
      clinicName: string;
      scores: number[];
      evaluations: number;
      criticalViolations: number;
      latestScore: number;
      blockSums: Record<number, number>;
    }
  >();

  const trendMap = new Map<string, { total: number; count: number }>();
  const blockAverages: Record<number, { total: number; count: number }> = {
    1: { total: 0, count: 0 },
    2: { total: 0, count: 0 },
    3: { total: 0, count: 0 },
    4: { total: 0, count: 0 }
  };

  for (const evaluation of evaluations) {
    const answers = evaluation.answers.map((answer) => ({
      criterionId: answer.criterionId,
      blockId: answer.criterion.blockId,
      selectedScore: answer.selectedScore,
      isCritical: answer.criterion.isCritical
    }));

    const score = calculateEvaluationScore(answers);
    const trendKey = format(evaluation.createdAt, "yyyy-MM-dd");
    const trendEntry = trendMap.get(trendKey) ?? { total: 0, count: 0 };
    trendEntry.total += score.totalPercentage;
    trendEntry.count += 1;
    trendMap.set(trendKey, trendEntry);

    const clinicEntry = grouped.get(evaluation.clinicId) ?? {
      clinicId: evaluation.clinicId,
      clinicName: evaluation.clinic.name,
      scores: [],
      evaluations: 0,
      criticalViolations: 0,
      latestScore: 0,
      blockSums: { 1: 0, 2: 0, 3: 0, 4: 0 }
    };

    clinicEntry.scores.push(score.totalPercentage);
    clinicEntry.evaluations += 1;
    clinicEntry.criticalViolations += score.criticalViolations;
    clinicEntry.latestScore = score.totalPercentage;

    for (const block of score.byBlock) {
      const blockPercent = Math.round(block.normalized * 100);
      clinicEntry.blockSums[block.blockId] += blockPercent;
      blockAverages[block.blockId].total += blockPercent;
      blockAverages[block.blockId].count += 1;
    }

    grouped.set(evaluation.clinicId, clinicEntry);
  }

  const ranking = Array.from(grouped.values())
    .map((entry) => {
      const average = entry.scores.reduce((sum, value) => sum + value, 0) / entry.scores.length;
      return {
        clinicId: entry.clinicId,
        clinicName: entry.clinicName,
        averageScore: Math.round(average),
        evaluations: entry.evaluations,
        criticalViolations: entry.criticalViolations,
        trend: entry.latestScore - Math.round(average),
        status: getClinicStatus(Math.round(average)),
        blocks: Object.values(BLOCK_CONFIG).map((block) => ({
          blockId: block.id,
          score: Math.round(entry.blockSums[block.id] / Math.max(entry.evaluations, 1))
        }))
      };
    })
    .sort((left, right) => right.averageScore - left.averageScore);

  const trends = Array.from(trendMap.entries()).map(([date, value]) => ({
    date,
    score: Math.round(value.total / value.count)
  }));

  const blockComparison = Object.values(BLOCK_CONFIG).map((block) => ({
    block: block.name,
    score: Math.round(blockAverages[block.id].total / Math.max(blockAverages[block.id].count, 1))
  }));

  return { clinics, ranking, trends, blockComparison };
}

export async function getAdminData() {
  const [clinics, users, evaluations] = await Promise.all([
    prisma.clinic.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true }
    }),
    prisma.evaluation.findMany({
      include: {
        clinic: { select: { name: true } },
        user: { select: { email: true } },
        photos: { select: { id: true, url: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return { clinics, users, evaluations };
}

export async function getClinicsOverview() {
  const clinics = await prisma.clinic.findMany({
    include: {
      evaluations: {
        include: {
          photos: true,
          answers: { include: { criterion: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { name: "asc" }
  });

  return clinics.map((clinic) => {
    const scores = clinic.evaluations.map((evaluation) =>
      calculateEvaluationScore(
        evaluation.answers.map((answer) => ({
          criterionId: answer.criterionId,
          blockId: answer.criterion.blockId,
          selectedScore: answer.selectedScore,
          isCritical: answer.criterion.isCritical
        }))
      )
    );

    const averageScore = scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score.totalPercentage, 0) / scores.length)
      : 0;
    const latestScore = scores[0]?.totalPercentage ?? 0;
    const previousScore = scores[1]?.totalPercentage ?? latestScore;
    const blockScores = Object.values(BLOCK_CONFIG).map((block) => ({
      blockId: block.id,
      score: scores.length
        ? Math.round(
            scores.reduce((sum, score) => {
              const currentBlock = score.byBlock.find((item) => item.blockId === block.id);
              return sum + Math.round((currentBlock?.normalized ?? 0) * 100);
            }, 0) / scores.length
          )
        : 0
    }));

    return {
      id: clinic.id,
      name: clinic.name,
      address: clinic.address,
      averageScore,
      latestScore,
      trend: latestScore - previousScore,
      status: getClinicStatus(averageScore),
      evaluationsCount: clinic.evaluations.length,
      criticalViolations: scores.reduce((sum, score) => sum + score.criticalViolations, 0),
      blockScores,
      photos: clinic.evaluations.flatMap((evaluation) => evaluation.photos).slice(0, 3)
    };
  });
}

export async function getClinicDetail(clinicId: string, selectedEvaluationId?: string) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: {
      evaluations: {
        include: {
          photos: true,
          user: { select: { name: true, email: true } },
          answers: { include: { criterion: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!clinic) return null;

  const scoredEvaluations = clinic.evaluations.map((evaluation) => {
    const details = buildEvaluationDetails(evaluation);

    return {
      ...details,
      blockScores: Object.values(BLOCK_CONFIG).map((block) => ({
        blockId: block.id,
        name: block.name,
        score: Math.round(
          (details.score.byBlock.find((item) => item.blockId === block.id)?.normalized ?? 0) * 100
        )
      }))
    };
  });

  const averageScore = scoredEvaluations.length
    ? Math.round(
        scoredEvaluations.reduce((sum, evaluation) => sum + evaluation.score.totalPercentage, 0) /
          scoredEvaluations.length
      )
    : 0;
  const latestScore = scoredEvaluations[0]?.score.totalPercentage ?? 0;
  const previousScore = scoredEvaluations[1]?.score.totalPercentage ?? latestScore;
  const blockAverages = Object.values(BLOCK_CONFIG).map((block) => ({
    blockId: block.id,
    name: block.name,
    score: scoredEvaluations.length
      ? Math.round(
          scoredEvaluations.reduce((sum, evaluation) => {
            const currentBlock = evaluation.blockScores.find((item) => item.blockId === block.id);
            return sum + (currentBlock?.score ?? 0);
          }, 0) / scoredEvaluations.length
        )
      : 0
  }));
  const trends = scoredEvaluations
    .slice()
    .reverse()
    .map((evaluation) => ({
      date: format(evaluation.createdAt, "yyyy-MM-dd"),
      clinicName: clinic.name,
      totalScore: evaluation.score.totalPercentage
    }));
  const selectedEvaluation =
    scoredEvaluations.find((evaluation) => evaluation.id === selectedEvaluationId) ??
    scoredEvaluations[0] ??
    null;

  return {
    clinic: {
      id: clinic.id,
      name: clinic.name,
      address: clinic.address,
      latitude: clinic.latitude,
      longitude: clinic.longitude
    },
    averageScore,
    latestScore,
    trend: latestScore - previousScore,
    status: getClinicStatus(averageScore),
    evaluationsCount: scoredEvaluations.length,
    criticalViolations: scoredEvaluations.reduce(
      (sum, evaluation) => sum + evaluation.score.criticalViolations,
      0
    ),
    blockAverages,
    trends,
    photos: scoredEvaluations.flatMap((evaluation) => evaluation.photos).slice(0, 12),
    selectedEvaluation,
    evaluations: scoredEvaluations.map((evaluation) => ({
      id: evaluation.id,
      createdAt: evaluation.createdAt,
      totalPercentage: evaluation.score.totalPercentage,
      criticalCount: evaluation.score.criticalViolations,
      user: evaluation.user,
      photos: evaluation.photos,
      status: getClinicStatus(evaluation.score.totalPercentage),
      reportBlocks: evaluation.reportBlocks
    }))
  };
}
