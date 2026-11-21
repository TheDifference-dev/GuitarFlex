import type { Metadata } from "next";
// Inter Variable (optik boyutlu): @fontsource-variable/inter, OFL 1.1. Dosyalar pakette gelir, çevrimdışı çalışır;
// Türkçe harfler (ğ, ş, ı, İ) latin-ext diliminde.
import "@fontsource-variable/inter/opsz.css";
import "./globals.css";
import { SITE } from "@/config/site";
import SiteHeader from "@/components/SiteHeader";
import Altbilgi from "@/components/site/Altbilgi";
import SiteKabugu from "@/components/SiteKabugu";
import { TEMA_BETIGI } from "@/lib/tema-betik";

export const metadata: Metadata = {
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
};

// Kişisel içerik paketi (ozel-kaynak/icerik) çalışma anında okunduğu için sayfalar her istekte üretilir.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-mod (tema) ilk boyamadan önce satır içi betikle konur: varsayılan açık (bkz. src/lib/tema.ts)
    <html lang="tr" data-mod="acik" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEMA_BETIGI }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        {/* Küçük pencereler (/metronom/mini) gezinme ve alt bilgi olmadan açılır */}
        <SiteKabugu ust={<SiteHeader />} alt={<Altbilgi />}>
          {children}
        </SiteKabugu>
      </body>
    </html>
  );
}
