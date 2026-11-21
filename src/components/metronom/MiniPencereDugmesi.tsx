"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PictureInPicture2 } from "lucide-react";
import { masaustuKoprusu, metronomMotoru } from "@/lib/metronom";
import MiniMetronom from "./MiniMetronom";

type BelgePip = { requestWindow: (o?: { width?: number; height?: number }) => Promise<Window> };

/** Sayfanın stillerini (Tailwind, CSS modülleri, yazı tipleri) üstte pencereye kopyalar */
function stilleriKopyala(kaynak: Document, hedef: Document) {
  for (const ss of Array.from(kaynak.styleSheets)) {
    try {
      const st = hedef.createElement("style");
      st.textContent = Array.from(ss.cssRules)
        .map((r) => r.cssText)
        .join("\n");
      hedef.head.appendChild(st);
    } catch {
      if (ss.href) {
        const l = hedef.createElement("link");
        l.rel = "stylesheet";
        l.href = ss.href;
        hedef.head.appendChild(l);
      }
    }
  }
}

/**
 * "Küçük pencerede aç":
 * - masaüstü uygulamasında her zaman üstte duran ayrı pencere (Electron, desktop/metronom-mini.cjs)
 * - Chrome / Edge'de Document Picture-in-Picture: diğer uygulamaların üstünde kalan pencere, aynı motor
 * - diğer tarayıcılarda küçük açılır pencere (üstte kalması garanti değil)
 */
export default function MiniPencereDugmesi() {
  const [pip, setPip] = useState<Window | null>(null);
  const [not, setNot] = useState<string | null>(null);

  // Metronom sayfadan ayrılınca üstte pencere boş kalmasın
  useEffect(() => {
    if (!pip) return;
    return () => pip.close();
  }, [pip]);

  const ac = async () => {
    setNot(null);
    const motor = metronomMotoru();
    const kopru = masaustuKoprusu();
    if (kopru) {
      // Küçük pencere ayrı bir sayfa: burada çalıyorsa orada kaldığı yerden devam etsin
      const cal = motor.anlik().calisiyor;
      motor.durdur();
      await kopru.metronomMiniAc({ cal });
      return;
    }
    const belgePip = (window as unknown as { documentPictureInPicture?: BelgePip }).documentPictureInPicture;
    if (belgePip?.requestWindow) {
      if (pip && !pip.closed) {
        pip.focus();
        return;
      }
      try {
        const w = await belgePip.requestWindow({ width: 300, height: 190 });
        stilleriKopyala(document, w.document);
        w.document.title = "Metronom · GuitarFlex";
        w.document.documentElement.lang = "tr";
        w.document.documentElement.className = document.documentElement.className;
        w.document.body.className = "bant-koyu m-0 h-screen overflow-hidden";
        w.addEventListener("pagehide", () => setPip(null), { once: true });
        setPip(w);
        return;
      } catch {
        // Açılamadıysa (izin, tarayıcı sınırı) açılır pencereye düş
      }
    }
    const cal = motor.anlik().calisiyor;
    const w = window.open(`/metronom/mini${cal ? "?cal=1" : ""}`, "gf-metronom-mini", "popup=yes,width=300,height=200");
    if (!w) {
      setNot("Açılır pencere engellendi. Adres çubuğundan bu siteye açılır pencere izni verip yeniden dene.");
      return;
    }
    motor.durdur();
    setNot("Bu tarayıcı her zaman üstte duran pencereyi desteklemiyor; metronom küçük bir pencerede açıldı ve başka uygulamaya geçince arkada kalabilir. Üstte kalması için Chrome / Edge ya da masaüstü uygulamasını kullan.");
  };

  return (
    <>
      <button type="button" onClick={() => void ac()} className="btn-secondary w-full py-2 text-sm" title="Metronomu diğer pencerelerin üstünde duran küçük bir pencerede aç">
        <PictureInPicture2 aria-hidden className="h-4 w-4" />
        Küçük pencerede aç
      </button>
      {not && <p className="text-sm text-muted">{not}</p>}
      {pip && createPortal(<MiniMetronom tur="pip" pencere={pip} onKapat={() => pip.close()} />, pip.document.body)}
    </>
  );
}
