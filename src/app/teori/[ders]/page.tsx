import type { Metadata } from "next";
import { SayfaBasi } from "@/components/site/Vitrin";
import { yerSimgesi } from "@/lib/simge";
import { notFound } from "next/navigation";
import { THEORY, getLesson } from "@/content/theory";
import FretboardExplorer from "@/components/FretboardExplorer";
import DersGovdesi from "@/components/teori/DersGovdesi";

export function generateStaticParams() {
  return THEORY.map((l) => ({ ders: l.slug }));
}

export async function generateMetadata(props: PageProps<"/teori/[ders]">): Promise<Metadata> {
  const { ders } = await props.params;
  return { title: getLesson(ders)?.baslik ?? "Ders" };
}

export default async function LessonPage(props: PageProps<"/teori/[ders]">) {
  const { ders } = await props.params;
  const lesson = getLesson(ders);
  if (!lesson) notFound();

  return (
    <article className="space-y-6">
      <SayfaBasi
        simge={yerSimgesi("teori-dersi")}
        kirinti={[{ href: "/teori", label: "Müzik Teorisi" }, { label: lesson.baslik }]}
        ust={`Seviye ${lesson.seviye ?? 1}`}
        baslik={lesson.baslik}
        alt={lesson.ozet}
        boyut="buyuk"
      />

      <div className="mx-auto max-w-[820px]">
        <DersGovdesi ders={lesson} ust={`Müzik Teorisi · Seviye ${lesson.seviye ?? 1}`} />
      </div>

      {lesson.kesif && (
        <section className="ders-ekran space-y-3 pt-10 print:hidden">
          <h2 className="baslik-orta text-center">Sapta incele</h2>
          <FretboardExplorer initialSet={lesson.kesif.set} initialRoot={lesson.kesif.root} />
        </section>
      )}
    </article>
  );
}
