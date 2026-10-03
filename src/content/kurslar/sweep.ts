// Sweep Picking — 5 bölüm, özgün egzersizler. Arpej şekilleri akor tonlarından hesaplanır.
import type { Course } from "../types.ts";
import { tex } from "../tex.ts";
import { TRIAD, arpShape, measures, noteList, sweepCycle, sweepMarks, type Pos } from "../dizi.ts";
import { chapter, ders, section } from "./ortak.ts";

const P = "sw";
type Q = keyof typeof TRIAD;
// Kök notalar (en pes oktav): Mi=40 … Sol#=44
const ROOT: Record<string, number> = { E: 40, F: 41, G: 43, "G#": 44, A: 45, B: 47, C: 48, D: 50 };

/** Akor adı ("Am", "F", "G#dim") → kök ve tür */
function chord(name: string): [number, Q] {
  const m = name.match(/^([A-G]#?)(m|dim)?$/)!;
  return [ROOT[m[1]], m[2] === "m" ? "minor" : m[2] === "dim" ? "dim" : "major"];
}

const shape3 = (name: string, start: number) => { const [r, q] = chord(name); return arpShape(r, TRIAD[q], start, [1, 1, 1], 3); };
const shape4 = (name: string, start: number) => { const [r, q] = chord(name); return arpShape(r, TRIAD[q], start, [1, 1, 1, 1], 4); };
const shape5 = (name: string, start: number) => { const [r, q] = chord(name); return arpShape(r, TRIAD[q], start, [2, 1, 1, 1, 2], 5); };
const shape6 = (name: string, start: number) => { const [r, q] = chord(name); return arpShape(r, TRIAD[q], start, [1, 1, 1, 1, 1, 2], 6); };

/** Her akor için döngüyü `reps` kez tekrarlar, pena işaretlerini tüm diziye uygular. */
const seq = (shapes: Pos[][], reps: number) => sweepMarks(shapes.flatMap((s) => Array.from({ length: reps }, () => sweepCycle(s)).flat()));
const names = (shapes: Pos[][]) => shapes.map((s) => noteList(s.map((p) => p.m))).join(" · ");

const r16 = (bpm: number, notes: string[]) => tex(bpm, measures(":16", notes, 16));
const r8 = (bpm: number, notes: string[]) => tex(bpm, measures(":8", notes, 8));
const rt = (bpm: number, notes: string[]) => tex(bpm, measures(":8", notes, 12, 3));
const rx = (bpm: number, notes: string[]) => tex(bpm, measures(":16", notes, 24, 3));

/** Üç ders: yavaş, asıl ritim, hedef tempo */
function trio(shapes: Pos[][], kind: "3" | "4" | "5", desc: string, tips: string[]) {
  if (kind === "3") {
    return [
      ders("Sekizlik", 60, r8(60, seq(shapes, 2)), `${desc} Sekizlik notalarla, akor başına bir ölçü.`, tips),
      ders("On Altılık", 50, r16(50, seq(shapes, 4)), `${desc} On altılıklarla: her vuruşta bir döngü.`, tips),
      ders("Hedef Tempo", 70, r16(70, seq(shapes, 4)), `${desc} Hedef tempoda.`, tips, [], 2),
    ];
  }
  const reps = kind === "4" ? 2 : 1;
  return [
    ders("Triole", 50, rt(50, seq(shapes, reps)), `${desc} Triole ile, akor başına bir ölçü.`, tips),
    ders("Triole – Hızlı", 70, rt(70, seq(shapes, reps)), `${desc} Aynı ritim daha hızlı.`, tips),
    ders("Altılık", 50, rx(50, seq(shapes, reps * 2)), `${desc} Altılık (on altılık triole) ile.`, tips, [], 2),
  ];
}

// ── Bölüm 1: Üç Tel ──────────────────────────────────────────────────────────
const minor3 = [shape3("Am", 69), shape3("Dm", 62), shape3("Em", 64), shape3("Am", 69)];
const major3 = [shape3("A", 69), shape3("D", 62), shape3("E", 64), shape3("A", 69)];
const prog3 = [shape3("Am", 69), shape3("F", 65), shape3("G", 67), shape3("E", 68)];
const dim3 = [shape3("Am", 69), shape3("G#dim", 68), shape3("Am", 69), shape3("E", 68)];
const tips3 = ["Pena tellere vurmaz, bir sonraki tele 'düşer'.", "Her notayı çaldıktan hemen sonra parmağı kaldır; notalar akor gibi birbirine karışmasın."];

const s1 = section(1, "Üç Tel", [
  chapter(P, 1, 0, "Minör Üçlüler", [
    "Üçlü (triad) akor üç notadan oluşur: kök, üçlü ve beşli. Minör üçlüde kök ile üçlü arası 3 yarım ses (küçük üçlü).",
    `Akorların notaları: ${names(minor3)}.`,
  ], trio(minor3, "3", "Am – Dm – Em – Am, üç telde.", tips3)),
  chapter(P, 1, 1, "Majör Üçlüler", [
    "Majör üçlüde kök ile üçlü arası 4 yarım ses (büyük üçlü). Minörden tek farkı ortadaki notanın yarım ses tiz olması.",
    `Akorların notaları: ${names(major3)}.`,
    "A – D – E: La majörün I – IV – V akorları.",
  ], trio(major3, "3", "A – D – E – A, üç telde.", [...tips3, "Majör şekilde iki nota aynı perdede: parmağı yuvarlayarak sırayla bas."])),
  chapter(P, 1, 2, "Akor Dizisi", [
    "Am – F – G – E: La minörde i – VI – VII – V. E akorundaki Sol#, La'ya yarım sesle çeker.",
    `Akorların notaları: ${names(prog3)}.`,
  ], trio(prog3, "3", "Am – F – G – E, üç telde.", tips3)),
  chapter(P, 1, 3, "Eksik (dim) Üçlü", [
    "Eksik (diminished) üçlü iki küçük üçlünün üst üste binmesidir: kök – b3 – b5.",
    "Sol#dim, La armonik minörün 7. derecesinde kurulur ve E akoru gibi La'ya çözülür.",
    `Akorların notaları: ${names(dim3)}.`,
  ], trio(dim3, "3", "Am – G#dim – Am – E.", tips3)),
]);

// ── Bölüm 2: Dört Tel ────────────────────────────────────────────────────────
const minor4 = [shape4("Am", 64), shape4("Dm", 57), shape4("Em", 59), shape4("Am", 64)];
const major4 = [shape4("C", 55), shape4("G", 62), shape4("F", 60), shape4("C", 55)];
const pop4 = [shape4("Am", 64), shape4("F", 60), shape4("C", 55), shape4("G", 62)];
const tips4 = ["Dört telde sweep: aşağı yönde dört tel, yukarı yönde dört tel.", "Sol el 'rulo' yapar: aynı perdedeki notalarda parmak yuvarlanarak sırayla basar."];

const s2 = section(2, "Dört Tel", [
  chapter(P, 2, 0, "Minör", ["Dört telli şekilde akorun bir notası iki kez (oktavıyla) çalınır.", `Notalar: ${names(minor4)}.`], trio(minor4, "4", "Am – Dm – Em – Am, dört telde.", tips4)),
  chapter(P, 2, 1, "Majör", ["C – G – F: Do majörün I – V – IV akorları.", `Notalar: ${names(major4)}.`], trio(major4, "4", "C – G – F – C, dört telde.", tips4)),
  chapter(P, 2, 2, "Pop Dizisi", [
    "Am – F – C – G (vi – IV – I – V): pop müziğin en çok kullanılan akor dizilerinden biri. Aynı dört akor Do majör ve La minörde ortaktır.",
    `Notalar: ${names(pop4)}.`,
  ], trio(pop4, "4", "Am – F – C – G, dört telde.", tips4)),
]);

// ── Bölüm 3: Beş Tel ─────────────────────────────────────────────────────────
const minor5 = [shape5("Am", 57), shape5("Dm", 50), shape5("Em", 52), shape5("Am", 57)];
const major5 = [shape5("C", 48), shape5("G", 55), shape5("F", 53), shape5("C", 48)];
const andalus5 = [shape5("Am", 57), shape5("G", 55), shape5("F", 53), shape5("E", 52)];
const tips5 = [
  "5. telde iki nota: pena + hammer-on; 1. telde tepe notası hammer-on, dönüşte pull-off.",
  "Önce metronomsuz, sadece temizliğe odaklan. Hız temizlikten sonra gelir.",
];

const s3 = section(3, "Beş Tel", [
  chapter(P, 3, 0, "Minör", [
    "Beş telli şekil akoru iki oktava yayar: kök 5. telde, aynı nota 3. telde ve 1. telin tepesinde.",
    `Notalar: ${names(minor5)}.`,
  ], trio(minor5, "5", "Am – Dm – Em – Am, beş telde.", tips5)),
  chapter(P, 3, 1, "Majör", ["Majör beş telli şekilde 4-3-2. teller genellikle aynı perdededir: parmak yuvarlama burada önemli.", `Notalar: ${names(major5)}.`], trio(major5, "5", "C – G – F – C, beş telde.", tips5)),
  chapter(P, 3, 2, "Endülüs Kadansı", [
    "Am – G – F – E: bas La–Sol–Fa–Mi diye iner. Flamenkodan rock'a pek çok müzikte kullanılır.",
    `Notalar: ${names(andalus5)}.`,
  ], trio(andalus5, "5", "Am – G – F – E, beş telde.", tips5)),
]);

// ── Bölüm 4: Altı Tel ve Tapping ─────────────────────────────────────────────
const six = [shape6("Em", 52), shape6("C", 48), shape6("D", 50), shape6("Em", 52)];
/** Tepe notasını sağ elle tap'le: 1. teldeki ikinci nota hammer-on yerine tap olur. */
const tapSeq = (shapes: Pos[][], reps: number) => {
  const raw = seq(shapes, reps);
  return raw.map((n, i) => {
    if (/\.1\{sd h\}$/.test(n) && /\.1\{h\}$/.test(raw[i + 1] ?? "")) return n.replace("{sd h}", "{sd}");
    if (/\.1\{h\}$/.test(n) && /\.1\{sd h\}$/.test(raw[i - 1] ?? "")) return n.replace("{h}", "{tt h}");
    return n;
  });
};

const s4 = section(4, "Altı Tel ve Tapping", [
  chapter(P, 4, 0, "Altı Telli Şekiller", [
    "Altı telli şekilde kök en kalın telde. Em – C – D: Mi minörün i – VI – VII akorları.",
    `Notalar: ${names(six)}.`,
  ], trio(six, "5", "Em – C – D – Em, altı telde.", ["6. telden 1. tele tek pena hareketi; bilek değil, kol iner.", "Dönüşte 6. tele inerken pena yukarı yönde süpürmeye devam eder."])),
  chapter(P, 4, 1, "Sweep ve Tap", [
    "Tepe notasını sağ elle tap'lemek arpeji bir oktav daha genişletmeden hızlandırır; sweep ile tapping'in birleşimi.",
  ], [
    ders("Tap'li Am", 50, rt(50, tapSeq([shape5("Am", 57), shape5("Am", 57)], 1)), "Beş telli Am; tepe notası sağ elle.", ["Tap yapan parmak teli hafifçe aşağı çekerek bırakır (pull-off).", "Pena tap sırasında tellerin üzerinde bekler."]),
    ders("Tap'li Endülüs", 50, rt(50, tapSeq(andalus5, 1)), "Am – G – F – E, tepe notaları tap ile.", "Sağ el tap için pozisyon değiştirirken pena tutuşunu bozma."),
    ders("Tap'li – Altılık", 50, rx(50, tapSeq(andalus5, 2)), "Aynı dizi altılık ritimde.", "Hedef: tap ile pena notası arasında ses farkı olmasın.", [], 2),
  ]),
  chapter(P, 4, 2, "Şekil Değiştirme", [
    "Gerçek sololarda arpej şekilleri sürekli değişir. Üç, dört ve beş telli şekilleri aynı akor dizisinde karıştırmak, sapın her yerinde aynı akoru görmeyi öğretir.",
  ], [
    ders("3 ve 5 Tel", 50, tex(50, [...measures(":16", seq([shape3("Am", 69)], 4), 16), ...measures(":8", seq([shape5("Am", 57)], 1), 12, 3), ...measures(":16", seq([shape3("E", 68)], 4), 16), ...measures(":8", seq([shape5("E", 52)], 1), 12, 3)]), "Am ve E'yi önce üç sonra beş telde çal.", "Ritim değişiyor: on altılık → triole."),
    ders("4 ve 5 Tel", 50, rt(50, [...seq([shape4("Am", 64)], 2), ...seq([shape5("Am", 57)], 1), ...seq([shape4("F", 60)], 2), ...seq([shape5("F", 53)], 1)]), "Am ve F'yi dört ve beş telde.", "Aynı akorun iki şekli: biri tiz, biri geniş."),
    ders("Hepsi Bir Arada", 50, rt(50, [...seq([shape4("Am", 64)], 2), ...seq([shape5("G", 55)], 1), ...seq([shape5("F", 53)], 1), ...seq([shape6("Em", 52)], 1)]), "Am – G – F – Em: her akor başka bir şekilde.", "Şekil değişirken el pozisyonunu önceden gör.", [], 2),
  ]),
]);

// ── Bölüm 5: Etütler ─────────────────────────────────────────────────────────
const neo = [shape5("Am", 57), shape5("Dm", 50), shape5("E", 52), shape5("Am", 57), shape5("F", 53), shape5("Dm", 50), shape5("E", 52), shape5("Am", 57)];
const pop = [shape4("C", 55), shape4("G", 62), shape4("Am", 64), shape4("F", 60), shape5("C", 48), shape5("G", 55), shape5("Am", 57), shape5("F", 53)];
const s5 = section(5, "Etütler", [
  chapter(P, 5, 0, "Neoklasik Etüt", [
    "Am – Dm – E – Am – F – Dm – E – Am: armonik minörün kadansları. E akoru (V) her seferinde Am'ye (i) çözülür.",
  ], [
    ders("Triole", 50, rt(50, seq(neo, 1)), "Sekiz akorluk etüt, triole.", "Akor değişiminde ritim kopmasın.", [], 2),
    ders("Altılık", 50, rx(50, seq(neo, 2)), "Altılık ritimle.", "Her vuruşa yarım döngü düşer.", [], 3),
    ders("Hedef Tempo", 70, rx(70, seq(neo, 2)), "Etüt hedef tempoda.", "Zorlandığın akoru döngüye al.", [], 3),
  ]),
  chapter(P, 5, 1, "Pop Etüdü", [
    "C – G – Am – F (I – V – vi – IV): sayısız pop şarkısının akor dizisi. Önce dört telde, sonra beş telde.",
  ], [
    ders("Triole", 50, rt(50, [...seq(pop.slice(0, 4), 2), ...seq(pop.slice(4), 1)]), "Önce dört, sonra beş telli şekiller.", "Dört telli şekillerde akor başına iki döngü.", [], 2),
    ders("Altılık", 50, rx(50, [...seq(pop.slice(0, 4), 4), ...seq(pop.slice(4), 2)]), "Altılık ritimle.", "Şekil değişimini dinle: ses genişliyor.", [], 3),
    ders("Hedef Tempo", 70, rx(70, [...seq(pop.slice(0, 4), 4), ...seq(pop.slice(4), 2)]), "Hedef tempoda.", "Bunu temiz çalabiliyorsan sweep'in temellerine hakimsin.", [], 3),
  ]),
]);

export const sweepCourse: Course = {
  slug: "sweep",
  title: "Sweep Picking",
  description: "Tek pena hareketiyle tellerin üzerinden hızlı arpejler.",
  kind: "technique",
  icon: "≋",
  guide: [
    "## Sweep picking nedir?",
    "Arpejin notaları farklı tellerdeyken pena her teli ayrı ayrı vurmaz: tek bir aşağı (ya da yukarı) hareketle tellerin üzerinden 'süpürür'. Sol el ise her notayı sırayla basıp kaldırır, böylece notalar akor gibi değil tek tek duyulur.",
    "## Nasıl çalışılır?",
    "Sweep'in zorluğu sağ elde değil, iki elin uyumundadır. Yavaş çalışırken her notanın ayrı duyulduğundan emin ol; notalar birbirine karışıyorsa sol el parmakları yeterince erken kalkmıyordur.",
    "## Kurs planı",
    "Bölüm 1 – Üç tel: minör, majör ve eksik üçlüler.",
    "Bölüm 2 – Dört tel.",
    "Bölüm 3 – Beş tel.",
    "Bölüm 4 – Altı tel, tapping ve şekil değiştirme.",
    "Bölüm 5 – Etütler.",
  ],
  sections: [s1, s2, s3, s4, s5],
};
