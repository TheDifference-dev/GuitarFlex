"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, CheckCircle2, Eye, Headphones, Undo2 } from "lucide-react";
import TabPlayer, { loadAlphaTab, type TabSource } from "@/components/TabPlayer";
import SapSoru from "@/components/yol/SapSoru";
import AkorSerisi from "./AkorSerisi";
import { eslikTex, gruplar, gucluVuruslar, olcuAkorlari, texGovde, texOlcuBirimi, type OlcuBirimi } from "@/lib/eslik";
import { akoraGore } from "@/lib/yazim";
import { olculer as olcuOku } from "@/lib/transkripsiyon";

// Kompozisyon (Spec §7.3b): akor yürüyüşü ve kurallar (ders metni) üstte; öğrenci alphaTex ya da sap girişiyle 8 ölçü
// yazar, "Dinle" eşlikle çalar. Geri bildirim: her ölçünün toplamı (V3 mantığı) ve güçlü vuruşlarda akor sesi oranı.
// "Arşivime kaydet" eseri Oynatıcı › Arşivim'e (ozel-kaynak/tablar/Kompozisyonlarım) yazar; olmazsa tarayıcıda saklar.

const SURELER = [1, 2, 4, 8, 16] as const;
const YEREL = "gf-kompozisyonlar";
type OlcuGeri = { no: number; akor: string; toplam: number; olmali: number; ilk: string; guclu: { ad: string; ok: boolean }[] };
type Geri = { hata?: string; olcuSay: number; olculer: OlcuGeri[]; gucluToplam: number; gucluAkor: number };

const surDort = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/0$/, ""));
/** Yazının içinde son geçen süre (:8 …); yoksa alphaTex varsayılanı dörtlük */
const sonSure = (s: string) => Number([...s.matchAll(/:(\d+)/g)].at(-1)?.[1] ?? 4);
/** Bir ölçülük sus (eşikle dinlerken eksik ölçüleri doldurur) */
const susOlcu = (ob: OlcuBirimi) => gruplar(ob).map((g) => `:${({ 1: 8, 2: 4, 3: 4, 4: 2, 6: 2, 8: 1 } as Record<number, number>)[g] ?? 8} r${g === 3 || g === 6 ? "{d}" : ""}`).join(" ");

type Props = { tex: string; chords: string[]; bpm: number; title: string; progressKey: string; onPlayingChange?: (playing: boolean) => void };

export default function Kompozisyon({ tex, chords, bpm, title, progressKey, onPlayingChange }: Props) {
  const ob = texOlcuBirimi(tex);
  const swing = /\\tf triplet-8th/.test(tex);
  const taslakAnahtar = `gf-kompozisyon-taslak:${progressKey}`;
  const [metin, setMetin] = useState("");
  const [yuklendi, setYuklendi] = useState(false);
  const [sure, setSure] = useState<(typeof SURELER)[number]>(8);
  const [noktali, setNoktali] = useState(false);
  const [geri, setGeri] = useState<Geri | null>(null);
  const [dinle, setDinle] = useState<TabSource | null>(null);
  const [ornek, setOrnek] = useState(false);
  const [mesaj, setMesaj] = useState<string | null>(null);

  // Taslak tarayıcıda saklanır (sayfadan çıkınca kaybolmasın)
  useEffect(() => {
    try {
      const t = window.localStorage.getItem(taslakAnahtar);
      if (t) setMetin(t); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {}
    setYuklendi(true);
  }, [taslakAnahtar]);
  useEffect(() => {
    if (!yuklendi) return;
    try {
      window.localStorage.setItem(taslakAnahtar, metin);
    } catch {}
  }, [metin, yuklendi, taslakAnahtar]);

  const ornekKaynak = useMemo<TabSource>(() => ({ kind: "tex", tex: eslikTex({ title, bpm, chords, melodi: texGovde(tex), ob, swing }) }), [tex, title, bpm, chords, ob[0], ob[1], swing]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Öğrencinin gövdesi: \tempo atılır, ölçü birimi ve swing dersten eklenir */
  const govde = (s: string) => {
    const g = texGovde(s.trim());
    const on = `${/\\ts \d+ \d+/.test(g) || (ob[0] === 4 && ob[1] === 4) ? "" : `\\ts ${ob[0]} ${ob[1]} `}${swing && !/\\tf/.test(g) ? "\\tf triplet-8th " : ""}`;
    return on + g;
  };
  /** 8 ölçüye tamamlanmış gövde (fazlası atılır) */
  const sekizOlcu = (s: string) => {
    const bars = govde(s).split("|").map((b) => b.trim()).filter((b, i, a) => b || i < a.length - 1);
    while (bars.length < chords.length) bars.push(susOlcu(ob));
    return bars.slice(0, chords.length).join(" | ");
  };
  const tamTex = (s: string) => eslikTex({ title: `${title} — kendi çözümüm`, bpm, chords, melodi: sekizOlcu(s), ob, swing });

  async function kontrol(): Promise<Geri> {
    const at = await loadAlphaTab();
    try {
      const imp = new at.importer.AlphaTexImporter();
      imp.initFromString(`\\tempo ${bpm} . ${govde(metin)}`, new at.Settings());
      const score = imp.readScore();
      const os = olcuOku(score);
      let gucluToplam = 0;
      let gucluAkor = 0;
      const olculer: OlcuGeri[] = os.slice(0, chords.length).map((o, i) => {
        const aa = olcuAkorlari(chords[i]);
        const akorAt = (t: number) => aa[Math.min(aa.length - 1, Math.floor((t / o.olmali) * aa.length))];
        const calan = (t: number) => o.vuruslar.find((v) => v.t <= t + 1e-9 && v.t + v.boy > t + 1e-9);
        const guclu = gucluVuruslar([o.pay, o.payda]).map((t) => {
          const v = calan(t);
          const a = akorAt(t);
          if (!v || v.sus || !v.sesler.length || !a) return { ad: "–", ok: false, sayilmaz: true };
          const m = v.sesler[0];
          const ok = a.sesler.includes(((m % 12) + 12) % 12);
          // Ses akora göre yazılır: F üstünde Si♭ (La# değil), A7 üstünde Do#
          const y = akoraGore(m, a);
          return { ad: `${y.tr} (${y.derece})`, ok, sayilmaz: false };
        });
        for (const g of guclu) if (!g.sayilmaz) { gucluToplam++; if (g.ok) gucluAkor++; }
        return { no: i + 1, akor: chords[i], toplam: o.toplam, olmali: o.olmali, ilk: guclu[0].ad, guclu };
      });
      return { olcuSay: os.length, olculer, gucluToplam, gucluAkor };
    } catch (e) {
      const d = (e as { diagnostics?: { message: string }[] }).diagnostics?.[0]?.message;
      return { hata: d ?? (e as Error).message, olcuSay: 0, olculer: [], gucluToplam: 0, gucluAkor: 0 };
    }
  }

  const ekle = (parca: string) => {
    setMetin((m) => {
      const t = m.trimEnd();
      const sureEki = parca === "|" || sonSure(t) === sure ? "" : `:${sure} `;
      const nokta = parca !== "|" && noktali ? "{d}" : "";
      return `${t}${t ? " " : ""}${sureEki}${parca}${nokta}`;
    });
    setGeri(null);
  };
  const geriAl = () =>
    setMetin((m) => {
      const ps = m.trim().split(/\s+/).slice(0, -1);
      if (/^:\d+$/.test(ps.at(-1) ?? "")) ps.pop();
      return ps.join(" ");
    });

  async function kaydet() {
    const tex2 = tamTex(metin);
    try {
      const r = await fetch("/api/arsiv", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ad: title, tex: tex2 }) });
      if (!r.ok) throw new Error(String(r.status));
      const { yol } = (await r.json()) as { yol: string };
      setMesaj(`Arşivim'e kaydedildi: ${yol}. Oynatıcı › Arşivim'den açabilirsin.`);
    } catch {
      try {
        const liste = JSON.parse(window.localStorage.getItem(YEREL) ?? "[]") as unknown[];
        liste.push({ ad: title, tarih: new Date().toISOString(), tex: tex2 });
        window.localStorage.setItem(YEREL, JSON.stringify(liste));
        setMesaj("Arşiv klasörüne yazılamadı; eser bu tarayıcıda yerel olarak kaydedildi.");
      } catch {
        setMesaj("Kaydedilemedi.");
      }
    }
  }

  const oran = geri && geri.gucluToplam ? Math.round((100 * geri.gucluAkor) / geri.gucluToplam) : 0;
  const dolu = geri ? geri.olculer.filter((o) => Math.abs(o.toplam - o.olmali) < 1e-6).length : 0;

  return (
    <div className="space-y-4">
      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">
          Akor yürüyüşü · {chords.length} ölçü · {ob[0]}/{ob[1]}
          {swing ? " · swing" : ""} · {bpm} BPM
        </h2>
        <AkorSerisi chords={chords} ob={ob} />
      </section>

      <section className="card space-y-4 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">Kendi 8 ölçün</h2>
          <p className="text-xs text-muted">
            alphaTex: <code className="rounded bg-line px-1">:8 5.3 7.3 :4 5.2</code> (perde.tel, tel 1 = ince Mi) · <code className="rounded bg-line px-1">r</code> sus ·{" "}
            <code className="rounded bg-line px-1">|</code> ölçü çizgisi · <code className="rounded bg-line px-1">{"{d}"}</code> noktalı
          </p>
        </div>
        <textarea
          value={metin}
          onChange={(e) => {
            setMetin(e.target.value);
            setGeri(null);
          }}
          rows={4}
          spellCheck={false}
          placeholder=":8 5.2 7.3 5.3 7.4 :4 5.3 r | :8 6.2 5.2 5.3 7.4 :4 5.3 r | …"
          aria-label="alphaTex"
          className="w-full rounded-2xl border border-ink/10 bg-[var(--sheet)] p-3 font-mono text-sm leading-relaxed"
        />
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">Sap girişi · süre</span>
            <div className="flex gap-0.5 rounded-full border border-ink/[0.08] bg-ink/[0.05] p-0.5">
              {SURELER.map((d) => (
                <button key={d} type="button" onClick={() => setSure(d)} className={`rounded-full px-3 py-1 transition ${sure === d ? "bg-seg text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`} title={`1/${d}`}>
                  {d === 1 ? "birlik" : d === 2 ? "ikilik" : d === 4 ? "dörtlük" : d === 8 ? "sekizlik" : "16'lık"}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setNoktali((x) => !x)} className={`rounded-full border px-3 py-1 ${noktali ? "border-accent/40 bg-accent/15 text-accent" : "border-ink/10 bg-ink/[0.04]"}`}>
              Noktalı
            </button>
            <button type="button" onClick={() => ekle("r")} className="btn-secondary px-3 py-1 text-sm">
              Sus
            </button>
            <button type="button" onClick={() => ekle("|")} className="btn-secondary px-3 py-1 text-sm">
              Ölçü sonu |
            </button>
            <button type="button" onClick={geriAl} disabled={!metin.trim()} className="btn-secondary px-3 py-1 text-sm">
              <Undo2 size={14} /> Geri al
            </button>
          </div>
          <SapSoru sap={{ perde: [0, 15], noktalar: [] }} onTik={(s, f) => ekle(`${f}.${s}`)} />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            disabled={!metin.trim()}
            onClick={async () => {
              const g = await kontrol();
              setGeri(g);
              if (!g.hata) setDinle({ kind: "tex", tex: tamTex(metin) });
            }}
          >
            <Headphones size={16} /> Dinle ve kontrol et
          </button>
          <button type="button" className="btn-secondary px-4 py-2 text-sm" disabled={!metin.trim()} onClick={async () => setGeri(await kontrol())}>
            <CheckCircle2 size={16} /> Yalnız kontrol et
          </button>
          <button type="button" className="btn-secondary px-4 py-2 text-sm" disabled={!metin.trim()} onClick={kaydet}>
            <Archive size={16} /> Arşivime kaydet
          </button>
        </div>
        {mesaj && (
          <p className="text-sm text-ok" role="status">
            {mesaj}
          </p>
        )}

        {geri?.hata && (
          <p className="rounded-2xl border border-bad/40 bg-bad/10 p-3 text-sm text-bad" role="alert">
            alphaTex okunamadı: {geri.hata}
          </p>
        )}
        {geri && !geri.hata && (
          <div className="space-y-3 rounded-2xl border border-ink/10 bg-ink/[0.03] p-4" role="status">
            <p className="text-lg font-semibold">
              Ölçü toplamı: <span className="text-accent">{dolu}/{chords.length} dolu</span> · Güçlü vuruşlarda akor sesi:{" "}
              <span className="text-accent">
                %{oran} ({geri.gucluAkor}/{geri.gucluToplam})
              </span>
            </p>
            {geri.olcuSay !== chords.length && (
              <p className="text-sm text-warn">
                {geri.olcuSay} ölçü yazdın; yürüyüş {chords.length} ölçü. {geri.olcuSay < chords.length ? "Eksik ölçüler dinlerken sus olarak çalınır." : "Fazla ölçüler çalınmaz."}
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm tabular-nums">
                <thead className="text-xs text-muted">
                  <tr>
                    <th className="py-1 pr-3 font-semibold">Ölçü</th>
                    <th className="py-1 pr-3 font-semibold">Akor</th>
                    <th className="py-1 pr-3 font-semibold">Toplam (dörtlük)</th>
                    <th className="py-1 font-semibold">Güçlü vuruşlar (ses ve derecesi)</th>
                  </tr>
                </thead>
                <tbody>
                  {geri.olculer.map((o) => {
                    const tam = Math.abs(o.toplam - o.olmali) < 1e-6;
                    return (
                      <tr key={o.no} className="border-t border-ink/[0.06]">
                        <td className="py-1.5 pr-3 font-semibold">{o.no}</td>
                        <td className="py-1.5 pr-3">{o.akor}</td>
                        <td className={`py-1.5 pr-3 ${tam ? "text-ok" : "text-bad"}`}>
                          {surDort(o.toplam)} / {surDort(o.olmali)} {tam ? "✓" : o.toplam < o.olmali ? "eksik" : "fazla"}
                        </td>
                        <td className="py-1.5">
                          {o.guclu.map((g, i) => (
                            <span key={i} className={`mr-2 ${g.ad === "–" ? "text-muted" : g.ok ? "text-ok" : "text-bad"}`}>
                              {g.ad}
                            </span>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted">Yeşil: akor sesi · Kırmızı: akor dışı (geçiş sesi olabilir; kuralları ders metninden kontrol et). Güçlü vuruşlar: {gucluVuruslar(ob).map((t) => (ob[1] === 8 ? t * 2 + 1 : t + 1)).join(", ")}. {ob[1] === 8 ? "sekizlik" : "vuruş"}.</p>
          </div>
        )}
        {dinle && <TabPlayer source={dinle} compact stave="both" mutedTracks={[]} initialLoop={false} onPlayingChange={onPlayingChange} />}
      </section>

      <section className="card space-y-3 p-5">
        <button type="button" onClick={() => setOrnek((x) => !x)} className="btn-secondary px-4 py-2 text-sm">
          <Eye size={16} /> {ornek ? "Örnek çözümü gizle" : "Örnek çözümü göster"}
        </button>
        {ornek && <TabPlayer source={ornekKaynak} compact stave="both" mutedTracks={[]} initialLoop={false} onPlayingChange={onPlayingChange} />}
      </section>
    </div>
  );
}
