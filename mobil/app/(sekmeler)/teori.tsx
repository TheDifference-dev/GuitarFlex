// Teori sekmesi: Ritim, Klavye, Kulak, Armoni, Okuma yolları (GuitarBear yapısı + Ek bölümler; kilit yok)
import { useMemo, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Yol, { type Unite } from "~/bilesen/Yol";
import UstCubuk from "~/bilesen/UstCubuk";
import Secici from "~/bilesen/Secici";
import { META, YOL_SIRASI } from "~/lib/icerik";
import { useProgress } from "~/lib/ilerleme";
import { useSecim, secimYaz } from "~/lib/secim";
import { R, renk } from "~/lib/tema";
import yollarVeri from "../../icerik-paket/yollar.json";
import type { Yol as YolVeri } from "@/lib/alistirma/tipler";

const YOLLAR = yollarVeri as unknown as Record<string, YolVeri>;

export default function TeoriSekmesi() {
  const p = useProgress();
  const { yol: secili } = useSecim();
  const [acik, setAcik] = useState(false);
  const slug = YOLLAR[secili] ? secili : YOL_SIRASI[0];
  const y = YOLLAR[slug];
  const r = renk(`yol:${slug}`);

  const uniteler = useMemo<Unite[]>(
    () =>
      y.bolumler.map((b) => ({
        anahtar: String(b.no),
        ust: b.ek ? `Ek · ${b.kod ?? ""}` : b.etiket ?? `Bölüm ${b.no}`,
        baslik: b.ad,
        alt: `${y.adimlar.filter((a) => a.bolum === b.no).length} adım`,
        renk: r,
        ek: b.ek,
        dugumler: y.adimlar
          .filter((a) => a.bolum === b.no)
          .map((a) => {
            const s = p.steps[`${slug}/${a.kod}`];
            return {
              anahtar: a.kod,
              baslik: `${a.kod} · ${a.ad}`,
              alt: `${a.soru} soru · geçme %${a.gecme.dogruluk}${s ? ` · en iyi %${Math.round(s.best)}` : ""}`,
              glif: a.kontrol ? "hedef" : META.yolSimgeleri[slug]?.glif ?? "liste",
              tamam: !!s?.passed,
              yarim: !!s && !s.passed,
              kontrol: a.kontrol,
              ac: () => router.push({ pathname: "/adim/[yol]/[kod]", params: { yol: slug, kod: a.kod } }),
            };
          }),
      })),
    [y, p, r, slug],
  );

  const gruplar = [
    {
      ad: "Teori yolları",
      satirlar: YOL_SIRASI.map((s) => {
        const v = YOLLAR[s];
        const n = META.yollar[s];
        const gecen = v.adimlar.filter((a) => p.steps[`${s}/${a.kod}`]?.passed).length;
        return { anahtar: s, ad: META.yolAdlari[s] ?? v.ad, alt: `${n.ana} adım${n.ek ? ` · ${n.ek} ek adım` : ""}`, glif: META.yolSimgeleri[s]?.glif ?? "liste", renk: renk(`yol:${s}`), oran: gecen / v.adimlar.length };
      }),
    },
  ];

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: R.zemin }}>
      <UstCubuk glif={META.yolSimgeleri[slug]?.glif ?? "liste"} renk={r} ad={META.yolAdlari[slug] ?? y.ad} sec={() => setAcik(true)} />
      <View style={{ flex: 1 }}>
        <Yol key={slug} uniteler={uniteler} />
      </View>
      <Secici acik={acik} kapat={() => setAcik(false)} gruplar={gruplar} secili={slug} sec={(s) => secimYaz({ yol: s })} baslik="Teori yolu seç" />
    </SafeAreaView>
  );
}
