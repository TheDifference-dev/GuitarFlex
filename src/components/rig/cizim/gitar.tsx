// Gitar çizimleri: parlak cilalı gövde (kenara doğru koyulaşan, ortası aydınlık), cila yansıması, biyik (binding),
// gül ağacı klavye, perde telleri, işaretler, kafa ve akort makineleri, manyetikler, köprü. Kafa biçimi GuitarFlex'e
// özgüdür (düz tepe, pahlı köşeler); hiçbir markanın kafa biçimini ya da logosunu taklit etmez.
import type { Cizim } from "@/lib/rig-cekirdek";
import { Tanimlar, acik, aci, koyu, parlaklik, yuzey, type Ctx } from "./temel";

type P = { c: Ctx; r: string; v: number[]; etiket?: string };

export const GITAR_BOYUT: Partial<Record<Cizim, [number, number]>> = {
  "gitar-tek-kesik": [120, 322],
  "gitar-cift-kesik": [120, 322],
  "gitar-akustik": [130, 322],
  "bas-gitar": [120, 340],
};

/** Gövde boyası: ortası aydınlık, kenarları koyu (cilalı ahşap); cila yansıması ayrı çizilir */
function GovdeTanim({ u, r, akustik = false }: { u: string; r: string; akustik?: boolean }) {
  const koyuRenk = parlaklik(r) < 0.03;
  return (
    <>
      <radialGradient id={`${u}gb`} cx="0.45" cy="0.62" r="0.62">
        <stop offset="0" stopColor={akustik ? acik(r, 0.35) : koyuRenk ? acik(r, 0.08) : acik(r, 0.22)} />
        <stop offset="0.55" stopColor={r} />
        <stop offset="0.9" stopColor={koyu(r, 0.45)} />
        <stop offset="1" stopColor={koyu(r, 0.7)} />
      </radialGradient>
      <linearGradient id={`${u}cila`} x1="0" y1="0" x2="1" y2="0.25">
        <stop offset="0" stopColor="#fff" stopOpacity={0} />
        <stop offset="0.22" stopColor="#fff" stopOpacity={0} />
        <stop offset="0.27" stopColor="#fff" stopOpacity={koyuRenk ? 0.32 : 0.24} />
        <stop offset="0.31" stopColor="#fff" stopOpacity={0.04} />
        <stop offset="1" stopColor="#fff" stopOpacity={0} />
      </linearGradient>
      <linearGradient id={`${u}klavye`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#1c120c" />
        <stop offset="0.5" stopColor="#3b261a" />
        <stop offset="1" stopColor="#1c120c" />
      </linearGradient>
      <linearGradient id={`${u}kafa`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#0d0d0e" />
        <stop offset="0.35" stopColor="#3a3b3e" />
        <stop offset="1" stopColor="#0d0d0e" />
      </linearGradient>
    </>
  );
}

/** Sap ve kafa: GuitarFlex kafa biçimi, akort makineleri, perdeler, işaretler */
function Sap({ c, x, ust, alt, genislik = 15, teller = 6, blok = false, altin = false, kafaRenk }: { c: Ctx; x: number; ust: number; alt: number; genislik?: number; teller?: number; blok?: boolean; altin?: boolean; kafaRenk?: string }) {
  const { u, t } = c;
  const kafaY = ust - 56;
  const metal = altin ? `url(#${u}altinR)` : `url(#${u}kromR)`;
  const perdeler = Array.from({ length: 16 }, (_, i) => ust + (alt - ust) * (1 - Math.pow(0.945, i + 1)) * 1.75).filter((y) => y < alt - 3);
  const kafa = `M${x - 9} ${ust + 1} L${x - 14} ${kafaY + 14} L${x - 15} ${kafaY + 3} L${x - 11} ${kafaY - 2} H${x + 11} L${x + 15} ${kafaY + 3} L${x + 14} ${kafaY + 14} L${x + 9} ${ust + 1} Z`;
  const yan = teller === 4 ? 2 : 3;
  return (
    <g>
      <path d={kafa} fill={kafaRenk ?? `url(#${u}kafa)`} stroke="#000" strokeOpacity={0.6} strokeWidth={0.6} />
      <path d={`M${x - 10} ${kafaY - 1} H${x + 10}`} stroke="#fff" strokeOpacity={0.25} strokeWidth={0.6} />
      {t && (
        <text x={x} y={kafaY + 8} textAnchor="middle" fontSize={3.2} fontWeight={700} fontStyle="italic" fill={altin ? "#e7c870" : "#e9e9ea"} fontFamily='Georgia, "Times New Roman", serif'>
          GuitarFlex
        </text>
      )}
      {Array.from({ length: yan }, (_, i) =>
        [-1, 1].map((s) => {
          const y = kafaY + 15 + i * (yan === 2 ? 17 : 12);
          return (
            <g key={`${i}${s}`}>
              <rect x={s < 0 ? x - 21 : x + 13.5} y={y - 2.6} width={7.5} height={5.2} rx={1.6} fill={metal} stroke="#3b3e44" strokeWidth={0.3} />
              <rect x={s < 0 ? x - 24.5 : x + 20.5} y={y - 3.2} width={4} height={6.4} rx={1.4} fill={altin ? "#d7b35a" : "#d9dbe0"} stroke="#555" strokeWidth={0.3} />
              <circle cx={x + s * 7} cy={y} r={1.9} fill={metal} stroke="#3b3e44" strokeWidth={0.25} />
            </g>
          );
        }),
      )}
      {/* klavye */}
      <rect x={x - genislik / 2 - 0.9} y={ust} width={genislik + 1.8} height={alt - ust} fill={blok ? "#efe6cf" : "#5b3b24"} />
      <rect x={x - genislik / 2} y={ust} width={genislik} height={alt - ust} fill={`url(#${u}klavye)`} />
      <rect x={x - genislik / 2 - 0.8} y={ust - 2.4} width={genislik + 1.6} height={2.6} rx={0.6} fill="#efe8d8" />
      {perdeler.map((y, i) => {
        const once = perdeler[i - 1] ?? ust;
        const orta = (y + once) / 2;
        return (
          <g key={i}>
            <line x1={x - genislik / 2} x2={x + genislik / 2} y1={y + 0.35} y2={y + 0.35} stroke="#000" strokeOpacity={0.5} strokeWidth={0.5} />
            <line x1={x - genislik / 2} x2={x + genislik / 2} y1={y} y2={y} stroke="#d9dce1" strokeWidth={0.65} />
            {[2, 4, 6, 8, 14].includes(i) &&
              (blok ? <rect x={x - genislik * 0.34} y={orta - (y - once) * 0.3} width={genislik * 0.68} height={(y - once) * 0.6} fill="#f1ece0" opacity={0.92} /> : <circle cx={x} cy={orta} r={1.4} fill="#efe9da" />)}
            {i === 11 &&
              (blok ? <rect x={x - genislik * 0.34} y={orta - (y - once) * 0.3} width={genislik * 0.68} height={(y - once) * 0.6} fill="#f1ece0" opacity={0.92} /> : [-3.4, 3.4].map((dx) => <circle key={dx} cx={x + dx} cy={orta} r={1.2} fill="#efe9da" />))}
          </g>
        );
      })}
    </g>
  );
}

function Teller({ x, ust, alt, n = 6, ara = 2.2 }: { x: number; ust: number; alt: number; n?: number; ara?: number }) {
  const ofs = Array.from({ length: n }, (_, i) => i - (n - 1) / 2);
  return (
    <g>
      {ofs.map((i, j) => (
        <g key={i}>
          <line x1={x + i * (ara * 0.68) + 0.3} x2={x + i * ara + 0.3} y1={ust} y2={alt} stroke="#000" strokeOpacity={0.35} strokeWidth={0.4 + j * 0.07} />
          <line x1={x + i * (ara * 0.68)} x2={x + i * ara} y1={ust} y2={alt} stroke={j < n / 2 ? "#cfd2d6" : "#ecdfc0"} strokeOpacity={0.9} strokeWidth={0.35 + j * 0.08} />
        </g>
      ))}
    </g>
  );
}

function Humbucker({ c, x, y, altin = false }: { c: Ctx; x: number; y: number; altin?: boolean }) {
  return (
    <g>
      <rect x={x - 17.5} y={y - 8.5} width={35} height={17} rx={3} fill="#efe6cf" />
      <rect x={x - 17.5} y={y - 8.5} width={35} height={17} rx={3} fill="#000" opacity={0.12} />
      <rect x={x - 15} y={y - 6.5} width={30} height={13} rx={2} fill={altin ? `url(#${c.u}altin)` : `url(#${c.u}krom)`} />
      {[-1, 1].map((s) =>
        [0, 1, 2, 3, 4, 5].map((i) => (
          <g key={`${s}${i}`}>
            <circle cx={x - 11 + i * 4.4} cy={y + s * 3} r={1.05} fill={altin ? "#8a6624" : "#6a6e75"} />
            <circle cx={x - 11.3 + i * 4.4} cy={y + s * 3 - 0.3} r={0.4} fill="#fff" opacity={0.7} />
          </g>
        )),
      )}
      {[x - 16, x + 16].map((sx) => (
        <circle key={sx} cx={sx} cy={y} r={0.9} fill="#bdb8a8" />
      ))}
    </g>
  );
}

function TekBobin({ x, y, d = 0 }: { x: number; y: number; d?: number }) {
  return (
    <g transform={`rotate(${d} ${x} ${y})`}>
      <rect x={x - 14.5} y={y - 4.8} width={29} height={9.6} rx={4.8} fill="#f8f7f2" stroke="#bfbab0" strokeWidth={0.5} />
      <rect x={x - 13} y={y - 4} width={26} height={2.6} rx={1.3} fill="#fff" opacity={0.8} />
      {[0, 1, 2, 3, 4, 5].map((j) => (
        <circle key={j} cx={x - 10.5 + j * 4.2} cy={y} r={1.05} fill="#9aa0a8" />
      ))}
    </g>
  );
}

function Dugmeler({ c, yerler, v, altin }: { c: Ctx; yerler: [number, number, number][]; v: number[]; altin: boolean }) {
  return (
    <g>
      {yerler.map(([x, y, i], j) => (
        <g key={j}>
          <circle cx={x + 0.5} cy={y + 1} r={5} fill="#000" opacity={0.35} />
          <circle cx={x} cy={y} r={4.8} fill={altin ? `url(#${c.u}altinR)` : "#1c1c1e"} stroke="#000" strokeOpacity={0.5} strokeWidth={0.4} />
          <circle cx={x} cy={y} r={3.4} fill={altin ? "#c99f3e" : "#2c2c2f"} />
          <ellipse cx={x - 1.4} cy={y - 1.6} rx={1.6} ry={0.9} fill="#fff" opacity={0.55} />
          <line x1={x} y1={y} x2={x} y2={y - 3.8} stroke={altin ? "#3a2a10" : "#e9e9e9"} strokeWidth={0.8} transform={`rotate(${aci(v[i] ?? 5)} ${x} ${y})`} />
        </g>
      ))}
    </g>
  );
}

function TekKesik({ c, r, v }: P) {
  const { u } = c;
  const govde = "M53 160 C42 151 22 155 20 177 C18 196 30 208 26 224 C16 242 10 258 12 278 C15 302 37 314 60 314 C84 314 106 302 108 278 C110 260 104 244 96 228 C90 214 98 202 98 188 C98 172 92 160 84 160 C77 160 75 168 72 175 C70 166 64 160 53 160 Z";
  const altin = parlaklik(r) < 0.03;
  return (
    <g>
      <defs>
        <GovdeTanim u={u} r={r} />
      </defs>
      <Sap c={c} x={60} ust={64} alt={188} blok altin={altin} />
      <path d={govde} fill="#000" opacity={0.3} transform="translate(1.5 2.5)" />
      <path d={govde} fill="#efe6cf" transform="translate(60 234) scale(1.035) translate(-60 -234)" />
      <path d={govde} fill={`url(#${u}gb)`} filter={yuzey(c, "parlak")} />
      <path d={govde} fill={`url(#${u}cila)`} />
      <path d="M36 182 C34 200 40 210 36 224 C30 236 24 250 24 266" stroke="#fff" strokeOpacity={0.22} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      {/* koruma plakası (yükseltilmiş) */}
      <path d="M78 178 C88 182 92 196 88 214 C86 222 82 228 76 232 L74 196 Z" fill="#111" opacity={0.85} />
      <Humbucker c={c} x={60} y={202} altin={altin} />
      <Humbucker c={c} x={60} y={242} altin={altin} />
      {/* köprü ve kuyruk */}
      <rect x={44} y={259} width={32} height={5} rx={2} fill={altin ? `url(#${u}altin)` : `url(#${u}krom)`} />
      <rect x={42} y={276} width={36} height={6.5} rx={3} fill={altin ? `url(#${u}altin)` : `url(#${u}krom)`} />
      <Teller x={60} ust={kafaUstu(64)} alt={279} />
      <Dugmeler c={c} yerler={[[82, 262, 0], [92, 278, 1], [80, 288, 0], [90, 302, 1]]} v={v} altin={altin} />
      {/* seçici anahtar */}
      <circle cx={33} cy={186} r={3.6} fill={altin ? `url(#${u}altinR)` : `url(#${u}kromR)`} />
      <line x1={33} y1={186} x2={30} y2={179.5} stroke="#efe6cf" strokeWidth={1.8} strokeLinecap="round" />
      <circle cx={98} cy={292} r={2.6} fill="#1a1a1a" stroke="#888" strokeWidth={0.5} />
    </g>
  );
}
const kafaUstu = (ust: number) => ust - 52;

function CiftKesik({ c, r, v }: P) {
  const { u } = c;
  const govde = "M60 172 C50 172 46 160 40 150 C36 144 26 146 26 158 C26 176 34 190 30 206 C26 222 14 236 16 262 C18 292 40 310 60 310 C82 310 104 292 104 262 C106 236 94 222 90 206 C86 190 96 168 92 150 C90 140 80 140 78 150 C74 162 70 172 60 172 Z";
  return (
    <g>
      <defs>
        <GovdeTanim u={u} r={r} />
      </defs>
      <Sap c={c} x={60} ust={64} alt={188} kafaRenk="#c99a62" />
      <path d={govde} fill="#000" opacity={0.3} transform="translate(1.5 2.5)" />
      <path d={govde} fill={`url(#${u}gb)`} filter={yuzey(c, "parlak")} />
      <path d={govde} fill={`url(#${u}cila)`} />
      {/* koruma plakası */}
      <path d="M44 184 C40 200 46 214 40 230 C34 250 40 270 56 274 C70 278 80 268 84 256 C88 244 82 234 80 222 L76 184 Z" fill="#f3f1ea" stroke="#c9c5bb" strokeWidth={0.6} />
      <path d="M44 184 C40 200 46 214 40 230" stroke="#fff" strokeWidth={0.8} fill="none" opacity={0.8} />
      <TekBobin x={60} y={200} />
      <TekBobin x={60} y={223} />
      <TekBobin x={60} y={248} d={-8} />
      {/* tremolo köprü */}
      <rect x={43} y={268} width={34} height={13} rx={2} fill={`url(#${u}krom)`} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={45 + i * 5.2} y={270} width={4.2} height={7} rx={0.8} fill={`url(#${u}kromR)`} />
      ))}
      <Teller x={60} ust={kafaUstu(64)} alt={273} />
      <Dugmeler c={c} yerler={[[80, 258, 0], [86, 274, 1]]} v={v} altin={false} />
      <rect x={74} y={240} width={3} height={14} rx={1.5} fill="#2b2b2b" transform="rotate(-20 75 247)" />
      <path d="M78 270 L94 284" stroke={`url(#${u}kromY)`} strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}

function Akustik({ c, r, v }: P) {
  const { u, t } = c;
  const govde = "M65 150 C46 150 34 156 34 176 C34 194 44 202 40 214 C34 230 18 240 18 268 C18 298 40 314 65 314 C90 314 112 298 112 268 C112 240 96 230 90 214 C86 202 96 194 96 176 C96 156 84 150 65 150 Z";
  return (
    <g>
      <defs>
        <GovdeTanim u={u} r={r} akustik />
        {t && (
          <pattern id={`${u}lif`} width={3} height={40} patternUnits="userSpaceOnUse">
            <rect width={3} height={40} fill="none" />
            <line x1={1.2} x2={1.2} y1={0} y2={40} stroke="#6b4a24" strokeOpacity={0.14} strokeWidth={0.5} />
          </pattern>
        )}
      </defs>
      <Sap c={c} x={65} ust={64} alt={178} genislik={16} />
      <path d={govde} fill="#000" opacity={0.3} transform="translate(1.5 2.5)" />
      <path d={govde} fill="#3b2414" transform="translate(65 232) scale(1.035) translate(-65 -232)" />
      <path d={govde} fill="#efe6cf" transform="translate(65 232) scale(1.02) translate(-65 -232)" />
      <path d={govde} fill={`url(#${u}gb)`} filter={yuzey(c, "parlak")} />
      {t && <path d={govde} fill={`url(#${u}lif)`} />}
      <path d={govde} fill={`url(#${u}cila)`} />
      {/* ses deliği ve rozet */}
      <circle cx={65} cy={206} r={17} fill="none" stroke="#2b1a10" strokeWidth={3} />
      <circle cx={65} cy={206} r={17} fill="none" stroke="#efe6cf" strokeWidth={1} strokeDasharray="1.6 1.2" />
      <circle cx={65} cy={206} r={13.5} fill="#0c0806" />
      <path d="M58 200 Q65 196 72 200" stroke="#fff" strokeOpacity={0.06} strokeWidth={2} fill="none" />
      <path d="M80 216 C92 216 98 228 94 240 C90 248 80 246 78 238 Z" fill="#2a160c" opacity={0.85} />
      {/* köprü */}
      <path d="M44 266 Q65 262 86 266 V276 Q65 272 44 276 Z" fill="#24150c" />
      <rect x={52} y={267.5} width={26} height={2} rx={1} fill="#efe6cf" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={56 + i * 3.6} cy={273} r={0.9} fill="#efe6cf" />
      ))}
      <Teller x={65} ust={kafaUstu(64)} alt={270} ara={2.4} />
      <circle cx={104} cy={298} r={3} fill="#1a1a1a" opacity={0.6 + (v[0] ?? 5) / 40} />
    </g>
  );
}

function Bas({ c, r, v }: P) {
  const { u } = c;
  const govde = "M60 192 C50 192 46 176 38 166 C33 160 22 162 23 176 C24 196 34 210 30 226 C26 242 14 256 16 282 C18 312 40 330 60 330 C82 330 104 312 104 282 C106 256 92 242 90 226 C86 210 98 188 94 172 C92 164 82 164 80 172 C76 182 70 192 60 192 Z";
  return (
    <g>
      <defs>
        <GovdeTanim u={u} r={r} />
      </defs>
      <Sap c={c} x={60} ust={62} alt={210} genislik={13} teller={4} />
      <path d={govde} fill="#000" opacity={0.3} transform="translate(1.5 2.5)" />
      <path d={govde} fill={`url(#${u}gb)`} filter={yuzey(c, "parlak")} />
      <path d={govde} fill={`url(#${u}cila)`} />
      <path d="M44 202 C40 220 46 232 40 248 C36 262 38 282 52 288 L72 288 L78 202 Z" fill="#141416" stroke="#000" strokeWidth={0.6} />
      {[238, 268].map((y) => (
        <g key={y}>
          <rect x={46} y={y - 5} width={28} height={10} rx={3} fill="#101012" stroke="#000" />
          <rect x={47} y={y - 4} width={26} height={3} rx={1.5} fill="#fff" opacity={0.08} />
        </g>
      ))}
      <rect x={45} y={290} width={30} height={12} rx={1.6} fill={`url(#${u}krom)`} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={47.5 + i * 6.6} y={292} width={5} height={7} rx={0.8} fill={`url(#${u}kromR)`} />
      ))}
      <Teller x={60} ust={kafaUstu(62)} alt={296} n={4} ara={3} />
      <Dugmeler c={c} yerler={[[84, 286, 0], [88, 302, 1], [80, 316, 1]]} v={v} altin={false} />
    </g>
  );
}

export function GitarCizimi({ cizim, c, r, v, etiket }: P & { cizim: Cizim }) {
  const p = { c, r, v, etiket };
  return (
    <>
      <Tanimlar c={c} o={0.9} seed={cizim.length} />
      {cizim === "gitar-cift-kesik" ? <CiftKesik {...p} /> : cizim === "gitar-akustik" ? <Akustik {...p} /> : cizim === "bas-gitar" ? <Bas {...p} /> : <TekKesik {...p} />}
    </>
  );
}
