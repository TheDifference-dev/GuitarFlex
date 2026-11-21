// Sadece sunucu tarafında kullanılır (node:fs).
// Şarkı Kütüphanesi: içerik paketindeki icerik/kutuphane.json (bkz. GuitarFlex-icerik/uretici/kutuphane.ts).
// Paket yoksa kütüphane boştur; aynı slug iki kökte varsa ilk kökteki (ozel-kaynak) geçerlidir.
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Library, LibrarySong } from "@/content/types";
import { PRIVATE_ROOTS } from "./private-roots";

/** Zorunlu alanları olmayan kayıt atlanır: bozuk bir şarkı kütüphanenin geri kalanını engellemez */
function gecerli(s: Partial<LibrarySong> | null | undefined): s is LibrarySong {
  return !!s && typeof s.slug === "string" && !!s.slug && typeof s.title === "string" && typeof s.tex === "string" && Array.isArray(s.tracks) && Array.isArray(s.parts);
}

export async function getLibrary(): Promise<LibrarySong[]> {
  const songs: LibrarySong[] = [];
  for (const root of PRIVATE_ROOTS) {
    try {
      const data = JSON.parse(await readFile(path.join(root, "icerik", "kutuphane.json"), "utf8")) as Partial<Library>;
      for (const s of Array.isArray(data?.songs) ? data.songs : []) {
        if (gecerli(s) && !songs.some((x) => x.slug === s.slug)) songs.push({ ...s, chords: s.chords ?? [], tips: s.tips ?? [], techniques: s.techniques ?? [] });
      }
    } catch {
      // Dosya yoksa ya da bozuksa bu kök atlanır.
    }
  }
  return songs;
}

export async function getLibrarySong(slug: string): Promise<LibrarySong | undefined> {
  return (await getLibrary()).find((s) => s.slug === slug);
}

/** Liste için tex'siz özet (istemciye gereksiz alphaTex gönderilmez) */
export type LibrarySummary = Omit<LibrarySong, "tex">;
export function summary(s: LibrarySong): LibrarySummary {
  const { tex, ...rest } = s;
  void tex;
  return rest;
}
