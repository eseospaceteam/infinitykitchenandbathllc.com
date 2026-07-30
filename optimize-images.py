#!/usr/bin/env python3
"""
Image weight reduction. Idempotent — safe to re-run.

Measured before this ran: the homepage transferred 6.37 MB, of which 6.17 MB
was images. Two causes, both fixed here.

1. NAV THUMBNAILS. The Services mega-menu carries 21 distinct thumbnails
   totalling 5.29 MB, and the CSS renders every one of them at 60x52 px
   (.mega-thumb). Several were 2000x1125. They are on all 176 pages, so every
   single pageview paid for them. This generates proper 2x thumbnails
   (120x104, cover-cropped to the same aspect the CSS enforces) and rewrites
   the nav region to point at those.

2. ONE 11.4 MB PNG. Waterproof-flooring-installation-for-bathroom-remodeling
   .png is 3303x2501 and is referenced on 10 pages — as a small service-card
   thumbnail on most of them, and as the og:image on 5. At 11.4 MB the og:image
   also exceeds Facebook's 8 MB fetch limit, so social previews for those pages
   were almost certainly broken. Re-encoded to a 1600px progressive JPEG.

Originals are never deleted — only dereferenced — so nothing that is already
indexed or hotlinked starts 404ing.

ImageMagick is not available on this machine; this uses PIL.

Usage: python3 optimize-images.py [--dry-run]
"""
import os
import re
import sys
from glob import glob

from PIL import Image, ImageOps

DRY = '--dry-run' in sys.argv
ROOT = os.path.dirname(os.path.abspath(__file__))
UPLOADS = os.path.join(ROOT, 'wp-content', 'uploads')
THUMBS_REL = 'wp-content/uploads/thumbs'
THUMBS_ABS = os.path.join(UPLOADS, 'thumbs')
THUMB_SUFFIX = '-nav'

# .mega-thumb is 60x52 with object-fit:cover. 2x for retina.
THUMB_W, THUMB_H = 120, 104

SITE = 'https://www.infinitykitchenandbathllc.com'


def page_files():
    files = sorted(glob(os.path.join(ROOT, '*.html')))
    files += sorted(glob(os.path.join(ROOT, 'lp', '*', 'index.html')))
    return files


def nav_region(html):
    """Same boundary update-chrome.mjs uses: <nav id="navbar"> through the end
    of the mobile drawer, which closes with two </div> after .mobile-nav-cta."""
    start = html.find('<nav id="navbar"')
    if start == -1:
        return None
    cta = html.find('mobile-nav-cta', start)
    if cta == -1:
        return None
    end = html.find('</div>', html.find('</div>', cta) + 6) + 6
    return start, end


def human(n):
    return f'{n / 1024:,.0f} KB' if n < 1048576 else f'{n / 1048576:.2f} MB'


# ── 1. nav thumbnails ──────────────────────────────────────────────────────
def collect_nav_thumbs():
    """Sources that still need a thumbnail built.

    MUST skip anything already under /thumbs/. Without that check the script
    reads back its own output on the next run, builds a thumbnail *of the
    thumbnail*, and rewrites the src — so filenames grow -nav-nav-nav-nav on
    every invocation and the page ends up pointing at a file that does not
    exist yet. Verify idempotency by comparing file checksums across two runs,
    not by trusting the printed counts.
    """
    srcs = set()
    for f in page_files():
        html = open(f, encoding='utf8').read()
        r = nav_region(html)
        if not r:
            continue
        nav = html[r[0]:r[1]]
        for m in re.findall(r'<img src="([^"]+)"[^>]*class="mega-thumb"', nav):
            if f'/{os.path.basename(THUMBS_REL)}/' in m:
                continue
            srcs.add(m)
    return sorted(srcs)


def thumb_name(src):
    stem = os.path.splitext(os.path.basename(src.split('?')[0]))[0]
    # Belt and braces: never stack the suffix even if a source slips through.
    while stem.endswith(THUMB_SUFFIX):
        stem = stem[: -len(THUMB_SUFFIX)]
    return f'{stem}{THUMB_SUFFIX}.jpg'


def build_thumbs(srcs):
    os.makedirs(THUMBS_ABS, exist_ok=True)
    made = saved = 0
    total_before = total_after = 0
    for src in srcs:
        rel = src.split('/uploads/')[-1]
        srcpath = os.path.join(UPLOADS, rel)
        if not os.path.exists(srcpath):
            print(f'  MISSING SOURCE {rel}')
            continue
        out = os.path.join(THUMBS_ABS, thumb_name(src))
        before = os.path.getsize(srcpath)
        total_before += before
        if os.path.exists(out):
            total_after += os.path.getsize(out)
            continue
        if DRY:
            made += 1
            continue
        im = Image.open(srcpath)
        im = ImageOps.exif_transpose(im)
        if im.mode not in ('RGB', 'L'):
            im = im.convert('RGB')
        # Cover-crop to the .mega-thumb aspect so the visual result is
        # identical to what object-fit:cover was already producing.
        im = ImageOps.fit(im, (THUMB_W, THUMB_H), method=Image.LANCZOS, centering=(0.5, 0.5))
        im.save(out, 'JPEG', quality=82, optimize=True, progressive=True)
        after = os.path.getsize(out)
        total_after += after
        saved += before - after
        made += 1
    return made, total_before, total_after


def rewrite_nav(srcs):
    """Point mega-thumb <img src> at the new thumbnails, nav region only."""
    mapping = {s: f'{SITE}/{THUMBS_REL}/{thumb_name(s)}' for s in srcs}
    touched = 0
    for f in page_files():
        html = open(f, encoding='utf8').read()
        r = nav_region(html)
        if not r:
            continue
        start, end = r
        nav = html[start:end]
        new = nav
        for old, repl in mapping.items():
            new = new.replace(f'<img src="{old}"', f'<img src="{repl}"')
        # Explicit intrinsic size prevents layout shift and stops the browser
        # from having to guess before the image arrives.
        new = new.replace('class="mega-thumb" loading="lazy"',
                          'class="mega-thumb" width="60" height="52" loading="lazy"')
        if new != nav:
            if not DRY:
                open(f, 'w', encoding='utf8').write(html[:start] + new + html[end:])
            touched += 1
    return touched


# ── 2. the 11.4 MB PNG ─────────────────────────────────────────────────────
BIG_PNG = '2024/12/Waterproof-flooring-installation-for-bathroom-remodeling.png'
BIG_OUT = '2024/12/Waterproof-flooring-installation-for-bathroom-remodeling.jpg'
BIG_MAX = 1600


def convert_big():
    srcpath = os.path.join(UPLOADS, BIG_PNG)
    outpath = os.path.join(UPLOADS, BIG_OUT)
    if not os.path.exists(srcpath):
        return None
    before = os.path.getsize(srcpath)
    if not os.path.exists(outpath) and not DRY:
        im = Image.open(srcpath)
        im = ImageOps.exif_transpose(im)
        if im.mode not in ('RGB', 'L'):
            im = im.convert('RGB')
        im.thumbnail((BIG_MAX, BIG_MAX), Image.LANCZOS)
        im.save(outpath, 'JPEG', quality=84, optimize=True, progressive=True)
    after = os.path.getsize(outpath) if os.path.exists(outpath) else 0
    # Repoint every reference, including og:image / twitter:image.
    touched = 0
    for f in page_files():
        html = open(f, encoding='utf8').read()
        if BIG_PNG not in html:
            continue
        new = html.replace(BIG_PNG, BIG_OUT)
        if new != html:
            if not DRY:
                open(f, 'w', encoding='utf8').write(new)
            touched += 1
    return before, after, touched


# ── 3. every other oversized referenced image ──────────────────────────────
# Most of these are photographs shipped as PNG (a 1001x1060 PNG served into a
# ~400px service-card slot on 40 pages) or JPEGs at 2000px with no compression
# budget. Cap the longest side and re-encode.
OPT_SUFFIX = '-opt'
OPT_THRESHOLD = 250 * 1024
OPT_MAX = 1600
# Never touch these: transparency or brand assets that must stay lossless.
OPT_SKIP = ('infinity-logo', 'favicon', 'apple-touch-icon')


def referenced_images():
    """Every uploads/ or images/ file referenced from the HTML, with the pages
    referencing it. Catches <img src> and inline background-image:url()."""
    refs = {}
    # The leading slash is OPTIONAL. The homepage hero — the LCP element on the
    # highest-traffic page — is referenced as a relative `src="images/..."`, so
    # a pattern anchored on "/" silently skips the one image that matters most.
    # The lookbehind must exclude word chars only. Excluding "/" as well would
    # reject every absolute URL, because "…llc.com/wp-content/…" has a slash
    # right before the path — leaving the pattern matching almost nothing while
    # still appearing to work. It blocks "myimages/x.jpg" but allows both
    # "https://host/wp-content/…" and a bare relative "images/x.jpg".
    pat = re.compile(r'(?<![\w-])((?:wp-content/uploads|images)/[^"\')\s]+\.(?:png|jpe?g))', re.I)
    for f in page_files():
        html = open(f, encoding='utf8').read()
        for rel in pat.findall(html):
            refs.setdefault(rel, set()).add(f)
    return refs


def transparent_fraction(im):
    """Share of fully-transparent pixels, 0.0 if the image has no alpha."""
    if im.mode == 'P' and 'transparency' in im.info:
        im = im.convert('RGBA')
    if im.mode not in ('RGBA', 'LA', 'PA'):
        return 0.0
    alpha = im.convert('RGBA').getchannel('A')
    return alpha.histogram()[0] / float(im.size[0] * im.size[1])


# Photos exported as PNG often carry a thin transparent edge band (the two
# worst offenders here are ~3%, a strip along the bottom). Those flatten onto
# white harmlessly — every page background behind them is white, and the
# service-card slot is aspect-ratio 4/3 with object-fit:cover, which crops the
# band off entirely. Anything with a large transparent area is a cutout or a
# logo that genuinely needs its alpha, so leave those alone.
ALPHA_FLATTEN_LIMIT = 0.25


def optimize_rest():
    results = []
    skipped_alpha = []
    for rel, pages in sorted(referenced_images().items()):
        stem = os.path.splitext(os.path.basename(rel))[0]
        # Guard against re-processing our own output on a later run.
        if stem.endswith(OPT_SUFFIX) or f'/{os.path.basename(THUMBS_REL)}/' in rel:
            continue
        if any(s in stem.lower() for s in OPT_SKIP):
            continue
        src = os.path.join(ROOT, rel)
        if not os.path.exists(src):
            continue
        before = os.path.getsize(src)
        if before <= OPT_THRESHOLD:
            continue
        out_rel = os.path.join(os.path.dirname(rel), f'{stem}{OPT_SUFFIX}.jpg')
        out = os.path.join(ROOT, out_rel)
        if not os.path.exists(out):
            if DRY:
                results.append((rel, before, 0, len(pages)))
                continue
            im = Image.open(src)
            frac = transparent_fraction(im)
            if frac > ALPHA_FLATTEN_LIMIT:
                skipped_alpha.append((rel, frac))
                continue
            im = ImageOps.exif_transpose(im)
            if frac > 0:
                # Flatten onto white rather than letting JPEG fill alpha black.
                flat = Image.new('RGB', im.size, (255, 255, 255))
                flat.paste(im.convert('RGBA'), mask=im.convert('RGBA').getchannel('A'))
                im = flat
            elif im.mode not in ('RGB', 'L'):
                im = im.convert('RGB')
            im.thumbnail((OPT_MAX, OPT_MAX), Image.LANCZOS)
            im.save(out, 'JPEG', quality=84, optimize=True, progressive=True)
        after = os.path.getsize(out) if os.path.exists(out) else 0
        # Only adopt it if it is actually smaller.
        if after and after >= before:
            os.remove(out)
            continue
        touched = 0
        for f in page_files():
            html = open(f, encoding='utf8').read()
            if rel not in html:
                continue
            new = html.replace(rel, out_rel)
            if new != html:
                if not DRY:
                    open(f, 'w', encoding='utf8').write(new)
                touched += 1
        results.append((rel, before, after, touched))
    return results, skipped_alpha


if __name__ == '__main__':
    print(f'{"DRY RUN — " if DRY else ""}optimizing images\n')

    srcs = collect_nav_thumbs()
    print(f'nav thumbnails: {len(srcs)} distinct')
    made, tb, ta = build_thumbs(srcs)
    print(f'  generated {made} thumbnail(s) at {THUMB_W}x{THUMB_H}')
    print(f'  originals {human(tb)}  ->  thumbnails {human(ta)}')
    if tb:
        print(f'  saved per pageview: {human(tb - ta)}  ({100 * (tb - ta) / tb:.1f}%)')
    touched = rewrite_nav(srcs)
    print(f'  nav rewritten on {touched} page(s)')

    print()
    res = convert_big()
    if res:
        before, after, t = res
        print('oversized PNG -> JPEG')
        print(f'  {os.path.basename(BIG_PNG)[:52]}')
        print(f'  {human(before)}  ->  {human(after)}   referenced on {t} page(s)')

    print()
    rest, alpha = optimize_rest()
    if rest:
        tb = sum(r[1] for r in rest)
        ta = sum(r[2] for r in rest)
        print(f'other oversized images: {len(rest)} re-encoded (cap {OPT_MAX}px, q84)')
        for rel, b, a, t in sorted(rest, key=lambda r: -r[1])[:10]:
            print(f'  {human(b):>10} -> {human(a):>9}  on {t:3} pages  {os.path.basename(rel)[:44]}')
        if len(rest) > 10:
            print(f'  … and {len(rest) - 10} more')
        print(f'  combined {human(tb)} -> {human(ta)}  ({100 * (tb - ta) / tb:.1f}% smaller)')
    if alpha:
        print(f'  left as PNG — genuine cutouts (>{ALPHA_FLATTEN_LIMIT:.0%} transparent): '
              + ', '.join(f'{os.path.basename(a)} {f:.0%}' for a, f in alpha[:3]))

    print('\nOriginals left in place — only dereferenced, so nothing 404s.')
