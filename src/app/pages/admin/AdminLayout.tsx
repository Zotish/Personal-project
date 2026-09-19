import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Shield, Activity, Users, Flag, Award, Store,
  MapPin, Bell, Headphones, Sliders, FileText,
  ChevronRight, ExternalLink, RefreshCw, Check,
  Menu, X, Sparkles, Terminal, AlertTriangle, UserCheck, Globe
} from "lucide-react";
import { useAdminRole, ROLE_CONFIGS, AdminRole, AdminPermission } from "../../context/AdminRoleContext";
import { useCountryPlatform } from "../../context/CountryPlatformContext";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  permission?: AdminPermission;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Core Operations",
    items: [
      { label: "Dashboard Overview", path: "/admin", icon: Shield },
    ],
  },
  {
    title: "Super Admin",
    items: [
      { label: "Country Launchpad", path: "/admin/countries", icon: Globe, permission: "manage_countries", badge: "Worldwide" },
      { label: "System Health & APIs", path: "/admin/system-health", icon: Activity, permission: "manage_system" },
      { label: "Staff & Permissions", path: "/admin/staff-roles", icon: Users, permission: "manage_roles", badge: "6 Active" },
      { label: "Feature Flags", path: "/admin/feature-flags", icon: Sliders, permission: "manage_flags" },
      { label: "Audit Log Trail", path: "/admin/audit-logs", icon: FileText, permission: "view_audit_logs" },
    ],
  },
  {
    title: "Trust & Safety",
    items: [
      { label: "Moderation Queue", path: "/admin/moderation", icon: Flag, permission: "moderate_content", badge: 4 },
      { label: "AI Flagged Content", path: "/admin/ai-flags", icon: AlertTriangle, permission: "manage_ai_flags", badge: "99% Fraud" },
    ],
  },
  {
    title: "Compliance & Badges",
    items: [
      { label: "Credential Verifications", path: "/admin/verifications", icon: Award, permission: "verify_credentials", badge: 3 },
      { label: "Badge Management", path: "/admin/badges", icon: UserCheck, permission: "grant_badges" },
    ],
  },
  {
    title: "Commerce & Monetization",
    items: [
      { label: "Sponsored Ads & Campaigns", path: "/admin/ads", icon: Sparkles, permission: "manage_ads", badge: "Live" },
      { label: "Seller Store Approvals", path: "/admin/sellers", icon: Store, permission: "manage_sellers", badge: 2 },
      { label: "Product & Catalog Mod", path: "/admin/products", icon: Sparkles, permission: "moderate_products" },
    ],
  },
  {
    title: "Civic Resources & Map",
    items: [
      { label: "Directory & Map Places", path: "/admin/directory", icon: MapPin, permission: "edit_directory" },
      { label: "Emergency Broadcasts", path: "/admin/broadcasts", icon: Bell, permission: "send_broadcasts", badge: "Live" },
    ],
  },
  {
    title: "User Support",
    items: [
      { label: "Support Tickets", path: "/admin/tickets", icon: Headphones, permission: "handle_tickets", badge: 5 },
      { label: "User Inspector", path: "/admin/user-lookup", icon: Users, permission: "lookup_users" },
    ],
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeRole, currentAdminUser, switchRole, hasPermission, availableRoles } = useAdminRole();
  const { launchedCountries, countries, currentCountry } = useCountryPlatform();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const currentRoleConfig = ROLE_CONFIGS[activeRole];

  // Filter sections and items based on role permissions
  const visibleSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => !item.permission || hasPermission(item.permission)),
  })).filter(section => section.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col antialiased selection:bg-[#C04A22] selection:text-white">
      {/* Top Banner / System Ribbon */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
              title="Toggle Menu"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/admin" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C04A22] to-[#8C3015] flex items-center justify-center text-white shadow-md shadow-[#C04A22]/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-black tracking-tight flex items-center gap-1.5 text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
                  PathaSathi <span className="text-slate-500 font-semibold text-xs">Admin OS</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  ImmigrantConnect Command Center
                </div>
              </div>
            </Link>

            {/* Live indicator badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Operational</span>
            </div>

            {/* Global Dynamic Countries Live Badge */}
            <Link
              to="/admin/countries"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-700 text-[10px] font-bold transition cursor-pointer shadow-2xs"
              title="Global Dynamic Country Platforms"
            >
              <Globe className="w-3 h-3 text-blue-600 animate-pulse" />
              <span>{launchedCountries.length}/{countries.length} Countries Live</span>
            </Link>
          </div>

          {/* Right Header Tools */}
          <div className="flex items-center gap-2.5">
            {/* Interactive Role Switcher / Simulator Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
                title="Switch administrative role for testing"
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    activeRole === "super_admin" ? "bg-red-500" :
                    activeRole === "moderator" ? "bg-purple-500" :
                    activeRole === "verifier" ? "bg-blue-500" :
                    activeRole === "marketplace_admin" ? "bg-emerald-500" :
                    activeRole === "resource_editor" ? "bg-amber-500" : "bg-cyan-500"
                  }`} />
                  <span className="hidden sm:inline text-slate-500 text-[11px]">Role:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[130px] sm:max-w-none">{currentRoleConfig.title}</span>
                </div>
                <RefreshCw className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {/* Role Switcher Menu */}
              {roleSwitcherOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setRoleSwitcherOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2 py-1.5 border-b border-slate-100 mb-2">
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        <span>Role Simulator</span>
                        <span className="text-[10px] text-amber-600 font-mono bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">RBAC Matrix</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Select a role to preview the admin interface with that role's exact permissions:
                      </p>
                    </div>

                    <div className="space-y-1">
                      {availableRoles.map((role) => {
                        const isSelected = activeRole === role.id;
                        return (
                          <button
                            key={role.id}
                            onClick={() => {
                              switchRole(role.id);
                              setRoleSwitcherOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-start justify-between cursor-pointer ${
                              isSelected
                                ? "bg-[#C04A22]/10 border border-[#C04A22]/30 text-[#C04A22] font-bold"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="pr-2">
                              <div className="font-bold flex items-center gap-1.5">
                                <span>{role.title}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                                {role.description}
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#C04A22] flex-shrink-0 mt-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Back to Client App Link */}
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-900 transition"
              title="Return to ImmigrantConnect user portal"
            >
              <span className="hidden sm:inline">Exit to App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Admin Profile Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={currentAdminUser.avatar}
                alt={currentAdminUser.name}
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 shadow-2xs"
              />
              <div className="hidden xl:block text-left text-xs leading-tight">
                <div className="font-bold text-slate-900 truncate max-w-[120px]">{currentAdminUser.name}</div>
                <div className="text-[10px] text-slate-500">{currentRoleConfig.title}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Shell: Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop & Mobile Sidebar */}
        <aside
          className={`fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-white/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-r border-slate-200 p-4 overflow-y-auto z-30 transition-transform duration-200 lg:translate-x-0 ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Active Role Card */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 mb-5 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Current Role</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${currentRoleConfig.badgeColor}`}>
                {currentRoleConfig.title.split(" ")[0]}
              </span>
            </div>
            <div className="text-sm font-black text-slate-900">{currentRoleConfig.title}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
              {currentRoleConfig.description}
            </div>
          </div>

          {/* Navigation Groups */}
          <div className="space-y-6">
            {visibleSections.map((section, idx) => (
              <div key={idx}>
                <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase px-2 mb-2">
                  {section.title}
                </div>
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={itemIdx}
                        to={item.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                          isActive
                            ? "bg-[#C04A22] text-white shadow-md shadow-[#C04A22]/20 font-bold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tight flex-shrink-0 ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer info */}
          <div className="mt-8 pt-4 border-t border-slate-200 px-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>PathaSathi v2.4 RBAC</span>
            <span className="text-emerald-600 font-mono font-medium">SOC2 Compliant</span>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
