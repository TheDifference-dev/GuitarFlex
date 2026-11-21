import Svg, { Circle } from "react-native-svg";
import { View, Text } from "react-native";
import { R } from "~/lib/tema";

/** Günlük hedef halkası: oran 0–1 */
export default function HedefHalkasi({ oran, boyut = 34, renk = R.yesil, yazi }: { oran: number; boyut?: number; renk?: string; yazi?: string }) {
  const k = 4;
  const r = (boyut - k) / 2;
  const cevre = 2 * Math.PI * r;
  const o = Math.max(0, Math.min(1, oran));
  return (
    <View style={{ width: boyut, height: boyut, alignItems: "center", justifyContent: "center" }}>
      <Svg width={boyut} height={boyut} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={boyut / 2} cy={boyut / 2} r={r} stroke={R.bos} strokeWidth={k} fill="none" />
        <Circle cx={boyut / 2} cy={boyut / 2} r={r} stroke={renk} strokeWidth={k} fill="none" strokeLinecap="round" strokeDasharray={`${cevre * o} ${cevre}`} />
      </Svg>
      {yazi ? <Text style={{ fontSize: 10, fontWeight: "700", color: R.yazi }}>{yazi}</Text> : null}
    </View>
  );
}
