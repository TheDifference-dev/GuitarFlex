"use client";

// Sinyal zinciri şeridi (AmpliTube'daki alt şerit gibi): giriş → düğümler → mikser → çıkış. Düğümler küçük çizimlerle;
// sürükle-bırak ile ekleme / sıralama / yollara ve FX loop'a taşıma; klavyede ←/→ taşır, Delete siler.
import { useState, type DragEvent, type KeyboardEvent, type ReactNode } from "react";
import { AudioLines, Cable, SlidersVertical } from "lucide-react";
import EkipmanCizimi from "./Cizimler";
import s from "./Rig.module.css";
import { ANA, CIZIMLER, donguKapiMi, kapA, kapB, kapDongu, paralelMi, type Dugum, type Ekipman, type Kap, type Paralel, type Rig } from "@/lib/rig-cekirdek";

export type Kaynak = { tur: "ekipman"; id: string } | { tur: "dugum"; id: string; dongulu: boolean; paralel: boolean } | null;

type Ortak = {
  rig: Rig;
  bul: (id: string) => Ekipman | null;
  secili: string | null;
  kaynak: Kaynak;
  setKaynak: (k: Kaynak) => void;
  onSec: (id: string) => void;
  onBirak: (kap: Kap, indeks: number) => void;
  onTus: (e: KeyboardEvent, id: string) => void;
};

export const VERI_TURU = "application/x-guitarflex-rig";

function Yuva({ o, kap, indeks, uzun = false, children }: { o: Ortak; kap: Kap; indeks: number; uzun?: boolean; children?: ReactNode }) {
  const [uzerinde, setUzerinde] = useState(false);
  const k = o.kaynak;
  const kabul = !!k && !(k.tur === "dugum" && ((k.paralel && kap !== ANA) || (donguKapiMi(kap) && (k.dongulu || kap === kapDongu(k.id)))));
  const ustunde = (e: DragEvent) => {
    if (!kabul) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = k?.tur === "ekipman" ? "copy" : "move";
    if (!uzerinde) setUzerinde(true);
  };
  return (
    <div
      className={`${s.kablo} ${uzun ? s.uzun : ""}`}
      data-yuva={kabul ? "" : undefined}
      data-uzerinde={uzerinde && kabul ? "1" : undefined}
      onDragOver={ustunde}
      onDragEnter={ustunde}
      onDragLeave={() => setUzerinde(false)}
      onDrop={(e) => {
        e.preventDefault();
        setUzerinde(false);
        if (kabul) o.onBirak(kap, indeks);
      }}
    >
      {children}
    </div>
  );
}

function DugumKarti({ o, d }: { o: Ortak; d: Dugum }) {
  const e = o.bul(d.ekipmanId);
  const cizim = e?.cizim ?? "boost";
  const ad = e?.ad ?? "Silinmiş ekipman";
  const tasiniyor = o.kaynak?.tur === "dugum" && o.kaynak.id === d.id;
  return (
    <button
      type="button"
      draggable
      data-dugum={d.id}
      aria-pressed={o.secili === d.id}
      aria-label={`${ad}${d.kapali ? " (kapalı)" : ""}. Taşımak için sol/sağ ok, silmek için Delete.`}
      title={ad}
      data-kapali={d.kapali ? "1" : undefined}
      data-tasiniyor={tasiniyor ? "1" : undefined}
      className={s.dugum}
      onClick={() => o.onSec(d.id)}
      onKeyDown={(ev) => o.onTus(ev, d.id)}
      onDragStart={(ev) => {
        ev.dataTransfer.setData(VERI_TURU, d.id);
        ev.dataTransfer.setData("text/plain", ad);
        ev.dataTransfer.effectAllowed = "move";
        o.setKaynak({ tur: "dugum", id: d.id, dongulu: !!d.dongu, paralel: false });
      }}
      onDragEnd={() => o.setKaynak(null)}
    >
      <span className={s.resim}>
        <EkipmanCizimi cizim={cizim} renk={e?.renk ?? "#555555"} degerler={CIZIMLER[cizim].dugmeler.map((a) => d.ayar[a] ?? 5)} acik={!d.kapali} golge={false} />
      </span>
      <span className={s.etiket}>{ad}</span>
    </button>
  );
}

/** Düğüm listesi: araya bırakma yuvaları ve kablo; amfinin döngüsü altında */
function Liste({ o, l, kap, bosMetin }: { o: Ortak; l: Dugum[]; kap: Kap; bosMetin?: string }) {
  return (
    <div className={s.satir}>
      <Yuva o={o} kap={kap} indeks={0} uzun={!l.length}>
        {!l.length && bosMetin && <span className={s.ipucu}>{bosMetin}</span>}
      </Yuva>
      {l.map((d, i) => (
        <DugumVeDongu key={d.id} o={o} d={d} son={i === l.length - 1} kap={kap} indeks={i} />
      ))}
    </div>
  );
}

function DugumVeDongu({ o, d, son, kap, indeks }: { o: Ortak; d: Dugum; son: boolean; kap: Kap; indeks: number }) {
  return (
    <>
      {d.dongu ? (
        <div className={s.amfiSutun}>
          <DugumKarti o={o} d={d} />
          <div className={s.dongu} role="group" aria-label={`${o.bul(d.ekipmanId)?.ad ?? "Amfi"} efekt döngüsü (FX loop)`}>
            <span className={s.donguBaslik}>
              FX loop <span>gönder → dönüş</span>
            </span>
            <Liste o={o} l={d.dongu} kap={kapDongu(d.id)} bosMetin="Efekt bırak" />
          </div>
        </div>
      ) : (
        <DugumKarti o={o} d={d} />
      )}
      <Yuva o={o} kap={kap} indeks={indeks + 1} uzun={son && kap === ANA} />
    </>
  );
}

function ParalelBlok({ o, p }: { o: Ortak; p: Paralel }) {
  return (
    <div
      className={s.paralel}
      role="group"
      aria-label="A/B paralel yol"
      draggable
      onDragStart={(ev) => {
        if ((ev.target as HTMLElement).closest("[data-dugum]")) return;
        ev.dataTransfer.setData(VERI_TURU, p.id);
        ev.dataTransfer.setData("text/plain", "Paralel yol");
        o.setKaynak({ tur: "dugum", id: p.id, dongulu: false, paralel: true });
      }}
      onDragEnd={() => o.setKaynak(null)}
    >
      <div className={`${s.yol} ${s.yolA}`}>
        <span className={s.yolEtiket}>A</span>
        <Liste o={o} l={p.a} kap={kapA(p.id)} bosMetin="Doğrudan (boş yol)" />
      </div>
      <div className={`${s.yol} ${s.yolB}`}>
        <span className={s.yolEtiket}>B</span>
        <Liste o={o} l={p.b} kap={kapB(p.id)} bosMetin="Doğrudan (boş yol)" />
      </div>
    </div>
  );
}

function Uc({ ad, children }: { ad: string; children: ReactNode }) {
  return (
    <div className={s.uc} aria-hidden>
      <span className={s.ucSimge}>{children}</span>
      {ad}
    </div>
  );
}

export default function Zincir(o: Ortak) {
  const z = o.rig.zincir;
  return (
    <div className={`${o.kaynak ? s.surukleniyor : ""} overflow-x-auto px-4 pb-4 pt-5`}>
      <div className={`${s.satir} min-w-max`}>
        <Uc ad="Giriş">
          <Cable size={16} />
        </Uc>
        <Yuva o={o} kap={ANA} indeks={0} uzun={!z.length}>
          {!z.length && <span className={s.ipucu}>Kitaplıktan ekipman sürükle ya da bir ekipmana tıkla</span>}
        </Yuva>
        {z.map((x, i) =>
          paralelMi(x) ? (
            <div key={x.id} className="contents">
              <ParalelBlok o={o} p={x} />
              <Yuva o={o} kap={ANA} indeks={i + 1} uzun={i === z.length - 1} />
            </div>
          ) : (
            <DugumVeDongu key={x.id} o={o} d={x} son={i === z.length - 1} kap={ANA} indeks={i} />
          ),
        )}
        <Uc ad="Mikser">
          <SlidersVertical size={16} />
        </Uc>
        <div className={s.kablo} />
        <Uc ad="Çıkış">
          <AudioLines size={16} />
        </Uc>
      </div>
    </div>
  );
}
