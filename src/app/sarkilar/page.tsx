import type { Metadata } from "next";
import SongList from "@/components/SongList";
import SongsNav from "@/components/SongsNav";
import { Bant, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import { getCourses } from "@/lib/courses";
import { getPopularSongs } from "@/lib/songs";

export const metadata: Metadata = { title: "Şarkılarla Öğren" };

export default async function SongsPage() {
  const [songs, courses] = await Promise.all([getPopularSongs(), getCourses()]);
  const courseTitles = Object.fromEntries(courses.map((c) => [c.slug, c.title]));
  return (
    <div>
      <SongsNav />
      <SayfaBasi
        bas={false}
        kirinti={[{ label: "Şarkılarla Öğren" }]}
        baslik="Şarkılarla Öğren"
        alt="GuitarFlex Şarkı Rehberi: hazırlayan teknik bölümünden şarkıya, adım adım. Tablar Songsterr'de açılır."
      >
        <MetinBag href="/sarki-kutuphanesi" buyuk>
          Tüm Kütüphane
        </MetinBag>
      </SayfaBasi>
      <Bant ton="gri" className="pt-12">
        <SongList songs={songs.filter((s) => !s.tags.includes("Akustik")) /* akustik şarkılar listelenmez */} courseTitles={courseTitles} rehber />
      </Bant>
    </div>
  );
}
