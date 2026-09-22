import { describe, expect, it } from "vitest";
import { validateOrder, type CheckoutInput } from "@/lib/checkout";

const fixedId = () => "ORD-TEST";

const validDetails = {
  fullName: "Test User",
  email: "test@example.com",
  address: "1 Test Street",
};

describe("validateOrder", () => {
  it("computes an order from the catalogue for a valid submission", () => {
    const input: CheckoutInput = {
      items: [
        { slug: "linen-desk-lamp", quantity: 1 },
        { slug: "ceramic-table-vase", quantity: 2 },
      ],
      ...validDetails,
    };
    const result = validateOrder(input, fixedId);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.order.orderId).toBe("ORD-TEST");
      expect(result.order.totalEUR).toBe(174);
      expect(result.order.lines).toHaveLength(2);
    }
  });

  it("rejects an empty cart", () => {
    const result = validateOrder({ items: [], ...validDetails }, fixedId);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.body.error.code).toBe("empty_cart");
    }
  });

  it("rejects an unknown product", () => {
    const result = validateOrder(
      { items: [{ slug: "nope", quantity: 1 }], ...validDetails },
      fixedId,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.body.error.code).toBe("invalid_item");
  });

  it("rejects a non-whole or below-1 quantity", () => {
    const half = validateOrder(
      { items: [{ slug: "linen-desk-lamp", quantity: 1.5 }], ...validDetails },
      fixedId,
    );
    expect(half.ok).toBe(false);
    if (!half.ok) expect(half.body.error.code).toBe("invalid_quantity");

    const zero = validateOrder(
      { items: [{ slug: "linen-desk-lamp", quantity: 0 }], ...validDetails },
      fixedId,
    );
    expect(zero.ok).toBe(false);
    if (!zero.ok) expect(zero.body.error.code).toBe("invalid_quantity");
  });

  it("rejects invalid contact details", () => {
    const badEmail = validateOrder(
      {
        items: [{ slug: "linen-desk-lamp", quantity: 1 }],
        fullName: "A",
        email: "not-an-email",
        address: "1 St",
      },
      fixedId,
    );
    expect(badEmail.ok).toBe(false);
    if (!badEmail.ok) expect(badEmail.body.error.code).toBe("invalid_details");

    const emptyName = validateOrder(
      {
        items: [{ slug: "linen-desk-lamp", quantity: 1 }],
        fullName: "   ",
        email: "a@b.co",
        address: "1 St",
      },
      fixedId,
    );
    expect(emptyName.ok).toBe(false);
    if (!emptyName.ok) expect(emptyName.body.error.code).toBe("invalid_details");
  });

  it("ignores any client-supplied price and totals from the catalogue only", () => {
    const input = {
      items: [
        // Extra fields a tampered client might send — must be ignored.
        { slug: "linen-desk-lamp", quantity: 1, unitPriceEUR: 1, lineTotalEUR: 1 },
      ],
      ...validDetails,
    } as unknown as CheckoutInput;
    const result = validateOrder(input, fixedId);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.order.totalEUR).toBe(89);
      expect(result.order.lines[0].unitPriceEUR).toBe(89);
    }
  });
});
