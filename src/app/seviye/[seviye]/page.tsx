import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { SeviyeSayfasi } from "@/components/SeviyeYolu";
import { KADEME, isKademe, isLevel, kademeOf } from "@/content/seviyeler";
import { getSeviyeYolu } from "@/lib/seviye";

export async function generateMetadata(props: PageProps<"/seviye/[seviye]">): Promise<Metadata> {
  const { seviye } = await props.params;
  return { title: isKademe(seviye) ? `${KADEME[seviye].ad} · Seviye Yolu` : "Seviye Yolu" };
}

export default async function SeviyePage(props: PageProps<"/seviye/[seviye]">) {
  const { seviye } = await props.params;
  // Eski adresler (/seviye/L1 … L5) dört kademeye yönlenir
  if (isLevel(seviye)) permanentRedirect(`/seviye/${kademeOf(seviye)}`);
  if (!isKademe(seviye)) notFound();
  const veriler = await getSeviyeYolu();
  return <SeviyeSayfasi data={veriler[seviye]} veriler={veriler} />;
}
