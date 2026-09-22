# Submission

- Site: https://home-goods-steel.vercel.app
- Preview deployment from a feature branch: https://home-goods-git-docs-submission-laith-9905.vercel.app (the `docs/submission` branch alias; public, Unsplash call verified)
- Stack: Next.js 16.3.5 (App Router), React 19.3.0, TypeScript 6.0.3, Node 24 LTS
- External service and the variable that holds its key: **Unsplash Search Photos API / `UNSPLASH_ACCESS_KEY`** — the site's one backend call. (Context7 / `CONTEXT7_API_KEY` is also configured, but only for Claude Code's MCP tooling; it is not called by the site — see the MCP artifact below.)

## The artifacts

- **Scaffold prompt:** `_prompts/scaffold-prompt.md` — written with ChatGPT (web), 1 round. Note at the top records that all pinned versions were verified against the npm registry and that three were adjusted to a working set (see "What went wrong").
- **Rule file:** `CLAUDE.md`, 83 lines. Three rules that earned their place:
  1. The pinned lint toolchain caveat (eslint-config-next 16 needs TS 6 + ESLint 9) — stops a future session "helpfully" upgrading and breaking the build.
  2. The catalogue data shape and that `data/catalog.ts` is the single source of truth — every item needs `slug/name/priceEUR/description/imageQuery/addedAt`.
  3. The Secrets section: two variables, `.env` ignored, `.env.example` committed, external call server-side only, never `NEXT_PUBLIC_*`.
- **MCP:** `.mcp.json` — Context7 over HTTP (`Authorization: Bearer ${CONTEXT7_API_KEY}`, header verified against context7.com docs on 2026-09-22) and Playwright over stdio.

  ```
  <PASTE `claude mcp list` output here — both servers connected, no missing-variable warning on Context7>
  ```
- **Skill:** `.claude/skills/house-style/` (SKILL.md + references/ + assets/). Its six rules were applied throughout Feature B (the cart, checkout and confirmation pages all use the house header block, the four states via `StatePanel`, and `money()`/`date()` formatting). See the note in "What went wrong" about demonstrating it firing automatically.
- **Reviewer:** `.claude/agents/site-reviewer.md` — read-only. Three ratchet rules added, each from a real incident this run:
  1. No generated/build artifacts in the diff — a `tsconfig.tsbuildinfo` was committed in the scaffold and had to be amended out.
  2. Config-file imports must resolve to declared deps — `eslint.config.mjs` imported `@eslint/eslintrc` (FlatCompat), which was never installed, so `eslint .` crashed.
  3. Changed dependency versions must actually install + pass typecheck/lint/build — the scaffold pinned TS 7 + ESLint 10, which eslint-config-next 16 rejects.
- **/add-category:** `.claude/commands/add-category.md` — produced two commits: `9df7e7c content: add category Kitchen` and `069521a content: add category Lighting`.

## The lifecycle

- **Feature A (Path A — search within a category):** spec `d235079`, plan `a8c64e4`, branch `claude/feature/search-within-a-category`, merge `bc74afd`.
- **Feature B (Path B — cart and checkout):** spec `ee6736c` (written with ChatGPT on the web), plan `9e81bab`, **4 phases** across **4 working sessions** (one commit per phase, plan updated each time), merge `13b62a7`.
- **One deviation from the plan and why:** the plan specified a React Context `CartProvider` reading `localStorage` in a mount effect; ESLint's `react-hooks/set-state-in-effect` flagged that. Rather than disable the rule, the cart became a module store consumed via `useSyncExternalStore` with a server snapshot — the idiomatic SSR-safe pattern, and no provider needed. (A second, smaller deviation applied the same pattern to the order hand-off.) Both are recorded under Deviations in `_plans/cart-and-checkout.md`.

## What went wrong

- **"Latest of everything" was not a working set.** The web-authored scaffold prompt pinned the newest published version of each package. On the first run, `eslint-config-next` 16.3.5's bundled `typescript-eslint` refused **TypeScript 7.0** and its bundled `eslint-plugin-react` crashed on **ESLint 10** (a removed API). Verifying against the registry, I moved TypeScript 7.0.2 → **6.0.3** and ESLint 10.11.0 → **9.39.5** (the versions that config actually supports), and installed Node 24 LTS because **Vitest 5 requires Node ≥ 22.12**. The scaffold prompt and `package.json` were updated to this working set, with the reasoning recorded in the prompt's provenance note. This is why the reviewer's ratchet rule 3 exists.
- **A Feature-A hydration race** — Playwright's `fill()` fired before React hydrated, so the search box's `onChange` never ran. Fixed by making the search a progressively-enhanced GET form (works with or without JS), which is both more correct and deterministic to test.
- **The reviewer caught a real BLOCKING issue in Feature B** — the new cart/checkout/confirmation lists were missing the house *error* state. Fixed by surfacing a real error state (store error flags for cart/confirmation, submit-failure for checkout); re-review returned PASS.
- **Demonstrating the skill firing "on its own":** in the environment used to build this, the project skill under `.claude/skills/` was not auto-invocable, so its rules were applied by hand rather than through an automatic invocation with a transcript line to point at. Running Claude Code against this repo (where the project skill is enabled) triggers `house-style` automatically for page/route work.

## Secrets check

- `git check-ignore -v .env .env.example`:
  ```
  .gitignore:10:.env	.env
  ```
  (`.env` is ignored; `.env.example` prints nothing and exits non-zero — correct.)
- History scanned with `git log --all -p | grep -iE "client-id …|access_key …|bearer …|sk-…|ghp_…"` — no key-shaped value found. `.env` is not tracked in any commit on any branch (`git log --all -- .env` is empty).
- No key was ever committed, so no rotation was required.
