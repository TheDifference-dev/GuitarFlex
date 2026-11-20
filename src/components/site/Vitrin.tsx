// apple.com tasarım dilinden ilhamla ortak yapı taşları: tam genişlikte bantlar, dev başlıklı sayfa başı,
// "Başla ›" metin bağlantıları ve büyük döşemeler. Renkler globals.css'teki değişkenlerden gelir.
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import Kirinti, { type KirintiHalka } from "./Kirinti";

export type BantTonu = "beyaz" | "gri" | "koyu" | "uzay";

/** Tam genişlikte bölüm; içerik sayfa kabının içinde kalır. `bas`: sayfanın ilk bandı (üst çubuğa yapışır). */
export function Bant({
  ton = "beyaz",
  bas = false,
  className = "",
  children,
  ...rest
}: { ton?: BantTonu; bas?: boolean; className?: string; children: ReactNode } & Omit<ComponentProps<"section">, "className" | "children">) {
  return (
    <section className={`bant bant-${ton} ${ton === "uzay" ? "uzay-kapsam" : ""} ${bas ? "bant-bas" : ""} ${className}`} {...rest}>
      {children}
    </section>
  );
}

/** "Daha fazla bilgi ›" biçiminde lacivert metin bağlantı */
export function MetinBag({
  href,
  children,
  className = "",
  buyuk = false,
  geri = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  buyuk?: boolean;
  /** Geri yönlü bağlantı: ok başta (‹) */
  geri?: boolean;
}) {
  return (
    <Link href={href} className={`metin-bag ${buyuk ? "text-[19px] sm:text-[21px]" : "text-[17px]"} ${className}`}>
      {geri && <span aria-hidden>‹</span>}
      {children}
      {!geri && <span aria-hidden>›</span>}
    </Link>
  );
}

/** Hap biçimli birincil düğme (bağlantı) */
export function HapBag({ href, children, className = "", ikincil = false, title }: { href: string; children: ReactNode; className?: string; ikincil?: boolean; title?: string }) {
  return (
    <Link href={href} title={title} className={`${ikincil ? "btn-secondary" : "btn-primary"} px-[22px] py-[11px] text-[17px] font-normal ${className}`}>
      {children}
    </Link>
  );
}

/** Başlık altındaki bağlantı/düğme sırası */
export function Eylemler({ children, className = "", sol = false }: { children: ReactNode; className?: string; sol?: boolean }) {
  return <div className={`mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 ${sol ? "" : "justify-center"} ${className}`}>{children}</div>;
}

/**
 * Sayfa başı: apple.com ürün sayfaları gibi ortalanmış dev başlık, kısa alt başlık ve bağlantılar.
 * Sayfanın ilk öğesi olarak kullanılır (üst çubuğa yapışır).
 */
export function SayfaBasi({
  baslik,
  ust,
  alt,
  kirinti,
  children,
  ton = "beyaz",
  boyut = "dev",
  sol = false,
  ek,
  className = "",
  bas = true,
}: {
  baslik: ReactNode;
  /** Başlık üstündeki küçük etiket */
  ust?: ReactNode;
  /** Kısa alt başlık */
  alt?: ReactNode;
  kirinti?: KirintiHalka[];
  /** Bağlantılar ve düğmeler (Eylemler içinde gösterilir) */
  children?: ReactNode;
  ton?: BantTonu;
  boyut?: "dev" | "buyuk" | "orta";
  /** Sola hizalı (ders sayfası gibi çalışma ekranları) */
  sol?: boolean;
  /** Başlık bloğunun altında, tam genişlikte ek içerik */
  ek?: ReactNode;
  className?: string;
  /** Sayfanın ilk öğesi mi (üst çubuğa yapışır); üstünde yerel gezinme çubuğu varsa false */
  bas?: boolean;
}) {
  const bs = boyut === "dev" ? "baslik-dev" : boyut === "buyuk" ? "baslik-buyuk" : "baslik-orta";
  return (
    <Bant ton={ton} bas={bas} className={`${sol ? "pb-10 pt-8" : "pb-14 pt-10 sm:pb-16"} ${className}`}>
      {kirinti && <Kirinti halkalar={kirinti} className={sol ? "mb-6" : "mb-8 justify-center"} />}
      <div className={sol ? "" : "mx-auto max-w-[980px] text-center"}>
        {ust && <p className={`text-[17px] font-semibold ${ton === "koyu" || ton === "uzay" ? "text-accent" : "text-muted"} sm:text-[19px]`}>{ust}</p>}
        <h1 className={`${bs} ${ust ? "mt-2" : ""} text-balance`}>{baslik}</h1>
        {alt && <p className={`alt-baslik mt-4 text-pretty text-muted ${sol ? "max-w-3xl" : "mx-auto max-w-[760px]"}`}>{alt}</p>}
        {children && <Eylemler sol={sol}>{children}</Eylemler>}
      </div>
      {ek}
    </Bant>
  );
}

/**
 * Yerel gezinme çubuğu (apple.com ürün sayfalarındaki gibi): solda bölüm adı, sağda kısa bağlantılar.
 * Üst çubuğun hemen altına yapışır; sayfanın ilk öğesi olarak kullanılır.
 */
export function YerelNav({ baslik, href, children }: { baslik: string; href: string; children: ReactNode }) {
  return (
    <nav aria-label={baslik} className="tam bant-bas glass sticky top-12 z-20 border-b border-line/70">
      <div className="mx-auto flex h-[52px] max-w-[1100px] items-center gap-4">
        <Link href={href} className="mr-auto rounded text-[19px] font-semibold tracking-tight sm:text-[21px]">
          {baslik}
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">{children}</div>
      </div>
    </nav>
  );
}

/** Bant içi bölüm başlığı: ortalı büyük başlık, isteğe bağlı alt metin ve bağlantı */
export function BolumBasi({ baslik, alt, children, sol = false, className = "" }: { baslik: ReactNode; alt?: ReactNode; children?: ReactNode; sol?: boolean; className?: string }) {
  return (
    <div className={`${sol ? "" : "mx-auto max-w-[820px] text-center"} mb-10 ${className}`}>
      <h2 className="baslik-orta text-balance">{baslik}</h2>
      {alt && <p className="mt-3 text-pretty text-[19px] leading-snug text-muted">{alt}</p>}
      {children && <Eylemler sol={sol} className="mt-4">{children}</Eylemler>}
    </div>
  );
}
