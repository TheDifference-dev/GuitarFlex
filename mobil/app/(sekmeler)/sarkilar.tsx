// Şarkılar sekmesi: GuitarBear Şarkı Rehberi'nin 38 adımı, sırası birebir. Şarkılar Songsterr'de açılır.
import { useMemo } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Yol, { type Unite } from "~/bilesen/Yol";
import UstCubuk from "~/bilesen/UstCubuk";
import { REHBER } from "~/lib/icerik";
import { useProgress } from "~/lib/ilerleme";
import { R, renk } from "~/lib/tema";

const SEVIYE_ADI: Record<string, string> = { "1": "Seviye 1", "2": "Seviye 2", "3": "Seviye 3", "4": "Seviye 4", "5": "Seviye 5" };

export default function SarkilarSekmesi() {
  const p = useProgress();
  const r = renk("sarkilar");
  const uniteler = useMemo<Unite[]>(() => {
    const gruplar = new Map<string, typeof REHBER>();
    for (const s of REHBER) {
      const g = s.seviye.split(".")[0];
      gruplar.set(g, [...(gruplar.get(g) ?? []), s]);
    }
    return [...gruplar].map(([g, liste]) => ({
      anahtar: g,
      ust: SEVIYE_ADI[g] ?? `Seviye ${g}`,
      baslik: `${liste.length} şarkı`,
      alt: `Adım ${liste[0].adim}–${liste[liste.length - 1].adim}`,
      renk: r,
      dugumler: liste.map((s) => {
        const d = p.defter?.[`sarki/${s.adim}`];
        return {
          anahtar: String(s.adim),
          baslik: `${s.baslik} — ${s.sanatci}`,
          alt: [`Adım ${s.adim}`, s.tur, s.madalya, s.bpm ? `${s.bpm} BPM` : null].filter(Boolean).join(" · "),
          glif: s.tur === "solo" ? "mikrofon" : s.tur === "riff" ? "gitar" : "nota",
          tamam: d?.durum === "ogrendim",
          yarim: d?.durum === "devam",
          dugme: "AÇ",
          ac: () => router.push({ pathname: "/sarki/[adim]", params: { adim: String(s.adim) } }),
        };
      }),
    }));
  }, [p, r]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: R.zemin }}>
      <UstCubuk glif="nota" renk={r} ad="Şarkılarla Öğren" />
      <View style={{ flex: 1 }}>
        <Yol uniteler={uniteler} />
      </View>
    </SafeAreaView>
  );
}
