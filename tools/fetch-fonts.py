#!/usr/bin/env python3
"""Download OFL webfont subsets Google already cuts, rewrite to local files."""
import re
import ssl
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "fonts"
CSS = ROOT / "app.css"
FONTS.mkdir(exist_ok=True)

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
API = (
    "https://fonts.googleapis.com/css2"
    "?family=IBM+Plex+Mono:wght@500"
    "&family=Piazzolla:ital,opsz,wght@0,8..30,400;0,8..30,500;1,8..30,400"
    "&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;1,8..60,400"
    "&display=swap"
)

ctx = ssl.create_default_context()
req = urllib.request.Request(API, headers={"User-Agent": UA})
css = urllib.request.urlopen(req, context=ctx, timeout=30).read().decode("utf-8")

urls = sorted(set(re.findall(r"https://fonts\.gstatic\.com/s/[^)]+\.woff2", css)))
print("faces", len(re.findall(r"@font-face", css)), "files", len(urls))

for i, url in enumerate(urls, 1):
    name = url.rsplit("/", 1)[-1]
    dest = FONTS / name
    if not dest.exists():
        r = urllib.request.Request(url, headers={"User-Agent": UA})
        dest.write_bytes(urllib.request.urlopen(r, context=ctx, timeout=60).read())
        print("got", name, dest.stat().st_size)
    css = css.replace(url, f"fonts/{name}")

css = css.replace("font-display: swap;", "font-display: swap;")
text = CSS.read_text(encoding="utf-8")
start = "/* local-fonts */"
end = "/* /local-fonts */"
block = f"{start}\n{css.strip()}\n{end}\n\n"
if start in text:
    pre, rest = text.split(start, 1)
    _, rest = rest.split(end, 1)
    text = pre + block + rest.lstrip("\n")
else:
    text = block + text
CSS.write_text(text, encoding="utf-8")
print("wrote", CSS, "and", len(list(FONTS.glob("*.woff2"))), "woff2")
