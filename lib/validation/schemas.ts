import { z } from "zod";

export const clinicSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180)
});

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "MANAGER", "EVALUATOR"])
});

export const evaluationAnswerSchema = z.object({
  criterionId: z.string(),
  optionId: z.string().min(1, "Укажите выбранный вариант ответа"),
  selectedScore: z.coerce.number().int().min(-2).max(2)
});

export const evaluationSchema = z.object({
  clinicId: z.string().min(1, "Выберите клинику"),
  answers: z.array(evaluationAnswerSchema).min(1, "Добавьте ответы по критериям"),
  photoUrls: z.array(z.string()).min(3, "Нужно загрузить минимум 3 фотографии"),
  notes: z.string().optional().default("")
});
