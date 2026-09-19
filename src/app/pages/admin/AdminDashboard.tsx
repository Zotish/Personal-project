import React from "react";
import { Link } from "react-router";
import {
  Shield, Activity, Users, Flag, Award, Store,
  MapPin, Bell, Headphones, Sliders, FileText,
  AlertTriangle, ArrowRight, CheckCircle2, TrendingUp,
  Sparkles, ExternalLink, ShieldCheck, RefreshCw, Globe
} from "lucide-react";
import { useAdminRole, ROLE_CONFIGS } from "../../context/AdminRoleContext";
import { useCountryPlatform } from "../../context/CountryPlatformContext";

export function AdminDashboard() {
  const { activeRole, currentAdminUser, switchRole } = useAdminRole();
  const { launchedCountries, countries } = useCountryPlatform();
  const config = ROLE_CONFIGS[activeRole];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-white via-white to-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#C04A22]/10 to-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${config.badgeColor}`}>
                {config.title}
              </span>
              <span className="text-slate-500 text-xs">• ImmigrantConnect USA Control Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
              Welcome back, {currentAdminUser.name.split(" ")[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              {config.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to={config.defaultPath}
              className="px-4 py-2.5 rounded-xl bg-[#C04A22] hover:bg-[#A83D1B] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#C04A22]/20"
            >
              <span>Go to Primary Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Role-Specific Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeRole === "super_admin" && (
          <>
            <KpiCard label="Live Country Platforms" value={`${launchedCountries.length} / ${countries.length} Live`} change="Dynamic worldwide launchpad" status="normal" icon={Globe} to="/admin/countries" />
            <KpiCard label="Total Platform Users" value="248,392" change="+12.4% vs last week" status="normal" icon={Users} to="/admin/staff-roles" />
            <KpiCard label="API Requests (BariKoi + AI)" value="14,280 RPM" change="99.98% success rate" status="normal" icon={Activity} to="/admin/system-health" />
            <KpiCard label="Active Moderation Queue" value="47 items" change="8 urgent reports" status="warning" icon={Flag} to="/admin/moderation" />
          </>
        )}

        {activeRole === "moderator" && (
          <>
            <KpiCard label="Pending Reports" value="4 items" change="Requires human review" status="warning" icon={Flag} to="/admin/moderation" />
            <KpiCard label="AI Scam Flagged" value="12 posts" change=">95% confidence score" status="critical" icon={AlertTriangle} to="/admin/ai-flags" />
            <KpiCard label="Banned Spammers (Today)" value="18 accounts" change="Auto-shield active" status="normal" icon={Shield} to="/admin/moderation" />
            <KpiCard label="Avg Response Time" value="4.2 mins" change="Within SLA (<15m)" status="normal" icon={TrendingUp} to="/admin/moderation" />
          </>
        )}

        {activeRole === "verifier" && (
          <>
            <KpiCard label="Pending Applications" value="3 lawyers / doctors" change="2 submitted today" status="warning" icon={Award} to="/admin/verifications" />
            <KpiCard label="Verified Legal Advisors" value="48 active" change="NY & NJ state bars" status="normal" icon={ShieldCheck} to="/admin/badges" />
            <KpiCard label="Healthcare Providers" value="31 active" change="Hospitals & clinics" status="normal" icon={CheckCircle2} to="/admin/badges" />
            <KpiCard label="Golden Badges Granted" value="89 members" change="Top community contributors" status="normal" icon={Sparkles} to="/admin/badges" />
          </>
        )}

        {activeRole === "marketplace_admin" && (
          <>
            <KpiCard label="Pending Store Approvals" value="2 shops" change="1 deshi grocery, 1 kitchen" status="warning" icon={Store} to="/admin/sellers" />
            <KpiCard label="Active Verified Sellers" value="142 storefronts" change="+6 this month" status="normal" icon={Store} to="/admin/sellers" />
            <KpiCard label="Flagged Catalog Items" value="1 product" change="Restricted item check" status="warning" icon={AlertTriangle} to="/admin/products" />
            <KpiCard label="Buyer Dispute Requests" value="0 open" change="All orders resolved" status="normal" icon={CheckCircle2} to="/admin/products" />
          </>
        )}

        {activeRole === "resource_editor" && (
          <>
            <KpiCard label="Verified Map Locations" value="284 places" change="BariKoi + local Dhaka & NYC" status="normal" icon={MapPin} to="/admin/directory" />
            <KpiCard label="Emergency Broadcasts" value="1 active banner" change="USCIS 540-day notice" status="normal" icon={Bell} to="/admin/broadcasts" />
            <KpiCard label="Healthcare & Hospitals" value="42 verified" change="24/7 ER directory" status="normal" icon={CheckCircle2} to="/admin/directory" />
            <KpiCard label="Community Food Banks" value="28 pantries" change="Halal & free meal spots" status="normal" icon={MapPin} to="/admin/directory" />
          </>
        )}

        {activeRole === "support_agent" && (
          <>
            <KpiCard label="Open Support Tickets" value="5 tickets" change="2 waiting on reply" status="warning" icon={Headphones} to="/admin/tickets" />
            <KpiCard label="Resolved Today" value="34 tickets" change="98.2% customer satisfaction" status="normal" icon={CheckCircle2} to="/admin/tickets" />
            <KpiCard label="Password Reset Requests" value="3 pending" change="Identity confirmed" status="normal" icon={Users} to="/admin/user-lookup" />
            <KpiCard label="User Feedback Log" value="19 entries" change="+4 feature suggestions" status="normal" icon={FileText} to="/admin/tickets" />
          </>
        )}
      </div>

      {/* Quick Launchpad & Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Role Action Center */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C04A22]" /> Quick Navigation Matrix
            </h2>
            <span className="text-[11px] text-slate-500">Filtered for: <strong>{config.title}</strong></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeRole === "super_admin" && (
              <>
                <ActionTile title="Worldwide Country Launchpad" desc="Dynamically launch platform for any country with native language & currency" icon={Globe} to="/admin/countries" badge={`${launchedCountries.length} Live`} />
                <ActionTile title="Sponsored Ads & Campaigns" desc="Publish and monitor commercial sponsored cards auto-injected every 2-3 posts" icon={Sparkles} to="/admin/ads" badge="Monetization" />
                <ActionTile title="System Microservices Health" desc="Inspect API response latency, Redis cache & BariKoi rate limits" icon={Activity} to="/admin/system-health" />
                <ActionTile title="Staff & RBAC Role Directory" desc="Assign or revoke administrative roles, invite new moderators" icon={Users} to="/admin/staff-roles" />
                <ActionTile title="Platform Feature Flags" desc="Toggle AI assistant, marketplace, video uploads and live map" icon={Sliders} to="/admin/feature-flags" />
                <ActionTile title="Action Audit Log Trail" desc="Immutable timeline of all moderator, verifier & admin actions" icon={FileText} to="/admin/audit-logs" />
              </>
            )}

            {activeRole === "moderator" && (
              <>
                <ActionTile title="Review Reported Content" desc="Inspect 4 user-reported posts and take enforcement action" icon={Flag} to="/admin/moderation" badge="4 Urgent" />
                <ActionTile title="AI Scam & Phishing Engine" desc="Inspect machine-flagged fraud with high AI confidence" icon={AlertTriangle} to="/admin/ai-flags" badge="12 Items" />
              </>
            )}

            {activeRole === "verifier" && (
              <>
                <ActionTile title="Review Credential Proofs" desc="Inspect NY State Bar cards & Medical Board license PDFs" icon={Award} to="/admin/verifications" badge="3 Pending" />
                <ActionTile title="Badge Granting Center" desc="Manage Legal Advisor, Doctor & Golden Contributor badges" icon={ShieldCheck} to="/admin/badges" />
              </>
            )}

            {activeRole === "marketplace_admin" && (
              <>
                <ActionTile title="Sponsored Ads & Campaigns" desc="Publish and monitor commercial sponsored cards auto-injected every 2-3 posts" icon={Sparkles} to="/admin/ads" badge="Live Ads" />
                <ActionTile title="Review Seller Applications" desc="Approve storefront applications for grocery, food & furniture" icon={Store} to="/admin/sellers" badge="2 Pending" />
                <ActionTile title="Product Catalog & Disputes" desc="Inspect flagged marketplace items and resolve buyer claims" icon={Sparkles} to="/admin/products" />
              </>
            )}

            {activeRole === "resource_editor" && (
              <>
                <ActionTile title="Service Directory Places" desc="Add, edit or update hospital, food bank & mosque map coordinates" icon={MapPin} to="/admin/directory" />
                <ActionTile title="Emergency Banner Broadcast" desc="Publish urgent notices regarding USCIS extensions or winter shelters" icon={Bell} to="/admin/broadcasts" badge="1 Live" />
              </>
            )}

            {activeRole === "support_agent" && (
              <>
                <ActionTile title="Helpdesk Ticket Queue" desc="Reply to immigrant users experiencing app or login issues" icon={Headphones} to="/admin/tickets" badge="5 Open" />
                <ActionTile title="User Account Inspector" desc="Look up users by email/username to check verification and status" icon={Users} to="/admin/user-lookup" />
              </>
            )}
          </div>
        </div>

        {/* Role Simulator / Switcher Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-2">
              <RefreshCw className="w-4 h-4" /> Role-Based Access Control Simulator
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Switch Role Preview</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Instantly test how the admin interface, permissions, and sidebar adapt for each of the 6 roles:
            </p>

            <div className="space-y-1.5">
              {(["super_admin", "moderator", "verifier", "marketplace_admin", "resource_editor", "support_agent"] as const).map(roleKey => {
                const r = ROLE_CONFIGS[roleKey];
                const isActive = activeRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    onClick={() => switchRole(roleKey)}
                    className={`w-full p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      isActive
                        ? "bg-[#C04A22] text-white font-bold shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60"
                    }`}
                  >
                    <span>{r.title}</span>
                    {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="text-[10px] text-slate-400">Test</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Current role privileges are enforced client-side and via API token claims.
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label, value, change, status, icon: Icon, to
}: {
  label: string; value: string; change: string; status: "normal" | "warning" | "critical"; icon: React.ElementType; to: string;
}) {
  return (
    <Link to={to} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-xs group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
          status === "critical" ? "bg-red-50 text-red-600 border border-red-200" :
          status === "warning" ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-slate-100 text-slate-600 border border-slate-200/60"
        }`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="text-xl font-black text-slate-900 group-hover:text-[#C04A22] transition-colors">{value}</div>
      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
        <span>{change}</span>
      </div>
    </Link>
  );
}

function ActionTile({
  title, desc, icon: Icon, to, badge
}: {
  title: string; desc: string; icon: React.ElementType; to: string; badge?: string;
}) {
  return (
    <Link
      to={to}
      className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200 hover:border-slate-300 transition group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 group-hover:bg-[#C04A22] group-hover:border-[#C04A22] text-slate-700 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
            <Icon className="w-4 h-4" />
          </div>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">
              {badge}
            </span>
          )}
        </div>
        <div className="text-sm font-bold text-slate-900 group-hover:text-[#C04A22] transition-colors">{title}</div>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{desc}</p>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-slate-800 transition-colors">
        <span>Open module</span>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
