"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bell, BookOpen, ChevronDown, Compass, Guitar, House, Trophy, User, Wrench } from "lucide-react";
import { SITE } from "@/config/site";

type MenuItem = { href?: string; label: string; note?: string };
type MenuGroup = { title?: string; items: MenuItem[] };
type Menu = { id: string; label: string; icon: typeof User; href?: string; active: boolean; banner?: { href: string; title: string; text: string }; groups?: MenuGroup[] };

/** Logonun yanındaki sayfa adı: bulunulan bölüme göre değişir */
function sectionName(p: string, fallback: string) {
  if (p.startsWith("/profil")) return "Profil";
  if (p.startsWith("/akustik")) return "Akustik Gitar";
  if (p.startsWith("/sarkilar") || p.startsWith("/oynatici")) return "Şarkı ve Sololar";
  if (p.startsWith("/teori") || p.startsWith("/calis/armoni")) return "Müzik Teorisi";
  if (p.startsWith("/araclar")) return "Araçlar";
  if (p.startsWith("/nasil-calismaliyim")) return "Çalışma Planı";
  return fallback;
}

export default function SiteHeader({ subtitle }: { subtitle: string }) {
  const pathname = usePathname();
  const router = useRouter();
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

  const menus: Menu[] = [
    { id: "profil", label: "Profil", icon: User, href: "/profil", active: pathname.startsWith("/profil") },
    {
      id: "calis",
      label: "Gitar Çalış",
      icon: Guitar,
      active: (["/calis", "/akustik", "/sarkilar", "/oynatici", "/nasil-calismaliyim"].some((p) => pathname.startsWith(p)) && !pathname.startsWith("/calis/armoni")) || pathname === "/",
      banner: { href: "/nasil-calismaliyim", title: "Gitarda Nasıl Çalışmalıyım?", text: "Seviyeni seç, sana uygun yolu önerelim." },
      groups: [
        {
          title: "Akustik Gitar",
          items: [
            { href: "/akustik", label: "Teknik Egzersizler", note: "Yeni" },
            { href: "/akustik/sarkilar", label: "Şarkılar", note: "Yeni" },
          ],
        },
        {
          title: "Elektro Gitar",
          items: [
            { href: "/", label: "Teknik Egzersizler" },
            { href: "/sarkilar", label: "Şarkı ve Sololar" },
          ],
        },
      ],
    },
    {
      id: "teori",
      label: "Müzik Teorisi",
      icon: BookOpen,
      active: pathname.startsWith("/teori") || pathname.startsWith("/calis/armoni"),
      groups: [
        {
          title: "Müzik Teorisi",
          items: [
            { href: "/calis/armoni", label: "Armoni" },
            { href: "/teori/yol/ritim", label: "Ritim" },
            { href: "/teori/yol/klavye", label: "Klavye Görselleştirme" },
            { href: "/teori/yol/kulak", label: "Kulak Eğitimi" },
          ],
        },
      ],
    },
    {
      id: "yarisma",
      label: "Yarışma",
      icon: Trophy,
      active: false,
      groups: [{ items: [{ label: "Sezon Yarışı", note: "Yakında" }, { label: "Cover Yarışması", note: "Yakında" }] }],
    },
  ];

  const iconBtn = "rounded-lg p-2 text-muted hover:bg-panel hover:text-text";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
      <div ref={navRef} className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" onClick={() => router.back()} className={iconBtn} title="Önceki sayfa" aria-label="Önceki sayfa">
            <ArrowLeft size={18} />
          </button>
          <Link href="/" className={`${iconBtn} ${pathname === "/" ? "text-accent" : ""}`} title="Ana sayfa" aria-label="Ana sayfa">
            <House size={18} />
          </Link>
        </div>

        <Link href="/" className="mr-4 flex shrink-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SITE.logo} alt="" width={40} height={40} className="rounded-lg" />
          <span className="h-8 w-px bg-accent" />
          <span className="leading-tight">
            <span className="block text-xs font-semibold tracking-[0.2em] text-muted">{sectionName(pathname, subtitle)}</span>
            <span className="block text-lg font-bold">
              <span className="text-accent">Guitar</span>Flex
            </span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center justify-center gap-1">
          {menus.map((m) => {
            const Icon = m.icon;
            const cls = `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap ${
              m.active ? "bg-accent/15 text-accent" : "text-text hover:bg-panel"
            }`;
            if (!m.groups)
              return (
                <Link key={m.id} href={m.href!} className={cls}>
                  <Icon size={16} /> {m.label}
                </Link>
              );
            return (
              <div key={m.id} className="relative">
                <button type="button" className={cls} onClick={() => setOpen(open === m.id ? null : m.id)}>
                  <Icon size={16} /> {m.label} <ChevronDown size={14} className={`transition ${open === m.id ? "rotate-180" : ""}`} />
                </button>
                {open === m.id && (
                  <div onClick={() => setOpen(null)} className="absolute left-1/2 top-full z-40 mt-2 w-72 -translate-x-1/2 rounded-2xl border border-line bg-panel p-2 shadow-2xl">
                    {m.banner && (
                      <Link href={m.banner.href} className="mb-1 flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 p-3 hover:border-accent">
                        <Compass size={20} className="shrink-0 text-accent" />
                        <span>
                          <span className="block text-sm font-bold">{m.banner.title}</span>
                          <span className="block text-xs text-muted">{m.banner.text}</span>
                        </span>
                      </Link>
                    )}
                    {m.groups.map((g, gi) => (
                      <div key={g.title ?? gi} className={gi > 0 ? "mt-1 border-t border-line pt-1" : ""}>
                        {g.title && <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{g.title}</p>}
                        {g.items.map((it) =>
                          it.href ? (
                            <Link
                              key={it.label}
                              href={it.href}
                              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-bg hover:text-accent ${pathname === it.href ? "text-accent" : ""}`}
                            >
                              {it.label}
                              {it.note && <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-accent-ink">{it.note}</span>}
                            </Link>
                          ) : (
                            <span key={it.label} className="flex justify-between gap-2 rounded-lg px-3 py-2 text-sm text-muted">
                              {it.label} {it.note && <span className="text-xs text-accent">{it.note}</span>}
                            </span>
                          ),
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <button type="button" className={iconBtn} title="Bildirimler">
            <Bell size={18} />
          </button>
          <Link href="/araclar" className={iconBtn} title="Araçlar">
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
