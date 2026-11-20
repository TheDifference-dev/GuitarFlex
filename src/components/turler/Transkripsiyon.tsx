"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Eye, RotateCcw, Undo2 } from "lucide-react";
import TabPlayer, { type TabSource } from "@/components/TabPlayer";
import SapSoru from "@/components/yol/SapSoru";
import { anahtar } from "@/lib/alistirma/sorular";
import { perdeSes } from "@/lib/alistirma/muzik";
import { notaDizisi, yazimHaritasi } from "@/lib/transkripsiyon";
import { yalinYazim, type Yazim } from "@/lib/yazim";

// Transkripsiyon (Spec §7.3b): tab ve nota gizli, oynatıcı yalnız ses çalar (tekrar, %50/%75 hız, döngü). Öğrenci
// notaları sapta sırayla girer; "Kontrol et" doğru nota ve doğru sıra sayısını gösterir; "Tabı göster" tabı açar.
// Cevap anahtarı oynatıcının yüklediği score'dan okunur (tabdaki nota sırası).

type Giris = { s: number; f: number; m: number };
type Sonuc = { sira: number; nota: number; durum: ("sira" | "var" | "yok")[] };

function karsilastir(giris: number[], cevap: number[]): Sonuc {
  const sira = giris.filter((m, i) => cevap[i] === m).length;
  // Sırası ne olursa olsun doğru nota: iki çoklu kümenin kesişimi
  const kalan = new Map<number, number>();
  for (const m of cevap) kalan.set(m, (kalan.get(m) ?? 0) + 1);
  let nota = 0;
  const durum: Sonuc["durum"] = giris.map((m, i) => (cevap[i] === m ? "sira" : "yok"));
  for (const [i, m] of giris.entries()) {
    if ((kalan.get(m) ?? 0) > 0) {
      kalan.set(m, kalan.get(m)! - 1);
      nota++;
      if (durum[i] !== "sira") durum[i] = "var";
    }
  }
  return { sira, nota, durum };
}

export default function Transkripsiyon({ tex, onPlayingChange }: { tex: string; onPlayingChange?: (playing: boolean) => void }) {
  const source = useMemo<TabSource>(() => ({ kind: "tex", tex }), [tex]);
  const [cevap, setCevap] = useState<number[] | null>(null);
  /** Nota adları dersin notasındaki yazımla (Si♭ ya da La#): score yüklenince kurulur */
  const [yaz, setYaz] = useState<(midi: number) => Yazim>(() => (m: number) => yalinYazim(m));
  const [giris, setGiris] = useState<Giris[]>([]);
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [acik, setAcik] = useState(false);

  const ekle = (s: number, f: number) => {
    setGiris((g) => [...g, { s, f, m: perdeSes(s, f) }]);
    setSonuc(null);
  };
  const etiketler: Record<string, string> = {};
  giris.forEach((g, i) => {
    const k = anahtar(g.s, g.f);
    etiketler[k] = etiketler[k] ? `${etiketler[k]}·${i + 1}` : String(i + 1);
  });
  const renk = { sira: "border-emerald-500/50 bg-emerald-500/15 text-emerald-300", var: "border-amber-400/50 bg-amber-400/10 text-amber-200", yok: "border-rose-500/50 bg-rose-500/10 text-rose-300" };

  return (
    <div className="space-y-4">
      <TabPlayer source={source} compact audioOnly={!acik} stave={acik ? "both" : undefined} initialLoop={false} onPlayingChange={onPlayingChange} onScore={(sc) => {
          setCevap(notaDizisi(sc));
          const y = yazimHaritasi(sc);
          setYaz(() => y);
        }} />

      <section className="card space-y-4 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">Duyduğun notaları sırayla sapta işaretle</h2>
          <p className="text-sm text-muted">{cevap ? `Cümlede ${cevap.length} nota var.` : "Ses yükleniyor…"} Aynı perde yüksekliği hangi telde olursa olsun doğrudur.</p>
        </div>
        <SapSoru sap={{ perde: [0, 15], noktalar: [] }} secili={giris.map((g) => anahtar(g.s, g.f))} etiketler={etiketler} onTik={ekle} />

        <div className="flex min-h-9 flex-wrap items-center gap-1.5" aria-label="Girilen notalar">
          {giris.length === 0 && <span className="text-sm text-muted">Henüz nota girmedin.</span>}
          {giris.map((g, i) => (
            <span key={i} className={`rounded-lg border px-2 py-1 text-sm font-semibold tabular-nums ${sonuc ? renk[sonuc.durum[i]] : "border-white/10 bg-white/[0.05]"}`} title={`${g.s}. tel ${g.f}. perde · ${yaz(g.m).en}`}>
              <span className="mr-1 text-xs opacity-60">{i + 1}</span>
              {yaz(g.m).tr}
              <sub className="ml-px text-[10px] opacity-60">{Math.floor(g.m / 12) - 1}</sub>
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-grad px-4 py-2 text-sm" disabled={!giris.length || !cevap} onClick={() => cevap && setSonuc(karsilastir(giris.map((g) => g.m), cevap))}>
            <CheckCircle2 size={16} /> Kontrol et
          </button>
          <button type="button" className="btn-soft px-3 py-2 text-sm" disabled={!giris.length} onClick={() => { setGiris((g) => g.slice(0, -1)); setSonuc(null); }}>
            <Undo2 size={15} /> Geri al
          </button>
          <button type="button" className="btn-soft px-3 py-2 text-sm" disabled={!giris.length} onClick={() => { setGiris([]); setSonuc(null); }}>
            <RotateCcw size={15} /> Temizle
          </button>
          <button type="button" className="btn-soft px-3 py-2 text-sm" onClick={() => setAcik((x) => !x)}>
            <Eye size={15} /> {acik ? "Tabı gizle" : "Tabı göster"}
          </button>
        </div>

        {sonuc && cevap && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" role="status">
            <p className="text-lg font-semibold">
              Doğru nota: <span className="text-grad">{sonuc.nota}/{cevap.length}</span> · Doğru sırada: <span className="text-grad">{sonuc.sira}/{cevap.length}</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              {sonuc.sira === cevap.length && giris.length === cevap.length
                ? "Hepsi doğru ve sırası doğru. Şimdi tabı açıp parmak yerlerini karşılaştır, sonra cümleyi eşlikle çal."
                : `Yeşil: doğru yerde · Sarı: cümlede var, sırası farklı · Kırmızı: cümlede yok.${giris.length !== cevap.length ? ` ${giris.length} nota girdin, cümlede ${cevap.length} nota var.` : ""} Yanlış bölümü %50 hızla tekrar dinle.`}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
