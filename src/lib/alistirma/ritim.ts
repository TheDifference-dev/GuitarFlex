"use client";

// Ritim alıştırmaları: vuruş hücrelerinden ölçü üretimi, çalma ve geri vurma (tap) puanı.
// Süreler vuruş (dörtlük) cinsindendir; 4/4'te bir ölçü 4 vuruştur.

import { simdi, tik, vurus, audio } from "@/lib/ses";
import type { Alistirma } from "./tipler";
import { karistir, rnd, sec } from "./muzik";

/** Bir hücrenin olayları: başlangıç ve süre (vuruş), sus mu, noktalı mı */
export type Olay = { t: number; d: number; sus?: boolean; nokta?: boolean };
export type Hucre = { ad: string; vurus: number; olaylar: Olay[]; uclu?: boolean };

const T = 1 / 3;
export const HUCRE: Record<string, Hucre> = {
  q: { ad: "Dörtlük", vurus: 1, olaylar: [{ t: 0, d: 1 }] },
  qr: { ad: "Dörtlük sus", vurus: 1, olaylar: [{ t: 0, d: 1, sus: true }] },
  h: { ad: "İkilik", vurus: 2, olaylar: [{ t: 0, d: 2 }] },
  ee: { ad: "İki sekizlik", vurus: 1, olaylar: [{ t: 0, d: 0.5 }, { t: 0.5, d: 0.5 }] },
  "e-r": { ad: "Sekizlik + sekizlik sus", vurus: 1, olaylar: [{ t: 0, d: 0.5 }, { t: 0.5, d: 0.5, sus: true }] },
  "r-e": { ad: "Sekizlik sus + sekizlik", vurus: 1, olaylar: [{ t: 0, d: 0.5, sus: true }, { t: 0.5, d: 0.5 }] },
  ssss: { ad: "Dört onaltılık", vurus: 1, olaylar: [0, 0.25, 0.5, 0.75].map((t) => ({ t, d: 0.25 })) },
  "e-ss": { ad: "Sekizlik + iki onaltılık", vurus: 1, olaylar: [{ t: 0, d: 0.5 }, { t: 0.5, d: 0.25 }, { t: 0.75, d: 0.25 }] },
  "ss-e": { ad: "İki onaltılık + sekizlik", vurus: 1, olaylar: [{ t: 0, d: 0.25 }, { t: 0.25, d: 0.25 }, { t: 0.5, d: 0.5 }] },
  "de-s": { ad: "Noktalı sekizlik + onaltılık", vurus: 1, olaylar: [{ t: 0, d: 0.75, nokta: true }, { t: 0.75, d: 0.25 }] },
  "s-de": { ad: "Onaltılık + noktalı sekizlik", vurus: 1, olaylar: [{ t: 0, d: 0.25 }, { t: 0.25, d: 0.75, nokta: true }] },
  "r-sss": { ad: "Onaltılık sus + üç onaltılık", vurus: 1, olaylar: [{ t: 0, d: 0.25, sus: true }, { t: 0.25, d: 0.25 }, { t: 0.5, d: 0.25 }, { t: 0.75, d: 0.25 }] },
  // Senkop: sekizlik – dörtlük – sekizlik (iki vuruşa yayılır, ikinci vuruş başında yeni atak yok)
  syn: { ad: "Senkop (sekizlik-dörtlük-sekizlik)", vurus: 2, olaylar: [{ t: 0, d: 0.5 }, { t: 0.5, d: 1 }, { t: 1.5, d: 0.5 }] },
  t: { ad: "Sekizlik üçleme", vurus: 1, uclu: true, olaylar: [0, T, 2 * T].map((t) => ({ t, d: T })) },
  "t-r-t": { ad: "Üçleme (ortası sus)", vurus: 1, uclu: true, olaylar: [{ t: 0, d: T }, { t: T, d: T, sus: true }, { t: 2 * T, d: T }] },
  "t-q": { ad: "Üçleme (sekizlik + dörtlük)", vurus: 1, uclu: true, olaylar: [{ t: 0, d: T }, { t: T, d: 2 * T }] },
};

export type Desen = string[][]; // ölçüler → hücre adları

export type RitimSorusu = {
  tip: "ritim";
  metin: string;
  desen: Desen;
  secenekler: { id: string; desen: Desen }[];
  dogru: string;
  bpm: number;
  olcu: [number, number];
};

/** Desendeki atakların (vuruş cinsinden) başlangıç zamanları */
export function ataklar(desen: Desen, vurusOlcu = 4): number[] {
  const out: number[] = [];
  desen.forEach((olcu, i) => {
    let b = i * vurusOlcu;
    for (const h of olcu) {
      const c = HUCRE[h];
      for (const o of c.olaylar) if (!o.sus) out.push(+(b + o.t).toFixed(4));
      b += c.vurus;
    }
  });
  return out;
}

const imza = (d: Desen) => ataklar(d).join(",");

function olcuUret(hucreler: string[], vurusSayisi: number, sus?: number): string[] {
  for (let deneme = 0; deneme < 50; deneme++) {
    const out: string[] = [];
    let b = 0;
    while (b < vurusSayisi) {
      const kalan = vurusSayisi - b;
      // Belirli vuruşta dörtlük sus istenen adımlar (1.2–1.4): o vuruş sus, diğerleri hücrelerden
      if (sus) {
        const h = b + 1 === sus ? "qr" : sec(hucreler.filter((x) => x !== "qr"));
        out.push(h);
        b += HUCRE[h].vurus;
        continue;
      }
      const h = sec(hucreler.filter((x) => HUCRE[x].vurus <= kalan));
      out.push(h);
      b += HUCRE[h].vurus;
    }
    const atak = out.flatMap((h) => HUCRE[h].olaylar.filter((o) => !o.sus)).length;
    const cesitli = new Set(out).size > 1 || hucreler.length === 1;
    // Ölçüde en az iki atak olsun ve tek tip hücreden oluşmasın
    if (atak >= 2 && cesitli) return out;
  }
  return Array<string>(vurusSayisi).fill("q");
}

/** Doğru desenin tek bir vuruşunu değiştirerek yakın ama farklı şıklar üretir */
function celdirici(desen: Desen, havuz: string[]): Desen {
  const d = desen.map((o) => [...o]);
  const i = rnd(d.length);
  const olcu = d[i];
  const j = rnd(olcu.length);
  const v = HUCRE[olcu[j]].vurus;
  const adaylar = havuz.filter((h) => HUCRE[h].vurus === v && h !== olcu[j]);
  if (adaylar.length) olcu[j] = sec(adaylar);
  else if (v === 2) olcu.splice(j, 1, ...olcuUret(havuz.filter((h) => HUCRE[h].vurus === 1), 2));
  return d;
}

export function ritimSorusu(a: Extract<Alistirma, { tur: "ritim" }>): RitimSorusu {
  const vurusSayisi = a.olcu[0];
  const desen: Desen = Array.from({ length: a.olcuSayisi }, () => olcuUret(a.hucreler, vurusSayisi, a.sus));
  // Çeldiriciler için hücre havuzu: adımın hücreleri + aynı aileden temel hücreler
  const ek = a.hucreler.some((h) => HUCRE[h].uclu) ? ["t", "q", "qr", "ee"] : a.hucreler.some((h) => h.includes("s")) ? ["ee", "ssss", "q"] : ["q", "qr", "ee"];
  const havuz = [...new Set([...a.hucreler, ...ek])].filter((h) => HUCRE[h].vurus === 1 || a.hucreler.includes(h));
  const secenekler: { id: string; desen: Desen }[] = [{ id: "dogru", desen }];
  for (let k = 0; k < 40 && secenekler.length < 3; k++) {
    const c = celdirici(desen, havuz);
    if (!secenekler.some((s) => imza(s.desen) === imza(c))) secenekler.push({ id: `c${secenekler.length}`, desen: c });
  }
  return {
    tip: "ritim",
    metin: "Ritmi dinle, doğru yazımı seç; sonra aynı ritmi vurarak çal.",
    desen,
    secenekler: karistir(secenekler),
    dogru: "dogru",
    bpm: a.bpm[0] + rnd(a.bpm[1] - a.bpm[0] + 1),
    olcu: a.olcu,
  };
}

/**
 * Deseni çalar: bir ölçü sayım (tık), sonra desen; metronom tıkları sürer.
 * `dinle` false ise desen sesi çalmaz (kullanıcı vurur). Desenin başladığı AudioContext zamanını döndürür.
 */
export function cal(desen: Desen, bpm: number, olcu: [number, number], dinle = true): { bas: number; bitis: number } {
  const v = 60 / bpm;
  const t0 = simdi() + 0.15;
  const say = olcu[0];
  for (let i = 0; i < say; i++) tik(t0 + i * v, i === 0);
  const bas = t0 + say * v;
  const toplam = desen.length * say;
  for (let i = 0; i < toplam; i++) tik(bas + i * v, i % say === 0);
  if (dinle) for (const a of ataklar(desen, say)) vurus(bas + a * v);
  return { bas, bitis: bas + toplam * v };
}

/** Kullanıcının vuruş zamanları (AudioContext saniyesi) için gecikme düzeltmesi */
export function vurusZamani(): number {
  const c = audio();
  if (!c) return 0;
  const gecikme = (c.outputLatency || 0) + (c.baseLatency || 0);
  return c.currentTime - gecikme;
}

/**
 * Geri vurma puanı (0–100): her beklenen atak en yakın vuruşla eşleşir; zamanlama hatası
 * toleransın içindeyse kısmi puan, fazla vuruşlar ceza.
 */
export function vurusPuani(desen: Desen, bpm: number, olcu: [number, number], bas: number, vuruslar: number[]): number {
  const v = 60 / bpm;
  const bekl = ataklar(desen, olcu[0]).map((a) => bas + a * v);
  if (!bekl.length) return 0;
  const tol = Math.max(0.07, Math.min(0.14, v * 0.22));
  const kalan = [...vuruslar];
  let puan = 0;
  for (const b of bekl) {
    let en = -1;
    let fark = Infinity;
    kalan.forEach((x, i) => {
      if (Math.abs(x - b) < fark) {
        fark = Math.abs(x - b);
        en = i;
      }
    });
    if (en >= 0 && fark <= tol) {
      puan += fark <= tol / 2 ? 1 : 1 - (fark - tol / 2) / tol;
      kalan.splice(en, 1);
    }
  }
  const fazla = kalan.filter((x) => x > bas - tol && x < bas + (bekl.at(-1)! - bas) + v).length;
  return Math.max(0, Math.round(((puan - fazla * 0.5) / bekl.length) * 100));
}
