import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getYol, YOLLAR } from "@/lib/yollar";
import YolSayfasi from "@/components/yol/YolSayfasi";

export async function generateMetadata(props: PageProps<"/teori/yol/[yol]">): Promise<Metadata> {
  const { yol } = await props.params;
  return { title: YOLLAR.find((y) => y.slug === yol)?.ad ?? "Teori" };
}

export default async function YolPage(props: PageProps<"/teori/yol/[yol]">) {
  const { yol: slug } = await props.params;
  const tanim = YOLLAR.find((y) => y.slug === slug);
  if (!tanim) notFound();
  const yol = await getYol(slug);
  if (!yol) {
    return (
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{tanim.ad}</h1>
        <p className="text-muted">Bu yolun adımları kişisel içerik paketinde. Paket bulunamadı; <Link href="/teori" className="text-accent">Müzik Teorisi</Link> sayfasına dön.</p>
      </div>
    );
  }
  return <YolSayfasi yol={yol} />;
}
