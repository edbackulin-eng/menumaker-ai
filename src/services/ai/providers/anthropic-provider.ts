import "server-only";
import Anthropic, { APIError } from "@anthropic-ai/sdk";
import { z, type ZodType } from "zod";

import { aiEnv } from "@/config/env.ai";
import { AIOutputValidationError, AIProviderError } from "@/lib/errors";
import type {
  AICompleteParams,
  AICompleteResult,
  AICompleteStructuredParams,
  AICompleteStructuredResult,
  AIProvider,
  AIUsage,
} from "@/services/ai/types";

/**
 * Pinned dated snapshot, not the dateless alias (`claude-haiku-4-5`) —
 * confirmed against Anthropic's models doc (platform.claude.com/docs/en/
 * about-claude/models/overview) at the time this stage was built. A pinned
 * ID means behavior can't silently shift under this app; upgrading model
 * generation is a deliberate one-line change here, matching the PO's
 * explicit "budget model now, upgrade later is a conscious decision" brief.
 */
const MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_MAX_TOKENS = 1024;

const JSON_ONLY_INSTRUCTION =
  "\n\nВідповідай ЛИШЕ JSON-об'єктом, без пояснень, без markdown-розмітки, без ```.";

export class AnthropicProvider implements AIProvider {
  private readonly client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: aiEnv.ANTHROPIC_API_KEY });
  }

  async complete({
    system,
    prompt,
    maxTokens,
    temperature,
  }: AICompleteParams): Promise<AICompleteResult> {
    const message = await this.send(system, prompt, maxTokens ?? DEFAULT_MAX_TOKENS, temperature);
    return { text: extractText(message), usage: toUsage(message.usage) };
  }

  /**
   * Structured JSON output via the assistant-prefill trick (prefilling the
   * assistant turn with "{" forces the completion to continue a JSON object
   * — documented by Anthropic, no tool-use/extra schema-conversion
   * dependency needed). One retry with a clarified prompt on invalid
   * JSON/schema mismatch; a second failure surfaces as
   * AIOutputValidationError rather than silently returning bad data.
   */
  async completeStructured<T>({
    system,
    prompt,
    schema,
    maxTokens,
    temperature,
    schemaName,
  }: AICompleteStructuredParams<T>): Promise<AICompleteStructuredResult<T>> {
    const jsonSystem = `${system}${JSON_ONLY_INSTRUCTION}`;
    const resolvedMaxTokens = maxTokens ?? DEFAULT_MAX_TOKENS;

    const first = await this.attemptStructured(
      jsonSystem,
      prompt,
      schema,
      resolvedMaxTokens,
      temperature,
    );
    if (first.ok) {
      return { data: first.data, usage: first.usage };
    }

    const clarifiedPrompt = `${prompt}\n\nПопередня відповідь не відповідала очікуваній JSON-структурі${schemaName ? ` (${schemaName})` : ""}: ${first.issue}. Виправ і поверни ЛИШЕ коректний JSON.`;
    const second = await this.attemptStructured(
      jsonSystem,
      clarifiedPrompt,
      schema,
      resolvedMaxTokens,
      temperature,
    );
    if (second.ok) {
      return { data: second.data, usage: second.usage };
    }

    throw new AIOutputValidationError(second.issue);
  }

  private async attemptStructured<T>(
    system: string,
    prompt: string,
    schema: ZodType<T>,
    maxTokens: number,
    temperature: number | undefined,
  ): Promise<{ ok: true; data: T; usage: AIUsage } | { ok: false; issue: string; usage: AIUsage }> {
    const message = await this.send(system, prompt, maxTokens, temperature, true);
    const usage = toUsage(message.usage);

    // The prefilled "{" is part of our request, not the response — Anthropic
    // only returns the continuation, so it must be re-attached before parsing.
    const raw = `{${extractText(message)}`;

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      return { ok: false, issue: "відповідь не є валідним JSON", usage };
    }

    const result = schema.safeParse(parsedJson);
    if (!result.success) {
      return { ok: false, issue: z.prettifyError(result.error), usage };
    }
    return { ok: true, data: result.data, usage };
  }

  private async send(
    system: string,
    prompt: string,
    maxTokens: number,
    temperature: number | undefined,
    prefillJson = false,
  ) {
    try {
      return await this.client.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        ...(temperature !== undefined ? { temperature } : {}),
        messages: prefillJson
          ? [
              { role: "user", content: prompt },
              { role: "assistant", content: "{" },
            ]
          : [{ role: "user", content: prompt }],
      });
    } catch (error) {
      throw toProviderError(error);
    }
  }
}

function extractText(message: Anthropic.Message): string {
  const block = message.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  if (!block) {
    throw new AIProviderError("AI-провайдер повернув відповідь без тексту.");
  }
  return block.text;
}

function toUsage(usage: Anthropic.Usage): AIUsage {
  return { inputTokens: usage.input_tokens, outputTokens: usage.output_tokens };
}

function toProviderError(error: unknown): AIProviderError {
  if (error instanceof APIError) {
    if (error.status === 429) {
      return new AIProviderError("AI-провайдер тимчасово перевантажений. Спробуйте пізніше.", true);
    }
    if (error.status !== undefined && error.status >= 500) {
      return new AIProviderError("AI-провайдер тимчасово недоступний.", true);
    }
    return new AIProviderError(`Помилка AI-провайдера: ${error.message}`);
  }
  return new AIProviderError("Не вдалося зв'язатися з AI-провайдером.", true);
}
