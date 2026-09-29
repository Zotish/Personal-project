import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { buildMapShareUrl, shareOrCopy } from "../utils/shareUtils";
import {
  Search, MapPin, Navigation, Bookmark, BookmarkCheck, Share2,
  Building, ExternalLink, Sparkles, Filter, ChevronRight,
  ChevronLeft, ChevronUp, ChevronDown, Plus, Minus,
  ArrowLeft, ArrowRight, Car, Bike, Footprints, Home,
  ShieldCheck, Loader2, X, Bed, Bath, Maximize2, Info
} from "lucide-react";
import {
  LiveHousingListing,
  generateLiveLocationHousing,
  formatDistance,
  matchHousingQuery
} from "../data/housingData";
import { getDistanceKm } from "../data/jobsData";
import { HousingDetailsModal } from "../components/housing/HousingDetailsModal";
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

export interface BariKoiGeoResult {
  address: string;
  area: string;
  district: string;
  sub_district: string;
  postCode: string;
  city: string;
}

// ─── BariKoi Reverse Geocode API ────────────────────────────────────────────

async function fetchBariKoiReverseGeocode(lat: number, lng: number): Promise<BariKoiGeoResult | null> {
  const res = await safeBariKoiReverseGeocode(lat, lng);
  return {
    address: res.address,
    area: res.area || "Your Area",
    district: res.district || "",
    sub_district: res.sub_district || res.area || "",
    postCode: res.postCode || "",
    city: res.city || res.district || "Your City",
  };
}

// ─── Real Turn-by-Turn Road Routing Helper (OSRM / OpenStreetMap Standard) ───

async function fetchRealRoadRoute(startLat: number, startLng: number, endLat: number, endLng: number): Promise<{
  coordinates: [number, number][];
  distanceText: string;
  durationText: string;
}> {
  // 1. Primary: High-Precision Turn-by-Turn Driving Road Router
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&continue_straight=true&steps=true`;
    const res = await fetch(osrmUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const rawCoords: [number, number][] = route.geometry.coordinates; // Strict road network nodes
        if (rawCoords && rawCoords.length > 1) {
          const distKm = route.distance / 1000;
          const mins = Math.max(1, Math.round(route.duration / 60));
          return {
            coordinates: rawCoords,
            distanceText: `${distKm.toFixed(1)} km`,
            durationText: `~${mins} mins`
          };
        }
      }
    }
  } catch (err) {
    console.warn("OSRM routing attempt 1 failed:", err);
  }

  // 2. Secondary: OpenStreetMap DE Road Network Router
  try {
    const osmUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const res = await fetch(osmUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const rawCoords: [number, number][] = route.geometry.coordinates;
        if (rawCoords && rawCoords.length > 1) {
          const distKm = route.distance / 1000;
          const mins = Math.max(1, Math.round(route.duration / 60));
          return {
            coordinates: rawCoords,
            distanceText: `${distKm.toFixed(1)} km`,
            durationText: `~${mins} mins`
          };
        }
      }
    }
  } catch (err) {
    console.warn("OSM routing attempt 2 failed:", err);
  }

  // 3. Fallback: Direct Road Line
  const directDist = getDistanceKm(startLat, startLng, endLat, endLng);
  return {
    coordinates: [
      [startLng, startLat],
      [endLng, endLat]
    ],
    distanceText: `${directDist.toFixed(1)} km`,
    durationText: `~${Math.max(1, Math.round(directDist * 3.5))} mins`
  };
}

// ─── BariKoi Interactive Live Housing Map Component ─────────────────────────

function BariKoiLiveHousingMap({
  userCoords,
  isLocationGranted,
  listings,
  selectedListing,
  onSelectListing,
  onNavigationClick,
  onRequestLocation,
  onDenyLocation,
  showPermissionPrompt,
  isLocating,
  directionListing,
  onClearDirection,
  onShowDirection,
  onViewDetails,
  savedIds,
  onToggleSave,
  isScrolled,
  sheetMode,
  dragMapHeight,
  searchQuery,
  countryCode,
}: {
  userCoords: [number, number];
  isLocationGranted: boolean;
  listings: LiveHousingListing[];
  selectedListing: LiveHousingListing | null;
  onSelectListing: (listing: LiveHousingListing | null) => void;
  onNavigationClick: () => void;
  onRequestLocation: () => void;
  onDenyLocation: () => void;
  showPermissionPrompt: boolean;
  isLocating: boolean;
  directionListing: LiveHousingListing | null;
  onClearDirection: () => void;
  onShowDirection: (listing: LiveHousingListing) => void;
  onViewDetails?: (listing: LiveHousingListing) => void;
  savedIds?: string[];
  onToggleSave?: (id: string) => void;
  isScrolled?: boolean;
  sheetMode?: "expanded" | "mid" | "full";
  dragMapHeight?: number | null;
  searchQuery?: string;
  countryCode?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const lastCoordinatesRef = useRef<[number, number][] | null>(null);
  const lastFocusedListingIdRef = useRef<string | null>(null);
  const [markerClickedListing, setMarkerClickedListing] = useState<LiveHousingListing | null>(null);
  const [cardPlacement, setCardPlacement] = useState<"bottom" | "top">("bottom");

  const handleMarkerClick = useCallback((listing: LiveHousingListing) => {
    let placement: "bottom" | "top" = "bottom";
    const map = mapRef.current;
    if (map) {
      let pinY: number | null = null;
      if (typeof map.latLngToContainerPoint === "function") {
        pinY = map.latLngToContainerPoint([listing.lat, listing.lng]).y;
      } else if (typeof map.project === "function") {
        pinY = map.project([listing.lng, listing.lat]).y;
      }
      const containerH = containerRef.current?.clientHeight || 450;
      if (isScrolled || (pinY !== null && pinY > containerH * 0.4)) {
        placement = "top";
      } else {
        placement = "bottom";
      }
    } else if (isScrolled) {
      placement = "top";
    }
    setCardPlacement(placement);
    setMarkerClickedListing(listing);
    onSelectListing(listing);
  }, [onSelectListing, isScrolled]);

  // Auto-hide marker card overlay if user scrolls window or sheet goes to full
  useEffect(() => {
    const handleScroll = () => {
      setMarkerClickedListing(null);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (sheetMode === "full") {
      setMarkerClickedListing(null);
    }
  }, [sheetMode]);

  useEffect(() => {
    if (directionListing) {
      setMarkerClickedListing(null);
    }
  }, [directionListing]);

  // Helper to create HTML for Housing Marker
  const createHousingMarkerHtml = (listing: LiveHousingListing, isSelected: boolean) => {
    const isRent = listing.purpose === "Rent";
    const bg = isSelected ? "#8C3015" : isRent ? "#C04A22" : "#4338CA";
    const size = isSelected ? 38 : 32;
    return `
      <div style="position:relative;display:inline-flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform 0.2s ease;">
        <div style="background:${bg};color:white;width:${size}px;height:${size}px;border-radius:50%;border:${isSelected ? '3px' : '2px'} solid white;box-shadow:${isSelected ? '0 8px 20px rgba(192,74,34,0.5)' : '0 3px 10px rgba(0,0,0,0.25)'};display:flex;align-items:center;justify-content:center;transform:${isSelected ? 'scale(1.1)' : 'scale(1)'};">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div style="background:rgba(15,23,42,0.85);backdrop-filter:blur(4px);color:white;font-size:10px;font-weight:700;padding:2px 6px;border-radius:8px;margin-top:2px;white-space:nowrap;box-shadow:0 2px 5px rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.2);">
          ${listing.price.split("/")[0]}
        </div>
      </div>
    `;
  };

  // Distinct Live GPS User Pinpoint Marker in Branding Color (#D85A30)
  const createUserMarkerHtml = () => `
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

  // Sync Markers to Map
  const syncMapMarkers = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const bkoigl = (window as any).bkoigl;
    const L = LRef.current;

    // 1. Sync / Update User Exact Pinpoint Marker (Always visible at userCoords)
    if (userMarkerRef.current) {
      if (userMarkerRef.current.setLngLat) {
        userMarkerRef.current.setLngLat([userCoords[1], userCoords[0]]);
      } else if (userMarkerRef.current.setLatLng) {
        userMarkerRef.current.setLatLng(userCoords);
      }
    } else {
      if (L && map.addLayer) {
        const userIcon = L.divIcon({
          className: "custom-user-location-pin",
          html: createUserMarkerHtml(),
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        const userM = L.marker(userCoords, { icon: userIcon, zIndexOffset: 99999 }).addTo(map);
        userMarkerRef.current = userM;
      } else if (bkoigl || map.project) {
        const el = document.createElement("div");
        el.className = "bkoi-user-pinpoint-marker";
        el.style.zIndex = "999999";
        el.innerHTML = createUserMarkerHtml();
        const MarkerClass = bkoigl?.Marker || (window as any).maplibregl?.Marker;
        if (MarkerClass) {
          const userM = new MarkerClass({ element: el })
            .setLngLat([userCoords[1], userCoords[0]])
            .addTo(map);
          userMarkerRef.current = userM;
        }
      }
    }

    // 2. Clear old Housing Markers
    markersRef.current.forEach(m => {
      if (m.remove) m.remove();
    });
    markersRef.current = [];

    // 3. Add Housing Markers around live location
    listings.forEach(listing => {
      const isSelected = selectedListing?.id === listing.id;
      if (L && map.addLayer) {
        const icon = L.divIcon({
          className: "bkoi-housing-marker",
          html: createHousingMarkerHtml(listing, isSelected),
          iconSize: isSelected ? [38, 50] : [32, 44],
          iconAnchor: isSelected ? [19, 50] : [16, 44]
        });
        const marker = L.marker([listing.lat, listing.lng], { icon }).addTo(map);
        marker.on("click", () => handleMarkerClick(listing));
        markersRef.current.push(marker);
      } else if (bkoigl || map.project) {
        const el = document.createElement("div");
        el.innerHTML = createHousingMarkerHtml(listing, isSelected);
        el.style.cursor = "pointer";
        el.addEventListener("click", () => handleMarkerClick(listing));

        const MarkerClass = bkoigl?.Marker || (window as any).maplibregl?.Marker;
        if (MarkerClass) {
          const marker = new MarkerClass({ element: el })
            .setLngLat([listing.lng, listing.lat])
            .addTo(map);
          markersRef.current.push(marker);
        }
      }
    });
  }, [listings, userCoords, isLocationGranted, selectedListing, handleMarkerClick]);

  // Init BariKoi GL SDK / Leaflet Fallback
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    loadBkoiGL()
      .then(bkoigl => {
        if (!containerRef.current || mapRef.current) return;
        const key = BARIKOI_API_KEY;
        if (bkoigl) {
          bkoigl.accessToken = key;
          bkoigl.apiKey = key;
        }

        const mapStyle = getMapStyleForLocation(userCoords[0], userCoords[1], countryCode);
        const map = new bkoigl.Map({
          container: containerRef.current!,
          center: [userCoords[1], userCoords[0]], // [lng, lat]
          zoom: 14.6,
          accessToken: key,
          apiKey: key,
          attributionControl: false,
          style: mapStyle,
          transformRequest: bariKoiTransformRequest,
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
          mapRef.current = map;
          syncMapMarkers();
        });

        mapRef.current = map;
      })
      .catch(() => {
        // Fallback to Leaflet with BariKoi tiles
        import("leaflet").then(L => {
          if (!containerRef.current || mapRef.current) return;
          delete (L.Icon.Default.prototype as any)._getIconUrl;

          const map = L.map(containerRef.current!, {
            center: userCoords,
            zoom: 15,
            zoomControl: false,
            attributionControl: false
          });

          const tileCfg = getLeafletTileConfig(userCoords[0], userCoords[1], countryCode);
          L.tileLayer(tileCfg.url, {
            maxZoom: tileCfg.maxZoom,
            attribution: tileCfg.attribution,
          }).addTo(map);

          mapRef.current = map;
          LRef.current = L;
          syncMapMarkers();
        });
      });

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (_) { }
        mapRef.current = null;
      }
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

  // Update map center & pinpoint when user location updates
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (map.flyTo) {
      map.flyTo({ center: [userCoords[1], userCoords[0]], zoom: 14.8, speed: 1.5 });
    } else if (map.setView) {
      map.setView(userCoords, 15);
    }
    syncMapMarkers();
  }, [userCoords, syncMapMarkers]);

  // Update markers when selection or listing list changes
  useEffect(() => {
    syncMapMarkers();
  }, [syncMapMarkers]);

  // When search query is entered or matching listings filter changes, fit map to visible filtered listings
  useEffect(() => {
    if (!mapRef.current || !listings || listings.length === 0 || directionListing) return;
    const map = mapRef.current;
    const L = LRef.current;

    if (searchQuery && searchQuery.trim().length > 0) {
      if (listings.length === 1) {
        const single = listings[0];
        if (map.flyTo) {
          map.flyTo({ center: [single.lng, single.lat], zoom: 15.5, speed: 1.2 });
        } else if (map.panTo) {
          map.panTo([single.lat, single.lng]);
        }
      } else if (listings.length > 1) {
        let minLng = listings[0].lng, maxLng = listings[0].lng;
        let minLat = listings[0].lat, maxLat = listings[0].lat;
        listings.forEach(j => {
          if (j.lng < minLng) minLng = j.lng;
          if (j.lng > maxLng) maxLng = j.lng;
          if (j.lat < minLat) minLat = j.lat;
          if (j.lat > maxLat) maxLat = j.lat;
        });

        if (map.fitBounds) {
          map.fitBounds(
            [[minLng, minLat], [maxLng, maxLat]],
            { padding: 45, maxZoom: 16, duration: 600 }
          );
        } else if (L && map.fitBounds) {
          map.fitBounds(
            L.latLngBounds(listings.map(j => [j.lat, j.lng])),
            { padding: [45, 45], maxZoom: 16 }
          );
        }
      }
    }
  }, [listings, searchQuery, directionListing]);

  const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);

  // Fly to selected listing or draw real turn-by-turn road route to direction listing
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = LRef.current;

    // Handle Real Road Direction Route
    if (directionListing) {
      lastFocusedListingIdRef.current = null;
      const userLat = userCoords[0];
      const userLng = userCoords[1];
      const houseLat = directionListing.lat;
      const houseLng = directionListing.lng;

      let isCancelled = false;

      fetchRealRoadRoute(userLat, userLng, houseLat, houseLng).then(routeData => {
        if (isCancelled || !mapRef.current) return;

        setRouteInfo({
          distanceText: routeData.distanceText,
          durationText: routeData.durationText
        });

        const coordinates = routeData.coordinates; // [[lng, lat], ...]
        lastCoordinatesRef.current = coordinates;

        // 1. Draw Real Road Route in Leaflet
        if (L && map.addLayer) {
          if (routeLineRef.current) {
            try { routeLineRef.current.remove(); } catch (_) { }
          }

          const latLngs = coordinates.map(([lng, lat]) => [lat, lng]);

          // Draw main road polyline following actual streets and lanes
          const line = L.polyline(latLngs, {
            color: "#C04A22",
            weight: 6,
            opacity: 0.95,
            lineJoin: "round",
            lineCap: "round"
          }).addTo(map);

          routeLineRef.current = line;

          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [55, 55], maxZoom: 16 });
        } else if (map.getSource) {
          // 2. Draw Real Road Route in BariKoi GL / MapLibre
          const routeGeoJson: any = {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: coordinates
            }
          };

          if (map.getSource("direction-route")) {
            map.getSource("direction-route").setData(routeGeoJson);
          } else {
            try {
              map.addSource("direction-route", {
                type: "geojson",
                data: routeGeoJson
              });

              // Casing (White outer glow for prominent road line)
              map.addLayer({
                id: "direction-route-casing",
                type: "line",
                source: "direction-route",
                layout: {
                  "line-join": "round",
                  "line-cap": "round"
                },
                paint: {
                  "line-color": "#ffffff",
                  "line-width": 9,
                  "line-opacity": 0.95
                }
              });

              // Main Road Polyline
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
                  "line-width": 6,
                  "line-opacity": 1
                }
              });
            } catch (_) { }
          }

          // Calculate exact bounds from road coordinates
          let minLng = coordinates[0][0], maxLng = coordinates[0][0];
          let minLat = coordinates[0][1], maxLat = coordinates[0][1];
          coordinates.forEach(([cLng, cLat]) => {
            if (cLng < minLng) minLng = cLng;
            if (cLng > maxLng) maxLng = cLng;
            if (cLat < minLat) minLat = cLat;
            if (cLat > maxLat) maxLat = cLat;
          });

          if (map.fitBounds) {
            map.fitBounds(
              [
                [minLng, minLat],
                [maxLng, maxLat]
              ],
              { padding: 75, maxZoom: 16, duration: 1200 }
            );
          }
        }
      });

      return () => {
        isCancelled = true;
      };
    } else {
      setRouteInfo(null);
      // Clear route line if direction cancelled
      if (routeLineRef.current) {
        try { routeLineRef.current.remove(); } catch (_) { }
        routeLineRef.current = null;
      }
      if (map.getSource && map.getSource("direction-route")) {
        try {
          map.getSource("direction-route").setData({
            type: "FeatureCollection",
            features: []
          });
        } catch (_) { }
      }

      // If no direction, fly to selected listing ONLY if ID has actually changed (prevents auto-snapping on pan/touch)
      if (selectedListing) {
        if (lastFocusedListingIdRef.current !== selectedListing.id) {
          lastFocusedListingIdRef.current = selectedListing.id;
          const yOffset = cardPlacement === "top" ? 75 : -75;
          if (map.flyTo) {
            map.flyTo({
              center: [selectedListing.lng, selectedListing.lat],
              offset: [0, yOffset],
              zoom: 15.5,
              duration: 1200,
              essential: true
            });
          } else if (map.panTo && typeof map.project === "function" && typeof map.unproject === "function") {
            const pt = map.project([selectedListing.lat, selectedListing.lng], map.getZoom()).add([0, -yOffset]);
            map.panTo(map.unproject(pt, map.getZoom()), { animate: true, duration: 1.0 });
          } else if (map.panTo) {
            map.panTo([selectedListing.lat, selectedListing.lng], { animate: true, duration: 1.0 });
          }
        }
      } else {
        lastFocusedListingIdRef.current = null;
      }
    }
  }, [directionListing, selectedListing, userCoords, cardPlacement]);

  // Zoom Controls
  const handleZoomIn = () => {
    if (!mapRef.current) return;
    if (mapRef.current.zoomIn) mapRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (!mapRef.current) return;
    if (mapRef.current.zoomOut) mapRef.current.zoomOut();
  };
  const handleReset = () => {
    onNavigationClick();
    if (mapRef.current) {
      if (mapRef.current.flyTo) {
        mapRef.current.flyTo({ center: [userCoords[1], userCoords[0]], zoom: isScrolled ? 14.8 : 15.5, speed: 1.5 });
      } else if (mapRef.current.setView) {
        mapRef.current.setView(userCoords, isScrolled ? 14.8 : 15.5);
      }
    }
  };

  const [travelMode, setTravelMode] = useState<"car" | "bike" | "walk">("car");
  const [isNavCardMinimized, setIsNavCardMinimized] = useState(false);

  // Re-open card whenever a new direction listing is selected
  useEffect(() => {
    if (directionListing) {
      setIsNavCardMinimized(false);
    }
  }, [directionListing]);

  // Smoothly sync map size and camera with bottom sheet up/down motion (60fps continuous WebGL resize)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (directionListing && lastCoordinatesRef.current && lastCoordinatesRef.current.length > 0) {
      const coords = lastCoordinatesRef.current;
      if (map.fitBounds) {
        let minLng = coords[0][0], maxLng = coords[0][0];
        let minLat = coords[0][1], maxLat = coords[0][1];
        coords.forEach(([cLng, cLat]) => {
          if (cLng < minLng) minLng = cLng;
          if (cLng > maxLng) maxLng = cLng;
          if (cLat < minLat) minLat = cLat;
          if (cLat > maxLat) maxLat = cLat;
        });
        map.fitBounds(
          [[minLng, minLat], [maxLng, maxLat]],
          { padding: isScrolled ? 35 : 55, maxZoom: 16.5, duration: 300 }
        );
      } else if (LRef.current && map.fitBounds) {
        const latLngs = coords.map(([lng, lat]) => [lat, lng]);
        const bounds = LRef.current.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 16.5 });
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
  }, [directionListing, isNavCardMinimized, isScrolled, sheetMode, userCoords, selectedListing]);

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
      {/* ── MAP CONTAINER (Dynamic Height depending on scroll & route state) ── */}
      <div
        style={dragMapHeight !== null && dragMapHeight !== undefined ? { height: `${dragMapHeight}px`, transition: 'none' } : undefined}
        className={`relative w-full ${dragMapHeight !== null && dragMapHeight !== undefined ? '' : 'transition-[height] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]'} ${directionListing
            ? isNavCardMinimized
              ? "h-[380px] sm:h-[470px] md:h-[530px] lg:h-[590px]"
              : "h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px]"
            : sheetMode === "full"
              ? "h-0 overflow-hidden"
              : isScrolled
                ? "h-[380px] sm:h-[400px] md:h-[420px] lg:h-[440px]"
                : "h-[520px] sm:h-[550px] md:h-[580px] lg:h-[620px]"
          }`}
      >
        <div ref={containerRef} className="w-full h-full" />

        {/* ── Selected Housing Card Overlay on Marker Click (Compact & Dynamically Positioned) ── */}
        {markerClickedListing && !directionListing && sheetMode !== "full" && (
          <div
            className={`absolute z-[9999999] w-[275px] sm:w-[315px] bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden duration-200 pointer-events-auto left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 ${
              cardPlacement === "top"
                ? "top-3 sm:top-4 animate-in slide-in-from-top-3"
                : "bottom-3 sm:bottom-4 animate-in slide-in-from-bottom-3"
            }`}
          >
            {/* Banner Image with Purpose, Agency & Distance Badges */}
            <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-slate-100">
              <img
                src={markerClickedListing.image}
                alt={markerClickedListing.title}
                className="w-full h-full object-cover"
              />
              {/* Top Right: Purpose Badge & Close button */}
              <div className="absolute top-1.5 right-1.5 flex items-center gap-1.5">
                <div className={`px-2 py-0.5 rounded-full text-white text-[10px] font-bold shadow-xs border ${
                  markerClickedListing.purpose === "Rent"
                    ? "bg-emerald-600 border-emerald-700/60"
                    : "bg-indigo-600 border-indigo-700/60"
                }`}>
                  For {markerClickedListing.purpose}
                </div>
                <button
                  onClick={() => setMarkerClickedListing(null)}
                  className="w-6 h-6 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 flex items-center justify-center shadow transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Top Left: Agency Badge */}
              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-bold border border-slate-200/60 shadow-xs">
                <span className="truncate max-w-[120px]">{markerClickedListing.agency}</span>
              </div>

              {/* Bottom Left: Distance Badge on Image */}
              <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1 shadow-xs">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{markerClickedListing.distance}</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-2.5 sm:p-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight line-clamp-1">
                {markerClickedListing.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 truncate">
                {markerClickedListing.location} • {markerClickedListing.beds} • {markerClickedListing.sqft}
              </p>

              {/* Price Pill */}
              <div className="mt-1">
                <span className="text-[11px] sm:text-xs font-bold text-[#C04A22] inline-block">
                  {markerClickedListing.price}
                </span>
              </div>

              {/* Action Buttons: Direction & Details (Icon Only) */}
              <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMarkerClickedListing(null);
                    onShowDirection(markerClickedListing);
                  }}
                  className="flex-1 py-1.5 text-[#C04A22] font-bold transition flex items-center justify-center cursor-pointer active:scale-95 hover:opacity-70"
                  title="Direction"
                  aria-label="Direction"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#C04A22]" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onViewDetails?.(markerClickedListing);
                  }}
                  className="flex-1 py-1.5 text-[#C04A22] font-bold transition flex items-center justify-center cursor-pointer active:scale-95 hover:opacity-70"
                  title="Details"
                  aria-label="Details"
                >
                  <Info className="w-3.5 h-3.5 text-[#C04A22]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Center Permission Prompt: Left Allow, Right X (Deny) */}
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

        {/* Map Controls: Floating Navigation Button */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex flex-col items-center gap-2 pointer-events-auto">
          {/* Floating Navigation Button */}
          <button
            onClick={handleReset}
            disabled={isLocating}
            className={`w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full shadow-md border transition-all cursor-pointer active:scale-95 disabled:opacity-75 flex items-center justify-center ${
              isLocationGranted
                ? "bg-[#D85A30] text-white border-[#D85A30] shadow-[#D85A30]/30"
                : "bg-white/95 backdrop-blur-md text-slate-700 hover:text-[#D85A30] border-slate-200/90"
            }`}
            title={isLocationGranted ? "Live Location Active (Click to Turn OFF)" : "Turn ON Live Location (GPS)"}
          >
            {isLocating ? (
              <Loader2 className={`w-3.5 h-3.5 animate-spin ${isLocationGranted ? "text-white" : "text-[#D85A30]"}`} />
            ) : (
              <Navigation className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isLocationGranted ? "text-white fill-current" : "text-slate-700 hover:text-[#D85A30]"}`} />
            )}
          </button>
        </div>
      </div>

      {/* ── ROUTE NAVIGATION CARD (Outside Map Canvas - Sits directly below the map!) ── */}
      {directionListing && (
        <div className="w-full bg-[#FAFAFA] border-t border-slate-200/90 px-3 py-3 sm:px-4 sm:py-3.5 transition-all duration-150 ease-out">
          {/* 1. Minimized Route Bar */}
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
            /* 2. Expanded Route Navigation Card */
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
                    <MapPin className="w-3.5 h-3.5 text-[#C04A22] flex-shrink-0" />
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
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${travelMode === "car"
                      ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/25 shadow-2xs"
                      : "bg-slate-100/90 hover:bg-[#C04A22]/8 text-slate-600 hover:text-[#8C3015] border border-transparent"
                    }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Car</span>
                </button>
                <button
                  onClick={() => setTravelMode("bike")}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${travelMode === "bike"
                      ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/25 shadow-2xs"
                      : "bg-slate-100/90 hover:bg-[#C04A22]/8 text-slate-600 hover:text-[#8C3015] border border-transparent"
                    }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Bike</span>
                </button>
                <button
                  onClick={() => setTravelMode("walk")}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${travelMode === "walk"
                      ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/25 shadow-2xs"
                      : "bg-slate-100/90 hover:bg-[#C04A22]/8 text-slate-600 hover:text-[#8C3015] border border-transparent"
                    }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Walking</span>
                </button>
              </div>

              {/* 3 Stats Metric Grid (Time, Distance, Cost) */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                {/* Time */}
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

                {/* Distance */}
                <div className="bg-slate-50/90 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {directionListing.distanceKm.toFixed(1)} km
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">Distance</div>
                </div>

                {/* Cost */}
                <div className="bg-slate-50/90 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    ${(directionListing.distanceKm * 0.16 + 0.45).toFixed(2)}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">Cost</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Live Housing Page ─────────────────────────────────────────────────

export function Housing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || searchParams.get("query") || location.state?.searchQuery || ""
  );

  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("query") || location.state?.searchQuery;
    if (q !== undefined && q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams, location.state]);

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState<LiveHousingListing | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Permission State: "prompt", "granted", or "denied"
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<"prompt" | "granted" | "denied">("prompt");
  const [isLocationGranted, setIsLocationGranted] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem("bkoi_last_user_coords");
    } catch (_) {
      return false;
    }
  });
  const [showPermissionPrompt, setShowPermissionPrompt] = useState<boolean>(false);

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

  const [userLocationName, setUserLocationName] = useState<string>(initialLoc.name);
  const [userArea, setUserArea] = useState<string>(initialLoc.area);
  const [userCity, setUserCity] = useState<string>(initialLoc.city);

  // Dynamic Live Housing List strictly positioned around user's location
  const [liveHousing, setLiveHousing] = useState<LiveHousingListing[]>(() => {
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
    return generateLiveLocationHousing(coords[0], coords[1], initialLoc.area, initialLoc.city);
  });

  // Keep listings accurately synced with user's real area without ever moving to default location on nav off
  useEffect(() => {
    try {
      const cached = localStorage.getItem("bkoi_last_user_coords");
      if (cached) {
        const [lat, lng] = JSON.parse(cached);
        if (!isNaN(lat) && !isNaN(lng)) {
          fetchBariKoiReverseGeocode(lat, lng).then(geo => {
            if (geo) {
              const area = geo.area || geo.sub_district || "Your Location";
              const city = geo.city || "Live City";
              setUserLocationName(geo.address || `${area}, ${city}`);
              setUserArea(area);
              setUserCity(city);
              try {
                localStorage.setItem("bkoi_last_user_area", area);
                localStorage.setItem("bkoi_last_user_city", city);
              } catch (_) {}
              setLiveHousing(generateLiveLocationHousing(lat, lng, area, city));
            }
          });
        }
      }
    } catch (_) {}
  }, []);

  const [selectedListing, setSelectedListing] = useState<LiveHousingListing | null>(null);
  const [directionListing, setDirectionListing] = useState<LiveHousingListing | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleSelectListing = useCallback((listing: LiveHousingListing | null) => {
    setSelectedListing(listing);
  }, []);

  // Deep linking: auto-focus and show details if opened via shared link
  const sharedId = searchParams.get("id") || searchParams.get("houseId");

  useEffect(() => {
    if (!sharedId) return;
    const target = liveHousing.find(h => String(h.id) === String(sharedId) || String(h.id) === `house-${sharedId}`);
    if (target) {
      setSelectedListing(target);
      setShowDetailsModal(target);
      setUserCoords([target.lat, target.lng]);
    }
  }, [sharedId, liveHousing]);

  // Filter Housing based on Search Query & Filter Pills
  const filteredHousing = liveHousing.filter(listing => {
    // Smart Sentence / Multi-Word Keyword Search Query
    if (searchQuery.trim() && !matchHousingQuery(listing, searchQuery)) {
      return false;
    }

    // Filter Pills: all | nearby | rent | purchase
    if (activeFilter === "nearby" && !listing.isNearby) return false;
    if (activeFilter === "rent" && listing.purpose !== "Rent") return false;
    if (activeFilter === "purchase" && listing.purpose !== "Purchase") return false;

    return true;
  });

  const nearbyHousing = filteredHousing.filter(j => j.isNearby);

  const [sheetMode, setSheetMode] = useState<"expanded" | "mid" | "full">("expanded");
  const [dragMapHeight, setDragMapHeight] = useState<number | null>(null);
  const cardListRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startDragYRef = useRef<number>(0);
  const startMapHeightRef = useRef<number>(0);

  // Uber-style 1:1 real-time drag tracking for mouse & touch
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const mapEl = document.getElementById("housing-map-section")?.querySelector(".relative.w-full");
    const isMobile = window.innerWidth < 640;
    const minH = 0; // User can drag card all the way to the top of the map!
    const midH = isMobile ? 380 : 400;
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
      setSheetMode("expanded");
      listTouchStartYRef.current = null;
    }
  };

  const handleListTouchEnd = () => {
    listTouchStartYRef.current = null;
  };

  // Card list scroll detection for instant hide/show of bottom navigation bar
  const lastCardScrollYRef = useRef(0);

  const handleCardListScroll = () => {
    if (!cardListRef.current) return;
    const currentY = cardListRef.current.scrollTop;

    // At top of list, always show nav bar
    if (currentY <= 15) {
      window.dispatchEvent(new CustomEvent("nav-visibility", { detail: { visible: true } }));
      lastCardScrollYRef.current = currentY;
      return;
    }

    const diff = currentY - lastCardScrollYRef.current;

    // Scrolling down -> instantly hide bottom nav bar like Home Feed!
    if (diff > 4) {
      window.dispatchEvent(new CustomEvent("nav-visibility", { detail: { visible: false } }));
      if (sheetMode === "expanded") {
        setSheetMode("mid");
        setIsScrolled(true);
      }
    } else if (diff < -4) {
      // Scrolling up -> instantly bring back bottom nav bar!
      window.dispatchEvent(new CustomEvent("nav-visibility", { detail: { visible: true } }));
    }

    lastCardScrollYRef.current = currentY;
  };

  // Request Live GPS Location strictly from device GPS when navigation button is clicked
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

        setLocationPermissionStatus("granted");
        setIsLocationGranted(true);
        setShowPermissionPrompt(false);
        setUserCoords([lat, lng]);

        try {
          localStorage.setItem("bkoi_last_user_coords", JSON.stringify([lat, lng]));
        } catch (_) { }

        // Fetch real address from BariKoi Reverse Geocode API
        const geoResult = await fetchBariKoiReverseGeocode(lat, lng);
        if (geoResult) {
          const area = geoResult.area || geoResult.sub_district || "Your Location";
          const city = geoResult.city || "Live City";
          setUserLocationName(geoResult.address || `${area}, ${city}`);
          setUserArea(area);
          setUserCity(city);

          // Generate properties around exact live coordinates
          const generated = generateLiveLocationHousing(lat, lng, area, city);
          setLiveHousing(generated);
        } else {
          const generated = generateLiveLocationHousing(lat, lng, "Near You", "Live City");
          setLiveHousing(generated);
        }
        setIsLocating(false);
      },
      async (error) => {
        // If high accuracy fails on desktop/mac, retry once with standard accuracy
        if (highAccuracy) {
          executeGeolocation(false);
          return;
        }
        console.warn("Device geolocation error, attempting real IP geolocation fallback:", error.code, error.message);

        let fallbackLat = defaultCoords[0];
        let fallbackLng = defaultCoords[1];
        let areaName = initialLoc.area;
        let cityName = initialLoc.city;

        // Try IP Geolocation lookup
        try {
          const res = await fetch("https://ipwho.is/");
          if (res.ok) {
            const data = await res.json();
            if (data?.success && typeof data.latitude === "number" && typeof data.longitude === "number") {
              fallbackLat = data.latitude;
              fallbackLng = data.longitude;
              cityName = data.city || initialLoc.city;
              areaName = data.region || initialLoc.area;
            }
          }
        } catch (_) {
          try {
            const cached = localStorage.getItem("bkoi_last_user_coords");
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length === 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
                fallbackLat = parsed[0];
                fallbackLng = parsed[1];
              }
            }
          } catch (_) {}
        }

        try {
          localStorage.setItem("bkoi_last_user_coords", JSON.stringify([fallbackLat, fallbackLng]));
        } catch (_) {}

        setLocationPermissionStatus("granted");
        setIsLocationGranted(true);
        setShowPermissionPrompt(false);
        setUserCoords([fallbackLat, fallbackLng]);
        setUserLocationName(`${areaName}, ${cityName}`);
        setUserArea(areaName);
        setUserCity(cityName);
        setLiveHousing(generateLiveLocationHousing(fallbackLat, fallbackLng, areaName, cityName));
        setIsLocating(false);
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 4000 : 8000,
        maximumAge: 60000
      }
    );
  }, [defaultCoords, initialLoc]);

  // Direction Handler (Sets direction & displays route without jumping scroll position)
  const handleShowDirection = useCallback((listing: LiveHousingListing) => {
    setDirectionListing(listing);
    setSelectedListing(listing);
  }, []);

  // Navigation Button Click Handler (Turn ON / Turn OFF Toggle)
  const handleNavigationClick = useCallback(() => {
    if (isLocationGranted) {
      // Turn OFF Location live GPS tracker, but KEEP userCoords and service cards in place!
      setIsLocationGranted(false);
      setLocationPermissionStatus("prompt");
      setShowPermissionPrompt(false);
      setDirectionListing(null);
    } else {
      // Turn ON Location (Direct device permission request)
      executeGeolocation(true);
    }
  }, [isLocationGranted, executeGeolocation]);

  const toggleSave = (id: string) => {
    setSavedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <AppLayout noPad={true}>
      <div className="w-full h-[100dvh] lg:h-[100vh] flex flex-col overflow-hidden bg-[#FAFAFA]">
        {/* ── TOP STICKY BAR: Search Housing & Filter ───────────────────────── */}
        <div className="flex-shrink-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-2.5 py-1.5 sm:px-5 sm:py-2 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => navigate(-1)}
              className="w-7.5 h-7.5 sm:w-8 sm:h-8 flex items-center justify-center rounded-md sm:rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex-shrink-0"
              title="Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Clean rounded search bar */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="search 2-bhk flat, studio, rent, purchase, agency..."
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

          {/* Short & Understandable Filter Pills */}
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 pb-0.5">
            {[
              { id: "all", label: "All Properties" },
              { id: "nearby", label: "Nearby" },
              { id: "rent", label: "Rent" },
              { id: "purchase", label: "Purchase" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${activeFilter === f.id
                    ? "bg-[#C04A22] text-white shadow-xs font-semibold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── BARIKOI LIVE MAP (EXPANDED / COMPACT STICKY HEIGHT - NICHE/UNDERNEATH) ────── */}
        <div
          id="housing-map-section"
          className={`w-full max-w-7xl mx-auto px-0 flex-shrink-0 z-10 transition-[height] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            sheetMode === "full" && dragMapHeight === null ? "h-0 overflow-hidden" : ""
          }`}
        >
          <div className="rounded-none overflow-hidden border-b border-slate-200/90 shadow-xs bg-white">
            <BariKoiLiveHousingMap
              userCoords={userCoords}
              isLocationGranted={isLocationGranted}
              listings={filteredHousing}
              selectedListing={selectedListing}
              onSelectListing={handleSelectListing}
              onNavigationClick={handleNavigationClick}
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
              savedIds={savedIds}
              onToggleSave={toggleSave}
              isScrolled={isScrolled}
              sheetMode={sheetMode}
              dragMapHeight={dragMapHeight}
              searchQuery={searchQuery}
              countryCode={countryCode}
            />
          </div>
        </div>

        {/* ── MAIN HOUSING DIRECTORY CONTENT (BOTTOM SHEET) ── */}
        <div className="flex-1 min-h-0 flex flex-col max-w-7xl w-full mx-auto px-0 relative z-20 bg-[#FAFAFA] rounded-none shadow-[0_-6px_25px_rgba(0,0,0,0.06)] border-t border-slate-200/80 -mt-px">
          {/* ── PERSISTENT DRAG HANDLE & FILTER HEADER (NEVER HIDES! Jekhanei jak na keno) ── */}
          <div className="flex-shrink-0 z-30 bg-[#FAFAFA] rounded-none pt-2 sm:pt-3 pb-2.5 px-4 sm:px-6">
            {/* Uber-style pull handle indicator (Live 1:1 mouse/touch drag tracker) */}
            <div
              onPointerDown={handlePointerDown}
              className="w-full flex items-center justify-center py-2.5 cursor-grab active:cursor-grabbing select-none group touch-none"
            >
              <div className="w-12 h-1.5 bg-slate-300 group-hover:bg-slate-400 active:bg-slate-500 rounded-full transition-colors" />
            </div>
            {/* Controls Bar: Filter Options */}
            <div className="flex items-center justify-between gap-3 max-w-md w-full">
              {/* Filter Option Buttons */}
              <div className="grid grid-cols-2 gap-2.5 w-full">
                {/* Left Option: Nearby Properties */}
                <div
                  onClick={() => setActiveFilter(activeFilter === "nearby" ? "all" : "nearby")}
                  className={`py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-lg border transition-all cursor-pointer text-center sm:text-left ${
                    activeFilter === "nearby"
                      ? "bg-orange-100/70 border-transparent shadow-xs"
                      : "bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-xs"
                  }`}
                >
                  <div className={`text-xs sm:text-sm leading-tight ${activeFilter === "nearby" ? "font-semibold text-[#8C3015]" : "font-normal text-slate-800"}`}>
                    {nearbyHousing.length} properties nearby
                  </div>
                </div>

                {/* Right Option: Full State Properties */}
                <div
                  onClick={() => setActiveFilter("all")}
                  className={`py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-lg border transition-all cursor-pointer text-center sm:text-left ${
                    activeFilter === "all"
                      ? "bg-orange-100/70 border-transparent shadow-xs"
                      : "bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-xs"
                  }`}
                >
                  <div className={`text-xs sm:text-sm leading-tight ${activeFilter === "all" ? "font-semibold text-[#8C3015]" : "font-normal text-slate-800"}`}>
                    {liveHousing.length} full state properties
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SCROLLABLE LIST OF HOUSING CARDS (Scrolls underneath persistent header) ── */}
          <div
            ref={cardListRef}
            onScroll={handleCardListScroll}
            onTouchStart={handleListTouchStart}
            onTouchMove={handleListTouchMove}
            onTouchEnd={handleListTouchEnd}
            className="flex-1 min-h-0 overflow-y-auto px-0 pb-24"
          >
            {/* Equal Grid of Housing Cards (Consistent positioning & equal heights on both sides) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-0 sm:gap-5 items-stretch pt-1">
            {(activeFilter === "nearby" ? nearbyHousing : filteredHousing).map(listing => {
              const isSelected = selectedListing?.id === listing.id;
              const isSaved = savedIds.includes(listing.id);
              const isRent = listing.purpose === "Rent";

              return (
                <div
                  key={listing.id}
                  data-listing-id={listing.id}
                  ref={el => {
                    if (el) cardRefs.current.set(listing.id, el);
                    else cardRefs.current.delete(listing.id);
                  }}
                  onClick={() => handleSelectListing(listing)}
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
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      {/* Top Right: Purpose Badge (Rent / Purchase) */}
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-xs border ${
                        isRent
                          ? "bg-emerald-600 text-white border-emerald-700/60"
                          : "bg-indigo-600 text-white border-indigo-700/60"
                      }`}>
                        For {listing.purpose}
                      </div>

                      {/* Bottom Left: Distance Badge */}
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {listing.distance}
                      </div>

                      {/* Top Left: Share & Bookmark Save Buttons */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-[2]">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const url = buildMapShareUrl({
                              id: listing.id,
                              title: listing.title,
                              lat: listing.lat,
                              lng: listing.lng,
                              category: `🏠 Housing (${listing.purpose})`,
                              address: listing.location,
                              image: listing.image,
                              phone: listing.contactPhone,
                              description: `${listing.propertyType} • ${listing.beds} • ${listing.price}`,
                            });
                            await shareOrCopy({
                              title: listing.title,
                              text: `Check out ${listing.title} on Pathasathi Map!`,
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
                            toggleSave(listing.id);
                          }}
                          className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-[#C04A22] transition shadow-xs cursor-pointer"
                          title={isSaved ? "Saved" : "Save Property"}
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
                        {listing.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                        {listing.agency} • {listing.location}
                      </p>

                      {/* Specification Chips (Beds, Baths, Sqft) */}
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1">
                          <Bed className="w-3 h-3 text-[#C04A22]" />
                          {listing.beds}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1">
                          <Bath className="w-3 h-3 text-[#C04A22]" />
                          {listing.baths}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1">
                          <Maximize2 className="w-3 h-3 text-[#C04A22]" />
                          {listing.sqft}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mt-2.5">
                        <span className="text-xs sm:text-sm font-bold text-[#C04A22] inline-block">
                          {listing.price}
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
                          handleShowDirection(listing);
                        }}
                        className="flex-1 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 text-[#C04A22] font-bold transition flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
                        title="Direction"
                        aria-label="Direction"
                      >
                        <Navigation className="w-4 h-4 text-[#C04A22]" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setShowDetailsModal(listing);
                        }}
                        className="flex-1 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 text-[#C04A22] font-bold transition flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
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
        </div>
      </div>

        {/* ── HOUSING DETAILS & CONTACT MODAL ───────────────────────────────── */}
        <HousingDetailsModal
          listing={showDetailsModal}
          onClose={() => setShowDetailsModal(null)}
          savedIds={savedIds}
          onToggleSave={toggleSave}
        />

      </div>
    </AppLayout>
  );
}
