// Economy Picking — 4 bölüm, özgün egzersizler. Pena yönleri economyMarks ile hesaplanır.
import type { Course } from "../types.ts";
import { TRIAD, arpShape, economyMarks, groups, measures, noteList, pos, upDown, type Pos } from "../dizi.ts";
import { tex } from "../tex.ts";
import { aDorian3, aHarm3, aMinor3, gMajor3, penta3, pentaBox1 } from "./diziler.ts";
import { chapter, ders, section } from "./ortak.ts";

const P = "ec";
const m = (ps: Pos[]) => ps.map((p) => p.m);
const rev = <T,>(xs: T[]) => [...xs].reverse();
const sixes = (ps: Pos[]) => {
  const out: Pos[] = [];
  for (let i = 0; i + 6 <= ps.length; i += 3) out.push(...ps.slice(i, i + 6));
  return out;
};
/** Beşli gruplar: 1-2-3-4-5, 2-3-4-5-6 … */
const fives = (ps: Pos[]) => groups(ps, 5);

const e8 = (bpm: number, ps: Pos[]) => tex(bpm, measures(":8", economyMarks(ps), 8));
const t8 = (bpm: number, ps: Pos[]) => tex(bpm, measures(":8", economyMarks(ps), 12, 3));
const s16 = (bpm: number, ps: Pos[]) => tex(bpm, measures(":16", economyMarks(ps), 16));
const x16 = (bpm: number, ps: Pos[]) => tex(bpm, measures(":16", economyMarks(ps), 24, 3));
const q16 = (bpm: number, ps: Pos[]) => tex(bpm, measures(":16", economyMarks(ps), 20, 5));

const CORE = "Economy picking: aynı telde aşağı-yukarı sırayla çal; tel değiştirirken pena gideceğin telin yönünde vurur. Böylece pena tellerin 'üzerinden' dolaşmak zorunda kalmaz.";

// ── Bölüm 1: Temeller ────────────────────────────────────────────────────────
const twoStrings = (lo: number[], hi: number[], sLo: number) => {
  const a = lo.map((f) => ({ s: sLo, f, m: 0 }));
  const b = hi.map((f) => ({ s: sLo - 1, f, m: 0 }));
  return [...a, ...b];
};
const s1 = section(1, "Temeller", [
  chapter(P, 1, 0, "Tel Başına Üç Nota", [CORE, "Tel başına tek sayıda nota çalınca economy picking doğal olarak ortaya çıkar: 3. nota aşağı, yeni telin ilk notası da aşağı."], [
    ders("İki Tel – Çık", 60, t8(60, Array.from({ length: 8 }, () => twoStrings([5, 7, 8], [5, 7, 8], 6)).flat()), "6. ve 5. telde 3'er nota, hep çıkarak.", ["Tel değişiminde iki aşağı vuruş tek bir hareket gibi olsun.", "Pena yeni tele 'düşer', tekrar kalkmaz."], "6. telde La–Si–Do, 5. telde Re–Mi–Fa: La minörün ilk altı notası."),
    ders("İki Tel – İn", 60, t8(60, Array.from({ length: 8 }, () => rev(twoStrings([5, 7, 8], [5, 7, 8], 6))).flat()), "Aynı notalar inerek: tel değişimi iki yukarı vuruş.", "İnişte pena yukarı yönde süpürür."),
    ders("İki Tel – Çık ve İn", 60, t8(60, Array.from({ length: 4 }, () => upDown(twoStrings([5, 7, 8], [5, 7, 8], 6))).flat()), "Altı nota çık, beş nota in.", "Dönüş notasında pena yönü kendiliğinden değişir.", "", 2),
  ]),
  chapter(P, 1, 1, "Sol Majör", [`Sol majör, 3 nota/tel: ${noteList(m(gMajor3))}.`], [
    ders("Sekizlik", 70, e8(70, upDown(gMajor3)), "Sol majör, economy picking ile çık ve in.", "Pena işaretlerini takip et: tel değişimleri sweep."),
    ders("Triole", 60, t8(60, upDown(gMajor3)), "Triole: her vuruş bir tel, her tel aşağı vuruşla başlar (çıkarken).", "Triole ile economy picking'in ritmi aynı: her vuruşta yeni tel."),
    ders("On Altılık", 55, s16(55, upDown(gMajor3)), "On altılıkla.", "Ritim tel değişimlerinden bağımsız akmalı.", "", 2),
  ]),
  chapter(P, 1, 2, "La Minör", [`La doğal minör, 3 nota/tel: ${noteList(m(aMinor3))}.`], [
    ders("Sekizlik", 70, e8(70, upDown(aMinor3)), "La minör, economy picking.", "2. telde pozisyon kayması: 6-8-10."),
    ders("Triole", 60, t8(60, upDown(aMinor3)), "Triole ile.", "Sweep anlarını yavaşlatma, hızlandırma; eşit kalsın."),
    ders("Altılık", 50, x16(50, upDown(aMinor3)), "Altılık (on altılık triole) ile.", "Altılıkta bir vuruşa iki tel sığar.", "", 2),
  ]),
]);

// ── Bölüm 2: Sekanslar ───────────────────────────────────────────────────────
const s2 = section(2, "Sekanslar", [
  chapter(P, 2, 0, "Üçlü Gruplar", ["Üçlü sekansta tel değişimleri grubun farklı yerlerine düşer; economy picking her birinde en kısa yolu seçer."], [
    ders("Sol Majör – Çık", 60, t8(60, groups(gMajor3, 3)), "1-2-3, 2-3-4 …", "Bazı gruplarda pena yönü geri dönüyor; işaretleri takip et."),
    ders("Sol Majör – İn", 60, t8(60, groups(rev(gMajor3), 3)), "Tepeden üçlülerle in.", "İnişte sweep'ler yukarı yönde."),
    ders("La Minör – Çık ve İn", 60, t8(60, [...groups(aMinor3, 3), ...groups(rev(aMinor3), 3)]), "La minörde iki yön.", "Dönüş noktasında ritmi koru.", "", 2),
  ]),
  chapter(P, 2, 1, "Beşli Gruplar", [
    "Beşleme: bir vuruşu beş eşit parçaya bölmek. Beşli gruplar beşlemeye oturur ve kulağa 'tek sayılı', akıcı bir ritim olarak gelir.",
    "Economy picking tek sayılı gruplarda en büyük avantajını gösterir.",
  ], [
    ders("Beşliler – Sekizlik", 60, e8(60, fives(gMajor3)), "Sol majör, beşli gruplar halinde sekizlikle.", "Gruplar vuruşlarla çakışmaz; grup başlarını sayarak çal."),
    ders("Beşleme", 50, q16(50, fives(gMajor3)), "Her vuruşa bir grup: beşleme ritmi.", "'1-2-3-4-5' diye her vuruşu beşe böl."),
    ders("La Minör Beşleme", 50, q16(50, fives(rev(aMinor3))), "La minörde inen beşliler.", "Beşleme zor gelirse önce metronomu yarıya indir.", "", 2),
  ]),
  chapter(P, 2, 2, "Altılı Kalıp", ["Altılı kalıp: iki telde altı nota çık, bir tel geri dön. Her grup aşağı vuruşla başlar ve tek sweep içerir."], [
    ders("Sol Majör", 55, x16(55, sixes(gMajor3)), "Altılı kalıpla çık.", "Her vuruşun başı aşağı pena."),
    ders("La Minör – İn", 55, x16(55, sixes(rev(aMinor3))), "Altılı kalıpla in.", "İnişte her grup yukarı vuruşla başlar."),
    ders("La Minör – Çık ve İn", 55, x16(55, [...sixes(aMinor3), ...sixes(rev(aMinor3))]), "İki yön birlikte.", "Hedef: sweep'ler duyulmasın, gam tek bir akış gibi.", "", 2),
  ]),
]);

// ── Bölüm 3: Pentatonik ve Arpej ─────────────────────────────────────────────
const am5 = arpShape(45, TRIAD.minor, 57, [2, 1, 1, 1, 2], 5);
/** Am arpeji (7 nota) ile çık, aynı pozisyonda La minör gamıyla in (5 nota): 12 notalık döngü */
const arpScale = [...am5, ...pos(["15.1", "13.1", "12.1", "15.2", "13.2"])];
const arpLoop = (n: number) => Array.from({ length: n }, () => arpScale).flat();
const s3 = section(3, "Pentatonik ve Arpej", [
  chapter(P, 3, 0, "Çapraz Pentatonik", [`3 nota/tel pentatonik: ${noteList(m(penta3))}. Geniş aralıklar ve tel başına tek sayı nota: economy picking için ideal.`], [
    ders("Sekizlik", 60, e8(60, upDown(penta3)), "Çapraz pentatonik, çık ve in.", "Parmak açıklığı zorlarsa 12. perdeden yukarısını ayrıca çalış."),
    ders("Triole", 60, t8(60, upDown(penta3)), "Triole ile.", "Her vuruş bir tel."),
    ders("On Altılık", 55, s16(55, upDown(penta3)), "On altılıkla.", "Gergin hissedersen dur.", "", 2),
  ]),
  chapter(P, 3, 1, "Kutu Pentatonik", ["Kutu pentatonikte her tel iki nota: economy picking'de her tel değişiminde ya alternate ya sweep olur."], [
    ders("Çık ve İn", 70, e8(70, upDown(pentaBox1)), "1. kutu economy ile.", "Çıkarken her yeni tel aşağı, inerken yukarı."),
    ders("Üçlüler", 60, t8(60, [...groups(pentaBox1, 3), ...groups(rev(pentaBox1), 3)]), "1. kutuda üçlü sekans.", "Pena yönü bazen aynı kalır: bu economy'nin kendisi."),
    ders("Dörtlüler", 55, s16(55, [...groups(pentaBox1, 4), ...groups(rev(pentaBox1), 4)]), "1. kutuda dörtlü sekans.", "Dörtlülerde her grup aynı yönle başlamayabilir.", "", 2),
  ]),
  chapter(P, 3, 2, "Arpej ve Gam", ["Arpej (akor tonları) ile gamı birleştirmek: Am arpejiyle çık, La minör gamıyla in. Gamın Sol – Fa – Mi – Re – Do notaları arpejin tepesinden geri iner. Sololarda sık kullanılan bir 'çerçeve' hareketi."], [
    ders("Arpej + Gam", 55, t8(55, arpLoop(4)), "Beş telli Am arpejiyle çık, aynı pozisyonda La minör gamıyla in.", "Arpej kısmı sweep, gam kısmı economy."),
    ders("Hızlı", 75, t8(75, arpLoop(4)), "Aynı döngü daha hızlı.", "Arpej ile gam arasındaki geçiş noktasına dikkat."),
    ders("Altılık", 50, x16(50, arpLoop(4)), "Altılık ritimle.", "Akor tonlarını hafifçe vurgula.", "", 2),
  ]),
]);

// ── Bölüm 4: Modlar ve Etüt ──────────────────────────────────────────────────
const etude = [0, 3, 6, 9, 12, 9, 6, 3].flatMap((i) => [...aHarm3.slice(i, i + 6), ...rev(aHarm3.slice(i, i + 6))]);
const s4 = section(4, "Modlar ve Etüt", [
  chapter(P, 4, 0, "Dorian", [`La Dorian: ${noteList(m(aDorian3))}. Doğal minörden tek farkı Fa#.`], [
    ders("Sekizlik", 70, e8(70, upDown(aDorian3)), "La Dorian, economy.", "Fa# notalarını dinle."),
    ders("Altılı", 55, x16(55, sixes(aDorian3)), "Dorianda altılı kalıp.", "Her vuruş aşağı vuruşla başlar."),
    ders("Beşleme", 50, q16(50, fives(aDorian3)), "Dorianda beşli gruplar.", "Tek sayılı gruplar: economy'nin en doğal alanı.", "", 2),
  ]),
  chapter(P, 4, 1, "Armonik Minör", ["La armonik minör: Sol yerine Sol#. Fa–Sol# artık ikili, neoklasik bir renk verir."], [
    ders("Sekizlik", 70, e8(70, upDown(aHarm3)), "La armonik minör, economy.", "2. telde 6-9-10: geniş açıklık."),
    ders("Triole", 60, t8(60, upDown(aHarm3)), "Triole ile.", "Tel değişimlerinde sweep."),
    ders("Altılı", 55, x16(55, sixes(aHarm3)), "Armonik minörde altılı kalıp.", "Neoklasik sololarda en çok kullanılan kalıp.", "", 2),
  ]),
  chapter(P, 4, 2, "Etüt", ["Etüt, armonik minörün iki tellik bölgelerinde çıkıp inen gruplardan oluşur; her ölçüde el bir tel kayar."], [
    ders("Triole", 60, t8(60, etude), "Sekiz ölçülük etüt, triole.", "Her grup çıkışı aşağı sweep, inişi yukarı sweep ile biter.", "", 2),
    ders("Altılık", 50, x16(50, etude), "Altılık ritimle.", "Her vuruşta yarım grup.", "", 3),
    ders("Hedef Tempo", 70, x16(70, etude), "Hedef tempoda.", "Bunu temiz çalabiliyorsan economy picking'in temellerine hakimsin.", "", 3),
  ]),
]);

export const economyCourse: Course = {
  slug: "economy-pena",
  title: "Economy Picking",
  description: "Tel geçişlerinde pena yönünü koruyarak hız.",
  kind: "technique",
  icon: "↯",
  guide: [
    "## Economy picking nedir?",
    CORE,
    "Alternate picking ile sweep picking'in birleşimidir: aynı telde alternate, tel değişiminde sweep. Özellikle 3 nota/tel gamlarda ve tek sayılı gruplarda büyük hız kazandırır.",
    "## Nasıl çalışılır?",
    "Sweep anı ritmi hızlandırmamalı: iki aşağı vuruş, iki ayrı nota olarak eşit aralıkla duyulmalı. Pena işaretlerini takip et ve önce yavaş çal.",
    "## Kurs planı",
    "Bölüm 1 – Temeller: tel başına üç nota, Sol majör, La minör.",
    "Bölüm 2 – Sekanslar: üçlü, beşli ve altılı gruplar.",
    "Bölüm 3 – Pentatonik ve arpej.",
    "Bölüm 4 – Modlar ve etüt.",
  ],
  sections: [s1, s2, s3, s4],
};
