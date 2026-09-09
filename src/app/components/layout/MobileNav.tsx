import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Home, Search, Map, Briefcase, Clapperboard, MoreHorizontal,
  Users, MessageCircle, Bell, User, Settings, Bookmark,
  HelpCircle, Shield, X, ShoppingBag, Store, ArrowLeftRight,
  PlusCircle, Check
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useMobileTabs } from "../../context/MobileTabContext";
import { useAccountMode } from "../../context/AccountModeContext";
import { LanguageToggle } from "../ui/LanguageToggle";

const mainKeys = [
  { icon: Home,         tKey: "home",     path: "/feed" },
  { icon: Briefcase,    tKey: "services", path: "/services" },
  { icon: Map,          tKey: "map",      path: "/map" },
];

const moreKeys = [
  { icon: ShoppingBag,  tKey: "orders",        path: "/orders",        badge: null },
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
  const { tasks, setIsRecentsOpen } = useMobileTabs();
  const {
    hasSellerAccount,
    sellerProfile,
    sellerProfiles,
    activeSellerId,
    openMigrateModal,
    switchMode,
    switchActiveSeller,
  } = useAccountMode();
  const [showMore, setShowMore] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const isMoreActive = moreKeys.some(i => location.pathname === i.path);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Auto-hide bottom nav bar on scroll down, instantly bring back on scroll up
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;

          // Always show at the top of the page
          if (currentY <= 15) {
            setIsVisible(true);
            lastScrollY.current = currentY;
            ticking = false;
            return;
          }

          const diff = currentY - lastScrollY.current;

          // If scrolled down by more than 5px, instantly hide bottom bar
          if (diff > 5) {
            setIsVisible(false);
            setShowMore(false);
          } else if (diff < -5) {
            // If scrolled up by more than 5px, immediately restore bottom bar
            setIsVisible(true);
          }

          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Reset visibility and close on route change
  useEffect(() => {
    setShowMore(false);
    setIsVisible(true);
    lastScrollY.current = window.scrollY;
  }, [location.pathname]);

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

          {/* Seller Switch / Migration Action */}
          <div className="p-2.5 border-b border-border">
            {!hasSellerAccount ? (
              <button
                onClick={() => {
                  setShowMore(false);
                  openMigrateModal();
                }}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100/80 border border-orange-200/80 text-left transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#C04A22]/15 text-[#8C3015] flex items-center justify-center flex-shrink-0">
                  <Store className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8C3015]">Become a Seller</span>
                    <span className="text-[9px] bg-[#C04A22] text-white px-1.5 py-0.2 rounded-full font-bold">New</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">Migrate account to start selling</div>
                </div>
              </button>
            ) : (
              <div className="space-y-1.5">
                <div className="px-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Business Accounts ({sellerProfiles.length})
                  </span>
                </div>

                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {sellerProfiles.map(shop => {
                    const isActive = shop.id === activeSellerId;
                    return (
                      <button
                        key={shop.id}
                        onClick={() => {
                          setShowMore(false);
                          switchActiveSeller(shop.id, true);
                        }}
                        className={`w-full flex items-center justify-between gap-2 p-2 rounded-xl text-left transition cursor-pointer ${
                          isActive
                            ? "bg-[#C04A22]/12 border border-[#C04A22]/25 text-[#8C3015]"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/70"
                        }`}
                      >
                        <span className="text-xs font-bold truncate min-w-0">{shop.shopName}</span>
                        {isActive && (
                          <span className="text-[9px] bg-[#C04A22] text-white px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 flex-shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" /> Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setShowMore(false);
                    openMigrateModal();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-[#C04A22]/40 text-[#8C3015] hover:bg-[#C04A22]/10 text-xs font-bold transition cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#C04A22]" />
                  <span>+ Create another business</span>
                </button>
              </div>
            )}
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
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-border safe-area-pb shadow-sm transition-all duration-250 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}>
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

          {/* Android Multi-Task Switcher Button (In place of Reels) */}
          <button
            onClick={() => setIsRecentsOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all min-w-0 relative group text-slate-600 hover:text-[#8C3015]"
            title="Android Recent Apps Switcher"
          >
            <div className="p-1.5 rounded-xl transition-all relative">
              <div className="w-5 h-5 rounded-[5px] border-2 border-slate-700 group-hover:border-[#8C3015] flex items-center justify-center font-black text-[10px] text-slate-800 group-hover:text-[#8C3015] transition">
                {tasks.length}
              </div>
              {tasks.length > 1 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-medium leading-none">Recents</span>
          </button>

          {/* Reels Button (In place of Recents) */}
          <button
            onClick={() => navigate("/reels")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 relative group ${
              location.pathname === "/reels" ? "text-[#8C3015] font-semibold" : "text-slate-600 hover:text-[#8C3015]"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${location.pathname === "/reels" ? "bg-[#C04A22]/10" : ""}`}>
              <Clapperboard className={`w-5 h-5 transition-colors ${location.pathname === "/reels" ? "text-[#8C3015]" : "text-slate-600 group-hover:text-[#8C3015]"}`} strokeWidth={location.pathname === "/reels" ? 2.3 : 1.8} />
            </div>
            <span className="text-[10px] font-medium leading-none">{t("reels")}</span>
          </button>

          {/* Profile button (in place of More) */}
          <button onClick={() => navigate("/profile")}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all min-w-0 relative group ${
              location.pathname === "/profile" ? "text-[#8C3015] font-semibold" : "text-slate-600 hover:text-[#8C3015]"
            }`}>
            <div className={`p-1.5 rounded-xl transition-all ${location.pathname === "/profile" ? "bg-[#C04A22]/10" : ""}`}>
              <User className={`w-5 h-5 transition-colors ${location.pathname === "/profile" ? "text-[#8C3015]" : "text-slate-600 group-hover:text-[#8C3015]"}`} strokeWidth={location.pathname === "/profile" ? 2.3 : 1.8} />
            </div>
            <span className="text-[10px] font-medium leading-none">{t("profile")}</span>
            {location.pathname === "/profile" && (
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
