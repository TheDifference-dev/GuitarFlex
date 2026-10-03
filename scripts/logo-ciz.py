# GuitarFlex logo adaylarını (SVG) üretir: python3 scripts/logo-ciz.py
# Çıktı: public/marka/*.svg. Renkler aşağıdaki NAVY / NAVY2 / BLACK sabitlerinde.
import math, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "marka")

def guitar_shapes(mid, notch=7.5):
    cut = f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="-60" y="-60" width="220" height="120"><rect x="-60" y="-60" width="220" height="120" fill="#fff"/><circle cx="25" cy="12.5" r="{notch:.2f}" fill="#000"/></mask>'
    body = (f'<g mask="url(#{mid})">'
            '<circle cx="0" cy="0" r="18"/><circle cx="16" cy="-2" r="13.5"/>'
            '<path d="M0 -18 C10 -18 12 -15.5 16 -15.5 L16 11.5 C10 12.5 6 18 0 18 Z"/></g>')
    neck = '<rect x="22" y="-2.7" width="58" height="5.4" rx="1"/>'
    head = '<path d="M79 -3.4 L95 -6 Q97 -6 97 -4 L97 4 Q97 6 95 6 L79 3.4 Z"/>'
    return cut + body + neck + head

_gid = [0]
def guitar(x, y, angle, s=1.15, fill="#000", outline=None, ow=2.4):
    """Les Paul silüeti. Kenar çizgisi ayrı katman: önce kalın kontur, üstüne dolgu (iç çizgi oluşmaz)."""
    _gid[0] += 1
    tr = f'translate({x} {y}) rotate({angle}) scale({s})'
    out = ""
    if outline:
        out += f'<g transform="{tr}" fill="{outline}" stroke="{outline}" stroke-width="{ow*2/s:.2f}" stroke-linejoin="round">{guitar_shapes(f"m{_gid[0]}a", 7.5 - ow/s)}</g>'
    out += f'<g transform="{tr}" fill="{fill}">{guitar_shapes(f"m{_gid[0]}b")}</g>'
    return out

def player(fill="#000", guitar_outline=None, angle=-28, stance=1.0, lean=0):
    sx = stance
    # bacaklar (açık duruş)
    legs = (f'<path d="M80 116 L101 119 L{100-30*sx} 204 L{100-44*sx} 204 Z"/>'
            f'<path d="M99 119 L120 116 L{100+44*sx} 204 L{100+30*sx} 204 Z"/>'
            f'<path d="M{100-44*sx-10} 210 L{100-44*sx-10} 205 Q{100-44*sx} 199 {100-28*sx} 202 L{100-28*sx} 210 Z"/>'
            f'<path d="M{100+44*sx+10} 210 L{100+44*sx+10} 205 Q{100+44*sx} 199 {100+28*sx} 202 L{100+28*sx} 210 Z"/>')
    torso = '<path d="M71 60 Q100 49 129 60 L124 92 L121 119 L79 119 L76 92 Z"/>'
    neckp = '<rect x="94" y="42" width="12" height="12"/>'
    head = '<ellipse cx="100" cy="31" rx="12.5" ry="14.5"/><path d="M86.5 31 Q85 21 90 17.5 Q92 13.5 97 14.5 Q100 12 104 14 Q109 13.5 111 17.5 Q115 21 113.5 31 Q112 23.5 105 23 Q100 21.5 95 23 Q88.5 23.5 86.5 31 Z"/>'
    # kollar: sağ kol (izleyicinin solu) tele vuruyor, sol kol sapta
    gx, gy = 82, 108
    a = math.radians(angle)
    hx, hy = gx + 70*math.cos(a), gy + 70*math.sin(a)
    ex, ey = hx - 16, hy + 22
    ol = guitar_outline or fill
    arm_back = (f'<path d="M124 62 L{ex:.1f} {ey:.1f}" fill="none" stroke="{fill}" stroke-width="10" stroke-linecap="round"/>'
                f'<path d="M76 62 L63 90" fill="none" stroke="{fill}" stroke-width="10.5" stroke-linecap="round"/>')
    arm_front = (f'<path d="M63 90 L88 104" fill="none" stroke="{ol}" stroke-width="14" stroke-linecap="round"/>'
                 f'<path d="M63 90 L88 104" fill="none" stroke="{fill}" stroke-width="9.5" stroke-linecap="round"/>'
                 f'<circle cx="89" cy="104.5" r="5.8" fill="{fill}"/>'
                 f'<path d="M{ex:.1f} {ey:.1f} L{hx:.1f} {hy:.1f}" fill="none" stroke="{ol}" stroke-width="13" stroke-linecap="round"/>'
                 f'<path d="M{ex:.1f} {ey:.1f} L{hx:.1f} {hy:.1f}" fill="none" stroke="{fill}" stroke-width="9" stroke-linecap="round"/>'
                 f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="5.2" fill="{fill}"/>')
    g = guitar(gx, gy, angle, fill=fill, outline=guitar_outline)
    # el (gitarın üstünde, gövdede)
    t = f' transform="rotate({lean} 100 210)"' if lean else ""
    return f'<g fill="{fill}"{t}>{legs}{torso}{neckp}{head}{arm_back}{g}{arm_front}</g>'

NAVY = "#0b1f4f"; NAVY2 = "#153a8a"; BLACK = "#05070d"

def svg(content, w=240, h=240, vb="0 0 240 240"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{vb}">{content}</svg>'

variants = {}
# 1) Yuvarlak rozet
variants["rozet"] = svg(f'<circle cx="120" cy="120" r="116" fill="{NAVY}"/><circle cx="120" cy="120" r="108" fill="none" stroke="{NAVY2}" stroke-width="3"/>'
    f'<g transform="translate(26 14) scale(0.94)">{player(BLACK, guitar_outline=NAVY)}</g>')
# 2) Pena (pick) şekli
pick = "M120 228 C70 180 18 120 18 64 C18 26 62 10 120 10 C178 10 222 26 222 64 C222 120 170 180 120 228 Z"
variants["pena"] = svg(f'<path d="{pick}" fill="{NAVY}"/><path d="{pick}" fill="none" stroke="{NAVY2}" stroke-width="4" transform="translate(120 120) scale(0.93) translate(-120 -120)"/>'
    f'<g transform="translate(47 22) scale(0.73)">{player(BLACK, guitar_outline=NAVY)}</g>')
# 3) Sahne ışığı: siyah zemin, lacivert ışık konisi, siyah silüet
variants["sahne"] = svg(f'<defs><radialGradient id="spot" cx="50%" cy="38%" r="60%"><stop offset="0" stop-color="#2a5bd7"/><stop offset="0.55" stop-color="{NAVY}"/><stop offset="1" stop-color="{BLACK}"/></radialGradient></defs>'
    f'<rect width="240" height="240" rx="36" fill="url(#spot)"/><ellipse cx="120" cy="222" rx="80" ry="8" fill="#000" opacity="0.6"/>'
    f'<g transform="translate(20 8) scale(1.0)">{player(BLACK, guitar_outline="#1d3f94", angle=-34, stance=1.15)}</g>')
# 4) Rock pozu: geriye yaslanmış, sap daha dik, daha açık bacak
variants["rock"] = svg(f'<rect width="240" height="240" rx="120" fill="{BLACK}"/><circle cx="120" cy="120" r="112" fill="none" stroke="{NAVY2}" stroke-width="6"/>'
    f'<g transform="translate(26 12) scale(0.94)">{player(NAVY2, guitar_outline=BLACK, angle=-44, stance=1.3, lean=-6)}</g>')
# 5) Sadece silüet (şeffaf zemin)
variants["siluet"] = svg(f'{player(NAVY, guitar_outline="#ffffff", angle=-30, stance=1.1)}', vb="20 5 200 215")

os.makedirs(OUT, exist_ok=True)
for name, content in variants.items():
    with open(os.path.join(OUT, f"{name}.svg"), "w") as f:
        f.write(content)
print("Yazıldı:", ", ".join(variants))
