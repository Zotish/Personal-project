import React, { useEffect, useRef, useState, useCallback } from "react";
import { Navigation, Loader2, ChevronDown } from "lucide-react";
import type { TransitStation, TransitCategory, TransitRide } from "../../data/transportationData";
import {
  BARIKOI_API_KEY,
  loadBkoiGL,
  getMapStyleForLocation,
  bariKoiTransformRequest,
  attachMapboxFallbackOnError,
  setupMapWatermark,
} from "../../services/mapboxService";

interface TransportationInteractiveMapProps {
  category: TransitCategory | "all";
  stations: TransitStation[];
  fromStation: TransitStation | null;
  toStation: TransitStation | null;
  userCoords: [number, number] | null;
  onSelectStationAsFrom?: (station: TransitStation) => void;
  onSelectStationAsTo?: (station: TransitStation) => void;
  onSelectStation?: (station: TransitStation) => void;
  routeCoords?: [number, number][];
  rides?: TransitRide[];
  onSelectRide?: (ride: TransitRide) => void;
  onExpandBottomSheet?: () => void;
  className?: string;
  onRequestLocation?: () => void;
  isLocating?: boolean;
  dragMapHeight?: number | null;
  sheetMode?: "expanded" | "mid" | "full";
  isScrolled?: boolean;
}

// Convert geographic coordinates to screen pixel points
function getStationScreenPoint(map: any, coords: [number, number]): { x: number; y: number } | null {
  if (!map) return null;
  try {
    if (typeof map.project === "function") {
      // MapLibre / bkoi-gl: takes [lng, lat]
      const pt = map.project([coords[1], coords[0]]);
      return { x: pt.x, y: pt.y };
    }
    if (typeof map.latLngToContainerPoint === "function") {
      // Leaflet: takes [lat, lng]
      const pt = map.latLngToContainerPoint(coords);
      return { x: pt.x, y: pt.y };
    }
  } catch (_) {}
  return null;
}

export function TransportationInteractiveMap({
  category,
  stations,
  fromStation,
  toStation,
  userCoords,
  onSelectStationAsFrom,
  onSelectStationAsTo,
  onSelectStation,
  routeCoords,
  rides = [],
  onSelectRide,
  onExpandBottomSheet,
  className = "w-full h-full",
  onRequestLocation,
  isLocating = false,
  dragMapHeight,
  sheetMode,
  isScrolled,
}: TransportationInteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const bkoiRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const leafletGroupRef = useRef<any>(null);
  const leafletPolylineRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const watermarkRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);

  const [mapReady, setMapReady] = useState(false);
  const [showSourceDepartures, setShowSourceDepartures] = useState(false);
  const [sourceAnchorPoint, setSourceAnchorPoint] = useState<{ x: number; y: number } | null>(null);

  // Default center: From station coords, or user coords, or Northeast Transit Corridor
  const defaultCenter: [number, number] = fromStation
    ? fromStation.coords
    : userCoords || [40.7505, -73.9934];

  // Helper to re-calculate source station on-screen pixel position
  const updateSourceAnchor = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !fromStation) return;
    const pt = getStationScreenPoint(map, fromStation.coords);
    if (pt) {
      setSourceAnchorPoint(pt);
    }
  }, [fromStation]);

  // Handle station pin click: always focus station as source and open its departures list directly beneath it
  const handleStationPinClick = useCallback(
    (st: TransitStation, activeMap: any) => {
      // If clicking the current origin station while open, toggle close
      if (fromStation?.id === st.id && showSourceDepartures) {
        setShowSourceDepartures(false);
        return;
      }

      // If clicking a different station, set it as fromStation
      if (fromStation?.id !== st.id) {
        if (toStation?.id === st.id && fromStation) {
          // Swap so previous origin becomes destination
          onSelectStationAsTo?.(fromStation);
        }
        onSelectStationAsFrom?.(st);
      }

      // Open departures directly beneath the clicked station
      setShowSourceDepartures(true);

      const pt = getStationScreenPoint(activeMap, st.coords);
      if (pt) {
        setSourceAnchorPoint(pt);
      }

      // Smooth camera centering with upward offset so the departures card fits comfortably below the pin
      if (activeMap.flyTo) {
        activeMap.flyTo({
          center: [st.coords[1], st.coords[0]],
          offset: [0, -70],
          duration: 500,
        });
      } else if (activeMap.panTo) {
        activeMap.panTo(st.coords);
      }

      if (onSelectStation) onSelectStation(st);
    },
    [fromStation, toStation, showSourceDepartures, onSelectStationAsFrom, onSelectStationAsTo, onSelectStation]
  );

  // Initialize BariKoi Map GL SDK (with clean Leaflet fallback)
  useEffect(() => {
    isMountedRef.current = true;
    let isCancelled = false;

    loadBkoiGL()
      .then((bkoigl) => {
        if (isCancelled || !mapContainerRef.current) return;

        const key = BARIKOI_API_KEY;
        if (bkoigl) {
          bkoigl.accessToken = key;
          bkoigl.apiKey = key;
        }

        const mapStyle = getMapStyleForLocation(defaultCenter[0], defaultCenter[1], "US");

        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (_) {}
          mapInstanceRef.current = null;
        }

        const map = new bkoigl.Map({
          container: mapContainerRef.current,
          center: [defaultCenter[1], defaultCenter[0]], // [lng, lat] for MapLibre/BariKoi
          zoom: 12.5,
          style: mapStyle,
          transformRequest: bariKoiTransformRequest,
          accessToken: key,
          apiKey: key,
          attributionControl: false,
        });

        // Gracefully handle missing sprite icons/layers from BariKoi vector style
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

        attachMapboxFallbackOnError(map, "US");
        const wm = setupMapWatermark(map, "barikoi");
        watermarkRef.current = wm;

        map.on("load", () => {
          if (isCancelled) return;
          mapInstanceRef.current = map;
          bkoiRef.current = bkoigl;
          setMapReady(true);
        });

        mapInstanceRef.current = map;
        bkoiRef.current = bkoigl;
      })
      .catch((err) => {
        console.warn("BariKoi GL init failed, using Leaflet fallback:", err);
        import("leaflet").then((LModule) => {
          if (isCancelled || !mapContainerRef.current) return;
          const L = LModule.default || LModule;
          LRef.current = L;

          try {
            delete (L.Icon.Default.prototype as any)._getIconUrl;
          } catch (_) {}

          if (mapInstanceRef.current) {
            try {
              mapInstanceRef.current.remove();
            } catch (_) {}
            mapInstanceRef.current = null;
          }

          const map = L.map(mapContainerRef.current!, {
            center: defaultCenter,
            zoom: 12.5,
            zoomControl: false,
            attributionControl: false,
          });

          L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://barikoi.com">BariKoi</a>',
          }).addTo(map);

          leafletGroupRef.current = L.layerGroup().addTo(map);
          mapInstanceRef.current = map;
          setupMapWatermark(map, "barikoi");
          setMapReady(true);
        });
      });

    return () => {
      isCancelled = true;
      isMountedRef.current = false;
      if (watermarkRef.current?.cleanup) {
        try {
          watermarkRef.current.cleanup();
        } catch (_) {}
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Synchronize Anchor Position with Map Movement & update on fromStation change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const handleMapMove = () => {
      updateSourceAnchor();
    };

    if (typeof map.on === "function") {
      map.on("move", handleMapMove);
      map.on("zoom", handleMapMove);
      map.on("click", (e: any) => {
        const target = e?.originalEvent?.target;
        if (target && (target.closest?.(".custom-station-pin") || target.closest?.(".user-gps-pulse"))) {
          return;
        }
        setShowSourceDepartures(false);
      });
    }

    updateSourceAnchor();

    return () => {
      if (typeof map.off === "function") {
        map.off("move", handleMapMove);
        map.off("zoom", handleMapMove);
      }
    };
  }, [mapReady, updateSourceAnchor]);

  useEffect(() => {
    updateSourceAnchor();
  }, [fromStation, updateSourceAnchor]);

  // Synchronize Markers, Route Polyline & Viewport
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    // In BariKoi GL, ensure style is loaded before mutating layers/sources
    if (typeof map.isStyleLoaded === "function" && !map.isStyleLoaded()) {
      map.once("styledata", () => {
        syncAll();
      });
      return;
    }

    syncAll();

    function syncAll() {
      const activeMap = mapInstanceRef.current;
      if (!activeMap) return;

      const isBkoi = !!activeMap.addSource;

      if (isBkoi) {
        // ─── 1. BariKoi GL (MapLibre) Markers ─────────────────────────────
        const bkoigl = bkoiRef.current || (window as any).bkoigl;
        const MarkerClass = bkoigl?.Marker || (window as any).maplibregl?.Marker;

        markersRef.current.forEach((m) => {
          try {
            m.remove();
          } catch (_) {}
        });
        markersRef.current = [];

        stations.forEach((st) => {
          const isFrom = fromStation?.id === st.id;
          const isTo = toStation?.id === st.id;

          let iconHtml = "";
          if (isFrom) {
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-emerald-400/40 transform transition-transform group-hover:scale-110">
                  <span class="text-xs">A</span>
                </div>
                <div class="mt-0.5 px-2 py-0.5 rounded-full bg-slate-900/90 text-white text-[10px] font-semibold whitespace-nowrap shadow-md">
                  ${st.code || st.name.split(" ")[0]}
                </div>
              </div>
            `;
          } else if (isTo) {
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="w-8 h-8 rounded-full bg-[#C04A22] text-white font-bold flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-[#C04A22]/40 transform transition-transform group-hover:scale-110">
                  <span class="text-xs">B</span>
                </div>
                <div class="mt-0.5 px-2 py-0.5 rounded-full bg-slate-900/90 text-white text-[10px] font-semibold whitespace-nowrap shadow-md">
                  ${st.code || st.name.split(" ")[0]}
                </div>
              </div>
            `;
          } else {
            const symbol =
              st.category === "bus" ? "🚌" : st.category === "train" ? "🚆" : "🚇";
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="w-7 h-7 rounded-full bg-white text-slate-800 text-xs flex items-center justify-center shadow-md border border-slate-300 transform transition-transform group-hover:scale-125">
                  ${symbol}
                </div>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] whitespace-nowrap shadow pointer-events-none">
                  ${st.name}
                </div>
              </div>
            `;
          }

          if (MarkerClass) {
            const el = document.createElement("div");
            el.className = "custom-station-pin";
            el.innerHTML = iconHtml;
            el.style.cursor = "pointer";
            el.addEventListener("click", (e) => {
              e.stopPropagation();
              handleStationPinClick(st, activeMap);
            });

            const marker = new MarkerClass({ element: el })
              .setLngLat([st.coords[1], st.coords[0]])
              .addTo(activeMap);
            markersRef.current.push(marker);
          }
        });

        // User location GPS beacon
        if (userMarkerRef.current) {
          try {
            userMarkerRef.current.remove();
          } catch (_) {}
          userMarkerRef.current = null;
        }

        if (userCoords && MarkerClass) {
          const userEl = document.createElement("div");
          userEl.className = "user-gps-pulse";
          userEl.innerHTML = `
            <div class="relative flex items-center justify-center w-6 h-6">
              <div class="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
              <div class="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
            </div>
          `;
          const userMarker = new MarkerClass({ element: userEl })
            .setLngLat([userCoords[1], userCoords[0]])
            .addTo(activeMap);
          userMarkerRef.current = userMarker;
        }

        // ─── 2. BariKoi GL Route Polyline ─────────────────────────────────
        if (fromStation && toStation) {
          const lineCoords: [number, number][] =
            routeCoords && routeCoords.length > 0
              ? routeCoords
              : [fromStation.coords, toStation.coords];

          const geojsonCoords = lineCoords.map(([lat, lng]) => [lng, lat]);

          const routeGeoJson: any = {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: geojsonCoords,
            },
          };

          const routeColor =
            category === "bus" ? "#0284C7" : category === "train" ? "#1E3A8A" : "#9333EA";

          if (activeMap.getSource("transit-route")) {
            activeMap.getSource("transit-route").setData(routeGeoJson);
            if (activeMap.getLayer("transit-route-line")) {
              activeMap.setPaintProperty("transit-route-line", "line-color", routeColor);
            }
          } else {
            try {
              activeMap.addSource("transit-route", {
                type: "geojson",
                data: routeGeoJson,
              });

              activeMap.addLayer({
                id: "transit-route-casing",
                type: "line",
                source: "transit-route",
                layout: {
                  "line-join": "round",
                  "line-cap": "round",
                },
                paint: {
                  "line-color": "#ffffff",
                  "line-width": 8,
                  "line-opacity": 0.95,
                },
              });

              const paintLine: any = {
                "line-color": routeColor,
                "line-width": 5,
                "line-opacity": 1,
              };
              if (category === "train") {
                paintLine["line-dasharray"] = [2, 1.5];
              }

              activeMap.addLayer({
                id: "transit-route-line",
                type: "line",
                source: "transit-route",
                layout: {
                  "line-join": "round",
                  "line-cap": "round",
                },
                paint: paintLine,
              });
            } catch (err) {
              console.warn("Failed to add route layer:", err);
            }
          }

          // Fit bounds to route
          if (activeMap.fitBounds && geojsonCoords.length > 0) {
            let minLng = geojsonCoords[0][0], maxLng = geojsonCoords[0][0];
            let minLat = geojsonCoords[0][1], maxLat = geojsonCoords[0][1];
            geojsonCoords.forEach(([lng, lat]) => {
              minLng = Math.min(minLng, lng);
              maxLng = Math.max(maxLng, lng);
              minLat = Math.min(minLat, lat);
              maxLat = Math.max(maxLat, lat);
            });

            activeMap.fitBounds(
              [
                [minLng, minLat],
                [maxLng, maxLat],
              ],
              {
                padding: { top: 60, bottom: 60, left: 60, right: 60 },
                maxZoom: 14,
                duration: 800,
              }
            );
          }
        } else {
          // Remove route if not both stations selected
          if (activeMap.getSource && activeMap.getSource("transit-route")) {
            try {
              if (activeMap.getLayer("transit-route-line")) activeMap.removeLayer("transit-route-line");
              if (activeMap.getLayer("transit-route-casing")) activeMap.removeLayer("transit-route-casing");
              activeMap.removeSource("transit-route");
            } catch (_) {}
          }

          if (fromStation && activeMap.flyTo) {
            activeMap.flyTo({
              center: [fromStation.coords[1], fromStation.coords[0]],
              zoom: 13.5,
              speed: 1.5,
            });
          }
        }
      } else {
        // ─── Leaflet Fallback Branch ──────────────────────────────────────
        const L = LRef.current;
        const group = leafletGroupRef.current;
        if (!L || !group) return;

        group.clearLayers();
        if (leafletPolylineRef.current) {
          try {
            leafletPolylineRef.current.remove();
          } catch (_) {}
          leafletPolylineRef.current = null;
        }

        stations.forEach((st) => {
          const isFrom = fromStation?.id === st.id;
          const isTo = toStation?.id === st.id;

          let iconHtml = "";
          if (isFrom) {
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-emerald-400/40 transform transition-transform group-hover:scale-110">
                  <span class="text-xs">A</span>
                </div>
                <div class="mt-0.5 px-2 py-0.5 rounded-full bg-slate-900/90 text-white text-[10px] font-semibold whitespace-nowrap shadow-md">
                  ${st.code || st.name.split(" ")[0]}
                </div>
              </div>
            `;
          } else if (isTo) {
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="w-8 h-8 rounded-full bg-[#C04A22] text-white font-bold flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-[#C04A22]/40 transform transition-transform group-hover:scale-110">
                  <span class="text-xs">B</span>
                </div>
                <div class="mt-0.5 px-2 py-0.5 rounded-full bg-slate-900/90 text-white text-[10px] font-semibold whitespace-nowrap shadow-md">
                  ${st.code || st.name.split(" ")[0]}
                </div>
              </div>
            `;
          } else {
            const symbol =
              st.category === "bus" ? "🚌" : st.category === "train" ? "🚆" : "🚇";
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="w-7 h-7 rounded-full bg-white text-slate-800 text-xs flex items-center justify-center shadow-md border border-slate-300 transform transition-transform group-hover:scale-125">
                  ${symbol}
                </div>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] whitespace-nowrap shadow pointer-events-none">
                  ${st.name}
                </div>
              </div>
            `;
          }

          const customIcon = L.divIcon({
            className: "custom-station-pin",
            html: iconHtml,
            iconSize: [40, 50],
            iconAnchor: [20, 25],
          });

          const marker = L.marker(st.coords, { icon: customIcon }).addTo(group);
          marker.on("click", (e: any) => {
            if (e?.originalEvent) e.originalEvent.stopPropagation();
            handleStationPinClick(st, activeMap);
          });
        });

        // User location
        if (userCoords) {
          if (userMarkerRef.current) {
            try {
              userMarkerRef.current.remove();
            } catch (_) {}
          }
          const userIcon = L.divIcon({
            className: "user-gps-pulse",
            html: `
              <div class="relative flex items-center justify-center w-6 h-6">
                <div class="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
                <div class="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });
          userMarkerRef.current = L.marker(userCoords, { icon: userIcon }).addTo(activeMap);
        }

        // Route line
        if (fromStation && toStation) {
          const lineCoords =
            routeCoords && routeCoords.length > 0
              ? routeCoords
              : [fromStation.coords, toStation.coords];

          L.polyline(lineCoords, {
            color: "#ffffff",
            weight: 8,
            opacity: 0.95,
            lineCap: "round",
          }).addTo(group);

          const routeColor =
            category === "bus" ? "#0284C7" : category === "train" ? "#1E3A8A" : "#9333EA";

          const polyline = L.polyline(lineCoords, {
            color: routeColor,
            weight: 5,
            opacity: 1,
            dashArray: category === "train" ? "8, 6" : undefined,
            lineCap: "round",
            lineJoin: "round",
          }).addTo(group);

          leafletPolylineRef.current = polyline;

          const bounds = L.latLngBounds(lineCoords);
          activeMap.fitBounds(bounds, {
            padding: [45, 45],
            maxZoom: 14,
            animate: true,
          });
        } else if (fromStation) {
          activeMap.flyTo(fromStation.coords, 13.5, { duration: 0.6 });
        }
      }
    }
  }, [stations, fromStation, toStation, userCoords, category, routeCoords, mapReady, handleStationPinClick]);

  // Safe canvas resizing
  const handleResize = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    try {
      if (typeof map.resize === "function") {
        map.resize();
      } else if (typeof map.invalidateSize === "function") {
        map.invalidateSize();
      }
    } catch (_) {}
    updateSourceAnchor();
  }, [updateSourceAnchor]);

  // ResizeObserver for canvas container
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const ro = new ResizeObserver(() => {
      handleResize();
    });
    ro.observe(mapContainerRef.current);
    return () => ro.disconnect();
  }, [handleResize]);

  // Real-time canvas resize during bottom sheet drag
  useEffect(() => {
    if (dragMapHeight === null || dragMapHeight === undefined) return;
    handleResize();
  }, [dragMapHeight, handleResize]);

  // Canvas resize after 300ms CSS height transition completes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleResize();
    }, 310);
    return () => clearTimeout(timer);
  }, [sheetMode, isScrolled, handleResize]);

  // Calculate anchored positions for the source departures card
  const containerWidth = mapContainerRef.current?.clientWidth || 360;
  const containerHeight = mapContainerRef.current?.clientHeight || 500;
  const cardWidth = Math.min(340, Math.max(280, containerWidth - 24));

  let cardTop = (sourceAnchorPoint?.y || 0) + 26;
  const idealLeft = (sourceAnchorPoint?.x || 0) - cardWidth / 2;
  const cardLeft = Math.max(12, Math.min(idealLeft, containerWidth - cardWidth - 12));
  const caretLeft = Math.max(16, Math.min((sourceAnchorPoint?.x || 0) - cardLeft, cardWidth - 16));

  if (cardTop + 240 > containerHeight) {
    cardTop = Math.max(12, containerHeight - 270);
  }

  return (
    <div className={`relative ${className} overflow-hidden bg-slate-100`}>
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Controls (Top-Right) Matching Jobs.tsx */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col items-center gap-2">
        {/* GPS / Navigation Compass Button */}
        {onRequestLocation && (
          <button
            onClick={onRequestLocation}
            disabled={isLocating}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-lg border-2 border-white transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
              userCoords
                ? "bg-[#C04A22] text-white shadow-[#C04A22]/40"
                : "bg-white/95 text-slate-700 hover:text-[#C04A22]"
            }`}
            title="Detect Nearest Station / Live GPS"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#C04A22]" />
            ) : (
              <Navigation className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white rotate-45" />
            )}
          </button>
        )}
      </div>

      {/* Guaranteed BariKoi Watermark Badge (Bottom-Left) */}
      <div className="absolute bottom-2.5 left-2.5 z-[400] pointer-events-auto select-none">
        <a
          href="https://barikoi.com"
          target="_blank"
          rel="noopener noreferrer"
          className="map-provider-watermark bkoi-watermark"
          title="Powered by BariKoi"
          aria-label="BariKoi logo"
        >
          <svg className="bkoi-pin-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#00A86B" />
            <path d="M12 6.5L8.5 9.7v4.3h2.2v-2.7h2.6v2.7h2.2V9.7L12 6.5z" fill="#FFFFFF" />
          </svg>
          <span className="brand-text">
            <span className="brand-dark">bari</span>
            <span className="brand-green">koi</span>
          </span>
        </a>
      </div>

      {/* ─── FLOATING DEPARTURES LIST DIRECTLY BENEATH SOURCE STATION PIN ─── */}
      {showSourceDepartures && fromStation && sourceAnchorPoint && (
        <div
          style={{
            position: "absolute",
            top: `${cardTop}px`,
            left: `${cardLeft}px`,
            width: `${cardWidth}px`,
          }}
          className="z-[450] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 p-3 sm:p-3.5 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Caret / Pointer pointing up to the Source Station pin */}
          <div
            style={{ left: `${caretLeft}px` }}
            className="absolute -top-1.5 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-200/90 rotate-45 shadow-2xs pointer-events-none"
          />

          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                  A
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Origin Station
                </span>
                {toStation && onSelectStationAsTo && onSelectStationAsFrom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const oldFrom = fromStation;
                      const oldTo = toStation;
                      onSelectStationAsFrom(oldTo);
                      onSelectStationAsTo(oldFrom);
                    }}
                    className="ml-1 text-[9px] font-bold text-slate-600 hover:text-[#C04A22] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer transition"
                    title="Swap Origin and Destination"
                  >
                    Swap ⇄
                  </button>
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
                {fromStation.name}
              </h4>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                <span>To:</span>
                <span className="font-semibold text-slate-700 truncate">
                  {toStation ? toStation.name : "Select Destination"}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSourceDepartures(false)}
              className="text-slate-400 hover:text-slate-700 text-xs p-1 rounded-md hover:bg-slate-100 transition cursor-pointer"
              title="Close departures"
            >
              ✕
            </button>
          </div>

          {/* Departures List Section */}
          <div className="mt-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
              <span>Available Departures ({rides?.length || 0})</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                {category.toUpperCase()}
              </span>
            </div>

            {rides && rides.length > 0 ? (
              <div className="space-y-2 max-h-[185px] overflow-y-auto pr-1">
                {rides.map((ride) => (
                  <div
                    key={ride.id}
                    onClick={() => onSelectRide?.(ride)}
                    className="bg-slate-50 hover:bg-slate-100/80 rounded-xl p-2.5 border border-slate-200/70 transition-all cursor-pointer group space-y-1"
                  >
                    {/* Row 1: Operator + Seats | Price */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {ride.operator}
                        </span>
                        {ride.seatsLeft && (
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                              ride.seatStatus === "critical"
                                ? "text-red-700 bg-red-50 border border-red-200"
                                : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                            }`}
                          >
                            {ride.seatsLeft} seats
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm font-black text-slate-900 shrink-0">
                        ${ride.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Row 2: Times & Duration | Book */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium min-w-0">
                        <span className="font-bold text-slate-900 whitespace-nowrap">
                          {ride.departureTime} – {ride.arrivalTime}
                        </span>
                        <span className="text-slate-400 text-[10px] whitespace-nowrap">
                          {ride.duration}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRide?.(ride);
                        }}
                        className="px-3 py-0.5 rounded-md bg-slate-900 group-hover:bg-[#C04A22] text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer shrink-0 active:scale-95"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                No departures available for this route right now.
              </div>
            )}
          </div>

          {/* Bottom Sheet Expand Link */}
          {onExpandBottomSheet && (
            <button
              type="button"
              onClick={() => {
                setShowSourceDepartures(false);
                onExpandBottomSheet();
              }}
              className="w-full mt-2.5 pt-2 text-center text-[11px] font-semibold text-slate-600 hover:text-[#C04A22] transition-colors flex items-center justify-center gap-1 border-t border-slate-100 cursor-pointer"
            >
              <span>View full schedule in bottom sheet</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
