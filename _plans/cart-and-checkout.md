# Implementation Plan: Cart and Checkout

| | |
|---|---|
| **Slug** | `cart-and-checkout` |
| **Spec** | `_specs/cart-and-checkout.md` |
| **Branch** | `claude/feature/cart-and-checkout` |
| **Status** | In progress |
| **Created** | 2026-09-22 |
| **Updated** | 2026-09-22 |

## How to resume this plan

1. Read the spec linked above for the *why*. This plan covers only the *how*.
2. Find the first phase in **Progress** below that is not `Done`.
3. Read that phase in full — goal, prerequisites, tasks, technical details, and
   "Done when" — before changing any code.
4. Check **Decisions** before choosing an approach.
5. As you work: tick each task, keep **Progress** current, and add a **Session log**
   line. Run the `site-reviewer` and the checks before merging.
6. If reality contradicts the plan, correct the plan in place and record it under
   **Deviations**.

## Overview

When finished, a shopper can add products to a browser-held cart, see a cart count
in the header on every page, review and edit the cart at `/cart`, check out at
`/checkout` by entering contact and delivery details, and land on a confirmation
that shows a server-validated order (order id, lines, totals). Prices and totals
are always recomputed on the server from `data/catalog.ts`; the client cart is
never trusted for money. No order is persisted; the confirmation is state-backed.

## Context

See spec.

## Progress

| Phase | Name | Status |
|---|---|---|
| 1 | Cart state + header indicator + add to cart | Done |
| 2 | Cart page (review, edit, totals, states) | Done |
| 3 | Checkout route handler + checkout form | Done |
| 4 | Confirmation + clear-on-success + tests + review | Not started |

**Current state of the working tree** — Phase 1 implemented and committed: cart
store, header indicator on every page, add-to-cart on the product page.

## Action required

| When | Action | Why it is needed |
|---|---|---|
| Before | None — the Unsplash key already set is unrelated to this feature | Cart/checkout make no external call |

## Phase 1: Cart state + header indicator + add to cart

**Goal** — A working browser cart with a header count on every page, and an
"Add to cart" control on the product page that increments it.

**Prerequisites** — None.

### Tasks

- [x] `lib/cart.ts`: pure cart types and operations — `CartItem = { slug, quantity }`,
      and pure functions `addItem(items, slug)`, `setQuantity(items, slug, qty)`,
      `removeItem(items, slug)`, `cartCount(items)`. Adding an existing slug merges
      quantity; setting quantity < 1 removes the line.
- [x] Cart store (client): hydrated from `localStorage`, written back on change;
      exposes the items, `count`, and the mutators. A `ready` flag distinguishes
      "reading storage" (loading) from "read, empty". **Implemented as a module store
      via `useSyncExternalStore` (`lib/cartStore.ts` + `components/useCart.ts`)
      instead of a Context provider — see Deviations.**
- [x] `components/CartIndicator.tsx` (client): a header link to `/cart` showing the
      count, with an `aria-live` region so count changes are announced.
- [x] `components/AddToCartButton.tsx` (client): calls the store's add for a
      given slug.
- [x] `app/layout.tsx`: render a site header containing the `CartIndicator` on
      every page (no provider needed with the module store).
- [x] Product page: render `AddToCartButton` for the product (success state only).

### Technical details

- Storage key `cart:v1`; value is JSON of `CartItem[]`. Wrap every `localStorage`
  read/write in try/catch; render correctly if it throws or is empty.
- The provider must not cause hydration mismatch: render children immediately;
  the indicator shows a stable placeholder (e.g. count 0 / no badge) until
  `ready`, then the real count.
- Count = sum of quantities. Keep all cart math in `lib/cart.ts` so it is unit
  testable without a browser.
- Do not format money here; that arrives in Phase 2 via `lib/format.ts`.

### Done when

- Adding a product from its page increments the header count; adding the same
  product again increments quantity, not a second line.
- The count survives a reload.
- `npm run typecheck`, `npm run lint`, `npm run build` pass.

## Phase 2: Cart page (review, edit, totals, states)

**Goal** — `/cart` lists the cart with per-line and grand totals and supports
quantity change, remove, and empty, with the four states.

**Prerequisites** — Phase 1.

### Tasks

- [x] `lib/cart.ts`: add `resolveLines(items)` → `{ slug, name, unitPriceEUR,
      quantity, lineTotalEUR }[]` using `data/catalog.ts`, and `cartTotal(lines)`.
      Skip/flag items whose slug is not in the catalogue.
- [x] `app/cart/page.tsx` (client): render the lines via the house `StatePanel` —
      loading while the store is not `ready`, empty when the cart has no items (with
      a link back to a category), success with the line list and grand total.
- [x] Line controls: a labelled quantity input (whole number ≥ 1), a remove
      control, and an empty-cart control — all with accessible labels.
- [x] Money via `money()` from `lib/format.ts`; the page header uses `PageHeader`.

### Technical details

- Totals are display-only here and recomputed from the catalogue, never stored.
- Quantity input: on change, call `setQuantity`; a value < 1 removes the line.
- Empty state copy tells the shopper what to do next and links to `/category/home-goods`.

### Done when

- The cart page shows correct lines and totals, supports edit/remove/empty, and
  shows the empty state with no items.
- Checks pass.

## Phase 3: Checkout route handler + checkout form

**Goal** — A server route validates the cart + details and returns an
authoritative order summary; `/checkout` collects details and calls it.

**Prerequisites** — Phase 2.

### Tasks

- [x] `lib/checkout.ts`: pure `validateOrder(input)` → either a typed error
      (`empty_cart` / `invalid_item` / `invalid_quantity` / `invalid_details`) or a
      computed order (`{ orderId, lines, totalEUR }`) built from the catalogue.
- [x] `app/api/checkout/route.ts` (POST): parse the body, call `validateOrder`,
      return the order on success or the house error envelope with the mapped HTTP
      status; never throw (unexpected → `unexpected` 500).
- [x] `app/checkout/page.tsx` (client): order summary (from the cart) + a form for
      name, email, address, each with a visible label; client-side validation for a
      fast path; on submit POST to `/api/checkout`. Blocks when the cart is empty.
      Field errors shown as text tied to the field.
- [x] On success, stash the returned order (`sessionStorage` `order:last`) and
      navigate to the confirmation page.

### Technical details

- Status map: `empty_cart` 400, `invalid_item` 400, `invalid_quantity` 400,
  `invalid_details` 400, `unexpected` 500. Envelope `{ "error": { "code","message" } }`.
- Email shape: a simple, documented regex (non-empty, `x@y.z` shape); trim name and
  address; reject empties.
- Server recomputes unit prices and line totals from the catalogue; ignore any
  price the client sends. `orderId`: e.g. `ORD-<base36 time>-<random>`.
- Hand the successful order to the confirmation page via `sessionStorage`
  (`order:last`) — state-backed, not addressable by id.

### Done when

- Posting a valid cart+details returns a correct, catalogue-computed order.
- Each invalid case returns the right code/status and envelope.
- Checks pass; Vitest covers the route/validation with `fetch`/catalogue as needed.

## Phase 4: Confirmation + clear-on-success + tests + review

**Goal** — The confirmation page shows the server-validated order, the cart clears
only on success, and the feature is fully tested and reviewed.

**Prerequisites** — Phase 3.

### Tasks

- [ ] `app/checkout/confirmation/page.tsx` (client): read the stashed order; show
      order id, lines, quantities, unit prices, line totals, grand total (all via
      `money()`), inside `StatePanel` success. If no stashed order (direct visit or
      post-clear refresh), show the empty state — not an error — explaining there is
      no recent order and linking back to shopping.
- [ ] Clear the browser cart exactly once, after a successful confirmation render.
- [ ] `tests/cart.test.ts` (Vitest): cart ops + `resolveLines`/`cartTotal`.
- [ ] `tests/checkout.test.ts` (Vitest): `validateOrder` / the route — valid order,
      empty cart, invalid item, invalid quantity, invalid details, client price
      ignored, unexpected.
- [ ] `tests/cart-checkout.spec.ts` (Playwright): add to cart → cart shows line →
      checkout with valid details → confirmation shows totals → cart cleared; plus
      the empty-cart-blocks-checkout path.
- [ ] Run the `site-reviewer`, fix BLOCKING findings, browser pass, then merge.

### Technical details

- The confirmation must render from the server-validated payload only.
- Clearing the cart on the confirmation page must not loop or double-fire (guard
  with an effect that runs once).

### Done when

- Every acceptance criterion in the spec holds on the running site.
- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` pass.
- `site-reviewer` reports no BLOCKING findings.

## Decisions

| Decision | Reasoning | Alternatives rejected |
|---|---|---|
| Cart lives in `localStorage`, keyed `cart:v1` | Spec requires survival across reload, no accounts/DB | Server session (needs persistence); cookies (size/So-C) |
| Confirmation is state-backed via `sessionStorage`, not addressable by id | Spec: orders are not persisted and must not be retrievable by id | A `/confirmation/<id>` route (implies persistence) |
| Prices/totals recomputed server-side in a route handler | Spec: client money is never authoritative; house rule keeps external/authoritative work in route handlers | Trusting client-sent totals (insecure) |
| Cart math and checkout validation are pure modules (`lib/cart.ts`, `lib/checkout.ts`) | Unit-testable without a browser | Logic inline in components (untestable) |

## Open questions

| Question | Blocking? | Owner |
|---|---|---|
| None — the spec resolved the three original open questions | No | — |

## Deviations

- **Phase 1 — cart state: Context provider → module store via `useSyncExternalStore`.**
  The plan specified a `CartProvider` using React context + `useState`, reading
  `localStorage` in a mount effect. ESLint's `react-hooks/set-state-in-effect`
  correctly flagged the synchronous `setState` in that effect. Rather than disable
  the rule, the cart became a module store (`lib/cartStore.ts`) consumed through
  `useSyncExternalStore` (`components/useCart.ts`), with a server snapshot for
  SSR-safe hydration. This is the idiomatic pattern for subscribing to an external
  store and removed the need for a provider entirely.

## Session log

| Date | Phases touched | Notes |
|---|---|---|
| 2026-09-22 | Phase 1 | Cart store + header indicator + add-to-cart. typecheck/lint/build green; verified in browser (count increments and persists). Deviated to a module store (see Deviations). |
| 2026-09-22 | Phase 2 | Cart page: lines, quantity edit, remove, empty, grand total, four states. typecheck/lint/build green; verified in browser (Total 131.50 EUR for two lines). |
| 2026-09-22 | Phase 3 | Checkout route handler + form. typecheck/lint/build green; verified route with curl — valid order totals 174.00 from the catalogue, client-sent price ignored (stays 89), and empty_cart/invalid_item/invalid_details return the right code + envelope. |
