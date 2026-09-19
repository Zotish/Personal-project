import React, { useState } from "react";
import {
  Bell, AlertTriangle, ShieldAlert, Info, Radio, Plus, CheckCircle2,
  X, Eye, Clock, Send, MapPin, Globe, Sparkles
} from "lucide-react";

interface BroadcastNotice {
  id: string;
  title: string;
  bnTitle: string;
  message: string;
  severity: "critical" | "warning" | "info";
  region: string;
  status: "active" | "scheduled" | "expired";
  createdAt: string;
  expiresAt: string;
  reachCount: number;
}

const INITIAL_BROADCASTS: BroadcastNotice[] = [
  {
    id: "BC-2026-09",
    title: "NYC Emergency Flash Flood Advisory - Subways & Basements Alert",
    bnTitle: "জরুরী ফ্লাশ ফ্লাড সতর্কতা - সাবওয়ে ও বেসমেন্ট অ্যাপার্টমেন্ট নিরাপদে থাকুন",
    message: "National Weather Service has issued a flash flood warning for Queens and Brooklyn. Immigrant families in basement apartments are advised to move to higher ground.",
    severity: "critical",
    region: "Queens & Brooklyn, NY",
    status: "active",
    createdAt: "25 mins ago",
    expiresAt: "Today 11:59 PM",
    reachCount: 14280,
  },
  {
    id: "BC-2026-08",
    title: "Special Consular Mobile Camp - Passport & NID Issuance in Jamaica",
    bnTitle: "বাংলাদেশ কনস্যুলেটের বিশেষ ভ্রাম্যমাণ পাসপোর্ট ও এনআইডি ক্যাম্প - জ্যামাইকা",
    message: "Special consular services counter open this weekend at Jamaica Muslim Center. Pre-booking not required for senior citizens.",
    severity: "info",
    region: "Jamaica, Queens, NY",
    status: "active",
    createdAt: "Yesterday",
    expiresAt: "In 3 days",
    reachCount: 8940,
  },
  {
    id: "BC-2026-07",
    title: "USCIS Policy Clarification: Public Charge Rule Awareness",
    bnTitle: "ইউএসসিআইএস পাবলিক চার্জ নিয়ম সংক্রান্ত সচেতনতামূলক নোটিশ",
    message: "Reminder to community members: Using SNAP food assistance or emergency Medicaid does not violate current immigration residency qualifications.",
    severity: "warning",
    region: "Nationwide (USA)",
    status: "expired",
    createdAt: "5 days ago",
    expiresAt: "Expired Sep 15",
    reachCount: 32400,
  },
];

export function EmergencyBroadcasts() {
  const [broadcasts, setBroadcasts] = useState<BroadcastNotice[]>(INITIAL_BROADCASTS);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [newBroadcast, setNewBroadcast] = useState({
    title: "",
    bnTitle: "",
    message: "",
    severity: "warning" as BroadcastNotice["severity"],
    region: "Queens & Brooklyn, NY",
    durationHours: "24",
    sendPush: true,
  });

  const activeBroadcasts = broadcasts.filter(b => b.status === "active");

  const handleToggleStatus = (id: string) => {
    setBroadcasts(prev =>
      prev.map(b => {
        if (b.id === id) {
          const nextStatus = b.status === "active" ? "expired" : "active";
          return { ...b, status: nextStatus };
        }
        return b;
      })
    );
    setFeedback("Broadcast alert transmission state updated.");
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBroadcast.title.trim() || !newBroadcast.message.trim()) return;

    const created: BroadcastNotice = {
      id: `BC-2026-${String(broadcasts.length + 10).padStart(2, "0")}`,
      title: newBroadcast.title.trim(),
      bnTitle: newBroadcast.bnTitle.trim() || newBroadcast.title.trim(),
      message: newBroadcast.message.trim(),
      severity: newBroadcast.severity,
      region: newBroadcast.region,
      status: "active",
      createdAt: "Just now",
      expiresAt: `In ${newBroadcast.durationHours} hours`,
      reachCount: 0,
    };

    setBroadcasts(prev => [created, ...prev]);
    setIsComposeOpen(false);
    setNewBroadcast({
      title: "",
      bnTitle: "",
      message: "",
      severity: "warning",
      region: "Queens & Brooklyn, NY",
      durationHours: "24",
      sendPush: true,
    });
    setFeedback(`Emergency Alert broadcasted live to ${created.region}!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase text-red-600 font-bold tracking-wider">
            Public Safety & Emergency Network
          </span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Emergency Broadcasts & Community Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dispatch urgent public safety notices, weather emergencies, legal rights alerts, and consular bulletins to immigrant users.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-600" />
            <span>{activeBroadcasts.length} Active Broadcasts</span>
          </div>
          <button
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-xs shadow-red-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch Broadcast</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)}><X className="w-3.5 h-3.5 text-red-700" /></button>
        </div>
      )}

      {/* Live Simulated Banner Preview */}
      {activeBroadcasts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-600" />
              Live User App Top Banner Preview:
            </span>
            <span className="text-[11px] text-slate-400">Rendering on mobile & web headers</span>
          </div>

          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            activeBroadcasts[0].severity === "critical"
              ? "bg-red-50 border-red-200 text-red-950"
              : activeBroadcasts[0].severity === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-950"
              : "bg-cyan-50 border-cyan-200 text-cyan-950"
          }`}>
            <div className={`p-2 rounded-xl ${
              activeBroadcasts[0].severity === "critical"
                ? "bg-red-100 text-red-700"
                : activeBroadcasts[0].severity === "warning"
                ? "bg-amber-100 text-amber-700"
                : "bg-cyan-100 text-cyan-700"
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/10">
                  {activeBroadcasts[0].severity}
                </span>
                <span className="text-xs font-black text-slate-900">{activeBroadcasts[0].title}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{activeBroadcasts[0].message}</p>
              <div className="text-[11px] text-slate-500 font-medium pt-0.5">
                বাংলা: {activeBroadcasts[0].bnTitle}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast History & Manage Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800">All Dispatched Broadcast Notices</h3>
        <div className="grid grid-cols-1 gap-4">
          {broadcasts.map(bc => (
            <div
              key={bc.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-slate-300 shadow-xs"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {bc.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    bc.severity === "critical"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : bc.severity === "warning"
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-cyan-50 text-cyan-800 border border-cyan-200"
                  }`}>
                    {bc.severity}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    bc.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}>
                    {bc.status}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {bc.region}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{bc.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{bc.message}</p>
                  <p className="text-[11px] text-slate-500 mt-1 italic">বাংলা: {bc.bnTitle}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Dispatched {bc.createdAt} • Expires {bc.expiresAt}
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    {bc.reachCount.toLocaleString()} Users Reached
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => handleToggleStatus(bc.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                    bc.status === "active"
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {bc.status === "active" ? "Deactivate Notice" : "Re-broadcast Live"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compose Broadcast Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Broadcast Emergency Community Notice</h3>
                <p className="text-xs text-slate-500">Instantly push alert banners to mobile & web clients</p>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline (English)</label>
                <input
                  type="text"
                  required
                  value={newBroadcast.title}
                  onChange={e => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
                  placeholder="e.g. Winter Storm Warning: Free Warming Shelters Open"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline (Bengali / বাংলা অনুবাদ)</label>
                <input
                  type="text"
                  value={newBroadcast.bnTitle}
                  onChange={e => setNewBroadcast({ ...newBroadcast, bnTitle: e.target.value })}
                  placeholder="e.g. তুষারঝড়ের সতর্কতা: কমিউনিটি ওয়ার্মিং সেন্টার খোলা আছে"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Body Message</label>
                <textarea
                  required
                  rows={3}
                  value={newBroadcast.message}
                  onChange={e => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
                  placeholder="Provide essential details, safety guidelines, and emergency helpline contact numbers..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Severity Tier</label>
                  <select
                    value={newBroadcast.severity}
                    onChange={e => setNewBroadcast({ ...newBroadcast, severity: e.target.value as BroadcastNotice["severity"] })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white"
                  >
                    <option value="critical">Critical (Red Banner)</option>
                    <option value="warning">Warning (Amber Banner)</option>
                    <option value="info">Informational (Cyan Banner)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Region</label>
                  <select
                    value={newBroadcast.region}
                    onChange={e => setNewBroadcast({ ...newBroadcast, region: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white"
                  >
                    <option value="Queens & Brooklyn, NY">Queens & Brooklyn, NY</option>
                    <option value="All NYC Metropolitan Area">All NYC Metropolitan Area</option>
                    <option value="Paterson & Jersey City, NJ">Paterson & Jersey City, NJ</option>
                    <option value="Nationwide (USA)">Nationwide (USA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Auto-Expire Duration</label>
                  <select
                    value={newBroadcast.durationHours}
                    onChange={e => setNewBroadcast({ ...newBroadcast, durationHours: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white"
                  >
                    <option value="6">6 Hours</option>
                    <option value="12">12 Hours</option>
                    <option value="24">24 Hours (1 Day)</option>
                    <option value="72">72 Hours (3 Days)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="pushToggle"
                    checked={newBroadcast.sendPush}
                    onChange={e => setNewBroadcast({ ...newBroadcast, sendPush: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500 bg-slate-50 border-slate-300"
                  />
                  <label htmlFor="pushToggle" className="text-xs text-slate-700">
                    Push Notification to Mobile
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs shadow-red-600/30 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Alert Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
