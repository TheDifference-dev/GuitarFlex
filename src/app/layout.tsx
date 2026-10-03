import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/config/site";
import SiteHeader from "@/components/SiteHeader";
import { getSiteTexts } from "@/lib/courses";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
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
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader subtitle={texts.navSubtitle} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-line py-6 text-center text-xs text-muted">
          {SITE.name} · {SITE.footer} ·{" "}
          <Link href="/marka" className="hover:text-accent">
            Marka
          </Link>
        </footer>
      </body>
    </html>
  );
}
