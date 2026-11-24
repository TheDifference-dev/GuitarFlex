import type { Metadata } from "next";
import { MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import { notFound, redirect } from "next/navigation";
import { getYol, yolOzeti, YOLLAR } from "@/lib/yollar";
import YolSayfasi from "@/components/yol/YolSayfasi";
import { yolSimgesi } from "@/lib/simge";

export async function generateMetadata(props: PageProps<"/teori/yol/[yol]">): Promise<Metadata> {
  const { yol } = await props.params;
  return { title: YOLLAR.find((y) => y.slug === yol)?.ad ?? "Teori" };
}

export default async function YolPage(props: PageProps<"/teori/yol/[yol]">) {
  const { yol: slug } = await props.params;
  // Okuma ve Armoni yolları kitap sayfalarına taşındı (adımlar aynı adreste kalır)
  if (slug === "okuma") redirect("/teori/nota-okuma");
  if (slug === "armoni") redirect("/teori/armoni");
  const tanim = YOLLAR.find((y) => y.slug === slug);
  if (!tanim) notFound();
  const yol = await getYol(slug);
  if (!yol) {
    return (
      <SayfaBasi simge={yolSimgesi(slug)} kirinti={[{ href: "/teori", label: "Müzik Teorisi" }, { label: tanim.ad }]} baslik={tanim.ad} alt="Bu yolun adımları kişisel içerik paketinde. Paket bulunamadı.">
        <MetinBag href="/teori" buyuk>
          Müzik Teorisi
        </MetinBag>
      </SayfaBasi>
    );
  }
  return <YolSayfasi yol={yolOzeti(yol)} />;
}
