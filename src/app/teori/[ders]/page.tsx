import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { THEORY, getLesson } from "@/content/theory";
import FretboardExplorer from "@/components/FretboardExplorer";

export function generateStaticParams() {
  return THEORY.map((l) => ({ ders: l.slug }));
}

export async function generateMetadata(props: PageProps<"/teori/[ders]">): Promise<Metadata> {
  const { ders } = await props.params;
  return { title: getLesson(ders)?.title ?? "Ders" };
}

export default async function LessonPage(props: PageProps<"/teori/[ders]">) {
  const { ders } = await props.params;
  const lesson = getLesson(ders);
  if (!lesson) notFound();

  return (
    <article className="space-y-6">
      <nav className="text-sm text-muted">
        <Link href="/teori" className="hover:text-accent">
          Teori
        </Link>{" "}
        / {lesson.title}
      </nav>
      <header>
        <p className="eyebrow">Seviye {lesson.level}</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{lesson.title}</h1>
        <p className="mt-1 text-muted">{lesson.summary}</p>
      </header>

      <div className="max-w-3xl space-y-4 leading-relaxed">
        {lesson.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {lesson.table && (
        <div className="max-w-3xl overflow-x-auto card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                {lesson.table.head.map((h) => (
                  <th key={h} className="px-4 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lesson.table.rows.map((r) => (
                <tr key={r.join()} className="border-b border-line last:border-0">
                  {r.map((c, i) => (
                    <td key={i} className="px-4 py-2">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lesson.explore && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Sapta incele</h2>
          <FretboardExplorer initialSet={lesson.explore.set} initialRoot={lesson.explore.root} />
        </section>
      )}
    </article>
  );
}
