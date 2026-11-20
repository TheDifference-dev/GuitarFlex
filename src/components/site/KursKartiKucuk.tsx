"use client";

import Link from "next/link";
import { ArrowRight, Clock, Layers, ListChecks } from "lucide-react";
import type { KursKarti } from "@/lib/katalog";
import { kartIlerleme } from "@/lib/katalog-ilerleme";
import type { Progress } from "@/lib/progress";

/** Katalog ve ana sayfa için yatay kurs kartı: simge, ad, bölüm/ders sayısı, ilerleme çubuğu */
export default function KursKartiKucuk({ k, p }: { k: KursKarti; p: Progress }) {
  const { tamam, toplam, yuzde } = kartIlerleme(p, k);
  const yakinda = !!k.status;
  const ic = (
    <div className={`card group flex h-full gap-4 p-4 transition duration-300 ${yakinda ? "opacity-60" : "hover:-translate-y-0.5 hover:border-white/15"}`}>
      <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgb(255_55_95/0.35),transparent_60%),radial-gradient(circle_at_80%_90%,rgb(191_90_242/0.3),transparent_60%)] text-2xl">
        {k.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={k.image} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          (k.icon ?? "🎸")
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-start justify-between gap-2">
          <span lang={k.grup === "elektro" || k.grup === "akustik" ? "en" : undefined} className="font-semibold leading-tight">
            {k.title}
          </span>
          {yakinda ? (
            <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-semibold">Yakında</span>
          ) : (
            <ArrowRight size={16} className="mt-0.5 shrink-0 text-accent opacity-0 transition group-hover:opacity-100" />
          )}
        </span>
        <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{k.description}</span>
        <span className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-medium text-muted">
          <span className="flex items-center gap-1">
            <Layers size={12} /> {k.bolum} bölüm
          </span>
          <span className="flex items-center gap-1">
            <ListChecks size={12} /> {k.ders} ders
          </span>
          {k.dakika > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={12} /> {k.dakika} dk
            </span>
          )}
        </span>
        <span className="mt-auto flex items-center gap-2 pt-2.5">
          <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <span className="bar-grad block h-full rounded-full" style={{ width: `${yuzde}%` }} />
          </span>
          <span className="text-[11px] font-semibold tabular-nums text-muted">
            {tamam}/{toplam}
          </span>
        </span>
      </span>
    </div>
  );
  return yakinda ? <div>{ic}</div> : <Link href={`/calis/${k.slug}`}>{ic}</Link>;
}
