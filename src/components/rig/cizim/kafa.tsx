// Kafa amfiler: gerçek ürün AİLELERİNİN düzenine yakın, özgün çizimler. Gövde oranı, panelin yeri (üst ya da alt şerit),
// ana malzeme (fırçalanmış altın, krom, siyah ya da krem emaye panel; siyah ya da turuncu tolex; kumaş, elmas desenli
// alüminyum ızgara) ve kontrollerin sayısı, sırası ve yaklaşık yeri esin alınan ürüne uyar. Logo, yazı biçimi, marka
// plakaları ve markaya özgü grafikler BİLEREK alınmaz: logo yerine düz, eğik olmayan "GuitarFlex" yazısı; simgeli panelin
// simgeleri de bu projede tasarlandı. Kitaplık modelleri yıpranmış (vintage) çizilir: bkz. temel.tsx `Yipranma`.
import type { Cizim, Gorunum } from "@/lib/rig-cekirdek";
import { Izgara, Kayis, type Kumas } from "./amfi";
import { Anahtar, Biyik, Dugme, Jak, Kasa, Koseler, Lamba, Led, Tanimlar, Vida, Yazi, Yipranma, asinmaMaskesi, etiketYaz, koyu, rastgele, tohumla, yuvarla, yuzey, type Ctx, type DugmeTur } from "./temel";

export type KafaTur = string;

/** Çizim türü + modelin görünüşü → kafa düzeni (yoksa eski genel amfi çizimi kullanılır) */
export function kafaTuru(cizim: Cizim, g?: Gorunum): KafaTur | undefined {
  if (g?.amfi && KAFA[g.amfi]) return g.amfi;
  if (cizim === "amfi-kafa") return "brit";
  if (cizim === "amfi-modern") return "titan";
  return undefined;
}

type Simge = "ses" | "bas" | "orta" | "tiz" | "kazanc" | "reverb" | "guc" | "bekle" | "kanal" | "giris" | "temiz" | "kirli";

/** Panelin soldan sağa öğeleri. "dugmeler": modelin düğmeleri (gruplarıyla) buraya dizilir. */
type Oge =
  | { t: "dugmeler" }
  | { t: "jak"; n: number; ad?: string }
  | { t: "lamba"; renk: string }
  | { t: "anahtar"; ad: string }
  | { t: "buton"; ad: string; led?: string }
  | { t: "led"; renk: string; yanik?: boolean }
  | { t: "eq"; bantlar: string[] }
  | { t: "ara" };

type PanelMalzeme = "altin" | "krom" | "siyah" | "krem" | "kahve";

type KafaStil = {
  /** Ön yüz (birim) */
  w: number;
  h: number;
  /** Panelin dikey yeri ve yüksekliği (oran) */
  panel: [number, number];
  malzeme: PanelMalzeme;
  baski: string;
  dugme: DugmeTur;
  /** Izgara alanı (oran): x, y, w, h */
  izgara: [number, number, number, number];
  kumas: Kumas | "elmas";
  /** Izgara çevresinde beyaz kenar biyesi (piping) */
  biyik?: string;
  kose: "metal" | "siyah";
  /** Tolex dokusu: kaba (levant) ya da ince */
  doku?: "tolex" | "mat";
  logo: { tur: "beyaz" | "plaka" | "siyah" | "rozet"; x: number; y: number; boy: number };
  ogeler: Oge[];
  /** Bir düğme grubunun önüne eklenen öğeler (kanal LED'i, mod anahtarı…) */
  grupOnu?: Record<string, Oge[]>;
  /** Yazı yerine simge (resimli panel) */
  simgeli?: boolean;
  /** Grup başlığının panelde görünen adı */
  grupAdi?: Record<string, string>;
  /** İki sıralı panel: bu gruplar ikinci sıraya; ikinci sıranın öğeleri (yoksa yalnız düğmeler) */
  satir2?: string[];
  ogeler2?: Oge[];
  /** Ön yüzde ızgara yok (ayrı kabinli eski tip kafa: tolex ön yüz ve panel) */
  izgarasiz?: boolean;
};

const BRIT_ON: Oge[] = [{ t: "lamba", renk: "#e3261b" }, { t: "anahtar", ad: "Güç" }, { t: "anahtar", ad: "Bekle" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }];
const KAFA: Record<string, KafaStil> = {
  // JCM800 2203 esinli: ön yüzün ÜST şeridinde tam genişlikte fırçalanmış altın panel; altında beyaz biyeli siyah kumaş
  brit: {
    w: 236,
    h: 99,
    panel: [0.075, 0.27],
    malzeme: "altin",
    baski: "#1b1408",
    dugme: "altin",
    izgara: [0.045, 0.415, 0.91, 0.5],
    kumas: "siyah",
    biyik: "#ece5d0",
    kose: "metal",
    logo: { tur: "beyaz", x: 0.5, y: 0.69, boy: 0.15 },
    ogeler: [{ t: "lamba", renk: "#e3261b" }, { t: "anahtar", ad: "Güç" }, { t: "anahtar", ad: "Bekle" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "jak", n: 2, ad: "Giriş" }],
  },
  // Dual Rectifier esinli: elmas desenli alüminyum ızgara üstte, krom panel altta; iki kanal × altı düğme
  titan: {
    w: 268,
    h: 96,
    panel: [0.635, 0.3],
    malzeme: "krom",
    baski: "#111215",
    dugme: "krom",
    izgara: [0.03, 0.065, 0.94, 0.53],
    kumas: "elmas",
    kose: "siyah",
    logo: { tur: "plaka", x: 0.5, y: 0.33, boy: 0.085 },
    ogeler: [{ t: "anahtar", ad: "Güç" }, { t: "anahtar", ad: "Bekle" }, { t: "lamba", renk: "#e3261b" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "jak", n: 1, ad: "Giriş" }],
    grupOnu: { K2: [{ t: "led", renk: "#ff3b30" }, { t: "anahtar", ad: "Mod" }], K1: [{ t: "led", renk: "#ff9f0a", yanik: true }, { t: "anahtar", ad: "Mod" }] },
    grupAdi: { K1: "KANAL 1", K2: "KANAL 2" },
  },
  // 5150 esinli: siyah kumaş üstte, siyah panel beyaz yazı altta; ritim ve lead kanalı, ortak EQ
  crush: {
    w: 252,
    h: 102,
    panel: [0.64, 0.28],
    malzeme: "siyah",
    baski: "#eeeeea",
    dugme: "siyah",
    izgara: [0.03, 0.06, 0.94, 0.54],
    kumas: "siyah",
    kose: "metal",
    logo: { tur: "beyaz", x: 0.27, y: 0.33, boy: 0.12 },
    ogeler: [{ t: "jak", n: 1, ad: "Giriş" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "anahtar", ad: "Bekle" }, { t: "anahtar", ad: "Güç" }, { t: "led", renk: "#ff3b30", yanik: true }],
    grupOnu: { Ritim: [{ t: "buton", ad: "Parlak" }, { t: "buton", ad: "Crunch" }], Lead: [{ t: "buton", ad: "Kanal", led: "#ff3b30" }] },
    grupAdi: { Ritim: "RİTİM", Lead: "LEAD" },
  },
  // Rockerverb 100 esinli: turuncu tolex, bej sepet örgü ızgara üstte, krem emaye panel altta; yazı yok, yalnız simge
  valf: {
    w: 240,
    h: 102,
    panel: [0.62, 0.3],
    malzeme: "krem",
    baski: "#1a1712",
    dugme: "siyah",
    izgara: [0.04, 0.07, 0.92, 0.5],
    kumas: "hasir",
    kose: "siyah",
    doku: "mat",
    logo: { tur: "siyah", x: 0.5, y: 0.31, boy: 0.12 },
    ogeler: [{ t: "jak", n: 1 }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "anahtar", ad: "Kanal" }, { t: "anahtar", ad: "Bekle" }, { t: "anahtar", ad: "Güç" }],
    simgeli: true,
  },
  // DR103 esinli: siyah panel beyaz yazı altta, koyu antrasit kumaş üstte, küçük isim plakası; dört giriş
  studyo: {
    w: 258,
    h: 94,
    panel: [0.635, 0.29],
    malzeme: "siyah",
    baski: "#f2f0ea",
    dugme: "numarali",
    izgara: [0.035, 0.07, 0.93, 0.52],
    kumas: "antrasit",
    kose: "siyah",
    logo: { tur: "rozet", x: 0.5, y: 0.25, boy: 0.085 },
    ogeler: [{ t: "jak", n: 2, ad: "Normal" }, { t: "jak", n: 2, ad: "Parlak" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "anahtar", ad: "Bekle" }, { t: "anahtar", ad: "Güç" }, { t: "lamba", renk: "#e3261b" }],
  },
  // JCM900 4100 esinli: altın panel üstte; giriş solda, A ve B kanalı kazancı, ortak EQ, kanal başına reverb ve master
  brit900: {
    w: 236, h: 99, panel: [0.075, 0.27], malzeme: "altin", baski: "#1b1408", dugme: "altin",
    izgara: [0.045, 0.415, 0.91, 0.5], kumas: "siyah", biyik: "#ece5d0", kose: "metal",
    logo: { tur: "beyaz", x: 0.5, y: 0.69, boy: 0.15 },
    ogeler: [{ t: "jak", n: 1, ad: "Giriş" }, { t: "ara" }, { t: "dugmeler" }, { t: "buton", ad: "B kanal", led: "#ff3b30" }, { t: "anahtar", ad: "Bekle" }, { t: "anahtar", ad: "Güç" }],
  },
  // 1959 Super Lead esinli: altın (pleksi) panel üstte, tuz-biber kumaş, krem biye; dört giriş sağda
  klasik: {
    w: 236, h: 99, panel: [0.075, 0.27], malzeme: "altin", baski: "#1b1408", dugme: "altin",
    izgara: [0.045, 0.415, 0.91, 0.5], kumas: "tuzbiber", biyik: "#efe6cf", kose: "metal",
    logo: { tur: "beyaz", x: 0.5, y: 0.69, boy: 0.14 },
    ogeler: [...BRIT_ON, { t: "jak", n: 4, ad: "Giriş" }],
  },
  // JTM45 esinli: daha küçük kasa, altın panel üstte, koyu kumaş, köşeler siyah
  koken: {
    w: 224, h: 102, panel: [0.075, 0.27], malzeme: "altin", baski: "#1b1408", dugme: "krem",
    izgara: [0.05, 0.415, 0.9, 0.5], kumas: "antrasit", biyik: "#e8dfc6", kose: "siyah",
    logo: { tur: "beyaz", x: 0.5, y: 0.69, boy: 0.13 },
    ogeler: [...BRIT_ON, { t: "jak", n: 4, ad: "Giriş" }],
  },
  // Silver Jubilee esinli: gümüş tolex, gümüş (krom) panel üstte, gri kumaş; iki mod anahtarı
  gumus: {
    w: 236, h: 99, panel: [0.075, 0.27], malzeme: "krom", baski: "#121316", dugme: "krom",
    izgara: [0.045, 0.415, 0.91, 0.5], kumas: "gumus", biyik: "#d6d8dc", kose: "metal",
    logo: { tur: "siyah", x: 0.5, y: 0.69, boy: 0.14 },
    ogeler: [...BRIT_ON.slice(0, 3), { t: "anahtar", ad: "Klip" }, { t: "anahtar", ad: "Triyot" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "jak", n: 2, ad: "Giriş" }],
  },
  // DSL100 esinli: altın panel üstte; klasik ve ultra kanal, ortak EQ, kanal başına reverb
  dsl: {
    w: 236, h: 99, panel: [0.075, 0.27], malzeme: "altin", baski: "#1b1408", dugme: "altin",
    izgara: [0.045, 0.415, 0.91, 0.5], kumas: "siyah", biyik: "#ece5d0", kose: "metal",
    logo: { tur: "beyaz", x: 0.5, y: 0.69, boy: 0.14 },
    ogeler: [{ t: "lamba", renk: "#e3261b" }, { t: "anahtar", ad: "Güç" }, { t: "anahtar", ad: "Bekle" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "jak", n: 1, ad: "Giriş" }],
    grupOnu: { Ultra: [{ t: "buton", ad: "Kanal", led: "#ff3b30" }] },
    grupAdi: { Klasik: "KLASİK", Ultra: "ULTRA" },
  },
  // Mark IIC+ esinli: siyah panel beyaz yazı altta, siyah kumaş; beş bantlı sürgülü EQ
  cali: {
    w: 232, h: 92, panel: [0.6, 0.33], malzeme: "siyah", baski: "#f0efe9", dugme: "krom",
    izgara: [0.035, 0.07, 0.93, 0.47], kumas: "siyah", kose: "siyah",
    logo: { tur: "rozet", x: 0.5, y: 0.3, boy: 0.08 },
    ogeler: [{ t: "jak", n: 1, ad: "Giriş" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "eq", bantlar: ["80", "240", "750", "2K2", "6K6"] }, { t: "ara" }, { t: "anahtar", ad: "Bekle" }, { t: "anahtar", ad: "Güç" }, { t: "lamba", renk: "#e3261b" }],
  },
  // 5150 III esinli: siyah panel, krom düğmeler; üç kanal × beş düğme (iki sıra)
  tri: {
    w: 252, h: 104, panel: [0.5, 0.44], malzeme: "siyah", baski: "#eeeeea", dugme: "krom",
    izgara: [0.03, 0.06, 0.94, 0.4], kumas: "siyah", kose: "metal",
    logo: { tur: "beyaz", x: 0.5, y: 0.26, boy: 0.12 },
    ogeler: [{ t: "jak", n: 1, ad: "Giriş" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "anahtar", ad: "Bekle" }, { t: "anahtar", ad: "Güç" }],
    ogeler2: [{ t: "dugmeler" }, { t: "ara" }, { t: "led", renk: "#2fd158", yanik: true }, { t: "led", renk: "#2f7dff" }, { t: "led", renk: "#ff3b30" }],
    satir2: ["K3", ""],
    grupAdi: { K1: "KANAL 1", K2: "KANAL 2", K3: "KANAL 3" },
  },
  // SLO-100 esinli: krom panel altta, siyah kumaş; normal ve overdrive ön kazancı, iki master
  solo: {
    w: 248, h: 98, panel: [0.635, 0.3], malzeme: "krom", baski: "#111215", dugme: "siyah",
    izgara: [0.03, 0.065, 0.94, 0.53], kumas: "siyah", kose: "metal",
    logo: { tur: "plaka", x: 0.5, y: 0.33, boy: 0.08 },
    ogeler: [{ t: "jak", n: 1, ad: "Giriş" }, { t: "anahtar", ad: "Parlak" }, { t: "anahtar", ad: "Crunch" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "anahtar", ad: "Bekle" }, { t: "anahtar", ad: "Güç" }, { t: "lamba", renk: "#e3261b" }],
  },
  // Ecstasy esinli: tuz-biber kumaş, krom panel altta; 1. kanal üst sırada, 2/3. kanal ve ortaklar alt sırada
  velvet: {
    w: 244, h: 104, panel: [0.5, 0.44], malzeme: "krom", baski: "#111215", dugme: "siyah",
    izgara: [0.035, 0.06, 0.93, 0.4], kumas: "tuzbiber", kose: "metal",
    logo: { tur: "plaka", x: 0.5, y: 0.26, boy: 0.08 },
    ogeler: [{ t: "jak", n: 1, ad: "Giriş" }, { t: "anahtar", ad: "Ön EQ" }, { t: "anahtar", ad: "Boost" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "anahtar", ad: "Bekle" }, { t: "anahtar", ad: "Güç" }, { t: "lamba", renk: "#2fbf5a" }],
    ogeler2: [{ t: "anahtar", ad: "Pleksi" }, { t: "ara" }, { t: "dugmeler" }],
    satir2: ["K2", "K3", "K2/3", ""],
    grupAdi: { K1: "KANAL 1", K2: "KANAL 2", K3: "KANAL 3", "K2/3": "2 · 3 ORTAK" },
  },
  // VH4 esinli: gümüş panel altta, siyah kumaş; dört kanal × beş düğme, iki sıra; master, presence, derinlik
  dortlu: {
    w: 254, h: 104, panel: [0.5, 0.44], malzeme: "krom", baski: "#111215", dugme: "siyah",
    izgara: [0.03, 0.06, 0.94, 0.4], kumas: "siyah", kose: "metal",
    logo: { tur: "beyaz", x: 0.5, y: 0.26, boy: 0.12 },
    ogeler: [{ t: "jak", n: 1, ad: "Giriş" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "anahtar", ad: "Bekle" }, { t: "anahtar", ad: "Güç" }],
    ogeler2: [{ t: "dugmeler" }, { t: "ara" }, { t: "led", renk: "#2f7dff", yanik: true }],
    satir2: ["Mega", "Lead", ""],
    grupAdi: { Temiz: "TEMİZ", Crunch: "CRUNCH", Mega: "MEGA", Lead: "LEAD" },
  },
  // Powerball esinli: krom panel ve delikli krom ızgara; iki kanal, kanal başına iki ses; iki sıra
  celik: {
    w: 250, h: 104, panel: [0.5, 0.44], malzeme: "krom", baski: "#101114", dugme: "siyah",
    izgara: [0.03, 0.06, 0.94, 0.4], kumas: "metal", kose: "siyah",
    logo: { tur: "plaka", x: 0.5, y: 0.26, boy: 0.08 },
    ogeler: [{ t: "jak", n: 1, ad: "Giriş" }, { t: "buton", ad: "Parlak" }, { t: "buton", ad: "Alt" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "anahtar", ad: "Bekle" }, { t: "anahtar", ad: "Güç" }],
    ogeler2: [{ t: "buton", ad: "Alt" }, { t: "buton", ad: "Odak" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "buton", ad: "Kanal", led: "#2f7dff" }, { t: "buton", ad: "Master", led: "#ff3b30" }],
    satir2: ["K2", ""],
    grupAdi: { K1: "KANAL I", K2: "KANAL II" },
  },
  // BE-100 esinli: tuz-biber kumaş, beyaz biye, siyah panel altta; temiz ve BE kanalı, mini anahtarlar
  hazel: {
    w: 244, h: 98, panel: [0.635, 0.3], malzeme: "siyah", baski: "#efede6", dugme: "siyah",
    izgara: [0.04, 0.075, 0.92, 0.5], kumas: "tuzbiber", biyik: "#ece5d0", kose: "siyah",
    logo: { tur: "beyaz", x: 0.5, y: 0.32, boy: 0.12 },
    ogeler: [{ t: "jak", n: 1, ad: "Giriş" }, { t: "ara" }, { t: "dugmeler" }, { t: "anahtar", ad: "SAT" }, { t: "anahtar", ad: "FAT" }, { t: "anahtar", ad: "C45" }, { t: "ara" }, { t: "anahtar", ad: "Bekle" }, { t: "anahtar", ad: "Güç" }, { t: "lamba", renk: "#e3261b" }],
    grupAdi: { Temiz: "TEMİZ", BE: "BE" },
  },
  // Supergroup esinli: fırçalanmış alüminyum (krom) panel üstte, antrasit kumaş, krem biye; dört giriş
  grup: {
    w: 236, h: 96, panel: [0.075, 0.27], malzeme: "krom", baski: "#121316", dugme: "siyah",
    izgara: [0.045, 0.415, 0.91, 0.5], kumas: "antrasit", biyik: "#e8dfc6", kose: "metal",
    logo: { tur: "beyaz", x: 0.5, y: 0.69, boy: 0.13 },
    ogeler: [...BRIT_ON, { t: "jak", n: 4, ad: "Giriş" }],
  },
  // Bassman 6G6 esinli: ayrı kabinli kafa; ön yüzde ızgara yok, açık sarı (blonde) tolex, kahverengi panel
  piggy: {
    w: 230, h: 84, panel: [0.36, 0.44], malzeme: "kahve", baski: "#f3ead6", dugme: "krem",
    izgara: [0, 0, 0, 0], kumas: "siyah", kose: "siyah", izgarasiz: true,
    logo: { tur: "rozet", x: 0.17, y: 0.2, boy: 0.085 },
    ogeler: [{ t: "jak", n: 2, ad: "Parlak" }, { t: "jak", n: 2, ad: "Normal" }, { t: "ara" }, { t: "dugmeler" }, { t: "ara" }, { t: "anahtar", ad: "Bekle" }, { t: "anahtar", ad: "Güç" }, { t: "lamba", renk: "#e3261b" }],
    grupAdi: { Parlak: "PARLAK", Normal: "NORMAL" },
  },
};

const derinlik = (s: KafaStil): [number, number] => [Math.round(s.w * 0.045), -Math.round(s.w * 0.032)];
const ustPay = (s: KafaStil) => 6 - derinlik(s)[1] + 10;
export const kafaBoyutu = (t: KafaTur): [number, number] => {
  const s = KAFA[t];
  return [s.w + derinlik(s)[0] + 12, ustPay(s) + s.h + 4];
};

/** Düğme adı "Grup · Ad" ise ikiye ayrılır */
const ayir = (a: string): [string, string] => {
  const i = a.indexOf(" · ");
  return i < 0 ? ["", a] : [a.slice(0, i), a.slice(i + 3)];
};

const SIMGE_ADI: Record<string, Simge> = { Ses: "ses", Bas: "bas", Orta: "orta", Tiz: "tiz", Kazanç: "kazanc", Reverb: "reverb", Güç: "guc", Bekle: "bekle", Kanal: "kanal" };

/** Resimli panelin simgeleri (bu projede tasarlandı): 6 × 4 birimlik kutuda, çizgi */
function SimgeCiz({ x, y, tur, renk, boy = 1 }: { x: number; y: number; tur: Simge; renk: string; boy?: number }) {
  const s = boy;
  const p = (d: string) => <path d={d} transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={renk} strokeWidth={0.42} strokeLinecap="round" strokeLinejoin="round" />;
  switch (tur) {
    case "ses":
      // yükselen üç çubuk
      return (
        <g transform={`translate(${x} ${y}) scale(${s})`} fill={renk}>
          <rect x={-2.6} y={0.4} width={1.2} height={1.2} rx={0.2} />
          <rect x={-0.6} y={-0.6} width={1.2} height={2.2} rx={0.2} />
          <rect x={1.4} y={-1.6} width={1.2} height={3.2} rx={0.2} />
        </g>
      );
    case "bas":
      return p("M-3 0 C-2 -2.4 -1 -2.4 0 0 S2 2.4 3 0");
    case "orta":
      return p("M-3 0 C-2.5 -1.8 -2 -1.8 -1.5 0 S-0.5 1.8 0 0 S1 -1.8 1.5 0 S2.5 1.8 3 0");
    case "tiz":
      return p("M-3 0 L-2.5 -1 L-2 1 L-1.5 -1 L-1 1 L-0.5 -1 L0 1 L0.5 -1 L1 1 L1.5 -1 L2 1 L2.5 -1 L3 0");
    case "kazanc":
      // kırpılmış dalga
      return p("M-3 1 L-2.2 -1.2 H-0.8 L0 1.2 H1.4 L2.2 -1.2 H3");
    case "reverb":
      return (
        <g>
          <circle cx={x - 2.2 * s} cy={y} r={0.55 * s} fill={renk} />
          {p("M-1 -1.3 Q0 0 -1 1.3 M0.6 -1.9 Q2 0 0.6 1.9 M2.2 -2.4 Q3.8 0 2.2 2.4")}
        </g>
      );
    case "guc":
      return p("M-1.1 -1.1 A1.7 1.7 0 1 0 1.1 -1.1 M0 -2 V0.1");
    case "bekle":
      return p("M-0.8 -1.6 V1.6 M0.8 -1.6 V1.6");
    case "kanal":
      return p("M-2.6 0 H-0.6 L1.6 -1.6 M-0.6 0 L1.6 1.6 M0.8 -2 L1.6 -1.6 L1.3 -0.8 M0.8 2 L1.6 1.6 L1.3 0.8");
    case "giris":
      return p("M-3 0 H-0.8 M-0.8 -1 H2 V1 H-0.8 Z M2 0 H3");
    case "temiz":
      return p("M-4 0 C-3 -1.6 -1 -1.6 0 0 S3 1.6 4 0");
    case "kirli":
      return p("M-4 0.6 L-3 -1.4 L-2 1.4 L-1 -1.4 L0 1.4 L1 -1.4 L2 1.4 L3 -1.4 L4 0.6");
  }
}

/** Panelin yerleşimi: her öğe bir genişlik payı alır, düğme 1 */
const PAY = { dugme: 1, jak: 0.62, lamba: 0.8, anahtar: 0.62, buton: 0.86, led: 0.5, ara: 0.45, grup: 0.42, eq: 0.48 };

type Yer = { x: number; o: Oge | { t: "knob"; i: number; ad: string; grup: string } };

function yerlestir(s: KafaStil, ogeler: Oge[], liste: { i: number; a: string }[]): { yerler: Yer[]; birim: number; gruplar: { ad: string; x0: number; x1: number }[] } {
  const dizi: (Yer["o"] | { t: "bosluk" })[] = [];
  for (const o of ogeler) {
    if (o.t !== "dugmeler") {
      dizi.push(o);
      continue;
    }
    let onceki: string | null = null;
    liste.forEach(({ i, a }) => {
      const [g, ad] = ayir(a);
      if (onceki !== null && g !== onceki) dizi.push({ t: "bosluk" });
      if (g !== onceki) for (const ek of s.grupOnu?.[g] ?? []) dizi.push(ek);
      dizi.push({ t: "knob", i, ad, grup: g });
      onceki = g;
    });
  }
  const pay = (o: (typeof dizi)[number]) =>
    o.t === "knob" ? PAY.dugme : o.t === "bosluk" ? PAY.grup : o.t === "jak" ? PAY.jak * o.n : o.t === "eq" ? PAY.eq * o.bantlar.length : o.t === "dugmeler" ? 0 : PAY[o.t];
  const toplam = dizi.reduce((t, o) => t + pay(o), 0);
  return hesapla(dizi, pay, toplam);
}

function hesapla(dizi: (Yer["o"] | { t: "bosluk" })[], pay: (o: Yer["o"] | { t: "bosluk" }) => number, toplam: number) {
  // yerler 0–1 arasında (sonra panel genişliğine ölçeklenir)
  const yerler: Yer[] = [];
  const gruplar: { ad: string; x0: number; x1: number }[] = [];
  let x = 0;
  for (const o of dizi) {
    const p = pay(o) / toplam;
    if (o.t !== "bosluk") yerler.push({ x: x + p / 2, o });
    if (o.t === "knob" && o.grup) {
      const son = gruplar[gruplar.length - 1];
      if (son && son.ad === o.grup && Math.abs(son.x1 - x) < 1e-9) son.x1 = x + p;
      else gruplar.push({ ad: o.grup, x0: x, x1: x + p });
    }
    x += p;
  }
  return { yerler, birim: 1 / toplam, gruplar };
}

const PANEL_DOLGU: Record<PanelMalzeme, (u: string) => string> = {
  altin: (u) => `url(#${u}altin)`,
  krom: (u) => `url(#${u}kpanel)`,
  siyah: () => "#1b1c1f",
  krem: () => "#ece5d3",
  kahve: () => "#5b3b24",
};
/** Panelin kararma / kir rengi (yıpranma) */
const PANEL_KIR: Record<PanelMalzeme, string> = { altin: "#3a2808", krom: "#3a3d42", siyah: "#8a8a84", krem: "#7a6238", kahve: "#1c1008" };

/** Kontrol paneli: plaka, vidalar, düğmeler (adlarıyla ya da simgeleriyle), anahtarlar, jaklar, lamba */
function Panel({ c, s, x, y, w, h, v, adlar, model }: { c: Ctx; s: KafaStil; x: number; y: number; w: number; h: number; v: number[]; adlar: string[]; model?: string }) {
  const p = PANEL_DOLGU[s.malzeme];
  const rs = rastgele((c.z ?? 7) ^ tohumla("panel"));
  const mask = asinmaMaskesi(c);
  const liste = adlar.map((a, i) => ({ i, a }));
  // iki sıralı panel: ikinci sıraya giden gruplar ayrılır
  const ikinci = s.satir2 ? liste.filter((x) => s.satir2!.includes(ayir(x.a)[0])) : [];
  const birinci = s.satir2 ? liste.filter((x) => !s.satir2!.includes(ayir(x.a)[0])) : liste;
  return (
    <g style={{ color: s.baski }}>
      {/* panel yuvası ve plaka */}
      <rect x={x - 0.8} y={y - 0.8} width={w + 1.6} height={h + 1.6} rx={1.6} fill="#000" opacity={0.6} />
      <rect x={x} y={y} width={w} height={h} rx={1.2} fill={p(c.u)} filter={yuzey(c, s.malzeme === "krem" ? "mat" : "firca")} />
      <line x1={x + 1.5} x2={x + w - 1.5} y1={y + 0.6} y2={y + 0.6} stroke="#fff" strokeOpacity={s.malzeme === "siyah" ? 0.18 : 0.55} strokeWidth={0.5} />
      <line x1={x + 1.5} x2={x + w - 1.5} y1={y + h - 0.5} y2={y + h - 0.5} stroke="#000" strokeOpacity={0.35} strokeWidth={0.6} />
      <Yipranma c={c} x={x} y={y} w={w} h={h} rx={1.2} tur="panel" renk={s.malzeme} taban={PANEL_KIR[s.malzeme]} anahtar="panel" />
      {[x + 3.2, x + w - 3.2].map((vx) => (
        <Vida key={vx} c={c} x={vx} y={y + h / 2} r={1.15} d={vx * 3} pas={c.z === undefined ? 0 : rs()} />
      ))}
      {s.satir2 ? (
        <>
          <PanelSira c={c} s={s} x={x} y={y} w={w} h={h / 2} v={v} ogeler={s.ogeler} liste={birinci} />
          <line x1={x + 6} x2={x + w - 6} y1={y + h / 2} y2={y + h / 2} stroke={s.baski} strokeOpacity={0.18} strokeWidth={0.3} />
          <PanelSira c={c} s={s} x={x} y={y + h / 2} w={w} h={h / 2} v={v} ogeler={s.ogeler2 ?? [{ t: "dugmeler" }]} liste={ikinci} />
        </>
      ) : (
        <PanelSira c={c} s={s} x={x} y={y} w={w} h={h} v={v} ogeler={s.ogeler} liste={birinci} />
      )}
      {model && c.t && !s.simgeli && !s.satir2 && (
        <g mask={mask}>
          <Yazi x={x + w - 6} y={y + h - 1.6} boy={2.1} renk={s.baski} hiza="end" ara={0.6} kalin={700} opaklik={0.85}>
            {model.toUpperCase()}
          </Yazi>
        </g>
      )}
    </g>
  );
}

/** Panelin bir sırası: düğmeler (gruplarıyla), anahtarlar, jaklar, lamba, sürgülü EQ */
function PanelSira({ c, s, x, y, w, h, v, ogeler, liste }: { c: Ctx; s: KafaStil; x: number; y: number; w: number; h: number; v: number[]; ogeler: Oge[]; liste: { i: number; a: string }[] }) {
  const { yerler, birim, gruplar } = yerlestir(s, ogeler, liste);
  const adim = birim * (w - 16);
  const px = (q: number) => yuvarla(x + 8 + q * (w - 16));
  const grupVar = gruplar.length > 0;
  const ky = y + h * (grupVar ? 0.47 : 0.56);
  const dr = Math.min(h * 0.2, adim * 0.33);
  const etiketY = ky - dr - Math.max(1.6, dr * 0.36);
  /** Etiket boyu: öğenin kendi genişliğine sığar (harf ≈ 0.74 boy, aralık dahil) */
  const yaziBoy = (a: string, pay = 1) => yuvarla(Math.min(dr * 0.5, 2.8, (pay * adim * 0.8) / (Math.max(4, a.length) * 0.76)));
  // grup başlığı düğmelerin altında; sıranın alt kenarına değmez
  const altY = Math.min(ky + dr + 4.2, y + h - 2.4);
  const p = PANEL_DOLGU[s.malzeme];
  const mask = asinmaMaskesi(c);
  return (
    <g>
      {/* grup çizgileri ve başlıkları (düğmelerin altında) */}
      {c.t &&
        gruplar.map((g) => {
          const x0 = px(g.x0) + 1.5;
          const x1 = px(g.x1) - 1.5;
          const gy = altY;
          return (
            <g key={g.ad + g.x0} mask={mask}>
              <path d={`M${x0} ${gy - 1.2} V${gy} H${x1} V${gy - 1.2}`} fill="none" stroke={s.baski} strokeOpacity={0.7} strokeWidth={0.3} />
              {s.simgeli ? (
                <g>
                  <rect x={(x0 + x1) / 2 - 6} y={gy - 1} width={12} height={2.4} fill={p(c.u)} />
                  <SimgeCiz x={(x0 + x1) / 2} y={gy + 0.2} tur={g.ad === "Temiz" ? "temiz" : "kirli"} renk={s.baski} boy={0.6} />
                </g>
              ) : (
                <>
                  <rect x={(x0 + x1) / 2 - (s.grupAdi?.[g.ad] ?? g.ad).length * 1.05 - 1.2} y={gy - 1.2} width={(s.grupAdi?.[g.ad] ?? g.ad).length * 2.1 + 2.4} height={2.6} fill={s.malzeme === "krom" ? "#d9dce0" : p(c.u)} />
                  <Yazi x={(x0 + x1) / 2} y={gy + 0.9} boy={2.3} renk={s.baski} ara={0.35}>
                    {s.grupAdi?.[g.ad] ?? etiketYaz(g.ad)}
                  </Yazi>
                </>
              )}
            </g>
          );
        })}
      {yerler.map(({ x: q, o }, i) => {
        const cx = px(q);
        switch (o.t) {
          case "knob": {
            const simge = s.simgeli ? SIMGE_ADI[o.ad] : undefined;
            return (
              <g key={i}>
                <Dugme c={c} x={cx} y={ky} r={dr} v={v[o.i] ?? 5} tur={s.dugme} isaret={s.simgeli ? undefined : etiketYaz(o.ad)} isaretBoy={yaziBoy(o.ad)} />
                {simge && c.t && (
                  <g mask={mask}>
                    <SimgeCiz x={cx} y={ky - dr - 2.6} tur={simge} renk={s.baski} boy={0.62} />
                  </g>
                )}
              </g>
            );
          }
          case "jak": {
            const xs = Array.from({ length: o.n }, (_, k) => yuvarla(cx + (k - (o.n - 1) / 2) * adim * PAY.jak));
            return (
              <g key={i}>
                {xs.map((jx) => (
                  <Jak key={jx} c={c} x={jx} y={ky} r={Math.min(3.1, dr * 0.62)} />
                ))}
                {c.t &&
                  (s.simgeli ? (
                    <g mask={mask}>
                      <SimgeCiz x={cx} y={ky - dr - 2.6} tur="giris" renk={s.baski} boy={0.62} />
                    </g>
                  ) : (
                    o.ad && (
                      <g mask={mask}>
                        <Yazi x={cx} y={etiketY} boy={yaziBoy(o.ad, PAY.jak * o.n)} renk={s.baski} ara={0.3}>
                          {etiketYaz(o.ad)}
                        </Yazi>
                      </g>
                    )
                  ))}
              </g>
            );
          }
          case "lamba":
            return <Lamba key={i} c={c} x={cx} y={ky} r={Math.min(3.8, dr * 0.72)} renk={o.renk} />;
          case "led":
            return <Led key={i} c={{ ...c, on: c.on && !!o.yanik }} x={cx} y={ky} r={1.5} renk={o.renk} />;
          case "anahtar": {
            const simge = s.simgeli ? SIMGE_ADI[o.ad] : undefined;
            return (
              <g key={i}>
                <Anahtar c={c} x={cx} y={ky + dr * 0.35} r={Math.min(2.2, dr * 0.42)} ust={c.on} />
                {c.t &&
                  (simge ? (
                    <g mask={mask}>
                      <SimgeCiz x={cx} y={ky - dr - 2.6} tur={simge} renk={s.baski} boy={0.55} />
                    </g>
                  ) : (
                    <g mask={mask}>
                      <Yazi x={cx} y={etiketY} boy={yaziBoy(o.ad, PAY.anahtar)} renk={s.baski} ara={0.2}>
                        {etiketYaz(o.ad)}
                      </Yazi>
                    </g>
                  ))}
              </g>
            );
          }
          case "buton": {
            const bw = Math.min(5.2, adim * 0.5);
            return (
              <g key={i}>
                <rect x={cx - bw / 2 - 0.5} y={ky - bw / 2 - 0.5} width={bw + 1} height={bw + 1} rx={1.1} fill="#08090a" />
                <rect x={cx - bw / 2} y={ky - bw / 2} width={bw} height={bw} rx={0.9} fill={`url(#${c.u}siyahY)`} stroke="#4a4d52" strokeWidth={0.25} />
                <rect x={cx - bw / 2 + 0.6} y={ky - bw / 2 + 0.5} width={bw - 1.2} height={bw * 0.3} rx={0.5} fill="#fff" opacity={0.12} />
                {o.led && <Led c={{ ...c, on: c.on }} x={cx} y={ky + bw / 2 + 2.4} r={0.85} renk={o.led} />}
                {c.t && (
                  <g mask={mask}>
                    <Yazi x={cx} y={etiketY} boy={yaziBoy(o.ad, PAY.buton)} renk={s.baski} ara={0.2}>
                      {etiketYaz(o.ad)}
                    </Yazi>
                  </g>
                )}
              </g>
            );
          }
          case "eq": {
            // sürgülü grafik EQ: dar yuvalar, krom sürgü başları (konumları sabit, tohumdan)
            const n = o.bantlar.length;
            const aralik = (adim * PAY.eq * n) / n;
            return (
              <g key={i}>
                {o.bantlar.map((b, k) => {
                  const sx = yuvarla(cx + (k - (n - 1) / 2) * aralik);
                  const yuk = dr * 2.2;
                  const sv = (v[(k * 7 + 3) % Math.max(1, v.length)] ?? 5) / 10;
                  const sy = yuvarla(ky + yuk / 2 - sv * yuk);
                  return (
                    <g key={b}>
                      <rect x={sx - 0.45} y={ky - yuk / 2} width={0.9} height={yuk} rx={0.45} fill="#060607" />
                      <rect x={sx - Math.min(2.2, aralik * 0.38)} y={sy - 1.1} width={Math.min(4.4, aralik * 0.76)} height={2.2} rx={0.5} fill={`url(#${c.u}krom)`} stroke="#3d4147" strokeWidth={0.2} />
                      {c.t && (
                        <g mask={mask}>
                          <Yazi x={sx} y={etiketY} boy={Math.min(1.9, aralik * 0.55)} renk={s.baski} ara={0}>
                            {b}
                          </Yazi>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          }
          default:
            return null;
        }
      })}
    </g>
  );
}

/** Elmas desenli alüminyum (gözyaşı kabartmalı levha): her hücrede dik açılı iki kabartma */
function ElmasDesen({ id, s }: { id: string; s: number }) {
  const kab = (cx: number, cy: number, a: number) => (
    <g transform={`translate(${cx} ${cy}) rotate(${a})`}>
      <ellipse cx={0.06 * s} cy={0.07 * s} rx={s * 0.19} ry={s * 0.055} fill="#43474d" opacity={0.7} />
      <ellipse rx={s * 0.19} ry={s * 0.055} fill="#d3d7dc" />
      <ellipse cx={-0.03 * s} cy={-0.02 * s} rx={s * 0.14} ry={s * 0.022} fill="#ffffff" opacity={0.9} />
    </g>
  );
  return (
    <pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
      <rect width={s} height={s} fill="#a9aeb5" />
      {kab(s * 0.25, s * 0.25, 45)}
      {kab(s * 0.75, s * 0.75, 45)}
      {kab(s * 0.75, s * 0.25, -45)}
      {kab(s * 0.25, s * 0.75, -45)}
    </pattern>
  );
}

/** GuitarFlex yazısı: düz (eğik değil), kalın sans; beyaz, siyah, krom çerçeveli plaka ya da küçük isim rozeti */
function Logo({ c, x, y, boy, tur, model }: { c: Ctx; x: number; y: number; boy: number; tur: KafaStil["logo"]["tur"]; model?: string }) {
  const { u } = c;
  if (!c.t) {
    return <rect x={x - boy * 1.7} y={y - boy * 0.3} width={boy * 3.4} height={boy * 0.55} rx={boy * 0.18} fill={tur === "siyah" ? "#1b1712" : tur === "plaka" || tur === "rozet" ? "#d6d9dd" : "#ece8dc"} opacity={0.9} />;
  }
  const mask = asinmaMaskesi(c);
  const font = '"Inter Variable", "Helvetica Neue", Helvetica, Arial, sans-serif';
  if (tur === "plaka" || tur === "rozet") {
    const w = boy * (tur === "plaka" ? 11 : 10.6);
    const h = boy * (tur === "plaka" ? 1.95 : 1.7);
    return (
      <g>
        <rect x={x - w / 2 + 0.5} y={y - h / 2 + 0.8} width={w} height={h} rx={h * 0.18} fill="#000" opacity={0.5} />
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h * 0.18} fill={tur === "plaka" ? `url(#${u}krom)` : "#f1efe8"} stroke="#3c4046" strokeWidth={0.3} />
        <rect x={x - w / 2 + h * 0.14} y={y - h / 2 + h * 0.14} width={w - h * 0.28} height={h * 0.72} rx={h * 0.12} fill="#101113" />
        {[x - w / 2 + h * 0.07, x + w / 2 - h * 0.07].map((vx) => (
          <circle key={vx} cx={vx} cy={y} r={h * 0.045} fill="#55585e" />
        ))}
        <g mask={mask}>
          <text x={x} y={y + boy * 0.36} textAnchor="middle" fontSize={boy * 0.98} fontWeight={800} letterSpacing={boy * 0.14} fill={tur === "plaka" ? "#e9ebee" : "#f4f2ec"} fontFamily={font}>
            GUITARFLEX
          </text>
        </g>
      </g>
    );
  }
  const dolgu = tur === "siyah" ? "#17140f" : "#f2efe6";
  return (
    <g mask={mask}>
      <text x={x + boy * 0.05} y={y + boy * 0.08} textAnchor="middle" fontSize={boy * 1.4} fontWeight={800} letterSpacing={-boy * 0.02} fill="#000" fillOpacity={tur === "siyah" ? 0.12 : 0.5} fontFamily={font}>
        GuitarFlex
      </text>
      <text x={x} y={y} textAnchor="middle" fontSize={boy * 1.4} fontWeight={800} letterSpacing={-boy * 0.02} fill={dolgu} fontFamily={font}>
        GuitarFlex
      </text>
      {model && (
        <text x={x} y={y + boy * 0.95} textAnchor="middle" fontSize={boy * 0.42} fontWeight={700} letterSpacing={boy * 0.16} fill={dolgu} fillOpacity={0.85} fontFamily={font}>
          {model.toUpperCase()}
        </text>
      )}
    </g>
  );
}

/** Siyah (plastik / deri) köşeler: koyu, mat, hafif parlak kenar */
function SiyahKoseler({ c, x, y, w, h, r = 10 }: { c: Ctx; x: number; y: number; w: number; h: number; r?: number }) {
  const rs = c.z === undefined ? null : rastgele(c.z ^ 0x1cafe);
  return (
    <g>
      {[
        [x, y, 1, 1],
        [x + w, y, -1, 1],
        [x, y + h, 1, -1],
        [x + w, y + h, -1, -1],
      ].map(([kx, ky, sx, sy], i) => {
        const d = `M${kx} ${ky + sy * r} V${ky + sy * 1.6} Q${kx} ${ky} ${kx + sx * 1.6} ${ky} H${kx + sx * r} Q${kx + sx * r * 0.5} ${ky + sy * r * 0.5} ${kx} ${ky + sy * r} Z`;
        return (
          <g key={i}>
            <path d={d} fill="#000" opacity={0.4} transform="translate(0.5 0.8)" />
            <path d={d} fill="#141416" stroke="#2c2d31" strokeWidth={0.4} />
            <path d={`M${kx + sx * 1} ${ky + sy * r * 0.8} V${ky + sy * 1.8} Q${kx + sx * 1} ${ky + sy * 1} ${kx + sx * 1.8} ${ky + sy * 1} H${kx + sx * r * 0.8}`} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={0.4} />
            {rs && rs() < 0.6 && <path d={d} fill="#8a8780" opacity={0.12 + rs() * 0.12} />}
            <circle cx={kx + sx * r * 0.32} cy={ky + sy * r * 0.32} r={0.7} fill="#3a3b3f" />
          </g>
        );
      })}
    </g>
  );
}

export function KafaCizimi({ tur, c, r, v, etiket, adlar }: { tur: KafaTur; c: Ctx; r: string; v: number[]; etiket?: string; adlar: string[] }) {
  const s = KAFA[tur];
  const { u } = c;
  const [dx, dy] = derinlik(s);
  const X = 6;
  const Y = ustPay(s);
  const { w, h } = s;
  const [ix, iy, iw, ih] = [X + s.izgara[0] * w, Y + s.izgara[1] * h, s.izgara[2] * w, s.izgara[3] * h];
  const [py, ph] = [Y + s.panel[0] * h, s.panel[1] * h];
  const panelX = X + w * 0.035;
  const panelW = w * 0.93;
  const koyuTolex = parlak(r) < 0.2;
  return (
    <g>
      <Tanimlar c={c} o={w / 150} seed={tur.length * 13 + 3}>
        <linearGradient id={`${u}kpanel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f5f7" />
          <stop offset="0.45" stopColor="#cdd1d6" />
          <stop offset="0.55" stopColor="#b6bbc2" />
          <stop offset="1" stopColor="#e3e6ea" />
        </linearGradient>
        {s.kumas === "elmas" && c.t && <ElmasDesen id={`${u}elmas`} s={w / 34} />}
        <linearGradient id={`${u}alu`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9dde2" />
          <stop offset="0.5" stopColor="#a7acb3" />
          <stop offset="1" stopColor="#c9cdd2" />
        </linearGradient>
      </Tanimlar>
      <Kasa c={c} x={X} y={Y} w={w} h={h} d={[dx, dy]} renk={r} rx={6} doku={s.doku ?? "tolex"} ust={<Kayis c={c} x={X + w * 0.36 + dx / 2} y={Y + dy / 2} w={w * 0.28} />}>
        {/* ızgara (ayrı kabinli eski tip kafada yok) */}
        {s.izgarasiz ? null : s.kumas === "elmas" ? (
          <g>
            <rect x={ix - 0.8} y={iy - 0.8} width={iw + 1.6} height={ih + 1.6} rx={2.4} fill="#000" opacity={0.6} />
            <rect x={ix} y={iy} width={iw} height={ih} rx={1.8} fill={c.t ? `url(#${u}elmas)` : `url(#${u}alu)`} filter={yuzey(c, "metalik")} />
            <rect x={ix} y={iy} width={iw} height={ih} rx={1.8} fill={`url(#${u}isik)`} />
            {[ix + 3, ix + iw - 3].flatMap((vx) => [iy + 3, iy + ih - 3].map((vy) => <Vida key={`${vx}${vy}`} c={c} x={vx} y={vy} r={1.1} d={vx + vy} />))}
            <Yipranma c={c} x={ix} y={iy} w={iw} h={ih} rx={1.8} tur="panel" renk="#a9aeb5" taban="#2f2a22" anahtar="izgara" />
          </g>
        ) : (
          <g>
            <Izgara c={c} id="kiz" x={ix} y={iy} w={iw} h={ih} kumas={s.kumas} rx={s.biyik ? 3 : 1.5} s={w / 70} />
            <Yipranma c={c} x={ix} y={iy} w={iw} h={ih} rx={3} tur="kumas" renk="#000" taban={s.kumas === "hasir" ? "#5a4526" : "#cfc6b0"} anahtar="izgara" />
          </g>
        )}
        {s.biyik && !s.izgarasiz && <Biyik x={ix - 1.6} y={iy - 1.6} w={iw + 3.2} h={ih + 3.2} rx={3.5} renk={s.biyik} />}
        {etiket && <Logo c={c} x={X + s.logo.x * w} y={Y + s.logo.y * h} boy={s.logo.boy * h} tur={s.logo.tur} model={s.simgeli ? etiket : undefined} />}
        <Panel c={c} s={s} x={panelX} y={py} w={panelW} h={ph} v={v} adlar={adlar} model={etiket} />
        {s.kose === "metal" ? <Koseler c={c} x={X} y={Y} w={w} h={h} r={12} /> : <SiyahKoseler c={c} x={X} y={Y} w={w} h={h} r={10} />}
        {[X + 14, X + w - 24].map((fx) => (
          <rect key={fx} x={fx} y={Y + h - 1} width={10} height={3.5} rx={1.4} fill="#0b0b0c" />
        ))}
        {!koyuTolex && c.t && <rect x={X} y={Y} width={w} height={h} rx={6} fill="none" stroke={koyu(r, 0.5)} strokeOpacity={0.35} strokeWidth={1.2} />}
      </Kasa>
    </g>
  );
}

const parlak = (hex: string) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)?.[1] ?? "333333";
  return (parseInt(m.slice(0, 2), 16) * 0.3 + parseInt(m.slice(2, 4), 16) * 0.59 + parseInt(m.slice(4, 6), 16) * 0.11) / 255;
};
