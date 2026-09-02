import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { buildMapShareUrl, shareOrCopy } from "../utils/shareUtils";
import {
  Search, MapPin, Navigation, Bookmark, BookmarkCheck, Share2,
  Building, ExternalLink, Sparkles, Filter, ChevronRight,
  ChevronLeft, ChevronUp, ChevronDown, Plus, Minus,
  ArrowLeft, ArrowRight, Car, Bike, Footprints,
  ShieldCheck, Loader2, X, Clock, Calendar, Star, Heart,
  Phone, Globe, CheckCircle2, UserCheck, Utensils
} from "lucide-react";
import {
  LiveReligionListing,
  generateLiveLocationReligious,
  formatDistance,
  matchReligionQuery
} from "../data/religionData";
import { ReligionDetailsModal } from "../components/religion/ReligionDetailsModal";
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

// ─── Real Road Routing API ───────────────────────────────────────────────────
async function fetchRealRoadRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  mode: "car" | "bike" | "walk" = "car"
) {
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
    console.warn("Road routing fetch failed:", err);
  }

  return {
    coordinates: [[startLng, startLat], [endLng, endLat]] as [number, number][],
    distanceText: "Direct",
    durationText: "Calculating...",
    distanceKm: 1.0,
    durationMin: 5
  };
}

// ─── Interactive BariKoi Map Component (Housing Format & Flow) ─────────────
function BariKoiLiveReligionMap({
  userCoords,
  isLocationGranted,
  isLocating,
  onRequestLocation,
  onDenyLocation,
  showPermissionPrompt,
  listings,
  selectedListing,
  onSelectListing,
  directionListing,
  onClearDirection,
  onShowDirection,
  onViewDetails,
  isScrolled
}: {
  userCoords: [number, number];
  isLocationGranted: boolean;
  isLocating: boolean;
  onRequestLocation: () => void;
  onDenyLocation: () => void;
  showPermissionPrompt: boolean;
  listings: LiveReligionListing[];
  selectedListing: LiveReligionListing | null;
  onSelectListing: (listing: LiveReligionListing | null) => void;
  directionListing: LiveReligionListing | null;
  onClearDirection: () => void;
  onShowDirection: (listing: LiveReligionListing) => void;
  onViewDetails?: (listing: LiveReligionListing) => void;
  isScrolled?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  const [markerClickedListing, setMarkerClickedListing] = useState<LiveReligionListing | null>(null);
  const [travelMode, setTravelMode] = useState<"car" | "bike" | "walk">("car");
  const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);
  const [isNavCardMinimized, setIsNavCardMinimized] = useState(false);

  const handleMarkerClick = useCallback((listing: LiveReligionListing) => {
    setMarkerClickedListing(listing);
    onSelectListing(listing);
  }, [onSelectListing]);

  useEffect(() => {
    const handleScroll = () => {
      setMarkerClickedListing(null);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isScrolled) {
      setMarkerClickedListing(null);
    }
  }, [isScrolled]);

  useEffect(() => {
    if (directionListing) {
      setMarkerClickedListing(null);
    }
  }, [directionListing]);

  // Marker HTML
  const createListingMarkerHtml = (listing: LiveReligionListing, isSelected: boolean) => {
    const bg = isSelected ? "#8C3015" : "#C04A22";
    const size = isSelected ? 38 : 32;

    return `
      <div style="position:relative;display:inline-flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform 0.2s ease;">
        ${isSelected ? '<div style="position:absolute;top:-4px;left:-4px;width:' + (size + 8) + 'px;height:' + (size + 8) + 'px;border-radius:50%;background:rgba(192,74,34,0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>' : ''}
        <div style="background:${bg};color:white;width:${size}px;height:${size}px;border-radius:50%;border:${isSelected ? '3px' : '2px'} solid #ffffff;box-shadow:${isSelected ? '0 8px 20px rgba(192,74,34,0.55)' : '0 3px 8px rgba(0,0,0,0.25)'};display:flex;align-items:center;justify-content:center;transform:${isSelected ? 'scale(1.1)' : 'scale(1)'};">
          <span style="font-size:${isSelected ? '16px' : '13px'};line-height:1;">${listing.emoji}</span>
        </div>
      </div>
    `;
  };

  // User Marker HTML
  const createUserMarkerHtml = () => {
    return `
      <div style="position:relative;display:inline-flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:24px;height:24px;border-radius:50%;background:rgba(16,185,129,0.3);animation:pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;"></div>
        <div style="width:14px;height:14px;border-radius:50%;background:#10B981;border:2.5px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
      </div>
    `;
  };

  // Sync Markers
  const syncMapMarkers = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = LRef.current;
    const bkoigl = (window as any).bkoigl;

    // Clear old markers
    markersRef.current.forEach(m => {
      if (m.remove) m.remove();
    });
    markersRef.current = [];

    // Add Listing Markers
    listings.forEach(listing => {
      const isSelected = selectedListing?.id === listing.id;
      const html = createListingMarkerHtml(listing, isSelected);

      if (L && map.addLayer) {
        const icon = L.divIcon({
          className: "bkoi-religion-pin",
          html,
          iconSize: isSelected ? [38, 44] : [32, 38],
          iconAnchor: isSelected ? [19, 44] : [16, 38]
        });

        const marker = L.marker([listing.lat, listing.lng], { icon }).addTo(map);
        marker.on("click", (e: any) => {
          if (e?.originalEvent) e.originalEvent.stopPropagation();
          handleMarkerClick(listing);
        });
        markersRef.current.push(marker);
      } else if (bkoigl || map.project) {
        const el = document.createElement("div");
        el.className = "bkoi-religion-pin";
        el.innerHTML = html;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          handleMarkerClick(listing);
        });

        const MarkerClass = bkoigl?.Marker || (window as any).maplibregl?.Marker;
        if (MarkerClass) {
          const marker = new MarkerClass({ element: el })
            .setLngLat([listing.lng, listing.lat])
            .addTo(map);
          markersRef.current.push(marker);
        }
      }
    });

    // Add User Pin
    if (userCoords) {
      if (userMarkerRef.current && userMarkerRef.current.remove) {
        userMarkerRef.current.remove();
      }

      if (L && map.addLayer) {
        const userIcon = L.divIcon({
          className: "bkoi-user-pin",
          html: createUserMarkerHtml(),
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        userMarkerRef.current = L.marker([userCoords[0], userCoords[1]], { icon: userIcon }).addTo(map);
      } else if (bkoigl || map.project) {
        const el = document.createElement("div");
        el.innerHTML = createUserMarkerHtml();
        const MarkerClass = bkoigl?.Marker || (window as any).maplibregl?.Marker;
        if (MarkerClass) {
          userMarkerRef.current = new MarkerClass({ element: el })
            .setLngLat([userCoords[1], userCoords[0]])
            .addTo(map);
        }
      }
    }
  }, [listings, selectedListing, userCoords, handleMarkerClick]);

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
          center: [userCoords[1], userCoords[0]],
          zoom: 12.8,
          accessToken: key,
          apiKey: key,
          style: `https://map.barikoi.com/styles/osm_barikoi_v1/style.json?key=${key}`
        });

        map.on("load", () => {
          mapRef.current = map;
          syncMapMarkers();
        });

        map.on("click", () => {
          setMarkerClickedListing(null);
          onSelectListing(null);
        });
      })
      .catch(() => {
        import("leaflet").then(L => {
          if (!isSubscribed || !containerRef.current || mapRef.current) return;
          delete (L.Icon.Default.prototype as any)._getIconUrl;

          const map = L.map(containerRef.current, {
            center: [userCoords[0], userCoords[1]],
            zoom: 13,
            zoomControl: false
          });

          L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
            attribution: '&copy; <a href="https://barikoi.com">BariKoi</a>',
            maxZoom: 19
          }).addTo(map);

          map.on("click", () => {
            setMarkerClickedListing(null);
            onSelectListing(null);
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
  }, [listings, selectedListing, userCoords, syncMapMarkers]);

  // Route drawing when direction active
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = LRef.current;

    if (directionListing && userCoords) {
      const [userLat, userLng] = userCoords;
      const placeLat = directionListing.lat;
      const placeLng = directionListing.lng;
      let isCancelled = false;

      fetchRealRoadRoute(userLat, userLng, placeLat, placeLng, travelMode).then(routeData => {
        if (isCancelled || !mapRef.current) return;

        setRouteInfo({
          distanceText: routeData.distanceText,
          durationText: routeData.durationText
        });

        const coords = routeData.coordinates;

        if (L && map.addLayer) {
          if (routeLineRef.current) {
            try { routeLineRef.current.remove(); } catch (_) {}
          }
          const latLngs = coords.map(([lng, lat]) => [lat, lng]);
          routeLineRef.current = L.polyline(latLngs, {
            color: "#C04A22",
            weight: 5,
            opacity: 0.92,
            lineJoin: "round",
            lineCap: "round"
          }).addTo(map);

          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
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

          if (map.getSource("religion-route")) {
            map.getSource("religion-route").setData(geojson);
          } else {
            map.addSource("religion-route", { type: "geojson", data: geojson });
            map.addLayer({
              id: "religion-route-line",
              type: "line",
              source: "religion-route",
              layout: { "line-join": "round", "line-cap": "round" },
              paint: { "line-color": "#C04A22", "line-width": 5, "line-opacity": 0.92 }
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
              { padding: 40, maxZoom: 16, duration: 800 }
            );
          }
        }
      });

      return () => {
        isCancelled = true;
      };
    } else {
      setRouteInfo(null);
      if (routeLineRef.current) {
        try { routeLineRef.current.remove(); } catch (_) {}
        routeLineRef.current = null;
      }
      if (map.getSource && map.getSource("religion-route")) {
        try {
          map.getSource("religion-route").setData({
            type: "FeatureCollection",
            features: []
          });
        } catch (_) {}
      }

      // Auto-move / Fly map to selected place on scroll or selection
      if (selectedListing) {
        if (LRef.current) {
          if (map.flyTo) {
            map.flyTo([selectedListing.lat, selectedListing.lng], 14.5, { duration: 1.0 });
          } else if (map.panTo) {
            map.panTo([selectedListing.lat, selectedListing.lng]);
          }
        } else {
          if (map.flyTo) {
            map.flyTo({
              center: [selectedListing.lng, selectedListing.lat],
              zoom: 14.5,
              speed: 1.2,
              curve: 1.1,
              essential: true
            });
          } else if (map.panTo) {
            map.panTo([selectedListing.lng, selectedListing.lat]);
          }
        }
      }
    }
  }, [directionListing, selectedListing, userCoords, travelMode]);

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden transition-all duration-300">
      <div
        className={`relative w-full transition-[height] duration-300 ease-in-out ${
          directionListing
            ? isNavCardMinimized
              ? "h-[380px] sm:h-[470px] md:h-[530px] lg:h-[590px]"
              : "h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px]"
            : isScrolled
              ? "h-[210px] sm:h-[240px] md:h-[260px] lg:h-[280px]"
              : "h-[440px] sm:h-[520px] md:h-[580px] lg:h-[620px]"
        }`}
      >
        <div ref={containerRef} className="w-full h-full" />

        {/* ── Selected Place Card Overlay on Marker Click ── */}
        {markerClickedListing && !directionListing && !isScrolled && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:left-4 sm:bottom-4 z-30 w-auto sm:w-[330px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in slide-in-from-bottom-3 duration-250 pointer-events-auto">
            <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-slate-100">
              <img
                src={markerClickedListing.image}
                alt={markerClickedListing.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <div className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                  {markerClickedListing.openStatus}
                </div>
                <button
                  onClick={() => setMarkerClickedListing(null)}
                  className="w-6.5 h-6.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 flex items-center justify-center shadow transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-bold border border-slate-200/60 shadow-xs flex items-center gap-1">
                <span>{markerClickedListing.emoji}</span>
                <span>{markerClickedListing.type}</span>
              </div>

              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 shadow-xs">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{markerClickedListing.distance}</span>
              </div>
            </div>

            <div className="p-3 sm:p-3.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-1">
                {markerClickedListing.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                {markerClickedListing.address}
              </p>

              {/* Feature Tags */}
              <div className="mt-2 flex items-center gap-1.5 overflow-hidden">
                {markerClickedListing.features.slice(0, 2).map(f => (
                  <span key={f} className="px-2 py-0.5 rounded-full bg-orange-50/90 text-[#8C3015] text-[10px] font-semibold truncate border border-orange-200/60">
                    {f}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMarkerClickedListing(null);
                    onShowDirection(markerClickedListing);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#C04A22]" />
                  <span>Direction</span>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onViewDetails?.(markerClickedListing);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs active:scale-98 cursor-pointer"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C04A22]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Center Permission Prompt */}
        {showPermissionPrompt && !isLocationGranted && !directionListing && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-xl border border-slate-200/90 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRequestLocation();
              }}
              disabled={isLocating}
              className="px-4 py-1.5 rounded-xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-75"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                "Allow"
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDenyLocation();
              }}
              className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Right Controls (Zoom + Recenter) */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition cursor-pointer hover:text-[#C04A22]"
            title="Zoom In"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition cursor-pointer hover:text-[#C04A22]"
            title="Zoom Out"
          >
            <Minus className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => {
              if (userCoords && mapRef.current) {
                if (mapRef.current.flyTo) {
                  mapRef.current.flyTo({ center: [userCoords[1], userCoords[0]], zoom: 14, speed: 1.2 });
                } else if (mapRef.current.setView) {
                  mapRef.current.setView([userCoords[0], userCoords[1]], 14);
                }
              }
            }}
            className={`w-9 h-9 rounded-xl shadow-md border flex items-center justify-center transition cursor-pointer ${
              isLocationGranted
                ? "bg-emerald-600 border-emerald-700 text-white shadow-emerald-500/20"
                : "bg-white/95 backdrop-blur-md hover:bg-white border-slate-200/80 text-slate-700 hover:text-[#C04A22]"
            }`}
            title="Recenter to Your Location"
          >
            <Navigation className={`w-4.5 h-4.5 ${isLocationGranted ? "animate-pulse" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── ROUTE NAVIGATION CARD ── */}
      {directionListing && (
        <div className="w-full bg-[#FAFAFA] border-t border-slate-200/90 px-3 py-3 sm:px-4 sm:py-3.5 transition-all duration-300">
          {isNavCardMinimized ? (
            <div
              onClick={() => setIsNavCardMinimized(false)}
              className="w-full bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-slate-200/90 flex items-center justify-between gap-3 cursor-pointer hover:border-[#C04A22]/40 transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-[#C04A22]/10 text-[#C04A22] flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-4 h-4 text-[#C04A22]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {directionListing.name}
                  </div>
                  <div className="text-xs text-[#C04A22] font-bold">
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
                    <span className="text-base leading-none">{directionListing.emoji}</span>
                    <span className="truncate">{directionListing.name}</span>
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
                      ? "bg-orange-50 text-[#C04A22] border border-orange-200 shadow-2xs"
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
                      ? "bg-orange-50 text-[#C04A22] border border-orange-200 shadow-2xs"
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
                      ? "bg-orange-50 text-[#C04A22] border border-orange-200 shadow-2xs"
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
                    {directionListing.type}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">Place Type</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MASTER RELIGION PAGE ───────────────────────────────────────────────────
export function ReligiousFinder() {
  const navigate = useNavigate();

  // NYC Default Coordinates (Brooklyn/Queens)
  const defaultCoords: [number, number] = [40.7128, -73.9560];
  const [userCoords, setUserCoords] = useState<[number, number]>(defaultCoords);

  // States
  const [livePlaces, setLivePlaces] = useState<LiveReligionListing[]>(() =>
    generateLiveLocationReligious(defaultCoords[0], defaultCoords[1], "Brooklyn / Queens", "New York")
  );
  const [selectedPlace, setSelectedPlace] = useState<LiveReligionListing | null>(null);
  const [directionPlace, setDirectionPlace] = useState<LiveReligionListing | null>(null);
  const [activeModalPlace, setActiveModalPlace] = useState<LiveReligionListing | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Geolocation states
  const [isLocating, setIsLocating] = useState(false);
  const [isLocationGranted, setIsLocationGranted] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  const toggleSave = (id: string) => {
    setSavedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

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

  // Filter listings
  const filteredPlaces = livePlaces.filter(place => {
    if (searchQuery.trim() && !matchReligionQuery(place, searchQuery)) {
      return false;
    }
    if (activeFilter === "nearby" && !place.isNearby) return false;
    if (activeFilter === "mosque" && place.category !== "mosque") return false;
    if (activeFilter === "temple" && place.category !== "temple") return false;
    if (activeFilter === "church" && place.category !== "church") return false;
    if (activeFilter === "gurdwara" && place.category !== "gurdwara") return false;
    if (activeFilter === "women" && !place.hasWomenSection) return false;
    if (activeFilter === "food" && !place.hasFreeFood) return false;
    return true;
  });

  const nearbyPlaces = filteredPlaces.filter(p => p.isNearby);

  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Deep linking: auto-focus and show details if opened via shared link
  const routerLocation = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(routerLocation.search), [routerLocation.search]);
  const sharedId = searchParams.get("id") || searchParams.get("placeId");

  useEffect(() => {
    if (!sharedId) return;
    const target = livePlaces.find(p => String(p.id) === String(sharedId));
    if (target) {
      setSelectedPlace(target);
      setActiveModalPlace(target);
      setUserCoords([target.lat, target.lng]);
      setTimeout(() => {
        cardRefs.current.get(target.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  }, [sharedId, livePlaces]);

  // IntersectionObserver to auto-move map to currently visible religious card (ONLY for Mobile view < 768px)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      return; // Disable scroll animation on Desktop & Pad/Tablet view!
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          const topEntry = visible.reduce((prev, curr) =>
            curr.boundingClientRect.top < prev.boundingClientRect.top ? curr : prev
          );
          const listingId = topEntry.target.getAttribute("data-listing-id");
          if (listingId && listingId !== selectedPlace?.id) {
            const target = (activeFilter === "nearby" ? nearbyPlaces : livePlaces).find(j => j.id === listingId) ||
                           filteredPlaces.find(j => j.id === listingId);
            if (target) {
              setSelectedPlace(target);
            }
          }
        }
      },
      {
        root: null,
        rootMargin: "-15% 0px -45% 0px",
        threshold: [0.2, 0.5]
      }
    );

    cardRefs.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [livePlaces, nearbyPlaces, filteredPlaces, activeFilter, selectedPlace]);

  const handleShowDirection = useCallback((listing: LiveReligionListing) => {
    setDirectionPlace(listing);
    setSelectedPlace(listing);
    const mapEl = document.getElementById("religion-map-section");
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const executeGeolocation = useCallback(() => {
    setIsLocating(true);
    if (!("geolocation" in navigator)) {
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setIsLocationGranted(true);
        setUserCoords([lat, lng]);
        setLivePlaces(generateLiveLocationReligious(lat, lng, "Your Location", "Local City"));
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const filterPills = [
    { id: "all", label: "All Places" },
    { id: "nearby", label: "Nearby" },
    { id: "mosque", label: "Mosques" },
    { id: "temple", label: "Hindu Temples" },
    { id: "church", label: "Churches" },
    { id: "gurdwara", label: "Gurdwaras" },
    { id: "women", label: "Women Section" },
    { id: "food", label: "Free Meals / Langar" }
  ];

  return (
    <AppLayout noPad={true}>
      <div className="w-full min-h-screen bg-[#FAFAFA] pb-16">
        {/* ── TOP STICKY BAR (Housing Style) ── */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex-shrink-0"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Clean Rounded Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="search mosque, temple, church, jummah, langar, prayer times..."
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
            {filterPills.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
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

        {/* ── DUAL-STATE BARIKOI LIVE MAP (Housing Dimensions & Controls) ── */}
        <div id="religion-map-section" className={`w-full max-w-7xl mx-auto px-2 sm:px-4 transition-all duration-300 ${
          isScrolled ? "sticky top-[86px] sm:top-[90px] md:top-[90px] lg:top-[90px] z-10 pt-0" : "pt-2 sm:pt-3"
        }`}>
          <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white">
            <BariKoiLiveReligionMap
              userCoords={userCoords}
              isLocationGranted={isLocationGranted}
              isLocating={isLocating}
              onRequestLocation={executeGeolocation}
              onDenyLocation={() => setShowPermissionPrompt(false)}
              showPermissionPrompt={showPermissionPrompt}
              listings={filteredPlaces}
              selectedListing={selectedPlace}
              onSelectListing={p => setSelectedPlace(p)}
              directionListing={directionPlace}
              onClearDirection={() => {
                setDirectionPlace(null);
                setSelectedPlace(null);
              }}
              onShowDirection={handleShowDirection}
              onViewDetails={p => setActiveModalPlace(p)}
              isScrolled={isScrolled}
            />
          </div>
        </div>

        {/* ── MAIN DIRECTORY CONTENT (1-COL MOBILE, 2-COL PAD, 3-COL DESKTOP) ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
          {/* Counter Toggle Boxes */}
          <div className="grid grid-cols-2 gap-2.5 mb-4 max-w-md">
            <div
              onClick={() => setActiveFilter("nearby")}
              className={`py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                activeFilter === "nearby"
                  ? "bg-orange-50/60 border-[#C04A22]/40 ring-1 ring-[#C04A22]/20 shadow-xs"
                  : "bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-200 shadow-2xs"
              }`}
            >
              <div className="text-xs sm:text-sm font-normal text-slate-900 leading-tight">
                {nearbyPlaces.length} Nearby Places
              </div>
            </div>

            <div
              onClick={() => setActiveFilter("all")}
              className={`py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-orange-50/60 border-[#C04A22]/40 ring-1 ring-[#C04A22]/20 shadow-xs"
                  : "bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-200 shadow-2xs"
              }`}
            >
              <div className="text-xs sm:text-sm font-normal text-slate-800 leading-tight">
                {livePlaces.length} All Areas
              </div>
            </div>
          </div>

          {/* Equal Grid of Religious Places (1 on mobile, 2 on pad, 3 on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch mb-6">
            {(activeFilter === "nearby" ? nearbyPlaces : filteredPlaces).map(place => {
              const isSaved = savedIds.includes(place.id);
              const isSelected = selectedPlace?.id === place.id;

              return (
                <div
                  key={place.id}
                  data-listing-id={place.id}
                  ref={el => {
                    if (el) cardRefs.current.set(place.id, el);
                    else cardRefs.current.delete(place.id);
                  }}
                  onClick={() => setActiveModalPlace(place)}
                  className={`group bg-white rounded-3xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between h-full ${
                    isSelected
                      ? "border-[#C04A22] shadow-md ring-2 ring-[#C04A22]/20"
                      : "border-slate-200/90 hover:border-[#C04A22]/40 hover:shadow-xs"
                  }`}
                >
                  {/* Top: Image & Header Info */}
                  <div>
                    {/* Image Banner with Badge */}
                    <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-slate-100">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold shadow-xs flex items-center gap-1">
                        <span>{place.emoji}</span>
                        <span>{place.type}</span>
                      </div>
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{place.distance}</span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const url = buildMapShareUrl({
                              id: place.id,
                              name: place.name,
                              lat: place.lat,
                              lng: place.lng,
                              category: `${place.emoji} ${place.type}`,
                              address: place.address,
                              image: (place as any).image,
                              phone: place.phone,
                              description: `${place.name} (${place.type}) in ${place.city}`,
                            });
                            await shareOrCopy({
                              title: place.name,
                              text: `Check out ${place.name} on Pathasathi Map!`,
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
                            toggleSave(place.id);
                          }}
                          className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-[#C04A22] transition shadow-xs cursor-pointer"
                          title={isSaved ? "Saved" : "Save Place"}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-[#C04A22]" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 pb-0">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-[#8C3015] transition-colors line-clamp-1">
                        {place.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 truncate">
                        {place.address}
                      </p>

                      {/* Feature Tags */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {place.features.slice(0, 3).map(f => (
                          <span key={f} className="px-2.5 py-0.5 rounded-full bg-orange-50/80 text-[#8C3015] text-[11px] font-medium border border-orange-200/50">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Action Buttons & Rating Aligned Equally */}
                  <div className="p-4 sm:p-5 pt-3">
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleShowDirection(place);
                        }}
                        className="flex-1 px-3.5 py-2 rounded-2xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#C04A22]" />
                        <span>Direction</span>
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setActiveModalPlace(place);
                        }}
                        className="flex-1 px-3.5 py-2 rounded-2xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Featured Prayer & Guidelines Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mt-6">
            {/* Daily Prayer & Service Schedule Widget (7 cols) */}
            <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm sm:text-base font-bold">Live Prayer Times</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 text-[11px] font-bold">
                  NYC Zone
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-slate-400 font-medium text-[11px]">Fajr (Dawn)</div>
                  <div className="text-sm font-bold text-white mt-0.5">5:15 AM</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-slate-400 font-medium text-[11px]">Dhuhr (Noon)</div>
                  <div className="text-sm font-bold text-white mt-0.5">1:00 PM</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-slate-400 font-medium text-[11px]">Asr (Afternoon)</div>
                  <div className="text-sm font-bold text-white mt-0.5">4:45 PM</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-slate-400 font-medium text-[11px]">Maghrib (Sunset)</div>
                  <div className="text-sm font-bold text-white mt-0.5">7:42 PM</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-slate-400 font-medium text-[11px]">Isha (Night)</div>
                  <div className="text-sm font-bold text-white mt-0.5">9:05 PM</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-emerald-900/40 border border-emerald-500/30">
                  <div className="text-emerald-300 font-bold text-[11px]">Jumu'ah Friday</div>
                  <div className="text-sm font-bold text-emerald-200 mt-0.5">1:15 PM & 2:00 PM</div>
                </div>
              </div>
            </div>

            {/* Community Etiquette Guidelines (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Visitor & Community Etiquette</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed list-disc list-inside">
                <li><strong>Modest Attire:</strong> Please wear modest clothing when entering religious places.</li>
                <li><strong>Shoe Removal:</strong> Remove shoes before entering prayer halls.</li>
                <li><strong>Free Community Meals:</strong> Free warm meals (Langar/Iftar) are open to all visitors.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Religion Details Modal ── */}
        {activeModalPlace && (
          <ReligionDetailsModal
            listing={activeModalPlace}
            onClose={() => setActiveModalPlace(null)}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            onShowDirection={handleShowDirection}
          />
        )}
      </div>
    </AppLayout>
  );
}
