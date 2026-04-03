import bcrypt from "bcryptjs";

import { PrismaClient } from "@prisma/client";

import { criteriaCatalog, criteriaSeed } from "@/lib/data/criteria";
import { calculateEvaluationScore } from "@/lib/services/score";
import { startOfCurrentDay } from "@/lib/utils";

const prisma = new PrismaClient();

const clinicSeed = [
  { id: "gp-1-sovetskaya", name: "Городская поликлиника №1", address: "ул. Советская, 26 (Зегеля,9А)", latitude: 52.6031, longitude: 39.5708 },
  { id: "gp-1-filial-smorodina-13", name: "ГП №1 (филиал)", address: "ул. Петра Смородина, 13", latitude: 52.5873, longitude: 39.5356 },
  { id: "gp-1-filial-pobedy-61", name: "ГП №1 (филиал)", address: "ул. Просп. Победы, 61", latitude: 52.5964, longitude: 39.5481 },
  { id: "gp-4-gagarina-139", name: "Городская поликлиника №4", address: "ул. Гагарина, 139", latitude: 52.6182, longitude: 39.5719 },
  { id: "gp-4-filial-eletskoe-13", name: "ГП №4 (филиал)", address: "ул. Елецкое шоссе,13", latitude: 52.5744, longitude: 39.4998 },
  { id: "gp-4-filial-merkulova-34", name: "ГП №4 (филиал)", address: "ул. Генерала Меркулова, 34", latitude: 52.5846, longitude: 39.5183 },
  { id: "gb-smp-1-zvezdnaya", name: "ГБ СМП №1", address: "ул. Звёздная, 15/1", latitude: 52.6126, longitude: 39.5531 },
  { id: "gb-3-svobodny-sokol", name: "ГБ №3 «Свободный Сокол»", address: "ул. Тамбовская, 1", latitude: 52.6521, longitude: 39.6472 },
  { id: "gb-4-lipetsk-med-nevskogo", name: "ГБ №4 \"Липецк-Мед\"", address: "ул. Невского, 25", latitude: 52.6413, longitude: 39.6027 },
  { id: "gb-4-lipetsk-med-kommunisticheskaya", name: "ГБ №4 \"Липецк-Мед\" (филиал)", address: "ул. Коммунистическая, 24", latitude: 52.6401, longitude: 39.6332 },
  { id: "gb-4-lipetsk-med-pisareva", name: "ГБ №4 \"Липецк-Мед\" (филиал)", address: "ул. Писарева, 2а", latitude: 52.6467, longitude: 39.6195 },
  { id: "lood-makarova", name: "ЛООД", address: "ул. Адмирала Макарова, 1е", latitude: 52.5679, longitude: 39.6157 },
  { id: "msch-mvd-tsiolkovskogo", name: "МСЧ МВД", address: "ул. Циолковского, 20", latitude: 52.5966, longitude: 39.5644 },
  { id: "lokc-lenina-35", name: "ЛОКЦ", address: "ул. Ленина, 35", latitude: 52.6108, longitude: 39.5991 },
  { id: "lokc-filial-shkatova-1", name: "ЛОКЦ (филиал)", address: "ул. Шкатова, 1", latitude: 52.6287, longitude: 39.6105 },
  { id: "lokb-moskovskaya-6a", name: "ЛОКБ", address: "ул. Московская, 6а", latitude: 52.6336, longitude: 39.5018 },
  { id: "lokib-kosmonavtov-37a", name: "ЛОКИБ", address: "ул. Космонавтов, 37а", latitude: 52.6037, longitude: 39.5495 },
  { id: "gp-1-stomatology-smorodina-2", name: "Городская поликлиника №1 (стоматология)", address: "ул. Смородина, 2", latitude: 52.5884, longitude: 39.5417 },
  { id: "gp-2-stomatology-kosmonavtov-37-5", name: "Городская поликлиника №2 (стоматология)", address: "ул. Космонавтов, 37/5", latitude: 52.6034, longitude: 39.5489 },
  { id: "gb-3-svobodny-sokol-stomatology", name: "ГБ №3 «Свободный Сокол» (стоматология)", address: "ул. Ушинского, 9/1", latitude: 52.6552, longitude: 39.6414 },
  { id: "gb-4-lipetsk-med-stomatology", name: "ГБ №4\"Липецк-Мед\" (стоматология)", address: "ул. Коммунистическая, 24", latitude: 52.6401, longitude: 39.6332 },
  { id: "oblast-stomatology-tsiolkovskogo-22", name: "Областная стоматологическая поликлиника", address: "ул. Циолковского, 22", latitude: 52.5961, longitude: 39.5651 }
] as const;

const evaluatorSeed = [
  { email: "daniil.tsuranov@audit.local", name: "Даниил Цуранов" },
  { email: "anastasiya.mochalina@audit.local", name: "Анастасия Мочалина" },
  { email: "aisu.azizova@audit.local", name: "Айсу Азизова" },
  { email: "viktoriya.shalygina@audit.local", name: "Виктория Шалыгина" },
  { email: "artem.kosolapov@audit.local", name: "Артём Косолапов" }
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
    if (selector === 0 && negative.length > 0) {
      return negative[0];
    }
    if (selector <= 2 && neutral.length > 0) {
      return neutral[0];
    }
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
  const adminPassword = await bcrypt.hash("admin123", 10);
  const managerPassword = await bcrypt.hash("manager123", 10);
  const evaluatorPassword = await bcrypt.hash("evaluator123", 10);

  const [admin, manager] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@audit.local" },
      update: { name: "System Admin", passwordHash: adminPassword, role: "ADMIN" as never },
      create: { email: "admin@audit.local", name: "System Admin", passwordHash: adminPassword, role: "ADMIN" as never }
    }),
    prisma.user.upsert({
      where: { email: "manager@audit.local" },
      update: { name: "Chief Dashboard", passwordHash: managerPassword, role: "MANAGER" as never },
      create: { email: "manager@audit.local", name: "Chief Dashboard", passwordHash: managerPassword, role: "MANAGER" as never }
    })
  ]);

  await prisma.user.deleteMany({
    where: { email: "eva@audit.local" }
  });

  const evaluators = await Promise.all(
    evaluatorSeed.map((evaluator) =>
      prisma.user.upsert({
        where: { email: evaluator.email },
        update: {
          name: evaluator.name,
          passwordHash: evaluatorPassword,
          role: "EVALUATOR" as never
        },
        create: {
          email: evaluator.email,
          name: evaluator.name,
          passwordHash: evaluatorPassword,
          role: "EVALUATOR" as never
        }
      })
    )
  );

  await prisma.clinic.deleteMany({
    where: {
      id: { notIn: clinicSeed.map((clinic) => clinic.id) }
    }
  });

  const clinics = await Promise.all(
    clinicSeed.map((clinic) =>
      prisma.clinic.upsert({
        where: { id: clinic.id },
        update: clinic,
        create: clinic
      })
    )
  );

  await Promise.all(
    criteriaSeed.map((criterion) =>
      prisma.criterion.upsert({
        where: { id: criterion.id },
        update: criterion,
        create: criterion
      })
    )
  );

  await prisma.criterion.deleteMany({
    where: {
      id: { notIn: criteriaSeed.map((criterion) => criterion.id) },
      answers: { none: {} }
    }
  });

  await prisma.evaluation.deleteMany({
    where: {
      clinicId: { in: clinics.map((clinic) => clinic.id) },
      userId: { in: evaluators.map((evaluator) => evaluator.id) }
    }
  });

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
    }
  }

  console.log("Seed complete", {
    admin: admin.email,
    manager: manager.email,
    evaluators: evaluators.map((evaluator) => evaluator.email)
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
