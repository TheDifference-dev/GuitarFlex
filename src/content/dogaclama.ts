// Doğaçlama için eşlik (backing) kayıtları: ritim gitarı, bas ve davul, alphaTex olarak üretilir.
// Her kaydın üzerinde çalınabilecek gamlar sap gezgininde (FretboardExplorer) gösterilir.
import { AKOR } from "./kurslar/diziler.ts";
import { adEn, adSes, adTr, yukari, type Ad } from "../lib/alistirma/muzik.ts";

export type BackingScale = { name: string; setId: string; root: number; note: string };
export const TURLER = ["Rock", "Blues", "Metal", "Pop", "Funk", "Groove"] as const;
export type Tur = (typeof TURLER)[number];

export type Backing = {
  slug: string;
  title: string;
  /** Doğaçlama sayfasındaki tür grubu */
  tur: Tur;
  style: string;
  key: string;
  bpm: number;
  chords: string;
  scales: BackingScale[];
  tips: string[];
  tex: string;
};

const PC: Record<string, number> = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11, Db: 1, Eb: 3, Gb: 6, Ab: 8, Bb: 10 };
const rootPc = (chord: string) => PC[chord.replace(/♭/g, "b").match(/^[A-G][#b]?/)![0]];

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
/**
 * Akor şekli ("perde.tel" listesi): açık akor varsa o, yoksa kökü 6. ya da 5. telde barre şekli.
 * E formu (kök 6. tel) ve A formu (kök 5. tel); 9'lu akorlar A formunda (C9: x 3 2 3 3 3).
 */
export function sekil(name: string): string {
  const n = name.replace(/♭/g, "b");
  if (AKOR[n]) return AKOR[n];
  const q = n.replace(/^[A-G][#b]?/, "");
  const pc = rootPc(n);
  const f6 = (pc - 4 + 12) % 12;
  let f5 = (pc - 9 + 12) % 12;
  const E: Record<string, number[]> = { "": [0, 2, 2, 1, 0, 0], m: [0, 2, 2, 0, 0, 0], "7": [0, 2, 0, 1, 0, 0], m7: [0, 2, 0, 0, 0, 0] };
  const A: Record<string, (number | null)[]> = {
    "": [0, 2, 2, 2, 0], m: [0, 2, 2, 1, 0], "7": [0, 2, 0, 2, 0], m7: [0, 2, 0, 1, 0], maj7: [0, 2, 1, 2, 0], "9": [0, -1, 0, 0, 0], m9: [0, -2, 0, 0, 0],
  };
  if (E[q] && f6 <= 7 && !(q in A && f5 > 0 && f5 < f6)) return E[q].map((d, i) => `${f6 + d}.${6 - i}`).join(" ");
  if (!A[q]) throw new Error(`Akor şekli yok: ${name}`);
  if (q === "9" || q === "m9") while (f5 < 3) f5 += 12;
  return A[q].map((d, i) => (d === null ? null : `${f5 + d}.${5 - i}`)).filter(Boolean).join(" ");
}
const chord = (name: string) => `(${sekil(name)})`;
const MUTE = (name: string) => `(${sekil(name).split(" ").map((n) => `x.${n.split(".")[1]}`).join(" ")})`;

// Davul kalıpları
const K = "KickHit", SN = "SnareHit", H = "HiHatClosed";
const D = (...xs: string[]) => (xs.length === 1 ? xs[0] : `(${xs.join(" ")})`);
const DRUM_ROCK = `:8 ${[D(K, H), D(H), D(SN, H), D(H), D(K, H), D(K, H), D(SN, H), D(H)].join(" ")}`;
const DRUM_FUNK = `:16 ${[D(K, H), H, H, D(K, H), D(SN, H), H, D(K, H), H, H, H, D(K, H), H, D(SN, H), H, H, H].join(" ")}`;
const DRUM_METAL = `:16 ${[D(K, H), K, D(K, H), K, D(SN, H), K, D(K, H), K, D(K, H), K, D(K, H), K, D(SN, H), K, D(K, H), K].join(" ")}`;
const DRUM_SHUFFLE = `:8 ${[D(K, H), "r", H, D(SN, H), "r", H, D(K, H), "r", H, D(SN, H), "r", H].map((x) => `${x}{tu 3}`).join(" ")}`;
const DRUM_68 = `:8 ${[D(K, H), H, H, D(SN, H), H, H].join(" ")}`;
// Groove: sekizlik hi-hat, 1 ve 2'nin "ve"sinde kick, 2 ve 4'te trampet
const DRUM_GROOVE = `:8 ${[D(K, H), H, D(SN, H), D(K, H), H, D(K, H), D(SN, H), H].join(" ")}`;

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
  tur: "Blues",
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
  tur: "Rock",
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
  tur: "Funk",
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
  tur: "Pop",
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
  tur: "Pop",
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
  tur: "Metal",
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
  tur: "Metal",
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


// ── Tür şablonlarından üretilen eşlikler ─────────────────────────────────────
// Akorlar tonun derecelerinden (I, bVII, iv …) doğru harf adıyla yazılır; gamlar akorların hepsiyle uyumludur.

const DERECE: Record<string, [number, number]> = { I: [0, 0], II: [1, 2], III: [2, 4], IV: [3, 5], V: [4, 7], VI: [5, 9], VII: [6, 11] };
/** "bVII:5" → kök notası ve akor adı (ör. Re tonunda "C5") */
function derece(ton: Ad, tok: string): string {
  const [rom, q] = tok.split(":");
  const flat = rom.startsWith("b");
  const [h, y] = DERECE[rom.replace(/^b/, "").toUpperCase()];
  return adEn(yukari(ton, h, y - (flat ? 1 : 0))) + q;
}
const TON: Record<string, Ad> = {
  C: { h: 0, a: 0 }, D: { h: 1, a: 0 }, E: { h: 2, a: 0 }, F: { h: 3, a: 0 }, G: { h: 4, a: 0 }, A: { h: 5, a: 0 }, B: { h: 6, a: 0 },
  "F#": { h: 3, a: 1 }, Bb: { h: 6, a: -1 }, Eb: { h: 2, a: -1 }, "C#": { h: 0, a: 1 },
};
const tonAdi = (t: Ad, minor: boolean) => `${adTr(t)} ${minor ? "minör" : "majör"} (${adEn(t)}${minor ? "m" : ""})`;
const slugAd = (t: Ad) => adTr(t).toLocaleLowerCase("tr").replace("#", "-diyez").replace("♭", "-bemol").replace("ı", "i");

type GamTanim = [string, string, number, string]; // ad eki, setId, kökten uzaklık, not
type Sablon = {
  tur: Tur;
  ad: string;
  slug: string;
  minor: boolean;
  dereceler: string[];
  tonlar: [string, number][];
  gitar: (c: string) => string;
  bas: (c: string) => string;
  davul: string;
  enstruman: string;
  gamlar: GamTanim[];
  ipuclari: string[];
};

// Gitar kalıpları
const strum = (c: string) => `:8 ${[..."D-DU-UDU"].map((x) => (x === "-" ? "r" : `${chord(c)}{${x === "D" ? "bd" : "bu"}}`)).join(" ")}`;
const powerSekiz = (c: string) => `:8 ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `${power(rootPc(c), i % 4 !== 0)}{sd}`).join(" ")}`;
/** Boogie: kök + 5'li ve kök + 6'lı ikilileri (blues-rock'ın 5–6 kalıbı) */
function boogie(c: string) {
  const pc = rootPc(c);
  const f6 = (pc - 4 + 12) % 12;
  const [f, s] = f6 <= 7 ? [f6, 6] : [(pc - 9 + 12) % 12, 5];
  const a = `(${f}.${s} ${f + 2}.${s - 1})`;
  const b6 = `(${f}.${s} ${f + 4}.${s - 1})`;
  return `:8 ${[a, a, b6, b6, a, a, b6, b6].map((x) => `${x}{sd}`).join(" ")}`;
}
/** Gallop: sekizlik + iki onaltılık, susturulmuş kök; ölçü sonunda açık power chord */
function gallop(c: string) {
  const pc = rootPc(c);
  const f6 = (pc - 4 + 12) % 12;
  const kok = f6 <= 7 ? `${f6}.6` : `${(pc - 9 + 12) % 12}.5`;
  const m = `${kok}{pm sd}`;
  const hucre = [`:8 ${m}`, `:16 ${kok}{pm sd}`, `${kok}{pm su}`];
  return [...hucre, ...hucre, ...hucre, `:8 ${power(pc)}{sd}`, `:16 ${kok}{pm sd}`, `${kok}{pm su}`].join(" ");
}
/** Groove: akor notaları sekizliklerle, pesten tize ve geri (yumuşak arpej) */
function arpejSekiz(c: string) {
  const ns = sekil(c).split(" ");
  const yol = [...ns, ...ns.slice(1, -1).reverse()];
  return `:8 ${Array.from({ length: 8 }, (_, i) => yol[i % yol.length]).join(" ")}`;
}
const funk16 = (c: string) =>
  `:16 ${[..."D-xUXxD-XxDUXxDU"]
    .map((x) => {
      if (x === "-") return "r";
      if (x === "D" || x === "U") return `${chord(c)}{${x === "D" ? "bd" : "bu"}}`;
      return `${MUTE(c)}{${x === "X" ? "bd" : "bu"}}`;
    })
    .join(" ")}`;
const shuffleAkor = (c: string) => `:8 ${[..."D-UD-UD-UD-U"].map((x) => (x === "-" ? "r{tu 3}" : `${chord(c)}{${x === "D" ? "bd" : "bu"} tu 3}`)).join(" ")}`;

// Bas kalıpları
const basSekiz = (c: string) => `:8 ${Array(8).fill(b(bass(rootPc(c)))).join(" ")}`;
const basDortluk = (c: string) => `:4 ${Array(4).fill(b(bass(rootPc(c)))).join(" ")}`;
const basOnalti = (c: string) => `:16 ${Array(16).fill(b(bass(rootPc(c)))).join(" ")}`;
function basGroove(c: string) {
  const r = bass(rootPc(c));
  const p = pitchOf(r);
  return `:4 ${[b(r), bassAt(p + 7), bassAt(p + 12), bassAt(p + 7)].join(" ")}`;
}
const basShuffle = (c: string) => shuffleBass(c);
const basFunk = (c: string) => funkBass(c);

const MAJ_PENTA: GamTanim = ["majör pentatonik", "major-penta", 0, "Majör tonun en güvenli dizisi: her akorda temiz duyulur."];
const MIN_PENTA: GamTanim = ["minör pentatonik", "minor-penta", 0, "Rock ve blues'un temel solo dizisi; kısa, güçlü cümleler için."];
const BLUES_G: GamTanim = ["blues", "blues", 0, "Minör pentatoniğe ♭5 eklenir: geçiş notası olarak kullan, üzerinde durma."];
const MIXO: GamTanim = ["Miksolidyen", "mixolydian", 0, "♭7'li majör dizi: dominant 7 ve ♭VII akorlarıyla tam uyumlu."];
const MAJOR_G: GamTanim = ["majör", "major", 0, "Tonun bütün notaları: melodik, şarkı gibi cümleler kur."];
const MINOR_G: GamTanim = ["doğal minör", "minor", 0, "♭VI ve ♭VII akorlarının notalarını da içerir; melodik minör cümleler için."];
const DORIAN_G: GamTanim = ["Dorian", "dorian", 0, "Minör 7 akoruna majör 6'lı rengi katar; funk ve groove'un minör dizisi."];
const PHRYG_G: GamTanim = ["Frigyen", "phrygian", 0, "Kökün yarım ses üstündeki ♭2 modun karanlık rengi."];
const HARM_G: GamTanim = ["armonik minör", "harmonic-minor", 0, "V akoru majör olduğunda (ör. E7) 7. derece yarım ses tizleşir."];

const SABLONLAR: Sablon[] = [
  // Rock (16)
  { tur: "Rock", ad: "Klasik Rock", slug: "klasik-rock", minor: false, dereceler: ["I:5", "I:5", "IV:5", "IV:5", "V:5", "IV:5", "I:5", "V:5"], tonlar: [["A", 120], ["E", 112], ["D", 116], ["G", 124]], gitar: powerSekiz, bas: basSekiz, davul: DRUM_ROCK, enstruman: "30", gamlar: [MAJ_PENTA, MIN_PENTA, MAJOR_G], ipuclari: ["I–IV–V: her akorun kökünü cümle sonunda hedefle.", "Majör ve minör pentatoniği karıştırmak klasik rock rengini verir."] },
  { tur: "Rock", ad: "Miksolidyen Rock", slug: "miksolidyen-rock", minor: false, dereceler: ["I:", "I:", "bVII:", "IV:", "I:", "I:", "bVII:", "IV:"], tonlar: [["D", 104], ["A", 108], ["E", 100], ["G", 110]], gitar: strum, bas: basSekiz, davul: DRUM_ROCK, enstruman: "29", gamlar: [MIXO, MAJ_PENTA, MIN_PENTA], ipuclari: ["♭VII akorunda Miksolidyen'in ♭7 notasını vurgula.", "Açık tellerle çalınan akor şekillerinde boş teli de solona kat."] },
  { tur: "Rock", ad: "Minör Rock", slug: "minor-rock", minor: true, dereceler: ["i:m", "i:m", "bVI:", "bVII:", "i:m", "i:m", "bVI:", "bVII:"], tonlar: [["A", 96], ["D", 100], ["B", 92], ["F#", 98]], gitar: strum, bas: basSekiz, davul: DRUM_ROCK, enstruman: "29", gamlar: [MINOR_G, MIN_PENTA], ipuclari: ["♭VI akorunda doğal minörün ♭6 notası çok iyi oturur.", "Uzun notalara vibrato ekle."] },
  { tur: "Rock", ad: "Hard Rock Riff", slug: "hard-rock", minor: true, dereceler: ["i:5", "bVII:5", "bVI:5", "bVII:5", "i:5", "bVII:5", "bVI:5", "bVII:5"], tonlar: [["E", 126], ["G", 120], ["C", 116], ["A", 130]], gitar: powerSekiz, bas: basSekiz, davul: DRUM_ROCK, enstruman: "30", gamlar: [MIN_PENTA, MINOR_G, BLUES_G], ipuclari: ["Power chord ritminin sekizlik nabzını solona taşı.", "Bend'leri akorun köküne ya da 5'lisine çöz."] },
  // Blues (11)
  { tur: "Blues", ad: "Blues Shuffle", slug: "blues-shuffle", minor: false, dereceler: ["I:7", "I:7", "I:7", "I:7", "IV:7", "IV:7", "I:7", "I:7", "V:7", "IV:7", "I:7", "V:7"], tonlar: [["E", 96], ["G", 88], ["C", 84], ["D", 92], ["Bb", 86]], gitar: shuffleAkor, bas: basShuffle, davul: DRUM_SHUFFLE, enstruman: "27", gamlar: [MIN_PENTA, BLUES_G, MIXO], ipuclari: ["12 ölçüyü say: 5. ölçüde IV, 9. ölçüde V akoru gelir.", "Shuffle hissini solona da taşı: sekizlikleri uzun-kısa çal."] },
  { tur: "Blues", ad: "Minör Blues", slug: "minor-blues", minor: true, dereceler: ["i:m7", "i:m7", "i:m7", "i:m7", "iv:m7", "iv:m7", "i:m7", "i:m7", "V:7", "iv:m7", "i:m7", "V:7"], tonlar: [["A", 72], ["E", 76], ["D", 70]], gitar: shuffleAkor, bas: basShuffle, davul: DRUM_SHUFFLE, enstruman: "27", gamlar: [MIN_PENTA, BLUES_G, HARM_G], ipuclari: ["V7 akorunda armonik minörün 7. derecesi (yeden) köke çözülmek ister.", "Yavaş tempoda az nota, uzun bend ve vibrato."] },
  { tur: "Blues", ad: "Blues Rock Boogie", slug: "blues-rock", minor: false, dereceler: ["I:7", "IV:7", "I:7", "I:7", "IV:7", "IV:7", "I:7", "I:7", "V:7", "IV:7", "I:7", "V:7"], tonlar: [["A", 132], ["E", 128], ["G", 124]], gitar: boogie, bas: basSekiz, davul: DRUM_ROCK, enstruman: "29", gamlar: [MIN_PENTA, BLUES_G, MAJ_PENTA], ipuclari: ["2. ölçüde IV'e erken geçiş (quick change) var: kulağınla takip et.", "Boogie ritmi düz sekizlik: cümlelerini de düz çal."] },
  // Metal (4)
  { tur: "Metal", ad: "Frigyen Gallop", slug: "frigyen-gallop", minor: true, dereceler: ["i:5", "i:5", "bII:5", "i:5", "i:5", "i:5", "bIII:5", "bII:5"], tonlar: [["A", 150], ["D", 140]], gitar: gallop, bas: basOnalti, davul: DRUM_METAL, enstruman: "30", gamlar: [PHRYG_G, MIN_PENTA], ipuclari: ["♭II akoru geldiğinde ♭2 notasını vurgula, sonra köke in.", "Alternate picking ile hızlı sekanslar dene."] },
  { tur: "Metal", ad: "Thrash Riff", slug: "thrash", minor: true, dereceler: ["i:5", "i:5", "bVI:5", "bVII:5", "i:5", "i:5", "bVI:5", "V:5"], tonlar: [["E", 160], ["B", 150]], gitar: gallop, bas: basOnalti, davul: DRUM_METAL, enstruman: "30", gamlar: [MINOR_G, HARM_G, MIN_PENTA], ipuclari: ["Son ölçüdeki V5 akorunda armonik minörün yedenine geç.", "Hızlı cümleleri kısa motiflerle böl."] },
  // Pop (4)
  { tur: "Pop", ad: "Pop I–V–vi–IV", slug: "pop", minor: false, dereceler: ["I:", "V:", "vi:m", "IV:", "I:", "V:", "vi:m", "IV:"], tonlar: [["G", 92], ["D", 96], ["A", 88]], gitar: strum, bas: basDortluk, davul: DRUM_ROCK, enstruman: "25", gamlar: [MAJ_PENTA, MAJOR_G], ipuclari: ["Kısa bir melodi bul ve her akorda tekrar et.", "vi akorunda göreceli minörün köküne inmek hüzünlü bir renk verir."] },
  { tur: "Pop", ad: "Minör Pop vi–IV–I–V", slug: "minor-pop", minor: false, dereceler: ["vi:m", "IV:", "I:", "V:", "vi:m", "IV:", "I:", "V:"], tonlar: [["G", 84]], gitar: strum, bas: basDortluk, davul: DRUM_ROCK, enstruman: "25", gamlar: [MAJ_PENTA, MAJOR_G], ipuclari: ["Aynı dört akor, minör akordan başlayınca daha karanlık duyulur.", "Göreceli minör pentatonik (tonun 6. derecesinden) aynı notaları verir."] },
  // Funk (6)
  { tur: "Funk", ad: "Dominant 9 Funk", slug: "dominant-funk", minor: false, dereceler: ["I:9", "I:9", "I:9", "I:9", "IV:9", "IV:9", "I:9", "I:9"], tonlar: [["E", 100], ["A", 96], ["D", 104]], gitar: funk16, bas: basFunk, davul: DRUM_FUNK, enstruman: "27", gamlar: [MIXO, MIN_PENTA, BLUES_G], ipuclari: ["Funk'ta az nota, çok ritim: kısa ve kesik cümleler kur.", "Miksolidyen'in 3'lüsü ile minör pentatoniğin ♭3'ü arasında oyna."] },
  { tur: "Funk", ad: "Minör Funk", slug: "minor-funk", minor: true, dereceler: ["i:m7", "i:m7", "IV:9", "IV:9", "i:m7", "i:m7", "IV:9", "IV:9"], tonlar: [["A", 98], ["E", 102], ["G", 94]], gitar: funk16, bas: basFunk, davul: DRUM_FUNK, enstruman: "27", gamlar: [DORIAN_G, MIN_PENTA], ipuclari: ["IV9 akorunun 3'lüsü Dorian'ın majör 6'lısıdır: geçişte bu notayı vurgula.", "16'lık ritmi kafanda say; susları da çal."] },
  // Groove (8)
  { tur: "Groove", ad: "Neo-Soul ii–V–I", slug: "neo-soul", minor: false, dereceler: ["ii:m7", "V:7", "I:maj7", "I:maj7", "ii:m7", "V:7", "I:maj7", "I:maj7"], tonlar: [["C", 82], ["F", 78], ["Bb", 80], ["G", 84]], gitar: arpejSekiz, bas: basGroove, davul: DRUM_GROOVE, enstruman: "26", gamlar: [MAJOR_G, MAJ_PENTA], ipuclari: ["Her akorun 3'lüsünü ve 7'lisini hedefle: armoniyi en iyi bu notalar anlatır.", "Arka vuruşa yaslanarak (geride) çal."] },
  { tur: "Groove", ad: "Majör 7 Groove", slug: "maj7-groove", minor: false, dereceler: ["I:maj7", "I:maj7", "IV:maj7", "IV:maj7", "I:maj7", "I:maj7", "IV:maj7", "IV:maj7"], tonlar: [["D", 88], ["A", 90]], gitar: arpejSekiz, bas: basGroove, davul: DRUM_GROOVE, enstruman: "26", gamlar: [MAJOR_G, MAJ_PENTA], ipuclari: ["IVmaj7 üzerinde tonun 4. derecesi akorun köküdür; majör 7'lisi tonun 3'lüsüdür.", "Kısa motiflerle soru-cevap cümleleri kur."] },
  { tur: "Groove", ad: "Minör Groove", slug: "minor-groove", minor: true, dereceler: ["i:m7", "i:m7", "bVI:maj7", "bVII:", "i:m7", "i:m7", "bVI:maj7", "bVII:"], tonlar: [["A", 86], ["E", 90]], gitar: arpejSekiz, bas: basGroove, davul: DRUM_GROOVE, enstruman: "26", gamlar: [MINOR_G, MIN_PENTA], ipuclari: ["♭VImaj7 akorunda doğal minörün ♭6 notası öne çıkar.", "Pentatonik cümlelere ♭6 ve 2 ekleyerek doğal minöre geç."] },
];

function uret(sb: Sablon, tonAd: string, bpm: number): Backing {
  const ton = TON[tonAd];
  const akorlar = sb.dereceler.map((d) => derece(ton, d));
  const baslik = `${adTr(ton)} ${sb.ad}`;
  const sira = [...new Set(akorlar)];
  return {
    slug: `${slugAd(ton)}-${sb.slug}`,
    tur: sb.tur,
    title: baslik,
    style: sb.tur,
    key: tonAdi(ton, sb.minor),
    bpm,
    chords: `${sira.join(" – ")} (${[...new Set(sb.dereceler.map((d) => d.split(":")[0]))].join(" – ")})`,
    scales: sb.gamlar.map(([ad, setId, uz, not]) => ({ name: `${adTr(ton)} ${ad}`, setId, root: (adSes(ton) + uz) % 12, note: not })),
    tips: sb.ipuclari,
    tex: song(baslik, bpm, [
      { name: "Ritim Gitar", instrument: sb.enstruman, staff: "tabs", bars: akorlar.map(sb.gitar) },
      { ...BASS, bars: akorlar.map(sb.bas) },
      { ...DRUMS, bars: akorlar.map(() => sb.davul) },
    ]),
  };
}

const URETILEN: Backing[] = SABLONLAR.flatMap((sb) => sb.tonlar.map(([t, bpm]) => uret(sb, t, bpm)));

export const BACKINGS: Backing[] = [bluesShuffle, eMinorRock, dDorianFunk, cMajorPop, aMinorBallad, ePhrygianMetal, aHarmonicNeo, ...URETILEN];
