import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Search, MapPin, Navigation, Star, Clock, Phone,
  Bookmark, Share2, MessageCircle, List, Map as MapIcon, X,
  CheckCircle, ChevronRight, Car, Bike, Footprints, AlertTriangle,
  DollarSign, Timer, Route, ArrowLeft, Loader2, ChevronDown, Store,
  Building2, ExternalLink, Briefcase, Maximize2
} from "lucide-react";

import { LiveJobListing, generateLiveLocationJobs, isJobQuery } from "../data/jobsData";
import { JobDetailsModal } from "../components/jobs/JobDetailsModal";
import type { Map as LeafletMapType } from "leaflet";

// ── Types ─────────────────────────────────────────────────────────────────────
type TravelMode = "car" | "bike" | "walk";
type TrafficLevel = "clear" | "moderate" | "heavy";
type RouteOption = {
  id: number;
  label: string;
  coords: [number, number][];
  distance: number;   // metres
  duration: number;   // seconds
  traffic: TrafficLevel;
  trafficSegments: { coords: [number, number][]; level: TrafficLevel }[];
  cost: string;
};

// ── BariKoi Map API Key ────────────────────────────────────────────────────────
const BARIKOI_API_KEY = import.meta.env.VITE_BARIKOI_API_KEY || "bkoi_e25928917c9e7b36a3286d75f446427fa3433bf87361b2fd8c8d6c942300a38f";

// ── Helpers ───────────────────────────────────────────────────────────────────
const OSRM_PROFILES: Record<TravelMode, string> = {
  car: "driving", bike: "cycling", walk: "foot",
};

function trafficColor(level: TrafficLevel | undefined) {
  return level === "clear" ? "#22c55e" : level === "moderate" ? "#f59e0b" : "#ef4444";
}

function trafficLabel(level: TrafficLevel) {
  return level === "clear" ? "🟢 Clear" : level === "moderate" ? "🟡 Moderate traffic" : "🔴 Heavy traffic";
}

function fmtDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}
function fmtTime(s: number) {
  if (s < 60) return `${Math.round(s)} sec`;
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}
function estimateCost(mode: TravelMode, m: number) {
  const miles = m / 1609.34;
  if (mode === "car") return `$${(miles * 0.21 + 1.5).toFixed(2)}`; // fuel ~21¢/mi + parking
  if (mode === "bike") return miles > 2 ? "$4.49" : "Free";          // Citi Bike threshold
  return "Free";
}

// Simulate traffic: rush-hour + route-index variance
function simulateTraffic(routeIdx: number, seed: number): TrafficLevel {
  const h = new Date().getHours();
  const rush = (h >= 7 && h <= 9) || (h >= 17 && h <= 19);
  const base = rush ? 1 : 0;
  const val = (base + routeIdx + (seed % 3)) % 3;
  return val === 0 ? "clear" : val === 1 ? "moderate" : "heavy";
}

// Split a polyline into traffic-colored segments (simulate hot-spots)
function splitSegments(
  coords: [number, number][],
  baseLevel: TrafficLevel,
  seed: number
): { coords: [number, number][]; level: TrafficLevel }[] {
  if (coords.length < 4) return [{ coords, level: baseLevel }];
  const levels: TrafficLevel[] = ["clear", "moderate", "heavy"];
  const n = Math.min(3, Math.floor(coords.length / 4));
  const step = Math.floor(coords.length / (n + 1));
  const segs: { coords: [number, number][]; level: TrafficLevel }[] = [];
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const cut = step * (i + 1);
    const lvl = levels[(levels.indexOf(baseLevel) + i + seed) % 3];
    segs.push({ coords: coords.slice(prev, cut + 1), level: lvl });
    prev = cut;
  }
  segs.push({ coords: coords.slice(prev), level: baseLevel });
  return segs;
}

// Polyline decoder for BariKoi / OSRM encoded route geometry strings
function decodePolyline(str: string, precision = 5): [number, number][] {
  let index = 0, lat = 0, lng = 0, coordinates: [number, number][] = [];
  const factor = Math.pow(10, precision);
  while (index < str.length) {
    let b, shift = 0, result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    coordinates.push([lat / factor, lng / factor]);
  }
  return coordinates;
}

// BariKoi Reverse Geocode API
export async function fetchBariKoiReverseGeocode(lat: number, lng: number) {
  const url = `https://barikoi.xyz/v2/api/search/reverse/geocode?api_key=${BARIKOI_API_KEY}&longitude=${lng}&latitude=${lat}&district=true&post_code=true&country=true&sub_district=true&union=true&pauroshova=true&location_type=true&division=true&address=true&area=true&bangla=true`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data?.place) {
      return {
        address: data.place.address || data.place.area || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        area: data.place.area || "",
        district: data.place.district || "",
        postCode: data.place.postCode || "",
        city: data.place.city || data.place.division || "",
      };
    }
  } catch (err) {
    console.error("BariKoi Reverse Geocode error:", err);
  }
  return null;
}

// Fetch real routes using BariKoi Route API
async function fetchRoutes(
  from: [number, number],
  to: [number, number],
  mode: TravelMode
): Promise<RouteOption[]> {
  const barikoiUrl = `https://barikoi.xyz/v2/api/route/${from[1]},${from[0]};${to[1]},${to[0]}?api_key=${BARIKOI_API_KEY}&geometries=polyline`;
  try {
    const res = await fetch(barikoiUrl, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    let coords: [number, number][] = [];

    if (data?.routes?.length) {
      const r = data.routes[0];
      if (Array.isArray(r.geometry?.coordinates)) {
        coords = r.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
      } else if (typeof r.geometry === "string") {
        coords = decodePolyline(r.geometry);
      }
    } else if (data?.route) {
      if (typeof data.route === "string") {
        coords = decodePolyline(data.route);
      } else if (Array.isArray(data.route)) {
        coords = data.route.map((c: any) => [c.latitude || c[1], c.longitude || c[0]]);
      }
    }

    if (coords.length >= 2) {
      const traffic = simulateTraffic(0, to[0] * 10 | 0);
      return [{
        id: 0,
        label: "BariKoi Route",
        coords,
        distance: 3500,
        duration: 720,
        traffic,
        trafficSegments: splitSegments(coords, traffic, (to[1] * 10 | 0)),
        cost: estimateCost(mode, 3500),
      }];
    }
  } catch (err) {
    console.warn("BariKoi route API fallback:", err);
  }

  // Fallback to OSRM if BariKoi route fails
  const profile = OSRM_PROFILES[mode];
  const url = `https://router.project-osrm.org/route/v1/${profile}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&alternatives=true`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) throw new Error("no route");
    return data.routes.slice(0, 3).map((r: any, i: number) => {
      const coords: [number, number][] = r.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );
      const traffic = simulateTraffic(i, to[0] * 10 | 0);
      return {
        id: i,
        label: i === 0 ? "Fastest Route" : i === 1 ? "Alternative" : "Scenic Route",
        coords,
        distance: r.distance,
        duration: r.duration,
        traffic,
        trafficSegments: splitSegments(coords, traffic, i + (to[1] * 10 | 0)),
        cost: estimateCost(mode, r.distance),
      } as RouteOption;
    });
  } catch {
    const dist = Math.hypot(to[0] - from[0], to[1] - from[1]) * 111000;
    const dur = mode === "car" ? dist / 11 : mode === "bike" ? dist / 4.5 : dist / 1.4;
    const coords: [number, number][] = [from, [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2], to];
    return [
      {
        id: 0,
        label: "Direct Route",
        coords,
        distance: dist,
        duration: dur,
        traffic: "clear",
        trafficSegments: [{ coords, level: "clear" }],
        cost: estimateCost(mode, dist),
      },
    ];
  }
}

// ── Category config ───────────────────────────────────────────────────────────
const categoryColors: Record<string, string> = {
  "🪑 Used Furniture": "#d97706",
  "🏢 Furniture Agency": "#ca8a04",
  "🛍️ Furniture Shop": "#b45309",
  "📦 Furniture Resale": "#92400e",
  "🕌 Mosque": "#f97316", "⛪ Church": "#f97316", "🛕 Temple": "#f97316",
  "⚖️ Legal Aid": "#0891b2", "🛒 Grocery": "#10b981",
  "🏥 Hospital": "#ef4444", "🏥 Clinic": "#ef4444",
  "📚 Library": "#8b5cf6", "🚗 DMV": "#64748b",
  "🏫 School": "#2563eb", "🏛️ Community Center": "#7c3aed",
  "🍽️ Restaurant": "#db2777", "🏦 Bank": "#0d9488", "🚌 Transit": "#64748b",
  // Job Category Colors
  "💻 IT & Software": "#C04A22",
  "🍽️ Hospitality": "#d97706",
  "📊 Finance": "#0891b2",
  "🛵 Logistics": "#f97316",
  "💊 Healthcare": "#ef4444",
  "🛍️ Sales": "#db2777",
  "🎨 Design": "#8b5cf6",
  "📦 Operations": "#92400e",
  "📱 Marketing": "#2563eb",
  "⚡ Technical": "#ca8a04",
  "🔍 IT & Software": "#C04A22",
  "🎧 Customer Care": "#0d9488",
  "💼 Jobs": "#C04A22",
};

const categoryIcons: Record<string, string> = {
  "🪑 Used Furniture": "🪑",
  "🏢 Furniture Agency": "🏢",
  "🛍️ Furniture Shop": "🛍️",
  "📦 Furniture Resale": "📦",
  "🕌 Mosque": "🕌", "⛪ Church": "⛪", "🛕 Temple": "🛕",
  "⚖️ Legal Aid": "⚖️", "🛒 Grocery": "🛒",
  "🏥 Hospital": "🏥", "🏥 Clinic": "🏥",
  "📚 Library": "📚", "🚗 DMV": "🚗",
  "🏫 School": "🏫", "🏛️ Community Center": "🏛️",
  "🍽️ Restaurant": "🍽️", "🏦 Bank": "🏦", "🚌 Transit": "🚌",
  // Job Category Icons
  "💻 IT & Software": "💻",
  "🍽️ Hospitality": "🍽️",
  "📊 Finance": "📊",
  "🛵 Logistics": "🛵",
  "💊 Healthcare": "💊",
  "🛍️ Sales": "🛍️",
  "🎨 Design": "🎨",
  "📦 Operations": "📦",
  "📱 Marketing": "📱",
  "⚡ Technical": "⚡",
  "🔍 IT & Software": "🔍",
  "🎧 Customer Care": "🎧",
  "💼 Jobs": "💼",
};

const categoryMap: Record<string, string[]> = {
  jobs: [
    "💻 IT & Software", "🍽️ Hospitality", "📊 Finance", "🛵 Logistics",
    "💊 Healthcare", "🛍️ Sales", "🎨 Design", "📦 Operations",
    "📱 Marketing", "⚡ Technical", "🔍 IT & Software", "🎧 Customer Care", "💼 Jobs"
  ],
  furniture: ["🪑 Used Furniture", "🏢 Furniture Agency", "🛍️ Furniture Shop", "📦 Furniture Resale"],
  religious: ["🕌 Mosque", "⛪ Church", "🛕 Temple"],
  schools: ["🏫 School"], grocery: ["🛒 Grocery"],
  hospital: ["🏥 Hospital", "🏥 Clinic"], legal: ["⚖️ Legal Aid"],
  community: ["🏛️ Community Center"], restaurant: ["🍽️ Restaurant"],
  bank: ["🏦 Bank"], dmv: ["🚗 DMV"], library: ["📚 Library"],
  transport: ["🚌 Transit"],
};

const categories = [
  { id: "all", label: "All", emoji: "📍" },
  { id: "jobs", label: "Jobs", emoji: "💼" },
  { id: "furniture", label: "Furniture", emoji: "🪑" },
  { id: "religious", label: "Religious", emoji: "🕌" },
  { id: "schools", label: "Schools", emoji: "🏫" },
  { id: "grocery", label: "Grocery", emoji: "🛒" },
  { id: "hospital", label: "Hospital", emoji: "🏥" },
  { id: "legal", label: "Legal Help", emoji: "⚖️" },
  { id: "community", label: "Community", emoji: "🏛️" },
  { id: "restaurant", label: "Restaurant", emoji: "🍽️" },
  { id: "bank", label: "Bank", emoji: "🏦" },
  { id: "dmv", label: "DMV", emoji: "🚗" },
  { id: "library", label: "Library", emoji: "📚" },
  { id: "transport", label: "Transport", emoji: "🚌" },
];

export type Place = {
  id: number | string;
  lat: number;
  lng: number;
  name: string;
  category: string;
  distance: string;
  rating: number;
  reviews: number;
  open: boolean;
  openUntil: string;
  address: string;
  phone: string;
  languages: string[];
  immigrantFriendly: boolean;
  description: string;
  image: string;
  isJob?: boolean;
  jobData?: LiveJobListing;
};

const places: Place[] = [
  // ── Used Furniture Shops & Agencies ──
  { id: 28, lat: 23.7925, lng: 90.4078, name: "Gulshan Used Furniture & Resale", category: "🪑 Used Furniture", distance: "0.5 km", rating: 4.8, reviews: 312, open: true, openUntil: "8:00 PM", address: "Road 11, Gulshan-1, Dhaka", phone: "+880 1711-424998", languages: ["Bengali", "English"], immigrantFriendly: true, description: "Affordable pre-owned sofas, dining tables, beds, and household furniture. Delivery available across Dhaka.", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=200&fit=crop" },
  { id: 29, lat: 23.7937, lng: 90.4045, name: "Banani Furniture Agency & Thrift", category: "🏢 Furniture Agency", distance: "1.1 km", rating: 4.7, reviews: 245, open: true, openUntil: "7:00 PM", address: "Road 11, Block D, Banani, Dhaka", phone: "+880 1819-899771", languages: ["Bengali", "English"], immigrantFriendly: true, description: "Community agency providing discounted gently used furniture, desks, and home decor.", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=200&fit=crop" },
  { id: 30, lat: 23.7465, lng: 90.3760, name: "Dhanmondi Vintage Furniture Shop", category: "🛍️ Furniture Shop", distance: "1.4 km", rating: 4.9, reviews: 189, open: true, openUntil: "9:00 PM", address: "Road 27, Dhanmondi, Dhaka", phone: "+880 1912-651332", languages: ["Bengali", "English"], immigrantFriendly: true, description: "Quality second-hand wooden furniture, wardrobes, mattresses, and kitchen appliances.", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=200&fit=crop" },
  { id: 31, lat: 23.8759, lng: 90.3795, name: "Uttara Home Furniture Depot", category: "📦 Furniture Resale", distance: "1.8 km", rating: 4.6, reviews: 154, open: true, openUntil: "6:30 PM", address: "Sector 3, Uttara, Dhaka", phone: "+880 1611-458900", languages: ["Bengali", "English"], immigrantFriendly: true, description: "Bulk resale agency for bedroom sets, living room furniture, and home setup packages.", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=200&fit=crop" },

  // ── Existing Community Places ──
  { id: 1, lat: 23.7315, lng: 90.4075, name: "Baitul Mukarram National Mosque", category: "🕌 Mosque", distance: "0.3 km", rating: 4.9, reviews: 1242, open: true, openUntil: "9:00 PM", address: "Paltan, Dhaka", phone: "+880 2-9556000", languages: ["Bengali", "Arabic", "English"], immigrantFriendly: true, description: "National mosque of Bangladesh.", image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400&h=200&fit=crop" },
  { id: 2, lat: 23.7915, lng: 90.4140, name: "Gulshan Society Mosque", category: "🕌 Mosque", distance: "1.2 km", rating: 4.8, reviews: 418, open: true, openUntil: "10:00 PM", address: "Gulshan-2, Dhaka", phone: "+880 2-9895088", languages: ["Bengali", "English"], immigrantFriendly: true, description: "Modern community mosque in Gulshan.", image: "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&h=200&fit=crop" },
  { id: 3, lat: 23.7540, lng: 90.3920, name: "Tejgaon Holy Rosary Church", category: "⛪ Church", distance: "2.0 km", rating: 4.7, reviews: 256, open: true, openUntil: "8:30 PM", address: "Tejgaon, Dhaka", phone: "+880 2-9114081", languages: ["Bengali", "English"], immigrantFriendly: true, description: "Historic 17th-century Portuguese church in Dhaka.", image: "https://images.unsplash.com/photo-1543499859-4f4e3bb8d80a?w=400&h=200&fit=crop" },
  { id: 4, lat: 23.7240, lng: 90.3960, name: "Dhakeshwari National Temple", category: "🛕 Temple", distance: "1.8 km", rating: 4.8, reviews: 598, open: true, openUntil: "8:00 PM", address: "Bakshi Bazar, Old Dhaka", phone: "+880 2-9661011", languages: ["Bengali", "English"], immigrantFriendly: true, description: "National Hindu temple of Bangladesh.", image: "https://images.unsplash.com/photo-1609153897327-f62dfb7caf22?w=400&h=200&fit=crop" },
  { id: 5, lat: 23.7260, lng: 90.3975, name: "Dhaka University Campus", category: "🏫 School", distance: "1.5 km", rating: 4.9, reviews: 2421, open: true, openUntil: "8:00 PM", address: "Nilkhet, Dhaka", phone: "+880 2-9661900", languages: ["Bengali", "English"], immigrantFriendly: true, description: "Premier research university in Bangladesh.", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=200&fit=crop" },
  { id: 6, lat: 23.8150, lng: 90.4240, name: "North South University", category: "🏫 School", distance: "3.1 km", rating: 4.8, reviews: 1312, open: true, openUntil: "8:00 PM", address: "Bashundhara R/A, Dhaka", phone: "+880 2-55668200", languages: ["English", "Bengali"], immigrantFriendly: true, description: "First private university in Bangladesh with world-class campus.", image: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=400&h=200&fit=crop" },
  { id: 7, lat: 23.7930, lng: 90.4050, name: "Unimart Superstore", category: "🛒 Grocery", distance: "0.8 km", rating: 4.9, reviews: 967, open: true, openUntil: "10:00 PM", address: "Gulshan Centre Point, Gulshan-2, Dhaka", phone: "+880 9612-555555", languages: ["Bengali", "English"], immigrantFriendly: true, description: "Premium hypermarket with international & local groceries.", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop" },
  { id: 8, lat: 23.7780, lng: 90.4170, name: "Square Hospital", category: "🏥 Hospital", distance: "1.4 km", rating: 4.7, reviews: 1204, open: true, openUntil: "24h", address: "18/F West Panthapath, Dhaka", phone: "+880 2-8159457", languages: ["Bengali", "English"], immigrantFriendly: true, description: "Tertiary care hospital with international standards.", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=200&fit=crop" },
  { id: 9, lat: 23.8120, lng: 90.4230, name: "Evercare Hospital Dhaka", category: "🏥 Hospital", distance: "3.2 km", rating: 4.8, reviews: 1876, open: true, openUntil: "24h", address: "Plot 81, Block E, Bashundhara R/A, Dhaka", phone: "+880 2-8431661", languages: ["Bengali", "English"], immigrantFriendly: true, description: "JCI-accredited super specialty hospital.", image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=200&fit=crop" },
  { id: 10, lat: 23.7910, lng: 90.4020, name: "KFC Banani", category: "🍽️ Restaurant", distance: "1.1 km", rating: 4.6, reviews: 545, open: true, openUntil: "11:00 PM", address: "Road 11, Banani, Dhaka", phone: "+880 2-9883445", languages: ["Bengali", "English"], immigrantFriendly: true, description: "Famous quick service restaurant.", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=200&fit=crop" },
];


// ── Hover tooltip card (desktop only) ────────────────────────────────────────
function HoverTooltipCard({
  place, px, containerW, containerH, onDirections, onViewDetails,
}: {
  place: Place; px: { x: number; y: number }; containerW: number; containerH: number;
  onDirections: (p: Place) => void; onViewDetails: (p: Place) => void;
}) {
  const [saved, setSaved] = useState(false);
  const CARD_W = place.isJob ? 280 : 260;
  const CARD_H = place.isJob ? 240 : 270;
  const MARKER_H = 42;
  const GAP = 10;
  const color = categoryColors[place.category] ?? "#C04A22";

  // Default: above the pin
  let left = px.x - CARD_W / 2;
  let top = px.y - MARKER_H - CARD_H - GAP;

  left = Math.max(6, Math.min(left, containerW - CARD_W - 6));

  if (top < 6) {
    const rightLeft = px.x + 20 + GAP;
    if (rightLeft + CARD_W <= containerW - 6) {
      left = rightLeft;
    } else {
      left = Math.max(6, px.x - CARD_W - 20 - GAP);
    }
    top = Math.max(6, Math.min(px.y - CARD_H / 2, containerH - CARD_H - 6));
  }

  // Job specific hover card
  if (place.isJob && place.jobData) {
    const job = place.jobData;
    return (
      <div
        className="absolute z-[999] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto p-3.5 animate-in fade-in zoom-in-95 duration-150"
        style={{ left, top, width: CARD_W, transition: "left 0.12s ease, top 0.12s ease" }}
      >
        <div className="flex items-start gap-2.5 mb-2">
          <span className="text-2xl flex-shrink-0">{job.logo}</span>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{job.title}</h4>
            <p className="text-[11px] text-slate-600 truncate flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{job.company}</span>
              <span>•</span>
              <span className="text-[#C04A22] font-semibold">{job.distance}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 my-2">
          <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-[#8C3015] border border-orange-100 text-[11px] font-bold">
            {job.salary}
          </span>
          <span className="px-1.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px]">
            {job.experience}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => onDirections(place)}
            className="flex-1 py-1.5 px-2 rounded-xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-98"
          >
            <Navigation className="w-3 h-3 text-[#C04A22]" />
            <span>Direction</span>
          </button>
          <button
            onClick={() => onViewDetails(place)}
            className="flex-1 py-1.5 px-2 rounded-xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-98"
          >
            <span>Details</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute z-[999] bg-white rounded-2xl shadow-2xl border border-border overflow-visible pointer-events-auto"
      style={{ left, top, width: CARD_W, transition: "left 0.12s ease, top 0.12s ease" }}
      onMouseEnter={() => { }}
    >
      <div className="rounded-2xl overflow-hidden">
        {/* Image */}
        <div className="relative h-28 overflow-hidden">
          <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
          {place.immigrantFriendly && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              <CheckCircle className="w-2.5 h-2.5" /> Immigrant-Friendly
            </div>
          )}
          <div className={`absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${place.open ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
            {place.open ? `Open · ${place.openUntil}` : "Closed"}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 pb-2">
          <div className="font-bold text-sm text-foreground truncate mb-0.5">{place.name}</div>
          <div className="text-xs text-muted-foreground mb-1.5">{place.category} · {place.distance}</div>
          <div className="flex items-center gap-1 mb-1.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(place.rating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
            ))}
            <span className="text-xs font-semibold ml-0.5">{place.rating}</span>
            <span className="text-[11px] text-muted-foreground">({place.reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" style={{ color }} />
            <span className="truncate">{place.address}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5">
            <button
              onClick={() => onDirections(place)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-[#E06D53] hover:bg-[#C04A22] text-white text-[11px] font-semibold shadow-sm transition"
            >
              <Navigation className="w-3 h-3" /> Directions
            </button>

            <button
              onClick={() => onViewDetails(place)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl border border-border text-[11px] font-semibold hover:bg-secondary transition"
            >
              Details <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setSaved(s => !s)}
              className="w-8 flex items-center justify-center rounded-xl border border-border hover:bg-secondary transition flex-shrink-0"
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



// Official BariKoi GL JS Loader (https://docs.barikoi.com/)
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

// ── Booking.com Style Leaflet map component ──────────────────────────────────
function LeafletMap({
  visiblePlaces, activePlaceId, routes, selectedRouteId, userLocation, isGPSActive,
  onMarkerClick, onMapClick, onRouteClick, onMarkerHover,
}: {
  visiblePlaces: Place[];
  activePlaceId: number | string | null;
  routes: RouteOption[];
  selectedRouteId: number | null;
  userLocation: [number, number] | null;
  isGPSActive?: boolean;
  onMarkerClick: (p: Place, px: { x: number; y: number }) => void;
  onMapClick: () => void;
  onRouteClick: (id: number) => void;
  onMarkerHover: (p: Place | null, px?: { x: number; y: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<number | string, any>>(new Map());
  const routeLinesRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  // Booking.com style round icon bubble marker (No name text)
  function makeMarkerHtml(place: Place, active: boolean) {
    const isJob = place.isJob && place.jobData;
    const color = isJob ? "#C04A22" : (categoryColors[place.category] ?? "#2563eb");
    const iconSymbol = isJob ? (place.jobData?.logo || "💼") : (categoryIcons[place.category] || place.category.split(" ")[0] || "📍");
    const size = active ? 42 : 34;

    return `<div style="position:relative;display:inline-flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform 0.2s ease;">
      <div style="background:${active ? '#1e293b' : color};color:white;width:${size}px;height:${size}px;border-radius:50%;border:${active ? '3px' : '2px'} solid white;box-shadow:${active ? '0 10px 25px rgba(0,0,0,0.5), 0 0 0 3px rgba(192,74,34,0.4)' : '0 4px 14px rgba(0,0,0,0.25)'};display:flex;align-items:center;justify-content:center;transform:${active ? 'scale(1.15)' : 'scale(1)'};">
        <span style="font-size:${active ? '18px' : '15px'};line-height:1;">${iconSymbol}</span>
      </div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${active ? '#1e293b' : color};margin-top:-1px;"></div>
    </div>`;
  }

  const syncMarkers = useCallback((ps: Place[], activeId: number | string | null) => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const bkoigl = (window as any).bkoigl;
    const L = LRef.current;

    const ids = new Set(ps.map(p => p.id));
    markersRef.current.forEach((m, id) => {
      if (!ids.has(id)) {
        if (m.remove) m.remove();
        markersRef.current.delete(id);
      }
    });

    ps.forEach(place => {
      if (markersRef.current.has(place.id)) return;
      const active = place.id === activeId;

      if (L && LRef.current) {
        // Leaflet marker
        const icon = L.divIcon({
          className: "booking-map-marker",
          html: makeMarkerHtml(place, active),
          iconSize: active ? [42, 48] : [34, 40],
          iconAnchor: active ? [21, 48] : [17, 40],
        });
        const marker = L.marker([place.lat, place.lng], { icon }).addTo(map);
        marker.on("click", () => {
          const px = map.latLngToContainerPoint ? map.latLngToContainerPoint([place.lat, place.lng]) : { x: 0, y: 0 };
          onMarkerClick(place, { x: px.x, y: px.y });
        });
        marker.on("mouseover", () => {
          if (window.innerWidth < 768) return;
          const px = map.latLngToContainerPoint ? map.latLngToContainerPoint([place.lat, place.lng]) : { x: 0, y: 0 };
          onMarkerHover(place, { x: px.x, y: px.y });
        });
        marker.on("mouseout", () => onMarkerHover(null));
        markersRef.current.set(place.id, marker);
      } else if (bkoigl || map.project) {
        // bkoi-gl / Mapbox GL marker
        const el = document.createElement("div");
        el.className = "booking-map-marker";
        el.style.cursor = "pointer";
        el.innerHTML = makeMarkerHtml(place, active);

        const MarkerClass = bkoigl?.Marker || (window as any).maplibregl?.Marker;
        if (!MarkerClass) return;

        const marker = new MarkerClass({ element: el })
          .setLngLat([place.lng, place.lat])
          .addTo(map);

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const pos = map.project ? map.project([place.lng, place.lat]) : { x: 0, y: 0 };
          onMarkerClick(place, { x: pos.x, y: pos.y });
        });
        el.addEventListener("mouseenter", () => {
          if (window.innerWidth < 768) return;
          const pos = map.project ? map.project([place.lng, place.lat]) : { x: 0, y: 0 };
          onMarkerHover(place, { x: pos.x, y: pos.y });
        });
        el.addEventListener("mouseleave", () => onMarkerHover(null));
        markersRef.current.set(place.id, marker);
      }
    });
  }, [onMarkerClick, onMarkerHover]);

  // Init map with Official BariKoi bkoi-gl SDK
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    loadBkoiGL().then(bkoigl => {

      if (!containerRef.current || mapRef.current) return;

      const defaultCenter: [number, number] = userLocation ? [userLocation[1], userLocation[0]] : [90.4071, 23.7925];
      const key = BARIKOI_API_KEY;
      if (bkoigl) {
        bkoigl.accessToken = key;
        bkoigl.apiKey = key;
      }

      const map = new bkoigl.Map({
        container: containerRef.current!,
        center: defaultCenter,
        zoom: 12,
        accessToken: key,
        apiKey: key,
        style: `https://map.barikoi.com/styles/osm_barikoi_v1/style.json?key=${key}`,
      });

      // Handle missing sprite images cleanly
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

      map.on("click", () => onMapClick());
      map.on("load", () => {
        mapRef.current = map as any;
        syncMarkers(visiblePlaces, activePlaceId);
      });
      mapRef.current = map as any;
    }).catch(() => {
      // Fallback to Leaflet if bkoi-gl script blocked
      import("leaflet").then(L => {
        if (!containerRef.current || mapRef.current) return;
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        const defaultCenter: [number, number] = userLocation || [23.8103, 90.4125];
        const map = L.map(containerRef.current!, { center: defaultCenter, zoom: 13 });
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
          attribution: '&copy; <a href="https://barikoi.com">BariKoi API</a>',
          maxZoom: 19,
        }).addTo(map);
        map.on("click", () => onMapClick());
        mapRef.current = map as any; LRef.current = L;
        syncMarkers(visiblePlaces, activePlaceId);
      });
    });
    return () => { mapRef.current?.remove(); mapRef.current = null; markersRef.current.clear(); };
  }, []);

  // Sync place markers whenever visiblePlaces or map loaded
  useEffect(() => {
    if (mapRef.current) {
      syncMarkers(visiblePlaces, activePlaceId);
    }
  }, [visiblePlaces, activePlaceId, syncMarkers]);

  // Update active marker highlight
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const place = visiblePlaces.find(p => String(p.id) === String(id));
      if (!place) return;
      const active = String(id) === String(activePlaceId);
      if (LRef.current && marker.setIcon) {
        marker.setIcon(LRef.current.divIcon({
          className: "booking-map-marker",
          html: makeMarkerHtml(place, active),
          iconSize: active ? [42, 48] : [34, 40],
          iconAnchor: active ? [21, 48] : [17, 40],
        }));
      } else if (marker.getElement) {
        const el = marker.getElement();
        if (el) el.innerHTML = makeMarkerHtml(place, active);
      }
    });
  }, [activePlaceId, visiblePlaces]);

  // Fly to active place
  useEffect(() => {
    if (!mapRef.current || activePlaceId === null) return;
    const p = visiblePlaces.find(p => String(p.id) === String(activePlaceId));
    if (!p) return;
    const map = mapRef.current;
    if (LRef.current && map.flyTo) {
      map.flyTo([p.lat, p.lng], 16, { duration: 1.0 });
    } else if (map.flyTo) {
      map.flyTo({ center: [p.lng, p.lat], zoom: 15, duration: 1000 });
    }
  }, [activePlaceId, visiblePlaces]);

  useEffect(() => {
    if (!mapRef.current || !LRef.current || visiblePlaces.length === 0 || routes.length > 0) return;
    if (visiblePlaces.length === 1) {
      mapRef.current.flyTo([visiblePlaces[0].lat, visiblePlaces[0].lng], 16, { duration: 1.0 });
    } else if (visiblePlaces.length > 1) {
      const bounds = LRef.current.latLngBounds(visiblePlaces.map(p => [p.lat, p.lng]));
      mapRef.current.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [visiblePlaces, routes.length]);

  // ── Sync User Location Marker & Center Map (Works on both bkoi-gl & Leaflet) ──
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const bkoigl = (window as any).bkoigl;
    const L = LRef.current;

    // Remove existing user marker if present
    if (userMarkerRef.current) {
      if (userMarkerRef.current.remove) userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (!isGPSActive || !userLocation) {
      // If GPS turned off, fly back to default center
      if (map.flyTo) {
        if (L) {
          map.flyTo([23.8103, 90.4125], 13, { duration: 1.2 });
        } else {
          map.flyTo({ center: [90.4125, 23.8103], zoom: 13, speed: 1.2 });
        }
      }
      return;
    }

    const [lat, lng] = userLocation;

    // Create pulsing user pin element
    const el = document.createElement("div");
    el.className = "user-location-pulse-pin";
    el.style.cssText = "position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;";
    el.innerHTML = `
      <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(216,90,48,0.35);animation:ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width:16px;height:16px;border-radius:50%;background:#D85A30;border:3px solid white;box-shadow:0 4px 12px rgba(216,90,48,0.5);position:relative;z-index:2;"></div>
    `;

    if (L && map.addLayer) {
      const icon = L.divIcon({
        className: "custom-user-location-pin",
        html: el.outerHTML,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      userMarkerRef.current = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(map);
      map.flyTo([lat, lng], 15.5, { duration: 1.5 });
    } else if (bkoigl || map.addSource) {
      const MarkerClass = bkoigl?.Marker || (window as any).maplibregl?.Marker;
      if (MarkerClass) {
        userMarkerRef.current = new MarkerClass({ element: el })
          .setLngLat([lng, lat])
          .addTo(map);
        map.flyTo({ center: [lng, lat], zoom: 15.5, speed: 1.5 });
      }
    }
  }, [userLocation, isGPSActive]);

  // ── Draw/Clear Route Polylines (Supports both bkoi-gl & Leaflet) ───────────
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = LRef.current;

    // Clear previous Leaflet polyline layers
    routeLinesRef.current.forEach(l => { if (l.remove) l.remove(); });
    routeLinesRef.current = [];

    // Clear previous bkoi-gl layers & sources
    try {
      if (map.getLayer && map.getLayer("route-line-layer")) map.removeLayer("route-line-layer");
      if (map.getLayer && map.getLayer("route-line-casing")) map.removeLayer("route-line-casing");
      if (map.getSource && map.getSource("route-source")) map.removeSource("route-source");
    } catch (e) {
      console.warn("bkoi-gl cleanup route error:", e);
    }

    if (routes.length === 0) return;

    if (L && map.addLayer) {
      // Leaflet Polyline rendering
      const sorted = [...routes].sort((a, b) =>
        (a.id === selectedRouteId ? 1 : 0) - (b.id === selectedRouteId ? 1 : 0)
      );

      sorted.forEach(route => {
        const isSelected = route.id === selectedRouteId;
        if (isSelected) {
          route.trafficSegments.forEach(seg => {
            const color = trafficColor(seg.level);
            const line = L.polyline(seg.coords, { color, weight: 7, opacity: 0.92, lineCap: "round", lineJoin: "round" }).addTo(map);
            routeLinesRef.current.push(line);
          });
          const outline = L.polyline(route.coords, { color: "white", weight: 10, opacity: 0.4, lineCap: "round" }).addTo(map);
          outline.bringToBack();
          routeLinesRef.current.push(outline);
        } else {
          const line = L.polyline(route.coords, {
            color: trafficColor(route.traffic), weight: 4, opacity: 0.4,
            dashArray: "8 6", lineCap: "round",
          }).addTo(map);
          line.on("click", () => onRouteClick(route.id));
          routeLinesRef.current.push(line);
        }
      });

      const allCoords = routes.flatMap(r => r.coords);
      if (userLocation) allCoords.push(userLocation);
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [80, 80] });
    } else if (map.addSource && map.addLayer) {
      // bkoi-gl / Mapbox GL GeoJSON route line rendering
      const selected = routes.find(r => r.id === selectedRouteId) || routes[0];
      if (selected && selected.coords?.length) {
        const geojson = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: selected.coords.map(([lat, lng]) => [lng, lat]),
          },
        };

        map.addSource("route-source", {
          type: "geojson",
          data: geojson,
        });

        map.addLayer({
          id: "route-line-casing",
          type: "line",
          source: "route-source",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#ffffff",
            "line-width": 8,
            "line-opacity": 0.6,
          },
        });

        map.addLayer({
          id: "route-line-layer",
          type: "line",
          source: "route-source",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": trafficColor(selected.traffic),
            "line-width": 6,
            "line-opacity": 0.9,
          },
        });

        // Fit map bounds to user + route
        const bkoigl = (window as any).bkoigl;
        const LngLatBounds = bkoigl?.LngLatBounds || (window as any).maplibregl?.LngLatBounds;
        if (LngLatBounds) {
          const bounds = new LngLatBounds();
          selected.coords.forEach(([lat, lng]) => bounds.extend([lng, lat]));
          if (userLocation) bounds.extend([userLocation[1], userLocation[0]]);
          map.fitBounds(bounds, { padding: 80 });
        }
      }
    }
  }, [routes, selectedRouteId, userLocation, onRouteClick]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}

// ── Directions Sheet ──────────────────────────────────────────────────────────
function DirectionsSheet({
  destination, userLocation, onClose,
  onRoutesReady, selectedRouteId, onSelectRoute, routes,
}: {
  destination: Place;
  userLocation: [number, number];
  onClose: () => void;
  onRoutesReady: (routes: RouteOption[]) => void;
  selectedRouteId: number | null;
  onSelectRoute: (id: number) => void;
  routes: RouteOption[];
}) {
  const [mode, setMode] = useState<TravelMode>("car");
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const MODES: { id: TravelMode; label: string; icon: any }[] = [
    { id: "car", label: "Car", icon: Car },
    { id: "bike", label: "Bike", icon: Bike },
    { id: "walk", label: "Walking", icon: Footprints },
  ];

  async function loadRoutes(m: TravelMode) {
    setMode(m); setLoading(true);
    const r = await fetchRoutes(userLocation, [destination.lat, destination.lng], m);
    onRoutesReady(r);
    onSelectRoute(0);
    setLoading(false);
  }

  useEffect(() => { loadRoutes("car"); }, []);

  const selected = routes.find(r => r.id === selectedRouteId) ?? routes[0];

  return (
    <div className={`absolute bottom-0 left-0 right-0 z-[1001] bg-white rounded-t-3xl shadow-2xl border-t border-border transition-all duration-300 ${collapsed ? "max-h-[72px]" : "max-h-[72vh]"} overflow-hidden flex flex-col`}>
      <div className="flex-shrink-0">
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center gap-3 px-4 pb-3">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#C04A22] flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">Your Location</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#C04A22] flex-shrink-0" />
              <span className="text-sm font-semibold text-foreground truncate">{destination.name}</span>
            </div>
          </div>
          <button onClick={() => setCollapsed(c => !c)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center transition">
            <ChevronDown className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className="flex gap-2 px-4 pb-3">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => loadRoutes(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${mode === id
                ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/25 shadow-2xs font-bold"
                : "bg-secondary text-muted-foreground hover:bg-[#C04A22]/8 hover:text-[#8C3015]"
                }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-[#C04A22]" />
              <span className="text-sm">Finding best routes…</span>
            </div>
          ) : routes.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No routes found</div>
          ) : routes.map(route => {
            const isSel = route.id === selectedRouteId;
            return (
              <button
                key={route.id}
                onClick={() => onSelectRoute(route.id)}
                className={`w-full text-left rounded-2xl border-2 p-3 transition-all ${isSel ? "border-[#C04A22] bg-[#C04A22]/5 shadow-sm" : "border-border bg-white hover:border-[#C04A22]/40"
                  }`}
              >


                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="flex flex-col items-center bg-secondary rounded-xl p-2">
                    <Timer className="w-3.5 h-3.5 text-[#C04A22] mb-0.5" />
                    <span className="text-xs font-bold text-foreground">{fmtTime(route.duration)}</span>
                    <span className="text-[9px] text-muted-foreground">Time</span>
                  </div>
                  <div className="flex flex-col items-center bg-secondary rounded-xl p-2">
                    <Route className="w-3.5 h-3.5 text-[#C04A22] mb-0.5" />
                    <span className="text-xs font-bold text-foreground">{fmtDist(route.distance)}</span>
                    <span className="text-[9px] text-muted-foreground">Distance</span>
                  </div>
                  <div className="flex flex-col items-center bg-secondary rounded-xl p-2">
                    <DollarSign className="w-3.5 h-3.5 text-[#C04A22] mb-0.5" />
                    <span className="text-xs font-bold text-foreground">{route.cost}</span>
                    <span className="text-[9px] text-muted-foreground">Cost</span>
                  </div>
                </div>



                {isSel && (
                  <div className="mt-2.5 w-full py-2.5 rounded-xl bg-[#E06D53] hover:bg-[#C04A22] text-white text-xs font-bold shadow-md shadow-[#E06D53]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98">
                    <Navigation className="w-3.5 h-3.5" /> Start Navigation
                  </div>
                )}
              </button>
            );
          })}


        </div>
      )}
    </div>
  );
}

// ── Map place card ────────────────────────────────────────────────────────────
function MapPlaceCard({
  place, markerPx, containerSize, onClose, onViewDetails, onDirections,
}: {
  place: Place; markerPx: { x: number; y: number };
  containerSize: { w: number; h: number };
  onClose: () => void; onViewDetails: () => void; onDirections: () => void;
  key?: string | number;
}) {
  const [saved, setSaved] = useState(false);
  const color = categoryColors[place.category] ?? "#6366f1";
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const CARD_W = 295; const CARD_H = place.isJob ? 260 : 340; const GAP = 14;
  const spaceRight = containerSize.w - markerPx.x;
  const left = spaceRight >= CARD_W + GAP + 20
    ? markerPx.x + GAP + 15
    : markerPx.x - CARD_W - GAP - 15;
  let top = markerPx.y - CARD_H / 2;
  top = Math.max(8, Math.min(top, containerSize.h - CARD_H - 8));

  // If this place is a Job item, render in Job card format
  if (place.isJob && place.jobData) {
    const job = place.jobData;
    const jobContent = (
      <div className="p-4">
        {/* Top Header with Logo, Title & Close */}
        <div className="flex items-start justify-between gap-2.5 mb-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl sm:text-3xl flex-shrink-0">{job.logo}</span>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate leading-snug">
                {job.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium truncate flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{job.company}</span>
                <span>•</span>
                <span className="text-[#C04A22] font-semibold flex-shrink-0">{job.distance}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition text-slate-500 flex-shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Highlight Stats / Badges */}
        <div className="flex flex-wrap items-center gap-1.5 my-3">
          <span className="px-2.5 py-1 rounded-xl bg-orange-50 text-[#8C3015] border border-orange-100 text-xs font-bold">
            {job.salary}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
            {job.experience}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
            {job.type}
          </span>
        </div>

        {/* Action buttons styled in signature sidebar theme color */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onDirections}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 shadow-2xs"
          >
            <Navigation className="w-3.5 h-3.5 text-[#C04A22]" />
            <span>Direction</span>
          </button>
          <button
            onClick={onViewDetails}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 shadow-2xs"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className="w-10 h-9 rounded-2xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 border border-[#C04A22]/25 flex items-center justify-center transition cursor-pointer flex-shrink-0"
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#C04A22] text-[#C04A22]" : "text-[#8C3015]"}`} />
          </button>
        </div>
      </div>
    );

    if (isMobile) {
      return (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 overflow-hidden animate-in slide-in-from-bottom-3 duration-250 pb-2">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-8 h-1 rounded-full bg-slate-300" />
          </div>
          {jobContent}
        </div>
      );
    }

    return (
      <div
        className="absolute w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-[1000]"
        style={{ left, top, transition: "left 0.25s, top 0.25s" }}
      >
        {jobContent}
      </div>
    );
  }

  const cardContent = (
    <>
      <div className="relative overflow-hidden" style={{ height: isMobile ? 120 : 144 }}>
        <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
        <button onClick={onClose} className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
        {place.immigrantFriendly && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <CheckCircle className="w-2.5 h-2.5" /> Immigrant-Friendly
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <div className="font-bold text-sm text-foreground">{place.name}</div>
            <div className="text-xs text-muted-foreground">{place.category} · {place.distance}</div>
          </div>
          <div className={`flex items-center gap-0.5 flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${place.open ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
            <Clock className="w-2.5 h-2.5" />{place.open ? `Open · ${place.openUntil}` : "Closed"}
          </div>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`w-3 h-3 ${s <= Math.round(place.rating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
          ))}
          <span className="text-xs font-semibold ml-0.5">{place.rating}</span>
          <span className="text-xs text-muted-foreground">({place.reviews})</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" style={{ color }} />{place.address}
        </div>
        <div className="flex gap-2">
          <button onClick={onDirections} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#E06D53] hover:bg-[#C04A22] text-white text-xs font-semibold shadow-sm transition cursor-pointer">
            <Navigation className="w-3.5 h-3.5" /> Directions
          </button>
          <button onClick={onViewDetails} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition cursor-pointer">
            Details <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setSaved(!saved)} className="w-9 flex items-center justify-center rounded-xl border border-border hover:bg-secondary transition cursor-pointer">
            <Bookmark className={`w-4 h-4 ${saved ? "fill-[#C04A22] text-[#C04A22]" : "text-muted-foreground"}`} />
          </button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-2xl shadow-2xl border-t border-border overflow-hidden animate-in slide-in-from-bottom-3 duration-250">
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-8 h-1 rounded-full bg-border" />
        </div>
        {cardContent}
      </div>
    );
  }

  return (
    <div className="absolute w-72 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-[1000]"
      style={{ left, top, transition: "left 0.25s, top 0.25s" }}>
      {cardContent}
    </div>
  );
}

// ── Full detail modal ─────────────────────────────────────────────────────────
function PlaceDetail({ place, onClose, onDirections }: { place: Place; onClose: () => void; onDirections: () => void; key?: string | number }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="relative">
          <img src={place.image} alt={place.name} className="w-full h-48 object-cover" />
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-secondary transition">
            <X className="w-4 h-4" />
          </button>
          {place.immigrantFriendly && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-[#C04A22] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" /> Immigrant-Friendly
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{place.name}</h2>
              <p className="text-sm text-muted-foreground">{place.category}</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-amber-700">{place.rating}</span>
              <span className="text-xs text-amber-600">({place.reviews})</span>
            </div>
          </div>
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" /><span className="text-sm">{place.address}</span></div>
            <div className="flex items-center gap-3"><Clock className={`w-4 h-4 flex-shrink-0 ${place.open ? "text-emerald-600" : "text-red-500"}`} /><span className={`text-sm font-medium ${place.open ? "text-emerald-600" : "text-red-600"}`}>{place.open ? `Open · Closes ${place.openUntil}` : "Closed"}</span></div>
            <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" /><span className="text-sm">{place.phone}</span></div>
          </div>
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Languages</div>
            <div className="flex gap-2 flex-wrap">{place.languages.map(l => <span key={l} className="text-sm bg-orange-50 text-[#8C3015] border border-orange-100 px-3 py-1 rounded-full font-medium">{l}</span>)}</div>
          </div>
          {/* Seller Storefront Link */}
          <button
            onClick={() => {
              onClose();
              navigate(`/seller/${place.id}`);
            }}
            className="w-full py-3 mb-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition"
            style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
          >
            <Store className="w-4 h-4" /> View Seller Profile & Shop Catalog
          </button>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button onClick={onDirections} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#E06D53] hover:bg-[#C04A22] text-white text-sm font-semibold shadow-sm transition">
              <Navigation className="w-4 h-4" /> Directions
            </button>

            <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition"><Phone className="w-4 h-4" /> Call</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button className="flex items-center justify-center gap-1 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition"><Bookmark className="w-3.5 h-3.5" /> Save</button>
            <button className="flex items-center justify-center gap-1 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition"><Share2 className="w-3.5 h-3.5" /> Share</button>
            <button className="flex items-center justify-center gap-1 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition text-primary"><MessageCircle className="w-3.5 h-3.5" /> Ask</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── List card ─────────────────────────────────────────────────────────────────
function PlaceCard({
  place, onClick, onDirections, onViewDetails
}: {
  place: Place;
  onClick: () => void;
  onDirections?: (p: Place) => void;
  onViewDetails?: (p: Place) => void;
  key?: string | number;
}) {
  const [saved, setSaved] = useState(false);

  // If this place is a Job item, render in Job card format
  if (place.isJob && place.jobData) {
    const job = place.jobData;
    return (
      <div
        className="bg-white rounded-2xl border border-border p-3.5 hover:shadow-md transition-all cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2.5 mb-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl flex-shrink-0">{job.logo}</span>
            <div className="min-w-0">
              <div className="text-sm font-bold text-foreground truncate">{job.title}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{job.company}</span>
                <span>•</span>
                <span className="text-[#C04A22] font-semibold flex-shrink-0">{job.distance}</span>
              </div>
            </div>
          </div>
          <button
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition flex-shrink-0"
            onClick={e => {
              e.stopPropagation();
              setSaved(!saved);
            }}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#C04A22] text-[#C04A22]" : "text-muted-foreground"}`} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 my-2">
          <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-[#8C3015] border border-orange-100 text-xs font-bold">
            {job.salary}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
            {job.experience}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
            {job.type}
          </span>
        </div>

        <div className="flex gap-2 mt-2.5">
          <button
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/25 text-xs font-bold hover:bg-[#C04A22]/20 transition cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              onDirections ? onDirections(place) : onClick();
            }}
          >
            <Navigation className="w-3 h-3 text-[#C04A22]" /> Direction
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/25 text-xs font-bold hover:bg-[#C04A22]/20 transition cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              onViewDetails ? onViewDetails(place) : onClick();
            }}
          >
            Details <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-all cursor-pointer group" onClick={onClick}>
      <div className="relative h-32 bg-muted overflow-hidden">
        <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {place.immigrantFriendly && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" /> Immigrant-Friendly
          </div>
        )}
        <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors cursor-pointer"
          onClick={e => { e.stopPropagation(); setSaved(!saved); }}>
          <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{place.name}</div>
            <div className="text-xs text-muted-foreground">{place.category}</div>
          </div>
          <div className={`flex items-center gap-0.5 flex-shrink-0 px-1.5 py-0.5 rounded-full text-xs font-medium ${place.open ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
            <Clock className="w-3 h-3" />{place.open ? "Open" : "Closed"}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span className="text-xs font-medium">{place.rating}</span><span className="text-xs text-muted-foreground">({place.reviews})</span></div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{place.distance}</div>
        </div>
        <div className="flex gap-1 mt-2 overflow-hidden">
          {place.languages.slice(0, 3).map(l => <span key={l} className="text-xs bg-secondary text-primary px-1.5 py-0.5 rounded-full whitespace-nowrap">{l}</span>)}
        </div>
        <div className="flex gap-2 mt-3">
          <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:opacity-90 transition cursor-pointer" onClick={e => e.stopPropagation()}>
            <Navigation className="w-3 h-3" /> Directions
          </button>
          <button className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs font-medium hover:bg-secondary transition cursor-pointer" onClick={e => e.stopPropagation()}><MessageCircle className="w-3 h-3" /></button>
          <button className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs font-medium hover:bg-secondary transition cursor-pointer" onClick={e => e.stopPropagation()}><Share2 className="w-3 h-3" /></button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const DEFAULT_LOCATION: [number, number] = [23.8103, 90.4125]; // Dhaka, Bangladesh center

export function MapDiscoveryContent({
  embedded = false,
  compact = false,
  height,
}: {
  embedded?: boolean;
  compact?: boolean;
  height?: string;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("map");
  const [mapActiveId, setMapActiveId] = useState<number | string | null>(null);
  const [markerPx, setMarkerPx] = useState({ x: 0, y: 0 });
  const [hoverPlace, setHoverPlace] = useState<Place | null>(null);
  const [hoverPx, setHoverPx] = useState({ x: 0, y: 0 });
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
  const [detailJob, setDetailJob] = useState<LiveJobListing | null>(null);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [directionsFor, setDirectionsFor] = useState<Place | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_LOCATION);
  const [isGPSActive, setIsGPSActive] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);


  // Live Location Jobs generated dynamically around the user's location
  const liveJobs = useMemo(() => {
    return generateLiveLocationJobs(userLocation[0], userLocation[1], "Dhaka Area", "Dhaka");
  }, [userLocation]);

  const jobPlaces: Place[] = useMemo(() => {
    return liveJobs.map(j => ({
      id: `job-${j.id}`,
      lat: j.lat,
      lng: j.lng,
      name: j.title,
      category: `${j.logo} ${j.category}`,
      distance: j.distance,
      rating: 4.9,
      reviews: 32,
      open: true,
      openUntil: j.deadline || "Open / Rolling",
      address: `${j.company} • ${j.location}`,
      phone: j.contactPhone,
      languages: ["Bengali", "English"],
      immigrantFriendly: true,
      description: `${j.salary} • ${j.experience} • ${j.description}`,
      image: j.image,
      isJob: true,
      jobData: j,
    }));
  }, [liveJobs]);

  // BariKoi live autocomplete search state & API integration
  const [bkoiPlaces, setBkoiPlaces] = useState<Place[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < 2) {
      setBkoiPlaces([]);
      return;
    }
    const controller = new AbortController();
    const url = `https://barikoi.xyz/v2/api/search/autocomplete/place?api_key=${BARIKOI_API_KEY}&q=${encodeURIComponent(q)}&sub_area=true&sub_district=true`;
    
    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (data?.places && Array.isArray(data.places)) {
          const mapped: Place[] = data.places.map((b: any, idx: number) => ({
            id: 99000 + idx,
            name: b.name || b.address || "BariKoi Location",
            lat: parseFloat(b.latitude || "0"),
            lng: parseFloat(b.longitude || "0"),
            category: b.category || "Service",
            address: b.address || b.area || "Bangladesh",
            rating: 4.9,
            reviews: 18,
            distance: b.area || "Nearby",
            open: true,
            openUntil: "9:00 PM",
            phone: "+880 1700-000000",
            languages: ["Bengali", "English"],
            immigrantFriendly: true,
            description: b.address ? `Address: ${b.address}, ${b.city || ""}` : "BariKoi verified location",
            image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80",
          })).filter(p => !isNaN(p.lat) && !isNaN(p.lng) && p.lat !== 0 && p.lng !== 0);

          setBkoiPlaces(mapped);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [query]);

  // All combined places (Standard places + Location-based Jobs + BariKoi autocomplete)
  const allPlaces = useMemo(() => {
    return [...places, ...jobPlaces, ...bkoiPlaces];
  }, [jobPlaces, bkoiPlaces]);

  // Search filter matching name, category, description, address, languages, job attributes
  const filteredPlaces = useMemo(() => {
    const q = query.toLowerCase().trim();
    const isJobSearch = isJobQuery(q);

    return allPlaces.filter(p => {
      // Category filter
      const matchesCategory = activeCategory === "all" ||
        (categoryMap[activeCategory] && categoryMap[activeCategory].includes(p.category)) ||
        (activeCategory === "jobs" && p.isJob);

      if (!matchesCategory) return false;
      if (!q) return true;

      // Match against standard properties
      const matchesStandard =
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.languages.some(l => l.toLowerCase().includes(q));

      if (matchesStandard) return true;

      // If job, match against skills, company, salary, type, experience, responsibilities
      if (p.isJob && p.jobData) {
        if (isJobSearch) return true;
        const j = p.jobData;
        return (
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.category.toLowerCase().includes(q) ||
          j.salary.toLowerCase().includes(q) ||
          j.type.toLowerCase().includes(q) ||
          j.experience.toLowerCase().includes(q) ||
          j.skills.some(s => s.toLowerCase().includes(q)) ||
          j.responsibilities.some(r => r.toLowerCase().includes(q)) ||
          j.qualifications.some(rq => rq.toLowerCase().includes(q))
        );
      }

      return false;
    });
  }, [allPlaces, activeCategory, query]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      const q = val.toLowerCase();
      setSuggestions(allPlaces.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (place: Place) => {
    setQuery(place.name);
    setSuggestions([]);
    setMapActiveId(place.id);
    setViewMode("map");
  };

  const handleOpenDetails = (place: Place) => {
    setMapActiveId(null);
    if (place.isJob && place.jobData) {
      setDetailJob(place.jobData);
    } else {
      setDetailPlace(place);
    }
  };

  return (
    <div className={compact ? `flex flex-col ${height || "h-[240px] sm:h-[260px]"} rounded-2xl border border-border overflow-hidden bg-background shadow-xs relative mb-3 sm:mb-4` : embedded ? "flex flex-col h-[580px] sm:h-[650px] rounded-2xl border border-border overflow-hidden bg-background shadow-sm my-1" : "flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background"}>
      {compact ? (
        /* ── Compact Embedded Mode (For HomeFeed between top bar & post composer) ── */
        <div className="relative w-full h-full">
          {/* Top-Right Floating Full Map Expand Button */}
          <button
            onClick={() => navigate("/map")}
            className="absolute top-2.5 right-2.5 z-[990] w-8 h-8 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-[#8C3015] border border-slate-200/90 shadow-md transition flex items-center justify-center cursor-pointer active:scale-95"
            title="Open Full Map"
          >
            <Maximize2 className="w-4 h-4 text-[#C04A22]" />
          </button>


          {/* Interactive Map */}
          <div ref={mapContainerRef} className="relative w-full h-full">
            <LeafletMap
              visiblePlaces={filteredPlaces}
              activePlaceId={mapActiveId}
              routes={routes}
              selectedRouteId={selectedRouteId}
              userLocation={userLocation}
              isGPSActive={isGPSActive}
              onMarkerClick={(p, px) => {
                setMapActiveId(p.id);
                setMarkerPx(px);
                setHoverPlace(null);
              }}
              onMapClick={() => {
                setMapActiveId(null);
                setHoverPlace(null);
              }}
              onRouteClick={id => setSelectedRouteId(id)}
              onMarkerHover={(p, px) => {
                setHoverPlace(p);
                if (px) setHoverPx(px);
              }}
            />

            {/* Desktop Hover Card Tooltip */}
            {hoverPlace && (
              <HoverTooltipCard
                place={hoverPlace}
                px={hoverPx}
                containerW={mapContainerRef.current?.offsetWidth ?? 400}
                containerH={mapContainerRef.current?.offsetHeight ?? 250}
                onDirections={p => setDirectionsFor(p)}
                onViewDetails={p => handleOpenDetails(p)}
              />
            )}

            {/* Selected Place Card Overlay */}
            {mapActiveId !== null && (() => {
              const activePlace = filteredPlaces.find(p => String(p.id) === String(mapActiveId));
              if (!activePlace) return null;
              return (
                <MapPlaceCard
                  key={String(mapActiveId)}
                  place={activePlace}
                  markerPx={markerPx}
                  containerSize={{
                    w: mapContainerRef.current?.offsetWidth ?? 400,
                    h: mapContainerRef.current?.offsetHeight ?? 250,
                  }}
                  onClose={() => setMapActiveId(null)}
                  onViewDetails={() => handleOpenDetails(activePlace)}
                  onDirections={() => setDirectionsFor(activePlace)}
                />
              );
            })()}

            {/* Floating GPS Button */}
            <button
              onClick={() => {
                if (isGPSActive) {
                  setUserLocation(DEFAULT_LOCATION);
                  setIsGPSActive(false);
                } else {
                  if ("geolocation" in navigator) {
                    setIsLocating(true);
                    navigator.geolocation.getCurrentPosition(
                      pos => {
                        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                        setIsGPSActive(true);
                        setIsLocating(false);
                      },
                      () => setIsLocating(false),
                      { enableHighAccuracy: true, timeout: 6000 }
                    );
                  }
                }
              }}
              className={`absolute bottom-2.5 right-2.5 z-[990] w-7.5 h-7.5 rounded-full flex items-center justify-center shadow-md transition cursor-pointer border ${
                isGPSActive ? "bg-[#C04A22] text-white border-[#C04A22]" : "bg-white/95 backdrop-blur-md text-slate-700 hover:text-[#C04A22] border-slate-200/90"
              }`}
              title={isGPSActive ? "GPS Active" : "Find My Location"}
            >
              {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      ) : (
        /* ── Standard / Full Map View ── */
        <>
          {/* Top Search Bar & Categories */}
          <div className="bg-white border-b border-border p-3 sm:p-4 z-20 space-y-3 flex-shrink-0">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  placeholder="Search jobs, used furniture, halal food, legal aid, stores..."
                  className="w-full pl-10 pr-9 py-2.5 bg-input-background rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
                />
                {query && (
                  <button onClick={() => { setQuery(""); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                    {suggestions.map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full px-4 py-2.5 text-left hover:bg-secondary flex items-center justify-between text-xs transition border-b border-border/40 last:border-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span>{s.isJob ? (s.jobData?.logo || "💼") : (categoryIcons[s.category] || "📍")}</span>
                          <span className="font-bold text-foreground truncate">{s.name}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">{s.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-secondary p-1 rounded-xl flex-shrink-0">
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${viewMode === "map" ? "bg-white text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <MapIcon className="w-3.5 h-3.5" /> Map
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${viewMode === "list" ? "bg-white text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <List className="w-3.5 h-3.5" /> List ({filteredPlaces.length})
                </button>
              </div>
            </div>

            {/* Categories Pill Bar */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-4xl mx-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${activeCategory === cat.id ? "bg-primary text-white shadow-sm scale-105" : "bg-secondary text-muted-foreground hover:bg-border/60 hover:text-foreground"}`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 relative overflow-hidden flex">
            {/* Map View */}
            <div ref={mapContainerRef} className={`relative flex-1 w-full h-full ${viewMode === "list" ? "hidden md:block" : "block"}`}>

            <LeafletMap
              visiblePlaces={filteredPlaces}
              activePlaceId={mapActiveId}
              routes={routes}
              selectedRouteId={selectedRouteId}
              userLocation={userLocation}
              isGPSActive={isGPSActive}
              onMarkerClick={(p, px) => {
                setMapActiveId(p.id);
                setMarkerPx(px);
                setHoverPlace(null);
              }}
              onMapClick={() => {
                setMapActiveId(null);
                setHoverPlace(null);
              }}
              onRouteClick={id => setSelectedRouteId(id)}
              onMarkerHover={(p, px) => {
                setHoverPlace(p);
                if (px) setHoverPx(px);
              }}
            />

            {/* Desktop Hover Card Tooltip */}
            {hoverPlace && (
              <HoverTooltipCard
                place={hoverPlace}
                px={hoverPx}
                containerW={mapContainerRef.current?.offsetWidth ?? 800}
                containerH={mapContainerRef.current?.offsetHeight ?? 600}
                onDirections={p => setDirectionsFor(p)}
                onViewDetails={p => handleOpenDetails(p)}
              />
            )}

            {/* Selected Place Card Overlay (Desktop Side Card / Mobile Bottom Sheet) */}
            {mapActiveId !== null && (() => {
              const activePlace = filteredPlaces.find(p => String(p.id) === String(mapActiveId));
              if (!activePlace) return null;
              return (
                <MapPlaceCard
                  key={String(mapActiveId)}
                  place={activePlace}
                  markerPx={markerPx}
                  containerSize={{
                    w: mapContainerRef.current?.offsetWidth ?? 800,
                    h: mapContainerRef.current?.offsetHeight ?? 600,
                  }}
                  onClose={() => setMapActiveId(null)}
                  onViewDetails={() => handleOpenDetails(activePlace)}
                  onDirections={() => setDirectionsFor(activePlace)}
                />
              );
            })()}

            {/* Floating My Location Button (Turn ON / Turn OFF Toggle) */}
            <button
              onClick={() => {
                if (isGPSActive) {
                  // Turn OFF: Revert to default location
                  setUserLocation(DEFAULT_LOCATION);
                  setIsGPSActive(false);
                } else {
                  // Turn ON: Request device GPS with fallback
                  if ("geolocation" in navigator) {
                    setIsLocating(true);
                    const getPos = (highAcc: boolean) => {
                      navigator.geolocation.getCurrentPosition(
                        pos => {
                          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                          setUserLocation(loc);
                          setIsGPSActive(true);
                          setIsLocating(false);
                        },
                        err => {
                          if (highAcc) {
                            getPos(false);
                            return;
                          }
                          console.warn("Geolocation error:", err);
                          setIsLocating(false);
                        },
                        { enableHighAccuracy: highAcc, timeout: highAcc ? 6000 : 15000, maximumAge: 60000 }
                      );
                    };
                    getPos(true);
                  }
                }
              }}
              className={`absolute bottom-6 right-6 z-[999] p-3.5 rounded-full shadow-lg border transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                isGPSActive
                  ? "bg-[#D85A30] text-white border-[#D85A30] shadow-[#D85A30]/30"
                  : "bg-white text-foreground border-border hover:bg-slate-50"
              }`}
              title={isGPSActive ? "Turn OFF Live Location (Revert to default)" : "Turn ON Live Location (GPS)"}
            >
              {isLocating ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#D85A30]" />
              ) : (
                <Navigation className={`w-5 h-5 transition-transform ${isGPSActive ? "text-white" : "text-[#D85A30]"}`} />
              )}
            </button>

            {/* Directions Sheet Modal */}
            {directionsFor && (
              <DirectionsSheet
                destination={directionsFor}
                userLocation={userLocation}
                onClose={() => {
                  setDirectionsFor(null);
                  setRoutes([]);
                  setSelectedRouteId(null);
                }}
                onRoutesReady={rts => setRoutes(rts)}
                selectedRouteId={selectedRouteId}
                onSelectRoute={id => setSelectedRouteId(id)}
                routes={routes}
              />
            )}
          </div>

          {/* List View Sidebar (shown only when List view mode is selected) */}
          <div className={`w-full md:w-[420px] bg-white border-l border-border flex-col h-full overflow-y-auto ${viewMode === "list" ? "flex" : "hidden"}`}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-foreground block">
                  Showing {filteredPlaces.length} nearby {activeCategory === "jobs" || isJobQuery(query) ? "jobs & opportunities" : "places"}
                </span>
                <span className="text-xs text-muted-foreground">Within active radius</span>
              </div>
              {query && (
                <button onClick={() => setQuery("")} className="text-xs text-primary font-semibold hover:underline cursor-pointer">
                  Clear search
                </button>
              )}
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {filteredPlaces.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">No places or jobs found</h3>
                  <p className="text-xs text-muted-foreground mb-4">Try searching for "React developer", "Chef", "Used furniture", or "Legal Aid"</p>
                  <button onClick={() => { setQuery(""); setActiveCategory("all"); }} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:opacity-90 transition cursor-pointer">
                    Reset filters
                  </button>
                </div>
              ) : (
                filteredPlaces.map(p => (
                  <PlaceCard
                    key={String(p.id)}
                    place={p}
                    onClick={() => {
                      setMapActiveId(p.id);
                      handleOpenDetails(p);
                    }}
                    onDirections={place => setDirectionsFor(place)}
                    onViewDetails={place => handleOpenDetails(place)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </>
    )}


      {/* Full Detail Modal for Regular Places */}
      {detailPlace && (
        <PlaceDetail
          key={String(detailPlace.id)}
          place={detailPlace}
          onClose={() => setDetailPlace(null)}
          onDirections={() => {
            const p = detailPlace;
            setDetailPlace(null);
            setDirectionsFor(p);
          }}
        />
      )}

      {/* Full Detail Modal for Location-based Jobs */}
      <JobDetailsModal
        job={detailJob}
        onClose={() => setDetailJob(null)}
        onShowDirection={j => {
          setDetailJob(null);
          const p = filteredPlaces.find(pl => pl.isJob && pl.jobData?.id === j.id);
          if (p) {
            setDirectionsFor(p);
          }
        }}
      />
    </div>
  );
}


export function MapDiscovery() {
  return (
    <AppLayout>
      <MapDiscoveryContent />
    </AppLayout>
  );
}
