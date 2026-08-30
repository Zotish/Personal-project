import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Home, Search, Map, Briefcase, Clapperboard, MoreHorizontal,
  Users, MessageCircle, Bell, User, Settings, Bookmark,
  HelpCircle, Shield, X, ShoppingBag
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { LanguageToggle } from "../ui/LanguageToggle";

const mainKeys = [
  { icon: Home,         tKey: "home",     path: "/feed" },
  { icon: Briefcase,    tKey: "services", path: "/services" },
  { icon: Map,          tKey: "map",      path: "/map" },
  { icon: Clapperboard, tKey: "reels",    path: "/reels" },
  { icon: ShoppingBag,  tKey: "orders",   path: "/orders" },
];

const moreKeys = [
  { icon: Search,       tKey: "explore",       path: "/explore",       badge: null },
  { icon: Users,        tKey: "communities",   path: "/communities",   badge: null },
  { icon: MessageCircle,tKey: "messages",      path: "/messages",      badge: "2" },
  { icon: Bell,         tKey: "notifications", path: "/notifications", badge: "4" },
  { icon: User,         tKey: "profile",       path: "/profile",       badge: null },
  { icon: Bookmark,     tKey: "saved",         path: "/saved",         badge: null },
  { icon: HelpCircle,   tKey: "qa",            path: "/qa",            badge: null },
  { icon: Settings,     tKey: "settings",      path: "/settings",      badge: null },
  { icon: Shield,       tKey: "admin",         path: "/admin",         badge: null },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [showMore, setShowMore] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const isMoreActive = moreKeys.some(i => location.pathname === i.path);

  // Close on outside tap
  useEffect(() => {
    if (!showMore) return;
    function handle(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showMore]);

  // Close on route change
  useEffect(() => { setShowMore(false); }, [location.pathname]);

  return (
    <>
      {/* Backdrop */}
      {showMore && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setShowMore(false)} />
      )}

      {/* More popup — slides up from bottom-right */}
      {showMore && (
        <div ref={popupRef}
          className="lg:hidden fixed bottom-20 right-3 z-50 w-56 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden"
          style={{ animation: "slideUpFade 0.2s ease-out" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("more")}</span>
            <button onClick={() => setShowMore(false)}
              className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Items */}
          <div className="py-1.5">
            {moreKeys.map(({ icon: Icon, tKey, path, badge }) => {
              const active = location.pathname === path;
              return (
                <button key={path}
                  onClick={() => { navigate(path); setShowMore(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left group ${
                    active ? "bg-secondary/80 text-foreground font-semibold" : "hover:bg-secondary text-foreground"
                  }`}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-secondary">
                    <Icon className={`w-4 h-4 transition-colors ${active ? "text-[#8C3015]" : "text-slate-600 group-hover:text-[#8C3015]"}`} />
                  </div>
                  <span className={`text-sm font-medium flex-1 ${active ? "font-semibold text-[#8C3015]" : ""}`}>
                    {t(tKey)}
                  </span>
                  {badge && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-[#C04A22]" />}
                </button>
              );
            })}
          </div>

          {/* Language Toggle */}
          <div className="px-4 py-3 border-t border-border">
            <LanguageToggle />
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-border safe-area-pb shadow-sm">
        <div className="flex items-center justify-around px-1 py-1">
          {mainKeys.map(({ icon: Icon, tKey, path }) => {
            const active = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 relative group ${
                  active ? "text-[#8C3015] font-semibold" : "text-slate-600 hover:text-[#8C3015]"
                }`}>
                <div className={`p-1.5 rounded-xl transition-all ${active ? "bg-[#C04A22]/10" : ""}`}>
                  <Icon className={`w-5 h-5 transition-colors ${active ? "text-[#8C3015]" : "text-slate-600 group-hover:text-[#8C3015]"}`} strokeWidth={active ? 2.3 : 1.8} />
                </div>
                <span className="text-[10px] font-medium leading-none">{t(tKey)}</span>
              </button>
            );
          })}

          {/* More button */}
          <button onClick={() => navigate("/more")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 relative group ${
              location.pathname === "/more" || isMoreActive ? "text-[#8C3015] font-semibold" : "text-slate-600 hover:text-[#8C3015]"
            }`}>
            <div className={`p-1.5 rounded-xl transition-all ${location.pathname === "/more" || isMoreActive ? "bg-[#C04A22]/10" : ""}`}>
              <MoreHorizontal className={`w-5 h-5 transition-colors ${location.pathname === "/more" || isMoreActive ? "text-[#8C3015]" : "text-slate-600 group-hover:text-[#8C3015]"}`} strokeWidth={location.pathname === "/more" || isMoreActive ? 2.3 : 1.8} />
            </div>
            <span className="text-[10px] font-medium leading-none">{t("more")}</span>
            {(location.pathname === "/more" || isMoreActive) && (
              <span className="absolute top-1.5 right-2.5 w-2 h-2 rounded-full bg-[#C04A22]" />
            )}
          </button>
        </div>
      </nav>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </>
  );
}
