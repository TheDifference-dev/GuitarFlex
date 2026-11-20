import type { Metadata } from "next";
import { Bant, HapBag, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import Link from "next/link";
import { THEORY } from "@/content/theory";
import FretboardExplorer from "@/components/FretboardExplorer";
import { getYol, YOLLAR } from "@/lib/yollar";

export const metadata: Metadata = { title: "Müzik Teorisi" };

export default async function TheoryPage() {
  const lessons = [...THEORY].sort((a, b) => a.level - b.level);
  const yollar = await Promise.all(YOLLAR.map(async (y) => ({ ...y, yol: await getYol(y.slug) })));
  return (
    <div>
      <SayfaBasi kirinti={[{ label: "Müzik Teorisi" }]} baslik="Müzik Teorisi" alt="Gitarcının ihtiyaç duyduğu teori, sap üzerinde görerek.">
        <HapBag href="#yollar">Pratik Yolları</HapBag>
        <MetinBag href="/calis/armoni" buyuk>
          Armoni
        </MetinBag>
        <MetinBag href="#sap" buyuk>
          Sap gezgini
        </MetinBag>
      </SayfaBasi>

      <Bant ton="gri" id="yollar" className="scroll-mt-12">
        <h2 className="baslik-orta mb-8 text-center">Pratik Yolları</h2>
        <div className="mx-auto grid max-w-[1100px] gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {yollar.map((y) => (
            <Link key={y.slug} href={`/teori/yol/${y.slug}`} className="doseme group min-h-[13rem] items-start p-7 text-left">
              <p className="text-xs font-semibold text-muted">{y.etiket}</p>
              <h3 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight">{y.ad}</h3>
              <p className="mt-1 text-muted">{y.yol ? `${y.yol.bolumler.length} bölüm · ${y.yol.adimlar.length} adım` : "İçerik paketi gerekli"}</p>
              <span className="metin-bag mt-auto pt-4 group-hover:underline">
                Başla <span aria-hidden>›</span>
              </span>
            </Link>
          ))}
          <Link href="/calis/armoni" className="doseme group min-h-[13rem] items-start p-7 text-left">
            <p className="text-xs font-semibold text-muted">Müzik Teorisi Dersleri</p>
            <h3 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight">Armoni</h3>
            <p className="mt-1 text-muted">Eğitim, pratik ve ek inceleme kartları</p>
            <span className="metin-bag mt-auto pt-4 group-hover:underline">
              Derslere git <span aria-hidden>›</span>
            </span>
          </Link>
        </div>
      </Bant>

      <Bant ton="beyaz" id="sap" className="scroll-mt-12">
        <h2 className="baslik-orta mb-3 text-center">Sap Gezgini</h2>
        <p className="mx-auto mb-8 max-w-[640px] text-center text-muted">Bir gam ya da akor seç, sapta bütün konumlarını gör.</p>
        <FretboardExplorer />
      </Bant>

      <Bant ton="gri" id="dersler" className="scroll-mt-12">
        <h2 className="baslik-orta mb-8 text-center">Dersler</h2>
        <div className="mx-auto grid max-w-[1100px] gap-3 sm:grid-cols-2">
          {lessons.map((l) => (
            <Link key={l.slug} href={`/teori/${l.slug}`} className="card group p-6 transition hover:shadow-[var(--shadow-pop)]">
              <p className="text-xs font-semibold text-muted">Seviye {l.level}</p>
              <h3 className="mt-1 text-[21px] font-semibold leading-tight">{l.title}</h3>
              <p className="mt-1 text-muted">{l.summary}</p>
            </Link>
          ))}
        </div>
      </Bant>
    </div>
  );
}
