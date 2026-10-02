import { readFile } from "node:fs/promises";
import type { NextRequest } from "next/server";
import { resolveArchivePath } from "@/lib/archive";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rel = request.nextUrl.searchParams.get("yol") ?? "";
  const full = resolveArchivePath(rel);
  if (!full) return new Response("Geçersiz yol", { status: 400 });
  try {
    const data = await readFile(full);
    return new Response(new Uint8Array(data), { headers: { "Content-Type": "application/octet-stream", "Cache-Control": "no-store" } });
  } catch {
    return new Response("Dosya bulunamadı", { status: 404 });
  }
}
