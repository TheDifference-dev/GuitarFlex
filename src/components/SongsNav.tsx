"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { YerelNav } from "./site/Vitrin";

const TABS = [
  { href: "/sarkilar", label: "Şarkılarla Öğren", match: (p: string) => p === "/sarkilar" },
  { href: "/sarki-kutuphanesi", label: "Şarkı Kütüphanesi", match: (p: string) => p.startsWith("/sarki-kutuphanesi") },
  { href: "/oynatici", label: "Tabla Keşfet", match: (p: string) => p.startsWith("/oynatici") },
  { href: "/sarkilar/dogaclama", label: "Doğaçlama Çal", match: (p: string) => p.startsWith("/sarkilar/dogaclama") },
];

/** "Şarkı ve Sololar" bölümünün yerel gezinme çubuğu (sayfanın ilk öğesi) */
export default function SongsNav() {
  const pathname = usePathname();
  return (
    <YerelNav baslik="Şarkılar" href="/sarkilar">
      {TABS.map((t) => {
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
