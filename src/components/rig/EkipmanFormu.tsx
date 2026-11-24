"use client";

// Kendi ekipmanını ekleme / düzenleme: ad, tür (çizim), renk ve isteğe bağlı fotoğraf (yalnız bu bilgisayarda, IndexedDB).
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, X } from "lucide-react";
import EkipmanCizimi from "./Cizimler";
import { CIZIMLER, CIZIM_LISTESI, KATEGORILER, yeniId, type Cizim, type Ekipman } from "@/lib/rig-cekirdek";
import { fotoKaydet, fotoSil, useFotoUrl } from "@/lib/rig";

const RENKLER = ["#1d1c1f", "#f2efe6", "#b5452a", "#c23a4c", "#e07a1f", "#e8b51e", "#2e9a57", "#3fb6c9", "#1f8fd6", "#2c4a8f", "#7e5bd6", "#c98b4a", "#3a3c42", "#c9ccd2"];

export default function EkipmanFormu({ ilk, onKaydet, onSil, onKapat }: { ilk: Ekipman | null; onKaydet: (e: Ekipman) => void; onSil?: (e: Ekipman) => void; onKapat: () => void }) {
  const [ad, setAd] = useState(ilk?.ad ?? "");
  const [cizim, setCizim] = useState<Cizim>(ilk?.cizim ?? "overdrive");
  const [renk, setRenk] = useState(ilk?.renk ?? "#2e9a57");
  const [benim, setBenim] = useState(ilk?.benim ?? true);
  const [fotoId, setFotoId] = useState(ilk?.fotoId);
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const yeniFotolar = useRef<string[]>([]);
  const dosya = useRef<HTMLInputElement>(null);
  const kutu = useRef<HTMLDivElement>(null);
  const fotoUrl = useFotoUrl(fotoId);

  useEffect(() => {
    const onceki = document.activeElement as HTMLElement | null;
    return () => onceki?.focus?.();
  }, []);

  const kapat = () => {
    // Kaydedilmeyen yeni fotoğraflar silinir
    yeniFotolar.current.forEach((f) => void fotoSil(f));
    onKapat();
  };

  const kaydet = () => {
    const e: Ekipman = { id: ilk?.id ?? yeniId("e"), ad: ad.trim() || CIZIMLER[cizim].ad, cizim, renk, ozel: true, ...(benim ? { benim: true } : {}), ...(fotoId ? { fotoId } : {}) };
    // Değiştirilen ya da kaldırılan eski fotoğraf ve kullanılmayan yeni yüklemeler silinir
    if (ilk?.fotoId && ilk.fotoId !== fotoId) void fotoSil(ilk.fotoId);
    yeniFotolar.current.filter((f) => f !== fotoId).forEach((f) => void fotoSil(f));
    yeniFotolar.current = [];
    onKaydet(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={kapat}>
      <div
        ref={kutu}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ekipman-formu-baslik"
        className="bg-elevated max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") kapat();
          // Odak iletişim kutusunda kalsın
          if (e.key === "Tab" && kutu.current) {
            const o = [...kutu.current.querySelectorAll<HTMLElement>("button, input, select, [tabindex]:not([tabindex='-1'])")].filter((x) => !x.hasAttribute("disabled"));
            if (!o.length) return;
            const hedef = e.shiftKey && document.activeElement === o[0] ? o[o.length - 1] : !e.shiftKey && document.activeElement === o[o.length - 1] ? o[0] : null;
            if (hedef) {
              e.preventDefault();
              hedef.focus();
            }
          }
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="ekipman-formu-baslik" className="text-[21px] font-semibold">
            {ilk ? "Ekipmanı düzenle" : "Kendi ekipmanını ekle"}
          </h2>
          <button type="button" onClick={kapat} aria-label="Kapat" className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-ink/10 hover:text-text">
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-[160px_1fr]">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-[180px] w-full items-end justify-center rounded-2xl bg-panel p-3">
              {fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoUrl} alt={`${ad || "Ekipman"} fotoğrafı`} className="max-h-full max-w-full rounded-lg object-contain" />
              ) : (
                <EkipmanCizimi cizim={cizim} renk={renk} className="max-h-full max-w-full" />
              )}
            </div>
            <input
              ref={dosya}
              type="file"
              accept="image/*"
              hidden
              onChange={async (ev) => {
                const f = ev.target.files?.[0];
                ev.target.value = "";
                if (!f) return;
                setHata(null);
                setYukleniyor(true);
                try {
                  const id = await fotoKaydet(f);
                  yeniFotolar.current.push(id);
                  setFotoId(id);
                } catch (e) {
                  setHata((e as Error).message);
                } finally {
                  setYukleniyor(false);
                }
              }}
            />
            <div className="flex flex-wrap justify-center gap-1.5">
              <button type="button" onClick={() => dosya.current?.click()} className="btn-secondary px-3 py-1 text-[13px]" disabled={yukleniyor}>
                <ImagePlus size={14} aria-hidden /> {fotoId ? "Değiştir" : "Fotoğraf"}
              </button>
              {fotoId && (
                <button type="button" onClick={() => setFotoId(undefined)} className="rounded-full px-3 py-1 text-[13px] text-bad hover:bg-bad/10">
                  Kaldır
                </button>
              )}
            </div>
            <p className="text-center text-[11px] leading-4 text-muted">Fotoğraf yalnız bu bilgisayarda saklanır.</p>
          </div>

          <div className="grid content-start gap-4">
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Ad</span>
              <input value={ad} onChange={(e) => setAd(e.target.value)} placeholder="ör. Benim overdrive'ım" maxLength={80} autoFocus className="h-10 rounded-xl border border-ink/10 bg-ink/[0.05] px-3 outline-none focus:border-accent" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Tür</span>
              <select value={cizim} onChange={(e) => setCizim(e.target.value as Cizim)} className="h-10 rounded-xl border border-ink/10 bg-ink/[0.05] px-3">
                {KATEGORILER.map((k) => (
                  <optgroup key={k.id} label={k.ad}>
                    {CIZIM_LISTESI.filter((c) => CIZIMLER[c].kategori === k.id).map((c) => (
                      <option key={c} value={c}>
                        {CIZIMLER[c].ad}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <fieldset className="grid gap-2 text-sm">
              <legend className="mb-1 font-semibold">Renk</legend>
              <div className="flex flex-wrap items-center gap-1.5">
                {RENKLER.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRenk(r)}
                    aria-label={`Renk ${r}`}
                    aria-pressed={renk === r}
                    className={`size-7 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)] transition ${renk === r ? "ring-2 ring-accent ring-offset-2 ring-offset-[var(--elevated)]" : ""}`}
                    style={{ background: r }}
                  />
                ))}
                <label className="ml-1 flex items-center gap-1.5 text-[13px] text-muted">
                  <input type="color" value={renk} onChange={(e) => setRenk(e.target.value)} className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0" aria-label="Özel renk" />
                  Özel
                </label>
              </div>
            </fieldset>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={benim} onChange={(e) => setBenim(e.target.checked)} className="size-4" />
              “Ekipmanım” listesinde göster
            </label>
            {hata && (
              <p role="alert" className="text-sm text-bad">
                {hata}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          {ilk && onSil ? (
            <button type="button" onClick={() => onSil(ilk)} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-bad hover:bg-bad/10">
              <Trash2 size={14} aria-hidden /> Ekipmanı sil
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={kapat} className="btn-secondary px-4 py-2 text-sm">
              Vazgeç
            </button>
            <button type="button" onClick={kaydet} className="btn-primary px-5 py-2 text-sm" disabled={yukleniyor}>
              {ilk ? "Kaydet" : "Ekle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
