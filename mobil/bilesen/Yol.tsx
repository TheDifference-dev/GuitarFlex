// Duolingo tarzı yol: dikey, hafif kıvrılan bir hat üzerinde yuvarlak ders düğümleri; ünite (bölüm) başlık kartları.
// Kilit yok: bütün düğümler açık, sıra yalnız öneri. Önerilen düğüm (ilk tamamlanmamış) büyük ve "BAŞLA" balonlu.
// Düğüme dokununca altında ders kartı açılır (ad, süre, tempo, Başla düğmesi).
import { useMemo, useRef, useState, type ReactNode } from "react";
import { FlatList, Pressable, Text, View, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import Glif from "./Glif";
import { R, ton } from "~/lib/tema";

export type Dugum = {
  anahtar: string;
  baslik: string;
  alt?: string;
  glif: string;
  tamam: boolean;
  /** Yarıda (ör. çalışılmış ama süre dolmamış) */
  yarim?: boolean;
  /** Kontrol / sınav adımı: daha büyük, yıldızlı */
  kontrol?: boolean;
  /** Düğmenin yazısı (varsayılan: BAŞLA / TEKRAR) */
  dugme?: string;
  ac: () => void;
};
export type Unite = { anahtar: string; ust: string; baslik: string; alt?: string; renk: string; dugumler: Dugum[]; ek?: boolean };

type Satir =
  | { tip: "unite"; u: Unite; ui: number }
  | { tip: "ayrac"; anahtar: string; yazi: string }
  | { tip: "dugum"; d: Dugum; u: Unite; i: number; oneri: boolean };

// Kıvrım: 8 düğümde bir tam salınım (Duolingo'daki gibi yumuşak S)
const KIVRIM = [0, 0.55, 0.85, 0.55, 0, -0.55, -0.85, -0.55];
const CAP = 68;

export default function Yol({ uniteler, ust, alt }: { uniteler: Unite[]; ust?: ReactNode; alt?: ReactNode }) {
  const { width } = useWindowDimensions();
  const genlik = Math.min(width, 480) * 0.17;
  const [secili, setSecili] = useState<string | null>(null);
  const liste = useRef<FlatList<Satir>>(null);

  const satirlar = useMemo(() => {
    const s: Satir[] = [];
    let oneriVerildi = false;
    let ekBasladi = false;
    uniteler.forEach((u, ui) => {
      if (u.ek && !ekBasladi) {
        ekBasladi = true;
        s.push({ tip: "ayrac", anahtar: `ayrac-ek`, yazi: "Ek bölümler" });
      }
      s.push({ tip: "unite", u, ui });
      u.dugumler.forEach((d, i) => {
        const oneri = !oneriVerildi && !u.ek && !d.tamam;
        if (oneri) oneriVerildi = true;
        s.push({ tip: "dugum", d, u, i, oneri });
      });
    });
    return s;
  }, [uniteler]);

  const oneriIndeks = satirlar.findIndex((s) => s.tip === "dugum" && s.oneri);

  return (
    <FlatList
      ref={liste}
      data={satirlar}
      keyExtractor={(s) => (s.tip === "unite" ? `u-${s.u.anahtar}` : s.tip === "ayrac" ? s.anahtar : `d-${s.u.anahtar}-${s.d.anahtar}`)}
      ListHeaderComponent={ust ? <View>{ust}</View> : undefined}
      ListFooterComponent={<View style={{ paddingBottom: 48 }}>{alt}</View>}
      contentContainerStyle={{ paddingHorizontal: 16, maxWidth: 520, width: "100%", alignSelf: "center" }}
      initialNumToRender={40}
      windowSize={11}
      onScrollToIndexFailed={() => {}}
      extraData={secili}
      renderItem={({ item }) => {
        if (item.tip === "ayrac")
          return (
            <View style={st.ayrac}>
              <View style={st.ayracCizgi} />
              <Text style={st.ayracYazi}>{item.yazi}</Text>
              <View style={st.ayracCizgi} />
            </View>
          );
        if (item.tip === "unite") return <UniteKarti u={item.u} />;
        const { d, u, i, oneri } = item;
        const x = KIVRIM[i % KIVRIM.length] * genlik;
        const acik = secili === `${u.anahtar}/${d.anahtar}`;
        return (
          <View style={{ alignItems: "center", paddingVertical: 7 }}>
            <View style={{ transform: [{ translateX: x }], alignItems: "center" }}>
              {oneri && !acik && <Balon renk={u.renk} yazi={d.tamam ? "TEKRAR" : "BAŞLA"} />}
              <DugumDugmesi d={d} renk={u.renk} buyuk={oneri || d.kontrol} onPress={() => setSecili(acik ? null : `${u.anahtar}/${d.anahtar}`)} />
            </View>
            {acik && <DersKarti d={d} renk={u.renk} kapat={() => setSecili(null)} />}
          </View>
        );
      }}
      // Önerilen düğüme kaydır (ilk açılışta)
      onLayout={() => {
        if (oneriIndeks > 6) setTimeout(() => liste.current?.scrollToIndex({ index: oneriIndeks, viewPosition: 0.4, animated: false }), 50);
      }}
    />
  );
}

function UniteKarti({ u }: { u: Unite }) {
  const tamam = u.dugumler.filter((d) => d.tamam).length;
  return (
    <View style={[st.unite, { backgroundColor: u.ek ? R.panel : u.renk }]}>
      <View style={{ flex: 1 }}>
        <Text style={[st.uniteUst, { color: u.ek ? R.soluk : "rgba(255,255,255,0.8)" }]}>{u.ust}</Text>
        <Text style={[st.uniteBaslik, { color: u.ek ? R.yazi : "#fff" }]} numberOfLines={2}>
          {u.baslik}
        </Text>
        {u.alt ? (
          <Text style={{ color: u.ek ? R.soluk : "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 }} numberOfLines={1}>
            {u.alt}
          </Text>
        ) : null}
      </View>
      <View style={[st.uniteSayac, { backgroundColor: u.ek ? R.zemin : "rgba(255,255,255,0.2)" }]}>
        <Text style={{ color: u.ek ? R.yazi : "#fff", fontWeight: "700", fontSize: 13, fontVariant: ["tabular-nums"] }}>
          {tamam}/{u.dugumler.length}
        </Text>
      </View>
    </View>
  );
}

function DugumDugmesi({ d, renk, buyuk, onPress }: { d: Dugum; renk: string; buyuk?: boolean; onPress: () => void }) {
  const cap = buyuk ? CAP + 10 : CAP;
  // Tamamlanan: dolu kurs rengi + onay · yarıda: açık ton + glif · hiç: beyaz + renkli çerçeve ve glif
  const dolu = d.tamam ? renk : d.yarim ? ton(renk, 0.78) : R.zemin;
  const golge = d.tamam ? ton(renk, -0.3) : d.yarim ? ton(renk, 0.55) : R.cizgi;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${d.baslik}${d.tamam ? ", tamamlandı" : ""}`} style={({ pressed }) => ({ transform: [{ translateY: pressed ? 4 : 0 }] })}>
      <View style={{ width: cap, height: cap + 6, borderRadius: cap / 2, backgroundColor: golge }}>
        <View
          style={{
            width: cap,
            height: cap,
            borderRadius: cap / 2,
            backgroundColor: dolu,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: d.tamam || d.yarim ? 0 : 3,
            borderColor: ton(renk, 0.55),
          }}
        >
          {d.tamam ? <Onay boyut={cap * 0.42} /> : <Glif ad={d.glif} boyut={cap * 0.46} renk={d.yarim ? ton(renk, -0.25) : renk} kalinlik={2} />}
          {d.kontrol && (
            <View style={[st.yildiz, { backgroundColor: R.sari }]}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>★</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function Onay({ boyut }: { boyut: number }) {
  return (
    <Svg width={boyut} height={boyut} viewBox="0 0 24 24">
      <Path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function Balon({ renk, yazi }: { renk: string; yazi: string }) {
  return (
    <View style={{ alignItems: "center", marginBottom: 6 }}>
      <View style={[st.balon, { borderColor: R.cizgi }]}>
        <Text style={{ color: renk, fontWeight: "800", fontSize: 13, letterSpacing: 0.6 }}>{yazi}</Text>
      </View>
      <View style={[st.balonUc, { borderTopColor: R.zemin }]} />
    </View>
  );
}

function DersKarti({ d, renk, kapat }: { d: Dugum; renk: string; kapat: () => void }) {
  return (
    <View style={[st.kart, { backgroundColor: renk }]}>
      <Text style={st.kartBaslik} numberOfLines={3}>
        {d.baslik}
      </Text>
      {d.alt ? <Text style={st.kartAlt}>{d.alt}</Text> : null}
      <Pressable
        onPress={() => {
          kapat();
          d.ac();
        }}
        style={({ pressed }) => [st.kartDugme, { opacity: pressed ? 0.85 : 1 }]}
        accessibilityRole="button"
      >
        <Text style={{ color: renk, fontWeight: "800", fontSize: 15, letterSpacing: 0.4 }}>{d.dugme ?? (d.tamam ? "TEKRAR ÇALIŞ" : "BAŞLA")}</Text>
      </Pressable>
    </View>
  );
}

const st = StyleSheet.create({
  unite: { flexDirection: "row", alignItems: "center", borderRadius: 18, padding: 16, marginTop: 18, marginBottom: 14, gap: 12 },
  uniteUst: { fontSize: 12, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  uniteBaslik: { fontSize: 19, fontWeight: "700", marginTop: 2, letterSpacing: -0.3 },
  uniteSayac: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  ayrac: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 28 },
  ayracCizgi: { flex: 1, height: 1, backgroundColor: R.cizgi },
  ayracYazi: { color: R.soluk, fontWeight: "700", fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase" },
  yildiz: { position: "absolute", top: -4, right: -4, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  balon: { backgroundColor: R.zemin, borderWidth: 2, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  balonUc: { width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 8, borderLeftColor: "transparent", borderRightColor: "transparent", marginTop: -1 },
  kart: { marginTop: 12, borderRadius: 18, padding: 16, width: "100%", maxWidth: 360 },
  kartBaslik: { color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: -0.2 },
  kartAlt: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 4 },
  kartDugme: { backgroundColor: "#fff", borderRadius: 14, paddingVertical: 13, alignItems: "center", marginTop: 14 },
});
