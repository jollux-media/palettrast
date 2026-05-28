import React, { useState, useEffect } from "react";
import { useColours } from "@/lib/colour-context";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Trash2, Download, Clock, ChevronDown, LogIn, UserPlus } from "lucide-react";
import { hasClerkPublishableKey } from "@/lib/clerk-env";

const NEU_BG = "#E8ECF1";
const NEU_SHADOW = "6px 6px 14px rgba(0,0,0,0.10), -6px -6px 14px rgba(255,255,255,0.85)";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function SavedSchemes() {
  const { savedSchemes, loadScheme, deleteScheme, isSignedIn, openSchemesSignal } = useColours();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const hasClerk = hasClerkPublishableKey();

  // Open the panel and scroll it into view when triggered by ColourInput's save button (signed-out flow)
  useEffect(() => {
    if (openSchemesSignal > 0) {
      setOpen(true);
      requestAnimationFrame(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }, [openSchemesSignal]);

  async function handleDelete(id: string) {
    if (confirmDelete === id) {
      await deleteScheme(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 2500);
    }
  }

  return (
    <div ref={panelRef} className="rounded-2xl overflow-hidden" style={{ backgroundColor: NEU_BG, boxShadow: NEU_SHADOW }}>
      {/* Header — always visible */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-5 py-3.5 text-left"
      >
        <span className="text-sm font-bold text-gray-800 tracking-tight">Saved Schemes</span>
        {isSignedIn && savedSchemes.length > 0 && (
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
            {savedSchemes.length}
          </span>
        )}
        <ChevronDown
          size={14}
          className="text-gray-400 ml-auto transition-transform duration-200 shrink-0"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-5 pb-4 border-t border-black/5">
          {/* Not signed in — CTA */}
          {hasClerk && !isSignedIn ? (
            <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-5 text-center space-y-3">
              <p className="text-sm font-semibold text-indigo-800">Save &amp; sync your colour schemes</p>
              <p className="text-xs text-indigo-600 leading-relaxed">
                Create a free account to save your palettes and access them from any device.
              </p>
              <div className="flex gap-2 justify-center pt-1">
                <SignUpButton mode="modal">
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold text-white rounded-lg px-4 py-2 transition-colors hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }}
                  >
                    <UserPlus size={12} /> Sign Up Free
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 border border-indigo-300 bg-white rounded-lg px-4 py-2 transition-colors hover:bg-indigo-50">
                    <LogIn size={12} /> Log In
                  </button>
                </SignInButton>
              </div>
            </div>
          ) : (
            /* Signed in (or Clerk not configured) — scheme list */
            <>
              {savedSchemes.length === 0 ? (
                <div className="text-center py-5 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl mt-3">
                  No saved schemes yet — use Save in the palette above
                </div>
              ) : (
                <div className="space-y-2 mt-3 max-h-64 overflow-y-auto pr-1">
                  {savedSchemes.map((scheme) => (
                    <div
                      key={scheme.id}
                      className="group flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 hover:border-gray-200 transition-all"
                    >
                      {/* Colour swatches */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <div className="flex gap-0.5">
                          {(["background", "primary", "accent"] as const).map((role) => (
                            <div key={`d-${role}`} title={`Dark: ${role}`}
                              className="w-3.5 h-3.5 rounded-full border border-black/10"
                              style={{ backgroundColor: scheme.maps.dark[role] }} />
                          ))}
                        </div>
                        <div className="flex gap-0.5">
                          {(["background", "primary", "accent"] as const).map((role) => (
                            <div key={`l-${role}`} title={`Light: ${role}`}
                              className="w-3.5 h-3.5 rounded-full border border-black/10"
                              style={{ backgroundColor: scheme.maps.light[role] }} />
                          ))}
                        </div>
                      </div>

                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{scheme.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={10} className="text-gray-400" />
                          <span className="text-xs text-gray-400">{timeAgo(scheme.savedAt)}</span>
                          <span className="text-gray-300 mx-1">·</span>
                          <span className="text-xs text-gray-400">{scheme.colours.length} colours</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => loadScheme(scheme.id)}
                          title="Load scheme"
                          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg px-2 py-1 bg-indigo-50 transition-colors"
                        >
                          <Download size={11} /> Load
                        </button>
                        <button
                          onClick={() => handleDelete(scheme.id)}
                          title={confirmDelete === scheme.id ? "Click again to confirm" : "Delete"}
                          className="flex items-center gap-1 text-xs font-medium rounded-lg px-2 py-1 border transition-colors"
                          style={confirmDelete === scheme.id
                            ? { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5", color: "#EF4444" }
                            : { backgroundColor: "#F9FAFB", borderColor: "#E5E7EB", color: "#9CA3AF" }}
                        >
                          <Trash2 size={11} />
                          {confirmDelete === scheme.id ? "Confirm" : ""}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
