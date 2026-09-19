import React, { useState } from "react";
import { Sliders, ToggleLeft, ToggleRight, Sparkles, Shield, AlertTriangle, RefreshCw } from "lucide-react";

interface FeatureFlag {
  id: string;
  label: string;
  category: "Core Feed" | "AI Tools" | "Commerce" | "Discovery" | "Safety" | "Security";
  enabled: boolean;
  description: string;
  impact: string;
}

const INITIAL_FLAGS: FeatureFlag[] = [
  {
    id: "photo_video_uploads",
    label: "Photo & Video Uploads in Composer",
    category: "Core Feed",
    enabled: true,
    description: "Allows immigrant users to attach camera photos and video media to community posts and questions.",
    impact: "High bandwidth; activates Media CDN transcode pipelines.",
  },
  {
    id: "ai_assistant",
    label: "PathaSathi Doll AI Assistant",
    category: "AI Tools",
    enabled: true,
    description: "Enables floating interactive AI doll assistant on the UI to guide immigrants through legal and medical aid.",
    impact: "Invokes OpenRouter GPT-4o-mini & DeepSeek API quotas.",
  },
  {
    id: "marketplace_sellers",
    label: "Merchant Marketplace & Storefronts",
    category: "Commerce",
    enabled: true,
    description: "Permits approved sellers to list ethnic groceries, home meals, and furniture for diaspora immigrants.",
    impact: "Controls store catalog and checkout transactions.",
  },
  {
    id: "live_map_discovery",
    label: "BariKoi Interactive Map Discovery",
    category: "Discovery",
    enabled: true,
    description: "Enables real-time map with routing, geocoding, and local community landmarks across Dhaka and US metro areas.",
    impact: "Governed by circuit-breaker and client caching.",
  },
  {
    id: "emergency_broadcast",
    label: "Emergency Disaster & Policy Alert Banner",
    category: "Safety",
    enabled: true,
    description: "Displays high-priority alert ribbon at the top of the main app for urgent notices (USCIS changes, freeze shelters).",
    impact: "Broadcasts instantly to all active client devices.",
  },
  {
    id: "shadowban_engine",
    label: "Autonomous AI Shadowban Engine",
    category: "Security",
    enabled: false,
    description: "Automatically hides posts flagged with greater than 95% AI confidence score without waiting for human moderator review.",
    impact: "Reduces scam visibility but requires false-positive audits.",
  },
];

export function AdminFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [filterCat, setFilterCat] = useState("all");

  const toggleFlag = (id: string) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const categories = ["all", "Core Feed", "AI Tools", "Commerce", "Discovery", "Safety", "Security"];

  const filtered = filterCat === "all" ? flags : flags.filter(f => f.category === filterCat);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase text-red-600 font-bold tracking-wider">Super Admin Exclusive</span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Platform Feature Flags & Killswitches
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Safely toggle real-time feature availability, rollout experiments, or engage emergency service cut-offs.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filterCat === cat
                ? "bg-[#C04A22] text-white font-bold shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat === "all" ? "All Feature Modules" : cat}
          </button>
        ))}
      </div>

      {/* Flags List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(flag => (
          <div
            key={flag.id}
            className={`p-5 rounded-3xl border transition flex flex-col justify-between ${
              flag.enabled
                ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                : "bg-slate-50/80 border-slate-200 opacity-75 shadow-xs"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {flag.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5">{flag.label}</h3>
                </div>

                <button
                  onClick={() => toggleFlag(flag.id)}
                  className={`p-1 rounded-xl transition cursor-pointer flex-shrink-0 ${
                    flag.enabled ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
                  }`}
                  title={flag.enabled ? "Disable Feature" : "Enable Feature"}
                >
                  {flag.enabled ? (
                    <ToggleRight className="w-8 h-8 fill-emerald-500/20" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {flag.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-mono text-[10px]">{flag.impact}</span>
              <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full border ${
                flag.enabled
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : "text-slate-500 bg-slate-100 border-slate-200"
              }`}>
                {flag.enabled ? "Active" : "Disabled"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
