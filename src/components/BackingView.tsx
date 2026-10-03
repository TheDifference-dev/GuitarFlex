"use client";

import { useMemo, useState } from "react";
import { Lightbulb, Music } from "lucide-react";
import FretboardExplorer from "./FretboardExplorer";
import TabPlayer, { type TabSource } from "./TabPlayer";
import type { Backing } from "@/content/dogaclama";

export default function BackingView({ backing }: { backing: Backing }) {
  const source = useMemo<TabSource>(() => ({ kind: "tex", tex: backing.tex }), [backing.tex]);
  const [scale, setScale] = useState(0);
  const s = backing.scales[scale];
  return (
    <div className="space-y-6">
      <TabPlayer source={source} />
      <section className="space-y-3 rounded-2xl border border-accent/40 bg-panel p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Music size={18} className="text-accent" /> Hangi gamla çalayım?
        </h2>
        <div className="flex flex-wrap gap-2">
          {backing.scales.map((x, i) => (
            <button
              key={x.name}
              type="button"
              onClick={() => setScale(i)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${i === scale ? "border-accent bg-accent/15 text-accent" : "border-line bg-bg hover:border-accent"}`}
            >
              {x.name}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">{s.note}</p>
        <FretboardExplorer key={s.name} initialSet={s.setId} initialRoot={s.root} />
      </section>
      <section className="rounded-2xl border border-line bg-panel p-5">
        <h2 className="flex items-center gap-2 font-bold">
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
