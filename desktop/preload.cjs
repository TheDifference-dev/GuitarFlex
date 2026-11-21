// Güvenli köprü (contextIsolation açık, nodeIntegration kapalı, sandbox).
// Sayfaya yalnız aşağıdaki birkaç işlev açılır: window.guitarflexMasaustu
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("guitarflexMasaustu", {
  surum: 1,
  /** Her zaman üstte duran küçük metronom penceresini açar (açıksa öne getirir) */
  metronomMiniAc: (secenek) => ipcRenderer.invoke("metronom-mini-ac", { cal: Boolean(secenek && secenek.cal) }),
  /** Küçük metronom penceresini kapatır (yalnız o pencereden çağrılınca) */
  metronomMiniKapat: () => ipcRenderer.send("metronom-mini-kapat"),
  /** Ana pencereyi öne getirir; kapatılmışsa yeniden açar */
  anaPencereyeDon: () => ipcRenderer.send("metronom-ana-pencere"),
  /** Ana süreçten küçük pencereye gelen komutlar ("cal") */
  metronomKomutDinle: (fn) => {
    if (typeof fn !== "function") return () => {};
    const dinle = (_e, komut) => fn(String(komut));
    ipcRenderer.on("metronom-komut", dinle);
    return () => ipcRenderer.removeListener("metronom-komut", dinle);
  },
});
