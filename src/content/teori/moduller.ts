// Teori yollarının "Temeller" modülü: her sekme tek A4 sayfasına sığan bir eğitim dersi (yol adı → sekme adı → ders).
// Sekme adları içerik paketindeki yol tanımıyla (icerik/yollar/<yol>.json › modul.sekmeler) aynıdır.
// Notalar, aralıklar ve perde konumları scripts/teori-dogrula.mjs ile hesaplanarak denetlenir.
import type { Ders } from "./tipler.ts";
import { gamNoktalari, pn } from "./yardim.ts";

const LEAVITT = "William Leavitt — A Modern Method for Guitar (Berklee)";
const BERKLEE = "Paul Schmeling — Berklee Music Theory";
const KOSTKA = "Stefan Kostka, Dorothy Payne — Tonal Harmony";
const GOULD = "Elaine Gould — Behind Bars";
const KARPINSKI = "Gary S. Karpinski — Manual for Ear Training and Sight Singing";
const EDWARDS = "Bill Edwards — Fretboard Logic SE";

const EM: { t: number; p: number }[] = [
  { t: 6, p: 0 },
  { t: 5, p: 2 },
  { t: 4, p: 2 },
  { t: 3, p: 0 },
  { t: 2, p: 0 },
  { t: 1, p: 0 },
];

const KLAVYE: Record<string, Ders> = {
  "Klavye Anatomisi": {
    slug: "klavye-anatomisi",
    baslik: "Klavye Anatomisi",
    ozet: "Sapın parçaları, tel numaraları, perdeler ve yön bulduran işaret noktaları.",
    tanim: [
      "Gitarın **klavyesi** (sap yüzeyi), sesi değiştirdiğimiz yerdir. Tepede **eşik** (nut) telleri taşır; sap boyunca dizili metal **perde telleri** klavyeyi **perdelere** böler. Bir tele bir perdenin hemen arkasından basınca telin titreşen boyu kısalır ve ses yükselir.",
      "Teller inceden kalına numaralanır: **1. tel ince Mi (E)**, 6. tel kalın Mi. Tab ve akor diyagramları bu numaraları kullanır.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Teller: açık ses ve 12. perdedeki oktav",
          bas: ["Tel", "Ad", "Açık", "12. perde"],
          satirlar: [
            ["1", "ince Mi", "E4", "E5"],
            ["2", "Si", "B3", "B4"],
            ["3", "Sol", "G3", "G4"],
            ["4", "Re", "D3", "D4"],
            ["5", "La", "A2", "A3"],
            ["6", "kalın Mi", "E2", "E3"],
          ],
          dogrula: { tur: "tel", tel: 0, nota: 2 },
        },
      },
      { t: "p", m: "Her perde sesi **yarım ses** yükseltir; 12 perde bir oktav eder. Bu yüzden 12. perdeden sonrası açık tellerden başlayan desenin aynısıdır. “Yukarı” sözcüğü gitarda sesin tizleşmesi demektir: gövdeye doğru gitmek ya da ince tele geçmek." },
    ],
    gitarda: [
      { t: "p", m: "İşaret noktaları 3, 5, 7, 9, 12 (çift), 15 ve 17. perdelerdedir; sapın yan yüzünde de tekrarlanır. Çalarken parmağını perde telinin hemen arkasına koy: daha az kuvvetle daha temiz ses çıkar." },
      {
        t: "gorsel",
        g: {
          tur: "sap",
          baslik: "Sap haritası: açık teller (0) ve 12. perdedeki oktavları; noktalar perde işaretleri.",
          etiket: "serbest",
          perde: [0, 15],
          noktalar: [1, 2, 3, 4, 5, 6].flatMap((t) => [
            { t, p: 0, e: ["", "E4", "B3", "G3", "D3", "A2", "E2"][t] },
            { t, p: 12, e: ["", "E5", "B4", "G4", "D4", "A3", "E3"][t], k: "kok" as const },
          ]),
          genis: true,
        },
      },
    ],
    kulakla: [
      { t: "p", m: "Açık telleri kalından inceye dinle; sonra bir telin açık sesini ve 12. perdesini art arda çal. İki ses aynı nota adını taşır, aralarında bir oktav vardır." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Açık teller 6 → 1", tip: "dizi", notalar: ["E2", "A2", "D3", "G3", "B3", "E4"] },
          { ad: "5. tel: açık – 12. perde", tip: "aralik", notalar: ["A2", "A3"], beklenen: { aralik: 12 } },
          { ad: "1. tel: açık – 12. perde", tip: "aralik", notalar: ["E4", "E5"], beklenen: { aralik: 12 } },
        ],
      },
    ],
    dene: [
      "Gözün kapalıyken bir teli say ve çal: “3. tel” dediğinde Sol teline dokun.",
      "Her teli açık ve 12. perdede çal; oktavı dinle.",
      "Yalnız işaret noktalarına bakarak 5., 7. ve 12. perdeleri 6. telde bul.",
      "1. perdeden 5. perdeye her tele birer kez bas; parmağın perde teline yakın mı, kontrol et.",
    ],
    ipucu: [
      "Tel numarası ile ses yüksekliği ters yöndedir: 1. tel en tiz, 6. tel en pes. “Üst tel” derken hangisini kastettiğini netleştir.",
      "Perdenin ortasına ya da perde telinin üstüne basmak vızıltı ve yanlış ses yapar.",
    ],
    sonraki: { metin: "Tab Okuma: tel ve perdeyi kâğıda yazmanın yolu." },
    kaynaklar: [LEAVITT, "Will Schmid, Greg Koch — Hal Leonard Guitar Method"],
  },
  "Tab Okuma": {
    slug: "tab-okuma",
    baslik: "Tab Okuma",
    ozet: "Tablatürde teller, perdeler, akorlar ve teknik işaretleri.",
    tanim: [
      "**Tab** (tablatür), hangi tele ve hangi perdeye basılacağını gösteren gitar yazısıdır. Altı yatay çizgi altı teli temsil eder: **en üst çizgi 1. tel (ince Mi)**, en alttaki 6. tel. Çizgideki rakam o telde basılacak perdedir; 0 açık tel demektir.",
    ],
    kural: [
      { t: "p", m: "Soldan sağa okunur. Yan yana rakamlar **sırayla**, alt alta rakamlar **aynı anda** (akor) çalınır. Rakamların üstündeki harfler tekniği gösterir. Tab tek başına süre göstermez; süre için ritim işaretlerine ya da dinlemeye ihtiyaç vardır (bkz. Tab Üzerinde Süreler)." },
      {
        t: "tablo",
        tablo: {
          baslik: "Tab işaretleri",
          bas: ["İşaret", "Anlamı", "Örnek"],
          satirlar: [
            ["h", "Hammer-on: vurarak üst perdeye", "5h7"],
            ["p", "Pull-off: çekerek alt perdeye", "7p5"],
            ["/  \\", "Slide: kayarak çık / in", "5/7"],
            ["b", "Bend: teli bükerek sesi yükselt", "7b9"],
            ["r", "Release: bükülü teli geri bırak", "7b9r7"],
            ["~", "Vibrato", "7~"],
            ["x", "Boğuk (ölü) vuruş", "x"],
            ["PM", "Palm mute: avuçla sustur", "PM---"],
          ],
        },
      },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "tab",
          baslik: "Mi minör pentatonikten kısa bir cümle: hammer-on, pull-off, slide, bend ve son akor.",
          not: "altta nota adları",
          etiket: "nota",
          kolonlar: [
            { n: [{ t: 6, p: 0 }], e: "E" },
            { n: [{ t: 6, p: 3 }], teknik: "h", e: "G" },
            { n: [{ t: 5, p: 0 }], e: "A" },
            { n: [{ t: 5, p: 2 }], teknik: "h", e: "B" },
            { n: [{ t: 4, p: 2 }], e: "E" },
            { n: [{ t: 4, p: 0 }], teknik: "p", e: "D" },
            { n: [{ t: 3, p: 2 }], e: "A" },
            { n: [{ t: 3, p: 4 }], teknik: "/", e: "B" },
            { n: [{ t: 2, p: 3 }], teknik: "b", e: "D" },
            { n: EM, e: "Em" },
          ],
        },
      },
      { t: "p", m: "Okurken önce tel çizgisini, sonra rakamı bul. Teknik harfi iki rakamın arasındaysa ilk notayı vur, ikincisini sol elle üret: 0h3'te 3. perdeye pena vurmadan, parmağı çekiç gibi indirerek ulaşırsın." },
    ],
    kulakla: [
      { t: "p", m: "Cümleyi dinle ve tabı izle: vurulan ve sol elle üretilen notaların tınısı farklıdır. Bend'de hedef ses (E) kulağında olmalı; bükülen D, E'ye ulaşana kadar it." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Tabdaki cümle", tip: "dizi", notalar: ["E2", "G2", "A2", "B2", "E3", "D3", "A3", "B3", "D4", "E4"] },
          { ad: "Son akor: Em", tip: "akor", notalar: ["E2", "B2", "E3", "G3", "B3", "E4"], beklenen: { formul: "1 b3 5" } },
        ],
      },
    ],
    dene: [
      "Tabdaki cümleyi yavaşça çal; her teknik harfinde dur ve doğru yaptığını kontrol et.",
      "Aynı cümleyi hammer-on ve pull-off olmadan, her notaya pena vurarak çal; farkı dinle.",
      "Bildiğin bir akoru (ör. C) tab olarak alt alta yaz: x-3-2-0-1-0'ı 6. telden 1. tele yerleştir.",
      "Kısa bir melodi uydur ve tabını kâğıda yaz; bir hafta sonra yalnız tabdan çal.",
    ],
    ipucu: [
      "En sık hata tabı ters okumaktır: üst çizgi kalın tel **değil**, ince Mi telidir.",
      "Rakam “hangi parmak” demek değildir; parmak seçimi pozisyona göre sana kalmıştır.",
      "İki basamaklı rakamlar (12, 15) tek perdedir: “bir-iki” diye ayrı okuma.",
    ],
    sonraki: { metin: "Akor Diyagramları: tab'ın akorlar için dikey kardeşi." },
    kaynaklar: ["Will Schmid, Greg Koch — Hal Leonard Guitar Method", GOULD],
  },
  "Akor Diyagramları": {
    slug: "akor-diyagramlari",
    baslik: "Akor Diyagramları",
    ozet: "Dikey sap çizimini okumak: teller, perdeler, parmaklar, açık ve çalınmayan teller, barre.",
    tanim: [
      "**Akor diyagramı**, sapın dik tutulmuş bir fotoğrafıdır: dikey çizgiler teller (**solda kalın Mi**, sağda ince Mi), yatay çizgiler perde telleridir. Üstteki kalın çizgi eşiktir. Noktalar basılacak yerleri, içlerindeki sayılar parmakları gösterir.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Diyagram işaretleri",
          bas: ["İşaret", "Anlamı"],
          satirlar: [
            ["○ (üstte)", "Açık tel: basmadan çal"],
            ["✕ (üstte)", "Bu teli çalma ya da sustur"],
            ["● içinde 1–4", "Parmak: 1 işaret, 2 orta, 3 yüzük, 4 serçe"],
            ["Mavi nokta", "Akorun kök notası"],
            ["Yatay çubuk", "Barre: tek parmakla birden çok tel"],
            ["Yanda sayı (5)", "Diyagram 5. perdeden başlıyor"],
          ],
        },
      },
      { t: "p", m: "Diyagram eşikten başlamıyorsa kalın üst çizgi çizilmez, yanına başlangıç perdesi yazılır. Barre'de işaret parmağı bütün tellere yatar; aynı perdedeki diğer noktalar o parmağın parçasıdır." },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "akorlar",
          baslik: "Açık akorlar, iki barre akor ve 5. perdeden başlayan bir şekil.",
          akorlar: [
            { ad: "C", sekil: "x 3 2 0 1 0", parmak: "0 3 2 0 1 0", kok: "C", formul: "1 3 5" },
            { ad: "G", sekil: "3 2 0 0 0 3", parmak: "2 1 0 0 0 3", kok: "G", formul: "1 3 5" },
            { ad: "Am", sekil: "x 0 2 2 1 0", parmak: "0 0 2 3 1 0", kok: "A", formul: "1 b3 5" },
            { ad: "F", sekil: "1 3 3 2 1 1", parmak: "1 3 4 2 1 1", kok: "F", formul: "1 3 5" },
            { ad: "Bm", sekil: "x 2 4 4 3 2", parmak: "0 1 3 4 2 1", kok: "B", formul: "1 b3 5" },
            { ad: "A", sekil: "5 7 7 6 5 5", parmak: "1 3 4 2 1 1", kok: "A", formul: "1 3 5" },
          ],
        },
      },
      { t: "p", m: "Okuma sırası: önce ✕ ve ○ işaretlerine bak (hangi teller çalınacak), sonra parmakları kalın telden inceye yerleştir. Barre'li akorda önce işaret parmağını yatır, sonra diğer parmakları ekle." },
    ],
    kulakla: [
      { t: "p", m: "Her akoru önce tek tek (arpej) çal: susturulması gereken tel çalıyorsa ya da bir nota boğuk çıkıyorsa kulağın hemen fark eder. Sonra tarayarak dinle." },
      {
        t: "dinle",
        ornekler: [
          { ad: "C", tip: "akor", notalar: ["C3", "E3", "G3", "C4", "E4"], beklenen: { formul: "1 3 5" } },
          { ad: "G", tip: "akor", notalar: ["G2", "B2", "D3", "G3", "B3", "G4"], beklenen: { formul: "1 3 5" } },
          { ad: "Am", tip: "akor", notalar: ["A2", "E3", "A3", "C4", "E4"], beklenen: { formul: "1 b3 5" } },
          { ad: "F (barre)", tip: "akor", notalar: ["F2", "C3", "F3", "A3", "C4", "F4"], beklenen: { formul: "1 3 5" } },
        ],
      },
    ],
    dene: [
      "C, G ve Am diyagramlarını oku ve çal; her telin tek tek temiz çıktığını kontrol et.",
      "F barre'de önce yalnız işaret parmağını 1. perdeye yatır ve altı teli çal; sonra diğer parmakları ekle.",
      "5. perdedeki A şeklini 3. perdeye kaydır: G olur. Yanındaki sayı değişir, şekil değişmez.",
      "Bildiğin bir akorun diyagramını kâğıda çiz: ✕, ○ ve parmak numaralarını unutma.",
    ],
    ipucu: [
      "Diyagram ile tabı karıştırma: diyagramda **sol** çizgi kalın Mi teli, tabda **alt** çizgi kalın Mi telidir.",
      "Parmak numaraları öneridir; yine de yeni başlayanlar için en ekonomik dizilimi gösterir.",
    ],
    sonraki: { metin: "Notalar ve Oktavlar: akorların içindeki notaları adlarıyla tanımak." },
    kaynaklar: ["Will Schmid, Greg Koch — Hal Leonard Guitar Method", "Ted Greene — Chord Chemistry"],
  },
  "Notalar ve Oktavlar": {
    slug: "notalar-ve-oktavlar",
    baslik: "Notalar ve Oktavlar",
    ozet: "Doğal notaların sapın tamamındaki yerleri ve bir notayı her telde bulduran oktav şekilleri.",
    tanim: [
      "Doğal notalar Do Re Mi Fa Sol La Si'dir (C D E F G A B). **Mi–Fa** ve **Si–Do** arasında yarım ses (1 perde), diğer komşu doğal notalar arasında tam ses (2 perde) vardır. Diyez (♯) yarım ses yükseltir, bemol (♭) alçaltır; Fa♯ ile Sol♭ aynı perdedir (**enarmonik**).",
    ],
    kural: [
      { t: "p", m: "Bir notanın **oktavı** aynı adı taşıyan, iki kat frekanslı sestir. Sapta oktav üç yolla bulunur: aynı telde 12 perde ileri; 6. ya da 5. telden **iki tel ince, iki perde ileri**; 4. ya da 3. telden **iki tel ince, üç perde ileri** (Si teli büyük üçlü aralıklı akortlandığı için)." },
      {
        t: "gorsel",
        g: { tur: "sap", baslik: "Doğal notalar, 0–12. perdeler: Mi–Fa ve Si–Do yan yana, diğerleri arasında bir boş perde.", etiket: "nota", perde: [0, 12], kok: "C", kalip: [0, 2, 4, 5, 7, 9, 11], tam: true, noktalar: gamNoktalari({ kok: "C", formul: "1 2 3 4 5 6 7", perde: [0, 12], etiket: "nota" }), genis: true },
      },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "sap",
          baslik: "Bir nota, altı tel: Sol (G) ve onu birbirine bağlayan oktav şekilleri.",
          etiket: "nota",
          perde: [0, 12],
          kok: "G",
          kalip: [0],
          tam: true,
          noktalar: [
            { t: 6, p: 3, e: "G", k: "kok" },
            { t: 4, p: 5, e: "G", k: "kok" },
            { t: 2, p: 8, e: "G", k: "kok" },
            { t: 5, p: 10, e: "G", k: "kok" },
            { t: 3, p: 12, e: "G", k: "kok" },
            { t: 3, p: 0, e: "G", k: "kok" },
            { t: 1, p: 3, e: "G", k: "kok" },
          ],
          baglar: [
            [0, 1],
            [1, 2],
            [3, 4],
            [5, 6],
          ],
        },
      },
      { t: "p", m: "Önce 6. ve 5. teldeki notaları ezberle, ötekileri oktav şekilleriyle türet. Örneğin 6. teldeki 3. perde Sol ise 4. telde 5. perde, 2. telde 8. perde de Sol'dur." },
    ],
    kulakla: [
      { t: "p", m: "Bulduğun her Sol'u sırayla çal: aynı adı taşıyan sesler oktav oktav tizleşir. Yanlış perdeye basarsan kulak “benzemiyor” der." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Sol'lar: G2 – G3 – G4", tip: "dizi", notalar: ["G2", "G3", "G4"] },
          { ad: "Oktav: 6. tel 3 → 4. tel 5", tip: "aralik", notalar: ["G2", "G3"], beklenen: { aralik: 12 } },
          { ad: "Enarmonik: F♯ = G♭", tip: "aralik", notalar: ["F#3", "Gb3"], beklenen: { aralik: 0 } },
        ],
      },
    ],
    dene: [
      "Her gün bir doğal nota seç ve onu altı telin hepsinde 0–12 arasında bul.",
      "6. teldeki her doğal notadan oktav şekliyle 4. tele atla ve adını söyle.",
      "5. telden 3. tele oktav şekliyle aynı işi yap.",
      "Si teli kuralını sına: 4. telin 2. perdesi (E) için oktavı 2. telde 5. perdede bul.",
    ],
    ipucu: [
      "Oktav şeklini Si teline geçerken bir perde kaydırmayı unutmak en sık hatadır.",
      "Aynı perde iki adla yazılabilir; hangisinin kullanılacağını ton belirler (Fa majörde B♭, A♯ değil).",
    ],
    sonraki: { metin: "CAGED Sistemi: oktav şekillerinin üstüne akor şekilleri kurmak." },
    kaynaklar: [LEAVITT, "Mick Goodrick — The Advancing Guitarist"],
  },
  "CAGED Sistemi": {
    slug: "caged-sistemi",
    baslik: "CAGED Sistemi",
    ozet: "Beş açık akor şeklini sap boyunca kaydırarak her akoru beş yerde çalmak.",
    tanim: [
      "**CAGED**, majör akorun beş açık şeklinin (C, A, G, E, D) sap boyunca kaydırılmasıyla her akoru beş farklı yerde çalma yöntemidir. Şekiller bu sırayla birbirine bağlanır ve 12 perdede bütün sapı kaplar; sonra döngü tekrar eder.",
    ],
    kural: [
      { t: "p", m: "Bir açık şekli yukarı taşıdığında açık teller boş kalamaz: işaret parmağı onların yerini alır (barre ya da tek parmak), diğer parmaklar birer numara kayar. Şekli kaç perde kaydırırsan akor o kadar yarım ses yükselir. Her şeklin kökleri sabit tellerdedir: **C** 5. ve 2., **A** 5. ve 3., **G** 6., 3. ve 1., **E** 6., 4. ve 1., **D** 4. ve 2. tel." },
      {
        t: "gorsel",
        g: {
          tur: "sap",
          baslik: "Do majör akorunun notaları sap boyunca ve beş CAGED biçimi.",
          not: "1 kök, 3 büyük üçlü, 5 tam beşli.",
          etiket: "aralik",
          kok: "C",
          perde: [0, 15],
          kalip: [0, 4, 7],
          tam: true,
          noktalar: gamNoktalari({ kok: "C", formul: "1 3 5", perde: [0, 15], etiket: "aralik" }),
          bolgeler: [
            { bas: 0, son: 3, ad: "C" },
            { bas: 3, son: 5, ad: "A" },
            { bas: 5, son: 8, ad: "G" },
            { bas: 8, son: 10, ad: "E" },
            { bas: 10, son: 13, ad: "D" },
            { bas: 12, son: 15, ad: "C" },
          ],
          genis: true,
        },
      },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "akorlar",
          baslik: "Aynı akor (C), beş şekil: soldan sağa sap boyunca yukarı.",
          akorlar: [
            { ad: "C", sekil: "x 3 2 0 1 0", parmak: "0 3 2 0 1 0", kok: "C", formul: "1 3 5", alt: "C şekli" },
            { ad: "C", sekil: "x 3 5 5 5 3", parmak: "0 1 2 3 4 1", kok: "C", formul: "1 3 5", alt: "A şekli" },
            { ad: "C", sekil: "8 7 5 5 5 8", parmak: "3 2 1 1 1 4", kok: "C", formul: "1 3 5", alt: "G şekli" },
            { ad: "C", sekil: "8 10 10 9 8 8", parmak: "1 3 4 2 1 1", kok: "C", formul: "1 3 5", alt: "E şekli" },
            { ad: "C", sekil: "x x 10 12 13 12", parmak: "0 0 1 2 4 3", kok: "C", formul: "1 3 5", alt: "D şekli" },
          ],
        },
      },
      { t: "ek", ad: "caged-tablosu" },
    ],
    kulakla: [
      { t: "p", m: "Beş şekli sırayla çal: hepsi Do majördür ama tınıları farklıdır; tiz şekiller daha parlak, pes şekiller daha dolgun duyulur. Bir şarkıda doğru şekli seçmek, akoru doğru yükseklikte duyurmaktır." },
      {
        t: "dinle",
        ornekler: [
          { ad: "C şekli (açık)", tip: "akor", notalar: ["C3", "E3", "G3", "C4", "E4"], beklenen: { formul: "1 3 5" } },
          { ad: "A şekli (3. perde)", tip: "akor", notalar: ["C3", "G3", "C4", "E4", "G4"], beklenen: { formul: "1 3 5" } },
          { ad: "E şekli (8. perde)", tip: "akor", notalar: ["C3", "G3", "C4", "E4", "G4", "C5"], beklenen: { formul: "1 3 5" } },
        ],
      },
    ],
    dene: [
      "Beş Do şeklini sırayla çal ve her birinde kök notalarını göster.",
      "Aynı sırayı Sol (G) için kur: E şekli 3. perdede, D şekli 5. perdede başlar.",
      "Tek şekilde kal ve tonu değiştir: E şeklini 1., 3., 5. perdelerde çal (F, G, A).",
      "Bir şekilden komşusuna geçerken ortak notayı (kök ya da beşli) parmağından kaldırma.",
    ],
    ipucu: [
      "Taşınmış şekillerin hepsini tam çalmak zorunda değilsin; ince üç ya da dört tellik parçaları da aynı akordur.",
      "G ve C şekilleri zor tutulur; önce A ve E şekillerini (barre akorlar) sağlamlaştır.",
      "Minör akorlar için aynı sistem Cm, Am, Gm, Em, Dm şekilleriyle işler.",
    ],
    sonraki: { metin: "Pentatonik Şekiller: aynı beş bölgeyi gam kutularıyla doldurmak." },
    kaynaklar: [EDWARDS, "Ted Greene — Chord Chemistry"],
  },
  "Pentatonik Şekiller": {
    slug: "pentatonik-sekiller",
    baslik: "Pentatonik Şekiller",
    ozet: "Minör pentatoniğin beş kutusu, köklerin yeri ve kutuları birbirine bağlamak.",
    tanim: [
      "Minör pentatonik beş notadır: **1, ♭3, 4, 5, ♭7** (La minörde La Do Re Mi Sol). Sap üzerinde her telde iki nota olacak biçimde beş **kutu** (şekil) oluşturur; kutular uç uca eklenince sapın tamamı kaplanır ve 12 perde sonra döngü tekrar eder.",
    ],
    kural: [
      {
        t: "gorsel",
        g: {
          tur: "sap",
          baslik: "La minör pentatonik, sapın tamamı: beş kutu üst üste biner.",
          etiket: "aralik",
          kok: "A",
          perde: [0, 17],
          kalip: [0, 3, 5, 7, 10],
          tam: true,
          noktalar: gamNoktalari({ kok: "A", formul: "1 b3 4 5 b7", perde: [0, 17], etiket: "aralik" }),
          bolgeler: [
            { bas: 5, son: 8, ad: "1" },
            { bas: 7, son: 10, ad: "2" },
            { bas: 9, son: 13, ad: "3" },
            { bas: 12, son: 15, ad: "4" },
            { bas: 14, son: 17, ad: "5" },
          ],
          genis: true,
        },
      },
      {
        t: "tablo",
        tablo: {
          baslik: "La minörde kutular ve kökler",
          bas: ["Kutu", "Perdeler", "Kök (tel/perde)"],
          satirlar: [
            ["1", "5–8", "6/5 · 4/7 · 1/5"],
            ["2", "7–10", "4/7 · 2/10"],
            ["3", "9–13", "2/10 · 5/12"],
            ["4", "12–15", "5/12 · 3/14"],
            ["5", "14–17 (2–5)", "3/14 · 6/17 · 1/17"],
          ],
        },
      },
    ],
    gitarda: [
      { t: "p", m: "Şekiller hareketlidir: kökü başka perdeye kaydırırsan aynı kutu yeni tonda çalar. Do majör pentatonik, paralel minörü La minör ile aynı notaları ve kutuları kullanır; yalnız kök (merkez) değişir. Kutular arasında geçiş için iki kutunun ortak notalarında **slide** yap." },
    ],
    kulakla: [
      { t: "p", m: "Her kutuyu kökten başlayıp köke dönerek çal; kök her geldiğinde “eve dönme” hissini dinle. Kutular farklı yüksekliklerde aynı beş notayı çalar." },
      {
        t: "dinle",
        ornekler: [
          { ad: "1. kutu (A2'den)", tip: "dizi", notalar: ["A2", "C3", "D3", "E3", "G3", "A3", "C4", "D4", "E4", "G4", "A4"] },
          { ad: "Do majör pentatonik (aynı notalar)", tip: "dizi", notalar: ["C3", "D3", "E3", "G3", "A3", "C4"], beklenen: { kalip: [0, 2, 4, 7, 9, 12] } },
        ],
      },
    ],
    dene: [
      "1. ve 2. kutuyu ayrı ayrı ezberle; sonra ikisini 3. telde 7 → 9 slide ile bağla.",
      "Her kutuda yalnız kökleri çal: bir kutudan ötekine kökler köprüdür.",
      "Bütün kutuları 2 perde aşağı kaydır: Sol minör pentatonik.",
      "Bir kutuda 4 ölçülük bir cümle doğaçla, sonraki kutuda aynı cümleyi tekrarla.",
    ],
    ipucu: [
      "Kutuyu bir hapishane gibi görme: iyi cümleler çoğu zaman iki kutunun sınırında doğar.",
      "Kutu numaraları kaynaktan kaynağa değişebilir; köke göre düşünmek her zaman doğrudur.",
    ],
    sonraki: { metin: "Aralıklar: kutuların içindeki her notanın köke uzaklığını şekil olarak görmek." },
    kaynaklar: [EDWARDS, "Mark Levine — The Jazz Theory Book"],
  },
  Aralıklar: {
    slug: "klavye-araliklar",
    baslik: "Sapta Aralık Şekilleri",
    ozet: "Aralıkları perde sayısı yerine şekil olarak görmek ve Si teli kayması.",
    tanim: [
      "**Aralık** iki nota arasındaki uzaklıktır ve yarım ses sayısıyla ölçülür. Gitarda aralıklar **şekildir**: iki notanın tel ve perde ilişkisi, sapın neresinde olursa olsun aynı aralığı verir. Şekli bir kez öğrenirsen bütün tonlarda kullanırsın.",
    ],
    kural: [
      { t: "p", m: "Aynı telde aralık = perde farkı. Bir ince tele geçince 5 yarım ses kazanırsın (tam dörtlü), bu yüzden perde konumu 5 geri gelir; Sol–Si arasında 4 yarım ses kazanıldığı için 4 geri gelir. Formül: **üst teldeki perde = aralık − 5** (Sol→Si geçişinde **− 4**)." },
      {
        t: "tablo",
        tablo: {
          baslik: "Kökten aralığa kaç perde?",
          bas: ["Aralık", "Yarım ses", "Aynı tel", "Bir ince tel", "Sol → Si teli"],
          satirlar: [
            ["Küçük üçlü", "3", "+3", "−2", "−1"],
            ["Büyük üçlü", "4", "+4", "−1", "0"],
            ["Tam dörtlü", "5", "+5", "0", "+1"],
            ["Tritone", "6", "+6", "+1", "+2"],
            ["Tam beşli", "7", "+7", "+2", "+3"],
            ["Küçük altılı", "8", "+8", "+3", "+4"],
            ["Büyük altılı", "9", "+9", "+4", "+5"],
          ],
          dogrula: { tur: "kayma", yarim: 1, ayni: 2, ust: 3, si: 4 },
        },
      },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "sap",
          baslik: "Tam beşli şekli: kalın tellerde iki perde ileri, Sol→Si geçişinde üç perde ileri.",
          etiket: "nota",
          perde: [3, 8],
          noktalar: [
            { t: 6, p: 3, e: "G", k: "kok" },
            { t: 5, p: 5, e: "D" },
            { t: 5, p: 3, e: "C", k: "kok" },
            { t: 4, p: 5, e: "G" },
            { t: 4, p: 3, e: "F", k: "kok" },
            { t: 3, p: 5, e: "C" },
            { t: 3, p: 5, e: "C", k: "kok" },
            { t: 2, p: 8, e: "G" },
          ],
          baglar: [
            [0, 1],
            [2, 3],
            [4, 5],
            [6, 7],
          ],
        },
      },
      { t: "p", m: "Oktav da bir aralık şeklidir: iki tel ince ve iki perde ileri (Si teline geçiyorsa üç). Akor ve gam şekillerinin tamamı bu küçük şekillerden kurulur." },
    ],
    kulakla: [
      { t: "p", m: "Şekli çal, aralığı dinle, adını söyle. Aynı aralığı iki farklı şekille (aynı tel ve komşu tel) çal: ses aynı, el hareketi farklı." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Tam beşli: G2 – D3", tip: "aralik", notalar: ["G2", "D3"], beklenen: { aralik: 7 } },
          { ad: "Büyük üçlü: C3 – E3", tip: "aralik", notalar: ["C3", "E3"], beklenen: { aralik: 4 } },
          { ad: "Büyük altılı: C3 – A3", tip: "aralik", notalar: ["C3", "A3"], beklenen: { aralik: 9 } },
        ],
      },
    ],
    dene: [
      "Kök 6. tel 3. perde (G): tablodaki her aralığı bir ince telde bul ve çal.",
      "Aynı aralıkları 3. telden 2. tele geçerek çal; Si teli kaymasını hisset.",
      "Tam beşli şeklini 6. telde perde perde kaydırarak power chord dizisi çal.",
      "Bir arkadaşının söylediği aralığı (ör. “büyük altılı”) önce şekil, sonra ses olarak bul.",
    ],
    ipucu: [
      "Perde sayısı ile aralık adını karıştırma: büyük üçlü 4 yarım sestir, 3 değil.",
      "Formül ince tele geçişler içindir; kalın tele geçerken işaret tersine döner (+5).",
    ],
    sonraki: { metin: "Klavye Keşfi: öğrendiklerini her gün kısa turlarla pekiştir." },
    kaynaklar: ["Mick Goodrick — The Advancing Guitarist", BERKLEE],
  },
  "Klavye Keşfi": {
    slug: "klavye-kesfi",
    baslik: "Klavye Keşfi",
    ozet: "Sapı ezberlemek için günlük kısa turlar: bir nota, altı tel, oktavla doğrulama.",
    tanim: [
      "Sapı ezberlemek uzun bir oturumla değil, **her gün kısa turlarla** olur. Tek bir notayı altı telde bulmak, oktav şekilleriyle doğrulamak ve adını söyleyerek çalmak, beyninde tel–perde–nota bağını kurar. Bu yoldaki adımlar tam bu alışkanlığı ölçer.",
    ],
    kural: [
      { t: "gorsel", g: { tur: "akis", baslik: "Günlük tur: dört adım, her gün yeni bir nota.", adimlar: ["Nota seç|ör. F", "6 telde bul|0–12. perde", "Oktavla doğrula|2 tel, 2–3 perde", "Söyleyerek çal|metronomla"], dongu: true } },
      {
        t: "tablo",
        tablo: {
          baslik: "Bir haftalık plan (günde 5–10 dakika)",
          bas: ["Gün", "Görev"],
          satirlar: [
            ["1–2", "Bir doğal notayı (F) altı telde bul; 60 BPM'de her vuruşa bir tel."],
            ["3", "6. ve 5. teldeki bütün doğal notaları rastgele sırayla söyle."],
            ["4", "Akor şekillerinde (C, A, E) kök, 3 ve 5'i göster."],
            ["5", "Bir pentatonik kutuda yalnız kökleri ve ♭3'leri çal."],
            ["6–7", "Klavye adımlarındaki soruları zamanla çöz, hatalı notaları tekrar et."],
          ],
        },
      },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "sap",
          baslik: "Fa (F) altı telde: 0–12. perdeler arasında altı yer.",
          etiket: "nota",
          perde: [0, 12],
          kok: "F",
          kalip: [0],
          tam: true,
          noktalar: [
            { t: 6, p: 1, e: "F", k: "kok" },
            { t: 5, p: 8, e: "F", k: "kok" },
            { t: 4, p: 3, e: "F", k: "kok" },
            { t: 3, p: 10, e: "F", k: "kok" },
            { t: 2, p: 6, e: "F", k: "kok" },
            { t: 1, p: 1, e: "F", k: "kok" },
          ],
          baglar: [
            [0, 2],
            [1, 3],
            [2, 4],
          ],
        },
      },
      { t: "p", m: "Bulduğun yerleri ezberlemek yerine **ilişkiyle** düşün: 6. teldeki F'den oktav şekliyle 4. teldeki F'ye, oradan Si teli kuralıyla 2. teldeki F'ye geçersin." },
    ],
    kulakla: [
      { t: "p", m: "Bulduğun her notayı çalarken adını sesli söyle; birkaç gün sonra ses ile ad birbirini çağırmaya başlar." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Fa'lar: F2 – F3 – F4", tip: "dizi", notalar: ["F2", "F3", "F4"] },
          { ad: "Oktav: 6. tel 1 → 4. tel 3", tip: "aralik", notalar: ["F2", "F3"], beklenen: { aralik: 12 } },
        ],
      },
    ],
    dene: [
      "Bugün F'yi altı telde bul; metronom 60 BPM, her vuruşta bir tel.",
      "Sırayı karıştır: 3. tel, 6. tel, 1. tel … gibi rastgele teller seç.",
      "Aynı turu yarın G, sonraki gün A için yap.",
      "Hafta sonunda süreni ölç: altı teli kaç saniyede bitiriyorsun?",
    ],
    ipucu: [
      "Saymak yerine çapa kullan: işaret noktaları ve oktav şekilleri en hızlı yoldur.",
      "Kısa ve düzenli çalışma, haftada bir uzun oturumdan çok daha kalıcıdır.",
      "Yalnız doğal notalarla yetinme: ikinci haftada F♯, B♭ gibi arızalı notaları aynı turla bul ve iki adını da söyle.",
    ],
    sonraki: { metin: "Klavye yolunun adımlarına geç: her bölümün sonunda bir kontrol adımı var." },
    kaynaklar: ["Mick Goodrick — The Advancing Guitarist", EDWARDS],
  },
};

const KULAK: Record<string, Ders> = {
  "Kulak Eğitimi Nedir?": {
    slug: "kulak-egitimi-nedir",
    baslik: "Kulak Eğitimi Nedir?",
    ozet: "Duyduğunu tanıyıp adlandırma becerisi ve gitarcı için düzenli çalışma yolu.",
    tanim: [
      "**Kulak eğitimi**, duyduğun sesleri tanıyıp adlandırma becerisidir: iki ses arasındaki aralık, bir akorun türü, bir şarkının akor yürüyüşü ya da bir ezginin notaları. Bu beceri yetenek değil, düzenli çalışmayla gelişen bir alışkanlıktır.",
      "Gitarcı için en büyük kazanç, duyduğunu sapta hızla bulabilmektir: kulaktan şarkı çıkarmak, doğaçlamada istediğin sesi önceden duymak, akortu ve tonu kontrol etmek.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Kulak eğitiminin beş alanı",
          bas: ["Alan", "Ne duyulur", "İlk alıştırma"],
          satirlar: [
            ["Aralık", "İki ses arası uzaklık", "Oktav ve tam beşliyi ayırt et"],
            ["Akor türü", "Majör, minör, eksik, artık", "Majör / minör karşılaştır"],
            ["Gam", "Dizinin rengi", "Majör ve doğal minör"],
            ["Yürüyüş", "Akorların sırası", "I – IV – V'te bası izle"],
            ["Ritim", "Süreler ve vurgular", "Dörtlük ve sekizlik"],
          ],
        },
      },
      { t: "p", m: "Her alanda yöntem aynıdır: önce **duy**, sonra içinden **söyle**, sonra adını **tahmin et** ve gitarda **doğrula**. Doğrulama adımı kulak ile sap bilgisini birlikte büyütür." },
    ],
    gitarda: [
      { t: "gorsel", g: { tur: "akis", baslik: "Kulak çalışmasının döngüsü.", adimlar: ["Dinle", "İçinden söyle", "Adlandır", "Sapta bul", "Kontrol et"], dongu: true } },
      { t: "p", m: "Sapta bulma adımında önce kök notayı bul, sonra aralığı şekil olarak ekle. Duyduğun ikinci ses tiz mi pes mi, önce bunu karar ver; yön belli olunca aday perdeler azalır." },
    ],
    kulakla: [
      { t: "p", m: "Aşağıdaki iki örnek yoldaki soru türlerine benzer: birinde iki nota, ötekinde bir akor var. Cevap vermeden önce sesi içinden tekrarla." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Örnek: iki nota (tam beşli)", tip: "aralik", notalar: ["C3", "G3"], beklenen: { aralik: 7 } },
          { ad: "Örnek: akor türü (minör)", tip: "akor", notalar: ["A2", "C3", "E3"], beklenen: { formul: "1 b3 5" } },
          { ad: "Örnek: akor türü (majör)", tip: "akor", notalar: ["A2", "C#3", "E3"], beklenen: { formul: "1 3 5" } },
        ],
      },
    ],
    dene: [
      "Her gün 10 dakika ayır; bir alan seç ve yalnız onu çalış.",
      "Dinlediğin sesi mırıldan; sesini duyamıyorsan cevap verme, tekrar dinle.",
      "Doğru cevabı gitarda çal ve sesle adı birlikte tekrar et.",
      "Bildiğin bir şarkının ilk iki notasını kulaktan sapta bul.",
    ],
    ipucu: [
      "Seyrek ve uzun çalışmalar yerine kısa ve sık çalışmalar kulağı daha hızlı geliştirir.",
      "Tahmin etmek bir beceri değildir; emin değilsen tekrar dinlemek doğru yoldur.",
      "Mutlak kulak (bir notayı referanssız adlandırmak) gerekmez; müzisyenlerin çoğu **göreli kulakla**, yani seslerin birbirine uzaklığını duyarak çalışır.",
    ],
    sonraki: { metin: "Tiz/Pes ve Oktav: sesin yüksekliğini ve aynı adlı sesleri tanımak." },
    kaynaklar: [KARPINSKI, "Bruce Benward, Maureen Carr — Sight Singing Complete"],
  },
  "Tiz/Pes ve Oktav": {
    slug: "tiz-pes-oktav",
    baslik: "Tiz, Pes ve Oktav",
    ozet: "Ses yüksekliği, frekans ve iki katı frekanslı aynı adlı ses: oktav.",
    tanim: [
      "**Tiz** ses ince (yüksek frekanslı), **pes** ses kalın (düşük frekanslı) sestir. Frekans saniyedeki titreşim sayısıdır ve hertz (Hz) ile ölçülür. Akort standardında **La4 = 440 Hz**'dir.",
      "Frekansı iki katına çıkan ses bir **oktav** tizdir ve aynı nota adını taşır; kulak iki sesi çok benzer duyar. Bu yüzden notalar oktav numarasıyla da yazılır: A2, A3, A4 …",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "La notaları: her oktavda frekans iki katı",
          bas: ["Nota", "Frekans", "Gitarda bir yeri"],
          satirlar: [
            ["A2", "110 Hz", "5. tel açık"],
            ["A3", "220 Hz", "3. tel 2. perde"],
            ["A4", "440 Hz", "1. tel 5. perde"],
            ["A5", "880 Hz", "1. tel 17. perde"],
          ],
          dogrula: { tur: "frekans", nota: 0, hz: 1 },
        },
      },
      { t: "p", m: "Gitarda perdeler ilerledikçe ve ince tellere geçtikçe ses tizleşir. Ama farklı teller aynı sesi verebilir: 6. telin 5. perdesi ile 5. telin açık sesi aynı La'dır (**unison**, birli)." },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "sap",
          baslik: "Sapta La notaları, oktav numaralarıyla: aynı numara aynı ses; renkler oktavları ayırır.",
          etiket: "serbest",
          perde: [0, 17],
          noktalar: [
            { t: 6, p: 5, e: "A2" },
            { t: 5, p: 0, e: "A2" },
            { t: 5, p: 12, e: "A3", k: "kok" },
            { t: 4, p: 7, e: "A3", k: "kok" },
            { t: 3, p: 2, e: "A3", k: "kok" },
            { t: 6, p: 17, e: "A3", k: "kok" },
            { t: 3, p: 14, e: "A4" },
            { t: 2, p: 10, e: "A4" },
            { t: 1, p: 5, e: "A4" },
            { t: 1, p: 17, e: "A5", k: "vurgu" },
          ],
          genis: true,
        },
      },
    ],
    kulakla: [
      { t: "p", m: "Dört La'yı pesten tize dinle: her biri bir öncekinin oktavıdır. Sonra iki farklı teldeki aynı sesi (unison) art arda çal; fark yalnız tınıdadır." },
      {
        t: "dinle",
        ornekler: [
          { ad: "A2 – A3 – A4 – A5", tip: "dizi", notalar: ["A2", "A3", "A4", "A5"] },
          { ad: "Oktav: A2 – A3", tip: "aralik", notalar: ["A2", "A3"], beklenen: { aralik: 12 } },
          { ad: "Birli: A2 – A2", tip: "aralik", notalar: ["A2", "A2"], beklenen: { aralik: 0 } },
          { ad: "Pes ve tiz: E2 – E4", tip: "aralik", notalar: ["E2", "E4"], beklenen: { aralik: 24 } },
        ],
      },
    ],
    dene: [
      "Şekildeki her La'yı çal ve oktav numarasını söyle.",
      "6. tel 5. perde ile 5. tel açık teli birlikte çal: tam birli olmalı. Değilse akort bozuktur.",
      "İki nota çaldır; ikincisi tiz mi pes mi, gözün kapalı karar ver.",
      "Bir notayı söyle, sonra aynı notayı bir oktav pes ya da tiz söylemeyi dene.",
    ],
    ipucu: [
      "Gitar yazıldığından bir oktav pes duyulur: portede yazılan A4, gitarda A3 olarak çalar.",
      "Tiz/pes, ses şiddetiyle (yüksek/alçak sesle çalmak) karıştırılmamalı.",
      "Akort ederken önce teli biraz pes indir, sonra referansa doğru yükselterek yaklaş; tel bu yönde daha kararlı kalır.",
    ],
    sonraki: { metin: "Aralıklar: oktavın içindeki 11 uzaklığı tanımak." },
    kaynaklar: [KARPINSKI, BERKLEE],
  },
  Aralıklar: {
    slug: "kulak-araliklar",
    baslik: "Aralıkları Kulaktan Tanımak",
    ozet: "Her aralığın karakteri, karıştırılan çiftler ve akılda kalıcı ezgi başlangıçları.",
    tanim: [
      "Aralığı kulaktan tanımanın en sağlam yolu karakterini öğrenmektir: küçük ikili gergin, büyük ikili adım gibi, küçük üçlü buruk, büyük üçlü parlak, tam dörtlü açık, tritone huzursuz, tam beşli boş ve güçlü duyulur. Bildiğin ezgilerin ilk iki notası da iyi bir başlangıç çapasıdır.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Yükselen aralıklar için ezgi çapaları",
          bas: ["Aralık", "Yarım ses", "Karakter", "Ezgi başlangıcı"],
          satirlar: [
            ["Büyük ikili", "2", "adım, yürüyüş", "Frère Jacques"],
            ["Küçük üçlü", "3", "buruk, hüzünlü", "Greensleeves"],
            ["Büyük üçlü", "4", "parlak", "When the Saints Go Marching In"],
            ["Tam dörtlü", "5", "açık, çağrı", "Here Comes the Bride"],
            ["Tam beşli", "7", "boş, güçlü", "Twinkle Twinkle Little Star"],
            ["Büyük altılı", "9", "sıcak, geniş", "My Bonnie Lies Over the Ocean"],
            ["Oktav", "12", "aynı ses, tiz", "Somewhere Over the Rainbow"],
          ],
        },
      },
      { t: "p", m: "Önce **büyük mü küçük mü** (parlak mı buruk mu), sonra **sayı** (küçük adım mı büyük sıçrama mı) diye iki adımda karar ver. İnen aralıklarda da aynı karakter geçerlidir." },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "porte",
          baslik: "En çok karıştırılan çiftler: k3/B3 ve T4/A4/T5 (Do'dan).",
          porte: { donanim: 0, olcu: [2, 4], notalar: ["C4", "Eb4", "C4", "E4", "C4", "F4", "C4", "F#4", "C4", "G4"].map((n) => pn(n)) },
          etiketler: ["", "k3", "", "B3", "", "T4", "", "A4", "", "T5"],
        },
      },
      { t: "p", m: "Portedeki her çifti gitarda 5. telin 3. perdesindeki Do'dan çal. Çiftlerin arasındaki fark tek perdedir; kulağın bu tek perdeyi karakter farkı olarak duymayı öğrenir." },
    ],
    kulakla: [
      { t: "p", m: "Karıştırılan çiftleri art arda dinle; her örnek önce ezgisel, sonra armonik çalar. Armonik çalışta küçük ikili sürtünür, tam beşli kaynaşır." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Küçük ikili", tip: "aralik", notalar: ["C3", "Db3"], beklenen: { aralik: 1 } },
          { ad: "Büyük ikili", tip: "aralik", notalar: ["C3", "D3"], beklenen: { aralik: 2 } },
          { ad: "Küçük üçlü", tip: "aralik", notalar: ["C3", "Eb3"], beklenen: { aralik: 3 } },
          { ad: "Büyük üçlü", tip: "aralik", notalar: ["C3", "E3"], beklenen: { aralik: 4 } },
          { ad: "Tritone", tip: "aralik", notalar: ["C3", "F#3"], beklenen: { aralik: 6 } },
          { ad: "Tam beşli", tip: "aralik", notalar: ["C3", "G3"], beklenen: { aralik: 7 } },
        ],
      },
    ],
    dene: [
      "Tablodaki her ezgiyi mırıldan ve ilk iki notasını gitarda bul.",
      "Bir arkadaşına çiftlerden birini çaldır; önce “büyük/küçük”, sonra sayıyı söyle.",
      "Aynı aralığı farklı köklerden dinle; karakterin değişmediğini fark et.",
      "Yanlış bildiğin aralığı gitarda üç kez çal ve adını söyle.",
    ],
    ipucu: [
      "Ezgi çapaları başlangıç içindir; hedef, ezgiyi düşünmeden aralığı doğrudan tanımaktır.",
      "Tritone'u tam dörtlü ya da tam beşliyle karıştırıyorsan çözülme isteğine bak: tritone bir yere gitmek ister.",
      "İnen aralıklar için de ayrı çapalar kur: örneğin inen tam beşli (Sol → Do) bir şarkının kapanışı gibi duyulur.",
    ],
    sonraki: { metin: "Akor Türleri: üç ve dört sesin birlikte yarattığı renkler." },
    kaynaklar: [KARPINSKI, KOSTKA],
  },
  "Akor Türleri": {
    slug: "akor-turleri",
    baslik: "Akor Türlerini Kulaktan Tanımak",
    ozet: "Majör, minör, eksik, artık, sus ve yedili akorların sesi.",
    tanim: [
      "Akor türü, kökün üstündeki aralıkların birleşiminden doğan renktir. Majör akor (1–3–5) parlak, minör (1–♭3–5) hüzünlü, eksik (1–♭3–♭5) gergin ve sıkışık, artık (1–3–♯5) askıda ve gizemli duyulur. Sus akorlarında üçlü yoktur: sus2 açık, sus4 çözülmek isteyen bir ses verir.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Akor türleri ve karakterleri (kök Do)",
          bas: ["Tür", "Simge", "Notalar", "Karakter"],
          satirlar: [
            ["Majör", "C", "C E G", "parlak, kararlı"],
            ["Minör", "Cm", "C Eb G", "hüzünlü, yumuşak"],
            ["Eksik", "C°", "C Eb Gb", "gergin, sıkışık"],
            ["Artık", "C+", "C E G#", "askıda, gizemli"],
            ["Sus2", "Csus2", "C D G", "açık, nötr"],
            ["Sus4", "Csus4", "C F G", "çözülmek ister"],
            ["Dominant 7", "C7", "C E G Bb", "blues'lu, gidecek"],
            ["Majör 7", "Cmaj7", "C E G B", "yumuşak, rüya gibi"],
          ],
          dogrula: { tur: "akor", ad: 1, notalar: 2 },
        },
      },
      { t: "p", m: "Ayırt etmek için önce **üçlüye** odaklan: büyük üçlü varsa majör ailesi, küçük üçlü varsa minör ailesi. Sonra **beşliye** bak: tam beşli kararlı, eksik beşli gergin, artık beşli askıdadır." },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "akorlar",
          baslik: "Do kökünde altı tür (5. tel 3. perde).",
          akorlar: [
            { ad: "C", sekil: "x 3 2 0 1 0", parmak: "0 3 2 0 1 0", kok: "C", formul: "1 3 5" },
            { ad: "Cm", sekil: "x 3 5 5 4 3", parmak: "0 1 3 4 2 1", kok: "C", formul: "1 b3 5" },
            { ad: "C°", sekil: "x 3 4 5 4 x", parmak: "0 1 2 4 3 0", kok: "C", formul: "1 b3 b5" },
            { ad: "C+", sekil: "x 3 2 1 1 0", parmak: "0 4 3 1 2 0", kok: "C", formul: "1 3 #5" },
            { ad: "Csus2", sekil: "x 3 0 0 3 3", parmak: "0 2 0 0 3 4", kok: "C", formul: "1 2 5" },
            { ad: "Csus4", sekil: "x 3 3 0 1 1", parmak: "0 3 4 0 1 1", kok: "C", formul: "1 4 5" },
          ],
        },
      },
      { t: "p", m: "C ile Cm arasında tek nota değişir (E → E♭); Csus4'ten C'ye geçişte F, E'ye iner. Bu küçük hareketleri gitarda çalarak duymak, türleri ezberlemekten daha kalıcıdır." },
    ],
    kulakla: [
      { t: "p", m: "Aynı kökte türleri art arda dinle ve her birini tek sözcükle tanımla. Sonra sus4 → majör çözülmesini dinle." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Majör", tip: "akor", notalar: ["C3", "E3", "G3"], beklenen: { formul: "1 3 5" } },
          { ad: "Minör", tip: "akor", notalar: ["C3", "Eb3", "G3"], beklenen: { formul: "1 b3 5" } },
          { ad: "Eksik", tip: "akor", notalar: ["C3", "Eb3", "Gb3"], beklenen: { formul: "1 b3 b5" } },
          { ad: "Artık", tip: "akor", notalar: ["C3", "E3", "G#3"], beklenen: { formul: "1 3 #5" } },
          { ad: "Sus4 → majör", tip: "akorlar", akorlar: [["C3", "F3", "G3"], ["C3", "E3", "G3"]] },
        ],
      },
    ],
    dene: [
      "Şekildeki altı akoru sırayla çal ve her birine bir sıfat yaz.",
      "Gözün kapalıyken birine C ya da Cm çaldır; yalnız üçlüyü dinleyerek karar ver.",
      "Csus4 → C → Csus2 → C geçişini çal; değişen notayı izle.",
      "Bir şarkıda duyduğun bir akorun majör mü minör mü olduğunu söyle, sonra akor şemasından kontrol et.",
    ],
    ipucu: [
      "Eksik ve artık akorlar seyrek kullanılır ve çoğu zaman geçiş görevindedir; kısa duydukları için kaçırılabilirler.",
      "Akorun tınısı (kaç tel, hangi oktav) türünü değiştirmez; kulağını tınıya değil aralıklara ver.",
    ],
    sonraki: { metin: "Gam Aileleri: akorların arkasındaki dizilerin renkleri." },
    kaynaklar: [KARPINSKI, KOSTKA],
  },
  "Gam Aileleri": {
    slug: "gam-aileleri",
    baslik: "Gam Aileleri",
    ozet: "Majör ve minör aileleri, modların parlaklık sırası, pentatonik ve armonik minör.",
    tanim: [
      "Gamlar, kökten oktava uzanan nota dizileridir ve **üçlülerine** göre iki aileye ayrılır: büyük üçlülü **majör ailesi** (İyonyen, Lidyen, Miksolidyen) ve küçük üçlülü **minör ailesi** (Dorian, Eolyen, Frigyen; Lokriyen'in beşlisi de eksiktir). Her modun onu ailesinden ayıran bir **karakter notası** vardır.",
    ],
    kural: [
      {
        t: "tablo",
        genis: true,
        tablo: {
          baslik: "Do kökünde modlar, parlaktan karanlığa: her satırda bir nota yarım ses iner",
          bas: ["Mod", "Formül", "Notalar", "Karakter"],
          satirlar: [
            ["Lidyen", "1 2 3 #4 5 6 7", "C D E F# G A B", "#4: uçuşan, parlak"],
            ["İyonyen (majör)", "1 2 3 4 5 6 7", "C D E F G A B", "kararlı, parlak"],
            ["Miksolidyen", "1 2 3 4 5 6 b7", "C D E F G A Bb", "b7: blues-rock"],
            ["Dorian", "1 2 b3 4 5 6 b7", "C D Eb F G A Bb", "6: aydınlık minör"],
            ["Eolyen (doğal minör)", "1 2 b3 4 5 b6 b7", "C D Eb F G Ab Bb", "b6: hüzünlü"],
            ["Frigyen", "1 b2 b3 4 5 b6 b7", "C Db Eb F G Ab Bb", "b2: karanlık, İspanyol"],
            ["Lokriyen", "1 b2 b3 4 b5 b6 b7", "C Db Eb F Gb Ab Bb", "b5: kararsız"],
          ],
          dogrula: { tur: "gam", kok: "C", formul: 1, notalar: 2 },
        },
      },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: { tur: "adim", baslik: "La armonik minör: doğal minörün 7. derecesi yükselir; 6–7 arası artık ikili (1½ ses).", notalar: ["A", "B", "C", "D", "E", "F", "G#", "A"], adimlar: ["T", "Y", "T", "T", "Y", "A", "Y"], dereceler: ["1", "2", "b3", "4", "5", "b6", "7", "8"], vurgu: [6] },
      },
      { t: "p", m: "Pentatonik gamlar beş notalıdır: majör pentatonik 1 2 3 5 6, minör pentatonik 1 ♭3 4 5 ♭7. Blues gamı minör pentatoniğe ♭5 ekler. Armonik minör ise doğal minörden tek notayla ayrılır ve V akorunu majör yapar." },
    ],
    kulakla: [
      { t: "p", m: "Aynı kökte modları tablodaki sırayla dinle: her adımda renk biraz koyulaşır. Ayırt ederken önce üçlüye (aile), sonra karakter notasına bak." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Do Lidyen", tip: "dizi", notalar: ["C3", "D3", "E3", "F#3", "G3", "A3", "B3", "C4"], beklenen: { kalip: [0, 2, 4, 6, 7, 9, 11, 12] } },
          { ad: "Do Miksolidyen", tip: "dizi", notalar: ["C3", "D3", "E3", "F3", "G3", "A3", "Bb3", "C4"], beklenen: { kalip: [0, 2, 4, 5, 7, 9, 10, 12] } },
          { ad: "Do Dorian", tip: "dizi", notalar: ["C3", "D3", "Eb3", "F3", "G3", "A3", "Bb3", "C4"], beklenen: { kalip: [0, 2, 3, 5, 7, 9, 10, 12] } },
          { ad: "Do Frigyen", tip: "dizi", notalar: ["C3", "Db3", "Eb3", "F3", "G3", "Ab3", "Bb3", "C4"], beklenen: { kalip: [0, 1, 3, 5, 7, 8, 10, 12] } },
          { ad: "La armonik minör", tip: "dizi", notalar: ["A2", "B2", "C3", "D3", "E3", "F3", "G#3", "A3"], beklenen: { kalip: [0, 2, 3, 5, 7, 8, 11, 12] } },
        ],
      },
    ],
    dene: [
      "Tablodaki modları aynı kökten (Do) sırayla çal; değişen tek notayı her seferinde göster.",
      "Birine iki mod çaldır; önce aileyi (majör/minör), sonra karakter notasını söyle.",
      "La armonik minörü çal; G♯ → A çekimini dinle.",
      "Sevdiğin bir solonun hangi aileden olduğunu tahmin et ve gitarda dene.",
    ],
    ipucu: [
      "Modları ayırt etmek için kökü duyuran bir eşlik (tek akor ya da açık tel) gerekir; eşliksiz dizi kulağa çoğu zaman majör gelir.",
      "Parlaklık sırasını ezberlemek modları birbirine bağlar: Lidyen'den Lokriyen'e her adımda bir nota iner.",
    ],
    sonraki: { metin: "Akor İlerlemeleri: akorların zaman içindeki hareketini duymak." },
    kaynaklar: ["Mark Levine — The Jazz Theory Book", KOSTKA],
  },
  "Akor İlerlemeleri": {
    slug: "akor-ilerlemeleri",
    baslik: "Akor İlerlemelerini Duymak",
    ozet: "Roma rakamlarıyla yürüyüşler, bas hattı, gerilim ve çözülme.",
    tanim: [
      "**Akor ilerlemesi** (yürüyüş), akorların zaman içindeki sırasıdır ve tondan bağımsız olarak Roma rakamlarıyla yazılır: büyük harf majör (I, IV, V), küçük harf minör (ii, iii, vi) akordur. Do majörde I = C, IV = F, V = G, vi = Am.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Sık yürüyüşler",
          bas: ["Yürüyüş", "Do majörde", "Sol majörde"],
          satirlar: [
            ["I IV V I", "C F G C", "G C D G"],
            ["I V vi IV", "C G Am F", "G D Em C"],
            ["I vi IV V", "C Am F G", "G Em C D"],
            ["vi IV I V", "Am F C G", "Em C G D"],
            ["ii V I", "Dm G C", "Am D G"],
          ],
          dogrula: { tur: "yuruyus", romen: 0, tonlar: { 1: "C", 2: "G" } },
        },
      },
      { t: "p", m: "Ton merkezi I'dir: I'e dönüş “eve varma” hissi verir. V gerilim yaratır ve I'e çözülmek ister; IV yumuşak bir uzaklaşma, vi hüzünlü bir sapmadır. Yürüyüşü duymanın en kolay yolu **bası** (en kalın notayı) izlemektir." },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "sema",
          baslik: "I – V – vi – IV, Do majörde: her ölçü dört vuruş.",
          sema: { olcu: [4, 4], olculer: [{ akorlar: [{ ad: "C", vurus: 4 }] }, { akorlar: [{ ad: "G", vurus: 4 }] }, { akorlar: [{ ad: "Am", vurus: 4 }] }, { akorlar: [{ ad: "F", vurus: 4 }] }] },
        },
      },
      { t: "p", m: "Yürüyüşü bir tonda öğrenince başka tona taşımak kolaydır: Sol majörde aynı dereceler G – D – Em – C olur. Capo kullanırsan şekiller aynı kalır, ton değişir." },
    ],
    kulakla: [
      { t: "p", m: "Her yürüyüşte bası mırıldan ve dereceleri say. I'e döndüğün anı işaretle; V'den I'e geçişin gücünü IV'ten I'e geçişle karşılaştır." },
      {
        t: "dinle",
        ornekler: [
          { ad: "I – V – vi – IV", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["G2", "B2", "D3"], ["A2", "C3", "E3"], ["F2", "A2", "C3"]], beklenen: { ton: "C", romen: ["I", "V", "vi", "IV"] } },
          { ad: "I – vi – IV – V", tip: "akorlar", akorlar: [["C3", "E3", "G3"], ["A2", "C3", "E3"], ["F2", "A2", "C3"], ["G2", "B2", "D3"]], beklenen: { ton: "C", romen: ["I", "vi", "IV", "V"] } },
          { ad: "IV – I ve V – I", tip: "akorlar", akorlar: [["F2", "A2", "C3"], ["C3", "E3", "G3"], ["G2", "B2", "D3"], ["C3", "E3", "G3"]], beklenen: { ton: "C", romen: ["IV", "I", "V", "I"] } },
        ],
      },
    ],
    dene: [
      "Tablodaki yürüyüşleri Do majörde çal ve her akorda derecesini söyle.",
      "Aynı yürüyüşü Sol majöre aktar; sonra capo ile 2. perdede Do şekilleriyle çal.",
      "Bir şarkının ilk dört akorunu kulaktan bul: önce I'i, sonra bası izle.",
      "Birine yürüyüş çaldır; yalnız bası dinleyerek Roma rakamlarını yaz.",
    ],
    ipucu: [
      "Birçok şarkı vi'den başlar (vi – IV – I – V); kulak bunu minör tonda sanabilir. Asıl merkezi bulmak için çözülmenin nereye vardığına bak.",
      "Akorların türünü değil, bas hareketini duymak yürüyüşü çözmenin en kısa yoludur.",
      "12 ölçülük blues da bir yürüyüştür: I7 – IV7 – I7 – V7 – IV7 – I7; dominant 7 akorları burada çözülmeden tonun rengi olur.",
    ],
    sonraki: { metin: "Alıştırma Tüyoları: kulak çalışmasını verimli hâle getirmek." },
    kaynaklar: [KOSTKA, KARPINSKI],
  },
  "Alıştırma Tipleri": {
    slug: "alistirma-tipleri",
    baslik: "Kulak Alıştırması Tipleri",
    ozet: "Yoldaki soru tipleri, her birinin nasıl çalışılacağı ve verimli günlük düzen.",
    tanim: [
      "Kulak eğitimi yolundaki adımlar birkaç **soru tipinden** oluşur. Her tip ayrı bir dinleme becerisini çalıştırır, ama hepsinde aynı yöntem işler: dinle, içinden **söyle**, cevapla, gitarda **doğrula**. Kısa ve düzenli çalışma (günde 10 dakika) seyrek ve uzun oturumlardan daha etkilidir.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Alıştırma tipleri",
          bas: ["Tip", "Soru", "Nasıl çalışılır"],
          satirlar: [
            ["Tiz / pes", "İkinci ses daha tiz mi, pes mi?", "Sesleri mırıldan, yönü elinle göster"],
            ["Referanslı ses", "Duyduğun ses gitarda nerede?", "Açık teli referans al, perde perde say"],
            ["Aralık", "İki ses arası hangi aralık?", "Önce büyük/küçük, sonra sayı"],
            ["Akor türü", "Majör, minör, eksik, artık …", "Önce üçlüyü, sonra beşliyi dinle"],
            ["Gam", "Hangi gam ya da mod?", "Kökü tut, karakter notasını ara"],
            ["İlerleme", "Akorların dereceleri", "Bası izle, I'e dönüşü bul"],
            ["Geri çalma (Ek)", "Ezgiyi ya da kökü gitarda çal", "İlk notayı bul, aralıklarla ilerle"],
          ],
        },
      },
      { t: "gorsel", g: { tur: "akis", baslik: "Her soru tipinde aynı akış.", adimlar: ["Dinle", "İçinden söyle", "Cevapla", "Açıklamayı oku", "Gitarda çal"] } },
    ],
    gitarda: [
      { t: "p", m: "Yanlış cevapladığın her sorudan sonra iki sesi (ya da akoru) gitarda çal: önce senin cevabını, sonra doğrusunu. İki sesi yan yana duymak farkı kalıcı kılar ve kulak ile klavye bilgisini birlikte geliştirir." },
      { t: "p", m: "Zor bulduğun çifti (ör. tam dörtlü – tam beşli) ayrı bir mini çalışmaya dönüştür: beş dakika yalnız o ikisini çal ve dinle." },
    ],
    kulakla: [
      { t: "p", m: "Referans sesle başla: La'yı dinle, söyle, sonra 5. teli açık çalıp karşılaştır. Ardından bir aralığı dinle ve cevaplamadan önce iki sesi de mırıldan." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Referans: La (A2)", tip: "dizi", notalar: ["A2"] },
          { ad: "Söyle: Do – Sol", tip: "aralik", notalar: ["C3", "G3"], beklenen: { aralik: 7 } },
          { ad: "Karşılaştır: T4 – T5", tip: "dizi", notalar: ["C3", "F3", "C3", "G3"] },
        ],
      },
    ],
    dene: [
      "Bir hafta boyunca her gün iki tip seç, 10 dakika çalış ve doğruluk oranını not et.",
      "Her soruda cevaplamadan önce sesi mırıldan; söyleyemiyorsan yeniden dinle.",
      "Yanlış cevapları bir listeye yaz; ertesi gün ilk iş o çiftleri çalış.",
      "Haftada bir, tanıdığın bir şarkının nakaratını kulaktan çıkar.",
    ],
    ipucu: [
      "Tahminle doğru cevap vermek ilerleme değildir; emin değilsen tekrar dinlemek doğru yoldur.",
      "Yorgun kulak yanılır: aynı soruyu art arda üç kez kaçırırsan ara ver.",
      "Doğruluk %90'ı geçince zorluğu artır (inen aralıklar, farklı kökler, daha hızlı yürüyüşler).",
    ],
    sonraki: { metin: "Kulak eğitimi yolunun adımlarına geç: her bölümün sonunda bir kontrol var." },
    kaynaklar: [KARPINSKI, "Bruce Benward, Maureen Carr — Sight Singing Complete"],
  },
};

const OKUMA: Record<string, Ders> = {
  "Porte ve Sol Anahtarı": {
    slug: "porte-sol-anahtari",
    baslik: "Porte ve Sol Anahtarı",
    ozet: "Beş çizgi, dört aralık, sol anahtarı, ek çizgiler, arızalar ve donanım.",
    tanim: [
      "**Porte** (dizek) beş çizgi ve dört aralıktan oluşur; notalar çizgilerin ya da aralıkların üstüne yazılır ve yukarı çıktıkça tizleşir. **Sol anahtarı** ikinci çizgiyi Sol yapar: alttan çizgiler **Mi – Sol – Si – Re – Fa**, aralıklar **Fa – La – Do – Mi**'dir.",
    ],
    kural: [
      {
        t: "gorsel",
        g: {
          tur: "porte",
          baslik: "Çizgiler (Mi Sol Si Re Fa) ve aralıklar (Fa La Do Mi).",
          porte: { donanim: 0, olcu: [4, 4], notalar: ["E4", "G4", "B4", "D5", "F5", "F4", "A4", "C5", "E5"].map((n) => pn(n, 4)) },
          etiketler: ["Mi", "Sol", "Si", "Re", "Fa", "Fa", "La", "Do", "Mi"],
          genis: true,
        },
      },
      { t: "p", m: "Porteden taşan notalar kısa **ek çizgilere** yazılır. Diyez (♯) yarım ses yükseltir, bemol (♭) alçaltır, natürel (♮) arızayı kaldırır. Bir arıza **ölçü sonuna kadar** aynı yerdeki bütün notalara geçerlidir; ölçü çizgisi onu siler." },
      {
        t: "gorsel",
        g: {
          tur: "porte",
          baslik: "Ek çizgiler ve arızalar: aynı ölçüdeki natürel, diyezi ya da bemolü kaldırır.",
          porte: { donanim: 0, olcu: [4, 4], notalar: ["A3", "C4", "F#4", "Fn4", "Bb4", "Bn4", "A5", "C6"].map((n) => pn(n)) },
          etiketler: ["La", "Do", "Fa♯", "Fa", "Si♭", "Si", "La", "Do"],
        },
      },
    ],
    gitarda: [
      { t: "p", m: "Anahtarın yanındaki **donanım**, parça boyunca hangi notaların diyezli ya da bemollü çalınacağını söyler. Diyezler her zaman **Fa Do Sol Re La Mi Si**, bemoller **Si Mi La Re Sol Do Fa** sırasıyla eklenir. Beşliler çemberinde her adım donanıma bir diyez ekler (ya da bir bemol çıkarır)." },
      { t: "gorsel", g: { tur: "cember", baslik: "Beşliler çemberi: dış halka majör tonlar, iç halka paralel minörler, en dışta donanım." } },
    ],
    kulakla: [
      { t: "p", m: "Çizgi ve aralık notalarını sırayla dinle; yukarı çıktıkça tizleştiğini izle. Sonra Fa♯ ile Fa'yı art arda dinle: natürel sesi yarım ses indirir." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Çizgiler: Mi Sol Si Re Fa", tip: "dizi", notalar: ["E3", "G3", "B3", "D4", "F4"] },
          { ad: "Aralıklar: Fa La Do Mi", tip: "dizi", notalar: ["F3", "A3", "C4", "E4"] },
          { ad: "Fa♯ → Fa (natürel)", tip: "aralik", notalar: ["F#3", "F3"], beklenen: { aralik: -1 } },
        ],
      },
    ],
    dene: [
      "Çizgileri ve aralıkları yüksek sesle say: “Mi Sol Si Re Fa”, “Fa La Do Mi”.",
      "Bir nota seç ve onun portedeki yerini parmağınla göster; sonra gitarda çal.",
      "Donanımında iki diyez olan bir parçada hangi notaların değiştiğini yaz (Fa♯, Do♯).",
      "Beşliler çemberinde Re majörden üç adım saat yönünde ilerle: hangi ton, kaç diyez?",
    ],
    ipucu: [
      "Arıza yalnız yazıldığı oktav için geçerlidir; başka bir oktavdaki aynı ada geçmez.",
      "Donanımı okumadan başlamak en sık hatadır: ilk iş her zaman anahtarın yanına bak.",
    ],
    sonraki: { metin: "Gitarda Porte: yazılan notanın sapta nereye düştüğü." },
    kaynaklar: [GOULD, BERKLEE],
  },
  "Gitarda Porte": {
    slug: "gitarda-porte",
    baslik: "Gitarda Porte",
    ozet: "Gitarın bir oktav pes duyulması, açık tellerin yazılışı ve pozisyon okuma.",
    tanim: [
      "Gitar müziği sol anahtarıyla yazılır, ama anahtarın altındaki küçük **8** rakamı gitarın yazıldığından **bir oktav pes duyulduğunu** söyler. Böylece gitarın geniş ses alanı çok fazla ek çizgi kullanmadan porteye sığar.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Açık teller: portede yazılış ve duyulan ses",
          bas: ["Tel", "Yazılış", "Duyulan", "Portede yeri"],
          satirlar: [
            ["6", "E3", "E2", "3. ek çizginin altı"],
            ["5", "A3", "A2", "2. ek çizgi (alt)"],
            ["4", "D4", "D3", "alt çizginin altı"],
            ["3", "G4", "G3", "2. çizgi"],
            ["2", "B4", "B3", "3. (orta) çizgi"],
            ["1", "E5", "E4", "4. aralık"],
          ],
          dogrula: { tur: "tel", tel: 0, nota: 2, yazili: 1 },
        },
      },
      { t: "p", m: "Portenin alt çizgisindeki Mi (E4 yazılır) gitarda **4. telin 2. perdesidir**. Açık pozisyonda (boş teller ve 1–4. perdeler) her nota çoğunlukla tek yerde bulunur; istisna olarak Si hem boş 2. tel hem 3. telin 4. perdesidir." },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "porte",
          baslik: "Açık pozisyonda doğal notalar, kalın Mi'den Fa'ya (altta tel/perde).",
          porte: { donanim: 0, olcu: [4, 4], notalar: ["E3", "F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5"].map((n) => pn(n)) },
          konumlar: [
            { t: 6, p: 0 },
            { t: 6, p: 1 },
            { t: 6, p: 3 },
            { t: 5, p: 0 },
            { t: 5, p: 2 },
            { t: 5, p: 3 },
            { t: 4, p: 0 },
            { t: 4, p: 2 },
            { t: 4, p: 3 },
            { t: 3, p: 0 },
            { t: 3, p: 2 },
            { t: 2, p: 0 },
            { t: 2, p: 1 },
            { t: 2, p: 3 },
            { t: 1, p: 0 },
            { t: 1, p: 1 },
          ],
          genis: true,
        },
      },
      { t: "p", m: "Pozisyon okumada sol el dört perdelik bir bölgede kalır, her parmak bir perdeye bakar: 5. pozisyon 5–8, 7. pozisyon 7–10. perdeleri kapsar. Aynı nota farklı pozisyonlarda farklı telde çalınır; parçanın başında önerilen pozisyon yazılıysa ona uy." },
    ],
    kulakla: [
      { t: "p", m: "Porteyi okurken çal ve duyduğun sesi yazılı notayla eşleştir. Yazılı E4'ün sesinin aslında E3 olduğunu, piyanodaki aynı yazıdan bir oktav pes olduğunu unutma." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Açık pozisyon: Mi'den Fa'ya", tip: "dizi", notalar: ["E2", "F2", "G2", "A2", "B2", "C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4"] },
          { ad: "Alt çizgideki Mi = 4. tel 2. perde", tip: "dizi", notalar: ["E3"] },
        ],
      },
    ],
    dene: [
      "Şekildeki notaları yavaşça oku ve çal; her notada tel/perde numarasını söyle.",
      "Portenin alt çizgisinden (E) başlayarak çizgileri gitarda bul: E G B D F.",
      "Aynı notaları 5. pozisyonda çal: hangi notalar başka tele geçti?",
      "Kısa bir ezgiyi portede yaz, sonra yalnız porteden çal.",
    ],
    ipucu: [
      "Önce donanıma, sonra çizgi mi aralık mı olduğuna bak; bildiğin bir referans notadan (Sol çizgisi, orta Si, ek çizgideki Do) say.",
      "Ek çizgileri saymak yerine şekillerini tanı: üç ek çizginin altı her zaman kalın Mi'dir.",
    ],
    sonraki: { metin: "Ritim Sayımı: notaların ne zaman ve ne kadar çalınacağı." },
    kaynaklar: [LEAVITT, GOULD],
  },
  "Ritim Sayımı": {
    slug: "ritim-sayimi",
    baslik: "Ritim Sayımı",
    ozet: "Vuruş, sekizlik ve onaltılık heceleri, noktalı ritimler ve senkopu sayarak okumak.",
    tanim: [
      "Ritmi okumanın yolu her vuruşu **hece** ile saymaktır. Vuruşlar sayıyla (“1 2 3 4”), sekizlikler “ve” ile (“1 ve 2 ve”), onaltılıklar “e ve a” ile (“1 e ve a”) söylenir. Notanın başladığı heceyi yüksek sesle söyle, uzayan ve susulan heceleri içinden say.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Hücreler ve sayımları (bir vuruş)",
          bas: ["Hücre", "Sayım", "Hissi"],
          satirlar: [
            ["Dörtlük", "1", "düz"],
            ["İki sekizlik", "1 ve", "eşit ikiye"],
            ["Dört onaltılık", "1 e ve a", "eşit dörde"],
            ["Sekizlik + iki onaltılık", "1 ve a", "uzun–kısa–kısa"],
            ["Noktalı sekizlik + onaltılık", "1 … a", "uzun–kısa"],
            ["Onaltılık + noktalı sekizlik", "1 e …", "kısa–uzun"],
            ["Sekizlik üçleme", "1 ta ki", "üçe eşit"],
          ],
        },
      },
      { t: "p", m: "**Senkop**, vurgunun vuruş arasına kaymasıdır. Sekizlik – dörtlük – sekizlik kalıbında dörtlük “ve”de başlar ve sonraki vuruşun üstünden geçer: “1 ve (2) ve”. Parantezdeki vuruş sayılır ama çalınmaz." },
    ],
    gitarda: [
      { t: "gorsel", g: { tur: "ritim", baslik: "Bir ölçüde dört farklı bölünme.", desen: [["q", "ee", "ssss", "e-ss"]], sayim: "1 | 2 ve | 3 e ve a | 4 ve a" } },
      { t: "gorsel", g: { tur: "ritim", baslik: "Noktalı ritimler ve senkop.", desen: [["de-s", "s-de", "syn"]], sayim: "1 … a | 2 e … | 3 ve (4) ve" } },
      { t: "p", m: "Gitarda sağ el sayımı taşır: onaltılıklarda el her hecede bir kez iner ya da kalkar (aşağı “1”, yukarı “e”, aşağı “ve”, yukarı “a”). Çalınmayan hecelerde de el hareketini sürdür." },
    ],
    kulakla: [
      { t: "p", m: "Ritimleri dinlerken sayımı fısılda; her atakta hangi heceye denk geldiğini söyle. Önce yavaş tempoda, sonra hızlandırarak tekrar et." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Dört bölünme (70 BPM)", tip: "ritim", bpm: 70, desen: [["q", "ee", "ssss", "e-ss"]] },
          { ad: "Noktalı ve senkop (70 BPM)", tip: "ritim", bpm: 70, desen: [["de-s", "s-de", "syn"]] },
        ],
      },
    ],
    dene: [
      "Şekildeki iki ölçüyü elle vurarak ve sayarak oku; 60 BPM ile başla.",
      "Aynı ritimleri boğuk tellerde aşağı–yukarı vuruşla çal.",
      "Noktalı sekizlik + onaltılık ile onaltılık + noktalı sekizliği art arda çal: uzun–kısa / kısa–uzun.",
      "Bir şarkının ritmini dinle ve ilk ölçüsünü hecelerle yaz.",
    ],
    ipucu: [
      "Sayımı içinden değil **sesli** yap: ağız ve el birlikte çalıştığında hata hemen ortaya çıkar.",
      "Senkopta en sık hata, parantezdeki vuruşta yeniden çalmaktır; uzayan notayı kesme.",
      "Üçlemeyi “1 ta ki” yerine “1 – 2 – 3” diye de sayabilirsin; önemli olan vuruşun üç **eşit** parçaya bölünmesidir.",
    ],
    sonraki: { metin: "Akor Şeması: yalnız akorların ve vuruşların yazıldığı okuma." },
    kaynaklar: ["Louis Bellson, Gil Breines — Modern Reading Text in 4/4", "Ted Reed — Progressive Steps to Syncopation for the Modern Drummer"],
  },
  "Akor Şeması": {
    slug: "akor-semasi",
    baslik: "Akor Şeması",
    ozet: "Slash notasyonu, vuruş başına akor, slash akorlar ve bas yürüyüşleri.",
    tanim: [
      "**Akor şeması** (chart), şarkının yalnız akorlarını ve sürelerini gösterir; ezgi ya da tab yazılmaz. Her eğik çizgi (/) **bir vuruştur**. Akor adı başladığı vuruşun üstüne yazılır ve yeni bir akor gelene kadar sürer; çalış biçimi (tarama, arpej) çalana bırakılır.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Şema işaretleri",
          bas: ["İşaret", "Anlamı"],
          satirlar: [
            ["/", "Bir vuruş: önceki akor sürer"],
            ["C F (bir ölçüde)", "Akorlar ölçüyü paylaşır (ör. 2 + 2 vuruş)"],
            ["C/E", "Slash akor: Do majör, basta Mi"],
            ["N.C.", "Akor yok (no chord): sus ya da yalnız ezgi"],
            ["%", "Önceki ölçüyü tekrar et"],
          ],
        },
      },
      { t: "p", m: "**Slash akor**, bastaki notayı söyler: C/E, basta Mi olan Do akorudur; Am/G basta Sol olan La minördür. Slash akorlar çoğu zaman adım adım inen ya da çıkan bir **bas yürüyüşü** kurar." },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "sema",
          baslik: "İnen bas yürüyüşü (C – B – A – G) ve paylaşılan ölçüler.",
          sema: {
            olcu: [4, 4],
            olculer: [
              { akorlar: [{ ad: "C", vurus: 4 }] },
              { akorlar: [{ ad: "C/B", vurus: 4 }] },
              { akorlar: [{ ad: "Am", vurus: 4 }] },
              { akorlar: [{ ad: "Am/G", vurus: 4 }] },
              { akorlar: [{ ad: "F", vurus: 2 }, { ad: "G", vurus: 2 }] },
              { akorlar: [{ ad: "C", vurus: 2 }, { ad: "Am", vurus: 1 }, { ad: "G", vurus: 1 }] },
              { akorlar: [{ ad: "F", vurus: 4 }] },
              { akorlar: [{ ad: "C", vurus: 4 }] },
            ],
          },
        },
      },
      { t: "p", m: "Slash akoru çalmanın en kolay yolu, normal akor şeklini tutup basta yazılan notayı çalmaktır: C/B için 5. telde 2. perde (Si), Am/G için 6. telde 3. perde (Sol). 6. ölçüde C iki vuruş, Am ve G birer vuruş sürer." },
    ],
    kulakla: [
      { t: "p", m: "Bas yürüyüşünü dinle: akorların üst sesleri değişmezken bas adım adım iner. Akor değiştiği anı vuruş sayarak takip et." },
      {
        t: "dinle",
        ornekler: [
          {
            ad: "C – C/B – Am – Am/G – F – G",
            tip: "akorlar",
            akorlar: [
              ["C3", "E3", "G3"],
              ["B2", "E3", "G3", "C4"],
              ["A2", "C3", "E3"],
              ["G2", "C3", "E3", "A3"],
              ["F2", "A2", "C3"],
              ["G2", "B2", "D3"],
            ],
          },
        ],
      },
    ],
    dene: [
      "Şemayı dörtlük tarama ile çal; her eğik çizgide bir aşağı vuruş.",
      "Yalnız bas notalarını çal (C B A G F G C): yürüyüşü duy.",
      "6. ölçüdeki 2 + 1 + 1 vuruşlu geçişi metronomla temiz çıkar.",
      "Bildiğin bir şarkıyı akor şeması olarak dört ölçülük satırlarla yaz.",
    ],
    ipucu: [
      "Akor adını gördüğün vuruşta değiştir, önce değil: el geç kalıyorsa bir önceki vuruşun sonunda hazırlan.",
      "C/E ile C/G gibi çevrimler aynı akordur; yalnız bas değişir.",
      "Şemada ritim yazılmadıysa tarzın alışılmış vuruşunu kullan; slash'lerin üstünde ritim işareti varsa (ör. senkop) grup hep birlikte o ritmi çalar.",
    ],
    sonraki: { metin: "Tekrar ve Yönlendirme: şemanın hangi sırayla çalınacağı." },
    kaynaklar: [GOULD, BERKLEE],
  },
  "Tekrar ve Yönlendirme": {
    slug: "tekrar-yonlendirme",
    baslik: "Tekrar ve Yönlendirme",
    ozet: "Tekrar işaretleri, 1./2. son (volta), D.S. al Fine, D.S. al Coda ve çalınış sırası.",
    tanim: [
      "Yönlendirme işaretleri aynı müziği tekrar yazmadan **çalınış sırasını** belirler. **|:** ile **:|** arasındaki ölçüler iki kez çalınır. Tekrarın sonunda farklı bitişler varsa **1. son** ilk geçişte, **2. son** tekrarda çalınır (1. son tekrarda atlanır).",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Yönlendirme işaretleri",
          bas: ["İşaret", "Anlamı"],
          satirlar: [
            ["|:  :|", "Aradaki ölçüleri tekrar et"],
            ["1.  2.", "1. son ilk geçişte, 2. son tekrarda"],
            ["Segno", "D.S. ile dönülecek yer (eğik S işareti)"],
            ["D.S. al Fine", "Segno'ya dön, Fine'da bitir"],
            ["D.S. al Coda", "Segno'ya dön, To Coda'dan Coda'ya atla"],
            ["Coda", "Parçanın son bölümü (artılı daire)"],
            ["D.C.", "Baştan (da capo)"],
          ],
        },
      },
      { t: "p", m: "Genel kural: **D.S.** ya da **D.C.** ile dönüldüğünde tekrar işaretleri yeniden alınmaz; doğrudan 2. son çalınır. Farklı istenirse şemada “con rep.” gibi bir not yazılır." },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "sema",
          baslik: "Tekrar, volta, segno ve coda içeren bir şema.",
          not: "Çalınış: 1 2 3 · 1 2 4 · 5 6 7 · 5 6 · 8",
          sira: [1, 2, 3, 1, 2, 4, 5, 6, 7, 5, 6, 8],
          sema: {
            olcu: [4, 4],
            olculer: [
              { bas: true, akorlar: [{ ad: "C", vurus: 4 }] },
              { akorlar: [{ ad: "G", vurus: 4 }] },
              { volta: 1, son: true, akorlar: [{ ad: "Am", vurus: 2 }, { ad: "F", vurus: 2 }] },
              { volta: 2, akorlar: [{ ad: "F", vurus: 2 }, { ad: "G", vurus: 2 }] },
              { segno: true, akorlar: [{ ad: "C", vurus: 4 }] },
              { yon: "To Coda", akorlar: [{ ad: "F", vurus: 4 }] },
              { yon: "D.S. al Coda", akorlar: [{ ad: "G", vurus: 4 }] },
              { coda: true, akorlar: [{ ad: "C", vurus: 4 }] },
            ],
          },
        },
      },
      { t: "p", m: "Yolu parmağınla izle: 3. ölçüden başa dön, ikinci geçişte 1. sonu atlayıp 4. ölçüye geç. 7. ölçüdeki D.S. al Coda seni segno'ya (5) götürür; 6. ölçüdeki To Coda'dan Coda'ya (8) atlarsın." },
    ],
    kulakla: [
      { t: "p", m: "Çalınış sırasını akorlarla dinle ve ölçü numaralarını say. Coda'ya atladığın an, şarkının sonuna geldiğini kulağın da hisseder." },
      {
        t: "dinle",
        ornekler: [
          {
            ad: "Şemanın çalınışı (akorlar)",
            tip: "akorlar",
            akorlar: [
              ["C3", "E3", "G3"],
              ["G2", "B2", "D3"],
              ["A2", "C3", "E3"],
              ["C3", "E3", "G3"],
              ["G2", "B2", "D3"],
              ["G2", "B2", "D3"],
              ["C3", "E3", "G3"],
              ["F2", "A2", "C3"],
              ["G2", "B2", "D3"],
              ["C3", "E3", "G3"],
              ["F2", "A2", "C3"],
              ["C3", "E3", "G3"],
            ],
          },
        ],
      },
    ],
    dene: [
      "Şemanın çalınış sırasını ölçü numaralarıyla yaz, sonra şekil yazısıyla karşılaştır.",
      "Şemayı metronomla çal; her yönlendirmede durmadan geç.",
      "Aynı şemayı D.S. al Fine ile düşün: Fine 6. ölçüde olsaydı sıra ne olurdu?",
    ],
    ipucu: [
      "Çalmadan önce işaretleri tara: segno, To Coda ve Coda'yı bul, yolu kafanda çiz.",
      "D.S. ile D.C.'yi karıştırma: D.S. segno'ya, D.C. parçanın başına döner.",
    ],
    sonraki: { metin: "Okuma yolunun adımlarına geç: şemalar ve porteler üzerinde sorular." },
    kaynaklar: [GOULD, "Gardner Read — Music Notation"],
  },
};

const RITIM: Record<string, Ders> = {
  "Vuruş ve Tempo": {
    slug: "vurus-tempo",
    baslik: "Vuruş ve Tempo",
    ozet: "Müziğin nabzı, BPM ile tempo, metronomla güvenli hızlanma.",
    tanim: [
      "**Vuruş** (beat), müziğin içinde ayağınla tuttuğun sabit nabızdır. **Tempo** bu nabzın hızıdır ve dakikadaki vuruş sayısıyla (**BPM**) ölçülür. 60 BPM saniyede bir vuruş, 120 BPM saniyede iki vuruştur: bir vuruşun süresi **60 ÷ BPM** saniyedir.",
    ],
    kural: [
      { t: "gorsel", g: { tur: "tempo", baslik: "Aynı dört saniyede 60, 90 ve 120 BPM: vuruşlar sıklaşır.", not: "Büyük nokta: her dördüncü vuruşun başı.", bpm: [60, 90, 120], saniye: 4 } },
      {
        t: "tablo",
        tablo: {
          baslik: "BPM ve vuruş süresi",
          bas: ["BPM", "Vuruş (sn)", "Tempo terimi (yaklaşık)"],
          satirlar: [
            ["50", "1,2", "Largo (geniş, ağır)"],
            ["60", "1,0", "Adagio (yavaş)"],
            ["80", "0,75", "Andante (yürür gibi)"],
            ["100", "0,6", "Moderato (orta)"],
            ["120", "0,5", "Allegro (hızlı)"],
            ["150", "0,4", "Vivace / Presto (çok hızlı)"],
          ],
          not: "terimlerin BPM aralığı kaynağa göre değişir",
          dogrula: { tur: "bpm", bpm: 0, saniye: 1 },
        },
      },
    ],
    gitarda: [
      { t: "p", m: "Metronomu aç ve her tıkla birlikte “1, 2, 3, 4” say, ayağınla vur. Sonra tek bir notayı her tıkta çal; notan tıkın **üstüne** düşmeli, önce ya da sonra değil. Ritim çalışmasında önce nabzı sağlamlaştır, sonra hızı artır." },
      { t: "p", m: "Hızlanmak için tempoyu **4–5 BPM'lik** adımlarla artır. Üç kez hatasız çalamadığın tempoya geçme; zorlanınca 10 BPM geri dön ve oradan tekrar çık. Kaydettiğin en yüksek temiz tempo senin bugünkü tempondur." },
    ],
    kulakla: [
      { t: "p", m: "Üç tempoyu dinle ve ayağınla eşlik et. Ölçü başı (1) daha tiz tıkla duyulur; saymayı ona göre sıfırla." },
      {
        t: "dinle",
        ornekler: [
          { ad: "60 BPM", tip: "metronom", bpm: 60, desen: [["q", "q", "q", "q"]] },
          { ad: "90 BPM", tip: "metronom", bpm: 90, desen: [["q", "q", "q", "q"]] },
          { ad: "120 BPM", tip: "metronom", bpm: 120, desen: [["q", "q", "q", "q"]] },
        ],
      },
    ],
    dene: [
      "Metronomu 60 BPM'e kur; dört ölçü boyunca sayarak ayakla vur.",
      "Aynı tempoda açık 6. teli her tıkta çal; tık sesini notanın içinde kaybet.",
      "Metronomu yalnız 2. ve 4. vuruşta duyacak şekilde ayarla (ya da öyle düşün) ve 1–3'ü kendin tut.",
      "Bir alıştırmayı 60'tan başlatıp 4 BPM adımlarla hatasız gidebildiğin en yüksek tempoya çıkar.",
    ],
    ipucu: [
      "En sık hata farkında olmadan hızlanmaktır; özellikle kolay bölümlerde acele edilir.",
      "Metronom bir rakip değil, aynadır: tıkı duymuyorsan çok yüksek ya da çok tam çalıyorsundur; kaydedip dinle.",
      "Tempo ile ritim aynı şey değildir: aynı ritim farklı tempolarda çalınabilir; tempo yalnız nabzın hızını değiştirir.",
    ],
    sonraki: { metin: "Nota Süreleri: vuruşu bölmek ve uzatmak." },
    kaynaklar: ["Louis Bellson, Gil Breines — Modern Reading Text in 4/4", GOULD],
  },
  "Nota Süreleri": {
    slug: "nota-sureleri",
    baslik: "Nota Süreleri",
    ozet: "Birlikten onaltılığa değerler, sus, nokta, bağ ve üçleme.",
    tanim: [
      "Nota değerleri vuruşa göre ölçülür. 4/4'te **dörtlük** bir vuruş, **ikilik** iki, **birlik** dört vuruştur. Dörtlüğü ikiye bölersen iki **sekizlik** (“1 ve”), dörde bölersen dört **onaltılık** (“1 e ve a”) elde edersin. Her değerin aynı süreli bir **sus** işareti vardır; sus da sayılır, yalnız çalınmaz.",
    ],
    kural: [
      { t: "gorsel", g: { tur: "agac", baslik: "Değerler ağacı: her satır bir üsttekinin yarısı; sağda eşit süreli sus." } },
      {
        t: "tablo",
        tablo: {
          baslik: "Noktalı değerler",
          bas: ["Değer", "Vuruş"],
          satirlar: [
            ["Noktalı ikilik", "3"],
            ["Noktalı dörtlük", "3/2"],
            ["Noktalı sekizlik", "3/4"],
            ["Dörtlük üçleme", "2/3"],
            ["Sekizlik üçleme", "1/3"],
          ],
          dogrula: { tur: "sure", ad: 0, vurus: 1 },
        },
      },
      { t: "p", m: "**Nokta** notayı kendi süresinin yarısı kadar uzatır: noktalı sekizlik = sekizlik + onaltılık. **Bağ** (iki notayı birleştiren yay) süreleri toplar ve ikinci notaya yeniden vurulmaz. **Üçleme**, bir değeri ikiye değil üçe eşit böler; üstünde “3” yazar." },
    ],
    gitarda: [
      { t: "gorsel", g: { tur: "ritim", baslik: "İkilik, dörtlük, noktalı sekizlik + onaltılık, üçleme.", desen: [["h", "q", "q"], ["de-s", "de-s", "t", "q"]], sayim: "1 (2) 3 4 | 1 … a 2 … a 3 ta ki 4" } },
      { t: "gorsel", g: { tur: "ritim", baslik: "Suslar da sayılır.", desen: [["q", "qr", "e-r", "r-e"]], sayim: "1 (2) 3 (ve) (4) ve" } },
    ],
    kulakla: [
      { t: "p", m: "Önce düz değerleri, sonra noktalı ve susu dinle. Uzun notada sayımı sürdür; susta el hareketini durdurma." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Değerler (70 BPM)", tip: "ritim", bpm: 70, desen: [["h", "q", "q"], ["de-s", "de-s", "t", "q"]] },
          { ad: "Suslar (80 BPM)", tip: "ritim", bpm: 80, desen: [["q", "qr", "e-r", "r-e"]] },
        ],
      },
    ],
    dene: [
      "Şekildeki ölçüleri elle vurarak ve sayarak oku.",
      "Bir notayı noktalı dörtlük + sekizlik olarak çal (“1 … ve 2”); sonra aynı süreyi bağlı dörtlük + sekizlikle yaz.",
      "Bir ölçü sekizlik, bir ölçü üçleme çal; vuruşun yerini kaçırma.",
      "Susları sesli say: “bir, (iki), üç ve, (dört) ve”.",
    ],
    ipucu: [
      "Noktalı ritimleri “düzleştirmek” (iki eşit sekizlik gibi çalmak) çok sık yapılan hatadır; onaltılığı geç ve kısa tut.",
      "Bağlı notaya yeniden vurma; bağ yalnız süreyi uzatır.",
      "Bağ ile legato yayını karıştırma: bağ **aynı yükseklikteki** iki notayı birleştirir; farklı notaları bağlayan yay legato (bağlı çalış) işaretidir.",
      "Ölçünün her vuruşu bir yerde başlamalıdır: yazarken süreleri toplayarak ölçünün dolduğunu kontrol et.",
    ],
    sonraki: { metin: "Ölçü ve Tartım: vuruşları gruplamak ve vurgulamak." },
    kaynaklar: [GOULD, "Louis Bellson, Gil Breines — Modern Reading Text in 4/4"],
  },
  "Ölçü ve Tartım": {
    slug: "olcu-tartim",
    baslik: "Ölçü ve Tartım",
    ozet: "Ölçü işaretleri, güçlü ve zayıf vuruşlar, basit ve bileşik ölçüler, aksak ölçü.",
    tanim: [
      "**Ölçü işaretinin** üstteki sayısı bir ölçüdeki vuruş sayısını, alttaki sayısı vuruşu hangi değerin aldığını gösterir: 4/4'te ölçüde dört dörtlük, 3/4'te üç dörtlük, 6/8'de altı sekizlik vardır. Ölçü çizgileri sayımı düzenler; her ölçünün ilk vuruşu (“1”) genellikle en güçlüsüdür.",
    ],
    kural: [
      {
        t: "gorsel",
        g: {
          tur: "vurgu",
          baslik: "Vuruşların ağırlığı: uzun sütun güçlü, kısa sütun zayıf.",
          satirlar: [
            { ad: "2/4", vuruslar: [3, 1] },
            { ad: "3/4", vuruslar: [3, 1, 1] },
            { ad: "4/4", vuruslar: [3, 1, 2, 1] },
            { ad: "6/8", vuruslar: [3, 1, 1, 2, 1, 1] },
            { ad: "9/8", vuruslar: [3, 1, 2, 1, 2, 1, 2, 1, 1], sayim: ["1", "2", "1", "2", "1", "2", "1", "2", "3"] },
          ],
        },
      },
      {
        t: "tablo",
        tablo: {
          baslik: "Sık kullanılan ölçüler",
          bas: ["Ölçü", "Tür", "Hissedilen vuruş", "Örnek"],
          satirlar: [
            ["2/4", "basit ikili", "2 dörtlük", "marş, polka"],
            ["3/4", "basit üçlü", "3 dörtlük", "vals"],
            ["4/4", "basit dörtlü", "4 dörtlük", "rock, pop"],
            ["6/8", "bileşik ikili", "2 noktalı dörtlük", "balad, jig"],
            ["9/8", "aksak (2+2+2+3)", "4 eşit olmayan vuruş", "karşılama, Roman havası"],
          ],
        },
      },
    ],
    gitarda: [
      { t: "gorsel", g: { tur: "ritim", baslik: "3/4'te iki ölçü: ilk vuruşa vurgu.", olcu: [3, 4], desen: [["h", "q"], ["q", "ee", "ee"]], sayim: "1 (2) 3 | 1 2 ve 3 ve" } },
      { t: "p", m: "Basit ölçülerde vuruş ikiye bölünür (sekizlik), bileşik ölçülerde üçe (6/8'de iki büyük vuruş, her biri üç sekizlik). Aksak ölçülerde vuruşlar eşit değildir: 9/8 karşılamada 2+2+2+3 gruplanır, son vuruş uzundur. Çalarken ölçü başında bas notayı ya da aşağı vuruşu vurgula." },
    ],
    kulakla: [
      { t: "p", m: "Üç ölçüyü metronomla dinle; ölçü başı tiz tıkla duyulur. Sayımı sıfırladığın yerin hep “1” olduğunu fark et." },
      {
        t: "dinle",
        ornekler: [
          { ad: "2/4 (100 BPM)", tip: "metronom", bpm: 100, olcu: [2, 4], desen: [["q", "q"], ["q", "q"]] },
          { ad: "3/4 (100 BPM)", tip: "metronom", bpm: 100, olcu: [3, 4], desen: [["q", "q", "q"], ["q", "q", "q"]] },
          { ad: "3/4 ritim", tip: "ritim", bpm: 90, olcu: [3, 4], desen: [["h", "q"], ["q", "ee", "ee"]] },
        ],
      },
    ],
    dene: [
      "Bir vals dinle ve “1 2 3” sayarak ölçü başını bul.",
      "Açık 6. teli 3/4'te çal: 1'de aşağı vuruşu vurgula, 2 ve 3'ü hafif çal.",
      "6/8'i “1 2 3 4 5 6” sayarak çal; 1 ve 4'ü vurgula.",
      "9/8'i “1 2 1 2 1 2 1 2 3” sayarak el çırp; son grubun uzunluğunu hisset.",
    ],
    ipucu: [
      "6/8 ile 3/4 aynı sayıda sekizlik içerir ama farklı gruplanır: 6/8 = 2 × 3, 3/4 = 3 × 2.",
      "Kaybolursan ölçünün ortasında durma; bir sonraki “1”e yetiş.",
      "Ölçü işaretinin alt sayısı vuruşun süresi değil **birimidir**: 3/8'de vuruş birimi sekizlik, 3/2'de ikiliktir.",
    ],
    sonraki: { metin: "Vurgular ve Senkop: güçlü vuruşların dışına taşan vurgular." },
    kaynaklar: [GOULD, BERKLEE],
  },
  "Vurgular ve Senkop": {
    slug: "vurgular-senkop",
    baslik: "Vurgular ve Senkop",
    ozet: "Güçlü ve zayıf vuruşlar, backbeat, vuruş arası (offbeat) ve senkop.",
    tanim: [
      "4/4'te 1. ve 3. vuruşlar **güçlü**, 2. ve 4. vuruşlar **zayıf** sayılır. Rock ve pop'ta trampet zayıf vuruşlara (2 ve 4) vurur; buna **backbeat** denir ve bu müziklerin itici gücüdür. **Senkop**, vurgunun beklenmeyen bir yere, çoğunlukla vuruş arasına (“ve”) kaymasıdır.",
      "Senkop, dinleyicinin beklediği güçlü vuruşu boş bırakıp vurguyu ondan önceye taşır; bu yüzden funk, reggae, latin ve caz gibi “sallanan” müziklerin temel aracıdır.",
    ],
    kural: [
      {
        t: "gorsel",
        g: {
          tur: "vurgu",
          baslik: "4/4'te doğal ağırlık, backbeat ve sekizliklerde vuruş arası.",
          satirlar: [
            { ad: "4/4", vuruslar: [3, 1, 2, 1] },
            { ad: "Backbeat", vuruslar: [2, 3, 2, 3] },
            { ad: "Offbeat", vuruslar: [1, 3, 1, 3, 1, 3, 1, 3], sayim: ["1", "ve", "2", "ve", "3", "ve", "4", "ve"] },
          ],
        },
      },
      { t: "p", m: "Sekizlik – dörtlük – sekizlik kalıbında dörtlük nota 1'in “ve”sinde başlar ve 2. vuruşun üstünden uzar; **2. vuruşta yeni atak yoktur**. Bu kayma ritme ileri doğru bir itiş verir." },
    ],
    gitarda: [
      { t: "gorsel", g: { tur: "ritim", baslik: "Senkop: 2. vuruşun üstünden uzayan dörtlük.", desen: [["q", "syn", "q"]], sayim: "1 | 2 ve (3) ve | 4" } },
      { t: "gorsel", g: { tur: "ritim", baslik: "Yalnız vuruş araları (offbeat).", desen: [["r-e", "r-e", "r-e", "r-e"]], sayim: "(1) ve (2) ve (3) ve (4) ve" } },
      { t: "p", m: "Offbeat notalarını çalarken sayımı yüksek sesle söyle: “1 VE 2 VE”. Sağ elin aşağı–yukarı hareketini durdurma; yalnız çalmayacağın yerlerde teli vurma. Offbeat'ler böylece hep yukarı vuruşa düşer." },
    ],
    kulakla: [
      { t: "p", m: "Önce düz dörtlükleri, sonra senkoplu ölçüyü dinle: ikincide 3. vuruşta atak duymazsın. Offbeat örneğinde tıklar vuruşta, notalar aradadır." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Düz dörtlük", tip: "ritim", bpm: 80, desen: [["q", "q", "q", "q"]] },
          { ad: "Senkop", tip: "ritim", bpm: 80, desen: [["q", "syn", "q"]] },
          { ad: "Offbeat", tip: "ritim", bpm: 80, desen: [["r-e", "r-e", "r-e", "r-e"]] },
        ],
      },
    ],
    dene: [
      "Metronomu 2. ve 4. vuruş sayıp backbeat'i elle çırp.",
      "Senkoplu ölçüyü boğuk tellerde çal; elin 3. vuruşta havada aşağı inmeli ama teli vurmamalı.",
      "Offbeat ölçüsünü yalnız yukarı vuruşlarla çal; aşağı vuruşları havada yap.",
      "Bir funk ya da reggae şarkısında offbeat akorlarını bul ve eşlik et.",
    ],
    ipucu: [
      "Senkopta en sık hata, uzayan notanın üstüne yeni vuruş eklemektir; ses sürmeli.",
      "Offbeat'leri erken çalma eğilimi vardır; vuruşu ayağınla tut, notayı tam ortaya koy.",
      "Vurgu işareti (>) notanın daha güçlü çalınacağını gösterir; senkop vurgusu çoğu zaman yazılmaz, ritmin kendisinden doğar.",
    ],
    sonraki: { metin: "Tab Üzerinde Süreler: bu ritimleri tablatürde okumak." },
    kaynaklar: ["Ted Reed — Progressive Steps to Syncopation for the Modern Drummer", GOULD],
  },
  "Tab Üzerinde Süreler": {
    slug: "tab-sureler",
    baslik: "Tab Üzerinde Süreler",
    ozet: "Tablatürün altındaki ritim işaretleri: sap, kiriş, bayrak ve porteyle karşılaştırma.",
    tanim: [
      "Tablatür hangi tel ve perdeye basılacağını gösterir; **ne kadar süreceğini** ise tabın altındaki (ya da üstündeki) **ritim işaretleri** söyler. Bu işaretler portedeki nota saplarının aynısıdır, yalnız nota başları yerine perde rakamlarına bağlanır.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Tab altındaki ritim işaretleri",
          bas: ["İşaret", "Süre"],
          satirlar: [
            ["Tek sap", "Dörtlük (1 vuruş)"],
            ["Tek kiriş ya da bayrak", "Sekizlik (½)"],
            ["Çift kiriş ya da bayrak", "Onaltılık (¼)"],
            ["Kısa sap / sapsız rakam", "İkilik ya da birlik (uzun nota)"],
            ["Saptan sonra nokta", "Süre yarısı kadar uzar"],
            ["Altında “3”", "Üçleme"],
          ],
        },
      },
      { t: "p", m: "Kirişler aynı vuruş içindeki notaları birbirine bağlar: kiriş grubunun bittiği yer vuruşun bittiği yerdir. Bu sayede bir ölçüde vuruşların nerede başladığını tek bakışta görürsün." },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "tab",
          baslik: "Tab ve süreleri: dörtlük, sekizlik, onaltılık; ikinci ölçüde Em akoru.",
          etiket: "nota",
          ritim: true,
          olcu: [4, 4],
          genis: true,
          kolonlar: [
            { n: [{ t: 6, p: 0 }], d: 1, e: "E" },
            { n: [{ t: 6, p: 3 }], d: 0.5, e: "G" },
            { n: [{ t: 5, p: 0 }], d: 0.5, e: "A" },
            { n: [{ t: 5, p: 2 }], d: 0.25, e: "B" },
            { n: [{ t: 4, p: 0 }], d: 0.25, e: "D" },
            { n: [{ t: 4, p: 2 }], d: 0.25, e: "E" },
            { n: [{ t: 4, p: 0 }], d: 0.25, e: "D" },
            { n: [{ t: 5, p: 2 }], d: 1, e: "B" },
            { n: [{ t: 6, p: 0 }], d: 1, e: "E" },
            { n: [{ t: 6, p: 3 }], d: 1, e: "G" },
            { n: [{ t: 5, p: 0 }], d: 0.5, e: "A" },
            { n: [{ t: 5, p: 2 }], d: 0.5, e: "B" },
            { n: EM, d: 1, e: "Em" },
          ],
        },
      },
      { t: "gorsel", g: { tur: "ritim", baslik: "Aynı ritim, tek çizgili porte üzerinde.", desen: [["q", "ee", "ssss", "q"], ["q", "q", "ee", "q"]], sayim: "1 | 2 ve | 3 e ve a | 4 | 1 | 2 | 3 ve | 4" } },
    ],
    kulakla: [
      { t: "p", m: "Önce yalnız ritmi dinle ve sayımı söyle; sonra tabı izleyerek aynı ritmi gitarda çal. Uygulamadaki tab oynatıcısında ritim satırı tabın üstünde gösterilir; yavaş tempoda dinleyip sayarak okumayı alıştır." },
      { t: "dinle", ornekler: [{ ad: "Tabın ritmi (70 BPM)", tip: "ritim", bpm: 70, desen: [["q", "ee", "ssss", "q"], ["q", "q", "ee", "q"]] }] },
    ],
    dene: [
      "Tabı önce yalnız ritim olarak elle vur, sonra notalarla çal.",
      "Kiriş gruplarını say: her grup bir vuruş mu? Ölçüde dört vuruşu bul.",
      "Aynı notaları farklı sürelerle çal (hepsi sekizlik) ve farkı dinle.",
      "Sevdiğin bir riff'in tabına bak; ritim satırı yoksa kulaktan süreleri yaz.",
    ],
    ipucu: [
      "Ritim satırı olmayan tabı kulaktan doğrulamadan çalma; yanlış süreler riff'i tanınmaz yapar.",
      "Sapsız rakam her zaman “uzun” demek değildir; bazı tablar hiç süre göstermez. Ölçü çizgilerine ve dinlemeye güven.",
      "Tabda süre çizgileri ile porte saplarını aynı anda gösteren düzende (tab + porte) ritmi porteden, konumu tabdan oku.",
    ],
    sonraki: { metin: "Ritim yolunun adımlarına geç: dinle, vur, oku." },
    kaynaklar: ["Will Schmid, Greg Koch — Hal Leonard Guitar Method", GOULD],
  },
};

export const MODUL_DERS: Record<string, Record<string, Ders>> = { ritim: RITIM, klavye: KLAVYE, kulak: KULAK, okuma: OKUMA };
