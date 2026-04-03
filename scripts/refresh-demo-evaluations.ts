import { PrismaClient } from "@prisma/client";

import { criteriaCatalog } from "@/lib/data/criteria";
import { calculateEvaluationScore } from "@/lib/services/score";

const prisma = new PrismaClient();

const evaluatorEmails = [
  "daniil.tsuranov@audit.local",
  "anastasiya.mochalina@audit.local",
  "aisu.azizova@audit.local",
  "viktoriya.shalygina@audit.local",
  "artem.kosolapov@audit.local"
] as const;

const demoEvaluationTemplates = [
  {
    date: new Date("2025-11-18T09:00:00.000Z"),
    profile: "medium" as const,
    notes: "Демо: базовая осенняя проверка с отдельными замечаниями"
  },
  {
    date: new Date("2025-12-10T09:00:00.000Z"),
    profile: "low" as const,
    notes: "Демо: зимняя проверка с выраженными проблемами"
  },
  {
    date: new Date("2026-01-22T09:00:00.000Z"),
    profile: "medium" as const,
    notes: "Демо: повторная проверка после частичных исправлений"
  },
  {
    date: new Date("2026-02-14T09:00:00.000Z"),
    profile: "high" as const,
    notes: "Демо: сильная проверка с высоким уровнем сервиса"
  },
  {
    date: new Date("2026-03-05T09:00:00.000Z"),
    profile: "medium" as const,
    notes: "Демо: неоднородный результат перед весенним циклом"
  },
  {
    date: new Date("2026-03-15T09:00:00.000Z"),
    profile: "high" as const,
    notes: "Демо: стабильная сильная проверка"
  },
  {
    date: new Date("2026-03-20T09:00:00.000Z"),
    profile: "medium" as const,
    notes: "Демо: смешанная проверка с отдельными замечаниями"
  },
  {
    date: new Date("2026-03-24T09:00:00.000Z"),
    profile: "low" as const,
    notes: "Демо: проблемная проверка для аналитики"
  }
] as const;

function sortOptionsByScore(scoreLeft: number, scoreRight: number) {
  return scoreRight - scoreLeft;
}

function pickSingleOption(
  criterion: (typeof criteriaCatalog)[number],
  profile: "high" | "medium" | "low",
  clinicIndex: number
) {
  const options = [...criterion.options].sort((left, right) => sortOptionsByScore(left.score, right.score));
  const positive = options.filter((option) => option.score > 0);
  const neutral = options.filter((option) => option.score === 0);
  const negative = options.filter((option) => option.score < 0).sort((left, right) => left.score - right.score);

  if (profile === "high") {
    return positive[0] ?? neutral[0] ?? options[0];
  }

  if (profile === "medium") {
    if (criterion.isCritical) {
      return neutral[0] ?? positive[0] ?? negative[0] ?? options[0];
    }

    const selector = (criterion.order + clinicIndex) % 4;
    if (selector === 0 && negative.length > 0) return negative[0];
    if (selector <= 2 && neutral.length > 0) return neutral[0];
    return positive[0] ?? neutral[0] ?? negative[0] ?? options[0];
  }

  if (criterion.isCritical || ((criterion.order + clinicIndex) % 3 === 0 && negative.length > 0)) {
    return negative[0] ?? neutral[0] ?? options[options.length - 1];
  }

  return neutral[0] ?? negative[0] ?? options[options.length - 1];
}

function buildDemoAnswers(clinicIndex: number, profile: "high" | "medium" | "low") {
  return criteriaCatalog.flatMap((criterion) => {
    if (criterion.type === "single") {
      const option = pickSingleOption(criterion, profile, clinicIndex);
      return [
        {
          criterionId: criterion.id,
          optionId: option.id,
          selectedScore: option.score,
          blockId: criterion.blockId,
          isCritical: criterion.isCritical
        }
      ];
    }

    const groups = Array.from(new Set(criterion.options.map((option) => option.group)));
    return groups.map((group, groupIndex) => {
      const groupOptions = criterion.options.filter((option) => option.group === group);
      const positive = [...groupOptions].sort((left, right) => sortOptionsByScore(left.score, right.score))[0];
      const negative = [...groupOptions].sort((left, right) => left.score - right.score)[0];
      const fallback = groupOptions[0];

      let option = positive ?? fallback;
      if (profile === "medium" && (clinicIndex + groupIndex) % 3 === 0) {
        option = negative ?? option;
      }
      if (profile === "low") {
        option = (clinicIndex + groupIndex) % 2 === 0 ? negative ?? fallback : fallback;
      }

      return {
        criterionId: criterion.id,
        optionId: option.id,
        selectedScore: option.score,
        blockId: criterion.blockId,
        isCritical: criterion.isCritical
      };
    });
  });
}

async function main() {
  const evaluators = await prisma.user.findMany({
    where: { email: { in: [...evaluatorEmails] } },
    select: { id: true, email: true, name: true }
  });

  const clinics = await prisma.clinic.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  });

  await prisma.evaluation.deleteMany({
    where: {
      clinicId: { in: clinics.map((clinic) => clinic.id) },
      userId: { in: evaluators.map((evaluator) => evaluator.id) }
    }
  });

  let created = 0;

  for (const [clinicIndex, clinic] of clinics.entries()) {
    for (const [templateIndex, template] of demoEvaluationTemplates.entries()) {
      const user = evaluators[(clinicIndex + templateIndex) % evaluators.length];
      const answers = buildDemoAnswers(clinicIndex + templateIndex, template.profile);
      const score = calculateEvaluationScore(answers);

      await prisma.evaluation.create({
        data: {
          clinicId: clinic.id,
          userId: user.id,
          evaluationDate: template.date,
          totalScore: score.totalScore,
          totalPercentage: score.totalPercentage,
          criticalCount: score.criticalViolations,
          notes: template.notes,
          answers: {
            create: answers.map((answer) => ({
              criterionId: answer.criterionId,
              optionId: answer.optionId,
              selectedScore: answer.selectedScore
            }))
          },
          photos: {
            create: [
              { url: "/uploads/demo-1.jpg" },
              { url: "/uploads/demo-2.jpg" },
              { url: "/uploads/demo-3.jpg" }
            ]
          }
        }
      });

      created += 1;
    }
  }

  console.log("Demo evaluations refreshed", {
    clinics: clinics.length,
    evaluators: evaluators.length,
    templates: demoEvaluationTemplates.length,
    created
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
