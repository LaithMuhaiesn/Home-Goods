# House style — detail

The one-line rules live in `../SKILL.md`. This file holds the exact form of each
rule and why it exists, so a page can be checked against it without guessing.

## 1. Page header

Every page — list, detail, and error pages included — opens with the same block,
rendered by `components/PageHeader.tsx`:

- an **eyebrow**: uppercase, letter-spaced, naming the section (e.g. `CATEGORY`);
- an **`<h1>`**: the page title;
- one **muted sentence** underneath: a single line of context.

Why: a consistent header is how the site reads as one place rather than a set of
routes. The template in `assets/page-header.tsx` is the canonical markup — copy
it rather than re-writing the structure per page.

## 2. Four states

Every list (and every view that loads data) renders exactly one of four states,
via `components/StatePanel.tsx`:

- **loading** — communicates that content is loading; never a bare spinner.
- **empty** — explains there is nothing yet and tells the user what to do next.
- **error** — says what failed and offers a retry control.
- **success** — renders the content.

Pages expose these deterministically through `?demoState=loading|empty|error|success`
(default `success`), a test-only hook that is never linked from normal navigation.

Why: the interesting states are the non-success ones; making them first-class and
testable is what keeps them correct.

## 3. Dates

Format: `15 Sep 2026` — day number, a space, the three-letter English month, a
space, the four-digit year. No ordinals (`15th`), no slashes (`15/09`), no full
month names. Times, when shown, are 24-hour. Use `date()` from `lib/format.ts`;
never call `toLocaleString` in a component, and never format a date inline.

Parsing is done in UTC so the displayed day is identical on every machine.

## 4. Money

Format: `12.50 EUR` — exactly two decimals, a single space, then the ISO 4217
code. Never a currency symbol (`€`, `$`), never a locale-grouped string. Use
`money()` from `lib/format.ts`. Prices are stored as numbers (`priceEUR`) in
`data/catalog.ts`.

## 5. External calls and the error envelope

External network calls happen **only** in route handlers (never in a client
component, never in the browser). Each call:

- uses a **five-second timeout** (`AbortSignal.timeout(5000)`);
- keeps its API key server-side, never in a `NEXT_PUBLIC_*` variable or a
  response body;
- on any failure returns the same envelope and never a raw upstream error:

```json
{ "error": { "code": "...", "message": "..." } }
```

The stable failure codes for the Unsplash call are `invalid_query` (400),
`missing_key` (500), `timeout` (504), `upstream_http` (502), `no_results` (404),
and `unexpected` (500). The shared implementation is `lib/unsplash.ts`.

## 6. Images

Every image has an `alt` attribute. Meaningful images get a descriptive one;
purely decorative images use `alt=""`. Nothing is rendered from a raw external
URL without explicit `width` and `height` (use `next/image`, never a bare
`<img>`), so the layout never shifts while the image loads.
