import type { Metadata } from "next";
import { Bant, SayfaBasi } from "@/components/site/Vitrin";
import LevelPicker, { type LevelOption } from "@/components/LevelPicker";
import { getCourses, getSiteTexts } from "@/lib/courses";

export const metadata: Metadata = { title: "Gitarda Nasıl Çalışmalıyım?" };

export default async function HowToPracticePage() {
  const [courses, texts] = await Promise.all([getCourses(), getSiteTexts()]);
  const has = (slug: string) => courses.some((c) => c.slug === slug);
  const course = (slug: string, fallback: string) => (has(slug) ? `/calis/${slug}` : fallback);
  const chords = `/calis/${texts.chordCard.slug}`;

  // Orta–ileri odak (W5): başlangıç rehberleri ve akustik kurslar arşivde; arşivden çıkarsa seçenekleri geri gelir
  const elektro: LevelOption[] = [
    ...(has("sifirdan-baslangic-rehberi") ? [{ title: "Gitara sıfırdan başlıyorum", text: "Temel konular ve ilk egzersizler, adım adım.", href: "/calis/sifirdan-baslangic-rehberi" }] : []),
    { title: "Orta seviyeye geçiyorum", text: "Akorları sapın her yerinde bulmak (CAGED, akor türleri) ve her gün düzenli ısınmak istiyorum.", href: course("akorlar", chords) },
    { title: "Orta seviyedeyim", text: "Her gün 10–15 dk ısınma, sonra 20 dk teknik (günün üç tekniğinden ikisi) ve bir şarkı.", href: "/rutin" },
    { title: "İleri seviyeye çıkıyorum", text: "Bir tekniği derinleştirmek, hızımı ve repertuvarımı geliştirmek istiyorum.", href: "/seviye" },
  ];
  const akustik: LevelOption[] = courses.some((c) => c.kind === "acoustic")
    ? [
        { title: "Gitara sıfırdan başlıyorum", text: "Akustikte duruş, ilk akorlar ve temel teknikler.", href: course("akustik-baslangic-rehberi", chords) },
        { title: "Orta / ileri seviyedeyim", text: "Akustik tekniklerde (arpej, slide, bend) ilerlemek istiyorum.", href: "/akustik" },
      ]
    : [];

  return (
    <div>
      <SayfaBasi kirinti={[{ label: "Çalışma Planı" }]} ust="Çalışma Planı" baslik="Gitarda hangi seviyedesin?" alt="Seviyeni seç, sana uygun çalışma yoluna yönlendirelim." />
      <Bant ton="gri" className="pt-12">
        <div className="mx-auto max-w-3xl">
          <LevelPicker elektro={elektro} akustik={akustik} />
        </div>
      </Bant>
    </div>
  );
}
