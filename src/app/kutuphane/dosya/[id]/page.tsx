import type { Metadata } from "next";
import DosyaSarkiView from "@/components/kutuphane/DosyaSarkiView";

// Kullanıcının kendi dosyası: içerik bu bilgisayarın IndexedDB'sinde, sayfa tarayıcıda kurulur.
export const metadata: Metadata = { title: "Benim dosyam · Tab Oynatıcı" };

export default async function DosyaSarkiPage(props: PageProps<"/kutuphane/dosya/[id]">) {
  const { id } = await props.params;
  return <DosyaSarkiView id={decodeURIComponent(id)} />;
}
