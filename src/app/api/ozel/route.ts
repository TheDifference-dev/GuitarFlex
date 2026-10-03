import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// ozel-kaynak/ klasöründeki görselleri ve tab dosyalarını sunar (kişisel içerik paketi).
const ROOT = path.join(process.cwd(), "ozel-kaynak");
const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".gp": "application/octet-stream",
  ".gp3": "application/octet-stream",
  ".gp4": "application/octet-stream",
  ".gp5": "application/octet-stream",
  ".gpx": "application/octet-stream",
  ".gp7": "application/octet-stream",
  ".xml": "application/xml",
  ".musicxml": "application/xml",
  ".tex": "text/plain; charset=utf-8",
  ".atex": "text/plain; charset=utf-8",
};

export async function GET(request: NextRequest) {
  const rel = request.nextUrl.searchParams.get("yol") ?? "";
  const full = path.resolve(ROOT, rel);
  const type = TYPES[path.extname(full).toLowerCase()];
  if (!full.startsWith(ROOT + path.sep) || !type) return new Response("Geçersiz yol", { status: 400 });
  try {
    const data = await readFile(full);
    return new Response(new Uint8Array(data), { headers: { "Content-Type": type, "Cache-Control": "no-store" } });
  } catch {
    return new Response("Dosya bulunamadı", { status: 404 });
  }
}
