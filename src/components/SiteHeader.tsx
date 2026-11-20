"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bell, BookOpen, ChevronDown, Compass, Guitar, House, LayoutGrid, Library, Menu as MenuIcon, User, Wrench, X } from "lucide-react";
import { SITE } from "@/config/site";

type MenuItem = { href?: string; label: string; note?: string };
type MenuGroup = { title?: string; items: MenuItem[] };
type Menu = { id: string; label: string; icon: typeof User; href?: string; active: boolean; banner?: { href: string; title: string; text: string }; groups?: MenuGroup[] };

/** Logonun yanındaki sayfa adı: bulunulan bölüme göre değişir */
function sectionName(p: string, fallback: string) {
  if (p === "/") return SITE.tagline;
  if (p.startsWith("/kurslar")) return "Tüm Kurslar";
  if (p.startsWith("/elektro")) return "Elektro Gitar";
  if (p.startsWith("/profil")) return "Profil";
  if (p.startsWith("/akustik")) return "Akustik Gitar";
  if (p.startsWith("/sarkilar") || p.startsWith("/oynatici")) return "Şarkı ve Sololar";
  if (p.startsWith("/kutuphane")) return "Şarkı Kütüphanesi";
  if (p.startsWith("/teori") || p.startsWith("/calis/armoni")) return "Müzik Teorisi";
  if (p.startsWith("/araclar")) return "Araçlar";
  if (p.startsWith("/nasil-calismaliyim")) return "Çalışma Planı";
  if (p.startsWith("/seviye")) return "Seviye Yolu";
  return fallback;
}

export default function SiteHeader({ subtitle }: { subtitle: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [mobil, setMobil] = useState(false);
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
      active: ["/calis", "/akustik", "/elektro", "/kurslar", "/sarkilar", "/oynatici", "/nasil-calismaliyim", "/seviye"].some((p) => pathname.startsWith(p)) && !pathname.startsWith("/calis/armoni"),
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
            { href: "/elektro", label: "Teknik Egzersizler" },
            { href: "/seviye", label: "Seviye Yolu", note: "Yeni" },
            { href: "/sarkilar", label: "Şarkı ve Sololar" },
          ],
        },
        { items: [{ href: "/kurslar", label: "Tüm Kurslar" }] },
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
        { items: [{ href: "/teori", label: "Teori ana sayfası" }] },
      ],
    },
    { id: "kutuphane", label: "Şarkı Kütüphanesi", icon: Library, href: "/kutuphane", active: pathname.startsWith("/kutuphane") },
  ];

  const iconBtn = "rounded-full p-2 text-muted transition hover:bg-white/10 hover:text-text";

  return (
    <header className="glass sticky top-0 z-30 border-b border-white/[0.07]">
      <div ref={navRef} className="mx-auto flex min-h-14 max-w-7xl flex-nowrap items-center gap-1 px-3 py-2 sm:gap-2 sm:px-6">
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" onClick={() => router.back()} className={iconBtn} title="Önceki sayfa" aria-label="Önceki sayfa">
            <ArrowLeft size={18} />
          </button>
          <Link href="/" className={`${iconBtn} hidden sm:block ${pathname === "/" ? "text-text" : ""}`} title="Ana sayfa" aria-label="Ana sayfa">
            <House size={18} />
          </Link>
        </div>

        <Link href="/" className="mr-1 flex min-w-0 shrink-0 items-center gap-2.5 sm:mr-3">
          <span className="ring-grad flex size-9 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SITE.logo} alt="" width={32} height={32} className="size-full rounded-full border-2 border-bg object-cover" />
          </span>
          <span className="leading-none">
            <span className="block text-[17px] font-bold tracking-tight">
              <span className="text-grad">Guitar</span>Flex
            </span>
            <span className="mt-1 block text-[11px] font-medium text-muted">{sectionName(pathname, subtitle)}</span>
          </span>
        </Link>

        <div className="flex-1 lg:hidden" />
        <nav className="hidden flex-1 flex-wrap items-center justify-center gap-1 lg:flex">
          {menus.map((m) => {
            const Icon = m.icon;
            const cls = `flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition ${
              m.active ? "bg-white/[0.12] text-text" : "text-text/75 hover:bg-white/[0.07] hover:text-text"
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
                  <div onClick={() => setOpen(null)} className="glass absolute left-1/2 top-full z-40 mt-3 w-72 -translate-x-1/2 rounded-2xl border border-white/10 p-2 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.8)]">
                    {m.banner && (
                      <Link href={m.banner.href} className="mb-1 flex items-center gap-3 rounded-xl bg-white/[0.06] p-3 transition hover:bg-white/10">
                        <span className="ring-grad flex size-9 shrink-0">
                          <span className="flex size-full items-center justify-center rounded-full bg-panel">
                            <Compass size={17} className="text-text" />
                          </span>
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">{m.banner.title}</span>
                          <span className="block text-xs text-muted">{m.banner.text}</span>
                        </span>
                      </Link>
                    )}
                    {m.groups.map((g, gi) => (
                      <div key={g.title ?? gi} className={gi > 0 ? "mt-1 border-t border-line pt-1" : ""}>
                        {g.title && <p className="px-3 pb-1 pt-2 text-xs font-semibold text-muted">{g.title}</p>}
                        {g.items.map((it) =>
                          it.href ? (
                            <Link
                              key={it.label}
                              href={it.href}
                              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white/[0.08] ${pathname === it.href ? "text-accent" : ""}`}
                            >
                              {it.label}
                              {it.note && <span className="rounded-full bg-[image:var(--grad)] px-2 py-0.5 text-[10px] font-semibold text-white">{it.note}</span>}
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
          <button type="button" className={`${iconBtn} hidden sm:block`} title="Bildirimler">
            <Bell size={18} />
          </button>
          <Link href="/araclar" className={`${iconBtn} hidden sm:block`} title="Araçlar">
            <Wrench size={18} />
          </Link>
          <Link href="/profil" className="ring-grad ml-1 flex size-9" title="Profil" aria-label="Profil">
            <span className="flex size-full items-center justify-center rounded-full border-2 border-bg bg-panel-2 text-text">
              <User size={16} />
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobil((v) => !v)}
            className={`${iconBtn} ml-0.5 lg:hidden`}
            aria-expanded={mobil}
            aria-controls="mobil-menu"
            aria-label={mobil ? "Menüyü kapat" : "Menüyü aç"}
            title="Menü"
          >
            {mobil ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobil (hamburger) menü: bütün menü grupları alt alta; GuitarBear'deki gibi "Profilini Gör" ve araçlar da burada */}
      {mobil && (
        <div id="mobil-menu" className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-white/[0.07] px-3 pb-5 pt-2 lg:hidden" onClick={(e) => (e.target as HTMLElement).closest("a") && setMobil(false)}>
          <div className="mx-auto grid max-w-xl gap-1">
            <div className="grid grid-cols-2 gap-2 py-2">
              <Link href="/profil" className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-semibold">
                <User size={16} /> Profilini Gör
              </Link>
              <Link href="/kurslar" className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-semibold">
                <LayoutGrid size={16} /> Tüm Kurslar
              </Link>
            </div>
            {menus
              .filter((m) => m.groups)
              .map((m) => (
                <div key={m.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-2">
                  <p className="flex items-center gap-2 px-2 pb-1 pt-1 text-sm font-semibold">
                    <m.icon size={16} className="text-accent" /> {m.label}
                  </p>
                  {m.banner && (
                    <Link href={m.banner.href} className="mb-1 flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2 text-sm font-medium">
                      <Compass size={15} /> {m.banner.title}
                    </Link>
                  )}
                  {m.groups!.map((g, gi) => (
                    <div key={g.title ?? gi}>
                      {g.title && <p className="px-3 pb-0.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{g.title}</p>}
                      {g.items.map((it) =>
                        it.href ? (
                          <Link key={it.label} href={it.href} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/[0.08] ${pathname === it.href ? "text-accent" : ""}`}>
                            {it.label}
                            {it.note && <span className="rounded-full bg-[image:var(--grad)] px-2 py-0.5 text-[10px] font-semibold text-white">{it.note}</span>}
                          </Link>
                        ) : null,
                      )}
                    </div>
                  ))}
                </div>
              ))}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link href="/kutuphane" className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-semibold">
                <Library size={16} /> Şarkı Kütüphanesi
              </Link>
              <Link href="/araclar" className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-semibold">
                <Wrench size={16} /> Araçlar
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
