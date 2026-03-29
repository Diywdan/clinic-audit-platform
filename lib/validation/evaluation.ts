import { z } from "zod";

export const evaluationPayloadSchema = z.object({
  clinicId: z.string().min(1),
  answers: z.array(z.object({ criterionId: z.string().min(1), optionId: z.string().min(1) })).min(1),
  photoUrls: z.array(z.string().min(1)).min(3)
});

export const clinicPayloadSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional()
});

export const userPayloadSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).optional().or(z.literal("")),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "MANAGER", "EVALUATOR"])
});
