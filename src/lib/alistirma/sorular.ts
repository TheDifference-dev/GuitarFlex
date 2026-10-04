"use client";

// Teori yollarının soru üreteçleri. Her soru adımın ayarına göre rastgele, ama her zaman
// müzik kuramına uygun üretilir: notalar ve perdeler gerçek ses yüksekliklerinden hesaplanır.

import { akor, dizi, nota, simdi } from "@/lib/ses";
import { pentaBox } from "@/content/dizi";
import type { Alistirma } from "./tipler";
import {
  ACIK, AKOR_SEKLI, AKOR_TURU, ARALIK_ADI, GAM, MOD_IV, TEL_ADI, dogalMi, karistir, kisaAd, notaAdi, pc, perdeSes, rnd, romen, sec, secenekler,
} from "./muzik";
import { ritimSorusu, type RitimSorusu } from "./ritim";
import { armoniSorusu } from "./armoni";

export type Nokta = { s: number; f: number; etiket?: string; tur: "kok" | "nota" | "soru" | "referans" };
export type Sap = { perde: [number, number]; noktalar: Nokta[]; tel?: number };
export type Secenek = { id: string; ad: string; diyagram?: string };

export type SecimSorusu = {
  tip: "secim";
  metin: string;
  secenekler: Secenek[];
  dogru: string;
  sap?: Sap;
  diyagram?: string;
  /** Dinlenecek ses (kulak soruları); soru açılınca bir kez çalınır */
  ses?: () => void;
  aciklama?: string;
};

export type SapSorusu = {
  tip: "sap";
  metin: string;
  sap: Sap;
  /** Doğru konumlar "tel:perde" */
  hedef: string[];
  /** true: hedeflerin hepsi seçilip "Kontrol et"e basılır; false: tek tık, hedeflerden biri yeterli */
  coklu: boolean;
  ses?: () => void;
  aciklama?: string;
};

export type Soru = SecimSorusu | SapSorusu | RitimSorusu;

export const anahtar = (s: number, f: number) => `${s}:${f}`;
const isim = (p: number, yazim?: "diyez" | "bemol") => notaAdi(p, yazim);
const TELLER = [1, 2, 3, 4, 5, 6];
/** Kulak sorularında kullanılan rahat ses alanı (Mi2–Mi5 arası) */
const kokSec = (alt = 45, ust = 57) => alt + rnd(ust - alt + 1);

/* ------------------------------ Klavye ------------------------------ */

function telSorusu(teller: number[]): Soru {
  const s = sec(teller);
  if (Math.random() < 0.5) {
    return {
      tip: "secim",
      metin: "Vurgulanan tel hangisi?",
      sap: { perde: [0, 5], noktalar: [], tel: s },
      secenekler: TELLER.map((t) => ({ id: String(t), ad: TEL_ADI[t] })),
      dogru: String(s),
      aciklama: `${TEL_ADI[s]}. Teller inceden kalına 1'den 6'ya numaralanır.`,
    };
  }
  return {
    tip: "sap",
    metin: `${TEL_ADI[s]} telinde herhangi bir yere dokun.`,
    sap: { perde: [0, 5], noktalar: [] },
    hedef: [0, 1, 2, 3, 4, 5].map((f) => anahtar(s, f)),
    coklu: false,
    aciklama: `${TEL_ADI[s]}.`,
  };
}

function notaSorusu(a: Extract<Alistirma, { tur: "nota" }>): Soru {
  const [lo, hi] = a.perde;
  const uygun = (p: number) => (a.sesler === "dogal" ? dogalMi(p) : a.sesler === "arizali" ? !dogalMi(p) : true);
  const konumlar: { s: number; f: number }[] = [];
  for (const s of a.teller) for (let f = lo; f <= hi; f++) if (uygun(perdeSes(s, f))) konumlar.push({ s, f });
  const { s, f } = sec(konumlar);
  const p = perdeSes(s, f);
  const mod = a.mod === "karisik" ? (Math.random() < 0.5 ? "adlandir" : "bul") : a.mod;
  // Arızalı notada yazım verilmediyse rastgele diyez ya da bemol adıyla sor (ikisi de aynı ses)
  const yazim = a.yazim ?? (dogalMi(p) ? undefined : Math.random() < 0.5 ? "diyez" : "bemol");
  const ad = isim(p, yazim);
  if (mod === "adlandir") {
    const havuz = Array.from({ length: 12 }, (_, i) => i).filter((i) => uygun(i));
    const ops = secenekler(pc(p), havuz.length >= 4 ? havuz : Array.from({ length: 12 }, (_, i) => i));
    return {
      tip: "secim",
      metin: `${s}. teldeki işaretli nota hangisi?`,
      sap: { perde: [lo, Math.max(hi, 5)], noktalar: [{ s, f, tur: "soru", etiket: "?" }] },
      secenekler: ops.map((o) => ({ id: String(o), ad: isim(o, yazim) })),
      dogru: String(pc(p)),
      ses: () => nota(p),
      aciklama: `${s}. tel, ${f}. perde: ${notaAdi(p)}.`,
    };
  }
  const hedef: string[] = [];
  for (let g = lo; g <= hi; g++) if (pc(perdeSes(s, g)) === pc(p)) hedef.push(anahtar(s, g));
  return {
    tip: "sap",
    metin: `${TEL_ADI[s]} telinde ${ad} notasını bul.`,
    sap: { perde: [lo, Math.max(hi, 5)], noktalar: [] },
    hedef,
    coklu: false,
    ses: () => nota(p),
    aciklama: `${ad}: ${hedef.map((k) => `${k.split(":")[1]}. perde`).join(" ve ")}.`,
  };
}

function akorSorusu(akorlar: string[]): Soru {
  const dogru = sec(akorlar);
  const havuz = akorlar.length >= 3 ? akorlar : Object.keys(AKOR_SEKLI);
  const ops = secenekler(dogru, havuz, Math.min(4, havuz.length));
  const sesler = AKOR_SEKLI[dogru]
    .split(" ")
    .map((x, i) => (x === "x" ? null : ACIK[6 - i] + Number(x)))
    .filter((m): m is number => m !== null);
  if (Math.random() < 0.5) {
    return {
      tip: "secim",
      metin: "Bu akor diyagramı hangi akoru gösteriyor?",
      diyagram: AKOR_SEKLI[dogru],
      secenekler: ops.map((o) => ({ id: o, ad: o })),
      dogru,
      ses: () => akor(sesler),
    };
  }
  return {
    tip: "secim",
    metin: `${dogru} akorunun diyagramını seç.`,
    secenekler: ops.map((o) => ({ id: o, ad: "", diyagram: AKOR_SEKLI[o] })),
    dogru,
    aciklama: `${dogru}: ${AKOR_SEKLI[dogru]}`,
  };
}

function oktavSorusu(atlama: number | null): Soru {
  const k = atlama ?? rnd(6);
  const s = k + 1 + rnd(6 - k);
  const t = s - k;
  const f = k === 0 ? rnd(4) : rnd(9);
  const p = perdeSes(s, f);
  const hedef: string[] = [];
  for (let g = 0; g <= 15; g++) if (pc(perdeSes(t, g)) === pc(p) && !(t === s && g === f)) hedef.push(anahtar(t, g));
  return {
    tip: "sap",
    metin:
      k === 0
        ? `İşaretli ${kisaAd(p)} notasının oktavını aynı telde bul.`
        : `İşaretli ${kisaAd(p)} notasının oktavını ${t}. telde bul (${k === 1 ? "komşu tel" : `${k - 1} tel atlayarak`}).`,
    sap: { perde: [0, 15], noktalar: [{ s, f, tur: "kok", etiket: kisaAd(p) }] },
    hedef,
    coklu: false,
    ses: () => dizi([p, p + 12]),
    aciklama: `${notaAdi(p)}: ${t}. telde ${hedef.map((h) => h.split(":")[1]).join(" ya da ")}. perde.`,
  };
}

const MINOR_PENTA = GAM["minor-penta"].iv;

function pentatonikSorusu(sekil: number | null, gorev: "kok" | "kokler"): Soru {
  const n = (sekil ?? 1 + rnd(5)) - 1;
  const baslangic = 1 + rnd(8);
  const kok = 40 + baslangic - MINOR_PENTA[n];
  const kutu = pentaBox(kok, MINOR_PENTA, n);
  const lo = Math.min(...kutu.map((p) => p.f));
  const hi = Math.max(...kutu.map((p) => p.f));
  const perde: [number, number] = [Math.max(0, lo - 2), Math.max(hi + 2, lo + 7)];
  const kokler = kutu.filter((p) => pc(p.m) === pc(kok));
  const ad = `${n + 1}. şekil`;
  if (gorev === "kok") {
    const ops = secenekler(pc(kok), Array.from({ length: 12 }, (_, i) => i));
    return {
      tip: "secim",
      metin: `Minör pentatonik ${ad} sapta gösteriliyor. Hangi tonda?`,
      sap: { perde, noktalar: kutu.map((p) => ({ s: p.s, f: p.f, tur: "nota" as const })) },
      secenekler: ops.map((o) => ({ id: String(o), ad: `${notaAdi(o)} minör` })),
      dogru: String(pc(kok)),
      ses: () => dizi(kutu.map((p) => p.m), undefined, 0.18),
      aciklama: `Kök notalar: ${kokler.map((p) => `${p.s}. tel ${p.f}. perde`).join(", ")} → ${notaAdi(kok)} minör pentatonik.`,
    };
  }
  return {
    tip: "sap",
    metin: `${notaAdi(kok)} minör pentatonik, ${ad}. Bütün kök (${kisaAd(kok)}) notalarını seç.`,
    sap: { perde, noktalar: kutu.map((p) => ({ s: p.s, f: p.f, tur: "nota" as const })) },
    hedef: kokler.map((p) => anahtar(p.s, p.f)),
    coklu: true,
    aciklama: `Kökler: ${kokler.map((p) => `${p.s}. tel ${p.f}. perde`).join(", ")}.`,
  };
}

/** CAGED formları: açık akor şekli (kalın Mi → ince Mi) ve kök telleri */
const CAGED: Record<"C" | "A" | "G" | "E" | "D", { sekil: (number | null)[]; acik: number }> = {
  C: { sekil: [null, 3, 2, 0, 1, 0], acik: 0 },
  A: { sekil: [null, 0, 2, 2, 2, 0], acik: 9 },
  G: { sekil: [3, 2, 0, 0, 0, 3], acik: 7 },
  E: { sekil: [0, 2, 2, 1, 0, 0], acik: 4 },
  D: { sekil: [null, null, 0, 2, 3, 2], acik: 2 },
};

function cagedSorusu(formAd: "C" | "A" | "G" | "E" | "D" | null, gorev: "kokler" | "tamamla"): Soru {
  const form = formAd ?? sec(["C", "A", "G", "E", "D"] as const);
  const { sekil, acik } = CAGED[form];
  const kay = 1 + rnd(9);
  const kokPc = pc(acik + kay);
  const notalar = sekil
    .map((x, i) => (x === null ? null : { s: 6 - i, f: x + kay }))
    .filter((p): p is { s: number; f: number } => p !== null);
  const lo = Math.min(...notalar.map((p) => p.f));
  const hi = Math.max(...notalar.map((p) => p.f));
  const perde: [number, number] = [Math.max(0, lo - 2), Math.max(hi + 3, lo + 7)];
  const kokMu = (p: { s: number; f: number }) => pc(perdeSes(p.s, p.f)) === kokPc;
  const ad = `${notaAdi(kokPc)} majör`;
  if (gorev === "kokler") {
    return {
      tip: "sap",
      metin: `${form} formunda ${ad} akoru. Bütün kök notalarını seç.`,
      sap: { perde, noktalar: notalar.map((p) => ({ ...p, tur: "nota" as const })) },
      hedef: notalar.filter(kokMu).map((p) => anahtar(p.s, p.f)),
      coklu: true,
      ses: () => akor(notalar.map((p) => perdeSes(p.s, p.f))),
      aciklama: `${form} formunun kökleri ${notalar.filter(kokMu).map((p) => `${p.s}.`).join(", ")} tellerde.`,
    };
  }
  const gizli = karistir(notalar.filter((p) => !kokMu(p))).slice(0, 2);
  const gizliMi = (p: { s: number; f: number }) => gizli.some((g) => g.s === p.s && g.f === p.f);
  return {
    tip: "sap",
    metin: `${form} formunda ${ad} akorunun eksik ${gizli.length} notasını tamamla.`,
    sap: {
      perde,
      noktalar: notalar.filter((p) => !gizliMi(p)).map((p) => ({ ...p, tur: kokMu(p) ? ("kok" as const) : ("nota" as const), etiket: kokMu(p) ? "K" : undefined })),
    },
    hedef: gizli.map((p) => anahtar(p.s, p.f)),
    coklu: true,
    ses: () => akor(notalar.map((p) => perdeSes(p.s, p.f))),
    aciklama: `Eksik notalar: ${gizli.map((p) => `${p.s}. tel ${p.f}. perde (${kisaAd(perdeSes(p.s, p.f))})`).join(", ")}.`,
  };
}

function ucNotaSorusu(modAd: string | null): Soru {
  const mod = modAd ?? sec(Object.keys(MOD_IV));
  const iv = MOD_IV[mod];
  const baslangic = 1 + rnd(7);
  const kok = 40 + baslangic;
  const notalar: { s: number; f: number; m: number }[] = [];
  let s = 6;
  for (let i = 0; i < 18; i++) {
    if (i > 0 && i % 3 === 0) s--;
    const m = kok + 12 * Math.floor(i / 7) + iv[i % 7];
    notalar.push({ s, f: m - ACIK[s], m });
  }
  const kokMu = (p: { m: number }) => pc(p.m) === pc(kok);
  const gizli = karistir(notalar.filter((p) => !kokMu(p))).slice(0, 3);
  const gizliMi = (p: { s: number; f: number }) => gizli.some((g) => g.s === p.s && g.f === p.f);
  const lo = Math.min(...notalar.map((p) => p.f));
  const hi = Math.max(...notalar.map((p) => p.f));
  return {
    tip: "sap",
    metin: `${notaAdi(kok)} ${mod} 3 nota/tel kalıbında eksik 3 notayı tamamla.`,
    sap: {
      perde: [Math.max(0, lo - 1), hi + 1],
      noktalar: notalar.filter((p) => !gizliMi(p)).map((p) => ({ s: p.s, f: p.f, tur: kokMu(p) ? ("kok" as const) : ("nota" as const), etiket: kokMu(p) ? "K" : undefined })),
    },
    hedef: gizli.map((p) => anahtar(p.s, p.f)),
    coklu: true,
    ses: () => dizi(notalar.slice(0, 8).map((p) => p.m), undefined, 0.2),
    aciklama: `Eksik notalar: ${gizli.map((p) => `${p.s}. tel ${p.f}. perde (${kisaAd(p.m)})`).join(", ")}.`,
  };
}

const DERECE_AD = ["1 (kök)", "2", "3", "4", "5", "6", "7"];

function dereceSorusu(): Soru {
  const s = sec([6, 5]);
  const f = 2 + rnd(7);
  const kok = perdeSes(s, f);
  const major = GAM.major.iv;
  // Kökün bulunduğu pozisyonda (kök perdesinin 1 altı ile 3 üstü arası) gam notaları
  const adaylar: { s: number; f: number; d: number }[] = [];
  for (let t = s; t >= s - 2; t--)
    for (let g = f - 1; g <= f + 3; g++) {
      const d = major.indexOf(pc(perdeSes(t, g) - kok));
      if (d > 0 && g >= 0) adaylar.push({ s: t, f: g, d });
    }
  const hedef = sec(adaylar);
  const ops = secenekler(hedef.d, [1, 2, 3, 4, 5, 6]);
  return {
    tip: "secim",
    metin: `K, ${notaAdi(kok)} majör gamının kökü. İşaretli nota gamın kaçıncı derecesi?`,
    sap: { perde: [Math.max(0, f - 3), f + 6], noktalar: [{ s, f, tur: "kok", etiket: "K" }, { s: hedef.s, f: hedef.f, tur: "soru", etiket: "?" }] },
    secenekler: ops.map((o) => ({ id: String(o), ad: `${DERECE_AD[o]}. derece` })),
    dogru: String(hedef.d),
    ses: () => dizi([kok, perdeSes(hedef.s, hedef.f)]),
    aciklama: `${notaAdi(perdeSes(hedef.s, hedef.f))}, ${notaAdi(kok)} majörün ${hedef.d + 1}. derecesi.`,
  };
}

/* ------------------------------ Kulak ------------------------------ */

const ikiSes = (a: number, b: number) => () => {
  const t = simdi() + 0.05;
  nota(a, t, 1.1);
  nota(b, t + 0.9, 1.4);
};

function sesSorusu(a: Extract<Alistirma, { tur: "ses" }>): Soru {
  const [lo, hi] = a.aralik;
  const alt = Math.max(1, lo);
  const ilk = kokSec(48, 64);
  if (a.gorev === "ayni-farkli") {
    const ayni = Math.random() < 0.5;
    const fark = (alt + rnd(hi - alt + 1)) * (Math.random() < 0.5 ? 1 : -1);
    const ikinci = ayni ? ilk : ilk + fark;
    return {
      tip: "secim",
      metin: "İki sesi dinle. Aynı mı, farklı mı?",
      secenekler: [{ id: "ayni", ad: "Aynı" }, { id: "farkli", ad: "Farklı" }],
      dogru: ayni ? "ayni" : "farkli",
      ses: ikiSes(ilk, ikinci),
      aciklama: ayni ? "İki ses aynıydı." : `İkinci ses ${Math.abs(fark)} yarım ses ${fark > 0 ? "tizdi" : "pesti"}.`,
    };
  }
  if (a.gorev === "oktav") {
    const oktav = Math.random() < 0.5;
    const fark = (oktav ? 12 : 1 + rnd(11)) * (Math.random() < 0.5 ? 1 : -1);
    return {
      tip: "secim",
      metin: "İki ses arasında oktav mı var?",
      secenekler: [{ id: "evet", ad: "Oktav" }, { id: "hayir", ad: "Oktav değil" }],
      dogru: oktav ? "evet" : "hayir",
      ses: ikiSes(ilk, ilk + fark),
      aciklama: oktav ? "Aynı nota, bir oktav arayla." : `Aralık: ${ARALIK_ADI[Math.abs(fark)]}.`,
    };
  }
  const fark = (alt + rnd(hi - alt + 1)) * (Math.random() < 0.5 ? 1 : -1);
  return {
    tip: "secim",
    metin: "İkinci ses birinciye göre daha tiz mi, daha pes mi?",
    secenekler: [{ id: "tiz", ad: "Daha tiz (ince)" }, { id: "pes", ad: "Daha pes (kalın)" }],
    dogru: fark > 0 ? "tiz" : "pes",
    ses: ikiSes(ilk, ilk + fark),
    aciklama: `${Math.abs(fark)} yarım ses ${fark > 0 ? "yukarı" : "aşağı"}.`,
  };
}

function referansSorusu(a: Extract<Alistirma, { tur: "referans" }>): Soru {
  const s = sec(a.teller);
  const d = 1 + rnd(a.maks);
  const yon = a.yon === "iki" ? (Math.random() < 0.5 ? 1 : -1) : a.yon === "tiz" ? 1 : -1;
  const ref = yon > 0 ? 1 + rnd(5) : d + rnd(5);
  const f = ref + yon * d;
  return {
    tip: "sap",
    metin: `R referans sesi. Ardından gelen sesi ${s}. telde bul.`,
    sap: { perde: [0, 12], noktalar: [{ s, f: ref, tur: "referans", etiket: "R" }], tel: s },
    hedef: [anahtar(s, f)],
    coklu: false,
    ses: ikiSes(perdeSes(s, ref), perdeSes(s, f)),
    aciklama: `${f}. perde (${notaAdi(perdeSes(s, f))}): referanstan ${d} perde ${yon > 0 ? "yukarı" : "aşağı"}.`,
  };
}

function aralikSorusu(araliklar: number[]): Soru {
  const iv = sec(araliklar);
  const kok = kokSec(48, 60);
  const ops = secenekler(iv, araliklar.length >= 2 ? araliklar : Object.keys(ARALIK_ADI).map(Number), 4);
  return {
    tip: "secim",
    metin: "Duyduğun aralık hangisi? (önce ayrı ayrı, sonra birlikte)",
    secenekler: ops.map((o) => ({ id: String(o), ad: ARALIK_ADI[o] })),
    dogru: String(iv),
    ses: () => {
      const t = simdi() + 0.05;
      nota(kok, t, 1);
      nota(kok + iv, t + 0.8, 1);
      nota(kok, t + 1.8, 1.6);
      nota(kok + iv, t + 1.8, 1.6);
    },
    aciklama: `${notaAdi(kok)} → ${notaAdi(kok + iv)}: ${ARALIK_ADI[iv]}, ${iv} yarım ses.`,
  };
}

function akorTuruSorusu(turler: string[]): Soru {
  const tur = sec(turler);
  const kok = kokSec(45, 55);
  const sesler = AKOR_TURU[tur].iv.map((i) => kok + i);
  const ops = secenekler(tur, turler, Math.min(4, turler.length));
  return {
    tip: "secim",
    metin: "Akor hangi türde? (önce tek tek, sonra birlikte)",
    secenekler: ops.map((o) => ({ id: o, ad: AKOR_TURU[o].ad })),
    dogru: tur,
    ses: () => {
      const t = simdi() + 0.05;
      akor(sesler, t, { arpej: true });
      akor(sesler, t + sesler.length * 0.32 + 0.5);
    },
    aciklama: `${notaAdi(kok)} ${AKOR_TURU[tur].ad}: ${sesler.map(kisaAd).join(" – ")}.`,
  };
}

function gamSorusu(gamlar: string[]): Soru {
  const g = sec(gamlar);
  const kok = kokSec(48, 57);
  const iv = GAM[g].iv;
  const yukari = [...iv.map((i) => kok + i), kok + 12];
  const ops = secenekler(g, gamlar, Math.min(4, gamlar.length));
  return {
    tip: "secim",
    metin: "Duyduğun gam hangisi? (çıkış ve iniş)",
    secenekler: ops.map((o) => ({ id: o, ad: GAM[o].ad })),
    dogru: g,
    ses: () => dizi([...yukari, ...yukari.slice(0, -1).reverse()], undefined, 0.3),
    aciklama: `${notaAdi(kok)} ${GAM[g].ad}: ${yukari.slice(0, -1).map(kisaAd).join(" – ")}.`,
  };
}

const romenYaz = (xs: string[]) => xs.join(" – ");

function progresyonSorusu(listeler: string[][]): Soru {
  const dogru = sec(listeler);
  const ton = 43 + rnd(7);
  return {
    tip: "secim",
    metin: "Duyduğun akor yürüyüşü hangisi? (ilk akor tonun I'i ya da i'si)",
    secenekler: listeler.map((l) => ({ id: romenYaz(l), ad: romenYaz(l) })),
    dogru: romenYaz(dogru),
    ses: () => {
      const t0 = simdi() + 0.05;
      dogru.forEach((r, i) => {
        const { kok, iv } = romen(r);
        const bas = ton + kok;
        // Bas kökte, üçlü yakın konumda 55–67 aralığında
        const ust = iv.map((x) => {
          let m = bas + x;
          while (m < 55) m += 12;
          while (m > 67) m -= 12;
          return m;
        });
        akor([bas, ...ust], t0 + i * 1.3, { seconds: 1.3 });
      });
    },
    aciklama: `Ton: ${notaAdi(ton)}. ${romenYaz(dogru)}.`,
  };
}

/* ------------------------------ Dağıtıcı ------------------------------ */

export function soruUret(a: Alistirma): Soru {
  switch (a.tur) {
    case "tel":
      return telSorusu(a.teller);
    case "nota":
      return notaSorusu(a);
    case "akor":
      return akorSorusu(a.akorlar);
    case "oktav":
      return oktavSorusu(a.atlama);
    case "pentatonik":
      return pentatonikSorusu(a.sekil, a.gorev);
    case "caged":
      return cagedSorusu(a.form, a.gorev);
    case "3nps":
      return ucNotaSorusu(a.mod);
    case "derece":
      return dereceSorusu();
    case "ses":
      return sesSorusu(a);
    case "referans":
      return referansSorusu(a);
    case "aralik":
      return aralikSorusu(a.araliklar);
    case "akorTuru":
      return akorTuruSorusu(a.turler);
    case "gam":
      return gamSorusu(a.gamlar);
    case "progresyon":
      return progresyonSorusu(a.secenekler);
    case "teori":
      return armoniSorusu(a.konu);
    case "ritim":
      return ritimSorusu(a);
    case "karma":
      return soruUret(sec(a.parcalar));
  }
}

/** Bir adımın soru listesi: arka arkaya aynı sorunun gelmemesine dikkat edilir */
export function soruListesi(a: Alistirma, n: number): Soru[] {
  const out: Soru[] = [];
  let deneme = 0;
  while (out.length < n && deneme < n * 20) {
    deneme++;
    const q = soruUret(a);
    const imza = JSON.stringify({ ...q, ses: undefined });
    const onceki = out.at(-1);
    if (onceki && JSON.stringify({ ...onceki, ses: undefined }) === imza && deneme < n * 10) continue;
    out.push(q);
  }
  return out;
}
