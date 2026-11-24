// Uygulama simgeleri: her kursun, ders türünün, teori yolunun, kütüphane türünün ve aracın sabit glifi ve rengi.
// Uygulamadaki bütün simgeler tek biçimdedir (bkz. components/site/UygulamaSimgesi.tsx): iPhone uygulama simgesi gibi
// yuvarlatılmış kare (süper elips), hafif dikey geçişli tek renk zemin, ortada beyaz, tek kalınlıkta çizgi glif.
// Renkler apple sistem renkleri ailesindendir (değerler globals.css › --simge-<renk>); her kursun kendi rengi vardır,
// katalogda yan yana ve alt alta duran kurslar farklı renktedir. Bir tekniğin elektro ve akustik kursu aynı tekniği
// öğrettiği için aynı glifi ve rengi taşır. Eşleme belirlenimcidir: aynı anahtar her yerde aynı simgeyi verir.
// Sunucuda da istemcide de çalışır.
import type { Lesson } from "@/content/types";
import type { OzgunGlif } from "@/components/site/glifler/Glifler";

/** Simge zemin renkleri (değerler globals.css › --simge-*): hepsi beyaz glifle geçişin ortasında en az 3,5:1 */
export const SIMGE_RENKLERI = ["mavi", "lacivert", "indigo", "mor", "pembe", "kirmizi", "turuncu", "sari", "yesil", "nane", "camgobegi", "kahve", "gri", "grafit"] as const;
export type SimgeRengi = (typeof SIMGE_RENKLERI)[number];
export const RENK_ADI: Record<SimgeRengi, string> = {
  mavi: "Mavi",
  lacivert: "Lacivert",
  indigo: "İndigo",
  mor: "Mor",
  pembe: "Pembe",
  kirmizi: "Kırmızı",
  turuncu: "Turuncu",
  sari: "Sarı",
  yesil: "Yeşil",
  nane: "Nane",
  camgobegi: "Camgöbeği",
  kahve: "Kahve",
  gri: "Gri",
  grafit: "Grafit",
};

/**
 * Glif adları. Özgün glifler (teknikler, teori yolları): components/site/glifler/Glifler.tsx.
 * Diğerleri (bölümler, araçlar, ödüller) lucide çizgi simgeleridir; aynı 24'lük ızgara ve aynı çizgi kalınlığıyla çizilir.
 */
export type GlifAdi =
  | OzgunGlif
  | "seviye-1" | "seviye-2" | "seviye-3" | "seviye-4" | "seviye-5"
  | "nota" | "nota-uclu" | "kitap" | "kitap-yazi" | "nota-kagidi"
  | "mezuniyet" | "simsek" | "kulaklik" | "kalem" | "mikrofon" | "liste" | "gitar" | "metronom" | "gosterge" | "hedef"
  | "oynat" | "kutuphane" | "yildiz" | "kisi" | "sekiller" | "doseme" | "madalya" | "odul" | "elmas" | "tac" | "kupa"
  | "ayak-izi" | "takvim" | "saat" | "halter" | "ay" | "gun-dogumu" | "kronometre" | "karistir" | "isilti" | "kalkan"
  | "ampul" | "onay" | "piyano" | "gunes" | "basak" | "parmak-izi" | "nabiz" | "palmiye" | "dag" | "kurukafa" | "anit" | "alev"
  | "ara" | "klasor";

export type SimgeTanim = { glif: GlifAdi; renk: SimgeRengi };
const s = (glif: GlifAdi, renk: SimgeRengi): SimgeTanim => ({ glif, renk });

// ── Kurslar: renk + glif tablosu (tek yer) ───────────────────────────────────
// Glif tekniğin kendisini gösterir (bend: yukarı kavisli ok, slide: eğik kayma çizgisi, palm mute: avuç + tel,
// tapping: parmak ucu ve nokta, sweep: telleri süpüren ok, legato: bağ yayı, arpej: basamaklı notalar, alternate:
// aşağı/yukarı pena işaretleri, economy: tek yön ok + pena, hybrid: pena + parmak, strumming: tarama okları,
// akorlar: akor diyagramı). Renkler katalog sırasında komşu kurslar ayırt edilsin diye dağıtıldı (3 sütunlu ızgarada
// yan yana ve alt alta aynı renk yok).
export const KURS_SIMGELERI: Record<string, SimgeTanim> = {
  // Başlangıç rehberleri
  "sifirdan-baslangic-rehberi": s("rehber-baslangic", "yesil"),
  "baslangic-orta-rehberi": s("rehber", "indigo"),
  "akustik-baslangic-rehberi": s("rehber-baslangic", "turuncu"),
  // Akor yolu
  "akor-yolu": s("akor", "mavi"),
  akorlar: s("akor", "kirmizi"),
  // Elektro gitar teknikleri (katalog sırası)
  "alternatif-pena": s("alternate", "kirmizi"),
  arpej: s("arpej", "mor"),
  "bend-vibrato": s("bend", "turuncu"),
  "economy-pena": s("economy", "camgobegi"),
  "hammer-on-pull-off": s("hammer-on", "yesil"),
  "hybrid-picking": s("hybrid", "pembe"),
  legato: s("legato", "mavi"),
  "palm-mute": s("palm-mute", "kahve"),
  slide: s("slide", "nane"),
  "ritim-tarama": s("strumming", "sari"),
  sweep: s("sweep", "indigo"),
  tapping: s("tapping", "lacivert"),
  // Ek kurslar
  "kromatik-isinma": s("kromatik", "gri"),
  /** Günlük Rutin (kurs değil, /rutin): ana sayfa ve Elektro sayfası kartları */
  "gunluk-rutin": s("kronometre", "turuncu"),
  "gf-ekler": s("nota-cift", "camgobegi"),
  "gf-stiller": s("stiller", "pembe"),
  // Müzik teorisi
  armoni: s("armoni", "mor"),
  // Akustik teknikler: elektro karşılığının glifi ve rengi
  "akustik-alternatif-pena": s("alternate", "kirmizi"),
  "akustik-arpej": s("arpej", "mor"),
  "akustik-bend-vibrato": s("bend", "turuncu"),
  "akustik-hopo": s("hammer-on", "yesil"),
  "akustik-slide": s("slide", "nane"),
};
const KURS = KURS_SIMGELERI;

/** Simge ızgarasındaki kısa adlar (uzun kurs adları için); yoksa kursun kart adı kullanılır */
const KISA_AD: Record<string, string> = {
  "sifirdan-baslangic-rehberi": "Sıfırdan Başlangıç",
  "baslangic-orta-rehberi": "Başlangıç-Orta",
  "hammer-on-pull-off": "Hammer-On",
  "hybrid-picking": "Hybrid Picking",
  "ritim-tarama": "Strumming",
  "yol:klavye": "Klavye",
  "gf-ekler": "Müzisyenlik",
  "gf-stiller": "Stiller",
  armoni: "Armoni",
  "akustik-baslangic-rehberi": "Akustik Rehber",
  "akustik-alternatif-pena": "Akustik Pena",
  "akustik-arpej": "Akustik Arpej",
  "akustik-bend-vibrato": "Akustik Bend",
  "akustik-hopo": "Akustik Hammer-On",
  "akustik-slide": "Akustik Slide",
};
export const kisaAd = (slug: string, ad: string) => KISA_AD[slug] ?? ad;

/** Kursun simgesi. Bilinmeyen akustik kurs elektro karşılığının simgesini, diğerleri nota glifini gri zeminde alır. */
export function kursSimgesi(slug: string): SimgeTanim {
  const k = KURS[slug];
  if (k) return k;
  if (slug.startsWith("akustik-")) return KURS[slug.slice(8)] ?? s("gitar", "kahve");
  if (slug.endsWith("-rehberi")) return s("rehber", "indigo");
  return s("nota-cift", "gri");
}

// ── Ders türleri ─────────────────────────────────────────────────────────────
/** Dersin simge türü: drill dışındaki ders türleri, teori kartları ve tabsız okuma adımı */
export type DersTuru = "etut" | "okuma" | "quickstudy" | "transkripsiyon" | "kompozisyon" | "resital" | "egitim" | "pratik" | "ek";
const DERS: Record<DersTuru | "drill", SimgeTanim> = {
  drill: s("gitar", "grafit"),
  etut: s("mezuniyet", "sari"),
  okuma: s("okuma", "yesil"),
  quickstudy: s("simsek", "turuncu"),
  transkripsiyon: s("kulaklik", "pembe"),
  kompozisyon: s("kalem", "mor"),
  resital: s("mikrofon", "kirmizi"),
  egitim: s("kitap-yazi", "indigo"),
  pratik: s("liste", "yesil"),
  ek: s("gitar", "kahve"),
};
export const DERS_TURU_ADI: Record<DersTuru | "drill", string> = {
  drill: "Drill",
  etut: "Etüt",
  okuma: "Okuma",
  quickstudy: "Quick Study",
  transkripsiyon: "Transkripsiyon",
  kompozisyon: "Kompozisyon",
  resital: "Resital",
  egitim: "Eğitim kartı",
  pratik: "Pratik kartı",
  ek: "Ek inceleme",
};

/** Dersin türü; sıradan tablı drill için undefined (kursun kendi simgesini taşır) */
export function dersTuru(l: Pick<Lesson, "kind" | "card" | "practice" | "tex" | "tabFile" | "body">): DersTuru | undefined {
  if (l.kind && l.kind !== "drill") return l.kind;
  if (l.practice) return "pratik";
  if (l.card) return l.card;
  if (!l.tex && !l.tabFile && l.body?.length) return "okuma";
  return undefined;
}

/** Ders simgesi: özel türlerin kendi simgesi vardır; drill kursun simgesini taşır (kurs verilmezse genel drill simgesi) */
export const dersSimgesi = (tur?: DersTuru, kurs?: string): SimgeTanim => (tur ? DERS[tur] : kurs ? kursSimgesi(kurs) : DERS.drill);

// ── Teori yolları, bölümler, araçlar ─────────────────────────────────────────
const YOL: Record<string, SimgeTanim> = {
  ritim: s("ritim", "turuncu"),
  klavye: s("klavye", "mavi"),
  kulak: s("kulak", "pembe"),
  okuma: s("okuma", "yesil"),
  armoni: s("armoni", "mor"),
};
export const yolSimgesi = (slug: string): SimgeTanim => YOL[slug] ?? s("liste", "gri");

/** Bölümler, sayfalar ve araçlar (mega menü, ana sayfa döşemeleri, araçlar sayfası) */
const YER = {
  elektro: s("simsek", "mavi"),
  akustik: s("gitar", "kahve"),
  teori: s("kitap", "indigo"),
  "teori-dersi": s("kitap-yazi", "indigo"),
  seviye: s("seviye-3", "yesil"),
  kurslar: s("doseme", "grafit"),
  rehber: s("rehber", "indigo"),
  /** Şarkı Kütüphanesi: Songsterr'in bütün kataloğu (uygulama içi pencerede) */
  "sarki-kutuphanesi": s("ara", "kirmizi"),
  /** Rehber Şarkılar (eski Şarkılarla Öğren): GuitarBear Şarkı Rehberi sırası */
  sarkilar: s("yildiz", "pembe"),
  /** Şarkı Kütüphanesi › Tüm Şarkılar (kapaklı kartlar) */
  "tum-sarkilar": s("nota", "mor"),
  /** Tab Oynatıcı ve dosyalarım: çalınabilir çok track'li parçalar ve kullanıcının dosyaları */
  kutuphane: s("klasor", "grafit"),
  oynatici: s("oynat", "gri"),
  dogaclama: s("mikrofon", "turuncu"),
  araclar: s("gosterge", "gri"),
  metronom: s("metronom", "grafit"),
  rutin: s("kronometre", "turuncu"),
  "nota-testi": s("hedef", "kirmizi"),
  "sap-gezgini": s("klavye", "mavi"),
  akort: s("gosterge", "gri"),
  caged: s("akor", "lacivert"),
  profil: s("kisi", "gri"),
  defter: s("kalem", "sari"),
  marka: s("sekiller", "indigo"),
  "muzik-bilgisi": s("nota", "indigo"),
  ipucu: s("ampul", "sari"),
  // Profil özet kutuları
  seri: s("alev", "turuncu"),
  kalkan: s("kalkan", "mavi"),
  gorev: s("liste", "yesil"),
  puan: s("kupa", "sari"),
  // Seviye Yolu eksenleri
  technique: s("bend", "kirmizi"),
  fretboard: s("klavye", "mavi"),
  rhythm: s("ritim", "turuncu"),
  theory_ear: s("kulak", "pembe"),
} satisfies Record<string, SimgeTanim>;
export type YerAdi = keyof typeof YER;
export const yerSimgesi = (ad: YerAdi): SimgeTanim => YER[ad];

/** Seviye simgeleri: dolan beş basamak; renk yeşilden (L1) mora (L5) ilerler */
const SEVIYE_RENGI: SimgeRengi[] = ["yesil", "camgobegi", "mavi", "indigo", "mor"];
export function seviyeSimgesi(seviye: string | number): SimgeTanim {
  const n = Math.min(5, Math.max(1, typeof seviye === "number" ? seviye : Number(seviye.replace(/\D/g, "")) || 1));
  return s(`seviye-${n as 1 | 2 | 3 | 4 | 5}`, SEVIYE_RENGI[n - 1]);
}

// ── Müzik türleri (çalınabilir parçalar, doğaçlama eşlikleri) ────────────────
const TUR: Record<string, SimgeTanim> = {
  Blues: s("nota-uclu", "mavi"),
  Rock: s("gitar", "kirmizi"),
  Funk: s("nabiz", "turuncu"),
  Metal: s("kurukafa", "grafit"),
  Pop: s("isilti", "pembe"),
  Caz: s("piyano", "indigo"),
  "Bossa Nova": s("palmiye", "yesil"),
  Reggae: s("gunes", "sari"),
  Country: s("basak", "kahve"),
  Fingerstyle: s("parmak-izi", "nane"),
  "Türk Halk Müziği": s("dag", "camgobegi"),
  Klasik: s("anit", "mor"),
  Groove: s("ritim", "lacivert"),
};
/** Müzik türünün simgesi (çalınabilir parçalar, doğaçlama eşlikleri) */
export const turSimgesi = (tur: string): SimgeTanim => TUR[tur] ?? s("nota", "gri");

// ── Madalyalar, rozetler, başarımlar ─────────────────────────────────────────
const MADALYA: Record<string, SimgeTanim> = {
  Bronz: s("madalya", "kahve"),
  Gümüş: s("madalya", "gri"),
  Altın: s("madalya", "sari"),
  Platin: s("odul", "camgobegi"),
  Elmas: s("elmas", "mavi"),
  Usta: s("tac", "mor"),
};
export const madalyaSimgesi = (metal: string): SimgeTanim => MADALYA[metal] ?? s("madalya", "sari");

const ROZET: Record<string, SimgeTanim> = {
  "ilk-adim": s("ayak-izi", "yesil"),
  "uc-gun": s("alev", "turuncu"),
  "yedi-gun": s("takvim", "kirmizi"),
  "bir-saat": s("saat", "grafit"),
  "on-saat": s("halter", "gri"),
  "on-egzersiz": s("onay", "yesil"),
  "teknik-ustasi": s("odul", "sari"),
  hizli: s("simsek", "turuncu"),
  kulak: s("kulak", "pembe"),
};
/** Profil rozeti (lib/ranks.ts): rozet kimliğine göre */
export const rozetSimgesi = (id: string): SimgeTanim => ROZET[id] ?? s("odul", "sari");

/** Başarım (içerik paketindeki oyun.json): ölçüsüne göre */
const BASARIM: Record<string, SimgeTanim> = {
  streak_days: s("alev", "turuncu"),
  night_practice: s("ay", "indigo"),
  morning_practice: s("gun-dogumu", "turuncu"),
  daily_practice_minutes: s("kronometre", "gri"),
  first_lesson: s("ayak-izi", "yesil"),
  pathways_with_lessons: s("sekiller", "mor"),
  completed_sections: s("liste", "yesil"),
  techniques_with_completed_section: s("karistir", "camgobegi"),
  pathways_completed: s("mezuniyet", "sari"),
  bronze_count: MADALYA.Bronz,
  silver_count: MADALYA.Gümüş,
  gold_count: MADALYA.Altın,
  platinum_count: MADALYA.Platin,
  diamond_count: MADALYA.Elmas,
  master_count: MADALYA.Usta,
  account_exists: s("isilti", "pembe"),
  account_age_days: s("takvim", "kirmizi"),
  distinct_saved_tabs: s("nota-kagidi", "grafit"),
};
export const basarimSimgesi = (olcu: string): SimgeTanim => BASARIM[olcu] ?? s("kupa", "sari");

// ── Döküm (marka sayfası) ────────────────────────────────────────────────────
export type SimgeDokumu = { baslik: string; simgeler: { ad: string; simge: SimgeTanim }[] }[];
const dok = (x: Record<string, SimgeTanim>) => Object.entries(x).map(([ad, simge]) => ({ ad, simge }));

/** Bütün eşlemeler, gruplarıyla (marka sayfasındaki döküm ve eşleme sayısı için) */
export const SIMGE_DOKUMU: SimgeDokumu = [
  { baslik: "Kurslar", simgeler: dok(KURS) },
  { baslik: "Ders türleri", simgeler: Object.entries(DERS).map(([k, simge]) => ({ ad: DERS_TURU_ADI[k as DersTuru | "drill"], simge })) },
  { baslik: "Teori yolları", simgeler: dok(YOL) },
  { baslik: "Seviyeler", simgeler: [1, 2, 3, 4, 5].map((n) => ({ ad: `L${n}`, simge: seviyeSimgesi(n) })) },
  { baslik: "Bölümler ve araçlar", simgeler: dok(YER) },
  { baslik: "Kütüphane türleri", simgeler: dok(TUR) },
  { baslik: "Madalyalar", simgeler: dok(MADALYA) },
  { baslik: "Rozetler", simgeler: dok(ROZET) },
  { baslik: "Başarımlar", simgeler: dok(BASARIM) },
];
