# Relay Visual Guidelines

Use this guide when making Relay-adjacent slides, docs, one-pagers, pitch material, screenshots, diagrams, and generated visuals. The goal is to preserve the app's sparse, technical, brutalist feel outside the product UI.

Relay should feel like a production tool from a CG/AI/print studio: concrete surface, monospace labels, hairline rules, hard edges, lots of negative space, and colour used only as signal.

## Core Feel

- Brutalist, technical, quiet, deliberate.
- Dense enough to feel operational, but never cramped.
- Structure comes from alignment, type weight, hairline rules, and empty space.
- Avoid decorative gradients, rounded cards, drop shadows, glassmorphism, soft blobs, and generic SaaS illustration.
- Treat every mark as functional. If a line, accent, label, box, or icon does not carry information, remove it.

## Colour

### Primary Concrete Dim Theme

Use this as the default for slides and most presentation material.

| Role | Value | Use |
|---|---:|---|
| Surface | `#222120` | Full slide/page background |
| Primary ink | `#E8E6E2` | Titles, key labels, important numbers |
| Secondary ink | `#909090` | Body text, metadata, supporting labels |
| Ghost ink | `#525050` | Eyebrows, timestamps, inactive labels |
| Hairline | `rgba(232,230,226,.09)` | Internal dividers |
| Structural line | `rgba(232,230,226,.19)` | Outer rules, table borders |

### Light Variant

Use for printed pages or when a light background is required.

| Role | Value |
|---|---:|
| Surface | `#DEDAD5` |
| Primary ink | `#0E0D0C` |
| Secondary ink | `#444240` |
| Ghost ink | `#706E6C` |
| Hairline | `rgba(14,13,12,.13)` |
| Structural line | `rgba(14,13,12,.26)` |

### Accent System

Colour is signal, not decoration. Use accents as bars, dots, underlines, small badges, or single rules. Do not use accent colours as large fills except for a single current-state badge.

| Meaning | Dim/Dark | Light | Use |
|---|---:|---:|---|
| Active / selected / in progress | `#F5C400` | `#F5C400` | Primary signal, current slide marker, selected state |
| Danger / blocked / failed | `#E84020` | `#E03010` | Blockers, critical warnings |
| Success / done / approved | `#18C870` | `#10B060` | Approved, resolved, complete |
| Pending / review / queued | `#7A9ABB` | `#5A7A9A` | Review, waiting, informational |
| Special / machine / AI | `#6080CC` | `#4462A8` | AI-generated, machine-authored, external system |

Rules:

- Most slides should use one accent mark total: a 2px bar, one underline, one dot, or one small badge.
- One dominant accent per slide.
- Two accents only when comparing states.
- Three or more accents only in tables, legends, roadmaps, or status maps, and even there keep each accent small.
- Never make the whole slide yellow, green, blue, or red.
- Never use accent colours for title text, large background panels, decorative icons, gradients, or section blocks.
- On light backgrounds, avoid tiny yellow or blue text. Use accents as marks beside dark text.

## Typography

The app uses JetBrains Mono as its first-choice typeface, with Courier New as the practical fallback. In generated slides, the wrong font is the most common reason the output stops feeling like Relay, so specify the fallback explicitly.

```css
JetBrains Mono, Courier New, monospace
```

Font priority:

1. Use `JetBrains Mono` if the slide tool can load or embed it.
2. If JetBrains Mono is not available, use `Courier New`.
3. Do not substitute a proportional font like Inter, Helvetica, Arial, Aptos, Calibri, or Roboto.
4. Do not use a heavy "mono display" face. The app is technical and restrained, not chunky retro-computing.

Weight guidance:

- Default to `400` for most text.
- Use `700` for headings, active nav-like labels, and important row names.
- Use `800` only for tiny uppercase labels, the wordmark, selected status labels, or a single large metric.
- Avoid `900`, `Black`, `Heavy`, `ExtraBold`, and faux-bold rendering.
- If the generator makes headings look bulky, request `JetBrains Mono 700`, not `800`.

| Role | Slide Size | Case | Weight | Notes |
|---|---:|---|---:|---|
| Main title | 36-48px | lowercase preferred | 700 | Short, blunt, not marketing-slick |
| Section title | 22-30px | lowercase preferred | 700 | Use sparingly |
| Eyebrow | 9-12px | uppercase | 700 | Letter spacing `.14em-.18em` |
| Body | 14-18px | sentence case or lowercase | 400 | Keep line length short |
| Metadata | 10-12px | uppercase or technical text | 400/700 | Dates, versions, owners, labels |
| Big number | 52-88px | numeric | 700/800 | Use 800 only if the slide has little else |

Type rules:

- Use JetBrains Mono for titles too. If unavailable, use Courier New for the entire deck.
- Courier New is acceptable when JetBrains Mono cannot be installed, but keep it all-in: do not mix Courier New body with sans-serif titles.
- Keep letter spacing at `0` for titles and body text.
- Use uppercase only for labels, eyebrows, table headers, and status text.
- Prefer lowercase headings when they mirror the app: `task board`, `allocation map`, `review queue`.
- No italics. No script fonts. No decorative display fonts.
- Let type breathe. A single 40px title with a 10px eyebrow can carry a slide.
- If text feels too loud, reduce weight before reducing size.
- Use tighter app-like type hierarchy: small labels, modest titles, lots of surrounding space.

## Spacing

Relay uses a 4px grid. Slides should scale that up without becoming loose or decorative.

| Token | App Value | Slide Equivalent |
|---|---:|---:|
| Tight | 4px | 8px |
| Small | 8px | 12-16px |
| Standard | 12px | 20-24px |
| Section | 16px | 32px |
| Page | 24px | 56-80px |

Slide layout rules:

- Use generous outer margins: 64-96px on 16:9 slides.
- Keep one clear focal area per slide.
- Prefer one large open area over many small boxes.
- If a slide feels cramped, remove content before reducing type size.
- Use 2-3 vertical zones maximum: header, content, footer/meta.
- Do not fill every quadrant.

## Lines And Geometry

Relay is hard-edged and rule-based.

- Border radius: `0`.
- Hairline rules: `0.5px` or `1px`.
- Accent bars: `2px`.
- Tables and diagrams should use thin rules, not shaded cards.
- Avoid shadows. If separation is needed, use a structural line.
- Avoid rounded pills. Use square badges or underline states.
- Use rectangular blocks only when they frame data, not as decorative cards.

Common slide elements:

- Section divider: full-width `1px` rule in structural line colour.
- Active marker: `2px` yellow vertical bar at the left edge of a title block.
- Status row: thin border box with a `2px` left status bar.
- Data table: no zebra striping; use hairlines and ghost headers.

## Composition

### Preferred Layouts

1. Sparse Title Slide

Use a small uppercase eyebrow, a short lowercase title, and one thin rule. Keep 45-60% of the slide empty.

2. Operational Table

Use a table-like structure with hairlines, small uppercase headers, and one accent bar per important row. Avoid large filled cells.

3. Two-Column Technical Brief

Use a narrow metadata column and a wider content column. Separate with a single vertical rule.

4. Big Metric Slide

Use one oversized number, a small uppercase label, and two or three supporting metadata lines. No icon collage.

5. Roadmap / Timeline

Use horizontal rules, small square milestones, and accent bars. Avoid rounded timeline bubbles.

### Negative Space

Negative space is part of the Relay look. It should feel intentional, not unfinished.

- Leave large empty regions beside titles and tables.
- Keep paragraphs short: 2-4 lines.
- Put dense detail in tables, not prose blocks.
- Break long explanations into multiple slides.
- Do not add decorative imagery just to fill space.

## Slide Templates

### Title / Divider

- Background: `#222120`
- Eyebrow: `10px`, uppercase, ghost ink, `.16em`
- Title: `40-48px`, 700, primary ink, lowercase
- Rule: `1px`, structural line, placed below title
- Optional accent: `2px` yellow vertical bar beside title

### Status Summary

- Header row in ghost ink, uppercase, `10px`
- Data rows in primary/secondary ink, `13-15px`
- Row separators: hairline
- Status indicated by `2px` left bar only
- Use no background fills unless marking a current version or selected item

### Quote / Principle

- One statement, max 12 words.
- Set in `30-40px`, 700, primary ink.
- Place source or context as small uppercase metadata below.
- Use a single structural rule, not quotation marks or decorative framing.

### Diagram

- Draw with straight lines, right angles, square nodes.
- Use monochrome lines first.
- Add colour only to show state or ownership.
- Use small uppercase labels for nodes.
- Leave broad space between clusters.

## Imagery

Relay visuals should feel like production artifacts, not generic slide art.

Use:

- Cropped UI screenshots with no rounded frame.
- Asset previews, render frames, node graphs, calendars, tables, folder paths.
- Technical diagrams drawn with lines and monospace labels.
- Concrete-like neutral backgrounds only when subtle and low contrast.

Avoid:

- Stock photos of teams, laptops, hands, offices, or abstract dashboards.
- Gradients as backgrounds.
- Soft 3D blobs, glass panels, mascot illustrations, stickers, emoji, confetti.
- Heavy image filters or dark blurred overlays.

## Icons

- Use icons sparingly.
- Prefer thin-line icons that match Lucide proportions.
- Stroke: `1.5px` or `2px`.
- Keep icons square and monochrome unless the icon itself is a status mark.
- Do not use icons as decoration around titles.

## Writing Style

The visual tone depends on copy as much as layout.

Use:

- Short labels.
- Specific operational nouns.
- Concrete states: `blocked`, `queued`, `review`, `approved`, `wip`.
- File-like and production-like language where useful: `v001`, `SH_09`, `allocation`, `handoff`, `review frame`.

Avoid:

- Marketing headlines.
- Exclamation marks.
- Long explanatory subtitles.
- Generic phrases like "unlock productivity", "seamless collaboration", or "next generation platform".

## Prompt For Slide Generators

Use this when asking an AI slide tool to match Relay:

```text
Create a sparse brutalist technical presentation in the Relay visual style.
Use a single concrete dark surface (#222120), hard edges, no rounded corners, no shadows, no gradients, no decorative illustrations.
Use JetBrains Mono for every text element. If JetBrains Mono is unavailable, use Courier New for every text element. Do not use Inter, Arial, Helvetica, Aptos, Calibri, Roboto, or any proportional sans-serif.
Use restrained font weights: body 400, labels 700, headings 700. Do not use 900, Black, Heavy, or overly chunky display typography. Use 800 only for tiny uppercase status labels or one large metric.
Use generous negative space with 64-96px margins.
Structure slides with thin 0.5-1px hairline rules, table-like layouts, small uppercase metadata labels, and lowercase monospace headings.
Use colour only as tiny semantic signal: one 2px bar, one underline, one dot, or one small badge per slide unless the slide is a status table.
Accent meanings: yellow #F5C400 for active, red-orange #E84020 for blocked, emerald #18C870 for done, steel blue #7A9ABB for review, indigo #6080CC for machine/AI.
Do not use accents for large fills, title text, background blocks, decorative shapes, or repeated visual flourishes.
Do not make slides cramped. Prefer fewer words, larger empty areas, and one focal element per slide.
```

If a generated deck comes back too colourful, use this correction prompt:

```text
Revise the deck to reduce accent colour by at least 80%. Keep almost all text in #E8E6E2 or #909090. Use accent colours only as small 2px status bars, one selected underline, tiny dots, or compact badges. Remove coloured section backgrounds, coloured headings, decorative accent icons, and multi-colour flourishes.
```

If the generated typography feels too bulky, use this correction prompt:

```text
Revise the typography to match a restrained technical app. Use JetBrains Mono 400 for body, JetBrains Mono 700 for headings, and avoid ExtraBold/Black/Heavy weights. If JetBrains Mono is unavailable, use Courier New consistently across the whole deck. Reduce heading weight before reducing heading size.
```

## Quick Checklist

Before calling a slide or document "Relay":

- Is the background a single concrete surface?
- Is all type JetBrains Mono, or all Courier New if JetBrains Mono is unavailable?
- Are headings mostly 700 rather than extra-bold or black?
- Are corners square?
- Are lines thin?
- Is colour used only as a small status mark or restrained emphasis?
- Is there enough negative space?
- Are there fewer boxes than a generic SaaS deck would use?
- Does the slide still work if all decoration is removed?
- Does it feel like a production tool, not a pitch template?
