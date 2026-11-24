"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarPlus, ChevronLeft, ChevronRight, ListPlus, X } from "lucide-react";
import {
  AY_ADLARI, GUN_KISA, defterIsle, durumAyarla, gunEkle, gunTarihi, haftaGunu, listedenCikar, listeyeEkle, planaEkle, plandanKaldir, useDefter, yerelGun,
  type KayitBilgisi,
} from "@/lib/defter";
import { DurumDugmeleri } from "./Parcalar";
import s from "./DurumDugmeleri.module.css";

const kisaTarih = (t: string) => {
  const d = gunTarihi(t);
  return `${d.getDate()} ${AY_ADLARI[d.getMonth()].slice(0, 3)}`;
};

/**
 * Her egzersiz ve şarkının yanındaki dört eylem: yeşil "Öğrendim", turuncu "Öğreniyorum", "Takvime al" (tarih seçici
 * açılır; seçilen güne plan olarak düşer) ve "Listeye ekle" (Çalışma listem: ileride çalışılacaklar). Defterde YALNIZ
 * bu düğmelerle işaretlenenler tutulur (bkz. lib/defter-cekirdek.ts › isaretli).
 */
export default function EylemDugmeleri({
  bilgi,
  kisim,
  kompakt = false,
  yalnizSimge = false,
}: {
  bilgi: KayitBilgisi;
  /** Seçili kısım: durum işaretlenirken kayda yazılır */
  kisim?: string | null;
  kompakt?: boolean;
  /** Dar kartlar (şarkı bantları): yalnız simge */
  yalnizSimge?: boolean;
}) {
  const veri = useDefter();
  const kayit = veri.kayitlar[bilgi.id];
  const listede = veri.liste.includes(bilgi.id);
  const planli = kayit?.planli ?? [];
  const [takvim, setTakvim] = useState(false);
  const tetik = useRef<HTMLButtonElement>(null);
  const boy = yalnizSimge ? s.simgeli : kompakt ? s.kompakt : s.normal;
  const simge = kompakt || yalnizSimge ? 13 : 15;
  const bugun = yerelGun(new Date());
  const yakin = planli.find((t) => t >= bugun) ?? planli[planli.length - 1];

  return (
    <div className="flex flex-wrap items-center gap-1.5" data-defter-eylemleri>
      <DurumDugmeleri
        durum={kayit?.durum}
        kisim={kisim}
        kompakt={kompakt}
        yalnizSimge={yalnizSimge}
        ad={bilgi.baslik}
        onDurum={(d) => defterIsle((v) => durumAyarla(v, bilgi, d, kisim))}
      />
      <button
        ref={tetik}
        type="button"
        data-defter-eylem="takvim"
        aria-pressed={planli.length > 0}
        aria-expanded={takvim}
        aria-haspopup="dialog"
        aria-label={`Takvime al (${bilgi.baslik})${planli.length ? `: ${planli.map(kisaTarih).join(", ")}` : ""}`}
        title={planli.length ? `Takvimde: ${planli.map(kisaTarih).join(", ")} (tıkla: tarih ekle ya da kaldır)` : "Takvime al: çalışacağın günü seç"}
        onClick={() => setTakvim((x) => !x)}
        className={`${s.dugme} ${s.mavi} ${boy}`}
      >
        <CalendarPlus size={simge} className={s.simge} aria-hidden />
        {!yalnizSimge && (yakin ? kisaTarih(yakin) + (planli.length > 1 ? ` +${planli.length - 1}` : "") : "Takvime al")}
      </button>
      <button
        type="button"
        data-defter-eylem="liste"
        aria-pressed={listede}
        aria-label={`${listede ? "Çalışma listemden çıkar" : "Çalışma listeme ekle"} (${bilgi.baslik})`}
        title={listede ? `Çalışma listende (${veri.liste.indexOf(bilgi.id) + 1}. sırada). Tıkla: listeden çıkar` : "Listeye ekle: ileride çalışmak için Çalışma listem'e kaydet"}
        onClick={() => defterIsle((v) => (listede ? listedenCikar(v, bilgi.id) : listeyeEkle(v, bilgi)))}
        className={`${s.dugme} ${s.mor} ${boy}`}
      >
        <ListPlus size={simge} className={s.simge} aria-hidden />
        {!yalnizSimge && (listede ? "Listemde" : "Listeye ekle")}
      </button>
      {takvim && <TakvimSecici bilgi={bilgi} planli={planli} tetik={tetik} onKapat={() => setTakvim(false)} />}
    </div>
  );
}

/**
 * "Takvime al" tarih seçicisi: düğmenin altında açılan küçük ay takvimi (sayfa kaydırılsa da düğmeye bağlı kalır;
 * kaydırma kutularının içinde kırpılmasın diye gövdeye çizilir). Güne tıklamak planı ekler ya da kaldırır.
 */
function TakvimSecici({ bilgi, planli, tetik, onKapat }: { bilgi: KayitBilgisi; planli: string[]; tetik: React.RefObject<HTMLButtonElement | null>; onKapat: () => void }) {
  const bugun = yerelGun(new Date());
  const [ay, setAy] = useState(() => {
    const d = gunTarihi(planli.find((t) => t >= bugun) ?? bugun);
    return { y: d.getFullYear(), a: d.getMonth() };
  });
  const [konum, setKonum] = useState<{ x: number; y: number } | null>(null);
  const kutu = useRef<HTMLDivElement>(null);
  const kapatRef = useRef(onKapat);
  useEffect(() => {
    kapatRef.current = onKapat;
  });

  useLayoutEffect(() => {
    const yerlestir = () => {
      const r = tetik.current?.getBoundingClientRect();
      if (!r) return;
      const gen = 288;
      const x = Math.max(8, Math.min(window.innerWidth - gen - 8, r.left));
      const asagi = r.bottom + 6;
      const yuk = kutu.current?.offsetHeight ?? 330;
      const y = asagi + yuk > window.innerHeight - 8 && r.top - yuk - 6 > 8 ? r.top - yuk - 6 : asagi;
      setKonum({ x, y });
    };
    yerlestir();
    window.addEventListener("scroll", yerlestir, true);
    window.addEventListener("resize", yerlestir);
    return () => {
      window.removeEventListener("scroll", yerlestir, true);
      window.removeEventListener("resize", yerlestir);
    };
  }, [tetik]);

  useEffect(() => {
    kutu.current?.querySelector<HTMLButtonElement>("[data-takvim-gun][tabindex='0']")?.focus({ preventScroll: true });
    const dis = (e: PointerEvent) => {
      const t = e.target as Node;
      if (kutu.current?.contains(t) || tetik.current?.contains(t)) return;
      kapatRef.current();
    };
    const tus = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      kapatRef.current();
      tetik.current?.focus({ preventScroll: true });
    };
    window.addEventListener("pointerdown", dis);
    window.addEventListener("keydown", tus);
    return () => {
      window.removeEventListener("pointerdown", dis);
      window.removeEventListener("keydown", tus);
    };
  }, [tetik]);

  const ilk = new Date(ay.y, ay.a, 1, 12);
  const bas = gunEkle(yerelGun(ilk), -haftaGunu(ilk));
  const hucre = Math.ceil((haftaGunu(ilk) + new Date(ay.y, ay.a + 1, 0).getDate()) / 7) * 7;
  const gunler = Array.from({ length: hucre }, (_, i) => gunEkle(bas, i));
  const ayaGit = (n: number) => setAy(({ y, a }) => ({ y: a + n < 0 ? y - 1 : a + n > 11 ? y + 1 : y, a: (a + n + 12) % 12 }));
  const odakGun = planli.find((t) => gunler.includes(t)) ?? (gunler.includes(bugun) ? bugun : gunler.find((t) => gunTarihi(t).getMonth() === ay.a)!);
  const degis = (t: string) => defterIsle((v) => (planli.includes(t) ? plandanKaldir(v, bilgi.id, t) : planaEkle(v, bilgi, t)));

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      ref={kutu}
      role="dialog"
      aria-label={`Takvime al: ${bilgi.baslik}`}
      data-takvim-secici
      className="bg-elevated fixed z-[60] w-72 rounded-2xl border border-ink/10 p-3 text-text shadow-[var(--shadow-pop)]"
      style={{ left: konum?.x ?? -9999, top: konum?.y ?? -9999 }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-semibold">Takvime al</p>
        <button type="button" onClick={onKapat} className="flex size-7 items-center justify-center rounded-full hover:bg-ink/[0.08]" aria-label="Kapat">
          <X size={14} />
        </button>
      </div>
      <p className="truncate text-xs text-muted">{bilgi.baslik} · çalışacağın günü seç</p>
      <div className="mt-2 flex items-center justify-between">
        <button type="button" onClick={() => ayaGit(-1)} className="flex size-7 items-center justify-center rounded-full hover:bg-ink/[0.08]" aria-label="Önceki ay">
          <ChevronLeft size={15} />
        </button>
        <span className="text-sm font-semibold" aria-live="polite">
          {AY_ADLARI[ay.a]} {ay.y}
        </span>
        <button type="button" onClick={() => ayaGit(1)} className="flex size-7 items-center justify-center rounded-full hover:bg-ink/[0.08]" aria-label="Sonraki ay">
          <ChevronRight size={15} />
        </button>
      </div>
      <div className="mt-1 grid grid-cols-7 text-center text-[11px] text-muted" aria-hidden>
        {GUN_KISA.map((g) => (
          <span key={g}>{g.slice(0, 2)}</span>
        ))}
      </div>
      <div
        className="mt-1 grid grid-cols-7 gap-0.5"
        role="group"
        aria-label={`${AY_ADLARI[ay.a]} ${ay.y}`}
        onKeyDown={(e) => {
          const adim: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
          if (adim[e.key] === undefined) return;
          e.preventDefault();
          const simdiki = (document.activeElement as HTMLElement | null)?.dataset.takvimGun ?? odakGun;
          const yeni = gunEkle(simdiki, adim[e.key]);
          const d = gunTarihi(yeni);
          if (d.getMonth() !== ay.a || d.getFullYear() !== ay.y) setAy({ y: d.getFullYear(), a: d.getMonth() });
          requestAnimationFrame(() => kutu.current?.querySelector<HTMLButtonElement>(`[data-takvim-gun="${yeni}"]`)?.focus());
        }}
      >
        {gunler.map((t) => {
          const d = gunTarihi(t);
          const secili = planli.includes(t);
          const gecmis = t < bugun;
          return (
            <button
              key={t}
              type="button"
              data-takvim-gun={t}
              tabIndex={t === odakGun ? 0 : -1}
              aria-pressed={secili}
              aria-label={`${d.getDate()} ${AY_ADLARI[d.getMonth()]}${t === bugun ? ", bugün" : ""}${secili ? ", planlı (tıkla: kaldır)" : ""}`}
              onClick={() => degis(t)}
              className={`flex h-8 items-center justify-center rounded-lg text-sm tabular-nums transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
                secili ? "bg-[#0a84ff] font-semibold text-white" : t === bugun ? "font-semibold ring-1 ring-inset ring-text/40 hover:bg-ink/[0.07]" : "hover:bg-ink/[0.07]"
              } ${d.getMonth() !== ay.a ? "opacity-40" : gecmis && !secili ? "text-muted" : ""}`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-line/60 pt-2 text-xs">
        <button type="button" onClick={() => degis(bugun)} className="rounded-full bg-ink/[0.06] px-2.5 py-1 font-semibold hover:bg-ink/10">
          {planli.includes(bugun) ? "Bugünü kaldır" : "Bugün"}
        </button>
        <button type="button" onClick={() => degis(gunEkle(bugun, 1))} className="rounded-full bg-ink/[0.06] px-2.5 py-1 font-semibold hover:bg-ink/10">
          {planli.includes(gunEkle(bugun, 1)) ? "Yarını kaldır" : "Yarın"}
        </button>
        {planli.length > 0 && (
          <span className="ml-auto text-muted" data-planli>
            Planlı: {planli.map(kisaTarih).join(", ")}
          </span>
        )}
      </div>
    </div>,
    document.body,
  );
}
