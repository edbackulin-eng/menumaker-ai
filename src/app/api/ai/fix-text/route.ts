import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateBody } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { fixTextSchema } from "@/lib/validations/ai";
import { runCreditedAiCall } from "@/services/ai/credit-guard";
import { fixText } from "@/services/ai/functions/fix-text";

// See analyze-menu/route.ts: Vercel's default timeout is shorter than a
// real Anthropic round-trip can take.
export const maxDuration = 60;

export const POST = withApiHandler(
  async (request) => {
    const { user } = await requireAuth();
    const { text, locale } = await validateBody(request, fixTextSchema);

    const { data, balance } = await runCreditedAiCall({
      userId: user.id,
      actionType: "text_fix",
      transactionType: "menu_generation",
      description: "AI: виправлення тексту (fix_text)",
      call: async () => {
        const result = await fixText(text, locale);
        return { data: result.text, usage: result.usage };
      },
    });

    return apiSuccess({ text: data, creditsBalance: balance });
  },
  { rateLimitTier: "ai" },
);
