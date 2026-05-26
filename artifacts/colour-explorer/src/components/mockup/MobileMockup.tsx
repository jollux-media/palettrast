import React, { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, Users, BarChart3, FileText, Settings,
  Bell, TrendingUp, TrendingDown, Zap, ChevronRight,
  Search, Plus, ChevronDown, X, Clock,
} from "lucide-react";
import type { MockupTheme } from "./types";

type NavPage = "dashboard" | "customers" | "analytics" | "reports" | "settings";

const NAV = [
  { id: "dashboard" as NavPage, icon: LayoutDashboard, label: "Home" },
  { id: "customers" as NavPage, icon: Users, label: "Customers" },
  { id: "analytics" as NavPage, icon: BarChart3, label: "Analytics" },
  { id: "reports" as NavPage, icon: FileText, label: "Reports" },
  { id: "settings" as NavPage, icon: Settings, label: "Settings" },
];

const STATS = [
  { label: "Revenue", value: "$48,295", change: "+12.5%", up: true },
  { label: "Users", value: "3,847", change: "+8.1%", up: true },
  { label: "Conversions", value: "4.3%", change: "-0.9%", up: false },
  { label: "Avg. Session", value: "6m 22s", change: "+1.4%", up: true },
];

const CUST = [
  { name: "Sarah K.", plan: "Enterprise", status: "Active" },
  { name: "Mark R.", plan: "Pro", status: "Active" },
  { name: "Priya N.", plan: "Enterprise", status: "Active" },
  { name: "Tom H.", plan: "Starter", status: "Trial" },
];

const MOBILE_REPORTS = [
  { name: "Monthly Revenue", schedule: "1st of month", status: "Delivered" },
  { name: "Customer Health", schedule: "Every Monday", status: "Delivered" },
  { name: "Usage Analytics", schedule: "Weekly", status: "Delivered" },
  { name: "Support Summary", schedule: "Every Friday", status: "Scheduled" },
];

const STATUS_COL: Record<string, string> = { Active: "#22C55E", Trial: "#F59E0B", Churned: "#EF4444" };
const REPORT_STATUS_COL: Record<string, { bg: string; text: string }> = {
  Delivered: { bg: "#DCFCE7", text: "#16A34A" },
  Scheduled: { bg: "#FEF3C7", text: "#D97706" },
};

const PLAN_OPTIONS = ["All plans", "Enterprise", "Pro", "Starter"];
const ANALYTICS_METRICS = ["Sessions", "Bounce Rate", "Page Views", "Conversions"];

const ANALYTICS_STAT_TILES: Record<string, { label: string; value: string; change: string; up: boolean }[]> = {
  Sessions: [
    { label: "Sessions", value: "124.8K", change: "+9.2%", up: true },
    { label: "Avg. Duration", value: "2m 41s", change: "+4.5%", up: true },
  ],
  "Bounce Rate": [
    { label: "Bounce Rate", value: "38.4%", change: "-2.1%", up: true },
    { label: "Exit Rate", value: "24.7%", change: "-1.3%", up: true },
  ],
  "Page Views": [
    { label: "Page Views", value: "318.2K", change: "+14.6%", up: true },
    { label: "Pages / Session", value: "3.8", change: "+11.8%", up: true },
  ],
  Conversions: [
    { label: "Conversions", value: "4,210", change: "+21.3%", up: true },
    { label: "Conv. Rate", value: "3.37%", change: "+0.8%", up: true },
  ],
};

const ANALYTICS_CHART_DATA: Record<string, { label: string; values: number[] }> = {
  Sessions: {
    label: "Sessions — 30 days",
    values: [42, 58, 50, 71, 63, 85, 74, 90, 66, 95, 80, 88, 75, 91, 83, 96, 70, 88, 77, 94, 82, 97, 85, 93, 78, 90, 86, 98, 88, 100],
  },
  "Bounce Rate": {
    label: "Bounce Rate — 30 days",
    values: [72, 68, 74, 65, 70, 60, 67, 55, 63, 58, 61, 54, 59, 52, 57, 50, 56, 53, 60, 49, 55, 51, 53, 48, 52, 50, 47, 49, 46, 44],
  },
  "Page Views": {
    label: "Page Views — 30 days",
    values: [55, 70, 60, 80, 75, 95, 85, 100, 78, 90, 88, 92, 82, 96, 87, 99, 76, 91, 84, 97, 89, 94, 86, 100, 80, 93, 88, 96, 90, 100],
  },
  Conversions: {
    label: "Conversions — 30 days",
    values: [20, 28, 22, 35, 30, 45, 38, 52, 40, 60, 48, 55, 42, 58, 50, 65, 44, 57, 46, 70, 53, 68, 58, 73, 61, 75, 65, 80, 72, 85],
  },
};

interface LogoState {
  url: string;
  width: number;
}

interface MobileMockupProps {
  theme: MockupTheme;
  activePage: NavPage;
  onPageChange: (p: NavPage) => void;
  logo?: LogoState | null;
}

const STATUS_BAR_H = 28;
const APP_HEADER_H = 44;
const BOTTOM_NAV_H = 56;
const TOP_CHROME_H = STATUS_BAR_H + APP_HEADER_H;

export function MobileMockup({ theme, activePage, onPageChange, logo }: MobileMockupProps) {
  const {
    bg, surface, sidebar, primary, accent, headingCol, muted, surfaceBorder,
    primaryText, accentText, surfaceText, sidebarText,
    inputBg, inputText, dropdownBg, dropdownText, modalBg, modalText,
    withAlpha,
  } = theme;

  const [custSearch, setCustSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All plans");
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false);
  const [custModalOpen, setCustModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [analyticsMetric, setAnalyticsMetric] = useState("Sessions");
  const [analyticsDropdownOpen, setAnalyticsDropdownOpen] = useState(false);
  const planDropdownRef = useRef<HTMLDivElement>(null);
  const analyticsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (planDropdownRef.current && !planDropdownRef.current.contains(e.target as Node)) {
        setPlanDropdownOpen(false);
      }
      if (analyticsDropdownRef.current && !analyticsDropdownRef.current.contains(e.target as Node)) {
        setAnalyticsDropdownOpen(false);
      }
    }
    if (planDropdownOpen || analyticsDropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [planDropdownOpen, analyticsDropdownOpen]);

  const filteredCust = CUST.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(custSearch.toLowerCase());
    const matchesPlan = planFilter === "All plans" || c.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    /* Phone frame */
    <div className="mx-auto" style={{ width: 375 }}>
      <div
        className="rounded-[44px] overflow-hidden border-8 shadow-2xl"
        style={{ borderColor: "#1a1a1a", backgroundColor: bg, height: 700, position: "relative" }}
      >

        {/* Status bar */}
        <div className="flex items-center justify-between px-6" style={{ backgroundColor: sidebar, height: STATUS_BAR_H }}>
          <span className="text-xs font-semibold" style={{ color: sidebarText }}>9:41</span>
          <div className="flex items-center gap-1.5">
            {[3, 4, 5].map((h) => (
              <div key={h} className="rounded-sm" style={{ width: 4, height: h, backgroundColor: sidebarText, opacity: 0.8 }} />
            ))}
            <div className="w-5 h-2.5 rounded-sm border ml-1" style={{ borderColor: sidebarText, opacity: 0.8 }}>
              <div className="h-full rounded-sm w-3/4" style={{ backgroundColor: sidebarText, opacity: 0.8 }} />
            </div>
          </div>
        </div>

        {/* App header */}
        <div
          className="flex items-center justify-between px-5"
          style={{ backgroundColor: sidebar, borderBottom: `1px solid ${withAlpha(sidebarText, 0.1)}`, height: APP_HEADER_H }}
        >
          <div className="flex items-center gap-2">
            {logo
              ? <img src={logo.url} alt="Logo" style={{ width: logo.width * 0.6, height: logo.width * 0.6, objectFit: "contain" }} />
              : <>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs" style={{ backgroundColor: primary, color: primaryText }}>S</div>
                  <span className="font-semibold text-sm" style={{ color: sidebarText }}>SaasFlow</span>
                </>
            }
          </div>
          <div className="relative">
            <Bell size={16} style={{ color: sidebarText }} />
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold"
              style={{ backgroundColor: primary, color: primaryText }}>3</div>
          </div>
        </div>

        {/* Page content */}
        <div className="overflow-y-auto" style={{ height: 700 - TOP_CHROME_H - BOTTOM_NAV_H, backgroundColor: bg }}>

          {activePage === "dashboard" && (
            <div className="p-4 space-y-4">
              <div>
                <p className="font-bold text-sm" style={{ color: headingCol }}>Dashboard</p>
                <p className="text-xs mt-0.5" style={{ color: muted }}>Good morning, Alex</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {STATS.map((s) => (
                  <div key={s.label} className="rounded-2xl p-3.5 border" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
                    <p className="text-xs" style={{ color: muted }}>{s.label}</p>
                    <p className="text-base font-bold mt-0.5" style={{ color: surfaceText }}>{s.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {s.up ? <TrendingUp size={10} style={{ color: "#22C55E" }} /> : <TrendingDown size={10} style={{ color: "#EF4444" }} />}
                      <span className="text-xs font-medium" style={{ color: s.up ? "#22C55E" : "#EF4444" }}>{s.change}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border p-3.5" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
                <p className="text-xs font-semibold mb-2.5" style={{ color: surfaceText }}>Revenue</p>
                <div className="flex items-end gap-1 h-16">
                  {[38, 55, 44, 70, 52, 82, 66, 80, 55, 88, 72, 85].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, backgroundColor: i === 11 ? primary : withAlpha(primary, 0.25) }} />
                  ))}
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-semibold"
                style={{ backgroundColor: primary, color: primaryText }}>
                <Zap size={13} /> New Report
              </button>
            </div>
          )}

          {activePage === "customers" && (
            <div className="p-4 space-y-3 relative">
              {/* Add Customer Modal */}
              {custModalOpen && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
                >
                  <div
                    className="w-72 rounded-2xl shadow-2xl overflow-hidden mx-3"
                    style={{ backgroundColor: modalBg, border: `1px solid ${withAlpha(modalText, 0.12)}` }}
                  >
                    <div className="flex items-center justify-between px-4 py-3.5 border-b"
                      style={{ borderColor: withAlpha(modalText, 0.1) }}>
                      <p className="text-sm font-semibold" style={{ color: modalText }}>Add Customer</p>
                      <button onClick={() => setCustModalOpen(false)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg"
                        style={{ color: withAlpha(modalText, 0.5) }}>
                        <X size={13} />
                      </button>
                    </div>
                    <div className="px-4 py-3.5 space-y-3">
                      {[
                        { label: "Full name", placeholder: "e.g. Jane Smith" },
                        { label: "Email address", placeholder: "jane@company.com" },
                      ].map(({ label, placeholder }) => (
                        <div key={label}>
                          <label className="block text-xs mb-1" style={{ color: withAlpha(modalText, 0.6) }}>{label}</label>
                          <input
                            placeholder={placeholder}
                            className="w-full text-xs border rounded-lg px-3 py-2 focus:outline-none"
                            style={{ borderColor: withAlpha(modalText, 0.15), backgroundColor: inputBg, color: inputText }}
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs mb-1" style={{ color: withAlpha(modalText, 0.6) }}>Plan</label>
                        <div className="relative">
                          <select
                            className="w-full text-xs border rounded-lg px-3 py-2 appearance-none focus:outline-none pr-7"
                            style={{ borderColor: withAlpha(modalText, 0.15), backgroundColor: inputBg, color: inputText }}
                          >
                            {["Starter", "Pro", "Enterprise"].map((p) => (
                              <option key={p}>{p}</option>
                            ))}
                          </select>
                          <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: withAlpha(modalText, 0.4) }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 px-4 py-3 border-t"
                      style={{ borderColor: withAlpha(modalText, 0.1) }}>
                      <button
                        onClick={() => setCustModalOpen(false)}
                        className="text-xs font-medium rounded-lg px-3 py-1.5"
                        style={{ backgroundColor: withAlpha(modalText, 0.07), color: withAlpha(modalText, 0.7) }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setCustModalOpen(false)}
                        className="text-xs font-medium rounded-lg px-4 py-1.5"
                        style={{ backgroundColor: primary, color: primaryText }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm" style={{ color: headingCol }}>Customers</p>
                <button
                  onClick={() => setCustModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-medium rounded-lg px-2.5 py-1.5"
                  style={{ backgroundColor: primary, color: primaryText }}
                >
                  <Plus size={11} /> Add
                </button>
              </div>

              {/* Search + Plan filter */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: muted }} />
                  <input
                    value={custSearch}
                    onChange={(e) => setCustSearch(e.target.value)}
                    placeholder="Search…"
                    className="w-full text-xs border rounded-lg pl-7 pr-3 py-1.5 focus:outline-none"
                    style={{ borderColor: surfaceBorder, backgroundColor: inputBg, color: inputText }}
                  />
                </div>
                <div className="relative" ref={planDropdownRef}>
                  <button
                    onClick={() => setPlanDropdownOpen((o) => !o)}
                    className="flex items-center gap-1 text-xs border rounded-lg px-2.5 py-1.5 whitespace-nowrap"
                    style={{
                      borderColor: planDropdownOpen ? primary : surfaceBorder,
                      color: planFilter !== "All plans" ? primary : muted,
                      backgroundColor: surface,
                    }}
                  >
                    {planFilter === "All plans" ? "Plan" : planFilter}
                    <ChevronDown size={10} style={{ transform: planDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                  </button>
                  {planDropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 z-10 rounded-xl shadow-lg overflow-hidden"
                      style={{
                        backgroundColor: dropdownBg,
                        border: `1px solid ${withAlpha(dropdownText, 0.12)}`,
                        minWidth: 120,
                      }}
                    >
                      {PLAN_OPTIONS.map((opt, i) => (
                        <button
                          key={opt}
                          onClick={() => { setPlanFilter(opt); setPlanDropdownOpen(false); }}
                          className="w-full text-left text-xs px-3 py-2"
                          style={{
                            color: opt === planFilter ? primary : dropdownText,
                            backgroundColor: opt === planFilter ? withAlpha(primary, 0.08) : "transparent",
                            borderBottom: i < PLAN_OPTIONS.length - 1 ? `1px solid ${withAlpha(dropdownText, 0.07)}` : "none",
                            fontWeight: opt === planFilter ? 600 : 400,
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer list */}
              <div className="space-y-2">
                {filteredCust.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl p-3.5 border"
                    style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ backgroundColor: withAlpha(accent, 0.18), color: accent }}>
                      {c.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium" style={{ color: surfaceText }}>{c.name}</p>
                      <p className="text-xs" style={{ color: muted }}>{c.plan}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COL[c.status] }} />
                      <span className="text-xs" style={{ color: muted }}>{c.status}</span>
                    </div>
                    <ChevronRight size={12} style={{ color: withAlpha(surfaceText, 0.3) }} />
                  </div>
                ))}
                {filteredCust.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: muted }}>No customers match</p>
                )}
              </div>
            </div>
          )}

          {activePage === "analytics" && (
            <div className="p-4 space-y-3">
              <p className="font-bold text-sm" style={{ color: headingCol }}>Analytics</p>

              {/* Filters row: date-range input + metric dropdown */}
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    readOnly
                    value="Apr 1 – Apr 20"
                    className="w-full text-xs border rounded-lg px-3 py-1.5 focus:outline-none cursor-default"
                    style={{ backgroundColor: inputBg, color: inputText, borderColor: withAlpha(inputText, 0.15) }}
                  />
                </div>
                <div className="relative" ref={analyticsDropdownRef}>
                  <button
                    onClick={() => setAnalyticsDropdownOpen((o) => !o)}
                    className="flex items-center gap-1 text-xs border rounded-lg px-2.5 py-1.5 whitespace-nowrap"
                    style={{
                      borderColor: analyticsDropdownOpen ? primary : surfaceBorder,
                      color: analyticsMetric !== "Sessions" ? primary : muted,
                      backgroundColor: surface,
                    }}
                  >
                    {analyticsMetric}
                    <ChevronDown size={10} style={{ transform: analyticsDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                  </button>
                  {analyticsDropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 z-10 rounded-xl shadow-lg overflow-hidden"
                      style={{
                        backgroundColor: dropdownBg,
                        border: `1px solid ${withAlpha(dropdownText, 0.12)}`,
                        minWidth: 130,
                      }}
                    >
                      {ANALYTICS_METRICS.map((opt, i) => (
                        <button
                          key={opt}
                          onClick={() => { setAnalyticsMetric(opt); setAnalyticsDropdownOpen(false); }}
                          className="w-full text-left text-xs px-3 py-2"
                          style={{
                            color: opt === analyticsMetric ? primary : dropdownText,
                            backgroundColor: opt === analyticsMetric ? withAlpha(primary, 0.08) : "transparent",
                            borderBottom: i < ANALYTICS_METRICS.length - 1 ? `1px solid ${withAlpha(dropdownText, 0.07)}` : "none",
                            fontWeight: opt === analyticsMetric ? 600 : 400,
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {ANALYTICS_STAT_TILES[analyticsMetric].map((m) => (
                  <div key={m.label} className="rounded-2xl p-3.5 border" style={{ backgroundColor: surface, borderColor: surfaceBorder, transition: "opacity 0.25s ease" }}>
                    <p className="text-xs" style={{ color: muted, transition: "color 0.25s ease" }}>{m.label}</p>
                    <p className="text-base font-bold mt-0.5" style={{ color: surfaceText, transition: "color 0.25s ease" }}>{m.value}</p>
                    <span className="text-xs font-medium" style={{ color: m.up ? "#22C55E" : "#EF4444", transition: "color 0.25s ease" }}>{m.change}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border p-3.5" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
                <p className="text-xs font-semibold mb-2.5" style={{ color: surfaceText, transition: "opacity 0.2s" }}>
                  {ANALYTICS_CHART_DATA[analyticsMetric].label}
                </p>
                <div className="flex items-end gap-0.5 h-20" style={{ transition: "all 0.25s ease" }}>
                  {ANALYTICS_CHART_DATA[analyticsMetric].values.map((h, i, arr) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${h}%`,
                        backgroundColor: withAlpha(primary, i === arr.length - 1 ? 0.9 : 0.3),
                        transition: "height 0.35s ease",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePage === "reports" && (
            <div className="p-4 space-y-3 relative">
              {/* New Report Modal */}
              {reportModalOpen && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
                >
                  <div
                    className="w-72 rounded-2xl shadow-2xl overflow-hidden mx-3"
                    style={{ backgroundColor: modalBg, border: `1px solid ${withAlpha(modalText, 0.12)}` }}
                  >
                    <div className="flex items-center justify-between px-4 py-3.5 border-b"
                      style={{ borderColor: withAlpha(modalText, 0.1) }}>
                      <p className="text-sm font-semibold" style={{ color: modalText }}>New Report</p>
                      <button onClick={() => setReportModalOpen(false)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg"
                        style={{ color: withAlpha(modalText, 0.5) }}>
                        <X size={13} />
                      </button>
                    </div>
                    <div className="px-4 py-3.5 space-y-3">
                      <div>
                        <label className="block text-xs mb-1" style={{ color: withAlpha(modalText, 0.6) }}>Report name</label>
                        <input
                          placeholder="e.g. Q2 Revenue Summary"
                          className="w-full text-xs border rounded-lg px-3 py-2 focus:outline-none"
                          style={{ borderColor: withAlpha(modalText, 0.15), backgroundColor: inputBg, color: inputText }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1" style={{ color: withAlpha(modalText, 0.6) }}>Report type</label>
                        <div className="relative">
                          <select
                            className="w-full text-xs border rounded-lg px-3 py-2 appearance-none focus:outline-none pr-7"
                            style={{ borderColor: withAlpha(modalText, 0.15), backgroundColor: inputBg, color: inputText }}
                          >
                            {["Revenue", "Customer", "Usage", "Support", "Custom"].map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>
                          <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: withAlpha(modalText, 0.4) }} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs mb-1" style={{ color: withAlpha(modalText, 0.6) }}>Frequency</label>
                        <div className="relative">
                          <select
                            className="w-full text-xs border rounded-lg px-3 py-2 appearance-none focus:outline-none pr-7"
                            style={{ borderColor: withAlpha(modalText, 0.15), backgroundColor: inputBg, color: inputText }}
                          >
                            {["Daily", "Weekly", "Monthly", "Quarterly"].map((f) => (
                              <option key={f}>{f}</option>
                            ))}
                          </select>
                          <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: withAlpha(modalText, 0.4) }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 px-4 py-3 border-t"
                      style={{ borderColor: withAlpha(modalText, 0.1) }}>
                      <button
                        onClick={() => setReportModalOpen(false)}
                        className="text-xs font-medium rounded-lg px-3 py-1.5"
                        style={{ backgroundColor: withAlpha(modalText, 0.07), color: withAlpha(modalText, 0.7) }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setReportModalOpen(false)}
                        className="text-xs font-medium rounded-lg px-4 py-1.5"
                        style={{ backgroundColor: primary, color: primaryText }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm" style={{ color: headingCol }}>Reports</p>
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-medium rounded-lg px-2.5 py-1.5"
                  style={{ backgroundColor: primary, color: primaryText }}
                >
                  <Plus size={11} /> New
                </button>
              </div>

              {/* Report list */}
              {MOBILE_REPORTS.map((r, i) => {
                const statusStyle = REPORT_STATUS_COL[r.status] ?? REPORT_STATUS_COL.Delivered;
                return (
                  <div key={i} className="flex items-center gap-3 rounded-2xl p-3.5 border"
                    style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: withAlpha(primary, 0.1) }}>
                      <FileText size={14} style={{ color: primary }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: surfaceText }}>{r.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={9} style={{ color: muted }} />
                        <p className="text-xs truncate" style={{ color: muted }}>{r.schedule}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                      {r.status}
                    </span>
                    <ChevronRight size={12} style={{ color: withAlpha(surfaceText, 0.3) }} />
                  </div>
                );
              })}
            </div>
          )}

          {activePage === "settings" && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border p-4" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: accent, color: accentText }}>AJ</div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: surfaceText }}>Alex Johnson</p>
                  <p className="text-xs" style={{ color: muted }}>alex@saasflow.io</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: primary }}>Pro Plan</p>
                </div>
              </div>
              {["Account Details", "Notifications", "Billing", "Team Members", "Sign Out"].map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl p-3.5 border"
                  style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
                  <span className="text-xs" style={{ color: item === "Sign Out" ? "#EF4444" : surfaceText }}>{item}</span>
                  <ChevronRight size={12} style={{ color: withAlpha(surfaceText, 0.3) }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom nav — positioned inside the phone frame */}
        <div
          className="absolute left-0 right-0 border-t flex"
          style={{ bottom: 0, height: BOTTOM_NAV_H, backgroundColor: sidebar, borderColor: withAlpha(sidebarText, 0.1) }}
        >
          {NAV.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => onPageChange(id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5">
              <Icon size={18} style={{ color: activePage === id ? primary : withAlpha(sidebarText, 0.4) }} />
              <span className="text-[9px] font-medium"
                style={{ color: activePage === id ? primary : withAlpha(sidebarText, 0.4) }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
