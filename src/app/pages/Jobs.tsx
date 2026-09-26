import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { buildMapShareUrl, shareOrCopy } from "../utils/shareUtils";
import {
  Search, MapPin, Navigation, Bookmark, BookmarkCheck, Share2,
  Building2, ExternalLink, Sparkles, Filter, ChevronRight,
  ChevronLeft, ChevronUp, ChevronDown, Plus, Minus,
  ArrowLeft, ArrowRight, Car, Bike, Footprints, Briefcase,
  ShieldCheck, Loader2, X, Info
} from "lucide-react";
import { LiveJobListing, generateLiveLocationJobs, formatDistance, getDistanceKm, matchJobQuery } from "../data/jobsData";
import { JobDetailsModal } from "../components/jobs/JobDetailsModal";
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


// ─── Real Turn-by-Turn Road Routing Helper (Google Maps / OSRM Standard) ───

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
            coordinates: rawCoords, // Follows ONLY real road paths
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


// ─── BariKoi Interactive Live Map Component ─────────────────────────────────

function BariKoiLiveJobsMap({
  userCoords,
  isLocationGranted,
  jobs,
  selectedJob,
  onSelectJob,
  onNavigationClick,
  onRequestLocation,
  onDenyLocation,
  showPermissionPrompt,
  isLocating,
  directionJob,
  onClearDirection,
  onShowDirection,
  onApplyJob,
  savedJobIds,
  onToggleSave,
  isScrolled,
  onToggleSize,
  searchQuery,
  countryCode,
}: {
  userCoords: [number, number];
  isLocationGranted: boolean;
  jobs: LiveJobListing[];
  selectedJob: LiveJobListing | null;
  onSelectJob: (job: LiveJobListing | null) => void;
  onNavigationClick: () => void;
  onRequestLocation: () => void;
  onDenyLocation: () => void;
  showPermissionPrompt: boolean;
  isLocating: boolean;
  directionJob: LiveJobListing | null;
  onClearDirection: () => void;
  onShowDirection: (job: LiveJobListing) => void;
  onApplyJob?: (job: LiveJobListing) => void;
  savedJobIds?: string[];
  onToggleSave?: (id: string) => void;
  isScrolled?: boolean;
  onToggleSize?: () => void;
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
  const [markerClickedJob, setMarkerClickedJob] = useState<LiveJobListing | null>(null);

  const handleMarkerClick = useCallback((job: LiveJobListing) => {
    setMarkerClickedJob(job);
    onSelectJob(job);
  }, [onSelectJob]);

  // Auto-hide marker card overlay if user scrolls
  useEffect(() => {
    const handleScroll = () => {
      setMarkerClickedJob(null);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isScrolled) {
      setMarkerClickedJob(null);
    }
  }, [isScrolled]);

  useEffect(() => {
    if (directionJob) {
      setMarkerClickedJob(null);
    }
  }, [directionJob]);

  // Helper to create HTML for Job Marker
  const createJobMarkerHtml = (job: LiveJobListing, isSelected: boolean) => {
    const bg = isSelected ? "#8C3015" : "#C04A22";
    const size = isSelected ? 38 : 32;
    return `
      <div style="position:relative;display:inline-flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform 0.2s ease;">
        <div style="background:${bg};color:white;width:${size}px;height:${size}px;border-radius:50%;border:${isSelected ? '3px' : '2px'} solid white;box-shadow:${isSelected ? '0 8px 20px rgba(192,74,34,0.5)' : '0 3px 10px rgba(0,0,0,0.25)'};display:flex;align-items:center;justify-content:center;transform:${isSelected ? 'scale(1.1)' : 'scale(1)'};">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid ${bg};margin-top:-1px;"></div>
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

    // 2. Clear old Job Markers
    markersRef.current.forEach(m => {
      if (m.remove) m.remove();
    });
    markersRef.current = [];

    // 3. Add Job Markers around live location
    jobs.forEach(job => {
      const isSelected = selectedJob?.id === job.id;
      if (L && map.addLayer) {
        const icon = L.divIcon({
          className: "bkoi-job-marker",
          html: createJobMarkerHtml(job, isSelected),
          iconSize: isSelected ? [38, 44] : [32, 38],
          iconAnchor: isSelected ? [19, 44] : [16, 38]
        });
        const marker = L.marker([job.lat, job.lng], { icon }).addTo(map);
        marker.on("click", () => handleMarkerClick(job));
        markersRef.current.push(marker);
      } else if (bkoigl || map.project) {
        const el = document.createElement("div");
        el.innerHTML = createJobMarkerHtml(job, isSelected);
        el.style.cursor = "pointer";
        el.addEventListener("click", () => handleMarkerClick(job));

        const MarkerClass = bkoigl?.Marker || (window as any).maplibregl?.Marker;
        if (MarkerClass) {
          const marker = new MarkerClass({ element: el })
            .setLngLat([job.lng, job.lat])
            .addTo(map);
          markersRef.current.push(marker);
        }
      }
    });
  }, [jobs, userCoords, isLocationGranted, selectedJob, handleMarkerClick]);

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

        map.on("dragend", () => {
          try {
            const center = map.getCenter();
            if (!center) return;
            const lat = typeof center.lat === "function" ? center.lat() : center.lat;
            const lng = typeof center.lng === "function" ? center.lng() : center.lng;
            if (typeof lat !== "number" || typeof lng !== "number") return;
            let closest: LiveJobListing | null = null;
            let minD = Infinity;
            jobs.forEach(j => {
              const d = Math.hypot(j.lat - lat, j.lng - lng);
              if (d < minD) {
                minD = d;
                closest = j;
              }
            });
            if (closest && minD < 0.04) {
              onSelectJob(closest);
            }
          } catch (_) { }
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

          map.on("dragend", () => {
            try {
              const center = map.getCenter();
              if (!center) return;
              let closest: LiveJobListing | null = null;
              let minD = Infinity;
              jobs.forEach(j => {
                const d = Math.hypot(j.lat - center.lat, j.lng - center.lng);
                if (d < minD) {
                  minD = d;
                  closest = j;
                }
              });
              if (closest && minD < 0.04) {
                onSelectJob(closest);
              }
            } catch (_) { }
          });

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

  // Update markers when selection or job list changes
  useEffect(() => {
    syncMapMarkers();
  }, [syncMapMarkers]);

  // When search query is entered or matching jobs filter changes, fit map to visible filtered jobs
  useEffect(() => {
    if (!mapRef.current || !jobs || jobs.length === 0 || directionJob) return;
    const map = mapRef.current;
    const L = LRef.current;

    if (searchQuery && searchQuery.trim().length > 0) {
      if (jobs.length === 1) {
        const single = jobs[0];
        if (map.flyTo) {
          map.flyTo({ center: [single.lng, single.lat], zoom: 15.5, speed: 1.2 });
        } else if (map.panTo) {
          map.panTo([single.lat, single.lng]);
        }
      } else if (jobs.length > 1) {
        let minLng = jobs[0].lng, maxLng = jobs[0].lng;
        let minLat = jobs[0].lat, maxLat = jobs[0].lat;
        jobs.forEach(j => {
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
            L.latLngBounds(jobs.map(j => [j.lat, j.lng])),
            { padding: [45, 45], maxZoom: 16 }
          );
        }
      }
    }
  }, [jobs, searchQuery, directionJob]);

  const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);

  // Fly to selected job or draw real turn-by-turn road route to direction job
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = LRef.current;

    // Handle Real Road Direction Route
    if (directionJob) {
      const userLat = userCoords[0];
      const userLng = userCoords[1];
      const jobLat = directionJob.lat;
      const jobLng = directionJob.lng;

      let isCancelled = false;

      fetchRealRoadRoute(userLat, userLng, jobLat, jobLng).then(routeData => {
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

      // If no direction, fly to selected job if present
      if (selectedJob) {
        if (map.flyTo) {
          map.flyTo({
            center: [selectedJob.lng, selectedJob.lat],
            zoom: 15.5,
            speed: 1.2
          });
        } else if (map.panTo) {
          map.panTo([selectedJob.lat, selectedJob.lng]);
        }
      }
    }
  }, [directionJob, selectedJob, userCoords]);

  // Always center directly on user's exact pinpoint location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || directionJob || selectedJob) return;

    if (map.resize) {
      try { map.resize(); } catch (_) {}
    }

    if (map.flyTo) {
      map.flyTo({
        center: [userCoords[1], userCoords[0]],
        zoom: isScrolled ? 14.2 : 14.8,
        duration: 400,
        essential: true
      });
    } else if (map.setView) {
      map.setView(userCoords, isScrolled ? 14.2 : 14.8);
    }
  }, [isScrolled, userCoords, directionJob, selectedJob]);

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

  // Re-open card whenever a new direction job is selected
  useEffect(() => {
    if (directionJob) {
      setIsNavCardMinimized(false);
    }
  }, [directionJob]);

  // Whenever map height changes between expanded / minimized / normal, resize and refit cleanly
  useEffect(() => {
    const handleResize = () => {
      if (!mapRef.current) return;
      if (mapRef.current.resize) {
        mapRef.current.resize();
      } else if (mapRef.current.invalidateSize) {
        mapRef.current.invalidateSize();
      }

      // If we have an active route, re-fit the bounds so it fills the new visible map height perfectly!
      if (directionJob && lastCoordinatesRef.current && lastCoordinatesRef.current.length > 0) {
        const coords = lastCoordinatesRef.current;
        if (mapRef.current.fitBounds) {
          let minLng = coords[0][0], maxLng = coords[0][0];
          let minLat = coords[0][1], maxLat = coords[0][1];
          coords.forEach(([cLng, cLat]) => {
            if (cLng < minLng) minLng = cLng;
            if (cLng > maxLng) maxLng = cLng;
            if (cLat < minLat) minLat = cLat;
            if (cLat > maxLat) maxLat = cLat;
          });
          mapRef.current.fitBounds(
            [[minLng, minLat], [maxLng, maxLat]],
            { padding: 35, maxZoom: 16.5, duration: 600 }
          );
        } else if (LRef.current && mapRef.current.fitBounds) {
          const latLngs = coords.map(([lng, lat]) => [lat, lng]);
          const bounds = LRef.current.latLngBounds(latLngs);
          mapRef.current.fitBounds(bounds, { padding: [35, 35], maxZoom: 16.5 });
        }
      } else if (!selectedJob) {
        // In compact or normal mode without active route: Ensure exact pinpoint is dead center in the resized canvas!
        if (mapRef.current.flyTo) {
          mapRef.current.flyTo({
            center: [userCoords[1], userCoords[0]],
            zoom: isScrolled ? 14.2 : 14.8,
            duration: 300,
            essential: true
          });
        } else if (mapRef.current.setView) {
          mapRef.current.setView(userCoords, isScrolled ? 14.2 : 14.8);
        }
      }
    };

    // Clean resize after CSS transition finishes (avoids WebGL redraw thrashing)
    const timer = setTimeout(handleResize, 160);
    return () => clearTimeout(timer);
  }, [directionJob, isNavCardMinimized, isScrolled, userCoords, selectedJob]);

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden transition-all duration-150 ease-out">
      {/* ── MAP CONTAINER (Dynamic Height depending on scroll & route state) ── */}
      <div
        className={`relative w-full transition-[height] duration-150 ease-out ${directionJob
            ? isNavCardMinimized
              ? "h-[380px] sm:h-[470px] md:h-[530px] lg:h-[590px]"
              : "h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px]"
            : isScrolled
              ? "h-[210px] sm:h-[240px] md:h-[260px] lg:h-[280px]" // Screenshot compact height when scrolling list!
              : "h-[440px] sm:h-[520px] md:h-[580px] lg:h-[620px]" // Default full height
          }`}
      >
        <div ref={containerRef} className="w-full h-full" />

        {/* ── Selected Job Card Overlay on Marker Click (Only on direct marker click, NOT during scroll) ── */}
        {markerClickedJob && !directionJob && !isScrolled && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:left-4 sm:bottom-4 z-30 w-auto sm:w-[330px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in slide-in-from-bottom-3 duration-250 pointer-events-auto">
            {/* Banner Image with Type, Bookmark & Distance Badges (Compact Height) */}
            <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-slate-100">
              <img
                src={markerClickedJob.image}
                alt={markerClickedJob.title}
                className="w-full h-full object-cover"
              />
              {/* Top Right: Type Badge & Close button */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <div className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-bold shadow-xs border border-slate-200/60">
                  {markerClickedJob.type}
                </div>
                <button
                  onClick={() => setMarkerClickedJob(null)}
                  className="w-6.5 h-6.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 flex items-center justify-center shadow transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Left: Distance Badge on Image */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 shadow-xs">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{markerClickedJob.distance}</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3 sm:p-3.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-1">
                {markerClickedJob.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                {markerClickedJob.company} • {markerClickedJob.location}
              </p>

              {/* Salary Pill */}
              <div className="mt-1.5">
                <span className="text-xs font-bold text-[#C04A22] inline-block">
                  {markerClickedJob.salary}
                </span>
              </div>

              {/* Action Buttons: Direction & Details (Icon Only) */}
              <div className="mt-2.5 pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMarkerClickedJob(null);
                    onShowDirection(markerClickedJob);
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
                    onApplyJob?.(markerClickedJob);
                  }}
                  className="flex-1 py-2 rounded-xl bg-transparent hover:opacity-70 text-[#C04A22] font-bold transition flex items-center justify-center cursor-pointer active:scale-95"
                  title="Details"
                  aria-label="Details"
                >
                  <Info className="w-4 h-4 text-[#C04A22]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Center Permission Prompt: Left Allow, Right X (Deny) */}
        {showPermissionPrompt && !isLocationGranted && !directionJob && (
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

        {/* Map Controls: Zoom In / Out / Recenter (Matching Screenshot 2) */}
        <div className="absolute top-4 right-4 z-30 flex flex-col items-center gap-2 pointer-events-auto">
          {/* Zoom controls pill */}
          <div className="flex flex-col items-center bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/90 overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="w-8.5 h-8.5 flex items-center justify-center text-slate-700 hover:text-[#D85A30] hover:bg-slate-50 transition cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-4 h-4 stroke-[2.2]" />
            </button>
            <div className="w-full h-px bg-slate-100" />
            <button
              onClick={handleZoomOut}
              className="w-8.5 h-8.5 flex items-center justify-center text-slate-700 hover:text-[#D85A30] hover:bg-slate-50 transition cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4 stroke-[2.2]" />
            </button>
            {onToggleSize && (
              <>
                <div className="w-full h-px bg-slate-100" />
                <button
                  onClick={onToggleSize}
                  className="w-8.5 h-8.5 flex items-center justify-center text-slate-700 hover:text-[#D85A30] hover:bg-slate-50 transition cursor-pointer"
                  title={isScrolled ? "Expand Map" : "Compact Map"}
                >
                  {isScrolled ? (
                    <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                  ) : (
                    <ChevronUp className="w-4 h-4 stroke-[2.2]" />
                  )}
                </button>
              </>
            )}
          </div>
          {/* Floating Navigation Button */}
          <button
            onClick={handleReset}
            disabled={isLocating}
            className={`w-9.5 h-9.5 rounded-full shadow-lg border transition-all cursor-pointer active:scale-95 disabled:opacity-75 flex items-center justify-center ${
              isLocationGranted
                ? "bg-[#D85A30] text-white border-[#D85A30] shadow-[#D85A30]/30"
                : "bg-white/95 backdrop-blur-md text-slate-700 hover:text-[#D85A30] border-slate-200/90"
            }`}
            title={isLocationGranted ? "Live Location Active (Click to Turn OFF)" : "Turn ON Live Location (GPS)"}
          >
            {isLocating ? (
              <Loader2 className={`w-4 h-4 animate-spin ${isLocationGranted ? "text-white" : "text-[#D85A30]"}`} />
            ) : (
              <Navigation className={`w-4 h-4 transition-transform ${isLocationGranted ? "text-white fill-current" : "text-slate-700 hover:text-[#D85A30]"}`} />
            )}
          </button>
        </div>
      </div>

      {/* ── ROUTE NAVIGATION CARD (Outside Map Canvas - Sits directly below the map!) ── */}
      {directionJob && (
        <div className="w-full bg-[#FAFAFA] border-t border-slate-200/90 px-3 py-3 sm:px-4 sm:py-3.5 transition-all duration-150 ease-out">
          {/* 1. Minimized Route Bar (Matching Screenshot 2) */}
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
                    {directionJob.title}
                  </div>
                  <div className="text-xs text-[#C04A22] font-bold">
                    ({directionJob.distanceKm.toFixed(1)} km)
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
            /* 2. Expanded Route Navigation Card (Matching Screenshot 1) */
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
                    <span className="truncate">{directionJob.title}</span>
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
                      ? `${Math.max(1, Math.round(directionJob.distanceKm * 2.5))} min`
                      : travelMode === "bike"
                        ? `${Math.max(2, Math.round(directionJob.distanceKm * 4.5))} min`
                        : `${Math.max(5, Math.round(directionJob.distanceKm * 12))} min`}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">Time</div>
                </div>

                {/* Distance */}
                <div className="bg-slate-50/90 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {directionJob.distanceKm.toFixed(1)} km
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">Distance</div>
                </div>

                {/* Cost */}
                <div className="bg-slate-50/90 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    ${(directionJob.distanceKm * 0.16 + 0.45).toFixed(2)}
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

// ─── Main Live Jobs Page ────────────────────────────────────────────────────

export function Jobs() {
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
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [showApplyModal, setShowApplyModal] = useState<LiveJobListing | null>(null);
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
    return { city: "Dhaka", area: "Motijheel / Gulshan", name: "Dhaka, Bangladesh" };
  }, []);

  const [userLocationName, setUserLocationName] = useState<string>(initialLoc.name);
  const [userArea, setUserArea] = useState<string>(initialLoc.area);
  const [userCity, setUserCity] = useState<string>(initialLoc.city);

  // Dynamic Live Jobs List strictly positioned around user's location
  const [liveJobs, setLiveJobs] = useState<LiveJobListing[]>(() => {
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
    return generateLiveLocationJobs(coords[0], coords[1], initialLoc.area, initialLoc.city);
  });

  // Keep jobs accurately synced with user's real area without ever moving to default location on nav off
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
              setLiveJobs(generateLiveLocationJobs(lat, lng, area, city));
            }
          });
        }
      }
    } catch (_) {}
  }, []);
  const [selectedJob, setSelectedJob] = useState<LiveJobListing | null>(null);
  const [directionJob, setDirectionJob] = useState<LiveJobListing | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleSelectJob = useCallback((job: LiveJobListing | null) => {
    setSelectedJob(job);
    if (job) {
      const cardEl = cardRefs.current.get(job.id);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, []);

  // Deep linking: auto-focus and show details if opened via shared link
  const sharedId = searchParams.get("id") || searchParams.get("jobId");

  useEffect(() => {
    if (!sharedId) return;
    const target = liveJobs.find(j => String(j.id) === String(sharedId) || String(j.id) === `job-${sharedId}`);
    if (target) {
      setSelectedJob(target);
      setShowApplyModal(target);
      setUserCoords([target.lat, target.lng]);
      setTimeout(() => {
        cardRefs.current.get(target.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  }, [sharedId, liveJobs]);

  // Filter Jobs based on Search Query & Filter Pills
  const filteredJobs = liveJobs.filter(job => {
    // Smart Sentence / Multi-Word Keyword Search Query
    if (searchQuery.trim() && !matchJobQuery(job, searchQuery)) {
      return false;
    }

    // Filter Pills
    if (activeFilter === "nearby" && !job.isNearby) return false;
    if (activeFilter === "fulltime" && job.type !== "Full-time") return false;
    if (activeFilter === "parttime" && job.type !== "Part-time") return false;

    return true;
  });

  const nearbyJobs = filteredJobs.filter(j => j.isNearby);

  // Smooth scroll detection for dynamic map resizing
  const cardListRef = useRef<HTMLDivElement>(null);

  const handleCardListScroll = () => {
    if (!cardListRef.current) return;
    const y = cardListRef.current.scrollTop;
    if (y > 25 && !isScrolled) {
      setIsScrolled(true);
    } else if (y <= 5 && isScrolled) {
      setIsScrolled(false);
    }
  };

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y > 100 && !isScrolled) {
            setIsScrolled(true);
          } else if (y <= 15 && isScrolled) {
            setIsScrolled(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

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

          // Generate jobs around exact live coordinates
          const generated = generateLiveLocationJobs(lat, lng, area, city);
          setLiveJobs(generated);
        } else {
          const generated = generateLiveLocationJobs(lat, lng, "Near You", "Live City");
          setLiveJobs(generated);
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

        // Try IP Geolocation lookup (Resolves Mac CoreLocation kCLErrorLocationUnknown!)
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
        setLiveJobs(generateLiveLocationJobs(fallbackLat, fallbackLng, areaName, cityName));
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
  const handleShowDirection = useCallback((job: LiveJobListing) => {
    setDirectionJob(job);
    setSelectedJob(job);
  }, []);

  // Navigation Button Click Handler (Turn ON / Turn OFF Toggle)
  const handleNavigationClick = useCallback(() => {
    if (isLocationGranted) {
      // Turn OFF Location live GPS tracker, but KEEP userCoords and service cards in place!
      setIsLocationGranted(false);
      setLocationPermissionStatus("prompt");
      setShowPermissionPrompt(false);
      setDirectionJob(null);
    } else {
      // Turn ON Location (Direct device permission request)
      executeGeolocation(true);
    }
  }, [isLocationGranted, executeGeolocation]);

  const toggleSave = (id: string) => {
    setSavedJobIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };



  return (
    <AppLayout noPad={true}>
      <div className="w-full h-[calc(100dvh-4rem)] lg:h-[calc(100vh)] flex flex-col overflow-hidden bg-[#FAFAFA]">
        {/* ── TOP STICKY BAR: Search Jobs ───────────────────────────────────── */}
        <div className="flex-shrink-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 shadow-2xs">
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
                placeholder="search jobs, titles, skills..."
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

          {/* Short & Understandable Filter Pills */}
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
            {[
              { id: "all", label: "All Jobs" },
              { id: "nearby", label: "Nearby" },
              { id: "fulltime", label: "Full-time" },
              { id: "parttime", label: "Part-time" }
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
        <div id="jobs-map-section" className="w-full max-w-7xl mx-auto px-0 flex-shrink-0 z-10">
          <div className="rounded-none sm:rounded-b-2xl overflow-hidden border-b border-slate-200/90 shadow-xs bg-white">
            <BariKoiLiveJobsMap
              userCoords={userCoords}
              isLocationGranted={isLocationGranted}
              jobs={filteredJobs}
              selectedJob={selectedJob}
              onSelectJob={handleSelectJob}
              onNavigationClick={handleNavigationClick}
              onRequestLocation={() => executeGeolocation(true)}
              onDenyLocation={() => setShowPermissionPrompt(false)}
              showPermissionPrompt={showPermissionPrompt}
              isLocating={isLocating}
              directionJob={directionJob}
              onClearDirection={() => {
                setDirectionJob(null);
                setSelectedJob(null);
              }}
              onShowDirection={handleShowDirection}
              onApplyJob={job => setShowApplyModal(job)}
              savedJobIds={savedJobIds}
              onToggleSave={toggleSave}
              isScrolled={isScrolled}
              onToggleSize={() => setIsScrolled(prev => !prev)}
              searchQuery={searchQuery}
              countryCode={countryCode}
            />
          </div>
        </div>

        {/* ── MAIN JOB DIRECTORY CONTENT (UPORE / ON TOP - PAUSES RIGHT BELOW COMPACT MAP) ── */}
        <div
          ref={cardListRef}
          onScroll={handleCardListScroll}
          className="flex-1 min-h-0 overflow-y-auto max-w-7xl w-full mx-auto px-0 sm:px-6 pt-2 sm:pt-4 relative z-20 bg-[#FAFAFA] rounded-t-3xl shadow-[0_-6px_25px_rgba(0,0,0,0.06)] border-t border-slate-200/80 -mt-2 sm:-mt-3 pb-24"
        >
          {/* Uber-style pull handle indicator (Click to expand/compact map smoothly) */}
          <div
            onClick={() => setIsScrolled(prev => !prev)}
            className="w-full flex items-center justify-center py-2 cursor-pointer group"
            title={isScrolled ? "Expand Map" : "Compact Map"}
          >
            <div className="w-12 h-1.5 bg-slate-300 group-hover:bg-slate-400 rounded-full transition-colors" />
          </div>
          {/* Controls Bar: Filter Options */}
          <div className="flex items-center justify-between gap-3 mb-4 px-4 sm:px-0">
            {/* Filter Option Buttons */}
            <div className="grid grid-cols-2 gap-2.5 max-w-md w-full">
              {/* Left Option: Nearby Me Jobs */}
              <div
                onClick={() => setActiveFilter(activeFilter === "nearby" ? "all" : "nearby")}
                className={`py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-2xl border transition-all cursor-pointer text-center sm:text-left ${
                  activeFilter === "nearby"
                    ? "bg-orange-50/60 border-[#C04A22] ring-1 ring-[#C04A22]/20 shadow-xs"
                    : "bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-xs"
                }`}
              >
                <div className="text-xs sm:text-sm font-normal text-slate-800 leading-tight">
                  {nearbyJobs.length} jobs nearby
                </div>
              </div>

              {/* Right Option: Full State Jobs */}
              <div
                onClick={() => setActiveFilter("all")}
                className={`py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-2xl border transition-all cursor-pointer text-center sm:text-left ${
                  activeFilter === "all"
                    ? "bg-orange-50/60 border-[#C04A22] ring-1 ring-[#C04A22]/20 shadow-xs"
                    : "bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-xs"
                }`}
              >
                <div className="text-xs sm:text-sm font-normal text-slate-800 leading-tight">
                  {liveJobs.length} full state jobs
                </div>
              </div>
            </div>
          </div>

          {/* Equal Grid of Job Cards (Consistent positioning & equal heights on both sides) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-0 sm:gap-5 items-stretch">
            {(activeFilter === "nearby" ? nearbyJobs : filteredJobs).map(job => {
              const isSelected = selectedJob?.id === job.id;
              const isSaved = savedJobIds.includes(job.id);
              return (
                <div
                  key={job.id}
                  data-job-id={job.id}
                  ref={el => {
                    if (el) cardRefs.current.set(job.id, el);
                    else cardRefs.current.delete(job.id);
                  }}
                  onClick={() => handleSelectJob(job)}
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
                        src={job.image}
                        alt={job.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold shadow-xs border border-slate-200/60">
                        {job.type}
                      </div>
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {job.distance}
                      </div>
                      {/* Top Left: Share & Bookmark Save Buttons */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-[2]">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const url = buildMapShareUrl({
                              id: job.id,
                              title: job.title,
                              lat: job.lat,
                              lng: job.lng,
                              category: `💼 Job (${job.type})`,
                              address: job.location,
                              image: job.image,
                              phone: job.contactPhone,
                              description: `${job.title} at ${job.company} • ${job.salary}`,
                            });
                            await shareOrCopy({
                              title: job.title,
                              text: `Check out ${job.title} on Pathasathi Map!`,
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
                            toggleSave(job.id);
                          }}
                          className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-[#C04A22] transition shadow-xs cursor-pointer"
                          title={isSaved ? "Saved" : "Save Job"}
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
                        {job.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                        {job.company} • {job.location}
                      </p>

                      {/* Salary */}
                      <div className="mt-2.5">
                        <span className="text-xs sm:text-sm font-bold text-[#C04A22] inline-block">
                          {job.salary}
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
                          handleShowDirection(job);
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
                          setShowApplyModal(job);
                        }}
                        className="flex-1 py-2 rounded-2xl bg-transparent hover:opacity-70 text-[#C04A22] font-bold transition flex items-center justify-center cursor-pointer active:scale-95"
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

        {/* ── JOB DETAILS & EXTERNAL APPLICATION MODAL ───────────────────────── */}
        <JobDetailsModal
          job={showApplyModal}
          onClose={() => setShowApplyModal(null)}
          onShowDirection={(job) => handleShowDirection(job)}
          savedJobIds={savedJobIds}
          onToggleSave={toggleSave}
        />

      </div>
    </AppLayout>
  );
}
