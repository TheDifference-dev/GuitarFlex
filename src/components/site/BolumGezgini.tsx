"use client";

import { useEffect, useState } from "react";

// Bölüm gezgini: kurs sayfaları, teori yolları ve rehberler aynı düzeni kullanır. Sayfa her zaman BÜTÜN bölümleri
// gösterir; kenar çubuğundaki (ya da içindekiler listesindeki) bölüme tıklamak filtre değildir, o bölüme yumuşak
// kaydırır. Yapışkan üst çubuk payı bölümün `scroll-margin-top` değerinden gelir (scroll-mt-*). Görünen bölüm
// kenar çubuğunda vurgulanır (scrollspy).

/** "Görünüyor" çizgisi (px): üst çubuk (48) + bölüm başlığı payı; bölüme kaydırılınca ilk alt bölümü de geçer */
const CIZGI = 190;

/**
 * Bölüme kaydırır. Hareket azaltma tercihi açıksa ya da `aninda` ise zıplar. `adres` (varsayılan): adres çubuğundaki
 * çapa sayfayı yeniden kaydırmadan güncellenir (bağlantı paylaşılabilsin; geri tuşu bölüm bölüm dolaşmasın).
 */
export function bolumeKaydir(id: string, { aninda = false, adres = true }: { aninda?: boolean; adres?: boolean } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ block: "start", behavior: aninda || azalt ? "instant" : "smooth" });
  if (adres) history.replaceState(history.state, "", `${location.pathname}${location.search}#${encodeURIComponent(id)}`);
  // Odak bölüme geçer (klavye ve ekran okuyucu kaydırılan yerden devam etsin), sayfa yeniden kaymaz
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}

/**
 * Scrollspy: verilen kimliklerden, tepesi yapışkan çubukların altındaki çizgiyi geçmiş SON bölümü döndürür
 * (hiçbiri geçmediyse ilki). Sayfanın sonuna gelindiyse son bölüm. Kaydırma ve boyut değişikliğinde güncellenir.
 */
export function useBolumIzleyici(idler: string[]): string | null {
  const anahtar = idler.join("|");
  const [gorunen, setGorunen] = useState<string | null>(null);
  useEffect(() => {
    const liste = anahtar ? anahtar.split("|") : [];
    if (!liste.length) return;
    let kare = 0;
    const olc = () => {
      kare = 0;
      let secilen = liste[0];
      for (const id of liste) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= CIZGI) secilen = id;
      }
      const sonda = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (sonda) {
        // Sayfanın sonu: ekranda görünen en alttaki bölüm (kısa son bölümler de vurgulanabilsin)
        for (const id of liste) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top < window.innerHeight * 0.6) secilen = id;
        }
      }
      setGorunen((x) => (x === secilen ? x : secilen));
    };
    const iste = () => {
      if (!kare) kare = requestAnimationFrame(olc);
    };
    iste();
    window.addEventListener("scroll", iste, { passive: true });
    window.addEventListener("resize", iste);
    return () => {
      cancelAnimationFrame(kare);
      window.removeEventListener("scroll", iste);
      window.removeEventListener("resize", iste);
    };
  }, [anahtar]);
  return anahtar && gorunen && anahtar.split("|").includes(gorunen) ? gorunen : anahtar ? anahtar.split("|")[0] : null;
}
