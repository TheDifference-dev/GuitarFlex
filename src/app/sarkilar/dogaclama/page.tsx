import type { Metadata } from "next";
import Link from "next/link";
import { Mic2 } from "lucide-react";
import SongsNav from "@/components/SongsNav";
import { Bant, SayfaBasi } from "@/components/site/Vitrin";
import { BACKINGS, TURLER } from "@/content/dogaclama";

export const metadata: Metadata = { title: "Doğaçlama Çal" };

const IKON: Record<(typeof TURLER)[number], string> = { Rock: "🎸", Blues: "🎷", Metal: "🤘", Pop: "🎤", Funk: "🕺", Groove: "🥁" };

export default function ImprovPage() {
  return (
    <div>
      <SongsNav />
      <SayfaBasi
        bas={false}
        kirinti={[{ href: "/sarkilar", label: "Şarkı ve Sololar" }, { label: "Doğaçlama Çal" }]}
        baslik="Doğaçlama Çal"
        alt={`Davul, bas ve ritim gitarından oluşan ${BACKINGS.length} eşlik kaydı. Bir kayıt seç, döngüye al ve önerilen gamlarla üzerine solo çal.`}
        ek={
          <nav aria-label="Türler" className="mt-8 flex flex-wrap justify-center gap-2">
            {TURLER.map((t) => (
              <a key={t} href={`#${t.toLocaleLowerCase("tr")}`} className="rounded-full bg-ink/[0.06] px-4 py-1.5 text-sm transition hover:bg-ink/10">
                {IKON[t]} {t} <span className="text-muted">{BACKINGS.filter((b) => b.tur === t).length}</span>
              </a>
            ))}
          </nav>
        }
      />
      <Bant ton="gri" className="space-y-12 pt-12">
        <p className="mx-auto max-w-[760px] text-center text-muted">Çaldığın süre günlük &quot;Serbest Çalışma&quot; görevine yazılır.</p>
      {TURLER.map((t) => (
        <section key={t} id={t.toLocaleLowerCase("tr")} className="scroll-mt-24 space-y-3">
          <h2 className="baslik-orta">
            {IKON[t]} {t} <span className="text-base font-semibold text-muted">({BACKINGS.filter((b) => b.tur === t).length})</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {BACKINGS.filter((b) => b.tur === t).map((b) => (
              <Link key={b.slug} href={`/sarkilar/dogaclama/${b.slug}`} className="group card p-5 transition hover:border-ink/20">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">{b.style}</span>
                  <span className="text-sm font-semibold text-muted">{b.bpm} BPM</span>
                </div>
                <h3 className="mt-3 flex items-center gap-2 text-xl font-semibold">
                  <Mic2 size={18} className="text-accent" /> {b.title}
                </h3>
                <p className="mt-1 text-sm text-muted">Ton: {b.key}</p>
                <p className="text-sm text-muted">{b.chords}</p>
                <p className="mt-3 text-xs text-muted">Gamlar: {b.scales.map((s) => s.name).join(", ")}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
      </Bant>
    </div>
  );
}
