import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Search, MapPin, Navigation, Bookmark, BookmarkCheck,
  Utensils, ExternalLink, Sparkles, Filter, ChevronRight,
  ChevronLeft, ChevronUp, ChevronDown, Plus, Minus,
  ArrowLeft, ArrowRight, Car, Bike, Footprints,
  ShieldCheck, Loader2, X, Clock, Calendar, Heart, Phone
} from "lucide-react";
import {
  LiveFoodListing,
  generateLiveLocationFreeFood,
  matchFreeFoodQuery
} from "../data/freeFoodData";
import { FoodDetailsModal } from "../components/food/FoodDetailsModal";

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

// ─── BariKoi Reverse Geocoding & Road Routing APIs ──────────────────────────
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
        city: data.place.city || data.place.district || "Dhaka",
        sub_district: data.place.sub_district || ""
      };
    }
  } catch (err) {
    console.warn("BariKoi reverse geocode error:", err);
  }
  return null;
}

// Real road route calculation using OSRM / BariKoi profiles
async function fetchRealRoadRoute(startLat: number, startLng: number, endLat: number, endLng: number, mode: "car" | "bike" | "walk" = "car") {
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
  return {
    coordinates: [[startLng, startLat], [endLng, endLat]] as [number, number][],
    distanceText: "Direct",
    durationText: "Calculating...",
    distanceKm: 1.0,
    durationMin: 5
  };
}

// ─── BariKoi Interactive Live Food Map Component (Housing/Jobs Format) ──────
function BariKoiLiveFoodMap({
  userCoords,
  isLocationGranted,
  listings,
  selectedListing,
  onSelectListing,
  onRequestLocation,
  onDenyLocation,
  showPermissionPrompt,
  isLocating,
  directionListing,
  onClearDirection,
  onShowDirection,
  onViewDetails,
  isScrolled
}: {
  userCoords: [number, number];
  isLocationGranted: boolean;
  listings: LiveFoodListing[];
  selectedListing: LiveFoodListing | null;
  onSelectListing: (listing: LiveFoodListing | null) => void;
  onRequestLocation: () => void;
  onDenyLocation: () => void;
  showPermissionPrompt: boolean;
  isLocating: boolean;
  directionListing: LiveFoodListing | null;
  onClearDirection: () => void;
  onShowDirection: (listing: LiveFoodListing) => void;
  onViewDetails?: (listing: LiveFoodListing) => void;
  isScrolled?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const lastCoordinatesRef = useRef<[number, number][] | null>(null);

  const [markerClickedListing, setMarkerClickedListing] = useState<LiveFoodListing | null>(null);
  const [travelMode, setTravelMode] = useState<"car" | "bike" | "walk">("car");
  const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);
  const [isNavCardMinimized, setIsNavCardMinimized] = useState(false);

  const handleMarkerClick = useCallback((listing: LiveFoodListing) => {
    setMarkerClickedListing(listing);
    onSelectListing(listing);
  }, [onSelectListing]);

  // Auto-hide marker card overlay if user scrolls
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

  // Helper to create HTML for Food Marker Pin
  const createFoodMarkerHtml = (listing: LiveFoodListing, isSelected: boolean) => {
    const bg = isSelected ? "#8C3015" : "#C04A22";
    const size = isSelected ? 38 : 32;
    return `
      <div style="position:relative;display:inline-flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform 0.2s ease;">
        ${isSelected ? '<div style="position:absolute;top:-4px;left:-4px;width:' + (size + 8) + 'px;height:' + (size + 8) + 'px;border-radius:50%;background:rgba(192,74,34,0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>' : ''}
        <div style="background:${bg};color:white;width:${size}px;height:${size}px;border-radius:50%;border:${isSelected ? '3px' : '2px'} solid white;box-shadow:${isSelected ? '0 8px 20px rgba(192,74,34,0.5)' : '0 3px 10px rgba(0,0,0,0.25)'};display:flex;align-items:center;justify-content:center;transform:${isSelected ? 'scale(1.1)' : 'scale(1)'};">
          <span style="font-size:${isSelected ? '18px' : '15px'};line-height:1;">🍲</span>
        </div>
      </div>
    `;
  };

  // Synchronize Markers
  const syncMapMarkers = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = LRef.current;
    const bkoigl = (window as any).bkoigl;

    // 1. User Live GPS Pinpoint Marker
    if (isLocationGranted && userCoords) {
      const userHtml = `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:rgba(192,74,34,0.25);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width:18px;height:18px;border-radius:50%;background:#C04A22;border:3px solid white;box-shadow:0 0 12px rgba(192,74,34,0.8);"></div>
        </div>
      `;

      if (L && map.addLayer) {
        if (!userMarkerRef.current) {
          const userIcon = L.divIcon({
            className: "bkoi-user-marker",
            html: userHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
          userMarkerRef.current = L.marker(userCoords, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
        } else {
          userMarkerRef.current.setLatLng(userCoords);
        }
      } else if (bkoigl || map.project) {
        if (!userMarkerRef.current) {
          const el = document.createElement("div");
          el.innerHTML = userHtml;
          const MarkerClass = bkoigl?.Marker || (window as any).maplibregl?.Marker;
          if (MarkerClass) {
            userMarkerRef.current = new MarkerClass({ element: el })
              .setLngLat([userCoords[1], userCoords[0]])
              .addTo(map);
          }
        } else {
          userMarkerRef.current.setLngLat([userCoords[1], userCoords[0]]);
        }
      }
    } else {
      if (userMarkerRef.current) {
        if (userMarkerRef.current.remove) userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    }

    // 2. Clear old Food Markers
    markersRef.current.forEach(m => {
      if (m.remove) m.remove();
    });
    markersRef.current = [];

    // 3. Add Food Listing Pins
    listings.forEach(listing => {
      const isSelected = selectedListing?.id === listing.id;
      const html = createFoodMarkerHtml(listing, isSelected);

      if (L && map.addLayer) {
        const icon = L.divIcon({
          className: "bkoi-food-pin",
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
        el.className = "bkoi-food-pin";
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
  }, [isLocationGranted, userCoords, listings, selectedListing, handleMarkerClick]);

  // Initialize BariKoi SDK / Leaflet
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
          zoom: 14.5,
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
        // Fallback to Leaflet
        import("leaflet").then(L => {
          if (!isSubscribed || !containerRef.current || mapRef.current) return;
          delete (L.Icon.Default.prototype as any)._getIconUrl;

          const map = L.map(containerRef.current, {
            center: userCoords,
            zoom: 14,
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

  // Update markers when listings or selection changes
  useEffect(() => {
    syncMapMarkers();
  }, [listings, selectedListing, isLocationGranted, userCoords, syncMapMarkers]);

  // Road Routing Line rendering when Direction is active
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = LRef.current;

    if (directionListing && userCoords) {
      const [userLat, userLng] = userCoords;
      const listingLat = directionListing.lat;
      const listingLng = directionListing.lng;
      let isCancelled = false;

      fetchRealRoadRoute(userLat, userLng, listingLat, listingLng, travelMode).then(routeData => {
        if (isCancelled || !mapRef.current) return;

        setRouteInfo({
          distanceText: routeData.distanceText,
          durationText: routeData.durationText
        });

        const coords = routeData.coordinates;
        lastCoordinatesRef.current = coords;

        // Leaflet Polylines
        if (L && map.addLayer) {
          if (routeLineRef.current) {
            try { routeLineRef.current.remove(); } catch (_) {}
          }
          const latLngs = coords.map(([lng, lat]) => [lat, lng]);
          routeLineRef.current = L.polyline(latLngs, {
            color: "#C04A22",
            weight: 5,
            opacity: 0.9,
            lineJoin: "round",
            lineCap: "round"
          }).addTo(map);

          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16.5 });
        }
        // BariKoi / MapLibre GeoJSON Line
        else if (map.getSource && map.addLayer) {
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

          if (map.getSource("direction-route")) {
            map.getSource("direction-route").setData(geojson);
          } else {
            map.addSource("direction-route", {
              type: "geojson",
              data: geojson
            });
            map.addLayer({
              id: "direction-route-line",
              type: "line",
              source: "direction-route",
              layout: {
                "line-join": "round",
                "line-cap": "round"
              },
              paint: {
                "line-color": "#C04A22",
                "line-width": 5,
                "line-opacity": 0.92
              }
            });
          }

          // Fit bounds
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
              { padding: 40, maxZoom: 16.5, duration: 800 }
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
      if (map.getSource && map.getSource("direction-route")) {
        try {
          map.getSource("direction-route").setData({
            type: "FeatureCollection",
            features: []
          });
        } catch (_) {}
      }
    }
  }, [directionListing, userCoords, travelMode]);

  // Handle Resize during transitions so map stays crisp
  useEffect(() => {
    if (!mapRef.current) return;
    const handleResize = () => {
      if (mapRef.current) {
        if (mapRef.current.resize) mapRef.current.resize();
        if (mapRef.current.invalidateSize) mapRef.current.invalidateSize();
      }
    };

    const t1 = setTimeout(handleResize, 60);
    const t2 = setTimeout(handleResize, 250);
    const t3 = setTimeout(handleResize, 450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [directionListing, isNavCardMinimized, isScrolled]);

  const handleZoomIn = () => {
    if (!mapRef.current) return;
    if (LRef.current) mapRef.current.zoomIn();
    else if (mapRef.current.zoomIn) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    if (LRef.current) mapRef.current.zoomOut();
    else if (mapRef.current.zoomOut) mapRef.current.zoomOut();
  };

  const handleReset = () => {
    onRequestLocation();
    if (!mapRef.current) return;
    if (LRef.current) {
      mapRef.current.flyTo(userCoords, 15, { duration: 1.0 });
    } else if (mapRef.current.flyTo) {
      mapRef.current.flyTo({ center: [userCoords[1], userCoords[0]], zoom: 15, speed: 1.2 });
    }
  };

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden transition-all duration-300">
      {/* ── MAP CONTAINER (Dynamic Height depending on scroll & route state) ── */}
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

        {/* ── Selected Food Card Overlay on Marker Click (Housing Format) ── */}
        {markerClickedListing && !directionListing && !isScrolled && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:left-4 sm:bottom-4 z-30 w-auto sm:w-[330px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in slide-in-from-bottom-3 duration-250 pointer-events-auto">
            {/* Banner Image with Agency & Distance Badges */}
            <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-slate-100">
              <img
                src={markerClickedListing.image}
                alt={markerClickedListing.title}
                className="w-full h-full object-cover"
              />
              {/* Top Right: Close button */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <button
                  onClick={() => setMarkerClickedListing(null)}
                  className="w-6.5 h-6.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 flex items-center justify-center shadow transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Top Left: Agency Badge */}
              <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-bold border border-slate-200/60 shadow-xs">
                <span className="truncate max-w-[140px]">{markerClickedListing.agency}</span>
              </div>

              {/* Bottom Left: Distance Badge on Image */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 shadow-xs">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{markerClickedListing.distance}</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3 sm:p-3.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-1">
                {markerClickedListing.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                {markerClickedListing.location}
              </p>

              {/* Action Buttons: Direction & Details (Side by Side) */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMarkerClickedListing(null);
                    onShowDirection(markerClickedListing);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                  title="Show road route from your location"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#C04A22]" />
                  <span>Direction</span>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onViewDetails?.(markerClickedListing);
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
              title="Deny"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Map Controls: Zoom In / Out / Recenter (Top Right) */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition cursor-pointer hover:text-[#C04A22]"
            title="Zoom In"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition cursor-pointer hover:text-[#C04A22]"
            title="Zoom Out"
          >
            <Minus className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={handleReset}
            disabled={isLocating}
            className={`w-9 h-9 rounded-xl shadow-md border transition cursor-pointer active:scale-95 disabled:opacity-75 flex items-center justify-center ${
              isLocationGranted
                ? "bg-[#C04A22] text-white border-[#C04A22] shadow-[#C04A22]/30"
                : "bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 border-slate-200/80 hover:text-[#C04A22]"
            }`}
            title={isLocationGranted ? "Live Location Active (Click to Recenter)" : "Turn ON Live Location (GPS)"}
          >
            {isLocating ? (
              <Loader2 className={`w-4.5 h-4.5 animate-spin ${isLocationGranted ? "text-white" : "text-[#C04A22]"}`} />
            ) : (
              <Navigation className={`w-4.5 h-4.5 ${isLocationGranted ? "text-white" : "text-[#C04A22]"}`} />
            )}
          </button>
        </div>
      </div>

      {/* ── ROUTE NAVIGATION CARD (Housing & Jobs Identical Structure & Style!) ── */}
      {directionListing && (
        <div className="w-full bg-[#FAFAFA] border-t border-slate-200/90 px-3 py-3 sm:px-4 sm:py-3.5 transition-all duration-300">
          {/* 1. Minimized Route Bar (Matching Jobs/Housing) */}
          {isNavCardMinimized ? (
            <div
              onClick={() => setIsNavCardMinimized(false)}
              className="w-full bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-slate-200/90 flex items-center justify-between gap-3 cursor-pointer hover:border-[#C04A22]/40 transition"
              title="Click to view route details"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-[#C04A22]/12 text-[#8C3015] flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-4 h-4 text-[#C04A22]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {directionListing.title}
                  </div>
                  <div className="text-xs text-[#C04A22] font-bold">
                    ({directionListing.distanceKm.toFixed(1)} km)
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
                  title="Expand Card"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearDirection();
                  }}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
                  title="Clear Route"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* 2. Expanded Route Navigation Card (Matching Jobs/Housing) */
            <div className="w-full bg-white rounded-3xl p-3.5 sm:p-4 shadow-xs border border-slate-200/90 animate-in slide-in-from-bottom-2 duration-250">
              {/* Drag Handle Top Bar */}
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-2.5" />

              {/* Header: Back Arrow, Origin & Destination Hierarchy, Collapse Chevron */}
              <div className="flex items-center justify-between gap-2.5 mb-3">
                <button
                  onClick={onClearDirection}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer flex-shrink-0"
                  title="Go back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 min-w-0 px-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
                    <span className="w-2 h-2 rounded-full bg-[#C04A22] flex-shrink-0" />
                    <span className="truncate">Your Location</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 truncate mt-0.5">
                    <Utensils className="w-3.5 h-3.5 text-[#C04A22] flex-shrink-0" />
                    <span className="truncate">{directionListing.title}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsNavCardMinimized(true)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer flex-shrink-0"
                  title="Minimize Card"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Travel Mode Switcher Tabs */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setTravelMode("car")}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    travelMode === "car"
                      ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/25 shadow-2xs"
                      : "bg-slate-100/90 hover:bg-[#C04A22]/8 text-slate-600 hover:text-[#8C3015] border border-transparent"
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Car</span>
                </button>
                <button
                  onClick={() => setTravelMode("bike")}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    travelMode === "bike"
                      ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/25 shadow-2xs"
                      : "bg-slate-100/90 hover:bg-[#C04A22]/8 text-slate-600 hover:text-[#8C3015] border border-transparent"
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Bike</span>
                </button>
                <button
                  onClick={() => setTravelMode("walk")}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    travelMode === "walk"
                      ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/25 shadow-2xs"
                      : "bg-slate-100/90 hover:bg-[#C04A22]/8 text-slate-600 hover:text-[#8C3015] border border-transparent"
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Walking</span>
                </button>
              </div>

              {/* 3 Stats Metric Grid */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-slate-50/90 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {travelMode === "car"
                      ? `${Math.max(1, Math.round(directionListing.distanceKm * 2.5))} min`
                      : travelMode === "bike"
                      ? `${Math.max(2, Math.round(directionListing.distanceKm * 4.5))} min`
                      : `${Math.max(5, Math.round(directionListing.distanceKm * 12))} min`}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">Time</div>
                </div>

                <div className="bg-slate-50/90 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {directionListing.distanceKm.toFixed(1)} km
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">Distance</div>
                </div>

                <div className="bg-slate-50/90 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate max-w-full px-1">
                    {directionListing.agency.split(" ")[0]}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">Agency</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Master Free Food Page (100% Housing/Jobs Identical Design System) ──────
export function FreeFood() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [userCoords, setUserCoords] = useState<[number, number]>([23.8103, 90.4125]);
  const [userArea, setUserArea] = useState<string>("Dhaka Area");
  const [userCity, setUserCity] = useState<string>("Dhaka");
  const [isLocationGranted, setIsLocationGranted] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [selectedListing, setSelectedListing] = useState<LiveFoodListing | null>(null);
  const [directionListing, setDirectionListing] = useState<LiveFoodListing | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<LiveFoodListing | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  // Request Live GPS Location strictly from device GPS
  const executeGeolocation = useCallback((highAccuracy: boolean = true) => {
    setIsLocating(true);
    if (!("geolocation" in navigator)) {
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords([lat, lng]);
        setIsLocationGranted(true);
        setShowPermissionPrompt(false);
        setIsLocating(false);

        try {
          localStorage.setItem("bkoi_last_user_coords", JSON.stringify([lat, lng]));
        } catch (_) {}

        const geo = await fetchBariKoiReverseGeocode(lat, lng);
        if (geo) {
          setUserArea(geo.area || geo.sub_district || "Dhaka Area");
          setUserCity(geo.city || "Dhaka");
        }
      },
      (err) => {
        console.warn("Geolocation fallback:", err);
        setIsLocating(false);
        if (!isLocationGranted) {
          setShowPermissionPrompt(true);
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [isLocationGranted]);

  // Initial mount geolocation
  useEffect(() => {
    executeGeolocation(true);
  }, [executeGeolocation]);

  // Generate dynamic live free food drives
  const liveFood = useMemo(() => {
    return generateLiveLocationFreeFood(userCoords[0], userCoords[1], userArea, userCity);
  }, [userCoords, userArea, userCity]);

  // Filter Food drives based on Search Query & Filter Pills
  const filteredFood = useMemo(() => {
    return liveFood.filter(listing => {
      if (searchQuery.trim() && !matchFreeFoodQuery(listing, searchQuery)) {
        return false;
      }

      if (activeFilter === "nearby" && !listing.isNearby) return false;
      if (activeFilter === "breakfast" && listing.timeSlot !== "breakfast") return false;
      if (activeFilter === "lunch" && listing.timeSlot !== "lunch") return false;
      if (activeFilter === "dinner" && listing.timeSlot !== "dinner") return false;
      if (activeFilter === "grocery" && listing.timeSlot !== "grocery") return false;

      return true;
    });
  }, [liveFood, searchQuery, activeFilter]);

  const nearbyFood = useMemo(() => {
    return filteredFood.filter(f => f.isNearby);
  }, [filteredFood]);

  const handleShowDirection = (listing: LiveFoodListing) => {
    setDirectionListing(listing);
    setSelectedListing(listing);
    const mapEl = document.getElementById("food-map-section");
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const toggleSave = (id: string) => {
    setSavedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filterTabs = [
    { id: "all", label: "All Food Drives" },
    { id: "nearby", label: "Nearby" },
    { id: "breakfast", label: "Breakfast" },
    { id: "lunch", label: "Lunch" },
    { id: "dinner", label: "Dinner" },
    { id: "grocery", label: "Grocery / Ration Packs" }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#FDFBF9] pb-16">
        {/* ── TOP STICKY BAR: Search Free Food & Time Filter ────────────────── */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex-shrink-0"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Clean rounded search bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="search food drives, meal type, free grocery, agency..."
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

          {/* Time Filter Pills */}
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
            {filterTabs.map(f => (
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

        {/* ── BARIKOI LIVE MAP (EXPANDED / COMPACT STICKY HEIGHT) ────── */}
        <div id="food-map-section" className={`w-full max-w-7xl mx-auto px-2 sm:px-4 transition-all duration-300 ${
          isScrolled ? "sticky top-[86px] sm:top-[90px] md:top-[90px] lg:top-[90px] z-10 pt-0" : "pt-2 sm:pt-3"
        }`}>
          <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white">
            <BariKoiLiveFoodMap
              userCoords={userCoords}
              isLocationGranted={isLocationGranted}
              listings={filteredFood}
              selectedListing={selectedListing}
              onSelectListing={listing => setSelectedListing(listing)}
              onRequestLocation={() => executeGeolocation(true)}
              onDenyLocation={() => setShowPermissionPrompt(false)}
              showPermissionPrompt={showPermissionPrompt}
              isLocating={isLocating}
              directionListing={directionListing}
              onClearDirection={() => {
                setDirectionListing(null);
                setSelectedListing(null);
              }}
              onShowDirection={handleShowDirection}
              onViewDetails={listing => setShowDetailsModal(listing)}
              isScrolled={isScrolled}
            />
          </div>
        </div>

        {/* ── MAIN FOOD DIRECTORY CONTENT (1-COL MOBILE, 2-COL PAD, 3-COL DESKTOP) ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
          {/* Toggle Button Header */}
          <div className="grid grid-cols-2 gap-2.5 mb-4 max-w-md">
            <div
              onClick={() => setActiveFilter("nearby")}
              className={`flex-1 py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-2xl border text-center transition-all cursor-pointer active:scale-99 ${
                activeFilter === "nearby"
                  ? "bg-orange-50/60 border-[#C04A22] ring-1 ring-[#C04A22]/20 shadow-xs"
                  : "bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-xs"
              }`}
            >
              <div className="text-xs sm:text-sm font-normal text-slate-800 leading-tight">
                {nearbyFood.length} Nearby
              </div>
            </div>

            <div
              onClick={() => setActiveFilter("all")}
              className={`flex-1 py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-2xl border text-center transition-all cursor-pointer active:scale-99 ${
                activeFilter === "all"
                  ? "bg-orange-50/60 border-[#C04A22] ring-1 ring-[#C04A22]/20 shadow-xs"
                  : "bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-xs"
              }`}
            >
              <div className="text-xs sm:text-sm font-normal text-slate-800 leading-tight">
                {liveFood.length} Full State
              </div>
            </div>
          </div>

          {/* Equal Grid of Food Cards (1 on mobile, 2 on pad, 3 on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
            {(activeFilter === "nearby" ? nearbyFood : filteredFood).map(listing => {
              const isSelected = selectedListing?.id === listing.id;
              const isSaved = savedIds.includes(listing.id);

              return (
                <div
                  key={listing.id}
                  data-food-id={listing.id}
                  ref={el => {
                    if (el) cardRefs.current.set(listing.id, el);
                    else cardRefs.current.delete(listing.id);
                  }}
                  onClick={() => setSelectedListing(listing)}
                  className={`group bg-white rounded-3xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between h-full ${
                    isSelected
                      ? "border-[#C04A22] ring-2 ring-[#C04A22]/20 shadow-md"
                      : "border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  {/* Top: Image & Header Content */}
                  <div>
                    {/* Banner Image with Agency Corner Badge */}
                    <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-slate-100">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Top-Left: Agency Badge In The Corner */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold border border-slate-200/80 shadow-xs">
                        <span className="truncate max-w-[140px] sm:max-w-[180px]">{listing.agency}</span>
                      </div>

                      {/* Bottom-Left: Distance Badge */}
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {listing.distance}
                      </div>
                    </div>

                    {/* Card Content Header */}
                    <div className="p-4 sm:p-5 pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-[#C04A22] transition-colors line-clamp-1">
                            {listing.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{listing.location}</span>
                          </p>
                        </div>

                        {/* Bookmark Save Button */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleSave(listing.id);
                          }}
                          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#C04A22] flex items-center justify-center transition cursor-pointer flex-shrink-0"
                          title={isSaved ? "Saved" : "Save Program"}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-[#C04A22]" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Schedule / Hours summary */}
                      <div className="mt-3">
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                          {listing.timeText || "Free Distribution Today"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Action Buttons Aligned Equally */}
                  <div className="p-4 sm:p-5 pt-3">
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleShowDirection(listing);
                        }}
                        className="flex-1 px-3.5 py-2 rounded-2xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                        title="Show Road Route to Food Point"
                      >
                        <Navigation className="w-4 h-4 text-[#C04A22]" />
                        <span>Direction</span>
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setShowDetailsModal(listing);
                        }}
                        className="flex-1 px-3.5 py-2 rounded-2xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-4 h-4 text-[#C04A22]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Food Program Details Modal ── */}
        {showDetailsModal && (
          <FoodDetailsModal
            food={showDetailsModal}
            onClose={() => setShowDetailsModal(null)}
            onShowDirection={food => {
              setShowDetailsModal(null);
              handleShowDirection(food);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}
