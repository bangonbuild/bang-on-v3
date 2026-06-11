# AGENTS.md

## Cursor Cloud specific instructions

### What this is
`bang-on` / **datum.ai** is a single mobile-first React 19 + Vite 8 + TypeScript PWA for Australian tradies (jobs, money/quotes, calculators, AI assistant). All app data persists in browser `localStorage` — there is **no backend database, auth, or accounts**. Standard scripts live in `package.json` (`dev`, `build`, `lint`, `preview`).

### Services
- **Vite dev server** (`npm run dev`, port 5173): serves the SPA. This alone runs all core features — job CRUD, Money/quotes, Measure calculators, settings — entirely client-side. No env vars needed.
- **Vercel API runtime** (`vercel dev`, port 3000): only needed for AI features (Nudge chat, Snap photo analysis, AI quote/invoice/photo-report generation). `vite.config.ts` proxies `/api` → `http://localhost:3000`. Requires the Vercel CLI (`npm i -g vercel`, not installed by the update script) and `OPENROUTER_API_KEY` in the environment (see `.env.example`). Without it, `/api/ai` and `/api/analyse` return HTTP 500 `{"error":"API key not configured"}`; the rest of the app is unaffected.

### Gotchas
- `npm run lint` currently reports pre-existing errors in `src/screens/NudgeScreen.tsx` (react-hooks rules). These are existing code issues, not an environment problem — lint itself runs fine.
- No automated tests are configured (no Jest/Vitest/Playwright).
- Node ≥ 22.12 (or ^20.19) is required by Vite 8; the VM's Node 22 satisfies this.
