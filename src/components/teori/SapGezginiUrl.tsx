"use client";

import { useSearchParams } from "next/navigation";
import SapGezgini from "./SapGezgini";

/** /sap-gezgini?gam=dorian&kok=A: başlangıç gamı ve kökü adres satırından */
export default function SapGezginiUrl() {
  const q = useSearchParams();
  const gam = q.get("gam") ?? "minor-penta";
  const kok = q.get("kok") ?? "A";
  return <SapGezgini key={`${gam}:${kok}`} gam={gam} kok={kok} />;
}
