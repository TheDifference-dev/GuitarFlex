import type { Metadata } from "next";
import Katalog, { type YolKarti } from "@/components/site/Katalog";
import Kirinti from "@/components/site/Kirinti";
import { assetUrl, getCourses } from "@/lib/courses";
import { kursKarti } from "@/lib/katalog";
import { getYol, YOLLAR } from "@/lib/yollar";

export const metadata: Metadata = { title: "Tüm Kurslar" };

/** Kurs kataloğu: rehberler, akor yolu, elektro ve akustik teknikler, ek kurslar, müzik teorisi ve pratik yolları */
export default async function CatalogPage() {
  const courses = await getCourses();
  const kartlar = courses.map((c) => kursKarti(c, assetUrl(c.image)));
  const yollar = (
    await Promise.all(
      YOLLAR.map(async (y): Promise<YolKarti | null> => {
        const yol = await getYol(y.slug);
        return yol ? { href: `/teori/yol/${y.slug}`, etiket: y.etiket, ad: y.ad, not: `${yol.bolumler.length} bölüm · ${yol.adimlar.length} adım` } : null;
      }),
    )
  ).filter((y): y is YolKarti => !!y);
  const ders = kartlar.reduce((n, k) => n + k.ders, 0);
  return (
    <div className="space-y-6">
      <header>
        <Kirinti halkalar={[{ label: "Tüm Kurslar" }]} />
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Tüm Kurslar</h1>
        <p className="mt-1 max-w-3xl text-muted">
          {kartlar.length} kurs, {ders} ders. Hiçbiri kilitli değil: bir rehberle sırayla ilerle ya da istediğin tekniğe doğrudan geç.
        </p>
      </header>
      <Katalog kartlar={kartlar} yollar={yollar} />
    </div>
  );
}
