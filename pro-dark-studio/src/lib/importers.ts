import { ZodSchema } from "zod";
import { safeParse, ValidationResult } from "@/schema/validate";

export async function importJsonFile<T>(
  file: File,
  schema: ZodSchema<T>,
  migrate: (x: any) => any
): Promise<ValidationResult<T>> {
  const text = await file.text();
  let raw: any;
  try {
    raw = JSON.parse(text);
  } catch (e: any) {
    return { ok: false, issues: [`JSON Parse error: ${e.message}`] };
  }
  const migrated = migrate(raw);
  const result = safeParse<T>(schema, migrated);
  return result;
}
