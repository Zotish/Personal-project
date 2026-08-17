import React, { useState } from "react";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Shield, AlertTriangle, Users, CheckCircle, Flag, BarChart2, Eye,
  Ban, Clock, TrendingUp, MessageCircle, Building, Star, Zap,
  X, ChevronRight, Bell, Activity, Server, Database, Cpu, Sliders,
  Terminal, Radio, Search, Filter, Lock, RefreshCw, FileText, Globe,
  Award, Check, Power, Download, UserX, UserCheck, Sparkles, CheckSquare,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// ─── MOCK DATA FOR TWITTER / META STYLE ADMIN COMMAND CENTER ──────────────────

type SystemMetric = {
  label: string;
  value: string;
  change: string;
  status: "normal" | "warning" | "critical";
  icon: any;
};

const systemMetrics: SystemMetric[] = [
  { label: "Active Users (Live)", value: "248,392", change: "+12.4%", status: "normal", icon: Users },
  { label: "API Requests / Min", value: "14,280 RPM", change: "+5.1%", status: "normal", icon: Activity },
  { label: "Global Latency", value: "38 ms", change: "-4 ms", status: "normal", icon: Server },
  { label: "AI Moderation Queue", value: "47 items", change: "+8 new", status: "warning", icon: Flag },
  { label: "Pending Verifications", value: "23 requests", change: "+3 today", status: "normal", icon: Award },
  { label: "System Error Rate", value: "0.02%", change: "-0.01%", status: "normal", icon: Cpu },
];

const platformServices = [
  { name: "Auth & Identity Engine", status: "Operational", uptime: "99.99%", latency: "14ms", load: "24%" },
  { name: "Home Feed & Recommendations", status: "Operational", uptime: "99.95%", latency: "42ms", load: "61%" },
  { name: "Media CDN (Image/Video Upload)", status: "Operational", uptime: "99.98%", latency: "28ms", load: "45%" },
  { name: "AI Content Moderation Pipeline", status: "Operational", uptime: "99.90%", latency: "120ms", load: "78%" },
  { name: "Geographic Map & Local Discovery", status: "Operational", uptime: "100.0%", latency: "19ms", load: "18%" },
  { name: "Push & Emergency Broadcast Hub", status: "Operational", uptime: "100.0%", latency: "8ms", load: "12%" },
];

const initialUsers = [
  { id: "USR-9481", name: "Rafiq Ahmed", handle: "@rafiq_nyc", role: "User", status: "active", verified: true, joined: "Jan 2024", posts: 142, reports: 0, location: "Queens, NY" },
  { id: "USR-8821", name: "Nadia Islam, Esq.", handle: "@nadia_legal", role: "Advisor", status: "active", verified: true, joined: "Feb 2024", posts: 98, reports: 0, location: "Manhattan, NY" },
  { id: "USR-7412", name: "Dr. Priya Menon", handle: "@dr_priya", role: "Advisor", status: "active", verified: true, joined: "Mar 2024", posts: 56, reports: 0, location: "Brooklyn, NY" },
  { id: "USR-3109", name: "unknown_user123", handle: "@scam_bot99", role: "User", status: "flagged", verified: false, joined: "2 hours ago", posts: 4, reports: 12, location: "Unknown IP" },
  { id: "USR-1029", name: "Bangla Grocery Queens", handle: "@deshi_grocery", role: "Seller", status: "active", verified: true, joined: "Dec 2023", posts: 210, reports: 1, location: "Jackson Heights, NY" },
  { id: "USR-5541", name: "Spam Account #42", handle: "@visa_fast_track", role: "User", status: "banned", verified: false, joined: "1 day ago", posts: 18, reports: 34, location: "Proxy IP" },
];

const initialReports = [
  {
    id: 1,
    type: "post",
    author: "scam_bot99",
    content: "I can guarantee fake SSN & green card in 48 hours for $300. DM me fast!",
    reason: "Fraud & Financial Scam",
    reportedBy: 12,
    reportedTime: "10m ago",
    severity: "critical",
    aiConfidence: "99.4% AI Match (Fraud)",
  },
  {
    id: 2,
    type: "post",
    author: "job_scam_alert",
    content: "Guaranteed $50/hr cash jobs without work permit needed. Send SSN to register.",
    reason: "Phishing & Identity Theft",
    reportedBy: 8,
    reportedTime: "45m ago",
    severity: "high",
    aiConfidence: "94.1% AI Match (Phishing)",
  },
  {
    id: 3,
    type: "comment",
    author: "troll_user_nyc",
    content: "Don't listen to this attorney, they are giving illegal advice to scam immigrants...",
    reason: "Harassment & Defamation",
    reportedBy: 3,
    reportedTime: "2h ago",
    severity: "medium",
    aiConfidence: "81.0% AI Match (Harassment)",
  },
  {
    id: 4,
    type: "profile",
    author: "fake_attorney_pro",
    content: "Licensed NYC Immigration Attorney (No Bar ID provided)",
    reason: "Impersonation & Unlicensed Advice",
    reportedBy: 6,
    reportedTime: "4h ago",
    severity: "high",
    aiConfidence: "88.7% AI Match (Impersonation)",
  },
];

const initialVerifications = [
  {
    id: 1,
    name: "Nadia Islam",
    role: "Immigration Legal Attorney",
    credential: "NY State Bar License #456789 (Active)",
    documents: ["Bar_Card_Scan.pdf", "State_ID.jpg"],
    submitted: "3 hours ago",
    badgeType: "Legal Advisor",
  },
  {
    id: 2,
    name: "Dr. Priya Menon",
    role: "Healthcare Navigator & MD",
    credential: "NYS Board of Medicine #MD-2024-890",
    documents: ["Medical_License.pdf"],
    submitted: "1 day ago",
    badgeType: "Healthcare Advisor",
  },
  {
    id: 3,
    name: "Ahmed Hassan, CPA",
    role: "Tax & Financial Consultant",
    credential: "CPA License #NY-23456",
    documents: ["CPA_Certificate.pdf"],
    submitted: "2 days ago",
    badgeType: "Financial Advisor",
  },
];

const initialAnnouncements = [
  {
    id: 1,
    title: "USCIS EAD Auto-Extension Notice",
    msg: "Automatic 540-day extension for qualifying I-765 renewal applicants active nationwide.",
    scope: "National (USA)",
    severity: "info",
    active: true,
    created: "Aug 15, 2026",
  },
  {
    id: 2,
    title: "NYC Emergency Shelter & Heating Alert",
    msg: "Emergency winter shelters open in Brooklyn, Queens, and Bronx for all residents regardless of status.",
    scope: "New York City Metro Area",
    severity: "warning",
    active: false,
    created: "Aug 10, 2026",
  },
];

const initialFeatureFlags = [
  { id: "photo_video_uploads", label: "Photo & Video Uploads in Composer", category: "Core Feed", enabled: true, description: "Allows users to attach photos and video files to community posts" },
  { id: "ai_assistant", label: "PathaSathi AI Assistant", category: "AI Tools", enabled: true, description: "Provides instant AI legal and community navigation assistance" },
  { id: "marketplace_sellers", label: "Seller Marketplace & Catalog", category: "Commerce", enabled: true, description: "Enables verified sellers to publish products and accept inquiries" },
  { id: "live_map_discovery", label: "Interactive Resource Map", category: "Discovery", enabled: true, description: "Interactive map displaying legal aid, clinics, groceries, and mosques" },
  { id: "emergency_broadcast", label: "Emergency Notice Banner", category: "Safety", enabled: true, description: "Top banner broadcast system for emergency immigrant alerts" },
  { id: "shadowban_engine", label: "Automatic AI Shadowbanning", category: "Security", enabled: false, description: "Automatically hides posts flagged with >95% fraud AI confidence score" },
];

const systemLogs = [
  { time: "03:04:12", level: "INFO", source: "AuthEngine", message: "User USR-9481 successfully authenticated via OAuth2" },
  { time: "03:03:55", level: "WARN", source: "AIModerator", message: "Post #8821 flagged for keyword match: 'fake SSN'" },
  { time: "03:02:10", level: "INFO", source: "CDNService", message: "Video transcode completed for post #9412 (1080p MP4)" },
  { time: "03:00:44", level: "INFO", source: "PushHub", message: "Broadcast notification dispatched to 42,100 Queens devices" },
  { time: "02:58:30", level: "ERROR", source: "DBReplica", message: "Transient connection reset on read replica #2 (Auto-recovered in 12ms)" },
];

export function Admin() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"overview" | "moderation" | "users" | "verifications" | "announcements" | "dev_console">("overview");

  // State Management
  const [users, setUsers] = useState(initialUsers);
  const [reports, setReports] = useState(initialReports);
  const [verifications, setVerifications] = useState(initialVerifications);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [featureFlags, setFeatureFlags] = useState(initialFeatureFlags);

  // Filters & Search
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [reportFilter, setReportFilter] = useState("all");
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeMsg, setNewNoticeMsg] = useState("");
  const [newNoticeScope, setNewNoticeScope] = useState("NYC Metro");

  // Handlers
  const handleBanUser = (handle: string) => {
    setUsers(prev => prev.map(u => u.handle === handle ? { ...u, status: "banned" } : u));
    setReports(prev => prev.filter(r => r.author !== handle.replace("@", "")));
  };

  const handleResolveReport = (id: number) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const handleApproveVerification = (id: number) => {
    setVerifications(prev => prev.filter(v => v.id !== id));
  };

  const handleToggleNotice = (id: number) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeMsg.trim()) return;
    setAnnouncements(prev => [
      {
        id: Date.now(),
        title: newNoticeTitle,
        msg: newNoticeMsg,
        scope: newNoticeScope,
        severity: "info",
        active: true,
        created: "Just now",
      },
      ...prev
    ]);
    setNewNoticeTitle("");
    setNewNoticeMsg("");
  };

  const handleToggleFeatureFlag = (id: string) => {
    setFeatureFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.handle.toLowerCase().includes(userSearch.toLowerCase());
    if (userFilter === "verified") return matchesSearch && u.verified;
    if (userFilter === "banned") return matchesSearch && u.status === "banned";
    if (userFilter === "advisor") return matchesSearch && u.role === "Advisor";
    return matchesSearch;
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-4 pb-12">
        {/* Top Control Bar / Command Center Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-800 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#C04A22]/20 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C04A22] to-[#8C3015] flex items-center justify-center text-white shadow-lg shadow-[#C04A22]/30 flex-shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                    PathaSathi Admin Command Center
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live System
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Platform Moderation, System Analytics & Infrastructure Management Suite
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C04A22] hover:bg-[#8C3015] text-xs font-bold text-white transition-colors shadow-md">
                <Download className="w-3.5 h-3.5" /> Export Audit Log
              </button>
            </div>
          </div>

          {/* Real-time System Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6 pt-5 border-t border-slate-800/80">
            {systemMetrics.map(({ label, value, change, status, icon: Icon }) => (
              <div key={label} className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60 backdrop-blur-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium mb-1">
                  <span className="truncate">{label}</span>
                  <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                </div>
                <div className="text-base sm:text-lg font-bold text-white tracking-tight">{value}</div>
                <div className={`text-[10px] font-bold mt-0.5 ${status === "warning" ? "text-amber-400" : "text-emerald-400"}`}>
                  {change}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-border bg-white rounded-2xl p-1.5 border shadow-2xs scrollbar-hide">
          {[
            { id: "overview",      label: "System Overview",    icon: BarChart2, badge: null },
            { id: "moderation",    label: "Trust & Safety Queue", icon: Flag,     badge: reports.length },
            { id: "users",         label: "User Directory",     icon: Users,    badge: null },
            { id: "verifications", label: "Verifications Queue", icon: Award,    badge: verifications.length },
            { id: "announcements", label: "Emergency Notices",  icon: Radio,    badge: announcements.filter(a => a.active).length },
            { id: "dev_console",   label: "Developer Console",  icon: Terminal, badge: "Live" },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all flex-shrink-0 group ${
                  active
                    ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/20 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-[#8C3015] hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${active ? "text-[#C04A22]" : "text-slate-500 group-hover:text-[#8C3015]"}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    active ? "bg-[#C04A22] text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: SYSTEM OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Services Infrastructure Status */}
            <div className="bg-white rounded-3xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-[#C04A22]" />
                  <h3 className="font-bold text-base text-foreground">Infrastructure Services Health</h3>
                </div>
                <span className="text-xs text-muted-foreground font-medium">All 6 core services operational</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {platformServices.map(service => (
                  <div key={service.name} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{service.name}</span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> {service.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                      <div><span className="block text-[9px] text-slate-600 uppercase">Uptime</span><strong className="text-slate-800 font-semibold">{service.uptime}</strong></div>
                      <div><span className="block text-[9px] text-slate-600 uppercase">Latency</span><strong className="text-slate-800 font-semibold">{service.latency}</strong></div>
                      <div><span className="block text-[9px] text-slate-600 uppercase">Cpu Load</span><strong className="text-slate-800 font-semibold">{service.load}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Management Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl border border-border p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-red-600 font-bold text-sm mb-2">
                    <AlertTriangle className="w-4.5 h-4.5 text-red-600" /> Pending Moderation Queue
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">{reports.length} Reports</div>
                  <p className="text-xs text-slate-500">Requires human admin review for fraud & harassment</p>
                </div>
                <button
                  onClick={() => setActiveTab("moderation")}
                  className="mt-4 w-full py-2.5 rounded-xl bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 transition flex items-center justify-center gap-1"
                >
                  Open Moderation Suite <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-border p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
                    <Award className="w-4.5 h-4.5 text-amber-600" /> Legal & Advisor Requests
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">{verifications.length} Credentials</div>
                  <p className="text-xs text-slate-500">Attorneys and health navigators awaiting checkmark</p>
                </div>
                <button
                  onClick={() => setActiveTab("verifications")}
                  className="mt-4 w-full py-2.5 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs hover:bg-amber-100 transition flex items-center justify-center gap-1"
                >
                  Review Verifications <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-border p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                    <Radio className="w-4.5 h-4.5 text-primary" /> Active Emergency Alerts
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">{announcements.filter(a => a.active).length} Active Notices</div>
                  <p className="text-xs text-slate-500">Broadcast banner alert live for NYC immigrants</p>
                </div>
                <button
                  onClick={() => setActiveTab("announcements")}
                  className="mt-4 w-full py-2.5 rounded-xl bg-[#C04A22]/10 text-[#8C3015] font-bold text-xs hover:bg-[#C04A22]/20 transition flex items-center justify-center gap-1"
                >
                  Broadcast New Notice <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRUST & SAFETY / CONTENT MODERATION */}
        {activeTab === "moderation" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-border p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Trust & Safety Content Queue</h3>
                <p className="text-xs text-slate-500">Review flagged posts, comments, and scam reports</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Filter:</span>
                {["all", "critical", "high", "medium"].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setReportFilter(sev)}
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all ${
                      reportFilter === sev
                        ? "bg-[#C04A22] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="bg-white rounded-3xl border border-border p-12 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="font-bold text-base text-slate-900">All Flagged Content Resolved!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">The moderation queue is completely empty. System content quality score is 100%.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports
                  .filter(r => reportFilter === "all" || r.severity === reportFilter)
                  .map(report => (
                    <div key={report.id} className="bg-white rounded-3xl border border-border p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            report.severity === "critical" ? "bg-red-100 text-red-700"
                            : report.severity === "high" ? "bg-orange-100 text-orange-700"
                            : "bg-amber-100 text-amber-700"
                          }`}>
                            <Flag className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">@{report.author}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                report.severity === "critical" ? "bg-red-600 text-white"
                                : report.severity === "high" ? "bg-orange-500 text-white"
                                : "bg-amber-500 text-white"
                              }`}>
                                {report.severity}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Reason: <strong className="text-slate-800">{report.reason}</strong> · Reported by {report.reportedBy} users
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-auto">
                          <Clock className="w-3.5 h-3.5" /> {report.reportedTime}
                        </div>
                      </div>

                      {/* Content Box */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-medium mb-3">
                        "{report.content}"
                      </div>

                      {/* AI Detection Info */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs font-semibold text-purple-700 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" /> {report.aiConfidence}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleBanUser(`@${report.author}`)}
                            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                          >
                            <Ban className="w-3.5 h-3.5" /> Ban User
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Remove Post
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USER DIRECTORY & MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-border p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search user by name or handle..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#C04A22]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-hide">
                {["all", "verified", "advisor", "banned"].map(f => (
                  <button
                    key={f}
                    onClick={() => setUserFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      userFilter === f
                        ? "bg-[#C04A22] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 font-bold">
                              {u.name[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1">
                                {u.name} {u.verified && <CheckCircle className="w-3.5 h-3.5 text-primary fill-primary/10" />}
                              </div>
                              <div className="text-[11px] text-slate-400">{u.handle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-800">{u.role}</td>
                        <td className="p-4 text-slate-600">{u.location}</td>
                        <td className="p-4 text-slate-500">{u.joined}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.status === "active" ? "bg-emerald-100 text-emerald-700"
                            : u.status === "flagged" ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-700"
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {u.status === "banned" ? (
                            <button
                              onClick={() => setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: "active" } : x))}
                              className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanUser(u.handle)}
                              className="px-3 py-1 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-bold transition"
                            >
                              Ban User
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VERIFICATIONS QUEUE */}
        {activeTab === "verifications" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-xs text-primary font-medium">
                Verified advisors receive the official Blue Checkmark and get top ranking in legal & medical directory searches. Verify official license numbers before approving.
              </p>
            </div>

            {verifications.length === 0 ? (
              <div className="bg-white rounded-3xl border border-border p-12 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="font-bold text-base text-slate-900">No Pending Verifications</h4>
                <p className="text-xs text-slate-500 mt-1">All advisor credential requests have been processed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {verifications.map(v => (
                  <div key={v.id} className="bg-white rounded-3xl border border-border p-5">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black flex items-center justify-center text-base flex-shrink-0 shadow-md">
                          {v.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-900">{v.name}</h4>
                          <div className="text-xs text-slate-500 font-medium">{v.role}</div>
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-primary">
                            {v.badgeType}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{v.submitted}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1 mb-4">
                      <div>Official License / Credential: <strong className="text-slate-900">{v.credential}</strong></div>
                      <div>Uploaded Scans: <span className="text-primary underline cursor-pointer">{v.documents.join(", ")}</span></div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveVerification(v.id)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve & Issue Blue Checkmark
                      </button>
                      <button
                        onClick={() => handleApproveVerification(v.id)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: EMERGENCY NOTICES BROADCAST */}
        {activeTab === "announcements" && (
          <div className="space-y-5">
            {/* Create New Emergency Notice Form */}
            <form onSubmit={handleCreateNotice} className="bg-white rounded-3xl border border-border p-5 space-y-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#C04A22]" /> Broadcast Emergency Alert Notice
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newNoticeTitle}
                  onChange={e => setNewNoticeTitle(e.target.value)}
                  placeholder="Notice Title (e.g. USCIS EAD Rule Update)"
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#C04A22]"
                />
                <select
                  value={newNoticeScope}
                  onChange={e => setNewNoticeScope(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#C04A22]"
                >
                  <option value="NYC Metro">NYC Metro Area (Queens/Brooklyn/NYC)</option>
                  <option value="National (USA)">National (USA Immigrants)</option>
                  <option value="Statewide NY">Statewide New York</option>
                </select>
              </div>

              <textarea
                value={newNoticeMsg}
                onChange={e => setNewNoticeMsg(e.target.value)}
                placeholder="Alert Message details for users..."
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#C04A22]"
              />

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
              >
                <Bell className="w-4 h-4" /> Publish Broadcast Banner
              </button>
            </form>

            {/* Existing Announcements */}
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className={`rounded-3xl border p-5 transition-all ${a.active ? "bg-red-50/60 border-red-200" : "bg-white border-border"}`}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-5 h-5 ${a.active ? "text-red-600" : "text-slate-400"}`} />
                      <h4 className="font-bold text-base text-slate-900">{a.title}</h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      a.active ? "bg-red-600 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      {a.active ? "Live Alert" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mb-3 font-medium">{a.msg}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                    <span>Scope: <strong className="text-slate-800">{a.scope}</strong></span>
                    <button
                      onClick={() => handleToggleNotice(a.id)}
                      className="font-bold text-[#C04A22] hover:underline"
                    >
                      {a.active ? "Deactivate Notice" : "Activate Notice"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: DEVELOPER CONSOLE & FEATURE FLAGS */}
        {activeTab === "dev_console" && (
          <div className="space-y-5">
            {/* Feature Flags Grid */}
            <div className="bg-white rounded-3xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#C04A22]" /> Feature Flags & Toggles
                  </h3>
                  <p className="text-xs text-slate-500">Enable or disable system modules live in real-time without re-deploying</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featureFlags.map(flag => (
                  <div key={flag.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {flag.label}
                        <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                          {flag.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{flag.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleFeatureFlag(flag.id)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors flex-shrink-0 ${
                        flag.enabled ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"
                      } flex items-center`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* System Logs Terminal */}
            <div className="bg-slate-950 text-slate-200 rounded-3xl border border-slate-800 p-5 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-slate-400">
                <span className="flex items-center gap-2 font-bold text-slate-300">
                  <Terminal className="w-4 h-4 text-emerald-400" /> Live System Logs & Diagnostics
                </span>
                <span className="text-[10px] text-slate-500">Streaming (5 events/min)</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {systemLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    <span className="text-slate-500 flex-shrink-0">{log.time}</span>
                    <span className={`font-bold flex-shrink-0 ${
                      log.level === "ERROR" ? "text-red-400" : log.level === "WARN" ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      [{log.level}]
                    </span>
                    <span className="text-slate-400 font-semibold flex-shrink-0">[{log.source}]</span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
