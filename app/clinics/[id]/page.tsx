import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageIcon, MapPin, ShieldAlert, TrendingUp } from "lucide-react";

import { BlockComparisonChart } from "@/components/charts/block-comparison-chart";
import { ScoreTrendChart } from "@/components/charts/score-trend-chart";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { requireDashboardAccess } from "@/lib/auth/session";
import { getClinicDetail } from "@/lib/services/queries";

export default async function ClinicDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireDashboardAccess();
  const { id } = await params;
  const query = await searchParams;
  const selectedEvaluationId =
    typeof query.evaluationId === "string" ? query.evaluationId : undefined;
  const data = await getClinicDetail(id, selectedEvaluationId);

  if (!data) notFound();

  return (
    <AppShell
      title="Детали поликлиники"
      subtitle="История проверок, фотографии и аналитика по выбранному объекту"
      role={session.user.role}
    >
      <section className="clinic-hero clinic-hero-compact">
        <div className="clinic-hero-main">
          <Link href="/clinics" className="clinic-back-link">
            <ArrowLeft size={16} />
            <span>Назад к списку</span>
          </Link>
          <div className="clinic-breadcrumb">Поликлиники / Детальный отчет</div>
          <h1>{data.clinic.name}</h1>
          <div className="clinic-address">
            <MapPin size={16} />
            <span>{data.clinic.address}</span>
          </div>
        </div>
        <div className="clinic-hero-score clinic-hero-score-compact">
          <div>
            <span>Общий рейтинг</span>
            <strong>{data.averageScore}%</strong>
          </div>
          <div className="clinic-hero-meta">
            <span className={`status-pill ${data.status.className}`}>{data.status.label}</span>
            <small>{data.trend > 0 ? `+${data.trend}` : data.trend}% к прошлой проверке</small>
          </div>
        </div>
      </section>

      <div className="clinic-detail-layout">
        <div className="clinic-detail-main">
          <div className="clinic-detail-summary-grid">
            <Card className="clinic-detail-summary-card">
              <div className="clinic-detail-summary-icon clinic-detail-summary-icon-primary">
                <TrendingUp size={18} />
              </div>
              <span>Средний рейтинг</span>
              <strong>{data.averageScore}%</strong>
              <small>Текущий результат по объекту</small>
            </Card>
            <Card className="clinic-detail-summary-card clinic-detail-summary-card-warning">
              <div className="clinic-detail-summary-icon clinic-detail-summary-icon-warning">
                <ShieldAlert size={18} />
              </div>
              <span>Критические нарушения</span>
              <strong>{data.criticalViolations}</strong>
              <small>Выявлено по последним проверкам</small>
            </Card>
            <Card className="clinic-detail-summary-card">
              <div className="clinic-detail-summary-icon clinic-detail-summary-icon-neutral">
                <ImageIcon size={18} />
              </div>
              <span>Фотоматериалы</span>
              <strong>{data.photos.length}</strong>
              <small>Доступно в истории объекта</small>
            </Card>
            <Card className="clinic-detail-summary-card">
              <div className="clinic-detail-summary-icon clinic-detail-summary-icon-primary">
                <MapPin size={18} />
              </div>
              <span>Проверок</span>
              <strong>{data.evaluationsCount}</strong>
              <small>{data.clinic.latitude}, {data.clinic.longitude}</small>
            </Card>
          </div>

          <Card className="clinic-detail-blocks-card">
            <div className="section-heading">
              <div>
                <h3>Разбивка по блокам</h3>
                <p>Где объект выглядит устойчиво, а где требует доработки</p>
              </div>
            </div>
            <div className="clinic-bars">
              {data.blockAverages.map((block) => (
                <div key={block.blockId} className="clinic-bar-item">
                  <div className="clinic-bar-meta">
                    <span>{block.name}</span>
                    <strong>{block.score}%</strong>
                  </div>
                  <div className="clinic-bar-track">
                    <div className="clinic-bar-fill" style={{ width: `${block.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="section-heading">
              <h3>Фотоматериалы</h3>
              <p>{data.photos.length} фото в последних проверках</p>
            </div>
            <div className="clinic-gallery">
              {data.photos.length ? (
                data.photos.map((photo) => (
                  <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="clinic-gallery-item">
                    <img src={photo.url} alt="Фото поликлиники" />
                  </a>
                ))
              ) : (
                <div className="clinic-gallery-empty">
                  <ImageIcon size={28} />
                  <span>Фото по этой поликлинике пока нет</span>
                </div>
              )}
            </div>
          </Card>

          <div className="dashboard-grid">
            <Card className="chart-card">
              <div className="section-heading">
                <h3>Динамика рейтинга</h3>
              </div>
              <div className="chart-wrap">
                <ScoreTrendChart data={data.trends} />
              </div>
            </Card>
            <Card className="chart-card">
              <div className="section-heading">
                <h3>Сравнение блоков</h3>
              </div>
              <div className="chart-wrap">
                <BlockComparisonChart
                  data={data.blockAverages.map((block) => ({
                    block: `Блок ${block.blockId}`,
                    score: block.score
                  }))}
                />
              </div>
            </Card>
          </div>

          <Card className="clinic-history-card">
            <div className="section-heading clinic-history-heading">
              <div>
                <h3>Последние проверки</h3>
                <p>История оценок по выбранной поликлинике</p>
              </div>
              <div className="clinic-history-meta">
                <span>Проверок</span>
                <strong>{data.evaluations.length}</strong>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table clinic-history-table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Оценка</th>
                    <th>Инспектор</th>
                    <th>Критич.</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {data.evaluations.map((evaluation) => (
                    <tr key={evaluation.id} className={data.selectedEvaluation?.id === evaluation.id ? "clinic-history-row-active" : undefined}>
                      <td>{new Date(evaluation.evaluationDate).toLocaleDateString("ru-RU")}</td>
                      <td>
                        <Link
                          href={`/clinics/${data.clinic.id}?evaluationId=${evaluation.id}`}
                          className="inline-link"
                        >
                          {evaluation.totalPercentage}%
                        </Link>
                      </td>
                      <td>{evaluation.user.name ?? evaluation.user.email}</td>
                      <td>{evaluation.criticalCount}</td>
                      <td>
                        <span className={`status-pill ${evaluation.status.className}`}>
                          {evaluation.status.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {data.selectedEvaluation ? (
            <>
              <Card className="clinic-selected-report-card">
                <div className="section-heading clinic-selected-report-heading">
                  <div>
                    <h3>Полный отчет по выбранной проверке</h3>
                    <p>
                      Проверка от{" "}
                      {new Date(data.selectedEvaluation.evaluationDate).toLocaleDateString("ru-RU")} /{" "}
                      {data.selectedEvaluation.user.name ?? data.selectedEvaluation.user.email}
                    </p>
                  </div>
                  <form method="get" className="clinic-evaluation-picker">
                    <select
                      name="evaluationId"
                      defaultValue={data.selectedEvaluation.id}
                      className="input"
                    >
                      {data.evaluations.map((evaluation) => (
                        <option key={evaluation.id} value={evaluation.id}>
                          {new Date(evaluation.evaluationDate).toLocaleDateString("ru-RU")} /{" "}
                          {evaluation.user.name ?? evaluation.user.email} / {evaluation.totalPercentage}%
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="button button-primary">
                      Показать
                    </button>
                  </form>
                </div>
                <div className="clinic-report-kpis">
                  <div className="clinic-score-box">
                    <span>Итог</span>
                    <strong>{data.selectedEvaluation.totalPercentage}%</strong>
                  </div>
                  <div className="clinic-score-box">
                    <span>Критические нарушения</span>
                    <strong>{data.selectedEvaluation.criticalCount}</strong>
                  </div>
                  <div className="clinic-score-box">
                    <span>Фото</span>
                    <strong>{data.selectedEvaluation.photos.length}</strong>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="section-heading">
                  <h3>Математика оценки</h3>
                  <p>Сырой балл, нормализация, вес и вклад каждого блока</p>
                </div>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Блок</th>
                        <th>Сырой балл</th>
                        <th>Диапазон</th>
                        <th>Нормализация</th>
                        <th>Вес</th>
                        <th>Вклад в итог</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.selectedEvaluation.reportBlocks.map((block) => (
                        <tr key={block.blockId}>
                          <td>{block.name}</td>
                          <td>{block.rawScore}</td>
                          <td>
                            {block.min} .. {block.max}
                          </td>
                          <td>{block.normalizedPercent}%</td>
                          <td>{block.weight}</td>
                          <td>{block.contributionPercent} п.п.</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="clinic-report-stack">
                {data.selectedEvaluation.reportBlocks.map((block) => (
                  <details key={block.blockId} className="clinic-report-details">
                    <summary className="clinic-report-summary">
                      <div>
                        <h3>{block.name}</h3>
                        <p>
                          Сырой балл {block.rawScore}, нормализация {block.normalizedPercent}%, вклад{" "}
                          {block.contributionPercent} п.п.
                        </p>
                      </div>
                      <span className="clinic-report-summary-action">Показать детали</span>
                    </summary>
                    <Card className="clinic-report-details-card">
                      <div className="clinic-report-sections">
                        {block.sections.map((section) => (
                          <div key={section.section} className="clinic-report-section">
                            <div className="clinic-report-section-title">{section.section}</div>
                            <div className="clinic-report-criteria">
                              {section.criteria.map((criterion) => (
                                <div key={criterion.id} className="clinic-report-criterion">
                                  <div className="clinic-report-criterion-head">
                                    <div>
                                      <strong>
                                        {criterion.order}. {criterion.text}
                                      </strong>
                                      {criterion.isCritical ? (
                                        <span className="critical-pill">Критично</span>
                                      ) : null}
                                    </div>
                                    <span
                                      className={criterion.totalScore < 0 ? "score-negative" : criterion.totalScore > 0 ? "score-positive" : "score-neutral"}
                                    >
                                      {criterion.totalScore > 0 ? `+${criterion.totalScore}` : criterion.totalScore}
                                    </span>
                                  </div>
                                  <div className="clinic-report-answer-list">
                                    {criterion.answers.length ? (
                                      criterion.answers.map((answer, index) => (
                                        <div key={`${criterion.id}-${index}`} className="clinic-report-answer-item">
                                          <span>{answer.label}</span>
                                          <strong
                                            className={answer.score < 0 ? "score-negative" : answer.score > 0 ? "score-positive" : "score-neutral"}
                                          >
                                            {answer.score > 0 ? `+${answer.score}` : answer.score}
                                          </strong>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="clinic-report-answer-item">
                                        <span>Нет ответа</span>
                                        <strong className="score-neutral">0</strong>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </details>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
