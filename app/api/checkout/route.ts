import { NextResponse } from "next/server";
import { validateOrder, type CheckoutInput } from "@/lib/checkout";

// Server-side checkout: validate the cart and details, recompute prices and totals
// from the catalogue, and return the order or the house error envelope. Never
// throws; the key house rule is that client-sent money is never trusted.
export async function POST(request: Request): Promise<NextResponse> {
  let body: CheckoutInput;
  try {
    body = (await request.json()) as CheckoutInput;
  } catch {
    // A body we cannot parse is a client error, not a server fault.
    return NextResponse.json(
      { error: { code: "invalid_details", message: "Malformed request body." } },
      { status: 400 },
    );
  }

  try {
    const result = validateOrder(body);
    if (result.ok) {
      return NextResponse.json(result.order, { status: 200 });
    }
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      { error: { code: "unexpected", message: "Something went wrong. Please try again." } },
      { status: 500 },
    );
  }
}
