import type { Metadata } from "next";
import Link from "next/link";
import Kirinti from "@/components/site/Kirinti";
import { notFound } from "next/navigation";
import { THEORY, getLesson } from "@/content/theory";
import { ARMONI_UNITELERI, OKUMA_KONULARI, dersBagi } from "@/content/teori/mufredat";
import FretboardExplorer from "@/components/FretboardExplorer";
import DersGovdesi from "@/components/teori/DersGovdesi";

export function generateStaticParams() {
  return THEORY.map((l) => ({ ders: l.slug }));
}

export async function generateMetadata(props: PageProps<"/teori/[ders]">): Promise<Metadata> {
  const { ders } = await props.params;
  return { title: getLesson(ders)?.baslik ?? "Ders" };
}

/** Teori dersi: A4 yaprakları (çok yapraklı derste Sayfa 1/n), müfredattaki önce/sonra bağları, kitabı ve sapta inceleme */
export default async function LessonPage(props: PageProps<"/teori/[ders]">) {
  const { ders } = await props.params;
  const lesson = getLesson(ders);
  if (!lesson) notFound();
  const bag = dersBagi(lesson.slug);
  const armoni = ARMONI_UNITELERI.find((u) => u.dersler.includes(lesson.slug));
  const okuma = OKUMA_KONULARI.find((k) => k.dersler.includes(lesson.slug));

  return (
    <article className="space-y-4">
      <Kirinti
        halkalar={[{ href: "/teori", label: "Müzik Teorisi" }, armoni ? { href: "/teori/armoni", label: "Armoni" } : okuma ? { href: "/teori/nota-okuma", label: "Nota Okuma" } : { href: "/teori#dersler", label: "Teori Dersleri" }, { label: lesson.baslik }]}
        className="print:hidden"
      />
      <h1 className="sr-only">{lesson.baslik}</h1>
      {(armoni || okuma) && (
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-muted print:hidden">
          {armoni ? (
            <Link href={`/teori/armoni#unite-${armoni.no}`} className="metin-bag">
              Armoni · Ünite {armoni.no}: {armoni.ad} — sınav ve sapta çal ›
            </Link>
          ) : null}
          {okuma ? (
            <Link href={`/teori/nota-okuma#konu-${okuma.no}`} className="metin-bag">
              Nota Okuma · Konu {okuma.no}: {okuma.ad} — alıştırmalar ›
            </Link>
          ) : null}
        </p>
      )}

      <DersGovdesi ders={lesson} ust={bag?.yer ?? `Müzik Teorisi · Seviye ${lesson.seviye ?? 1}`} bag={bag} />

      {lesson.kesif && (
        <section className="ders-ekran space-y-3 pt-10 print:hidden">
          <h2 className="baslik-orta text-center">Sapta incele</h2>
          <FretboardExplorer initialSet={lesson.kesif.set} initialRoot={lesson.kesif.root} />
        </section>
      )}
    </article>
  );
}
