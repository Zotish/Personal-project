import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Search, MapPin, Navigation, Bookmark, BookmarkCheck, Share2,
  Building2, ExternalLink, Sparkles, Filter, ChevronRight,
  ChevronLeft, ChevronUp, ChevronDown, Plus, Minus,
  ArrowLeft, ArrowRight, Car, Bike, Footprints, Briefcase,
  ShieldCheck, Loader2, X
} from "lucide-react";
import { LiveJobListing, generateLiveLocationJobs, formatDistance, getDistanceKm, matchJobQuery } from "../data/jobsData";
import { JobDetailsModal } from "../components/jobs/JobDetailsModal";
import type { Map as LeafletMapType } from "leaflet";

// ─── BariKoi API Key & Loader ───────────────────────────────────────────────

const BARIKOI_API_KEY = import.meta.env.VITE_BARIKOI_API_KEY || "bkoi_e25928917c9e7b36a3286d75f446427fa3433bf87361b2fd8c8d6c942300a38f";

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
  const url = `https://barikoi.xyz/v2/api/search/reverse/geocode?api_key=${BARIKOI_API_KEY}&longitude=${lng}&latitude=${lat}&district=true&post_code=true&country=true&sub_district=true&union=true&pauroshova=true&location_type=true&division=true&address=true&area=true&bangla=true`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data?.place) {
      return {
        address: data.place.address || data.place.area || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        area: data.place.area || data.place.sub_district || data.place.district || "Your Area",
        district: data.place.district || "",
        sub_district: data.place.sub_district || "",
        postCode: data.place.postCode || "",
        city: data.place.city || data.place.division || "Dhaka",
      };
    }
  } catch (err) {
    console.warn("BariKoi Reverse Geocode error:", err);
  }
  return null;
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
  searchQuery
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
  searchQuery?: string;
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
        ${isSelected ? '<div style="position:absolute;top:-4px;left:-4px;width:' + (size + 8) + 'px;height:' + (size + 8) + 'px;border-radius:50%;background:rgba(192,74,34,0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>' : ''}
        <div style="background:${bg};color:white;width:${size}px;height:${size}px;border-radius:50%;border:${isSelected ? '3px' : '2px'} solid white;box-shadow:${isSelected ? '0 8px 20px rgba(192,74,34,0.5)' : '0 3px 10px rgba(0,0,0,0.25)'};display:flex;align-items:center;justify-content:center;transform:${isSelected ? 'scale(1.1)' : 'scale(1)'};">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid ${bg};margin-top:-1px;"></div>
      </div>
    `;
  };

  // Precise Live GPS User Location Marker (Pulsing Radar Pinpoint Dot)
  const createUserMarkerHtml = () => `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9999;">
      <div style="position:absolute;width:48px;height:48px;border-radius:50%;background:rgba(37,99,235,0.25);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(37,99,235,0.35);border:2px solid #ffffff;box-shadow:0 0 12px rgba(37,99,235,0.4);"></div>
      <div style="width:16px;height:16px;border-radius:50%;background:#1d4ed8;border:3px solid #ffffff;box-shadow:0 3px 10px rgba(0,0,0,0.35);"></div>
    </div>
  `;

  // Sync Markers to Map
  const syncMapMarkers = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const bkoigl = (window as any).bkoigl;
    const L = LRef.current;

    // 1. Sync / Update User Live GPS Marker ONLY if permission is granted
    if (isLocationGranted) {
      if (userMarkerRef.current) {
        if (userMarkerRef.current.setLngLat) {
          userMarkerRef.current.setLngLat([userCoords[1], userCoords[0]]);
        } else if (userMarkerRef.current.setLatLng) {
          userMarkerRef.current.setLatLng(userCoords);
        }
      } else {
        if (L && map.addLayer) {
          const userIcon = L.divIcon({
            className: "bkoi-user-marker",
            html: createUserMarkerHtml(),
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          const userM = L.marker(userCoords, { icon: userIcon }).addTo(map);
          userMarkerRef.current = userM;
        } else if (bkoigl || map.project) {
          const el = document.createElement("div");
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
    } else {
      if (userMarkerRef.current) {
        if (userMarkerRef.current.remove) userMarkerRef.current.remove();
        userMarkerRef.current = null;
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

        const map = new bkoigl.Map({
          container: containerRef.current!,
          center: [userCoords[1], userCoords[0]], // [lng, lat]
          zoom: 14.6,
          accessToken: key,
          apiKey: key,
          attributionControl: false,
          style: `https://map.barikoi.com/styles/osm_barikoi_v1/style.json?key=${key}`,
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

        map.on("error", (e: any) => {
          if (
            e?.error?.message?.includes("Source layer") ||
            e?.error?.message?.includes("does not exist") ||
            e?.error?.message?.includes("office_11")
          ) {
            return;
          }
        });

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

          L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
            {
              maxZoom: 19,
            }
          ).addTo(map);

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
        mapRef.current.flyTo({ center: [userCoords[1], userCoords[0]], zoom: 15.5, speed: 1.5 });
      } else if (mapRef.current.setView) {
        mapRef.current.setView(userCoords, 15.5);
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

  // Whenever map height changes between expanded / minimized / normal, resize and refit bounds cleanly
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
  }, [directionJob, isNavCardMinimized, isScrolled]);

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden transition-all duration-300">
      {/* ── MAP CONTAINER (Dynamic Height depending on scroll & route state) ── */}
      <div
        className={`relative w-full transition-[height] duration-300 ease-in-out ${directionJob
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

              {/* Top Left: Share & Bookmark Save Buttons */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    const url = `${window.location.origin}/services/jobs?id=${markerClickedJob.id}`;
                    if (typeof navigator !== "undefined" && navigator.share) {
                      navigator.share({ title: markerClickedJob.title, text: `Check out this job on Pathasathi!`, url }).catch(() => {});
                    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(url);
                    }
                  }}
                  className="w-7.5 h-7.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-700 hover:text-[#C04A22] transition shadow-xs cursor-pointer"
                  title="Share Link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onToggleSave?.(markerClickedJob.id);
                  }}
                  className="w-7.5 h-7.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-700 hover:text-[#C04A22] transition shadow-xs cursor-pointer"
                  title={savedJobIds?.includes(markerClickedJob.id) ? "Saved" : "Save Job"}
                >
                  {savedJobIds?.includes(markerClickedJob.id) ? (
                    <BookmarkCheck className="w-3.5 h-3.5 text-[#C04A22]" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5" />
                  )}
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
              <div className="mt-2">
                <span className="px-3 py-1 rounded-full bg-orange-50/80 text-[#C04A22] text-xs font-bold border border-orange-100/60 inline-block">
                  {markerClickedJob.salary}
                </span>
              </div>

              {/* Action Buttons: Direction & Details */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMarkerClickedJob(null);
                    onShowDirection(markerClickedJob);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                  title="Show direction route from your location"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#C04A22]" />
                  <span>Direction</span>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onApplyJob?.(markerClickedJob);
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
            className={`w-9 h-9 rounded-xl shadow-md border transition cursor-pointer active:scale-95 disabled:opacity-75 flex items-center justify-center ${isLocationGranted
                ? "bg-[#C04A22] text-white border-[#C04A22] shadow-[#C04A22]/30"
                : "bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 border-slate-200/80 hover:text-[#C04A22]"
              }`}
            title={isLocationGranted ? "Live Location Active (Click to Turn OFF)" : "Turn ON Live Location (GPS)"}
          >
            {isLocating ? (
              <Loader2 className={`w-4.5 h-4.5 animate-spin ${isLocationGranted ? "text-white" : "text-[#C04A22]"}`} />
            ) : (
              <Navigation className={`w-4.5 h-4.5 ${isLocationGranted ? "text-white" : "text-[#C04A22]"}`} />
            )}
          </button>
        </div>
      </div>

      {/* ── ROUTE NAVIGATION CARD (Outside Map Canvas - Sits directly below the map!) ── */}
      {directionJob && (
        <div className="w-full bg-[#FAFAFA] border-t border-slate-200/90 px-3 py-3 sm:px-4 sm:py-3.5 transition-all duration-300">
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [showApplyModal, setShowApplyModal] = useState<LiveJobListing | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Permission State: "prompt", "granted", or "denied"
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<"prompt" | "granted" | "denied">("prompt");
  const [isLocationGranted, setIsLocationGranted] = useState<boolean>(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState<boolean>(false);

  // Default initial coordinates for map view before permission (Dhaka center)
  const defaultCoords: [number, number] = [23.8103, 90.4125];
  const [userCoords, setUserCoords] = useState<[number, number]>(defaultCoords);
  const [userLocationName, setUserLocationName] = useState<string>("Dhaka");
  const [userArea, setUserArea] = useState<string>("Dhaka Area");
  const [userCity, setUserCity] = useState<string>("Dhaka");

  // Dynamic Live Jobs List
  const [liveJobs, setLiveJobs] = useState<LiveJobListing[]>(() =>
    generateLiveLocationJobs(defaultCoords[0], defaultCoords[1], "Dhaka Area", "Dhaka")
  );
  const [selectedJob, setSelectedJob] = useState<LiveJobListing | null>(null);
  const [directionJob, setDirectionJob] = useState<LiveJobListing | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  // IntersectionObserver to auto-move map to currently visible job card (ONLY for Mobile view < 768px)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      return; // Disable scroll animation on Desktop & Pad/Tablet view!
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          // Find card closest to top center of screen
          const topEntry = visible.reduce((prev, curr) =>
            curr.boundingClientRect.top < prev.boundingClientRect.top ? curr : prev
          );
          const jobId = topEntry.target.getAttribute("data-job-id");
          if (jobId && jobId !== selectedJob?.id) {
            const targetJob = (activeFilter === "nearby" ? nearbyJobs : liveJobs).find(j => j.id === jobId) ||
              filteredJobs.find(j => j.id === jobId);
            if (targetJob) {
              setSelectedJob(targetJob);
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
  }, [liveJobs, nearbyJobs, filteredJobs, activeFilter, selectedJob]);


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
      (error) => {
        // If high accuracy fails on desktop/mac, retry once with standard accuracy
        if (highAccuracy) {
          executeGeolocation(false);
          return;
        }
        console.warn("Device geolocation error:", error.code, error.message);
        setIsLocating(false);
        setIsLocationGranted(false);
        if (error.code === 1) {
          setLocationPermissionStatus("denied");
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 6000 : 15000,
        maximumAge: 60000
      }
    );
  }, []);

  // Direction Handler (Sets direction & displays route without jumping scroll position)
  const handleShowDirection = useCallback((job: LiveJobListing) => {
    setDirectionJob(job);
    setSelectedJob(job);
  }, []);

  // Navigation Button Click Handler (Turn ON / Turn OFF Toggle)
  const handleNavigationClick = useCallback(() => {
    if (isLocationGranted) {
      // Turn OFF Location (Revert to default state)
      setIsLocationGranted(false);
      setLocationPermissionStatus("prompt");
      setShowPermissionPrompt(false);
      setUserCoords(defaultCoords);
      setUserLocationName("Dhaka");
      setUserArea("Dhaka Area");
      setUserCity("Dhaka");
      setDirectionJob(null);
      setLiveJobs(generateLiveLocationJobs(defaultCoords[0], defaultCoords[1], "Dhaka Area", "Dhaka"));
      try {
        localStorage.removeItem("bkoi_last_user_coords");
      } catch (_) { }
    } else {
      // Turn ON Location (Direct device permission request)
      executeGeolocation(true);
    }
  }, [isLocationGranted, executeGeolocation, defaultCoords]);

  const toggleSave = (id: string) => {
    setSavedJobIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };



  return (
    <AppLayout noPad={true}>
      <div className="w-full min-h-screen bg-[#FAFAFA] pb-16">
        {/* ── TOP STICKY BAR: Search Jobs ───────────────────────────────────── */}
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

        {/* ── BARIKOI LIVE MAP (EXPANDED / COMPACT STICKY HEIGHT) ────── */}
        <div id="jobs-map-section" className={`w-full max-w-7xl mx-auto px-2 sm:px-4 transition-all duration-300 ${
          isScrolled ? "sticky top-[86px] sm:top-[90px] md:top-[90px] lg:top-[90px] z-10 pt-0" : "pt-2 sm:pt-3"
        }`}>
          <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white">
            <BariKoiLiveJobsMap
              userCoords={userCoords}
              isLocationGranted={isLocationGranted}
              jobs={filteredJobs}
              selectedJob={selectedJob}
              onSelectJob={job => setSelectedJob(job)}
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
              searchQuery={searchQuery}
            />
          </div>
        </div>

        {/* ── MAIN JOB DIRECTORY CONTENT (1-COL MOBILE, 2-COL PAD, 3-COL DESKTOP) ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
          {/* Filter Option Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mb-4 max-w-md">
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

          {/* Equal Grid of Job Cards (1 column on mobile, 2 on pad, 3 on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
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
                  onClick={() => setSelectedJob(job)}
                  className={`group bg-white rounded-3xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between h-full ${
                    isSelected
                      ? "border-[#C04A22] ring-2 ring-[#C04A22]/20 shadow-md"
                      : "border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  {/* Banner Image with Type & Distance Floating Badges */}
                  <div>
                    <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-slate-100">
                      <img
                        src={job.image}
                        alt={job.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            const url = `${window.location.origin}/services/jobs?id=${job.id}`;
                            if (typeof navigator !== "undefined" && navigator.share) {
                              navigator.share({ title: job.title, text: `Check out this job on Pathasathi!`, url }).catch(() => {});
                            } else if (typeof navigator !== "undefined" && navigator.clipboard) {
                              navigator.clipboard.writeText(url);
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-[#C04A22] transition shadow-xs cursor-pointer"
                          title="Share Link"
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

                      {/* Salary Pill */}
                      <div className="mt-3">
                        <span className="inline-block px-3 py-1.5 rounded-full bg-orange-50/80 text-[#C04A22] text-xs sm:text-sm font-bold border border-orange-100/60">
                          {job.salary}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body Footer: Direction & Details Buttons Aligned Equally */}
                  <div className="p-4 sm:p-5 pt-3">
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleShowDirection(job);
                        }}
                        className="flex-1 px-3.5 py-2 rounded-2xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                        title="Show direction route from your location"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#C04A22]" />
                        <span>Direction</span>
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setShowApplyModal(job);
                        }}
                        className="flex-1 px-3.5 py-2 rounded-2xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#C04A22]" />
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
