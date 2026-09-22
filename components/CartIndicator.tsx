"use client";

import Link from "next/link";
import { useCart } from "@/components/useCart";

export default function CartIndicator() {
  const { count, ready } = useCart();
  // Show a stable label until the cart is read from storage, to avoid a
  // hydration mismatch and a flash of a wrong count.
  const label = ready ? `Cart (${count})` : "Cart";

  return (
    <Link href="/cart" className="cart-indicator" data-testid="cart-indicator">
      <span aria-live="polite" data-testid="cart-count">
        {label}
      </span>
    </Link>
  );
}
