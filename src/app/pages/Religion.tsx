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
  Phone, Globe, CheckCircle2, UserCheck, Utensils, Info
} from "lucide-react";
import {
  LiveReligionListing,
  generateLiveLocationReligious,
  formatDistance,
  matchReligionQuery
} from "../data/religionData";
import { ReligionDetailsModal } from "../components/religion/ReligionDetailsModal";
import { useCountryPlatform } from "../context/CountryPlatformContext";
import type { Map as LeafletMapType } from "leaflet";
import {
  safeBariKoiReverseGeocode,
  getMapStyleForLocation,
  getMapboxRasterStyle,
  getLeafletTileConfig,
  attachMapboxFallbackOnError,
  loadBkoiGL,
  bariKoiTransformRequest,
  BARIKOI_API_KEY,
} from "../services/barikoiService";

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
  isScrolled,
  dragMapHeight,
  countryCode,
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
  dragMapHeight?: number | null;
  countryCode?: string;
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
        <div style="background:${bg};color:white;width:${size}px;height:${size}px;border-radius:50%;border:${isSelected ? '3px' : '2px'} solid #ffffff;box-shadow:${isSelected ? '0 8px 20px rgba(192,74,34,0.55)' : '0 3px 8px rgba(0,0,0,0.25)'};display:flex;align-items:center;justify-content:center;transform:${isSelected ? 'scale(1.1)' : 'scale(1)'};">
          <span style="font-size:${isSelected ? '16px' : '13px'};line-height:1;">${listing.emoji}</span>
        </div>
      </div>
    `;
  };

  // User Marker HTML (Distinct Live GPS Pinpoint Marker in Branding Color #D85A30)
  const createUserMarkerHtml = () => {
    return `
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
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        userMarkerRef.current = L.marker([userCoords[0], userCoords[1]], { icon: userIcon, zIndexOffset: 99999 }).addTo(map);
      } else if (bkoigl || map.project) {
        const el = document.createElement("div");
        el.className = "bkoi-user-pinpoint-marker";
        el.style.zIndex = "999999";
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

        const mapStyle = getMapStyleForLocation(userCoords[0], userCoords[1], countryCode);
        const map = new bkoigl.Map({
          container: containerRef.current,
          center: [userCoords[1], userCoords[0]],
          zoom: 12.8,
          accessToken: key,
          apiKey: key,
          style: mapStyle,
          transformRequest: bariKoiTransformRequest,
        });

        attachMapboxFallbackOnError(map, countryCode);

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

          const tileCfg = getLeafletTileConfig(userCoords[0], userCoords[1], countryCode);
          L.tileLayer(tileCfg.url, {
            attribution: tileCfg.attribution,
            maxZoom: tileCfg.maxZoom
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

  // Dynamically update map style when country changes (e.g. BD/US -> BariKoi, Norway/Global -> Mapbox)
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapRef.current.setStyle) {
      try {
        const targetStyle = getMapStyleForLocation(userCoords[0], userCoords[1], countryCode);
        mapRef.current.setStyle(targetStyle);
      } catch (_) {}
    }
  }, [countryCode, userCoords]);

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

  // Smoothly sync map size and camera with bottom sheet up/down motion (60fps continuous WebGL resize)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Smooth camera ease to focus on user pinpoint with appropriate zoom for sheet position
    if (!directionListing && !selectedListing) {
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
      } else if (map.setView) {
        map.setView([userCoords[0], userCoords[1]], isScrolled ? 14.0 : 14.8);
      }
    }

    // Continuously resize map viewport on every animation frame during the 300ms CSS height transition
    let rafId: number;
    const start = performance.now();
    const duration = 320;

    const tick = (now: number) => {
      if (map.resize) {
        try { map.resize(); } catch (_) {}
      } else if (map.invalidateSize) {
        try { map.invalidateSize(); } catch (_) {}
      }
      if (now - start < duration) {
        rafId = requestAnimationFrame(tick);
      } else {
        if (map.resize) {
          try { map.resize(); } catch (_) {}
        } else if (map.invalidateSize) {
          try { map.invalidateSize(); } catch (_) {}
        }
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [directionListing, isNavCardMinimized, isScrolled, userCoords, selectedListing]);

  // Live real-time WebGL canvas resize during active mouse / finger dragging
  useEffect(() => {
    if (dragMapHeight === null || dragMapHeight === undefined) return;
    const map = mapRef.current;
    if (!map) return;
    if (map.resize) {
      try { map.resize(); } catch (_) {}
    } else if (map.invalidateSize) {
      try { map.invalidateSize(); } catch (_) {}
    }
  }, [dragMapHeight]);

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]">
      <div
        style={dragMapHeight !== null && dragMapHeight !== undefined ? { height: `${dragMapHeight}px`, transition: 'none' } : undefined}
        className={`relative w-full ${dragMapHeight !== null && dragMapHeight !== undefined ? '' : 'transition-[height] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]'} ${
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

              <div className="mt-1.5 flex items-center gap-2 overflow-hidden">
                {markerClickedListing.features.slice(0, 2).map(f => (
                  <span key={f} className="text-[#C04A22] text-[10px] font-bold truncate">
                    {f}
                  </span>
                ))}
              </div>

              {/* Action Buttons (Icon Only) */}
              <div className="mt-2.5 pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMarkerClickedListing(null);
                    onShowDirection(markerClickedListing);
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
                    onViewDetails?.(markerClickedListing);
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

        {/* Top Right Controls (Zoom + Recenter - Matching Screenshot 2) */}
        <div className="absolute top-4 right-4 z-30 flex flex-col items-center gap-2 pointer-events-auto">
          {/* Zoom controls pill */}
          <div className="flex flex-col items-center bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/90 overflow-hidden">
            <button
              onClick={() => {
                if (mapRef.current?.zoomIn) mapRef.current.zoomIn();
                else if (mapRef.current?.setZoom) mapRef.current.setZoom(mapRef.current.getZoom() + 1);
              }}
              className="w-8.5 h-8.5 flex items-center justify-center text-slate-700 hover:text-[#D85A30] hover:bg-slate-50 transition cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-4 h-4 stroke-[2.2]" />
            </button>
            <div className="w-full h-px bg-slate-100" />
            <button
              onClick={() => {
                if (mapRef.current?.zoomOut) mapRef.current.zoomOut();
                else if (mapRef.current?.setZoom) mapRef.current.setZoom(mapRef.current.getZoom() - 1);
              }}
              className="w-8.5 h-8.5 flex items-center justify-center text-slate-700 hover:text-[#D85A30] hover:bg-slate-50 transition cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
          {/* Floating Navigation Button */}
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
            className={`w-9.5 h-9.5 rounded-full shadow-lg border transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
              isLocationGranted
                ? "bg-[#D85A30] text-white border-[#D85A30] shadow-[#D85A30]/30"
                : "bg-white/95 backdrop-blur-md text-slate-700 hover:text-[#D85A30] border-slate-200/90"
            }`}
            title="Recenter to Your Location"
          >
            <Navigation className={`w-4 h-4 transition-transform ${isLocationGranted ? "text-white fill-current" : "text-slate-700 hover:text-[#D85A30]"}`} />
          </button>
        </div>
      </div>

      {/* ── ROUTE NAVIGATION CARD ── */}
      {directionListing && (
        <div className="w-full bg-[#FAFAFA] border-t border-slate-200/90 px-3 py-3 sm:px-4 sm:py-3.5 transition-all duration-150 ease-out">
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
  const { currentCountry } = useCountryPlatform();
  const countryCode = "BD";

  // Coordinates from current platform country or Cached User Location
  const defaultCoords: [number, number] = currentCountry?.defaultCoords || [23.8103, 90.4125];
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

  const initialLoc = useMemo(() => {
    try {
      const cachedArea = localStorage.getItem("bkoi_last_user_area");
      const cachedCity = localStorage.getItem("bkoi_last_user_city");
      if (cachedArea || cachedCity) {
        return {
          city: cachedCity || "Your City",
          area: cachedArea || "Your Area",
          name: `${cachedArea || "Your Area"}, ${cachedCity || "Bangladesh"}`
        };
      }
    } catch (_) {}
    return { city: "Dhaka", area: "Gulshan / Banani", name: "Dhaka, Bangladesh" };
  }, []);

  // Geolocation states
  const [isLocating, setIsLocating] = useState(false);
  const [isLocationGranted, setIsLocationGranted] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem("bkoi_last_user_coords");
    } catch (_) {
      return false;
    }
  });
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // States initialized around user's location
  const [livePlaces, setLivePlaces] = useState<LiveReligionListing[]>(() => {
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
    return generateLiveLocationReligious(coords[0], coords[1], initialLoc.area, initialLoc.city);
  });

  // Keep places synced with real address without moving to default on nav off
  useEffect(() => {
    try {
      const cached = localStorage.getItem("bkoi_last_user_coords");
      if (cached) {
        const [lat, lng] = JSON.parse(cached);
        if (!isNaN(lat) && !isNaN(lng)) {
          safeBariKoiReverseGeocode(lat, lng).then(geo => {
            const area = geo?.area || geo?.sub_district || "Your Area";
            const city = geo?.city || "Your City";
            setLivePlaces(generateLiveLocationReligious(lat, lng, area, city));
          });
        }
      }
    } catch (_) {}
  }, []);
  const [selectedPlace, setSelectedPlace] = useState<LiveReligionListing | null>(null);
  const [directionPlace, setDirectionPlace] = useState<LiveReligionListing | null>(null);
  const [activeModalPlace, setActiveModalPlace] = useState<LiveReligionListing | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleSave = (id: string) => {
    setSavedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Smooth scroll detection for dynamic map resizing
  const cardListRef = useRef<HTMLDivElement>(null);

  // Uber-style 1:1 real-time drag tracking for mouse & touch
  const [dragMapHeight, setDragMapHeight] = useState<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startDragYRef = useRef<number>(0);
  const startMapHeightRef = useRef<number>(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const mapEl = document.getElementById("religion-map-section")?.querySelector(".relative.w-full");
    const currentH = mapEl ? mapEl.getBoundingClientRect().height : (isScrolled ? 240 : 500);

    startDragYRef.current = e.clientY;
    startMapHeightRef.current = currentH;
    isDraggingRef.current = true;
    setDragMapHeight(currentH);

    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";

    const isMobile = window.innerWidth < 640;
    const minH = isMobile ? 210 : 260;
    const maxH = isMobile ? 440 : 580;

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

      if (Math.abs(totalDeltaY) < 6) {
        setDragMapHeight(null);
        setIsScrolled(prev => {
          const next = !prev;
          if (!next && cardListRef.current) cardListRef.current.scrollTop = 0;
          return next;
        });
        return;
      }

      const midPoint = (minH + maxH) / 2;
      const finalH = Math.min(maxH, Math.max(minH, startMapHeightRef.current + totalDeltaY));

      if (finalH < midPoint) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        if (cardListRef.current) cardListRef.current.scrollTop = 0;
      }
      setDragMapHeight(null);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { once: true });
  };

  // Card list touch gestures (pull-down when at top expands map, swipe-up when expanded compacts map)
  const listTouchStartYRef = useRef<number | null>(null);

  const handleListTouchStart = (e: React.TouchEvent) => {
    listTouchStartYRef.current = e.touches[0].clientY;
  };

  const handleListTouchMove = (e: React.TouchEvent) => {
    if (listTouchStartYRef.current === null || !cardListRef.current) return;
    const deltaY = e.touches[0].clientY - listTouchStartYRef.current;

    if (cardListRef.current.scrollTop <= 2 && deltaY > 30 && isScrolled) {
      setIsScrolled(false);
      listTouchStartYRef.current = null;
    } else if (!isScrolled && deltaY < -30) {
      setIsScrolled(true);
      listTouchStartYRef.current = null;
    }
  };

  const handleListTouchEnd = () => {
    listTouchStartYRef.current = null;
  };

  // Smooth scroll detection for dynamic map resizing
  const handleCardListScroll = () => {
    if (!cardListRef.current) return;
    const y = cardListRef.current.scrollTop;
    if (y > 20 && !isScrolled) {
      setIsScrolled(true);
    }
  };

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
        try {
          localStorage.setItem("bkoi_last_user_coords", JSON.stringify([lat, lng]));
        } catch (_) {}
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
      <div className="w-full h-[calc(100dvh-4rem)] lg:h-[calc(100vh)] flex flex-col overflow-hidden bg-[#FAFAFA]">
        {/* ── TOP STICKY BAR (Housing Style) ── */}
        <div className="flex-shrink-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 shadow-2xs">
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

        {/* ── DUAL-STATE BARIKOI LIVE MAP (NICHE/UNDERNEATH) ── */}
        <div id="religion-map-section" className="w-full max-w-7xl mx-auto px-0 flex-shrink-0 z-10">
          <div className="rounded-none sm:rounded-b-2xl overflow-hidden border-b border-slate-200/90 shadow-xs bg-white">
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
              dragMapHeight={dragMapHeight}
              countryCode={countryCode}
            />
          </div>
        </div>

        {/* ── MAIN DIRECTORY CONTENT (UPORE / ON TOP - PAUSES RIGHT BELOW COMPACT MAP) ── */}
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
            title={isScrolled ? "Drag down to expand map" : "Drag up to compact map"}
          >
            <div className="w-12 h-1.5 bg-slate-300 group-hover:bg-slate-400 active:bg-slate-500 rounded-full transition-colors" />
          </div>
          {/* Counter Toggle Boxes */}
          <div className="grid grid-cols-2 gap-2.5 mb-4 max-w-md px-4 sm:px-0">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-0 sm:gap-5 items-stretch mb-6">
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
                  className={`group bg-white rounded-none sm:rounded-3xl border-0 sm:border border-slate-200/90 overflow-hidden transition-all duration-150 ease-out cursor-pointer flex flex-col justify-between h-full shadow-none sm:shadow-2xs ${
                    isSelected
                      ? "sm:border-[#C04A22] sm:shadow-md sm:ring-2 sm:ring-[#C04A22]/20"
                      : "sm:border-slate-200/90 sm:hover:border-[#C04A22]/40 sm:hover:shadow-xs"
                  }`}
                >
                  {/* Top: Image & Header Info */}
                  <div>
                    {/* Image Banner with Badge */}
                    <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-slate-100">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
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
                      <div className="mt-2 flex flex-wrap gap-2">
                        {place.features.slice(0, 3).map(f => (
                          <span key={f} className="text-[#C04A22] text-[11px] font-bold">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Action Buttons & Rating (Icon Only) */}
                  <div className="px-4 sm:px-5 pb-3 pt-1">
                    <div className="flex items-center justify-between gap-2.5">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleShowDirection(place);
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
                          setActiveModalPlace(place);
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
