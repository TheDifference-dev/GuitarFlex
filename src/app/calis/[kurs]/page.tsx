import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CourseView from "@/components/CourseView";
import { assetUrl, getCourses } from "@/lib/courses";
import { GRUP_ADI, kursAilesi, kursGrubu } from "@/lib/katalog";

export async function generateMetadata(props: PageProps<"/calis/[kurs]">): Promise<Metadata> {
  const { kurs } = await props.params;
  return { title: (await getCourses()).find((c) => c.slug === kurs)?.title ?? "Kurs" };
}

export default async function CoursePage(props: PageProps<"/calis/[kurs]">) {
  const { kurs } = await props.params;
  const courses = await getCourses();
  const course = courses.find((c) => c.slug === kurs);
  if (!course) notFound();
  const aile = kursAilesi(course);
  // Kurs seçici: aynı bölümdeki (elektro / akustik / teori) kurslar, katalog gruplarıyla
  const kurslar = courses
    .filter((c) => kursAilesi(c) === aile && !c.status)
    .map((c) => ({ slug: c.slug, title: c.cardTitle ?? c.title, ders: c.sections.reduce((n, s) => n + s.chapters.reduce((m, ch) => m + ch.lessons.length, 0), 0), grup: GRUP_ADI[kursGrubu(c)] }));
  return <CourseView course={course} image={assetUrl(course.image)} kurslar={kurslar} aile={aile} />;
}
