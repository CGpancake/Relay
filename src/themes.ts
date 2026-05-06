import type React from 'react';

export type ThemeMode = 'light' | 'dark';

export type ThemeDefinition = {
  id: string;
  name: string;
  group: 'Native' | 'Community';
  mode: ThemeMode;
  family: string;
  tokens: {
    bg: string;
    ink: string;
    ink2: string;
    ink3: string;
    line: string;
    lineS: string;
    active: string;
    danger: string;
    success: string;
    pending: string;
    special: string;
  };
};

const nativeTheme = (
  id: string,
  name: string,
  mode: ThemeMode,
  bg: string,
  ink: string,
  ink2: string,
  ink3: string,
  line: string,
  lineS: string,
  danger: string,
  success: string,
  pending: string,
  special: string,
): ThemeDefinition => ({
  id,
  name,
  group: 'Native',
  mode,
  family: id.split('-')[0],
  tokens: { bg, ink, ink2, ink3, line, lineS, active: '#F5C400', danger, success, pending, special },
});

const communityTheme = (
  id: string,
  name: string,
  mode: ThemeMode,
  familyOrBg: string,
  ...tokenArgs: string[]
): ThemeDefinition => {
  const hasExplicitFamily = !familyOrBg.startsWith('#') && !familyOrBg.startsWith('rgba');
  const family = hasExplicitFamily ? familyOrBg : inferThemeFamily(id);
  const [bg, ink, ink2, ink3, line, lineS, active, danger, success, pending, special] = hasExplicitFamily
    ? tokenArgs
    : [familyOrBg, ...tokenArgs];

  return {
    id,
    name,
    group: 'Community',
    mode,
    family,
    tokens: { bg, ink, ink2, ink3, line, lineS, active, danger, success, pending, special },
  };
};

const inferThemeFamily = (id: string) => {
  if (id.startsWith('tokyonight')) return 'tokyonight';
  if (id.startsWith('rose-pine')) return 'rose-pine';
  if (id.startsWith('solarized')) return 'solarized';
  if (id.startsWith('one-')) return 'one';
  if (id.startsWith('monokai')) return 'monokai';
  if (id.startsWith('everforest')) return 'everforest';
  if (id.startsWith('kanagawa')) return 'kanagawa';
  if (id.startsWith('material')) return 'material';
  if (id.startsWith('ayu')) return 'ayu';
  if (id.startsWith('selenized')) return 'selenized';
  if (id.endsWith('fox')) return 'fox';
  if (id.startsWith('modus')) return 'modus';
  return id;
};

export const themes: ThemeDefinition[] = [
  nativeTheme('concrete-light', 'Concrete Light', 'light', '#DEDAD5', '#0E0D0C', '#444240', '#706E6C', 'rgba(14,13,12,.13)', 'rgba(14,13,12,.26)', '#E03010', '#10B060', '#5A7A9A', '#4462A8'),
  nativeTheme('concrete-dark', 'Concrete Dark', 'dark', '#1A1918', '#DEDCDA', '#808080', '#484644', 'rgba(222,220,218,.08)', 'rgba(222,220,218,.17)', '#E84020', '#18C870', '#7A9ABB', '#6080CC'),
  nativeTheme('concrete-dim', 'Concrete Dim', 'dark', '#222120', '#E8E6E2', '#909090', '#525050', 'rgba(232,230,226,.09)', 'rgba(232,230,226,.19)', '#E84020', '#18C870', '#7A9ABB', '#6080CC'),
  communityTheme('gruvbox-dark-hard', 'Gruvbox Dark Hard', 'dark', 'gruvbox', '#1d2021', '#ebdbb2', '#a89984', '#7c6f64', 'rgba(235,219,178,.09)', 'rgba(235,219,178,.19)', '#d79921', '#cc241d', '#98971a', '#458588', '#458588'),
  communityTheme('gruvbox-dark-medium', 'Gruvbox Dark', 'dark', 'gruvbox', '#282828', '#ebdbb2', '#a89984', '#7c6f64', 'rgba(235,219,178,.09)', 'rgba(235,219,178,.19)', '#d79921', '#cc241d', '#98971a', '#458588', '#458588'),
  communityTheme('gruvbox-dark-soft', 'Gruvbox Dark Soft', 'dark', 'gruvbox', '#32302f', '#ebdbb2', '#a89984', '#7c6f64', 'rgba(235,219,178,.09)', 'rgba(235,219,178,.18)', '#d79921', '#cc241d', '#98971a', '#458588', '#458588'),
  communityTheme('gruvbox-light', 'Gruvbox Light', 'light', 'gruvbox', '#fbf1c7', '#3c3836', '#504945', '#928374', 'rgba(60,56,54,.12)', 'rgba(60,56,54,.24)', '#b57614', '#9d0006', '#79740e', '#076678', '#076678'),
  communityTheme('dracula', 'Dracula', 'dark', 'dracula', '#282a36', '#f8f8f2', '#c0c2cc', '#6272a4', 'rgba(248,248,242,.08)', 'rgba(248,248,242,.18)', '#f1fa8c', '#ff5555', '#50fa7b', '#6272a4', '#8be9fd'),
  communityTheme('dracula-pro', 'Dracula Pro', 'dark', 'dracula', '#22212c', '#f8f8f2', '#c0bdd0', '#7970a9', 'rgba(248,248,242,.08)', 'rgba(248,248,242,.17)', '#ffca80', '#ff9580', '#8aff80', '#9580ff', '#80ffea'),
  communityTheme('catppuccin-mocha', 'Catppuccin Mocha', 'dark', 'catppuccin', '#1e1e2e', '#cdd6f4', '#a6adc8', '#585b70', 'rgba(205,214,244,.08)', 'rgba(205,214,244,.18)', '#f9e2af', '#f38ba8', '#a6e3a1', '#89b4fa', '#cba6f7'),
  communityTheme('catppuccin-macchiato', 'Catppuccin Macchiato', 'dark', 'catppuccin', '#24273a', '#cad3f5', '#a5adcb', '#5b6078', 'rgba(202,211,245,.08)', 'rgba(202,211,245,.17)', '#eed49f', '#ed8796', '#a6da95', '#8aadf4', '#c6a0f6'),
  communityTheme('catppuccin-frappe', 'Catppuccin Frappe', 'dark', 'catppuccin', '#303446', '#c6d0f5', '#a5adce', '#626880', 'rgba(198,208,245,.08)', 'rgba(198,208,245,.17)', '#e5c890', '#e78284', '#a6d189', '#8caaee', '#ca9ee6'),
  communityTheme('catppuccin-latte', 'Catppuccin Latte', 'light', 'catppuccin', '#eff1f5', '#4c4f69', '#6c6f85', '#9ca0b0', 'rgba(76,79,105,.10)', 'rgba(76,79,105,.22)', '#df8e1d', '#d20f39', '#40a02b', '#1e66f5', '#7287fd'),
  communityTheme('nord', 'Nord', 'dark', '#2e3440', '#d8dee9', '#81a1c1', '#4c566a', 'rgba(216,222,233,.09)', 'rgba(216,222,233,.19)', '#ebcb8b', '#bf616a', '#a3be8c', '#81a1c1', '#5e81ac'),
  communityTheme('tokyonight-night', 'Tokyo Night', 'dark', '#1a1b26', '#c0caf5', '#a9b1d6', '#565f89', 'rgba(192,202,245,.08)', 'rgba(192,202,245,.17)', '#e0af68', '#f7768e', '#9ece6a', '#7aa2f7', '#bb9af7'),
  communityTheme('tokyonight-storm', 'Tokyo Night Storm', 'dark', '#24283b', '#c0caf5', '#a9b1d6', '#565f89', 'rgba(192,202,245,.09)', 'rgba(192,202,245,.18)', '#e0af68', '#f7768e', '#9ece6a', '#7aa2f7', '#bb9af7'),
  communityTheme('tokyonight-moon', 'Tokyo Night Moon', 'dark', '#222436', '#c8d3f5', '#a9b8e8', '#636da6', 'rgba(200,211,245,.08)', 'rgba(200,211,245,.17)', '#ffc777', '#ff757f', '#c3e88d', '#82aaff', '#c099ff'),
  communityTheme('tokyonight-day', 'Tokyo Night Day', 'light', '#e1e2e7', '#3760bf', '#6172b0', '#9699a3', 'rgba(55,96,191,.10)', 'rgba(55,96,191,.22)', '#8c6c3e', '#f52a65', '#587539', '#2e7de9', '#7847bd'),
  communityTheme('rose-pine', 'Rose Pine', 'dark', '#191724', '#e0def4', '#908caa', '#6e6a86', 'rgba(224,222,244,.08)', 'rgba(224,222,244,.17)', '#f6c177', '#eb6f92', '#31748f', '#9ccfd8', '#c4a7e7'),
  communityTheme('rose-pine-moon', 'Rose Pine Moon', 'dark', '#232136', '#e0def4', '#908caa', '#6e6a86', 'rgba(224,222,244,.08)', 'rgba(224,222,244,.17)', '#f6c177', '#eb6f92', '#3e8fb0', '#9ccfd8', '#c4a7e7'),
  communityTheme('rose-pine-dawn', 'Rose Pine Dawn', 'light', '#faf4ed', '#575279', '#797593', '#9893a5', 'rgba(87,82,121,.10)', 'rgba(87,82,121,.22)', '#ea9d34', '#b4637a', '#286983', '#56949f', '#907aa9'),
  communityTheme('solarized-dark', 'Solarized Dark', 'dark', '#002b36', '#839496', '#657b83', '#586e75', 'rgba(131,148,150,.10)', 'rgba(131,148,150,.22)', '#b58900', '#dc322f', '#859900', '#268bd2', '#6c71c4'),
  communityTheme('solarized-light', 'Solarized Light', 'light', '#fdf6e3', '#657b83', '#839496', '#93a1a1', 'rgba(101,123,131,.10)', 'rgba(101,123,131,.22)', '#b58900', '#dc322f', '#859900', '#268bd2', '#6c71c4'),
  communityTheme('one-dark', 'One Dark', 'dark', '#282c34', '#abb2bf', '#828997', '#5c6370', 'rgba(171,178,191,.09)', 'rgba(171,178,191,.19)', '#e5c07b', '#e06c75', '#98c379', '#61afef', '#c678dd'),
  communityTheme('one-light', 'One Light', 'light', '#fafafa', '#383a42', '#696c77', '#a0a1a7', 'rgba(56,58,66,.10)', 'rgba(56,58,66,.22)', '#986801', '#ca1243', '#50a14f', '#4078f2', '#a626a4'),
  communityTheme('monokai', 'Monokai', 'dark', '#272822', '#f8f8f2', '#cfcfc2', '#75715e', 'rgba(248,248,242,.09)', 'rgba(248,248,242,.19)', '#e6db74', '#f92672', '#a6e22e', '#66d9e8', '#ae81ff'),
  communityTheme('monokai-pro', 'Monokai Pro', 'dark', '#2d2a2e', '#fcfcfa', '#c1c0c0', '#727072', 'rgba(252,252,250,.09)', 'rgba(252,252,250,.18)', '#ffd866', '#ff6188', '#a9dc76', '#78dce8', '#ab9df2'),
  communityTheme('everforest-dark-hard', 'Everforest Dark Hard', 'dark', '#1e2326', '#d3c6aa', '#9da9a0', '#5c6a72', 'rgba(211,198,170,.09)', 'rgba(211,198,170,.18)', '#dbbc7f', '#e67e80', '#a7c080', '#7fbbb3', '#d699b6'),
  communityTheme('everforest-dark-medium', 'Everforest Dark', 'dark', '#272e33', '#d3c6aa', '#9da9a0', '#5c6a72', 'rgba(211,198,170,.09)', 'rgba(211,198,170,.18)', '#dbbc7f', '#e67e80', '#a7c080', '#7fbbb3', '#d699b6'),
  communityTheme('everforest-light', 'Everforest Light', 'light', '#fdf6e3', '#5c6a72', '#829181', '#a6b0a0', 'rgba(92,106,114,.10)', 'rgba(92,106,114,.22)', '#dfa000', '#f85552', '#8da101', '#3a94c5', '#df69ba'),
  communityTheme('kanagawa-wave', 'Kanagawa Wave', 'dark', '#1f1f28', '#dcd7ba', '#a3a08b', '#54546d', 'rgba(220,215,186,.08)', 'rgba(220,215,186,.18)', '#dca561', '#c34043', '#76946a', '#7e9cd8', '#957fb8'),
  communityTheme('kanagawa-lotus', 'Kanagawa Lotus', 'light', '#f2ecbc', '#43436c', '#717c7c', '#a09eac', 'rgba(67,67,108,.10)', 'rgba(67,67,108,.22)', '#a96832', '#c84053', '#6f894e', '#4d699b', '#624c83'),
  communityTheme('material-darker', 'Material Darker', 'dark', '#212121', '#eeffff', '#b0bec5', '#546e7a', 'rgba(238,255,255,.08)', 'rgba(238,255,255,.17)', '#ffcb6b', '#f07178', '#c3e88d', '#82aaff', '#c792ea'),
  communityTheme('material-ocean', 'Material Ocean', 'dark', '#0f111a', '#8f93a2', '#717cb4', '#464b5d', 'rgba(143,147,162,.08)', 'rgba(143,147,162,.17)', '#ffcb6b', '#f07178', '#c3e88d', '#82aaff', '#c792ea'),
  communityTheme('material-lighter', 'Material Lighter', 'light', '#fafafa', '#80cbc4', '#546e7a', '#b0bec5', 'rgba(84,110,122,.10)', 'rgba(84,110,122,.22)', '#e2931d', '#e53935', '#91b859', '#6182b8', '#7c4dff'),
  communityTheme('palenight', 'Palenight', 'dark', '#292d3e', '#a6accd', '#676e95', '#4b5263', 'rgba(166,172,205,.08)', 'rgba(166,172,205,.17)', '#ffcb6b', '#f07178', '#c3e88d', '#82aaff', '#c792ea'),
  communityTheme('ayu-dark', 'Ayu Dark', 'dark', '#0a0e14', '#b3b1ad', '#626a73', '#3d4354', 'rgba(179,177,173,.08)', 'rgba(179,177,173,.17)', '#e6b450', '#ff3333', '#91b362', '#36a3d9', '#6994bf'),
  communityTheme('ayu-mirage', 'Ayu Mirage', 'dark', '#1f2430', '#cbccc6', '#707a8c', '#3d4354', 'rgba(203,204,198,.08)', 'rgba(203,204,198,.17)', '#ffd580', '#ff3333', '#bae67e', '#5ccfe6', '#a37acc'),
  communityTheme('ayu-light', 'Ayu Light', 'light', '#fafafa', '#575f66', '#8a9199', '#abb0b6', 'rgba(87,95,102,.10)', 'rgba(87,95,102,.22)', '#a37820', '#f07171', '#86b300', '#399ee6', '#a37acc'),
  communityTheme('selenized-dark', 'Selenized Dark', 'dark', '#103c48', '#adbcbc', '#72898a', '#184956', 'rgba(173,188,188,.09)', 'rgba(173,188,188,.19)', '#dbb32d', '#fa5750', '#75b938', '#4695f7', '#41a8b5'),
  communityTheme('selenized-black', 'Selenized Black', 'dark', '#181818', '#b9b9b9', '#777777', '#3b3b3b', 'rgba(185,185,185,.09)', 'rgba(185,185,185,.18)', '#dbb32d', '#ed4a46', '#70b433', '#368aeb', '#3fc5b7'),
  communityTheme('selenized-light', 'Selenized Light', 'light', '#fbf3db', '#53676d', '#3a4d53', '#909995', 'rgba(83,103,109,.10)', 'rgba(83,103,109,.22)', '#a78300', '#d2212d', '#489100', '#0072d4', '#007389'),
  communityTheme('nightfox', 'Nightfox', 'dark', '#192330', '#cdcecf', '#738091', '#3b4252', 'rgba(205,206,207,.08)', 'rgba(205,206,207,.17)', '#f4a261', '#c94f6d', '#81b29a', '#719cd6', '#9d79d6'),
  communityTheme('dayfox', 'Dayfox', 'light', '#e4dcd4', '#3d2b5e', '#824d5b', '#b1a6b1', 'rgba(61,43,94,.10)', 'rgba(61,43,94,.22)', '#a440b5', '#c94f6d', '#4d8c72', '#4154a9', '#6d6a59'),
  communityTheme('modus-vivendi', 'Modus Vivendi', 'dark', '#000000', '#ffffff', '#a8a8a8', '#6a6a6a', 'rgba(255,255,255,.10)', 'rgba(255,255,255,.22)', '#e0c05e', '#ff8059', '#44bc44', '#79a8ff', '#b6a0ff'),
  communityTheme('modus-operandi', 'Modus Operandi', 'light', '#ffffff', '#000000', '#505050', '#a0a0a0', 'rgba(0,0,0,.10)', 'rgba(0,0,0,.22)', '#7d500a', '#a60000', '#005f00', '#0030a6', '#5f3ecf'),
];

export const defaultThemeId = 'concrete-light';

export const isThemeId = (value: string | null): value is string => themes.some((theme) => theme.id === value);

export const themeVariantForMode = (themeId: string, mode: ThemeMode) => {
  const currentTheme = themes.find((theme) => theme.id === themeId);
  if (!currentTheme) {
    return undefined;
  }

  return themes.find((theme) => theme.family === currentTheme.family && theme.mode === mode);
};

export const themeStyle = (theme: ThemeDefinition) =>
  ({
    '--bg': theme.tokens.bg,
    '--ink': theme.tokens.ink,
    '--ink-2': theme.tokens.ink2,
    '--ink-3': theme.tokens.ink3,
    '--line': theme.tokens.line,
    '--line-s': theme.tokens.lineS,
    '--color-active': theme.tokens.active,
    '--color-danger': theme.tokens.danger,
    '--color-success': theme.tokens.success,
    '--color-pending': theme.tokens.pending,
    '--color-special': theme.tokens.special,
    colorScheme: theme.mode,
  }) as React.CSSProperties;
