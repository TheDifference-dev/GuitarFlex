import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LessonPractice from "@/components/LessonPractice";
import { Bant } from "@/components/site/Vitrin";
import { DersAltGezinme, DersUstGezinme } from "@/components/site/DersGezinme";
import UygulamaSimgesi from "@/components/site/UygulamaSimgesi";
import { kursAnahatti } from "@/lib/katalog";
import { DERS_TURU_ADI, dersSimgesi, dersTuru, yerSimgesi } from "@/lib/simge";
import { flatLessons, lessonKey } from "@/content/courses";
import { assetUrl, getCourse } from "@/lib/courses";
import { gitarProgrami } from "@/lib/gitarTonu";

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
  const { course, lesson } = found;
  const theory = [...(lesson.chapter.theory ?? []), ...(lesson.theory ?? [])];
  const anahat = kursAnahatti(course);

  return (
    <div className="space-y-6">
      {/* Üst gezinme: kırıntı, ders listesi çekmecesi, önceki/sonraki */}
      <div className="space-y-3">
        <DersUstGezinme anahat={anahat} dersId={lesson.id} />
      </div>

      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pt-4">
        <div className="flex min-w-0 items-start gap-5">
          <UygulamaSimgesi simge={dersSimgesi(dersTuru(lesson), course.slug)} boyut={60} etiket={DERS_TURU_ADI[dersTuru(lesson) ?? "drill"]} className="mt-1" />
          <div className="min-w-0">
            <p className="text-[17px] font-semibold text-muted">{course.cardTitle ?? course.title}</p>
            <h1 className="baslik-orta mt-1 text-balance !text-[clamp(2rem,1.5rem+1.6vw,3rem)]">{lesson.title}</h1>
            {lesson.description && <p className="mt-3 max-w-3xl text-pretty text-[19px] leading-snug text-muted">{lesson.description}</p>}
          </div>
        </div>
        <div className="flex gap-2 text-sm">
          {(lesson.tex || lesson.tabFile) && (
            <span className="rounded-full bg-ink/[0.06] px-4 py-1.5 font-semibold tabular-nums">
              {lesson.bpmRange ? `${lesson.bpmRange[0]}–${lesson.bpmRange[1]}` : lesson.bpm} BPM
            </span>
          )}
          <span className="rounded-full bg-accent/10 px-4 py-1.5 font-semibold text-accent">Toplam: {lesson.minutes}dk</span>
        </div>
      </header>

      {!!lesson.body?.length && (
        <article className="card max-w-3xl space-y-3 p-6 leading-relaxed sm:p-8">
          {lesson.body.map((para, i) =>
            para.startsWith("## ") ? (
              <h2 key={i} className="pt-2 text-xl font-semibold first:pt-0">
                {para.slice(3)}
              </h2>
            ) : (
              <p key={i} className="text-muted">
                {para}
              </p>
            ),
          )}
        </article>
      )}

      <LessonPractice
        key={lesson.id}
        reading={!!lesson.body?.length}
        progressKey={lessonKey(course.slug, lesson.id)}
        bpm={lesson.bpm}
        minutes={lesson.minutes}
        tex={lesson.tex}
        tabUrl={assetUrl(lesson.tabFile)}
        stave={lesson.stave}
        kind={lesson.kind}
        readBars={lesson.readBars}
        improvBars={lesson.improvBars}
        chords={lesson.chords}
        title={lesson.title}
        parts={lesson.parts}
        guitarProgram={gitarProgrami(lesson.tips, course.slug)}
      />

      <Bant ton="gri" className="mt-12 space-y-8 pt-12">
      {(theory.length > 0 || !!lesson.tips?.length) && (
        <div className="grid gap-4 md:grid-cols-2">
          {theory.length > 0 && (
            <section className="card p-6">
              <h2 className="flex items-center gap-2.5 text-[21px] font-semibold">
                <UygulamaSimgesi simge={yerSimgesi("muzik-bilgisi")} boyut={32} /> Müzik Bilgisi
              </h2>
              <ul className="mt-2 space-y-2 text-sm text-muted">
                {theory.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          )}
          {!!lesson.tips?.length && (
            <section className="card p-6">
              <h2 className="flex items-center gap-2.5 text-[21px] font-semibold">
                <UygulamaSimgesi simge={yerSimgesi("ipucu")} boyut={32} /> İpuçları
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                {lesson.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <DersAltGezinme anahat={anahat} dersId={lesson.id} />
      </Bant>
    </div>
  );
}
