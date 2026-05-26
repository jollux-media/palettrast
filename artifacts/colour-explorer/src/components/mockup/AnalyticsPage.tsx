import React, { useState } from "react";
import { TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import type { MockupTheme } from "./types";

const METRICS = [
  { label: "Sessions", value: "124,830", change: "+9.2%", up: true },
  { label: "Bounce Rate", value: "38.4%", change: "-2.1%", up: true },
  { label: "Pages / Session", value: "4.7", change: "+0.6", up: true },
  { label: "Goal Completions", value: "8,412", change: "-3.5%", up: false },
];

const SOURCES = [
  { label: "Organic Search", pct: 44, sessions: "54,965" },
  { label: "Direct", pct: 27, sessions: "33,704" },
  { label: "Referral", pct: 15, sessions: "18,725" },
  { label: "Social Media", pct: 9, sessions: "11,235" },
  { label: "Email", pct: 5, sessions: "6,242" },
];

const SOURCE_COLOURS = ["#6366F1", "#22D3EE", "#F59E0B", "#22C55E", "#EC4899"];

const DEVICES = [
  { label: "Desktop", pct: 58 },
  { label: "Mobile", pct: 34 },
  { label: "Tablet", pct: 8 },
];

export function AnalyticsPage({ theme }: { theme: MockupTheme }) {
  const { bg, surface, primary, headingCol, textCol, muted, surfaceBorder, surfaceText, withAlpha } = theme;
  const [range, setRange] = useState("Last 30 days");

  const bars = [42, 58, 50, 71, 63, 85, 74, 90, 66, 95, 80, 88, 75, 91, 83, 96, 70, 88, 77, 94, 82, 97, 85, 93, 78, 90, 86, 98, 88, 100];

  return (
    <div className="flex-1 overflow-auto p-5 space-y-4" style={{ backgroundColor: bg }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: headingCol }}>Analytics</h1>
          <p className="text-xs mt-0.5" style={{ color: muted }}>Traffic and engagement overview</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5"
          style={{ borderColor: surfaceBorder, backgroundColor: surface, color: surfaceText }}>
          {range} <ChevronDown size={11} />
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-xl p-3.5 border" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
            <p className="text-xs" style={{ color: muted }}>{m.label}</p>
            <p className="text-lg font-bold mt-0.5" style={{ color: surfaceText }}>{m.value}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {m.up ? <TrendingUp size={10} style={{ color: "#22C55E" }} /> : <TrendingDown size={10} style={{ color: "#EF4444" }} />}
              <span className="text-xs font-medium" style={{ color: m.up ? "#22C55E" : "#EF4444" }}>{m.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div className="rounded-xl border p-4" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold" style={{ color: surfaceText }}>Sessions — Last 30 days</p>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
            <span className="text-xs" style={{ color: muted }}>Sessions</span>
          </div>
        </div>
        <div className="relative h-32">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((pct) => (
            <div key={pct} className="absolute w-full border-b" style={{ bottom: `${pct}%`, borderColor: withAlpha(surfaceText, 0.06) }} />
          ))}
          {/* Bars */}
          <div className="absolute inset-0 flex items-end gap-px">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm transition-all"
                style={{ height: `${h}%`, backgroundColor: withAlpha(primary, i === bars.length - 1 ? 0.9 : 0.3) }} />
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-1.5">
          {["1", "5", "10", "15", "20", "25", "30"].map((d) => (
            <span key={d} className="text-[9px]" style={{ color: muted }}>{d}</span>
          ))}
        </div>
      </div>

      {/* Sources + Devices */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 rounded-xl border p-4" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
          <p className="text-xs font-semibold mb-3" style={{ color: surfaceText }}>Traffic Sources</p>
          <div className="space-y-2.5">
            {SOURCES.map((s, i) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SOURCE_COLOURS[i] }} />
                    <span style={{ color: withAlpha(surfaceText, 0.8) }}>{s.label}</span>
                  </div>
                  <span style={{ color: muted }}>{s.sessions}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: withAlpha(surfaceText, 0.07) }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${s.pct}%`, backgroundColor: SOURCE_COLOURS[i] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 rounded-xl border p-4" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
          <p className="text-xs font-semibold mb-3" style={{ color: surfaceText }}>Device Split</p>
          {/* Donut */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  let offset = 0;
                  return DEVICES.map((d, i) => {
                    const stroke = (d.pct / 100) * 100;
                    const el = (
                      <circle key={i} cx="18" cy="18" r="15.9" fill="none"
                        stroke={SOURCE_COLOURS[i]} strokeWidth="3.5"
                        strokeDasharray={`${stroke} ${100 - stroke}`}
                        strokeDashoffset={-offset} />
                    );
                    offset += stroke;
                    return el;
                  });
                })()}
              </svg>
            </div>
          </div>
          <div className="space-y-1.5">
            {DEVICES.map((d, i) => (
              <div key={d.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SOURCE_COLOURS[i] }} />
                  <span style={{ color: withAlpha(surfaceText, 0.8) }}>{d.label}</span>
                </div>
                <span className="font-medium" style={{ color: surfaceText }}>{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
