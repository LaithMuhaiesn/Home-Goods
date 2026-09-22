# Plan: Search Within A Category

| | |
|---|---|
| **Slug** | `search-within-a-category` |
| **Spec** | `_specs/search-within-a-category.md` |
| **Branch** | `claude/feature/search-within-a-category` |
| **Created** | 2026-09-22 |

Single-session feature (Path A). See the spec for the *what* and *why*; this plan
is the *how*.

## Decisions (resolving the spec's open questions)

- **Search both name and description** (the more forgiving option) — a shopper
  searching "oak" should find a product described as oak even if the word is not
  in its name.
- **Show the match count only while a query is active.** The default, unfiltered
  view stays clean; the count appears once the shopper is filtering.

## Approach

- The category page stays a server component. It already receives `searchParams`;
  read `q` from it, trim it, and filter the current category's products.
- Extract the matching logic into `lib/search.ts` as a pure function so it can be
  unit-tested without a browser: `filterProducts(products, q)` — case-insensitive,
  whitespace-trimmed, matches `name` or `description`, empty query returns all.
- Add a small **client** component `components/CategorySearch.tsx`: a labelled
  input, initialised from the current `q`, that writes `q` into the URL as the
  shopper types (via `router.replace`, no scroll jump). Server re-render produces
  the filtered grid — the URL is the source of truth, satisfying the shareable/
  reloadable requirement.
- When `q` is active and nothing matches, render the existing `StatePanel` in its
  `empty` state with a message naming the query and a "clear search" link back to
  the category path with no `q`.
- Put the match count in an `aria-live="polite"` region so it is announced.

## Tasks

- [ ] `lib/search.ts`: `filterProducts(products, q)` pure helper.
- [ ] `components/CategorySearch.tsx`: labelled, URL-syncing search input (client).
- [ ] Category page: read+trim `q`, filter via the helper, render the search box,
      the conditional count, and either the grid (success) or the empty state.
- [ ] Keep money/date/header/house rules intact; reuse `PageHeader`/`StatePanel`.
- [ ] `tests/search.test.ts` (Vitest): the helper — case-insensitivity, trimming,
      name and description matches, empty-query-returns-all, no cross-category leak.
- [ ] `tests/search.spec.ts` (Playwright): typing narrows the grid and updates the
      URL; a no-match query shows the empty state with a clear control; clearing
      restores the full category.
- [ ] Run typecheck, lint, the `site-reviewer` subagent, and `npm run test`; fix
      any BLOCKING findings; verify in the browser.

## Done when

- All seven acceptance criteria in the spec hold on the running site.
- `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test` pass.
- The `site-reviewer` reports no BLOCKING findings.
