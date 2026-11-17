#!/usr/bin/env python3
"""Vendor the site's external stylesheets (and their font files) into local assets.

Why this exists: the deliverable is a *file*. It gets emailed, dropped on a shared drive, and
opened months later — often on a machine with no route to fonts.googleapis.com, sometimes on
one where a proxy blocks it silently. A stylesheet fetched at open time is a dependency the
customer cannot see and cannot fix, and when it fails the page does not error, it just renders
in the wrong font. For a bilingual TH/EN document that is the difference between a designed
deliverable and a broken one, because the Thai text is what falls back hardest.

What it vendors:
  - the Google Fonts stylesheet (Inter, Noto Sans Thai, JetBrains Mono) plus every .woff2 it
    references, rewritten to relative paths
  - highlight.js's github-dark theme

Subsets: Google serves each family split by unicode-range. This keeps latin, latin-ext and
thai and drops cyrillic, greek and vietnamese — the site ships in Thai and English, so those
blocks are download weight for glyphs the deliverable never renders. Pass --all-subsets if a
project genuinely needs them.

Run from anywhere:

    python3 scripts/vendor_web_assets.py                 # both html-template and html-sample
    python3 scripts/vendor_web_assets.py --check         # verify, change nothing (exit 1 if stale)

Re-run it after bumping a font weight or a library version; it is idempotent.
"""
from __future__ import annotations

import argparse
import hashlib
import pathlib
import re
import ssl
import subprocess
import sys
import urllib.error
import urllib.request

SKILL = pathlib.Path(__file__).resolve().parent.parent
TARGETS = ["assets/html-template", "assets/html-sample"]

# A modern UA is required: Google Fonts serves .ttf to browsers it does not recognise, and the
# whole point here is the compact woff2 the site would have received anyway.
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")

# The superset of what the pages ask for. Two pages requested JetBrains Mono 400;500 and one
# asked for 400;500;600; vendoring the superset lets every page share one stylesheet, which is
# also one fewer thing to keep in sync by hand.
FONTS_URL = ("https://fonts.googleapis.com/css2"
             "?family=Inter:wght@400;500;600;700;800;900"
             "&family=Noto+Sans+Thai:wght@400;500;600;700;800"
             "&family=JetBrains+Mono:wght@400;500;600"
             "&display=swap")

HLJS_CSS_URL = ("https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0"
                "/build/styles/github-dark.min.css")

# The JavaScript the pages load from a CDN. Vendoring these is what actually makes the
# deliverable render offline: fonts alone give you the right typeface over a broken layout,
# because Tailwind is the layout engine and it arrives as script. Each entry is
# (cdn url as it appears in the HTML, pinned download url, local filename). The HTML url and
# the download url differ for Tailwind — the page loads the unversioned redirector, the real
# build sits at /<version> — and pinning the download is the point: a floating major means a
# reader six months from now silently gets a different build than the one this was verified on.
LOCAL_JS_DIR = "assets/js/vendor"
JS_LIBS = [
    # (url as written in HTML,                                   pinned download url,                                             local name)
    ("https://cdn.tailwindcss.com",                              "https://cdn.tailwindcss.com/3.4.17",                            "tailwindcss-3.4.17.min.js"),
    ("https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js",
     "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js",                                                              "mermaid-10.min.js"),
    ("https://cdn.jsdelivr.net/npm/marked@12/marked.min.js",
     "https://cdn.jsdelivr.net/npm/marked@12/marked.min.js",                                                                     "marked-12.min.js"),
    ("https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js",
     "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js",                                        "highlight-11.9.0.min.js"),
    ("https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js",
     "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js",                                                                         "d3-7.min.js"),
]

KEEP_SUBSETS = {"latin", "latin-ext", "thai"}

LOCAL_FONTS_CSS = "assets/css/fonts.css"
LOCAL_HLJS_CSS = "assets/css/highlight-github-dark.min.css"


def _ssl_context() -> "ssl.SSLContext | None":
    """Prefer certifi's roots when present.

    A stock python.org install on macOS ships no root certificates, so urllib fails on every
    HTTPS URL with CERTIFICATE_VERIFY_FAILED while the same request succeeds in curl. Trying
    certifi first and falling back to curl keeps this script working on both, rather than
    telling the user their network is broken when it is the interpreter's trust store.
    """
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return None


def fetch(url: str, binary: bool = False) -> bytes | str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30, context=_ssl_context()) as r:
            data = r.read()
    except urllib.error.URLError as e:
        if not isinstance(getattr(e, "reason", None), ssl.SSLError):
            raise
        # System trust store it is. curl carries its own on macOS and honours the proxy env.
        proc = subprocess.run(
            ["curl", "-fsSL", "-A", UA, url], capture_output=True, timeout=60)
        if proc.returncode != 0:
            raise urllib.error.URLError(
                f"urllib could not verify TLS and curl failed too: "
                f"{proc.stderr.decode(errors='replace')[:200]}") from e
        data = proc.stdout
    return data if binary else data.decode("utf-8")


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def build_fonts_css(all_subsets: bool) -> tuple[str, dict[str, bytes]]:
    """Return (rewritten css, {filename: font bytes})."""
    css = fetch(FONTS_URL)

    # Google emits each block as:  /* thai */\n@font-face { ... src: url(...) format('woff2'); }
    blocks = re.findall(r"/\*\s*([a-z0-9-]+)\s*\*/\s*(@font-face\s*\{.*?\})", css, re.S)
    if not blocks:
        raise SystemExit("could not parse the Google Fonts response — did the format change?")

    out_css, files, skipped = [], {}, set()
    for subset, block in blocks:
        if not all_subsets and subset not in KEEP_SUBSETS:
            skipped.add(subset)
            continue
        family = re.search(r"font-family:\s*'([^']+)'", block)
        weight = re.search(r"font-weight:\s*(\d+)", block)
        url = re.search(r"url\((https://[^)]+\.woff2)\)", block)
        if not (family and weight and url):
            raise SystemExit(f"unexpected @font-face block for subset {subset}")
        name = f"{slug(family.group(1))}-{weight.group(1)}-{subset}.woff2"
        if name not in files:
            files[name] = fetch(url.group(1), binary=True)
        out_css.append(f"/* {subset} */\n"
                       + block.replace(url.group(1), f"../fonts/{name}"))

    header = (
        "/* Vendored from Google Fonts — regenerate with scripts/vendor_web_assets.py.\n"
        "   Do not hand-edit: the @font-face blocks and the files in ../fonts/ are generated\n"
        "   together, and editing one without the other leaves the page requesting a font\n"
        "   that is not there — which fails silently, in the wrong typeface.\n"
        f"   Source: {FONTS_URL}\n"
        f"   Subsets kept: {', '.join(sorted(KEEP_SUBSETS)) if not all_subsets else 'all'}"
        + (f"\n   Subsets dropped (not rendered by a TH/EN deliverable): "
           f"{', '.join(sorted(skipped))}" if skipped else "")
        + "\n*/\n\n")
    return header + "\n\n".join(out_css) + "\n", files


# Every page currently carries these three lines; they collapse to one local stylesheet.
PRECONNECT_RE = re.compile(
    r'[ \t]*<link rel="preconnect" href="https://fonts\.(?:googleapis|gstatic)\.com"[^>]*>\n')
GOOGLE_CSS_RE = re.compile(
    r'[ \t]*<link href="https://fonts\.googleapis\.com/css2\?[^"]*" rel="stylesheet"[^>]*>\n')
HLJS_CSS_RE = re.compile(
    r'(<link[^>]*href=")https://cdn\.jsdelivr\.net/gh/highlightjs/[^"]*\.css("[^>]*>)')


def rewrite_html(text: str) -> str:
    had_google = bool(GOOGLE_CSS_RE.search(text))
    text = PRECONNECT_RE.sub("", text)
    text = GOOGLE_CSS_RE.sub("", text)
    if had_google:
        # Anchor the local stylesheet to the page's own styles.css so the two always load in a
        # predictable order: fonts first, then the sheet that uses them.
        text = re.sub(r'([ \t]*)(<link rel="stylesheet" href="assets/css/styles\.css)',
                      rf'\1<link rel="stylesheet" href="{LOCAL_FONTS_CSS}" />\n\1\2',
                      text, count=1)
    text = HLJS_CSS_RE.sub(rf'\1{LOCAL_HLJS_CSS}\2', text)

    # Point every CDN script at its local twin. Longest url first so the versioned Tailwind
    # url (if a page carries it) is replaced before the bare one, and both land on the same
    # local file. The inline `tailwind.config = {…}` that follows the Tailwind tag still works:
    # the vendored runtime reads window.tailwind.config exactly as the CDN build did.
    for html_url, _dl, name in sorted(JS_LIBS, key=lambda e: -len(e[0])):
        text = text.replace(html_url, f"{LOCAL_JS_DIR}/{name}")
    return text


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--all-subsets", action="store_true",
                    help="keep cyrillic/greek/vietnamese too (default: latin, latin-ext, thai)")
    ap.add_argument("--check", action="store_true",
                    help="verify the vendored files and HTML are in place; change nothing")
    args = ap.parse_args()

    if args.check:
        missing = []
        for t in TARGETS:
            root = SKILL / t
            for rel in (LOCAL_FONTS_CSS, LOCAL_HLJS_CSS):
                if not (root / rel).is_file():
                    missing.append(f"{t}/{rel}")
            fdir = root / "assets" / "fonts"
            fonts = list(fdir.glob("*.woff2"))
            if not fonts:
                missing.append(f"{t}/assets/fonts/*.woff2")
            manifest = fdir / "SHA256SUMS"
            if not manifest.is_file():
                missing.append(f"{t}/assets/fonts/SHA256SUMS")
            else:
                recorded = {}
                for line in manifest.read_text(encoding="utf-8").splitlines():
                    if line.strip() and not line.startswith("#"):
                        h, n = line.split(None, 1)
                        recorded[n.strip()] = h
                for f in fonts:
                    actual = hashlib.sha256(f.read_bytes()).hexdigest()
                    if recorded.get(f.name) != actual:
                        missing.append(f"{t}/assets/fonts/{f.name}: checksum mismatch or unlisted")
            jdir = root / LOCAL_JS_DIR
            jmanifest = jdir / "SHA256SUMS"
            if not jmanifest.is_file():
                missing.append(f"{t}/{LOCAL_JS_DIR}/SHA256SUMS")
            jrecorded = {}
            if jmanifest.is_file():
                for line in jmanifest.read_text(encoding="utf-8").splitlines():
                    if line.strip() and not line.startswith("#"):
                        parts = line.split()
                        jrecorded[parts[1]] = parts[0]
            for _html, _dl, name in JS_LIBS:
                f = jdir / name
                if not f.is_file():
                    missing.append(f"{t}/{LOCAL_JS_DIR}/{name}")
                elif jrecorded.get(name) != hashlib.sha256(f.read_bytes()).hexdigest():
                    missing.append(f"{t}/{LOCAL_JS_DIR}/{name}: checksum mismatch or unlisted")

            for page in root.glob("*.html"):
                txt = page.read_text(encoding="utf-8")
                if "fonts.googleapis.com" in txt or "fonts.gstatic.com" in txt:
                    missing.append(f"{t}/{page.name}: still references Google Fonts")
                if re.search(r'(?:src|href)="https://cdn\.', txt):
                    missing.append(f"{t}/{page.name}: still references a CDN "
                                   f"({re.search(r'https://cdn\.[^\"]+', txt).group(0)[:60]})")
        if missing:
            print("STALE — vendoring incomplete:")
            for m in missing:
                print(f"  {m}")
            return 1
        print("OK — stylesheets and fonts are vendored in both template and sample")
        return 0

    try:
        fonts_css, font_files = build_fonts_css(args.all_subsets)
        hljs_css = fetch(HLJS_CSS_URL)
        js_files = {name: fetch(dl, binary=True) for _html, dl, name in JS_LIBS}
    except (urllib.error.URLError, TimeoutError) as e:
        print(f"download failed: {e}\nNothing was changed — rerun with a network route to "
              f"fonts.googleapis.com and cdn.jsdelivr.net.")
        return 1

    total = sum(len(b) for b in font_files.values())
    js_total = sum(len(b) for b in js_files.values())
    print(f"fetched {len(font_files)} font files ({total/1024:.0f} KB), 2 stylesheets, "
          f"and {len(js_files)} JS libraries ({js_total/1024:.0f} KB)")

    for t in TARGETS:
        root = SKILL / t
        (root / "assets" / "css").mkdir(parents=True, exist_ok=True)
        fdir = root / "assets" / "fonts"
        fdir.mkdir(parents=True, exist_ok=True)

        (root / LOCAL_FONTS_CSS).write_text(fonts_css, encoding="utf-8")
        (root / LOCAL_HLJS_CSS).write_text(
            "/* Vendored from highlight.js — regenerate with scripts/vendor_web_assets.py.\n"
            f"   Source: {HLJS_CSS_URL} */\n" + hljs_css, encoding="utf-8")
        for name, blob in font_files.items():
            (fdir / name).write_bytes(blob)

        # Pin the fonts. They are the only binaries in the bundle, and a binary is the one file
        # class no reviewer re-reads and no text scan can inspect — so a swapped or truncated
        # one would otherwise ride into every deliverable unnoticed. The manifest is what lets
        # the bundle carry them as *verifiable* rather than merely present.
        (fdir / "SHA256SUMS").write_text(
            "# sha256 of each vendored font. Regenerate with scripts/vendor_web_assets.py;\n"
            "# do not hand-edit. Verified by the compliance suite (C-security).\n"
            f"# Upstream: {FONTS_URL}\n"
            + "".join(f"{hashlib.sha256(blob).hexdigest()}  {name}\n"
                      for name, blob in sorted(font_files.items())),
            encoding="utf-8")

        # Vendored JS. Minified library code is as unreviewable as a binary — nobody reads a
        # 3 MB minified mermaid bundle — so it is pinned the same way, with the upstream url
        # recorded next to each hash so a future reader can see exactly what was fetched.
        jdir = root / LOCAL_JS_DIR
        jdir.mkdir(parents=True, exist_ok=True)
        for name, blob in js_files.items():
            (jdir / name).write_bytes(blob)
        _dl_by_name = {name: dl for _h, dl, name in JS_LIBS}
        (jdir / "SHA256SUMS").write_text(
            "# sha256 of each vendored JS library. Regenerate with "
            "scripts/vendor_web_assets.py; do not hand-edit.\n"
            "# Verified by the compliance suite (C-security).\n"
            + "".join(f"{hashlib.sha256(blob).hexdigest()}  {name}  # {_dl_by_name[name]}\n"
                      for name, blob in sorted(js_files.items())),
            encoding="utf-8")
        for stale in jdir.glob("*.min.js"):
            if stale.name not in js_files:
                stale.unlink()
                print(f"  removed orphaned lib {t}/{LOCAL_JS_DIR}/{stale.name}")

        # Drop any font file no longer referenced, so a weight change does not leave orphans
        # shipping inside the deliverable forever.
        referenced = set(font_files)
        for stale in fdir.glob("*.woff2"):
            if stale.name not in referenced:
                stale.unlink()
                print(f"  removed orphaned font {t}/assets/fonts/{stale.name}")

        changed = 0
        for page in sorted(root.glob("*.html")):
            before = page.read_text(encoding="utf-8")
            after = rewrite_html(before)
            if after != before:
                page.write_text(after, encoding="utf-8")
                changed += 1
        print(f"  {t}: wrote fonts.css + {len(font_files)} woff2 + hljs css + "
              f"{len(js_files)} JS libs, rewrote {changed} pages")

    print("\nDone. The pages fetch nothing from a CDN at open time — they render fully offline.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
