import Link from "next/link";
import { ALL_EXERCISES, TECHNIQUES } from "@/content/techniques";
import { THEORY } from "@/content/theory";
import { SummaryStrip } from "@/components/ProgressWidgets";

const MODULES = [
  {
    href: "/yollar",
    title: "Teknik Yolları",
    text: `${TECHNIQUES.length} teknik, ${ALL_EXERCISES.length} egzersiz. Kolaydan zora seviyeler, metronomlu tab oynatıcı.`,
  },
  {
    href: "/teori",
    title: "Müzik Teorisi",
    text: `${THEORY.length} ders, interaktif gitar sapı: gamlar, akorlar ve aralıklar.`,
  },
  {
    href: "/araclar",
    title: "Araçlar",
    text: "Metronom ve nota bulma testi.",
  },
  {
    href: "/ilerleme",
    title: "İlerleme",
    text: "Seri, rütbe, rozetler ve teknik bazında gelişim.",
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Gitar Akademisi</p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Her gün biraz daha iyi çal.</h1>
        <p className="max-w-2xl text-lg text-muted">
          Teknikleri seviye seviye çalış, tempoyu adım adım yükselt, gelişimini takip et.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/yollar" className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-accent-ink">
            Çalışmaya başla
          </Link>
          <Link href="/teori" className="rounded-lg border border-line px-5 py-2.5 font-semibold">
            Teoriye göz at
          </Link>
        </div>
      </section>

      <SummaryStrip />

      <section className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <Link key={m.href} href={m.href} className="rounded-xl border border-line bg-panel p-6 transition hover:border-accent">
            <h2 className="text-lg font-semibold">{m.title}</h2>
            <p className="mt-1 text-sm text-muted">{m.text}</p>
          </Link>
        ))}
        <div className="rounded-xl border border-dashed border-line p-6 sm:col-span-2">
          <h2 className="text-lg font-semibold">
            Ton Lab <span className="ml-2 rounded bg-line px-2 py-0.5 text-xs font-normal">yakında</span>
          </h2>
          <p className="mt-1 text-sm text-muted">
            Ünlü şarkıların gitar tonlarını bul ve HeadRush Core gibi kendi ekipmanına uyarlanmış ayarları al.
          </p>
        </div>
      </section>
    </div>
  );
}
