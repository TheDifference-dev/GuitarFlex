import type { Metadata } from "next";
import HomeView, { type CourseSummary } from "@/components/HomeView";
import { flatLessons, lessonKey } from "@/content/courses";
import { getCourses, getSiteTexts } from "@/lib/courses";

export const metadata: Metadata = { title: "Elektro Gitar · Teknik Egzersizler" };

/** Elektro gitar teknik egzersizleri (GuitarBear'deki /pathways karşılığı): rehberler, akor yolu, kurs kartları, şarkılar */
export default async function ElectricPage() {
  const [courses, texts] = await Promise.all([getCourses(), getSiteTexts()]);
  const summaries: CourseSummary[] = courses.filter((c) => c.kind !== "acoustic" && c.kind !== "theory").map((c) => ({
    slug: c.slug,
    title: c.cardTitle ?? c.title,
    description: c.description,
    kind: c.kind,
    status: c.status,
    keys: flatLessons(c).map((l) => lessonKey(c.slug, l.id)),
  }));
  return <HomeView texts={texts} courses={summaries} eyebrow="Elektro Gitar" />;
}
