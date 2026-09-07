# MenuMaker AI

An international SaaS platform for automatically creating professional menus for restaurants, cafés, bars and bakeries — powered by AI.

**Live demo:** [menumaker-ai.vercel.app](https://menumaker-ai.vercel.app) — no login required, demo mode is open to explore.

---

## Overview

MenuMaker AI lets restaurant owners build, edit and export polished menus in minutes. It uses the Anthropic Claude API to analyze menus, generate dish descriptions, suggest improvements and translate content into multiple languages. Menus can be edited with a drag-and-drop interface and exported to multiple formats.

## Features

- **AI-powered menu builder** — menu analysis, automatic description generation and improvement suggestions via the Anthropic Claude API
- **Multi-language** — fully internationalized in 5 locales (`next-intl`)
- **Drag-and-drop editor** — reorder and organize menu items with `dnd-kit`
- **Multi-format export** — export menus to PDF, PNG and QR code
- **Import** — bring in existing menus from `.docx`, PDF and Excel files
- **Credit system & admin analytics** — usage tracking and an admin dashboard
- **Auth** — Supabase Auth with OAuth
- **Compliance & security** — GDPR-compliant, geo-blocking and login rate-limiting
- **Safe demo mode** — a sandboxed showcase with sample data, no real customer data exposed

## Tech Stack

- **Framework:** Next.js 16 (App Router, React Server Components, Turbopack)
- **Language:** TypeScript (strict mode, `noUncheckedIndexedAccess`)
- **Styling:** Tailwind CSS v4
- **Backend / Database:** Supabase (PostgreSQL, Auth, Storage)
- **AI:** Anthropic Claude API
- **Internationalization:** next-intl (5 locales)
- **Deployment:** Vercel

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your own keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Screenshots

<!-- Add 2-3 screenshots here, e.g.: -->
<!-- ![Dashboard](docs/screenshot-dashboard.png) -->
<!-- ![Menu editor](docs/screenshot-editor.png) -->

---

Built by [Eduard Bakulin](https://github.com/edbackulin-eng) · Full Stack Developer


