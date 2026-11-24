import type { Metadata } from "next";
import SongList from "@/components/SongList";
import SongsNav from "@/components/SongsNav";
import { Bant, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import { getCourses } from "@/lib/courses";
import { getPopularSongs } from "@/lib/songs";
import { yerSimgesi } from "@/lib/simge";

export const metadata: Metadata = { title: "Tüm Şarkılar" };

/** Şarkı Kütüphanesi › Tüm Şarkılar: kapaklı kartlar, filtreler, sıralama; akustik şarkılar da burada */
export default async function TumSarkilarPage() {
  const [songs, courses] = await Promise.all([getPopularSongs(), getCourses()]);
  const courseTitles = Object.fromEntries(courses.map((c) => [c.slug, c.title]));
  return (
    <div>
      <SongsNav />
      <SayfaBasi
        bas={false}
        kirinti={[{ href: "/sarki-kutuphanesi", label: "Şarkı Kütüphanesi" }, { label: "Tüm Şarkılar" }]}
        simge={yerSimgesi("tum-sarkilar")}
        baslik="Tüm Şarkılar"
        alt="Riffler, sololar ve şarkılar; madalyaya, tekniğe ve kökene göre süz. Kapaklar şarkı adından üretilen özgün çizimlerdir, tablar Songsterr'de açılır."
      >
        <MetinBag href="/sarki-kutuphanesi/rehber" buyuk>
          Rehber Şarkılar
        </MetinBag>
      </SayfaBasi>
      <Bant ton="gri" className="pt-12">
        <SongList songs={songs} courseTitles={courseTitles} gorunum="tum" />
      </Bant>
    </div>
  );
}
