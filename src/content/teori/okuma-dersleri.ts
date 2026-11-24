// Nota Okuma kitabının yeni dersleri (Teori › Nota Okuma): noktalı ve bağlı notalar, üçlemeler, arızalar ve donanım,
// pozisyonlarda okuma ve ileri okuma işaretleri. Konu sırası ve alıştırmalar: mufredat.ts › OKUMA_KONULARI.
// Porte notaları, sapta konumlar, süreler ve donanımlar scripts/teori-dogrula.mjs ile denetlenir.
import type { Ders } from "./tipler.ts";
import { gamNoktalari, pn } from "./yardim.ts";

const GOULD = "Elaine Gould — Behind Bars";
const LEAVITT = "William Leavitt — A Modern Method for Guitar (Berklee)";
const BERKLEE = "Paul Schmeling — Berklee Music Theory";
const BELLSON = "Louis Bellson, Gil Breines — Modern Reading Text in 4/4";

export const OKUMA_DERSLERI: Ders[] = [
  {
    slug: "noktali-bagli",
    baslik: "Noktalı ve Bağlı Notalar",
    seviye: 2,
    ozet: "Nota başının yanındaki nokta, çift nokta ve iki notayı birleştiren bağ.",
    tanim: [
      "**Nokta**, notayı kendi süresinin **yarısı kadar** uzatır: noktalı dörtlük = dörtlük + sekizlik = 1½ vuruş. **Çift nokta** bir çeyrek daha ekler. **Bağ**, aynı yükseklikteki iki notayı birleştiren yaydır: süreler toplanır, ikinci notaya yeniden vurulmaz.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Noktalı değerler (vuruş = dörtlük)",
          bas: ["Değer", "Vuruş", "Eşdeğeri"],
          satirlar: [
            ["Noktalı birlik", "6", "birlik + ikilik"],
            ["Noktalı ikilik", "3", "ikilik + dörtlük"],
            ["Noktalı dörtlük", "3/2", "dörtlük + sekizlik"],
            ["Noktalı sekizlik", "3/4", "sekizlik + onaltılık"],
            ["Çift noktalı ikilik", "7/2", "ikilik + dörtlük + sekizlik"],
            ["Çift noktalı dörtlük", "7/4", "dörtlük + sekizlik + onaltılık"],
          ],
          dogrula: { tur: "sure", ad: 0, vurus: 1 },
        },
      },
      {
        t: "liste",
        m: [
          "Bağ **ölçü çizgisinin üstünden** geçebilir: 4. vuruştaki dörtlük, sonraki ölçünün ilk sekizliğine bağlanır.",
          "Yazımda ölçünün ortası (4/4'te 3. vuruş) görünmelidir: 2. vuruştan başlayan iki vuruşluk nota **dörtlük + bağlı dörtlük** yazılır.",
          "**Bağ** aynı yükseklikteki notaları, **legato yayı** farklı notaları birleştirir.",
        ],
      },
    ],
    gitarda: [
      { t: "gorsel", g: { tur: "ritim", baslik: "Noktalı sekizlik + onaltılık: uzun – kısa. Sayım “1 … a, 2 … a”.", desen: [["de-s", "de-s", "q", "q"], ["s-de", "ee", "de-s", "q"]], sayim: "1 a 2 a 3 4 | 1 e 2 ve 3 a 4" } },
      { t: "gorsel", g: { tur: "ritim", baslik: "Karşılaştırma: düz sekizlikler ve noktalı ritim.", desen: [["ee", "ee", "ee", "ee"], ["de-s", "de-s", "de-s", "de-s"]], sayim: "1 ve 2 ve 3 ve 4 ve | 1 a 2 a 3 a 4 a" } },
    ],
    kulakla: [
      { t: "p", m: "Önce düz sekizlikleri, sonra noktalı ritmi dinle. Noktalı ritimde ikinci nota geç ve kısa gelir; “düzleşmemesine” dikkat et." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Düz sekizlik (70 BPM)", tip: "ritim", bpm: 70, desen: [["ee", "ee", "ee", "ee"]] },
          { ad: "Noktalı sekizlik (70 BPM)", tip: "ritim", bpm: 70, desen: [["de-s", "de-s", "de-s", "de-s"]] },
          { ad: "Karışık (70 BPM)", tip: "ritim", bpm: 70, desen: [["s-de", "ee", "de-s", "q"]] },
        ],
      },
    ],
    dene: [
      "Şekildeki iki ölçüyü önce elle vur, sonra açık La telinde çal.",
      "Onaltılıkları sesli say (“1 e ve a”) ve noktalı sekizlikte yalnız “1” ile “a”da vur.",
      "Bir ölçüde dörtlük + bağlı sekizlik ve noktalı dörtlük yazımını karşılaştır: aynı süre, aynı ses.",
      "4. vuruştan sonraki ölçünün 1. vuruşuna bağlı bir nota çal; 1'de vurmadan sayımı sürdür.",
    ],
    ipucu: [
      "Noktalı ritmi üçleme gibi çalmak (shuffle) farklı bir ritimdir: noktalı sekizlikte kısa nota vuruşun son dörtte biridir, üçlemede son üçte biri.",
      "Bağlı notada pena el hareketini sürdür ama tele vurma; zaman böyle korunur.",
    ],
    sonraki: { metin: "Üçlemeler: vuruşu üçe bölmek." },
    kaynaklar: [GOULD, BELLSON],
  },
  {
    slug: "ucleme",
    baslik: "Üçlemeler",
    seviye: 2,
    ozet: "İki eşit değerin yerine üç: sekizlik, dörtlük ve onaltılık üçleme; shuffle ve 12/8.",
    tanim: [
      "**Üçleme**, iki eşit değerin süresine **üç eşit nota** sığdırır; üstünde ya da altında **3** yazar. En sık görülen **sekizlik üçlemedir**: bir vuruş üçe bölünür ve “1 ta ki, 2 ta ki” diye sayılır.",
    ],
    kural: [
      {
        t: "tablo",
        tablo: {
          baslik: "Üçleme türleri",
          bas: ["Üçleme", "Grubun süresi", "Her nota", "Sayım"],
          satirlar: [
            ["Sekizlik üçleme", "1", "1/3", "1 ta ki"],
            ["Dörtlük üçleme", "2", "2/3", "1 · 1 ki · 2 ta"],
            ["Onaltılık üçleme", "1/2", "1/6", "1 ta ki ve ta ki"],
          ],
          dogrula: { tur: "sure", ad: 0, vurus: 2 },
        },
      },
      {
        t: "liste",
        m: [
          "Üçlemenin içinde **sus** ya da **uzun nota** olabilir: sekizlik + dörtlük (“1 … ki”) shuffle'ın temelidir.",
          "**Shuffle / swing**: iki sekizlik yazılır, üçlemenin 1. ve 3. notası gibi çalınır. Parçanın başında “♪♪ = ♩♪³” işareti görülür.",
          "**12/8** ölçüsünde her vuruş zaten üçe bölünür; dört vuruşluk shuffle'ın üçlemesiz yazımıdır.",
        ],
      },
    ],
    gitarda: [
      { t: "gorsel", g: { tur: "ritim", baslik: "Sekizlik üçlemeler ve shuffle kalıbı (üçleme: sekizlik + dörtlük).", desen: [["t", "t", "t", "t"], ["t-q", "t-q", "t-q", "t-q"]], sayim: "1 ta ki 2 ta ki 3 ta ki 4 ta ki | 1 ki 2 ki 3 ki 4 ki" } },
      { t: "gorsel", g: { tur: "ritim", baslik: "Üçleme, düz sekizlik ve sus bir arada.", desen: [["q", "t", "ee", "t-r-t"]], sayim: "1 2 ta ki 3 ve 4 (ta) ki" } },
    ],
    kulakla: [
      { t: "p", m: "Sekizlik ile üçlemeyi art arda dinle: üçlemede vuruş daha “yuvarlak” duyulur. Sonra shuffle'ı dinle ve ayağınla vuruşları, ağzınla “ki”leri söyle." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Sekizlik ve üçleme (70 BPM)", tip: "ritim", bpm: 70, desen: [["ee", "ee", "t", "t"]] },
          { ad: "Shuffle (80 BPM)", tip: "ritim", bpm: 80, desen: [["t-q", "t-q", "t-q", "t-q"]] },
          { ad: "Karışık (70 BPM)", tip: "ritim", bpm: 70, desen: [["q", "t", "ee", "t-r-t"]] },
        ],
      },
    ],
    dene: [
      "Metronom 60'ta: bir ölçü sekizlik, bir ölçü üçleme çal; vuruşun yerini kaybetme.",
      "Açık Mi telinde 12 ölçü blues ritmini shuffle ile çal (E5 – E6 değişimiyle).",
      "“1 ta ki” sayarken yalnız “1” ve “ki”de vur: shuffle'ı sayarak bul.",
      "Bir ölçüde iki dörtlük üçleme çal: üç nota iki vuruşa yayılır.",
    ],
    ipucu: [
      "Üçlemeyi hızlandırılmış sekizlik gibi çalma: üç nota eşit uzunlukta olmalı, sonuncusu vuruşa yapışmamalı.",
      "Onaltılık üçleme (altılama) hızlı lick'lerde görülür; önce sekizlik üçlemeyi sağlamlaştır.",
    ],
    sonraki: { metin: "Arızalar ve Donanım: diyez, bemol ve natürel." },
    kaynaklar: [GOULD, BELLSON],
  },
  {
    slug: "arizalar-donanim",
    baslik: "Arızalar ve Donanım",
    seviye: 2,
    ozet: "Diyez, bemol, natürel ve çift arızalar; ölçü kuralı, donanım sırası ve donanımdan tonu bulmak.",
    tanim: [
      "**Arıza**, notanın yüksekliğini değiştiren işarettir: **diyez (♯)** yarım ses yükseltir, **bemol (♭)** yarım ses alçaltır, **natürel (♮)** arızayı kaldırır. **Çift diyez (𝄪)** ve **çift bemol (𝄫)** iki yarım ses değiştirir. Anahtarın yanına yazılan arızalar **donanımdır**: parça boyunca geçerlidir.",
    ],
    kural: [
      {
        t: "liste",
        m: [
          "Arıza **ölçü sonuna kadar** ve yalnız yazıldığı **oktavda** geçerlidir; uyarı için parantezli **ihtiyati arıza** yazılır.",
          "Diyezler **Fa Do Sol Re La Mi Si**, bemoller **Si Mi La Re Sol Do Fa** sırasıyla eklenir.",
          "Kısa yol: son diyezin **yarım ses üstü** majör tonun adıdır; bemolde **sondan bir önceki bemol** (Fa majör tek bemollü).",
        ],
      },
      {
        t: "tablo",
        tablo: {
          baslik: "Donanım ve tonlar",
          bas: ["Majör", "Paralel minör", "Donanım"],
          satirlar: [
            ["C", "Am", "—"],
            ["G", "Em", "1 diyez"],
            ["D", "Bm", "2 diyez"],
            ["A", "F#m", "3 diyez"],
            ["E", "C#m", "4 diyez"],
            ["F", "Dm", "1 bemol"],
            ["Bb", "Gm", "2 bemol"],
            ["Eb", "Cm", "3 bemol"],
            ["Ab", "Fm", "4 bemol"],
          ],
          dogrula: { tur: "paralel", major: 0, minor: 1 },
        },
      },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: {
          tur: "porte",
          baslik: "Re majör donanımı (Fa♯, Do♯): gam, hiç arıza yazılmadan.",
          porte: { donanim: 2, olcu: [4, 4], notalar: ["D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5"].map((n) => pn(n)) },
          etiketler: ["Re", "Mi", "Fa♯", "Sol", "La", "Si", "Do♯", "Re"],
          konumlar: [{ t: 4, p: 0 }, { t: 4, p: 2 }, { t: 4, p: 4 }, { t: 3, p: 0 }, { t: 3, p: 2 }, { t: 2, p: 0 }, { t: 2, p: 2 }, { t: 2, p: 3 }],
          genis: true,
        },
      },
      {
        t: "gorsel",
        g: {
          tur: "porte",
          baslik: "Ölçü kuralı: 1. ölçüdeki diyez ikinci Fa'ya da geçer; natürel kaldırır, yeni ölçüde arıza yok.",
          porte: { donanim: 0, olcu: [4, 4], notalar: [pn("F#4"), pn("G4"), pn("F4"), pn("Fn4"), pn("F4"), pn("A4"), pn("G4"), pn("F4")] },
          etiketler: ["Fa♯", "Sol", "Fa♯", "Fa", "Fa", "La", "Sol", "Fa"],
        },
      },
    ],
    kulakla: [
      { t: "p", m: "Re majör gamını dinle: Fa♯ ve Do♯ donanımdan gelir. Sonra Fa♯ – Fa (natürel) farkını dinle." },
      {
        t: "dinle",
        ornekler: [
          { ad: "Re majör (donanım: 2 diyez)", tip: "dizi", notalar: ["D3", "E3", "F#3", "G3", "A3", "B3", "C#4", "D4"], beklenen: { kalip: [0, 2, 4, 5, 7, 9, 11, 12] } },
          { ad: "Fa♯ → Fa (natürel)", tip: "aralik", notalar: ["F#3", "F3"], beklenen: { aralik: -1 } },
        ],
      },
    ],
    dene: [
      "Re majör portesini konumlarıyla çal: Fa♯ 4. telin 4. perdesi, Do♯ 2. telin 2. perdesi.",
      "İkinci şekildeki iki ölçüyü oku; her Fa'nın diyezli mi doğal mı çalınacağını önce söyle, sonra çal.",
      "Donanımında 3 diyez olan bir parçanın majör ve minör tonunu bul (La majör, Fa♯ minör).",
      "Bir parça açmadan önce üç şeye bak: anahtar, donanım, ölçü işareti.",
    ],
    ipucu: [
      "Donanım bir tonun adını verir ama majör mü minör mü olduğunu söylemez: son akor ya da bas notası söyler.",
      "Gitarda enarmonik iki ad aynı perdedir (F♯ = G♭); hangisinin yazılacağını ton belirler.",
    ],
    sonraki: { metin: "Gitarda Porte: yazılan notanın sapta nereye düştüğü." },
    kaynaklar: [GOULD, BERKLEE, LEAVITT],
  },
  {
    slug: "pozisyonlar",
    baslik: "Pozisyonlarda Okuma",
    seviye: 3,
    ozet: "Pozisyon kavramı, “bir parmak bir perde” kuralı, 5. ve 7. pozisyon ve aynı notanın farklı yerleri.",
    tanim: [
      "**Pozisyon**, sol elin 1. parmağının durduğu perdedir. 5. pozisyonda 1. parmak 5., 4. parmak 8. perdededir (**bir parmak, bir perde**). Önce pozisyonu seç; sonra her nota tek bir yere düşer, el kaymaz.",
    ],
    kural: [
      {
        t: "liste",
        m: [
          "Pozisyon Roma rakamıyla yazılır: **V** = 5. pozisyon. Tel numarası daire içinde gösterilir: ②.",
          "Pozisyonun dışındaki nota için 1. ya da 4. parmak bir perde **uzanır** (gerdirme); el yerinde kalır.",
        ],
      },
      {
        t: "gorsel",
        g: {
          tur: "porte",
          baslik: "Aynı yazılı Mi ve Sol, üç yerde: açık pozisyon, V. pozisyon, daha yukarısı (altta tel/perde).",
          porte: { donanim: 0, olcu: [3, 4], notalar: [pn("E4"), pn("E4"), pn("E4"), pn("G4"), pn("G4"), pn("G4")] },
          etiketler: ["Mi", "Mi", "Mi", "Sol", "Sol", "Sol"],
          konumlar: [{ t: 4, p: 2 }, { t: 5, p: 7 }, { t: 6, p: 12 }, { t: 3, p: 0 }, { t: 4, p: 5 }, { t: 5, p: 10 }],
        },
      },
    ],
    gitarda: [
      {
        t: "gorsel",
        g: { tur: "sap", baslik: "5. pozisyon (5–8. perdeler): doğal notalar, 1. parmaktan 4. parmağa.", etiket: "nota", kok: "C", perde: [5, 8], kalip: [0, 2, 4, 5, 7, 9, 11], tam: true, noktalar: gamNoktalari({ kok: "C", formul: "1 2 3 4 5 6 7", perde: [5, 8], etiket: "nota" }) },
      },
      {
        t: "gorsel",
        g: { tur: "sap", baslik: "7. pozisyon (7–10. perdeler): Sol majörün notaları (Fa♯ ile).", etiket: "nota", kok: "G", perde: [7, 10], kalip: [0, 2, 4, 5, 7, 9, 11], tam: true, noktalar: gamNoktalari({ kok: "G", formul: "1 2 3 4 5 6 7", perde: [7, 10], etiket: "nota" }) },
      },
      {
        t: "gorsel",
        g: {
          tur: "porte",
          baslik: "5. pozisyonda Do majör: yazılı Do5'ten Do6'ya (3. telden 1. tele).",
          porte: { donanim: 0, olcu: [4, 4], notalar: ["C5", "D5", "E5", "F5", "G5", "A5", "B5", "C6"].map((n) => pn(n)) },
          etiketler: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do"],
          konumlar: [{ t: 3, p: 5 }, { t: 3, p: 7 }, { t: 2, p: 5 }, { t: 2, p: 6 }, { t: 2, p: 8 }, { t: 1, p: 5 }, { t: 1, p: 7 }, { t: 1, p: 8 }],
        },
      },
    ],
    kulakla: [
      { t: "p", m: "Aynı Mi'yi üç yerde çal: yükseklik aynı, renk farklı; kalın telde daha koyu." },
      { t: "dinle", ornekler: [{ ad: "5. pozisyonda Do majör", tip: "dizi", notalar: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"], beklenen: { kalip: [0, 2, 4, 5, 7, 9, 11, 12] } }] },
    ],
    dene: [
      "Elini 5. pozisyona koy ve sapın şeklindeki notaları 6. telden 1. tele söyleyerek çal.",
      "Porteyi 5. pozisyonda oku: Fa 2. telin 6. perdesi (2. parmak), Do 1. telin 8. perdesi (4. parmak).",
      "7. pozisyonda Sol majör çal ve Fa♯'leri işaretle: 5. tel 9. perde ve 2. tel 7. perde.",
    ],
    ipucu: [
      "Okurken gözü portede tut, sapa bakma: pozisyon sabitse parmaklar yeri bilir.",
      "Ezgi pozisyondan taşıyorsa önce elin kayacağı notayı işaretle.",
    ],
    sonraki: { metin: "Ritim Sayımı: onaltılıkları ve senkopu sayarak okumak." },
    kaynaklar: [LEAVITT, "William Leavitt — Reading Studies for Guitar"],
  },
  {
    slug: "ileri-okuma",
    baslik: "İleri Okuma: Çoklu Ses, Süsleme ve İşaretler",
    seviye: 4,
    ozet: "İki ses katmanı, artikülasyon ve dinamik, süslemeler, gitara özgü işaretler ve tab ile porteyi birlikte okumak.",
    tanim: [
      "İleri seviyede porte yalnız nota ve süre değil, **nasıl çalınacağını** da söyler: hangi ses katmanı (ezgi mi, bas mı), ne kadar güçlü, kısa mı uzun mu, hangi süsle, hangi telde. Bu işaretler çoğunlukla nota başının üstüne ya da altına yazılır.",
    ],
    kural: [
      {
        t: "liste",
        m: [
          "**Çoklu ses:** aynı portede iki katman yazılabilir. Sapı **yukarı** olan notalar 1. ses (ezgi), **aşağı** olanlar 2. ses (bas) dır; her katmanın ölçüsü ayrı dolar.",
          "Bir katman susarken onun **sus işareti** yukarıda ya da aşağıda ayrıca yazılır.",
          "Fingerstyle'da bas genellikle başparmakla (p), ezgi öbür parmaklarla çalınır.",
        ],
      },
      {
        t: "tablo",
        tablo: {
          baslik: "Artikülasyon ve dinamik",
          bas: ["İşaret", "Anlamı"],
          satirlar: [
            ["Staccato (nokta)", "kısa ve kopuk"],
            ["Aksan (>)", "çevresinden vurgulu"],
            ["Tenuto (çizgi)", "tam süre, hafif ağırlık"],
            ["Marcato (^)", "keskin, güçlü vurgu"],
            ["Fermata", "yazılı süreden uzun tut"],
            ["pp · p · mp", "çok hafif · hafif · orta hafif"],
            ["mf · f · ff", "orta güçlü · güçlü · çok güçlü"],
            ["cresc. · dim.", "giderek güçlen · giderek azal"],
          ],
        },
      },
    ],
    gitarda: [
      {
        t: "tablo",
        tablo: {
          baslik: "Süslemeler",
          bas: ["Süs", "Yazılışı", "Çalınışı"],
          satirlar: [
            ["Apoyatür", "küçük nota", "vuruşta, süresini asıl notadan alır"],
            ["Çarpma", "üstü çizili küçük nota", "asıl notadan hemen önce, çok kısa"],
            ["Üst mordan", "kısa dalga", "nota – üst komşu – nota"],
            ["Mordan", "çizgili kısa dalga", "nota – alt komşu – nota"],
            ["Tril", "tr", "üst komşuyla hızlı gidip gelme"],
            ["Grupetto", "yatık S", "üst – nota – alt – nota"],
          ],
        },
      },
      {
          t: "tablo",
          tablo: {
            baslik: "Porte ve tabdaki gitar işaretleri",
            bas: ["İşaret", "Anlamı"],
            satirlar: [
              ["H · P", "hammer-on · pull-off (penasız)"],
              ["sl. ya da /", "slide: tel üzerinde kayarak geç"],
              ["B · full · ½", "bend: tam ses · yarım ses yükselt"],
              ["P.M.", "palm mute: avuçla boğ"],
              ["let ring", "notaları susturmadan çınlat"],
              ["Harm. · N.H.", "doğal armonik: basmadan değ"],
              ["Dalgalı çizgi", "vibrato"],
              ["② · V", "tel numarası · pozisyon (V = 5. perde)"],
              ["8va ---", "çizgi boyunca bir oktav tiz"],
              ["p i m a", "sağ el: başparmak, işaret, orta, yüzük"],
            ],
          },
        },
    ],
    kulakla: [
      { t: "p", m: "Gitarda süsler çoğu zaman **hammer-on** ve **pull-off** ile çalınır: çarpma, kısa bir hammer-on'dur; tril, art arda hızlı hammer-on ve pull-off'tur." },
      { t: "dinle", ornekler: [{ ad: "Tril benzeri: Mi – Fa♯ – Mi – Fa♯ – Mi", tip: "dizi", notalar: ["E3", "F#3", "E3", "F#3", "E3"] }] },
    ],
    ekYapraklar: [
      {
        kisimlar: [
          {
            baslik: "Gitara özgü işaretler tabda",
            bloklar: [
              {
                t: "gorsel",
                g: {
                  tur: "tab",
                  baslik: "Tab altında teknik işaretleri: hammer-on, pull-off, slide ve bend.",
                  etiket: "nota",
                  kolonlar: [
                    { n: [{ t: 3, p: 5 }], e: "C" },
                    { n: [{ t: 3, p: 7 }], teknik: "h", e: "D" },
                    { n: [{ t: 3, p: 5 }], teknik: "p", e: "C" },
                    { n: [{ t: 2, p: 5 }], e: "E" },
                    { n: [{ t: 2, p: 8 }], teknik: "/", e: "G" },
                    { n: [{ t: 2, p: 8 }], teknik: "b", e: "G" },
                    { n: [{ t: 1, p: 5 }], e: "A" },
                  ],
                  genis: true,
                },
              },
            ],
          },
          {
            baslik: "Tab ile porteyi birlikte okumak",
            bloklar: [
              {
                t: "liste",
                m: [
                  "Çoğu gitar kitabı **porte + tab** verir: ritmi ve dinamiği porteden, tel ve perdeyi tabdan oku.",
                  "Tabda süre yoksa portedeki sapı, kirişi ve noktayı takip et; ritmi sayarak çal.",
                  "Porte bir oktav **tiz** yazılır (sol anahtarının altındaki 8): yazılı Do4 sapta 5. telin 3. perdesidir.",
                  "Okumayı ilerletmek için her gün **yeni** bir sayfa oku: kısa, yavaş, durmadan. Hata yapınca durma, sonraki vuruşa yetiş.",
                ],
              },
              {
                t: "gorsel",
                g: {
                  tur: "porte",
                  baslik: "Okuma alıştırması: La minör pentatonik, 5. pozisyon (tab konumlarıyla).",
                  porte: { donanim: 0, olcu: [4, 4], notalar: ["A3", "C4", "D4", "E4", "G4", "A4", "C5", "A4"].map((n) => pn(n)) },
                  etiketler: ["La", "Do", "Re", "Mi", "Sol", "La", "Do", "La"],
                  konumlar: [{ t: 6, p: 5 }, { t: 6, p: 8 }, { t: 5, p: 5 }, { t: 5, p: 7 }, { t: 4, p: 5 }, { t: 4, p: 7 }, { t: 3, p: 5 }, { t: 4, p: 7 }],
                  genis: true,
                },
              },
            ],
          },
        ],
      },
    ],
    dene: [
      "Şekildeki tab cümlesini çal: H ve P'de penayla vurma, slide'da parmağı kaldırma.",
      "Bir notayı önce staccato, sonra tenuto, sonra aksanlı çal; farkı kaydet ve dinle.",
      "Bir ezgide çarpmayı (küçük nota) hammer-on ile çal: çok kısa, neredeyse aynı anda.",
      "Son porteyi önce tabsız oku, sonra konumlarla doğrula.",
    ],
    ipucu: [
      "İşaretleri ilk okumada atlama: dinamik ve artikülasyon müziğin yarısıdır.",
      "Bend'in hedefini kulakla doğrula: tam ses bend, iki perde üstteki notayla aynı yükseklikte olmalıdır.",
      "8va işareti kalkınca normal yüksekliğe dön; “loco” bu dönüşü hatırlatır.",
    ],
    sonraki: { metin: "Nota Okuma kitabının sonu. Okuma yolunun son bölümüyle tekrar et." },
    kaynaklar: [GOULD, LEAVITT, "Hal Leonard — Guitar Notation Legend"],
  },
];
