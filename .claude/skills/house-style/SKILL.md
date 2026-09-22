---
name: house-style
description: The house style for this storefront's UI and route handlers. Use whenever creating or editing any page, list, product/detail view, error page, or API route handler, and whenever rendering a date, a price, or an image. Covers the required page-header block, the four list states, date and money formatting, the server-side external-call error envelope, and image rules.
---

# House style

This site follows conventions that are deliberately not the framework defaults.
Apply all six rules below to every page and route handler. If a page comes out
wrong, the skill is wrong — fix the skill, not just the page.

Full detail and the rationale for each rule are in
[references/house-style.md](references/house-style.md). The page-header template
to copy is [assets/page-header.tsx](assets/page-header.tsx) — copy it, do not
re-invent the markup.

## The six rules

1. **Page header.** Every page opens with the same block: an uppercase,
   letter-spaced eyebrow naming the section; an `<h1>`; one muted sentence
   underneath. No page without it, including error pages. Use the `PageHeader`
   component (template in `assets/`).
2. **Four states.** Every list has loading, empty, error and success states. The
   empty state tells the user what to do next. The error state says what failed
   and offers a retry. A bare spinner is a defect.
3. **Dates** render as `15 Sep 2026` — day, three-letter month, year. No
   ordinals, no slashes, no full month names. Times are 24-hour. Use
   `date()` from `lib/format.ts`.
4. **Money** renders as `12.50 EUR` — two decimals, a space, then the ISO code.
   Never a currency symbol. Use `money()` from `lib/format.ts`.
5. **External calls** happen only in route handlers, with a five-second timeout,
   and every failure returns the same envelope:
   `{ "error": { "code": "...", "message": "..." } }`.
6. **Images** always have alt text; decorative ones use `alt=""`. Nothing is
   rendered from a raw external URL without explicit `width` and `height`.
