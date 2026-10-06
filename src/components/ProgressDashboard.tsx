"use client";

import Link from "next/link";
import { formatDuration, resetProgress, useProgress } from "@/lib/progress";
import { RANKS, badges, completedCount, keysProgress, rankFor } from "@/lib/ranks";
import { ProgressBar, SummaryStrip } from "./ProgressWidgets";
import OyunPaneli from "./OyunPaneli";
import type { KursYapisi, OyunVeri } from "@/lib/oyun";

const DAYS = 35;

export type CourseInfo = { slug: string; title: string; icon?: string; keys: string[]; titles: Record<string, string> };

export default function ProgressDashboard({ courses, oyun, kurslar = [] }: { courses: CourseInfo[]; oyun?: OyunVeri; kurslar?: KursYapisi[] }) {
  const p = useProgress();
  const done = completedCount(p);
  const { current, next } = rankFor(done);
  const byDay = new Map<string, number>();
  for (const s of p.sessions) byDay.set(s.date, (byDay.get(s.date) ?? 0) + s.seconds);

  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (DAYS - 1 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { key, seconds: byDay.get(key) ?? 0 };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.seconds));
  const recent = [...p.sessions].reverse().slice(0, 10);
  const serbest = (key: string) => key.startsWith("serbest:eslik/") && key.slice("serbest:eslik/".length);
  const titleOf = (key: string) => (serbest(key) ? `Doğaçlama · ${serbest(key)}` : (courses.find((c) => c.titles[key])?.titles[key] ?? key));
  const hrefOf = (key: string) =>
    serbest(key) ? `/sarkilar/dogaclama/${serbest(key)}` : `/calis/${key.split("/")[0]}/${encodeURIComponent(key.split("/").slice(1).join("/"))}`;

  return (
    <div className="space-y-8">
      {oyun ? <OyunPaneli oyun={oyun} kurslar={kurslar} /> : <SummaryStrip />}

      {oyun ? null : (
        <section className="card p-5">
          <h2 className="font-semibold">Rütbe yolu</h2>
          <ol className="mt-4 flex flex-wrap gap-2">
            {RANKS.map((r) => (
              <li
                key={r.name}
                className={`rounded-full border px-3 py-1 text-sm ${
                  r === current ? "border-transparent bg-[image:var(--grad)] text-white" : done >= r.min ? "border-accent/50 text-accent" : "border-line text-muted"
                }`}
              >
                {r.name} <span className="opacity-70">({r.min})</span>
              </li>
            ))}
          </ol>
          {next && <ProgressBar value={done - current.min} max={next.min - current.min} />}
        </section>
      )}

      <section className="card p-5">
        <h2 className="font-semibold">Son {DAYS} gün</h2>
        <div className="mt-4 grid grid-cols-7 gap-1.5 sm:grid-cols-[repeat(35,minmax(0,1fr))]">
          {days.map((d) => (
            <div
              key={d.key}
              title={`${d.key}: ${formatDuration(d.seconds)}`}
              className="aspect-square rounded-sm bg-line"
              style={d.seconds ? { background: "var(--accent)", opacity: 0.3 + 0.7 * (d.seconds / maxDay) } : undefined}
            />
          ))}
        </div>
      </section>

      {oyun ? null : (
        <section>
          <h2 className="mb-3 font-semibold">Rozetler</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {badges(p, courses).map((b) => (
              <div key={b.id} className={`flex gap-3 card p-4 ${b.earned ? "" : "opacity-40 grayscale"}`}>
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="font-semibold">{b.title}</p>
                  <p className="text-sm text-muted">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-semibold">Kurslar</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((t) => {
            const { done: d, total } = keysProgress(p, t.keys);
            return (
              <Link key={t.slug} href={`/calis/${t.slug}`} className="card p-4 hover:border-white/20">
                <p className="font-medium">
                  {t.icon} {t.title}
                </p>
                <ProgressBar value={d} max={total} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Son çalışmalar</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Henüz kayıt yok. Bir egzersiz açıp çalışmaya başla.</p>
        ) : (
          <ul className="mt-2 divide-y divide-[var(--line)] text-sm">
            {recent.map((s, i) => (
              <li key={i} className="flex justify-between gap-4 py-2">
                <Link href={hrefOf(s.exerciseId)} className="hover:text-accent">
                  {titleOf(s.exerciseId)}
                </Link>
                <span className="text-muted tabular-nums">
                  {s.date} · {formatDuration(s.seconds)} · {s.bpm} BPM
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={() => window.confirm("Tüm ilerleme silinsin mi?") && resetProgress()}
        className="text-sm text-muted underline hover:text-accent"
      >
        İlerlemeyi sıfırla
      </button>
    </div>
  );
}
