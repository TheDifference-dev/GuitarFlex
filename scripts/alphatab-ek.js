/* GuitarFlex: alphaTab çizim düzeltmesi (copy-alphatab.mjs bu dosyayı alphaTab.min.js'in sonuna ekleyip
   public/alphatab/alphaTab.gf.js üretir; aynı dosya ana sayfada, çizim worker'ında ve ses worklet'inde yüklenir).

   Sorun: alphaTab 1.8.4 notanın üstündeki efekt bantlarını (akor adı, pena yönü, parmak numarası, P.M. …)
   satırlara yerleştirirken iki bandın aynı vuruşta bitip başlamasını "çakışmıyor" sayar
   (EffectBandSlot.canBeUsed: lastBeat === firstBeat). Ölçünün ilk vuruşunda hem akor adı hem pena işareti
   varsa ikisi aynı satıra düşer ve üst üste çizilir ("A7", "B7" gibi).
   Çözüm: üst efekt bantlarının satır paylaşımını kapatmak; her efekt türü kendi satırında çizilir
   (Songsterr'daki gibi). Kütüphanenin kodu değişmez, yalnız varsayılan bant tanımlarının
   `canShareBand` değeri örnek düzeyinde ezilir. */
(function () {
  var g = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this;
  var at = g && g.alphaTab;
  if (!at || !at.Environment || !at.Environment.defaultRenderers) return;
  var factories = at.Environment.defaultRenderers;
  for (var i = 0; i < factories.length; i++) {
    var bands = factories[i].effectBands || [];
    for (var j = 0; j < bands.length; j++) {
      var effect = bands[j].effect;
      if (!effect || effect.__gfPaylasimYok) continue;
      try {
        Object.defineProperty(effect, "canShareBand", { get: function () { return false; }, configurable: true });
        effect.__gfPaylasimYok = true;
      } catch {
        /* değiştirilemezse alphaTab'ın varsayılanı kalır */
      }
    }
  }
})();

/* GuitarFlex: yazı bantları arasında nefes payı.
   Sorun: alphaTab yazı glifinin (beat txt "Bölüm A", akor adı, parmak numarası) yüksekliğini yazı tipinin
   ölçülen yüksekliği kadar alır; italik ve aksanlı yazılarda (Ö, Ç) harfler bu kutunun dışına taşar.
   Bantlar alt alta dizildiğinde bölüm yazısı ilk akor adına, parmak numarası akor adına değer.
   Çözüm: bu üç yazı bandının glif yüksekliğine birkaç piksel eklenir; bantlar arası boşluk büyür,
   yazıların yeri ve boyu değişmez. */
(function () {
  var g = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this;
  var at = g && g.alphaTab;
  if (!at || !at.Environment || !at.Environment.defaultRenderers || !at.NotationElement) return;
  var E = at.NotationElement;
  var PAY = {};
  PAY[E.EffectText] = 5;
  PAY[E.EffectChordNames] = 4;
  PAY[E.EffectFingering] = 4;
  PAY[E.EffectMarker] = 4;
  var factories = at.Environment.defaultRenderers;
  for (var i = 0; i < factories.length; i++) {
    var bands = factories[i].effectBands || [];
    for (var j = 0; j < bands.length; j++) {
      var effect = bands[j].effect;
      if (!effect || effect.__gfYaziPayi) continue;
      var pay;
      try {
        pay = PAY[effect.notationElement];
      } catch {
        pay = undefined;
      }
      if (!pay || typeof effect.createNewGlyph !== "function") continue;
      (function (eff, ek) {
        var asil = eff.createNewGlyph;
        eff.createNewGlyph = function () {
          var glif = asil.apply(this, arguments);
          if (glif && typeof glif.doLayout === "function" && !glif.__gfYaziPayi) {
            var yerlesim = glif.doLayout;
            glif.doLayout = function () {
              yerlesim.apply(this, arguments);
              this.height += ek;
            };
            glif.__gfYaziPayi = true;
            // Glif oluşturulurken yerleşimi yapılmışsa (parmak numarası) payı şimdi ekle
            if (glif.height > 0) glif.height += ek;
          }
          return glif;
        };
        eff.__gfYaziPayi = true;
      })(effect, pay);
    }
  }
})();
