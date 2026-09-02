import React, { useState, useRef } from "react";
import { useMobileTabs, AndroidAppTask } from "../../context/MobileTabContext";
import {
  X, ChevronDown, Trash2, Navigation, Briefcase, Home,
  Utensils, Scale, MessageCircle, ShoppingBag, Clapperboard,
  MapPin, Check, Plus, Shield, Search, ArrowLeft, Building2,
  HeartHandshake, GraduationCap, Heart, Star, Users, HelpCircle,
  Bookmark, Settings, Lock, Package, Truck, Play, Flame, CheckCircle2,
  Sparkles, UserCheck, Bell, User, MessageSquare, Repeat2, Share2,
  Clock, MoreHorizontal, LayoutGrid
} from "lucide-react";
import { useNavigate } from "react-router";

export function AndroidRecentAppsSwitcher() {
  const {
    tasks,
    activeTaskId,
    isRecentsOpen,
    setIsRecentsOpen,
    switchTask,
    closeTask,
    clearAllTasks,
  } = useMobileTabs();

  const navigate = useNavigate();
  const [swipedUpTaskId, setSwipedUpTaskId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ id: string; y: number } | null>(null);
  const touchStartRef = useRef<{ y: number; x: number; id: string } | null>(null);

  if (!isRecentsOpen) return null;

  const handleCardTouchStart = (e: React.TouchEvent, taskId: string) => {
    const t = e.touches[0];
    touchStartRef.current = { y: t.clientY, x: t.clientX, id: taskId };
  };

  const handleCardTouchMove = (e: React.TouchEvent, taskId: string) => {
    if (!touchStartRef.current || touchStartRef.current.id !== taskId) return;
    const t = e.touches[0];
    const dy = t.clientY - touchStartRef.current.y;
    // Only allow upward drag
    if (dy < 0) {
      setDragOffset({ id: taskId, y: dy });
    }
  };

  const handleCardTouchEnd = (taskId: string) => {
    if (dragOffset && dragOffset.id === taskId && dragOffset.y < -90) {
      // Swiped UP enough -> Dismiss task
      setSwipedUpTaskId(taskId);
      setTimeout(() => {
        closeTask(taskId);
        setSwipedUpTaskId(null);
        setDragOffset(null);
      }, 220);
    } else {
      setDragOffset(null);
    }
    touchStartRef.current = null;
  };

  // Reusable bottom nav bar mockup for realistic app appearance
  const renderMiniBottomNav = (activeTab: "home" | "services" | "map" | "recents" | "reels" | "more") => (
    <div className="w-full bg-white border-t border-slate-200/80 px-2 py-1 flex items-center justify-around text-[9px] text-slate-500 flex-shrink-0 select-none">
      <div className={`flex flex-col items-center gap-0.5 ${activeTab === "home" ? "text-[#C04A22] font-black" : ""}`}>
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </div>
      <div className={`flex flex-col items-center gap-0.5 ${activeTab === "services" ? "text-[#C04A22] font-black" : ""}`}>
        <Briefcase className="w-3.5 h-3.5" />
        <span>Services</span>
      </div>
      <div className={`flex flex-col items-center gap-0.5 ${activeTab === "map" ? "text-[#C04A22] font-black" : ""}`}>
        <MapPin className="w-3.5 h-3.5" />
        <span>Map</span>
      </div>
      <div className={`flex flex-col items-center gap-0.5 ${activeTab === "recents" ? "text-[#C04A22] font-black" : ""}`}>
        <div className="w-3.5 h-3.5 rounded border border-current flex items-center justify-center text-[7px] font-black">
          {tasks.length}
        </div>
        <span>Recents</span>
      </div>
      <div className={`flex flex-col items-center gap-0.5 ${activeTab === "reels" ? "text-[#C04A22] font-black" : ""}`}>
        <Clapperboard className="w-3.5 h-3.5" />
        <span>Reels</span>
      </div>
      <div className={`flex flex-col items-center gap-0.5 ${activeTab === "more" ? "text-[#C04A22] font-black" : ""}`}>
        <MoreHorizontal className="w-3.5 h-3.5" />
        <span>More</span>
      </div>
    </div>
  );

  // Render 100% exact high-fidelity snapshot tailored to the exact page
  const renderAppSnapshot = (task: AndroidAppTask) => {
    const p = task.path.toLowerCase();

    // ─────────────────────────────────────────────────────────────
    // 1. Pathasathi Home Feed (/feed)
    // ─────────────────────────────────────────────────────────────
    if (p === "/feed" || p === "" || p === "/") {
      return (
        <div className="w-full h-full bg-slate-100 flex flex-col justify-between select-none overflow-hidden text-slate-800 text-left">
          {/* Top Header */}
          <div className="bg-white px-3 py-2 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-[#C04A22] flex items-center justify-center text-white text-[10px] font-black shadow-2xs">
                📍
              </div>
              <span className="font-black text-xs text-[#C04A22] tracking-tight">Pathasathi</span>
            </div>
            <div className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600">
              <Bell className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Sub-tabs bar */}
          <div className="bg-white border-b border-slate-200 grid grid-cols-5 py-1.5 px-1 text-center text-[8px] font-bold text-slate-500 flex-shrink-0">
            <div className="text-[#C04A22] border-b-2 border-[#C04A22] pb-0.5 flex items-center justify-center gap-0.5">
              <Star className="w-3 h-3 text-[#C04A22]" /> For You
            </div>
            <div className="flex items-center justify-center gap-0.5">
              <Package className="w-3 h-3" /> MyBox
            </div>
            <div className="flex items-center justify-center gap-0.5">
              <UserCheck className="w-3 h-3" /> Following
            </div>
            <div className="flex items-center justify-center gap-0.5 text-slate-600">
              <ShoppingBag className="w-3 h-3" /> Orders
            </div>
            <div className="flex items-center justify-center gap-0.5">
              <LayoutGrid className="w-3 h-3" /> Apps
            </div>
          </div>

          {/* Feed Content Stream */}
          <div className="flex-1 overflow-hidden p-2 space-y-2 bg-slate-50">
            {/* Post 1: Ahmed Khan */}
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">
                  AK
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-900 leading-none">Ahmed Khan</div>
                  <div className="text-[8px] text-slate-400">Queens, NY • 2h ago</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-700 leading-snug">
                Just received my work authorization approval! Thank you everyone for the legal aid and interview guide. 🇺🇸🎉
              </p>
              <div className="flex items-center gap-3 text-[9px] text-slate-500 pt-1 border-t border-slate-100 font-semibold">
                <span className="flex items-center gap-1 text-red-500">❤️ 42</span>
                <span className="flex items-center gap-1">💬 18</span>
                <span className="flex items-center gap-1">🔁 6</span>
              </div>
            </div>

            {/* Post 2: Fatima */}
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center">
                  FA
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-900 leading-none">Fatima Al-Sayed</div>
                  <div className="text-[8px] text-slate-400">Brooklyn, NY • 4h ago</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-700 leading-snug">
                Free halal fresh groceries and hot meals being distributed at Astoria Center today till 4 PM.
              </p>
            </div>
          </div>

          {/* Bottom Nav */}
          {renderMiniBottomNav("home")}
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Live GPS & Map Discovery (/map)
    // ─────────────────────────────────────────────────────────────
    if (p.includes("map")) {
      return (
        <div className="w-full h-full bg-[#E5E3DF] flex flex-col justify-between relative overflow-hidden select-none text-left">
          {/* Top Search bar */}
          <div className="bg-white/95 backdrop-blur-md p-2 border-b border-slate-200 z-10 space-y-1.5 flex-shrink-0">
            <div className="bg-slate-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-slate-400 text-[10px]">
              <Search className="w-3 h-3 text-slate-500" />
              <span>Search jobs, food, shelters...</span>
            </div>
            <div className="flex gap-1 overflow-hidden text-[8px] font-bold">
              <span className="bg-[#C04A22] text-white px-2 py-0.5 rounded-full">All (28)</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">Jobs</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">Food</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">Housing</span>
            </div>
          </div>

          {/* Map Vector Roads Background */}
          <div className="absolute inset-0 top-14 bottom-14 opacity-60">
            <div className="absolute top-1/4 left-0 right-0 h-4 bg-white border-y border-slate-400 rotate-12" />
            <div className="absolute top-0 bottom-0 left-1/2 w-6 bg-white border-x border-slate-400 -rotate-6" />
            <div className="absolute top-2/3 left-0 right-0 h-5 bg-amber-200 border-y border-amber-400" />
            {/* Red GPS Navigation Route line */}
            <div className="absolute top-1/2 left-10 right-20 h-1.5 bg-red-500 rounded-full shadow-md" />
          </div>

          {/* Top Green Turn Banner */}
          <div className="mx-2 z-10 bg-[#137333] text-white p-2.5 rounded-2xl shadow-lg flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black leading-tight">In 402 m</div>
              <div className="text-[9px] text-emerald-100 truncate">Keep left toward destination</div>
            </div>
          </div>

          {/* User Location Marker Puck */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl border-2 border-white animate-pulse">
              <Navigation className="w-4 h-4" />
            </div>
          </div>

          {/* Bottom ETA HUD Card */}
          <div className="mx-2 mb-1 z-10 bg-white rounded-2xl p-2.5 shadow-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-black text-emerald-600 text-sm">5 min</span>
              </div>
              <div className="text-[9px] text-slate-500 font-medium mt-0.5">3:12 AM • 402 m • 0 km/h</div>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-red-50 text-red-600 text-[10px] font-black border border-red-200">
              ✕ Exit
            </div>
          </div>

          {/* Bottom Nav */}
          {renderMiniBottomNav("map")}
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Jobs & Careers (/services/jobs)
    // ─────────────────────────────────────────────────────────────
    if (p.includes("job")) {
      return (
        <div className="w-full h-full bg-slate-50 flex flex-col justify-between select-none overflow-hidden text-left">
          {/* Top Header */}
          <div className="bg-white p-2.5 border-b border-slate-200 space-y-1.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-600" /> Jobs & Opportunities
              </span>
              <span className="text-[8px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">420 Active</span>
            </div>
            <div className="flex gap-1 text-[8px] font-bold overflow-hidden">
              <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full">All</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">Sponsorship</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">Cash in Hand</span>
            </div>
          </div>

          {/* Job Listings List */}
          <div className="flex-1 overflow-hidden p-2 space-y-2">
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex justify-between items-start">
                <div className="font-black text-xs text-slate-900">React Frontend Engineer</div>
                <span className="text-xs font-black text-emerald-600">$45/hr</span>
              </div>
              <div className="text-[9px] text-slate-500">TechCorp USA • New York, NY</div>
              <div className="flex gap-1 pt-0.5">
                <span className="text-[8px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">Full-time</span>
                <span className="text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">H-1B Sponsor</span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex justify-between items-start">
                <div className="font-black text-xs text-slate-900">Commercial CDL Driver</div>
                <span className="text-xs font-black text-emerald-600">$32/hr</span>
              </div>
              <div className="text-[9px] text-slate-500">Swift Logistics • Queens, NY</div>
              <div className="flex gap-1 pt-0.5">
                <span className="text-[8px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">Weekly Pay</span>
                <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">Immediate</span>
              </div>
            </div>
          </div>

          {/* Bottom Nav */}
          {renderMiniBottomNav("services")}
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Marketplace Orders (/orders)
    // ─────────────────────────────────────────────────────────────
    if (p.includes("order")) {
      return (
        <div className="w-full h-full bg-slate-50 flex flex-col justify-between select-none overflow-hidden text-left">
          {/* Top Header */}
          <div className="bg-white p-2.5 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-orange-600" /> My Orders & Deliveries
              </span>
              <span className="text-[8px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">2 Active</span>
            </div>
          </div>

          {/* Orders List */}
          <div className="flex-1 overflow-hidden p-2 space-y-2">
            <div className="bg-white p-2.5 rounded-2xl border border-orange-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-900">Halal Beef & Grocery Box</span>
                <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">In Transit</span>
              </div>
              <div className="text-[9px] text-slate-500 flex items-center gap-1">
                <Truck className="w-3 h-3 text-orange-500" />
                <span>Driver on the way • ETA 15 mins</span>
              </div>
              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-orange-500 rounded-full" />
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-900">Wooden Dining Table Set</span>
                <span className="text-[8px] font-bold text-emerald-600">Delivered ✓</span>
              </div>
              <div className="text-[9px] text-slate-500">Order #IC-84920 • $140.00</div>
            </div>
          </div>

          {/* Bottom Nav */}
          {renderMiniBottomNav("services")}
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 5. Immigrant Reels (/reels)
    // ─────────────────────────────────────────────────────────────
    if (p.includes("reel")) {
      return (
        <div className="w-full h-full bg-slate-950 flex flex-col justify-between text-white select-none overflow-hidden text-left relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-slate-900 to-black opacity-90" />
          
          <div className="relative z-10 px-3 py-2 flex items-center justify-between border-b border-white/10">
            <span className="text-xs font-black text-white flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-pink-500" /> Immigrant Reels
            </span>
            <span className="text-[8px] bg-pink-500/30 text-pink-300 font-bold px-2 py-0.5 rounded-full">Trending</span>
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-end p-3 space-y-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-pink-600 flex items-center justify-center text-[8px] font-bold">RK</div>
                <span className="text-[10px] font-bold text-white">@rahim_nyc</span>
              </div>
              <p className="text-[10px] text-slate-200 font-medium leading-snug">
                🇺🇸 How I passed my US citizenship interview in 2 weeks! #usnaturalization #immigrantlife
              </p>
            </div>
            <div className="flex gap-3 text-[9px] text-slate-300 font-bold">
              <span>❤️ 14.2k</span>
              <span>💬 920</span>
              <span>↗ Share</span>
            </div>
          </div>

          {renderMiniBottomNav("reels")}
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 6. Free Food & Pantries (/services/free-food)
    // ─────────────────────────────────────────────────────────────
    if (p.includes("food") && !p.includes("store")) {
      return (
        <div className="w-full h-full bg-slate-50 flex flex-col justify-between select-none overflow-hidden text-left">
          <div className="bg-white p-2.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-green-600" /> Free Food & Pantries
            </span>
            <span className="text-[8px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Open Today</span>
          </div>

          <div className="flex-1 overflow-hidden p-2 space-y-2">
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="font-black text-xs text-slate-900">Queens Community Food Pantry</div>
              <div className="text-[9px] text-slate-500">Free fresh groceries, halal meat & staples</div>
              <div className="text-[8px] text-emerald-600 font-bold">0.4 miles away • Open today till 3 PM</div>
            </div>
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="font-black text-xs text-slate-900">St. Peter Free Kitchen</div>
              <div className="text-[9px] text-slate-500">Hot lunches served daily 12:00 PM</div>
            </div>
          </div>

          {renderMiniBottomNav("services")}
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 7. Housing & Rooms (/services/housing)
    // ─────────────────────────────────────────────────────────────
    if (p.includes("housing")) {
      return (
        <div className="w-full h-full bg-slate-50 flex flex-col justify-between select-none overflow-hidden text-left">
          <div className="bg-white p-2.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-600" /> Housing & Rooms
            </span>
            <span className="text-[8px] bg-cyan-100 text-cyan-700 font-bold px-2 py-0.5 rounded-full">NYC</span>
          </div>

          <div className="flex-1 overflow-hidden p-2 space-y-2">
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex justify-between items-start">
                <div className="font-black text-xs text-slate-900">Furnished Room in Astoria</div>
                <span className="text-xs font-black text-cyan-600">$750/mo</span>
              </div>
              <div className="text-[9px] text-slate-500">Utilities incl. • 2 min to Subway • No Credit Check</div>
            </div>
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex justify-between items-start">
                <div className="font-black text-xs text-slate-900">1 Bedroom Apt Sublet</div>
                <span className="text-xs font-black text-cyan-600">$1,450/mo</span>
              </div>
              <div className="text-[9px] text-slate-500">Jackson Heights • Immigrant friendly</div>
            </div>
          </div>

          {renderMiniBottomNav("services")}
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 8. Legal Aid & Asylum (/services/legal)
    // ─────────────────────────────────────────────────────────────
    if (p.includes("legal") || p.includes("checklist")) {
      return (
        <div className="w-full h-full bg-slate-50 flex flex-col justify-between select-none overflow-hidden text-left">
          <div className="bg-white p-2.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-rose-600" /> Legal Aid & Asylum
            </span>
            <span className="text-[8px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">Pro-Bono</span>
          </div>

          <div className="flex-1 overflow-hidden p-2 space-y-2">
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="font-black text-xs text-slate-900">NY Immigration Coalition</div>
              <div className="text-[9px] text-slate-500">Free consultation for Asylum & Work Permits</div>
              <div className="text-[8px] text-rose-600 font-bold">Verified Partner • Free Legal Help</div>
            </div>
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="font-black text-xs text-slate-900">Form I-589 Asylum Tracker</div>
              <div className="text-[9px] text-slate-500">Step 4 of 6: Documents ready for filing</div>
            </div>
          </div>

          {renderMiniBottomNav("services")}
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 9. Places of Worship (/services/religion)
    // ─────────────────────────────────────────────────────────────
    if (p.includes("religion") || p.includes("religious")) {
      return (
        <div className="w-full h-full bg-slate-50 flex flex-col justify-between select-none overflow-hidden text-left">
          <div className="bg-white p-2.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-600" /> Places of Worship
            </span>
            <span className="text-[8px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Nearby</span>
          </div>

          <div className="flex-1 overflow-hidden p-2 space-y-2">
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="font-black text-xs text-slate-900">Madina Islamic Center</div>
              <div className="text-[9px] text-slate-500">Jummah Prayer: 1:15 PM • Daily 5 prayers</div>
              <div className="text-[8px] text-amber-700 font-bold">0.5 mi • Jackson Heights</div>
            </div>
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="font-black text-xs text-slate-900">St. Patrick Cathedral</div>
              <div className="text-[9px] text-slate-500">Sunday Mass: 10:00 AM</div>
            </div>
          </div>

          {renderMiniBottomNav("services")}
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 10. Direct Messages (/messages)
    // ─────────────────────────────────────────────────────────────
    if (p.includes("message")) {
      return (
        <div className="w-full h-full bg-slate-50 flex flex-col justify-between select-none overflow-hidden text-left">
          <div className="bg-white p-2.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-teal-600" /> Direct Messages
            </span>
            <span className="text-[8px] bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full">1 Unread</span>
          </div>

          <div className="flex-1 overflow-hidden p-2 space-y-1.5">
            <div className="bg-white p-2.5 rounded-2xl border border-teal-200 shadow-2xs space-y-0.5">
              <div className="flex justify-between items-center">
                <span className="font-black text-xs text-slate-900">Tariqul Islam</span>
                <span className="text-[8px] text-slate-400">2m ago</span>
              </div>
              <p className="text-[9px] text-slate-600 line-clamp-1">"See you at the legal clinic tomorrow!"</p>
            </div>
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
              <div className="flex justify-between items-center">
                <span className="font-black text-xs text-slate-900">Sarah (Lawyer)</span>
                <span className="text-[8px] text-slate-400">1h ago</span>
              </div>
              <p className="text-[9px] text-slate-600 line-clamp-1">"Your Form I-765 documents look complete."</p>
            </div>
          </div>

          {renderMiniBottomNav("more")}
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 11. Profile (/profile)
    // ─────────────────────────────────────────────────────────────
    if (p.includes("profile")) {
      return (
        <div className="w-full h-full bg-slate-50 flex flex-col justify-between select-none overflow-hidden text-left">
          <div className="bg-white p-3 border-b border-slate-200 flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-black text-xs">
              ZC
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">Zotish Chandra</div>
              <div className="text-[9px] text-slate-500">ImmigrantConnect Member • NYC</div>
            </div>
          </div>

          <div className="p-2 space-y-2 flex-1 overflow-hidden">
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex justify-around text-center text-[10px]">
              <div>
                <div className="font-black text-slate-900">14</div>
                <div className="text-[8px] text-slate-400">Posts</div>
              </div>
              <div>
                <div className="font-black text-slate-900">182</div>
                <div className="text-[8px] text-slate-400">Following</div>
              </div>
              <div>
                <div className="font-black text-slate-900">240</div>
                <div className="text-[8px] text-slate-400">Saved</div>
              </div>
            </div>
          </div>

          {renderMiniBottomNav("more")}
        </div>
      );
    }

    // Default Fallback
    return (
      <div className="w-full h-full bg-slate-50 flex flex-col justify-between select-none overflow-hidden text-left">
        <div className="bg-white p-2.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <span className="text-xs font-black text-slate-900">{task.title}</span>
        </div>
        <div className="p-3 flex-1 flex items-center justify-center text-slate-400 text-xs font-bold">
          {task.title}
        </div>
        {renderMiniBottomNav("home")}
      </div>
    );
  };

  return (
    <div className="lg:hidden fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200">
      {/* ── Ambient Wallpaper Background with Soft Blur (Matching Vivo OS screenshot) ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#8C6B3E]/70 via-[#4A3B22]/85 to-[#1A140A]/98 backdrop-blur-2xl -z-10" />

      {/* ── Top Header Bar ── */}
      <div className="w-full px-5 pt-4 pb-2 flex items-center justify-between text-white/90 safe-area-pt">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white font-bold bg-white/20 px-3 py-1 rounded-full shadow-xs tracking-tight">
            {tasks.length} active
          </span>
        </div>

        <button
          onClick={() => setIsRecentsOpen(false)}
          className="text-xs text-white/80 hover:text-white font-bold px-3 py-1 rounded-full bg-white/10 active:scale-95 transition cursor-pointer"
        >
          Done
        </button>
      </div>

      {/* ── Android 3D Horizontal Card Stack Carousel (Vivo Style) ── */}
      <div className="flex-1 flex items-center overflow-x-auto no-scrollbar snap-x snap-mandatory px-6 sm:px-10 gap-5 py-4 min-h-0">
        {tasks.map((task) => {
          const isActive = task.id === activeTaskId;
          const isSwipedUp = swipedUpTaskId === task.id;
          const isDraggingThis = dragOffset?.id === task.id;
          const currentY = isDraggingThis ? dragOffset.y : 0;

          return (
            <div
              key={task.id}
              className={`flex-shrink-0 flex flex-col items-center snap-center transition-all duration-200 ${
                isSwipedUp ? "opacity-0 -translate-y-48 scale-75" : ""
              }`}
              style={{
                transform: isDraggingThis ? `translateY(${currentY}px)` : undefined,
                transition: isDraggingThis ? "none" : "all 0.22s ease-out",
              }}
              onTouchStart={(e) => handleCardTouchStart(e, task.id)}
              onTouchMove={(e) => handleCardTouchMove(e, task.id)}
              onTouchEnd={() => handleCardTouchEnd(task.id)}
            >
              {/* ── 1. App Header Title with Dropdown Chevron (No left icon, 1-word title) ── */}
              <div
                onClick={() => switchTask(task.id)}
                className="flex items-center gap-1.5 mb-2 px-1 text-white cursor-pointer active:scale-95 transition"
              >
                {/* App Name + Down Chevron */}
                <span className="text-sm font-bold text-white tracking-tight drop-shadow-sm">
                  {task.title}
                </span>
                <ChevronDown className="w-4 h-4 text-white/85 stroke-[2.5]" />
              </div>

              {/* ── 2. App Preview Card (Vivo Rounded Rect Deck) ── */}
              <div
                onClick={() => switchTask(task.id)}
                className={`w-[74vw] max-w-[295px] h-[56vh] max-h-[460px] rounded-[28px] overflow-hidden shadow-2xl border transition-all cursor-pointer relative group active:scale-[0.98] bg-white ${
                  isActive
                    ? "border-white/50 ring-4 ring-white/25 shadow-black/70"
                    : "border-white/20 hover:border-white/35 shadow-black/50"
                }`}
              >
                {/* 100% Exact Live Scaled Viewport / Iframe - Perfectly Centered */}
                <div className="w-full h-full relative overflow-hidden bg-white rounded-[28px] pointer-events-none select-none flex items-start justify-center">
                  <div
                    className="origin-top flex-shrink-0 flex items-start justify-center"
                    style={{
                      transform: "scale(0.74)",
                      transformOrigin: "top center",
                      width: "390px",
                      height: "620px",
                    }}
                  >
                    <iframe
                      src={task.path}
                      title={task.title}
                      className="w-[390px] h-[620px] border-0 pointer-events-none select-none bg-white"
                      tabIndex={-1}
                    />
                  </div>
                  {/* Transparent touch capture overlay to ensure swipe/tap gestures work smoothly */}
                  <div className="absolute inset-0 z-20 bg-transparent" />
                </div>

                {/* Dismiss Hint on Drag */}
                {isDraggingThis && currentY < -30 && (
                  <div className="absolute inset-0 z-30 bg-red-950/80 backdrop-blur-xs flex items-center justify-center text-white font-bold text-sm animate-in fade-in">
                    <Trash2 className="w-6 h-6 mr-2 text-red-400" />
                    <span>Swipe up to close</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Bottom Close All Circular Button (Exact Vivo / Android OS `( ✕ )` button) ── */}
      <div className="flex flex-col items-center justify-center pt-1 pb-6 flex-shrink-0 safe-area-pb">
        <button
          onClick={clearAllTasks}
          className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 border border-white/25 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl transition active:scale-90 cursor-pointer mb-2"
          title="Clear All Background Apps"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>
        <span className="text-[10px] text-white/60 font-semibold">Swipe up on card to dismiss</span>
      </div>
    </div>
  );
}
