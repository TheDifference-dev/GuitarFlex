"use client";

import { useState } from "react";
import Fretboard from "./Fretboard";
import { ALL_SETS, CHORD_TYPES, NOTES, SCALES, SOLFEGE } from "@/lib/music";

type Props = { initialSet?: string; initialRoot?: number };

export default function FretboardExplorer({ initialSet = "minor-penta", initialRoot = 9 }: Props) {
  const [root, setRoot] = useState(initialRoot);
  const [setId, setSetId] = useState(initialSet);
  const [label, setLabel] = useState<"note" | "interval">("note");
  const [solfege, setSolfege] = useState(false);
  const set = ALL_SETS.find((s) => s.id === setId) ?? SCALES[0];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <select value={root} onChange={(e) => setRoot(Number(e.target.value))} className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1.5">
          {NOTES.map((n, i) => (
            <option key={n} value={i}>
              {n} ({SOLFEGE[i]})
            </option>
          ))}
        </select>
        <select value={setId} onChange={(e) => setSetId(e.target.value)} className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1.5">
          <optgroup label="Gamlar">
            {SCALES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Akorlar">
            {CHORD_TYPES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </optgroup>
        </select>
        <div className="flex gap-0.5 rounded-full border border-white/[0.08] bg-white/[0.05] p-0.5">
          {(["note", "interval"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLabel(l)}
              className={`rounded-full px-3 py-1 transition ${label === l ? "bg-white/[0.14] text-text shadow-[0_1px_2px_rgb(0_0_0/0.5)]" : "text-muted hover:text-text"}`}
            >
              {l === "note" ? "Nota" : "Aralık"}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={solfege} onChange={(e) => setSolfege(e.target.checked)} className="accent-[var(--accent)]" />
          Do-Re-Mi
        </label>
        <span className="text-muted">Notaya tıkla, sesini duy.</span>
      </div>
      <Fretboard set={set} root={root} label={label} solfege={solfege} />
      <p className="text-sm text-muted">
        <span className="font-semibold text-[var(--text)]">
          {NOTES[root]} {set.name}
        </span>{" "}
        · formül: {set.intervals.map((i) => ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"][i]).join(" – ")}
      </p>
    </div>
  );
}
