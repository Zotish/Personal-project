import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Search, ArrowLeft, ArrowRight, ArrowLeftRight, Navigation,
  Clock, Flame, CheckCircle2, Star, Wifi, Zap, Luggage,
  ExternalLink, Bookmark, X, ChevronDown, Ticket, Calendar
} from "lucide-react";
import {
  USA_TRANSIT_STATIONS,
  MASTER_TRANSIT_RIDES,
  TransitStation,
  TransitRide,
  TransitCategory,
  findNearestStation,
  queryTransitRides,
} from "../data/transportationData";
import { TransportationInteractiveMap } from "../components/transport/TransportationInteractiveMap";

export function TransportationHub() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── 1. Active Filter: "all" | "bus" | "train" | "subway" ────────────────────
  const urlType = searchParams.get("type") as TransitCategory | "all";
  const [activeFilter, setActiveFilter] = useState<"all" | TransitCategory>(
    urlType && ["all", "bus", "train", "subway"].includes(urlType) ? urlType : "all"
  );

  const [searchQuery, setSearchQuery] = useState("");

  // Sync category with URL
  const handleFilterChange = (filterId: "all" | TransitCategory) => {
    setActiveFilter(filterId);
    if (filterId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ type: filterId });
    }
  };

  useEffect(() => {
    const t = searchParams.get("type") as TransitCategory | "all";
    if (t && ["all", "bus", "train", "subway"].includes(t) && t !== activeFilter) {
      setActiveFilter(t);
    }
  }, [searchParams]);

  // ── 2. Current Mode Stations (Bus, Train, or Subway) ───────────────────────
  const currentCategory: TransitCategory = activeFilter === "all" ? "bus" : activeFilter;

  const modeStations = useMemo(() => {
    return USA_TRANSIT_STATIONS.filter(
      s => activeFilter === "all" || s.category === activeFilter || s.category === "all"
    );
  }, [activeFilter]);

  // ── 3. From & Destination Stations (Selective) ────────────────────────────
  const [fromStation, setFromStation] = useState<TransitStation | null>(() => {
    return USA_TRANSIT_STATIONS[0];
  });

  const [toStation, setToStation] = useState<TransitStation | null>(() => {
    return USA_TRANSIT_STATIONS[1] || null;
  });

  // Keep station selection valid when category changes
  useEffect(() => {
    if (activeFilter !== "all") {
      const catStations = USA_TRANSIT_STATIONS.filter(s => s.category === activeFilter);
      if (catStations.length >= 2) {
        setFromStation(catStations[0]);
        setToStation(catStations[1]);
      } else if (catStations.length === 1) {
        setFromStation(catStations[0]);
        setToStation(null);
      }
    }
  }, [activeFilter]);

  // ── 4. Departure Date & Time Slots ──────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<string>("today"); // "today" | "tomorrow" | "YYYY-MM-DD"
  const [timeSlot, setTimeSlot] = useState<"all" | "morning" | "afternoon" | "evening">("all");
  const [customTime, setCustomTime] = useState<string>(""); // e.g. "08:30"
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  // Helper to format date display (e.g. "Today", "Tomorrow", "Oct 15")
  const formatDateDisplay = (dateKey: string): string => {
    if (!dateKey || dateKey === "today") return "Today";
    if (dateKey === "tomorrow") return "Tomorrow";
    try {
      const parts = dateKey.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
      }
    } catch (_) {}
    return dateKey;
  };

  const getTodayISO = (): string => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

  const getTomorrowISO = (): string => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  // Format 24h string "08:30" to "08:30 AM"
  const formatCustomTimeDisplay = (time24: string): string => {
    if (!time24) return "Times";
    const [hStr, mStr] = time24.split(":");
    let h = parseInt(hStr, 10);
    const m = mStr || "00";
    const ampm = h >= 12 ? "PM" : "AM";
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
  };

  // Label shown on the trigger pill
  const getDepartureFilterLabel = (): string => {
    const hasCustomDate = selectedDate !== "today";
    const dateStr = formatDateDisplay(selectedDate);
    const timeStr = customTime
      ? formatCustomTimeDisplay(customTime)
      : timeSlot !== "all"
      ? timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)
      : "";

    if (!hasCustomDate && !timeStr) return "Times";
    if (!hasCustomDate && timeStr) return `After ${timeStr}`;
    if (hasCustomDate && !timeStr) return `${dateStr} • Times`;
    return `${dateStr} • ${timeStr}`;
  };

  const isDepartureFilterActive = selectedDate !== "today" || customTime !== "" || timeSlot !== "all";

  // ── 5. Sorting ("low to high price" circled in sketch) ──────────────────────
  const [sortBy, setSortBy] = useState<"price_low_high" | "duration_fast" | "seats_left">("price_low_high");

  // ── 6. Geolocation / Detect Nearest Station ("detect request by") ───────────
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [detectedStationMsg, setDetectedStationMsg] = useState<string | null>(null);

  const handleDetectNearestStation = useCallback(() => {
    setIsLocating(true);
    setDetectedStationMsg(null);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords([lat, lng]);

          const nearest = findNearestStation(lat, lng, currentCategory);
          if (nearest && nearest.station) {
            setFromStation(nearest.station);
            setDetectedStationMsg(`📍 Nearest: ${nearest.station.name} (${nearest.distanceMiles} mi)`);
          }
          setIsLocating(false);
        },
        () => {
          const defaultLoc: [number, number] = [40.7505, -73.9934];
          setUserCoords(defaultLoc);
          const nearest = findNearestStation(defaultLoc[0], defaultLoc[1], currentCategory);
          if (nearest && nearest.station) {
            setFromStation(nearest.station);
            setDetectedStationMsg(`📍 Set: ${nearest.station.name}`);
          }
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  }, [currentCategory]);

  // Auto-detect nearest station in background on load
  useEffect(() => {
    handleDetectNearestStation();
  }, [handleDetectNearestStation]);

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // ── 7. Query Rides (Uber format) ───────────────────────────────────────────
  const rides = useMemo(() => {
    return queryTransitRides({
      category: activeFilter === "all" ? "bus" : activeFilter,
      fromStationId: fromStation?.id,
      toStationId: toStation?.id,
      sortBy,
      searchQuery,
      timeSlot,
      customTime,
    });
  }, [activeFilter, fromStation, toStation, sortBy, searchQuery, timeSlot, customTime]);

  const activeRouteCoords = useMemo(() => {
    if (rides.length > 0 && rides[0].routeCoords) {
      return rides[0].routeCoords;
    }
    if (fromStation && toStation) {
      return [fromStation.coords, toStation.coords];
    }
    return undefined;
  }, [rides, fromStation, toStation]);

  // ── 8. Booking Modal ("Book -> another page / External") ────────────────────
  const [selectedRideForBooking, setSelectedRideForBooking] = useState<TransitRide | null>(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // ── 9. Dynamic Map Sizing & Uber-Style Bottom Sheet Drag Mechanism (Matches Jobs.tsx) ──
  const [sheetMode, setSheetMode] = useState<"expanded" | "mid" | "full">("expanded");
  const [dragMapHeight, setDragMapHeight] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const contentListRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startDragYRef = useRef<number>(0);
  const startMapHeightRef = useRef<number>(0);
  const listTouchStartYRef = useRef<number | null>(null);
  const lastScrollYRef = useRef<number>(0);

  // Uber-style 1:1 real-time drag tracking for mouse & touch
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const mapEl = document.getElementById("transit-map-section")?.querySelector(".relative.w-full");
    const isMobile = window.innerWidth < 640;
    const minH = 0;
    const midH = isMobile ? 240 : 300;
    const maxH = isMobile ? 520 : 580;
    const currentH = mapEl ? mapEl.getBoundingClientRect().height : (sheetMode === "full" ? 0 : isScrolled ? midH : maxH);

    startDragYRef.current = e.clientY;
    startMapHeightRef.current = currentH;
    isDraggingRef.current = true;
    setDragMapHeight(currentH);

    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = moveEvent.clientY - startDragYRef.current;
      const nextH = Math.min(maxH, Math.max(minH, startMapHeightRef.current + deltaY));
      setDragMapHeight(nextH);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      const totalDeltaY = upEvent.clientY - startDragYRef.current;

      // Tap toggle: Clicking or tapping handle pill toggles between expanded and mid!
      if (Math.abs(totalDeltaY) < 8) {
        if (sheetMode === "expanded") {
          setSheetMode("mid");
          setIsScrolled(true);
        } else {
          setSheetMode("expanded");
          setIsScrolled(false);
          if (contentListRef.current) contentListRef.current.scrollTop = 0;
        }
        setDragMapHeight(null);
        return;
      }

      const finalH = Math.min(maxH, Math.max(minH, startMapHeightRef.current + totalDeltaY));
      const thresholdTopMid = midH / 2;
      const thresholdMidBottom = (midH + maxH) / 2;

      // Fast flick gestures
      if (totalDeltaY < -60) {
        if (startMapHeightRef.current <= midH + 40) {
          setSheetMode("full");
          setIsScrolled(true);
        } else {
          setSheetMode("mid");
          setIsScrolled(true);
        }
      } else if (totalDeltaY > 60) {
        if (startMapHeightRef.current < midH - 40) {
          setSheetMode("mid");
          setIsScrolled(true);
        } else {
          setSheetMode("expanded");
          setIsScrolled(false);
          if (contentListRef.current) contentListRef.current.scrollTop = 0;
        }
      } else {
        if (finalH < thresholdTopMid) {
          setSheetMode("full");
          setIsScrolled(true);
        } else if (finalH < thresholdMidBottom) {
          setSheetMode("mid");
          setIsScrolled(true);
        } else {
          setSheetMode("expanded");
          setIsScrolled(false);
          if (contentListRef.current) contentListRef.current.scrollTop = 0;
        }
      }

      setDragMapHeight(null);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { once: true });
  };

  // Card list touch pull-down gesture to expand map when at top of list & swipe up to collapse map
  const handleListTouchStart = (e: React.TouchEvent) => {
    listTouchStartYRef.current = e.touches[0].clientY;
  };

  const handleListTouchMove = (e: React.TouchEvent) => {
    if (listTouchStartYRef.current === null || !contentListRef.current) return;
    const deltaY = e.touches[0].clientY - listTouchStartYRef.current;

    // Swiping UP while map is expanded -> smoothly collapse map to mid
    if (sheetMode === "expanded" && deltaY < -15) {
      setSheetMode("mid");
      setIsScrolled(true);
      listTouchStartYRef.current = null;
      return;
    }

    // Pulling DOWN when at top of list -> smoothly expand map back
    if (contentListRef.current.scrollTop <= 2 && deltaY > 35 && (isScrolled || sheetMode !== "expanded")) {
      setIsScrolled(false);
      setSheetMode("expanded");
      listTouchStartYRef.current = null;
    }
  };

  const handleListTouchEnd = () => {
    listTouchStartYRef.current = null;
  };

  // Mouse wheel or trackpad scroll gesture
  const handleListWheel = (e: React.WheelEvent) => {
    if (!contentListRef.current) return;
    // Wheel down while map is expanded -> smoothly collapse to mid
    if (e.deltaY > 10 && sheetMode === "expanded") {
      setSheetMode("mid");
      setIsScrolled(true);
    }
    // Wheel up while at top of list -> expand map
    else if (contentListRef.current.scrollTop <= 2 && e.deltaY < -10 && (isScrolled || sheetMode !== "expanded")) {
      setIsScrolled(false);
      setSheetMode("expanded");
    }
  };

  // Content scroll detection
  const handleListScroll = () => {
    if (!contentListRef.current) return;
    const currentY = contentListRef.current.scrollTop;

    if (currentY <= 15) {
      window.dispatchEvent(new CustomEvent("nav-visibility", { detail: { visible: true } }));
      lastScrollYRef.current = currentY;
      return;
    }

    const diff = currentY - lastScrollYRef.current;

    if (diff > 4) {
      window.dispatchEvent(new CustomEvent("nav-visibility", { detail: { visible: false } }));
      if (sheetMode === "expanded") {
        setSheetMode("mid");
        setIsScrolled(true);
      }
    } else if (diff < -4) {
      window.dispatchEvent(new CustomEvent("nav-visibility", { detail: { visible: true } }));
    }

    lastScrollYRef.current = currentY;
  };

  const handleSaveTicket = (ride: TransitRide) => {
    try {
      const stored = localStorage.getItem("ps_saved_transit_tickets");
      const list: TransitRide[] = stored ? JSON.parse(stored) : [];
      if (!list.some(t => t.id === ride.id)) {
        list.unshift(ride);
        localStorage.setItem("ps_saved_transit_tickets", JSON.stringify(list));
      }
    } catch (_) {}
    setSavedNotice("✅ Boarding pass saved to My Passes!");
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <AppLayout noPad={true} hideNav={false}>
      <div className="w-full h-[100dvh] lg:h-[100vh] flex flex-col overflow-hidden bg-[#FAFAFA]">

        {/* ════════════════════════════════════════════════════════════════════
            1. STICKY TOP HEADER (Identical structure to Jobs.tsx)
            Back button + Search input + Filter pills
            ════════════════════════════════════════════════════════════════════ */}
        <div className="flex-shrink-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 pt-2 pb-2 shadow-2xs">
          <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition flex-shrink-0 cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="search bus, train, stations, destinations..."
                className="w-full pl-7.5 pr-7 py-1 sm:py-1.5 bg-slate-50 hover:bg-white focus:bg-white rounded-md sm:rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C04A22]/20 focus:border-[#C04A22] shadow-2xs transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills directly underneath search (All Transit, Bus, Train, Subway) */}
          <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pt-1.5 pb-0.5">
            {[
              { id: "all", label: "All Transit" },
              { id: "bus", label: "Bus" },
              { id: "train", label: "Train" },
              { id: "subway", label: "Subway" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => handleFilterChange(f.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? "bg-[#C04A22] text-white shadow-xs font-semibold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            2. FULL-BLEED LIVE MAP (Dynamic Sizing & Mechanism matching Jobs.tsx)
            ════════════════════════════════════════════════════════════════════ */}
        <div
          id="transit-map-section"
          className={`w-full max-w-4xl mx-auto px-0 flex-shrink-0 z-10 transition-[height] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            sheetMode === "full" && dragMapHeight === null ? "h-0 overflow-hidden" : ""
          }`}
        >
          <div
            style={dragMapHeight !== null && dragMapHeight !== undefined ? { height: `${dragMapHeight}px`, transition: 'none' } : undefined}
            className={`relative w-full ${dragMapHeight !== null && dragMapHeight !== undefined ? '' : 'transition-[height] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]'} ${
              sheetMode === "full"
                ? "h-0 overflow-hidden"
                : isScrolled
                  ? "h-[240px] sm:h-[280px] md:h-[320px]"
                  : "h-[520px] sm:h-[550px] md:h-[580px] lg:h-[620px]"
            }`}
          >
            <div className="w-full h-full rounded-none overflow-hidden border-b border-slate-200 bg-white">
              <TransportationInteractiveMap
                category={activeFilter}
                stations={modeStations}
                fromStation={fromStation}
                toStation={toStation}
                userCoords={userCoords}
                onSelectStationAsFrom={st => setFromStation(st)}
                onSelectStationAsTo={st => setToStation(st)}
                onSelectStation={st => {
                  if (fromStation?.id !== st.id) {
                    if (toStation?.id === st.id && fromStation) {
                      setToStation(fromStation);
                    }
                    setFromStation(st);
                  }
                }}
                routeCoords={activeRouteCoords}
                rides={rides}
                onSelectRide={ride => setSelectedRideForBooking(ride)}
                onExpandBottomSheet={() => setSheetMode("expanded")}
                onRequestLocation={handleDetectNearestStation}
                isLocating={isLocating}
                sheetMode={sheetMode}
                isScrolled={isScrolled}
                dragMapHeight={dragMapHeight}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            3. MAIN CONTENT (BOTTOM SHEET / BELOW THE MAP)
            (Flowchart: "map এর নিচে সেখানে below box ta thakbe")
            ════════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 min-h-0 flex flex-col max-w-4xl w-full mx-auto px-0 relative z-20 bg-[#FAFAFA] rounded-none shadow-[0_-6px_25px_rgba(0,0,0,0.06)] border-t border-slate-200/80 -mt-px">

          {/* Pull Handle Indicator (Uber-style 1:1 real-time drag tracker) */}
          <div className="flex-shrink-0 z-30 bg-[#FAFAFA] rounded-none pt-2 sm:pt-3 pb-2 px-3 sm:px-4">
            <div
              onPointerDown={handlePointerDown}
              className="w-full flex items-center justify-center py-2.5 cursor-grab active:cursor-grabbing select-none group touch-none"
              title="Drag up to view schedules, drag down to expand map"
            >
              <div className="w-12 h-1.5 bg-slate-300 group-hover:bg-slate-400 active:bg-slate-500 rounded-full transition-colors" />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              4. SEARCH & SCHEDULES CONTENT (Scrolls smoothly with map sync)
              ══════════════════════════════════════════════════════════════════ */}
          <div
            ref={contentListRef}
            onScroll={handleListScroll}
            onTouchStart={handleListTouchStart}
            onTouchMove={handleListTouchMove}
            onTouchEnd={handleListTouchEnd}
            onWheel={handleListWheel}
            className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-2 space-y-3 max-w-4xl w-full mx-auto pb-28"
          >
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs">



              {/* From & Desti Station Selectors ("from" and "desti" in sketch) */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 mb-2.5">
                {/* From: [Station to Sta] (selective) */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-0.5">
                    From
                  </label>
                  <div className="relative">
                    <select
                      value={fromStation?.id || ""}
                      onChange={e => {
                        const st = modeStations.find(s => s.id === e.target.value);
                        if (st) setFromStation(st);
                      }}
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer appearance-none pr-6"
                    >
                      {modeStations.map(st => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.code || st.city})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Swap Button (⇄) */}
                <div className="flex justify-center -my-1 sm:my-0">
                  <button
                    type="button"
                    onClick={handleSwapStations}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center transition-transform hover:rotate-180 cursor-pointer"
                    title="Swap stations"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Destination: [Station] (selective) */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#C04A22] mb-0.5">
                    Destination
                  </label>
                  <div className="relative">
                    <select
                      value={toStation?.id || ""}
                      onChange={e => {
                        const st = modeStations.find(s => s.id === e.target.value);
                        if (st) setToStation(st);
                      }}
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer appearance-none pr-6"
                    >
                      {modeStations.map(st => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.code || st.city})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Time & Search Row (Side-by-side) */}
              <div className="flex items-center gap-2 pt-1">
                {/* Custom Time Picker Button */}
                  <div className="relative">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsTimePickerOpen(prev => !prev)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
                          isDepartureFilterActive
                            ? "bg-[#C04A22]/10 text-[#C04A22] border border-[#C04A22]/30 shadow-2xs"
                            : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60"
                        }`}
                        title="Click to customize departure date & time"
                      >
                        <span>{getDepartureFilterLabel()}</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-200 ${
                            isTimePickerOpen ? "rotate-180 text-slate-700" : "text-slate-400"
                          }`}
                        />
                      </button>

                      {/* Quick Clear Button if active */}
                      {isDepartureFilterActive && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate("today");
                            setCustomTime("");
                            setTimeSlot("all");
                          }}
                          className="w-5 h-5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition cursor-pointer"
                          title="Reset to All Times"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Time & Date Customizer Dialog Modal */}
                    {isTimePickerOpen && (
                      <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150"
                        onClick={() => setIsTimePickerOpen(false)}
                      >
                        {/* Modal Card */}
                        <div
                          className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200 w-full max-w-sm space-y-3.5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Modal Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-[#C04A22]" />
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                Departure Date & Time
                              </h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsTimePickerOpen(false)}
                              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs transition cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>

                          {/* 1. Travel Date Selection */}
                          <div className="space-y-1.5 pb-2 border-b border-slate-100">
                            <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                <span>Travel Date:</span>
                              </span>
                              <span className="text-[10px] text-[#C04A22] font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                                {formatDateDisplay(selectedDate)}
                              </span>
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedDate("today")}
                                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition text-center cursor-pointer ${
                                  selectedDate === "today"
                                    ? "bg-[#C04A22] text-white border-[#C04A22] shadow-xs"
                                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                              >
                                Today
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedDate("tomorrow")}
                                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition text-center cursor-pointer ${
                                  selectedDate === "tomorrow"
                                    ? "bg-[#C04A22] text-white border-[#C04A22] shadow-xs"
                                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                              >
                                Tomorrow
                              </button>
                              <div className="relative">
                                <input
                                  type="date"
                                  value={
                                    selectedDate === "today"
                                      ? getTodayISO()
                                      : selectedDate === "tomorrow"
                                      ? getTomorrowISO()
                                      : selectedDate
                                  }
                                  onChange={(e) => {
                                    if (e.target.value) setSelectedDate(e.target.value);
                                  }}
                                  className={`w-full py-1.5 px-1.5 rounded-lg text-xs font-semibold border transition text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C04A22]/20 ${
                                    selectedDate !== "today" && selectedDate !== "tomorrow"
                                      ? "bg-[#C04A22] text-white border-[#C04A22] shadow-xs"
                                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                                  }`}
                                  title="Pick calendar date"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 2. Exact Custom Time Picker */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                <span>Set Exact Departure Time:</span>
                              </span>
                              {customTime && (
                                <span className="text-[10px] text-[#C04A22] font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                                  {formatCustomTimeDisplay(customTime)}
                                </span>
                              )}
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={customTime || "08:00"}
                                onChange={(e) => {
                                  setCustomTime(e.target.value);
                                  setTimeSlot("all");
                                }}
                                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C04A22]/20 focus:border-[#C04A22] cursor-pointer"
                              />
                              {customTime && (
                                <button
                                  type="button"
                                  onClick={() => setCustomTime("")}
                                  className="px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 3. Popular Quick Time Chips */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Popular Times:
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { label: "06:00 AM", value: "06:00" },
                                { label: "08:00 AM", value: "08:00" },
                                { label: "10:00 AM", value: "10:00" },
                                { label: "12:00 PM", value: "12:00" },
                                { label: "02:00 PM", value: "14:00" },
                                { label: "04:00 PM", value: "16:00" },
                                { label: "06:00 PM", value: "18:00" },
                                { label: "08:00 PM", value: "20:00" },
                                { label: "10:00 PM", value: "22:00" },
                              ].map((preset) => (
                                <button
                                  key={preset.value}
                                  type="button"
                                  onClick={() => {
                                    setCustomTime(preset.value);
                                    setTimeSlot("all");
                                  }}
                                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition text-center cursor-pointer ${
                                    customTime === preset.value
                                      ? "bg-[#C04A22] text-white border-[#C04A22] shadow-xs"
                                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 4. Time of Day Slots */}
                          <div className="space-y-1.5 pt-1 border-t border-slate-100">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Or By Time of Day:
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { id: "morning", label: "Morning", sub: "5am - 12pm" },
                                { id: "afternoon", label: "Afternoon", sub: "12pm - 6pm" },
                                { id: "evening", label: "Evening", sub: "6pm - 12am" },
                              ].map((slot) => (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={() => {
                                    setTimeSlot(slot.id as any);
                                    setCustomTime("");
                                  }}
                                  className={`py-1.5 px-1 rounded-lg text-xs font-semibold border transition flex flex-col items-center cursor-pointer ${
                                    timeSlot === slot.id && !customTime
                                      ? "bg-[#C04A22] text-white border-[#C04A22] shadow-xs"
                                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                                  }`}
                                >
                                  <span>{slot.label}</span>
                                  <span
                                    className={`text-[9px] ${
                                      timeSlot === slot.id && !customTime ? "text-orange-100" : "text-slate-400"
                                    }`}
                                  >
                                    {slot.sub}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Modal Actions */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDate("today");
                                setCustomTime("");
                                setTimeSlot("all");
                                setIsTimePickerOpen(false);
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            >
                              Reset to All
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsTimePickerOpen(false)}
                              className="px-4 py-1.5 rounded-lg bg-[#C04A22] hover:bg-[#a63d1a] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Search Button directly on the right side of All Times */}
                  <button
                    type="button"
                    onClick={() => {
                      if (sheetMode === "expanded") {
                        setSheetMode("mid");
                        setIsScrolled(true);
                      }
                      const el = document.getElementById("uber-list-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex-1 sm:flex-initial px-4 py-1.5 rounded-full bg-[#C04A22] hover:bg-[#a63d1a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Schedules</span>
                  </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                5. RESULTS SECTION ("List of bus and time")
                ("list ta uber এর app এর list এর মতো formate করো")
                ══════════════════════════════════════════════════════════════════ */}
            <div id="uber-list-section" className="space-y-2 pt-1">

              {/* Uber-style cards */}
              {rides.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
                  <p className="text-xs font-semibold text-slate-700">No scheduled departures for this route right now.</p>
                  <button
                    onClick={() => {
                      setSelectedDate("today");
                      setTimeSlot("all");
                      setCustomTime("");
                      setSortBy("price_low_high");
                    }}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {rides.map(ride => (
                    <div
                      key={ride.id}
                      onClick={() => setSelectedRideForBooking(ride)}
                      className="bg-white rounded-xl sm:rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 border border-slate-200 hover:border-[#C04A22]/50 hover:shadow-xs transition-all cursor-pointer group space-y-1.5"
                    >
                      {/* Row 1: Operator & Seat Badge (Left) | Price (Right) */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {ride.operator}
                          </span>
                          {ride.seatsLeft && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                              ride.seatStatus === "critical"
                                ? "text-red-700 bg-red-50 border border-red-200"
                                : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                            }`}>
                              {ride.seatsLeft} seats
                            </span>
                          )}
                        </div>

                        <div className="text-sm sm:text-base font-black text-slate-900 shrink-0">
                          ${ride.price.toFixed(2)}
                        </div>
                      </div>

                      {/* Row 2: Departure - Arrival & Duration (Left) | Book Button (Right) */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-slate-600 flex items-center gap-2 font-medium min-w-0">
                          <span className="font-bold text-slate-900 whitespace-nowrap">
                            {ride.departureTime} – {ride.arrivalTime}
                          </span>
                          <span className="text-slate-400 text-[11px] whitespace-nowrap">
                            {ride.duration}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRideForBooking(ride);
                          }}
                          className="px-4 py-1 rounded-lg bg-slate-900 group-hover:bg-[#C04A22] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 active:scale-95"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            6. BOOKING CHECKOUT MODAL ("Book -> another page / External")
            ════════════════════════════════════════════════════════════════════ */}
        {selectedRideForBooking && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
            <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedRideForBooking.operator} • {selectedRideForBooking.vehicleNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedRideForBooking.fromStationName.split(" ")[0]} ➔ {selectedRideForBooking.toStationName.split(" ")[0]}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRideForBooking(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Digital Boarding Pass Preview with QR */}
              <div className="my-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-900 mb-1">
                  <span>DIGITAL BOARDING PASS PREVIEW</span>
                  <span className="font-mono">REF: PS-{selectedRideForBooking.id.slice(-4).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white p-1 rounded border border-amber-300 shrink-0 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-900 rounded p-1 flex flex-wrap gap-0.5">
                      <div className="w-2 h-2 bg-white" />
                      <div className="w-1.5 h-1.5 bg-white" />
                      <div className="w-1.5 h-1.5 bg-white" />
                      <div className="w-2 h-2 bg-white" />
                    </div>
                  </div>
                  <div className="text-[11px] text-amber-900 space-y-0.5">
                    <p><strong>Departure:</strong> {formatDateDisplay(selectedDate)}, {selectedRideForBooking.departureTime}</p>
                    <p><strong>Accepted ID:</strong> State ID, Passport, Driver's License</p>
                    <p className="text-[10px] text-amber-700">Official voucher issued by {selectedRideForBooking.officialProviderName}</p>
                  </div>
                </div>
              </div>

              {/* Fare Total */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100 text-xs mb-3">
                <span className="text-slate-600">Total Fare:</span>
                <span className="text-base font-black text-slate-900">
                  ${selectedRideForBooking.price.toFixed(2)}
                </span>
              </div>

              {/* Action Buttons ("another page / External") */}
              <div className="space-y-2">
                <a
                  href={selectedRideForBooking.externalBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSaveTicket(selectedRideForBooking)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 text-center shadow-sm"
                >
                  <span>Proceed to Official {selectedRideForBooking.operator} Booking</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    handleSaveTicket(selectedRideForBooking);
                    setSelectedRideForBooking(null);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Save to My Passes (Offline View)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Notice Toast */}
        {savedNotice && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-lg">
            {savedNotice}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
