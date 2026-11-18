import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeviyeSayfasi } from "@/components/SeviyeYolu";
import { SEVIYE, isLevel } from "@/content/seviyeler";
import { getSeviyeYolu } from "@/lib/seviye";

export async function generateMetadata(props: PageProps<"/seviye/[seviye]">): Promise<Metadata> {
  const { seviye } = await props.params;
  return { title: isLevel(seviye) ? `${seviye} ${SEVIYE[seviye].ad} · Seviye Yolu` : "Seviye Yolu" };
}

export default async function SeviyePage(props: PageProps<"/seviye/[seviye]">) {
  const { seviye } = await props.params;
  if (!isLevel(seviye)) notFound();
  const yol = await getSeviyeYolu();
  return <SeviyeSayfasi data={yol[seviye]} />;
}
