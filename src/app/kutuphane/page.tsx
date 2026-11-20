import type { Metadata } from "next";
import LibraryBrowser from "@/components/kutuphane/LibraryBrowser";
import { getLibrary, summary } from "@/lib/kutuphane";

export const metadata: Metadata = { title: "Şarkı Kütüphanesi" };

export default async function LibraryPage() {
  const songs = (await getLibrary()).map(summary);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Şarkı Kütüphanesi</h1>
        <p className="mt-1 max-w-3xl text-muted">
          Kurşun gitar, ritim gitarı, bas ve davullu çok track&apos;li parçalar: GuitarFlex&apos;in özgün şarkıları ve kamu malı ezgilerin düzenlemeleri.
          Türe, zorluğa, tona, tempoya ya da enstrümana göre süz; şarkıyı açınca tab oynatıcı, form ve çalışma ipuçları gelir.
        </p>
      </header>
      {songs.length ? (
        <LibraryBrowser songs={songs} />
      ) : (
        <p className="card p-6 text-muted">Kütüphane içeriği bulunamadı (içerik paketinde icerik/kutuphane.json yok).</p>
      )}
    </div>
  );
}
