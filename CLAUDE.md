# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A small Next.js (App Router) storefront: categories that contain products, a list
page and a detail page, and one server-side external call to Unsplash.

## Commands

```bash
npm run dev        # start the dev server on http://localhost:3000
npm run build      # production build (must pass before any merge)
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run test       # unit (Vitest) then e2e (Playwright)
npm run test:unit  # Vitest only  — the /api/photos route handler, fetch mocked
npm run test:e2e   # Playwright only — builds + starts its own server
```

Run a single unit test file: `npx vitest run tests/unsplash-route.test.ts`
Run one e2e test by title: `npx playwright test -g "renders the error state"`
The Playwright browser is needed once: `npx playwright install chromium`.

## Toolchain (pinned — do not bump without checking the chain)

Node 22.12+ (built on Node 24 LTS). The lint stack is deliberately not "latest":
`eslint-config-next` 16.3.5 requires **TypeScript 6.x** (its `typescript-eslint`
rejects TS 7) and **ESLint 9.x** (its `eslint-plugin-react` breaks on ESLint 10).
See `_prompts/scaffold-prompt.md` for the full reasoning.

## Architecture

- **`data/catalog.ts` is the single source of truth** for all categories and
  products. Pages read from it via `getCategory(slug)` and `getProduct(slug)`.
  Never introduce a second data source or fetch catalog data over HTTP.
- **`lib/unsplash.ts` holds the only external call**, server-side. Both the
  `/api/photos` route handler and the product page import `getPhoto()` from it —
  the product page calls it directly, never by fetching its own route.
- **`components/PageHeader.tsx`** renders the house header block; **`StatePanel`**
  renders the four states. Pages compose these — do not re-implement either.
- **`lib/format.ts`** owns `money()` and `date()`. No component formats money or
  dates itself, and no component calls `toLocaleString`.
- The category and product pages accept `?demoState=loading|empty|error|success`,
  a test-only hook (default `success`) that is never linked from the UI.

## Data shape

An item lives in `data/catalog.ts` inside a `Category.products` array. Every
`Product` must have all of: `slug` (unique, url-safe), `name`, `priceEUR`
(number), `description`, `imageQuery` (non-empty, used for the Unsplash search),
`addedAt` (ISO date string). Every `Category` has `slug`, `name`, `blurb`,
`products`.

## Secrets

- Two variables: `UNSPLASH_ACCESS_KEY` (read only by the server-side Unsplash
  call) and `CONTEXT7_API_KEY` (used by Claude Code's MCP, not the site).
- They live in `.env`, which is git-ignored. **`.env.example` is the committed
  list** (names only, no values). Copy it to `.env` and fill in.
- The external call is made **server-side only**. Never expose a key through a
  `NEXT_PUBLIC_*` variable, in client code, or in an API response body.

## House style (every page, including error pages)

- Page header block on every page: uppercase letter-spaced eyebrow, `<h1>`, one
  muted sentence.
- Every list has all four states; empty says what to do next, error says what
  failed and offers a retry. A bare spinner is a defect.
- Dates render as `15 Sep 2026`; money as `12.50 EUR` (ISO code, never a symbol).
- External calls only in route handlers, 5s timeout, and every failure returns
  `{ "error": { "code": "...", "message": "..." } }`.
- Images always have `alt`, `width` and `height`; decorative images use `alt=""`.

## Definition of done

Before any feature merges to `main`:

1. `npm run typecheck`, `npm run lint`, and `npm run build` all pass.
2. Run the **`site-reviewer` subagent** (`.claude/agents/site-reviewer.md`) on the
   branch diff and resolve every BLOCKING finding.
3. Verify the change in the browser with the **Playwright** check (`npm run test`),
   including the four states of any new list.
