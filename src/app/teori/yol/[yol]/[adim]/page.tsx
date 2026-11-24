import type { Metadata } from "next";
import { SayfaBasi } from "@/components/site/Vitrin";
import { notFound } from "next/navigation";
import { getYol } from "@/lib/yollar";
import AdimCalis from "@/components/yol/AdimCalis";

const KITAP: Record<string, { href: string; ad: string }> = { armoni: { href: "/teori/armoni", ad: "Armoni" }, okuma: { href: "/teori/nota-okuma", ad: "Nota Okuma" } };

export async function generateMetadata(props: PageProps<"/teori/yol/[yol]/[adim]">): Promise<Metadata> {
  const { yol: slug, adim: kod } = await props.params;
  const yol = await getYol(slug);
  const adim = yol?.adimlar.find((a) => a.kod === decodeURIComponent(kod));
  return { title: adim ? `${adim.kod} ${adim.ad} · ${yol?.ad}` : "Adım" };
}

export default async function AdimPage(props: PageProps<"/teori/yol/[yol]/[adim]">) {
  const { yol: slug, adim: kod } = await props.params;
  const yol = await getYol(slug);
  const i = yol?.adimlar.findIndex((a) => a.kod === decodeURIComponent(kod)) ?? -1;
  if (!yol || i < 0) notFound();
  const adim = yol.adimlar[i];
  const bolum = yol.bolumler.find((b) => b.no === adim.bolum);
  // Ana yolun son adımından Ek bölümlere geçilmez (Ek bölümler ayrı alan)
  const sonrakiAday = yol.adimlar[i + 1];
  const sonraki = sonrakiAday && !!yol.bolumler.find((b) => b.no === sonrakiAday.bolum)?.ek === !!bolum?.ek ? sonrakiAday : undefined;
  // Armoni ve Okuma adımları kitap sayfalarına döner (Teori › Armoni, Teori › Nota Okuma)
  const kitap = KITAP[yol.slug];

  return (
    <div className="space-y-6">
      <SayfaBasi
        kirinti={[{ href: "/teori", label: "Müzik Teorisi" }, { href: kitap?.href ?? `/teori/yol/${yol.slug}`, label: kitap?.ad ?? yol.ad }, { label: bolum?.ad ?? adim.kod }]}
        ust={`${adim.kod}${adim.kontrol ? " · Bölüm kontrolü" : ""} · ${adim.seviye}`}
        baslik={adim.ad}
        boyut="buyuk"
        className="!pb-10"
      />
      <div className="mx-auto max-w-4xl">
      <AdimCalis key={adim.kod} yol={yol.slug} adim={adim} sonraki={sonraki ? { kod: sonraki.kod, ad: sonraki.ad } : undefined} geri={kitap?.href} />
      </div>
    </div>
  );
}
