"use client";

import Link from "next/link";
import { useMemo, useState, type KeyboardEvent } from "react";
import { CalendarCheck, Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  AY_ADLARI, GUN_ADLARI, GUN_KISA, KADEME_ESIKLERI_DK, TUR_ADI, defterIsle, gunEkle, gunHedefi, gunTarihi, gunToplami, gunlukToplamlar, gununOturumlari, gununPlanlari, haftaGunu,
  haftaOzeti, kademe, kisimYaz, planAyarla, plandanKaldir, sureYaz, yerelGun, type DefterVeri,
} from "@/lib/defter";
import { DurumIsareti, gitarAdi } from "./Parcalar";

/** Yoğunluk kademeleri: tek renk (vurgu) ve artan doygunluk; değer hücrede yazı olarak da durur (renk körlüğü) */
const KADEME_SINIFI = ["", "bg-accent/15", "bg-accent/30", "bg-accent/50", "bg-accent/70", "bg-accent text-accent-ink"];
const KADEME_ADI = ["Çalışma yok", ...KADEME_ESIKLERI_DK.map((e, i) => (i === KADEME_ESIKLERI_DK.length - 1 ? `${e}+ dk` : `${e}–${KADEME_ESIKLERI_DK[i + 1] - 1} dk`))];

const gunYazisi = (t: string) => {
  const d = gunTarihi(t);
  return `${d.getDate()} ${AY_ADLARI[d.getMonth()]} ${GUN_ADLARI[haftaGunu(d)]}`;
};
const dk = (sn: number) => Math.round(sn / 60);

/**
 * Çalışma takvimi: ay görünümü (günün toplam süresine göre beş kademe; "Takvime al" ile planlanan günlerde mavi
 * nokta), gün ayrıntısı (o güne planlananlar ve o günün oturumları) ve
 * haftalık plan (gün başına hedef dakika ve plan notu) ile hafta özeti. Tarihler bilgisayarın yerel saatine göredir.
 */
export default function DefterTakvim({ veri, ilerleme, varsayilanDk, bugun }: { veri: DefterVeri; ilerleme: Map<string, number>; varsayilanDk: number; bugun: string }) {
  const [ay, setAy] = useState(() => {
    const d = gunTarihi(bugun);
    return { y: d.getFullYear(), a: d.getMonth() };
  });
  const [secili, setSecili] = useState(bugun);
  const defter = useMemo(() => gunlukToplamlar(veri), [veri]);
  const planGunleri = useMemo(() => {
    const m = new Map<string, number>();
    for (const k of Object.values(veri.kayitlar)) for (const t of k.planli) m.set(t, (m.get(t) ?? 0) + 1);
    return m;
  }, [veri]);
  const toplamOf = (t: string) => gunToplami(defter.get(t), ilerleme.get(t) ?? 0);

  // Ayın ızgarası: pazartesiden başlayan haftalar
  const ilk = new Date(ay.y, ay.a, 1, 12);
  const bas = gunEkle(yerelGun(ilk), -haftaGunu(ilk));
  const gunSayisi = new Date(ay.y, ay.a + 1, 0).getDate();
  const hucre = Math.ceil((haftaGunu(ilk) + gunSayisi) / 7) * 7;
  const gunler = Array.from({ length: hucre }, (_, i) => gunEkle(bas, i));
  const ayaGit = (n: number) => setAy(({ y, a }) => ({ y: a + n < 0 ? y - 1 : a + n > 11 ? y + 1 : y, a: (a + n + 12) % 12 }));

  const sec = (t: string, odak = false) => {
    setSecili(t);
    const d = gunTarihi(t);
    if (d.getFullYear() !== ay.y || d.getMonth() !== ay.a) setAy({ y: d.getFullYear(), a: d.getMonth() });
    if (odak) requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-gun="${t}"]`)?.focus());
  };
  const tus = (e: KeyboardEvent) => {
    const adim: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (adim[e.key] !== undefined) {
      e.preventDefault();
      sec(gunEkle(secili, adim[e.key]), true);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const d = gunTarihi(secili);
      sec(gunEkle(secili, e.key === "Home" ? -haftaGunu(d) : 6 - haftaGunu(d)), true);
    }
  };

  const ozet = haftaOzeti(veri, ilerleme, gunTarihi(bugun), varsayilanDk);
  const oturumlar = gununOturumlari(veri, secili);
  const planlar = gununPlanlari(veri, secili);
  const seciliToplam = toplamOf(secili);
  const seciliDefter = defter.get(secili);
  const defterDisi = Math.max(0, (ilerleme.get(secili) ?? 0) - (seciliDefter?.olculen ?? 0));
  const seciliHedef = gunHedefi(veri, secili, varsayilanDk);
  const planNotu = veri.plan.notlar[haftaGunu(gunTarihi(secili))];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <section className="card p-5" aria-labelledby="takvim-baslik" id="takvim">
        <div className="flex items-center justify-between gap-2">
          <h2 id="takvim-baslik" className="text-lg font-semibold" aria-live="polite">
            {AY_ADLARI[ay.a]} {ay.y}
          </h2>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => ayaGit(-1)} className="flex size-8 items-center justify-center rounded-full hover:bg-ink/[0.08]" aria-label="Önceki ay" title="Önceki ay">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={() => sec(bugun)} className="rounded-full px-3 py-1 text-sm font-semibold text-[var(--link)] hover:bg-ink/[0.06]">
              Bugün
            </button>
            <button type="button" onClick={() => ayaGit(1)} className="flex size-8 items-center justify-center rounded-full hover:bg-ink/[0.08]" aria-label="Sonraki ay" title="Sonraki ay">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs text-muted" aria-hidden>
          {GUN_KISA.map((g) => (
            <span key={g}>{g}</span>
          ))}
        </div>
        <div className="mt-1.5 grid grid-cols-7 gap-1.5" role="group" aria-label={`${AY_ADLARI[ay.a]} ${ay.y} çalışma takvimi: ok tuşlarıyla günler arasında gez`} onKeyDown={tus}>
          {gunler.map((t) => {
            const d = gunTarihi(t);
            const buAy = d.getMonth() === ay.a;
            const sn = toplamOf(t);
            const k = kademe(sn);
            const h = gunHedefi(veri, t, varsayilanDk);
            const tamam = h > 0 && sn >= h;
            const plan = planGunleri.get(t) ?? 0;
            const etiket = `${gunYazisi(t)}: ${sn ? `${sureYaz(sn)} çalışma` : "çalışma yok"}${h ? `, hedef ${dk(h)} dk${tamam ? ", hedef tamam" : ""}` : ", dinlenme günü"}${plan ? `, ${plan} planlı` : ""}${t === bugun ? ", bugün" : ""}`;
            return (
              <button
                key={t}
                type="button"
                data-gun={t}
                tabIndex={t === secili ? 0 : -1}
                onClick={() => sec(t)}
                aria-label={etiket}
                aria-pressed={t === secili}
                aria-current={t === bugun ? "date" : undefined}
                title={etiket}
                className={`relative flex aspect-square min-h-11 flex-col items-center justify-center rounded-xl border text-sm tabular-nums transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                  k ? `${KADEME_SINIFI[k]} border-transparent` : "border-ink/[0.08] hover:bg-ink/[0.05]"
                } ${buAy ? "" : "opacity-45"} ${t === secili ? "ring-2 ring-text ring-offset-2 ring-offset-[var(--panel)]" : ""}`}
              >
                <span className={`leading-none ${t === bugun ? "flex size-6 items-center justify-center rounded-full bg-text font-semibold text-bg" : "font-medium"}`}>{d.getDate()}</span>
                {sn > 0 && <span className="mt-0.5 text-[10px] font-semibold leading-none">{dk(sn) || "<1"} dk</span>}
                {tamam && <Check size={11} strokeWidth={3} className="absolute right-1 top-1" aria-hidden />}
                {plan > 0 && <span className="absolute left-1.5 top-1.5 size-1.5 rounded-full bg-[#0a84ff] ring-1 ring-white/70" aria-hidden data-planli-gun />}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted" aria-label="Renk açıklaması">
          {KADEME_ADI.map((ad, i) => (
            <span key={ad} className="flex items-center gap-1.5">
              <span className={`size-3.5 rounded ${i ? KADEME_SINIFI[i] : "border border-ink/15"}`} aria-hidden />
              {ad}
            </span>
          ))}
          <span className="flex items-center gap-1">
            <Check size={12} strokeWidth={3} aria-hidden /> hedef tamam
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#0a84ff]" aria-hidden /> planlı (Takvime al)
          </span>
        </div>
      </section>

      <section className="card p-5" aria-live="polite" aria-labelledby="gun-baslik" data-gun-ayrintisi>
        <h2 id="gun-baslik" className="text-lg font-semibold">
          {gunYazisi(secili)}
          {secili === bugun && <span className="ml-2 rounded-full bg-ink/[0.07] px-2 py-0.5 align-middle text-xs font-semibold">Bugün</span>}
        </h2>
        <p className="mt-1 text-sm tabular-nums text-muted">
          {seciliToplam ? `${sureYaz(seciliToplam)} çalışma` : "Çalışma yok"}
          {seciliHedef ? ` · hedef ${dk(seciliHedef)} dk${seciliToplam >= seciliHedef ? " (tamam)" : ""}` : " · dinlenme günü"}
          {seciliDefter?.elle ? ` · ${sureYaz(seciliDefter.elle)} elle girildi` : ""}
        </p>
        {planNotu && (
          <p className="mt-2 rounded-xl bg-ink/[0.05] px-3 py-2 text-sm">
            <span className="font-semibold">Plan: </span>
            {planNotu}
          </p>
        )}
        {planlar.length > 0 && (
          <div className="mt-3" data-gun-planlari>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
              <CalendarCheck size={13} aria-hidden /> Bu güne planlı ({planlar.length})
            </p>
            <ul className="mt-1 divide-y divide-line/60">
              {planlar.map((k) => (
                <li key={k.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {k.href && !k.href.startsWith("http") ? (
                        <Link href={k.href} className="hover:text-[var(--link)]">
                          {k.baslik}
                        </Link>
                      ) : (
                        k.baslik
                      )}
                    </span>
                    <span className="block text-xs text-muted">
                      {TUR_ADI[k.tur]}
                      {k.altBaslik ? ` · ${k.altBaslik}` : ""}
                      {k.kisim ? ` · ${kisimYaz(k.kisim)}` : ""}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {k.durum && <DurumIsareti durum={k.durum} />}
                    <button type="button" onClick={() => defterIsle((v) => plandanKaldir(v, k.id, secili))} className="flex size-7 items-center justify-center rounded-full text-muted hover:bg-ink/[0.08] hover:text-text" aria-label={`${k.baslik}: bu günden kaldır`} title="Bu günün planından kaldır">
                      <X size={14} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {oturumlar.length ? (
          <ul className="mt-3 divide-y divide-line/60">
            {oturumlar.map((o, i) => (
              <li key={`${o.kayit.id}-${o.son ?? i}`} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {o.kayit.href && !o.kayit.href.startsWith("http") ? (
                      <Link href={o.kayit.href} className="hover:text-[var(--link)]">
                        {o.kayit.baslik}
                      </Link>
                    ) : (
                      o.kayit.baslik
                    )}
                  </span>
                  <span className="block text-xs text-muted">
                    {TUR_ADI[o.kayit.tur]}
                    {o.kayit.altBaslik ? ` · ${o.kayit.altBaslik}` : ""}
                    {o.kisim ? ` · ${kisimYaz(o.kisim)}` : ""} · {gitarAdi(veri, o.gitar)}
                    {o.tempo ? ` · ${o.tempo} BPM` : ""}
                    {o.saat !== undefined ? ` · ${String(o.saat).padStart(2, "0")}:00 civarı` : ""}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <DurumIsareti durum={o.kayit.durum} />
                  <span className="font-semibold tabular-nums">{sureYaz(o.sure)}</span>
                  {o.elle && <span className="rounded-full bg-ink/[0.07] px-1.5 py-0.5 text-[10px] text-muted">elle</span>}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">{planlar.length ? "Bu gün henüz oturum yok." : "Bu gün defterde oturum ya da plan yok."}</p>
        )}
        {defterDisi > 0 && (
          <p className="mt-3 text-xs text-muted">
            + {sureYaz(defterDisi)} defter dışında ölçülen çalışma (deftere işaretlenmemiş egzersiz ve şarkılar, sayaç, doğaçlama eşliği).
          </p>
        )}
      </section>

      <section className="card p-5 lg:col-span-2" id="plan" aria-labelledby="plan-baslik">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="plan-baslik" className="text-lg font-semibold">
            Haftalık plan ve hedef
          </h2>
          <p className="text-sm tabular-nums">
            Bu hafta <span className="font-semibold">{dk(ozet.toplam)}</span> / {dk(ozet.hedefToplam)} dk <span className="text-muted">(%{ozet.yuzde})</span> · Hedef serisi{" "}
            <span className="font-semibold">{ozet.seri} gün</span>
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-label="Haftalık hedef" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, ozet.yuzde)}>
          <div className={`h-full rounded-full ${ozet.yuzde >= 100 ? "bg-ok" : "bar-fill"}`} style={{ width: `${Math.min(100, ozet.yuzde)}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">
          Hedef boş bırakılan günlerde günlük hedef ({varsayilanDk} dk, Profil › Egzersiz görevi) geçerlidir; 0 dinlenme günüdür. Hedef serisi: hedefi tutturduğun art arda günler (dinlenme günleri seriyi bozmaz).
        </p>
        <ol className="mt-4 grid gap-2 md:grid-cols-7">
          {GUN_ADLARI.map((ad, i) => {
            const g = ozet.gunler[i];
            const bugunMu = g.tarih === bugun;
            return (
              <li key={ad} className={`rounded-2xl border p-3 ${bugunMu ? "border-[var(--accent)]" : "border-ink/[0.08]"} bg-ink/[0.03]`}>
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-sm font-semibold">{ad}</span>
                  {g.tamam && g.hedef > 0 && <Check size={14} className="text-ok" aria-label="hedef tamam" />}
                </div>
                <p className="text-xs tabular-nums text-muted">
                  {dk(g.sn)} / {dk(g.hedef)} dk
                </p>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink/10" aria-hidden>
                  <div className={`h-full ${g.tamam ? "bg-ok" : "bar-fill"}`} style={{ width: `${g.hedef ? Math.min(100, (g.sn / g.hedef) * 100) : 0}%` }} />
                </div>
                <label className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                  Hedef
                  <input
                    type="number"
                    min={0}
                    max={600}
                    step={5}
                    value={veri.plan.hedefDk[i] ?? ""}
                    placeholder={String(varsayilanDk)}
                    onChange={(e) => defterIsle((v) => planAyarla(v, i, { hedefDk: e.target.value === "" ? null : Number(e.target.value) }))}
                    className="w-14 rounded-lg border border-ink/10 bg-[var(--bg)] px-1.5 py-0.5 text-right text-sm tabular-nums text-text"
                    aria-label={`${ad} hedefi (dakika)`}
                  />
                  dk
                </label>
                <PlanNotu deger={veri.plan.notlar[i]} gun={ad} onKaydet={(n) => defterIsle((v) => planAyarla(v, i, { not: n }))} />
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function PlanNotu({ deger, gun, onKaydet }: { deger: string; gun: string; onKaydet: (n: string) => void }) {
  const [yazilan, setYazilan] = useState<string | null>(null);
  return (
    <textarea
      value={yazilan ?? deger}
      onChange={(e) => setYazilan(e.target.value)}
      onBlur={() => {
        if (yazilan !== null && yazilan !== deger) onKaydet(yazilan);
        setYazilan(null);
      }}
      rows={2}
      maxLength={200}
      placeholder="Plan (ör. sweep 4.1 + riff)"
      aria-label={`${gun} plan notu`}
      className="mt-2 w-full resize-none rounded-lg border border-ink/10 bg-[var(--bg)] px-2 py-1 text-xs text-text placeholder:text-muted"
    />
  );
}
