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
  /** Tür adı (kitaplıkta ve formda) */
  ad: string;
  /** Sade "düğme" ayarları (yalnız görsel; 0–10) */
  dugmeler: string[];
  /** Zincirdeki olağan sıra: kitaplıktan tıklayarak eklerken öneri yeri bulunur (küçük önce) */
  sira: number;
};

const c = (kategori: Kategori, ad: string, sira: number, dugmeler: string[] = []): CizimTanim => ({ kategori, ad, sira, dugmeler });
const AMFI_DUGMELERI = ["Kazanç", "Bas", "Orta", "Tiz", "Parlaklık", "Ana ses"];
const EQ_BANTLARI = ["Bas", "Alt orta", "Orta", "Üst orta", "Tiz"];

/** Bütün çizim türleri (her biri src/components/rig/Cizimler.tsx'te özgün bir SVG çizimdir) */
export const CIZIMLER = {
  "gitar-tek-kesik": c("gitar", "Elektro gitar · tek kesik", 0, ["Ses", "Ton"]),
  "gitar-cift-kesik": c("gitar", "Elektro gitar · çift kesik", 0, ["Ses", "Ton"]),
  "gitar-akustik": c("gitar", "Akustik gitar", 0, ["Ses"]),
  tuner: c("pedal", "Akort (tuner)", 1),
  wah: c("pedal", "Wah", 3, ["Konum"]),
  kompresor: c("pedal", "Kompresör", 3, ["Sıkıştırma", "Atak", "Seviye"]),
  "gurultu-kapisi": c("pedal", "Gürültü kapısı", 3, ["Eşik", "Bırakma"]),
  boost: c("pedal", "Boost", 3, ["Seviye"]),
  overdrive: c("pedal", "Overdrive", 3, ["Kazanç", "Ton", "Seviye"]),
  distortion: c("pedal", "Distorsiyon", 3, ["Kazanç", "Ton", "Seviye"]),
  fuzz: c("pedal", "Fuzz", 3, ["Fuzz", "Seviye"]),
  eq: c("pedal", "EQ pedalı", 3, EQ_BANTLARI),
  chorus: c("pedal", "Chorus", 3, ["Hız", "Derinlik", "Karışım"]),
  phaser: c("pedal", "Phaser", 3, ["Hız"]),
  flanger: c("pedal", "Flanger", 3, ["Hız", "Derinlik", "Geri besleme"]),
  delay: c("pedal", "Delay", 3, ["Zaman", "Geri besleme", "Karışım"]),
  reverb: c("pedal", "Reverb", 3, ["Süre", "Ton", "Karışım"]),
  looper: c("pedal", "Looper", 3.5, ["Seviye"]),
  "amfi-kafa": c("amfi", "Amfi kafası", 4, AMFI_DUGMELERI),
  "amfi-kombo": c("amfi", "Tüplü kombo amfi", 4, ["Kazanç", "Bas", "Orta", "Tiz", "Reverb", "Ana ses"]),
  "amfi-kombo-kucuk": c("amfi", "Modelleme kombo amfi", 4, ["Tür", "Kazanç", "Ton", "Ses"]),
  "kabin-4x12": c("kabin", "4x12 kabin", 5),
  "kabin-2x12": c("kabin", "2x12 kabin", 5),
  "kabin-1x12": c("kabin", "1x12 kabin", 5),
  mikrofon: c("studyo", "Mikrofon", 6, ["Mesafe", "Eksen"]),
  "rack-kompresor": c("rack", "Rack kompresör", 7, ["Eşik", "Oran", "Atak", "Bırakma", "Çıkış"]),
  "rack-eq": c("rack", "Rack EQ", 7, EQ_BANTLARI),
  "rack-delay": c("rack", "Rack delay", 7, ["Zaman", "Geri besleme", "Karışım"]),
  "rack-reverb": c("rack", "Rack reverb", 7, ["Süre", "Ön gecikme", "Karışım"]),
  di: c("studyo", "DI kutusu", 2, ["Seviye"]),
  "ses-karti": c("studyo", "Ses kartı", 8, ["Kazanç", "Çıkış"]),
  yazilim: c("studyo", "Yazılım (amfi simülasyonu)", 9, ["Giriş", "Çıkış"]),
} satisfies Record<string, CizimTanim>;

export type Cizim = keyof typeof CIZIMLER;
export const CIZIM_LISTESI = Object.keys(CIZIMLER) as Cizim[];
export const cizimGecerli = (x: unknown): x is Cizim => typeof x === "string" && Object.hasOwn(CIZIMLER, x);
export const cizimTanimi = (x: Cizim): CizimTanim => CIZIMLER[x];

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
};

const k = (id: string, ad: string, cizim: Cizim, renk: string): Ekipman => ({ id, ad, cizim, renk });

/** Yerleşik kitaplık: genel (markasız) ekipman */
export const KATALOG: Ekipman[] = [
  k("k-gitar-tek-kesik", "Tek kesik elektro", "gitar-tek-kesik", "#b5452a"),
  k("k-gitar-cift-kesik", "Çift kesik elektro", "gitar-cift-kesik", "#2f6f9f"),
  k("k-gitar-akustik", "Akustik gitar", "gitar-akustik", "#c98b4a"),
  k("k-tuner", "Akort pedalı", "tuner", "#2b2d33"),
  k("k-wah", "Wah", "wah", "#3a3c42"),
  k("k-kompresor", "Kompresör", "kompresor", "#2f6fd6"),
  k("k-gurultu-kapisi", "Gürültü kapısı", "gurultu-kapisi", "#5a5e66"),
  k("k-boost", "Temiz boost", "boost", "#d9d4c7"),
  k("k-overdrive", "Overdrive", "overdrive", "#2e9a57"),
  k("k-distortion", "Distorsiyon", "distortion", "#e07a1f"),
  k("k-fuzz", "Fuzz", "fuzz", "#8c3fb8"),
  k("k-eq", "Grafik EQ", "eq", "#c9ccd2"),
  k("k-chorus", "Chorus", "chorus", "#3fb6c9"),
  k("k-phaser", "Phaser", "phaser", "#e8b51e"),
  k("k-flanger", "Flanger", "flanger", "#7e5bd6"),
  k("k-delay", "Delay", "delay", "#1f8fd6"),
  k("k-reverb", "Reverb", "reverb", "#2c4a8f"),
  k("k-looper", "Looper", "looper", "#c23a4c"),
  k("k-amfi-kafa", "Tüplü kafa", "amfi-kafa", "#1c1c1e"),
  k("k-amfi-kombo", "Tüplü kombo", "amfi-kombo", "#2a2622"),
  k("k-amfi-kombo-kucuk", "Modelleme kombo", "amfi-kombo-kucuk", "#3b3e44"),
  k("k-kabin-4x12", "4x12 kabin", "kabin-4x12", "#1c1c1e"),
  k("k-kabin-2x12", "2x12 kabin", "kabin-2x12", "#2a2622"),
  k("k-kabin-1x12", "1x12 kabin", "kabin-1x12", "#1c1c1e"),
  k("k-rack-kompresor", "Stüdyo kompresör", "rack-kompresor", "#34363c"),
  k("k-rack-eq", "Grafik EQ (rack)", "rack-eq", "#c9ccd2"),
  k("k-rack-delay", "Dijital delay", "rack-delay", "#1e2a3a"),
  k("k-rack-reverb", "Salon reverb", "rack-reverb", "#2d2340"),
  k("k-mikrofon", "Dinamik mikrofon", "mikrofon", "#4a4d55"),
  k("k-di", "DI kutusu", "di", "#c8a12c"),
  k("k-ses-karti", "Ses kartı", "ses-karti", "#45474d"),
  k("k-yazilim", "Amfi simülasyonu", "yazilim", "#2a2c31"),
];

/** Kullanıcının bildiği ekipman: "Ekipmanım" önayarları (düzenlenebilir; çizimler genel, gerçek ürünü taklit etmez) */
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
 * pedallar → amfi → kabin → mikrofon → rack → ses kartı → yazılım) aynı ya da daha küçük sıralı son öğenin arkası.
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
 * Örnek rig: Les Paul → akort → kompresör → overdrive → DSL20CR (FX loop'ta delay + reverb) → 1x12 kabin → mikrofon → Scarlett Solo.
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
    d("k-mikrofon", { Mesafe: 3, Eksen: 4 }),
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
  return e;
}

function rigTemizle(x: unknown): Rig | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  return { id: metin(o.id, 60) || yeniId("r"), ad: metin(o.ad, 60) || "Rig", zincir: zincirTemizle(o.zincir), guncelleme: typeof o.guncelleme === "string" ? o.guncelleme : simdiIso() };
}

/** Saklanan (ya da bozuk) veriyi geçerli bir depoya çevirir */
export function goc(ham: unknown): RigDepo {
  if (!ham || typeof ham !== "object") return baslangicDeposu();
  const o = ham as Record<string, unknown>;
  const rigler = Array.isArray(o.rigler) ? o.rigler.map(rigTemizle).filter((r): r is Rig => !!r) : [];
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
  return JSON.stringify({ tur: DISA_TUR, surum: 1, disaAktarim: simdiIso(), rigler, ekipman: ekipman.map(({ fotoId: _f, ...e }) => (void _f, e)) }, null, 2);
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
