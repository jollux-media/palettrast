import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useColours } from "@/lib/colour-context";
import {
  COLOUR_ROLE_LABELS,
  COLOUR_ROLE_DESCRIPTIONS,
  DEFAULT_ROLES,
  type ColourRole,
  isValidHex,
  normalizeHex,
} from "@/lib/colour-utils";
import { contrastRatio } from "@/lib/contrast-utils";
import { Pipette, Lock, LockOpen, Check, X, Plus, Copy, RotateCcw, ChevronDown } from "lucide-react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function bestText(bg: string): string {
  return contrastRatio("#FFFFFF", bg) >= contrastRatio("#111111", bg) ? "#FFFFFF" : "#111111";
}

function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
}

function buildCssBlock(colourMap: Record<string, string>): string {
  const lines = DEFAULT_ROLES.map((role) => {
    const varName = `--color-${camelToKebab(role)}`;
    return `  ${varName}: ${colourMap[role] ?? "#888888"};`;
  });
  return `:root {\n${lines.join("\n")}\n}`;
}

function buildTailwindBlock(colourMap: Record<string, string>): string {
  const entries = DEFAULT_ROLES.map((role) => {
    const varName = `--color-${camelToKebab(role)}`;
    const key = camelToKebab(role);
    return `        '${key}': 'var(${varName})',`;
  });
  return `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${entries.join("\n")}\n      },\n    },\n  },\n};`;
}

// ─── Colour picker modal ──────────────────────────────────────────────────────

interface PickerModalProps {
  role: ColourRole;
  originalHex: string;
  colours: string[];
  /** Called on every picker move for live mockup preview */
  onPreview: (hex: string) => void;
  /** Called when user confirms without adding to palette */
  onConfirm: () => void;
  /** Called when user wants to add to palette (colour already applied via onPreview) */
  onAddToPalette: (hex: string) => void;
  /** Called on cancel — reverts to originalHex */
  onCancel: () => void;
}

function ColourPickerModal({ role, originalHex, colours, onPreview, onConfirm, onAddToPalette, onCancel }: PickerModalProps) {
  const [pendingHex, setPendingHex] = useState(originalHex);
  const [draftHex, setDraftHex] = useState<string | null>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const hasChanged = pendingHex !== originalHex;
  const isInPalette = colours.includes(pendingHex);
  const previewText = bestText(pendingHex);

  // Revert + close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  function applyHex(hex: string) {
    setPendingHex(hex);
    onPreview(hex);
  }

  function commitHexInput(raw: string) {
    const trimmed = raw.trim();
    const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    if (isValidHex(withHash)) {
      applyHex(normalizeHex(withHash));
    }
    setDraftHex(null);
  }

  const hexTextColor = contrastRatio("#FFFFFF", pendingHex) >= 3 ? "#FFFFFF" : "#1A1A1A";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-72 overflow-hidden"
        style={{ border: "1px solid rgba(0,0,0,0.08)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">{COLOUR_ROLE_LABELS[role]}</p>
            <p className="text-xs text-gray-400 mt-0.5">{COLOUR_ROLE_DESCRIPTIONS[role]}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0 ml-3"
          >
            <X size={14} />
          </button>
        </div>

        {/* Picker body */}
        <div className="p-5 space-y-4">
          {/* Large colour preview — click to open native picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => pickerRef.current?.click()}
              title="Click to open colour picker"
              className="w-full h-28 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-[0.99]"
              style={{ backgroundColor: pendingHex, border: "1px solid rgba(0,0,0,0.08)" }}
            >
              <Pipette size={18} style={{ color: previewText, opacity: 0.7 }} />
              <span className="text-xs font-medium" style={{ color: previewText, opacity: 0.7 }}>
                Click to open picker
              </span>
            </button>
            <input
              ref={pickerRef}
              type="color"
              value={pendingHex}
              onChange={(e) => applyHex(e.target.value.toUpperCase())}
              className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
            />
          </div>

          {/* Hex input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draftHex ?? pendingHex}
              onChange={(e) => setDraftHex(e.target.value)}
              onBlur={(e) => commitHexInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitHexInput((e.target as HTMLInputElement).value);
                if (e.key === "Escape") setDraftHex(null);
              }}
              className="flex-1 text-sm font-mono border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-center"
              style={{
                backgroundColor: pendingHex,
                color: hexTextColor,
                borderColor: "rgba(0,0,0,0.12)",
              }}
              spellCheck={false}
              maxLength={7}
            />
            {hasChanged && (
              <button
                type="button"
                onClick={() => { applyHex(originalHex); setDraftHex(null); }}
                title="Reset to current colour"
                className="w-8 h-8 flex items-center justify-center rounded-lg border text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
                style={{ borderColor: "rgba(0,0,0,0.12)" }}
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>

          {/* Current → new comparison */}
          {hasChanged && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span
                className="w-5 h-5 rounded-md border border-black/10 flex-shrink-0"
                style={{ backgroundColor: originalHex }}
                title="Current colour"
              />
              <span className="text-gray-300">→</span>
              <span
                className="w-5 h-5 rounded-md border-2 border-indigo-300 flex-shrink-0"
                style={{ backgroundColor: pendingHex }}
                title="New colour"
              />
              <span className="font-mono text-gray-400">{pendingHex}</span>
            </div>
          )}

          {/* Palette chips */}
          {colours.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Pick from your palette</p>
              <div className="flex flex-wrap gap-1.5">
                {colours.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => applyHex(c)}
                    title={c}
                    className="w-6 h-6 rounded-md transition-all hover:scale-110"
                    style={{
                      backgroundColor: c,
                      border: c === pendingHex ? "2px solid #6366F1" : "1.5px solid rgba(0,0,0,0.12)",
                      outline: c === pendingHex ? "2px solid #A5B4FC" : "none",
                      outlineOffset: 1,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — Add / Replace */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-medium rounded-lg px-3 py-1.5 transition-colors text-gray-500 hover:bg-gray-200"
          >
            Cancel
          </button>

          <div className="flex-1" />

          {/* Add — only if colour changed AND isn't already in the palette */}
          {hasChanged && !isInPalette && (
            <button
              type="button"
              onClick={() => onAddToPalette(pendingHex)}
              title="Apply to this role and also add to your palette"
              className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
              style={{ backgroundColor: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }}
            >
              <Plus size={11} /> Add to palette
            </button>
          )}

          {/* Replace — confirm the colour already previewed live */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={!hasChanged}
            className="flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-all disabled:opacity-40"
            style={{
              backgroundColor: hasChanged ? "#6366F1" : "#E0E7FF",
              color: hasChanged ? "#fff" : "#818CF8",
            }}
          >
            Replace
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Accordion groups ─────────────────────────────────────────────────────────

const ROLE_GROUPS: { id: string; label: string; description: string; roles: ColourRole[] }[] = [
  {
    id: "layout",
    label: "Layout",
    description: "Backgrounds and raised surfaces that form the structural canvas",
    roles: ["background", "surface", "sidebar"],
  },
  {
    id: "actions",
    label: "Actions",
    description: "Primary buttons, CTAs, and secondary highlights",
    roles: ["primary", "accent"],
  },
  {
    id: "text",
    label: "Text",
    description: "Typographic hierarchy from headings down to captions",
    roles: ["headingText", "text", "navText", "muted"],
  },
  {
    id: "forms",
    label: "Forms & Overlays",
    description: "Input fields, dropdown menus, and modal dialogs",
    roles: ["inputBg", "inputText", "dropdownBg", "dropdownText", "modalBg", "modalText"],
  },
];

// ─── Role row ─────────────────────────────────────────────────────────────────

function RoleRow({ role }: { role: ColourRole }) {
  const { colours, colourMap, assignRole, addColour, lockedRoles, toggleLock } = useColours();
  const hex = colourMap[role] ?? "#888888";
  const isLocked = lockedRoles.has(role);
  const [modalOpen, setModalOpen] = useState(false);
  // Snapshot of hex when the modal was opened — used to revert on cancel
  const [originalHex, setOriginalHex] = useState(hex);
  const hexTextColor = contrastRatio("#FFFFFF", hex) >= 3 ? "#FFFFFF" : "#1A1A1A";
  const hexTextShadow = hexTextColor === "#FFFFFF"
    ? "0 0 3px rgba(0,0,0,0.4)"
    : "0 0 2px rgba(255,255,255,0.4)";

  function openModal() {
    setOriginalHex(hex); // capture state before any changes
    setModalOpen(true);
  }

  function handleCancel() {
    assignRole(role, originalHex); // revert whatever was live-previewed
    setModalOpen(false);
  }

  function handleConfirm() {
    // colour already applied live via onPreview — just close
    setModalOpen(false);
  }

  function handleAddToPalette(h: string) {
    addColour(h); // colour already applied live
    setModalOpen(false);
  }

  return (
    <div className="py-3.5 border-b border-black/5 last:border-0">
      {/* Row 1: Full-width swatch bar — entire bg is the hex colour */}
      <div
        className="w-full rounded-xl px-4 py-2.5 flex items-center gap-3 mb-2.5 cursor-pointer transition-all hover:opacity-90 active:opacity-80"
        style={{ backgroundColor: hex, border: "1px solid rgba(0,0,0,0.08)", boxShadow: "2px 2px 6px rgba(0,0,0,0.12)" }}
        onClick={openModal}
        role="button"
        title="Click to open colour picker"
      >
        <span className="flex-1 text-sm font-bold" style={{ color: hexTextColor, textShadow: hexTextShadow }}>
          {COLOUR_ROLE_LABELS[role]}
        </span>
        <span className="text-xs font-mono flex-shrink-0" style={{ color: hexTextColor, opacity: 0.85, textShadow: hexTextShadow }}>
          {hex}
        </span>
        <Pipette size={13} className="flex-shrink-0" style={{ color: hexTextColor, opacity: 0.75 }} />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleLock(role); }}
          title={isLocked ? "Unlock this role" : "Lock — shuffle won't change it"}
          className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
          style={isLocked
            ? { backgroundColor: "rgba(255,255,255,0.35)", color: hexTextColor }
            : { backgroundColor: "rgba(0,0,0,0.12)", color: hexTextColor, opacity: 0.6 }
          }
        >
          {isLocked ? <Lock size={11} /> : <LockOpen size={11} />}
        </button>
      </div>

      {/* Row 2: Full description */}
      <p className="text-xs text-gray-500 leading-relaxed mb-2.5 px-1">
        {COLOUR_ROLE_DESCRIPTIONS[role]}
      </p>

      {/* Row 3: Palette quick-pick chips (full width, up to 8 per row) */}
      <div className="flex flex-wrap gap-1.5 px-1">
        {colours.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => assignRole(role, c)}
            title={c}
            className="w-6 h-6 rounded-lg border transition-all hover:scale-110 flex-shrink-0"
            style={{
              backgroundColor: c,
              borderColor: c === hex ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.1)",
              outline: c === hex ? "2px solid #6366F1" : "none",
              outlineOffset: 1,
            }}
          />
        ))}
      </div>

      {/* Picker modal */}
      {modalOpen && (
        <ColourPickerModal
          role={role}
          originalHex={originalHex}
          colours={colours}
          onPreview={(h) => assignRole(role, h)}
          onConfirm={handleConfirm}
          onAddToPalette={handleAddToPalette}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ColourRoleMapper() {
  const { colourMap, mode } = useColours();
  const [copiedCss, setCopiedCss] = useState(false);
  const [copiedTw, setCopiedTw] = useState(false);
  const [openGroup, setOpenGroup] = useState<string>("layout");

  const isDark = mode === "dark";
  const NEU_BG = "#E8ECF1";
  const NEU_SHADOW = "6px 6px 14px rgba(0,0,0,0.10), -6px -6px 14px rgba(255,255,255,0.85)";
  const cardBg = isDark ? "#1E293B" : NEU_BG;
  const cardShadow = isDark
    ? "6px 6px 14px rgba(0,0,0,0.40), -3px -3px 8px rgba(255,255,255,0.04)"
    : NEU_SHADOW;
  const headingColor = isDark ? "#F1F5F9" : "#111827";
  const descColor = isDark ? "#94A3B8" : "#6B7280";

  async function handleCopyCss() {
    const css = buildCssBlock(colourMap);
    try {
      await navigator.clipboard.writeText(css);
      setCopiedCss(true);
      toast.success("CSS variables copied!", {
        description: ":root { } block is ready to paste into your stylesheet.",
        duration: 2500,
      });
      setTimeout(() => setCopiedCss(false), 2000);
    } catch {
      toast.error("Copy failed", {
        description: "Your browser blocked clipboard access. Try selecting and copying manually.",
        duration: 4000,
      });
    }
  }

  async function handleCopyTailwind() {
    const tw = buildTailwindBlock(colourMap);
    try {
      await navigator.clipboard.writeText(tw);
      setCopiedTw(true);
      toast.success("Tailwind config copied!", {
        description: "Paste into your tailwind.config.js to use these colours.",
        duration: 2500,
      });
      setTimeout(() => setCopiedTw(false), 2000);
    } catch {
      toast.error("Copy failed", {
        description: "Your browser blocked clipboard access. Try selecting and copying manually.",
        duration: 4000,
      });
    }
  }

  return (
    <div className="rounded-2xl p-6 space-y-4 transition-all" style={{ backgroundColor: cardBg, boxShadow: cardShadow }}>
      {/* Heading — full-width, centred */}
      <div className="text-center">
        <h2 className="text-base font-bold tracking-tight" style={{ color: headingColor }}>Role Assignments</h2>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: descColor }}>
          Click a role to open the colour picker — use Replace to update the role or Add to also save it to your palette
        </p>
      </div>

      {/* Accordion groups */}
      <div className="space-y-2">
        {ROLE_GROUPS.map((group) => {
          const isOpen = openGroup === group.id;
          return (
            <div
              key={group.id}
              className="rounded-xl border transition-colors overflow-hidden"
              style={{ borderColor: isOpen ? "#C7D2FE" : "#E5E7EB", backgroundColor: "#FFFFFF" }}
            >
              {/* Group header — click to toggle */}
              <button
                type="button"
                onClick={() => setOpenGroup(isOpen ? "" : group.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ backgroundColor: isOpen ? "#EEF2FF" : "#F9FAFB" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-none mb-0.5">
                    {group.label}
                    <span className="ml-2 font-normal text-gray-400 text-xs">{group.roles.length} roles</span>
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{group.description}</p>
                </div>
                <ChevronDown
                  size={15}
                  className="flex-shrink-0 text-gray-400 transition-transform duration-200"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", color: isOpen ? "#6366F1" : undefined }}
                />
              </button>

              {/* Role rows */}
              {isOpen && (
                <div className="px-4" style={{ backgroundColor: "#FFFFFF" }}>
                  {group.roles.map((role) => (
                    <RoleRow key={role} role={role} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Export buttons — full-width, equal size, bottom of card */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
        <button
          type="button"
          onClick={handleCopyCss}
          title="Copy CSS custom properties"
          className="flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg py-2 transition-all"
          style={copiedCss
            ? { backgroundColor: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }
            : { backgroundColor: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE" }
          }
        >
          {copiedCss ? <Check size={12} /> : <Copy size={12} />}
          Copy CSS
        </button>
        <button
          type="button"
          onClick={handleCopyTailwind}
          title="Copy Tailwind config colours"
          className="flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg py-2 transition-all"
          style={copiedTw
            ? { backgroundColor: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }
            : { backgroundColor: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0" }
          }
        >
          {copiedTw ? <Check size={12} /> : <Copy size={12} />}
          Copy Tailwind
        </button>
      </div>
    </div>
  );
}
