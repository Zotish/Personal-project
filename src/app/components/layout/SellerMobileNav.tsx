import { useNavigate, useLocation } from "react-router";
import { BarChart2, Package, ShoppingCart, MessageSquare, Settings, Store, ArrowLeftRight } from "lucide-react";

interface SellerMobileNavProps {
  activeTab?: string;
  onTabChange?: (tab: "overview" | "products" | "orders" | "messages" | "settings") => void;
}

export function SellerMobileNav({ activeTab = "overview", onTabChange }: SellerMobileNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 text-slate-900 safe-area-pb shadow-lg">
      <div className="flex items-center justify-around px-1 py-1.5">
        {sellerItems.map(item => {
          const Icon = item.icon;
          const isSelected = location.pathname === "/seller-dashboard" && activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 group ${
                isSelected ? "text-[#D85A30] font-bold" : "text-slate-500 hover:text-[#993C1D]"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isSelected ? "bg-[#D85A30]/10 text-[#D85A30]" : "group-hover:bg-[#993C1D]/10 group-hover:text-[#993C1D]"}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] leading-none font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Switch back to Buyer Feed */}
        <button
          onClick={() => navigate("/feed")}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-[#993C1D] transition-all group"
        >
          <div className="p-1.5 rounded-xl bg-slate-50 group-hover:bg-[#993C1D]/10">
            <ArrowLeftRight className="w-5 h-5 text-slate-500 group-hover:text-[#993C1D] transition-colors" />
          </div>
          <span className="text-[10px] leading-none font-medium">Buyer Mode</span>
        </button>
      </div>
    </nav>
  );
}
