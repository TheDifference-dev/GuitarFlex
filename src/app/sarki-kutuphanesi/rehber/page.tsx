import type { Metadata } from "next";
import SongList from "@/components/SongList";
import SongsNav from "@/components/SongsNav";
import { Bant, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import { getCourses } from "@/lib/courses";
import { getPopularSongs } from "@/lib/songs";
import { yerSimgesi } from "@/lib/simge";

export const metadata: Metadata = { title: "Rehber Şarkılar" };

/** Şarkı Kütüphanesi › Rehber Şarkılar (eski "Şarkılarla Öğren"): GuitarFlex Şarkı Rehberi, adım adım */
export default async function RehberSarkilarPage() {
  const [songs, courses] = await Promise.all([getPopularSongs(), getCourses()]);
  const courseTitles = Object.fromEntries(courses.map((c) => [c.slug, c.title]));
  return (
    <div>
      <SongsNav />
      <SayfaBasi
        bas={false}
        kirinti={[{ href: "/sarki-kutuphanesi", label: "Şarkı Kütüphanesi" }, { label: "Rehber Şarkılar" }]}
        simge={yerSimgesi("sarkilar")}
        baslik="Rehber Şarkılar"
        alt="GuitarFlex Şarkı Rehberi: hazırlayan teknik bölümünden şarkıya, adım adım. Tablar Songsterr'de açılır."
      >
        <MetinBag href="/sarki-kutuphanesi/tum" buyuk>
          Tüm Şarkılar
        </MetinBag>
      </SayfaBasi>
      <Bant ton="gri" className="pt-12">
        <SongList songs={songs.filter((s) => !s.tags.includes("Akustik"))} courseTitles={courseTitles} gorunum="rehber" />
      </Bant>
    </div>
  );
}
