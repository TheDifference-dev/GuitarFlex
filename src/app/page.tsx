import AnaSayfa, { type Doseme, type OneCikanSarki, type SeviyeBasamagi, type TeoriYolu } from "@/components/site/AnaSayfa";
import { BACKINGS } from "@/content/dogaclama";
import { LEVELS, SEVIYE } from "@/content/seviyeler";
import { assetUrl, getCourses } from "@/lib/courses";
import { kursAnahatti, kursKarti } from "@/lib/katalog";
import { getLibrary } from "@/lib/kutuphane";
import { getOyun } from "@/lib/oyun-veri";
import { getYol, YOLLAR } from "@/lib/yollar";

/** Öne çıkan kurslar: başlangıç rehberleri, akor yolu ve yeni eklenen kurslar (pakette yoksa atlanır) */
const ONE_CIKAN = ["sifirdan-baslangic-rehberi", "baslangic-orta-rehberi", "akustik-baslangic-rehberi", "akor-yolu", "hybrid-picking", "gf-stiller"];

export default async function Home() {
  const [courses, library, oyun] = await Promise.all([getCourses(), getLibrary(), getOyun()]);
  const kartlar = courses.map((c) => kursKarti(c, assetUrl(c.image)));
  const kart = (slug: string) => kartlar.find((k) => k.slug === slug);
  const aile = (a: string) => kartlar.filter((k) => k.aile === a);
  const dersSay = (ks: typeof kartlar) => ks.reduce((n, k) => n + k.ders, 0);
  const elektro = aile("elektro");
  const akustik = aile("akustik");
  const stiller = kart("gf-stiller");
  const ekler = kart("gf-ekler");

  // Ana sayfanın altındaki iki sütunlu döşemeler
  const dosemeler: Doseme[] = [
    {
      baslik: "Elektro Gitar",
      metin: "Başlangıç rehberleri, akor yolu ve teknik kursları.",
      not: `${elektro.length} kurs · ${dersSay(elektro)} ders`,
      ikon: "elektro",
      baglar: [
        { href: "/elektro", label: "Başla" },
        { href: "/seviye", label: "Seviye Yolu" },
      ],
    },
    {
      baslik: "Akustik Gitar",
      metin: "Duruş, ilk akorlar, geçişler ve akustik teknikler.",
      not: `${akustik.length} kurs · ${dersSay(akustik)} ders`,
      ikon: "akustik",
      baglar: [
        { href: "/akustik", label: "Başla" },
        { href: "/akustik/sarkilar", label: "Şarkılar" },
      ],
    },
    {
      baslik: "Stiller",
      metin: stiller?.description ?? "Blues, rock, funk, metal ve cazın ritim hissi ve cümle dili.",
      not: stiller ? `${stiller.bolum} bölüm · ${stiller.ders} ders` : undefined,
      ikon: "stil",
      baglar: [{ href: stiller ? "/calis/gf-stiller" : "/kurslar", label: "Stillere başla" }],
    },
    {
      baslik: "Müzisyenlik",
      metin: ekler?.description ?? "Okuma, eşlikle çalma, ritim hissi ve ton.",
      not: ekler ? `${ekler.bolum} bölüm · ${ekler.ders} ders` : undefined,
      ikon: "muzisyen",
      baglar: [{ href: ekler ? "/calis/gf-ekler" : "/kurslar", label: "Müzisyenliğe başla" }],
    },
    {
      baslik: "Doğaçlama",
      metin: "Davul, bas ve ritim gitarı eşliğinde önerilen gamlarla solo çal.",
      not: `${BACKINGS.length} eşlik kaydı`,
      ikon: "dogaclama",
      baglar: [
        { href: "/sarkilar/dogaclama", label: "Eşlik seç" },
        { href: "/oynatici", label: "Tabla keşfet" },
      ],
    },
    {
      baslik: "Araçlar",
      metin: "Metronom ve nota bulma testiyle her gün birkaç dakika.",
      ikon: "araclar",
      baglar: [
        { href: "/araclar#metronom", label: "Metronom" },
        { href: "/araclar#nota-testi", label: "Nota testi" },
      ],
    },
  ];

  const seviyeler: SeviyeBasamagi[] = LEVELS.map((l) => ({ level: l, ad: SEVIYE[l].ad, etut: SEVIYE[l].etut }));
  const yollar: TeoriYolu[] = (
    await Promise.all(
      YOLLAR.map(async (y): Promise<TeoriYolu | null> => {
        const yol = await getYol(y.slug);
        return yol ? { href: `/teori/yol/${y.slug}`, ad: y.ad, etiket: y.etiket, not: `${yol.bolumler.length} bölüm · ${yol.adimlar.length} adım` } : null;
      }),
    )
  ).filter((y): y is TeoriYolu => !!y);

  // Kütüphaneden kolaydan zora birkaç parça
  const sarkilar: OneCikanSarki[] = [...library]
    .sort((a, b) => a.level.localeCompare(b.level))
    .slice(0, 4)
    .map((s) => ({ slug: s.slug, title: s.title, genre: s.genre, bpm: s.bpm, key: s.key }));

  return (
    <AnaSayfa
      kartlar={kartlar}
      anahatlar={courses.map(kursAnahatti)}
      dosemeler={dosemeler}
      oneCikan={ONE_CIKAN}
      sarkilar={sarkilar}
      sarkiSayisi={library.length}
      seviyeler={seviyeler}
      yollar={yollar}
      armoni={!!kart("armoni")}
      sifirdan={!!kart("sifirdan-baslangic-rehberi")}
      oyun={oyun}
    />
  );
}
