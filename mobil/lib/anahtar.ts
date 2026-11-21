// İlerleme anahtarını okunur ada çevirir: "<kurs>/<ders-id>", "<yol>/<kod>", "sarki/<adım>"
import { KURSLAR, META, REHBER } from "./icerik";
import { renk } from "./tema";

export type AnahtarBilgi = { ad: string; ust: string; glif: string; renk: string };

export function anahtarBilgi(key: string): AnahtarBilgi {
  const [on, ...son] = key.split("/");
  const geri = son.join("/");
  if (on === "sarki") {
    const s = REHBER.find((x) => String(x.adim) === geri);
    return { ad: s ? `${s.baslik} — ${s.sanatci}` : key, ust: "Şarkılarla Öğren", glif: "nota", renk: renk("sarkilar") };
  }
  if (META.yollar[on]) return { ad: geri, ust: META.yolAdlari[on] ?? on, glif: META.yolSimgeleri[on]?.glif ?? "liste", renk: renk(`yol:${on}`) };
  const k = KURSLAR.find((c) => c.slug === on);
  if (k)
    for (const b of k.bolumler)
      for (const a of b.alt)
        for (const d of a.dersler) if (d.id === geri) return { ad: d.baslik, ust: k.kisa, glif: k.simge.glif, renk: renk(k.slug) };
  return { ad: key, ust: "", glif: "nota", renk: renk("") };
}
