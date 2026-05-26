export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const cleaned = hex.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return null;

  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslString(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`;
}

export function hexToHslString(hex: string): string | null {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;
  return hslString(hsl.h, hsl.s, hsl.l);
}

export function isValidHex(hex: string): boolean {
  return /^#?[0-9A-Fa-f]{6}$/.test(hex.trim());
}

export function normalizeHex(hex: string): string {
  const cleaned = hex.trim().replace("#", "");
  return `#${cleaned.toUpperCase()}`;
}

export function getLuminance(hex: string): number {
  const hsl = hexToHsl(hex);
  if (!hsl) return 0;
  return hsl.l;
}

export function getContrastColor(hex: string): string {
  const lum = getLuminance(hex);
  return lum > 55 ? "#1a1a1a" : "#ffffff";
}

export type ColourRole =
  | "background"
  | "surface"
  | "sidebar"
  | "primary"
  | "accent"
  | "headingText"
  | "text"
  | "navText"
  | "muted"
  | "inputBg"
  | "inputText"
  | "dropdownBg"
  | "dropdownText"
  | "modalBg"
  | "modalText";

export const COLOUR_ROLE_LABELS: Record<ColourRole, string> = {
  background: "Page Background",
  surface: "Card / Surface",
  sidebar: "Sidebar",
  primary: "Primary Action",
  accent: "Accent / Highlight",
  headingText: "Heading Text",
  text: "Body Text",
  navText: "Nav / Sidebar Text",
  muted: "Muted / Caption Text",
  inputBg: "Input Field Background",
  inputText: "Input Field Text",
  dropdownBg: "Dropdown Background",
  dropdownText: "Dropdown Text",
  modalBg: "Modal Background",
  modalText: "Modal Text",
};

export const COLOUR_ROLE_DESCRIPTIONS: Record<ColourRole, string> = {
  background: "Main page background colour",
  surface: "Cards, panels, and raised surfaces",
  sidebar: "Navigation sidebar background",
  primary: "Buttons, links, and primary CTAs",
  accent: "Badges, highlights, and secondary actions",
  headingText: "Page titles and section headings",
  text: "Primary body and paragraph text",
  navText: "Text inside the sidebar/nav — auto-contrasts with sidebar",
  muted: "Captions, placeholders, and secondary labels",
  inputBg: "Search bars, text inputs, and form fields background",
  inputText: "Text typed inside input fields and form elements",
  dropdownBg: "Background of dropdown menus and select lists",
  dropdownText: "Text inside dropdown menus and select lists",
  modalBg: "Background of modal dialogs and overlays",
  modalText: "Primary text inside modal dialogs",
};

export const DEFAULT_ROLES: ColourRole[] = [
  "background",
  "surface",
  "sidebar",
  "primary",
  "accent",
  "headingText",
  "text",
  "navText",
  "muted",
  "inputBg",
  "inputText",
  "dropdownBg",
  "dropdownText",
  "modalBg",
  "modalText",
];

export type ColourMap = Record<ColourRole, string>;

export function buildColourMap(colours: string[], roles: ColourRole[]): ColourMap {
  const map: Partial<ColourMap> = {};
  roles.forEach((role, i) => {
    map[role] = colours[i % colours.length] ?? "#888888";
  });
  return map as ColourMap;
}

/** Returns "#ffffff" or "#111111" whichever contrasts better with bgHex. */
function autoNavText(bgHex: string): string {
  const lum = getLuminance(bgHex);
  return lum > 50 ? "#111111" : "#ffffff";
}

function fisherYates<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Shuffles colours while respecting the current mode.
 */
export function shuffleSmartColourMap(colours: string[], mode: ColourMode): ColourMap {
  if (colours.length === 0) return buildColourMap(FALLBACK_COLOURS, DEFAULT_ROLES);

  const scored = scoredColours(colours);
  const byLum = [...scored].sort((a, b) => a.luminance - b.luminance);

  let bgPool: ScoredColour[];
  let textPool: ScoredColour[];

  if (mode === "dark") {
    bgPool = byLum.slice(0, Math.ceil(byLum.length / 2));
    textPool = byLum.slice(Math.ceil(byLum.length / 2));
  } else {
    bgPool = byLum.slice(Math.floor(byLum.length / 2));
    textPool = byLum.slice(0, Math.floor(byLum.length / 2));
  }

  const bySat = [...scored].sort((a, b) => b.saturation - a.saturation);
  const vibrantPool = bySat.slice(0, 2);

  const shuffledBg = fisherYates(bgPool);
  const shuffledText = fisherYates(textPool);
  const shuffledVibrant = fisherYates(vibrantPool);
  const fallback = [...scored];

  function pick(pool: ScoredColour[], fb: ScoredColour[]): string {
    const c = pool.shift();
    if (c) return c.hex;
    const f = fb.shift();
    return f?.hex ?? colours[0];
  }

  const bg = pick(shuffledBg, fallback);
  const surface = pick(shuffledBg, [...scored]);
  const sidebar = pick(shuffledBg, [...scored]);

  const primary = pick(shuffledVibrant, [...scored]);
  const accent = pick(shuffledVibrant, [...scored]);

  const headingText = pick(shuffledText, [...scored]);
  const text = pick(shuffledText, [...scored]);
  const navText = autoNavText(sidebar);
  const muted = pick(shuffledText, [...scored]);
  const inputBg = shuffledBg.length > 0 ? pick(shuffledBg, [...scored]) : surface;
  const inputText = shuffledText.length > 0 ? pick(shuffledText, [...scored]) : text;
  const dropdownBg = shuffledBg.length > 0 ? pick(shuffledBg, [...scored]) : surface;
  const dropdownText = shuffledText.length > 0 ? pick(shuffledText, [...scored]) : text;
  const modalBg = shuffledBg.length > 0 ? pick(shuffledBg, [...scored]) : surface;
  const modalText = shuffledText.length > 0 ? pick(shuffledText, [...scored]) : text;

  return {
    background: bg, surface, sidebar, primary, accent,
    headingText, text, navText, muted,
    inputBg, inputText,
    dropdownBg, dropdownText,
    modalBg, modalText,
  };
}

export const FALLBACK_COLOURS = [
  "#1E293B",
  "#FFFFFF",
  "#F1F5F9",
  "#6366F1",
  "#22D3EE",
  "#0F172A",
  "#94A3B8",
];

export type ColourMode = "light" | "dark";

interface ScoredColour {
  hex: string;
  luminance: number;
  saturation: number;
}

function scoredColours(colours: string[]): ScoredColour[] {
  return colours.map((hex) => {
    const hsl = hexToHsl(hex);
    return {
      hex,
      luminance: hsl?.l ?? 50,
      saturation: hsl?.s ?? 0,
    };
  });
}

/**
 * Intelligently assigns UI roles from a palette based on the target mode.
 */
export function buildSmartColourMap(colours: string[], mode: ColourMode): ColourMap {
  if (colours.length === 0) return buildColourMap(FALLBACK_COLOURS, DEFAULT_ROLES);

  const scored = scoredColours(colours);
  const byLum = [...scored].sort((a, b) => a.luminance - b.luminance);

  let backgrounds: ScoredColour[];
  let texts: ScoredColour[];

  if (mode === "dark") {
    backgrounds = byLum.slice(0, Math.ceil(byLum.length / 2));
    texts = byLum.slice(Math.ceil(byLum.length / 2));
  } else {
    backgrounds = byLum.slice(Math.floor(byLum.length / 2));
    texts = byLum.slice(0, Math.floor(byLum.length / 2));
  }

  const bySat = [...scored].sort((a, b) => b.saturation - a.saturation);

  function pick(pool: ScoredColour[], fallback: ScoredColour[]): string {
    const candidate = pool.shift();
    if (candidate) return candidate.hex;
    const fb = fallback.shift();
    return fb?.hex ?? colours[0];
  }

  const vibrantPool = [...bySat];

  const bgPool = mode === "dark"
    ? [...backgrounds].sort((a, b) => a.luminance - b.luminance)
    : [...backgrounds].sort((a, b) => b.luminance - a.luminance);

  const textPool = mode === "dark"
    ? [...texts].sort((a, b) => b.luminance - a.luminance)
    : [...texts].sort((a, b) => a.luminance - b.luminance);

  const bg = pick(bgPool, [...scored]);
  const surface = bgPool.length > 0 ? pick(bgPool, [...scored]) : bg;
  const sidebar = bgPool.length > 0 ? pick(bgPool, [...scored]) : bg;

  const primary = pick(vibrantPool, [...scored]);
  const accent = pick(vibrantPool, [...scored]);

  const headingText = pick(textPool, [...scored]);
  const text = textPool.length > 0 ? pick(textPool, [...scored]) : headingText;
  const navText = autoNavText(sidebar);
  const muted = textPool.length > 0 ? pick(textPool, [...scored]) : text;
  const inputBg = bgPool.length > 0 ? pick(bgPool, [...scored]) : surface;
  const inputText = textPool.length > 0 ? pick(textPool, [...scored]) : text;
  const dropdownBg = bgPool.length > 0 ? pick(bgPool, [...scored]) : surface;
  const dropdownText = textPool.length > 0 ? pick(textPool, [...scored]) : text;
  const modalBg = bgPool.length > 0 ? pick(bgPool, [...scored]) : surface;
  const modalText = textPool.length > 0 ? pick(textPool, [...scored]) : text;

  return {
    background: bg, surface, sidebar, primary, accent,
    headingText, text, navText, muted,
    inputBg, inputText,
    dropdownBg, dropdownText,
    modalBg, modalText,
  };
}
