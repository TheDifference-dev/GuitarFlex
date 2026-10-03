"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Map } from "lucide-react";
import type { SiteTexts } from "@/content/types";
import { useProgress, type Progress } from "@/lib/progress";

export type CourseSummary = {
  slug: string;
  title: string;
  description: string;
  kind: "technique" | "guide";
  image?: string;
  icon?: string;
  status?: string;
  keys: string[];
};

export function coursePercent(p: Progress, keys: string[]) {
  if (!keys.length) return 0;
  return Math.round((keys.filter((k) => p.exercises[k]?.completed).length / keys.length) * 100);
}

export default function HomeView({ texts, courses }: { texts: SiteTexts; courses: CourseSummary[] }) {
  const p = useProgress();
  const guideIcons = [BookOpen, Map];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        {/* Başlangıç rehberleri */}
        <div className="relative overflow-hidden rounded-2xl border border-accent/40 bg-gradient-to-br from-panel via-bg to-panel p-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{texts.hero.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-accent sm:text-4xl">{texts.hero.title}</h1>
          <p className="mt-2 text-muted">{texts.hero.text}</p>
          <div className="mt-6 grid gap-3 rounded-2xl border border-line bg-bg/60 p-2 sm:grid-cols-2">
            {texts.hero.guides.map((g, i) => {
              const Icon = guideIcons[i % guideIcons.length];
              return (
                <Link key={g.slug} href={`/calis/${g.slug}`} className="group flex items-center gap-4 rounded-xl border border-line bg-panel p-4 hover:border-accent">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-bg">
                    <Icon size={20} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-extrabold leading-tight">{g.title}</span>
                    <span className="mt-1 block text-xs text-muted">{g.text}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-accent">
                    {g.button} <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Akor yolu */}
        <div className="relative overflow-hidden rounded-2xl border border-accent/60 bg-gradient-to-br from-panel to-bg p-7">
          <ChordDiagram />
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-accent">{texts.chordCard.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{texts.chordCard.title}</h2>
          <p className="mt-2 max-w-[60%] text-muted">{texts.chordCard.text}</p>
          <Link
            href={`/calis/${texts.chordCard.slug}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-accent-ink shadow-lg shadow-accent/20"
          >
            {texts.chordCard.button} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Kurs kartları */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((c) => {
          const pct = coursePercent(p, c.keys);
          const disabled = !!c.status;
          const card = (
            <div className={`flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel transition ${disabled ? "opacity-70" : "hover:border-accent"}`}>
              <div className="relative h-44 overflow-hidden">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt="" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-line via-panel to-bg text-6xl opacity-80">{c.icon ?? "🎸"}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <span className="absolute right-4 top-4 flex size-12 items-center justify-center rounded-full border-2 border-white/25 bg-black/60 text-xs font-bold">
                  {pct}%
                </span>
                {disabled && (
                  <span className="absolute right-20 top-5 rounded-full bg-black/70 px-3 py-1 text-xs font-extrabold tracking-wider">YAKINDA</span>
                )}
                <h3 lang="en" className="absolute bottom-4 left-5 right-5 text-xl font-black uppercase leading-tight tracking-tight">{c.title}</h3>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="flex-1 text-sm text-muted">{c.description}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold">%{pct}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="rounded-lg border border-line bg-bg px-4 py-2 text-sm font-bold">
                    {c.kind === "guide" ? "Rehberi Aç" : "Egzersize Başla"}
                  </span>
                </div>
              </div>
            </div>
          );
          return disabled ? (
            <div key={c.slug}>{card}</div>
          ) : (
            <Link key={c.slug} href={`/calis/${c.slug}`}>
              {card}
            </Link>
          );
        })}
      </section>
    </div>
  );
}

/** Kartın sağındaki Fa majör (barre) akor diyagramı */
function ChordDiagram() {
  const strings = 6;
  const frets = 4;
  const x0 = 20;
  const y0 = 40;
  const dx = 22;
  const dy = 30;
  const dots = [
    { s: 3, f: 2, n: 2 },
    { s: 1, f: 3, n: 3 },
    { s: 2, f: 3, n: 4 },
  ];
  return (
    <svg viewBox="0 0 160 200" className="absolute right-6 top-6 h-44 w-36 opacity-90" aria-hidden>
      <text x="80" y="22" textAnchor="middle" className="fill-[var(--text)] text-[26px] font-black">F</text>
      {Array.from({ length: strings }, (_, i) => (
        <line key={`s${i}`} x1={x0 + i * dx} x2={x0 + i * dx} y1={y0} y2={y0 + frets * dy} className="stroke-[var(--muted)]" strokeWidth={1.2} />
      ))}
      {Array.from({ length: frets + 1 }, (_, i) => (
        <line key={`f${i}`} x1={x0} x2={x0 + (strings - 1) * dx} y1={y0 + i * dy} y2={y0 + i * dy} className="stroke-[var(--muted)]" strokeWidth={i === 0 ? 3 : 1.2} />
      ))}
      <rect x={x0 - 6} y={y0 + dy / 2 - 6} width={(strings - 1) * dx + 12} height={12} rx={6} className="fill-[var(--accent)]" />
      <text x={x0} y={y0 + dy / 2 + 4} textAnchor="middle" className="fill-[var(--accent-ink)] text-[9px] font-bold">1</text>
      {dots.map((d) => (
        <g key={d.n}>
          <circle cx={x0 + d.s * dx} cy={y0 + (d.f - 0.5) * dy} r={8} className="fill-[var(--accent)]" />
          <text x={x0 + d.s * dx} y={y0 + (d.f - 0.5) * dy + 3.5} textAnchor="middle" className="fill-[var(--accent-ink)] text-[10px] font-bold">
            {d.n}
          </text>
        </g>
      ))}
      {["E", "A", "D", "G", "B", "E"].map((n, i) => (
        <text key={i} x={x0 + i * dx} y={y0 + frets * dy + 18} textAnchor="middle" className="fill-[var(--muted)] text-[9px]">
          {n}
        </text>
      ))}
    </svg>
  );
}
