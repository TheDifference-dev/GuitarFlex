// Müzik Teorisi müfredatı: bütün teori dersleri BAŞLANGIÇTAN İLERİYE tek sırada (5 seviye, üniteler), ayrıca bu sıranın
// iki kitabı: Armoni (üniteler, ünite sonu sınavları ve sapta çalınacak örnekler) ve Nota Okuma (11 konu, her konuda
// A4 ders + Okuma yolu alıştırmaları). Önce/Sonra bağları bu sıradan hesaplanır. Hafif dosya: yalnız slug ve başlık
// (istemcide de kullanılır); başlıkların derslerle aynı olduğunu scripts/teori-dogrula.mjs denetler.

export type MufredatDers = { slug: string; baslik: string };
export type Unite = { ad: string; dersler: MufredatDers[]; pratik?: { href: string; ad: string }[] };
export type Seviye = { no: number; ad: string; alt: string; uniteler: Unite[] };

const d = (slug: string, baslik: string): MufredatDers => ({ slug, baslik });

export const SEVIYELER: Seviye[] = [
  {
    no: 1,
    ad: "Başlangıç",
    alt: "Sesler, sap, gitar yazıları ve ritmin temeli.",
    uniteler: [
      {
        ad: "Sesler ve Notalar",
        dersler: [d("notalar", "12 Nota ve Oktav"), d("tiz-pes-oktav", "Tiz, Pes ve Oktav"), d("kulak-egitimi-nedir", "Kulak Eğitimi Nedir?"), d("alistirma-tipleri", "Kulak Alıştırması Tipleri")],
        pratik: [{ href: "/teori/yol/kulak", ad: "Kulak Eğitimi · Bölüm 1" }],
      },
      {
        ad: "Gitarın Sapı",
        dersler: [d("klavye-anatomisi", "Klavye Anatomisi"), d("sapta-notalar", "Sap Üzerinde Notaları Bulmak"), d("notalar-ve-oktavlar", "Notalar ve Oktavlar"), d("klavye-kesfi", "Klavye Keşfi")],
        pratik: [{ href: "/teori/yol/klavye", ad: "Klavye Görselleştirme · Bölüm 1–3" }],
      },
      {
        ad: "Gitar Yazıları",
        dersler: [d("tab-okuma", "Tab Okuma"), d("akor-diyagramlari", "Akor Diyagramları"), d("porte-sol-anahtari", "Porte ve Sol Anahtarı")],
        pratik: [{ href: "/teori/nota-okuma#konu-2", ad: "Nota Okuma · Porte" }],
      },
      {
        ad: "Ritim Temelleri",
        dersler: [d("ritim-temelleri", "Ritim, Ölçü ve Tempo"), d("vurus-tempo", "Vuruş ve Tempo"), d("nota-sureleri", "Nota Süreleri"), d("tab-sureler", "Tab Üzerinde Süreler"), d("olcu-tartim", "Ölçü ve Tartım")],
        pratik: [{ href: "/teori/yol/ritim", ad: "Ritim · Bölüm 1–2" }],
      },
    ],
  },
  {
    no: 2,
    ad: "Temel",
    alt: "Nota okumanın ilk yılı, aralıklar, gamlar, akorlar ve pentatonik.",
    uniteler: [
      {
        ad: "Nota Okuma: Süreler ve Arızalar",
        dersler: [d("noktali-bagli", "Noktalı ve Bağlı Notalar"), d("ucleme", "Üçlemeler"), d("arizalar-donanim", "Arızalar ve Donanım"), d("gitarda-porte", "Gitarda Porte")],
        pratik: [{ href: "/teori/nota-okuma", ad: "Nota Okuma · Konu 5–8" }],
      },
      {
        ad: "Aralıklar ve Gamlar",
        dersler: [d("araliklar", "Aralıklar"), d("klavye-araliklar", "Sapta Aralık Şekilleri"), d("kulak-araliklar", "Aralıkları Kulaktan Tanımak"), d("major-gam", "Majör Gam"), d("minor-gam", "Doğal Minör ve Paralel Ton")],
        pratik: [{ href: "/teori/armoni#unite-1", ad: "Armoni · Ünite 1 sınavı" }],
      },
      {
        ad: "Akorlar",
        dersler: [d("akor-yapisi", "Akorlar Nasıl Oluşur?"), d("akor-turleri", "Akor Türlerini Kulaktan Tanımak"), d("caged-sistemi", "CAGED Sistemi")],
        pratik: [{ href: "/teori/armoni#unite-2", ad: "Armoni · Ünite 2 sınavı" }],
      },
      {
        ad: "Pentatonik ve Blues",
        dersler: [d("pentatonik-blues", "Pentatonik ve Blues Gamı"), d("pentatonik-sekiller", "Pentatonik Şekiller")],
        pratik: [{ href: "/sap-gezgini?gam=minor-penta&kok=A", ad: "Sap Gezgini · 5 kutu" }],
      },
    ],
  },
  {
    no: 3,
    ad: "Orta",
    alt: "Tonun akorları ve işlevleri, yedili akorlar, modlar ve pozisyon okuma.",
    uniteler: [
      {
        ad: "Diyatonik Armoni",
        dersler: [d("diatonik-akorlar", "Diatonik Akorlar ve Dereceler"), d("islevler-kadanslar", "İşlevler ve Kadanslar"), d("ilerlemeler", "Akor İlerlemeleri"), d("akor-ilerlemeleri", "Akor İlerlemelerini Duymak"), d("yedili-akorlar", "Yedili Akorlar")],
        pratik: [{ href: "/teori/armoni#unite-3", ad: "Armoni · Ünite 3–4 sınavları" }],
      },
      {
        ad: "Modlar",
        dersler: [d("modlar", "Modlar"), d("gam-aileleri", "Gam Aileleri")],
        pratik: [
          { href: "/teori/armoni#unite-5", ad: "Armoni · Modlar sınavı" },
          { href: "/sap-gezgini?gam=dorian&kok=A", ad: "Sap Gezgini · modlar" },
        ],
      },
      {
        ad: "Nota Okuma: Pozisyon, Senkop ve Şema",
        dersler: [d("pozisyonlar", "Pozisyonlarda Okuma"), d("ritim-sayimi", "Ritim Sayımı"), d("vurgular-senkop", "Vurgular ve Senkop"), d("akor-semasi", "Akor Şeması"), d("tekrar-yonlendirme", "Tekrar ve Yönlendirme")],
        pratik: [{ href: "/teori/nota-okuma", ad: "Nota Okuma · Konu 8–10" }],
      },
    ],
  },
  {
    no: 4,
    ad: "İleri",
    alt: "Tonun dışından gelen akorlar, gerilimler, minör gam aileleri ve ileri okuma.",
    uniteler: [
      {
        ad: "Kromatik Armoni",
        dersler: [d("ikincil-dominantlar", "İkincil Dominantlar"), d("ii-v-i", "ii–V–I"), d("gerilimler", "Gerilimler: 9, 11, 13")],
        pratik: [{ href: "/teori/armoni#unite-6", ad: "Armoni · Ünite 6–7 sınavları" }],
      },
      {
        ad: "Minör Gam Aileleri",
        dersler: [d("minor-aileleri", "Armonik ve Melodik Minör")],
        pratik: [{ href: "/sap-gezgini?gam=melodic-minor&kok=A", ad: "Sap Gezgini · minör aileleri" }],
      },
      {
        ad: "Nota Okuma: İleri",
        dersler: [d("ileri-okuma", "İleri Okuma: Çoklu Ses, Süsleme ve İşaretler")],
        pratik: [{ href: "/teori/nota-okuma#konu-11", ad: "Nota Okuma · Konu 11" }],
      },
    ],
  },
  {
    no: 5,
    ad: "Uzman",
    alt: "Modal karışım ve her akora doğru gamı seçmek.",
    uniteler: [
      {
        ad: "Renk ve Seçim",
        dersler: [d("odunc-akorlar", "Ödünç Akorlar ve Modal Karışım"), d("akor-gam", "Akor-Gam Eşleme")],
        pratik: [{ href: "/teori/armoni#unite-8", ad: "Armoni · Ünite 8 sınavı" }],
      },
    ],
  },
];

/** Bütün dersler, müfredat sırasıyla */
export const SIRA: MufredatDers[] = SEVIYELER.flatMap((s) => s.uniteler.flatMap((u) => u.dersler));

/** Dersin seviyesi ve ünitesi */
export function dersYeri(slug: string): { seviye: Seviye; unite: Unite } | undefined {
  for (const seviye of SEVIYELER) for (const unite of seviye.uniteler) if (unite.dersler.some((x) => x.slug === slug)) return { seviye, unite };
  return undefined;
}

/** Önce / Sonra bağları (müfredat sırasında komşu dersler) */
export function dersBagi(slug: string) {
  const i = SIRA.findIndex((x) => x.slug === slug);
  if (i < 0) return undefined;
  const yer = dersYeri(slug)!;
  const bag = (x?: MufredatDers) => (x ? { href: `/teori/${x.slug}`, baslik: x.baslik } : undefined);
  return { once: bag(SIRA[i - 1]), sonra: bag(SIRA[i + 1]), yer: `Seviye ${yer.seviye.no} · ${yer.unite.ad}` };
}

// ── Armoni kitabı ─────────────────────────────────────────────────────────────
// GuitarBear'deki Armoni yapısı (5 bölüm, 11 pratik kartı) korunur: her pratik kartı bir ünitenin sınavında, Ek
// İnceleme kartları "Sapta çal" bölümünde. Bölümler pedagojik sıraya dizildi: diyatonik armoni ve yedili akorlar
// modlardan önce; ek bölümler (E1–E7) kendi ünitelerinde.
export type ArmoniUnite = {
  no: number;
  ad: string;
  /** GuitarBear Armoni bölümü (varsa) */
  gb?: string;
  ozet: string;
  dersler: string[];
  /** Sınav: armoni yolunun adım kodları (yalnız armoni ve müzik teorisi soruları) */
  sinav: string[];
  /** Sapta çal: armoni kursunun Ek İnceleme kartları (alt bölüm kodları) */
  cal: string[];
};

export const ARMONI_UNITELERI: ArmoniUnite[] = [
  { no: 1, ad: "Temel Kavramlar", gb: "Bölüm 1", ozet: "Notalar, yarım ve tam ses, aralıklar, majör ve minör gam.", dersler: ["notalar", "araliklar", "major-gam", "minor-gam"], sinav: ["1.1", "1.2"], cal: ["1.1", "1.2"] },
  { no: 2, ad: "Akorlar", gb: "Bölüm 2", ozet: "Çok seslilik, 5'li akor ve dört tür üç sesli akor.", dersler: ["akor-yapisi"], sinav: ["2.1", "2.2"], cal: ["2.1", "2.2"] },
  { no: 3, ad: "Diyatonik Armoni", gb: "Bölüm 4", ozet: "Tonun yedi akoru, T–S–D işlevleri, kadanslar ve akor ilerlemeleri.", dersler: ["diatonik-akorlar", "islevler-kadanslar", "ilerlemeler"], sinav: ["4.1", "4.2", "E4.1", "E4.2", "E4.3"], cal: ["4.1", "4.2"] },
  { no: 4, ad: "Yedili Akorlar", gb: "Bölüm 5", ozet: "Dört sesli akorlar, tonun yedili akorları ve dominant 7.", dersler: ["yedili-akorlar"], sinav: ["5.1-1", "5.1-2"], cal: [] },
  { no: 5, ad: "Modlar", gb: "Bölüm 3", ozet: "Majör gamın yedi modu: formül, karakter notası, parlaklık, sapta üç pozisyon ve eşlik.", dersler: ["modlar"], sinav: ["3.1", "3.2", "3.3"], cal: ["3.1", "3.2", "3.3"] },
  { no: 6, ad: "İkincil Dominantlar ve ii–V–I", ozet: "Tonun her akoruna kendi dominantı ve cazın temel kadansı.", dersler: ["ikincil-dominantlar", "ii-v-i"], sinav: ["E1.1", "E1.2", "E1.3", "E1.4", "E2.1", "E2.2", "E2.3", "E2.4"], cal: [] },
  { no: 7, ad: "Gerilimler ve Minör Gam Aileleri", ozet: "9, 11, 13 gerilimleri; armonik ve melodik minör ile modları.", dersler: ["gerilimler", "minor-aileleri"], sinav: ["E6.1", "E6.2", "E6.3", "E7.1", "E7.2", "E7.3"], cal: [] },
  { no: 8, ad: "Ödünç Akorlar ve Akor-Gam", ozet: "Paralel minörden akor ödünç almak ve her akora uygun gamı seçmek.", dersler: ["odunc-akorlar", "akor-gam"], sinav: ["E5.1", "E5.2", "E5.3", "E3.1", "E3.2", "E3.3", "E3.4"], cal: [] },
];

// ── Nota Okuma kitabı ────────────────────────────────────────────────────────
export type OkumaKonu = { no: number; ad: string; ozet: string; dersler: string[]; /** Okuma yolunun bölüm numaraları */ bolumler: number[] };

export const OKUMA_KONULARI: OkumaKonu[] = [
  { no: 1, ad: "Nota Adları", ozet: "Yedi doğal nota, harf ve solfej adları, yarım ve tam ses, diyez ve bemol.", dersler: ["notalar"], bolumler: [1] },
  { no: 2, ad: "Porte ve Sol Anahtarı", ozet: "Beş çizgi, dört aralık, sol anahtarı ve ek çizgiler.", dersler: ["porte-sol-anahtari"], bolumler: [2] },
  { no: 3, ad: "Nota Değerleri ve Sus İşaretleri", ozet: "Birlikten onaltılığa değerler, eşit süreli suslar; tabda süreler.", dersler: ["nota-sureleri", "tab-sureler"], bolumler: [3, 4] },
  { no: 4, ad: "Ölçü ve Tartım", ozet: "Ölçü işareti, güçlü ve zayıf vuruşlar; basit, bileşik ve aksak ölçü.", dersler: ["olcu-tartim"], bolumler: [5] },
  { no: 5, ad: "Noktalı ve Bağlı Notalar", ozet: "Nokta, çift nokta ve bağ; ölçü çizgisini aşan süreler.", dersler: ["noktali-bagli"], bolumler: [6] },
  { no: 6, ad: "Üçlemeler", ozet: "Vuruşu üçe bölmek: sekizlik, dörtlük ve onaltılık üçleme; shuffle yazımı.", dersler: ["ucleme"], bolumler: [7] },
  { no: 7, ad: "Arızalar ve Donanım", ozet: "Diyez, bemol, natürel; ölçü kuralı; donanım sırası ve ton bulma.", dersler: ["arizalar-donanim"], bolumler: [8] },
  { no: 8, ad: "Gitarda Porte ve Pozisyonlar", ozet: "Gitarın bir oktav pes duyulması, açık pozisyon, 5. ve 7. pozisyon.", dersler: ["gitarda-porte", "pozisyonlar"], bolumler: [9, 10] },
  { no: 9, ad: "Onaltılıklar ve Senkop", ozet: "Onaltılık sayımı, noktalı sekizlik, vuruş arası ve senkop.", dersler: ["ritim-sayimi", "vurgular-senkop"], bolumler: [11, 12] },
  { no: 10, ad: "Akor Şeması, Tekrar ve Yönlendirme", ozet: "Slash notasyonu, tekrar, volta, D.S. al Fine ve al Coda.", dersler: ["akor-semasi", "tekrar-yonlendirme"], bolumler: [13] },
  { no: 11, ad: "İleri Okuma", ozet: "Çoklu ses, artikülasyon ve dinamik, süslemeler, gitara özgü işaretler.", dersler: ["ileri-okuma"], bolumler: [14] },
];
