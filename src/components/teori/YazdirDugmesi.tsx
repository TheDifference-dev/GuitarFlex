"use client";

import { Printer } from "lucide-react";

/** Dersi tek A4 sayfası olarak yazdırır ya da PDF'e kaydeder (tarayıcının yazdırma penceresi). */
export default function YazdirDugmesi() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-secondary inline-flex items-center gap-1.5 px-[15px] py-2 text-[14px] print:hidden">
      <Printer size={16} aria-hidden /> Yazdır / PDF
    </button>
  );
}
