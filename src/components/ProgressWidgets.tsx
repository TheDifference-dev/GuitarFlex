"use client";

import Link from "next/link";
import { TECHNIQUES } from "@/content/techniques";
import type { Technique } from "@/content/types";
import { formatDuration, streak, totalSeconds, useProgress } from "@/lib/progress";
import { completedCount, rankFor, techniqueProgress } from "@/lib/ranks";

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

export function TechniqueGrid() {
  const p = useProgress();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TECHNIQUES.map((t) => {
        const { done, total } = techniqueProgress(p, t.slug);
        return (
          <Link
            key={t.slug}
            href={`/yollar/${t.slug}`}
            className="group rounded-xl border border-line bg-panel p-5 transition hover:border-accent"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-bg text-xl">{t.icon}</span>
              <div>
                <h3 className="font-semibold group-hover:text-accent">{t.name}</h3>
                <p className="text-xs text-muted">
                  {t.levels.length} seviye · {total} egzersiz
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">{t.summary}</p>
            <ProgressBar value={done} max={total} />
          </Link>
        );
      })}
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

export function LevelList({ technique }: { technique: Technique }) {
  const p = useProgress();
  return (
    <ol className="space-y-6">
      {technique.levels.map((l) => {
        const done = l.exercises.filter((e) => p.exercises[e.id]?.completed).length;
        return (
          <li key={l.level} className="rounded-xl border border-line bg-panel">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">Seviye {l.level}</p>
                <h2 className="text-lg font-semibold">{l.title}</h2>
                <p className="text-sm text-muted">{l.goal}</p>
              </div>
              <span className="text-sm tabular-nums text-muted">
                {done}/{l.exercises.length} tamamlandı
              </span>
            </div>
            <ul>
              {l.exercises.map((e) => {
                const ep = p.exercises[e.id];
                return (
                  <li key={e.id} className="border-b border-line last:border-0">
                    <Link href={`/egzersiz/${e.id}`} className="flex items-center gap-3 p-4 hover:bg-bg">
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                          ep?.completed ? "border-accent bg-accent text-accent-ink" : "border-line"
                        }`}
                      >
                        {ep?.completed ? "✓" : ""}
                      </span>
                      <span className="flex-1">
                        <span className="font-medium">{e.title}</span>
                        <span className="block text-sm text-muted">{e.description}</span>
                      </span>
                      <span className="hidden text-right text-xs text-muted sm:block">
                        Hedef {e.targetBpm} BPM
                        {ep?.bestBpm ? <span className="block">En iyi {ep.bestBpm}</span> : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
