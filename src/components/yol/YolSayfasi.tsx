"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Lock } from "lucide-react";
import type { Yol } from "@/lib/alistirma/tipler";
import { useProgress } from "@/lib/progress";
import { MODUL_METIN } from "@/content/yol-modulleri";

// Teori yolu: bölümler ve sırayla açılan adımlar. Bir adım, önceki adım geçilince açılır.

export default function YolSayfasi({ yol }: { yol: Yol }) {
  const progress = useProgress();
  const [sekme, setSekme] = useState(0);
  const sonuc = (kod: string) => progress.steps[`${yol.slug}/${kod}`];
  const gecilen = yol.adimlar.filter((a) => sonuc(a.kod)?.passed).length;
  const acik = (i: number) => i === 0 || Boolean(sonuc(yol.adimlar[i - 1].kod)?.passed) || Boolean(sonuc(yol.adimlar[i].kod));
  const metin = MODUL_METIN[yol.slug]?.[yol.modul.sekmeler[sekme]] ?? [];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <nav className="text-sm text-muted">
          <Link href="/teori" className="hover:text-accent">
            Müzik Teorisi
          </Link>{" "}
          / {yol.ad}
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-accent">{yol.ad}</h1>
        <p className="text-muted">{yol.ozet}</p>
        <div className="flex items-center gap-3">
          <div className="h-2 max-w-md flex-1 overflow-hidden rounded-full bg-panel">
            <div className="h-full bg-accent" style={{ width: `${(gecilen / yol.adimlar.length) * 100}%` }} />
          </div>
          <span className="text-sm tabular-nums text-muted">
            {gecilen} / {yol.adimlar.length} adım
          </span>
        </div>
      </header>

      {yol.modul.sekmeler.length ? (
        <section className="space-y-3 rounded-2xl border border-line bg-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Modül</p>
          <h2 className="text-xl font-semibold">{yol.modul.ad}</h2>
          <div className="flex flex-wrap gap-2" role="tablist">
            {yol.modul.sekmeler.map((s, i) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={i === sekme}
                onClick={() => setSekme(i)}
                className={`rounded-full border px-3 py-1 text-sm transition ${i === sekme ? "border-accent bg-accent text-accent-ink" : "border-line hover:border-accent"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="max-w-3xl space-y-2 leading-relaxed">
            {metin.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>
      ) : null}

      {yol.bolumler.map((b) => {
        const adimlar = yol.adimlar.map((a, i) => ({ a, i })).filter(({ a }) => a.bolum === b.no);
        const biten = adimlar.filter(({ a }) => sonuc(a.kod)?.passed).length;
        return (
          <section key={b.no} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-semibold">
                {b.no}. {b.ad}
              </h2>
              <span className="text-sm text-muted">
                {b.seviye ? `Seviye: ${b.seviye} · ` : ""}
                {biten}/{adimlar.length}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {adimlar.map(({ a, i }) => {
                const r = sonuc(a.kod);
                const ac = acik(i);
                const icerik = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-accent">
                        {a.kod}
                        {a.kontrol ? " · Kontrol" : ""}
                      </p>
                      {r?.passed ? <Check size={16} className="text-emerald-400" /> : !ac ? <Lock size={14} className="text-muted" /> : null}
                    </div>
                    <h3 className="font-semibold">{a.ad}</h3>
                    <p className="text-xs text-muted">
                      {a.soru} soru · Geçme %{a.gecme.dogruluk}
                      {r ? ` · En iyi %${r.best}` : ""}
                    </p>
                  </>
                );
                return ac ? (
                  <Link key={a.kod} href={`/teori/yol/${yol.slug}/${a.kod}`} className={`rounded-xl border bg-panel p-3 transition hover:border-accent ${r?.passed ? "border-emerald-500/50" : "border-line"}`}>
                    {icerik}
                  </Link>
                ) : (
                  <div key={a.kod} className="rounded-xl border border-line bg-panel/50 p-3 opacity-60" title="Önceki adımı geçince açılır">
                    {icerik}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
