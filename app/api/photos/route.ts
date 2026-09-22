import { NextResponse } from "next/server";
import { getPhoto } from "@/lib/unsplash";

// The external call happens on the server, in a route handler, with a five
// second timeout and the house error envelope. The key never leaves here.
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  const result = await getPhoto(query);

  if (result.ok) {
    return NextResponse.json(result.photo, { status: 200 });
  }

  return NextResponse.json(result.body, { status: result.status });
}
