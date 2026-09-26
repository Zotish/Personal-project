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
  Phone, Globe, CheckCircle2, UserCheck, Utensils, Info
} from "lucide-react";
import { ServiceListing, formatDistance, getDistanceKm } from "../../data/serviceDirectoryData";
import type { Map as LeafletMapType } from "leaflet";
import { useCountryPlatform } from "../../context/CountryPlatformContext";
import {
  safeBariKoiReverseGeocode,
  getMapStyleForLocation,
  getMapboxRasterStyle,
  getLeafletTileConfig,
  attachMapboxFallbackOnError,
  BARIKOI_API_KEY,
  loadBkoiGL,
  bariKoiTransformRequest,
  isLocationInBangladesh,
} from "../../services/barikoiService";

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
  return await safeBariKoiReverseGeocode(lat, lng);
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
  sheetMode,
  dragMapHeight,
  searchQuery,
  themeColor = "#C04A22",
  serviceName,
  countryCode,
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
  sheetMode?: "expanded" | "mid" | "full";
  dragMapHeight?: number | null;
  searchQuery: string;
  themeColor?: string;
  serviceName: string;
  countryCode?: string;
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
    coordinates: [number, number][];
    distanceText: string;
    durationText: string;
    distanceKm: number;
    durationMin?: number;
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

  // Smoothly sync map size and camera with bottom sheet up/down motion (60fps continuous WebGL resize)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // Smooth camera ease to focus on user pinpoint with appropriate zoom for sheet position
    if (!directionItem && !selectedItem) {
      if (map.easeTo) {
        map.easeTo({
          center: [userCoords[1], userCoords[0]],
          zoom: isScrolled ? 14.0 : 14.8,
          duration: 300,
          easing: (t: number) => t * (2 - t)
        });
      } else if (map.flyTo) {
        map.flyTo({
          center: [userCoords[1], userCoords[0]],
          zoom: isScrolled ? 14.0 : 14.8,
          duration: 300,
          essential: true
        });
      }
    } else if (directionItem && routeInfo && routeInfo.coordinates && routeInfo.coordinates.length > 0) {
      const bkoigl = (window as any).bkoigl;
      if (bkoigl) {
        const bounds = new bkoigl.LngLatBounds();
        routeInfo.coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
        map.fitBounds(bounds, { padding: isScrolled ? 40 : 60, maxZoom: 16, duration: 300 });
      }
    }

    // Continuously resize map viewport on every animation frame during the 300ms CSS height transition
    // Eliminates any canvas distortion, delay, snap or jitter
    let rafId: number;
    const start = performance.now();
    const duration = 320;

    const tick = (now: number) => {
      if (map.resize) {
        try { map.resize(); } catch (_) {}
      }
      if (now - start < duration) {
        rafId = requestAnimationFrame(tick);
      } else {
        if (map.resize) {
          try { map.resize(); } catch (_) {}
        }
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [directionItem, isNavCardMinimized, isScrolled, userCoords, selectedItem, mapLoaded, routeInfo]);

  // Live real-time WebGL canvas resize during active mouse / finger dragging
  useEffect(() => {
    if (dragMapHeight === null || dragMapHeight === undefined) return;
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;
    if (map.resize) {
      try { map.resize(); } catch (_) {}
    }
  }, [dragMapHeight, mapLoaded]);

  // ─── Service Specific Icons for Map Markers (Job-Style Pin) ───────────────────
  const getServiceSvgIcon = (svcName: string, category?: string, type?: string): string => {
    const s = (svcName || "").toLowerCase();
    const c = (category || "").toLowerCase();
    const t = (type || "").toLowerCase();

    // 1. Legal Aid
    if (s.includes("legal") || c.includes("legal") || t.includes("law") || t.includes("asylum") || t.includes("clinic") || t.includes("court")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`;
    }

    // 2. Halal Food
    if (s.includes("food") || s.includes("halal") || c.includes("food") || t.includes("food") || t.includes("restaurant") || t.includes("meat") || t.includes("tiffin") || t.includes("bakery")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v19"/><path d="M5 2v6a3 3 0 0 0 2.2 2.89L7 21"/><path d="M2 2h6"/></svg>`;
    }

    // 3. Free Medicine
    if (s.includes("medicine") || c.includes("medicine") || t.includes("insulin") || t.includes("dispensary")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`;
    }

    // 4. Pharmacy
    if (s.includes("pharmacy") || c.includes("pharmacy") || t.includes("pharmacy") || t.includes("rx") || t.includes("drug")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><path d="M12 11v6"/><path d="M9 14h6"/><path d="M19 8H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z"/></svg>`;
    }

    // 5. Hospital
    if (s.includes("hospital") || c.includes("hospital") || t.includes("emergency") || t.includes("clinic") || t.includes("health")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v4"/><path d="M14 8h-4"/><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>`;
    }

    // 6. Gas & EV
    if (s.includes("gas") || s.includes("ev") || c.includes("gas") || c.includes("ev") || t.includes("gas") || t.includes("ev") || t.includes("charging") || t.includes("station")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22h12"/><path d="M4 9h10"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>`;
    }

    // 7. Social Aid
    if (s.includes("social") || c.includes("social") || t.includes("benefit") || t.includes("snap") || t.includes("family") || t.includes("rent")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    }

    // 8. Sports
    if (s.includes("sport") || c.includes("sport") || t.includes("cricket") || t.includes("soccer") || t.includes("fitness") || t.includes("stadium")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`;
    }

    // 9. Education & Schools
    if (s.includes("school") || s.includes("education") || c.includes("university") || c.includes("college") || t.includes("school") || t.includes("university") || t.includes("college")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
    }

    // 10. Transit, Metro & Subway
    if (s.includes("transit") || s.includes("metro") || s.includes("subway") || c.includes("metro") || c.includes("railway") || t.includes("metro") || t.includes("station") || t.includes("bus")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>`;
    }

    // 11. Grocery & Superstores
    if (s.includes("grocery") || s.includes("shop") || c.includes("superstore") || c.includes("market") || t.includes("superstore") || t.includes("grocery")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`;
    }

    // 12. Furniture
    if (s.includes("furniture") || c.includes("furniture") || t.includes("furniture") || t.includes("sofa")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z"/><path d="M5 18v2"/><path d="M19 18v2"/></svg>`;
    }

    // 13. Remittance & Money Exchange
    if (s.includes("money") || s.includes("remittance") || s.includes("exchange") || c.includes("remittance")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
    }

    // 14. Travel & Flight
    if (s.includes("travel") || s.includes("flight") || s.includes("airline") || c.includes("airline")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`;
    }

    // 15. Cars & Auto
    if (s.includes("car") || s.includes("auto") || c.includes("cars-auto") || t.includes("car")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.2 1 12 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`;
    }

    // 16. Electronics & Gadgets
    if (s.includes("electronic") || s.includes("gadget") || c.includes("electronics")) {
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>`;
    }

    // Default fallback
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
  };

  const createServiceMarkerHtml = (item: ServiceListing, isSelected: boolean) => {
    const bg = isSelected ? "#8C3015" : themeColor || "#C04A22";
    const size = isSelected ? 38 : 32;
    const svgIcon = getServiceSvgIcon(serviceName, item.category, item.type);

    return `
      <div style="position:relative;display:inline-flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform 0.2s ease;">
        <div style="background:${bg};color:white;width:${size}px;height:${size}px;border-radius:50%;border:${isSelected ? '3px' : '2px'} solid white;box-shadow:${isSelected ? '0 8px 20px rgba(192,74,34,0.5)' : '0 3px 10px rgba(0,0,0,0.25)'};display:flex;align-items:center;justify-content:center;transform:${isSelected ? 'scale(1.1)' : 'scale(1)'};">
          ${svgIcon}
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid ${bg};margin-top:-1px;"></div>
      </div>
    `;
  };

  // Initialize Map
  useEffect(() => {
    let isMounted = true;
    loadBkoiGL().then((bkoigl: any) => {
      if (!isMounted || !mapContainerRef.current) return;

      try {
        const key = BARIKOI_API_KEY;
        if (bkoigl) {
          bkoigl.accessToken = key;
          bkoigl.apiKey = key;
        }

        const mapStyle = getMapStyleForLocation(userCoords[0], userCoords[1], countryCode);
        const map = new bkoigl.Map({
          container: mapContainerRef.current,
          center: [userCoords[1], userCoords[0]],
          zoom: 14.2,
          maxZoom: 18,
          minZoom: 4,
          style: mapStyle,
          transformRequest: bariKoiTransformRequest,
          accessToken: key,
          apiKey: key,
          doubleClickZoom: true,
          attributionControl: false
        });

        // Gracefully handle missing sprite icons/layers from Barikoi style
        map.on("styleimagemissing", (e: any) => {
          const id = e.id;
          if (!map.hasImage(id)) {
            const canvas = document.createElement("canvas");
            canvas.width = 1;
            canvas.height = 1;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const imgData = ctx.createImageData(1, 1);
              map.addImage(id, imgData);
            }
          }
        });

        attachMapboxFallbackOnError(map, countryCode);

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

  // Dynamically update map style when country changes (e.g. BD/US -> BariKoi, Norway/Global -> Mapbox)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (mapInstanceRef.current.setStyle) {
      try {
        const targetStyle = getMapStyleForLocation(userCoords[0], userCoords[1], countryCode);
        mapInstanceRef.current.setStyle(targetStyle);
      } catch (_) {}
    }
  }, [countryCode, userCoords]);

  // Update User Marker (Distinct High-Visibility Live GPS Pinpoint Marker)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    if (userMarkerRef.current) userMarkerRef.current.remove();

    const el = document.createElement("div");
    el.className = "bkoi-user-pinpoint-marker";
    el.style.zIndex = "999999";
    el.innerHTML = `
      <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:999999;">
        <!-- Pinpoint Radar Waves (Brand Color #D85A30) -->
        <div style="position:absolute;inset:-10px;border-radius:50%;background:rgba(216,90,48,0.22);animation:userPinRadar 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position:absolute;inset:-4px;border-radius:50%;background:rgba(230,101,60,0.32);animation:userPinRadar 2s cubic-bezier(0,0,0.2,1) 0.6s infinite;"></div>
        <!-- Core Beacon (Brand Color #D85A30) -->
        <div style="width:18px;height:18px;border-radius:50%;background:#D85A30;border:3px solid #ffffff;box-shadow:0 3px 12px rgba(216,90,48,0.5);position:relative;z-index:2;display:flex;align-items:center;justify-content:center;">
          <div style="width:6px;height:6px;border-radius:50%;background:#ffffff;"></div>
        </div>
        <style>
          @keyframes userPinRadar {
            0% { transform: scale(0.6); opacity: 0.9; }
            70% { transform: scale(2.2); opacity: 0; }
            100% { transform: scale(2.2); opacity: 0; }
          }
        </style>
      </div>
    `;

    const bkoigl = (window as any).bkoigl;
    if (bkoigl) {
      userMarkerRef.current = new bkoigl.Marker({ element: el })
        .setLngLat([userCoords[1], userCoords[0]])
        .addTo(map);
    }
  }, [userCoords, mapLoaded]);

  // Update Item Markers (Job-Style Service-Specific Pins)
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
      el.className = "bkoi-service-marker";
      el.innerHTML = createServiceMarkerHtml(item, isSelected);

      el.addEventListener("click", () => handleMarkerClick(item));

      const marker = new bkoigl.Marker({ element: el })
        .setLngLat([item.lng, item.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [items, selectedItem, mapLoaded, handleMarkerClick, serviceName, themeColor]);

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

  // User pinpoint center is continuously handled in synchronized 60fps camera effect above

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
    <div className="w-full flex flex-col bg-white overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]">
      <div
        style={dragMapHeight !== null && dragMapHeight !== undefined ? { height: `${dragMapHeight}px`, transition: 'none' } : undefined}
        className={`relative w-full ${dragMapHeight !== null && dragMapHeight !== undefined ? '' : 'transition-[height] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]'} ${
          directionItem
            ? isNavCardMinimized
              ? "h-[380px] sm:h-[470px] md:h-[530px] lg:h-[590px]"
              : "h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px]"
            : sheetMode === "full"
              ? "h-0 overflow-hidden"
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
              <div className="mt-1.5">
                <span className="text-[#C04A22] text-xs font-bold inline-block">
                  {markerClickedItem.primaryHighlight}
                </span>
              </div>
              <div className="mt-2.5 pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMarkerClickedItem(null);
                    onShowDirection(markerClickedItem);
                  }}
                  className="flex-1 py-2 rounded-xl bg-transparent hover:opacity-70 text-[#C04A22] font-bold transition flex items-center justify-center cursor-pointer active:scale-95"
                  title="Direction"
                  aria-label="Direction"
                >
                  <Navigation className="w-4 h-4 text-[#C04A22]" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onOpenDetails(markerClickedItem);
                  }}
                  className="flex-1 py-2 rounded-xl bg-transparent hover:opacity-70 text-[#C04A22] font-bold transition flex items-center justify-center shadow-none active:scale-95 cursor-pointer"
                  title="Details"
                  aria-label="Details"
                >
                  <Info className="w-4 h-4 text-[#C04A22]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Controls: Zoom In / Out / Recenter (Matching Screenshot 2) */}
        <div className="absolute top-3 right-3 flex flex-col items-center gap-2 z-20 pointer-events-auto">
          {/* Zoom controls pill */}
          <div className="flex flex-col items-center bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/90 overflow-hidden">
            <button
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="w-8.5 h-8.5 flex items-center justify-center text-slate-700 hover:text-[#D85A30] hover:bg-slate-50 transition cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-4 h-4 stroke-[2.2]" />
            </button>
            <div className="w-full h-px bg-slate-100" />
            <button
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="w-8.5 h-8.5 flex items-center justify-center text-slate-700 hover:text-[#D85A30] hover:bg-slate-50 transition cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
          {/* Floating Navigation Button */}
          <button
            onClick={handleCenterUser}
            className="w-9.5 h-9.5 rounded-full shadow-lg border transition-all cursor-pointer active:scale-95 flex items-center justify-center bg-[#D85A30] text-white border-[#D85A30] shadow-[#D85A30]/30"
            title="Center My Location"
          >
            <Navigation className="w-4 h-4 fill-current" />
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
  defaultAreaName = "Gulshan / Banani",
  defaultCityName = "Dhaka"
}: ServiceMapDirectoryProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<ServiceListing | null>(null);
  const [directionItem, setDirectionItem] = useState<ServiceListing | null>(null);
  const [modalItem, setModalItem] = useState<ServiceListing | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [sheetMode, setSheetMode] = useState<"expanded" | "mid" | "full">("expanded");
  const [dragMapHeight, setDragMapHeight] = useState<number | null>(null);
  const cardListRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startDragYRef = useRef<number>(0);
  const startMapHeightRef = useRef<number>(0);

  // Uber-style 1:1 real-time drag tracking for mouse & touch
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const mapEl = document.getElementById("service-map-container")?.querySelector(".relative.w-full");
    const isMobile = window.innerWidth < 640;
    const minH = 0; // User can drag cart all the way to the top of the map!
    const midH = isMobile ? 210 : 250;
    const maxH = isMobile ? 440 : 580;
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

      // Handle bar is NOT a clickable button - ignore simple clicks/taps without dragging
      if (Math.abs(totalDeltaY) < 8) {
        setDragMapHeight(null);
        return;
      }

      const finalH = Math.min(maxH, Math.max(minH, startMapHeightRef.current + totalDeltaY));
      const thresholdTopMid = midH / 2; // ~110px
      const thresholdMidBottom = (midH + maxH) / 2; // ~350px-380px

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
          if (cardListRef.current) cardListRef.current.scrollTop = 0;
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
          if (cardListRef.current) cardListRef.current.scrollTop = 0;
        }
      }

      setDragMapHeight(null);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { once: true });
  };

  // Card list touch pull-down gesture to expand map when at top of list
  const listTouchStartYRef = useRef<number | null>(null);

  const handleListTouchStart = (e: React.TouchEvent) => {
    if (cardListRef.current && cardListRef.current.scrollTop <= 2) {
      listTouchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleListTouchMove = (e: React.TouchEvent) => {
    if (listTouchStartYRef.current === null || !cardListRef.current) return;
    const deltaY = e.touches[0].clientY - listTouchStartYRef.current;

    if (cardListRef.current.scrollTop <= 2 && deltaY > 35 && isScrolled) {
      setIsScrolled(false);
      listTouchStartYRef.current = null;
    }
  };

  const handleListTouchEnd = () => {
    listTouchStartYRef.current = null;
  };

  // Card list scroll detection
  const handleCardListScroll = () => {
    if (!cardListRef.current) return;
    const y = cardListRef.current.scrollTop;
    if (y > 20 && !isScrolled) {
      setIsScrolled(true);
    }
  };

  const { currentCountry } = useCountryPlatform();

  // User Coordinates & Location
  const defaultCoords: [number, number] = currentCountry?.defaultCoords || [23.8103, 90.4125]; // Dhaka, Bangladesh
  const [userCoords, setUserCoords] = useState<[number, number]>(() => {
    try {
      const cached = localStorage.getItem("bkoi_last_user_coords");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length === 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
          return [parsed[0], parsed[1]];
        }
      }
    } catch (_) {}
    return defaultCoords;
  });
  const [userArea, setUserArea] = useState<string>(() => {
    try {
      return localStorage.getItem("bkoi_last_user_area") || defaultAreaName;
    } catch (_) {
      return defaultAreaName;
    }
  });
  const [userCity, setUserCity] = useState<string>(() => {
    try {
      return localStorage.getItem("bkoi_last_user_city") || defaultCityName;
    } catch (_) {
      return defaultCityName;
    }
  });
  const [isLocationGranted, setIsLocationGranted] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem("bkoi_last_user_coords");
    } catch (_) {
      return false;
    }
  });

  // Generate live location items
  const [liveItems, setLiveItems] = useState<ServiceListing[]>(() => {
    const coords = (() => {
      try {
        const cached = localStorage.getItem("bkoi_last_user_coords");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length === 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
            return [parsed[0], parsed[1]];
          }
        }
      } catch (_) {}
      return defaultCoords;
    })();
    const area = (() => {
      try {
        return localStorage.getItem("bkoi_last_user_area") || defaultAreaName;
      } catch (_) {
        return defaultAreaName;
      }
    })();
    const city = (() => {
      try {
        return localStorage.getItem("bkoi_last_user_city") || defaultCityName;
      } catch (_) {
        return defaultCityName;
      }
    })();
    return generateListings(coords[0], coords[1], area, city);
  });

  // Geolocation detection
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const inBD = isLocationInBangladesh(pos.coords.latitude, pos.coords.longitude);
          const coords: [number, number] = inBD
            ? [pos.coords.latitude, pos.coords.longitude]
            : userCoords;
          setUserCoords(coords);
          setIsLocationGranted(true);
          try {
            localStorage.setItem("bkoi_last_user_coords", JSON.stringify(coords));
          } catch (_) {}
          fetchBariKoiReverseGeocode(coords[0], coords[1]).then(geo => {
            const area = geo?.area || defaultAreaName;
            const city = geo?.city || defaultCityName;
            setUserArea(area);
            setUserCity(city);
            try {
              localStorage.setItem("bkoi_last_user_area", area);
              localStorage.setItem("bkoi_last_user_city", city);
            } catch (_) {}
            setLiveItems(generateListings(coords[0], coords[1], area, city));
          });
        },
        () => {
          // Do not overwrite userCoords if already known
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

      return matchSearch;
    });
  }, [liveItems, searchQuery]);

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
      <div className="w-full h-[calc(100dvh-4rem)] lg:h-[calc(100vh)] flex flex-col overflow-hidden bg-[#FAFAFA]">
        {/* ── TOP STICKY BAR: Search & Back ───────────────────────────────── */}
        <div className="flex-shrink-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 shadow-2xs">
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

        {/* ── BARIKOI LIVE MAP (EXPANDED / COMPACT STICKY HEIGHT - NICHE/UNDERNEATH) ────── */}
        <div
          id="service-map-container"
          className={`w-full max-w-7xl mx-auto px-0 flex-shrink-0 z-10 transition-[height] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            sheetMode === "full" && dragMapHeight === null ? "h-0 overflow-hidden" : ""
          }`}
        >
          <div className="rounded-none sm:rounded-b-2xl overflow-hidden border-b border-slate-200/90 shadow-xs bg-white">
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
              sheetMode={sheetMode}
              dragMapHeight={dragMapHeight}
              searchQuery={searchQuery}
              themeColor={themeColor}
              serviceName={serviceName}
              countryCode={currentCountry?.code}
            />
          </div>
        </div>

        {/* ── MAIN DIRECTORY LISTINGS (UPORE / ON TOP - PAUSES RIGHT BELOW COMPACT MAP) ─────────── */}
        <div
          ref={cardListRef}
          onScroll={handleCardListScroll}
          onTouchStart={handleListTouchStart}
          onTouchMove={handleListTouchMove}
          onTouchEnd={handleListTouchEnd}
          className="flex-1 min-h-0 overflow-y-auto max-w-7xl w-full mx-auto px-0 sm:px-6 pt-2 sm:pt-4 relative z-20 bg-[#FAFAFA] rounded-t-3xl shadow-[0_-6px_25px_rgba(0,0,0,0.06)] border-t border-slate-200/80 -mt-2 sm:-mt-3 pb-24"
        >
          {/* Uber-style pull handle indicator (Live 1:1 mouse/touch drag tracker) */}
          <div
            onPointerDown={handlePointerDown}
            className="w-full flex items-center justify-center py-3 cursor-grab active:cursor-grabbing select-none group touch-none"
          >
            <div className="w-12 h-1.5 bg-slate-300 group-hover:bg-slate-400 active:bg-slate-500 rounded-full transition-colors" />
          </div>
          {/* Nearby Filter Count */}
          <div className="grid grid-cols-2 gap-2.5 mb-4 max-w-md px-4 sm:px-0">
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

          {/* Card Container: Equal Grid across all devices */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-0 sm:gap-5 items-stretch">
            {(activeFilter === "nearby" ? nearbyItems : filteredItems).map(item => {
              const isSelected = selectedItem?.id === item.id;
              const isSaved = savedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  data-item-id={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                  }}
                  className={`group bg-white rounded-none sm:rounded-3xl border-0 sm:border border-slate-200/90 overflow-hidden transition-all duration-150 ease-out cursor-pointer flex flex-col justify-between h-full shadow-none sm:shadow-2xs ${
                    isSelected
                      ? "sm:border-[#C04A22] sm:ring-2 sm:ring-[#C04A22]/20 sm:shadow-md"
                      : "sm:border-slate-200/90 sm:hover:border-slate-300 sm:hover:shadow-xs"
                  }`}
                >
                  {/* Banner Image with Type & Distance Floating Badges */}
                  <div>
                    <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold shadow-xs border border-slate-200/60">
                        {item.badge || item.type || item.primaryHighlight || "Available"}
                      </div>
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {item.distance}
                      </div>
                      {/* Top Left: Share & Bookmark Save Buttons */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-[2]">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const url = buildMapShareUrl({
                              id: item.id,
                              title: item.title,
                              lat: item.lat,
                              lng: item.lng,
                              category: `${serviceName} (${item.type})`,
                              address: item.address,
                              image: item.image,
                              phone: item.contactPhone,
                              description: `${item.title} • ${item.primaryHighlight || item.subtitle}`,
                            });
                            await shareOrCopy({
                              title: item.title,
                              text: `Check out ${item.title} on Pathasathi Map!`,
                              url,
                            });
                          }}
                          className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-[#C04A22] transition shadow-xs cursor-pointer"
                          title="Share on Map"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleSave(item.id);
                          }}
                          className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-[#C04A22] transition shadow-xs cursor-pointer"
                          title={isSaved ? "Saved" : "Save"}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-[#C04A22]" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Card Body Header */}
                    <div className="p-4 sm:p-5 pb-0">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-[#C04A22] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                        {item.subtitle} • {item.location || item.address}
                      </p>

                      {/* Highlight / Price */}
                      <div className="mt-2.5">
                        <span className="text-[#C04A22] text-xs sm:text-sm font-bold inline-block">
                          {item.price || item.primaryHighlight || "Free Aid"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body Footer: Direction & Details Buttons (Icon Only) */}
                  <div className="px-4 sm:px-5 pb-3 pt-1">
                    <div className="flex items-center justify-between gap-2.5">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleShowDirection(item);
                        }}
                        className="flex-1 py-2 rounded-2xl bg-transparent hover:opacity-70 text-[#C04A22] font-bold transition flex items-center justify-center cursor-pointer active:scale-95"
                        title="Direction"
                        aria-label="Direction"
                      >
                        <Navigation className="w-4 h-4 text-[#C04A22]" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedItem(item);
                          setModalItem(item);
                        }}
                        className="flex-1 py-2 rounded-2xl bg-transparent hover:opacity-70 text-[#C04A22] font-bold transition flex items-center justify-center shadow-none active:scale-95 cursor-pointer"
                        title="Details"
                        aria-label="Details"
                      >
                        <Info className="w-4 h-4 text-[#C04A22]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state fallback */}
          {(activeFilter === "nearby" ? nearbyItems : filteredItems).length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-6 my-4 mx-4 sm:mx-0">
              <p className="text-sm font-semibold text-slate-700">
                No items found for the current selection.
              </p>
              <button
                onClick={() => {
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
