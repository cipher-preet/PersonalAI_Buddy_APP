"""Generate KukuNotes launcher/app icons and splash assets from the branding artwork.

Usage: python scripts/generate-app-icons.py [path/to/kukunotes-icon.png]
Requires Pillow.
"""

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
BRANDING = ROOT.parent / "brandingMaterial"
DEFAULT_SOURCE = BRANDING / "kukunotes-icon.png"
BANNER_SOURCE = BRANDING / "KukuNotes Gradient Logo Banner.png"

# "KukuNotes" + tagline region of the 2172x724 banner. The mask shapes hide the
# tips of the banner's own K logo that reach into the crop's left edge.
WORDMARK_BOX = (655, 215, 2000, 580)
WORDMARK_MASKS = (
    [(655, 200), (675, 200), (675, 300), (655, 300)],
    [(655, 465), (740, 585), (655, 585)],
)
WORDMARK_BG_SAMPLE = (690, 470)

SPLASH_BG = (11, 21, 70)
SPLASH_BG_HEX = "#0B1546"
DENSITIES = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}

# Square region of the source artwork that contains the "K" glyph, clear of
# the glowing rounded-square frame drawn around it.
GLYPH_BOX = (190, 177, 970, 957)
GLYPH_FEATHER = 36

BG_TOP = (16, 30, 102)
BG_BOTTOM = (7, 13, 52)
ADAPTIVE_BG_HEX = "#0B1546"

MASTER = 1024


def load_glyph(source: Path) -> Image.Image:
    art = Image.open(source).convert("RGB").crop(GLYPH_BOX)
    w, h = art.size
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rectangle(
        (GLYPH_FEATHER, GLYPH_FEATHER, w - GLYPH_FEATHER, h - GLYPH_FEATHER),
        fill=255,
    )
    mask = mask.filter(ImageFilter.GaussianBlur(GLYPH_FEATHER / 2))
    glyph = art.convert("RGBA")
    glyph.putalpha(mask)
    return glyph


def background(size: int) -> Image.Image:
    bg = Image.new("RGB", (size, size))
    draw = ImageDraw.Draw(bg)
    for y in range(size):
        t = y / max(size - 1, 1)
        color = tuple(round(a + (b - a) * t) for a, b in zip(BG_TOP, BG_BOTTOM))
        draw.line([(0, y), (size, y)], fill=color)
    return bg


def compose(glyph: Image.Image, glyph_scale: float) -> Image.Image:
    """Full-bleed square master with the glyph occupying `glyph_scale` of the width."""
    canvas = background(MASTER).convert("RGBA")
    g = round(MASTER * glyph_scale)
    resized = glyph.resize((g, g), Image.LANCZOS)
    offset = (MASTER - g) // 2
    canvas.alpha_composite(resized, (offset, offset))
    return canvas


def apply_mask(img: Image.Image, shape: str) -> Image.Image:
    size = img.size[0]
    scale = 4
    mask = Image.new("L", (size * scale, size * scale), 0)
    draw = ImageDraw.Draw(mask)
    if shape == "circle":
        draw.ellipse((0, 0, size * scale - 1, size * scale - 1), fill=255)
    else:
        draw.rounded_rectangle(
            (0, 0, size * scale - 1, size * scale - 1),
            radius=round(size * scale * 0.2),
            fill=255,
        )
    mask = mask.resize((size, size), Image.LANCZOS)
    out = img.copy()
    out.putalpha(mask)
    return out


def save(img: Image.Image, path: Path, size: int, rgb: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    out = img.resize((size, size), Image.LANCZOS)
    if rgb:
        out = out.convert("RGB")
    out.save(path, optimize=True)
    print(f"wrote {path.relative_to(ROOT)} ({size}px)")


def feather(img: Image.Image, amount: int) -> Image.Image:
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rectangle((amount, amount, w - amount, h - amount), fill=255)
    out = img.convert("RGBA")
    out.putalpha(mask.filter(ImageFilter.GaussianBlur(amount / 2)))
    return out


def load_wordmark() -> Image.Image:
    banner = Image.open(BANNER_SOURCE).convert("RGB")
    draw = ImageDraw.Draw(banner)
    bg = banner.getpixel(WORDMARK_BG_SAMPLE)
    for polygon in WORDMARK_MASKS:
        draw.polygon(polygon, fill=bg)
    return feather(banner.crop(WORDMARK_BOX), 20)


def on_splash_bg(art: Image.Image, canvas: tuple, art_width: int) -> Image.Image:
    """Center `art` scaled to `art_width` on a solid splash-colored canvas."""
    out = Image.new("RGBA", canvas, SPLASH_BG + (255,))
    ratio = art_width / art.size[0]
    resized = art.resize((art_width, round(art.size[1] * ratio)), Image.LANCZOS)
    out.alpha_composite(
        resized,
        ((canvas[0] - resized.size[0]) // 2, (canvas[1] - resized.size[1]) // 2),
    )
    return out.convert("RGB")


def generate_splash(glyph: Image.Image) -> None:
    wordmark = load_wordmark()
    res = ROOT / "android" / "app" / "src" / "main" / "res"
    scale = 8  # master resolution in px per dp

    # Android 12+ splash icon: 288dp canvas, content must fit the 192dp circle.
    icon31 = on_splash_bg(glyph, (288 * scale, 288 * scale), 150 * scale)
    # Pre-12 centered logo and the shared bottom wordmark (200x80dp max).
    logo = on_splash_bg(glyph, (150 * scale, 150 * scale), 150 * scale)
    brand = on_splash_bg(wordmark, (200 * scale, 80 * scale), 200 * scale)

    for name, factor in DENSITIES.items():
        folder = res / f"drawable-{name}"
        for img, filename, dp in (
            (icon31, "splash_icon.png", (288, 288)),
            (logo, "splash_logo.png", (150, 150)),
            (brand, "splash_wordmark.png", (200, 80)),
        ):
            folder.mkdir(parents=True, exist_ok=True)
            size = (round(dp[0] * factor), round(dp[1] * factor))
            img.resize(size, Image.LANCZOS).save(folder / filename, optimize=True)
        print(f"wrote splash drawables for {name}")

    xcassets = ROOT / "ios" / "AIAssistantApp" / "Images.xcassets"
    for img, set_name, pt in (
        (logo, "SplashLogo", (150, 150)),
        (brand, "SplashWordmark", (200, 80)),
    ):
        folder = xcassets / f"{set_name}.imageset"
        folder.mkdir(parents=True, exist_ok=True)
        images = []
        for factor in (1, 2, 3):
            filename = f"{set_name}@{factor}x.png"
            img.resize((pt[0] * factor, pt[1] * factor), Image.LANCZOS).save(
                folder / filename, optimize=True
            )
            images.append({"idiom": "universal", "filename": filename, "scale": f"{factor}x"})
        (folder / "Contents.json").write_text(
            json.dumps({"images": images, "info": {"author": "xcode", "version": 1}}, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"wrote ios {set_name}.imageset")


def main() -> None:
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SOURCE
    glyph = load_glyph(source)
    generate_splash(glyph)

    full_bleed = compose(glyph, 0.82)
    legacy_square = apply_mask(compose(glyph, 0.78), "rounded")
    legacy_round = apply_mask(compose(glyph, 0.72), "circle")
    adaptive_fg = compose(glyph, 0.58)

    res = ROOT / "android" / "app" / "src" / "main" / "res"
    for name, factor in DENSITIES.items():
        folder = res / f"mipmap-{name}"
        save(legacy_square, folder / "ic_launcher.png", round(48 * factor))
        save(legacy_round, folder / "ic_launcher_round.png", round(48 * factor))
        save(adaptive_fg, folder / "ic_launcher_foreground.png", round(108 * factor), rgb=True)

    anydpi = res / "mipmap-anydpi-v26"
    anydpi.mkdir(parents=True, exist_ok=True)
    adaptive_xml = (
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
        '    <background android:drawable="@color/ic_launcher_background" />\n'
        '    <foreground android:drawable="@mipmap/ic_launcher_foreground" />\n'
        "</adaptive-icon>\n"
    )
    for name in ("ic_launcher.xml", "ic_launcher_round.xml"):
        (anydpi / name).write_text(adaptive_xml, encoding="utf-8")

    values = res / "values"
    (values / "ic_launcher_background.xml").write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        "<resources>\n"
        f'    <color name="ic_launcher_background">{ADAPTIVE_BG_HEX}</color>\n'
        "</resources>\n",
        encoding="utf-8",
    )

    ios = ROOT / "ios" / "AIAssistantApp" / "Images.xcassets" / "AppIcon.appiconset"
    ios_icons = {
        "Icon-App-20x20@2x.png": 40,
        "Icon-App-20x20@3x.png": 60,
        "Icon-App-29x29@2x.png": 58,
        "Icon-App-29x29@3x.png": 87,
        "Icon-App-40x40@2x.png": 80,
        "Icon-App-40x40@3x.png": 120,
        "Icon-App-60x60@2x.png": 120,
        "Icon-App-60x60@3x.png": 180,
        "Icon-App-1024x1024@1x.png": 1024,
    }
    for name, size in ios_icons.items():
        save(full_bleed, ios / name, size, rgb=True)

    images = ROOT / "src" / "assets" / "images"
    save(full_bleed, images / "app-icon.png", 512, rgb=True)
    save(legacy_square, images / "app-icon-android.png", 192)


if __name__ == "__main__":
    main()
