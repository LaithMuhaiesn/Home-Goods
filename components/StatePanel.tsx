import Link from "next/link";

export type PanelState = "loading" | "empty" | "error" | "success";

export function isPanelState(value: string | undefined): value is PanelState {
  return (
    value === "loading" ||
    value === "empty" ||
    value === "error" ||
    value === "success"
  );
}

export type StatePanelProps = {
  state: PanelState;
  /** Where the retry / call-to-action link points (defaults to the same page in success). */
  retryHref: string;
  /** What the user was trying to see, used in empty/error copy. */
  subject: string;
  /** Optional overrides for the empty state (e.g. a "no search matches" case). */
  emptyTitle?: string;
  emptyBody?: string;
  actionLabel?: string;
  /** Shown in the success state. */
  children?: React.ReactNode;
};

/**
 * The four required list/detail states. Success renders children; the other
 * three render explanatory copy. Loading is never a bare spinner; empty says
 * what to do next; error says what failed and offers a retry.
 */
export default function StatePanel({
  state,
  retryHref,
  subject,
  emptyTitle,
  emptyBody,
  actionLabel,
  children,
}: StatePanelProps) {
  if (state === "success") {
    return (
      <div data-testid="state-panel" data-state="success">
        {children}
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="state" data-testid="state-panel" data-state="loading">
        <h2>Loading {subject}…</h2>
        <p>Fetching the latest items. This should only take a moment.</p>
        <div className="bar" style={{ width: "70%" }} />
        <div className="bar" style={{ width: "90%" }} />
        <div className="bar" style={{ width: "55%" }} />
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="state" data-testid="state-panel" data-state="empty">
        <h2>{emptyTitle ?? "Nothing here yet"}</h2>
        <p>
          {emptyBody ??
            `There are no ${subject} to show. Add a category or check back once items have been published.`}
        </p>
        <Link className="btn" href={retryHref} data-testid="empty-action">
          {actionLabel ?? `Back to ${subject}`}
        </Link>
      </div>
    );
  }

  // error
  return (
    <div className="state" data-testid="state-panel" data-state="error">
      <h2>Something went wrong</h2>
      <p>
        We couldn&apos;t load {subject}. The request failed before it finished.
      </p>
      <Link className="btn" href={retryHref} data-testid="retry">
        Try again
      </Link>
    </div>
  );
}
