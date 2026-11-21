// Masaüstü uygulaması (Electron).
// Siteyi arka planda bilgisayarda çalıştırır ve bir uygulama penceresinde açar.
// Aynı kod web sitesi olarak da çalışır; arayüzde yapılan her değişiklik ikisine birden yansır.
//
//   npm run desktop        → geliştirme modu: kod değişiklikleri pencerede anında görünür
//   npm run desktop:prod   → derlenmiş hızlı mod (önce `npm run build` çalıştırır)
//   --guncelle             → masaüstü kısayolunun kullandığı mod: önce GitHub'dan güncelleme
//                            çeker, gerekirse derler (bkz. guncelle.cjs), sonra açar

const { app, BrowserWindow, Menu, shell, dialog, nativeTheme, nativeImage, ipcMain } = require("electron");
const { spawn, execFile } = require("node:child_process");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const fs = require("node:fs");
const metronomMini = require("./metronom-mini.cjs");
const sarkiKutuphanesi = require("./sarki-kutuphanesi.cjs");
const { simgeleriYenile } = require("./simge-yenile.cjs");

const ROOT = path.join(__dirname, "..");
const AUTO_UPDATE = process.argv.includes("--guncelle");
let PROD = process.argv.includes("--prod");
const ARCHIVE_DIR = path.join(ROOT, "ozel-kaynak", "tablar");

let server = null;
let win = null;
let baseUrl = null;

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

// Pencere her açılışta aynı adreste (http://127.0.0.1:47823) açılır: tarayıcı depolaması (ilerleme, ayarlar, "Benim
// dosyalarım" IndexedDB'si) adrese bağlıdır, rastgele port her açılışta boş bir depo demekti. Port doluysa rastgele port.
const SABIT_PORT = 47823;
function appPort() {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.unref();
    srv.once("error", () => freePort().then(resolve, () => resolve(0)));
    srv.listen(SABIT_PORT, "127.0.0.1", () => srv.close(() => resolve(SABIT_PORT)));
  });
}

function waitForServer(url, timeoutMs = 180000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - started > timeoutMs) reject(new Error("Sunucu zamanında başlamadı"));
        else setTimeout(tryOnce, 500);
      });
    };
    tryOnce();
  });
}

function startServer(port) {
  // Next.js'i Electron'un içindeki Node ile çalıştır; ayrıca Node kurulu olması gerekmez.
  const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
  const args = [nextBin, PROD ? "start" : "dev", "-p", String(port), "-H", "127.0.0.1"];
  server = spawn(process.execPath, args, {
    cwd: ROOT,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", NEXT_TELEMETRY_DISABLED: "1" },
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (d) => process.stdout.write(d));
  server.stderr.on("data", (d) => process.stderr.write(d));
  server.on("exit", (code) => {
    if (code && !app.isQuitting) {
      dialog.showErrorBox("Sunucu kapandı", `Uygulama sunucusu beklenmedik şekilde kapandı (kod ${code}). Komut penceresindeki hataya bak.`);
    }
  });
}

function stopServer() {
  if (!server || server.exitCode !== null) return;
  if (process.platform === "win32") execFile("taskkill", ["/pid", String(server.pid), "/T", "/F"]);
  else {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      server.kill("SIGTERM");
    }
  }
}

const APP_NAME = "GuitarFlex";
const ICON = path.join(__dirname, process.platform === "win32" ? "icon.ico" : "icon.png");
const LOGO_SVG = path.join(ROOT, "public", "marka", "simge.svg");
// Güvenli köprü: window.guitarflexMasaustu (küçük metronom penceresi)
const PRELOAD = path.join(__dirname, "preload.cjs");

function splash() {
  let logo = "";
  try {
    logo = `<img src="data:image/svg+xml;base64,${fs.readFileSync(LOGO_SVG).toString("base64")}" width="120" height="120" style="border-radius:24px">`;
  } catch {}
  const html = `<!doctype html><html><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#000000;color:#F5F5F7;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',system-ui,sans-serif">
<div style="text-align:center">${logo}<div style="font-size:30px;font-weight:600;letter-spacing:-0.4px;margin-top:16px">${APP_NAME}</div>
<p id="durum" style="color:#A1A1A6;max-width:520px;margin:12px auto 0">Başlatılıyor… İlk açılış bir dakika kadar sürebilir.</p></div></body></html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function setStatus(text) {
  win?.webContents.executeJavaScript(`document.getElementById("durum") && (document.getElementById("durum").textContent = ${JSON.stringify(text)})`).catch(() => {});
}

/** Güncelleme simgeyi değiştirdiyse açık pencereye, açılış ekranına ve kısayollara yansıtır */
function simgeyiTazele() {
  try {
    if (win && !win.isDestroyed() && fs.existsSync(ICON)) win.setIcon(nativeImage.createFromPath(ICON));
  } catch {}
  try {
    const src = `data:image/svg+xml;base64,${fs.readFileSync(LOGO_SVG).toString("base64")}`;
    win?.webContents.executeJavaScript(`(() => { const i = document.querySelector("img"); if (i) i.src = ${JSON.stringify(src)}; })()`).catch(() => {});
  } catch {}
  simgeleriYenile({ ikon: path.join(__dirname, "icon.ico"), klasor: app.getPath("userData") }).catch(() => {});
}

function relaunchWithUpdate() {
  app.relaunch({ args: [path.join(__dirname, "main.cjs"), "--guncelle"] });
  app.exit(0);
}

// ── Görünüm teması: açık (varsayılan) · koyu · sistem. Sayfadaki tercih (localStorage) ile aynı tutulur; ana süreç
// kendi kopyasını userData/tema.json'da saklar (açılış zemini ve menüdeki seçim için).
const TEMALAR = ["acik", "koyu", "sistem"];
let tema = "acik";
function temaDosyasi() {
  return path.join(app.getPath("userData"), "tema.json");
}
function temaOku() {
  try {
    const t = JSON.parse(fs.readFileSync(temaDosyasi(), "utf8")).tema;
    if (TEMALAR.includes(t)) tema = t;
  } catch {
    // İlk açılış: açık tema
  }
  nativeTheme.themeSource = tema === "sistem" ? "system" : tema === "koyu" ? "dark" : "light";
}
function temaKoyuMu() {
  return tema === "koyu" || (tema === "sistem" && nativeTheme.shouldUseDarkColors);
}
/** kaynak "menu": sayfaya da uygula (localStorage + data-mod); "sayfa": sayfa zaten uyguladı */
function temaUygula(t, kaynak) {
  if (!TEMALAR.includes(t)) return;
  tema = t;
  try {
    fs.writeFileSync(temaDosyasi(), JSON.stringify({ tema }));
  } catch {
    // Yazılamazsa yalnız bu oturumda geçerli
  }
  nativeTheme.themeSource = tema === "sistem" ? "system" : tema === "koyu" ? "dark" : "light";
  const zemin = temaKoyuMu() ? "#000000" : "#FFFFFF";
  for (const w of BrowserWindow.getAllWindows()) if (!w.isDestroyed() && w !== sarkiPenceresi()) w.setBackgroundColor(zemin);
  if (kaynak === "menu" && win && !win.isDestroyed() && baseUrl && win.webContents.getURL().startsWith(baseUrl)) {
    win.webContents
      .executeJavaScript(`try{localStorage.setItem("gf-tema",${JSON.stringify(t)})}catch(e){};document.documentElement.setAttribute("data-mod",${JSON.stringify(t)});window.dispatchEvent(new Event("gf-tema-degisti"));`)
      .catch(() => {});
  }
  Menu.setApplicationMenu(buildMenu());
}
let sarkiPenceresi = () => null;
let sarkiAc = null;

function buildMenu() {
  const isMac = process.platform === "darwin";
  const go = (p) => win && baseUrl && win.loadURL(baseUrl + p);
  return Menu.buildFromTemplate([
    ...(isMac ? [{ role: "appMenu" }] : []),
    {
      label: "Dosya",
      submenu: [
        {
          label: "Tab arşivi klasörünü aç",
          click: () => {
            fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
            shell.openPath(ARCHIVE_DIR);
          },
        },
        { label: "Proje klasörünü aç", click: () => shell.openPath(ROOT) },
        {
          label: "İçerik deposunu aç",
          click: () => {
            const dir = path.join(ROOT, "..", "GuitarFlex-icerik");
            shell.openPath(fs.existsSync(dir) ? dir : path.join(ROOT, "ozel-kaynak"));
          },
        },
        { label: "Güncellemeleri denetle ve yeniden başlat", click: relaunchWithUpdate },
        { type: "separator" },
        isMac ? { role: "close", label: "Kapat" } : { role: "quit", label: "Çıkış" },
      ],
    },
    {
      label: "Git",
      submenu: [
        { label: "Ana sayfa", accelerator: "CmdOrCtrl+1", click: () => go("/") },
        { label: "Profil", accelerator: "CmdOrCtrl+2", click: () => go("/profil") },
        { label: "Şarkılarla Öğren", accelerator: "CmdOrCtrl+3", click: () => go("/sarkilar") },
        { label: "Şarkı Kütüphanesi (Songsterr)", accelerator: "CmdOrCtrl+K", click: () => sarkiAc && sarkiAc("") },
        { label: "Akustik Egzersizler", accelerator: "CmdOrCtrl+8", click: () => go("/akustik") },
        { label: "Gitarda Nasıl Çalışmalıyım?", accelerator: "CmdOrCtrl+9", click: () => go("/nasil-calismaliyim") },
        { label: "Tabla Keşfet", accelerator: "CmdOrCtrl+6", click: () => go("/oynatici") },
        { label: "Doğaçlama Çal", accelerator: "CmdOrCtrl+7", click: () => go("/sarkilar/dogaclama") },
        { label: "Müzik Teorisi", accelerator: "CmdOrCtrl+4", click: () => go("/teori") },
        { label: "Araçlar", accelerator: "CmdOrCtrl+5", click: () => go("/araclar") },
        { type: "separator" },
        { label: "Geri", accelerator: "Alt+Left", click: () => win?.webContents.navigationHistory.goBack() },
        { label: "İleri", accelerator: "Alt+Right", click: () => win?.webContents.navigationHistory.goForward() },
      ],
    },
    {
      label: "Görünüm",
      submenu: [
        { role: "reload", label: "Yenile" },
        { role: "resetZoom", label: "Gerçek boyut" },
        { role: "zoomIn", label: "Büyüt" },
        { role: "zoomOut", label: "Küçült" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Tam ekran" },
        { type: "separator" },
        {
          label: "Tema",
          submenu: [
            { label: "Açık (varsayılan)", type: "radio", checked: tema === "acik", click: () => temaUygula("acik", "menu") },
            { label: "Koyu", type: "radio", checked: tema === "koyu", click: () => temaUygula("koyu", "menu") },
            { label: "Sistem", type: "radio", checked: tema === "sistem", click: () => temaUygula("sistem", "menu") },
          ],
        },
        { role: "toggleDevTools", label: "Geliştirici araçları" },
      ],
    },
  ]);
}

// yeniden: sunucu zaten çalışırken (ör. küçük metronomdan "ana pencereye dön") ana pencereyi yeniden aç
async function createWindow(yeniden = false) {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    // Açılış zemini seçili temaya uysun (varsayılan açık; sayfa yüklenene kadar görünen renk)
    backgroundColor: temaKoyuMu() ? "#000000" : "#FFFFFF",
    title: APP_NAME,
    icon: fs.existsSync(ICON) ? ICON : undefined,
    autoHideMenuBar: false,
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, preload: PRELOAD },
  });
  Menu.setApplicationMenu(buildMenu());

  // Uygulama dışı bağlantılar varsayılan tarayıcıda açılsın.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!baseUrl || !url.startsWith(baseUrl)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (baseUrl && !url.startsWith(baseUrl)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  // Ana pencere kapatılınca küçük metronom açık kalabilir; kapanan pencereye dokunulmasın
  const buPencere = win;
  win.on("closed", () => {
    if (win === buPencere) win = null;
  });
  if (yeniden && baseUrl) {
    await win.loadURL(baseUrl + "/araclar");
    return;
  }

  await win.loadURL(splash());

  if (AUTO_UPDATE) {
    try {
      const { prepare } = require("./guncelle.cjs");
      const { mode, notes } = await prepare(ROOT, setStatus);
      PROD = mode === "prod";
      if (notes.length) {
        setStatus(notes.join(" "));
        await new Promise((r) => setTimeout(r, 2500));
      }
    } catch (e) {
      setStatus(`Güncelleme sırasında hata: ${e.message || e}. Mevcut sürümle açılıyor.`);
      await new Promise((r) => setTimeout(r, 2500));
    }
    setStatus(PROD ? "Açılıyor…" : "Geliştirme modunda açılıyor… (bir dakika kadar sürebilir)");
  }
  simgeyiTazele();

  const port = await appPort();
  baseUrl = `http://127.0.0.1:${port}`;
  startServer(port);
  try {
    await waitForServer(baseUrl + "/");
    await win.loadURL(baseUrl + "/");
    // Açılış ekranı geçmişte kalmasın: "Geri" tuşu onu tekrar açmasın
    win.webContents.navigationHistory.clear();
  } catch (e) {
    dialog.showErrorBox("Başlatılamadı", String(e.message || e));
  }
}

/** Ana pencereyi öne getirir; kapatılmışsa (küçük metronom açıkken) yeniden açar */
function anaPencereyiAc() {
  if (win && !win.isDestroyed()) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  } else if (baseUrl) {
    createWindow(true);
  }
}

app.setName(APP_NAME);
if (process.platform === "win32") app.setAppUserModelId("com.guitarflex.app");

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", anaPencereyiAc);
  app.whenReady().then(() => {
    temaOku();
    metronomMini.kur({ adres: () => baseUrl, anaPencereyiAc, ikon: fs.existsSync(ICON) ? ICON : undefined, preload: PRELOAD });
    const sk = sarkiKutuphanesi.kur({ uygulamaAdresi: () => baseUrl, anaPencere: () => win, ikon: fs.existsSync(ICON) ? ICON : undefined });
    sarkiAc = sk.ac;
    sarkiPenceresi = sk.pencere;
    ipcMain.on("tema-degisti", (e, t) => {
      if (baseUrl && e.senderFrame && e.senderFrame.url.startsWith(baseUrl)) temaUygula(String(t), "sayfa");
    });
    return createWindow();
  });
  app.on("before-quit", () => {
    app.isQuitting = true;
    stopServer();
  });
  app.on("window-all-closed", () => app.quit());
  process.on("exit", stopServer);
}
