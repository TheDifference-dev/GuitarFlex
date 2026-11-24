"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { YerelNav } from "./site/Vitrin";

/** Şarkı Kütüphanesi bölümünün sekmeleri: Songsterr araması ve bantlar, Rehber Şarkılar, Tüm Şarkılar */
export const SARKI_SEKMELERI = [
  { href: "/sarki-kutuphanesi", label: "Kütüphane", match: (p: string) => p === "/sarki-kutuphanesi" },
  { href: "/sarki-kutuphanesi/rehber", label: "Rehber Şarkılar", match: (p: string) => p.startsWith("/sarki-kutuphanesi/rehber") },
  { href: "/sarki-kutuphanesi/tum", label: "Tüm Şarkılar", match: (p: string) => p.startsWith("/sarki-kutuphanesi/tum") },
];

/** Araçlar bölümünün sekmeleri (Tab Oynatıcı ve Tabla Keşfet sayfalarında) */
export const ARAC_SEKMELERI = [
  { href: "/araclar", label: "Pratik Araçları", match: (p: string) => p.startsWith("/araclar") },
  { href: "/kutuphane", label: "Tab Oynatıcı ve Dosyalarım", match: (p: string) => p.startsWith("/kutuphane") },
  { href: "/oynatici", label: "Tabla Keşfet", match: (p: string) => p.startsWith("/oynatici") },
];

/** Bölümün yerel gezinme çubuğu (sayfanın ilk öğesi): varsayılan Şarkı Kütüphanesi sekmeleri */
export default function SongsNav({ baslik = "Şarkı Kütüphanesi", href = "/sarki-kutuphanesi", sekmeler = SARKI_SEKMELERI }: { baslik?: string; href?: string; sekmeler?: typeof SARKI_SEKMELERI }) {
  const pathname = usePathname();
  return (
    <YerelNav baslik={baslik} href={href}>
      {sekmeler.map((t) => {
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-1 text-xs transition sm:text-[13px] ${active ? "bg-ink/[0.08] font-semibold text-text" : "text-text/80 hover:text-accent"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </YerelNav>
  );
}
