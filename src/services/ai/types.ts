import type { ZodType } from "zod";

export interface AIUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface AICompleteParams {
  system: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AICompleteResult {
  text: string;
  usage: AIUsage;
}

export interface AICompleteStructuredParams<T> extends AICompleteParams {
  schema: ZodType<T>;
  /** Only used to make the retry's clarification message more specific — not sent on the first attempt. */
  schemaName?: string;
}

export interface AICompleteStructuredResult<T> {
  data: T;
  usage: AIUsage;
}

/**
 * Provider-agnostic contract every AI function (src/services/ai/functions/)
 * is written against. Swapping providers — or adding a second one — means
 * implementing this interface and wiring it into provider-factory.ts; no
 * call site elsewhere in the codebase changes.
 */
export interface AIProvider {
  /** Plain-text completion (no JSON contract). */
  complete(params: AICompleteParams): Promise<AICompleteResult>;

  /**
   * JSON completion validated against `schema`. Implementations own their
   * own retry-on-invalid-output strategy (see docs/ai-service.md) — callers
   * get back either valid `data` or a thrown AIOutputValidationError.
   */
  completeStructured<T>(
    params: AICompleteStructuredParams<T>,
  ): Promise<AICompleteStructuredResult<T>>;
}
