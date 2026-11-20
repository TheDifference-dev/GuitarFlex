"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ChevronDown, ChevronLeft, Menu as MenuIcon, User, X } from "lucide-react";
import { SITE } from "@/config/site";

type Bag = { href: string; label: string };
type Sutun = { baslik: string; items: Bag[] };
type Menu = {
  id: string;
  label: string;
  /** Üst bağlantının gittiği bölüm sayfası */
  href: string;
  active: (p: string) => boolean;
  /** Mega menünün ilk sütunu: büyük bağlantılar */
  buyuk: Bag[];
  sutunlar: Sutun[];
};

/** Üst gezinme ve mega menüler (apple.com'daki gibi: büyük bağlantılı ilk sütun, yanında başlıklı listeler) */
const MENULER: Menu[] = [
  {
    id: "calis",
    label: "Gitar Çalış",
    href: "/kurslar",
    active: (p) => ["/calis", "/akustik", "/elektro", "/kurslar", "/nasil-calismaliyim", "/seviye"].some((x) => p.startsWith(x)) && !p.startsWith("/calis/armoni"),
    buyuk: [
      { href: "/elektro", label: "Elektro Gitar" },
      { href: "/akustik", label: "Akustik Gitar" },
      { href: "/seviye", label: "Seviye Yolu" },
      { href: "/kurslar", label: "Tüm Kurslar" },
    ],
    sutunlar: [
      {
        baslik: "Elektro Gitar",
        items: [
          { href: "/elektro", label: "Teknik Egzersizler" },
          { href: "/seviye", label: "Seviye Yolu" },
          { href: "/calis/sifirdan-baslangic-rehberi", label: "Sıfırdan Başlangıç" },
          { href: "/calis/akor-yolu", label: "Akor Yolu" },
        ],
      },
      {
        baslik: "Akustik Gitar",
        items: [
          { href: "/akustik", label: "Teknik Egzersizler" },
          { href: "/akustik/sarkilar", label: "Akustik Şarkılar" },
        ],
      },
      {
        baslik: "Müzisyenlik",
        items: [
          { href: "/calis/gf-stiller", label: "Stiller" },
          { href: "/calis/gf-ekler", label: "Müzisyenlik" },
          { href: "/sarkilar/dogaclama", label: "Doğaçlama Çal" },
          { href: "/nasil-calismaliyim", label: "Nasıl Çalışmalıyım?" },
        ],
      },
    ],
  },
  {
    id: "teori",
    label: "Teori",
    href: "/teori",
    active: (p) => p.startsWith("/teori") || p.startsWith("/calis/armoni"),
    buyuk: [
      { href: "/teori", label: "Müzik Teorisi" },
      { href: "/calis/armoni", label: "Armoni" },
    ],
    sutunlar: [
      {
        baslik: "Pratik Yolları",
        items: [
          { href: "/teori/yol/ritim", label: "Ritim" },
          { href: "/teori/yol/klavye", label: "Klavye Görselleştirme" },
          { href: "/teori/yol/kulak", label: "Kulak Eğitimi" },
          { href: "/teori/yol/okuma", label: "Okuma" },
          { href: "/teori/yol/armoni", label: "Armoni Pratikleri" },
        ],
      },
      {
        baslik: "Keşfet",
        items: [
          { href: "/teori#sap", label: "Sap Gezgini" },
          { href: "/teori#dersler", label: "Teori Dersleri" },
        ],
      },
    ],
  },
  {
    id: "kutuphane",
    label: "Kütüphane",
    href: "/kutuphane",
    active: (p) => p.startsWith("/kutuphane") || p.startsWith("/sarkilar") || p.startsWith("/oynatici"),
    buyuk: [
      { href: "/kutuphane", label: "Şarkı Kütüphanesi" },
      { href: "/sarkilar", label: "Popüler Şarkılar" },
    ],
    sutunlar: [
      {
        baslik: "Çal",
        items: [
          { href: "/oynatici", label: "Tabla Keşfet" },
          { href: "/sarkilar/dogaclama", label: "Doğaçlama Çal" },
          { href: "/akustik/sarkilar", label: "Akustik Şarkılar" },
        ],
      },
    ],
  },
  {
    id: "araclar",
    label: "Araçlar",
    href: "/araclar",
    active: (p) => p.startsWith("/araclar"),
    buyuk: [{ href: "/araclar", label: "Araçlar" }],
    sutunlar: [
      {
        baslik: "Pratik araçları",
        items: [
          { href: "/araclar#metronom", label: "Metronom" },
          { href: "/araclar#nota-testi", label: "Nota Bulma Testi" },
          { href: "/teori#sap", label: "Sap Gezgini" },
        ],
      },
    ],
  },
  {
    id: "profil",
    label: "Profil",
    href: "/profil",
    active: (p) => p.startsWith("/profil") || p.startsWith("/marka"),
    buyuk: [{ href: "/profil", label: "Profil" }],
    sutunlar: [
      {
        baslik: "İlerleme",
        items: [
          { href: "/profil", label: "Günlük görevler ve seri" },
          { href: "/profil", label: "Madalyalar ve başarımlar" },
        ],
      },
      { baslik: "GuitarFlex", items: [{ href: "/marka", label: "Marka" }] },
    ],
  },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [mobil, setMobil] = useState(false);
  const tetik = useRef<Record<string, HTMLAnchorElement | null>>({});
  const panel = useRef<Record<string, HTMLDivElement | null>>({});
  const zaman = useRef<ReturnType<typeof setTimeout> | null>(null);

  const temizle = () => {
    if (zaman.current) clearTimeout(zaman.current);
    zaman.current = null;
  };
  // Esc: menüyü kapat, odağı üst bağlantıya geri ver
  useEffect(() => {
    if (!open && !mobil) return;
    const tus = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMobil(false);
      if (open) tetik.current[open]?.focus();
      setOpen(null);
    };
    document.addEventListener("keydown", tus);
    return () => document.removeEventListener("keydown", tus);
  }, [open, mobil]);

  useEffect(() => temizle, []);

  /** Panelin içindeki bağlantılar arasında ok tuşlarıyla gezinme */
  const panelTus = (id: string, e: ReactKeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
    const linkler = [...(panel.current[id]?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? [])];
    if (!linkler.length) return;
    e.preventDefault();
    const i = linkler.indexOf(document.activeElement as HTMLAnchorElement);
    const n =
      e.key === "Home" ? 0 : e.key === "End" ? linkler.length - 1 : e.key === "ArrowDown" ? Math.min(linkler.length - 1, i + 1) : i <= 0 ? -1 : i - 1;
    if (n < 0) tetik.current[id]?.focus();
    else linkler[n].focus();
  };

  /** Üst bağlantılarda: ↓ menüyü açar ve ilk bağlantıya geçer; ←/→ üst öğeler arasında gezer */
  const ustTus = (i: number, e: ReactKeyboardEvent) => {
    const m = MENULER[i];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(m.id);
      requestAnimationFrame(() => panel.current[m.id]?.querySelector<HTMLAnchorElement>("a[href]")?.focus());
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const j = (i + (e.key === "ArrowRight" ? 1 : MENULER.length - 1)) % MENULER.length;
      tetik.current[MENULER[j].id]?.focus();
      if (open) setOpen(MENULER[j].id);
    }
  };

  const acikMenu = MENULER.find((m) => m.id === open);
  const ikonBtn = "flex size-8 items-center justify-center rounded-full text-text/80 transition hover:bg-ink/[0.07] hover:text-text";

  return (
    <>
      <header
        className={`uzay-kapsam sticky top-0 z-40 ${acikMenu ? "bg-bg" : "glass"} border-b border-black/20`}
        onMouseLeave={() => {
          temizle();
          zaman.current = setTimeout(() => setOpen(null), 180);
        }}
        onMouseEnter={temizle}
        onBlur={(e) => {
          // Odak açık menünün (üst bağlantı + panel) dışına çıkınca menüyü kapat
          const hedef = e.relatedTarget as HTMLElement | null;
          if (open && hedef?.closest("[data-menu]")?.getAttribute("data-menu") !== open) setOpen(null);
        }}
      >
        <nav aria-label="Ana gezinme" className="mx-auto flex h-12 max-w-[1100px] items-center gap-1 px-3 sm:px-5">
          <button type="button" onClick={() => router.back()} className={ikonBtn} title="Önceki sayfa" aria-label="Önceki sayfa">
            <ChevronLeft size={18} />
          </button>
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-lg px-1.5 py-1 text-[15px] font-semibold tracking-tight text-text"
            aria-label={`${SITE.name} ana sayfa`}
            aria-current={pathname === "/" ? "page" : undefined}
            onMouseEnter={() => open && setOpen(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SITE.logo} alt="" width={22} height={22} className="size-[22px] rounded-[6px]" />
            <span className="hidden sm:inline">{SITE.name}</span>
          </Link>

          {/* Masaüstü: ortalanmış kısa bağlantılar */}
          <ul className="mx-auto hidden items-center gap-1 lg:flex xl:gap-3">
            {MENULER.map((m, i) => {
              const aktif = m.active(pathname);
              const acik = open === m.id;
              return (
                <li key={m.id} data-menu={m.id} className="relative flex items-center">
                  <Link
                    ref={(el) => {
                      tetik.current[m.id] = el;
                    }}
                    href={m.href}
                    onMouseEnter={() => {
                      temizle();
                      // İlk açılışta küçük gecikme: imleç çubuğun üstünden geçerken menü açılıp kapanmasın
                      if (open) setOpen(m.id);
                      else zaman.current = setTimeout(() => setOpen(m.id), 110);
                    }}
                    onClick={() => setOpen(null)}
                    onKeyDown={(e) => ustTus(i, e)}
                    aria-current={aktif ? "page" : undefined}
                    className={`rounded-md px-2.5 py-1.5 text-[13px] transition ${acik || aktif ? "text-text" : "text-text/80 hover:text-text"} ${aktif ? "font-semibold" : ""}`}
                  >
                    {m.label}
                  </Link>
                  {/* Klavye için menü düğmesi: odaklanınca görünür (apple.com'daki gibi) */}
                  <button
                    type="button"
                    aria-expanded={acik}
                    aria-controls={`mega-${m.id}`}
                    aria-label={`${m.label} menüsü`}
                    onClick={() => {
                      const ac = !acik;
                      setOpen(ac ? m.id : null);
                      if (ac) requestAnimationFrame(() => panel.current[m.id]?.querySelector<HTMLAnchorElement>("a[href]")?.focus());
                    }}
                    className="-ml-1.5 flex size-5 items-center justify-center rounded text-muted opacity-0 focus-visible:opacity-100"
                  >
                    <ChevronDown size={12} className={`transition ${acik ? "rotate-180" : ""}`} />
                  </button>
                  {acik && (
                    <div
                      id={`mega-${m.id}`}
                      ref={(el) => {
                        panel.current[m.id] = el;
                      }}
                      onKeyDown={(e) => panelTus(m.id, e)}
                      onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(null)}
                      className="mega fixed inset-x-0 top-12 z-40 border-b border-line bg-bg"
                    >
                      <div className="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] gap-10 px-8 pb-14 pt-9 xl:px-12">
                        <div>
                          <p className="mb-3 text-xs text-muted">Keşfet: {m.label}</p>
                          <ul className="space-y-2">
                            {m.buyuk.map((b) => (
                              <li key={b.href + b.label}>
                                <Link href={b.href} className="baslik-orta inline-block rounded-md !text-[26px] !leading-tight text-text transition hover:text-accent">
                                  {b.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {m.sutunlar.map((s) => (
                          <div key={s.baslik}>
                            <p className="mb-3 text-xs text-muted">{s.baslik}</p>
                            <ul className="space-y-2">
                              {s.items.map((b) => (
                                <li key={b.href + b.label}>
                                  <Link href={b.href} className="inline-block rounded text-[13px] font-semibold text-text/90 transition hover:text-accent">
                                    {b.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-0">
            <Link
              href="/profil"
              className={`${ikonBtn} ${pathname.startsWith("/profil") ? "text-accent" : ""}`}
              title="Profil"
              aria-label="Profil"
              onMouseEnter={() => open && setOpen(null)}
            >
              <User size={17} />
            </Link>
            <button
              type="button"
              onClick={() => setMobil((v) => !v)}
              className={`${ikonBtn} lg:hidden`}
              aria-expanded={mobil}
              aria-controls="mobil-menu"
              aria-label={mobil ? "Menüyü kapat" : "Menüyü aç"}
              title="Menü"
            >
              {mobil ? <X size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </nav>

        {/* Mobil menü: büyük bağlantılar ve sütunlar alt alta */}
        {mobil && (
          <div
            id="mobil-menu"
            className="max-h-[calc(100dvh-3rem)] overflow-y-auto border-t border-line bg-bg px-6 pb-8 pt-4 lg:hidden"
            onClick={(e) => (e.target as HTMLElement).closest("a") && setMobil(false)}
          >
            <div className="mx-auto grid max-w-xl gap-6">
              {MENULER.map((m) => (
                <div key={m.id}>
                  <p className="mb-1 text-xs text-muted">{m.label}</p>
                  {m.buyuk.map((b) => (
                    <Link key={b.href + b.label} href={b.href} className="block py-1 text-2xl font-semibold tracking-tight">
                      {b.label}
                    </Link>
                  ))}
                  {m.sutunlar.flatMap((s) => s.items).map((b) => (
                    <Link key={b.href + b.label} href={b.href} className="block py-1 text-sm font-semibold text-text/85">
                      {b.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>
      {/* Mega menü açıkken sayfa hafifçe bulanıklaşır */}
      {acikMenu && <div aria-hidden className="mega-perde fixed inset-0 top-12 z-30 hidden bg-black/20 backdrop-blur-md lg:block" onMouseEnter={() => setOpen(null)} />}
    </>
  );
}
