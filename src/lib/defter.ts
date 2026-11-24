"use client";

import { useSyncExternalStore } from "react";
import { songUrl, type PopularSong } from "@/content/sarkilar";
import { songsterrAdresi } from "./songsterr";
import { DEFTER_SURUM, bos, geriYukle, goc, kayitAc, type DefterVeri, type Kayit, type KayitBilgisi } from "./defter-cekirdek";

export * from "./defter-cekirdek";

// Çalışma Defteri bu tarayıcıda (localStorage) saklanır; progress.ts ile aynı düzen (önbellek, abonelik, sekmeler arası).
// Veri modeli ve işlemler: ./defter-cekirdek.ts. Dışa aktar / içe aktar (JSON) yedek için.

const KEY = "gf-defter";
const BOS = bos();

let cache: DefterVeri | null = null;
const listeners = new Set<() => void>();

function read(): DefterVeri {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const ham = raw ? JSON.parse(raw) : null;
    cache = ham ? goc(ham) : BOS;
    // Eski sürüm (v1: işaretsiz otomatik kayıtlar) göç ettirildiyse temizlenmiş hali hemen saklanır
    if (ham && (ham as { surum?: unknown }).surum !== DEFTER_SURUM) window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    cache = BOS;
  }
  return cache;
}

function write(next: DefterVeri) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Gizli sekme ya da dolu depo: oturum boyunca bellekte kalır.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDefter(): DefterVeri {
  return useSyncExternalStore(subscribe, read, () => BOS);
}

/* ───────────── Geri al ───────────── */

/** Son işlemde defterden çıkan kayıtlar (silinmeden önceki halleriyle): "Geri al" bildirimi bunları gösterir */
export type SilinenKayitlar = { n: number; kayitlar: { kayit: Kayit; sira: number }[] } | null;
let silinen: SilinenKayitlar = null;
let silinenNo = 0;
const silinenDinleyiciler = new Set<() => void>();
const silinenAbone = (l: () => void) => {
  silinenDinleyiciler.add(l);
  return () => silinenDinleyiciler.delete(l);
};
const silinenBildir = (x: SilinenKayitlar) => {
  silinen = x;
  silinenDinleyiciler.forEach((l) => l());
};
/** Son işlemde silinen kayıtlar (bildirim kapanınca null) */
export const useSilinenKayitlar = () => useSyncExternalStore(silinenAbone, () => silinen, () => null);
export const silinenBildiriminiKapat = () => silinenBildir(null);
/** Son silinenleri geri koyar */
export function geriAl() {
  const s = silinen;
  if (!s) return;
  silinenBildir(null);
  defterIsle((v) => geriYukle(v, s.kayitlar), { sessiz: true });
}

/**
 * Defteri bir işlemle günceller: `defterIsle((v) => sureEkle(v, …))`. İşlem kayıt sildiyse (son işaret kaldırıldı ya
 * da kayıt silindi) birkaç saniyelik "Geri al" bildirimi çıkar; `sessiz` (ör. yedeği içe aktar › Değiştir) çıkarmaz.
 */
export function defterIsle(f: (v: DefterVeri) => DefterVeri, { sessiz = false }: { sessiz?: boolean } = {}) {
  const once = read();
  const sonra = f(once);
  if (sonra === once) return;
  write(sonra);
  if (sessiz) return;
  const giden = Object.keys(once.kayitlar).filter((id) => !sonra.kayitlar[id]);
  if (giden.length) silinenBildir({ n: ++silinenNo, kayitlar: giden.map((id) => ({ kayit: once.kayitlar[id], sira: once.liste.indexOf(id) })) });
}

export const defterOku = read;

/* ───────────── Kayıt kimlikleri ───────────── */

export const dersKaydi = (progressKey: string, baslik: string, kurs: string, href: string): KayitBilgisi => ({ id: `egzersiz:${progressKey}`, tur: "egzersiz", baslik, altBaslik: kurs, href });
export const kutuphaneKaydi = (slug: string, baslik: string, sanatci: string): KayitBilgisi => ({ id: `sarki:kutuphane/${slug}`, tur: "sarki", baslik, altBaslik: sanatci, href: `/kutuphane/${slug}` });
export const dosyaKaydi = (id: string, baslik: string, sanatci: string): KayitBilgisi => ({ id: `sarki:dosya/${id}`, tur: "sarki", baslik, altBaslik: sanatci, href: `/kutuphane/dosya/${id}` });
/** Songsterr'de açılan şarkı (Rehber / Tüm Şarkılar, Şarkı Kütüphanesi bantları, ana sayfa): sanatçı + ad kimliği */
export const songsterrKaydi = (baslik: string, sanatci: string, href: string): KayitBilgisi => ({ id: `sarki:songsterr/${sanatci}|${baslik}`, tur: "sarki", baslik, altBaslik: sanatci, href });
/** Popüler şarkı (Songsterr'de açılır) */
export const populerKaydi = (s: PopularSong): KayitBilgisi => songsterrKaydi(s.title, s.artist, songUrl(s));
/** Songsterr araması: aranan metin başlık olur */
export const songsterrAramaKaydi = (q: string, href: string): KayitBilgisi => ({
  id: `sarki:songsterr-ara/${q.trim().toLocaleLowerCase("tr")}`,
  tur: "sarki",
  baslik: q.trim(),
  altBaslik: "Songsterr araması",
  href,
});
/** Şarkı Kütüphanesi araması açıldı (Songsterr): defterde işaretli bir arama kaydı varsa "açıldı" zamanı yazılır; kayıt açmaz */
export const songsterrAramasiAcildi = (q: string) => {
  if (q.trim()) defterIsle((v) => kayitAc(v, songsterrAramaKaydi(q, songsterrAdresi(q))));
};
/** Kayıt uygulama dışında mı çalınıyor (süresi elle girilir) */
export const disKayit = (id: string) => id.startsWith("sarki:songsterr");
