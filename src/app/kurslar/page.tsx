import type { Metadata } from "next";
import Katalog, { type YolKarti } from "@/components/site/Katalog";
import { Bant, HapBag, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import { getCourses } from "@/lib/courses";
import { kursKarti } from "@/lib/katalog";
import { yerSimgesi } from "@/lib/simge";
import { getYol, YOLLAR, yolSayim } from "@/lib/yollar";

export const metadata: Metadata = { title: "Tüm Kurslar" };

/** Kurs kataloğu: günlük ısınma, akorlar, elektro teknikler, ek kurslar, müzik teorisi ve pratik yolları */
export default async function CatalogPage() {
  const courses = await getCourses();
  const kartlar = courses.map((c) => kursKarti(c));
  const yollar = (
    await Promise.all(
      YOLLAR.map(async (y): Promise<YolKarti | null> => {
        const yol = await getYol(y.slug);
        return yol ? { slug: y.slug, href: `/teori/yol/${y.slug}`, etiket: y.etiket, ad: y.ad, not: yolSayim(yol) } : null;
      }),
    )
  ).filter((y): y is YolKarti => !!y);
  const ders = kartlar.reduce((n, k) => n + k.ders, 0);
  return (
    <div>
      <SayfaBasi
        simge={yerSimgesi("kurslar")}
        kirinti={[{ label: "Tüm Kurslar" }]}
        baslik="Tüm Kurslar"
        alt={`${kartlar.length} kurs, ${ders} ders. Hiçbiri kilitli değil: bir rehberle sırayla ilerle ya da istediğin tekniğe doğrudan geç.`}
      >
        <HapBag href="/nasil-calismaliyim">Seviyenizi Bulun</HapBag>
        <MetinBag href="/seviye" buyuk>
          Seviye Yolu
        </MetinBag>
      </SayfaBasi>
      <Bant ton="gri" className="pt-12">
        <Katalog kartlar={kartlar} yollar={yollar} />
      </Bant>
    </div>
  );
}
