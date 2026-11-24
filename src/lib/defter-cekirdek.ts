// Çalışma Defteri: veri modeli ve saf işlevler (React ve tarayıcı yok; scripts/defter-testi.ts ile sınanır).
// Saklama, abonelik ve React kancası: ./defter.ts (localStorage anahtarı "gf-defter").
//
// Süre kaynakları ve günlük görevler (Profil › "Bugün: Egzersiz 0/20 dk, Serbest Çalışma"):
//  • Uygulamada ölçülen süre (oynatıcı çalarken) aynı saniye sayacından hem ilerleme kaydına (progress.ts) hem
//    deftere yazılır. Defter bu süreyi ilerleme kaydına YENİDEN yazmaz: görevler yalnız progress.ts'ten hesaplanır,
//    defterin ölçülen süresi onun bir alt kümesidir (çift sayma yok).
//  • Elle girilen süre (Songsterr'de çalınan şarkılar, "+ Not ekle") yalnız defterdedir; günlük görevlere yazılmaz.
//  • Takvimdeki günün toplamı: max(ilerleme kaydındaki ölçülen süre, defterin ölçülen süresi) + defterin elle süresi.
//
// Tarihler: gün anahtarları bilgisayarın YEREL saatine göre (YYYY-AA-GG) üretilir; toISOString (UTC) gün anahtarı
// için kullanılmaz, yoksa İstanbul'da gece 00:00–03:00 arası çalışma bir önceki güne yazılırdı.

export const DEFTER_SURUM = 1;

export type Tur = "egzersiz" | "sarki" | "serbest";
export type Durum = "devam" | "ogrendim";
export type GitarTuru = "elektro" | "akustik" | "klasik" | "bas";
export const GITAR_TURLERI: GitarTuru[] = ["elektro", "akustik", "klasik", "bas"];
export const GITAR_TURU_ADI: Record<GitarTuru, string> = { elektro: "Elektro", akustik: "Akustik", klasik: "Klasik", bas: "Bas" };
export const TUR_ADI: Record<Tur, string> = { egzersiz: "Egzersiz", sarki: "Şarkı", serbest: "Serbest not" };

export type Gitar = { id: string; ad: string; tur?: GitarTuru };

export type Oturum = {
  /** Yerel gün (YYYY-AA-GG) */
  tarih: string;
  /** Saniye */
  sure: number;
  gitar: string | null;
  kisim: string | null;
  /** BPM */
  tempo: number | null;
  /** Elle girildi (Songsterr, + Not ekle); yoksa uygulamada ölçüldü */
  elle?: boolean;
  /** Oturumun başladığı saat (0–23, yerel) */
  saat?: number;
  /** Son eklemenin zamanı (ms): ardışık eklemeler aynı oturumda birleşir */
  son?: number;
};

export type Kayit = {
  id: string;
  tur: Tur;
  baslik: string;
  /** Kurs adı ya da sanatçı */
  altBaslik: string;
  href: string;
  /** Çalışılan kısım: A / A′ / B / C ya da serbest metin (riff, solo, nakarat) */
  kisim: string | null;
  /** Son ölçü (1'den) */
  konum: number | null;
  /** Son çalınan tempo (BPM) */
  tempo: number | null;
  /** Son çalınan hız (%) */
  hiz: number | null;
  /** Son döngü aralığı (ölçü, 0'dan, kapsayıcı) */
  aralik: [number, number] | null;
  gitar: string | null;
  /** null: henüz işaretlenmedi (ör. yalnız açıldı ya da çalındı) */
  durum: Durum | null;
  not: string;
  /** Saniye; her zaman oturum sürelerinin toplamı */
  toplamSure: number;
  oturumlar: Oturum[];
  /** ISO zaman damgası (an; gün anahtarı değil) */
  guncellendi: string;
  olusturuldu: string;
  /** Uygulama dışında (Songsterr) son açılış */
  acildi?: string;
};

export type HaftalikPlan = {
  /** Pazartesi (0) … Pazar (6): hedef dakika; null = günlük hedef (Profil'deki Egzersiz görevi) */
  hedefDk: (number | null)[];
  /** Gün başına plan notu (ör. "sweep 4.1 + Metallica riff") */
  notlar: string[];
};

export type DefterVeri = {
  surum: typeof DEFTER_SURUM;
  kayitlar: Record<string, Kayit>;
  gitarlar: Gitar[];
  varsayilanGitar: string | null;
  plan: HaftalikPlan;
};

/** Bir kaydı oluşturmak için gereken sabit bilgiler */
export type KayitBilgisi = { id: string; tur: Tur; baslik: string; altBaslik: string; href: string };

/** Oturumla birlikte gelen son durum (verilmeyen alan değişmez) */
export type Ek = {
  kisim?: string | null;
  konum?: number | null;
  tempo?: number | null;
  hiz?: number | null;
  aralik?: [number, number] | null;
  gitar?: string | null;
  elle?: boolean;
};

export const GUN_ADLARI = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
export const GUN_KISA = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
export const AY_ADLARI = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

/** Oturumları birleştirme penceresi: son eklemeden bu kadar sonra gelen süre yeni oturum açar */
const BIRLESTIR_MS = 15 * 60 * 1000;

/* ───────────── Tarih (yerel) ───────────── */

const iki = (n: number) => String(n).padStart(2, "0");
/** Yerel gün anahtarı YYYY-AA-GG (UTC değil) */
export const yerelGun = (d: Date) => `${d.getFullYear()}-${iki(d.getMonth() + 1)}-${iki(d.getDate())}`;
/** Gün anahtarından yerel öğlen (gün aritmetiği yaz saati geçişlerinden etkilenmesin) */
export const gunTarihi = (g: string) => {
  const [y, a, d] = g.split("-").map(Number);
  return new Date(y, a - 1, d, 12);
};
/** Pazartesi 0 … Pazar 6 */
export const haftaGunu = (d: Date) => (d.getDay() + 6) % 7;
export function gunEkle(g: string, n: number): string {
  const d = gunTarihi(g);
  d.setDate(d.getDate() + n);
  return yerelGun(d);
}
/** Haftanın pazartesisi (yerel gün anahtarı) */
export const haftaBasi = (d: Date) => gunEkle(yerelGun(d), -haftaGunu(d));

/* ───────────── Boş veri ve göç ───────────── */

export const bosPlan = (): HaftalikPlan => ({ hedefDk: [null, null, null, null, null, null, null], notlar: ["", "", "", "", "", "", ""] });
export const bos = (): DefterVeri => ({ surum: DEFTER_SURUM, kayitlar: {}, gitarlar: [], varsayilanGitar: null, plan: bosPlan() });

type Ham = Record<string, unknown>;
const nesne = (x: unknown): x is Ham => !!x && typeof x === "object" && !Array.isArray(x);
const metin = (x: unknown, yedek = "") => (typeof x === "string" ? x : yedek);
const metinYaDaNull = (x: unknown) => (typeof x === "string" && x.trim() ? x : null);
const sayi = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) ? x : typeof x === "string" && x.trim() && Number.isFinite(Number(x)) ? Number(x) : null);
const pozitif = (x: unknown) => Math.max(0, Math.round(sayi(x) ?? 0));
const gunMu = (x: unknown): x is string => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x);
const TURLER: Tur[] = ["egzersiz", "sarki", "serbest"];

function oturumNormalize(x: unknown): Oturum | null {
  if (!nesne(x)) return null;
  // v0: {tarih|date, sure|seconds, ...}; tarih ISO zaman damgası olarak yazılmışsa yerel güne çevrilir
  let tarih = x.tarih ?? x.date;
  if (typeof tarih === "string" && !gunMu(tarih) && !Number.isNaN(Date.parse(tarih))) tarih = yerelGun(new Date(tarih));
  if (!gunMu(tarih)) return null;
  const sure = pozitif(x.sure ?? x.seconds);
  if (!sure) return null;
  const o: Oturum = { tarih, sure, gitar: metinYaDaNull(x.gitar), kisim: metinYaDaNull(x.kisim), tempo: sayi(x.tempo ?? x.bpm) };
  if (x.elle === true) o.elle = true;
  const saat = sayi(x.saat);
  if (saat !== null && saat >= 0 && saat < 24) o.saat = Math.floor(saat);
  const son = sayi(x.son);
  if (son !== null) o.son = son;
  return o;
}

function kayitNormalize(x: unknown, idYedek: string): Kayit | null {
  if (!nesne(x)) return null;
  const id = metin(x.id, idYedek);
  if (!id) return null;
  const tur = TURLER.includes(x.tur as Tur) ? (x.tur as Tur) : id.startsWith("egzersiz:") ? "egzersiz" : id.startsWith("sarki:") ? "sarki" : "serbest";
  const oturumlar = (Array.isArray(x.oturumlar) ? x.oturumlar : []).map(oturumNormalize).filter((o): o is Oturum => !!o);
  const ar = Array.isArray(x.aralik) && x.aralik.length === 2 ? x.aralik.map(sayi) : null;
  const simdi = new Date().toISOString();
  const durum = x.durum === "devam" || x.durum === "ogrendim" ? x.durum : null;
  const k: Kayit = {
    id,
    tur,
    baslik: metin(x.baslik, id),
    altBaslik: metin(x.altBaslik),
    href: metin(x.href),
    kisim: metinYaDaNull(x.kisim),
    konum: sayi(x.konum),
    tempo: sayi(x.tempo),
    hiz: sayi(x.hiz),
    aralik: ar && ar[0] !== null && ar[1] !== null ? [ar[0], ar[1]] : null,
    gitar: metinYaDaNull(x.gitar),
    durum,
    not: metin(x.not),
    toplamSure: oturumlar.reduce((n, o) => n + o.sure, 0),
    oturumlar,
    guncellendi: metin(x.guncellendi, simdi),
    olusturuldu: metin(x.olusturuldu, metin(x.guncellendi, simdi)),
  };
  // v0'da oturumsuz yalnız toplam süre tutulmuş olabilir: süre kaybolmasın, tek oturuma dönüşür
  const eskiToplam = pozitif(x.toplamSure);
  if (!oturumlar.length && eskiToplam > 0) {
    k.oturumlar = [{ tarih: yerelGun(new Date(Date.parse(k.guncellendi) || Date.now())), sure: eskiToplam, gitar: k.gitar, kisim: k.kisim, tempo: k.tempo }];
    k.toplamSure = eskiToplam;
  }
  if (typeof x.acildi === "string") k.acildi = x.acildi;
  return k;
}

/**
 * Saklanan veriyi bugünkü biçime çevirir. Bozuk ya da bilinmeyen alanlar atılır, kayıtlar kaybolmaz.
 *  • null / bozuk        → boş defter
 *  • v0 (dizi)           → kayıt listesi (ilk deneme biçimi: [{id, baslik, …}])
 *  • v0 (sürümsüz nesne) → {kayitlar: dizi | nesne, gitarlar: [ad | {ad}]}
 *  • v1                  → alanlar doğrulanır, toplam süre oturumlardan yeniden hesaplanır
 *  • daha yeni sürüm     → bilinen alanlar okunur (eski uygulama yeni yedeği açabilsin)
 */
export function goc(ham: unknown): DefterVeri {
  const v = bos();
  if (!ham) return v;
  const kaynak: Ham = Array.isArray(ham) ? { kayitlar: ham } : nesne(ham) ? ham : {};
  const liste = Array.isArray(kaynak.kayitlar) ? kaynak.kayitlar.map((k, i) => [nesne(k) ? metin(k.id, `eski:${i}`) : `eski:${i}`, k] as const) : nesne(kaynak.kayitlar) ? Object.entries(kaynak.kayitlar) : [];
  for (const [id, k] of liste) {
    const n = kayitNormalize(k, id);
    if (n) v.kayitlar[n.id] = n;
  }
  const gitarlar = Array.isArray(kaynak.gitarlar) ? kaynak.gitarlar : [];
  gitarlar.forEach((g, i) => {
    const ad = typeof g === "string" ? g : nesne(g) ? metin(g.ad) : "";
    if (!ad.trim()) return;
    const id = nesne(g) && typeof g.id === "string" && g.id ? g.id : `g${i + 1}`;
    if (v.gitarlar.some((x) => x.id === id)) return;
    const tur = nesne(g) && GITAR_TURLERI.includes(g.tur as GitarTuru) ? (g.tur as GitarTuru) : undefined;
    v.gitarlar.push(tur ? { id, ad: ad.trim(), tur } : { id, ad: ad.trim() });
  });
  const vars = metinYaDaNull(kaynak.varsayilanGitar);
  v.varsayilanGitar = vars && v.gitarlar.some((g) => g.id === vars) ? vars : null;
  if (nesne(kaynak.plan)) {
    const h = Array.isArray(kaynak.plan.hedefDk) ? kaynak.plan.hedefDk : [];
    const n = Array.isArray(kaynak.plan.notlar) ? kaynak.plan.notlar : [];
    v.plan = {
      hedefDk: Array.from({ length: 7 }, (_, i) => {
        const d = sayi(h[i]);
        return d === null ? null : Math.min(600, Math.max(0, Math.round(d)));
      }),
      notlar: Array.from({ length: 7 }, (_, i) => metin(n[i]).slice(0, 200)),
    };
  }
  return v;
}

/* ───────────── Kayıt işlemleri (hepsi yeni nesne döndürür) ───────────── */

function yeniKayit(b: KayitBilgisi, simdi: Date): Kayit {
  const t = simdi.toISOString();
  return { ...b, kisim: null, konum: null, tempo: null, hiz: null, aralik: null, gitar: null, durum: null, not: "", toplamSure: 0, oturumlar: [], guncellendi: t, olusturuldu: t };
}

function kayitAl(v: DefterVeri, b: KayitBilgisi, simdi: Date): Kayit {
  const k = v.kayitlar[b.id];
  // Başlık ve bağlantı içerik değişince güncellenir (ders adı değişmiş olabilir)
  return k ? { ...k, baslik: b.baslik || k.baslik, altBaslik: b.altBaslik || k.altBaslik, href: b.href || k.href } : yeniKayit(b, simdi);
}

function ekUygula(k: Kayit, ek: Ek) {
  if (ek.kisim) k.kisim = ek.kisim;
  if (ek.konum !== undefined && ek.konum !== null) k.konum = ek.konum;
  if (ek.tempo) k.tempo = ek.tempo;
  if (ek.hiz) k.hiz = ek.hiz;
  if (ek.aralik !== undefined) k.aralik = ek.aralik;
  if (ek.gitar !== undefined) k.gitar = ek.gitar;
}

/** Kayıt için kullanılacak gitar: kaydın kendi gitarı, yoksa varsayılan gitar */
export const kayitGitari = (v: DefterVeri, k?: Kayit | null) => (k?.gitar && v.gitarlar.some((g) => g.id === k.gitar) ? k.gitar : v.varsayilanGitar);

/**
 * Süre ekler (saniye). Kayıt yoksa oluşturulur. Aynı gün, aynı gitar, aynı kısım ve aynı kaynakla (ölçülen / elle)
 * son eklemeden 15 dk içinde gelen süre son oturumla birleşir. 0 sn: yalnız son durum (konum, hız…) güncellenir,
 * kayıt yoksa oluşturulmaz.
 */
export function sureEkle(v: DefterVeri, b: KayitBilgisi, saniye: number, ek: Ek = {}, simdi = new Date()): DefterVeri {
  const sn = Math.max(0, Math.round(saniye));
  if (!sn && !v.kayitlar[b.id]) return v;
  const k = kayitAl(v, b, simdi);
  ekUygula(k, ek);
  if (sn) {
    const tarih = yerelGun(simdi);
    const gitar = ek.gitar !== undefined ? ek.gitar : kayitGitari(v, k);
    const kisim = k.kisim;
    const elle = !!ek.elle;
    const oturumlar = [...k.oturumlar];
    const son = oturumlar[oturumlar.length - 1];
    if (son && son.tarih === tarih && son.gitar === gitar && son.kisim === kisim && !!son.elle === elle && son.son !== undefined && simdi.getTime() - son.son <= BIRLESTIR_MS) {
      oturumlar[oturumlar.length - 1] = { ...son, sure: son.sure + sn, tempo: ek.tempo ?? son.tempo, son: simdi.getTime() };
    } else {
      const o: Oturum = { tarih, sure: sn, gitar, kisim, tempo: ek.tempo ?? k.tempo ?? null, saat: simdi.getHours(), son: simdi.getTime() };
      if (elle) o.elle = true;
      oturumlar.push(o);
    }
    k.oturumlar = oturumlar;
    k.toplamSure = oturumlar.reduce((n, o) => n + o.sure, 0);
  }
  k.guncellendi = simdi.toISOString();
  return { ...v, kayitlar: { ...v.kayitlar, [k.id]: k } };
}

/** Uygulama dışında açılan şarkı (Songsterr): kayıt "açıldı" olarak düşer, süresi elle girilir */
export function kayitAc(v: DefterVeri, b: KayitBilgisi, simdi = new Date()): DefterVeri {
  const k = kayitAl(v, b, simdi);
  k.acildi = simdi.toISOString();
  k.guncellendi = k.acildi;
  return { ...v, kayitlar: { ...v.kayitlar, [k.id]: k } };
}

/** Durum düğmesi: aynı duruma yeniden basmak işareti kaldırır (null). Kısım verilirse kayda yazılır. */
export function durumAyarla(v: DefterVeri, b: KayitBilgisi, durum: Durum | null, kisim?: string | null, simdi = new Date()): DefterVeri {
  const k = kayitAl(v, b, simdi);
  k.durum = durum;
  if (kisim !== undefined) k.kisim = kisim && kisim.trim() ? kisim.trim() : null;
  k.guncellendi = simdi.toISOString();
  return { ...v, kayitlar: { ...v.kayitlar, [k.id]: k } };
}

export type KayitYamasi = Partial<Pick<Kayit, "not" | "gitar" | "kisim" | "baslik" | "altBaslik" | "durum">>;
export function kayitGuncelle(v: DefterVeri, id: string, yama: KayitYamasi, simdi = new Date()): DefterVeri {
  const k = v.kayitlar[id];
  if (!k) return v;
  const y = { ...yama };
  if (y.kisim !== undefined) y.kisim = y.kisim && y.kisim.trim() ? y.kisim.trim() : null;
  return { ...v, kayitlar: { ...v.kayitlar, [id]: { ...k, ...y, guncellendi: simdi.toISOString() } } };
}

export function kayitSil(v: DefterVeri, id: string): DefterVeri {
  if (!v.kayitlar[id]) return v;
  const kayitlar = { ...v.kayitlar };
  delete kayitlar[id];
  return { ...v, kayitlar };
}

/** Elle kayıt ("+ Not ekle"): serbest başlık, kısım, gitar, süre (sn), durum, not */
export function elleEkle(
  v: DefterVeri,
  g: { baslik: string; kisim?: string | null; gitar?: string | null; sure?: number; durum?: Durum | null; not?: string; altBaslik?: string },
  simdi = new Date(),
): { veri: DefterVeri; id: string } {
  let id = `serbest:${simdi.getTime().toString(36)}`;
  for (let i = 2; v.kayitlar[id]; i++) id = `serbest:${simdi.getTime().toString(36)}-${i}`;
  const b: KayitBilgisi = { id, tur: "serbest", baslik: g.baslik.trim() || "Serbest çalışma", altBaslik: g.altBaslik?.trim() ?? "", href: "" };
  let veri = { ...v, kayitlar: { ...v.kayitlar, [id]: { ...yeniKayit(b, simdi), kisim: g.kisim?.trim() || null, gitar: g.gitar ?? v.varsayilanGitar, durum: g.durum ?? null, not: g.not ?? "" } } };
  if (g.sure) veri = sureEkle(veri, b, g.sure, { elle: true, gitar: g.gitar ?? v.varsayilanGitar }, simdi);
  return { veri, id };
}

/* ───────────── Gitarlar ───────────── */

export function gitarEkle(v: DefterVeri, ad: string, tur?: GitarTuru): { veri: DefterVeri; id: string } {
  let n = v.gitarlar.length + 1;
  while (v.gitarlar.some((g) => g.id === `g${n}`)) n++;
  const id = `g${n}`;
  const g: Gitar = tur ? { id, ad: ad.trim() || `Gitar ${n}`, tur } : { id, ad: ad.trim() || `Gitar ${n}` };
  return { veri: { ...v, gitarlar: [...v.gitarlar, g], varsayilanGitar: v.varsayilanGitar ?? id }, id };
}
export function gitarGuncelle(v: DefterVeri, id: string, yama: Partial<Omit<Gitar, "id">>): DefterVeri {
  return { ...v, gitarlar: v.gitarlar.map((g) => (g.id === id ? { ...g, ...yama, ad: (yama.ad ?? g.ad).trim() || g.ad } : g)) };
}
/** Gitar silinir; kayıtlardaki seçim kalkar, geçmiş oturumlar gitar kimliğini korur ("silinmiş gitar") */
export function gitarSil(v: DefterVeri, id: string): DefterVeri {
  const kayitlar = Object.fromEntries(Object.entries(v.kayitlar).map(([k, x]) => [k, x.gitar === id ? { ...x, gitar: null } : x]));
  const gitarlar = v.gitarlar.filter((g) => g.id !== id);
  return { ...v, kayitlar, gitarlar, varsayilanGitar: v.varsayilanGitar === id ? (gitarlar[0]?.id ?? null) : v.varsayilanGitar };
}
export const varsayilanAyarla = (v: DefterVeri, id: string | null): DefterVeri => ({ ...v, varsayilanGitar: id && v.gitarlar.some((g) => g.id === id) ? id : null });

/* ───────────── Haftalık plan ───────────── */

export function planAyarla(v: DefterVeri, gun: number, yama: { hedefDk?: number | null; not?: string }): DefterVeri {
  const hedefDk = [...v.plan.hedefDk];
  const notlar = [...v.plan.notlar];
  if (yama.hedefDk !== undefined) hedefDk[gun] = yama.hedefDk === null ? null : Math.min(600, Math.max(0, Math.round(yama.hedefDk)));
  if (yama.not !== undefined) notlar[gun] = yama.not.slice(0, 200);
  return { ...v, plan: { hedefDk, notlar } };
}
/** Günün hedefi (sn): plandaki dakika, yoksa günlük hedef */
export const gunHedefi = (v: DefterVeri, tarih: string, varsayilanDk: number) => (v.plan.hedefDk[haftaGunu(gunTarihi(tarih))] ?? varsayilanDk) * 60;

/* ───────────── Hesaplar ───────────── */

export type GunDefteri = { olculen: number; elle: number };

/** Gün → defterdeki ölçülen ve elle süre (sn) */
export function gunlukToplamlar(v: DefterVeri): Map<string, GunDefteri> {
  const m = new Map<string, GunDefteri>();
  for (const k of Object.values(v.kayitlar))
    for (const o of k.oturumlar) {
      const g = m.get(o.tarih) ?? { olculen: 0, elle: 0 };
      if (o.elle) g.elle += o.sure;
      else g.olculen += o.sure;
      m.set(o.tarih, g);
    }
  return m;
}

/**
 * Günün toplam çalışması (sn). İlerleme kaydı (günlük görevlerin kaynağı) ölçülen süreyi zaten içerir; defterin
 * ölçülen süresi onun alt kümesidir. İkisinden büyüğü alınır (ör. defter başka bilgisayardan içe aktarıldıysa),
 * elle girilen süre eklenir. Böylece aynı saniye iki kez sayılmaz.
 */
export const gunToplami = (d: GunDefteri | undefined, ilerlemeSn = 0) => Math.max(ilerlemeSn, d?.olculen ?? 0) + (d?.elle ?? 0);

/** Takvim yoğunluğu: 0 boş, 1–5 kademe (1–9 dk, 10–19, 20–39, 40–59, 60+) */
export const KADEME_ESIKLERI_DK = [1, 10, 20, 40, 60];
export function kademe(sn: number): number {
  const dk = sn / 60;
  let k = 0;
  KADEME_ESIKLERI_DK.forEach((e, i) => {
    if (dk >= e) k = i + 1;
  });
  return sn > 0 && k === 0 ? 1 : k;
}

/** Tarih aralığında [bas, bit] (kapsayıcı) gitar başına süre (sn); null = gitarsız */
export function gitarBasina(v: DefterVeri, bas: string, bit: string): Map<string | null, number> {
  const m = new Map<string | null, number>();
  for (const k of Object.values(v.kayitlar))
    for (const o of k.oturumlar) if (o.tarih >= bas && o.tarih <= bit) m.set(o.gitar, (m.get(o.gitar) ?? 0) + o.sure);
  return m;
}

export type GunOturumu = Oturum & { kayit: Kayit };
/** Bir günün oturumları (en yenisi önce) */
export function gununOturumlari(v: DefterVeri, tarih: string): GunOturumu[] {
  const out: GunOturumu[] = [];
  for (const k of Object.values(v.kayitlar)) for (const o of k.oturumlar) if (o.tarih === tarih) out.push({ ...o, kayit: k });
  return out.sort((a, b) => (b.son ?? 0) - (a.son ?? 0));
}

export type HaftaOzeti = { gunler: { tarih: string; sn: number; hedef: number; tamam: boolean }[]; toplam: number; hedefToplam: number; yuzde: number; seri: number };

/**
 * Bu haftanın (pazartesiden) özeti ve hedef serisi: günlük hedefin tutturulduğu art arda günler (bugün henüz
 * tutturulmadıysa dünden geriye sayılır; hedefi 0 olan dinlenme günleri seriyi bozmaz, artırmaz).
 */
export function haftaOzeti(v: DefterVeri, ilerleme: Map<string, number>, bugun: Date, varsayilanDk: number): HaftaOzeti {
  const defter = gunlukToplamlar(v);
  const toplamOf = (t: string) => gunToplami(defter.get(t), ilerleme.get(t) ?? 0);
  const bas = haftaBasi(bugun);
  const gunler = Array.from({ length: 7 }, (_, i) => {
    const tarih = gunEkle(bas, i);
    const sn = toplamOf(tarih);
    const hedef = gunHedefi(v, tarih, varsayilanDk);
    return { tarih, sn, hedef, tamam: hedef > 0 ? sn >= hedef : sn > 0 };
  });
  const toplam = gunler.reduce((n, g) => n + g.sn, 0);
  const hedefToplam = gunler.reduce((n, g) => n + g.hedef, 0);
  let seri = 0;
  let t = yerelGun(bugun);
  const tuttu = (x: string) => {
    const h = gunHedefi(v, x, varsayilanDk);
    return h > 0 ? toplamOf(x) >= h : null;
  };
  if (tuttu(t) !== true) t = gunEkle(t, -1);
  for (let i = 0; i < 400; i++, t = gunEkle(t, -1)) {
    const r = tuttu(t);
    if (r === false) break;
    if (r === true) seri++;
  }
  return { gunler, toplam, hedefToplam, yuzde: hedefToplam ? Math.round((toplam / hedefToplam) * 100) : 0, seri };
}

/* ───────────── Liste ───────────── */

export type Filtre = { durum: "devam" | "ogrendim" | "tumu"; tur: Tur | ""; gitar: string; q: string; sira: "son" | "cok" };
/** "Devam edenler": öğrenildi işaretlenmemiş her şey (sarı ve işaretsiz) */
export function listele(v: DefterVeri, f: Filtre): Kayit[] {
  const igne = f.q.trim().toLocaleLowerCase("tr");
  const out = Object.values(v.kayitlar).filter(
    (k) =>
      (f.durum === "tumu" || (f.durum === "ogrendim" ? k.durum === "ogrendim" : k.durum !== "ogrendim")) &&
      (!f.tur || k.tur === f.tur) &&
      (!f.gitar || (f.gitar === "-" ? !k.gitar && !k.oturumlar.some((o) => o.gitar) : k.gitar === f.gitar || k.oturumlar.some((o) => o.gitar === f.gitar))) &&
      (!igne || `${k.baslik} ${k.altBaslik} ${k.kisim ?? ""} ${k.not}`.toLocaleLowerCase("tr").includes(igne)),
  );
  return out.sort((a, b) => (f.sira === "cok" ? b.toplamSure - a.toplamSure || b.guncellendi.localeCompare(a.guncellendi) : b.guncellendi.localeCompare(a.guncellendi)));
}

/* ───────────── Yedek ───────────── */

export function disaAktar(v: DefterVeri, simdi = new Date()): string {
  return JSON.stringify({ uygulama: "GuitarFlex", icerik: "calisma-defteri", disaAktarildi: simdi.toISOString(), ...v }, null, 2);
}

/** İçe aktarılan JSON'u çözer ve göç ettirir; defter değilse hata fırlatır */
export function iceAktarMetin(metinIc: string): DefterVeri {
  let ham: unknown;
  try {
    ham = JSON.parse(metinIc);
  } catch {
    throw new Error("Dosya JSON değil.");
  }
  if (!Array.isArray(ham) && !(nesne(ham) && ("kayitlar" in ham || "gitarlar" in ham))) throw new Error("Bu dosya bir Çalışma Defteri yedeği değil.");
  return goc(ham);
}

/** Birleştirme: aynı kayıtta son güncellenen kalır; gitarlar ve plan yerel olan önceliklidir */
export function birlestir(yerel: DefterVeri, gelen: DefterVeri): DefterVeri {
  const kayitlar = { ...yerel.kayitlar };
  for (const [id, k] of Object.entries(gelen.kayitlar)) if (!kayitlar[id] || k.guncellendi > kayitlar[id].guncellendi) kayitlar[id] = k;
  const gitarlar = [...yerel.gitarlar, ...gelen.gitarlar.filter((g) => !yerel.gitarlar.some((x) => x.id === g.id))];
  const plan = yerel.plan.hedefDk.some((x) => x !== null) || yerel.plan.notlar.some(Boolean) ? yerel.plan : gelen.plan;
  return { ...yerel, kayitlar, gitarlar, varsayilanGitar: yerel.varsayilanGitar ?? gelen.varsayilanGitar, plan };
}

/* ───────────── Yazım ───────────── */

export function sureYaz(sn: number): string {
  const s = Math.max(0, Math.round(sn));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h) return m ? `${h} sa ${m} dk` : `${h} sa`;
  if (m) return `${m} dk`;
  return `${s} sn`;
}

/** "B kısmı" / "Riff kısmı" (tek harfli ders kısımları büyük harfle kalır) */
export const kisimYaz = (k: string) => `${k} kısmı`;

/** "B kısmı, 18. ölçü, %80 hız" */
export function konumYaz(k: Pick<Kayit, "kisim" | "konum" | "hiz" | "tempo">): string {
  const p: string[] = [];
  if (k.kisim) p.push(kisimYaz(k.kisim));
  if (k.konum) p.push(`${k.konum}. ölçü`);
  if (k.hiz && k.hiz !== 100) p.push(`%${k.hiz} hız`);
  else if (k.tempo) p.push(`${k.tempo} BPM`);
  return p.join(", ");
}
