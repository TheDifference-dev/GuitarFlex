// Yol sekmesi: seçili kursun Duolingo tarzı yolu (bölüm = ünite, ders = düğüm)
import { useMemo, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Yol, { type Unite } from "~/bilesen/Yol";
import UstCubuk from "~/bilesen/UstCubuk";
import Secici from "~/bilesen/Secici";
import { KURS_GRUPLARI, KURSLAR, META, dersGlifi, kurs as kursBul } from "~/lib/icerik";
import { useProgress, type Progress } from "~/lib/ilerleme";
import { useSecim, secimYaz } from "~/lib/secim";
import { R, renk } from "~/lib/tema";

export const dersTamam = (p: Progress, slug: string, id: string, pratik?: { yol: string; kod: string }) =>
  pratik ? !!p.steps[`${pratik.yol}/${pratik.kod}`]?.passed : !!p.exercises[`${slug}/${id}`]?.completed;

export default function YolSekmesi() {
  const p = useProgress();
  const { kurs: slug } = useSecim();
  const [acik, setAcik] = useState(false);
  const k = kursBul(slug) ?? KURSLAR[0];
  const r = renk(k.slug);

  const uniteler = useMemo<Unite[]>(
    () =>
      k.bolumler.map((b) => ({
        anahtar: String(b.no),
        ust: `Bölüm ${b.no}${b.seviye ? ` · ${b.seviye}` : ""}`,
        baslik: b.baslik,
        alt: b.alt.length > 1 ? `${b.alt.length} alt bölüm` : b.alt[0]?.baslik,
        renk: r,
        dugumler: b.alt.flatMap((a) =>
          a.dersler.map((d) => ({
            anahtar: d.id,
            baslik: d.baslik,
            alt: [a.baslik, d.tur !== "drill" ? META.dersTuruAdi[d.tur] : null, d.pratik ? null : `${d.bpm} BPM`, d.dk ? `${d.dk < 1 ? Math.round(d.dk * 60) + " sn" : d.dk + " dk"}` : null].filter(Boolean).join(" · "),
            glif: dersGlifi(k, d.tur),
            tamam: dersTamam(p, k.slug, d.id, d.pratik),
            yarim: d.pratik ? (p.steps[`${d.pratik.yol}/${d.pratik.kod}`]?.attempts ?? 0) > 0 : (p.exercises[`${k.slug}/${d.id}`]?.totalSeconds ?? 0) > 0,
            kontrol: d.tur === "etut" || d.tur === "resital",
            ac: () =>
              d.pratik
                ? router.push({ pathname: "/adim/[yol]/[kod]", params: { yol: d.pratik.yol, kod: d.pratik.kod } })
                : router.push({ pathname: "/ders/[kurs]/[id]", params: { kurs: k.slug, id: d.id } }),
          })),
        ),
      })),
    [k, p, r],
  );

  const gruplar = KURS_GRUPLARI.map((g) => ({
    ad: g.ad,
    satirlar: g.kurslar.map((c) => {
      const tum = c.bolumler.flatMap((b) => b.alt.flatMap((a) => a.dersler));
      const biten = tum.filter((d) => dersTamam(p, c.slug, d.id, d.pratik)).length;
      return { anahtar: c.slug, ad: c.baslik, alt: `${c.bolumler.length} bölüm · ${tum.length} ders`, glif: c.simge.glif, renk: renk(c.slug), oran: tum.length ? biten / tum.length : 0 };
    }),
  }));

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: R.zemin }}>
      <UstCubuk glif={k.simge.glif} renk={r} ad={k.kisa} sec={() => setAcik(true)} />
      <View style={{ flex: 1 }}>
        <Yol key={k.slug} uniteler={uniteler} />
      </View>
      <Secici acik={acik} kapat={() => setAcik(false)} gruplar={gruplar} secili={k.slug} sec={(s) => secimYaz({ kurs: s })} baslik="Kurs seç" />
    </SafeAreaView>
  );
}
