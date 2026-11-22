name: TahuSumedang-ArtisanalLight
colors:
  primary: "#FAF9F6"
  secondary: "#F3F1ED"
  surface: "#FFFFFF"
  on-surface: "#1C1917"
typography:
  body-md:
    fontFamily: Inter-Variable
    fontSize: 16px
    fontWeight: 420
rounded:
  md: 8px
---

# Design System Inspired by Artisanal Culinary Heritage (Tahu Sumedang)

## 1. Visual Theme & Atmosphere

This design system embodies a warm, clean, and appetizing artisanal aesthetic tailored specifically for culinary commerce. Moving away from cold dark tech aesthetics, the system leverages a luminous, inviting light-first foundation with earthy, golden-amber and sage accents that evoke natural ingredients and premium craftsmanship. The visual language is refined, minimal, and purposeful—every element directs focus toward product clarity and a trustworthy purchasing experience. Generous whitespace, crisp typography, and subtle elevation create an atmosphere of freshness, authenticity, and high-end quality.

**Key Characteristics**

- **Warm light foundation** with soft ivory and cream surfaces for an approachable, clean aesthetic
- **Warm amber and terracotta accents** signaling appetite, culinary richness, and primary actions
- **Fresh sage green highlights** for success states, growth, and positive confirmation
- **Premium typography** using variable fonts for clear visual hierarchy and readability
- **Subtle depth and soft layering** via delicate borders and diffused shadows to guide focus naturally
- **Responsive and adaptive** spacing system scaling smoothly across all viewports
- **High-contrast dark charcoal text** ensuring strict accessibility and maximum legibility on light surfaces
- **Merchant and customer-centric philosophy** — every component supports effortless browsing and clean transaction flows

## 2. Color Palette & Roles

### Primary

- **Primary Surface / Warm Ivory** (`#FAF9F6`): Core background for layouts, full-screen sections, and pages; establishes the warm, clean foundation
- **Soft Cream Surface** (`#F3F1ED`): Subtle variant for secondary card backgrounds, sidebars, and nested containers
- **Pure White Surface** (`#FFFFFF`): Primary card backgrounds, input containers, and floating elements for sharp contrast against ivory backgrounds

### Accent Colors

- **Warm Amber / Terracotta** (`#D97706`): Primary accent for main CTAs, key interactive highlights, and golden-fried visual brand cues
- **Artisanal Sage Green** (`#059669`): Success state accent, active badges, and positive indicators signaling freshness and reliability
- **Deep Earthy Gold** (`#B45309`): Muted secondary accent for hover states, secondary highlights, and special badges

### Interactive

- **Primary Action Button** (`#1C1917`): High-contrast dark charcoal CTA buttons on light backgrounds; highest visual weight and click-ability
- **Secondary Action Button** (`#D97706`): Amber CTA alternative for prominent secondary actions
- **Neutral Border Stroke** (`#E5E2DC`): Clean, delicate light-gray borders for structural definition on cards and inputs
- **Disabled State Overlay** (`#D4D4D8`): Muted neutral surface for disabled or inactive form states and buttons

### Neutral Scale

- **Deep Espresso / Charcoal** (`#1C1917`): Primary text, headings, icons, and high-contrast content on light backgrounds
- **Muted Stone Gray** (`#78716C`): Secondary text, labels, helper copy, and iconography
- **Light Silver** (`#A1A1AA`): Tertiary text, disabled helper notes, and placeholder text states
- **Subtle Divider** (`#E7E5E4`): Divider lines, table separators, and subtle borders

### Surface & Borders

- **Card Border** (`#E5E2DC`): Clean, subtle structural border defining product cards and light containers
- **Input Border** (`#D6D3D1`): Form input boundary lines offering clear interaction cues
- **Glass / Overlay Tint** (`rgba(255, 255, 255, 0.85)`): Translucent surface tint used for sticky headers and floating navigation panels

## 3. Typography Rules

### Font Family

**Primary:** Inter-Variable (variable font stack)
- Fallback: `system-ui, -apple-system, sans-serif`
- Usage: Body text, buttons, labels, inputs, navigation; flexible weight axis

**Secondary:** NeueHaasGrotesk / Clean Grotesk
- Fallback: `ui-sans-serif, sans-serif`
- Usage: Headings, display text, large-scale typography; bold, modern personality

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|---|---|
| Display LG | NeueHaasGrotesk | 68px | 400 | 76px | normal | Large section headline; marketing-focused |
| Display MD | NeueHaasGrotesk | 48px | 400 | 56px | normal | Mid-size display; subsection header |
| Heading 1 | Inter-Variable | 40px | 600 | 48px | normal | Page title in component context |
| Heading 2 Large | Inter-Variable | 32px | 600 | 40px | normal | Large section title |
| Heading 2 Standard | Inter-Variable | 24px | 500 | 32px | normal | Section divider and card title |
| Heading 3 | Inter-Variable | 20px | 500 | 28px | normal | Subsection heading |
| Heading 4 | Inter-Variable | 16px | 600 | 24px | normal | Card heading and table header |
| Body Large | Inter-Variable | 18px | 420 | 28px | normal | Large introductory copy |
| Body Standard | Inter-Variable | 16px | 420 | 24px | normal | Default body text; primary content |
| Body Secondary | Inter-Variable | 14px | 400 | 20px | normal | List items and secondary body |
| Caption / Small | Inter-Variable | 13px | 420 | 18px | normal | Helper text, captions, labels |
| Caption XS | Inter-Variable | 11px | 450 | 16px | normal | Footnotes, meta information |
| Link | Inter-Variable | 16px | 550 | 24px | normal | Inline links; elevated weight for affordance |
| Button | Inter-Variable | 16px | 550 | 24px | normal | Primary button text; high-weight emphasis |
| Code / Monospace | Inter-Variable | 14px | 400 | 20px | normal | Technical text and order IDs |

### Principles

- **Weight variation for hierarchy:** Use font-weight `400–600` to establish clear visual priority
- **Line height generosity:** Maintain minimum 1.4x multiplier for optimal legibility
- **Semantic weight:** Links and buttons use `weight: 550–600` to signal interactivity
- **Dark text readability:** Dark charcoal text on warm light backgrounds maintains high WCAG AAA contrast
- **Letter spacing:** Keep letter-spacing at `normal` (0) for clean text rendering across all scales

## 4. Component Stylings

### Buttons

#### Primary Button (Dark Charcoal on Light)
- **Background:** `#1C1917`
- **Text Color:** `#FFFFFF`
- **Font:** Inter-Variable, `16px`, weight `550`, line-height `24px`
- **Padding:** `10px 24px`
- **Border Radius:** `8px`
- **Border:** `1px solid transparent`
- **Height:** `44px`
- **Hover State:** `background: #292524`
- **Active State:** `background: #44403C`
- **Focus State:** `outline: 2px solid #D97706`, `outline-offset: 2px`

#### Secondary Button (Warm Amber)
- **Background:** `#D97706`
- **Text Color:** `#FFFFFF`
- **Font:** Inter-Variable, `16px`, weight `550`, line-height `24px`
- **Padding:** `10px 24px`
- **Border Radius:** `8px`
- **Border:** none
- **Height:** `44px`
- **Hover State:** `background: #B45309`
- **Active State:** `background: #92400E`

#### Outline Button (Bordered)
- **Background:** `#FFFFFF`
- **Text Color:** `#1C1917`
- **Font:** Inter-Variable, `16px`, weight `500`, line-height `24px`
- **Padding:** `10px 24px`
- **Border Radius:** `8px`
- **Border:** `1px solid #E5E2DC`
- **Height:** `44px`
- **Hover State:** `background: #F3F1ED`, border color `#D6D3D1`

#### Ghost Button (Minimal)
- **Background:** `transparent`
- **Text Color:** `#78716C`
- **Font:** Inter-Variable, `16px`, weight `450`, line-height `24px`
- **Padding:** `4px 8px`
- **Border Radius:** `6px`
- **Border:** none
- **Hover State:** `color: #1C1917`, `background: #F3F1ED`

### Cards & Containers

#### Standard Product / Content Card (Light)
- **Background:** `#FFFFFF`
- **Text Color:** `#1C1917`
- **Padding:** `20px–24px`
- **Border Radius:** `12px`
- **Border:** `1px solid #E5E2DC`
- **Box Shadow:** `0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.03)`
- **Hover State:** `border-color: #D97706`, slight shadow elevation

#### Secondary Container (Soft Cream)
- **Background:** `#F3F1ED`
- **Text Color:** `#1C1917`
- **Padding:** `24px`
- **Border Radius:** `12px`
- **Border:** `1px solid #E7E5E4`
- **Box Shadow:** none

### Inputs & Forms

#### Text Input (Light)
- **Background:** `#FFFFFF`
- **Text Color:** `#1C1917`
- **Font:** Inter-Variable, `16px`, weight `400`, line-height `24px`
- **Padding:** `12px 16px`
- **Border Radius:** `8px`
- **Border:** `1px solid #D6D3D1`
- **Height:** `44px`
- **Placeholder Color:** `#A1A1AA`
- **Focus State:** `border-color: #D97706`, `ring: 2px rgba(217, 119, 6, 0.15)`
- **Hover State:** `border-color: #78716C`

### Navigation

#### Header Navigation (Light Artisanal)
- **Background:** `rgba(250, 249, 246, 0.9)` with backdrop blur
- **Text Color:** `#1C1917`
- **Font:** Inter-Variable, `16px`, weight `450`, line-height `24px`
- **Height:** `72px` container
- **Border Bottom:** `1px solid #E5E2DC`
- **Link Hover:** `color: #D97706`
- **Active Link:** `color: #D97706`, font-weight `600`

### Badges

#### Amber Badge (Highlight/Primary)
- **Background:** `#FEF3C7` (Soft Amber Tint)
- **Text Color:** `#92400E`
- **Font:** Inter-Variable, `12px`, weight `550`, line-height `16px`
- **Padding:** `4px 10px`
- **Border Radius:** `6px`

#### Sage Badge (Success)
- **Background:** `#D1FAE5` (Soft Sage Tint)
- **Text Color:** `#065F46`
- **Font:** Inter-Variable, `12px`, weight `550`, line-height `16px`
- **Padding:** `4px 10px`
- **Border Radius:** `6px`

## 5. Layout Principles

### Spacing System

**Base Unit:** `4px`

**Primary Scale:**
- `4px` (1x): Micro spacing; tight gaps, badge padding
- `8px` (2x): Compact spacing; input padding gaps, button elements
- `12px` (3x): Standard inner component spacing
- `16px` (4x): Standard layout padding; card gaps, default spacing
- `24px` (6x): Comfortable interior card padding
- `32px` (8x): Section separation and grid gaps
- `64px` (16x): Major section dividers and vertical spacing

### Grid & Container

- **Content Container:** `1260px` max width; primary grid layout
- **Columns:** 12-column responsive grid
- **Gutter:** `24px` gap between columns

## 6. Depth & Elevation

- **Base (0):** Flat surfaces, background layout
- **Hover (1):** `0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)` (card hover)
- **Modal (3):** `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)` (dialogs & dropdowns)

## 7. Do's and Don'ts

### Do
- **Use warm ivory (`#FAF9F6`) and soft cream (`#F3F1ED`)** for background surfaces to maintain a clean, appetizing feel.
- **Apply warm amber (`#D97706`) and deep charcoal (`#1C1917`)** for primary interactions and clear calls to action.
- **Maintain WCAG AAA contrast** using dark espresso text (`#1C1917`) on light backgrounds.
- **Use soft, multi-layered subtle shadows** to give cards physical depth without heavy borders.
- **Ensure minimum `44px` height** on all interactive targets and buttons.

### Don't
- **Don't use cold dark themes or pure black backgrounds** (`#000000`), as they conflict with the artisanal food branding.
- **Don't use harsh black borders**; rely on soft stone gray (`#E5E2DC`) for card outlines.
- **Don't cramp text elements**; maintain generous padding and whitespace.

## 8. Responsive Behavior

- **Mobile (<768px):** Single-column stack, full-width cards, touch-optimized `44px+` buttons, hamburger navigation drawer.
- **Tablet (768px - 1024px):** 2-column grid layout, balanced spacing.
- **Desktop (>1024px):** Full 3 to 4-column product grids, max container `1260px`, horizontal navigation.

---