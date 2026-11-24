// Akorlar (W5, 24.11.2026) — orta–ileri, kompakt: akor nasıl oluşur, CAGED ile beş pozisyon, akor türleri farklı tel
// gruplarında, pozisyonlar arası geçiş. Basit açık akor dersleri çıkarıldı (eski kurs: ./akorlar-eski.ts, yalnız arşivdeki
// rehberler için). Her dersin tabı metronomla çalınır; "Akor Şekilleri" kutusu (Lesson.diagrams) derste geçen şekilleri çizer.
// Notalar elle yazıldı ve her akorun sesleri yorumda adlandırıldı; perde → nota denetimi: scripts/check-content.ts
// (ölçü uzunlukları) ve bu dosyadaki `kontrol()` (akor sesleri formülle aynı mı, üretimde hata verir).
import type { AkorDiyagrami, Course, Tags } from "../types.ts";
import { tex } from "../tex.ts";
import { OPEN, pc } from "../dizi.ts";
import { chapter, etiketle, section, type LessonInput } from "./ortak.ts";

const P = "ak2";

// ── Akor sözlüğü: ad → perdeler (kalın Mi → ince Mi, "x" çalınmaz) ve formül (kökten yarım ses) ─────────────────
const KOK: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const FORMUL: Record<string, number[]> = {
  "": [0, 4, 7], m: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8], sus2: [0, 2, 7], sus4: [0, 5, 7], add9: [0, 2, 4, 7],
  maj7: [0, 4, 7, 11], "7": [0, 4, 7, 10], m7: [0, 3, 7, 10], m7b5: [0, 3, 6, 10], "7sus4": [0, 5, 7, 10],
  "9": [0, 2, 4, 7, 10], maj9: [0, 2, 4, 7, 11], m9: [0, 2, 3, 7, 10], "13": [0, 2, 4, 7, 9, 10],
};
/** Akor adından kök ve formül: "Cmaj7" → { kök Do, [0,4,7,11] }. Eğik çizgi (C/G) basın adıdır, sesler aynı akorundur. */
function coz(ad: string): { kok: number; formul: number[] } {
  const m = ad.split("/")[0].match(/^([A-G])([#b]?)(.*)$/);
  if (!m || !(m[3] in FORMUL)) throw new Error(`akor adı okunamadı: ${ad}`);
  return { kok: (KOK[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? 11 : 0)) % 12, formul: FORMUL[m[3]] };
}
/** Şeklin sesleri akorun formülünde mi; formüldeki zorunlu sesler (kök, üçlü/asılı ses, yedili) var mı */
function kontrol(ad: string, perde: string) {
  const { kok, formul } = coz(ad);
  const sesler = perde.split(" ").flatMap((f, i) => (f === "x" ? [] : [pc(OPEN[5 - i] + Number(f) - kok)]));
  for (const s of sesler) if (!formul.includes(s)) throw new Error(`${ad} (${perde}): ${s} yarım seslik ses formülde yok`);
  // Beşli (7) ve genişletilmiş akorda dokuzlu dışındaki sesler isteğe bağlı değildir: beşli çıkarılabilir (9, 13, m7 kabuk)
  for (const s of formul) if (s !== 7 && !(s === 2 && formul.length > 4) && !sesler.includes(s))
    throw new Error(`${ad} (${perde}): ${s} yarım seslik ses eksik`);
}

const SEKIL: Record<string, string> = {};
/** Akor tanımı: tab akoru "(perde.tel …)" döner; ad + şekil birlikte saklanır (diyagram için) */
function akor(ad: string, perde: string, anahtar = ad): string {
  kontrol(ad, perde);
  SEKIL[anahtar] = perde;
  const p = perde.split(" ");
  return `(${p.flatMap((f, i) => (f === "x" ? [] : [`${f}.${6 - i}`])).join(" ")})`;
}
const notalar = (c: string) => c.slice(1, -1).split(" ");
/** Diyagram kutusu için: anahtar → { ad, şekil, not } */
const d = (anahtar: string, not?: string, ad = anahtar.replace(/ \(.*\)$/, "").replace("b5", "♭5")): AkorDiyagrami => {
  if (!SEKIL[anahtar]) throw new Error(`diyagram yok: ${anahtar}`);
  return { ad, sekil: SEKIL[anahtar], ...(not ? { not } : {}) };
};

// ── Ritim kalıpları (hepsi 4/4, bir ölçü) ────────────────────────────────────
/** Arpej (sekizlik): pesten tize ve geri, 8 nota */
function ar8(c: string) {
  const n = notalar(c);
  const yol = [...n, ...n.slice(1, -1).reverse()];
  return `:8 ${Array.from({ length: 8 }, (_, i) => `${yol[i % yol.length]}${i === 0 ? "{sd}" : ""}`).join(" ")}`;
}
/** Yarım ölçü arpej (dört sekizlik) + iki dörtlük vuruş */
const arVur = (c: string) => {
  const n = notalar(c);
  const yol = [...n, ...n.slice(1, -1).reverse()];
  return `:8 ${Array.from({ length: 4 }, (_, i) => yol[i % yol.length]).join(" ")} :4 ${c}{bd} ${c}{bu}`;
};
/** Arpej yukarı (dört sekizlik) + yarım nota akor */
const ucluAc = (c: string) => {
  const n = notalar(c);
  return `:8 ${[n[0], n[1], n[2], n[1]].join(" ")} :2 ${c}{bd}`;
};
const dortluk = (c: string) => `:4 ${c}{bd} ${c}{bd} ${c}{bd} ${c}{bd}`;
const yarim = (a: string, b = a) => `:2 ${a}{bd} ${b}{bd}`;
const birlik = (c: string) => `:1 ${c}{bd}`;
/** Sekizlik kalıp D-DU-UDU: "-" hava vuruşu (akor bağla sürer, el tele değmez) */
function kalip(c: string, k = "D-DU-UDU") {
  const bag = `(${notalar(c).map((n) => `${n}{t}`).join(" ")})`;
  return `:8 ${[...k].map((x) => (x === "-" ? bag : `${c}{${x === "D" ? "bd" : "bu"}}`)).join(" ")}`;
}
/** Charleston: 1. vuruş ve 2. vuruşun yarısı (caz eşliği) */
const charleston = (c: string) => `:4 ${c}{bd} :8 r ${c}{bu} :2 r`;

type Ders = { title: string; bpm: number; bpmRange: [number, number]; bars: string[]; description: string; tips: string[]; theory?: string[]; diagrams: AkorDiyagrami[]; minutes?: number };
const METRONOM = "Metronom açık: akor değişimi vuruştan önce biter. Önce alt tempoda temiz, sonra 4–6 BPM artır.";
const ders = (x: Ders): LessonInput => ({
  title: x.title,
  bpm: x.bpm,
  bpmRange: x.bpmRange,
  minutes: x.minutes ?? 2,
  tex: tex(x.bpm, x.bars),
  description: x.description,
  tips: x.tips,
  theory: x.theory ?? [],
  diagrams: x.diagrams,
});

// ── Bölüm 1: Akor nasıl oluşur ───────────────────────────────────────────────
// Üçlüler 4-3-2. tellerde, kök 4. telde (Do 10. perde, La 7. perde)
const C3 = akor("C", "x x 10 9 8 x", "C (4-3-2)"); // Do Mi Sol
const Cm3 = akor("Cm", "x x 10 8 8 x", "Cm (4-3-2)"); // Do Mi♭ Sol
const Cdim3 = akor("Cdim", "x x 10 8 7 x", "Cdim (4-3-2)"); // Do Mi♭ Sol♭
const Caug3 = akor("Caug", "x x 10 9 9 x", "Caug (4-3-2)"); // Do Mi Sol#
const A3 = akor("A", "x x 7 6 5 x", "A (4-3-2)"); // La Do# Mi
const Am3 = akor("Am", "x x 7 5 5 x", "Am (4-3-2)"); // La Do Mi
const Adim3 = akor("Adim", "x x 7 5 4 x", "Adim (4-3-2)"); // La Do Mi♭
const Aaug3 = akor("Aaug", "x x 7 6 6 x", "Aaug (4-3-2)"); // La Do# Fa
// Do majör üçlüsünün çevrimleri (3-2-1. teller) ve La minör
const Ck = akor("C", "x x x 5 5 3", "C kök"); // Do Mi Sol
const C1 = akor("C/E", "x x x 9 8 8", "C/E"); // Mi Sol Do
const C2 = akor("C/G", "x x x 12 13 12", "C/G"); // Sol Do Mi
const Ck8 = akor("C", "x x x 17 17 15", "C kök (17)");
const Am1 = akor("Am/C", "x x x 5 5 5", "Am/C"); // Do Mi La
const Am2 = akor("Am/E", "x x x 9 10 8", "Am/E"); // Mi La Do
const Amk = akor("Am", "x x x 14 13 12", "Am kök (14)"); // La Do Mi

// Yedililer: kök 5. telde (Do, 3. perde) ve 6. telde (La, 5. perde)
const Cmaj7 = akor("Cmaj7", "x 3 5 4 5 x"); // Do Sol Si Mi
const C7 = akor("C7", "x 3 5 3 5 x"); // Do Sol Si♭ Mi
const Cm7 = akor("Cm7", "x 3 5 3 4 x"); // Do Sol Si♭ Mi♭
const Cm7b5 = akor("Cm7b5", "x 3 4 3 4 x"); // Do Sol♭ Si♭ Mi♭
const Amaj7 = akor("Amaj7", "5 x 6 6 5 x"); // La Sol# Do# Mi
const A7 = akor("A7", "5 x 5 6 5 x"); // La Sol Do# Mi
const Am7 = akor("Am7", "5 x 5 5 5 x"); // La Sol Do Mi
const Am7b5 = akor("Am7b5", "5 x 5 5 4 x"); // La Sol Do Mi♭
// Klişe çizgisi: Do (A şekli) üzerinde yedili iner
const CA = akor("C", "x 3 5 5 5 3", "C (A şekli)");
const CAmaj7 = akor("Cmaj7", "x 3 5 4 5 3", "Cmaj7 (A şekli)");
const CA7 = akor("C7", "x 3 5 3 5 3", "C7 (A şekli)");
const FE = akor("F", "1 3 3 2 1 1", "F (E şekli)");
const FmE = akor("Fm", "1 3 3 1 1 1", "Fm (E şekli)");
const G7E = akor("G7", "3 x 3 4 3 x", "G7 (6. tel)"); // Sol Fa Si Re
// Asılı ve genişletilmiş
const Csus2 = akor("Csus2", "x 3 5 5 3 3"); // Do Sol Do Re Sol
const Csus4 = akor("Csus4", "x 3 5 5 6 3"); // Do Sol Do Fa Sol
const Cadd9 = akor("Cadd9", "x 3 5 7 5 3"); // Do Sol Re Mi Sol
const GE = akor("G", "3 5 5 4 3 3", "G (E şekli)");
const Gsus4 = akor("Gsus4", "3 5 5 5 3 3");
const Gsus2 = akor("Gsus2", "3 5 5 2 3 3");
const C9 = akor("C9", "x 3 2 3 3 3"); // Do Mi Si♭ Re Sol
const C13 = akor("C13", "x 3 2 3 5 5"); // Do Mi Si♭ Mi La
const F9 = akor("F9", "x 8 7 8 8 x"); // Fa La Mi♭ Sol
const G9 = akor("G9", "x 10 9 10 10 x"); // Sol Si Fa La
const C7sus4 = akor("C7sus4", "x 3 5 3 6 3"); // Do Sol Si♭ Fa Sol

const s1 = section(1, "Akor Nasıl Oluşur", [
  chapter(P, 1, 0, "Üçlüler", [
    "Üçlü (triad): bir köke üçlü aralıkla iki ses eklenir. Majör 1 – 3 – 5 (büyük üçlü + küçük üçlü), minör 1 – ♭3 – 5, eksik (dim) 1 – ♭3 – ♭5, artık (aug) 1 – 3 – #5.",
    "Sapta üçlü aralık: aynı perdede bir alt tel + bir perde geri (büyük üçlü 4 yarım ses, küçük üçlü 3 yarım ses; Sol–Si tel çiftinde bir perde ileri).",
  ], [
    ders({
      title: "Dört Üçlü Türü", bpm: 70, bpmRange: [60, 100],
      bars: [C3, Cm3, Cdim3, Caug3, A3, Am3, Adim3, Aaug3].map(ucluAc).concat(birlik(C3)),
      description: "Aynı kök, dört tür: C – Cm – Cdim – Caug, sonra A – Am – Adim – Aaug. Her ölçüde önce sesleri tek tek (1 – 3 – 5 – 3), sonra akoru birlikte çal.",
      tips: [METRONOM, "Majörden minöre yalnız üçlü bir perde iner; minörden eksiğe beşli de iner; artıkta beşli bir perde çıkar.", "Kulağın türü tanısın: parlak, hüzünlü, gergin, 'havada'."],
      theory: ["C = Do – Mi – Sol, Cm = Do – Mi♭ – Sol, Cdim = Do – Mi♭ – Sol♭, Caug = Do – Mi – Sol#. A = La – Do# – Mi, Am = La – Do – Mi, Adim = La – Do – Mi♭, Aaug = La – Do# – Fa."],
      diagrams: ["C (4-3-2)", "Cm (4-3-2)", "Cdim (4-3-2)", "Caug (4-3-2)", "A (4-3-2)", "Am (4-3-2)", "Adim (4-3-2)", "Aaug (4-3-2)"].map((k) => d(k, "kök 4. telde")),
    }),
    ders({
      title: "Üçlü Çevrimleri", bpm: 70, bpmRange: [60, 110],
      bars: [Ck, C1, C2, Ck8, Am1, Am2, Amk, Am2].map(arVur).concat(birlik(Am1)),
      description: "Do majör üçlüsü ince üç telde sap boyunca: kök konum – 1. çevrim (bas Mi) – 2. çevrim (bas Sol) – oktav. Sonra La minör aynı yoldan.",
      tips: [METRONOM, "Her çevrimde en üstteki notayı söyle: Sol, Do, Mi, Sol — melodi çevrimlerle kurulur.", "Şekilleri ezberleme, kök notayı (Do / La) her şekilde bul."],
      theory: ["Çevrim: aynı üç ses, farklı ses pesten. Kök konum 1 – 3 – 5, 1. çevrim 3 – 5 – 1, 2. çevrim 5 – 1 – 3. Bir akorun üç çevrimi sapın üç komşu bölgesini kaplar."],
      diagrams: [d("C kök", "kök konum"), d("C/E", "1. çevrim"), d("C/G", "2. çevrim"), d("Am/C", "1. çevrim"), d("Am/E", "2. çevrim"), d("Am kök (14)", "kök konum")],
    }),
  ]),
  chapter(P, 1, 1, "Yedililer", [
    "Yedili akor: üçlünün üstüne bir üçlü daha. maj7 = 1 – 3 – 5 – 7, dominant 7 = 1 – 3 – 5 – ♭7, m7 = 1 – ♭3 – 5 – ♭7, m7♭5 (yarım eksik) = 1 – ♭3 – ♭5 – ♭7.",
    "Dört türün kabuk şekli aynı kökten: yedili sesi bir perde inince maj7 → 7, üçlü inince 7 → m7, beşli inince m7 → m7♭5.",
  ], [
    ders({
      title: "Dört Yedili Türü", bpm: 70, bpmRange: [60, 100],
      bars: [Cmaj7, C7, Cm7, Cm7b5, Amaj7, A7, Am7, Am7b5].map(arVur).concat(birlik(Am7)),
      description: "Kök 5. telde Cmaj7 – C7 – Cm7 – Cm7♭5, kök 6. telde Amaj7 – A7 – Am7 – Am7♭5. Önce sesler, sonra akor.",
      tips: [METRONOM, "Her geçişte yalnız bir ses bir perde iner: hangi parmağın hareket ettiğini izle.", "Kök 6. telde şekillerde 5. tel susturulur: kök parmağının ucu ona değer."],
      theory: ["Cmaj7 = Do – Mi – Sol – Si, C7 = Do – Mi – Sol – Si♭, Cm7 = Do – Mi♭ – Sol – Si♭, Cm7♭5 = Do – Mi♭ – Sol♭ – Si♭. Majör tonda maj7 I ve IV, 7 V, m7 ii – iii – vi, m7♭5 vii derecesidir."],
      diagrams: ["Cmaj7", "C7", "Cm7", "Cm7b5", "Amaj7", "A7", "Am7", "Am7b5"].map((k, i) => d(k, i < 4 ? "kök 5. telde" : "kök 6. telde")),
    }),
    ders({
      title: "Klişe Çizgisi: C – Cmaj7 – C7", bpm: 80, bpmRange: [60, 120],
      bars: [kalip(CA), kalip(CAmaj7), kalip(CA7), kalip(FE), kalip(FmE), kalip(CA), kalip(G7E), birlik(CA)],
      description: "C – Cmaj7 – C7 – F – Fm – C – G7 – C: Do akoru dururken kökün bir üstündeki ses Do → Si → Si♭ diye iner; F'den Fm'ye La → La♭ iner.",
      tips: [METRONOM, "Barre 3. perdede kalır, yalnız 3. teldeki parmak hareket eder.", "Kalıp: aşağı – (boş) – aşağı – yukarı – (boş) – yukarı – aşağı – yukarı."],
      theory: ["Klişe çizgisi (line cliché): akor aynı kalırken bir iç ses yarım seslerle iner. C7, F'ye (IV) dominant gibi çözülür; Fm (iv) minörden ödünç alınmış akordur."],
      diagrams: [d("C (A şekli)", "A şekli, 3. perde"), d("Cmaj7 (A şekli)"), d("C7 (A şekli)"), d("F (E şekli)", "E şekli, 1. perde"), d("Fm (E şekli)"), d("G7 (6. tel)")],
    }),
  ]),
  chapter(P, 1, 2, "Asılı ve Genişletilmiş Akorlar", [
    "Asılı (sus) akorda üçlünün yerine 2 (sus2) ya da 4 (sus4) gelir: akor ne majör ne minördür, genellikle majöre çözülür. add9 üçlüye dokuzluyu ekler, yedilisiz.",
    "Genişletilmiş akorlar yedilinin üstüne çıkar: 9 = 1 – 3 – 5 – ♭7 – 9, 13 = … – 13 (altılı bir oktav yukarıda). Gitarda beşli çoğu zaman çıkarılır.",
  ], [
    ders({
      title: "Sus2, Sus4 ve Add9", bpm: 80, bpmRange: [60, 120],
      bars: [yarim(CA, Csus4), yarim(CA, Csus2), birlik(Cadd9), birlik(CA), yarim(GE, Gsus4), yarim(GE, Gsus2), yarim(CA, Cadd9), birlik(CA)],
      description: "Do ve Sol majörde asılı akorlar: C – Csus4, C – Csus2, Cadd9; G – Gsus4, G – Gsus2. Her asılı akor majöre döner.",
      tips: [METRONOM, "Csus4'te serçe parmak 2. telde bir perde öne gelir (Mi → Fa); Csus2'de 2. tel barreye iner (Mi → Re).", "Gsus2'de 3. teldeki parmak iki perde geri uzanır: elin geri kalanı yerinde."],
      theory: ["Csus2 = Do – Re – Sol, Csus4 = Do – Fa – Sol, Cadd9 = Do – Mi – Sol – Re. Sus4 → majör hareketi (Fa → Mi) en eski kadans süslerinden biridir."],
      diagrams: [d("C (A şekli)"), d("Csus4"), d("Csus2"), d("Cadd9"), d("G (E şekli)"), d("Gsus4"), d("Gsus2")],
    }),
    ders({
      title: "9 ve 13: Dominant Renkleri", bpm: 90, bpmRange: [70, 120],
      bars: [kalip(C9), kalip(C9), kalip(F9), kalip(F9), kalip(C9), kalip(C13), kalip(G9), kalip(F9), kalip(C7sus4), kalip(C9), birlik(C9)],
      description: "Funk ve blues renkleri: C9 – F9 – G9 (I – IV – V), C13 ve C7sus4 süsleri. Kalıp D-DU-UDU.",
      tips: [METRONOM, "Ton: temiz. C9 → C13: yalnız ince iki tel değişir (Re Sol → Mi La).", "Şekiller beşlisiz: kök, üçlü, ♭7 ve renk sesi yeter."],
      theory: ["C9 = Do – Mi – Si♭ – Re (+ Sol), C13 = Do – Mi – Si♭ – La (13 = La), F9 = Fa – La – Mi♭ – Sol, G9 = Sol – Si – Fa – La. Bluesta üç akorun hepsi dominanttır."],
      diagrams: [d("C9"), d("C13"), d("F9"), d("G9"), d("C7sus4")],
    }),
  ]),
]);

// ── Bölüm 2: CAGED ───────────────────────────────────────────────────────────
const C_C = akor("C", "x 3 2 0 1 0", "C (C şekli)");
const C_A = CA;
const C_G = akor("C", "8 7 5 5 5 8", "C (G şekli)");
const C_E = akor("C", "8 10 10 9 8 8", "C (E şekli)");
const C_D = akor("C", "x x 10 12 13 12", "C (D şekli)");
const G_E = GE;
const G_D = akor("G", "x x 5 7 8 7", "G (D şekli)");
const G_C = akor("G", "x 10 9 7 8 7", "G (C şekli)");
const G_A = akor("G", "x 10 12 12 12 10", "G (A şekli)");
const G_G = akor("G", "15 14 12 12 12 15", "G (G şekli)");
const Am_A = akor("Am", "x 0 2 2 1 0", "Am (A şekli)");
const Am_G = akor("Am", "5 3 2 2 5 5", "Am (G şekli)");
const Am_E = akor("Am", "5 7 7 5 5 5", "Am (E şekli)");
const Am_D = akor("Am", "x x 7 9 10 8", "Am (D şekli)");
const Am_C = akor("Am", "x 12 10 9 10 x", "Am (C şekli)");
// La majörde 4.–7. perdeler, Sol majörde 5.–10. perdeler
const A_E5 = akor("A", "5 7 7 6 5 5", "A (E şekli)");
const D_A5 = akor("D", "x 5 7 7 7 5", "D (A şekli)");
const E_C4 = akor("E", "x 7 6 4 5 4", "E (C şekli)");
const Em_A7 = akor("Em", "x 7 9 9 8 7", "Em (A şekli)");
const C_G5 = C_G;

const bes = (liste: string[]) => liste.flatMap((c) => [ar8(c), yarim(c)]);
const s2 = section(2, "CAGED: Aynı Akor, Beş Pozisyon", [
  chapter(P, 2, 0, "Majör Akor Beş Şekilde", [
    "CAGED: beş açık akor şekli (C, A, G, E, D) sap boyunca bu sırayla dizilir; her şekil bir öncekinin bittiği yerde başlar ve aynı akoru verir. Sıra döngüdür: D'den sonra yine C gelir.",
    "Her şekilde kökün yeri farklıdır: C ve A şeklinde 5. tel, G ve E şeklinde 6. tel (ve 1. tel), D şeklinde 4. tel.",
  ], [
    ders({
      title: "Do Majör: C – A – G – E – D", bpm: 80, bpmRange: [60, 120],
      bars: [...bes([C_C, C_A, C_G, C_E, C_D]), birlik(C_C)],
      description: "Do majör beş şekilde: açık C, 3. perdede A şekli, 5.'de G şekli, 8.'de E şekli, 10.'da D şekli. Her şekilde bir ölçü arpej, bir ölçü vuruş.",
      tips: [METRONOM, "Arpejde kök notayı (Do) vurgula: hangi telde olduğunu söyle.", "Şekiller üst üste biner: C şeklinin tepesi (3. perde) A şeklinin barresi."],
      theory: ["Beş şeklin hepsi yalnız Do – Mi – Sol seslerinden oluşur. Şekil sırası C → A → G → E → D → (C) sapı 12 perdede bir tur döner."],
      diagrams: [d("C (C şekli)", "açık · kök 5. tel"), d("C (A şekli)", "3. perde · kök 5. tel"), d("C (G şekli)", "5. perde · kök 6. tel"), d("C (E şekli)", "8. perde · kök 6. tel"), d("C (D şekli)", "10. perde · kök 4. tel")],
    }),
    ders({
      title: "Sol Majör: E – D – C – A – G", bpm: 80, bpmRange: [60, 120],
      bars: [...bes([G_E, G_D, G_C, G_A, G_G]), birlik(G_E)],
      description: "Aynı sistem Sol'da: 3. perdede E şekli, 5.'de D şekli, 7.'de C şekli, 10.'da A şekli, 12.'de G şekli. Sıra bu kez E'den başlar.",
      tips: [METRONOM, "Sıra aynı döngü (… E – D – C – A – G – E …): hangi akorla başlarsan başla, bir sonraki şekil hep aynıdır.", "G şeklinde (12–15. perde) serçe 1. teldeki kökü basar."],
      theory: ["Sol majör = Sol – Si – Re. Bir akorun beş şeklini bilmek sapın her bölgesinde o akoru bulmak demektir."],
      diagrams: [d("G (E şekli)", "3. perde"), d("G (D şekli)", "5. perde"), d("G (C şekli)", "7. perde"), d("G (A şekli)", "10. perde"), d("G (G şekli)", "12. perde")],
    }),
  ]),
  chapter(P, 2, 1, "Minör Akor Beş Şekilde", [
    "Minör CAGED şekilleri majörlerin üçlüsü bir perde inmiş hâlidir. Am: açık A şekli, 2.–5. perdede G şekli, 5.'de E şekli, 7.'de D şekli, 9.–12.'de C şekli.",
  ], [
    ders({
      title: "La Minör: A – G – E – D – C", bpm: 80, bpmRange: [60, 120],
      bars: [...bes([Am_A, Am_G, Am_E, Am_D, Am_C]), birlik(Am_E)],
      description: "La minör beş şekilde, açık konumdan 12. perdeye. Her şekilde bir ölçü arpej, bir ölçü vuruş.",
      tips: [METRONOM, "G şekli (5 3 2 2 5 5) geniş bir açıklık: 6. ve 1. teldeki kökleri serçe ve yüzük parmağı basar.", "C şeklinde (x 12 10 9 10 x) 1. tel çalınmaz."],
      theory: ["La minör = La – Do – Mi. Majör şekildeki üçlü (Do#) bir perde inince (Do) minör şekil olur: E şeklinde 3. tel, A şeklinde 2. tel."],
      diagrams: [d("Am (A şekli)", "açık"), d("Am (G şekli)", "2.–5. perde"), d("Am (E şekli)", "5. perde"), d("Am (D şekli)", "7. perde"), d("Am (C şekli)", "9.–12. perde")],
    }),
  ]),
  chapter(P, 2, 2, "Bir Bölgede Bütün Akorlar", [
    "CAGED'in asıl kazancı: bir tonun akorlarını sapın tek bir bölgesinde, el kaymadan çalmak. Her akor o bölgeye düşen şekliyle çalınır.",
  ], [
    ders({
      title: "La Majör: I – IV – V, 4.–7. Perde", bpm: 90, bpmRange: [70, 130],
      bars: [kalip(A_E5), kalip(A_E5), kalip(D_A5), kalip(A_E5), kalip(E_C4), kalip(D_A5), kalip(A_E5), kalip(E_C4), birlik(A_E5)],
      description: "A (E şekli, 5. perde) – D (A şekli, 5. perde) – E (C şekli, 4. perde): üç akor 4.–7. perdelerde, el yerinden oynamaz.",
      tips: [METRONOM, "A → D: barre 5. perdede kalır, şekil değişir. D → E: C şekli bir perde geriden başlar.", "Kalıp D-DU-UDU; geçişi son yukarı vuruşta başlat."],
      theory: ["La majör: I = A (La – Do# – Mi), IV = D (Re – Fa# – La), V = E (Mi – Sol# – Si)."],
      diagrams: [d("A (E şekli)", "5. perde"), d("D (A şekli)", "5. perde"), d("E (C şekli)", "4. perde")],
    }),
    ders({
      title: "Sol Majör: I – vi – IV – V, 5.–10. Perde", bpm: 90, bpmRange: [70, 130],
      bars: [kalip(G_C), kalip(Em_A7), kalip(C_G5), kalip(D_A5), kalip(G_C), kalip(Em_A7), kalip(C_G5), kalip(D_A5), birlik(G_C)],
      description: "G (C şekli, 7. perde) – Em (A şekli, 7. perde) – C (G şekli, 5. perde) – D (A şekli, 5. perde).",
      tips: [METRONOM, "G → Em: yalnız iki parmak yer değiştirir; 7. perdedeki 1. tel ortak.", "C (G şekli) en zor geçiş: serçe ve yüzük 6. ve 1. teli birlikte basar."],
      theory: ["Sol majör: I = G, vi = Em (Mi – Sol – Si), IV = C, V = D. Pop'un en çok kullanılan dizisi (I – vi – IV – V)."],
      diagrams: [d("G (C şekli)", "7. perde"), d("Em (A şekli)", "7. perde"), d("C (G şekli)", "5. perde"), d("D (A şekli)", "5. perde")],
    }),
  ]),
]);

// ── Bölüm 3: Akor türleri farklı tel gruplarında ─────────────────────────────
const C_ust = akor("C", "x x x 5 5 3", "C (3-2-1)");
const Am_ust = akor("Am", "x x x 5 5 5", "Am (3-2-1)");
const F_ust = akor("F", "x x x 5 6 5", "F (3-2-1)");
const G_ust = akor("G", "x x x 4 3 3", "G (3-2-1)");
const C_ust9 = akor("C", "x x x 9 8 8", "C (3-2-1, 8.)");
const Am_ust9 = akor("Am", "x x x 9 10 8", "Am (3-2-1, 8.)");
const F_ust10 = akor("F", "x x x 10 10 8", "F (3-2-1, 8.)");
const G_ust7 = akor("G", "x x x 7 8 7", "G (3-2-1, 7.)");
const C_orta = akor("C", "x x 5 5 5 x", "C (4-3-2)");
const Am_orta = Am3;
const F_orta = akor("F", "x x 7 5 6 x", "F (4-3-2)");
const G_orta = akor("G", "x x 5 4 3 x", "G (4-3-2)");
const Am_alt = akor("Am", "x 7 7 5 x x", "Am (5-4-3)");
const Dm_alt = akor("Dm", "x 8 7 7 x x", "Dm (5-4-3)");
const E_alt = akor("E", "x 7 6 4 x x", "E (5-4-3)");
const Dm7 = akor("Dm7", "x 5 7 5 6 x"); // Re La Do Fa
const G7 = akor("G7", "3 x 3 4 3 x"); // Sol Fa Si Re
const Cmaj7b = Cmaj7;
const Bm7b5 = akor("Bm7b5", "7 x 7 7 6 x"); // Si La Re Fa
const E7 = akor("E7", "x 7 6 7 5 x"); // Mi Sol# Re Mi
const Am7b = Am7;

const s3 = section(3, "Akor Türleri, Farklı Tel Grupları", [
  chapter(P, 3, 0, "İnce Teller: 3-2-1", [
    "Aynı dizi üç tel grubunda başka renk verir: ince teller (3-2-1) parlak ve melodik, orta teller (4-3-2) dolgun, kalın teller (5-4-3) koyu. Üç sesli şekiller bas gitar ya da ikinci gitarla çakışmaz.",
  ], [
    ders({
      title: "I – vi – IV – V Üçlülerle", bpm: 80, bpmRange: [60, 120],
      bars: [C_ust, Am_ust, F_ust, G_ust, C_ust9, Am_ust9, F_ust10, G_ust7].map(arVur).concat(birlik(C_ust)),
      description: "Do majörde C – Am – F – G, ince üç telde iki bölgede: 3.–5. perde ve 7.–10. perde. En yakın çevrimlerle: parmaklar en az hareket eder.",
      tips: [METRONOM, "C → Am: yalnız 1. teldeki ses Sol'dan La'ya çıkar. Am → F: yalnız 2. tel Mi'den Fa'ya.", "İkinci bölgede aynı ilke: ortak sesleri yerinde bırak."],
      theory: ["C (Do – Mi – Sol), Am (La – Do – Mi), F (Fa – La – Do), G (Sol – Si – Re). Komşu akorlar iki ortak ses paylaşır (C – Am: Do, Mi; Am – F: La, Do)."],
      diagrams: [d("C (3-2-1)"), d("Am (3-2-1)"), d("F (3-2-1)"), d("G (3-2-1)"), d("C (3-2-1, 8.)"), d("Am (3-2-1, 8.)"), d("F (3-2-1, 8.)"), d("G (3-2-1, 7.)")],
    }),
  ]),
  chapter(P, 3, 1, "Orta ve Kalın Teller", [
    "4-3-2. tellerdeki üçlüler akorun 'göbeği'dir; 5-4-3. tellerdeki üçlüler minör tonda koyu, piyanonun sol eli gibi duyulur.",
  ], [
    ders({
      title: "4-3-2 ve 5-4-3 Telleri", bpm: 80, bpmRange: [60, 120],
      bars: [C_orta, Am_orta, F_orta, G_orta, Am_alt, Dm_alt, E_alt, Am_alt].map(arVur).concat(birlik(Am_alt)),
      description: "Önce 4-3-2. tellerde C – Am – F – G (5.–7. perde), sonra 5-4-3. tellerde Am – Dm – E – Am (4.–8. perde).",
      tips: [METRONOM, "Çalmayan teller susturulur: üstteki parmak 1. tele, kök parmağı 6. tele hafifçe değer.", "E'de Sol# (4. tel 6) La'ya çözülür: kulakla takip et."],
      theory: ["La minör: i = Am, iv = Dm (Re – Fa – La), V = E (Mi – Sol# – Si). V'deki Sol# armonik minörden gelir."],
      diagrams: [d("C (4-3-2)"), d("Am (4-3-2)"), d("F (4-3-2)"), d("G (4-3-2)"), d("Am (5-4-3)"), d("Dm (5-4-3)"), d("E (5-4-3)")],
    }),
  ]),
  chapter(P, 3, 2, "Yedililerle ii – V – I", [
    "ii – V – I caz ve popun temel kadansıdır. Majörde iim7 – V7 – Imaj7, minörde iiø (m7♭5) – V7 – im7. Kök 5. ve 6. telde dönüşümlü şekillerle el aynı bölgede kalır.",
  ], [
    ders({
      title: "Majörde ii – V – I", bpm: 100, bpmRange: [70, 140],
      bars: [charleston(Dm7), charleston(G7), charleston(Cmaj7b), charleston(Cmaj7b), charleston(Dm7), charleston(G7), yarim(Cmaj7b), birlik(Cmaj7b)],
      description: "Dm7 (kök 5. tel) – G7 (kök 6. tel) – Cmaj7 (kök 5. tel), Charleston ritmi: 1. vuruş ve 2. vuruşun yarısı.",
      tips: [METRONOM, "Metronomu 2. ve 4. vuruşa yerleştirerek de dene (caz hissi).", "Dm7 → G7: 4. teldeki La, G7'nin Fa'sına; 2. teldeki Fa, G7'nin Re'sine iner."],
      theory: ["Dm7 = Re – Fa – La – Do, G7 = Sol – Si – Re – Fa, Cmaj7 = Do – Mi – Sol – Si. G7'deki Si – Fa tritonu Do – Mi'ye çözülür."],
      diagrams: [d("Dm7", "kök 5. tel"), d("G7", "kök 6. tel"), d("Cmaj7", "kök 5. tel")],
    }),
    ders({
      title: "Minörde iiø – V – i", bpm: 100, bpmRange: [70, 140],
      bars: [charleston(Bm7b5), charleston(E7), charleston(Am7b), charleston(Am7b), charleston(Bm7b5), charleston(E7), yarim(Am7b), birlik(Am7b)],
      description: "Bm7♭5 (kök 6. tel) – E7 (kök 5. tel) – Am7 (kök 6. tel): 5.–7. perdelerde La minör kadansı.",
      tips: [METRONOM, "Bm7♭5 → E7: üç ses yarım ya da tam sesle kayar; kök 6. telden 5. tele geçer.", "Am7'de 5. tel susturulur."],
      theory: ["Bm7♭5 = Si – Re – Fa – La, E7 = Mi – Sol# – Si – Re, Am7 = La – Do – Mi – Sol. Minörde ii akoru yarım eksiktir (♭5)."],
      diagrams: [d("Bm7b5", "kök 6. tel"), d("E7", "kök 5. tel"), d("Am7", "kök 6. tel")],
    }),
  ]),
]);

// ── Bölüm 4: Pozisyonlar arası geçiş ─────────────────────────────────────────
const G_ac = akor("G", "3 2 0 0 0 3", "G (açık)");
const Em_ac = akor("Em", "0 2 2 0 0 0", "Em (açık)");
const C_ac = C_C;
const D_ac = akor("D", "x x 0 2 3 2", "D (açık)");
const Em_D2 = akor("Em", "x x 2 4 5 3", "Em (D şekli)");
const D_C5 = akor("D", "x 5 4 2 3 2", "D (C şekli)");
const Em_E12 = akor("Em", "12 14 14 12 12 12", "Em (E şekli, 12.)");
const C_C12 = akor("C", "x 15 14 12 13 12", "C (C şekli, 12.)");
const D_D12 = akor("D", "x x 12 14 15 14", "D (D şekli, 12.)");
const Am_ust14 = akor("Am", "x x x 14 13 12", "Am (3-2-1, 12.)");
const F_ust13 = akor("F", "x x x 14 13 13", "F (3-2-1, 13.)");
const C_ust12 = akor("C", "x x x 12 13 12", "C (3-2-1, 12.)");
const G_ust10 = akor("G", "x x x 12 12 10", "G (3-2-1, 10.)");
const Em7 = akor("Em7", "x 7 9 7 8 x"); // Mi Si Re Sol
const Dm9 = akor("Dm9", "x 5 3 5 5 x"); // Re Fa Do Mi
const G13 = akor("G13", "3 x 3 4 5 x"); // Sol Fa Si Mi
const Cmaj9 = akor("Cmaj9", "x 3 2 4 3 x"); // Do Mi Si Re
const Fmaj7 = akor("Fmaj7", "x 8 10 9 10 x"); // Fa Do Mi La
const Bm7b5b = akor("Bm7b5", "x 2 3 2 3 x", "Bm7b5 (5. tel)"); // Si Fa La Re
const G7sus4 = akor("G7sus4", "3 x 3 5 3 x"); // Sol Fa Do Re

const s4 = section(4, "Pozisyonlar Arası Geçiş", [
  chapter(P, 4, 0, "Aynı Akor, Komşu Şekiller", [
    "Pozisyon geçişinde el bir şekilden komşu şekle kayar: ortak ses (çoğu zaman kök) 'menteşe' olur. Geçişi vuruştan önce bitirmek için kaymaya son sekizlikte başlanır.",
  ], [
    ders({
      title: "Do ve La Minör Sap Boyunca", bpm: 80, bpmRange: [60, 120],
      bars: [yarim(C_C, C_A), yarim(C_G, C_E), yarim(C_D, C_E), yarim(C_G, C_A), yarim(Am_A, Am_G), yarim(Am_E, Am_D), yarim(Am_C, Am_D), yarim(Am_E, Am_G), birlik(Am_A)],
      description: "Her yarım notada bir sonraki CAGED şekli: Do majör yukarı ve geri, La minör yukarı ve geri. Ölçü başına iki geçiş.",
      tips: [METRONOM, "Menteşe sesi bul: C şekli → A şekli geçişinde 3. perdedeki Do (5. tel) yerinde kalır.", "Kayarken baskıyı bırak, varınca yeniden bas: teller ıslık çalmasın."],
      diagrams: [d("C (C şekli)"), d("C (A şekli)"), d("C (G şekli)"), d("C (E şekli)"), d("C (D şekli)"), d("Am (A şekli)"), d("Am (G şekli)"), d("Am (E şekli)"), d("Am (D şekli)"), d("Am (C şekli)")],
    }),
  ]),
  chapter(P, 4, 1, "Bir Dizi, Dört Bölge", [
    "Aynı diziyi sapın dört bölgesinde çalmak akorları ezberden kurtarır: her bölgede tonun dört akoru da kendi şekliyle oradadır.",
  ], [
    ders({
      title: "G – Em – C – D Dört Bölgede", bpm: 90, bpmRange: [70, 130],
      bars: [
        dortluk(G_ac), dortluk(Em_ac), dortluk(C_ac), dortluk(D_ac),
        dortluk(GE), dortluk(Em_D2), dortluk(CA), dortluk(D_C5),
        dortluk(G_C), dortluk(Em_A7), dortluk(C_G), dortluk(D_A5),
        dortluk(G_A), dortluk(Em_E12), dortluk(C_C12), dortluk(D_D12),
        birlik(G_G),
      ],
      description: "I – vi – IV – V Sol majörde: açık konum, 2.–5. perde, 5.–10. perde ve 10.–15. perde. Her bölgede dört ölçü, bölgeler arası bir kayma.",
      tips: [METRONOM, "Bölge değişimi (4. → 5. ölçü vb.) en zor yer: önce yalnız D → G geçişini döngüye al.", "Her bölgede kökleri (Sol, Mi, Do, Re) önce sesli söyle."],
      theory: ["Sol majörün dört akoru dört bölgede: açık şekiller, E/D/A/C şekilleri (3. perde), C/A/G/A şekilleri (7. perde), A/E/C/D şekilleri (10.–12. perde)."],
      diagrams: [d("G (E şekli)"), d("Em (D şekli)"), d("C (A şekli)"), d("D (C şekli)"), d("Em (E şekli, 12.)"), d("C (C şekli, 12.)"), d("D (D şekli, 12.)")],
      minutes: 3,
    }),
  ]),
  chapter(P, 4, 2, "Ses Yürütme ve Akor Haritası", [
    "Ses yürütme (voice leading): akor değişirken her ses en yakın sese gider. Üç sesli şekillerle bütün sapı dolaşırken bile el en çok bir iki perde kayar.",
  ], [
    ders({
      title: "Am – F – C – G Sap Boyunca", bpm: 80, bpmRange: [60, 120],
      bars: [Am_ust, F_ust, C_ust, G_ust, Am_ust9, F_ust10, C_ust9, G_ust7, Am_ust14, F_ust13, C_ust12, G_ust10].map(arVur).concat(birlik(Am_ust14)),
      description: "vi – IV – I – V ince üç telde üç bölgede: 3.–6., 7.–10. ve 10.–14. perde. Her bölgede en yakın çevrimler.",
      tips: [METRONOM, "Her bölgenin tepe sesi bir melodi çizer: La – La – Sol – Sol, Do – Do – Do – Si, Mi – Fa – Mi – Re.", "Bölge değişimi Am'de: üç şeklin üçünü de 'Am' diye tanı."],
      diagrams: [d("Am (3-2-1)"), d("F (3-2-1)"), d("Am (3-2-1, 8.)"), d("F (3-2-1, 8.)"), d("Am (3-2-1, 12.)"), d("F (3-2-1, 13.)"), d("C (3-2-1, 12.)"), d("G (3-2-1, 10.)")],
    }),
    ders({
      title: "Akor Haritası", bpm: 90, bpmRange: [70, 130],
      bars: [
        charleston(Cmaj7b), charleston(Am7b), charleston(Dm7), charleston(G7),
        charleston(Em7), charleston(A7), charleston(Dm9), charleston(G13),
        charleston(Cmaj9), charleston(Fmaj7), charleston(Bm7b5b), charleston(E7),
        charleston(Am7b), charleston(Dm7), yarim(G7sus4, G7), birlik(Cmaj7b),
      ],
      description: "16 ölçülük final: maj7, m7, 7, m9, 13, maj9, m7♭5 ve 7sus4 akorları 2.–10. perdelerde, kök 5. ve 6. tel dönüşümlü.",
      tips: [METRONOM, "Her akor bir öncekinin en yakın şekli: el 2. – 10. perdeden dışarı çıkmaz.", "Takıldığın geçişi ayır, iki ölçülük döngüyle çalış, sonra bütüne dön."],
      theory: ["Dizi: I – vi – ii – V (Do), iii – VI7 – ii – V (A7 ikincil dominant: Dm'yi hazırlar), I – IV – vii – III7 (La minöre geçiş), vi – ii – V – I."],
      diagrams: [d("Cmaj7"), d("Am7"), d("Dm7"), d("G7"), d("Em7"), d("A7"), d("Dm9"), d("G13"), d("Cmaj9"), d("Fmaj7"), d("Bm7b5 (5. tel)"), d("E7"), d("G7sus4")],
      minutes: 3,
    }),
  ]),
]);

// Müfredat etiketleri (Spec v2.2 §4): içerik paketi belgeler/mufredat/seviye-esleme.csv, "YERLESIK/akorlar" satırları.
const ETIKET: Record<string, Tags> = {
  "1.0": { level: "L3", axes: ["theory_ear", "fretboard"], skills: ["E.triads", "F.triad_inversions_sets"] }, // Üçlüler
  "1.1": { level: "L3", axes: ["theory_ear", "technique"], skills: ["E.seventh_chords", "T.barre_chord"] }, // Yedililer
  "1.2": { level: "L4", axes: ["theory_ear"], skills: ["E.sus_add", "E.extensions"] }, // Asılı ve Genişletilmiş
  "2.0": { level: "L4", axes: ["fretboard"], skills: ["F.caged"] }, // Majör Akor Beş Şekilde
  "2.1": { level: "L4", axes: ["fretboard"], skills: ["F.caged"] }, // Minör Akor Beş Şekilde
  "2.2": { level: "L4", axes: ["fretboard", "theory_ear"], skills: ["F.caged", "E.diatonic_chords"] }, // Bir Bölgede
  "3.0": { level: "L3", axes: ["fretboard"], skills: ["F.triad_inversions_sets"] }, // İnce Teller
  "3.1": { level: "L3", axes: ["fretboard", "theory_ear"], skills: ["F.triad_inversions_sets", "E.minor_key"] }, // Orta ve Kalın Teller
  "3.2": { level: "L4", axes: ["theory_ear", "fretboard"], skills: ["E.ii_V_I", "E.seventh_chords"] }, // ii – V – I
  "4.0": { level: "L4", axes: ["fretboard"], skills: ["F.caged", "F.position_shift"] }, // Komşu Şekiller
  "4.1": { level: "L4", axes: ["fretboard"], skills: ["F.caged", "F.applied_review"] }, // Dört Bölge
  "4.2": { level: "L4", axes: ["fretboard", "theory_ear"], skills: ["F.triad_inversions_sets", "E.secondary_dominants"] }, // Ses Yürütme
};

export const akorCourse: Course = {
  slug: "akorlar",
  title: "Akorlar",
  description: "Akor nasıl oluşur, CAGED ile beş pozisyon, akor türleri farklı tel gruplarında, pozisyon geçişleri.",
  kind: "technique",
  guide: [
    "## Bu kurs kimin için?",
    "Açık akorları ve barreyi bilen, akorları sapın her yerinde bulmak isteyenler için. Basit açık akor dersleri yok; her ders bir akor fikrini (formül, şekil, tel grubu, geçiş) tab ve diyagramla verir.",
    "## Nasıl çalışılır?",
    "Hepsi metronomla. Önce her şekli diyagramdan bas ve sesleri tek tek çal (boğuk tel olmasın), sonra tabı önerilen aralığın alt temposunda çal. Akor değişimi vuruştan önce biter; ritim akoru beklemez.",
    "## Kurs planı",
    "Bölüm 1 – Akor nasıl oluşur: üçlüler ve çevrimleri, yedililer, asılı ve genişletilmiş akorlar (formül → sap).",
    "Bölüm 2 – CAGED: Do ve Sol majör, La minör beş şekilde; bir bölgede bütün akorlar.",
    "Bölüm 3 – Akor türleri, farklı tel grupları: ince, orta ve kalın tellerde üçlüler; yedililerle ii – V – I.",
    "Bölüm 4 – Pozisyonlar arası geçiş: komşu şekiller, bir dizi dört bölgede, ses yürütme ve 16 ölçülük akor haritası.",
  ],
  sections: etiketle([s1, s2, s3, s4], ETIKET),
};
