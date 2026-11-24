"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { bolumeKaydir } from "./site/BolumGezgini";
import GeriAlBildirimi from "./defter/GeriAlBildirimi";

/** Gezinme ve alt bilgi olmadan açılan yollar (küçük pencereler) */
const YALIN = ["/metronom/mini"];

/**
 * Kaydırma kuralı (bütün uygulama):
 *  • Bağlantıyla YENİ SAYFAYA geçince sayfa en üstten açılır. Next.js varsayılanı ("yeni sayfa görünüyorsa kaydırma
 *    konumunu koru") önceki sayfanın konumunu taşıyordu: ders kartına tıklayınca ders sayfası ortadan açılıyordu.
 *  • Geri / ileri (tarayıcı geçmişi) önceki konumu korur.
 *  • Adres bir bölüme gidiyorsa (#bolum-2.1, Seviye Yolu'ndan) o sayfa kendi bölümüne kaydırır.
 *  • Aynı sayfadaki bölüm bağlantıları (#…) zıplamaz, yumuşak kayar (bkz. site/BolumGezgini.tsx).
 */
function useSayfaKaydirma(yol: string) {
  const geriIleri = useRef(false);
  const onceki = useRef<string | null>(null);
  useEffect(() => {
    const f = () => (geriIleri.current = true);
    window.addEventListener("popstate", f);
    // Aynı sayfadaki çapa bağlantıları: yakalama evresinde (Next.js Link'ten önce) yumuşak kaydırmaya çevrilir
    const tik = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.dataset.kaydirma === "kendi") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
      const id = decodeURIComponent(url.hash.slice(1));
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      bolumeKaydir(id);
    };
    document.addEventListener("click", tik, true);
    return () => {
      window.removeEventListener("popstate", f);
      document.removeEventListener("click", tik, true);
    };
  }, []);
  useLayoutEffect(() => {
    const ilk = onceki.current === null;
    const ayni = onceki.current === yol;
    onceki.current = yol;
    if (ilk || ayni) return;
    if (geriIleri.current) {
      geriIleri.current = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [yol]);
}

/** Sitenin kabuğu: üst gezinme, sayfa kabı ve alt bilgi. Yalın yollarda yalnız sayfanın kendisi çizilir. */
export default function SiteKabugu({ ust, alt, children }: { ust: ReactNode; alt: ReactNode; children: ReactNode }) {
  const yol = usePathname() ?? "";
  useSayfaKaydirma(yol);
  if (YALIN.some((y) => yol === y || yol.startsWith(y + "/"))) return <>{children}</>;
  return (
    <>
      {ust}
      {/* Sayfa kabı: bantlar (.bant) bu kabın dışına tam genişlikte taşar */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-8 sm:px-6">{children}</main>
      {alt}
      <GeriAlBildirimi />
    </>
  );
}
