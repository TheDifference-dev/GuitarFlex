import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bant, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import SongList from "@/components/SongList";
import { getCourses } from "@/lib/courses";
import { getPopularSongs } from "@/lib/songs";

export const metadata: Metadata = { title: "Akustik Şarkılar" };

export default async function AcousticSongsPage() {
  const [songs, courses] = await Promise.all([getPopularSongs(), getCourses()]);
  const courseTitles = Object.fromEntries(courses.map((c) => [c.slug, c.title]));
  const acoustic = songs.filter((s) => s.tags.includes("Akustik"));
  // Akustik şarkılar ve kurslar arşivdeyse sayfa yoktur (bayrak kalkınca geri gelir)
  if (!acoustic.length || !courses.some((c) => c.kind === "acoustic")) notFound();
  return (
    <div>
      <SayfaBasi
        kirinti={[{ href: "/akustik", label: "Akustik Gitar" }, { label: "Şarkılar" }]}
        baslik="Akustik Şarkılar"
        alt="Akorlarla çalınan şarkılar zorluğa göre. Tablar Songsterr'de açılır; şarkıya hazırlayan kurslar kartın altında."
      >
        <MetinBag href="/akustik" buyuk>
          Akustik teknikler
        </MetinBag>
      </SayfaBasi>
      <Bant ton="gri" className="pt-12">
        {acoustic.length ? (
          <SongList songs={acoustic} courseTitles={courseTitles} />
        ) : (
          <p className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">Akustik şarkı listesi yakında eklenecek.</p>
        )}
      </Bant>
    </div>
  );
}
