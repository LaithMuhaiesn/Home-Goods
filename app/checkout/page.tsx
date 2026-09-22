"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatePanel from "@/components/StatePanel";
import { useCart } from "@/components/useCart";
import { resolveLines, cartTotal } from "@/lib/cart";
import { isValidEmail } from "@/lib/checkout";
import { money } from "@/lib/format";

type FieldErrors = {
  fullName?: string;
  email?: string;
  address?: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, ready } = useCart();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const header = (
    <PageHeader
      eyebrow="Checkout"
      title="Checkout"
      lede="Enter your delivery details to place the order."
    />
  );

  if (!ready) {
    return (
      <>
        {header}
        <StatePanel state="loading" retryHref="/checkout" subject="checkout" />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        {header}
        <StatePanel
          state="empty"
          retryHref="/category/home-goods"
          subject="items"
          emptyTitle="Your cart is empty"
          emptyBody="There is nothing to check out. Add something to your cart first."
          actionLabel="Start shopping"
        />
      </>
    );
  }

  const lines = resolveLines(items);
  const total = cartTotal(lines);

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (fullName.trim() === "") errors.fullName = "Please enter your name.";
    if (!isValidEmail(email)) errors.email = "Please enter a valid email.";
    if (address.trim() === "")
      errors.address = "Please enter a delivery address.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, fullName, email, address }),
      });
      const data = await response.json();

      if (response.ok) {
        try {
          window.sessionStorage.setItem("order:last", JSON.stringify(data));
        } catch {
          // If storage is unavailable the confirmation will show its empty state.
        }
        router.push("/checkout/confirmation");
        return;
      }

      const code = data?.error?.code;
      if (code === "invalid_details") {
        setFormError("Please check your details and try again.");
      } else if (code === "empty_cart" || code === "invalid_item" || code === "invalid_quantity") {
        setFormError(
          "Something changed in your cart. Please review it and try again.",
        );
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } catch {
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {header}

      <section aria-label="Order summary" className="checkout-summary">
        <h2 className="checkout-subhead">Order summary</h2>
        <ul className="cart-lines">
          {lines.map((line) => (
            <li key={line.slug} className="cart-line" data-testid="summary-line">
              <span className="cart-line-main">
                <span className="cart-line-name">{line.name}</span>
                <span className="muted">
                  {line.quantity} × {money(line.unitPriceEUR)}
                </span>
              </span>
              <span className="cart-line-total price">
                {money(line.lineTotalEUR)}
              </span>
            </li>
          ))}
        </ul>
        <p className="cart-total">
          Total:{" "}
          <span className="price" data-testid="checkout-total">
            {money(total)}
          </span>
        </p>
      </section>

      {submitting ? (
        <StatePanel state="loading" retryHref="/checkout" subject="your order" />
      ) : (
        <form className="checkout-form" onSubmit={onSubmit} data-testid="checkout-form" noValidate>
          <h2 className="checkout-subhead">Delivery details</h2>

          <label className="field">
            <span className="field-label">Full name</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              data-testid="field-fullName"
              aria-invalid={Boolean(fieldErrors.fullName)}
            />
            {fieldErrors.fullName && (
              <span className="field-error" data-testid="error-fullName">
                {fieldErrors.fullName}
              </span>
            )}
          </label>

          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="field-email"
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && (
              <span className="field-error" data-testid="error-email">
                {fieldErrors.email}
              </span>
            )}
          </label>

          <label className="field">
            <span className="field-label">Delivery address</span>
            <textarea
              value={address}
              rows={3}
              onChange={(e) => setAddress(e.target.value)}
              data-testid="field-address"
              aria-invalid={Boolean(fieldErrors.address)}
            />
            {fieldErrors.address && (
              <span className="field-error" data-testid="error-address">
                {fieldErrors.address}
              </span>
            )}
          </label>

          {formError && (
            <p className="field-error" role="alert" data-testid="checkout-error">
              {formError}
            </p>
          )}

          <div className="checkout-actions">
            <Link className="link-btn" href="/cart">
              Back to cart
            </Link>
            <button type="submit" className="btn" data-testid="place-order">
              Place order
            </button>
          </div>
        </form>
      )}
    </>
  );
}
