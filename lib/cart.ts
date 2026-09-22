// Pure cart operations. No browser APIs here so the logic is unit-testable; the
// CartProvider owns persistence and React state.

export type CartItem = {
  slug: string;
  quantity: number;
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
