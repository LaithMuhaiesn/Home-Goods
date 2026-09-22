// A tiny client-side cart store backed by localStorage, exposed through
// useSyncExternalStore. This avoids reading storage with a setState-in-effect
// (which ESLint's react-hooks/set-state-in-effect rightly flags) and needs no
// React context — any component can read the same cart.

import { addItem, removeItem, setQuantity, type CartItem } from "@/lib/cart";

const STORAGE_KEY = "cart:v1";

export type CartSnapshot = {
  items: CartItem[];
  /** False until storage has been read on the client (the loading state). */
  ready: boolean;
  /** True if reading persistent storage failed (the error state). */
  error: boolean;
};

let items: CartItem[] = [];
let ready = false;
let error = false;
let snapshot: CartSnapshot = { items, ready, error };
const SERVER_SNAPSHOT: CartSnapshot = { items: [], ready: false, error: false };
const listeners = new Set<() => void>();
let initialized = false;

function refresh() {
  snapshot = { items, ready, error };
}

function emit() {
  for (const listener of listeners) listener();
}

// Storage being unavailable (blocked/private mode) is an error; merely corrupt
// data is treated as an empty cart. So getItem may throw here — the caller
// catches it and flips the error flag — while parse failures degrade to [].
function readStorage(): CartItem[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        item &&
        typeof item.slug === "string" &&
        typeof item.quantity === "number",
    );
  } catch {
    return [];
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable (private mode, blocked) — the cart still works in memory.
  }
}

// Runs on the client only, from subscribe() — never during server render.
function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  try {
    items = readStorage();
    error = false;
  } catch {
    items = [];
    error = true;
  }
  ready = true;
  refresh();
}

function commit(next: CartItem[]) {
  items = next;
  refresh();
  persist();
  emit();
}

export function subscribe(listener: () => void): () => void {
  ensureInitialized();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): CartSnapshot {
  return snapshot;
}

export function getServerSnapshot(): CartSnapshot {
  return SERVER_SNAPSHOT;
}

export function addToCart(slug: string) {
  ensureInitialized();
  commit(addItem(items, slug));
}

export function setCartQuantity(slug: string, quantity: number) {
  ensureInitialized();
  commit(setQuantity(items, slug, quantity));
}

export function removeFromCart(slug: string) {
  ensureInitialized();
  commit(removeItem(items, slug));
}

export function clearCart() {
  ensureInitialized();
  commit([]);
}
