import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/photos/route";

const KEY = "SECRET-UNSPLASH-KEY-abc123";

function request(query?: string): Request {
  const url = new URL("http://localhost/api/photos");
  if (query !== undefined) {
    url.searchParams.set("query", query);
  }
  return new Request(url);
}

const sampleResult = {
  urls: { regular: "https://images.unsplash.com/photo-abc?w=1080" },
  description: "A warm linen desk lamp",
  alt_description: "lamp on a desk",
  width: 4000,
  height: 3000,
  links: { html: "https://unsplash.com/photos/abc" },
  user: { name: "Jane Doe", links: { html: "https://unsplash.com/@jane" } },
};

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response;
}

beforeEach(() => {
  process.env.UNSPLASH_ACCESS_KEY = KEY;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete process.env.UNSPLASH_ACCESS_KEY;
});

describe("/api/photos route handler", () => {
  it("rejects a missing query with 400 / invalid_query", async () => {
    const res = await GET(request());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("invalid_query");
  });

  it("rejects a blank query with 400 / invalid_query", async () => {
    const res = await GET(request("   "));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("invalid_query");
  });

  it("returns 500 / missing_key when the key is not configured", async () => {
    delete process.env.UNSPLASH_ACCESS_KEY;
    const res = await GET(request("lamp"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("missing_key");
  });

  it("maps a successful upstream response to 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ results: [sampleResult] })),
    );

    const res = await GET(request("linen lamp"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      url: "https://images.unsplash.com/photo-abc?w=1080",
      alt: "A warm linen desk lamp",
      width: 4000,
      height: 3000,
      photographer: {
        name: "Jane Doe",
        url: "https://unsplash.com/@jane",
      },
      unsplashUrl: "https://unsplash.com/photos/abc",
    });
  });

  it("returns 404 / no_results when Unsplash has zero results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ results: [] })),
    );
    const res = await GET(request("nothing here"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("no_results");
  });

  it("returns 502 / upstream_http on a non-2xx upstream response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ errors: ["upstream secret detail"] }, false, 500),
      ),
    );
    const res = await GET(request("lamp"));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error.code).toBe("upstream_http");
    // Upstream error body must not leak.
    expect(JSON.stringify(body)).not.toContain("upstream secret detail");
  });

  it("returns 504 / timeout when the fetch rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw Object.assign(new Error("aborted"), { name: "TimeoutError" });
      }),
    );
    const res = await GET(request("lamp"));
    expect(res.status).toBe(504);
    const body = await res.json();
    expect(body.error.code).toBe("timeout");
  });

  it("returns 500 / unexpected on an unexpected internal failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("bad json");
        },
      })),
    );
    const res = await GET(request("lamp"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("unexpected");
  });

  it("never leaks the API key in the response body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ results: [sampleResult] })),
    );
    const res = await GET(request("lamp"));
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain(KEY);
  });

  it("calls the documented Unsplash endpoint with the required request shape", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ results: [sampleResult] }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout");

    await GET(request("linen lamp"));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, options] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];

    expect(calledUrl).toContain("https://api.unsplash.com/search/photos");
    expect(calledUrl).toContain("query=");
    expect(calledUrl).toContain("per_page=1");

    const headers = options.headers as Record<string, string>;
    expect(headers.Authorization).toBe(`Client-ID ${KEY}`);
    expect(headers["Accept-Version"]).toBe("v1");

    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(timeoutSpy).toHaveBeenCalledWith(5000);
  });
});
