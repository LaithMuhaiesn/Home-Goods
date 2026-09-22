import { describe, expect, it } from "vitest";
import {
  addItem,
  cartCount,
  cartTotal,
  removeItem,
  resolveLines,
  setQuantity,
  type CartItem,
} from "@/lib/cart";

describe("cart operations", () => {
  it("adds a new product as a line of quantity 1", () => {
    expect(addItem([], "linen-desk-lamp")).toEqual([
      { slug: "linen-desk-lamp", quantity: 1 },
    ]);
  });

  it("increments quantity when adding an existing product", () => {
    const once = addItem([], "linen-desk-lamp");
    const twice = addItem(once, "linen-desk-lamp");
    expect(twice).toEqual([{ slug: "linen-desk-lamp", quantity: 2 }]);
  });

  it("sets a whole-number quantity", () => {
    const items: CartItem[] = [{ slug: "linen-desk-lamp", quantity: 1 }];
    expect(setQuantity(items, "linen-desk-lamp", 4)).toEqual([
      { slug: "linen-desk-lamp", quantity: 4 },
    ]);
  });

  it("removes the line when quantity drops below 1", () => {
    const items: CartItem[] = [{ slug: "linen-desk-lamp", quantity: 1 }];
    expect(setQuantity(items, "linen-desk-lamp", 0)).toEqual([]);
  });

  it("removes a line by slug", () => {
    const items: CartItem[] = [
      { slug: "linen-desk-lamp", quantity: 1 },
      { slug: "ceramic-table-vase", quantity: 2 },
    ];
    expect(removeItem(items, "linen-desk-lamp")).toEqual([
      { slug: "ceramic-table-vase", quantity: 2 },
    ]);
  });

  it("counts total quantity across lines", () => {
    expect(
      cartCount([
        { slug: "linen-desk-lamp", quantity: 1 },
        { slug: "ceramic-table-vase", quantity: 2 },
      ]),
    ).toBe(3);
  });
});

describe("resolveLines and cartTotal", () => {
  it("resolves names and prices from the catalogue and computes line totals", () => {
    const lines = resolveLines([
      { slug: "linen-desk-lamp", quantity: 1 },
      { slug: "ceramic-table-vase", quantity: 2 },
    ]);
    expect(lines).toEqual([
      {
        slug: "linen-desk-lamp",
        name: "Linen Desk Lamp",
        unitPriceEUR: 89,
        quantity: 1,
        lineTotalEUR: 89,
      },
      {
        slug: "ceramic-table-vase",
        name: "Ceramic Table Vase",
        unitPriceEUR: 42.5,
        quantity: 2,
        lineTotalEUR: 85,
      },
    ]);
    expect(cartTotal(lines)).toBe(174);
  });

  it("drops items whose slug is not in the catalogue", () => {
    const lines = resolveLines([{ slug: "does-not-exist", quantity: 3 }]);
    expect(lines).toEqual([]);
  });
});
