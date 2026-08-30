import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Search, MapPin, Navigation, Bookmark, BookmarkCheck,
  Landmark, ExternalLink, Sparkles, Filter, ChevronRight,
  ChevronLeft, ChevronUp, ChevronDown, Plus, Minus,
  ArrowLeft, ArrowRight, Car, Bike, Footprints,
  ShieldCheck, Loader2, X, Clock, Calendar, Heart, Phone,
  FileText, CheckCircle2, AlertTriangle, Download, Mail,
  Globe, CreditCard, Building2, HelpCircle, Share2, Printer,
  BookOpen, FileCheck, Award, Plane, Users, Check
} from "lucide-react";
import {
  ConsularMission,
  ConsularService,
  ConsularCamp,
  BD_DIPLOMATIC_MISSIONS,
  CONSULAR_SERVICES_DATA,
  CONSULAR_OUTREACH_CAMPS,
  matchConsularQuery
} from "../data/embassyData";

// Icon mapping helper
const SERVICE_ICONS: Record<string, any> = {
  BookOpen: BookOpen,
  FileCheck: FileCheck,
  Award: Award,
  ShieldCheck: ShieldCheck,
  Globe: Globe,
  CreditCard: CreditCard,
  FileText: FileText,
  Landmark: Landmark,
  Plane: Plane,
  Heart: Heart,
  Calendar: Calendar
};

// ─── BariKoi API Key & Loader ───────────────────────────────────────────────
const BARIKOI_API_KEY =
  import.meta.env.VITE_BARIKOI_API_KEY ||
  "bkoi_e25928917c9e7b36a3286d75f446427fa3433bf87361b2fd8c8d6c942300a38f";

function loadBkoiGL(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).bkoigl) {
      resolve((window as any).bkoigl);
      return;
    }
    if (!document.getElementById("maplibre-gl-css")) {
      const css = document.createElement("link");
      css.id = "maplibre-gl-css";
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
      document.head.appendChild(css);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/bkoi-gl@latest/dist/iife/bkoi-gl.js";
    script.onload = () => resolve((window as any).bkoigl);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Real road route calculation using OSRM
async function fetchRealRoadRoute(startLat: number, startLng: number, endLat: number, endLng: number, mode: "car" | "bike" | "walk" = "car") {
  const profile = mode === "walk" ? "foot" : mode === "bike" ? "bike" : "driving";
  try {
    const url = `https://router.project-osrm.org/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates;
        const distanceKm = route.distance / 1000;
        const durationMin = Math.round(route.duration / 60);
        return {
          coordinates,
          distanceText: distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`,
          durationText: `${Math.max(1, durationMin)} min`,
          distanceKm,
          durationMin
        };
      }
    }
  } catch (err) {
    console.warn("Road routing fetch fallback:", err);
  }

  return {
    coordinates: [[startLng, startLat], [endLng, endLat]] as [number, number][],
    distanceText: "Direct",
    durationText: "Calculating...",
    distanceKm: 1.0,
    durationMin: 5
  };
}

// ─── Interactive Consular Mission Map Component (Home/Housing Format) ───────
function BariKoiMissionMap({
  userCoords,
  missions,
  selectedMission,
  onSelectMission,
  directionMission,
  onClearDirection,
  onShowDirection,
  isScrolled
}: {
  userCoords: [number, number];
  missions: ConsularMission[];
  selectedMission: ConsularMission | null;
  onSelectMission: (mission: ConsularMission | null) => void;
  directionMission: ConsularMission | null;
  onClearDirection: () => void;
  onShowDirection: (mission: ConsularMission) => void;
  isScrolled?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const LRef = useRef<any>(null);

  const [markerClickedMission, setMarkerClickedMission] = useState<ConsularMission | null>(null);
  const [travelMode, setTravelMode] = useState<"car" | "bike" | "walk">("car");
  const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);
  const [isNavCardMinimized, setIsNavCardMinimized] = useState(false);

  const handleMarkerClick = useCallback((mission: ConsularMission) => {
    setMarkerClickedMission(mission);
    onSelectMission(mission);
  }, [onSelectMission]);

  useEffect(() => {
    const handleScroll = () => {
      setMarkerClickedMission(null);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isScrolled) setMarkerClickedMission(null);
  }, [isScrolled]);

  useEffect(() => {
    if (directionMission) setMarkerClickedMission(null);
  }, [directionMission]);

  // HTML for Mission Pins
  const createMissionMarkerHtml = (mission: ConsularMission, isSelected: boolean) => {
    const bg = isSelected ? "#064E3B" : "#047857";
    const size = isSelected ? 40 : 34;
    return `
      <div style="position:relative;display:inline-flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform 0.2s ease;">
        ${isSelected ? '<div style="position:absolute;top:-4px;left:-4px;width:' + (size + 8) + 'px;height:' + (size + 8) + 'px;border-radius:50%;background:rgba(4,120,87,0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>' : ''}
        <div style="background:${bg};color:white;width:${size}px;height:${size}px;border-radius:50%;border:${isSelected ? '3px' : '2px'} solid #FCD34D;box-shadow:${isSelected ? '0 8px 20px rgba(4,120,87,0.5)' : '0 3px 10px rgba(0,0,0,0.25)'};display:flex;align-items:center;justify-content:center;transform:${isSelected ? 'scale(1.1)' : 'scale(1)'};">
          <span style="font-size:${isSelected ? '18px' : '15px'};line-height:1;">🏛️</span>
        </div>
      </div>
    `;
  };

  // Sync Markers
  const syncMapMarkers = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = LRef.current;
    const bkoigl = (window as any).bkoigl;

    markersRef.current.forEach(m => {
      if (m.remove) m.remove();
    });
    markersRef.current = [];

    missions.forEach(mission => {
      const isSelected = selectedMission?.id === mission.id;
      const html = createMissionMarkerHtml(mission, isSelected);

      if (L && map.addLayer) {
        const icon = L.divIcon({
          className: "bkoi-mission-pin",
          html,
          iconSize: isSelected ? [40, 46] : [34, 40],
          iconAnchor: isSelected ? [20, 46] : [17, 40]
        });

        const marker = L.marker([mission.lat, mission.lng], { icon }).addTo(map);
        marker.on("click", (e: any) => {
          if (e?.originalEvent) e.originalEvent.stopPropagation();
          handleMarkerClick(mission);
        });
        markersRef.current.push(marker);
      } else if (bkoigl || map.project) {
        const el = document.createElement("div");
        el.className = "bkoi-mission-pin";
        el.innerHTML = html;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          handleMarkerClick(mission);
        });

        const MarkerClass = bkoigl?.Marker || (window as any).maplibregl?.Marker;
        if (MarkerClass) {
          const marker = new MarkerClass({ element: el })
            .setLngLat([mission.lng, mission.lat])
            .addTo(map);
          markersRef.current.push(marker);
        }
      }
    });
  }, [missions, selectedMission, handleMarkerClick]);

  // Init Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let isSubscribed = true;

    loadBkoiGL()
      .then(bkoigl => {
        if (!isSubscribed || !containerRef.current || mapRef.current) return;
        const key = BARIKOI_API_KEY;
        if (bkoigl) {
          bkoigl.accessToken = key;
          bkoigl.apiKey = key;
        }

        const map = new bkoigl.Map({
          container: containerRef.current,
          center: [-88.5, 36.5], // USA Center
          zoom: 3.5,
          accessToken: key,
          apiKey: key,
          style: `https://map.barikoi.com/styles/osm_barikoi_v1/style.json?key=${key}`
        });

        map.on("load", () => {
          mapRef.current = map;
          syncMapMarkers();
        });

        map.on("click", () => {
          setMarkerClickedMission(null);
          onSelectMission(null);
        });
      })
      .catch(() => {
        import("leaflet").then(L => {
          if (!isSubscribed || !containerRef.current || mapRef.current) return;
          delete (L.Icon.Default.prototype as any)._getIconUrl;

          const map = L.map(containerRef.current, {
            center: [36.5, -88.5],
            zoom: 3.5,
            zoomControl: false
          });

          L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
            attribution: '&copy; <a href="https://barikoi.com">BariKoi</a>',
            maxZoom: 19
          }).addTo(map);

          map.on("click", () => {
            setMarkerClickedMission(null);
            onSelectMission(null);
          });

          LRef.current = L;
          mapRef.current = map;
          syncMapMarkers();
        });
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  useEffect(() => {
    syncMapMarkers();
  }, [missions, selectedMission, syncMapMarkers]);

  // Route drawing when direction active
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = LRef.current;

    if (directionMission && userCoords) {
      const [userLat, userLng] = userCoords;
      const missionLat = directionMission.lat;
      const missionLng = directionMission.lng;
      let isCancelled = false;

      fetchRealRoadRoute(userLat, userLng, missionLat, missionLng, travelMode).then(routeData => {
        if (isCancelled || !mapRef.current) return;

        setRouteInfo({
          distanceText: routeData.distanceText,
          durationText: routeData.durationText
        });

        const coords = routeData.coordinates;

        if (L && map.addLayer) {
          const latLngs = coords.map(([lng, lat]) => [lat, lng]);
          const poly = L.polyline(latLngs, {
            color: "#047857",
            weight: 5,
            opacity: 0.9,
            lineJoin: "round",
            lineCap: "round"
          }).addTo(map);

          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        } else if (map.getSource && map.addLayer) {
          const geojson: any = {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: coords
                }
              }
            ]
          };

          if (map.getSource("mission-route")) {
            map.getSource("mission-route").setData(geojson);
          } else {
            map.addSource("mission-route", { type: "geojson", data: geojson });
            map.addLayer({
              id: "mission-route-line",
              type: "line",
              source: "mission-route",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: { "line-color": "#047857", "line-width": 5, "line-opacity": 0.92 }
            });
          }

          let minLng = coords[0][0], maxLng = coords[0][0];
          let minLat = coords[0][1], maxLat = coords[0][1];
          coords.forEach(([cLng, cLat]) => {
            if (cLng < minLng) minLng = cLng;
            if (cLng > maxLng) maxLng = cLng;
            if (cLat < minLat) minLat = cLat;
            if (cLat > maxLat) maxLat = cLat;
          });

          if (map.fitBounds) {
            map.fitBounds(
              [[minLng, minLat], [maxLng, maxLat]],
              { padding: 40, maxZoom: 15, duration: 800 }
            );
          }
        }
      });

      return () => {
        isCancelled = true;
      };
    } else {
      setRouteInfo(null);
    }
  }, [directionMission, userCoords, travelMode]);

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden transition-all duration-300">
      {/* ── MAP CONTAINER (Home Map Compact Height: h-[230px] sm:h-[250px]) ── */}
      <div
        className={`relative w-full transition-[height] duration-300 ease-in-out ${
          directionMission
            ? isNavCardMinimized
              ? "h-[230px] sm:h-[250px]"
              : "h-[200px] sm:h-[230px]"
            : isScrolled
              ? "h-[190px] sm:h-[210px]"
              : "h-[230px] sm:h-[250px]"
        }`}
      >
        <div ref={containerRef} className="w-full h-full" />

        {/* ── Mission Card Overlay on Pin Click ── */}
        {markerClickedMission && !directionMission && !isScrolled && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:left-4 sm:bottom-4 z-30 w-auto sm:w-[340px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in slide-in-from-bottom-3 duration-250 pointer-events-auto">
            <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-slate-900">
              <img
                src={markerClickedMission.image}
                alt={markerClickedMission.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <button
                  onClick={() => setMarkerClickedMission(null)}
                  className="w-6.5 h-6.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 flex items-center justify-center shadow transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold shadow-xs">
                {markerClickedMission.type}
              </div>

              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{markerClickedMission.city}, {markerClickedMission.state}</span>
              </div>
            </div>

            <div className="p-3 sm:p-3.5 space-y-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-1">
                  {markerClickedMission.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                  {markerClickedMission.address}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-1">
                  <Clock className="w-3 h-3" />
                  <span className="truncate">{markerClickedMission.hours}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMarkerClickedMission(null);
                    onShowDirection(markerClickedMission);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Direction</span>
                </button>
                <a
                  href={`tel:${markerClickedMission.emergencyHotline}`}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  title="24/7 Citizen Emergency Hotline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Emergency</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition cursor-pointer hover:text-emerald-700"
            title="Zoom In"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition cursor-pointer hover:text-emerald-700"
            title="Zoom Out"
          >
            <Minus className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* ── ROUTE NAVIGATION CARD ── */}
      {directionMission && (
        <div className="w-full bg-[#FAFAFA] border-t border-slate-200/90 px-3 py-3 sm:px-4 sm:py-3.5 transition-all duration-300">
          {isNavCardMinimized ? (
            <div
              onClick={() => setIsNavCardMinimized(false)}
              className="w-full bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-slate-200/90 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500/40 transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {directionMission.name}
                  </div>
                  <div className="text-xs text-emerald-700 font-bold">
                    {routeInfo?.distanceText ? `(${routeInfo.distanceText})` : ""}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNavCardMinimized(false);
                  }}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearDirection();
                  }}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full bg-white rounded-3xl p-3.5 sm:p-4 shadow-xs border border-slate-200/90 animate-in slide-in-from-bottom-2 duration-250">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-2.5" />

              <div className="flex items-center justify-between gap-2.5 mb-3">
                <button
                  onClick={onClearDirection}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 min-w-0 px-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
                    <span className="truncate">Your Location</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 truncate mt-0.5">
                    <Landmark className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                    <span className="truncate">{directionMission.name}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsNavCardMinimized(true)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer flex-shrink-0"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Travel Mode Switcher */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setTravelMode("car")}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    travelMode === "car"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs"
                      : "bg-slate-100 text-slate-600 border border-transparent"
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Car</span>
                </button>
                <button
                  onClick={() => setTravelMode("bike")}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    travelMode === "bike"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs"
                      : "bg-slate-100 text-slate-600 border border-transparent"
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Bike</span>
                </button>
                <button
                  onClick={() => setTravelMode("walk")}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    travelMode === "walk"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs"
                      : "bg-slate-100 text-slate-600 border border-transparent"
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Walking</span>
                </button>
              </div>

              {/* 3 Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-slate-50/90 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {routeInfo?.durationText || "Calc..."}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">Time</div>
                </div>

                <div className="bg-slate-50/90 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {routeInfo?.distanceText || "..."}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">Distance</div>
                </div>

                <div className="bg-slate-50/90 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate max-w-full px-1">
                    {directionMission.city}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">Mission</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Modal Details Component for Consular Services (Clean, Less-Noise & Simple) ──
function ConsularServiceModal({
  service,
  onClose
}: {
  service: ConsularService;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Clean Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
              {service.shortName}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
              {service.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* 3 Key Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 rounded-2xl p-2.5 sm:p-3 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Fee</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                {service.feeRegular.split("|")[0].trim()}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-2.5 sm:p-3 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Processing</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                {service.processingTimeRegular}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-2.5 sm:p-3 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Submission</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                {service.submissionMode.includes("In-Person (Biometrics)") ? "In-Person" : "Mail / In-Person"}
              </div>
            </div>
          </div>

          {/* Essential Required Documents */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">Required Documents</div>
            <div className="space-y-1.5">
              {service.requiredDocuments.slice(0, 4).map((doc, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0 mt-1.5" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Single Prominent Govt Portal Button */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60">
          <a
            href={service.onlinePortalUrl || "https://bdembassyusa.org"}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.99]"
          >
            <span>Go to Official Govt Portal</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── MASTER EMBASSY & CONSULAR SERVICES PAGE ────────────────────────────────
export function Embassy() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMission, setSelectedMission] = useState<ConsularMission | null>(null);
  const [directionMission, setDirectionMission] = useState<ConsularMission | null>(null);
  const [activeServiceModal, setActiveServiceModal] = useState<ConsularService | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [savedServiceIds, setSavedServiceIds] = useState<string[]>([]);

  // Default DC coordinates for Embassy
  const userCoords: [number, number] = [38.9395, -77.0658];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSave = (id: string) => {
    setSavedServiceIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Filtered Consular Services
  const filteredServices = useMemo(() => {
    return CONSULAR_SERVICES_DATA.filter(service => {
      if (searchQuery.trim() && !matchConsularQuery(service, searchQuery)) {
        return false;
      }
      return true;
    });
  }, [searchQuery]);

  const handleShowDirection = (mission: ConsularMission) => {
    setDirectionMission(mission);
    setSelectedMission(mission);
    const mapEl = document.getElementById("embassy-map-section");
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#FDFBF9] pb-16">
        {/* ── TOP STICKY BAR: Clean Search Only (Filters Removed) ───────────── */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex-shrink-0"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Rounded Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="search passport, visa, NVR, power of attorney, NID, camps, fees..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 shadow-2xs transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── BARIKOI LIVE MAP (EXPANDED / COMPACT HOME MAP SIZE: h-[230px] sm:h-[250px]) ── */}
        <div id="embassy-map-section" className={`w-full max-w-7xl mx-auto px-1 sm:px-2 pt-1 sm:pt-2 transition-all duration-300 ${
          isScrolled ? "sticky top-[60px] z-10" : ""
        }`}>
          <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white">
            <BariKoiMissionMap
              userCoords={userCoords}
              missions={BD_DIPLOMATIC_MISSIONS}
              selectedMission={selectedMission}
              onSelectMission={m => setSelectedMission(m)}
              directionMission={directionMission}
              onClearDirection={() => {
                setDirectionMission(null);
                setSelectedMission(null);
              }}
              onShowDirection={handleShowDirection}
              isScrolled={isScrolled}
            />
          </div>
        </div>

        {/* ── MAIN DIRECTORY CONTENT: Clean Minimalist List of Consular Services ── */}
        <div className="w-full max-w-7xl mx-auto px-1 sm:px-2 pt-1.5 sm:pt-2">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
            {filteredServices.map(service => (
              <button
                key={service.id}
                onClick={() => setActiveServiceModal(service)}
                className="group w-full flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 hover:bg-slate-50 transition-all text-left cursor-pointer active:scale-[0.99]"
                title={service.title}
              >
                <span className="text-sm sm:text-base font-medium text-slate-900 group-hover:text-emerald-900 transition-colors">
                  {service.shortName}
                </span>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Consular Service Detail & Checklist Modal ── */}
        {activeServiceModal && (
          <ConsularServiceModal
            service={activeServiceModal}
            onClose={() => setActiveServiceModal(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}
