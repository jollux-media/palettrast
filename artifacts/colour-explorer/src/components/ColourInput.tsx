import React, { useRef, useState } from "react";
import { isValidHex, normalizeHex } from "@/lib/colour-utils";
import { useColours } from "@/lib/colour-context";
import { X, Plus, Shuffle, Upload, Trash2, BookmarkPlus, AlertTriangle } from "lucide-react";
import type { SavedScheme } from "@/lib/colour-context";

const NEU_BG = "#E8ECF1";
const NEU_SHADOW = "6px 6px 14px rgba(0,0,0,0.10), -6px -6px 14px rgba(255,255,255,0.85)";

function chipTextColor(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#374151";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  return luminance > 0.55 ? "#374151" : hex;
}

function ColourChip({ hex, isUsed, onRemove }: { hex: string; isUsed: boolean; onRemove: () => void }) {
  const textColor = chipTextColor(hex);
  return (
    <div
      className="relative group flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-mono font-medium"
      style={{ borderColor: hex + "44", backgroundColor: hex + "18" }}
    >
      <div className="w-5 h-5 rounded-full border border-black/10 flex-shrink-0" style={{ backgroundColor: hex }} />
      <span style={{ color: textColor }} className="opacity-90">{hex}</span>
      <button
        onClick={onRemove}
        title={isUsed ? "Used in design — remove anyway" : "Remove"}
        className="ml-1 transition-all text-red-500"
        style={{ opacity: isUsed ? 0 : 1 }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = isUsed ? "0" : "1"; }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function ColourInput() {
  const {
    colours, colourMap, setColours, shuffle,
    savedSchemes, saveScheme, deleteScheme,
    isSignedIn, openSchemesPanel,
  } = useColours();

  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");

  // Save modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [conflict, setConflict] = useState<SavedScheme | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const usedColours = new Set(Object.values(colourMap).map((h) => h.toUpperCase()));

  function addColour() {
    const hex = normalizeHex(inputValue);
    if (!isValidHex(inputValue)) { setError("Enter a valid 6-digit HEX code (e.g. #3B82F6)"); return; }
    if (colours.includes(hex)) { setError("That colour is already in your palette"); return; }
    setColours([...colours, hex]);
    setInputValue("");
    setError("");
  }

  function removeColour(hex: string) {
    if (colours.length <= 1) return;
    setColours(colours.filter((c) => c !== hex));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") addColour();
  }

  function applyBulk() {
    const lines = bulkText.split(/[\n,\s]+/).map((s) => s.trim()).filter((s) => s.length > 0);
    const valid = lines.filter(isValidHex).map(normalizeHex);
    const unique = [...new Set(valid)];
    if (unique.length === 0) { setError("No valid HEX codes found"); return; }
    setColours(unique);
    setBulkText("");
    setBulkMode(false);
    setError("");
  }

  // Save modal helpers
  function openSaveModal() {
    // When signed out, open the Saved Schemes panel to show the sign-in CTA
    if (!isSignedIn) {
      openSchemesPanel();
      return;
    }
    setNameInput("");
    setConflict(null);
    setSaved(false);
    setModalOpen(true);
    setTimeout(() => nameRef.current?.focus(), 60);
  }

  function closeSaveModal() {
    setModalOpen(false);
    setNameInput("");
    setConflict(null);
  }

  function findConflict(name: string): SavedScheme | undefined {
    const t = name.trim().toLowerCase();
    return savedSchemes.find((s) => s.name.toLowerCase() === t);
  }

  async function commitSave(name: string) {
    setSaving(true);
    try {
      await saveScheme(name);
      setNameInput("");
      setConflict(null);
      setSaved(true);
      setTimeout(() => { setSaved(false); closeSaveModal(); }, 1000);
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const existing = findConflict(trimmed);
    if (existing) { setConflict(existing); return; }
    await commitSave(trimmed);
  }

  async function handleOverwrite() {
    if (!conflict) return;
    await deleteScheme(conflict.id);
    await commitSave(nameInput.trim());
  }

  return (
    <>
      <div className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: NEU_BG, boxShadow: NEU_SHADOW }}>
        <div className="text-center">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Your Colour Palette</h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">Add HEX codes to apply to the mockup</p>
        </div>

        {bulkMode && (
          <div className="space-y-2">
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={"Paste HEX codes separated by commas, spaces, or newlines:\n#FF5733, #3498DB\n#2ECC71"}
              className="w-full h-24 text-xs font-mono border border-gray-200 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <div className="flex gap-2">
              <button onClick={applyBulk} className="flex-1 text-xs font-medium bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700 transition-colors">Apply</button>
              <button onClick={() => { setBulkMode(false); setBulkText(""); }} className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 hover:border-gray-300 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              placeholder="#3B82F6"
              maxLength={7}
              className="w-full text-sm font-mono bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 pr-10"
            />
            {isValidHex(inputValue) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-black/10"
                style={{ backgroundColor: normalizeHex(inputValue) }} />
            )}
          </div>
          <button onClick={addColour} className="flex items-center gap-1.5 text-sm font-medium bg-gray-900 text-white rounded-lg px-3 py-2 hover:bg-gray-700 transition-colors">
            <Plus size={15} /> Add
          </button>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {colours.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">Palette cleared — add a HEX code above to start fresh.</p>
        )}

        {colours.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {colours.map((hex) => (
              <ColourChip key={hex} hex={hex} isUsed={usedColours.has(hex.toUpperCase())} onRemove={() => removeColour(hex)} />
            ))}
          </div>
        )}

        {/* Action buttons — 4 columns */}
        <div className="grid grid-cols-4 gap-2 pt-1 border-t border-gray-100">
          <button
            onClick={() => setColours([])}
            title="Remove all colours from your palette and start fresh"
            className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 rounded-lg py-2 transition-colors bg-red-50 hover:bg-red-100"
          >
            <Trash2 size={12} /> Clear
          </button>
          <button
            onClick={() => setBulkMode(!bulkMode)}
            title="Paste multiple HEX codes at once, separated by commas, spaces, or newlines"
            className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-300 hover:border-gray-400 rounded-lg py-2 transition-colors hover:bg-gray-50"
          >
            <Upload size={12} /> Bulk
          </button>
          <button
            onClick={shuffle}
            title="Generate a random harmonious colour palette and apply it to all roles"
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg py-2 transition-colors bg-indigo-50 hover:bg-indigo-100"
          >
            <Shuffle size={12} /> Shuffle
          </button>
          <button
            onClick={openSaveModal}
            title={isSignedIn ? "Save the current palette and role assignments as a named scheme" : "Sign in to save schemes"}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white rounded-lg py-2 transition-colors"
            style={{ backgroundColor: "#4F46E5" }}
          >
            <BookmarkPlus size={12} /> Save
          </button>
        </div>
      </div>

      {/* Save modal — only shown when signed in */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
          onClick={closeSaveModal}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-base font-bold text-gray-900">Save scheme</h3>
              <p className="text-xs text-gray-500 mt-0.5">Give this colour configuration a name</p>
            </div>

            <div className="flex gap-2">
              <input
                ref={nameRef}
                type="text"
                value={nameInput}
                onChange={(e) => { setNameInput(e.target.value); setConflict(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="e.g. Ocean Blues"
                maxLength={40}
                className="flex-1 text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                onClick={handleSave}
                disabled={!nameInput.trim() || saving}
                className="flex items-center gap-1.5 text-sm font-semibold rounded-lg px-4 py-2 shrink-0 disabled:opacity-40 transition-colors"
                style={saved ? { backgroundColor: "#22C55E", color: "#fff" } : { backgroundColor: "#4F46E5", color: "#fff" }}
              >
                <BookmarkPlus size={14} />
                {saved ? "Saved!" : saving ? "Saving…" : "Save"}
              </button>
            </div>

            {conflict && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-800">
                    A scheme named <span className="font-semibold">"{conflict.name}"</span> already exists.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleOverwrite} className="text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg px-2.5 py-1 transition-colors">Overwrite</button>
                    <button onClick={() => { setConflict(null); nameRef.current?.focus(); }} className="text-xs font-medium text-amber-700 border border-amber-300 bg-white rounded-lg px-2.5 py-1 transition-colors">Edit name</button>
                  </div>
                </div>
              </div>
            )}

            <button onClick={closeSaveModal} className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors pt-1">
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
