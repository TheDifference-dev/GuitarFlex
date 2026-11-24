import type { Metadata } from "next";
import Link from "next/link";
import { Bant, HapBag, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import AdimListesi from "@/components/teori/AdimListesi";
import { OKUMA_KONULARI } from "@/content/teori/mufredat";
import { getLesson } from "@/content/theory";
import { getYol } from "@/lib/yollar";
import { yolSimgesi } from "@/lib/simge";

export const metadata: Metadata = { title: "Nota Okuma" };

/**
 * Nota Okuma kütüphanesi: nota adlarından ileri okuma işaretlerine 11 konu. Her konu: A4 ders(ler) + Okuma yolunun
 * o konuya ait bölümlerinin alıştırmaları (eski "Okuma" yolu bu sıraya yerleşti).
 */
export default async function NotaOkumaPage() {
  const yol = await getYol("okuma");
  return (
    <div>
      <SayfaBasi
        simge={yolSimgesi("okuma")}
        kirinti={[{ href: "/teori", label: "Müzik Teorisi" }, { label: "Nota Okuma" }]}
        baslik="Nota Okuma"
        alt={`Nota adlarından ileri okumaya ${OKUMA_KONULARI.length} konu. Her konuda önce A4 yaprağını oku, sonra alıştırmaları çöz.`}
      >
        <HapBag href="#konu-1">Konu 1&apos;den başla</HapBag>
        <MetinBag href="/teori/notalar" buyuk>
          Nota adları
        </MetinBag>
      </SayfaBasi>
      <Bant ton="gri" className="pt-10">
        <ol className="mx-auto max-w-[1100px] space-y-6">
          {OKUMA_KONULARI.map((k) => {
            const bolumler = (yol?.bolumler ?? []).filter((b) => k.bolumler.includes(b.no));
            return (
              <li key={k.no} id={`konu-${k.no}`} className="card scroll-mt-20 space-y-4 p-6 sm:p-7">
                <div>
                  <p className="text-xs font-semibold text-muted">Konu {k.no}</p>
                  <h2 className="text-[26px] font-semibold leading-tight">{k.ad}</h2>
                  <p className="mt-1 text-muted">{k.ozet}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[15px] font-semibold">Oku</h3>
                  <ul className="flex flex-wrap gap-2">
                    {k.dersler.map((slug) => {
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
                {yol ? (
                  bolumler.map((b) => (
                    <AdimListesi
                      key={b.no}
                      yol="okuma"
                      baslik={`Alıştırma · ${b.ad}`}
                      adimlar={yol.adimlar.filter((a) => a.bolum === b.no).map((a) => ({ kod: a.kod, ad: a.ad, soru: a.soru, kontrol: a.kontrol }))}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted">Alıştırmalar içerik paketinde; paket bulunamadı.</p>
                )}
              </li>
            );
          })}
        </ol>
      </Bant>
    </div>
  );
}
