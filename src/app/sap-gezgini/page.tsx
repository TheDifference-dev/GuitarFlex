import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Bant, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import SapGezgini from "@/components/teori/SapGezgini";
import SapGezginiUrl from "@/components/teori/SapGezginiUrl";
import { yerSimgesi } from "@/lib/simge";
import { GAMLAR, GRUP_ADI, type GamGrup } from "@/lib/gamlar";

export const metadata: Metadata = { title: "Sap Gezgini" };

/** Serbest çalışma için: bütün modlar, pentatonik kutuları, minör aileleri ve simetrik gamlar notalarıyla sapta */
export default function SapGezginiPage() {
  const gruplar = Object.keys(GRUP_ADI) as GamGrup[];
  return (
    <div>
      <SayfaBasi
        simge={yerSimgesi("sap-gezgini")}
        kirinti={[{ href: "/teori", label: "Müzik Teorisi" }, { label: "Sap Gezgini" }]}
        baslik="Sap Gezgini"
        alt="Bir kök ve gam seç; bütün notaları sapta gör. Pentatoniklerde 5 kutu, yedi notalı gamlarda 7 kalıp."
      >
        <MetinBag href="/teori/modlar" buyuk>
          Modlar dersi
        </MetinBag>
        <MetinBag href="/teori" buyuk>
          Müzik Teorisi
        </MetinBag>
      </SayfaBasi>
      <Bant ton="gri" className="pt-10">
        <div className="mx-auto max-w-[1100px] space-y-8">
          <div className="card p-4 sm:p-6">
            <Suspense fallback={<SapGezgini />}>
              <SapGezginiUrl />
            </Suspense>
          </div>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Gam listesi">
            {gruplar.map((gr) => (
              <div key={gr} className="card p-5">
                <h2 className="text-[17px] font-semibold">{GRUP_ADI[gr]}</h2>
                <ul className="mt-2 space-y-1 text-sm">
                  {GAMLAR.filter((g) => g.grup === gr).map((g) => (
                    <li key={g.id}>
                      <Link href={`/sap-gezgini?gam=${g.id}&kok=${gr === "akorlar" || gr === "major-modlar" ? "C" : "A"}`} className="metin-bag">
                        {g.ad}
                      </Link>{" "}
                      <span className="text-muted">{g.formul.replace(/bb/g, "𝄫").replace(/b/g, "♭").replace(/#/g, "♯")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </div>
      </Bant>
    </div>
  );
}
