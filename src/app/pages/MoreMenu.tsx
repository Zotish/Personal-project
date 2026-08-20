import { useNavigate, useLocation } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Users, MessageCircle, Bell, User, Settings, Bookmark,
  HelpCircle, Shield, Store, ChevronRight, ArrowLeft, Search
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { LanguageToggle } from "../components/ui/LanguageToggle";

export function MoreMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const moreItems = [
    { icon: Search,        tKey: "explore",       label: "Explore",               path: "/explore",       badge: null,  desc: "Discover services, maps & local insights" },
    { icon: Users,         tKey: "communities",   label: "Communities",           path: "/communities",   badge: null,  desc: "Join local newcomer groups & forums" },
    { icon: MessageCircle, tKey: "messages",      label: "Messages",              path: "/messages",      badge: "2",   desc: "Direct chats & seller inquiries" },
    { icon: Bell,          tKey: "notifications", label: "Notifications",         path: "/notifications", badge: "4",   desc: "Alerts, updates & community news" },
    { icon: User,          tKey: "profile",       label: "Profile",               path: "/profile",       badge: null,  desc: "Your account details & posts" },
    { icon: Bookmark,      tKey: "saved",         label: "Saved",                 path: "/saved",         badge: null,  desc: "Saved resources, jobs & places" },
    { icon: HelpCircle,    tKey: "qa",            label: "Q&A",                   path: "/qa",            badge: null,  desc: "Ask questions & get advice" },
    { icon: Store,         tKey: "seller",        label: "Seller SaaS Portal",    path: "/seller-dashboard", badge: "NEW", desc: "Manage products, inventory & sales" },
    { icon: Settings,      tKey: "settings",      label: "Settings",              path: "/settings",      badge: null,  desc: "App preferences & security" },
    { icon: Shield,        tKey: "admin",         label: "Admin",                 path: "/admin",         badge: null,  desc: "Platform moderation & analytics" },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50/50 pb-24">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#C04A22]/10 hover:text-[#8C3015] transition cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-normal text-slate-900">{t("more") || "More Menu"}</h1>
                <p className="text-xs font-normal text-slate-500">All features, settings & resources</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main List Body */}
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
          
          {/* Main Navigation Items Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {moreItems.map(({ icon: Icon, tKey, label, path, badge, desc }) => {
              const active = location.pathname === path;
              const title = t(tKey) || label;

              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`group w-full flex items-center justify-between p-4 transition-all text-left cursor-pointer ${
                    active ? "bg-[#C04A22]/10" : "hover:bg-[#C04A22]/5"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    
                    {/* Clean Normal Default Vector Icon */}
                    <div className="p-2 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-slate-700 group-hover:text-[#8C3015] transition-colors" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-normal truncate transition-colors ${
                          active ? "text-[#8C3015]" : "text-slate-900 group-hover:text-[#8C3015]"
                        }`}>
                          {title}
                        </span>
                        {badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            badge === "NEW" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-[#C04A22] text-white"
                          }`}>
                            {badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-normal text-slate-500 truncate mt-0.5">{desc}</p>
                    </div>

                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#C04A22] transition-colors flex-shrink-0 ml-2" />
                </button>
              );
            })}
          </div>

          {/* Language Toggle Card (Centered) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-center">
            <LanguageToggle />
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
