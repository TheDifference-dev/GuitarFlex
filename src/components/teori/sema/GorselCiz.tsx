"use client";

import type { Gorsel } from "@/content/teori/tipler";
import Porte from "@/components/yol/Porte";
import RitimYazi from "@/components/yol/RitimYazi";
import AkorSemasi from "@/components/yol/AkorSemasi";
import SapKesiti from "./SapKesiti";
import AkorSekli from "./AkorSekli";
import AdimSeridi from "./AdimSeridi";
import PiyanoKlavye from "./PiyanoKlavye";
import BesliCemberi from "./BesliCemberi";
import RitimAgaci from "./RitimAgaci";
import TabSeridi from "./TabSeridi";
import VurguCizelgesi from "./VurguCizelgesi";
import TempoCizgisi from "./TempoCizgisi";
import AkisSemasi from "./AkisSemasi";

// Ders görselleri: veri türüne göre doğru SVG bileşeni, numaralı şekil yazısıyla.

function Ciz({ g }: { g: Gorsel }) {
  switch (g.tur) {
    case "sap":
      return <SapKesiti g={g} />;
    case "akorlar":
      return (
        <div className="akor-izgara grid grid-cols-[repeat(auto-fill,minmax(118px,1fr))] gap-x-2 gap-y-1">
          {g.akorlar.map((a) => (
            <AkorSekli key={a.ad + a.sekil} a={a} />
          ))}
        </div>
      );
    case "adim":
      return <AdimSeridi g={g} />;
    case "piyano":
      return <PiyanoKlavye g={g} />;
    case "cember":
      return <BesliCemberi g={g} />;
    case "porte":
      return (
        <div className="porte-kap">
          <Porte porte={g.porte} />
          {g.etiketler || g.konumlar ? (
            <p className="porte-etiket mt-1 text-[13px] text-muted">
              {g.porte.notalar
                .map((_, i) => [g.etiketler?.[i], g.konumlar?.[i] ? `${g.konumlar[i]!.t}/${g.konumlar[i]!.p}` : ""].filter(Boolean).join(" "))
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
        </div>
      );
    case "ritim":
      return (
        <div>
          <RitimYazi desen={g.desen} olcu={g.olcu} />
          {g.sayim ? <p className="mt-1 font-mono text-[13px] text-muted">{g.sayim}</p> : null}
        </div>
      );
    case "agac":
      return <RitimAgaci g={g} />;
    case "tab":
      return <TabSeridi g={g} />;
    case "sema":
      return <AkorSemasi sema={g.sema} />;
    case "vurgu":
      return <VurguCizelgesi g={g} />;
    case "tempo":
      return <TempoCizgisi g={g} />;
    case "akis":
      return <AkisSemasi g={g} />;
  }
}

export default function GorselCiz({ g, no, ekran }: { g: Gorsel; no: number; ekran?: boolean }) {
  // Yazdırmada iki sütuna sığmayacak kadar geniş görseller sayfa genişliğinde (column-span) basılır
  const genis =
    ("genis" in g && g.genis) ||
    g.tur === "sema" ||
    (g.tur === "sap" && g.perde[1] - g.perde[0] > 7) ||
    (g.tur === "porte" && g.porte.notalar.length > 10) ||
    (g.tur === "tab" && g.kolonlar.length > 12) ||
    (g.tur === "ritim" && g.desen.length * (g.olcu?.[0] ?? 4) > 6);
  return (
    <figure data-tur={g.tur} className={`ders-sekil space-y-2 ${genis ? "ders-genis" : ""} ${ekran ? "ders-ekran" : ""}`}>
      <Ciz g={g} />
      <figcaption className="text-[14px] leading-snug text-muted">
        <span className="font-semibold text-[var(--text)]">Şekil {no}.</span> {g.baslik}
        {g.not ? <> — {g.not}</> : null}
      </figcaption>
    </figure>
  );
}
