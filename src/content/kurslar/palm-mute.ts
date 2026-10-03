// Palm Mute — 4 bölüm, özgün egzersiz ve riff'ler.
import type { Course } from "../types.ts";
import { POWER, fx, pm, tex } from "../tex.ts";
import { chapter, ders, section } from "./ortak.ts";

const P = "pm";
const B5 = "(2.5 4.4)";
const CH: Record<string, string> = { ...POWER, B5 };

/**
 * Ritim kalıbından ölçü. Karakterler:
 *   x = susturulmuş açık Mi, o = açık (susturulmamış) Mi, - = sus,
 *   büyük harf = susturulmamış power chord (E, F, G, A, B, C, D), küçük harf (e,f,g,a,b,c,d) = susturulmuş
 *   (x ve o dışında; küçük e/f… harfleri akorlar için)
 * `down` true ise bütün vuruşlar aşağı pena; değilse ölçüdeki yerine göre aşağı/yukarı.
 */
function grid(pattern: string, duration: ":8" | ":16", down = false): string {
  const tokens = [...pattern].map((c, i) => {
    const stroke = down || i % 2 === 0 ? "sd" : "su";
    if (c === "-") return "r";
    if (c === "x") return `0.6{pm ${stroke}}`;
    if (c === "o") return `0.6{${stroke}}`;
    const name = `${c.toUpperCase()}5`;
    const chord = CH[name];
    if (!chord) throw new Error(`Bilinmeyen akor: ${c}`);
    return fx(c === c.toLowerCase() ? pm(chord) : chord, stroke);
  });
  return `${duration} ${tokens.join(" ")}`;
}
const e = (p: string, down = false) => grid(p, ":8", down);
const s = (p: string, down = false) => grid(p, ":16", down);

const s1 = section(1, "Temeller", [
  chapter(P, 1, 0, "Açık Mi'de Palm Mute", [
    "Palm mute: sağ elin avuç içi kenarını köprünün hemen önünde tellere hafifçe koymak. Ses kısalır, kalınlaşır ve 'vurucu' olur.",
    "Avuç içi köprüden uzaklaştıkça ses daha boğuk, yaklaştıkça daha açık olur.",
  ], [
    ders("Dörtlük ve Sekizlik", 80, tex(80, [`:4 ${["sd", "sd", "sd", "sd"].map((x) => `0.6{pm ${x}}`).join(" ")}`, e("xxxxxxxx", true), `:4 ${["sd", "sd", "sd", "sd"].map((x) => `0.6{pm ${x}}`).join(" ")}`, e("xxxxxxxx", true)]), "Açık Mi telinde susturulmuş dörtlük ve sekizlikler, hep aşağı pena.", ["Avuç içi teli tamamen boğmasın; nota hâlâ duyulmalı.", "Hep aşağı pena: rock ve metal ritimlerinin standart sesi."]),
    ders("On Altılık", 80, tex(80, [s("xxxxxxxxxxxxxxxx"), s("xxxxxxxxxxxxxxxx"), s("xxxxxxxxxxxxxxxx"), e("xxxxxxxx", true)]), "Susturulmuş on altılıklar, aşağı-yukarı pena.", "Yukarı vuruşlar aşağılar kadar güçlü olsun."),
    ders("Hız Merdiveni", 80, tex(80, [e("xxxxxxxx", true), s("xxxxxxxxxxxxxxxx"), e("xxxxxxxx", true), s("xxxxxxxxxxxxxxxx")]), "Sekizlik ve on altılık arasında gidip gel.", "Geçişte avuç içi yerinden kaymasın.", "", 2),
  ]),
  chapter(P, 1, 1, "Açık ve Kapalı", ["Riff'lerde susturulmuş ve açık notaların karışımı dinamik yaratır: susturulmuş notalar 'motor', açık notalar 'vurgu'dur."], [
    ders("Vuruşta Açık", 80, tex(80, [e("oxxxoxxx", true), e("oxxxoxxx", true), e("oxxxoxxx", true), e("oxoxoxox", true)]), "Her vuruşun başı açık, aradakiler susturulmuş.", "Avuç içini açık notada hafifçe kaldır, hemen geri koy."),
    ders("Arada Açık", 80, tex(80, [e("xxoxxxox", true), e("xxoxxxox", true), e("xxoxxxox", true), e("xxxxoooo", true)]), "Vurgu vuruşların arasında.", "Senkop: vurgunun zayıf zamana kayması."),
    ders("Akorlu Vurgu", 80, tex(80, [e("xxxxxxEE", true), e("xxxxxxGG", true), e("xxxxxxAA", true), e("xxxxxxGG", true)]), "Susturulmuş Mi'ler ve ölçü sonunda açık power chord'lar.", "Akora geçerken avuç içini kaldır.", "E5 – G5 – A5: Mi minörün i – III – IV dereceleri üzerinde power chord'lar.", 2),
  ]),
  chapter(P, 1, 2, "Power Chord", ["Power chord (5'li akor) kök ve beşliden oluşur. Majör ya da minör değildir, bu yüzden distortion altında temiz kalır."], [
    ders("Susturulmuş Akorlar", 80, tex(80, [e("eeeeeeee", true), e("gggggggg", true), e("aaaaaaaa", true), e("gggggggg", true)]), "E5 – G5 – A5 – G5, susturulmuş sekizlikler.", "Sol el akoru basarken kullanılmayan telleri sustursun.", "E5 = Mi + Si, G5 = Sol + Re, A5 = La + Mi."),
    ders("Açık – Kapalı Akor", 80, tex(80, [e("Eeeeeeee", true), e("Gggggggg", true), e("Aaaaaaaa", true), e("Cccccccc", true)]), "Her ölçünün ilk vuruşu açık akor.", "İlk vuruş çınlasın, sonra hemen sustur."),
    ders("İki Akor Bir Ölçü", 90, tex(90, [e("eeeegggg", true), e("aaaagggg", true), e("eeeegggg", true), e("aaaaCCCC", true)]), "Ölçü başına iki akor.", "Akor değişimi vuruşun tam başında.", "", 2),
  ]),
]);

const s2 = section(2, "Ritim Kalıpları", [
  chapter(P, 2, 0, "Galop", ["Galop: bir sekizlik + iki on altılık (ta-ka-ta). Atın dörtnalını andırır; klasik heavy metal ritmi."], [
    ders("Açık Mi'de Galop", 90, tex(90, ["x-xxx-xxx-xxx-xx", "x-xxx-xxx-xxx-xx", "x-xxx-xxx-xxx-xx", "x-xxx-xxx-xxEEEE"].map((p) => s(p))), "Susturulmuş Mi'de galop.", "On altılık ızgarada: aşağı – (boş) – aşağı – yukarı."),
    ders("Akorla Galop", 90, tex(90, ["e-eee-eee-eee-ee", "g-ggg-ggg-ggg-gg", "a-aaa-aaa-aaa-aa", "g-ggg-ggg-ggg-gg"].map((p) => s(p))), "Power chord'larla galop.", "Akorda galop daha yorucu: sağ el gevşek kalsın."),
    ders("Ters Galop", 90, tex(90, ["xx-xxx-xxx-xxx-x", "xx-xxx-xxx-xxx-x", "gg-ggg-ggg-ggg-g", "aa-aaa-aaa-aEEEE"].map((p) => s(p))), "İki on altılık + bir sekizlik (ta-ka-ta tersten).", "Ters galopta vurgu ölçünün başında değil.", "", 2),
  ]),
  chapter(P, 2, 1, "Senkop Riff'ler", ["Senkop: vurgunun zayıf zamana düşmesi. Açık akorları 've'lere koymak riff'e 'ileri itilen' bir his verir."], [
    ders("Arada Akor", 90, tex(90, [s("xxxxxxGxxxxxxxAx"), s("xxxxxxGxxxxxxxEx"), s("xxxxxxGxxxxxxxAx"), s("xxxxCxxxDxxxEEEE")]), "Susturulmuş on altılıkların arasında açık akorlar.", "Açık akorlar ızgaranın 've' ya da 'a' yerine düşer."),
    ders("Sus ile Senkop", 90, tex(90, [s("x-x-xx-Gx-x-xx-A"), s("x-x-xx-Gx-x-xx-E"), s("x-x-xx-Gx-x-xx-A"), s("C---D---E-------")]), "Susların arasında akor vurguları.", "Suslarda avuç içi telleri sustursun."),
    ders("Kesik Riff", 100, tex(100, [s("e-e-E---e-e-G---"), s("e-e-E---e-e-A---"), s("e-e-E---e-e-G---"), s("C-C-D-D-E-------")]), "Kısa susturulmuş vuruşlar ve uzun açık akorlar.", "Uzun akorları tam süresince tut.", "", 2),
  ]),
  chapter(P, 2, 2, "Pedal Riff", ["Pedal riff: açık Mi teli sürekli çalarken araya başka notalar girer. Açık Mi 'pedal tonu' görevi görür."], [
    ders("Mi Pedalı", 100, tex(100, [
    ":8 0.6{pm sd} 0.6{pm sd} 3.6{sd} 0.6{pm sd} 0.6{pm sd} 5.6{sd} 0.6{pm sd} 3.6{sd}",
    ":8 0.6{pm sd} 0.6{pm sd} 3.6{sd} 0.6{pm sd} 0.6{pm sd} 5.6{sd} 0.6{pm sd} 7.6{sd}",
    ":8 0.6{pm sd} 0.6{pm sd} 3.6{sd} 0.6{pm sd} 0.6{pm sd} 5.6{sd} 0.6{pm sd} 3.6{sd}",
    ":8 0.6{pm sd} 0.6{pm sd} 7.6{sd} 5.6{sd} 3.6{sd} 2.6{sd} :4 0.6{sd}",
  ]), "Açık Mi pedalı üzerinde Sol, La, Si notaları.", "Açık notalarda avuç içini kaldır.", "Sol (3), La (5), Si (7): Mi minör pentatoniğin notaları. 2. perde Fa#: Mi minörün 2. derecesi."),
    ders("Fa ile Frigyen", 100, tex(100, [
      ":8 0.6{pm sd} 0.6{pm sd} 1.6{sd} 0.6{pm sd} 0.6{pm sd} 1.6{sd} 0.6{pm sd} 3.6{sd}",
      ":8 0.6{pm sd} 0.6{pm sd} 1.6{sd} 0.6{pm sd} 0.6{pm sd} 1.6{sd} 0.6{pm sd} 5.6{sd}",
      ":8 0.6{pm sd} 0.6{pm sd} 1.6{sd} 0.6{pm sd} 0.6{pm sd} 1.6{sd} 0.6{pm sd} 3.6{sd}",
      `:8 ${fx(pm(POWER.F5), "sd")} ${fx(pm(POWER.F5), "sd")} ${fx(POWER.F5, "sd")} ${fx(POWER.F5, "sd")} :2 ${fx(POWER.E5, "sd")}`,
    ]), "Mi pedalı üzerinde Fa notası: karanlık, gergin bir ses.", "Fa notası açık Mi'nin yarım ses üstü; tam vurgulu çal.", "Mi Frigyen: Mi–Fa–Sol–La–Si–Do–Re. Kökün yarım ses üstündeki Fa (b2), modun 'karanlık' rengini verir; metal riff'lerinin klasik sesidir."),
    ders("On Altılık Pedal", 100, tex(100, [
      ":16 0.6{pm sd} 0.6{pm su} 0.6{pm sd} 0.6{pm su} 3.6{sd} 0.6{pm su} 0.6{pm sd} 0.6{pm su} 5.6{sd} 0.6{pm su} 0.6{pm sd} 0.6{pm su} 3.6{sd} 0.6{pm su} 1.6{sd} 0.6{pm su}",
      ":16 0.6{pm sd} 0.6{pm su} 0.6{pm sd} 0.6{pm su} 3.6{sd} 0.6{pm su} 0.6{pm sd} 0.6{pm su} 5.6{sd} 0.6{pm su} 0.6{pm sd} 0.6{pm su} 7.6{sd} 5.6{su} 3.6{sd} 1.6{su}",
      ":16 0.6{pm sd} 0.6{pm su} 0.6{pm sd} 0.6{pm su} 3.6{sd} 0.6{pm su} 0.6{pm sd} 0.6{pm su} 5.6{sd} 0.6{pm su} 0.6{pm sd} 0.6{pm su} 3.6{sd} 0.6{pm su} 1.6{sd} 0.6{pm su}",
      `:4 ${fx(POWER.E5, "sd")} r r r`,
    ]), "On altılık pedal riff'i.", "Aşağı-yukarı pena; açık notalar vuruşlarda.", "", 2),
  ]),
]);

const s3 = section(3, "Riff'ler", [
  chapter(P, 3, 0, "Rock Riff", ["Mi minörde rock riff'i: E5 – G5 – A5 – C5 – D5. Bu akorlar Mi minör pentatoniğin (Mi–Sol–La–Si–Re) ve gamının notaları üzerinde kurulur."], [
    ders("Riff – Yavaş", 90, tex(90, [e("eeeGeeAe", true), e("eeeGeeDC", true), e("eeeGeeAe", true), e("CCDDEEEE", true)]), "Susturulmuş Mi'ler arasında açık akorlar.", "Akor geçişlerinde sol el önceden hazır olsun."),
    ders("Riff – Orta", 120, tex(120, [e("eeeGeeAe", true), e("eeeGeeDC", true), e("eeeGeeAe", true), e("CCDDEEEE", true)]), "Aynı riff daha hızlı.", "Hep aşağı pena: bilek gevşek."),
    ders("Riff – Hedef", 140, tex(140, [e("eeeGeeAe", true), e("eeeGeeDC", true), e("eeeGeeAe", true), e("CCDDEEEE", true)]), "Hedef tempoda.", "Yorulursan tempoyu düşür; aşağı pena dayanıklılık ister.", "", 2),
  ]),
  chapter(P, 3, 1, "Punk Riff", ["Punk ritmi: hızlı, hep aşağı pena sekizlik power chord'lar. Em – C – G – D (i – VI – III – VII): binlerce şarkıda kullanılan bir dizi."], [
    ders("Yavaş", 120, tex(120, [e("eeeeeeee", true), e("cccccccc", true), e("gggggggg", true), e("dddddddd", true)]), "Em – C – G – D, susturulmuş sekizlikler.", "Akor değişimi vuruşun tam başında."),
    ders("Açık Vurgulu", 140, tex(140, [e("Eeeeeeee", true), e("Cccccccc", true), e("Gggggggg", true), e("Dddddddd", true)]), "Her akorun ilk vuruşu açık.", "Açık vuruşta avuç içini kaldır, sonra hemen geri koy."),
    ders("Hedef Tempo", 170, tex(170, [e("Eeeeeeee", true), e("Cccccccc", true), e("Gggggggg", true), e("DDDDdddd", true)]), "Punk hızında.", "Hep aşağı pena, kol değil bilek.", "", 2),
  ]),
  chapter(P, 3, 2, "Metal Riff", ["Metal riff'lerinde susturulmuş açık Mi ile yarım ses aralıklı notalar (Mi–Fa) birleşir: Frigyen modun karanlık rengi."], [
    ders("Chug ve Akor", 100, tex(100, [s("xxxxxxFxxxxxxxEx"), s("xxxxxxFxxxxxxxGx"), s("xxxxxxFxxxxxxxEx"), s("FFFFGGGGAAAAGGFF")]), "Susturulmuş on altılıklar ve F5/E5/G5 vurguları.", "On altılıklar eşit ve sıkı olsun."),
    ders("Galop ve Frigyen", 110, tex(110, [s("x-xxx-xxF-ffx-xx"), s("x-xxx-xxG-ggx-xx"), s("x-xxx-xxF-ffx-xx"), s("F-ffG-ggA-aaG-gg")]), "Galop ritminde Frigyen riff.", "Akor ve açık Mi arasında galop bozulmasın."),
    ders("Hedef Tempo", 130, tex(130, [s("x-xxx-xxF-ffx-xx"), s("x-xxx-xxG-ggx-xx"), s("x-xxx-xxF-ffx-xx"), s("F-ffG-ggA-aaG-gg")]), "Hedef tempoda.", "Sağ el gerilirse dur ve gevşet.", "", 2),
  ]),
]);

const etude = [
  e("eeeGeeAe", true), e("eeeGeeDC", true), s("x-xxx-xxF-ffx-xx"), s("x-xxx-xxG-ggx-xx"),
  e("Eeeeeeee", true), e("Cccccccc", true), s("xxxxxxGxxxxxxxAx"), s("C---D---E-------"),
];
const s4 = section(4, "Etüt", [
  chapter(P, 4, 0, "Palm Mute Etüdü", ["Etüt rock riff'i, galop, punk ve senkop kalıplarını sekiz ölçüde birleştirir. Ritim sürekli değişirken avuç içinin yeri sabit kalmalı."], [
    ders("Yavaş", 90, tex(90, etude), "Sekiz ölçülük etüt.", "Ritim değişimlerini önceden say.", "", 2),
    ders("Orta", 110, tex(110, etude), "Daha hızlı.", "Galop ölçülerinde sağ el gevşek.", "", 2),
    ders("Hedef Tempo", 130, tex(130, etude), "Hedef tempoda.", "Bunu temiz çalabiliyorsan palm mute'un temellerine hakimsin.", "", 3),
  ]),
]);

export const palmMuteCourse: Course = {
  slug: "palm-mute",
  title: "Palm Mute",
  description: "Avuç içiyle susturarak vurucu rock ve metal ritimleri.",
  kind: "technique",
  icon: "✋",
  guide: [
    "## Palm mute nedir?",
    "Sağ elin avuç içi kenarını köprünün hemen önüne, tellere hafifçe koyarak çalmak. Ses kısalır ve kalınlaşır; rock, punk ve metal ritimlerinin temel sesidir.",
    "## Nasıl çalışılır?",
    "Avuç içinin yeri sesi belirler: köprüye çok yakınsa susturma etkisizdir, çok uzaksa nota tamamen boğulur. Doğru yeri kulağınla bul ve riff boyunca orada tut. Açık (susturulmamış) vuruşlarda eli hafifçe kaldırıp hemen geri koy.",
    "## Kurs planı",
    "Bölüm 1 – Temeller: açık Mi, açık ve kapalı vuruşlar, power chord.",
    "Bölüm 2 – Ritim kalıpları: galop, senkop, pedal riff.",
    "Bölüm 3 – Riff'ler: rock, punk, metal.",
    "Bölüm 4 – Etüt.",
  ],
  sections: [s1, s2, s3, s4],
};
