"use client";

import { useEffect, useMemo, useState } from "react";
import { Lightbulb, Music } from "lucide-react";
import FretboardExplorer from "./FretboardExplorer";
import TabPlayer, { type TabSource } from "./TabPlayer";
import type { Backing } from "@/content/dogaclama";
import { addPracticeTime } from "@/lib/progress";
import { SERBEST } from "@/lib/oyun";

export default function BackingView({ backing }: { backing: Backing }) {
  const source = useMemo<TabSource>(() => ({ kind: "tex", tex: backing.tex }), [backing.tex]);
  const [scale, setScale] = useState(0);
  const s = backing.scales[scale];
  // Eşlik çalarken geçen süre "Serbest Çalışma" görevine yazılır (5 sn'de bir)
  const [caliyor, setCaliyor] = useState(false);
  useEffect(() => {
    if (!caliyor) return;
    let bekleyen = 0;
    const id = window.setInterval(() => {
      if (++bekleyen >= 5) {
        addPracticeTime(`${SERBEST}eslik/${backing.slug}`, bekleyen, backing.bpm, Number.MAX_SAFE_INTEGER);
        bekleyen = 0;
      }
    }, 1000);
    return () => {
      window.clearInterval(id);
      if (bekleyen) addPracticeTime(`${SERBEST}eslik/${backing.slug}`, bekleyen, backing.bpm, Number.MAX_SAFE_INTEGER);
    };
  }, [caliyor, backing.slug, backing.bpm]);
  return (
    <div className="space-y-6">
      <TabPlayer source={source} onPlayingChange={setCaliyor} />
      <section className="space-y-3 card p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Music size={18} className="text-accent" /> Hangi gamla çalayım?
        </h2>
        <div className="flex flex-wrap gap-2">
          {backing.scales.map((x, i) => (
            <button
              key={x.name}
              type="button"
              onClick={() => setScale(i)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${i === scale ? "border-accent bg-accent/15 text-accent" : "border-white/10 bg-white/[0.05] hover:bg-white/10"}`}
            >
              {x.name}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">{s.note}</p>
        <FretboardExplorer key={s.name} initialSet={s.setId} initialRoot={s.root} />
      </section>
      <section className="card p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Lightbulb size={18} className="text-accent" /> İpuçları
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          {backing.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
          <li>Oynatıcıda Döngü açıkken kayıt sürekli tekrar eder; hız ayarıyla tempoyu düşürebilirsin.</li>
        </ul>
      </section>
    </div>
  );
}
