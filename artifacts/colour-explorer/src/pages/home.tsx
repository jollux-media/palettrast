import React, { useState } from "react";
import { ColourInput } from "@/components/ColourInput";
import { ColourRoleMapper } from "@/components/ColourRoleMapper";
import { SavedSchemes } from "@/components/SavedSchemes";
import { ContrastChecker } from "@/components/ContrastChecker";
import { SaasMockup } from "@/components/SaasMockup";
import { LogoPalettrast } from "@/components/LogoPalettrast";
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useColours } from "@/lib/colour-context";
import { Shuffle, Sun, Moon, Sliders, ShieldCheck } from "lucide-react";

type LeftTab = "palette" | "contrast";

const NEU_BG = "#E8ECF1";
const NEU_SHADOW = "6px 6px 14px rgba(0,0,0,0.10), -6px -6px 14px rgba(255,255,255,0.85)";
const NEU_INSET = "inset 4px 4px 8px rgba(0,0,0,0.10), inset -4px -4px 8px rgba(255,255,255,0.75)";

export default function Home() {
  const { shuffle, mode, toggleMode } = useColours();
  const [leftTab, setLeftTab] = useState<LeftTab>("palette");

  const clerkPublishableKey =
    (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined) ??
    ((import.meta.env as Record<string, string | undefined>).NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as
      | string
      | undefined);
  const hasClerk = Boolean(clerkPublishableKey);

  return (
    <div className="min-h-screen" style={{ backgroundColor: NEU_BG }}>
      {/* Top bar */}
      <header style={{
        backgroundColor: NEU_BG,
        boxShadow: "0 4px 10px rgba(0,0,0,0.09), 0 -2px 6px rgba(255,255,255,0.7)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div className="max-w-screen-2xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <LogoPalettrast height={48} />
          </div>

          <div className="flex items-center gap-3">
            {/* Auth buttons — only rendered when ClerkProvider is active */}
            {hasClerk && (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button
                      className="flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-2 transition-all"
                      style={{ backgroundColor: NEU_BG, color: "#475569", boxShadow: NEU_SHADOW }}
                    >
                      Log In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      className="flex items-center gap-2 text-sm font-bold text-white rounded-xl px-4 py-2 transition-all hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, #6366F1, #818CF8)",
                        boxShadow: "4px 4px 10px rgba(99,102,241,0.35), -2px -2px 6px rgba(255,255,255,0.6)",
                      }}
                    >
                      Sign Up
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl={window.location.href} />
                </SignedIn>
              </>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={toggleMode}
              title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-2 transition-all"
              style={mode === "dark"
                ? { backgroundColor: "#1E293B", color: "#CBD5E1", boxShadow: "4px 4px 8px rgba(0,0,0,0.35), -2px -2px 6px rgba(255,255,255,0.05)" }
                : { backgroundColor: NEU_BG, color: "#475569", boxShadow: NEU_SHADOW }
              }
            >
              {mode === "dark" ? <Moon size={15} /> : <Sun size={15} />}
              {mode === "dark" ? "Dark mode" : "Light mode"}
            </button>

            {/* Shuffle */}
            <button
              onClick={shuffle}
              className="flex items-center gap-2 text-sm font-bold text-white rounded-xl px-5 py-2 transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #6366F1, #818CF8)",
                boxShadow: "4px 4px 10px rgba(99,102,241,0.35), -2px -2px 6px rgba(255,255,255,0.6)",
              }}
            >
              <Shuffle size={14} />
              Shuffle
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        {!hasClerk && (
          <div
            className="mb-5 rounded-xl border px-4 py-3 text-sm"
            style={{ backgroundColor: "#FEF3C7", borderColor: "#F59E0B", color: "#92400E" }}
          >
            Sign-up is temporarily unavailable because authentication is not configured. Add
            <code className="mx-1">VITE_CLERK_PUBLISHABLE_KEY</code>
            in your deployment environment to enable Log In and Sign Up.
          </div>
        )}
        <div className="grid gap-6" style={{ gridTemplateColumns: "370px 1fr" }}>

          {/* ── Left panel ── */}
          <div className="space-y-5">
            {/* Tab switcher */}
            <div className="flex gap-3 p-2 rounded-2xl" style={{ backgroundColor: NEU_BG, boxShadow: NEU_INSET }}>
              <button
                onClick={() => setLeftTab("palette")}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-bold rounded-xl py-3 transition-all"
                style={leftTab === "palette"
                  ? { backgroundColor: NEU_BG, color: "#4F46E5", boxShadow: NEU_SHADOW }
                  : { color: "#94A3B8" }
                }
              >
                <Sliders size={15} /> Palette
              </button>
              <button
                onClick={() => setLeftTab("contrast")}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-bold rounded-xl py-3 transition-all"
                style={leftTab === "contrast"
                  ? { backgroundColor: NEU_BG, color: "#4F46E5", boxShadow: NEU_SHADOW }
                  : { color: "#94A3B8" }
                }
              >
                <ShieldCheck size={15} /> Contrast
              </button>
            </div>

            {leftTab === "palette" && (
              <>
                <ColourInput />
                <SavedSchemes />
                <ColourRoleMapper />
              </>
            )}

            {leftTab === "contrast" && (
              <ContrastChecker />
            )}
          </div>

          {/* ── Right panel: mockup ── */}
          <div style={{ position: "sticky", top: 68, alignSelf: "start" }}>
            <SaasMockup />
          </div>
        </div>
      </div>
    </div>
  );
}
