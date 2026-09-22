// Pure cart operations. No browser APIs here so the logic is unit-testable; the
// cart store owns persistence and React state.

import { getProduct } from "@/data/catalog";

export type CartItem = {
  slug: string;
  quantity: number;
};

export type CartLine = {
  slug: string;
  name: string;
  unitPriceEUR: number;
  quantity: number;
  lineTotalEUR: number;
};

/** Add one of `slug`. If it is already in the cart, increase its quantity. */
export function addItem(items: CartItem[], slug: string): CartItem[] {
  const existing = items.find((item) => item.slug === slug);
  if (existing) {
    return items.map((item) =>
      item.slug === slug ? { ...item, quantity: item.quantity + 1 } : item,
    );
  }
  return [...items, { slug, quantity: 1 }];
}

/** Set the quantity for `slug`. A quantity below 1 removes the line. */
export function setQuantity(
  items: CartItem[],
  slug: string,
  quantity: number,
): CartItem[] {
  if (!Number.isFinite(quantity) || quantity < 1) {
    return removeItem(items, slug);
  }
  const whole = Math.floor(quantity);
  return items.map((item) =>
    item.slug === slug ? { ...item, quantity: whole } : item,
  );
}

/** Remove the line for `slug` entirely. */
export function removeItem(items: CartItem[], slug: string): CartItem[] {
  return items.filter((item) => item.slug !== slug);
}

/** Total quantity of products across all lines. */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Resolve cart items to display lines using the catalogue as the source of truth
 * for names and prices. Items whose slug no longer exists in the catalogue are
 * dropped (they cannot be priced and would fail checkout validation anyway).
 */
export function resolveLines(items: CartItem[]): CartLine[] {
  const lines: CartLine[] = [];
  for (const item of items) {
    const found = getProduct(item.slug);
    if (!found) continue;
    lines.push({
      slug: item.slug,
      name: found.product.name,
      unitPriceEUR: found.product.priceEUR,
      quantity: item.quantity,
      lineTotalEUR: found.product.priceEUR * item.quantity,
    });
  }
  return lines;
}

/** Sum of the line totals. */
export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotalEUR, 0);
}
