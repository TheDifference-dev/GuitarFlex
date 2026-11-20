// Uygulama simgeleri: her kursun, ders türünün, teori yolunun, kütüphane türünün ve aracın sabit glifi ve zemini.
// Uygulamadaki bütün simgeler tek biçimdedir (bkz. components/site/UygulamaSimgesi.tsx): yuvarlatılmış kare, dikey
// geçişli zemin, ortada beyaz çizgi glif. Zeminler en fazla üç ailedir (gökkuşağı yok):
//   teknik  · bütün gitar tekniği kursları, rehberler, akorlar: laciverden maviye (akustik karşılıkları aynı ailenin
//             daha sıcak / derin tonu: "akustik")
//   teori   · teori yolları, bölümler, araçlar, ders türleri, ödüller: uzay grisinden laciverde
//   tur     · Şarkı Kütüphanesi ve eşlik türleri: gece laciverdinden çivite
// Eşleme belirlenimcidir: aynı anahtar her yerde aynı simgeyi verir. Sunucuda da istemcide de çalışır.
import type { Lesson } from "@/content/types";
import type { OzgunGlif } from "@/components/site/glifler/Glifler";

/** Simge zemin aileleri (değerler globals.css › --simge-*): hepsi beyaz glifle en az 3:1 kontrast verir */
export const SIMGE_RENKLERI = ["teknik", "akustik", "teori", "tur"] as const;
export type SimgeRengi = (typeof SIMGE_RENKLERI)[number];
export const RENK_ADI: Record<SimgeRengi, string> = {
  teknik: "Teknik",
  akustik: "Akustik",
  teori: "Teori ve araçlar",
  tur: "Kütüphane",
};

/**
 * Glif adları. Özgün glifler (teknikler, teori yolları): components/site/glifler/Glifler.tsx.
 * Diğerleri (bölümler, araçlar, ödüller) lucide çizgi simgeleridir; aynı 24'lük ızgara ve 1,75 çizgiyle çizilir.
 */
export type GlifAdi =
  | OzgunGlif
  | "seviye-1" | "seviye-2" | "seviye-3" | "seviye-4" | "seviye-5"
  | "nota" | "nota-uclu" | "kitap" | "kitap-yazi" | "nota-kagidi"
  | "mezuniyet" | "simsek" | "kulaklik" | "kalem" | "mikrofon" | "liste" | "gitar" | "metronom" | "gosterge" | "hedef"
  | "oynat" | "kutuphane" | "yildiz" | "kisi" | "sekiller" | "doseme" | "madalya" | "odul" | "elmas" | "tac" | "kupa"
  | "ayak-izi" | "takvim" | "saat" | "halter" | "ay" | "gun-dogumu" | "kronometre" | "karistir" | "isilti" | "kalkan"
  | "ampul" | "onay" | "piyano" | "gunes" | "basak" | "parmak-izi" | "nabiz" | "palmiye" | "dag" | "kurukafa" | "anit" | "alev";

export type SimgeTanim = { glif: GlifAdi; renk: SimgeRengi };
const s = (glif: GlifAdi, renk: SimgeRengi): SimgeTanim => ({ glif, renk });
const t = (glif: GlifAdi) => s(glif, "teknik");
const a = (glif: GlifAdi) => s(glif, "akustik");
const o = (glif: GlifAdi) => s(glif, "teori");

// ── Kurslar ──────────────────────────────────────────────────────────────────
// Glif tekniğin kendisini gösterir; bütün teknik kursları aynı zemini (teknik), akustik karşılıkları aynı glifi
// akustik tonunda taşır. Armoni bir teori kursudur (teori zemini).
const KURS: Record<string, SimgeTanim> = {
  "sifirdan-baslangic-rehberi": t("rehber-baslangic"),
  "baslangic-orta-rehberi": t("rehber"),
  "akor-yolu": t("akor"),
  akorlar: t("akor"),
  "kromatik-isinma": t("kromatik"),
  "alternatif-pena": t("alternate"),
  "economy-pena": t("economy"),
  "hybrid-picking": t("hybrid"),
  sweep: t("sweep"),
  arpej: t("arpej"),
  "hammer-on-pull-off": t("hammer-on"),
  legato: t("legato"),
  tapping: t("tapping"),
  slide: t("slide"),
  "bend-vibrato": t("bend-vibrato"),
  "palm-mute": t("palm-mute"),
  "ritim-tarama": t("strumming"),
  "gf-ekler": t("nota-cift"),
  "gf-stiller": t("stiller"),
  armoni: o("armoni"),
  "akustik-baslangic-rehberi": a("rehber-baslangic"),
  "akustik-alternatif-pena": a("alternate"),
  "akustik-arpej": a("arpej"),
  "akustik-bend-vibrato": a("bend-vibrato"),
  "akustik-hopo": a("hammer-on"),
  "akustik-slide": a("slide"),
};

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

/** Kursun simgesi. Bilinmeyen akustik kurs elektro karşılığının glifini akustik tonunda, diğerleri nota glifini teknik zeminde alır. */
export function kursSimgesi(slug: string): SimgeTanim {
  const k = KURS[slug];
  if (k) return k;
  if (slug.startsWith("akustik-")) return a(KURS[slug.slice(8)]?.glif ?? "gitar");
  if (slug.endsWith("-rehberi")) return t("rehber");
  return t("nota-cift");
}

// ── Ders türleri ─────────────────────────────────────────────────────────────
/** Dersin simge türü: drill dışındaki ders türleri, teori kartları ve tabsız okuma adımı */
export type DersTuru = "etut" | "okuma" | "quickstudy" | "transkripsiyon" | "kompozisyon" | "resital" | "egitim" | "pratik" | "ek";
const DERS: Record<DersTuru | "drill", SimgeTanim> = {
  drill: t("gitar"),
  etut: o("mezuniyet"),
  okuma: o("okuma"),
  quickstudy: o("simsek"),
  transkripsiyon: o("kulaklik"),
  kompozisyon: o("kalem"),
  resital: o("mikrofon"),
  egitim: o("kitap-yazi"),
  pratik: o("liste"),
  ek: o("gitar"),
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
  ritim: o("ritim"),
  klavye: o("klavye"),
  kulak: o("kulak"),
  okuma: o("okuma"),
  armoni: o("armoni"),
};
export const yolSimgesi = (slug: string): SimgeTanim => YOL[slug] ?? o("liste");

/** Bölümler, sayfalar ve araçlar (mega menü, ana sayfa döşemeleri, araçlar sayfası) */
const YER = {
  elektro: t("simsek"),
  akustik: a("gitar"),
  teori: o("kitap"),
  "teori-dersi": o("kitap-yazi"),
  seviye: t("seviye-3"),
  kurslar: t("doseme"),
  rehber: t("rehber"),
  kutuphane: s("kutuphane", "tur"),
  sarkilar: s("yildiz", "tur"),
  oynatici: o("oynat"),
  dogaclama: s("mikrofon", "tur"),
  araclar: o("gosterge"),
  metronom: o("metronom"),
  "nota-testi": o("hedef"),
  "sap-gezgini": o("klavye"),
  akort: o("gosterge"),
  caged: o("akor"),
  profil: o("kisi"),
  marka: o("sekiller"),
  "muzik-bilgisi": o("nota"),
  ipucu: o("ampul"),
  // Profil özet kutuları
  seri: o("alev"),
  kalkan: o("kalkan"),
  gorev: o("liste"),
  puan: o("kupa"),
  // Seviye Yolu eksenleri
  technique: t("bend"),
  fretboard: o("klavye"),
  rhythm: o("ritim"),
  theory_ear: o("kulak"),
} satisfies Record<string, SimgeTanim>;
export type YerAdi = keyof typeof YER;
export const yerSimgesi = (ad: YerAdi): SimgeTanim => YER[ad];

/** Seviye simgeleri: dolan beş basamak, teknik zemininde */
export function seviyeSimgesi(seviye: string | number): SimgeTanim {
  const n = Math.min(5, Math.max(1, typeof seviye === "number" ? seviye : Number(seviye.replace(/\D/g, "")) || 1));
  return t(`seviye-${n as 1 | 2 | 3 | 4 | 5}`);
}

// ── Kütüphane ve eşlik türleri (üçüncü aile) ─────────────────────────────────
const u = (glif: GlifAdi) => s(glif, "tur");
const TUR: Record<string, SimgeTanim> = {
  Blues: u("nota-uclu"),
  Rock: u("gitar"),
  Funk: u("nabiz"),
  Metal: u("kurukafa"),
  Pop: u("isilti"),
  Caz: u("piyano"),
  "Bossa Nova": u("palmiye"),
  Reggae: u("gunes"),
  Country: u("basak"),
  Fingerstyle: u("parmak-izi"),
  "Türk Halk Müziği": u("dag"),
  Klasik: u("anit"),
  Groove: u("ritim"),
};
/** Müzik türünün simgesi (Şarkı Kütüphanesi, doğaçlama eşlikleri) */
export const turSimgesi = (tur: string): SimgeTanim => TUR[tur] ?? u("nota");

// ── Madalyalar, rozetler, başarımlar (teori ve araçlar ailesi) ───────────────
const MADALYA: Record<string, SimgeTanim> = {
  Bronz: o("madalya"),
  Gümüş: o("madalya"),
  Altın: o("madalya"),
  Platin: o("odul"),
  Elmas: o("elmas"),
  Usta: o("tac"),
};
export const madalyaSimgesi = (metal: string): SimgeTanim => MADALYA[metal] ?? o("madalya");

const ROZET: Record<string, SimgeTanim> = {
  "ilk-adim": o("ayak-izi"),
  "uc-gun": o("alev"),
  "yedi-gun": o("takvim"),
  "bir-saat": o("saat"),
  "on-saat": o("halter"),
  "on-egzersiz": o("onay"),
  "teknik-ustasi": o("odul"),
  hizli: o("simsek"),
  kulak: o("kulak"),
};
/** Profil rozeti (lib/ranks.ts): rozet kimliğine göre */
export const rozetSimgesi = (id: string): SimgeTanim => ROZET[id] ?? o("odul");

/** Başarım (içerik paketindeki oyun.json): ölçüsüne göre */
const BASARIM: Record<string, SimgeTanim> = {
  streak_days: o("alev"),
  night_practice: o("ay"),
  morning_practice: o("gun-dogumu"),
  daily_practice_minutes: o("kronometre"),
  first_lesson: o("ayak-izi"),
  pathways_with_lessons: o("sekiller"),
  completed_sections: o("liste"),
  techniques_with_completed_section: o("karistir"),
  pathways_completed: o("mezuniyet"),
  bronze_count: MADALYA.Bronz,
  silver_count: MADALYA.Gümüş,
  gold_count: MADALYA.Altın,
  platinum_count: MADALYA.Platin,
  diamond_count: MADALYA.Elmas,
  master_count: MADALYA.Usta,
  account_exists: o("isilti"),
  account_age_days: o("takvim"),
  distinct_saved_tabs: o("nota-kagidi"),
};
export const basarimSimgesi = (olcu: string): SimgeTanim => BASARIM[olcu] ?? o("kupa");

// ── Döküm (marka sayfası) ────────────────────────────────────────────────────
export type SimgeDokumu = { baslik: string; simgeler: { ad: string; simge: SimgeTanim }[] }[];
const dok = (o: Record<string, SimgeTanim>) => Object.entries(o).map(([ad, simge]) => ({ ad, simge }));

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
