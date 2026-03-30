import Image from "next/image";
import { Camera, CheckCircle2, ClipboardList, Sparkles } from "lucide-react";

import { EvaluationForm } from "@/components/forms/evaluation-form";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { requireEvaluatorAccess } from "@/lib/auth/session";
import {
  getEvaluationFormData,
  getEvaluatorSubmissions,
} from "@/lib/services/queries";

export default async function EvaluationsPage() {
  const session = await requireEvaluatorAccess();

  const [{ clinics, criteria }, submissions] = await Promise.all([
    getEvaluationFormData(),
    getEvaluatorSubmissions(session.user.id),
  ]);

  const totalPhotos = submissions.reduce(
    (sum, submission) => sum + submission.photos.length,
    0
  );

  const averageScore = submissions.length
    ? Math.round(
        submissions.reduce(
          (sum, submission) => sum + submission.totalPercentage,
          0
        ) / submissions.length
      )
    : 0;

  return (
    <AppShell
      title="Рабочее место проверки"
      subtitle="Быстрый запуск аудита, контроль отправок и вся рабочая форма в одном экране"
      role={session.user.role}
    >
      <Card className="evaluator-hero-card">
        <div className="evaluator-hero-head">
          <div>
            <p className="eyebrow">Первый экран оценщика</p>
            <h3>
              Начните новую проверку и держите текущий поток под контролем.
            </h3>
            <p className="evaluator-hero-text">
              Выберите клинику, пройдите критерии по блокам 
              и приложите фотографии. Всё нужное для проверки 
              собрано на одной странице.
              
            </p>
          </div>

          <div className="evaluator-hero-badge">
            <Sparkles size={16} />
            <span>Готово к выездной проверке</span>
          </div>
        </div>

        <div className="evaluator-quickstart-grid">
          <div className="evaluator-quickstart-card">
            <span className="evaluator-quickstart-step">Шаг 1</span>
            <strong>Выберите клинику</strong>
            <p>Сначала выберите объект проверки.</p>
          </div>

          <div className="evaluator-quickstart-card">
            <span className="evaluator-quickstart-step">Шаг 2</span>
            <strong>Пройдите критерии по блокам</strong>
            <p>
              Отвечайте по блокам и не пропускайте критические пункты.
            </p>
          </div>

          <div className="evaluator-quickstart-card">
            <span className="evaluator-quickstart-step">Шаг 3</span>
            <strong>Приложите фото и отправьте</strong>
            <p>
              Добавьте минимум 3 фото и комментарий — после этого проверку можно отправить.
            </p>
          </div>
        </div>

        <div className="evaluator-kpi-grid">
          <div className="evaluator-kpi-box">
            <div className="evaluator-kpi-icon evaluator-kpi-icon-primary">
              <ClipboardList size={18} />
            </div>
            <span>Последние отправки</span>
            <strong>{submissions.length}</strong>
            <small>Последние 12 проверок этого оценщика</small>
          </div>

          <div className="evaluator-kpi-box">
            <div className="evaluator-kpi-icon evaluator-kpi-icon-success">
              <CheckCircle2 size={18} />
            </div>
            <span>Средний результат</span>
            <strong>{averageScore}%</strong>
            <small>По последним проверкам</small>
          </div>

          <div className="evaluator-kpi-box">
            <div className="evaluator-kpi-icon evaluator-kpi-icon-accent">
              <Camera size={18} />
            </div>
            <span>Загружено фото</span>
            <strong>{totalPhotos}</strong>
            <small>Во всех недавних отправках</small>
          </div>
        </div>
      </Card>

      <Card className="evaluator-focus-card">
        <div className="evaluator-focus-grid">
          <div>
            <p className="eyebrow">Главное действие</p>
            <h3>Новая проверка начинается сразу на этой странице.</h3>
            <p className="evaluator-hero-text">
              Не нужно переходить в отдельный мастер. Выберите клинику,
              ответьте на критерии, загрузите фотографии и отправьте результат в
              одном рабочем потоке.
            </p>
          </div>

          <div className="evaluator-focus-checklist">
            <div className="evaluator-focus-item">
              <strong>Что обязательно перед отправкой</strong>
              <p>
                Минимум 80% критериев, хотя бы один критический критерий и
                минимум 3 фото.
              </p>
            </div>

            <div className="evaluator-focus-item">
              <strong>Что увидите после отправки</strong>
              <p>
                Итоговый балл, обновлённый список последних проверок и
                фотографии в истории отправок.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <EvaluationForm clinics={clinics} criteria={criteria} />

      <Card className="evaluator-history-card">
        <div className="section-heading evaluator-history-heading">
          <div>
            <h3>Последние отправки</h3>
            <p>
              Ваши последние проверки с итоговым баллом и приложенными
              фотографиями
            </p>
          </div>

          <div className="evaluator-history-meta">
            <span>История проверок</span>
            <strong>{submissions.length}</strong>
          </div>
        </div>

        <div className="stack-md">
          {submissions.length ? (
            submissions.map((submission) => (
              <div
                key={submission.id}
                className="evaluator-submission-card"
              >
                <div className="section-heading evaluator-submission-head">
                  <div>
                    <h3>{submission.clinic.name}</h3>
                    <p>{new Date(submission.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="evaluator-submission-side">
                    <div className="metric-box">
                      <span>Итоговый балл</span>
                      <strong>{submission.totalPercentage}%</strong>
                    </div>

                    <div className="evaluator-submission-badge">
                      <span>{submission.photos.length} фото</span>
                    </div>
                  </div>
                </div>

                {submission.photos.length ? (
                  <div className="photo-grid">
                    {submission.photos.map((photo) => (
                      <Image
                        key={photo.id}
                        src={photo.url}
                        alt="Фото проверки"
                        width={160}
                        height={120}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="clinic-photo-empty">
                    В этой отправке нет фотографий
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="clinic-empty-state">
              <h3>Пока нет отправленных проверок</h3>
              <p>
                Начните первую оценку ниже — она сразу появится в этом списке.
              </p>
            </div>
          )}
        </div>
      </Card>
    </AppShell>
  );
}