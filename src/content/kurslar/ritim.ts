// Ritim & Strumming — 5 bölüm, özgün egzersizler.
import type { Course } from "../types.ts";
import { tex } from "../tex.ts";
import { AKOR, akorNotalari } from "./diziler.ts";
import { chapter, ders, section } from "./ortak.ts";

const P = "rt";
const MUTE = "(x.6 x.5 x.4 x.3 x.2 x.1)";

/**
 * Ritim ızgarası. Karakterler (her biri bir ızgara birimi):
 *   D / U = akoru aşağı / yukarı tara, X / x = susturulmuş aşağı / yukarı tarama,
 *   B = akorun bas notası, A = alternatif bas (bir ince tel), - = boş (el salınmaya devam eder)
 */
function grid(name: string, pattern: string, duration: ":8" | ":16" | ":4", tuplet?: number): string {
  const notes = AKOR[name].split(" ");
  const c = `(${AKOR[name]})`;
  const bassString = Number(notes[0].split(".")[1]);
  const alt = notes.find((n) => Number(n.split(".")[1]) === bassString - 1) ?? notes[1];
  const tu = (x: string) => (tuplet ? (x.endsWith("}") ? `${x.slice(0, -1)} tu ${tuplet}}` : `${x}{tu ${tuplet}}`) : x);
  const tokens = [...pattern].map((ch) => {
    switch (ch) {
      case "D": return tu(`${c}{bd}`);
      case "U": return tu(`${c}{bu}`);
      case "X": return tu(`${MUTE}{bd}`);
      case "x": return tu(`${MUTE}{bu}`);
      case "B": return tu(notes[0]);
      case "A": return tu(alt);
      default: return tu("r");
    }
  });
  return `${duration} ${tokens.join(" ")}`;
}
/** Akordaki her notaya vurgu (aksan) ekler */
const acc = (tok: string) => tok.replace(/\(([^)]*)\)/, (_, inner: string) => `(${inner.split(" ").map((n) => `${n}{ac}`).join(" ")})`);
/** Ölçüdeki belirli sıradaki (1'den başlayarak) vuruşlara vurgu */
const accentAt = (bar: string, which: (i: number) => boolean) => bar.split(" ").map((t, i) => (i > 0 && which(i) ? acc(t) : t)).join(" ");
const play = (bpm: number, chords: string[], pattern: string, duration: ":8" | ":16" | ":4" = ":8", ts = "") =>
  tex(bpm, chords.map((c, i) => `${i === 0 && ts ? `\\ts ${ts} ` : ""}${grid(c, pattern, duration)}`));
const notes = (chords: string[]) => [...new Set(chords)].map((c) => `${c}: ${akorNotalari(c)}`).join(" · ");
const SWING = (bpm: number, chords: string[], pattern: string) => tex(bpm, chords.map((c) => grid(c, pattern, ":8", 3)));

const POP = ["G", "D", "Em", "C"];
const MINOR = ["Am", "F", "C", "G"];

// ── Bölüm 1: Temel Tarama ────────────────────────────────────────────────────
const s1 = section(1, "Temel Tarama", [
  chapter(P, 1, 0, "Dörtlük Tarama", [
    "Ritim, zamanın eşit vuruşlara bölünmesidir. 4/4 ölçüde her ölçüde dört vuruş vardır: '1 – 2 – 3 – 4'.",
    "Tarama eli bir saat sarkacı gibidir: hep aynı hızda salınır, sadece tellere ne zaman değeceği değişir.",
  ], [
    ders("Aşağı Dörtlükler", 60, play(60, POP, "DDDD", ":4"), "Her vuruşta aşağı tarama.", ["Bilek gevşek, hareket bilekten.", "Pena tellerin üzerinden 'fırça' gibi geçsin."], `Notalar: ${notes(POP)}.`),
    ders("Vurgulu Dörtlükler", 70, tex(70, POP.map((c) => accentAt(grid(c, "DDDD", ":4"), (i) => i === 1))), "Her ölçünün ilk vuruşunu vurgula.", "Vurgu ölçünün başını kulağa belli eder."),
    ders("2 ve 4", 70, tex(70, POP.map((c) => accentAt(grid(c, "DDDD", ":4"), (i) => i === 2 || i === 4))), "2. ve 4. vuruşlar vurgulu: 'backbeat'.", "Rock ve pop'ta trampet bu vuruşlara düşer.", "Backbeat: ölçünün zayıf vuruşlarının (2 ve 4) vurgulanması. Modern popüler müziğin ritmik temeli.", 2),
  ]),
  chapter(P, 1, 1, "Sekizlik Tarama", ["Sekizlikte her vuruş ikiye bölünür: '1 ve 2 ve 3 ve 4 ve'. Sayılar aşağı, 've'ler yukarı."], [
    ders("Aşağı-Yukarı", 60, play(60, POP, "DUDUDUDU"), "Sürekli sekizlik tarama.", "Yukarı tarama sadece ince 3-4 teli çalsa yeterli."),
    ders("Aşağı Vurgulu", 70, tex(70, POP.map((c) => accentAt(grid(c, "DUDUDUDU", ":8"), (i) => i % 2 === 1))), "Aşağı vuruşlar vurgulu, yukarılar hafif.", "Bu, taramaya 'nefes' veren dinamiktir."),
    ders("Minör Dizi", 70, play(70, MINOR, "DUDUDUDU"), "Am – F – C – G sekizlik tarama.", "F'de barre zorlarsa sadece ince dört teli çal.", `Notalar: ${notes(MINOR)}.`, 2),
  ]),
  chapter(P, 1, 2, "Boşluklu Kalıplar", ["Boşluk (tarama yapılmayan yer) ritmi ilginç kılar. El boşlukta da salınır; böylece her vuruş doğru yöne düşer."], [
    ders("D-DU-UDU", 70, play(70, POP, "D-DU-UDU"), "Pop'un en çok kullanılan tarama kalıbı.", "3. vuruştaki aşağı vuruş boş: el havada geçer.", "Bu kalıpta vurgu 've'lere kayar (senkop); ritim ileri itilir."),
    ders("D-D-DUDU", 70, play(70, POP, "D-D-DUDU"), "İlk yarı dörtlük, ikinci yarı sekizlik.", "Ritmik hızlanma hissi verir."),
    ders("DU-UDU-U", 80, play(80, MINOR, "DU-UDU-U"), "Senkoplu, akıcı bir kalıp.", "Boşluklardan sonra gelen yukarı vuruşları net çal.", "", 2),
  ]),
]);

// ── Bölüm 2: On Altılık ──────────────────────────────────────────────────────
const s2 = section(2, "On Altılık", [
  chapter(P, 2, 0, "On Altılık Izgara", ["On altılıkta her vuruş dörde bölünür: '1 e ve a'. El iki kat hızlı salınır; aşağı vuruşlar '1' ve 've'ye, yukarılar 'e' ve 'a'ya düşer."], [
    ders("Sürekli", 60, play(60, ["Em7", "A7"].flatMap((c) => [c, c]), "DUDUDUDUDUDUDUDU", ":16"), "Sürekli on altılık.", "Hareket küçük, sadece ince teller.", `Notalar: ${notes(["Em7", "A7"])}.`),
    ders("Vuruşlar", 60, play(60, ["Em7", "Em7", "A7", "A7"], "D-D-D-D-D-D-D-D-", ":16"), "Sadece sekizlik yerler; el on altılık salınır.", "Boşluklarda yukarı hareket havada."),
    ders("Karışık", 70, play(70, ["Em7", "Em7", "A7", "A7"], "D-DUD-DU-UD-DUDU", ":16"), "Sekizlik ve on altılık karışık kalıp.", "Önce kalıbı sayarak yavaş çal.", "", 2),
  ]),
  chapter(P, 2, 1, "Funk Ritmi", ["Funk'ta akorlar kısa ve 'kuru' çalınır, araya susturulmuş vuruşlar (x) girer. E9 akoru funk'ın klasik sesidir: Mi–Sol#–Re–Fa# (kök, üçlü, yedili, dokuzlu)."], [
    ders("Susturulmuş Izgara", 70, play(70, ["E9", "E9", "E9", "E9"], "XxXxDxXxXxDxXxXx", ":16"), "Susturulmuş on altılıklar arasında iki akor vuruşu.", "Sol el akoru basıp hafifçe gevşeterek susturur."),
    ders("Funk Kalıbı", 80, play(80, ["E9", "E9", "E9", "E9"], "D-xUXxD-XxDUXxDU", ":16"), "Klasik funk kalıbı.", "Akor vuruşları kısa: hemen sustur."),
    ders("İki Akor", 80, play(80, ["E9", "E9", "A7", "A7"], "D-xUXxD-XxDUXxDU", ":16"), "E9 ve A7 arasında funk.", "Akor değişimi el salınımını bozmasın.", "", 2),
  ]),
  chapter(P, 2, 2, "Pop On Altılık", ["Akustik pop'ta sekizlik kalıplara on altılık 'süsler' eklenir; bu, taramaya hareket katar."], [
    ders("Süslü Kalıp", 70, play(70, POP, "D---D-DUD---D-DU", ":16"), "On altılık süslü pop kalıbı.", "Süsler (DU) hafif çalınsın."),
    ders("Akıcı", 80, play(80, POP, "D-DU-UDUD-DU-UDU", ":16"), "Hızlı, akıcı kalıp.", "Vurgu her vuruşun başında."),
    ders("Minör", 80, play(80, MINOR, "D-DU-UDUD-DU-UDU", ":16"), "Aynı kalıp minör dizide.", "Kalıp değişmeden akorlar değişir.", "", 2),
  ]),
]);

// ── Bölüm 3: Susturma ve Arka Vuruş ──────────────────────────────────────────
const s3 = section(3, "Susturma ve Arka Vuruş", [
  chapter(P, 3, 0, "Chuck (Vurmalı Susturma)", ["Chuck: sol eli gevşetip aynı anda tarayarak 'trampet' gibi kısa, perdesiz bir ses çıkarmak. 2. ve 4. vuruşa konunca gitar tek başına davul gibi çalar."], [
    ders("2 ve 4'te Chuck", 70, play(70, POP, "D-X-D-X-", ":8"), "Vuruşlarda akor, 2 ve 4'te susturulmuş vuruş.", "Chuck için sol el parmakları teli bırakmadan sadece gevşer."),
    ders("Sekizlikli Chuck", 80, play(80, POP, "DUXUDUXU"), "Sekizlik tarama içinde chuck.", "Akor ve chuck arasındaki ses farkı net olsun."),
    ders("Pop Chuck", 90, play(90, MINOR, "D-XUDUXU"), "Akustik pop'un klasik chuck kalıbı.", "Bu kalıp tek gitarla bütün bir ritim bölümü gibi duyulur.", "", 2),
  ]),
  chapter(P, 3, 1, "Reggae ve Ska", ["Reggae ve ska'da akor sadece vuruşların arasında ('ve'lerde) çalınır. Vuruşlar boş kalır; bu 'ters' his türün imzasıdır."], [
    ders("Ara Vuruş", 70, play(70, ["Am", "G", "Am", "G"], "-U-U-U-U"), "Sadece yukarı vuruşlar, 've'lerde.", "Aşağı hareket havada; akor kısa çalınıp susturulur."),
    ders("Reggae", 70, tex(70, ["Am", "Am", "Dm", "Dm"].map((c) => `:4 r (${AKOR[c]}){bd} r (${AKOR[c]}){bd}`)), "Reggae: 2 ve 4'te kısa akor.", "Akoru hemen sustur: 'tık' gibi."),
    ders("Ska", 110, play(110, ["C", "Am", "F", "G"], "-U-U-U-U"), "Ska: hızlı tempoda ara vuruşlar.", "Hız artınca hareket küçülmeli.", "", 2),
  ]),
  chapter(P, 3, 2, "Palm Mute Tarama", ["Palm mute'lu tarama rock baladlarında kıta (verse) bölümünün sesidir; nakaratta (chorus) avuç içi kalkar ve gitar açılır."], [
    ders("Kıta – Susturulmuş", 80, tex(80, POP.map((c) => `:8 ${Array(8).fill(`(${AKOR[c].split(" ").slice(0, 3).map((n) => `${n}{pm}`).join(" ")}){bd}`).join(" ")}`)), "Sadece pes üç tel, susturulmuş sekizlikler.", "Avuç içi köprünün hemen önünde."),
    ders("Nakarat – Açık", 80, play(80, POP, "D-DU-UDU"), "Aynı akorlar açık taramayla.", "Kıtadan nakarata geçerken dinamik büyür."),
    ders("Kıta + Nakarat", 80, tex(80, [...POP.map((c) => `:8 ${Array(8).fill(`(${AKOR[c].split(" ").slice(0, 3).map((n) => `${n}{pm}`).join(" ")}){bd}`).join(" ")}`), ...POP.map((c) => grid(c, "D-DU-UDU", ":8"))]), "Dört ölçü kıta, dört ölçü nakarat.", "Şarkı yapısı: dinamik değişim duyguyu taşır.", "Kıta–nakarat yapısı popüler şarkıların temel formudur.", 2),
  ]),
]);

// ── Bölüm 4: Ölçüler ve Hisler ───────────────────────────────────────────────
const s4 = section(4, "Ölçüler ve Hisler", [
  chapter(P, 4, 0, "3/4 Vals", ["3/4 ölçüde her ölçüde üç vuruş vardır: 'BİR – iki – üç'. Valsin ve pek çok halk şarkısının ölçüsü."], [
    ders("Bas ve Akor", 80, tex(80, ["C", "G", "G", "C"].map((c, i) => `${i === 0 ? "\\ts 3 4 " : ""}${grid(c, "BDD", ":4")}`)), "Birinci vuruşta bas, iki ve üçte akor.", "Bas biraz güçlü: 'BUM – çik – çik'."),
    ders("Sekizlik Vals", 80, tex(80, ["C", "Am", "F", "G"].map((c, i) => `${i === 0 ? "\\ts 3 4 " : ""}${grid(c, "D-DUDU", ":8")}`)), "3/4'te sekizlik kalıp.", "Ölçünün ilk vuruşu belirgin olsun.", `Notalar: ${notes(["C", "Am", "F", "G"])}.`),
    ders("Alternatif Bas Vals", 90, tex(90, ["G", "C", "D", "G"].map((c, i) => `${i === 0 ? "\\ts 3 4 " : ""}${grid(c, i % 2 ? "ADD" : "BDD", ":4")}`)), "Bas her ölçüde değişir: kök ve alternatif bas.", "Başparmak bası çalar, diğer parmaklar akoru.", "", 2),
  ]),
  chapter(P, 4, 1, "6/8", ["6/8 ölçüsü iki büyük vuruştan oluşur, her biri üç sekizliğe bölünür: 'BİR-iki-üç DÖRT-beş-altı'. 3/4 ile aynı uzunlukta ama farklı hissedilir."], [
    ders("Temel 6/8", 70, play(70, ["Am", "G", "F", "E"], "D--D--", ":8", "6 8"), "İki büyük vuruşta tarama.", "Her büyük vuruşu ayrı say."),
    ders("Dolu 6/8", 70, play(70, ["Am", "G", "F", "E"], "DDUDDU", ":8", "6 8"), "Her sekizlikte tarama: aşağı-aşağı-yukarı.", "Rock baladlarının klasik 6/8 kalıbı."),
    ders("Bas ve Akor", 80, play(80, ["C", "Am", "F", "G"], "BDUADU", ":8", "6 8"), "Bas ve akor karışık 6/8.", "Bas notaları büyük vuruşlarda.", "", 2),
  ]),
  chapter(P, 4, 2, "Shuffle", [
    "Shuffle (swing): sekizlikler eşit değil, 'uzun-kısa' çalınır. Her vuruş üçe bölünür (triole); ilk iki parça birleşir, üçüncüsü kısa nota olur: 'ta-a-ka'.",
    "Blues ve rock'n'roll'un temel hissi.",
  ], [
    ders("Shuffle Tarama", 70, SWING(70, ["A7", "A7", "D7", "A7"], "D-UD-UD-UD-U"), "Triole ızgarada aşağı (uzun) ve yukarı (kısa).", "Ortadaki boşlukta el havada iner.", `Notalar: ${notes(["A7", "D7"])}.`),
    ders("Blues Shuffle", 80, SWING(80, ["A7", "A7", "A7", "A7", "D7", "D7", "A7", "A7", "E7", "D7", "A7", "E7"], "D-UD-UD-UD-U"), "12 ölçü blues, shuffle.", "Uzun-kısa hissi bütün şarkı boyunca aynı.", "", 2),
    ders("Shuffle Bas", 80, tex(80, ["A", "A", "D", "A"].map((c) => {
      const [k, five, six] = c === "A" ? ["0.5", "2.4", "4.4"] : ["0.4", "2.3", "4.3"];
      const beat = (top: string) => `:4 (${k} ${top}){tu 3} :8 (${k} ${top}){tu 3}`;
      return [five, five, six, six].map(beat).join(" ");
    })), "Shuffle'da iki telli bas kalıbı (kök + beşli/altılı).", "Rock'n'roll'un klasik bas eşliği.", "La'da: La + Mi (beşli) ve La + Fa# (altılı) arasında gidip gelir.", 2),
  ]),
]);

// ── Bölüm 5: Stiller ─────────────────────────────────────────────────────────
const s5 = section(5, "Stiller", [
  chapter(P, 5, 0, "Rock", ["Rock ritim gitarı: power chord'lar, sekizlik aşağı vuruşlar ve vurgular. Akorlar Mi minörden: E5 – G5 – A5 – C5 – D5."], [
    ders("Sekizlik Power Chord", 100, tex(100, ["(0.6 2.5)", "(3.6 5.5)", "(5.6 7.5)", "(3.5 5.4)"].map((c) => `:8 ${Array(8).fill(`${c}{bd}`).join(" ")}`)), "Hep aşağı sekizlik power chord.", "Kol değil bilek."),
    ders("Vurgulu", 110, tex(110, ["(0.6 2.5)", "(3.6 5.5)", "(5.6 7.5)", "(5.5 7.4)"].map((c) => accentAt(`:8 ${Array(8).fill(`${c}{bd}`).join(" ")}`, (i) => i === 1 || i === 4 || i === 7))), "3-3-2 vurgu: 1, 've' 2 ve 4.", "3+3+2 gruplama rock ve latin müzikte çok yaygındır.", "Sekiz sekizliği 3+3+2 diye gruplamak dörtlük ölçü içinde 'çarpık' bir dans hissi verir."),
    ders("Durak ve Vuruş", 110, tex(110, ["(0.6 2.5)", "(3.6 5.5)", "(5.6 7.5)", "(3.5 5.4)"].map((c) => `:8 ${c}{bd} ${c}{bd} r ${c}{bd} r ${c}{bd} ${c}{bd} ${c}{bd}`)), "Boşluklu rock kalıbı.", "Boşluklarda telleri sustur.", "", 2),
  ]),
  chapter(P, 5, 1, "Country ve Folk", ["Boom-chick: bas notası (boom) ve akor (chick) sırayla. Country ve folk eşliklerinin temeli."], [
    ders("Boom-Chick", 80, play(80, ["G", "C", "D", "G"], "BDAD", ":4"), "Bas – akor – alternatif bas – akor.", "Bas notaları biraz daha güçlü."),
    ders("Boom-Chick Sekizlik", 90, play(90, ["G", "C", "D", "G"], "B-DUA-DU"), "Akor vuruşlarına yukarı süs eklenir.", "Bas vuruşlarda, akor aralarda."),
    ders("Hızlı Country", 120, play(120, ["G", "G", "C", "C", "D", "D", "G", "G"], "BDAD", ":4"), "Hızlı tempoda boom-chick.", "Bilek gevşek; hız gerginlikten değil rahatlıktan gelir.", "", 2),
  ]),
  chapter(P, 5, 2, "Ritim Etüdü", ["Etüt bu kursun bütün kalıplarını tek şarkı yapısında birleştirir: kıta (susturulmuş), nakarat (açık tarama), köprü (chuck) ve final."], [
    ders("Yavaş", 70, tex(70, [
      ...POP.map((c) => `:8 ${Array(8).fill(`(${AKOR[c].split(" ").slice(0, 3).map((n) => `${n}{pm}`).join(" ")}){bd}`).join(" ")}`),
      ...POP.map((c) => grid(c, "D-DU-UDU", ":8")),
      ...MINOR.map((c) => grid(c, "D-XUDUXU", ":8")),
      `:1 (${AKOR.G}){bd}`,
    ]), "On üç ölçülük ritim etüdü.", "Bölüm değişimlerinde ritim kesilmesin.", "", 2),
    ders("Orta", 90, tex(90, [
      ...POP.map((c) => `:8 ${Array(8).fill(`(${AKOR[c].split(" ").slice(0, 3).map((n) => `${n}{pm}`).join(" ")}){bd}`).join(" ")}`),
      ...POP.map((c) => grid(c, "D-DU-UDU", ":8")),
      ...MINOR.map((c) => grid(c, "D-XUDUXU", ":8")),
      `:1 (${AKOR.G}){bd}`,
    ]), "Daha hızlı.", "Dinamik farkları koru.", "", 3),
    ders("Hedef Tempo", 110, tex(110, [
      ...POP.map((c) => `:8 ${Array(8).fill(`(${AKOR[c].split(" ").slice(0, 3).map((n) => `${n}{pm}`).join(" ")}){bd}`).join(" ")}`),
      ...POP.map((c) => grid(c, "D-DU-UDU", ":8")),
      ...MINOR.map((c) => grid(c, "D-XUDUXU", ":8")),
      `:1 (${AKOR.G}){bd}`,
    ]), "Hedef tempoda.", "Bunu akıcı çalabiliyorsan ritim gitarının temellerine hakimsin.", "", 3),
  ]),
]);

export const ritimCourse: Course = {
  slug: "ritim-tarama",
  title: "Ritim & Strumming",
  description: "Sağ el ritim kalıpları, susturulmuş vuruşlar, senkop.",
  kind: "technique",
  icon: "🥁",
  guide: [
    "## Ritim gitarı nedir?",
    "Şarkının zemini. İyi bir ritim gitaristi akorları doğru zamanda, doğru dinamikle ve hiç durmayan bir sağ el salınımıyla çalar.",
    "## Nasıl çalışılır?",
    "Altın kural: sağ el hiç durmaz. Aşağı vuruşlar vuruşlara, yukarı vuruşlar aralara düşer; tarama yapılmayan yerlerde el yine salınır ama tellere değmez. Metronomla çalış ve her kalıbı önce sayarak öğren.",
    "## Kurs planı",
    "Bölüm 1 – Temel tarama: dörtlük, sekizlik, boşluklu kalıplar.",
    "Bölüm 2 – On altılık: ızgara, funk, pop süsleri.",
    "Bölüm 3 – Susturma ve arka vuruş: chuck, reggae, palm mute.",
    "Bölüm 4 – Ölçüler ve hisler: 3/4, 6/8, shuffle.",
    "Bölüm 5 – Stiller ve etüt.",
  ],
  sections: [s1, s2, s3, s4, s5],
};
