"use client";

import { useState } from "react";
import { ExternalLink, Search, X } from "lucide-react";
import { sarkiKutuphanesiAc, songsterrAdresi } from "@/lib/songsterr";
import SongsterrBag from "./SongsterrBag";

/** Songsterr'de aramayı uygulama içi pencerede (masaüstü) ya da yeni sekmede (web) açar */
function ara(q: string) {
  if (!sarkiKutuphanesiAc(q)) window.open(songsterrAdresi(q), "_blank", "noopener,noreferrer");
}

/**
 * Şarkı Kütüphanesi araması (Songsterr tarzı büyük tek kutu): Enter ya da "Ara" Songsterr'in bütün kataloğunda arar;
 * sonuçlar Songsterr'in kendi sayfasında (her zaman güncel) açılır. Katalog uygulamaya indirilmez.
 */
export default function SarkiKutuphanesiArama({ ornekler = [] }: { ornekler?: string[] }) {
  const [q, setQ] = useState("");
  return (
    <div className="mx-auto w-full max-w-[760px]">
      <form
        role="search"
        aria-label="Şarkı Kütüphanesinde ara"
        onSubmit={(e) => {
          e.preventDefault();
          ara(q);
        }}
        className="flex items-center gap-3 rounded-full border border-ink/15 bg-[var(--bg)] py-2 pl-6 pr-2 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30"
      >
        <Search size={24} className="shrink-0 text-muted" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Şarkı veya sanatçı ara"
          aria-label="Şarkı veya sanatçı ara"
          autoFocus
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent py-2 text-[21px] outline-none focus-visible:outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
          data-sarki-ara
        />
        {q && (
          <button type="button" onClick={() => setQ("")} className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-ink/[0.06] hover:text-text" aria-label="Aramayı temizle">
            <X size={18} />
          </button>
        )}
        <button type="submit" className="btn-primary shrink-0 px-6 py-2.5 text-[17px]">
          Ara
        </button>
      </form>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
        <SongsterrBag className="btn-secondary px-5 py-2 text-[15px]" data-songsterr-ac>
          Songsterr&apos;i aç <ExternalLink size={14} aria-hidden />
        </SongsterrBag>
      </div>
      {ornekler.length > 0 && (
        <p className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted">
          Örnek:
          {ornekler.map((o) => (
            <SongsterrBag key={o} q={o} className="rounded-full border border-ink/10 bg-ink/[0.04] px-3 py-1 font-semibold text-text transition hover:border-ink/25">
              {o}
            </SongsterrBag>
          ))}
        </p>
      )}
    </div>
  );
}
