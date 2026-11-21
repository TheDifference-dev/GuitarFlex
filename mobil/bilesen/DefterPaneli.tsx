// Çalışma Defteri paneli (ders, teori adımı ve şarkı ekranlarının altında): sarı "Çalışmaya devam" / yeşil "Öğrendim",
// hangi gitarla, elle süre ekleme. Kayıt: ilerleme.defter + sessions (masaüstüyle aynı oturum biçimi).
import { Pressable, Text, View, StyleSheet } from "react-native";
import { defterYaz, sureEkle, useProgress, VARSAYILAN_AYAR, type DefterKaydi } from "~/lib/ilerleme";
import { R } from "~/lib/tema";

export default function DefterPaneli({ anahtar, sureYok }: { anahtar: string; sureYok?: boolean }) {
  const p = useProgress();
  const k = p.defter?.[anahtar];
  const gitarlar = p.ayarlar?.gitarlar ?? VARSAYILAN_AYAR.gitarlar;
  const toplam = p.sessions.filter((s) => s.exerciseId === anahtar).reduce((n, s) => n + s.seconds, 0);
  const durum = (d: DefterKaydi["durum"]) => defterYaz(anahtar, k?.durum === d ? null : { durum: d, gitar: k?.gitar, not: k?.not });
  return (
    <View style={st.kutu}>
      <Text style={st.baslik}>Çalışma Defteri</Text>
      <View style={st.satir}>
        <Dugme yazi="Çalışmaya devam" renk={R.sari} secili={k?.durum === "devam"} onPress={() => durum("devam")} />
        <Dugme yazi="Öğrendim" renk={R.yesil} secili={k?.durum === "ogrendim"} onPress={() => durum("ogrendim")} />
      </View>
      {gitarlar.length > 0 && (
        <>
          <Text style={st.etiket}>Hangi gitarla?</Text>
          <View style={[st.satir, { flexWrap: "wrap" }]}>
            {gitarlar.map((g) => (
              <Pressable key={g} onPress={() => defterYaz(anahtar, { durum: k?.durum ?? "devam", gitar: k?.gitar === g ? undefined : g, not: k?.not })} style={[st.cip, k?.gitar === g && { backgroundColor: R.yazi }]}>
                <Text style={{ color: k?.gitar === g ? "#fff" : R.yazi, fontWeight: "600", fontSize: 14 }}>{g}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      {!sureYok && (
        <>
          <Text style={st.etiket}>Süre ekle {toplam ? `· toplam ${Math.round(toplam / 60)} dk` : ""}</Text>
          <View style={st.satir}>
            {[5, 10, 15, 30].map((dk) => (
              <Pressable key={dk} onPress={() => sureEkle(anahtar, dk, k?.gitar)} style={st.cip} accessibilityRole="button">
                <Text style={{ color: R.yazi, fontWeight: "600", fontSize: 14 }}>+{dk} dk</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

function Dugme({ yazi, renk, secili, onPress }: { yazi: string; renk: string; secili: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: secili }} style={[st.dugme, { borderColor: renk, backgroundColor: secili ? renk : R.zemin }]}>
      <Text style={{ color: secili ? "#fff" : R.yazi, fontWeight: "700", fontSize: 15 }}>{yazi}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  kutu: { backgroundColor: R.panel, borderRadius: 18, padding: 16, gap: 10 },
  baslik: { fontSize: 17, fontWeight: "700", color: R.yazi },
  satir: { flexDirection: "row", gap: 8 },
  etiket: { fontSize: 13, color: R.soluk, fontWeight: "600", marginTop: 4 },
  dugme: { flex: 1, borderWidth: 2, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  cip: { backgroundColor: R.zemin, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: R.cizgi },
});
