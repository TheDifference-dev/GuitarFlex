// Akor diyagramı: "x 0 2 2 1 0" (kalın Mi → ince Mi) biçimindeki şekli çizer.

export default function AkorKutusu({ sekil, boyut = 120 }: { sekil: string; boyut?: number }) {
  const perdeler = sekil.split(" ").map((x) => (x === "x" ? null : Number(x)));
  const basili = perdeler.filter((f): f is number => f !== null && f > 0);
  const maks = Math.max(3, ...basili);
  const bas = maks > 4 ? Math.min(...basili) : 1;
  const satir = 4;
  const W = 100;
  const H = 120;
  const sol = 18;
  const ust = 22;
  const tg = (W - sol - 12) / 5;
  const pg = (H - ust - 10) / satir;
  const tx = (i: number) => sol + i * tg;
  // Aynı perdede birden çok tele basılıyorsa ve en kalın telden inceye kesintisizse barre çiz
  const barre = (bas > 1 || perdeler[5] === perdeler[0]) && basili.length ? Math.min(...basili) : null;
  const barreTeller = barre ? perdeler.map((f, i) => (f === barre ? i : -1)).filter((i) => i >= 0) : [];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={boyut} height={(boyut * H) / W} role="img" aria-label={`Akor diyagramı ${sekil}`}>
      {bas === 1 ? <rect x={tx(0)} y={ust - 3} width={tx(5) - tx(0)} height={4} className="fill-[var(--text)]" /> : (
        <text x={4} y={ust + pg / 2 + 4} className="fill-[var(--muted)] text-[10px]">{bas}</text>
      )}
      {Array.from({ length: satir + 1 }, (_, r) => (
        <line key={`r${r}`} x1={tx(0)} x2={tx(5)} y1={ust + r * pg} y2={ust + r * pg} className="stroke-[var(--muted)]" strokeWidth={1} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`s${i}`} x1={tx(i)} x2={tx(i)} y1={ust} y2={ust + satir * pg} className="stroke-[var(--text)]" strokeOpacity={0.7} strokeWidth={1} />
      ))}
      {barreTeller.length >= 3 && barre ? (
        <rect x={tx(barreTeller[0]) - 5} y={ust + (barre - bas + 0.5) * pg - 5} width={tx(barreTeller.at(-1)!) - tx(barreTeller[0]) + 10} height={10} rx={5} className="fill-[var(--accent)]" />
      ) : null}
      {perdeler.map((f, i) =>
        f === null ? (
          <text key={i} x={tx(i)} y={ust - 8} textAnchor="middle" className="fill-[var(--muted)] text-[10px]">✕</text>
        ) : f === 0 ? (
          <circle key={i} cx={tx(i)} cy={ust - 11} r={3.5} fill="none" className="stroke-[var(--text)]" strokeWidth={1.2} />
        ) : (
          <circle key={i} cx={tx(i)} cy={ust + (f - bas + 0.5) * pg} r={5.5} className="fill-[var(--accent)]" />
        ),
      )}
    </svg>
  );
}
