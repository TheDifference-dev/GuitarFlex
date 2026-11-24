"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useProgress } from "@/lib/progress";

export type ListeAdim = { kod: string; ad: string; soru: number; kontrol?: boolean };

/** Kitap sayfalarında (Armoni, Nota Okuma) bir ünitenin sınav/alıştırma adımları ve geçilenler */
export default function AdimListesi({ yol, adimlar, baslik }: { yol: string; adimlar: ListeAdim[]; baslik: string }) {
  const progress = useProgress();
  const sonuc = (kod: string) => progress.steps[`${yol}/${kod}`];
  const gecilen = adimlar.filter((a) => sonuc(a.kod)?.passed).length;
  const ilk = adimlar.find((a) => !sonuc(a.kod)?.passed) ?? adimlar[0];
  if (!adimlar.length) return null;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-[15px] font-semibold">{baslik}</h4>
        <span className="text-sm tabular-nums text-muted">
          {gecilen}/{adimlar.length} geçildi
        </span>
      </div>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {adimlar.map((a) => {
          const r = sonuc(a.kod);
          return (
            <li key={a.kod}>
              <Link href={`/teori/yol/${yol}/${encodeURIComponent(a.kod)}`} className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm transition hover:bg-ink/[0.04] ${r?.passed ? "border-ok/40" : "border-[var(--line)]"}`}>
                <span className="mt-px w-10 shrink-0 text-xs font-semibold text-accent">{a.kod}</span>
                <span className="min-w-0 flex-1">
                  {a.ad}
                  <span className="block text-xs text-muted">
                    {a.soru} soru{a.kontrol ? " · Kontrol" : ""}
                    {r ? ` · En iyi %${r.best}` : ""}
                  </span>
                </span>
                {r?.passed ? <Check size={16} className="mt-0.5 shrink-0 text-ok" aria-label="Geçildi" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
      {ilk ? (
        <Link href={`/teori/yol/${yol}/${encodeURIComponent(ilk.kod)}`} className="btn-primary inline-block px-[15px] py-2 text-[14px]">
          {gecilen ? "Kaldığın yerden devam et" : "Başla"} ›
        </Link>
      ) : null}
    </div>
  );
}
