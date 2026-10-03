import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { resolvePrivate } from "@/lib/private-roots";

export const dynamic = "force-dynamic";

// Kişisel içerik köklerindeki görselleri ve tab dosyalarını sunar (bkz. private-roots.ts).
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
  const type = TYPES[path.extname(rel).toLowerCase()];
  const full = type ? resolvePrivate(rel) : null;
  if (!full) return new Response("Dosya bulunamadı", { status: 404 });
  try {
    const data = await readFile(full);
    return new Response(new Uint8Array(data), { headers: { "Content-Type": type, "Cache-Control": "no-store" } });
  } catch {
    return new Response("Dosya bulunamadı", { status: 404 });
  }
}
