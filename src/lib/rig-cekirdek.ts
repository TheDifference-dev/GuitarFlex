// Rig'im: kullanıcının gitarını, pedallarını, amfisini, kabinini ve rack/stüdyo ekipmanını bir sinyal zincirine dizdiği,
// yalnız görsel (ses işlemeyen) rig oluşturucunun veri modeli ve zincir işlemleri. React'e ve tarayıcıya bağlı değildir
// (Node'da sınanır: npm run test:rig). Depolama ve kanca: ./rig.ts. Çizimler: src/components/rig/Cizimler.tsx.
//
// Zincir düzeni
//   ana zincir:   [düğüm | paralel blok]*         giriş → … → mikser → çıkış (giriş, mikser ve çıkış sabittir)
//   paralel blok: A yolu [düğüm]* ve B yolu [düğüm]*; zincir bölünür, iki yol sonda birleşir. Rig başına en çok bir blok,
//                 yalnız ana zincirde.
//   efekt döngüsü (FX loop): bir düğümün `dongu` listesi (arayüz yalnız amfilerde açar). Döngüdeki düğümlerin kendi
//                 döngüsü olmaz; döngüsü olan düğüm başka bir döngüye taşınamaz.
// Kap (liste) adresleri: "ana", "a:<blokId>", "b:<blokId>", "dongu:<düğümId>".
// Bütün işlemler değişmez (immutable): yeni nesne döndürür; geçersiz istek girdiyi olduğu gibi geri verir.

// ── Ekipman türleri ve çizimler ─────────────────────────────────────────────

export type Kategori = "gitar" | "pedal" | "amfi" | "kabin" | "rack" | "studyo";

export const KATEGORILER: { id: Kategori; ad: string; tekil: string }[] = [
  { id: "gitar", ad: "Gitar", tekil: "Gitar" },
  { id: "pedal", ad: "Pedal", tekil: "Pedal" },
  { id: "amfi", ad: "Amfi", tekil: "Amfi" },
  { id: "kabin", ad: "Kabin", tekil: "Kabin" },
  { id: "rack", ad: "Rack", tekil: "Rack modülü" },
  { id: "studyo", ad: "Stüdyo", tekil: "Stüdyo" },
];

type CizimTanim = {
  kategori: Kategori;
  /** Tür adı (kitaplıkta ve formda): genel tür, marka ya da model adı değil */
  ad: string;
  /** Sade "düğme" ayarları (yalnız görsel; 0–10) */
  dugmeler: string[];
  /** Zincirdeki olağan sıra: kitaplıktan tıklayarak eklerken öneri yeri bulunur (küçük önce) */
  sira: number;
  /** Seçmeli ayarlar (ör. kabinde hoparlör türü); değer, düğümün `ayar` kaydında seçeneğin sırasıdır (0, 1, 2…) */
  secenekler?: Secenek[];
};

export type Secenek = { ad: string; degerler: string[] };

const c = (kategori: Kategori, ad: string, sira: number, dugmeler: string[] = [], secenekler?: Secenek[]): CizimTanim => ({ kategori, ad, sira, dugmeler, ...(secenekler ? { secenekler } : {}) });
const AMFI_DUGMELERI = ["Kazanç", "Bas", "Orta", "Tiz", "Parlaklık", "Ana ses"];
const EQ_BANTLARI = ["Bas", "Alt orta", "Orta", "Üst orta", "Tiz"];

/** Kabinlerin hoparlör seçeneği: GuitarFlex'in kendi hoparlör türleri (gerçek bir hoparlör modelini adlandırmaz) */
export const HOPARLORLER = ["GF Kor · sıcak, yumuşak tepe", "GF Kılıç · orta-tepe vurgulu", "GF Kristal · temiz, geniş"];
const HOPARLOR: Secenek[] = [{ ad: "Hoparlör", degerler: HOPARLORLER }];

/**
 * Bütün çizim türleri. Her biri src/components/rig/cizim/ altında özgün bir SVG çizimdir: klasik ekipman TÜRLERİNİN
 * genel görünümünden yola çıkar (ör. "yeşil kutulu yumuşak overdrive", "altın panelli İngiliz kafa"), hiçbir ürünün
 * birebir kopyası, görseli ya da logosu değildir. Eski kayıtlarla uyum için ilk sürümün anahtarları korunur.
 */
export const CIZIMLER = {
  // Gitarlar
  "gitar-tek-kesik": c("gitar", "Elektro gitar · tek kesik", 0, ["Ses", "Ton"]),
  "gitar-cift-kesik": c("gitar", "Elektro gitar · çift kesik", 0, ["Ses", "Ton"]),
  "gitar-akustik": c("gitar", "Akustik gitar", 0, ["Ses"]),
  "bas-gitar": c("gitar", "Bas gitar · dört telli", 0, ["Ses", "Ton"]),
  // Pedallar: akort, dinamik, kazanç, filtre, modülasyon, zaman, perde, döngü
  tuner: c("pedal", "Akort pedalı (tuner)", 1),
  wah: c("pedal", "Wah · basma pedallı", 3, ["Konum"]),
  "zarf-filtresi": c("pedal", "Zarf filtresi (envelope)", 3, ["Duyarlılık", "Rezonans", "Karışım"]),
  kompresor: c("pedal", "Kompresör", 3, ["Sıkıştırma", "Atak", "Seviye"]),
  "gurultu-kapisi": c("pedal", "Gürültü kapısı (gate)", 3, ["Eşik", "Bırakma"]),
  boost: c("pedal", "Boost · mini kutu", 3, ["Seviye"]),
  overdrive: c("pedal", "Overdrive · yumuşak (yeşil kutu)", 3, ["Kazanç", "Ton", "Seviye"]),
  "overdrive-seffaf": c("pedal", "Overdrive · şeffaf (kehribar)", 3, ["Kazanç", "Bas", "Tiz", "Seviye"]),
  "overdrive-krem": c("pedal", "Overdrive · blues (krem)", 3, ["Kazanç", "Ton", "Seviye"]),
  distortion: c("pedal", "Distorsiyon · klasik (turuncu)", 3, ["Kazanç", "Ton", "Seviye"]),
  "distortion-modern": c("pedal", "Distorsiyon · yüksek kazanç (mat siyah)", 3, ["Kazanç", "Bas", "Orta", "Tiz", "Seviye"]),
  fuzz: c("pedal", "Fuzz · büyük kutu", 3, ["Fuzz", "Ton", "Seviye"]),
  "fuzz-yuvarlak": c("pedal", "Fuzz · yuvarlak gövde", 3, ["Fuzz", "Seviye"]),
  eq: c("pedal", "EQ pedalı · 5 bant", 3, EQ_BANTLARI),
  chorus: c("pedal", "Chorus · mavi kutu", 3, ["Hız", "Derinlik", "Karışım"]),
  phaser: c("pedal", "Phaser · tek düğme", 3, ["Hız"]),
  flanger: c("pedal", "Flanger", 3, ["Hız", "Derinlik", "Geri besleme"]),
  tremolo: c("pedal", "Tremolo", 3, ["Hız", "Derinlik", "Şekil"]),
  vibe: c("pedal", "Vibe (dönen ses)", 3, ["Hız", "Yoğunluk", "Seviye"]),
  delay: c("pedal", "Delay · analog", 3, ["Zaman", "Geri besleme", "Karışım"]),
  "delay-dijital": c("pedal", "Delay · dijital (tap tempo)", 3, ["Zaman", "Geri besleme", "Karışım", "Ton"]),
  "reverb-yay": c("pedal", "Reverb · yay (spring)", 3, ["Yoğunluk", "Ton", "Karışım"]),
  reverb: c("pedal", "Reverb · salon (hall)", 3, ["Süre", "Ton", "Karışım"]),
  oktav: c("pedal", "Perde / oktav", 3, ["Alt oktav", "Üst oktav", "Doğrudan"]),
  volum: c("pedal", "Volüm pedalı", 3, ["Konum"]),
  looper: c("pedal", "Looper", 3.5, ["Seviye"]),
  // Amfiler
  "amfi-kafa": c("amfi", "Kafa · İngiliz crunch (altın panel)", 4, AMFI_DUGMELERI),
  "amfi-modern": c("amfi", "Kafa · yüksek kazançlı modern", 4, ["Kazanç", "Bas", "Orta", "Tiz", "Parlaklık", "Ana ses"]),
  "amfi-butik": c("amfi", "Kafa · butik lead (krem tolex)", 4, ["Kazanç", "Bas", "Orta", "Tiz", "Ana ses"]),
  "amfi-mini": c("amfi", "Mini kafa · metal kutu", 4, ["Kazanç", "Ton", "Ses"]),
  "amfi-bas": c("amfi", "Bas amfi kafası", 4, ["Kazanç", "Bas", "Alt orta", "Üst orta", "Tiz", "Ana ses"]),
  "amfi-kombo": c("amfi", "Kombo · İngiliz crunch (1x12)", 4, ["Kazanç", "Bas", "Orta", "Tiz", "Reverb", "Ana ses"]),
  "amfi-amerikan": c("amfi", "Kombo · Amerikan temiz (siyah panel, 2x12)", 4, ["Ses", "Tiz", "Orta", "Bas", "Reverb", "Tremolo"]),
  "amfi-cinlayan": c("amfi", "Kombo · İngiliz çınlayan (2x12)", 4, ["Ses", "Tiz", "Bas", "Kesim", "Ana ses"]),
  "amfi-vintage": c("amfi", "Kombo · vintage küçük (tvid)", 4, ["Ses", "Tiz", "Bas"]),
  "amfi-kombo-kucuk": c("amfi", "Kombo · modelleme (dijital)", 4, ["Tür", "Kazanç", "Ton", "Ses"]),
  // Kabinler (hoparlör türü seçilir)
  "kabin-4x12": c("kabin", "Kabin · 4x12 kapalı", 5, [], HOPARLOR),
  "kabin-4x12-modern": c("kabin", "Kabin · 4x12 eğik, metal ızgara", 5, [], HOPARLOR),
  "kabin-2x12": c("kabin", "Kabin · 2x12 kapalı", 5, [], HOPARLOR),
  "kabin-2x12-acik": c("kabin", "Kabin · 2x12 açık arka", 5, [], HOPARLOR),
  "kabin-1x12": c("kabin", "Kabin · 1x12", 5, [], HOPARLOR),
  "kabin-4x10-bas": c("kabin", "Bas kabini · 4x10", 5, [], HOPARLOR),
  // Stüdyo ve rack (mikrofon yok: kullanıcının isteğiyle kaldırıldı; eski kayıtlarda göçle çıkarılır)
  "rack-kompresor": c("rack", "Stüdyo kompresör (VU göstergeli)", 7, ["Eşik", "Oran", "Atak", "Bırakma", "Çıkış"]),
  "rack-limiter": c("rack", "Limiter", 7, ["Eşik", "Tavan", "Bırakma"]),
  "rack-eq": c("rack", "Grafik EQ (rack)", 7, EQ_BANTLARI),
  "rack-parametrik": c("rack", "Parametrik EQ (rack)", 7, ["Bas", "Alt orta", "Üst orta", "Tiz", "Genişlik", "Çıkış"]),
  "rack-delay": c("rack", "Rack delay (dijital)", 7, ["Zaman", "Geri besleme", "Karışım"]),
  "rack-reverb": c("rack", "Plate reverb (rack)", 7, ["Süre", "Ön gecikme", "Karışım"]),
  "rack-coklu": c("rack", "Çoklu efekt (rack)", 7, ["Giriş", "Parametre", "Karışım", "Çıkış"]),
  di: c("studyo", "DI kutusu", 2, ["Seviye"]),
  "ses-karti": c("studyo", "Ses kartı", 8, ["Kazanç", "Çıkış"]),
  yazilim: c("studyo", "Yazılım (amfi simülasyonu)", 9, ["Giriş", "Çıkış"]),
} satisfies Record<string, CizimTanim>;

export type Cizim = keyof typeof CIZIMLER;
export const CIZIM_LISTESI = Object.keys(CIZIMLER) as Cizim[];
export const cizimGecerli = (x: unknown): x is Cizim => typeof x === "string" && Object.hasOwn(CIZIMLER, x);
export const cizimTanimi = (x: Cizim): CizimTanim => CIZIMLER[x];

/** Pedal gövdesi (çizim): kutu, geniş kutu, mini, yuvarlak, iki ayak anahtarlı */
export type PedalGovde = "kutu" | "genis" | "mini" | "yuvarlak" | "cift" | "yatay" | "coklu";
/**
 * Pedalın çizim türünden ayrılan görünüşü: düğme türü (siyah, krom, krem, renkli…), yüzey dokusu, yazı şeridi rengi, ayak
 * anahtarı (yuvarlak düğme ya da alt yarıyı kaplayan basma plakası), ekran, ayak anahtarı sayısı, düğme düzeni, yazı
 * biçimi (genel: sans, serif, retro), LED rengi, kollu anahtar ve köşe vidaları. Yalnız tür ipuçları; marka imzası değil.
 */
export type PedalGorunum = {
  dugme?: "siyah" | "krom" | "altin" | "numarali" | "tavuk" | "krem" | "renkli" | "sapka";
  dugmeRenk?: string;
  yuzey?: "metalik" | "mat" | "parlak" | "cekic" | "firca" | "plastik";
  bant?: string;
  ayak?: "dugme" | "plaka";
  ekran?: boolean;
  ayakSayisi?: number;
  duzen?: "sira" | "ucgen" | "ts";
  font?: "sans" | "serif" | "retro";
  italik?: boolean;
  ledRenk?: string;
  vidali?: boolean;
};
/**
 * Modelin çizim türünden farklı görünüşü (yalnız tür ipuçları; marka imzası değil). `amfi`: kafa düzeni (kafa.tsx),
 * `kabin`: kabin düzeni (amfi.tsx), `led: "ust"`: pedalda LED düğmelerin arasında.
 */
export type Gorunum = { govde?: PedalGovde; amfi?: string; kabin?: string; led?: "ust"; pedal?: PedalGorunum };

export type Ekipman = {
  id: string;
  /** Kullanıcının verdiği ad (metin etiketi; marka logosu yok) */
  ad: string;
  cizim: Cizim;
  /** Ana renk (#rrggbb): gövde, tolex ya da kasa */
  renk: string;
  /** "Ekipmanım" filtresinde görünür */
  benim?: boolean;
  /** Kullanıcının eklediği ya da düzenleyebildiği kayıt (yerleşik kitaplık salt okunur) */
  ozel?: boolean;
  /** Kullanıcının kendi fotoğrafı (IndexedDB anahtarı; yalnız bu bilgisayarda) */
  fotoId?: string;
  /** Fotoğraf varsa hangisi gösterilir (varsayılan: fotoğraf) */
  gorsel?: "foto" | "cizim";
  // ── Kitaplık modellerinin bilgileri (kullanıcı ekipmanında yok) ──
  /**
   * Esinlendiği gerçek ürün ("Marshall JCM800 2203"). Gerçek marka ve model adı YALNIZ bu alanda bulunur: model adında,
   * kimlikte ve çizimde geçmez. Bilgi satırında "Esinlendiği: Marshall JCM800 2203 (1981)" olarak gösterilir.
   */
  esin?: string;
  /** Esinlendiği ürünün çıkış yılı */
  yil?: number;
  /** Kısa tür açıklaması (büyük panelde) */
  aciklama?: string;
  /** Modelin tür satırı (yoksa çizim türünün adı): aynı çizim türünden farklı görünüşlü modeller için */
  turAd?: string;
  /** Pedalın kitaplık süzgecindeki alt türü (yoksa çizim türünden türer; ör. dönen hoparlör "Rotary") */
  altTur?: string;
  /** Modelin kendi düğmeleri (gerçek ürünün kontrol düzeni; yoksa çizim türününkiler) */
  dugmeler?: string[];
  /** Kollu / sürgülü anahtarların adları (yalnız çizimde; ayar tutulmaz) */
  anahtarlar?: string[];
  /** Amfide kanal sayısı */
  kanal?: number;
  /** Kabinde (ve kombo amfide) hoparlör düzeni: "4x12", "2x12", "1x12"… */
  hoparlorDuzeni?: string;
  /** Amfinin eşleşen kabininin kimliği */
  kabin?: string;
  /** Çizim türünün görünüşünden sapmalar (ör. geniş gövde) */
  gorunum?: Gorunum;
  /** Düğme adı değiştiyse eski adlar (eski kayıtların değerleri göçte yeni ada geçer): { eski: yeni } */
  eskiDugmeler?: Record<string, string>;
};

/**
 * Çizimdeki düğmenin sabit, doğal konumu (0–10): ayarlanmaz; modelin kimliğinden ve düğmenin adından türer, her modelde
 * biraz farklıdır (2,5 ile 8 arası, yarım adımlarla). Kayıtlardaki eski düğme değerleri veride kalır ama çizime yansımaz.
 */
export function sabitDugmeDegeri(tohum: string, ad: string): number {
  let h = 2166136261;
  for (const ch of `${tohum}|${ad}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return 2.5 + ((h >>> 0) % 12) * 0.5;
}

/** Modelin düğmeleri: kendi kontrol düzeni, yoksa çizim türününki */
export const dugmeleri = (e: Pick<Ekipman, "cizim" | "dugmeler"> | null | undefined): string[] => e?.dugmeler ?? (e ? CIZIMLER[e.cizim]?.dugmeler ?? [] : []);

/** Kitaplığın pedal alt türleri (süzgeç sırası) */
export const PEDAL_ALT_TURLERI = ["Kompresör", "Overdrive", "Distortion", "Fuzz", "Boost", "Delay", "Reverb", "Chorus", "Flanger", "Phaser", "Tremolo", "Rotary", "Vibe", "Wah", "Oktav / perde", "Filtre", "EQ", "Gürültü kapısı", "Volüm", "Looper", "Akort"] as const;
const ALT_TUR: Partial<Record<Cizim, string>> = {
  kompresor: "Kompresör", overdrive: "Overdrive", "overdrive-seffaf": "Overdrive", "overdrive-krem": "Overdrive", distortion: "Distortion", "distortion-modern": "Distortion",
  fuzz: "Fuzz", "fuzz-yuvarlak": "Fuzz", boost: "Boost", delay: "Delay", "delay-dijital": "Delay", reverb: "Reverb", "reverb-yay": "Reverb", chorus: "Chorus", flanger: "Flanger",
  phaser: "Phaser", tremolo: "Tremolo", vibe: "Vibe", wah: "Wah", oktav: "Oktav / perde", "zarf-filtresi": "Filtre", eq: "EQ", "gurultu-kapisi": "Gürültü kapısı", volum: "Volüm", looper: "Looper", tuner: "Akort",
};
/** Pedalın alt türü (pedal değilse boş) */
export const pedalAltTuru = (e: Pick<Ekipman, "cizim" | "altTur"> | null | undefined): string => (e ? e.altTur ?? ALT_TUR[e.cizim] ?? "" : "");

/** Ekipmanın tür satırı: modelin kendi tür adı, yoksa çizim türünün adı */
export const turAdi = (e: Pick<Ekipman, "cizim" | "turAd"> | null | undefined): string => e?.turAd ?? (e ? CIZIMLER[e.cizim]?.ad ?? "" : "");

/** "Esinlendiği: Marshall JCM800 2203 (1981)" (esin yoksa boş) */
export const esinSatiri = (e: Pick<Ekipman, "esin" | "yil"> | null | undefined): string => (e?.esin ? `Esinlendiği: ${e.esin}${e.yil ? ` (${e.yil})` : ""}` : "");

/** Amfinin eşleşen kabini (kitaplıkta) */
export const eslesenKabin = (e: Pick<Ekipman, "kabin"> | null | undefined): Ekipman | null => (e?.kabin ? (KATALOG.find((x) => x.id === e.kabin) ?? null) : null);

/** Kitaplık modelinin ek bilgileri (esin, yıl, düğmeler…) */
type ModelBilgi = Omit<Ekipman, "id" | "ad" | "cizim" | "renk" | "benim" | "ozel" | "fotoId" | "gorsel">;

/** Kitaplığın yerleşik modelleri: hepsi GuitarFlex adlı, özgün çizimli (gerçek ürün adı, logosu ya da görseli yok) */
const k = (cizim: Cizim, ad: string, renk: string, bilgi: ModelBilgi = {}): Ekipman => ({ id: `k-${cizim}`, ad: `GuitarFlex ${ad}`, cizim, renk, ...bilgi });
/** Aynı çizim türünden ek model: kimlik GuitarFlex adından türer ("k-ruby-comp"); gerçek ad kimlikte geçmez */
const m = (cizim: Cizim, ad: string, renk: string, bilgi: ModelBilgi = {}): Ekipman => ({
  id: `k-${ad.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  ad: `GuitarFlex ${ad}`,
  cizim,
  renk,
  ...bilgi,
});

/** İlk sürümden gelen modeller (kimlikleri korunur; esin bilgileri aşağıda eklenir) */
const TEMEL_MODELLER: Ekipman[] = [
  k("gitar-tek-kesik", "Single Cut", "#7a1f1c"),
  k("gitar-cift-kesik", "Double Cut S", "#2f6f9f"),
  k("gitar-akustik", "Dread Akustik", "#c98b4a"),
  k("bas-gitar", "Low Four Bas", "#1d1c1f"),
  k("tuner", "Pitch Eye", "#2b2d33"),
  k("wah", "Howl Wah", "#2a2b2f"),
  k("zarf-filtresi", "Bloom Filter", "#b6c43a"),
  k("kompresor", "Squeeze Comp", "#eceae4"),
  m("kompresor", "Ruby Comp", "#c3262b", {
    esin: "MXR Dyna Comp",
    yil: 1972,
    aciklama: "İki düğmeli klasik pedal kompresörü: sesi sıkıştırıp sustain verir, temiz ritimde ve funk'ta vuruşları eşitler.",
    dugmeler: ["Çıkış", "Duyarlılık"],
    gorunum: { led: "ust" },
  }),
  k("gurultu-kapisi", "Silent Gate", "#5a5e66"),
  k("boost", "Lift Boost", "#d9d4c7"),
  k("overdrive", "Verde OD", "#2e8f4e", {
    esin: "Ibanez TS808 Tube Screamer",
    yil: 1979,
    aciklama: "Orta frekansı öne çıkaran yumuşak overdrive: amfiyi hafifçe sürer, solo sesini sıkılaştırır.",
    dugmeler: ["Kazanç", "Ton", "Seviye"],
  }),
  k("overdrive-seffaf", "Amber Drive", "#c8902a"),
  k("overdrive-krem", "Crema OD", "#e9dfc6"),
  k("distortion", "Furnace", "#e2711d"),
  k("distortion-modern", "Iron Dist", "#26272b"),
  k("fuzz", "Mor Duman Fuzz", "#6b3fa0"),
  k("fuzz-yuvarlak", "Fuzz Moon", "#b8282e"),
  k("eq", "Contour EQ", "#c9ccd2"),
  k("chorus", "Aqua Chorus", "#5fb8d8"),
  k("phaser", "Orbit Phase", "#e8741e"),
  k("flanger", "Jet Stream Flanger", "#6a56c9"),
  k("tremolo", "Pulse Trem", "#2f7f78"),
  k("vibe", "Swirl Vibe", "#7a2433"),
  k("delay", "Dusk Echo", "#c9ccd0", {
    esin: "Electro-Harmonix Deluxe Memory Man",
    yil: 1978,
    aciklama: "Kova zincirli (BBD) analog delay: sıcak, kararan tekrarlar; chorus / vibrato modülasyonu eklenebilir. Geniş, çıplak alüminyum gövde.",
    turAd: "Delay · analog (geniş alüminyum kutu)",
    dugmeler: ["Seviye", "Karışım", "Geri besleme", "Zaman", "Modülasyon"],
    anahtarlar: ["Chorus · Vibrato"],
    gorunum: { govde: "yatay" },
  }),
  k("delay-dijital", "Prism Delay", "#9aa6b4"),
  k("reverb-yay", "Coil Spring", "#56b3a8"),
  k("reverb", "Hall Verb", "#22305e"),
  k("oktav", "Octa Shift", "#c2245c"),
  k("volum", "Swell Volume", "#1f2023"),
  k("looper", "Loop Lab", "#b02a3e"),
  k("amfi-kafa", "Brit 800 Head", "#1c1c1e", {
    esin: "Marshall JCM800 2203",
    yil: 1981,
    aciklama: "100 W lambalı İngiliz kafa: tek kanal, ana ses (master) düğmesi; kuru, ısırgan rock / metal crunch'ı.",
    dugmeler: ["Presence", "Bas", "Orta", "Tiz", "Master", "Kazanç"],
    eskiDugmeler: { Parlaklık: "Presence", "Ana ses": "Master" },
    kanal: 1,
    kabin: "k-kabin-4x12",
  }),
  k("amfi-modern", "Titan 120 Head", "#18181a", {
    esin: "Mesa/Boogie Dual Rectifier",
    yil: 1989,
    aciklama: "İki kanallı yüksek kazançlı Amerikan kafa: her kanalın kendi kazanç, ton ve master düğmeleri; kalın, sıkı modern metal sesi.",
    dugmeler: ["K2 · Kazanç", "K2 · Tiz", "K2 · Orta", "K2 · Bas", "K2 · Presence", "K2 · Master", "K1 · Kazanç", "K1 · Tiz", "K1 · Orta", "K1 · Bas", "K1 · Presence", "K1 · Master"],
    eskiDugmeler: { Kazanç: "K2 · Kazanç", Bas: "K2 · Bas", Orta: "K2 · Orta", Tiz: "K2 · Tiz", Parlaklık: "K2 · Presence", "Ana ses": "K2 · Master" },
    anahtarlar: ["K2 mod", "K1 mod"],
    kanal: 2,
    kabin: "k-kabin-4x12-modern",
  }),
  m("amfi-modern", "Crush 120 Head", "#151517", {
    esin: "Peavey 5150",
    yil: 1992,
    aciklama: "İki kanallı (ritim ve lead) yüksek kazançlı kafa: ortak üç bant EQ, rezonans ve presence; 90'ların metal sesi.",
    turAd: "Kafa · yüksek kazanç (siyah panel)",
    dugmeler: ["Ritim · Kazanç", "Ritim · Seviye", "Lead · Kazanç", "Lead · Seviye", "Bas", "Orta", "Tiz", "Rezonans", "Presence"],
    anahtarlar: ["Parlak", "Crunch", "Kanal"],
    kanal: 2,
    gorunum: { amfi: "crush" },
  }),
  m("amfi-kafa", "Valve Verb 100 Head", "#d8641c", {
    esin: "Orange Rockerverb 100",
    yil: 2004,
    aciklama: "Turuncu tolexli iki kanallı İngiliz kafa: temiz ve kirli kanal, lambalı reverb; yazısız, simgeli kontrol paneli.",
    turAd: "Kafa · İngiliz, simgeli panel (turuncu tolex)",
    dugmeler: ["Temiz · Ses", "Temiz · Bas", "Temiz · Tiz", "Kirli · Kazanç", "Kirli · Bas", "Kirli · Orta", "Kirli · Tiz", "Kirli · Ses", "Reverb"],
    anahtarlar: ["Kanal"],
    kanal: 2,
    gorunum: { amfi: "valf" },
  }),
  m("amfi-kafa", "Studio Power Head", "#18181a", {
    esin: "Hiwatt DR103",
    yil: 1968,
    aciklama: "Siyah panelli, beyaz yazılı 100 W İngiliz kafa: normal ve parlak kanal, ortak EQ; çok temiz, güçlü ve net.",
    turAd: "Kafa · İngiliz temiz güç (siyah panel)",
    dugmeler: ["Normal", "Parlak", "Bas", "Tiz", "Orta", "Presence", "Master"],
    kanal: 2,
    gorunum: { amfi: "studyo" },
  }),
  k("amfi-butik", "Velvet Lead Head", "#e8dcc2"),
  k("amfi-mini", "Lunchbox 20", "#2f8f8a"),
  k("amfi-bas", "Low Down Bass Head", "#202124"),
  k("amfi-kombo", "Brit Crunch Combo", "#1f1e1c"),
  k("amfi-amerikan", "Coast Clean 2x12", "#151517"),
  k("amfi-cinlayan", "Bell Chime 2x12", "#5a1d22"),
  k("amfi-vintage", "Fawn 15 Tvid", "#c9a86a"),
  k("amfi-kombo-kucuk", "Studio Mini Combo", "#34373d"),
  k("kabin-4x12", "412 Brit Cab", "#1c1c1e", {
    esin: "Marshall 1960B",
    aciklama: "Düz ön yüzlü, kapalı arkalı 4x12 kabin: sıkı bas, odaklı orta; İngiliz kafaların klasik eşi.",
    hoparlorDuzeni: "4x12",
  }),
  k("kabin-4x12-modern", "412 Titan Cab", "#161618"),
  k("kabin-2x12", "212 Closed Cab", "#202022"),
  k("kabin-2x12-acik", "212 Open Back Cab", "#5b3a26"),
  k("kabin-1x12", "112 Compact Cab", "#1c1c1e"),
  k("kabin-4x10-bas", "410 Bass Cab", "#1b1b1d"),
  k("rack-kompresor", "Opto Studio Comp", "#7f8c99"),
  k("rack-limiter", "Peak Limiter", "#1d1e21"),
  k("rack-eq", "15-Band Graphic", "#c9ccd2"),
  k("rack-parametrik", "Para EQ 4", "#2b3442"),
  k("rack-delay", "Time Rack Delay", "#1e2a3a"),
  k("rack-reverb", "Plate Verb", "#c8b48a"),
  k("rack-coklu", "Multi FX Rack", "#232428"),
  k("di", "DI Box", "#c8a12c"),
  k("ses-karti", "Duo Interface", "#45474d"),
  k("yazilim", "Sim Studio", "#2a2c31"),
];

/** Kitaplık modeli kısayolu: esin, yıl ve kontrol düzeniyle (gerçek ad yalnız `esin` alanında) */
const md = (cizim: Cizim, ad: string, renk: string, esin: string, yil: number | undefined, dugmeler: string[], ek: ModelBilgi = {}): Ekipman => m(cizim, ad, renk, { esin, ...(yil ? { yil } : {}), dugmeler, ...ek });
/** Basma plakalı kompakt gövde (alt yarıyı kaplayan ayak plakası) ve yuvarlak ayak anahtarlı kutu */
const PLAKA_G: Gorunum = { pedal: { ayak: "plaka", duzen: "sira" } };
const PLAKA: ModelBilgi = { gorunum: PLAKA_G };
const DUGME: ModelBilgi = { gorunum: { pedal: { ayak: "dugme", duzen: "sira" } } };
const EGIK_KABIN = ["brit-egik", "brit-vintage", "gumus-egik", "brit-v", "crush-egik", "celik"];
const c4 = (kabin: string, ek: ModelBilgi = {}): ModelBilgi => ({ hoparlorDuzeni: "4x12", gorunum: { kabin }, turAd: `Kabin · 4x12 ${EGIK_KABIN.includes(kabin) ? "açılı" : "düz"}, kapalı arka`, ...ek });

/** İlk sürüm modellerinin esin bilgileri ve kontrol düzenleri (kimlik ve ad değişmez) */
const TEMEL_EK: Record<string, Partial<Ekipman>> = {
  "k-tuner": { esin: "Boss TU-3", yil: 2009 },
  "k-wah": { esin: "Vox V846 / Clyde McCoy", yil: 1967 },
  "k-zarf-filtresi": { esin: "Musitronics Mu-Tron III", yil: 1972, dugmeler: ["Kazanç", "Tepe"], anahtarlar: ["Mod", "Aralık", "Yön"] },
  "k-kompresor": { esin: "Boss CS-2 Compression Sustainer", yil: 1981, dugmeler: ["Seviye", "Atak", "Sıkıştırma"], gorunum: PLAKA_G },
  "k-gurultu-kapisi": { esin: "Boss NS-2", yil: 1987, dugmeler: ["Eşik", "Bırakma", "Mod"], gorunum: PLAKA_G },
  "k-boost": { esin: "Electro-Harmonix LPB-1", yil: 1968, dugmeler: ["Ses"] },
  "k-overdrive-seffaf": { esin: "Klon Centaur", yil: 1994, dugmeler: ["Kazanç", "Tiz", "Seviye"] },
  "k-overdrive-krem": { esin: "Boss BD-2 Blues Driver", yil: 1995, dugmeler: ["Seviye", "Ton", "Kazanç"], gorunum: { pedal: { ayak: "plaka", duzen: "sira", vidali: false } } },
  "k-distortion": { esin: "Boss DS-1", yil: 1978, dugmeler: ["Seviye", "Ton", "Distorsiyon"], gorunum: PLAKA_G },
  "k-distortion-modern": { esin: "Boss MT-2 Metal Zone", yil: 1991, dugmeler: ["Seviye", "Tiz", "Bas", "Orta", "Orta frekans", "Distorsiyon"], gorunum: PLAKA_G },
  "k-fuzz": { esin: "Electro-Harmonix Big Muff Pi", yil: 1969, dugmeler: ["Ses", "Ton", "Sustain"] },
  "k-fuzz-yuvarlak": { esin: "Arbiter Fuzz Face", yil: 1966, dugmeler: ["Ses", "Fuzz"] },
  "k-eq": { esin: "MXR M109 6 Band EQ", yil: 1975, turAd: "EQ · 6 bant", dugmeler: ["100", "200", "400", "800", "1K6", "3K2"] },
  "k-chorus": { esin: "Boss CE-2", yil: 1979, dugmeler: ["Hız", "Derinlik"], gorunum: PLAKA_G },
  "k-phaser": { esin: "MXR Phase 90", yil: 1974, dugmeler: ["Hız"] },
  "k-flanger": { esin: "Electro-Harmonix Electric Mistress", yil: 1976, dugmeler: ["Hız", "Aralık", "Renk"], anahtarlar: ["Filtre matrisi"] },
  "k-tremolo": { esin: "Boss TR-2", yil: 1997, dugmeler: ["Hız", "Dalga", "Derinlik"], gorunum: PLAKA_G },
  "k-vibe": { esin: "Shin-ei Uni-Vibe", yil: 1968, dugmeler: ["Hız", "Yoğunluk", "Seviye"], anahtarlar: ["Chorus · Vibrato"] },
  "k-delay-dijital": { esin: "Boss DD-3", yil: 1986, turAd: "Delay · dijital (kompakt)", dugmeler: ["Seviye", "Geri besleme", "Zaman", "Mod"], gorunum: { govde: "kutu", pedal: { ayak: "plaka", ekran: false, duzen: "sira" } } },
  "k-reverb-yay": { esin: "Fender 6G15 Reverb Unit", yil: 1961, dugmeler: ["Yoğunluk", "Karışım", "Ton"] },
  "k-reverb": { esin: "TC Electronic Hall of Fame", yil: 2011, dugmeler: ["Süre", "Ton", "Seviye", "Tür"] },
  "k-oktav": { esin: "Electro-Harmonix Micro POG", yil: 2009 },
  "k-volum": { esin: "Ernie Ball VP Jr", yil: 1990 },
  "k-looper": { esin: "TC Electronic Ditto Looper", yil: 2013, dugmeler: ["Seviye"] },
  "k-amfi-butik": {
    esin: "Bogner Ecstasy", yil: 1992, renk: "#19191b", turAd: "Kafa · butik lead, üç kanal (krom panel)", kanal: 3, kabin: "k-kabin-2x12", gorunum: { amfi: "velvet" },
    dugmeler: ["K1 · Kazanç", "K1 · Bas", "K1 · Orta", "K1 · Tiz", "K1 · Ses", "K2 · Kazanç", "K2 · Ses", "K3 · Kazanç", "K3 · Ses", "K2/3 · Bas", "K2/3 · Orta", "K2/3 · Tiz", "Presence 1", "Presence 2", "Master"],
    eskiDugmeler: { Kazanç: "K1 · Kazanç", Bas: "K1 · Bas", Orta: "K1 · Orta", Tiz: "K1 · Tiz", "Ana ses": "Master" },
    anahtarlar: ["Ön EQ", "Boost", "Pleksi"],
  },
  "k-amfi-mini": { esin: "Orange Tiny Terror", yil: 2006, dugmeler: ["Ses", "Ton", "Kazanç"], anahtarlar: ["Güç 15 · 7"], kabin: "k-kabin-1x12" },
  "k-studio-power-head": { kabin: "k-412-power-cab" },
  "k-crush-120-head": { kabin: "k-412-crush-cab" },
  "k-valve-verb-100-head": { kabin: "k-412-valve-verb-cab" },
  "k-kabin-4x12-modern": { esin: "Mesa/Boogie Rectifier Standard 4x12 (açılı)", hoparlorDuzeni: "4x12" },
  "k-kabin-4x12": { turAd: "Kabin · 4x12 düz, kapalı arka" },
  "k-kabin-2x12": { esin: "Bogner 2x12", hoparlorDuzeni: "2x12" },
  "k-kabin-2x12-acik": { esin: "Fender Bassman 2x12 (6G6 ile)", hoparlorDuzeni: "2x12" },
  "k-kabin-1x12": { esin: "Orange PPC112", hoparlorDuzeni: "1x12" },
};

/** Kafa amfiler (20'nin kalanı) */
const YENI_KAFALAR: Ekipman[] = [
  md("amfi-kafa", "Brit 900 Head", "#1c1c1e", "Marshall JCM900 4100 Dual Reverb", 1990, ["A kazanç", "B kazanç", "Tiz", "Orta", "Bas", "Presence", "A reverb", "A master", "B reverb", "B master"], { kanal: 2, kabin: "k-412-brit-slant-cab", turAd: "Kafa · İngiliz iki kanal, reverb (altın panel)", gorunum: { amfi: "brit900" } }),
  md("amfi-kafa", "Brit Classic 100 Head", "#1d1c1b", "Marshall 1959 Super Lead", 1965, ["Presence", "Bas", "Orta", "Tiz", "Ses 1", "Ses 2"], { kanal: 2, kabin: "k-412-brit-vintage-cab", turAd: "Kafa · İngiliz klasik (pleksi panel)", gorunum: { amfi: "klasik" } }),
  md("amfi-kafa", "Brit Origin Head", "#1e1d1c", "Marshall JTM45", 1963, ["Presence", "Bas", "Orta", "Tiz", "Ses 1", "Ses 2"], { kanal: 2, kabin: "k-412-brit-tall-cab", turAd: "Kafa · İngiliz ilk kuşak (altın panel)", gorunum: { amfi: "koken" } }),
  md("amfi-kafa", "Brit Silver Head", "#b9bcc1", "Marshall Silver Jubilee 2555", 1987, ["Presence", "Bas", "Orta", "Tiz", "Çıkış master", "Lead master", "Kazanç"], { kanal: 1, anahtarlar: ["Klip", "Triyot"], kabin: "k-412-silver-cab", turAd: "Kafa · İngiliz, gümüş tolex", gorunum: { amfi: "gumus" } }),
  md("amfi-kafa", "Brit Dual Super Head", "#1c1c1e", "Marshall JCM2000 DSL100", 1997, ["Klasik · Kazanç", "Klasik · Ses", "Ultra · Kazanç", "Ultra · Ses", "Bas", "Orta", "Tiz", "Presence", "Reverb K", "Reverb U"], { kanal: 2, kabin: "k-412-brit-v-cab", turAd: "Kafa · İngiliz iki kanal (altın panel)", gorunum: { amfi: "dsl" } }),
  md("amfi-modern", "Cali Lead Head", "#1a1a1c", "Mesa/Boogie Mark IIC+", 1983, ["Ses", "Tiz", "Bas", "Orta", "Master", "Lead sürüş", "Lead master", "Presence"], { kanal: 2, kabin: "k-412-cali-cab", turAd: "Kafa · Amerikan lead, sürgülü EQ", gorunum: { amfi: "cali" } }),
  md("amfi-modern", "Tri Crush Head", "#151517", "EVH 5150 III 100W", 2007, ["K1 · Kazanç", "K1 · Bas", "K1 · Orta", "K1 · Tiz", "K1 · Ses", "K2 · Kazanç", "K2 · Bas", "K2 · Orta", "K2 · Tiz", "K2 · Ses", "K3 · Kazanç", "K3 · Bas", "K3 · Orta", "K3 · Tiz", "K3 · Ses", "Presence", "Rezonans"], { kanal: 3, kabin: "k-412-tri-cab", turAd: "Kafa · üç kanallı yüksek kazanç", gorunum: { amfi: "tri" } }),
  md("amfi-modern", "Solo Lead Head", "#161618", "Soldano SLO-100", 1987, ["Normal kazanç", "OD kazanç", "Bas", "Orta", "Tiz", "Normal master", "OD master", "Presence"], { kanal: 2, anahtarlar: ["Parlak", "Crunch"], kabin: "k-412-solo-cab", turAd: "Kafa · Amerikan lead (krom panel)", gorunum: { amfi: "solo" } }),
  md("amfi-modern", "Quad Channel Head", "#171719", "Diezel VH4", 1994, ["Temiz · Kazanç", "Temiz · Bas", "Temiz · Orta", "Temiz · Tiz", "Temiz · Master", "Crunch · Kazanç", "Crunch · Bas", "Crunch · Orta", "Crunch · Tiz", "Crunch · Master", "Mega · Kazanç", "Mega · Bas", "Mega · Orta", "Mega · Tiz", "Mega · Master", "Lead · Kazanç", "Lead · Bas", "Lead · Orta", "Lead · Tiz", "Lead · Master", "Master", "Presence", "Derinlik"], { kanal: 4, kabin: "k-412-quad-cab", turAd: "Kafa · dört kanallı Alman yüksek kazanç", gorunum: { amfi: "dortlu" } }),
  md("amfi-modern", "Steel Orb Head", "#18181a", "ENGL Powerball", 1997, ["K1 · Kazanç", "K1 · Bas", "K1 · Orta", "K1 · Tiz T", "K1 · Tiz C", "K1 · Temiz ses", "K1 · Crunch ses", "K2 · Kazanç", "K2 · Bas", "K2 · Orta açık", "K2 · Orta odak", "K2 · Tiz", "K2 · Düşük ses", "K2 · Yüksek ses", "Presence", "Derinlik"], { kanal: 4, kabin: "k-412-steel-cab", turAd: "Kafa · dört kanal, krom ön yüz", gorunum: { amfi: "celik" } }),
  md("amfi-kafa", "Hazel 100 Head", "#19191b", "Friedman BE-100", 2012, ["Temiz · Ses", "Temiz · Tiz", "Temiz · Bas", "BE · Kazanç", "BE · Bas", "BE · Orta", "BE · Tiz", "BE · Presence", "BE · Master"], { kanal: 2, anahtarlar: ["SAT", "FAT", "C45"], kabin: "k-412-hazel-cab", turAd: "Kafa · modern İngiliz tipi (tuz-biber kumaş)", gorunum: { amfi: "hazel" } }),
  md("amfi-kafa", "Group 100 Head", "#1b1b1d", "Laney Supergroup LA100BL", 1968, ["Presence", "Bas", "Orta", "Tiz", "Ses 1", "Ses 2"], { kanal: 2, kabin: "k-412-group-cab", turAd: "Kafa · İngiliz 70'ler (alüminyum panel)", gorunum: { amfi: "grup" } }),
  md("amfi-kafa", "Coast Piggy Head", "#d8c49b", "Fender Bassman (6G6, ayrı kafa)", 1961, ["Bas kanalı · Ses", "Bas kanalı · Tiz", "Bas kanalı · Bas", "Normal · Ses", "Normal · Tiz", "Normal · Bas", "Presence"], { kanal: 2, kabin: "k-kabin-2x12-acik", turAd: "Kafa · Amerikan, ayrı kabinli (açık sarı tolex)", gorunum: { amfi: "piggy" } }),
];

/** Eşleşen kabinler (20'nin kalanı) */
const YENI_KABINLER: Ekipman[] = [
  md("kabin-4x12", "412 Brit Slant Cab", "#1c1c1e", "Marshall 1960A (açılı)", undefined, [], c4("brit-egik")),
  md("kabin-4x12", "412 Brit Vintage Cab", "#1d1c1b", "Marshall 1960AX", undefined, [], c4("brit-vintage")),
  md("kabin-4x12", "412 Brit Tall Cab", "#1e1d1c", "Marshall 1960TV", undefined, [], c4("brit-uzun")),
  md("kabin-4x12", "412 Silver Cab", "#b9bcc1", "Marshall 2551A", undefined, [], c4("gumus-egik")),
  md("kabin-4x12", "412 Brit V Cab", "#1c1c1e", "Marshall 1960AV", undefined, [], c4("brit-v")),
  md("kabin-4x12", "412 Cali Cab", "#1a1a1c", "Mesa/Boogie 4x12 Standard (düz)", undefined, [], c4("cali")),
  md("kabin-4x12-modern", "412 Crush Cab", "#151517", "Peavey 5150 4x12 (açılı)", undefined, [], c4("crush-egik")),
  md("kabin-4x12", "412 Tri Cab", "#151517", "EVH 5150 III 4x12", undefined, [], c4("tri")),
  md("kabin-4x12", "412 Solo Cab", "#161618", "Soldano 4x12", undefined, [], c4("solo")),
  md("kabin-4x12", "412 Valve Verb Cab", "#d8641c", "Orange PPC412", undefined, [], c4("valf")),
  md("kabin-4x12", "412 Power Cab", "#18181a", "Hiwatt SE4123", undefined, [], c4("power")),
  md("kabin-4x12", "412 Quad Cab", "#171719", "Diezel 412", undefined, [], c4("dortlu")),
  md("kabin-4x12-modern", "412 Steel Cab", "#18181a", "ENGL E412 Pro XXL", undefined, [], c4("celik")),
  md("kabin-4x12", "412 Hazel Cab", "#19191b", "Friedman 4x12", undefined, [], c4("hazel")),
  md("kabin-4x12", "412 Group Cab", "#1b1b1d", "Laney 4x12", undefined, [], c4("grup")),
];

/** Pedallar (97'nin kalanı) */
const YENI_PEDALLAR: Ekipman[] = [
  // Kompresör
  md("kompresor", "Grey Squash", "#8e9196", "Ross Compressor", 1978, ["Sustain", "Çıkış"], DUGME),
  md("kompresor", "Plus Squeeze", "#2a2b2e", "Keeley Compressor Plus", 2017, ["Seviye", "Sustain", "Karışım", "Ton"], { anahtarlar: ["Tek · Çift"], ...DUGME }),
  md("kompresor", "Ego Squeeze", "#2f5d9a", "Wampler Ego Compressor", 2011, ["Sustain", "Atak", "Ses", "Ton", "Karışım"], DUGME),
  // Overdrive
  md("overdrive", "Golden Super OD", "#e8c51c", "Boss SD-1 Super Overdrive", 1981, ["Seviye", "Ton", "Kazanç"], PLAKA),
  md("overdrive", "First Drive", "#e9d33a", "Boss OD-1 Over Drive", 1977, ["Seviye", "Kazanç"], PLAKA),
  md("overdrive", "Breaker Drive", "#1f1f22", "Marshall Bluesbreaker (pedal)", 1991, ["Ses", "Kazanç", "Ton"], { gorunum: { pedal: { ayak: "dugme", duzen: "sira", bant: "#c9a441" } } }),
  md("overdrive", "Glass Drive", "#e9e9e4", "Paul Cochrane Timmy", 2000, ["Kazanç", "Ses", "Bas", "Tiz"], { anahtarlar: ["Kırpma"], ...DUGME }),
  md("overdrive", "Obsidian Drive", "#efe9da", "Fulltone OCD", 2004, ["Ses", "Kazanç", "Ton"], { anahtarlar: ["HP · LP"], ...DUGME }),
  md("overdrive", "Royal Pair Drive", "#3b3f8f", "Analog Man King of Tone", 2003, ["Ses A", "Kazanç A", "Ton A", "Ses B", "Kazanç B", "Ton B"], { gorunum: { govde: "coklu", pedal: { ayakSayisi: 2 } } }),
  md("overdrive", "Full Boost Drive", "#3d5ca8", "Fulltone Full-Drive 2", 1995, ["Ses", "Ton", "Kazanç", "Boost"], { anahtarlar: ["Mod"], gorunum: { govde: "coklu", pedal: { ayakSayisi: 2 } } }),
  // Distortion
  md("distortion", "Black Filter Dist", "#1b1b1c", "ProCo RAT", 1978, ["Distorsiyon", "Filtre", "Ses"], { gorunum: { pedal: { ayak: "dugme", bant: "", font: "retro" } } }),
  md("distortion", "Sun Plus Dist", "#f2c418", "MXR Distortion+", 1973, ["Çıkış", "Distorsiyon"], { gorunum: { pedal: { ayak: "dugme", bant: "" } } }),
  md("distortion", "Saw Dist", "#1d1d1f", "Boss HM-2 Heavy Metal", 1983, ["Seviye", "Bas rengi", "Tiz rengi", "Distorsiyon"], { gorunum: { pedal: { ayak: "plaka", bant: "#e8731e" } } }),
  md("distortion", "Gear Shift Dist", "#ef8a1d", "Boss DS-2 Turbo Distortion", 1987, ["Seviye", "Ton", "Distorsiyon", "Mod"], { gorunum: { pedal: { ayak: "plaka", bant: "" } } }),
  md("distortion", "Crown Dist", "#202022", "Marshall Guv'nor", 1988, ["Kazanç", "Bas", "Orta", "Tiz", "Seviye"], { gorunum: { pedal: { ayak: "dugme", bant: "#c9a441" } } }),
  md("distortion-modern", "DI Amp Box", "#b9bcc0", "Tech 21 SansAmp GT2", 1993, ["Seviye", "Tiz", "Bas", "Sürüş"], { anahtarlar: ["Amfi", "Mod", "Mikrofon"], turAd: "Distorsiyon · amfi simülasyonlu DI", gorunum: { pedal: { ayak: "dugme", yuzey: "firca", dugme: "siyah" } } }),
  md("distortion-modern", "Hazel Dist", "#232325", "Friedman BE-OD", 2016, ["Ses", "Kazanç", "Bas", "Tiz", "Presence", "Sıkılık"], { gorunum: { pedal: { ayak: "dugme" } } }),
  md("distortion-modern", "Uproar Dist", "#3a3a3d", "Suhr Riot", 2011, ["Distorsiyon", "Ton", "Seviye"], { anahtarlar: ["Karakter"], gorunum: { pedal: { ayak: "dugme" } } }),
  // Delay
  md("delay", "Cave Echo", "#b8343f", "Boss DM-2", 1981, ["Zaman", "Karışım", "Geri besleme"], PLAKA),
  md("delay", "Quad Echo", "#3f8f3a", "Line 6 DL4", 1999, ["Tür", "Zaman", "Tekrar", "Ayar 1", "Ayar 2", "Karışım"], { gorunum: { govde: "coklu", pedal: { ayakSayisi: 4, dugme: "siyah" } } }),
  md("delay", "Soot Delay", "#1e3a2c", "MXR Carbon Copy", 2008, ["Geri besleme", "Karışım", "Zaman"], { anahtarlar: ["Mod"], ...DUGME }),
  md("delay-dijital", "Horizon Delay", "#5b7088", "Strymon TimeLine", 2011, ["Değer", "Zaman", "Tekrar", "Karışım", "Filtre", "Pürüz", "Hız", "Derinlik", "Tür"], { gorunum: { govde: "coklu", pedal: { ayakSayisi: 3, ekran: true, yuzey: "firca", dugme: "krom" } } }),
  md("delay-dijital", "Flash Echo", "#c9cbce", "TC Electronic Flashback", 2011, ["Zaman", "Geri besleme", "Seviye", "Tür"], { anahtarlar: ["Bölüm"], gorunum: { govde: "kutu", pedal: { ekran: false, ayak: "dugme", dugme: "siyah" } } }),
  md("delay", "Tape Canyon", "#8a9a8f", "Strymon El Capistan", 2010, ["Zaman", "Karışım", "Tekrar", "Bant aşınması", "Ayar"], { anahtarlar: ["Bant hızı", "Mod"], gorunum: { govde: "coklu", pedal: { ayakSayisi: 3, yuzey: "firca", dugme: "krom" } } }),
  md("delay", "Orbit Tape Echo", "#3f6b3a", "Boss RE-20 Space Echo", 2007, ["Tekrar hızı", "Yoğunluk", "Eko seviyesi", "Bas", "Tiz", "Mod"], { gorunum: { govde: "coklu", pedal: { ayakSayisi: 2 } } }),
  md("delay", "Mini Analog Echo", "#a3402c", "Ibanez AD9 Analog Delay", 1982, ["Zaman", "Tekrar", "Karışım"], PLAKA),
  // Reverb
  md("reverb", "Halo Verb", "#d6d6d2", "Electro-Harmonix Holy Grail", 2002, ["Reverb"], { anahtarlar: ["Tür"], ...DUGME }),
  md("reverb", "Wide Sky Verb", "#3a4c76", "Strymon BigSky", 2013, ["Değer", "Süre", "Ön gecikme", "Karışım", "Ton", "Ayar 1", "Ayar 2", "Mod", "Tür"], { gorunum: { govde: "coklu", pedal: { ayakSayisi: 3, ekran: true, yuzey: "firca", dugme: "krom" } } }),
  md("reverb", "Six Verb", "#2f5fb3", "Boss RV-6", 2014, ["Seviye", "Ton", "Süre", "Mod"], PLAKA),
  md("reverb", "Azure Verb", "#5d86b8", "Strymon blueSky", 2010, ["Süre", "Ön gecikme", "Karışım", "Bas", "Tiz", "Mod"], { anahtarlar: ["Tür", "Mod seç."], gorunum: { govde: "coklu", pedal: { ayakSayisi: 2, yuzey: "firca", dugme: "krom" } } }),
  md("reverb", "Void Verb", "#2b2c30", "Eventide Space", 2011, ["Karışım", "Süre", "Boyut", "Gecikme", "Tiz", "Bas", "Mod"], { gorunum: { govde: "coklu", pedal: { ayakSayisi: 3, ekran: true, dugme: "siyah" } } }),
  md("reverb", "Tide Verb", "#d8d8d2", "Electro-Harmonix Oceans 11", 2017, ["Karışım", "Ton", "Süre", "Tür"], DUGME),
  md("reverb", "Drift Verb", "#6f8f8d", "Walrus Audio Slö", 2018, ["Süre", "Ayar", "Karışım", "Doku", "Filtre"], { anahtarlar: ["Mod"], ...DUGME }),
  md("reverb", "Ambient Verb", "#e7e1d3", "Strymon Cloudburst", 2021, ["Süre", "Ton", "Karışım", "Ön gecikme", "Mod", "Ayar"], { gorunum: { pedal: { yuzey: "firca", dugme: "krom", ayak: "dugme" } } }),
  // Chorus
  md("chorus", "Ensemble Chorus", "#4e78a6", "Boss CE-1 Chorus Ensemble", 1976, ["Yoğunluk", "Derinlik", "Hız"], { anahtarlar: ["Seviye"], gorunum: { govde: "genis", pedal: { ayak: "dugme" } } }),
  md("chorus", "Pebble Chorus", "#a9b4c2", "Electro-Harmonix Small Clone", 1983, ["Hız"], { anahtarlar: ["Derinlik"], ...DUGME }),
  md("chorus", "Nine Chorus", "#5ab5c9", "Ibanez CS9 Stereo Chorus", 1982, ["Hız", "Genişlik"], PLAKA),
  md("chorus", "Super Chorus", "#4a8bd6", "Boss CH-1 Super Chorus", 1989, ["Seviye", "EQ", "Hız", "Derinlik"], PLAKA),
  // Flanger
  md("flanger", "Wave Flanger", "#5e2e80", "MXR M117 Flanger", 1979, ["Manuel", "Genişlik", "Hız", "Geri besleme"], DUGME),
  md("flanger", "Sky Flanger", "#6e4aa8", "Boss BF-2", 1980, ["Manuel", "Derinlik", "Hız", "Rezonans"], PLAKA),
  md("flanger", "Arc Flanger", "#3a3a3e", "A/DA Flanger", 1977, ["Manuel", "Aralık", "Hız", "Geri besleme", "Eşik"], { gorunum: { govde: "genis", pedal: { ayak: "dugme" } } }),
  md("flanger", "Spiral Flanger", "#3f3a8a", "TC Electronic Vortex", 2011, ["Hız", "Derinlik", "Geri besleme", "Gecikme"], { anahtarlar: ["Mod"], ...DUGME }),
  // Fuzz
  md("fuzz", "Tone Wedge", "#9c7737", "Maestro FZ-1 Fuzz-Tone", 1962, ["Atak", "Ses"], { gorunum: { govde: "kutu", pedal: { ayak: "plaka" } } }),
  // Boost
  md("boost", "Treble Lift", "#9a9c9e", "Dallas Rangemaster", 1966, ["Boost"], { anahtarlar: ["Açma"], gorunum: { govde: "kutu" } }),
  md("boost", "Micro Lift", "#e9e9e6", "MXR M133 Micro Amp", 1978, ["Kazanç"]),
  // Wah
  md("wah", "Weep Wah", "#1c1c1e", "Dunlop Cry Baby GCB-95", 1982, ["Konum"]),
  md("wah", "Multi Wah", "#2a2a2d", "Dunlop 535Q", 1999, ["Konum", "Q", "Boost"], { anahtarlar: ["Aralık"] }),
  // Phaser
  md("phaser", "Pebble Phase", "#c0c3c7", "Electro-Harmonix Small Stone", 1974, ["Hız"], { anahtarlar: ["Renk"], gorunum: { govde: "kutu" } }),
  md("phaser", "Four Phase", "#3aa38c", "Boss PH-3", 2000, ["Hız", "Derinlik", "Rezonans", "Mod"], { gorunum: { govde: "kutu", ...PLAKA_G } }),
  // Tremolo
  md("tremolo", "Optic Trem", "#2f4f8f", "Demeter Tremulator", 1985, ["Hız", "Derinlik"], DUGME),
  md("tremolo", "Spark Trem", "#a23b2a", "Strymon Flint", 2012, ["Hız", "Yoğunluk", "Süre", "Karışım"], { anahtarlar: ["Trem türü", "Reverb türü"], gorunum: { govde: "coklu", pedal: { ayakSayisi: 2, yuzey: "firca", dugme: "krom" } } }),
  // Rotary (dönen hoparlör)
  md("vibe", "Spin Rotary", "#7a2e2a", "Strymon Lex", 2011, ["Hız", "Sürüş", "Korna seviyesi", "Hızlanma"], { altTur: "Rotary", turAd: "Rotary · dönen hoparlör", anahtarlar: ["Mod"], gorunum: { govde: "coklu", pedal: { ayakSayisi: 2, yuzey: "firca", dugme: "krom" } } }),
  md("vibe", "Dual Rotor", "#8c2f3a", "Boss RT-20", 2004, ["Seviye", "Denge", "Sürüş", "Rotor hızı", "Mod"], { altTur: "Rotary", turAd: "Rotary · dönen hoparlör", gorunum: { govde: "coklu", pedal: { ayakSayisi: 2, ekran: true } } }),
  md("vibe", "Fan Rotary", "#c42f2a", "Neo Instruments Ventilator", 2009, ["Denge", "Sürüş", "Hız"], { altTur: "Rotary", turAd: "Rotary · dönen hoparlör", anahtarlar: ["Hızlanma", "Mod"], gorunum: { govde: "coklu", pedal: { ayakSayisi: 2 } } }),
  // Univibe
  md("vibe", "Again Vibe", "#7a5a2a", "Fulltone Deja'Vibe", 1994, ["Hız", "Yoğunluk", "Seviye"], { anahtarlar: ["Chorus · Vibrato"] }),
  md("vibe", "Micro Swirl", "#8a6a24", "Voodoo Lab Micro Vibe", 1996, ["Hız", "Yoğunluk", "Seviye"], { gorunum: { govde: "kutu" } }),
  // Oktav / perde
  md("wah", "Leap Pitch", "#c4202a", "DigiTech Whammy", 1989, ["Konum", "Mod"], { altTur: "Oktav / perde", turAd: "Perde · basma pedallı" }),
  md("oktav", "Deep Octave", "#3e5ea8", "Boss OC-2", 1982, ["Doğrudan", "Oktav 1", "Oktav 2"], PLAKA),
  // Looper
  md("looper", "Ring Loop", "#e3e3de", "Boss RC-1", 2014, ["Seviye"]),
  md("looper", "Duo Loop", "#c92f2f", "Boss RC-30", 2011, ["İz 1", "İz 2", "Ritim", "Efekt"], { gorunum: { govde: "coklu", pedal: { ayakSayisi: 2, ekran: true } } }),
  // EQ
  md("eq", "Seven Band EQ", "#e6e6e2", "Boss GE-7", 1981, ["100", "200", "400", "800", "1K6", "3K2", "6K4", "Seviye"], { gorunum: { govde: "genis" } }),
  md("eq", "Ten Band EQ", "#2a2b2e", "MXR M108 10 Band EQ", 1990, ["31", "62", "125", "250", "500", "1K", "2K", "4K", "8K", "16K", "Ses", "Kazanç"], { gorunum: { govde: "genis" } }),
  // Gürültü kapısı
  md("gurultu-kapisi", "Deci Gate", "#222224", "ISP Decimator", 2002, ["Eşik"], { gorunum: { govde: "mini" } }),
  md("gurultu-kapisi", "Clever Gate", "#5a5f66", "MXR M135 Smart Gate", 2004, ["Eşik"], { anahtarlar: ["Mod"] }),
  // Filtre / zarf
  md("zarf-filtresi", "Doc Filter", "#c8cbcf", "Electro-Harmonix Doctor Q", 1976, ["Aralık"], { anahtarlar: ["Bas"] }),
  md("zarf-filtresi", "Q Filter", "#1c1d22", "Electro-Harmonix Q-Tron", 1997, ["Kazanç", "Q"], { anahtarlar: ["Mod", "Tepki"], gorunum: { govde: "genis" } }),
  // Volüm
  md("kompresor", "Slow Swell", "#dedcd2", "Boss SG-1 Slow Gear", 1979, ["Duyarlılık", "Atak"], { altTur: "Volüm", turAd: "Volüm · otomatik kabarma", ...PLAKA }),
  md("volum", "Wide Volume", "#1c1c1e", "Boss FV-500H", 2003, ["Konum"]),
  // Akort
  md("tuner", "Poly Eye", "#e9e9e7", "TC Electronic PolyTune 3", 2017, []),
  md("tuner", "Black Pitch", "#111113", "Korg Pitchblack", 2008, []),
];

/** Kategori ve pedal alt türü sırasıyla kitaplık (aynı grupta ekleme sırası korunur) */
const KAT_SIRA: Kategori[] = ["gitar", "pedal", "amfi", "kabin", "rack", "studyo"];
/** Yeni pedalın tür satırı: çizim türünün betimi (ör. "yeşil kutu") yeni modele uymayabilir; alt tür ve kontrol sayısı yazılır */
const pedalTurAdi = (e: Ekipman): Ekipman =>
  e.turAd || CIZIMLER[e.cizim].kategori !== "pedal" ? e : { ...e, turAd: e.cizim === "eq" ? `EQ · ${dugmeleri(e).filter((a) => /^\d/.test(a)).length} bant` : pedalAltTuru(e) };
export const KATALOG: Ekipman[] = [...TEMEL_MODELLER.map((e) => ({ ...e, ...(TEMEL_EK[e.id] ?? {}) })), ...YENI_KAFALAR, ...YENI_KABINLER, ...YENI_PEDALLAR.map(pedalTurAdi)]
  .map((e, i) => ({ e, i }))
  .sort((a, b) => {
    const ka = KAT_SIRA.indexOf(CIZIMLER[a.e.cizim].kategori);
    const kb = KAT_SIRA.indexOf(CIZIMLER[b.e.cizim].kategori);
    if (ka !== kb) return ka - kb;
    if (ka === 1) {
      const ta = PEDAL_ALT_TURLERI.indexOf(pedalAltTuru(a.e) as (typeof PEDAL_ALT_TURLERI)[number]);
      const tb = PEDAL_ALT_TURLERI.indexOf(pedalAltTuru(b.e) as (typeof PEDAL_ALT_TURLERI)[number]);
      if (ta !== tb) return ta - tb;
    }
    if (ka === 2) {
      // amfiler: önce kafalar, sonra komboların ve bas kafasının ilk sürüm sırası
      const kafa = (e: Ekipman) => (/kafa/i.test(turAdi(e)) && e.cizim !== "amfi-bas" ? 0 : 1);
      if (kafa(a.e) !== kafa(b.e)) return kafa(a.e) - kafa(b.e);
    }
    return a.i - b.i;
  })
  .map((x) => x.e);

/** Kitaplık modelinin çizim üstündeki adı ("GuitarFlex Verde OD" → "Verde OD"); kullanıcı ekipmanında yok (etiket yerine tür yazılır) */
export function cizimEtiketi(e: Ekipman | null | undefined): string | undefined {
  if (!e || e.ozel || !e.ad.startsWith("GuitarFlex ")) return undefined;
  return e.ad.slice("GuitarFlex ".length);
}

/**
 * Kullanıcının bildiği ekipman: "Ekipmanım" önayarları (düzenlenebilir). Adlar kullanıcının kendi ekipmanının
 * ETİKETİDİR; çizimler türe uygun genel GuitarFlex çizimleridir (marka taklidi yok). Kendi fotoğrafını ekleyebilir.
 */
export const ONAYAR_EKIPMAN: Ekipman[] = [
  { id: "e-les-paul-custom", ad: "Epiphone Les Paul Custom", cizim: "gitar-tek-kesik", renk: "#1d1c1f", benim: true, ozel: true },
  { id: "e-dsl20cr", ad: "Marshall DSL20CR", cizim: "amfi-kombo", renk: "#1f1e1c", benim: true, ozel: true },
  { id: "e-dual-cube-lx", ad: "Boss Dual Cube LX", cizim: "amfi-kombo-kucuk", renk: "#3a3d43", benim: true, ozel: true },
  { id: "e-scarlett-solo", ad: "Focusrite Scarlett Solo", cizim: "ses-karti", renk: "#4b4e55", benim: true, ozel: true },
  { id: "e-amplitube-5", ad: "AmpliTube 5", cizim: "yazilim", renk: "#2a2c31", benim: true, ozel: true },
];

// ── Zincir ──────────────────────────────────────────────────────────────────

export type Dugum = {
  id: string;
  ekipmanId: string;
  /** Düğme değerleri (0–10), düğme adına göre */
  ayar: Record<string, number>;
  /** Devre dışı (bypass): çizimde LED söner */
  kapali?: boolean;
  /** Efekt döngüsü (FX loop): varsa açık */
  dongu?: Dugum[];
};
export type Paralel = { id: string; tur: "paralel"; a: Dugum[]; b: Dugum[] };
export type Oge = Dugum | Paralel;

export type Rig = { id: string; ad: string; zincir: Oge[]; guncelleme: string };

export type RigDepo = { surum: 1; rigler: Rig[]; seciliRig: string; ekipman: Ekipman[] };

export const paralelMi = (o: Oge | null | undefined): o is Paralel => !!o && (o as Paralel).tur === "paralel";

export type Kap = string;
export const ANA: Kap = "ana";
export const kapA = (blokId: string): Kap => `a:${blokId}`;
export const kapB = (blokId: string): Kap => `b:${blokId}`;
export const kapDongu = (dugumId: string): Kap => `dongu:${dugumId}`;
export const donguKapiMi = (kap: Kap) => kap.startsWith("dongu:");

let sayac = 0;
/** Kısa, çakışmaz kimlik */
export function yeniId(on = "d"): string {
  sayac = (sayac + 1) % 1_000_000;
  const rasgele = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${on}-${rasgele}${sayac.toString(36)}`;
}

const simdiIso = () => new Date().toISOString();

/** Kaptaki liste (yoksa null) */
export function liste(rig: Rig, kap: Kap): Oge[] | null {
  if (kap === ANA) return rig.zincir;
  for (const o of rig.zincir) {
    if (paralelMi(o)) {
      if (kap === kapA(o.id)) return o.a;
      if (kap === kapB(o.id)) return o.b;
      for (const d of [...o.a, ...o.b]) if (kap === kapDongu(d.id)) return d.dongu ?? null;
    } else if (kap === kapDongu(o.id)) return o.dongu ?? null;
  }
  return null;
}

/** Kaptaki listeyi `f` ile değiştirir (kap yoksa zincir aynen kalır) */
function kapIsle(zincir: Oge[], kap: Kap, f: (l: Oge[]) => Oge[]): Oge[] {
  if (kap === ANA) return f(zincir);
  const dugumIsle = (d: Dugum): Dugum => (d.dongu && kap === kapDongu(d.id) ? { ...d, dongu: f(d.dongu) as Dugum[] } : d);
  return zincir.map((o) =>
    paralelMi(o)
      ? {
          ...o,
          a: kap === kapA(o.id) ? (f(o.a) as Dugum[]) : o.a.map(dugumIsle),
          b: kap === kapB(o.id) ? (f(o.b) as Dugum[]) : o.b.map(dugumIsle),
        }
      : dugumIsle(o),
  );
}

const rigYaz = (rig: Rig, zincir: Oge[]): Rig => ({ ...rig, zincir, guncelleme: simdiIso() });

export type Konum = { kap: Kap; indeks: number };

/** Öğenin (düğüm ya da paralel blok) bulunduğu kap ve sırası */
export function konumBul(rig: Rig, id: string): Konum | null {
  const ara = (l: Oge[], kap: Kap): Konum | null => {
    for (let i = 0; i < l.length; i++) {
      const o = l[i];
      if (o.id === id) return { kap, indeks: i };
      if (paralelMi(o)) {
        const r = ara(o.a, kapA(o.id)) ?? ara(o.b, kapB(o.id));
        if (r) return r;
      } else if (o.dongu) {
        const r = ara(o.dongu, kapDongu(o.id));
        if (r) return r;
      }
    }
    return null;
  };
  return ara(rig.zincir, ANA);
}

export function ogeBul(rig: Rig, id: string): Oge | null {
  const k = konumBul(rig, id);
  return k ? (liste(rig, k.kap)?.[k.indeks] ?? null) : null;
}
export function dugumBul(rig: Rig, id: string): Dugum | null {
  const o = ogeBul(rig, id);
  return o && !paralelMi(o) ? o : null;
}
export const paralelBlok = (rig: Rig): Paralel | null => (rig.zincir.find(paralelMi) as Paralel | undefined) ?? null;

/** Kaptan önceki ana zincir öğesi ya da amfi (kullanıcıya gösterilecek konum adı için) */
export function kapAdi(rig: Rig, kap: Kap, ekipmanAdi: (d: Dugum) => string): string {
  if (kap === ANA) return "Ana zincir";
  if (kap.startsWith("a:")) return "A yolu";
  if (kap.startsWith("b:")) return "B yolu";
  const d = dugumBul(rig, kap.slice("dongu:".length));
  return d ? `${ekipmanAdi(d)} · FX loop` : "FX loop";
}

/** Bir öğe bu kaba girebilir mi (yapı kuralları) */
function girebilir(rig: Rig, oge: Oge, kap: Kap): boolean {
  if (!liste(rig, kap)) return false;
  if (paralelMi(oge)) return kap === ANA;
  if (donguKapiMi(kap)) {
    if (oge.dongu) return false; // döngüsü olan düğüm döngüye girmez (iç içe döngü yok)
    if (kap === kapDongu(oge.id)) return false;
  }
  return true;
}

/** Yeni düğüm ekler. Dönüş: yeni rig ve düğümün kimliği (eklenemezse id null) */
export function ekle(rig: Rig, ekipmanId: string, kap: Kap = ANA, indeks?: number, ayar: Record<string, number> = {}): { rig: Rig; id: string | null } {
  const l = liste(rig, kap);
  if (!l) return { rig, id: null };
  const d: Dugum = { id: yeniId(), ekipmanId, ayar: { ...ayar } };
  const i = indeks === undefined ? l.length : Math.max(0, Math.min(l.length, indeks));
  return { rig: rigYaz(rig, kapIsle(rig.zincir, kap, (x) => [...x.slice(0, i), d, ...x.slice(i)])), id: d.id };
}

/** Öğeyi kabından çıkarır (başka bir şey yapmadan) */
function cikar(rig: Rig, id: string): { zincir: Oge[]; oge: Oge; konum: Konum } | null {
  const konum = konumBul(rig, id);
  if (!konum) return null;
  const oge = liste(rig, konum.kap)![konum.indeks];
  return { zincir: kapIsle(rig.zincir, konum.kap, (x) => x.filter((_, j) => j !== konum.indeks)), oge, konum };
}

/**
 * Öğeyi `kap` içinde `indeks` konumuna taşır. `indeks` öğe çıkarılmadan ÖNCEKİ listeye göredir (sürükle-bırakta
 * bırakma yerinin gösterdiği sıra): aynı kapta ileri taşırken bir eksiltilir.
 */
export function tasi(rig: Rig, id: string, kap: Kap, indeks: number): Rig {
  const oge = ogeBul(rig, id);
  if (!oge || !girebilir(rig, oge, kap)) return rig;
  const c = cikar(rig, id)!;
  let i = indeks;
  if (c.konum.kap === kap && c.konum.indeks < indeks) i -= 1;
  const ara: Rig = { ...rig, zincir: c.zincir };
  const l = liste(ara, kap);
  if (!l) return rig;
  i = Math.max(0, Math.min(l.length, i));
  if (c.konum.kap === kap && c.konum.indeks === i) return rig;
  return rigYaz(rig, kapIsle(ara.zincir, kap, (x) => [...x.slice(0, i), c.oge, ...x.slice(i)]));
}

/**
 * Klavyeyle bir adım sola (-1) / sağa (+1). Ana zincirde paralel blok bir bütün olarak atlanır; A/B yolunun ya da
 * FX loop'un ucunda öğe dışarı çıkar (bloğun ya da amfinin hemen önüne / arkasına). Yollara ve döngülere girmek için
 * `tasi` (sürükle-bırak ya da büyük paneldeki "Konum" seçimi) kullanılır.
 */
export function kaydir(rig: Rig, id: string, yon: -1 | 1): Rig {
  const k = konumBul(rig, id);
  if (!k) return rig;
  const l = liste(rig, k.kap)!;
  const hedef = k.indeks + yon;
  if (hedef >= 0 && hedef < l.length) return tasi(rig, id, k.kap, yon > 0 ? hedef + 1 : hedef);
  if (k.kap === ANA) return rig;
  // Uçta: dışarı çık
  const sahipId = k.kap.slice(k.kap.indexOf(":") + 1);
  const sahip = konumBul(rig, sahipId);
  if (!sahip) return rig;
  return tasi(rig, id, sahip.kap, yon > 0 ? sahip.indeks + 1 : sahip.indeks);
}

/** Öğeyi siler. Döngüsü dolu bir düğüm silinirse döngüdeki efektler aynı kapta onun yerine geçer; paralel blok silinirse yollar birleşir. */
export function sil(rig: Rig, id: string): Rig {
  const oge = ogeBul(rig, id);
  if (!oge) return rig;
  if (paralelMi(oge)) return paralelKaldir(rig);
  const k = konumBul(rig, id)!;
  const yerine = oge.dongu ?? [];
  return rigYaz(rig, kapIsle(rig.zincir, k.kap, (x) => [...x.slice(0, k.indeks), ...yerine, ...x.slice(k.indeks + 1)]));
}

/** A/B paralel yol ekler (rig başına bir tane; ana zincirde `indeks` konumuna). Dönüş: rig ve bloğun kimliği. */
export function paralelEkle(rig: Rig, indeks?: number): { rig: Rig; id: string } {
  const var_ = paralelBlok(rig);
  if (var_) return { rig, id: var_.id };
  const p: Paralel = { id: yeniId("p"), tur: "paralel", a: [], b: [] };
  const i = indeks === undefined ? rig.zincir.length : Math.max(0, Math.min(rig.zincir.length, indeks));
  return { rig: rigYaz(rig, [...rig.zincir.slice(0, i), p, ...rig.zincir.slice(i)]), id: p.id };
}

/** Paralel bloğu kaldırır: A yolu, ardından B yolu ana zincire aynı yerde katılır */
export function paralelKaldir(rig: Rig): Rig {
  const i = rig.zincir.findIndex(paralelMi);
  if (i < 0) return rig;
  const p = rig.zincir[i] as Paralel;
  return rigYaz(rig, [...rig.zincir.slice(0, i), ...p.a, ...p.b, ...rig.zincir.slice(i + 1)]);
}

/** Bir düğümü (ana zincirde) yeni bir paralel bloğun A yoluna sarar; B yolu boş (doğrudan) kalır */
export function paralelSar(rig: Rig, id: string): { rig: Rig; id: string | null } {
  const k = konumBul(rig, id);
  if (!k || k.kap !== ANA || paralelBlok(rig) || paralelMi(rig.zincir[k.indeks])) return { rig, id: null };
  const r = paralelEkle(rig, k.indeks + 1);
  return { rig: tasi(r.rig, id, kapA(r.id), 0), id: r.id };
}

/** Düğümün efekt döngüsünü (FX loop) açar. Döngü içindeki düğümlerde açılmaz. */
export function donguAc(rig: Rig, id: string): Rig {
  const k = konumBul(rig, id);
  const d = dugumBul(rig, id);
  if (!k || !d || d.dongu || donguKapiMi(k.kap)) return rig;
  return rigYaz(rig, kapIsle(rig.zincir, k.kap, (x) => x.map((o) => (o.id === id ? { ...d, dongu: [] } : o))));
}

/** Efekt döngüsünü kapatır: döngüdeki efektler düğümün hemen arkasına, aynı kaba geçer */
export function donguKapat(rig: Rig, id: string): Rig {
  const k = konumBul(rig, id);
  const d = dugumBul(rig, id);
  if (!k || !d || !d.dongu) return rig;
  const { dongu, ...yalin } = d;
  return rigYaz(rig, kapIsle(rig.zincir, k.kap, (x) => [...x.slice(0, k.indeks), yalin, ...dongu, ...x.slice(k.indeks + 1)]));
}

function dugumIsle(rig: Rig, id: string, f: (d: Dugum) => Dugum): Rig {
  const k = konumBul(rig, id);
  const d = dugumBul(rig, id);
  if (!k || !d) return rig;
  return rigYaz(rig, kapIsle(rig.zincir, k.kap, (x) => x.map((o) => (o.id === id ? f(d) : o))));
}

export const sinirla = (v: number) => Math.round(Math.max(0, Math.min(10, Number.isFinite(v) ? v : 5)) * 10) / 10;

/** Düğme değeri (0–10, 0,1 adım) */
export const ayarla = (rig: Rig, id: string, dugme: string, deger: number): Rig => dugumIsle(rig, id, (d) => ({ ...d, ayar: { ...d.ayar, [dugme]: sinirla(deger) } }));
/** Devre dışı bırak / aç (bypass) */
export const gecis = (rig: Rig, id: string, kapali?: boolean): Rig => dugumIsle(rig, id, (d) => ({ ...d, kapali: kapali ?? !d.kapali }));
/** Düğümün ekipmanını değiştirir (ayarlar korunur) */
export const ekipmanDegistir = (rig: Rig, id: string, ekipmanId: string): Rig => dugumIsle(rig, id, (d) => ({ ...d, ekipmanId }));

export const dugmeDegeri = (d: Dugum, dugme: string) => d.ayar[dugme] ?? 5;
/** Seçmeli ayarın sırası (yoksa 0; listenin dışındaysa sınırlanır) */
export const secenekDegeri = (d: Pick<Dugum, "ayar">, s: Secenek) => Math.max(0, Math.min(s.degerler.length - 1, Math.round(d.ayar[s.ad] ?? 0)));
/** Seçmeli ayarı yazar (sıra) */
export const secenekSec = (rig: Rig, id: string, s: Secenek, sira: number): Rig => ayarla(rig, id, s.ad, Math.max(0, Math.min(s.degerler.length - 1, Math.round(sira))));

export type DuzDugum = { dugum: Dugum; kap: Kap; indeks: number };
/** Bütün düğümler, zincirdeki görünüş sırasıyla (amfi, döngüsünden önce; A yolu B'den önce) */
export function duzListe(rig: Rig): DuzDugum[] {
  const s: DuzDugum[] = [];
  const dugumYaz = (d: Dugum, kap: Kap, indeks: number) => {
    s.push({ dugum: d, kap, indeks });
    d.dongu?.forEach((x, i) => s.push({ dugum: x, kap: kapDongu(d.id), indeks: i }));
  };
  rig.zincir.forEach((o, i) => {
    if (paralelMi(o)) {
      o.a.forEach((d, j) => dugumYaz(d, kapA(o.id), j));
      o.b.forEach((d, j) => dugumYaz(d, kapB(o.id), j));
    } else dugumYaz(o, ANA, i);
  });
  return s;
}

/**
 * Kitaplıktan tıklayarak eklerken ana zincirdeki öneri sırası: türlerin olağan sırasına göre (gitar → akort → DI →
 * pedallar → amfi → kabin → rack → ses kartı → yazılım) aynı ya da daha küçük sıralı son öğenin arkası.
 */
export function oneriIndeksi(rig: Rig, yeniSira: number, siraBul: (d: Dugum) => number): number {
  let i = 0;
  rig.zincir.forEach((o, j) => {
    const s = paralelMi(o) ? Math.max(3.5, ...[...o.a, ...o.b].map(siraBul)) : siraBul(o);
    if (s <= yeniSira) i = j + 1;
  });
  return i;
}

// ── Depo: birden çok rig ve kullanıcının ekipmanı ───────────────────────────

export const bosRig = (ad: string): Rig => ({ id: yeniId("r"), ad, zincir: [], guncelleme: simdiIso() });

export function baslangicDeposu(): RigDepo {
  const r = bosRig("Temiz");
  return { surum: 1, rigler: [r], seciliRig: r.id, ekipman: ONAYAR_EKIPMAN.map((e) => ({ ...e })) };
}

/** Kimliğe göre ekipman: önce kullanıcınınki, sonra yerleşik kitaplık */
export function ekipmanBul(depo: Pick<RigDepo, "ekipman">, id: string): Ekipman | null {
  return depo.ekipman.find((e) => e.id === id) ?? KATALOG.find((e) => e.id === id) ?? null;
}

export const seciliRig = (depo: RigDepo): Rig => depo.rigler.find((r) => r.id === depo.seciliRig) ?? depo.rigler[0];

export function rigGuncelle(depo: RigDepo, rigId: string, f: (r: Rig) => Rig): RigDepo {
  return { ...depo, rigler: depo.rigler.map((r) => (r.id === rigId ? f(r) : r)) };
}

/** Aynı adı alan rig'ler için "Ad 2", "Ad 3"… */
export function benzersizAd(depo: RigDepo, ad: string): string {
  const adlar = new Set(depo.rigler.map((r) => r.ad.toLocaleLowerCase("tr")));
  const temel = ad.trim() || "Yeni rig";
  if (!adlar.has(temel.toLocaleLowerCase("tr"))) return temel;
  for (let n = 2; ; n++) if (!adlar.has(`${temel} ${n}`.toLocaleLowerCase("tr"))) return `${temel} ${n}`;
}

export function rigEkle(depo: RigDepo, ad: string, zincir: Oge[] = []): RigDepo {
  const r: Rig = { ...bosRig(benzersizAd(depo, ad)), zincir };
  return { ...depo, rigler: [...depo.rigler, r], seciliRig: r.id };
}
export const rigSec = (depo: RigDepo, id: string): RigDepo => (depo.rigler.some((r) => r.id === id) ? { ...depo, seciliRig: id } : depo);
export const rigAdlandir = (depo: RigDepo, id: string, ad: string): RigDepo => rigGuncelle(depo, id, (r) => ({ ...r, ad: ad.trim().slice(0, 60) || r.ad, guncelleme: simdiIso() }));

/** Rig'i siler; son rig silinirse boş bir "Temiz" rig kalır */
export function rigSil(depo: RigDepo, id: string): RigDepo {
  const kalan = depo.rigler.filter((r) => r.id !== id);
  if (!kalan.length) {
    const r = bosRig("Temiz");
    return { ...depo, rigler: [r], seciliRig: r.id };
  }
  const i = depo.rigler.findIndex((r) => r.id === id);
  return { ...depo, rigler: kalan, seciliRig: depo.seciliRig === id ? kalan[Math.max(0, i - 1)].id : depo.seciliRig };
}

/** Kimlikleri yenileyerek derin kopya (aynı rig iki kez içe aktarılsa ya da kopyalansa çakışmasın) */
export function zincirKopyala(zincir: Oge[]): Oge[] {
  const dk = (d: Dugum): Dugum => ({ ...d, id: yeniId(), ayar: { ...d.ayar }, ...(d.dongu ? { dongu: d.dongu.map(dk) } : {}) });
  return zincir.map((o) => (paralelMi(o) ? { ...o, id: yeniId("p"), a: o.a.map(dk), b: o.b.map(dk) } : dk(o)));
}

export function rigKopyala(depo: RigDepo, id: string): RigDepo {
  const r = depo.rigler.find((x) => x.id === id);
  return r ? rigEkle(depo, `${r.ad} (kopya)`, zincirKopyala(r.zincir)) : depo;
}

/** Kullanıcı ekipmanı ekler ya da günceller (kimlik aynıysa) */
export function ekipmanKaydet(depo: RigDepo, e: Ekipman): RigDepo {
  const temiz: Ekipman = { ...e, ad: e.ad.trim().slice(0, 80) || CIZIMLER[e.cizim].ad, renk: renkGecerli(e.renk) ? e.renk.toLowerCase() : "#3a3c42", ozel: true };
  const var_ = depo.ekipman.some((x) => x.id === e.id);
  return { ...depo, ekipman: var_ ? depo.ekipman.map((x) => (x.id === e.id ? temiz : x)) : [...depo.ekipman, temiz] };
}

/** Kullanıcı ekipmanını siler; onu kullanan düğümler bütün rig'lerden kalkar */
export function ekipmanSil(depo: RigDepo, id: string): RigDepo {
  const temizle = (r: Rig): Rig => {
    let x = r;
    for (const d of duzListe(r)) if (d.dugum.ekipmanId === id) x = sil(x, d.dugum.id);
    // sil, döngüyü dışarı taşır; silinen ekipman döngüdeyse ve aynı ekipmansa yine temizlensin
    return duzListe(x).some((d) => d.dugum.ekipmanId === id) ? temizle(x) : x;
  };
  return { ...depo, ekipman: depo.ekipman.filter((e) => e.id !== id), rigler: depo.rigler.map(temizle) };
}

/**
 * Örnek rig: Les Paul → akort → kompresör → overdrive → DSL20CR (FX loop'ta delay + reverb) → 1x12 kabin → Scarlett Solo.
 * Önayar ekipman silinmişse yerleşik karşılıkları kullanılır.
 */
export function ornekZincir(depo: Pick<RigDepo, "ekipman">): Oge[] {
  const sec = (benim: string, yedek: string) => (depo.ekipman.some((e) => e.id === benim) ? benim : yedek);
  const d = (ekipmanId: string, ayar: Record<string, number> = {}, kapali = false): Dugum => ({ id: yeniId(), ekipmanId, ayar, ...(kapali ? { kapali } : {}) });
  return [
    d(sec("e-les-paul-custom", "k-gitar-tek-kesik"), { Ses: 10, Ton: 7 }),
    d("k-tuner"),
    d("k-kompresor", { Sıkıştırma: 4, Atak: 6, Seviye: 5.5 }),
    d("k-overdrive", { Kazanç: 4.5, Ton: 6, Seviye: 7 }),
    { ...d(sec("e-dsl20cr", "k-amfi-kombo"), { Kazanç: 6, Bas: 5, Orta: 6.5, Tiz: 6, Reverb: 2, "Ana ses": 4 }), dongu: [d("k-delay", { Zaman: 4, "Geri besleme": 3, Karışım: 3 }), d("k-reverb", { Süre: 6, Ton: 5, Karışım: 3.5 })] },
    d("k-kabin-1x12"),
    d(sec("e-scarlett-solo", "k-ses-karti"), { Kazanç: 6, Çıkış: 5 }),
  ];
}

// ── Dışa / içe aktarma (JSON) ve göç ────────────────────────────────────────

export const DISA_TUR = "guitarflex-rig";

export const renkGecerli = (x: unknown): x is string => typeof x === "string" && /^#[0-9a-f]{6}$/i.test(x);
const metin = (x: unknown, enCok = 80) => (typeof x === "string" ? x.trim().slice(0, enCok) : "");

function dugumTemizle(x: unknown, derin: boolean): Dugum | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const ekipmanId = metin(o.ekipmanId, 120);
  if (!ekipmanId) return null;
  const ayar: Record<string, number> = {};
  if (o.ayar && typeof o.ayar === "object") for (const [a, v] of Object.entries(o.ayar as Record<string, unknown>)) if (typeof v === "number" && a.length <= 40) ayar[a] = sinirla(v);
  const d: Dugum = { id: metin(o.id, 60) || yeniId(), ekipmanId, ayar };
  if (o.kapali === true) d.kapali = true;
  if (derin && Array.isArray(o.dongu)) d.dongu = o.dongu.map((y) => dugumTemizle(y, false)).filter((y): y is Dugum => !!y);
  return d;
}

function zincirTemizle(x: unknown): Oge[] {
  if (!Array.isArray(x)) return [];
  const s: Oge[] = [];
  let paralelVar = false;
  for (const o of x) {
    if (o && typeof o === "object" && (o as Paralel).tur === "paralel") {
      const p = o as Record<string, unknown>;
      const a = Array.isArray(p.a) ? p.a.map((y) => dugumTemizle(y, true)).filter((y): y is Dugum => !!y) : [];
      const b = Array.isArray(p.b) ? p.b.map((y) => dugumTemizle(y, true)).filter((y): y is Dugum => !!y) : [];
      if (paralelVar) s.push(...a, ...b); // en çok bir blok: fazlası düzleşir
      else s.push({ id: metin(p.id, 60) || yeniId("p"), tur: "paralel", a, b });
      paralelVar = true;
    } else {
      const d = dugumTemizle(o, true);
      if (d) s.push(d);
    }
  }
  return s;
}

function ekipmanTemizle(x: unknown): Ekipman | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const id = metin(o.id, 120);
  if (!id || !cizimGecerli(o.cizim)) return null;
  const e: Ekipman = { id, ad: metin(o.ad) || CIZIMLER[o.cizim].ad, cizim: o.cizim, renk: renkGecerli(o.renk) ? o.renk.toLowerCase() : "#3a3c42", ozel: true };
  if (o.benim === true) e.benim = true;
  if (typeof o.fotoId === "string" && o.fotoId.length <= 80) e.fotoId = o.fotoId;
  if (o.gorsel === "foto" || o.gorsel === "cizim") e.gorsel = o.gorsel;
  return e;
}

function rigTemizle(x: unknown): Rig | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  return { id: metin(o.id, 60) || yeniId("r"), ad: metin(o.ad, 60) || "Rig", zincir: zincirTemizle(o.zincir), guncelleme: typeof o.guncelleme === "string" ? o.guncelleme : simdiIso() };
}

/** Kaldırılan çizim türleri (mikrofonlar): bunları kullanan ekipman ve düğümler göçte sessizce çıkarılır */
const KALDIRILAN_CIZIM = /^mikrofon/;
const KALDIRILAN_KIMLIK = /^k-mikrofon/;

/** Kaldırılan türlere bağlı ekipman kimlikleri (kitaplık + saklanan kullanıcı ekipmanı) */
function kaldirilanKimlikler(hamEkipman: unknown): Set<string> {
  const s = new Set<string>();
  if (Array.isArray(hamEkipman))
    for (const x of hamEkipman) if (x && typeof x === "object" && typeof (x as Ekipman).cizim === "string" && KALDIRILAN_CIZIM.test((x as Ekipman).cizim) && typeof (x as Ekipman).id === "string") s.add((x as Ekipman).id);
  return s;
}

/** Zincirden verilen ekipman kimliklerini kullanan bütün düğümleri çıkarır (döngüler ve paralel yollar dahil) */
function dugumleriCikar(r: Rig, kaldir: (ekipmanId: string) => boolean): Rig {
  const temiz = (l: Dugum[]): Dugum[] => l.filter((d) => !kaldir(d.ekipmanId)).map((d) => (d.dongu ? { ...d, dongu: temiz(d.dongu) } : d));
  // Silinen bir amfinin döngüsündeki efektler kaybolmasın: sil() gibi aynı yere geçer
  const duz = (l: Dugum[]): Dugum[] => l.flatMap((d) => (kaldir(d.ekipmanId) ? temiz(d.dongu ?? []) : [d.dongu ? { ...d, dongu: temiz(d.dongu) } : d]));
  return { ...r, zincir: r.zincir.flatMap((o): Oge[] => (paralelMi(o) ? [{ ...o, a: duz(o.a), b: duz(o.b) }] : duz([o]))) };
}

/** Düğme adı değişen kitaplık modellerinde eski kayıtların değerlerini yeni ada taşır (yeni adın değeri varsa ona dokunmaz) */
function ayarGoc(r: Rig): Rig {
  const dk = (d: Dugum): Dugum => {
    const eski = KATALOG.find((e) => e.id === d.ekipmanId)?.eskiDugmeler;
    let ayar = d.ayar;
    if (eski)
      for (const [a, y] of Object.entries(eski))
        if (a in ayar) {
          const { [a]: v, ...kalan } = ayar;
          ayar = y in kalan ? kalan : { ...kalan, [y]: v };
        }
    return { ...d, ayar, ...(d.dongu ? { dongu: d.dongu.map(dk) } : {}) };
  };
  return { ...r, zincir: r.zincir.map((o): Oge => (paralelMi(o) ? { ...o, a: o.a.map(dk), b: o.b.map(dk) } : dk(o))) };
}

/** Saklanan (ya da bozuk) veriyi geçerli bir depoya çevirir */
export function goc(ham: unknown): RigDepo {
  if (!ham || typeof ham !== "object") return baslangicDeposu();
  const o = ham as Record<string, unknown>;
  const kaldirilan = kaldirilanKimlikler(o.ekipman);
  const kaldir = (id: string) => KALDIRILAN_KIMLIK.test(id) || kaldirilan.has(id);
  const rigler = Array.isArray(o.rigler) ? o.rigler.map(rigTemizle).filter((r): r is Rig => !!r).map((r) => ayarGoc(dugumleriCikar(r, kaldir))) : [];
  const ekipman = Array.isArray(o.ekipman) ? o.ekipman.map(ekipmanTemizle).filter((e): e is Ekipman => !!e) : ONAYAR_EKIPMAN.map((e) => ({ ...e }));
  if (!rigler.length) rigler.push(bosRig("Temiz"));
  const secili = typeof o.seciliRig === "string" && rigler.some((r) => r.id === o.seciliRig) ? o.seciliRig : rigler[0].id;
  return { surum: 1, rigler, seciliRig: secili, ekipman };
}

/** Dışa aktarma: bütün rig'ler (ya da yalnız `rigId`) ve kullandıkları kullanıcı ekipmanı. Fotoğraflar dahil değildir. */
export function disaAktar(depo: RigDepo, rigId?: string): string {
  const rigler = rigId ? depo.rigler.filter((r) => r.id === rigId) : depo.rigler;
  const kullanilan = new Set(rigler.flatMap((r) => duzListe(r).map((d) => d.dugum.ekipmanId)));
  const ekipman = rigId ? depo.ekipman.filter((e) => kullanilan.has(e.id)) : depo.ekipman;
  return JSON.stringify({ tur: DISA_TUR, surum: 1, disaAktarim: simdiIso(), rigler, ekipman: ekipman.map(({ fotoId: _f, gorsel: _g, ...e }) => (void _f, void _g, e)) }, null, 2);
}

/**
 * İçe aktarma: rig'ler mevcutların yanına eklenir (kimlikler yenilenir, adlar çakışırsa numaralanır); kullanıcı
 * ekipmanı kimliğe göre birleşir (var olan kayıt korunur). Hata: anlaşılır Türkçe ileti.
 */
export function iceAktar(depo: RigDepo, metinHam: string): { depo: RigDepo; rigSayisi: number } {
  let ham: unknown;
  try {
    ham = JSON.parse(metinHam);
  } catch {
    throw new Error("Dosya JSON değil.");
  }
  if (!ham || typeof ham !== "object" || (ham as { tur?: unknown }).tur !== DISA_TUR) throw new Error("Bu bir GuitarFlex rig dosyası değil.");
  const hamRigler = (ham as { rigler?: unknown }).rigler;
  const g = goc(ham);
  const gelenRigler = Array.isArray(hamRigler) && hamRigler.length ? g.rigler : [];
  if (!gelenRigler.length) throw new Error("Dosyada rig yok.");
  let d: RigDepo = { ...depo, ekipman: [...depo.ekipman] };
  for (const e of Array.isArray((ham as { ekipman?: unknown }).ekipman) ? g.ekipman : []) if (!d.ekipman.some((x) => x.id === e.id)) d.ekipman.push(e);
  for (const r of gelenRigler) d = rigEkle(d, r.ad, zincirKopyala(r.zincir));
  return { depo: d, rigSayisi: gelenRigler.length };
}
