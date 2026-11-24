"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SongsterrBag from "@/components/SongsterrBag";
import { defterIsle, kayitAc, songsterrKaydi } from "@/lib/defter";
import type { SimgeTanim } from "@/lib/simge";
import SarkiKapagi, { type KapakTuru } from "@/components/SarkiKapagi";
import EylemDugmeleri from "@/components/defter/Eylemler";

export type SeritSarki = { title: string; artist: string; kind: string; madalya: string; bpm?: number; url: string; simge: SimgeTanim; adim?: number; kapak?: KapakTuru };

/**
 * Yatay kayan şarkı bandı (derlenmiş koleksiyon): başlık, ok düğmeleri, özgün kapaklı kartlar (bkz. SarkiKapagi).
 * Kartlar Songsterr'i uygulama içi pencerede açar; altındaki dört küçük düğme şarkıyı Çalışma Defteri'ne işaretler. Kaydırma: ok düğmeleri, klavye (bant odaktayken ←/→, Home/End), fare tekerleği
 * (bant uçlara gelene kadar yatay kayar, sonra sayfa kayar), dokunmatik/iz paneli.
 */
export default function SarkiSeridi({ baslik, alt, sarkilar }: { baslik: string; alt?: string; sarkilar: SeritSarki[] }) {
  const kap = useRef<HTMLUListElement>(null);
  const [uc, setUc] = useState({ bas: true, son: false });

  const olc = () => {
    const el = kap.current;
    if (!el) return;
    setUc({ bas: el.scrollLeft <= 2, son: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  };
  useEffect(() => {
    const el = kap.current;
    if (!el) return;
    olc();
    // Dikey tekerlek bandı yatay kaydırır; bant uca gelince sayfa kaymaya devam eder
    const tekerlek = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.ctrlKey) return;
      const ileri = e.deltaY > 0;
      const gidebilir = ileri ? el.scrollLeft + el.clientWidth < el.scrollWidth - 2 : el.scrollLeft > 2;
      if (!gidebilir) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", tekerlek, { passive: false });
    window.addEventListener("resize", olc);
    return () => {
      el.removeEventListener("wheel", tekerlek);
      window.removeEventListener("resize", olc);
    };
  }, []);

  const kaydir = (yon: 1 | -1) => {
    const el = kap.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: yon * el.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
  };
  if (!sarkilar.length) return null;
  const ok = "flex size-9 items-center justify-center rounded-full bg-ink/[0.07] text-text transition hover:bg-ink/[0.12] disabled:opacity-35";
  return (
    <section className="space-y-3" aria-label={baslik}>
      <div className="flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-[24px] font-semibold leading-tight">{baslik}</h2>
          {alt && <p className="text-[15px] text-muted">{alt}</p>}
        </div>
        <span className="text-sm tabular-nums text-muted">{sarkilar.length} şarkı</span>
        <button type="button" className={ok} onClick={() => kaydir(-1)} disabled={uc.bas} aria-label={`${baslik}: geri kaydır`}>
          <ChevronLeft size={18} />
        </button>
        <button type="button" className={ok} onClick={() => kaydir(1)} disabled={uc.son} aria-label={`${baslik}: ileri kaydır`}>
          <ChevronRight size={18} />
        </button>
      </div>
      <ul
        ref={kap}
        tabIndex={0}
        aria-label={`${baslik} şarkıları (←/→ ile kaydır)`}
        onScroll={olc}
        onKeyDown={(e) => {
          const el = kap.current;
          if (!el || e.target !== el) return;
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            el.scrollBy({ left: (e.key === "ArrowRight" ? 1 : -1) * 280 });
          } else if (e.key === "Home" || e.key === "End") {
            e.preventDefault();
            el.scrollTo({ left: e.key === "Home" ? 0 : el.scrollWidth });
          }
        }}
        className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-2 px-2 pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sarkilar.map((s, i) => (
          <li key={`${s.artist}|${s.title}|${s.kind}|${i}`} className="w-[248px] shrink-0 snap-start">
            <div data-renk={s.simge.renk} className="yukselen card group flex h-full flex-col overflow-hidden !p-0">
              <SongsterrBag q={s.url} onAc={() => defterIsle((v) => kayitAc(v, songsterrKaydi(s.title, s.artist, s.url)))} className="flex flex-1 flex-col">
                <span className="relative block h-[132px] overflow-hidden">
                  <SarkiKapagi sanatci={s.artist} baslik={s.title} tur={s.kapak} oran="genis" className="!h-full !w-full" />
                  <span className="absolute bottom-2.5 right-3 rounded-full bg-black/35 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">{s.madalya}</span>
                </span>
                <span className="flex flex-1 flex-col px-4 pb-2 pt-3">
                  {s.adim ? <span className="mb-0.5 text-xs font-semibold tabular-nums text-[var(--r2)]">Adım {s.adim}</span> : null}
                  <span className="line-clamp-2 text-[17px] font-semibold leading-tight group-hover:underline">{s.title}</span>
                  <span className="mt-1 truncate text-sm text-muted">{s.artist}</span>
                  {s.bpm ? <span className="mt-auto pt-2 text-xs tabular-nums text-muted">{s.bpm} BPM</span> : null}
                </span>
              </SongsterrBag>
              <div className="px-3 pb-3">
                <EylemDugmeleri bilgi={songsterrKaydi(s.title, s.artist, s.url)} yalnizSimge />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
