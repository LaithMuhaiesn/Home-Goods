// Holds the most recent placed order for the confirmation page. Written by the
// checkout on success and read by the confirmation via useSyncExternalStore, so it
// survives client-side navigation and (via sessionStorage) a reload. It is never
// addressable by order id — losing this state means the confirmation is gone,
// which matches the spec's "orders are not persisted".

import type { Order } from "@/lib/checkout";

const STORAGE_KEY = "order:last";

export type OrderSnapshot = {
  order: Order | null;
  /** False until sessionStorage has been read on the client (loading). */
  ready: boolean;
  /** True if reading persistent storage failed (the error state). */
  error: boolean;
};

let order: Order | null = null;
let ready = false;
let error = false;
let snapshot: OrderSnapshot = { order, ready, error };
const SERVER_SNAPSHOT: OrderSnapshot = {
  order: null,
  ready: false,
  error: false,
};
const listeners = new Set<() => void>();
let initialized = false;

function refresh() {
  snapshot = { order, ready, error };
}

function emit() {
  for (const listener of listeners) listener();
}

// getItem may throw if storage is unavailable — the caller catches it and flips
// the error flag; corrupt data degrades to "no order".
function read(): Order | null {
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  try {
    order = read();
    error = false;
  } catch {
    order = null;
    error = true;
  }
  ready = true;
  refresh();
}

export function subscribe(listener: () => void): () => void {
  ensureInitialized();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): OrderSnapshot {
  return snapshot;
}

export function getServerSnapshot(): OrderSnapshot {
  return SERVER_SNAPSHOT;
}

export function setLastOrder(next: Order) {
  ensureInitialized();
  order = next;
  ready = true;
  error = false;
  refresh();
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable — the in-memory value still carries the confirmation
    // for this navigation.
  }
  emit();
}
