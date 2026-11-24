// Modlar dersi (Teori › Armoni › Ünite 5): altı A4 yaprak. Kök (majör gamın dereceleri, göreceli bakış) → paralel bakış
// ve parlaklık sırası → majör karakterli modlar → minör karakterli modlar → sapta üç ana pozisyon ve eşlik (vamp) →
// karşılaştırma tablosu ve melodik minör modlarına giriş. Anlatım özgündür; yaklaşım Levine, Schmeling (Berklee),
// Kostka–Payne ve Türkçe ders notlarındaki (dizi + derece değişikliği) anlatımla uyumludur. Şarkılar yalnız adıyla anılır.
// Formüller, parlaklık sırası, vamp akorları ve sap şemaları scripts/teori-dogrula.mjs ile denetlenir.
import type { Ders } from "./tipler.ts";
import { gamNoktalari } from "./yardim.ts";

const LEVINE = "Mark Levine — The Jazz Theory Book";
const BERKLEE = "Paul Schmeling — Berklee Music Theory";
const KOSTKA = "Stefan Kostka, Dorothy Payne — Tonal Harmony";

const sap = (kok: string, formul: string, perde: [number, number], baslik: string, vurgu?: string[]) => ({
  t: "gorsel" as const,
  g: {
    tur: "sap" as const,
    baslik,
    etiket: "aralik" as const,
    kok,
    perde,
    kalip: formul.split(" ").map((s) => ({ "1": 0, b2: 1, "2": 2, b3: 3, "3": 4, "4": 5, "#4": 6, b5: 6, "5": 7, b6: 8, "6": 9, b7: 10, "7": 11 })[s]!),
    tam: true,
    noktalar: gamNoktalari({ kok, formul, perde, etiket: "aralik", vurgu }),
  },
});

export const MODLAR_DERSI: Ders = {
  slug: "modlar",
  baslik: "Modlar",
  seviye: 3,
  ozet: "Majör gamın yedi modu: kökü, formülü, karakter notası, parlaklık sırası, sapta pozisyonları, eşliği ve kullanıldığı müzik.",
  tanim: [
    "**Mod**, bir gamın notalarını farklı bir dereceden başlatıp o dereceyi **merkez** (karar sesi) kabul etmektir. Majör gamın yedi derecesinden yedi mod doğar. Adları Antik Yunan bölgelerinden gelir; bugünkü anlamları Orta Çağ kilise modlarından ve caz kuramından kalmıştır.",
    "Modlara iki yoldan bakılır. **Göreceli bakış:** aynı notalar, başka merkez (Do majörün notaları Re'den = Re Doryen). **Paralel bakış:** aynı kök, başka formül (Do İyonyen, Do Doryen …). Göreceli bakış modun nereden geldiğini, paralel bakış nasıl **duyulduğunu** öğretir.",
  ],
  kural: [
    { t: "gorsel", g: { tur: "adim", baslik: "Kök: Do majör gamı ve dereceleri. Her mod bu yedi adımın başka bir yerden başlamasıdır.", notalar: ["C", "D", "E", "F", "G", "A", "B", "C"], adimlar: ["T", "T", "Y", "T", "T", "T", "Y"], dereceler: ["1", "2", "3", "4", "5", "6", "7", "1"] } },
    {
      t: "tablo",
      genis: true,
      tablo: {
        baslik: "Göreceli bakış: Do majörün notalarıyla yedi mod",
        bas: ["Derece", "Mod", "Kök", "Formül", "Notalar"],
        satirlar: [
          ["1", "İyonyen (Ionian)", "C", "1 2 3 4 5 6 7", "C D E F G A B"],
          ["2", "Doryen (Dorian)", "D", "1 2 b3 4 5 6 b7", "D E F G A B C"],
          ["3", "Frigyen (Phrygian)", "E", "1 b2 b3 4 5 b6 b7", "E F G A B C D"],
          ["4", "Lidyen (Lydian)", "F", "1 2 3 #4 5 6 7", "F G A B C D E"],
          ["5", "Miksolidyen (Mixolydian)", "G", "1 2 3 4 5 6 b7", "G A B C D E F"],
          ["6", "Eolyen (Aeolian)", "A", "1 2 b3 4 5 b6 b7", "A B C D E F G"],
          ["7", "Lokriyen (Locrian)", "B", "1 b2 b3 4 b5 b6 b7", "B C D E F G A"],
        ],
        dogrula: { tur: "mod", ana: "major", derece: 0, formul: 3, kok: "C", notalar: 4 },
      },
    },
    { t: "p", m: "Kısa yol: Do majörde (piyanonun beyaz tuşları) **Re**'den Doryen, **Mi**'den Frigyen, **Fa**'dan Lidyen, **Sol**'dan Miksolidyen, **La**'dan Eolyen, **Si**'den Lokriyen çıkar. Başka bir kökte mod bulmak için önce ana majörü bul: La Doryen = Sol majörün notaları (La, Sol majörün 2. derecesi)." },
  ],
  gitarda: [
    sap("C", "1 2 3 4 5 6 7", [7, 10], "Do majörün notaları 7–10. perdelerde: aynı kutu, yedi ayrı merkez (kök mavi = Do)."),
    { t: "p", m: "Bu kutuda Re'yi merkez yapıp Re'den Re'ye çalarsan Re Doryen, La'dan La'ya çalarsan La Eolyen duyulur. Notalar aynı; merkezi **eşlik** (bas notası ya da akor) belirler." },
  ],
  kulakla: [
    { t: "p", m: "Aynı yedi notayı iki farklı merkezden dinle. Kulak başladığın ve bittiğin notayı ev kabul eder." },
    {
      t: "dinle",
      ornekler: [
        { ad: "Do'dan Do'ya: İyonyen", tip: "dizi", notalar: ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4"], beklenen: { kalip: [0, 2, 4, 5, 7, 9, 11, 12] } },
        { ad: "Re'den Re'ye: Doryen", tip: "dizi", notalar: ["D3", "E3", "F3", "G3", "A3", "B3", "C4", "D4"], beklenen: { kalip: [0, 2, 3, 5, 7, 9, 10, 12] } },
        { ad: "La'dan La'ya: Eolyen", tip: "dizi", notalar: ["A2", "B2", "C3", "D3", "E3", "F3", "G3", "A3"], beklenen: { kalip: [0, 2, 3, 5, 7, 8, 10, 12] } },
      ],
    },
  ],
  ekYapraklar: [
    {
      kisimlar: [
        {
          baslik: "Paralel bakış: aynı kök, yedi renk",
          bloklar: [
            { t: "p", m: "Bütün modları **aynı kökten** çal: fark doğrudan kulağına gelir. En parlaktan en karanlığa dizince her satırda **tek bir nota yarım ses iner**. Bu sıraya **parlaklık sırası** denir." },
            {
              t: "tablo",
              genis: true,
              tablo: {
                baslik: "Parlaklık sırası (kök Do)",
                bas: ["Mod", "Formül", "Notalar", "Değişen nota"],
                satirlar: [
                  ["Lidyen", "1 2 3 #4 5 6 7", "C D E F# G A B", "en parlak"],
                  ["İyonyen", "1 2 3 4 5 6 7", "C D E F G A B", "♯4 → 4"],
                  ["Miksolidyen", "1 2 3 4 5 6 b7", "C D E F G A Bb", "7 → ♭7"],
                  ["Doryen", "1 2 b3 4 5 6 b7", "C D Eb F G A Bb", "3 → ♭3"],
                  ["Eolyen", "1 2 b3 4 5 b6 b7", "C D Eb F G Ab Bb", "6 → ♭6"],
                  ["Frigyen", "1 b2 b3 4 5 b6 b7", "C Db Eb F G Ab Bb", "2 → ♭2"],
                  ["Lokriyen", "1 b2 b3 4 b5 b6 b7", "C Db Eb F Gb Ab Bb", "5 → ♭5, en karanlık"],
                ],
                dogrula: { tur: "parlaklik", kok: "C", formul: 1, notalar: 2 },
              },
            },
          ],
        },
        {
          baslik: "Karakter notası",
          bloklar: [
            { t: "p", m: "Her modu en yakın **majör** ya da **doğal minör** gamla karşılaştır; aradaki tek fark modun **karakter notasıdır**. Doğaçlamada bu notayı vurgulamak modu duyurur." },
            {
              t: "liste",
              m: [
                "**Majör aile** (3'lü büyük): Lidyen = majör + **♯4**, İyonyen = majör, Miksolidyen = majör + **♭7**.",
                "**Minör aile** (3'lü küçük): Doryen = minör + **6**, Eolyen = doğal minör, Frigyen = minör + **♭2**.",
                "**Lokriyen**: minör + **♭2** ve **♭5**; kök akoru eksik (m7♭5) olduğundan merkez zayıftır.",
              ],
            },
          ],
        },
        {
          baslik: "Modu duyurmak: tonik ve karakter akoru",
          bloklar: [
            { t: "p", m: "Modu duymak için iki akorluk bir **vamp** yeter: biri tonik, öbürü karakter notasını taşıyan akor. Vamp tonik üzerinde döndükçe kulak merkezi kaybetmez." },
            {
              t: "tablo",
              genis: true,
              tablo: {
                baslik: "Kök Do'da modal vamplar",
                bas: ["Mod", "Dereceler", "Akorlar", "Tonik yedili", "Karakter notası akorda"],
                satirlar: [
                  ["Lidyen", "I II", "C D", "Cmaj7(♯11)", "D akorunda F♯"],
                  ["İyonyen", "I IV", "C F", "Cmaj7", "F akorunda F"],
                  ["Miksolidyen", "I ♭VII", "C Bb", "C7", "B♭ akorunda B♭"],
                  ["Doryen", "i IV", "Cm F", "Cm7", "F akorunda A"],
                  ["Eolyen", "i ♭VI ♭VII", "Cm Ab Bb", "Cm7", "A♭ akorunda A♭"],
                  ["Frigyen", "i ♭II", "Cm Db", "Cm7", "D♭ akorunda D♭"],
                  ["Lokriyen", "i° ♭II", "C° Db", "Cm7♭5", "C° akorunda G♭"],
                ],
                dogrula: { tur: "yuruyus", romen: 1, tonlar: { 2: "C" } },
              },
            },
          ],
        },
      ],
    },
    {
      kisimlar: [
        {
          baslik: "İyonyen (majör gam)",
          bloklar: [
            {
              t: "liste",
              m: [
                "**Formül** 1 2 3 4 5 6 7 · **akor** Imaj7 · **karakter**: 4 ve 7 (yeden ses kökü çeker).",
                "Pop, rock, halk ve klasik müziğin ana dili. 4. derece (Do'da F) majör akorun 3'lüsüne sürtüşür; üzerinde durulmaz, geçilir.",
                "Örnek: The Beatles — “Let It Be”.",
              ],
            },
          ],
        },
        {
          baslik: "Lidyen",
          bloklar: [
            {
              t: "liste",
              m: [
                "**Formül** 1 2 3 ♯4 5 6 7 · **akor** Imaj7(♯11) · **karakter**: ♯4. Majörün 4. derecesinden başlar (Fa Lidyen = Do majörün notaları).",
                "En parlak mod: rüya gibi, havada, sinema müziği rengi. ♯4 sürtüşme yaratmaz, bu yüzden üzerinde uzun durulabilir.",
                "Vamp: I – II (C – D). Örnekler: Joe Satriani — “Flying in a Blue Dream”, Steve Vai — “For the Love of God”.",
              ],
            },
            sap("C", "1 2 3 #4 5 6 7", [7, 10], "Do Lidyen (7–10. perdeler); ♯4 (F♯) turuncu.", ["#4"]),
          ],
        },
        {
          baslik: "Miksolidyen",
          bloklar: [
            {
              t: "liste",
              m: [
                "**Formül** 1 2 3 4 5 6 ♭7 · **akor** I7 · **karakter**: ♭7. Majörün 5. derecesinden başlar; dominant 7 akorunun gamıdır.",
                "Blues-rock, country, funk ve folk rock'ın majörü: çözülmeye zorlamayan dominant rengi.",
                "Vamp: I – ♭VII (C – B♭) ya da I – ♭VII – IV. Örnekler: The Beatles — “Norwegian Wood”, Lynyrd Skynyrd — “Sweet Home Alabama”.",
              ],
            },
            sap("A", "1 2 3 4 5 6 b7", [4, 8], "La Miksolidyen (4–8. perdeler); ♭7 (G) turuncu.", ["b7"]),
          ],
        },
      ],
    },
    {
      kisimlar: [
        {
          baslik: "Doryen",
          bloklar: [
            {
              t: "liste",
              m: [
                "**Formül** 1 2 ♭3 4 5 6 ♭7 · **akor** i7 (m7, m6) · **karakter**: büyük 6. Majörün 2. derecesinden başlar.",
                "Parlak minör: funk, soul, Latin rock ve modal caz. Minör pentatoniğe 2 ve 6 eklenmiş hâli gibi çalınır.",
                "Vamp: i – IV (Am7 – D). Örnekler: Santana — “Oye Como Va”, Miles Davis — “So What”, Pink Floyd — “Another Brick in the Wall (Part 2)”.",
              ],
            },
            sap("A", "1 2 b3 4 5 6 b7", [4, 8], "La Doryen (4–8. perdeler); 6 (F♯) turuncu.", ["6"]),
          ],
        },
        {
          baslik: "Eolyen (doğal minör)",
          bloklar: [
            {
              t: "liste",
              m: [
                "**Formül** 1 2 ♭3 4 5 ♭6 ♭7 · **akor** i7 · **karakter**: ♭6. Majörün 6. derecesinden başlar (paralel minör).",
                "Hüzünlü ve ağır; rock baladı, metal, pop. i – ♭VI – ♭VII kalıbı bu modun imzasıdır.",
                "Vamp: i – ♭VI – ♭VII (Am – F – G). Örnek: Bob Dylan — “All Along the Watchtower”.",
              ],
            },
          ],
        },
        {
          baslik: "Frigyen",
          bloklar: [
            {
              t: "liste",
              m: [
                "**Formül** 1 ♭2 ♭3 4 5 ♭6 ♭7 · **akor** i7 · **karakter**: ♭2. Majörün 3. derecesinden başlar.",
                "Karanlık ve gergin: metal riffleri, flamenko. ♭2'den köke yarım ses iniş tehdit gibi duyulur.",
                "Vamp: i – ♭II (Em – F). Türk müziğindeki **Kürdi** dizisi gitarda Frigyene çok yakındır (yaklaşık eşleme).",
              ],
            },
            sap("E", "1 b2 b3 4 5 b6 b7", [0, 4], "Mi Frigyen (0–4. perdeler); ♭2 (F) turuncu.", ["b2"]),
          ],
        },
        {
          baslik: "Lokriyen",
          bloklar: [
            {
              t: "liste",
              m: [
                "**Formül** 1 ♭2 ♭3 4 ♭5 ♭6 ♭7 · **akor** iø7 (m7♭5) · **karakter**: ♭5. Majörün 7. derecesinden başlar.",
                "Tonik akoru eksik olduğu için ev kurmak zordur; çoğu zaman yalnız m7♭5 akorunun gamı olarak kullanılır (minör ii–V'nin ii'si).",
                "Ağır metalde kısa riff renklerinde duyulur; Björk'ün “Army of Me” şarkısı sık örnek verilir.",
              ],
            },
          ],
        },
      ],
    },
    {
      kisimlar: [
        {
          baslik: "Sapta üç ana pozisyon (La Doryen)",
          bloklar: [
            { t: "p", m: "Her modu sapta en az üç yerde bil: kök **6. telde**, kök **4. telde** ve kök **5. telde**. Pozisyonlar birbirine bağlanır; aynı notalar sapın bir ucundan öbürüne yayılır." },
            sap("A", "1 2 b3 4 5 6 b7", [4, 8], "1. pozisyon: kök 6. tel 5. perde (4–8).", ["6"]),
            sap("A", "1 2 b3 4 5 6 b7", [7, 10], "2. pozisyon: kök 4. tel 7. perde (7–10).", ["6"]),
            sap("A", "1 2 b3 4 5 6 b7", [11, 15], "3. pozisyon: kök 5. tel 12. perde (11–15).", ["6"]),
            {
              t: "liste",
              m: [
                "Bir pozisyonda **kökleri** önce bul (mavi), sonra karakter notasını (turuncu).",
                "Başka bir modu aynı pozisyonda çalmak için kökü kaydırma, yalnız karakter notasını değiştir: La Doryen → La Eolyen = F♯ → F.",
                "Sap Gezgini'nde her modun 3 nota/tel kalıplarını (7 kalıp) açabilirsin.",
              ],
            },
          ],
        },
        {
          baslik: "Eşlikle çalışmak",
          bloklar: [
            { t: "p", m: "Modu yalnız gam olarak çalmak onu öğretmez; bir **vamp** üzerinde çalmak öğretir. Vamp'ı kaydet ya da döngü pedalı kullan; önce kökte ve karakter notasında dur, sonra kısa cümleler kur." },
            {
              t: "dinle",
              ornekler: [
                { ad: "Lidyen vamp: C – D", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["D3", "F#3", "A3"], ["C3", "E3", "G3"], ["D3", "F#3", "A3"]], beklenen: { ton: "C", romen: ["I", "II", "I", "II"] } },
                { ad: "Doryen vamp: Am7 – D", tip: "akorlar", akorlar: [["A2", "C3", "E3", "G3"], ["D3", "F#3", "A3"], ["A2", "C3", "E3", "G3"], ["D3", "F#3", "A3"]], beklenen: { ton: "A", romen: ["i7", "IV", "i7", "IV"] } },
                { ad: "Miksolidyen vamp: G – F – C – G", tip: "akorlar", akorlar: [["G2", "B2", "D3"], ["F2", "A2", "C3"], ["C3", "E3", "G3"], ["G2", "B2", "D3"]], beklenen: { ton: "G", romen: ["I", "♭VII", "IV", "I"] } },
                { ad: "Frigyen vamp: Em – F", tip: "akorlar", akorlar: [["E2", "G2", "B2"], ["F2", "A2", "C3"], ["E2", "G2", "B2"], ["F2", "A2", "C3"]], beklenen: { ton: "E", romen: ["i", "♭II", "i", "♭II"] } },
              ],
            },
          ],
        },
      ],
    },
    {
      kisimlar: [
        {
          baslik: "Karşılaştırma",
          bloklar: [
            {
              t: "tablo",
              genis: true,
              tablo: {
                baslik: "Yedi mod bir bakışta",
                bas: ["Mod", "Aile", "Karakter", "Tonik akor", "Nerede duyulur"],
                satirlar: [
                  ["Lidyen", "majör", "♯4", "maj7(♯11)", "film müziği, füzyon, rüya sahneleri"],
                  ["İyonyen", "majör", "4, 7", "maj7", "pop, rock, halk, klasik"],
                  ["Miksolidyen", "majör", "♭7", "7", "blues-rock, country, funk"],
                  ["Doryen", "minör", "6", "m7, m6", "funk, soul, modal caz, Latin rock"],
                  ["Eolyen", "minör", "♭6", "m7", "rock baladı, metal, pop"],
                  ["Frigyen", "minör", "♭2", "m7", "metal, flamenko"],
                  ["Lokriyen", "eksik", "♭2, ♭5", "m7♭5", "minör ii–V, metal renkleri"],
                ],
              },
            },
          ],
        },
        {
          baslik: "Melodik ve armonik minörün modlarına giriş",
          bloklar: [
            { t: "p", m: "Aynı yöntem başka gamlara da uygulanır: **melodik minörü** (1 2 ♭3 4 5 6 7) ve **armonik minörü** (1 2 ♭3 4 5 ♭6 7) her derecesinden başlatınca yeni modlar çıkar. Cazda en çok kullanılanlar şunlardır:" },
            {
              t: "tablo",
              tablo: {
                baslik: "Sık kullanılan minör aile modları (kök Sol)",
                bas: ["Mod", "Ana gam ve derece", "Formül", "Kullanıldığı akor"],
                satirlar: [
                  ["Lidyen dominant", "melodik · 4", "1 2 3 #4 5 6 b7", "G7"],
                  ["Alterli", "melodik · 7", "1 b2 b3 b4 b5 b6 b7", "G7"],
                  ["Lokriyen ♮2", "melodik · 6", "1 2 b3 4 b5 b6 b7", "Gm7b5"],
                  ["Frigyen dominant", "armonik · 5", "1 b2 3 4 5 b6 b7", "G7"],
                ],
                dogrula: { tur: "mod", ana: 1, derece: 1, formul: 2, modKok: "G" },
              },
            },
            { t: "p", m: "Ayrıntı ve sapta şekiller: **Armonik ve Melodik Minör** dersi. Türk müziğindeki **Hicaz** dizisi gitarda çoğu zaman Frigyen dominantla karşılanır (makamdaki koma sesleri nedeniyle yaklaşık)." },
          ],
        },
      ],
    },
  ],
  dene: [
    "La Doryen'i Am7 – D vamp'ı üzerinde 1. pozisyonda çal; her cümleyi La'da ya da F♯'de bitir.",
    "Aynı kökten (Do) yedi modu parlaklık sırasıyla çal; her satırda değişen notayı yüksek sesle söyle.",
    "Mi Frigyen'i açık 6. teli çınlatarak çal ve F'de dur; sonra Mi Eolyen'e (F♯) geç.",
    "Sevdiğin bir şarkının tonik akorunu ve karakter notasını bularak modunu adlandır.",
    "Sap Gezgini'nde Sol Miksolidyen'in 3 nota/tel kalıplarını sırayla çal (1 → 7).",
  ],
  ipucu: [
    "Mod gamla değil **merkezle** duyulur: Do majör yürüyüşü üzerinde Re'den başlamak Doryen yapmaz; bas Re'de durmalı.",
    "Modlar arası farkı ezberleme, **tek nota farkını** duy: Doryen ile Eolyen arasında yalnız 6 vardır.",
    "Türkçe kaynaklarda modlar “dizi” olarak, doğal majör ve minörün belirli derecelerinin tizleşmesi ya da pesleşmesiyle anlatılır: Lidyen = IV. derecesi tizleşmiş majör, Frigyen = II. derecesi pesleşmiş minör.",
  ],
  sonraki: { metin: "Gam Aileleri: modları ve minör gamları kulakla tanımak." },
  kaynaklar: [LEVINE, BERKLEE, KOSTKA, "Mark Sarnecki — Elementary Music Rudiments", "Open Music Theory (University of Nebraska) — Diatonic Modes", "Ankara Üniversitesi Açık Ders — Müzik Teorisi: Modlar"],
  kesif: { set: "dorian", root: 9 },
};
