"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { CircleCheck, Plus, Repeat } from "lucide-react";
import { GITAR_TURU_ADI, kisimYaz, type DefterVeri, type Durum } from "@/lib/defter";
import s from "./DurumDugmeleri.module.css";

/** Şarkılarda kısım önerileri (serbest metin de yazılabilir) */
export const KISIM_ONERILERI = ["Giriş", "Riff", "Kıta", "Nakarat", "Köprü", "Solo", "Bitiş"];

/**
 * İki durum düğmesi: sarı "Devam ediyorum" (döngü simgesi) ve yeşil "Öğrendim" (onay simgesi).
 * Basılı olan yeniden basılınca işaret kalkar. Kısım verilirse erişilebilir adda yazar ("Riff kısmı: çalışmaya devam").
 */
export function DurumDugmeleri({
  durum,
  onDurum,
  kisim,
  kompakt = false,
  ad,
}: {
  durum: Durum | null | undefined;
  onDurum: (d: Durum | null) => void;
  kisim?: string | null;
  kompakt?: boolean;
  /** Erişilebilir adlara eklenen öğe adı (listelerde: "Enter Sandman") */
  ad?: string;
}) {
  const on = kisim ? `${kisimYaz(kisim)}: ` : "";
  const son = ad ? ` (${ad})` : "";
  const boy = kompakt ? s.kompakt : s.normal;
  const simge = kompakt ? 13 : 15;
  return (
    <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label={`Çalışma durumu${son}`}>
      <button
        type="button"
        data-defter-durum="devam"
        aria-pressed={durum === "devam"}
        aria-label={`${on}çalışmaya devam${son}`}
        title={durum === "devam" ? "Çalışmaya devam ediyorsun (tıkla: işareti kaldır)" : `${on}çalışmaya devam ediyorum olarak işaretle`}
        onClick={() => onDurum(durum === "devam" ? null : "devam")}
        className={`${s.dugme} ${s.sari} ${boy}`}
      >
        <Repeat size={simge} className={s.simge} aria-hidden />
        Devam ediyorum
      </button>
      <button
        type="button"
        data-defter-durum="ogrendim"
        aria-pressed={durum === "ogrendim"}
        aria-label={`${on}öğrendim${son}`}
        title={durum === "ogrendim" ? "Öğrendin (tıkla: işareti kaldır)" : `${on}öğrendim olarak işaretle`}
        onClick={() => onDurum(durum === "ogrendim" ? null : "ogrendim")}
        className={`${s.dugme} ${s.yesil} ${boy}`}
      >
        <CircleCheck size={simge} className={s.simge} aria-hidden />
        Öğrendim
      </button>
    </div>
  );
}

/** Küçük durum işareti (salt okunur): takvim ve oturum listeleri */
export function DurumIsareti({ durum }: { durum: Durum | null }) {
  if (!durum) return <span className="text-xs text-muted">işaretsiz</span>;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${durum === "devam" ? s.isaretSari : s.isaretYesil}`}>
      {durum === "devam" ? <Repeat size={11} aria-hidden /> : <CircleCheck size={11} aria-hidden />}
      {durum === "devam" ? "Devam ediyor" : "Öğrendi"}
    </span>
  );
}

const alan = "rounded-full border border-ink/10 bg-ink/[0.05] text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)]";

/**
 * Kısım seçimi. Ders kısımları (A / A′ / B / C) verilirse açılır liste; yoksa önerili serbest metin (riff, solo, nakarat).
 */
export function KisimSecici({
  deger,
  onDegis,
  secenekler,
  kompakt = false,
  etiket = "Kısım",
}: {
  deger: string | null;
  onDegis: (k: string | null) => void;
  secenekler?: string[];
  kompakt?: boolean;
  etiket?: string;
}) {
  const id = useId();
  const [yazilan, setYazilan] = useState<string | null>(null);
  const boy = kompakt ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-sm";
  if (secenekler?.length)
    return (
      <select value={deger ?? ""} onChange={(e) => onDegis(e.target.value || null)} className={`${alan} ${boy}`} aria-label={etiket} title="Hangi kısmı çalışıyorsun">
        <option value="">Bütün parça</option>
        {secenekler.map((k) => (
          <option key={k} value={k}>
            {kisimYaz(k)}
          </option>
        ))}
      </select>
    );
  const gosterilen = yazilan ?? deger ?? "";
  const bitir = () => {
    if (yazilan === null) return;
    onDegis(yazilan.trim() || null);
    setYazilan(null);
  };
  return (
    <>
      <input
        value={gosterilen}
        onChange={(e) => setYazilan(e.target.value)}
        onBlur={bitir}
        onKeyDown={(e) => e.key === "Enter" && bitir()}
        list={`${id}-oneri`}
        placeholder="Kısım (riff, solo…)"
        aria-label={etiket}
        className={`${alan} ${boy} ${kompakt ? "w-36" : "w-40"} placeholder:text-muted`}
      />
      <datalist id={`${id}-oneri`}>
        {KISIM_ONERILERI.map((k) => (
          <option key={k} value={k} />
        ))}
      </datalist>
    </>
  );
}

/** Gitar seçimi (kullanıcının gitar listesi); liste boşsa gitar ekleme bağlantısı */
export function GitarSecici({ veri, deger, onDegis, kompakt = false }: { veri: DefterVeri; deger: string | null; onDegis: (g: string | null) => void; kompakt?: boolean }) {
  const boy = kompakt ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-sm";
  if (!veri.gitarlar.length)
    return (
      <Link href="/defter#gitarlar" className={`inline-flex items-center gap-1 rounded-full px-2.5 font-semibold text-[var(--link)] hover:bg-ink/[0.06] ${boy}`} title="Gitarlarını Çalışma Defteri'nde ekle">
        <Plus size={13} aria-hidden /> Gitar ekle
      </Link>
    );
  const vars = veri.gitarlar.find((g) => g.id === veri.varsayilanGitar);
  return (
    <select value={deger ?? ""} onChange={(e) => onDegis(e.target.value || null)} className={`${alan} ${boy} max-w-56`} aria-label="Gitar" title="Hangi gitarla çalışıyorsun">
      <option value="">{vars ? `${vars.ad} (varsayılan)` : "Gitar seç"}</option>
      {veri.gitarlar.map((g) => (
        <option key={g.id} value={g.id}>
          {g.ad}
          {g.tur ? ` · ${GITAR_TURU_ADI[g.tur]}` : ""}
        </option>
      ))}
    </select>
  );
}

/** Gitarın görünen adı (silinmiş gitar da gösterilir) */
export const gitarAdi = (veri: DefterVeri, id: string | null | undefined) => (id ? (veri.gitarlar.find((g) => g.id === id)?.ad ?? "Silinmiş gitar") : "Gitarsız");

/**
 * Elle süre: hızlı "+5 / +10 / +15 dk" düğmeleri ve dakika alanı. Uygulama dışında (Songsterr) çalınan şarkılar için.
 * Elle girilen süre yalnız defterde tutulur (günlük görevlere yazılmaz).
 */
export function SureEkle({ onEkle, kompakt = false, ad }: { onEkle: (saniye: number) => void; kompakt?: boolean; ad?: string }) {
  const [dk, setDk] = useState("");
  const boy = kompakt ? "h-7 px-2 text-xs" : "h-8 px-3 text-sm";
  const son = ad ? ` (${ad})` : "";
  const ekle = () => {
    const n = Number(dk.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return;
    onEkle(Math.round(Math.min(600, n) * 60));
    setDk("");
  };
  return (
    <div className="flex flex-wrap items-center gap-1" role="group" aria-label={`Elle süre ekle${son}`}>
      {[5, 10, 15].map((m) => (
        <button key={m} type="button" onClick={() => onEkle(m * 60)} className={`rounded-full border border-ink/10 bg-ink/[0.04] font-semibold tabular-nums hover:bg-ink/10 ${boy}`} aria-label={`${m} dakika ekle${son}`}>
          +{m} dk
        </button>
      ))}
      <form
        className="flex items-center gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          ekle();
        }}
      >
        <input
          inputMode="decimal"
          value={dk}
          onChange={(e) => setDk(e.target.value.replace(/[^\d.,]/g, ""))}
          placeholder="dk"
          aria-label={`Süre (dakika)${son}`}
          className={`${alan} ${boy} w-14 text-center tabular-nums placeholder:text-muted`}
        />
        <button type="submit" disabled={!dk} className={`rounded-full font-semibold text-[var(--link)] hover:bg-ink/[0.06] disabled:opacity-40 ${boy}`}>
          Ekle
        </button>
      </form>
    </div>
  );
}
