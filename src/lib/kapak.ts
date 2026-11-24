"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

// Albüm kapakları: görseller depoya KOPYALANMAZ. Çalışma anında iTunes Search API'den bulunur
// (https://itunes.apple.com/search?term=…&entity=song&limit=1 → artworkUrl100, 300x300'e büyütülür), adres bu
// tarayıcıda (localStorage "gf-kapak") önbelleğe alınır. Bulunamazsa ya da hata olursa yer tutucu (baş harf + renk).
//
// iTunes Search API dakikada ~20 istek sınırı koyar: istekler tek sırada, aralıklı gider; yalnız ekranda görünen
// kapaklar istenir (AlbumKapagi, IntersectionObserver). Sınır aşılırsa (403/429) sıra bir süre bekler, önbelleğe
// "yok" yazılmaz (sonra yeniden denenir). Bulunamayan şarkı 7 gün, bulunan 90 gün önbellekte kalır.

const KEY = "gf-kapak";
const BULUNDU_MS = 90 * 24 * 3600 * 1000;
const YOK_MS = 7 * 24 * 3600 * 1000;
const ARALIK_MS = 900;
const SINIR_BEKLE_MS = 45 * 1000;

/** u: kapak adresi (null: bulunamadı), t: kayıt zamanı (ms) */
type Kayit = { u: string | null; t: number };
/** undefined: henüz bilinmiyor (sırada), null: kapak yok, metin: kapak adresi */
export type KapakDurumu = string | null | undefined;

let onbellek: Record<string, Kayit> | null = null;
const dinleyiciler = new Map<string, Set<() => void>>();
/** Bu oturumda ağ hatası ya da bozuk görsel: yeniden istenmez, yer tutucu gösterilir */
const oturumdaYok = new Set<string>();
const sira: { anahtar: string; terim: string; sanatci: string }[] = [];
let calisiyor = false;
let bekleUntil = 0;

const normal = (x: string) =>
  x
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Kapak önbelleği anahtarı: sanatçı + şarkı adı (büyük/küçük harf ve aksan farkı yok) */
export const kapakAnahtari = (sanatci: string, baslik: string) => `${normal(sanatci)}|${normal(baslik)}`;

function oku(): Record<string, Kayit> {
  if (onbellek) return onbellek;
  try {
    const ham = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    onbellek = ham && typeof ham === "object" && !Array.isArray(ham) ? (ham as Record<string, Kayit>) : {};
  } catch {
    onbellek = {};
  }
  return onbellek;
}

function yaz(anahtar: string, u: string | null) {
  const o = { ...oku(), [anahtar]: { u, t: Date.now() } };
  onbellek = o;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(o));
  } catch {
    // Dolu depo ya da gizli sekme: oturum boyunca bellekte kalır.
  }
  dinleyiciler.get(anahtar)?.forEach((l) => l());
}

/** Önbellekteki geçerli değer; süresi geçmişse undefined (yeniden istenir) */
function gecerli(anahtar: string): KapakDurumu {
  if (oturumdaYok.has(anahtar)) return null;
  const k = oku()[anahtar];
  if (!k || typeof k.t !== "number") return undefined;
  const omur = k.u ? BULUNDU_MS : YOK_MS;
  return Date.now() - k.t > omur ? undefined : (k.u ?? null);
}

/** Başlıktaki parantezli ekler ("(Live)", "[Remastered]") ve "- Solo" gibi kuyruklar aramadan çıkarılır */
const sadeBaslik = (b: string) => b.replace(/\s*[([].*?[)\]]\s*/g, " ").replace(/\s+[-–]\s+.*$/, "").trim();

/** Sonuçtaki sanatçı adı istenenle en az bir sözcük paylaşmalı (yanlış şarkının kapağı gösterilmesin) */
function sanatciUyar(istenen: string, gelen: string) {
  const a = new Set(normal(istenen).split(" ").filter((x) => x.length > 1));
  if (!a.size) return true;
  return normal(gelen)
    .split(" ")
    .some((x) => a.has(x));
}

async function isle() {
  if (calisiyor) return;
  calisiyor = true;
  try {
    while (sira.length) {
      const bekle = bekleUntil - Date.now();
      if (bekle > 0) await new Promise((r) => setTimeout(r, bekle));
      const is = sira.shift()!;
      if (gecerli(is.anahtar) !== undefined) continue;
      try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(is.terim)}&entity=song&limit=1`;
        const r = await fetch(url);
        if (r.status === 403 || r.status === 429) {
          // Sınır aşıldı: bekle, aynı isteği sıranın başına koy
          bekleUntil = Date.now() + SINIR_BEKLE_MS;
          sira.unshift(is);
          continue;
        }
        if (!r.ok) throw new Error(String(r.status));
        const d = (await r.json()) as { results?: { artistName?: string; artworkUrl100?: string }[] };
        const s = d.results?.[0];
        const adres = s?.artworkUrl100 && sanatciUyar(is.sanatci, s.artistName ?? "") ? s.artworkUrl100.replace(/\/\d+x\d+bb\./, "/300x300bb.") : null;
        yaz(is.anahtar, adres);
      } catch {
        // Ağ yok ya da yanıt bozuk: bu oturumda yer tutucu; önbelleğe yazılmaz (sonra yeniden denenir)
        oturumdaYok.add(is.anahtar);
        dinleyiciler.get(is.anahtar)?.forEach((l) => l());
      }
      await new Promise((r) => setTimeout(r, ARALIK_MS));
    }
  } finally {
    calisiyor = false;
  }
}

/** Kapağı sıraya koyar (önbellekte geçerli değer varsa istemez) */
export function kapakIste(sanatci: string, baslik: string) {
  const anahtar = kapakAnahtari(sanatci, baslik);
  if (gecerli(anahtar) !== undefined || sira.some((x) => x.anahtar === anahtar)) return;
  sira.push({ anahtar, terim: `${sanatci} ${sadeBaslik(baslik)}`, sanatci });
  void isle();
}

/** Görsel yüklenemedi (adres bozulmuş): bu oturumda yer tutucu, önbellekten silinir */
export function kapakBozuk(sanatci: string, baslik: string) {
  const anahtar = kapakAnahtari(sanatci, baslik);
  oturumdaYok.add(anahtar);
  const o = { ...oku() };
  delete o[anahtar];
  onbellek = o;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(o));
  } catch {
    // Yazılamazsa bellekteki önbellek yeter.
  }
  dinleyiciler.get(anahtar)?.forEach((l) => l());
}

/**
 * Şarkının kapak durumu. `iste` true olunca (kart ekranda görünür olunca) kapak sıraya konur.
 * Sunucuda ve ilk çizimde undefined (yer tutucu) döner.
 */
export function useKapak(sanatci: string, baslik: string, iste: boolean): KapakDurumu {
  const anahtar = kapakAnahtari(sanatci, baslik);
  const abone = useCallback(
    (l: () => void) => {
      const set = dinleyiciler.get(anahtar) ?? new Set();
      set.add(l);
      dinleyiciler.set(anahtar, set);
      const depo = (e: StorageEvent) => {
        if (e.key === KEY) {
          onbellek = null;
          l();
        }
      };
      window.addEventListener("storage", depo);
      return () => {
        set.delete(l);
        window.removeEventListener("storage", depo);
      };
    },
    [anahtar],
  );
  const durum = useSyncExternalStore(
    abone,
    () => gecerli(anahtar),
    () => undefined,
  );
  useEffect(() => {
    if (iste && durum === undefined) kapakIste(sanatci, baslik);
  }, [iste, durum, sanatci, baslik]);
  return durum;
}
