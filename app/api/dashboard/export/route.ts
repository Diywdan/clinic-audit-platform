import { format } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

import { requireDashboardAccess } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/queries";

function parseDate(value: string | null) {
  if (!value) return undefined;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function buildRows(
  ranking: Awaited<ReturnType<typeof getDashboardData>>["ranking"]
) {
  return ranking.map((item, index) => ({
    rank: index + 1,
    clinicName: item.clinicName,
    averageScore: item.averageScore,
    evaluations: item.evaluations,
    criticalViolations: item.criticalViolations,
    trend: item.trend,
    status: item.status.label,
    block1: item.blocks.find((block) => block.blockId === 1)?.score ?? 0,
    block2: item.blocks.find((block) => block.blockId === 2)?.score ?? 0,
    block3: item.blocks.find((block) => block.blockId === 3)?.score ?? 0,
    block4: item.blocks.find((block) => block.blockId === 4)?.score ?? 0,
  }));
}

function escapeCsv(value: string | number) {
  const stringValue = String(value);

  if (/[",\n;]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export async function GET(request: NextRequest) {
  await requireDashboardAccess();

  const { searchParams } = new URL(request.url);

  const clinicId = searchParams.get("clinicId") ?? undefined;
  const from = parseDate(searchParams.get("from"));
  const to = parseDate(searchParams.get("to"));
  const exportFormat =
    searchParams.get("format") === "excel" ? "excel" : "csv";

  const { clinics, ranking } = await getDashboardData({
    clinicId,
    from,
    to,
  });

  const rows = buildRows(ranking);

  const selectedClinicName = clinicId
    ? clinics.find((clinic) => clinic.id === clinicId)?.name ??
      "Выбранная клиника"
    : "Все клиники";

  const periodLabel = from && to
    ? `${format(from, "dd.MM.yyyy")} — ${format(to, "dd.MM.yyyy")}`
    : from
    ? `с ${format(from, "dd.MM.yyyy")}`
    : to
    ? `по ${format(to, "dd.MM.yyyy")}`
    : "Весь период";

  const averageNetworkScore = rows.length
    ? Math.round(
        rows.reduce((sum, row) => sum + row.averageScore, 0) / rows.length
      )
    : 0;

  const riskCount = rows.filter((row) => row.averageScore < 50).length;
  const criticalCount = rows.filter(
    (row) => row.criticalViolations > 0
  ).length;
  const leader = rows[0]?.clinicName ?? "Недостаточно данных";
  const weakest = rows[rows.length - 1]?.clinicName ?? "Не определён";

  if (exportFormat === "csv") {
    const headers = [
      "Место",
      "Клиника",
      "Средний балл",
      "Проверки",
      "Критические нарушения",
      "Тренд",
      "Статус",
      "Блок 1",
      "Блок 2",
      "Блок 3",
      "Блок 4",
    ];

    const csv = [
      headers.join(";"),
      ...rows.map((row) =>
        [
          row.rank,
          row.clinicName,
          row.averageScore,
          row.evaluations,
          row.criticalViolations,
          row.trend,
          row.status,
          row.block1,
          row.block2,
          row.block3,
          row.block4,
        ]
          .map(escapeCsv)
          .join(";")
      ),
    ].join("\n");

    return new NextResponse(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="dashboard-rating-${format(
          new Date(),
          "yyyy-MM-dd"
        )}.csv"`,
      },
    });
  }

  const summaryRows = `
<tr><td><strong>Период отчёта</strong></td><td>${periodLabel}</td></tr>
<tr><td><strong>Контур</strong></td><td>${selectedClinicName}</td></tr>
<tr><td><strong>Средний балл сети</strong></td><td>${averageNetworkScore}%</td></tr>
<tr><td><strong>Клиники в красной зоне</strong></td><td>${riskCount}</td></tr>
<tr><td><strong>Клиники с критическими нарушениями</strong></td><td>${criticalCount}</td></tr>
<tr><td><strong>Лидер периода</strong></td><td>${leader}</td></tr>
<tr><td><strong>Главный риск</strong></td><td>${weakest}</td></tr>
`;

  const dataRows = rows
    .map(
      (row) => `
<tr>
  <td>${row.rank}</td>
  <td>${row.clinicName}</td>
  <td>${row.averageScore}%</td>
  <td>${row.evaluations}</td>
  <td>${row.criticalViolations}</td>
  <td>${row.trend}%</td>
  <td>${row.status}</td>
  <td>${row.block1}</td>
  <td>${row.block2}</td>
  <td>${row.block3}</td>
  <td>${row.block4}</td>
</tr>
`
    )
    .join("");

  const html = `
<html>
<head>
  <meta charset="utf-8" />
</head>
<body>
  <table border="1">
    <tr><th colspan="2">Сводка по dashboard</th></tr>
    ${summaryRows}
  </table>
  <br />
  <table border="1">
    <tr>
      <th>Место</th>
      <th>Клиника</th>
      <th>Средний балл</th>
      <th>Проверки</th>
      <th>Критические нарушения</th>
      <th>Тренд</th>
      <th>Статус</th>
      <th>Блок 1</th>
      <th>Блок 2</th>
      <th>Блок 3</th>
      <th>Блок 4</th>
    </tr>
    ${dataRows}
  </table>
</body>
</html>
`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="dashboard-rating-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.xls"`,
    },
  });
}