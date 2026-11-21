"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Headphones, RotateCcw, Volume2 } from "lucide-react";
import type { YolAdim } from "@/lib/alistirma/tipler";
import { soruListesi, type Soru } from "@/lib/alistirma/sorular";
import { cal, vurusPuani, vurusZamani } from "@/lib/alistirma/ritim";
import { nota, simdi } from "@/lib/ses";
import { perdeSes } from "@/lib/alistirma/muzik";
import { saveStep } from "@/lib/progress";
import SapSoru from "./SapSoru";
import AkorKutusu from "./AkorKutusu";
import RitimYazi from "./RitimYazi";
import Porte from "./Porte";
import AkorSemasi from "./AkorSemasi";

/** secimsiz: yalnız geri vurma sorusu (ritim dağılımı); "tam doğru" (seçim doğruluğu) oranına girmez */
type Sonuc = { puan: number; tam: boolean; vurus?: number; secimsiz?: boolean };
type Props = { yol: string; adim: YolAdim; sonraki?: { kod: string; ad: string }; geri?: string };

const btn = "px-5 py-2 disabled:opacity-40";
const btnAna = `btn-primary ${btn}`;
const btnIkincil = `btn-secondary ${btn}`;

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
      <div className="space-y-4 card p-6">
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
          <div className="bar-fill h-full rounded-full transition-all" style={{ width: `${((i + (cevaplandi ? 1 : 0)) / sorular.length) * 100}%` }} />
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

  // Yalnız geri vurma sorusunda doğru/yanlış yok: vuruş puanı %80 ve üstü yeşil
  const iyi = sonuc ? sonuc.tam || (sonuc.secimsiz && sonuc.puan >= 0.8) : false;
  const geribildirim = cevaplandi && sonuc ? (
    <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${iyi ? "border-ok/60 bg-ok/10" : "border-bad/60 bg-bad/10"}`}>
      <div>
        <p className="font-semibold">
          {sonuc.secimsiz ? `Vuruş puanı %${sonuc.vurus}` : sonuc.tam ? "Doğru!" : sonuc.puan > 0 ? `Kısmen doğru (%${Math.round(sonuc.puan * 100)})` : "Yanlış"}
          {sonuc.vurus !== undefined && !sonuc.secimsiz ? ` · Vuruş puanı %${sonuc.vurus}` : ""}
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
        <Gorseller soru={soru} />
        {soru.sap ? <SapSoru sap={soru.sap} kilitli /> : null}
        {soru.diyagram ? (
          <div className="flex justify-center card p-4">
            <AkorKutusu sekil={soru.diyagram} boyut={150} />
          </div>
        ) : null}
        <div className={`grid gap-2 ${soru.secenekler.some((o) => o.diyagram) ? "grid-cols-2 sm:grid-cols-4" : soru.secenekler.some((o) => o.ritim) ? "" : "sm:grid-cols-2"}`}>
          {soru.secenekler.map((o, n) => {
            const dogru = cevaplandi && o.id === soru.dogru;
            const yanlis = cevaplandi && o.id === secim && o.id !== soru.dogru;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => sec(o.id)}
                disabled={cevaplandi}
                className={`flex items-center justify-center rounded-2xl border p-3 text-left font-medium transition ${
                  dogru ? "border-ok bg-ok/15" : yanlis ? "border-bad bg-bad/15" : "border-line bg-panel hover:border-ink/20"
                } disabled:cursor-default`}
              >
                {o.diyagram ? (
                  <AkorKutusu sekil={o.diyagram} />
                ) : o.ritim ? (
                  <span className="flex w-full items-center gap-3">
                    <span className="w-6 text-sm font-semibold text-muted">{String.fromCharCode(65 + n)}</span>
                    <RitimYazi desen={o.ritim} />
                  </span>
                ) : (
                  o.ad
                )}
              </button>
            );
          })}
        </div>
        {geribildirim}
      </div>
    );
  }

  // Sırayla dokunma (ezgi, akor kökü): her dokunuş çalar ve sıradaki sesle karşılaştırılır; geri alma yok
  if (soru.sirali) {
    const { sesler, esit } = soru.sirali;
    const uyar = (key: string, i: number) => {
      const [t, f] = key.split(":").map(Number);
      const m = perdeSes(t, f);
      return esit === "ses" ? m === sesler[i] : (((m - sesler[i]) % 12) + 12) % 12 === 0;
    };
    const etiketler: Record<string, string> = {};
    const ilk = soru.sap.noktalar.some((p) => p.tur === "kok") ? 2 : 1;
    secili.forEach((key, i) => {
      etiketler[key] = etiketler[key] ? `${etiketler[key]}·${i + ilk}` : String(i + ilk);
    });
    const tikSirali = (t: number, f: number) => {
      if (cevaplandi || secili.length >= sesler.length) return;
      nota(perdeSes(t, f), undefined, 1.2);
      const yeni = [...secili, `${t}:${f}`];
      setSecili(yeni);
      if (yeni.length === sesler.length) {
        const dogru = yeni.filter((key, i) => uyar(key, i)).length;
        onCevap({ puan: dogru / sesler.length, tam: dogru === sesler.length });
      }
    };
    const dogruDokunus = secili.filter((key, i) => uyar(key, i));
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{soru.metin}</h2>
          {dinle}
        </div>
        <Gorseller soru={soru} />
        <SapSoru sap={soru.sap} secili={secili} dogrular={cevaplandi ? [...soru.hedef, ...dogruDokunus] : undefined} kilitli={cevaplandi} onTik={tikSirali} etiketler={etiketler} />
        {!cevaplandi ? (
          <p className="text-sm text-muted tabular-nums">
            {secili.length} / {sesler.length} nota · Her dokunuş çalar; sırayla dokun.
          </p>
        ) : null}
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
      <Gorseller soru={soru} />
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

/** Okuma soruları: porte, ritim yazımı ya da akor şeması (sorunun üstünde) */
function Gorseller({ soru }: { soru: Exclude<Soru, { tip: "ritim" }> }) {
  if (!soru.porte && !soru.ritim && !soru.sema) return null;
  return (
    <div className="flex justify-center card p-4">
      {soru.porte ? <Porte porte={soru.porte} /> : null}
      {soru.ritim ? (
        <div className="w-full max-w-xl">
          <RitimYazi desen={soru.ritim.desen} olcu={soru.ritim.olcu} />
        </div>
      ) : null}
      {soru.sema ? <AkorSemasi sema={soru.sema} /> : null}
    </div>
  );
}

type Asama = "sec" | "hazir" | "sayim" | "vur" | "bitti";

function RitimSoruGoster({
  soru, cevaplandi, onCevap, geribildirim,
}: { soru: Extract<Soru, { tip: "ritim" }>; cevaplandi: boolean; onCevap: (s: Sonuc) => void; geribildirim: React.ReactNode }) {
  const [secim, setSecim] = useState<string | null>(null);
  // Yalnız geri vurma sorusunda seçim yok: doğrudan vurmaya hazır
  const [asama, setAsama] = useState<Asama>(soru.asama === "vurus" ? "hazir" : "sec");
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
        if (soru.asama === "vurus") return onCevap({ puan: puan / 100, tam: false, vurus: puan, secimsiz: true });
        const secimDogru = secim === soru.dogru;
        onCevap({ puan: (secimDogru ? 0.5 : 0) + (puan / 100) * 0.5, tam: secimDogru, vurus: puan });
      }, (bitis - now) * 1000 + 350),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          {asama === "sec" ? "Ritmi dinle ve doğru yazımı seç." : soru.asama === "secim" ? "Ritmi dinle ve doğru yazımı seç." : "Şimdi aynı ritmi vur: boşluk tuşu ya da büyük düğme."}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted tabular-nums">♩ = {soru.bpm}</span>
          <button type="button" onClick={dinle} disabled={asama === "sayim" || asama === "vur"} className={`${btnIkincil} inline-flex items-center gap-2 text-sm`}>
            <Volume2 size={16} /> Tekrar dinle
          </button>
        </div>
      </div>
      {soru.asama === "vurus" ? (
        <div className="rounded-2xl border border-line bg-panel p-3">
          <RitimYazi desen={soru.desen} olcu={soru.olcu} />
        </div>
      ) : null}
      <div className="grid gap-2">
        {(soru.asama === "vurus" ? [] : soru.secenekler).map((o, n) => {
          const dogru = secim !== null && o.id === soru.dogru;
          const yanlis = secim === o.id && o.id !== soru.dogru;
          return (
            <button
              key={o.id}
              type="button"
              disabled={secim !== null}
              onClick={() => {
                setSecim(o.id);
                // Yalnız yazım seçme sorusu: seçimle biter
                if (soru.asama === "secim") {
                  setAsama("bitti");
                  onCevap({ puan: o.id === soru.dogru ? 1 : 0, tam: o.id === soru.dogru });
                } else setAsama("hazir");
              }}
              className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                dogru ? "border-ok bg-ok/10" : yanlis ? "border-bad bg-bad/10" : "border-line bg-panel hover:border-ink/20"
              } disabled:cursor-default`}
            >
              <span className="w-6 text-sm font-semibold text-muted">{String.fromCharCode(65 + n)}</span>
              <RitimYazi desen={o.desen} olcu={soru.olcu} />
            </button>
          );
        })}
      </div>
      {(secim !== null || soru.asama === "vurus") && soru.asama !== "secim" && !cevaplandi ? (
        <div className="space-y-3 card p-4">
          <p className="text-sm text-muted">
            {soru.asama === "vurus" ? "" : secim === soru.dogru ? "Doğru yazım! " : "Doğru yazım yeşil olanı. "}
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
  // Seçim doğruluğu yalnız seçimli sorulardan (yalnız geri vurma soruları hariç)
  const secimli = sonuclar.filter((s) => !s.secimsiz);
  const secim = Math.round((secimli.filter((s) => s.tam).length / (secimli.length || 1)) * 100);
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
    <div className="rounded-2xl border border-ink/[0.08] bg-ink/[0.04] p-3">
      <p className="text-xs font-medium text-muted">{ad}</p>
      <p className={`text-2xl font-bold tabular-nums ${gerek !== undefined && deger < gerek ? "text-bad" : ""}`}>%{deger}</p>
      {gerek !== undefined ? <p className="text-xs text-muted">Gereken %{gerek}</p> : null}
    </div>
  );

  return (
    <div className="space-y-5 card p-6">
      <div>
        <p className={`text-sm font-semibold uppercase tracking-wide ${gecti ? "text-ok" : "text-bad"}`}>{gecti ? "Adım geçildi" : "Henüz geçilmedi"}</p>
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
