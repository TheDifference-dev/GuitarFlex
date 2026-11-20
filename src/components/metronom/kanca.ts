"use client";

import { useEffect, useSyncExternalStore } from "react";
import { metronomMotoru, type MetronomDurumu } from "@/lib/metronom";

/** Metronom motorunun durumu (ayarlar, çalıyor mu, şu anki vuruş) */
export function useMetronom(): MetronomDurumu {
  const motor = metronomMotoru();
  return useSyncExternalStore(motor.abone, motor.anlik, motor.sunucuAnlik);
}

/** Çalarken vuruş göstergesini ekran yenilemesine bağlar (verilen pencerenin kendi kare döngüsüyle) */
export function useVurusGostergesi(calisiyor: boolean, pencere?: Window | null) {
  useEffect(() => {
    if (!calisiyor) return;
    const w = pencere ?? window;
    const motor = metronomMotoru();
    let id = 0;
    const dongu = () => {
      motor.gorselGuncelle();
      id = w.requestAnimationFrame(dongu);
    };
    id = w.requestAnimationFrame(dongu);
    return () => w.cancelAnimationFrame(id);
  }, [calisiyor, pencere]);
}
