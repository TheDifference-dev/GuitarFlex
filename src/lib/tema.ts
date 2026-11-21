"use client";
// Görünüm teması: açık (varsayılan, apple.com gibi; işletim sistemi koyu modda olsa bile), koyu ya da sistem.
// Tercih bu tarayıcıda / masaüstü uygulamasında saklanır (localStorage "gf-tema") ve <html data-mod="…"> olarak
// uygulanır. İlk boyamadan önce layout.tsx'teki satır içi betik (TEMA_BETIGI) aynı işi yapar; yanıp sönme olmaz.
// Masaüstünde ana süreç bilgilendirilir (pencere zemini ve Görünüm menüsü aynı tercihe uysun).
import { useSyncExternalStore } from "react";

import { TEMA_ADI, TEMA_ANAHTARI, TEMALAR, type Tema } from "./tema-betik";

export { TEMA_ADI, TEMALAR, type Tema };
const OLAY = "gf-tema-degisti";

const gecerli = (t: unknown): t is Tema => typeof t === "string" && (TEMALAR as readonly string[]).includes(t);

function oku(): Tema {
  try {
    const t = window.localStorage.getItem(TEMA_ANAHTARI);
    return gecerli(t) ? t : "acik";
  } catch {
    return "acik";
  }
}

type Masaustu = { temaBildir?: (t: Tema) => void };

/** Temayı uygular ve saklar */
export function temaSec(t: Tema, { bildir = true }: { bildir?: boolean } = {}) {
  try {
    window.localStorage.setItem(TEMA_ANAHTARI, t);
  } catch {
    // Gizli sekme: yalnız bu oturumda uygulanır.
  }
  document.documentElement.setAttribute("data-mod", t);
  window.dispatchEvent(new Event(OLAY));
  if (bildir) (window as unknown as { guitarflexMasaustu?: Masaustu }).guitarflexMasaustu?.temaBildir?.(t);
}

function abone(cb: () => void) {
  window.addEventListener(OLAY, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(OLAY, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Seçili tema (sunucuda "acik") */
export function useTema(): Tema {
  return useSyncExternalStore(abone, oku, () => "acik");
}
