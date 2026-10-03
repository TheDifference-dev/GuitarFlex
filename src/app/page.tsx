import HomeView, { type CourseSummary } from "@/components/HomeView";
import { flatLessons, lessonKey } from "@/content/courses";
import { assetUrl, getCourses, getSiteTexts } from "@/lib/courses";

export default async function Home() {
  const [courses, texts] = await Promise.all([getCourses(), getSiteTexts()]);
  const summaries: CourseSummary[] = courses.filter((c) => c.kind !== "acoustic").map((c) => ({
    slug: c.slug,
    title: c.title,
    description: c.description,
    kind: c.kind,
    image: assetUrl(c.image),
    icon: c.icon,
    status: c.status,
    keys: flatLessons(c).map((l) => lessonKey(c.slug, l.id)),
  }));
  return <HomeView texts={texts} courses={summaries} />;
}
