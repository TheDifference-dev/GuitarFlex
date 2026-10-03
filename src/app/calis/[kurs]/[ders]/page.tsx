import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LessonPractice from "@/components/LessonPractice";
import { flatLessons, lessonKey } from "@/content/courses";
import { assetUrl, getCourse } from "@/lib/courses";

async function find(kurs: string, ders: string) {
  const course = await getCourse(kurs);
  if (!course) return null;
  const lessons = flatLessons(course);
  const index = lessons.findIndex((l) => l.id === decodeURIComponent(ders));
  if (index < 0) return null;
  return { course, lessons, index, lesson: lessons[index] };
}

export async function generateMetadata(props: PageProps<"/calis/[kurs]/[ders]">): Promise<Metadata> {
  const { kurs, ders } = await props.params;
  return { title: (await find(kurs, ders))?.lesson.title ?? "Ders" };
}

export default async function LessonPage(props: PageProps<"/calis/[kurs]/[ders]">) {
  const { kurs, ders } = await props.params;
  const found = await find(kurs, ders);
  if (!found) notFound();
  const { course, lessons, index, lesson } = found;
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const href = (id: string) => `/calis/${course.slug}/${encodeURIComponent(id)}`;

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href={`/calis/${course.slug}`} className="font-bold text-accent hover:underline">
          {course.title}
        </Link>
        <ChevronRight size={14} /> Bölüm {lesson.section.number} – {lesson.section.title}
        <ChevronRight size={14} /> {lesson.chapter.code} {lesson.chapter.title}
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{lesson.title}</h1>
          {lesson.description && <p className="mt-1 max-w-3xl text-muted">{lesson.description}</p>}
        </div>
        <div className="flex gap-2 text-sm font-bold">
          <span className="rounded-lg border border-line bg-panel px-3 py-1.5">{lesson.bpm} BPM</span>
          <span className="rounded-lg border border-accent/60 bg-accent/15 px-3 py-1.5 text-accent">Toplam: {lesson.minutes}dk</span>
        </div>
      </header>

      <LessonPractice
        key={lesson.id}
        progressKey={lessonKey(course.slug, lesson.id)}
        bpm={lesson.bpm}
        minutes={lesson.minutes}
        tex={lesson.tex}
        tabUrl={assetUrl(lesson.tabFile)}
      />

      {!!lesson.tips?.length && (
        <section className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="font-bold">İpuçları</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            {lesson.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex justify-between gap-4 text-sm font-bold">
        {prev ? (
          <Link href={href(prev.id)} className="flex items-center gap-1 rounded-xl border border-line bg-panel px-4 py-2 hover:border-accent">
            <ChevronLeft size={16} /> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={href(next.id)} className="flex items-center gap-1 rounded-xl border border-line bg-panel px-4 py-2 hover:border-accent">
            {next.title} <ChevronRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
