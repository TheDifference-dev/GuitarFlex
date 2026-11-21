// Şarkı Kütüphanesi penceresi: Songsterr'in bütün tab kataloğu ve kendi araması, ayrı bir uygulama penceresinde.
// Katalog indirilmez ya da kopyalanmaz; https://www.songsterr.com/ olduğu gibi açılır. Pencere güvenli ayarlarla
// açılır (contextIsolation, sandbox, nodeIntegration kapalı, preload YOK; kendi oturum bölümü). songsterr.com dışına
// giden gezinmeler ve window.open varsayılan tarayıcıda açılır. Pencere kapatılabilir; ana pencereyi etkilemez.
const { BrowserWindow, ipcMain, shell } = require("electron");

const ANA_SAYFA = "https://www.songsterr.com/";
const BASLIK = "Şarkı Kütüphanesi — Songsterr";

/** Songsterr (ya da alt alanı) üzerinde https adresi mi */
function izinli(u) {
  try {
    const x = new URL(u);
    return x.protocol === "https:" && (x.hostname === "songsterr.com" || x.hostname.endsWith(".songsterr.com"));
  } catch {
    return false;
  }
}

/** q: arama metni ya da Songsterr bağlantısı; boşsa ana sayfa */
function adres(q) {
  const t = typeof q === "string" ? q.trim().slice(0, 300) : "";
  if (!t) return ANA_SAYFA;
  if (izinli(t)) return t;
  return `${ANA_SAYFA}?pattern=${encodeURIComponent(t)}`;
}

function disaAc(url) {
  if (/^https?:\/\//i.test(url)) shell.openExternal(url).catch(() => {});
}

/**
 * kur({ uygulamaAdresi, anaPencere, ikon }): ipc "sarki-kutuphanesi-ac" kanalını bağlar.
 *   uygulamaAdresi(): yerel sunucunun adresi (yalnız uygulama sayfaları pencereyi açabilir)
 *   anaPencere(): ana BrowserWindow (boyut için)
 */
function kur({ uygulamaAdresi, anaPencere, ikon }) {
  let pencere = null;

  function ac(q) {
    const hedef = adres(q);
    if (pencere && !pencere.isDestroyed()) {
      if (q || !pencere.webContents.getURL()) pencere.loadURL(hedef);
      if (pencere.isMinimized()) pencere.restore();
      pencere.show();
      pencere.focus();
      return;
    }
    const ana = anaPencere();
    const [w, h] = ana && !ana.isDestroyed() ? ana.getSize() : [1400, 900];
    pencere = new BrowserWindow({
      width: w,
      height: h,
      minWidth: 900,
      minHeight: 600,
      title: BASLIK,
      icon: ikon,
      backgroundColor: "#FFFFFF",
      autoHideMenuBar: true,
      webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, partition: "persist:songsterr" },
    });
    pencere.removeMenu();
    // Sayfa başlığı değişse de pencere adı sabit kalsın
    pencere.on("page-title-updated", (e) => e.preventDefault());
    const wc = pencere.webContents;
    wc.setWindowOpenHandler(({ url }) => {
      if (izinli(url)) wc.loadURL(url);
      else disaAc(url);
      return { action: "deny" };
    });
    const denetle = (e, url) => {
      if (!izinli(url)) {
        e.preventDefault();
        disaAc(url);
      }
    };
    wc.on("will-navigate", denetle);
    wc.on("will-redirect", denetle);
    pencere.on("closed", () => {
      pencere = null;
    });
    pencere.loadURL(hedef);
  }

  ipcMain.handle("sarki-kutuphanesi-ac", (e, secenek) => {
    const u = uygulamaAdresi();
    const gonderen = e.senderFrame ? e.senderFrame.url : "";
    if (!u || !gonderen.startsWith(u)) return false;
    ac(secenek && typeof secenek.q === "string" ? secenek.q : "");
    return true;
  });

  return { ac, pencere: () => (pencere && !pencere.isDestroyed() ? pencere : null) };
}

module.exports = { kur, adres, izinli, BASLIK };
