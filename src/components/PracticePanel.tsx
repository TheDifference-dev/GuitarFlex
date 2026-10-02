"use client";

import { useEffect, useMemo, useState } from "react";
import TabPlayer, { type TabSource } from "./TabPlayer";
import { formatDuration, logPractice, setCompleted, useProgress } from "@/lib/progress";

type Props = {
  exerciseId: string;
  tex: string;
  startBpm: number;
  targetBpm: number;
};

/** Tab oynatıcı + çalışma süresi sayacı + kayıt. Çalma süresi otomatik sayılır. */
export default function PracticePanel({ exerciseId, tex, startBpm, targetBpm }: Props) {
  const progress = useProgress();
  const mine = progress.exercises[exerciseId];
  const [bpm, setBpm] = useState(startBpm);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [saved, setSaved] = useState<string | null>(null);
  const source = useMemo<TabSource>(() => ({ kind: "tex", tex }), [tex]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const save = () => {
    if (seconds < 5) return;
    const reached = bpm >= targetBpm;
    logPractice(exerciseId, seconds, bpm, reached);
    setSaved(reached ? `Hedefe ulaştın! ${bpm} BPM kaydedildi.` : `${formatDuration(seconds)} çalışma, ${bpm} BPM kaydedildi.`);
    setSeconds(0);
    setRunning(false);
  };

  const pct = Math.min(100, Math.round(((mine?.bestBpm ?? 0) / targetBpm) * 100));

  return (
    <div className="space-y-4">
      <TabPlayer source={source} compact onBpmChange={setBpm} onPlayingChange={setRunning} />

      <div className="grid gap-4 rounded-xl border border-line bg-panel p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Bu oturum</p>
          <p className="text-2xl font-semibold tabular-nums">{formatDuration(seconds)}</p>
          <div className="mt-2 flex gap-2 text-sm">
            <button type="button" onClick={() => setRunning((r) => !r)} className="rounded-md border border-line px-2 py-1">
              {running ? "Sayacı durdur" : "Sayacı başlat"}
            </button>
            <button type="button" onClick={save} disabled={seconds < 5} className="rounded-md bg-accent px-2 py-1 font-semibold text-accent-ink disabled:opacity-40">
              Kaydet
            </button>
          </div>
          {saved && <p className="mt-2 text-sm text-accent">{saved}</p>}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Tempo hedefi</p>
          <p className="text-2xl font-semibold tabular-nums">
            {mine?.bestBpm ?? 0} <span className="text-base text-muted">/ {targetBpm} BPM</span>
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Durum</p>
          <label className="mt-1 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={mine?.completed ?? false}
              onChange={(e) => setCompleted(exerciseId, e.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            Tamamlandı
          </label>
          <p className="mt-2 text-sm text-muted">Toplam: {formatDuration(mine?.totalSeconds ?? 0)}</p>
        </div>
      </div>
    </div>
  );
}
