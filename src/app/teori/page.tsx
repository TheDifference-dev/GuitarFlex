import type { Metadata } from "next";
import Link from "next/link";
import { THEORY } from "@/content/theory";
import FretboardExplorer from "@/components/FretboardExplorer";
import { getYol, YOLLAR } from "@/lib/yollar";

export const metadata: Metadata = { title: "Müzik Teorisi" };

export default async function TheoryPage() {
  const lessons = [...THEORY].sort((a, b) => a.level - b.level);
  const yollar = await Promise.all(YOLLAR.map(async (y) => ({ ...y, yol: await getYol(y.slug) })));
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Müzik Teorisi</h1>
        <p className="mt-1 text-muted">Gitarcının ihtiyaç duyduğu teori, sap üzerinde görerek.</p>
      </header>

      <section id="yollar" className="scroll-mt-24 space-y-3">
        <h2 className="text-xl font-semibold">Pratik Yolları</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {yollar.map((y) => (
            <Link key={y.slug} href={`/teori/yol/${y.slug}`} className="rounded-xl border border-line bg-panel p-4 transition hover:border-accent">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">{y.etiket}</p>
              <h3 className="font-semibold">{y.ad}</h3>
              <p className="text-sm text-muted">{y.yol ? `${y.yol.bolumler.length} bölüm · ${y.yol.adimlar.length} adım` : "İçerik paketi gerekli"}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="sap" className="scroll-mt-24 space-y-3">
        <h2 className="text-xl font-semibold">Sap Gezgini</h2>
        <FretboardExplorer />
      </section>

      <section id="dersler" className="scroll-mt-24 space-y-3">
        <h2 className="text-xl font-semibold">Dersler</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {lessons.map((l) => (
            <Link key={l.slug} href={`/teori/${l.slug}`} className="rounded-xl border border-line bg-panel p-4 transition hover:border-accent">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">Seviye {l.level}</p>
              <h3 className="font-semibold">{l.title}</h3>
              <p className="text-sm text-muted">{l.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
