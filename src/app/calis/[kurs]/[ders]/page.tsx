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
import CagedTablosu from "@/components/yol/CagedTablosu";

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
    <div className="space-y-4">
      {/* Üst gezinme: kırıntı, ders listesi çekmecesi, önceki/sonraki */}
      <div className="space-y-2">
        <DersUstGezinme anahat={anahat} dersId={lesson.id} />
      </div>

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
        guitarProgram={gitarProgrami(lesson.tips)}
        defter={{ kurs: course.cardTitle ?? course.title, href: `/calis/${course.slug}/${encodeURIComponent(lesson.id)}` }}
        baslik={
          // Kompakt başlık: küçük simge, kurs adı, ders adı ve kısa açıklama; tab ekranın üstüne yakın başlar
          <header className="flex min-w-0 items-start gap-3.5">
            <UygulamaSimgesi simge={dersSimgesi(dersTuru(lesson), course.slug)} boyut={44} etiket={DERS_TURU_ADI[dersTuru(lesson) ?? "drill"]} className="mt-0.5" />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-2 text-[13px] font-semibold text-muted">
                <span>{course.cardTitle ?? course.title}</span>
                {(lesson.tex || lesson.tabFile) && (
                  <span className="rounded-full bg-ink/[0.06] px-2 py-px tabular-nums text-text">
                    {lesson.bpmRange ? `${lesson.bpmRange[0]}–${lesson.bpmRange[1]}` : lesson.bpm} BPM
                  </span>
                )}
              </p>
              <h1 className="mt-0.5 text-balance text-[clamp(1.375rem,1.1rem+0.8vw,1.75rem)] font-semibold leading-tight tracking-[-0.015em] text-heading">{lesson.title}</h1>
              {lesson.description && <p className="mt-1 max-w-3xl text-pretty text-[15px] leading-snug text-muted">{lesson.description}</p>}
            </div>
          </header>
        }
      >
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
      </LessonPractice>

      <Bant ton="gri" className="mt-12 space-y-8 pt-12">
      {lesson.caged && (
        <section className="card p-6">
          <h2 className="flex items-center gap-2.5 text-[21px] font-semibold">
            <UygulamaSimgesi simge={yerSimgesi("muzik-bilgisi")} boyut={32} /> CAGED Şekilleri
          </h2>
          <p className="mt-1 text-sm text-muted">Her açık akor şekli sapta kaydırılınca yeni bir akor olur; beş şekil aynı akoru sapın beş bölgesinde verir.</p>
          <CagedTablosu />
        </section>
      )}
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
