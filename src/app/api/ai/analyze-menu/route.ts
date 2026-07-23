import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateBody } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { analyzeMenuSchema } from "@/lib/validations/ai";
import { runCreditedAiCall } from "@/services/ai/credit-guard";
import { analyzeMenu } from "@/services/ai/functions/analyze-menu";

// Vercel's default function timeout (10s on Hobby without this) is shorter
// than a real Anthropic round-trip on a large pasted menu can take. Set
// explicitly rather than discovered via a production timeout.
export const maxDuration = 60;

export const POST = withApiHandler(
  async (request) => {
    const { user } = await requireAuth();
    const { rawText } = await validateBody(request, analyzeMenuSchema);

    const { data, balance } = await runCreditedAiCall({
      userId: user.id,
      actionType: "menu_generation",
      transactionType: "menu_generation",
      description: "AI: аналіз тексту меню (analyze_menu)",
      call: async () => {
        const result = await analyzeMenu(rawText);
        return { data: result.content, usage: result.usage };
      },
    });

    return apiSuccess({ content: data, creditsBalance: balance });
  },
  { rateLimitTier: "ai" },
);
