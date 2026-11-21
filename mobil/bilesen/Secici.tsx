// Kurs / yol seçici (alt sayfa): gruplar, her satırda simge, ad ve ilerleme
import { Modal, Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Glif from "./Glif";
import { R } from "~/lib/tema";

export type SeciciSatir = { anahtar: string; ad: string; alt: string; glif: string; renk: string; oran: number };

export default function Secici({ acik, kapat, gruplar, secili, sec, baslik }: { acik: boolean; kapat: () => void; gruplar: { ad: string; satirlar: SeciciSatir[] }[]; secili: string; sec: (a: string) => void; baslik: string }) {
  const ic = useSafeAreaInsets();
  return (
    <Modal visible={acik} animationType="slide" presentationStyle="pageSheet" onRequestClose={kapat} transparent={false}>
      <View style={{ flex: 1, backgroundColor: R.zemin, paddingTop: 12 }}>
        <View style={st.ust}>
          <Text style={st.baslik}>{baslik}</Text>
          <Pressable onPress={kapat} accessibilityRole="button" hitSlop={12}>
            <Text style={{ color: R.mavi, fontSize: 17, fontWeight: "600" }}>Bitti</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: ic.bottom + 24 }}>
          {gruplar.map((g) => (
            <View key={g.ad} style={{ marginBottom: 20 }}>
              <Text style={st.grup}>{g.ad}</Text>
              <View style={st.kutu}>
                {g.satirlar.map((s, i) => (
                  <Pressable
                    key={s.anahtar}
                    onPress={() => {
                      sec(s.anahtar);
                      kapat();
                    }}
                    style={({ pressed }) => [st.satir, i > 0 && st.ayrac, { backgroundColor: pressed ? R.panel2 : R.panel }]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: s.anahtar === secili }}
                  >
                    <View style={[st.simge, { backgroundColor: s.renk }]}>
                      <Glif ad={s.glif} boyut={22} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.ad} numberOfLines={1}>{s.ad}</Text>
                      <Text style={st.alt}>{s.alt}</Text>
                      <View style={st.cubuk}>
                        <View style={[st.dolgu, { width: `${Math.round(s.oran * 100)}%`, backgroundColor: s.renk }]} />
                      </View>
                    </View>
                    {s.anahtar === secili && <Text style={{ color: R.mavi, fontSize: 18, fontWeight: "700" }}>✓</Text>}
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  ust: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 },
  baslik: { fontSize: 22, fontWeight: "700", color: R.yazi },
  grup: { fontSize: 13, fontWeight: "700", color: R.soluk, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8, marginLeft: 4 },
  kutu: { borderRadius: 16, overflow: "hidden" },
  satir: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  ayrac: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: R.cizgi },
  simge: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  ad: { fontSize: 16, fontWeight: "600", color: R.yazi },
  alt: { fontSize: 13, color: R.soluk, marginTop: 1 },
  cubuk: { height: 4, borderRadius: 2, backgroundColor: R.bos, marginTop: 6, overflow: "hidden" },
  dolgu: { height: 4, borderRadius: 2 },
});
