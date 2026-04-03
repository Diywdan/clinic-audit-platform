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

type DemoProfile = "high" | "medium" | "low";

type DemoTemplate = {
  date: Date;
  profile: DemoProfile;
  notes: string;
};

const demoTemplateGroups: DemoTemplate[][] = [
  [
    {
      date: new Date("2025-11-18T09:00:00.000Z"),
      profile: "medium",
      notes: "Демо: базовая осенняя проверка с отдельными замечаниями"
    },
    {
      date: new Date("2025-12-10T09:00:00.000Z"),
      profile: "medium",
      notes: "Демо: зимняя проверка без резких провалов"
    },
    {
      date: new Date("2026-01-22T09:00:00.000Z"),
      profile: "high",
      notes: "Демо: после настройки процессов качество выросло"
    },
    {
      date: new Date("2026-02-14T09:00:00.000Z"),
      profile: "high",
      notes: "Демо: сильная проверка с высоким уровнем сервиса"
    },
    {
      date: new Date("2026-03-05T09:00:00.000Z"),
      profile: "high",
      notes: "Демо: устойчиво высокий результат"
    },
    {
      date: new Date("2026-03-15T09:00:00.000Z"),
      profile: "high",
      notes: "Демо: стабильная сильная проверка"
    },
    {
      date: new Date("2026-03-20T09:00:00.000Z"),
      profile: "high",
      notes: "Демо: высокая оценка без критических сбоев"
    },
    {
      date: new Date("2026-03-24T09:00:00.000Z"),
      profile: "medium",
      notes: "Демо: небольшое снижение на фоне высокой базы"
    }
  ],
  [
    {
      date: new Date("2025-11-18T09:00:00.000Z"),
      profile: "low",
      notes: "Демо: старт с выраженными проблемами"
    },
    {
      date: new Date("2025-12-10T09:00:00.000Z"),
      profile: "low",
      notes: "Демо: повторный провал без системных исправлений"
    },
    {
      date: new Date("2026-01-22T09:00:00.000Z"),
      profile: "medium",
      notes: "Демо: первые признаки восстановления"
    },
    {
      date: new Date("2026-02-14T09:00:00.000Z"),
      profile: "medium",
      notes: "Демо: частичные улучшения по ключевым зонам"
    },
    {
      date: new Date("2026-03-05T09:00:00.000Z"),
      profile: "high",
      notes: "Демо: заметный скачок после управленческого вмешательства"
    },
    {
      date: new Date("2026-03-15T09:00:00.000Z"),
      profile: "high",
      notes: "Демо: сильная проверка после исправлений"
    },
    {
      date: new Date("2026-03-20T09:00:00.000Z"),
      profile: "medium",
      notes: "Демо: закрепление результата с отдельными замечаниями"
    },
    {
      date: new Date("2026-03-24T09:00:00.000Z"),
      profile: "high",
      notes: "Демо: выход из красной зоны"
    }
  ],
  [
    {
      date: new Date("2025-11-18T09:00:00.000Z"),
      profile: "high",
      notes: "Демо: сильный старт"
    },
    {
      date: new Date("2025-12-10T09:00:00.000Z"),
      profile: "high",
      notes: "Демо: удержание высокого уровня"
    },
    {
      date: new Date("2026-01-22T09:00:00.000Z"),
      profile: "medium",
      notes: "Демо: начало просадки по отдельным блокам"
    },
    {
      date: new Date("2026-02-14T09:00:00.000Z"),
      profile: "medium",
      notes: "Демо: рост числа замечаний"
    },
    {
      date: new Date("2026-03-05T09:00:00.000Z"),
      profile: "low",
      notes: "Демо: серьёзное ухудшение в ходе цикла"
    },
    {
      date: new Date("2026-03-15T09:00:00.000Z"),
      profile: "low",
      notes: "Демо: проблемная проверка после просадки"
    },
    {
      date: new Date("2026-03-20T09:00:00.000Z"),
      profile: "medium",
      notes: "Демо: попытка стабилизации"
    },
    {
      date: new Date("2026-03-24T09:00:00.000Z"),
      profile: "medium",
      notes: "Демо: частичное выравнивание результата"
    }
  ],
  [
    {
      date: new Date("2025-11-18T09:00:00.000Z"),
      profile: "medium",
      notes: "Демо: средний старт"
    },
    {
      date: new Date("2025-12-10T09:00:00.000Z"),
      profile: "high",
      notes: "Демо: удачный цикл с сильным результатом"
    },
    {
      date: new Date("2026-01-22T09:00:00.000Z"),
      profile: "low",
      notes: "Демо: резкий провал после сильного месяца"
    },
    {
      date: new Date("2026-02-14T09:00:00.000Z"),
      profile: "medium",
      notes: "Демо: частичное восстановление"
    },
    {
      date: new Date("2026-03-05T09:00:00.000Z"),
      profile: "high",
      notes: "Демо: рывок вверх после корректировок"
    },
    {
      date: new Date("2026-03-15T09:00:00.000Z"),
      profile: "medium",
      notes: "Демо: смешанный результат"
    },
    {
      date: new Date("2026-03-20T09:00:00.000Z"),
      profile: "low",
      notes: "Демо: повторная нестабильность"
    },
    {
      date: new Date("2026-03-24T09:00:00.000Z"),
      profile: "medium",
      notes: "Демо: средний результат без явного лидирования"
    }
  ]
] as const;

function sortOptionsByScore(scoreLeft: number, scoreRight: number) {
  return scoreRight - scoreLeft;
}

function pickSingleOption(
  criterion: (typeof criteriaCatalog)[number],
  profile: DemoProfile,
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

function buildDemoAnswers(clinicIndex: number, profile: DemoProfile) {
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
    const templateGroup = demoTemplateGroups[clinicIndex % demoTemplateGroups.length];

    for (const [templateIndex, template] of templateGroup.entries()) {
      const user = evaluators[(clinicIndex + templateIndex) % evaluators.length];
      const answers = buildDemoAnswers(clinicIndex + templateIndex * 2, template.profile);
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
    templatesPerClinic: demoTemplateGroups[0].length,
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
