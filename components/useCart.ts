"use client";

import { useSyncExternalStore } from "react";
import { cartCount } from "@/lib/cart";
import {
  addToCart,
  clearCart,
  getServerSnapshot,
  getSnapshot,
  removeFromCart,
  setCartQuantity,
  subscribe,
} from "@/lib/cartStore";

/**
 * Read the shared cart and its mutators. Backed by a module store via
 * useSyncExternalStore, so every component sees the same cart with no provider.
 */
export function useCart() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    items: snapshot.items,
    ready: snapshot.ready,
    error: snapshot.error,
    count: cartCount(snapshot.items),
    add: addToCart,
    setQty: setCartQuantity,
    remove: removeFromCart,
    clear: clearCart,
  };
}
