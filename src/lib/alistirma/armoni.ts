"use client";

// Armoni (Müzik Teorisi Dersleri) pratik soruları: nota adları, majör dizi, 5'li ve üç sesli akorlar,
// modlar, diyatonik akorlar, akor yürüyüşleri ve dört sesli akorlar. Notalar harf adına göre
// doğru yazılır (Fa majörde Si♭, La# değil); arızası iki katına çıkan tonlar kullanılmaz.

import { akor, dizi, simdi } from "@/lib/ses";
import {
  DORTLU_HARF, GAM, GAM_HARF, MAJOR_TONLAR, MOD_IV, UCLU_HARF, adEn, adSes, adTr, adYaz, ciftArizaMi, karistir, notaAdi, pc, rnd, sec, secenekler, yazDizi, yukari, type Ad,
} from "./muzik";
import type { SecimSorusu } from "./sorular";

export type ArmoniKonu = "giris" | "gam" | "besli" | "uclu" | "mod" | "modFormul" | "modAnla" | "diyatonik" | "yuruyus" | "dortlu" | "yedili";

const liste = (ns: Ad[]) => ns.map(adTr).join(" – ");
const soru = (metin: string, dogru: string, yanlislar: string[], aciklama?: string, ses?: () => void): SecimSorusu => {
  // Çift arızalı (𝄪, ♭♭) yanlış şıklar kafa karıştırmasın diye kullanılmaz
  const temiz = [...new Set(yanlislar)].filter((x) => x !== dogru && !x.includes("𝄪") && !x.includes("♭♭"));
  const ops = karistir([dogru, ...karistir(temiz).slice(0, 3)]);
  return { tip: "secim", metin, secenekler: ops.map((o) => ({ id: o, ad: o })), dogru, aciklama, ses };
};
/** Doğru listedeki bir notanın arızasını ±1 değiştirerek yanlış şık üretir */
function bozuk(ns: Ad[], kac = 3): string[] {
  const out = new Set<string>();
  for (let k = 0; k < 40 && out.size < kac; k++) {
    const i = 1 + rnd(ns.length - 1);
    const d = Math.random() < 0.5 ? 1 : -1;
    const yeni = ns.map((n, j) => (j === i ? { ...n, a: n.a + d } : n));
    if (!ciftArizaMi(yeni)) out.add(liste(yeni));
  }
  return [...out];
}
const calDizi = (ns: Ad[]) => () => {
  // Çıkıcı dizi: her nota bir öncekinden tiz, sonunda kökün oktavı
  let m = 48 + adSes(ns[0]);
  const ms = [m];
  for (const n of ns.slice(1)) {
    m++;
    while (pc(m) !== adSes(n)) m++;
    ms.push(m);
  }
  dizi([...ms, ms[0] + 12], undefined, 0.3);
};
const calAkor = (ns: Ad[]) => () => {
  const kok = 48 + adSes(ns[0]);
  const ms = ns.map((n) => {
    let m = 48 + adSes(n);
    while (m < kok) m += 12;
    return m;
  });
  const t = simdi() + 0.05;
  akor(ms, t, { arpej: true });
  akor(ms, t + ms.length * 0.32 + 0.4);
};

/* ---------- Akor türleri: formül, harf adımları, ad ve sembol ---------- */
const TUR = {
  maj: { iv: [0, 4, 7], h: UCLU_HARF, ad: "majör", uzun: "Majör", sem: "", formul: "1 – 3 – 5" },
  min: { iv: [0, 3, 7], h: UCLU_HARF, ad: "minör", uzun: "Minör", sem: "m", formul: "1 – ♭3 – 5" },
  dim: { iv: [0, 3, 6], h: UCLU_HARF, ad: "eksik", uzun: "Eksik (dim)", sem: "dim", formul: "1 – ♭3 – ♭5" },
  aug: { iv: [0, 4, 8], h: UCLU_HARF, ad: "artık", uzun: "Artık (aug)", sem: "aug", formul: "1 – 3 – ♯5" },
  maj7: { iv: [0, 4, 7, 11], h: DORTLU_HARF, ad: "majör 7", uzun: "Majör 7 (maj7)", sem: "maj7", formul: "1 – 3 – 5 – 7" },
  dom7: { iv: [0, 4, 7, 10], h: DORTLU_HARF, ad: "dominant 7", uzun: "Dominant 7 (7)", sem: "7", formul: "1 – 3 – 5 – ♭7" },
  m7: { iv: [0, 3, 7, 10], h: DORTLU_HARF, ad: "minör 7", uzun: "Minör 7 (m7)", sem: "m7", formul: "1 – ♭3 – 5 – ♭7" },
  m7b5: { iv: [0, 3, 6, 10], h: DORTLU_HARF, ad: "yarım eksik", uzun: "Yarım eksik (m7♭5)", sem: "m7♭5", formul: "1 – ♭3 – ♭5 – ♭7" },
} as const;
type Tur = keyof typeof TUR;
const akorAd = (kok: Ad, t: Tur) => `${adTr(kok)} ${TUR[t].ad} (${adEn(kok)}${TUR[t].sem})`;
const akorSem = (kok: Ad, t: Tur) => `${adEn(kok)}${TUR[t].sem}`;

/** Majör dizinin dereceleri: üç sesli ve dört sesli akor türleri */
const DIYATONIK_UC: Tur[] = ["maj", "min", "min", "maj", "maj", "min", "dim"];
const DIYATONIK_DORT: Tur[] = ["maj7", "m7", "m7", "maj7", "dom7", "m7", "m7b5"];
const ROMEN = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
const ROMEN7 = ["Imaj7", "ii7", "iii7", "IVmaj7", "V7", "vi7", "viiø7"];
const majorDizi = (kok: Ad) => yazDizi(kok, GAM.major.iv, GAM_HARF);
const ton = () => sec(MAJOR_TONLAR);

/** Akor kökü: doğal notalar ve sık kullanılan arızalılar; çift arıza çıkarsa yeniden seçilir */
function kokSec(t: Tur): Ad {
  const havuz: Ad[] = [...Array.from({ length: 7 }, (_, h) => ({ h, a: 0 })), { h: 3, a: 1 }, { h: 6, a: -1 }, { h: 2, a: -1 }, { h: 5, a: -1 }, { h: 0, a: 1 }];
  for (;;) {
    const k = sec(havuz);
    if (!ciftArizaMi(yazDizi(k, TUR[t].iv, TUR[t].h))) return k;
  }
}

const ARIZA_SAYI = (kok: Ad) => majorDizi(kok).filter((n) => n.a !== 0).length;
const DERECE = ["1.", "2.", "3.", "4.", "5.", "6.", "7."];
const MODLAR = Object.keys(MOD_IV);
const MOD_FORMUL: Record<string, string> = {
  Ionian: "1 2 3 4 5 6 7",
  Dorian: "1 2 ♭3 4 5 6 ♭7",
  Phrygian: "1 ♭2 ♭3 4 5 ♭6 ♭7",
  Lydian: "1 2 3 ♯4 5 6 7",
  Mixolydian: "1 2 3 4 5 6 ♭7",
  Aeolian: "1 2 ♭3 4 5 ♭6 ♭7",
  Locrian: "1 ♭2 ♭3 4 ♭5 ♭6 ♭7",
};
/** Her modu tek başına ayırt eden özellik */
const MOD_AYIRT: Record<string, string> = {
  Ionian: "majör 3'lü, tam 4'lü ve majör 7'li",
  Dorian: "minör 3'lü ile birlikte majör 6'lı",
  Phrygian: "♭2 ile birlikte tam 5'li",
  Lydian: "♯4 (artık 4'lü)",
  Mixolydian: "majör 3'lü ile birlikte ♭7",
  Aeolian: "majör 2'li ile birlikte ♭6",
  Locrian: "♭5 (eksik 5'li)",
};

function giris(): SecimSorusu {
  const tip = rnd(3);
  if (tip === 0) {
    const p = rnd(12);
    const yarim = sec([1, 2, -1, -2]);
    const yon = `${Math.abs(yarim) === 1 ? "yarım" : "tam"} ses ${yarim > 0 ? "yukarısı" : "aşağısı"}`;
    const dogru = notaAdi(p + yarim);
    return soru(`${notaAdi(p)} notasının bir ${yon} hangisi?`, dogru, secenekler(p + yarim, [p - 2, p - 1, p + 1, p + 2, p + 3, p - 3]).map((x) => notaAdi(x)), `Bir yarım ses = bir perde, bir tam ses = iki perde.`);
  }
  if (tip === 1) {
    const dogru = sec(["Mi – Fa", "Si – Do"]);
    return soru("Hangi iki doğal nota arasında yarım ses (bir perde) vardır?", dogru, karistir(["Do – Re", "Re – Mi", "Fa – Sol", "Sol – La", "La – Si"]), "Doğal notalar arasında yalnızca Mi–Fa ve Si–Do yarım sestir; diğerleri tam ses.");
  }
  const h = sec([0, 1, 3, 4, 5]);
  const diyez: Ad = { h, a: 1 };
  const bemol = yukari(diyez, 1, 0);
  return soru(`${adYaz(diyez)} ile aynı perdede çalınan (enarmonik) nota hangisi?`, adYaz(bemol), [adYaz({ h: (h + 1) % 7, a: 0 }), adYaz({ h, a: -1 }), adYaz({ h: (h + 1) % 7, a: 1 })], "Diyez yarım ses yükseltir, bemol yarım ses alçaltır; komşu harfin bemolü aynı sestir.");
}

function gam(): SecimSorusu {
  const tip = rnd(4);
  const kok = ton();
  const ns = majorDizi(kok);
  if (tip === 0) {
    const d = 1 + rnd(6);
    const dogru = adYaz(ns[d]);
    const adaylar: Ad[] = [{ ...ns[d], a: ns[d].a + (ns[d].a >= 1 ? -1 : 1) }, ns[(d + 1) % 7], ns[d - 1], yukari(ns[d], 6, 0)];
    const yanlis = adaylar.filter((n) => Math.abs(n.a) <= 1).map(adYaz);
    return soru(`${adTr(kok)} majör dizisinin ${DERECE[d]} derecesi hangisi?`, dogru, yanlis, `${adTr(kok)} majör: ${liste(ns)}.`, calDizi(ns));
  }
  if (tip === 1) {
    return soru(`${adTr(kok)} majör dizisinin notaları hangisi?`, liste(ns), bozuk(ns), "Formül: T T Y T T T Y. Her harf bir kez kullanılır.", calDizi(ns));
  }
  if (tip === 2) {
    return soru("Majör dizinin tam (T) ve yarım (Y) ses formülü hangisi?", "T T Y T T T Y", ["T Y T T Y T T", "T T T Y T T Y", "T Y T T T Y T"], "Do majör: Do-Re T, Re-Mi T, Mi-Fa Y, Fa-Sol T, Sol-La T, La-Si T, Si-Do Y.");
  }
  const n = ARIZA_SAYI(kok);
  const tur = kok.a < 0 || (kok.h === 3 && kok.a === 0) ? "bemol" : "diyez";
  const sayilar = secenekler(n, [0, 1, 2, 3, 4, 5, 6]);
  return soru(`${adTr(kok)} majör dizisinde kaç ${n === 0 ? "arıza (diyez/bemol)" : tur} vardır?`, String(n), sayilar.map(String), `${adTr(kok)} majör: ${liste(ns)}.`);
}

const BES_AD = ["C", "C#", "D", "E♭", "E", "F", "F#", "G", "A♭", "A", "B♭", "B"];

function besli(): SecimSorusu {
  const tip = rnd(3);
  if (tip === 0) {
    const kok = kokSec("maj");
    const bes = yukari(kok, 4, 7);
    return soru(`${adEn(kok)}5 (5'li akor) hangi notalardan oluşur?`, `${adTr(kok)} – ${adTr(bes)}`, [`${adTr(kok)} – ${adTr(yukari(kok, 2, 4))}`, `${adTr(kok)} – ${adTr(yukari(kok, 3, 5))}`, `${adTr(kok)} – ${adTr(yukari(kok, 4, 6))}`], "5'li akor (power chord) kök ve tam 5'li aralıktan (7 yarım ses) oluşur.", calAkor([kok, bes]));
  }
  if (tip === 1) {
    return soru("5'li akor neden majör ya da minör sayılmaz?", "3'lüsü olmadığı için", ["5'lisi olmadığı için", "Sadece iki telde çalındığı için", "Kökü bas telde olduğu için"], "Akorun majör ya da minör olduğunu 3'lü belirler; 5'li akorda 3'lü yoktur.");
  }
  const f = 1 + rnd(10);
  const p = 40 + f;
  const ad = (x: number) => `${BES_AD[pc(x)]}5`;
  return soru(`Kökü 6. telin ${f}. perdesinde, 5'lisi 5. telin ${f + 2}. perdesinde olan 5'li akor hangisi?`, ad(p), secenekler(p, [p - 2, p - 1, p + 1, p + 2, p + 5, p + 7]).map(ad), `6. telin ${f}. perdesi ${notaAdi(p)}.`);
}

function uclu(): SecimSorusu {
  const tip = rnd(3);
  const t = sec(["maj", "min", "dim", "aug"] as const);
  const kok = kokSec(t);
  const ns = yazDizi(kok, TUR[t].iv, TUR[t].h);
  if (tip === 0) return soru(`${akorAd(kok, t)} üç seslisinin notaları hangisi?`, liste(ns), bozuk(ns), `Formül: ${TUR[t].formul}.`, calAkor(ns));
  if (tip === 1) {
    const dogru = akorAd(kok, t);
    const yanlis = (["maj", "min", "dim", "aug"] as const).filter((x) => x !== t).map((x) => akorAd(kok, x));
    return soru(`${liste(ns)} hangi akoru oluşturur?`, dogru, yanlis, `Formül: ${TUR[t].formul}.`, calAkor(ns));
  }
  return soru(`${TUR[t].uzun} üç seslinin formülü hangisi?`, TUR[t].formul, (["maj", "min", "dim", "aug"] as const).map((x) => TUR[x].formul), "Üç sesli akor kök, 3'lü ve 5'liden oluşur.");
}

function mod(): SecimSorusu {
  const tip = rnd(2);
  const d = rnd(7);
  if (tip === 0) {
    const dogru = `${MODLAR[d]} (${DERECE[d]} derece)`;
    return soru(`Bir majör dizinin ${DERECE[d]} derecesinden başlayıp aynı notalarla çalınan mod hangisi?`, dogru, MODLAR.map((m, i) => `${m} (${DERECE[i]} derece)`), "Ionian 1, Dorian 2, Phrygian 3, Lydian 4, Mixolydian 5, Aeolian 6, Locrian 7. dereceden başlar.");
  }
  const ana = ton();
  const ns = majorDizi(ana);
  const kok = ns[d];
  if (ciftArizaMi([kok])) return mod();
  return soru(`${adTr(kok)} ${MODLAR[d]} hangi majör dizinin notalarını kullanır?`, `${adTr(ana)} majör`, [ns[(d + 1) % 7], ns[(d + 3) % 7], ns[(d + 4) % 7], yukari(ana, 4, 7)].map((n) => `${adTr(n)} majör`), `${MODLAR[d]} majör dizinin ${DERECE[d]} derecesinden başlar: ${adTr(kok)} = ${adTr(ana)} majörün ${DERECE[d]} notası.`);
}

function modFormul(): SecimSorusu {
  const m = sec(MODLAR);
  if (Math.random() < 0.5) return soru(`${m} modunun formülü hangisi?`, MOD_FORMUL[m], MODLAR.filter((x) => x !== m).map((x) => MOD_FORMUL[x]).sort(() => Math.random() - 0.5), `Ayırt edici özelliği: ${MOD_AYIRT[m]}.`);
  return soru(`Formülünde ${MOD_AYIRT[m]} olan mod hangisi?`, m, MODLAR, `${m}: ${MOD_FORMUL[m]}.`);
}

function modAnla(): SecimSorusu {
  const kok: Ad = { h: 0, a: 0 };
  const m = sec(MODLAR);
  const ns = yazDizi(kok, MOD_IV[m], GAM_HARF);
  const tip = rnd(3);
  if (tip === 0) return soru(`Do ${m} modunun notaları hangisi?`, liste(ns), bozuk(ns), `Formül: ${MOD_FORMUL[m]}.`, calDizi(ns));
  if (tip === 1) {
    const isim = (x: string) => (["Ionian", "Lydian", "Mixolydian"].includes(x) ? "Majör (3'lüsü majör)" : "Minör (3'lüsü minör)");
    return soru(`${m} modu majör karakterli mi, minör karakterli mi?`, isim(m), ["Majör (3'lüsü majör)", "Minör (3'lüsü minör)"], "Mod karakterini 3. derece belirler: Ionian, Lydian, Mixolydian majör; Dorian, Phrygian, Aeolian, Locrian minör karakterlidir.");
  }
  const fark = (x: string) => {
    const f = MOD_FORMUL[x].split(" ");
    const maj = MOD_FORMUL.Ionian.split(" ");
    const d = f.filter((s, i) => s !== maj[i]);
    return d.length ? d.join(", ") : "Fark yok";
  };
  return soru(`Do ${m}, Do majörden (Ionian) hangi derecelerde ayrılır?`, fark(m), MODLAR.filter((x) => x !== m).map(fark), `Do ${m}: ${liste(ns)}.`, calDizi(ns));
}

function diyatonik(): SecimSorusu {
  const kok = ton();
  const ns = majorDizi(kok);
  const tip = rnd(3);
  const d = rnd(7);
  if (tip === 0) {
    const dogru = akorAd(ns[d], DIYATONIK_UC[d]);
    const yanlis = (["maj", "min", "dim"] as const).filter((x) => x !== DIYATONIK_UC[d]).map((x) => akorAd(ns[d], x));
    return soru(`${adTr(kok)} majörde ${ROMEN[d]} (${DERECE[d]} derece) akoru hangisi?`, dogru, [...yanlis, akorAd(ns[(d + 1) % 7], DIYATONIK_UC[(d + 1) % 7])], `Majör dizide akor türleri: I majör, ii minör, iii minör, IV majör, V majör, vi minör, vii° eksik.`, calAkor(yazDizi(ns[d], TUR[DIYATONIK_UC[d]].iv, UCLU_HARF)));
  }
  if (tip === 1) {
    const ad = (t: Tur) => TUR[t].uzun;
    return soru(`Majör dizide ${ROMEN[d]} akorunun türü nedir?`, ad(DIYATONIK_UC[d]), [ad("maj"), ad("min"), ad("dim"), ad("aug")], "I, IV, V majör; ii, iii, vi minör; vii° eksik.");
  }
  return soru(`${adTr(kok)} majörde ${akorAd(ns[d], DIYATONIK_UC[d])} akoru kaçıncı derecededir?`, ROMEN[d], ROMEN, `${adTr(kok)} majör: ${ns.map((n, i) => akorSem(n, DIYATONIK_UC[i])).join(" – ")}.`);
}

const YURUYUSLER = [[0, 4, 5, 3], [5, 3, 0, 4], [0, 3, 4], [1, 4, 0], [0, 5, 3, 4], [0, 3, 0, 4]];

function yuruyus(): SecimSorusu {
  const kok = ton();
  const ns = majorDizi(kok);
  const y = sec(YURUYUSLER);
  const sembol = (dd: number[], ton: Ad[]) => dd.map((d) => akorSem(ton[d], DIYATONIK_UC[d])).join(" – ");
  const derece = (dd: number[]) => dd.map((d) => d + 1).join("-");
  const ses = () => {
    const t0 = simdi() + 0.05;
    y.forEach((d, i) => {
      const ak = yazDizi(ns[d], TUR[DIYATONIK_UC[d]].iv, UCLU_HARF);
      const bas = 40 + ((adSes(ak[0]) - 4 + 12) % 12);
      akor([bas, ...ak.map((n) => 55 + ((adSes(n) - 7 + 12) % 12))], t0 + i * 1.2, { seconds: 1.2 });
    });
  };
  if (Math.random() < 0.5) {
    const yanlis = [
      sembol(y, majorDizi(yukari(kok, 4, 7))),
      y.map((d) => akorSem(ns[d], DIYATONIK_UC[d] === "maj" ? "min" : "maj")).join(" – "),
      sembol(y.map((d) => (d + 1) % 7), ns),
    ];
    return soru(`${adTr(kok)} majörde ${derece(y)} yürüyüşünün akorları hangisi?`, sembol(y, ns), yanlis, `${adTr(kok)} majör: ${ns.map((n, i) => akorSem(n, DIYATONIK_UC[i])).join(" – ")}.`, ses);
  }
  const yanlis = YURUYUSLER.filter((x) => x !== y).map(derece);
  return soru(`${adTr(kok)} majörde ${sembol(y, ns)} yürüyüşü hangi derecelerdir?`, derece(y), karistir(yanlis), `${y.map((d) => `${akorSem(ns[d], DIYATONIK_UC[d])} = ${ROMEN[d]}`).join(", ")}.`, ses);
}

function dortlu(): SecimSorusu {
  const t = sec(["maj7", "dom7", "m7", "m7b5"] as const);
  const kok = kokSec(t);
  const ns = yazDizi(kok, TUR[t].iv, TUR[t].h);
  if (Math.random() < 0.5) return soru(`${akorSem(kok, t)} akorunun notaları hangisi?`, liste(ns), bozuk(ns), `${TUR[t].uzun}: ${TUR[t].formul}.`, calAkor(ns));
  const ad = (x: Tur) => TUR[x].uzun;
  return soru(`${TUR[t].formul} formülü hangi dört sesli akordur?`, ad(t), (["maj7", "dom7", "m7", "m7b5"] as const).map(ad), "Dört sesli akor, üç sesliye 7'li eklenerek kurulur.");
}

function yedili(): SecimSorusu {
  const kok = ton();
  const ns = majorDizi(kok);
  const d = rnd(7);
  if (Math.random() < 0.6) {
    const dogru = akorSem(ns[d], DIYATONIK_DORT[d]);
    const yanlis = (["maj7", "dom7", "m7", "m7b5"] as const).filter((x) => x !== DIYATONIK_DORT[d]).map((x) => akorSem(ns[d], x));
    return soru(`${adTr(kok)} majörde ${ROMEN7[d]} (${DERECE[d]} derece) 7'li akoru hangisi?`, dogru, yanlis, `${adTr(kok)} majör 7'li akorları: ${ns.map((n, i) => akorSem(n, DIYATONIK_DORT[i])).join(" – ")}.`, calAkor(yazDizi(ns[d], TUR[DIYATONIK_DORT[d]].iv, DORTLU_HARF)));
  }
  const t = sec(["maj7", "dom7", "m7b5"] as const);
  const dogru = DIYATONIK_DORT.map((x, i) => (x === t ? ROMEN7[i] : null)).filter(Boolean).join(" ve ");
  return soru(`Majör dizide ${TUR[t].uzun} akoru hangi derece(ler)de oluşur?`, dogru, ["Imaj7 ve IVmaj7", "V7", "viiø7", "ii7, iii7 ve vi7"], "Majör dizide: Imaj7, ii7, iii7, IVmaj7, V7, vi7, viiø7 (m7♭5).");
}

const URET: Record<ArmoniKonu, () => SecimSorusu> = { giris, gam, besli, uclu, mod, modFormul, modAnla, diyatonik, yuruyus, dortlu, yedili };
export const armoniSorusu = (konu: ArmoniKonu) => URET[konu]();
