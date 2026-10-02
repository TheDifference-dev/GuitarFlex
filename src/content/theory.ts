export type TheoryLesson = {
  slug: string;
  title: string;
  level: number;
  summary: string;
  body: string[];
  table?: { head: string[]; rows: string[][] };
  /** Sayfadaki sap gezgininin başlangıç ayarı */
  explore?: { set: string; root: number };
};

// Kök değerleri: 0 = C (Do), 2 = D, 4 = E, 5 = F, 7 = G, 9 = A, 11 = B

export const THEORY: TheoryLesson[] = [
  {
    slug: "notalar",
    title: "12 Nota ve Oktav",
    level: 1,
    summary: "Batı müziğindeki 12 sesi, diyez ve bemolleri, harf isimlerini öğren.",
    body: [
      "Batı müziğinde birbirinden farklı yalnızca 12 ses vardır. 13. ses, ilk sesin bir oktav tiz halidir; frekansı tam iki katıdır.",
      "Gitarcılar genellikle harf isimlerini kullanır: C = Do, D = Re, E = Mi, F = Fa, G = Sol, A = La, B = Si.",
      "Doğal notalar arasındaki boşluklara diyez (#, yarım ton yukarı) ya da bemol (b, yarım ton aşağı) ile isim verilir. C# ile Db aynı sestir.",
      "Dikkat: E–F ve B–C arasında ara nota yoktur. Bu iki çift arasındaki mesafe yarım tondur.",
    ],
    table: {
      head: ["Harf", "Solfej", "Sonraki ara nota"],
      rows: [
        ["C", "Do", "C# / Db"],
        ["D", "Re", "D# / Eb"],
        ["E", "Mi", "yok"],
        ["F", "Fa", "F# / Gb"],
        ["G", "Sol", "G# / Ab"],
        ["A", "La", "A# / Bb"],
        ["B", "Si", "yok"],
      ],
    },
    explore: { set: "major", root: 0 },
  },
  {
    slug: "sapta-notalar",
    title: "Sap Üzerinde Notaları Bulmak",
    level: 1,
    summary: "Bir perde = yarım ton kuralıyla sapın tamamını çözmek.",
    body: [
      "Gitarda bir perde ilerlemek sesi yarım ton yükseltir. 12. perdede açık telin bir oktav tizine ulaşırsın; desen 12. perdeden sonra tekrar eder.",
      "Standart akort kalından inceye E – A – D – G – B – E'dir. Ezber cümlesi: “Erken Ayrılan Dostlar Gece Bize Ekmek…” gibi kendi cümleni kur.",
      "Önce kalın Mi ve La tellerindeki doğal notaları ezberle. Power chord ve barre akorların kök sesleri bu iki telde bulunur.",
      "Oktav kalıbı: kalın Mi telindeki bir notanın oktavı, iki tel ince ve iki perde ileridedir (Re teli için). Sol telinden Si teline geçerken kalıp bir perde kayar.",
    ],
    explore: { set: "major", root: 0 },
  },
  {
    slug: "araliklar",
    title: "Aralıklar",
    level: 2,
    summary: "İki nota arasındaki mesafe: gam ve akorların yapı taşı.",
    body: [
      "Aralık, iki nota arasındaki mesafedir ve yarım ton sayısıyla ölçülür. Gamlar ve akorlar, kök sese göre aralıklarla tanımlanır.",
      "Sap gezgininde “Aralık” görünümünü aç: her nota kök sese uzaklığını gösterir. Aynı şekli sapta kaydırdığında aralıklar değişmez, sadece kök değişir.",
      "Minör ile majör arasındaki temel fark 3. derecedir: b3 (3 yarım ton) minör, 3 (4 yarım ton) majör karakter verir.",
    ],
    table: {
      head: ["Yarım ton", "Simge", "Ad"],
      rows: [
        ["0", "1", "Aynı ses (kök)"],
        ["1", "b2", "Küçük ikili"],
        ["2", "2", "Büyük ikili"],
        ["3", "b3", "Küçük üçlü"],
        ["4", "3", "Büyük üçlü"],
        ["5", "4", "Tam dörtlü"],
        ["6", "b5", "Artık dörtlü / eksik beşli"],
        ["7", "5", "Tam beşli"],
        ["8", "b6", "Küçük altılı"],
        ["9", "6", "Büyük altılı"],
        ["10", "b7", "Küçük yedili"],
        ["11", "7", "Büyük yedili"],
        ["12", "8", "Oktav"],
      ],
    },
    explore: { set: "major", root: 7 },
  },
  {
    slug: "major-gam",
    title: "Majör Gam",
    level: 2,
    summary: "T – T – Y – T – T – T – Y formülü ve parlak, mutlu karakter.",
    body: [
      "Majör gam yedi notadan oluşur ve şu adımlarla ilerler: Tam – Tam – Yarım – Tam – Tam – Tam – Yarım (T = 2 perde, Y = 1 perde).",
      "Do majör (C) hiç diyez/bemol içermez: C D E F G A B. Aynı formülü başka bir kökten başlatırsan o tonun majör gamını elde edersin.",
      "Gitarda tek tel üzerinde formülü perdelerle çalarak duy, ardından sap gezgininde 5. pozisyondaki kutu şeklini incele.",
    ],
    explore: { set: "major", root: 0 },
  },
  {
    slug: "minor-gam",
    title: "Doğal Minör ve Paralel Ton",
    level: 2,
    summary: "Hüzünlü karakter ve majörle aynı notaları paylaşan paralel minör.",
    body: [
      "Doğal minör formülü: T – Y – T – T – Y – T – T. Aralıklarla: 1 2 b3 4 5 b6 b7.",
      "La minör (Am) ile Do majör (C) aynı yedi notayı kullanır; sadece başlangıç (kök) farklıdır. Bu iki tona “paralel” (relative) ton denir.",
      "Kural: bir majör tonun paralel minörü, o tonun 6. derecesidir (C → Am, G → Em, D → Bm).",
    ],
    explore: { set: "minor", root: 9 },
  },
  {
    slug: "akor-yapisi",
    title: "Akorlar Nasıl Oluşur?",
    level: 2,
    summary: "Üçlü (triad) ve yedili akorların aralık formülleri.",
    body: [
      "Akor, aynı anda çalınan en az üç notadır. En temel akor “triad”dır: kök (1), üçlü (3 ya da b3) ve beşli (5).",
      "Majör = 1 3 5, minör = 1 b3 5, eksik (dim) = 1 b3 b5. Power chord (5) üçlüyü içermez; bu yüzden ne majör ne minördür ve distorsiyonla temiz duyulur.",
      "Triada 7. derece eklenince yedili akorlar oluşur: maj7 = 1 3 5 7, dominant 7 = 1 3 5 b7, m7 = 1 b3 5 b7.",
      "Sap gezgininde akor türünü seç: sapın her yerinde aynı akorun farklı notalarını görürsün; bunlar farklı akor şekillerinin (voicing) kaynağıdır.",
    ],
    explore: { set: "maj", root: 0 },
  },
  {
    slug: "pentatonik-blues",
    title: "Pentatonik ve Blues Gamı",
    level: 3,
    summary: "Rock ve blues solosunun beş notalı temeli.",
    body: [
      "Pentatonik gam beş notadır. Minör pentatonik: 1 b3 4 5 b7. Doğal minörden 2. ve b6. derece çıkarılarak elde edilir; geriye “yanlış” duyulması zor bir dizi kalır.",
      "Minör pentatoniğe b5 eklenince blues gamı oluşur. Bu “blue note” geçiş notası olarak kullanılır; üzerinde uzun durulmaz.",
      "Pentatonik sapta beş kutu (pozisyon) halinde öğrenilir. Önce 1. kutuyu (La minörde 5. perde) ezberle, sonra komşu kutulara slide ile bağlan.",
    ],
    explore: { set: "minor-penta", root: 9 },
  },
  {
    slug: "diatonik-akorlar",
    title: "Diatonik Akorlar ve Dereceler",
    level: 3,
    summary: "Bir tonun akor ailesi: I – IV – V ve şarkıların iskeleti.",
    body: [
      "Majör gamın her derecesinin üzerine gamın notalarıyla bir triad kurulursa o tonun yedi akoru elde edilir.",
      "Majör tonda kalıp: I majör, ii minör, iii minör, IV majör, V majör, vi minör, vii° eksik. Do majörde: C, Dm, Em, F, G, Am, B°.",
      "Pop ve rock'ta en çok kullanılan diziler: I–IV–V (C–F–G), I–V–vi–IV (C–G–Am–F), ii–V–I (Dm–G–C).",
      "Bu dizileri derece numarasıyla düşünürsen bir şarkıyı istediğin tona kolayca aktarırsın.",
    ],
    table: {
      head: ["Derece", "Tür", "C majörde", "G majörde"],
      rows: [
        ["I", "Majör", "C", "G"],
        ["ii", "Minör", "Dm", "Am"],
        ["iii", "Minör", "Em", "Bm"],
        ["IV", "Majör", "F", "C"],
        ["V", "Majör", "G", "D"],
        ["vi", "Minör", "Am", "Em"],
        ["vii°", "Eksik", "B°", "F#°"],
      ],
    },
    explore: { set: "major", root: 0 },
  },
  {
    slug: "modlar",
    title: "Modlara Giriş",
    level: 4,
    summary: "Aynı notalar, farklı merkez: Dorian, Frigyen, Miksolidyen.",
    body: [
      "Majör gamın notalarını farklı bir dereceden başlatınca “mod” elde edilir. Her mod kendine özgü bir renk taşır.",
      "Dorian (2. derece): minör ama 6. derece büyük, caz ve funk'ta sık. Frigyen (3. derece): b2 sayesinde karanlık, İspanyol/metal havası. Miksolidyen (5. derece): majör ama b7, blues-rock ve funk'ın sesi.",
      "Modu duymanın yolu: kök notayı sürekli çalan bir backing track ya da drone üzerinde gamı çalmak. Sap gezgininde Aralık görünümüyle karakteristik notayı (Dorian'da 6, Frigyen'de b2, Miksolidyen'de b7) bul.",
    ],
    explore: { set: "dorian", root: 2 },
  },
  {
    slug: "ritim-temelleri",
    title: "Ritim, Ölçü ve Tempo",
    level: 1,
    summary: "Nota süreleri, 4/4 ölçü ve BPM ile metronom kullanımı.",
    body: [
      "Tempo dakikadaki vuruş sayısıyla (BPM) ölçülür. 60 BPM saniyede bir vuruştur.",
      "4/4 ölçüde her ölçü dört dörtlük vuruştan oluşur. Birlik = 4 vuruş, ikilik = 2, dörtlük = 1, sekizlik = 1/2, onaltılık = 1/4 vuruş.",
      "Üçleme: bir vuruşa üç eşit nota sığdırmaktır. Sekizlik üçleme “ta-ki-ti” diye sayılır.",
      "Çalışma kuralı: her egzersizi hatasız çalabildiğin en yüksek tempoda başlat, üç kez temiz çalınca 5 BPM artır.",
    ],
    table: {
      head: ["Nota", "Vuruş (4/4)", "Sayma"],
      rows: [
        ["Birlik", "4", "1-2-3-4"],
        ["İkilik", "2", "1-2"],
        ["Dörtlük", "1", "1"],
        ["Sekizlik", "1/2", "1-ve"],
        ["Sekizlik üçleme", "1/3", "1-ta-ki"],
        ["Onaltılık", "1/4", "1-e-ve-a"],
      ],
    },
  },
];

export function getLesson(slug: string) {
  return THEORY.find((l) => l.slug === slug);
}
