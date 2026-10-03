// Tapping — 5 bölüm, özgün egzersizler.
// Birim: sağ el tap (tt) → sol el notalarına pull-off / hammer-on.
import type { Course } from "../types.ts";
import { tex } from "../tex.ts";
import { measures } from "../dizi.ts";
import { chapter, ders, section } from "./ortak.ts";

const P = "tp";
type U = [tap: number, a: number, b: number];

/** Tap – pull-off – hammer-on (triole birimi) */
const u3 = (s: number, [t, a, b]: U) => [`${t}.${s}{tt h}`, `${a}.${s}{h}`, `${b}.${s}`];
/** Tap – pull – hammer – pull (on altılık birimi) */
const u4 = (s: number, [t, a, b]: U) => [`${t}.${s}{tt h}`, `${a}.${s}{h}`, `${b}.${s}{h}`, `${a}.${s}`];
/** Tap – pull – pull (inen arpej) */
const u3down = (s: number, [t, a, b]: U) => [`${t}.${s}{tt h}`, `${a}.${s}{h}`, `${b}.${s}`];

const trip = (bpm: number, notes: string[], end: string[] = []) => tex(bpm, [...measures(":8", notes, 12, 3), ...end]);
const six = (bpm: number, notes: string[], end: string[] = []) => tex(bpm, [...measures(":16", notes, 16), ...end]);
/** Her akor için bir ölçü: triolede 4 birim, on altılıkta 4 birim */
const bars3 = (s: number | number[], units: U[]) => units.flatMap((u, i) => Array.from({ length: 4 }, () => u3(Array.isArray(s) ? s[i] : s, u)).flat());
const bars4 = (s: number | number[], units: U[]) => units.flatMap((u, i) => Array.from({ length: 4 }, () => u4(Array.isArray(s) ? s[i] : s, u)).flat());

// İnce Mi telinde akor tonları: [tap, sol el 1, sol el 2]
const E1: Record<string, U> = {
  Am: [12, 5, 8], F: [13, 5, 8], G: [15, 7, 10], E: [12, 4, 7], Dm: [17, 10, 13], C: [15, 8, 12], Em: [12, 3, 7],
};
// Si telinde
const B2: Record<string, U> = { Am: [17, 10, 13], C: [13, 5, 8], Dm: [15, 6, 10], E: [17, 9, 12], F: [13, 6, 10], G: [15, 8, 12] };
// Sol telinde
const G3: Record<string, U> = { Am: [14, 5, 9], E: [16, 9, 13], Dm: [14, 7, 10], C: [12, 5, 9] };
const AMFGE: U[] = [E1.Am, E1.F, E1.G, E1.E];
const END = [":1 5.1{v}"];

const tips1 = [
  "Tap yapan parmak (orta ya da işaret) teli perdenin hemen arkasında, dik vurur.",
  "Pull-off için parmağı kaldırma, teli hafifçe aşağı (yere doğru) çekerek bırak.",
  "Sol el kullanılmayan telleri sustursun; tapping çok gürültülüdür.",
];

// ── Bölüm 1: Temeller ────────────────────────────────────────────────────────
const s1 = section(1, "Temeller", [
  chapter(P, 1, 0, "Tap – Pull – Hammer", [
    "Tapping'de sağ el parmağı sapa vurarak nota çalar. Sol elin erişemeyeceği kadar uzak notalar tek telde yan yana gelir.",
    "La – Do – Mi: La minör akorunun üç notası. İnce Mi telinde 5. perde La, 8. perde Do, 12. perde Mi.",
  ], [
    ders("Yavaş Üçlü", 50, trip(50, bars3(1, [E1.Am, E1.Am, E1.Am, E1.Am]), END), "12. perdeye tap, 5'e pull-off, 8'e hammer-on.", tips1),
    ders("Si Telinde", 50, trip(50, bars3(2, [B2.C, B2.C, B2.C, B2.C])), "Aynı hareket Si telinde: Do akoru.", tips1, "Do – Mi – Sol: Do majör üçlüsü. Si telinde 5 Mi, 8 Sol, 13 Do."),
    ders("İki Tel", 60, trip(60, [...bars3(1, [E1.Am, E1.Am]), ...bars3(2, [B2.C, B2.C])]), "İki ölçü ince Mi, iki ölçü Si teli.", ["Tel değiştirirken sol el bir önceki teli sustursun."]),
  ]),
  chapter(P, 1, 1, "On Altılık Döngü", ["On altılık döngü: tap – pull – hammer – pull. Her vuruşa dört nota, tap her vuruşun başında."], [
    ders("Am Döngüsü", 50, six(50, bars4(1, [E1.Am, E1.Am, E1.Am, E1.Am]), END), "Dört notalık döngü tek akorda.", "Dördüncü nota (pull-off) en zayıf çıkar; ona dikkat et."),
    ders("Am ve Em", 50, six(50, bars4(1, [E1.Am, E1.Em, E1.Am, E1.Em])), "İki akor arasında.", "Em'de sol el 3. ve 7. perdeye geniş açılır.", "Am = La–Do–Mi, Em = Mi–Sol–Si. İki akor Mi notasını paylaşır: tap aynı kalır."),
    ders("Hedef Tempo", 70, six(70, bars4(1, [E1.Am, E1.Em, E1.Am, E1.Em]), END), "Aynı döngü daha hızlı.", "Sağ el bilekten değil parmaktan çalışır.", "", 2),
  ]),
  chapter(P, 1, 2, "Akor Değişimi", ["Am – F – G – E: La minörde i – VI – VII – V. Tapping'de akor değiştirmek için sadece tap ve sol el notalarını kaydırmak yeterli."], [
    ders("Triole", 60, trip(60, bars3(1, AMFGE), END), "Am – F – G – E, triole.", "Akor değişimini bir önceki birimin sonunda hazırla.", "F'de tap 13 (Fa), G'de 15 (Sol), E'de 12 (Mi); sol el notaları akorun diğer iki tonu."),
    ders("On Altılık", 55, six(55, bars4(1, AMFGE), END), "Aynı dizi on altılıkla.", "Her vuruşun başı tap: ritmi sağ el tutar."),
    ders("Hedef Tempo", 75, six(75, bars4(1, AMFGE), END), "Hedef tempoda.", "Temiz çalamıyorsan bir önceki derse dön.", "", 2),
  ]),
]);

// ── Bölüm 2: Tek Telde Melodi ────────────────────────────────────────────────
const melodyTaps = [12, 12, 13, 13, 15, 15, 17, 17, 15, 15, 13, 13, 12, 12, 10, 10];
const lhPairs: [number, number][] = [[5, 8], [5, 8], [7, 8], [7, 8], [8, 10], [8, 10], [7, 10], [7, 10], [5, 8], [5, 8], [5, 7], [5, 7], [3, 7], [3, 7], [5, 8], [5, 8]];
const s2 = section(2, "Tek Telde Melodi", [
  chapter(P, 2, 0, "Tap Melodisi", ["Sol el sabit kalırken tap notası melodi çalabilir: Mi – Fa – Sol – La – Sol – Fa – Mi – Re. Hepsi La minör gamında."], [
    ders("Triole", 60, trip(60, melodyTaps.flatMap((t) => u3(1, [t, 5, 8])), END), "Sol el 5 ve 8'de, tap melodiyi çalar.", "Tap parmağı perdeden perdeye kayarken teli bırakmasın; pull-off'u bitirip öyle kay."),
    ders("On Altılık", 55, six(55, melodyTaps.flatMap((t) => u4(1, [t, 5, 8])), END), "Aynı melodi on altılıkla.", "Tap notası her vuruşun başında; melodi vurgulu duyulsun."),
    ders("Hedef Tempo", 75, six(75, melodyTaps.flatMap((t) => u4(1, [t, 5, 8])), END), "Hedef tempoda.", "Melodiyi önce tap'siz, tek parmakla çalıp kulağına yerleştir.", "", 2),
  ]),
  chapter(P, 2, 1, "Sol El Melodisi", ["Bu kez tap sabit (17. perde, La), melodiyi sol el çalar. Sabit tap bir 'pedal tonu' gibi davranır."], [
    ders("Triole", 60, trip(60, lhPairs.flatMap(([a, b]) => u3(1, [17, a, b])), END), "Tap 17'de sabit, sol el iki notası değişir.", "Sol el kayarken tap ritmi bozulmasın."),
    ders("On Altılık", 55, six(55, lhPairs.flatMap(([a, b]) => u4(1, [17, a, b])), END), "Aynı fikir on altılıkla.", "Sol el parmakları önceden yerine otursun."),
    ders("Hedef Tempo", 75, six(75, lhPairs.flatMap(([a, b]) => u4(1, [17, a, b])), END), "Hedef tempoda.", "Pedal tonu (La) bütün melodiye 'ev' hissi verir.", "", 2),
  ]),
  chapter(P, 2, 2, "İnen Arpej", ["Tap – pull – pull: üç nota tepeden aşağı iner. Akorun notaları yukarıdan aşağı (Mi – Do – La) çalınır."], [
    ders("Am – Inen", 60, trip(60, Array.from({ length: 16 }, () => u3down(1, [12, 8, 5])).flat(), END), "Tap 12, pull 8, pull 5.", "İkinci pull-off için 8'deki parmak teli aşağı çeker."),
    ders("Am – F – G – E İnen", 60, trip(60, [[12, 8, 5], [13, 8, 5], [15, 10, 7], [12, 7, 4]].flatMap((u) => Array.from({ length: 4 }, () => u3down(1, u as U)).flat()), END), "Akor dizisi, inen arpejle.", "İnen arpej, çıkan döngüden daha 'akıcı' duyulur."),
    ders("Karışık", 60, trip(60, [[12, 5, 8], [12, 8, 5], [13, 5, 8], [13, 8, 5], [15, 7, 10], [15, 10, 7], [12, 4, 7], [12, 7, 4]].flatMap((u) => Array.from({ length: 2 }, () => u3(1, u as U)).flat()), END), "Bir birim çıkan, bir birim inen.", "Yön değişimini sol el belirler; tap aynı.", "", 2),
  ]),
]);

// ── Bölüm 3: Tel Değiştirme ──────────────────────────────────────────────────
const s3 = section(3, "Tel Değiştirme", [
  chapter(P, 3, 0, "İki Tel", ["Aynı akor farklı tellerde farklı perdelere düşer: ince Mi'de Am 5-8-12, Si telinde 10-13-17."], [
    ders("Am – Am", 60, trip(60, [...bars3(1, [E1.Am]), ...bars3(2, [B2.Am]), ...bars3(1, [E1.Am]), ...bars3(2, [B2.Am])], END), "Aynı akor iki telde.", "Si telinde el 5 perde yukarı kayar."),
    ders("Am – C – Dm – E", 60, trip(60, bars3([1, 2, 2, 2], [E1.Am, B2.C, B2.Dm, B2.E]), END), "Her ölçü bir akor, iki tel arasında.", "Akorların hangi telde daha rahat olduğunu fark et."),
    ders("On Altılık", 55, six(55, bars4([1, 2, 2, 2], [E1.Am, B2.C, B2.Dm, B2.E]), END), "Aynı dizi on altılıkla.", "Tel değiştirirken eski teli sustur.", "", 2),
  ]),
  chapter(P, 3, 1, "Üç Tel", ["Sol telinde Am: 5 Do, 9 Mi, 14 La. Üç telde aynı akor üç farklı ses rengi verir."], [
    ders("Am Üç Telde", 60, trip(60, [...bars3(3, [G3.Am]), ...bars3(2, [B2.Am]), ...bars3(1, [E1.Am]), ...bars3(2, [B2.Am])], END), "Sol, Si ve ince Mi telinde Am.", "Pes tellerde tap daha güçlü olmalı."),
    ders("Am – Dm – E", 60, trip(60, bars3([3, 3, 3, 3], [G3.Am, G3.Dm, G3.E, G3.Am]), END), "Sol telinde akor dizisi.", "Sol telinde perdeler daha uzun; el açıklığına dikkat."),
    ders("Tel Merdiveni", 60, trip(60, [3, 2, 1, 2, 3, 2, 1, 2].flatMap((s) => Array.from({ length: 2 }, () => u3(s, s === 3 ? G3.Am : s === 2 ? B2.Am : E1.Am)).flat()), END), "Am, tellerde aşağı yukarı.", "Her iki birimde bir tel değişiyor.", "", 2),
  ]),
  chapter(P, 3, 2, "Tel Atlama", ["Tel atlamalı tapping'de sol el aradaki teli mutlaka susturmalı."], [
    ders("Sol ve İnce Mi", 60, trip(60, [...bars3(3, [G3.Am]), ...bars3(1, [E1.Am]), ...bars3(3, [G3.C]), ...bars3(1, [E1.C])], END), "İki tel atlayarak.", "Aradaki Si telini sol el işaret parmağıyla sustur."),
    ders("Ardışık Atlama", 60, trip(60, [3, 1, 3, 1, 3, 1, 3, 1].flatMap((s) => Array.from({ length: 2 }, () => u3(s, s === 3 ? G3.Am : E1.Am)).flat()), END), "Her iki birimde tel atla.", "Sağ el tap parmağı teller arasında küçük bir kavis çizer."),
    ders("On Altılık", 55, six(55, [3, 1, 3, 1].flatMap((s) => Array.from({ length: 4 }, () => u4(s, s === 3 ? G3.Am : E1.Am)).flat()), END), "On altılık döngüyle tel atlama.", "Gürültü varsa yavaşla.", "", 2),
  ]),
]);

// ── Bölüm 4: Genişletilmiş Tapping ───────────────────────────────────────────
/** İki tap notası: t1 a b, t2 a b */
const twoTaps = (s: number, t1: number, t2: number, a: number, b: number) => [...u3(s, [t1, a, b]), ...u3(s, [t2, a, b])];
/** 7'li akor: tap – pull – pull – hammer */
const sev = (s: number, t: number, a: number, b: number) => [`${t}.${s}{tt h}`, `${a}.${s}{h}`, `${b}.${s}{h}`, `${a}.${s}`];
const s4 = section(4, "Genişletilmiş Tapping", [
  chapter(P, 4, 0, "İki Tap Notası", ["İki farklı tap notası arpeji genişletir: Am'de Mi (12) ve La (17) tap'lenince akor iki oktava yayılır."], [
    ders("Am – İki Tap", 60, trip(60, Array.from({ length: 8 }, () => twoTaps(1, 12, 17, 5, 8)).flat(), END), "12 ve 17'ye sırayla tap.", "Tap parmağı 12 ile 17 arasında kayar; sol el sabit."),
    ders("Am – F – G – E", 60, trip(60, [[12, 17, 5, 8], [13, 17, 5, 8], [15, 19, 7, 10], [12, 16, 4, 7]].flatMap(([a, b, c, d]) => [...twoTaps(1, a, b, c, d), ...twoTaps(1, a, b, c, d)]), END), "Akor dizisi iki tap notasıyla.", "16. perde Sol#: E akorunun üçlüsü.", "Her akorda iki tap notası akorun iki tonu: Am'de Mi ve La, F'de Fa ve La, G'de Sol ve Si, E'de Mi ve Sol#."),
    ders("Hedef Tempo", 80, trip(80, [[12, 17, 5, 8], [13, 17, 5, 8], [15, 19, 7, 10], [12, 16, 4, 7]].flatMap(([a, b, c, d]) => [...twoTaps(1, a, b, c, d), ...twoTaps(1, a, b, c, d)]), END), "Hedef tempoda.", "İki tap notası eşit güçte olsun.", "", 2),
  ]),
  chapter(P, 4, 1, "7'li Akorlar", [
    "7'li akor dört notadır: üçlü akor + bir üçlü daha. Am7 = La–Do–Mi–Sol, Dm7 = Re–Fa–La–Do, G7 = Sol–Si–Re–Fa, Cmaj7 = Do–Mi–Sol–Si.",
    "Dm7 – G7 – Cmaj7 (ii – V – I) cazın en temel akor hareketidir.",
  ], [
    ders("Am7", 55, six(55, Array.from({ length: 16 }, () => sev(1, 15, 8, 5)).flat(), END), "Tap 15 (Sol), sol el 8 (Do) ve 5 (La).", "Tap – pull – pull – hammer: sol el iki pull-off yapar."),
    ders("ii – V – I – vi", 55, six(55, [[13, 8, 5], [13, 10, 7], [19, 12, 8], [15, 8, 5]].flatMap(([t, a, b]) => Array.from({ length: 4 }, () => sev(1, t, a, b)).flat()), END), "Dm7 – G7 – Cmaj7 – Am7 tek telde.", "Cmaj7'de tap 19 (Si); sağ el sapın tepesine uzanır.", "Dm7: Fa–Do–La · G7: Fa–Re–Si · Cmaj7: Si–Mi–Do · Am7: Sol–Do–La. Her akordan üç ton yeterli."),
    ders("Hedef Tempo", 75, six(75, [[13, 8, 5], [13, 10, 7], [19, 12, 8], [15, 8, 5]].flatMap(([t, a, b]) => Array.from({ length: 4 }, () => sev(1, t, a, b)).flat()), END), "Hedef tempoda.", "Akor geçişlerini kulakla takip et.", "", 2),
  ]),
  chapter(P, 4, 2, "Arpej Merdiveni", ["Aynı akorun üç teldeki şekillerini art arda çalmak, tapping'i tek tel kalıbından çıkarıp sapa yayar."], [
    ders("İnen Merdiven", 60, trip(60, [1, 2, 3, 2].flatMap((s) => Array.from({ length: 4 }, () => u3(s, s === 1 ? E1.Am : s === 2 ? B2.Am : G3.Am)).flat()), END), "Am, ince Mi'den Sol teline ve geri.", "Her ölçü bir tel."),
    ders("Hızlı Merdiven", 60, trip(60, [1, 2, 3, 2, 1, 2, 3, 2].flatMap((s) => Array.from({ length: 2 }, () => u3(s, s === 1 ? E1.Am : s === 2 ? B2.Am : G3.Am)).flat()), END), "Her yarım ölçüde tel değişir.", "Tel değişiminde sağ el önce davranır, sol el takip eder."),
    ders("On Altılık Merdiven", 55, six(55, [1, 2, 3, 2, 1, 2, 3, 2].flatMap((s) => Array.from({ length: 2 }, () => u4(s, s === 1 ? E1.Am : s === 2 ? B2.Am : G3.Am)).flat()), END), "On altılık döngüyle merdiven.", "Bunu temiz çalabiliyorsan etütlere hazırsın.", "", 2),
  ]),
]);

// ── Bölüm 5: Etütler ─────────────────────────────────────────────────────────
const etude: U[] = [E1.Am, E1.F, E1.G, E1.E, E1.Am, E1.Dm, E1.E, E1.Am];
const etude2: [number, U][] = [[1, E1.Am], [2, B2.F], [1, E1.G], [2, B2.E], [1, E1.Am], [2, B2.Dm], [2, B2.E], [1, E1.Am]];
const s5 = section(5, "Etütler", [
  chapter(P, 5, 0, "Tek Tel Etüdü", ["Am – F – G – E – Am – Dm – E – Am: i – VI – VII – V – i – iv – V – i. E akoru iki kez Am'ye çözülür."], [
    ders("Triole", 60, trip(60, bars3(1, etude), END), "Sekiz akorluk etüt, triole.", "Her ölçü bir akor.", "", 2),
    ders("On Altılık", 55, six(55, bars4(1, etude), END), "On altılık döngüyle.", "Akor değişimlerini ölçünün son notasında hazırla.", "", 3),
    ders("Hedef Tempo", 80, six(80, bars4(1, etude), END), "Hedef tempoda.", "Sesler eşit, gürültü yok.", "", 3),
  ]),
  chapter(P, 5, 1, "İki Tel Etüdü", ["Akorlar ince Mi ve Si telleri arasında dağıtıldı: her akor en yakın şekliyle çalınır, el sapta az hareket eder."], [
    ders("Triole", 60, trip(60, etude2.flatMap(([s, u]) => Array.from({ length: 4 }, () => u3(s, u)).flat()), END), "İki tellik etüt, triole.", "Yakın şekilleri seçmek, 'ses yürütme' (voice leading) denen düzenleme ilkesidir.", "", 2),
    ders("On Altılık", 55, six(55, etude2.flatMap(([s, u]) => Array.from({ length: 4 }, () => u4(s, u)).flat()), END), "On altılık döngüyle.", "Tel değişiminde gürültüyü sustur.", "", 3),
    ders("Hedef Tempo", 80, six(80, etude2.flatMap(([s, u]) => Array.from({ length: 4 }, () => u4(s, u)).flat()), END), "Kursun son dersi.", "Bunu temiz çalabiliyorsan tapping'in temellerine hakimsin.", "", 3),
  ]),
]);

export const tappingCourse: Course = {
  slug: "tapping",
  title: "Tapping",
  description: "Sağ elle sapa vurarak geniş aralıklı hızlı cümleler.",
  kind: "technique",
  icon: "☝",
  guide: [
    "## Tapping nedir?",
    "Sağ elin bir parmağıyla sapa vurarak nota çalmak. Tap'lenen nota sol elin notalarına pull-off ile bağlanır; böylece tek telde, elin erişemeyeceği genişlikte arpejler çalınır.",
    "## Nasıl çalışılır?",
    "Tapping'in en büyük sorunu gürültüdür: kullanılmayan teller titreşir. Sol elin boştaki parmakları ve sağ elin avuç içi telleri susturmalı. Tap yapan parmak, pull-off yaparken teli hafifçe aşağı çekmeli; sadece kaldırırsa nota sönük çıkar.",
    "## Kurs planı",
    "Bölüm 1 – Temeller: tap – pull – hammer, on altılık döngü, akor değişimi.",
    "Bölüm 2 – Tek telde melodi.",
    "Bölüm 3 – Tel değiştirme ve tel atlama.",
    "Bölüm 4 – Genişletilmiş tapping: iki tap notası, 7'li akorlar.",
    "Bölüm 5 – Etütler.",
  ],
  sections: [s1, s2, s3, s4, s5],
};
