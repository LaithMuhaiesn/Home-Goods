// Pure checkout validation and order calculation. The route handler is a thin
// wrapper around validateOrder; keeping the logic here makes it unit-testable and
// guarantees prices/totals are computed from the catalogue, never from the client.

import { resolveLines, cartTotal, type CartItem, type CartLine } from "@/lib/cart";
import { getProduct } from "@/data/catalog";

export type CheckoutInput = {
  items: { slug: string; quantity: number }[];
  fullName: string;
  email: string;
  address: string;
};

export type Order = {
  orderId: string;
  lines: CartLine[];
  totalEUR: number;
};

export type CheckoutErrorCode =
  | "empty_cart"
  | "invalid_item"
  | "invalid_quantity"
  | "invalid_details"
  | "unexpected";

export type CheckoutErrorBody = {
  error: { code: CheckoutErrorCode; message: string };
};

export type CheckoutResult =
  | { ok: true; order: Order }
  | { ok: false; status: number; body: CheckoutErrorBody };

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_SHAPE.test(email.trim());
}

function fail(
  status: number,
  code: CheckoutErrorCode,
  message: string,
): CheckoutResult {
  return { ok: false, status, body: { error: { code, message } } };
}

function defaultOrderId(): string {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${time}-${rand}`;
}

/**
 * Validate a checkout submission and compute the authoritative order. Prices and
 * totals always come from the catalogue; any price a client might send is ignored
 * because the input shape carries only slug and quantity. Never throws.
 */
export function validateOrder(
  input: CheckoutInput,
  makeOrderId: () => string = defaultOrderId,
): CheckoutResult {
  const items = Array.isArray(input?.items) ? input.items : [];

  if (items.length === 0) {
    return fail(400, "empty_cart", "Your cart is empty.");
  }

  for (const item of items) {
    if (!item || typeof item.slug !== "string" || !getProduct(item.slug)) {
      return fail(
        400,
        "invalid_item",
        "An item in your cart is no longer available.",
      );
    }
  }

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return fail(400, "invalid_quantity", "A quantity was invalid.");
    }
  }

  const name = (input.fullName ?? "").trim();
  const email = (input.email ?? "").trim();
  const address = (input.address ?? "").trim();
  if (name === "" || address === "" || !isValidEmail(email)) {
    return fail(
      400,
      "invalid_details",
      "Please provide a valid name, email and delivery address.",
    );
  }

  const lines = resolveLines(items as CartItem[]);
  const totalEUR = cartTotal(lines);
  return { ok: true, order: { orderId: makeOrderId(), lines, totalEUR } };
}
