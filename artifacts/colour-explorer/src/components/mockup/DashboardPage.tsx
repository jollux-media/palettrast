import React, { useState } from "react";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import type { MockupTheme } from "./types";

const STATS = [
  { label: "Total Revenue", value: "$48,295", change: "+12.5%", up: true },
  { label: "Active Users", value: "3,847", change: "+8.1%", up: true },
  { label: "Conversion Rate", value: "4.3%", change: "-0.9%", up: false },
  { label: "Avg. Session", value: "6m 22s", change: "+1.4%", up: true },
];

const ACTIVITY = [
  { user: "Sarah K.", action: "upgraded to Pro", time: "2m ago" },
  { user: "Mark R.", action: "submitted a support ticket", time: "14m ago" },
  { user: "Priya N.", action: "exported report Q4", time: "1h ago" },
  { user: "Tom H.", action: "invited 3 teammates", time: "2h ago" },
  { user: "Leila M.", action: "connected Slack integration", time: "3h ago" },
];

export function DashboardPage({ theme }: { theme: MockupTheme }) {
  const { bg, surface, primary, accent, headingCol, textCol, muted, surfaceBorder, primaryText, accentText, surfaceText, withAlpha } = theme;
  const [tab, setTab] = useState("overview");

  return (
    <div className="flex-1 overflow-auto p-5 space-y-5" style={{ backgroundColor: bg }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: headingCol }}>Dashboard</h1>
          <p className="text-xs mt-0.5" style={{ color: muted }}>Welcome back, Alex — here's what's happening.</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5" style={{ backgroundColor: primary, color: primaryText }}>
          <Zap size={12} /> New Report
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl p-4 border" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
            <p className="text-xs" style={{ color: muted }}>{s.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: surfaceText }}>{s.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {s.up ? <TrendingUp size={11} style={{ color: "#22C55E" }} /> : <TrendingDown size={11} style={{ color: "#EF4444" }} />}
              <span className="text-xs font-medium" style={{ color: s.up ? "#22C55E" : "#EF4444" }}>{s.change}</span>
              <span className="text-xs" style={{ color: muted }}>vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: surfaceBorder }}>
        {["overview", "activity"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 text-xs font-medium capitalize border-b-2 -mb-px transition-colors"
            style={{ color: tab === t ? primary : withAlpha(textCol, 0.5), borderColor: tab === t ? primary : "transparent" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 rounded-xl border p-4" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
            <p className="text-xs font-semibold mb-3" style={{ color: surfaceText }}>Revenue Overview</p>
            <div className="flex items-end gap-1.5 h-28">
              {[38, 62, 45, 78, 52, 88, 68, 82, 57, 93, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, backgroundColor: i === 11 ? primary : withAlpha(primary, 0.22) }} />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => (
                <span key={i} className="text-[9px]" style={{ color: muted }}>{m}</span>
              ))}
            </div>
          </div>
          <div className="col-span-2 rounded-xl border p-4" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
            <p className="text-xs font-semibold mb-3" style={{ color: surfaceText }}>Plan Breakdown</p>
            {[{ label: "Enterprise", pct: 48 }, { label: "Pro", pct: 32 }, { label: "Starter", pct: 20 }].map((item) => (
              <div key={item.label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: withAlpha(surfaceText, 0.7) }}>{item.label}</span>
                  <span style={{ color: surfaceText }}>{item.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: withAlpha(primary, 0.12) }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${item.pct}%`, backgroundColor: accent }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div className="rounded-xl border" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
          {ACTIVITY.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${surfaceBorder}` : "none" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{ backgroundColor: withAlpha(accent, 0.18), color: accent }}>
                {item.user.split(" ")[0][0]}{item.user.split(" ")[1]?.[0]}
              </div>
              <p className="flex-1 text-xs" style={{ color: surfaceText }}>
                <span className="font-medium">{item.user}</span> {item.action}
              </p>
              <span className="text-xs" style={{ color: muted }}>{item.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
