import AnaSayfa, { type Doseme, type OneCikanSarki, type SeviyeBasamagi, type TeoriYolu } from "@/components/site/AnaSayfa";
import { BACKINGS } from "@/content/dogaclama";
import { LEVELS, SEVIYE } from "@/content/seviyeler";
import { getCourses } from "@/lib/courses";
import { kursAnahatti, kursKarti } from "@/lib/katalog";
import { getLibrary } from "@/lib/kutuphane";
import { getOyun } from "@/lib/oyun-veri";
import { kisaAd, kursSimgesi, yerSimgesi, yolSimgesi } from "@/lib/simge";
import { getYol, YOLLAR, yolSayim } from "@/lib/yollar";
import type { IzgaraOgesi } from "@/components/site/SimgeIzgarasi";

/** Öne çıkan kurslar: başlangıç rehberleri, akor yolu ve yeni eklenen kurslar (pakette yoksa atlanır) */
const ONE_CIKAN = ["sifirdan-baslangic-rehberi", "baslangic-orta-rehberi", "akustik-baslangic-rehberi", "akor-yolu", "hybrid-picking", "gf-stiller"];

export default async function Home() {
  const [courses, library, oyun] = await Promise.all([getCourses(), getLibrary(), getOyun()]);
  const kartlar = courses.map((c) => kursKarti(c));
  const kart = (slug: string) => kartlar.find((k) => k.slug === slug);
  const aile = (a: string) => kartlar.filter((k) => k.aile === a);
  const dersSay = (ks: typeof kartlar) => ks.reduce((n, k) => n + k.ders, 0);
  const elektro = aile("elektro");
  const akustik = aile("akustik");
  const stiller = kart("gf-stiller");
  const ekler = kart("gf-ekler");

  const klavye = YOLLAR.some((y) => y.slug === "klavye");

  // Ana sayfanın altındaki iki sütunlu döşemeler (apple.com gibi siyah / açık gri, satır satır çapraz)
  const dosemeler: Doseme[] = [
    {
      baslik: "Teoriyi sapta gör.",
      metin: "Ritim, klavye, kulak ve okuma: kısa adımlarla ilerleyen pratik yolları.",
      simge: yerSimgesi("teori"),
      ton: "koyu",
      gorsel: "yollar",
      baglar: [
        { href: "/teori", label: "Daha Fazla Bilgi" },
        { href: kart("armoni") ? "/calis/armoni" : "/teori#dersler", label: "Armoni Dersleri" },
      ],
    },
    {
      baslik: "Elektro Gitar",
      metin: "Başlangıç rehberleri, akor yolu ve teknik kursları.",
      not: `${elektro.length} kurs · ${dersSay(elektro)} ders`,
      simge: yerSimgesi("elektro"),
      ton: "gri",
      baglar: [
        { href: "/elektro", label: "Başlayın" },
        { href: "/seviye", label: "Seviye Yolu" },
      ],
    },
    {
      baslik: "Akustik Gitar",
      metin: "Duruş, ilk akorlar, geçişler ve akustik teknikler.",
      not: `${akustik.length} kurs · ${dersSay(akustik)} ders`,
      simge: yerSimgesi("akustik"),
      ton: "gri",
      baglar: [
        { href: "/akustik", label: "Başlayın" },
        { href: "/akustik/sarkilar", label: "Şarkılar" },
      ],
    },
    {
      baslik: "Stiller",
      metin: stiller?.description ?? "Blues, rock, funk, metal ve cazın ritim hissi ve cümle dili.",
      not: stiller ? `${stiller.bolum} bölüm · ${stiller.ders} ders` : undefined,
      simge: kursSimgesi("gf-stiller"),
      ton: "koyu",
      baglar: [
        { href: stiller ? "/calis/gf-stiller" : "/kurslar", label: "Başlayın" },
        { href: "/kurslar", label: "Kurs Kataloğu" },
      ],
    },
    {
      baslik: "Müzisyenlik",
      metin: ekler?.description ?? "Okuma, eşlikle çalma, ritim hissi ve ton.",
      not: ekler ? `${ekler.bolum} bölüm · ${ekler.ders} ders` : undefined,
      simge: kursSimgesi("gf-ekler"),
      ton: "koyu",
      baglar: [
        { href: ekler ? "/calis/gf-ekler" : "/kurslar", label: "Başlayın" },
        { href: "/nasil-calismaliyim", label: "Nasıl Çalışmalı?" },
      ],
    },
    {
      baslik: "Doğaçlama",
      metin: "Davul, bas ve ritim gitarı eşliğinde önerilen gamlarla solo çal.",
      not: `${BACKINGS.length} eşlik kaydı`,
      simge: yerSimgesi("dogaclama"),
      ton: "gri",
      baglar: [
        { href: "/sarkilar/dogaclama", label: "Çalın" },
        { href: "/oynatici", label: "Tabla Keşfedin" },
      ],
    },
    {
      baslik: "Araçlar",
      metin: "Metronom ve nota bulma testiyle her gün birkaç dakika.",
      simge: yerSimgesi("metronom"),
      ton: "gri",
      baglar: [
        { href: "/araclar#metronom", label: "Metronom" },
        { href: "/araclar#nota-testi", label: "Nota Testi" },
      ],
    },
    {
      baslik: "CAGED Sistemi",
      metin: "Beş açık akor şekli, tek klavye haritası. Kök notaları her yerde bul.",
      not: "Klavye Görselleştirme yolunda",
      simge: yerSimgesi("caged"),
      ton: "koyu",
      gorsel: "caged",
      baglar: [
        { href: klavye ? "/teori/yol/klavye" : "/teori", label: "Daha Fazla Bilgi" },
        { href: "/teori#sap", label: "Sap Gezgini" },
      ],
    },
  ];

  const seviyeler: SeviyeBasamagi[] = LEVELS.map((l) => ({ level: l, ad: SEVIYE[l].ad, etut: SEVIYE[l].etut }));
  const yollar: TeoriYolu[] = (
    await Promise.all(
      YOLLAR.map(async (y): Promise<TeoriYolu | null> => {
        const yol = await getYol(y.slug);
        return yol ? { slug: y.slug, href: `/teori/yol/${y.slug}`, ad: y.ad, etiket: y.etiket, not: yolSayim(yol) } : null;
      }),
    )
  ).filter((y): y is TeoriYolu => !!y);

  // Kütüphaneden kolaydan zora birkaç parça
  const sarkilar: OneCikanSarki[] = [...library]
    .sort((a, b) => a.level.localeCompare(b.level))
    .slice(0, 4)
    .map((s) => ({ slug: s.slug, title: s.title, genre: s.genre, bpm: s.bpm, key: s.key }));

  // Simge ızgarası (ana ekran gibi): bütün kurslar, teori yolları, kütüphane ve araçlar
  const izgara: IzgaraOgesi[] = [
    ...kartlar.filter((k) => !k.status).map((k) => ({ href: `/calis/${k.slug}`, ad: kisaAd(k.slug, k.title), simge: kursSimgesi(k.slug) })),
    ...yollar.map((y) => ({ href: y.href, ad: kisaAd(`yol:${y.slug}`, y.ad), simge: yolSimgesi(y.slug) })),
    { href: "/kurslar", ad: "Tüm Kurslar", simge: yerSimgesi("kurslar") },
    { href: "/seviye", ad: "Seviye Yolu", simge: yerSimgesi("seviye") },
    { href: "/kutuphane", ad: "Kütüphane", simge: yerSimgesi("kutuphane") },
    { href: "/sarkilar", ad: "Popüler Şarkılar", simge: yerSimgesi("sarkilar") },
    { href: "/sarkilar/dogaclama", ad: "Doğaçlama", simge: yerSimgesi("dogaclama") },
    { href: "/oynatici", ad: "Oynatıcı", simge: yerSimgesi("oynatici") },
    { href: "/araclar#metronom", ad: "Metronom", simge: yerSimgesi("metronom") },
    { href: "/araclar#nota-testi", ad: "Nota Testi", simge: yerSimgesi("nota-testi") },
    { href: "/teori#sap", ad: "Sap Gezgini", simge: yerSimgesi("sap-gezgini") },
  ];

  return (
    <AnaSayfa
      izgara={izgara}
      kartlar={kartlar}
      anahatlar={courses.map(kursAnahatti)}
      dosemeler={dosemeler}
      oneCikan={ONE_CIKAN}
      sarkilar={sarkilar}
      sarkiSayisi={library.length}
      seviyeler={seviyeler}
      yollar={yollar}
      sifirdan={!!kart("sifirdan-baslangic-rehberi")}
      oyun={oyun}
    />
  );
}
