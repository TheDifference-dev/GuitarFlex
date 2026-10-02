import type { Exercise, Level, Technique } from "./types.ts";
import {
  AM_3NPS,
  AM_PENTA_BOX1,
  CHORDS as C,
  DOWN,
  POWER as P,
  UP,
  acrossStrings,
  bars,
  chunk,
  fx,
  legato,
  onString,
  pm,
  repeat,
  strokes,
  tex,
  triplets,
} from "./tex.ts";

type ExerciseInput = Omit<Exercise, "id" | "tex"> & { tex: string };

function level(slug: string, n: number, title: string, goal: string, exercises: ExerciseInput[]): Level {
  return {
    level: n,
    title,
    goal,
    exercises: exercises.map((e, i) => ({ ...e, id: `${slug}-${n}-${i + 1}` })),
  };
}

// ───────────────────────────── Kromatik & Isınma ─────────────────────────────

const chromatic: Technique = {
  slug: "kromatik-isinma",
  name: "Kromatik & Isınma",
  icon: "🔥",
  summary: "Parmak bağımsızlığı, sol-sağ el senkronu ve her çalışmadan önce ısınma rutini.",
  levels: [
    level("kromatik-isinma", 1, "Temel", "Dört parmağı tek perdeye bir parmak kuralıyla kullanmak.", [
      {
        title: "1-2-3-4 Kromatik",
        description: "1. perdeden başlayarak her telde dört perdeyi sırayla çal, ardından aynı yoldan geri dön.",
        tips: [
          "Her perdeye ayrı bir parmak: 1. perde işaret, 4. perde serçe parmak.",
          "Bir sonraki notaya geçene kadar parmağı kaldırma.",
          "Hız değil temizlik: her nota net çınlamalı.",
        ],
        tex: tex(60, [
          ...bars(":8", acrossStrings(UP, [1, 2, 3, 4]), 8),
          ...bars(":8", acrossStrings(DOWN, [4, 3, 2, 1]), 8),
        ]),
        startBpm: 60,
        targetBpm: 100,
      },
      {
        title: "5. Pozisyonda Kromatik",
        description: "Aynı kalıbı perdelerin daha dar olduğu 5. pozisyonda çal. Esneme daha az, odak ritimde.",
        tips: ["Başparmağı sapın arkasında, orta parmağın hizasında tut.", "Metronomu açık tutup her vuruşa tam otur."],
        tex: tex(60, [
          ...bars(":8", acrossStrings(UP, [5, 6, 7, 8]), 8),
          ...bars(":8", acrossStrings(DOWN, [8, 7, 6, 5]), 8),
        ]),
        startBpm: 60,
        targetBpm: 110,
      },
    ]),
    level("kromatik-isinma", 2, "Gelişen", "Parmak sırasını değiştirerek koordinasyonu zorlamak.", [
      {
        title: "1-3-2-4 Permütasyonu",
        description: "Parmak sırası 1-3-2-4. Çıkışta bu sırayla, inişte 4-2-3-1 sırasıyla çal.",
        tips: ["Zor olan 3'ten 2'ye dönüş; yavaşla.", "Bileği gevşek tut, gerginlik hissedersen dur."],
        tex: tex(70, [
          ...bars(":8", acrossStrings(UP, [5, 7, 6, 8]), 8),
          ...bars(":8", acrossStrings(DOWN, [8, 6, 7, 5]), 8),
        ]),
        startBpm: 70,
        targetBpm: 120,
      },
      {
        title: "Örümcek Egzersizi",
        description: "Parmaklar ikişer ikişer komşu tellerde yürür: 1 ve 3 alt telde, 2 ve 4 üst telde.",
        tips: ["Parmaklar örümcek bacağı gibi tellere dik basmalı.", "Basılı kalan parmakları kaldırma, hareket sadece sıradaki parmakta."],
        tex: tex(60, bars(":8", [
          ...[6, 5, 4, 3, 2].flatMap((s) => [`5.${s}`, `6.${s - 1}`, `7.${s}`, `8.${s - 1}`]),
          ...[1, 2, 3, 4, 5].flatMap((s) => [`8.${s}`, `7.${s + 1}`, `6.${s}`, `5.${s + 1}`]),
        ], 8)),
        startBpm: 60,
        targetBpm: 100,
      },
    ]),
    level("kromatik-isinma", 3, "Orta", "16'lık notalarda dayanıklılık ve pozisyon kayması.", [
      {
        title: "16'lık Kromatik + Pozisyon Kayması",
        description: "Her telde dört nota çal, bir üst tele geçerken bir perde yukarı kay. İnişte tersini yap.",
        tips: ["Kayma anında elin tamamı hareket etmeli, sadece parmaklar değil.", "İlk notaya hafif vurgu yaparak dörtlükleri hisset."],
        tex: tex(60, bars(":16", [
          ...acrossStrings(UP, (i) => [1 + i, 2 + i, 3 + i, 4 + i]),
          ...acrossStrings(DOWN, (i) => [9 - i, 8 - i, 7 - i, 6 - i]),
        ], 16)),
        startBpm: 60,
        targetBpm: 100,
      },
      {
        title: "1-2-4-3 Döngüsü",
        description: "Çıkışta 1-2-4-3, inişte 4-3-1-2 parmak sırası. Zayıf 3. ve 4. parmakları güçlendirir.",
        tips: ["4'ten 3'e dönüşte serçe parmağı kaldırırken 3. parmak zaten basılı olmalı."],
        tex: tex(70, bars(":16", [
          ...acrossStrings(UP, [5, 6, 8, 7]),
          ...acrossStrings(DOWN, [8, 7, 5, 6]),
        ], 16)),
        startBpm: 70,
        targetBpm: 110,
      },
    ]),
  ],
};

// ───────────────────────────── Alternatif Pena ─────────────────────────────

const melody1 = [
  onString(1, [5, 7, 8, 7, 5, 7, 8, 10]),
  onString(1, [12, 10, 8, 7, 8, 7, 5, 7]),
  onString(1, [5, 7, 8, 10, 12, 13, 12, 10]),
];

const alternatePicking: Technique = {
  slug: "alternatif-pena",
  name: "Alternatif Pena",
  icon: "⇅",
  summary: "Aşağı-yukarı pena hareketiyle hızlı, eşit ve kontrollü çalım.",
  levels: [
    level("alternatif-pena", 1, "Temel", "Pena hareketini küçük ve eşit tutmak.", [
      {
        title: "Açık Telde Aşağı-Yukarı",
        description: "Açık tellerde sekizlik notalar. Her vuruşta aşağı, her 've'de yukarı.",
        tips: ["Pena telin 1-2 mm ötesine geçsin, fazlası enerji kaybı.", "Hareket bilekten gelsin, dirsekten değil."],
        tex: tex(60, [6, 5, 4, 3].map((s) => `:8 ${strokes(repeat([`0.${s}`], 8)).join(" ")}`)),
        startBpm: 60,
        targetBpm: 120,
      },
      {
        title: "Tek Tel Melodi",
        description: "İnce Mi telinde La minör bir melodi. Sol el pozisyon değiştirirken sağ el ritmi bozmamalı.",
        tips: ["Pena yönü hiç bozulmaz: aşağı-yukarı-aşağı-yukarı.", "Son notayı tam süresince tut."],
        tex: tex(70, [
          ...melody1.map((b) => `:8 ${strokes(b).join(" ")}`),
          `:8 ${strokes(onString(1, [8, 7, 5, 7])).join(" ")} :2 5.1`,
        ]),
        startBpm: 70,
        targetBpm: 130,
      },
    ]),
    level("alternatif-pena", 2, "Gelişen", "Teller arası geçişlerde pena yönünü korumak.", [
      {
        title: "La Minör Pentatonik – 1. Kutu",
        description: "Rock ve blues'un temel dizisi. Çıkıp aynı yoldan inerek sekizliklerle çal.",
        tips: ["Tel değiştirirken pena yönü kalıba göre değişebilir, kural: aşağı-yukarı sırası asla bozulmaz.", "Bu kutuyu ezberle; pek çok solonun temeli."],
        tex: tex(70, bars(":8", strokes([...AM_PENTA_BOX1, ...[...AM_PENTA_BOX1].reverse()]), 8)),
        startBpm: 70,
        targetBpm: 130,
      },
      {
        title: "Tel Geçişi",
        description: "İki tel arasında gidip gelen kalıplar. İç ve dış pena geçişlerini çalıştırır.",
        tips: ["Pena tellerin arasına 'gömülmesin', tellerin üzerinden süzülsün."],
        tex: tex(70, [
          ["7.3", "5.2", "8.2", "5.2"],
          ["5.3", "5.2", "8.2", "5.2"],
          ["7.4", "5.3", "7.3", "5.3"],
          ["5.4", "5.3", "7.3", "5.3"],
        ].map((g) => `:8 ${strokes(repeat(g, 2)).join(" ")}`)),
        startBpm: 70,
        targetBpm: 120,
      },
    ]),
    level("alternatif-pena", 3, "Orta", "Sekanslar ve 3 nota/tel dizilerle hız.", [
      {
        title: "Pentatonik 4'lü Sekans",
        description: "Pentatonik diziyi dörtlü gruplar halinde çal: 1-2-3-4, 2-3-4-5... İnişte aynısı tersten.",
        tips: ["Her grubun ilk notasına hafif vurgu yap.", "Önce 60 BPM'de grupları ezberle."],
        tex: (() => {
          const desc = [...AM_PENTA_BOX1].reverse();
          const groups = (arr: string[]) => Array.from({ length: 8 }, (_, i) => arr.slice(i, i + 4)).flat();
          return tex(60, bars(":16", strokes([...groups(AM_PENTA_BOX1), ...groups(desc)]), 16));
        })(),
        startBpm: 60,
        targetBpm: 110,
      },
      {
        title: "La Doğal Minör – 3 Nota/Tel",
        description: "Her telde üç nota. Üçleme ritmiyle çalınca her vuruş farklı pena yönüyle başlar.",
        tips: ["Üçlemelerde vurgu her vuruşta bir aşağı bir yukarı penaya düşer; bunu duymaya çalış."],
        tex: tex(60, bars(":8", triplets(strokes([...AM_3NPS, ...[...AM_3NPS].reverse()])), 12)),
        startBpm: 60,
        targetBpm: 110,
      },
    ]),
  ],
};

// ───────────────────────────── Akorlar ─────────────────────────────

const strum = (chord: string, n: number) => repeat([fx(chord, "bd")], n).join(" ");

const chords: Technique = {
  slug: "akorlar",
  name: "Akorlar",
  icon: "♫",
  summary: "Açık akorlar, barre akorlar ve akorlar arası hızlı geçiş.",
  levels: [
    level("akorlar", 1, "Temel", "İlk açık akorlar ve temiz ses.", [
      {
        title: "Em ve Am",
        description: "İki kolay akor arasında geçiş. Her ölçüde bir kez vur ve sesin sönmesini dinle.",
        tips: ["Em'den Am'ye geçerken 2. ve 3. parmak aynı şekli korur, sadece bir tel aşağı kayar.", "Her teli tek tek çalıp boğuk tel var mı kontrol et."],
        tex: tex(60, [C.Em, C.Am, C.Em, C.Am].map((c) => `:1 ${strum(c, 1)}`)),
        startBpm: 60,
        targetBpm: 80,
      },
      {
        title: "G – C – D",
        description: "Yüzlerce şarkının akor dizisi. Ölçü başına iki vuruş.",
        tips: ["Geçişi vuruştan önce bitir; parmakları havada toplayıp birlikte indir."],
        tex: tex(60, [C.G, C.C, C.D, C.G].map((c) => `:2 ${strum(c, 2)}`)),
        startBpm: 60,
        targetBpm: 90,
      },
    ]),
    level("akorlar", 2, "Gelişen", "Daha hızlı geçişler, dörtlük vuruşlar.", [
      {
        title: "A – D – E",
        description: "Majör akorlarla klasik rock dizisi. Ölçü başına dört vuruş.",
        tips: ["A akorunda üç parmak tek perdeye sığar; parmak uçlarıyla bas."],
        tex: tex(70, [C.A, C.D, C.E, C.A].map((c) => `:4 ${strum(c, 4)}`)),
        startBpm: 70,
        targetBpm: 110,
      },
      {
        title: "Am – Dm – E",
        description: "Minör tonda en yaygın kadans.",
        tips: ["Dm'de 1. parmak ince Mi telinin 1. perdesinde; tel tam bassın."],
        tex: tex(70, [C.Am, C.Dm, C.E, C.Am].map((c) => `:4 ${strum(c, 4)}`)),
        startBpm: 70,
        targetBpm: 110,
      },
    ]),
    level("akorlar", 3, "Orta", "Barre akorlar.", [
      {
        title: "C – Am – F – G",
        description: "Fa majör barre akoruyla en popüler pop dizisi.",
        tips: ["Barre'de işaret parmağının yan kenarını kullan.", "Baskıyı parmaktan değil, kolun ağırlığından al."],
        tex: tex(70, [C.C, C.Am, C.F, C.G].map((c) => `:4 ${strum(c, 4)}`)),
        startBpm: 70,
        targetBpm: 110,
      },
      {
        title: "Bm – G – D – A",
        description: "Si minör barre (La şekli) ile geçişler.",
        tips: ["Bm'de kalın Mi teli çalınmaz; sağ el 5. telden başlamalı."],
        tex: tex(70, [C.Bm, C.G, C.D, C.A].map((c) => `:4 ${strum(c, 4)}`)),
        startBpm: 70,
        targetBpm: 110,
      },
    ]),
  ],
};

// ───────────────────────────── Ritim & Tarama ─────────────────────────────

const D = (c: string) => fx(c, "bd");
const U = (c: string) => fx(c, "bu");

const rhythm: Technique = {
  slug: "ritim-tarama",
  name: "Ritim & Tarama",
  icon: "🥁",
  summary: "Sağ el ritim kalıpları, susturulmuş vuruşlar ve senkop.",
  levels: [
    level("ritim-tarama", 1, "Temel", "Sağ el sürekli hareket eder, ritmi bozmaz.", [
      {
        title: "Dörtlük Aşağı Vuruşlar",
        description: "Her vuruşta bir aşağı tarama.",
        tips: ["Metronomla birebir aynı anda vur; önden ya da geriden gelme."],
        tex: tex(60, [C.G, C.C, C.D, C.G].map((c) => `:4 ${repeat([D(c)], 4).join(" ")}`)),
        startBpm: 60,
        targetBpm: 100,
      },
      {
        title: "Sekizlik Aşağı-Yukarı",
        description: "Vuruşlarda aşağı, aralarda yukarı tarama.",
        tips: ["Yukarı taramada sadece ince 3-4 teli çalmak yeterli."],
        tex: tex(60, [C.Em, C.Am, C.C, C.D].map((c) => `:8 ${repeat([D(c), U(c)], 4).join(" ")}`)),
        startBpm: 60,
        targetBpm: 100,
      },
    ]),
    level("ritim-tarama", 2, "Gelişen", "Boşluklu kalıplar ve susturma.", [
      {
        title: "Pop Ritmi",
        description: "A, A-Y, -Y, A-Y kalıbı. Boş vuruşta el yine aşağı iner ama tellere dokunmaz.",
        tips: ["Sağ el hiç durmaz; sadece bazı vuruşlarda tele değmez.", "Yüksek sesle say: 1, 2-ve, (3)-ve, 4-ve."],
        tex: tex(70, [C.G, C.Em, C.C, C.D].map((c) => `:4 ${D(c)} :8 ${D(c)} ${U(c)} r ${U(c)} ${D(c)} ${U(c)}`)),
        startBpm: 70,
        targetBpm: 110,
      },
      {
        title: "Susturulmuş Vuruş (Chuck)",
        description: "2. ve 4. vuruşta sol eli gevşetip telleri sustur; trampet gibi kuru bir ses çıkar.",
        tips: ["Sol el parmakları teli bırakır ama tellere değmeye devam eder."],
        tex: tex(70, [C.Am, C.Em, C.Am, C.Em].map((c) =>
          `:8 ${D(c)} ${U(c)} ${D(C.MUTE6)} ${U(c)} ${D(c)} ${U(c)} ${D(C.MUTE6)} ${U(c)}`)),
        startBpm: 70,
        targetBpm: 110,
      },
    ]),
    level("ritim-tarama", 3, "Orta", "16'lık funk ve arka vuruş.", [
      {
        title: "16'lık Funk Ritmi",
        description: "Mi9 akoruyla 16'lık kalıp. Akor sesleri ile susturulmuş vuruşlar iç içe.",
        tips: ["Sağ el 16'lık aşağı-yukarı hareketini kesintisiz sürdürür.", "Bileği gevşek tut; funk ritmi bilekten gelir."],
        tex: tex(80, repeat([
          `:16 ${D(C.E9)} ${U(C.MUTE4)} ${D(C.MUTE4)} ${U(C.E9)} ${D(C.MUTE4)} ${U(C.E9)} ${D(C.MUTE4)} ${U(C.MUTE4)} ${D(C.E9)} ${U(C.MUTE4)} ${D(C.MUTE4)} ${U(C.E9)} ${D(C.MUTE4)} ${U(C.E9)} ${D(C.MUTE4)} ${U(C.MUTE4)}`,
        ], 4)),
        startBpm: 70,
        targetBpm: 100,
      },
      {
        title: "Arka Vuruş (Ska / Reggae)",
        description: "Sadece 've'lerde kısa, yukarı vuruşlar. Ana vuruşlar boş.",
        tips: ["Vuruştan hemen sonra sol eli gevşetip sesi kes; kısa ve kesik olmalı."],
        tex: tex(80, [C.C, C.Am, C.F, C.G].map((c) => `:8 ${repeat(["r", U(c)], 4).join(" ")}`)),
        startBpm: 80,
        targetBpm: 130,
      },
    ]),
  ],
};

// ───────────────────────────── Palm Mute ─────────────────────────────

const E_PM = "0.6{pm}";
const gallop = (n: string) => `:8 ${n} :16 ${n} ${n}`;

const palmMute: Technique = {
  slug: "palm-mute",
  name: "Palm Mute",
  icon: "✋",
  summary: "Avuç içiyle susturarak rock ve metalin vurucu ritimleri.",
  levels: [
    level("palm-mute", 1, "Temel", "Doğru susturma miktarını bulmak.", [
      {
        title: "Açık Mi Telinde Palm Mute",
        description: "Avuç içinin kenarını köprünün hemen önünde tellere koy ve sekizliklerle çal.",
        tips: ["El köprüye çok yakınsa ses açılır, çok uzaksa tamamen boğulur; arayı bul.", "Son ölçüde eli kaldırıp akorun açık sesini duy."],
        tex: tex(80, [
          ...repeat([`:8 ${repeat([E_PM], 8).join(" ")}`], 3),
          `:8 ${repeat([E_PM], 4).join(" ")} :2 ${P.E5}`,
        ]),
        startBpm: 80,
        targetBpm: 140,
      },
      {
        title: "Power Chord + Palm Mute",
        description: "Mi5, Sol5 ve La5 power chord'larını susturarak çal.",
        tips: ["Power chord'da 1. ve 3. parmak kullan, diğer teller sol elle sustursun."],
        tex: tex(80, [
          ...[P.E5, P.G5, P.A5].map((c) => `:8 ${repeat([pm(c)], 8).join(" ")}`),
          `:8 ${repeat([pm(P.E5)], 4).join(" ")} :2 ${P.E5}`,
        ]),
        startBpm: 80,
        targetBpm: 130,
      },
    ]),
    level("palm-mute", 2, "Gelişen", "Gallop ritmi ve vurgu kontrastı.", [
      {
        title: "Gallop Ritmi",
        description: "Bir sekizlik + iki onaltılık: dörtnala giden at sesi. Heavy metalin imza ritmi.",
        tips: ["Pena: aşağı, aşağı-yukarı.", "Üç notanın arasındaki boşluk eşit değil; sekizlik uzun, onaltılıklar kısa."],
        tex: tex(80, [
          ...repeat([repeat([gallop(E_PM)], 4).join(" ")], 2),
          repeat([gallop(pm(P.G5))], 4).join(" "),
          repeat([gallop(pm(P.A5))], 4).join(" "),
        ]),
        startBpm: 80,
        targetBpm: 150,
      },
      {
        title: "Susturulmuş ve Açık Kontrastı",
        description: "Susturulmuş notalardan sonra açık power chord vurguları.",
        tips: ["Vurgu anında eli tellerden kaldır, sonra hemen geri koy."],
        tex: tex(80, [
          [P.G5, P.A5],
          [P.D5, P.C5],
          [P.G5, P.A5],
          [P.C5, P.D5],
        ].map(([a, b]) => `:8 ${repeat([E_PM], 6).join(" ")} ${a} ${b}`)),
        startBpm: 80,
        targetBpm: 140,
      },
    ]),
    level("palm-mute", 3, "Orta", "16'lık chug ve riff.", [
      {
        title: "16'lık Chug",
        description: "Sürekli 16'lık susturulmuş notalar, araya açık power chord'lar.",
        tips: ["Sağ el kesintisiz aşağı-yukarı; yorulursan hızı düşür, kolu sıkma."],
        tex: tex(80, repeat([
          `:16 ${repeat([E_PM], 16).join(" ")}`,
          `:16 ${repeat([E_PM], 12).join(" ")} ${repeat([P.F5], 2).join(" ")} ${repeat([P.G5], 2).join(" ")}`,
        ], 2)),
        startBpm: 70,
        targetBpm: 130,
      },
      {
        title: "Frig Riff",
        description: "Mi Frig tonunda, susturulmuş kalın tel ile açık notaların değiştiği bir riff.",
        tips: ["Açık notalarda palm mute'u kaldırma; sadece eli biraz gevşet."],
        tex: tex(80, [
          ...repeat([`:16 ${[1, 3, 5, 6].map((f) => `${E_PM} ${E_PM} ${f}.6 ${E_PM}`).join(" ")}`], 3),
          `:16 ${repeat([E_PM], 4).join(" ")} :4 ${P.F5} ${P.G5} ${P.E5}`,
        ]),
        startBpm: 70,
        targetBpm: 130,
      },
    ]),
  ],
};

// ───────────────────────────── Legato ─────────────────────────────

const pair = (s: number, a: number, b: number) => [fx(`${a}.${s}`, "h"), `${b}.${s}`];

const legatoTechnique: Technique = {
  slug: "legato",
  name: "Legato",
  icon: "〰",
  summary: "Hammer-on ve pull-off ile akıcı, bağlı cümleler.",
  levels: [
    level("legato", 1, "Temel", "Hammer-on ve pull-off'u ayrı ayrı oturtmak.", [
      {
        title: "Hammer-on Çiftleri",
        description: "İlk notayı pena ile çal, ikinciyi parmakla 'çekiç gibi' vurarak çıkar.",
        tips: ["Parmak perdenin hemen arkasına, hızlı ve dik insin.", "İki notanın ses seviyesi eşit olmalı."],
        tex: tex(60, [
          `:8 ${[6, 5, 4, 3].flatMap((s) => pair(s, 5, 7)).join(" ")}`,
          `:8 ${[2, 1, 1, 2].flatMap((s) => pair(s, 5, 8)).join(" ")}`,
          `:8 ${[3, 4, 5, 6].flatMap((s) => pair(s, 5, 7)).join(" ")}`,
        ]),
        startBpm: 60,
        targetBpm: 120,
      },
      {
        title: "Pull-off Çiftleri",
        description: "Üstteki notayı çal, parmağı teli hafifçe aşağı çekerek bırak; alttaki nota çınlasın.",
        tips: ["Parmağı yukarı kaldırma, teli yana doğru 'çek'.", "Alttaki parmak önceden basılı olmalı."],
        tex: tex(60, [
          `:8 ${[1, 2, 2, 1].flatMap((s) => pair(s, 8, 5)).join(" ")}`,
          `:8 ${[3, 4, 5, 6].flatMap((s) => pair(s, 7, 5)).join(" ")}`,
          `:8 ${[6, 5, 4, 3].flatMap((s) => pair(s, 7, 5)).join(" ")}`,
        ]),
        startBpm: 60,
        targetBpm: 120,
      },
    ]),
    level("legato", 2, "Gelişen", "Tel başına üç nota ve trill.", [
      {
        title: "Üçlü Legato",
        description: "Her telde ilk nota penayla, diğer ikisi legato. Çıkışta hammer-on, inişte pull-off.",
        tips: ["Penayı sadece tel değiştirirken kullan.", "Üçlemenin üç notası eşit uzunlukta olmalı."],
        tex: tex(60, bars(":8", triplets([
          ...chunk(AM_3NPS, 3).flatMap(legato),
          ...chunk([...AM_3NPS].reverse(), 3).flatMap(legato),
        ]), 12)),
        startBpm: 60,
        targetBpm: 110,
      },
      {
        title: "Trill",
        description: "İki nota arasında sürekli hammer-on / pull-off. Dayanıklılık egzersizi.",
        tips: ["Kol değil parmak çalışsın; elin geri kalanı sabit.", "Ritim 16'lık; metronomla saymayı bırakma."],
        tex: tex(60, [
          [3, 5, 7],
          [3, 7, 9],
          [2, 5, 8],
          [1, 5, 8],
        ].map(([s, a, b]) => `:16 ${legato(repeat([`${a}.${s}`, `${b}.${s}`], 8)).join(" ")}`)),
        startBpm: 60,
        targetBpm: 120,
      },
    ]),
    level("legato", 3, "Orta", "Pentatonik ve 3 nota/tel legato koşuları.", [
      {
        title: "Pentatonik Legato İnişi",
        description: "1. ve 2. pentatonik kutuda pull-off'larla inen üçleme koşusu.",
        tips: ["Her telde ilk nota penalı, ikincisi pull-off.", "Son notada vibrato yap."],
        tex: (() => {
          const box1 = ["8.1", "5.1", "8.2", "5.2", "7.3", "5.3", "7.4", "5.4", "7.5", "5.5", "8.6", "5.6"];
          const box2 = ["10.1", "8.1", "10.2", "8.2", "9.3", "7.3", "10.4", "7.4", "10.5", "7.5", "10.6", "8.6"];
          const run = (b: string[]) => `:8 ${triplets(b.map((n, i) => (i % 2 === 0 ? fx(n, "h") : n))).join(" ")}`;
          return tex(60, [run(box1), run(box2), run(box1), ":1 5.6{v}"]);
        })(),
        startBpm: 60,
        targetBpm: 110,
      },
      {
        title: "3 Nota/Tel Legato Koşusu",
        description: "La doğal minörde altılık (16'lık sextuplet) legato koşusu.",
        tips: ["Vuruş başlarını hisset: her altı notada bir vuruş.", "Önce yarı hızda, notaların eşitliğine odaklan."],
        tex: (() => {
          const asc = chunk(AM_3NPS, 3).flatMap(legato);
          const desc = chunk([...AM_3NPS].reverse(), 3).flatMap(legato);
          return tex(50, bars(":16", repeat([...asc, ...desc], 2).map((n) => fx(n, "tu 6")), 24));
        })(),
        startBpm: 50,
        targetBpm: 90,
      },
    ]),
  ],
};

// ───────────────────────────── Bend & Vibrato ─────────────────────────────

const bendVibrato: Technique = {
  slug: "bend-vibrato",
  name: "Bend & Vibrato",
  icon: "↗",
  summary: "Teli bükerek doğru perdeye ulaşmak ve notaya can veren vibrato.",
  levels: [
    level("bend-vibrato", 1, "Temel", "Kontrollü vibrato ve yarım ton bend.", [
      {
        title: "Vibrato Kontrolü",
        description: "Uzun notalarda teli düzenli aralıklarla hafifçe büküp bırak.",
        tips: ["Hareket parmaktan değil, bilekten dönen bir hareketle gelsin.", "Hız ve genişlik sabit olmalı."],
        tex: tex(70, [
          ":2 5.1{v} 8.1{v}",
          ":2 5.2{v} 8.2{v}",
          ":2 7.3{v} 5.3{v}",
          ":1 5.1{v}",
        ]),
        startBpm: 70,
        targetBpm: 70,
      },
      {
        title: "Yarım Ton Bend",
        description: "Önce hedef notayı çal, sonra bir perde aşağıdan bükerek aynı sese ulaş.",
        tips: ["Bend yaparken arkadaki parmaklar da teli desteklesin.", "Kulakla karşılaştır: iki ses aynı mı?"],
        tex: tex(70, [
          ":4 9.2 r 8.2{b (0 2)} r",
          ":4 6.3 r 5.3{b (0 2)} r",
          ":4 6.1 r 5.1{b (0 2)} r",
          ":1 8.2{b (0 2) v}",
        ]),
        startBpm: 70,
        targetBpm: 70,
      },
    ]),
    level("bend-vibrato", 2, "Gelişen", "Tam ton bend ve bırakma.", [
      {
        title: "Tam Ton Bend",
        description: "İki perde yukarıdaki hedef notayı çal, ardından bend ile aynı perdeye ulaş.",
        tips: ["Tam ton bend için üç parmakla destek ver.", "Hedefi geçme (overbend) ya da altında kalma."],
        tex: tex(70, [
          ":4 9.3 r 7.3{b (0 4)} r",
          ":4 10.2 r 8.2{b (0 4)} r",
          ":4 7.1 r 5.1{b (0 4)} r",
          ":2 7.3{b (0 4)} 8.2{b (0 4)}",
        ]),
        startBpm: 70,
        targetBpm: 70,
      },
      {
        title: "Bend & Bırak",
        description: "Teli bük, hedefte tut, kontrollü şekilde başlangıç perdesine geri bırak.",
        tips: ["Bırakırken ses kesilmemeli; parmak teli kontrol ederek iner."],
        tex: tex(70, [
          ":4 7.3{b (0 4 0)} 5.3 7.3{b (0 4 0)} 5.3",
          ":4 8.2{b (0 4 0)} 5.2 8.2{b (0 4 0)} 5.2",
          ":4 8.1{b (0 4 0)} 5.1 8.1{b (0 4 0)} 5.1",
          ":1 5.1{v}",
        ]),
        startBpm: 70,
        targetBpm: 90,
      },
    ]),
    level("bend-vibrato", 3, "Orta", "Unison bend ve blues cümleleri.", [
      {
        title: "Unison Bend",
        description: "Alttaki teli büküp üstteki telin sesine eşitle. İki ses tek ses gibi duyulmalı.",
        tips: ["Üst teldeki notayı serçe parmağın değil, işaret parmağın tutsun.", "Eşleşme anında sesteki 'dalgalanma' kaybolur."],
        tex: tex(70, [
          ":2 (7.3{b (0 4)} 5.2) (7.3{b (0 4)} 5.2)",
          ":2 (10.2{b (0 4)} 7.1) (10.2{b (0 4)} 7.1)",
          ":4 (7.3{b (0 4)} 5.2) 5.2 (10.2{b (0 4)} 7.1) 7.1",
          ":1 (7.3{b (0 4) v} 5.2{v})",
        ]),
        startBpm: 70,
        targetBpm: 80,
      },
      {
        title: "Blues Bend Cümlesi",
        description: "La minör pentatonikte bend, bırakma ve vibratoyu birleştiren bir cümle.",
        tips: ["Cümle sonu notalarına geniş vibrato.", "Bendlerde doğru perdeyi bulmak hızdan önemli."],
        tex: tex(70, [
          ":8 5.1 8.2{b (0 4)} 5.1 8.1 5.1 8.2{b (0 4 0)} 5.2 7.3",
          ":8 7.3{b (0 4 0)} 5.3 7.4 5.4 :2 7.5{v}",
          ":8 5.1 8.2{b (0 4)} 5.1 8.1 5.1 8.2{b (0 4 0)} 5.2 7.3",
          ":8 8.1 5.1 8.2 5.2 :2 7.4{v}",
        ]),
        startBpm: 70,
        targetBpm: 100,
      },
    ]),
  ],
};

// ───────────────────────────── Slide ─────────────────────────────

const slide: Technique = {
  slug: "slide",
  name: "Slide",
  icon: "⟿",
  summary: "Perdeler arasında kayarak bağlı geçişler ve pozisyon değiştirme.",
  levels: [
    level("slide", 1, "Temel", "Slide sırasında baskıyı sabit tutmak.", [
      {
        title: "Legato Slide",
        description: "İlk notayı çal, parmağı kaldırmadan hedef perdeye kay.",
        tips: ["Baskı azalırsa ses kesilir; çok artarsa kayma zorlaşır.", "Hedef perdede tam dur, geçme."],
        tex: tex(60, [
          ":4 5.3{sl} 7.3 7.3{sl} 9.3",
          ":4 9.3{sl} 7.3 7.3{sl} 5.3",
          ":4 5.2{sl} 8.2 8.2{sl} 10.2",
          ":4 10.2{sl} 8.2 8.2{sl} 5.2",
        ]),
        startBpm: 60,
        targetBpm: 100,
      },
      {
        title: "Aşağıdan Kayarak Giriş",
        description: "Notaya birkaç perde aşağıdan kayarak gir. Blues'ta çok kullanılır.",
        tips: ["Başlangıç perdesi belirsizdir; önemli olan hedefe zamanında varmak."],
        tex: tex(60, [
          ":4 5.3{sib} r 7.3{sib} r",
          ":4 5.2{sib} r 8.2{sib} r",
          ":4 5.1{sib} r 8.1{sib} r",
          ":1 5.1{sib v}",
        ]),
        startBpm: 60,
        targetBpm: 90,
      },
    ]),
    level("slide", 2, "Gelişen", "Slide ile pozisyon değiştirme.", [
      {
        title: "Kutudan Kutuya Geçiş",
        description: "Pentatonik 1. kutudan 2. kutuya Sol telinde kayarak geç ve geri dön.",
        tips: ["Kayan parmak 3. parmak olmalı; varışta el yeni pozisyona oturur."],
        tex: tex(70, [
          ":8 5.6 8.6 5.5 7.5 5.4 7.4 5.3 7.3{sl}",
          ":8 9.3 8.2 10.2 8.1 10.1{sl} 12.1 10.1 8.1",
          ":8 10.2 8.2 9.3{sl} 7.3 5.3 7.4 5.4 7.5",
          ":8 5.5 8.6 :4 5.6 :2 r",
        ]),
        startBpm: 70,
        targetBpm: 120,
      },
      {
        title: "Shift Slide",
        description: "İlk notayı çal, kay ve hedef notayı yeniden penala.",
        tips: ["Legato slide'dan farkı: varışta nota tekrar çalınır."],
        tex: tex(70, [
          ":4 5.2{ss} 8.2 8.2{ss} 10.2",
          ":4 10.2{ss} 8.2 8.2{ss} 5.2",
          ":4 5.1{ss} 8.1 8.1{ss} 10.1",
          ":4 10.1{ss} 8.1 :2 5.1{v}",
        ]),
        startBpm: 70,
        targetBpm: 110,
      },
    ]),
    level("slide", 3, "Orta", "Çift nota slide ve uzun cümleler.", [
      {
        title: "Çift Nota (Double-stop) Slide",
        description: "İki teli birlikte basıp kaydır. Rock'n'roll ve blues soloların klasik hareketi.",
        tips: ["İki tel tek parmakla (barre) ya da iki parmakla basılabilir; ikisi de eşit baskı almalı."],
        tex: tex(70, [
          ":4 (5.2{sl} 5.1{sl}) (8.2 8.1) (8.2{sl} 8.1{sl}) (10.2 10.1)",
          ":4 (10.2{sl} 10.1{sl}) (8.2 8.1) (8.2{sl} 8.1{sl}) (5.2 5.1)",
          ":4 (5.4{sl} 5.3{sl}) (7.4 7.3) (7.4{sl} 7.3{sl}) (5.4 5.3)",
          ":1 (5.2{v} 5.1{v})",
        ]),
        startBpm: 70,
        targetBpm: 110,
      },
      {
        title: "Uzun Slide Cümlesi",
        description: "Sapın boyunca kayarak dört pozisyonu birleştiren La minör cümle.",
        tips: ["Kaymadan sonraki notalar parmak düzenini değiştirir; önce yavaşta ezberle."],
        tex: tex(70, [
          ":8 5.1 8.1 5.2 8.2{sl} 10.2 8.2 10.2{sl} 12.2",
          ":8 12.1 10.1 12.2 10.2 9.3{sl} 7.3 5.3 7.3",
          ":8 5.4 7.4 5.4 7.3{sl} 9.3 7.3 5.3 7.4",
          ":4 7.4 5.4 :2 7.5{v}",
        ]),
        startBpm: 70,
        targetBpm: 110,
      },
    ]),
  ],
};

// ───────────────────────────── Arpej ─────────────────────────────

const arpeggio: Technique = {
  slug: "arpej",
  name: "Arpej",
  icon: "⚟",
  summary: "Akor notalarını tek tek çalarak melodik eşlik ve solo cümleleri.",
  levels: [
    level("arpej", 1, "Temel", "Açık akorları tel tel çalmak.", [
      {
        title: "Açık Akor Arpejleri",
        description: "Akoru bas ve notalarını sırayla çal: Am – C – G – E.",
        tips: ["Akor şeklini ölçü boyunca bırakma.", "Bas notası (ilk nota) akorun kök sesi."],
        tex: tex(60, [
          ":8 0.5 2.4 2.3 1.2 0.1 1.2 2.3 2.4",
          ":8 3.5 2.4 0.3 1.2 0.1 1.2 0.3 2.4",
          ":8 3.6 2.5 0.4 0.3 0.2 3.1 0.2 0.3",
          ":8 0.6 2.5 2.4 1.3 0.2 0.1 0.2 1.3",
        ]),
        startBpm: 60,
        targetBpm: 110,
      },
      {
        title: "Tınlayan Arpej (Let Ring)",
        description: "Notalar birbirinin üzerine çınlasın: Em – C – G – D.",
        tips: ["Parmak uçlarıyla bas; komşu teli susturma."],
        tex: tex(60, [
          ["0.6", "2.5", "2.4", "0.3", "0.2", "0.1", "0.2", "0.3"],
          ["3.5", "2.4", "0.3", "1.2", "0.1", "1.2", "0.3", "2.4"],
          ["3.6", "2.5", "0.4", "0.3", "0.2", "3.1", "0.2", "0.3"],
          ["0.4", "2.3", "3.2", "2.1", "3.2", "2.3", "0.4", "2.3"],
        ].map((b) => `:8 ${b.map((n) => fx(n, "lr")).join(" ")}`)),
        startBpm: 60,
        targetBpm: 100,
      },
    ]),
    level("arpej", 2, "Gelişen", "Üç telli triadlar ve beş telli kalıp.", [
      {
        title: "3 Telli Triad Arpejleri",
        description: "İnce üç telde Am – F – C – G triadları.",
        tips: ["Triad = kök, üçlü, beşli. Hangi notanın hangisi olduğunu bulmaya çalış."],
        tex: tex(70, [
          ["5.3", "5.2", "5.1", "5.2"],
          ["5.3", "6.2", "5.1", "6.2"],
          ["5.3", "5.2", "3.1", "5.2"],
          ["4.3", "3.2", "3.1", "3.2"],
        ].map((b) => `:8 ${repeat(b, 2).join(" ")}`)),
        startBpm: 70,
        targetBpm: 130,
      },
      {
        title: "5 Telli Minör Arpej",
        description: "La minör ve Re minör arpejleri beş tel üzerinde, penayla tek tek çal.",
        tips: ["Aynı perdedeki iki notada parmağı yuvarla ya da iki parmak kullan; notalar birbirine karışmasın."],
        tex: (() => {
          const am = ["12.5", "14.4", "14.3", "13.2", "12.1", "13.2", "14.3", "14.4"];
          const dm = ["5.5", "7.4", "7.3", "6.2", "5.1", "6.2", "7.3", "7.4"];
          return tex(50, [am, am, dm, am].map((b) => `:16 ${repeat(b, 2).join(" ")}`));
        })(),
        startBpm: 50,
        targetBpm: 100,
      },
    ]),
    level("arpej", 3, "Orta", "Yedili akor arpejleri.", [
      {
        title: "Yedili Akor Arpejleri",
        description: "Am7 – Dm7 – G7 – Cmaj7 arpejleri. Caz ve füzyonun temel dili.",
        tips: ["Yedili = triad + 7. derece. Her akorda 7. dereceyi bul ve vurgula."],
        tex: tex(60, [
          ":8 5.6 8.6 7.5 5.4 7.4 5.3 5.2 8.2",
          ":8 5.5 8.5 7.4 5.3 7.3 6.2 5.1 8.1",
          ":8 3.6 2.5 5.5 3.4 5.4 4.3 3.2 1.1",
          ":8 3.5 2.4 5.4 4.3 5.3 5.2 7.1 5.2",
        ]),
        startBpm: 60,
        targetBpm: 110,
      },
    ]),
  ],
};

// ───────────────────────────── Economy Pena ─────────────────────────────

const DUD = ["sd", "su", "sd"] as const;
const UDU = ["su", "sd", "su"] as const;

const economy: Technique = {
  slug: "economy-pena",
  name: "Economy Pena",
  icon: "↯",
  summary: "Tel değiştirirken pena yönünü koruyarak daha az hareketle hız.",
  levels: [
    level("economy-pena", 1, "Temel", "Tel geçişinde 'kaydırma' hareketi.", [
      {
        title: "3 Nota/Tel Çıkış",
        description: "Her tel aşağı-yukarı-aşağı. Üst tele geçerken pena aynı yönde devam eder.",
        tips: ["Tel geçişinde iki aşağı vuruş tek bir akıcı hareket olmalı."],
        tex: tex(60, bars(":8", triplets(strokes(repeat(AM_3NPS, 2), [...DUD])), 12)),
        startBpm: 60,
        targetBpm: 110,
      },
      {
        title: "3 Nota/Tel İniş",
        description: "Her tel yukarı-aşağı-yukarı. Alt tele geçerken pena yukarı yönde devam eder.",
        tips: ["İnişteki yukarı kaydırma çıkıştakinden zor gelir; yavaş başla."],
        tex: tex(60, bars(":8", triplets(strokes(repeat([...AM_3NPS].reverse(), 2), [...UDU])), 12)),
        startBpm: 60,
        targetBpm: 110,
      },
    ]),
    level("economy-pena", 2, "Gelişen", "Çıkış ve inişi birleştirmek.", [
      {
        title: "Çıkış + İniş",
        description: "Diziyi economy pena ile çık, tepede yön değiştirip aynı mantıkla in.",
        tips: ["Tepe noktasında pena yönü değişir; burada ritim kaymasın."],
        tex: tex(60, bars(":8", triplets([
          ...strokes(AM_3NPS, [...DUD]),
          ...strokes([...AM_3NPS].reverse(), [...UDU]),
        ]), 12)),
        startBpm: 60,
        targetBpm: 120,
      },
    ]),
  ],
};

// ───────────────────────────── Sweep ─────────────────────────────

const sweep3 = ([s3, s2, s1]: number[]) =>
  `:8 ${repeat(triplets([`${s3}.3{sd}`, `${s2}.2{sd}`, `${s1}.1{sd}`, `${s2}.2{su}`, `${s3}.3{su}`, "r"]), 2).join(" ")}`;
const sweep5 = (shape: string[]) =>
  `:16 ${repeat(strokes(shape, ["sd", "sd", "sd", "sd", "sd", "su", "su", "su"]), 2).join(" ")}`;
const AM5 = ["12.5", "14.4", "14.3", "13.2", "12.1", "13.2", "14.3", "14.4"];
const DM5 = ["5.5", "7.4", "7.3", "6.2", "5.1", "6.2", "7.3", "7.4"];
const EM5 = ["7.5", "9.4", "9.3", "8.2", "7.1", "8.2", "9.3", "9.4"];
const C5 = ["15.5", "14.4", "12.3", "13.2", "12.1", "13.2", "12.3", "14.4"];
const G5 = ["10.5", "9.4", "7.3", "8.2", "7.1", "8.2", "7.3", "9.4"];
const F5 = ["8.5", "7.4", "5.3", "6.2", "5.1", "6.2", "5.3", "7.4"];

const sweepTechnique: Technique = {
  slug: "sweep",
  name: "Sweep Pena",
  icon: "≋",
  summary: "Tek pena hareketiyle tellerin üzerinden süpürerek hızlı arpejler.",
  levels: [
    level("sweep", 1, "Temel", "Üç telde sweep ve notaların ayrışması.", [
      {
        title: "3 Telli Minör Sweep",
        description: "Am – Dm – Em – Am triadları. Aşağı yönde tek hareketle üç tel, dönüşte yukarı.",
        tips: ["Her nota çaldıktan hemen sonra parmağı kaldır; notalar birbirine karışmasın (akor gibi duyulmamalı).", "Pena 'düşer', tellere vurmaz."],
        tex: tex(50, [[14, 13, 12], [7, 6, 5], [9, 8, 7], [14, 13, 12]].map(sweep3)),
        startBpm: 50,
        targetBpm: 100,
      },
      {
        title: "3 Telli Majör Sweep",
        description: "A – D – E – A majör triadlarıyla aynı hareket.",
        tips: ["Majör şekilde iki nota aynı perdede: parmağı yuvarlayarak sırayla bas."],
        tex: tex(50, [[14, 14, 12], [7, 7, 5], [9, 9, 7], [14, 14, 12]].map(sweep3)),
        startBpm: 50,
        targetBpm: 100,
      },
    ]),
    level("sweep", 2, "Gelişen", "Beş telli şekiller.", [
      {
        title: "5 Telli Minör Sweep",
        description: "Am – Dm – Em – Am. Beş tel aşağı, üç tel yukarı.",
        tips: ["Sol el 'rulo' yapar: aynı perdedeki notalarda parmak yuvarlanarak sırayla basar.", "Önce metronomsuz, sadece temizliğe odaklan."],
        tex: tex(50, [AM5, DM5, EM5, AM5].map(sweep5)),
        startBpm: 50,
        targetBpm: 90,
      },
      {
        title: "5 Telli Majör Sweep",
        description: "C – G – F – C majör şekilleri.",
        tips: ["Majör şekilde 4. telden 3. tele geçerken parmak düzeni değişir; burayı ayrıca çalış."],
        tex: tex(50, [C5, G5, F5, C5].map(sweep5)),
        startBpm: 50,
        targetBpm: 90,
      },
    ]),
    level("sweep", 3, "Orta", "Akor dizisi üzerinde sweep.", [
      {
        title: "Am – F – C – G Sweep Döngüsü",
        description: "Minör ve majör şekilleri art arda bağla.",
        tips: ["Şekil değişimini bir önceki ölçünün son notasında hazırla."],
        tex: tex(60, [AM5, F5, C5, G5].map(sweep5)),
        startBpm: 60,
        targetBpm: 110,
      },
    ]),
  ],
};

// ───────────────────────────── Tapping ─────────────────────────────

const tap3 = (s: number, t: number, a: number, b: number) =>
  triplets([`${t}.${s}{tt h}`, `${a}.${s}{h}`, `${b}.${s}`]).join(" ");
const tap4 = (s: number, t: number, a: number, b: number) =>
  [`${t}.${s}{tt h}`, `${a}.${s}{h}`, `${b}.${s}{h}`, `${a}.${s}`].join(" ");

const tapping: Technique = {
  slug: "tapping",
  name: "Tapping",
  icon: "☝",
  summary: "Sağ el parmağıyla sapa vurarak geniş aralıklı, hızlı cümleler.",
  levels: [
    level("tapping", 1, "Temel", "Tap – pull-off – hammer-on döngüsü.", [
      {
        title: "Tek Tel Tapping Üçlüsü",
        description: "Sağ el orta ya da işaret parmağıyla 12. perdeye vur, 5'e pull-off yap, 8'e hammer-on.",
        tips: ["Tap yapan parmak teli hafifçe aşağı çekerek bırakmalı (pull-off).", "Sol el diğer telleri sustursun."],
        tex: tex(60, [
          ...repeat([`:8 ${repeat([tap3(1, 12, 5, 8)], 4).join(" ")}`], 2),
          ...repeat([`:8 ${repeat([tap3(2, 12, 5, 8)], 4).join(" ")}`], 2),
        ]),
        startBpm: 60,
        targetBpm: 110,
      },
      {
        title: "Tapping ile Akor Değişimi",
        description: "Sadece tap ve sol el notalarını değiştirerek Am – F – G – E dizisini çal.",
        tips: ["Akor değişimini bir önceki üçlemenin sonunda hazırla."],
        tex: tex(60, [[12, 5, 8], [13, 5, 8], [15, 7, 10], [12, 4, 7]].map(([t, a, b]) => `:8 ${repeat([tap3(1, t, a, b)], 4).join(" ")}`)),
        startBpm: 60,
        targetBpm: 110,
      },
    ]),
    level("tapping", 2, "Gelişen", "16'lık tapping ve tel değiştirme.", [
      {
        title: "16'lık Tapping",
        description: "Tap – pull-off – hammer-on – pull-off döngüsü: her vuruşa dört nota.",
        tips: ["Dördüncü nota (pull-off) en zayıf çıkar; ona dikkat et."],
        tex: tex(60, [[12, 5, 8], [13, 5, 8], [15, 7, 10], [12, 4, 7]].map(([t, a, b]) => `:16 ${repeat([tap4(1, t, a, b)], 4).join(" ")}`)),
        startBpm: 60,
        targetBpm: 110,
      },
      {
        title: "İki Tel Tapping",
        description: "İnce Mi telinde Am, Si telinde C arpeji. Tel değişiminde gürültüyü sustur.",
        tips: ["Kullanılmayan teller sol elin boştaki parmaklarıyla susturulmalı."],
        tex: tex(60, repeat([
          `:8 ${repeat([tap3(1, 12, 5, 8)], 2).join(" ")} ${repeat([tap3(2, 13, 5, 8)], 2).join(" ")}`,
        ], 4)),
        startBpm: 60,
        targetBpm: 110,
      },
    ]),
  ],
};

export const TECHNIQUES: Technique[] = [
  chromatic,
  alternatePicking,
  chords,
  rhythm,
  palmMute,
  legatoTechnique,
  bendVibrato,
  slide,
  arpeggio,
  economy,
  sweepTechnique,
  tapping,
];

export const ALL_EXERCISES: (Exercise & { technique: Technique; level: Level })[] = TECHNIQUES.flatMap((t) =>
  t.levels.flatMap((l) => l.exercises.map((e) => ({ ...e, technique: t, level: l }))),
);

export function getTechnique(slug: string): Technique | undefined {
  return TECHNIQUES.find((t) => t.slug === slug);
}

export function getExercise(id: string) {
  return ALL_EXERCISES.find((e) => e.id === id);
}
