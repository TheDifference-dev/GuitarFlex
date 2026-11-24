"use client";

import { useEffect } from "react";
import { Undo2, X } from "lucide-react";
import { geriAl, silinenBildiriminiKapat, useSilinenKayitlar } from "@/lib/defter";

/** Bildirimin ekranda kalma süresi (ms) */
const SURE = 7000;

/**
 * "Geri al" bildirimi (bütün sayfalarda, ekranın altında): son işaret kaldırılınca ya da kayıt silinince Çalışma
 * Defteri'nden çıkan kayıt birkaç saniye geri getirilebilir. Notu ya da süresi olan kayıtlar zaten silinmez
 * (işaretsiz not olarak kalır), bu bildirim yalnız gerçekten çıkan kayıtlar için çıkar.
 */
export default function GeriAlBildirimi() {
  const s = useSilinenKayitlar();
  useEffect(() => {
    if (!s) return;
    const t = window.setTimeout(silinenBildiriminiKapat, SURE);
    return () => window.clearTimeout(t);
  }, [s]);
  if (!s) return null;
  const ad = s.kayitlar.length === 1 ? `“${s.kayitlar[0].kayit.baslik}”` : `${s.kayitlar.length} kayıt`;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-4" data-geri-al>
      <div role="status" aria-live="polite" className="pointer-events-auto flex max-w-[min(36rem,100%)] items-center gap-3 rounded-full bg-[#1d1d1f] py-2 pl-5 pr-2 text-sm text-white shadow-[var(--shadow-pop)]">
        <span className="min-w-0 truncate">{ad} Çalışma Defteri&apos;nden çıkarıldı.</span>
        <button type="button" onClick={geriAl} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-semibold hover:bg-white/25" data-geri-al-dugmesi>
          <Undo2 size={14} aria-hidden /> Geri al
        </button>
        <button type="button" onClick={silinenBildiriminiKapat} className="flex size-7 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/15 hover:text-white" aria-label="Bildirimi kapat">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
