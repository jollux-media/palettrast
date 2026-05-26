import React, { useState, useRef } from "react";
import {
  LayoutDashboard, Users, BarChart3, FileText, Zap, Settings,
  Bell, Search, Monitor, Smartphone, ImagePlus
} from "lucide-react";
import { useColours } from "@/lib/colour-context";
import type { ColourMap } from "@/lib/colour-utils";
import type { MockupTheme } from "./mockup/types";
import { DashboardPage } from "./mockup/DashboardPage";
import { CustomersPage } from "./mockup/CustomersPage";
import { AnalyticsPage } from "./mockup/AnalyticsPage";
import { ReportsPage } from "./mockup/ReportsPage";
import { AutomationsPage } from "./mockup/AutomationsPage";
import { SettingsPage } from "./mockup/SettingsPage";
import { MobileMockup } from "./mockup/MobileMockup";
import { contrastRatio } from "@/lib/contrast-utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function bestTextOn(bgHex: string): string {
  return contrastRatio("#FFFFFF", bgHex) >= contrastRatio("#111111", bgHex) ? "#FFFFFF" : "#111111";
}

function buildTheme(map: ColourMap): MockupTheme {
  const inputBg = map.inputBg ?? map.surface;
  const surface = map.surface;
  return {
    bg: map.background,
    surface,
    sidebar: map.sidebar,
    primary: map.primary,
    accent: map.accent,
    headingCol: map.headingText,
    textCol: map.text,
    muted: map.muted,
    sidebarText: map.navText,
    primaryText: bestTextOn(map.primary),
    accentText: bestTextOn(map.accent),
    surfaceText: bestTextOn(surface),
    bgText: bestTextOn(map.background),
    surfaceBorder: withAlpha(map.text, 0.09),
    sidebarBorder: withAlpha(map.navText, 0.12),
    inputBg,
    inputText: map.inputText ?? map.text,
    dropdownBg: map.dropdownBg ?? surface,
    dropdownText: map.dropdownText ?? map.text,
    modalBg: map.modalBg ?? surface,
    modalText: map.modalText ?? map.text,
    withAlpha,
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────

type NavPage = "dashboard" | "customers" | "analytics" | "reports" | "automations" | "settings";
type MobilePage = "dashboard" | "customers" | "analytics" | "reports" | "settings";
type Viewport = "desktop" | "mobile";

interface LogoState {
  url: string;
  width: number;
}

const NAV: { id: NavPage; icon: React.ElementType; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "customers", icon: Users, label: "Customers" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
  { id: "reports", icon: FileText, label: "Reports" },
  { id: "automations", icon: Zap, label: "Automations" },
  { id: "settings", icon: Settings, label: "Settings" },
];

// ─── Main component ──────────────────────────────────────────────────────────

export function SaasMockup() {
  const { colourMap, maps } = useColours();
  const [activePage, setActivePage] = useState<NavPage>("dashboard");
  const [mobilePage, setMobilePage] = useState<MobilePage>("dashboard");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [mobileDark, setMobileDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("mockup-mobile-dark");
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });
  const [logo, setLogo] = useState<LogoState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = buildTheme(colourMap);
  const mobileLightTheme = buildTheme(maps.light);
  const mobileDarkTheme = buildTheme(maps.dark);
  const { bg, surface, sidebar, primary, accent, muted, textCol, surfaceBorder, sidebarBorder, sidebarText, primaryText, accentText, surfaceText, inputBg, inputText } = theme;

  function handleMobileDarkToggle(dark: boolean) {
    setMobileDark(dark);
    try {
      localStorage.setItem("mockup-mobile-dark", String(dark));
    } catch {}
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setLogo({ url, width: 32 });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // Logo padding shrinks as logo grows so the container doesn't deform
  const logoPad = logo ? Math.max(4, Math.round(16 - (logo.width / 160) * 12)) : 16;

  // Logo mark rendered in sidebar / mobile header — clicking triggers upload
  const logoMark = logo ? (
    <img
      src={logo.url}
      alt="Logo"
      title="Click to change logo"
      onClick={() => fileInputRef.current?.click()}
      style={{ width: logo.width, height: "auto", maxHeight: logo.width, objectFit: "contain", display: "block", cursor: "pointer", opacity: 1, transition: "opacity 0.15s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.75"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "1"; }}
    />
  ) : (
    <div
      className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
      style={{ backgroundColor: primary, color: primaryText, cursor: "pointer", transition: "opacity 0.15s" }}
      title="Click to upload logo"
      onClick={() => fileInputRef.current?.click()}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0.75"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
    >S</div>
  );

  return (
    <div className="space-y-3">
      {/* Controls row */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500">
          Colours applied in real time — switch pages and viewports to explore the full UI
        </p>

        <div className="flex items-center gap-2 shrink-0">
          {/* Logo controls */}
          <div className="flex items-center gap-2">
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white hover:bg-gray-50 transition-colors"
              title="Upload a logo (PNG, SVG, JPG)">
              <ImagePlus size={12} className="text-gray-500" />
              {logo ? "Change logo" : "Upload logo"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp"
              onChange={handleLogoUpload} className="hidden" />
            {logo && (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                <img src={logo.url} alt="" className="rounded" style={{ width: 16, height: 16, objectFit: "contain" }} />
                <input type="range" min={20} max={160} value={logo.width}
                  onChange={(e) => setLogo({ ...logo, width: Number(e.target.value) })}
                  className="w-20 h-1 accent-indigo-600 cursor-pointer" title={`${logo.width}px`} />
                <span className="text-xs text-gray-400 font-mono w-8">{logo.width}px</span>
                <button onClick={() => setLogo(null)} className="text-xs text-gray-400 hover:text-red-500 ml-1">✕</button>
              </div>
            )}
          </div>

          {/* Viewport toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(["desktop", "mobile"] as Viewport[]).map((id) => (
              <button key={id} onClick={() => setViewport(id)}
                className="flex items-center gap-1.5 text-xs font-medium rounded-md px-3 py-1.5 capitalize transition-all"
                style={viewport === id
                  ? { backgroundColor: "#fff", color: "#111", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                  : { color: "#6B7280" }}>
                {id === "desktop" ? <Monitor size={13} /> : <Smartphone size={13} />}
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── DESKTOP ── */}
      {viewport === "desktop" && (
        <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 flex flex-col"
          style={{ height: "calc(100vh - 148px)", minHeight: 620 }}>
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border-b border-gray-200 flex-shrink-0">
            <div className="flex gap-1.5">
              {["#EF4444", "#F59E0B", "#22C55E"].map((c) => (
                <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 font-mono max-w-xs mx-auto text-center">
              app.saasflow.io
            </div>
          </div>

          {/* App shell */}
          <div className="flex flex-1 overflow-hidden">

            {/* Sidebar */}
            <div className="flex flex-col w-44 flex-shrink-0 border-r" style={{ backgroundColor: sidebar, borderColor: sidebarBorder }}>
              <div
                className="flex"
                style={{
                  padding: logoPad,
                  alignItems: "center",
                  justifyContent: logo ? "center" : "flex-start",
                  gap: logo ? 0 : 8,
                }}
              >
                {logoMark}
                {!logo && <span className="font-semibold text-sm" style={{ color: sidebarText }}>SaasFlow</span>}
              </div>

              <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
                {NAV.map(({ id, icon: Icon, label }) => {
                  const isActive = activePage === id;
                  return (
                    <button key={id} onClick={() => setActivePage(id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-xs font-medium"
                      style={{
                        backgroundColor: isActive ? withAlpha(sidebarText, 0.12) : "transparent",
                        color: isActive ? primary : withAlpha(sidebarText, 0.6),
                      }}>
                      <Icon size={14} />
                      {label}
                    </button>
                  );
                })}
              </nav>

              <div className="p-3 border-t" style={{ borderColor: sidebarBorder }}>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                  style={{ backgroundColor: withAlpha(sidebarText, 0.06) }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: accent, color: accentText }}>A</div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: sidebarText }}>Alex Johnson</p>
                    <p className="text-[10px] truncate" style={{ color: withAlpha(sidebarText, 0.5) }}>Pro Plan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Topbar */}
              <div className="flex items-center justify-between px-5 py-2.5 border-b flex-shrink-0"
                style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
                <div className="relative w-52">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: muted }} />
                  <div className="w-full text-xs border rounded-lg pl-7 pr-3 py-1.5"
                    style={{ borderColor: surfaceBorder, backgroundColor: inputBg, color: inputText }}>
                    Search…
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bell size={15} style={{ color: muted }} />
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold"
                      style={{ backgroundColor: primary, color: primaryText }}>3</div>
                  </div>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: accent, color: accentText }}>AJ</div>
                </div>
              </div>

              {/* Page content */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {activePage === "dashboard" && <DashboardPage theme={theme} />}
                {activePage === "customers" && <CustomersPage theme={theme} />}
                {activePage === "analytics" && <AnalyticsPage theme={theme} />}
                {activePage === "reports" && <ReportsPage theme={theme} />}
                {activePage === "automations" && <AutomationsPage theme={theme} />}
                {activePage === "settings" && <SettingsPage theme={theme} />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE ── */}
      {viewport === "mobile" && (
        <div className="flex flex-col items-center gap-6 py-6 rounded-2xl border border-gray-200 bg-gray-50"
          style={{ minHeight: "calc(100vh - 148px)" }}>
          {/* Light / Dark toggle */}
          <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-1">
            {([false, true] as const).map((dark) => (
              <button
                key={String(dark)}
                onClick={() => handleMobileDarkToggle(dark)}
                className="text-xs font-medium rounded-md px-4 py-1.5 transition-all"
                style={mobileDark === dark
                  ? { backgroundColor: "#fff", color: "#111", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                  : { color: "#6B7280" }}
              >
                {dark ? "Dark" : "Light"}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center gap-3">
            <MobileMockup
              theme={mobileDark ? mobileDarkTheme : mobileLightTheme}
              activePage={mobilePage}
              onPageChange={setMobilePage}
              logo={logo}
            />
          </div>
        </div>
      )}
    </div>
  );
}
