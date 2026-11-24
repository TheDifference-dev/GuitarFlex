"use client";

import Link from "next/link";
import { ArrowRight, Clock, Layers, ListChecks } from "lucide-react";
import type { KursKarti } from "@/lib/katalog";
import { kartIlerleme } from "@/lib/katalog-ilerleme";
import type { Progress } from "@/lib/progress";
import { kursSimgesi } from "@/lib/simge";
import UygulamaSimgesi from "./UygulamaSimgesi";

/** Ek kurs: rehber ya da teknik kursu değil, müzisyenlik / stil kursu */
const EK_KURS = /\(Ek Kurs\)/;

/** Katalog için yatay kurs kartı: kursun renginde üst şerit ve açık ton, simge, ad, bölüm/ders sayısı, renkli ilerleme */
export default function KursKartiKucuk({ k, p, etiket }: { k: KursKarti; p: Progress; etiket?: string }) {
  const { tamam, toplam, yuzde } = kartIlerleme(p, k);
  const yakinda = !!k.status;
  const simge = kursSimgesi(k.slug);
  const ek = etiket ?? (EK_KURS.test(k.title) ? "Ek kurs" : undefined);
  const ic = (
    <div data-renk={simge.renk} className={`card renkli-kart group flex h-full gap-4 p-4 pt-5 ${yakinda ? "opacity-60" : "yukselen hover:border-ink/15"}`}>
      <UygulamaSimgesi simge={simge} boyut={60} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-start justify-between gap-2">
          <span lang={k.grup === "elektro" || k.grup === "akustik" ? "en" : undefined} className="font-semibold leading-tight">
            {ek ? k.title.replace(EK_KURS, "").trim() : k.title}
          </span>
          {yakinda ? (
            <span className="shrink-0 rounded-full border border-ink/10 px-2 py-0.5 text-[11px] font-semibold">Yakında</span>
          ) : ek ? (
            <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: "var(--r2)" }}>
              {ek}
            </span>
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
          <span className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
            <span className="renkli-dolgu block h-full rounded-full" style={{ width: `${yuzde}%` }} />
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
