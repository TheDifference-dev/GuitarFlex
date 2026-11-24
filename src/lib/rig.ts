"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { baslangicDeposu, goc, type RigDepo } from "./rig-cekirdek";
import type { Goruntu } from "./rig-foto";

export * from "./rig-cekirdek";
export { arkaPlaniTemizle, type Goruntu, type KesimSonucu } from "./rig-foto";

// Rig'im bu tarayıcıda (localStorage "gf-rig") saklanır; defter.ts ile aynı düzen (önbellek, abonelik, sekmeler arası).
// Kullanıcının ekipman fotoğrafları ayrı: IndexedDB "guitarflex-rig" (yalnız bu bilgisayarda; hiçbir yere gönderilmez).

const KEY = "gf-rig";
// Sunucu (ve hidrasyon) anlık görüntüsü: kimlik sabit, sunucu ile tarayıcı aynı HTML'i üretsin
const SUNUCU: RigDepo = (() => {
  const d = baslangicDeposu();
  const r = { ...d.rigler[0], id: "r-baslangic", guncelleme: "2026-01-01T00:00:00.000Z" };
  return { ...d, rigler: [r], seciliRig: r.id };
})();

let cache: RigDepo | null = null;
const listeners = new Set<() => void>();

function read(): RigDepo {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? goc(JSON.parse(raw)) : baslangicDeposu();
  } catch {
    cache = baslangicDeposu();
  }
  return cache;
}

function write(next: RigDepo) {
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

export function useRigDepo(): RigDepo {
  return useSyncExternalStore(subscribe, read, () => SUNUCU);
}

/** Depoyu bir işlemle günceller: `rigIsle((d) => rigEkle(d, "Crunch"))` */
export function rigIsle(f: (d: RigDepo) => RigDepo) {
  const once = read();
  const sonra = f(once);
  if (sonra !== once) write(sonra);
}

// ── Fotoğraflar (IndexedDB) ──

const DB = "guitarflex-rig";
const FOTO = "foto";
let dbSoz: Promise<IDBDatabase> | null = null;

function ac(): Promise<IDBDatabase> {
  dbSoz ??= new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("Bu tarayıcıda IndexedDB yok"));
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains(FOTO)) r.result.createObjectStore(FOTO);
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error ?? new Error("IndexedDB açılamadı"));
  }).catch((e) => {
    dbSoz = null;
    throw e;
  });
  return dbSoz;
}

function islem<T>(kip: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return ac().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(FOTO, kip);
        const r = f(tx.objectStore(FOTO));
        tx.oncomplete = () => resolve(r.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new Error("İşlem iptal edildi"));
      }),
  );
}

/** Fotoğraf dosyasını en çok `enCok` piksele küçültüp piksel verisine çevirir (fotoğraftan ekipman için) */
export async function fotoGoruntusu(dosya: Blob, enCok = 900): Promise<Goruntu> {
  if (!dosya.type.startsWith("image/")) throw new Error("Bu bir resim dosyası değil.");
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(dosya);
  } catch {
    throw new Error("Resim açılamadı (desteklenmeyen biçim olabilir).");
  }
  const olcek = Math.min(1, enCok / Math.max(bmp.width, bmp.height));
  const tuval = document.createElement("canvas");
  tuval.width = Math.max(1, Math.round(bmp.width * olcek));
  tuval.height = Math.max(1, Math.round(bmp.height * olcek));
  const c = tuval.getContext("2d", { willReadFrequently: true })!;
  c.drawImage(bmp, 0, 0, tuval.width, tuval.height);
  bmp.close();
  const v = c.getImageData(0, 0, tuval.width, tuval.height);
  return { width: v.width, height: v.height, data: v.data };
}

function tuvale(g: Goruntu): HTMLCanvasElement {
  const tuval = document.createElement("canvas");
  tuval.width = g.width;
  tuval.height = g.height;
  tuval.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(g.data), g.width, g.height), 0, 0);
  return tuval;
}

/** Önizleme adresi (data: URL, PNG; saydamlık korunur) */
export const goruntuAdresi = (g: Goruntu): string => tuvale(g).toDataURL("image/png");

/** Görüntüyü saklar (WebP, saydamlık korunur; desteklenmezse PNG); anahtarını döndürür */
export async function goruntuKaydet(g: Goruntu): Promise<string> {
  const tuval = tuvale(g);
  const blob = await new Promise<Blob>((res, rej) =>
    tuval.toBlob((b) => (b && b.type === "image/webp" ? res(b) : tuval.toBlob((p) => (p ? res(p) : rej(new Error("Resim dönüştürülemedi"))), "image/png")), "image/webp", 0.9),
  );
  return fotoBlobKaydet(blob);
}

async function fotoBlobKaydet(blob: Blob): Promise<string> {
  const id = `foto-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  await islem("readwrite", (s) => s.put(blob, id));
  fotoOnbellek.delete(id);
  return id;
}

export async function fotoSil(id: string): Promise<void> {
  fotoOnbellek.delete(id);
  await islem("readwrite", (s) => s.delete(id)).catch(() => undefined);
}

const fotoOnbellek = new Map<string, Promise<string | null>>();

function fotoUrl(id: string): Promise<string | null> {
  let s = fotoOnbellek.get(id);
  if (!s) {
    s = islem("readonly", (x) => x.get(id) as IDBRequest<Blob | undefined>)
      .then((b) => (b ? URL.createObjectURL(b) : null))
      .catch(() => null);
    fotoOnbellek.set(id, s);
  }
  return s;
}

/** Ekipman fotoğrafının adresi (yoksa ya da yüklenmediyse null) */
export function useFotoUrl(id: string | undefined): string | null {
  const [durum, setDurum] = useState<{ id: string; url: string | null } | null>(null);
  useEffect(() => {
    if (!id) return;
    let iptal = false;
    fotoUrl(id).then((url) => !iptal && setDurum({ id, url }));
    return () => {
      iptal = true;
    };
  }, [id]);
  return id && durum?.id === id ? durum.url : null;
}
