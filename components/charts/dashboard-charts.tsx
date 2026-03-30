"use client";

import { Card } from "@/components/ui/card";
import { BlockComparisonChart } from "@/components/charts/block-comparison-chart";
import { ScoreTrendChart } from "@/components/charts/score-trend-chart";

type DashboardChartsProps = {
  trends: Array<{
    date: string;
    clinicName?: string;
    totalScore?: number;
    score?: number;
  }>;
  blockComparison: Array<{
    block: string;
    score: number;
  }>;
};

export function DashboardCharts({
  trends,
  blockComparison,
}: DashboardChartsProps) {
  return (
    <div className="manager-chart-section">
      <div className="section-heading manager-chart-heading">
        <div>
          <h3>Графики</h3>
        </div>
      </div>

      <div className="dashboard-grid manager-dashboard-grid">
        <Card className="chart-card manager-chart-card">
          <div className="section-heading">
            <div>
              <h3>Динамика рейтинга</h3>
            </div>
            <span className="manager-chart-chip">Тренд во времени</span>
          </div>

          <div className="chart-wrap">
            <ScoreTrendChart
              data={trends.map((item) => ({
                date: item.date,
                clinicName: item.clinicName ?? "Все клиники",
                totalScore: item.totalScore ?? item.score ?? 0,
              }))}
            />
          </div>
        </Card>

        <Card className="chart-card manager-chart-card">
          <div className="section-heading">
            <div>
              <h3>Сравнение блоков</h3>
            </div>
            <span className="manager-chart-chip">Где просадка сильнее</span>
          </div>

          <div className="chart-wrap">
            <BlockComparisonChart data={blockComparison} />
          </div>
        </Card>
      </div>
    </div>
  );
}