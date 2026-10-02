import type { Metadata } from "next";
import { Suspense } from "react";
import PlayerLibrary from "@/components/PlayerLibrary";

export const metadata: Metadata = { title: "Tab Oynatıcı" };

export default function PlayerPage() {
  return (
    <Suspense fallback={<p className="text-muted">Yükleniyor…</p>}>
      <PlayerLibrary />
    </Suspense>
  );
}
