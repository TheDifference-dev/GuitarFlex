// Teori yolu adımı: başlık kartı + masaüstünün soru motoru (DOM bileşeni)
import { Platform, ScrollView, Text, View, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import AdimDom from "~/kopru/AdimDom";
import Glif from "~/bilesen/Glif";
import { META, kurs } from "~/lib/icerik";
import { disaridanYaz, useProgress, type Progress } from "~/lib/ilerleme";
import { masaustuYolu } from "~/lib/masaustu-yolu";
import { R, renk } from "~/lib/tema";
import type { Yol } from "@/lib/alistirma/tipler";
import yollarVeri from "../../../icerik-paket/yollar.json";

const YOLLAR = yollarVeri as unknown as Record<string, Yol>;

export default function AdimEkrani() {
  const { yol: slug, kod } = useLocalSearchParams<{ yol: string; kod: string }>();
  const p = useProgress();
  const y = YOLLAR[slug];
  const i = y?.adimlar.findIndex((a) => a.kod === kod) ?? -1;
  if (!y || i < 0) return <Text style={{ padding: 24 }}>Adım bulunamadı.</Text>;
  const adim = y.adimlar[i];
  const bolum = y.bolumler.find((b) => b.no === adim.bolum);
  const aday = y.adimlar[i + 1];
  // Ana yolun son adımından Ek bölümlere geçilmez (masaüstüyle aynı)
  const sonraki = aday && !!y.bolumler.find((b) => b.no === aday.bolum)?.ek === !!bolum?.ek ? { kod: aday.kod, ad: aday.ad } : undefined;
  // Kursa bağlı yol (Armoni): pratik kartı kursta varsa geri dönüş kursa
  const kursta = !!y.kurs && !!kurs(y.kurs)?.bolumler.some((b) => b.alt.some((a) => a.dersler.some((d) => d.pratik?.yol === slug && d.pratik.kod === kod)));
  const r = renk(`yol:${slug}`);
  const s = p.steps[`${slug}/${kod}`];
  return (
    <ScrollView style={{ backgroundColor: R.zemin }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: META.yolAdlari[slug] ?? y.ad }} />
      <View style={[st.bas, { backgroundColor: r }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={st.simge}>
            <Glif ad={adim.kontrol ? "hedef" : META.yolSimgeleri[slug]?.glif ?? "liste"} boyut={24} renk={r} kalinlik={2} />
          </View>
          <Text style={st.ust} numberOfLines={2}>
            {bolum?.ek ? "Ek · " : ""}
            {bolum?.ad} · {adim.kod}
            {adim.kontrol ? " · Bölüm kontrolü" : ""}
          </Text>
        </View>
        <Text style={st.baslik}>{adim.ad}</Text>
        <Text style={st.bilgi}>
          {adim.soru} soru · geçme %{adim.gecme.dogruluk}
          {s ? ` · en iyi %${Math.round(s.best)}${s.passed ? " ✓" : ""}` : ""}
        </Text>
      </View>
      <AdimDom
        key={`${slug}/${kod}`}
        yol={slug}
        adim={adim}
        sonraki={sonraki}
        geri={kursta ? `/calis/${y.kurs}` : undefined}
        ilerleme={p}
        kopru={Platform.OS !== "web"}
        kaydet={async (yeni: Progress) => disaridanYaz(yeni)}
        git={async (h: string) => masaustuYolu(h)}
        dom={{ matchContents: true, scrollEnabled: false, mediaPlaybackRequiresUserAction: false }}
      />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  bas: { margin: 12, borderRadius: 22, padding: 18, gap: 6 },
  simge: { width: 38, height: 38, borderRadius: 11, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  ust: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "700", flex: 1 },
  baslik: { color: "#fff", fontSize: 24, fontWeight: "800", letterSpacing: -0.4, marginTop: 4 },
  bilgi: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "600" },
});
