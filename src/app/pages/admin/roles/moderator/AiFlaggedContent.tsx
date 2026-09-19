import React, { useState } from "react";
import { AlertTriangle, Sparkles, Shield, Check, X, Sliders, Zap } from "lucide-react";

interface AiFlagItem {
  id: string;
  sourceText: string;
  author: string;
  handle: string;
  model: string;
  confidence: number;
  detectedCategories: string[];
  actionTaken: "AUTO_SHADOWBANNED" | "HEURISTIC_FLAGGED" | "PENDING_REVIEW";
  detectedAt: string;
}

const INITIAL_AI_FLAGS: AiFlagItem[] = [
  {
    id: "AIF-101",
    sourceText: "DM me for instant guaranteed Green Card without interview or USCIS petition. $500 crypto deposit required.",
    author: "FastTrack USA",
    handle: "@fast_visa_2026",
    model: "DeepSeek Guard V2",
    confidence: 99.4,
    detectedCategories: ["Financial Scam", "Immigration Fraud", "Cryptocurrency"],
    actionTaken: "AUTO_SHADOWBANNED",
    detectedAt: "5m ago",
  },
  {
    id: "AIF-102",
    sourceText: "Work permit EAD cards available, identical hologram replicas for construction jobs in NY.",
    author: "ID Maker Pro",
    handle: "@docs_help_nyc",
    model: "OpenAI Moderation Engine",
    confidence: 97.8,
    detectedCategories: ["Counterfeit Documents", "Identity Theft"],
    actionTaken: "AUTO_SHADOWBANNED",
    detectedAt: "22m ago",
  },
  {
    id: "AIF-103",
    sourceText: "Urgent cash aid: click this unverified external link to claim $1,200 migrant welfare debit card.",
    author: "NY Migrant Fund",
    handle: "@nyc_fund_help",
    model: "Heuristic Phishing Filter",
    confidence: 92.3,
    detectedCategories: ["Phishing", "Credential Harvesting"],
    actionTaken: "HEURISTIC_FLAGGED",
    detectedAt: "1h ago",
  },
];

export function AiFlaggedContent() {
  const [flags, setFlags] = useState<AiFlagItem[]>(INITIAL_AI_FLAGS);
  const [minConfidence, setMinConfidence] = useState(90);

  const handleResolve = (id: string, approveFlag: boolean) => {
    setFlags(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase text-purple-600 font-bold tracking-wider">Trust & Safety Module</span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Autonomous AI Content Moderation Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Machine learning classification of immigration scams, document fraud, and phishing links.
          </p>
        </div>
      </div>

      {/* Threshold Slider Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Automated Shadowban Threshold
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Posts scoring higher than this confidence level are automatically hidden from feed pending human review.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="80"
              max="99"
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="w-32 accent-[#C04A22]"
            />
            <span className="font-mono text-sm font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 shadow-xs">
              {minConfidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Flagged Feed */}
      <div className="space-y-3.5">
        {flags.map(item => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  {item.id}
                </span>
                <span className="text-xs font-bold text-slate-900">{item.author}</span>
                <span className="text-[11px] text-slate-400 font-mono">{item.handle}</span>
                <span className="text-[10px] text-slate-400">• {item.detectedAt}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">{item.model}</span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  {item.confidence}% Match
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-3">
              <p className="text-xs text-slate-700 leading-relaxed font-mono">
                "{item.sourceText}"
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {item.detectedCategories.map((c, i) => (
                  <span key={i} className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                    {c}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleResolve(item.id, false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
                >
                  Mark False Positive
                </button>
                <button
                  onClick={() => handleResolve(item.id, true)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition shadow-xs cursor-pointer"
                >
                  Confirm Permanent Ban
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
