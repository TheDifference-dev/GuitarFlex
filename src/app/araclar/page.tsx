import type { Metadata } from "next";
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
        <MetinBag href="/teori#sap" buyuk>
          Sap gezgini
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
    </div>
  );
}
