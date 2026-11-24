// Stüdyo çizimleri: DI kutusu, ses kartı, yazılım (dizüstü bilgisayarda amfi simülasyonu).
// Genel türlerin özgün çizimleridir; logo yok (kitaplık modelinde yalnız "GuitarFlex").
import type { ReactNode } from "react";
import type { Cizim } from "@/lib/rig-cekirdek";
import { Anahtar, BasDugme, Dugme, Jak, Led, Tanimlar, Vida, Yazi, acik, baskiRengi, koyu, kutup, yuzey, type Ctx } from "./temel";

type P = { c: Ctx; r: string; v: number[]; etiket?: string };

export const STUDYO_BOYUT: Partial<Record<Cizim, [number, number]>> = {
  di: [104, 124],
  "ses-karti": [184, 104],
  yazilim: [200, 138],
};

function Di({ c, r, v, etiket }: P) {
  const { u } = c;
  const baski = baskiRengi(r);
  return (
    <g style={{ color: baski }}>
      {/* üst kenarda giriş jakları, altta XLR çıkış */}
      {[24, 46].map((x) => (
        <rect key={x} x={x - 5} y={3} width={10} height={9} rx={1.5} fill={`url(#${u}krom)`} />
      ))}
      <rect x={66} y={2} width={22} height={11} rx={2} fill="#1a1b1e" />
      <rect x={30} y={118} width={44} height={7} rx={1.4} fill="#0a0a0b" opacity={0.45} />
      <rect x={8} y={10} width={88} height={104} rx={5} fill={r} filter={yuzey(c, "parlak")} />
      <rect x={8} y={10} width={88} height={104} rx={5} fill={`url(#${u}isik)`} />
      {!c.t && <rect x={8.5} y={10.5} width={87} height={103} rx={4.5} fill="none" stroke="#fff" strokeOpacity={0.25} />}
      {[14, 90].map((x) => [16, 108].map((y) => <Vida key={`${x}${y}`} c={c} x={x} y={y} r={1.6} d={x + y} />))}
      <Dugme c={c} x={52} y={42} r={11} v={v[0] ?? 5} tur="krom" isaret="SEVİYE" />
      {[30, 74].map((x, i) => (
        <g key={x}>
          <Anahtar c={c} x={x} y={70} r={2.6} ust={i === 0 ? c.on : (v[0] ?? 5) < 5} />
          {c.t && (
            <Yazi x={x} y={84} boy={3.2} renk={baski}>
              {i === 0 ? "TOPRAK" : "-20 dB"}
            </Yazi>
          )}
        </g>
      ))}
      <Led c={c} x={52} y={70} renk="#2fd158" r={2} />
      {c.t && (
        <Yazi x={52} y={100} boy={etiket ? 7 : 8} renk={baski} font="sans" kalin={800} ara={0.5}>
          {etiket ? etiket.toLocaleUpperCase("tr") : "DI"}
        </Yazi>
      )}
    </g>
  );
}

function SesKarti({ c, r, v }: P) {
  const { u, on } = c;
  const kazanc = v[0] ?? 5;
  const hale = !on ? "#3a3c40" : kazanc > 8 ? "#ff453a" : kazanc > 6.5 ? "#ffd60a" : "#30d158";
  const baski = baskiRengi(r);
  return (
    <g style={{ color: baski }}>
      <defs>
        <linearGradient id={`${u}sk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={acik(r, 0.18)} />
          <stop offset="0.55" stopColor={r} />
          <stop offset="1" stopColor={koyu(r, 0.25)} />
        </linearGradient>
      </defs>
      {/* gövdenin ön kenarı */}
      <rect x={8} y={20} width={168} height={74} rx={10} fill={koyu(r, 0.5)} />
      <rect x={8} y={14} width={168} height={74} rx={10} fill={`url(#${u}sk)`} filter={yuzey(c, "firca")} />
      {!c.t && <rect x={8.5} y={14.5} width={167} height={73} rx={9.5} fill="none" stroke="#fff" strokeOpacity={0.25} />}
      {/* birleşik giriş (XLR + jak) */}
      <circle cx={36} cy={51} r={16} fill="#0f1012" stroke="#000" />
      <circle cx={36} cy={51} r={13} fill="#222428" />
      <circle cx={36} cy={51} r={5} fill="#060708" stroke="#80858c" strokeWidth={0.7} />
      {[0, 1, 2].map((i) => {
        const [x, y] = kutup(36, 51, 8.8, i * 120);
        return <circle key={i} cx={x} cy={y} r={1.5} fill="#060708" />;
      })}
      <rect x={33} y={36} width={6} height={2.5} rx={1} fill="#80858c" />
      {/* kazanç: ışıklı hale */}
      <circle cx={74} cy={49} r={15} fill="none" stroke={hale} strokeWidth={2.6} opacity={on ? 1 : 0.5} />
      {on && <circle cx={74} cy={49} r={15} fill="none" stroke={hale} strokeWidth={7} opacity={0.22} />}
      <Dugme c={c} x={74} y={49} r={10.5} v={kazanc} tur="siyah" />
      {[104, 120].map((x, i) => (
        <g key={x}>
          <BasDugme c={c} x={x} y={46} w={10} h={9} renk="#1b1c1f" isik={i === 1 ? "#30d158" : undefined} />
          {c.t && (
            <Yazi x={x} y={60} boy={3} renk={baski}>
              {i ? "PARLAK" : "ENST."}
            </Yazi>
          )}
        </g>
      ))}
      {/* büyük çıkış düğmesi */}
      <Dugme c={c} x={150} y={48} r={17} v={v[1] ?? 5} tur="krom" />
      <Jak c={c} x={164} y={78} r={3.4} />
      <Led c={c} x={20} y={78} renk="#30d158" r={1.5} />
      {c.t && (
        <>
          <Yazi x={74} y={74} boy={3.4} renk={baski} ara={0.6}>
            KAZANÇ
          </Yazi>
          <Yazi x={150} y={76} boy={3.4} renk={baski} ara={0.6}>
            ÇIKIŞ
          </Yazi>
        </>
      )}
    </g>
  );
}

function Yazilim({ c, r }: P) {
  const { u, on } = c;
  const renkler = ["#2fb35a", "#e8741e", "#2f8bd6", "#7a2433"];
  const ekran: ReactNode = (
    <g opacity={on ? 1 : 0.3}>
      <rect x={30} y={15} width={140} height={86} fill={koyu(r, 0.55)} />
      <rect x={30} y={15} width={140} height={10} fill="#000" opacity={0.4} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={36 + i * 5.5} cy={20} r={1.5} fill={["#ff5f57", "#febc2e", "#28c840"][i]} />
      ))}
      {/* sahne: amfi */}
      <rect x={30} y={25} width={140} height={50} fill="#2b2420" />
      <rect x={30} y={62} width={140} height={13} fill="#1a1512" />
      <rect x={70} y={30} width={60} height={36} rx={2.5} fill="#151517" />
      <rect x={73} y={33} width={54} height={9} rx={1} fill="#c9a24e" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={79 + i * 10.5} cy={37.5} r={2.2} fill="#141414" />
      ))}
      <rect x={73} y={45} width={54} height={18} rx={1} fill="#262626" />
      <rect x={73} y={45} width={54} height={18} rx={1} fill={`url(#${u}isik)`} />
      {/* zincir şeridi */}
      <rect x={30} y={78} width={140} height={23} fill="#141518" />
      <line x1={36} x2={164} y1={89.5} y2={89.5} stroke="#8e8e93" strokeWidth={0.8} />
      {renkler.map((x, i) => (
        <rect key={x} x={44 + i * 30} y={82} width={16} height={15} rx={2.5} fill={x} />
      ))}
    </g>
  );
  return (
    <g>
      <rect x={24} y={9} width={152} height={98} rx={6} fill="#141517" />
      <rect x={24} y={9} width={152} height={98} rx={6} fill="none" stroke="#6b6f76" strokeWidth={0.6} />
      <rect x={30} y={15} width={140} height={86} fill="#050506" />
      {ekran}
      <rect x={30} y={15} width={140} height={86} fill={`url(#${u}cam)`} opacity={0.6} />
      {/* klavye gövdesi */}
      <path d="M8 110 H192 L184 124 Q182 128 176 128 H24 Q18 128 16 124 Z" fill={`url(#${u}krom)`} stroke="#5c6067" strokeWidth={0.6} />
      <rect x={82} y={110} width={36} height={4} rx={2} fill="#000" opacity={0.25} />
      <Led c={c} x={100} y={104} renk="#30d158" r={0.9} />
    </g>
  );
}

export function StudyoCizimi({ cizim, c, r, v, etiket }: P & { cizim: Cizim }) {
  const p = { c, r, v, etiket };
  const ic = cizim === "di" ? <Di {...p} /> : cizim === "ses-karti" ? <SesKarti {...p} /> : <Yazilim {...p} />;
  return (
    <>
      <Tanimlar c={c} o={(STUDYO_BOYUT[cizim]?.[0] ?? 100) / 110} seed={cizim.length * 3} />
      {ic}
    </>
  );
}
