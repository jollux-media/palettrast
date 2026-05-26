import React, { useState, useEffect, useRef } from "react";
import { useColours } from "@/lib/colour-context";
import {
  buildContrastPairs,
  evaluatePairs,
  contrastRatio,
  wcagGrade,
  hslToHex,
  type ContrastResult,
  type WcagGrade,
} from "@/lib/contrast-utils";
import { hexToHsl } from "@/lib/colour-utils";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────

const NEU_BG = "#E8ECF1";
const NEU_SHADOW = "6px 6px 14px rgba(0,0,0,0.10), -6px -6px 14px rgba(255,255,255,0.85)";

// ─── Shared grade config ──────────────────────────────────────────────────────

const GRADE_CONFIG: Record<WcagGrade, { icon: typeof CheckCircle2; color: string; bg: string; label: string; tooltip: string }> = {
  AAA: {
    icon: CheckCircle2, color: "#16A34A", bg: "#DCFCE7", label: "AAA",
    tooltip: "WCAG AAA — ratio ≥ 7:1. The highest standard. Passes for all text sizes and weights.",
  },
  AA: {
    icon: CheckCircle2, color: "#2563EB", bg: "#DBEAFE", label: "AA",
    tooltip: "WCAG AA — ratio ≥ 4.5:1. Passes for normal body text (< 18 pt or < 14 pt bold).",
  },
  "AA Large": {
    icon: AlertTriangle, color: "#D97706", bg: "#FEF3C7", label: "AA Large",
    tooltip: "WCAG AA Large — ratio ≥ 3:1. Only passes for large text (≥ 18 pt or ≥ 14 pt bold). Too low for body copy.",
  },
  Fail: {
    icon: XCircle, color: "#DC2626", bg: "#FEE2E2", label: "Fail",
    tooltip: "Fails WCAG — ratio < 3:1. Not accessible at any text size.",
  },
};

function GradeBadge({ grade }: { grade: WcagGrade }) {
  const { icon: Icon, color, bg, label, tooltip } = GRADE_CONFIG[grade];
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="relative shrink-0"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span
        className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 cursor-default"
        style={{ backgroundColor: bg, color }}
      >
        <Icon size={10} />
        {label}
      </span>
      {visible && (
        <span
          className="absolute z-50 bottom-full right-0 mb-1.5 w-56 rounded-lg px-3 py-2 text-xs text-white leading-snug pointer-events-none"
          style={{ backgroundColor: "#1E293B", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}
        >
          {tooltip}
          <span
            className="absolute top-full right-3 border-4 border-transparent"
            style={{ borderTopColor: "#1E293B" }}
          />
        </span>
      )}
    </span>
  );
}

// ─── Fix suggestion row ───────────────────────────────────────────────────────

function FixRow({
  label,
  hex,
  onAdd,
  onReplace,
}: {
  label: string;
  hex: string;
  onAdd: () => void;
  onReplace: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 shrink-0 w-28">{label} →</span>
      <div
        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
        style={{ backgroundColor: hex }}
      />
      <span className="text-xs font-mono text-gray-500 flex-1 truncate">{hex}</span>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs font-medium rounded-md px-2 py-0.5 transition-colors"
          style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
          title="Add to palette"
        >
          <Plus size={9} /> Add
        </button>
        <button
          onClick={onReplace}
          className="flex items-center gap-1 text-xs font-medium rounded-md px-2 py-0.5 border border-gray-200 transition-colors hover:bg-gray-50"
          style={{ color: "#374151" }}
          title="Replace in palette"
        >
          <RefreshCw size={9} /> Replace
        </button>
      </div>
    </div>
  );
}

// ─── Contrast pair row ────────────────────────────────────────────────────────

function ContrastRow({ result }: { result: ContrastResult }) {
  const { colours, setColours } = useColours();
  const needsFix = result.grade === "Fail" || result.grade === "AA Large";

  function addColour(hex: string) {
    const upper = hex.toUpperCase();
    if (!colours.includes(upper)) setColours([...colours, upper]);
  }

  function replaceColour(original: string, replacement: string) {
    const origUpper = original.toUpperCase();
    const found = colours.some((c) => c.toUpperCase() === origUpper);
    if (found) {
      setColours(colours.map((c) => (c.toUpperCase() === origUpper ? replacement : c)));
    } else {
      addColour(replacement);
    }
  }

  return (
    <div
      className="rounded-xl border border-gray-100 p-4 space-y-3"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      {/* Line 1: colour swatches + full-width label */}
      <div className="flex items-center gap-3">
        <div className="flex items-center flex-shrink-0">
          <div
            className="w-6 h-6 rounded-full border border-black/10"
            style={{ backgroundColor: result.bg }}
          />
          <div
            className="w-6 h-6 rounded-full border border-black/10 -ml-2"
            style={{ backgroundColor: result.fg }}
          />
        </div>
        <p className="flex-1 text-sm font-medium text-gray-700 leading-snug">{result.label}</p>
      </div>

      {/* Line 2: ratio + grade badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-gray-400">{result.ratio.toFixed(2)}:1</span>
        <GradeBadge grade={result.grade} />
      </div>

      {/* Fix rows — only for failing/borderline pairs */}
      {needsFix && (result.suggestion || result.bgSuggestion) && (
        <div className="space-y-2.5 pt-2 border-t border-gray-100">
          {result.bgSuggestion && (
            <FixRow
              label="Fix background"
              hex={result.bgSuggestion}
              onAdd={() => addColour(result.bgSuggestion!)}
              onReplace={() => replaceColour(result.bg, result.bgSuggestion!)}
            />
          )}
          {result.suggestion && (
            <FixRow
              label="Fix foreground"
              hex={result.suggestion}
              onAdd={() => addColour(result.suggestion!)}
              onReplace={() => replaceColour(result.fg, result.suggestion!)}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Accordion card wrapper ───────────────────────────────────────────────────

function AccordionCard({
  title,
  description,
  defaultOpen = false,
  children,
  headerExtra,
}: {
  title: string;
  description: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: NEU_BG, boxShadow: NEU_SHADOW }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-6 pt-5 pb-4 text-center relative"
        style={{ cursor: "pointer" }}
      >
        <h2 className="text-base font-bold text-gray-900 tracking-tight">{title}</h2>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
        {headerExtra && <div className="mt-2">{headerExtra}</div>}
        <ChevronDown
          size={14}
          className="absolute right-5 top-5 text-gray-400 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {/* CSS grid trick for smooth height animation without knowing content height */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 0.2s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div
            className="px-5 pb-5 pt-4"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Colour Lab ───────────────────────────────────────────────────────────────

type LabRole = "Foreground" | "Background" | "Text";

const ROLE_DESC: Record<LabRole, string> = {
  Foreground: "Anchor is the foreground — others rated as backgrounds",
  Background: "Anchor is the background — others rated as foregrounds",
  Text: "Anchor is text — rate each other colour as its background",
};

function ColourLab() {
  const { colours, colourMap, setColours, assignRole } = useColours();
  const [anchorIdx, setAnchorIdx] = useState(0);
  const [role, setRole] = useState<LabRole>("Foreground");
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(50);
  const [lit, setLit] = useState(50);
  const [added, setAdded] = useState(false);
  const [replaced, setReplaced] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);

  // Track the last hex that was pushed into colourMap so subsequent slider
  // moves can find and replace it (originalHex stops matching after the first drag).
  const lastAppliedRef = useRef<string | null>(null);
  // Track which anchor was previously selected so we can revert on switch.
  const prevSafeIdxRef = useRef(0);

  const safeIdx = Math.min(anchorIdx, Math.max(0, colours.length - 1));

  useEffect(() => {
    const prevIdx = prevSafeIdxRef.current;
    const anchorChanged = prevIdx !== safeIdx;

    // If the user switched to a different anchor without saving (Add/Replace),
    // revert the colourMap entries back to the original palette colour.
    if (anchorChanged && lastAppliedRef.current !== null) {
      const revertTo = colours[prevIdx];
      if (revertTo) {
        const searchHex = lastAppliedRef.current;
        (Object.entries(colourMap) as [string, string][])
          .filter(([, v]) => v.toUpperCase() === searchHex.toUpperCase())
          .forEach(([r]) => assignRole(r as any, revertTo.toUpperCase()));
      }
    }

    prevSafeIdxRef.current = safeIdx;
    lastAppliedRef.current = null;
    const hsl = hexToHsl(colours[safeIdx] ?? "#888888");
    if (hsl) { setHue(hsl.h); setSat(hsl.s); setLit(hsl.l); }
  }, [safeIdx, colours]);

  const adjustedHex = hslToHex(hue, sat, lit);
  const originalHex = colours[safeIdx] ?? "#888888";

  function applyPreview(newHex: string) {
    // Search colourMap for whichever hex was last applied (or the original
    // palette colour on the very first drag). This keeps the mockup in sync
    // across multiple consecutive slider moves.
    const searchHex = (lastAppliedRef.current ?? originalHex).toUpperCase();
    const upper = newHex.toUpperCase();
    (Object.entries(colourMap) as [string, string][])
      .filter(([, v]) => v.toUpperCase() === searchHex)
      .forEach(([r]) => assignRole(r as any, upper));
    lastAppliedRef.current = upper;
  }

  function flash(setter: React.Dispatch<React.SetStateAction<boolean>>) {
    setter(true);
    setTimeout(() => setter(false), 1600);
  }

  function addToPalette() {
    const upper = adjustedHex.toUpperCase();
    if (!colours.includes(upper)) setColours([...colours, upper]);
    flash(setAdded);
  }

  function replaceOriginal() {
    setColours(colours.map((c, i) => i === safeIdx ? adjustedHex : c));
    flash(setReplaced);
  }

  const otherColours = colours.filter((_, i) => i !== safeIdx);

  function colourPair(other: string): { fg: string; bg: string } {
    return role === "Background"
      ? { fg: other, bg: adjustedHex }
      : { fg: adjustedHex, bg: other };
  }

  const sliders = [
    {
      label: "Hue", value: hue, min: 0, max: 360, unit: "°",
      bg: `linear-gradient(to right, hsl(0,${sat}%,${lit}%), hsl(60,${sat}%,${lit}%), hsl(120,${sat}%,${lit}%), hsl(180,${sat}%,${lit}%), hsl(240,${sat}%,${lit}%), hsl(300,${sat}%,${lit}%), hsl(360,${sat}%,${lit}%))`,
      onChange: (v: number) => { setHue(v); applyPreview(hslToHex(v, sat, lit)); },
    },
    {
      label: "Saturation", value: sat, min: 0, max: 100, unit: "%",
      bg: `linear-gradient(to right, hsl(${hue},0%,${lit}%), hsl(${hue},100%,${lit}%))`,
      onChange: (v: number) => { setSat(v); applyPreview(hslToHex(hue, v, lit)); },
    },
    {
      label: "Lightness", value: lit, min: 0, max: 100, unit: "%",
      bg: `linear-gradient(to right, hsl(${hue},${sat}%,0%), hsl(${hue},${sat}%,50%), hsl(${hue},${sat}%,100%))`,
      onChange: (v: number) => { setLit(v); applyPreview(hslToHex(hue, sat, v)); },
    },
  ];

  return (
    <div className="space-y-5">
      {/* Anchor selector */}
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-2.5">Select anchor colour</p>
        <div className="flex flex-wrap gap-2">
          {colours.map((c, i) => (
            <button key={i} onClick={() => setAnchorIdx(i)}
              className="flex flex-col items-center gap-1 group"
              title={c}>
              <div className="w-9 h-9 rounded-lg border-2 transition-all"
                style={{
                  backgroundColor: c,
                  borderColor: i === safeIdx ? "#6366F1" : "rgba(0,0,0,0.1)",
                  boxShadow: i === safeIdx ? "0 0 0 2px rgba(99,102,241,0.3)" : "none",
                }} />
              <span className="text-[9px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* HSL sliders */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-700">Adjust colour</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md border border-black/10" style={{ backgroundColor: originalHex }} title="Original" />
            <span className="text-xs text-gray-400">→</span>
            <div className="w-6 h-6 rounded-md border border-black/10" style={{ backgroundColor: adjustedHex }} title="Adjusted" />
            <span className="text-xs font-mono text-gray-500">{adjustedHex}</span>
          </div>
        </div>

        {sliders.map(({ label, value, min, max, unit, bg, onChange }) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500">{label}</span>
              <span className="font-mono text-gray-600">{value}{unit}</span>
            </div>
            <div className="relative h-4 rounded-full overflow-visible" style={{ background: bg }}>
              <input
                type="range" min={min} max={max} value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                style={{ margin: 0 }}
              />
              <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none transition-all"
                style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 8px)`, backgroundColor: adjustedHex }} />
            </div>
          </div>
        ))}
      </div>

      {/* Inner accordion: Contrast against other palette colours */}
      {otherColours.length > 0 && (
        <div
          className="rounded-xl border border-gray-200 overflow-hidden"
          style={{ backgroundColor: "#F8F9FB" }}
        >
          <button
            type="button"
            onClick={() => setOthersOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <span className="text-xs font-semibold text-gray-700">
              Contrast against other palette colours
            </span>
            <ChevronDown
              size={12}
              className="text-gray-400 transition-transform duration-200"
              style={{ transform: othersOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          <div
            style={{
              display: "grid",
              gridTemplateRows: othersOpen ? "1fr" : "0fr",
              transition: "grid-template-rows 0.2s ease",
            }}
          >
            <div style={{ overflow: "hidden" }}>
              <div className="px-4 pb-4 space-y-3">
                {/* Role selector lives here — only meaningful in this context */}
                <div className="pt-1">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Anchor's role</p>
                  <div className="flex gap-3 flex-wrap">
                    {(["Foreground", "Background", "Text"] as LabRole[]).map((r) => (
                      <label key={r} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="lab-role" value={r} checked={role === r} onChange={() => setRole(r)}
                          className="accent-indigo-600" />
                        <span className="text-xs text-gray-700">{r}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{ROLE_DESC[role]}</p>
                </div>

                {/* Contrast rows */}
                <div className="space-y-2">
                  {otherColours.map((c, i) => {
                    const pair = colourPair(c);
                    const ratio = contrastRatio(pair.fg, pair.bg);
                    const grade = wcagGrade(ratio);
                    return (
                      <div key={i} className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-white border border-gray-100">
                        <div className="flex items-center flex-shrink-0">
                          <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: pair.bg }} />
                          <div className="w-5 h-5 rounded-full border border-black/10 -ml-1.5" style={{ backgroundColor: pair.fg }} />
                        </div>
                        <span className="text-xs font-mono text-gray-500 flex-shrink-0">{c}</span>
                        <div className="flex-1 h-5 rounded flex items-center justify-center text-[10px] font-semibold overflow-hidden"
                          style={{ backgroundColor: pair.bg, color: pair.fg }}>
                          Aa
                        </div>
                        <span className="text-xs font-mono text-gray-400 shrink-0">{ratio.toFixed(2)}:1</span>
                        <GradeBadge grade={grade} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions — always visible */}
      <div className="flex gap-2">
        <button onClick={addToPalette}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg py-2.5 transition-colors"
          style={added
            ? { backgroundColor: "#22C55E", color: "#fff" }
            : { backgroundColor: "#EEF2FF", color: "#4F46E5" }}>
          <Plus size={12} />
          {added ? "Added!" : "Add to palette"}
        </button>
        <button onClick={replaceOriginal}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg py-2.5 border transition-colors"
          style={replaced
            ? { backgroundColor: "#22C55E", color: "#fff", borderColor: "#22C55E" }
            : { backgroundColor: "#fff", color: "#374151", borderColor: "#E5E7EB" }}>
          <RefreshCw size={12} />
          {replaced ? "Replaced!" : `Replace ${originalHex.slice(0, 7)}`}
        </button>
      </div>
    </div>
  );
}

// ─── Main ContrastChecker ─────────────────────────────────────────────────────

export function ContrastChecker() {
  const { colourMap } = useColours();

  const pairs = buildContrastPairs(colourMap);
  const results = evaluatePairs(pairs);

  const failing = results.filter((r) => r.grade === "Fail" || r.grade === "AA Large");
  const passing = results.filter((r) => r.grade === "AA" || r.grade === "AAA");

  const summaryBar = (
    <div className="flex items-center gap-3 mt-1">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-200">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: results.length ? `${(passing.length / results.length) * 100}%` : "0%",
            backgroundColor: failing.length === 0 ? "#22C55E" : failing.length <= 2 ? "#F59E0B" : "#EF4444",
          }}
        />
      </div>
      <span className="text-xs font-medium text-gray-500 shrink-0">
        {passing.length}/{results.length} passing
      </span>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* ── Contrast Checker section ── */}
      <AccordionCard
        title="Contrast Checker"
        description="WCAG 2.1 contrast ratios for key colour pairs in your palette"
        defaultOpen={true}
        headerExtra={summaryBar}
      >
        <div className="space-y-3">
          {results.map((r) => (
            <ContrastRow key={r.label} result={r} />
          ))}
        </div>
      </AccordionCard>

      {/* ── Colour Lab section ── */}
      <AccordionCard
        title="Colour Lab"
        description="Adjust any colour with HSL sliders and compare contrast live"
        defaultOpen={false}
      >
        <ColourLab />
      </AccordionCard>
    </div>
  );
}
