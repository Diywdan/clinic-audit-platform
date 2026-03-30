import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  ClipboardList,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import { DashboardCharts } from "@/components/charts/dashboard-charts";
import { DashboardExportActions } from "@/components/forms/dashboard-export-actions";
import { DashboardFilters } from "@/components/forms/dashboard-filters";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { requireDashboardAccess } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/queries";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireDashboardAccess();
  const params = await searchParams;
  const clinicId =
    typeof params.clinicId === "string" ? params.clinicId : undefined;
  const from =
    typeof params.from === "string" ? parseISO(params.from) : undefined;
  const to = typeof params.to === "string" ? parseISO(params.to) : undefined;

  const { clinics, ranking, trends, blockComparison } =
    await getDashboardData({ clinicId, from, to });

  const averageNetworkScore = ranking.length
    ? Math.round(
        ranking.reduce((sum, item) => sum + item.averageScore, 0) /
          ranking.length
      )
    : 0;

  const totalEvaluations = ranking.reduce(
    (sum, item) => sum + item.evaluations,
    0
  );

  const riskCount = ranking.filter((item) => item.averageScore < 50).length;
  const criticalCount = ranking.filter(
    (item) => item.criticalViolations > 0
  ).length;
  const positiveTrendCount = ranking.filter((item) => item.trend > 0).length;
  const negativeTrendCount = ranking.filter((item) => item.trend < 0).length;

  const leader = ranking[0];
  const weakest = ranking[ranking.length - 1];
  const clinicWithCritical = ranking.find(
    (item) => item.criticalViolations > 0
  );
  const clinicWithNegativeTrend = ranking.find((item) => item.trend < 0);
  const clinicWithPositiveTrend = ranking.find((item) => item.trend > 0);
  const stableHighPerformer = ranking.find(
    (item) => item.criticalViolations === 0 && item.averageScore >= 80
  );

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

  const attentionItems = [
    weakest
      ? {
          title: weakest.clinicName,
          value: `${weakest.averageScore}%`,
          description: "Наихудший итоговый балл по текущей выборке",
        }
      : null,
    clinicWithCritical
      ? {
          title: clinicWithCritical.clinicName,
          value: `${clinicWithCritical.criticalViolations}`,
          description: "Критические нарушения требуют управленческого внимания",
        }
      : null,
    clinicWithNegativeTrend
      ? {
          title: clinicWithNegativeTrend.clinicName,
          value: `${clinicWithNegativeTrend.trend}%`,
          description: "Отрицательная динамика за выбранный период",
        }
      : null,
  ].filter(Boolean) as Array<{
    title: string;
    value: string;
    description: string;
  }>;

  const leaderItems = [
    leader
      ? {
          title: leader.clinicName,
          value: `${leader.averageScore}%`,
          description: "Лучший итоговый балл по текущей выборке",
        }
      : null,
    clinicWithPositiveTrend
      ? {
          title: clinicWithPositiveTrend.clinicName,
          value: `+${clinicWithPositiveTrend.trend}%`,
          description: "Наиболее заметный положительный тренд за период",
        }
      : null,
    stableHighPerformer
      ? {
          title: stableHighPerformer.clinicName,
          value: "без критики",
          description:
            "Сильный объект без критических нарушений в текущем периоде",
        }
      : null,
  ].filter(Boolean) as Array<{
    title: string;
    value: string;
    description: string;
  }>;

  const topThree = ranking.slice(0, 3);

  return (
    <AppShell
      title="Панель управления качеством"
      subtitle="Сводная картина по сети клиник, ключевым рискам и динамике за выбранный период"
      role={session.user.role}
    >
      <Card className="manager-hero-card">
        <div className="manager-hero-head">
          <div className="manager-hero-content">
            <p className="eyebrow">Управленческий обзор</p>
            <h3>Сводка качества по текущему управленческому срезу</h3>
            <p className="manager-hero-text">
              Фокус верхнего экрана: период, контур и ключевые сигналы для
              руководителя. Ниже — фильтры и основные KPI.
            </p>

            <div className="manager-hero-context">
              <div className="manager-context-chip">
                <span>Период</span>
                <strong>{periodLabel}</strong>
              </div>
              <div className="manager-context-chip">
                <span>Контур</span>
                <strong>{selectedClinicName}</strong>
              </div>
            </div>
          </div>

          <div className="manager-hero-actions">
            <DashboardExportActions />
          </div>
        </div>

        <div className="manager-overview-grid">
          <div className="manager-overview-box">
            <span>Лидер периода</span>
            <strong>
              {leader
                ? `${leader.clinicName} — ${leader.averageScore}%`
                : "Недостаточно данных"}
            </strong>
            <small>Лучший итоговый результат</small>
          </div>

          <div className="manager-overview-box manager-overview-box-danger">
            <span>Главный риск</span>
            <strong>
              {weakest
                ? `${weakest.clinicName} — ${weakest.averageScore}%`
                : "Не определён"}
            </strong>
            <small>Наиболее уязвимая точка среза</small>
          </div>

          <div className="manager-overview-box">
            <span>Критические нарушения</span>
            <strong>{criticalCount}</strong>
            <small>Клиник с критическими флагами</small>
          </div>

          <div className="manager-overview-box">
            <strong>{periodLabel}</strong>
            <span>Срез применён ко всем блокам</span>
            <small>Фильтры и KPI ниже продолжают этот контекст</small>
          </div>
        </div>
      </Card>

      <div className="manager-flow-anchor">
        <span>Рабочий контур отчёта</span>
        <p>
          Уточните фильтры — KPI, рейтинг и графики обновятся в этом же срезе.
        </p>
      </div>

      <Card>
        <DashboardFilters clinics={clinics} />
      </Card>

      <div className="metrics-grid manager-kpi-grid">
        <Card className="kpi-card kpi-primary manager-kpi-card">
          <span className="eyebrow">Клиники в мониторинге</span>
          <div className="kpi-row">
            <div>
              <h3>{ranking.length}</h3>
              <p>Объекты, попавшие в текущую выборку dashboard</p>
            </div>
            <Building2 size={24} />
          </div>
        </Card>

        <Card className="kpi-card kpi-secondary manager-kpi-card">
          <span className="eyebrow">Проверки за период</span>
          <div className="kpi-row">
            <div>
              <h3>{totalEvaluations}</h3>
              <p>Все завершённые аудиты по выбранным фильтрам</p>
            </div>
            <ClipboardList size={24} />
          </div>
        </Card>

        <Card className="kpi-card kpi-tertiary manager-kpi-card">
          <span className="eyebrow">Средний балл сети</span>
          <div className="kpi-row">
            <div>
              <h3>{averageNetworkScore}%</h3>
              <p>Средний результат по текущему срезу</p>
            </div>
            <TrendingUp size={24} />
          </div>
        </Card>

        <Card className="kpi-card kpi-danger manager-kpi-card">
          <span className="eyebrow">Красная зона</span>
          <div className="kpi-row">
            <div>
              <h3>{riskCount}</h3>
              <p>Клиники с итоговым баллом ниже 50%</p>
            </div>
            <AlertTriangle size={24} />
          </div>
        </Card>

        <Card className="kpi-card manager-kpi-card manager-kpi-card-warning">
          <span className="eyebrow">Критические нарушения</span>
          <div className="kpi-row">
            <div>
              <h3>{criticalCount}</h3>
              <p>Клиники, где есть хотя бы одно критическое нарушение</p>
            </div>
            <ShieldAlert size={24} />
          </div>
        </Card>

        <Card className="kpi-card manager-kpi-card manager-kpi-card-neutral">
          <span className="eyebrow">Динамика</span>
          <div className="kpi-row">
            <div>
              <h3>
                {positiveTrendCount} / {negativeTrendCount}
              </h3>
              <p>Клиник с положительным и отрицательным трендом</p>
            </div>
            <BarChart3 size={24} />
          </div>
        </Card>
      </div>

      <div className="manager-highlight-grid">
        <Card className="manager-attention-card">
          <div className="section-heading">
            <div>
              <h3>Требует внимания</h3>
              <p>
                Клиники и сигналы, на которые руководителю стоит посмотреть в
                первую очередь
              </p>
            </div>
          </div>

          <div className="manager-attention-grid">
            {attentionItems.length ? (
              attentionItems.map((item) => (
                <div
                  key={`${item.title}-${item.description}`}
                  className="manager-attention-item"
                >
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                  <div className="manager-attention-value">{item.value}</div>
                </div>
              ))
            ) : (
              <div className="clinic-empty-state">
                <h3>Сигналов повышенного внимания не найдено</h3>
                <p>
                  По текущей выборке не найдено объектов с явным ухудшением или
                  критическими флагами.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="manager-leader-card">
          <div className="section-heading">
            <div>
              <h3>Лидеры и сильные практики</h3>
              <p>
                Клиники, на которые можно опереться как на ориентир для сети
              </p>
            </div>
          </div>

          <div className="manager-attention-grid">
            {leaderItems.length ? (
              leaderItems.map((item) => (
                <div
                  key={`${item.title}-${item.description}`}
                  className="manager-leader-item"
                >
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                  <div className="manager-leader-value">{item.value}</div>
                </div>
              ))
            ) : (
              <div className="clinic-empty-state">
                <h3>Лидеры пока не выделены</h3>
                <p>Для устойчивых положительных сигналов пока недостаточно данных.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="manager-analytics-grid">
        <Card className="manager-ranking-card">
          <div className="section-heading manager-ranking-heading">
            <div>
              <h3>Рейтинг клиник</h3>
              <p>
                Общий балл, блоки, тренд и сигналы риска по текущему
                управленческому срезу
              </p>
            </div>
            <div className="manager-ranking-meta">
              <span>Объектов в рейтинге</span>
              <strong>{ranking.length}</strong>
            </div>
          </div>

          {topThree.length ? (
            <div className="manager-podium-grid">
              {topThree.map((row, index) => (
                <div key={row.clinicId} className="manager-podium-card">
                  <div className="manager-podium-rank">#{index + 1}</div>
                  <strong>{row.clinicName}</strong>
                  <p>
                    {index === 0
                      ? "Лидер периода"
                      : "Один из сильнейших результатов текущего среза"}
                  </p>
                  <div className="manager-podium-score">{row.averageScore}%</div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="table-wrap manager-table-wrap">
            <table className="table manager-table">
              <thead>
                <tr>
                  <th>Место / клиника</th>
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
                {ranking.map((row, index) => (
                  <tr key={row.clinicId}>
                    <td>
                      <div className="manager-clinic-cell">
                        <div className="manager-rank-badge">#{index + 1}</div>
                        <div>
                          <strong>
                            <Link href={`/clinics/${row.clinicId}`} className="inline-link">
                              {row.clinicName}
                            </Link>
                          </strong>
                          <div className="manager-clinic-subline">
                            {row.criticalViolations > 0
                              ? `Критических нарушений: ${row.criticalViolations}`
                              : "Критических флагов нет"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="manager-score-pill">{row.averageScore}%</span>
                    </td>
                    {row.blocks.map((block) => (
                      <td key={block.blockId}>
                        <span className="manager-block-pill">{block.score}%</span>
                      </td>
                    ))}
                    <td>{row.evaluations}</td>
                    <td>
                      <span
                        className={`manager-trend-pill ${
                          row.trend > 0
                            ? "manager-trend-up"
                            : row.trend < 0
                              ? "manager-trend-down"
                              : "manager-trend-flat"
                        }`}
                      >
                        {row.trend > 0 ? `+${row.trend}` : row.trend}%
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${row.status.className}`}>{row.status.label}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="manager-insight-stack">
          <Card className="manager-insight-card">
            <div className="section-heading">
              <div>
                <h3>Как читать аналитику ниже</h3>
                <p>
                  Короткая интерпретация для руководителя перед графиками и
                  детализацией
                </p>
              </div>
            </div>

            <div className="manager-insight-list">
              <div className="manager-insight-item">
                <strong>Сначала смотрите на тренд</strong>
                <p>
                  Даже при хорошем текущем балле отрицательная динамика может
                  сигнализировать о начале просадки.
                </p>
              </div>
              <div className="manager-insight-item">
                <strong>Потом сверяйте блоки</strong>
                <p>
                  Разница между блоками помогает понять, где проблема системная,
                  а где локальная.
                </p>
              </div>
              <div className="manager-insight-item">
                <strong>Фильтры меняют весь срез</strong>
                <p>
                  Рейтинг, графики и экспорт всегда относятся к выбранному
                  периоду и текущему контуру.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <DashboardCharts trends={trends} blockComparison={blockComparison} />
    </AppShell>
  );
}