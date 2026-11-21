import type { Metadata } from "next";
import { SayfaBasi } from "@/components/site/Vitrin";
import { notFound } from "next/navigation";
import LibrarySongView from "@/components/kutuphane/LibrarySongView";
import { SeviyeEtiketi, sure } from "@/components/kutuphane/ortak";
import { getLibrarySong } from "@/lib/kutuphane";
import { turSimgesi } from "@/lib/simge";

export async function generateMetadata(props: PageProps<"/kutuphane/[sarki]">): Promise<Metadata> {
  const { sarki } = await props.params;
  return { title: (await getLibrarySong(decodeURIComponent(sarki)))?.title ?? "Tab Oynatıcı ve Dosyalarım" };
}

export default async function LibrarySongPage(props: PageProps<"/kutuphane/[sarki]">) {
  const { sarki } = await props.params;
  const song = await getLibrarySong(decodeURIComponent(sarki));
  if (!song) notFound();
  const pill = "rounded-full bg-ink/[0.06] px-3.5 py-1 text-sm font-semibold";
  return (
    <div className="space-y-6">
      <SayfaBasi
        kirinti={[{ href: "/kutuphane", label: "Tab Oynatıcı" }, { label: song.title }]}
        ust={`${song.genre} · ${song.source.startsWith("Özgün") ? "Özgün (GuitarFlex)" : `Kamu malı · GuitarFlex düzenlemesi${song.origin ? ` · ${song.origin}` : ""}`}`}
        baslik={song.title}
        simge={turSimgesi(song.genre)}
        alt={song.description}
        boyut="buyuk"
        className="!pb-10"
        ek={
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <SeviyeEtiketi level={song.level} />
            <span className={pill}>{song.key}</span>
            <span className={`${pill} tabular-nums`}>{song.bpm} BPM</span>
            <span className={pill}>{song.timeSignature}</span>
            <span className={`${pill} tabular-nums`}>{sure(song.durationSec)}</span>
          </div>
        }
      />
      <LibrarySongView song={song} />
    </div>
  );
}
