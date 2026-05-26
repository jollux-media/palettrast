import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { MockupTheme } from "./types";

const CUSTOMERS = [
  { name: "Sarah Kowalski", email: "sarah@designco.io", plan: "Enterprise", status: "Active", joined: "Mar 2, 2024", spend: "$1,200" },
  { name: "Mark Reynolds", email: "mark@launchpad.co", plan: "Pro", status: "Active", joined: "Jan 15, 2024", spend: "$49" },
  { name: "Priya Nair", email: "priya@finwave.com", plan: "Enterprise", status: "Active", joined: "Feb 8, 2024", spend: "$1,200" },
  { name: "Tom Hawthorne", email: "tom@buildbot.dev", plan: "Starter", status: "Trial", joined: "Apr 1, 2024", spend: "$0" },
  { name: "Leila Mosavi", email: "leila@crescendo.ai", plan: "Pro", status: "Active", joined: "Dec 12, 2023", spend: "$49" },
  { name: "James Osei", email: "james@tectonic.co", plan: "Starter", status: "Churned", joined: "Nov 3, 2023", spend: "$0" },
  { name: "Clara Fischer", email: "clara@axiom.de", plan: "Enterprise", status: "Active", joined: "Oct 20, 2023", spend: "$1,200" },
];

const STATUS_COLOURS: Record<string, string> = {
  Active: "#22C55E",
  Trial: "#F59E0B",
  Churned: "#EF4444",
};

const PLAN_SHADES: Record<string, number> = {
  Enterprise: 1,
  Pro: 0.65,
  Starter: 0.35,
};

const PLAN_OPTIONS = ["All plans", "Enterprise", "Pro", "Starter"];

export function CustomersPage({ theme }: { theme: MockupTheme }) {
  const {
    bg, surface, primary, accent, headingCol, muted, surfaceBorder,
    primaryText, surfaceText, inputBg, inputText, dropdownBg, dropdownText,
    modalBg, modalText, withAlpha,
  } = theme;

  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All plans");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const filtered = CUSTOMERS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === "All plans" || c.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="flex-1 overflow-auto p-5 space-y-4 relative" style={{ backgroundColor: bg }}>
      {/* ── Add Customer Modal ─────────────────────────────── */}
      {modalOpen && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="w-80 rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: modalBg, border: `1px solid ${withAlpha(modalText, 0.12)}` }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: withAlpha(modalText, 0.1) }}>
              <p className="text-sm font-semibold" style={{ color: modalText }}>Add Customer</p>
              <button onClick={() => setModalOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: withAlpha(modalText, 0.5) }}>
                <X size={13} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-3">
              {[
                { label: "Full name", placeholder: "e.g. Jane Smith" },
                { label: "Email address", placeholder: "jane@company.com" },
                { label: "Company", placeholder: "Company Inc." },
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

              {/* Plan select */}
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

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t"
              style={{ borderColor: withAlpha(modalText, 0.1) }}>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                style={{ backgroundColor: withAlpha(modalText, 0.07), color: withAlpha(modalText, 0.7) }}
              >
                Cancel
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs font-medium rounded-lg px-4 py-1.5"
                style={{ backgroundColor: primary, color: primaryText }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: headingCol }}>Customers</h1>
          <p className="text-xs mt-0.5" style={{ color: muted }}>{CUSTOMERS.length} total customers</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5"
          style={{ backgroundColor: primary, color: primaryText }}
        >
          <Plus size={12} /> Add Customer
        </button>
      </div>

      {/* ── Filters row ─────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: muted }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers…"
            className="w-full text-xs border rounded-lg pl-7 pr-3 py-1.5 focus:outline-none"
            style={{ borderColor: surfaceBorder, backgroundColor: inputBg, color: inputText }}
          />
        </div>

        {/* Plan filter with themed dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-1 text-xs border rounded-lg px-2.5 py-1.5"
            style={{
              borderColor: dropdownOpen ? primary : surfaceBorder,
              color: planFilter !== "All plans" ? primary : muted,
              backgroundColor: surface,
            }}
          >
            {planFilter} <ChevronDown size={10} style={{ transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </button>

          {dropdownOpen && (
            <div
              className="absolute left-0 top-full mt-1 z-10 rounded-xl shadow-lg overflow-hidden"
              style={{
                backgroundColor: dropdownBg,
                border: `1px solid ${withAlpha(dropdownText, 0.12)}`,
                minWidth: 130,
              }}
            >
              {PLAN_OPTIONS.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => { setPlanFilter(opt); setDropdownOpen(false); }}
                  className="w-full text-left text-xs px-3 py-2 transition-colors"
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

        {["Status", "Joined"].map((f) => (
          <button key={f} className="flex items-center gap-1 text-xs border rounded-lg px-2.5 py-1.5"
            style={{ borderColor: surfaceBorder, color: muted, backgroundColor: surface }}>
            {f} <ChevronDown size={10} />
          </button>
        ))}
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${surfaceBorder}`, backgroundColor: withAlpha(surfaceText, 0.03) }}>
              {["Customer", "Plan", "Status", "Joined", "Spend"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-medium" style={{ color: muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={i} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${surfaceBorder}` : "none" }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ backgroundColor: withAlpha(accent, 0.18), color: accent }}>
                      {c.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: surfaceText }}>{c.name}</p>
                      <p className="text-xs" style={{ color: muted }}>{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: withAlpha(primary, PLAN_SHADES[c.plan] * 0.15), color: withAlpha(primary, PLAN_SHADES[c.plan]) }}>
                    {c.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLOURS[c.status] }} />
                    <span className="text-xs" style={{ color: surfaceText }}>{c.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: muted }}>{c.joined}</td>
                <td className="px-4 py-3 text-xs font-medium" style={{ color: surfaceText }}>{c.spend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: muted }}>Showing {filtered.length} of {CUSTOMERS.length}</span>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded border" style={{ borderColor: surfaceBorder, color: muted }}>
            <ChevronLeft size={12} />
          </button>
          {[1, 2, 3].map((n) => (
            <button key={n} className="w-7 h-7 text-xs rounded border"
              style={n === 1
                ? { backgroundColor: primary, color: primaryText, borderColor: primary }
                : { borderColor: surfaceBorder, color: muted }}>
              {n}
            </button>
          ))}
          <button className="p-1.5 rounded border" style={{ borderColor: surfaceBorder, color: muted }}>
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
