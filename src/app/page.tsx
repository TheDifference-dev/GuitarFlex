import AnaSayfa, { type Kategori, type OneCikanSarki } from "@/components/site/AnaSayfa";
import { assetUrl, getCourses } from "@/lib/courses";
import { kursAnahatti, kursKarti } from "@/lib/katalog";
import { getLibrary } from "@/lib/kutuphane";
import { getOyun } from "@/lib/oyun-veri";
import { getPopularSongs } from "@/lib/songs";
import { YOLLAR } from "@/lib/yollar";

/** Öne çıkan kurslar: başlangıç rehberleri, akor yolu ve yeni eklenen kurslar (pakette yoksa atlanır) */
const ONE_CIKAN = ["sifirdan-baslangic-rehberi", "baslangic-orta-rehberi", "akustik-baslangic-rehberi", "akor-yolu", "hybrid-picking", "gf-stiller"];

export default async function Home() {
  const [courses, library, songs, oyun] = await Promise.all([getCourses(), getLibrary(), getPopularSongs(), getOyun()]);
  const kartlar = courses.map((c) => kursKarti(c, assetUrl(c.image)));
  const say = (aile: string) => kartlar.filter((k) => k.aile === aile);
  const dersSay = (ks: typeof kartlar) => ks.reduce((n, k) => n + k.ders, 0);
  const elektro = say("elektro");
  const akustik = say("akustik");
  const kategoriler: Kategori[] = [
    { href: "/elektro", ad: "Elektro Gitar", metin: "Başlangıç rehberleri, akor yolu ve teknik kursları.", sayi: `${elektro.length} kurs · ${dersSay(elektro)} ders`, ikon: "elektro" },
    { href: "/akustik", ad: "Akustik Gitar", metin: "Akustik rehber, akorlar ve akustik teknikler.", sayi: `${akustik.length} kurs · ${dersSay(akustik)} ders`, ikon: "akustik" },
    { href: "/sarkilar", ad: "Şarkı ve Sololar", metin: "Popüler şarkılar, tabla keşfet ve doğaçlama çal.", sayi: `${songs.length} şarkı`, ikon: "sarki" },
    { href: "/kutuphane", ad: "Şarkı Kütüphanesi", metin: "Çok track'li özgün parçalar ve düzenlemeler, mikserle.", sayi: `${library.length} parça`, ikon: "kutuphane" },
    { href: "/teori", ad: "Müzik Teorisi", metin: "Armoni dersleri, ritim, klavye ve kulak eğitimi yolları.", sayi: `${YOLLAR.length} pratik yolu`, ikon: "teori" },
    { href: "/seviye", ad: "Seviye Yolu", metin: "Kursları beş seviyede birlikte çalış; kilit yok.", sayi: "5 seviye", ikon: "seviye" },
  ];
  // Kütüphaneden kolaydan zora birkaç parça
  const sarkilar: OneCikanSarki[] = [...library]
    .sort((a, b) => a.level.localeCompare(b.level))
    .slice(0, 4)
    .map((s) => ({ slug: s.slug, title: s.title, genre: s.genre, bpm: s.bpm, key: s.key }));
  return (
    <AnaSayfa
      kartlar={kartlar}
      anahatlar={courses.map(kursAnahatti)}
      kategoriler={kategoriler}
      oneCikan={ONE_CIKAN}
      sarkilar={sarkilar}
      oyun={oyun}
    />
  );
}
