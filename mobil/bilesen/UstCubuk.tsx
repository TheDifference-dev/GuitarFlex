// Yol ekranlarının üst çubuğu: seçili kurs/yol (dokununca seçici), seri 🔥, günlük hedef halkası
import { Pressable, Text, View, StyleSheet } from "react-native";
import Glif from "./Glif";
import HedefHalkasi from "./HedefHalkasi";
import { R } from "~/lib/tema";
import { gunEtkinligi, seri, today, useProgress, VARSAYILAN_AYAR } from "~/lib/ilerleme";

export default function UstCubuk({ glif, renk, ad, sec }: { glif: string; renk: string; ad: string; sec?: () => void }) {
  const p = useProgress();
  const bugun = gunEtkinligi(p).get(today());
  const hedef = (p.ayarlar?.gunlukHedefDk ?? VARSAYILAN_AYAR.gunlukHedefDk) * 60;
  // Geçilen her teori adımı günlük hedefe 2 dakika sayılır
  const yapilan = (bugun?.sn ?? 0) + (bugun?.teori ?? 0) * 120;
  const n = seri(p);
  return (
    <View style={st.cubuk}>
      <Pressable onPress={sec} disabled={!sec} style={({ pressed }) => [st.secici, { opacity: pressed ? 0.7 : 1 }]} accessibilityRole="button" accessibilityLabel={`${ad}, değiştir`}>
        <View style={[st.simge, { backgroundColor: renk }]}>
          <Glif ad={glif} boyut={20} />
        </View>
        <Text style={st.ad} numberOfLines={1}>
          {ad}
        </Text>
        {sec && <Text style={{ color: R.soluk, fontSize: 13 }}>▾</Text>}
      </Pressable>
      <View style={st.sag}>
        <View style={st.seri} accessibilityLabel={`${n} günlük seri`}>
          <Text style={{ fontSize: 17 }}>🔥</Text>
          <Text style={[st.sayi, { color: n ? "#F07B00" : R.soluk }]}>{n}</Text>
        </View>
        <HedefHalkasi oran={yapilan / hedef} yazi={yapilan >= hedef ? "✓" : `${Math.floor(yapilan / 60)}`} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  cubuk: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, backgroundColor: R.zemin, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: R.cizgi },
  secici: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, backgroundColor: R.panel, borderRadius: 14, paddingLeft: 6, paddingRight: 12, paddingVertical: 6 },
  simge: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  ad: { fontSize: 15, fontWeight: "700", color: R.yazi, flexShrink: 1 },
  sag: { flexDirection: "row", alignItems: "center", gap: 14, marginLeft: 12 },
  seri: { flexDirection: "row", alignItems: "center", gap: 3 },
  sayi: { fontSize: 16, fontWeight: "800", fontVariant: ["tabular-nums"] },
});
