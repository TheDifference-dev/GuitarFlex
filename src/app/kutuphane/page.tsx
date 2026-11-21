import type { Metadata } from "next";
import { Bant, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import LibraryBrowser from "@/components/kutuphane/LibraryBrowser";
import { getLibrary, summary } from "@/lib/kutuphane";

export const metadata: Metadata = { title: "Şarkı Kütüphanesi" };

export default async function LibraryPage() {
  const songs = (await getLibrary()).map(summary);
  return (
    <div>
      <SayfaBasi
        kirinti={[{ label: "Şarkı Kütüphanesi" }]}
        baslik="Şarkı Kütüphanesi"
        alt="Gitar, bas, davul, klavye, yaylı ve üflemeli çok track'li parçalar: GuitarFlex'in özgün şarkıları, kamu malı ezgilerin düzenlemeleri ve kendi Guitar Pro dosyaların."
      >
        <MetinBag href="/sarkilar" buyuk>
          Popüler şarkılar
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
