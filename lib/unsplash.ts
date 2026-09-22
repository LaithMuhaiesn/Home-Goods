// Server-side Unsplash implementation. Shared by the /api/photos route handler
// and the product detail page so neither the browser nor a self-HTTP request is
// ever involved, and the access key stays on the server.

export type Photo = {
  url: string;
  alt: string;
  width: number;
  height: number;
  photographer: {
    name: string;
    url: string;
  };
  unsplashUrl: string;
};

export type PhotoErrorCode =
  | "invalid_query"
  | "missing_key"
  | "timeout"
  | "upstream_http"
  | "no_results"
  | "unexpected";

export type PhotoErrorBody = {
  error: {
    code: PhotoErrorCode;
    message: string;
  };
};

export type PhotoResult =
  | { ok: true; photo: Photo }
  | { ok: false; status: number; body: PhotoErrorBody };

const UNSPLASH_ENDPOINT = "https://api.unsplash.com/search/photos";
const TIMEOUT_MS = 5000;

function fail(
  status: number,
  code: PhotoErrorCode,
  message: string,
): PhotoResult {
  return { ok: false, status, body: { error: { code, message } } };
}

type UnsplashResult = {
  urls?: { regular?: string; full?: string; raw?: string };
  description?: string | null;
  alt_description?: string | null;
  width?: number;
  height?: number;
  links?: { html?: string };
  user?: { name?: string; links?: { html?: string } };
};

function mapPhoto(result: UnsplashResult, query: string): Photo {
  const url = result.urls?.regular ?? result.urls?.full ?? result.urls?.raw;
  const width = result.width;
  const height = result.height;
  const photographerName = result.user?.name;
  const photographerUrl = result.user?.links?.html;
  const unsplashUrl = result.links?.html;

  if (
    !url ||
    typeof width !== "number" ||
    width <= 0 ||
    typeof height !== "number" ||
    height <= 0 ||
    !photographerName ||
    !photographerUrl ||
    !unsplashUrl
  ) {
    // Missing fields we require — treated as an unexpected upstream shape by
    // the caller's outer catch. Never fabricate photographer data.
    throw new Error("unexpected_upstream_shape");
  }

  const alt =
    (result.description && result.description.trim()) ||
    (result.alt_description && result.alt_description.trim()) ||
    `Photo related to ${query}`;

  return {
    url,
    alt,
    width,
    height,
    photographer: { name: photographerName, url: photographerUrl },
    unsplashUrl,
  };
}

/**
 * Resolve a single Unsplash photo for a search query. Never throws to the
 * caller: every failure is returned as a typed error result with the HTTP
 * status the route handler should use.
 */
export async function getPhoto(
  query: string | null | undefined,
): Promise<PhotoResult> {
  if (!query || query.trim() === "") {
    return fail(400, "invalid_query", "A non-empty query is required.");
  }

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key || key.trim() === "") {
    return fail(500, "missing_key", "UNSPLASH_ACCESS_KEY is not configured.");
  }

  const url = `${UNSPLASH_ENDPOINT}?query=${encodeURIComponent(
    query,
  )}&per_page=1`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${key}`,
        "Accept-Version": "v1",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    // AbortSignal.timeout firing, or any network-level rejection.
    return fail(504, "timeout", "The photo request timed out.");
  }

  try {
    if (!response.ok) {
      return fail(
        502,
        "upstream_http",
        "The photo service returned an error.",
      );
    }

    const data = (await response.json()) as { results?: UnsplashResult[] };
    const first = data.results?.[0];
    if (!first) {
      return fail(404, "no_results", "No photo was found for that query.");
    }

    return { ok: true, photo: mapPhoto(first, query) };
  } catch {
    return fail(500, "unexpected", "An unexpected error occurred.");
  }
}
