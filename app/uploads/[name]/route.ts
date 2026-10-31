import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (process.env.VERCEL || !/^[a-f0-9-]{36}\.webp$/.test(name))
    return new NextResponse(null, { status: 404 });
  try {
    const file = await readFile(`.data/uploads/${name}`);
    return new NextResponse(file, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
