// Uygulama simgeleri: her kursun, ders türünün, teori yolunun, kütüphane türünün ve aracın sabit glifi ve rengi.
// Uygulamadaki bütün simgeler tek biçimdedir (bkz. components/site/UygulamaSimgesi.tsx): yuvarlatılmış kare, dolu renk
// zemin, ortada beyaz çizgi glif. Eşleme belirlenimcidir: aynı anahtar her yerde aynı simgeyi verir; listede olmayan
// bir kurs slug'ı adından hesaplanan sabit bir renk ve varsayılan glif alır. Sunucuda da istemcide de çalışır.
import type { Lesson } from "@/content/types";

/** Palet (değerler globals.css › --simge-*): hepsi beyaz glifle en az 3:1 kontrast verir */
export const SIMGE_RENKLERI = ["kirmizi", "turuncu", "sari", "yesil", "nane", "camgobegi", "mavi", "civit", "mor", "pembe", "kahve", "gri"] as const;
export type SimgeRengi = (typeof SIMGE_RENKLERI)[number];
export const RENK_ADI: Record<SimgeRengi, string> = {
  kirmizi: "Kırmızı",
  turuncu: "Turuncu",
  sari: "Sarı",
  yesil: "Yeşil",
  nane: "Nane",
  camgobegi: "Camgöbeği",
  mavi: "Mavi",
  civit: "Çivit",
  mor: "Mor",
  pembe: "Pembe",
  kahve: "Kahve",
  gri: "Gri",
};

/** Glif adları: çizimleri UygulamaSimgesi.tsx içindedir (lucide çizgi simgeleri ve gitar yazımından özgün çizimler) */
export type GlifAdi =
  // Özgün çizimler (tab yazımındaki işaretlerden)
  | "slide" | "bend" | "bag" | "legato" | "arpej" | "sweep" | "sonum" | "akor"
  | "seviye-1" | "seviye-2" | "seviye-3" | "seviye-4" | "seviye-5"
  // lucide
  | "asagi-yukari" | "cift-asagi" | "el" | "dokunus" | "ses-cizgileri" | "alev" | "nota" | "nota-cift" | "palet"
  | "filiz" | "rota" | "tabela" | "kitap" | "kitap-yazi" | "katman" | "davul" | "izgara" | "kulak" | "nota-kagidi"
  | "mezuniyet" | "simsek" | "kulaklik" | "kalem" | "mikrofon" | "liste" | "gitar" | "metronom" | "gosterge" | "hedef"
  | "oynat" | "kutuphane" | "yildiz" | "kisi" | "sekiller" | "doseme" | "madalya" | "odul" | "elmas" | "tac" | "kupa"
  | "ayak-izi" | "takvim" | "saat" | "halter" | "ay" | "gun-dogumu" | "kronometre" | "karistir" | "isilti" | "kalkan"
  | "ampul" | "onay" | "piyano" | "gunes" | "basak" | "parmak-izi" | "nabiz" | "palmiye" | "dag" | "kurukafa" | "anit" | "nota-uclu";

export type SimgeTanim = { glif: GlifAdi; renk: SimgeRengi };
const s = (glif: GlifAdi, renk: SimgeRengi): SimgeTanim => ({ glif, renk });

// ── Kurslar ──────────────────────────────────────────────────────────────────
// Aile renkleri: rehberler yeşil–nane · akor sarı · pena (sağ el) mavi–camgöbeği–çivit · bağ (sol el) mor–pembe
// · ritim ve ifade kırmızı–turuncu · akustik kurslar kahve (ahşap) · teori çivit
const KURS: Record<string, SimgeTanim> = {
  "sifirdan-baslangic-rehberi": s("filiz", "yesil"),
  "baslangic-orta-rehberi": s("rota", "nane"),
  "akor-yolu": s("akor", "sari"),
  akorlar: s("akor", "sari"),
  "alternatif-pena": s("asagi-yukari", "mavi"),
  "economy-pena": s("cift-asagi", "camgobegi"),
  "hybrid-picking": s("el", "mavi"),
  sweep: s("sweep", "civit"),
  arpej: s("arpej", "civit"),
  "hammer-on-pull-off": s("bag", "mor"),
  legato: s("legato", "mor"),
  tapping: s("dokunus", "pembe"),
  slide: s("slide", "pembe"),
  "bend-vibrato": s("bend", "kirmizi"),
  "palm-mute": s("sonum", "turuncu"),
  "ritim-tarama": s("ses-cizgileri", "kirmizi"),
  "kromatik-isinma": s("alev", "kirmizi"),
  "gf-ekler": s("nota-cift", "nane"),
  "gf-stiller": s("palet", "turuncu"),
  armoni: s("kitap", "civit"),
  "akustik-baslangic-rehberi": s("tabela", "kahve"),
  "akustik-alternatif-pena": s("asagi-yukari", "kahve"),
  "akustik-arpej": s("arpej", "kahve"),
  "akustik-bend-vibrato": s("bend", "kahve"),
  "akustik-hopo": s("bag", "kahve"),
  "akustik-slide": s("slide", "kahve"),
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

/** Listede olmayan anahtarlar için: addan hesaplanan sabit renk (gri hariç) */
function renkSec(anahtar: string): SimgeRengi {
  let h = 0;
  for (const c of anahtar) h = (h * 31 + c.codePointAt(0)!) >>> 0;
  return SIMGE_RENKLERI[h % (SIMGE_RENKLERI.length - 1)];
}

/** Kursun simgesi. Bilinmeyen akustik kurs elektro karşılığının glifini kahve zeminde, diğerleri nota glifini sabit bir renkte alır. */
export function kursSimgesi(slug: string): SimgeTanim {
  const t = KURS[slug];
  if (t) return t;
  if (slug.startsWith("akustik-")) return s(KURS[slug.slice(8)]?.glif ?? "gitar", "kahve");
  if (slug.endsWith("-rehberi")) return s("rota", "yesil");
  return s("nota", renkSec(slug));
}

// ── Ders türleri ─────────────────────────────────────────────────────────────
/** Dersin simge türü: drill dışındaki ders türleri, teori kartları ve tabsız okuma adımı */
export type DersTuru = "etut" | "okuma" | "quickstudy" | "transkripsiyon" | "kompozisyon" | "resital" | "egitim" | "pratik" | "ek";
const DERS: Record<DersTuru | "drill", SimgeTanim> = {
  drill: s("gitar", "gri"),
  etut: s("mezuniyet", "civit"),
  okuma: s("kitap-yazi", "mavi"),
  quickstudy: s("simsek", "turuncu"),
  transkripsiyon: s("kulaklik", "mor"),
  kompozisyon: s("kalem", "pembe"),
  resital: s("mikrofon", "sari"),
  egitim: s("kitap-yazi", "mavi"),
  pratik: s("liste", "yesil"),
  ek: s("gitar", "camgobegi"),
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
  ritim: s("davul", "kirmizi"),
  klavye: s("izgara", "camgobegi"),
  kulak: s("kulak", "mor"),
  okuma: s("nota-kagidi", "mavi"),
  armoni: s("katman", "civit"),
};
export const yolSimgesi = (slug: string): SimgeTanim => YOL[slug] ?? s("liste", renkSec(`yol:${slug}`));

/** Bölümler, sayfalar ve araçlar (mega menü, ana sayfa döşemeleri, araçlar sayfası) */
const YER = {
  elektro: s("simsek", "mavi"),
  akustik: s("gitar", "kahve"),
  teori: s("kitap", "civit"),
  "teori-dersi": s("kitap-yazi", "civit"),
  seviye: s("seviye-3", "yesil"),
  kurslar: s("doseme", "mavi"),
  rehber: s("rota", "yesil"),
  kutuphane: s("kutuphane", "civit"),
  sarkilar: s("yildiz", "sari"),
  oynatici: s("oynat", "pembe"),
  dogaclama: s("mikrofon", "mor"),
  araclar: s("gosterge", "gri"),
  metronom: s("metronom", "turuncu"),
  "nota-testi": s("hedef", "mavi"),
  "sap-gezgini": s("izgara", "camgobegi"),
  akort: s("gosterge", "yesil"),
  caged: s("izgara", "camgobegi"),
  profil: s("kisi", "gri"),
  marka: s("sekiller", "gri"),
  "muzik-bilgisi": s("nota", "civit"),
  ipucu: s("ampul", "sari"),
  // Profil özet kutuları
  seri: s("alev", "turuncu"),
  kalkan: s("kalkan", "mavi"),
  gorev: s("liste", "yesil"),
  puan: s("kupa", "sari"),
  // Seviye Yolu eksenleri
  technique: s("gitar", "kirmizi"),
  fretboard: s("izgara", "camgobegi"),
  rhythm: s("davul", "turuncu"),
  theory_ear: s("kulak", "mor"),
} satisfies Record<string, SimgeTanim>;
export type YerAdi = keyof typeof YER;
export const yerSimgesi = (ad: YerAdi): SimgeTanim => YER[ad];

/** Seviye simgeleri: dolan beş basamak, yeşilden mora */
const SEVIYE_RENK: SimgeRengi[] = ["yesil", "nane", "mavi", "civit", "mor"];
export function seviyeSimgesi(seviye: string | number): SimgeTanim {
  const n = Math.min(5, Math.max(1, typeof seviye === "number" ? seviye : Number(seviye.replace(/\D/g, "")) || 1));
  return s(`seviye-${n as 1 | 2 | 3 | 4 | 5}`, SEVIYE_RENK[n - 1]);
}

// ── Kütüphane ve eşlik türleri ───────────────────────────────────────────────
const TUR: Record<string, SimgeTanim> = {
  Blues: s("nota-uclu", "mavi"),
  Rock: s("gitar", "kirmizi"),
  Funk: s("nabiz", "mor"),
  Metal: s("kurukafa", "gri"),
  Pop: s("isilti", "pembe"),
  Caz: s("piyano", "civit"),
  "Bossa Nova": s("palmiye", "nane"),
  Reggae: s("gunes", "yesil"),
  Country: s("basak", "sari"),
  Fingerstyle: s("parmak-izi", "kahve"),
  "Türk Halk Müziği": s("dag", "turuncu"),
  Klasik: s("anit", "kahve"),
  Groove: s("davul", "camgobegi"),
};
/** Müzik türünün simgesi (Şarkı Kütüphanesi, doğaçlama eşlikleri) */
export const turSimgesi = (tur: string): SimgeTanim => TUR[tur] ?? s("nota", renkSec(`tur:${tur}`));

// ── Madalyalar, rozetler, başarımlar ─────────────────────────────────────────
const MADALYA: Record<string, SimgeTanim> = {
  Bronz: s("madalya", "kahve"),
  Gümüş: s("madalya", "gri"),
  Altın: s("madalya", "sari"),
  Platin: s("odul", "camgobegi"),
  Elmas: s("elmas", "mavi"),
  Usta: s("tac", "mor"),
};
export const madalyaSimgesi = (metal: string): SimgeTanim => MADALYA[metal] ?? s("madalya", "gri");

const ROZET: Record<string, SimgeTanim> = {
  "ilk-adim": s("ayak-izi", "yesil"),
  "uc-gun": s("alev", "turuncu"),
  "yedi-gun": s("takvim", "kirmizi"),
  "bir-saat": s("saat", "mavi"),
  "on-saat": s("halter", "civit"),
  "on-egzersiz": s("onay", "yesil"),
  "teknik-ustasi": s("odul", "sari"),
  hizli: s("simsek", "pembe"),
  kulak: s("hedef", "camgobegi"),
};
/** Profil rozeti (lib/ranks.ts): rozet kimliğine göre */
export const rozetSimgesi = (id: string): SimgeTanim => ROZET[id] ?? s("odul", renkSec(`rozet:${id}`));

/** Başarım (içerik paketindeki oyun.json): ölçüsüne göre */
const BASARIM: Record<string, SimgeTanim> = {
  streak_days: s("alev", "turuncu"),
  night_practice: s("ay", "civit"),
  morning_practice: s("gun-dogumu", "sari"),
  daily_practice_minutes: s("kronometre", "mavi"),
  first_lesson: s("ayak-izi", "yesil"),
  pathways_with_lessons: s("sekiller", "mor"),
  completed_sections: s("liste", "yesil"),
  techniques_with_completed_section: s("karistir", "camgobegi"),
  pathways_completed: s("mezuniyet", "civit"),
  bronze_count: MADALYA.Bronz,
  silver_count: MADALYA.Gümüş,
  gold_count: MADALYA.Altın,
  platinum_count: MADALYA.Platin,
  diamond_count: MADALYA.Elmas,
  master_count: MADALYA.Usta,
  account_exists: s("isilti", "pembe"),
  account_age_days: s("takvim", "kirmizi"),
  distinct_saved_tabs: s("nota-kagidi", "nane"),
};
export const basarimSimgesi = (olcu: string): SimgeTanim => BASARIM[olcu] ?? s("kupa", "sari");

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
