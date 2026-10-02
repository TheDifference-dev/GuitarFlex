import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_EXERCISES, getExercise } from "@/content/techniques";
import PracticePanel from "@/components/PracticePanel";

export function generateStaticParams() {
  return ALL_EXERCISES.map((e) => ({ id: e.id }));
}

export async function generateMetadata(props: PageProps<"/egzersiz/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  return { title: getExercise(id)?.title ?? "Egzersiz" };
}

export default async function ExercisePage(props: PageProps<"/egzersiz/[id]">) {
  const { id } = await props.params;
  const exercise = getExercise(id);
  if (!exercise) notFound();

  const { technique, level } = exercise;
  const siblings = technique.levels.flatMap((l) => l.exercises);
  const index = siblings.findIndex((e) => e.id === id);
  const prev = siblings[index - 1];
  const next = siblings[index + 1];

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted">
        <Link href="/yollar" className="hover:text-accent">
          Yollar
        </Link>{" "}
        /{" "}
        <Link href={`/yollar/${technique.slug}`} className="hover:text-accent">
          {technique.name}
        </Link>{" "}
        / Seviye {level.level}
      </nav>

      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          {technique.name} · Seviye {level.level} · {level.title}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{exercise.title}</h1>
        <p className="mt-1 max-w-3xl text-muted">{exercise.description}</p>
        <p className="mt-2 text-sm">
          Başlangıç <b>{exercise.startBpm} BPM</b> → Hedef <b>{exercise.targetBpm} BPM</b>
        </p>
      </header>

      <PracticePanel exerciseId={exercise.id} tex={exercise.tex} startBpm={exercise.startBpm} targetBpm={exercise.targetBpm} />

      <section className="rounded-xl border border-line bg-panel p-5">
        <h2 className="font-semibold">İpuçları</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          {exercise.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          Çalışma yöntemi: başlangıç temposunda üç kez hatasız çal, sonra tempoyu %5 artır. Hedef tempoya ulaşıp kaydettiğinde egzersiz
          tamamlanmış sayılır.
        </p>
      </section>

      <div className="flex justify-between gap-4 text-sm">
        {prev ? (
          <Link href={`/egzersiz/${prev.id}`} className="rounded-lg border border-line px-4 py-2 hover:border-accent">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/egzersiz/${next.id}`} className="rounded-lg border border-line px-4 py-2 hover:border-accent">
            {next.title} →
          </Link>
        )}
      </div>
    </div>
  );
}
