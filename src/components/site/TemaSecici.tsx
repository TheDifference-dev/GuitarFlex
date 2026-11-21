"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { TEMA_ADI, TEMALAR, temaSec, useTema, type Tema } from "@/lib/tema";

const SIMGE: Record<Tema, typeof Sun> = { acik: Sun, koyu: Moon, sistem: Monitor };

/** Görünüm seçici (segment kontrol): Açık (varsayılan) · Koyu · Sistem */
export default function TemaSecici({ className = "" }: { className?: string }) {
  const tema = useTema();
  return (
    <div className={`inline-flex rounded-full border border-ink/10 bg-ink/[0.05] p-0.5 ${className}`} role="radiogroup" aria-label="Tema">
      {TEMALAR.map((t) => {
        const S = SIMGE[t];
        const secili = tema === t;
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={secili}
            data-tema={t}
            onClick={() => temaSec(t)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${secili ? "bg-seg text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`}
          >
            <S size={15} aria-hidden /> {TEMA_ADI[t]}
            {t === "acik" && <span className="font-normal text-muted">(varsayılan)</span>}
          </button>
        );
      })}
    </div>
  );
}
