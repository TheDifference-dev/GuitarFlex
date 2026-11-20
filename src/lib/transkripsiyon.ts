// Transkripsiyon ve kompozisyon dersleri için alphaTab score nesnesinden nota okuma (İP6d).
/* eslint-disable @typescript-eslint/no-explicit-any */
import { harfle, tonaGore, type Yazim } from "./yazim";

/** Birinci track'in çalınan sesleri sırayla (MIDI): sus, bağın devamı ve susturulmuş nota sayılmaz.
 *  Transkripsiyonun cevap anahtarı budur; tabdaki nota sırasıyla birebir aynıdır. */
export function notaDizisi(score: any): number[] {
  const out: number[] = [];
  for (const bar of score?.tracks?.[0]?.staves?.[0]?.bars ?? [])
    for (const beat of bar.voices?.[0]?.beats ?? []) {
      if (beat.isRest) continue;
      const ns = (beat.notes ?? []).filter((n: any) => !n.isTieDestination && !n.isDead).map((n: any) => n.realValue as number);
      out.push(...ns.sort((a: number, b: number) => a - b));
    }
  return out;
}

/** Cevap anahtarındaki seslerin dersin notasındaki yazımı (ses sınıfı → yazım): zorlanmış arıza ({acc forceflat}) ya da
 *  donanım. Öğrencinin girdiği notalar bu yazımla gösterilir (Yan Kayma dersinde La# değil Si♭); cümlede olmayan bir ses
 *  ilk ölçünün donanımına göre yazılır. */
export function yazimHaritasi(score: any): (midi: number) => Yazim {
  const bars = score?.tracks?.[0]?.staves?.[0]?.bars ?? [];
  const ks = Number(bars[0]?.masterBar?.keySignature ?? 0);
  const harita = new Map<number, Yazim>();
  for (const bar of bars)
    for (const beat of bar.voices?.[0]?.beats ?? [])
      for (const n of beat.notes ?? []) {
        if (n.isTieDestination || n.isDead) continue;
        const m = n.realValue as number;
        const p = ((m % 12) + 12) % 12;
        if (!harita.has(p)) harita.set(p, tonaGore(m, Number(bar.masterBar?.keySignature ?? ks), Number(n.accidentalMode ?? 0)));
      }
  return (midi) => {
    const y = harita.get(((midi % 12) + 12) % 12);
    return (y && harfle(y.harf, midi)) || tonaGore(midi, ks);
  };
}

export type Vurus = { t: number; boy: number; sesler: number[]; sus: boolean };
export type Olcu = { pay: number; payda: number; vuruslar: Vurus[]; toplam: number; olmali: number };

/** Birinci track'in ölçüleri: vuruşların ölçü içindeki yeri ve süresi (dörtlük cinsinden), sesler (bağ devamı dahil) */
export function olculer(score: any): Olcu[] {
  return (score?.tracks?.[0]?.staves?.[0]?.bars ?? []).map((bar: any) => {
    const mb = bar.masterBar;
    let t = 0;
    const vuruslar: Vurus[] = (bar.voices?.[0]?.beats ?? []).map((b: any) => {
      const nokta = b.dots === 2 ? 1.75 : b.dots === 1 ? 1.5 : 1;
      const ucleme = b.hasTuplet ? b.tupletDenominator / b.tupletNumerator : 1;
      const boy = (4 / b.duration) * nokta * ucleme;
      const v = { t, boy, sus: !!b.isRest, sesler: (b.notes ?? []).filter((n: any) => !n.isDead).map((n: any) => n.realValue as number) };
      t += boy;
      return v;
    });
    return { pay: mb.timeSignatureNumerator, payda: mb.timeSignatureDenominator, vuruslar, toplam: t, olmali: (mb.timeSignatureNumerator * 4) / mb.timeSignatureDenominator };
  });
}
