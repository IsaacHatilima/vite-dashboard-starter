#!/usr/bin/env python3
"""Pick colours from the brand-colours library and build a brand's colour system from them.

Usage:
  python3 brand.py pick [--family green] [--role primary] [--near "#2E7D32"] [--like calm] [--limit 12]
  python3 brand.py build <spec.json> --out <dir> [--starter] [--check]

pick lists library colours. Families are red, orange, brown, yellow, olive,
green, teal, blue, purple, pink, gray, black and white (with common synonyms),
judged in OKLCH. Roles keep only colours that can play the role: primary,
accent, spark (the logo highlight) or ink (the near-black text and dark page).
Without --near, results are spread from light to dark.

build reads a spec naming four library colours by slug, generates the full
system (scales, light and dark tokens, status, charts, logo grounds) with the
brand-colours generator, audits every pairing, and writes <slug>.md,
<slug>.css and <slug>.tokens.json. --starter also writes <slug>.starter.css,
the accent layer for projects built on vite-dashboard-starter. --check builds
and audits without writing. A spec that fails exits 1 with the reasons:

  {"slug": "harbour-mint", "name": "Harbour Mint", "character": "calm, precise, fresh",
   "uses": "fintech dashboards, health records", "rationale": "Why these four work together.",
   "primary": "<slug>", "accent": "<slug>", "spark": "<slug>", "ink": "<slug>"}
"""

import argparse
import json
import math
import re
import sys
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / "kolors"))

import render_md  # noqa: E402
from checks import audit, logo_matrix, pairing_cards  # noqa: E402
from colormath import contrast, hex_to_oklch, hex_to_rgb, rgb_to_oklab  # noqa: E402
from render_tokens import render_css, render_json  # noqa: E402
from specs import spec_problems  # noqa: E402
from system import build_system  # noqa: E402

LIBRARY = HERE / "library" / "colors.json"
REPO_BLOB = "https://github.com/IsaacHatilima/brand-colours/blob/main/colors"
ROLES = ("primary", "accent", "spark", "ink")
SPEC_FIELDS = ("slug", "name", "character", "uses", "rationale", *ROLES)
NEUTRAL_CHROMA = 0.035
SYNONYMS = {"grey": "gray", "violet": "purple", "cyan": "teal", "turquoise": "teal", "aqua": "teal",
            "navy": "blue", "magenta": "pink", "rose": "pink", "crimson": "red", "maroon": "red",
            "burgundy": "red", "gold": "yellow", "lime": "green", "tan": "brown", "charcoal": "gray"}
FAMILIES = ("red", "orange", "brown", "yellow", "olive", "green", "teal", "blue", "purple", "pink",
            "gray", "black", "white")
# Upper OKLCH hue bound of each family between 10° and 330°; pink and red wrap around 0°.
HUE_BANDS = ((45, "red"), (80, "orange"), (115, "yellow"), (170, "green"), (215, "teal"), (275, "blue"),
             (330, "purple"))
# Asking for gray means any neutral; black and white narrow it to the ends.
COVERS = {"gray": {"gray", "black", "white"}}
ROLE_FILTERS = {
    "primary": lambda L, C: 0.2 <= L <= 0.8,
    "accent": lambda L, C: C >= 0.05 and 0.3 <= L <= 0.85,
    "spark": lambda L, C: C >= 0.05 and L >= 0.6,
    "ink": lambda L, C: L <= 0.23,
}
# The starter's shadcn variables a brand replaces; its neutral surfaces are left alone.
STARTER_ROLES = {
    "--primary": "primary", "--primary-foreground": "on-primary", "--ring": "focus",
    "--sidebar-primary": "primary", "--sidebar-primary-foreground": "on-primary", "--sidebar-ring": "focus",
    "--destructive": "danger", **{f"--chart-{n}": f"chart-{n}" for n in range(1, 6)},
}
STARTER_ADDITIONS = {
    "--brand-accent": "accent", "--brand-accent-foreground": "on-accent", "--brand-accent-soft": "accent-soft",
    "--primary-soft": "primary-soft", "--link": "link", "--link-hover": "link-hover",
    "--success": "success", "--success-soft": "success-soft", "--success-foreground": "on-success",
    "--warning": "warning", "--warning-soft": "warning-soft", "--warning-foreground": "on-warning",
    "--destructive-soft": "danger-soft", "--destructive-foreground": "on-danger",
    "--info": "info", "--info-soft": "info-soft", "--chart-alt": "chart-alt",
    "--logo-spark": "logo-spark", "--logo-ink": "logo-ink",
}


class BrandError(Exception):
    pass


# ---- The library -------------------------------------------------------------


def load_library():
    return {c["slug"]: c for c in json.loads(LIBRARY.read_text())["colors"]}


def family(L, C, H):
    """The colour family a person would name, judged in OKLCH."""
    if C < NEUTRAL_CHROMA:
        return "black" if L < 0.25 else "white" if L > 0.94 else "gray"
    if H >= 330 or H < 10:
        return "pink" if L >= 0.6 else "red"
    name = next(label for top, label in HUE_BANDS if H < top)
    if name == "orange" and L < 0.55:
        return "brown"
    if name == "yellow" and L < 0.6:
        return "olive"
    return name


def describe(color):
    L, C, H = hex_to_oklch(color["hex"])
    return {**color, "L": L, "C": C, "H": H, "family": family(L, C, H)}


def oklab_distance(a, b):
    return math.dist(rgb_to_oklab(hex_to_rgb(a)), rgb_to_oklab(hex_to_rgb(b)))


def spread(colors, limit):
    """At most `limit` colours, evenly spaced from lightest to darkest."""
    ordered = sorted(colors, key=lambda c: -c["L"])
    if len(ordered) <= limit:
        return ordered
    step = (len(ordered) - 1) / (limit - 1) if limit > 1 else 0
    return [ordered[round(i * step)] for i in range(limit)]


def pick(families=(), role=None, near=None, like=None, limit=12):
    wanted = {SYNONYMS.get(f.lower(), f.lower()) for f in families}
    unknown = wanted - set(FAMILIES)
    if unknown:
        raise BrandError(f"unknown families {sorted(unknown)}; use {', '.join(FAMILIES)}")
    colors = [describe(c) for c in load_library().values()]
    if wanted:
        accepted = set().union(*(COVERS.get(f, {f}) for f in wanted))
        colors = [c for c in colors if c["family"] in accepted]
    if role:
        colors = [c for c in colors if ROLE_FILTERS[role](c["L"], c["C"])]
    if like:
        word = like.lower()
        colors = [c for c in colors if word in f"{c['name']} {c['character']} {c['uses']}".lower()]
    if near:
        if not re.fullmatch(r"#[0-9A-Fa-f]{6}", near):
            raise BrandError(f"--near takes a hex colour such as #2E7D32, not {near!r}")
        return sorted(colors, key=lambda c: oklab_distance(c["hex"], near))[:limit]
    return spread(colors, limit)


def pick_table(colors):
    lines = ["slug | name | hex | L | C | H | family | character",
             "--- | --- | --- | --- | --- | --- | --- | ---"]
    for c in colors:
        lines.append(f"{c['slug']} | {c['name']} | {c['hex']} | {c['L']:.2f} | {c['C']:.3f} | {c['H']:.0f} | "
                     f"{c['family']} | {c['character']}")
    return "\n".join(lines) if colors else "No library colours match; widen the family, role or word."


# ---- Building a system -------------------------------------------------------


def load_spec(path, library):
    try:
        spec = json.loads(Path(path).read_text())
    except (OSError, json.JSONDecodeError) as e:
        raise BrandError(f"can't read the spec {path}: {e}") from e
    missing = [f for f in SPEC_FIELDS if not spec.get(f)]
    if missing:
        raise BrandError(f"the spec is missing {', '.join(missing)}")
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", spec["slug"]):
        raise BrandError(f"slug {spec['slug']!r} must be kebab-case")
    unknown = [spec[r] for r in ROLES if spec[r] not in library]
    if unknown:
        raise BrandError(f"not in the colour library: {', '.join(unknown)}; find colours with `brand.py pick`")
    resolved = {**spec, "source": "library", "source_name": spec["name"]}
    for role in ROLES:
        color = library[spec[role]]
        resolved[f"{role}_color"] = {k: color[k] for k in ("slug", "name", "hex", "character")}
    return resolved


def build(spec):
    """(system, audit rows) for a spec, or BrandError listing every rule it breaks."""
    try:
        system = build_system(*(spec[f"{r}_color"]["hex"] for r in ROLES))
    except ValueError as e:
        raise BrandError(f"these four colours can't form a system: {e}") from e
    rows = audit(system)
    problems = spec_problems(spec, system) + [
        f"{r['theme']}: {r['fg']} on {r['bg']} is {r['ratio']:.2f}:1" for r in rows if not r["passes"]]
    if problems:
        raise BrandError("the system breaks its rules:\n  " + "\n  ".join(problems)
                         + "\nChoose other library colours for the roles involved and build again.")
    return system, rows


def localise(text, slug):
    """Point library links at GitHub and drop the colour-sheet image only the repository renders."""
    text = re.sub(r"(?:\.\./)+colors/", f"{REPO_BLOB}/", text)
    text = re.sub(rf"^!\[[^\]]*\]\({re.escape(slug)}\.png\)\n\n", "", text, flags=re.M)
    return text.replace(f" · [Colour sheet]({slug}.png)", "")


def starter_css(spec, system):
    def block(selector, theme, mapping):
        return [f"{selector} {{"] + [f"  {var}: {system[theme][token]};" for var, token in mapping.items()] + ["}"]

    mapping = {**STARTER_ROLES, **STARTER_ADDITIONS}
    theme = ["@theme inline {"] + [f"  --color-{var[2:]}: var({var});" for var in STARTER_ADDITIONS] + ["}"]
    header = (f"/* {spec['name']}: brand accents for vite-dashboard-starter, generated by brand.py from the "
              "brand-colours library.\n   Add after the :root and .dark blocks in src/index.css. The starter's "
              "neutral surfaces stay as they are. */")
    return "\n".join([header, "", *theme, "", *block(":root", "light", mapping), "",
                      *block(".dark", "dark", mapping)]) + "\n"


def write_system(spec, system, rows, out, starter):
    render_md.COLORS_REL = REPO_BLOB.rsplit("/colors", 1)[0] + "/colors"
    slug = spec["slug"]
    out.mkdir(parents=True, exist_ok=True)
    markdown = render_md.render_markdown(spec, system, logo_matrix(spec, system), pairing_cards(system), rows)
    files = {f"{slug}.md": markdown, f"{slug}.css": render_css(spec, system),
             f"{slug}.tokens.json": render_json(spec, system)}
    if starter:
        files[f"{slug}.starter.css"] = starter_css(spec, system)
    for name, text in files.items():
        (out / name).write_text(localise(text, slug))
    return [out / name for name in files]


def summary(spec, system, rows):
    light, dark = system["light"], system["dark"]
    return (f"{spec['name']}: primary {light['primary']} / {dark['primary']}, accent {light['accent']} / "
            f"{dark['accent']}, ink {light['text']}; {len(rows)} contrast checks pass, "
            f"spark on ink {contrast(spec['spark_color']['hex'], spec['ink_color']['hex']):.1f}:1.")


# ---- Command line ------------------------------------------------------------


def parse_args(argv):
    parser = argparse.ArgumentParser(prog="brand.py", description=__doc__.split("\n\n")[0])
    commands = parser.add_subparsers(dest="command", required=True)
    p = commands.add_parser("pick", help="list library colours by family, role, closeness or mood")
    p.add_argument("--family", action="append", default=[], help="repeatable: green, red, gray, …")
    p.add_argument("--role", choices=ROLES)
    p.add_argument("--near", help="a hex colour; lists the closest library colours")
    p.add_argument("--like", help="a word to find in the name, character or suggested uses")
    p.add_argument("--limit", type=int, default=12)
    b = commands.add_parser("build", help="build and audit a system from a spec")
    b.add_argument("spec", type=Path)
    b.add_argument("--out", type=Path, help="where to write the files")
    b.add_argument("--starter", action="store_true", help="also write <slug>.starter.css")
    b.add_argument("--check", action="store_true", help="build and audit without writing")
    args = parser.parse_args(argv)
    if args.command == "build" and not args.check and not args.out:
        parser.error("build needs --out, or --check to only audit")
    return args


def main(argv):
    args = parse_args(argv)
    if args.command == "pick":
        print(pick_table(pick(args.family, args.role, args.near, args.like, args.limit)))
        return
    spec = load_spec(args.spec, load_library())
    system, rows = build(spec)
    print(summary(spec, system, rows))
    if not args.check:
        for path in write_system(spec, system, rows, args.out, args.starter):
            print(f"  wrote {path}")


if __name__ == "__main__":
    try:
        main(sys.argv[1:])
    except BrandError as e:
        print(f"brand.py: {e}", file=sys.stderr)
        sys.exit(1)
