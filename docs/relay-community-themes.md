# Relay — Community Theme Compatibility
*Appendix to relay-design-system.md — expanded theme catalogue*

---

## How theme files work

Each community theme file maps the source palette's colours to Relay's five semantic tokens. The constraint is that Relay never uses raw theme hex values without calibration — each theme pairing is pre-validated as a unit. Surface tokens change per theme. Accent tokens are picked from the source palette to best match Relay's five semantic temperatures.

Two important notes apply across all themes:

**Yellow as active:** Most themes have a yellow or gold accent that maps cleanly to `--color-active`. Where a theme's yellow is very bright or lime-shifted, the orange or gold variant is preferred for legibility on Relay's surfaces.

**Indigo / special:** Few themes have a dedicated indigo. Where none exists, the closest blue-shifted accent is used and noted. The `--color-special` mapping is the least clean across community themes — this is expected and acceptable.

---

## Theme file schema

```json
{
  "id": "theme-id",
  "name": "Display Name",
  "variant": "optional sub-variant",
  "mode": "dark | light",
  "surface": {
    "bg":      "#xxxxxx",
    "ink":     "#xxxxxx",
    "ink-2":   "#xxxxxx",
    "ink-3":   "#xxxxxx",
    "line":    "rgba(...)",
    "line-s":  "rgba(...)"
  },
  "accent": {
    "active":  "#xxxxxx",
    "danger":  "#xxxxxx",
    "success": "#xxxxxx",
    "pending": "#xxxxxx",
    "special": "#xxxxxx"
  },
  "notes": "mapping decisions and caveats"
}
```

---

## Gruvbox

**Character:** Warm, earthy, retro-terminal. The archetypal warm dark theme. Uses a brown-tinted near-black that photographers describe as "old paper." Three dark contrast levels plus a light variant.

### gruvbox-dark-hard
```json
{
  "id": "gruvbox-dark-hard",
  "name": "Gruvbox Dark Hard",
  "mode": "dark",
  "surface": {
    "bg":     "#1d2021",
    "ink":    "#ebdbb2",
    "ink-2":  "#a89984",
    "ink-3":  "#7c6f64",
    "line":   "rgba(235,219,178,.09)",
    "line-s": "rgba(235,219,178,.19)"
  },
  "accent": {
    "active":  "#d79921",
    "danger":  "#cc241d",
    "success": "#98971a",
    "pending": "#458588",
    "special": "#458588"
  },
  "notes": "Hardest contrast. Success green (#98971a) is olive-yellow in character — acceptable. No indigo in Gruvbox; special maps to aqua/blue #458588."
}
```

### gruvbox-dark-medium
```json
{
  "id": "gruvbox-dark-medium",
  "name": "Gruvbox Dark",
  "mode": "dark",
  "surface": {
    "bg":     "#282828",
    "ink":    "#ebdbb2",
    "ink-2":  "#a89984",
    "ink-3":  "#7c6f64",
    "line":   "rgba(235,219,178,.09)",
    "line-s": "rgba(235,219,178,.19)"
  },
  "accent": {
    "active":  "#d79921",
    "danger":  "#cc241d",
    "success": "#98971a",
    "pending": "#458588",
    "special": "#458588"
  },
  "notes": "Standard Gruvbox dark. Most widely used variant."
}
```

### gruvbox-dark-soft
```json
{
  "id": "gruvbox-dark-soft",
  "name": "Gruvbox Dark Soft",
  "mode": "dark",
  "surface": {
    "bg":     "#32302f",
    "ink":    "#ebdbb2",
    "ink-2":  "#a89984",
    "ink-3":  "#7c6f64",
    "line":   "rgba(235,219,178,.09)",
    "line-s": "rgba(235,219,178,.18)"
  },
  "accent": {
    "active":  "#d79921",
    "danger":  "#cc241d",
    "success": "#98971a",
    "pending": "#458588",
    "special": "#458588"
  },
  "notes": "Softest dark variant. Closest to Relay dim theme in character."
}
```

### gruvbox-light
```json
{
  "id": "gruvbox-light",
  "name": "Gruvbox Light",
  "mode": "light",
  "surface": {
    "bg":     "#fbf1c7",
    "ink":    "#3c3836",
    "ink-2":  "#504945",
    "ink-3":  "#928374",
    "line":   "rgba(60,56,54,.12)",
    "line-s": "rgba(60,56,54,.24)"
  },
  "accent": {
    "active":  "#b57614",
    "danger":  "#9d0006",
    "success": "#79740e",
    "pending": "#076678",
    "special": "#076678"
  },
  "notes": "Very warm cream background. Active uses dark yellow #b57614 — the light-adjusted version of d79921 for legibility. Background is significantly warmer than Relay light themes."
}
```

---

## Dracula

**Character:** Dark navy background, high-saturation pastel accents. The most popular dark theme globally. Neon-adjacent but controlled. All accent colours are bright and saturated — works best as bars and dots, not as text labels at small sizes on Relay's surfaces.

### dracula
```json
{
  "id": "dracula",
  "name": "Dracula",
  "mode": "dark",
  "surface": {
    "bg":     "#282a36",
    "ink":    "#f8f8f2",
    "ink-2":  "#c0c2cc",
    "ink-3":  "#6272a4",
    "line":   "rgba(248,248,242,.08)",
    "line-s": "rgba(248,248,242,.18)"
  },
  "accent": {
    "active":  "#f1fa8c",
    "danger":  "#ff5555",
    "success": "#50fa7b",
    "pending": "#6272a4",
    "special": "#8be9fd"
  },
  "notes": "Active uses yellow #f1fa8c — very bright, lime-shifted. Works as a filled badge; as a 3px bar on dark surface it is strong. Success #50fa7b is extremely saturated neon green — vivid as a bar/dot mark. Special maps to cyan #8be9fd — the closest cool blue-shifted accent. Pending uses the comment/muted purple-blue #6272a4."
}
```

### dracula-pro
```json
{
  "id": "dracula-pro",
  "name": "Dracula Pro",
  "mode": "dark",
  "surface": {
    "bg":     "#22212c",
    "ink":    "#f8f8f2",
    "ink-2":  "#c0bdd0",
    "ink-3":  "#7970a9",
    "line":   "rgba(248,248,242,.08)",
    "line-s": "rgba(248,248,242,.17)"
  },
  "accent": {
    "active":  "#ffca80",
    "danger":  "#ff9580",
    "success": "#8aff80",
    "pending": "#9580ff",
    "special": "#80ffea"
  },
  "notes": "Dracula Pro uses normalised lightness values. Active #ffca80 is a warm orange-yellow — less lime than standard Dracula. Danger #ff9580 is salmon-orange rather than pure red. Special maps to cyan #80ffea."
}
```

---

## Catppuccin

**Character:** Pastel, soft, high colour count. Four flavours covering the full light-to-dark range. The most comprehensive multi-variant theme ecosystem. Accent colours are significantly softer than Gruvbox or Dracula — they read as gentle on all surfaces.

### catppuccin-mocha
```json
{
  "id": "catppuccin-mocha",
  "name": "Catppuccin Mocha",
  "mode": "dark",
  "surface": {
    "bg":     "#1e1e2e",
    "ink":    "#cdd6f4",
    "ink-2":  "#a6adc8",
    "ink-3":  "#585b70",
    "line":   "rgba(205,214,244,.08)",
    "line-s": "rgba(205,214,244,.18)"
  },
  "accent": {
    "active":  "#f9e2af",
    "danger":  "#f38ba8",
    "success": "#a6e3a1",
    "pending": "#89b4fa",
    "special": "#cba6f7"
  },
  "notes": "All accents are soft pastels. Active #f9e2af is warm peach-yellow. On dark surface works well as marks. Special uses mauve #cba6f7 — this is the closest Catppuccin comes to indigo, though it reads as lavender-purple."
}
```

### catppuccin-macchiato
```json
{
  "id": "catppuccin-macchiato",
  "name": "Catppuccin Macchiato",
  "mode": "dark",
  "surface": {
    "bg":     "#24273a",
    "ink":    "#cad3f5",
    "ink-2":  "#a5adcb",
    "ink-3":  "#5b6078",
    "line":   "rgba(202,211,245,.08)",
    "line-s": "rgba(202,211,245,.17)"
  },
  "accent": {
    "active":  "#eed49f",
    "danger":  "#ed8796",
    "success": "#a6da95",
    "pending": "#8aadf4",
    "special": "#c6a0f6"
  },
  "notes": "Medium contrast Catppuccin. Slightly warmer background than Mocha. Same accent character — all pastels."
}
```

### catppuccin-frappe
```json
{
  "id": "catppuccin-frappe",
  "name": "Catppuccin Frappé",
  "mode": "dark",
  "surface": {
    "bg":     "#303446",
    "ink":    "#c6d0f5",
    "ink-2":  "#a5adce",
    "ink-3":  "#626880",
    "line":   "rgba(198,208,245,.08)",
    "line-s": "rgba(198,208,245,.17)"
  },
  "accent": {
    "active":  "#e5c890",
    "danger":  "#e78284",
    "success": "#a6d189",
    "pending": "#8caaee",
    "special": "#ca9ee6"
  },
  "notes": "Lightest of the dark Catppuccin variants. Most muted accents in the family."
}
```

### catppuccin-latte
```json
{
  "id": "catppuccin-latte",
  "name": "Catppuccin Latte",
  "mode": "light",
  "surface": {
    "bg":     "#eff1f5",
    "ink":    "#4c4f69",
    "ink-2":  "#6c6f85",
    "ink-3":  "#9ca0b0",
    "line":   "rgba(76,79,105,.10)",
    "line-s": "rgba(76,79,105,.22)"
  },
  "accent": {
    "active":  "#df8e1d",
    "danger":  "#d20f39",
    "success": "#40a02b",
    "pending": "#1e66f5",
    "special": "#7287fd"
  },
  "notes": "The only Catppuccin light theme. Background is cool blue-white — noticeably cooler than Relay light themes. Active uses dark yellow #df8e1d for contrast. Special uses lavender #7287fd — the most indigo-like Latte has."
}
```

---

## Nord

**Character:** Arctic, blue-grey, minimal. Four named palettes: Polar Night (dark backgrounds), Snowstorm (light backgrounds/text), Frost (accent blues), Aurora (semantic colours). Single dark mode only — no official light variant. The coolest-temperature theme in common use.

### nord
```json
{
  "id": "nord",
  "name": "Nord",
  "mode": "dark",
  "surface": {
    "bg":     "#2e3440",
    "ink":    "#d8dee9",
    "ink-2":  "#81a1c1",
    "ink-3":  "#4c566a",
    "line":   "rgba(216,222,233,.09)",
    "line-s": "rgba(216,222,233,.19)"
  },
  "accent": {
    "active":  "#ebcb8b",
    "danger":  "#bf616a",
    "success": "#a3be8c",
    "pending": "#81a1c1",
    "special": "#5e81ac"
  },
  "notes": "Active uses Aurora yellow #ebcb8b — warm gold against the cold blue-grey surface. Danger uses Aurora red #bf616a — muted, not alarming. Pending uses Frost blue #81a1c1. Special uses the deeper Frost blue #5e81ac — the only blue shift Nord offers toward indigo territory. Nord has no yellow-green or lime, so success uses the muted sage #a3be8c."
}
```

---

## Tokyo Night

**Character:** Dark navy-purple backgrounds with neon-adjacent but controlled accents. Inspired by the lights of downtown Tokyo. Four variants: night (darkest), storm, moon, day (light).

### tokyonight-night
```json
{
  "id": "tokyonight-night",
  "name": "Tokyo Night",
  "mode": "dark",
  "surface": {
    "bg":     "#1a1b26",
    "ink":    "#c0caf5",
    "ink-2":  "#a9b1d6",
    "ink-3":  "#565f89",
    "line":   "rgba(192,202,245,.08)",
    "line-s": "rgba(192,202,245,.17)"
  },
  "accent": {
    "active":  "#e0af68",
    "danger":  "#f7768e",
    "success": "#9ece6a",
    "pending": "#7aa2f7",
    "special": "#bb9af7"
  },
  "notes": "Active #e0af68 is warm amber-gold — the most DCC-adjacent yellow in this theme family. Danger is pink-red #f7768e. Special maps to purple #bb9af7 — Tokyo Night leans purple-blue in its cool accents. Pending uses the primary blue #7aa2f7."
}
```

### tokyonight-storm
```json
{
  "id": "tokyonight-storm",
  "name": "Tokyo Night Storm",
  "mode": "dark",
  "surface": {
    "bg":     "#24283b",
    "ink":    "#c0caf5",
    "ink-2":  "#a9b1d6",
    "ink-3":  "#565f89",
    "line":   "rgba(192,202,245,.09)",
    "line-s": "rgba(192,202,245,.18)"
  },
  "accent": {
    "active":  "#e0af68",
    "danger":  "#f7768e",
    "success": "#9ece6a",
    "pending": "#7aa2f7",
    "special": "#bb9af7"
  },
  "notes": "Storm variant — slightly lighter background than Night. Same accents. The most popular Tokyo Night variant for daytime use."
}
```

### tokyonight-moon
```json
{
  "id": "tokyonight-moon",
  "name": "Tokyo Night Moon",
  "mode": "dark",
  "surface": {
    "bg":     "#222436",
    "ink":    "#c8d3f5",
    "ink-2":  "#a9b8e8",
    "ink-3":  "#636da6",
    "line":   "rgba(200,211,245,.08)",
    "line-s": "rgba(200,211,245,.17)"
  },
  "accent": {
    "active":  "#ffc777",
    "danger":  "#ff757f",
    "success": "#c3e88d",
    "pending": "#82aaff",
    "special": "#c099ff"
  },
  "notes": "Moon variant — lighter more saturated foreground. Active #ffc777 is brighter warm orange-yellow than Night variant. Success #c3e88d is a lighter yellow-green."
}
```

### tokyonight-day
```json
{
  "id": "tokyonight-day",
  "name": "Tokyo Night Day",
  "mode": "light",
  "surface": {
    "bg":     "#e1e2e7",
    "ink":    "#3760bf",
    "ink-2":  "#6172b0",
    "ink-3":  "#9699a3",
    "line":   "rgba(55,96,191,.10)",
    "line-s": "rgba(55,96,191,.22)"
  },
  "accent": {
    "active":  "#8c6c3e",
    "danger":  "#f52a65",
    "success": "#587539",
    "pending": "#2e7de9",
    "special": "#7847bd"
  },
  "notes": "Light variant with a cool blue-grey background. Primary ink is blue #3760bf — unusually coloured foreground text. Active and success use darkened earth tones for contrast on the light surface."
}
```

---

## Rosé Pine

**Character:** Natural, warm, elegant. Muted purples and pinks with earthy tones. Three variants: main (dark), moon (darker), dawn (light). Named colours — base, surface, overlay, muted, subtle, text, love, gold, rose, pine, foam, iris.

### rose-pine
```json
{
  "id": "rose-pine",
  "name": "Rosé Pine",
  "mode": "dark",
  "surface": {
    "bg":     "#191724",
    "ink":    "#e0def4",
    "ink-2":  "#908caa",
    "ink-3":  "#6e6a86",
    "line":   "rgba(224,222,244,.08)",
    "line-s": "rgba(224,222,244,.17)"
  },
  "accent": {
    "active":  "#f6c177",
    "danger":  "#eb6f92",
    "success": "#31748f",
    "pending": "#9ccfd8",
    "special": "#c4a7e7"
  },
  "notes": "Active uses gold #f6c177 — warm amber. Danger uses love #eb6f92 — pink-red. Success uses pine #31748f — teal-green, quite cool. Pending uses foam #9ccfd8 — pale cyan. Special uses iris #c4a7e7 — soft lavender, Rosé Pine's closest to indigo."
}
```

### rose-pine-moon
```json
{
  "id": "rose-pine-moon",
  "name": "Rosé Pine Moon",
  "mode": "dark",
  "surface": {
    "bg":     "#232136",
    "ink":    "#e0def4",
    "ink-2":  "#908caa",
    "ink-3":  "#6e6a86",
    "line":   "rgba(224,222,244,.08)",
    "line-s": "rgba(224,222,244,.17)"
  },
  "accent": {
    "active":  "#f6c177",
    "danger":  "#eb6f92",
    "success": "#3e8fb0",
    "pending": "#9ccfd8",
    "special": "#c4a7e7"
  },
  "notes": "Moon is the darkest Rosé Pine variant with a deeper blue-purple background. Same accent family as main."
}
```

### rose-pine-dawn
```json
{
  "id": "rose-pine-dawn",
  "name": "Rosé Pine Dawn",
  "mode": "light",
  "surface": {
    "bg":     "#faf4ed",
    "ink":    "#575279",
    "ink-2":  "#797593",
    "ink-3":  "#9893a5",
    "line":   "rgba(87,82,121,.10)",
    "line-s": "rgba(87,82,121,.22)"
  },
  "accent": {
    "active":  "#ea9d34",
    "danger":  "#b4637a",
    "success": "#286983",
    "pending": "#56949f",
    "special": "#907aa9"
  },
  "notes": "Warm cream light background — similar character to Gruvbox Light but more lavender-tinted. Active uses dark gold #ea9d34. Success and pending both map to pine/foam teal variants — the least green theme in this list. Special uses iris #907aa9."
}
```

---

## Solarized

**Character:** The original precision colour scheme, designed in CIELAB. Sixteen colours, symmetric light/dark contrast. Warm teal dark background. The most scientifically rigorous terminal theme.

### solarized-dark
```json
{
  "id": "solarized-dark",
  "name": "Solarized Dark",
  "mode": "dark",
  "surface": {
    "bg":     "#002b36",
    "ink":    "#839496",
    "ink-2":  "#657b83",
    "ink-3":  "#586e75",
    "line":   "rgba(131,148,150,.10)",
    "line-s": "rgba(131,148,150,.22)"
  },
  "accent": {
    "active":  "#b58900",
    "danger":  "#dc322f",
    "success": "#859900",
    "pending": "#268bd2",
    "special": "#6c71c4"
  },
  "notes": "The deepest dark background of any mainstream theme — a very dark teal #002b36. Active uses dark yellow #b58900. Success uses olive-green #859900 — yellow-green in character. Pending uses primary blue #268bd2. Special maps to violet #6c71c4 — Solarized's violet is the closest to indigo in the palette, blue-purple rather than red-purple."
}
```

### solarized-light
```json
{
  "id": "solarized-light",
  "name": "Solarized Light",
  "mode": "light",
  "surface": {
    "bg":     "#fdf6e3",
    "ink":    "#657b83",
    "ink-2":  "#839496",
    "ink-3":  "#93a1a1",
    "line":   "rgba(101,123,131,.10)",
    "line-s": "rgba(101,123,131,.22)"
  },
  "accent": {
    "active":  "#b58900",
    "danger":  "#dc322f",
    "success": "#859900",
    "pending": "#268bd2",
    "special": "#6c71c4"
  },
  "notes": "Very warm cream background #fdf6e3. Symmetric CIELAB design means accents maintain identical contrast relationships in both modes. Foreground text is dark teal rather than pure dark — distinctive character."
}
```

---

## One Dark / Atom

**Character:** The theme that defined a generation of code editors. Dark grey background, warm but not brown. Balanced accent set. Several variants from the original Atom default.

### one-dark
```json
{
  "id": "one-dark",
  "name": "One Dark",
  "mode": "dark",
  "surface": {
    "bg":     "#282c34",
    "ink":    "#abb2bf",
    "ink-2":  "#828997",
    "ink-3":  "#5c6370",
    "line":   "rgba(171,178,191,.09)",
    "line-s": "rgba(171,178,191,.19)"
  },
  "accent": {
    "active":  "#e5c07b",
    "danger":  "#e06c75",
    "success": "#98c379",
    "pending": "#61afef",
    "special": "#c678dd"
  },
  "notes": "Active uses warm yellow #e5c07b. Danger is muted pink-red #e06c75. Success is sage green #98c379. Pending uses sky blue #61afef. Special uses purple #c678dd — One Dark's purple is definitively purple rather than indigo."
}
```

### one-light
```json
{
  "id": "one-light",
  "name": "One Light",
  "mode": "light",
  "surface": {
    "bg":     "#fafafa",
    "ink":    "#383a42",
    "ink-2":  "#696c77",
    "ink-3":  "#a0a1a7",
    "line":   "rgba(56,58,66,.10)",
    "line-s": "rgba(56,58,66,.22)"
  },
  "accent": {
    "active":  "#986801",
    "danger":  "#ca1243",
    "success": "#50a14f",
    "pending": "#4078f2",
    "special": "#a626a4"
  },
  "notes": "Very bright background #fafafa — the default Atom light. Active uses dark amber #986801. Special uses magenta #a626a4 — no indigo equivalent in One Light."
}
```

---

## Monokai

**Character:** Classic Sublime Text theme. Black background, high-contrast vivid accents. The original neon terminal aesthetic — warm yellows, electric greens, hot pinks.

### monokai
```json
{
  "id": "monokai",
  "name": "Monokai",
  "mode": "dark",
  "surface": {
    "bg":     "#272822",
    "ink":    "#f8f8f2",
    "ink-2":  "#cfcfc2",
    "ink-3":  "#75715e",
    "line":   "rgba(248,248,242,.09)",
    "line-s": "rgba(248,248,242,.19)"
  },
  "accent": {
    "active":  "#e6db74",
    "danger":  "#f92672",
    "success": "#a6e22e",
    "pending": "#66d9e8",
    "special": "#ae81ff"
  },
  "notes": "Active #e6db74 is pale yellow — slightly washed out against dark surface as text but strong as a bar. Danger uses hot pink-red #f92672 — the most vivid danger colour in this catalogue. Success is electric lime green #a6e22e — very saturated. Special maps to purple #ae81ff. Pending uses cyan #66d9e8."
}
```

### monokai-pro
```json
{
  "id": "monokai-pro",
  "name": "Monokai Pro",
  "mode": "dark",
  "surface": {
    "bg":     "#2d2a2e",
    "ink":    "#fcfcfa",
    "ink-2":  "#c1c0c0",
    "ink-3":  "#727072",
    "line":   "rgba(252,252,250,.09)",
    "line-s": "rgba(252,252,250,.18)"
  },
  "accent": {
    "active":  "#ffd866",
    "danger":  "#ff6188",
    "success": "#a9dc76",
    "pending": "#78dce8",
    "special": "#ab9df2"
  },
  "notes": "Pro variant — slightly lighter warmer background, more refined accents. Active #ffd866 is a brighter warm yellow. Special #ab9df2 is lavender-purple."
}
```

---

## Everforest

**Character:** Forest-inspired, warm greens and earthy tones. Created as a warmer, more comfortable alternative to Nord. Available in dark and light with three contrast levels each.

### everforest-dark-hard
```json
{
  "id": "everforest-dark-hard",
  "name": "Everforest Dark Hard",
  "mode": "dark",
  "surface": {
    "bg":     "#1e2326",
    "ink":    "#d3c6aa",
    "ink-2":  "#9da9a0",
    "ink-3":  "#5c6a72",
    "line":   "rgba(211,198,170,.09)",
    "line-s": "rgba(211,198,170,.18)"
  },
  "accent": {
    "active":  "#dbbc7f",
    "danger":  "#e67e80",
    "success": "#a7c080",
    "pending": "#7fbbb3",
    "special": "#d699b6"
  },
  "notes": "Warm earthy dark. Active uses gold #dbbc7f. Success uses muted green #a7c080. Pending uses teal #7fbbb3. Special maps to pink #d699b6 — Everforest has no blue-indigo accent; pink is the most distinct cool colour."
}
```

### everforest-dark-medium
```json
{
  "id": "everforest-dark-medium",
  "name": "Everforest Dark",
  "mode": "dark",
  "surface": {
    "bg":     "#272e33",
    "ink":    "#d3c6aa",
    "ink-2":  "#9da9a0",
    "ink-3":  "#5c6a72",
    "line":   "rgba(211,198,170,.09)",
    "line-s": "rgba(211,198,170,.18)"
  },
  "accent": {
    "active":  "#dbbc7f",
    "danger":  "#e67e80",
    "success": "#a7c080",
    "pending": "#7fbbb3",
    "special": "#d699b6"
  },
  "notes": "Standard contrast Everforest Dark."
}
```

### everforest-light
```json
{
  "id": "everforest-light",
  "name": "Everforest Light",
  "mode": "light",
  "surface": {
    "bg":     "#fdf6e3",
    "ink":    "#5c6a72",
    "ink-2":  "#829181",
    "ink-3":  "#a6b0a0",
    "line":   "rgba(92,106,114,.10)",
    "line-s": "rgba(92,106,114,.22)"
  },
  "accent": {
    "active":  "#dfa000",
    "danger":  "#f85552",
    "success": "#8da101",
    "pending": "#3a94c5",
    "special": "#df69ba"
  },
  "notes": "Very warm background — essentially same as Solarized Light #fdf6e3. Active #dfa000 is deep gold."
}
```

---

## Kanagawa

**Character:** Japanese woodblock print inspired. Dark ink backgrounds, muted traditional pigment colours. Created for Neovim. Two variants: Wave (dark) and Lotus (light).

### kanagawa-wave
```json
{
  "id": "kanagawa-wave",
  "name": "Kanagawa Wave",
  "mode": "dark",
  "surface": {
    "bg":     "#1f1f28",
    "ink":    "#dcd7ba",
    "ink-2":  "#a3a08b",
    "ink-3":  "#54546d",
    "line":   "rgba(220,215,186,.08)",
    "line-s": "rgba(220,215,186,.18)"
  },
  "accent": {
    "active":  "#dca561",
    "danger":  "#c34043",
    "success": "#76946a",
    "pending": "#7e9cd8",
    "special": "#957fb8"
  },
  "notes": "Traditional ink-and-pigment character. Active is warm amber-orange #dca561 — the colour of old gold leaf. Success is muted forest green #76946a. Pending uses wave blue #7e9cd8. Special uses wisteria #957fb8 — blue-purple."
}
```

### kanagawa-lotus
```json
{
  "id": "kanagawa-lotus",
  "name": "Kanagawa Lotus",
  "mode": "light",
  "surface": {
    "bg":     "#f2ecbc",
    "ink":    "#43436c",
    "ink-2":  "#717c7c",
    "ink-3":  "#a09eac",
    "line":   "rgba(67,67,108,.10)",
    "line-s": "rgba(67,67,108,.22)"
  },
  "accent": {
    "active":  "#a96832",
    "danger":  "#c84053",
    "success": "#6f894e",
    "pending": "#4d699b",
    "special": "#624c83"
  },
  "notes": "Very warm yellow parchment background. Active uses dark amber #a96832. Special uses deep violet #624c83 — the most indigo-like colour in this palette."
}
```

---

## Material

**Character:** Google Material Design colour system adapted for code editors. Clean, systematic, multiple variants. The most legible theme family for non-programmers.

### material-darker
```json
{
  "id": "material-darker",
  "name": "Material Darker",
  "mode": "dark",
  "surface": {
    "bg":     "#212121",
    "ink":    "#eeffff",
    "ink-2":  "#b0bec5",
    "ink-3":  "#546e7a",
    "line":   "rgba(238,255,255,.08)",
    "line-s": "rgba(238,255,255,.17)"
  },
  "accent": {
    "active":  "#ffcb6b",
    "danger":  "#f07178",
    "success": "#c3e88d",
    "pending": "#82aaff",
    "special": "#c792ea"
  },
  "notes": "Pure dark grey background — no warmth or tint. Active #ffcb6b is bright warm yellow. Special uses purple #c792ea."
}
```

### material-ocean
```json
{
  "id": "material-ocean",
  "name": "Material Ocean",
  "mode": "dark",
  "surface": {
    "bg":     "#0f111a",
    "ink":    "#8f93a2",
    "ink-2":  "#717cb4",
    "ink-3":  "#464b5d",
    "line":   "rgba(143,147,162,.08)",
    "line-s": "rgba(143,147,162,.17)"
  },
  "accent": {
    "active":  "#ffcb6b",
    "danger":  "#f07178",
    "success": "#c3e88d",
    "pending": "#82aaff",
    "special": "#c792ea"
  },
  "notes": "Very dark navy background. Same accent palette as Darker. Foreground is noticeably desaturated compared to most themes."
}
```

### material-lighter
```json
{
  "id": "material-lighter",
  "name": "Material Lighter",
  "mode": "light",
  "surface": {
    "bg":     "#fafafa",
    "ink":    "#80cbc4",
    "ink-2":  "#546e7a",
    "ink-3":  "#b0bec5",
    "line":   "rgba(84,110,122,.10)",
    "line-s": "rgba(84,110,122,.22)"
  },
  "accent": {
    "active":  "#e2931d",
    "danger":  "#e53935",
    "success": "#91b859",
    "pending": "#6182b8",
    "special": "#7c4dff"
  },
  "notes": "Pure white-adjacent light background. Active uses dark amber #e2931d. Special uses deep purple #7c4dff — the most saturated special colour in this catalogue."
}
```

---

## Palenight / Ayu

### palenight
```json
{
  "id": "palenight",
  "name": "Palenight",
  "mode": "dark",
  "surface": {
    "bg":     "#292d3e",
    "ink":    "#a6accd",
    "ink-2":  "#676e95",
    "ink-3":  "#4b5263",
    "line":   "rgba(166,172,205,.08)",
    "line-s": "rgba(166,172,205,.17)"
  },
  "accent": {
    "active":  "#ffcb6b",
    "danger":  "#f07178",
    "success": "#c3e88d",
    "pending": "#82aaff",
    "special": "#c792ea"
  },
  "notes": "Material Palenight — blue-purple tinted dark background. Same accent palette as Material family. The purple-blue tint of the background makes the special accent #c792ea feel particularly at home."
}
```

### ayu-dark
```json
{
  "id": "ayu-dark",
  "name": "Ayu Dark",
  "mode": "dark",
  "surface": {
    "bg":     "#0a0e14",
    "ink":    "#b3b1ad",
    "ink-2":  "#626a73",
    "ink-3":  "#3d4354",
    "line":   "rgba(179,177,173,.08)",
    "line-s": "rgba(179,177,173,.17)"
  },
  "accent": {
    "active":  "#e6b450",
    "danger":  "#ff3333",
    "success": "#91b362",
    "pending": "#36a3d9",
    "special": "#6994bf"
  },
  "notes": "Very dark near-black background. Active #e6b450 is warm gold. Danger is a pure saturated red. Pending uses sky blue #36a3d9. Special maps to deeper desaturated blue #6994bf — Ayu's closest to indigo territory."
}
```

### ayu-mirage
```json
{
  "id": "ayu-mirage",
  "name": "Ayu Mirage",
  "mode": "dark",
  "surface": {
    "bg":     "#1f2430",
    "ink":    "#cbccc6",
    "ink-2":  "#707a8c",
    "ink-3":  "#3d4354",
    "line":   "rgba(203,204,198,.08)",
    "line-s": "rgba(203,204,198,.17)"
  },
  "accent": {
    "active":  "#ffd580",
    "danger":  "#ff3333",
    "success": "#bae67e",
    "pending": "#5ccfe6",
    "special": "#a37acc"
  },
  "notes": "Mirage is darker and more blue-shifted than Ayu Light. Active #ffd580 is bright warm yellow-orange. Special uses purple #a37acc."
}
```

### ayu-light
```json
{
  "id": "ayu-light",
  "name": "Ayu Light",
  "mode": "light",
  "surface": {
    "bg":     "#fafafa",
    "ink":    "#575f66",
    "ink-2":  "#8a9199",
    "ink-3":  "#abb0b6",
    "line":   "rgba(87,95,102,.10)",
    "line-s": "rgba(87,95,102,.22)"
  },
  "accent": {
    "active":  "#a37820",
    "danger":  "#f07171",
    "success": "#86b300",
    "pending": "#399ee6",
    "special": "#a37acc"
  },
  "notes": "Pure white-adjacent background. Active uses dark amber for contrast. Success #86b300 is a fresh yellow-green."
}
```

---

## Selenized

**Character:** A revised Solarized based on perceptual uniformity. By Jan Warchol. More readable than Solarized on uncalibrated displays. Available in black, dark, light, and white variants.

### selenized-dark
```json
{
  "id": "selenized-dark",
  "name": "Selenized Dark",
  "mode": "dark",
  "surface": {
    "bg":     "#103c48",
    "ink":    "#adbcbc",
    "ink-2":  "#72898a",
    "ink-3":  "#184956",
    "line":   "rgba(173,188,188,.09)",
    "line-s": "rgba(173,188,188,.19)"
  },
  "accent": {
    "active":  "#dbb32d",
    "danger":  "#fa5750",
    "success": "#75b938",
    "pending": "#4695f7",
    "special": "#41a8b5"
  },
  "notes": "Deep teal dark background — similar in spirit to Solarized but more readable. Active #dbb32d is warm golden-yellow. Pending uses bright blue #4695f7. Special maps to teal #41a8b5 — Selenized's cool accent is a distinct teal-blue rather than indigo."
}
```

### selenized-black
```json
{
  "id": "selenized-black",
  "name": "Selenized Black",
  "mode": "dark",
  "surface": {
    "bg":     "#181818",
    "ink":    "#b9b9b9",
    "ink-2":  "#777777",
    "ink-3":  "#3b3b3b",
    "line":   "rgba(185,185,185,.09)",
    "line-s": "rgba(185,185,185,.18)"
  },
  "accent": {
    "active":  "#dbb32d",
    "danger":  "#ed4a46",
    "success": "#70b433",
    "pending": "#368aeb",
    "special": "#3fc5b7"
  },
  "notes": "Near-pure black background. Most neutral of the Selenized variants. Accent colours have the most contrast against this surface."
}
```

### selenized-light
```json
{
  "id": "selenized-light",
  "name": "Selenized Light",
  "mode": "light",
  "surface": {
    "bg":     "#fbf3db",
    "ink":    "#53676d",
    "ink-2":  "#3a4d53",
    "ink-3":  "#909995",
    "line":   "rgba(83,103,109,.10)",
    "line-s": "rgba(83,103,109,.22)"
  },
  "accent": {
    "active":  "#a78300",
    "danger":  "#d2212d",
    "success": "#489100",
    "pending": "#0072d4",
    "special": "#007389"
  },
  "notes": "Warm cream background similar to Solarized Light. Active uses dark golden #a78300. Perceptually more uniform than Solarized — dark tones have better contrast in practice."
}
```

---

## Nightfox / Dayfox family

**Character:** Modern, balanced. Multiple variants with shared accent palette. Clean neutral backgrounds.

### nightfox
```json
{
  "id": "nightfox",
  "name": "Nightfox",
  "mode": "dark",
  "surface": {
    "bg":     "#192330",
    "ink":    "#cdcecf",
    "ink-2":  "#738091",
    "ink-3":  "#3b4252",
    "line":   "rgba(205,206,207,.08)",
    "line-s": "rgba(205,206,207,.17)"
  },
  "accent": {
    "active":  "#f4a261",
    "danger":  "#c94f6d",
    "success": "#81b29a",
    "pending": "#719cd6",
    "special": "#9d79d6"
  },
  "notes": "Active uses warm orange #f4a261 — the most orange active colour in this catalogue. Success uses muted sage-teal #81b29a. Special uses medium purple #9d79d6."
}
```

### dayfox
```json
{
  "id": "dayfox",
  "name": "Dayfox",
  "mode": "light",
  "surface": {
    "bg":     "#e4dcd4",
    "ink":    "#3d2b5e",
    "ink-2":  "#824d5b",
    "ink-3":  "#b1a6b1",
    "line":   "rgba(61,43,94,.10)",
    "line-s": "rgba(61,43,94,.22)"
  },
  "accent": {
    "active":  "#a440b5",
    "danger":  "#c94f6d",
    "success": "#4d8c72",
    "pending": "#4154a9",
    "special": "#6d6a59"
  },
  "notes": "Warm pinkish-beige light background. Unusual active colour — #a440b5 is a saturated purple-pink, not yellow. This is a deliberate design choice in Dayfox. When used with Relay, this produces an unexpected active colour that may confuse users familiar with the yellow convention."
}
```

---

## Modus (GNU Emacs)

**Character:** Maximum accessibility-focused. Designed to meet WCAG AAA (7:1 contrast ratio) throughout. Created by Protesilaos Stavrou. Two variants: Vivendi (dark) and Operandi (light).

### modus-vivendi
```json
{
  "id": "modus-vivendi",
  "name": "Modus Vivendi",
  "mode": "dark",
  "surface": {
    "bg":     "#000000",
    "ink":    "#ffffff",
    "ink-2":  "#a8a8a8",
    "ink-3":  "#6a6a6a",
    "line":   "rgba(255,255,255,.10)",
    "line-s": "rgba(255,255,255,.22)"
  },
  "accent": {
    "active":  "#e0c05e",
    "danger":  "#ff8059",
    "success": "#44bc44",
    "pending": "#79a8ff",
    "special": "#b6a0ff"
  },
  "notes": "Pure black background — maximum contrast. All colours pass AAA 7:1 ratio. Active #e0c05e is muted gold. Danger uses an orange-red #ff8059 rather than pure red — more accessible. Special maps to light purple #b6a0ff."
}
```

### modus-operandi
```json
{
  "id": "modus-operandi",
  "name": "Modus Operandi",
  "mode": "light",
  "surface": {
    "bg":     "#ffffff",
    "ink":    "#000000",
    "ink-2":  "#505050",
    "ink-3":  "#a0a0a0",
    "line":   "rgba(0,0,0,.10)",
    "line-s": "rgba(0,0,0,.22)"
  },
  "accent": {
    "active":  "#7d500a",
    "danger":  "#a60000",
    "success": "#005f00",
    "pending": "#0030a6",
    "special": "#5f3ecf"
  },
  "notes": "Pure white background. All colours are darkened to meet AAA on white — the darkest accent values in this catalogue. Active #7d500a is a very dark amber. Special #5f3ecf is a rich blue-violet — the most indigo-accurate of all light theme specials."
}
```

---

## Mapping notes summary

The following patterns appear consistently across all themes and inform how Relay should handle theme loading:

**Yellow / active:** Every theme has a yellow or gold accent. Quality varies — some (Catppuccin, Rosé Pine, Dracula) are very pale and fail on light surfaces as small text. Relay enforces that `--color-active` is used as a mark only on light themes regardless of the theme file value.

**Red / danger:** Universally present. Character varies: pure red (Ayu), pink-red (Dracula, Catppuccin), salmon-orange (Material, Modus). All work as danger indicators.

**Green / success:** Universally present. Character varies widely: olive (Gruvbox), lime (Monokai), sage (Everforest, Nightfox), teal (Rosé Pine). Relay maps all to `--color-success` regardless of hue deviation.

**Blue / pending:** Universally present. Saturation and hue vary but all themes have a distinguishable blue for informational or pending states.

**Indigo / special:** The most inconsistent slot. Themes without a genuine indigo map their closest cool accent — purple (Catppuccin, One Dark, Dracula), violet (Solarized), teal (Selenized, Everforest), cyan (Dracula standard). This is expected. Relay users who care about the indigo distinction should use Relay's native themes.

---

*Relay community themes appendix — v0.1*
*32 theme variants across 14 theme families*
