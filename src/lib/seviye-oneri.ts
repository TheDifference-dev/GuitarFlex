// Seviye Yolu önerileri (tarayıcıda; saf işlevler + bilgi düzeyi seçimi).
// Bilgi düzeyi: kullanıcı seçtiyse o kademe; "otomatik"te ilerlemeye göre bitirilmemiş ilk kademe
// (tablı derslerin ve Okuma, Kulak, Ritim adımlarının %70'i). Öneri: o kademede dört eksenin her birinden
// sıradaki (bitmemiş) ilk ders; liste zaten kolaydan zora sıralı (içerik seviyesi, önkoşul derinliği, kurs sırası).
import { useSyncExternalStore } from "react";
import type { Axis } from "@/content/types";
import {
  BITIRME_ORANI,
  EKSEN,
  KADEMELER,
  isKademe,
  kosulDersleri,
  type Kademe,
  type SeviyeDers,
  type SeviyeSatiri,
  type SeviyeVerisi,
} from "@/content/seviyeler";
import type { Progress } from "./progress";

/** Ders tamamlandı mı: pratik kartı / yol adımında adım geçilmiş olmalı, diğerlerinde ders tamamlanmış (CourseView ile aynı kural) */
export const dersBitti = (p: Progress, d: SeviyeDers) => (d.step ? Boolean(p.steps[d.step]?.passed) : Boolean(p.exercises[d.key]?.completed));

/** Kademenin bitirme ilerlemesi: tablı dersler + Okuma, Kulak, Ritim adımları birlikte */
export function kademeIlerlemesi(p: Progress, v: SeviyeVerisi) {
  const dersler = kosulDersleri(v);
  const bitti = dersler.filter((d) => dersBitti(p, d)).length;
  const oran = dersler.length ? bitti / dersler.length : 0;
  return { bitti, toplam: dersler.length, oran, tamam: dersler.length > 0 && oran >= BITIRME_ORANI };
}

/** İlerlemeye göre bilgi düzeyi: bitirilmemiş ilk kademe (hepsi bittiyse Üst Düzey) */
export function otomatikKademe(p: Progress, veriler: Record<Kademe, SeviyeVerisi>): Kademe {
  return KADEMELER.find((k) => !kademeIlerlemesi(p, veriler[k]).tamam) ?? "ust";
}

export type Oneri = { ders: SeviyeDers; satir: SeviyeSatiri; eksen: Axis; neden: string };

const EKSEN_SIRASI: Axis[] = ["technique", "fretboard", "rhythm", "theory_ear"];

/** Kademede önerilen dersler: önce yarım kalan bir ders, sonra her eksenden sıradaki ilk bitmemiş ders; boş eksenler
 *  teknikten tamamlanır. Ek kurs, Stil kursu ve etüt yalnız ana içerik bitince önerilir (liste sırası zaten böyle). */
export function oneriler(p: Progress, v: SeviyeVerisi, adet = 4): Oneri[] {
  const out: Oneri[] = [];
  const alindi = new Set<string>();
  const ekle = (satir: SeviyeSatiri, ders: SeviyeDers, neden: string) => {
    if (alindi.has(ders.key) || out.length >= adet) return;
    alindi.add(ders.key);
    out.push({ ders, satir, eksen: satir.axis, neden });
  };
  const bitmemis = (r: SeviyeSatiri) => r.lessons.find((d) => !dersBitti(p, d) && !alindi.has(d.key));

  // Yarım kalan: süre çalışılmış ama tamamlanmamış en son ders
  let yarim: { r: SeviyeSatiri; d: SeviyeDers; at: string } | null = null;
  for (const r of v.rows)
    for (const d of r.lessons) {
      const e = d.step ? undefined : p.exercises[d.key];
      if (e && !e.completed && e.totalSeconds > 0 && (!yarim || e.lastPracticedAt > yarim.at)) yarim = { r, d, at: e.lastPracticedAt };
    }
  if (yarim) ekle(yarim.r, yarim.d, "Kaldığın yer");

  for (const eksen of EKSEN_SIRASI) {
    const r = v.rows.find((x) => x.axis === eksen && bitmemis(x));
    if (r) ekle(r, bitmemis(r)!, EKSEN[eksen]);
  }
  // Eksik eksenleri sıradaki derslerle doldur
  for (const r of v.rows) {
    if (out.length >= adet) break;
    const d = bitmemis(r);
    if (d) ekle(r, d, EKSEN[r.axis]);
  }
  return out;
}

// ── Bilgi düzeyi seçimi (localStorage) ──────────────────────────────────────
export type BilgiDuzeyi = Kademe | "otomatik";
const KEY = "gf.bilgiDuzeyi";
const dinleyen = new Set<() => void>();

function oku(): BilgiDuzeyi {
  try {
    const v = localStorage.getItem(KEY);
    return v && isKademe(v) ? v : "otomatik";
  } catch {
    return "otomatik";
  }
}

export function bilgiDuzeyiYaz(v: BilgiDuzeyi) {
  try {
    if (v === "otomatik") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, v);
  } catch {
    // Depolama kapalı: yalnız bu oturum
  }
  dinleyen.forEach((l) => l());
}

export function useBilgiDuzeyi(): BilgiDuzeyi {
  return useSyncExternalStore(
    (l) => {
      dinleyen.add(l);
      const st = (e: StorageEvent) => e.key === KEY && l();
      window.addEventListener("storage", st);
      return () => {
        dinleyen.delete(l);
        window.removeEventListener("storage", st);
      };
    },
    oku,
    () => "otomatik",
  );
}
