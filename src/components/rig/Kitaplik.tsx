"use client";

// Ekipman kitaplığı: kategori sekmeleri, arama, "Ekipmanım" filtresi; kartlar zincire sürüklenir ya da tıklanınca eklenir.
// Zincirdeki bir düğüm buraya bırakılırsa zincirden kalkar.
import { useMemo, useState, type DragEvent } from "react";
import { Camera, Pencil, Plus, Search, Star, X } from "lucide-react";
import EkipmanCizimi from "./Cizimler";
import s from "./Rig.module.css";
import { VERI_TURU, type Kaynak } from "./Zincir";
import { CIZIMLER, KATALOG, KATEGORILER, type Ekipman, type Kategori, type RigDepo } from "@/lib/rig-cekirdek";

type Sekme = Kategori | "hepsi";

const kucult = (x: string) => x.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");

export default function Kitaplik({
  depo,
  kaynak,
  setKaynak,
  onEkle,
  onKaldir,
  onYeni,
  onDuzenle,
}: {
  depo: RigDepo;
  kaynak: Kaynak;
  setKaynak: (k: Kaynak) => void;
  onEkle: (e: Ekipman) => void;
  onKaldir: (dugumId: string) => void;
  onYeni: () => void;
  onDuzenle: (e: Ekipman) => void;
}) {
  const [sekme, setSekme] = useState<Sekme>("pedal");
  const [q, setQ] = useState("");
  const [benim, setBenim] = useState(false);
  const [uzerinde, setUzerinde] = useState(false);

  const hepsi = useMemo(() => [...depo.ekipman, ...KATALOG], [depo.ekipman]);
  const liste = useMemo(() => {
    const k = kucult(q.trim());
    return hepsi.filter(
      (e) =>
        (sekme === "hepsi" || CIZIMLER[e.cizim].kategori === sekme) &&
        (!benim || e.benim) &&
        (!k || kucult(`${e.ad} ${CIZIMLER[e.cizim].ad}`).includes(k)),
    );
  }, [hepsi, sekme, benim, q]);
  const sayi = (k: Sekme) => hepsi.filter((e) => (k === "hepsi" || CIZIMLER[e.cizim].kategori === k) && (!benim || e.benim)).length;

  const dugumSurukleniyor = kaynak?.tur === "dugum" && !kaynak.paralel;
  const ustunde = (e: DragEvent) => {
    if (!dugumSurukleniyor) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setUzerinde(true);
  };

  const sekmeler: { id: Sekme; ad: string }[] = [{ id: "hepsi", ad: "Tümü" }, ...KATEGORILER.map((k) => ({ id: k.id, ad: k.ad }))];

  return (
    <section
      id="kitaplik"
      aria-label="Ekipman kitaplığı"
      className={`card relative flex min-h-0 flex-col p-4 transition ${dugumSurukleniyor ? s.cop : ""}`}
      data-uzerinde={uzerinde ? "1" : undefined}
      onDragOver={ustunde}
      onDragEnter={ustunde}
      onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setUzerinde(false)}
      onDrop={(e) => {
        e.preventDefault();
        setUzerinde(false);
        if (kaynak?.tur === "dugum" && !kaynak.paralel) onKaldir(kaynak.id);
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[19px] font-semibold">Kitaplık</h2>
        <button type="button" onClick={onYeni} className="btn-secondary px-3 py-1 text-[13px]">
          <Plus size={14} aria-hidden /> Ekipman ekle
        </button>
      </div>

      <div role="tablist" aria-label="Kategori" className="mt-3 flex flex-wrap gap-1">
        {sekmeler.map((k) => (
          <button
            key={k.id}
            type="button"
            role="tab"
            aria-selected={sekme === k.id}
            aria-controls="kitaplik-izgara"
            onClick={() => setSekme(k.id)}
            className={`rounded-full px-3 py-1 text-[13px] transition ${sekme === k.id ? "bg-accent font-semibold text-accent-ink" : "bg-ink/[0.05] text-text hover:bg-ink/10"}`}
          >
            {k.ad} <span className="opacity-60">{sayi(k.id)}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-ink/10 bg-ink/[0.05] px-3 focus-within:border-accent">
          <Search size={15} className="text-muted" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara: delay, amfi, Les Paul…" aria-label="Ekipman ara" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Aramayı temizle" className="text-muted hover:text-text">
              <X size={14} />
            </button>
          )}
        </label>
        <button
          type="button"
          aria-pressed={benim}
          onClick={() => setBenim((v) => !v)}
          className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] transition ${benim ? "bg-accent font-semibold text-accent-ink" : "bg-ink/[0.05] hover:bg-ink/10"}`}
        >
          <Star size={14} aria-hidden fill={benim ? "currentColor" : "none"} /> Ekipmanım
        </button>
      </div>

      {dugumSurukleniyor && <p className="mt-3 rounded-lg py-2 text-center text-sm font-semibold">Zincirden kaldırmak için buraya bırak</p>}

      <div id="kitaplik-izgara" role="tabpanel" className="-mx-1 mt-3 grid max-h-[460px] min-h-[180px] grid-cols-3 content-start gap-2 overflow-y-auto px-1 pb-1">
        {liste.map((e) => (
          <div key={e.id} className={s.kart}>
            <button
              type="button"
              draggable
              onClick={() => onEkle(e)}
              onDragStart={(ev) => {
                ev.dataTransfer.setData(VERI_TURU, e.id);
                ev.dataTransfer.setData("text/plain", e.ad);
                ev.dataTransfer.effectAllowed = "copy";
                setKaynak({ tur: "ekipman", id: e.id });
              }}
              onDragEnd={() => setKaynak(null)}
              className="block w-full cursor-grab rounded-[10px] active:cursor-grabbing"
              aria-label={`${e.ad} (${CIZIMLER[e.cizim].ad}): zincire ekle`}
              title={`${e.ad} · ${CIZIMLER[e.cizim].ad}\nTıkla ya da zincire sürükle`}
            >
              <span className={s.resim}>
                <EkipmanCizimi cizim={e.cizim} renk={e.renk} golge={false} />
              </span>
              <span className={`${s.etiket} block`}>{e.ad}</span>
              <span className="block truncate text-[10.5px] text-muted">{CIZIMLER[e.cizim].ad}</span>
            </button>
            {(e.benim || e.fotoId) && (
              <span className="pointer-events-none absolute left-1.5 top-1.5 flex gap-0.5 text-accent" aria-hidden>
                {e.benim && <Star size={11} fill="currentColor" />}
                {e.fotoId && <Camera size={11} />}
              </span>
            )}
            {e.ozel && (
              <button type="button" onClick={() => onDuzenle(e)} className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full text-muted hover:bg-ink/10 hover:text-text" aria-label={`${e.ad}: düzenle`} title="Düzenle">
                <Pencil size={12} />
              </button>
            )}
          </div>
        ))}
        {!liste.length && <p className="col-span-3 py-8 text-center text-sm text-muted">{benim ? "Bu kategoride ekipmanın yok. “Ekipman ekle” ile kendininkini ekle." : "Eşleşen ekipman yok."}</p>}
      </div>
    </section>
  );
}
