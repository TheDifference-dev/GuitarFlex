import type { Metadata } from "next";
import MiniSayfa from "@/components/metronom/MiniSayfa";

export const metadata: Metadata = { title: "Metronom", robots: { index: false } };

export default function MiniMetronomSayfasi() {
  return <MiniSayfa />;
}
