// Şarkı Rehberi adımı: şarkı bilgisi, hazırlayan teknik bölümleri, Songsterr'de aç (tab uygulamada tutulmaz)
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import DefterPaneli from "~/bilesen/DefterPaneli";
import Glif from "~/bilesen/Glif";
import { REHBER, kurs } from "~/lib/icerik";
import { secimYaz } from "~/lib/secim";
import { R, renk } from "~/lib/tema";

export default function SarkiAdimi() {
  const { adim } = useLocalSearchParams<{ adim: string }>();
  const s = REHBER.find((x) => String(x.adim) === adim);
  if (!s) return <Text style={{ padding: 24 }}>Şarkı bulunamadı.</Text>;
  const r = renk("sarkilar");
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }} style={{ backgroundColor: R.zemin }}>
      <Stack.Screen options={{ title: `Adım ${s.adim}` }} />
      <View style={[st.kapak, { backgroundColor: r }]}>
        <Glif ad="nota" boyut={40} />
        <Text style={st.baslik}>{s.baslik}</Text>
        <Text style={st.sanatci}>{s.sanatci}</Text>
        <Text style={st.bilgi}>{[`Seviye ${s.seviye}`, s.tur, s.madalya, s.bpm ? `${s.bpm} BPM` : null].filter(Boolean).join(" · ")}</Text>
        <Pressable onPress={() => WebBrowser.openBrowserAsync(s.url)} style={({ pressed }) => [st.dugme, { opacity: pressed ? 0.85 : 1 }]} accessibilityRole="link">
          <Text style={{ color: r, fontWeight: "800", fontSize: 16 }}>Songsterr'de aç</Text>
        </Pressable>
      </View>
      {s.bolumler.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={st.ara}>Önce bunları çalış</Text>
          {s.bolumler.map((b) => {
            const k = kurs(b.kurs);
            return (
              <Pressable
                key={`${b.kurs}-${b.bolum}`}
                onPress={() => {
                  secimYaz({ kurs: b.kurs });
                  router.navigate("/");
                }}
                style={st.satir}
              >
                <View style={[st.simge, { backgroundColor: renk(b.kurs) }]}>
                  <Glif ad={k?.simge.glif ?? "gitar"} boyut={22} />
                </View>
                <Text style={{ flex: 1, fontSize: 16, fontWeight: "600", color: R.yazi }}>{b.ad}</Text>
                <Text style={{ color: R.soluk, fontSize: 18 }}>›</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      <DefterPaneli anahtar={`sarki/${s.adim}`} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  kapak: { borderRadius: 22, padding: 20, gap: 4 },
  baslik: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 8, letterSpacing: -0.4 },
  sanatci: { color: "rgba(255,255,255,0.9)", fontSize: 17, fontWeight: "600" },
  bilgi: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 4 },
  dugme: { backgroundColor: "#fff", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 14 },
  ara: { fontSize: 13, fontWeight: "700", color: R.soluk, textTransform: "uppercase", letterSpacing: 0.6 },
  satir: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: R.panel, borderRadius: 14, padding: 12 },
  simge: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
