import type { Metadata } from "next";
import { Bant, BolumBasi, SayfaBasi } from "@/components/site/Vitrin";
import TemaSecici from "@/components/site/TemaSecici";
import ProgressDashboard, { type CourseInfo } from "@/components/ProgressDashboard";
import { flatLessons, lessonKey } from "@/content/courses";
import { getCourses } from "@/lib/courses";
import { getOyun } from "@/lib/oyun-veri";
import type { KursYapisi } from "@/lib/oyun";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const [courses, oyun] = await Promise.all([getCourses(), getOyun()]);
  const info: CourseInfo[] = courses.map((c) => {
    const lessons = flatLessons(c);
    return {
      slug: c.slug,
      title: c.title,
      keys: lessons.map((l) => lessonKey(c.slug, l.id)),
      titles: Object.fromEntries(lessons.map((l) => [lessonKey(c.slug, l.id), `${c.title} · ${l.title}`])),
    };
  });
  // Başarımlar için kurs yapısı: bölümlerin ders anahtarları ve derslerin hedef süreleri (pratik kartları hariç)
  const kurslar: KursYapisi[] = courses.map((c) => ({
    slug: c.slug,
    teknik: c.kind === "technique" && !c.slug.endsWith("-rehberi"),
    bolumler: c.sections.map((s) => s.chapters.flatMap((ch) => ch.lessons.filter((l) => !l.practice).map((l) => lessonKey(c.slug, l.id)))),
    hedef: Object.fromEntries(flatLessons(c).filter((l) => !l.practice && l.minutes > 0).map((l) => [lessonKey(c.slug, l.id), l.minutes * 60])),
  }));
  return (
    <div>
      <SayfaBasi
        kirinti={[{ label: "Profil" }]}
        baslik="Profil"
        alt="Günlük görevlerin, serin, madalyaların, başarımların ve kurs ilerlemen. Şimdilik bu bilgisayarda saklanır."
      />
      <Bant ton="gri" className="pt-12">
        <ProgressDashboard courses={info} oyun={oyun} kurslar={kurslar} />
      </Bant>
      <Bant ton="beyaz" id="gorunum" className="scroll-mt-16 text-center">
        <BolumBasi baslik="Görünüm" alt="Açık tema varsayılandır. Koyu temayı seçebilir ya da işletim sisteminin ayarına uydurabilirsin." className="!mb-6" />
        <TemaSecici />
      </Bant>
    </div>
  );
}
