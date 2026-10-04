import type { Metadata } from "next";
import HomeView, { type CourseSummary } from "@/components/HomeView";
import { flatLessons, lessonKey } from "@/content/courses";
import { assetUrl, getCourses, getSiteTexts } from "@/lib/courses";

export const metadata: Metadata = { title: "Akustik Gitar" };

/** Akustik gitar teknik egzersizleri: akustik rehber, akor yolu ve akustik kurslar */
export default async function AcousticPage() {
  const [courses, texts] = await Promise.all([getCourses(), getSiteTexts()]);
  const acoustic = courses.filter((c) => c.kind === "acoustic");
  const guides = acoustic.filter((c) => c.slug.endsWith("-rehberi"));
  const summaries: CourseSummary[] = acoustic.map((c) => ({
    slug: c.slug,
    title: c.cardTitle ?? c.title,
    description: c.description,
    kind: c.kind,
    image: assetUrl(c.image),
    icon: c.icon,
    status: c.status,
    keys: flatLessons(c).map((l) => lessonKey(c.slug, l.id)),
  }));
  return (
    <HomeView
      songs="akustik"
      courses={summaries}
      texts={{
        ...texts,
        hero: {
          eyebrow: "Akustik Gitar",
          title: "Akustikte Nereden Başlamalı?",
          text: "Akorlardan tekniklere, sırayla ilerleyen bir yol.",
          guides: guides.length
            ? guides.map((g) => ({ slug: g.slug, title: g.title, text: g.description, button: "Başla" }))
            : [{ slug: texts.chordCard.slug, title: "Akorlarla Başla", text: "Açık akorlar, geçişler ve ritim.", button: "Başla" }],
        },
      }}
    />
  );
}
