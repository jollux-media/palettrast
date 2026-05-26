import React, { useState } from "react";
import { Plus, Download, FileText, BarChart2, Users, TrendingUp, Calendar, Clock, ChevronDown, X } from "lucide-react";
import type { MockupTheme } from "./types";

const REPORTS = [
  {
    icon: TrendingUp,
    name: "Monthly Revenue Summary",
    description: "MRR, ARR, churn rate and expansion revenue by plan",
    schedule: "1st of each month",
    lastRun: "Apr 1, 2024",
    status: "Delivered",
  },
  {
    icon: Users,
    name: "Customer Health Report",
    description: "Active users, NPS scores, and churn indicators",
    schedule: "Every Monday",
    lastRun: "Apr 1, 2024",
    status: "Delivered",
  },
  {
    icon: BarChart2,
    name: "Product Usage Analytics",
    description: "Feature adoption, DAU/WAU, and session metrics",
    schedule: "Weekly",
    lastRun: "Mar 25, 2024",
    status: "Delivered",
  },
  {
    icon: FileText,
    name: "Support Ticket Summary",
    description: "Volume, resolution time, and CSAT breakdown",
    schedule: "Every Friday",
    lastRun: "Mar 29, 2024",
    status: "Delivered",
  },
  {
    icon: Calendar,
    name: "Q1 Board Report",
    description: "Quarterly business review with OKR progress",
    schedule: "Quarterly",
    lastRun: "Jan 2, 2024",
    status: "Scheduled",
  },
];

const STATUS_COLOURS: Record<string, { bg: string; text: string }> = {
  Delivered: { bg: "#DCFCE7", text: "#16A34A" },
  Scheduled: { bg: "#FEF3C7", text: "#D97706" },
  Failed: { bg: "#FEE2E2", text: "#DC2626" },
};

const REPORT_TYPES = ["Revenue", "Customer", "Usage", "Support", "Custom"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly"];

export function ReportsPage({ theme }: { theme: MockupTheme }) {
  const {
    bg, surface, primary, headingCol, muted, surfaceBorder,
    primaryText, surfaceText, inputBg, inputText,
    modalBg, modalText, withAlpha,
  } = theme;

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex-1 overflow-auto p-5 space-y-4 relative" style={{ backgroundColor: bg }}>

      {/* ── New Report Modal ─────────────────────────────────── */}
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
              <p className="text-sm font-semibold" style={{ color: modalText }}>New Report</p>
              <button onClick={() => setModalOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-lg"
                style={{ color: withAlpha(modalText, 0.5) }}>
                <X size={13} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-3">
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
                    {REPORT_TYPES.map((t) => <option key={t}>{t}</option>)}
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
                    {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
                  </select>
                  <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: withAlpha(modalText, 0.4) }} />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: withAlpha(modalText, 0.6) }}>Date range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Start date"
                    className="w-full text-xs border rounded-lg px-3 py-2 focus:outline-none"
                    style={{ borderColor: withAlpha(modalText, 0.15), backgroundColor: inputBg, color: inputText }}
                  />
                  <input
                    type="text"
                    placeholder="End date"
                    className="w-full text-xs border rounded-lg px-3 py-2 focus:outline-none"
                    style={{ borderColor: withAlpha(modalText, 0.15), backgroundColor: inputBg, color: inputText }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: withAlpha(modalText, 0.6) }}>Description</label>
                <textarea
                  placeholder="Brief description of this report…"
                  rows={2}
                  className="w-full text-xs border rounded-lg px-3 py-2 focus:outline-none resize-none"
                  style={{ borderColor: withAlpha(modalText, 0.15), backgroundColor: inputBg, color: inputText }}
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t"
              style={{ borderColor: withAlpha(modalText, 0.1) }}>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs font-medium rounded-lg px-3 py-1.5"
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
          <h1 className="text-lg font-bold" style={{ color: headingCol }}>Reports</h1>
          <p className="text-xs mt-0.5" style={{ color: muted }}>Scheduled and on-demand reports</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5"
          style={{ backgroundColor: primary, color: primaryText }}
        >
          <Plus size={12} /> New Report
        </button>
      </div>

      {/* ── Quick stats ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Reports this month", value: "18" },
          { label: "Avg. delivery time", value: "2.4s" },
          { label: "Scheduled", value: "5 active" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border p-3.5" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
            <p className="text-xs" style={{ color: muted }}>{stat.label}</p>
            <p className="text-base font-bold mt-0.5" style={{ color: surfaceText }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Report list ─────────────────────────────────────── */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: surfaceBorder }}>
          <p className="text-xs font-semibold" style={{ color: surfaceText }}>Scheduled Reports</p>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: withAlpha(primary, 0.1), color: primary }}>
            {REPORTS.length} reports
          </span>
        </div>

        {REPORTS.map((r, i) => {
          const Icon = r.icon;
          const statusStyle = STATUS_COLOURS[r.status] ?? STATUS_COLOURS.Delivered;
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-4"
              style={{ borderBottom: i < REPORTS.length - 1 ? `1px solid ${surfaceBorder}` : "none" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: withAlpha(primary, 0.1) }}>
                <Icon size={15} style={{ color: primary }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: surfaceText }}>{r.name}</p>
                <p className="text-xs truncate mt-0.5" style={{ color: muted }}>{r.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Clock size={9} style={{ color: muted }} />
                    <span className="text-xs" style={{ color: muted }}>{r.schedule}</span>
                  </div>
                  <span className="text-xs" style={{ color: muted }}>Last: {r.lastRun}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                  {r.status}
                </span>
                <button className="flex items-center gap-1 text-xs border rounded-lg px-2.5 py-1 transition-colors"
                  style={{ borderColor: surfaceBorder, color: muted }}>
                  <Download size={10} /> Export
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
