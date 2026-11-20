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
        alt="Kurşun gitar, ritim gitarı, bas ve davullu çok track'li parçalar: GuitarFlex'in özgün şarkıları ve kamu malı ezgilerin düzenlemeleri."
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
        <p className="mx-auto mb-8 max-w-[760px] text-center text-muted">
          Türe, zorluğa, tona, tempoya ya da enstrümana göre süz; şarkıyı açınca tab oynatıcı, form ve çalışma ipuçları gelir.
        </p>
        {songs.length ? (
          <LibraryBrowser songs={songs} />
        ) : (
          <p className="card p-6 text-muted">Kütüphane içeriği bulunamadı (içerik paketinde icerik/kutuphane.json yok).</p>
        )}
      </Bant>
    </div>
  );
}
