import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Home, Search, Map, Briefcase, Users, MessageCircle,
  Bell, User, Settings, HelpCircle, Globe, Shield, Bookmark,
  MoreHorizontal, X, Clapperboard
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { LanguageToggle } from "../ui/LanguageToggle";

const navKeys = [
  { icon: Home,          tKey: "home",          path: "/feed" },
  { icon: Search,        tKey: "search",        path: "/explore" },
  { icon: Clapperboard,  tKey: "reels",         path: "/reels" },
  { icon: Map,           tKey: "map",           path: "/map" },
  { icon: Briefcase,     tKey: "services",      path: "/services" },
  { icon: Users,         tKey: "communities",   path: "/communities" },
  { icon: MessageCircle, tKey: "messages",      path: "/messages" },
  { icon: Bell,          tKey: "notifications", path: "/notifications" },
  { icon: User,          tKey: "profile",       path: "/profile" },
  { icon: Shield,        tKey: "admin",         path: "/admin" },
];

const moreKeys = [
  { icon: HelpCircle, tKey: "qa",       path: "/qa",       descKey: "qa_desc" },
  { icon: Bookmark,   tKey: "saved",    path: "/saved",    descKey: "saved_desc" },
  { icon: Settings,   tKey: "settings", path: "/settings", descKey: "settings_desc" },
];

const descFallbacks: Record<string, string> = {
  qa_desc: "Community questions",
  saved_desc: "Your saved resources",
  settings_desc: "Account & preferences",
};

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    }
    if (showMore) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMore]);

  const isMoreActive = moreKeys.some(item => location.pathname === item.path);

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-border fixed left-0 top-0 z-40 shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <button onClick={() => navigate("/feed")} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}>
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-foreground leading-tight" style={{ fontFamily: "var(--font-display)" }}>ImmigrantConnect</div>
            <div className="text-xs text-muted-foreground">USA</div>
          </div>
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navKeys.map(({ icon: Icon, tKey, path }) => {
          const active = location.pathname === path;
          const label = t(tKey);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                active
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-foreground hover:bg-secondary hover:text-primary"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>{label}</span>
              {tKey === "notifications" && (
                <span className="ml-auto w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">4</span>
              )}
              {tKey === "messages" && (
                <span className="ml-auto w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">2</span>
              )}
            </button>
          );
        })}

        {/* More Button */}
        <div ref={moreRef} className="relative">
          <button
            onClick={() => setShowMore(!showMore)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
              isMoreActive || showMore
                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                : "text-foreground hover:bg-secondary hover:text-primary"
            }`}
          >
            <MoreHorizontal
              className={`w-5 h-5 flex-shrink-0 text-emerald-600 transition-transform duration-200 ${showMore ? "rotate-90" : ""}`}
            />
            <span>{t("more")}</span>
            {/* Dot indicator if a "more" page is active */}
            {isMoreActive && !showMore && (
              <span className="ml-auto w-2 h-2 rounded-full bg-white" />
            )}
          </button>

          {/* Popover Menu */}
          {showMore && (
            <div className="absolute bottom-full left-0 mb-2 w-60 bg-white rounded-2xl border border-border shadow-xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">{t("more")}</span>
                <button
                  onClick={() => setShowMore(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {moreKeys.map(({ icon: Icon, tKey, path, descKey }) => {
                  const active = location.pathname === path;
                  return (
                    <button
                      key={path}
                      onClick={() => {
                        navigate(path);
                        setShowMore(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                        active
                          ? "bg-secondary/80 text-foreground"
                          : "hover:bg-secondary"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-secondary">
                        <Icon className="w-4.5 h-4.5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>{t(tKey)}</div>
                        <div className="text-xs text-muted-foreground truncate">{descFallbacks[descKey]}</div>
                      </div>
                      {active && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Language Toggle */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 px-1 mb-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t("switch_language")}</span>
        </div>
        <LanguageToggle />
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">RA</div>
          <div className="text-left flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">Rafiq Ahmed</div>
            <div className="text-xs text-muted-foreground truncate">@rafiq_ahmed</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
