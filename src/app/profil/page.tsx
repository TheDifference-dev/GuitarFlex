import type { Metadata } from "next";
import ProgressDashboard, { type CourseInfo } from "@/components/ProgressDashboard";
import { flatLessons, lessonKey } from "@/content/courses";
import { getCourses } from "@/lib/courses";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const courses = await getCourses();
  const info: CourseInfo[] = courses.map((c) => {
    const lessons = flatLessons(c);
    return {
      slug: c.slug,
      title: c.title,
      icon: c.icon,
      keys: lessons.map((l) => lessonKey(c.slug, l.id)),
      titles: Object.fromEntries(lessons.map((l) => [lessonKey(c.slug, l.id), `${c.title} · ${l.title}`])),
    };
  });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight">Profil</h1>
        <p className="mt-1 text-muted">Çalışma serin, rütben, rozetlerin ve kurs ilerlemen. Şimdilik bu bilgisayarda saklanır.</p>
      </header>
      <ProgressDashboard courses={info} />
    </div>
  );
}
