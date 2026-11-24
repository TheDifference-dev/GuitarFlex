import type { Metadata } from "next";
import Katalog, { type YolKarti } from "@/components/site/Katalog";
import { Bant, HapBag, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import { getCourses } from "@/lib/courses";
import { kursKarti } from "@/lib/katalog";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import UygulamaSimgesi from "@/components/site/UygulamaSimgesi";
import { kursSimgesi, yerSimgesi } from "@/lib/simge";
import { getYol, YOLLAR, yolSayim } from "@/lib/yollar";

export const metadata: Metadata = { title: "Tüm Kurslar" };

/** Kurs kataloğu: Günlük Rutin kartı, akorlar ve ısınma, elektro teknikler, ek kurslar, müzik teorisi ve pratik yolları (arşivdekiler yok) */
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
        alt={`${kartlar.length} kurs, ${ders} ders. Hiçbiri kilitli değil: günlük rutinle ısın, sonra istediğin tekniğe doğrudan geç.`}
      >
        <HapBag href="/rutin">Günlük Rutin</HapBag>
        <HapBag href="/nasil-calismaliyim" ikincil>
          Seviyenizi Bulun
        </HapBag>
        <MetinBag href="/seviye" buyuk>
          Seviye Yolu
        </MetinBag>
      </SayfaBasi>
      <Bant ton="gri" className="pt-12">
        <Link href="/rutin" data-renk={kursSimgesi("gunluk-rutin").renk} className="card renkli-kart yukselen mb-8 flex items-center gap-4 p-4 pt-5" data-rutin-karti>
          <UygulamaSimgesi simge={kursSimgesi("gunluk-rutin")} boyut={44} />
          <span className="min-w-0 flex-1">
            <span className="eyebrow">Her gün · 10–15 dk</span>
            <span className="block text-lg font-semibold">Günlük Rutin</span>
            <span className="block text-sm text-muted">Üç farklı ısınma (A, B, C) zamanlayıcıyla; sonra 20 dk teknik ve bir şarkı. Hepsi metronomla.</span>
          </span>
          <ArrowRight size={18} className="shrink-0 text-accent" />
        </Link>
        <Katalog kartlar={kartlar} yollar={yollar} />
      </Bant>
    </div>
  );
}
