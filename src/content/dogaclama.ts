// Doğaçlama için eşlik (backing) kayıtları: ritim gitarı, bas ve davul, alphaTex olarak üretilir.
// Her kaydın üzerinde çalınabilecek gamlar sap gezgininde (FretboardExplorer) gösterilir.
import { AKOR } from "./kurslar/diziler.ts";

export type BackingScale = { name: string; setId: string; root: number; note: string };
export type Backing = {
  slug: string;
  title: string;
  style: string;
  key: string;
  bpm: number;
  chords: string;
  scales: BackingScale[];
  tips: string[];
  tex: string;
};

const PC: Record<string, number> = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
const rootPc = (chord: string) => PC[chord.match(/^[A-G]#?/)![0]];

/** 4 telli bas: tel 4 = Mi (E1), 3 = La, 2 = Re, 1 = Sol. Kök için en pes rahat perde. */
function bass(pc: number): { f: number; s: number } {
  for (const [s, open] of [[4, 4], [3, 9], [2, 2]] as const) {
    const f = (pc - open + 12) % 12;
    if (f <= 4) return { f, s };
  }
  return { f: (pc - 9 + 12) % 12, s: 3 };
}
const b = (p: { f: number; s: number }) => `${p.f}.${p.s}`;
const BASS_OPEN = [43, 38, 33, 28]; // tel 1 (Sol) … tel 4 (Mi)
/** Verilen nota yüksekliği için bastaki en pes rahat konum */
function bassAt(pitch: number): string {
  for (let s = 4; s >= 1; s--) {
    const f = pitch - BASS_OPEN[s - 1];
    if (f >= 0 && f <= 7) return `${f}.${s}`;
  }
  throw new Error(`Basta çalınamaz: ${pitch}`);
}
const pitchOf = (p: { f: number; s: number }) => BASS_OPEN[p.s - 1] + p.f;
/** Gitarda power chord (kök + beşli + oktav) */
function power(pc: number, muted = false) {
  const f6 = (pc - 4 + 12) % 12;
  const [f, s] = f6 <= 7 ? [f6, 6] : [(pc - 9 + 12) % 12, 5];
  const n = [`${f}.${s}`, `${f + 2}.${s - 1}`, `${f + 2}.${s - 2}`];
  return `(${n.map((x) => (muted ? `${x}{pm}` : x)).join(" ")})`;
}
const chord = (name: string) => `(${AKOR[name]})`;
const MUTE = (name: string) => `(${AKOR[name].split(" ").map((n) => `x.${n.split(".")[1]}`).join(" ")})`;

// Davul kalıpları
const K = "KickHit", SN = "SnareHit", H = "HiHatClosed";
const D = (...xs: string[]) => (xs.length === 1 ? xs[0] : `(${xs.join(" ")})`);
const DRUM_ROCK = `:8 ${[D(K, H), D(H), D(SN, H), D(H), D(K, H), D(K, H), D(SN, H), D(H)].join(" ")}`;
const DRUM_FUNK = `:16 ${[D(K, H), H, H, D(K, H), D(SN, H), H, D(K, H), H, H, H, D(K, H), H, D(SN, H), H, H, H].join(" ")}`;
const DRUM_METAL = `:16 ${[D(K, H), K, D(K, H), K, D(SN, H), K, D(K, H), K, D(K, H), K, D(K, H), K, D(SN, H), K, D(K, H), K].join(" ")}`;
const DRUM_SHUFFLE = `:8 ${[D(K, H), "r", H, D(SN, H), "r", H, D(K, H), "r", H, D(SN, H), "r", H].map((x) => `${x}{tu 3}`).join(" ")}`;
const DRUM_68 = `:8 ${[D(K, H), H, H, D(SN, H), H, H].join(" ")}`;

function song(title: string, bpm: number, tracks: { name: string; instrument: string; staff: string; extra?: string; bars: string[] }[], ts?: string) {
  const lines = [`\\title "${title}" \\tempo ${bpm} .`];
  for (const t of tracks) {
    lines.push(`\\track "${t.name}" \\instrument ${t.instrument} \\staff {${t.staff}}${t.extra ? ` ${t.extra}` : ""}`);
    lines.push((ts ? `\\ts ${ts} ` : "") + t.bars.join(" | "));
  }
  return lines.join("\n");
}
const BASS = { name: "Bas", instrument: "33", staff: "tabs", extra: "\\tuning G2 D2 A1 E1" };
const DRUMS = { name: "Davul", instrument: "percussion", staff: "score", extra: "\\articulation defaults" };

// ── 1. La minör blues shuffle (12 ölçü) ──────────────────────────────────────
const BLUES = ["A7", "A7", "A7", "A7", "D7", "D7", "A7", "A7", "E7", "D7", "A7", "E7"];
const shuffleGtr = (c: string) => `:8 ${[..."D-UD-UD-UD-U"].map((x) => (x === "-" ? "r{tu 3}" : `${chord(c)}{${x === "D" ? "bd" : "bu"} tu 3}`)).join(" ")}`;
const shuffleBass = (c: string) => {
  const r = bass(rootPc(c));
  const five = bassAt(pitchOf(r) + 7), six = bassAt(pitchOf(r) + 9);
  return `:8 ${[b(r), "r", b(r), five, "r", five, six, "r", six, five, "r", five].map((x) => `${x}{tu 3}`).join(" ")}`;
};
const bluesShuffle: Backing = {
  slug: "la-blues-shuffle",
  title: "La Blues Shuffle",
  style: "Blues",
  key: "La (A)",
  bpm: 90,
  chords: "A7 – D7 – E7, 12 ölçü blues",
  scales: [
    { name: "La minör pentatonik", setId: "minor-penta", root: 9, note: "Bluesun temel solo dizisi. Majör akorlar üzerinde minör pentatonik çalmak blues'un 'kirli' rengini verir." },
    { name: "La blues", setId: "blues", root: 9, note: "Pentatoniğe b5 (Re#) eklenir: geçiş notası olarak kullan, üzerinde durma." },
    { name: "La Miksolidyen", setId: "mixolydian", root: 9, note: "A7 akorunun kendi dizisi; daha 'majör' ve melodik bir ses." },
  ],
  tips: ["Akor değişimlerini takip et: D7'ye geçince Re notasını, E7'ye geçince Mi notasını hedefle.", "Shuffle hissini solona da taşı: sekizlikleri uzun-kısa çal."],
  tex: song("La Blues Shuffle", 90, [
    { name: "Ritim Gitar", instrument: "27", staff: "tabs", bars: BLUES.map(shuffleGtr) },
    { ...BASS, bars: BLUES.map(shuffleBass) },
    { ...DRUMS, bars: BLUES.map(() => DRUM_SHUFFLE) },
  ]),
};

// ── 2. Mi minör rock ─────────────────────────────────────────────────────────
const ROCK = ["Em", "C", "G", "D", "Em", "C", "G", "D"];
const rockGtr = (c: string) => `:8 ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `${power(rootPc(c), i % 4 !== 0)}{sd}`).join(" ")}`;
const rockBass = (c: string) => `:8 ${Array(8).fill(b(bass(rootPc(c)))).join(" ")}`;
const eMinorRock: Backing = {
  slug: "mi-minor-rock",
  title: "Mi Minör Rock",
  style: "Rock",
  key: "Mi minör (Em)",
  bpm: 100,
  chords: "Em – C – G – D (i – VI – III – VII)",
  scales: [
    { name: "Mi minör pentatonik", setId: "minor-penta", root: 4, note: "En güvenli seçim: her akorda iyi duyulur." },
    { name: "Mi doğal minör", setId: "minor", root: 4, note: "Fa# ve Do eklenince daha melodik cümleler kurulur." },
  ],
  tips: ["Akor köklerini (Mi, Do, Sol, Re) cümle sonlarında hedefle.", "Power chord ritmi sekizlik: sololarda bu nabzı koru."],
  tex: song("Mi Minör Rock", 100, [
    { name: "Ritim Gitar", instrument: "30", staff: "tabs", bars: ROCK.map(rockGtr) },
    { ...BASS, bars: ROCK.map(rockBass) },
    { ...DRUMS, bars: ROCK.map(() => DRUM_ROCK) },
  ]),
};

// ── 3. Re Dorian funk ────────────────────────────────────────────────────────
const FUNK = ["Dm7 (funk)", "Dm7 (funk)", "G7 (funk)", "G7 (funk)", "Dm7 (funk)", "Dm7 (funk)", "G7 (funk)", "G7 (funk)"];
const funkGtr = (c: string) => `:16 ${[..."D-xUXxD-XxDUXxDU"].map((x) => {
  if (x === "-") return "r";
  if (x === "D" || x === "U") return `${chord(c)}{${x === "D" ? "bd" : "bu"}}`;
  return `${MUTE(c)}{${x === "X" ? "bd" : "bu"}}`;
}).join(" ")}`;
const funkBass = (c: string) => {
  const r = bass(rootPc(c));
  const oct = bassAt(pitchOf(r) + 12);
  return `:16 ${[b(r), "r", "r", b(r), "r", "r", oct, "r", b(r), "r", b(r), "r", oct, "r", b(r), "r"].join(" ")}`;
};
const dDorianFunk: Backing = {
  slug: "re-dorian-funk",
  title: "Re Dorian Funk",
  style: "Funk",
  key: "Re Dorian (Dm7)",
  bpm: 95,
  chords: "Dm7 – G7 (i – IV)",
  scales: [
    { name: "Re Dorian", setId: "dorian", root: 2, note: "Si notası (majör 6'lı) G7 akorunun üçlüsüdür; Dorian'ı tanımlayan nota." },
    { name: "Re minör pentatonik", setId: "minor-penta", root: 2, note: "Kısa, ritmik cümleler için." },
  ],
  tips: ["Funk'ta az nota, çok ritim: kısa ve kesik cümleler kur.", "G7'ye geçerken Si notasını vurgula."],
  tex: song("Re Dorian Funk", 95, [
    { name: "Ritim Gitar", instrument: "27", staff: "tabs", bars: FUNK.map(funkGtr) },
    { ...BASS, bars: FUNK.map(funkBass) },
    { ...DRUMS, bars: FUNK.map(() => DRUM_FUNK) },
  ]),
};

// ── 4. Do majör pop ──────────────────────────────────────────────────────────
const POP = ["C", "G", "Am", "F", "C", "G", "Am", "F"];
const popGtr = (c: string) => `:8 ${[..."D-DU-UDU"].map((x) => (x === "-" ? "r" : `${chord(c)}{${x === "D" ? "bd" : "bu"}}`)).join(" ")}`;
const popBass = (c: string) => `:4 ${Array(4).fill(b(bass(rootPc(c)))).join(" ")}`;
const cMajorPop: Backing = {
  slug: "do-major-pop",
  title: "Do Majör Pop",
  style: "Pop",
  key: "Do majör (C)",
  bpm: 90,
  chords: "C – G – Am – F (I – V – vi – IV)",
  scales: [
    { name: "Do majör pentatonik", setId: "major-penta", root: 0, note: "La minör pentatonikle aynı notalar, Do'dan başlayarak: parlak ve güvenli." },
    { name: "Do majör", setId: "major", root: 0, note: "Fa ve Si notaları melodiye renk katar; F akorunda Fa'yı, G akorunda Si'yi dene." },
  ],
  tips: ["Melodik düşün: kısa bir motif bul ve her akorda tekrar et.", "Am akoru gelince La notasına inmek hüzünlü bir renk verir."],
  tex: song("Do Majör Pop", 90, [
    { name: "Ritim Gitar", instrument: "25", staff: "tabs", bars: POP.map(popGtr) },
    { ...BASS, bars: POP.map(popBass) },
    { ...DRUMS, bars: POP.map(() => DRUM_ROCK) },
  ]),
};

// ── 5. La minör balad (6/8) ──────────────────────────────────────────────────
const BALLAD = ["Am", "F", "C", "G", "Am", "F", "G", "E"];
const balladGtr = (c: string) => {
  const ns = AKOR[c].split(" ");
  const on = (s: number) => ns.find((n) => n.endsWith(`.${s}`)) ?? ns[0];
  return `:8 ${[ns[0], on(3), on(2), on(1), on(2), on(3)].join(" ")}`;
};
const balladBass = (c: string) => `:2 ${b(bass(rootPc(c)))}{d}`;
const aMinorBallad: Backing = {
  slug: "la-minor-balad",
  title: "La Minör Balad",
  style: "Balad (6/8)",
  key: "La minör (Am)",
  bpm: 70,
  chords: "Am – F – C – G – Am – F – G – E",
  scales: [
    { name: "La doğal minör", setId: "minor", root: 9, note: "Yavaş baladda gamın bütün notaları kullanılabilir." },
    { name: "La armonik minör", setId: "harmonic-minor", root: 9, note: "Son ölçüdeki E akorunda Sol# çal: La'ya güçlü bir dönüş." },
  ],
  tips: ["Az nota, uzun notalar, bol vibrato.", "E akorunda Sol# notası çalıp Am'ye dönerken La'ya çöz."],
  tex: song("La Minör Balad", 70, [
    { name: "Arpej Gitar", instrument: "25", staff: "tabs", bars: BALLAD.map(balladGtr) },
    { ...BASS, bars: BALLAD.map(balladBass) },
    { ...DRUMS, bars: BALLAD.map(() => DRUM_68) },
  ], "6 8"),
};

// ── 6. Mi Frigyen metal ──────────────────────────────────────────────────────
const METAL = ["E5", "E5", "F5", "E5", "E5", "E5", "G5", "F5"];
const metalGtr = (c: string) => {
  const pc = rootPc(c);
  if (c === "E5") return `:16 ${Array(16).fill("0.6{pm sd}").map((x, i) => (i === 14 ? `${power(5)}{sd}` : i === 15 ? `${power(5)}{su}` : x)).join(" ")}`;
  return `:16 ${Array(16).fill(0).map((_, i) => `${power(pc, i % 4 !== 0)}{${i % 2 ? "su" : "sd"}}`).join(" ")}`;
};
const metalBass = (c: string) => `:16 ${Array(16).fill(b(bass(rootPc(c)))).join(" ")}`;
const ePhrygianMetal: Backing = {
  slug: "mi-frigyen-metal",
  title: "Mi Frigyen Metal",
  style: "Metal",
  key: "Mi Frigyen (E)",
  bpm: 110,
  chords: "E5 – F5 – G5",
  scales: [
    { name: "Mi Frigyen", setId: "phrygian", root: 4, note: "Kökün yarım ses üstündeki Fa (b2) modun karanlık rengi: Fa'dan Mi'ye inen cümleler kur." },
    { name: "Mi minör pentatonik", setId: "minor-penta", root: 4, note: "Hızlı cümleler için." },
  ],
  tips: ["F5 akoru geldiğinde Fa notasını vurgula.", "Alternate picking ile hızlı sekanslar dene."],
  tex: song("Mi Frigyen Metal", 110, [
    { name: "Ritim Gitar", instrument: "30", staff: "tabs", bars: METAL.map(metalGtr) },
    { ...BASS, bars: METAL.map(metalBass) },
    { ...DRUMS, bars: METAL.map(() => DRUM_METAL) },
  ]),
};

// ── 7. La armonik minör (neoklasik) ──────────────────────────────────────────
const NEO = ["Am", "Dm", "E", "Am", "F", "Dm", "E", "E"];
const neoGtr = (c: string) => `:4 ${Array(4).fill(`${chord(c)}{bd}`).join(" ")}`;
const neoBass = (c: string) => `:8 ${Array(8).fill(b(bass(rootPc(c)))).join(" ")}`;
const aHarmonicNeo: Backing = {
  slug: "la-armonik-minor",
  title: "La Armonik Minör",
  style: "Neoklasik",
  key: "La minör (Am)",
  bpm: 100,
  chords: "Am – Dm – E – Am – F – Dm – E",
  scales: [
    { name: "La armonik minör", setId: "harmonic-minor", root: 9, note: "E akorunda Sol# zorunlu: armonik minör bu akorun sesidir." },
    { name: "La doğal minör", setId: "minor", root: 9, note: "Am, Dm ve F akorlarında doğal minör de kullanılabilir." },
  ],
  tips: ["E akoru boyunca Sol# – Si – Re – Fa (eksik 7'li arpej) çal.", "Sweep ve alternate picking kurslarındaki etütleri burada dene."],
  tex: song("La Armonik Minör", 100, [
    { name: "Ritim Gitar", instrument: "29", staff: "tabs", bars: NEO.map(neoGtr) },
    { ...BASS, bars: NEO.map(neoBass) },
    { ...DRUMS, bars: NEO.map(() => DRUM_ROCK) },
  ]),
};

export const BACKINGS: Backing[] = [bluesShuffle, eMinorRock, dDorianFunk, cMajorPop, aMinorBallad, ePhrygianMetal, aHarmonicNeo];
