// Sadece sunucu tarafında kullanılır (node:fs).
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { OyunVeri } from "./oyun";
import { PRIVATE_ROOTS } from "./private-roots";

/** Başarım listesi ve görev kuralları: <kök>/icerik/oyun.json (kişisel içerik paketi). Yoksa undefined. */
export async function getOyun(): Promise<OyunVeri | undefined> {
  for (const root of PRIVATE_ROOTS) {
    try {
      return JSON.parse(await readFile(path.join(root, "icerik", "oyun.json"), "utf8")) as OyunVeri;
    } catch {
      // Bu kökte yoksa sıradakine bak.
    }
  }
  return undefined;
}
