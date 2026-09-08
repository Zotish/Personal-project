import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { BarChart2, Package, ShoppingCart, MessageSquare, Settings, Store, ArrowLeftRight } from "lucide-react";
import { useAccountMode } from "../../context/AccountModeContext";

interface SellerMobileNavProps {
  activeTab?: string;
  onTabChange?: (tab: "overview" | "products" | "orders" | "messages" | "settings") => void;
}

export function SellerMobileNav({ activeTab = "overview", onTabChange }: SellerMobileNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { switchMode } = useAccountMode();
  const [isVisible, setIsVisible] = useState(true);
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
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders (14)", icon: ShoppingCart },
    { id: "messages", label: "Messages (2)", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
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
      <div className="flex items-center justify-around px-1 py-1.5">
        {sellerItems.map(item => {
          const Icon = item.icon;
          const isSelected = location.pathname === "/seller-dashboard" && activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 group ${
                isSelected ? "text-[#8C3015] font-bold" : "text-slate-600 hover:text-[#8C3015]"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isSelected ? "bg-[#C04A22]/10 text-[#8C3015]" : "group-hover:bg-[#C04A22]/10 group-hover:text-[#8C3015]"}`}>
                <Icon className={`w-5 h-5 transition-colors ${isSelected ? "text-[#8C3015]" : "text-slate-600 group-hover:text-[#8C3015]"}`} />
              </div>
              <span className="text-[10px] leading-none font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Switch back to Buyer Feed */}
        <button
          onClick={() => switchMode("member")}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-slate-600 hover:text-[#8C3015] transition-all group cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-slate-50 group-hover:bg-[#C04A22]/10">
            <ArrowLeftRight className="w-5 h-5 text-slate-600 group-hover:text-[#8C3015] transition-colors" />
          </div>
          <span className="text-[10px] leading-none font-medium">Member Mode</span>
        </button>
      </div>
    </nav>
  );
}
