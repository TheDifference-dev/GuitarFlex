"use client";

import { formatDuration, streak, totalSeconds, useProgress } from "@/lib/progress";
import { completedCount, rankFor } from "@/lib/ranks";

export function SummaryStrip() {
  const p = useProgress();
  const done = completedCount(p);
  const { current, next } = rankFor(done);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Tile label="Seri" value={`${streak(p.sessions)} gün`} />
      <Tile label="Toplam çalışma" value={formatDuration(totalSeconds(p.sessions))} />
      <Tile label="Tamamlanan" value={`${done} egzersiz`} />
      <Tile label="Rütbe" value={current.name} hint={next ? `${next.name} için ${next.min - done} egzersiz` : "Zirvedesin"} />
    </div>
  );
}

export function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-muted">
        <span>İlerleme</span>
        <span className="tabular-nums">
          {value}/{max}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
