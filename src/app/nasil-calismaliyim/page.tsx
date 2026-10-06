import type { Metadata } from "next";
import LevelPicker, { type LevelOption } from "@/components/LevelPicker";
import { getCourses, getSiteTexts } from "@/lib/courses";

export const metadata: Metadata = { title: "Gitarda Nasıl Çalışmalıyım?" };

export default async function HowToPracticePage() {
  const [courses, texts] = await Promise.all([getCourses(), getSiteTexts()]);
  const has = (slug: string) => courses.some((c) => c.slug === slug);
  const course = (slug: string, fallback: string) => (has(slug) ? `/calis/${slug}` : fallback);
  const chords = `/calis/${texts.chordCard.slug}`;

  const elektro: LevelOption[] = [
    { title: "Gitara sıfırdan başlıyorum", text: "Temel konular ve ilk egzersizler, adım adım.", href: course("sifirdan-baslangic-rehberi", "/") },
    { title: "Başlangıç / orta seviyedeyim", text: "Akorları, ritmi ve temel teknikleri düzenli bir plana oturtmak istiyorum.", href: course("baslangic-orta-rehberi", "/") },
    { title: "Orta / ileri seviyedeyim", text: "Bir tekniği derinleştirmek, hızımı ve repertuvarımı geliştirmek istiyorum.", href: "/" },
  ];
  const akustik: LevelOption[] = [
    { title: "Gitara sıfırdan başlıyorum", text: "Akustikte duruş, ilk akorlar ve temel teknikler.", href: course("akustik-baslangic-rehberi", chords) },
    { title: "Başlangıç / orta seviyedeyim", text: "Akor geçişlerini, ritim kalıplarını ve stilleri çalışmak istiyorum.", href: chords },
    { title: "Orta / ileri seviyedeyim", text: "Akustik tekniklerde (arpej, slide, bend) ilerlemek istiyorum.", href: "/akustik" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="eyebrow">Çalışma Planı</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Gitarda hangi seviyedesin?</h1>
        <p className="mt-1 text-muted">Seviyeni seç, sana uygun çalışma yoluna yönlendirelim.</p>
      </header>
      <LevelPicker elektro={elektro} akustik={akustik} />
    </div>
  );
}
