import Link from "next/link";
import { AlertTriangle, Building2, Camera, ShieldAlert, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireDashboardAccess } from "@/lib/auth/session";
import { getClinicsOverview } from "@/lib/services/queries";

export default async function ClinicsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireDashboardAccess();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const sort = typeof params.sort === "string" ? params.sort : "score";
  const clinics = await getClinicsOverview();

  const normalizedQuery = query.toLowerCase();
  const filteredClinics = clinics
    .filter((clinic) => {
      const matchesQuery =
        !normalizedQuery ||
        clinic.name.toLowerCase().includes(normalizedQuery) ||
        clinic.address.toLowerCase().includes(normalizedQuery);
      const matchesStatus = status === "all" || clinic.status.label === status;
      return matchesQuery && matchesStatus;
    })
    .sort((left, right) => {
      if (sort === "name") return left.name.localeCompare(right.name, "ru");
      if (sort === "trend") return right.trend - left.trend;
      if (sort === "evaluations") return right.evaluationsCount - left.evaluationsCount;
      return right.averageScore - left.averageScore;
    });

  const averageNetworkScore = filteredClinics.length
    ? Math.round(filteredClinics.reduce((sum, clinic) => sum + clinic.averageScore, 0) / filteredClinics.length)
    : 0;
  const criticalClinics = filteredClinics.filter((clinic) => clinic.criticalViolations > 0).length;
  const riskClinics = filteredClinics.filter((clinic) => clinic.averageScore < 50).length;
  const totalPhotos = filteredClinics.reduce((sum, clinic) => sum + clinic.photos.length, 0);

  return (
    <AppShell
      title="Поликлиники"
      subtitle="Сводка по объектам, статусам, фотографиям и динамике оценок"
      role={session.user.role}
    >
      <Card className="clinic-list-hero">
        <div className="clinic-list-hero-head">
          <div>
            <h3>Поликлиники сети</h3>
          </div>
          <div className="clinic-list-hero-meta">
            <span>Объектов в выборке</span>
            <strong>{filteredClinics.length}</strong>
          </div>
        </div>
        <div className="clinic-list-kpi-grid">
          <div className="clinic-list-kpi-box">
            <div className="clinic-list-kpi-icon clinic-list-kpi-icon-primary">
              <Building2 size={18} />
            </div>
            <span>Средний балл сети</span>
            <strong>{averageNetworkScore}%</strong>
            <small>По текущей выборке объектов</small>
          </div>
          <div className="clinic-list-kpi-box clinic-list-kpi-box-warning">
            <div className="clinic-list-kpi-icon clinic-list-kpi-icon-warning">
              <ShieldAlert size={18} />
            </div>
            <span>Критические нарушения</span>
            <strong>{criticalClinics}</strong>
            <small>Поликлиник с критическими флагами</small>
          </div>
          <div className="clinic-list-kpi-box clinic-list-kpi-box-danger">
            <div className="clinic-list-kpi-icon clinic-list-kpi-icon-danger">
              <AlertTriangle size={18} />
            </div>
            <span>Красная зона</span>
            <strong>{riskClinics}</strong>
            <small>Объектов с баллом ниже 50%</small>
          </div>
          <div className="clinic-list-kpi-box">
            <div className="clinic-list-kpi-icon clinic-list-kpi-icon-neutral">
              <Camera size={18} />
            </div>
            <span>Фотоматериалы</span>
            <strong>{totalPhotos}</strong>
            <small>Фото в текущем списке объектов</small>
          </div>
        </div>
      </Card>

      <Card className="clinic-filter-card">
        <form className="clinic-filter-bar">
          <Input name="q" defaultValue={query} placeholder="Поиск по названию или адресу..." />
          <Select name="status" defaultValue={status}>
            <option value="all">Все статусы</option>
            <option value="Высокий">Высокий</option>
            <option value="Средний">Средний</option>
            <option value="Критический">Критический</option>
          </Select>
          <Select name="sort" defaultValue={sort}>
            <option value="score">По рейтингу</option>
            <option value="name">По названию</option>
            <option value="trend">По тренду</option>
            <option value="evaluations">По числу проверок</option>
          </Select>
          <Button type="submit">Применить</Button>
          <Link href="/clinics">
            <Button type="button" variant="ghost">Сбросить</Button>
          </Link>
        </form>
      </Card>

      <div className="clinic-list-meta clinic-list-meta-strong">
        <span>Найдено объектов: {filteredClinics.length}</span>
      </div>

      {filteredClinics.length ? (
        <div className="clinic-grid">
          {filteredClinics.map((clinic) => (
          <Link key={clinic.id} href={`/clinics/${clinic.id}`} className="clinic-card-link">
            <Card className="clinic-card">
              <div className="clinic-card-header">
                <div>
                  <h3>{clinic.name}</h3>
                  <p>{clinic.address}</p>
                </div>
                <span className={`status-pill ${clinic.status.className}`}>{clinic.status.label}</span>
              </div>
              <div className="clinic-score-row">
                <div className="clinic-score-box">
                  <span>Средний рейтинг</span>
                  <strong>{clinic.averageScore}%</strong>
                </div>
                <div className="clinic-score-box">
                  <span>Проверки</span>
                  <strong>{clinic.evaluationsCount}</strong>
                </div>
                <div className="clinic-score-box">
                  <span>Тренд</span>
                  <strong>{clinic.trend > 0 ? `+${clinic.trend}` : clinic.trend}%</strong>
                </div>
              </div>
              <div className="clinic-bars">
                {clinic.blockScores.map((block) => (
                  <div key={block.blockId} className="clinic-bar-item">
                    <div className="clinic-bar-meta">
                      <span>Блок {block.blockId}</span>
                      <strong>{block.score}%</strong>
                    </div>
                    <div className="clinic-bar-track">
                      <div className="clinic-bar-fill" style={{ width: `${block.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="clinic-photo-row clinic-photo-row-compact">
                {clinic.photos.length ? (
                  <>
                    <img src={clinic.photos[0].url} alt="Фото поликлиники" className="clinic-photo-thumb clinic-photo-thumb-primary" />
                    <div className="clinic-photo-stack">
                      {clinic.photos.slice(1, 3).map((photo) => (
                        <img key={photo.id} src={photo.url} alt="Фото поликлиники" className="clinic-photo-thumb clinic-photo-thumb-secondary" />
                      ))}
                      <div className="clinic-photo-counter">Фото: {clinic.photos.length}</div>
                    </div>
                  </>
                ) : (
                  <div className="clinic-photo-empty">Фото пока не загружены</div>
                )}
              </div>
            </Card>
          </Link>
          ))}
        </div>
      ) : (
        <Card className="clinic-empty-state">
          <h3>Ничего не найдено</h3>
          <p>Попробуйте изменить строку поиска или сбросить фильтры.</p>
        </Card>
      )}
    </AppShell>
  );
}
