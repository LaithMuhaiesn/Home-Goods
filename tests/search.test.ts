import { describe, expect, it } from "vitest";
import { filterProducts } from "@/lib/search";
import type { Product } from "@/data/catalog";

const products: Product[] = [
  {
    slug: "oak-storage-bench",
    name: "Oak Storage Bench",
    priceEUR: 245,
    description: "A solid oak entry bench with a lift-top compartment.",
    imageQuery: "oak storage bench",
    addedAt: "2026-09-10",
  },
  {
    slug: "linen-desk-lamp",
    name: "Linen Desk Lamp",
    priceEUR: 89,
    description: "A warm task lamp with a woven linen shade.",
    imageQuery: "linen desk lamp",
    addedAt: "2026-09-01",
  },
  {
    slug: "wool-throw-blanket",
    name: "Wool Throw Blanket",
    priceEUR: 68,
    description: "A lambswool throw with a fringed edge.",
    imageQuery: "wool throw blanket",
    addedAt: "2026-09-15",
  },
];

describe("filterProducts", () => {
  it("returns every product for an empty query", () => {
    expect(filterProducts(products, "")).toHaveLength(3);
  });

  it("returns every product for a whitespace-only query", () => {
    expect(filterProducts(products, "   ")).toHaveLength(3);
  });

  it("matches on the product name, case-insensitively", () => {
    const result = filterProducts(products, "LAMP");
    expect(result.map((p) => p.slug)).toEqual(["linen-desk-lamp"]);
  });

  it("matches on the description when the name does not contain the query", () => {
    const result = filterProducts(products, "lambswool");
    expect(result.map((p) => p.slug)).toEqual(["wool-throw-blanket"]);
  });

  it("trims surrounding whitespace before matching", () => {
    const result = filterProducts(products, "  oak  ");
    expect(result.map((p) => p.slug)).toEqual(["oak-storage-bench"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterProducts(products, "zzzz")).toEqual([]);
  });
});
