import type { Metadata } from "next";
import Link from "next/link";
import { Mic2 } from "lucide-react";
import SongsNav from "@/components/SongsNav";
import { BACKINGS } from "@/content/dogaclama";

export const metadata: Metadata = { title: "Doğaçlama Çal" };

export default function ImprovPage() {
  return (
    <div className="space-y-6">
      <SongsNav />
      <header>
        <h1 className="text-3xl font-black tracking-tight">Doğaçlama Çal</h1>
        <p className="mt-1 max-w-3xl text-muted">
          Davul, bas ve ritim gitarından oluşan eşlik kayıtları. Bir kayıt seç, döngüye al ve önerilen gamlarla üzerine solo çal. İstersen oynatıcıdan ritim gitarını kapatıp akorları kendin çal.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {BACKINGS.map((b) => (
          <Link key={b.slug} href={`/sarkilar/dogaclama/${b.slug}`} className="group rounded-2xl border border-line bg-panel p-5 transition hover:border-accent">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-accent/15 px-2 py-0.5 text-xs font-bold uppercase text-accent">{b.style}</span>
              <span className="text-sm font-bold text-muted">{b.bpm} BPM</span>
            </div>
            <h2 className="mt-3 flex items-center gap-2 text-xl font-black">
              <Mic2 size={18} className="text-accent" /> {b.title}
            </h2>
            <p className="mt-1 text-sm text-muted">Ton: {b.key}</p>
            <p className="text-sm text-muted">{b.chords}</p>
            <p className="mt-3 text-xs text-muted">Gamlar: {b.scales.map((s) => s.name).join(", ")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
