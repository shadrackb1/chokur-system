# Chokur System — Brand Assets

## Logo Files

| File | Purpose | ViewBox |
|------|---------|---------|
| `logo-symbol.svg` | App icon, favicon, compact usage | 0 0 64 64 |
| `logo-horizontal.svg` | Primary lockup: symbol + "Chokur" + "System" | 0 0 240 64 |
| `logo-stacked.svg` | Square layouts, social avatars | 0 0 128 128 |
| `logo-mono-black.svg` | Single-colour reproduction (print, fax, emboss) | 0 0 64 64 |
| `logo-reversed.svg` | Dark backgrounds (cream rules, accent preserved) | 0 0 64 64 |
| `logo-wordmark.svg` | Wordmark only, no symbol | 0 0 200 56 |

All SVGs:
- Valid XML, no unused defs/metadata
- Fills limited to `#111111`, `#F6F1E7`, `#C2410C`
- `<title>` for accessibility, `role="img"`
- Optimised with SVGO, viewBox preserved
- Under 4 KB each
- Text converted to outlined paths (no font dependency)

## Raster Exports (generated from SVGs)

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 16, 32, 48 | Browser tab |
| `favicon.svg` | 64×64 | Modern browsers |
| `apple-touch-icon.png` | 180×180 | iOS home screen |
| `icon-192.png` | 192×192 | PWA manifest |
| `icon-512.png` | 512×512 | PWA manifest |
| `icon-maskable-512.png` | 512×512 | Maskable icon (symbol in 80% safe zone) |
| `og-image.png` | 1200×630 | Open Graph / social share |
| `safari-pinned-tab.svg` | 64×64 | Safari pinned tab (single colour) |

## Clear Space Rule

The clear space equals the height of the symbol's smallest line gap (8px in the 64×64 viewBox = 4px gap between rules). Maintain this margin on all sides. No other graphic element, text, or crop may enter this zone.

In the 64×64 symbol: the gap between rules is 12px (viewBox units). At 16px rendered size, that gap is 3px. Minimum clear space = 3px at 16px, scaling proportionally.

## Minimum Size

| Lockup | Minimum Width | Minimum Symbol Size |
|--------|---------------|---------------------|
| Symbol only | 16px | 16px |
| Horizontal | 96px | 16px |
| Stacked | 64px | 32px |
| Wordmark | 80px | N/A |

Below these sizes, the horizontal rules merge visually.

## Colour Palette

| Role | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Primary text / Symbol rules | `#111111` | `--color-text-primary` | Body text, symbol top two rules |
| Accent / Pass line | `#C2410C` | `--color-brand` | Bottom rule (C+ line), interactive elements |
| Cream / Reversed | `#F6F1E7` | `--color-surface` | Background, reversed symbol rules |
| Secondary text | `#5C5850` | `--color-text-secondary` | Supporting copy |
| Tertiary text / "System" | `#9A958A` | `--color-text-tertiary` | "System" label, captions |
| Hairline / Borders | `#DDD6C7` | `--color-hairline` | Dividers, table borders |
| Panel surface | `#FBF8F1` | `--color-surface-panel` | Card backgrounds |

## Typography

- **Primary:** Inter (self-hosted, subsetted, `font-display: swap`)
- **Monospace / Tabular:** JetBrains Mono (tabular-nums enabled)
- **Weights used:** 400 (regular), 500 (medium), 600 (semibold)
- **Letter-spacing:** Tight for headlines (`-0.02em`), expanded for labels (`+0.08em`)

## Grade Chip Styling (Monochrome)

| Tier | Grades | Style |
|------|--------|-------|
| Honors | A, A-, B+ | Solid black fill, cream text |
| Competent | B, B-, C+ | Black outline, transparent fill |
| Marginal | C, C-, D+ | Warm grey outline, transparent fill |
| Critical | D, D-, E | Dashed warm grey outline, transparent fill |

## Usage in Code

```tsx
import { Logo } from '@/components/brand/Logo';

// App sidebar (symbol + wordmark; symbol only when collapsed)
<Logo variant="horizontal" size={32} />

// Mobile top bar (symbol only)
<Logo variant="symbol" size={24} />

// Print headers (monochrome)
<Logo variant="symbol" tone="mono" size={20} />

// Dark backgrounds
<Logo variant="symbol" tone="reversed" size={24} />
```

## Do Not

- Stretch, rotate, or skew the logo
- Change colours (except via the approved tone props)
- Add drop shadows, glows, gradients, or outlines
- Place on busy backgrounds without clear space
- Use the symbol without the wordmark on first reference
- Set "Chokur" or "System" in any other typeface