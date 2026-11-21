import type { Metadata } from "next";
import SongList from "@/components/SongList";
import SongsNav from "@/components/SongsNav";
import { Bant, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import { getCourses } from "@/lib/courses";
import { getPopularSongs } from "@/lib/songs";

export const metadata: Metadata = { title: "Popüler Şarkılar" };

export default async function SongsPage() {
  const [songs, courses] = await Promise.all([getPopularSongs(), getCourses()]);
  const courseTitles = Object.fromEntries(courses.map((c) => [c.slug, c.title]));
  return (
    <div>
      <SongsNav />
      <SayfaBasi
        bas={false}
        kirinti={[{ href: "/elektro", label: "Elektro Gitar" }, { label: "Popüler Şarkılar" }]}
        baslik="Popüler Şarkılar"
        alt="Ünlü şarkı ve sololar zorluk ve tekniğe göre. Tablar Songsterr'de açılır; her şarkının altında o şarkıya hazırlayan kurslar var."
      >
        <MetinBag href="/kutuphane" buyuk>
          Şarkı Kütüphanesi
        </MetinBag>
        <MetinBag href="/akustik/sarkilar" buyuk>
          Akustik şarkılar
        </MetinBag>
      </SayfaBasi>
      <Bant ton="gri" className="pt-12">
        <SongList songs={songs.filter((s) => !s.tags.includes("Akustik"))} courseTitles={courseTitles} rehber />
      </Bant>
    </div>
  );
}
