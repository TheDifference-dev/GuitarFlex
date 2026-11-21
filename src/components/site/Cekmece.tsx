"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/** Yandan açılan panel (çekmece): kurs içi gezinme ve mobilde bölüm listesi. ESC ya da arka plana tıklama kapatır. */
export default function Cekmece({ acik, kapat, baslik, children, taraf = "sol" }: { acik: boolean; kapat: () => void; baslik: ReactNode; children: ReactNode; taraf?: "sol" | "sag" }) {
  useEffect(() => {
    if (!acik) return;
    const tus = (e: KeyboardEvent) => e.key === "Escape" && kapat();
    const eski = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", tus);
    return () => {
      document.body.style.overflow = eski;
      window.removeEventListener("keydown", tus);
    };
  }, [acik, kapat]);

  if (!acik) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button type="button" aria-label="Kapat" onClick={kapat} className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div
        className={`absolute top-0 flex h-full w-[min(26rem,92vw)] flex-col border-ink/10 bg-panel shadow-[var(--shadow-pop)] ${taraf === "sol" ? "left-0 border-r" : "right-0 border-l"}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0 font-semibold">{baslik}</div>
          <button type="button" onClick={kapat} className="rounded-full p-2 text-muted transition hover:bg-ink/10 hover:text-text" aria-label="Kapat">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
      </div>
    </div>
  );
}
