// Müzik Teorisi dersleri (/teori/<slug>): her biri tek A4 sayfasına sığan ders kitabı sayfası. Modlar dersi çok
// yapraklı olarak modlar.ts'e taşındı; bütün derslerin listesi ve sırası: hepsi.ts ve mufredat.ts.
// Metinler özgündür; içerik standart kaynaklarla (her dersin sonunda "Kaynaklar") uyumludur.
// Notalar, aralıklar ve perde konumları scripts/teori-dogrula.mjs ile hesaplanarak denetlenir.
import type { Ders } from "./tipler.ts";
import { gamNoktalari, kromatik, pn, telNotalari } from "./yardim.ts";

const BERKLEE = "Paul Schmeling — Berklee Music Theory";
const KOSTKA = "Stefan Kostka, Dorothy Payne — Tonal Harmony";
const LEAVITT = "William Leavitt — A Modern Method for Guitar (Berklee)";

export const DERSLER: Ders[] = [
  {
    slug: "notalar",
    baslik: "12 Nota ve Oktav",
    seviye: 1,
    ozet: "Batı müziğinin 12 sesi, doğal notalar, diyez ve bemol, oktav ilişkisi.",
    tanim: [
      "Batı müziğinde bir oktavın içinde **12 farklı ses** vardır. Komşu iki ses arasındaki en küçük mesafeye **yarım ses**, iki yarım sese **tam ses** denir. 13. ses ilk sesin **oktavıdır**: frekansı tam iki katıdır, aynı notanın ince hâli gibi duyulur ve aynı adı taşır.",
      "Yedi **doğal nota** vardır: Do (C), Re (D), Mi (E), Fa (F), Sol (G), La (A), Si (B). Gitar kaynakları çoğunlukla harf adlarını kullanır.",
    ],
    kural: [
      {
        t: "p",
        m: "Doğal notaların çoğu arasında tam ses vardır; yalnız **Mi–Fa** ve **Si–Do** arası yarım sestir. Aradaki sese **diyez** (♯, yarım ses yukarı) ya da **bemol** (♭, yarım ses aşağı) ile ad verilir. Do♯ ile Re♭ aynı sestir (**enarmonik**); hangisinin yazılacağını ton belirler.",
      },
      { t: "gorsel", g: { tur: "piyano", baslik: "Bir oktav: 7 beyaz (doğal) ve 5 siyah (arızalı) tuş.", not: "Y: arada nota olmayan yarım sesler.", yarimlar: [["E", "F"], ["B", "C"]] } },
      {
        t: "tablo",
        tablo: {
          baslik: "Doğal notalar ve aralarındaki sesler",
          bas: ["Harf", "Solfej", "Sonrakine", "Aradaki ses"],
          satirlar: [
            ["C", "Do", "tam", "C# / Db"],
            ["D", "Re", "tam", "D# / Eb"],
            ["E", "Mi", "yarım", "—"],
            ["F", "Fa", "tam", "F# / Gb"],
            ["G", "Sol", "tam", "G# / Ab"],
            ["A", "La", "tam", "A# / Bb"],
            ["B", "Si", "yarım", "—"],
          ],
          dogrula: { tur: "komsu", nota: 0, uzaklik: 2 },
        },
      },
    ],
    gitarda: [
      { t: "p", m: "Gitarda **bir perde = yarım ses**. Bir telde perde perde ilerlersen 12 sesin hepsini duyarsın; 12. perdede (çift nokta) açık telin oktavına varırsın ve sap kendini tekrar eder." },
      {
        t: "gorsel",
        g: { tur: "sap", baslik: "5. tel (La) üzerinde 12 yarım ses: açık telden 12. perdeye A, A♯, B, C … A.", etiket: "nota", perde: [0, 12], noktalar: telNotalari(5, [0, 12]).map((n) => (n.p % 12 === 0 ? { ...n, k: "kok" as const } : n)), baglar: [[0, 12]], genis: true },
      },
    ],
    kulakla: [
      { t: "p", m: "Kromatik diziyi dinle: her adım aynı büyüklükte duyulur. Sonra La ile oktavını art arda dinle; iki ses farklı yükseklikte olsa da “aynı nota” hissi verir." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Kromatik dizi: La2 → La3", tip: "dizi", notalar: kromatik("A2", 13), beklenen: { kalip: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } },
          { ad: "Oktav: La2 – La3", tip: "aralik", notalar: ["A2", "A3"], beklenen: { aralik: 12 } },
          { ad: "Yarım ses: Mi – Fa", tip: "aralik", notalar: ["E3", "F3"], beklenen: { aralik: 1 } },
        ],
      },
    ],
    dene: [
      "5. telde açık telden 12. perdeye çık; her notayı diyezli adıyla yüksek sesle söyle.",
      "Aynı yolu geri in, bu kez bemollü adları söyle: A, A♭, G, G♭, F …",
      "6. telde Mi–Fa (0–1. perde) ve Si–Do (7–8. perde) yarım seslerini bul.",
    ],
    ipucu: [
      "Diyez sesi **yükseltir**, bemol **alçaltır**: C♯ Do'nun yarım ses üstü, D♭ Re'nin yarım ses altıdır; ikisi aynı perdedir.",
      "E♯ ve B♯ yazımda bazen gerekir (E♯ = F sesi); başlangıçta Mi–Fa ve Si–Do arasında ara ses olmadığını bilmen yeter.",
    ],
    sonraki: { metin: "Sap Üzerinde Notaları Bulmak: bu 12 sesi altı telin hepsine yerleştir.", href: "/teori/sapta-notalar" },
    kaynaklar: [BERKLEE, "Bruce Benward, Marilyn Saker — Music in Theory and Practice"],
    kesif: { set: "major", root: 0 },
  },
  {
    slug: "sapta-notalar",
    baslik: "Sap Üzerinde Notaları Bulmak",
    seviye: 1,
    ozet: "Açık teller, “bir perde = yarım ses” kuralı ve oktav şekilleriyle sapın tamamını çözmek.",
    tanim: [
      "Sapta bir notayı bulmak için iki bilgi yeter: **açık tellerin adları** ve **bir perde = yarım ses** kuralı. Bu ikisiyle her perdeyi sayarak bulabilirsin; asıl amaç zamanla saymadan görmektir.",
      "Standart akort kalından inceye **E – A – D – G – B – E**'dir (6. telden 1. tele). İki Mi teli aynı adı taşır ama aralarında iki oktav vardır.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Standart akort",
          bas: ["Tel", "Nota", "Bilimsel ad", "Bir sonraki tele"],
          satirlar: [
            ["6", "E (Mi)", "E2", "5 perde · tam dörtlü"],
            ["5", "A (La)", "A2", "5 perde · tam dörtlü"],
            ["4", "D (Re)", "D3", "5 perde · tam dörtlü"],
            ["3", "G (Sol)", "G3", "**4 perde** · büyük üçlü"],
            ["2", "B (Si)", "B3", "5 perde · tam dörtlü"],
            ["1", "E (Mi)", "E4", "—"],
          ],
          not: "C4 orta Do'dur; gitar yazıldığından bir oktav pes duyulur.",
          dogrula: { tur: "tel", tel: 0, nota: 2 },
        },
      },
      { t: "p", m: "Teller arası hep **5 perde** (tam dörtlü) vardır; tek istisna Sol–Si arasıdır: **4 perde**. Sapta ezberlediğin her şekil Si teline geçerken bu yüzden bir perde kayar." },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "sap",
          baslik: "6. ve 5. telde doğal notalar: power chord ve barre akorların kökleri bu iki telde.",
          etiket: "nota",
          perde: [0, 12],
          kok: "C",
          kalip: [0, 2, 4, 5, 7, 9, 11],
          tam: true,
          teller: [6, 5],
          noktalar: gamNoktalari({ kok: "C", formul: "1 2 3 4 5 6 7", perde: [0, 12], teller: [6, 5], etiket: "nota" }),
          genis: true,
        },
      },
      {
        t: "gorsel",
        g: {
          tur: "sap",
          baslik: "Oktav şekilleri: 6→4 ve 5→3. telde iki perde ileri; 4→2 ve 3→1. telde Si teli yüzünden üç perde ileri.",
          etiket: "nota",
          perde: [5, 10],
          noktalar: [
            { t: 6, p: 5, e: "A", k: "kok" },
            { t: 4, p: 7, e: "A", k: "kok" },
            { t: 5, p: 5, e: "D" },
            { t: 3, p: 7, e: "D" },
            { t: 4, p: 7, e: "A", k: "kok" },
            { t: 2, p: 10, e: "A", k: "kok" },
            { t: 3, p: 7, e: "D" },
            { t: 1, p: 10, e: "D" },
          ],
          baglar: [
            [0, 1],
            [2, 3],
            [4, 5],
            [6, 7],
          ],
        },
      },
    ],
    kulakla: [
      { t: "p", m: "Açık telleri kalından inceye dinle: Sol–Si aralığı ötekilerden küçük (büyük üçlü) duyulur." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Açık teller 6 → 1", tip: "dizi", notalar: ["E2", "A2", "D3", "G3", "B3", "E4"] },
          { ad: "Sol–Si: büyük üçlü", tip: "aralik", notalar: ["G3", "B3"], beklenen: { aralik: 4 } },
          { ad: "Oktav: 6. tel 5 → 4. tel 7", tip: "aralik", notalar: ["A2", "A3"], beklenen: { aralik: 12 } },
        ],
      },
    ],
    dene: [
      "6. telde doğal notaları açık telden 12. perdeye çal ve söyle: E F G A B C D E.",
      "Aynısını 5. telde yap: A B C D E F G A.",
      "Bir doğal nota seç (ör. C), 6. ve 5. telde bul; oktav şekliyle 4. ve 3. telde doğrula.",
      "“5. perde” kuralıyla akort et: 6. tel 5. perde = 5. tel açık … yalnız 3. telde 4. perde.",
    ],
    ipucu: [
      "Her seferinde baştan sayma; **işaret noktalarını** çapa yap: 6. telde 3 = G, 5 = A, 7 = B, 12 = E.",
      "En sık hata Si teli kuralını unutmaktır: 4. ya da 3. telden başlayan oktav şekli iki değil **üç** perde ileri gider.",
    ],
    sonraki: { metin: "Ritim, Ölçü ve Tempo: doğru notayı doğru zamanda çalmak.", href: "/teori/ritim-temelleri" },
    kaynaklar: [LEAVITT, "Mick Goodrick — The Advancing Guitarist"],
    kesif: { set: "major", root: 0 },
  },
  {
    slug: "ritim-temelleri",
    baslik: "Ritim, Ölçü ve Tempo",
    seviye: 1,
    ozet: "Nota süreleri, 4/4 ölçü, BPM ve metronomla düzenli çalışma.",
    tanim: [
      "Ritim, seslerin zaman içindeki düzenidir. Üç kavramla çalışırız: **vuruş** (müziğin sabit nabzı), **tempo** (vuruşların hızı; BPM = dakikadaki vuruş sayısı) ve **ölçü** (vuruşların düzenli gruplanması).",
    ],
    kural: [
      { t: "gorsel", g: { tur: "agac", baslik: "Nota değerleri ağacı: her değer bir üstteki değerin yarısıdır; sağda aynı süredeki sus." } },
      {
        t: "tablo",
        tablo: {
          baslik: "4/4 ölçüde süreler",
          bas: ["Nota", "Vuruş", "Sayım"],
          satirlar: [
            ["Birlik", "4", "1 2 3 4"],
            ["İkilik", "2", "1 2"],
            ["Dörtlük", "1", "1"],
            ["Sekizlik", "1/2", "1 ve"],
            ["Onaltılık", "1/4", "1 e ve a"],
            ["Sekizlik üçleme", "1/3", "1 ta ki"],
          ],
          dogrula: { tur: "sure", ad: 0, vurus: 1 },
        },
      },
      { t: "p", m: "4/4'te üstteki sayı ölçüdeki vuruş sayısını, alttaki sayı vuruşu dörtlük notanın aldığını söyler. Vuruşun süresi **60 ÷ BPM** saniyedir: 60 BPM'de 1 saniye, 120 BPM'de yarım saniye." },
    ],
    gitarda: [
      { t: "p", m: "Gitarda ritmi sağ el taşır. Dörtlükleri aşağı vuruşla, sekizlikleri **aşağı–yukarı** çal: el her vuruşta iner, aradaki “ve”de kalkar. Çalmayacağın yerde de hareketi sürdür, yalnız teli kaçır." },
      { t: "gorsel", g: { tur: "ritim", baslik: "Dörtlükler ve sekizlikler: aynı vuruş, iki kat yoğunluk.", desen: [["q", "q", "q", "q"], ["ee", "ee", "ee", "ee"]], sayim: "1 2 3 4 | 1 ve 2 ve 3 ve 4 ve" } },
      { t: "gorsel", g: { tur: "ritim", baslik: "Onaltılıklar ve sekizlik üçlemeler.", desen: [["ssss", "ssss", "t", "t"]], sayim: "1 e ve a 2 e ve a | 3 ta ki 4 ta ki" } },
    ],
    kulakla: [
      { t: "p", m: "Önce yalnız metronomu dinle ve ayağınla vur; sonra aynı tempoda sekizlik ve onaltılık yoğunlukları dinle. Sayımı fısıldayarak eşlik et." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Metronom 60 BPM", tip: "metronom", bpm: 60, desen: [["q", "q", "q", "q"]] },
          { ad: "Dörtlük → sekizlik (80 BPM)", tip: "ritim", bpm: 80, desen: [["q", "q", "q", "q"], ["ee", "ee", "ee", "ee"]] },
          { ad: "Onaltılık ve üçleme (70 BPM)", tip: "ritim", bpm: 70, desen: [["ssss", "ssss", "t", "t"]] },
        ],
      },
    ],
    dene: [
      "Metronomu 60 BPM'e kur; “1 2 3 4” sayarak ayağınla vur.",
      "Aynı tempoda sol elinle telleri hafifçe susturup sekizlik çal: aşağı–yukarı, “1 ve 2 ve”.",
      "Bir ölçü sekizlik, bir ölçü üçleme çal; geçişte tempoyu koru.",
      "Temiz çaldığın en yüksek tempoyu not et; üç kez hatasız çalınca 4–5 BPM artır.",
    ],
    ipucu: [
      "En sık hata farkında olmadan hızlanmaktır: kendini kaydet ya da metronomu yalnız 2. ve 4. vuruşta duy.",
      "Sus da süre taşır; susarken saymayı bırakma.",
      "Üçlemeyi sekizlikle karıştırma: üçleme vuruşu **üç** eşit parçaya böler.",
    ],
    sonraki: { metin: "Aralıklar: zamanı ölçtük, şimdi iki nota arasındaki mesafeyi ölçelim.", href: "/teori/araliklar" },
    kaynaklar: ["Elaine Gould — Behind Bars", "Louis Bellson, Gil Breines — Modern Reading Text in 4/4"],
  },
  {
    slug: "araliklar",
    baslik: "Aralıklar",
    seviye: 2,
    ozet: "İki nota arasındaki mesafe: adı, niteliği, sapta şekli ve kulakta karakteri.",
    tanim: [
      "**Aralık**, iki nota arasındaki mesafedir ve iki bilgiyle adlandırılır: **sayı** (harf adımı: Do-Re-Mi üç harf = üçlü) ve **nitelik** (küçük, büyük, tam, artık, eksik). Nitelik yarım ses sayısından gelir: Do–Mi 4 yarım ses = büyük üçlü, Do–Mi♭ 3 yarım ses = küçük üçlü. Art arda çalınan aralık **ezgisel**, birlikte çalınan **armonik**tir.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Oktav içindeki aralıklar",
          bas: ["Yarım ses", "Simge", "Ad", "Do'dan"],
          satirlar: [
            ["0", "1", "Tam birli", "C–C"],
            ["1", "b2", "Küçük ikili", "C–Db"],
            ["2", "2", "Büyük ikili", "C–D"],
            ["3", "b3", "Küçük üçlü", "C–Eb"],
            ["4", "3", "Büyük üçlü", "C–E"],
            ["5", "4", "Tam dörtlü", "C–F"],
            ["6", "#4 / b5", "Artık dörtlü / eksik beşli", "C–F# / C–Gb"],
            ["7", "5", "Tam beşli", "C–G"],
            ["8", "b6", "Küçük altılı", "C–Ab"],
            ["9", "6", "Büyük altılı", "C–A"],
            ["10", "b7", "Küçük yedili", "C–Bb"],
            ["11", "7", "Büyük yedili", "C–B"],
            ["12", "8", "Oktav", "C–C"],
          ],
          dogrula: { tur: "aralik", yarim: 0, simge: 1, ornek: 3 },
        },
      },
      { t: "p", m: "Birli, dörtlü, beşli ve oktav **tam** aralıklardır; ikili, üçlü, altılı ve yedili **küçük** ya da **büyük** olur. Tam ya da büyük aralık yarım ses genişlerse **artık**, tam ya da küçük aralık yarım ses daralırsa **eksik** olur. 6 yarım seslik aralığa **tritone** da denir." },
    ],
    gitarda: [
      { t: "p", m: "Sapta aralıklar **şekildir**: şekli kaydırırsan aralık değişmez. Kök 6. teldeyken tam dörtlü bir üst telde aynı perdede, tam beşli iki perde ileride, büyük üçlü bir perde geridedir; oktav iki üst telde iki perde ileridedir." },
      {
        t: "gorsel",
        g: {
          tur: "sap",
          baslik: "Kök Sol (6. tel 3. perde ve 4. tel 5. perde) çevresinde aralık haritası.",
          etiket: "aralik",
          kok: "G",
          perde: [1, 6],
          kalip: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          tam: true,
          teller: [6, 5, 4],
          noktalar: gamNoktalari({ kok: "G", formul: "1 b2 2 b3 3 4 b5 5 b6 6 b7 7", perde: [1, 6], teller: [6, 5, 4], etiket: "aralik" }),
        },
      },
    ],
    kulakla: [
      { t: "p", m: "Aralıkları karakterleriyle tanı: küçük ikili gergin, büyük üçlü parlak, küçük üçlü buruk, tam beşli boş ve sağlam, tritone huzursuz duyulur. Her örnek önce ezgisel, sonra armonik çalar." },
      {
        t: "gorsel",
        g: {
          tur: "porte",
          baslik: "Do'dan ezgisel aralıklar: k3, B3, T4, T5, B6, oktav.",
          porte: { donanim: 0, olcu: [2, 4], notalar: ["C4", "Eb4", "C4", "E4", "C4", "F4", "C4", "G4", "C4", "A4", "C4", "C5"].map((n) => pn(n)) },
          etiketler: ["", "k3", "", "B3", "", "T4", "", "T5", "", "B6", "", "8"],
        },
      },
      {
        t: "dinle",
        ornekler: [
          { ad: "Küçük üçlü", tip: "aralik", notalar: ["C3", "Eb3"], beklenen: { aralik: 3 } },
          { ad: "Büyük üçlü", tip: "aralik", notalar: ["C3", "E3"], beklenen: { aralik: 4 } },
          { ad: "Tam dörtlü", tip: "aralik", notalar: ["C3", "F3"], beklenen: { aralik: 5 } },
          { ad: "Tritone", tip: "aralik", notalar: ["C3", "F#3"], beklenen: { aralik: 6 } },
          { ad: "Tam beşli", tip: "aralik", notalar: ["C3", "G3"], beklenen: { aralik: 7 } },
          { ad: "Oktav", tip: "aralik", notalar: ["C3", "C4"], beklenen: { aralik: 12 } },
        ],
      },
    ],
    dene: [
      "6. telde 3. perdeden (Sol) başla; haritadaki her aralığı çal ve adını söyle.",
      "Aynı şekilleri 5. telin 5. perdesinden (Re) başlatarak çal: adlar aynı, notalar farklı.",
      "Do–Mi ile Do–Mi♭'ü art arda çal; tek perdenin karakteri nasıl değiştirdiğini dinle.",
    ],
    ipucu: [
      "Sayıyı harfle say: Do–Mi♭ üçlüdür (Do-Re-Mi), Do–Re♯ ikilidir (artık ikili); ikisi aynı perde olsa da adları farklıdır.",
      "3. telden 2. tele geçen şekiller bir perde kayar (Sol–Si arası büyük üçlü).",
    ],
    sonraki: { metin: "Majör Gam: aralıkları sıraya dizince ilk gamımız çıkar.", href: "/teori/major-gam" },
    kaynaklar: [KOSTKA, BERKLEE],
    kesif: { set: "major", root: 7 },
  },
  {
    slug: "major-gam",
    baslik: "Majör Gam",
    seviye: 2,
    ozet: "T – T – Y – T – T – T – Y formülü, derece adları ve sapta 7. pozisyon kutusu.",
    tanim: [
      "Majör gam, kökten oktava yedi farklı notayla çıkan, parlak ve “tamamlanmış” duyulan dizidir. Batı müziğinin ton sistemi bu gam üzerine kuruludur; diğer gamları çoğunlukla majörle karşılaştırarak tanımlarız.",
    ],
    kural: [
      {
        t: "gorsel",
        g: { tur: "adim", baslik: "Do majör: T – T – Y – T – T – T – Y.", not: "Yarım adımlar 3–4 ve 7–8. dereceler arasında.", notalar: ["C", "D", "E", "F", "G", "A", "B", "C"], adimlar: ["T", "T", "Y", "T", "T", "T", "Y"], dereceler: ["1", "2", "3", "4", "5", "6", "7", "8"] },
      },
      { t: "p", m: "Formül her kökte aynıdır ve her harf bir kez kullanılır. Sol majörde 6. dereceden (E) 7. dereceye tam ses gerektiği için F yerine **F♯** gelir: G A B C D E F♯. Derecelerin adları: 1 **tonik** (durak), 4 **alt çeken**, 5 **dominant** (çeken), 7 **yeden** (köke yarım ses çeker)." },
      {
        t: "tablo",
        tablo: {
          baslik: "Dört majör ton",
          bas: ["Ton", "Notalar", "Donanım"],
          satirlar: [
            ["C", "C D E F G A B", "—"],
            ["G", "G A B C D E F#", "1 diyez"],
            ["D", "D E F# G A B C#", "2 diyez"],
            ["F", "F G A Bb C D E", "1 bemol"],
          ],
          dogrula: { tur: "gam", kok: 0, formul: "1 2 3 4 5 6 7", notalar: 1 },
        },
      },
    ],
    gitarda: [
      { t: "p", m: "Tek telde formülü perdelerle çal: 2–2–1–2–2–2–1. Sonra aynı notaları bir **pozisyonda** çal: sol el sabit, her parmak bir perdeye bakar. Aşağıdaki kutu 6. telin 8. perdesindeki Do'dan başlar." },
      {
        t: "gorsel",
        g: { tur: "sap", baslik: "Do majör, 7. pozisyon (7–10. perdeler): kök 6., 4. ve 1. telde.", etiket: "aralik", kok: "C", perde: [7, 10], kalip: [0, 2, 4, 5, 7, 9, 11], tam: true, noktalar: gamNoktalari({ kok: "C", formul: "1 2 3 4 5 6 7", perde: [7, 10], etiket: "aralik" }) },
      },
    ],
    kulakla: [
      { t: "p", m: "Gamı çıkarken 7. derecede (B) dur: kulak köke (C) gitmek ister. Bu çekim, majörün “eve dönüş” hissinin kaynağıdır." },
      {
        t: "gorsel",
        g: {
          tur: "porte",
          baslik: "Do majör gamı portede ve açık pozisyonda (tel, perde).",
          porte: { donanim: 0, olcu: [4, 4], notalar: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"].map((n) => pn(n)) },
          konumlar: [
            { t: 5, p: 3 },
            { t: 4, p: 0 },
            { t: 4, p: 2 },
            { t: 4, p: 3 },
            { t: 3, p: 0 },
            { t: 3, p: 2 },
            { t: 2, p: 0 },
            { t: 2, p: 1 },
          ],
        },
      },
      {
        t: "dinle",
        ornekler: [
          { ad: "Do majör gamı", tip: "dizi", notalar: ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4"], beklenen: { kalip: [0, 2, 4, 5, 7, 9, 11, 12] } },
          { ad: "Yeden çekimi: Si → Do", tip: "aralik", notalar: ["B2", "C3"], beklenen: { aralik: 1 } },
          { ad: "Sol majör gamı", tip: "dizi", notalar: ["G2", "A2", "B2", "C3", "D3", "E3", "F#3", "G3"], beklenen: { kalip: [0, 2, 4, 5, 7, 9, 11, 12] } },
        ],
      },
    ],
    dene: [
      "5. telde 3. perdeden (C) başlayıp formülü perdelerle çal: 3-5-7-8-10-12-14-15.",
      "Kutudaki gamı kökten köke çık ve in; 60 BPM, her vuruşa bir nota.",
      "Kutuyu 3. perdeye kaydır (kök 6. tel 3. perde): artık Sol majör çalıyorsun.",
      "Gamı üçlü gruplarla çal: 1-2-3, 2-3-4, 3-4-5 …",
    ],
    ipucu: [
      "Yarım adımların yeri (3–4 ve 7–8) gamın kimliğidir; sapta bu iki yeri işaretlersen kutuyu ezberlemek kolaylaşır.",
      "Her harf bir kez: Fa majörde 4. derece **B♭**'dir, A♯ değil.",
      "Kökü her geçişte biraz vurgula; kulak gamı köke göre duymayı öğrenir.",
    ],
    sonraki: { metin: "Doğal Minör ve Paralel Ton: aynı yedi notadan hüzünlü bir gam.", href: "/teori/minor-gam" },
    kaynaklar: [BERKLEE, LEAVITT],
    kesif: { set: "major", root: 0 },
  },
  {
    slug: "minor-gam",
    baslik: "Doğal Minör ve Paralel Ton",
    seviye: 2,
    ozet: "Doğal minörün formülü, majörle aynı notaları paylaşan paralel minör ve sapta 5. pozisyon.",
    tanim: [
      "Doğal minör gam, majöre göre daha karanlık ve hüzünlü duyulan yedi notalı dizidir. Aynı kökteki majörden üç derecesi farklıdır: **♭3, ♭6 ve ♭7**. Formülü: 1 2 ♭3 4 5 ♭6 ♭7.",
    ],
    kural: [
      {
        t: "gorsel",
        g: { tur: "adim", baslik: "La doğal minör: T – Y – T – T – Y – T – T.", not: "Turuncu: majörden farklı dereceler.", notalar: ["A", "B", "C", "D", "E", "F", "G", "A"], adimlar: ["T", "Y", "T", "T", "Y", "T", "T"], dereceler: ["1", "2", "b3", "4", "5", "b6", "b7", "8"], vurgu: [2, 5, 6] },
      },
      { t: "p", m: "La minör ile Do majör aynı yedi notayı paylaşır; yalnız merkez (durak) farklıdır. Aynı donanımı kullanan bu iki tona **paralel ton** denir (İng. *relative*). Kural: majörün 6. derecesi paralel minörün köküdür; majör kökten küçük üçlü inersen bulursun." },
      {
        t: "tablo",
        tablo: {
          baslik: "Paralel tonlar",
          bas: ["Majör", "Paralel minör", "Donanım"],
          satirlar: [
            ["C", "Am", "—"],
            ["G", "Em", "1 diyez"],
            ["D", "Bm", "2 diyez"],
            ["A", "F#m", "3 diyez"],
            ["F", "Dm", "1 bemol"],
            ["Bb", "Gm", "2 bemol"],
          ],
          dogrula: { tur: "paralel", major: 0, minor: 1 },
        },
      },
    ],
    gitarda: [
      { t: "p", m: "La minörün en çok kullanılan kutusu 5. pozisyondadır (kök 6. tel 5. perde). Aynı kökteki majör kutuyla karşılaştır: ♭3, ♭6 ve ♭7 birer perde geride kalır." },
      {
        t: "gorsel",
        g: { tur: "sap", baslik: "La doğal minör, 5. pozisyon (5–8. perdeler).", not: "Turuncu: ♭3, ♭6, ♭7.", etiket: "aralik", kok: "A", perde: [5, 8], kalip: [0, 2, 3, 5, 7, 8, 10], tam: true, noktalar: gamNoktalari({ kok: "A", formul: "1 2 b3 4 5 b6 b7", perde: [5, 8], etiket: "aralik", vurgu: ["b3", "b6", "b7"] }) },
      },
    ],
    kulakla: [
      { t: "p", m: "Aynı köke önce majör, sonra doğal minör gamı dinle; ♭3'ün getirdiği renk değişimine odaklan. Sonra Do majör ve La minör akorlarını art arda dinle: notalar aynı aileden, durak farklı." },
      {
        t: "dinle",
        ornekler: [
          { ad: "La majör gamı", tip: "dizi", notalar: ["A2", "B2", "C#3", "D3", "E3", "F#3", "G#3", "A3"], beklenen: { kalip: [0, 2, 4, 5, 7, 9, 11, 12] } },
          { ad: "La doğal minör gamı", tip: "dizi", notalar: ["A2", "B2", "C3", "D3", "E3", "F3", "G3", "A3"], beklenen: { kalip: [0, 2, 3, 5, 7, 8, 10, 12] } },
          { ad: "C → Am (paralel tonlar)", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["A2", "C3", "E3"]], beklenen: { ton: "C", romen: ["I", "vi"] } },
        ],
      },
    ],
    dene: [
      "La minör kutusunu kökten köke çık ve in; her La'da kısa bir an dur.",
      "Kutuyu 3. perdeye taşı (kök 6. tel 3. perde): Sol minör çalıyorsun.",
      "Am – G – F – G yürüyüşünü kaydet ve üzerinde La minör gamını çal.",
      "Tablodan bir majör seç; kökünden küçük üçlü inerek paralel minörünü bul ve sapta çal.",
    ],
    ipucu: [
      "Türkçe ve Almanca kaynaklarda **paralel ton** aynı donanımlı tonlardır (Do majör–La minör). İngilizce *parallel* ise aynı köklü tonları (Do majör–Do minör) anlatır; karıştırma.",
      "**Armonik minör** ayrı bir gamdır: doğal minörün 7. derecesi yarım ses yükselir (La minörde G♯) ve E majör akorunu mümkün kılar.",
      "Kökü vurgulamazsan kulak Do majör duyar: tonu durak notası belirler.",
    ],
    sonraki: { metin: "Akorlar Nasıl Oluşur?: gamın notalarını üst üste koyma zamanı.", href: "/teori/akor-yapisi" },
    kaynaklar: [KOSTKA, BERKLEE],
    kesif: { set: "minor", root: 9 },
  },
  {
    slug: "akor-yapisi",
    baslik: "Akorlar Nasıl Oluşur?",
    seviye: 2,
    ozet: "Üç sesli (triad) ve dört sesli (yedili) akorların aralık formülleri ve gitardaki şekilleri.",
    tanim: [
      "Akor, en az üç farklı notanın birlikte duyulmasıdır. Temel yapı **üç sesli akordur** (triad): kök, üstüne bir üçlü, onun üstüne bir üçlü daha. Böylece **1 – 3 – 5** dereceleri oluşur; üçlülerin büyük ya da küçük olması akorun türünü belirler: majörde büyük + küçük, minörde küçük + büyük, eksikte iki küçük, artıkta iki büyük üçlü.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Akor formülleri (kök Do)",
          bas: ["Tür", "Simge", "Formül", "Notalar"],
          satirlar: [
            ["Majör", "C", "1 3 5", "C E G"],
            ["Minör", "Cm", "1 b3 5", "C Eb G"],
            ["Eksik", "C°", "1 b3 b5", "C Eb Gb"],
            ["Artık", "C+", "1 3 #5", "C E G#"],
            ["Sus4", "Csus4", "1 4 5", "C F G"],
            ["Power", "C5", "1 5", "C G"],
            ["Majör 7", "Cmaj7", "1 3 5 7", "C E G B"],
            ["Dominant 7", "C7", "1 3 5 b7", "C E G Bb"],
            ["Minör 7", "Cm7", "1 b3 5 b7", "C Eb G Bb"],
            ["Yarım eksik", "Cm7b5", "1 b3 b5 b7", "C Eb Gb Bb"],
          ],
          dogrula: { tur: "akor", ad: 1, notalar: 3, formul: 2 },
        },
      },
      { t: "p", m: "Yedili akorlar üç sesliye 7. dereceyi ekler. **Dominant 7** (1 3 5 ♭7) gerilimli duyulur ve çözülmek ister; blues'un temel akorudur. **Power chord** (5) üçlü içermediği için ne majör ne minördür; distorsiyonda temiz kalır." },
    ],
    gitarda: [
      { t: "p", m: "Aynı köke kurulan akorları 5. teldeki Do (3. perde) üzerinde karşılaştır: türü değiştiren çoğu zaman tek notadır. Kök mavi; noktalardaki sayı parmak numarasıdır (1 işaret … 4 serçe)." },
      {
        t: "gorsel",
        g: {
          tur: "akorlar",
          baslik: "5. telde kökü olan Do akorları.",
          akorlar: [
            { ad: "C", sekil: "x 3 2 0 1 0", parmak: "0 3 2 0 1 0", kok: "C", formul: "1 3 5" },
            { ad: "Cm", sekil: "x 3 5 5 4 3", parmak: "0 1 3 4 2 1", kok: "C", formul: "1 b3 5" },
            { ad: "C5", sekil: "x 3 5 5 x x", parmak: "0 1 3 4 0 0", kok: "C", formul: "1 5" },
            { ad: "Cmaj7", sekil: "x 3 2 0 0 0", parmak: "0 3 2 0 0 0", kok: "C", formul: "1 3 5 7" },
            { ad: "C7", sekil: "x 3 5 3 5 3", parmak: "0 1 3 1 4 1", kok: "C", formul: "1 3 5 b7" },
            { ad: "Cm7", sekil: "x 3 5 3 4 3", parmak: "0 1 3 1 2 1", kok: "C", formul: "1 b3 5 b7" },
          ],
        },
      },
    ],
    kulakla: [
      { t: "p", m: "Aynı kökte türleri art arda dinle: majör parlak, minör buruk, eksik sıkışık ve gergin, artık askıda; dominant 7 ise bir yere gitmek ister." },
      {
        t: "dinle",
        ornekler: [
          { ad: "C majör", tip: "akor", notalar: ["C3", "E3", "G3"], beklenen: { formul: "1 3 5" } },
          { ad: "C minör", tip: "akor", notalar: ["C3", "Eb3", "G3"], beklenen: { formul: "1 b3 5" } },
          { ad: "C eksik", tip: "akor", notalar: ["C3", "Eb3", "Gb3"], beklenen: { formul: "1 b3 b5" } },
          { ad: "C artık", tip: "akor", notalar: ["C3", "E3", "G#3"], beklenen: { formul: "1 3 #5" } },
          { ad: "C7", tip: "akor", notalar: ["C3", "E3", "G3", "Bb3"], beklenen: { formul: "1 3 5 b7" } },
        ],
      },
    ],
    dene: [
      "C ve Cm şekillerini art arda çal; değişen notayı (E → E♭) sapta göster.",
      "Bir akoru kalından inceye tek tek çal (arpej) ve her notanın derecesini söyle: 1–5–1–3–5.",
      "C7'den F akoruna geç; dominantın çözülmesini dinle.",
      "Tablodan Sol (G) için majör, minör ve 7 akorlarının notalarını yaz, sonra sapta bul.",
    ],
    ipucu: [
      "Bir şekilde aynı nota birden çok kez çalınabilir (açık C şeklinde iki C ve iki E var); türü yalnız farklı notalar belirler.",
      "Sus akorlarında üçlü yoktur; sus4 genellikle majöre çözülür (4 → 3).",
      "m7♭5 ile dim7'yi karıştırma: yarım eksikte 7. ses ♭7, eksik yedilide 𝄫7 (6 ile aynı perde).",
    ],
    sonraki: { metin: "Pentatonik ve Blues Gamı: akor seslerine dayanan beş notalı solo gamı.", href: "/teori/pentatonik-blues" },
    kaynaklar: [KOSTKA, "Ted Greene — Chord Chemistry"],
    kesif: { set: "maj", root: 0 },
  },
  {
    slug: "pentatonik-blues",
    baslik: "Pentatonik ve Blues Gamı",
    seviye: 3,
    ozet: "Rock ve blues solosunun beş notalı temeli, blue note ve sapta 1. kutu.",
    tanim: [
      "**Pentatonik** beş notalı gamdır. Minör pentatonik, doğal minörden yarım adım oluşturan iki dereceyi (2 ve ♭6) çıkarır: **1 ♭3 4 5 ♭7**. Geriye “yanlış” duyulması zor, açık bir dizi kalır; rock, blues ve pek çok halk müziğinin ortak dilidir.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Pentatonik aile",
          bas: ["Gam", "Kök", "Formül", "Notalar"],
          satirlar: [
            ["Minör pentatonik", "A", "1 b3 4 5 b7", "A C D E G"],
            ["Majör pentatonik", "C", "1 2 3 5 6", "C D E G A"],
            ["Blues gamı", "A", "1 b3 4 b5 5 b7", "A C D Eb E G"],
          ],
          dogrula: { tur: "gam", kok: 1, formul: 2, notalar: 3 },
        },
      },
      { t: "p", m: "Do majör pentatonik ile La minör pentatonik aynı beş notadır (paralel ton ilişkisi). Minör pentatoniğe ♭5 eklenince **blues gamı** olur. Bu “blue note” bir geçiş notasıdır: üzerinde uzun durulmaz, 4 ile 5 arasında kayarak kullanılır." },
    ],
    gitarda: [
      { t: "p", m: "1. kutu, kökün 6. telde olduğu kutudur: La minörde 5–8. perdeler. Her telde iki nota vardır; parmaklar 1–3 ya da 1–4 düşer. Kökler 6., 4. ve 1. teldedir." },
      {
        t: "gorsel",
        g: { tur: "sap", baslik: "La minör pentatonik, 1. kutu (5–8. perdeler).", etiket: "aralik", kok: "A", perde: [5, 8], kalip: [0, 3, 5, 7, 10], tam: true, noktalar: gamNoktalari({ kok: "A", formul: "1 b3 4 5 b7", perde: [5, 8], etiket: "aralik" }) },
      },
      {
        t: "gorsel",
        g: { tur: "sap", baslik: "La blues gamı: 1. kutuya iki ♭5 (E♭, turuncu) eklenir.", etiket: "aralik", kok: "A", perde: [5, 8], kalip: [0, 3, 5, 6, 7, 10], tam: true, noktalar: gamNoktalari({ kok: "A", formul: "1 b3 4 b5 5 b7", perde: [5, 8], etiket: "aralik", vurgu: ["b5"] }) },
      },
    ],
    kulakla: [
      { t: "p", m: "Pentatoniği kökten köke dinle, sonra aynı diziyi ♭5 ekleyerek dinle. 4 → ♭5 → 5 kayması blues'un imzasıdır." },
      {
        t: "dinle",
        ornekler: [
          { ad: "La minör pentatonik", tip: "dizi", notalar: ["A2", "C3", "D3", "E3", "G3", "A3"], beklenen: { kalip: [0, 3, 5, 7, 10, 12] } },
          { ad: "La blues gamı", tip: "dizi", notalar: ["A2", "C3", "D3", "Eb3", "E3", "G3", "A3"], beklenen: { kalip: [0, 3, 5, 6, 7, 10, 12] } },
          { ad: "Blue note: D → E♭ → E", tip: "dizi", notalar: ["D3", "Eb3", "E3"] },
        ],
      },
    ],
    dene: [
      "1. kutuyu 70 BPM'de sekizliklerle çık ve in.",
      "Yalnız 2. ve 1. telde (5–8. perdeler) dört notalık motifler kur; her motifi La'da bitir.",
      "3. telde 7 → 8 → 9. perdelere (D → E♭ → E) kay ve 9'da dur.",
      "Kutuyu 8. perdeye taşı (kök 6. tel 8. perde): Do minör pentatonik.",
    ],
    ipucu: [
      "Kutuyu baştan sona çalmak doğaçlama değildir: az nota seç, cümle kur, sus bırak.",
      "A7 gibi majör bir blues akorunda minör pentatoniğin ♭3'ünü hafifçe bükerek (bend) 3'e yaklaştır; bu gerilim blues sesinin parçasıdır.",
      "Diğer kutulara geçerken köklerin yerini çapa olarak kullan.",
    ],
    sonraki: { metin: "Diatonik Akorlar ve Dereceler: majör gamın her derecesine bir akor.", href: "/teori/diatonik-akorlar" },
    kaynaklar: ["Mark Levine — The Jazz Theory Book", BERKLEE],
    kesif: { set: "minor-penta", root: 9 },
  },
  {
    slug: "diatonik-akorlar",
    baslik: "Diatonik Akorlar ve Dereceler",
    seviye: 3,
    ozet: "Bir tonun yedi akoru, Roma rakamları ve şarkıların iskeleti olan yürüyüşler.",
    tanim: [
      "Bir gamın notalarıyla kurulan akorlara **diatonik akorlar** denir. Majör gamın her derecesinin üstüne yalnız gamın notalarıyla üçlüler yığılırsa o tonun yedi akoru çıkar. Akorlar **Roma rakamıyla** adlandırılır: büyük harf majör, küçük harf minör, ° eksik akordur.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Majör tonun akorları",
          bas: ["Derece", "Tür", "Do majör", "Sol majör", "Yedili (Do)"],
          satirlar: [
            ["I", "Majör", "C", "G", "Cmaj7"],
            ["ii", "Minör", "Dm", "Am", "Dm7"],
            ["iii", "Minör", "Em", "Bm", "Em7"],
            ["IV", "Majör", "F", "C", "Fmaj7"],
            ["V", "Majör", "G", "D", "G7"],
            ["vi", "Minör", "Am", "Em", "Am7"],
            ["vii°", "Eksik", "B°", "F#°", "Bm7b5"],
          ],
          dogrula: { tur: "diyatonik", tonlar: { 2: "C", 3: "G" }, yedili: { 4: "C" } },
        },
      },
      { t: "p", m: "Kalıp her majör tonda aynıdır: **majör – minör – minör – majör – majör – minör – eksik**. Yedili akorlarda V tek dominant 7 akorudur; bu yüzden V → I tonun en güçlü hareketidir. I, IV ve V beşliler çemberinde yan yana durur." },
      { t: "gorsel", g: { tur: "cember", baslik: "Beşliler çemberi: I (C), IV (F) ve V (G) komşudur; iç halkada vi, ii, iii (Am, Dm, Em).", vurgu: ["C", "G", "F"] } },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "akorlar",
          baslik: "Do majörün yedi akoru, açık pozisyonda (B° 5. telden).",
          genis: true,
          akorlar: [
            { ad: "C", sekil: "x 3 2 0 1 0", parmak: "0 3 2 0 1 0", kok: "C", formul: "1 3 5", alt: "I" },
            { ad: "Dm", sekil: "x x 0 2 3 1", parmak: "0 0 0 2 3 1", kok: "D", formul: "1 b3 5", alt: "ii" },
            { ad: "Em", sekil: "0 2 2 0 0 0", parmak: "0 2 3 0 0 0", kok: "E", formul: "1 b3 5", alt: "iii" },
            { ad: "F", sekil: "x x 3 2 1 1", parmak: "0 0 3 2 1 1", kok: "F", formul: "1 3 5", alt: "IV" },
            { ad: "G", sekil: "3 2 0 0 0 3", parmak: "2 1 0 0 0 3", kok: "G", formul: "1 3 5", alt: "V" },
            { ad: "Am", sekil: "x 0 2 2 1 0", parmak: "0 0 2 3 1 0", kok: "A", formul: "1 b3 5", alt: "vi" },
            { ad: "B°", sekil: "x 2 3 4 3 x", parmak: "0 1 2 4 3 0", kok: "B", formul: "1 b3 b5", alt: "vii°" },
          ],
        },
      },
    ],
    kulakla: [
      { t: "p", m: "Üç klasik yürüyüşü dinle ve her akorda derecesini söyle. V'den I'e dönüşteki “eve varma” hissine, vi'nin getirdiği hüzne dikkat et." },
      {
        t: "dinle",
        ornekler: [
          { ad: "I – IV – V – I", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["F3", "A3", "C4"], ["G3", "B3", "D4"], ["C3", "E3", "G3"]], beklenen: { ton: "C", romen: ["I", "IV", "V", "I"] } },
          { ad: "I – V – vi – IV", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["G2", "B2", "D3"], ["A2", "C3", "E3"], ["F2", "A2", "C3"]], beklenen: { ton: "C", romen: ["I", "V", "vi", "IV"] } },
          { ad: "ii – V – I", tip: "akorlar", akorlar: [["D3", "F3", "A3"], ["G2", "B2", "D3"], ["C3", "E3", "G3"]], beklenen: { ton: "C", romen: ["ii", "V", "I"] } },
        ],
      },
    ],
    dene: [
      "Do majörün yedi akorunu sırayla çal ve derecelerini söyle: I, ii, iii, IV, V, vi, vii°.",
      "I – V – vi – IV'ü önce Do'da (C G Am F), sonra Sol'da (G D Em C) çal: aynı yürüyüş, başka ton.",
      "ii – V – I'i yedili akorlarla çal (Dm7 – G7 – Cmaj7); G7'deki F'nin E'ye indiğini dinle.",
      "Sevdiğin bir şarkının akorlarını Roma rakamlarıyla yaz.",
    ],
    ipucu: [
      "Doğal minör tonda kalıp: i – ii° – III – iv – v – VI – VII. Klasik müzikte v çoğu zaman majör V yapılır (armonik minör).",
      "Akorun adını değil derecesini düşün: bir şarkıyı başka tona aktarmak (transpoze) böylece kolaylaşır.",
    ],
    sonraki: { metin: "Modlara Giriş: aynı notalar, farklı merkezler.", href: "/teori/modlar" },
    kaynaklar: [KOSTKA, "Edward Aldwell, Carl Schachter — Harmony and Voice Leading"],
    kesif: { set: "major", root: 0 },
  },
];

export const dersBul = (slug: string) => DERSLER.find((d) => d.slug === slug);
