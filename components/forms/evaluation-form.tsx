"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CriterionOption = {
  id: string;
  label: string;
  score: number;
  group?: string;
  groupLabel?: string;
};

type Criterion = {
  id: string;
  order: number;
  text: string;
  section: string;
  blockId: number;
  type: "single" | "multi";
  isCritical: boolean;
  options: CriterionOption[];
};

type Clinic = {
  id: string;
  name: string;
  address: string;
};

type MultiAnswerState = Record<string, Record<string, string>>;

function getOptionTone(score: number) {
  if (score < 0) return "option-negative";
  if (score > 0) return "option-positive";
  return "option-neutral";
}

export function EvaluationForm({
  clinics,
  criteria,
}: {
  clinics: Clinic[];
  criteria: Criterion[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [singleAnswers, setSingleAnswers] = useState<Record<string, string>>({});
  const [multiAnswers, setMultiAnswers] = useState<MultiAnswerState>({});
  const [clinicId, setClinicId] = useState(clinics[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSubmittedResult, setLastSubmittedResult] = useState<{
    clinicName: string;
    totalPercentage: number;
    uploadedPhotos: number;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const criteriaByBlock = useMemo(
    () =>
      criteria.reduce<Record<number, Record<string, Criterion[]>>>(
        (acc, criterion) => {
          acc[criterion.blockId] ??= {};
          acc[criterion.blockId][criterion.section] ??= [];
          acc[criterion.blockId][criterion.section].push(criterion);
          return acc;
        },
        {}
      ),
    [criteria]
  );

  const answeredCriteriaIds = useMemo(() => {
    return criteria
      .filter((criterion) => {
        if (criterion.type === "single") {
          return Boolean(singleAnswers[criterion.id]);
        }

        const selectedByGroup = multiAnswers[criterion.id] ?? {};
        const groups = Array.from(
          new Set(
            criterion.options
              .map((option) => option.group)
              .filter(Boolean)
          )
        );

        return groups.every((group) => Boolean(selectedByGroup[group!]));
      })
      .map((criterion) => criterion.id);
  }, [criteria, multiAnswers, singleAnswers]);

  const completion = Math.round(
    (answeredCriteriaIds.length / Math.max(criteria.length, 1)) * 100
  );

  const criticalAnswered = useMemo(
    () =>
      criteria.some(
        (criterion) =>
          criterion.isCritical &&
          answeredCriteriaIds.includes(criterion.id)
      ),
    [answeredCriteriaIds, criteria]
  );

  const hasClinicSelected = Boolean(clinicId);
  const hasMinimumCompletion = completion >= 80;
  const hasMinimumPhotos = files.length >= 3;

  const isReadyToSubmit =
    hasClinicSelected &&
    hasMinimumCompletion &&
    criticalAnswered &&
    hasMinimumPhotos;

  const readinessItems = [
    {
      key: "clinic",
      label: "Клиника выбрана",
      hint: hasClinicSelected
        ? "Объект проверки выбран"
        : "Сначала выберите клинику",
      ready: hasClinicSelected,
    },
    {
      key: "completion",
      label: "Заполнено не меньше 80% критериев",
      hint: `Сейчас заполнено ${completion}%`,
      ready: hasMinimumCompletion,
    },
    {
      key: "critical",
      label: "Есть ответ по критическому критерию",
      hint: criticalAnswered
        ? "Критический критерий уже отмечен"
        : "Нужно ответить хотя бы на один критический критерий",
      ready: criticalAnswered,
    },
    {
      key: "photos",
      label: "Загружено минимум 3 фотографии",
      hint: hasMinimumPhotos
        ? `Сейчас загружено ${files.length} фото`
        : `Сейчас загружено ${files.length} из 3 фото`,
      ready: hasMinimumPhotos,
    },
  ];

  const photoPreviewUrls = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );

  function appendFiles(nextFiles: FileList | File[] | null) {
    const incoming = Array.from(nextFiles ?? []);
    if (!incoming.length) return;

    setFiles((current) => [...current, ...incoming].slice(0, 20));
  }

  function openPhotoPicker() {
    fileInputRef.current?.click();
  }

  function getSelectionLabel(score: number) {
    if (score > 0) return "Выполнение";
    if (score < 0) return "Нарушение";
    return "Н/П";
  }

  function buildPayloadAnswers() {
    const answers: Array<{
      criterionId: string;
      optionId: string;
      selectedScore: number;
    }> = [];

    for (const criterion of criteria) {
      const optionsById = new Map(
        criterion.options.map((option) => [option.id, option])
      );

      if (criterion.type === "single") {
        const optionId = singleAnswers[criterion.id];
        if (!optionId) continue;

        const option = optionsById.get(optionId);
        if (!option) continue;

        answers.push({
          criterionId: criterion.id,
          optionId: option.id,
          selectedScore: option.score,
        });

        continue;
      }

      const selectedGroups = multiAnswers[criterion.id] ?? {};

      for (const optionId of Object.values(selectedGroups)) {
        const option = optionsById.get(optionId);
        if (!option) continue;

        answers.push({
          criterionId: criterion.id,
          optionId: option.id,
          selectedScore: option.score,
        });
      }
    }

    return answers;
  }

  async function uploadFiles(currentFiles: File[]) {
    const uploaded: string[] = [];

    for (const file of currentFiles) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Не удалось загрузить фото");
      }

      uploaded.push(payload.url);
    }

    return uploaded;
  }

  function validateBeforeSubmit() {
    if (!clinicId) return "Выберите клинику";

    if (answeredCriteriaIds.length / Math.max(criteria.length, 1) < 0.8) {
      return "Нужно заполнить минимум 80% критериев";
    }

    if (!criticalAnswered) {
      return "Нужно ответить хотя бы на один критический критерий";
    }

    if (files.length < 3) {
      return "Нужно загрузить минимум 3 фотографии";
    }

    return "";
  }

  async function handleSubmit() {
    setError("");
    setSuccess("");

    const validationError = validateBeforeSubmit();
    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      try {
        const answers = buildPayloadAnswers();
        const currentClinic = clinics.find((clinic) => clinic.id === clinicId);
        const uploadedPhotoCount = files.length;
        const photoUrls = await uploadFiles(files);

        const response = await fetch("/api/evaluations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinicId,
            notes,
            photoUrls,
            answers,
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload.error ?? "Не удалось отправить проверку");
          return;
        }

        setSuccess(
          `Проверка отправлена. Итоговый балл: ${payload.totalPercentage}%`
        );

        setLastSubmittedResult({
          clinicName: currentClinic?.name ?? "Выбранная клиника",
          totalPercentage: payload.totalPercentage,
          uploadedPhotos: uploadedPhotoCount,
        });

        setSingleAnswers({});
        setMultiAnswers({});
        setNotes("");
        setFiles([]);

        router.refresh();
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Непредвиденная ошибка отправки"
        );
      }
    });
  }

  return (
    <div className="audit-layout">
      <Card className="audit-sticky-card">
        <div className="audit-topbar">
          <div>
            <div className="audit-title">Оценка объекта</div>
            <div className="audit-subtitle">
              Проверка по утверждённой матрице критериев
            </div>
          </div>

          <div className="audit-topbar-actions">
            <label className="field audit-clinic-field">
              <span>Клиника</span>
              <Select
                value={clinicId}
                onChange={(event) => setClinicId(event.target.value)}
              >
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </option>
                ))}
              </Select>
            </label>

            <div className="audit-progress-meta">
              <span>
                Пройдено: {answeredCriteriaIds.length} / {criteria.length}
              </span>
              <strong>{completion}%</strong>
            </div>
          </div>
        </div>

        <div className="progress-rail">
          <div
            className="progress-fill"
            style={{ width: `${completion}%` }}
          />
        </div>

        <div className="audit-summary-row">
          <div className="audit-summary-box">
            <span>Критические</span>
            <strong>{criticalAnswered ? "Да" : "Нет"}</strong>
          </div>

          <div className="audit-summary-box">
            <span>Фото</span>
            <strong>{files.length} / 3</strong>
          </div>
        </div>
      </Card>

      <Card className="audit-form-mobile-note audit-mobile-note-card">
        <div>
          <p className="eyebrow">Работа в поле</p>
          <h3>Форму можно проходить быстрее даже с телефона.</h3>
          <p>
            Используйте переходы по разделам, отвечайте последовательно и
            добавляйте фото прямо из карточек критериев.
          </p>
        </div>

        <div className="audit-mobile-note-list">
          <div className="audit-mobile-note-item">
            <div className="audit-mobile-note-dot" />
            <div>
              <strong>Переходите по разделам</strong>
              <p>
                В каждом блоке ниже есть быстрые ссылки на нужный раздел.
              </p>
            </div>
          </div>

          <div className="audit-mobile-note-item">
            <div className="audit-mobile-note-dot" />
            <div>
              <strong>Добавляйте фото по ходу проверки</strong>
              <p>
                Не нужно ждать финала — фото можно прикладывать прямо из
                карточек вопросов.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {Object.entries(criteriaByBlock).map(([blockId, sections]) => (
        <Card key={blockId} className="audit-block-card">
          <div className="audit-block-heading">
            <h3>Блок {blockId}</h3>
            <p>Выберите вариант ответа по каждому критерию</p>

            <div className="audit-block-nav">
              {Object.keys(sections).map((section) => {
                const sectionId = `block-${blockId}-${section}`
                  .toLowerCase()
                  .replace(/[^a-z0-9а-яё]+/gi, "-")
                  .replace(/^-+|-+$/g, "");

                return (
                  <a
                    key={section}
                    href={`#${sectionId}`}
                    className="audit-block-jump"
                  >
                    {section}
                  </a>
                );
              })}
            </div>

            <p className="audit-mobile-tip">
              На телефоне используйте кнопки разделов выше, чтобы быстрее
              переходить по длинной форме.
            </p>
          </div>

          {Object.entries(sections).map(([section, sectionCriteria]) => {
            const sectionId = `block-${blockId}-${section}`
              .toLowerCase()
              .replace(/[^a-z0-9а-яё]+/gi, "-")
              .replace(/^-+|-+$/g, "");

            return (
              <section key={section} className="audit-section" id={sectionId}>
                <div className="audit-section-title">{section}</div>

                <div className="audit-question-list">
                  {sectionCriteria.map((criterion) => {
                    const isCompactCard = criterion.options.length >= 3;

                    if (criterion.type === "multi") {
                      const groupedOptions = criterion.options.reduce<
                        Record<string, CriterionOption[]>
                      >((acc, option) => {
                        const key = option.group ?? option.id;
                        acc[key] ??= [];
                        acc[key].push(option);
                        return acc;
                      }, {});

                      return (
                        <div
                          key={criterion.id}
                          className={cn(
                            "audit-question-card",
                            isCompactCard && "audit-question-card-compact"
                          )}
                        >
                          <div className="audit-question-meta">
                            <span>Критерий {criterion.order}</span>
                            {criterion.isCritical ? (
                              <span className="critical-pill">Критично</span>
                            ) : null}
                          </div>

                          <h4>{criterion.text}</h4>

                          <div className="audit-group-stack">
                            {Object.entries(groupedOptions).map(
                              ([groupId, options]) => (
                                <div
                                  key={groupId}
                                  className="audit-option-group"
                                >
                                  <div className="audit-group-label">
                                    {options[0]?.groupLabel}
                                  </div>

                                  <div className="audit-option-grid audit-option-grid-two">
                                    {options.map((option) => (
                                      <button
                                        key={option.id}
                                        type="button"
                                        className={cn(
                                          "audit-option-tile",
                                          getOptionTone(option.score),
                                          multiAnswers[criterion.id]?.[
                                            groupId
                                          ] === option.id &&
                                            "audit-option-active"
                                        )}
                                        onClick={() =>
                                          setMultiAnswers((current) => ({
                                            ...current,
                                            [criterion.id]: {
                                              ...(current[criterion.id] ?? {}),
                                              [groupId]: option.id,
                                            },
                                          }))
                                        }
                                      >
                                        <span className="audit-option-icon">
                                          {option.score > 0
                                            ? "✓"
                                            : option.score < 0
                                            ? "!"
                                            : "○"}
                                        </span>
                                        <span className="audit-option-caption">
                                          {getSelectionLabel(option.score)}
                                        </span>
                                        <strong>{option.label}</strong>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          <div className="audit-question-footer">
                            <button
                              type="button"
                              className="audit-inline-upload"
                              onClick={openPhotoPicker}
                            >
                              Добавить фото
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={criterion.id}
                        className={cn(
                          "audit-question-card",
                          isCompactCard && "audit-question-card-compact"
                        )}
                      >
                        <div className="audit-question-meta">
                          <span>Критерий {criterion.order}</span>
                          {criterion.isCritical ? (
                            <span className="critical-pill">Критично</span>
                          ) : null}
                        </div>

                        <h4>{criterion.text}</h4>

                        <div
                          className={cn(
                            "audit-option-grid",
                            criterion.options.length === 3 &&
                              "audit-option-grid-three"
                          )}
                        >
                          {criterion.options.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              className={cn(
                                "audit-option-tile",
                                getOptionTone(option.score),
                                singleAnswers[criterion.id] === option.id &&
                                  "audit-option-active"
                              )}
                              onClick={() =>
                                setSingleAnswers((current) => ({
                                  ...current,
                                  [criterion.id]: option.id,
                                }))
                              }
                            >
                              <span className="audit-option-icon">
                                {option.score > 0
                                  ? "✓"
                                  : option.score < 0
                                  ? "!"
                                  : "○"}
                              </span>
                              <span className="audit-option-caption">
                                {getSelectionLabel(option.score)}
                              </span>
                              <strong>{option.label}</strong>
                            </button>
                          ))}
                        </div>

                        <div className="audit-question-footer">
                          <button
                            type="button"
                            className="audit-inline-upload"
                            onClick={openPhotoPicker}
                          >
                            Добавить фото
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </Card>
      ))}

      <Card className="audit-readiness-card">
        <div className="section-heading audit-readiness-heading">
          <div>
            <h3>Готовность к отправке</h3>
            <p>
              Перед завершением проверки убедитесь, что обязательные условия
              выполнены
            </p>
          </div>

          <div
            className={`audit-readiness-badge ${
              isReadyToSubmit ? "audit-ready" : "audit-not-ready"
            }`}
          >
            {isReadyToSubmit ? "Можно отправлять" : "Пока не готово"}
          </div>
        </div>

        <div className="audit-readiness-list">
          {readinessItems.map((item) => (
            <div key={item.key} className="audit-readiness-item">
              <div
                className={`audit-readiness-icon ${
                  item.ready ? "audit-ready" : "audit-not-ready"
                }`}
              >
                {item.ready ? "✓" : "!"}
              </div>
              <div>
                <strong>{item.label}</strong>
                <p>{item.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="audit-media-card">
        <div className="section-heading">
          <div>
            <h3>Фотоматериалы и комментарий</h3>
            <p>Для отправки проверки требуется минимум 3 фотографии</p>
          </div>
        </div>

        <div className="stack-md">
          <label className="audit-upload-box">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => appendFiles(event.target.files)}
            />
            <span>Загрузить фотографии</span>
            <small>До 20 файлов, суммарно до 20 МБ</small>
          </label>

          {photoPreviewUrls.length ? (
            <div className="audit-photo-strip">
              {photoPreviewUrls.map(({ file, url }) => (
                <div
                  key={`${file.name}-${file.lastModified}`}
                  className="audit-photo-thumb"
                >
                  <img src={url} alt={file.name} />
                </div>
              ))}
            </div>
          ) : null}

          <label className="field">
            <span>Комментарий</span>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Зафиксируйте наблюдения, риски и дополнительные замечания"
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p className="success-text">{success}</p> : null}
        </div>
      </Card>

      {lastSubmittedResult ? (
        <Card className="audit-success-card">
          <div className="audit-success-head">
            <div>
              <p className="eyebrow">Проверка отправлена</p>
              <h3>{lastSubmittedResult.clinicName}</h3>
              <p className="audit-success-text">
                Проверка успешно сохранена в системе. Можете начать следующую
                оценку или проверить историю отправок выше.
              </p>
            </div>

            <div className="audit-success-score">
              <span>Итоговый балл</span>
              <strong>{lastSubmittedResult.totalPercentage}%</strong>
            </div>
          </div>

          <div className="audit-success-grid">
            <div className="audit-success-box">
              <span>Фото в отправке</span>
              <strong>{lastSubmittedResult.uploadedPhotos}</strong>
            </div>

            <div className="audit-success-box">
              <span>Следующий шаг</span>
              <strong>Новая проверка</strong>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="audit-submit-bar">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="audit-hidden-input"
          onChange={(event) => appendFiles(event.target.files)}
        />

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="audit-submit-button"
        >
          {isPending ? "Отправка..." : "Завершить проверку"}
        </Button>
      </div>
    </div>
  );
}