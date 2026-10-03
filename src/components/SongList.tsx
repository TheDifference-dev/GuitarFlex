"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { LEVEL_NAMES, songUrl, type PopularSong, type SongLevel } from "@/content/sarkilar";

type Props = { songs: PopularSong[]; courseTitles: Record<string, string> };
const LEVEL_STYLE: Record<SongLevel, string> = {
  1: "border-emerald-400/50 text-emerald-300",
  2: "border-accent/60 text-accent",
  3: "border-rose-400/60 text-rose-300",
};

export default function SongList({ songs, courseTitles }: Props) {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<SongLevel | 0>(0);
  const [kind, setKind] = useState<PopularSong["kind"] | "">("");
  const [course, setCourse] = useState("");

  const shown = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    return songs.filter(
      (s) =>
        (!level || s.level === level) &&
        (!kind || s.kind === kind) &&
        (!course || s.courses?.includes(course)) &&
        (!needle || `${s.title} ${s.artist} ${s.tags.join(" ")}`.toLocaleLowerCase("tr").includes(needle)),
    );
  }, [songs, q, level, kind, course]);

  const chip = (active: boolean) =>
    `rounded-lg border px-3 py-1.5 text-sm font-semibold ${active ? "border-accent bg-accent/15 text-accent" : "border-line bg-panel hover:border-accent"}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-60 flex-1 items-center gap-2 rounded-lg border border-line bg-panel px-3 py-1.5">
          <Search size={16} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Şarkı, sanatçı ya da teknik ara…" className="w-full bg-transparent text-sm outline-none" />
        </label>
        {([0, 1, 2, 3] as const).map((l) => (
          <button key={l} type="button" className={chip(level === l)} onClick={() => setLevel(l)}>
            {l ? LEVEL_NAMES[l] : "Tümü"}
          </button>
        ))}
        <span className="mx-1 h-6 w-px bg-line" />
        {(["", "şarkı", "solo", "riff"] as const).map((k) => (
          <button key={k || "hepsi"} type="button" className={chip(kind === k)} onClick={() => setKind(k)}>
            {k ? k[0].toLocaleUpperCase("tr") + k.slice(1) : "Hepsi"}
          </button>
        ))}
        <select value={course} onChange={(e) => setCourse(e.target.value)} className="rounded-lg border border-line bg-panel px-3 py-1.5 text-sm">
          <option value="">Bütün teknikler</option>
          {Object.entries(courseTitles).filter(([slug]) => songs.some((s) => s.courses?.includes(slug))).map(([slug, title]) => (
            <option key={slug} value={slug}>
              {title}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted">{shown.length} şarkı · Tablar Songsterr&apos;de açılır.</p>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((s) => (
          <article key={`${s.artist}-${s.title}-${s.kind}`} className="flex flex-col rounded-2xl border border-line bg-panel p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold leading-tight">{s.title}</h3>
                <p className="text-sm text-muted">{s.artist}</p>
              </div>
              <span className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold ${LEVEL_STYLE[s.level]}`}>{LEVEL_NAMES[s.level]}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-bg px-2 py-0.5 text-xs font-semibold uppercase text-accent">{s.kind}</span>
              {s.tags.map((t) => (
                <span key={t} className="rounded-md bg-bg px-2 py-0.5 text-xs text-muted">
                  {t}
                </span>
              ))}
            </div>
            {!!s.courses?.length && (
              <p className="mt-3 text-xs text-muted">
                Hazırlık:{" "}
                {s.courses.map((c, i) => (
                  <span key={c}>
                    {i > 0 && ", "}
                    <Link href={`/calis/${c}`} className="font-semibold text-text hover:text-accent">
                      {courseTitles[c] ?? c}
                    </Link>
                  </span>
                ))}
              </p>
            )}
            <div className="flex-1" />
            <a
              href={songUrl(s)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 self-stretch rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-ink hover:brightness-110"
            >
              Songsterr&apos;de Aç <ExternalLink size={15} />
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
