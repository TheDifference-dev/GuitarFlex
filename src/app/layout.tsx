import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "@/config/site";
import SiteHeader from "@/components/SiteHeader";
import Altbilgi from "@/components/site/Altbilgi";

// Apple cihazlarda San Francisco kullanılır (globals.css); diğerlerinde Inter, optik boyutlu (başlıkta "Display" kesimi)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
};

// Kişisel içerik paketi (ozel-kaynak/icerik) çalışma anında okunduğu için sayfalar her istekte üretilir.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        {/* Sayfa kabı: bantlar (.bant) bu kabın dışına tam genişlikte taşar */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-8 sm:px-6">{children}</main>
        <Altbilgi />
      </body>
    </html>
  );
}
