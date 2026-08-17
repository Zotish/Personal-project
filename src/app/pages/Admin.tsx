import { useState } from "react";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Shield, AlertTriangle, Users, CheckCircle, Flag, BarChart2, Eye,
  Ban, Clock, TrendingUp, MessageCircle, Building, Star, Zap,
  X, ChevronRight, Bell
} from "lucide-react";

const stats = [
  { label: "Active Users", value: "248,392", change: "+12%", icon: Users, color: "bg-blue-50 text-primary" },
  { label: "Flagged Posts", value: "47", change: "-8%", icon: Flag, color: "bg-red-50 text-red-500" },
  { label: "Pending Verifications", value: "23", change: "+3", icon: Clock, color: "bg-amber-50 text-amber-600" },
  { label: "New Reports", value: "12", change: "+5", icon: AlertTriangle, color: "bg-orange-50 text-orange-500" },
];

const activityData = [
  { day: "Mon", users: 18400, posts: 3200 },
  { day: "Tue", users: 22100, posts: 4100 },
  { day: "Wed", users: 19800, posts: 3600 },
  { day: "Thu", users: 24500, posts: 5200 },
  { day: "Fri", users: 28200, posts: 6100 },
  { day: "Sat", users: 21300, posts: 4800 },
  { day: "Sun", users: 16900, posts: 3400 },
];

const reportedContent = [
  { id: 1, type: "post", author: "unknown_user123", content: "I can help you get a fake SSN for $200. DM me...", reason: "Scam / Fraud", reported: "2h ago", severity: "high" },
  { id: 2, type: "post", author: "helpseeker_2024", content: "Selling document verification shortcuts for...", reason: "Misinformation", reported: "4h ago", severity: "high" },
  { id: 3, type: "comment", author: "maria_santos_99", content: "This legal advice is wrong and dangerous for...", reason: "Harmful Information", reported: "6h ago", severity: "medium" },
  { id: 4, type: "profile", author: "attorney_pro", content: "Claiming to be a licensed attorney but has no credentials...", reason: "Impersonation", reported: "1d ago", severity: "medium" },
  { id: 5, type: "post", author: "job_scam_alert", content: "Promising jobs without work authorization requirements...", reason: "Fraud", reported: "2d ago", severity: "low" },
];

const pendingVerifications = [
  { id: 1, name: "Nadia Islam", role: "Immigration Attorney", credential: "NY State Bar #456789", submitted: "1d ago", status: "pending" },
  { id: 2, name: "Dr. Priya Menon", role: "Healthcare Navigator", credential: "Certification #HN-2024-089", submitted: "2d ago", status: "pending" },
  { id: 3, name: "Ahmed Hassan", role: "Certified CPA", credential: "CPA License #NY-23456", submitted: "3d ago", status: "pending" },
];

const emergencyAnnouncements = [
  { id: 1, title: "USCIS EAD Extension Active", msg: "90-day auto-extension for I-765 renewals filed before Dec 2024", scope: "National", active: true },
  { id: 2, title: "Ice Storm Warning - NYC Area", msg: "Resources available at community centers in Brooklyn and Queens", scope: "New York, NY", active: false },
];

export function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [resolvedReports, setResolvedReports] = useState<number[]>([]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">PathaSathi Moderation Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">AD</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-border bg-white scrollbar-hide">
          {["overview", "reports", "verifications", "announcements"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {tab === "reports" && <span className="ml-1.5 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{reportedContent.length - resolvedReports.length}</span>}
              {tab === "verifications" && <span className="ml-1.5 text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full">{pendingVerifications.length}</span>}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-5">
          {/* Overview */}
          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map(({ label, value, change, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl border border-border p-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                    <div className={`text-xs font-medium mt-1 ${change.startsWith("+") && label !== "Flagged Posts" ? "text-emerald-600" : "text-muted-foreground"}`}>{change} this week</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Weekly Activity</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />Users</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-orange-400 inline-block" />Posts</span>
                  </div>
                </div>
                {(() => {
                  const maxVal = Math.max(...activityData.map(d => d.users));
                  return (
                    <div className="flex items-end gap-1.5 h-44">
                      {activityData.map((d, i) => (
                        <div key={`activity-${i}`} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex items-end gap-0.5" style={{ height: "160px" }}>
                            <div className="flex-1 rounded-t-md bg-primary transition-all" style={{ height: `${(d.users / maxVal) * 100}%`, minHeight: "4px" }} title={`Users: ${d.users.toLocaleString()}`} />
                            <div className="flex-1 rounded-t-md bg-orange-400 transition-all" style={{ height: `${(d.posts / maxVal) * 100}%`, minHeight: "4px" }} title={`Posts: ${d.posts.toLocaleString()}`} />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{d.day}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground text-sm">Top Topics This Week</h3>
                  </div>
                  <div className="space-y-2">
                    {[["USCIS Update", "12.4K"], ["NY Immigrants", "8.9K"], ["H-1B Lottery", "6.2K"], ["Asylum Help", "3.8K"]].map(([topic, count]) => (
                      <div key={topic} className="flex items-center justify-between">
                        <span className="text-sm text-foreground">#{topic}</span>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{count} posts</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h3 className="font-semibold text-foreground text-sm">Quick Actions</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Review flagged posts", count: 47, color: "text-red-600 bg-red-50" },
                      { label: "Verify pending advisors", count: 23, color: "text-amber-600 bg-amber-50" },
                      { label: "Review reported users", count: 12, color: "text-orange-600 bg-orange-50" },
                    ].map(({ label, count, color }) => (
                      <button key={label} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary transition-colors">
                        <span className="text-sm text-foreground">{label}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Reports */}
          {activeTab === "reports" && (
            <div className="space-y-3">
              {reportedContent.filter(r => !resolvedReports.includes(r.id)).map(report => (
                <div key={report.id} className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      report.severity === "high" ? "bg-red-50" : report.severity === "medium" ? "bg-amber-50" : "bg-secondary"
                    }`}>
                      <Flag className={`w-4 h-4 ${report.severity === "high" ? "text-red-500" : report.severity === "medium" ? "text-amber-500" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">@{report.author}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            report.severity === "high" ? "bg-red-50 text-red-600" : report.severity === "medium" ? "bg-amber-50 text-amber-600" : "bg-secondary text-muted-foreground"
                          }`}>{report.severity}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{report.reported}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">Reason: <span className="font-medium text-foreground">{report.reason}</span></div>
                      <p className="text-sm text-foreground bg-secondary rounded-lg px-3 py-2 mb-3 line-clamp-2">"{report.content}"</p>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition">
                          <Ban className="w-3.5 h-3.5" />Remove & Warn
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition">
                          <Eye className="w-3.5 h-3.5" />View Context
                        </button>
                        <button
                          onClick={() => setResolvedReports(s => [...s, report.id])}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition ml-auto"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {resolvedReports.length === reportedContent.length && (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">All reports resolved</p>
                  <p className="text-sm text-muted-foreground mt-1">Great work! The platform is clean.</p>
                </div>
              )}
            </div>
          )}

          {/* Verifications */}
          {activeTab === "verifications" && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
                <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-primary">Verified advisors get a blue checkmark and appear in legal/medical searches. Verify credentials before approving.</p>
              </div>
              {pendingVerifications.map(v => (
                <div key={v.id} className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {v.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-foreground">{v.name}</div>
                          <div className="text-xs text-muted-foreground">{v.role}</div>
                        </div>
                        <span className="text-xs text-muted-foreground">{v.submitted}</span>
                      </div>
                      <div className="mt-2 p-2.5 bg-secondary rounded-lg text-xs text-muted-foreground">
                        Credential: <span className="font-medium text-foreground">{v.credential}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-600 transition">
                          <CheckCircle className="w-3.5 h-3.5" />Approve & Verify
                        </button>
                        <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition">
                          <Eye className="w-3.5 h-3.5" />Review
                        </button>
                        <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition">
                          <X className="w-3.5 h-3.5" />Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Emergency Announcements */}
          {activeTab === "announcements" && (
            <div className="space-y-4">
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition">
                <Bell className="w-4 h-4" />Create Emergency Announcement
              </button>
              {emergencyAnnouncements.map(a => (
                <div key={a.id} className={`rounded-2xl border p-4 ${a.active ? "bg-red-50 border-red-200" : "bg-white border-border"}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${a.active ? "text-red-500" : "text-muted-foreground"}`} />
                      <span className="text-sm font-semibold text-foreground">{a.title}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.active ? "bg-red-500 text-white" : "bg-secondary text-muted-foreground"}`}>
                      {a.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{a.msg}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Scope: {a.scope}</span>
                    <button className="text-xs text-primary hover:underline font-medium">
                      {a.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
