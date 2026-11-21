import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SayfaBasi } from "@/components/site/Vitrin";
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
    <div className="space-y-8">
      <SongsNav />
      <SayfaBasi
        bas={false}
        kirinti={[{ href: "/sarkilar/dogaclama", label: "Doğaçlama Çal" }, { label: backing.title }]}
        ust={`${backing.style} · ${backing.bpm} BPM`}
        baslik={backing.title}
        alt={`Ton: ${backing.key} · ${backing.chords}`}
        boyut="buyuk"
        className="!pb-6"
      />
      <BackingView backing={backing} />
    </div>
  );
}
