"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { kursSimgesi } from "@/lib/simge";
import UygulamaSimgesi from "./UygulamaSimgesi";

export type SeciciKurs = { slug: string; title: string; ders: number; grup: string };

/** Kurs başlığındaki kurs seçici (GuitarBear'deki "teknik seçici": kurs adı + ⌄, aynı bölümün kursları ve ders sayıları) */
export default function KursSecici({ baslik, slug, kurslar }: { baslik: string; slug: string; kurslar: SeciciKurs[] }) {
  const [acik, setAcik] = useState(false);
  const kutu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!acik) return;
    const kapat = (e: MouseEvent) => !kutu.current?.contains(e.target as Node) && setAcik(false);
    const tus = (e: KeyboardEvent) => e.key === "Escape" && setAcik(false);
    document.addEventListener("mousedown", kapat);
    window.addEventListener("keydown", tus);
    return () => {
      document.removeEventListener("mousedown", kapat);
      window.removeEventListener("keydown", tus);
    };
  }, [acik]);

  const gruplar = [...new Set(kurslar.map((k) => k.grup))];
  return (
    <div ref={kutu} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setAcik((v) => !v)}
        aria-expanded={acik}
        aria-haspopup="listbox"
        className="group flex min-w-0 items-center gap-3 rounded-2xl text-left"
        title="Başka bir kursa geç"
      >
        <h1 className="baslik-buyuk min-w-0 text-balance">{baslik}</h1>
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-ink/[0.07] text-accent transition group-hover:bg-ink/[0.12] ${acik ? "rotate-180" : ""}`}>
          <ChevronDown size={18} />
        </span>
      </button>
      {acik && (
        <div className="bg-elevated absolute left-1/2 top-full z-40 mt-2 -translate-x-1/2 text-left max-h-[min(70vh,32rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-ink/10 p-2 shadow-[var(--shadow-pop)]" role="listbox">
          {gruplar.map((g, gi) => (
            <div key={g} className={gi > 0 ? "mt-1 border-t border-line pt-1" : ""}>
              <p className="px-3 pb-1 pt-2 text-xs font-semibold text-muted">{g}</p>
              {kurslar
                .filter((k) => k.grup === g)
                .map((k) => (
                  <Link
                    key={k.slug}
                    href={`/calis/${k.slug}`}
                    onClick={() => setAcik(false)}
                    role="option"
                    aria-selected={k.slug === slug}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-ink/[0.08] ${k.slug === slug ? "text-accent" : ""}`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <UygulamaSimgesi simge={kursSimgesi(k.slug)} boyut={24} />
                      <span className="truncate">{k.title}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs tabular-nums text-muted">
                      {k.ders} ders {k.slug === slug ? <Check size={14} className="text-accent" /> : <span className="w-3.5" />}
                    </span>
                  </Link>
                ))}
            </div>
          ))}
          <Link href="/kurslar" onClick={() => setAcik(false)} className="mt-1 block rounded-lg border-t border-line px-3 pb-1 pt-2 text-sm font-semibold text-accent hover:underline">
            Tüm kurslar →
          </Link>
        </div>
      )}
    </div>
  );
}
