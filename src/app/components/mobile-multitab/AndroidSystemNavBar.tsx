import React, { useState } from "react";
import { useMobileTabs } from "../../context/MobileTabContext";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export function AndroidSystemNavBar() {
  const {
    tasks,
    activeTaskId,
    switchToNextTask,
    switchToPrevTask,
    setIsRecentsOpen,
    activeTaskToast,
  } = useMobileTabs();

  const navigate = useNavigate();
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const activeIndex = tasks.findIndex(t => t.id === activeTaskId);
  const activeTask = tasks[activeIndex] || tasks[0];
  const nextTask = tasks[(activeIndex + 1) % tasks.length];
  const prevTask = tasks[(activeIndex - 1 + tasks.length) % tasks.length];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const dx = e.touches[0].clientX - touchStart.x;
    setDragOffset(dx);
  };

  const handleTouchEnd = () => {
    if (!touchStart) return;
    const dx = dragOffset;
    setTouchStart(null);
    setDragOffset(0);

    if (dx < -35) {
      switchToNextTask();
    } else if (dx > 35) {
      switchToPrevTask();
    }
  };

  return (
    <>
      {/* ── Floating Android App Switch Toast ── */}
      {activeTaskToast && (
        <div className="lg:hidden fixed top-3 left-1/2 -translate-x-1/2 z-[110] bg-slate-900/95 text-white px-4 py-2 rounded-full shadow-2xl border border-white/20 backdrop-blur-md flex items-center gap-2.5 animate-in slide-in-from-top-3 fade-in duration-150 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black tracking-wide truncate max-w-[210px]">{activeTaskToast}</span>
          <span className="text-[10px] text-slate-400 font-bold bg-white/10 px-2 py-0.5 rounded-full">
            App {activeIndex + 1}/{tasks.length}
          </span>
        </div>
      )}

      {/* ── Android 3-Button Navigation Bar + Gesture Pill Bar ── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[65] h-9 bg-black/90 backdrop-blur-md border-t border-white/10 flex items-center justify-between px-6 safe-area-pb select-none touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Recents Button `≡` (Opens Recent Apps Switcher) */}
        <button
          onClick={() => setIsRecentsOpen(true)}
          className="p-2 text-white/80 hover:text-white active:scale-90 transition cursor-pointer flex items-center justify-center"
          title="Android Recents (Multi-App Switcher)"
        >
          <div className="flex flex-col gap-0.5 items-center justify-center">
            <span className="w-4 h-0.5 bg-white/90 rounded-full" />
            <span className="w-4 h-0.5 bg-white/90 rounded-full" />
            <span className="w-4 h-0.5 bg-white/90 rounded-full" />
          </div>
        </button>

        {/* Center Android Gesture Home Pill */}
        <div
          onClick={() => setIsRecentsOpen(true)}
          className="flex flex-col items-center justify-center cursor-pointer py-1 px-4"
        >
          <div
            className="w-20 h-1 rounded-full bg-white/60 hover:bg-white transition-all shadow-xs"
            style={{
              transform: dragOffset !== 0 ? `translateX(${Math.max(-25, Math.min(25, dragOffset * 0.3))}px)` : "none",
            }}
          />
        </div>

        {/* Home Button `○` */}
        <button
          onClick={() => navigate("/feed")}
          className="p-2 text-white/80 hover:text-white active:scale-90 transition cursor-pointer flex items-center justify-center"
          title="Home Screen"
        >
          <div className="w-3.5 h-3.5 rounded-full border-2 border-white/90" />
        </button>

        {/* Back Button `<` */}
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-white/80 hover:text-white active:scale-90 transition cursor-pointer flex items-center justify-center"
          title="Back"
        >
          <ChevronLeft className="w-4 h-4 text-white/90" />
        </button>
      </div>
    </>
  );
}
