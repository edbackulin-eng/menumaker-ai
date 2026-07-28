import type { LegalDocument } from "./types";

export const privacyEn: LegalDocument = {
  title: "Privacy Policy",
  intro: [
    "Last updated: [PUBLISH_DATE].",
    "This policy explains what personal data MenuMaker AI collects, why, who it is shared with, and what rights you have over it. It is written to reflect what the product actually does, not a generic template.",
    "Data controller: [CONTROLLER_NAME]. Governing jurisdiction: [JURISDICTION]. Contact for privacy requests: [PRIVACY_EMAIL].",
  ],
  sections: [
    {
      heading: "1. What we collect",
      paragraphs: [
        "- Account data: email address, display name, avatar image, and your chosen interface language.",
        "- Menu content: the dishes, prices, descriptions, and venue details you enter or that we extract from a file you upload.",
        "- Uploaded files: if you import a menu from a PDF, Word, or Excel file, that file is stored only long enough to extract its text — it is automatically deleted right after a successful import, and is not kept afterwards.",
        "- Payment records: when you purchase credits, we store the payment status, amount, currency, and Stripe's own transaction identifiers. We never see or store your card number — Stripe handles that directly.",
        "- Technical data: your IP address, used only to enforce rate limits and prevent abuse (e.g. brute-force login attempts, API flooding).",
      ],
    },
    {
      heading: "2. Why we process it (legal basis)",
      paragraphs: [
        "- Account and menu data: processed to perform the contract with you — you cannot use the service without it.",
        "- IP-based rate limiting: processed under our legitimate interest in keeping the service available and secure against abuse.",
        "- Payment data: processed to perform the purchase contract and to meet accounting obligations.",
      ],
    },
    {
      heading: "3. Who we share data with",
      paragraphs: [
        "- Supabase — our database, authentication, and file-storage provider. It holds all the data described above.",
        "- Anthropic (Claude API) — receives the text of your menu when you use AI features (analysis, translation, description writing, improvement suggestions). For improvement suggestions specifically, your venue name and business type are also sent alongside the menu text. Anthropic does not receive your email, password, or payment information.",
        '- Pexels — receives only a short search phrase describing a dish (e.g. "grilled salmon plate"), generated automatically to find a stock photo. It never receives your account details or menu text as a whole.',
        "- Cloudflare (Turnstile) — runs the bot-detection check on our login and registration pages. What Cloudflare's own widget observes is governed by Cloudflare's privacy policy, not this one.",
        "- Vercel — our hosting provider, which keeps standard request logs as part of running the infrastructure.",
        "- Stripe — processes payments when credit purchases are enabled; handles your card details directly and never passes them to us.",
        "We do not sell personal data, and we do not share it with anyone for advertising purposes.",
      ],
    },
    {
      heading: "4. Cookies",
      paragraphs: [
        "We do not use analytics or advertising cookies. The cookies actually set are:",
        "- A session cookie (name starts with sb-) that keeps you signed in, for up to 30 days.",
        "- A locale cookie that remembers your chosen interface language, for up to 1 year.",
        "- If you interact with the Cloudflare Turnstile widget on login or registration, Cloudflare may set its own cookie as part of the bot-detection check — that is between you and Cloudflare's own policy, not something this app controls.",
      ],
    },
    {
      heading: "5. How long we keep data",
      paragraphs: [
        "- Account and menu data is kept until you delete your account.",
        "- Uploaded source files are deleted automatically right after a successful import — we do not keep a long-term copy of your original document.",
        "- IP addresses used for rate-limiting are currently kept indefinitely as part of the abuse-prevention counters; we are working towards adding automatic expiry for this data and will update this section when that ships.",
        "- Payment records are kept as required for accounting and tax purposes.",
      ],
    },
    {
      heading: "6. International transfers",
      paragraphs: [
        "Our infrastructure and processors (Supabase, Anthropic, Vercel, Cloudflare, Stripe) may process data outside your own country, including in the United States. Where this involves a transfer out of the EU/UK/EEA, we rely on the safeguards those providers make available (such as Standard Contractual Clauses) as required by applicable law.",
      ],
    },
    {
      heading: "7. Your rights",
      paragraphs: [
        "Depending on where you are, you may have the right to access, correct, delete, restrict, or export your personal data, and to object to certain processing. To exercise any of these, contact [PRIVACY_EMAIL].",
        "- Deletion: deleting your account from your profile page removes your account, menus, and payment records immediately. Honestly stated: files you previously uploaded or exported (avatars, menu exports, dish photos) are not yet automatically purged from storage on account deletion — this is a known gap we are working to close. Contact [PRIVACY_EMAIL] to request manual removal in the meantime.",
        "- Portability: we do not yet offer a self-service data export. Contact [PRIVACY_EMAIL] and we will provide your data manually.",
        "- You also have the right to lodge a complaint with your local data protection authority.",
      ],
    },
    {
      heading: "8. Canada",
      paragraphs: [
        "For users in Canada, this section is provided under the Personal Information Protection and Electronic Documents Act (PIPEDA). Our privacy officer, responsible for compliance with Canadian privacy law, can be reached at [PRIVACY_EMAIL]. We collect and use your personal information only for the purposes described in this policy, and only with your meaningful consent — given, in practice, when you create an account and agree to this policy.",
      ],
    },
    {
      heading: "9. European Union, United Kingdom, EEA, and Switzerland",
      paragraphs: [
        "This service is not currently offered to residents of the European Union, the United Kingdom, the European Economic Area, or Switzerland. Registration and sign-in are technically blocked for visitors detected in these regions. If you believe you were blocked in error, contact [PRIVACY_EMAIL].",
      ],
    },
    {
      heading: "10. Children",
      paragraphs: [
        "This service is intended for business use and is not directed at children. We do not knowingly collect personal data from children.",
      ],
    },
    {
      heading: "11. Changes to this policy",
      paragraphs: [
        "We may update this policy as the product changes. Material changes will be reflected by updating the date at the top of this page.",
      ],
    },
    {
      heading: "12. Contact",
      paragraphs: [
        "Privacy questions or requests: [PRIVACY_EMAIL].",
        "To report abuse or content you believe violates these policies: [ABUSE_EMAIL].",
      ],
    },
  ],
};

export const termsEn: LegalDocument = {
  title: "Terms of Service",
  intro: [
    "Last updated: [PUBLISH_DATE].",
    "These terms govern your use of MenuMaker AI, operated by [CONTROLLER_NAME]. By creating an account, you agree to them.",
  ],
  sections: [
    {
      heading: "1. The service",
      paragraphs: [
        "MenuMaker AI helps businesses create, style, and publish menus, including AI-assisted text extraction, translation, and photo suggestions.",
      ],
    },
    {
      heading: "2. Accounts",
      paragraphs: [
        "You must provide accurate information when registering and are responsible for keeping your account credentials secure. You must be old enough to enter into a binding contract in your jurisdiction.",
      ],
    },
    {
      heading: "3. Acceptable use",
      paragraphs: [
        "You may not use the service to upload or publish unlawful, infringing, or abusive content, to attempt to bypass rate limits or security controls, or to scrape or resell the service without authorization.",
        "Report abuse or violations to [ABUSE_EMAIL].",
      ],
    },
    {
      heading: "4. Your content",
      paragraphs: [
        "You retain ownership of the menu content you create or upload. You grant us a limited license to store, process, and display it as needed to provide the service (for example, rendering your public menu page).",
        "AI-generated text and photo suggestions are provided as a convenience and may contain errors. You are responsible for reviewing and verifying menu content — including prices, ingredients, and allergen information — before publishing it.",
      ],
    },
    {
      heading: "5. Credits and payments",
      paragraphs: [
        "Certain features require credits, which may be purchased through our payment processor. Prices are subject to change. Except where required by law, credit purchases are non-refundable.",
      ],
    },
    {
      heading: "6. Third-party services",
      paragraphs: [
        "The service relies on third-party providers (including Supabase, Anthropic, Pexels, Cloudflare, Vercel, and Stripe) described in our Privacy Policy.",
      ],
    },
    {
      heading: "7. Termination",
      paragraphs: [
        "You may delete your account at any time from your profile page. We may suspend or terminate accounts that violate these terms or applicable law.",
      ],
    },
    {
      heading: "8. Geographic restriction",
      paragraphs: [
        "This service is not intended for, and is not offered to, residents of the European Union, the United Kingdom, the European Economic Area, or Switzerland. Registration and sign-in are technically blocked from those regions. You agree not to attempt to circumvent this restriction (for example, by using a VPN or misrepresenting your location) to access the service if you reside in one of these regions.",
      ],
    },
    {
      heading: "9. Disclaimers and limitation of liability",
      paragraphs: [
        'The service is provided "as is", without warranties of any kind. To the maximum extent permitted by [JURISDICTION] law, [CONTROLLER_NAME] is not liable for indirect, incidental, or consequential damages arising from your use of the service.',
      ],
    },
    {
      heading: "10. Governing law",
      paragraphs: [
        "These terms are governed by the laws of [JURISDICTION], without regard to conflict-of-law principles.",
      ],
    },
    {
      heading: "11. Changes to these terms",
      paragraphs: [
        "We may update these terms as the product changes. Continued use of the service after an update constitutes acceptance of the revised terms.",
      ],
    },
    {
      heading: "12. Contact",
      paragraphs: ["Questions about these terms: [PRIVACY_EMAIL]."],
    },
  ],
};
