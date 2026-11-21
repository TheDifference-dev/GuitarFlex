// Tema sabitleri ve ilk boyamadan önce çalışan satır içi betik. Sunucu bileşeni (layout.tsx) de kullandığı için
// "use client" değildir; istemci kancası src/lib/tema.ts'te.
export const TEMALAR = ["acik", "koyu", "sistem"] as const;
export type Tema = (typeof TEMALAR)[number];
export const TEMA_ADI: Record<Tema, string> = { acik: "Açık", koyu: "Koyu", sistem: "Sistem" };
export const TEMA_ANAHTARI = "gf-tema";

/** <head> içinde ilk boyamadan önce çalışır: saklı tercih yoksa ya da geçersizse açık tema */
export const TEMA_BETIGI = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("${TEMA_ANAHTARI}");d.setAttribute("data-mod",t==="koyu"||t==="sistem"?t:"acik")}catch(e){d.setAttribute("data-mod","acik")}})();`;
