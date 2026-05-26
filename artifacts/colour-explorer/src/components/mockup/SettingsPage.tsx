import React, { useState } from "react";
import type { MockupTheme } from "./types";
import { Save, Upload } from "lucide-react";

const TABS = ["Account", "Notifications", "Billing", "Team"];

export function SettingsPage({ theme }: { theme: MockupTheme }) {
  const { bg, surface, primary, headingCol, textCol, muted, surfaceBorder, primaryText, surfaceText, accent, accentText, inputBg, inputText, withAlpha } = theme;
  const [tab, setTab] = useState("Account");

  return (
    <div className="flex-1 overflow-auto p-5 space-y-4" style={{ backgroundColor: bg }}>
      <div>
        <h1 className="text-lg font-bold" style={{ color: headingCol }}>Settings</h1>
        <p className="text-xs mt-0.5" style={{ color: muted }}>Manage your account and workspace preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: surfaceBorder }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors"
            style={{ color: tab === t ? primary : withAlpha(textCol, 0.5), borderColor: tab === t ? primary : "transparent" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Account" && (
        <div className="space-y-4">
          {/* Avatar */}
          <div className="rounded-xl border p-5 flex items-center gap-4" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ backgroundColor: accent, color: accentText }}>AJ</div>
            <div className="flex-1">
              <p className="text-xs font-semibold" style={{ color: surfaceText }}>Profile Photo</p>
              <p className="text-xs mt-0.5" style={{ color: muted }}>JPG, PNG or GIF. Max size 2MB.</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5"
              style={{ borderColor: surfaceBorder, color: surfaceText }}>
              <Upload size={11} /> Upload
            </button>
          </div>

          {/* Form */}
          <div className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
            <p className="text-xs font-semibold" style={{ color: surfaceText }}>Profile Details</p>
            <div className="grid grid-cols-2 gap-3">
              {[["First name", "Alex"], ["Last name", "Johnson"]].map(([label, val]) => (
                <div key={label}>
                  <label className="block text-xs mb-1" style={{ color: muted }}>{label}</label>
                  <input defaultValue={val} className="w-full text-xs border rounded-lg px-3 py-2 focus:outline-none"
                    style={{ borderColor: surfaceBorder, backgroundColor: inputBg, color: inputText }} />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: muted }}>Email address</label>
              <input defaultValue="alex@saasflow.io" className="w-full text-xs border rounded-lg px-3 py-2 focus:outline-none"
                style={{ borderColor: surfaceBorder, backgroundColor: inputBg, color: inputText }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: muted }}>Company</label>
              <input defaultValue="SaasFlow Inc." className="w-full text-xs border rounded-lg px-3 py-2 focus:outline-none"
                style={{ borderColor: surfaceBorder, backgroundColor: inputBg, color: inputText }} />
            </div>
            <div className="flex justify-end pt-1">
              <button className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-4 py-2"
                style={{ backgroundColor: primary, color: primaryText }}>
                <Save size={11} /> Save Changes
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-xl border p-4 flex items-center justify-between"
            style={{ backgroundColor: withAlpha("#EF4444", 0.04), borderColor: withAlpha("#EF4444", 0.2) }}>
            <div>
              <p className="text-xs font-semibold" style={{ color: "#EF4444" }}>Delete Account</p>
              <p className="text-xs mt-0.5" style={{ color: muted }}>This will permanently delete your account and all data.</p>
            </div>
            <button className="text-xs font-medium rounded-lg px-3 py-1.5 border"
              style={{ borderColor: withAlpha("#EF4444", 0.4), color: "#EF4444" }}>
              Delete
            </button>
          </div>
        </div>
      )}

      {tab === "Notifications" && (
        <div className="rounded-xl border" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
          {[
            { label: "Email notifications", desc: "Product updates and account alerts", on: true },
            { label: "Weekly digest", desc: "Summary of activity and key metrics", on: true },
            { label: "Automation alerts", desc: "Notify when automations fail or stop", on: false },
            { label: "Team activity", desc: "When teammates join or make changes", on: true },
          ].map((item, i, arr) => (
            <div key={item.label} className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: i < arr.length - 1 ? `1px solid ${surfaceBorder}` : "none" }}>
              <div>
                <p className="text-xs font-medium" style={{ color: surfaceText }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: muted }}>{item.desc}</p>
              </div>
              <div className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0"
                style={{ backgroundColor: item.on ? primary : withAlpha(surfaceText, 0.15) }}>
                <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                  style={{ left: item.on ? "calc(100% - 1.1rem)" : "0.125rem" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Billing" && (
        <div className="space-y-4">
          <div className="rounded-xl border p-5" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold" style={{ color: surfaceText }}>Current Plan</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold" style={{ color: surfaceText }}>Pro</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: withAlpha(primary, 0.12), color: primary }}>Active</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: muted }}>Billed monthly</p>
                <p className="text-lg font-bold mt-0.5" style={{ color: surfaceText }}>$49<span className="text-xs font-normal">/mo</span></p>
              </div>
            </div>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: withAlpha(primary, 0.12) }}>
              <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: primary }} />
            </div>
            <p className="text-xs mt-1.5" style={{ color: muted }}>7,500 / 10,000 API calls used this month</p>
          </div>
          <div className="rounded-xl border p-4" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
            <p className="text-xs font-semibold mb-3" style={{ color: surfaceText }}>Payment Method</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-6 rounded border flex items-center justify-center text-xs font-bold"
                  style={{ borderColor: surfaceBorder, color: surfaceText }}>VISA</div>
                <span className="text-xs" style={{ color: surfaceText }}>•••• •••• •••• 4242</span>
                <span className="text-xs" style={{ color: muted }}>Exp 12/26</span>
              </div>
              <button className="text-xs" style={{ color: primary }}>Update</button>
            </div>
          </div>
        </div>
      )}

      {tab === "Team" && (
        <div className="rounded-xl border" style={{ backgroundColor: surface, borderColor: surfaceBorder }}>
          {[
            { name: "Alex Johnson", email: "alex@saasflow.io", role: "Owner" },
            { name: "Sarah Kowalski", email: "sarah@saasflow.io", role: "Admin" },
            { name: "Mark Reynolds", email: "mark@saasflow.io", role: "Member" },
            { name: "Priya Nair", email: "priya@saasflow.io", role: "Member" },
          ].map((member, i, arr) => (
            <div key={member.email} className="flex items-center gap-3 px-5 py-3.5"
              style={{ borderBottom: i < arr.length - 1 ? `1px solid ${surfaceBorder}` : "none" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{ backgroundColor: withAlpha(accent, 0.18), color: accent }}>
                {member.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium" style={{ color: surfaceText }}>{member.name}</p>
                <p className="text-xs" style={{ color: muted }}>{member.email}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={member.role === "Owner"
                  ? { backgroundColor: withAlpha(primary, 0.12), color: primary }
                  : { backgroundColor: withAlpha(surfaceText, 0.07), color: muted }}>
                {member.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
