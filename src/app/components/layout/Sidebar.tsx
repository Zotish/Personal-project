import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Home, Search, Map, Briefcase, Users, MessageCircle,
  Bell, User, Settings, HelpCircle, Globe, Shield, Bookmark,
  MoreHorizontal, X, Clapperboard, UserPlus, LogOut, ChevronUp,
  Store, ArrowLeftRight, Feather, PlusCircle, Check, ArrowRight
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAccountMode } from "../../context/AccountModeContext";
import { LanguageToggle } from "../ui/LanguageToggle";
import { Logo } from "../ui/Logo";
import { TwitterPostModal } from "../post/TwitterPostModal";


const navKeys = [
  { icon: Home,          tKey: "home",          path: "/feed" },
  { icon: Briefcase,     tKey: "services",      path: "/services" },
  { icon: Map,           tKey: "map",           path: "/map" },
  { icon: Clapperboard,  tKey: "reels",         path: "/reels" },
  { icon: Search,        tKey: "explore",       path: "/explore" },
  { icon: Users,         tKey: "communities",   path: "/communities" },
  { icon: MessageCircle, tKey: "messages",      path: "/messages" },
  { icon: Bell,          tKey: "notifications", path: "/notifications" },
  { icon: User,          tKey: "profile",       path: "/profile" },
  { icon: Feather,       tKey: "post_btn",      isPost: true },
];

const moreKeys = [
  { icon: Shield,     tKey: "admin",    path: "/admin",    descKey: "admin_desc" },
  { icon: HelpCircle, tKey: "qa",       path: "/qa",       descKey: "qa_desc" },
  { icon: Bookmark,   tKey: "saved",    path: "/saved",    descKey: "saved_desc" },
  { icon: Settings,   tKey: "settings", path: "/settings", descKey: "settings_desc" },
];

const descFallbacks: Record<string, string> = {
  admin_desc: "Admin & moderation panel",
  qa_desc: "Community questions",
  saved_desc: "Your saved resources",
  settings_desc: "Account & preferences",
};

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const {
    user,
    hasSellerAccount,
    sellerProfile,
    sellerProfiles,
    activeSellerId,
    openMigrateModal,
    switchMode,
    switchActiveSeller,
  } = useAccountMode();
  const [showMore, setShowMore] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Global listener for shortcut (key "n" or "p" opens post modal, like Twitter)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      if (e.key === "n" || e.key === "p") {
        setIsPostModalOpen(true);
      }
    };
    const handleOpenEvent = () => setIsPostModalOpen(true);
    window.addEventListener("keydown", handleGlobalKey);
    window.addEventListener("open-post-modal", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleGlobalKey);
      window.removeEventListener("open-post-modal", handleOpenEvent);
    };
  }, []);


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
    <>
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-border fixed left-0 top-0 z-40 shadow-sm">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Logo size="md" onClick={() => navigate("/feed")} />
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navKeys.map((item) => {
          const { icon: Icon, tKey } = item;
          if ("isPost" in item && item.isPost) {
            const active = isPostModalOpen;
            return (
              <button
                key="post-action-btn"
                type="button"
                onClick={() => setIsPostModalOpen(true)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group cursor-pointer ${
                  active
                    ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/20"
                    : "text-slate-700 hover:bg-[#C04A22]/10 hover:text-[#8C3015]"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  active ? "text-[#8C3015]" : "text-slate-600 group-hover:text-[#8C3015]"
                }`} />
                <span>{t(tKey) || "Post"}</span>
              </button>
            );
          }

          const path = (item as any).path;
          const active = location.pathname === path;
          const label = t(tKey);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                active
                  ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/20"
                  : "text-slate-700 hover:bg-[#C04A22]/10 hover:text-[#8C3015]"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                active ? "text-[#8C3015]" : "text-slate-600 group-hover:text-[#8C3015]"
              }`} />
              <span>{label}</span>
              {tKey === "notifications" && (
                <span className={`ml-auto w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold transition-colors ${
                  active ? "bg-[#C04A22]/20 text-[#8C3015]" : "bg-slate-100 text-slate-600 group-hover:bg-[#C04A22]/10 group-hover:text-[#8C3015]"
                }`}>4</span>
              )}
              {tKey === "messages" && (
                <span className={`ml-auto w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold transition-colors ${
                  active ? "bg-[#C04A22]/20 text-[#8C3015]" : "bg-slate-100 text-slate-600 group-hover:bg-[#C04A22]/10 group-hover:text-[#8C3015]"
                }`}>2</span>
              )}
            </button>
          );
        })}

        {/* More Button */}
        <div ref={moreRef} className="relative">
          <button
            onClick={() => setShowMore(!showMore)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
              isMoreActive || showMore
                ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/20"
                : "text-slate-700 hover:bg-[#C04A22]/10 hover:text-[#8C3015]"
            }`}
          >
            <MoreHorizontal
              className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                isMoreActive || showMore ? "text-[#8C3015]" : "text-slate-600 group-hover:text-[#8C3015]"
              } ${showMore ? "rotate-90" : ""}`}
            />
            <span>{t("more")}</span>
            {/* Dot indicator if a "more" page is active */}
            {isMoreActive && !showMore && (
              <span className="ml-auto w-2 h-2 rounded-full bg-[#C04A22]" />
            )}
          </button>

          {/* Popover Menu */}
          {showMore && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">{t("more")}</span>
                <button
                  onClick={() => setShowMore(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-2 space-y-0.5">
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
                          ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/20 font-semibold"
                          : "text-slate-700 hover:bg-[#C04A22]/10 hover:text-[#8C3015]"
                      }`}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? "text-[#8C3015]" : "text-slate-600 group-hover:text-[#8C3015]"}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold transition-colors ${active ? "text-[#8C3015]" : "text-slate-800 group-hover:text-[#8C3015]"}`}>{t(tKey)}</div>
                        <div className="text-xs text-slate-500 truncate">{descFallbacks[descKey]}</div>
                      </div>
                      {active && (
                        <div className="w-2 h-2 rounded-full bg-[#C04A22] flex-shrink-0" />
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
              <span className="text-xs font-bold text-slate-900 block">{user.name}</span>
              <span className="text-[10px] text-slate-500 block">{user.handle}</span>
            </div>
            
            {/* Account Switcher or Migration Option */}
            {!hasSellerAccount ? (
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  openMigrateModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#8C3015] bg-[#C04A22]/10 hover:bg-[#C04A22]/15 transition text-left cursor-pointer group"
              >
                <Store className="w-4 h-4 text-[#C04A22] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span>Become a Seller</span>
                    <span className="text-[9px] bg-[#C04A22] text-white px-1.5 py-0.5 rounded-full font-bold">New</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">Migrate account to start selling</div>
                </div>
              </button>
            ) : (
              <div className="py-1 border-b border-slate-100 space-y-1">
                <div className="px-2 pt-0.5 pb-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Business Accounts ({sellerProfiles.length})
                  </span>
                </div>

                {/* List of all business accounts */}
                <div className="max-h-44 overflow-y-auto space-y-1 pr-0.5">
                  {sellerProfiles.map(shop => {
                    const isActive = shop.id === activeSellerId;
                    return (
                      <button
                        key={shop.id}
                        onClick={() => {
                          setShowUserMenu(false);
                          switchActiveSeller(shop.id, true);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer group ${
                          isActive
                            ? "bg-[#C04A22]/10 text-[#8C3015] border border-[#C04A22]/20"
                            : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                        }`}
                      >
                        <span className="truncate font-bold text-xs">{shop.shopName}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isActive && (
                            <span className="text-[9px] bg-[#C04A22] text-white px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" /> Active
                            </span>
                          )}
                          <ArrowRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Add Another Business Account Button */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    openMigrateModal();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-[#8C3015] hover:bg-[#C04A22]/10 transition text-left cursor-pointer group border border-dashed border-[#C04A22]/30 mt-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#C04A22]" />
                  <span>+ Create another business</span>
                </button>
              </div>
            )}

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
              <span>Log out {user.handle}</span>
            </button>
          </div>
        )}

        <div
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition select-none group"
        >
          <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300/60 text-slate-500 flex items-center justify-center shadow-2xs flex-shrink-0">
            <User className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0 flex items-center justify-between">
            <div className="text-left flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{user.handle}</div>
            </div>
            <ChevronUp className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>
    </aside>

    {/* Twitter-Style Post Box Composer Modal */}
    <TwitterPostModal
      isOpen={isPostModalOpen}
      onClose={() => setIsPostModalOpen(false)}
    />
  </>
  );
}
