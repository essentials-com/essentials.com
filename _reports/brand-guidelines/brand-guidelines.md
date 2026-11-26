# essentials.com Brand Guidelines

::: report-cover
**Monochrome, typographic landing page for the ESSENTIALS premium domain portfolio, with a single gold accent and light/dark modes.**

Generated from the project-root `DESIGN.md` so implementation agents, designers, and reviewers share one canonical visual source of truth.
:::

::: manifest-card

### Production manifest

- **Design source:** `DESIGN.md`
- **Canonical use:** UI implementation, screenshots, report styling, and brand handoff
- **Verification:** lint `DESIGN.md`, regenerate this guide, then review HTML/PDF exports
- **Change rule:** update `DESIGN.md` first; regenerate generated outputs rather than editing them by hand
:::

## Brand overview

**Mood**: luxurious, minimal, typographic
**Density**: spacious
**Atmosphere**: A black-and-white wordmark stage where the domain name itself is the product, lit by one gold dot.

**Key Characteristics:**

- The wordmark is the hero: `ESSENTIALS.COM` set in Inter Tight 900 at `clamp(2rem, 8vw, 6rem)`, with the dot in the gold accent (`.logo`, `.logo .dot`).
- Strict monochrome canvas (`#FFFFFF`/`#000000`) that inverts in dark mode; the only colour is the accent dot, the CTA and the modal border.
- Hierarchy comes from opacity, not extra colours: secondary links sit at 0.4-0.5 opacity and rise to 1 on hover.
- Light, dark and system themes; the choice persists in `localStorage`.
- Minimum 16px text everywhere (README feature list).

## Colour roles

::: brand-swatch-grid
::: swatch-card accent=primary swatch=#000000

### primary

`#000000`
:::
::: swatch-card accent=secondary swatch=#808080

### secondary

`#808080`
:::
::: swatch-card accent=tertiary swatch=#DAA520

### tertiary

`#DAA520`
:::
::: swatch-card accent=background swatch=#FFFFFF

### background

`#FFFFFF`
:::
::: swatch-card accent=surface swatch=#FFFFFF

### surface

`#FFFFFF`
:::
::: swatch-card accent=surface swatch=#000000

### on-surface

`#000000`
:::
::: swatch-card accent=outline swatch=#DAA520

### outline

`#DAA520`
:::
::: swatch-card accent=primary-dark swatch=#FFFFFF

### primary-dark

`#FFFFFF`
:::
::: swatch-card accent=background-dark swatch=#000000

### background-dark

`#000000`
:::
::: swatch-card accent=tertiary-dark swatch=#FFD700

### tertiary-dark

`#FFD700`
:::
::: swatch-card accent=tertiary swatch=#000000

### on-tertiary

`#000000`
:::
::: swatch-card accent=scrollbar-hover swatch=#FF8533

### scrollbar-hover

`#FF8533`
:::
:::

## Typography and layout tokens

::: facts-table-wrap

| Token group | Values | Usage |
|---|---|---|
| Spacing | `unit` 8px, `xs` 4px, `sm` 8px, `md` 16px, `lg` 32px, `xl` 48px, `gutter` 32px, `margin` 32px | Layout rhythm, gutters, section spacing |
| Rounded | `none` 0, `xs` 2px, `sm` 4px, `md` 8px, `full` 9999px | Shape language for buttons, cards, forms |
:::

## Component and state guidance

Use the `components:` YAML tokens in `DESIGN.md` for exact button, input, card, badge, and navigation styling. Add missing component states before implementation when hover, focus, disabled, error, loading, or selected states are not explicit.

## Do's and don'ts

**Do:**

- Use `{colors.tertiary}` only for the dot, the single CTA and modal accents.
- Keep WCAG AA contrast (4.5:1 normal text, 3:1 large text), including randomised dot colours.
- Express hierarchy with weight and opacity before adding colours.
- Keep all text at 16px or larger.

**Don't:**

- Add new brand colours, gradients or photography to the landing canvas.
- Use font weights other than 400 (Inter) and 900 (Inter Tight); the tooltip's 600/700 are data emphasis only.
- Put sections in cards or add dividers; whitespace separates sections.

---

## Agent handoff

### Quick Token Reference

| Use | Token | Value |
|-----|-------|-------|
| Page background | `{colors.background}` | `#FFFFFF` (dark `#000000`) |
| Modal background | `{colors.surface}` | `#FFFFFF` (dark `#000000`) |
| Main text | `{colors.primary}` | `#000000` (dark `#FFFFFF`) |
| Muted text | `{colors.secondary}` | primary at 0.4-0.5 opacity |
| Accent, CTA | `{colors.tertiary}` | `#DAA520` (dark `#FFD700`) |
| Default body | `{typography.body-md}` | Inter 400 16px |
| Primary action | `{components.button-primary}` | gold pill |

### Ready-to-Use Prompts

- "Build a hero section": centred `{typography.headline-display}` wordmark with the accent dot, `{spacing.lg}` padding, one `{components.button-primary}` below, muted links at 0.4 opacity.
- "Build a stats block": centred row of Inter Tight 900 1.5rem values over Inter 16px labels, no cards, max width 900px.
- "Build a dialog": `{components.modal}` with the 0.7 black scrim, 1px accent border, accent glow and thin accent scrollbar.

## Verification checklist

- [ ] `npx @google/design.md lint DESIGN.md` exits with zero errors; warnings reviewed
- [ ] `aidevops design guidelines . --pdf` regenerates Markdown, HTML, and PDFs
- [ ] Browser review confirms colour contrast, typography hierarchy, component states, and print/PDF layout
- [ ] Generated files contain no private URLs, credentials, raw transcripts, or unapproved client identifiers
