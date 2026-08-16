import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Home, Search, Map, Briefcase, Users, MessageCircle,
  Bell, User, Settings, HelpCircle, Globe, Shield, Bookmark,
  MoreHorizontal, X, Clapperboard, UserPlus, LogOut, ChevronUp
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { LanguageToggle } from "../ui/LanguageToggle";
import { Logo } from "../ui/Logo";

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
  const [showUserMenu, setShowUserMenu] = useState(false);
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
      <div className="p-4 border-b border-border">
        <Logo size="md" onClick={() => navigate("/feed")} />
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
                  ? "bg-[#D85A30] text-white font-medium shadow-sm"
                  : "text-slate-700 hover:bg-[#D85A30]/10 hover:text-[#993C1D]"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? "text-white" : "text-[#993C1D]"}`} />
              <span>{label}</span>
              {tKey === "notifications" && (
                <span className={`ml-auto w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium transition-colors ${
                  active ? "bg-white text-[#D85A30]" : "bg-slate-100 text-slate-600 group-hover:bg-[#D85A30]/10 group-hover:text-[#993C1D]"
                }`}>4</span>
              )}
              {tKey === "messages" && (
                <span className={`ml-auto w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium transition-colors ${
                  active ? "bg-white text-[#D85A30]" : "bg-slate-100 text-slate-600 group-hover:bg-[#D85A30]/10 group-hover:text-[#993C1D]"
                }`}>2</span>
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
              className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isMoreActive || showMore ? "text-white" : "text-[#993C1D]"} ${showMore ? "rotate-90" : ""}`}
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
                        <Icon className="w-4.5 h-4.5 text-[#993C1D]" />
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
        <LanguageToggle />
      </div>

      {/* User Footer with Popover Menu */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80 relative">
        
        {/* User Account Popover Menu */}
        {showUserMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 transition-all space-y-1">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <span className="text-xs font-bold text-slate-900 block">Rafiq Ahmed</span>
              <span className="text-[10px] text-slate-500 block">@rafiq_ahmed</span>
            </div>
            
            {/* Add Existing Account */}
            <button
              onClick={() => { setShowUserMenu(false); navigate("/auth"); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition text-left"
            >
              <UserPlus className="w-4 h-4 text-[#993C1D]" />
              <span>Add an existing account</span>
            </button>

            {/* Log Out */}
            <button
              onClick={() => { setShowUserMenu(false); navigate("/auth"); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Log out @rafiq_ahmed</span>
            </button>
          </div>
        )}

        <div
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition select-none group"
        >
          <div
            className="w-9 h-9 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)" }}
          >
            RA
          </div>
          <div className="flex-1 min-w-0 flex items-center justify-between">
            <div className="text-left flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">Rafiq Ahmed</div>
              <div className="text-[11px] text-slate-500 truncate">@rafiq_ahmed</div>
            </div>
            <ChevronUp className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>
    </aside>
  );
}
