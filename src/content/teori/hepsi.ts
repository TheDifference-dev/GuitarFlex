// Bütün teori dersleri tek yerde: temel dersler (dersler.ts), yol modüllerinin dersleri (moduller.ts), Armoni ve
// Nota Okuma kitaplarının yeni dersleri ve çok yapraklı Modlar dersi. /teori/<slug> sayfası buradan okur;
// sıralama mufredat.ts'te.
import type { Ders } from "./tipler.ts";
import { DERSLER } from "./dersler.ts";
import { MODUL_DERS } from "./moduller.ts";
import { ARMONI_DERSLERI } from "./armoni-dersleri.ts";
import { OKUMA_DERSLERI } from "./okuma-dersleri.ts";
import { MODLAR_DERSI } from "./modlar.ts";

export const TUM_DERSLER: Ders[] = [...DERSLER, MODLAR_DERSI, ...ARMONI_DERSLERI, ...OKUMA_DERSLERI, ...Object.values(MODUL_DERS).flatMap((s) => Object.values(s))];

export const dersGetir = (slug: string) => TUM_DERSLER.find((d) => d.slug === slug);
