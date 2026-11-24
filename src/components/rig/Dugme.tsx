"use client";

import { useRef } from "react";

/**
 * Döner düğme (yalnız görsel ayar; ses işlemez). Fareyle yukarı/aşağı sürükle; klavyede ↑/→ artırır, ↓/← azaltır,
 * Page Up/Down ±2, Home/End 0/10. Değer 0–10, 0,1 adım.
 */
export default function Dugme({ ad, deger, onDegis }: { ad: string; deger: number; onDegis: (v: number) => void }) {
  const surukle = useRef<{ y: number; v: number } | null>(null);
  const a = -135 + (deger / 10) * 270;
  const yay = (aci: number) => {
    const t = ((aci - 90) * Math.PI) / 180;
    return [24 + Math.cos(t) * 19, 24 + Math.sin(t) * 19];
  };
  const [x0, y0] = yay(-135);
  const [x1, y1] = yay(a);
  const buyukYay = a + 135 > 180 ? 1 : 0;
  const ayarla = (v: number) => onDegis(Math.round(Math.max(0, Math.min(10, v)) * 10) / 10);
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        role="slider"
        tabIndex={0}
        aria-label={ad}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={deger}
        aria-valuetext={`${deger.toLocaleString("tr-TR")} / 10`}
        className="size-12 cursor-ns-resize touch-none rounded-full"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          surukle.current = { y: e.clientY, v: deger };
        }}
        onPointerMove={(e) => {
          if (!surukle.current) return;
          ayarla(surukle.current.v + (surukle.current.y - e.clientY) / 15);
        }}
        onPointerUp={() => (surukle.current = null)}
        onPointerCancel={() => (surukle.current = null)}
        onDoubleClick={() => ayarla(5)}
        onKeyDown={(e) => {
          const adim: Record<string, number> = { ArrowUp: 0.5, ArrowRight: 0.5, ArrowDown: -0.5, ArrowLeft: -0.5, PageUp: 2, PageDown: -2 };
          if (e.key in adim) ayarla(deger + adim[e.key]);
          else if (e.key === "Home") ayarla(0);
          else if (e.key === "End") ayarla(10);
          else return;
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <svg viewBox="0 0 48 48" className="size-12" aria-hidden>
          <path d={`M${x0} ${y0} A19 19 0 1 1 ${yay(135)[0]} ${yay(135)[1]}`} fill="none" stroke="currentColor" strokeOpacity={0.14} strokeWidth={3} strokeLinecap="round" />
          {deger > 0 && <path d={`M${x0} ${y0} A19 19 0 ${buyukYay} 1 ${x1} ${y1}`} fill="none" stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" />}
          <circle cx={24} cy={24} r={13} fill="var(--panel-2)" stroke="currentColor" strokeOpacity={0.12} />
          <line x1={24} y1={24} x2={24} y2={13.5} stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" transform={`rotate(${a} 24 24)`} />
        </svg>
      </div>
      <span className="max-w-[72px] truncate text-[11px] font-semibold text-muted" title={ad}>
        {ad}
      </span>
      <span className="text-[11px] tabular-nums text-muted/80">{deger.toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
    </div>
  );
}
