# GuitarFlex marka görsellerini Arda'nın karakalem çiziminden üretir.
# Kullanım: python3 scripts/marka-uret.py [kaynak.png]   (varsayılan: scripts/kaynak/cizim-kaynak.png, 1024×1024, açık zemin)
#
# Çizimi açık zeminden ayırma ("multiply" mantığı, gri ton tersine çevrilmez):
#   kağıt zemini düşük dereceli bir yüzeyle kestirilir (köşelerdeki gölgelenme dahil), sonra her piksel için
#   alfa = 1 − açıklık / zemin, bir eğriyle (kağıt gürültüsü kaybolur, siyah tam örtücü olur).
#   cizim-acik.png : siyah çizgiler, şeffaf zemin (açık zeminler için)
#   cizim-koyu.png : aynı alfa, çizgiler #E5E5EA (koyu zeminler için; kahraman bandı, üst çubuk)
#   Her ikisinin kenarları radyal maskeyle tüy gibi yumuşar: çizim hangi zemine konursa o zemine karışır.
# Uygulama simgeleri kare kalır; çizimin açık zemini kenarlara doğru lacivert → siyaha yumuşakça geçer.
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
MARKA = os.path.join(KOK, "public", "marka")
KAYNAK = sys.argv[1] if len(sys.argv) > 1 else os.path.join(KOK, "scripts", "kaynak", "cizim-kaynak.png")

ACIK_GRI = np.array([0xE5, 0xE5, 0xEA], float)
LACIVERT = np.array([0x0A, 0x16, 0x30], float)  # derin lacivert (kahraman bandının alt tonu)
SIYAH = np.array([0, 0, 0], float)


def yukle(yol):
    im = Image.open(yol).convert("L")
    if im.size != (1024, 1024):
        im = im.resize((1024, 1024), Image.LANCZOS)
    return np.asarray(im, float) / 255.0


def zemin_kestir(l):
    """Kağıt zemini: açık piksellere oturtulan ikinci derece yüzey (köşe gölgelenmesini de izler)"""
    h, w = l.shape
    yy, xx = np.mgrid[0:h, 0:w] / np.array([h, w]).reshape(2, 1, 1)
    secili = l > 0.6
    X = np.stack([np.ones_like(xx), xx, yy, xx * xx, yy * yy, xx * yy], -1)
    A, b = X[secili][::7], l[secili][::7]
    for _ in range(3):  # aykırı (çizgi) pikselleri at, yeniden oturt
        k, *_ = np.linalg.lstsq(A, b, rcond=None)
        r = b - A @ k
        tut = r > -0.06
        A, b = A[tut], b[tut]
    z = X @ k
    return np.clip(z, 0.6, 1.0)


def alfa_hesapla(l):
    z = zemin_kestir(l)
    ham = np.clip(1 - l / z, 0, 1)  # multiply: l = z · (1 − a)
    a = np.clip((ham - 0.05) / 0.80, 0, 1)  # kağıt gürültüsü 0, koyu ton tam
    return a ** 0.85


def radyal_maske(h, w, cx=0.5, cy=0.5, rx=0.5, ry=0.5, ic=0.62, dis=1.0, p=2.0):
    """Merkezde 1, kenara doğru yumuşakça 0 (smoothstep). p=2 elips; p>2 köşeleri yuvarlak kareye yaklaşan süper elips."""
    yy, xx = np.mgrid[0:h, 0:w]
    r = (np.abs(((xx + 0.5) / w - cx) / rx) ** p + np.abs(((yy + 0.5) / h - cy) / ry) ** p) ** (1 / p)
    t = np.clip((r - ic) / (dis - ic), 0, 1)
    return 1 - t * t * (3 - 2 * t)


def koyu_alfa(a):
    """Koyu zemin sürümünün alfası: yoğun bölgelerde örtücülük ~%45'e iner, seyrek çizgiler ~%92 kalır"""
    yogun = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(14)), float) / 255
    return np.clip(a * (0.92 - 0.5 * yogun**1.5), 0, 1)


def rgba(renk, a):
    h, w = a.shape
    out = np.zeros((h, w, 4), np.uint8)
    out[..., :3] = np.asarray(renk, float).astype(np.uint8)
    out[..., 3] = np.round(np.clip(a, 0, 1) * 255).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def yuvarlak_kare(boyut, oran=0.225, olcek=4):
    """iOS simge köşesine yakın yuvarlatılmış kare maskesi (kenar yumuşatmalı)"""
    b = boyut * olcek
    m = Image.new("L", (b, b), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, b - 1, b - 1], radius=int(b * oran), fill=255)
    return m.resize((boyut, boyut), Image.LANCZOS)


def simge(l, boyut, kirp=1.0, koseli=True):
    """Kare uygulama simgesi: çizim (kendi açık zemini) merkezde, kenarlara doğru lacivert → siyah zemine karışır"""
    n = l.shape[0]
    k = int(n * kirp)
    x0 = (n - k) // 2
    y0 = int((n - k) * 0.35)
    parca = l[y0 : y0 + k, x0 : x0 + k]
    gri = np.asarray(Image.fromarray((parca * 255).astype(np.uint8)).resize((boyut, boyut), Image.LANCZOS), float) / 255
    # Zemin: kahraman bandı gibi üstte siyah, altta derin lacivert
    yy = np.linspace(0, 1, boyut).reshape(-1, 1, 1)
    zemin = np.broadcast_to(SIYAH * (1 - yy) + LACIVERT * yy, (boyut, boyut, 3))
    m = radyal_maske(boyut, boyut, cy=0.5, ic=0.45, dis=1.2, p=2.4)[..., None]
    renk = gri[..., None] * 255 * m + zemin * (1 - m)
    out = np.dstack([renk, np.full((boyut, boyut), 255.0)])
    im = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA")
    if koseli:
        im.putalpha(yuvarlak_kare(boyut))
    return im


def kirp_kare(a, kirp, y_oran=0.35):
    n = a.shape[0]
    k = int(n * kirp)
    x0 = (n - k) // 2
    y0 = int((n - k) * y_oran)
    return a[y0 : y0 + k, x0 : x0 + k]


def boyutla(a, boyut):
    return np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((boyut, boyut), Image.LANCZOS), float) / 255


def svg_sar(png_yolu, svg_yolu, boyut):
    import base64

    with open(png_yolu, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    with open(svg_yolu, "w") as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" width="{boyut}" height="{boyut}" viewBox="0 0 {boyut} {boyut}"><image width="{boyut}" height="{boyut}" href="data:image/png;base64,{b64}"/></svg>\n')


def kapak(a_tuy, gen, yuk, yazi=True):
    """Sosyal medya kapağı: siyahtan derin laciverte dikey geçiş, solda yazı (SVG'de), sağda çerçevesiz çizim"""
    yy = np.linspace(0, 1, yuk).reshape(-1, 1, 1)
    zemin = SIYAH * (1 - yy) + LACIVERT * yy
    zemin = np.broadcast_to(zemin, (yuk, gen, 3)).copy()
    boy = int(yuk * (0.92 if gen > yuk else 0.78))
    c = boyutla(a_tuy, boy)[..., None]
    x0 = gen - boy - int(gen * 0.04) if gen > yuk else (gen - boy) // 2
    y0 = yuk - boy
    bolge = zemin[y0 : y0 + boy, x0 : x0 + boy]
    zemin[y0 : y0 + boy, x0 : x0 + boy] = bolge * (1 - c) + ACIK_GRI * c
    return Image.fromarray(np.clip(zemin, 0, 255).astype(np.uint8), "RGB"), (x0, y0, boy)


def main():
    l = yukle(KAYNAK)
    a = alfa_hesapla(l)
    # Tüylü kenar: merkezde net karakter, kenarlara doğru kaybolur. Süper elips (p=3): yuvarlak "lomboz" görüntüsü
    # vermeden dört kenarda da görünmez geçiş.
    tuy = a * radyal_maske(1024, 1024, cy=0.5, ic=0.5, dis=1.0, p=3.0)
    rgba(SIYAH, tuy).save(os.path.join(MARKA, "cizim-acik.png"), optimize=True)
    # Koyu sürüm: aynı alfa, çizgiler #E5E5EA. Negatifte siyah kütleler (ceket, şapka) düz açık leke olmasın diye
    # yerel yoğunluk arttıkça örtücülük azalır: tek tek çizgiler parlak, dolu kütleler yarı saydam kalır (karakter net).
    rgba(ACIK_GRI, koyu_alfa(tuy)).save(os.path.join(MARKA, "cizim-koyu.png"), optimize=True)

    # Üst çubuk logosu (çerçevesiz): karakter, kendi açık kağıt zemini üstünde; kağıt radyal maskeyle şeffafa döner,
    # yani hangi zemine konursa (gezinme çubuğu) ona karışır. Küçük boyutta okunsun diye kenarlar biraz kırpılır.
    kirpik = boyutla(kirp_kare(l, 0.8, 0.3), 128)
    logo = np.dstack([kirpik * 255] * 3 + [radyal_maske(128, 128, ic=0.7, dis=1.0, p=3.0) * 255])
    Image.fromarray(np.round(logo).astype(np.uint8), "RGBA").save(os.path.join(MARKA, "logo.png"), optimize=True)

    # Uygulama simgeleri (kare; kenarlar lacivert → siyaha yumuşak geçiş)
    s512 = simge(l, 512)
    s512.save(os.path.join(MARKA, "simge-512.png"), optimize=True)
    s512.save(os.path.join(KOK, "desktop", "icon.png"), optimize=True)
    svg_sar(os.path.join(MARKA, "simge-512.png"), os.path.join(MARKA, "simge.svg"), 512)
    kucuk = simge(l, 128, kirp=0.8)
    kucuk_yol = os.path.join(MARKA, "simge-kucuk.png")
    kucuk.save(kucuk_yol, optimize=True)
    svg_sar(kucuk_yol, os.path.join(MARKA, "simge-kucuk.svg"), 128)
    os.remove(kucuk_yol)
    simge(l, 256, kirp=0.86).save(os.path.join(KOK, "src", "app", "icon.png"), optimize=True)
    # apple-icon: iOS köşeyi kendisi yuvarlar; saydamlık olmamalı
    simge(l, 180, koseli=False).convert("RGB").save(os.path.join(KOK, "src", "app", "apple-icon.png"), optimize=True)
    ico = [simge(l, n, kirp=0.8 if n <= 48 else 1.0) for n in (16, 24, 32, 48, 64, 128, 256)]
    ico[-1].save(os.path.join(KOK, "desktop", "icon.ico"), sizes=[(i.width, i.height) for i in ico], append_images=ico[:-1])

    # Kapaklar (yazı SVG'de metin; PNG'ye de aynı yerleşimle basılır)
    for ad, gen, yuk in (("kapak", 1600, 900), ("kapak-kare", 1080, 1080)):
        im, (x0, y0, boy) = kapak(koyu_alfa(tuy), gen, yuk)
        im = yazi_bas(im, gen, yuk)
        im.save(os.path.join(MARKA, f"{ad}.png"), optimize=True)
        if ad == "kapak":
            kapak_svg(gen, yuk, x0, y0, boy)


def yazi_yeri(gen, yuk):
    if gen > yuk:
        return dict(x=int(gen * 0.08), y=int(yuk * 0.47), b1=96, b2=34, hiza="start")
    return dict(x=gen // 2, y=int(yuk * 0.14), b1=88, b2=32, hiza="middle")


def yazi_tipi(boyut, kalin):
    from PIL import ImageFont

    adaylar = [
        "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf" if kalin else "/usr/share/fonts/opentype/inter/Inter-Regular.otf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if kalin else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for y in adaylar:
        if os.path.exists(y):
            return ImageFont.truetype(y, boyut)
    return ImageFont.load_default()


def yazi_bas(im, gen, yuk):
    d = ImageDraw.Draw(im)
    y = yazi_yeri(gen, yuk)
    f1, f2 = yazi_tipi(y["b1"], True), yazi_tipi(y["b2"], False)
    anc1 = "ls" if y["hiza"] == "start" else "ms"
    d.text((y["x"], y["y"]), "GuitarFlex", font=f1, fill=(0xF5, 0xF5, 0xF7), anchor=anc1)
    d.text((y["x"] + (4 if y["hiza"] == "start" else 0), y["y"] + int(y["b2"] * 1.7)), "Gitar akademisi", font=f2, fill=(0x29, 0x97, 0xFF), anchor=anc1)
    return im


def kapak_svg(gen, yuk, x0, y0, boy):
    import base64

    with open(os.path.join(MARKA, "cizim-koyu.png"), "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    y = yazi_yeri(gen, yuk)
    font = "-apple-system, 'SF Pro Display', Inter, Helvetica, Arial, sans-serif"
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{gen}" height="{yuk}" viewBox="0 0 {gen} {yuk}">\n'
        '<defs><linearGradient id="z" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#0A1630"/></linearGradient></defs>\n'
        f'<rect width="{gen}" height="{yuk}" fill="url(#z)"/>\n'
        f'<image x="{x0}" y="{y0}" width="{boy}" height="{boy}" href="data:image/png;base64,{b64}"/>\n'
        f'<text x="{y["x"]}" y="{y["y"]}" font-family="{font}" font-size="{y["b1"]}" font-weight="600" fill="#F5F5F7" letter-spacing="-1">GuitarFlex</text>\n'
        f'<text x="{y["x"] + 4}" y="{y["y"] + int(y["b2"] * 1.7)}" font-family="{font}" font-size="{y["b2"]}" fill="#2997FF">Gitar akademisi</text>\n'
        "</svg>\n"
    )
    with open(os.path.join(MARKA, "kapak.svg"), "w") as f:
        f.write(svg)


if __name__ == "__main__":
    main()
