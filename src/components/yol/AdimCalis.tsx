"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Headphones, RotateCcw, Volume2 } from "lucide-react";
import type { YolAdim } from "@/lib/alistirma/tipler";
import { soruListesi, type Soru } from "@/lib/alistirma/sorular";
import { cal, vurusPuani, vurusZamani } from "@/lib/alistirma/ritim";
import { simdi } from "@/lib/ses";
import { saveStep } from "@/lib/progress";
import SapSoru from "./SapSoru";
import AkorKutusu from "./AkorKutusu";
import RitimYazi from "./RitimYazi";

type Sonuc = { puan: number; tam: boolean; vurus?: number };
type Props = { yol: string; adim: YolAdim; sonraki?: { kod: string; ad: string }; geri?: string };

const btn = "rounded-lg px-4 py-2 font-semibold transition disabled:opacity-40";
const btnAna = `${btn} bg-accent text-accent-ink hover:brightness-110`;
const btnIkincil = `${btn} border border-line bg-panel hover:border-accent`;

export default function AdimCalis({ yol, adim, sonraki, geri }: Props) {
  const [sorular, setSorular] = useState<Soru[] | null>(null);
  const [i, setI] = useState(0);
  const [sonuclar, setSonuclar] = useState<Sonuc[]>([]);
  const [bitti, setBitti] = useState(false);

  const basla = () => {
    setSorular(soruListesi(adim.alistirma, adim.soru));
    setI(0);
    setSonuclar([]);
    setBitti(false);
  };

  const cevapla = (s: Sonuc) => setSonuclar((x) => [...x, s]);
  const devam = () => {
    if (!sorular) return;
    if (i + 1 >= sorular.length) setBitti(true);
    else setI(i + 1);
  };

  if (!sorular) {
    return (
      <div className="space-y-4 rounded-2xl border border-line bg-panel p-6">
        <p className="text-muted">
          {adim.soru} soru · Geçmek için en az %{adim.gecme.dogruluk} doğruluk
          {adim.gecme.vurus ? `, %${adim.gecme.vurus} vuruş puanı` : ""} ve %{adim.gecme.secim} tam doğru cevap gerekir.
        </p>
        {yol === "kulak" || yol === "ritim" ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Headphones size={16} /> Bu adımda ses var; kulaklık ya da hoparlör açık olsun.
          </p>
        ) : null}
        <button type="button" onClick={basla} className={btnAna}>
          Başla
        </button>
      </div>
    );
  }

  if (bitti) return <Ozet yol={yol} adim={adim} sonuclar={sonuclar} sonraki={sonraki} tekrar={basla} geri={geri} />;

  const soru = sorular[i];
  const cevaplandi = sonuclar.length > i;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="tabular-nums">
          Soru {i + 1} / {sorular.length}
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-panel">
          <div className="h-full bg-accent transition-all" style={{ width: `${((i + (cevaplandi ? 1 : 0)) / sorular.length) * 100}%` }} />
        </div>
        <span className="tabular-nums">{sonuclar.filter((s) => s.tam).length} tam doğru</span>
      </div>
      <SoruGoster key={i} soru={soru} otomatikSes={yol === "kulak"} cevaplandi={cevaplandi} sonuc={sonuclar[i]} onCevap={cevapla} onDevam={devam} son={i + 1 >= sorular.length} />
    </div>
  );
}

function SoruGoster({
  soru, otomatikSes, cevaplandi, sonuc, onCevap, onDevam, son,
}: { soru: Soru; otomatikSes: boolean; cevaplandi: boolean; sonuc?: Sonuc; onCevap: (s: Sonuc) => void; onDevam: () => void; son: boolean }) {
  const [secim, setSecim] = useState<string | null>(null);
  const [secili, setSecili] = useState<string[]>([]);

  useEffect(() => {
    if (otomatikSes && soru.tip !== "ritim" && soru.ses) soru.ses();
  }, [otomatikSes, soru]);

  useEffect(() => {
    if (!cevaplandi) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") onDevam();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cevaplandi, onDevam]);

  const dinle = soru.tip !== "ritim" && soru.ses ? (
    <button type="button" onClick={soru.ses} className={`${btnIkincil} inline-flex items-center gap-2 text-sm`}>
      <Volume2 size={16} /> {otomatikSes ? "Tekrar dinle" : "Sesi dinle"}
    </button>
  ) : null;

  const geribildirim = cevaplandi && sonuc ? (
    <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${sonuc.tam ? "border-emerald-500/60 bg-emerald-500/10" : "border-rose-500/60 bg-rose-500/10"}`}>
      <div>
        <p className="font-semibold">
          {sonuc.tam ? "Doğru!" : sonuc.puan > 0 ? `Kısmen doğru (%${Math.round(sonuc.puan * 100)})` : "Yanlış"}
          {sonuc.vurus !== undefined ? ` · Vuruş puanı %${sonuc.vurus}` : ""}
        </p>
        {soru.tip !== "ritim" && soru.aciklama ? <p className="text-sm text-muted">{soru.aciklama}</p> : null}
      </div>
      <button type="button" onClick={onDevam} className={btnAna} autoFocus>
        {son ? "Sonucu gör" : "Devam"} ↵
      </button>
    </div>
  ) : null;

  if (soru.tip === "ritim") return <RitimSoruGoster soru={soru} cevaplandi={cevaplandi} onCevap={onCevap} geribildirim={geribildirim} />;

  if (soru.tip === "secim") {
    const sec = (id: string) => {
      if (cevaplandi) return;
      setSecim(id);
      const ok = id === soru.dogru;
      onCevap({ puan: ok ? 1 : 0, tam: ok });
    };
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{soru.metin}</h2>
          {dinle}
        </div>
        {soru.sap ? <SapSoru sap={soru.sap} kilitli /> : null}
        {soru.diyagram ? (
          <div className="flex justify-center rounded-xl border border-line bg-panel p-4">
            <AkorKutusu sekil={soru.diyagram} boyut={150} />
          </div>
        ) : null}
        <div className={`grid gap-2 ${soru.secenekler.some((o) => o.diyagram) ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-2"}`}>
          {soru.secenekler.map((o) => {
            const dogru = cevaplandi && o.id === soru.dogru;
            const yanlis = cevaplandi && o.id === secim && o.id !== soru.dogru;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => sec(o.id)}
                disabled={cevaplandi}
                className={`flex items-center justify-center rounded-xl border p-3 text-left font-medium transition ${
                  dogru ? "border-emerald-500 bg-emerald-500/15" : yanlis ? "border-rose-500 bg-rose-500/15" : "border-line bg-panel hover:border-accent"
                } disabled:cursor-default`}
              >
                {o.diyagram ? <AkorKutusu sekil={o.diyagram} /> : o.ad}
              </button>
            );
          })}
        </div>
        {geribildirim}
      </div>
    );
  }

  // Sap sorusu
  const kontrol = (sec: string[]) => {
    const dogru = sec.filter((k) => soru.hedef.includes(k)).length;
    const yanlis = sec.length - dogru;
    const puan = Math.max(0, (dogru - yanlis) / soru.hedef.length);
    onCevap({ puan, tam: dogru === soru.hedef.length && yanlis === 0 });
  };
  const tik = (s: number, f: number) => {
    if (cevaplandi) return;
    const k = `${s}:${f}`;
    if (!soru.coklu) {
      setSecili([k]);
      const ok = soru.hedef.includes(k);
      onCevap({ puan: ok ? 1 : 0, tam: ok });
      return;
    }
    setSecili((x) => (x.includes(k) ? x.filter((y) => y !== k) : [...x, k]));
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{soru.metin}</h2>
        {dinle}
      </div>
      <SapSoru sap={soru.sap} secili={secili} dogrular={cevaplandi ? soru.hedef : undefined} kilitli={cevaplandi} onTik={tik} />
      {soru.coklu && !cevaplandi ? (
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => kontrol(secili)} disabled={!secili.length} className={btnAna}>
            Kontrol et
          </button>
          <span className="text-sm text-muted">
            {secili.length} / {soru.hedef.length} seçildi
          </span>
        </div>
      ) : null}
      {geribildirim}
    </div>
  );
}

type Asama = "sec" | "hazir" | "sayim" | "vur" | "bitti";

function RitimSoruGoster({
  soru, cevaplandi, onCevap, geribildirim,
}: { soru: Extract<Soru, { tip: "ritim" }>; cevaplandi: boolean; onCevap: (s: Sonuc) => void; geribildirim: React.ReactNode }) {
  const [secim, setSecim] = useState<string | null>(null);
  const [asama, setAsama] = useState<Asama>("sec");
  const [vurusSayi, setVurusSayi] = useState(0);
  const vuruslar = useRef<number[]>([]);
  const bas = useRef(0);
  const zaman = useRef<number[]>([]);

  const dinle = useCallback(() => {
    cal(soru.desen, soru.bpm, soru.olcu, true);
  }, [soru]);

  useEffect(() => {
    dinle();
    const t = zaman.current;
    return () => t.forEach(clearTimeout);
  }, [dinle]);

  const vur = useCallback(() => {
    if (asama !== "vur" && asama !== "sayim") return;
    vuruslar.current.push(vurusZamani());
    setVurusSayi((n) => n + 1);
  }, [asama]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && (asama === "vur" || asama === "sayim")) {
        e.preventDefault();
        vur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [asama, vur]);

  const vurmayaBasla = () => {
    vuruslar.current = [];
    setVurusSayi(0);
    const { bas: b, bitis } = cal(soru.desen, soru.bpm, soru.olcu, false);
    bas.current = b;
    setAsama("sayim");
    const now = simdi();
    zaman.current.push(
      window.setTimeout(() => setAsama("vur"), (b - now) * 1000 - 120),
      window.setTimeout(() => {
        setAsama("bitti");
        const puan = vurusPuani(soru.desen, soru.bpm, soru.olcu, bas.current, vuruslar.current);
        const secimDogru = secim === soru.dogru;
        onCevap({ puan: (secimDogru ? 0.5 : 0) + (puan / 100) * 0.5, tam: secimDogru, vurus: puan });
      }, (bitis - now) * 1000 + 350),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          {asama === "sec" ? "Ritmi dinle ve doğru yazımı seç." : "Şimdi aynı ritmi vur: boşluk tuşu ya da büyük düğme."}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted tabular-nums">♩ = {soru.bpm}</span>
          <button type="button" onClick={dinle} disabled={asama === "sayim" || asama === "vur"} className={`${btnIkincil} inline-flex items-center gap-2 text-sm`}>
            <Volume2 size={16} /> Tekrar dinle
          </button>
        </div>
      </div>
      <div className="grid gap-2">
        {soru.secenekler.map((o, n) => {
          const dogru = secim !== null && o.id === soru.dogru;
          const yanlis = secim === o.id && o.id !== soru.dogru;
          return (
            <button
              key={o.id}
              type="button"
              disabled={secim !== null}
              onClick={() => {
                setSecim(o.id);
                setAsama("hazir");
              }}
              className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                dogru ? "border-emerald-500 bg-emerald-500/10" : yanlis ? "border-rose-500 bg-rose-500/10" : "border-line bg-panel hover:border-accent"
              } disabled:cursor-default`}
            >
              <span className="w-6 text-sm font-semibold text-muted">{String.fromCharCode(65 + n)}</span>
              <RitimYazi desen={o.desen} olcu={soru.olcu} />
            </button>
          );
        })}
      </div>
      {secim !== null && !cevaplandi ? (
        <div className="space-y-3 rounded-xl border border-line bg-panel p-4">
          <p className="text-sm text-muted">
            {secim === soru.dogru ? "Doğru yazım! " : "Doğru yazım yeşil olanı. "}
            Bir ölçü sayımdan sonra ritmi metronomla birlikte vur.
          </p>
          {asama === "hazir" ? (
            <button type="button" onClick={vurmayaBasla} className={btnAna}>
              Vurmaya başla
            </button>
          ) : (
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                vur();
              }}
              className={`h-28 w-full rounded-2xl border-2 text-2xl font-bold transition ${asama === "vur" ? "border-accent bg-accent/15 active:bg-accent/40" : "border-line bg-bg text-muted"}`}
            >
              {asama === "sayim" ? "Sayım… hazırlan" : asama === "vur" ? `VUR (${vurusSayi})` : "Puanlanıyor…"}
            </button>
          )}
        </div>
      ) : null}
      {geribildirim}
    </div>
  );
}

function Ozet({ yol, adim, sonuclar, sonraki, tekrar, geri }: { yol: string; adim: YolAdim; sonuclar: Sonuc[]; sonraki?: { kod: string; ad: string }; tekrar: () => void; geri?: string }) {
  const n = sonuclar.length || 1;
  const dogruluk = Math.round((sonuclar.reduce((a, s) => a + s.puan, 0) / n) * 100);
  const secim = Math.round((sonuclar.filter((s) => s.tam).length / n) * 100);
  const ritim = sonuclar.filter((s) => s.vurus !== undefined);
  const vurus = ritim.length ? Math.round(ritim.reduce((a, s) => a + (s.vurus ?? 0), 0) / ritim.length) : undefined;
  const gecti =
    dogruluk >= adim.gecme.dogruluk && secim >= adim.gecme.secim && (vurus === undefined || adim.gecme.vurus === undefined || vurus >= adim.gecme.vurus);
  const kaydedildi = useRef(false);
  useEffect(() => {
    if (kaydedildi.current) return;
    kaydedildi.current = true;
    saveStep(`${yol}/${adim.kod}`, dogruluk, gecti);
  }, [yol, adim.kod, dogruluk, gecti]);

  const satir = (ad: string, deger: number, gerek?: number) => (
    <div className="rounded-xl border border-line bg-bg p-3">
      <p className="text-xs uppercase tracking-wide text-muted">{ad}</p>
      <p className={`text-2xl font-bold tabular-nums ${gerek !== undefined && deger < gerek ? "text-rose-400" : ""}`}>%{deger}</p>
      {gerek !== undefined ? <p className="text-xs text-muted">Gereken %{gerek}</p> : null}
    </div>
  );

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-panel p-6">
      <div>
        <p className={`text-sm font-semibold uppercase tracking-wide ${gecti ? "text-emerald-400" : "text-rose-400"}`}>{gecti ? "Adım geçildi" : "Henüz geçilmedi"}</p>
        <h2 className="text-2xl font-bold">
          {adim.kod} {adim.ad}
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {satir("Doğruluk", dogruluk, adim.gecme.dogruluk)}
        {vurus !== undefined ? satir("Vuruş", vurus, adim.gecme.vurus) : null}
        {satir("Tam doğru", secim, adim.gecme.secim)}
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={tekrar} className={`${btnIkincil} inline-flex items-center gap-2`}>
          <RotateCcw size={16} /> Tekrar dene
        </button>
        {gecti && sonraki ? (
          <Link href={`/teori/yol/${yol}/${sonraki.kod}`} className={btnAna}>
            Sonraki adım: {sonraki.kod} {sonraki.ad}
          </Link>
        ) : null}
        <Link href={geri ?? `/teori/yol/${yol}`} className={btnIkincil}>
          {geri ? "Derslere dön" : "Yola dön"}
        </Link>
      </div>
    </div>
  );
}
