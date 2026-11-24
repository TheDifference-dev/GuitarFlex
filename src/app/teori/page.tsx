import type { Metadata } from "next";
import Link from "next/link";
import { Bant, HapBag, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import { getYol, yolSayim } from "@/lib/yollar";
import UygulamaSimgesi from "@/components/site/UygulamaSimgesi";
import { kursSimgesi, yerSimgesi, yolSimgesi, type SimgeTanim } from "@/lib/simge";
import { ARMONI_UNITELERI, OKUMA_KONULARI, SEVIYELER, SIRA } from "@/content/teori/mufredat";

export const metadata: Metadata = { title: "Müzik Teorisi" };

/** GuitarBear ile aynı yapıdaki üç pratik yolu (Ritim, Klavye, Kulak); Armoni ve Nota Okuma kendi sayfalarında */
const PRATIK = [
  { slug: "ritim", ad: "Ritim" },
  { slug: "klavye", ad: "Klavye Görselleştirme" },
  { slug: "kulak", ad: "Kulak Eğitimi" },
] as const;

function Doseme({ href, simge, ust, ad, not, eylem, id }: { href: string; simge: SimgeTanim; ust: string; ad: string; not: string; eylem: string; id?: string }) {
  return (
    <Link id={id} href={href} className="doseme group min-h-[13rem] scroll-mt-20 items-start p-7 text-left">
      <UygulamaSimgesi simge={simge} boyut={60} className="mb-5" />
      <p className="text-xs font-semibold text-muted">{ust}</p>
      <h3 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight">{ad}</h3>
      <p className="mt-1 text-muted">{not}</p>
      <span className="metin-bag mt-auto pt-4 group-hover:underline">
        {eylem} <span aria-hidden>›</span>
      </span>
    </Link>
  );
}

/**
 * Müzik Teorisi: az ve net giriş. Teori Dersleri (başlangıçtan ileriye tek sıra), Armoni (ünite + sınav), Nota Okuma
 * (11 konu), Pratik (Ritim, Klavye, Kulak yolları) ve Sap Gezgini.
 */
export default async function TheoryPage() {
  const yollar = await Promise.all(PRATIK.map(async (y) => ({ ...y, yol: await getYol(y.slug) })));
  const sinav = ARMONI_UNITELERI.reduce((n, u) => n + u.sinav.length, 0);
  return (
    <div>
      <SayfaBasi simge={yerSimgesi("teori")} kirinti={[{ label: "Müzik Teorisi" }]} baslik="Müzik Teorisi" alt="Başlangıçtan ileriye tek sıra: oku, sapta dene, sınavla pekiştir.">
        <HapBag href="#dersler">Teori Dersleri</HapBag>
        <MetinBag href="/teori/armoni" buyuk>
          Armoni
        </MetinBag>
        <MetinBag href="/teori/nota-okuma" buyuk>
          Nota Okuma
        </MetinBag>
        <MetinBag href="#pratik" buyuk>
          Pratik
        </MetinBag>
        <MetinBag href="/sap-gezgini" buyuk>
          Sap Gezgini
        </MetinBag>
      </SayfaBasi>

      <Bant ton="gri">
        <div className="mx-auto grid max-w-[1100px] gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Doseme href="/teori/armoni" simge={kursSimgesi("armoni")} ust="Kitap · ünite sonu sınavları" ad="Armoni" not={`${ARMONI_UNITELERI.length} ünite · ${sinav} sınav adımı`} eylem="Armoniye başla" />
          <Doseme href="/teori/nota-okuma" simge={yolSimgesi("okuma")} ust="Kitap · sıfırdan ileriye" ad="Nota Okuma" not={`${OKUMA_KONULARI.length} konu · her konuda ders ve alıştırma`} eylem="Okumaya başla" />
          <Doseme id="sap" href="/sap-gezgini" simge={yerSimgesi("sap-gezgini")} ust="Serbest çalışma" ad="Sap Gezgini" not="Bütün modlar, pentatonik kutuları, minör aileleri" eylem="Sapı aç" />
        </div>
      </Bant>

      <Bant ton="beyaz" id="pratik" className="scroll-mt-12">
        <span id="yollar" className="block scroll-mt-12" aria-hidden />
        <h2 className="baslik-orta mb-2 text-center">Pratik</h2>
        <p className="mx-auto mb-8 max-w-[640px] text-center text-muted">Kısa adımlar, her denemede yeni sorular.</p>
        <div className="mx-auto grid max-w-[1100px] gap-3 sm:grid-cols-3">
          {yollar.map((y) => (
            <Doseme key={y.slug} href={`/teori/yol/${y.slug}`} simge={yolSimgesi(y.slug)} ust="Pratik yolu" ad={y.ad} not={y.yol ? yolSayim(y.yol) : "İçerik paketi gerekli"} eylem="Başla" />
          ))}
        </div>
      </Bant>

      <Bant ton="gri" id="dersler" className="scroll-mt-12">
        <h2 className="baslik-orta mb-2 text-center">Teori Dersleri</h2>
        <p className="mx-auto mb-10 max-w-[680px] text-center text-muted">{SIRA.length} ders, başlangıçtan ileriye tek sırada. Her ders bir ya da birkaç A4 yaprağı; sonunda “Önce / Sonra” bağlantıları var.</p>
        <div className="mx-auto max-w-[1100px] space-y-10">
          {SEVIYELER.map((s) => (
            <section key={s.no} aria-labelledby={`seviye-${s.no}`}>
              <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
                <h3 id={`seviye-${s.no}`} className="text-[24px] font-semibold">
                  Seviye {s.no} · {s.ad}
                </h3>
                <p className="text-muted">{s.alt}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {s.uniteler.map((u) => (
                  <div key={u.ad} className="card p-5">
                    <p className="text-xs font-semibold text-muted">Ünite</p>
                    <h4 className="text-[19px] font-semibold leading-tight">{u.ad}</h4>
                    <ol className="mt-3 space-y-1.5">
                      {u.dersler.map((d) => (
                        <li key={d.slug} className="flex items-baseline gap-2.5">
                          <span className="w-6 shrink-0 text-right text-[13px] tabular-nums text-muted">{SIRA.findIndex((x) => x.slug === d.slug) + 1}</span>
                          <Link href={`/teori/${d.slug}`} className="font-medium hover:underline">
                            {d.baslik}
                          </Link>
                        </li>
                      ))}
                    </ol>
                    {u.pratik?.length ? (
                      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--line)] pt-3 text-sm">
                        {u.pratik.map((p) => (
                          <Link key={p.href} href={p.href} className="metin-bag">
                            {p.ad} ›
                          </Link>
                        ))}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Bant>
    </div>
  );
}
