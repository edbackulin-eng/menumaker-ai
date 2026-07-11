import "server-only";
import type { NextRequest } from "next/server";
import type { ZodType } from "zod";

import { ApiError, ValidationError } from "@/lib/errors";

/** Parses and validates the JSON body against `schema`. Throws before any business logic runs. */
export async function validateBody<T>(request: NextRequest, schema: ZodType<T>): Promise<T> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw new ApiError(400, "invalid_json", "Тіло запиту має бути валідним JSON.");
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ValidationError(parsed.error);
  }
  return parsed.data;
}

/** Parses and validates URL search params against `schema`. */
export function validateQuery<T>(request: NextRequest, schema: ZodType<T>): T {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    throw new ValidationError(parsed.error);
  }
  return parsed.data;
}

/** Validates dynamic route params (e.g. the resolved `{ id }` from `params`). */
export function validateParams<T>(params: Record<string, string>, schema: ZodType<T>): T {
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    throw new ValidationError(parsed.error);
  }
  return parsed.data;
}
