import React, { useState, useRef } from "react";
import { useMobileTabs, AndroidAppTask } from "../../context/MobileTabContext";
import {
  X, ChevronDown, Trash2, Navigation, Briefcase, Home,
  Utensils, Scale, MessageCircle, ShoppingBag, Clapperboard,
  MapPin, Check, Plus, Shield, Search, ArrowLeft, Building2,
  HeartHandshake, GraduationCap, Heart, Star, Users, HelpCircle,
  Bookmark, Settings, Lock, Package, Truck, Play, Flame, CheckCircle2,
  Sparkles
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

  // Render authentic high-fidelity snapshot tailored to the exact page
  const renderAppSnapshot = (task: AndroidAppTask) => {
    const p = task.path.toLowerCase();

    // 1. Live GPS & Map Discovery (Pathasathi)
    if (p === "/map" || p.includes("map")) {
      return (
        <div className="w-full h-full bg-[#E5E3DF] p-3 flex flex-col justify-between relative overflow-hidden select-none">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-1/3 left-0 right-0 h-4 bg-white border-y border-slate-400 rotate-12" />
            <div className="absolute top-0 bottom-0 left-1/2 w-5 bg-white border-x border-slate-400 -rotate-6" />
            <div className="absolute top-1/2 left-0 right-0 h-6 bg-amber-200 border-y border-amber-400" />
          </div>

          <div className="relative z-10 bg-[#137333] text-white p-2.5 rounded-2xl shadow-md flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black leading-tight">In 400 m</div>
              <div className="text-[9px] text-emerald-100 truncate">Keep left toward destination</div>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xl border-2 border-white animate-pulse">
              <Navigation className="w-4 h-4" />
            </div>
          </div>

          <div className="relative z-10 bg-white/95 rounded-2xl p-2.5 shadow-md border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-black text-emerald-600 text-sm">5 min</span>
              <div className="text-[9px] text-slate-500 font-medium">3:12 AM • 402 m • 0 km/h</div>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-red-50 text-red-600 text-[10px] font-bold border border-red-200">
              Exit
            </div>
          </div>
        </div>
      );
    }

    // 2. Jobs & Careers
    if (p.includes("job")) {
      return (
        <div className="w-full h-full bg-slate-50 p-3 flex flex-col gap-2 select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="text-xs font-black text-slate-900">Job Opportunities (420)</span>
            <span className="text-[9px] text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-full">Sponsorship</span>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex justify-between items-start">
              <div className="font-bold text-xs text-slate-900">React Frontend Engineer</div>
              <span className="text-xs font-black text-emerald-600">$45/hr</span>
            </div>
            <div className="text-[10px] text-slate-500">TechCorp USA • New York, NY</div>
            <div className="flex gap-1 pt-0.5">
              <span className="text-[8px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">Full-time</span>
              <span className="text-[8px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-semibold">H-1B</span>
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex justify-between items-start">
              <div className="font-bold text-xs text-slate-900">Delivery Driver / Courier</div>
              <span className="text-xs font-black text-emerald-600">$25/hr</span>
            </div>
            <div className="text-[10px] text-slate-500">FastShip • Queens, NY</div>
          </div>
        </div>
      );
    }

    // 3. Marketplace Orders & Deliveries
    if (p === "/orders" || p.includes("order")) {
      return (
        <div className="w-full h-full bg-slate-50 p-3 flex flex-col gap-2 select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="text-xs font-black text-slate-900">Active Orders & Deliveries</span>
            <span className="text-[9px] text-orange-700 font-bold bg-orange-100 px-2 py-0.5 rounded-full">2 Active</span>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-orange-200/80 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-orange-600" />
                <span className="font-bold text-xs text-slate-900">Halal Beef & Spices Box</span>
              </div>
              <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">In Transit</span>
            </div>
            <div className="text-[10px] text-slate-500">Driver on the way • ETA 20 mins</div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-orange-500 rounded-full" />
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Wooden Dining Table</span>
              <span className="text-[9px] font-bold text-emerald-600">Delivered ✓</span>
            </div>
            <div className="text-[10px] text-slate-500">Order #84920 • $120.00</div>
          </div>
        </div>
      );
    }

    // 4. Immigrant Reels & Stories
    if (p === "/reels" || p.includes("reel")) {
      return (
        <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-black p-3 flex flex-col justify-between text-white select-none relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-black text-white flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-pink-500" /> Reels
            </span>
            <span className="text-[9px] bg-pink-500/30 text-pink-300 px-2 py-0.5 rounded-full font-bold">Trending</span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <Play className="w-14 h-14 text-white" />
          </div>

          <div className="z-10 space-y-1.5 bg-gradient-to-t from-black/80 to-transparent p-1 rounded-xl">
            <div className="text-xs font-black text-white leading-tight">
              🇺🇸 How I passed my US citizenship interview in 2 weeks!
            </div>
            <div className="text-[10px] text-slate-300 font-medium flex items-center gap-2">
              <span>@rahim_nyc</span>
              <span>•</span>
              <span>❤️ 14.2k</span>
              <span>•</span>
              <span>💬 920</span>
            </div>
          </div>
        </div>
      );
    }

    // 5. Free Food & Pantries
    if (p.includes("food") && !p.includes("store")) {
      return (
        <div className="w-full h-full bg-slate-50 p-3 flex flex-col gap-2 select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="text-xs font-black text-slate-900">Free Food & Pantries</span>
            <span className="text-[9px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full">Open Now</span>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="font-bold text-xs text-slate-900">Queens Halal Food Pantry</div>
            <div className="text-[10px] text-slate-500">Free fresh groceries, rice & halal chicken</div>
            <div className="text-[9px] text-emerald-600 font-bold pt-0.5">0.4 miles away • Open today</div>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="font-bold text-xs text-slate-900">St. Peter Hot Meal Kitchen</div>
            <div className="text-[10px] text-slate-500">Free hot lunch served daily 12-2 PM</div>
          </div>
        </div>
      );
    }

    // 6. Housing & Rooms
    if (p.includes("housing")) {
      return (
        <div className="w-full h-full bg-slate-50 p-3 flex flex-col gap-2 select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="text-xs font-black text-slate-900">Housing & Rooms</span>
            <span className="text-[9px] text-cyan-700 font-bold bg-cyan-100 px-2 py-0.5 rounded-full">Astoria</span>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex justify-between items-start">
              <div className="font-bold text-xs text-slate-900">Private Room in Astoria</div>
              <span className="text-xs font-black text-cyan-600">$750/mo</span>
            </div>
            <div className="text-[10px] text-slate-500">Furnished, utilities incl. • Near N/W train</div>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex justify-between items-start">
              <div className="font-bold text-xs text-slate-900">1 Bedroom Apt Sublet</div>
              <span className="text-xs font-black text-cyan-600">$1,400/mo</span>
            </div>
            <div className="text-[10px] text-slate-500">No credit score check required</div>
          </div>
        </div>
      );
    }

    // 7. Legal Aid & Asylum
    if (p.includes("legal") || p.includes("checklist")) {
      return (
        <div className="w-full h-full bg-slate-50 p-3 flex flex-col gap-2 select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="text-xs font-black text-slate-900">Legal Aid & Asylum</span>
            <span className="text-[9px] text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded-full">Pro-Bono</span>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="font-bold text-xs text-slate-900">New York Immigration Coalition</div>
            <div className="text-[10px] text-slate-500">Free consultation for asylum & work permits</div>
            <div className="text-[9px] text-rose-600 font-bold">Verified Partner • Free Aid</div>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="font-bold text-xs text-slate-900">Form I-589 Asylum Checklist</div>
            <div className="text-[10px] text-slate-500">Step 4 of 6 completed</div>
          </div>
        </div>
      );
    }

    // 8. Places of Worship / Religion
    if (p.includes("religion") || p.includes("religious")) {
      return (
        <div className="w-full h-full bg-slate-50 p-3 flex flex-col gap-2 select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="text-xs font-black text-slate-900">Places of Worship</span>
            <span className="text-[9px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">Nearby</span>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="font-bold text-xs text-slate-900">Madina Islamic Center</div>
            <div className="text-[10px] text-slate-500">Jummah Prayer: 1:15 PM • Halal food available</div>
            <div className="text-[9px] text-amber-700 font-bold">0.6 miles • Jackson Heights</div>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="font-bold text-xs text-slate-900">St. Patrick Cathedral</div>
            <div className="text-[10px] text-slate-500">Sunday Service: 10:00 AM</div>
          </div>
        </div>
      );
    }

    // 9. Direct Messages
    if (p.includes("message")) {
      return (
        <div className="w-full h-full bg-slate-50 p-3 flex flex-col gap-2 select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="text-xs font-black text-slate-900">Direct Messages</span>
            <span className="text-[9px] text-teal-700 font-bold bg-teal-100 px-2 py-0.5 rounded-full">1 New</span>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-teal-200/70 shadow-2xs space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-slate-900">Tariqul Islam</span>
              <span className="text-[9px] text-slate-400">2m ago</span>
            </div>
            <div className="text-[10px] text-slate-600 line-clamp-1">"Let's meet tomorrow at the legal clinic."</div>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-slate-900">Sarah (Immigration Lawyer)</span>
              <span className="text-[9px] text-slate-400">1h ago</span>
            </div>
            <div className="text-[10px] text-slate-600 line-clamp-1">"I reviewed your documents, they look ready."</div>
          </div>
        </div>
      );
    }

    // 10. Schools & ESL Classes
    if (p.includes("school")) {
      return (
        <div className="w-full h-full bg-slate-50 p-3 flex flex-col gap-2 select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="text-xs font-black text-slate-900">Schools & ESL Classes</span>
            <span className="text-[9px] text-violet-700 font-bold bg-violet-100 px-2 py-0.5 rounded-full">Free</span>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="font-bold text-xs text-slate-900">Adult ESL English Class Level 1-4</div>
            <div className="text-[10px] text-slate-500">Queens Public Library • Free registration</div>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="font-bold text-xs text-slate-900">NYC School District 24</div>
            <div className="text-[10px] text-slate-500">K-12 enrollment support for newcomers</div>
          </div>
        </div>
      );
    }

    // 11. Healthcare & Hospitals
    if (p.includes("hospital")) {
      return (
        <div className="w-full h-full bg-slate-50 p-3 flex flex-col gap-2 select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="text-xs font-black text-slate-900">Healthcare & Clinics</span>
            <span className="text-[9px] text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded-full">No Insurance</span>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="font-bold text-xs text-slate-900">Elmhurst Community Health Center</div>
            <div className="text-[10px] text-slate-500">Sliding scale free & low cost medical clinic</div>
          </div>
        </div>
      );
    }

    // 12. User Profile
    if (p.includes("profile") || p.includes("user")) {
      return (
        <div className="w-full h-full bg-slate-50 p-3.5 flex flex-col gap-2.5 select-none">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-black text-sm shadow-sm">
              ZC
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">Zotish Chandra</div>
              <div className="text-[10px] text-slate-500">ImmigrantConnect Member • NYC</div>
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex justify-around text-center">
            <div>
              <div className="font-black text-xs text-slate-900">12</div>
              <div className="text-[9px] text-slate-400">Posts</div>
            </div>
            <div>
              <div className="font-black text-xs text-slate-900">148</div>
              <div className="text-[9px] text-slate-400">Following</div>
            </div>
            <div>
              <div className="font-black text-xs text-slate-900">230</div>
              <div className="text-[9px] text-slate-400">Saved</div>
            </div>
          </div>
        </div>
      );
    }

    // 13. Services Hub
    if (p === "/services") {
      return (
        <div className="w-full h-full bg-slate-50 p-3 flex flex-col gap-2 select-none">
          <div className="text-xs font-black text-slate-900 pb-1 border-b border-slate-200">
            Services & Immigrant Support Hub
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-800 border border-purple-100 text-xs font-bold flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-purple-600" /> Jobs
            </div>
            <div className="p-2 rounded-xl bg-green-50 text-green-800 border border-green-100 text-xs font-bold flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-green-600" /> Free Food
            </div>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-100 text-xs font-bold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-600" /> Housing
            </div>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-100 text-xs font-bold flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-rose-600" /> Legal Aid
            </div>
          </div>
        </div>
      );
    }

    // 14. Default Feed Snapshot
    return (
      <div className="w-full h-full bg-slate-50 p-3 flex flex-col gap-2 select-none">
        <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200">
          <div className="w-6 h-6 rounded-full bg-[#C04A22] text-white flex items-center justify-center font-black text-[10px]">
            P
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Pathasathi Feed</div>
            <div className="text-[9px] text-slate-500">Live community stories & updates</div>
          </div>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">AK</div>
            <div className="text-[10px] font-bold text-slate-800">Ahmed Khan</div>
          </div>
          <p className="text-[10px] text-slate-600 line-clamp-2">
            Just received my work authorization approval! Thank you everyone for the guidance.
          </p>
          <div className="flex gap-2.5 text-[8px] text-slate-400 font-semibold pt-0.5 border-t border-slate-100">
            <span>❤️ 42 Likes</span>
            <span>💬 18 Comments</span>
          </div>
        </div>
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
          <span className="text-sm font-black tracking-tight text-white">Recent Apps</span>
          <span className="text-[11px] text-amber-200/70 font-semibold bg-white/10 px-2.5 py-0.5 rounded-full">
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
      <div className="flex-1 flex items-center overflow-x-auto no-scrollbar snap-x snap-mandatory px-8 gap-5 py-4 min-h-0">
        {tasks.map((task) => {
          const isActive = task.id === activeTaskId;
          const isSwipedUp = swipedUpTaskId === task.id;
          const isDraggingThis = dragOffset?.id === task.id;
          const currentY = isDraggingThis ? dragOffset.y : 0;

          return (
            <div
              key={task.id}
              className={`flex-shrink-0 flex flex-col items-start snap-center transition-all duration-200 ${
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
              {/* ── 1. App Header Title & Icon with Dropdown Chevron (Exact Vivo OS style) ── */}
              <div
                onClick={() => switchTask(task.id)}
                className="flex items-center gap-2 mb-2 px-1 text-white cursor-pointer active:scale-95 transition"
              >
                {/* App Icon */}
                <div className={`w-6 h-6 rounded-lg ${task.iconBg} flex items-center justify-center text-white text-xs shadow-md`}>
                  {task.icon}
                </div>
                {/* App Name + Down Chevron */}
                <span className="text-xs font-bold text-white tracking-tight drop-shadow-sm">
                  {task.title}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-white/70" />
              </div>

              {/* ── 2. App Preview Card (Vivo Rounded Rect Deck) ── */}
              <div
                onClick={() => switchTask(task.id)}
                className={`w-[72vw] max-w-[290px] h-[54vh] max-h-[440px] rounded-[28px] overflow-hidden shadow-2xl border transition-all cursor-pointer relative group active:scale-[0.98] ${
                  isActive
                    ? "border-white/40 ring-4 ring-white/20 shadow-black/60"
                    : "border-white/15 hover:border-white/30 shadow-black/40"
                }`}
              >
                {/* Realistic Dynamic Snapshot Component */}
                {renderAppSnapshot(task)}

                {/* Dismiss Hint on Drag */}
                {isDraggingThis && currentY < -30 && (
                  <div className="absolute inset-0 bg-red-950/70 backdrop-blur-xs flex items-center justify-center text-white font-bold text-sm animate-in fade-in">
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
