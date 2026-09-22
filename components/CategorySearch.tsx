"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId } from "react";

/**
 * A labelled search box that keeps the query in the URL as `?q=...` so the server
 * component re-renders the filtered grid, and the view stays shareable/reloadable.
 *
 * Progressive enhancement: it is a real GET form, so pressing Enter narrows the
 * results even before hydration or with JavaScript disabled. When hydrated, the
 * `onChange` handler filters live as the shopper types (and onSubmit keeps that
 * path client-side instead of a full reload).
 */
export default function CategorySearch({
  placeholder,
}: {
  placeholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputId = useId();

  const current = searchParams.get("q") ?? "";

  function setQuery(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim() === "") {
      params.delete("q");
    } else {
      params.set("q", value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <form
      className="search"
      role="search"
      action={pathname}
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get("q");
        setQuery(typeof value === "string" ? value : "");
      }}
    >
      <label htmlFor={inputId} className="search-label">
        Search this category
      </label>
      <input
        id={inputId}
        name="q"
        type="search"
        className="search-input"
        defaultValue={current}
        placeholder={placeholder}
        onChange={(event) => setQuery(event.target.value)}
        data-testid="category-search"
      />
    </form>
  );
}
