"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Menu as MenuIcon, User, X } from "lucide-react";
import { SITE } from "@/config/site";
import UygulamaSimgesi from "./site/UygulamaSimgesi";
import SongsterrBag from "./SongsterrBag";
import { kursSimgesi, yerSimgesi, type SimgeTanim } from "@/lib/simge";
import { RIG_SIMGESI } from "./rig/simge";

/** songsterr: bağlantı Şarkı Kütüphanesini (Songsterr) uygulama içi pencerede açar; href yalnız web'de yedek */
type Bag = { href: string; label: string; songsterr?: boolean };
/** Sütun: başlık `href` alırsa başlığın kendisi bağlantıdır (aynı sayfaya giden kardeş seçeneklerin yerine geçen üst başlık) */
type Sutun = { baslik: string; href?: string; items: Bag[] };
type Menu = {
  id: string;
  label: string;
  /** Üst bağlantının gittiği bölüm sayfası */
  href: string;
  active: (p: string) => boolean;
  /** Mega menünün ilk sütunu: uygulama simgeli büyük bağlantılar */
  buyuk: (Bag & { simge: SimgeTanim })[];
  sutunlar: Sutun[];
};

/**
 * Üst gezinme ve mega menüler (apple.com'daki gibi: büyük bağlantılı ilk sütun, yanında başlıklı listeler).
 * Kural: bir menüde AYNI SAYFAYA (ya da aynı sayfanın çapalarına) giden iki seçenek olmaz; bunlar tek bir bağlantıya
 * ya da bağlantılı sütun başlığına (Sutun.href) indirilir. Denetim: menuDenetle().
 */
export const MENULER: Menu[] = [
  {
    id: "calis",
    label: "Gitar Çalış",
    href: "/kurslar",
    active: (p) => ["/calis", "/akustik", "/elektro", "/kurslar", "/nasil-calismaliyim", "/seviye", "/sarkilar/dogaclama"].some((x) => p.startsWith(x)) && !p.startsWith("/calis/armoni"),
    buyuk: [
      { href: "/kurslar", label: "Tüm Kurslar", simge: yerSimgesi("kurslar") },
      { href: "/seviye", label: "Seviye Yolu", simge: yerSimgesi("seviye") },
    ],
    sutunlar: [
      {
        // Başlık "Elektro Gitar" = /elektro (eski "Elektro Gitar" büyük bağlantısı ve "Teknik Egzersizler" bunun yerine)
        baslik: "Elektro Gitar",
        href: "/elektro",
        items: [
          { href: "/calis/sifirdan-baslangic-rehberi", label: "Sıfırdan Başlangıç" },
          { href: "/calis/akor-yolu", label: "Akor Yolu" },
        ],
      },
      {
        baslik: "Akustik Gitar",
        href: "/akustik",
        items: [{ href: "/akustik/sarkilar", label: "Akustik Şarkılar" }],
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
      { href: "/teori", label: "Müzik Teorisi", simge: yerSimgesi("teori") },
      { href: "/calis/armoni", label: "Armoni", simge: kursSimgesi("armoni") },
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
    // "Şarkılarla Öğren" ayrı menü değil: Şarkı Kütüphanesi'nin Rehber Şarkılar / Tüm Şarkılar sekmeleri
    id: "kutuphane",
    label: "Şarkı Kütüphanesi",
    href: "/sarki-kutuphanesi",
    active: (p) => p.startsWith("/sarki-kutuphanesi") || p === "/sarkilar",
    buyuk: [
      { href: "/sarki-kutuphanesi", label: "Şarkı Kütüphanesi", simge: yerSimgesi("sarki-kutuphanesi") },
      { href: "/sarki-kutuphanesi/rehber", label: "Rehber Şarkılar", simge: yerSimgesi("sarkilar") },
      { href: "/sarki-kutuphanesi/tum", label: "Tüm Şarkılar", simge: yerSimgesi("tum-sarkilar") },
    ],
    sutunlar: [
      {
        baslik: "Songsterr",
        items: [{ href: "https://www.songsterr.com/", label: "Songsterr'i aç", songsterr: true }],
      },
    ],
  },
  {
    id: "defter",
    label: "Çalışma Defteri",
    href: "/defter",
    active: (p) => p.startsWith("/defter"),
    buyuk: [{ href: "/defter", label: "Çalışma Defteri", simge: yerSimgesi("defter") }],
    sutunlar: [],
  },
  {
    id: "araclar",
    label: "Araçlar",
    href: "/araclar",
    active: (p) => p.startsWith("/araclar") || p.startsWith("/kutuphane") || p.startsWith("/oynatici"),
    buyuk: [
      // Metronom ve Nota Testi aynı sayfanın (/araclar) iki çapasıydı: tek "Pratik Araçları" bağlantısı
      { href: "/araclar", label: "Pratik Araçları", simge: yerSimgesi("metronom") },
      { href: "/kutuphane", label: "Tab Oynatıcı ve Dosyalarım", simge: yerSimgesi("kutuphane") },
      { href: "/oynatici", label: "Tabla Keşfet", simge: yerSimgesi("oynatici") },
    ],
    sutunlar: [
      {
        baslik: "Ayrıca",
        items: [{ href: "/teori#sap", label: "Sap Gezgini" }],
      },
    ],
  },
  {
    id: "rig",
    label: "Rig'im",
    href: "/rig",
    active: (p) => p.startsWith("/rig"),
    // "Sinyal zinciri" (/rig) ve "Ekipman kitaplığı" (/rig#kitaplik) aynı sayfaydı: tek "Rig'im" bağlantısı
    buyuk: [{ href: "/rig", label: "Rig'im", simge: RIG_SIMGESI }],
    sutunlar: [],
  },
  {
    id: "profil",
    label: "Profil",
    href: "/profil",
    active: (p) => p.startsWith("/profil") || p.startsWith("/marka"),
    // Profil sayfasının bölümleri (görevler, madalyalar, Şarkılarım, Görünüm) aynı sayfada: tek "Profil" bağlantısı.
    buyuk: [{ href: "/profil", label: "Profil", simge: yerSimgesi("profil") }],
    sutunlar: [
      {
        baslik: "GuitarFlex",
        items: [{ href: "/marka", label: "Marka" }],
      },
    ],
  },
];

/** Aynı menüde aynı sayfaya (çapası atılmış adres) giden seçenek çiftleri; boş dizi = kural sağlanıyor */
export function menuDenetle(menuler: Menu[] = MENULER): string[] {
  const out: string[] = [];
  const sayfa = (h: string) => h.split("#")[0].replace(/\/$/, "") || "/";
  for (const m of menuler) {
    const goruldu = new Map<string, string>();
    const bags = [...m.buyuk, ...m.sutunlar.flatMap((s) => [...(s.href ? [{ href: s.href, label: s.baslik }] : []), ...s.items])];
    for (const b of bags) {
      const k = sayfa(b.href);
      if (goruldu.has(k)) out.push(`${m.label}: "${goruldu.get(k)}" ve "${b.label}" → ${k}`);
      else goruldu.set(k, b.label);
    }
  }
  return out;
}

const BUYUK_BAG =
  "inline-flex items-center gap-3 rounded-md font-[family-name:var(--font-display)] text-[24px] font-semibold leading-[1.1667] tracking-[0.009em] text-[#e8e8ed] transition hover:text-white hover:underline hover:underline-offset-4";
const KUCUK_BAG = "rounded text-[12px] font-semibold leading-[1.34] text-[#e8e8ed] transition hover:text-white hover:underline hover:underline-offset-2";

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
  const ikonBtn = "flex size-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/[0.08] hover:text-white";

  return (
    <>
      <header
        // Açık mega menüde çubuk bulanıklığı kaldırılır (sabit konumlu panel çubuğa göre değil, pencereye göre yerleşsin);
        // arkadaki sayfayı perde bulanıklaştırır.
        className={`uzay-kapsam sticky top-0 z-40 ${acikMenu ? "bg-[var(--gnav)]" : "gnav"}`}
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
        <nav aria-label="Ana gezinme" className="mx-auto flex h-12 max-w-[1024px] items-center gap-1 px-4">
          <button type="button" onClick={() => router.back()} className={ikonBtn} title="Önceki sayfa" aria-label="Önceki sayfa">
            <ChevronLeft size={18} />
          </button>
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-1.5 py-1 text-[14px] font-semibold tracking-[-0.01em] text-white/90 transition hover:text-white"
            aria-label={`${SITE.name} ana sayfa`}
            aria-current={pathname === "/" ? "page" : undefined}
            onMouseEnter={() => open && setOpen(null)}
          >
            {/* Çerçevesiz logo: kutu ya da köşe yok; çizimin zemini kenarlarda şeffaflaşıp çubuğa karışır */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SITE.logo} alt="" width={34} height={34} className="-my-2 -ml-1 size-[34px]" />
            <span className="hidden sm:inline">{SITE.name}</span>
          </Link>

          {/* Masaüstü: çubuk boyunca eşit aralıklı kısa bağlantılar (apple.com gibi) */}
          <ul className="mx-8 hidden flex-1 items-center justify-between lg:flex">
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
                    className={`rounded-md px-2 py-1.5 text-[12px] tracking-[-0.01em] transition ${acik || aktif ? "text-white" : "text-white/80 hover:text-white"} ${aktif ? "font-semibold" : ""}`}
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
                    className="-ml-1.5 flex size-5 items-center justify-center rounded text-white/80 opacity-0 focus-visible:opacity-100"
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
                      className="mega gnav fixed inset-x-0 top-12 z-40"
                    >
                      <div className="mx-auto grid max-w-[1024px] grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] gap-11 px-6 pb-[84px] pt-10">
                        <div>
                          <p className="mb-3.5 text-[12px] leading-4 text-[#aeaeb2]">Keşfedin: {m.label}</p>
                          <ul className="space-y-2.5">
                            {m.buyuk.map((b) => (
                              <li key={b.href + b.label}>
                                {b.songsterr ? (
                                  <SongsterrBag className={BUYUK_BAG}>
                                    <UygulamaSimgesi simge={b.simge} boyut={32} /> {b.label} <ExternalLink size={16} aria-hidden className="opacity-70" />
                                  </SongsterrBag>
                                ) : (
                                  <Link href={b.href} className={BUYUK_BAG}>
                                    <UygulamaSimgesi simge={b.simge} boyut={32} /> {b.label}
                                  </Link>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {m.sutunlar.map((s) => (
                          <div key={s.baslik}>
                            {s.href ? (
                              <Link href={s.href} className={`${KUCUK_BAG} mb-3.5 inline-flex items-center gap-1 !text-[14px]`} data-sutun-basligi>
                                {s.baslik} <ChevronRight size={12} aria-hidden className="opacity-70" />
                              </Link>
                            ) : (
                              <p className="mb-3.5 text-[12px] leading-4 text-[#aeaeb2]">{s.baslik}</p>
                            )}
                            <ul className="space-y-2.5">
                              {s.items.map((b) => (
                                <li key={b.href + b.label}>
                                  {b.songsterr ? (
                                    <SongsterrBag className={`${KUCUK_BAG} inline-flex items-center gap-1`}>
                                      {b.label} <ExternalLink size={11} aria-hidden />
                                    </SongsterrBag>
                                  ) : (
                                    <Link href={b.href} className={`${KUCUK_BAG} inline-block`}>
                                      {b.label}
                                    </Link>
                                  )}
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
              className={`${ikonBtn} ${pathname.startsWith("/profil") ? "!text-white" : ""}`}
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
            className="max-h-[calc(100dvh-3rem)] overflow-y-auto border-t border-line bg-[#1d1d1f] px-6 pb-8 pt-4 lg:hidden"
            onClick={(e) => (e.target as HTMLElement).closest("a") && setMobil(false)}
          >
            <div className="mx-auto grid max-w-xl gap-6">
              {MENULER.map((m) => (
                <div key={m.id}>
                  <p className="mb-1 text-xs text-muted">{m.label}</p>
                  {m.buyuk.map((b) =>
                    b.songsterr ? (
                      <SongsterrBag key={b.href + b.label} className="block py-1 text-2xl font-semibold tracking-tight">
                        {b.label}
                      </SongsterrBag>
                    ) : (
                      <Link key={b.href + b.label} href={b.href} className="block py-1 text-2xl font-semibold tracking-tight">
                        {b.label}
                      </Link>
                    ),
                  )}
                  {m.sutunlar.flatMap((s) => [...(s.href ? [{ href: s.href, label: s.baslik }] : []), ...s.items] as Bag[]).map((b) =>
                    b.songsterr ? (
                      <SongsterrBag key={b.href + b.label} className="block py-1 text-sm font-semibold text-text/85">
                        {b.label}
                      </SongsterrBag>
                    ) : (
                      <Link key={b.href + b.label} href={b.href} className="block py-1 text-sm font-semibold text-text/85">
                        {b.label}
                      </Link>
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>
      {/* Mega menü açıkken sayfa bulanıklaşır ve hafifçe kararır (çubuğun arkası da: çubuk o sırada kendisi bulanıklaştırmaz) */}
      {acikMenu && <div aria-hidden className="mega-perde fixed inset-0 z-30 hidden bg-black/25 backdrop-blur-[20px] lg:block" onMouseEnter={() => setOpen(null)} />}
    </>
  );
}
