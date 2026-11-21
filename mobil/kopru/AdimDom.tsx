"use dom";
// Teori yolu adımı: masaüstünün soru motoru (AdimCalis: sap, porte, ritim, kulak soruları) aynen.
import "./dom.css";
import { useEffect, useState } from "react";
import AdimCalis from "@/components/yol/AdimCalis";
import type { YolAdim } from "@/lib/alistirma/tipler";
import { kopruGuncelle, kopruKur, type Progress } from "~/lib/ilerleme";
import { gitKur } from "./git";

export default function AdimDom({ yol, adim, sonraki, geri, ilerleme, kopru, kaydet, git }: { yol: string; adim: YolAdim; sonraki?: { kod: string; ad: string }; geri?: string; ilerleme: Progress; kopru?: boolean; kaydet: (p: Progress) => Promise<void>; git: (yol: string) => Promise<void>; dom?: import("expo/dom").DOMProps }) {
  const [hazir, setHazir] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.mod = "acik";
    // kopru: iOS'ta WebView ayrı JS bağlamıdır → kayıt yerel uygulamaya gider. Web'de aynı modül kullanılır.
    if (kopru) kopruKur(ilerleme, (p) => void kaydet(p));
    gitKur((y) => void git(y));
    setHazir(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Yerel taraftaki değişiklikler (defter, öteki ekranlar) WebView'deki kopyaya
  useEffect(() => {
    if (kopru && hazir) kopruGuncelle(ilerleme);
  }, [kopru, hazir, ilerleme]);
  if (!hazir) return null;
  return (
    <div className="px-3 pb-8 pt-2 text-text">
      <AdimCalis key={adim.kod} yol={yol} adim={adim} sonraki={sonraki} geri={geri} />
    </div>
  );
}
