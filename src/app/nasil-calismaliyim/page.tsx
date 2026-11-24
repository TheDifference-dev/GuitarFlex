import type { Metadata } from "next";
import { Bant, SayfaBasi } from "@/components/site/Vitrin";
import LevelPicker, { type LevelOption } from "@/components/LevelPicker";
import { getCourses } from "@/lib/courses";

export const metadata: Metadata = { title: "Gitarda Nasıl Çalışmalıyım?" };

/** Orta ve ileri seviye elektro gitarist için çalışma yolu seçici */
export default async function HowToPracticePage() {
  const courses = await getCourses();
  const has = (slug: string) => courses.some((c) => c.slug === slug);
  const course = (slug: string, fallback: string) => (has(slug) ? `/calis/${slug}` : fallback);

  const options: LevelOption[] = [
    { seviye: 3, title: "Orta seviyedeyim", text: "Pentatonik ve temel teknikleri biliyorum; legato, economy ve 3 nota/tel kalıplarına geçmek istiyorum.", href: "/seviye/L3" },
    { seviye: 4, title: "Orta–ileri seviyedeyim", text: "Sweep, tapping, CAGED ve modlarla sapın tamamını kullanmak istiyorum.", href: "/seviye/L4" },
    { seviye: 5, title: "İleri seviyedeyim", text: "Hızımı ve ifademi geliştirmek, bölüm sınavlarını Usta kademesinde geçmek istiyorum.", href: "/seviye/L5" },
    { seviye: 2, title: "Her gün on dakika ısınmak istiyorum", text: "Üç rutin: teknik/pena, legato/sol el, solo/ifade.", href: course("gunluk-isinma", "/elektro") },
  ];

  return (
    <div>
      <SayfaBasi kirinti={[{ label: "Çalışma Planı" }]} ust="Çalışma Planı" baslik="Gitarda hangi seviyedesin?" alt="Seviyeni seç, sana uygun elektro gitar çalışma yoluna yönlendirelim." />
      <Bant ton="gri" className="pt-12">
        <div className="mx-auto max-w-3xl">
          <LevelPicker options={options} />
        </div>
      </Bant>
    </div>
  );
}
