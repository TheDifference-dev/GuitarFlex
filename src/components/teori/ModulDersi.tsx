"use client";

import { MODUL_METIN, modulDersi } from "@/content/yol-modulleri";
import DersGovdesi from "./DersGovdesi";
import { dersBagi } from "@/content/teori/mufredat";

/** Teori yolunun modül sekmesi: tek A4 sayfalık ders (yoksa düz metin). */
export default function ModulDersi({ yol, yolAdi, sekme }: { yol: string; yolAdi: string; sekme: string }) {
  const ders = modulDersi(yol, sekme);
  if (!ders)
    return (
      <div className="max-w-3xl space-y-2 leading-relaxed">
        {(MODUL_METIN[yol]?.[sekme] ?? []).map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    );
  return (
    <div className="pt-4">
      <DersGovdesi key={ders.slug} ders={ders} ust={`${yolAdi} · Modül`} bag={dersBagi(ders.slug)} />
    </div>
  );
}
