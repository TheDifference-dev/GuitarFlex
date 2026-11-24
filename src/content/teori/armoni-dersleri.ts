// Armoni kitabının yeni dersleri (Teori › Armoni): işlevler ve kadanslar, akor ilerlemeleri, yedili akorlar, ikincil
// dominantlar, ii–V–I, gerilimler, armonik/melodik minör, ödünç akorlar ve akor-gam. Her ders tek A4 yaprağına sığar
// (minör aileleri iki yaprak). Metinler özgündür; kaynaklar her dersin sonunda. Notalar, akor şekilleri, Roma
// rakamları ve gam formülleri scripts/teori-dogrula.mjs ile bağımsız hesaplanarak denetlenir.
import type { Ders } from "./tipler.ts";
import { gamNoktalari } from "./yardim.ts";

const KOSTKA = "Stefan Kostka, Dorothy Payne — Tonal Harmony";
const LEVINE = "Mark Levine — The Jazz Theory Book";
const BERKLEE = "Paul Schmeling — Berklee Music Theory";
const CANGAL = "Nurhan Cangal — Armoni";
const NETTLES = "Barrie Nettles, Richard Graf — The Chord Scale Theory & Jazz Harmony";

export const ARMONI_DERSLERI: Ders[] = [
  {
    slug: "islevler-kadanslar",
    baslik: "İşlevler ve Kadanslar",
    seviye: 3,
    ozet: "Tonik, subdominant ve dominant aileleri; cümleyi bitiren dört kadans.",
    tanim: [
      "Tonun yedi akoru üç **işlev** ailesine ayrılır. **Tonik (T)** evdir: dinlenir. **Subdominant (S)** evden uzaklaşır. **Dominant (D)** gerilim yaratır ve eve dönmek ister. Türkçe armoni kitaplarında da aynı harfler kullanılır: T – S – D.",
      "Bir cümlenin son iki akoruna **kadans** denir. Kadans, noktalama işareti gibidir: nokta mı, virgül mü, soru mu?",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Do majörde işlevler",
          bas: ["Derece", "Akor", "İşlev", "Neden"],
          satirlar: [
            ["I", "C", "T", "tonun kendisi"],
            ["vi", "Am", "T (yedek)", "I ile iki ortak ses: C, E"],
            ["iii", "Em", "T ya da D", "I ve V ile ikişer ortak ses"],
            ["IV", "F", "S", "evden uzaklaşma"],
            ["ii", "Dm", "S", "IV ile iki ortak ses: F, A"],
            ["V", "G", "D", "yeden ses B, Do'ya çeker"],
            ["vii°", "B°", "D", "G7'nin kökü olmayan hâli: B D F"],
          ],
          dogrula: { tur: "diyatonik", tonlar: { 1: "C" } },
        },
      },
      {
        t: "liste",
        m: [
          "Tipik akış: **T → S → D → T** (I – IV – V – I, I – ii – V – I).",
          "V7'nin 3'lüsü (B) ile 7'lisi (F) arasında **tritone** (artık 4'lü) vardır: B → C, F → E çözülür.",
          "Rock'ta D → S (V → IV) geri dönüşü de sık duyulur; klasik armonide zayıf sayılır.",
        ],
      },
    ],
    gitarda: [
      {
        t: "tablo",
        tablo: {
          baslik: "Dört kadans (Do majör)",
          bas: ["Kadans", "Dereceler", "Akorlar", "Etki"],
          satirlar: [
            ["Tam (otantik)", "V I", "G C", "kesin bitiş: nokta"],
            ["Yarım", "I V", "C G", "askıda: virgül ya da soru"],
            ["Yarım (ii'den)", "ii V", "Dm G", "askıda, daha yumuşak"],
            ["Plagal", "IV I", "F C", "yumuşak bitiş, “amin”"],
            ["Aldatıcı", "V vi", "G Am", "beklenen eve girilmez"],
          ],
          dogrula: { tur: "yuruyus", romen: 1, tonlar: { 2: "C" } },
        },
      },
      {
        t: "gorsel",
        g: {
          tur: "akorlar",
          baslik: "Tam kadans açık pozisyonda: G7 → C. F, E'ye; B, C'ye iner ve çıkar.",
          akorlar: [
            { ad: "G7", sekil: "3 2 0 0 0 1", parmak: "3 2 0 0 0 1", kok: "G", formul: "1 3 5 b7", alt: "V7" },
            { ad: "C", sekil: "x 3 2 0 1 0", parmak: "0 3 2 0 1 0", kok: "C", formul: "1 3 5", alt: "I" },
            { ad: "F", sekil: "x x 3 2 1 1", parmak: "0 0 3 2 1 1", kok: "F", formul: "1 3 5", alt: "IV" },
            { ad: "Am", sekil: "x 0 2 2 1 0", parmak: "0 0 2 3 1 0", kok: "A", formul: "1 b3 5", alt: "vi" },
          ],
        },
      },
      { t: "p", m: "Minörde **Frigyen yarım kadans** (iv6 – V) flamenko rengini verir: La minörde Dm/F – E. Gitarda bunu Am – G – F – E (Endülüs kadansı) içinde duyarsın." },
    ],
    kulakla: [
      { t: "p", m: "Aynı başlangıçtan dört bitişi dinle. Her bitişte “bitti mi?” diye sor: tam kadansta evet, yarımda hayır, aldatıcıda “şaşırdım”." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Tam: I IV V I", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["F2", "A2", "C3"], ["G2", "B2", "D3"], ["C3", "E3", "G3"]], beklenen: { ton: "C", romen: ["I", "IV", "V", "I"] } },
          { ad: "Yarım: I vi IV V", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["A2", "C3", "E3"], ["F2", "A2", "C3"], ["G2", "B2", "D3"]], beklenen: { ton: "C", romen: ["I", "vi", "IV", "V"] } },
          { ad: "Plagal: I V IV I", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["G2", "B2", "D3"], ["F2", "A2", "C3"], ["C3", "E3", "G3"]], beklenen: { ton: "C", romen: ["I", "V", "IV", "I"] } },
          { ad: "Aldatıcı: I IV V vi", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["F2", "A2", "C3"], ["G2", "B2", "D3"], ["A2", "C3", "E3"]], beklenen: { ton: "C", romen: ["I", "IV", "V", "vi"] } },
        ],
      },
    ],
    dene: [
      "G7 → C geçişinde yalnız 1. ve 2. teli çal: F → E ve B → C yarım ses hareketlerini duy.",
      "C – Am – F – G'yi çal ve G'de dur (yarım kadans); sonra C'ye bitir (tam kadans).",
      "Aynı yürüyüşü G – Am ile bitir: aldatıcı kadansın “devam ediyor” hissini dinle.",
      "Sevdiğin bir şarkının nakaratının son iki akorunu bul ve kadansın adını yaz.",
    ],
    ipucu: [
      "İşlevi akorun adı değil tondaki yeri belirler: G akoru Do majörde D, Sol majörde T, Re majörde S işlevlidir.",
      "iii akoru iki yöne de bakar; işlevini önündeki ve arkasındaki akorlar belirler.",
    ],
    sonraki: { metin: "Akor İlerlemeleri: işlevleri sık kullanılan kalıplara dökmek." },
    kaynaklar: [KOSTKA, CANGAL, BERKLEE],
    kesif: { set: "major", root: 0 },
  },
  {
    slug: "ilerlemeler",
    baslik: "Akor İlerlemeleri",
    seviye: 3,
    ozet: "Kök hareketleri, sık kullanılan yürüyüşler, minör ton kalıpları ve 12 ölçü blues.",
    tanim: [
      "**Akor ilerlemesi**, akorların sırayla dizilişidir; Roma rakamıyla yazılınca her tona taşınır. Kök hareketi gücü belirler: **5'li aşağı** (V → I) en güçlü, **3'lü** (I → vi) yumuşak, **2'li adım** (IV → V) akıcı.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Sık ilerlemeler",
          bas: ["Ad", "Dereceler", "Do majör", "Sol majör"],
          satirlar: [
            ["Üç akor", "I IV V I", "C F G C", "G C D G"],
            ["Pop döngüsü", "I V vi IV", "C G Am F", "G D Em C"],
            ["50'ler", "I vi IV V", "C Am F G", "G Em C D"],
            ["Minör başlangıç", "vi IV I V", "Am F C G", "Em C G D"],
            ["Çember (5'li aşağı)", "vi ii V I", "Am Dm G C", "Em Am D G"],
            ["Caz kadansı", "ii V I", "Dm G C", "Am D G"],
          ],
          dogrula: { tur: "yuruyus", romen: 1, tonlar: { 2: "C", 3: "G" } },
        },
      },
      {
        t: "tablo",
        tablo: {
          baslik: "Minör ton kalıpları (La minör)",
          bas: ["Ad", "Dereceler", "Akorlar"],
          satirlar: [
            ["Minör kadans", "i iv V i", "Am Dm E Am"],
            ["Endülüs kadansı", "i ♭VII ♭VI V", "Am G F E"],
            ["Rock minör", "i ♭VI ♭VII i", "Am F G Am"],
          ],
          dogrula: { tur: "yuruyus", romen: 1, tonlar: { 2: "A" } },
          not: "Roma rakamları aynı kökteki majöre göre: ♭VI = F",
        },
      },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "sema",
          baslik: "12 ölçü blues, La'da: her akor dominant 7 (I7, IV7, V7).",
          genis: true,
          sema: {
            olcu: [4, 4],
            olculer: ["A7", "D7", "A7", "A7", "D7", "D7", "A7", "A7", "E7", "D7", "A7", "E7"].map((ad) => ({ akorlar: [{ ad, vurus: 4 }] })),
          },
        },
      },
      { t: "p", m: "Blues'ta üç akor da dominant 7'dir. 2. ölçüde IV7 (**hızlı IV**), 12. ölçüde V7 (**turnaround**) sık eklenir." },
    ],
    kulakla: [
      { t: "p", m: "Bası mırıldan: çember ilerlemesinde bas 5'li iner (A → D → G → C), Endülüs kadansında adım adım (A → G → F → E)." },
      {
        t: "dinle",
        ornekler: [
          { ad: "vi – ii – V – I", tip: "akorlar", akorlar: [["A2", "C3", "E3"], ["D3", "F3", "A3"], ["G2", "B2", "D3"], ["C3", "E3", "G3"]], beklenen: { ton: "C", romen: ["vi", "ii", "V", "I"] } },
          { ad: "Endülüs: Am G F E", tip: "akorlar", akorlar: [["A2", "C3", "E3"], ["G2", "B2", "D3"], ["F2", "A2", "C3"], ["E2", "G#2", "B2"]], beklenen: { ton: "A", romen: ["i", "♭VII", "♭VI", "V"] } },
          { ad: "Blues: A7 D7 E7 A7", tip: "akorlar", akorlar: [["A2", "C#3", "E3", "G3"], ["D3", "F#3", "A3", "C4"], ["E2", "G#2", "B2", "D3"], ["A2", "C#3", "E3", "G3"]], beklenen: { ton: "A", romen: ["I7", "IV7", "V7", "I7"] } },
        ],
      },
    ],
    dene: [
      "Tablodaki pop döngüsünü önce Do'da, sonra capo 2 ile aynı şekillerle çal: hangi tona geçtin?",
      "Am – G – F – E'yi dörtlüklerle çal; E akorunda G♯'nin La'ya çektiğini dinle.",
      "12 ölçü blues'u La'da A7 – D7 – E7 açık akorlarıyla çal; 9. ve 10. ölçüyü (V7 – IV7) say.",
      "Bir ilerleme seç, Roma rakamlarıyla yaz ve Re majöre aktar.",
    ],
    ipucu: [
      "Bir şarkıyı çözerken önce ilk ve son akoru bul: ton çoğu zaman bunlardan biridir.",
      "Minörde V akoru majör (E, G♯ ile) olunca kadans güçlenir; doğal minörün v'si (Em) yumuşak kalır.",
    ],
    sonraki: { metin: "Yedili Akorlar: ilerlemelere dördüncü sesi eklemek." },
    kaynaklar: [KOSTKA, BERKLEE, "Dave Rubin — 12-Bar Blues (Hal Leonard)"],
    kesif: { set: "major", root: 0 },
  },
  {
    slug: "yedili-akorlar",
    baslik: "Yedili Akorlar",
    seviye: 3,
    ozet: "Dört sesli akorların beş türü, tonun yedili akorları ve dominant 7'nin gerilimi.",
    tanim: [
      "Üç sesli akorun üstüne bir **üçlü daha** koyunca kökten 7'li aralık eklenir ve **dört sesli (yedili) akor** oluşur: 1 – 3 – 5 – 7. 7'linin büyük ya da küçük olması, alttaki üç sesliyle birlikte akorun türünü belirler.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Yedili akor türleri (kök Do)",
          bas: ["Tür", "Simge", "Formül", "Notalar"],
          satirlar: [
            ["Majör 7", "Cmaj7", "1 3 5 7", "C E G B"],
            ["Dominant 7", "C7", "1 3 5 b7", "C E G Bb"],
            ["Minör 7", "Cm7", "1 b3 5 b7", "C Eb G Bb"],
            ["Yarım eksik", "Cm7b5", "1 b3 b5 b7", "C Eb Gb Bb"],
            ["Eksik 7", "Cdim7", "1 b3 b5 bb7", "C Eb Gb B𝄫"],
            ["Minör majör 7", "CmMaj7", "1 b3 5 7", "C Eb G B"],
          ],
          dogrula: { tur: "akor", ad: 1, notalar: 3, formul: 2 },
        },
      },
      {
        t: "tablo",
        tablo: {
          baslik: "Majör tonun yedili akorları",
          bas: ["Derece", "Do majör", "Sol majör", "Fa majör"],
          satirlar: [
            ["I", "Cmaj7", "Gmaj7", "Fmaj7"],
            ["ii", "Dm7", "Am7", "Gm7"],
            ["iii", "Em7", "Bm7", "Am7"],
            ["IV", "Fmaj7", "Cmaj7", "Bbmaj7"],
            ["V", "G7", "D7", "C7"],
            ["vi", "Am7", "Em7", "Dm7"],
            ["viiø", "Bm7b5", "F#m7b5", "Em7b5"],
          ],
          dogrula: { tur: "diyatonik", tonlar: {}, yedili: { 1: "C", 2: "G", 3: "F" } },
        },
      },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "akorlar",
          baslik: "Açık pozisyonda yedili akorlar (Do majörün dereceleri).",
          genis: true,
          akorlar: [
            { ad: "Cmaj7", sekil: "x 3 2 0 0 0", parmak: "0 3 2 0 0 0", kok: "C", formul: "1 3 5 7", alt: "Imaj7" },
            { ad: "Dm7", sekil: "x x 0 2 1 1", parmak: "0 0 0 2 1 1", kok: "D", formul: "1 b3 5 b7", alt: "ii7" },
            { ad: "Em7", sekil: "0 2 0 0 0 0", parmak: "0 2 0 0 0 0", kok: "E", formul: "1 b3 5 b7", alt: "iii7" },
            { ad: "Fmaj7", sekil: "x x 3 2 1 0", parmak: "0 0 3 2 1 0", kok: "F", formul: "1 3 5 7", alt: "IVmaj7" },
            { ad: "G7", sekil: "3 2 0 0 0 1", parmak: "3 2 0 0 0 1", kok: "G", formul: "1 3 5 b7", alt: "V7" },
            { ad: "Am7", sekil: "x 0 2 0 1 0", parmak: "0 0 2 0 1 0", kok: "A", formul: "1 b3 5 b7", alt: "vi7" },
            { ad: "Bm7b5", sekil: "x 2 3 2 3 x", parmak: "0 1 3 2 4 0", kok: "B", formul: "1 b3 b5 b7", alt: "viiø7" },
          ],
        },
      },
    ],
    kulakla: [
      { t: "p", m: "Aynı kökte dört türü dinle: maj7 yumuşak ve parlak, 7 gergin ve hareketli, m7 sıcak, m7♭5 karanlık ve askıda." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Cmaj7", tip: "akor", notalar: ["C3", "E3", "G3", "B3"], beklenen: { formul: "1 3 5 7" } },
          { ad: "C7", tip: "akor", notalar: ["C3", "E3", "G3", "Bb3"], beklenen: { formul: "1 3 5 b7" } },
          { ad: "Cm7", tip: "akor", notalar: ["C3", "Eb3", "G3", "Bb3"], beklenen: { formul: "1 b3 5 b7" } },
          { ad: "Cm7♭5", tip: "akor", notalar: ["C3", "Eb3", "Gb3", "Bb3"], beklenen: { formul: "1 b3 b5 b7" } },
        ],
      },
    ],
    dene: [
      "Tablodaki yedi açık akoru sırayla çal ve derecesini söyle: Imaj7, ii7, iii7 …",
      "C → Cmaj7 → C7 geçişinde yalnız bir notayı değiştir (C → B → B♭): 5. telde değil 3. telde.",
      "G7'yi Cmaj7'ye çöz; sonra G'yi C'ye çöz ve farkı dinle.",
      "Fa majörün yedili akorlarını tablodan oku ve Gm7 – C7 – Fmaj7'yi çal.",
    ],
    ipucu: [
      "Kalıp her majör tonda aynıdır: maj7, m7, m7, maj7, 7, m7, m7♭5. Tonda tek dominant 7 akoru V7'dir.",
      "m7♭5 ile dim7'yi karıştırma: dim7'de 7'li bir yarım ses daha iner (𝄫7 = 6 ile aynı perde).",
      "Blues'ta I, IV ve V'nin üçü de dominant 7 çalınır; bu kural dışı renk bilinçli bir tercihtir.",
    ],
    sonraki: { metin: "Modlar: tonun her derecesinden başlayan gamlar." },
    kaynaklar: [KOSTKA, LEVINE, "Ted Greene — Chord Chemistry"],
    kesif: { set: "maj7", root: 0 },
  },
  {
    slug: "ikincil-dominantlar",
    baslik: "İkincil Dominantlar",
    seviye: 4,
    ozet: "Tonun her akoruna kendi V7'si: yazımı, bulunuşu, çözülmesi ve sapta şekli.",
    tanim: [
      "Tonun bir akoru, kısa bir an için “ev” gibi davranabilir. Ona tam 5'li yukarıdan çözülen dominant 7 akoruna **ikincil dominant** denir ve **V7/x** diye yazılır: “x'in dominantı”. Türkçe kaynaklarda **ara dominant** da denir; V/V'ye **çift dominant** adı verilir.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Do majörde ikincil dominantlar",
          bas: ["Etiket", "Akor", "Notalar", "Çözüldüğü akor"],
          satirlar: [
            ["V7/ii", "A7", "A C# E G", "Dm"],
            ["V7/iii", "B7", "B D# F# A", "Em"],
            ["V7/IV", "C7", "C E G Bb", "F"],
            ["V7/V", "D7", "D F# A C", "G"],
            ["V7/vi", "E7", "E G# B D", "Am"],
          ],
          dogrula: { tur: "romen", ton: "C", romen: 0, akor: 1, notalar: 2 },
        },
      },
      {
        t: "liste",
        m: [
          "Bulmak için: hedef akorun kökünden **tam 5'li yukarı** çık ve oraya bir **dominant 7** kur.",
          "Akorun 3'lüsü tonun dışındadır (A7'de C♯): bu nota hedefin köküne **yarım ses** çeker (C♯ → D).",
          "vii° akorunun ikincil dominantı yoktur: eksik akor ev olamaz.",
        ],
      },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "akorlar",
          baslik: "Açık pozisyonda ikincil dominantlar ve hedefleri (Do majör).",
          genis: true,
          akorlar: [
            { ad: "A7", sekil: "x 0 2 0 2 0", parmak: "0 0 2 0 3 0", kok: "A", formul: "1 3 5 b7", alt: "V7/ii" },
            { ad: "Dm", sekil: "x x 0 2 3 1", parmak: "0 0 0 2 3 1", kok: "D", formul: "1 b3 5", alt: "ii" },
            { ad: "D7", sekil: "x x 0 2 1 2", parmak: "0 0 0 2 1 3", kok: "D", formul: "1 3 5 b7", alt: "V7/V" },
            { ad: "G", sekil: "3 2 0 0 0 3", parmak: "2 1 0 0 0 3", kok: "G", formul: "1 3 5", alt: "V" },
            { ad: "E7", sekil: "0 2 0 1 0 0", parmak: "0 2 0 1 0 0", kok: "E", formul: "1 3 5 b7", alt: "V7/vi" },
            { ad: "Am", sekil: "x 0 2 2 1 0", parmak: "0 0 2 3 1 0", kok: "A", formul: "1 b3 5", alt: "vi" },
          ],
        },
      },
      { t: "p", m: "İkincil dominant çoğu zaman bir **ii–V** içinde gelir: Em7 – A7 – Dm (ii–V/ii). Gamda A7'nin üstünde C yerine C♯ çal; geri kalan notalar tonun notalarıdır." },
    ],
    kulakla: [
      { t: "p", m: "C – A7 – Dm – G7 – C dizisinde A7 geldiğinde kulak tonun dışına çıkar ama kaybolmaz: C♯ hemen D'ye çözülür." },
      {
        t: "dinle",
        ornekler: [
          { ad: "I – V7/ii – ii – V7 – I", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["A2", "C#3", "E3", "G3"], ["D3", "F3", "A3"], ["G2", "B2", "D3", "F3"], ["C3", "E3", "G3"]], beklenen: { ton: "C", romen: ["I", "V7/ii", "ii", "V7", "I"] } },
          { ad: "I – V7/V – V – I", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["D3", "F#3", "A3", "C4"], ["G2", "B2", "D3"], ["C3", "E3", "G3"]], beklenen: { ton: "C", romen: ["I", "V7/V", "V", "I"] } },
          { ad: "I – V7/vi – vi", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["E2", "G#2", "B2", "D3"], ["A2", "C3", "E3"]], beklenen: { ton: "C", romen: ["I", "V7/vi", "vi"] } },
        ],
      },
    ],
    dene: [
      "C – A7 – Dm – G7 – C'yi çal; A7'de 3. teldeki C♯'yi (2. perde) ayrıca vur.",
      "C – E7 – Am – F ilerlemesini çal: E7, Am'ye çekiyor mu?",
      "Sol majörde V7/V'yi bul (A7) ve G – A7 – D – G çal.",
      "Bir pop döngüsünde vi'den önce V7/vi ekle: C – G – E7 – Am – F.",
    ],
    ipucu: [
      "İkincil dominant tonu değiştirmez, yalnız hedef akoru vurgular. Hedef uzun süre ev olursa buna **modülasyon** denir.",
      "Yazımda hedefin harfini koru: Do majörde V7/ii, A – C♯ – E – G'dir, A – D♭ – E – G değil.",
    ],
    sonraki: { metin: "ii–V–I: cazın temel kadansı." },
    kaynaklar: [KOSTKA, LEVINE, CANGAL],
    kesif: { set: "7", root: 9 },
  },
  {
    slug: "ii-v-i",
    baslik: "ii–V–I",
    seviye: 4,
    ozet: "Majör ve minör ii–V–I, kılavuz sesler ve sapta iki bölgede çalmak.",
    tanim: [
      "**ii – V – I**, kökleri 5'li aşağı (4'lü yukarı) giden üç akordur: S → D → T. Cazın ve pop baladlarının temel kadansıdır. Majörde **iim7 – V7 – Imaj7**, minörde **iiø7 – V7 – i** (V7, armonik minörden) çalınır.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Majör ii–V–I",
          bas: ["Ton", "ii7", "V7", "Imaj7"],
          satirlar: [
            ["C", "Dm7", "G7", "Cmaj7"],
            ["F", "Gm7", "C7", "Fmaj7"],
            ["Bb", "Cm7", "F7", "Bbmaj7"],
            ["G", "Am7", "D7", "Gmaj7"],
            ["D", "Em7", "A7", "Dmaj7"],
          ],
          dogrula: { tur: "romen", ton: 0, sutunlar: { 1: "ii7", 2: "V7", 3: "Imaj7" } },
        },
      },
      {
        t: "tablo",
        tablo: {
          baslik: "Minör ii–V–i",
          bas: ["Ton", "iiø7", "V7", "i"],
          satirlar: [
            ["A", "Bm7b5", "E7", "Am"],
            ["D", "Em7b5", "A7", "Dm"],
            ["E", "F#m7b5", "B7", "Em"],
            ["C", "Dm7b5", "G7", "Cm"],
          ],
          dogrula: { tur: "romen", ton: 0, sutunlar: { 1: "iiø7", 2: "V7", 3: "i" } },
        },
      },
      { t: "p", m: "**Kılavuz sesler** akorların 3'lüsü ve 7'lisidir. Dm7'nin 7'lisi (C), G7'nin 3'lüsüne (B) iner; G7'nin 7'lisi (F), Cmaj7'nin 3'lüsüne (E) iner. Bu yarım ses inişleri ilerlemeyi dinleyicinin kulağına taşır." },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "akorlar",
          baslik: "Do majörde ii–V–I, iki bölgede: kökler 5. ve 6. telde.",
          akorlar: [
            { ad: "Dm7", sekil: "x 5 7 5 6 5", parmak: "0 1 3 1 2 1", kok: "D", formul: "1 b3 5 b7", alt: "ii7" },
            { ad: "G7", sekil: "3 5 3 4 3 3", parmak: "1 3 1 2 1 1", kok: "G", formul: "1 3 5 b7", alt: "V7" },
            { ad: "Cmaj7", sekil: "x 3 5 4 5 3", parmak: "0 1 3 2 4 1", kok: "C", formul: "1 3 5 7", alt: "Imaj7" },
            { ad: "Am7", sekil: "5 7 5 5 5 5", parmak: "1 3 1 1 1 1", kok: "A", formul: "1 b3 5 b7", alt: "ii7 (Sol)" },
            { ad: "D7", sekil: "x 5 7 5 7 5", parmak: "0 1 3 1 4 1", kok: "D", formul: "1 3 5 b7", alt: "V7 (Sol)" },
            { ad: "Gmaj7", sekil: "3 x 4 4 3 x", parmak: "1 0 3 4 2 0", kok: "G", formul: "1 3 5 7", alt: "Imaj7 (Sol)" },
          ],
          genis: true,
        },
      },
    ],
    kulakla: [
      { t: "p", m: "Önce yalnız kılavuz sesleri dinle (iki ses), sonra tam akorları. Her akorda bir notanın yarım ses indiğini izle." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Dm7 – G7 – Cmaj7", tip: "akorlar", akorlar: [["D3", "F3", "A3", "C4"], ["G2", "B2", "D3", "F3"], ["C3", "E3", "G3", "B3"]], beklenen: { ton: "C", romen: ["ii7", "V7", "Imaj7"] } },
          { ad: "Kılavuz sesler: F+C → F+B → E+B", tip: "akorlar", akorlar: [["F3", "C4"], ["F3", "B3"], ["E3", "B3"]] },
          { ad: "Bm7♭5 – E7 – Am", tip: "akorlar", akorlar: [["B2", "D3", "F3", "A3"], ["E2", "G#2", "B2", "D3"], ["A2", "C3", "E3"]], beklenen: { ton: "A", romen: ["iiø7", "V7", "i"] } },
        ],
      },
    ],
    dene: [
      "Dm7 – G7 – Cmaj7'yi şekildeki barre biçimleriyle çal; el 5. perdeden 3. perdeye kısa yol alsın.",
      "Yalnız 3. ve 2. teli çal: kılavuz seslerin yarım ses inişlerini duy.",
      "Tablodaki beş tonda ii–V–I'yi aynı şekillerle kaydırarak çal.",
      "La minörde Bm7♭5 – E7 – Am çal; E7'nin G♯'si Am'nin A'sına çıkar.",
    ],
    ipucu: [
      "ii–V'yi tek bir “dominant bölgesi” gibi düşün: Dm7 – G7 üzerinde aynı gamı (Do majör) çalabilirsin.",
      "Minörde ii'nin 5'lisi eksiktir (B – D – F – A); bu yüzden iiø7 yazılır.",
    ],
    sonraki: { metin: "Gerilimler: akorlara 9, 11 ve 13 eklemek." },
    kaynaklar: [LEVINE, BERKLEE, "Jody Fisher — The Complete Jazz Guitar Method"],
    kesif: { set: "m7", root: 2 },
  },
  {
    slug: "gerilimler",
    baslik: "Gerilimler: 9, 11, 13",
    seviye: 4,
    ozet: "Yedili akorun üstündeki dereceler, değiştirilmiş gerilimler ve kaçınılacak notalar.",
    tanim: [
      "Yedili akorun üstüne üçlü yığmaya devam edince **9, 11 ve 13** gelir. Bunlar gamın 2., 4. ve 6. derecelerinin bir oktav yukarısıdır ve **gerilim** (tension) diye anılır. Gerilim akoru zenginleştirir; türünü değiştirmez, çünkü türü 3'lü ve 7'li belirler.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Gerilimli akorlar (kök Do)",
          bas: ["Akor", "Formül", "Notalar", "Renk"],
          satirlar: [
            ["C9", "1 3 5 b7 9", "C E G Bb D", "dominant, yumuşak"],
            ["Cmaj9", "1 3 5 7 9", "C E G B D", "açık, parlak"],
            ["Cm9", "1 b3 5 b7 9", "C Eb G Bb D", "sıcak minör"],
            ["C7b9", "1 3 5 b7 b9", "C E G Bb Db", "karanlık dominant"],
            ["C7#9", "1 3 5 b7 #9", "C E G Bb D#", "blues-rock"],
            ["C7#11", "1 3 5 b7 9 #11", "C E G Bb D F#", "Lidyen dominant"],
            ["C13", "1 3 5 b7 9 13", "C E G Bb D A", "funk, soul"],
            ["Cm11", "1 b3 5 b7 9 11", "C Eb G Bb D F", "modal minör"],
          ],
          dogrula: { tur: "akor", ad: 0, notalar: 2, formul: 1 },
        },
      },
      {
        t: "liste",
        m: [
          "Gerilimler **9, 11, 13** diye yazılır, 2, 4, 6 değil: akor 7'liyi de içerir. 7'si olmayan akorda **add9** ya da **6** yazılır (Cadd9, C6).",
          "Dominant 7'de gerilimler değiştirilebilir: **♭9, ♯9, ♯11, ♭13** (alterasyon). Majör ve minör akorlarda çoğu zaman yalnız 9, 11, 13 (majörde ♯11).",
          "**Kaçınılacak nota:** majör akorlarda 11 (Do akorunda F), 3'lünün yarım ses üstünde sürtüşür; ya ♯11 yapılır ya geçerek çalınır.",
        ],
      },
    ],
    gitarda: [
      { t: "p", m: "Gitarda beş, altı sesi birden basmak zordur: **5'li ve bazen kök atılır**. Kök basçıda ise akorun karakteri 3, 7 ve gerilimdedir." },
      {
        t: "gorsel",
        g: {
          tur: "akorlar",
          baslik: "5. telde kökü olan gerilimli Do akorları.",
          akorlar: [
            { ad: "C9", sekil: "x 3 2 3 3 3", parmak: "0 2 1 3 3 3", kok: "C", formul: "1 3 5 b7 9" },
            { ad: "Cmaj9", sekil: "x 3 2 4 3 3", parmak: "0 2 1 4 3 3", kok: "C", formul: "1 3 5 7 9" },
            { ad: "Cm9", sekil: "x 3 1 3 3 3", parmak: "0 2 1 3 3 3", kok: "C", formul: "1 b3 5 b7 9" },
            { ad: "C7b9", sekil: "x 3 2 3 2 3", parmak: "0 2 1 3 1 4", kok: "C", formul: "1 3 5 b7 b9" },
          ],
        },
      },
    ],
    kulakla: [
      { t: "p", m: "Önce C7'yi, sonra aynı akoru 9 ve ♭9 ile dinle. 9 akoru yumuşatır, ♭9 gerer ve çözülme isteğini artırır." },
      {
        t: "dinle",
        ornekler: [
          { ad: "C7", tip: "akor", notalar: ["C3", "E3", "G3", "Bb3"], beklenen: { formul: "1 3 5 b7" } },
          { ad: "C9", tip: "akor", notalar: ["C3", "E3", "Bb3", "D4", "G4"], beklenen: { formul: "1 3 5 b7 9" } },
          { ad: "C7♭9", tip: "akor", notalar: ["C3", "E3", "Bb3", "Db4", "G4"], beklenen: { formul: "1 3 5 b7 b9" } },
          { ad: "Cmaj9", tip: "akor", notalar: ["C3", "E3", "B3", "D4", "G4"], beklenen: { formul: "1 3 5 7 9" } },
        ],
      },
    ],
    dene: [
      "C7 – C9 – C7♭9 – F sırasını çal; ♭9'un F akoruna nasıl çektiğini dinle.",
      "Cmaj9'u Fmaj9'a taşı (aynı şekil, 8. perde) ve iki akoru dörtlüklerle değiştir.",
      "Cm9 üzerinde Do Doryen çal; 9 (D) ve 11 (F) notalarında dur.",
      "Bir funk ritminde C9'u yalnız ince dört telde (5'li olmadan) kısa vuruşlarla çal.",
    ],
    ipucu: [
      "Akor simgesini okurken önce türü (7, maj7, m7) bul, sonra gerilimleri ekle: C7(♭9, ♭13) bir dominanttır.",
      "Gerilim seçimi gamdan gelir: hangi gamı çaldığını biliyorsan uygun gerilimi de bilirsin (Akor-Gam Eşleme).",
    ],
    sonraki: { metin: "Armonik ve Melodik Minör: alterli gerilimlerin geldiği gamlar." },
    kaynaklar: [LEVINE, NETTLES, BERKLEE],
    kesif: { set: "7", root: 0 },
  },
  {
    slug: "minor-aileleri",
    baslik: "Armonik ve Melodik Minör",
    seviye: 4,
    ozet: "Doğal, armonik ve melodik minör; armonik minörün Frigyen dominantı ve melodik minörün modları.",
    tanim: [
      "Doğal minörde 7. derece kökün **tam ses** altındadır; çözülme zayıf kalır. Minör tonlar bu yüzden iki yolla “düzeltilir”: **armonik minör** yalnız 7'yi yükseltir (V majör, V7 olur), **melodik minör** 6'yı ve 7'yi yükseltir (artık 2'li kalkar). Caz pratiğinde melodik minör çıkarken de inerken de aynı çalınır.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Üç minör (kök La)",
          bas: ["Gam", "Formül", "Notalar", "Ayırt eden"],
          satirlar: [
            ["Doğal minör", "1 2 b3 4 5 b6 b7", "A B C D E F G", "Eolyen ile aynı"],
            ["Armonik minör", "1 2 b3 4 5 b6 7", "A B C D E F G#", "♭6 – 7 arası artık 2'li"],
            ["Melodik minör", "1 2 b3 4 5 6 7", "A B C D E F# G#", "majörün ♭3'lüsü"],
          ],
          dogrula: { tur: "gam", kok: "A", formul: 1, notalar: 2 },
        },
      },
      { t: "gorsel", g: { tur: "adim", baslik: "La armonik minör: Fa – Sol♯ arası artık 2'li (A, bir buçuk ses).", notalar: ["A", "B", "C", "D", "E", "F", "G#", "A"], adimlar: ["T", "Y", "T", "T", "Y", "A", "Y"], dereceler: ["1", "2", "b3", "4", "5", "b6", "7", "1"], vurgu: [6] } },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: { tur: "sap", baslik: "La armonik minör, 5. pozisyon (4–8. perdeler); 7 turuncu.", etiket: "aralik", kok: "A", perde: [4, 8], kalip: [0, 2, 3, 5, 7, 8, 11], tam: true, noktalar: gamNoktalari({ kok: "A", formul: "1 2 b3 4 5 b6 7", perde: [4, 8], etiket: "aralik", vurgu: ["7"] }) },
      },
      {
        t: "gorsel",
        g: { tur: "sap", baslik: "La melodik minör, 5. pozisyon (4–8. perdeler); 6 ve 7 turuncu.", etiket: "aralik", kok: "A", perde: [4, 8], kalip: [0, 2, 3, 5, 7, 9, 11], tam: true, noktalar: gamNoktalari({ kok: "A", formul: "1 2 b3 4 5 6 7", perde: [4, 8], etiket: "aralik", vurgu: ["6", "7"] }) },
      },
      {
        t: "gorsel",
        g: { tur: "sap", baslik: "Mi Frigyen dominant (0–4. perdeler): La armonik minörün notaları, merkez Mi; ♭2 ve 3 turuncu.", etiket: "aralik", kok: "E", perde: [0, 4], kalip: [0, 1, 4, 5, 7, 8, 10], tam: true, noktalar: gamNoktalari({ kok: "E", formul: "1 b2 3 4 5 b6 b7", perde: [0, 4], etiket: "aralik", vurgu: ["b2", "3"] }) },
      },
      { t: "p", m: "Türk müziğindeki **Hicaz** dizisi gitarda çoğu zaman Frigyen dominantla çalınır; makamda koma sesleri olduğundan bu bir yaklaşık eşlemedir." },
    ],
    kulakla: [
      { t: "p", m: "Üç minörü aynı kökten art arda dinle. Armonik minörde ♭6 – 7 sıçraması doğu ezgilerini, melodik minörde üst yarı majörü andırır." },
      {
        t: "dinle",
        ornekler: [
          { ad: "La doğal minör", tip: "dizi", notalar: ["A2", "B2", "C3", "D3", "E3", "F3", "G3", "A3"], beklenen: { kalip: [0, 2, 3, 5, 7, 8, 10, 12] } },
          { ad: "La armonik minör", tip: "dizi", notalar: ["A2", "B2", "C3", "D3", "E3", "F3", "G#3", "A3"], beklenen: { kalip: [0, 2, 3, 5, 7, 8, 11, 12] } },
          { ad: "La melodik minör", tip: "dizi", notalar: ["A2", "B2", "C3", "D3", "E3", "F#3", "G#3", "A3"], beklenen: { kalip: [0, 2, 3, 5, 7, 9, 11, 12] } },
        ],
      },
    ],
    ekYapraklar: [
      {
        kisimlar: [
          {
            baslik: "Armonik minörün akorları ve Frigyen dominant",
            bloklar: [
              { t: "p", m: "Armonik minörün 7'si yükselince V majör, V7 dominant olur: La minörde **E7 → Am** tam kadansı. Armonik minörü **5. derecesinden** (Mi'den) çalarsan **Frigyen dominant** çıkar: 1 ♭2 3 4 5 ♭6 ♭7. Minörde V7 akorunun gamıdır; flamenko, metal ve Doğu Akdeniz rengi buradan gelir." },
              {
                t: "tablo",
                tablo: {
                  baslik: "Armonik minörün modları",
                  bas: ["Derece", "Mod", "Formül", "Kullanıldığı akor"],
                  satirlar: [
                    ["1", "Armonik minör", "1 2 b3 4 5 b6 7", "AmMaj7"],
                    ["2", "Lokriyen ♮6", "1 b2 b3 4 b5 6 b7", "Bm7b5"],
                    ["3", "İyonyen artık", "1 2 3 4 #5 6 7", "C+"],
                    ["4", "Doryen ♯4", "1 2 b3 #4 5 6 b7", "Dm7"],
                    ["5", "Frigyen dominant", "1 b2 3 4 5 b6 b7", "E7"],
                    ["6", "Lidyen ♯2", "1 #2 3 #4 5 6 7", "Fmaj7"],
                    ["7", "Süper Lokriyen 𝄫7", "1 b2 b3 b4 b5 b6 bb7", "G#dim7"],
                  ],
                  dogrula: { tur: "mod", ana: "harmonic", derece: 0, formul: 2, kok: "A" },
                },
              },
            ],
          },
          {
            baslik: "Melodik minörün modları",
            bloklar: [
              {
                t: "tablo",
                tablo: {
                  baslik: "Melodik minörün modları (kök La) ve akorları",
                  bas: ["Derece", "Mod", "Formül", "Kullanıldığı akor"],
                  satirlar: [
                    ["1", "Melodik minör", "1 2 b3 4 5 6 7", "AmMaj7"],
                    ["2", "Doryen ♭2", "1 b2 b3 4 5 6 b7", "Bm7"],
                    ["3", "Lidyen artık", "1 2 3 #4 #5 6 7", "C+"],
                    ["4", "Lidyen dominant", "1 2 3 #4 5 6 b7", "D7"],
                    ["5", "Miksolidyen ♭13", "1 2 3 4 5 b6 b7", "E7"],
                    ["6", "Lokriyen ♮2", "1 2 b3 4 b5 b6 b7", "F#m7b5"],
                    ["7", "Alterli (süper Lokriyen)", "1 b2 b3 b4 b5 b6 b7", "G#7"],
                  ],
                  dogrula: { tur: "mod", ana: "melodic", derece: 0, formul: 2, kok: "A" },
                },
              },
              {
                t: "liste",
                m: [
                  "**Lidyen dominant** (4. mod): 7(♯11) akorunun gamı. Re'de: D E F♯ G♯ A B C.",
                  "**Alterli** (7. mod): dominantın bütün gerilimleri değişmiştir: ♭9, ♯9, ♭5 (♯11), ♯5 (♭13). Sol alterli = La♭ melodik minörün notaları; G7alt akorunda çalınır.",
                  "**Lokriyen ♮2** (6. mod): m7♭5 akorunda 9'u (♮2) da kullanmak için.",
                  "Melodik minörün modlarını bulmanın kısa yolu: **akorun yarım ses üstündeki melodik minör = alterli**, **5'li üstündeki melodik minör = Lidyen dominant**.",
                ],
              },
              { t: "gorsel", g: { tur: "adim", baslik: "Sol alterli: La♭ melodik minörün notaları, merkez Sol (gerilim adlarıyla ♭9 ♯9 3 ♭5 ♯5 ♭7).", notalar: ["G", "Ab", "Bb", "Cb", "Db", "Eb", "F", "G"], adimlar: ["Y", "T", "Y", "T", "T", "T", "T"], dereceler: ["1", "b2", "b3", "b4", "b5", "b6", "b7", "1"] } },
            ],
          },
        ],
      },
    ],
    dene: [
      "Am – E7 – Am çal; E7 üzerinde La armonik minör çal ve G♯'de dur.",
      "E7 vamp üzerinde Mi Frigyen dominantı 0–4. perdelerde çal: F – G♯ arasındaki sıçramayı vurgula.",
      "D7(♯11) üzerinde Re Lidyen dominant çal; G♯'yi (♯11) uzun tut.",
      "G7alt – Cm ilerlemesinde Sol alterli (La♭ melodik minör) çal, sonra Do minöre çöz.",
    ],
    ipucu: [
      "Armonik minörü sürekli çalmak ezgiyi tek renge boyar; çoğu zaman yalnız V7 akorunda kullanılır.",
      "Melodik minörün modlarını ayrı ayrı ezberleme: ana gamı (melodik minör) ve dereceyi bil, gerisi döndürmedir.",
      "Klasik kuramda melodik minör inerken doğal minöre döner; caz kuramında (Levine) iki yönde de aynıdır.",
    ],
    sonraki: { metin: "Ödünç Akorlar ve Modal Karışım: paralel minörden renk almak." },
    kaynaklar: [LEVINE, KOSTKA, NETTLES],
    kesif: { set: "harmonic-minor", root: 9 },
  },
  {
    slug: "odunc-akorlar",
    baslik: "Ödünç Akorlar ve Modal Karışım",
    seviye: 5,
    ozet: "Paralel minörden (ve modlardan) akor ödünç almak: iv, ♭III, ♭VI, ♭VII ve kullanım yerleri.",
    tanim: [
      "Majör tonda çalarken aynı kökteki **paralel minörün** akorlarını kısa süre kullanmaya **ödünç akor** ya da **modal karışım** (modal interchange) denir. Do majörde Fm, A♭ ya da B♭ duyulur, ama ev hâlâ Do'dur. Ödünç akor şarkıya hüzün, güç ya da sinema rengi katar.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Do majörde sık ödünç akorlar (Do minörden)",
          bas: ["Derece", "Akor", "Notalar", "Renk"],
          satirlar: [
            ["iv", "Fm", "F Ab C", "hüzün, “eve dönüş”"],
            ["♭VI", "Ab", "Ab C Eb", "geniş, sinematik"],
            ["♭VII", "Bb", "Bb D F", "rock, güç"],
            ["♭III", "Eb", "Eb G Bb", "parlak sürpriz"],
            ["iiø7", "Dm7b5", "D F Ab C", "minör ii–V'ye hazırlık"],
          ],
          dogrula: { tur: "romen", ton: "C", romen: 0, akor: 1, notalar: 2 },
        },
      },
      {
        t: "liste",
        m: [
          "Ödünç akorların ortak noktası **♭3, ♭6, ♭7** notalarıdır (Do'da E♭, A♭, B♭).",
          "Başka modlardan da ödünç alınır: Miksolidyenden ♭VII, Lidyenden II (D majör), Frigyenden ♭II (D♭).",
          "Tersi de olur: minör şarkının sonunda majör tonik (**Pikardi üçlüsü**) çalınır.",
        ],
      },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "akorlar",
          baslik: "Do majörde ödünç akorlar, barre şekilleriyle.",
          akorlar: [
            { ad: "Fm", sekil: "1 3 3 1 1 1", parmak: "1 3 4 1 1 1", kok: "F", formul: "1 b3 5", alt: "iv" },
            { ad: "Ab", sekil: "4 6 6 5 4 4", parmak: "1 3 4 2 1 1", kok: "Ab", formul: "1 3 5", alt: "♭VI" },
            { ad: "Bb", sekil: "x 1 3 3 3 1", parmak: "0 1 3 3 3 1", kok: "Bb", formul: "1 3 5", alt: "♭VII" },
            { ad: "Eb", sekil: "x 6 8 8 8 6", parmak: "0 1 3 3 3 1", kok: "Eb", formul: "1 3 5", alt: "♭III" },
          ],
        },
      },
      { t: "p", m: "Solo çalarken ödünç akorun notasına uy: F – Fm geçişinde A'yı A♭'ye indir; B♭ akorunda Do majör yerine Do Miksolidyen (B♭'li) çal." },
    ],
    kulakla: [
      { t: "p", m: "IV – iv geçişinde tek nota (A → A♭) değişir; bu küçük iniş şarkıya bir anlık hüzün verir. ♭VI – ♭VII – I ise zafer gibi duyulur." },
      {
        t: "dinle",
        ornekler: [
          { ad: "I – IV – iv – I", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["F2", "A2", "C3"], ["F2", "Ab2", "C3"], ["C3", "E3", "G3"]], beklenen: { ton: "C", romen: ["I", "IV", "iv", "I"] } },
          { ad: "I – ♭VI – ♭VII – I", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["Ab2", "C3", "Eb3"], ["Bb2", "D3", "F3"], ["C3", "E3", "G3"]], beklenen: { ton: "C", romen: ["I", "♭VI", "♭VII", "I"] } },
          { ad: "I – ♭VII – IV – I", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["Bb2", "D3", "F3"], ["F2", "A2", "C3"], ["C3", "E3", "G3"]], beklenen: { ton: "C", romen: ["I", "♭VII", "IV", "I"] } },
        ],
      },
    ],
    dene: [
      "C – F – Fm – C çal; Fm'de 3. teldeki A♭'yi ayrıca duyur.",
      "C – A♭ – B♭ – C'yi barre şekilleriyle çal; ♭VI – ♭VII – I'in gücünü dinle.",
      "Sol majörde ♭VII'yi bul (F) ve G – F – C – G çal.",
      "La minör bir yürüyüşü A majörle bitir (Pikardi üçlüsü).",
    ],
    ipucu: [
      "Ödünç akor tonu değiştirmez; kısa kalır ve eve döner. Uzun süre kalırsa ton değişmiş (modülasyon) olabilir.",
      "Roma rakamı aynı kökteki majöre göre yazılır: Do majörde A♭ = ♭VI, Am = vi.",
    ],
    sonraki: { metin: "Akor-Gam Eşleme: her akora doğru gamı seçmek." },
    kaynaklar: [KOSTKA, BERKLEE, NETTLES],
    kesif: { set: "minor", root: 0 },
  },
  {
    slug: "akor-gam",
    baslik: "Akor-Gam Eşleme",
    seviye: 5,
    ozet: "Her akora bir gam: diyatonik akorların modları, dominantların gamları ve seçimin üç adımı.",
    tanim: [
      "**Akor-gam** yaklaşımı, her akoru bir gamın parçası gibi düşünür: akorun sesleri (1, 3, 5, 7) gamın iskeletidir, aradaki notalar tonun öbür notalarından gelir. Böylece akor değiştikçe gamın merkezi ve rengi değişir, ama notaların çoğu aynı kalır.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Do majörün akorları ve modları",
          bas: ["Akor", "Derece", "Mod", "Notalar"],
          satirlar: [
            ["Cmaj7", "Imaj7", "İyonyen", "C D E F G A B"],
            ["Dm7", "ii7", "Doryen", "D E F G A B C"],
            ["Em7", "iii7", "Frigyen", "E F G A B C D"],
            ["Fmaj7", "IVmaj7", "Lidyen", "F G A B C D E"],
            ["G7", "V7", "Miksolidyen", "G A B C D E F"],
            ["Am7", "vi7", "Eolyen", "A B C D E F G"],
            ["Bm7b5", "viiø7", "Lokriyen", "B C D E F G A"],
          ],
          dogrula: { tur: "romen", ton: "C", romen: 1, akor: 0 },
        },
      },
      {
        t: "liste",
        m: [
          "**1. Tür:** akorun türü gamın ailesini seçer (maj7 → İyonyen/Lidyen, m7 → Doryen/Eolyen/Frigyen, 7 → Miksolidyen ailesi, m7♭5 → Lokriyen).",
          "**2. Ton:** tonun notaları boşlukları doldurur. Dm7 Do majörde Doryen'dir, Si♭ majörde (iii7) Frigyen.",
          "**3. Gerilim:** dominantta ♭9 ya da ♯9 varsa gam değişir: alterli, Frigyen dominant ya da azaltılmış.",
        ],
      },
    ],
    gitarda: [
      {
        t: "tablo",
        tablo: {
          baslik: "Dominant akorların gamları",
          bas: ["Akor", "Nerede", "Gam", "Örnek (G7)"],
          satirlar: [
            ["7", "V7 → I (majör)", "Miksolidyen", "G A B C D E F"],
            ["7(♯11)", "♭VII7, IV7, II7", "Lidyen dominant", "G A B C# D E F"],
            ["7(♭9 ♭13)", "V7 → i (minör)", "Frigyen dominant", "G Ab B C D Eb F"],
            ["7alt", "V7 → i, gergin", "Alterli", "G Ab Bb Cb Db Eb F"],
            ["7(♭9 13)", "dominant, simetrik", "Azaltılmış (yarım–tam)", "G Ab A# B C# D E F"],
            ["7(♯5)", "dominant, rüya", "Tam ton", "G A B C# D# F"],
          ],
          dogrula: { tur: "gamAdi", kok: "G", gam: 2, notalar: 3 },
        },
      },
      { t: "p", m: "Sapta: aynı pozisyonda kalıp akor değiştikçe yalnız değişen notaları değiştir. G7'den Cmaj7'ye geçerken Miksolidyen (F) İyonyen'e (F aynı, merkez C) döner; G7alt'ta ise A♭, B♭, D♭, E♭ eklenir." },
    ],
    kulakla: [
      { t: "p", m: "Aynı akor üzerinde iki gamı dinle: G7 üzerinde Miksolidyen tonun içinde kalır; alterli ise dışarı çıkar ve Do'ya güçlü çözülür." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Sol Miksolidyen", tip: "dizi", notalar: ["G2", "A2", "B2", "C3", "D3", "E3", "F3", "G3"], beklenen: { kalip: [0, 2, 4, 5, 7, 9, 10, 12] } },
          { ad: "Sol alterli", tip: "dizi", notalar: ["G2", "Ab2", "Bb2", "B2", "Db3", "Eb3", "F3", "G3"], beklenen: { kalip: [0, 1, 3, 4, 6, 8, 10, 12] } },
          { ad: "Dm7 – G7 – Cmaj7", tip: "akorlar", akorlar: [["D3", "F3", "A3", "C4"], ["G2", "B2", "D3", "F3"], ["C3", "E3", "G3", "B3"]], beklenen: { ton: "C", romen: ["ii7", "V7", "Imaj7"] } },
        ],
      },
    ],
    dene: [
      "Dm7 – G7 – Cmaj7 üzerinde tek pozisyonda kal; her akorda o akorun kökünde başla ve bitir.",
      "G7 vamp üzerinde önce Miksolidyen, sonra alterli çal; ikincisini Cmaj7'ye çöz.",
      "Fmaj7 üzerinde Lidyen çal: B notası (♯11) akoru nasıl parlatıyor?",
      "Sap Gezgini'nde Sol Lidyen dominantı aç ve 7. ve 8. perde arasındaki kalıbı çal.",
    ],
    ipucu: [
      "Akor-gam bir menü değildir: önce akor seslerini hedefle, gam yalnız aradaki yolu gösterir.",
      "Bir akor birden çok gamla çalınabilir; seçimi şarkının tonu ve melodi belirler.",
    ],
    sonraki: { metin: "Sıralı derslerin sonu: Sap Gezgini'nde gamları sapın her yerinde çal." },
    kaynaklar: [NETTLES, LEVINE, BERKLEE],
    kesif: { set: "mixolydian", root: 7 },
  },
];
