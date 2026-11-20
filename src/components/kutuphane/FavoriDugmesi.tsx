"use client";

import { Star } from "lucide-react";
import { favoriDegistir, useFavoriler, type SarkiKimligi } from "@/lib/kutuphane-yerel";

/** Şarkı sayfasında "Favorilere ekle" hap düğmesi */
export default function FavoriDugmesi({ id }: { id: SarkiKimligi }) {
  const favori = useFavoriler().has(id);
  return (
    <button type="button" onClick={() => favoriDegistir(id)} aria-pressed={favori} className={`${favori ? "btn-primary" : "btn-secondary"} px-4 py-1.5 text-sm`}>
      <Star size={15} fill={favori ? "currentColor" : "none"} /> {favori ? "Favorilerde" : "Favorilere ekle"}
    </button>
  );
}
