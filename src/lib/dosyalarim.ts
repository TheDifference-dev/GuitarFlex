"use client";

// "Benim dosyalarım": kullanıcının kendi bilgisayarından kütüphaneye eklediği Guitar Pro / MusicXML dosyaları.
// Dosyalar yalnız bu bilgisayarda, tarayıcının IndexedDB'sinde saklanır (masaüstü uygulamasında da aynı; Electron
// pencereyi her açılışta aynı adreste açar, bkz. desktop/main.cjs). Hiçbir dosya sunucuya ya da internete gönderilmez.
// İki depo: "ozet" (liste için küçük kayıtlar) ve "veri" (dosyanın baytları; yalnız şarkı açılınca okunur).

import { useSyncExternalStore } from "react";
import type { DosyaMeta } from "./dosya-meta";

export type DosyaKaydi = {
  id: string;
  /** Dosyanın adı (ör. "Şarkım.gp") */
  dosyaAdi: string;
  boyut: number;
  /** Eklenme zamanı (ISO) */
  eklendi: string;
  meta: DosyaMeta;
};

const DB = "guitarflex-dosyalarim";
const SURUM = 1;
const OZET = "ozet";
const VERI = "veri";
const OLAY = "gf-dosyalarim-degisti";

let dbSoz: Promise<IDBDatabase> | null = null;
function ac(): Promise<IDBDatabase> {
  dbSoz ??= new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("Bu tarayıcıda IndexedDB yok"));
    const r = indexedDB.open(DB, SURUM);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains(OZET)) db.createObjectStore(OZET, { keyPath: "id" });
      if (!db.objectStoreNames.contains(VERI)) db.createObjectStore(VERI);
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error ?? new Error("IndexedDB açılamadı"));
    r.onblocked = () => reject(new Error("IndexedDB başka bir pencerede kilitli"));
  }).catch((e) => {
    dbSoz = null;
    throw e;
  });
  return dbSoz;
}

function istek<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
function bitti(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error("İşlem iptal edildi"));
  });
}

// ── Liste deposu (useSyncExternalStore) ──
type Durum = { yuklendi: boolean; kayitlar: DosyaKaydi[]; hata?: string };
const BOS: Durum = { yuklendi: false, kayitlar: [] };
let durum: Durum = BOS;
let yukleniyor = false;
const dinleyiciler = new Set<() => void>();
const yay = () => dinleyiciler.forEach((f) => f());

async function yenile() {
  try {
    const db = await ac();
    const kayitlar = (await istek(db.transaction(OZET, "readonly").objectStore(OZET).getAll())) as DosyaKaydi[];
    kayitlar.sort((a, b) => b.eklendi.localeCompare(a.eklendi));
    durum = { yuklendi: true, kayitlar };
  } catch (e) {
    durum = { yuklendi: true, kayitlar: [], hata: `Dosyalar okunamadı: ${(e as Error).message}` };
  }
  yay();
}

function abone(f: () => void) {
  dinleyiciler.add(f);
  if (!durum.yuklendi && !yukleniyor) {
    yukleniyor = true;
    void yenile().finally(() => (yukleniyor = false));
  }
  // Başka sekmede/pencerede yapılan değişiklik
  const dis = () => void yenile();
  window.addEventListener(OLAY, dis);
  return () => {
    dinleyiciler.delete(f);
    window.removeEventListener(OLAY, dis);
  };
}

/** Kütüphanedeki kullanıcı dosyaları (yeniden eskiye); ilk okuma bitene kadar yuklendi = false */
export function useDosyalarim(): Durum {
  return useSyncExternalStore(abone, () => durum, () => BOS);
}

const yeniId = () => {
  try {
    return crypto.randomUUID().slice(0, 8) + Date.now().toString(36);
  } catch {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }
};

/** Dosyayı ve özetini saklar; kaydı döndürür */
export async function dosyaEkle(dosyaAdi: string, veri: ArrayBuffer, meta: DosyaMeta): Promise<DosyaKaydi> {
  const db = await ac();
  const kayit: DosyaKaydi = { id: yeniId(), dosyaAdi, boyut: veri.byteLength, eklendi: new Date().toISOString(), meta };
  const tx = db.transaction([OZET, VERI], "readwrite");
  tx.objectStore(VERI).put(veri, kayit.id);
  tx.objectStore(OZET).put(kayit);
  await bitti(tx);
  await yenile();
  window.dispatchEvent(new Event(OLAY));
  return kayit;
}

export async function dosyaSil(id: string): Promise<void> {
  const db = await ac();
  const tx = db.transaction([OZET, VERI], "readwrite");
  tx.objectStore(VERI).delete(id);
  tx.objectStore(OZET).delete(id);
  await bitti(tx);
  await yenile();
  window.dispatchEvent(new Event(OLAY));
}

/** Tek kaydın özeti ve dosya baytları (şarkı sayfası); yoksa null */
export async function dosyaOku(id: string): Promise<{ kayit: DosyaKaydi; veri: ArrayBuffer } | null> {
  const db = await ac();
  const tx = db.transaction([OZET, VERI], "readonly");
  const [kayit, veri] = await Promise.all([istek(tx.objectStore(OZET).get(id)), istek(tx.objectStore(VERI).get(id))]);
  if (!kayit || !(veri instanceof ArrayBuffer)) return null;
  return { kayit: kayit as DosyaKaydi, veri };
}

/** Aynı adda ve boyutta dosya zaten var mı (aynı dosyanın iki kez eklenmesini önler) */
export const ayniDosya = (kayitlar: DosyaKaydi[], ad: string, boyut: number) => kayitlar.find((k) => k.dosyaAdi === ad && k.boyut === boyut);
