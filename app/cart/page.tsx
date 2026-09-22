"use client";

import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatePanel from "@/components/StatePanel";
import { useCart } from "@/components/useCart";
import { resolveLines, cartTotal } from "@/lib/cart";
import { money } from "@/lib/format";

export default function CartPage() {
  const { items, ready, error, setQty, remove, clear } = useCart();

  const header = (
    <PageHeader
      eyebrow="Cart"
      title="Your cart"
      lede="Review your items and adjust quantities before checkout."
    />
  );

  if (!ready) {
    return (
      <>
        {header}
        <StatePanel state="loading" retryHref="/cart" subject="your cart" />
      </>
    );
  }

  if (error) {
    return (
      <>
        {header}
        <StatePanel state="error" retryHref="/cart" subject="your cart" />
      </>
    );
  }

  const lines = resolveLines(items);

  if (lines.length === 0) {
    return (
      <>
        {header}
        <StatePanel
          state="empty"
          retryHref="/category/home-goods"
          subject="items"
          emptyTitle="Your cart is empty"
          emptyBody="You haven't added anything yet. Browse a category to get started."
          actionLabel="Start shopping"
        />
      </>
    );
  }

  const total = cartTotal(lines);

  return (
    <>
      {header}
      <StatePanel state="success" retryHref="/cart" subject="items">
        <ul className="cart-lines">
          {lines.map((line) => (
            <li key={line.slug} className="cart-line" data-testid="cart-line">
              <div className="cart-line-main">
                <span className="cart-line-name">{line.name}</span>
                <span className="muted">{money(line.unitPriceEUR)} each</span>
              </div>
              <label className="cart-qty">
                <span className="cart-qty-label">Quantity</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={line.quantity}
                  aria-label={`Quantity for ${line.name}`}
                  data-testid="qty-input"
                  onChange={(event) =>
                    setQty(line.slug, Number(event.target.value))
                  }
                />
              </label>
              <span className="cart-line-total price" data-testid="line-total">
                {money(line.lineTotalEUR)}
              </span>
              <button
                type="button"
                className="link-btn"
                aria-label={`Remove ${line.name}`}
                data-testid="remove-line"
                onClick={() => remove(line.slug)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <div className="cart-footer">
          <p className="cart-total">
            Total: <span className="price" data-testid="cart-total">{money(total)}</span>
          </p>
          <div className="cart-actions">
            <button
              type="button"
              className="link-btn"
              data-testid="empty-cart"
              onClick={() => clear()}
            >
              Empty cart
            </button>
            <Link className="btn" href="/checkout" data-testid="checkout-link">
              Proceed to checkout
            </Link>
          </div>
        </div>
      </StatePanel>
    </>
  );
}
