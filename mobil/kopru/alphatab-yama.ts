// Expo'nun Metro çalışma zamanı küresel bir __webpack_require__ tanımlıyor; alphaTab bunu görünce "WebPack ile
// paketlenmiş" sanıp ses işleyicisini (AudioWorklet) import.meta.url'den açmaya çalışıyor ve "Invalid URL" ile
// düşüyor (çal düğmesi çalışır görünür ama ses gelmez). alphaTab <script> olarak yüklendiği an bu algıyı kapatıp
// masaüstündeki gibi scriptFile yolunu kullanmasını sağlıyoruz.
type AlphaTabGlobal = { Environment?: { isWebPackBundled?: boolean; isViteBundled?: boolean } };

if (typeof window !== "undefined") {
  const w = window as unknown as { alphaTab?: AlphaTabGlobal };
  const duzelt = (at?: AlphaTabGlobal) => {
    if (at?.Environment) {
      at.Environment.isWebPackBundled = false;
      at.Environment.isViteBundled = false;
    }
  };
  if (w.alphaTab) duzelt(w.alphaTab);
  else {
    let deger: AlphaTabGlobal | undefined;
    Object.defineProperty(window, "alphaTab", {
      configurable: true,
      enumerable: true,
      // UMD önce boş nesneyi atar, Environment sonra dolar: her okumada (TabPlayer API'yi kurmadan önce okur) düzelt
      get: () => {
        duzelt(deger);
        return deger;
      },
      set: (v: AlphaTabGlobal) => {
        deger = v;
        duzelt(v);
      },
    });
  }
}
export {};
