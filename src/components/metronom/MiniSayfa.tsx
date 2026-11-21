"use client";

import { useEffect, useState } from "react";
import { masaustuKoprusu, metronomMotoru } from "@/lib/metronom";
import MiniMetronom, { miniPencereEylemleri, type MiniTur } from "./MiniMetronom";

/** /metronom/mini: masaüstü uygulamasının küçük penceresi ya da tarayıcıdaki açılır pencere */
export default function MiniSayfa() {
  const [eylem, setEylem] = useState<{ tur: MiniTur; onKapat?: () => void; onAnaPencere?: () => void }>({ tur: "acilir" });

  useEffect(() => {
    const motor = metronomMotoru();
    // Köprü yalnız tarayıcıda bilinir; ilk çizimden sonra düğmeler ona göre ayarlanır
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEylem(miniPencereEylemleri());
    // Ana pencerede çalarken açıldıysa kaldığı yerden çalmaya devam et
    const adres = new URL(window.location.href);
    if (adres.searchParams.get("cal") === "1") {
      void motor.baslat();
      adres.searchParams.delete("cal");
      window.history.replaceState(null, "", adres.pathname + adres.search + adres.hash);
    }
    const birak = masaustuKoprusu()?.metronomKomutDinle((k) => {
      if (k === "cal") void motor.baslat();
      else if (k === "dur") motor.durdur();
    });
    return () => {
      birak?.();
      motor.durdur();
    };
  }, []);

  return <MiniMetronom tur={eylem.tur} onKapat={eylem.onKapat} onAnaPencere={eylem.onAnaPencere} />;
}
