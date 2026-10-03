// Kromatik Isınma — 3 bölüm, özgün egzersizler. Parmak sıraları (permütasyonlar) üretilir.
import type { Course } from "../types.ts";
import { strokes, tex } from "../tex.ts";
import { measures } from "../dizi.ts";
import { chapter, ders, section } from "./ortak.ts";

const P = "kr";
const UP = [6, 5, 4, 3, 2, 1];
const DOWN = [1, 2, 3, 4, 5, 6];

/** Parmak sırası ("1324") her telde uygulanır; 1. parmak `pos` perdesinde. */
const perm = (order: string, pos: number, strings = UP) => strings.flatMap((s) => [...order].map((d) => `${pos + Number(d) - 1}.${s}`));
const reverse = (order: string) => [...order].reverse().join("");
/** Çık (verilen sırayla) ve in (ters sırayla) */
const upDownPerm = (order: string, pos: number) => [...perm(order, pos, UP), ...perm(reverse(order), pos, DOWN)];
const e8 = (bpm: number, notes: string[]) => tex(bpm, measures(":8", strokes(notes), 8));
const s16 = (bpm: number, notes: string[]) => tex(bpm, measures(":16", strokes(notes), 16));
const t8 = (bpm: number, notes: string[]) => tex(bpm, measures(":8", strokes(notes), 12, 3));

const CORE = [
  "Kromatik dizi 12 yarım sesin hepsidir; gitarda yan yana perdeler. Müzikal olmaktan çok mekaniktir: kulak yerine eli çalıştırır.",
  "Tek perdeye bir parmak: 1. parmak (işaret) ilk perdede, 4. parmak (serçe) dördüncü perdede.",
];

const s1 = section(1, "Parmak Bağımsızlığı", [
  chapter(P, 1, 0, "1-2-3-4", CORE, [
    ders("1. Pozisyon", 60, e8(60, upDownPerm("1234", 1)), "1. perdeden başlayarak her telde 1-2-3-4, sonra 4-3-2-1 ile in.", ["Bir sonraki notaya geçene kadar parmağı kaldırma.", "Her nota net çınlamalı."]),
    ders("5. Pozisyon", 70, e8(70, upDownPerm("1234", 5)), "Aynı kalıp perdelerin dar olduğu 5. pozisyonda.", "Başparmak sapın arkasında, orta parmak hizasında."),
    ders("Kayan Pozisyon", 60, s16(60, [...UP.flatMap((s, i) => [1, 2, 3, 4].map((d) => `${i + d}.${s}`)), ...DOWN.flatMap((s, i) => [4, 3, 2, 1].map((d) => `${5 - i + d}.${s}`))]), "Her yeni telde el bir perde kayar.", "Kayma anında elin tamamı hareket eder.", "", 2),
  ]),
  chapter(P, 1, 1, "Permütasyonlar", [
    "Dört parmağın 24 farklı sırası (permütasyon) vardır. Her biri farklı bir parmak zayıflığını çalıştırır.",
  ], [
    ders("1-3-2-4", 60, e8(60, upDownPerm("1324", 5)), "Çıkışta 1-3-2-4, inişte 4-2-3-1.", "Zor olan 3'ten 2'ye dönüş: yavaşla."),
    ders("1-2-4-3", 60, e8(60, upDownPerm("1243", 5)), "Çıkışta 1-2-4-3.", "4'ten 3'e dönüşte 3. parmak zaten hazır olmalı."),
    ders("1-4-2-3", 60, e8(60, upDownPerm("1423", 5)), "Çıkışta 1-4-2-3: en zor permütasyonlardan.", "Serçe parmağın 1'den 4'e açılması en büyük esneme.", "", 2),
  ]),
  chapter(P, 1, 2, "Örümcek", ["Örümcek egzersizinde parmaklar ikişer ikişer komşu tellerde yürür. Parmak bağımsızlığını en hızlı geliştiren kalıplardan biridir."], [
    ders("Örümcek 1-3 / 2-4", 60, e8(60, [...[6, 5, 4, 3, 2].flatMap((s) => [`5.${s}`, `6.${s - 1}`, `7.${s}`, `8.${s - 1}`]), ...[1, 2, 3, 4, 5].flatMap((s) => [`8.${s}`, `7.${s + 1}`, `6.${s}`, `5.${s + 1}`])]), "1 ve 3 alt telde, 2 ve 4 üst telde.", "Basılı kalan parmakları kaldırma."),
    ders("Örümcek 1-2 / 3-4", 60, e8(60, [...[6, 5, 4, 3, 2].flatMap((s) => [`5.${s}`, `7.${s - 1}`, `6.${s}`, `8.${s - 1}`]), ...[1, 2, 3, 4, 5].flatMap((s) => [`8.${s}`, `6.${s + 1}`, `7.${s}`, `5.${s + 1}`])]), "Çapraz örümcek: 1 alt, 3 üst, 2 alt, 4 üst.", "Parmaklar tellere dik bassın."),
    ders("On Altılık Örümcek", 60, s16(60, [...[6, 5, 4, 3, 2].flatMap((s) => [`5.${s}`, `6.${s - 1}`, `7.${s}`, `8.${s - 1}`]), ...[1, 2, 3, 4, 5].flatMap((s) => [`8.${s}`, `7.${s + 1}`, `6.${s}`, `5.${s + 1}`])]), "Örümcek on altılıkla.", "Hız değil temizlik.", "", 2),
  ]),
]);

const s2 = section(2, "Koordinasyon", [
  chapter(P, 2, 0, "On Altılık Permütasyonlar", ["On altılıkta her vuruşa bir tel (dört nota) düşer; permütasyonun ilk notası her zaman aşağı pena."], [
    ders("1-3-2-4", 60, s16(60, upDownPerm("1324", 5)), "On altılıkla 1-3-2-4.", "Her vuruşun ilk notasını vurgula."),
    ders("2-4-1-3", 60, s16(60, upDownPerm("2413", 5)), "On altılıkla 2-4-1-3.", "Orta parmakla başlamak alışılmadık: yavaş başla."),
    ders("Karışık", 60, s16(60, [...perm("1324", 5, UP), ...perm("4231", 5, DOWN), ...perm("2413", 5, UP), ...perm("3142", 5, DOWN)]), "Dört permütasyon art arda.", "Permütasyon değişirken ritim bozulmasın.", "", 2),
  ]),
  chapter(P, 2, 1, "Çapraz Kromatik", ["Çapraz kromatikte her telde el bir perde yukarı kayar: sap boyunca 'merdiven'. Pozisyon değişimini ve kromatiği birleştirir."], [
    ders("Merdiven", 60, e8(60, UP.flatMap((s, i) => [1, 2, 3, 4].map((d) => `${i * 2 + d}.${s}`))), "Her yeni tel iki perde yukarıda başlar.", "Kaymayı işaret parmağı yönetir."),
    ders("Merdiven – İniş", 60, e8(60, DOWN.flatMap((s, i) => [4, 3, 2, 1].map((d) => `${10 - i * 2 + d}.${s}`))), "Tepeden geri in.", "İnişte serçe parmak yönetir."),
    ders("Merdiven – Triole", 60, t8(60, UP.flatMap((s, i) => [1, 2, 3].map((d) => `${i * 2 + d}.${s}`)).concat(DOWN.flatMap((s, i) => [3, 2, 1].map((d) => `${10 - i * 2 + d}.${s}`)))), "Üç parmakla triole merdiven.", "Her vuruş bir tel.", "", 2),
  ]),
  chapter(P, 2, 2, "Tel Atlama", ["Kromatik kalıpta tel atlamak sağ elin hedefleme hassasiyetini geliştirir."], [
    ders("Bir Tel Atla", 60, e8(60, [6, 4, 5, 3, 4, 2, 3, 1].flatMap((s) => [5, 6, 7, 8].map((f) => `${f}.${s}`))), "Teller 6-4-5-3-4-2-3-1 sırasıyla.", "Atlanan tel çalmamalı; sol el sustursun."),
    ders("Geri Atlama", 60, e8(60, [1, 3, 2, 4, 3, 5, 4, 6].flatMap((s) => [8, 7, 6, 5].map((f) => `${f}.${s}`))), "Tersi: 1-3-2-4-3-5-4-6.", "Pena atladığı telin üzerinden kavis çizer."),
    ders("On Altılık", 60, s16(60, [6, 4, 5, 3, 4, 2, 3, 1].flatMap((s) => [5, 6, 7, 8].map((f) => `${f}.${s}`))), "Tel atlama on altılıkla.", "Her atlama vuruşun başında.", "", 2),
  ]),
]);

const s3 = section(3, "Günlük Rutin", [
  chapter(P, 3, 0, "Beş Dakikalık Isınma", ["Isınma kasları ve tendonları çalışmaya hazırlar. Soğuk elle hızlı çalmak sakatlığa yol açabilir; her çalışmaya birkaç dakikalık kromatikle başla."], [
    ders("Yavaş Isınma", 50, e8(50, [...upDownPerm("1234", 1), ...upDownPerm("1234", 5)]), "1. ve 5. pozisyonda 1-2-3-4.", "Kasları zorlama; sadece kan dolaşımını başlat.", "", 2),
    ders("Orta Isınma", 60, e8(60, [...upDownPerm("1324", 5), ...upDownPerm("1243", 5)]), "İki permütasyon.", "Elin ısındığını hisset.", "", 3),
    ders("Tam Isınma", 60, s16(60, [...upDownPerm("1234", 5), ...upDownPerm("1324", 7), ...upDownPerm("2413", 9)]), "Üç pozisyonda üç permütasyon.", "Isınma bitince ana çalışmana geç.", "", 5),
  ]),
  chapter(P, 3, 1, "Esneme", ["Geniş aralıklar (bir parmak bir perde kuralının dışı) sol elin açıklığını artırır. Esnemeyi yüksek perdelerde başlatıp aşağı doğru ilerlet."], [
    ders("Yüksek Perdelerde", 60, e8(60, upDownPerm("1235", 12)), "12. pozisyonda 1-2-3-5 (serçe bir perde öteye uzanır).", "Ağrı hissedersen dur."),
    ders("Orta Perdelerde", 60, e8(60, upDownPerm("1235", 7)), "Aynı esneme 7. pozisyonda.", "Başparmak sapın arkasında aşağı iner; el açılır."),
    ders("Geniş Esneme", 50, e8(50, upDownPerm("1246", 9)), "1-2-4-6: altı perdelik açıklık.", "Sadece ısındıktan sonra.", "", 2),
  ]),
  chapter(P, 3, 2, "Hız Merdiveni", ["Hız merdiveni: aynı kalıbı sekizlik, triole ve on altılıkla art arda çalmak. Tempo sabit kalırken nota yoğunluğu artar."], [
    ders("Sekizlik → On Altılık", 60, tex(60, [...measures(":8", strokes(perm("1234", 5, [6, 5])), 8), ...measures(":16", strokes(perm("1234", 5, [4, 3, 2, 1])), 16)]), "İki ölçü sekizlik, bir ölçü on altılık.", "Geçişte tempo kaymasın."),
    ders("Üç Basamak", 60, tex(60, [...measures(":8", strokes(perm("1234", 5, [6, 5])), 8), ...measures(":8", strokes(perm("123", 5, [4, 3, 2, 1])), 12, 3), ...measures(":16", strokes(perm("1234", 5, [1, 2, 3, 4])), 16)]), "Sekizlik, triole, on altılık.", "Triolede üç parmak kullan."),
    ders("Hedef Tempo", 80, tex(80, [...measures(":8", strokes(perm("1234", 5, [6, 5])), 8), ...measures(":8", strokes(perm("123", 5, [4, 3, 2, 1])), 12, 3), ...measures(":16", strokes(perm("1234", 5, [1, 2, 3, 4])), 16)]), "Hedef tempoda.", "Bunu temiz çalabiliyorsan parmakların her çalışmaya hazır.", "", 2),
  ]),
]);

export const kromatikCourse: Course = {
  slug: "kromatik-isinma",
  title: "Kromatik Isınma",
  description: "Parmak bağımsızlığı ve her çalışmadan önce ısınma.",
  kind: "technique",
  icon: "🔥",
  guide: [
    "## Kromatik ısınma nedir?",
    ...CORE,
    "## Nasıl çalışılır?",
    "Her çalışmaya 5 dakikalık ısınmayla başla. Hız hedefleme; temizlik, eşitlik ve gevşeklik hedefle. Gerginlik ya da ağrı hissedersen dur.",
    "## Kurs planı",
    "Bölüm 1 – Parmak bağımsızlığı: 1-2-3-4, permütasyonlar, örümcek.",
    "Bölüm 2 – Koordinasyon: on altılık, çapraz kromatik, tel atlama.",
    "Bölüm 3 – Günlük rutin: ısınma, esneme, hız merdiveni.",
  ],
  sections: [s1, s2, s3],
};
