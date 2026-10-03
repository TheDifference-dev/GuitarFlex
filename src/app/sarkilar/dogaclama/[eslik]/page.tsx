import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import BackingView from "@/components/BackingView";
import SongsNav from "@/components/SongsNav";
import { BACKINGS } from "@/content/dogaclama";

const find = (slug: string) => BACKINGS.find((b) => b.slug === decodeURIComponent(slug));

export async function generateMetadata(props: PageProps<"/sarkilar/dogaclama/[eslik]">): Promise<Metadata> {
  const { eslik } = await props.params;
  return { title: find(eslik)?.title ?? "Doğaçlama" };
}

export default async function BackingPage(props: PageProps<"/sarkilar/dogaclama/[eslik]">) {
  const { eslik } = await props.params;
  const backing = find(eslik);
  if (!backing) notFound();
  return (
    <div className="space-y-6">
      <SongsNav />
      <nav className="flex items-center gap-1 text-sm text-muted">
        <Link href="/sarkilar/dogaclama" className="font-bold text-accent hover:underline">
          Doğaçlama Çal
        </Link>
        <ChevronRight size={14} /> {backing.title}
      </nav>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{backing.title}</h1>
          <p className="mt-1 text-muted">
            {backing.style} · Ton: {backing.key} · {backing.chords}
          </p>
        </div>
        <span className="rounded-lg border border-line bg-panel px-3 py-1.5 text-sm font-bold">{backing.bpm} BPM</span>
      </header>
      <BackingView backing={backing} />
    </div>
  );
}
