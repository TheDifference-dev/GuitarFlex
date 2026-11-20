"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Tab oynatıcının kalıcı tercihleri (tarayıcıda saklanır; bütün oynatıcılar paylaşır). */
export type OynaticiAyarlari = {
  /** Görünüm (dersin `stave` alanı yoksa geçerli) */
  gorunum: "tab" | "score-tab" | "score";
  /** Sayfa ya da tek satırda yatay kayan yerleşim */
  yerlesim: "sayfa" | "yatay";
  /** Yakınlaştırma (%) */
  zoom: number;
  /** Çalarken sayfa imleci izlesin */
  imlecTakibi: boolean;
  /** Çalan notaları sap üzerinde gösteren alt panel */
  sap: boolean;
  /** Başlamadan önce bir ölçü say (null: henüz seçilmedi, oynatıcının varsayılanı) */
  sayim: boolean | null;
  /** Metronom: her vuruşta mı, yalnız ölçü başında mı */
  metronomKipi: "vurus" | "olcu";
  /** Kademeli hızlanma: başlangıç, döngü başına artış, hedef (%) */
  rampa: { baslangic: number; adim: number; hedef: number };
  /** Ses bankası: GeneralUser GS (varsayılan) ya da hafif Sonivox */
  sesBankasi: "generaluser" | "sonivox";
};

export const VARSAYILAN: OynaticiAyarlari = {
  gorunum: "tab",
  yerlesim: "sayfa",
  zoom: 100,
  imlecTakibi: true,
  sap: false,
  sayim: null,
  metronomKipi: "vurus",
  rampa: { baslangic: 60, adim: 5, hedef: 100 },
  sesBankasi: "generaluser",
};

const KEY = "gf-oynatici";
/** Eski "Sayım" tercihi (İP10 öncesi) */
const ESKI_SAYIM = "gf-sayim";
const EVENT = "gf-oynatici-degisti";

let onbellek: { ham: string | null; deger: OynaticiAyarlari } | null = null;
/** Depolama yazılamadığında tercihler bu sayfa açıkken burada tutulur */
let bellek: OynaticiAyarlari | null = null;

function oku(): OynaticiAyarlari {
  if (bellek) return bellek;
  let ham: string | null = null;
  let eski: string | null = null;
  try {
    ham = window.localStorage.getItem(KEY);
    if (ham === null) eski = window.localStorage.getItem(ESKI_SAYIM);
  } catch {
    // Depolama kapalıysa varsayılanlar
  }
  const anahtar = ham ?? `eski:${eski}`;
  if (onbellek && onbellek.ham === anahtar) return onbellek.deger;
  let deger: OynaticiAyarlari = { ...VARSAYILAN, sayim: eski === null ? null : eski === "1" };
  if (ham) {
    try {
      const p = JSON.parse(ham) as Partial<OynaticiAyarlari>;
      deger = { ...VARSAYILAN, ...p, rampa: { ...VARSAYILAN.rampa, ...(p.rampa ?? {}) } };
    } catch {
      // Bozuk kayıt: varsayılanlar
    }
  }
  onbellek = { ham: anahtar, deger };
  return deger;
}

function abone(degisti: () => void) {
  window.addEventListener(EVENT, degisti);
  window.addEventListener("storage", degisti);
  return () => {
    window.removeEventListener(EVENT, degisti);
    window.removeEventListener("storage", degisti);
  };
}

function yaz(yeni: OynaticiAyarlari) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(yeni));
  } catch {
    // Saklanamazsa tercih yalnız bu sayfa açıkken geçerli
    bellek = yeni;
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Kalıcı oynatıcı ayarları ve güncelleme işlevi */
export function useOynaticiAyarlari(): [OynaticiAyarlari, (degisiklik: Partial<OynaticiAyarlari>) => void] {
  const ayarlar = useSyncExternalStore(abone, oku, () => VARSAYILAN);
  const guncelle = useCallback((degisiklik: Partial<OynaticiAyarlari>) => yaz({ ...oku(), ...degisiklik }), []);
  return [ayarlar, guncelle];
}
