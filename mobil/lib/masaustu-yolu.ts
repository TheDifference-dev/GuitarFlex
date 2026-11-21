// Masaüstü adreslerini (/teori/yol/<yol>/<kod>, /calis/<kurs>/<ders>) mobil ekranlara çevirir
import { router } from "expo-router";
import { secimYaz } from "./secim";

export function masaustuYolu(yol: string) {
  const p = yol.split("/").filter(Boolean).map(decodeURIComponent);
  if (p[0] === "teori" && p[1] === "yol" && p[3]) return router.replace({ pathname: "/adim/[yol]/[kod]", params: { yol: p[2], kod: p[3] } });
  if (p[0] === "teori" && p[1] === "yol" && p[2]) {
    secimYaz({ yol: p[2] });
    return router.navigate("/teori");
  }
  if (p[0] === "calis" && p[2]) return router.replace({ pathname: "/ders/[kurs]/[id]", params: { kurs: p[1], id: p[2] } });
  if (p[0] === "calis" && p[1]) {
    secimYaz({ kurs: p[1] });
    return router.navigate("/");
  }
  router.back();
}
