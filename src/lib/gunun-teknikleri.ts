"use client";

import { useSyncExternalStore } from "react";
import { gununRutini, teknik, type TeknikId } from "@/content/rutin";

// Günün üç tekniği (günlük hedefin "Teknik: 3'ten 2" görevi). Kullanıcı seçebilir; o gün için seçim yoksa günün
// rutininin (Gün A / B / C) üç tekniği kullanılır. Seçimler gün gün saklanır (geçmiş günlerin görevleri ve seri
// seçildiği gibi hesaplansın); en çok 120 gün tutulur. localStorage anahtarı "gf-gunun-teknikleri".

const KEY = "gf-gunun-teknikleri";
type Kayit = Record<string, TeknikId[]>;
const BOS: Kayit = {};

let cache: Kayit | null = null;
const listeners = new Set<() => void>();

function read(): Kayit {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as unknown) : null;
    cache = v && typeof v === "object" && !Array.isArray(v) ? (v as Kayit) : BOS;
  } catch {
    cache = BOS;
  }
  return cache;
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useTeknikSecimi(): Kayit {
  return useSyncExternalStore(subscribe, read, () => BOS);
}

/** O günün üç tekniği: kayıtlı seçim (geçerli üç teknik) ya da günün rutininin teknikleri */
export function gununTeknikleri(secim: Kayit, tarih: string): TeknikId[] {
  const s = (secim[tarih] ?? []).filter((x) => teknik(x));
  return s.length === 3 ? s : [...gununRutini(tarih).teknikler];
}

/** Bugünün seçimini yazar; `null` rutinin önerisine döndürür */
export function teknikSec(tarih: string, liste: TeknikId[] | null) {
  const once = read();
  const next: Kayit = { ...once };
  if (liste && liste.length === 3) next[tarih] = liste;
  else delete next[tarih];
  const gunler = Object.keys(next).sort();
  for (const g of gunler.slice(0, Math.max(0, gunler.length - 120))) delete next[g];
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Kaydedilemezse oturum boyunca bellekte kalır.
  }
  listeners.forEach((l) => l());
}
