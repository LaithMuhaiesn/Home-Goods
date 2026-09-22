"use client";

import { useCart } from "@/components/useCart";

export default function AddToCartButton({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const { add } = useCart();
  return (
    <button
      type="button"
      className="btn"
      onClick={() => add(slug)}
      data-testid="add-to-cart"
      aria-label={`Add ${name} to cart`}
    >
      Add to cart
    </button>
  );
}
