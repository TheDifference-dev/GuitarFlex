import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RutinSayfasi, { type RutinVerisi } from "@/components/rutin/RutinSayfasi";
import { Bant, SayfaBasi } from "@/components/site/Vitrin";
import { flatLessons } from "@/content/courses";
import { RUTINLER, RUTIN_KURSU, rutinSuresi, TEKNIKLER, type GunKodu } from "@/content/rutin";
import { getCourse, getCourses } from "@/lib/courses";
import { getOyun } from "@/lib/oyun-veri";
import { gitarProgrami } from "@/lib/gitarTonu";
import { yerSimgesi } from "@/lib/simge";

export const metadata: Metadata = { title: "Günlük Rutin" };

/** Günlük Rutin: üç farklı ≤ 15 dk ısınma (Gün A / B / C), zamanlayıcılı oynatıcı, günün üç tekniği ve şarkı hedefi */
export default async function RutinPage(props: PageProps<"/rutin">) {
  const sp = await props.searchParams;
  const gunParam = typeof sp.gun === "string" && ["A", "B", "C"].includes(sp.gun.toUpperCase()) ? (sp.gun.toUpperCase() as GunKodu) : null;
  const [kurs, kurslar, oyun] = await Promise.all([getCourse(RUTIN_KURSU), getCourses(), getOyun()]);
  if (!kurs) notFound();
  const dersler = new Map(flatLessons(kurs).map((l) => [l.id, l]));
  const gorunen = new Set(kurslar.map((c) => c.slug));
  const veri: RutinVerisi = {
    rutinler: RUTINLER.map((r) => ({
      gun: r.gun,
      ad: r.ad,
      aciklama: r.aciklama,
      dakika: rutinSuresi(r),
      teknikler: r.teknikler,
      bloklar: r.bloklar.map((b) => {
        const l = dersler.get(b.ders);
        if (!l?.tex) throw new Error(`Günlük Rutin: ${b.ders} dersi ya da tabı yok`);
        return {
          ...b,
          baslik: l.title,
          aciklama: l.description ?? "",
          // Blok temposu: önerilen başlangıç (dersin kendi temposu yerine)
          tex: l.tex.replace(/^\\tempo \d+/, `\\tempo ${b.bpm}`),
          hedefDk: l.minutes,
          href: `/calis/${RUTIN_KURSU}/${encodeURIComponent(l.id)}`,
          guitarProgram: gitarProgrami(l.tips, RUTIN_KURSU),
        };
      }),
    })),
    teknikler: TEKNIKLER.filter((t) => t.kurslar.some((k) => gorunen.has(k))).map((t) => ({ id: t.id, ad: t.ad, href: `/calis/${t.kurslar.find((k) => gorunen.has(k))}` })),
    kural: oyun?.gorevler ?? null,
  };
  return (
    <div>
      <SayfaBasi
        simge={yerSimgesi("rutin")}
        kirinti={[{ href: "/kurslar", label: "Gitar Çalış" }, { label: "Günlük Rutin" }]}
        baslik="Günlük Rutin"
        alt="Her gün 10–15 dakika ısınma, sonra 20 dakika: günün üç tekniğinden en az ikisi ve kalan sürede bir şarkı. Üç farklı rutin (A, B, C) sırayla döner; hepsi metronomla."
      />
      <Bant ton="gri" className="pt-10">
        <RutinSayfasi veri={veri} gunParam={gunParam} />
      </Bant>
    </div>
  );
}
