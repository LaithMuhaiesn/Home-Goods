<!-- Written with: ChatGPT — web-verified 2026-09-22 -->
<!-- Rounds of iteration on the web model: 1 -->

<!--
Provenance / verification note (Claude Code, 2026-09-22):
ChatGPT's draft pinned the latest published version of every package. Running the
prompt proved that "latest of everything" is not a working set: three pins were
adjusted to the versions that actually build, lint and test together. All were
verified against the live npm registry the same day. The four adjustments:

1. Node runtime — ChatGPT asked for Node 22. `npm view vitest@5.0.1 engines` shows
   Vitest 5 needs node ^22.12.0 || ^24 || >=26, so Node > 20 is mandatory. The dev
   machine had Node 20.19.3; installing the current Node LTS via winget produced
   Node 24.19.0 / npm 11.17.0, which satisfies Vitest's ^24 branch. engines is set
   to ">=22.11.0".
2. typescript 7.0.2 -> 6.0.3. eslint-config-next 16.3.5 bundles typescript-eslint
   8.x, which throws "typescript-eslint does not support TS 7.0". TS 6.0.3 is the
   JS-based line built to run alongside the native TS 7 and is what tooling supports.
3. eslint 10.11.0 -> 9.39.5. eslint-config-next 16.3.5's bundled eslint-plugin-react
   7.37 calls context.getFilename(), an API ESLint 10 removed, so it crashes on
   ESLint 10. ESLint 9.39.5 is the maintained line that config targets.
4. npm — packageManager reflects the installed npm 11.17.0.

Every other pin is unchanged (next 16.3.5, react/react-dom 19.3.0, @playwright/test
1.63.0, vitest 5.0.1, eslint-config-next 16.3.5, @types/node 22.20.4,
@types/react/@types/react-dom 19.3.0). This note is a manual annotation, not a
ChatGPT round.
-->

# Scaffold prompt — Storefront vertical slice (Next.js App Router + Unsplash)

You are running in an **empty folder**.

Produce a building, running, tested vertical slice of a small storefront, and nothing more.

Do **not** add features that are not listed here.

Out of scope:

* cart
* checkout
* storefront search
* authentication
* accounts
* payments
* admin UI
* database
* CMS
* filters
* sorting
* pagination
* favorites
* reviews
* inventory
* deployment configuration
* analytics

Work autonomously.

Do not stop at scaffolding. Implement the slice, install dependencies, run the required checks, fix every failure, and only then create the single Git commit defined below.

Do not make any additional commits.

---

# 1. Runtime and exact dependency versions

Use Node.js **22.12 or newer** for the scaffold/verification environment. Next.js 16 runs on `node >=20.9.0`, but Vitest 5.0.1 requires `node ^22.12.0 || ^24 || >=26`, so the whole toolchain needs Node > 20. This slice was built and verified on the current Node LTS, **24.19.0**.

The project must declare:

```json
"engines": {
  "node": ">=22.11.0"
}
```

This means Node 22.11+.

Use npm **11** (verified on npm 11.17.0).

Pin these package versions exactly in `package.json`. Do not use `latest`, `^`, `~`, wildcard versions, or version ranges for these direct dependencies.

## Runtime dependencies

```text
next             16.3.5
react            19.3.0
react-dom        19.3.0
```

## Development dependencies

```text
typescript       6.0.3
@types/node      22.20.4
@types/react     19.3.0
@types/react-dom 19.3.0

@playwright/test 1.63.0

eslint           9.39.5
eslint-config-next 16.3.5

vitest           5.0.1
```

The exact versions above are intentional.

Do not silently upgrade them to a newer major/minor/patch during implementation.

`package-lock.json` must be generated with npm and committed so the complete dependency tree is reproducible.

Add:

```json
"private": true,
"packageManager": "npm@11.17.0"
```

---

# 2. Git initialization

The **first filesystem command** must be:

```bash
git init -b main
```

Do not create a commit yet.

Build the complete slice first.

---

# 3. Allowed repository structure

Create exactly these source/config files:

```text
.
├─ app/
│  ├─ layout.tsx
│  ├─ globals.css
│  ├─ page.tsx
│  ├─ not-found.tsx
│  ├─ category/
│  │  └─ [slug]/
│  │     └─ page.tsx
│  ├─ product/
│  │  └─ [slug]/
│  │     └─ page.tsx
│  └─ api/
│     └─ photos/
│        └─ route.ts
├─ components/
│  ├─ PageHeader.tsx
│  ├─ ProductCard.tsx
│  └─ StatePanel.tsx
├─ data/
│  └─ catalog.ts
├─ lib/
│  ├─ format.ts
│  └─ unsplash.ts
├─ tests/
│  ├─ smoke.spec.ts
│  └─ unsplash-route.test.ts
├─ .env.example
├─ .gitignore
├─ eslint.config.mjs
├─ next.config.ts
├─ playwright.config.ts
├─ vitest.config.ts
├─ tsconfig.json
├─ package.json
├─ package-lock.json
└─ README.md
```

The following are generated/tooling artifacts and are explicitly allowed:

```text
next-env.d.ts
node_modules/
.next/
playwright-report/
test-results/
.vitest/
coverage/
```

Do not create other source files.

Do not create `public/` unless it is absolutely required by Next.js itself. It is not required for this scaffold.

---

# 4. Package scripts

Use these exact scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test": "npm run test:unit && npm run test:e2e"
  }
}
```

Do **not** use:

```text
next lint
```

Next.js 16 uses the ESLint CLI directly.

Create `eslint.config.mjs` using the current flat-config `eslint-config-next` setup.

Use the Next.js Core Web Vitals configuration.

The lint configuration must cover:

```text
*.js
*.jsx
*.ts
*.tsx
```

and ignore generated artifacts such as:

```text
.next/
node_modules/
out/
build/
next-env.d.ts
playwright-report/
test-results/
.vitest/
coverage/
```

---

# 5. App Router requirements

Use the **Next.js App Router** only.

Do not create a `pages/` directory.

Follow the current Next.js 16 async route API shape.

For dynamic route parameters and search parameters, use the current promise-based types, for example:

```ts
type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ demoState?: string }>;
};
```

Do not use the old synchronous `params`/`searchParams` pattern.

---

# 6. Routes

Create exactly these application routes:

```text
/
 /category/home-goods
 /product/linen-desk-lamp
 /api/photos?query=...
```

The home page must deterministically redirect to:

```text
/category/home-goods
```

Use one exact redirect behavior. Do not merely provide a link.

Invalid category/product slugs must call `notFound()`.

`app/not-found.tsx` must use `PageHeader`.

---

# 7. Catalog data model

`data/catalog.ts` is the single source of truth.

Export:

```ts
export type Product = {
  slug: string;
  name: string;
  priceEUR: number;
  description: string;
  imageQuery: string;
  addedAt: string;
};

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  products: Product[];
};

export const catalog: Category[] = [
  // ...
];
```

Requirements:

* exactly **1** category
* exactly **4** products
* every category slug is unique
* every product slug is unique
* every product belongs to exactly one seeded category
* all `priceEUR` values are numbers
* all `addedAt` values are valid ISO dates
* all `imageQuery` values are non-empty strings

Use this exact seeded category:

```text
slug: home-goods
name: Home Goods
```

Use exactly these 4 product slugs:

```text
linen-desk-lamp
ceramic-table-vase
oak-storage-bench
wool-throw-blanket
```

The remaining product fields may contain simple realistic seed content.

Do not add a fifth product or second category.

---

# 8. PageHeader contract

Create:

```text
components/PageHeader.tsx
```

Every application page must use this component, including:

```text
home
category
product
not-found
```

The component must render:

1. an uppercase, letter-spaced eyebrow
2. an `<h1>`
3. one muted explanatory sentence

Use the same structural pattern on every page.

Do not duplicate the header markup in individual pages.

Give the header root:

```html
data-testid="page-header"
```

---

# 9. StatePanel contract

Create:

```text
components/StatePanel.tsx
```

It must support exactly these states:

```text
loading
empty
error
success
```

It must render:

```html
data-testid="state-panel"
data-state="loading|empty|error|success"
```

Requirements:

### Loading

Must communicate that content is loading.

A bare spinner is not acceptable.

### Empty

Must explicitly explain that no items/data are available and tell the user what to do next.

### Error

Must explicitly explain what failed.

Must provide a retry action.

For this scaffold, the retry action may be a normal link back to the success state.

### Success

Must render the requested content.

---

# 10. Deterministic state testing

The category and product pages must support a **test-only demonstration state** via:

```text
?demoState=loading
?demoState=empty
?demoState=error
?demoState=success
```

Example:

```text
/category/home-goods?demoState=empty
/product/linen-desk-lamp?demoState=error
```

Rules:

* default behavior is `success`
* normal navigation must never expose or link to `demoState`
* `demoState` is only a deterministic test/demo hook
* do not add visible UI controls for changing `demoState`
* no other demo/test query parameters are allowed

This makes all four required states directly testable without relying on timing, race conditions, or network failures.

---

# 11. Category list page

File:

```text
app/category/[slug]/page.tsx
```

For the seeded category:

```text
/category/home-goods
```

render:

* `PageHeader`
* category name
* category blurb
* exactly 4 `ProductCard` components in success state

Each `ProductCard` must link to its corresponding product detail page.

Every product card must have:

```html
data-testid="product-card"
```

The page must support all four `demoState` values through `StatePanel`.

For `success`, render the real catalog data.

For `empty`, render an empty-state panel.

For `error`, render an error-state panel with a retry action.

For `loading`, render a loading-state panel.

---

# 12. Product detail page

File:

```text
app/product/[slug]/page.tsx
```

For example:

```text
/product/linen-desk-lamp
```

The page must render:

* `PageHeader`
* product name
* description
* formatted price
* formatted added date
* photo area when photo data is available

The product content root must have:

```html
data-testid="product-detail"
```

The page must support all four `demoState` values through `StatePanel`.

Do not invent another product lookup source.

Use `data/catalog.ts` only.

---

# 13. Date formatting

File:

```text
lib/format.ts
```

Export:

```ts
export function money(value: number): string;
export function date(value: string): string;
```

Money must render exactly:

```text
12.50 EUR
```

Rules:

* exactly two decimals
* one space before `EUR`
* never use a currency symbol
* never format money inside a component
* never use `toLocaleString()` in a component

Date must render exactly:

```text
15 Sep 2026
```

Rules:

* day number
* one space
* 3-letter English month
* one space
* four-digit year
* no ordinals
* no slashes
* no locale-dependent output

Make date formatting deterministic and timezone-safe. ISO timestamps must not produce different displayed dates on different developer machines.

---

# 14. Unsplash architecture

The only external network service used by the application is Unsplash.

Do not add any other external API.

Create:

```text
lib/unsplash.ts
```

This module contains the server-side Unsplash implementation.

Both of these must use the same implementation:

```text
app/api/photos/route.ts
app/product/[slug]/page.tsx
```

The product page must **not** perform an HTTP self-request to its own `/api/photos` route.

The browser must never call the Unsplash API directly.

Do not expose the API key through:

```text
NEXT_PUBLIC_*
```

Do not put the Unsplash key in client code.

---

# 15. Unsplash environment variables

`.env.example` must contain exactly:

```text
CONTEXT7_API_KEY=        # https://context7.com/dashboard — used by the coding agent, not the site
UNSPLASH_ACCESS_KEY=     # https://unsplash.com/developers — server-side only
```

Do not put real values in `.env.example`.

`.env` must be git-ignored.

---

# 16. `/api/photos` contract

Create:

```text
app/api/photos/route.ts
```

It accepts:

```text
GET /api/photos?query=<imageQuery>
```

The `query` parameter is required.

Reject missing/blank query with:

```json
{
  "error": {
    "code": "invalid_query",
    "message": "A non-empty query is required."
  }
}
```

HTTP status:

```text
400
```

---

# 17. Unsplash upstream request

Call exactly:

```text
https://api.unsplash.com/search/photos
```

Use query parameters:

```text
query=<encoded query>
per_page=1
```

Use:

```text
Authorization: Client-ID ${UNSPLASH_ACCESS_KEY}
```

Also send:

```text
Accept-Version: v1
```

The request must use:

```ts
AbortSignal.timeout(5000)
```

No timeout greater than 5 seconds.

Do not send the API key anywhere except the Unsplash `Authorization` header.

Unsplash's documented Search Photos endpoint accepts `query` and `per_page`; use the first result only.

---

# 18. Missing key behavior

Read:

```ts
process.env.UNSPLASH_ACCESS_KEY
```

If it is missing or blank:

* do not call Unsplash
* do not throw
* return:

```json
{
  "error": {
    "code": "missing_key",
    "message": "UNSPLASH_ACCESS_KEY is not configured."
  }
}
```

HTTP status:

```text
500
```

---

# 19. Unsplash success response

For a successful first result, return:

```json
{
  "url": "https://images.unsplash.com/...",
  "alt": "descriptive text",
  "width": 1234,
  "height": 1234,
  "photographer": {
    "name": "Photographer Name",
    "url": "https://unsplash.com/@..."
  },
  "unsplashUrl": "https://unsplash.com/photos/..."
}
```

Requirements:

* `url` must come from the returned Unsplash image URL
* `width` must be a positive number
* `height` must be a positive number
* `alt` must be a non-empty descriptive string
* use the photo description when available
* otherwise use a meaningful fallback based on the search query
* photographer information must come from the Unsplash result
* `unsplashUrl` must come from the Unsplash photo link
* never fabricate photographer data

Do not return the raw upstream response.

Do not return unused Unsplash fields.

Unsplash requires proper photographer/Unsplash attribution and requires its returned image URLs to be directly used or embedded.

---

# 20. Unsplash failure contract

The route must never expose raw upstream errors.

Use these exact error codes/statuses:

| Condition                   | Code            | HTTP |
| --------------------------- | --------------- | ---: |
| blank/missing query         | `invalid_query` |  400 |
| missing API key             | `missing_key`   |  500 |
| request timeout             | `timeout`       |  504 |
| Unsplash non-2xx            | `upstream_http` |  502 |
| zero results                | `no_results`    |  404 |
| unexpected internal failure | `unexpected`    |  500 |

All failures use:

```json
{
  "error": {
    "code": "...",
    "message": "..."
  }
}
```

Never throw from the route handler for any of these cases.

Never return:

* raw Unsplash response bodies
* raw exception messages
* stack traces
* API keys
* authorization headers

---

# 21. Image rendering

Use Next.js `next/image`.

Allowed external host:

```text
images.unsplash.com
```

Configure `next.config.ts` with `images.remotePatterns`.

Use HTTPS.

Do not use the old `images.domains` configuration.

Next.js documents `remotePatterns` as the supported restrictive mechanism for external image hosts.

Every rendered external image must have:

```text
src
alt
width
height
```

Do not render a raw `<img>`.

Do not render an external image URL without explicit dimensions.

Do not hardcode fake Unsplash dimensions when real dimensions are available from the API.

---

# 22. Product photo behavior without an API key

The repository must build and the pages must render when:

```text
UNSPLASH_ACCESS_KEY
```

is absent.

The missing key must therefore be treated as an application-level photo failure, not as a build failure.

The product page must still render the catalog product information.

When no photo can be loaded, display a clear nonfatal image-unavailable state instead of crashing the page.

When a photo is available, render it with `next/image` and render the photographer/Unsplash attribution.

---

# 23. Caching/runtime behavior

The product detail route depends on runtime environment state and the external Unsplash request.

Do not make the product page statically depend on `UNSPLASH_ACCESS_KEY` during `next build`.

Use an appropriate dynamic/runtime configuration so the build does not make a real Unsplash request merely to prerender the product page.

The external Unsplash request itself must remain server-side.

---

# 24. Playwright configuration

Create:

```text
playwright.config.ts
```

Use:

```text
http://127.0.0.1:3000
```

as the base URL.

Configure `webServer` so `npm run test:e2e` can start the local Next.js server automatically.

Reuse an already-running server when appropriate.

Tests must not depend on the user manually starting a server first.

Use Chromium only for the smoke suite unless there is a specific reason to add more browsers.

Do not add visual regression testing.

---

# 25. Playwright acceptance tests

Create:

```text
tests/smoke.spec.ts
```

The E2E suite must verify all of the following.

## Category success

Open:

```text
/category/home-goods
```

Assert:

* HTTP response is successful
* `[data-testid="page-header"]` exists
* an `<h1>` exists
* `[data-testid="product-card"]` exists
* exactly 4 product cards render
* the first product card links to a `/product/...` URL

## Product success

Open:

```text
/product/linen-desk-lamp
```

Assert:

* HTTP response is successful
* `[data-testid="page-header"]` exists
* `[data-testid="product-detail"]` exists
* the product name is visible

## Category states

Test each:

```text
/category/home-goods?demoState=loading
/category/home-goods?demoState=empty
/category/home-goods?demoState=error
/category/home-goods?demoState=success
```

For every state assert:

```text
[data-testid="page-header"]
[data-testid="state-panel"]
```

and assert:

```text
[data-testid="state-panel"]@data-state
```

matches the expected state.

For error state, assert that a retry action exists.

## Product states

Test each:

```text
/product/linen-desk-lamp?demoState=loading
/product/linen-desk-lamp?demoState=empty
/product/linen-desk-lamp?demoState=error
/product/linen-desk-lamp?demoState=success
```

Again assert the exact `data-state`.

## Navigation

From the category success page:

* click the first product
* assert navigation to the product detail route
* assert `[data-testid="product-detail"]` exists

---

# 26. Unsplash route tests

Create:

```text
tests/unsplash-route.test.ts
```

Use Vitest.

These tests directly invoke the route handler and mock `fetch`.

Do not require a real Unsplash API key.

Test all of these:

1. missing query → `400 / invalid_query`
2. missing key → `500 / missing_key`
3. successful upstream response → `200` with the expected mapped response
4. zero results → `404 / no_results`
5. upstream non-2xx → `502 / upstream_http`
6. timeout/rejected fetch → `504 / timeout`
7. unexpected exception → `500 / unexpected`
8. upstream error body is not leaked
9. API key is not present in any response body
10. upstream request uses:

* `/search/photos`
* `query`
* `per_page=1`
* `Authorization: Client-ID ...`
* `Accept-Version: v1`
* a timeout signal created from `AbortSignal.timeout(5000)`

The success test must verify:

```text
url
alt
width
height
photographer.name
photographer.url
unsplashUrl
```

---

# 27. Vitest configuration

Create:

```text
vitest.config.ts
```

Run in Node environment.

Only include:

```text
tests/**/*.test.ts
```

Do not let Vitest execute Playwright `.spec.ts` files.

The unit suite must run once and exit.

---

# 28. README

Create a concise `README.md` containing:

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

Copy:

```text
.env.example
```

to:

```text
.env
```

and set:

```text
UNSPLASH_ACCESS_KEY
```

Explain that the site still renders without the key, but Unsplash photos will be unavailable.

## Run

```bash
npm run dev
```

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

Document the seeded URLs:

```text
/category/home-goods
/product/linen-desk-lamp
```

Document the development/test-only state hook:

```text
?demoState=loading
?demoState=empty
?demoState=error
?demoState=success
```

Do not document or advertise any other functionality.

---

# 29. `.gitignore`

Must ignore at minimum:

```text
.env
node_modules/
.next/
playwright-report/
test-results/
.vitest/
coverage/
```

Do not ignore:

```text
.env.example
package-lock.json
```

---

# 30. Definition of done

The slice is finished only when **every item below is true**.

## Dependency/version checks

`package.json` contains exactly the pinned direct versions specified in this prompt.

No direct dependency uses:

```text
latest
^
~
*
```

The installed package tree resolves successfully with:

```bash
npm install
```

The lockfile exists:

```text
package-lock.json
```

and is cleanly generated.

## Build

This succeeds:

```bash
npm run build
```

with exit code `0`.

## Typecheck

This succeeds:

```bash
npm run typecheck
```

with exit code `0` and no TypeScript errors.

## Lint

This succeeds:

```bash
npm run lint
```

with exit code `0`.

Do not use `next lint`.

## Unit tests

This succeeds:

```bash
npm run test:unit
```

with all Unsplash route tests passing.

## E2E tests

This succeeds:

```bash
npm run test:e2e
```

with all Playwright tests passing.

The test suite must start its own local server through `playwright.config.ts`.

## Combined test command

This succeeds:

```bash
npm run test
```

with exit code `0`.

## Runtime routes

The local Next.js server successfully serves:

```text
/
 /category/home-goods
 /product/linen-desk-lamp
```

## Home route

```text
/
```

redirects to exactly:

```text
/category/home-goods
```

## Catalog

Exactly:

```text
1 category
4 products
```

No additional catalog data.

## Page header

Every application page uses:

```text
components/PageHeader.tsx
```

including:

```text
not-found.tsx
```

## Four-state contract

Both the category page and product page have deterministic:

```text
loading
empty
error
success
```

states, and Playwright verifies all eight state URLs.

## Formatting

Money is rendered through:

```text
lib/format.ts → money()
```

and has the form:

```text
12.50 EUR
```

Dates are rendered through:

```text
lib/format.ts → date()
```

and have the form:

```text
15 Sep 2026
```

No component performs its own money/date formatting.

## Unsplash

With `UNSPLASH_ACCESS_KEY` configured:

```text
GET /api/photos?query=<query>
```

returns a successful mapped photo response from Unsplash.

Without the key, it returns:

```text
500
missing_key
```

and does not throw.

All upstream failures use the defined error envelope and never expose raw upstream errors.

The upstream request timeout is exactly:

```text
AbortSignal.timeout(5000)
```

## Security

The Unsplash access key is never:

* exposed through `NEXT_PUBLIC_*`
* rendered in HTML
* returned by `/api/photos`
* committed to Git

## Git-ignore verification

These commands must behave exactly as follows:

```bash
git check-ignore -v .env
```

must print the matching ignore rule.

```bash
git check-ignore -v .env.example
```

must produce no output; do not ignore `.env.example`.

Also verify:

```bash
git ls-files .env
```

prints nothing.

## Git history

Only after every preceding check is green:

```bash
git add .
git commit -m "chore: scaffold storefront vertical slice"
```

There must be exactly one commit:

```bash
git rev-list --count HEAD
```

must output:

```text
1
```

The active branch must be:

```text
main
```

Verify:

```bash
git branch --show-current
```

outputs:

```text
main
```

The repository must be clean:

```bash
git status --porcelain
```

must output nothing.

Do not create another commit.

Do not push.

Do not amend.

Do not create tags.

---

# 31. Final agent output

After the single commit is created, print only:

1. the source file tree created
2. the exact local run commands
3. the verification results
4. the commit hash

The verification section must explicitly state the exit status/results of:

```text
npm run build
npm run typecheck
npm run lint
npm run test
```

Do not claim a check passed unless it was actually executed and passed.

Stop after that single commit.
