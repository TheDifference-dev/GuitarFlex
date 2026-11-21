// Seçili kurs ve teori yolu (cihazda kalır)
import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Secim = { kurs: string; yol: string };
const KEY = "gf.mobil.secim";
let s: Secim = { kurs: "sifirdan-baslangic-rehberi", yol: "ritim" };
const dinleyen = new Set<() => void>();

AsyncStorage.getItem(KEY)
  .then((r) => {
    if (r) {
      s = { ...s, ...JSON.parse(r) };
      dinleyen.forEach((l) => l());
    }
  })
  .catch(() => {});

export function secimYaz(y: Partial<Secim>) {
  s = { ...s, ...y };
  AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {});
  dinleyen.forEach((l) => l());
}

export function useSecim(): Secim {
  return useSyncExternalStore(
    (l) => {
      dinleyen.add(l);
      return () => dinleyen.delete(l);
    },
    () => s,
    () => s,
  );
}
