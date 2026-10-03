"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, BookOpen, ChevronDown, Guitar, Trophy, User, Wrench } from "lucide-react";
import { SITE } from "@/config/site";

type MenuItem = { href?: string; label: string; note?: string; heading?: boolean };
type Props = {
  subtitle: string;
  courses: { slug: string; title: string; status?: string }[];
  theory: { slug: string; title: string }[];
};

export default function SiteHeader({ subtitle, courses, theory }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Menü dışına tıklayınca kapat
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const menus: { id: string; label: string; icon: typeof User; href?: string; active: boolean; items?: MenuItem[] }[] = [
    { id: "profil", label: "Profil", icon: User, href: "/profil", active: pathname.startsWith("/profil") },
    {
      id: "calis",
      label: "Gitar Çalış",
      icon: Guitar,
      active: pathname === "/" || pathname.startsWith("/calis") || pathname.startsWith("/oynatici") || pathname.startsWith("/sarkilar"),
      items: [
        { href: "/", label: "Tüm Egzersizler" },
        { label: "Teknik Egzersizler", heading: true },
        ...courses.map((c) => ({ href: c.status ? undefined : `/calis/${c.slug}`, label: c.title, note: c.status ? "Yakında" : undefined })),
        { label: "Şarkı ve Sololar", heading: true },
        { href: "/sarkilar", label: "Popüler Şarkılar" },
        { href: "/oynatici", label: "Tabla Keşfet" },
        { href: "/sarkilar/dogaclama", label: "Doğaçlama Çal" },
      ],
    },
    {
      id: "teori",
      label: "Müzik Teorisi",
      icon: BookOpen,
      active: pathname.startsWith("/teori"),
      items: [{ href: "/teori", label: "Sap Gezgini" }, ...theory.map((t) => ({ href: `/teori/${t.slug}`, label: t.title }))],
    },
    {
      id: "yarisma",
      label: "Yarışma",
      icon: Trophy,
      active: false,
      items: [
        { label: "Haftalık Meydan Okuma", note: "Yakında" },
        { label: "Sıralama", note: "Yakında" },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
      <div ref={navRef} className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
        <Link href="/" className="mr-4 flex shrink-0 items-center gap-3" onClick={() => setOpen(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SITE.logo} alt="" width={40} height={40} className="rounded-lg" />
          <span className="h-8 w-px bg-accent" />
          <span className="leading-tight">
            <span className="block text-xs font-semibold tracking-[0.2em] text-muted">{subtitle}</span>
            <span className="block text-lg font-bold">
              <span className="text-accent">Guitar</span>Flex
            </span>
          </span>
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-1 overflow-x-auto">
          {menus.map((m) => {
            const Icon = m.icon;
            const cls = `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap ${
              m.active ? "bg-accent/15 text-accent" : "text-text hover:bg-panel"
            }`;
            if (!m.items)
              return (
                <Link key={m.id} href={m.href!} className={cls}>
                  <Icon size={16} /> {m.label}
                </Link>
              );
            return (
              <div key={m.id} className="relative">
                <button type="button" className={cls} onClick={() => setOpen(open === m.id ? null : m.id)}>
                  <Icon size={16} /> {m.label} <ChevronDown size={14} />
                </button>
                {open === m.id && (
                  <div className="absolute left-0 top-full mt-2 max-h-[70vh] w-64 overflow-auto rounded-xl border border-line bg-panel p-1.5 shadow-2xl">
                    {m.items.map((it) =>
                      it.heading ? (
                        <p key={it.label} className="mt-1 border-t border-line px-3 pb-1 pt-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-accent first:mt-0 first:border-0">
                          {it.label}
                        </p>
                      ) : it.href ? (
                        <Link key={it.label} href={it.href} onClick={() => setOpen(null)} className="block rounded-lg px-3 py-2 text-sm hover:bg-bg">
                          {it.label}
                        </Link>
                      ) : (
                        <span key={it.label} className="flex justify-between rounded-lg px-3 py-2 text-sm text-muted">
                          {it.label} {it.note && <span className="text-xs text-accent">{it.note}</span>}
                        </span>
                      ),
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <button type="button" className="rounded-lg p-2 text-muted hover:bg-panel hover:text-text" title="Bildirimler">
            <Bell size={18} />
          </button>
          <Link href="/araclar" className="rounded-lg p-2 text-muted hover:bg-panel hover:text-text" title="Araçlar">
            <Wrench size={18} />
          </Link>
          <Link href="/profil" className="ml-1 flex items-center gap-1 rounded-xl border border-line bg-panel p-1.5" title="Profil">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent/20 text-accent">
              <User size={16} />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
