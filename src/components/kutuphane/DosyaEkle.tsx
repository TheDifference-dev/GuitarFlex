"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, CircleAlert, FileMusic, HardDrive, Upload, X } from "lucide-react";
import { loadAlphaTab } from "@/components/TabPlayer";
import { AZAMI_BOYUT, BICIM_METNI, dosyaOzeti, KABUL, uzantiUygun } from "@/lib/dosya-meta";
import { ayniDosya, dosyaEkle, type DosyaKaydi } from "@/lib/dosyalarim";

// "Dosyadan ekle": kullanıcının kendi Guitar Pro / MusicXML / Capella dosyaları. Dosya alphaTab ile bu bilgisayarda
// ayrıştırılır, özeti çıkarılır ve IndexedDB'ye yazılır (src/lib/dosyalarim.ts). İnternete hiçbir şey gönderilmez.

export type EklemeSonucu = { ad: string; durum: "eklendi" | "zaten" | "hata"; mesaj?: string; kayit?: DosyaKaydi };

export function useDosyaEkle(kayitlar: DosyaKaydi[]) {
  const [mesgul, setMesgul] = useState(false);
  const [sonuclar, setSonuclar] = useState<EklemeSonucu[]>([]);
  const kayitRef = useRef(kayitlar);
  useEffect(() => {
    kayitRef.current = kayitlar;
  }, [kayitlar]);

  const ekle = useCallback(async (dosyalar: File[]) => {
    if (!dosyalar.length) return;
    setMesgul(true);
    const out: EklemeSonucu[] = [];
    let at: unknown = null;
    for (const f of dosyalar) {
      try {
        if (!uzantiUygun(f.name)) throw new Error(`Desteklenmeyen dosya türü. Desteklenenler: ${BICIM_METNI}.`);
        if (f.size > AZAMI_BOYUT) throw new Error("Dosya çok büyük (25 MB üstü).");
        if (ayniDosya(kayitRef.current, f.name, f.size) || out.some((x) => x.ad === f.name && x.kayit?.boyut === f.size)) {
          out.push({ ad: f.name, durum: "zaten", mesaj: "Bu dosya kütüphanende zaten var." });
          continue;
        }
        at ??= await loadAlphaTab();
        const veri = await f.arrayBuffer();
        // Ayrıştırıcı kendi kopyasını okusun; saklanan baytlar el değmeden kalır
        const meta = dosyaOzeti(at, veri.slice(0));
        if (!meta.baslik) meta.baslik = f.name.replace(/\.[^.]+$/, "");
        const kayit = await dosyaEkle(f.name, veri, meta);
        out.push({ ad: f.name, durum: "eklendi", kayit });
      } catch (e) {
        out.push({ ad: f.name, durum: "hata", mesaj: (e as Error).message || "Dosya eklenemedi." });
      }
    }
    setSonuclar(out);
    setMesgul(false);
    return out;
  }, []);

  return { ekle, mesgul, sonuclar, temizle: () => setSonuclar([]) };
}

/** Gizli dosya seçici + onu açan düğme */
export function DosyaSecici({ onSec, mesgul, children, className }: { onSec: (f: File[]) => void; mesgul: boolean; children: ReactNode; className: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" className={className} onClick={() => ref.current?.click()} disabled={mesgul}>
        {children}
      </button>
      <input
        ref={ref}
        type="file"
        multiple
        accept={KABUL}
        className="hidden"
        data-dosya-secici
        aria-label="Guitar Pro ya da MusicXML dosyası seç"
        onChange={(e) => {
          const f = [...(e.target.files ?? [])];
          e.target.value = "";
          onSec(f);
        }}
      />
    </>
  );
}

/** Büyük bırakma alanı (boş "Benim dosyalarım") */
export function BirakmaAlani({ onSec, mesgul }: { onSec: (f: File[]) => void; mesgul: boolean }) {
  return (
    <div className="card flex flex-col items-center border-2 border-dashed border-ink/15 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/[0.06]">
        <FileMusic size={26} aria-hidden />
      </span>
      <h2 className="mt-4 text-[24px] font-semibold tracking-tight">Guitar Pro dosyalarını buraya sürükle</h2>
      <p className="mt-2 max-w-[560px] text-muted">
        Kendi tab ve nota dosyalarını kütüphanene ekle; çok track&apos;li oynatıcı, mikser ve döngüyle çalış. Birden çok dosyayı aynı anda bırakabilirsin.
      </p>
      <DosyaSecici onSec={onSec} mesgul={mesgul} className="btn-primary mt-6 px-5 py-2 text-[15px] disabled:opacity-50">
        <Upload size={16} /> {mesgul ? "Ekleniyor…" : "Dosya seç"}
      </DosyaSecici>
      <p className="mt-6 max-w-[620px] text-sm text-muted">Desteklenen biçimler: {BICIM_METNI}.</p>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
        <HardDrive size={14} aria-hidden /> Dosyalar yalnız bu bilgisayarda saklanır; hiçbir yere yüklenmez.
      </p>
    </div>
  );
}

export function EklemeRaporu({ sonuclar, onKapat }: { sonuclar: EklemeSonucu[]; onKapat: () => void }) {
  if (!sonuclar.length) return null;
  const eklenen = sonuclar.filter((s) => s.durum === "eklendi").length;
  return (
    <div className="card relative p-4 text-sm" role="status" aria-live="polite">
      <button type="button" onClick={onKapat} className="absolute right-3 top-3 text-muted hover:text-text" aria-label="Kapat">
        <X size={15} />
      </button>
      <p className="font-semibold">{eklenen ? `${eklenen} dosya kütüphanene eklendi.` : "Dosya eklenmedi."}</p>
      <ul className="mt-2 space-y-1">
        {sonuclar.map((s, i) => (
          <li key={`${s.ad}-${i}`} className="flex items-start gap-2">
            {s.durum === "eklendi" ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-ok" /> : <CircleAlert size={15} className={`mt-0.5 shrink-0 ${s.durum === "hata" ? "text-bad" : "text-muted"}`} />}
            <span className="min-w-0">
              <span className="font-medium">{s.ad}</span>
              {s.durum === "eklendi" && s.kayit ? (
                <span className="text-muted">
                  {" "}
                  · {s.kayit.meta.izler.length} track, {s.kayit.meta.olcu} ölçü, {s.kayit.meta.tempo} BPM
                </span>
              ) : (
                <span className="text-muted"> · {s.mesaj}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
