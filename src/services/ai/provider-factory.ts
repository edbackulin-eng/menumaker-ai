import "server-only";

import { aiEnv } from "@/config/env.ai";
import { AnthropicProvider } from "@/services/ai/providers/anthropic-provider";
import type { AIProvider } from "@/services/ai/types";

let instance: AIProvider | undefined;

/**
 * Single point that maps AI_PROVIDER -> concrete AIProvider. Every AI
 * function (src/services/ai/functions/) calls this instead of constructing
 * a provider directly — adding a second provider means adding one more
 * `case` here, nothing else in the codebase changes.
 */
export function getAIProvider(): AIProvider {
  if (!instance) {
    switch (aiEnv.AI_PROVIDER) {
      case "anthropic":
        instance = new AnthropicProvider();
        break;
      default:
        throw new Error(`Невідомий AI_PROVIDER: ${String(aiEnv.AI_PROVIDER)}`);
    }
  }
  return instance;
}
