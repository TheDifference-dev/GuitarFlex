// Şarkı Kütüphanesi penceresi: Songsterr'in bütün tab kataloğu ve kendi araması, ayrı bir uygulama penceresinde.
// Katalog indirilmez ya da kopyalanmaz; https://www.songsterr.com/ olduğu gibi açılır. Pencere güvenli ayarlarla
// açılır (contextIsolation, sandbox, nodeIntegration kapalı, preload YOK; kendi oturum bölümü). Pencere kapatılabilir;
// ana pencereyi etkilemez.
// Açılır pencereler (window.open): Songsterr sayfası reklam/izleme betikleri taşıyor; bunların açtığı pencereler
// (ör. rtb-csync.smartadserver.com, accounts.google.com/gsi) önceden varsayılan tarayıcıya gönderiliyordu ve
// Chrome'da onlarca sekme açılıyordu. Artık: Songsterr adresleri aynı pencerede, Google ile giriş uygulama içinde
// küçük bir pencerede açılır; geri kalan açılır pencereler engellenir (tarayıcıların açılır pencere engelleyicisi
// gibi). Yalnız kullanıcının ana çerçevede tıkladığı başka bir siteye giden bağlantı, saniyede en fazla bir kez,
// varsayılan tarayıcıda açılır.
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

/** Google ile giriş (Songsterr'in "Google ile giriş" düğmesi) */
function googleGiris(u) {
  try {
    const x = new URL(u);
    return x.protocol === "https:" && x.hostname === "accounts.google.com";
  } catch {
    return false;
  }
}

let sonDisAcma = 0;
function disaAc(url) {
  const simdi = Date.now();
  if (simdi - sonDisAcma < 1500) return; // art arda gelen yönlendirmeler sekme yağmuruna dönmesin
  if (!/^https?:\/\//i.test(url)) return;
  sonDisAcma = simdi;
  shell.openExternal(url).catch(() => {});
}

/** Electron/uygulama adını içermeyen tarayıcı kimliği: Google girişinin gömülü tarayıcıyı reddetmemesi için */
function tarayiciKimligi(ua) {
  return String(ua || "")
    .replace(/\sElectron\/\S+/g, "")
    .replace(/\s(GuitarFlex|guitarflex)\/\S+/g, "");
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
    wc.setUserAgent(tarayiciKimligi(wc.getUserAgent()));
    wc.setWindowOpenHandler(({ url }) => {
      if (izinli(url)) {
        wc.loadURL(url);
        return { action: "deny" };
      }
      if (googleGiris(url)) {
        // Google girişi açıcı pencereyle konuşmalı: uygulama içinde, aynı oturumda küçük pencere
        return {
          action: "allow",
          overrideBrowserWindowOptions: {
            parent: pencere,
            width: 520,
            height: 680,
            autoHideMenuBar: true,
            title: "Google ile giriş",
            webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, partition: "persist:songsterr" },
          },
        };
      }
      return { action: "deny" }; // reklam / izleme açılır pencereleri: engelle, dışarı gönderme
    });
    wc.on("did-create-window", (cocuk) => {
      cocuk.webContents.setUserAgent(tarayiciKimligi(cocuk.webContents.getUserAgent()));
      cocuk.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    });
    // Ana çerçevede başka siteye gidiş: yalnız kullanıcı bağlantıya tıkladıysa dışarıda aç; yönlendirmeleri yut
    wc.on("will-navigate", (e, url) => {
      if (izinli(url) || googleGiris(url)) return;
      e.preventDefault();
      if (e.isMainFrame !== false) disaAc(url);
    });
    wc.on("will-redirect", (e, url) => {
      if (izinli(url) || googleGiris(url)) return;
      if (e.isMainFrame) e.preventDefault();
    });
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
