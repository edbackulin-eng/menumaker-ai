import type { Config } from "tailwindcss";

/**
 * Design tokens live as CSS custom properties in src/styles/globals.css;
 * this file wires them up as Tailwind utilities (bg-accent-400, text-h1,
 * rounded-lg, shadow-md, ...). See globals.css for the token values and the
 * primitive-vs-semantic layering rationale.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          50: "var(--color-accent-50)",
          100: "var(--color-accent-100)",
          200: "var(--color-accent-200)",
          400: "var(--color-accent-400)",
          600: "var(--color-accent-600)",
          800: "var(--color-accent-800)",
          900: "var(--color-accent-900)",
        },
        neutral: {
          0: "var(--color-neutral-0)",
          50: "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
          500: "var(--color-neutral-500)",
          600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)",
          800: "var(--color-neutral-800)",
          900: "var(--color-neutral-900)",
          950: "var(--color-neutral-950)",
        },
        success: {
          50: "var(--color-success-50)",
          400: "var(--color-success-400)",
          600: "var(--color-success-600)",
        },
        error: {
          50: "var(--color-error-50)",
          400: "var(--color-error-400)",
          600: "var(--color-error-600)",
        },
        warning: {
          50: "var(--color-warning-50)",
          400: "var(--color-warning-400)",
          600: "var(--color-warning-600)",
        },
        background: "var(--color-background)",
        surface: {
          DEFAULT: "var(--color-surface)",
          secondary: "var(--color-surface-secondary)",
        },
        foreground: {
          DEFAULT: "var(--color-foreground)",
          secondary: "var(--color-foreground-secondary)",
          tertiary: "var(--color-foreground-tertiary)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        ring: "var(--color-ring)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        caption: ["var(--font-size-caption)", { lineHeight: "var(--line-height-caption)" }],
        "body-sm": ["var(--font-size-body-sm)", { lineHeight: "var(--line-height-body-sm)" }],
        body: ["var(--font-size-body)", { lineHeight: "var(--line-height-body)" }],
        "body-lg": ["var(--font-size-body-lg)", { lineHeight: "var(--line-height-body-lg)" }],
        h6: ["var(--font-size-h6)", { lineHeight: "var(--line-height-h6)", fontWeight: "600" }],
        h5: ["var(--font-size-h5)", { lineHeight: "var(--line-height-h5)", fontWeight: "600" }],
        h4: ["var(--font-size-h4)", { lineHeight: "var(--line-height-h4)", fontWeight: "600" }],
        h3: [
          "var(--font-size-h3)",
          { lineHeight: "var(--line-height-h3)", fontWeight: "600", letterSpacing: "-0.01em" },
        ],
        h2: [
          "var(--font-size-h2)",
          { lineHeight: "var(--line-height-h2)", fontWeight: "600", letterSpacing: "-0.02em" },
        ],
        h1: [
          "var(--font-size-h1)",
          { lineHeight: "var(--line-height-h1)", fontWeight: "700", letterSpacing: "-0.02em" },
        ],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        DEFAULT: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        DEFAULT: "var(--ease-default)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
        "slide-in-from-top": {
          from: { transform: "translateY(-4px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(4px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.96)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in var(--duration-fast) var(--ease-default)",
        "fade-out": "fade-out var(--duration-fast) var(--ease-default)",
        "slide-in-from-top": "slide-in-from-top var(--duration-base) var(--ease-default)",
        "slide-in-from-bottom": "slide-in-from-bottom var(--duration-base) var(--ease-default)",
        "scale-in": "scale-in var(--duration-fast) var(--ease-default)",
      },
    },
  },
  plugins: [],
};

export default config;
