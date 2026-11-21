import { listArchive, saveArchiveTex } from "@/lib/archive";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await listArchive());
}

/** Kompozisyon derslerinden "Arşivime kaydet": { ad, tex } → ozel-kaynak/tablar/Kompozisyonlarım/… .tex */
export async function POST(request: Request) {
  let body: { ad?: unknown; tex?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ hata: "Geçersiz istek" }, { status: 400 });
  }
  const { ad, tex } = body;
  if (typeof tex !== "string" || !tex.trim() || tex.length > 200_000 || typeof ad !== "string") return Response.json({ hata: "Geçersiz eser" }, { status: 400 });
  try {
    return Response.json({ yol: await saveArchiveTex(ad, tex) });
  } catch (e) {
    return Response.json({ hata: (e as Error).message }, { status: 500 });
  }
}
