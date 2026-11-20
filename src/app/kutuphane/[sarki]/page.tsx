import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import LibrarySongView from "@/components/kutuphane/LibrarySongView";
import { SeviyeEtiketi, sure } from "@/components/kutuphane/ortak";
import { getLibrarySong } from "@/lib/kutuphane";

export async function generateMetadata(props: PageProps<"/kutuphane/[sarki]">): Promise<Metadata> {
  const { sarki } = await props.params;
  return { title: (await getLibrarySong(decodeURIComponent(sarki)))?.title ?? "Şarkı Kütüphanesi" };
}

export default async function LibrarySongPage(props: PageProps<"/kutuphane/[sarki]">) {
  const { sarki } = await props.params;
  const song = await getLibrarySong(decodeURIComponent(sarki));
  if (!song) notFound();
  const pill = "rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm font-semibold";
  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-sm text-muted">
        <Link href="/kutuphane" className="font-semibold text-accent hover:underline">
          Şarkı Kütüphanesi
        </Link>
        <ChevronRight size={14} /> {song.title}
      </nav>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{song.title}</h1>
          <p className="mt-1 text-muted">
            {song.genre} · {song.source.startsWith("Özgün") ? "Özgün (GuitarFlex)" : `Kamu malı · GuitarFlex düzenlemesi${song.origin ? ` · ${song.origin}` : ""}`}
          </p>
          <p className="mt-2 text-sm text-muted">{song.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SeviyeEtiketi level={song.level} />
          <span className={pill}>{song.key}</span>
          <span className={`${pill} tabular-nums`}>{song.bpm} BPM</span>
          <span className={pill}>{song.timeSignature}</span>
          <span className={`${pill} tabular-nums`}>{sure(song.durationSec)}</span>
        </div>
      </header>
      <LibrarySongView song={song} />
    </div>
  );
}
