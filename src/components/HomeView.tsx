"use client";

import Link from "next/link";
import { useId } from "react";
import { ArrowRight, BookOpen, Compass, Map, Mic2, Star } from "lucide-react";
import type { CourseKind, SiteTexts } from "@/content/types";
import { useProgress, type Progress } from "@/lib/progress";

export type CourseSummary = {
  slug: string;
  title: string;
  description: string;
  kind: CourseKind;
  image?: string;
  icon?: string;
  status?: string;
  keys: string[];
};

export function coursePercent(p: Progress, keys: string[]) {
  if (!keys.length) return 0;
  return Math.round((keys.filter((k) => p.exercises[k]?.completed).length / keys.length) * 100);
}

/** Teknik egzersiz merkezi: rehberler, akor yolu kartı, kurs kartları ve şarkı bağlantıları (elektro ya da akustik) */
export default function HomeView({ texts, courses, songs = "elektro" }: { texts: SiteTexts; courses: CourseSummary[]; songs?: "elektro" | "akustik" }) {
  const p = useProgress();
  const guideIcons = [BookOpen, Map];
  const songCards = songs === "akustik" ? acousticSongCards(texts.chordCard.slug) : SONG_CARDS;
  const renderCard = (c: CourseSummary) => {
    const pct = coursePercent(p, c.keys);
    const disabled = !!c.status;
    const card = (
      <div className={`card group/kart flex h-full flex-col overflow-hidden transition duration-300 ${disabled ? "opacity-70" : "hover:-translate-y-0.5 hover:border-white/15"}`}>
        <div className="relative h-44 overflow-hidden">
          {c.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.image} alt="" className="absolute inset-0 size-full object-cover transition duration-500 group-hover/kart:scale-[1.03]" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgb(255_55_95/0.25),transparent_55%),radial-gradient(circle_at_80%_90%,rgb(191_90_242/0.22),transparent_55%)] text-6xl">{c.icon ?? "🎸"}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/40 to-transparent" />
          <ProgressRing pct={pct} className="absolute right-4 top-4" />
          {disabled && (
            <span className="glass absolute right-20 top-5 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold">Yakında</span>
          )}
          <h3 lang="en" className="absolute bottom-3 left-5 right-5 text-[1.35rem] font-bold leading-tight tracking-tight">{c.title}</h3>
        </div>
        <div className="flex flex-1 flex-col px-5 pb-5 pt-2">
          <p className="flex-1 text-sm leading-relaxed text-muted">{c.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted">
                <span className="font-semibold text-text">%{pct}</span> tamamlandı
              </p>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="bar-grad h-full rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span className="btn-soft px-4 py-2 text-sm">
              {c.kind === "guide" || c.slug.endsWith("-rehberi") ? "Rehberi Aç" : "Başla"}
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
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        {/* Başlangıç rehberleri */}
        <div className="card relative overflow-hidden p-7 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(255_55_95/0.22),transparent_65%)]" />
          <p className="eyebrow">{texts.hero.eyebrow}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{texts.hero.title}</h1>
          <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-muted">{texts.hero.text}</p>
          <div className={`mt-7 grid gap-3 ${texts.hero.guides.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {texts.hero.guides.map((g, i) => {
              const Icon = guideIcons[i % guideIcons.length];
              return (
                <Link key={g.slug} href={`/calis/${g.slug}`} className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 transition hover:bg-white/[0.08]">
                  <span className="ring-grad flex size-11 shrink-0">
                    <span className="flex size-full items-center justify-center rounded-full bg-panel">
                      <Icon size={19} />
                    </span>
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold leading-tight">{g.title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted">{g.text}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-accent">
                    {g.button} <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Akor yolu */}
        <div className="card relative overflow-hidden p-7 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full bg-[radial-gradient(circle,rgb(191_90_242/0.2),transparent_65%)]" />
          <ChordDiagram />
          <p className="eyebrow mt-10">{texts.chordCard.eyebrow}</p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight">{texts.chordCard.title}</h2>
          <p className="mt-3 max-w-[60%] text-[17px] leading-relaxed text-muted">{texts.chordCard.text}</p>
          <Link href={`/calis/${texts.chordCard.slug}`} className="btn-grad mt-7 px-6 py-3 text-[15px]">
            {texts.chordCard.button} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Kurs kartları */}
      {courses.length > 0 ? (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{courses.map(renderCard)}</section>
      ) : (
        <p className="rounded-3xl border border-dashed border-line p-6 text-sm text-muted">Bu bölümün kursları yakında eklenecek.</p>
      )}

      {/* Şarkı ve Sololar */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">{songs === "akustik" ? "Şarkılar" : "Şarkı ve Sololar"}</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {songCards.map(({ href, title, text, icon: Icon }) => (
            <Link key={href} href={href} className="card group flex gap-4 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/15">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[image:var(--grad)] text-white shadow-[0_8px_20px_-8px_rgb(255_55_95/0.6)]">
                <Icon size={22} />
              </span>
              <span>
                <span className="flex items-center gap-1 text-lg font-semibold">
                  {title} <ArrowRight size={16} className="opacity-0 transition group-hover:opacity-100" />
                </span>
                <span className="mt-1 block text-sm text-muted">{text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

const SONG_CARDS = [
  { href: "/sarkilar", title: "Popüler Şarkılar", text: "Ünlü şarkı ve sololar zorluğa göre; tablar Songsterr'de açılır.", icon: Star },
  { href: "/oynatici", title: "Tabla Keşfet", text: "Kendi Guitar Pro arşivini ve örnek şarkıları çok kanallı oynatıcıda çal.", icon: Compass },
  { href: "/sarkilar/dogaclama", title: "Doğaçlama Çal", text: "Davul, bas ve gitar eşliğinde önerilen gamlarla solo çal.", icon: Mic2 },
];

const acousticSongCards = (chordSlug: string) => [
  { href: "/akustik/sarkilar", title: "Akustik Şarkılar", text: "Akorlarla çalınan şarkılar zorluğa göre; tablar Songsterr'de açılır.", icon: Star },
  { href: `/calis/${chordSlug}`, title: "Akorları Çal", text: "Şarkılara hazırlık: akorlar, geçişler ve ritim kalıpları.", icon: Compass },
];

/** Instagram hikâye halkası gibi ilerleme halkası: dolu kısım gradyan, yüzde ortada */
function ProgressRing({ pct, className = "" }: { pct: number; className?: string }) {
  const id = useId();
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <span className={`glass flex size-12 items-center justify-center rounded-full ${className}`} title={`%${pct} tamamlandı`}>
      <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff9f0a" />
            <stop offset="50%" stopColor="#ff375f" />
            <stop offset="100%" stopColor="#bf5af2" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgb(255 255 255 / 0.14)" strokeWidth="3" />
        {pct > 0 && <circle cx="24" cy="24" r={r} fill="none" stroke={`url(#${id})`} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} />}
      </svg>
      <span className="relative text-[11px] font-semibold tabular-nums">{pct}%</span>
    </span>
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
      <text x="80" y="22" textAnchor="middle" className="fill-[var(--text)] text-[26px] font-semibold">F</text>
      {Array.from({ length: strings }, (_, i) => (
        <line key={`s${i}`} x1={x0 + i * dx} x2={x0 + i * dx} y1={y0} y2={y0 + frets * dy} className="stroke-[var(--muted)]" strokeWidth={1.2} />
      ))}
      {Array.from({ length: frets + 1 }, (_, i) => (
        <line key={`f${i}`} x1={x0} x2={x0 + (strings - 1) * dx} y1={y0 + i * dy} y2={y0 + i * dy} className="stroke-[var(--muted)]" strokeWidth={i === 0 ? 3 : 1.2} />
      ))}
      <rect x={x0 - 6} y={y0 + dy / 2 - 6} width={(strings - 1) * dx + 12} height={12} rx={6} className="fill-[var(--accent)]" />
      <text x={x0} y={y0 + dy / 2 + 4} textAnchor="middle" className="fill-[var(--accent-ink)] text-[9px] font-semibold">1</text>
      {dots.map((d) => (
        <g key={d.n}>
          <circle cx={x0 + d.s * dx} cy={y0 + (d.f - 0.5) * dy} r={8} className="fill-[var(--accent)]" />
          <text x={x0 + d.s * dx} y={y0 + (d.f - 0.5) * dy + 3.5} textAnchor="middle" className="fill-[var(--accent-ink)] text-[10px] font-semibold">
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
