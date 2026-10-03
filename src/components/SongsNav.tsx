"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Mic2, Star } from "lucide-react";

const TABS = [
  { href: "/sarkilar", label: "Popüler Şarkılar", icon: Star, match: (p: string) => p === "/sarkilar" },
  { href: "/oynatici", label: "Tabla Keşfet", icon: Compass, match: (p: string) => p.startsWith("/oynatici") },
  { href: "/sarkilar/dogaclama", label: "Doğaçlama Çal", icon: Mic2, match: (p: string) => p.startsWith("/sarkilar/dogaclama") },
];

/** "Şarkı ve Sololar" bölümünün sekmeleri */
export default function SongsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-2">
      <span className="mr-2 text-xs font-bold uppercase tracking-[0.2em] text-muted">Şarkı ve Sololar</span>
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-bold ${
              active ? "border-accent bg-accent/15 text-accent" : "border-line bg-panel hover:border-accent"
            }`}
          >
            <Icon size={15} /> {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
