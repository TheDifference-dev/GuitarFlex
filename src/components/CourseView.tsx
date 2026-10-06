"use client";

import Link from "next/link";
import { useState } from "react";
import { BookText, ChevronDown, FileText, ListChecks, ListVideo, Lock, PlayCircle, Sparkles } from "lucide-react";
import type { Course, Lesson, Section } from "@/content/types";
import { lessonKey } from "@/content/courses";
import { useProgress, type Progress, type StepProgress } from "@/lib/progress";

export function formatClock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Ders tamamlandı mı: pratik kartında adım geçilmiş olmalı, diğerlerinde çalışma süresi dolmuş */
const lessonDone = (p: Progress, course: Course, l: Lesson) =>
  l.practice ? Boolean(p.steps[`${l.practice.yol}/${l.practice.kod}`]?.passed) : Boolean(p.exercises[lessonKey(course.slug, l.id)]?.completed);

function sectionDone(p: Progress, course: Course, s: Section) {
  const lessons = s.chapters.flatMap((c) => c.lessons);
  return lessons.length > 0 && lessons.every((l) => lessonDone(p, course, l));
}

/** Bölüm sonundaki sınav satırı: sınavın adı ve kademelerin BPM eşikleri (Altın I · Platin I · Elmas I · Usta) */
function ExamRow({ section: s }: { section: Section }) {
  const tiers = s.examTiers ?? [];
  return (
    <div className="mt-1.5 rounded-xl bg-white/[0.04] px-2.5 py-2 text-xs" title="Sınava girmek istediğin kademeyi ve BPM'i seç">
      <span className="flex items-center gap-1.5 font-semibold text-accent">
        <Sparkles size={12} className="shrink-0" /> {s.examName ?? "Sınav"}
      </span>
      {!!tiers.length && (
        <span className="mt-1 flex flex-wrap gap-1">
          {tiers.map((bpm, i) => (
            <span key={i} className="rounded-full bg-white/[0.06] px-2 py-0.5 font-medium tabular-nums text-muted">
              {s.examTierNames?.[i] ? `${s.examTierNames[i]} ` : ""}
              <span className="text-text">{bpm}</span>
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

export default function CourseView({ course, image }: { course: Course; image?: string }) {
  const p = useProgress();
  const [tab, setTab] = useState<"egzersiz" | "rehber">("egzersiz");
  const firstOpen = course.sections.findIndex((s) => !sectionDone(p, course, s));
  const [selected, setSelected] = useState<number | null>(null);
  const current = course.sections[selected ?? Math.max(0, firstOpen)] ?? course.sections[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Sol panel */}
      <aside className="h-fit space-y-4 card p-3 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">
        <div className="grid grid-cols-2 gap-1 rounded-full border border-white/[0.08] bg-white/[0.05] p-1">
          {(
            [
              ["egzersiz", "Egzersiz", FileText],
              ["rehber", "Rehber", BookText],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition ${tab === id ? "bg-white/[0.14] text-text shadow-[0_1px_2px_rgb(0_0_0/0.5)]" : "text-muted hover:text-text"}`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {!!course.videos?.length && (
          <div>
            <p className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold text-muted">
              <ListVideo size={14} /> Eğitim Videoları
            </p>
            {course.videos.map((v, i) => (
              <a
                key={v.title}
                href={v.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-lg px-1 py-2 text-sm hover:bg-bg"
              >
                <span className="w-4 text-center text-xs text-muted">{i + 1}</span>
                <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md bg-bg">
                  <PlayCircle size={18} className="text-accent" />
                </span>
                <span className="leading-tight">
                  <span className="block font-semibold">{v.title}</span>
                  {v.channel && <span className="text-xs text-muted">{v.channel}</span>}
                </span>
              </a>
            ))}
          </div>
        )}

        <div>
          <p className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold text-muted">
            <FileText size={14} /> Bölümler
          </p>
          <div className="space-y-2">
            {course.sections.map((s, si) => {
              const locked = si > 0 && !sectionDone(p, course, course.sections[si - 1]);
              const active = s === current;
              return (
                <div key={s.number} className={active ? "rounded-2xl bg-white/[0.05]" : ""}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(si);
                      setTab("egzersiz");
                    }}
                    className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm font-semibold ${active ? "text-accent" : locked ? "text-muted" : ""}`}
                  >
                    {locked ? (
                      <Lock size={14} className="shrink-0" />
                    ) : (
                      <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] ${active ? "bg-[image:var(--grad)] text-white" : "bg-white/10 text-text"}`}>{s.number}</span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate">
                        Bölüm {s.number} – {s.title}
                      </span>
                      {s.level && <span className="block truncate text-[11px] font-semibold text-muted">{s.level}</span>}
                    </span>
                  </button>
                  <div className="space-y-0.5 pb-2 pl-3 pr-2">
                    {s.chapters.map((c) => {
                      const done = c.lessons.every((l) => lessonDone(p, course, l));
                      return (
                        <a
                          key={c.code}
                          href={`#bolum-${c.code}`}
                          onClick={() => setSelected(si)}
                          className={`flex items-center gap-2 rounded-lg px-2 py-1 text-xs transition ${done ? "text-emerald-400" : locked ? "text-muted" : "text-text/90"} hover:bg-white/[0.06]`}
                        >
                          <span className="w-7 shrink-0 font-semibold">{c.code}</span>
                          <span className="flex-1 truncate">{c.title}</span>
                          <span className="shrink-0 text-muted">{c.lessons.length} ders</span>
                        </a>
                      );
                    })}
                    {(s.exam || !!s.examTiers?.length) && <ExamRow section={s} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Ana alan */}
      <div className="min-w-0 space-y-8">
        <header className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>
          <ChevronDown size={18} className="text-accent" />
          <span className="text-sm text-muted">· Bölüm {current.number} – {current.title}</span>
        </header>

        {tab === "rehber" ? (
          <article className="card max-w-3xl space-y-3 p-6 leading-relaxed sm:p-8">
            {(course.guide?.length ? course.guide : [course.description]).map((para, i) =>
              para.startsWith("## ") ? (
                <h2 key={i} className="pt-2 text-xl font-semibold">
                  {para.slice(3)}
                </h2>
              ) : (
                <p key={i} className="text-muted">
                  {para}
                </p>
              ),
            )}
          </article>
        ) : (
          current.chapters.map((c) => {
            const total = Math.round(c.lessons.reduce((sum, l) => sum + l.minutes, 0) * 10) / 10;
            return (
              <section key={c.code} id={`bolum-${c.code}`} className="scroll-mt-24 space-y-4">
                <div className="flex items-center gap-3 border-b border-line/70 pb-3">
                  <span className="rounded-full bg-accent/15 px-3 py-0.5 text-xs font-semibold text-accent">{c.code}</span>
                  <h2 className="flex-1 text-lg font-semibold">{c.title}</h2>
                  <span className="text-sm font-medium text-muted">{total} dk</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {c.lessons.map((l) => {
                    const ep = p.exercises[lessonKey(course.slug, l.id)];
                    const target = l.minutes * 60;
                    const done = Math.min(ep?.totalSeconds ?? 0, target);
                    if (l.practice) return <PratikKarti key={l.id} lesson={l} sonuc={p.steps[`${l.practice.yol}/${l.practice.kod}`]} image={image} />;
                    return (
                      <Link
                        key={l.id}
                        href={`/calis/${course.slug}/${encodeURIComponent(l.id)}`}
                        className={`card group relative block overflow-hidden p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 ${ep?.completed ? "border-emerald-500/40" : ""}`}
                      >
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={image} alt="" className="absolute inset-0 size-full object-cover opacity-25" />
                        ) : (
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgb(255_55_95/0.14),transparent_55%)]" />
                        )}
                        <div className="relative">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold leading-tight">{l.title}</h3>
                            <span className="rounded-full bg-white/[0.07] p-1.5">
                              <ListVideo size={14} />
                            </span>
                          </div>
                          {l.target && <p className="mt-2 text-xs font-medium text-muted">Hedef: <span className="text-accent">{l.target}</span></p>}
                          <p className={`${l.target ? "mt-4" : "mt-10"} text-right text-sm font-semibold tabular-nums`}>
                            {l.card ? <span className="float-left text-xs font-semibold text-accent">{KART[l.card]}</span> : null}
                            {l.tex || l.tabFile ? `${l.bpmRange ? `${l.bpmRange[0]}–${l.bpmRange[1]}` : l.bpm} BPM` : "Okuma"}
                          </p>
                          <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3 text-xs font-medium">
                            <span className="tabular-nums text-muted">
                              {formatClock(done)} / {formatClock(target)} dk
                            </span>
                            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-accent">
                              {Number.isInteger(l.minutes) ? `Toplam: ${l.minutes}dk` : `Min. ${Math.round(l.minutes * 60)} sn`}
                            </span>
                          </div>
                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                            <div className={`h-full ${ep?.completed ? "bg-emerald-500" : "bar-grad"}`} style={{ width: `${(done / target) * 100}%` }} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

const KART = { egitim: "Eğitim", pratik: "Pratik", ek: "Ek İnceleme" } as const;

/** Teori dersindeki Pratik kartı: soruları teori yolu adımında çözülür, sonucu oradan gelir */
function PratikKarti({ lesson: l, sonuc, image }: { lesson: Lesson; sonuc?: StepProgress; image?: string }) {
  return (
    <Link
      href={`/teori/yol/${l.practice!.yol}/${encodeURIComponent(l.practice!.kod)}`}
      className={`card group relative block overflow-hidden p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 ${sonuc?.passed ? "border-emerald-500/40" : ""}`}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 size-full object-cover opacity-25" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgb(191_90_242/0.14),transparent_55%)]" />
      )}
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{l.title}</h3>
          <span className="rounded-full bg-white/[0.07] p-1.5">
            <ListChecks size={14} />
          </span>
        </div>
        {l.target && <p className="mt-2 text-xs font-medium text-muted">Rozet: <span className="text-accent">{l.target}</span></p>}
        <p className={`${l.target ? "mt-4" : "mt-10"} text-right text-sm font-semibold tabular-nums`}>
          <span className="float-left text-xs font-semibold text-accent">Pratik</span>
          {sonuc ? `En iyi %${sonuc.best}` : "Sorular"}
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3 text-xs font-medium">
          <span className="text-muted">{sonuc ? `${sonuc.attempts} deneme` : "Başlanmadı"}</span>
          <span className={`rounded-full px-2.5 py-0.5 ${sonuc?.passed ? "bg-emerald-500/15 text-emerald-400" : "bg-accent/15 text-accent"}`}>
            {sonuc?.passed ? "Geçildi" : "Geçilmedi"}
          </span>
        </div>
      </div>
    </Link>
  );
}
