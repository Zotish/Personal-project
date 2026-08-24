import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Search, MapPin, Briefcase, DollarSign, Clock, Star,
  Shield, CheckCircle2, Phone, MessageCircle, ExternalLink,
  ChevronRight, Filter, ChevronLeft, Bookmark, BookmarkCheck,
  Send, Sparkles, Home, Building2, User, Layers, Eye, X,
  Map as MapIcon, ArrowUpRight, ArrowRight, Compass, Check, AlertCircle,
  Plus, Minus, RotateCcw, Navigation, RefreshCw, Loader2,
  Lock, AlertTriangle, Car, Bike, Footprints, ChevronDown, ChevronUp, ArrowLeft, Route
} from "lucide-react";
import type { Map as LeafletMapType } from "leaflet";

// ─── BariKoi API Key & Loader ───────────────────────────────────────────────

const BARIKOI_API_KEY = import.meta.env.VITE_BARIKOI_API_KEY || "bkoi_e25928917c9e7b36a3286d75f446427fa3433bf87361b2fd8c8d6c942300a38f";

function loadBkoiGL(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).bkoigl) {
      resolve((window as any).bkoigl);
      return;
    }
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/bkoi-gl@latest/dist/style/bkoi-gl.css";
    document.head.appendChild(css);

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

// ─── Distance Helpers ───────────────────────────────────────────────────────

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
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

// ─── Data Types ─────────────────────────────────────────────────────────────

export type LiveJobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  city: string;
  salary: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote";
  category: string;
  distance: string;
  distanceKm: number;
  isNearby: boolean;
  lat: number;
  lng: number;
  logo: string;
  image: string;
  posted: string;
  description: string;
  skills: string[];
  experience: string;
  contactPhone: string;
  contactEmail: string;
  spots: number;
};

// ─── Dynamic Live Location Jobs Generator ───────────────────────────────────

function generateLiveLocationJobs(lat: number, lng: number, areaName: string, cityName: string): LiveJobListing[] {
  const area = areaName || "Near You";
  const city = cityName || "Local Area";

  const templateList = [
    { title: "Senior Frontend Developer (React / Next.js)", company: "TechHive Digital Labs", category: "IT & Software", salary: "৳65,000 – ৳95,000/mo", type: "Full-time", tags: ["React", "TypeScript", "Tailwind"], dLat: 0.0028, dLng: 0.0032, logo: "💻", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80", exp: "2+ yrs experience", desc: "Developing responsive web applications and interactive UI dashboards. Flexible working hours, health coverage & yearly festival bonuses." },
    { title: "Executive Chef & Kitchen Supervisor", company: "Heritage Dine & Lounge", category: "Hospitality", salary: "৳35,000 – ৳48,000/mo", type: "Full-time", tags: ["Culinary", "Kitchen Prep", "Meals Included"], dLat: -0.0022, dLng: 0.0025, logo: "🍽️", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80", exp: "1+ yrs experience", desc: "Overseeing menu preparation, culinary hygiene and kitchen staff management. Daily meals & attendance bonus provided." },
    { title: "Accounts & Financial Officer", company: "Apex Business Solutions", category: "Finance", salary: "৳40,000 – ৳55,000/mo", type: "Full-time", tags: ["Tally", "QuickBooks", "Taxation"], dLat: 0.0038, dLng: -0.0029, logo: "📊", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80", exp: "Graduate in BBA/Accounting", desc: "Handling ledger entries, invoice reconciliation and monthly payroll processing. Proactive team environment." },
    { title: "Express Delivery Rider (Bike/Cycle)", company: "QuickDrop Courier Express", category: "Logistics", salary: "৳22,000 – ৳32,000/mo", type: "Full-time", tags: ["Flexible Shifts", "Daily Fuel Bonus"], dLat: -0.0034, dLng: -0.0019, logo: "🛵", image: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80", exp: "Own bike / Smartphone", desc: "Parcel and document delivery within nearby zones. Guaranteed weekly payment + delivery commission incentives." },
    { title: "Registered Pharmacist / Chemist", company: "CarePlus Pharmacy & Wellness", category: "Healthcare", salary: "৳32,000 – ৳45,000/mo", type: "Full-time", tags: ["B.Pharm / Diploma", "Medicine Dispensing"], dLat: 0.0014, dLng: -0.0038, logo: "💊", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80", exp: "Diploma in Pharmacy", desc: "Dispensing OTC and prescription medicines, patient counseling and inventory control in a modern pharmacy setup." },
    { title: "Sales & Customer Relations Executive", company: "Prime Retail Mart", category: "Sales", salary: "৳25,000 – ৳35,000/mo + Comm", type: "Full-time", tags: ["Retail Sales", "Customer Service"], dLat: -0.0024, dLng: 0.0042, logo: "🛍️", image: "https://images.unsplash.com/photo-1556742049-0a67e55722c0?auto=format&fit=crop&w=600&q=80", exp: "HSC / Graduate", desc: "Showroom customer assistance, billing and product merchandising. Performance commission on monthly targets." },
    { title: "UI/UX & Visual Designer", company: "PixelCraft Design Studio", category: "Design", salary: "৳50,000 – ৳75,000/mo", type: "Full-time", tags: ["Figma", "Mobile UI", "Portfolio"], dLat: 0.0046, dLng: 0.0018, logo: "🎨", image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80", exp: "Portfolio required", desc: "Designing intuitive mobile app interfaces, design systems and interactive prototypes for high-growth tech startups." },
    { title: "Branch Operations Supervisor", company: "National Logistics Hub", category: "Operations", salary: "৳38,000 – ৳52,000/mo", type: "Full-time", tags: ["Warehouse", "Team Leadership"], dLat: -0.0042, dLng: 0.0035, logo: "📦", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80", exp: "2+ yrs experience", desc: "Supervising hub operations, vehicle loading schedules and package routing with dispatch teams." },
    { title: "Digital Marketing & Content Specialist", company: "GrowthWave Media", category: "Marketing", salary: "৳30,000 – ৳45,000/mo", type: "Part-time", tags: ["Social Media", "SEO", "Copywriting"], dLat: 0.0055, dLng: -0.0045, logo: "📱", image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=600&q=80", exp: "Content & Ad management", desc: "Managing social media campaigns, SEO content strategy and Google ads for e-commerce brands." },
    { title: "Electrical & Maintenance Technician", company: "SmartFix Facility Services", category: "Technical", salary: "৳28,000 – ৳36,000/mo", type: "Full-time", tags: ["Wiring", "HVAC Maintenance"], dLat: -0.0048, dLng: -0.0036, logo: "⚡", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80", exp: "Technical Trade certificate", desc: "Commercial facility electrical troubleshooting, generator maintenance and HVAC servicing." },
    { title: "Quality Assurance (QA) Engineer", company: "SoftVibe Technologies", category: "IT & Software", salary: "৳55,000 – ৳80,000/mo", type: "Full-time", tags: ["Manual & Automation", "Postman"], dLat: 0.0061, dLng: 0.0052, logo: "🔍", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80", exp: "1-3 yrs QA experience", desc: "Writing test cases, API testing and bug tracking for fintech web & mobile applications." },
    { title: "Call Center & Customer Support Agent", company: "ConnectGlobal BPO", category: "Customer Care", salary: "৳24,000 – ৳32,000/mo", type: "Part-time", tags: ["Inbound Calls", "Night/Day Shift"], dLat: -0.0058, dLng: 0.0062, logo: "🎧", image: "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=600&q=80", exp: "Fluent English & Bengali", desc: "Handling inbound customer queries via phone and live chat. Professional air-conditioned workstation with pick & drop." }
  ];

  return templateList.map((tmpl, idx) => {
    const jobLat = lat + tmpl.dLat;
    const jobLng = lng + tmpl.dLng;
    const distKm = getDistanceKm(lat, lng, jobLat, jobLng);
    const isNearby = distKm <= 2.0;

    return {
      id: `live-job-${idx + 1}`,
      title: tmpl.title,
      company: tmpl.company,
      location: `${area}, ${city}`,
      city: city,
      salary: tmpl.salary,
      type: tmpl.type as any,
      category: tmpl.category,
      distance: formatDistance(distKm),
      distanceKm: distKm,
      isNearby: isNearby,
      lat: jobLat,
      lng: jobLng,
      logo: tmpl.logo,
      image: tmpl.image,
      posted: `${(idx % 4) + 1}h ago`,
      description: tmpl.desc,
      skills: tmpl.tags,
      experience: tmpl.exp,
      contactPhone: `+880 17${Math.floor(10000000 + Math.random() * 90000000)}`,
      contactEmail: `hr@${tmpl.company.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      spots: (idx % 3) + 1
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
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
  onClearDirection
}: {
  userCoords: [number, number];
  isLocationGranted: boolean;
  jobs: LiveJobListing[];
  selectedJob: LiveJobListing | null;
  onSelectJob: (job: LiveJobListing) => void;
  onNavigationClick: () => void;
  onRequestLocation: () => void;
  onDenyLocation: () => void;
  showPermissionPrompt: boolean;
  isLocating: boolean;
  directionJob: LiveJobListing | null;
  onClearDirection: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const LRef = useRef<any>(null);

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
        marker.on("click", () => onSelectJob(job));
        markersRef.current.push(marker);
      } else if (bkoigl || map.project) {
        const el = document.createElement("div");
        el.innerHTML = createJobMarkerHtml(job, isSelected);
        el.style.cursor = "pointer";
        el.addEventListener("click", () => onSelectJob(job));

        const MarkerClass = bkoigl?.Marker || (window as any).maplibregl?.Marker;
        if (MarkerClass) {
          const marker = new MarkerClass({ element: el })
            .setLngLat([job.lng, job.lat])
            .addTo(map);
          markersRef.current.push(marker);
        }
      }
    });
  }, [jobs, userCoords, isLocationGranted, selectedJob, onSelectJob]);

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
        } catch (_) {}
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

        // 1. Draw Real Road Route in Leaflet
        if (L && map.addLayer) {
          if (routeLineRef.current) {
            try { routeLineRef.current.remove(); } catch (_) {}
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
            } catch (_) {}
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
    if (isLocationGranted && mapRef.current) {
      if (mapRef.current.flyTo) {
        mapRef.current.flyTo({ center: [userCoords[1], userCoords[0]], zoom: 15 });
      } else if (mapRef.current.setView) {
        mapRef.current.setView(userCoords, 15);
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

  return (
    <div className="relative w-full h-[480px] sm:h-[560px] md:h-[620px] lg:h-[680px] overflow-hidden">
      {/* Map Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* ── 1. Collapsed Mini Route Pill (Keeps Routing Line on Map) ── */}
      {directionJob && isNavCardMinimized && (
        <div
          onClick={() => setIsNavCardMinimized(false)}
          className="absolute bottom-3 left-3 sm:left-4 z-30 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-xl border border-slate-200/90 flex items-center gap-2.5 cursor-pointer hover:bg-white hover:border-[#C04A22]/30 transition animate-in fade-in zoom-in-95 pointer-events-auto"
          title="Click to view route details"
        >
          <div className="w-6 h-6 rounded-xl bg-[#C04A22]/12 text-[#8C3015] flex items-center justify-center">
            <Navigation className="w-3.5 h-3.5 text-[#C04A22]" />
          </div>
          <div className="text-xs font-bold text-slate-800">
            {directionJob.title} <span className="text-[#C04A22] font-semibold">({directionJob.distanceKm.toFixed(1)} km)</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsNavCardMinimized(false);
            }}
            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 ml-1 cursor-pointer"
            title="Expand Card"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearDirection();
            }}
            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
            title="Clear Route"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ── 2. Google Maps Style Navigation Card (Branded & Clean) ── */}
      {directionJob && !isNavCardMinimized && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:left-4 sm:bottom-4 z-30 w-auto sm:w-[410px] bg-white rounded-3xl p-3.5 sm:p-4 shadow-2xl border border-slate-200/90 animate-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
          
          {/* Drag Handle Top Bar */}
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-2.5" />

          {/* Header: Back Arrow, Origin & Destination Hierarchy, Dropdown/Close */}
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

          {/* Travel Mode Switcher Tabs (Sidebar Active Style) */}
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
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition cursor-pointer hover:text-[#C04A22]"
          title="Recenter to Live Location"
        >
          <Navigation className="w-4.5 h-4.5 text-[#C04A22]" />
        </button>
      </div>
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
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Permission State: "prompt", "granted", or "denied"
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<"prompt" | "granted" | "denied">("prompt");
  const [isLocationGranted, setIsLocationGranted] = useState<boolean>(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState<boolean>(false);

  const defaultCoords: [number, number] = [23.8103, 90.4125];
  const [userCoords, setUserCoords] = useState<[number, number]>(() => {
    try {
      const saved = localStorage.getItem("bkoi_last_user_coords");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
          return [parsed[0], parsed[1]];
        }
      }
    } catch (_) {}
    return defaultCoords;
  });
  const [userLocationName, setUserLocationName] = useState<string>("Dhaka");
  const [userArea, setUserArea] = useState<string>("Dhaka Area");
  const [userCity, setUserCity] = useState<string>("Dhaka");

  // Dynamic Live Jobs List
  const [liveJobs, setLiveJobs] = useState<LiveJobListing[]>(() =>
    generateLiveLocationJobs(defaultCoords[0], defaultCoords[1], "Dhaka Area", "Dhaka")
  );
  const [selectedJob, setSelectedJob] = useState<LiveJobListing | null>(null);
  const [directionJob, setDirectionJob] = useState<LiveJobListing | null>(null);

  // Applicant Form State
  const [applicantName, setApplicantName] = useState("Tarek Mahmud");
  const [applicantPhone, setApplicantPhone] = useState("+880 1712-345678");
  const [applicantStatus, setApplicantStatus] = useState("Immediate Available");
  const [applicantNote, setApplicantNote] = useState("I am interested in this position and available for immediate interview.");

  // Request Live GPS Location with direct OS Device Permission and mobile PWA compatibility
  const executeGeolocation = useCallback((highAccuracy: boolean = true) => {
    setIsLocating(true);
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation is not supported by your browser or device.");
      setIsLocating(false);
      return;
    }

    const handleSuccess = async (position: GeolocationPosition) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setLocationPermissionStatus("granted");
      setIsLocationGranted(true);
      setShowPermissionPrompt(false);
      setUserCoords([lat, lng]);

      try {
        localStorage.setItem("bkoi_last_user_coords", JSON.stringify([lat, lng]));
      } catch (_) {}

      // Fetch real address from BariKoi API
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
    };

    const handleError = (error: GeolocationPositionError) => {
      console.warn("Geolocation error:", error.code, error.message);

      if (highAccuracy && error.code !== 1) {
        // If high accuracy GPS times out on mobile, quickly fallback to cellular/Wi-Fi positioning
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (fallbackErr) => {
            console.warn("Low accuracy fallback also failed:", fallbackErr);
            setIsLocating(false);
            if (fallbackErr.code === 1) {
              setLocationPermissionStatus("denied");
              setIsLocationGranted(false);
              setShowPermissionPrompt(false);
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 120000
          }
        );
        return;
      }

      setIsLocating(false);
      if (error.code === 1) {
        setLocationPermissionStatus("denied");
        setIsLocationGranted(false);
        setShowPermissionPrompt(false);
      } else {
        setLocationPermissionStatus("denied");
        setIsLocationGranted(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: highAccuracy,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  }, []);

  // Direction Handler (Draws route on map & smooth scrolls to map)
  const handleShowDirection = useCallback((job: LiveJobListing) => {
    setDirectionJob(job);
    setSelectedJob(job);
    if (!isLocationGranted) {
      executeGeolocation(true);
    }
    const mapEl = document.getElementById("jobs-map-section");
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isLocationGranted, executeGeolocation]);

  // Navigation Button Click Handler (Directly triggers native OS/Browser Geolocation on user gesture)
  const handleNavigationClick = useCallback(() => {
    executeGeolocation(true);
  }, [executeGeolocation]);

  // On page mount: check if permission already granted in browser
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" as any }).then(perm => {
        if (perm.state === "granted") {
          executeGeolocation(true);
        } else {
          setLocationPermissionStatus(perm.state as any);
          setIsLocationGranted(false);
        }

        perm.onchange = () => {
          if (perm.state === "granted") {
            executeGeolocation(true);
            setShowPermissionPrompt(false);
          } else {
            setLocationPermissionStatus(perm.state);
            setIsLocationGranted(false);
          }
        };
      }).catch(() => {});
    }
  }, [executeGeolocation]);

  // Filter Jobs based on Search Query & Filter Pills
  const filteredJobs = liveJobs.filter(job => {
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q) ||
        job.skills.some(s => s.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }

    // Filter Pills
    if (activeFilter === "nearby" && !job.isNearby) return false;
    if (activeFilter === "fulltime" && job.type !== "Full-time") return false;
    if (activeFilter === "parttime" && job.type !== "Part-time") return false;
    if (activeFilter === "it" && job.category !== "IT & Software" && job.category !== "Design") return false;
    if (activeFilter === "hospitality" && job.category !== "Hospitality" && job.category !== "Sales") return false;

    return true;
  });

  const nearbyJobs = filteredJobs.filter(j => j.isNearby);

  const toggleSave = (id: string) => {
    setSavedJobIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplySubmitted(true);
    setTimeout(() => {
      setApplySubmitted(false);
      setShowApplyModal(null);
    }, 2000);
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
              { id: "nearby", label: "Nearby (< 2 km)" },
              { id: "fulltime", label: "Full-time" },
              { id: "parttime", label: "Part-time" },
              { id: "it", label: "IT & Software" },
              { id: "hospitality", label: "Hospitality & Sales" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
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

        {/* ── BARIKOI LIVE MAP (EXPANDED HEIGHT & MINIMAL SUBTLE BORDER) ────── */}
        <div id="jobs-map-section" className="w-full max-w-7xl mx-auto px-2 sm:px-4 pt-2 sm:pt-3">
          <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs">
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
              onClearDirection={() => setDirectionJob(null)}
            />
          </div>
        </div>

        {/* ── MAIN JOB DIRECTORY CONTENT (2-COLUMN ON DESKTOP) ─────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ════════ LEFT COLUMN: NEARBY FOR YOU (6 cols) ════════ */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                {/* 2-Card Options Matching Screenshot */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Left Option: Nearby Me Jobs */}
                  <div
                    onClick={() => setActiveFilter(activeFilter === "nearby" ? "all" : "nearby")}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer text-center sm:text-left ${
                      activeFilter === "nearby"
                        ? "bg-orange-50/60 border-[#C04A22] ring-1 ring-[#C04A22]/20 shadow-xs"
                        : "bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-xs"
                    }`}
                  >
                    <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                      {nearbyJobs.length} jobs nearby
                    </div>
                  </div>

                  {/* Right Option: Full State Jobs */}
                  <div
                    onClick={() => setActiveFilter("all")}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer text-center sm:text-left ${
                      activeFilter === "all"
                        ? "bg-orange-50/60 border-[#C04A22] ring-1 ring-[#C04A22]/20 shadow-xs"
                        : "bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-xs"
                    }`}
                  >
                    <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                      {liveJobs.length} full state jobs
                    </div>
                  </div>
                </div>

                {/* Job Cards Feed (Screenshot Style) */}
                <div className="space-y-4">
                  {(activeFilter === "nearby" ? nearbyJobs : liveJobs).map(job => {
                    const isSelected = selectedJob?.id === job.id;
                    const isSaved = savedJobIds.includes(job.id);
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`group bg-white rounded-3xl border overflow-hidden transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-[#C04A22] ring-2 ring-[#C04A22]/20 shadow-md"
                            : "border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
                        }`}
                      >
                        {/* Banner Image with Type & Distance Floating Badges */}
                        <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100">
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
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleSave(job.id);
                            }}
                            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-[#C04A22] transition shadow-xs cursor-pointer"
                          >
                            {isSaved ? (
                              <BookmarkCheck className="w-4 h-4 text-[#C04A22]" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 sm:p-5">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-[#C04A22] transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                            {job.company} • {job.location}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>

                          {/* Row 1: Salary Pill */}
                          <div className="mt-3.5 flex items-center justify-between">
                            <span className="px-3 py-1.5 rounded-full bg-orange-50/80 text-[#C04A22] text-xs sm:text-sm font-bold border border-orange-100/60">
                              {job.salary}
                            </span>
                          </div>

                          {/* Row 2: Direction & Apply Buttons (Side by Side) */}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleShowDirection(job);
                              }}
                              className="flex-1 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-[#C04A22] text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 border border-slate-200/80 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
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
                              className="flex-1 px-3.5 py-2 rounded-2xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-xs hover:shadow-sm active:scale-98 cursor-pointer"
                            >
                              <span>Apply</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ════════ RIGHT COLUMN: ALL LOCAL JOBS DIRECTORY (6 cols) ════════ */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Directory Header Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                      <Briefcase className="w-4 h-4 text-[#C04A22]" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        Live Jobs Directory
                      </h2>
                      <p className="text-xs text-slate-500">
                        {filteredJobs.length} verified jobs around {userArea}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Cards Feed (Screenshot Style) */}
              <div className="space-y-4">
                {filteredJobs.map(job => {
                  const isSelected = selectedJob?.id === job.id;
                  const isSaved = savedJobIds.includes(job.id);
                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`group bg-white rounded-3xl border overflow-hidden transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#C04A22] ring-2 ring-[#C04A22]/20 shadow-md"
                          : "border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      {/* Banner Image with Type & Distance Floating Badges */}
                      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100">
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
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleSave(job.id);
                          }}
                          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-[#C04A22] transition shadow-xs cursor-pointer"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-[#C04A22]" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 sm:p-5">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-[#C04A22] transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                          {job.company} • {job.location}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Row 1: Salary Pill */}
                        <div className="mt-3.5 flex items-center justify-between">
                          <span className="px-3 py-1.5 rounded-full bg-orange-50/80 text-[#C04A22] text-xs sm:text-sm font-bold border border-orange-100/60">
                            {job.salary}
                          </span>
                        </div>

                        {/* Row 2: Direction & Apply Buttons (Side by Side) */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleShowDirection(job);
                            }}
                            className="flex-1 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-[#C04A22] text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 border border-slate-200/80 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
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
                            className="flex-1 px-3.5 py-2 rounded-2xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-xs hover:shadow-sm active:scale-98 cursor-pointer"
                          >
                            <span>Apply</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ── QUICK APPLY MODAL ────────────────────────────────────────────── */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C04A22]">
                    Quick Application
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {showApplyModal.title}
                  </h3>
                  <p className="text-xs text-slate-500">{showApplyModal.company} • {showApplyModal.location}</p>
                </div>
                <button
                  onClick={() => setShowApplyModal(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              {applySubmitted ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl animate-bounce">
                    ✓
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Application Submitted!</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your details have been sent to <b>{showApplyModal.company}</b>. The employer will contact you directly via phone or WhatsApp.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="p-5 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={e => setApplicantName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C04A22]/20 focus:border-[#C04A22]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                      <input
                        type="text"
                        required
                        value={applicantPhone}
                        onChange={e => setApplicantPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C04A22]/20 focus:border-[#C04A22]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Availability</label>
                      <select
                        value={applicantStatus}
                        onChange={e => setApplicantStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C04A22]/20 focus:border-[#C04A22]"
                      >
                        <option>Immediate Available</option>
                        <option>Available in 1-2 Weeks</option>
                        <option>Part-time / Flexible</option>
                        <option>Weekend Shifts Only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quick Note / Skills</label>
                    <textarea
                      rows={3}
                      value={applicantNote}
                      onChange={e => setApplicantNote(e.target.value)}
                      placeholder="Mention your relevant experience, language skills, or availability..."
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C04A22]/20 focus:border-[#C04A22]"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Application
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
