import type { Metadata } from "next";
import Link from "next/link";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "@/config/site";
import SiteHeader from "@/components/SiteHeader";
import { getSiteTexts } from "@/lib/courses";

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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const texts = await getSiteTexts();
  return (
    <html lang="tr" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader subtitle={texts.navSubtitle} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        <footer className="mt-8 border-t border-line/70 py-8 text-center text-xs text-muted">
          <span className="font-semibold text-text/80">{SITE.name}</span> · {SITE.footer} ·{" "}
          <Link href="/marka" className="transition hover:text-text">
            Marka
          </Link>
        </footer>
      </body>
    </html>
  );
}
