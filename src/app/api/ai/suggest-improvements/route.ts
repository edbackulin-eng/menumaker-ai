import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateBody } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { suggestImprovementsSchema } from "@/lib/validations/ai";
import { runCreditedAiCall } from "@/services/ai/credit-guard";
import { suggestImprovements } from "@/services/ai/functions/suggest-improvements";

export const POST = withApiHandler(
  async (request) => {
    const { user } = await requireAuth();
    const { content } = await validateBody(request, suggestImprovementsSchema);

    const { data, balance } = await runCreditedAiCall({
      userId: user.id,
      actionType: "ai_improvement",
      transactionType: "ai_description",
      description: "AI: рекомендації щодо покращення меню (suggest_improvements)",
      call: async () => {
        const result = await suggestImprovements(content);
        return { data: result.suggestions, usage: result.usage };
      },
    });

    return apiSuccess({ suggestions: data, creditsBalance: balance });
  },
  { rateLimitTier: "ai" },
);
