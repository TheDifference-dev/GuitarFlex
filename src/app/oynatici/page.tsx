import type { Metadata } from "next";
import { Suspense } from "react";
import PlayerLibrary from "@/components/PlayerLibrary";
import SongsNav from "@/components/SongsNav";

export const metadata: Metadata = { title: "Tabla Keşfet" };

export default function PlayerPage() {
  return (
    <div className="space-y-6">
      <SongsNav />
      <Suspense fallback={<p className="text-muted">Yükleniyor…</p>}>
        <PlayerLibrary />
      </Suspense>
    </div>
  );
}
