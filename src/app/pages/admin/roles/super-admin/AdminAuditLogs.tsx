import React, { useState } from "react";
import { FileText, Search, Filter, Download, Shield, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  target: string;
  details: string;
  severity: "info" | "warning" | "critical";
  ipAddress: string;
}

const INITIAL_LOGS: AuditEntry[] = [
  {
    id: "LOG-9921",
    timestamp: "2026-09-18 20:14:02",
    actorName: "Fatima Zahra",
    actorRole: "Trust & Safety Moderator",
    action: "USER_SHADOWBANNED",
    target: "@scam_bot99",
    details: "Automated AI match 99.4% confidence (Fraud & Fake SSN offer)",
    severity: "critical",
    ipAddress: "192.168.1.42",
  },
  {
    id: "LOG-9920",
    timestamp: "2026-09-18 19:48:15",
    actorName: "Shahriar Kabir, Esq.",
    actorRole: "Verification Officer",
    action: "BADGE_GRANTED",
    target: "Nadia Islam, Esq.",
    details: "Verified NY State Bar License #456789. Granted Verified Legal Advisor badge.",
    severity: "info",
    ipAddress: "172.56.21.90",
  },
  {
    id: "LOG-9919",
    timestamp: "2026-09-18 18:22:40",
    actorName: "Arif Hossain",
    actorRole: "Marketplace Admin",
    action: "SELLER_STORE_APPROVED",
    target: "Bangla Grocery Queens",
    details: "Approved storefront application following physical address proof validation.",
    severity: "info",
    ipAddress: "108.34.12.8",
  },
  {
    id: "LOG-9918",
    timestamp: "2026-09-18 16:05:11",
    actorName: "Nusrat Jahan",
    actorRole: "Resource Editor",
    action: "EMERGENCY_BROADCAST_PUBLISHED",
    target: "USCIS EAD Auto-Extension Notice",
    details: "Published nationwide urgent alert ribbon regarding 540-day EAD extension.",
    severity: "warning",
    ipAddress: "68.192.4.11",
  },
  {
    id: "LOG-9917",
    timestamp: "2026-09-18 14:19:30",
    actorName: "Tanvir Rahman",
    actorRole: "Super Admin",
    action: "ROLE_PERMISSION_UPDATED",
    target: "Arif Hossain (STF-04)",
    details: "Elevated from Support Agent to Marketplace & Commerce Admin.",
    severity: "warning",
    ipAddress: "10.0.0.1",
  },
  {
    id: "LOG-9916",
    timestamp: "2026-09-18 11:32:00",
    actorName: "Kamrul Islam",
    actorRole: "Support Agent",
    action: "PASSWORD_RESET_TRIGGERED",
    target: "USR-9481 (Rafiq Ahmed)",
    details: "Identity confirmed via phone OTP verification; reset link dispatched.",
    severity: "info",
    ipAddress: "192.168.4.19",
  },
];

export function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditEntry[]>(INITIAL_LOGS);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filtered = logs.filter(l => {
    const matches = l.actorName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase());
    if (severityFilter !== "all") return matches && l.severity === severityFilter;
    return matches;
  });

  const exportLogs = () => {
    const jsonStr = JSON.stringify(filtered, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pathasathi_audit_logs_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase text-red-600 font-bold tracking-wider">Super Admin Exclusive</span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Security Audit Trail & Compliance Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable chronological record of administrative actions, permission grants, and content enforcements.
          </p>
        </div>
        <button
          onClick={exportLogs}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#C04A22]" />
          <span>Export JSON Audit Trail</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by actor, action, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C04A22] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#C04A22] focus:bg-white w-full sm:w-auto cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings</option>
            <option value="info">Informational</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Enforcement Details</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{log.actorName}</div>
                    <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      log.severity === "critical" ? "bg-red-50 text-red-700 border-red-200" :
                      log.severity === "warning" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">{log.target}</td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-xs">{log.details}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
