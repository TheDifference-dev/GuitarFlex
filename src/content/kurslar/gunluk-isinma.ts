// Günlük Isınma — orta–ileri elektro gitarist için üç ayrı ~10 dakikalık rutin (A: teknik/pena, B: legato/sol el,
// C: solo/ifade). Her adım tek alt bölümde (yalnız sekizlik, triole, on altılık …) 2–4 ölçülük bir döngüdür; süre ve
// tempo adımda yazılı. Kaynaklar (rehber sekmesinde de var): Guitar World "spider exercise", MusicRadar John Petrucci
// ısınması, Guitar World Gus G ısınmaları, Premier Guitar "speed burst", MusicRadar "bend in tune", Premier Guitar vibrato.
import type { Course, Section } from "../types.ts";
import { tex } from "../tex.ts";
import { measures, perString, run, SCALE, slurred, tabs, type Pos } from "../dizi.ts";
import { aMinor3 } from "./diziler.ts";
import { alt, chapter, type LessonInput } from "./ortak.ts";

const P = "gi";

/** Adım: başlık, süre (dk), tempo, tab, ne yapılır, neden */
function adim(title: string, minutes: number, bpm: number, texStr: string, description: string, neden: string, tips: string[] = []): LessonInput {
  return { title, bpm, minutes, tex: texStr, description, tips: [`Neden: ${neden}`, ...tips], theory: [] };
}

/** Tel tel (6 → 1) aynı perde kalıbı, sonra ince telden kalına ters kalıp */
const telTel = (frets: number[], strings = [6, 5, 4, 3, 2, 1]) => strings.flatMap((s) => frets.map((f) => `${f}.${s}`));

// ── Rutin A: Teknik / pena senkronu ──────────────────────────────────────────
// A1 Örümcek: 1-2-3-4 çık, 4-3-2-1 in (on altılık, 3 ölçü)
const orumcek = [...telTel([5, 6, 7, 8]), ...telTel([8, 7, 6, 5], [1, 2, 3, 4, 5, 6])];
// A2 Tel atlamalı permütasyon 1-3-2-4: 6–4, 5–3, 4–2, 3–1 tel çiftlerinde (sekizlik, 4 ölçü)
const atlama = [[6, 4], [5, 3], [4, 2], [3, 1]].flatMap(([a, b]) => [`5.${a}`, `7.${a}`, `6.${a}`, `8.${a}`, `5.${b}`, `7.${b}`, `6.${b}`, `8.${b}`]);
// A3 Dış / iç pena (Paul Gilbert'in iki tel kalıbı): Si–ince Mi, La minör pentatonik
const dis = [..."x".repeat(4)].flatMap(() => ["5.2", "8.2", "5.1", "8.1"]);
const ic = [..."x".repeat(4)].flatMap(() => ["8.1", "5.1", "8.2", "5.2"]);
// A4 Hız patlaması: bir vuruş on altılık (4 nota), bir vuruş tutulan nota; 2 ölçü, dört tel
const patlama = (g: string[], son: string) => `:16 ${alt(g).join(" ")} :4 ${son}{sd}`;
// A5 3 nota/tel, iki tel çık-in (triole), üç tel çifti
const ikiTel = (k: number) => {
  const xs = tabs(aMinor3.slice(6 * k, 6 * k + 6));
  return [...xs, ...[...xs].reverse()];
};

const rutinA: LessonInput[] = [
  adim("A1 · Örümcek 1-2-3-4", 2, 60, tex(60, measures(":16", alt(orumcek), 16)), "5. perdede her parmak bir perde: çık 1-2-3-4, in 4-3-2-1; katı alternatif pena.",
    "Dört parmağı ve pena elini aynı anda uyandırır; her notada pena ile parmağın aynı anda inmesi (senkron) en temel kontroldür.",
    ["Parmaklar perde telinin hemen arkasında ve sapa yakın dursun; kalkan parmak havada uzaklaşmasın.", "Temiz çalınca 5 BPM artır; 80'e kadar."]),
  adim("A2 · Tel Atlamalı Permütasyon", 2, 80, tex(80, measures(":8", alt(atlama), 8)), "1-3-2-4 permütasyonu bir tel atlayarak: 6–4, 5–3, 4–2, 3–1 tel çiftleri.",
    "Permütasyon zayıf parmak çiftlerini (3-2, 2-4) ortaya çıkarır; tel atlama pena elinin hedefleme doğruluğunu çalıştırır.",
    ["Atlanan teli sol elin boştaki parmağıyla sustur.", "Pena hareketi küçük kalsın; atlamada kol değil bilek hareket eder."]),
  adim("A3 · Dış ve İç Pena", 2, 70, tex(70, measures(":16", alt([...dis, ...ic]), 16)), "Aynı dört nota: önce dış (outside) pena, sonra iç (inside) pena.",
    "Tel geçişinde pena ya tellerin dışından ya arasından geçer; ikisini aynı tempoda temiz çalmak hızlı cümlelerin önkoşuludur.",
    ["İç penada pena iki telin arasında sıkışır: hareketi küçült, tel geçişinde bilek hafifçe döner.", "İkinci ölçü birinciden daha zorsa tempoyu ona göre seç."]),
  adim("A4 · Hız Patlaması", 2, 90, tex(90, [
    `${patlama(["5.1", "8.1", "5.1", "8.1"], "5.1")} ${patlama(["8.2", "5.2", "8.2", "5.2"], "8.2")}`,
    `${patlama(["7.3", "5.3", "7.3", "5.3"], "7.3")} ${patlama(["7.4", "5.4", "7.4", "5.4"], "5.4")}`,
  ]),
    "Bir vuruş on altılık patlama, bir vuruş dinlen; rahat hızının biraz üstünde.",
    "Hızlı çalış yavaş çalıştan farklı bir hareket kalıbıdır; kısa patlamalar gerginlik birikmeden hızlı hareketi denetmeyi öğretir (speed burst).",
    ["Patlamadan sonraki uzun notada eli bilinçli olarak gevşet.", "Temiz dört tekrardan sonra 5 BPM artır."]),
  adim("A5 · 3 Nota/Tel Triole", 2, 70, tex(70, measures(":8", alt([0, 1, 2].flatMap(ikiTel)), 12, 3)), "La doğal minör, tel başına üç nota: her tel çiftinde çık ve in (triole sekizlik).",
    "Tel başına üç nota alternatif penada vurguyu her telde yön değiştirir; triole ile vuruş başı her seferinde başka bir telde düşer.",
    ["Vuruş başlarını hafifçe vurgula: kulak triole ızgarasını duysun.", "Pozisyon değişimi yok; el 5. pozisyonda kalır."]),
];

// ── Rutin B: Legato / sol el ─────────────────────────────────────────────────
// B1 Trill çiftleri: 1-2, 1-3, 1-4, 2-4 (Sol telinde, on altılık)
const trill = (a: number, b: number) => `:16 ${Array.from({ length: 8 }, () => [`${a}.3{h}`, `${b}.3{h}`]).flat().map((n, i, arr) => (i === arr.length - 1 ? n.replace("{h}", "") : n)).join(" ")}`;
// B2 Kromatik legato: her telde 1-2-3-4 hammer-on (çık), 4-3-2-1 pull-off (in); yalnız telin ilk notası penayla
const kromatik = (up: boolean): Pos[] =>
  (up ? [6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6]).flatMap((s) => (up ? [5, 6, 7, 8] : [8, 7, 6, 5]).map((f) => ({ s, f, m: 0 })));
// B3 Parmak kombinasyonları (Petrucci): 1-3-4 çıkarken, 1-2-4 inerken; triole
const kombin = (): Pos[] => [
  ...[6, 5, 4, 3, 2, 1].flatMap((s) => [5, 7, 8].map((f) => ({ s, f, m: 0 }))),
  ...[1, 2, 3, 4, 5, 6].flatMap((s) => [8, 6, 5].map((f) => ({ s, f, m: 0 }))),
];
// B4 Geniş açılım: 1-2-4 beş perdelik (5-7-9), çık ve in, triole
const genis = (): Pos[] => [
  ...[6, 5, 4, 3].flatMap((s) => [5, 7, 9].map((f) => ({ s, f, m: 0 }))),
  ...[3, 4, 5, 6].flatMap((s) => [9, 7, 5].map((f) => ({ s, f, m: 0 }))),
];
// B5 3 nota/tel legato koşusu (altılık on altılık): La minör, 6 tel çık, 2. ölçüde in
const kosu = perString(run(45, SCALE.minor, 18), 3);
const kosuNotalari = slurred([...kosu, ...[...kosu].reverse()]);
/** Her telin ilk notası (n notada bir) aşağı penayla; gerisi bağ */
const pena = (xs: string[], n = 3) => xs.map((x, i) => (i % n === 0 ? (x.includes("{") ? x.replace("{", "{sd ") : `${x}{sd}`) : x));

const rutinB: LessonInput[] = [
  adim("B1 · Trill Çiftleri", 2, 70, tex(70, [trill(5, 6), trill(5, 7), trill(5, 8), trill(6, 8)]), "Sol telinde hammer-on / pull-off trilleri: 1-2, 1-3, 1-4, 2-4 parmak çiftleri; pena yok.",
    "Trill sol elin kas dayanıklılığını ve hammer-on ile pull-off'un ses eşitliğini çalıştırır; zayıf çift (genellikle 3-4) hemen belli olur.",
    ["Pull-off'ta parmak teli hafifçe aşağı çekip bırakır: ikinci nota da ilk kadar yüksek sesli olsun.", "Yanma hissedersen dur ve elini salla."]),
  adim("B2 · Kromatik Legato", 2, 60, tex(60, measures(":16", pena(slurred(kromatik(true)).concat(slurred(kromatik(false))), 4), 16)), "Her telde yalnız ilk nota penayla; çıkarken 1-2-3-4 hammer-on, inerken 4-3-2-1 pull-off.",
    "Bütün parmakların tek başına ses çıkarabilecek güçte vurmasını sağlar; legato cümlelerinde ritmin pena olmadan da düzgün kalmasını öğretir.",
    ["Hammer-on parmak ucunun tam üstünden, perde telinin hemen arkasına iner.", "Boştaki teller sağ elin avucuyla susturulsun."]),
  adim("B3 · Parmak Kombinasyonları", 2, 70, tex(70, measures(":8", pena(slurred(kombin())), 12, 3)), "Çıkarken 1-3-4, inerken 1-2-4 (Petrucci'nin kombinasyonları); her telin ilk notası penayla, triole.",
    "Petrucci ısınmasının özü: bütün parmak kombinasyonlarını sırayla dolaşmak, gamdan bağımsız el şekli kurar.",
    ["1-3-4'te orta parmak havada ama sapa yakın.", "Yönler değişirken tempoyu bozma: vuruş başları telin ilk notası."]),
  adim("B4 · Geniş Açılım 5-7-9", 2, 60, tex(60, measures(":8", pena(slurred(genis())), 12, 3)), "1-2-4 parmaklarla beş perdelik açılım (5-7-9), dört tel çık ve in.",
    "Esneme ısınmanın son aşamasıdır: el ısındıktan sonra açılım, geniş aralıklı legato ve 3 nota/tel kalıplarına hazırlar.",
    ["Başparmak sapın arkasında aşağı kaysın; bilek düz kalsın.", "Acı hissedersen 7. pozisyona (daha dar perdeler) çık."]),
  adim("B5 · 3 Nota/Tel Legato Koşusu", 2, 55, tex(55, measures(":16", pena(kosuNotalari), 24, 3)), "La doğal minör, tel başına üç nota; her telin ilk notası penayla, gerisi bağ. Altılık on altılık.",
    "Isınmanın sonunda bütün parçalar (senkron, kombinasyon, açılım) gerçek bir gam koşusunda birleşir.",
    ["Altılık: vuruş başına altı nota; her iki telde bir vuruş başı.", "Hedef tempo 80; önce 55'te temiz."]),
];

// ── Rutin C: Solo / ifade ────────────────────────────────────────────────────
const F = "{b (0 4)}";
const H = "{b (0 2)}";
const FR = "{b (0 4 0)}";
const rutinC: LessonInput[] = [
  adim("C1 · Ritmik Vibrato", 2, 70, tex(70, [":2 7.3{v} 7.3{vw}", ":2 8.2{v} 8.2{vw}", ":2 10.1{v} 10.1{vw}", ":2 7.1{v} 5.1{vw}"]), "Her nota iki vuruş: önce dar vibrato, sonra geniş vibrato; yüzük, serçe ve işaret parmağıyla.",
    "Vibratonun hızı ve genişliği bilinçli seçilmelidir; metronomla çalışmak vibratoyu düzensiz 'titreme' olmaktan çıkarır.",
    ["Dar vibratoda vuruş başına iki dalga (sekizlik), genişte vuruş başına bir dalga dene.", "Hareket bilekten gelir; parmak sadece teli tutar."]),
  adim("C2 · Bend Akordu", 2, 60, tex(60, [":4 9.3 r 7.3" + F + " r", ":4 10.2 r 8.2" + F + " r", ":4 8.2 r 7.2" + H + " r", ":4 8.1 r 7.1" + H + " r"]), "Önce hedef notayı bas ve dinle, sonra bend ile aynı sese ulaş: iki tam ses, iki yarım ses bend.",
    "Bend akortsuzluğu solonun en çok duyulan hatasıdır; referans notayla kulak hedefi önceden duyar (bend in tune).",
    ["Bend parmağının arkasındaki parmaklar da teli itsin.", "Hedefe ulaşınca bend'i orada sabit tut; titretme."]),
  adim("C3 · Unison ve Ön Bend", 2, 60, tex(60, [":2 (10.1 12.2" + F + ") (10.1 12.2" + F + ")", ":2 (5.1 7.2" + F + ") (5.1 7.2" + F + ")", ":4 7.3{b (4 4 0)} r 7.3" + FR + " r", ":4 8.2{b (4 4 0)} r 5.1{v} r"]), "Unison bend: Si telindeki bend ince Mi'deki notaya ulaşsın; sonra ön bend (sessiz bend, çal, bırak).",
    "Unison bend iki sesin vuruşmasıyla akordu anında duyurur; ön bend, bend'i kas hafızasıyla doğru yüksekliğe getirmeyi öğretir.",
    ["İki ses tek ses gibi duyulana kadar it; 'vuvvv' dalgalanması bend'in eksik olduğunu gösterir.", "Ön bend'i çalmadan önce sessizce kur."]),
  adim("C4 · Pena Senkronlu Cümle", 2, 80, tex(80, [
    `:8 ${alt(["5.1", "8.2", "5.2", "7.3", "5.3", "7.4", "5.4", "7.3"]).join(" ")}`,
    `:8 ${alt(["5.3", "7.3", "5.2", "8.2", "5.1", "8.1", "5.1", "8.2"]).join(" ")}`,
    `:8 7.3{sd} 7.3${F.replace("}", " su}")} 5.2{sd} 8.2{su} 5.2{sd} 7.3{su} 5.3{sd} 7.4{su}`,
    `:8 5.4{sd} 7.4{su} 5.3{sd} 7.3{su} :2 7.4{v}`,
  ]), "La minör pentatonikte sekizlik bir cümle: iniş, çıkış, bend ve vibratolu bitiş.",
    "Teknik ısınmayı müziğe çevirir: alternatif pena, bend ve vibrato aynı cümlede, metronomun içinde.",
    ["Bend'li notada pena yönü bozulmaz (yukarı).", "Son notayı vibratoyla iki vuruş tut."]),
  adim("C5 · Soru – Cevap Doğaçlaması", 2, 70, tex(70, [`:8 ${alt(["5.1", "8.1", "5.1", "8.2", "5.2", "7.3", "5.3", "7.3"]).join(" ")}`, ":2 7.3" + F + " 7.3{v}", `:8 ${alt(["8.1", "5.1", "8.2", "5.2", "7.3", "5.3", "7.4", "5.4"]).join(" ")}`, ":2 7.4{v} 5.4{vw}"]),
    "İki ölçü soru (bend ile asılı kalır), iki ölçü cevap (La'ya iner). Tabı çal, sonra aynı ritimle kendi cevabını uydur.",
    "Isınmayı yaratıcı çalmayla bitirmek, teknik hareketleri ifadeye bağlar; soru–cevap cümle kurmanın en kısa yoludur.",
    ["Kendi cevabında da son notayı vibratoyla tut.", "Aynı soruya her gün başka bir cevap ver."]),
];

const bolum = (number: number, title: string, chTitle: string, theory: string[], lessons: LessonInput[]): Section => ({
  number,
  title,
  exam: false,
  chapters: [chapter(P, number, 0, chTitle, theory, lessons)],
});

export const gunlukIsinmaCourse: Course = {
  slug: "gunluk-isinma",
  title: "Günlük Isınma",
  description: "Orta–ileri elektro gitarist için üç ayrı on dakikalık rutin: teknik ve pena, legato ve sol el, solo ve ifade.",
  kind: "technique",
  guide: [
    "## Nasıl kullanılır?",
    "Her gün bir rutin seç (A, B, C sırayla dönebilir). Her adımın süresi ve temposu yazılı; adımlar 2–4 ölçülük döngülerdir, hedef süre dolunca bir sonrakine geç. Toplam yaklaşık on dakika.",
    "Isınma çalışma değildir: tempo rahat olsun, gerginlik hissedersen dur. Isındıktan sonra asıl çalışmana (bir teknik kursu, sınav, şarkı) geç.",
    "## Rutinler",
    "Rutin A – Teknik / pena: örümcek, tel atlamalı permütasyon, dış ve iç pena, hız patlaması, 3 nota/tel triole.",
    "Rutin B – Legato / sol el: trill çiftleri, kromatik legato, Petrucci parmak kombinasyonları, geniş açılım, 3 nota/tel legato koşusu.",
    "Rutin C – Solo / ifade: ritmik vibrato, referanslı bend akordu, unison ve ön bend, pena senkronlu cümle, soru–cevap.",
    "## Kaynaklar",
    "Guitar World, “Spider exercise” (1-2-3-4 ve permütasyonlar): guitarworld.com/lessons/spider-exercise",
    "MusicRadar, John Petrucci'nin ısınması (legato, parmak kombinasyonları, tel başına nota sayısını artırma): musicradar.com/how-to/learn-john-petruccis-ultimate-guitar-warm-up-routine",
    "Guitar World, Gus G ısınmaları (1-2-4 legato, kromatik atlama, 3 nota/tel): guitarworld.com/lessons/techniques/gus-g-guitar-warm-ups",
    "Premier Guitar, “Speed burst” (kısa hız patlamaları): premierguitar.com/lessons/beginner/speed-burst-guitar",
    "MusicRadar, “Bend in tune” (referans notayla bend): musicradar.com/how-to/bend-in-tune-on-guitar",
    "Premier Guitar, vibrato (genişlik, hız, düzenlilik): premierguitar.com/articles/26555-shake-it-off-everything-you-need-to-know-about-vibrato",
  ],
  sections: [
    bolum(1, "Rutin A · Teknik ve Pena", "Rutin A", ["Beş adım, her biri 2 dakika: senkron → permütasyon → tel geçişi → hız → gam."], rutinA),
    bolum(2, "Rutin B · Legato ve Sol El", "Rutin B", ["Beş adım, her biri 2 dakika: trill → kromatik legato → kombinasyon → açılım → koşu."], rutinB),
    bolum(3, "Rutin C · Solo ve İfade", "Rutin C", ["Beş adım, her biri 2 dakika: vibrato → bend akordu → unison/ön bend → cümle → soru–cevap."], rutinC),
  ],
};
