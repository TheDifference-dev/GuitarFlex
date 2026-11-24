import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import CourseView from "@/components/CourseView";
import { getCourse, getCourses } from "@/lib/courses";
import { GRUP_ADI, kursAilesi, kursGrubu } from "@/lib/katalog";

export async function generateMetadata(props: PageProps<"/calis/[kurs]">): Promise<Metadata> {
  const { kurs } = await props.params;
  return { title: (await getCourse(kurs))?.title ?? "Kurs" };
}

export default async function CoursePage(props: PageProps<"/calis/[kurs]">) {
  const { kurs } = await props.params;
  // Armoni kursu (Müzik Teorisi Dersleri) Teori › Armoni sayfasında tek girişte birleşti
  if (kurs === "armoni") redirect("/teori/armoni");
  // Arşivdeki kurs da açılır (eski bağlantılar, ilerleme kayıtları); kurs seçicide yalnız görünen kurslar
  const [course, courses] = await Promise.all([getCourse(kurs), getCourses()]);
  if (!course) notFound();
  const aile = kursAilesi(course);
  // Kurs seçici: aynı bölümdeki (elektro / akustik / teori) kurslar, katalog gruplarıyla
  const kurslar = courses
    .filter((c) => kursAilesi(c) === aile && !c.status)
    .map((c) => ({ slug: c.slug, title: c.cardTitle ?? c.title, ders: c.sections.reduce((n, s) => n + s.chapters.reduce((m, ch) => m + ch.lessons.length, 0), 0), grup: GRUP_ADI[kursGrubu(c)] }));
  return (
    <>
      {course.arsiv && (
        <p className="mx-auto mt-4 max-w-[980px] rounded-2xl border border-dashed border-line px-4 py-2.5 text-sm text-muted" data-arsiv>
          Bu kurs arşivde: katalogda ve Seviye Yolu&apos;nda görünmez. Derslerin ve ilerleme kayıtların duruyor.
        </p>
      )}
      <CourseView course={course} kurslar={kurslar} aile={aile} />
    </>
  );
}
