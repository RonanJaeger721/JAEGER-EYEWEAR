import { NextResponse } from "next/server";
// Fail closed until a merchant-approved provider and signature verifier are installed.
export async function POST() {
  return NextResponse.json(
    { error: "No verified online payment provider is configured." },
    { status: 503 },
  );
}
