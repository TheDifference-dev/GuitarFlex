# GuitarFlex logo adaylarını (SVG) üretir: python3 scripts/logo-ciz.py
# Çıktı: public/marka/*.svg
# Silüet: kısa saçlı, Les Paul çalan gitarist; geniş, dizleri bükük sahne duruşu,
# gitar kalça hizasında alçakta, sap yukarıda, baş öne eğik.
import math, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "marka")

NAVY = "#0b1838"      # koyu lacivert
NAVY2 = "#13275a"     # lacivert
DEEP = "#050b1c"      # neredeyse siyah lacivert (silüet)
ORANGE = "#f47216"    # turuncu
ORANGE2 = "#ffa047"   # açık turuncu
WHITE = "#ffffff"

_gid = [0]


def guitar_shapes(mid, notch=7.5):
    """Les Paul: alt ve üst gövde, tek cutaway (maskeyle), sap, kafa. Yerel eksende sap +x yönünde."""
    cut = (f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="-60" y="-60" width="220" height="120">'
           f'<rect x="-60" y="-60" width="220" height="120" fill="#fff"/><circle cx="25" cy="12.5" r="{notch:.2f}" fill="#000"/></mask>')
    body = (f'<g mask="url(#{mid})"><circle cx="0" cy="0" r="18"/><circle cx="16" cy="-2" r="13.5"/>'
            '<path d="M0 -18 C10 -18 12 -15.5 16 -15.5 L16 11.5 C10 12.5 6 18 0 18 Z"/></g>')
    neck = '<rect x="22" y="-2.7" width="58" height="5.4" rx="1"/>'
    head = '<path d="M79 -3.4 L95 -6 Q97 -6 97 -4 L97 4 Q97 6 95 6 L79 3.4 Z"/>'
    return cut + body + neck + head


def guitar(x, y, angle, s, fill, outline=None, ow=2.4):
    _gid[0] += 1
    tr = f"translate({x} {y}) rotate({angle}) scale({s})"
    out = ""
    if outline:
        out += (f'<g transform="{tr}" fill="{outline}" stroke="{outline}" stroke-width="{ow * 2 / s:.2f}" stroke-linejoin="round">'
                f'{guitar_shapes(f"g{_gid[0]}a", 7.5 - ow / s)}</g>')
    out += f'<g transform="{tr}" fill="{fill}">{guitar_shapes(f"g{_gid[0]}b")}</g>'
    return out


def line(points, color, width):
    d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in points)
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>'


def player(fill, outline):
    """Geniş sahne duruşu. Koordinatlar 200x220 alan içinde, ayaklar y≈208."""
    parts = []
    # Bacaklar: kalça → diz (dışa bükük) → bilek; kalın uyluk, ince baldır
    for hip, knee, ankle, toe in (((92, 124), (62, 160), (44, 200), (26, 208)), ((108, 124), (140, 160), (158, 200), (176, 208))):
        parts.append(line([hip, knee], fill, 19))
        parts.append(line([knee, ankle], fill, 14))
        # Bot: bilekten dışa doğru basık bir şekil
        parts.append(line([ankle, toe], fill, 9))
        parts.append(f'<rect x="{min(ankle[0], toe[0]) - 5}" y="{toe[1] - 2}" width="{abs(toe[0] - ankle[0]) + 10}" height="5" rx="2" fill="{fill}"/>')
    # Kalça ve gövde: hafif yana yaslanmış, geniş omuz
    parts.append(f'<path d="M84 128 L116 128 L118 112 Q119 90 128 66 Q102 54 74 64 Q80 90 82 112 Z" fill="{fill}"/>')
    # Boyun ve öne eğik baş (headbang), kısa saç
    parts.append(f'<path d="M93 60 L107 58 L106 48 L95 49 Z" fill="{fill}"/>')
    parts.append(f'<g transform="translate(1 4) rotate(9 100 44)">'
                 f'<ellipse cx="100" cy="36" rx="12" ry="13.5" fill="{fill}"/>'
                 f'<path d="M87.5 36 Q86 26 91 22.5 Q93 19 98 20 Q101 17.5 105 19.5 Q110 19 112 23 Q115.5 27 112.5 36 Q111 29 104.5 28.5 Q100 27.5 95 29 Q89.5 29.5 87.5 36 Z" fill="{fill}"/>'
                 f'</g>')
    # Gitar: kalça hizasında alçakta, sap yukarı dik
    gx, gy, ang, sc = 92, 132, -42, 1.22
    a = math.radians(ang)
    hx, hy = gx + 80 * sc * math.cos(a) * 0.86, gy + 80 * sc * math.sin(a) * 0.86  # sap üzerindeki el
    # Arka kol parçaları (gövdenin üstünde, gitarın altında kalır)
    elbow = (137, 106)
    parts.append(line([(124, 68), elbow], fill, 11))              # sap kolu: omuz → dirsek
    parts.append(line([(77, 68), (62, 100)], fill, 11.5))         # tel kolu: omuz → dirsek
    parts.append(guitar(gx, gy, ang, sc, fill, outline))
    # Ön kol parçaları (gitarın önünde): kontur + dolgu
    for seg, w in ((((62, 100), (88, 126)), 10), ((elbow, (hx, hy)), 9.5)):
        parts.append(line(seg, outline or fill, w + 4.5))
        parts.append(line(seg, fill, w))
    parts.append(f'<circle cx="89" cy="127" r="6" fill="{fill}"/>')
    parts.append(f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="5.5" fill="{fill}"/>')
    return "".join(parts)


def svg(content, vb="0 0 240 240"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="{vb}">{content}</svg>'


def placed(fill, outline, x=20, y=10, s=1.0):
    return f'<g transform="translate({x} {y}) scale({s})">{player(fill, outline)}</g>'


PICK = "M120 230 C70 182 16 122 16 64 C16 26 62 10 120 10 C178 10 224 26 224 64 C224 122 170 182 120 230 Z"

variants = {
    # 1) Sahne ışığı: lacivert zemin, arkadan turuncu ışık, koyu silüet
    "sahne": svg(
        '<defs><radialGradient id="spot" cx="50%" cy="42%" r="62%">'
        f'<stop offset="0" stop-color="{ORANGE2}"/><stop offset="0.28" stop-color="{ORANGE}"/>'
        f'<stop offset="0.62" stop-color="{NAVY2}"/><stop offset="1" stop-color="{NAVY}"/></radialGradient></defs>'
        '<rect width="240" height="240" rx="40" fill="url(#spot)"/>'
        f'<ellipse cx="120" cy="226" rx="96" ry="7" fill="{DEEP}" opacity="0.7"/>'
        + placed(DEEP, ORANGE, 20, 8)),
    # 2) Gün batımı: lacivert zemin, turuncu güneş, koyu silüet
    "gunbatimi": svg(
        f'<rect width="240" height="240" rx="40" fill="{NAVY}"/>'
        f'<circle cx="120" cy="104" r="78" fill="{ORANGE}"/>'
        f'<rect x="0" y="206" width="240" height="34" fill="{DEEP}"/><rect x="0" y="200" width="240" height="6" fill="{NAVY2}"/>'
        + placed(DEEP, ORANGE, 20, 4)),
    # 3) Rozet: beyaz zemin, turuncu halka, lacivert silüet
    "rozet": svg(
        f'<circle cx="120" cy="120" r="116" fill="{WHITE}"/><circle cx="120" cy="120" r="106" fill="none" stroke="{ORANGE}" stroke-width="8"/>'
        + placed(NAVY, WHITE, 32, 18, 0.88)),
    # 4) Pena: turuncu pena, lacivert silüet, beyaz kontur
    "pena": svg(
        f'<path d="{PICK}" fill="{ORANGE}"/>'
        f'<path d="{PICK}" fill="none" stroke="{WHITE}" stroke-width="5" transform="translate(120 120) scale(0.92) translate(-120 -120)"/>'
        + placed(NAVY, ORANGE, 47, 22, 0.73)),
    # 5) Yalın silüet: zeminsiz lacivert, turuncu gitar konturu
    "siluet": svg(player(NAVY, ORANGE), vb="10 6 200 216"),
}

os.makedirs(OUT, exist_ok=True)
for old in ("rock.svg",):
    p = os.path.join(OUT, old)
    if os.path.exists(p):
        os.remove(p)
for name, content in variants.items():
    with open(os.path.join(OUT, f"{name}.svg"), "w") as f:
        f.write(content)
print("Yazıldı:", ", ".join(variants))
