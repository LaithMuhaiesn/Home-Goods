---
description: Add a new category and at least four plausible products to data/catalog.ts, typecheck, and stop with a diff to review (does not commit).
argument-hint: [category name]
allowed-tools: Read, Edit, Bash(git status:*), Bash(git diff:*), Bash(npm run typecheck:*)
---

Add a new category called **$ARGUMENTS** to this storefront's catalog.

## Guard (do this first)
Run `git status --porcelain`. If it prints anything, the working tree is dirty —
**stop immediately** and tell the user to commit or stash first. Do not edit any
file. This is the same guard the lifecycle commands use: the output must be a
clean, reviewable diff, and that is only possible from a clean tree.

## Steps (only if the tree is clean)
1. Read `data/catalog.ts` to confirm the current shape and existing slugs.
2. Append one new `Category` to the `catalog` array:
   - `slug`: a url-safe, lowercase, hyphenated slug derived from **$ARGUMENTS**,
     unique among existing categories.
   - `name`: **$ARGUMENTS**.
   - `blurb`: one plausible sentence.
   - `products`: **at least four** plausible items, each with every required field
     from the data shape:
     - `slug` (url-safe, unique across all products),
     - `name`,
     - `priceEUR` (a number, two-decimal-friendly, e.g. `24.99`),
     - `description` (one sentence),
     - `imageQuery` (a non-empty search term describing the item — this is the
       placeholder image; the product page resolves it through the Unsplash route,
       which satisfies the house image rules),
     - `addedAt` (a valid ISO date string).
3. Run `npm run typecheck` and make sure it passes.
4. **Stop without committing.** Show the result with `git diff` and hand it back
   to the user to review. Do not run `git add` or `git commit` — you are not
   permitted to, and the human reviews the diff before it lands (exactly as the
   kit's /commit refused to bundle work it could not account for).
