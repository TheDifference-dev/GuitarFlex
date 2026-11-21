// Metronom motoru: ana metronom (Araçlar), küçük pencere (/metronom/mini) ve tarayıcıdaki
// her zaman üstte pencere (Document Picture-in-Picture) aynı motoru ve aynı ayarları kullanır.
//
// Zamanlama: vuruşlar Web Audio saatine (AudioContext.currentTime) göre önceden planlanır
// (lookahead scheduler). Planlayıcıyı tetikleyen saat bir Web Worker'dadır; arka plandaki
// sekmede ana iş parçacığının zamanlayıcıları kısılsa da worker mesajları gelmeye devam eder.
// Sesin kendisi her durumda ses kartının saatine bağlıdır, zamanlayıcı gecikmesi vuruşu kaydırmaz.

export type OlcuId = "2/4" | "3/4" | "4/4" | "5/4" | "6/8" | "7/4";

export type Olcu = {
  id: OlcuId;
  /** Ölçüdeki vuruş (tık) sayısı */
  vurus: number;
  /** Ölçü başı dışında hafif vurgulanan vuruşlar (6/8'de 4. vuruş) */
  ikincil: number[];
};

export const OLCULER: Olcu[] = [
  { id: "2/4", vurus: 2, ikincil: [] },
  { id: "3/4", vurus: 3, ikincil: [] },
  { id: "4/4", vurus: 4, ikincil: [] },
  { id: "5/4", vurus: 5, ikincil: [] },
  { id: "6/8", vurus: 6, ikincil: [3] },
  { id: "7/4", vurus: 7, ikincil: [] },
];

export const BPM_EN_AZ = 30;
export const BPM_EN_COK = 250;

export type MetronomAyarlari = { bpm: number; olcu: OlcuId; ses: number };

export type MetronomDurumu = MetronomAyarlari & {
  calisiyor: boolean;
  /** Şu an çalan vuruşun ölçü içindeki sırası (0 = ölçü başı); duruyorsa -1 */
  vurus: number;
};

const KEY = "gf-metronom";
const VARSAYILAN: MetronomAyarlari = { bpm: 80, olcu: "4/4", ses: 0.8 };

/** Normal sekmede planlama ufku; arka planda (gizli sekme) daha uzun tutulur.
 *  Ufuk, ana iş parçacığının en uzun takılmasından uzun olmalı: 200 ms'lik takılmada bile tık zamanında çalar. */
const UFUK_ON_S = 0.2;
const UFUK_ARKA_S = 0.6;
const TIK_MS = 25;

export function olcuBul(id: string): Olcu {
  return OLCULER.find((o) => o.id === id) ?? OLCULER[2];
}

export function bpmSinirla(b: number): number {
  if (!Number.isFinite(b)) return VARSAYILAN.bpm;
  return Math.min(BPM_EN_COK, Math.max(BPM_EN_AZ, Math.round(b)));
}

function ayarlariDuzelt(ham: unknown): MetronomAyarlari {
  const a = (ham && typeof ham === "object" ? ham : {}) as Partial<Record<keyof MetronomAyarlari, unknown>>;
  const ses = typeof a.ses === "number" && Number.isFinite(a.ses) ? Math.min(1, Math.max(0, a.ses)) : VARSAYILAN.ses;
  return {
    bpm: typeof a.bpm === "number" ? bpmSinirla(a.bpm) : VARSAYILAN.bpm,
    olcu: typeof a.olcu === "string" && OLCULER.some((o) => o.id === a.olcu) ? (a.olcu as OlcuId) : VARSAYILAN.olcu,
    ses,
  };
}

function ayarlariOku(): MetronomAyarlari {
  try {
    const ham = window.localStorage.getItem(KEY);
    return ayarlariDuzelt(ham ? JSON.parse(ham) : null);
  } catch {
    return { ...VARSAYILAN };
  }
}

function ayarlariYaz(a: MetronomAyarlari) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    // Depolama kapalı ya da dolu: ayarlar yalnız bu pencere açıkken geçerli
  }
}

/** Tap tempo: son vuruşlar arasındaki ortalama aralıktan BPM (2 sn ara verilirse sıfırlanır) */
export class TapTempo {
  private zamanlar: number[] = [];
  vur(simdi = performance.now()): number | null {
    const son = this.zamanlar[this.zamanlar.length - 1];
    if (son !== undefined && simdi - son > 2000) this.zamanlar = [];
    this.zamanlar.push(simdi);
    if (this.zamanlar.length > 5) this.zamanlar.shift();
    if (this.zamanlar.length < 2) return null;
    const aralik = (this.zamanlar[this.zamanlar.length - 1] - this.zamanlar[0]) / (this.zamanlar.length - 1);
    return bpmSinirla(60000 / aralik);
  }
}

type Planlanan = { t: number; vurus: number };

const WORKER_KODU = `let id=null;onmessage=(e)=>{if(e.data==="basla"){if(id===null)id=setInterval(()=>postMessage(0),${TIK_MS});}else{clearInterval(id);id=null;}};`;

export class MetronomMotoru {
  private durum: MetronomDurumu = { ...VARSAYILAN, calisiyor: false, vurus: -1 };
  private yuklendi = false;
  private dinleyiciler = new Set<() => void>();
  private ctx: AudioContext | null = null;
  private cikisDugumu: GainNode | null = null;
  private worker: Worker | null = null;
  private yedekSaat: number | null = null;
  private sonraki = 0;
  private siradaki = 0;
  private kuyruk: Planlanan[] = [];
  /** Planlanmış ama henüz bitmemiş tıklar: durdurunca ufuktaki tıklar da susar */
  private sesler: { osc: OscillatorNode; t: number }[] = [];
  /** Ölçüm/test için: her vuruş planlanınca (vuruş zamanı, planlama anındaki saat) */
  onPlan: ((t: number, simdi: number, vurus: number) => void) | null = null;

  private yukle() {
    if (this.yuklendi || typeof window === "undefined") return;
    this.yuklendi = true;
    this.durum = { ...this.durum, ...ayarlariOku() };
    // Başka pencerede (ana metronom ↔ küçük pencere) değişen ayarlar buraya da yansısın
    window.addEventListener("storage", (e) => {
      if (e.key !== KEY) return;
      const a = ayarlariOku();
      this.ayarla(a, false);
    });
  }

  abone = (fn: () => void) => {
    this.yukle();
    this.dinleyiciler.add(fn);
    return () => {
      this.dinleyiciler.delete(fn);
    };
  };

  anlik = (): MetronomDurumu => {
    this.yukle();
    return this.durum;
  };

  static readonly sunucuDurumu: MetronomDurumu = { ...VARSAYILAN, calisiyor: false, vurus: -1 };
  sunucuAnlik = () => MetronomMotoru.sunucuDurumu;

  private yay(degisiklik: Partial<MetronomDurumu>) {
    this.durum = { ...this.durum, ...degisiklik };
    this.dinleyiciler.forEach((fn) => fn());
  }

  get ses(): AudioContext | null {
    return this.ctx;
  }
  /** Bütün tıkların geçtiği çıkış düğümü (ses düzeyi burada) */
  get cikis(): GainNode | null {
    return this.cikisDugumu;
  }

  ayarla(a: Partial<MetronomAyarlari>, kaydet = true) {
    this.yukle();
    const yeni = ayarlariDuzelt({ bpm: this.durum.bpm, olcu: this.durum.olcu, ses: this.durum.ses, ...a });
    if (yeni.bpm === this.durum.bpm && yeni.olcu === this.durum.olcu && yeni.ses === this.durum.ses) return;
    const olcuDegisti = yeni.olcu !== this.durum.olcu;
    if (olcuDegisti) this.siradaki %= olcuBul(yeni.olcu).vurus;
    if (this.cikisDugumu && this.ctx) this.cikisDugumu.gain.setTargetAtTime(this.sesKazanci(yeni.ses), this.ctx.currentTime, 0.01);
    this.yay(yeni);
    if (kaydet) ayarlariYaz(yeni);
  }

  private sesKazanci(ses: number) {
    return ses * ses;
  }

  private sesiHazirla(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext({ latencyHint: "interactive" });
      this.cikisDugumu = this.ctx.createGain();
      this.cikisDugumu.gain.value = this.sesKazanci(this.durum.ses);
      this.cikisDugumu.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  /** Başlatır; tarayıcı sesi açtırmazsa (kullanıcı etkileşimi yoksa) false döner */
  async baslat(): Promise<boolean> {
    this.yukle();
    if (this.durum.calisiyor) return true;
    const ctx = this.sesiHazirla();
    if (ctx.state !== "running") {
      await Promise.race([ctx.resume().catch(() => {}), new Promise((r) => setTimeout(r, 500))]);
      if ((ctx.state as AudioContextState) !== "running") return false;
    }
    // İlk tık için pay: ana iş parçacığı takıldıysa currentTime birkaç on ms geride görünebilir
    this.sonraki = ctx.currentTime + 0.1;
    this.siradaki = 0;
    this.kuyruk = [];
    this.yay({ calisiyor: true, vurus: -1 });
    this.saatiBaslat();
    this.planla();
    return true;
  }

  durdur() {
    if (!this.durum.calisiyor) return;
    this.saatiDurdur();
    this.kuyruk = [];
    for (const { osc } of this.sesler) {
      try {
        osc.stop();
      } catch {
        // zaten durmuş
      }
    }
    this.sesler = [];
    this.yay({ calisiyor: false, vurus: -1 });
  }

  async degistir(): Promise<boolean> {
    if (this.durum.calisiyor) {
      this.durdur();
      return true;
    }
    return this.baslat();
  }

  private saatiBaslat() {
    if (!this.worker && this.yedekSaat === null) {
      try {
        const url = URL.createObjectURL(new Blob([WORKER_KODU], { type: "text/javascript" }));
        this.worker = new Worker(url);
        URL.revokeObjectURL(url);
        this.worker.onmessage = () => this.planla();
      } catch {
        this.worker = null;
      }
    }
    if (this.worker) this.worker.postMessage("basla");
    else if (this.yedekSaat === null) this.yedekSaat = window.setInterval(() => this.planla(), TIK_MS);
  }

  private saatiDurdur() {
    this.worker?.postMessage("dur");
    if (this.yedekSaat !== null) {
      window.clearInterval(this.yedekSaat);
      this.yedekSaat = null;
    }
  }

  private tik(t: number, vurus: number, olcu: Olcu) {
    const ctx = this.ctx!;
    const vurgu = vurus === 0 ? 2 : olcu.ikincil.includes(vurus) ? 1 : 0;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.frequency.value = vurgu === 2 ? 1500 : vurgu === 1 ? 1250 : 1000;
    const tepe = vurgu === 2 ? 0.7 : vurgu === 1 ? 0.55 : 0.45;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(tepe, t + 0.002);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(env).connect(this.cikisDugumu!);
    osc.start(t);
    osc.stop(t + 0.06);
    this.sesler.push({ osc, t });
  }

  /** Planlayıcı: ufuk içindeki vuruşları ses saatine göre sıraya koyar */
  private planla = () => {
    const ctx = this.ctx;
    if (!ctx || !this.durum.calisiyor) return;
    const simdi = ctx.currentTime;
    const gizli = typeof document !== "undefined" && document.visibilityState === "hidden";
    const ufuk = simdi + (gizli ? UFUK_ARKA_S : UFUK_ON_S);
    // Yalnız sistem uykusu gibi uzun kopmalardan sonra yeniden hizala; kısa gecikmede ızgara korunur
    if (this.sonraki < simdi - 1) {
      this.sonraki = simdi + 0.02;
      this.kuyruk = [];
    }
    if (this.sesler.length > 32) this.sesler = this.sesler.filter((x) => x.t > simdi - 0.1);
    const olcu = olcuBul(this.durum.olcu);
    while (this.sonraki < ufuk) {
      const v = this.siradaki % olcu.vurus;
      this.tik(this.sonraki, v, olcu);
      this.kuyruk.push({ t: this.sonraki, vurus: v });
      this.onPlan?.(this.sonraki, simdi, v);
      this.sonraki += 60 / this.durum.bpm;
      this.siradaki = (v + 1) % olcu.vurus;
    }
    this.gorselGuncelle();
  };

  /** Vuruş göstergesi: zamanı gelen vuruşu duyurur (requestAnimationFrame ya da saat tıkından çağrılır) */
  gorselGuncelle = () => {
    const ctx = this.ctx;
    if (!ctx || !this.durum.calisiyor) return;
    const gecikme = (ctx.outputLatency || 0) + (ctx.baseLatency || 0);
    const simdi = ctx.currentTime - gecikme;
    let son: Planlanan | undefined;
    while (this.kuyruk.length && this.kuyruk[0].t <= simdi) son = this.kuyruk.shift();
    if (son) this.yay({ vurus: son.vurus });
  };
}

let tekMotor: MetronomMotoru | null = null;

/** Bu sayfadaki tek metronom motoru (ana metronom ve tarayıcı üstte penceresi paylaşır) */
export function metronomMotoru(): MetronomMotoru {
  if (!tekMotor) {
    tekMotor = new MetronomMotoru();
    if (typeof window !== "undefined") (window as unknown as { __gfMetronom?: MetronomMotoru }).__gfMetronom = tekMotor;
  }
  return tekMotor;
}

/** Masaüstü uygulamasının (Electron) güvenli köprüsü — desktop/preload.cjs */
export type MasaustuKopru = {
  surum: number;
  metronomMiniAc: (secenek?: { cal?: boolean }) => Promise<unknown>;
  metronomMiniKapat: () => void;
  anaPencereyeDon: () => void;
  metronomKomutDinle: (fn: (komut: string) => void) => () => void;
};

export function masaustuKoprusu(): MasaustuKopru | null {
  if (typeof window === "undefined") return null;
  const k = (window as unknown as { guitarflexMasaustu?: MasaustuKopru }).guitarflexMasaustu;
  return k && typeof k.metronomMiniAc === "function" ? k : null;
}
