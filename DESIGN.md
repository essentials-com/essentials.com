---
version: alpha
name: essentials.com
description: Monochrome, typographic landing page for the ESSENTIALS premium domain portfolio, with a single gold accent and light/dark modes.
colors:
  # Light mode is the token baseline; dark-mode values are the *-dark extension tokens.
  primary: "#000000"
  secondary: "#808080"
  tertiary: "#DAA520"
  background: "#FFFFFF"
  surface: "#FFFFFF"
  on-surface: "#000000"
  outline: "#DAA520"
  primary-dark: "#FFFFFF"
  background-dark: "#000000"
  tertiary-dark: "#FFD700"
  on-tertiary: "#000000"
  scrollbar-hover: "#FF8533"
typography:
  headline-display:
    fontFamily: "Inter Tight"
    fontSize: 96px
    fontWeight: 900
    lineHeight: 1
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: "Inter Tight"
    fontSize: 24px
    fontWeight: 900
    lineHeight: 1.3
  headline-md:
    fontFamily: "Inter Tight"
    fontSize: 19.2px
    fontWeight: 900
    lineHeight: 1.3
  label-lg:
    fontFamily: "Inter Tight"
    fontSize: 22.4px
    fontWeight: 900
    lineHeight: 1.2
  body-md:
    fontFamily: "Inter"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.7
  label-md:
    fontFamily: "Inter"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.4
rounded:
  none: 0
  xs: 2px
  sm: 4px
  md: 8px
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 48px
  gutter: 32px
  margin: 32px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.headline-md}"
    rounded: "{rounded.full}"
    padding: 16px 32px
  button-primary-hover:
    backgroundColor: transparent
    textColor: "{colors.tertiary}"
  button-primary-dark:
    backgroundColor: "{colors.tertiary-dark}"
    textColor: "{colors.on-tertiary}"
  page-dark:
    backgroundColor: "{colors.background-dark}"
    textColor: "{colors.primary-dark}"
  modal-scrollbar-thumb-hover:
    backgroundColor: "{colors.scrollbar-hover}"
  link-muted:
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
  domain-link:
    textColor: "{colors.primary}"
    typography: "{typography.label-lg}"
  modal:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 32px
  chart-tooltip:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
---

<!--
DESIGN.md — AI-readable design system document
Format: google-labs-code/design.md alpha
Validate: npx @google/design.md lint DESIGN.md
Source of truth for observed values: index.html <style> block (custom properties
--bg-color, --text-color, --dot-color and the component rules beneath them).
Sections 9-10 are aidevops-specific extensions.
-->

# Design System: essentials.com

## 1. Overview

**Mood**: luxurious, minimal, typographic
**Density**: spacious
**Atmosphere**: A black-and-white wordmark stage where the domain name itself is the product, lit by one gold dot.

**Key Characteristics:**

- The wordmark is the hero: `ESSENTIALS.COM` set in Inter Tight 900 at `clamp(2rem, 8vw, 6rem)`, with the dot in the gold accent (`.logo`, `.logo .dot`).
- Strict monochrome canvas (`#FFFFFF`/`#000000`) that inverts in dark mode; the only colour is the accent dot, the CTA and the modal border.
- Hierarchy comes from opacity, not extra colours: secondary links sit at 0.4-0.5 opacity and rise to 1 on hover.
- Light, dark and system themes; the choice persists in `localStorage`.
- Minimum 16px text everywhere (README feature list).

## 2. Colors

The palette is high-contrast monochrome with a single gold accent driving interaction.

- **Primary (`#000000`; dark `#FFFFFF`)**: all text, the wordmark letters, icons (`--text-color`).
- **Secondary (`#808080`)**: the rendered value of primary text at 50% opacity, used for domain links and the stats source line. Implement as `opacity: 0.4`-`0.5` on primary, not as a separate colour.
- **Tertiary (`#DAA520` goldenrod; dark `#FFD700` gold)**: the wordmark dot, the primary CTA, modal border and scrollbar thumb (`--dot-color`). Clicking the dot picks a random colour that must still pass WCAG AA against the background.
- **Background / Surface (`#FFFFFF`; dark `#000000`)**: page canvas and the modal (`--bg-color`).
- **On-surface (`#000000`)**: text on the canvas and modal.
- **On-tertiary (`#000000`)**: CTA label on the gold fill in both modes.
- **Outline (`#DAA520`)**: the 1px modal border uses the accent.
- **Scrollbar hover (`#FF8533`)**: modal scrollbar thumb on hover only.
- **Chart series**: domain colours in the 30-day traffic chart are assigned per domain in script (fallbacks `#4CAF50`, `#2196F3`, `#9C27B0`, `#FF5722`, `#607D8B`).
- Overlay scrim: `rgba(0, 0, 0, 0.7)` behind the modal.

## 3. Typography

The typography strategy uses **Inter Tight 900** for the wordmark, headings, CTAs, domain links and numbers, and **Inter 400** for body copy and labels. Both load from Google Fonts with size-adjusted local fallbacks (`Inter Fallback`, `Inter Tight Fallback`) to limit layout shift.

- **Headlines**: Inter Tight 900 to match the heavy wordmark.
- **Body**: Inter 400 at 16px with 1.7 line height in the modal for long-form portfolio copy.
- **Labels**: Inter 400 at 16px; the design never goes below 16px.

### Hierarchy

| Role | Token | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|-------|------|------|--------|-------------|----------------|-------|
| Wordmark | `headline-display` | Inter Tight | clamp(2rem, 8vw, 6rem) | 900 | 1 | 0.02em gap | `.logo`; mobile clamp(1.2rem, 7vw, 3rem) |
| Modal heading | `headline-lg` | Inter Tight | 1.5rem | 900 | 1.3 | | `.modal h2`; stat values 1.5rem, pie total 1.8rem |
| Section heading / CTA | `headline-md` | Inter Tight | 1.2rem | 900 | 1.3 | | `.cta`, `.traffic-header h2`; modal h3 1.1rem |
| Domain links | `label-lg` | Inter Tight | 1.4rem | 900 | 1.2 | | `.domains a`; 1rem in the mobile header |
| Body | `body-md` | Inter | 1rem | 400 | 1.7 | | `.modal p`; list items 1.6 |
| Label | `label-md` | Inter | 1rem | 400 | 1.4 | | stats labels, legends, tooltips |

## 4. Layout

The layout is a **centred single column** on a `1rem` (16px) rhythm with `0.5rem` half-steps.

### Spacing Scale

| Token | Value | Use |
|-------|-------|-----|
| `xs` | 4px | Legend swatch gaps |
| `sm` | 8px | Link stacks (`.cta-links a` margin 0.5rem) |
| `md` | 16px | Default gap, header padding, row gap between domains |
| `lg` | 32px | Section padding (`.logo-container`, `.cta-section`, `.domains`, modal) |
| `xl` | 48px | Modal padding at ≥768px |
| `gutter` | 32px | Column gap between domain links |
| `margin` | 32px | Page and section margins |

### Grid & Container

- **Max content width**: 900px for the traffic chart, 700px for the browser chart, 600px for the modal.
- **Columns**: single column; the domain list is a centred, wrapping flex row.
- **Gutter**: `{spacing.gutter}`
- **Container padding**: `{spacing.margin}`

### Whitespace Philosophy

Generous empty space around the wordmark sets the premium tone; sections are separated by padding, never by rules or cards.

## 5. Elevation & Depth

Depth comes from **flat contrast**, with soft glows reserved for the accent.

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (0) | No elevation | Page, sections, charts |
| Raised (1) | `0 2px 8px rgba(255, 215, 0, 0.3)` → hover `0 4px 12px rgba(255, 215, 0, 0.4)` | Primary CTA |
| Elevated (2) | `0 0 40px rgba(255, 106, 0, 0.3)` plus 1px accent border | Modal |
| Overlay (3) | `0 2px 10px rgba(0, 0, 0, 0.2)` | Chart tooltip |

## 6. Shapes

The shape language is **pill interaction on a sharp canvas**: the CTA is a full pill, data marks are nearly square, and only the modal has a soft 8px radius.

### Rounded Scale

| Token | Value | Use |
|-------|-------|-----|
| `none` | 0 | Sections, page |
| `xs` | 2px | Chart bars and legend swatches |
| `sm` | 4px | Tooltip, scrollbar thumb |
| `md` | 8px | Modal |
| `full` | 9999px | CTA pill (implemented as 50px), circular icon buttons and pie chart |

## 7. Components

### Cross-cutting component rules

- Branding/theming: colours come only from `--bg-color`, `--text-color` and `--dot-color`; theme changes swap those three properties with a 0.3s colour transition.
- Accessibility: text never below 16px; accent colour changes must keep WCAG AA contrast; the modal closes on overlay click and the Escape key.
- Sizing/spacing: use the 16px rhythm; icon buttons stay circular.
- Navigation/orientation: the header lists the sibling ESSENTIALS domains; the current TLD drives SEO tags, and clicking the extension moves to the next domain.
- Interaction feedback: hover raises opacity to 1 (links, icons) or lifts 1px (CTA); transitions are 0.2s ease, theme and modal 0.3s ease.

### Buttons

**Primary** (`{components.button-primary}`)

- States: Default (gold fill, black label) → Hover (`{components.button-primary-hover}`: transparent fill, gold label and border, translateY(-1px)) → Active (translateY(0), smaller glow).
- Border: 2px solid accent in every state.
- One primary CTA per page: the enquiry button that opens the modal.

**Icon buttons** (`.top-icon`, `.theme-toggle`)

- Circular, text-colour icons; hover raises opacity.

### Links

- Muted (`{components.link-muted}`): primary colour at 0.4 opacity, no underline; hover opacity 1.
- Domain (`{components.domain-link}`): Inter Tight 900 at 0.5 opacity with the accent dot; hover opacity 1 and underline offset 0.2em.
- Modal links: accent colour with hover change.

### Cards & Containers

**Modal** (`{components.modal}`)

- Width 90% (50% at ≥768px), max 600px, max height 85vh with thin accent scrollbar.
- Enters with translateY(20px) → 0 and a fade of the 0.7 black scrim.

### Data visualisation

- 30-day stacked bar chart and browser pie chart; tooltips use `{components.chart-tooltip}`; series colours per domain.

### Navigation

Non-sticky header on mobile; the domain list wraps and centres.

### Canonical examples

#### Wordmark: domain logo

Reference: `index.html` (`.logo`, `createStyledText()`)

Use when:

- Rendering any ESSENTIALS domain name as a brand mark.

Follow:

- Inter Tight 900, accent-coloured dot with -0.05em side margins, the `c` pulled in by -0.05em.

Allowed variations:

- Case cycling (UPPER, Title, lower) on click; random accent dot colour if it passes AA contrast.

Avoid:

- Colouring letters other than the dot, or using another typeface.

Responsive/accessibility notes:

- Mobile size clamp(1.2rem, 7vw, 3rem); the fade-in rise animation runs on first load only.

## 8. Do's and Don'ts

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

## 9. Responsive Behaviour

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | ≤ 767px | Smaller wordmark clamp, 1rem header domain links, non-sticky header, touch support for charts |
| Desktop | ≥ 768px | Modal at 50% width with 3rem padding |

### Touch Targets

- Minimum: 44x44px for icon buttons and the CTA.

### Mobile Rules

- Charts accept touch for tooltips; the header does not stick.

### Canonical Example Variants

- Wordmark: `clamp(2rem, 8vw, 6rem)` desktop, `clamp(1.2rem, 7vw, 3rem)` mobile.

## 10. Agent Prompt Guide

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

<!--
Generated by AI DevOps (https://aidevops.sh)
DESIGN.md spec: https://github.com/google-labs-code/design.md
-->
