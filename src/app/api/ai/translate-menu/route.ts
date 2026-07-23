import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateBody } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { translateMenuSchema } from "@/lib/validations/ai";
import { runCreditedAiCall } from "@/services/ai/credit-guard";
import { translateMenu } from "@/services/ai/functions/translate-menu";

// See analyze-menu/route.ts: Vercel's default timeout is shorter than a
// real Anthropic round-trip can take.
export const maxDuration = 60;

export const POST = withApiHandler(
  async (request) => {
    const { user } = await requireAuth();
    const { content, targetLocale } = await validateBody(request, translateMenuSchema);

    const { data, balance } = await runCreditedAiCall({
      userId: user.id,
      actionType: "menu_translation",
      transactionType: "menu_translation",
      description: `AI: переклад меню на "${targetLocale}" (translate_menu)`,
      call: async () => {
        const result = await translateMenu(content, targetLocale);
        return { data: result.content, usage: result.usage };
      },
    });

    return apiSuccess({ content: data, creditsBalance: balance });
  },
  { rateLimitTier: "ai" },
);
