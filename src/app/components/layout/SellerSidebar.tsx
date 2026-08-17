import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  BarChart2, Package, ShoppingCart, MessageSquare, Settings, Store,
  Globe, ArrowLeftRight, ExternalLink, ShieldCheck, ChevronRight, User, ArrowLeft, Check, LogOut, ChevronUp
} from "lucide-react";
import { LanguageToggle } from "../ui/LanguageToggle";
import { Logo } from "../ui/Logo";
import { GoldenBadge } from "../ui/GoldenBadge";

interface SellerSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: "overview" | "products" | "orders" | "messages" | "settings") => void;
}

export function SellerSidebar({ activeTab = "overview", onTabChange }: SellerSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    navigate("/auth");
  };

  const sellerNav = [
    { id: "overview", label: "Dashboard Overview", icon: BarChart2, badge: null },
    { id: "products", label: "Products & Inventory", icon: Package, badge: "5" },
    { id: "orders", label: "Customer Orders", icon: ShoppingCart, badge: "3" },
    { id: "messages", label: "Buyer Messages", icon: MessageSquare, badge: "2" },
    { id: "settings", label: "Shop Settings", icon: Settings, badge: null },
  ];

  const handleNavClick = (id: string) => {
    if (location.pathname !== "/seller-dashboard") {
      navigate("/seller-dashboard");
    }
    if (onTabChange) {
      onTabChange(id as "overview" | "products" | "orders" | "messages" | "settings");
    }
  };

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 bg-white text-slate-900 border-r border-slate-200 z-40 shadow-xs">
      
      {/* PathaSathi Merchant Header Branding */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-start bg-white">
        <Logo size="md" onClick={() => navigate("/seller-dashboard")} />
      </div>

      {/* Main Seller Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">

        {sellerNav.map(item => {
          const Icon = item.icon;
          const isSelected = location.pathname === "/seller-dashboard" && activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left group ${
                isSelected
                  ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/20 shadow-2xs"
                  : "text-slate-700 hover:bg-[#C04A22]/10 hover:text-[#8C3015]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 transition-colors ${isSelected ? "text-[#8C3015]" : "text-slate-500 group-hover:text-[#8C3015]"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-colors ${
                  isSelected ? "bg-[#C04A22]/20 text-[#8C3015]" : "bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-[#C04A22]/10 group-hover:text-[#8C3015]"
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
          className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-[#C04A22]/10 hover:text-[#8C3015] transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <Store className="w-4.5 h-4.5 text-slate-500 group-hover:text-[#8C3015] transition-colors" />
            <span>Public View</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#8C3015] transition-colors" />
        </button>

      </nav>





      {/* Merchant Profile Footer with Logout Popover Menu */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80 relative">
        
        {/* Logout Popover Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 transition-all">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <span className="text-xs font-bold text-slate-900 block">Gulshan</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Log Out</span>
            </button>
          </div>
        )}

        <div
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition select-none group"
        >
          <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300/60 text-slate-500 flex items-center justify-center shadow-2xs flex-shrink-0">
            <User className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
              <span>Gulshan</span>
              <GoldenBadge size={16} title="Verified Merchant" />
            </div>
            <ChevronUp className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>

    </aside>
  );
}
