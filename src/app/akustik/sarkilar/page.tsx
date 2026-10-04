import type { Metadata } from "next";
import SongList from "@/components/SongList";
import { getCourses } from "@/lib/courses";
import { getPopularSongs } from "@/lib/songs";

export const metadata: Metadata = { title: "Akustik Şarkılar" };

export default async function AcousticSongsPage() {
  const [songs, courses] = await Promise.all([getPopularSongs(), getCourses()]);
  const courseTitles = Object.fromEntries(courses.map((c) => [c.slug, c.title]));
  const acoustic = songs.filter((s) => s.tags.includes("Akustik"));
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Akustik Gitar</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-accent">Akustik Şarkılar</h1>
        <p className="mt-1 max-w-3xl text-muted">Akorlarla çalınan şarkılar zorluğa göre. Tablar Songsterr&apos;de açılır; şarkıya hazırlayan kurslar kartın altında.</p>
      </header>
      {acoustic.length ? (
        <SongList songs={acoustic} courseTitles={courseTitles} />
      ) : (
        <p className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">Akustik şarkı listesi yakında eklenecek.</p>
      )}
    </div>
  );
}
