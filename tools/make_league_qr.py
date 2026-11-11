#!/usr/bin/env python3
"""Printable QR codes for league register pages.

The target URL is the preview GitHub Pages base plus #lk-register (or the
Onion Shed hash, later). Swap LK_PUBLIC_BASE in lingkana.js and re-run this
script before printing posters for the live site.
"""
from __future__ import annotations
import argparse, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LING = ROOT / "lingkana.js"
# Screenshots and poster assets live outside the repo worktree.
SHOTS = Path("/workspace/shots-c16")

def public_base() -> str:
    text = LING.read_text()
    m = re.search(r"const LK_PUBLIC_BASE='([^']+)'", text)
    if not m:
        raise SystemExit("LK_PUBLIC_BASE not found in lingkana.js")
    return m.group(1).rstrip("/") + "/"

def make_qr(url: str, dest: Path, caption: str | None = None) -> None:
    import qrcode
    from PIL import Image, ImageDraw, ImageFont
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=12, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    if caption:
        w, h = img.size
        pad = 36
        canvas = Image.new("RGB", (w, h + pad), "white")
        canvas.paste(img, (0, 0))
        draw = ImageDraw.Draw(canvas)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
        except Exception:
            font = ImageFont.load_default()
        draw.text((16, h + 8), caption[:80], fill="black", font=font)
        img = canvas
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "PNG")
    print(f"wrote {dest} -> {url} ({img.size[0]}x{img.size[1]})")

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--kind", choices=("lingkana", "onion-shed"), default="lingkana")
    ap.add_argument("--url", default="")
    args = ap.parse_args()
    base = public_base()
    if args.kind == "lingkana":
        url = args.url or (base + "#lk-register")
        dest = SHOTS / "lingkana-register-qr.png"
        caption = "Lingkana League — register"
    else:
        url = args.url or (base + "#os-register")
        dest = SHOTS / "onion-shed-register-qr.png"
        caption = "Onion Shed Challenge — register"
    make_qr(url, dest, caption)

if __name__ == "__main__":
    main()
