"use client";

import type { ReactNode, RefObject } from "react";
import { X } from "lucide-react";
import Acilir from "./Acilir";
import type { OynaticiAyarlari } from "./ayarlar";

type Props = {
  ayarlar: OynaticiAyarlari;
  guncelle: (d: Partial<OynaticiAyarlari>) => void;
  /** Görünüm düğmeleri: yalnız ses ya da yalnız nota derslerinde kilitli */
  gorunum: OynaticiAyarlari["gorunum"];
  onGorunum: (v: OynaticiAyarlari["gorunum"]) => void;
  gorunumKilit?: string;
  /** Sap paneli bu derste kapalı (porte okuma, transkripsiyon) */
  sapKilit?: string;
  sayim: boolean;
  onSayim: (on: boolean) => void;
  onKapat: () => void;
  /** Paneli açan düğme (odak dönüşü, dış tıklama) */
  tetik: RefObject<HTMLElement | null>;
  /** Görüntülenen track'in akordu (kalından inceye) */
  akort?: string;
};

const KISAYOLLAR: [string, string][] = [
  ["Boşluk", "Çal / duraklat"],
  ["← →", "Önceki / sonraki ölçü"],
  ["L", "Döngü aç / kapa"],
  ["↑ ↓", "Hız ±%5"],
  ["M", "Metronom"],
  ["Shift + tık", "Ölçüden ölçüye aralık seç"],
  ["Esc", "Paneli kapat / seçimi kaldır / sayımı iptal et"],
];

function Satir({ baslik, children, not }: { baslik: string; children: ReactNode; not?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-muted">{baslik}</span>
        {not && <span className="text-[11px] text-muted/80">{not}</span>}
      </div>
      {children}
    </div>
  );
}

function Secim<T extends string>({ deger, secenekler, onSec, kilit }: { deger: T; secenekler: [T, string][]; onSec: (v: T) => void; kilit?: boolean }) {
  return (
    <div className={`flex gap-0.5 rounded-full border border-ink/[0.08] bg-ink/[0.05] p-0.5 text-sm ${kilit ? "opacity-50" : ""}`}>
      {secenekler.map(([v, ad]) => (
        <button
          key={v}
          type="button"
          disabled={kilit}
          onClick={() => onSec(v)}
          aria-pressed={deger === v}
          className={`flex-1 rounded-full px-3 py-1 transition ${deger === v ? "bg-seg text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`}
        >
          {ad}
        </button>
      ))}
    </div>
  );
}

function Anahtar({ acik, onDegis, ad, kilit }: { acik: boolean; onDegis: (v: boolean) => void; ad: string; kilit?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={acik}
      disabled={kilit}
      onClick={() => onDegis(!acik)}
      className="flex w-full items-center justify-between gap-3 rounded-xl px-1 py-1 text-sm transition hover:bg-ink/[0.04] disabled:opacity-50"
    >
      <span>{ad}</span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${acik ? "bar-fill" : "bg-ink/15"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${acik ? "left-[1.125rem]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function Sayi({ deger, onDegis, min, max, adim, ad }: { deger: number; onDegis: (v: number) => void; min: number; max: number; adim: number; ad: string }) {
  return (
    <label className="flex flex-1 flex-col gap-1 text-[11px] text-muted">
      {ad}
      <input
        type="number"
        min={min}
        max={max}
        step={adim}
        value={deger}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onDegis(Math.min(max, Math.max(min, v)));
        }}
        className="w-full rounded-lg border border-ink/10 bg-ink/[0.05] px-2 py-1 text-sm tabular-nums text-text"
      />
    </label>
  );
}

function Seviye({ ad, deger, onDegis }: { ad: string; deger: number; onDegis: (v: number) => void }) {
  const v = Number.isFinite(deger) ? deger : 100;
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="w-20 shrink-0">{ad}</span>
      <input type="range" min={0} max={150} step={5} value={v} onChange={(e) => onDegis(Number(e.target.value))} className="flex-1 accent-[var(--accent)]" aria-label={`${ad} sesi`} />
      <span className="w-11 text-right tabular-nums text-muted">%{v}</span>
    </label>
  );
}

/** Oynatıcının ayar paneli: görünüm, yerleşim, yakınlaştırma, imleç takibi, sap, metronom, ses seviyeleri, kademeli hız, ses bankası, akort, kısayollar. */
export default function AyarPaneli({ ayarlar, guncelle, gorunum, onGorunum, gorunumKilit, sapKilit, sayim, onSayim, onKapat, tetik, akort }: Props) {
  const r = ayarlar.rampa;
  return (
    <Acilir tetik={tetik} onKapat={onKapat} etiket="Oynatıcı ayarları" className="right-0 w-[min(24rem,calc(100vw-2rem))] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Ayarlar</h3>
        <button type="button" onClick={onKapat} className="rounded-full p-1 text-muted hover:bg-ink/10 hover:text-text" aria-label="Ayarları kapat">
          <X size={16} />
        </button>
      </div>
      {akort && (
        <p className="-mt-2 text-sm text-muted">
          Akort: <span className="font-mono text-text">{akort}</span>
        </p>
      )}

      <Satir baslik="Görünüm" not={gorunumKilit}>
        <Secim
          deger={gorunum}
          kilit={!!gorunumKilit}
          onSec={onGorunum}
          secenekler={[
            ["tab", "Tab"],
            ["score-tab", "Nota+Tab"],
            ["score", "Nota"],
          ]}
        />
      </Satir>

      <Satir baslik="Yerleşim">
        <Secim
          deger={ayarlar.yerlesim}
          onSec={(v) => guncelle({ yerlesim: v })}
          secenekler={[
            ["sayfa", "Sayfa"],
            ["yatay", "Yatay (tek satır)"],
          ]}
        />
      </Satir>

      <Satir baslik="Yakınlaştırma">
        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary h-8 w-8 text-base" onClick={() => guncelle({ zoom: Math.max(60, ayarlar.zoom - 10) })} aria-label="Uzaklaştır">
            −
          </button>
          <input
            type="range"
            min={60}
            max={160}
            step={10}
            value={ayarlar.zoom}
            onChange={(e) => guncelle({ zoom: Number(e.target.value) })}
            className="flex-1 accent-[var(--accent)]"
            aria-label="Yakınlaştırma"
          />
          <button type="button" className="btn-secondary h-8 w-8 text-base" onClick={() => guncelle({ zoom: Math.min(160, ayarlar.zoom + 10) })} aria-label="Yakınlaştır">
            +
          </button>
          <span className="w-11 text-right text-sm tabular-nums">%{ayarlar.zoom}</span>
        </div>
      </Satir>

      <div className="space-y-0.5 border-t border-ink/[0.07] pt-3">
        <Anahtar ad="İmleci takip et (sayfa kayar)" acik={ayarlar.imlecTakibi} onDegis={(v) => guncelle({ imlecTakibi: v })} />
        <Anahtar ad={sapKilit ? `Sap paneli (${sapKilit})` : "Sap paneli (çalan notalar, altta)"} acik={ayarlar.sap && !sapKilit} kilit={!!sapKilit} onDegis={(v) => guncelle({ sap: v })} />
        <Anahtar ad="Sayım (başlamadan bir ölçü say)" acik={sayim} onDegis={onSayim} />
      </div>

      <Satir baslik="Metronom">
        <Secim
          deger={ayarlar.metronomKipi}
          onSec={(v) => guncelle({ metronomKipi: v })}
          secenekler={[
            ["vurus", "Her vuruş"],
            ["olcu", "Yalnız ölçü başı"],
          ]}
        />
      </Satir>

      <Satir baslik="Ses seviyeleri" not="ana ses kontrol çubuğunda">
        <div className="space-y-1.5">
          <Seviye ad="Metronom" deger={ayarlar.metronomSesi} onDegis={(v) => guncelle({ metronomSesi: v })} />
          <Seviye ad="Sayım" deger={ayarlar.sayimSesi} onDegis={(v) => guncelle({ sayimSesi: v })} />
        </div>
      </Satir>

      <Satir baslik="Kademeli hızlanma" not="hız menüsünden aç · her döngü turunda">
        <div className="flex gap-2">
          <Sayi ad="Başla %" deger={r.baslangic} min={25} max={150} adim={5} onDegis={(v) => guncelle({ rampa: { ...r, baslangic: v } })} />
          <Sayi ad="Artış %" deger={r.adim} min={1} max={25} adim={1} onDegis={(v) => guncelle({ rampa: { ...r, adim: v } })} />
          <Sayi ad="Hedef %" deger={r.hedef} min={25} max={150} adim={5} onDegis={(v) => guncelle({ rampa: { ...r, hedef: v } })} />
        </div>
      </Satir>

      <Satir baslik="Ses bankası" not={ayarlar.sesBankasi === "generaluser" ? "~30 MB" : "1,3 MB"}>
        <Secim
          deger={ayarlar.sesBankasi}
          onSec={(v) => guncelle({ sesBankasi: v })}
          secenekler={[
            ["generaluser", "GeneralUser GS"],
            ["sonivox", "Sonivox (hafif)"],
          ]}
        />
      </Satir>

      <Satir baslik="Klavye kısayolları">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          {KISAYOLLAR.map(([k, a]) => (
            <div key={k} className="contents">
              <dt>
                <kbd className="rounded-md border border-ink/15 bg-ink/[0.06] px-1.5 py-0.5 font-mono text-[11px]">{k}</kbd>
              </dt>
              <dd className="text-muted">{a}</dd>
            </div>
          ))}
        </dl>
        <p className="pt-1 text-xs text-muted">Notaya tıklayarak oradan çal; sürükleyerek ya da Shift + tıkla ölçü aralığı seç (döngü açıksa seçili aralık tekrar eder).</p>
      </Satir>
    </Acilir>
  );
}
