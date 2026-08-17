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
          onClick={() => navigate("/feed")}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-slate-600 hover:text-[#8C3015] transition-all group"
        >
          <div className="p-1.5 rounded-xl bg-slate-50 group-hover:bg-[#C04A22]/10">
            <ArrowLeftRight className="w-5 h-5 text-slate-600 group-hover:text-[#8C3015] transition-colors" />
          </div>
          <span className="text-[10px] leading-none font-medium">Buyer Mode</span>
        </button>
      </div>
    </nav>
  );
}
