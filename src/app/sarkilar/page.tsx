import type { Metadata } from "next";
import SongList from "@/components/SongList";
import SongsNav from "@/components/SongsNav";
import { getCourses } from "@/lib/courses";
import { getPopularSongs } from "@/lib/songs";

export const metadata: Metadata = { title: "Popüler Şarkılar" };

export default async function SongsPage() {
  const [songs, courses] = await Promise.all([getPopularSongs(), getCourses()]);
  const courseTitles = Object.fromEntries(courses.map((c) => [c.slug, c.title]));
  return (
    <div className="space-y-6">
      <SongsNav />
      <header>
        <h1 className="text-3xl font-black tracking-tight">Popüler Şarkılar</h1>
        <p className="mt-1 max-w-3xl text-muted">
          Ünlü şarkı ve sololar zorluk ve tekniğe göre. Tablar Songsterr&apos;de açılır; her şarkının altında o şarkıya hazırlayan kurslar var.
        </p>
      </header>
      <SongList songs={songs} courseTitles={courseTitles} />
    </div>
  );
}
