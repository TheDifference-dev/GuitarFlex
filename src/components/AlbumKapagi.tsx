"use client";

import { useEffect, useRef, useState } from "react";
import { kapakBozuk, kapakIste, useKapak } from "@/lib/kapak";

/** Yer tutucu renkleri (zemin, yazı): koyu yazı açık zeminde, beyaz yazı koyu zeminde; hepsi ≥4,5:1 */
const RENKLER: [string, string][] = [
  ["#ff453a", "#2b0300"],
  ["#ff9f0a", "#2b1700"],
  ["#ffd60a", "#2b2300"],
  ["#30d158", "#04230c"],
  ["#64d2ff", "#002433"],
  ["#0a84ff", "#ffffff"],
  ["#5e5ce6", "#ffffff"],
  ["#bf5af2", "#1f0029"],
  ["#ff375f", "#2b0009"],
  ["#8e8e93", "#111113"],
];

function renkOf(ad: string) {
  let h = 0;
  for (const c of ad) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return RENKLER[h % RENKLER.length];
}

/**
 * Şarkının albüm kapağı (iTunes Search API, çalışma anında; bkz. lib/kapak.ts). Kart ekrana yaklaşınca istenir.
 * Kapak yoksa, gelmeden önce ya da hata olursa yer tutucu: şarkı adının baş harfi, addan türetilen renkte.
 * Görsel süs niteliğindedir (alt=""): şarkı adı yanında yazılıdır.
 */
export default function AlbumKapagi({
  sanatci,
  baslik,
  boyut,
  className = "",
  yuvarlak = "rounded-xl",
}: {
  sanatci: string;
  baslik: string;
  /** Kenar (px); verilmezse kapsayıcıyı doldurur (className ile boyutlandır) */
  boyut?: number;
  className?: string;
  yuvarlak?: string;
}) {
  const kutu = useRef<HTMLSpanElement>(null);
  const [gorunur, setGorunur] = useState(false);
  const [yuklendi, setYuklendi] = useState(false);
  const adres = useKapak(sanatci, baslik, gorunur);

  useEffect(() => {
    const el = kutu.current;
    if (!el || gorunur) return;
    if (typeof IntersectionObserver === "undefined") {
      // Gözlemci yoksa (çok eski tarayıcı) hemen iste
      kapakIste(sanatci, baslik);
      return;
    }
    const io = new IntersectionObserver(
      (girdiler) => {
        if (girdiler.some((g) => g.isIntersecting)) {
          setGorunur(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [gorunur, sanatci, baslik]);

  const [zemin, yazi] = renkOf(`${sanatci}|${baslik}`);
  const harf = (baslik.trim()[0] ?? "?").toLocaleUpperCase("tr");
  const olcu = boyut ? { width: boyut, height: boyut } : undefined;

  return (
    <span
      ref={kutu}
      data-kapak={adres ? "var" : adres === null ? "yok" : "bekliyor"}
      className={`relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden ${yuvarlak} ${className}`}
      style={{ ...olcu, background: zemin, color: yazi }}
      aria-hidden
    >
      <span className="font-semibold leading-none" style={{ fontSize: boyut ? Math.max(12, Math.round(boyut * 0.42)) : "2.5rem" }}>
        {harf}
      </span>
      {adres && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={adres}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setYuklendi(true)}
          onError={() => kapakBozuk(sanatci, baslik)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${yuklendi ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </span>
  );
}
