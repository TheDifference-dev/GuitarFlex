// Kromatik Isınma (W5, 24.11.2026) — orta–ileri düzey ısınma kütüphanesi: her tipten ısınma egzersizi, hepsi tablı ve
// metronomla. Günlük Rutin'in (src/content/rutin.ts) bütün blokları bu kursun derslerini çalar.
// Eski (L1–L3) kurs: ./kromatik-eski.ts (yalnız arşivdeki rehberler için).
//
// Kaynaklardan alınan ilkeler (metin kopyalanmadı; düzen ve egzersizler özgün):
//  • Guitar World "Three steps to shred" (≈15 dk): sağ el, sol el (HO/PO çiftleri), iki elin eşzamanlılığı; tempo en yavaş
//    tel geçişine göre seçilir.
//  • Guitar Player "Warm-Up Time" ve Guitar World "Gus G warm-ups": permütasyon / çift geri dönüş, tel atlama, pedal ve
//    arpej, sweep ve tel başına üç nota legato; zayıf parmak gruplarını bulup onlarla başlamak.
//  • JustinGuitar (parmak egzersizleri): gevşek kal, ağrıda dur, esnemeyi yavaş ve ısındıktan sonra yap.
//  • Music Theory for Guitar (T. Zillio): ısınma "kafasız" olmasın — dört bölümün sonuncusu müzikal (gam, arpej, akor).
import type { Course, Tags } from "../types.ts";
import { fx, strokes, tex } from "../tex.ts";
import { OPEN, SCALE, between, groups, inPosition, measures, perString, run, tabs, thirds, upDown, economyMarks, type Pos } from "../dizi.ts";
import { chapter, etiketle, section, type LessonInput } from "./ortak.ts";

const P = "kr2";
const UP = [6, 5, 4, 3, 2, 1];
const DOWN = [1, 2, 3, 4, 5, 6];

/** Parmak sırası ("1324") her telde; 1. parmak `pos` perdesinde. "5" = serçe bir perde öteye uzanır (esneme). */
const perm = (order: string, pos: number, strings = UP) => strings.flatMap((s) => [...order].map((d) => `${pos + Number(d) - 1}.${s}`));
const ters = (order: string) => [...order].reverse().join("");
/** Çık (verilen sırayla) ve in (ters sırayla) */
const cikIn = (order: string, pos: number) => [...perm(order, pos, UP), ...perm(ters(order), pos, DOWN)];

const s16 = (notes: string[]) => measures(":16", strokes(notes), 16);
const t8 = (notes: string[]) => measures(":8", strokes(notes), 12, 3);
const x16 = (notes: string[]) => measures(":16", strokes(notes), 24, 3);
const e8 = (notes: string[]) => measures(":8", strokes(notes), 8);
/** Son ölçü: kök notada birlik (dinlen, sonraki tura hazırlan) */
const son = (n: string) => `:1 ${n}`;

type Ders = { title: string; bpm: number; bpmRange: [number, number]; bars: string[]; description: string; tips: string[]; theory?: string[]; minutes?: number };
const ders = (d: Ders): LessonInput => ({
  title: d.title,
  bpm: d.bpm,
  bpmRange: d.bpmRange,
  minutes: d.minutes ?? 2,
  tex: tex(d.bpm, d.bars),
  description: d.description,
  tips: d.tips,
  theory: d.theory ?? [],
});

const METRONOM = "Metronom açık: önce önerilen aralığın altında temiz çal, her tur 4–6 BPM artır; hata başlayınca bir basamak geri dön.";

// ── Bölüm 1: Sol el — kromatik ve parmak bağımsızlığı ────────────────────────
const ZOR = ["1324", "1423", "2413", "3142", "1432", "2143"];
/** Çift geri dönüş: her telde 1-2-3-4-3-2 (çıkış), 4-3-2-1-2-3 (iniş) — altılık */
const geriDonus = (pos: number) => [
  ...UP.flatMap((s) => [0, 1, 2, 3, 2, 1].map((d) => `${pos + d}.${s}`)),
  ...DOWN.flatMap((s) => [3, 2, 1, 0, 1, 2].map((d) => `${pos + d}.${s}`)),
];
/** Tırmanan örümcek: tel çiftinde 1 alt tel, 2 üst tel, 3 alt, 4 üst; her vuruşta bir perde yukarı */
const orumcek = (alt: number, ust: number, pos: number, capraz = false) =>
  capraz ? [`${pos}.${alt}`, `${pos + 2}.${alt}`, `${pos + 1}.${ust}`, `${pos + 3}.${ust}`] : [`${pos}.${alt}`, `${pos + 1}.${ust}`, `${pos + 2}.${alt}`, `${pos + 3}.${ust}`];
const ciftler: [number, number][] = [[6, 5], [5, 4], [4, 3], [3, 2]];
const ciftlerIn: [number, number][] = [[2, 1], [3, 2], [4, 3], [5, 4]];
const orumcekTuru = (pos: number, capraz = false) => [
  ...ciftler.flatMap(([a, u]) => orumcek(a, u, pos, capraz)),
  ...ciftlerIn.flatMap(([a, u]) => orumcek(a, u, pos, capraz).reverse()),
];
/** Diyagonal merdiven: her yeni tel bir perde yukarıda başlar (çıkış), aynı yoldan iniş */
const diyagonal = (bas: number, kayma = 1, n = 4) => {
  const cik = UP.flatMap((s, i) => Array.from({ length: n }, (_, d) => `${bas + i * kayma + d}.${s}`));
  return [...cik, ...[...cik].reverse()];
};

const s1 = section(1, "Sol El: Kromatik ve Bağımsızlık", [
  chapter(P, 1, 0, "Permütasyon Setleri", [
    "Dört parmağın 24 sırası (permütasyon) vardır. 1-2-3-4'ü bilen bir elin zayıf yeri, komşu olmayan parmakların art arda geldiği sıralardır (1-3, 2-4, 1-4).",
    "Kromatik dizi 12 yarım sesin hepsidir; müzikal değil mekaniktir. Bu yüzden ısınmanın yalnız ilk dakikalarını kaplar, sonra müzikal ısınmaya geçilir (Bölüm 4).",
  ], [
    ders({
      title: "Altı Zor Permütasyon", bpm: 80, bpmRange: [60, 120],
      bars: ZOR.flatMap((o) => s16(cikIn(o, 5))),
      description: "1-3-2-4, 1-4-2-3, 2-4-1-3, 3-1-4-2, 1-4-3-2, 2-1-4-3: her biri 5. pozisyonda altı telde çıkış ve ters sırayla iniş, on altılık.",
      tips: [METRONOM, "Hangi permütasyonda takılıyorsan ertesi gün onunla başla.", "Parmaklar telin üstünde, perdeye yakın dursun: kalkan parmak 1 cm'den fazla uzaklaşmasın."],
      theory: ["Her permütasyon üç ölçü: altı tel × dört nota çıkış, aynı sayıda iniş. Vuruşun ilk notası her zaman aşağı pena."],
      minutes: 3,
    }),
    ders({
      title: "Çift Geri Dönüş", bpm: 60, bpmRange: [50, 96],
      bars: [...x16(geriDonus(5)), ...x16(geriDonus(7))],
      description: "Her telde 1-2-3-4-3-2 (çıkış) ve 4-3-2-1-2-3 (iniş): altılık, bir vuruşta bir tel. 5. pozisyon, sonra 7. pozisyon.",
      tips: [METRONOM, "Altılıkta vurgu her telin ilk notasında: vuruşu ayağınla say.", "Dönüş notası (3 → 2) çekilmez, basılı kalan parmağın üstüne düşer."],
      theory: ["Altılık (16'lık triole): bir vuruşa altı nota. On altılıktan 1,5 kat yoğundur; tempo düşük tutulur."],
    }),
    ders({
      title: "Dört Nota, Üç Vuruş", bpm: 90, bpmRange: [70, 140],
      bars: [...t8(cikIn("1234", 5)), ...t8(cikIn("1324", 7))],
      description: "Dört notalık parmak grubu sekizlik triole ile: grup her vuruşta bir nota kayar, vurgu sırayla 1., 4., 3., 2. parmağa düşer.",
      tips: [METRONOM, "Gözünü tabdan çek: grup dört nota, vuruş üç nota. Kulak vuruşu, el grubu takip eder.", "Önce yalnız ilk iki ölçüyü döngüye al."],
      theory: ["Ritim kaydırma (displacement): aynı kalıp farklı bir alt bölünmede çalınınca vurgular kayar. Solo cümlelerinde 'dörtlü grup, üçlü vuruş' sık kullanılır."],
    }),
  ]),
  chapter(P, 1, 1, "Örümcek", [
    "Örümcekte parmaklar komşu iki telde çapraz yürür: 1 ve 3 bir telde, 2 ve 4 öbür telde. Her parmak kendi perdesinde kalır, bir sonraki notaya kadar kalkmaz.",
  ], [
    ders({
      title: "Tırmanan Örümcek", bpm: 70, bpmRange: [60, 110],
      bars: [5, 6, 7, 8].flatMap((p) => s16(orumcekTuru(p))),
      description: "Tel çiftlerinde 1 (alt) – 2 (üst) – 3 (alt) – 4 (üst); çıkışta 6-5'ten 3-2'ye, inişte 2-1'den 5-4'e. Her turda el bir perde yukarı kayar.",
      tips: [METRONOM, "Basılı kalan parmağı kaldırma: tel çiftinde aynı anda iki parmak basılıdır.", "Tel değişimi sol elde bir 'adım'; sağ el aşağı-yukarı salınmayı bozmaz."],
      theory: ["İki tel arasında gidip gelmek sağ elin tel geçişini de her notada çalıştırır: dört notanın dördü de farklı tel geçişi."],
    }),
    ders({
      title: "Çapraz Örümcek", bpm: 70, bpmRange: [60, 110],
      bars: [7, 6, 5, 4].flatMap((p) => s16(orumcekTuru(p, true))),
      description: "Çapraz dizilim: 1 ve 3 alt telde art arda, sonra 2 ve 4 üst telde. Tur tur bir perde aşağı iner (7 → 4).",
      tips: [METRONOM, "2. parmak üst tele geçerken 1 ve 3 basılı kalır: el 'ağ' gibi açılır.", "Gerginlik başlarsa önce tempoyu değil, parmak yüksekliğini düzelt."],
    }),
  ]),
  chapter(P, 1, 2, "Diyagonal Kromatik", [
    "Diyagonal (çapraz) kalıpta her yeni tel bir ya da iki perde yukarıda başlar: el sap boyunca kayarken parmaklar kromatik dizilimi korur. Pozisyon kaydırmayı ve kromatiği birleştirir.",
  ], [
    ders({
      title: "Diyagonal Merdiven", bpm: 70, bpmRange: [60, 110],
      bars: [...s16(diyagonal(1)), ...s16(diyagonal(3)), ...s16(diyagonal(5)), son("5.6")],
      description: "Kalın Mi 1–4, La 2–5 … ince Mi 6–9; tepeden aynı yoldan iniş. Üç tur: 1., 3. ve 5. perdeden başlayarak.",
      tips: [METRONOM, "Kaymayı işaret parmağı yönetir: yeni teldeki ilk nota bir perde önde.", "Çıkışta başparmak da kayar; el sabit kalıp parmak uzanmaz."],
    }),
    ders({
      title: "Diyagonal Triole", bpm: 80, bpmRange: [60, 120],
      bars: [...t8(diyagonal(5, 2, 3)), ...t8(diyagonal(3, 2, 3)), son("3.6")],
      description: "Üç parmak (1-2-3), her yeni tel iki perde yukarıda: sekizlik triole ile bir vuruşta bir tel.",
      tips: [METRONOM, "Her tel bir vuruş: telin ilk notası vuruşun üstüne.", "İki perdelik kayma sesi kesmesin: son nota bitmeden el yola çıkar."],
      theory: ["Triole (üçleme): bir vuruşa üç eşit nota. Tel başına üç nota olunca tel geçişi her vuruşa düşer."],
    }),
  ]),
  chapter(P, 1, 3, "Esneme", [
    "Beş perdelik açıklık (1-2-3-5): serçe parmak bir perde öteye uzanır. Esneme kasları ısındıktan sonra, yüksek perdelerden (dar) başlayıp aşağı (geniş) doğru yapılır.",
  ], [
    ders({
      title: "Beş Perde Açıklık", bpm: 70, bpmRange: [50, 100],
      bars: [12, 9, 7, 5].flatMap((p) => e8(cikIn("1235", p))),
      description: "1-2-3-5 parmak dizilimi: çıkışta 12. pozisyonda, sonra 9., 7. ve 5. pozisyonda. Sekizlik.",
      tips: ["Ağrı ya da yanma hissedersen dur, eli salla, bir sonraki gün daha yüksek pozisyonda başla.", "Başparmak sapın arkasında aşağı iner; bilek kırılmaz.", METRONOM],
      minutes: 2,
    }),
  ]),
]);

// ── Bölüm 2: Sağ el — pena ısınmaları ────────────────────────────────────────
/** Hız merdiveni: aynı nota sekizlik (2), triole (3), on altılık (4), altılık (6): bir ölçü, her alt bölünme bir vuruş */
const merdiven = (n: string) => {
  const p = (xs: string[]) => strokes(xs).join(" ");
  const tr = (xs: string[]) => strokes(xs).map((x) => fx(x, "tu 3")).join(" ");
  return `:8 ${p([n, n])} :8 ${tr([n, n, n])} :16 ${p([n, n, n, n])} :16 ${tr([n, n, n, n, n, n])}`;
};
/** La minör pentatonik, kutu 1 (5. pozisyon), çıkış ve iniş */
const PENTA = tabs(inPosition(between(45, SCALE.minorPenta, 45, 72), 5, 8));
/** İki tel kromatik: tel başına 4 nota (iç pena) ya da 3 nota (dış pena) */
const ikiTel = (alt: number, ust: number, pos: number, n: number) => [
  ...Array.from({ length: n }, (_, i) => `${pos + i}.${alt}`),
  ...Array.from({ length: n }, (_, i) => `${pos + i}.${ust}`),
];
/** Tel atlama: kalın telde iki nota, iki tel ötede iki nota (oktav çifti), kromatik */
const atla = (alt: number, pos: number) => [`${pos}.${alt}`, `${pos + 1}.${alt}`, `${pos + 2}.${alt - 2}`, `${pos + 3}.${alt - 2}`];
/** Arpej tel atlama hücresi: 4. tel – 2. tel – 1. tel – 2. tel (3. tel atlanır) */
const hucre = (d4: number, d2: number, d1: number) => [`${d4}.4`, `${d2}.2`, `${d1}.1`, `${d2}.2`];
const atlamaOlcusu = (d4: number, d2: number, d1: number) => s16([0, 1, 2, 3].flatMap(() => hucre(d4, d2, d1)))[0];

/** La doğal minör ve Do majör, tel başına üç nota */
const AM3 = perString(run(45, SCALE.minor, 18), 3);
const AM3_YUKSEK = perString(run(57, SCALE.minor, 15), 3, 5);
/** Üç tel sweep (3-2-1. teller): aşağı süpür, tepede hammer-on / pull-off, yukarı süpür; 16'lık, iki vuruşta bir döngü */
const sweep3 = (f3: number, f2: number, f1: number, tepe: number) =>
  `:16 ${f3}.3{sd} ${f2}.2{sd} ${f1}.1{sd h} ${tepe}.1{h} ${f1}.1 ${f2}.2{su} ${f3}.3{su} ${f2}.2{sd} ${f3}.3{su} ${f2}.2{sd} ${f1}.1{sd h} ${tepe}.1{h} ${f1}.1 ${f2}.2{su} ${f3}.3{su} ${f2}.2{sd}`;
/** Hybrid hücre (sekizlik triole): pena kalın teli, orta parmak (m) 2. teli, yüzük parmağı (a) 1. teli çalar */
const hybrid = (b: string, m: string, a: string, ters = false) => {
  const h = [`${b}{sd tu 3}`, `${m}{rf 3 tu 3}`, `${a}{rf 4 tu 3}`];
  return ters ? [h[0], `${a}{rf 4 tu 3}`, `${m}{rf 3 tu 3}`] : h;
};
const hybridOlcu = (b: string, m: string, a: string, ters = false) => `:8 ${[0, 1, 2, 3].flatMap(() => hybrid(b, m, a, ters)).join(" ")}`;
/** Palm mute aksan kalıbı: 16'lık; aksanlar (3+3+2 / 3+3+4+2+4) açık güç akoru, diğerleri susturulmuş kalın Mi */
const AKSAN = [0, 3, 6, 10, 12];
const pmOlcu = (akor: string, pedal = "0.6") => `:16 ${Array.from({ length: 16 }, (_, i) => (AKSAN.includes(i) ? `${akor}{sd}` : `${pedal}{pm ${i % 2 ? "su" : "sd"}}`)).join(" ")}`;

const s2 = section(2, "Sağ El: Pena Isınmaları", [
  chapter(P, 2, 0, "Alternate Pena", [
    "Alternate pena: aşağı ve yukarı vuruş sırayla; el ritimle birlikte hiç durmadan salınır. Isınmada önce tek telde hareketin eşitliği, sonra tel geçişleri çalışılır.",
  ], [
    ders({
      title: "Hız Merdiveni", bpm: 70, bpmRange: [60, 110],
      bars: [...PENTA.map(merdiven), son("5.6")],
      description: "Her ölçüde aynı nota: bir vuruş sekizlik, bir vuruş triole, bir vuruş on altılık, bir vuruş altılık. Notalar La minör pentatonik kutu 1'de çıkar.",
      tips: [METRONOM, "Triolede vuruş başı sırayla aşağı ve yukarı penaya düşer: el yönü değil ritmi takip eder.", "Altılıkta bilek gevşek; omuz ve dirsek kımıldamaz."],
      theory: ["Alt bölünmeler: sekizlik 2, triole 3, on altılık 4, altılık 6 nota/vuruş. Tempo sabit kalırken nota yoğunluğu artar."],
      minutes: 2,
    }),
    ders({
      title: "İç ve Dış Pena", bpm: 70, bpmRange: [60, 120],
      bars: [
        ...s16([[3, 2], [4, 3], [5, 4], [6, 5]].flatMap(([k, i]) => ikiTel(k, i, 5, 4))),
        ...s16([[3, 2], [4, 3], [5, 4], [6, 5]].flatMap(([k, i]) => ikiTel(k, i, 7, 4))),
        ...t8([[3, 2], [2, 1], [4, 3], [3, 2]].flatMap(([k, i]) => ikiTel(k, i, 5, 3))),
        ...t8([[3, 2], [2, 1], [4, 3], [3, 2]].flatMap(([k, i]) => ikiTel(k, i, 7, 3))),
      ],
      description: "İki tel kromatik: önce tel başına 4 nota (on altılık, her tel geçişi iç pena), sonra tel başına 3 nota (triole, her geçiş dış pena).",
      tips: [METRONOM, "İç pena: kalın tel yukarı, ince tel aşağı vuruş — pena iki telin arasında kalır. Dış pena: kalın tel aşağı, ince tel yukarı — pena telleri dışarıdan dolaşır.", "Hangisi zorsa onu döngüye al: zayıf geçişi bulmak ısınmanın amacı."],
      theory: ["Tel başına çift sayıda nota (4) iç pena, tek sayıda nota (3) dış pena geçişleri üretir."],
    }),
  ]),
  chapter(P, 2, 1, "Tel Atlama", [
    "Tel atlamada pena bir teli atlar: sağ el hedefi 'görmeden' bulmalı, atlanan tel sol elin boşta kalan parmağıyla susturulur. Oktav ve arpej kalıplarında sık kullanılır.",
  ], [
    ders({
      title: "Kromatik Tel Atlama", bpm: 70, bpmRange: [60, 110],
      bars: [...s16([6, 5, 4, 3].flatMap((s) => [...atla(s, 5), ...atla(s, 6)])), ...s16([3, 4, 5, 6].flatMap((s) => [...atla(s, 7), ...atla(s, 6)].reverse())), son("5.6")],
      description: "1-2 parmak kalın telde, 3-4 parmak iki tel ötede (6–4, 5–3, 4–2, 3–1). Çıkış 5. ve 6. perdede, iniş geriye doğru.",
      tips: [METRONOM, "Atlanan tel çalmamalı: 1. parmağın ucu ona hafifçe değer.", "Pena atlarken kavis çizmez, kısa ve düz gider."],
    }),
    ders({
      title: "Arpej Tel Atlama", bpm: 80, bpmRange: [60, 120],
      bars: [
        ...[0, 1].flatMap(() => [atlamaOlcusu(7, 5, 8), atlamaOlcusu(7, 6, 8), atlamaOlcusu(5, 5, 8), atlamaOlcusu(9, 8, 7)]),
        son("(7.4 5.2 8.1)"),
      ],
      description: "Am – F – C – G (vi – IV – I – V): 4. tel – 2. tel – 1. tel – 2. tel hücresi, 3. tel atlanır. Akorlar ses yürütmeyle yakın çevrimlerde.",
      tips: [METRONOM, "Aşağı (4. tel) – yukarı (2.) – aşağı (1.) – yukarı (2.): her vuruşta iki tel atlaması.", "Am → F'de yalnız 2. teldeki parmak bir perde kayar."],
      theory: ["Am = La–Do–Mi, F/A = La–Fa–Do (1. çevrim), C/G = Sol–Mi–Do (2. çevrim), G/B = Si–Sol–Si. Çevrimler akorları birbirine en yakın notalarla bağlar."],
    }),
  ]),
  chapter(P, 2, 2, "Economy ve Sweep", [
    "Economy pena: aynı telde alternate, tel değiştirirken pena gidilen tele doğru süpürülür (ince tele aşağı, kalın tele yukarı). Sweep bunun arpejdeki hâlidir: her telde bir nota, tek yönlü süpürme.",
  ], [
    ders({
      title: "Economy: Tel Başına Üç Nota", bpm: 80, bpmRange: [60, 130],
      bars: [...measures(":8", economyMarks(upDown(AM3)), 12, 3), ...measures(":8", economyMarks(upDown(AM3_YUKSEK)), 12, 3)],
      description: "La doğal minör, tel başına üç nota: çıkışta her telin ilk notası önceki telin son aşağı vuruşunun devamı (süpürme). Önce 5., sonra 12. pozisyonda.",
      tips: [METRONOM, "Süpürmede iki aşağı vuruş tek harekettir: pena ikinci telde durur, 'zıplamaz'.", "İnişte süpürme yukarı yöndedir."],
      theory: ["La doğal minör: La – Si – Do – Re – Mi – Fa – Sol. Tel başına üç nota, yedi pozisyonun her birinde aynı parmak düzenini verir."],
    }),
    ders({
      title: "Üç Tel Sweep", bpm: 70, bpmRange: [60, 110],
      bars: [sweep3(5, 5, 5, 8), sweep3(5, 6, 5, 8), sweep3(9, 8, 8, 12), sweep3(7, 8, 7, 10), sweep3(5, 5, 5, 8), sweep3(5, 6, 5, 8), sweep3(9, 8, 8, 12), sweep3(7, 8, 7, 10), son("(5.3 5.2 5.1)")],
      description: "Am – F – C – G, 3-2-1. tellerde üçlü arpejler: aşağı süpür, tepede hammer-on ve pull-off, yukarı süpür. On altılık.",
      tips: [METRONOM, "Her nota ayrı çınlamalı: çalınan notanın parmağı bir sonraki telde kalkar (yuvarlama).", "Süpürme bir hareket, pena her telde 'durmaz'."],
      theory: ["Am (Do–Mi–La, 1. çevrim), F/C (Do–Fa–La), C (Mi–Sol–Do), G (Re–Sol–Si): tepe notalar Do, Do, Mi, Re."],
    }),
  ]),
  chapter(P, 2, 3, "Hybrid ve Palm Mute", [
    "Hybrid picking: pena kalın telleri, orta (m) ve yüzük (a) parmakları ince telleri çalar. Palm mute: avuç kenarı köprünün hemen önünde, teller boğuk çınlar; aksanlı vuruşta el kalkar.",
  ], [
    ders({
      title: "Hybrid Üçlüler", bpm: 80, bpmRange: [60, 120],
      bars: [
        hybridOlcu("7.4", "5.2", "5.1"), hybridOlcu("5.4", "3.2", "3.1"), hybridOlcu("3.4", "1.2", "1.1"), hybridOlcu("2.4", "0.2", "0.1"),
        hybridOlcu("7.4", "5.2", "5.1", true), hybridOlcu("5.4", "3.2", "3.1", true), hybridOlcu("3.4", "1.2", "1.1", true), hybridOlcu("2.4", "0.2", "0.1", true),
        son("(7.4 5.2 5.1)"),
      ],
      description: "Am – G – F – E (Endülüs kadansı): pena 4. teli, orta parmak 2. teli, yüzük parmağı 1. teli çalar; ikinci turda parmak sırası ters (a – m).",
      tips: [METRONOM, "Parmaklar teli yukarı çekmez, avuca doğru kıvrılır; ses pena kadar güçlü olsun.", "Pena hep aşağı vurur: sağ elin tek hareketi."],
      theory: ["Endülüs kadansı: i – VII – VI – V (La minörde Am – G – F – E). Bas La – Sol – Fa – Mi diye iner; E majör La'ya güçlü bir dönüş hazırlar."],
    }),
    ders({
      title: "Palm Mute Aksanları", bpm: 90, bpmRange: [70, 140],
      bars: [pmOlcu("(0.6 2.5 2.4)"), pmOlcu("(0.6 2.5 2.4)"), pmOlcu("(3.6 5.5 5.4)", "3.6"), pmOlcu("(1.6 3.5 3.4)", "1.6"), pmOlcu("(0.6 2.5 2.4)"), pmOlcu("(0.6 2.5 2.4)"), pmOlcu("(5.6 7.5 7.4)", "5.6"), pmOlcu("(3.6 5.5 5.4)", "3.6"), son("(0.6 2.5 2.4)")],
      description: "On altılık susturulmuş kalın Mi; 1., 4., 7., 11. ve 13. on altılıkta açık güç akoru (E5, G5, F5, A5).",
      tips: [METRONOM, "Ton: crunch / overdrive. Aksanda avuç kalkar, hemen geri iner.", "Susturulmuş notalar eşit ve kısa: pena hep aşağı-yukarı salınır."],
      theory: ["Aksanlar 3 + 3 + 4 + 2 + 4 on altılık gruplar: metal ve funk riflerinde sık görülen 'senkop' dağılım."],
    }),
  ]),
]);

// ── Bölüm 3: Legato ve ifade ─────────────────────────────────────────────────
/** Parmak çiftiyle kesintisiz HO/PO: 3. telde, ilk nota çalınır, ölçü boyunca bağlı */
const cift = (a: number, b: number) => `:16 ${Array.from({ length: 16 }, (_, i) => {
  const f = i % 2 ? b : a;
  const n = `${f}.3`;
  return i === 0 ? `${n}{sd h}` : i < 15 ? `${n}{h}` : n;
}).join(" ")}`;
/** Tel başına üç nota legato: telin ilk notası çalınır, diğerleri hammer-on (çıkış) / pull-off (iniş) */
const legato3 = (ps: Pos[]) =>
  ps.map((p, i) => {
    const prev = ps[i - 1];
    const next = ps[i + 1];
    const e: string[] = [];
    if (!prev || prev.s !== p.s) e.push(prev && p.m < prev.m ? "su" : "sd");
    if (next && next.s === p.s && next.f !== p.f) e.push("h");
    return `${p.f}.${p.s}${e.length ? `{${e.join(" ")}}` : ""}`;
  });
/** Tapping üçlüsü (triole): sağ el tap, pull-off sol el 1. parmağa, hammer-on üst notaya */
const tap = (s: number, t: number, a: number, b: number) => [`${t}.${s}{tt h tu 3}`, `${a}.${s}{h tu 3}`, `${b}.${s}{tu 3}`];
const tapOlcu = (s: number, t: number, a: number, b: number) => `:8 ${[0, 1, 2, 3].flatMap(() => tap(s, t, a, b)).join(" ")}`;

const s3 = section(3, "Legato ve İfade", [
  chapter(P, 3, 0, "Legato ve Tapping", [
    "Legato: ilk nota çalınır, sonrakiler sol elin hammer-on (çekiçleme) ve pull-off (çekme) hareketiyle. Pull-off teli hafifçe yana çekip bırakır; yalnız kaldırmak sesi öldürür.",
  ], [
    ders({
      title: "Parmak Çiftleri", bpm: 80, bpmRange: [60, 120],
      bars: [cift(5, 6), cift(5, 7), cift(5, 8), cift(6, 7), cift(6, 8), cift(7, 8), son("5.3")],
      description: "Sol telde kesintisiz hammer-on / pull-off: 1-2, 1-3, 1-4, 2-3, 2-4, 3-4 parmak çiftleri, her çift bir ölçü. Pena yalnız ölçünün ilk notasında.",
      tips: [METRONOM, "Ses seviyesi ölçü boyunca düşmesin: her pull-off bir sonraki notayı 'çalar'.", "Yanma hissedersen eli bir ölçü dinlendir; çiftlerin sırası zordan kolaya da çalınabilir."],
      theory: ["Sol elin gücü ve dayanıklılığı: aynı iki perde arasında 16 bağlı nota. Pena kullanılmadığı için ses ve ritim tamamen sol eldedir."],
    }),
    ders({
      title: "Tel Başına Üç Nota Legato", bpm: 70, bpmRange: [60, 110],
      bars: [...measures(":8", legato3(upDown(AM3)), 12, 3), ...measures(":8", legato3(upDown(AM3_YUKSEK)), 12, 3)],
      description: "La doğal minör, tel başına üç nota: çıkışta hammer-on, inişte pull-off; yalnız her telin ilk notası çalınır. 5. ve 12. pozisyon.",
      tips: [METRONOM, "Hammer-on parmak ucunun 'çekiç' gibi perdeye inmesi: hız değil isabet.", "Tel değişiminde pena notası legato notalarından yüksek çıkmasın: dinamik eşit."],
    }),
    ders({
      title: "Tapping Üçlüleri", bpm: 80, bpmRange: [60, 120],
      bars: [tapOlcu(1, 12, 5, 8), tapOlcu(1, 13, 5, 8), tapOlcu(1, 15, 7, 10), tapOlcu(1, 12, 5, 8), tapOlcu(2, 17, 10, 13), tapOlcu(2, 18, 10, 13), tapOlcu(2, 17, 8, 12), son("5.1")],
      description: "Tap – pull-off – hammer-on üçlüsü, sekizlik triole: Am (12-5-8), F (13-5-8), G (15-7-10) ince Mi telinde, sonra Si telinde Am – F – Em.",
      tips: [METRONOM, "Sağ el orta ya da işaret parmağıyla tap: parmak teli yana çekerek kalkar (pull-off).", "Çalmayan teller sol elin avucu ve sağ elin kenarıyla susturulur."],
      theory: ["İnce Mi telinde 12-5-8 = Mi – La – Do (Am), 13-5-8 = Fa – La – Do (F), 15-7-10 = Sol – Si – Re (G). Si telinde 17-10-13 = Mi – La – Do."],
    }),
  ]),
  chapter(P, 3, 1, "Bend, Vibrato ve Slide", [
    "Bend'de hedef notayı önce perdede çal, sonra bir alttaki notayı ona kadar it: kulak hedefi bilir. Vibrato ritimli olmalı (ör. sekizlik ya da triole hızında), bend'in küçük hâlidir.",
  ], [
    ders({
      title: "Hedef Notaya Bend", bpm: 70, bpmRange: [60, 100],
      bars: [
        ":4 9.3{sd} 7.3{b (0 4) sd} 9.3{sd} 7.3{b (0 4) sd}",
        ":4 10.2{sd} 8.2{b (0 4) sd} 10.2{sd} 8.2{b (0 4) sd}",
        ":4 8.1{sd} 7.1{b (0 2) sd} 8.1{sd} 7.1{b (0 2) sd}",
        ":4 10.1{sd} 8.1{b (0 4) sd} 10.1{sd} 8.1{b (0 4) sd}",
        ":4 7.3{b (0 4 0) sd} 5.3 8.2{b (0 4 0) sd} 5.2",
        ":4 8.1{b (0 4 0) sd} 5.1 10.2{b (0 2 0) sd} 8.2",
        ":2 7.3{b (4 4 0) sd} 5.3{v}",
        ":2 8.2{b (0 4) sd} 5.1{v}",
        son("5.1{v}"),
      ],
      description: "Önce hedef nota, sonra bend: Re → Mi (G teli 7, tam ses), Sol → La (Si teli 8), Si → Do (ince Mi 7, yarım ses), Do → Re. Sonra bend ve bırakma, ön bend.",
      tips: [METRONOM, "Bend'i 2–3 parmakla birlikte it; bilek döner, parmak tek başına itmez.", "Hedefi aşma: bend'in tepesi ile perdedeki referans aynı perdede duyulmalı."],
      theory: ["Tam ses bend = iki perde (4 çeyrek ses), yarım ses = bir perde. La minör pentatonikte Re → Mi ve Sol → La tam ses; Si → Do (doğal minör) yarım ses."],
    }),
    ders({
      title: "Vibrato ve Slide", bpm: 70, bpmRange: [60, 100],
      bars: [
        ":4 5.3{sd sl} 7.3{v} 5.2{sd sl} 8.2{v}",
        ":4 7.3{sd sl} 9.3{v} 8.2{sd sl} 10.2{v}",
        ":4 10.2{sd sl} 13.2{v} 12.1{sd sl} 15.1{v}",
        ":4 15.1{sd sl} 17.1{v} :2 15.1{b (0 4) v sd}",
        ":4 17.1{sd sl} 15.1{v} 13.2{sd sl} 10.2{v}",
        ":4 9.3{sd sl} 7.3{v} 7.4{sd sl} 5.4{v}",
        ":2 7.3{b (0 4) v sd} 5.3{v}",
        son("7.4{v}"),
      ],
      description: "La minör pentatonikte pozisyon bağlayan slide'lar (kutu 1 → 12–17. perdeler) ve her varış notasında dörtlük vibrato; tepede Sol → La bend.",
      tips: [METRONOM, "Vibrato hızı metronomla: dörtlük notada iki sekizlik dalga ya da üç triole dalga.", "Slide sırasında parmak baskısı azalmaz; varış notası yeniden çalınmaz."],
      theory: ["Kutu 1 (5. perde) ve kutu 5 (12. perde) La minör pentatoniğin iki ucu: aynı notalar (La – Do – Re – Mi – Sol) sapın farklı yerinde."],
    }),
  ]),
]);

// ── Bölüm 4: Müzikal ısınma — gam, arpej, akor ───────────────────────────────
const DO3 = perString(run(48, SCALE.major, 18), 3);
const PENTA_UCLU = tabs(thirds(inPosition(between(45, SCALE.minorPenta, 45, 72), 5, 8)));
/** Yedili arpej, iki tur 1 – 3 – 5 – 7 çıkış ve aynı yoldan iniş (tepe iki kez): bir ölçü on altılık */
const arpej = (cik: string[]) => s16([...cik, ...[...cik].reverse()]);
const DM7 = ["5.5", "8.5", "7.4", "5.3", "7.3", "6.2", "5.1", "8.1"]; // Re Fa La Do Re Fa La Do
const G7 = ["3.6", "2.5", "5.5", "3.4", "5.4", "4.3", "3.2", "6.2"]; // Sol Si Re Fa Sol Si Re Fa
const CMAJ7 = ["3.5", "2.4", "5.4", "4.3", "5.3", "5.2", "8.2", "7.1"]; // Do Mi Sol Si Do Mi Sol Si
/** Akor (pesten tize) dörtlük ya da sekizlik tarama */
const vur = (c: string, kalip: "4" | "2") => (kalip === "4" ? `:4 ${c}{bd} ${c}{bd} ${c}{bu} ${c}{bd}` : `:2 ${c}{bd} ${c}{bd}`);
const C_CAGED = ["(3.5 2.4 0.3 1.2 0.1)", "(3.5 5.4 5.3 5.2 3.1)", "(8.6 7.5 5.4 5.3 5.2 8.1)", "(8.6 10.5 10.4 9.3 8.2 8.1)", "(10.4 12.3 13.2 12.1)"];
/** Funk 16'lık: E9 (7.5 6.4 7.3 7.2) aksanlarda, diğer on altılıklar susturulmuş tarama; el hep salınır */
const E9 = "(7.5 6.4 7.3 7.2)";
const SUS = "(x.5 x.4 x.3 x.2)";
const funk = (aksan: number[], akor = E9) => `:16 ${Array.from({ length: 16 }, (_, i) => `${aksan.includes(i) ? akor : SUS}{${i % 2 ? "bu" : "bd"}}`).join(" ")}`;

const s4 = section(4, "Müzikal Isınma: Gam, Arpej, Akor", [
  chapter(P, 4, 0, "Gam Isınması", [
    "Sekans: gamı düz çıkmak yerine gruplar hâlinde (1-2-3, 2-3-4 …) ya da aralıklarla (1-3, 2-4 …) çalmak. Kulağı ve klavye görüşünü ısındırır, solo cümlelerinin ham maddesidir.",
  ], [
    ders({
      title: "Üçlü Gruplar: Do Majör", bpm: 80, bpmRange: [60, 130],
      bars: [...t8(tabs(groups(DO3, 3))), ...t8(tabs(groups([...DO3].reverse(), 3))), son("8.6")],
      description: "Do majör, tel başına üç nota (8. pozisyon): 1-2-3, 2-3-4, 3-4-5 … gruplarıyla çıkış ve iniş, sekizlik triole.",
      tips: [METRONOM, "Her grubun ilk notası vuruşa düşer: grup başlarını hafifçe vurgula.", "Alternate pena; tel geçişlerinin hangisi iç, hangisi dış pena, dinle."],
      theory: ["Do majör: Do – Re – Mi – Fa – Sol – La – Si. Üçlü gruplarla 18 notalık dizi 16 grup (48 nota) olur."],
    }),
    ders({
      title: "Pentatonik Üçlüler", bpm: 90, bpmRange: [70, 140],
      bars: [...e8(PENTA_UCLU), ...e8([...PENTA_UCLU].reverse()), son("5.6")],
      description: "La minör pentatonik kutu 1'de aralık atlamaları (1-3, 2-4, 3-5 …): çıkış ve tersten iniş, sekizlik.",
      tips: [METRONOM, "Aynı perdede komşu tellerdeki iki nota (ör. 5.3 – 5.2) parmak 'yuvarlanarak' çalınır.", "Pena: alternate; tel atlamaları küçük ve kısa."],
    }),
  ]),
  chapter(P, 4, 1, "Arpej Isınması", [
    "Yedili akorların arpejleri (1 – 3 – 5 – 7) pozisyonda: Dm7 – G7 – Cmaj7 (ii – V – I). Kök 5. ve 6. telde dönüşümlü şekillerle el 2.–8. perdelerde kalır, yalnız akor tonları değişir.",
  ], [
    ders({
      title: "ii – V – I Arpejleri", bpm: 80, bpmRange: [60, 120],
      bars: [
        ...arpej(DM7), ...arpej(G7), ...arpej(CMAJ7), ...arpej(CMAJ7),
        ...arpej(DM7), ...arpej(G7), ...arpej(CMAJ7),
        son("(3.5 5.4 4.3 5.2)"),
      ],
      description: "Do majörde Dm7 (kök 5. tel) – G7 (kök 6. tel) – Cmaj7 (kök 5. tel): 2.–8. perdelerde iki tur 1 – 3 – 5 – 7 çıkış ve iniş, on altılık.",
      tips: [METRONOM, "Akor değişiminde ortak notaları dinle: Dm7'nin Fa ve Do'su G7'nin Fa'sı ve Cmaj7'nin Do'su olur.", "Pena: alternate; tepe nota iki kez çalınır, iniş yukarı vuruşla başlar."],
      theory: ["Dm7 = Re – Fa – La – Do, G7 = Sol – Si – Re – Fa, Cmaj7 = Do – Mi – Sol – Si. ii – V – I cazın ve popun temel kadansıdır."],
    }),
  ]),
  chapter(P, 4, 2, "Akor ve Ritim", [
    "Akor ısınması: bir akoru CAGED şekilleriyle sapın beş yerinde, ritmi bozmadan değiştirmek. Ritim ısınması: sağ el on altılık salınımı hiç kesmez, akor yalnız aksanlarda çınlar.",
  ], [
    ders({
      title: "CAGED Akor Geçişi", bpm: 80, bpmRange: [60, 120],
      bars: [...C_CAGED.map((c) => vur(c, "4")), ...[...C_CAGED].reverse().map((c) => vur(c, "4")), ...C_CAGED.map((c) => vur(c, "2")), son(C_CAGED[0])],
      description: "Do majör beş şekilde: C (açık) – A (3. perde) – G (5.) – E (8.) – D (10.) şekilleri, her ölçüde bir şekil; çıkış, iniş, sonra yarım notalarla hızlı geçiş.",
      tips: [METRONOM, "Bir sonraki şekle vuruştan önce var: geçiş son sekizlikte başlar.", "Her şekilde kök notayı (Do) bul: C ve A şeklinde 5. telde, G ve E şeklinde 6. telde, D şeklinde 4. telde."],
      theory: ["CAGED: beş açık akor şekli (C, A, G, E, D) sap boyunca bu sırayla dizilir; her şekil bir öncekinin bittiği yerde başlar."],
    }),
    ders({
      title: "16'lık Funk Tarama", bpm: 85, bpmRange: [70, 110],
      bars: [funk([0, 3, 6, 10]), funk([0, 3, 6, 10]), funk([2, 4, 7, 10, 14]), funk([0, 6, 8, 11, 14]), funk([0, 3, 6, 10]), funk([0, 3, 6, 10], "(5.5 4.4 5.3 5.2)"), funk([2, 4, 7, 10, 14]), funk([0, 3, 6, 12]), son(E9)],
      description: "E9 (x7677x) ile on altılık tarama: el hiç durmadan aşağı-yukarı salınır, akor yalnız aksanlarda çalar, diğer vuruşlar susturulmuş 'çık'.",
      tips: [METRONOM, "Ton: temiz. Susturma sol elde: parmaklar tellerde kalır, basıncı bırakır.", "Aşağı vuruşlar 16'lığın 1. ve 3., yukarı vuruşlar 2. ve 4. notası."],
      theory: ["E9 = Mi – Sol# – Re – Fa# (kök, 3, ♭7, 9; beşli çıkarılmış). Funkta akor dokusu değil ritim öne çıkar."],
    }),
  ]),
]);

// Müfredat etiketleri (Spec v2.2 §4): içerik paketi belgeler/mufredat/seviye-esleme.csv, "YERLESIK/kromatik-isinma" satırları.
const ETIKET: Record<string, Tags> = {
  "1.0": { level: "L3", axes: ["technique", "rhythm"], skills: ["T.chromatic_1234", "R.sextuplet"] }, // Permütasyon Setleri
  "1.1": { level: "L3", axes: ["technique"], skills: ["T.chromatic_1234", "T.alt_pick_cross"] }, // Örümcek
  "1.2": { level: "L3", axes: ["fretboard", "technique"], skills: ["F.diagonal_shift", "T.chromatic_1234"] }, // Diyagonal Kromatik
  "1.3": { level: "L3", axes: ["fretboard"], skills: ["F.stretch"] }, // Esneme
  "2.0": { level: "L4", axes: ["technique", "rhythm"], skills: ["T.inside_outside_pick", "R.mixed_values"] }, // Alternate Pena
  "2.1": { level: "L4", axes: ["technique"], skills: ["T.string_skip", "T.string_skip_arpeggio"] }, // Tel Atlama
  "2.2": { level: "L4", axes: ["technique"], skills: ["T.economy_basic", "T.sweep_small"] }, // Economy ve Sweep
  "2.3": { level: "L3", axes: ["technique", "rhythm"], skills: ["T.hybrid_basic", "T.palm_mute_riff"] }, // Hybrid ve Palm Mute
  "3.0": { level: "L4", axes: ["technique"], skills: ["T.legato_3nps", "T.tapping_single"] }, // Legato ve Tapping
  "3.1": { level: "L3", axes: ["technique"], skills: ["T.bend_full", "T.vibrato", "T.slide_legato"] }, // Bend, Vibrato ve Slide
  "4.0": { level: "L3", axes: ["fretboard", "technique"], skills: ["F.3nps_7pos", "T.pentatonic_sequences"] }, // Gam Isınması
  "4.1": { level: "L4", axes: ["fretboard", "theory_ear"], skills: ["F.arpeggio_7th"] }, // Arpej Isınması
  "4.2": { level: "L4", axes: ["fretboard", "rhythm"], skills: ["F.caged", "R.funk_16th_strum"] }, // Akor ve Ritim
};

export const kromatikCourse: Course = {
  slug: "kromatik-isinma",
  title: "Kromatik Isınma",
  description: "Orta–ileri ısınma: permütasyon, örümcek, tel atlama, pena, legato, bend, gam, arpej ve akor ısınmaları.",
  kind: "technique",
  guide: [
    "## Bu kurs ne işe yarar?",
    "Çalışmadan önceki 10–15 dakika için her tipten ısınma egzersizi: sol el (kromatik, örümcek, diyagonal, esneme), sağ el (alternate, iç/dış pena, tel atlama, economy, sweep, hybrid, palm mute), legato ve ifade (HO/PO, tapping, bend, vibrato, slide), müzikal ısınma (gam sekansları, arpej, CAGED akor geçişi, funk tarama).",
    "## Nasıl çalışılır?",
    "Hepsi metronomla. Her dersin önerilen tempo aralığı var: alt sınırdan temiz başla, her tur 4–6 BPM artır, hata başlayınca bir basamak geri dön. Gerginlik ya da ağrı hissedersen dur. Isınmanın amacı hız rekoru değil, elin o günkü durumunu yoklamak ve zayıf yeri bulmak.",
    "Günlük Rutin sayfası bu derslerden üç farklı 15 dakikalık sıra kurar (Gün A, B, C); bloklar zamanlayıcıyla sırayla açılır.",
    "## Kurs planı",
    "Bölüm 1 – Sol el: permütasyon setleri, örümcek, diyagonal kromatik, esneme.",
    "Bölüm 2 – Sağ el: alternate pena, tel atlama, economy ve sweep, hybrid ve palm mute.",
    "Bölüm 3 – Legato ve ifade: HO/PO çiftleri, tel başına üç nota legato, tapping, bend, vibrato, slide.",
    "Bölüm 4 – Müzikal ısınma: gam sekansları, ii – V – I arpejleri, CAGED akor geçişi, 16'lık funk tarama.",
  ],
  sections: etiketle([s1, s2, s3, s4], ETIKET),
};

// Açık tel sabitleri dışa (rutin ve testler için)
export const KROMATIK_ACIK_TELLER = OPEN;
