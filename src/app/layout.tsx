import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Muzik — Gitar Akademisi", template: "%s · Muzik" },
  description: "Kolaydan zora gitar teknikleri, müzik teorisi ve çalışma takibi.",
};

const NAV = [
  { href: "/yollar", label: "Yollar" },
  { href: "/oynatici", label: "Oynatıcı" },
  { href: "/teori", label: "Teori" },
  { href: "/araclar", label: "Araçlar" },
  { href: "/ilerleme", label: "İlerleme" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-3">
            <Link href="/" className="mr-4 text-lg font-bold tracking-tight">
              <span className="text-accent">●</span> Muzik
            </Link>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-md px-3 py-1.5 text-sm hover:bg-panel">
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-line py-6 text-center text-xs text-muted">
          Muzik · Gitar akademisi ve ton laboratuvarı
        </footer>
      </body>
    </html>
  );
}
