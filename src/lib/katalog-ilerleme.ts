// Katalog kartları ve kurs içi gezinme için ilerleme hesapları (istemcide, localStorage ilerlemesiyle).
import { lessonKey } from "@/content/courses";
import type { KursAnahat, KursKarti } from "./katalog";
import type { Progress } from "./progress";

/** Kartın tamamlanan / toplam ders sayısı: dersler çalışma süresiyle, pratik kartları adım geçilince sayılır */
export function kartIlerleme(p: Progress, k: Pick<KursKarti, "keys" | "adimlar">) {
  const tamam = k.keys.filter((x) => p.exercises[x]?.completed).length + k.adimlar.filter((x) => p.steps[x]?.passed).length;
  const toplam = k.keys.length + k.adimlar.length;
  return { tamam, toplam, yuzde: toplam ? Math.round((tamam / toplam) * 100) : 0 };
}

type AnahatDers = KursAnahat["bolumler"][number]["altlar"][number]["dersler"][number];

export const dersBitti = (p: Progress, slug: string, d: AnahatDers) =>
  d.adim ? !!p.steps[d.adim]?.passed : !!p.exercises[lessonKey(slug, d.id)]?.completed;

/** Anahattaki dersler sırayla, alt bölüm ve bölüm bilgisiyle */
export function anahatDersleri(a: KursAnahat) {
  return a.bolumler.flatMap((b) => b.altlar.flatMap((alt) => alt.dersler.map((d) => ({ ...d, bolum: b.number, bolumAdi: b.title, alt: alt.code, altAdi: alt.title }))));
}

/** Kursta sıradaki ders: verilen dersten sonra (yoksa baştan) tamamlanmamış ilk ders; hepsi bittiyse null */
export function siradakiDers(p: Progress, a: KursAnahat, sonra?: string) {
  const liste = anahatDersleri(a);
  const bas = sonra ? liste.findIndex((d) => d.id === sonra) + 1 : 0;
  return liste.slice(bas).find((d) => !dersBitti(p, a.slug, d)) ?? liste.find((d) => !dersBitti(p, a.slug, d)) ?? null;
}

/** En son çalışılan ders (ilerleme anahtarı "kurs/ders"); `gecerli` kursu tanınmayan anahtarları (serbest çalışma) eler */
export function sonCalisilan(p: Progress, gecerli: (slug: string, id: string) => boolean): { slug: string; id: string; at: string } | null {
  let son: { slug: string; id: string; at: string } | null = null;
  for (const [key, e] of Object.entries(p.exercises)) {
    const i = key.indexOf("/");
    if (i <= 0 || !e.lastPracticedAt || !gecerli(key.slice(0, i), key.slice(i + 1))) continue;
    if (!son || e.lastPracticedAt > son.at) son = { slug: key.slice(0, i), id: key.slice(i + 1), at: e.lastPracticedAt };
  }
  return son;
}
