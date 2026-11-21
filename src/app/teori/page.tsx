import type { Metadata } from "next";
import { Bant, HapBag, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import Link from "next/link";
import { THEORY } from "@/content/theory";
import FretboardExplorer from "@/components/FretboardExplorer";
import { getYol, YOLLAR, yolSayim } from "@/lib/yollar";
import UygulamaSimgesi from "@/components/site/UygulamaSimgesi";
import { kursSimgesi, yerSimgesi, yolSimgesi } from "@/lib/simge";

export const metadata: Metadata = { title: "Müzik Teorisi" };

export default async function TheoryPage() {
  const lessons = [...THEORY].sort((a, b) => a.level - b.level);
  const yollar = await Promise.all(YOLLAR.map(async (y) => ({ ...y, yol: await getYol(y.slug) })));
  return (
    <div>
      <SayfaBasi simge={yerSimgesi("teori")} kirinti={[{ label: "Müzik Teorisi" }]} baslik="Müzik Teorisi" alt="Gitarcının ihtiyaç duyduğu teori, sap üzerinde görerek.">
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
              <UygulamaSimgesi simge={yolSimgesi(y.slug)} boyut={60} className="mb-5" />
              <p className="text-xs font-semibold text-muted">{y.etiket}</p>
              <h3 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight">{y.ad}</h3>
              <p className="mt-1 text-muted">{y.yol ? yolSayim(y.yol) : "İçerik paketi gerekli"}</p>
              <span className="metin-bag mt-auto pt-4 group-hover:underline">
                Başla <span aria-hidden>›</span>
              </span>
            </Link>
          ))}
          <Link href="/calis/armoni" className="doseme group min-h-[13rem] items-start p-7 text-left">
            <UygulamaSimgesi simge={kursSimgesi("armoni")} boyut={60} className="mb-5" />
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
        <h2 className="baslik-orta mb-3 flex items-center justify-center gap-4">
          <UygulamaSimgesi simge={yerSimgesi("sap-gezgini")} boyut={44} /> Sap Gezgini
        </h2>
        <p className="mx-auto mb-8 max-w-[640px] text-center text-muted">Bir gam ya da akor seç, sapta bütün konumlarını gör.</p>
        <FretboardExplorer />
      </Bant>

      <Bant ton="gri" id="dersler" className="scroll-mt-12">
        <h2 className="baslik-orta mb-8 text-center">Dersler</h2>
        <div className="mx-auto grid max-w-[1100px] gap-3 sm:grid-cols-2">
          {lessons.map((l) => (
            <Link key={l.slug} href={`/teori/${l.slug}`} className="card group flex gap-4 p-6 transition hover:shadow-[var(--shadow-pop)]">
              <UygulamaSimgesi simge={yerSimgesi("teori-dersi")} boyut={44} />
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-muted">Seviye {l.level}</span>
                <span className="mt-1 block font-[family-name:var(--font-display)] text-[21px] font-semibold leading-tight">{l.title}</span>
                <span className="mt-1 block text-muted">{l.summary}</span>
              </span>
            </Link>
          ))}
        </div>
      </Bant>
    </div>
  );
}
