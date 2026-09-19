import React, { useState } from "react";
import {
  Users, Search, Shield, Key, Mail, Phone, MapPin,
  Clock, AlertTriangle, CheckCircle2, XCircle, Lock,
  Unlock, RefreshCw, Send, Smartphone, ExternalLink, X
} from "lucide-react";

interface MemberRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  roleBadge: string;
  status: "active" | "suspended" | "pending_verification";
  joinedDate: string;
  lastActive: string;
  location: string;
  ipAddress: string;
  failedLogins: number;
  devices: string[];
  recentActivities: { action: string; time: string }[];
}

const MOCK_MEMBERS: MemberRecord[] = [
  {
    id: "USR-9921",
    name: "Tariqul Islam",
    email: "tariq.islam@gmail.com",
    phone: "+1 (347) 555-8821",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    roleBadge: "Verified Legal Advisor",
    status: "active",
    joinedDate: "Mar 12, 2025",
    lastActive: "10 mins ago",
    location: "Jackson Heights, Queens, NY",
    ipAddress: "72.229.144.18 (Verizon Fios NY)",
    failedLogins: 0,
    devices: ["iPhone 15 Pro (iOS 18)", "MacBook Air M2 (Chrome 128)"],
    recentActivities: [
      { action: "Answered community Q&A question on H-1B Grace Period", time: "1 hour ago" },
      { action: "Approved legal consultation request from USR-4412", time: "3 hours ago" },
      { action: "Updated office business hours in Directory listing", time: "Yesterday" },
    ],
  },
  {
    id: "USR-8812",
    name: "Nazmul Haque",
    email: "nazmul.haque@yahoo.com",
    phone: "+1 (718) 555-3341",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    roleBadge: "Marketplace Merchant",
    status: "active",
    joinedDate: "Nov 04, 2024",
    lastActive: "2 hours ago",
    location: "Jamaica, Queens, NY",
    ipAddress: "68.174.92.102 (Spectrum NY)",
    failedLogins: 2,
    devices: ["Samsung Galaxy S23 (Android 14)"],
    recentActivities: [
      { action: "Listed new item 'Fresh Padma Hilsha Fish' on Marketplace", time: "2 hours ago" },
      { action: "Failed password attempt from unrecognized mobile browser", time: "5 hours ago" },
      { action: "Completed pickup delivery at Jackson Heights Safe Zone", time: "Yesterday" },
    ],
  },
  {
    id: "USR-7734",
    name: "Sadia Rahman",
    email: "sadia.r@outlook.com",
    phone: "+1 (929) 555-0912",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    roleBadge: "Community Member",
    status: "suspended",
    joinedDate: "Feb 18, 2026",
    lastActive: "3 days ago",
    location: "Brooklyn, NY",
    ipAddress: "172.56.21.90 (T-Mobile USA)",
    failedLogins: 5,
    devices: ["iPhone 13 (Safari iOS 17)"],
    recentActivities: [
      { action: "Account suspended due to repeated spam report in Feed", time: "3 days ago" },
      { action: "Flagged by AI automated filter for high scam probability", time: "3 days ago" },
    ],
  },
];

export function UserLookup() {
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<MemberRecord | null>(MOCK_MEMBERS[0]);
  const [members, setMembers] = useState<MemberRecord[]>(MOCK_MEMBERS);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const match = members.find(
      m =>
        m.email.toLowerCase().includes(query.toLowerCase()) ||
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.phone.includes(query) ||
        m.id.toLowerCase().includes(query.toLowerCase())
    );
    if (match) {
      setSelectedUser(match);
      setFeedback(`Found record for ${match.name} (${match.id})`);
    } else {
      setFeedback(`No user found matching "${query}". Please check email or User ID.`);
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSendResetLink = (email: string) => {
    setFeedback(`Security link: One-time password reset dispatched to ${email}`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSend2FABypass = (phone: string) => {
    setFeedback(`SMS Bypass: Temporary 2FA recovery token sent via SMS to ${phone}`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleToggleSuspension = (id: string) => {
    setMembers(prev =>
      prev.map(m => {
        if (m.id === id) {
          const nextStatus: MemberRecord["status"] = m.status === "suspended" ? "active" : "suspended";
          const updated: MemberRecord = { ...m, status: nextStatus, failedLogins: 0 };
          setSelectedUser(updated);
          return updated;
        }
        return m;
      })
    );
    setFeedback("Account access status updated.");
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase text-cyan-700 font-bold tracking-wider">
            User Security & Identity Support
          </span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Member Inspector & Account Recovery
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search ImmigrantConnect registered users by email, phone, or ID to assist with lockouts, password resets, and account audits.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)}><X className="w-3.5 h-3.5 text-cyan-700" /></button>
        </div>
      )}

      {/* Search Input */}
      <form onSubmit={handleSearch} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by email (e.g. faruk.ny@gmail.com), name, phone (+1...), or User ID (USR-9921)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-xs shadow-cyan-600/20 flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Lookup User</span>
        </button>
      </form>

      {/* Quick Select Preset Users */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Quick Select Samples:</span>
        {members.map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedUser(m)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              selectedUser?.id === m.id
                ? "bg-cyan-50 text-cyan-800 border-cyan-300 font-bold"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border-slate-200"
            }`}
          >
            {m.name} ({m.id})
          </button>
        ))}
      </div>

      {/* User Record Card & Diagnostic Details */}
      {selectedUser && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main User Profile Card */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">{selectedUser.name}</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {selectedUser.id}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-cyan-700 mt-0.5 block">{selectedUser.roleBadge}</span>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Member since {selectedUser.joinedDate} • Last active: {selectedUser.lastActive}
                  </div>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  selectedUser.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {selectedUser.status}
              </span>
            </div>

            {/* Profile Contact & Geo Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] uppercase text-slate-400 font-mono font-bold block">Primary Email</span>
                <div className="flex items-center gap-2 text-xs text-slate-800 font-medium">
                  <Mail className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{selectedUser.email}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] uppercase text-slate-400 font-mono font-bold block">Verified Phone (SMS)</span>
                <div className="flex items-center gap-2 text-xs text-slate-800 font-medium">
                  <Phone className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{selectedUser.phone}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] uppercase text-slate-400 font-mono font-bold block">Registered Location</span>
                <div className="flex items-center gap-2 text-xs text-slate-800 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{selectedUser.location}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] uppercase text-slate-400 font-mono font-bold block">Last IP & Network</span>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-mono">
                  <span>{selectedUser.ipAddress}</span>
                </div>
              </div>
            </div>

            {/* Security Quick Actions */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800">Administrative Helpdesk Actions</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleSendResetLink(selectedUser.email)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition"
                >
                  <Key className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Password Reset</span>
                </button>

                <button
                  onClick={() => handleSend2FABypass(selectedUser.phone)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition"
                >
                  <Smartphone className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Send 2FA Bypass</span>
                </button>

                <button
                  onClick={() => handleToggleSuspension(selectedUser.id)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                    selectedUser.status === "suspended"
                      ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {selectedUser.status === "suspended" ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Lift Suspension</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Suspend User</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Device & Activity History */}
          <div className="lg:col-span-5 space-y-4">
            {/* Active Registered Devices */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-600" />
                <span>Authorized Active Devices ({selectedUser.devices.length})</span>
              </h4>
              <div className="space-y-2">
                {selectedUser.devices.map((dev, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-slate-700 font-medium">{dev}</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Trusted</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Activity Trail */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-600" />
                <span>Recent Account Activity</span>
              </h4>
              <div className="space-y-2.5">
                {selectedUser.recentActivities.map((act, i) => (
                  <div key={i} className="text-xs border-l-2 border-cyan-500 pl-3 py-1 space-y-0.5">
                    <div className="text-slate-800 leading-snug">{act.action}</div>
                    <div className="text-[10px] text-slate-400">{act.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
