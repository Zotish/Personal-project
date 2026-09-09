import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { BarChart2, Package, ShoppingCart, MessageSquare, Settings, Store, ArrowLeftRight, X, PlusCircle, Check } from "lucide-react";
import { useAccountMode } from "../../context/AccountModeContext";

interface SellerMobileNavProps {
  activeTab?: string;
  onTabChange?: (tab: "overview" | "products" | "orders" | "messages" | "settings") => void;
}

export function SellerMobileNav({ activeTab = "overview", onTabChange }: SellerMobileNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    sellerProfile,
    sellerProfiles,
    activeSellerId,
    switchActiveSeller,
    openMigrateModal,
    switchMode
  } = useAccountMode();
  const [isVisible, setIsVisible] = useState(true);
  const [showStoreSheet, setShowStoreSheet] = useState(false);
  const lastScrollY = useRef(0);

  // Auto-hide bottom nav bar on scroll down, instantly bring back on scroll up
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;

          if (currentY <= 15) {
            setIsVisible(true);
            lastScrollY.current = currentY;
            ticking = false;
            return;
          }

          const diff = currentY - lastScrollY.current;

          if (diff > 5) {
            setIsVisible(false);
          } else if (diff < -5) {
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

  useEffect(() => {
    setIsVisible(true);
    lastScrollY.current = window.scrollY;
  }, [location.pathname]);

  const sellerItems = [
    { id: "overview", label: "Overview", icon: BarChart2, badge: null },
    { id: "products", label: "Products", icon: Package, badge: null },
    { id: "orders", label: "Orders", icon: ShoppingCart, badge: "14" },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: "2" },
    { id: "settings", label: "Settings", icon: Settings, badge: null },
  ];

  const handleTabClick = (id: string) => {
    if (location.pathname !== "/seller-dashboard") {
      navigate("/seller-dashboard");
    }
    if (onTabChange) {
      onTabChange(id as any);
    }
  };

  return (
    <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-slate-200 text-slate-900 safe-area-pb shadow-lg transition-all duration-250 ease-out ${
      isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
    }`}>
      <div className="flex items-center justify-between px-1 py-1.5 w-full">
        {sellerItems.map(item => {
          const Icon = item.icon;
          const isSelected = location.pathname === "/seller-dashboard" && activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl transition-all min-w-0 group cursor-pointer ${
                isSelected ? "text-[#8C3015] font-bold" : "text-slate-600 hover:text-[#8C3015]"
              }`}
            >
              <div className={`relative w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                isSelected ? "bg-[#C04A22]/10 text-[#8C3015]" : "bg-slate-50 group-hover:bg-[#C04A22]/10 group-hover:text-[#8C3015]"
              }`}>
                <Icon className={`w-4.5 h-4.5 transition-colors ${isSelected ? "text-[#8C3015]" : "text-slate-600 group-hover:text-[#8C3015]"}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#C04A22] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight font-medium truncate max-w-full">{item.label}</span>
            </button>
          );
        })}

        {/* Stores Switcher Button */}
        <button
          onClick={() => setShowStoreSheet(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl text-slate-600 hover:text-[#8C3015] transition-all min-w-0 group cursor-pointer"
        >
          <div className="relative w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 group-hover:bg-[#C04A22]/10 transition-all">
            <Store className="w-4.5 h-4.5 text-slate-600 group-hover:text-[#8C3015] transition-colors" />
            {sellerProfiles.length > 1 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#C04A22] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-2xs">
                {sellerProfiles.length}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight font-medium truncate max-w-full">Stores</span>
        </button>

        {/* Switch back to Buyer Feed */}
        <button
          onClick={() => switchMode("member")}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl text-slate-600 hover:text-[#8C3015] transition-all min-w-0 group cursor-pointer"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 group-hover:bg-[#C04A22]/10 transition-all">
            <ArrowLeftRight className="w-4.5 h-4.5 text-slate-600 group-hover:text-[#8C3015] transition-colors" />
          </div>
          <span className="text-[10px] leading-tight font-medium truncate max-w-full">Member</span>
        </button>
      </div>

      {/* Mobile Store Switcher Bottom Sheet */}
      {showStoreSheet && (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl border-t border-slate-200 p-5 shadow-2xl space-y-4 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Switch Business Store</h3>
                <p className="text-xs text-slate-500">All shops linked to {user.email}</p>
              </div>
              <button
                onClick={() => setShowStoreSheet(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-56">
              {sellerProfiles.map(shop => {
                const isActive = shop.id === activeSellerId;
                return (
                  <button
                    key={shop.id}
                    onClick={() => {
                      switchActiveSeller(shop.id, true);
                      setShowStoreSheet(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border text-left transition cursor-pointer ${
                      isActive
                        ? "bg-[#C04A22]/10 border-[#C04A22]/30 text-[#8C3015]"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                    }`}
                  >
                    <span className="font-bold text-sm truncate min-w-0">{shop.shopName}</span>
                    {isActive && (
                      <span className="text-[10px] bg-[#C04A22] text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1 flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" /> Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setShowStoreSheet(false);
                openMigrateModal();
              }}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-[#C04A22]/40 text-[#8C3015] hover:bg-[#C04A22]/10 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#C04A22]" />
              <span>+ Create Another Business Account</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
