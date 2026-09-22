"use client";

import { useEffect, useSyncExternalStore } from "react";
import PageHeader from "@/components/PageHeader";
import StatePanel from "@/components/StatePanel";
import { useCart } from "@/components/useCart";
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
} from "@/lib/orderStore";
import { money } from "@/lib/format";

export default function ConfirmationPage() {
  const { order, ready, error } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const { clear } = useCart();

  // Clear the cart exactly once, only when a real order is present. Updating the
  // cart store from an effect is the intended use of an effect (syncing an
  // external system), and the guard keeps it from firing on the empty state.
  useEffect(() => {
    if (ready && order) {
      clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, order]);

  const header = (
    <PageHeader
      eyebrow="Checkout"
      title="Order confirmed"
      lede="Thank you — here is a summary of what you ordered."
    />
  );

  if (!ready) {
    return (
      <>
        {header}
        <StatePanel
          state="loading"
          retryHref="/checkout/confirmation"
          subject="your order"
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        {header}
        <StatePanel
          state="error"
          retryHref="/checkout/confirmation"
          subject="your order"
        />
      </>
    );
  }

  if (!order) {
    return (
      <>
        {header}
        <StatePanel
          state="empty"
          retryHref="/category/home-goods"
          subject="a recent order"
          emptyTitle="No recent order"
          emptyBody="There is no order to show. Orders are not stored, so a confirmation can only be seen right after checkout."
          actionLabel="Start shopping"
        />
      </>
    );
  }

  return (
    <>
      {header}
      <StatePanel
        state="success"
        retryHref="/checkout/confirmation"
        subject="your order"
      >
        <p className="muted">
          Order <span data-testid="order-id">{order.orderId}</span>
        </p>
        <ul className="cart-lines">
          {order.lines.map((line) => (
            <li key={line.slug} className="cart-line" data-testid="confirm-line">
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
          Total paid:{" "}
          <span className="price" data-testid="confirm-total">
            {money(order.totalEUR)}
          </span>
        </p>
      </StatePanel>
    </>
  );
}
