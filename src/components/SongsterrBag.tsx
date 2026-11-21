"use client";

import type { ComponentProps, ReactNode } from "react";
import { sarkiKutuphanesiAc, songsterrAdresi } from "@/lib/songsterr";

/**
 * Şarkı Kütüphanesi (Songsterr) bağlantısı. Masaüstünde Songsterr uygulama içi pencerede açılır; web'de yeni sekmede.
 * `q`: arama metni ya da Songsterr bağlantısı (boşsa Songsterr ana sayfası).
 */
export default function SongsterrBag({
  q,
  children,
  onAc,
  ...rest
}: { q?: string; children: ReactNode; onAc?: () => void } & Omit<ComponentProps<"a">, "href" | "target" | "rel" | "onClick" | "children">) {
  return (
    <a
      {...rest}
      href={songsterrAdresi(q)}
      target="_blank"
      rel="noopener noreferrer"
      data-songsterr
      onClick={(e) => {
        onAc?.();
        if (sarkiKutuphanesiAc(q)) e.preventDefault();
      }}
    >
      {children}
    </a>
  );
}
