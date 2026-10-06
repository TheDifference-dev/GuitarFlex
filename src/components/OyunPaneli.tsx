"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Flame, Shield, Trophy } from "lucide-react";
import { today, useProgress } from "@/lib/progress";
import { KADEMELER, METAL_IKON, dersKademesi, gorevler, gunler, kademeMetali, olculer, seri, type KursYapisi, type OyunVeri } from "@/lib/oyun";

const KATEGORI: Record<string, string> = {
  streak: "Seri",
  time: "Zaman",
  daily: "Günlük",
  milestone: "İlk adımlar",
  progress: "İlerleme",
  tier: "Madalya",
  social: "Topluluk",
  membership: "Üyelik",
  practice: "Pratik",
};
// Nadirlik: lacivert–beyaz–turuncu paletiyle kademeli vurgu
const NADIRLIK: Record<string, string> = {
  YAYGIN: "border-line text-muted",
  NADİR: "border-text/60 text-text",
  EPİK: "border-accent/70 text-accent",
  EFSANEVİ: "border-transparent bg-[image:var(--grad)] text-white",
};

/** Profil: günlük görevler, seri ve seri kalkanı, ders madalyaları ve başarımlar */
export default function OyunPaneli({ oyun, kurslar }: { oyun: OyunVeri; kurslar: KursYapisi[] }) {
  const p = useProgress();
  const [kat, setKat] = useState("");
  const kural = oyun.gorevler;
  const bugun = gorevler(gunler(p).get(today()), kural);
  const s = seri(p, kural);
  const olcu = useMemo(() => olculer(p, kurslar, kural), [p, kurslar, kural]);
  const kazanilan = oyun.basarimlar.filter((b) => (olcu[b.olcu] ?? 0) >= b.esik);
  const xp = kazanilan.reduce((n, b) => n + b.xp, 0);
  const metalSayi = Object.fromEntries(["Bronz", "Gümüş", "Altın", "Platin", "Elmas", "Usta"].map((m) => [m, 0]));
  for (const c of kurslar)
    for (const [k, h] of Object.entries(c.hedef)) {
      const m = kademeMetali(dersKademesi(p.exercises[k]?.totalSeconds ?? 0, h));
      if (m) metalSayi[m]++;
    }
  const kategoriler = [...new Set(oyun.basarimlar.map((b) => b.kategori))];
  const liste = oyun.basarimlar.filter((b) => !kat || b.kategori === kat);
  const tamamSayi = bugun.filter((g) => g.tamam).length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kutu ikon={<Flame size={18} className="text-accent" />} etiket="Seri" deger={`${s.seri} gün`} not={`Rekor: ${s.rekor} gün`} />
        <Kutu ikon={<Shield size={18} className="text-accent" />} etiket="Seri Kalkanı" deger={`${s.kalkan} / ${kural.kalkanMaks}`} not={s.kullanilan ? `${s.kullanilan} kez seriyi korudu` : `Üç görevi ${kural.kalkanGun} günde tamamla`} />
        <Kutu ikon={<Check size={18} className="text-emerald-400" />} etiket="Bugünkü görevler" deger={`${tamamSayi} / ${bugun.length}`} not={s.bugunTamam ? "Seri bugün korundu" : "Seri için en az 1 görev"} />
        <Kutu ikon={<Trophy size={18} className="text-accent" />} etiket="Başarım puanı" deger={`${xp} XP`} not={`${kazanilan.length} / ${oyun.basarimlar.length} başarım`} />
      </div>

      <section className="card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">Günlük görevler</h2>
          {!s.bugunTamam ? <p className="text-sm text-accent">Serini korumak için bugün en az 1 görevi tamamla!</p> : null}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {bugun.map((g) => (
            <Link key={g.ad} href={g.href} className={`rounded-2xl border p-4 transition hover:border-white/15 ${g.tamam ? "border-emerald-500/40" : "border-white/[0.08]"} bg-white/[0.04]`}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{g.ad}</p>
                {g.tamam ? <Check size={16} className="text-emerald-400" /> : <span className="text-xs text-muted">Bekliyor</span>}
              </div>
              <p className="mt-1 text-sm tabular-nums text-muted">
                {Math.min(g.deger, g.hedef)} / {g.hedef} {g.birim}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full ${g.tamam ? "bg-emerald-500" : "bar-grad"}`} style={{ width: `${Math.min(100, (g.deger / g.hedef) * 100)}%` }} />
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Egzersiz: derslerde çalma süresi · Teori: Ritim, Klavye, Kulak ya da Armoni yolunda bir adımı geç · Serbest Çalışma: Doğaçlama eşliklerinde çalma süresi.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Ders madalyaları</h2>
        <p className="mt-1 text-sm text-muted">
          Her ders, hedef süresi her dolduğunda bir kademe yükselir: hedefin 1 katı Bronz I, 5 katı Gümüş I, 9 katı Altın I, 13 katı Platin I, 17 katı Elmas I, 20 katı Elmas IV. Usta kademesi sınavla kazanılır.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {Object.entries(metalSayi).map(([m, n]) => (
            <div key={m} className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3 text-center">
              <p className="text-2xl">{METAL_IKON[m]}</p>
              <p className="text-sm font-semibold">{m}</p>
              <p className="text-xs tabular-nums text-muted">{n} ders</p>
            </div>
          ))}
        </div>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted hover:text-accent">Kademe sırası ({KADEMELER.length})</summary>
          <ol className="mt-2 flex flex-wrap gap-1.5">
            {KADEMELER.map((k, i) => (
              <li key={k} className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs">
                {i}. {k}
              </li>
            ))}
          </ol>
        </details>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="mr-2 font-semibold">Başarımlar</h2>
          {["", ...kategoriler].map((k) => (
            <button
              key={k || "hepsi"}
              type="button"
              onClick={() => setKat(k)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${kat === k ? "border-accent bg-accent/15 text-accent" : "border-white/10 bg-white/[0.05] hover:bg-white/10"}`}
            >
              {k ? (KATEGORI[k] ?? k) : "Tümü"}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {liste.map((b) => {
            const deger = olcu[b.olcu] ?? 0;
            const ok = deger >= b.esik;
            return (
              <div key={b.ad} className={`flex gap-3 card p-4 ${ok ? "border-accent/50" : "opacity-60"}`}>
                <span className={`text-2xl ${ok ? "" : "grayscale"}`}>{b.ikon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold leading-tight">{b.ad}</p>
                    <span className="shrink-0 text-xs font-semibold text-accent">+{b.xp} XP</span>
                  </div>
                  <p className="text-sm text-muted">{b.aciklama}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${NADIRLIK[b.nadirlik] ?? "border-line"}`}>{b.nadirlik}</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full ${ok ? "bg-emerald-500" : "bar-grad"}`} style={{ width: `${Math.min(100, (deger / b.esik) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] tabular-nums text-muted">
                      {Math.min(deger, b.esik)}/{b.esik}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Kutu({ ikon, etiket, deger, not }: { ikon: React.ReactNode; etiket: string; deger: string; not: string }) {
  return (
    <div className="card p-4">
      <p className="flex items-center gap-2 text-xs font-medium text-muted">
        {ikon} {etiket}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{deger}</p>
      <p className="mt-1 text-xs text-muted">{not}</p>
    </div>
  );
}
