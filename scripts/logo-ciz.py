# GuitarFlex logo adaylarını (SVG) üretir: python3 scripts/logo-ciz.py
# Çıktı: public/marka/*.svg
# Silüet: uzun dalgalı saçlı, Les Paul çalan siyah gölge gitarist; derin çömelmiş geniş sahne duruşu,
# gitar kalça hizasında alçakta, sap yukarıda, baş sap tarafına eğik, saçlar yüzün önünden gitara dökülüyor.
import math, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "marka")

NAVY = "#0b1838"      # koyu lacivert
NAVY2 = "#13275a"     # lacivert
DEEP = "#020308"      # siyah (silüet)
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
    for hip, knee, ankle, toe in (((93, 126), (54, 150), (47, 199), (27, 208)), ((107, 126), (146, 150), (153, 199), (173, 208))):
        parts.append(line([hip, knee], fill, 20))
        parts.append(line([knee, ankle], fill, 15))
        # Bot: bilekten dışa doğru basık bir şekil
        parts.append(line([ankle, toe], fill, 9))
        parts.append(f'<rect x="{min(ankle[0], toe[0]) - 5}" y="{toe[1] - 2}" width="{abs(toe[0] - ankle[0]) + 10}" height="5" rx="2" fill="{fill}"/>')
    # Kalça ve gövde: hafif yana yaslanmış, geniş omuz
    parts.append(f'<path d="M84 128 L116 128 L118 112 Q119 90 128 66 Q102 54 74 64 Q80 90 82 112 Z" fill="{fill}"/>')
    # Boyun ve sap tarafına (sağa) öne eğik baş
    parts.append(f'<path d="M95 62 L108 60 L108 50 L97 51 Z" fill="{fill}"/>')
    parts.append(f'<ellipse cx="104" cy="45" rx="11.5" ry="12.5" fill="{fill}"/>')
    # Arka kol parçaları (gövdenin üstünde)
    elbow = (137, 106)
    parts.append(line([(124, 68), elbow], fill, 11))              # sap kolu: omuz → dirsek
    parts.append(line([(77, 68), (62, 100)], fill, 11.5))         # tel kolu: omuz → dirsek
    # Uzun, dalgalı saç: tepeden yüzün önüne ve sağ omzun dışına dökülür, gitarın üstüne kadar iner.
    # Dış hattı gövdenin dışına taşar; göğsün önünde ince kenar ışığıyla ayrılır.
    hair = ("M90 42 C88 27 100 20 110 22 C122 24 130 33 130 45 "
            "C138 52 134 60 143 68 C152 77 141 84 150 94 C158 104 146 110 152 120 "
            "L144 116 Q146 126 138 128 Q140 118 134 116 Q134 126 126 126 Q130 116 124 112 "
            "Q122 122 116 120 Q120 110 114 104 "
            "C110 96 106 90 104 82 C100 74 100 68 96 62 C92 56 89 50 90 42 Z")
    # Dağınık, dışa taşan tek tük teller
    loose = ["M129 38 C138 41 143 47 146 54", "M145 96 C153 98 158 104 158 112",
             "M139 66 C147 62 151 64 155 69", "M150 118 C156 122 157 128 154 132"]
    # Saçın içindeki ışık çizgileri (dalgaları takip eder)
    strands = ["M101 29 C114 36 118 50 124 64 C132 78 126 88 134 100 C138 108 136 114 138 122",
               "M96 40 C102 54 108 66 112 78 C116 90 116 100 122 110",
               "M112 25 C124 32 130 46 134 58 C140 70 136 80 142 92 C146 100 144 108 146 114"]
    if outline:
        parts.append(f'<path d="{hair}" fill="{outline}" stroke="{outline}" stroke-width="5" stroke-linejoin="round"/>')
        for d in loose:
            parts.append(f'<path d="{d}" fill="none" stroke="{outline}" stroke-width="5.5" stroke-linecap="round"/>')
    parts.append(f'<path d="{hair}" fill="{fill}"/>')
    for d in loose:
        parts.append(f'<path d="{d}" fill="none" stroke="{fill}" stroke-width="2.4" stroke-linecap="round"/>')
    if outline:
        for d in strands:
            parts.append(f'<path d="{d}" fill="none" stroke="{outline}" stroke-width="1.6" stroke-linecap="round" opacity="0.75"/>')
    # Gitar: kalça hizasında alçakta, sap yukarı dik
    gx, gy, ang, sc = 92, 132, -42, 1.22
    a = math.radians(ang)
    hx, hy = gx + 80 * sc * math.cos(a) * 0.86, gy + 80 * sc * math.sin(a) * 0.86  # sap üzerindeki el
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
    # 3) Rozet: beyaz zemin, turuncu halka, siyah silüet
    "rozet": svg(
        f'<circle cx="120" cy="120" r="116" fill="{WHITE}"/><circle cx="120" cy="120" r="106" fill="none" stroke="{ORANGE}" stroke-width="8"/>'
        + placed(DEEP, WHITE, 32, 18, 0.88)),
    # 4) Pena: turuncu pena, siyah silüet, beyaz kontur
    "pena": svg(
        f'<path d="{PICK}" fill="{ORANGE}"/>'
        f'<path d="{PICK}" fill="none" stroke="{WHITE}" stroke-width="5" transform="translate(120 120) scale(0.92) translate(-120 -120)"/>'
        + placed(DEEP, WHITE, 47, 22, 0.73)),
    # 5) Yalın silüet: zeminsiz siyah, turuncu kontur
    "siluet": svg(player(DEEP, ORANGE), vb="10 6 200 216"),
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
