"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HardDrive, Layers, Trash2 } from "lucide-react";
import TabPlayer, { type TabSource } from "@/components/TabPlayer";
import { SayfaBasi } from "@/components/site/Vitrin";
import EnstrumanSimgesi from "@/components/oynatici/EnstrumanSimgesi";
import { AILE_ADI, enstruman } from "@/lib/enstruman";
import { dosyaOku, dosyaSil, type DosyaKaydi } from "@/lib/dosyalarim";
import { calindi, dosyaKimlik, kimlikUnut } from "@/lib/kutuphane-yerel";
import { noteName } from "@/lib/music";
import { addPracticeTime } from "@/lib/progress";
import { SERBEST } from "@/lib/oyun";
import FavoriDugmesi from "./FavoriDugmesi";
import { Onay } from "./LibraryBrowser";
import { sure } from "./ortak";

const kb = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

/** Kullanıcının içe aktardığı dosyanın sayfası: TabPlayer (ikili dosya) + mikser, dosya bilgisi ve track listesi */
export default function DosyaSarkiView({ id }: { id: string }) {
  const router = useRouter();
  const [durum, setDurum] = useState<{ kayit: DosyaKaydi; veri: ArrayBuffer } | "yok" | "hata" | null>(null);
  const [sor, setSor] = useState(false);
  const [caliyor, setCaliyor] = useState(false);

  useEffect(() => {
    let iptal = false;
    dosyaOku(id)
      .then((r) => !iptal && setDurum(r ?? "yok"))
      .catch(() => !iptal && setDurum("hata"));
    return () => {
      iptal = true;
    };
  }, [id]);

  const kayit = typeof durum === "object" && durum ? durum.kayit : null;
  const source = useMemo<TabSource | null>(() => (typeof durum === "object" && durum ? { kind: "file", data: durum.veri, name: durum.kayit.dosyaAdi } : null), [durum]);
  const kimlik = dosyaKimlik(id);

  // Çalma: "Son çalınanlar" ve Serbest Çalışma süresi
  useEffect(() => {
    if (!caliyor || !kayit) return;
    calindi(kimlik);
    const key = `${SERBEST}kutuphane/dosya`;
    let bekleyen = 0;
    const t = window.setInterval(() => {
      if (++bekleyen >= 5) {
        addPracticeTime(key, bekleyen, kayit.meta.tempo, Number.MAX_SAFE_INTEGER);
        bekleyen = 0;
      }
    }, 1000);
    return () => {
      window.clearInterval(t);
      if (bekleyen) addPracticeTime(key, bekleyen, kayit.meta.tempo, Number.MAX_SAFE_INTEGER);
    };
  }, [caliyor, kayit, kimlik]);

  const kirinti = [{ href: "/kutuphane", label: "Şarkı Kütüphanesi" }, { label: kayit?.meta.baslik || "Benim dosyam" }];
  if (durum === null) return <SayfaBasi kirinti={kirinti} baslik="Yükleniyor…" boyut="buyuk" />;
  if (durum === "yok" || durum === "hata" || !kayit || !source)
    return (
      <SayfaBasi
        kirinti={kirinti}
        baslik={durum === "hata" ? "Dosyalar okunamadı" : "Bu dosya kütüphanende yok"}
        alt={durum === "hata" ? "Tarayıcı depolaması açılamadı (gizli pencere ya da kapalı depolama olabilir)." : "Silinmiş ya da başka bir bilgisayarda eklenmiş olabilir. Dosyalar yalnız eklendikleri bilgisayarda saklanır."}
        boyut="buyuk"
      />
    );

  const m = kayit.meta;
  const pill = "rounded-full bg-ink/[0.06] px-3.5 py-1 text-sm font-semibold";
  return (
    <div className="space-y-6">
      <SayfaBasi
        kirinti={kirinti}
        ust={`Benim dosyam${m.sanatci ? ` · ${m.sanatci}` : ""}${m.album ? ` · ${m.album}` : ""}`}
        baslik={m.baslik || kayit.dosyaAdi}
        boyut="buyuk"
        className="!pb-10"
        ek={
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {m.ton && <span className={pill}>{m.ton}</span>}
            <span className={`${pill} tabular-nums`}>{m.tempo} BPM</span>
            <span className={pill}>{m.olcuBirimi}</span>
            <span className={`${pill} tabular-nums`}>{m.olcu} ölçü</span>
            <span className={`${pill} tabular-nums`}>{sure(m.sureSn)}</span>
            <span className={`${pill} tabular-nums`}>{m.izler.length} track</span>
          </div>
        }
      />
      <div className="flex flex-wrap items-center justify-end gap-2">
        <FavoriDugmesi id={kimlik} />
        <button type="button" onClick={() => setSor(true)} className="btn-secondary px-4 py-1.5 text-sm">
          <Trash2 size={15} /> Kütüphaneden sil
        </button>
      </div>
      <TabPlayer source={source} onPlayingChange={setCaliyor} mikserKaydi={kimlik} />

      <section className="card p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Layers size={18} /> Track&apos;ler
        </h2>
        <ul className="mt-3 divide-y divide-line/60">
          {m.izler.map((t, i) => {
            const e = enstruman(t.program, t.perkusyon, t.ad);
            return (
              <li key={`${t.ad}-${i}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)_minmax(0,12rem)]">
                <span className="flex min-w-0 items-center gap-2 font-semibold">
                  <EnstrumanSimgesi simge={e.simge} /> <span className="truncate">{t.ad}</span>
                </span>
                <span className="truncate text-muted">
                  {e.ad} · {AILE_ADI[e.aile]}
                  {t.program !== null ? <span className="tabular-nums"> · GM {t.program + 1}</span> : " · kanal 10"}
                </span>
                <span className="col-span-2 truncate text-xs text-muted sm:col-span-1 sm:text-right">
                  {t.perkusyon ? "Davul notası" : t.tel ? (
                    <>
                      Tab · {t.tel} tel · <span className="font-mono">{t.akort.map((x) => noteName(x)).join(" ")}</span>
                    </>
                  ) : (
                    "Nota (telsiz)"
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted">Telli enstrümanlar (gitar, bas, ukulele, banjo) tabla, ötekiler notayla, davul davul notasıyla gösterilir. Mikser&apos;den gösterilen track&apos;i seç; ses, pan, solo ve sessiz ayarları bu dosya için hatırlanır.</p>
      </section>

      <p className="flex items-center gap-1.5 text-xs text-muted">
        <HardDrive size={13} aria-hidden /> {kayit.dosyaAdi} · {kb(kayit.boyut)} · {new Date(kayit.eklendi).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} tarihinde eklendi. Dosya yalnız bu bilgisayarda saklanır.
      </p>

      {sor && (
        <Onay
          baslik={`"${m.baslik || kayit.dosyaAdi}" silinsin mi?`}
          onIptal={() => setSor(false)}
          onEvet={() => {
            void dosyaSil(id).then(() => {
              kimlikUnut(kimlik);
              router.push("/kutuphane");
            });
          }}
        >
          Dosya kütüphanenden ve bu bilgisayardaki kopyasından silinir; favori ve mikser ayarları da gider. Bilgisayarındaki asıl dosyaya dokunulmaz.
        </Onay>
      )}
    </div>
  );
}
