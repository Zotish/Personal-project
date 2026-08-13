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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 text-white safe-area-pb">
      <div className="flex items-center justify-around px-1 py-1.5">
        {sellerItems.map(item => {
          const Icon = item.icon;
          const isSelected = location.pathname === "/seller-dashboard" && activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 ${
                isSelected ? "text-blue-400 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isSelected ? "bg-blue-600/20 text-blue-400" : ""}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] leading-none">{item.label}</span>
            </button>
          );
        })}

        {/* Switch back to Buyer Feed */}
        <button
          onClick={() => navigate("/feed")}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition-all"
        >
          <div className="p-1.5 rounded-xl">
            <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] leading-none text-emerald-400 font-bold">Buyer View</span>
        </button>
      </div>
    </nav>
  );
}
