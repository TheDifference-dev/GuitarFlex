// Ders ekranı: kurs renginde başlık, tab oynatıcı (masaüstünün LessonPractice'i, DOM bileşeni), Müzik Bilgisi,
// İpuçları, Çalışma Defteri, önceki / sonraki ders.
import { Platform, Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import DersDom from "~/kopru/DersDom";
import DefterPaneli from "~/bilesen/DefterPaneli";
import Glif from "~/bilesen/Glif";
import { META, dersGlifi, kurs as kursOzet } from "~/lib/icerik";
import { disaridanYaz, useProgress, type Progress } from "~/lib/ilerleme";
import { masaustuYolu } from "~/lib/masaustu-yolu";
import { R, renk } from "~/lib/tema";
import { gitarProgrami } from "@/lib/gitarTonu";
import type { Course } from "@/content/types";
import kurslarVeri from "../../../icerik-paket/kurslar.json";

const KURSLAR = kurslarVeri as unknown as Course[];

export default function DersEkrani() {
  const { kurs: slug, id } = useLocalSearchParams<{ kurs: string; id: string }>();
  const p = useProgress();
  const c = KURSLAR.find((k) => k.slug === slug);
  const oz = kursOzet(slug);
  const duz = c?.sections.flatMap((s) => s.chapters.flatMap((ch) => ch.lessons.map((l) => ({ l, ch, s })))) ?? [];
  const i = duz.findIndex((x) => x.l.id === id);
  if (!c || !oz || i < 0) return <Text style={{ padding: 24 }}>Ders bulunamadı.</Text>;
  const { l, ch, s } = duz[i];
  const r = renk(c.slug);
  const tur = oz.bolumler.flatMap((b) => b.alt.flatMap((a) => a.dersler)).find((d) => d.id === l.id)?.tur ?? "drill";
  const teori = [...(ch.theory ?? []), ...(l.theory ?? [])];
  const anahtar = `${c.slug}/${l.id}`;
  const git = (k: number) => {
    const x = duz[k];
    if (x) router.replace({ pathname: "/ders/[kurs]/[id]", params: { kurs: c.slug, id: x.l.id } });
  };

  return (
    <ScrollView style={{ backgroundColor: R.zemin }} contentContainerStyle={{ paddingBottom: 48 }}>
      <Stack.Screen options={{ title: oz.kisa }} />
      <View style={[st.bas, { backgroundColor: r }]}>
        <View style={st.basUst}>
          <View style={st.simge}>
            <Glif ad={dersGlifi(oz, tur)} boyut={24} renk={r} kalinlik={2} />
          </View>
          <Text style={st.ust}>
            Bölüm {s.number} · {ch.title}
            {tur !== "drill" ? ` · ${META.dersTuruAdi[tur]}` : ""}
          </Text>
        </View>
        <Text style={st.baslik}>{l.title}</Text>
        <Text style={st.bilgi}>
          {[l.tex ? `${l.bpmRange ? `${l.bpmRange[0]}–${l.bpmRange[1]}` : l.bpm} BPM` : null, l.minutes ? `${l.minutes < 1 ? Math.round(l.minutes * 60) + " sn" : l.minutes + " dk"} hedef` : null, l.parts?.length ? `Kısımlar ${l.parts.map((x) => x.name).join(" · ")}` : null]
            .filter(Boolean)
            .join("  ·  ")}
        </Text>
        {l.description ? <Text style={st.aciklama}>{l.description}</Text> : null}
      </View>

      <DersDom
        key={anahtar}
        ders={{
          progressKey: anahtar,
          title: l.title,
          bpm: l.bpm,
          minutes: l.minutes,
          tex: l.tex,
          stave: l.stave,
          kind: l.kind,
          readBars: l.readBars,
          improvBars: l.improvBars,
          chords: l.chords,
          parts: l.parts,
          guitarProgram: gitarProgrami(l.tips, c.slug),
          govde: l.body,
        }}
        ilerleme={p}
        kopru={Platform.OS !== "web"}
        kaydet={async (yeni: Progress) => disaridanYaz(yeni)}
        git={async (y: string) => masaustuYolu(y)}
        dom={{ matchContents: true, scrollEnabled: false, mediaPlaybackRequiresUserAction: false, allowsInlineMediaPlayback: true }}
      />

      <View style={{ paddingHorizontal: 16, gap: 14 }}>
        {teori.length > 0 && <Kutu baslik="Müzik Bilgisi" satirlar={teori} />}
        {!!l.tips?.length && <Kutu baslik="İpuçları" satirlar={l.tips} />}
        <DefterPaneli anahtar={anahtar} sureYok={!!l.tex} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Gezinme yazi="‹ Önceki" kapali={i === 0} onPress={() => git(i - 1)} />
          <Gezinme yazi="Sonraki ›" kapali={i === duz.length - 1} onPress={() => git(i + 1)} ana renk={r} />
        </View>
      </View>
    </ScrollView>
  );
}

function Kutu({ baslik, satirlar }: { baslik: string; satirlar: string[] }) {
  return (
    <View style={{ backgroundColor: R.panel, borderRadius: 18, padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 17, fontWeight: "700", color: R.yazi }}>{baslik}</Text>
      {satirlar.map((t) => (
        <Text key={t} style={{ fontSize: 15, lineHeight: 21, color: R.soluk }}>
          • {t}
        </Text>
      ))}
    </View>
  );
}

function Gezinme({ yazi, kapali, onPress, ana, renk: rk }: { yazi: string; kapali: boolean; onPress: () => void; ana?: boolean; renk?: string }) {
  return (
    <Pressable disabled={kapali} onPress={onPress} style={[st.gez, ana && { backgroundColor: rk, borderColor: rk }, kapali && { opacity: 0.35 }]} accessibilityRole="button">
      <Text style={{ color: ana ? "#fff" : R.yazi, fontWeight: "700", fontSize: 16 }}>{yazi}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  bas: { margin: 12, borderRadius: 22, padding: 18, gap: 6 },
  basUst: { flexDirection: "row", alignItems: "center", gap: 10 },
  simge: { width: 38, height: 38, borderRadius: 11, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  ust: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "700", flex: 1 },
  baslik: { color: "#fff", fontSize: 24, fontWeight: "800", letterSpacing: -0.4, marginTop: 4 },
  bilgi: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "600" },
  aciklama: { color: "rgba(255,255,255,0.9)", fontSize: 15, lineHeight: 21, marginTop: 2 },
  gez: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: R.cizgi, backgroundColor: R.zemin },
});
