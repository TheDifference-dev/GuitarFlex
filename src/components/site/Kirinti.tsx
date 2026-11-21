import Link from "next/link";
import { ChevronRight, House } from "lucide-react";

export type KirintiHalka = { href?: string; label: string };

/** Sayfa üstündeki kırıntı yolu: Ana sayfa › bölüm › … (son halka bulunulan sayfa, bağlantısız) */
export default function Kirinti({ halkalar, className = "" }: { halkalar: KirintiHalka[]; className?: string }) {
  return (
    <nav aria-label="Konum" className={`flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 text-sm text-muted ${className}`}>
      <Link href="/" className="flex items-center rounded-md p-0.5 transition hover:text-text" aria-label="Ana sayfa" title="Ana sayfa">
        <House size={14} />
      </Link>
      {halkalar.map((h, i) => (
        <span key={`${h.label}-${i}`} className="flex min-w-0 items-center gap-1">
          <ChevronRight size={13} className="shrink-0 opacity-60" />
          {h.href ? (
            <Link href={h.href} className="truncate font-medium transition hover:text-text">
              {h.label}
            </Link>
          ) : (
            <span className="truncate font-medium text-text/90" aria-current="page">
              {h.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
