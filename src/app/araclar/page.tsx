import type { Metadata } from "next";
import Link from "next/link";
import { Bant, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import Metronome from "@/components/Metronome";
import NoteQuiz from "@/components/NoteQuiz";
import UygulamaSimgesi from "@/components/site/UygulamaSimgesi";
import { yerSimgesi } from "@/lib/simge";

export const metadata: Metadata = { title: "Araçlar" };

export default function ToolsPage() {
  return (
    <div>
      <SayfaBasi simge={yerSimgesi("araclar")} kirinti={[{ label: "Araçlar" }]} baslik="Araçlar" alt="Her gün birkaç dakika: tempoyu tut, sapı ezberle.">
        <MetinBag href="#metronom" buyuk>
          Metronom
        </MetinBag>
        <MetinBag href="#nota-testi" buyuk>
          Nota bulma testi
        </MetinBag>
        <MetinBag href="/sap-gezgini" buyuk>
          Sap gezgini
        </MetinBag>
        <MetinBag href="/kutuphane" buyuk>
          Tab oynatıcı ve dosyalarım
        </MetinBag>
      </SayfaBasi>

      <Bant ton="gri">
        <section className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div id="metronom" className="scroll-mt-20 space-y-4">
            <h2 className="baslik-orta flex items-center gap-4">
              <UygulamaSimgesi simge={yerSimgesi("metronom")} boyut={44} /> Metronom
            </h2>
            <Metronome />
          </div>
          <div id="nota-testi" className="scroll-mt-20 space-y-4">
            <h2 className="baslik-orta flex items-center gap-4">
              <UygulamaSimgesi simge={yerSimgesi("nota-testi")} boyut={44} /> Nota Bulma Testi
            </h2>
            <p className="text-muted">60 saniyede sapta işaretlenen notaları bul. 12. perdeye kadar tüm teller.</p>
            <NoteQuiz />
          </div>
        </section>
      </Bant>
      <Bant ton="beyaz">
        <ul className="mx-auto grid max-w-[1100px] gap-3 sm:grid-cols-3">
          {[
            { href: "/sap-gezgini", ad: "Sap Gezgini", not: "Bütün modlar, pentatonik kutuları, armonik ve melodik minör: notalarıyla sapta.", simge: yerSimgesi("sap-gezgini") },
            { href: "/kutuphane", ad: "Tab Oynatıcı ve Dosyalarım", not: "GuitarFlex'in çalınabilir çok track'li parçaları ve kendi Guitar Pro dosyaların.", simge: yerSimgesi("kutuphane") },
            { href: "/oynatici", ad: "Tabla Keşfet", not: "Herhangi bir tab dosyasını aç, mikserle çal.", simge: yerSimgesi("oynatici") },
          ].map((x) => (
            <li key={x.href}>
              <Link href={x.href} data-renk={x.simge.renk} className="card renkli-kart yukselen flex h-full items-center gap-4 p-5 pt-6">
                <UygulamaSimgesi simge={x.simge} boyut={60} />
                <span className="min-w-0">
                  <span className="block text-[19px] font-semibold leading-tight">{x.ad}</span>
                  <span className="mt-1 block text-sm text-muted">{x.not}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Bant>
    </div>
  );
}
