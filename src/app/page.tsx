import AnaSayfa, { type RehberSarki, type SeviyeBasamagi, type TeoriYolu } from "@/components/site/AnaSayfa";
import { BACKINGS } from "@/content/dogaclama";
import { LEVELS, SEVIYE } from "@/content/seviyeler";
import { getCourses } from "@/lib/courses";
import { kursAnahatti, kursKarti } from "@/lib/katalog";
import { getOyun } from "@/lib/oyun-veri";
import { kisaAd, kursSimgesi, yolSimgesi } from "@/lib/simge";
import { getPopularSongs } from "@/lib/songs";
import { songUrl } from "@/content/sarkilar";
import { getYol, YOLLAR, yolSayim } from "@/lib/yollar";
import type { IzgaraOgesi } from "@/components/site/SimgeIzgarasi";

export default async function Home() {
  const [courses, oyun, sarkilar] = await Promise.all([getCourses(), getOyun(), getPopularSongs()]);
  const kartlar = courses.map((c) => kursKarti(c));
  const aile = (a: string) => kartlar.filter((k) => k.aile === a);
  const dersSay = (ks: typeof kartlar) => ks.reduce((n, k) => n + k.ders, 0);
  const elektro = aile("elektro");
  const akustik = aile("akustik");

  const seviyeler: SeviyeBasamagi[] = LEVELS.map((l) => ({ level: l, ad: SEVIYE[l].ad, etut: SEVIYE[l].etut }));
  const yollar: TeoriYolu[] = (
    await Promise.all(
      YOLLAR.map(async (y): Promise<TeoriYolu | null> => {
        const yol = await getYol(y.slug);
        return yol ? { slug: y.slug, href: y.href, ad: y.ad, etiket: y.etiket, not: yolSayim(yol) } : null;
      }),
    )
  ).filter((y): y is TeoriYolu => !!y);

  // Rehber Şarkılar önizlemesi: Şarkı Rehberi'nin (GuitarBear sırası) ilk adımları; rehber yoksa listenin kolay şarkıları
  const rehberli = sarkilar.filter((s) => s.rehber).sort((a, b) => a.rehber!.adim - b.rehber!.adim);
  const rehber: RehberSarki[] = (rehberli.length ? rehberli : sarkilar).slice(0, 4).map((s, i) => {
    const kurs = s.rehber?.bolumler[0]?.kurs ?? s.courses?.[0];
    return {
      adim: s.rehber?.adim ?? i + 1,
      title: s.title,
      artist: s.artist,
      kind: s.kind,
      madalya: s.madalya,
      url: songUrl(s),
      renk: kursSimgesi(kurs ?? "").renk,
    };
  });

  // Kurs simgeleri (ana ekran gibi): Günlük Rutin, görünen kurslar ve teori yolları, her biri kendi renginde
  const izgara: IzgaraOgesi[] = [
    { href: "/rutin", ad: "Günlük Rutin", simge: kursSimgesi("gunluk-rutin") },
    ...kartlar.filter((k) => !k.status).map((k) => ({ href: `/calis/${k.slug}`, ad: kisaAd(k.slug, k.title), simge: kursSimgesi(k.slug) })),
    ...yollar.map((y) => ({ href: y.href, ad: kisaAd(`yol:${y.slug}`, y.ad), simge: yolSimgesi(y.slug) })),
  ];

  return (
    <AnaSayfa
      izgara={izgara}
      kartlar={kartlar}
      anahatlar={courses.map(kursAnahatti)}
      seviyeler={seviyeler}
      yollar={yollar}
      rehber={rehber}
      rehberSayisi={rehberli.length}
      sayilar={{ elektroKurs: elektro.length, elektroDers: dersSay(elektro), akustikKurs: akustik.length, akustikDers: dersSay(akustik), eslik: BACKINGS.length }}
      sifirdan={kartlar.some((k) => k.slug === "sifirdan-baslangic-rehberi")}
      oyun={oyun}
    />
  );
}
