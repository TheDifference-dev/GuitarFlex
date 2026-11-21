"use client";

import { Volume2 } from "lucide-react";
import type { DinleOrnek } from "@/content/teori/tipler";
import { akor, dizi, nota, simdi } from "@/lib/ses";
import { cal } from "@/lib/alistirma/ritim";
import { midi } from "./sema/ortak";

// Dersteki dinleme örnekleri: uygulamanın Karplus–Strong tel sesiyle (lib/ses) ve ritim çalıcısıyla (alistirma/ritim).

function oynat(o: DinleOrnek) {
  const m = (o.notalar ?? []).map(midi);
  const t0 = simdi() + 0.05;
  switch (o.tip) {
    case "dizi":
      dizi(m, t0, 0.34);
      break;
    case "akor":
      akor(m, t0);
      break;
    case "aralik":
      // Önce ayrı ayrı (ezgisel), sonra birlikte (armonik)
      m.forEach((n, i) => nota(n, t0 + i * 0.6, 1.2, 0.55));
      m.forEach((n) => nota(n, t0 + m.length * 0.6 + 0.25, 1.6, 0.45));
      break;
    case "akorlar":
      (o.akorlar ?? []).forEach((a, i) => akor(a.map(midi), t0 + i * 1.15));
      break;
    case "ritim":
      cal(o.desen ?? [["q", "q", "q", "q"]], o.bpm ?? 80, o.olcu ?? [4, 4]);
      break;
    case "metronom":
      cal(o.desen ?? [["q", "q", "q", "q"]], o.bpm ?? 60, o.olcu ?? [4, 4], false);
      break;
  }
}

export default function Dinle({ ornekler }: { ornekler: DinleOrnek[] }) {
  return (
    <div className="ders-dinle flex flex-wrap gap-2">
      {ornekler.map((o) => (
        <button key={o.ad} type="button" onClick={() => oynat(o)} className="inline-flex items-center">
          <Volume2 size={15} aria-hidden />
          {o.ad}
        </button>
      ))}
    </div>
  );
}
