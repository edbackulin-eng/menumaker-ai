import type { Config } from "tailwindcss";

/**
 * Base Tailwind config. Design tokens/theme live here once the design
 * system lands (see Stage 3) — for now this only wires up dark mode and
 * content scanning so the config is ready to extend without churn later.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
