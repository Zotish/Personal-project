import { useNavigate, useLocation } from "react-router";
import {
  BarChart2, Package, ShoppingCart, MessageSquare, Settings, Store,
  Globe, ArrowLeftRight, ExternalLink, ShieldCheck, ChevronRight, User, ArrowLeft
} from "lucide-react";
import { LanguageToggle } from "../ui/LanguageToggle";

interface SellerSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: "overview" | "products" | "orders" | "messages" | "settings") => void;
}

export function SellerSidebar({ activeTab = "overview", onTabChange }: SellerSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const sellerNav = [
    { id: "overview", label: "Dashboard Overview", icon: BarChart2, badge: null },
    { id: "products", label: "Products & Inventory", icon: Package, badge: "5" },
    { id: "orders", label: "Customer Orders", icon: ShoppingCart, badge: "14" },
    { id: "messages", label: "Buyer Inquiries & Chat", icon: MessageSquare, badge: "2" },
    { id: "settings", label: "Storefront Settings", icon: Settings, badge: null },
  ];

  const handleNavClick = (id: string) => {
    if (location.pathname !== "/seller-dashboard") {
      navigate("/seller-dashboard");
    }
    if (onTabChange) {
      onTabChange(id as any);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 bg-slate-900 text-slate-100 border-r border-slate-800 z-40">
      
      {/* Merchant Header Branding */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md border border-white/20">
            🏪
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm text-white">Merchant Portal</h1>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SaaS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">ImmigrantConnect Marketplace</p>
          </div>
        </div>
      </div>

      {/* Main Seller Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Merchant Navigation
        </div>

        {sellerNav.map(item => {
          const Icon = item.icon;
          const isSelected = location.pathname === "/seller-dashboard" && activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                isSelected
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isSelected ? "bg-white text-blue-700" : "bg-slate-800 text-slate-300 border border-slate-700"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Public Storefront Link */}
        <button
          onClick={() => navigate("/seller/28")}
          className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <Store className="w-4.5 h-4.5 text-emerald-400" />
            <span>Public Storefront</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </button>

      </nav>

      {/* Switch to Buyer Mode CTA Card */}
      <div className="p-3">
        <button
          onClick={() => navigate("/feed")}
          className="w-full p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition flex items-center gap-3 text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
            <ArrowLeftRight className="w-4 h-4 group-hover:rotate-180 transition duration-300" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-white block">Switch to Buyer Portal</span>
            <span className="text-[10px] text-slate-400 block truncate">Return to user feed & map</span>
          </div>
        </button>
      </div>

      {/* Clean Language Toggle */}
      <div className="px-3 pb-3">
        <LanguageToggle />
      </div>

      {/* Merchant Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3 p-2 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm border border-white/20">
            GM
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate flex items-center gap-1">
              Gulshan Resale Mart
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">Verified Merchant SaaS</div>
          </div>
        </div>
      </div>

    </aside>
  );
}
