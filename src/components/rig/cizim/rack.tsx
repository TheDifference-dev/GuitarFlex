// Rack modülleri (2U, 19"): ön plaka (fırçalanmış alüminyum, eloksal siyah ya da boyalı), rack kulakları ve oval
// vida yuvaları, tutamaklar, VU göstergesi, LED merdiveni, ekranlar, kaydırıcılar, düğmeler. Özgün çizimlerdir.
import type { ReactNode } from "react";
import { CIZIMLER, type Cizim } from "@/lib/rig-cekirdek";
import { VuGostergesi } from "./amfi";
import { Anahtar, BasDugme, Dugme, Lamba, Led, Tanimlar, Vida, Yazi, acik, baskiRengi, etiketYaz, koyu, yuzey, type Ctx, type DugmeTur, type Yuzey } from "./temel";

type P = { c: Ctx; r: string; v: number[]; etiket?: string };

const W = 300;
const H = 64;
export const RACK_BOYUT: Partial<Record<Cizim, [number, number]>> = Object.fromEntries(
  (["rack-kompresor", "rack-limiter", "rack-eq", "rack-parametrik", "rack-delay", "rack-reverb", "rack-coklu"] as Cizim[]).map((k) => [k, [W, H] as [number, number]]),
);

/** Ön plaka: kulaklar, vidalar, isteğe bağlı tutamaklar; içerik x 24–276 arasına */
function Plaka({ c, r, yz, tutamak, etiket, tur, children }: { c: Ctx; r: string; yz: Yuzey; tutamak?: boolean; etiket?: string; tur: string; children: ReactNode }) {
  const { u } = c;
  const baski = baskiRengi(r);
  return (
    <g style={{ color: baski }}>
      <defs>
        <linearGradient id={`${u}rp`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={acik(r, 0.14)} />
          <stop offset="0.5" stopColor={r} />
          <stop offset="1" stopColor={koyu(r, 0.2)} />
        </linearGradient>
      </defs>
      {/* kasa gövdesi plakanın arkasından hafifçe görünür */}
      <rect x={14} y={H - 6} width={W - 28} height={4} fill="#0b0b0c" />
      <rect x={2} y={3} width={W - 4} height={H - 8} rx={1.6} fill={`url(#${u}rp)`} filter={yuzey(c, yz)} />
      {!c.t && <rect x={2.5} y={3.5} width={W - 5} height={H - 9} rx={1.4} fill="none" stroke="#fff" strokeOpacity={0.22} />}
      {/* kulak ayrımı */}
      {[15, W - 15].map((x) => (
        <g key={x}>
          <line x1={x} x2={x} y1={4} y2={H - 6} stroke="#000" strokeOpacity={0.3} strokeWidth={0.7} />
          <line x1={x + 0.7} x2={x + 0.7} y1={4} y2={H - 6} stroke="#fff" strokeOpacity={0.14} strokeWidth={0.5} />
        </g>
      ))}
      {[8.5, W - 8.5].map((x) =>
        [13, H - 15].map((y) => (
          <g key={`${x}${y}`}>
            <rect x={x - 4} y={y - 2.4} width={8} height={4.8} rx={2.4} fill="#050506" />
            <Vida c={c} x={x - 0.6} y={y} r={1.9} d={x + y} />
          </g>
        )),
      )}
      {tutamak &&
        [21, W - 21].map((x) => (
          <g key={x}>
            <rect x={x - 2.6 + 0.8} y={8 + 1.2} width={5.2} height={H - 20} rx={2.6} fill="#000" opacity={0.4} />
            <rect x={x - 2.6} y={8} width={5.2} height={H - 20} rx={2.6} fill={`url(#${u}kromY)`} stroke="#3d4147" strokeWidth={0.4} />
            <rect x={x - 1} y={10} width={1} height={H - 24} rx={0.5} fill="#fff" opacity={0.7} />
          </g>
        ))}
      {children}
      {/* model adı (kitaplık modeli) ya da tür */}
      {c.t && (
        <Yazi x={tutamak ? 30 : 22} y={H - 9.5} boy={3.4} renk={baski} hiza="start" ara={0.9} kalin={700} opaklik={0.85}>
          {etiket ? `GUITARFLEX · ${etiket.toLocaleUpperCase("tr")}` : tur}
        </Yazi>
      )}
    </g>
  );
}

const dugmeSirasi = (c: Ctx, adlar: string[], v: number[], x0: number, adim: number, y: number, r: number, tur: DugmeTur, renk?: string) =>
  adlar.map((a, i) => <Dugme key={a} c={c} x={x0 + i * adim} y={y} r={r} v={v[i] ?? 5} tur={tur} renk={renk} isaret={etiketYaz(a)} isaretBoy={Math.min(r * 0.4, (adim * 1.5) / Math.max(5, a.length))} />);

function GucAnahtari({ c, x }: { c: Ctx; x: number }) {
  return (
    <g>
      <Anahtar c={c} x={x} y={27} r={2.4} ust={c.on} />
      <Led c={c} x={x} y={42} renk="#ff2a1f" r={1.6} />
      {c.t && (
        <Yazi x={x} y={49} boy={2.6} renk="currentColor" ara={0.4}>
          GÜÇ
        </Yazi>
      )}
    </g>
  );
}

function Ekran({ c, x, y, w, h, renk = "#6fd3ff", children }: { c: Ctx; x: number; y: number; w: number; h: number; renk?: string; children?: ReactNode }) {
  return (
    <g>
      <rect x={x - 1.2} y={y - 1.2} width={w + 2.4} height={h + 2.4} rx={2} fill="#050506" />
      <rect x={x} y={y} width={w} height={h} rx={1.4} fill={c.on ? koyu(renk, 0.86) : "#0a0b0d"} />
      <g opacity={c.on ? 1 : 0.12}>{children}</g>
      <rect x={x} y={y} width={w} height={h} rx={1.4} fill={`url(#${c.u}cam)`} />
    </g>
  );
}

function LedMerdiveni({ c, x, y, n, dolu, w = 3, h = 2.2, ara = 3.2, yatay = true }: { c: Ctx; x: number; y: number; n: number; dolu: number; w?: number; h?: number; ara?: number; yatay?: boolean }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const renk = i >= n - 2 ? "#ff3b30" : i >= n - 5 ? "#ffcc00" : "#30d158";
        const yanik = c.on && i < dolu;
        return <rect key={i} x={yatay ? x + i * ara : x} y={yatay ? y : y - i * ara} width={w} height={h} rx={0.5} fill={yanik ? renk : koyu(renk, 0.72)} />;
      })}
    </g>
  );
}

export function RackCizimi({ cizim, c, r, v, etiket }: P & { cizim: Cizim }) {
  const adlar = CIZIMLER[cizim].dugmeler;
  const tur = CIZIMLER[cizim].ad.toLocaleUpperCase("tr");
  let ic: ReactNode;
  switch (cizim) {
    case "rack-kompresor":
      ic = (
        <Plaka c={c} r={r} yz="mat" tutamak etiket={etiket} tur={tur}>
          <VuGostergesi c={c} x={32} y={12} w={52} h={34} deger={1 - (v[0] ?? 5) / 14} />
          {dugmeSirasi(c, adlar, v, 104, 30, 30, 9.5, "siyah")}
          <Lamba c={c} x={252} y={22} r={3.2} renk="#ff9b1a" />
          <Anahtar c={c} x={252} y={40} r={2.4} ust={c.on} />
        </Plaka>
      );
      break;
    case "rack-limiter":
      ic = (
        <Plaka c={c} r={r} yz="firca" etiket={etiket} tur={tur}>
          <Ekran c={c} x={26} y={13} w={64} h={24} renk="#ff3b30">
            <Yazi x={58} y={30} boy={12} renk="#ff4a3a" font="mono">
              {`-${(((v[0] ?? 5) / 10) * 9).toFixed(1)}`}
            </Yazi>
          </Ekran>
          <LedMerdiveni c={c} x={27} y={42} n={16} dolu={Math.round(((10 - (v[0] ?? 5)) / 10) * 16)} ara={3.9} w={3.1} />
          {dugmeSirasi(c, adlar, v, 118, 34, 30, 9, "krom")}
          <BasDugme c={c} x={226} y={30} w={10} h={7} isik="#ffcc00" />
          {c.t && (
            <Yazi x={226} y={41} boy={2.6} renk="currentColor">
              BYPASS
            </Yazi>
          )}
          <GucAnahtari c={c} x={258} />
        </Plaka>
      );
      break;
    case "rack-eq": {
      const bantlar = Array.from({ length: 15 }, (_, i) => {
        const t = (i / 14) * 4;
        const a = Math.floor(t);
        const b = Math.min(4, a + 1);
        return (v[a] ?? 5) + ((v[b] ?? 5) - (v[a] ?? 5)) * (t - a);
      });
      const frek = ["25", "40", "63", "100", "160", "250", "400", "630", "1K", "1.6K", "2.5K", "4K", "6.3K", "10K", "16K"];
      ic = (
        <Plaka c={c} r={r} yz="firca" etiket={etiket} tur={tur}>
          {bantlar.map((x, i) => {
            const cx = 30 + i * 13;
            const y = 40 - (x / 10) * 26;
            return (
              <g key={i}>
                <rect x={cx - 1.1} y={10} width={2.2} height={34} rx={1.1} fill="#07080a" />
                <rect x={cx - 4.2} y={y - 2.6} width={8.4} height={5.2} rx={1} fill="#1b1c20" stroke="#000" strokeWidth={0.4} />
                <rect x={cx - 4.2} y={y - 2.6} width={8.4} height={2} rx={1} fill="#fff" opacity={0.12} />
                <line x1={cx - 3.4} x2={cx + 3.4} y1={y} y2={y} stroke={c.on ? "#ffd60a" : "#8a8a8a"} strokeWidth={0.8} />
                {c.t && (
                  <Yazi x={cx} y={49} boy={2.3} renk="currentColor" kalin={600}>
                    {frek[i]}
                  </Yazi>
                )}
              </g>
            );
          })}
          <Dugme c={c} x={240} y={28} r={8.5} v={v[4] ?? 5} tur="krom" isaret="ÇIKIŞ" />
          <GucAnahtari c={c} x={264} />
        </Plaka>
      );
      break;
    }
    case "rack-parametrik": {
      const renkler = ["#c8322b", "#2f9c5a", "#2c6fd1", "#8a8f97"];
      ic = (
        <Plaka c={c} r={r} yz="firca" tutamak etiket={etiket} tur={tur}>
          {[0, 1, 2, 3].map((i) => {
            const x = 44 + i * 40;
            return (
              <g key={i}>
                <Dugme c={c} x={x} y={24} r={8.5} v={v[i] ?? 5} tur="renkli" renk={renkler[i]} isaret={etiketYaz(adlar[i])} isaretBoy={2.8} />
                <Dugme c={c} x={x - 8} y={44} r={4.6} v={3 + i * 1.6} tur="siyah" />
                <BasDugme c={c} x={x + 8} y={44} w={6} h={4.4} isik={renkler[i]} />
              </g>
            );
          })}
          <Dugme c={c} x={210} y={28} r={8} v={v[4] ?? 5} tur="krom" isaret="GENİŞLİK" isaretBoy={2.8} />
          <Dugme c={c} x={240} y={28} r={9} v={v[5] ?? 5} tur="krom" isaret="ÇIKIŞ" isaretBoy={2.8} />
          <LedMerdiveni c={c} x={258} y={46} n={10} dolu={Math.round(((v[5] ?? 5) / 10) * 10)} w={4} h={2.2} ara={3.4} yatay={false} />
        </Plaka>
      );
      break;
    }
    case "rack-delay": {
      const ms = Math.round(40 + ((v[0] ?? 5) / 10) * 1960);
      ic = (
        <Plaka c={c} r={r} yz="firca" etiket={etiket} tur={tur}>
          <Ekran c={c} x={26} y={13} w={74} h={26} renk="#5ac8fa">
            <Yazi x={86} y={32} boy={14} renk="#7fdcff" font="mono" hiza="end">
              {ms}
            </Yazi>
            <Yazi x={96} y={34} boy={4} renk="#7fdcff" font="mono" hiza="end">
              ms
            </Yazi>
          </Ekran>
          {dugmeSirasi(c, adlar, v, 126, 32, 29, 9.5, "siyah")}
          <BasDugme c={c} x={222} y={29} w={14} h={10} renk="#2c2f35" isik="#5ac8fa" />
          {c.t && (
            <Yazi x={222} y={42} boy={2.6} renk="currentColor">
              TAP
            </Yazi>
          )}
          <GucAnahtari c={c} x={258} />
        </Plaka>
      );
      break;
    }
    case "rack-reverb": {
      const sure = 8 + ((v[0] ?? 5) / 10) * 52;
      const egri = Array.from({ length: 34 }, (_, i) => {
        const x = 30 + i * 2;
        const y = 40 - 22 * Math.exp(-(i * 2.2) / (sure * 0.45)) * (0.78 + 0.22 * Math.cos(i * 1.7));
        return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(" ");
      ic = (
        <Plaka c={c} r={r} yz="firca" tutamak etiket={etiket} tur={tur}>
          <Ekran c={c} x={30} y={12} w={70} h={32} renk="#ffb347">
            <path d={egri} fill="none" stroke="#ffc46b" strokeWidth={1.3} strokeLinejoin="round" />
            <line x1={30} x2={100} y1={40.5} y2={40.5} stroke="#ffc46b" strokeOpacity={0.35} strokeWidth={0.6} />
          </Ekran>
          {dugmeSirasi(c, adlar, v, 130, 36, 29, 10.5, "tavuk", "krem")}
          <Lamba c={c} x={246} y={24} r={3.2} renk="#ff9b1a" />
          <Anahtar c={c} x={246} y={42} r={2.3} ust={c.on} />
        </Plaka>
      );
      break;
    }
    default:
      ic = (
        <Plaka c={c} r={r} yz="mat" etiket={etiket} tur={tur}>
          <Ekran c={c} x={26} y={11} w={100} h={34} renk="#2f9bff">
            <Yazi x={31} y={22} boy={4} renk="#9fd6ff" font="mono" hiza="start">
              PROGRAM 07
            </Yazi>
            <Yazi x={31} y={36} boy={9} renk="#cfeaff" font="mono" hiza="start" kalin={700}>
              Crunch+Dly
            </Yazi>
            <rect x={31} y={40} width={90} height={2} fill="#9fd6ff" opacity={0.3} />
            <rect x={31} y={40} width={90 * ((v[1] ?? 5) / 10)} height={2} fill="#9fd6ff" />
          </Ekran>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <BasDugme key={i} c={c} x={140 + (i % 3) * 13} y={i < 3 ? 20 : 34} w={10} h={7} isik={i === 1 ? "#30d158" : undefined} />
          ))}
          <Dugme c={c} x={194} y={27} r={10} v={v[1] ?? 5} tur="krom" />
          {[0, 2, 3].map((i, j) => (
            <Dugme key={i} c={c} x={220 + j * 17} y={27} r={6} v={v[i] ?? 5} tur="siyah" isaret={etiketYaz(adlar[i])} isaretBoy={2.4} />
          ))}
          <Led c={c} x={274} y={44} renk="#2f9bff" r={1.5} />
        </Plaka>
      );
  }
  return (
    <>
      <Tanimlar c={c} o={1.25} seed={cizim.length * 5} />
      {ic}
    </>
  );
}
