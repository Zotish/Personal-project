import React, { useState } from "react";
import {
  Flag, AlertTriangle, CheckCircle, X, ShieldAlert,
  UserX, Eye, MessageCircle, Clock, Trash2, Shield
} from "lucide-react";

interface ReportItem {
  id: number;
  type: "post" | "comment" | "profile";
  author: string;
  authorHandle: string;
  content: string;
  reason: string;
  reportedBy: number;
  reportedTime: string;
  severity: "critical" | "high" | "medium";
  aiConfidence: string;
  status: "pending" | "resolved" | "dismissed";
}

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 1,
    type: "post",
    author: "Scam Bot NYC",
    authorHandle: "@scam_bot99",
    content: "I can guarantee fake SSN & green card in 48 hours for $300. DM me fast!",
    reason: "Fraud & Financial Scam",
    reportedBy: 14,
    reportedTime: "10m ago",
    severity: "critical",
    aiConfidence: "99.4% AI Match (Fraud)",
    status: "pending",
  },
  {
    id: 2,
    type: "post",
    author: "Fast Cash Jobs",
    authorHandle: "@job_scam_alert",
    content: "Guaranteed $50/hr cash jobs in Queens without work permit needed. Send SSN to register today.",
    reason: "Phishing & Identity Theft",
    reportedBy: 9,
    reportedTime: "45m ago",
    severity: "high",
    aiConfidence: "94.1% AI Match (Phishing)",
    status: "pending",
  },
  {
    id: 3,
    type: "comment",
    author: "Troll User",
    authorHandle: "@troll_user_nyc",
    content: "Don't listen to this verified attorney, they are giving fake legal advice to steal your asylum case...",
    reason: "Harassment & Defamation",
    reportedBy: 4,
    reportedTime: "2h ago",
    severity: "medium",
    aiConfidence: "81.0% AI Match (Harassment)",
    status: "pending",
  },
  {
    id: 4,
    type: "profile",
    author: "Fake Attorney Pro",
    authorHandle: "@fake_lawyer_ny",
    content: "Licensed NYC Immigration Attorney with 100% Guaranteed Asylum Approval (No Bar ID provided)",
    reason: "Impersonation & Unlicensed Practice",
    reportedBy: 7,
    reportedTime: "4h ago",
    severity: "high",
    aiConfidence: "88.7% AI Match (Impersonation)",
    status: "pending",
  },
];

export function ModerationQueue() {
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [filterType, setFilterType] = useState<string>("all");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleAction = (id: number, actionName: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    setActionFeedback(`Action taken: ${actionName} on Report #${id}`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const filtered = reports.filter(r => {
    if (filterType !== "all") return r.type === filterType;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase text-purple-600 font-bold tracking-wider">Trust & Safety Module</span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Community Feed Moderation Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review user-flagged posts, toxic comments, and fraudulent profiles violating diaspora safety guidelines.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold self-start sm:self-auto shadow-xs">
          {reports.length} Reports Pending
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-600 hover:text-emerald-800"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {["all", "post", "comment", "profile"].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
              filterType === type
                ? "bg-[#C04A22] text-white font-bold shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {type === "all" ? `All Reports (${reports.length})` : `${type}s`}
          </button>
        ))}
      </div>

      {/* Report Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-xs">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">Queue is clear!</h3>
          <p className="text-xs">No pending reported content in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(report => (
            <div
              key={report.id}
              className={`bg-white border rounded-3xl p-5 shadow-xs transition relative overflow-hidden ${
                report.severity === "critical" ? "border-red-300 ring-1 ring-red-100" : "border-slate-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                    {report.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    report.severity === "critical" ? "bg-red-50 text-red-700 border border-red-200" :
                    report.severity === "high" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    {report.reason}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Reported by {report.reportedBy} members • {report.reportedTime}
                  </span>
                </div>

                <div className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 self-start">
                  {report.aiConfidence}
                </div>
              </div>

              {/* Author and flagged content text */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">{report.author}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{report.authorHandle}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  "{report.content}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleAction(report.id, "DISMISSED")}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                >
                  Dismiss Report (False Positive)
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleAction(report.id, "WARNED USER")}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
                  >
                    Send Warning Note
                  </button>
                  <button
                    onClick={() => handleAction(report.id, "REMOVED POST")}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Content
                  </button>
                  <button
                    onClick={() => handleAction(report.id, "USER SHADOWBANNED")}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" /> Shadowban Spammer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
