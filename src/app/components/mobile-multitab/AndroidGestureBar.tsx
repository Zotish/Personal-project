import React, { useState, useRef, useEffect } from "react";
import { useMobileTabs } from "../../context/MobileTabContext";
import { ChevronLeft, ChevronRight, Layers, Sparkles } from "lucide-react";

export function AndroidGestureBar() {
  const {
    tabs,
    activeTabId,
    switchToNextTab,
    switchToPrevTab,
    setIsSwitcherOpen,
    activeTabToast,
  } = useMobileTabs();

  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const activeIndex = tabs.findIndex(t => t.id === activeTabId);
  const activeTab = tabs[activeIndex] || tabs[0];
  const prevTab = tabs[(activeIndex - 1 + tabs.length) % tabs.length];
  const nextTab = tabs[(activeIndex + 1) % tabs.length];

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY, time: Date.now() });
    setTouchOffset({ x: 0, y: 0 });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    setTouchOffset({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    if (!touchStart) return;
    const dx = touchOffset.x;
    const dy = touchOffset.y;
    const dt = Date.now() - touchStart.time;

    setIsDragging(false);
    setTouchStart(null);
    setTouchOffset({ x: 0, y: 0 });

    // Swipe UP -> Open Tab Switcher
    if (dy < -35 && Math.abs(dx) < 40) {
      setIsSwitcherOpen(true);
      return;
    }

    // Swipe LEFT -> Next Tab
    if (dx < -30 && Math.abs(dy) < 60) {
      switchToNextTab();
      return;
    }

    // Swipe RIGHT -> Previous Tab
    if (dx > 30 && Math.abs(dy) < 60) {
      switchToPrevTab();
      return;
    }

    // Quick Tap -> Open Switcher
    if (dt < 250 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      setIsSwitcherOpen(true);
    }
  };

  // Global horizontal screen edge swipe listeners for mobile
  useEffect(() => {
    let edgeStartX = 0;
    let edgeStartY = 0;

    const onGlobalTouchStart = (e: TouchEvent) => {
      // Ignore if multi-touch or inside inputs
      if (e.touches.length > 1) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.closest(".no-tab-swipe")) {
        return;
      }
      edgeStartX = e.touches[0].clientX;
      edgeStartY = e.touches[0].clientY;
    };

    const onGlobalTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 0) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - edgeStartX;
      const dy = endY - edgeStartY;

      // Bottom screen swipe (within bottom 120px)
      if (edgeStartY > window.innerHeight - 120 && Math.abs(dy) < 40) {
        if (dx < -60) {
          switchToNextTab();
        } else if (dx > 60) {
          switchToPrevTab();
        }
      }
    };

    window.addEventListener("touchstart", onGlobalTouchStart, { passive: true });
    window.addEventListener("touchend", onGlobalTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onGlobalTouchStart);
      window.removeEventListener("touchend", onGlobalTouchEnd);
    };
  }, [switchToNextTab, switchToPrevTab]);

  return (
    <>
      {/* ── Android Floating Tab Switcher HUD Toast ── */}
      {activeTabToast && (
        <div className="lg:hidden fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/95 text-white px-4 py-2 rounded-full shadow-2xl border border-white/20 backdrop-blur-md flex items-center gap-2.5 animate-in slide-in-from-top-3 fade-in duration-200 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black tracking-wide truncate max-w-[200px]">{activeTabToast}</span>
          <span className="text-[10px] text-slate-400 font-bold bg-white/10 px-2 py-0.5 rounded-full">
            Tab {activeIndex + 1}/{tabs.length}
          </span>
        </div>
      )}

      {/* ── Android Gesture Interactive Pill Bar ── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[70] h-6 flex items-center justify-center cursor-pointer select-none touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsSwitcherOpen(true)}
        title="Swipe Left/Right to Switch Tabs • Swipe Up or Tap for Multi-Tab Switcher"
      >
        {/* Floating preview badge when dragging */}
        {isDragging && Math.abs(touchOffset.x) > 15 && (
          <div
            className="absolute bottom-7 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-xl border border-white/20 backdrop-blur-md flex items-center gap-2 animate-in zoom-in-95 duration-100"
            style={{ transform: `translateX(${touchOffset.x * 0.4}px)` }}
          >
            {touchOffset.x < 0 ? (
              <>
                <span>Switch to</span>
                <span className="text-emerald-400">{nextTab?.title || "Next Tab"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Switch to</span>
                <span className="text-emerald-400">{prevTab?.title || "Prev Tab"}</span>
              </>
            )}
          </div>
        )}

        {/* The Native Android Pill */}
        <div
          className={`h-1.5 rounded-full transition-all duration-150 ${
            isDragging
              ? "w-36 bg-[#C04A22] shadow-lg shadow-[#C04A22]/40 scale-105"
              : "w-28 bg-slate-400/80 hover:bg-slate-500 shadow-xs"
          }`}
          style={{
            transform: isDragging
              ? `translateX(${Math.max(-40, Math.min(40, touchOffset.x * 0.3))}px) translateY(${Math.min(0, touchOffset.y * 0.2)}px)`
              : "none",
          }}
        />
      </div>
    </>
  );
}
