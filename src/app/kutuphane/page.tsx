import type { Metadata } from "next";
import { Bant, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import LibraryBrowser from "@/components/kutuphane/LibraryBrowser";
import { getLibrary, summary } from "@/lib/kutuphane";

export const metadata: Metadata = { title: "Tab Oynatıcı ve Dosyalarım" };

export default async function LibraryPage() {
  const songs = (await getLibrary()).map(summary);
  return (
    <div>
      <SayfaBasi
        kirinti={[{ href: "/araclar", label: "Araçlar" }, { label: "Tab Oynatıcı ve Dosyalarım" }]}
        baslik="Tab Oynatıcı ve Dosyalarım"
        alt="GuitarFlex'in çalınabilir çok track'li parçaları (gitar, bas, davul, klavye…) ve kendi Guitar Pro dosyaların: aç, kapa, yavaşlat."
      >
        <MetinBag href="/sarki-kutuphanesi" buyuk>
          Şarkı Kütüphanesi
        </MetinBag>
        <MetinBag href="/sarki-kutuphanesi/rehber" buyuk>
          Rehber Şarkılar
        </MetinBag>
        <MetinBag href="/oynatici" buyuk>
          Tabla keşfet
        </MetinBag>
        <MetinBag href="/sarkilar/dogaclama" buyuk>
          Doğaçlama çal
        </MetinBag>
      </SayfaBasi>
      <Bant ton="gri" className="pt-12">
        {!songs.length && <p className="card mb-5 p-4 text-sm text-muted">GuitarFlex şarkıları bulunamadı (içerik paketinde icerik/kutuphane.json yok); kendi dosyalarını yine ekleyebilirsin.</p>}
        <LibraryBrowser songs={songs} />
      </Bant>
    </div>
  );
}
