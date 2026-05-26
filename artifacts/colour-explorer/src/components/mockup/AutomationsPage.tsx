import React, { useState } from "react";
import { Plus, Zap, Mail, Bell, Users, ArrowRight, BarChart2 } from "lucide-react";
import type { MockupTheme } from "./types";

const AUTOMATIONS = [
  {
    icon: Mail,
    name: "Welcome Email Sequence",
    trigger: "When user signs up",
    action: "Send 3-email onboarding flow over 7 days",
    runs: 1284,
    success: 98,
    active: true,
  },
  {
    icon: Bell,
    name: "Trial Expiry Warning",
    trigger: "3 days before trial ends",
    action: "Send in-app notification + email",
    runs: 342,
    success: 100,
    active: true,
  },
  {
    icon: Users,
    name: "Churn Risk Alert",
    trigger: "User inactive for 14 days",
    action: "Notify account manager via Slack",
    runs: 87,
    success: 95,
    active: true,
  },
  {
    icon: Zap,
    name: "Upgrade Prompt",
    trigger: "User hits plan limit",
    action: "Show upgrade modal + send email",
    runs: 523,
    success: 91,
    active: false,
  },
  {
    icon: BarChart2,
    name: "Weekly Digest",
    trigger: "Every Monday at 9 AM",
    action: "Send usage summary to workspace admins",
    runs: 208,
    success: 100,
    active: true,
  },
];

export function AutomationsPage({ theme }: { theme: MockupTheme }) {
  const { bg, surface, primary, accent, headingCol, textCol, muted, surfaceBorder, primaryText, surfaceText, accentText, withAlpha } = theme;
  const [toggles, setToggles] = useState<boolean[]>(AUTOMATIONS.map((a) => a.active));

  return (
    <div className="flex-1 overflow-auto p-5 space-y-4" style={{ backgroundColor: bg }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: headingCol }}>Automations</h1>
          <p className="text-xs mt-0.5" style={{ color: muted }}>{toggles.filter(Boolean).length} active automations</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5"
          style={{ backgroundColor: primary, color: primaryText }}>
          <Plus size={12} /> Create Automation
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total runs this month", value: "2,444" },
          { label: "Success rate", value: "96.8%" },
          { label: "Time saved", value: "~42 hrs" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-3.5" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
            <p className="text-xs" style={{ color: muted }}>{s.label}</p>
            <p className="text-base font-bold mt-0.5" style={{ color: surfaceText }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Automation cards */}
      <div className="space-y-2.5">
        {AUTOMATIONS.map((auto, i) => {
          const Icon = auto.icon;
          const isOn = toggles[i];
          return (
            <div key={i} className="rounded-xl border p-4 flex items-center gap-4"
              style={{ backgroundColor: surface, borderColor: surfaceBorder, opacity: isOn ? 1 : 0.6 }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: withAlpha(primary, 0.12) }}>
                <Icon size={16} style={{ color: primary }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: surfaceText }}>{auto.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: withAlpha(accent, 0.12), color: accent }}>
                    {auto.trigger}
                  </span>
                  <ArrowRight size={10} style={{ color: muted }} />
                  <span className="text-xs truncate" style={{ color: muted }}>{auto.action}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <p className="text-xs font-semibold" style={{ color: surfaceText }}>{auto.runs.toLocaleString()}</p>
                  <p className="text-xs" style={{ color: muted }}>runs</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold" style={{ color: "#22C55E" }}>{auto.success}%</p>
                  <p className="text-xs" style={{ color: muted }}>success</p>
                </div>
                {/* Toggle */}
                <button
                  onClick={() => setToggles((prev) => prev.map((v, j) => j === i ? !v : v))}
                  className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0"
                  style={{ backgroundColor: isOn ? primary : withAlpha(surfaceText, 0.15) }}>
                  <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                    style={{ left: isOn ? "calc(100% - 1.1rem)" : "0.125rem" }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
