"use client";

// Şarkı Kütüphanesinin bu bilgisayarda saklanan küçük tercihleri (localStorage): favoriler, son çalınanlar ve şarkı
// başına mikser ayarları. Şarkı kimliği: GuitarFlex şarkısı "s:<slug>", kullanıcı dosyası "d:<id>".

import { useSyncExternalStore } from "react";

export type SarkiKimligi = `s:${string}` | `d:${string}`;
export const ozgunKimlik = (slug: string): SarkiKimligi => `s:${slug}`;
export const dosyaKimlik = (id: string): SarkiKimligi => `d:${id}`;

const FAVORI = "gf-kutuphane-favori";
const SON = "gf-kutuphane-son";
const OLAY = "gf-kutuphane-yerel";
const SON_EN_COK = 30;

const bellek = new Map<string, string>();
function oku(k: string): string | null {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return bellek.get(k) ?? null;
  }
}
function yaz(k: string, v: string | null) {
  try {
    if (v === null) window.localStorage.removeItem(k);
    else window.localStorage.setItem(k, v);
  } catch {
    // Depolama kapalıysa bu sayfa açıkken bellekte
    if (v === null) bellek.delete(k);
    else bellek.set(k, v);
  }
  window.dispatchEvent(new Event(OLAY));
}

function abone(f: () => void) {
  window.addEventListener(OLAY, f);
  window.addEventListener("storage", f);
  return () => {
    window.removeEventListener(OLAY, f);
    window.removeEventListener("storage", f);
  };
}
/** Ham metni okuyup ayrıştıran, değişmedikçe aynı nesneyi döndüren seçici */
function secici<T>(anahtar: string, ayristir: (ham: string | null) => T) {
  let son: { ham: string | null; deger: T } | null = null;
  return () => {
    const ham = oku(anahtar);
    if (!son || son.ham !== ham) son = { ham, deger: ayristir(ham) };
    return son.deger;
  };
}
const dizi = (ham: string | null): unknown[] => {
  try {
    const d = JSON.parse(ham ?? "[]");
    return Array.isArray(d) ? d : [];
  } catch {
    return [];
  }
};

// ── Favoriler ──
const BOS_SET: ReadonlySet<string> = new Set();
const favoriSec = secici(FAVORI, (ham) => new Set(dizi(ham).filter((x): x is string => typeof x === "string")) as ReadonlySet<string>);
export function useFavoriler(): ReadonlySet<string> {
  return useSyncExternalStore(abone, favoriSec, () => BOS_SET);
}
export function favoriDegistir(id: SarkiKimligi) {
  const s = new Set(favoriSec());
  if (s.has(id)) s.delete(id);
  else s.add(id);
  yaz(FAVORI, JSON.stringify([...s]));
}

// ── Son çalınanlar (yeniden eskiye) ──
export type SonCalinan = { id: SarkiKimligi; zaman: string };
const BOS_SON: SonCalinan[] = [];
const sonSec = secici(SON, (ham) =>
  dizi(ham).filter((x): x is SonCalinan => !!x && typeof (x as SonCalinan).id === "string" && typeof (x as SonCalinan).zaman === "string"),
);
export function useSonCalinanlar(): SonCalinan[] {
  return useSyncExternalStore(abone, sonSec, () => BOS_SON);
}
/** Şarkı çalınmaya başlayınca çağrılır: listenin başına alınır */
export function calindi(id: SarkiKimligi) {
  const liste = [{ id, zaman: new Date().toISOString() }, ...sonSec().filter((x) => x.id !== id)].slice(0, SON_EN_COK);
  yaz(SON, JSON.stringify(liste));
}
/** Silinen kullanıcı dosyasını favorilerden ve son çalınanlardan çıkarır */
export function kimlikUnut(id: SarkiKimligi) {
  const f = new Set(favoriSec());
  if (f.delete(id)) yaz(FAVORI, JSON.stringify([...f]));
  const s = sonSec();
  if (s.some((x) => x.id === id)) yaz(SON, JSON.stringify(s.filter((x) => x.id !== id)));
  yaz(mikserAnahtari(id), null);
}

// ── Şarkı başına mikser ayarları (TabPlayer `mikserKaydi`) ──
export type MikserKaydi = {
  /** Track sayısı: dosya değişmişse (farklı track sayısı) kayıt yok sayılır */
  izSayisi: number;
  /** Ana ses (%; 100 = alphaTab varsayılanı) */
  ana: number;
  /** Track dizini → ses (%) */
  ses: Record<number, number>;
  /** Track dizini → pan (−100 sol … 100 sağ) */
  pan: Record<number, number>;
  sessiz: number[];
  solo: number[];
};
export const mikserAnahtari = (id: string) => `gf-mikser:${id}`;
export function mikserOku(id: string, izSayisi: number): MikserKaydi | null {
  try {
    const k = JSON.parse(oku(mikserAnahtari(id)) ?? "null") as MikserKaydi | null;
    if (!k || k.izSayisi !== izSayisi) return null;
    return { izSayisi, ana: typeof k.ana === "number" ? k.ana : 100, ses: k.ses ?? {}, pan: k.pan ?? {}, sessiz: k.sessiz ?? [], solo: k.solo ?? [] };
  } catch {
    return null;
  }
}
export function mikserYaz(id: string, k: MikserKaydi) {
  try {
    window.localStorage.setItem(mikserAnahtari(id), JSON.stringify(k));
  } catch {
    bellek.set(mikserAnahtari(id), JSON.stringify(k));
  }
}
