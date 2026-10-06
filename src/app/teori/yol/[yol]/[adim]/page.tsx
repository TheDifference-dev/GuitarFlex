import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getYol } from "@/lib/yollar";
import AdimCalis from "@/components/yol/AdimCalis";

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
  const sonraki = yol.adimlar[i + 1];
  const bolum = yol.bolumler.find((b) => b.no === adim.bolum);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <nav className="text-sm text-muted">
        <Link href="/teori" className="hover:text-accent">
          Müzik Teorisi
        </Link>{" "}
        /{" "}
        <Link href={yol.kurs ? `/calis/${yol.kurs}` : `/teori/yol/${yol.slug}`} className="hover:text-accent">
          {yol.kurs ? "Armoni" : yol.ad}
        </Link>{" "}
        / {bolum?.ad}
      </nav>
      <header>
        <p className="eyebrow">
          {adim.kod}
          {adim.kontrol ? " · Bölüm kontrolü" : ""} · {adim.seviye}
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{adim.ad}</h1>
      </header>
      <AdimCalis key={adim.kod} yol={yol.slug} adim={adim} sonraki={sonraki ? { kod: sonraki.kod, ad: sonraki.ad } : undefined} geri={yol.kurs ? `/calis/${yol.kurs}` : undefined} />
    </div>
  );
}
