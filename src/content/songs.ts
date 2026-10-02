// Oynatıcıyla gelen örnek şarkılar. Telifli şarkılar burada yer almaz;
// kişisel Guitar Pro arşivi `ozel-kaynak/tablar/` klasöründen okunur (bkz. README).

export type Song = {
  slug: string;
  title: string;
  artist: string;
  tex: string;
};

const POWER = { E5: "(0.6 2.5 2.4)", C5: "(3.5 5.4 5.3)", G5: "(3.6 5.5 5.4)", D5: "(5.5 7.4 7.3)" };
const pmChord = (c: string) => c.replace(/(\d+\.\d)/g, "$1{pm}");
const rhythmBar = (c: string) => `:8 ${Array(6).fill(pmChord(c)).join(" ")} ${c} ${c}`;
const BASS_ROOT = { E5: "0.4", C5: "3.3", G5: "3.4", D5: "5.3" };
const bassBar = (root: string) => `:8 ${Array(8).fill(root).join(" ")}`;
const DRUM_BAR =
  ":8 (KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed (KickHit HiHatClosed) (KickHit HiHatClosed) (SnareHit HiHatClosed) HiHatClosed";
const PROGRESSION = ["E5", "C5", "G5", "D5", "E5", "C5", "G5", "D5"] as const;

const demoRock: Song = {
  slug: "muzik-demo-rock",
  title: "Demo Rock",
  artist: "Muzik (özgün)",
  tex: [
    `\\title "Demo Rock" \\artist "Muzik" \\tempo 112 .`,
    `\\track "Lead Gitar" \\instrument 29 \\staff {tabs}`,
    [
      ":1 r", ":1 r", ":1 r", ":1 r",
      ":4 12.1 :8 15.2 12.1 :2 14.3{b (0 4)}",
      ":8 12.1 15.1 12.1 15.2 :2 12.2{v}",
      ":8 15.2 12.2 14.3 12.3 :4 14.3{b (0 4)} 12.3",
      ":4 14.4 12.4 :2 14.3{v}",
    ].join(" | "),
    `\\track "Ritim Gitar" \\instrument 30 \\staff {tabs}`,
    PROGRESSION.map((c) => rhythmBar(POWER[c])).join(" | "),
    `\\track "Bas" \\instrument 33 \\staff {tabs} \\tuning G2 D2 A1 E1`,
    PROGRESSION.map((c) => bassBar(BASS_ROOT[c])).join(" | "),
    `\\track "Davul" \\instrument percussion \\articulation defaults \\staff {score}`,
    Array(8).fill(DRUM_BAR).join(" | "),
  ].join("\n"),
};

// Greensleeves: 16. yüzyıl İngiliz halk ezgisi (kamu malı). Düzenleme özgündür.
const melodyPhrase = [
  ":2 1.2 :4 3.2",
  ":8 0.1{d} :16 1.1 :4 0.1 3.2",
  ":2 0.2 :4 0.3",
  ":8 2.3{d} :16 0.2 :4 1.2 2.3",
  ":2 2.3 :4 1.3",
  ":8 2.3{d} :16 0.2 :4 1.3 2.4",
];
const chordPhrase = ["0.5 2.4 1.2", "3.6 0.4 0.3", "0.6 2.5 0.3", "0.5 2.4 1.2", "0.6 2.5 1.3", "0.6 2.5 1.3"].map((n) => `:4 ${n}`);

const greensleeves: Song = {
  slug: "greensleeves",
  title: "Greensleeves",
  artist: "Geleneksel",
  tex: [
    `\\title "Greensleeves" \\artist "Geleneksel" \\tempo 90 .`,
    `\\track "Melodi" \\instrument 24 \\staff {score tabs}`,
    `\\ts 3 4 :2 r :4 2.3 | ${melodyPhrase.join(" | ")} | :2 2.3{d} | ${melodyPhrase.join(" | ")} | :2 2.3{d}`,
    `\\track "Eşlik" \\instrument 24 \\staff {tabs}`,
    `\\ts 3 4 :2 r :4 r | ${chordPhrase.join(" | ")} | :2 0.5{d} | ${chordPhrase.join(" | ")} | :2 0.5{d}`,
  ].join("\n"),
};

export const SONGS: Song[] = [demoRock, greensleeves];
