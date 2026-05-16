# Relay — Design System
*Production pipeline deliverable and asset management. CG · AI · Print.*

---

## 0. Design principles

Relay is a tool for people who spend long hours in DCC environments. The visual language borrows from the materials and instruments of production work — raw concrete, technical displays, signal indicators — not from consumer software conventions.

**Brutalist and functional.** Structure comes from typography weight, scale, and hairline rules — not from colour fills, gradients, or shadows. Every visual element earns its presence by carrying information.

**Colour is signal, not decoration.** Colour appears only on status indicators: left-edge bars, dots, filled badges. Text and surfaces are neutral. A coloured mark means something specific — always.

**Monospace throughout.** JetBrains Mono for all UI text. Technical data (version tags, file paths, USD references, frame ranges, timestamps) uses the mono weight explicitly. The font choice is a statement about what kind of tool this is.

**Single surface.** No panel hierarchy through tonal stepping. Sidebar, topbar, main column, and side pane share one surface colour. Structure comes from hairline borders alone.

---

## 1. Themes

Relay ships three themes. Each is a complete token set — surface, ink, line, and all status colours. Users can also apply community terminal themes (see §6).

| ID | Name | Purpose |
|---|---|---|
| `light` | Concrete Light | Default. Studio daylight. |
| `dark` | Concrete Dark | High-focus sessions. Matches DCC environments. |
| `dim` | Concrete Dim | Long sessions. Reduced contrast harshness. |

---

## 2. Surface tokens

### 2.1 Light — `concrete-light`

> **Base:** `#DEDAD5` — Raw concrete in diffused studio light. Not white, not cream. A surface with material presence. All accents land with weight against this base.

| Token | Value | Role |
|---|---|---|
| `--bg` | `#DEDAD5` | Single surface — all panels |
| `--ink` | `#0E0D0C` | Primary text |
| `--ink-2` | `#444240` | Secondary text, metadata |
| `--ink-3` | `#706E6C` | Ghost text, disabled, timestamps |
| `--line` | `rgba(14,13,12,.13)` | Hairline separators |
| `--line-s` | `rgba(14,13,12,.26)` | Structural edges |

### 2.2 Dark — `concrete-dark`

> **Base:** `#1A1918` — Warm near-black. Sits naturally beside Houdini and Blender default panels. Deep enough for focus; not so dark it creates harsh contrast. Ink values stepped down from pure white to reduce eye strain on long sessions.

| Token | Value | Role |
|---|---|---|
| `--bg` | `#1A1918` | Single surface — all panels |
| `--ink` | `#DEDCDA` | Primary text — stepped down from white |
| `--ink-2` | `#808080` | Secondary text, metadata |
| `--ink-3` | `#484644` | Ghost text, disabled, timestamps |
| `--line` | `rgba(222,220,218,.08)` | Hairline separators |
| `--line-s` | `rgba(222,220,218,.17)` | Structural edges |

### 2.3 Dim — `concrete-dim`

> **Base:** `#222120` — Four percent lifted from dark. For artists on 6+ hour sessions. Reduces the contrast gap without losing dark character. Ghost text and hairlines gain breathing room. Recommended as the default for studio machines running Relay all day.

| Token | Value | Role |
|---|---|---|
| `--bg` | `#222120` | Single surface — all panels |
| `--ink` | `#E8E6E2` | Primary text |
| `--ink-2` | `#909090` | Secondary text, metadata |
| `--ink-3` | `#525050` | Ghost text, disabled, timestamps |
| `--line` | `rgba(232,230,226,.09)` | Hairline separators |
| `--line-s` | `rgba(232,230,226,.19)` | Structural edges |

---

## 3. Accent colours — the five-temperature system

Relay uses exactly five accent colours. Each maps to one semantic temperature. A colour never appears outside its semantic role.

> **Rule:** Accent colours appear only as marks — 3px left-edge bars, 7px dots, filled badge backgrounds, or border strokes. They are never used as text colour on light themes. On dark and dim themes they may appear as text in status labels where contrast is sufficient.

### 3.1 Colour definitions

#### Yellow — Active

```
Light:  #F5C400   HSL 48° 100% 48%
Dark:   #F5C400   (unchanged — same both themes)
```

The primary signal colour. Caution-tape yellow. Used for anything currently in motion or selected. The warmest and highest-luminosity colour in the palette — it stands apart from all other accents immediately.

**ANSI mapping:** `yellow` (ANSI 3 / bright yellow ANSI 11)
**Gruvbox:** `#d79921` neutral yellow — same temperature, Relay's version is more saturated
**Dracula:** `#f1fa8c` yellow — Relay's is deeper, less limey
**Catppuccin Mocha:** `#f9e2af` yellow — Relay's is more saturated and darker

**Applies to:**
- Active nav item left border
- Deliverable row left border (wip status)
- Filter chip underline (active)
- Version badge background (current version)
- Progress bar fill (31–65% completion)
- Server dot (syncing)

#### Red-orange — Danger

```
Light:  #E03010   HSL 13° 78% 47%
Dark:   #E84020   HSL 13° 80% 52%
```

Blocked, failed, critical. Warmer than alarm red — it sits in the same material temperature as yellow without fighting it. Not tomato, not fire-engine. Closer to a warning light on a physical panel.

**ANSI mapping:** `red` (ANSI 1 / bright red ANSI 9)
**Gruvbox:** `#cc241d` red — Relay's is orange-shifted, less cool
**Dracula:** `#ff5555` red — Relay's is darker and more controlled
**Catppuccin Mocha:** `#f38ba8` red — Relay's is more saturated and less pink

**Applies to:**
- Deliverable row left border (blocked status)
- Status label text (dark/dim themes)
- Server dot (offline/error)
- Progress bar fill (0–30% completion)
- Approval badge (rejected)

#### Emerald — Success

```
Light:  #10B060   HSL 150° 83% 37%
Dark:   #18C870   HSL 150° 79% 44%
```

Done, approved, healthy, resolved. HSL 150° sits exactly between warm and cold on the spectrum — it belongs to neither the yellow side nor the blue side. Not lime, not forest green. The colour of a status indicator light on a piece of equipment.

**ANSI mapping:** `green` (ANSI 2 / bright green ANSI 10)
**Gruvbox:** `#98971a` green — Relay's is more saturated and blue-shifted
**Dracula:** `#50fa7b` green — Relay's is darker and less neon
**Catppuccin Mocha:** `#a6e3a1` green — Relay's is significantly more saturated

**Applies to:**
- Deliverable row left border (done status)
- Completed checkbox fill
- Server dot (online)
- Progress bar fill (66–100% completion)
- Approval badge (approved)
- Lookdev verdict (approved)

#### Steel Blue — Pending

```
Light:  #5A7A9A   HSL 210° 26% 47%
Dark:   #7A9ABB   HSL 210° 28% 60%
```

Review, queued, pending, informational. The most muted accent in the palette. HSL 210° with only 26% saturation — it recedes. Things waiting without urgency. Passive holding states. The low saturation means it never competes with yellow or indigo when they appear in the same list.

**ANSI mapping:** `blue` (ANSI 4 / bright blue ANSI 12)
**Gruvbox:** `#458588` blue — similar temperature, Relay's is slightly more grey
**Dracula:** `#6272a4` comment colour — same muted register
**Catppuccin Mocha:** `#89b4fa` blue — Relay's is significantly more muted

**Applies to:**
- Deliverable row left border (review, queued, todo status)
- Status label text
- Server dot (connecting)
- Annotation/comment thread line
- Approval badge (pending)

#### Indigo — Machine / Special

```
Light:  #4462A8   HSL 225° 44% 46%
Dark:   #6080CC   HSL 225° 46% 59%
```

AI-generated content, machine-authored assets, lookdev units, external/escalated states. Shares steel blue's restrained character — same saturation family — but shifted 15° toward indigo. This is intentional. AI-authored content should not shout. It should be marked, quietly, as something different.

The hue shift is enough to read as categorically distinct from steel at 3px bar width and 7px dot. The luminosity difference reinforces this — indigo is slightly darker than steel.

**ANSI mapping:** `magenta` / `bright blue` (ANSI 5 or ANSI 12 depending on theme)
> Note: Terminal themes do not have a clean indigo slot. The closest mapping is bright blue (ANSI 12) in themes that distinguish it from regular blue, or magenta (ANSI 5) in themes where magenta is blue-shifted. When mapping Relay to community themes, prefer the colour closest to HSL 225–240° regardless of its ANSI slot name.

**Gruvbox:** No direct equivalent — closest is `#458588` aqua but shifted cold
**Dracula:** `#8be9fd` cyan — Relay's indigo is darker and warmer
**Catppuccin Mocha:** `#cba6f7` mauve shifted blue — closest in spirit

**Applies to:**
- Deliverable row left border (ai-gen, lookdev)
- Asset card left border (ai-generated, in-lookdev)
- ai_gen_unit rows
- lookdev_unit rows
- Version badge border (AI-authored versions)
- Comment ver badge (AI-generated checkpoints)
- Server dot (AI job running)

---

## 4. The 16-colour ANSI mapping

For terminal output, CLI tooling, and community theme compatibility, Relay's five accents map to the 16-colour ANSI palette as follows. The remaining ANSI slots are used for surface and ink values.

| ANSI slot | Name | Relay role | Light value | Dark value |
|---|---|---|---|---|
| 0 | Black | `--bg` surface | `#DEDAD5` | `#1A1918` |
| 1 | Red | Danger / blocked | `#E03010` | `#E84020` |
| 2 | Green | Success / done | `#10B060` | `#18C870` |
| 3 | Yellow | Active / wip | `#F5C400` | `#F5C400` |
| 4 | Blue | Pending / review | `#5A7A9A` | `#7A9ABB` |
| 5 | Magenta | — (reserved) | `#5A7A9A` | `#7A9ABB` |
| 6 | Cyan | Machine / indigo | `#4462A8` | `#6080CC` |
| 7 | White | `--ink` primary | `#0E0D0C` | `#DEDCDA` |
| 8 | Bright black | `--ink-3` ghost | `#706E6C` | `#484644` |
| 9 | Bright red | Danger (bright) | `#E84020` | `#F05030` |
| 10 | Bright green | Success (bright) | `#18C870` | `#20E080` |
| 11 | Bright yellow | Active (bright) | `#F5C400` | `#FFD020` |
| 12 | Bright blue | Machine (bright) | `#6080CC` | `#7A9AE8` |
| 13 | Bright magenta | — (reserved) | `#6080CC` | `#7A9AE8` |
| 14 | Bright cyan | Pending (bright) | `#7A9ABB` | `#9AB8D4` |
| 15 | Bright white | `--ink` emphasis | `#0A0908` | `#F0EEEA` |

> **Note on magenta:** Relay does not use a magenta/purple accent. ANSI slots 5 and 13 are mapped to steel blue values to prevent unexpected colour appearance in terminal output. Community themes that map magenta to a red-pink will show steel blue in those slots instead.

---

## 5. Typography

### 5.1 Typeface

**JetBrains Mono** — single typeface for all UI text, data, and labels.

No secondary sans-serif. Relay is a technical tool. The monospace choice is deliberate — it signals the nature of the application and creates visual consistency between the UI, the CLI, and terminal output from DCC scripts.

```
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700;800&display=swap');

--font-ui:      'JetBrains Mono', 'Courier New', monospace;
--font-mono:    'JetBrains Mono', 'Courier New', monospace;
--font-display: 'JetBrains Mono', 'Courier New', monospace;
```

For Nerd Font icon support (sidebar icons, status indicators in CLI output):
```
Font: JetBrainsMono Nerd Font
Fallback: JetBrains Mono (icons omitted gracefully)
```

### 5.2 Type scale

| Role | Size | Weight | Case | Letter-spacing | Usage |
|---|---|---|---|---|---|
| Wordmark | 13px | 800 | uppercase | .18em | App name in topbar |
| Section label | 9px | 700 | uppercase | .16em | Sidebar group headers, section dividers |
| Filter / chip | 9px | 700 | uppercase | .10em | Filter bar chips, tab labels |
| Status label | 9px | 800 | uppercase | .10em | Deliverable status text |
| Nav item | 11px | 400 | lowercase | .02em | Sidebar navigation |
| Nav item active | 11px | 700 | lowercase | .02em | Active nav item |
| Deliverable name | 12px | 400 | lowercase | .01em | Deliverable row primary text |
| Pane title | 14px | 700 | lowercase | .01em | Side pane deliverable title |
| Metadata | 10px | 400 | — | .03em | Assignees, due dates, phases |
| Ghost / label | 9–10px | 400 | — | .03em | Timestamps, secondary metadata |
| Version tag | 17px | 800 | lowercase | .06em | Version navigator large tag |
| Comment author | 10px | 800 | uppercase | .08em | Comment thread username |
| Body text | 11px | 400 | — | — | Comment body, notes |
| Token / path | 11px | 400 | — | — | USD paths, file references (monospace inherent) |

### 5.3 Type rules

- **Wordmark and section labels are uppercase.** Content is lowercase. This contrast is where the brutalist register lives.
- **Deliverable names are lowercase.** Always. Even proper nouns. The uniform case is part of the aesthetic.
- **No italic.** Never used in Relay UI.
- **Strikethrough for done state.** Deliverable names in done status use `text-decoration: line-through` and `--ink-3` colour. No other decoration used anywhere.

---

## 6. Geometry and borders

### 6.1 Border radius

```css
--radius:     0px;    /* global default — no rounding */
--radius-tag: 0px;    /* status tags — also none */
```

No border radius anywhere. Hard corners throughout. This is a non-negotiable part of the brutalist character.

### 6.2 Border weights

```css
--border-width:   0.5px;   /* all separators and structural edges */
--border-accent:  2px;     /* left-edge status bar on rows and nav items */
--border-filter:  2px;     /* filter chip underline (inset box-shadow) */
```

The 2px left bar is the only thick border in the system. It is exclusively used as a status mark. Nothing else uses 2px.

### 6.3 Spacing grid

Base unit: **4px**. All padding, margin, and gap values are multiples of 4.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Tight gaps, icon padding |
| `--space-2` | 8px | Default gap, small padding |
| `--space-3` | 12px | Standard padding |
| `--space-4` | 16px | Section padding |
| `--space-5` | 20px | Large section gaps |
| `--space-6` | 24px | Page-level padding |

---

## 7. Status indicator patterns

Status is communicated through a consistent set of patterns. The same colour always means the same thing regardless of which pattern carries it.

### 7.1 Left-edge bar (primary pattern)

A 2px solid left border on any row-level element. The most common status indicator.

```css
border-left: 2px solid var(--color-active);   /* wip */
border-left: 2px solid var(--color-danger);   /* blocked */
border-left: 2px solid var(--color-success);  /* done */
border-left: 2px solid var(--color-pending);  /* review */
border-left: 2px solid var(--color-special);  /* ai-gen / lookdev */
border-left: 2px solid var(--ink-3);          /* todo / inactive */
```

### 7.2 Status text label

9px uppercase monospace. Colour follows the temperature system on dark/dim themes. On light theme all status text uses `--ink` — not the accent colour — because yellow and steel blue fail contrast at small text sizes on light surfaces.

```
light theme:  all status labels → --ink
dark theme:   status labels → accent colour (passes contrast at 9px bold)
dim theme:    status labels → accent colour
```

### 7.3 Dot indicator

7px circle. Used for server status, connection state, AI job status in DCC panels.

```css
.dot { width: 7px; height: 7px; border-radius: 50%; background: var(--color-*); }
```

### 7.4 Filled badge

Solid background. Used for the current version tag only. Background is `--color-active` (yellow), text is `#111` (always — not a theme token).

```css
.badge-current {
  background: var(--color-active);
  color: #111;
  font-size: 9px; font-weight: 800; letter-spacing: .10em;
  padding: 2px 6px;
}
```

### 7.5 Bordered badge

Border only, no fill. Used for AI-generated version references and non-current version history tags.

```css
.badge-ai {
  border: 0.5px solid var(--color-special);
  color: var(--color-special);
}
.badge-old {
  border: 0.5px solid var(--line-s);
  color: var(--ink-3);
}
```

### 7.6 Progress bar

1px height. Colour maps to completion percentage.

| Completion | Colour | Meaning |
|---|---|---|
| 0% | `--line-s` (invisible) | Not started |
| 1–30% | `--color-danger` | Behind / barely started |
| 31–65% | `--color-active` | In progress |
| 66–99% | `--color-success` | Nearly done |
| 100% | Row transitions to done state | Complete |

---

## 8. Status vocabulary — full mapping

| State | Bar colour | Dot colour | ANSI | Applies to |
|---|---|---|---|---|
| wip | yellow | yellow | 3/11 | deliverable, asset component, render job |
| review | steel blue | steel blue | 4/12 | deliverable, lookdev verdict, asset |
| blocked | red-orange | red-orange | 1/9 | deliverable |
| todo | ghost `--ink-3` | ghost | 8 | deliverable, asset |
| done | emerald | emerald | 2/10 | deliverable, asset, render |
| approved | emerald | emerald | 2/10 | lookdev, review, asset |
| rejected | red-orange | red-orange | 1/9 | lookdev, review |
| revision | yellow | yellow | 3/11 | lookdev, review |
| pending | steel blue | steel blue | 4/12 | approval, queue |
| ai-gen | indigo | indigo | 6/12 | ai_gen_unit, machine-authored asset |
| lookdev | indigo | indigo | 6/12 | lookdev_unit |
| external | indigo | indigo | 6/12 | awaiting client / director |
| queued | steel blue | steel blue | 4/14 | render queue, allocation entry |
| rendering | yellow | yellow | 3/11 | render job active |
| failed | red-orange | red-orange | 1/9 | render job, AI gen |
| online | emerald | emerald | 2/10 | DCC server status |
| offline | red-orange | red-orange | 1/9 | DCC server status |
| syncing | yellow | yellow | 3/11 | DCC sync state |
| connecting | steel blue | steel blue | 4/14 | DCC connection state |

---

## 9. Community theme compatibility

Relay's CSS token layer can be overridden by community theme files. Each theme file provides a complete set of surface and ink tokens plus the five accent colour mappings.

The constraint: **Relay does not accept raw hex values from community themes without calibration.** Each theme pairing (background + accent) must be pre-validated for contrast on Relay's surfaces. A community theme file ships as a validated unit — not as a freeform colour picker.

### 9.1 Theme file structure

```json
{
  "id": "gruvbox-dark",
  "name": "Gruvbox Dark",
  "mode": "dark",
  "surface": {
    "bg":     "#1d2021",
    "ink":    "#ebdbb2",
    "ink-2":  "#a89984",
    "ink-3":  "#7c6f64",
    "line":   "rgba(235,219,178,.10)",
    "line-s": "rgba(235,219,178,.20)"
  },
  "accent": {
    "active":  "#d79921",
    "danger":  "#cc241d",
    "success": "#98971a",
    "pending": "#458588",
    "special": "#458588"
  },
  "notes": "Gruvbox has no native indigo. Special maps to aqua #458588 — the closest cool accent available."
}
```

### 9.2 Validated community themes (planned)

| Theme | Mode | Active | Danger | Success | Pending | Special |
|---|---|---|---|---|---|---|
| Gruvbox Dark | dark | `#d79921` | `#cc241d` | `#98971a` | `#458588` | `#458588` |
| Gruvbox Light | light | `#b57614` | `#9d0006` | `#79740e` | `#076678` | `#076678` |
| Dracula | dark | `#f1fa8c` | `#ff5555` | `#50fa7b` | `#6272a4` | `#8be9fd` |
| Catppuccin Mocha | dark | `#f9e2af` | `#f38ba8` | `#a6e3a1` | `#89b4fa` | `#cba6f7` |
| Catppuccin Latte | light | `#df8e1d` | `#d20f39` | `#40a02b` | `#1e66f5` | `#7287fd` |
| Nord | dark | `#ebcb8b` | `#bf616a` | `#a3be8c` | `#81a1c1` | `#5e81ac` |
| Tokyo Night | dark | `#e0af68` | `#f7768e` | `#9ece6a` | `#7aa2f7` | `#bb9af7` |

---

## 10. Component rules

### 10.1 Topbar

- Single surface colour — no elevation or tonal difference
- Wordmark: 13px 800 uppercase, `--ink`
- Project name: 11px 400, `--ink`
- Separator: `--line` 0.5px vertical
- Action buttons: 10px 700 uppercase, `--ink-2`, no background
- Primary action ("+ New deliverable"): `--ink`, 800 weight
- No icons in topbar

### 10.2 Sidebar

- Same surface as main — no tonal differentiation
- Group labels: 9px 700 uppercase `--ink-3`, padding 14px 14px 5px
- Nav items: 11px 400 lowercase, `--ink-2`
- Active nav: 11px 700, `--ink`, 2px left border `--color-active` (yellow)
- Nav separator: 0.5px `--line-s` horizontal rule
- Item count badge: 10px `--ink-3`, right-aligned

### 10.3 Deliverable rows

- Height: natural — padding 10px 14px
- Left border: 2px status colour (transparent for todo)
- Checkbox: 13px × 13px, 0.5px border `--ink-3`. Done: filled `--ink`, checkmark `--bg`
- Deliverable name: 12px 400 lowercase `--ink`. Done state: `--ink-3` + strikethrough
- Phase: 9px `--ink-3`
- Status label: 9px 800 uppercase, `--ink` on light, accent colour on dark/dim
- Separator: 0.5px `--line` horizontal

### 10.4 Side pane

- Same surface — no elevation
- Title: 14px 700 lowercase, max 2 lines, `-webkit-line-clamp: 2`
- Action buttons in pane header: 9px 700 uppercase, `--ink-3`
- "Complete" action: `--ink`, 800 weight
- Section labels: 9px 700 uppercase `--ink-3`, margin-bottom 10px
- Section separator: 0.5px `--line` horizontal

### 10.5 Version navigator

- Border: 0.5px `--line-s`
- Arrow buttons: 32px wide, `--ink-3`, no background
- Version tag: 17px 800 `--ink`
- Metadata line: 10px `--ink-3`
- Preview area: 80px height, `--line` border, placeholder SVG at 15% opacity

### 10.6 Comment feed

- Author: 10px 800 uppercase `--ink`
- Version badge (yellow filled): `--color-active` background, `#111` text, always
- AI badge (indigo bordered): `--color-special` border + text
- Timestamp: 10px `--ink-3`, margin-left auto
- Body: 11px `--ink-2`, line-height 1.6
- Separator: 0.5px `--line`

---

## 11. Animation

Relay is not animated. The one exception is state transitions on interactive elements.

```css
/* All transitions */
transition-duration: 120ms;
transition-timing-function: linear;

/* Entrance animations (pane slide, modal) */
transition-duration: 200ms;
transition-timing-function: cubic-bezier(.16, 1, .3, 1);
```

No spring physics. No bounce. No ease-in-out curves that feel organic. Motion is mechanical — constant velocity or fast-out. Things slide or snap. This is consistent with the tool aesthetic.

---

## 12. DCC panel rules

Relay's PySide6 panels in Blender and Houdini are intentionally minimal. They do not replicate the web UI.

**Panel contains only:**
1. Server status dot (7px, colours per §7.3)
2. "Open Relay" button → `webbrowser.open()`
3. "My Deliverables" button → opens browser filtered to current artist
4. Refresh button

**Panel uses no Qt WebEngine.** Opening the browser is the correct pattern. The panel is a launcher, not a viewport.

**Panel typography:** System monospace font (platform default). The JetBrains Mono preference is for the web UI only — do not require artists to install fonts for the DCC panel.

---

## 13. Token quick reference

```css
/* ── Relay design tokens ─────────────────────────── */

/* Surfaces (per theme — see §2) */
--bg
--ink        --ink-2       --ink-3
--line       --line-s

/* Status accents */
--color-active           /* yellow  #F5C400 */
--color-danger           /* red-orange (theme-variant) */
--color-success          /* emerald (theme-variant) */
--color-pending          /* steel blue (theme-variant) */
--color-special          /* indigo (theme-variant) */

/* Typography */
--font-ui: 'JetBrains Mono', 'Courier New', monospace;

/* Geometry */
--radius:        0px;
--radius-tag:    0px;
--border-width:  0.5px;
--border-accent: 2px;

/* Spacing (4px grid) */
--space-1: 4px;    --space-2: 8px;    --space-3: 12px;
--space-4: 16px;   --space-5: 20px;   --space-6: 24px;
```

---

*Relay design system — v0.1*
*Three themes: concrete-light · concrete-dark · concrete-dim*
*Five accents: yellow · red-orange · emerald · steel blue · indigo*
*One typeface: JetBrains Mono*

