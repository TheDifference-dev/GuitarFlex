// Oynatıcı uçtan uca testi: bütün tablı sayfalar gerçekten çiziliyor, çalıyor ve SES üretiyor mu?
//
//   npm run test:oynatici                 → build + bütün sayfalar (yaklaşık 25–35 dk)
//   npm run test:oynatici -- --atla-build → var olan .next derlemesiyle
//   npm run test:oynatici -- --filtre=legato --es=4 --limit=20
//
// Production sunucusu (`next start -p 3307`) ve başsız Chrome (CDP 9347, ayrı profil) açılır; her sayfada ölçülen:
//   (a) sayfa 200, konsolda hata/istisna yok        (b) alphaTab çizdi (svg > 0; "Tab açılamadı"/"yükleniyor" yok)
//   (c) oynatıcı hazır (ses bankası + MIDI)          (d) Çal'a basınca konum ilerliyor
//   (e) gerçek ses: AudioContext çıkışında RMS > eşik (g) örnek derslerde sayım, metronom, hız, döngü, ana ses
//   (f) track'lerin MIDI programı ses bankasında var (GeneralUser ve sonivox preset listeleri)
// Sonuç: <çıktı>/sonuc.json ve <çıktı>/ozet.md (varsayılan /tmp/w7; --cikti=… ya da GF_TEST_CIKTI).
// Sunucu ve Chrome yalnız kendi PID'leriyle kapatılır.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { BUILTIN_COURSES } from "../src/content/courses.ts";
import { BACKINGS } from "../src/content/dogaclama.ts";
import { SONGS } from "../src/content/songs.ts";
import { gitarProgrami } from "../src/lib/gitarTonu.ts";
import { PRIVATE_ROOTS } from "../src/lib/private-roots.ts";

const ROOT = process.cwd();
const arg = (ad, varsayilan) => {
  const a = process.argv.find((x) => x === `--${ad}` || x.startsWith(`--${ad}=`));
  if (!a) return varsayilan;
  return a.includes("=") ? a.slice(a.indexOf("=") + 1) : true;
};
const PORT = Number(arg("port", 3307));
const CDP_PORT = Number(arg("cdp", 9347));
const ES = Number(arg("es", 6));
const CIKTI = String(arg("cikti", process.env.GF_TEST_CIKTI ?? "/tmp/w7"));
const FILTRE = arg("filtre") ? new RegExp(String(arg("filtre"))) : null;
const LIMIT = Number(arg("limit", 0));
const EK_SAYI = Number(arg("ek", 20));
const BASE = `http://127.0.0.1:${PORT}`;
/** Ses var sayılan en küçük RMS (tam ölçek 1). Sessizlik 0'dır; en kısık tek nota bile bunun çok üstünde. */
const ESIK = 0.002;
/** "Sessiz" sayılan en büyük RMS (ana ses %0) */
const SESSIZ = 0.0002;
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
const simdi = () => Date.now();

// ── İçerik: tablı sayfaların listesi ─────────────────────────────────────────
function paketOku() {
  const kurslar = [];
  for (const kok of PRIVATE_ROOTS) {
    const dir = path.join(kok, "icerik");
    let dosyalar = [];
    try {
      dosyalar = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
    } catch {
      continue;
    }
    for (const f of dosyalar) {
      try {
        const c = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
        if (c?.slug && c.title && Array.isArray(c.sections) && !kurslar.some((x) => x.slug === c.slug)) kurslar.push(c);
      } catch {
        // Bozuk dosya uygulamada da atlanır
      }
    }
  }
  return kurslar;
}
function jsonOku(goreli) {
  for (const kok of PRIVATE_ROOTS) {
    try {
      return JSON.parse(readFileSync(path.join(kok, goreli), "utf8"));
    } catch {
      // sıradaki kök
    }
  }
  return null;
}
/** Kursun dersleri, uygulamadaki kimliklerle (bkz. src/lib/courses.ts › normalize) */
function dersler(kurs) {
  const liste = [];
  kurs.sections.forEach((s, si) =>
    (s.chapters ?? []).forEach((c, ci) => {
      const kod = c.code ?? `${s.number ?? si + 1}.${ci}`;
      (c.lessons ?? []).forEach((l, li) => liste.push({ ...l, id: l.id ?? `${kod}-${li + 1}` }));
    }),
  );
  return liste;
}

function sayfaListesi() {
  const paket = paketOku();
  const kurslar = [...BUILTIN_COURSES.map((c) => paket.find((p) => p.slug === c.slug) ?? c), ...paket.filter((p) => !BUILTIN_COURSES.some((b) => b.slug === p.slug))];
  const dizin = new Map();
  for (const k of kurslar) for (const l of dersler(k)) if (!dizin.has(`${k.slug}#${l.id}`)) dizin.set(`${k.slug}#${l.id}`, l);
  const sayfalar = [];
  for (const k of kurslar) {
    for (const ham of dersler(k)) {
      const hedef = ham.ref ? dizin.get(ham.ref) : null;
      const l = hedef ? { ...ham, tex: ham.tex ?? hedef.tex, tabFile: ham.tabFile ?? hedef.tabFile, body: ham.body ?? hedef.body } : ham;
      const ozel = l.kind === "quickstudy" && l.tex && l.chords?.length && l.readBars && l.improvBars ? "quickstudy" : l.kind === "transkripsiyon" && l.tex ? "transkripsiyon" : l.kind === "kompozisyon" && l.tex && l.chords?.length ? "kompozisyon" : null;
      const tabli = !!(l.tex || l.tabFile);
      sayfalar.push({
        url: `/calis/${k.slug}/${encodeURIComponent(l.id)}`,
        grup: `kurs:${k.slug}`,
        kimlik: `${k.slug}#${l.id}`,
        baslik: l.title,
        tur: ozel ?? (tabli ? "ders" : "tabsiz"),
        // Dersin ton ipucundan beklenen gitar programı (tabda \instrument yoksa)
        beklenenProgram: l.tex && !/\\instrument\b/.test(l.tex) ? gitarProgrami(l.tips, k.slug) : undefined,
        yalnizNota: l.stave === "score",
      });
    }
  }
  for (const s of jsonOku("icerik/kutuphane.json")?.songs ?? []) {
    if (s?.slug && typeof s.tex === "string") sayfalar.push({ url: `/kutuphane/${encodeURIComponent(s.slug)}`, grup: "kutuphane", kimlik: `kutuphane#${s.slug}`, baslik: s.title, tur: "ders" });
  }
  for (const b of BACKINGS) sayfalar.push({ url: `/sarkilar/dogaclama/${encodeURIComponent(b.slug)}`, grup: "dogaclama", kimlik: `eslik#${b.slug}`, baslik: b.title, tur: "ders" });
  sayfalar.push({ url: "/oynatici", grup: "oynatici", kimlik: "oynatici#varsayilan", baslik: "Tabla Keşfet (varsayılan şarkı)", tur: "ders" });
  for (const s of SONGS) sayfalar.push({ url: `/oynatici?sarki=${encodeURIComponent(s.slug)}`, grup: "oynatici", kimlik: `oynatici#${s.slug}`, baslik: s.title, tur: "ders" });
  for (const yol of ["ritim", "klavye", "kulak", "okuma", "armoni"]) {
    const y = jsonOku(`icerik/yollar/${yol}.json`);
    for (const a of y?.adimlar ?? []) sayfalar.push({ url: `/teori/yol/${yol}/${encodeURIComponent(a.kod)}`, grup: `yol:${yol}`, kimlik: `yol:${yol}#${a.kod}`, baslik: a.ad, tur: "adim", yol });
  }
  return sayfalar;
}

// ── Ses bankası: sf2 preset listesi (RIFF › pdta › phdr) ─────────────────────
function sf2Presetleri(dosya) {
  const b = readFileSync(dosya);
  const presetler = new Set();
  let i = 12;
  while (i + 8 <= b.length) {
    const ad = b.toString("latin1", i, i + 4);
    const boy = b.readUInt32LE(i + 4);
    if (ad === "LIST" && b.toString("latin1", i + 8, i + 12) === "pdta") {
      let j = i + 12;
      while (j + 8 <= i + 8 + boy) {
        const a2 = b.toString("latin1", j, j + 4);
        const b2 = b.readUInt32LE(j + 4);
        if (a2 === "phdr") {
          // Son kayıt (EOP) sonlandırıcıdır
          for (let k = j + 8; k + 38 <= j + 8 + b2 - 38; k += 38) presetler.add(`${b.readUInt16LE(k + 22)}:${b.readUInt16LE(k + 20)}`);
        }
        j += 8 + b2 + (b2 & 1);
      }
    }
    i += 8 + boy + (boy & 1);
  }
  return presetler;
}

// ── CDP ──────────────────────────────────────────────────────────────────────
class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.sira = 0;
    this.bekleyen = new Map();
    this.dinleyici = new Map();
    ws.addEventListener("message", (e) => {
      const m = JSON.parse(e.data);
      if (m.id) {
        const p = this.bekleyen.get(m.id);
        if (!p) return;
        this.bekleyen.delete(m.id);
        if (m.error) p.reject(new Error(`${p.method}: ${m.error.message}`));
        else p.resolve(m.result);
      } else if (m.sessionId) this.dinleyici.get(m.sessionId)?.(m.method, m.params);
    });
  }
  static async baglan(port) {
    for (let i = 0; i < 100; i++) {
      try {
        const v = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
        const ws = new WebSocket(v.webSocketDebuggerUrl);
        await new Promise((res, rej) => {
          ws.addEventListener("open", res, { once: true });
          ws.addEventListener("error", rej, { once: true });
        });
        return new Cdp(ws);
      } catch {
        await bekle(200);
      }
    }
    throw new Error("Chrome'a bağlanılamadı");
  }
  gonder(method, params = {}, sessionId, sure = 60000) {
    const id = ++this.sira;
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        this.bekleyen.delete(id);
        reject(new Error(`${method}: zaman aşımı`));
      }, sure);
      this.bekleyen.set(id, { method, resolve: (v) => (clearTimeout(t), resolve(v)), reject: (e) => (clearTimeout(t), reject(e)) });
      this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }
}

/** Her sayfaya, sayfanın kendi kodundan önce yüklenen ölçüm aracı: AudioContext çıkışına giden her bağlantıya bir
 *  AnalyserNode eklenir (alphaTab'ın AudioWorklet çıkışı ve src/lib/ses.ts dahil); ses yolu değişmez. */
const SONDA = `(() => {
  if (window.__gfSonda) return;
  const uclar = [];
  const ucBul = (ctx) => {
    let u = uclar.find((x) => x.ctx === ctx);
    if (!u) {
      const an = ctx.createAnalyser();
      an.fftSize = 2048;
      u = { ctx, an, buf: new Float32Array(2048) };
      uclar.push(u);
    }
    return u;
  };
  const asil = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (hedef, ...kalan) {
    if (hedef instanceof AudioDestinationNode) {
      try { asil.call(this, ucBul(hedef.context).an); } catch (e) {}
    }
    return asil.call(this, hedef, ...kalan);
  };
  let enRms = 0, enTepe = 0, olcum = 0;
  const olc = () => {
    let anlik = 0;
    for (const u of uclar) {
      u.an.getFloatTimeDomainData(u.buf);
      let t = 0, p = 0;
      for (let i = 0; i < u.buf.length; i++) { const v = u.buf[i]; t += v * v; const a = v < 0 ? -v : v; if (a > p) p = a; }
      const r = Math.sqrt(t / u.buf.length);
      if (r > anlik) anlik = r;
      if (r > enRms) enRms = r;
      if (p > enTepe) enTepe = p;
    }
    olcum++;
    return anlik;
  };
  setInterval(olc, 40);
  const api = (i) => window.__gfTest && window.__gfTest.players[i || 0];
  const dugme = (metin) => [...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith(metin));
  window.__gfSonda = {
    sifirla() { enRms = 0; enTepe = 0; olcum = 0; },
    ses() { const anlik = olc(); return { rms: enRms, tepe: enTepe, anlik, olcum, ctx: uclar.map((u) => u.ctx.state) }; },
    askiyaAl() { return Promise.all(uclar.map((u) => u.ctx.suspend())).then(() => uclar.map((u) => u.ctx.state)); },
    dugme,
    tikla(secici) { const el = typeof secici === "string" ? document.querySelector(secici) : secici; if (!el || el.disabled) return false; el.click(); return true; },
    metinTikla(metin) { const b = dugme(metin); if (!b || b.disabled) return false; b.click(); return true; },
    kaydir(secici, deger) {
      const el = document.querySelector(secici);
      if (!el) return false;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(deger));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    },
    durum(i) {
      const a = api(i);
      const cal = document.querySelectorAll('button[title^="Çal / Duraklat"]')[i || 0];
      // alphaTab yalnız ekranda görünen bölümü çizer: oynatıcı sayfanın altındaysa kullanıcı gibi oraya kaydır
      const kap = a && a.container && a.container.element;
      if (kap && a.score && !kap.querySelector("svg")) kap.scrollIntoView({ block: "center" });
      // textContent: yerleşim hesaplatmaz (sık yoklamada sayfayı yormasın)
      const govde = document.body.textContent;
      const d = {
        oynatici: window.__gfTest ? window.__gfTest.players.length : 0,
        svg: a && a.container && a.container.element ? a.container.element.querySelectorAll("svg").length : 0,
        acilamadi: govde.includes("Tab açılamadı"),
        yukleniyor: govde.includes("Tab yükleniyor"),
        calEtiket: cal ? cal.textContent.trim() : null,
        calKilitli: cal ? cal.disabled : null,
        sesUyari: (document.querySelector("[data-ses-durumu]") || {}).textContent || null,
        sayim: !!dugme("Hemen başla"),
      };
      if (a) {
        d.skor = !!a.score;
        d.hazir = !!a.isReadyForPlayback;
        d.calma = a.playerState;
        d.tick = a.tickPosition;
        d.hiz = a.playbackSpeed;
        d.anaSes = a.masterVolume;
        d.dongu = a.isLooping;
        d.aralik = a.playbackRange ? [a.playbackRange.startTick, a.playbackRange.endTick] : null;
      }
      return d;
    },
    parca(i) {
      const a = api(i);
      if (!a || !a.score) return null;
      const AT = window.alphaTab.model.AutomationType.Instrument;
      const s = a.score;
      let ilkNota = null;
      const izler = s.tracks.map((t) => {
        const ek = new Set();
        for (const st of t.staves) for (const bar of st.bars) for (const v of bar.voices) for (const b of v.beats) {
          if (ilkNota === null || b.absolutePlaybackStart < ilkNota) { if (!b.isRest && b.notes.length && !t.playbackInfo.isMute) ilkNota = b.absolutePlaybackStart; }
          for (const o of b.automations || []) if (o.type === AT) ek.add(o.value);
        }
        return { ad: t.name, program: t.playbackInfo.program, banka: t.playbackInfo.bank || 0, kanal: t.playbackInfo.primaryChannel, perkusyon: !!t.staves[0].isPercussion, ses: t.playbackInfo.volume, sessiz: !!t.playbackInfo.isMute, ekProgram: [...ek] };
      });
      const mb = s.masterBars[0];
      return { izler, tempo: s.tempo, olcu: s.masterBars.length, pay: mb.timeSignatureNumerator, payda: mb.timeSignatureDenominator, ilkNota: ilkNota || 0, olcuBaslari: s.masterBars.slice(0, 4).map((m) => m.start) };
    },
    tani() {
      return (window.__gfTest ? window.__gfTest.players : []).map((a) => {
        const el = a.container && a.container.element;
        const k = el ? el.getBoundingClientRect() : null;
        return { skor: !!a.score, iz: a.tracks ? a.tracks.map((t) => t.index) : null, genislik: k ? Math.round(k.width) : null, yukseklik: k ? Math.round(k.height) : null, svg: el ? el.querySelectorAll("svg").length : 0, kanvas: el ? el.querySelectorAll("canvas").length : 0, cocuk: el ? el.querySelectorAll("*").length : 0, html: el ? el.innerHTML.slice(0, 300) : null, baslangic: a.settings.display.startBar, olcuSay: a.settings.display.barCount, profil: a.settings.display.staveProfile };
      });
    },
    api,
  };
})();`;

class Sekme {
  constructor(cdp) {
    this.cdp = cdp;
  }
  async ac(depo) {
    const { browserContextId } = await this.cdp.gonder("Target.createBrowserContext", { disposeOnDetach: true });
    this.baglam = browserContextId;
    const { targetId } = await this.cdp.gonder("Target.createTarget", { url: "about:blank", browserContextId, width: 1280, height: 900 });
    this.hedef = targetId;
    const { sessionId } = await this.cdp.gonder("Target.attachToTarget", { targetId, flatten: true });
    this.oturum = sessionId;
    this.hatalar = [];
    this.istekler = [];
    this.yontem = new Map();
    this.belgeDurumu = null;
    this.yuklendi = null;
    this.cdp.dinleyici.set(sessionId, (method, p) => this.olay(method, p));
    for (const alan of ["Page", "Runtime", "Network", "Log"]) await this.gonder(`${alan}.enable`);
    await this.gonder("Page.addScriptToEvaluateOnNewDocument", { source: SONDA });
    // Oynatıcı tercihleri bu sekmenin kendi (yalıtılmış) deposunda: sayfa kodundan önce yazılır
    this.depoKimlik = (await this.gonder("Page.addScriptToEvaluateOnNewDocument", { source: depoBetigi(depo) })).identifier;
    return this;
  }
  async depoAyarla(depo) {
    if (this.depoKimlik) await this.gonder("Page.removeScriptToEvaluateOnNewDocument", { identifier: this.depoKimlik });
    this.depoKimlik = (await this.gonder("Page.addScriptToEvaluateOnNewDocument", { source: depoBetigi(depo) })).identifier;
  }
  gonder(method, params, sure) {
    return this.cdp.gonder(method, params, this.oturum, sure);
  }
  olay(method, p) {
    if (method === "Runtime.exceptionThrown") this.hatalar.push(`istisna: ${p.exceptionDetails.exception?.description ?? p.exceptionDetails.text}`.slice(0, 400));
    else if (method === "Runtime.consoleAPICalled" && p.type === "error") this.hatalar.push(`konsol: ${p.args.map((a) => a.value ?? a.description ?? "").join(" ")}`.slice(0, 400));
    else if (method === "Log.entryAdded" && p.entry.level === "error") this.hatalar.push(`log: ${p.entry.text} ${p.entry.url ?? ""}`.slice(0, 400));
    else if (method === "Network.requestWillBeSent") this.yontem.set(p.requestId, p.request.method);
    else if (method === "Network.responseReceived") {
      if (p.type === "Document" && this.belgeDurumu === null) this.belgeDurumu = p.response.status;
      this.istekler.push({ url: p.response.url, durum: p.response.status, yontem: this.yontem.get(p.requestId) ?? "GET" });
    } else if (method === "Page.loadEventFired") this.yuklendi?.();
    else if (method === "Fetch.requestPaused") this.araya?.(p);
  }
  async git(url) {
    this.hatalar = [];
    this.istekler = [];
    this.yontem.clear();
    this.belgeDurumu = null;
    const yuk = new Promise((r) => (this.yuklendi = r));
    await this.gonder("Page.navigate", { url: BASE + url });
    await Promise.race([yuk, bekle(30000)]);
    return this.belgeDurumu;
  }
  async js(ifade, jest = false) {
    const r = await this.gonder("Runtime.evaluate", { expression: ifade, returnByValue: true, awaitPromise: true, userGesture: jest });
    if (r.exceptionDetails) throw new Error(`js: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
    return r.result.value;
  }
  durum(i = 0) {
    return this.js(`window.__gfSonda.durum(${i})`);
  }
  /** Koşul sağlanana dek yoklar; son durumu döndürür (sağlanmadıysa `zamanAsimi: true`) */
  async yokla(kosul, sure, i = 0, aralik = 120) {
    const son = simdi() + sure;
    let d;
    for (;;) {
      d = await this.durum(i);
      if (kosul(d)) return d;
      if (simdi() > son) return { ...d, zamanAsimi: true };
      await bekle(aralik);
    }
  }
  async kapat() {
    this.cdp.dinleyici.delete(this.oturum);
    try {
      await this.cdp.gonder("Target.closeTarget", { targetId: this.hedef });
      await this.cdp.gonder("Target.disposeBrowserContext", { browserContextId: this.baglam });
    } catch {
      // Sekme zaten kapanmış olabilir
    }
  }
}
const depoBetigi = (depo) => `try { ${depo === null ? `localStorage.removeItem("gf-oynatici")` : `localStorage.setItem("gf-oynatici", ${JSON.stringify(JSON.stringify(depo))})`}; } catch (e) {}`;

// ── Ölçümler ─────────────────────────────────────────────────────────────────
const CAL = 'button[title^="Çal / Duraklat"]';
const METRONOM = 'button[title^="Metronom (M)"]';

/** Çal'a basıp konumun ilerlediğini ve ses çıktığını ölçer. `i`: sayfadaki oynatıcı sırası. */
async function calVeOlc(s, i = 0, { enCok = 3500, enAz = 900 } = {}) {
  const once = await s.durum(i);
  await s.js("window.__gfSonda.sifirla()");
  const basildi = await s.js(`window.__gfSonda.tikla(document.querySelectorAll('${CAL}')[${i}])`, true);
  const t0 = simdi();
  let ilerledi = false;
  let caldi = false;
  let ses = { rms: 0, tepe: 0 };
  let d = once;
  while (simdi() - t0 < enCok) {
    await bekle(150);
    d = await s.durum(i);
    ses = await s.js("window.__gfSonda.ses()");
    if (d.calma === 1) caldi = true;
    if (d.tick > (once.tick ?? 0)) ilerledi = true;
    if (ilerledi && ses.rms > ESIK && simdi() - t0 >= enAz) break;
  }
  return { basildi, caldi, ilerledi, rms: ses.rms, tepe: ses.tepe, ctx: ses.ctx, tick0: once.tick ?? 0, tick: d.tick, sure: simdi() - t0 };
}
const duraklat = async (s, i = 0) => {
  if ((await s.durum(i)).calma === 1) await s.js(`window.__gfSonda.tikla(document.querySelectorAll('${CAL}')[${i}])`, true);
};
/** Bir süre boyunca en yüksek RMS (ölçüm penceresi sıfırlanır) */
async function pencere(s, ms) {
  await s.js("window.__gfSonda.sifirla()");
  await bekle(ms);
  return (await s.js("window.__gfSonda.ses()")).rms;
}

function presetDenetimi(parca, bankalar) {
  const eksik = [];
  for (const [banka, presetler] of Object.entries(bankalar)) {
    for (const iz of parca.izler) {
      if (iz.perkusyon) {
        // alphaTab davulda sırayla 128:program, 128:0 dener
        if (!presetler.has(`128:${iz.program}`) && !presetler.has("128:0")) eksik.push(`${banka}: davul seti yok (track "${iz.ad}")`);
        continue;
      }
      for (const p of [iz.program, ...iz.ekProgram]) if (!presetler.has(`${iz.banka}:${p}`)) eksik.push(`${banka}: program ${p} (banka ${iz.banka}) yok (track "${iz.ad}")`);
    }
  }
  return eksik;
}

/** Tablı sayfa: (a)–(f). Dönen kayıt sonuc.json'a yazılır. */
async function oynaticiSayfasi(s, sayfa, bankalar) {
  const r = { ...sayfa, olcut: {}, neden: [], olcum: {} };
  const t0 = simdi();
  const durum = await s.git(sayfa.url);
  r.olcum.http = durum;
  const kalir = (olcut, neden) => {
    r.olcut[olcut] = false;
    r.neden.push(`(${olcut}) ${neden}`);
  };

  // Türe özgü hazırlık: kompozisyonda oynatıcı "Örnek çözümü göster" ile açılır
  if (durum === 200 && sayfa.tur === "kompozisyon") {
    await s.yokla(() => false, 400);
    const acildi = await s.js(`(async () => { for (let k = 0; k < 50; k++) { if (window.__gfSonda.metinTikla("Örnek çözümü göster")) return true; await new Promise((r) => setTimeout(r, 100)); } return false; })()`, true);
    if (!acildi) r.neden.push('(b) "Örnek çözümü göster" düğmesi bulunamadı');
  }

  // (b) çizim. Transkripsiyonda tab bilerek gizli: önce yalnız parça yüklenir, çizim "Tabı göster" ile sınanır
  const gizli = sayfa.tur === "transkripsiyon";
  let d = durum === 200 ? await s.yokla((x) => x.acilamadi || (x.oynatici > 0 && x.skor && (gizli || (x.svg > 0 && !x.yukleniyor))), 45000) : { zamanAsimi: true };
  r.olcum.cizimMs = simdi() - t0;
  r.olcum.svg = d.svg ?? 0;
  if (durum !== 200) kalir("b", "sayfa açılmadı");
  else if (d.acilamadi) kalir("b", '"Tab açılamadı" mesajı');
  else if (d.zamanAsimi) kalir("b", !d.oynatici ? "oynatıcı kurulmadı (45 sn)" : !d.skor ? "parça yüklenmedi (45 sn)" : d.svg === 0 ? "alphaTab çizmedi: svg yok (45 sn)" : '"Tab yükleniyor…" kalkmadı (45 sn)');
  else r.olcut.b = true;
  // Çizim kaldıysa tanı: oynatıcı kapları, boyutları, çizilen öğeler
  if (r.olcut.b === false && durum === 200) r.olcum.tani = await s.js("window.__gfSonda.tani()").catch((e) => String(e));

  // (c) oynatıcı hazır: ses bankası + MIDI
  if (r.olcut.b) {
    const etiketler = new Set();
    d = await s.yokla((x) => (x.calEtiket && etiketler.add(x.calEtiket.replace(/\d+/, "N")), x.hazir || x.acilamadi), 90000);
    // Arayüz, alphaTab'ın "hazır" olayından bir çizim sonra güncellenir
    if (d.hazir && d.calKilitli) d = await s.yokla((x) => !x.calKilitli, 3000);
    r.olcum.hazirMs = simdi() - t0;
    r.olcum.yuklenirkenEtiket = [...etiketler];
    if (!d.hazir) kalir("c", d.acilamadi ? "ses bankası ya da MIDI yüklenemedi (hata durumu)" : `oynatıcı 90 sn'de hazır olmadı (Çal etiketi: "${d.calEtiket}", kilitli: ${d.calKilitli})`);
    else if (d.calKilitli) kalir("c", "oynatıcı hazır ama Çal düğmesi kilitli");
    else r.olcut.c = true;
  } else r.olcut.c = false;

  // (f) programlar ses bankasında var mı
  const parca = r.olcut.b ? await s.js("window.__gfSonda.parca(0)") : null;
  if (parca) {
    r.olcum.izler = parca.izler.map((z) => ({ ad: z.ad, program: z.perkusyon ? "davul" : z.program, ek: z.ekProgram.length ? z.ekProgram : undefined }));
    r.olcum.tempo = parca.tempo;
    r.olcum.olcu = parca.olcu;
    const eksik = presetDenetimi(parca, bankalar);
    if (eksik.length) kalir("f", eksik.join("; "));
    else r.olcut.f = true;
    if (sayfa.beklenenProgram !== undefined && !parca.izler.some((z) => z.program === sayfa.beklenenProgram)) r.neden.push(`(bilgi) ton ipucu program ${sayfa.beklenenProgram} bekliyor, track ${parca.izler.map((z) => z.program).join(",")}`);
  }

  // (d) konum ilerliyor, (e) gerçek ses. Metronom kapatılır: ölçülen ses notaların kendisi olsun.
  if (r.olcut.c) {
    if (await s.js(`document.querySelector('${METRONOM}')?.getAttribute("aria-pressed") === "true"`)) await s.js(`window.__gfSonda.tikla('${METRONOM}')`, true);
    // Parça uzun bir susla başlıyorsa ilk notaya kadar beklenir (en çok 12 sn)
    const ilkNotaMs = parca ? (parca.ilkNota / 960) * (60000 / parca.tempo) : 0;
    const o = await calVeOlc(s, 0, { enCok: Math.min(12000, 3500 + ilkNotaMs) });
    r.olcum.cal = { ...o, ilkNotaMs: Math.round(ilkNotaMs) };
    if (!o.basildi) kalir("d", "Çal düğmesine basılamadı");
    else if (!o.ilerledi) kalir("d", `Çal'a basıldı ama konum ilerlemedi (durum ${o.caldi ? "çalıyor" : "duruyor"}, tick ${o.tick0}→${o.tick}, AudioContext: ${o.ctx.join(",") || "yok"})`);
    else r.olcut.d = true;
    if (!o.basildi) r.olcut.e = false;
    else if (o.rms <= ESIK) kalir("e", `ses yok: RMS ${o.rms.toExponential(2)} (eşik ${ESIK}), AudioContext: ${o.ctx.join(",") || "yok"}, ${o.ilerledi ? "konum ilerliyor" : "konum ilerlemiyor"}`);
    else r.olcut.e = true;
    await duraklat(s);

    // Türe özgü ek adımlar
    if (sayfa.tur === "transkripsiyon") {
      await s.js(`window.__gfSonda.metinTikla("Tabı göster")`, true);
      const g = await s.yokla((x) => x.svg > 0 && !x.yukleniyor, 15000);
      r.olcum.tabGoster = { svg: g.svg };
      if (g.zamanAsimi) kalir("b", '"Tabı göster" sonrası tab çizilmedi');
    } else if (sayfa.tur === "quickstudy") {
      // "Eşlikle çal": gitar susar, eşlik (bas, akor, davul) duyulmalı
      await s.js(`window.__gfSonda.api(0).stop()`);
      await s.js(`window.__gfSonda.metinTikla("Eşlikle çal")`, true);
      await bekle(300);
      const e = await calVeOlc(s, 0);
      r.olcum.eslikleCal = e;
      if (!e.ilerledi) kalir("d", '"Eşlikle çal" adımında konum ilerlemedi');
      if (e.rms <= ESIK) kalir("e", `"Eşlikle çal" adımında ses yok (RMS ${e.rms.toExponential(2)})`);
      await duraklat(s);
    }
  } else {
    r.olcut.d = false;
    r.olcut.e = false;
  }

  // (a) sayfa 200 ve konsol temiz (en sonda: çalma sırasındaki hatalar da sayılır)
  r.olcum.hatalar = [...new Set(s.hatalar)].slice(0, 5);
  if (durum !== 200) kalir("a", `HTTP ${durum}`);
  else if (s.hatalar.length) kalir("a", `konsol: ${r.olcum.hatalar[0]}`);
  else r.olcut.a = true;
  r.olcum.sureMs = simdi() - t0;
  r.gecti = ["a", "b", "c", "d", "e", "f"].every((k) => r.olcut[k] === true);
  return r;
}

/** Tabsız okuma dersi: yalnız (a) */
async function tabsizSayfa(s, sayfa) {
  const r = { ...sayfa, olcut: {}, neden: [], olcum: {} };
  const durum = await s.git(sayfa.url);
  await bekle(600);
  r.olcum.http = durum;
  r.olcum.hatalar = [...new Set(s.hatalar)].slice(0, 5);
  r.olcut.a = durum === 200 && !s.hatalar.length;
  if (!r.olcut.a) r.neden.push(`(a) ${durum !== 200 ? `HTTP ${durum}` : `konsol: ${r.olcum.hatalar[0]}`}`);
  r.gecti = r.olcut.a;
  return r;
}

/** Teori yolu adımı: (a) + "Başla" soruyu açıyor; sesli sorularda (kulak, ritim, "Sesi dinle") gerçek ses (e) */
async function adimSayfasi(s, sayfa) {
  const r = { ...sayfa, olcut: {}, neden: [], olcum: {} };
  const durum = await s.git(sayfa.url);
  r.olcum.http = durum;
  if (durum === 200) {
    await s.js("window.__gfSonda.sifirla()");
    const basladi = await s.js(`(async () => { for (let k = 0; k < 60; k++) { if (window.__gfSonda.metinTikla("Başla")) return true; await new Promise((r) => setTimeout(r, 100)); } return false; })()`, true);
    let soru = false;
    for (let k = 0; k < 40 && basladi && !soru; k++) {
      soru = await s.js(`/Soru 1 \\//.test(document.body.innerText)`);
      if (!soru) await bekle(100);
    }
    r.olcut.b = soru;
    if (!soru) r.neden.push(`(b) ${basladi ? "soru açılmadı" : '"Başla" düğmesi yok'}`);
    if (soru) {
      // Kulak ve ritim soruları açılınca kendiliğinden çalar; diğerlerinde varsa "Sesi dinle"
      const dinle = await s.js(`!!(window.__gfSonda.dugme("Tekrar dinle") || window.__gfSonda.dugme("Sesi dinle"))`);
      r.olcum.sesli = dinle;
      if (dinle) {
        let ses = { rms: 0 };
        const son = simdi() + 3000;
        let tiklandi = sayfa.yol === "kulak" || sayfa.yol === "ritim";
        while (simdi() < son) {
          await bekle(200);
          ses = await s.js("window.__gfSonda.ses()");
          if (ses.rms > ESIK) break;
          if (!tiklandi && simdi() > son - 2500) {
            tiklandi = true;
            await s.js(`window.__gfSonda.metinTikla("Sesi dinle") || window.__gfSonda.metinTikla("Tekrar dinle")`, true);
          }
        }
        r.olcum.rms = ses.rms;
        r.olcut.e = ses.rms > ESIK;
        if (!r.olcut.e) r.neden.push(`(e) soru sesi yok: RMS ${ses.rms.toExponential(2)}, AudioContext: ${(ses.ctx ?? []).join(",") || "yok"}`);
      }
    }
  }
  r.olcum.hatalar = [...new Set(s.hatalar)].slice(0, 5);
  r.olcut.a = durum === 200 && !s.hatalar.length;
  if (!r.olcut.a) r.neden.push(`(a) ${durum !== 200 ? `HTTP ${durum}` : `konsol: ${r.olcum.hatalar[0]}`}`);
  r.gecti = Object.values(r.olcut).every(Boolean);
  return r;
}

/** (g) Örnek derste: varsayılan ilk açılış (sayım + metronom), sayımsız, hız, döngü, ana ses, duraklat/sürdür */
async function ekSenaryo(s, sayfa) {
  const r = { url: sayfa.url, kimlik: sayfa.kimlik, adimlar: {}, neden: [] };
  const adim = (ad, ok, ayrinti) => {
    r.adimlar[ad] = { gecti: !!ok, ...ayrinti };
    if (!ok) r.neden.push(`${ad}: ${JSON.stringify(ayrinti)}`);
  };
  await s.depoAyarla(null);
  await s.git(sayfa.url);
  await s.js(`localStorage.removeItem("gf-oynatici")`);
  await s.git(sayfa.url);
  let d = await s.yokla((x) => x.hazir, 90000);
  if (!d.hazir) {
    adim("hazir", false, { calEtiket: d.calEtiket });
    r.gecti = false;
    return r;
  }
  const parca = await s.js("window.__gfSonda.parca(0)");
  const vurusMs = (60000 / parca.tempo) * (4 / parca.payda);
  const sayimMs = vurusMs * parca.pay;

  // 1) Varsayılan ilk açılış: derste sayım ve metronom açık. Sayım duyulur, sonra konum ilerler.
  await s.js("window.__gfSonda.sifirla()");
  await s.js(`window.__gfSonda.tikla('${CAL}')`, true);
  const t0 = simdi();
  const tick0 = d.tick ?? 0;
  let sayimGorundu = false;
  let sayimRms = 0;
  let ilerlemeMs = null;
  while (simdi() - t0 < sayimMs + 4000) {
    await bekle(100);
    d = await s.durum();
    if (d.sayim) sayimGorundu = true;
    // Sayım sürerken konum yerinde durur; sayım bitince ilerlemeye başlar
    if (d.tick > tick0 + 30) {
      ilerlemeMs = simdi() - t0;
      break;
    }
    sayimRms = (await s.js("window.__gfSonda.ses()")).rms;
  }
  // Sayım yaklaşık bir ölçü sürmeli (alt sınır: yarısı; üst sınır: döngü sınırı)
  adim("varsayilan-sayim", sayimGorundu && sayimRms > ESIK && ilerlemeMs !== null && ilerlemeMs > sayimMs * 0.5, { sayimGorundu, sayimRms, sayimMs: Math.round(sayimMs), ilerlemeMs });
  adim("varsayilan-ses", (await pencere(s, 1200)) > ESIK, {});

  // 2) Duraklat: ses söner; sürdür (sayım yeniden sayar)
  await duraklat(s);
  await bekle(1500);
  adim("duraklat-sessiz", (await pencere(s, 500)) < SESSIZ, {});

  // 3) Sayım ve metronom kapalı: hemen başlar, yalnız nota sesi
  await s.js(`window.__gfSonda.metinTikla("Sayım")`, true);
  if (await s.js(`document.querySelector('${METRONOM}')?.getAttribute("aria-pressed") === "true"`)) await s.js(`window.__gfSonda.tikla('${METRONOM}')`, true);
  await s.js(`window.__gfSonda.api(0).stop()`);
  await bekle(200);
  const o = await calVeOlc(s, 0, { enCok: Math.min(12000, 3500 + (parca.ilkNota / 960) * (60000 / parca.tempo)) });
  adim("sayimsiz-nota", o.ilerledi && o.rms > ESIK, { rms: o.rms, ilerledi: o.ilerledi });

  // 4) Hız %50 → ses sürer, konum ilerler; sonra %100
  await s.js(`window.__gfSonda.metinTikla("%50")`, true);
  await bekle(300);
  let t1 = (await s.durum()).tick;
  let rms = await pencere(s, 1500);
  d = await s.durum();
  // İlk pencere sessizse (uzun nota sönmüş olabilir) bir pencere daha dinlenir
  const ilkPencere = rms;
  if (rms <= ESIK) rms = await pencere(s, 2500);
  adim("hiz-50", d.hiz === 0.5 && d.tick !== t1 && rms > ESIK, { hiz: d.hiz, rms, ilkPencere, tick: [t1, d.tick] });
  await s.js(`window.__gfSonda.metinTikla("%100")`, true);

  // 5) Ana ses %0 → sessiz (konum ilerler); %100 → ses geri gelir; hoparlör düğmesi sessize alır
  const SES = 'input[aria-label="Ana ses"]';
  if (await s.js(`!!document.querySelector('${SES}')`)) {
    await s.js(`window.__gfSonda.kaydir('${SES}', 0)`, true);
    await bekle(700);
    t1 = (await s.durum()).tick;
    rms = await pencere(s, 1200);
    d = await s.durum();
    adim("ana-ses-0", rms < SESSIZ && d.tick !== t1 && d.calma === 1, { rms, anaSes: d.anaSes });
    await s.js(`window.__gfSonda.kaydir('${SES}', 100)`, true);
    await bekle(300);
    rms = await pencere(s, 1500);
    d = await s.durum();
    adim("ana-ses-100", rms > ESIK && Math.abs(d.anaSes - 1) < 0.01, { rms, anaSes: d.anaSes });
    await s.js(`window.__gfSonda.tikla('button[data-ana-ses-dugmesi]')`, true);
    await bekle(700);
    rms = await pencere(s, 1000);
    adim("hoparlor-sessiz", rms < SESSIZ, { rms });
    await s.js(`window.__gfSonda.tikla('button[data-ana-ses-dugmesi]')`, true);
    await bekle(300);
    rms = await pencere(s, 1500);
    adim("hoparlor-ac", rms > ESIK, { rms });
    // Kalıcılık: tercih gf-oynatici'de
    await s.js(`window.__gfSonda.kaydir('${SES}', 60)`, true);
    await bekle(200);
    const kayit = await s.js(`JSON.parse(localStorage.getItem("gf-oynatici") || "{}").anaSes`);
    adim("ana-ses-kalici", kayit === 60, { kayit });
    await s.js(`window.__gfSonda.kaydir('${SES}', 100)`, true);
  } else adim("ana-ses-0", false, { neden: "ana ses kaydırıcısı yok" });

  // 6) Metronom açık (her vuruş): ses sürer
  await s.js(`window.__gfSonda.tikla('${METRONOM}')`, true);
  await bekle(300);
  adim("metronom-acik", (await pencere(s, 1500)) > ESIK, {});
  await s.js(`window.__gfSonda.tikla('${METRONOM}')`, true);

  // 7) Döngü: "Bu ölçü" → aralık kurulur; aralığın sonuna yaklaşınca başa sarar ve ses sürer
  await s.js(`window.__gfSonda.metinTikla("Bu ölçü")`, true);
  await bekle(300);
  d = await s.durum();
  if (d.aralik && d.dongu) {
    const [bas, son] = d.aralik;
    await s.js(`window.__gfSonda.api(0).tickPosition = ${Math.max(bas, son - 480)}`);
    let sardi = false;
    let onceki = Math.max(bas, son - 480);
    const tSon = simdi() + vurusMs * 2 + 3000;
    while (simdi() < tSon && !sardi) {
      await bekle(100);
      const x = await s.durum();
      if (x.tick < onceki - 100) sardi = true;
      onceki = x.tick;
    }
    await bekle(300);
    rms = await pencere(s, 1500);
    d = await s.durum();
    adim("dongu", sardi && d.calma === 1 && rms > ESIK, { sardi, calma: d.calma, rms, aralik: [bas, son] });
  } else adim("dongu", false, { aralik: d.aralik, dongu: d.dongu });
  await duraklat(s);
  r.hatalar = [...new Set(s.hatalar)].slice(0, 5);
  r.gecti = Object.values(r.adimlar).every((a) => a.gecti);
  return r;
}

// ── Kök neden senaryoları ────────────────────────────────────────────────────
/** İstekleri araya girip değiştirir: `kural(url, method)` → { durum } | "kes" | null (dokunma) */
async function arayaGir(s, desen, kural) {
  s.araya = async (p) => {
    const k = kural(p.request.url, p.request.method);
    try {
      if (k === "kes") await s.gonder("Fetch.failRequest", { requestId: p.requestId, errorReason: "Failed" });
      else if (k) await s.gonder("Fetch.fulfillRequest", { requestId: p.requestId, responseCode: k.durum, responseHeaders: [{ name: "Content-Type", value: "text/plain" }], body: Buffer.from("yok").toString("base64") });
      else await s.gonder("Fetch.continueRequest", { requestId: p.requestId });
    } catch {
      // Sayfa değiştiyse istek düşmüş olabilir
    }
  };
  await s.gonder("Fetch.enable", { patterns: [{ urlPattern: desen }] });
}
const arayiBirak = async (s) => {
  await s.gonder("Fetch.disable");
  s.araya = null;
};

async function kokNedenSenaryolari(cdp, ornek, bankalar) {
  const sonuc = [];
  const kayit = (ad, gecti, ayrinti) => sonuc.push({ ad, gecti: !!gecti, ...ayrinti });
  const yeni = async (depo = { sayim: false }) => new Sekme(cdp).ac(depo);
  const metronomKapat = async (s) => {
    if (await s.js(`document.querySelector('${METRONOM}')?.getAttribute("aria-pressed") === "true"`)) await s.js(`window.__gfSonda.tikla('${METRONOM}')`, true);
  };

  // S1) Ses bankası yüklenmeden Çal'a basılırsa: düğme kilitli mi, "Ses %N" göstergesi var mı
  {
    const s = await yeni();
    // 30 MB'lık bankayı yavaşlat (yaklaşık 4 MB/sn): yükleme süresince durum izlenir
    await s.gonder("Network.emulateNetworkConditions", { offline: false, latency: 20, downloadThroughput: 4e6, uploadThroughput: 4e6 });
    await s.git(ornek.url);
    const etiketler = new Set();
    let kilitliyken = 0;
    let erkenTik = false;
    let uyari = null;
    const d = await s.yokla((x) => {
      if (x.calEtiket) etiketler.add(x.calEtiket.replace(/\d+/, "N"));
      if (x.sesUyari) uyari = x.sesUyari.replace(/\d+/, "N");
      if (!x.hazir && x.calKilitli) kilitliyken++;
      if (!x.hazir && (x.calma === 1 || x.tick > 10)) erkenTik = true;
      return x.hazir;
    }, 120000, 0, 250);
    // Hazır olmadan önce basma denemesi: kilitli düğme tıklanamaz (sonda `false` döner)
    await metronomKapat(s);
    const o = d.hazir ? await calVeOlc(s) : null;
    kayit("S1 ses bankası yüklenmeden Çal", d.hazir && kilitliyken > 0 && [...etiketler].some((e) => /Ses %N/.test(e)) && !erkenTik && o?.rms > ESIK, {
      aciklama: "Yükleme sürerken Çal kilitli olmalı ve yüzde göstermeli; hazır olunca çalıp ses vermeli",
      etiketler: [...etiketler], kilitliOrnek: kilitliyken, uyariMetni: uyari, hazir: !!d.hazir, rms: o?.rms,
    });
    await s.kapat();
  }

  // S2) GeneralUser.sf2 yok (npm install eksik): sonivox'a düşmeli, ses gelmeli
  {
    const s = await yeni();
    await arayaGir(s, "*GeneralUser.sf2*", () => ({ durum: 404 }));
    await s.git(ornek.url);
    const d = await s.yokla((x) => x.hazir || x.acilamadi, 60000);
    await metronomKapat(s);
    const o = d.hazir ? await calVeOlc(s) : null;
    const sonivox = s.istekler.some((i) => i.url.includes("sonivox.sf2") && i.durum === 200 && i.yontem === "GET");
    kayit("S2 GeneralUser.sf2 yok → sonivox", d.hazir && sonivox && o?.rms > ESIK, { hazir: !!d.hazir, sonivoxIstendi: sonivox, rms: o?.rms, acilamadi: d.acilamadi, uyariMetni: d.sesUyari });
    await arayiBirak(s);
    await s.kapat();
  }

  // S3) GeneralUser var görünüyor (HEAD 200) ama indirme yarıda kesiliyor: yedek bankaya düşmeli, tab ekranda kalmalı
  {
    const s = await yeni();
    await arayaGir(s, "*GeneralUser.sf2*", (_u, m) => (m === "HEAD" ? null : "kes"));
    await s.git(ornek.url);
    const d = await s.yokla((x) => x.hazir && x.svg > 0, 45000);
    await metronomKapat(s);
    const o = d.hazir ? await calVeOlc(s) : null;
    kayit("S3 ses bankası indirilemedi → yedek banka", d.hazir && !d.acilamadi && d.svg > 0 && o?.rms > ESIK, { hazir: !!d.hazir, acilamadi: d.acilamadi, svg: d.svg, calEtiket: d.calEtiket, uyariMetni: d.sesUyari, rms: o?.rms });
    await arayiBirak(s);
    await s.kapat();
  }

  // S4) Hiçbir ses bankası yok: tab çizilmeli, "Tab açılamadı" yerine anlaşılır ses mesajı çıkmalı
  {
    const s = await yeni();
    await arayaGir(s, "*.sf2*", () => ({ durum: 404 }));
    await s.git(ornek.url);
    const d = await s.yokla((x) => !!x.sesUyari && /yüklenemedi/i.test(x.sesUyari) && x.svg > 0, 45000);
    kayit("S4 hiç ses bankası yok → anlaşılır mesaj", !d.zamanAsimi && !d.acilamadi && d.svg > 0 && d.calKilitli === true, { uyariMetni: d.sesUyari, acilamadi: d.acilamadi, svg: d.svg, calEtiket: d.calEtiket, calKilitli: d.calKilitli });
    await arayiBirak(s);
    await s.kapat();
  }

  // S5) AudioContext askıda (tarayıcı/Electron etkileşim öncesi): Çal'a basınca sürmeli
  {
    const s = await yeni();
    await s.git(ornek.url);
    const d = await s.yokla((x) => x.hazir, 90000);
    await metronomKapat(s);
    // AudioContext ilk Çal'da kurulur: önce çal-duraklat, sonra bağlamı askıya al (uyku, ses aygıtı değişimi, tarayıcı politikası)
    if (d.hazir) {
      await calVeOlc(s);
      await duraklat(s);
      await bekle(300);
    }
    const askida = d.hazir ? await s.js("window.__gfSonda.askiyaAl()") : [];
    const o = d.hazir ? await calVeOlc(s) : null;
    kayit("S5 AudioContext askıda → Çal ile sürer", askida.length > 0 && askida.every((c) => c === "suspended") && o?.ilerledi && o?.rms > ESIK && o.ctx.every((c) => c === "running"), { once: askida, sonra: o?.ctx, rms: o?.rms, ilerledi: o?.ilerledi });
    await s.kapat();
  }

  // S6) Ayarlardan sonivox bankası seçili: ses gelmeli
  {
    const s = await yeni({ sayim: false, sesBankasi: "sonivox" });
    await s.git(ornek.url);
    const d = await s.yokla((x) => x.hazir, 60000);
    await metronomKapat(s);
    const o = d.hazir ? await calVeOlc(s) : null;
    const gu = s.istekler.some((i) => i.url.includes("GeneralUser.sf2") && i.yontem === "GET");
    kayit("S6 sonivox bankası seçili", d.hazir && o?.rms > ESIK && !gu, { rms: o?.rms, generalUserIstendi: gu });
    await s.kapat();
  }

  // S7) Statik sunum: sf2 ve alphaTab dosyalarının durum kodu, boyutu ve başlıkları (Electron aynı `next start`ı kullanır)
  {
    const dosyalar = ["/alphatab/soundfont/GeneralUser.sf2", "/alphatab/soundfont/sonivox.sf2", "/alphatab/alphaTab.gf.js", "/alphatab/font/Bravura.woff2"];
    const satirlar = [];
    let tamam = true;
    for (const f of dosyalar) {
      const yerel = path.join(ROOT, "public", f);
      const boy = existsSync(yerel) ? readFileSync(yerel).length : -1;
      const h = await fetch(BASE + f, { method: "HEAD" });
      const g = await fetch(BASE + f);
      const govde = Buffer.from(await g.arrayBuffer());
      const ok = h.status === 200 && g.status === 200 && govde.length === boy && (!f.endsWith(".sf2") || govde.toString("latin1", 0, 4) === "RIFF");
      if (!ok) tamam = false;
      satirlar.push({ dosya: f, head: h.status, get: g.status, boyut: govde.length, yerelBoyut: boy, tur: g.headers.get("content-type"), onbellek: g.headers.get("cache-control"), ok });
    }
    kayit("S7 statik dosya sunumu (sf2, alphaTab, font)", tamam, { dosyalar: satirlar, presetSayisi: Object.fromEntries(Object.entries(bankalar).map(([k, v]) => [k, v.size])) });
  }
  return sonuc;
}

// ── Süreçler ─────────────────────────────────────────────────────────────────
function chromeYolu() {
  const adaylar = [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"];
  const yol = adaylar.find((a) => a && existsSync(a));
  if (!yol) throw new Error("Chrome bulunamadı (CHROME_PATH ile yolunu ver)");
  return yol;
}
async function sunucuBekle() {
  for (let i = 0; i < 240; i++) {
    try {
      if ((await fetch(BASE + "/alphatab/alphaTab.gf.js", { method: "HEAD" })).ok) return;
    } catch {
      // henüz açılmadı
    }
    await bekle(500);
  }
  throw new Error("Sunucu açılmadı");
}
const kapat = (surec) => {
  if (!surec || surec.exitCode !== null) return;
  try {
    process.kill(surec.pid, "SIGTERM");
  } catch {
    // zaten kapanmış
  }
};

// ── Özet ─────────────────────────────────────────────────────────────────────
const OLCUTLER = ["a", "b", "c", "d", "e", "f"];
function ozetYaz(sonuc) {
  const { sayfalar, ek, senaryolar } = sonuc;
  const s = [];
  const gecen = sayfalar.filter((x) => x.gecti).length;
  s.push(`# Oynatıcı testi özeti`, "", `Tarih: ${sonuc.tarih} · süre: ${Math.round(sonuc.sureSn / 60)} dk ${sonuc.sureSn % 60} sn · paralel sekme: ${sonuc.es}`, "");
  s.push(`**${sayfalar.length} sayfa denendi · ${gecen} geçti · ${sayfalar.length - gecen} kaldı**`, "");
  s.push("Ölçütler: (a) sayfa 200 + konsol temiz · (b) çizim · (c) oynatıcı hazır · (d) konum ilerliyor · (e) gerçek ses (RMS) · (f) MIDI programı ses bankasında", "");
  s.push("## Ölçüt bazında", "", "| Ölçüt | Uygulanan | Geçen | Kalan |", "|---|---:|---:|---:|");
  for (const k of OLCUTLER) {
    const u = sayfalar.filter((x) => x.olcut[k] !== undefined);
    s.push(`| (${k}) | ${u.length} | ${u.filter((x) => x.olcut[k]).length} | ${u.filter((x) => !x.olcut[k]).length} |`);
  }
  s.push("", "## Kurs / bölüm bazında", "", "| Grup | Sayfa | Geçen | Kalan | a | b | c | d | e | f |", "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
  const gruplar = [...new Set(sayfalar.map((x) => x.grup))];
  for (const g of gruplar) {
    const u = sayfalar.filter((x) => x.grup === g);
    const kalan = (k) => u.filter((x) => x.olcut[k] === false).length || "";
    s.push(`| ${g} | ${u.length} | ${u.filter((x) => x.gecti).length} | ${u.filter((x) => !x.gecti).length} | ${OLCUTLER.map(kalan).join(" | ")} |`);
  }
  s.push("", "(a–f sütunları: o ölçütten kalan sayfa sayısı; boş = hepsi geçti)", "");
  const kalanlar = sayfalar.filter((x) => !x.gecti);
  s.push(`## Kalanlar (${kalanlar.length})`, "");
  if (!kalanlar.length) s.push("Yok.");
  for (const x of kalanlar) s.push(`- \`${x.kimlik}\` · ${x.url} · ${x.baslik}${x.tekrar ? " · (tekrar denendi)" : ""}\n  - ${x.neden.filter((n) => !n.startsWith("(bilgi)")).join("\n  - ")}`);
  const programlar = new Map();
  for (const x of sayfalar) for (const z of x.olcum?.izler ?? []) programlar.set(z.program, (programlar.get(z.program) ?? 0) + 1);
  s.push("", "## Kullanılan MIDI programları (track sayısı)", "", [...programlar].sort((a, b) => b[1] - a[1]).map(([p, n]) => `${p}: ${n}`).join(" · "), "");
  if (ek?.length) {
    s.push(`## (g) Çalma ayarları: ${ek.length} örnek ders`, "", "| Adım | Geçen | Kalan |", "|---|---:|---:|");
    const adlar = [...new Set(ek.flatMap((e) => Object.keys(e.adimlar)))];
    for (const a of adlar) s.push(`| ${a} | ${ek.filter((e) => e.adimlar[a]?.gecti).length} | ${ek.filter((e) => e.adimlar[a] && !e.adimlar[a].gecti).length} |`);
    const k = ek.filter((e) => !e.gecti);
    if (k.length) s.push("", ...k.map((e) => `- \`${e.kimlik}\`: ${e.neden.join(" · ")}`));
    s.push("");
  }
  if (senaryolar?.length) {
    s.push("## Kök neden senaryoları", "", "| Senaryo | Sonuç | Ayrıntı |", "|---|---|---|");
    for (const x of senaryolar) {
      const { ad, gecti, ...ayrinti } = x;
      s.push(`| ${ad} | ${gecti ? "geçti" : "KALDI"} | \`${JSON.stringify(ayrinti).replace(/\|/g, "/").slice(0, 600)}\` |`);
    }
    s.push("");
  }
  return s.join("\n");
}

// ── Ana akış ─────────────────────────────────────────────────────────────────
async function main() {
  const basla = simdi();
  mkdirSync(CIKTI, { recursive: true });
  if (!arg("atla-build")) {
    console.log("Derleniyor (npm run build)…");
    const b = spawnSync("npm", ["run", "build"], { cwd: ROOT, stdio: ["ignore", "ignore", "inherit"], shell: process.platform === "win32" });
    if (b.status !== 0) throw new Error("build başarısız");
  }
  let sayfalar = sayfaListesi();
  if (FILTRE) sayfalar = sayfalar.filter((x) => FILTRE.test(x.url) || FILTRE.test(x.tur));
  if (LIMIT) sayfalar = sayfalar.slice(0, LIMIT);
  const sfDir = path.join(ROOT, "public", "alphatab", "soundfont");
  const bankalar = {};
  for (const [ad, dosya] of [["GeneralUser", "GeneralUser.sf2"], ["sonivox", "sonivox.sf2"]]) if (existsSync(path.join(sfDir, dosya))) bankalar[ad] = sf2Presetleri(path.join(sfDir, dosya));
  console.log(`${sayfalar.length} sayfa · ses bankaları: ${Object.entries(bankalar).map(([k, v]) => `${k} (${v.size} preset)`).join(", ")}`);

  let sunucu = null;
  let chrome = null;
  // Sunucu çıktısı (yarıda kesilen akış uyarıları dahil) dosyaya
  const sunucuLog = openSync(path.join(CIKTI, "sunucu.log"), "w");
  const temizle = () => {
    kapat(chrome);
    kapat(sunucu);
  };
  process.on("SIGINT", () => (temizle(), process.exit(130)));
  process.on("SIGTERM", () => (temizle(), process.exit(143)));
  try {
    sunucu = spawn(process.execPath, [path.join(ROOT, "node_modules", "next", "dist", "bin", "next"), "start", "-p", String(PORT), "-H", "127.0.0.1"], { cwd: ROOT, env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" }, stdio: ["ignore", sunucuLog, sunucuLog] });
    await sunucuBekle();
    const profil = path.join(CIKTI, "chrome-profil");
    rmSync(profil, { recursive: true, force: true });
    chrome = spawn(chromeYolu(), [
      "--headless=new", `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profil}`, "--autoplay-policy=no-user-gesture-required", "--no-first-run", "--no-default-browser-check",
      "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows", "--disable-features=CalculateNativeWinOcclusion", "--mute-audio",
      "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage", "about:blank",
    ], { stdio: "ignore" });
    const cdp = await Cdp.baglan(CDP_PORT);
    console.log(`Sunucu PID ${sunucu.pid} (${BASE}) · Chrome PID ${chrome.pid} (CDP ${CDP_PORT})`);

    // Ana tur: paralel sekmeler; her sekme kendi yalıtılmış deposunda (sayım kapalı: ölçülen ses notalar)
    const sonuclar = new Array(sayfalar.length);
    let sira = 0;
    let biten = 0;
    const birSayfa = async (s, sayfa) => (sayfa.tur === "adim" ? adimSayfasi(s, sayfa) : sayfa.tur === "tabsiz" ? tabsizSayfa(s, sayfa) : oynaticiSayfasi(s, sayfa, bankalar));
    const isci = async () => {
      let s = await new Sekme(cdp).ac({ sayim: false });
      for (;;) {
        const i = sira++;
        if (i >= sayfalar.length) break;
        try {
          sonuclar[i] = await Promise.race([birSayfa(s, sayfalar[i]), bekle(240000).then(() => Promise.reject(new Error("sayfa testi 240 sn'de bitmedi")))]);
        } catch (e) {
          sonuclar[i] = { ...sayfalar[i], olcut: { a: false }, neden: [`(a) test hatası: ${e.message}`], olcum: {}, gecti: false };
          await s.kapat();
          s = await new Sekme(cdp).ac({ sayim: false });
        }
        if (++biten % 25 === 0 || biten === sayfalar.length) console.log(`  ${biten}/${sayfalar.length} · kalan ${sonuclar.filter((x) => x && !x.gecti).length} · ${Math.round((simdi() - basla) / 1000)} sn`);
      }
      await s.kapat();
    };
    await Promise.all(Array.from({ length: Math.min(ES, sayfalar.length) }, isci));

    // Kalanlar tek sekmede bir kez daha denenir (paralel yükten kaynaklanan zaman aşımlarını ayıklamak için)
    const kalan = sonuclar.map((x, i) => (x.gecti ? -1 : i)).filter((i) => i >= 0);
    if (kalan.length) {
      console.log(`${kalan.length} kalan sayfa tek sekmede yeniden deneniyor…`);
      let s = await new Sekme(cdp).ac({ sayim: false });
      for (const i of kalan) {
        try {
          const ilk = sonuclar[i];
          sonuclar[i] = { ...(await birSayfa(s, sayfalar[i])), tekrar: true, ilkDeneme: ilk.neden };
        } catch (e) {
          sonuclar[i].neden.push(`(tekrar) ${e.message}`);
          await s.kapat();
          s = await new Sekme(cdp).ac({ sayim: false });
        }
      }
      await s.kapat();
    }

    // (g) Çalma ayarları: türlere yayılmış örnek dersler, ikişer sekmede
    const dersSayfalari = sayfalar.filter((x) => x.tur === "ders" && x.grup.startsWith("kurs:"));
    let ornekler = [];
    // --ek-filtre=<regex>: (g) yalnız bu derslerde (hata ayıklama)
    if (arg("ek-filtre")) ornekler = sayfaListesi().filter((x) => x.tur === "ders" && new RegExp(String(arg("ek-filtre"))).test(x.url));
    else if (EK_SAYI > 0 && dersSayfalari.length) {
      const adim = Math.max(1, Math.floor(dersSayfalari.length / EK_SAYI));
      for (let i = Math.floor(adim / 2); i < dersSayfalari.length && ornekler.length < EK_SAYI; i += adim) ornekler.push(dersSayfalari[i]);
    }
    const ek = new Array(ornekler.length);
    if (ornekler.length) {
      console.log(`(g) çalma ayarları: ${ornekler.length} örnek ders…`);
      let es = 0;
      await Promise.all(
        Array.from({ length: Math.min(3, ornekler.length) }, async () => {
          let s = await new Sekme(cdp).ac(null);
          for (;;) {
            const i = es++;
            if (i >= ornekler.length) break;
            try {
              ek[i] = await Promise.race([ekSenaryo(s, ornekler[i]), bekle(180000).then(() => Promise.reject(new Error("180 sn'de bitmedi")))]);
            } catch (e) {
              ek[i] = { url: ornekler[i].url, kimlik: ornekler[i].kimlik, adimlar: {}, neden: [`test hatası: ${e.message}`], gecti: false };
              await s.kapat();
              s = await new Sekme(cdp).ac(null);
            }
          }
          await s.kapat();
        }),
      );
    }

    // Kök neden senaryoları
    let senaryolar = [];
    const ornek = dersSayfalari[0] ?? sayfalar.find((x) => x.tur === "ders");
    if (ornek && !arg("senaryo-yok")) {
      console.log("Kök neden senaryoları…");
      try {
        senaryolar = await kokNedenSenaryolari(cdp, ornek, bankalar);
      } catch (e) {
        senaryolar.push({ ad: "senaryolar", gecti: false, hata: e.message });
      }
    }

    const sonuc = {
      tarih: new Date().toISOString(), sureSn: Math.round((simdi() - basla) / 1000), es: ES, esik: ESIK,
      ozet: {
        sayfa: sonuclar.length, gecen: sonuclar.filter((x) => x.gecti).length, kalan: sonuclar.filter((x) => !x.gecti).length,
        olcut: Object.fromEntries(OLCUTLER.map((k) => [k, { uygulanan: sonuclar.filter((x) => x.olcut[k] !== undefined).length, gecen: sonuclar.filter((x) => x.olcut[k] === true).length, kalan: sonuclar.filter((x) => x.olcut[k] === false).length }])),
        ek: { ornek: ek.length, gecen: ek.filter((e) => e.gecti).length }, senaryo: { toplam: senaryolar.length, gecen: senaryolar.filter((x) => x.gecti).length },
      },
      sayfalar: sonuclar, ek, senaryolar,
    };
    writeFileSync(path.join(CIKTI, "sonuc.json"), JSON.stringify(sonuc, null, 1));
    writeFileSync(path.join(CIKTI, "ozet.md"), ozetYaz(sonuc));
    console.log(`\n${sonuc.ozet.sayfa} sayfa · ${sonuc.ozet.gecen} geçti · ${sonuc.ozet.kalan} kaldı · (g) ${sonuc.ozet.ek.gecen}/${sonuc.ozet.ek.ornek} · senaryo ${sonuc.ozet.senaryo.gecen}/${sonuc.ozet.senaryo.toplam} · ${sonuc.sureSn} sn`);
    console.log(`Sonuç: ${path.join(CIKTI, "sonuc.json")} · ${path.join(CIKTI, "ozet.md")}`);
    cdp.ws.close();
    return sonuc.ozet.kalan || ek.some((e) => !e.gecti) || senaryolar.some((x) => !x.gecti) ? 1 : 0;
  } finally {
    temizle();
  }
}

// Bekleyen zamanlayıcılar süreci açık tutmasın: iş bitince açıkça çıkılır
main().then(
  (kod) => process.exit(kod),
  (e) => {
    console.error(e);
    process.exit(2);
  },
);
