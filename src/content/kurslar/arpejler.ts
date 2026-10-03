// Arpejler — 5 bölüm, özgün egzersizler.
// Açık akor arpejleri desenlerden, pozisyon arpejleri akor tonlarından (inWindow) üretilir.
import type { Course } from "../types.ts";
import { tex } from "../tex.ts";
import { SEVENTH, TRIAD, inWindow, measures, noteList, pc, pos, upDown, type Pos } from "../dizi.ts";
import { chapter, ders, section } from "./ortak.ts";

const P = "ar";

// ── Açık akorlar (bastan tize) ───────────────────────────────────────────────
const OPEN_CHORDS: Record<string, string> = {
  Am: "0.5 2.4 2.3 1.2 0.1", A: "0.5 2.4 2.3 2.2 0.1", C: "3.5 2.4 0.3 1.2 0.1", D: "0.4 2.3 3.2 2.1",
  Dm: "0.4 2.3 3.2 1.1", E: "0.6 2.5 2.4 1.3 0.2 0.1", Em: "0.6 2.5 2.4 0.3 0.2 0.1", G: "3.6 2.5 0.4 0.3 0.2 3.1",
  F: "1.6 3.5 3.4 2.3 1.2 1.1", E7: "0.6 2.5 0.4 1.3 0.2 0.1",
};
const chordPos = (name: string) => pos(OPEN_CHORDS[name].split(" "));
/** Desen: B = bas, A = 4. tel (alternatif bas), 3/2/1 = o teldeki nota */
function pattern(name: string, pat: string): string[] {
  const ps = chordPos(name);
  const bass = ps[0];
  const onString = (s: number) => ps.find((p) => p.s === s) ?? bass;
  return [...pat].map((c) => {
    const p = c === "B" ? bass : c === "A" ? (bass.s > 4 ? onString(4) : onString(3)) : onString(Number(c));
    return `${p.f}.${p.s}`;
  });
}
/** Akor notaları kök – üçlü – beşli (– yedili) sırasıyla */
const tones = (name: string) => {
  const ms = chordPos(name).map((p) => p.m);
  const root = ms[0];
  return noteList([...ms].sort((a, b) => pc(a - root) - pc(b - root)));
};
const bars = (dur: string, chords: string[], pat: string, perBar = pat.length) =>
  chords.flatMap((c) => measures(dur, pattern(c, pat), perBar));
const toneLine = (chords: string[]) => [...new Set(chords)].map((c) => `${c}: ${tones(c)}`).join(" · ");

// ── Pozisyon arpejleri ───────────────────────────────────────────────────────
const ROOTS: Record<string, number> = { C: 48, D: 50, E: 40, F: 41, G: 43, A: 45, B: 47 };
type Kind = keyof typeof TRIAD | keyof typeof SEVENTH;
const IV: Record<Kind, readonly number[]> = { ...TRIAD, ...SEVENTH };
/** Kökten başlayan pozisyon arpeji */
function arp(root: string, kind: Kind, lo: number, hi: number): Pos[] {
  const r = ROOTS[root];
  const all = inWindow(r, IV[kind], lo, hi);
  const i = all.findIndex((p) => pc(p.m) === pc(r));
  return all.slice(i);
}
const t = (ps: Pos[]) => ps.map((p) => `${p.f}.${p.s}`);
const names = (ps: Pos[]) => noteList(ps.map((p) => p.m));
const e8 = (bpm: number, notes: string[], end: string[] = []) => tex(bpm, [...measures(":8", notes, 8), ...end]);
const t8 = (bpm: number, notes: string[], end: string[] = []) => tex(bpm, [...measures(":8", notes, 12, 3), ...end]);
const s16 = (bpm: number, notes: string[], end: string[] = []) => tex(bpm, [...measures(":16", notes, 16), ...end]);
/** Akor başına bir ölçü: ilk dört ton çık ve in (8 nota) */
const climb = (ps: Pos[]) => t([0, 1, 2, 3, 4, 3, 2, 1].map((i) => ps[Math.min(i, ps.length - 1)]));

const TIPS_OPEN = ["Akoru tamamen bas ve ölçü boyunca bırakma; notalar birbirinin üzerine çınlasın.", "Bas notası akorun kökü: biraz daha güçlü çal."];

// ── Bölüm 1: Açık Akorlar ────────────────────────────────────────────────────
const MINOR = ["Am", "Em", "Dm", "Am"];
const MAJOR = ["G", "C", "D", "G"];
const POP1 = ["G", "D", "Em", "C"];
const POP2 = ["Am", "F", "C", "G"];
const s1 = section(1, "Açık Akorlar", [
  chapter(P, 1, 0, "Minör Akorlar", [
    "Arpej, akorun notalarını tek tek çalmaktır. Minör akor: kök – küçük üçlü – beşli.",
    `Notalar: ${toneLine(MINOR)}.`,
  ], [
    ders("Dörtlük", 60, tex(60, bars(":4", MINOR, "B321")), "Am – Em – Dm – Am: bas ve üç ince tel, dörtlük.", TIPS_OPEN),
    ders("Sekizlik", 70, tex(70, bars(":8", MINOR, "B3212321")), "Aynı akorlar, çık-in deseni.", TIPS_OPEN),
    ders("Ara Desen", 70, tex(70, bars(":8", MINOR, "B3231323")), "Sol teli 'çapa' olan desen: 3-2-3-1-3-2-3.", "Bu desen klasik gitar ve folk eşliklerinde çok yaygındır.", "", 2),
  ]),
  chapter(P, 1, 1, "Majör Akorlar", [
    "Majör akor: kök – büyük üçlü – beşli. G – C – D, Sol majörün I – IV – V akorlarıdır.",
    `Notalar: ${toneLine(MAJOR)}.`,
  ], [
    ders("Dörtlük", 60, tex(60, bars(":4", MAJOR, "B321")), "G – C – D – G, dörtlük.", TIPS_OPEN),
    ders("Sekizlik", 70, tex(70, bars(":8", MAJOR, "B3212321")), "Çık-in deseni.", TIPS_OPEN),
    ders("Ara Desen", 70, tex(70, bars(":8", MAJOR, "B3231323")), "3-2-3-1 deseni.", "D akorunda bas 4. tel.", "", 2),
  ]),
  chapter(P, 1, 2, "Akor Dizileri", [
    "G – D – Em – C (I – V – vi – IV) ve Am – F – C – G (vi – IV – I – V): pop müziğin iki temel dizisi. Aslında aynı dört akor, farklı başlangıç noktasıyla.",
  ], [
    ders("I – V – vi – IV", 70, tex(70, bars(":8", POP1, "B3212321")), "G – D – Em – C arpej.", "Akor değişimini ölçünün son notasında hazırla.", `Notalar: ${toneLine(POP1)}.`),
    ders("vi – IV – I – V", 70, tex(70, bars(":8", POP2, "B3212321")), "Am – F – C – G arpej.", "F barre akoru zorlarsa önce yalnızca ince dört teli bas.", `Notalar: ${toneLine(POP2)}.`),
    ders("İkisi Birden", 80, tex(80, [...bars(":8", POP1, "B3231323"), ...bars(":8", POP2, "B3231323")]), "İki dizi art arda.", "Sekiz akor, tek akış.", "", 2),
  ]),
]);

// ── Bölüm 2: Desenler ────────────────────────────────────────────────────────
const ANDALUS = ["Am", "G", "F", "E"];
const TRAVIS = ["C", "Am", "G", "E7"];
const s2 = section(2, "Desenler", [
  chapter(P, 2, 0, "6/8 Arpej", [
    "6/8 ölçüsünde her ölçüde altı sekizlik vardır, iki büyük vuruşa (üçer) bölünür: '1-2-3 4-5-6'. Balad ve halk müziğinde çok kullanılır.",
    "Am – G – F – E: Endülüs kadansı. Bas La–Sol–Fa–Mi diye iner.",
  ], [
    ders("Yavaş", 60, tex(60, [`\\ts 6 8 ${bars(":8", ANDALUS, "B32123")[0]}`, ...bars(":8", ANDALUS, "B32123").slice(1)]), "6/8 ölçüsünde arpej.", "Birinci ve dördüncü sekizlikleri hafifçe vurgula."),
    ders("İki Tur", 70, tex(70, [`\\ts 6 8 ${bars(":8", ANDALUS, "B32123")[0]}`, ...bars(":8", ANDALUS, "B32123").slice(1), ...bars(":8", ANDALUS, "B31213")]), "İki farklı desenle iki tur.", "İkinci turda 1. tel ortaya geliyor."),
    ders("Akıcı", 90, tex(90, [`\\ts 6 8 ${bars(":8", ANDALUS, "B32123")[0]}`, ...bars(":8", [...ANDALUS, ...ANDALUS], "B32123").slice(1)]), "Daha akıcı tempoda iki tur.", "6/8'in 'sallanan' hissini yakala.", "", 2),
  ]),
  chapter(P, 2, 1, "Alternatif Bas", [
    "Alternatif bas: başparmak iki bas teli arasında gidip gelir, diğer parmaklar ince tellerde melodi/eşlik çalar. Country ve folk parmak stilinin temeli.",
    `Notalar: ${toneLine(TRAVIS)}.`,
  ], [
    ders("Sadece Bas", 60, tex(60, bars(":4", TRAVIS, "BABA")), "Önce sadece bas: kök ve 4. tel sırayla.", "Başparmak bağımsız ve sabit bir saat gibi çalışsın."),
    ders("Bas ve Tiz", 60, tex(60, bars(":8", TRAVIS, "B3A2B1A2")), "Bas sırası korunur, aralara ince teller eklenir.", "Bas vuruşlarda, tiz notalar aralarda."),
    ders("Akıcı", 80, tex(80, [...bars(":8", TRAVIS, "B3A2B1A2"), ...bars(":8", TRAVIS, "B3A2B1A2")]), "İki tur, daha hızlı.", "E7'de yedili (Re) 4. telde: alternatif bas bu notaya düşer.", "", 2),
  ]),
  chapter(P, 2, 2, "İnen Arpej", ["Arpejin yönü rengini değiştirir: çıkan arpej 'açılır', inen arpej 'kapanır' gibi duyulur."], [
    ders("Bas ve İniş", 70, tex(70, bars(":8", POP2, "B123B123")), "Bastan sonra tizden pese iniş.", "Tiz notaya sıçrarken bası çınlat."),
    ders("Dalga", 70, tex(70, bars(":8", POP2, "B1232123")), "İnip çıkan dalga deseni.", "Desen boyunca ritim eşit."),
    ders("Triole Dalga", 70, tex(70, POP2.flatMap((c) => measures(":8", pattern(c, "B12321123211"), 12, 3))), "Triole ile dalga deseni.", "Her vuruşa üç nota.", "", 2),
  ]),
]);

// ── Bölüm 3: Pozisyon Arpejleri ──────────────────────────────────────────────
const Cm = arp("C", "major", 7, 10);
const Gm = arp("G", "major", 2, 5);
const Fm = arp("F", "major", 5, 8);
const Am = arp("A", "minor", 4, 8);
const Dm = arp("D", "minor", 5, 8);
const Em = arp("E", "minor", 7, 10);
const s3 = section(3, "Pozisyon Arpejleri", [
  chapter(P, 3, 0, "Majör Üçlüler", [
    "Pozisyon arpejinde akorun tonları tek tek, bir el pozisyonunda iki oktava yayılır. Solo yaparken akor tonlarını bulmanın yolu budur.",
    "Majör üçlü: 1 – 3 – 5 (kök, büyük üçlü, tam beşli).",
  ], [
    ders("Do Majör", 70, e8(70, t(upDown(Cm))), "8. pozisyonda Do majör arpeji.", "Her tele bir ya da iki nota; parmak düzenini ezberle.", `Notalar: ${names(Cm)}.`),
    ders("Sol Majör", 70, e8(70, t(upDown(Gm))), "3. pozisyonda Sol majör arpeji.", "Kök Sol üç yerde: 6. telde 3, 4. telde 5, 1. telde 3.", `Notalar: ${names(Gm)}.`),
    ders("Fa Majör", 70, e8(70, t(upDown(Fm))), "5. pozisyonda Fa majör arpeji.", "Fa barre akorunun şeklini düşün: arpej onun içindedir.", `Notalar: ${names(Fm)}.`, 2),
  ]),
  chapter(P, 3, 1, "Minör Üçlüler", ["Minör üçlü: 1 – b3 – 5. Majör arpejden tek farkı üçlünün yarım ses pes olması."], [
    ders("La Minör", 70, e8(70, t(upDown(Am))), "5. pozisyonda La minör arpeji.", "Pentatonik 1. kutunun içinde: arpej notaları kutunun 'iskeleti'.", `Notalar: ${names(Am)}.`),
    ders("Re Minör", 70, e8(70, t(upDown(Dm))), "5. pozisyonda Re minör arpeji.", "Kök 5. telde.", `Notalar: ${names(Dm)}.`),
    ders("Mi Minör", 70, e8(70, t(upDown(Em))), "7. pozisyonda Mi minör arpeji.", "Kök 5. telde 7. perde.", `Notalar: ${names(Em)}.`, 2),
  ]),
  chapter(P, 3, 2, "Akor Dizisinde Arpej", ["Am – Dm – G – C: kökler dörtlü aralıklarla ilerler (La → Re → Sol → Do). Her akor için en yakın pozisyon seçildi."], [
    ders("Sekizlik", 70, e8(70, [Am, Dm, Gm, Cm].flatMap(climb)), "Her ölçüde bir akorun ilk beş tonu, çık ve in.", "Pozisyon değişimlerini önceden gör."),
    ders("Triole", 60, t8(60, [Am, Dm, Gm, Cm].flatMap((ps) => t(upDown(ps.slice(0, 7))).slice(0, 12))), "Triole ile her akorda daha geniş arpej.", "Her ölçü bir akor."),
    ders("On Altılık", 60, s16(60, [Am, Dm, Gm, Cm].flatMap((ps) => [...climb(ps), ...climb(ps)])), "On altılıkla.", "Akor değişimlerinde ritim kopmasın.", "", 2),
  ]),
]);

// ── Bölüm 4: 7'li Akorlar ────────────────────────────────────────────────────
const Cmaj7 = arp("C", "maj7", 7, 10);
const Fmaj7 = arp("F", "maj7", 5, 8);
const Am7 = arp("A", "m7", 4, 8);
const Dm7 = arp("D", "m7", 4, 8);
const G7 = arp("G", "dom7", 2, 5);
const E7 = arp("E", "dom7", 4, 7);
const Bm7b5 = arp("B", "m7b5", 5, 8);
const s4 = section(4, "7'li Akorlar", [
  chapter(P, 4, 0, "Majör 7", ["Majör 7 (maj7): majör üçlü + büyük yedili (1 – 3 – 5 – 7). Yumuşak, 'rüya gibi' bir ses; caz ve bossa novada sık kullanılır."], [
    ders("Cmaj7", 70, e8(70, t(upDown(Cmaj7))), "Do majör 7 arpeji.", "Yedili (Si) kökün yarım ses altında.", `Notalar: ${names(Cmaj7)}.`),
    ders("Fmaj7", 70, e8(70, t(upDown(Fmaj7))), "Fa majör 7 arpeji.", "Yedili Mi.", `Notalar: ${names(Fmaj7)}.`),
    ders("İkisi Birden", 70, e8(70, [...climb(Cmaj7), ...climb(Fmaj7), ...climb(Cmaj7), ...climb(Fmaj7)]), "Cmaj7 – Fmaj7.", "I – IV: Do majörün iki majör 7 akoru.", "", 2),
  ]),
  chapter(P, 4, 1, "Minör 7", ["Minör 7 (m7): minör üçlü + küçük yedili (1 – b3 – 5 – b7). Funk, soul ve cazın temel minör sesi."], [
    ders("Am7", 70, e8(70, t(upDown(Am7))), "La minör 7 arpeji.", "Pentatonikten tek farkı Re yok: La–Do–Mi–Sol.", `Notalar: ${names(Am7)}.`),
    ders("Dm7", 70, e8(70, t(upDown(Dm7))), "Re minör 7 arpeji.", "Kök 5. telde.", `Notalar: ${names(Dm7)}.`),
    ders("Am7 – Dm7", 70, e8(70, [...climb(Am7), ...climb(Dm7), ...climb(Am7), ...climb(Dm7)]), "i – iv: iki minör 7.", "Pozisyon aynı, sadece notalar değişiyor.", "", 2),
  ]),
  chapter(P, 4, 2, "Dominant 7 ve Yarım Eksik", [
    "Dominant 7 (7): majör üçlü + küçük yedili (1 – 3 – 5 – b7). Gerilimli bir sestir ve bir dörtlü yukarıdaki akora 'çözülmek' ister: G7 → C, E7 → Am.",
    "Yarım eksik (m7b5): eksik üçlü + küçük yedili (1 – b3 – b5 – b7). Minör tonlarda ii akorudur: Bm7b5 → E7 → Am.",
  ], [
    ders("G7", 70, e8(70, t(upDown(G7))), "Sol dominant 7 arpeji.", "Yedili (Fa) ile üçlü (Si) arasında artık dörtlü (tritone) var: gerilimin kaynağı.", `Notalar: ${names(G7)}.`),
    ders("E7", 70, e8(70, t(upDown(E7))), "Mi dominant 7 arpeji.", "Sol# notası La'ya çözülür.", `Notalar: ${names(E7)}.`),
    ders("Bm7b5", 70, e8(70, t(upDown(Bm7b5))), "Si yarım eksik arpeji.", "Fa notası (b5) bu akorun karakteri.", `Notalar: ${names(Bm7b5)}.`, 2),
  ]),
  chapter(P, 4, 3, "ii – V – I", ["Dm7 – G7 – Cmaj7: cazın en temel hareketi. Minör karşılığı: Bm7b5 – E7 – Am7."], [
    ders("Majör ii–V–I", 70, e8(70, [...climb(Dm7), ...climb(G7), ...climb(Cmaj7), ...climb(Cmaj7)]), "Dm7 – G7 – Cmaj7.", "Her akorun ilk notası kökü."),
    ders("Minör ii–V–i", 70, e8(70, [...climb(Bm7b5), ...climb(E7), ...climb(Am7), ...climb(Am7)]), "Bm7b5 – E7 – Am7.", "E7'deki Sol#, Am7'deki La'ya yarım sesle bağlanır."),
    ders("İkisi Birden", 70, s16(70, [Dm7, G7, Cmaj7, Cmaj7, Bm7b5, E7, Am7, Am7].flatMap((ps) => [...climb(ps), ...climb(ps)])), "Majör ve minör ii–V–I art arda, on altılık.", "Do majör ile La minör aynı notaları paylaşır: iki kadans aynı 'evde'.", "", 2),
  ]),
]);

// ── Bölüm 5: Etütler ─────────────────────────────────────────────────────────
const CLASSIC = ["Am", "Dm", "E", "Am", "F", "Dm", "E7", "Am"];
const BALLAD = ["C", "G", "Am", "F", "C", "G", "F", "C"];
const s5 = section(5, "Etütler", [
  chapter(P, 5, 0, "Klasik Etüt", ["Am – Dm – E – Am – F – Dm – E7 – Am: klasik gitar etütlerinden tanıdık bir minör dizi. E ve E7 her seferinde Am'ye çözülür."], [
    ders("Yavaş", 60, tex(60, [...bars(":8", CLASSIC, "B3231323"), ":1 (0.5 2.4 2.3 1.2 0.1)"]), "Sekiz akorluk etüt.", "Bası biraz daha güçlü çal; melodi gibi duyulsun.", `Notalar: ${toneLine(CLASSIC)}.`, 2),
    ders("Triole", 60, tex(60, [...CLASSIC.flatMap((c) => measures(":8", pattern(c, "B32123B32123"), 12, 3)), ":1 (0.5 2.4 2.3 1.2 0.1)"]), "Triole desenle.", "Akış hiç kesilmesin.", "", 3),
    ders("Hedef Tempo", 90, tex(90, [...CLASSIC.flatMap((c) => measures(":8", pattern(c, "B32123B32123"), 12, 3)), ":1 (0.5 2.4 2.3 1.2 0.1)"]), "Hedef tempoda.", "Akor değişimleri sessiz ve hızlı.", "", 3),
  ]),
  chapter(P, 5, 1, "Balad Etüdü", ["C – G – Am – F – C – G – F – C: I – V – vi – IV ve plagal (IV – I) kapanış. 'Amin' kadansı da denir."], [
    ders("6/8 Balad", 60, tex(60, [`\\ts 6 8 ${bars(":8", BALLAD, "B32123")[0]}`, ...bars(":8", BALLAD, "B32123").slice(1)]), "6/8'de balad eşliği.", "Ölçü başına iki büyük vuruş.", "", 2),
    ders("Dalga", 70, tex(70, [`\\ts 6 8 ${bars(":8", BALLAD, "B31213")[0]}`, ...bars(":8", BALLAD, "B31213").slice(1)]), "Farklı desen.", "1. teldeki notalar melodi gibi duyulsun.", "", 2),
    ders("Hedef Tempo", 90, tex(90, [`\\ts 6 8 ${bars(":8", BALLAD, "B32123")[0]}`, ...bars(":8", [...BALLAD, ...BALLAD], "B32123").slice(1)]), "İki tur, hedef tempoda.", "Bunu akıcı çalabiliyorsan arpejlerin temellerine hakimsin.", "", 3),
  ]),
]);

export const arpejCourse: Course = {
  slug: "arpej",
  title: "Arpejler",
  description: "Akorları melodik arpej kalıplarına dönüştür.",
  kind: "technique",
  icon: "⚟",
  guide: [
    "## Arpej nedir?",
    "Akorun notalarını aynı anda değil, tek tek çalmak. Eşlikte akorlara hareket katar; soloda ise akor tonlarını bulmanın en sağlam yoludur.",
    "## Nasıl çalışılır?",
    "Açık akor arpejlerinde akoru ölçü boyunca basılı tut ki notalar birbirinin üzerine çınlasın. Pozisyon arpejlerinde ise her notayı çaldıktan sonra bırak: notalar ayrı ayrı duyulmalı.",
    "## Kurs planı",
    "Bölüm 1 – Açık akorlar: minör, majör, akor dizileri.",
    "Bölüm 2 – Desenler: 6/8, alternatif bas, inen arpej.",
    "Bölüm 3 – Pozisyon arpejleri: majör ve minör üçlüler.",
    "Bölüm 4 – 7'li akorlar ve ii – V – I.",
    "Bölüm 5 – Etütler.",
  ],
  sections: [s1, s2, s3, s4, s5],
};

