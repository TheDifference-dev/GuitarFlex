"use client";

// Rig'im sayfası: üstte sahne (seçili düğümün büyük görseli) ve sağda kitaplık; altta sinyal zinciri; rig'ler arasında
// geçiş, adlandırma, kopyalama, dışa/içe aktarma (JSON) ve PNG. Yalnız görsel bir oyuncak: ses işlenmez.
import { useRef, useState, type KeyboardEvent } from "react";
import { Copy, Eraser, FileJson, GitFork, ImageDown, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import BuyukPanel from "./BuyukPanel";
import EkipmanFormu from "./EkipmanFormu";
import Kitaplik from "./Kitaplik";
import RigAfis, { indir, pngIndir } from "./RigAfis";
import Zincir, { type Kaynak } from "./Zincir";
import s from "./Rig.module.css";
import {
  ANA, CIZIMLER, ayarla, disaAktar, donguAc, donguKapat, dugumBul, ekipmanBul, ekipmanKaydet, ekipmanSil, ekle, gecis, iceAktar, kapAdi, kaydir,
  konumBul, liste, oneriIndeksi, ornekZincir, paralelBlok, paralelEkle, paralelKaldir, rigAdlandir, rigEkle, rigGuncelle, rigIsle, rigKopyala, rigSec, rigSil,
  seciliRig, sil, tasi, useRigDepo, fotoSil, type Ekipman, type Kap, type Rig,
} from "@/lib/rig";

const araclar = "inline-flex h-8 items-center gap-1.5 rounded-full bg-ink/[0.06] px-3 text-[13px] transition hover:bg-ink/10 disabled:opacity-40";
const dosyaAdi = (ad: string) => ad.toLocaleLowerCase("tr").replace(/[^a-z0-9çğıöşü]+/gi, "-").replace(/^-|-$/g, "") || "rig";

function Onay({ baslik, metin, evet, onEvet, onIptal }: { baslik: string; metin: string; evet: string; onEvet: () => void; onIptal: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onIptal}>
      <div role="alertdialog" aria-modal="true" aria-label={baslik} className="bg-elevated w-full max-w-md rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-pop)]" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === "Escape" && onIptal()}>
        <h2 className="text-[19px] font-semibold">{baslik}</h2>
        <p className="mt-2 text-sm text-muted">{metin}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onIptal} className="btn-secondary px-4 py-2 text-sm" autoFocus>
            Vazgeç
          </button>
          <button type="button" onClick={onEvet} className="rounded-full bg-bad px-4 py-2 text-sm font-semibold text-bad-ink hover:opacity-90">
            {evet}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RigSayfasi() {
  const depo = useRigDepo();
  const rig = seciliRig(depo);
  const [secili, setSecili] = useState<string | null>(null);
  const [kaynak, setKaynak] = useState<Kaynak>(null);
  const [duyuru, setDuyuru] = useState("");
  const [form, setForm] = useState<{ ilk: Ekipman | null } | null>(null);
  const [onay, setOnay] = useState<{ baslik: string; metin: string; evet: string; f: () => void } | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const afis = useRef<SVGSVGElement>(null);
  const dosya = useRef<HTMLInputElement>(null);

  const bul = (id: string) => ekipmanBul(depo, id);
  const ad = (id: string) => bul(id)?.ad ?? "Ekipman";
  const seciliDugum = secili ? dugumBul(rig, secili) : null;
  const sira = (ekipmanId: string) => CIZIMLER[bul(ekipmanId)?.cizim ?? "boost"].sira;

  const rigDegis = (f: (r: Rig) => Rig) => rigIsle((d) => rigGuncelle(d, d.seciliRig, f));
  const odakla = (id: string) => requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-dugum="${id}"]`)?.focus());

  /** Konumu kullanıcıya okunur biçimde (ekran okuyucu duyurusu) */
  const konumMetni = (r: Rig, id: string) => {
    const k = konumBul(r, id);
    return k ? `${kapAdi(r, k.kap, (d) => ad(d.ekipmanId))}, ${k.indeks + 1}. sıra` : "";
  };

  /** Seçili rig'i verilen hâliyle yazar (işlemler bu render'daki rig üzerinden hesaplanır) */
  const rigYaz = (yeni: Rig) => yeni !== rig && rigIsle((d) => rigGuncelle(d, rig.id, () => yeni));

  const ekipmanEkle = (e: Ekipman) => {
    // Seçili düğüm varsa onun arkasına (aynı yol / döngü), yoksa türün olağan yerine
    const k = secili ? konumBul(rig, secili) : null;
    let res = k ? ekle(rig, e.id, k.kap, k.indeks + 1) : ekle(rig, e.id, ANA, oneriIndeksi(rig, CIZIMLER[e.cizim].sira, (d) => sira(d.ekipmanId)));
    if (!res.id) res = ekle(rig, e.id);
    rigYaz(res.rig);
    if (res.id) {
      setSecili(res.id);
      setDuyuru(`${e.ad} zincire eklendi: ${konumMetni(res.rig, res.id)}`);
    }
  };

  const birak = (kap: Kap, indeks: number) => {
    const k = kaynak;
    setKaynak(null);
    if (!k) return;
    if (k.tur === "ekipman") {
      const res = ekle(rig, k.id, kap, indeks);
      rigYaz(res.rig);
      if (res.id) {
        setSecili(res.id);
        setDuyuru(`${ad(k.id)} eklendi: ${konumMetni(res.rig, res.id)}`);
      }
    } else {
      rigDegis((r) => tasi(r, k.id, kap, indeks));
      if (!k.paralel) setSecili(k.id);
    }
  };

  const dugumSil = (id: string) => {
    const d = dugumBul(rig, id);
    const l = konumBul(rig, id);
    rigDegis((r) => sil(r, id));
    setDuyuru(`${d ? ad(d.ekipmanId) : "Paralel yol"} zincirden kaldırıldı`);
    if (secili === id) setSecili(null);
    // Odak komşu düğüme geçsin
    if (l) {
      const kom = liste(rig, l.kap)?.filter((x) => x.id !== id)[Math.max(0, l.indeks - 1)];
      if (kom) odakla(kom.id);
    }
  };

  const adimla = (id: string, yon: -1 | 1) => {
    const once = rig;
    const sonra = kaydir(once, id, yon);
    if (sonra === once) {
      setDuyuru(yon < 0 ? "Zaten en başta" : "Zaten en sonda");
      return;
    }
    rigYaz(sonra);
    setDuyuru(`${ad(dugumBul(sonra, id)?.ekipmanId ?? "")}: ${konumMetni(sonra, id)}`);
    odakla(id);
  };

  const dugumTus = (e: KeyboardEvent, id: string) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      setSecili(id);
      adimla(id, e.key === "ArrowLeft" ? -1 : 1);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      dugumSil(id);
    } else if (e.key === "Escape") setSecili(null);
  };

  const paralel = paralelBlok(rig);
  const paralelDegis = () => {
    if (paralel) {
      rigDegis(paralelKaldir);
      setDuyuru("Paralel yol kaldırıldı; A ve B yolları ana zincire katıldı");
      return;
    }
    // Seçili ana zincir düğümünün arkasına, yoksa ilk amfinin önüne (yoksa sona)
    const k = secili ? konumBul(rig, secili) : null;
    const amfi = rig.zincir.findIndex((o) => "ekipmanId" in o && CIZIMLER[bul(o.ekipmanId)?.cizim ?? "boost"].kategori === "amfi");
    const i = k?.kap === ANA ? k.indeks + 1 : amfi >= 0 ? amfi : rig.zincir.length;
    rigDegis((r) => paralelEkle(r, i).rig);
    setDuyuru("A/B paralel yol eklendi. Ekipmanları A ya da B yoluna sürükle.");
  };

  const ornekYukle = () => {
    rigDegis((r) => ({ ...r, zincir: ornekZincir(depo) }));
    setSecili(null);
    setDuyuru("Örnek rig yüklendi");
  };

  const disaAktarJson = () => indir(new Blob([disaAktar(depo)], { type: "application/json" }), `guitarflex-rigler.json`);
  const pngAktar = async () => {
    setHata(null);
    try {
      if (afis.current) await pngIndir(afis.current, `${dosyaAdi(rig.ad)}.png`);
    } catch (e) {
      setHata((e as Error).message);
    }
  };

  const ekipmanKaydetVeKapat = (e: Ekipman) => {
    rigIsle((d) => ekipmanKaydet(d, e));
    setForm(null);
    setDuyuru(`${e.ad} kaydedildi`);
  };

  return (
    <div className="grid gap-5">
      {/* Rig seçici ve araçlar */}
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Rig'lerim" className="flex flex-wrap items-center gap-1 rounded-full bg-ink/[0.05] p-1">
          {depo.rigler.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={r.id === rig.id}
              onClick={() => {
                rigIsle((d) => rigSec(d, r.id));
                setSecili(null);
              }}
              className={`rounded-full px-3.5 py-1 text-[13px] transition ${r.id === rig.id ? "bg-seg font-semibold text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`}
            >
              {r.ad}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              rigIsle((d) => rigEkle(d, "Yeni rig"));
              setSecili(null);
              setDuyuru("Yeni rig oluşturuldu");
            }}
            className="flex size-7 items-center justify-center rounded-full text-muted hover:bg-ink/10 hover:text-text"
            aria-label="Yeni rig"
            title="Yeni rig"
          >
            <Plus size={15} />
          </button>
        </div>
        <label className="flex h-9 min-w-[180px] flex-1 items-center gap-2 rounded-full border border-ink/10 px-3.5 text-[13px] focus-within:border-accent sm:max-w-[260px]">
          <span className="text-muted">Ad</span>
          <input key={rig.id} defaultValue={rig.ad} maxLength={60} aria-label="Rig adı" className="min-w-0 flex-1 bg-transparent font-semibold outline-none" onBlur={(e) => rigIsle((d) => rigAdlandir(d, rig.id, e.target.value))} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" className={araclar} onClick={() => (rigIsle((d) => rigKopyala(d, rig.id)), setSecili(null))}>
            <Copy size={13} aria-hidden /> Kopyala
          </button>
          <button type="button" className={araclar} onClick={() => setOnay({ baslik: `“${rig.ad}” silinsin mi?`, metin: "Bu rig ve zinciri silinir. Ekipman kitaplığın olduğu gibi kalır.", evet: "Sil", f: () => (rigIsle((d) => rigSil(d, rig.id)), setSecili(null)) })}>
            <Trash2 size={13} aria-hidden /> Sil
          </button>
          <button type="button" className={araclar} onClick={disaAktarJson} title="Bütün rig'ler ve ekipmanın (fotoğraflar hariç)">
            <FileJson size={13} aria-hidden /> Dışa aktar
          </button>
          <button type="button" className={araclar} onClick={() => dosya.current?.click()}>
            <Upload size={13} aria-hidden /> İçe aktar
          </button>
          <button type="button" className={araclar} onClick={pngAktar}>
            <ImageDown size={13} aria-hidden /> PNG
          </button>
          <input
            ref={dosya}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setHata(null);
              try {
                const metin = await f.text();
                let n = 0;
                rigIsle((d) => {
                  const r = iceAktar(d, metin);
                  n = r.rigSayisi;
                  return r.depo;
                });
                setSecili(null);
                setDuyuru(`${n} rig içe aktarıldı`);
              } catch (err) {
                setHata((err as Error).message);
              }
            }}
          />
        </div>
      </div>
      {hata && (
        <p role="alert" className="-mt-2 text-sm text-bad">
          {hata}
        </p>
      )}

      <div id="rig-sahne" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <BuyukPanel
          rig={rig}
          dugum={seciliDugum}
          bul={bul}
          onAyar={(a, v) => secili && rigDegis((r) => ayarla(r, secili, a, v))}
          onGecis={() => secili && rigDegis((r) => gecis(r, secili))}
          onKaydir={(yon) => secili && adimla(secili, yon)}
          onSil={() => secili && dugumSil(secili)}
          onDongu={() => {
            if (!secili || !seciliDugum) return;
            rigDegis((r) => (seciliDugum.dongu ? donguKapat(r, secili) : donguAc(r, secili)));
            setDuyuru(seciliDugum.dongu ? "FX loop kapatıldı; efektler amfinin arkasına geçti" : "FX loop açıldı. Efektleri amfinin altındaki döngüye sürükle.");
          }}
          onTasi={(kap) => {
            if (!secili) return;
            const n = liste(rig, kap)?.length ?? 0;
            rigDegis((r) => tasi(r, secili, kap, n));
            odakla(secili);
          }}
          onDuzenle={(e) => setForm({ ilk: e })}
          onKapat={() => setSecili(null)}
          onOrnek={ornekYukle}
        />
        <Kitaplik depo={depo} kaynak={kaynak} setKaynak={setKaynak} onEkle={ekipmanEkle} onKaldir={dugumSil} onYeni={() => setForm({ ilk: null })} onDuzenle={(e) => setForm({ ilk: e })} />
      </div>

      {/* Sinyal zinciri */}
      <section aria-labelledby="zincir-baslik" className={s.zincirKutu}>
        <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
          <h2 id="zincir-baslik" className="text-[19px] font-semibold">
            Sinyal zinciri
          </h2>
          <span className="text-[12px] text-muted">Sürükle-bırak ile sırala · seçiliyken ←/→ taşır, Delete kaldırır</span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {!rig.zincir.length && (
              <button type="button" className={araclar} onClick={ornekYukle}>
                <Sparkles size={13} aria-hidden /> Örnek rig&apos;i yükle
              </button>
            )}
            <button type="button" className={araclar} onClick={paralelDegis} aria-pressed={!!paralel}>
              <GitFork size={13} aria-hidden className="rotate-90" /> {paralel ? "Paralel yolu kaldır" : "A/B paralel yol"}
            </button>
            {rig.zincir.length > 0 && (
              <button type="button" className={araclar} onClick={() => setOnay({ baslik: "Zincir boşaltılsın mı?", metin: `“${rig.ad}” rig'indeki bütün ekipman zincirden kalkar.`, evet: "Boşalt", f: () => (rigDegis((r) => ({ ...r, zincir: [] })), setSecili(null)) })}>
                <Eraser size={13} aria-hidden /> Boşalt
              </button>
            )}
          </div>
        </div>
        <Zincir rig={rig} bul={bul} secili={secili} kaynak={kaynak} setKaynak={setKaynak} onSec={setSecili} onBirak={birak} onTus={dugumTus} />
      </section>

      <p className="sr-only" aria-live="polite">
        {duyuru}
      </p>

      {/* PNG için tam afiş (görünmez) */}
      <div className="hidden" aria-hidden>
        <RigAfis ref={afis} rig={rig} bul={bul} />
      </div>

      {form && (
        <EkipmanFormu
          ilk={form.ilk}
          onKaydet={ekipmanKaydetVeKapat}
          onSil={(e) =>
            setOnay({
              baslik: `“${e.ad}” silinsin mi?`,
              metin: "Ekipman kitaplıktan ve onu kullanan bütün rig'lerden kalkar.",
              evet: "Sil",
              f: () => {
                if (e.fotoId) void fotoSil(e.fotoId);
                rigIsle((d) => ekipmanSil(d, e.id));
                setForm(null);
                setSecili(null);
              },
            })
          }
          onKapat={() => setForm(null)}
        />
      )}
      {onay && (
        <Onay
          baslik={onay.baslik}
          metin={onay.metin}
          evet={onay.evet}
          onEvet={() => {
            onay.f();
            setOnay(null);
          }}
          onIptal={() => setOnay(null)}
        />
      )}
    </div>
  );
}
