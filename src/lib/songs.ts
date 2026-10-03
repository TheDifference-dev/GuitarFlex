// Sadece sunucu tarafında kullanılır (node:fs).
import { readFile } from "node:fs/promises";
import path from "node:path";
import { POPULAR_SONGS, type PopularSong } from "@/content/sarkilar";
import { PRIVATE_ROOTS } from "./private-roots";

/** Yerleşik liste + kişisel içerik paketindeki icerik/sarkilar.json (varsa) */
export async function getPopularSongs(): Promise<PopularSong[]> {
  const extra: PopularSong[] = [];
  for (const root of PRIVATE_ROOTS) {
    try {
      const data = JSON.parse(await readFile(path.join(root, "icerik", "sarkilar.json"), "utf8"));
      if (!Array.isArray(data)) continue;
      for (const s of data) {
        if (!s?.title || !s?.artist) continue;
        extra.push({ level: 2, kind: "şarkı", tags: [], ...s });
      }
    } catch {
      // Dosya yoksa ya da bozuksa yerleşik liste yeterli.
    }
  }
  const key = (s: PopularSong) => `${s.artist}|${s.title}`.toLocaleLowerCase("tr");
  const seen = new Set(extra.map(key));
  return [...extra, ...POPULAR_SONGS.filter((s) => !seen.has(key(s)))];
}
