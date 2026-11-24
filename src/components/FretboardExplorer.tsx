"use client";

import SapGezgini from "./teori/SapGezgini";
import { gamBul, varsayilanKok } from "@/lib/gamlar";

// Ders ve doğaçlama sayfalarındaki sap gezgini: tam Sap Gezgini (/sap-gezgini) ile aynı bileşen, "Sap Gezgini'nde aç"
// bağlantısıyla. initialSet gam/akor kimliği, initialRoot kökün ses sınıfı (0 = Do).
type Props = { initialSet?: string; initialRoot?: number };

export default function FretboardExplorer({ initialSet = "minor-penta", initialRoot = 9 }: Props) {
  return <SapGezgini gam={initialSet} kok={varsayilanKok(initialRoot, gamBul(initialSet))} kompakt />;
}
