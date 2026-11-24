"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";
import { CalendarPlus, CircleCheck, Library, Repeat, X } from "lucide-react";
import {
  AY_ADLARI, GUN_ADLARI, defterIsle, durumAyarla, gunEkle, gunTarihi, haftaGunu, kisimYaz, ogreneceklerdenCikar, ogreneceklereEkle, siradakiPlan, takvimdenCikar,
  takvimeEkle, useDefter, yerelGun, type Durum, type KayitBilgisi,
} from "@/lib/defter";
import s from "./DurumDugmeleri.module.css";

const kisaTarih = (t: string) => {
  const d = gunTarihi(t);
  return `${d.getDate()} ${AY_ADLARI[d.getMonth()].slice(0, 3)}`;
};
const uzunTarih = (t: string) => {
  const d = gunTarihi(t);
  return `${d.getDate()} ${AY_ADLARI[d.getMonth()]} ${GUN_ADLARI[haftaGunu(d)]}`;
};

/**
 * Bir egzersizin, dersin ya da şarkının dört defter düğmesi (deftere yalnız bunlarla eklenir):
 *  • Öğrendim (yeşil) ve Öğreniyorum (turuncu): durum; basılı olana yeniden basmak işareti kaldırır.
 *  • Takvime al (mavi): tarih seçici açılır; seçilen gün takvime ve haftalık plana yazılır. Planlı günler seçicide
 *    listelenir ve tek tek kaldırılabilir.
 *  • Kütüphaneye ekle (mor): Öğreneceklerim listesine (sıralı) ekler; yeniden basmak listeden çıkarır.
 * `ikon`: dar kartlarda yalnız simgeler (ad title ve aria-label'da). `kisim` verilirse durumla kayda yazılır.
 */
export default function DefterDugmeleri({
  bilgi,
  kisim,
  kompakt = false,
  ikon = false,
  className = "",
}: {
  bilgi: KayitBilgisi;
  kisim?: string | null;
  kompakt?: boolean;
  ikon?: boolean;
  className?: string;
}) {
  const veri = useDefter();
  const kayit = veri.kayitlar[bilgi.id];
  const durum = kayit?.durum ?? null;
  const takvim = kayit?.takvim ?? [];
  const sira = veri.ogrenecekler.indexOf(bilgi.id);
  const [acik, setAcik] = useState(false);
  const takvimDugmesi = useRef<HTMLButtonElement>(null);
  const bugun = yerelGun(new Date());
  const siradaki = kayit ? siradakiPlan(kayit, bugun) : null;

  const on = kisim ? `${kisimYaz(kisim)}: ` : "";
  const ad = ` (${bilgi.baslik})`;
  const boy = ikon ? s.ikon : kompakt ? s.kompakt : s.normal;
  const simge = ikon ? 15 : kompakt ? 13 : 15;
  const durumYap = (d: Durum) => defterIsle((v) => durumAyarla(v, bilgi, durum === d ? null : d, kisim));

  const takvimYazi = siradaki ? `Takvimde · ${kisaTarih(siradaki)}${takvim.length > 1 ? ` +${takvim.length - 1}` : ""}` : "Takvime al";
  const kutuphaneYazi = sira >= 0 ? `Kütüphanede · ${sira + 1}.` : "Kütüphaneye ekle";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`} role="group" aria-label={`Çalışma Defteri${ad}`} data-defter-dugmeleri>
      <button
        type="button"
        data-defter-durum="ogrendim"
        aria-pressed={durum === "ogrendim"}
        aria-label={`${on}Öğrendim${ad}`}
        title={durum === "ogrendim" ? "Öğrendin (tıkla: işareti kaldır)" : `${on}Öğrendim olarak işaretle`}
        onClick={() => durumYap("ogrendim")}
        className={`${s.dugme} ${s.yesil} ${boy}`}
      >
        <CircleCheck size={simge} className={s.simge} aria-hidden />
        {!ikon && "Öğrendim"}
      </button>
      <button
        type="button"
        data-defter-durum="devam"
        aria-pressed={durum === "devam"}
        aria-label={`${on}Öğreniyorum${ad}`}
        title={durum === "devam" ? "Öğreniyorsun (tıkla: işareti kaldır)" : `${on}Öğreniyorum olarak işaretle`}
        onClick={() => durumYap("devam")}
        className={`${s.dugme} ${s.sari} ${boy}`}
      >
        <Repeat size={simge} className={s.simge} aria-hidden />
        {!ikon && "Öğreniyorum"}
      </button>
      <button
        ref={takvimDugmesi}
        type="button"
        data-defter-takvim
        data-dolu={takvim.length > 0}
        aria-haspopup="dialog"
        aria-expanded={acik}
        aria-label={`${takvimYazi}${ad}`}
        title={takvim.length ? `Takvimde: ${takvim.map(kisaTarih).join(", ")} (tıkla: gün ekle ya da kaldır)` : "Takvime al: bir gün seç"}
        onClick={() => setAcik((x) => !x)}
        className={`${s.dugme} ${s.mavi} ${boy}`}
      >
        <CalendarPlus size={simge} className={s.simge} aria-hidden />
        {!ikon && takvimYazi}
      </button>
      <button
        type="button"
        data-defter-kutuphane
        aria-pressed={sira >= 0}
        aria-label={`${sira >= 0 ? `Öğreneceklerim listesinde ${sira + 1}. sırada` : "Kütüphaneye ekle (Öğreneceklerim)"}${ad}`}
        title={sira >= 0 ? `Öğreneceklerim listesinde ${sira + 1}. sırada (tıkla: listeden çıkar)` : "Kütüphaneye ekle: ileride çalışmak için Öğreneceklerim listesine"}
        onClick={() => defterIsle((v) => (v.ogrenecekler.includes(bilgi.id) ? ogreneceklerdenCikar(v, bilgi.id) : ogreneceklereEkle(v, bilgi)))}
        className={`${s.dugme} ${s.mor} ${boy}`}
      >
        <Library size={simge} className={s.simge} aria-hidden />
        {!ikon && kutuphaneYazi}
      </button>
      {acik && (
        <TakvimSecici
          bilgi={bilgi}
          takvim={takvim}
          bugun={bugun}
          tetik={takvimDugmesi}
          onKapat={(odak) => {
            setAcik(false);
            if (odak) takvimDugmesi.current?.focus();
          }}
        />
      )}
    </div>
  );
}

const GENISLIK = 288;

/** Seçicinin konumu: düğmenin altında, yer yoksa üstünde; düğme görünümden çıktıysa null */
function konum(dugme: HTMLElement | null, kutu: HTMLElement | null): CSSProperties | null {
  const r = dugme?.getBoundingClientRect();
  if (!r || r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return null;
  const h = kutu?.offsetHeight ?? 260;
  const sol = Math.min(Math.max(8, r.left), window.innerWidth - GENISLIK - 8);
  const alta = r.bottom + 6 + h <= window.innerHeight - 8 || r.top < h + 14;
  return { left: sol, top: alta ? r.bottom + 6 : r.top - 6 - h, width: GENISLIK };
}

/**
 * "Takvime al" tarih seçicisi: düğmenin altında (yer yoksa üstünde) açılan küçük pencere. Sayfanın gövdesine çizilir
 * (yatay kayan şarkı bantlarında kırpılmasın). Sayfa ya da bant kayınca düğmeyi izler; düğme görünümden çıkınca, Esc'e
 * ya da dışarı tıklanınca kapanır.
 */
function TakvimSecici({
  bilgi,
  takvim,
  bugun,
  tetik,
  onKapat,
}: {
  bilgi: KayitBilgisi;
  takvim: string[];
  bugun: string;
  tetik: RefObject<HTMLButtonElement | null>;
  onKapat: (odak: boolean) => void;
}) {
  const kutu = useRef<HTMLDivElement>(null);
  const tarihAlani = useRef<HTMLInputElement>(null);
  const [tarih, setTarih] = useState(bugun);
  const [yer, setYer] = useState<CSSProperties>({ visibility: "hidden" });

  useLayoutEffect(() => {
    const y = konum(tetik.current, kutu.current);
    if (y) setYer(y);
    tarihAlani.current?.focus({ preventScroll: true });
  }, [tetik]);

  useEffect(() => {
    const tus = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onKapat(true);
      }
    };
    const tik = (e: PointerEvent) => {
      const h = e.target as Node;
      if (!kutu.current?.contains(h) && !tetik.current?.contains(h)) onKapat(false);
    };
    const kay = () => {
      const y = konum(tetik.current, kutu.current);
      if (y) setYer(y);
      else onKapat(false);
    };
    document.addEventListener("keydown", tus, true);
    document.addEventListener("pointerdown", tik, true);
    window.addEventListener("scroll", kay, true);
    window.addEventListener("resize", kay);
    return () => {
      document.removeEventListener("keydown", tus, true);
      document.removeEventListener("pointerdown", tik, true);
      window.removeEventListener("scroll", kay, true);
      window.removeEventListener("resize", kay);
    };
  }, [onKapat, tetik]);

  const ekle = (t: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return;
    defterIsle((v) => takvimeEkle(v, bilgi, t));
    onKapat(true);
  };
  const hizli: [string, string][] = [
    ["Bugün", bugun],
    ["Yarın", gunEkle(bugun, 1)],
    ["Haftaya", gunEkle(bugun, 7)],
  ];
  const cip = "rounded-full border border-ink/10 bg-ink/[0.04] px-2.5 py-1 text-xs font-semibold hover:bg-ink/10";

  return createPortal(
    <div
      ref={kutu}
      role="dialog"
      aria-label={`${bilgi.baslik}: takvime al`}
      style={yer}
      className="bg-elevated fixed z-[60] rounded-2xl border border-ink/10 p-4 text-left text-sm text-text shadow-[var(--shadow-pop)]"
      data-takvim-secici
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold leading-tight">
          Takvime al
          <span className="block truncate text-xs font-normal text-muted">{bilgi.baslik}</span>
        </p>
        <button type="button" onClick={() => onKapat(true)} className="-mr-1 -mt-1 flex size-7 items-center justify-center rounded-full hover:bg-ink/[0.08]" aria-label="Kapat">
          <X size={14} />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {hizli.map(([ad, t]) => (
          <button key={ad} type="button" onClick={() => ekle(t)} className={cip} title={uzunTarih(t)}>
            {ad}
          </button>
        ))}
      </div>
      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ekle(tarih);
        }}
      >
        <input
          ref={tarihAlani}
          type="date"
          value={tarih}
          onChange={(e) => setTarih(e.target.value)}
          aria-label="Gün"
          className="h-9 min-w-0 flex-1 rounded-full border border-ink/10 bg-[var(--bg)] px-3 text-sm tabular-nums"
        />
        <button type="submit" disabled={!tarih} className="btn-primary shrink-0 px-3.5 py-1.5 text-sm">
          Ekle
        </button>
      </form>
      {takvim.length > 0 && (
        <div className="mt-3 border-t border-line/60 pt-2">
          <p className="text-xs text-muted">Planlı günler</p>
          <ul className="mt-1 space-y-0.5">
            {takvim.map((t) => (
              <li key={t} className="flex items-center justify-between gap-2">
                <span className={t < bugun ? "text-muted" : "font-semibold"}>{uzunTarih(t)}</span>
                <button
                  type="button"
                  onClick={() => defterIsle((v) => takvimdenCikar(v, bilgi.id, t))}
                  className="flex size-7 items-center justify-center rounded-full text-muted hover:bg-ink/[0.08] hover:text-bad"
                  aria-label={`${uzunTarih(t)} planını kaldır`}
                  title="Bu günü takvimden kaldır"
                >
                  <X size={13} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link href="/defter#takvim" className="mt-3 inline-block text-xs font-semibold text-[var(--link)] hover:underline" onClick={() => onKapat(false)}>
        Takvimde gör
      </Link>
    </div>,
    document.body,
  );
}
