import type { Metadata } from "next";
import { Suspense } from "react";
import PlayerLibrary from "@/components/PlayerLibrary";
import SongsNav, { ARAC_SEKMELERI } from "@/components/SongsNav";

export const metadata: Metadata = { title: "Tabla Keşfet" };

export default function PlayerPage() {
  return (
    <div className="space-y-8">
      <SongsNav baslik="Araçlar" href="/araclar" sekmeler={ARAC_SEKMELERI} />
      <Suspense fallback={<p className="text-muted">Yükleniyor…</p>}>
        <PlayerLibrary />
      </Suspense>
    </div>
  );
}
