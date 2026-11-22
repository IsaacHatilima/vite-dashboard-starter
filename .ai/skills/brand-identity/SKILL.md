---
name: brand-identity
description: Use when creating or applying a product's brand - composing its colour system from the brand-colours library (for example "a brand around green, red and gray"), writing brand guidelines, theming an app or the vite-dashboard starter, typography, logo and app icons, BRAND.md - or when reviewing UI for off-brand colours, raw hex values, contrast, or logo misuse.
---

# Brand identity

Applies to: any project that needs a brand, a theme, or a check that it follows one. Every colour comes from the [brand-colours](https://github.com/IsaacHatilima/brand-colours) library of 948 named colours sampled from real photographs, never from memory, so brands don't drift toward the usual generated palettes (Tailwind blue, purple gradients on white). `brand.py`, beside this file, finds library colours and builds a full, contrast-audited colour system and guideline document from four of them. The frontend skills decide layout; this skill decides how the product looks and sounds.

## 1. Find the brand first

If the project has a `BRAND.md`, or its stylesheet already carries a brand's tokens (`--brand-accent`, `--logo-spark`, or a system's `--surface` set), that is the brand. Keep it, and never switch or edit it as a side effect of other work.

## 2. Understand the ask

Collect what only the person can decide: the hues they want (any number of words such as "green, red and gray", or none), three words for the character, the product and its audience, and anything to avoid. Ask once, in one round with a recommended answer for each question, when a person is in the conversation and these are missing. Working alone, decide from the product and record the reasons in the spec's rationale.

## 3. Choose four library colours

A system needs four colours, each with a role:

| Role | Used for | Library filter |
|---|---|---|
| **primary** | Primary buttons, links, selected states, active navigation | `--role primary`: mid lightness |
| **accent** | One highlight per view, badges, chart emphasis, the focus ring. At least 35° of hue from the primary | `--role accent`: clearly coloured |
| **ink** | Text in light mode and the dark-mode page; the greys are generated from it | `--role ink`: near-black |
| **spark** | The logo's highlight only, never UI | `--role spark`: light enough to read on the ink |

Map the ask onto the roles. The first or dominant hue is usually the primary and a contrasting one the accent. A gray, charcoal, slate or black request is the ink, because the neutrals derive from it. Search the library:

```bash
python3 brand.py pick --family green --role primary          # spread from light to dark
python3 brand.py pick --family red --role accent --limit 8
python3 brand.py pick --family gray --role ink
python3 brand.py pick --family green --role spark
python3 brand.py pick --near "#2E7D32" --role primary         # closest library colours to a hex
python3 brand.py pick --like calm --family blue               # by name, character or suggested uses
```

Families: red, orange, brown, yellow, olive, green, teal, blue, purple, pink, gray (any neutral), black and white, plus synonyms such as grey, navy, teal, crimson or charcoal. Choose by character and fit, not by the first row. When the person gave a hex, use `--near`, and say which library colour stands in for it.

## 4. Build and audit

Write the spec with the four slugs, then build it:

```json
{
  "slug": "fieldstone",
  "name": "Fieldstone",
  "character": "grounded, honest, alert",
  "uses": "agriculture platforms, field operations, logistics",
  "rationale": "Two or three sentences on why these four work together, as the reference systems write it.",
  "primary": "bold-avocado",
  "accent": "pickled-radish",
  "spark": "winter-willow-green",
  "ink": "river-styx"
}
```

```bash
python3 brand.py build docs/brand/fieldstone.spec.json --check
python3 brand.py build docs/brand/fieldstone.spec.json --out docs/brand --starter
```

The build generates the 50–950 scales, light and dark tokens, status colours moved away from the brand hues, five chart shades, and the logo's ground table, then audits about 90 pairings (4.5:1 for text, 3:1 for borders, focus, fills and chart marks). When it reports a problem, such as primary and accent too alike or the spark too dim on the ink, replace the colour in that role with another library colour and build again. Never edit the generated values by hand.

The output, kept in the project (usually `docs/brand/`):

- `<slug>.md`, the brand's colour guidelines: brand and logo colours, the ground table, rationale, every token in both themes, scales, accessible pairings, rules, and verification notes;
- `<slug>.css` and `<slug>.tokens.json`, the full token set;
- `<slug>.starter.css` with `--starter`, the accent layer for the vite-dashboard starter;
- the spec, so the brand can be rebuilt after a library update.

The [reference systems](systems/index.md) are 32 finished examples of this output. Use one as it stands only when the person asks for it, or offer it as a shortlist next to a new combination.

## 5. Apply it

**Projects built on vite-dashboard-starter:** keep the starter's tuned neutral surfaces. Add `<slug>.starter.css` after the `:root` and `.dark` blocks in `src/index.css` (or import it there). It replaces only the primary, focus ring, sidebar primary, destructive and charts, and adds the brand accent, link, status, soft and logo tokens, with Tailwind utilities such as `bg-brand-accent` and `text-success`.

**Other web projects:** copy `<slug>.css` into the global stylesheet and use the semantic tokens everywhere (`var(--primary)`, `var(--surface)`, `var(--text-muted)`). In Tailwind v4, expose them with `@theme inline`. With shadcn/ui, don't paste the CSS as it is: shadcn's `--accent` means a subtle hover background, so map the tokens instead:

| shadcn variable | System token |
|---|---|
| `--background` / `--foreground` | `bg` / `text` |
| `--card`, `--popover` (and their foregrounds) | `surface`, `surface-raised` (`text`) |
| `--primary`, `--primary-foreground` | `primary`, `on-primary` |
| `--secondary`, `--muted`, `--muted-foreground` | `surface-sunken`, `surface-sunken`, `text-muted` |
| `--accent`, `--accent-foreground` | `primary-soft`, `text` |
| `--destructive` / `--border` / `--input` / `--ring` | `danger` / `border` / `border-strong` / `focus` |
| `--chart-1` … `--chart-5` | `chart-1` … `chart-5` |

and add `--brand-accent` and `--brand-accent-foreground` (`accent`, `on-accent`) with the status and logo tokens.

**Expo and React Native:** generate a typed theme from `<slug>.tokens.json` (`themes.light`, `themes.dark`) and switch it with `useColorScheme()`, keeping the token names.

Never paste a hex value or a scale step into a component. If a role is missing, the design needs a role, not a one-off colour.

## 6. Rules that keep it on brand

The **Rules** section of the generated guidelines is binding. Across every brand:

- One primary button per view, and at most one accent button.
- Status is never colour alone: an icon and a word every time.
- Control edges use `border-strong`; `border` is for decorative dividers.
- Charts use the chart tokens and `chart-alt`, never status or logo colours, and every series gets a direct label or marker.
- The spark and the ink never appear in UI. The logo follows the guidelines' ground table, with 3:1 the minimum for any mark.

## 7. Typography

- In starter projects the UI face stays Geist and Geist Mono, because its density scale is measured on them. A brand may add one display face for the logo, auth screens, marketing pages and empty states.
- Elsewhere, use two families at most: a display face and a text face, plus a monospace face only for code or tabular IDs. Choose them for the character words; don't default to Inter, Roboto, Arial or system UI for display when the brand needs a voice.
- Define the type scale as tokens, use two or three weights, and tabular numerals for figures. Load fonts through the framework (`@fontsource`, `next/font`, `expo-font`) with a fallback stack of similar metrics.

## 8. Logo and app icon

- The wordmark and one-colour versions use the ink. The spark is a single dot, stroke or highlight, never a fill for the whole mark. Brand colours appear in the mark only on grounds the table allows.
- Deliver SVG sources for the lockup, the mark alone, and one-colour versions in ink and in paper; then the favicon (SVG, 32 and 16px), Apple touch icon (180px), web app icons (192 and 512px, plus a maskable version inside the safe zone), and Expo's native icons.
- Keep clear space equal to the larger of the spark's diameter and the wordmark's cap height, and set a minimum size below which the wordmark drops and the mark stands alone.
- Never recolour the mark outside the ground table, stretch it, or add gradients, shadows or outlines.

## 9. Voice

Take the spec's three character words as the voice. Copy is plain and short, says what something does, and keeps one name for one thing everywhere.

## 10. Write BRAND.md

Record the brand at the project root, or in `docs/BRAND.md`:

```markdown
# <Product> brand

Colours: <name> (`docs/brand/<slug>.md`, built from `docs/brand/<slug>.spec.json` with brand-colours <library version>)
Character: <three words>

## Colours
Primary <name> `<hex>` · Accent <name> `<hex>` · Logo spark <name> `<hex>` · Logo ink <name> `<hex>`
Tokens: `<stylesheet or theme file>`. Use roles, never hex.

## Typography
Display: <family, weights> · Text: <family, weights> · Scale: <steps or "the starter's">

## Logo
Files: <paths>. Grounds: <from the guidelines' table>. Clear space and minimum size: <values>.

## Voice
<two or three sentences>

## Don't
- <the rules from section 6 that matter most for this product>
```

## Reviewing brand use

These are findings when UI changes: a raw hex value or scale step in a component instead of a role; a spark or ink colour in UI; a second primary or accent button in one view; status shown by colour alone; a new colour outside the brand; contrast below the thresholds on a new pairing; the brand accent mapped onto shadcn's `--accent`; a starter project whose neutral surfaces were retinted; or a colour change with no matching update to the spec and `BRAND.md`.

Colours and the generator: [brand-colours](https://github.com/IsaacHatilima/brand-colours), refreshed into this skill with `scripts/sync-brand-colours` in the skills repository.
