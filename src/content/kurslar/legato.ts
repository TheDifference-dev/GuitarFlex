// Legato — 6 bölüm, özgün egzersizler.
import type { Course } from "../types.ts";
import { tex } from "../tex.ts";
import { groups, noteList, pos, slurred, upDown, type Pos } from "../dizi.ts";
import { aDorian3, aHarm3, aMinor3, aMinor4, gMajor3, penta3, pentaBox1, pentaBox2, pentaBox5 } from "./diziler.ts";
import { chapter, ders, e8, s16, section, t8, x16 } from "./ortak.ts";

const P = "lg";
const m = (ps: Pos[]) => ps.map((p) => p.m);
const rev = <T,>(xs: T[]) => [...xs].reverse();
/** Elle yazılmış nota dizisini legato bağlarıyla döndürür */
const sl = (notes: string) => slurred(pos(notes.trim().split(/\s+/)));
/** Tek telde verilen perdeler */
const str = (s: number, frets: number[]) => frets.map((f) => `${f}.${s}`).join(" ");
/** Tel tel 6'lı kalıp (3 nota/tel dizilerinde iki tel: çık, sonra bir tel atla) */
const sixes = (ps: Pos[]) => {
  const out: Pos[] = [];
  for (let i = 0; i + 6 <= ps.length; i += 3) out.push(...ps.slice(i, i + 6));
  return out;
};
const END_A = [":1 7.4{v}"];
const END_A5 = [":1 5.6{v}"];

// ── Bölüm 1: Temeller ────────────────────────────────────────────────────────
const s1 = section(1, "Temeller", [
  chapter(P, 1, 0, "Hammer-on", [
    "Hammer-on: notayı pena yerine sol el parmağının çekiç gibi inmesiyle çalmak. Ses daha yumuşak ve bağlıdır.",
    "Legato, İtalyanca 'bağlı' demektir: notalar arasında boşluk olmadan çalmak.",
  ], [
    ders("İki Parmak Hammer-on", 60, e8(60, [
      ...sl(`5.3 7.3 5.3 7.3 5.3 7.3 5.3 7.3`), ...sl(`5.2 8.2 5.2 8.2 5.2 8.2 5.2 8.2`),
      ...sl(`5.4 7.4 5.4 7.4 5.4 7.4 5.4 7.4`), ...sl(`5.1 8.1 5.1 8.1 5.1 8.1 5.1 8.1`),
    ]),
    "İlk notayı pena ile çal, ikinciyi sadece parmakla vur.",
    ["Parmak ucu perdenin hemen arkasına, hızlı ve dik insin.", "Pena ile çalınan nota ile hammer-on notası aynı yükseklikte duyulmalı."],
    "Bütün notalar La minör pentatonikten: Do–Re, Mi–Sol, Sol–La, La–Do."),
    ders("Üç Notalı Hammer-on", 60, t8(60, [
      ...sl(`5.1 7.1 8.1`).concat(sl(`5.1 7.1 8.1`)), ...sl(`5.2 6.2 8.2`).concat(sl(`5.2 6.2 8.2`)),
      ...sl(`5.3 7.3 9.3`).concat(sl(`5.3 7.3 9.3`)), ...sl(`5.4 7.4 9.4`).concat(sl(`5.4 7.4 9.4`)),
    ]), "Bir pena, iki hammer-on: her telde üç nota.",
    "Üçüncü nota en zayıf çıkar; serçe ya da yüzük parmağını güçlü vur.",
    `Her teldeki üç nota La doğal minörden: ${noteList([69, 71, 72, 64, 65, 67])}…`),
    ders("Akorlarda Hammer-on", 60, e8(60, [
      ...sl(`0.5 2.4 0.3 2.3 1.2 0.1 1.2 2.3`), ...sl(`3.5 0.4 2.4 0.3 1.2 0.1 1.2 0.3`),
      ...sl(`3.6 0.5 2.5 0.4 0.3 3.1 0.3 0.4`), ...sl(`0.6 2.5 0.4 2.4 0.3 1.3 0.2 0.1`),
    ]), "Am – C – G – E arpejlerinde açık telden hammer-on süslemeleri.",
    "Hammer-on yapılan parmak akorun kendi parmağıdır; akoru bozmadan kaldır ve vur.",
    "Akor içindeki hammer-on, akorun bir notasına komşu notadan 'kayarak' gelir. Folk ve rock eşliklerinde çok yaygındır."),
  ]),
  chapter(P, 1, 1, "Pull-off", [
    "Pull-off: basılı parmağı telden çekerken teli hafifçe aşağı çekip bırakmak. Alttaki parmağın notası ya da açık tel çalar.",
  ], [
    ders("İki Parmak Pull-off", 60, e8(60, [
      ...sl(`7.3 5.3 7.3 5.3 7.3 5.3 7.3 5.3`), ...sl(`8.2 5.2 8.2 5.2 8.2 5.2 8.2 5.2`),
      ...sl(`7.4 5.4 7.4 5.4 7.4 5.4 7.4 5.4`), ...sl(`8.1 5.1 8.1 5.1 8.1 5.1 8.1 5.1`),
    ]), "Üstteki notayı pena ile çal, alttakine pull-off yap.",
    ["Alttaki parmak önceden basılı olmalı.", "Parmağı yukarı kaldırma; tele paralel, aşağı doğru çek."]),
    ders("Üç Notalı Pull-off", 60, t8(60, [
      ...sl(`8.1 7.1 5.1 8.1 7.1 5.1`), ...sl(`8.2 6.2 5.2 8.2 6.2 5.2`),
      ...sl(`9.3 7.3 5.3 9.3 7.3 5.3`), ...sl(`9.4 7.4 5.4 9.4 7.4 5.4`),
    ]), "Bir pena, iki pull-off.",
    "Üç parmak birden basılı başla; sırayla 'çözül'."),
    ders("Açık Tele Pull-off", 70, e8(70, [
      ...sl(`5.1 0.1 3.1 0.1 1.1 0.1 3.1 0.1`), ...sl(`5.1 0.1 3.1 0.1 1.1 0.1 0.2 0.1`),
      ...sl(`3.2 0.2 1.2 0.2 3.2 0.2 1.2 0.2`), ...sl(`2.3 0.3 2.3 0.3 2.4 0.4 2.4 0.4`),
    ]), "Perdeden açık tele pull-off: La, Sol, Fa → Mi.",
    "Açık tel çok yüksek çınlarsa sağ elin avuç içiyle hafifçe sustur.",
    "Açık tele pull-off, klasik gitarda ve Barok eserlerde akıcı geçişlerin temel tekniğidir."),
  ]),
  chapter(P, 1, 2, "Hammer ve Pull", [
    "Trill: iki nota arasında hızlıca gidip gelmek. Barok müzikte süsleme olarak, rock'ta gerilim yaratmak için kullanılır.",
  ], [
    ders("Çık ve Dön", 60, t8(60, [
      ...sl(`5.3 7.3 5.3 5.3 7.3 5.3`), ...sl(`5.2 8.2 5.2 5.2 8.2 5.2`), ...sl(`5.1 8.1 5.1 5.1 8.1 5.1`), ...sl(`5.4 7.4 5.4 5.4 7.4 5.4`),
    ]), "Pena – hammer – pull: her vuruşta yeniden pena.",
    "Pull-off ile dönülen nota pena ile çalınanla aynı güçte olsun."),
    ders("Dörtlü Döngü", 60, s16(60, [
      ...sl(`5.1 7.1 8.1 7.1 5.1 7.1 8.1 7.1 5.1 7.1 8.1 7.1 5.1 7.1 8.1 7.1`),
      ...sl(`5.2 6.2 8.2 6.2 5.2 6.2 8.2 6.2 5.2 6.2 8.2 6.2 5.2 6.2 8.2 6.2`),
    ]), "Bir pena, üç bağlı nota: 1-2-4-2 parmaklarıyla dörtlü döngü.",
    "Her vuruşun ilk notası pena ile; geri kalan üçü legato.",
    "Döngünün notaları La minörden: La–Si–Do–Si ve Mi–Fa–Sol–Fa."),
    ders("Kısa Triller", 60, s16(60, [
      ...sl(str(3, [5, 7, 5, 7, 5, 7, 5, 7, 5, 7, 5, 7, 5, 7, 5, 7])), ...sl(str(2, [5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6])),
      ...sl(str(1, [5, 8, 5, 8, 5, 8, 5, 8, 5, 8, 5, 8, 5, 8, 5, 8])), ...sl(str(3, [7, 9, 7, 9, 7, 9, 7, 9, 7, 9, 7, 9, 7, 9, 7, 9])),
    ]), "Her ölçüde bir parmak çiftiyle tek pena, on beş bağlı nota.",
    ["Trill sırasında sol el bileği gevşek kalsın.", "Ses azalırsa ölçünün ortasında bir kez daha pena atabilirsin."],
    "Do–Re büyük ikili (tam ses), Mi–Fa küçük ikili (yarım ses), La–Do küçük üçlü, Re–Mi büyük ikili."),
  ]),
  chapter(P, 1, 3, "Kromatik Legato", [
    "Kromatik legato, dört parmağın her birinin bağımsız ve eşit güçte çalışmasını sağlar.",
  ], [
    ders("1-2-3-4 Hammer-on", 60, e8(60, [6, 5, 4, 3, 2, 1].flatMap((s) => sl(str(s, [5, 6, 7, 8])))), "Her telde bir pena, üç hammer-on.",
    "Serçe parmağın hammer-on'u en zayıf olanıdır; ona odaklan."),
    ders("4-3-2-1 Pull-off", 60, e8(60, [1, 2, 3, 4, 5, 6].flatMap((s) => sl(str(s, [8, 7, 6, 5])))), "Her telde bir pena, üç pull-off.",
    "Dört parmak birden basılı başla."),
    ders("Kromatik Döngü", 60, s16(60, [6, 5, 4, 3, 2, 1].flatMap((s) => sl(str(s, [5, 6, 7, 8, 7, 6, 5, 6])))), "Her telde 1-2-3-4-3-2-1-2: tek pena, yedi bağlı nota.",
    "Ses kaybolmaya başlarsa vuruş başlarına pena ekle.", "", 2),
  ]),
  chapter(P, 1, 4, "Tel Değişimi", [
    "Legato çalarken yalnızca her telin ilk notası pena ile çalınır; tel değişimleri ritmin en çok bozulduğu yerdir.",
  ], [
    ders("İki Tel", 60, e8(60, [...sl(`5.3 7.3 5.2 8.2 5.3 7.3 5.2 8.2`), ...sl(`5.3 7.3 5.2 8.2 5.3 7.3 5.2 8.2`), ...sl(`8.2 5.2 7.3 5.3 8.2 5.2 7.3 5.3`), ...sl(`8.2 5.2 7.3 5.3 8.2 5.2 7.3 5.3`)]),
      "Sol ve Si telleri arasında hammer-on ile çık, pull-off ile in.", "Çalmadığın teli sol elin boştaki parmaklarıyla sustur."),
    ders("Üç Tel", 60, t8(60, [...sl(`5.3 7.3 9.3 5.2 6.2 8.2 5.1 7.1 8.1 5.1 7.1 8.1`), ...sl(`8.1 7.1 5.1 8.2 6.2 5.2 9.3 7.3 5.3 9.3 7.3 5.3`)].concat(
      [...sl(`5.3 7.3 9.3 5.2 6.2 8.2 5.1 7.1 8.1 5.1 7.1 8.1`), ...sl(`8.1 7.1 5.1 8.2 6.2 5.2 9.3 7.3 5.3 9.3 7.3 5.3`)])),
      "3 nota/tel: üç tel çık, üç tel in.", "Her yeni telin ilk notasını vurgula.", "Do–Re–Mi, Mi–Fa–Sol, La–Si–Do: La minör gamının bir oktavı."),
    ders("Dört Tel", 60, t8(60, slurred(upDown(aMinor3.slice(6, 18)))),
      "3 nota/tel La minör, Re telinden ince Mi'ye çık ve in.", "Pena sadece her telin ilk notasında."),
  ]),
]);

// ── Bölüm 2: Pentatonik Legato ───────────────────────────────────────────────
const s2 = section(2, "Pentatonik Legato", [
  chapter(P, 2, 0, "1. Kutu", [
    `La minör pentatonik: ${noteList(m(pentaBox1))}. 2 nota/tel olduğu için her telde bir pena ve bir legato.`,
  ], [
    ders("Hammer-on ile Çık", 70, e8(70, [...slurred(pentaBox1), ...slurred(pentaBox1)], END_A), "Kutuyu her telde pena + hammer-on ile çık.", "Hammer-on notası pena notasıyla aynı yükseklikte duyulmalı."),
    ders("Pull-off ile İn", 70, e8(70, [...slurred(rev(pentaBox1)), ...slurred(rev(pentaBox1))], END_A5), "Her telde pena + pull-off ile in.", "Pull-off yaparken aşağıdaki teli istemeden çalmamaya dikkat."),
    ders("Çık ve İn – Triole", 60, t8(60, slurred(upDown(pentaBox1))), "Legato kutu triole ritmiyle.", "Triolede vuruşlar bazen pena, bazen legato notasına düşer; vuruşu sağ elle değil kulakla takip et."),
  ]),
  chapter(P, 2, 1, "Diğer Kutular", ["Pentatonik kutuların hepsi 2 nota/teldir; legato kalıbı her kutuda aynı mantıkla çalışır."], [
    ders("2. Kutu", 70, e8(70, slurred(upDown(pentaBox2))), "7-10. perdelerdeki kutu.", "İşaret parmağı 7. perdede sabit kalsın."),
    ders("5. Kutu", 70, e8(70, slurred(upDown(pentaBox5))), "2-5. perdelerdeki kutu.", "3. ve 4. telde 2. perdeye uzanırken el şeklini koru."),
    ders("Kutuları Bağla", 70, e8(70, [...slurred(pentaBox5), ...slurred(rev(pentaBox1)), ...slurred(pentaBox2)]), "5. kutu çık, 1. kutu in, 2. kutu çık.", "Kutu değişimlerinde el tek hamlede kayar.", "", 2),
  ]),
  chapter(P, 2, 2, "Üçlü Gruplar", ["Sekanslarda bazı tel geçişleri grubun ortasına düşer; legato, sekansa 'akıcı' bir karakter verir."], [
    ders("Çıkan Üçlüler", 60, t8(60, slurred(groups(pentaBox1, 3))), "1-2-3, 2-3-4 … legato ile.", "Aynı teldeki ardışık notalar bağlı, tel değişen notalar pena ile."),
    ders("İnen Üçlüler", 60, t8(60, slurred(groups(rev(pentaBox1), 3))), "Tepeden üçlülerle in.", "Pull-off'ları güçlü yap."),
    ders("Çık ve İn", 60, t8(60, [...slurred(groups(pentaBox1, 3)), ...slurred(groups(rev(pentaBox1), 3))]), "İki sekansı birleştir.", "Dönüşte ritim bozulmasın.", "", 2),
  ]),
  chapter(P, 2, 3, "Dörtlü Gruplar", ["Dörtlü gruplar on altılık notalara oturur: her vuruşta bir grup."], [
    ders("Çıkan Dörtlüler", 55, s16(55, slurred(groups(pentaBox1, 4))), "1-2-3-4, 2-3-4-5 …", "Her vuruşun ilk notasını vurgula."),
    ders("İnen Dörtlüler", 55, s16(55, slurred(groups(rev(pentaBox1), 4))), "Tepeden dörtlülerle in.", "Bu kalıp rock sololarının en bilinen hız kalıplarındandır."),
    ders("Çapraz Pentatonik", 60, e8(60, slurred(upDown(penta3))), "3 nota/tel pentatonik: La'dan başlayıp sapın tepesine çapraz çık.", ["Her telde 1-3-4 parmakları; geniş aralıklar için eli aç."], `Bu kalıp aynı beş notayı (${noteList(m(penta3))}) iki buçuk oktava yayar.`, 2),
  ]),
  chapter(P, 2, 4, "Cümleler", ["Legato cümlelerde pena yalnızca vurgulanacak notalarda kullanılır; geri kalanı 'akar'."], [
    ders("İnen Akış", 70, e8(70, sl(`5.1 8.1 5.1 8.2 5.2 8.2 5.2 7.3 5.3 7.3 5.3 7.4 5.4 7.4 5.4 7.5`), [":2 5.5 7.5", ":1 5.6{v}"]), "Kutunun tepesinden inen, gidip gelen bir cümle.", "Son notaya vibrato."),
    ders("Triole Cümle", 70, t8(70, sl(`8.1 5.1 8.2 5.2 8.2 5.2 7.3 5.3 7.3 5.3 7.4 5.4 7.4 5.4 7.5 5.5 7.5 5.5 8.6 5.6 8.6 5.6 7.5 5.5`), END_A), "Triole ile inen ve kök La'ya dönen cümle.", "Her vuruşun ilk notasını pena ile çalmayı dene."),
    ders("Trill Merdiveni", 60, s16(60, sl(`5.1 8.1 5.1 8.1 5.2 8.2 5.2 8.2 5.3 7.3 5.3 7.3 5.4 7.4 5.4 7.4 5.4 7.4 5.4 7.4 5.5 7.5 5.5 7.5 5.6 8.6 5.6 8.6 5.6 8.6 5.6 8.6`), END_A5), "Her telde kısa bir trill, merdiven gibi inerek.", "Tel değişimlerinde pena kullan.", "", 2),
  ]),
]);

// ── Bölüm 3: 3 Nota/Tel Legato ───────────────────────────────────────────────
const s3 = section(3, "3 Nota/Tel Legato", [
  chapter(P, 3, 0, "Sol Majör", [`Sol majör: ${noteList(m(gMajor3))}. Her telde bir pena, iki legato.`], [
    ders("Sekizlik", 70, e8(70, slurred(upDown(gMajor3))), "Sol majör, 3 nota/tel, çık ve in.", "Pena notası ile legato notaları eşit duyulsun."),
    ders("Triole", 60, t8(60, slurred(upDown(gMajor3))), "Triolede her vuruş bir tele denk gelir.", "Vuruş = pena = yeni tel: en doğal legato ritmi."),
    ders("On Altılık", 55, s16(55, slurred(upDown(gMajor3))), "Aynı gam on altılıklarla.", "Pena her vuruşta farklı yere düşer; legato bunu gizlemeli.", "", 2),
  ]),
  chapter(P, 3, 1, "La Minör", [`La doğal minör: ${noteList(m(aMinor3))}.`, "Si telinde kalıp bir perde kayar (6-8-10)."], [
    ders("Sekizlik", 70, e8(70, slurred(upDown(aMinor3))), "La minör, 3 nota/tel.", "2. telde pozisyon kaymasına hazır ol."),
    ders("Triole", 60, t8(60, slurred(upDown(aMinor3))), "Triole ile.", "Her vuruşta bir tel."),
    ders("On Altılık", 55, s16(55, slurred([...upDown(aMinor3), ...upDown(aMinor3).slice(1)])), "On altılıklarla iki kez çık ve in.", "Gerginlik hissedersen dur ve elini gevşet.", "", 2),
  ]),
  chapter(P, 3, 2, "Altılı Kalıp", ["Altılı kalıp: iki telde altı nota çık, bir tel geri dön, tekrar et. Legato gitaristlerinin en sevdiği 'motor' kalıplardan biridir."], [
    ders("Sol Majör – Çık", 55, x16(55, slurred(sixes(gMajor3))), "İki tellik gruplarla çık; her grup bir vuruş (altılık).", "Altılık = vuruş başına altı nota: iki triole."),
    ders("Sol Majör – İn", 55, x16(55, slurred(sixes(rev(gMajor3)))), "Aynı kalıp inerek.", "İnişte pull-off'lar ağırlıkta."),
    ders("La Minör – Çık ve İn", 55, x16(55, [...slurred(sixes(aMinor3)), ...slurred(sixes(rev(aMinor3)))]), "La minörde iki yön.", "Hedef: altılıkları metronomla tam vuruşa oturtmak.", "", 2),
  ]),
  chapter(P, 3, 3, "Üçlü Sekans", ["Üçlü sekans gamın her basamağından üç nota çalar. 3 nota/tel dizide bazı gruplar tel değiştirir."], [
    ders("Sol Majör Üçlüler", 60, t8(60, slurred(groups(gMajor3, 3))), "1-2-3, 2-3-4 … legato ile çık.", "Grubun içindeki tel değişimlerinde pena."),
    ders("La Minör Üçlüler", 60, t8(60, slurred(groups(aMinor3, 3))), "La minörde çıkan üçlüler.", "Her vuruşun başını vurgula."),
    ders("Üçlüler – İn", 60, t8(60, slurred(groups(rev(aMinor3), 3))), "La minörde inen üçlüler.", "Pull-off'lar arka arkaya gelir; parmakları önceden yerleştir.", "", 2),
  ]),
  chapter(P, 3, 4, "Dorian Legato", ["Dorian: minörün 6. derecesi tizleşmiş hali (La Dorian'da Fa#). Funk, caz ve Santana tarzı minör sololarda kullanılır."], [
    ders("Dorian – Sekizlik", 70, e8(70, slurred(upDown(aDorian3))), "La Dorian, 3 nota/tel.", "Fa# notalarına dikkat: 5. telde 9, 2. telde 7. perde."),
    ders("Dorian – Altılı", 55, x16(55, slurred(sixes(aDorian3))), "Dorianda altılı kalıp.", "Bölüm 3.2'deki kalıbın aynısı, başka bir modda."),
    ders("Dorian – Dörtlüler", 55, s16(55, slurred(groups(aDorian3, 4))), "Dorianda dörtlü sekans.", "Her grubun ilk notası vuruşta.", "", 2),
  ]),
]);

// ── Bölüm 4: Trill ve Dayanıklılık ───────────────────────────────────────────
const trill = (s: number, a: number, b: number, n = 16) => sl(str(s, Array.from({ length: n }, (_, i) => (i % 2 ? b : a))));
const s4 = section(4, "Trill ve Dayanıklılık", [
  chapter(P, 4, 0, "Parmak Çiftleri", ["Trill, sol elin dayanıklılığını en hızlı geliştiren egzersizdir. Her parmak çifti ayrı çalışılmalı."], [
    ders("1-2 ve 1-3", 60, s16(60, [...trill(3, 5, 6), ...trill(3, 5, 7), ...trill(2, 5, 6), ...trill(2, 5, 7)]), "İşaret-orta ve işaret-yüzük parmak çiftleri.", "Her ölçüde tek pena.", "Sol telinde Do–Do# (yarım ses) ve Do–Re (tam ses)."),
    ders("1-4 ve 2-3", 60, s16(60, [...trill(3, 5, 8), ...trill(3, 6, 7), ...trill(2, 5, 8), ...trill(2, 6, 7)]), "En zayıf çiftler: işaret-serçe ve orta-yüzük.", "Serçe parmağı kıvrık tut; düz basarsa güç kaybeder."),
    ders("2-4 ve 3-4", 60, s16(60, [...trill(3, 6, 8), ...trill(3, 7, 8), ...trill(2, 6, 8), ...trill(2, 7, 8)]), "Son çiftler: orta-serçe, yüzük-serçe.", "3-4 çifti en zorudur; gerekirse tempoyu düşür.", "", 2),
  ]),
  chapter(P, 4, 1, "Açık Tel Pedalı", ["Açık tele pull-off ile çalınan pedal tonu, Barok gitar ve neoklasik rock'ta sık kullanılır. Açık Mi teli La minörde 5. derecedir."], [
    ders("İnce Mi Pedalı", 70, t8(70, [[8, 5], [7, 3], [5, 1], [3, 1], [8, 5], [10, 8], [12, 10], [8, 5]].flatMap(([a, b]) => sl(str(1, [a, b, 0])))), "Her vuruşta iki pull-off, son nota açık Mi.", "Açık tel net çınlasın; parmak teli hafifçe aşağı çekerek bıraksın.", "Melodi: Do, Si, La, Sol … Hepsi La minörde."),
    ders("Si Teli Pedalı", 70, t8(70, [[8, 5], [6, 3], [5, 1], [3, 1], [8, 5], [10, 8], [12, 10], [8, 6]].flatMap(([a, b]) => sl(str(2, [a, b, 0])))), "Aynı fikir Si telinde.", "Si açık teli La minörün 2. derecesidir; daha 'asılı' duyulur."),
    ders("Pedal Dörtlüsü", 70, s16(70, [[8, 5], [7, 3], [5, 1], [3, 1], [8, 5], [10, 8], [12, 10], [13, 12]].flatMap(([a, b]) => sl(str(1, [a, 0, b, 0])))), "On altılıklarla iki pull-off arasında açık tel.", "Bu doku Barok keman ve klavsen eserlerinden tanıdık bir sestir.", "", 2),
  ]),
  chapter(P, 4, 2, "Dayanıklılık", ["Kas dayanıklılığı, kısa ama düzenli çalışmayla gelişir. Yanma hissedersen dur; ağrıyla çalışma."], [
    ders("Bir Dakika Trill", 70, s16(70, [...trill(1, 5, 8), ...trill(2, 5, 8), ...trill(3, 5, 7), ...trill(4, 5, 7)]), "Dört tel, dört parmak çifti, kesintisiz.", "Ölçü başlarında pena atabilirsin."),
    ders("Kromatik Akış", 60, s16(60, [6, 5, 4, 3, 2, 1, 2, 3, 4, 5].flatMap((s, i) => sl(str(s, i < 6 ? [5, 6, 7, 8] : [8, 7, 6, 5])))), "Kromatik legato, aralıksız çık ve in.", "Sadece her telin ilk notası pena ile.", "", 2),
    ders("Uzun Koşu", 60, s16(60, slurred([...upDown(aMinor3), ...upDown(aMinor3).slice(1), ...upDown(aMinor3).slice(1)])), "3 nota/tel La minör, üç tur aralıksız.", "Sesler eşit kalsın; yorulunca ilk düşen son nota olur.", "", 3),
  ]),
]);

// ── Bölüm 5: Pozisyon ve Genişlik ────────────────────────────────────────────
const s5 = section(5, "Pozisyon ve Genişlik", [
  chapter(P, 5, 0, "Kaydırarak Pozisyon Değiştirme", ["Tek telde gam çalarken her üç notada bir slide ile pozisyon değiştirmek, sapın tamamını tek telde gezmeyi sağlar."], [
    ders("İnce Mi Telinde", 70, t8(70, [`5.1{h}`, `7.1{h}`, `8.1{sl}`, `10.1{h}`, `12.1{h}`, `13.1{sl}`, `15.1{h}`, `17.1`, `17.1{h}`, `15.1{sl}`, `13.1{h}`, `12.1{h}`, `10.1{sl}`, `8.1{h}`, `7.1{h}`, `5.1`]),
      "La'dan La'ya tek telde: üç nota, kay, üç nota…", "Kayan parmak teli bırakmasın; ses kopmamalı.", "İnce Mi telinde La minör: 5 La, 7 Si, 8 Do, 10 Re, 12 Mi, 13 Fa, 15 Sol, 17 La."),
    ders("Si Telinde", 70, t8(70, [`5.2{h}`, `6.2{h}`, `8.2{sl}`, `10.2{h}`, `12.2{h}`, `13.2{sl}`, `15.2{h}`, `17.2`, `17.2{h}`, `15.2{sl}`, `13.2{h}`, `12.2{h}`, `10.2{sl}`, `8.2{h}`, `6.2{h}`, `5.2`]),
      "Mi'den Mi'ye Si telinde.", "Slide yapan parmağın basıncı kayma boyunca sabit kalsın."),
    ders("İki Tel", 60, s16(60, [`5.2{h}`, `6.2{h}`, `8.2`, `5.1{h}`, `7.1{h}`, `8.1{sl}`, `10.1`, `8.2{sl}`, `10.2{h}`, `12.2{h}`, `13.2`, `10.1{h}`, `12.1{h}`, `13.1{sl}`, `15.1`, `13.2{sl}`, `15.2{h}`, `17.2`, `15.1{h}`, `17.1`]),
      "İki telde çapraz yükselen La minör.", "Pozisyon değişiminde slide; tel değişiminde pena.", "", 2),
  ]),
  chapter(P, 5, 1, "4 Nota/Tel", ["4 nota/tel dizileri pozisyon değiştirerek sapın büyük bölümünü tek koşuda katetmeyi sağlar."], [
    ders("Sekizlik", 70, e8(70, slurred(upDown(aMinor4))), "La minör, 4 nota/tel, 5. perdeden 20. perdeye.", "Her telin dördüncü notası bir sonraki pozisyonun başlangıcı."),
    ders("On Altılık", 55, s16(55, slurred(upDown(aMinor4))), "Aynı koşu on altılıklarla.", "Kaymaları işaret parmağıyla yap."),
    ders("Dörtlüler", 55, s16(55, slurred(groups(aMinor4, 4))), "4 nota/tel dizide dörtlü sekans: her vuruş bir tel kayar.", "Gruplar telle çakıştığı için her vuruş bir pena.", "", 2),
  ]),
  chapter(P, 5, 2, "Geniş Aralıklar", ["Pentatoniği 3 nota/tel çalmak geniş parmak açıklığı ister; legato için en iyi esneme egzersizlerinden biridir."], [
    ders("Çapraz Pentatonik – Çık", 60, e8(60, slurred(penta3)), "3 nota/tel pentatonik, çık.", "Parmak açıklığı zorlarsa önce 12. perdeden yukarısını çalış."),
    ders("Çapraz Pentatonik – İn", 60, e8(60, slurred(rev(penta3))), "Aynı kalıp inerek.", "Pull-off'larda alttaki parmaklar önceden basılı."),
    ders("Çapraz Pentatonik – Triole", 60, t8(60, slurred(upDown(penta3))), "Triole ile çık ve in.", "Her vuruş bir tel.", "", 2),
  ]),
  chapter(P, 5, 3, "Armonik Minör", ["Armonik minörde Fa ile Sol# arasındaki artık ikili (3 yarım ses) legato çalımda geniş bir parmak açıklığı ister."], [
    ders("Sekizlik", 70, e8(70, slurred(upDown(aHarm3))), "La armonik minör, 3 nota/tel.", "2. telde 6-9-10: artık ikili."),
    ders("Altılı", 55, x16(55, slurred(sixes(aHarm3))), "Armonik minörde altılı kalıp.", "Neoklasik sololarda sık duyulan bir kalıp."),
    ders("Dörtlüler", 55, s16(55, slurred(groups(rev(aHarm3), 4))), "İnen dörtlüler.", "Pull-off ağırlıklı; parmakları önceden yerleştir.", "", 2),
  ]),
  chapter(P, 5, 4, "Tel Atlamalı Legato", ["Dört notalı (7'li) akorların notaları iki tele bölünür: Am7 = La–Do–Mi–Sol, Dm7 = Re–Fa–La–Do, G7 = Sol–Si–Re–Fa, Cmaj7 = Do–Mi–Sol–Si."], [
    ders("Am7 – Dm7", 60, e8(60, [...sl(`7.4 10.4 5.2 8.2 7.4 10.4 5.2 8.2`), ...sl(`12.4 15.4 10.2 13.2 12.4 15.4 10.2 13.2`), ...sl(`7.4 10.4 5.2 8.2 7.4 10.4 5.2 8.2`), ...sl(`12.4 15.4 10.2 13.2 12.4 15.4 10.2 13.2`)]),
      "Re ve Si telleri arasında akor tonları.", "Sol telini işaret parmağının yan tarafıyla sustur."),
    ders("G7 – Cmaj7", 60, e8(60, [...sl(`5.4 9.4 3.2 6.2 5.4 9.4 3.2 6.2`), ...sl(`10.4 14.4 8.2 12.2 10.4 14.4 8.2 12.2`), ...sl(`5.4 9.4 3.2 6.2 5.4 9.4 3.2 6.2`), ...sl(`10.4 14.4 8.2 12.2 10.4 14.4 8.2 12.2`)]),
      "Aynı kalıp G7 ve Cmaj7 ile.", "Perde aralığı büyük; el pozisyonu ölçüyle birlikte değişir."),
    ders("ii – V – I", 60, e8(60, [...sl(`12.4 15.4 10.2 13.2 12.4 15.4 10.2 13.2`), ...sl(`5.4 9.4 3.2 6.2 5.4 9.4 3.2 6.2`), ...sl(`10.4 14.4 8.2 12.2 10.4 14.4 8.2 12.2`), ...sl(`10.4 14.4 8.2 12.2 10.4 14.4 8.2 12.2`)]),
      "Dm7 – G7 – Cmaj7: cazın en temel dizisi.", "Akor değişimini bir önceki ölçünün son notasında hazırla.", "ii – V – I, Do majörün 2., 5. ve 1. derecelerindeki akorlardır; caz standartlarının çoğu bu hareketle kurulur.", 2),
  ]),
]);

// ── Bölüm 6: Etütler ─────────────────────────────────────────────────────────
/** Akor başına 3 nota/tel diziden bir grup (çık ve in) */
const chordBar = (ps: Pos[], start: number) => slurred([...ps.slice(start, start + 6), ...rev(ps.slice(start, start + 6)).slice(0, 2)]);
const etude = [0, 3, 6, 9, 12, 9, 6, 3].map((i) => chordBar(aMinor3, i));
const finale = [12, 9, 6, 9, 12, 9, 6, 3].map((i) => slurred([...aHarm3.slice(i, i + 6), ...rev(aHarm3.slice(i, i + 6))]));
/** 12 notalık kalıp + ilk 4 notanın tekrarı (son notadaki bağ kaldırılır) */
const finaleBar16 = (b: string[]) => `:16 ${[...b, ...b.slice(0, 3), b[3].replace("{h}", "")].join(" ")}`;
const s6 = section(6, "Etütler", [
  chapter(P, 6, 0, "Akıcı Cümleler", ["Legato cümlelerde pena seyrek kullanılır: sadece vurgulanacak notalarda. Bu, sese 'konuşan' bir karakter verir."], [
    ders("Pentatonik Akış", 70, s16(70, [...slurred(groups(rev(pentaBox1), 4)).slice(0, 32)], END_A5), "Kutunun tepesinden kök La'ya inen akış.", "Vuruş başlarındaki notaları vurgula."),
    ders("Minör Akış", 60, x16(60, slurred(sixes(rev(aMinor3))), END_A5), "La minörde altılı kalıpla inen uzun bir cümle.", "Altılık: vuruş başına iki üçlü grup."),
    ders("Pozisyonlar Arası", 60, s16(60, slurred(groups(rev(aMinor4), 4)).slice(0, 48), END_A5), "4 nota/tel dizide tepeden inen dörtlüler.", "Her vuruş bir pozisyon kayması.", "", 2),
  ]),
  chapter(P, 6, 1, "Legato Etüdü", ["Etüt, La minör gamının sekiz bölgesinde dolaşır: ölçü başına iki telde bir grup. Pozisyonlar sapın kalın telinden ince teline çıkıp geri döner."], [
    ders("Sekizlik", 70, e8(70, etude.flat(), END_A5), "Sekiz ölçülük etüt, sekizlik notalarla.", "Her ölçünün ilk notası pena ile.", "", 2),
    ders("On Altılık", 55, tex(55, [...etude.map((b) => `:16 ${[...b, ...b].join(" ")}`), ...END_A5]), "Aynı etüt on altılıklarla.", "Her ölçüde kalıp iki kez döner.", "", 3),
    ders("Hedef Tempo", 75, tex(75, [...etude.map((b) => `:16 ${[...b, ...b].join(" ")}`), ...END_A5]), "Etüt hedef tempoda.", "Zorlandığın ölçüyü oynatıcıda seçip döngüye al.", "", 3),
  ]),
  chapter(P, 6, 2, "Final – Armonik Minör", ["Armonik minörde iki tellik gruplar: çık ve in. Dizi Am – Dm – E – Am akorlarının bölgelerinde dolaşır; Sol# notası La'ya güçlü bir çekim yaratır."], [
    ders("Final – Sekizlik", 70, e8(70, finale.flat(), END_A), "Armonik minör finali, sekizlik.", "Fa–Sol# atlamasında parmakları aç.", "", 2),
    ders("Final – On Altılık", 55, tex(55, [...finale.map(finaleBar16), ...END_A]), "Final on altılıklarla.", "Her ölçüde 12 notalık kalıp + 4 notalık tekrar.", "", 3),
    ders("Final – Hedef Tempo", 75, tex(75, [...finale.map(finaleBar16), ...END_A]), "Kursun son dersi.", "Bunu temiz çalabiliyorsan legato'nun tüm temellerine hakimsin.", "", 3),
  ]),
]);

export const legatoCourse: Course = {
  slug: "legato",
  title: "Legato",
  description: "Hammer-on ve pull-off ile akıcı, bağlı cümleler.",
  kind: "technique",
  icon: "∿",
  guide: [
    "## Legato nedir?",
    "Notaları pena yerine sol elle çalmak: hammer-on (parmağı tele vurmak) ve pull-off (parmağı telden çekerek bırakmak). Pena her telin ilk notasında ya da vurgulanacak notalarda kullanılır; geri kalanı akar.",
    "## Nasıl çalışılır?",
    "Hedef, pena ile çalınan ve legato çalınan notaların aynı yükseklikte duyulmasıdır. Bunun için sol el parmakları güçlü ve bağımsız olmalı. Distortion legato'yu kolaylaştırır ama hataları gizler; ara sıra temiz seste çalış.",
    "## Kurs planı",
    "Bölüm 1 – Temeller: hammer-on, pull-off, trill, kromatik legato, tel değişimi.",
    "Bölüm 2 – Pentatonik legato: kutular, sekanslar, cümleler.",
    "Bölüm 3 – 3 nota/tel: Sol majör, La minör, altılı kalıp, Dorian.",
    "Bölüm 4 – Trill ve dayanıklılık: parmak çiftleri, açık tel pedalı.",
    "Bölüm 5 – Pozisyon ve genişlik: slide, 4 nota/tel, geniş aralıklar, armonik minör, tel atlama.",
    "Bölüm 6 – Etütler.",
  ],
  sections: [s1, s2, s3, s4, s5, s6],
};
