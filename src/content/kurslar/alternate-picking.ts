// Alternate Picking — 6 bölüm, özgün egzersizler.
// Perdeler gamlardan hesaplanır (bkz. dizi.ts); "Müzik Bilgisi" metinleri aynı verilerden üretilir.
import type { Course } from "../types.ts";
import { POWER, acrossStrings, fx, onString, pm, repeat, tex, DOWN, UP } from "../tex.ts";
import {
  SCALE,
  between,
  groups,
  inPosition,
  measures,
  noteList,
  perString,
  run,
  tabs,
  thirds,
  times,
  upDown,
  type Pos,
} from "../dizi.ts";
import { accent, alt, chapter, grid, section } from "./ortak.ts";

const P = "ap";
const A2 = 45;
const G2 = 43;

// ── Diziler ──────────────────────────────────────────────────────────────────
const pentaBox1 = inPosition(between(A2, SCALE.minorPenta, 45, 72), 5, 8);
const pentaBox2 = inPosition(between(A2, SCALE.minorPenta, 48, 74), 7, 10);
const pentaBox5 = inPosition(between(A2, SCALE.minorPenta, 43, 69), 2, 5);
const gMajor3 = perString(run(G2, SCALE.major, 18), 3);
const aMinor3 = perString(run(A2, SCALE.minor, 18), 3);
const aDorian3 = perString(run(A2, SCALE.dorian, 18), 3);
const aHarm3 = perString(run(A2, SCALE.harmonicMinor, 18), 3);
const aMinor4 = perString(run(A2, SCALE.minor, 24), 4);

const m = (ps: Pos[]) => ps.map((p) => p.m);
const rev = <T,>(xs: T[]) => [...xs].reverse();
/** n'li grupları her grubun içinde tersten çalar: 4-3-2-1, 5-4-3-2 … */
const reversedGroups = <T,>(xs: T[], n: number) => {
  const out: T[] = [];
  for (let i = 0; i + n <= xs.length; i++) out.push(...xs.slice(i, i + n).reverse());
  return out;
};

const eighths = (bpm: number, notes: string[]) => tex(bpm, measures(":8", alt(notes), 8));
const trips = (bpm: number, notes: string[]) => tex(bpm, measures(":8", alt(notes), 12, 3));
const sixteenths = (bpm: number, notes: string[]) => tex(bpm, measures(":16", alt(notes), 16));
const sextuplets = (bpm: number, notes: string[]) => tex(bpm, measures(":16", alt(notes), 24, 3));
/** Her ölçüde 4 notalık bir kalıp, ölçü boyunca tekrar */
const cells = (duration: ":8" | ":16", cellsPerBar: string[][]) =>
  cellsPerBar.map((c) => `${duration} ${alt(repeat(c, duration === ":8" ? 8 / c.length : 16 / c.length)).join(" ")}`);

// ── Bölüm 1: Temeller ────────────────────────────────────────────────────────
const s1 = section(1, "Temeller", [
  chapter(P, 1, 0, "Açık Teller", [
    "Açık tellerin adları kalından inceye: Mi (E) – La (A) – Re (D) – Sol (G) – Si (B) – Mi (e).",
    "Kalın Mi ile ince Mi aynı notadır; ince olan iki oktav tizdir.",
    "BPM, dakikadaki vuruş sayısıdır. 60 BPM saniyede bir vuruş demektir.",
  ], [
    {
      title: "Kalın Mi Teli – Dörtlükler",
      bpm: 60,
      description: "6. telde dörtlük notalar: her vuruşa bir nota. Pena bir aşağı bir yukarı.",
      tips: ["Pena telin 1-2 mm ötesine geçsin, fazlası enerji kaybı.", "Hareket bilekten gelsin, dirsekten değil."],
      theory: ["Dörtlük nota bir vuruş sürer; 4/4'lük ölçüye dört tane sığar. Ölçü başına '1 – 2 – 3 – 4' diye say."],
      tex: tex(60, measures(":4", alt(times("0.6", 16)), 4)),
    },
    {
      title: "Sekizlik Notalar – Tüm Teller",
      bpm: 60,
      description: "Her telde bir ölçü sekizlik nota, kalın telden inceye.",
      tips: ["Aşağı ve yukarı vuruşların sesi eşit yüksekliğe gelsin.", "Kullanmadığın telleri sol elin parmak uçlarıyla hafifçe sustur."],
      theory: ["Sekizlik nota yarım vuruştur: '1 ve 2 ve 3 ve 4 ve' diye say. Sayılara aşağı, 've'lere yukarı pena düşer."],
      tex: tex(60, UP.map((s) => `:8 ${alt(times(`0.${s}`, 8)).join(" ")}`)),
    },
    {
      title: "Teller Arası Yolculuk",
      bpm: 70,
      description: "Her telde dört nota, kalın telden inceye ve geri.",
      tips: ["Tel değiştirirken pena yönü bozulmaz: aşağı-yukarı sırası devam eder."],
      theory: [
        "Komşu açık teller arasındaki aralık tam dörtlüdür (5 yarım ses); yalnızca Sol–Si arası büyük üçlüdür (4 yarım ses).",
        "Kulaktan akort ederken '5. perde = bir alttaki açık tel' kuralının Sol telinde 4. perdeye dönmesi bu yüzdendir.",
      ],
      tex: eighths(70, [6, 5, 4, 3, 2, 1, 2, 3, 4, 5].flatMap((s) => times(`0.${s}`, 4))),
    },
  ]),
  chapter(P, 1, 1, "Tek Tel Gamlar", [
    "Gitarda her perde bir yarım sestir; iki perde bir tam ses.",
    "Tek telde çalmak gamın aralıklarını gözle görmeni sağlar.",
  ], [
    {
      title: "Si Telinde Do Majör",
      bpm: 60,
      description: "Do majör gamı 2. telde: 1. perdeden 13. perdeye çık, aynı yoldan in.",
      tips: ["Kaydırırken parmak teli bırakmasın; sesler kopmadan bağlansın.", "Pena eli sol elden bağımsız, hep aynı ritimde."],
      theory: [
        "Majör gam formülü: T – T – Y – T – T – T – Y (T = tam ses = 2 perde, Y = yarım ses = 1 perde).",
        `Do majörde diyez ya da bemol yoktur: ${noteList(run(60, SCALE.major, 7))}.`,
        "Yarım sesler Mi–Fa ve Si–Do arasındadır; telde bu notalar yan yana perdelerdedir.",
      ],
      tex: eighths(60, upDown(onString(2, m(perString(run(60, SCALE.major, 8), 8, 2)).map((x) => x - 59)))),
    },
    {
      title: "La Telinde La Minör",
      bpm: 60,
      description: "La doğal minör gamı 5. telde: açık telden 12. perdeye çık ve in.",
      tips: ["12. perde, açık telin bir oktav üstüdür; sapın noktalı perdesi."],
      theory: [
        "Doğal minör formülü: T – Y – T – T – Y – T – T.",
        `La minör, Do majörün ilgili (relatif) minörüdür: aynı notalar, farklı başlangıç: ${noteList(run(A2, SCALE.minor, 7))}.`,
      ],
      tex: eighths(60, upDown(onString(5, run(A2, SCALE.minor, 8).map((x) => x - A2)))),
    },
    {
      title: "İnce Mi Telinde Melodi",
      bpm: 70,
      description: "İnce Mi telinde La minör bir melodi. Sol el pozisyon değiştirirken sağ el ritmi bozmamalı.",
      tips: ["Pena yönü hiç bozulmaz.", "Son notayı tam süresince tut."],
      theory: [
        "Melodi La minör gamının notalarıyla yazıldı: 5. perde La, 8. perde Do, 12. perde Mi (La minör akorunun üç notası).",
        "Melodi La ile başlayıp La ile bitiyor; bu nota 'ev' hissi veren tonik.",
      ],
      tex: tex(70, [
        ...[[5, 7, 8, 7, 5, 7, 8, 10], [12, 10, 8, 7, 8, 7, 5, 7], [5, 7, 8, 10, 12, 13, 12, 10]].map((b) => `:8 ${alt(onString(1, b)).join(" ")}`),
        `:8 ${alt(onString(1, [8, 7, 5, 7])).join(" ")} :2 5.1`,
      ]),
    },
  ]),
  chapter(P, 1, 2, "İki Tel Arası", [
    "Aralık, iki nota arasındaki uzaklıktır ve yarım ses sayısıyla ölçülür: küçük üçlü 3, büyük üçlü 4, tam dörtlü 5, tam beşli 7 yarım ses.",
  ], [
    {
      title: "Sol ve Si Telleri",
      bpm: 60,
      description: "Sol ve Si telleri arasında gidip gelen sekizlikler. Her ölçüde yeni bir aralık.",
      tips: ["Pena tellerin arasına gömülmesin, üzerlerinden süzülsün."],
      theory: [
        "1. ölçü La–Do: küçük üçlü. 2. ölçü La–Re: tam dörtlü. 3. ölçü Sol–Do: tam dörtlü. 4. ölçü Sol–Si: büyük üçlü.",
        "Küçük üçlü hüzünlü, büyük üçlü parlak duyulur; minör ve majör akorların farkı bu aralıktan gelir.",
      ],
      tex: tex(60, [["2.3", "1.2"], ["2.3", "3.2"], ["0.3", "1.2"], ["0.3", "0.2"]].map((c) => `:8 ${alt(repeat(c, 4)).join(" ")}`)),
    },
    {
      title: "Re ve Sol Telleri",
      bpm: 60,
      description: "Aynı fikir bir alt tel çiftinde.",
      tips: ["Kalın tellerde pena biraz daha fazla dirençle karşılaşır; hareket yine küçük kalsın."],
      theory: ["Mi–La tam dörtlü, Mi–Sol küçük üçlü, Re–La tam beşli, Fa–La büyük üçlü. Tam beşli, power chord'un iki notasıdır."],
      tex: tex(60, [["2.4", "2.3"], ["2.4", "0.3"], ["0.4", "2.3"], ["3.4", "2.3"]].map((c) => `:8 ${alt(repeat(c, 4)).join(" ")}`)),
    },
    {
      title: "Üç Tel Kalıpları",
      bpm: 70,
      description: "Üç tele yayılan dört notalık kalıplar.",
      tips: ["Her ölçüyü önce yavaşça ezberle, sonra metronomla bağla."],
      theory: [`Bütün notalar La minör pentatonikten: ${noteList(m(pentaBox1))}. Bu dizi 2. bölümün konusu.`],
      tex: tex(70, [["7.3", "5.2", "8.2", "5.2"], ["5.3", "5.2", "8.2", "5.2"], ["7.4", "5.3", "7.3", "5.3"], ["5.4", "5.3", "7.3", "5.3"]].map(
        (c) => `:8 ${alt(repeat(c, 2)).join(" ")}`,
      )),
    },
  ]),
  chapter(P, 1, 3, "Ritim Değerleri", [
    "Ritim, notaların ne kadar sürdüğüdür. Tempo değişmeden bir vuruş 1, 2, 3 ya da 4 parçaya bölünebilir.",
  ], [
    {
      title: "Dörtlükten Sekizliğe",
      bpm: 70,
      description: "Bir ölçü dörtlük, bir ölçü sekizlik. Her iki ölçüde bir nota değişir.",
      tips: ["Sekizliğe geçerken hızlanma; tempo aynı, sadece bölünme iki katı."],
      theory: [
        "La – Re – Mi, La tonunun I – IV – V dereceleridir. Bluesun ve rock'n'roll'un temel dizisi bu üç notanın akorlarıyla kurulur.",
      ],
      tex: tex(70, ["5.6", "5.5", "7.5"].flatMap((n) => [`:4 ${alt(times(n, 4)).join(" ")}`, `:8 ${alt(times(n, 8)).join(" ")}`])),
    },
    {
      title: "Suslu Sekizlikler",
      bpm: 70,
      description: "Bazı sekizliklerin yerinde sus var. Pena eli susta da salınmaya devam eder.",
      tips: ["Susta pena tele değmeden aşağı-yukarı hareketini sürdürür.", "Vuruştaki notalar hep aşağı, aradakiler hep yukarı."],
      theory: [
        "Sus (es), nota kadar önemlidir: süresi boyunca sessiz kalınır.",
        "Vurgu zayıf zamana (ve'lere) kaydığında senkop oluşur; funk ve rock ritimlerinin 'itici' hissi buradan gelir.",
      ],
      tex: tex(70, ["x-xx-xx-", "xx-x-xx-", "x-x-xxxx", "xxxx-x-x"].flatMap((p) => [grid(p, "5.6"), grid(p, "7.5")])),
    },
    {
      title: "Triole Giriş",
      bpm: 60,
      description: "Bir ölçü sekizlik, bir ölçü triole. Notalar La minör pentatonikten.",
      tips: ["Triolede her vuruş farklı pena yönüyle başlar: 1. vuruş aşağı, 2. vuruş yukarı."],
      theory: ["Triole, bir vuruşu üç eşit parçaya böler. '1-ve-a 2-ve-a' diye say."],
      tex: tex(60, ["5.6", "8.6", "5.5", "7.5"].flatMap((n) => [
        `:8 ${alt(times(n, 8)).join(" ")}`,
        measures(":8", alt(times(n, 12)), 12, 3)[0],
      ])),
    },
  ]),
  chapter(P, 1, 4, "Kromatik Pena", [
    "Kromatik dizi 12 yarım sesin hepsini sırayla çalar. Gitarda ardışık perdeler kromatik dizidir.",
    "Kromatik egzersizler kulaktan çok eli çalıştırır: sol-sağ el uyumu ve parmak bağımsızlığı.",
  ], [
    {
      title: "1-2-3-4",
      bpm: 60,
      description: "Her telde dört perde, her perdeye bir parmak. Çık ve geri in.",
      tips: ["1. perde işaret, 4. perde serçe parmak.", "Bir sonraki notaya geçene kadar parmağı kaldırma."],
      theory: ["Her telde çaldığın dört nota birbirine yarım ses uzaklıktadır; dört nota toplam bir küçük üçlü aralığını doldurur."],
      tex: eighths(60, [...acrossStrings(UP, [1, 2, 3, 4]), ...acrossStrings(DOWN, [4, 3, 2, 1])]),
    },
    {
      title: "5. Pozisyonda Kromatik",
      bpm: 70,
      description: "Aynı kalıp perdelerin daha dar olduğu 5. pozisyonda.",
      tips: ["Başparmak sapın arkasında, orta parmağın hizasında."],
      theory: ["Pozisyon, işaret parmağının durduğu perdedir. 5. pozisyonda parmaklar 5-6-7-8. perdeleri kapsar."],
      tex: eighths(70, [...acrossStrings(UP, [5, 6, 7, 8]), ...acrossStrings(DOWN, [8, 7, 6, 5])]),
    },
    {
      title: "Kayan Kromatik",
      bpm: 60,
      minutes: 2,
      description: "Her telde dört nota; bir üst tele geçerken el bir perde kayar.",
      tips: ["Kayma anında elin tamamı hareket etsin.", "Her dörtlünün ilk notasını hafifçe vurgula."],
      theory: ["On altılık nota çeyrek vuruştur: '1-e-ve-a' diye say. Dört nota bir vuruşa sığar."],
      tex: sixteenths(60, [...acrossStrings(UP, (i) => [1 + i, 2 + i, 3 + i, 4 + i]), ...acrossStrings(DOWN, (i) => [9 - i, 8 - i, 7 - i, 6 - i])]),
    },
  ]),
]);

// ── Bölüm 2: Pentatonik ──────────────────────────────────────────────────────
const box1 = tabs(pentaBox1);
const s2 = section(2, "Pentatonik", [
  chapter(P, 2, 0, "La Minör Pentatonik", [
    "Minör pentatonik beş notalı bir gamdır: 1 – b3 – 4 – 5 – b7.",
    `La minör pentatonik: ${noteList(m(pentaBox1))}.`,
    "Gamda yarım ses aralığı yoktur; bu yüzden hangi notada durursan dur 'yanlış' duyulmaz. Rock ve blues solosunun temelidir.",
  ], [
    {
      title: "1. Kutu – Sekizlik",
      bpm: 70,
      description: "5. pozisyondaki pentatonik kutuyu çık ve in.",
      tips: ["Bu kutuyu ezberle; pek çok solonun temeli."],
      theory: ["Kök nota La üç yerde: 6. telde 5. perde, 4. telde 7. perde, 1. telde 5. perde. Üç oktav aynı nota."],
      tex: eighths(70, upDown(box1)),
    },
    {
      title: "1. Kutu – Triole",
      bpm: 60,
      description: "Aynı kutu triole ritmiyle. Pena yönü her vuruşta yer değiştirir.",
      tips: ["Kutunun her teli iki notalı; triole ise üçlü. Vurgunun tellerden bağımsız aktığını hisset."],
      theory: ["Aynı beş nota Do majör pentatoniği de oluşturur (Do – Re – Mi – Sol – La): ilgili majör."],
      tex: trips(60, upDown(box1)),
    },
    {
      title: "1. Kutu – On Altılık",
      bpm: 50,
      minutes: 2,
      description: "Kutuyu on altılıklarla iki kez çık ve in.",
      tips: ["50 BPM rahatsa her gün 5 BPM artır."],
      theory: ["On altılıkta her vuruşa dört nota düşer; 50 BPM'de saniyede 3,3 nota çalıyorsun."],
      tex: sixteenths(50, [...upDown(box1), ...upDown(box1).slice(1)]),
    },
  ]),
  chapter(P, 2, 1, "Üçlü Gruplar", [
    "Sekans, küçük bir kalıbı gamın her basamağından başlayarak tekrar etmektir. Kulağa düz gam gibi değil, cümle gibi gelir.",
    "Üçlü gruplar triole ritmine oturur: her vuruşa bir grup.",
  ], [
    { title: "Çıkan Üçlüler", bpm: 60, description: "1-2-3, 2-3-4, 3-4-5 … diye çık.", tips: ["Her grubun ilk notası vuruşa denk gelir."], tex: trips(60, groups(box1, 3)) },
    { title: "İnen Üçlüler", bpm: 60, description: "Tepeden başlayarak üçlü gruplarla in.", tips: ["İnişte pena çoğu zaman alttaki tele 'çarpar'; hareketi küçült."], tex: trips(60, groups(rev(box1), 3)) },
    {
      title: "Üçlüler – Çık ve İn",
      bpm: 60,
      minutes: 2,
      description: "Çıkan ve inen üçlüleri birleştir.",
      tips: ["Dönüş noktasında ritim bozulmasın."],
      theory: ["Gruplar her vuruşta farklı pena yönüyle başlar; bu, iki yönü eşit güçlendirir."],
      tex: trips(60, [...groups(box1, 3), ...groups(rev(box1), 3)]),
    },
  ]),
  chapter(P, 2, 2, "Dörtlü Gruplar", [
    "Dörtlü gruplar on altılık notalara tam oturur: her vuruşta bir grup, her grup aşağı penayla başlar.",
  ], [
    { title: "Dörtlüler – Sekizlik", bpm: 70, description: "1-2-3-4, 2-3-4-5 … çık; aynısını tepeden in.", tips: ["Önce grupları ezberle, sonra hızlan."], tex: eighths(70, [...groups(box1, 4), ...groups(rev(box1), 4)]) },
    { title: "Dörtlüler – On Altılık", bpm: 50, minutes: 2, description: "Aynı sekans on altılıklarla.", tips: ["Her vuruşun ilk notasına hafif vurgu."], tex: sixteenths(50, [...groups(box1, 4), ...groups(rev(box1), 4)]) },
    {
      title: "Ters Dörtlüler",
      bpm: 50,
      minutes: 2,
      description: "Her grup kendi içinde tersten: 4-3-2-1, 5-4-3-2 …",
      tips: ["Gruplar yukarı çıkarken notalar aşağı iner; kafa karıştırıcı, yavaş başla."],
      theory: ["Sekansın yönü ile grubun içindeki yön farklı olabilir. Böyle 'ters' sekanslar gam ezberini kalıptan kurtarır."],
      tex: sixteenths(50, reversedGroups(box1, 4)),
    },
  ]),
  chapter(P, 2, 3, "Diğer Kutular", [
    "Pentatonik sapın tamamında beş kutuya bölünür. Hepsi aynı beş notayı içerir, sadece başka bir perde aralığında.",
  ], [
    {
      title: "2. Kutu",
      bpm: 70,
      description: "7-10. perdeler arasındaki kutu.",
      tips: ["Bu kutuda işaret parmağı 7. perdede, serçe 10. perdede."],
      theory: ["Kök La burada 4. telde 7. perde ve 2. telde 10. perde."],
      tex: eighths(70, upDown(tabs(pentaBox2))),
    },
    {
      title: "5. Kutu",
      bpm: 70,
      description: "1. kutunun hemen altındaki, 2-5. perdeler arasındaki kutu.",
      tips: ["4. ve 3. telde işaret parmağı 2. perdeye uzanır."],
      theory: ["Kök La burada 6. telde 5. perde, 3. telde 2. perde ve 1. telde 5. perde."],
      tex: eighths(70, upDown(tabs(pentaBox5))),
    },
    {
      title: "Kutuları Bağla",
      bpm: 70,
      minutes: 2,
      description: "5. kutuyu çık, 1. kutuyu in, 2. kutuyu çık.",
      tips: ["Kutu değiştirirken el, tek hamlede yeni pozisyona kayar."],
      theory: ["Kutular arasında gezinmek, sapın her yerinde aynı notaları görmeyi öğretir. Doğaçlamanın temeli budur."],
      tex: eighths(70, [...tabs(pentaBox5), ...rev(box1), ...tabs(pentaBox2)]),
    },
  ]),
  chapter(P, 2, 4, "Pentatonik Cümleler", [
    "İyi bir cümle kök notaya (La) dönerek çözülür. Mi (5. derece) ile bitirmek 'soru', La ile bitirmek 'cevap' hissi verir.",
  ], [
    {
      title: "İnen Cümle",
      bpm: 70,
      description: "Her ölçüde iki telde gidip gelen, kutu boyunca inen bir cümle.",
      tips: ["Son notayı tam süresince tut ve vibrato ekle."],
      theory: ["Cümle Do, La, Sol, Mi, Re, La üzerinden kök notaya iner."],
      tex: tex(70, [
        `:8 ${alt(["8.1", "5.1", "8.2", "5.2", "8.1", "5.1", "8.2", "5.2"]).join(" ")}`,
        `:8 ${alt(["7.3", "5.3", "7.4", "5.4", "7.3", "5.3", "7.4", "5.4"]).join(" ")}`,
        `:8 ${alt(["7.4", "5.4", "7.5", "5.5", "7.4", "5.4", "7.5", "5.5"]).join(" ")}`,
        `:8 ${alt(["8.6", "5.6", "7.5", "5.5"]).join(" ")} :2 7.4{v}`,
      ]),
    },
    {
      title: "Soru ve Cevap",
      bpm: 70,
      description: "İki ölçülük soru Mi'de durur, iki ölçülük cevap La'da biter.",
      tips: ["Suslarda pena eli salınmaya devam eder."],
      theory: ["Soru-cevap (call and response), bluesun temel cümle yapısıdır."],
      tex: tex(70, [
        `:8 ${alt(["5.1", "8.1", "5.1", "8.2"]).join(" ")} :4 5.2 r`,
        `:8 ${alt(["7.3", "5.3", "7.3", "5.2"]).join(" ")} :2 5.2`,
        `:8 ${alt(["8.2", "5.2", "7.3", "5.3"]).join(" ")} :4 7.4 r`,
        `:8 ${alt(["5.4", "7.4", "5.5", "7.5"]).join(" ")} :2 7.4{v}`,
      ]),
    },
    {
      title: "On Altılık Cümle",
      bpm: 60,
      minutes: 2,
      description: "Kutunun tepesinden kök notaya on altılıklarla inen uzun bir cümle.",
      tips: ["Her vuruşun ilk notasını vurgula; cümle dört notalık parçalardan oluşur."],
      theory: ["Cümle ters dörtlü gruplarla iner; bu, pentatoniğin en çok kullanılan hız kalıplarından biridir."],
      tex: tex(60, [...measures(":16", alt(reversedGroups(rev(box1), 4).slice(0, 32)), 16), ":1 5.6{v}"]),
    },
  ]),
]);

// ── Bölüm 3: Gamlar ──────────────────────────────────────────────────────────
const g3 = tabs(gMajor3);
const a3 = tabs(aMinor3);
const s3 = section(3, "Majör ve Minör Gamlar", [
  chapter(P, 3, 0, "Sol Majör – 3 Nota/Tel", [
    `Sol majörün tek diyezi vardır, Fa#: ${noteList(m(gMajor3))}.`,
    "3 nota/tel kalıbında her telde tek sayıda nota olduğu için her yeni tel bir öncekinin tersi pena yönüyle başlar. Alternate picking'in en öğretici yanı budur.",
  ], [
    { title: "Sol Majör – Sekizlik", bpm: 70, description: "İki buçuk oktav Sol majör, çık ve in.", tips: ["Her telde 1-2-4 ya da 1-3-4 parmak düzeni."], tex: eighths(70, upDown(g3)) },
    { title: "Sol Majör – Triole", bpm: 60, description: "Triolede her telin ilk notası vuruşa düşer.", tips: ["Tel = vuruş: bunu duymak ritmi kolaylaştırır."], tex: trips(60, upDown(g3)) },
    { title: "Sol Majör – On Altılık", bpm: 50, minutes: 2, description: "Aynı gam on altılıklarla.", tips: ["Gerginlik hissedersen tempoyu düşür."], tex: sixteenths(50, upDown(g3)) },
  ]),
  chapter(P, 3, 1, "La Doğal Minör – 3 Nota/Tel", [
    "La doğal minör, Do majörün notalarını La'dan başlayarak çalar (Eolyen mod).",
    "Karakteristik aralığı b6'dır (Fa): hüzünlü rengini bu nota verir.",
  ], [
    { title: "La Minör – Sekizlik", bpm: 70, description: "5. pozisyonda 3 nota/tel La minör.", tips: ["2. telde el bir perde ileri kayar (6-8-10)."], theory: ["Si teli diğerlerinden bir perde 'geride' akort edildiği için 2. telde kalıp bir perde kayar."], tex: eighths(70, upDown(a3)) },
    { title: "La Minör – Triole", bpm: 60, description: "Triole ile aynı gam.", tips: ["Her vuruşun başını hafifçe vurgula."], tex: trips(60, upDown(a3)) },
    { title: "La Minör – On Altılık", bpm: 50, minutes: 2, description: "On altılıklarla iki kez çık ve in.", tips: ["Dönüş noktasında duraklama olmasın."], tex: sixteenths(50, [...upDown(a3), ...upDown(a3).slice(1)]) },
  ]),
  chapter(P, 3, 2, "Üçlü Sekans", [
    "Gam sekansları gamı bir 'alıştırma' olmaktan çıkarıp melodik malzemeye dönüştürür. Klasik müzikteki gam etütlerinin çoğu sekanstır.",
  ], [
    { title: "Sol Majör – Çıkan Üçlüler", bpm: 60, description: "1-2-3, 2-3-4 … Sol majör boyunca.", tips: ["Gruplar tel değiştirirken parçalanır; parmakları önceden hazırla."], tex: trips(60, groups(g3, 3)) },
    { title: "Sol Majör – İnen Üçlüler", bpm: 60, description: "Tepeden üçlü gruplarla in.", tips: ["İnerken pena yukarı vuruşla tel değiştirmeye alışsın."], tex: trips(60, groups(rev(g3), 3)) },
    { title: "La Minör – Üçlüler Çık ve İn", bpm: 60, minutes: 2, description: "La minörde çık ve in.", tips: ["Bitiş notası La."], tex: trips(60, [...groups(a3, 3), ...groups(rev(a3), 3)]) },
  ]),
  chapter(P, 3, 3, "Dörtlü Sekans", [
    "Dörtlü sekans her vuruşa bir grup yerleştirir; gruplar gamın bir sonraki basamağından başlar.",
  ], [
    { title: "Sol Majör – Dörtlüler (Sekizlik)", bpm: 70, description: "Sol majör dörtlü gruplarla çık.", tips: ["Gruplar iki vuruşta bir tamamlanır."], tex: eighths(70, groups(g3, 4)) },
    { title: "La Minör – Çıkan Dörtlüler", bpm: 55, minutes: 2, description: "On altılıklarla dörtlü sekans.", tips: ["Her grubun ilk notası aşağı pena."], tex: sixteenths(55, groups(a3, 4)) },
    { title: "La Minör – İnen Dörtlüler", bpm: 55, minutes: 2, description: "Tepeden dörtlü gruplarla in.", tips: ["İnişte tel geçişleri yukarı vuruşla olur; en zor kısım."], tex: sixteenths(55, groups(rev(a3), 4)) },
  ]),
  chapter(P, 3, 4, "Üçlü Aralıklar", [
    "Gamın içinde birer nota atlayarak çalmak diyatonik üçlüleri üretir: kimi büyük üçlü (4 yarım ses), kimi küçük üçlü (3 yarım ses).",
    "Sol majörde Sol–Si büyük, La–Do küçük, Si–Re küçük, Do–Mi büyük, Re–Fa# büyük, Mi–Sol küçük, Fa#–La küçük. Bu sıra gamın akorlarını da belirler: I, IV, V majör; ii, iii, vi minör.",
  ], [
    { title: "Sol Majör Üçlüler – Çık", bpm: 70, description: "1-3, 2-4, 3-5 … Sol majör boyunca.", tips: ["Atlanan notayı aklında say; kalıp ezbere değil gama dayanmalı."], tex: eighths(70, thirds(g3)) },
    { title: "Sol Majör Üçlüler – İn", bpm: 70, description: "Tepeden üçlülerle in.", tips: ["İnişte aralıklar ters döner: önce üstteki nota."], tex: eighths(70, thirds(rev(g3))) },
    { title: "La Minör Üçlüler – On Altılık", bpm: 55, minutes: 2, description: "La minörde üçlüler, çık ve in.", tips: ["Aynı perdede iki tele basılan yerlerde parmağı 'yuvarla'."], tex: sixteenths(55, [...thirds(a3), ...thirds(rev(a3))]) },
  ]),
]);

// ── Bölüm 4: Ritim ve Kontrol ────────────────────────────────────────────────
const ladder = (note: string | string[], extra?: "sextuplet") => {
  const pick = (n: number) => (Array.isArray(note) ? repeat(note, Math.ceil(n / note.length)).slice(0, n) : times(note, n));
  const bars = [
    `:4 ${alt(pick(4)).join(" ")}`,
    `:8 ${alt(pick(8)).join(" ")}`,
    measures(":8", alt(pick(12)), 12, 3)[0],
    `:16 ${alt(pick(16)).join(" ")}`,
  ];
  if (extra) bars.push(measures(":16", alt(pick(24)), 24, 3)[0]);
  return [...bars, ...bars.slice(0, -1).reverse()];
};

const amFGE = [["12.1", "8.1", "5.1", "8.1"], ["13.1", "8.1", "5.1", "8.1"], ["15.1", "10.1", "7.1", "10.1"], ["12.1", "7.1", "4.1", "7.1"]];

const s4 = section(4, "Ritim ve Kontrol", [
  chapter(P, 4, 0, "Ritim Merdiveni", [
    "Vuruşun bölünmesi: dörtlük (1), sekizlik (2), triole (3), on altılık (4). Tempo aynı kalır, sadece bölünme artar.",
  ], [
    { title: "Tek Notada Merdiven", bpm: 60, description: "Dörtlük → sekizlik → triole → on altılık ve geri, tek nota üzerinde.", tips: ["Geçişlerde metronomun vuruşu hiç kaçmasın."], tex: tex(60, ladder("5.2")) },
    { title: "Akor Tonlarında Merdiven", bpm: 60, description: "Aynı merdiven, La minör akorunun notaları arasında dönerek.", tips: ["Notalar dört notalık döngüde; bölünme değişince döngü vuruşa göre kayar."], theory: ["La – Do – Mi – Do: La minör akorunun notaları (kök, minör üçlü, beşli)."], tex: tex(60, ladder(["5.1", "8.1", "12.1", "8.1"])) },
    { title: "Altılıya Kadar", bpm: 50, minutes: 2, description: "Merdivene altılık (on altılık triole) basamağı eklenir.", tips: ["Altılıkta vuruş başına altı nota: '1-ta-ki-ve-ta-ki'."], theory: ["Altılık, her vuruşu altıya böler: on altılığın triole hali."], tex: tex(50, ladder("5.2", "sextuplet")) },
  ]),
  chapter(P, 4, 1, "On Altılıklar", [
    "Am – F – G – E: La minörde i – VI – VII – V. Son akor E majördür, çünkü Sol# notası La'ya yarım sesle güçlü bir çekim yapar.",
  ], [
    { title: "Tremolo Pena", bpm: 70, description: "Tek notada sürekli on altılık: La, Do, Re, Mi.", tips: ["Bilek gevşek, kol sabit; hareket çok küçük."], theory: ["Tremolo pena, tek notayı hızla tekrar etmektir; surf rock ve metal sololarında sık kullanılır."], tex: tex(70, [5, 8, 10, 12].map((f) => `:16 ${alt(times(`${f}.1`, 16)).join(" ")}`)) },
    { title: "Akor Tonları – İnce Mi", bpm: 60, minutes: 2, description: "Her ölçüde bir akorun notaları, tek telde dört notalık kalıp.", tips: ["Sol el pozisyon değiştirirken sağ el durmasın."], theory: ["Am: La–Do–Mi · F: Fa–La–Do · G: Sol–Si–Re · E: Mi–Sol#–Si"], tex: tex(60, cells(":16", amFGE)) },
    { title: "La Minör – Hızlı Gam", bpm: 70, minutes: 2, description: "3 nota/tel La minör, on altılıklarla bir üst tempoda.", tips: ["3. bölümdeki tempodan 15 BPM yukarıdasın; temiz çalamıyorsan geri dön."], tex: sixteenths(70, [...upDown(a3), ...upDown(a3).slice(1)]) },
  ]),
  chapter(P, 4, 2, "Vurgu", [
    "Vurgu (aksan, >), notayı ötekilerden daha güçlü çalmaktır. Hız kadar dinamik kontrolü de pena elinin işidir.",
  ], [
    { title: "Vuruşta Vurgu", bpm: 60, description: "On altılıklarda her vuruşun ilk notası vurgulu.", tips: ["Vurgusuz notalar yumuşak; fark net duyulmalı."], tex: tex(60, [5, 8, 10, 12].map((f) => `:16 ${accent(alt(times(`${f}.1`, 16)), 4).join(" ")}`)) },
    { title: "Üçte Bir Vurgu", bpm: 60, minutes: 2, description: "On altılıklarda her üç notada bir vurgu.", tips: ["Vurgu bazen aşağı bazen yukarı vuruşa düşer."], theory: ["Üçerli vurgu dörtlü bölünme üzerinde 3:4 poliritim hissi yaratır; vurgu her vuruşta kayar ve üç vuruşta bir başa döner."], tex: tex(60, measures(":16", accent(alt(repeat(["5.1", "8.1", "5.1", "8.2"], 16)), 3), 16)) },
    { title: "Arada Vurgu", bpm: 60, description: "Vurgu her vuruşun 've'sinde (üçüncü on altılık).", tips: ["Vurgulu nota aşağı vuruşa düşer ama vuruşun başında değildir."], theory: ["Zayıf zamana düşen vurgu ritmi 'ileri iter'; funk gitarının temel hissidir."], tex: tex(60, [5, 8, 10, 12].map((f) => `:16 ${accent(alt(times(`${f}.1`, 16)), 4, 2).join(" ")}`)) },
  ]),
  chapter(P, 4, 3, "Hız Patlamaları", [
    "Patlama (burst): uzun notalar arasına kısa, hızlı gruplar koymak. Hedef tempoyu kısa süre çalmak, kas hafızasını tüm cümleden önce kurar.",
  ], [
    { title: "Bir Vuruşluk Patlama", bpm: 70, description: "Bir dörtlük, bir vuruş on altılık; ölçü boyunca.", tips: ["Patlamadan sonraki dörtlük nota bir 'dinlenme' anı."], tex: tex(70, [[5, 7, 8, 7], [8, 10, 12, 10], [12, 10, 8, 7], [5, 7, 8, 5]].map((c) => `:4 ${c[0]}.1 :16 ${alt(onString(1, c)).join(" ")} :4 ${c[0]}.1 :16 ${alt(onString(1, c)).join(" ")}`)) },
    { title: "İki Vuruşluk Patlama", bpm: 70, description: "İki vuruş yarım nota, iki vuruş on altılık pentatonik.", tips: ["Patlama bittiğinde yarım notaya tam vuruşta in."], tex: tex(70, [0, 4, 8].map((i) => `:2 ${box1[i]} :16 ${alt(box1.slice(i, i + 4).concat(box1.slice(i, i + 4))).join(" ")}`).concat(":2 5.1 :16 " + alt(["8.1", "5.1", "8.2", "5.2", "7.3", "5.3", "7.4", "5.4"]).join(" "))) },
    { title: "Altılık Patlama", bpm: 60, minutes: 2, description: "Bir vuruş altılık patlama, ardından sekizlikler.", tips: ["Altılık iki üçlü grup gibi düşünülebilir."], theory: ["Altı nota iki triole grubudur; üçlü sekanslar altılık patlamaya çok uygundur."], tex: tex(60, [0, 3, 6, 9].map((i) => `${measures(":16", alt(groups(box1, 3).slice(i * 3, i * 3 + 6)), 6, 3)[0]} :8 ${alt(times(box1[Math.min(i + 3, 11)], 6)).join(" ")}`)) },
  ]),
  chapter(P, 4, 4, "Galop Ritmi", [
    "Galop: bir sekizlik + iki on altılık. Atın dörtnalını andırır; heavy metalin klasik ritmidir.",
    "Power chord (5'li akor) sadece kök ve beşliden oluşur. Majör ya da minör değildir; bu yüzden distortion altında temiz duyulur.",
  ], [
    { title: "Kalın Mi'de Galop", bpm: 80, description: "Avuç içiyle susturulmuş (palm mute) kalın Mi telinde galop.", tips: ["Sekizlik aşağı, on altılıklar aşağı-yukarı; aradaki yukarı vuruş boşta."], tex: tex(80, times(repeat(["0.6"], 4).map((n) => `:8 ${n}{pm sd} :16 ${n}{pm sd} ${n}{pm su}`).join(" "), 4)) },
    { title: "Power Chord Galop", bpm: 80, description: "E5 – G5 – A5 – G5 üzerinde galop.", tips: ["Akor değişiminde avuç içi köprünün üzerinde kalsın."], theory: ["E5 = Mi + Si, G5 = Sol + Re, A5 = La + Mi. Kök ile beşli arasında 7 yarım ses var."], tex: tex(80, [POWER.E5, POWER.G5, POWER.A5, POWER.G5].map((c) => repeat([`:8 ${fx(pm(c), "sd")} :16 ${fx(pm(c), "sd")} ${fx(pm(c), "su")}`], 4).join(" "))) },
    { title: "Ters Galop", bpm: 80, description: "İki on altılık + bir sekizlik: galobun tersi.", tips: ["Burada vuruşa aşağı, ikinci on altılığa yukarı, sekizliğe yine aşağı."], tex: tex(80, [POWER.E5, POWER.E5, POWER.G5, POWER.A5].map((c) => repeat([`:16 ${fx(pm(c), "sd")} ${fx(pm(c), "su")} :8 ${fx(pm(c), "sd")}`], 4).join(" "))) },
  ]),
]);

// ── Bölüm 5: Tel Geçişi Ustalığı ─────────────────────────────────────────────
const cell = (a: string, b: string, c: string, d: string) => [a, b, c, d];
const s5 = section(5, "Tel Geçişi Ustalığı", [
  chapter(P, 5, 0, "Dış Pena (Outside)", [
    "Kalın tel yukarı, ince tel aşağı vuruşla çalınırsa pena tel değiştirirken tellerin dışından dolaşır: dış pena.",
    "Notalar akorların kendi notalarından (arpej): Am = La–Do–Mi · F = Fa–La–Do · G = Sol–Si–Re · E = Mi–Sol#–Si.",
  ], [
    { title: "Si–Sol Dış Pena", bpm: 70, description: "Si telindeki notalar aşağı, Sol telindekiler yukarı vuruş.", tips: ["Pena Sol telinin üzerinden atlarken hareket küçük kalsın."], tex: tex(70, cells(":8", [cell("8.2", "7.3", "5.2", "7.3"), cell("6.2", "7.3", "5.2", "7.3"), cell("8.2", "7.3", "5.2", "7.3"), cell("5.2", "4.3", "3.2", "4.3")])) },
    { title: "Mi–Si: Am F G E", bpm: 60, minutes: 2, description: "İnce Mi aşağı, Si yukarı vuruş; dört akor.", tips: ["Pozisyon değişimini ölçü sonunda değil, son notayla birlikte hazırla."], tex: tex(60, cells(":16", [cell("12.1", "10.2", "8.1", "10.2"), cell("13.1", "10.2", "8.1", "10.2"), cell("15.1", "12.2", "10.1", "12.2"), cell("12.1", "9.2", "7.1", "9.2")])) },
    { title: "Çıkan Pentatonik", bpm: 70, description: "2 nota/tel pentatonik, sadece çıkarak.", tips: ["Aşağı vuruşla başlayıp 2 nota/tel çalınca her tel geçişi dış pena olur."], tex: eighths(70, [...box1, ...box1, ...tabs(pentaBox2), ...tabs(pentaBox2)]) },
  ]),
  chapter(P, 5, 1, "İç Pena (Inside)", [
    "Kalın tel aşağı, ince tel yukarı vuruşla çalınırsa pena iki telin arasında çalışır: iç pena. Genellikle dış penadan zordur.",
  ], [
    { title: "Sol–Si İç Pena", bpm: 60, description: "Sol telindeki notalar aşağı, Si telindekiler yukarı vuruş; Am F G E.", tips: ["Pena tellerin arasında 'sıkışmış' hissettirmesin: açıyı biraz eğ."], tex: tex(60, cells(":8", [cell("2.3", "5.2", "5.3", "5.2"), cell("5.3", "6.2", "2.3", "6.2"), cell("4.3", "8.2", "7.3", "8.2"), cell("1.3", "5.2", "4.3", "5.2")])) },
    { title: "İnen Pentatonik", bpm: 70, description: "2 nota/tel pentatonik, sadece inerek.", tips: ["İnişte her tel geçişi iç pena olur."], tex: eighths(70, [...rev(box1), ...rev(box1), ...rev(tabs(pentaBox2)), ...rev(tabs(pentaBox2))]) },
    { title: "Karışık: 3 Nota/Tel", bpm: 70, minutes: 2, description: "3 nota/tel La minör: geçişler sırayla iç ve dış.", tips: ["Hangi geçişin iç hangisinin dış olduğunu fark et; zor olanı ayrıca çalış."], theory: ["Tek sayıda nota/tel çalınca pena yönü her telde değişir, geçişler de iç–dış diye sırayla gelir."], tex: eighths(70, upDown(a3)) },
  ]),
  chapter(P, 5, 2, "Tel Atlama", [
    "Oktav, aynı notanın 12 yarım ses üstüdür; frekansı tam iki katı olduğu için kulak iki notayı 'aynı' duyar.",
    "Oktav kuralı: 6. ve 5. teldeki notanın oktavı iki tel üstte, iki perde ileridedir. 4. ve 3. telde ise Si teli yüzünden üç perde ileridedir.",
  ], [
    { title: "Oktavlar", bpm: 70, description: "Bir tel atlayarak oktav çiftleri: La, Do, Re, Mi.", tips: ["Aradaki teli sol elin işaret parmağıyla sustur."], tex: tex(70, cells(":8", [["5.6", "7.4"], ["8.6", "10.4"], ["5.5", "7.3"], ["7.5", "9.3"]])) },
    { title: "Atlamalı Pentatonik", bpm: 60, description: "1. kutu, telleri birer atlayarak: 6-4, 5-3, 4-2, 3-1.", tips: ["Pena atladığı telin üzerinden kavis çizer; kavis küçük olsun."], tex: eighths(60, (() => {
      const byString = (s: number) => box1.filter((n) => n.endsWith(`.${s}`));
      const up = [6, 4, 5, 3, 4, 2, 3, 1].flatMap(byString);
      return [...up, ...rev(up)];
    })()) },
    { title: "Atlamalı Akor Tonları", bpm: 60, minutes: 2, description: "Re ve Si telleri arasında Am F G E.", tips: ["Sol teline değmeden atla."], theory: ["Am: La–Mi–Do · F: La–Fa–Do · G: Sol–Re–Si · E: Sol#–Mi–Si. Her akorun üç notası."], tex: tex(60, cells(":8", [cell("7.4", "5.2", "10.4", "5.2"), cell("7.4", "6.2", "10.4", "6.2"), cell("5.4", "3.2", "9.4", "3.2"), cell("6.4", "5.2", "9.4", "5.2")])) },
  ]),
  chapter(P, 5, 3, "Akor Arpejleri", [
    "Arpej, akorun notalarını tek tek çalmaktır. Burada her tele tek nota düşer; pena her notada tel değiştirir.",
    "Endülüs kadansı (Am – G – F – E): bas La–Sol–Fa–Mi diye iner. Flamenkodan rock'a pek çok müzikte kullanılır.",
  ], [
    { title: "Am ve C", bpm: 60, description: "Açık Am ve C akorları, sekizlik arpej.", tips: ["Akoru tamamen bas, notalar birbirinin üzerine çınlasın."], theory: ["Am = La–Do–Mi, C = Do–Mi–Sol: iki akor iki nota paylaşır (Do ve Mi)."], tex: tex(60, cells(":8", [["0.5", "2.4", "2.3", "1.2", "0.1", "1.2", "2.3", "2.4"], ["3.5", "2.4", "0.3", "1.2", "0.1", "1.2", "0.3", "2.4"], ["0.5", "2.4", "2.3", "1.2", "0.1", "1.2", "2.3", "2.4"], ["3.5", "2.4", "0.3", "1.2", "0.1", "1.2", "0.3", "2.4"]])) },
    { title: "Endülüs Kadansı", bpm: 60, minutes: 2, description: "Am – G – F – E, sekizlik arpej.", tips: ["F barre akorunda işaret parmağını hafif yana yatır."], tex: tex(60, cells(":8", [["0.5", "2.4", "2.3", "1.2", "0.1", "1.2", "2.3", "2.4"], ["3.6", "2.5", "0.4", "0.3", "0.2", "3.1", "0.2", "0.3"], ["1.6", "3.5", "3.4", "2.3", "1.2", "1.1", "1.2", "2.3"], ["0.6", "2.5", "2.4", "1.3", "0.2", "0.1", "0.2", "1.3"]])) },
    { title: "Endülüs Kadansı – Triole", bpm: 60, minutes: 2, description: "Aynı dizi triole ile: her vuruşa üç nota.", tips: ["Altı notalık kalıp iki vuruşa yayılır."], tex: tex(60, [["0.5", "2.4", "2.3", "1.2", "2.3", "2.4"], ["3.6", "2.5", "0.4", "0.3", "0.4", "2.5"], ["1.6", "3.5", "3.4", "2.3", "3.4", "3.5"], ["0.6", "2.5", "2.4", "1.3", "2.4", "2.5"]].map((c) => measures(":8", alt(repeat(c, 2)), 12, 3)[0])) },
  ]),
  chapter(P, 5, 4, "Pedal Tonu", [
    "Pedal tonu (org noktası): bir nota sabit kalırken melodi onun üstünde değişir. Barok müzikte ve metal riff'lerinde sık kullanılır.",
  ], [
    { title: "Açık Mi Pedalı", bpm: 70, description: "İnce Mi telinde melodi, her notanın arasında açık Mi.", tips: ["Tek telde çalıştığın için tel geçişi yok; odak sol el kaymalarında."], theory: ["Melodi La minör gamında iner ve çıkar: Mi, Re, Do, Si, La …"], tex: tex(70, [[12, 10, 8, 7], [5, 7, 8, 10], [12, 13, 12, 10], [8, 7, 8, 5]].map((b) => `:8 ${alt(b.flatMap((f) => [`${f}.1`, "0.1"])).join(" ")}`)) },
    { title: "Mi Pedalı – İki Tel", bpm: 60, description: "Melodi 1. telde, pedal 2. telde (5. perde Mi).", tips: ["Her notada tel değişiyor: dış pena."], theory: ["Mi, La minörün 5. derecesidir (dominant). Mi pedalı sürekli bir gerilim yaratır ve La'ya dönüşü bekletir."], tex: tex(60, [[13, 12, 10, 8], [7, 8, 10, 12], [13, 15, 13, 12], [10, 8, 7, 8]].map((b) => `:8 ${alt(b.flatMap((f) => [`${f}.1`, "5.2"])).join(" ")}`)) },
    { title: "Barok Pedal", bpm: 55, minutes: 2, description: "On altılıklarla La pedalı (2. tel, 10. perde) üzerinde çıkan melodi.", tips: ["Pedal notasını hafif çal, melodiyi öne çıkar."], theory: ["Bu kalıp Barok dönem keman ve klavsen eserlerinden tanıdık bir dokudur."], tex: tex(55, [[12, 13], [15, 13], [12, 10], [8, 10], [12, 13], [15, 17], [15, 13], [12, 13], [10, 12], [13, 12], [10, 8], [7, 8], [10, 12], [13, 12], [10, 8], [7, 5]].reduce<string[][]>((acc, pair, i) => {
      if (i % 4 === 0) acc.push([]);
      acc[acc.length - 1].push(...pair.flatMap((f) => [`${f}.1`, "10.2"]));
      return acc;
    }, []).map((b) => `:16 ${alt(b).join(" ")}`)) },
  ]),
]);

// ── Bölüm 6: İleri Seviye ────────────────────────────────────────────────────
const dor = tabs(aDorian3);
const hm = tabs(aHarm3);
const run4 = tabs(aMinor4);

/** Akor tonlarından bir ölçü: 1-2-3-4-3-2-1-2 kalıbı */
const arp = (pitches: number[], low = 4, high = 10) => {
  const t = tabs(inPosition(pitches, low, high, 4));
  return [0, 1, 2, 3, 2, 1, 0, 1].map((i) => t[i]);
};
const etudeChords = [
  [57, 60, 64, 69], // Am
  [62, 65, 69, 74], // Dm
  [55, 59, 62, 67], // G
  [60, 64, 67, 72], // C
  [57, 60, 65, 69], // F
  [62, 65, 69, 74], // Dm
  [56, 59, 64, 68], // E
  [57, 60, 64, 69], // Am
];
const etude8 = etudeChords.map((c) => `:8 ${alt(arp(c)).join(" ")}`);
const etude16 = etudeChords.map((c) => `:16 ${alt([...arp(c), ...arp(c)]).join(" ")}`);
const AM_END = ":1 (7.4 5.3 5.2)";

/** Armonik minör sekansı: her akor için gamın verilen basamağından inen dörtlü gruplar */
const hmBar = (start: number) => [0, 1, 2, 3].flatMap((k) => [0, 1, 2, 3].map((j) => hm[start - k - j]));
const finale = [14, 17, 15, 14, 17, 16, 13, 14].map(hmBar);

const s6 = section(6, "İleri Seviye", [
  chapter(P, 6, 0, "Dorian Modu", [
    "Dorian, doğal minörün 6. derecesi yarım ses tizleşmiş halidir: 1 – 2 – b3 – 4 – 5 – 6 – b7.",
    `La Dorian, Sol majörün notalarıyla aynıdır: ${noteList(m(aDorian3))}. Fa# bu modun 'parlak' minör rengidir; Santana ve funk sololarının sesi.`,
  ], [
    { title: "La Dorian – Sekizlik", bpm: 80, description: "3 nota/tel La Dorian, çık ve in.", tips: ["Fa# notalarını (5. telde 9, 2. telde 7. perde) duymaya çalış."], tex: eighths(80, upDown(dor)) },
    { title: "Dorian Dörtlüler", bpm: 60, minutes: 2, description: "Dörtlü gruplarla çık.", tips: ["Her grubun ilk notası vuruşta."], tex: sixteenths(60, groups(dor, 4)) },
    { title: "Dorian Üçlü Aralıklar", bpm: 60, minutes: 2, description: "Dorianda diyatonik üçlüler, çık ve in.", tips: ["Atlamalı notalarda parmakları bir sonraki tele önceden yerleştir."], theory: ["La–Do (küçük üçlü) ve Re–Fa# (büyük üçlü) bu modun karakterini taşır."], tex: sixteenths(60, [...thirds(dor), ...thirds(rev(dor))]) },
  ]),
  chapter(P, 6, 1, "Armonik Minör", [
    "Armonik minör, doğal minörün 7. derecesini yarım ses tizleştirir: La armonik minörde Sol yerine Sol#.",
    "Fa ile Sol# arasındaki artık ikili (3 yarım ses) gama 'Doğulu', neoklasik bir renk verir.",
    "Sol#, La'ya yarım ses uzaklıktadır (yeden). Bu yüzden E (Mi majör) akoru La minöre çok güçlü çözülür.",
  ], [
    { title: "Armonik Minör – Sekizlik", bpm: 70, description: "3 nota/tel La armonik minör, çık ve in.", tips: ["2. telde 6-9-10: artık ikili için parmakları aç."], tex: eighths(70, upDown(hm)) },
    { title: "Armonik Minör – Triole", bpm: 60, minutes: 2, description: "Triole ile aynı gam.", tips: ["Her vuruşun ilk notasını vurgula."], tex: trips(60, upDown(hm)) },
    { title: "İnen Dörtlüler", bpm: 55, minutes: 2, description: "Tepeden dörtlü gruplarla in.", tips: ["Neoklasik sololarda en sık kullanılan kalıp."], tex: sixteenths(55, groups(rev(hm), 4)) },
  ]),
  chapter(P, 6, 2, "Uzun Koşular", [
    "4 nota/tel ile pozisyon değiştirerek sapın büyük bölümünü tek koşuda katedebilirsin: La'dan Do'ya üç oktavdan fazla.",
    "Uzun koşularda kulak, yerini kök notalara göre tutar; her La'yı hafifçe vurgula.",
  ], [
    { title: "4 Nota/Tel – Sekizlik", bpm: 80, description: "La minör, her telde dört nota, 5. perdeden 20. perdeye.", tips: ["Her telin son notasında el bir sonraki pozisyona kayar."], tex: eighths(80, upDown(run4)) },
    { title: "4 Nota/Tel – On Altılık", bpm: 60, minutes: 2, description: "Aynı koşu on altılıklarla.", tips: ["Kaymaları işaret parmağıyla yap."], tex: sixteenths(60, upDown(run4)) },
    { title: "Altılık İniş", bpm: 50, minutes: 2, description: "Tepeden üçlü gruplarla, altılık ritimde in.", tips: ["Her vuruşta iki grup."], tex: sextuplets(50, groups(rev(run4), 3)) },
  ]),
  chapter(P, 6, 3, "Etüt – La Minör", [
    "Akor dizisi: Am – Dm – G – C – F – Dm – E – Am. Kökler çoğunlukla dörtlü aralıklarla ilerler (La→Re→Sol→Do→Fa); en doğal 'akış' hissini veren hareket budur.",
    "Her ölçüde akorun notalarını çalıyorsun. Solo yaparken akor tonlarını hedeflemek, gamda rastgele dolaşmaktan çok daha melodik duyulur.",
  ], [
    { title: "Etüt – Sekizlik", bpm: 70, minutes: 2, description: "Sekiz akorluk etüt, sekizlik notalarla.", tips: ["Akor değişimlerini önceden gör: bir sonraki ölçünün ilk notasına bak."], tex: tex(70, [...etude8, AM_END]) },
    { title: "Etüt – On Altılık", bpm: 55, minutes: 3, description: "Aynı etüt on altılıklarla.", tips: ["Her ölçüde kalıp iki kez döner."], tex: tex(55, [...etude16, AM_END]) },
    { title: "Etüt – Hedef Tempo", bpm: 75, minutes: 3, description: "Etüt hedef tempoda.", tips: ["Hata yaptığın ölçüyü ayrıca döngüye al (oynatıcıda sürükleyerek seç)."], tex: tex(75, [...etude16, AM_END]) },
  ]),
  chapter(P, 6, 4, "Final – Neoklasik Etüt", [
    "Neoklasik metal, Bach ve Paganini'den ilham alan bir çalımdır: armonik minör ve dörtlü sekanslar üzerine kuruludur.",
    "Dm (iv) → E (V) → Am (i): armonik minörün en güçlü kadansı. E akorundaki Sol#, La'ya yarım sesle çözülür.",
  ], [
    { title: "Final – Sekizlik", bpm: 70, minutes: 2, description: "Armonik minörde inen dörtlü gruplar, akor akor.", tips: ["Her akorun ilk notası o akorun bir notası."], tex: tex(70, [...measures(":8", alt(finale.flat()), 8), AM_END]) },
    { title: "Final – On Altılık", bpm: 55, minutes: 3, description: "Aynı etüt on altılıklarla.", tips: ["Zorlanırsan sekizlik sürüme dön."], tex: tex(55, [...finale.map((b) => `:16 ${alt(b).join(" ")}`), AM_END]) },
    { title: "Final – Hedef Tempo", bpm: 80, minutes: 3, description: "Kursun son dersi: neoklasik etüt hedef tempoda.", tips: ["Bunu temiz çalabiliyorsan alternate picking'in tüm temellerine hakimsin."], tex: tex(80, [...finale.map((b) => `:16 ${alt(b).join(" ")}`), AM_END]) },
  ]),
]);

export const alternatePickingCourse: Course = {
  slug: "alternatif-pena",
  title: "Alternate Picking",
  description: "Aşağı-yukarı pena hareketiyle hız ve doğruluk kazan.",
  kind: "technique",
  icon: "⇅",
  guide: [
    "## Alternate Picking nedir?",
    "Her notayı bir öncekinin tersi yönde çalmak: aşağı, yukarı, aşağı, yukarı. Ritim ne olursa olsun pena eli bir saat sarkacı gibi düzenli salınır; vuruşlar aşağı, aralar yukarı düşer.",
    "## Nasıl çalışılır?",
    "Her dersi önce yazan tempoda temiz çal. Ders süresi dolunca tamamlanır; dilersen oynatıcıdaki hız ayarıyla tempoyu adım adım yükselt. Hız temizliğin yan ürünüdür: yavaş ve temiz çalınan her dakika, hızlı ve kirli çalınan on dakikadan değerlidir.",
    "## Kurs planı",
    "Bölüm 1 – Temeller: açık teller, tek tel gamlar, ritim değerleri, kromatik.",
    "Bölüm 2 – Pentatonik: La minör pentatonik kutuları, üçlü ve dörtlü sekanslar, cümleler.",
    "Bölüm 3 – Majör ve minör gamlar: 3 nota/tel kalıpları, sekanslar, diyatonik üçlüler.",
    "Bölüm 4 – Ritim ve kontrol: bölünmeler, vurgu, hız patlamaları, galop.",
    "Bölüm 5 – Tel geçişi: iç ve dış pena, tel atlama, arpej, pedal tonu.",
    "Bölüm 6 – İleri seviye: Dorian, armonik minör, uzun koşular ve iki etüt.",
  ],
  sections: [s1, s2, s3, s4, s5, s6],
};
