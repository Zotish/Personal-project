import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  BarChart2, Package, ShoppingCart, MessageSquare, Settings, Store,
  Globe, ArrowLeftRight, ExternalLink, ShieldCheck, ChevronRight, User, ArrowLeft, Check, LogOut, ChevronUp
} from "lucide-react";
import { LanguageToggle } from "../ui/LanguageToggle";
import { Logo } from "../ui/Logo";

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
                  ? "bg-[#D85A30]/12 text-[#993C1D] border border-[#D85A30]/20 shadow-2xs"
                  : "text-slate-700 hover:bg-[#D85A30]/10 hover:text-[#993C1D]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 transition-colors ${isSelected ? "text-[#993C1D]" : "text-slate-500 group-hover:text-[#993C1D]"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-colors ${
                  isSelected ? "bg-[#D85A30]/20 text-[#993C1D]" : "bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-[#D85A30]/10 group-hover:text-[#993C1D]"
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
          className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-[#993C1D]/10 hover:text-[#993C1D] transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <Store className="w-4.5 h-4.5 text-slate-500 group-hover:text-[#993C1D] transition-colors" />
            <span>Public View</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#993C1D] transition-colors" />
        </button>

      </nav>

      {/* Switch to Buyer Mode CTA Card */}
      <div className="p-3">
        <button
          onClick={() => navigate("/feed")}
          className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-[#993C1D]/10 border border-slate-200 transition flex items-center gap-3 text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#993C1D]/10 text-[#993C1D] flex items-center justify-center flex-shrink-0 border border-[#993C1D]/20">
            <ArrowLeftRight className="w-4 h-4 group-hover:rotate-180 transition duration-300" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-900 block">Switch to Buyer Portal</span>
            <span className="text-[10px] text-slate-500 block truncate">Return to user feed & map</span>
          </div>
        </button>
      </div>

      {/* Clean Language Toggle */}
      <div className="px-3 pb-3">
        <LanguageToggle />
      </div>

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
          <div
            className="w-9 h-9 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)" }}
          >
            G
          </div>
          <div className="flex-1 min-w-0 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
              <span>Gulshan</span>
              <div
                className="w-4 h-4 rounded-full text-white flex items-center justify-center shadow-xs flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)" }}
                title="Verified Merchant"
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>
            <ChevronUp className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>

    </aside>
  );
}
