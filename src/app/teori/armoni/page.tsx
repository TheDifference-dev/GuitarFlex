import type { Metadata } from "next";
import Link from "next/link";
import { Bant, HapBag, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import AdimListesi from "@/components/teori/AdimListesi";
import { ARMONI_UNITELERI } from "@/content/teori/mufredat";
import { getLesson } from "@/content/theory";
import { getCourse } from "@/lib/courses";
import { getYol } from "@/lib/yollar";
import { kursSimgesi } from "@/lib/simge";

export const metadata: Metadata = { title: "Armoni" };

/**
 * Armoni (tek giriş): eski "Armoni Pratikleri" yolu ve "Armoni" (Müzik Teorisi Dersleri) kursu burada birleşir.
 * Her ünite: A4 dersler → Sapta çal (kursun Ek İnceleme kartları) → Sınav (armoni yolunun adımları; yalnız armoni ve
 * müzik teorisi soruları). GuitarBear'in 5 bölümü ve 11 pratik kartı ünitelere yerleşik.
 */
export default async function ArmoniPage() {
  const [yol, kurs] = await Promise.all([getYol("armoni"), getCourse("armoni")]);
  const ekler = kurs ? kurs.sections.flatMap((s) => s.chapters.flatMap((ch) => ch.lessons.filter((l) => l.card === "ek").map((l) => ({ ...l, kod: ch.code ?? "" })))) : [];
  const toplamDers = ARMONI_UNITELERI.reduce((n, u) => n + u.dersler.length, 0);
  return (
    <div>
      <SayfaBasi
        simge={kursSimgesi("armoni")}
        kirinti={[{ href: "/teori", label: "Müzik Teorisi" }, { label: "Armoni" }]}
        baslik="Armoni"
        alt={`${ARMONI_UNITELERI.length} ünite, ${toplamDers} ders. Önce A4 yaprağını oku, sonra sapta çal, en sonda ünitenin sınavını geç.`}
      >
        <HapBag href="#unite-1">Ünite 1&apos;den başla</HapBag>
        <MetinBag href="/teori/modlar" buyuk>
          Modlar
        </MetinBag>
        <MetinBag href="/sap-gezgini?gam=major&kok=C" buyuk>
          Sap Gezgini
        </MetinBag>
      </SayfaBasi>
      <Bant ton="gri" className="pt-10">
        <div className="mx-auto max-w-[1100px] space-y-6">
          {ARMONI_UNITELERI.map((u) => {
            const sinav = (yol?.adimlar ?? []).filter((a) => u.sinav.includes(a.kod)).map((a) => ({ kod: a.kod, ad: a.ad, soru: a.soru, kontrol: a.kontrol }));
            const cal = ekler.filter((e) => u.cal.includes(e.kod));
            return (
              <section key={u.no} id={`unite-${u.no}`} className="card scroll-mt-20 space-y-5 p-6 sm:p-7">
                <div>
                  <p className="text-xs font-semibold text-muted">
                    Ünite {u.no}
                    {u.gb ? ` · GuitarBear ${u.gb}` : ""}
                  </p>
                  <h2 className="text-[26px] font-semibold leading-tight">{u.ad}</h2>
                  <p className="mt-1 text-muted">{u.ozet}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[15px] font-semibold">1. Oku</h3>
                  <ul className="flex flex-wrap gap-2">
                    {u.dersler.map((slug) => {
                      const d = getLesson(slug);
                      const sayfa = 1 + (d?.ekYapraklar?.length ?? 0);
                      return (
                        <li key={slug}>
                          <Link href={`/teori/${slug}`} className="inline-flex items-baseline gap-2 rounded-full border border-[var(--line)] px-3.5 py-1.5 text-[15px] font-medium transition hover:bg-ink/[0.05]">
                            {d?.baslik ?? slug}
                            <span className="text-xs font-normal text-muted">{sayfa > 1 ? `${sayfa} yaprak` : "A4"}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {cal.length ? (
                  <div className="space-y-2">
                    <h3 className="text-[15px] font-semibold">2. Sapta çal</h3>
                    <ul className="grid gap-1.5 sm:grid-cols-2">
                      {cal.map((e) => (
                        <li key={e.id}>
                          <Link href={`/calis/armoni/${encodeURIComponent(e.id)}`} className="block rounded-xl border border-[var(--line)] px-3 py-2 text-sm transition hover:bg-ink/[0.04]">
                            {e.title}
                            <span className="block text-xs text-muted">
                              {e.bpmRange ? `${e.bpmRange[0]}–${e.bpmRange[1]}` : e.bpm} BPM · tab
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {yol ? <AdimListesi yol="armoni" adimlar={sinav} baslik={`${cal.length ? "3" : "2"}. Sınav`} /> : <p className="text-sm text-muted">Sınavlar içerik paketinde; paket bulunamadı.</p>}
              </section>
            );
          })}
        </div>
      </Bant>
    </div>
  );
}
