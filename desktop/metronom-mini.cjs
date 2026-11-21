// Her zaman üstte duran küçük metronom penceresi (masaüstü uygulaması).
// Ana pencere "Küçük pencerede aç" deyince preload köprüsü üzerinden "metronom-mini-ac" gelir.
// Pencere çerçevesizdir; üst şerit sayfada -webkit-app-region: drag ile sürüklenir.
// Konum ve boyut userData/metronom-mini.json dosyasında tutulur.

const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

const VARSAYILAN = { width: 280, height: 170 };
const EN_AZ = { width: 220, height: 140 };
const KENAR = 24;

/** Kayıtlı konumu ekranlara göre doğrular; görünmüyorsa birincil ekranın sağ altına koyar (saf işlev, birim testli) */
function konumSec(kayit, calismaAlanlari, birincil) {
  const sayi = (v) => typeof v === "number" && Number.isFinite(v);
  let width = sayi(kayit?.width) ? Math.round(kayit.width) : VARSAYILAN.width;
  let height = sayi(kayit?.height) ? Math.round(kayit.height) : VARSAYILAN.height;
  width = Math.max(EN_AZ.width, width);
  height = Math.max(EN_AZ.height, height);
  if (sayi(kayit?.x) && sayi(kayit?.y)) {
    const x = Math.round(kayit.x);
    const y = Math.round(kayit.y);
    // Üst şeridin (sürükleme alanı) en az 80×24 px'i bir ekranda görünmeli
    const alan = calismaAlanlari.find((a) => {
      const gx = Math.min(x + width, a.x + a.width) - Math.max(x, a.x);
      const gy = Math.min(y + 24, a.y + a.height) - Math.max(y, a.y);
      return gx >= 80 && gy >= 24;
    });
    if (alan) return { x, y, width: Math.min(width, alan.width), height: Math.min(height, alan.height) };
  }
  const a = birincil;
  width = Math.min(width, a.width);
  height = Math.min(height, a.height);
  return { x: a.x + a.width - width - KENAR, y: a.y + a.height - height - KENAR, width, height };
}

function konumOku(dosya) {
  try {
    return JSON.parse(fs.readFileSync(dosya, "utf8"));
  } catch {
    return null;
  }
}

function konumYaz(dosya, b) {
  try {
    fs.mkdirSync(path.dirname(dosya), { recursive: true });
    const gecici = dosya + ".tmp";
    fs.writeFileSync(gecici, JSON.stringify({ x: b.x, y: b.y, width: b.width, height: b.height }));
    fs.renameSync(gecici, dosya);
  } catch {
    // Yazılamazsa bir dahaki açılışta varsayılan konum
  }
}

/**
 * IPC'yi kurar. adres(): sunucunun kök adresi (http://127.0.0.1:port), henüz yoksa null.
 * anaPencereyiAc(): ana pencereyi öne getirir ya da yeniden açar.
 */
function kur({ adres, anaPencereyiAc, ikon, preload }) {
  let mini = null;
  const dosya = () => path.join(app.getPath("userData"), "metronom-mini.json");

  // Yalnız uygulamanın kendi sayfaları bu kanalları kullanabilir
  const izinli = (e) => {
    const kok = adres();
    const url = e.senderFrame?.url;
    if (!kok || !url) return false;
    try {
      return new URL(url).origin === new URL(kok).origin;
    } catch {
      return false;
    }
  };

  const ustteTut = (w) => {
    // "screen-saver" düzeyi: Windows'ta tam ekran olmayan uygulamaların ve toplantı pencerelerinin üstünde
    w.setAlwaysOnTop(true, "screen-saver");
  };

  function ac(cal) {
    if (mini && !mini.isDestroyed()) {
      if (mini.isMinimized()) mini.restore();
      mini.show();
      ustteTut(mini);
      mini.moveTop();
      mini.focus();
      if (cal) mini.webContents.send("metronom-komut", "cal");
      return;
    }
    const b = konumSec(
      konumOku(dosya()),
      screen.getAllDisplays().map((d) => d.workArea),
      screen.getPrimaryDisplay().workArea,
    );
    const w = new BrowserWindow({
      ...b,
      minWidth: EN_AZ.width,
      minHeight: EN_AZ.height,
      frame: false,
      transparent: false,
      backgroundColor: "#000000",
      resizable: true,
      maximizable: false,
      fullscreenable: false,
      minimizable: true,
      alwaysOnTop: true,
      skipTaskbar: false,
      title: "Metronom · GuitarFlex",
      icon: ikon,
      show: false,
      webPreferences: {
        preload,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        // Başka uygulama öndeyken de zamanlayıcılar kısılmasın
        backgroundThrottling: false,
        // Ana pencerede çalarken açıldıysa tıklama beklemeden devam edebilsin
        autoplayPolicy: "no-user-gesture-required",
      },
    });
    mini = w;
    ustteTut(w);
    w.setVisibleOnAllWorkspaces(true);
    w.removeMenu();
    // Başka bir "üstte" pencere (toplantı araç çubuğu vb.) öne geçince yeniden en üste çık
    w.on("blur", () => !w.isDestroyed() && ustteTut(w));

    w.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    w.webContents.on("will-navigate", (e, url) => {
      const kok = adres();
      if (!kok || !url.startsWith(kok)) e.preventDefault();
    });

    let zaman = null;
    const kaydet = () => {
      if (w.isDestroyed() || w.isMinimized()) return;
      konumYaz(dosya(), w.getBounds());
    };
    const sonraKaydet = () => {
      clearTimeout(zaman);
      zaman = setTimeout(kaydet, 400);
    };
    w.on("moved", sonraKaydet);
    w.on("resized", sonraKaydet);
    w.on("close", () => {
      clearTimeout(zaman);
      kaydet();
    });
    w.on("closed", () => {
      if (mini === w) mini = null;
    });
    w.once("ready-to-show", () => w.show());
    w.loadURL(`${adres()}/metronom/mini${cal ? "?cal=1" : ""}`);
  }

  ipcMain.handle("metronom-mini-ac", (e, secenek) => {
    if (!izinli(e) || !adres()) return false;
    ac(Boolean(secenek && secenek.cal));
    return true;
  });
  ipcMain.on("metronom-mini-kapat", (e) => {
    if (!izinli(e)) return;
    if (mini && !mini.isDestroyed() && e.sender === mini.webContents) mini.close();
  });
  ipcMain.on("metronom-ana-pencere", (e) => {
    if (!izinli(e)) return;
    anaPencereyiAc();
  });
}

module.exports = { kur, konumSec, VARSAYILAN, EN_AZ };
