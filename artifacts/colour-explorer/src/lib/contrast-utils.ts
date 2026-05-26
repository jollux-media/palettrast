import { hexToHsl } from "./colour-utils";

// ─── WCAG contrast math ─────────────────────────────────────────────────────

function linearize(c: number): number {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function hexToRelativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length !== 6) return 0;
  const r = linearize(parseInt(h.slice(0, 2), 16) / 255);
  const g = linearize(parseInt(h.slice(2, 4), 16) / 255);
  const b = linearize(parseInt(h.slice(4, 6), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = hexToRelativeLuminance(hex1);
  const l2 = hexToRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type WcagGrade = "AAA" | "AA" | "AA Large" | "Fail";

export function wcagGrade(ratio: number): WcagGrade {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}

// ─── HSL ↔ Hex helpers ──────────────────────────────────────────────────────

export function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// ─── Colour suggestions ──────────────────────────────────────────────────────

/**
 * Adjust the foreground colour's lightness until it achieves targetRatio
 * against the given background. Returns the fixed hex, or null if it was
 * already passing.
 */
export function suggestFixedForeground(
  fgHex: string,
  bgHex: string,
  targetRatio = 4.5
): string | null {
  const ratio = contrastRatio(fgHex, bgHex);
  if (ratio >= targetRatio) return null; // already passing

  const hsl = hexToHsl(fgHex);
  if (!hsl) return null;

  const bgLum = hexToRelativeLuminance(bgHex);
  const isDarkBg = bgLum < 0.18;

  // Walk lightness in the direction that improves contrast
  const direction = isDarkBg ? 1 : -1;
  let l = hsl.l;

  for (let i = 0; i < 101; i++) {
    l = Math.max(0, Math.min(100, l + direction));
    const candidate = hslToHex(hsl.h, hsl.s, l);
    if (contrastRatio(candidate, bgHex) >= targetRatio) {
      return candidate;
    }
  }
  return isDarkBg ? "#FFFFFF" : "#000000";
}

/**
 * Adjust the background colour's lightness until it achieves targetRatio
 * against the given foreground. Returns the fixed hex, or null if it was
 * already passing.
 */
export function suggestFixedBackground(
  fgHex: string,
  bgHex: string,
  targetRatio = 4.5
): string | null {
  const ratio = contrastRatio(fgHex, bgHex);
  if (ratio >= targetRatio) return null; // already passing

  const hsl = hexToHsl(bgHex);
  if (!hsl) return null;

  const fgLum = hexToRelativeLuminance(fgHex);
  // If fg is dark, lighten bg; if fg is light, darken bg
  const direction = fgLum < 0.18 ? 1 : -1;
  let l = hsl.l;

  for (let i = 0; i < 101; i++) {
    l = Math.max(0, Math.min(100, l + direction));
    const candidate = hslToHex(hsl.h, hsl.s, l);
    if (contrastRatio(fgHex, candidate) >= targetRatio) {
      return candidate;
    }
  }
  return fgLum < 0.18 ? "#FFFFFF" : "#000000";
}

/**
 * Generate 4 new colours that fit the palette's dominant hue "vibe"
 * and would contrast well with the given background.
 */
export function suggestVibeColours(
  paletteHexes: string[],
  bgHex: string
): string[] {
  if (paletteHexes.length === 0) return [];

  // Find dominant hue: weighted average by saturation
  let totalWeight = 0;
  let hueSum = 0;
  let avgSat = 0;

  for (const hex of paletteHexes) {
    const hsl = hexToHsl(hex);
    if (!hsl || hsl.s < 10) continue; // skip near-greys
    const w = hsl.s;
    hueSum += hsl.h * w;
    avgSat += hsl.s * w;
    totalWeight += w;
  }

  if (totalWeight === 0) return [];

  const dominantHue = Math.round(hueSum / totalWeight);
  const baseSat = Math.round(Math.min(90, (avgSat / totalWeight) * 1.1));

  const bgLum = hexToRelativeLuminance(bgHex);
  const isDarkBg = bgLum < 0.18;

  // Candidate lightness values that might achieve good contrast
  const lightnessCandidates = isDarkBg
    ? [75, 65, 80, 55, 85, 45]
    : [25, 35, 20, 45, 15, 55];

  const results: string[] = [];
  const seen = new Set(paletteHexes.map((h) => h.toUpperCase()));

  for (const l of lightnessCandidates) {
    if (results.length >= 4) break;
    const hex = hslToHex(dominantHue, baseSat, l);
    const ratio = contrastRatio(hex, bgHex);
    if (ratio >= 4.5 && !seen.has(hex)) {
      results.push(hex);
      seen.add(hex);
    }
  }

  // Also try analogous hues (+30, -30) if we need more
  for (const hueOffset of [30, -30, 60, -60]) {
    if (results.length >= 4) break;
    const h = (dominantHue + hueOffset + 360) % 360;
    for (const l of lightnessCandidates.slice(0, 3)) {
      if (results.length >= 4) break;
      const hex = hslToHex(h, baseSat, l);
      const ratio = contrastRatio(hex, bgHex);
      if (ratio >= 4.5 && !seen.has(hex)) {
        results.push(hex);
        seen.add(hex);
      }
    }
  }

  return results;
}

// ─── Pair definitions ────────────────────────────────────────────────────────

export interface ContrastPair {
  label: string;
  fg: string;
  bg: string;
  fgRole: string;
  bgRole: string;
}

export interface ContrastResult extends ContrastPair {
  ratio: number;
  grade: WcagGrade;
  suggestion: string | null;
  bgSuggestion: string | null;
}

import type { ColourMap } from "./colour-utils";

function bestTextOn(bgHex: string): string {
  return contrastRatio("#FFFFFF", bgHex) >= contrastRatio("#111111", bgHex) ? "#FFFFFF" : "#111111";
}

export function buildContrastPairs(map: ColourMap): ContrastPair[] {
  const primaryText = bestTextOn(map.primary);
  const accentText = bestTextOn(map.accent);
  return [
    { label: "Heading text on background", fg: map.headingText, bg: map.background, fgRole: "headingText", bgRole: "background" },
    { label: "Heading text on surface", fg: map.headingText, bg: map.surface, fgRole: "headingText", bgRole: "surface" },
    { label: "Body text on background", fg: map.text, bg: map.background, fgRole: "text", bgRole: "background" },
    { label: "Body text on surface", fg: map.text, bg: map.surface, fgRole: "text", bgRole: "surface" },
    { label: "Muted text on background", fg: map.muted, bg: map.background, fgRole: "muted", bgRole: "background" },
    { label: "Nav text on sidebar", fg: map.navText, bg: map.sidebar, fgRole: "navText", bgRole: "sidebar" },
    { label: "Primary button text", fg: primaryText, bg: map.primary, fgRole: "primaryText", bgRole: "primary" },
    { label: "Accent button text", fg: accentText, bg: map.accent, fgRole: "accentText", bgRole: "accent" },
  ];
}

export function evaluatePairs(pairs: ContrastPair[]): ContrastResult[] {
  return pairs.map((pair) => {
    const ratio = contrastRatio(pair.fg, pair.bg);
    return {
      ...pair,
      ratio,
      grade: wcagGrade(ratio),
      suggestion: suggestFixedForeground(pair.fg, pair.bg),
      bgSuggestion: suggestFixedBackground(pair.fg, pair.bg),
    };
  });
}
