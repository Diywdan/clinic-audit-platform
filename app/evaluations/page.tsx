import Image from "next/image";

import { EvaluationForm } from "@/components/forms/evaluation-form";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { requireEvaluatorAccess } from "@/lib/auth/session";
import { getEvaluationFormData, getEvaluatorSubmissions } from "@/lib/services/queries";

export default async function EvaluationsPage() {
  const session = await requireEvaluatorAccess();
  const [{ clinics, criteria }, submissions] = await Promise.all([
    getEvaluationFormData(),
    getEvaluatorSubmissions(session.user.id)
  ]);

  return (
    <AppShell
      title="Рабочее место проверки"
      subtitle="Мобильная форма аудита с обязательными фото и контролем прогресса"
      role={session.user.role}
    >
      <EvaluationForm clinics={clinics} criteria={criteria} />
      <Card>
        <div className="section-heading">
          <h3>Последние отправки</h3>
          <p>Доступны текущему оценщику</p>
        </div>
        <div className="stack-md">
          {submissions.map((submission) => (
            <div key={submission.id} className="card" style={{ padding: 18 }}>
              <div className="section-heading">
                <div>
                  <h3>{submission.clinic.name}</h3>
                  <p>{new Date(submission.createdAt).toLocaleString()}</p>
                </div>
                <div className="metric-box">
                  <span>Балл</span>
                  <strong>{submission.totalPercentage}%</strong>
                </div>
              </div>
              <div className="photo-grid">
                {submission.photos.map((photo) => (
                  <Image key={photo.id} src={photo.url} alt="Фото проверки" width={160} height={120} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
