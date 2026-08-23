import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Search, MapPin, Briefcase, DollarSign, Clock, Star,
  Shield, CheckCircle2, Phone, MessageCircle, ExternalLink,
  ChevronRight, Filter, ChevronLeft, Bookmark, BookmarkCheck,
  Send, Sparkles, Home, Building2, User, Layers, Eye, X,
  Map as MapIcon, ArrowUpRight, Compass, Check, AlertCircle,
  Plus, Minus, RotateCcw, Navigation, RefreshCw, Loader2
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

// ─── Cached Initial Coordinates Helper ──────────────────────────────────────

const getCachedUserCoords = (): [number, number] => {
  try {
    const cached = localStorage.getItem("bkoi_last_user_coords");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length === 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
        return parsed as [number, number];
      }
    }
  } catch (_) {}
  return [23.8103, 90.4125];
};

// ─── BariKoi Reverse Geocode API ────────────────────────────────────────────

async function fetchBariKoiReverseGeocode(lat: number, lng: number) {
  const url = `https://barikoi.xyz/v2/api/search/reverse/geocode?api_key=${BARIKOI_API_KEY}&longitude=${lng}&latitude=${lat}&district=true&post_code=true&country=true&sub_district=true&union=true&pauroshova=true&location_type=true&division=true&address=true&area=true&bangla=true`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data?.place) {
      return {
        address: data.place.address || data.place.area || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        area: data.place.area || data.place.sub_district || data.place.district || "Your Area",
        district: data.place.district || "",
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
    { title: "Senior Frontend Developer (React / Next.js)", company: "TechHive Digital Labs", category: "IT & Software", salary: "৳65,000 – ৳95,000/mo", type: "Full-time", tags: ["React", "TypeScript", "Tailwind"], dLat: 0.0028, dLng: 0.0032, logo: "💻", exp: "2+ yrs experience", desc: "Developing responsive web applications and interactive UI dashboards. Flexible working hours, health coverage & yearly festival bonuses." },
    { title: "Executive Chef & Kitchen Supervisor", company: "Heritage Dine & Lounge", category: "Hospitality", salary: "৳35,000 – ৳48,000/mo", type: "Full-time", tags: ["Culinary", "Kitchen Prep", "Meals Included"], dLat: -0.0022, dLng: 0.0025, logo: "🍽️", exp: "1+ yrs experience", desc: "Overseeing menu preparation, culinary hygiene and kitchen staff management. Daily meals & attendance bonus provided." },
    { title: "Accounts & Financial Officer", company: "Apex Business Solutions", category: "Finance", salary: "৳40,000 – ৳55,000/mo", type: "Full-time", tags: ["Tally", "QuickBooks", "Taxation"], dLat: 0.0038, dLng: -0.0029, logo: "📊", exp: "Graduate in BBA/Accounting", desc: "Handling ledger entries, invoice reconciliation and monthly payroll processing. Proactive team environment." },
    { title: "Express Delivery Rider (Bike/Cycle)", company: "QuickDrop Courier Express", category: "Logistics", salary: "৳22,000 – ৳32,000/mo", type: "Full-time", tags: ["Flexible Shifts", "Daily Fuel Bonus"], dLat: -0.0034, dLng: -0.0019, logo: "🛵", exp: "Own bike / Smartphone", desc: "Parcel and document delivery within nearby zones. Guaranteed weekly payment + delivery commission incentives." },
    { title: "Registered Pharmacist / Chemist", company: "CarePlus Pharmacy & Wellness", category: "Healthcare", salary: "৳32,000 – ৳45,000/mo", type: "Full-time", tags: ["B.Pharm / Diploma", "Medicine Dispensing"], dLat: 0.0014, dLng: -0.0038, logo: "💊", exp: "Diploma in Pharmacy", desc: "Dispensing OTC and prescription medicines, patient counseling and inventory control in a modern pharmacy setup." },
    { title: "Sales & Customer Relations Executive", company: "Prime Retail Mart", category: "Sales", salary: "৳25,000 – ৳35,000/mo + Comm", type: "Full-time", tags: ["Retail Sales", "Customer Service"], dLat: -0.0024, dLng: 0.0042, logo: "🛍️", exp: "HSC / Graduate", desc: "Showroom customer assistance, billing and product merchandising. Performance commission on monthly targets." },
    { title: "UI/UX & Visual Designer", company: "PixelCraft Design Studio", category: "Design", salary: "৳50,000 – ৳75,000/mo", type: "Full-time", tags: ["Figma", "Mobile UI", "Portfolio"], dLat: 0.0046, dLng: 0.0018, logo: "🎨", exp: "Portfolio required", desc: "Designing intuitive mobile app interfaces, design systems and interactive prototypes for high-growth tech startups." },
    { title: "Branch Operations Supervisor", company: "National Logistics Hub", category: "Operations", salary: "৳38,000 – ৳52,000/mo", type: "Full-time", tags: ["Warehouse", "Team Leadership"], dLat: -0.0042, dLng: 0.0035, logo: "📦", exp: "2+ yrs experience", desc: "Supervising hub operations, vehicle loading schedules and package routing with dispatch teams." },
    { title: "Digital Marketing & Content Specialist", company: "GrowthWave Media", category: "Marketing", salary: "৳30,000 – ৳45,000/mo", type: "Part-time", tags: ["Social Media", "SEO", "Copywriting"], dLat: 0.0055, dLng: -0.0045, logo: "📱", exp: "Content & Ad management", desc: "Managing social media campaigns, SEO content strategy and Google ads for e-commerce brands." },
    { title: "Electrical & Maintenance Technician", company: "SmartFix Facility Services", category: "Technical", salary: "৳28,000 – ৳36,000/mo", type: "Full-time", tags: ["Wiring", "HVAC Maintenance"], dLat: -0.0048, dLng: -0.0036, logo: "⚡", exp: "Technical Trade certificate", desc: "Commercial facility electrical troubleshooting, generator maintenance and HVAC servicing." },
    { title: "Quality Assurance (QA) Engineer", company: "SoftVibe Technologies", category: "IT & Software", salary: "৳55,000 – ৳80,000/mo", type: "Full-time", tags: ["Manual & Automation", "Postman"], dLat: 0.0061, dLng: 0.0052, logo: "🔍", exp: "1-3 yrs QA experience", desc: "Writing test cases, API testing and bug tracking for fintech web & mobile applications." },
    { title: "Call Center & Customer Support Agent", company: "ConnectGlobal BPO", category: "Customer Care", salary: "৳24,000 – ৳32,000/mo", type: "Part-time", tags: ["Inbound Calls", "Night/Day Shift"], dLat: -0.0058, dLng: 0.0062, logo: "🎧", exp: "Fluent English & Bengali", desc: "Handling inbound customer queries via phone and live chat. Professional air-conditioned workstation with pick & drop." }
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
  jobs,
  selectedJob,
  onSelectJob,
  onRecenter
}: {
  userCoords: [number, number];
  jobs: LiveJobListing[];
  selectedJob: LiveJobListing | null;
  onSelectJob: (job: LiveJobListing) => void;
  onRecenter: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
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

    // 1. Sync / Update User Live GPS Marker
    if (userMarkerRef.current) {
      if (userMarkerRef.current.setLngLat) {
        userMarkerRef.current.setLngLat([userCoords[1], userCoords[0]]);
      } else if (userMarkerRef.current.setLatLng) {
        userMarkerRef.current.setLatLng(userCoords);
      }
    } else {
      if (L && map.addLayer) {
        // Leaflet User Marker
        const userIcon = L.divIcon({
          className: "bkoi-user-marker",
          html: createUserMarkerHtml(),
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        const userM = L.marker(userCoords, { icon: userIcon }).addTo(map);
        userMarkerRef.current = userM;
      } else if (bkoigl || map.project) {
        // BariKoi GL User Marker
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
  }, [jobs, userCoords, selectedJob, onSelectJob]);

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
          zoom: 14.8,
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

  // Fly to selected job on selection change
  useEffect(() => {
    if (!mapRef.current || !selectedJob) return;
    const map = mapRef.current;
    if (map.flyTo) {
      map.flyTo({
        center: [selectedJob.lng, selectedJob.lat],
        zoom: 15.5,
        speed: 1.2
      });
    } else if (map.panTo) {
      map.panTo([selectedJob.lat, selectedJob.lng]);
    }
  }, [selectedJob]);

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
    onRecenter();
    if (!mapRef.current) return;
    if (mapRef.current.flyTo) {
      mapRef.current.flyTo({ center: [userCoords[1], userCoords[0]], zoom: 15 });
    } else if (mapRef.current.setView) {
      mapRef.current.setView(userCoords, 15);
    }
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[440px] md:h-[480px] lg:h-[520px] overflow-hidden">
      {/* Map Container */}
      <div ref={containerRef} className="w-full h-full" />

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
  const [isLocating, setIsLocating] = useState(true);

  // Cached Precise Location Initialization (Avoids jumping from wrong center)
  const initialCoords = getCachedUserCoords();
  const [userCoords, setUserCoords] = useState<[number, number]>(initialCoords);
  const [userLocationName, setUserLocationName] = useState<string>("Locating...");
  const [userArea, setUserArea] = useState<string>("Your Location");
  const [userCity, setUserCity] = useState<string>("Dhaka");

  // Dynamic Live Jobs List initialized with immediate nearby jobs
  const [liveJobs, setLiveJobs] = useState<LiveJobListing[]>(() =>
    generateLiveLocationJobs(initialCoords[0], initialCoords[1], "Your Area", "Dhaka")
  );
  const [selectedJob, setSelectedJob] = useState<LiveJobListing | null>(null);

  // Applicant Form State
  const [applicantName, setApplicantName] = useState("Tarek Mahmud");
  const [applicantPhone, setApplicantPhone] = useState("+880 1712-345678");
  const [applicantStatus, setApplicantStatus] = useState("Immediate Available");
  const [applicantNote, setApplicantNote] = useState("I am interested in this position and available for immediate interview.");

  // Request Live GPS Location with High Accuracy & Instant Pinpointing
  const requestLiveLocation = useCallback(() => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Save accurate GPS coordinates to cache
          try {
            localStorage.setItem("bkoi_last_user_coords", JSON.stringify([lat, lng]));
          } catch (_) {}

          setUserCoords([lat, lng]);

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
        },
        (error) => {
          console.warn("Geolocation fallback:", error);
          const coords = getCachedUserCoords();
          setUserCoords(coords);
          const generated = generateLiveLocationJobs(coords[0], coords[1], "Near You", "Local City");
          setLiveJobs(generated);
          setSelectedJob(generated[0]);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      const coords = getCachedUserCoords();
      const generated = generateLiveLocationJobs(coords[0], coords[1], "Near You", "Local City");
      setLiveJobs(generated);
      setSelectedJob(generated[0]);
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    requestLiveLocation();
  }, [requestLiveLocation]);

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

        {/* ── BARIKOI LIVE MAP (WITH SUBTLE MINIMAL BORDER) ────── */}
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 pt-2 sm:pt-3">
          <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs">
            <BariKoiLiveJobsMap
              userCoords={userCoords}
              jobs={filteredJobs}
              selectedJob={selectedJob}
              onSelectJob={job => setSelectedJob(job)}
              onRecenter={requestLiveLocation}
            />
          </div>
        </div>

        {/* ── MAIN JOB DIRECTORY CONTENT (2-COLUMN ON DESKTOP) ─────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ════════ LEFT COLUMN: NEARBY FOR YOU (6 cols) ════════ */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    nearby for you
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">
                    {nearbyJobs.length} jobs near {userArea}
                  </span>
                </div>

                {/* Nearby Jobs List */}
                <div className="space-y-3">
                  {nearbyJobs.map(job => {
                    const isSelected = selectedJob?.id === job.id;
                    const isSaved = savedJobIds.includes(job.id);
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#C04A22] ring-1 ring-[#C04A22]/20 shadow-sm"
                            : "border-slate-200/80 hover:border-slate-300 hover:shadow-2xs"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-xl flex items-center justify-center flex-shrink-0">
                              {job.logo}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-bold text-slate-900 truncate">
                                  {job.title}
                                </h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                  {job.type}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                                <span>{job.company}</span>
                                <span>•</span>
                                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3" />
                                  {job.distance}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Save Bookmark */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleSave(job.id);
                            }}
                            className="text-slate-400 hover:text-[#C04A22] transition p-1"
                          >
                            {isSaved ? (
                              <BookmarkCheck className="w-4.5 h-4.5 text-[#C04A22]" />
                            ) : (
                              <Bookmark className="w-4.5 h-4.5" />
                            )}
                          </button>
                        </div>

                        {/* Salary & Details */}
                        <div className="mt-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div className="font-bold text-slate-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                            {job.salary}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">{job.category}</span>
                            <span>•</span>
                            <span className="text-slate-400">{job.posted}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Skills and Apply CTA */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {job.skills.map(skill => (
                              <span
                                key={skill}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${job.contactPhone}`}
                              onClick={e => e.stopPropagation()}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              Call
                            </a>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setShowApplyModal(job);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs font-bold shadow-xs transition"
                            >
                              Quick Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ════════ RIGHT COLUMN: ALL LOCAL JOBS DIRECTORY (5 cols) ════════ */}
            <div className="lg:col-span-5 space-y-4">
              
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

              {/* Job Cards Feed */}
              <div className="space-y-3">
                {filteredJobs.map(job => {
                  const isSelected = selectedJob?.id === job.id;
                  const isSaved = savedJobIds.includes(job.id);
                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#C04A22] ring-1 ring-[#C04A22]/20 shadow-sm"
                          : "border-slate-200/80 hover:border-slate-300 hover:shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-lg flex items-center justify-center flex-shrink-0">
                            {job.logo}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {job.title}
                            </h3>
                            <div className="text-xs text-slate-500 font-medium mt-0.5">
                              {job.company} • <span className="text-slate-700 font-semibold">{job.distance}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleSave(job.id);
                          }}
                          className="text-slate-400 hover:text-[#C04A22] p-1"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-[#C04A22]" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Salary & Type Badges */}
                      <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap text-xs">
                        <span className="font-bold text-slate-900 text-xs">
                          {job.salary}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {job.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Footer Info & Action */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {job.posted} • {job.spots} spot{job.spots > 1 ? "s" : ""} left
                        </div>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setShowApplyModal(job);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-[#C04A22] text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          Apply <ArrowUpRight className="w-3 h-3" />
                        </button>
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
