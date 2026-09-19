import React, { useState } from "react";
import { Award, Sparkles, ShieldCheck, Search, Filter, CheckCircle2, UserCheck, Trash2 } from "lucide-react";

interface BadgedMember {
  id: string;
  name: string;
  handle: string;
  badgeType: "Legal Advisor" | "Healthcare Provider" | "Tax Advisor" | "Golden Leader";
  grantedBy: string;
  grantedDate: string;
  licenseNumber?: string;
  avatar: string;
}

const INITIAL_BADGED_MEMBERS: BadgedMember[] = [
  {
    id: "USR-8821",
    name: "Nadia Islam, Esq.",
    handle: "@nadia_legal",
    badgeType: "Legal Advisor",
    grantedBy: "Shahriar Kabir (Compliance)",
    grantedDate: "Feb 2024",
    licenseNumber: "NY Bar #456789",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
  },
  {
    id: "USR-7412",
    name: "Dr. Priya Menon",
    handle: "@dr_priya",
    badgeType: "Healthcare Provider",
    grantedBy: "Shahriar Kabir (Compliance)",
    grantedDate: "Mar 2024",
    licenseNumber: "NYS MD #2024-890",
    avatar: "https://images.unsplash.com/photo-1594824813575-43a53d1000cf?w=150&h=150&fit=crop",
  },
  {
    id: "USR-9481",
    name: "Rahim Chowdhury",
    handle: "@rahim_bd",
    badgeType: "Golden Leader",
    grantedBy: "Tanvir Rahman (Super Admin)",
    grantedDate: "Jan 2024",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  },
];

export function BadgeManagement() {
  const [members, setMembers] = useState<BadgedMember[]>(INITIAL_BADGED_MEMBERS);
  const [search, setSearch] = useState("");

  const handleRevoke = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.handle.toLowerCase().includes(search.toLowerCase()) ||
    m.badgeType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase text-blue-700 font-bold tracking-wider">Compliance & Trust Module</span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Trust Badge Directory & Privilege Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active roster of authenticated legal counselors, medical guides, and Golden Community leaders.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search verified badge holders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C04A22] shadow-xs"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Badge Granted</th>
                <th className="py-3.5 px-4">Professional Credential</th>
                <th className="py-3.5 px-4">Granted By & Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map(member => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 shadow-2xs flex-shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{member.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{member.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {member.badgeType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-800 text-[11px]">
                    {member.licenseNumber || "Community Track Record"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                    <div className="font-semibold text-slate-800">{member.grantedBy}</div>
                    <div className="text-[10px] text-slate-400">{member.grantedDate}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleRevoke(member.id)}
                      className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition flex items-center gap-1 ml-auto cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="w-3 h-3" /> Revoke Badge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
