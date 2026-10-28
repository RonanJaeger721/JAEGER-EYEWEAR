import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { readState } from "@/lib/db";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
export async function POST(req: NextRequest) {
  try {
    if (
      !req.headers.get("origin") ||
      new URL(req.headers.get("origin")!).host !== req.headers.get("host")
    )
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    const session = await auth();
    const s = await readState();
    if (
      !s.users.some(
        (u) =>
          u.id === session?.user?.id &&
          !u.disabled &&
          ["admin", "editor"].includes(u.role),
      )
    )
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    if (Number(req.headers.get("content-length") || 0) > 6000000)
      throw new Error("Maximum upload is 5 MB.");
    const form = await req.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size > 5000000 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      throw new Error("Upload a JPEG, PNG or WebP up to 5 MB.");
    const data = await sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 30000000,
    })
      .rotate()
      .resize(2400, 2400, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    const name = `jaeger/${randomUUID()}.webp`;
    let url: string;
    if (process.env.BLOB_READ_WRITE_TOKEN)
      url = (
        await put(name, data, { access: "public", contentType: "image/webp" })
      ).url;
    else if (!process.env.VERCEL) {
      await mkdir("public/uploads", { recursive: true });
      url = `/uploads/${randomUUID()}.webp`;
      await writeFile(`public${url}`, data);
    } else throw new Error("Cloud image storage is not configured.");
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 400 },
    );
  }
}
