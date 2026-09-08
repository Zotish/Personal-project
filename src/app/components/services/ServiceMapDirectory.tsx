import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { AppLayout } from "../layout/AppLayout";
import { buildMapShareUrl, shareOrCopy } from "../../utils/shareUtils";
import {
  Search, MapPin, Navigation, Bookmark, BookmarkCheck, Share2,
  ExternalLink, Sparkles, Filter, ChevronRight,
  ChevronLeft, ChevronUp, ChevronDown, Plus, Minus,
  ArrowLeft, ArrowRight, Car, Bike, Footprints,
  ShieldCheck, Loader2, X, Clock, Calendar, Star, Heart,
  Phone, Globe, CheckCircle2, UserCheck, Utensils
} from "lucide-react";
import { ServiceListing, formatDistance, getDistanceKm } from "../../data/serviceDirectoryData";
import type { Map as LeafletMapType } from "leaflet";

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

// ─── Real Road Routing API (OSRM Turn-by-Turn) ──────────────────────────────
async function fetchRealRoadRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  mode: "car" | "bike" | "walk" = "car"
): Promise<{
  coordinates: [number, number][];
  distanceText: string;
  durationText: string;
  distanceKm: number;
  durationMin: number;
}> {
  const profile = mode === "walk" ? "foot" : mode === "bike" ? "bike" : "driving";
  try {
    const url = `https://router.project-osrm.org/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates; // [lng, lat]
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

  // Fallback straight line
  const directKm = getDistanceKm(startLat, startLng, endLat, endLng);
  return {
    coordinates: [[startLng, startLat], [endLng, endLat]] as [number, number][],
    distanceText: `${directKm.toFixed(1)} km`,
    durationText: `${Math.max(1, Math.round(directKm * 2.5))} min`,
    distanceKm: directKm,
    durationMin: Math.max(1, Math.round(directKm * 2.5))
  };
}

// ─── BariKoi Reverse Geocode ────────────────────────────────────────────────
async function fetchBariKoiReverseGeocode(lat: number, lng: number) {
  try {
    const url = `https://barikoi.xyz/v2/api/search/reverse/geocode?api_key=${BARIKOI_API_KEY}&longitude=${lng}&latitude=${lat}&district=true&post_code=true&country=true&sub_district=true&union=true&pauroshova=true&location_type=true&division=true&address=true&area=true&bangla=true`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.place) {
      return {
        address: data.place.address || "",
        area: data.place.area || "",
        city: data.place.city || data.place.district || "Queens",
        sub_district: data.place.sub_district || ""
      };
    }
  } catch (err) {
    console.warn("BariKoi reverse geocode error:", err);
  }
  return null;
}

// ─── PROPS FOR UNIVERSAL SERVICE MAP DIRECTORY ──────────────────────────────
export interface ServiceMapDirectoryProps {
  serviceName: string; // e.g. "Halal Food", "Legal Aid"
  serviceIcon: React.ElementType;
  themeColor?: string; // default "#C04A22"
  bannerPlaceholder?: string;
  filterTabs: { id: string; label: string; icon?: React.ElementType }[];
  generateListings: (lat: number, lng: number, area: string, city: string) => ServiceListing[];
  defaultAreaName?: string;
  defaultCityName?: string;
}

// ─── INTERACTIVE MAP COMPONENT (Matching Jobs & FreeFood exactly) ────────────
function InteractiveServiceMap({
  userCoords,
  isLocationGranted,
  items,
  selectedItem,
  onSelectItem,
  directionItem,
  onClearDirection,
  onShowDirection,
  onOpenDetails,
  savedIds,
  onToggleSave,
  isScrolled,
  searchQuery,
  themeColor = "#C04A22"
}: {
  userCoords: [number, number];
  isLocationGranted: boolean;
  items: ServiceListing[];
  selectedItem: ServiceListing | null;
  onSelectItem: (item: ServiceListing) => void;
  directionItem: ServiceListing | null;
  onClearDirection: () => void;
  onShowDirection: (item: ServiceListing) => void;
  onOpenDetails: (item: ServiceListing) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  isScrolled: boolean;
  searchQuery: string;
  themeColor?: string;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [travelMode, setTravelMode] = useState<"car" | "bike" | "walk">("car");
  const [isNavCardMinimized, setIsNavCardMinimized] = useState(false);
  const [markerClickedItem, setMarkerClickedItem] = useState<ServiceListing | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distanceText: string;
    durationText: string;
    distanceKm: number;
  } | null>(null);

  const handleMarkerClick = useCallback((item: ServiceListing) => {
    setMarkerClickedItem(item);
    onSelectItem(item);
  }, [onSelectItem]);

  useEffect(() => {
    const handleScroll = () => setMarkerClickedItem(null);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isScrolled) setMarkerClickedItem(null);
  }, [isScrolled]);

  useEffect(() => {
    if (directionItem) setMarkerClickedItem(null);
  }, [directionItem]);

  useEffect(() => {
    if (directionItem) setIsNavCardMinimized(false);
  }, [directionItem]);

  useEffect(() => {
    const handleResize = () => {
      const map = mapInstanceRef.current;
      if (map?.resize) map.resize();
    };
    const t1 = setTimeout(handleResize, 60);
    const t2 = setTimeout(handleResize, 250);
    const t3 = setTimeout(handleResize, 450);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [directionItem, isNavCardMinimized, isScrolled]);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;
    loadBkoiGL().then((bkoigl: any) => {
      if (!isMounted || !mapContainerRef.current) return;

      try {
        const map = new bkoigl.Map({
          container: mapContainerRef.current,
          center: [userCoords[1], userCoords[0]],
          zoom: 13.5,
          maxZoom: 18,
          minZoom: 4,
          style: "osm-liberty",
          doubleClickZoom: true,
          attributionControl: false
        });

        map.on("load", () => {
          if (!isMounted) return;
          mapInstanceRef.current = map;
          setMapLoaded(true);
        });
      } catch (e) {
        console.warn("Map initialization error:", e);
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_) {}
      }
    };
  }, []);

  // Update User Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    if (userMarkerRef.current) userMarkerRef.current.remove();

    const el = document.createElement("div");
    el.className = "relative flex items-center justify-center";
    el.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-[#C04A22]/20 animate-ping absolute"></div>
      <div class="w-4 h-4 rounded-full bg-[#C04A22] border-2 border-white shadow-md relative z-10"></div>
    `;

    const bkoigl = (window as any).bkoigl;
    if (bkoigl) {
      userMarkerRef.current = new bkoigl.Marker({ element: el })
        .setLngLat([userCoords[1], userCoords[0]])
        .addTo(map);
    }
  }, [userCoords, mapLoaded]);

  // Update Item Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bkoigl = (window as any).bkoigl;
    if (!bkoigl) return;

    items.forEach(item => {
      const isSelected = selectedItem?.id === item.id;
      const el = document.createElement("div");
      el.className = `cursor-pointer transition-transform duration-200 ${
        isSelected ? "scale-125 z-30" : "scale-100 hover:scale-110 z-20"
      }`;

      el.innerHTML = `
        <div class="px-2.5 py-1 rounded-full text-xs font-bold shadow-md border flex items-center gap-1.5 transition-all ${
          isSelected
            ? "bg-[#C04A22] text-white border-[#C04A22] ring-2 ring-[#C04A22]/30"
            : "bg-white text-slate-800 border-slate-200 hover:border-[#C04A22]"
        }">
          <span>📍</span>
          <span class="max-w-[100px] truncate">${item.title}</span>
        </div>
      `;

      el.addEventListener("click", () => handleMarkerClick(item));

      const marker = new bkoigl.Marker({ element: el })
        .setLngLat([item.lng, item.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [items, selectedItem, mapLoaded, handleMarkerClick]);

  // Fit bounds when search query entered
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !items || items.length === 0 || directionItem) return;

    if (searchQuery && searchQuery.trim().length > 0) {
      if (items.length === 1) {
        map.flyTo({ center: [items[0].lng, items[0].lat], zoom: 15.5, duration: 800 });
      } else if (items.length > 1) {
        const bkoigl = (window as any).bkoigl;
        if (bkoigl) {
          const bounds = new bkoigl.LngLatBounds();
          items.forEach(i => bounds.extend([i.lng, i.lat]));
          map.fitBounds(bounds, { padding: 50, maxZoom: 16, duration: 800 });
        }
      }
    }
  }, [items, searchQuery, directionItem, mapLoaded]);

  // Fly to selected item
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !selectedItem || directionItem) return;
    map.flyTo({
      center: [selectedItem.lng, selectedItem.lat],
      zoom: 15.5,
      duration: 800
    });
  }, [selectedItem, directionItem, mapLoaded]);

  // Handle Road Route to Selected Item
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !directionItem) {
      setRouteInfo(null);
      return;
    }

    let isCancelled = false;

    fetchRealRoadRoute(userCoords[0], userCoords[1], directionItem.lat, directionItem.lng, travelMode).then(
      res => {
        if (isCancelled || !mapInstanceRef.current) return;
        setRouteInfo(res);

        const routeGeoJson: any = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: res.coordinates
          }
        };

        if (map.getSource("direction-route")) {
          map.getSource("direction-route").setData(routeGeoJson);
        } else {
          try {
            map.addSource("direction-route", { type: "geojson", data: routeGeoJson });
            map.addLayer({
              id: "direction-route-casing",
              type: "line",
              source: "direction-route",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: { "line-color": "#ffffff", "line-width": 8, "line-opacity": 0.9 }
            });
            map.addLayer({
              id: "direction-route-line",
              type: "line",
              source: "direction-route",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: { "line-color": themeColor, "line-width": 5, "line-opacity": 1 }
            });
          } catch (_) {}
        }

        const bkoigl = (window as any).bkoigl;
        if (bkoigl && res.coordinates.length > 0) {
          const bounds = new bkoigl.LngLatBounds();
          res.coordinates.forEach(coord => bounds.extend(coord));
          map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 1000 });
        }
      }
    );

    return () => { isCancelled = true; };
  }, [directionItem, travelMode, userCoords, mapLoaded, themeColor]);

  const handleCenterUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [userCoords[1], userCoords[0]],
        zoom: 14.5,
        duration: 800
      });
    }
  };

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden transition-all duration-300">
      <div
        className={`relative w-full transition-[height] duration-300 ease-in-out ${
          directionItem
            ? isNavCardMinimized
              ? "h-[380px] sm:h-[470px] md:h-[530px] lg:h-[590px]"
              : "h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px]"
            : isScrolled
              ? "h-[210px] sm:h-[240px] md:h-[260px] lg:h-[280px]"
              : "h-[440px] sm:h-[520px] md:h-[580px] lg:h-[620px]"
        }`}
      >
        <div ref={mapContainerRef} className="w-full h-full" />

        {markerClickedItem && !directionItem && !isScrolled && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:left-4 sm:bottom-4 z-30 w-auto sm:w-[330px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in slide-in-from-bottom-3 duration-250 pointer-events-auto">
            <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-slate-100">
              <img src={markerClickedItem.image} alt={markerClickedItem.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <div className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-bold shadow-xs border border-slate-200/60">
                  {markerClickedItem.type}
                </div>
                <button
                  onClick={() => setMarkerClickedItem(null)}
                  className="w-6.5 h-6.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 flex items-center justify-center shadow transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 shadow-xs">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{markerClickedItem.distanceKm.toFixed(1)} km away</span>
              </div>
            </div>

            <div className="p-3 sm:p-3.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-1">{markerClickedItem.title}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">{markerClickedItem.subtitle} • {markerClickedItem.location}</p>
              <div className="mt-2">
                <span className="px-3 py-1 rounded-full bg-orange-50/80 text-[#C04A22] text-xs font-bold border border-orange-100/60 inline-block">
                  {markerClickedItem.primaryHighlight}
                </span>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMarkerClickedItem(null);
                    onShowDirection(markerClickedItem);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#C04A22]" />
                  <span>Direction</span>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onOpenDetails(markerClickedItem);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C04A22]" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          <button
            onClick={handleCenterUser}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-[#C04A22] transition cursor-pointer"
            title="Center My Location"
          >
            <Navigation className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-[#C04A22] transition cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-[#C04A22] transition cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {directionItem && routeInfo && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-96 z-30 animate-in slide-in-from-bottom-3 duration-200">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-3.5 shadow-xl border border-slate-200/90">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Road Directions</div>
                  <div className="text-sm font-bold text-slate-900 truncate">{directionItem.title}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsNavCardMinimized(!isNavCardMinimized)}
                    className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
                    title="Minimize"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isNavCardMinimized ? "rotate-180" : ""}`} />
                  </button>
                  <button
                    onClick={onClearDirection}
                    className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
                    title="Close Directions"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!isNavCardMinimized && (
                <>
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl mb-2.5">
                    {[
                      { id: "car", label: "Car", icon: Car },
                      { id: "bike", label: "Bike", icon: Bike },
                      { id: "walk", label: "Walk", icon: Footprints }
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => setTravelMode(m.id as any)}
                        className={`flex-1 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                          travelMode === m.id ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <m.icon className="w-3 h-3" />
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <div>
                      <div className="text-base font-bold text-slate-900">{routeInfo.durationText}</div>
                      <div className="text-xs text-slate-500">{routeInfo.distanceText} · {directionItem.location}</div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${directionItem.lat},${directionItem.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xs transition hover:opacity-95 flex items-center gap-1.5"
                      style={{ background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)" }}
                    >
                      <span>Start</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SERVICE DETAILS MODAL ──────────────────────────────────────────────────
function ServiceDetailsModal({
  item,
  onClose,
  onShowDirection,
  isSaved,
  onToggleSave,
  onShare
}: {
  item: ServiceListing | null;
  onClose: () => void;
  onShowDirection: (item: ServiceListing) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  onShare?: (item: ServiceListing) => void;
}) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        {/* Banner Image */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-100 overflow-hidden">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top-Left Share & Bookmark */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
            {onShare && (
              <button
                onClick={() => onShare(item)}
                className="w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer"
                title="Share"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(item.id)}
                className="w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer"
                title={isSaved ? "Saved" : "Save"}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 text-[#C04A22]" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Floating Category & Highlight */}
          <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/30">
              {item.type}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#C04A22] text-xs font-bold shadow-md">
              {item.badge || item.primaryHighlight}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 leading-snug">{item.title}</h2>
                  {item.verified && (
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm font-semibold text-[#C04A22] mt-0.5">{item.subtitle}</p>
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-[#8C3015] bg-[#C04A22]/10 px-3 py-1 rounded-xl whitespace-nowrap flex-shrink-0 border border-[#C04A22]/20">
                {item.price || item.primaryHighlight}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {item.rating} ({item.reviews} reviews)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {item.address} ({item.distance})
              </span>
            </div>
          </div>

          {/* Overview */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
              About & Overview
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {item.overview}
            </p>
          </div>

          {/* Key Features Grid */}
          {item.features && item.features.length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {item.features.map((f, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{f.label}</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{f.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#C04A22]/10 text-[#8C3015] border border-[#C04A22]/20"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                onShowDirection(item);
              }}
              className="flex-1 py-3 px-4 rounded-full text-white text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)" }}
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </button>

            {item.contactPhone && (
              <a
                href={`tel:${item.contactPhone}`}
                className="py-3 px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4 text-[#C04A22]" />
                <span className="hidden sm:inline">Call</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MASTER SERVICE MAP DIRECTORY PAGE COMPONENT ─────────────────────────────
export function ServiceMapDirectory({
  serviceName,
  serviceIcon: ServiceIcon,
  themeColor = "#C04A22",
  bannerPlaceholder,
  filterTabs,
  generateListings,
  defaultAreaName = "Jackson Heights",
  defaultCityName = "Queens"
}: ServiceMapDirectoryProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [catalogTab, setCatalogTab] = useState<"discounted" | "new" | "popular" | "all">("discounted");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<ServiceListing | null>(null);
  const [directionItem, setDirectionItem] = useState<ServiceListing | null>(null);
  const [modalItem, setModalItem] = useState<ServiceListing | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for collapsing map height with smooth hysteresis (prevents vibration)
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(prev => {
        if (!prev && y > 100) return true;
        if (prev && y < 40) return false;
        return prev;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // User Coordinates & Location
  const defaultCoords: [number, number] = [40.7505, -73.8860]; // Jackson Heights, Queens
  const [userCoords, setUserCoords] = useState<[number, number]>(defaultCoords);
  const [userArea, setUserArea] = useState<string>(defaultAreaName);
  const [userCity, setUserCity] = useState<string>(defaultCityName);
  const [isLocationGranted, setIsLocationGranted] = useState(false);

  // Generate live location items
  const [liveItems, setLiveItems] = useState<ServiceListing[]>(() =>
    generateListings(defaultCoords[0], defaultCoords[1], defaultAreaName, defaultCityName)
  );

  // Geolocation detection
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserCoords(coords);
          setIsLocationGranted(true);
          fetchBariKoiReverseGeocode(coords[0], coords[1]).then(geo => {
            const area = geo?.area || defaultAreaName;
            const city = geo?.city || defaultCityName;
            setUserArea(area);
            setUserCity(city);
            setLiveItems(generateListings(coords[0], coords[1], area, city));
          });
        },
        () => {
          // Default to Jackson Heights on deny/timeout
        },
        { timeout: 8000 }
      );
    }
  }, [generateListings, defaultAreaName, defaultCityName]);

  // Filter & Search
  const filteredItems = useMemo(() => {
    return liveItems.filter(item => {
      const matchSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        activeFilter === "all" ||
        item.category === activeFilter ||
        item.type.toLowerCase().includes(activeFilter.toLowerCase());

      const matchCatalog =
        catalogTab === "all" ||
        item.tag === catalogTab;

      return matchSearch && matchCategory && matchCatalog;
    });
  }, [liveItems, searchQuery, activeFilter, catalogTab]);

  const nearbyItems = useMemo(() => {
    return filteredItems.filter(i => i.distanceKm <= 3.0);
  }, [filteredItems]);

  const toggleSave = (id: string) => {
    setSavedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleShowDirection = (item: ServiceListing) => {
    setDirectionItem(item);
    setSelectedItem(item);
    // Scroll map into view smoothly
    const mapEl = document.getElementById("service-map-container");
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <AppLayout noPad={true}>
      <div className="w-full min-h-screen bg-[#FAFAFA] pb-16">
        {/* ── TOP STICKY BAR: Search & Back ───────────────────────────────── */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex-shrink-0"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Service Header Badge */}
            <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-slate-200">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)" }}
              >
                <ServiceIcon className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800 text-sm whitespace-nowrap">
                {serviceName}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={bannerPlaceholder || `Search ${serviceName.toLowerCase()} nearby...`}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C04A22]/20 focus:border-[#C04A22] shadow-2xs transition"
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

          {/* Filter Pills */}
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? "bg-[#C04A22] text-white shadow-xs font-semibold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── BARIKOI LIVE MAP (EXPANDED / COMPACT STICKY HEIGHT) ────── */}
        <div id="service-map-container" className={`w-full max-w-7xl mx-auto px-2 sm:px-4 transition-all duration-300 relative z-20 ${
          isScrolled ? "sticky top-[86px] sm:top-[90px] md:top-[90px] lg:top-[90px] pt-0 bg-[#FAFAFA]" : "pt-2 sm:pt-3"
        }`}>
          <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white">
            <InteractiveServiceMap
              userCoords={userCoords}
              isLocationGranted={isLocationGranted}
              items={filteredItems}
              selectedItem={selectedItem}
              onSelectItem={item => setSelectedItem(item)}
              directionItem={directionItem}
              onClearDirection={() => {
                setDirectionItem(null);
                setSelectedItem(null);
              }}
              onShowDirection={handleShowDirection}
              onOpenDetails={item => setModalItem(item)}
              savedIds={savedIds}
              onToggleSave={toggleSave}
              isScrolled={isScrolled}
              searchQuery={searchQuery}
              themeColor={themeColor}
            />
          </div>
        </div>

        {/* ── MAIN DIRECTORY LISTINGS (3-COLUMN RESPONSIVE GRID) ─────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 relative z-0">
          {/* Nearby Filter Count */}
          <div className="grid grid-cols-2 gap-2.5 mb-4 max-w-md">
            <div
              onClick={() => setActiveFilter(activeFilter === "nearby" ? "all" : "nearby")}
              className={`py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-2xl border transition-all cursor-pointer text-center sm:text-left ${
                activeFilter === "nearby"
                  ? "bg-orange-50/60 border-[#C04A22] ring-1 ring-[#C04A22]/20 shadow-xs"
                  : "bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-xs"
              }`}
            >
              <div className="text-xs sm:text-sm font-normal text-slate-800 leading-tight">
                {nearbyItems.length} {serviceName} nearby
              </div>
            </div>

            <div
              onClick={() => setActiveFilter("all")}
              className={`py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-2xl border transition-all cursor-pointer text-center sm:text-left ${
                activeFilter === "all"
                  ? "bg-orange-50/60 border-[#C04A22] ring-1 ring-[#C04A22]/20 shadow-xs"
                  : "bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-xs"
              }`}
            >
              <div className="text-xs sm:text-sm font-normal text-slate-800 leading-tight">
                {liveItems.length} total in {userCity}
              </div>
            </div>
          </div>

          {/* 🌟 CATALOG TABS & VIEW MODE SWITCHER (Horizontal ↔ vs Vertical ↕) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
              {[
                { id: "discounted", label: "Discounted" },
                { id: "new", label: "New Arrival" },
                { id: "popular", label: "Popular" },
                { id: "all", label: "All Items" },
              ].map(tab => {
                const active = catalogTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCatalogTab(tab.id as any)}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all text-center cursor-pointer whitespace-nowrap ${
                      active
                        ? "bg-[#C04A22]/15 text-[#8C3015] border border-[#C04A22]/40 shadow-2xs shadow-[#C04A22]/20"
                        : "bg-slate-100/90 text-slate-700 hover:bg-[#C04A22]/10 hover:text-[#8C3015] border border-transparent"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Card Container: Equal Grid across all devices */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
            {(activeFilter === "nearby" ? nearbyItems : filteredItems).map(item => {
              const isSelected = selectedItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  data-item-id={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setModalItem(item);
                  }}
                  className={`group bg-white rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md h-full ${
                    isSelected
                      ? "border-[#C04A22] ring-2 ring-[#C04A22]/20"
                      : "border-slate-200/90 hover:border-[#C04A22]/40"
                  }`}
                >
                  <div>
                    {/* Photo Header with Floating Top-Right Badge (Exact Screenshot Style) */}
                    <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 text-[10px] sm:text-[11px] font-extrabold text-[#8C3015] bg-white/95 backdrop-blur-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-2xs border border-[#C04A22]/20 whitespace-nowrap">
                        {item.badge || item.primaryHighlight || "FEATURED"}
                      </span>
                    </div>

                    {/* Card Body: Title & 2-line Description */}
                    <div className="p-3.5 sm:p-4 space-y-1.5">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-[#8C3015] transition-colors leading-snug line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.subtitle || item.overview}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Price Pill on Left, Explore → on Right */}
                  <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-2.5 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className="text-xs font-extrabold text-[#8C3015] bg-[#C04A22]/10 px-2.5 sm:px-3 py-1 rounded-lg whitespace-nowrap">
                      {item.price || item.primaryHighlight || "Free Aid"}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedItem(item);
                        setModalItem(item);
                      }}
                      className="text-xs sm:text-sm font-bold text-[#C04A22] group-hover:text-[#8C3015] flex items-center transition-all cursor-pointer"
                    >
                      Explore
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state fallback */}
          {(activeFilter === "nearby" ? nearbyItems : filteredItems).length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-6 my-4">
              <p className="text-sm font-semibold text-slate-700">
                No items found for the current selection.
              </p>
              <button
                onClick={() => {
                  setCatalogTab("all");
                  setActiveFilter("all");
                  setSearchQuery("");
                }}
                className="mt-3 px-4 py-1.5 rounded-full bg-[#C04A22] text-white text-xs font-bold shadow-xs hover:bg-[#8C3015] transition cursor-pointer"
              >
                Show All Items
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full Details Modal ("Explore a gele baki details dekhabe") */}
      <ServiceDetailsModal
        item={modalItem}
        onClose={() => setModalItem(null)}
        onShowDirection={handleShowDirection}
        isSaved={modalItem ? savedIds.includes(modalItem.id) : false}
        onToggleSave={toggleSave}
        onShare={async item => {
          const url = buildMapShareUrl({
            id: item.id,
            title: item.title,
            lat: item.lat,
            lng: item.lng,
            category: `${serviceName} (${item.type})`,
            address: item.address,
            image: item.image,
            phone: item.contactPhone,
            description: `${item.title} • ${item.primaryHighlight}`
          });
          await shareOrCopy({
            title: item.title,
            text: `Check out ${item.title} on Pathasathi Map!`,
            url
          });
        }}
      />
    </AppLayout>
  );
}
