import { z } from "zod";

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; issues: string[] };

export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return {
    ok: false,
    issues: result.error.issues.map((i) => `${i.path.join(".")} - ${i.message}`),
  };
}
