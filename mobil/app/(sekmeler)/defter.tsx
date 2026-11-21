// Çalışma Defteri: aylık takvim (etkin günler), seçili günün kayıtları, "çalışmaya devam" / "öğrendim" listeleri,
// günlük hedef ve gitarlar.
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Glif from "~/bilesen/Glif";
import { anahtarBilgi } from "~/lib/anahtar";
import { ayarYaz, formatDuration, gunEtkinligi, seri, today, useProgress, VARSAYILAN_AYAR } from "~/lib/ilerleme";
import { META } from "~/lib/icerik";
import { R, ton } from "~/lib/tema";

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const GUNLER = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

function ac(key: string) {
  const [on, ...son] = key.split("/");
  const geri = son.join("/");
  if (on === "sarki") router.push({ pathname: "/sarki/[adim]", params: { adim: geri } });
  else if (META.yollar[on]) router.push({ pathname: "/adim/[yol]/[kod]", params: { yol: on, kod: geri } });
  else router.push({ pathname: "/ders/[kurs]/[id]", params: { kurs: on, id: geri } });
}

export default function Defter() {
  const p = useProgress();
  const [ay, setAy] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [gun, setGun] = useState(today());
  const [yeniGitar, setYeniGitar] = useState("");
  const etkin = useMemo(() => gunEtkinligi(p), [p]);
  const hedefDk = p.ayarlar?.gunlukHedefDk ?? VARSAYILAN_AYAR.gunlukHedefDk;
  const gitarlar = p.ayarlar?.gitarlar ?? VARSAYILAN_AYAR.gitarlar;

  const hucreler = useMemo(() => {
    const ilk = new Date(ay.y, ay.m, 1);
    const bos = (ilk.getDay() + 6) % 7;
    const gunSay = new Date(ay.y, ay.m + 1, 0).getDate();
    return [...Array(bos).fill(null), ...Array.from({ length: gunSay }, (_, i) => today(new Date(ay.y, ay.m, i + 1)))];
  }, [ay]);

  const ayToplam = [...etkin].filter(([d]) => d.startsWith(`${ay.y}-${String(ay.m + 1).padStart(2, "0")}`)).reduce((n, [, v]) => n + v.sn, 0);
  const gunOturum = p.sessions.filter((s) => s.date === gun);
  const gunTeori = Object.entries(p.steps).filter(([, s]) => s.at.startsWith(gun) || today(new Date(s.at)) === gun);
  const kayitlar = Object.entries(p.defter ?? {}).sort((a, b) => b[1].at.localeCompare(a[1].at));
  const devam = kayitlar.filter(([, k]) => k.durum === "devam");
  const ogrendim = kayitlar.filter(([, k]) => k.durum === "ogrendim");

  const ayDegis = (n: number) => setAy(({ y, m }) => ({ y: m + n < 0 ? y - 1 : m + n > 11 ? y + 1 : y, m: (m + n + 12) % 12 }));

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: R.zemin }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 48, maxWidth: 560, width: "100%", alignSelf: "center" }}>
        <Text style={st.sayfaBaslik}>Çalışma Defteri</Text>
        <View style={st.ozet}>
          <Ozet sayi={`🔥 ${seri(p)}`} etiket="günlük seri" />
          <Ozet sayi={formatDuration(ayToplam)} etiket={`${AYLAR[ay.m]} toplamı`} />
          <Ozet sayi={String(ogrendim.length)} etiket="öğrenildi" />
        </View>

        {/* Takvim */}
        <View style={st.kutu}>
          <View style={st.ayUst}>
            <Pressable onPress={() => ayDegis(-1)} hitSlop={12} accessibilityLabel="Önceki ay">
              <Text style={st.ok}>‹</Text>
            </Pressable>
            <Text style={st.ayAd}>
              {AYLAR[ay.m]} {ay.y}
            </Text>
            <Pressable onPress={() => ayDegis(1)} hitSlop={12} accessibilityLabel="Sonraki ay">
              <Text style={st.ok}>›</Text>
            </Pressable>
          </View>
          <View style={st.izgara}>
            {GUNLER.map((g) => (
              <Text key={g} style={st.gunAd}>
                {g}
              </Text>
            ))}
            {hucreler.map((d, i) => {
              if (!d) return <View key={`b${i}`} style={st.hucre} />;
              const e = etkin.get(d);
              const oran = e ? Math.min(1, (e.sn + e.teori * 120) / (hedefDk * 60)) : 0;
              const secili = d === gun;
              return (
                <Pressable key={d} onPress={() => setGun(d)} style={st.hucre} accessibilityLabel={`${d}${e ? `, ${Math.round(e.sn / 60)} dakika` : ""}`}>
                  <View style={[st.gun, e && { backgroundColor: oran >= 1 ? R.yesil : ton(R.yesil, 0.75 - oran * 0.5) }, secili && { borderWidth: 2, borderColor: R.yazi }]}>
                    <Text style={{ fontSize: 14, fontWeight: d === today() ? "800" : "500", color: oran >= 1 ? "#fff" : R.yazi }}>{Number(d.slice(8))}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Seçili gün */}
        <View style={{ gap: 8 }}>
          <Text style={st.ara}>{gun === today() ? "Bugün" : gun.split("-").reverse().join(".")}</Text>
          {gunOturum.length === 0 && gunTeori.length === 0 ? (
            <Text style={{ color: R.soluk, fontSize: 15 }}>Bu gün kayıt yok.</Text>
          ) : (
            <>
              {gunOturum.map((s, i) => (
                <Satir key={`o${i}`} anahtar={s.exerciseId} sag={formatDuration(s.seconds)} />
              ))}
              {gunTeori.map(([k, s]) => (
                <Satir key={`t${k}`} anahtar={k} sag={`%${Math.round(s.best)}${s.passed ? " ✓" : ""}`} />
              ))}
            </>
          )}
        </View>

        <Liste baslik="Çalışmaya devam" renk={R.sari} kayitlar={devam} />
        <Liste baslik="Öğrendim" renk={R.yesil} kayitlar={ogrendim} />

        {/* Ayarlar */}
        <View style={[st.kutu, { gap: 10 }]}>
          <Text style={{ fontSize: 17, fontWeight: "700", color: R.yazi }}>Günlük hedef</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[5, 10, 15, 20, 30].map((dk) => (
              <Pressable key={dk} onPress={() => ayarYaz({ gunlukHedefDk: dk })} style={[st.cip, hedefDk === dk && { backgroundColor: R.yazi }]}>
                <Text style={{ color: hedefDk === dk ? "#fff" : R.yazi, fontWeight: "700" }}>{dk} dk</Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ fontSize: 17, fontWeight: "700", color: R.yazi, marginTop: 8 }}>Gitarlarım</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {gitarlar.map((g) => (
              <Pressable key={g} onLongPress={() => ayarYaz({ gitarlar: gitarlar.filter((x) => x !== g) })} style={st.cip} accessibilityHint="Silmek için basılı tut">
                <Text style={{ color: R.yazi, fontWeight: "600" }}>{g}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput value={yeniGitar} onChangeText={setYeniGitar} placeholder="Gitar ekle" placeholderTextColor="#AEAEB2" style={st.girdi} />
            <Pressable
              onPress={() => {
                const g = yeniGitar.trim();
                if (g && !gitarlar.includes(g)) ayarYaz({ gitarlar: [...gitarlar, g] });
                setYeniGitar("");
              }}
              style={[st.cip, { backgroundColor: R.mavi, borderColor: R.mavi }]}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Ekle</Text>
            </Pressable>
          </View>
          <Text style={{ color: R.soluk, fontSize: 12 }}>Silmek için gitarın üstüne basılı tut. İlerleme yalnız bu iPhone'da tutulur.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Ozet({ sayi, etiket }: { sayi: string; etiket: string }) {
  return (
    <View style={st.ozetKutu}>
      <Text style={{ fontSize: 20, fontWeight: "800", color: R.yazi }} numberOfLines={1} adjustsFontSizeToFit>
        {sayi}
      </Text>
      <Text style={{ fontSize: 12, color: R.soluk, marginTop: 2 }}>{etiket}</Text>
    </View>
  );
}

function Satir({ anahtar, sag }: { anahtar: string; sag: string }) {
  const b = anahtarBilgi(anahtar);
  return (
    <Pressable onPress={() => ac(anahtar)} style={st.satir}>
      <View style={[st.simge, { backgroundColor: b.renk }]}>
        <Glif ad={b.glif} boyut={20} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: R.yazi }} numberOfLines={1}>
          {b.ad}
        </Text>
        <Text style={{ fontSize: 12, color: R.soluk }}>{b.ust}</Text>
      </View>
      <Text style={{ fontSize: 14, color: R.soluk, fontVariant: ["tabular-nums"] }}>{sag}</Text>
    </Pressable>
  );
}

function Liste({ baslik, renk, kayitlar }: { baslik: string; renk: string; kayitlar: [string, { gitar?: string }][] }) {
  if (!kayitlar.length) return null;
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: renk }} />
        <Text style={st.ara}>
          {baslik} · {kayitlar.length}
        </Text>
      </View>
      {kayitlar.map(([k, v]) => (
        <Satir key={k} anahtar={k} sag={v.gitar ?? ""} />
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  sayfaBaslik: { fontSize: 32, fontWeight: "800", color: R.yazi, letterSpacing: -0.6 },
  ozet: { flexDirection: "row", gap: 10 },
  ozetKutu: { flex: 1, backgroundColor: R.panel, borderRadius: 16, padding: 12 },
  kutu: { backgroundColor: R.panel, borderRadius: 18, padding: 14 },
  ayUst: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingHorizontal: 4 },
  ayAd: { fontSize: 17, fontWeight: "700", color: R.yazi },
  ok: { fontSize: 28, color: R.mavi, paddingHorizontal: 8 },
  izgara: { flexDirection: "row", flexWrap: "wrap" },
  gunAd: { width: `${100 / 7}%`, textAlign: "center", fontSize: 12, color: R.soluk, fontWeight: "600", marginBottom: 4 },
  hucre: { width: `${100 / 7}%`, aspectRatio: 1, padding: 3 },
  gun: { flex: 1, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  ara: { fontSize: 13, fontWeight: "700", color: R.soluk, textTransform: "uppercase", letterSpacing: 0.6 },
  satir: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: R.panel, borderRadius: 14, padding: 10 },
  simge: { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  cip: { backgroundColor: R.zemin, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: R.cizgi },
  girdi: { flex: 1, backgroundColor: R.zemin, borderRadius: 12, paddingHorizontal: 12, fontSize: 15, color: R.yazi, borderWidth: StyleSheet.hairlineWidth, borderColor: R.cizgi },
});
