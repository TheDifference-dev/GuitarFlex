"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

type Props = {
  /** Paneli açan düğme: dışına tıklama sayılmaz, Esc ile odak ona döner */
  tetik: RefObject<HTMLElement | null>;
  onKapat: () => void;
  /** Ekran okuyucu adı (role="dialog") */
  etiket: string;
  /** Konum ve genişlik (varsayılan: çubuğun altında, sağa yaslı) */
  className?: string;
  children: ReactNode;
};

/**
 * Kontrol çubuğundan açılan küçük panel (hız, döngü, ayarlar, mikser). Dışına tıklayınca ya da Esc ile kapanır;
 * açılınca odak panele geçer, Esc ile açan düğmeye döner. İçinde Tab ile gezilir.
 */
export default function Acilir({ tetik, onKapat, etiket, className = "right-0", children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const kapatRef = useRef(onKapat);
  useEffect(() => {
    kapatRef.current = onKapat;
  });

  useEffect(() => {
    // Odak panele geçer: Tab ile içindeki öğeler gezilir, Esc ile açan düğmeye dönülür
    ref.current?.focus({ preventScroll: true });
    const dis = (e: PointerEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || tetik.current?.contains(t)) return;
      kapatRef.current();
    };
    const tus = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      kapatRef.current();
      tetik.current?.focus({ preventScroll: true });
    };
    window.addEventListener("pointerdown", dis);
    window.addEventListener("keydown", tus);
    return () => {
      window.removeEventListener("pointerdown", dis);
      window.removeEventListener("keydown", tus);
    };
  }, [tetik]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={etiket}
      tabIndex={-1}
      // Odak halkası panelin kendisinde gösterilmez (içindeki denetimlerde görünür); genel :focus-visible kuralını ezer
      style={{ outline: "none" }}
      data-acilir
      className={`bg-elevated absolute top-full z-30 mt-1.5 max-h-[min(75vh,44rem)] overflow-y-auto rounded-2xl border border-ink/10 p-4 text-text shadow-[var(--shadow-pop)] ${className}`}
    >
      {children}
    </div>
  );
}
