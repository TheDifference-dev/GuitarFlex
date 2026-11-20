"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Mic2, Star } from "lucide-react";
import Kirinti from "./site/Kirinti";

const TABS = [
  { href: "/sarkilar", label: "Popüler Şarkılar", icon: Star, match: (p: string) => p === "/sarkilar" },
  { href: "/oynatici", label: "Tabla Keşfet", icon: Compass, match: (p: string) => p.startsWith("/oynatici") },
  { href: "/sarkilar/dogaclama", label: "Doğaçlama Çal", icon: Mic2, match: (p: string) => p.startsWith("/sarkilar/dogaclama") },
];

/** "Şarkı ve Sololar" bölümünün sekmeleri */
export default function SongsNav() {
  const pathname = usePathname();
  const aktif = TABS.find((t) => t.match(pathname));
  return (
    <div className="space-y-3">
    <Kirinti halkalar={[{ href: "/elektro", label: "Elektro Gitar" }, { href: "/sarkilar", label: "Şarkı ve Sololar" }, ...(aktif && aktif.href !== "/sarkilar" ? [{ label: aktif.label }] : [])]} />
    <nav className="flex flex-wrap items-center gap-2">
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
              active ? "border-accent/40 bg-accent/15 text-accent" : "border-white/10 bg-white/[0.05] hover:bg-white/10"
            }`}
          >
            <Icon size={15} /> {t.label}
          </Link>
        );
      })}
    </nav>
    </div>
  );
}
