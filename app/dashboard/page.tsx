import Link from "next/link";
import { parseISO } from "date-fns";
import { AlertTriangle, BarChart3, Building2, ClipboardList } from "lucide-react";

import { DashboardCharts } from "@/components/charts/dashboard-charts";
import { DashboardFilters } from "@/components/forms/dashboard-filters";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { requireDashboardAccess } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/queries";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireDashboardAccess();
  const params = await searchParams;
  const clinicId = typeof params.clinicId === "string" ? params.clinicId : undefined;
  const from = typeof params.from === "string" ? parseISO(params.from) : undefined;
  const to = typeof params.to === "string" ? parseISO(params.to) : undefined;
  const { clinics, ranking, trends, blockComparison } = await getDashboardData({ clinicId, from, to });

  return (
    <AppShell
      title="Главный дашборд"
      subtitle="Рейтинг клиник, баллы по блокам и динамика оценок"
      role={session.user.role}
    >
      <Card>
        <DashboardFilters clinics={clinics} />
      </Card>
      <div className="metrics-grid">
        <Card className="kpi-card kpi-primary"><span className="eyebrow">Клиники</span><div className="kpi-row"><div><h3>{ranking.length}</h3><p>В таблице рейтинга</p></div><Building2 size={24} /></div></Card>
        <Card className="kpi-card kpi-secondary"><span className="eyebrow">Проверки</span><div className="kpi-row"><div><h3>{ranking.reduce((sum, item) => sum + item.evaluations, 0)}</h3><p>Завершено аудитов</p></div><ClipboardList size={24} /></div></Card>
        <Card className="kpi-card kpi-tertiary"><span className="eyebrow">Средний балл</span><div className="kpi-row"><div><h3>{ranking.length ? Math.round(ranking.reduce((sum, item) => sum + item.averageScore, 0) / ranking.length) : 0}%</h3><p>По видимым клиникам</p></div><BarChart3 size={24} /></div></Card>
        <Card className="kpi-card kpi-danger"><span className="eyebrow">Риск</span><div className="kpi-row"><div><h3>{ranking.filter((item) => item.averageScore < 50).length}</h3><p>Ниже 50 баллов</p></div><AlertTriangle size={24} /></div></Card>
      </div>
      <Card>
        <div className="section-heading">
          <h3>Рейтинг клиник</h3>
          <p>Общий балл, оценка по блокам, тренд и индикаторы риска</p>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Клиника</th>
                <th>Итог</th>
                <th>Блок 1</th>
                <th>Блок 2</th>
                <th>Блок 3</th>
                <th>Блок 4</th>
                <th>Проверки</th>
                <th>Тренд</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((row) => (
                <tr key={row.clinicId}>
                  <td>
                    <strong>
                      <Link href={`/clinics/${row.clinicId}`} className="inline-link">
                        {row.clinicName}
                      </Link>
                    </strong>
                    <div>{row.criticalViolations > 0 ? "Есть критические нарушения" : "Критических флагов нет"}</div>
                  </td>
                  <td>{row.averageScore}%</td>
                  {row.blocks.map((block) => (
                    <td key={block.blockId}>{block.score}%</td>
                  ))}
                  <td>{row.evaluations}</td>
                  <td>{row.trend > 0 ? `+${row.trend}` : row.trend}</td>
                  <td><span className={`status-pill ${row.status.className}`}>{row.status.label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <DashboardCharts trends={trends} blockComparison={blockComparison} />
    </AppShell>
  );
}
