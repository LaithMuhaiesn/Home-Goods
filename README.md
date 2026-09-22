# Storefront — vertical slice

A small Next.js (App Router) storefront: one category, four products, a list page,
a product detail page, and a single server-side external call to Unsplash.

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

Copy the example file and fill in the value:

```bash
cp .env.example .env
```

Set:

```text
UNSPLASH_ACCESS_KEY   # from https://unsplash.com/developers — read only on the server
```

The site still renders without the key, but Unsplash photos will be unavailable
(the product page shows a non-fatal "photo unavailable" panel instead).

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

## Seeded URLs

```text
/category/home-goods
/product/linen-desk-lamp
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
