"use client";

import { Card } from "@/components/ui/card";
import { BlockComparisonChart } from "@/components/charts/block-comparison-chart";
import { ScoreTrendChart } from "@/components/charts/score-trend-chart";

type DashboardChartsProps = {
  trends: Array<{ date: string; clinicName?: string; totalScore?: number; score?: number }>;
  blockComparison: Array<{ block: string; score: number }>;
};

export function DashboardCharts({ trends, blockComparison }: DashboardChartsProps) {
  return (
    <div className="dashboard-grid">
      <Card className="chart-card">
        <div className="section-heading">
          <h3>Динамика рейтинга</h3>
          <p>Итоговый взвешенный балл по отфильтрованным проверкам</p>
        </div>
        <div className="chart-wrap">
          <ScoreTrendChart
            data={trends.map((item) => ({
              date: item.date,
              clinicName: item.clinicName ?? "Все клиники",
              totalScore: item.totalScore ?? item.score ?? 0
            }))}
          />
        </div>
      </Card>
      <Card className="chart-card">
        <div className="section-heading">
          <h3>Сравнение блоков</h3>
          <p>Средний балл по блокам для текущего набора фильтров</p>
        </div>
        <div className="chart-wrap">
          <BlockComparisonChart data={blockComparison} />
        </div>
      </Card>
    </div>
  );
}
