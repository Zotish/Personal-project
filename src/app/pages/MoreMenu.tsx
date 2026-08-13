import { useNavigate, useLocation } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Users, MessageCircle, Bell, User, Settings, Bookmark,
  HelpCircle, Shield, Store, ChevronRight, ArrowLeft, ShoppingBag
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { LanguageToggle } from "../components/ui/LanguageToggle";

export function MoreMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const moreItems = [
    { icon: ShoppingBag,   tKey: "orders",        label: "My Orders & Tracking", path: "/orders",        badge: "1",   desc: "Track purchases, Escrow & Delivery OTPs" },
    { icon: Users,         tKey: "communities",   label: "Communities",   path: "/communities",   badge: null,  desc: "Join local newcomer groups & forums" },
    { icon: MessageCircle,tKey: "messages",      label: "Messages",      path: "/messages",      badge: "2",   desc: "Direct chats & seller inquiries" },
    { icon: Bell,         tKey: "notifications", label: "Notifications", path: "/notifications", badge: "4",   desc: "Alerts, updates & community news" },
    { icon: User,         tKey: "profile",       label: "Profile",       path: "/profile",       badge: null,  desc: "Your account details & posts" },
    { icon: Bookmark,     tKey: "saved",         label: "Saved",         path: "/saved",         badge: null,  desc: "Saved resources, jobs & places" },
    { icon: HelpCircle,   tKey: "qa",            label: "Q&A",           path: "/qa",            badge: null,  desc: "Ask questions & get advice" },
    { icon: Store,        tKey: "seller",        label: "Seller SaaS Portal", path: "/seller-dashboard", badge: "NEW", desc: "Manage products, inventory & sales" },
    { icon: Settings,     tKey: "settings",      label: "Settings",      path: "/settings",      badge: null,  desc: "App preferences & security" },
    { icon: Shield,       tKey: "admin",         label: "Admin",         path: "/admin",         badge: null,  desc: "Platform moderation & analytics" },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50/50 pb-24">
        
        {/* Header */}
        <div className="bg-white border-b border-border sticky top-0 z-30 shadow-xs">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t("more") || "More Menu"}</h1>
                <p className="text-xs text-muted-foreground">All features, settings & resources</p>
              </div>
            </div>

            {/* Top Quick Profile avatar */}
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center border-2 border-emerald-500 shadow-xs"
            >
              U
            </button>
          </div>
        </div>

        {/* Main List Body */}
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
          
          {/* Main Navigation Items Card */}
          <div className="bg-white rounded-3xl border border-border shadow-xs overflow-hidden divide-y divide-border/60">
            {moreItems.map(({ icon: Icon, tKey, label, path, badge, desc }) => {
              const active = location.pathname === path;
              const title = t(tKey) || label;

              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`w-full flex items-center justify-between p-4 transition-all text-left hover:bg-slate-50 ${
                    active ? "bg-emerald-50/60" : ""
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    
                    {/* Icon matching original style & color (emerald-600) */}
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-secondary border border-border/40 shadow-2xs">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold text-foreground truncate ${active ? "text-emerald-700" : ""}`}>
                          {title}
                        </span>
                        {badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            badge === "NEW" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-primary text-primary-foreground"
                          }`}>
                            {badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{desc}</p>
                    </div>

                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                </button>
              );
            })}
          </div>

          {/* Language Toggle Card */}
          <div className="bg-white rounded-3xl border border-border p-4 shadow-xs">
            <LanguageToggle />
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
