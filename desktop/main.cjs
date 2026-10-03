// Masaüstü uygulaması (Electron).
// Siteyi arka planda bilgisayarda çalıştırır ve bir uygulama penceresinde açar.
// Aynı kod web sitesi olarak da çalışır; arayüzde yapılan her değişiklik ikisine birden yansır.
//
//   npm run desktop        → geliştirme modu: kod değişiklikleri pencerede anında görünür
//   npm run desktop:prod   → derlenmiş hızlı mod (önce `npm run build` çalıştırır)

const { app, BrowserWindow, Menu, shell, dialog } = require("electron");
const { spawn, execFile } = require("node:child_process");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const fs = require("node:fs");

const ROOT = path.join(__dirname, "..");
const PROD = process.argv.includes("--prod");
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
const ICON = path.join(__dirname, "icon.png");
const LOGO_SVG = path.join(ROOT, "public", "marka", "sahne.svg");

function splash() {
  let logo = "";
  try {
    logo = `<img src="data:image/svg+xml;base64,${fs.readFileSync(LOGO_SVG).toString("base64")}" width="120" height="120" style="border-radius:24px">`;
  } catch {}
  const html = `<!doctype html><html><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#071029;color:#ffffff;font-family:system-ui,sans-serif">
<div style="text-align:center">${logo}<div style="font-size:30px;font-weight:700;margin-top:16px">${APP_NAME}</div>
<p style="color:#a3b0cf">Başlatılıyor… İlk açılış bir dakika kadar sürebilir.</p></div></body></html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

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
        { type: "separator" },
        isMac ? { role: "close", label: "Kapat" } : { role: "quit", label: "Çıkış" },
      ],
    },
    {
      label: "Git",
      submenu: [
        { label: "Ana sayfa", accelerator: "CmdOrCtrl+1", click: () => go("/") },
        { label: "Yollar", accelerator: "CmdOrCtrl+2", click: () => go("/yollar") },
        { label: "Oynatıcı", accelerator: "CmdOrCtrl+3", click: () => go("/oynatici") },
        { label: "Teori", accelerator: "CmdOrCtrl+4", click: () => go("/teori") },
        { label: "Araçlar", accelerator: "CmdOrCtrl+5", click: () => go("/araclar") },
        { label: "İlerleme", accelerator: "CmdOrCtrl+6", click: () => go("/ilerleme") },
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
        { role: "toggleDevTools", label: "Geliştirici araçları" },
      ],
    },
  ]);
}

async function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#071029",
    title: APP_NAME,
    icon: fs.existsSync(ICON) ? ICON : undefined,
    autoHideMenuBar: false,
    webPreferences: { contextIsolation: true, sandbox: true },
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

  await win.loadURL(splash());

  const port = await freePort();
  baseUrl = `http://127.0.0.1:${port}`;
  startServer(port);
  try {
    await waitForServer(baseUrl + "/");
    await win.loadURL(baseUrl + "/");
  } catch (e) {
    dialog.showErrorBox("Başlatılamadı", String(e.message || e));
  }
}

app.setName(APP_NAME);

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
  app.whenReady().then(createWindow);
  app.on("before-quit", () => {
    app.isQuitting = true;
    stopServer();
  });
  app.on("window-all-closed", () => app.quit());
  process.on("exit", stopServer);
}
