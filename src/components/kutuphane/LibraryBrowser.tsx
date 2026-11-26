"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import SongsterrAra from "@/components/SongsterrAra";
import { POPULAR_SONGS } from "@/content/sarkilar";
import { HardDrive, Search, Star, Trash2, Upload, X } from "lucide-react";
import type { Level } from "@/content/types";
import { KADEME, KADEMELER, LEVELS, kademeOf, type Kademe } from "@/content/seviyeler";
import { AILELER, aileler as aileListesi, enstruman, type EnstrumanAilesi } from "@/lib/enstruman";
import { dosyaSil, useDosyalarim, type DosyaKaydi } from "@/lib/dosyalarim";
import { dosyaKimlik, favoriDegistir, kimlikUnut, ozgunKimlik, useFavoriler, useSonCalinanlar, type SarkiKimligi } from "@/lib/kutuphane-yerel";
import type { LibrarySummary } from "@/lib/kutuphane";
import EnstrumanSimgesi from "@/components/oynatici/EnstrumanSimgesi";
import UygulamaSimgesi from "@/components/site/UygulamaSimgesi";
import { turSimgesi } from "@/lib/simge";
import { BirakmaAlani, DosyaSecici, EklemeRaporu, useDosyaEkle } from "./DosyaEkle";
import { izEnstrumani, SeviyeEtiketi, sure } from "./ortak";

// Tab Oynatıcı ve Dosyalarım (/kutuphane) ana listesi: büyük arama, sekmeler (Tümü / Benim dosyalarım / Favoriler / Son çalınanlar),
// enstrüman ailesi, zorluk ve tür süzgeçleri; GuitarFlex şarkıları ile kullanıcının kendi dosyaları tek listede.

type Sekme = "tumu" | "dosyalar" | "favoriler" | "son";
const SEKMELER: { id: Sekme; ad: string }[] = [
  { id: "tumu", ad: "Tümü" },
  { id: "dosyalar", ad: "Benim dosyalarım" },
  { id: "favoriler", ad: "Favoriler" },
  { id: "son", ad: "Son çalınanlar" },
];
const SIRALAMA = { onerilen: "Önerilen", ad: "Ada göre", tempo: "Tempoya göre", sure: "Süreye göre", yeni: "Son eklenen" } as const;
type Siralama = keyof typeof SIRALAMA;
/** Kullanıcı dosyalarının "tür" süzgecindeki adı */
const DOSYA_TURU = "Benim dosyam";

type Satir = {
  id: SarkiKimligi;
  href: string;
  baslik: string;
  alt: string;
  tur: string;
  seviye?: Level;
  ton?: string;
  tempo: number;
  sureSn: number;
  izSayisi: number;
  aileler: EnstrumanAilesi[];
  /** Arama metni */
  ara: string;
  dosya?: DosyaKaydi;
  sira: number;
};

function ozgunSatir(s: LibrarySummary, i: number): Satir {
  const izler = s.tracks.map(izEnstrumani);
  const aileVar = new Set(izler.map((e) => e.aile));
  return {
    id: ozgunKimlik(s.slug),
    href: `/kutuphane/${s.slug}`,
    baslik: s.title,
    alt: s.source.startsWith("Özgün") ? "GuitarFlex · özgün" : `${s.origin?.replace(/^Ezgi:\s*/, "") ?? "Geleneksel"} · GuitarFlex düzenlemesi`,
    tur: s.genre,
    seviye: s.level,
    ton: s.key,
    tempo: s.bpm,
    sureSn: s.durationSec,
    izSayisi: s.tracks.length,
    aileler: AILELER.map((a) => a.id).filter((a) => aileVar.has(a)),
    ara: [s.title, s.genre, s.key, s.description, s.origin ?? "", ...s.chords, ...s.techniques, ...s.tracks.map((t) => `${t.name} ${t.instrument}`), ...izler.map((e) => e.ad)].join(" "),
    sira: LEVELS.indexOf(s.level) * 1000 + i,
  };
}
function dosyaSatir(k: DosyaKaydi, i: number): Satir {
  const m = k.meta;
  const izler = m.izler.map((t) => ({ program: t.program, perkusyon: t.perkusyon, ad: t.ad }));
  return {
    id: dosyaKimlik(k.id),
    href: `/kutuphane/dosya/${k.id}`,
    baslik: m.baslik || k.dosyaAdi,
    alt: [m.sanatci, m.album].filter(Boolean).join(" · ") || k.dosyaAdi,
    tur: DOSYA_TURU,
    ton: m.ton,
    tempo: m.tempo,
    sureSn: m.sureSn,
    izSayisi: m.izler.length,
    aileler: aileListesi(izler),
    ara: [m.baslik, m.sanatci, m.album, k.dosyaAdi, ...m.izler.map((t) => `${t.ad} ${enstruman(t.program, t.perkusyon, t.ad).ad}`)].join(" "),
    dosya: k,
    sira: -1 - i,
  };
}

export default function LibraryBrowser({ songs }: { songs: LibrarySummary[] }) {
  const dosyalar = useDosyalarim();
  const favoriler = useFavoriler();
  const son = useSonCalinanlar();
  const { ekle, mesgul, sonuclar, temizle } = useDosyaEkle(dosyalar.kayitlar);

  const [sekme, setSekme] = useState<Sekme>("tumu");
  const [q, setQ] = useState("");
  const [aile, setAile] = useState<EnstrumanAilesi | "">("");
  const [seviye, setSeviye] = useState<Kademe | "">("");
  const [tur, setTur] = useState("");
  const [sira, setSira] = useState<Siralama>("onerilen");
  const [surukle, setSurukle] = useState(false);
  const [silinecek, setSilinecek] = useState<Satir | null>(null);

  const tum = useMemo(() => [...dosyalar.kayitlar.map(dosyaSatir), ...songs.map(ozgunSatir)], [dosyalar.kayitlar, songs]);
  const sonSira = useMemo(() => new Map(son.map((x, i) => [x.id, i])), [son]);
  const turler = useMemo(() => [...new Set(tum.map((s) => s.tur))].sort((a, b) => (a === DOSYA_TURU ? -1 : b === DOSYA_TURU ? 1 : a.localeCompare(b, "tr"))), [tum]);
  const mevcutAileler = useMemo(() => AILELER.filter((a) => tum.some((s) => s.aileler.includes(a.id))), [tum]);

  const sekmeSatirlari = (x: Sekme) =>
    x === "dosyalar" ? tum.filter((s) => s.dosya) : x === "favoriler" ? tum.filter((s) => favoriler.has(s.id)) : x === "son" ? tum.filter((s) => sonSira.has(s.id)) : tum;

  const populerEslesen = useMemo(() => {
    const igne = q.trim().toLocaleLowerCase("tr");
    if (igne.length < 2) return [];
    return POPULAR_SONGS.filter((s) => `${s.title} ${s.artist}`.toLocaleLowerCase("tr").includes(igne)).slice(0, 6);
  }, [q]);

  const gosterilen = useMemo(() => {
    const igne = q.trim().toLocaleLowerCase("tr");
    const out = sekmeSatirlari(sekme).filter((s) => {
      if (aile && !s.aileler.includes(aile)) return false;
      if (seviye && (!s.seviye || kademeOf(s.seviye) !== seviye)) return false;
      if (tur && s.tur !== tur) return false;
      return !igne || s.ara.toLocaleLowerCase("tr").includes(igne);
    });
    const by: Record<Siralama, (a: Satir, b: Satir) => number> = {
      onerilen: (a, b) => a.sira - b.sira,
      ad: (a, b) => a.baslik.localeCompare(b.baslik, "tr"),
      tempo: (a, b) => a.tempo - b.tempo,
      sure: (a, b) => a.sureSn - b.sureSn,
      yeni: (a, b) => (b.dosya?.eklendi ?? "").localeCompare(a.dosya?.eklendi ?? "") || a.sira - b.sira,
    };
    // Son çalınanlar sekmesinde sıra: en son çalınan önce
    return out.sort(sekme === "son" && sira === "onerilen" ? (a, b) => sonSira.get(a.id)! - sonSira.get(b.id)! : by[sira]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tum, sekme, q, aile, seviye, tur, sira, favoriler, sonSira]);

  const filtreVar = !!(aile || seviye || tur || q);
  const temizleFiltre = () => {
    setAile("");
    setSeviye("");
    setTur("");
    setQ("");
  };
  const dosyaEkleVeGoster = async (f: File[]) => {
    const r = await ekle(f);
    if (r?.some((x) => x.durum === "eklendi") && sekme !== "dosyalar" && sekme !== "tumu") setSekme("dosyalar");
  };
  const sil = async (s: Satir) => {
    if (!s.dosya) return;
    await dosyaSil(s.dosya.id);
    kimlikUnut(s.id);
    setSilinecek(null);
  };

  const chip = (on: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold transition ${on ? "border-accent bg-accent text-accent-ink" : "border-line bg-panel hover:border-ink/25"}`;
  const secim = "rounded-full border border-ink/10 bg-ink/[0.05] px-3.5 py-1.5 text-sm";

  const dosyaSekmesiBos = sekme === "dosyalar" && dosyalar.yuklendi && !dosyalar.kayitlar.length;

  return (
    <div
      className="relative space-y-5"
      onDragOver={(e) => {
        if (![...e.dataTransfer.types].includes("Files")) return;
        e.preventDefault();
        setSurukle(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) setSurukle(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setSurukle(false);
        void dosyaEkleVeGoster([...e.dataTransfer.files]);
      }}
    >
      {surukle && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[var(--radius-card)] border-2 border-dashed border-accent bg-[var(--bg)]/85 backdrop-blur-sm">
          <p className="text-center text-[21px] font-semibold">
            Dosyaları bırak
            <span className="mt-1 block text-sm font-normal text-muted">Kütüphanene eklenir, yalnız bu bilgisayarda saklanır.</span>
          </p>
        </div>
      )}

      {/* Büyük arama */}
      <label className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-[var(--panel-on-band)] px-5 py-3.5 shadow-[var(--shadow-seg)]">
        <Search size={22} className="shrink-0 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Şarkı, sanatçı, enstrüman, akor ya da teknik ara"
          className="w-full bg-transparent text-[19px] outline-none placeholder:text-muted"
          aria-label="Kütüphanede ara"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} className="text-muted hover:text-text" aria-label="Aramayı temizle">
            <X size={18} />
          </button>
        )}
      </label>

      <SongsterrAra q={q} bulunan={gosterilen.length + populerEslesen.length} oneriler={populerEslesen} />

      {/* Sekmeler ve dosya ekleme */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap rounded-full border border-ink/10 bg-ink/[0.05] p-0.5" role="tablist" aria-label="Kütüphane bölümleri">
          {SEKMELER.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={sekme === s.id}
              onClick={() => setSekme(s.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${sekme === s.id ? "bg-seg text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`}
            >
              {s.ad} <span className="tabular-nums opacity-60">{sekmeSatirlari(s.id).length}</span>
            </button>
          ))}
        </div>
        <DosyaSecici onSec={(f) => void dosyaEkleVeGoster(f)} mesgul={mesgul} className="btn-primary ml-auto px-4 py-1.5 text-sm disabled:opacity-50">
          <Upload size={15} /> {mesgul ? "Ekleniyor…" : "Dosyadan ekle"}
        </DosyaSecici>
      </div>

      <EklemeRaporu sonuclar={sonuclar} onKapat={temizle} />
      {dosyalar.hata && <p className="card p-4 text-sm text-bad">{dosyalar.hata}</p>}

      {/* Süzgeçler */}
      {!dosyaSekmesiBos && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Enstrüman">
            <button type="button" className={chip(!aile)} onClick={() => setAile("")}>
              Bütün enstrümanlar
            </button>
            {mevcutAileler.map((a) => (
              <button key={a.id} type="button" className={chip(aile === a.id)} onClick={() => setAile(aile === a.id ? "" : a.id)} aria-pressed={aile === a.id}>
                <EnstrumanSimgesi simge={a.simge} size={14} /> {a.ad}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={seviye} onChange={(e) => setSeviye(e.target.value as Kademe | "")} className={secim} aria-label="Zorluk">
              <option value="">Zorluk: Tümü</option>
              {KADEMELER.map((k) => (
                <option key={k} value={k}>
                  {KADEME[k].ad}
                </option>
              ))}
            </select>
            <select value={tur} onChange={(e) => setTur(e.target.value)} className={secim} aria-label="Tür">
              <option value="">Tür: Tümü</option>
              {turler.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select value={sira} onChange={(e) => setSira(e.target.value as Siralama)} className={secim} aria-label="Sıralama">
              {Object.entries(SIRALAMA).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            {filtreVar && (
              <button type="button" onClick={temizleFiltre} className="flex items-center gap-1 text-sm font-semibold hover:underline">
                <X size={14} /> Temizle
              </button>
            )}
            <span className="ml-auto text-sm text-muted">{gosterilen.length} şarkı</span>
          </div>
        </div>
      )}

      {dosyaSekmesiBos ? (
        <BirakmaAlani onSec={(f) => void dosyaEkleVeGoster(f)} mesgul={mesgul} />
      ) : !gosterilen.length ? (
        <div className="card p-8 text-center text-muted">
          {sekme === "favoriler" && !favoriler.size
            ? "Henüz favorin yok. Bir şarkının yanındaki yıldıza bas."
            : sekme === "son" && !son.length
              ? "Henüz çaldığın şarkı yok. Bir şarkıyı açıp Çal'a bastığında burada görünür."
              : "Bu aramaya ya da süzgeçlere uyan şarkı yok."}
          {filtreVar && (
            <>
              {" "}
              <button type="button" onClick={temizleFiltre} className="font-semibold text-text hover:underline">
                Süzgeçleri temizle
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[2rem_minmax(0,1fr)_minmax(0,12rem)_8.5rem_4.5rem_3.5rem_2rem] gap-3 border-b border-line px-4 py-2 text-xs font-semibold text-muted md:grid">
            <span />
            <span>Şarkı</span>
            <span>Enstrümanlar</span>
            <span>Zorluk</span>
            <span className="text-right">Tempo</span>
            <span className="text-right">Süre</span>
            <span />
          </div>
          <ol>
            {gosterilen.map((s) => (
              <SatirOgesi key={s.id} s={s} favori={favoriler.has(s.id)} onSil={() => setSilinecek(s)} />
            ))}
          </ol>
        </div>
      )}

      {sekme === "dosyalar" && !dosyaSekmesiBos && (
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <HardDrive size={14} aria-hidden /> Dosyaların yalnız bu bilgisayarda saklanır. Yenilerini eklemek için buraya sürükle ya da &quot;Dosyadan ekle&quot;ye bas.
        </p>
      )}

      {silinecek && (
        <Onay
          baslik={`"${silinecek.baslik}" silinsin mi?`}
          onIptal={() => setSilinecek(null)}
          onEvet={() => void sil(silinecek)}
        >
          Dosya kütüphanenden ve bu bilgisayardaki kopyasından silinir; favori ve mikser ayarları da gider. Bilgisayarındaki asıl dosyaya dokunulmaz.
        </Onay>
      )}
    </div>
  );
}

function SatirOgesi({ s, favori, onSil }: { s: Satir; favori: boolean; onSil: () => void }) {
  return (
    <li className="group grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-line/60 px-4 py-2.5 transition last:border-b-0 hover:bg-ink/[0.035] md:grid-cols-[2rem_minmax(0,1fr)_minmax(0,12rem)_8.5rem_4.5rem_3.5rem_2rem]">
      <button
        type="button"
        onClick={() => favoriDegistir(s.id)}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-ink/[0.08] ${favori ? "text-text" : "text-muted/60 hover:text-text"}`}
        aria-pressed={favori}
        aria-label={favori ? `${s.baslik}: favorilerden çıkar` : `${s.baslik}: favorilere ekle`}
        title={favori ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        <Star size={16} fill={favori ? "currentColor" : "none"} />
      </button>
      <Link href={s.href} className="flex min-w-0 items-center gap-3 py-0.5">
        <UygulamaSimgesi simge={s.dosya ? { glif: "nota-kagidi", renk: "grafit" } : turSimgesi(s.tur)} boyut={32} />
        <span className="min-w-0">
          <span className="block truncate text-[17px] font-semibold leading-snug group-hover:underline">{s.baslik}</span>
          <span className="block truncate text-sm text-muted">
            {s.alt}
            {s.dosya ? " · Benim dosyam" : ` · ${s.tur}`}
            {s.ton ? ` · ${s.ton}` : ""}
          </span>
        </span>
      </Link>
      <span className="col-start-2 flex flex-wrap items-center gap-2 text-muted md:col-start-auto" title={s.aileler.map((a) => AILELER.find((x) => x.id === a)!.ad).join(", ")}>
        {s.aileler.map((a) => (
          <EnstrumanSimgesi key={a} simge={AILELER.find((x) => x.id === a)!.simge} size={16} />
        ))}
        <span className="text-xs tabular-nums">{s.izSayisi} track</span>
      </span>
      <span className="hidden md:block">{s.seviye ? <SeviyeEtiketi level={s.seviye} /> : <span className="text-xs text-muted">—</span>}</span>
      <span className="hidden text-right text-sm tabular-nums text-muted md:block">
        {s.tempo} <span className="text-xs">BPM</span>
      </span>
      <span className="hidden text-right text-sm tabular-nums text-muted md:block">{sure(s.sureSn)}</span>
      <span className="row-start-1 flex justify-end md:row-start-auto">
        {s.dosya && (
          <button type="button" onClick={onSil} className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-ink/[0.08] hover:text-bad" aria-label={`${s.baslik}: sil`} title="Kütüphaneden sil">
            <Trash2 size={15} />
          </button>
        )}
      </span>
    </li>
  );
}

/** Basit onay penceresi */
export function Onay({ baslik, children, onEvet, onIptal }: { baslik: string; children: ReactNode; onEvet: () => void; onIptal: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={baslik} onClick={onIptal} onKeyDown={(e) => e.key === "Escape" && onIptal()}>
      <div className="bg-elevated w-full max-w-md rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-pop)]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[19px] font-semibold">{baslik}</h2>
        <p className="mt-2 text-sm text-muted">{children}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onIptal} className="btn-secondary px-4 py-2 text-sm" autoFocus>
            Vazgeç
          </button>
          <button type="button" onClick={onEvet} className="rounded-full bg-bad px-4 py-2 text-sm font-semibold text-bad-ink hover:opacity-90" data-onay-sil>
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}
