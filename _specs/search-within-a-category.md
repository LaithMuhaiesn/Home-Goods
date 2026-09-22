# Search Within A Category

| | |
|---|---|
| **Slug** | `search-within-a-category` |
| **Branch** | `claude/feature/search-within-a-category` |
| **Status** | Draft |
| **Created** | 2026-09-22 |

## 1. Summary

Add a search box to each category page that filters that category's products as
the shopper types. Search is scoped to the current category only, is reflected in
the URL so a result set can be shared or reloaded, and has a clear empty state
when nothing matches.

## 2. Problem

A category can hold enough products that scanning the whole grid is tedious, and
the only way to narrow it today is to read every card. Shoppers who already know
roughly what they want — "lamp", "board" — have no way to say so. There is no
cross-category search need yet; the friction is entirely within a single
category's list.

## 3. Goals and non-goals

**Goals**

- Let a shopper narrow the current category's products by a text query.
- Keep the result set in the URL so it survives reload and can be shared.
- Give a helpful empty state when a query matches nothing.

**Non-goals**

- Global search across all categories.
- Fuzzy matching, typo tolerance, ranking, or search suggestions.
- Searching product fields a shopper cannot see (e.g. internal identifiers).
- A dedicated search results page separate from the category page.

## 4. User stories

- As a shopper, I want to type into a search box on a category page, so that I
  only see the products whose name or description matches.
- As a shopper, I want the address bar to reflect my search, so that I can reload
  or share the filtered view.
- As a shopper who searches for something absent, I want to be told plainly that
  nothing matched and how to clear the search, so that I am not left staring at an
  empty grid.

## 5. User experience

**Entry point** — The existing category page (`/category/<slug>`). The search box
sits directly beneath the page header, above the product grid.

**Main flow**

1. The shopper opens a category page and sees all its products.
2. They type a query into the search box.
3. The grid narrows to the products whose name or description contains the query,
   case-insensitively.
4. The URL updates to carry the query so the view can be reloaded or shared.

**States**

| State | Behaviour |
|---|---|
| Loading | Not applicable to the local catalog data; the grid renders immediately. Retained in the shared state component for consistency. |
| Empty | No product in this category matches the query. Show a message naming the query and a control to clear the search and see all products again. |
| Error | An invalid category slug is a not-found, not an error. The error state remains available through the shared component but is not expected on this page. |
| Success | The matching products render in the grid; a count of matches is shown. |

**Interaction details** — Matching is case-insensitive and ignores leading and
trailing whitespace. An empty query shows the full category, unchanged. Clearing
the search returns to the full category and removes the query from the URL.
Navigating to another category does not carry the previous query.

**Accessibility** — The search box has a visible, associated label. The result
count updates in a way assistive technology can announce, so a screen-reader user
knows the grid changed after typing.

## 6. Interface contract

No new client/server boundary is introduced. Search runs against the catalog data
already available to the category page; the query travels as a URL query
parameter (`q`) on the existing category route. No new endpoint or handler.

| Operation | Trigger | Purpose | Success result |
|---|---|---|---|
| Filter category | Shopper edits the search box | Narrow the visible products | Category page renders only matching products |

**Inputs**

| Field | Type | Required | Rules |
|---|---|---|---|
| `q` | string (URL query param) | No | Trimmed; case-insensitive; empty or absent means "no filter" |

**Outputs**

| Field | Type | Notes |
|---|---|---|
| Filtered product list | derived view | A subset of the current category's products |
| Match count | number | How many products matched |

**Errors**

| Condition | Status / code | What the user sees |
|---|---|---|
| Unknown category slug | not found (existing behaviour) | The existing not-found page |
| No products match `q` | not an error | The empty state described above |

## 7. Data model

No change. Search reads the existing `Category.products` from `data/catalog.ts`.

**New or changed records** — None.

**Access patterns** — Filter a single category's in-memory product list by a
substring of `name` or `description`.

**Migration impact** — None.

**Retention and growth** — None.

## 8. Validation rules

| Rule | Message | Enforced |
|---|---|---|
| `q` is trimmed before matching | — | Server |
| An empty or whitespace-only `q` is treated as no filter | — | Server |

## 9. Background and scheduled work

None.

## 10. Security and access

The category page is open to anyone who can reach the site. The `q` value is used
only to filter in-memory data and is rendered back to the shopper as text; it must
be treated as untrusted display content and never used to build a query against an
external system. No new data is exposed.

## 11. Performance and scale

The catalog is a small committed module and each category holds a handful of
products, so filtering is trivial and happens in memory. No paging is required at
this scale.

## 12. Testing

**Integration** — Opening a category with a `q` that matches renders only the
matching products; a `q` that matches nothing renders the empty state; no `q`
renders the full category.

**Unit** — The matching helper: case-insensitivity, whitespace trimming, matching
on both name and description, and empty-query-means-all.

**Frontend** — Typing in the search box updates the grid and the URL; clearing it
restores the full category.

**Manual** — The result count is announced to assistive technology after typing.

## 13. Acceptance criteria

- [ ] A search box appears beneath the header on every category page.
- [ ] Typing filters the grid to products whose name or description contains the
      query, case-insensitively and ignoring surrounding whitespace.
- [ ] The query is reflected in the URL as `q`, and reloading that URL reproduces
      the same filtered view.
- [ ] An empty query (or none) shows the full category.
- [ ] When nothing matches, the empty state names the query and offers a way to
      clear the search.
- [ ] Search never leaks products from other categories.
- [ ] A visible count of matching products is shown and updates as the query
      changes.

## 14. Open questions

| Question | Options | Owner |
|---|---|---|
| Should the description be searched, or only the name? | Name only (stricter) / name + description (more forgiving) | Product |
| Should the match count be shown always, or only while a query is active? | Always / only when filtering | Product |

## 15. Out of scope and follow-ups

- Global, cross-category search.
- Ranking, fuzzy matching, and search suggestions.
- Highlighting the matched substring within a card.
