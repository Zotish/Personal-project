import React, { useState } from "react";
import {
  Users, Shield, UserPlus, Search, Filter, MoreVertical,
  CheckCircle2, X, AlertTriangle, Key, ShieldCheck, Mail
} from "lucide-react";
import { ROLE_CONFIGS, AdminRole, useAdminRole } from "../../../../context/AdminRoleContext";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: AdminRole;
  department: string;
  status: "active" | "suspended";
  joinedDate: string;
  twoFactorEnabled: boolean;
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "STF-01",
    name: "Tanvir Rahman",
    email: "tanvir.lead@pathasathi.org",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    role: "super_admin",
    department: "Platform Engineering",
    status: "active",
    joinedDate: "Jan 2024",
    twoFactorEnabled: true,
  },
  {
    id: "STF-02",
    name: "Fatima Zahra",
    email: "fatima.mod@pathasathi.org",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    role: "moderator",
    department: "Trust & Safety Team",
    status: "active",
    joinedDate: "Mar 2024",
    twoFactorEnabled: true,
  },
  {
    id: "STF-03",
    name: "Shahriar Kabir, Esq.",
    email: "compliance@pathasathi.org",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    role: "verifier",
    department: "Legal & Regulatory Compliance",
    status: "active",
    joinedDate: "Feb 2024",
    twoFactorEnabled: true,
  },
  {
    id: "STF-04",
    name: "Arif Hossain",
    email: "commerce@pathasathi.org",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    role: "marketplace_admin",
    department: "Merchant Operations",
    status: "active",
    joinedDate: "Apr 2024",
    twoFactorEnabled: false,
  },
  {
    id: "STF-05",
    name: "Nusrat Jahan",
    email: "resources@pathasathi.org",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    role: "resource_editor",
    department: "Civic Resource & Map Directory",
    status: "active",
    joinedDate: "May 2024",
    twoFactorEnabled: true,
  },
  {
    id: "STF-06",
    name: "Kamrul Islam",
    email: "support@pathasathi.org",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    role: "support_agent",
    department: "Customer Care & Helpdesk",
    status: "active",
    joinedDate: "Jun 2024",
    twoFactorEnabled: true,
  },
];

export function AdminRoleManagement() {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRole>("moderator");

  const handleRoleChange = (id: string, newRole: AdminRole) => {
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, role: newRole } : s));
  };

  const handleToggleStatus = (id: string) => {
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: s.status === "active" ? "suspended" : "active" } : s));
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newStaff: StaffMember = {
      id: `STF-${Math.floor(10 + Math.random() * 90)}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
      role: inviteRole,
      department: ROLE_CONFIGS[inviteRole].title,
      status: "active",
      joinedDate: "Just now",
      twoFactorEnabled: false,
    };

    setStaffList(prev => [newStaff, ...prev]);
    setIsInviteOpen(false);
    setInviteName("");
    setInviteEmail("");
  };

  const filtered = staffList.filter(s => {
    const matchQuery = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    if (roleFilter !== "all") return matchQuery && s.role === roleFilter;
    return matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase text-red-600 font-bold tracking-wider">Super Admin Exclusive</span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Staff Directory & Role-Based Permissions (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage administrative personnel, assign department scopes, and enforce two-factor security standards.
          </p>
        </div>
        <button
          onClick={() => setIsInviteOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#C04A22] hover:bg-[#A83D1B] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Admin Member</span>
        </button>
      </div>

      {/* Role Counts Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {(Object.keys(ROLE_CONFIGS) as AdminRole[]).map(roleKey => {
          const cfg = ROLE_CONFIGS[roleKey];
          const count = staffList.filter(s => s.role === roleKey).length;
          return (
            <div key={roleKey} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 truncate">{cfg.title.split(" ")[0]}</span>
              <div className="text-lg font-black text-slate-900 mt-1">{count} <span className="text-[10px] text-slate-400 font-normal">staff</span></div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by staff name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C04A22] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#C04A22] focus:bg-white w-full sm:w-auto cursor-pointer"
          >
            <option value="all">All Roles ({staffList.length})</option>
            {(Object.keys(ROLE_CONFIGS) as AdminRole[]).map(r => (
              <option key={r} value={r}>{ROLE_CONFIGS[r].title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Current Role Scope</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">2FA Security</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map(staff => {
                return (
                  <tr key={staff.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={staff.avatar} alt={staff.name} className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{staff.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({staff.id})</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{staff.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={staff.role}
                        onChange={(e) => handleRoleChange(staff.id, e.target.value as AdminRole)}
                        className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-2.5 py-1 focus:outline-none focus:border-[#C04A22] font-semibold cursor-pointer"
                      >
                        {(Object.keys(ROLE_CONFIGS) as AdminRole[]).map(r => (
                          <option key={r} value={r}>{ROLE_CONFIGS[r].title}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{staff.department}</td>
                    <td className="py-3 px-4">
                      {staff.twoFactorEnabled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Enforced
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> Optional
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        staff.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(staff.id)}
                        className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      >
                        {staff.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-900">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-slate-900">
                <UserPlus className="w-4 h-4 text-[#C04A22]" /> Invite Administrative Staff
              </h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asif Mahmud"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Official Organization Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@pathasathi.org"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Administrative Role & Scope</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white cursor-pointer"
                >
                  {(Object.keys(ROLE_CONFIGS) as AdminRole[]).map(r => (
                    <option key={r} value={r}>{ROLE_CONFIGS[r].title} - {ROLE_CONFIGS[r].description}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C04A22] hover:bg-[#A83D1B] text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
