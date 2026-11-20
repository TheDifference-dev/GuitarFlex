"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Gezinme ve alt bilgi olmadan açılan yollar (küçük pencereler) */
const YALIN = ["/metronom/mini"];

/** Sitenin kabuğu: üst gezinme, sayfa kabı ve alt bilgi. Yalın yollarda yalnız sayfanın kendisi çizilir. */
export default function SiteKabugu({ ust, alt, children }: { ust: ReactNode; alt: ReactNode; children: ReactNode }) {
  const yol = usePathname() ?? "";
  if (YALIN.some((y) => yol === y || yol.startsWith(y + "/"))) return <>{children}</>;
  return (
    <>
      {ust}
      {/* Sayfa kabı: bantlar (.bant) bu kabın dışına tam genişlikte taşar */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-8 sm:px-6">{children}</main>
      {alt}
    </>
  );
}
