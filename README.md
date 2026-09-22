# Home Goods — storefront

A small Next.js (App Router) storefront: categories of products, a list page and a
product detail page, search within a category, a browser-held cart, and a checkout
that ends on a confirmation page. Product photos come from a single server-side
call to the Unsplash API.

## Requirements

```text
Node 22.12+ (verified on Node 24 LTS)
npm 11
```

## Install

```bash
npm install
```

## Environment

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

The two variables and where each key comes from:

```text
UNSPLASH_ACCESS_KEY   # from https://unsplash.com/developers — read only on the server (the /api/photos route)
CONTEXT7_API_KEY      # from https://context7.com/dashboard — used by Claude Code's MCP, not the site
```

The site still renders without `UNSPLASH_ACCESS_KEY`, but Unsplash photos will be
unavailable (the product page shows a non-fatal "photo unavailable" panel instead).
`CONTEXT7_API_KEY` is only needed by the Claude Code MCP tooling, never by the site.

## Run

```bash
npm run dev
```

Then open http://127.0.0.1:3000 — the home route redirects to the seeded category.

## Production verification

```bash
npm run build
npm run start
```

## Checks

```bash
npm run typecheck
npm run lint
npm run test
```

`npm run test` runs the Vitest unit suite (the `/api/photos` route handler, with
`fetch` mocked — no real key needed) and then the Playwright end-to-end suite,
which starts its own local server.

## Key URLs

```text
/                             # redirects to the seeded category
/category/home-goods          # a category list page (supports ?q=<search>)
/product/linen-desk-lamp      # a product detail page
/cart                         # the browser cart
/checkout                     # checkout form
/checkout/confirmation        # order confirmation (shown right after checkout)
```

## Development / test-only state hook

The category and product pages accept a deterministic state override so every
state is directly testable. It is never linked from normal navigation.

```text
?demoState=loading
?demoState=empty
?demoState=error
?demoState=success
```
