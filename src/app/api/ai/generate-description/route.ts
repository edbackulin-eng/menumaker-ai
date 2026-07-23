import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateBody } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { generateDescriptionSchema } from "@/lib/validations/ai";
import { runCreditedAiCall } from "@/services/ai/credit-guard";
import { generateDescription } from "@/services/ai/functions/generate-description";

// See analyze-menu/route.ts: Vercel's default timeout is shorter than a
// real Anthropic round-trip can take.
export const maxDuration = 60;

export const POST = withApiHandler(
  async (request) => {
    const { user } = await requireAuth();
    const { dishName, context } = await validateBody(request, generateDescriptionSchema);

    const { data, balance } = await runCreditedAiCall({
      userId: user.id,
      actionType: "ai_description",
      transactionType: "ai_description",
      description: `AI: опис страви "${dishName}" (generate_description)`,
      call: async () => {
        const result = await generateDescription(dishName, context);
        return { data: result.description, usage: result.usage };
      },
    });

    return apiSuccess({ description: data, creditsBalance: balance });
  },
  { rateLimitTier: "ai" },
);
