import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Search, MapPin, Navigation, Star, Clock, Phone,
  Bookmark, Share2, MessageCircle, List, Map as MapIcon, X,
  CheckCircle, ChevronRight, Car, Bike, Footprints, AlertTriangle,
  DollarSign, Timer, Route, ArrowLeft, Loader2, ChevronDown
} from "lucide-react";
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

// Fetch real routes from OSRM public API
async function fetchRoutes(
  from: [number, number],
  to: [number, number],
  mode: TravelMode
): Promise<RouteOption[]> {
  const profile = OSRM_PROFILES[mode];
  const url =
    `https://router.project-osrm.org/route/v1/${profile}/` +
    `${from[1]},${from[0]};${to[1]},${to[0]}` +
    `?overview=full&geometries=geojson&alternatives=true`;
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
    // Fallback: straight-line approximation when API unavailable
    const mid: [number, number] = [(from[0] + to[0]) / 2 + 0.005, (from[1] + to[1]) / 2 - 0.003];
    const dist = Math.hypot(to[0] - from[0], to[1] - from[1]) * 111000;
    const speeds: Record<TravelMode, number> = { car: 8, bike: 4, walk: 1.2 };
    const makeRoute = (id: number, warp: number, lbl: string): RouteOption => {
      const d = dist * warp;
      const coords: [number, number][] = [from, mid, to];
      const traffic = simulateTraffic(id, to[0] * 10 | 0);
      return {
        id, label: lbl, coords,
        distance: d, duration: d / speeds[mode],
        traffic, trafficSegments: splitSegments(coords, traffic, id),
        cost: estimateCost(mode, d),
      };
    };
    return [
      makeRoute(0, 1.0, "Fastest Route"),
      makeRoute(1, 1.2, "Alternative"),
    ];
  }
}

// ── Category config ───────────────────────────────────────────────────────────
const categoryColors: Record<string, string> = {
  "🕌 Mosque": "#f97316", "⛪ Church": "#f97316", "🛕 Temple": "#f97316",
  "⚖️ Legal Aid": "#0891b2", "🛒 Grocery": "#10b981",
  "🏥 Hospital": "#ef4444", "🏥 Clinic": "#ef4444",
  "📚 Library": "#8b5cf6", "🚗 DMV": "#64748b",
  "🏫 School": "#2563eb", "🏛️ Community Center": "#7c3aed",
  "🍽️ Restaurant": "#db2777", "🏦 Bank": "#0d9488", "🚌 Transit": "#64748b",
};

const categoryMap: Record<string, string[]> = {
  religious: ["🕌 Mosque", "⛪ Church", "🛕 Temple"],
  schools: ["🏫 School"], grocery: ["🛒 Grocery"],
  hospital: ["🏥 Hospital", "🏥 Clinic"], legal: ["⚖️ Legal Aid"],
  community: ["🏛️ Community Center"], restaurant: ["🍽️ Restaurant"],
  bank: ["🏦 Bank"], dmv: ["🚗 DMV"], library: ["📚 Library"],
  transport: ["🚌 Transit"],
};

const categories = [
  { id: "all", label: "All", emoji: "📍" },
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

const places = [
  { id: 1, lat: 40.6794, lng: -73.9534, name: "Masjid At-Taqwa", category: "🕌 Mosque", distance: "0.3 mi", rating: 4.8, reviews: 342, open: true, openUntil: "9:00 PM", address: "1266 Bedford Ave, Brooklyn, NY", phone: "+1 (718) 622-0800", languages: ["Arabic", "Bengali", "English"], immigrantFriendly: true, description: "Serving the Brooklyn Muslim community since 1981.", image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400&h=200&fit=crop" },
  { id: 2, lat: 40.7468, lng: -73.8914, name: "Masjid Al-Aman", category: "🕌 Mosque", distance: "1.2 mi", rating: 4.7, reviews: 218, open: true, openUntil: "10:00 PM", address: "37-14 75th St, Jackson Heights, NY", phone: "+1 (718) 507-8888", languages: ["Arabic", "Urdu", "English"], immigrantFriendly: true, description: "Vibrant Jackson Heights mosque serving South Asian and Arab communities.", image: "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&h=200&fit=crop" },
  { id: 3, lat: 40.7040, lng: -73.8260, name: "Jamaica Muslim Center", category: "🕌 Mosque", distance: "2.0 mi", rating: 4.6, reviews: 156, open: true, openUntil: "8:30 PM", address: "168-04 89th Ave, Jamaica, NY", phone: "+1 (718) 658-4081", languages: ["Arabic", "English", "Bengali"], immigrantFriendly: true, description: "Welcoming mosque with Jumu'ah prayers and ESL classes.", image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=400&h=200&fit=crop" },
  { id: 4, lat: 40.7320, lng: -73.8630, name: "St. Bartholomew's Church", category: "⛪ Church", distance: "1.8 mi", rating: 4.5, reviews: 98, open: true, openUntil: "6:00 PM", address: "40-01 Junction Blvd, Corona, NY", phone: "+1 (718) 699-1011", languages: ["Spanish", "English"], immigrantFriendly: true, description: "Bilingual Spanish-English mass. Active immigrant support programs.", image: "https://images.unsplash.com/photo-1543499859-4f4e3bb8d80a?w=400&h=200&fit=crop" },
  { id: 5, lat: 40.7230, lng: -73.7960, name: "Hindu Temple Society of NA", category: "🛕 Temple", distance: "2.5 mi", rating: 4.9, reviews: 421, open: true, openUntil: "8:00 PM", address: "45-57 Bowne St, Flushing, NY", phone: "+1 (718) 460-8484", languages: ["Hindi", "Bengali", "English", "Tamil"], immigrantFriendly: true, description: "Historic Hindu temple open to all. Daily puja, festivals, and cultural events.", image: "https://images.unsplash.com/photo-1609153897327-f62dfb7caf22?w=400&h=200&fit=crop" },
  { id: 6, lat: 40.7459, lng: -73.8859, name: "PS 69 Jackson Heights", category: "🏫 School", distance: "1.0 mi", rating: 4.3, reviews: 87, open: true, openUntil: "3:30 PM", address: "77-02 37th Ave, Jackson Heights, NY", phone: "+1 (718) 335-0610", languages: ["Spanish", "Bengali", "English"], immigrantFriendly: true, description: "Public elementary school with strong ESL and immigrant family support programs.", image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=200&fit=crop" },
  { id: 7, lat: 40.7391, lng: -73.8701, name: "IS 5 Elmhurst", category: "🏫 School", distance: "1.5 mi", rating: 4.1, reviews: 63, open: true, openUntil: "3:00 PM", address: "80-00 Commonwealth Blvd, Elmhurst, NY", phone: "+1 (718) 898-7474", languages: ["Chinese", "Spanish", "English"], immigrantFriendly: true, description: "Diverse middle school with multilingual staff and after-school programs.", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=200&fit=crop" },
  { id: 8, lat: 40.7612, lng: -73.8300, name: "LaGuardia Community College", category: "🏫 School", distance: "3.1 mi", rating: 4.6, reviews: 312, open: true, openUntil: "8:00 PM", address: "31-10 Thomson Ave, Long Island City, NY", phone: "+1 (718) 482-7200", languages: ["Spanish", "Chinese", "Bengali", "English"], immigrantFriendly: true, description: "Community college with ESL, GED, and workforce development for immigrants.", image: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=400&h=200&fit=crop" },
  { id: 9, lat: 40.7498, lng: -73.8903, name: "Little Bangladesh Grocery", category: "🛒 Grocery", distance: "1.1 mi", rating: 4.9, reviews: 567, open: true, openUntil: "10:00 PM", address: "73-10 37th Ave, Jackson Heights, NY", phone: "+1 (718) 335-0000", languages: ["Bengali", "Hindi", "English"], immigrantFriendly: true, description: "Largest Bangladeshi grocery store in Queens. Fresh produce, spices, halal meat.", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop" },
  { id: 10, lat: 40.7420, lng: -73.8820, name: "Patel Brothers", category: "🛒 Grocery", distance: "1.3 mi", rating: 4.8, reviews: 934, open: true, openUntil: "9:00 PM", address: "37-27 74th St, Jackson Heights, NY", phone: "+1 (718) 898-3445", languages: ["Hindi", "Gujarati", "English"], immigrantFriendly: true, description: "The go-to South Asian supermarket for spices, lentils, fresh produce, and snacks.", image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=200&fit=crop" },
  { id: 11, lat: 40.7341, lng: -73.8760, name: "La Placita Supermarket", category: "🛒 Grocery", distance: "1.8 mi", rating: 4.5, reviews: 223, open: true, openUntil: "10:00 PM", address: "91-09 Roosevelt Ave, Elmhurst, NY", phone: "+1 (718) 446-5050", languages: ["Spanish", "English"], immigrantFriendly: true, description: "Latin American grocery with fresh meats, tropical produce, and household goods.", image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=200&fit=crop" },
  { id: 12, lat: 40.7386, lng: -73.8786, name: "Elmhurst Hospital Center", category: "🏥 Hospital", distance: "1.4 mi", rating: 4.2, reviews: 1204, open: true, openUntil: "24h", address: "79-01 Broadway, Elmhurst, NY", phone: "+1 (718) 334-4000", languages: ["Spanish", "Bengali", "Chinese", "Arabic", "Hindi", "English"], immigrantFriendly: true, description: "Multilingual hospital. Interpreter services available.", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=200&fit=crop" },
  { id: 13, lat: 40.6975, lng: -73.8025, name: "Jamaica Hospital Medical Ctr", category: "🏥 Hospital", distance: "2.1 mi", rating: 4.0, reviews: 876, open: true, openUntil: "24h", address: "89th Ave & Van Wyck Expy, Jamaica, NY", phone: "+1 (718) 206-6000", languages: ["Spanish", "Bengali", "Mandarin", "English"], immigrantFriendly: true, description: "Full-service hospital with multilingual staff.", image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=200&fit=crop" },
  { id: 14, lat: 40.7470, lng: -73.8730, name: "Queens Community Health Ctr", category: "🏥 Clinic", distance: "1.6 mi", rating: 4.5, reviews: 312, open: true, openUntil: "6:00 PM", address: "82-90 Woodhaven Blvd, Queens, NY", phone: "+1 (718) 850-5400", languages: ["Spanish", "Bengali", "English", "Hindi"], immigrantFriendly: true, description: "Sliding-scale fees. Multilingual primary care and dental services.", image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=200&fit=crop" },
  { id: 15, lat: 40.6975, lng: -73.8025, name: "Queens Legal Services", category: "⚖️ Legal Aid", distance: "0.8 mi", rating: 4.6, reviews: 189, open: true, openUntil: "5:00 PM", address: "89-00 Sutphin Blvd, Jamaica, NY", phone: "+1 (718) 657-8611", languages: ["English", "Spanish", "Bengali"], immigrantFriendly: true, description: "Free legal services for low-income immigrants. Immigration, housing, and benefits.", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=200&fit=crop" },
  { id: 16, lat: 40.7561, lng: -73.8722, name: "NY Legal Assistance Group", category: "⚖️ Legal Aid", distance: "1.5 mi", rating: 4.7, reviews: 134, open: true, openUntil: "5:00 PM", address: "100-12 Corona Ave, Corona, NY", phone: "+1 (646) 442-4200", languages: ["Spanish", "English", "Bengali"], immigrantFriendly: true, description: "Free civil legal assistance. Specializes in immigration, housing, and family law.", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=200&fit=crop" },
  { id: 17, lat: 40.7480, lng: -73.8890, name: "MASA Queens", category: "🏛️ Community Center", distance: "1.2 mi", rating: 4.7, reviews: 167, open: true, openUntil: "7:00 PM", address: "75-01 37th Ave, Jackson Heights, NY", phone: "+1 (718) 205-0994", languages: ["Bengali", "Hindi", "English"], immigrantFriendly: true, description: "Empowering South Asian immigrants with job training, language classes.", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=200&fit=crop" },
  { id: 18, lat: 40.7350, lng: -73.8800, name: "Make the Road New York", category: "🏛️ Community Center", distance: "1.7 mi", rating: 4.8, reviews: 289, open: true, openUntil: "6:00 PM", address: "92-10 Roosevelt Ave, Jackson Heights, NY", phone: "+1 (718) 565-8500", languages: ["Spanish", "English"], immigrantFriendly: true, description: "Grassroots organization offering legal, health, and social services.", image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=200&fit=crop" },
  { id: 19, lat: 40.7452, lng: -73.8870, name: "Kabir's Halal Restaurant", category: "🍽️ Restaurant", distance: "1.1 mi", rating: 4.8, reviews: 445, open: true, openUntil: "11:00 PM", address: "74-16 37th Ave, Jackson Heights, NY", phone: "+1 (718) 779-1234", languages: ["Bengali", "Urdu", "English"], immigrantFriendly: true, description: "Authentic Bangladeshi & Mughlai cuisine. Best biryani in Jackson Heights.", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=200&fit=crop" },
  { id: 20, lat: 40.7396, lng: -73.8831, name: "Rincon Criollo", category: "🍽️ Restaurant", distance: "1.5 mi", rating: 4.6, reviews: 312, open: true, openUntil: "10:00 PM", address: "40-09 Junction Blvd, Corona, NY", phone: "+1 (718) 639-8158", languages: ["Spanish", "English"], immigrantFriendly: true, description: "Famous Cuban restaurant. Black beans, roast pork, and pressed sandwiches.", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=200&fit=crop" },
  { id: 21, lat: 40.7462, lng: -73.8895, name: "Amalgamated Bank - Queens", category: "🏦 Bank", distance: "1.0 mi", rating: 4.4, reviews: 98, open: true, openUntil: "5:00 PM", address: "37-23 74th St, Jackson Heights, NY", phone: "+1 (800) 662-0860", languages: ["Spanish", "English"], immigrantFriendly: true, description: "No minimum balance, ITIN accounts accepted, Spanish-speaking staff.", image: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=400&h=200&fit=crop" },
  { id: 22, lat: 40.7220, lng: -73.7970, name: "Flushing Bank", category: "🏦 Bank", distance: "3.0 mi", rating: 4.5, reviews: 134, open: true, openUntil: "4:30 PM", address: "144-17 Northern Blvd, Flushing, NY", phone: "+1 (800) 581-2889", languages: ["Mandarin", "Korean", "English"], immigrantFriendly: true, description: "Multilingual banking. Mandarin and Korean-speaking staff.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop" },
  { id: 23, lat: 40.6942, lng: -73.8073, name: "DMV - Jamaica", category: "🚗 DMV", distance: "2.1 mi", rating: 3.8, reviews: 892, open: true, openUntil: "4:30 PM", address: "168-46 91st Ave, Jamaica, NY", phone: "+1 (718) 526-5100", languages: ["Bengali", "Spanish", "English", "Mandarin"], immigrantFriendly: true, description: "Bengali-speaking staff available on Wednesdays.", image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=200&fit=crop" },
  { id: 24, lat: 40.7505, lng: -73.8808, name: "Library - Jackson Heights", category: "📚 Library", distance: "1.6 mi", rating: 4.5, reviews: 234, open: true, openUntil: "6:00 PM", address: "35-51 81st St, Jackson Heights, NY", phone: "+1 (718) 899-2500", languages: ["English", "Spanish", "Bengali"], immigrantFriendly: true, description: "Free ESL classes, citizenship prep, and computer access.", image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=200&fit=crop" },
  { id: 25, lat: 40.7400, lng: -73.8900, name: "Elmhurst Library", category: "📚 Library", distance: "2.0 mi", rating: 4.6, reviews: 178, open: true, openUntil: "6:00 PM", address: "86-01 Broadway, Elmhurst, NY", phone: "+1 (718) 271-1020", languages: ["Spanish", "Chinese", "English"], immigrantFriendly: true, description: "Multilingual library with immigrant resource center and free Wi-Fi.", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop" },
  { id: 26, lat: 40.7468, lng: -73.8914, name: "Jackson Heights Transit Hub", category: "🚌 Transit", distance: "1.0 mi", rating: 4.2, reviews: 2341, open: true, openUntil: "24h", address: "Roosevelt Ave & 74th St, Queens, NY", phone: "+1 (718) 330-1234", languages: ["Spanish", "English"], immigrantFriendly: true, description: "E, F, M, R, 7 trains. Bus connections to all of Queens.", image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=400&h=200&fit=crop" },
  { id: 27, lat: 40.7000, lng: -73.8090, name: "Jamaica Station", category: "🚌 Transit", distance: "2.2 mi", rating: 4.0, reviews: 1876, open: true, openUntil: "24h", address: "Sutphin Blvd & Archer Ave, Jamaica, NY", phone: "+1 (718) 330-1234", languages: ["English", "Spanish"], immigrantFriendly: true, description: "E, J, Z trains + LIRR + AirTrain JFK. Free transfers.", image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&h=200&fit=crop" },
];

type Place = typeof places[0];

// ── Hover tooltip card (desktop only) ────────────────────────────────────────
function HoverTooltipCard({
  place, px, containerW, containerH, onDirections, onViewDetails,
}: {
  place: Place; px: { x: number; y: number }; containerW: number; containerH: number;
  onDirections: (p: Place) => void; onViewDetails: (p: Place) => void;
}) {
  const [saved, setSaved] = useState(false);
  const CARD_W = 260;
  const CARD_H = 270;
  const MARKER_H = 42;
  const GAP = 10;
  const color = categoryColors[place.category] ?? "#6366f1";

  // Default: above the pin
  let left = px.x - CARD_W / 2;
  let top = px.y - MARKER_H - CARD_H - GAP;
  let arrowSide: "bottom" | "top" | "none" = "bottom";

  left = Math.max(6, Math.min(left, containerW - CARD_W - 6));

  if (top < 6) {
    // Not enough room above — try right then left
    const rightLeft = px.x + 20 + GAP;
    if (rightLeft + CARD_W <= containerW - 6) {
      left = rightLeft;
    } else {
      left = Math.max(6, px.x - CARD_W - 20 - GAP);
    }
    top = Math.max(6, Math.min(px.y - CARD_H / 2, containerH - CARD_H - 6));
    arrowSide = "none";
  }

  return (
    <div
      className="absolute z-[999] bg-white rounded-2xl shadow-2xl border border-border overflow-visible"
      style={{ left, top, width: CARD_W, transition: "left 0.12s ease, top 0.12s ease" }}
      // keep card alive while mouse is over it
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
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-primary text-white text-[11px] font-semibold hover:opacity-90 transition"
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

      {/* Downward arrow toward pin */}
      {arrowSide === "bottom" && (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: -8, width: 0, height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "8px solid white",
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
          }}
        />
      )}
    </div>
  );
}

// ── Leaflet map component ─────────────────────────────────────────────────────
function LeafletMap({
  visiblePlaces, activePlaceId, routes, selectedRouteId, userLocation,
  onMarkerClick, onMapClick, onRouteClick, onMarkerHover,
}: {
  visiblePlaces: Place[];
  activePlaceId: number | null;
  routes: RouteOption[];
  selectedRouteId: number | null;
  userLocation: [number, number] | null;
  onMarkerClick: (p: Place, px: { x: number; y: number }) => void;
  onMapClick: () => void;
  onRouteClick: (id: number) => void;
  onMarkerHover: (p: Place | null, px?: { x: number; y: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapType | null>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const routeLinesRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  function makeMarkerHtml(color: string, active: boolean, name: string) {
    const size = active ? 38 : 30;
    return `<div style="position:relative;width:${size}px;height:${size}px;">
      <div style="background:${color};width:${size}px;height:${size}px;
        border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        border:${active ? "4px" : "3px"} solid white;
        box-shadow:${active ? "0 4px 16px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.3)"};"></div>
      ${active ? `<div style="position:absolute;top:-32px;left:50%;transform:translateX(-50%);
        background:${color};color:white;font-size:11px;font-weight:700;
        padding:3px 8px;border-radius:20px;white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);font-family:system-ui,sans-serif;">
        ${name.split(" ").slice(0, 2).join(" ")}</div>` : ""}
    </div>`;
  }

  const syncMarkers = useCallback((L: any, map: any, ps: Place[], activeId: number | null) => {
    const ids = new Set(ps.map(p => p.id));
    markersRef.current.forEach((m, id) => { if (!ids.has(id)) { m.remove(); markersRef.current.delete(id); } });
    ps.forEach(place => {
      if (markersRef.current.has(place.id)) return;
      const color = categoryColors[place.category] ?? "#6366f1";
      const icon = L.divIcon({
        className: "", html: makeMarkerHtml(color, place.id === activeId, place.name),
        iconSize: place.id === activeId ? [38, 38] : [30, 30],
        iconAnchor: place.id === activeId ? [19, 38] : [15, 30],
      });
      const marker = L.marker([place.lat, place.lng], { icon }).addTo(map);
      marker.on("click", () => {
        const px = map.latLngToContainerPoint([place.lat, place.lng]);
        onMarkerClick(place, { x: px.x, y: px.y });
      });
      // Desktop hover — delegate to parent
      marker.on("mouseover", () => {
        if (window.innerWidth < 768) return;
        const px = map.latLngToContainerPoint([place.lat, place.lng]);
        onMarkerHover(place, { x: px.x, y: px.y });
      });
      marker.on("mouseout", () => onMarkerHover(null));
      markersRef.current.set(place.id, marker);
    });
  }, [onMarkerClick]);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    import("leaflet").then(L => {
      if (!containerRef.current || mapRef.current) return;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      const map = L.map(containerRef.current!, { center: [40.7282, -73.8582], zoom: 12 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      map.on("click", () => onMapClick());
      mapRef.current = map; LRef.current = L;
      syncMarkers(L, map, visiblePlaces, activePlaceId);
    });
    return () => { mapRef.current?.remove(); mapRef.current = null; markersRef.current.clear(); };
  }, []);

  // Sync place markers
  useEffect(() => { if (mapRef.current && LRef.current) syncMarkers(LRef.current, mapRef.current, visiblePlaces, activePlaceId); }, [visiblePlaces, syncMarkers]);

  // Update active marker highlight
  useEffect(() => {
    if (!LRef.current) return;
    markersRef.current.forEach((marker, id) => {
      const place = places.find(p => p.id === id); if (!place) return;
      const color = categoryColors[place.category] ?? "#6366f1";
      const active = id === activePlaceId;
      marker.setIcon(LRef.current.divIcon({
        className: "", html: makeMarkerHtml(color, active, place.name),
        iconSize: active ? [38, 38] : [30, 30], iconAnchor: active ? [19, 38] : [15, 30],
      }));
    });
  }, [activePlaceId]);

  // Fly to active place
  useEffect(() => {
    if (!mapRef.current || activePlaceId === null) return;
    const p = places.find(p => p.id === activePlaceId);
    if (!p) return;
    const map = mapRef.current;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const MOBILE_CARD_H = 300;

    map.flyTo([p.lat, p.lng], 16, { duration: 1.0 });

    // Mobile only: after fly, pan UP so pin appears above the bottom sheet card
    if (isMobile) {
      map.once("moveend", () => {
        const containerH = containerRef.current?.offsetHeight ?? 600;
        const visibleH = containerH - MOBILE_CARD_H;
        const dy = (containerH / 2) - (visibleH / 2); // shift pin into visible center
        map.panBy([0, -dy], { animate: true, duration: 0.25 });
      });
    }
  }, [activePlaceId]);

  // Auto fit bounds for filtered places
  useEffect(() => {
    if (!mapRef.current || !LRef.current || visiblePlaces.length === 0 || routes.length > 0) return;
    if (visiblePlaces.length === 1) {
      mapRef.current.flyTo([visiblePlaces[0].lat, visiblePlaces[0].lng], 16, { duration: 1.0 });
    } else if (visiblePlaces.length < places.length) {
      const bounds = LRef.current.latLngBounds(visiblePlaces.map(p => [p.lat, p.lng]));
      mapRef.current.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [visiblePlaces, routes.length]);

  // Draw/clear route polylines + user location
  useEffect(() => {
    if (!mapRef.current || !LRef.current) return;
    const L = LRef.current; const map = mapRef.current;

    // Clear old route lines
    routeLinesRef.current.forEach(l => l.remove());
    routeLinesRef.current = [];
    if (userMarkerRef.current) { userMarkerRef.current.remove(); userMarkerRef.current = null; }

    if (routes.length === 0) return;

    // User location pulsing dot
    if (userLocation) {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;
          border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,0.25);"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8],
      });
      userMarkerRef.current = L.marker(userLocation, { icon, zIndexOffset: 1000 }).addTo(map);
    }

    // Draw unselected routes first (dimmer), selected on top
    const sorted = [...routes].sort((a, b) =>
      (a.id === selectedRouteId ? 1 : 0) - (b.id === selectedRouteId ? 1 : 0)
    );

    sorted.forEach(route => {
      const isSelected = route.id === selectedRouteId;
      if (isSelected) {
        // Draw traffic-colored segments for selected route
        route.trafficSegments.forEach(seg => {
          const color = trafficColor(seg.level);
          const line = L.polyline(seg.coords, { color, weight: 7, opacity: 0.92, lineCap: "round", lineJoin: "round" }).addTo(map);
          routeLinesRef.current.push(line);
        });
        // White outline behind for contrast
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

    // Fit bounds to show all routes + endpoints
    const allCoords = routes.flatMap(r => r.coords);
    if (userLocation) allCoords.push(userLocation);
    const bounds = L.latLngBounds(allCoords);
    map.fitBounds(bounds, { padding: [80, 80] });
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
      {/* Handle + header */}
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
              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">Your Location</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold text-foreground truncate">{destination.name}</span>
            </div>
          </div>
          <button onClick={() => setCollapsed(c => !c)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center transition">
            <ChevronDown className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 px-4 pb-3">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => loadRoutes(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${mode === id ? "bg-primary text-white shadow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Route list */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Finding best routes…</span>
            </div>
          ) : routes.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No routes found</div>
          ) : routes.map(route => {
            const isSel = route.id === selectedRouteId;
            const tColor = trafficColor(route.traffic);
            return (
              <button
                key={route.id}
                onClick={() => onSelectRoute(route.id)}
                className={`w-full text-left rounded-2xl border-2 p-3 transition-all ${isSel ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-white hover:border-primary/40"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isSel && <div className="w-2 h-2 rounded-full bg-primary" />}
                    <span className="text-sm font-bold text-foreground">{route.label}</span>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: tColor + "20", color: tColor }}
                  >
                    {trafficLabel(route.traffic)}
                  </span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div className="flex flex-col items-center bg-secondary rounded-xl p-2">
                    <Timer className="w-3.5 h-3.5 text-primary mb-0.5" />
                    <span className="text-xs font-bold text-foreground">{fmtTime(route.duration)}</span>
                    <span className="text-[9px] text-muted-foreground">Time</span>
                  </div>
                  <div className="flex flex-col items-center bg-secondary rounded-xl p-2">
                    <Route className="w-3.5 h-3.5 text-primary mb-0.5" />
                    <span className="text-xs font-bold text-foreground">{fmtDist(route.distance)}</span>
                    <span className="text-[9px] text-muted-foreground">Distance</span>
                  </div>
                  <div className="flex flex-col items-center bg-secondary rounded-xl p-2">
                    <DollarSign className="w-3.5 h-3.5 text-primary mb-0.5" />
                    <span className="text-xs font-bold text-foreground">{route.cost}</span>
                    <span className="text-[9px] text-muted-foreground">Cost</span>
                  </div>
                  <div className="flex flex-col items-center rounded-xl p-2" style={{ background: tColor + "15" }}>
                    <AlertTriangle className="w-3.5 h-3.5 mb-0.5" style={{ color: tColor }} />
                    <span className="text-xs font-bold" style={{ color: tColor }}>
                      {route.traffic === "clear" ? "None" : route.traffic === "moderate" ? "Mod." : "Heavy"}
                    </span>
                    <span className="text-[9px] text-muted-foreground">Traffic</span>
                  </div>
                </div>

                {/* Traffic segments legend */}
                <div className="flex items-center gap-1 flex-wrap">
                  {[...new Set(route.trafficSegments.map(s => s.level))].filter(Boolean).map(lvl => (
                    <span key={lvl} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="w-3 h-1 rounded-full inline-block" style={{ background: trafficColor(lvl) }} />
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </span>
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-auto">on map</span>
                </div>

                {isSel && (
                  <div className="mt-2.5 w-full py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition flex items-center justify-center gap-1.5 cursor-pointer">
                    <Navigation className="w-3.5 h-3.5" /> Start Navigation
                  </div>
                )}
              </button>
            );
          })}

          {/* Traffic legend */}
          {routes.length > 0 && (
            <div className="bg-secondary rounded-2xl p-3">
              <p className="text-xs font-semibold text-foreground mb-2">Map traffic colors</p>
              <div className="flex gap-3">
                {(["clear", "moderate", "heavy"] as TrafficLevel[]).map(lvl => (
                  <div key={lvl} className="flex items-center gap-1.5">
                    <span className="w-6 h-2 rounded-full" style={{ background: trafficColor(lvl) }} />
                    <span className="text-[10px] text-muted-foreground capitalize">{lvl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
}) {
  const [saved, setSaved] = useState(false);
  const color = categoryColors[place.category] ?? "#6366f1";
  // Use window width — map container can be narrow even on desktop due to sidebar
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Desktop: original side-card positioning (unchanged)
  const CARD_W = 288; const CARD_H = 340; const GAP = 14;
  const spaceRight = containerSize.w - markerPx.x;
  const left = spaceRight >= CARD_W + GAP + 20
    ? markerPx.x + GAP + 15
    : markerPx.x - CARD_W - GAP - 15;
  let top = markerPx.y - CARD_H / 2;
  top = Math.max(8, Math.min(top, containerSize.h - CARD_H - 8));

  // Shared card content
  const cardContent = (
    <>
      <div className="relative overflow-hidden" style={{ height: isMobile ? 120 : 144 }}>
        <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
        <button onClick={onClose} className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition">
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
          <button onClick={onDirections} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition">
            <Navigation className="w-3.5 h-3.5" /> Directions
          </button>
          <button onClick={onViewDetails} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition">
            Details <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setSaved(!saved)} className="w-9 flex items-center justify-center rounded-xl border border-border hover:bg-secondary transition">
            <Bookmark className={`w-4 h-4 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          </button>
        </div>
      </div>
    </>
  );

  // Mobile: full-width bottom sheet
  if (isMobile) {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-2xl shadow-2xl border-t border-border overflow-hidden animate-in slide-in-from-bottom-3 duration-250">
        {/* drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-8 h-1 rounded-full bg-border" />
        </div>
        {cardContent}
      </div>
    );
  }

  // Desktop: original floating side card (unchanged)
  return (
    <div className="absolute w-72 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-[1000]"
      style={{ left, top, transition: "left 0.25s, top 0.25s" }}>
      {cardContent}
    </div>
  );
}

// ── Full detail modal ─────────────────────────────────────────────────────────
function PlaceDetail({ place, onClose, onDirections }: { place: Place; onClose: () => void; onDirections: () => void; key?: string | number }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img src={place.image} alt={place.name} className="w-full h-48 object-cover" />
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-secondary transition">
            <X className="w-4 h-4" />
          </button>
          {place.immigrantFriendly && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
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
            <div className="flex gap-2 flex-wrap">{place.languages.map(l => <span key={l} className="text-sm bg-blue-50 text-primary px-3 py-1 rounded-full font-medium">{l}</span>)}</div>
          </div>
          <div className="mb-5"><div className="text-sm font-medium mb-1">About</div><p className="text-sm text-muted-foreground leading-relaxed">{place.description}</p></div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button onClick={onDirections} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition">
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
function PlaceCard({ place, onClick }: { place: Place; onClick: () => void; key?: string | number }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-all cursor-pointer group" onClick={onClick}>
      <div className="relative h-32 bg-muted overflow-hidden">
        <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {place.immigrantFriendly && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" /> Immigrant-Friendly
          </div>
        )}
        <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
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
          <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:opacity-90 transition" onClick={e => e.stopPropagation()}>
            <Navigation className="w-3 h-3" /> Directions
          </button>
          <button className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs font-medium hover:bg-secondary transition" onClick={e => e.stopPropagation()}><MessageCircle className="w-3 h-3" /></button>
          <button className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs font-medium hover:bg-secondary transition" onClick={e => e.stopPropagation()}><Share2 className="w-3 h-3" /></button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const DEFAULT_LOCATION: [number, number] = [40.7282, -73.8582]; // Queens center

export function MapDiscovery() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("map");
  const [mapActiveId, setMapActiveId] = useState<number | null>(null);
  const [markerPx, setMarkerPx] = useState({ x: 0, y: 0 });
  const [hoverPlace, setHoverPlace] = useState<Place | null>(null);
  const [hoverPx, setHoverPx] = useState({ x: 0, y: 0 });
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [directionsFor, setDirectionsFor] = useState<Place | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_LOCATION);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Try to get real GPS on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => { } // keep default
    );
  }, []);

  const visiblePlaces = places.filter(p => {
    const q = query.trim().toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
    const matchCat = activeCategory === "all" || (categoryMap[activeCategory] ?? []).includes(p.category);
    return matchQ && matchCat;
  });

  const mapActivePlace = mapActiveId !== null ? places.find(p => p.id === mapActiveId) ?? null : null;
  const mapContainerSize = mapContainerRef.current
    ? { w: mapContainerRef.current.offsetWidth, h: mapContainerRef.current.offsetHeight }
    : { w: 400, h: 500 };

  function openDirections(place: Place) {
    setDetailPlace(null);
    setMapActiveId(null);
    setRoutes([]);
    setSelectedRouteId(null);
    setDirectionsFor(place);
    setViewMode("map");
  }

  function handleSearchInput(val: string) {
    setQuery(val);
    setSuggestions(val.trim().length >= 1
      ? places.filter(p => p.name.toLowerCase().includes(val.toLowerCase()) || p.address.toLowerCase().includes(val.toLowerCase())).slice(0, 5)
      : []);
    if (!val.trim()) setMapActiveId(null);
  }

  function selectSuggestion(place: Place) {
    setQuery(place.name); setSuggestions([]);
    setMapActiveId(place.id); setViewMode("map");
    inputRef.current?.blur();
  }

  function clearSearch() {
    setQuery(""); setSuggestions([]); setMapActiveId(null);
  }

  return (
    <AppLayout noPad hideNav>
      <div className="flex flex-col h-screen max-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-border p-4 space-y-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              <input ref={inputRef} type="text" value={query} onChange={e => handleSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && suggestions[0]) selectSuggestion(suggestions[0]); if (e.key === "Escape") { setSuggestions([]); inputRef.current?.blur(); } }}
                placeholder="Search places, mosques, hospitals…"
                className="w-full pl-10 pr-9 py-2.5 bg-input-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
              />
              {query && <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"><X className="w-3.5 h-3.5" /></button>}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-border shadow-xl z-50 overflow-hidden">
                  {suggestions.map((place, i) => (
                    <button key={place.id} onMouseDown={() => selectSuggestion(place)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition text-left ${i < suggestions.length - 1 ? "border-b border-border" : ""}`}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ background: categoryColors[place.category] ?? "#6366f1" }}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{place.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{place.address}</div>
                      </div>
                      <div className="flex items-center gap-0.5 text-xs text-amber-600 font-medium flex-shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{place.rating}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="w-10 h-10 rounded-xl border border-border bg-white flex items-center justify-center hover:bg-secondary transition flex-shrink-0">
              <Navigation className="w-4 h-4 text-primary" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(({ id, label, emoji }) => (
              <button key={id} onClick={() => { setActiveCategory(id); setMapActiveId(null); if (id !== "all") setViewMode("map"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${activeCategory === id ? "bg-primary text-white shadow-sm" : "bg-white border border-border text-muted-foreground hover:text-primary hover:border-primary"}`}>
                <span>{emoji}</span> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Result count row + view toggle */}
        <div className="flex items-center px-3 py-2 bg-background border-b border-border flex-shrink-0 gap-2">
          {/* Back arrow */}
          <button
            onClick={() => navigate(-1 as unknown as string)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>

          {/* Centered count text */}
          <p className="flex-1 text-sm text-muted-foreground text-center">
            {visiblePlaces.length} place{visiblePlaces.length !== 1 ? "s" : ""}{query ? ` for "${query}"` : " near Queens, NY"}
          </p>
        </div>

        {/* Map Content */}
        <div ref={mapContainerRef} className="flex-1 relative overflow-hidden">
          <LeafletMap
            visiblePlaces={directionsFor ? [] : visiblePlaces}
            activePlaceId={mapActiveId}
            routes={routes}
            selectedRouteId={selectedRouteId}
            userLocation={directionsFor ? userLocation : null}
            onMarkerClick={(p, px) => { setMarkerPx(px); setHoverPlace(null); setMapActiveId(prev => prev === p.id ? null : p.id); }}
            onMapClick={() => { if (!directionsFor) setMapActiveId(null); }}
            onRouteClick={id => setSelectedRouteId(id)}
            onMarkerHover={(p, px) => { setHoverPlace(p); if (px) setHoverPx(px); }}
          />
          {/* Desktop hover tooltip */}
          {!directionsFor && hoverPlace && !mapActiveId && (
            <HoverTooltipCard
              place={hoverPlace}
              px={hoverPx}
              containerW={mapContainerSize.w}
              containerH={mapContainerSize.h}
              onDirections={p => { setHoverPlace(null); openDirections(p); }}
              onViewDetails={p => { setHoverPlace(null); setDetailPlace(p); }}
            />
          )}

          {/* Directions sheet */}
          {directionsFor && (
            <DirectionsSheet
              destination={directionsFor}
              userLocation={userLocation}
              routes={routes}
              selectedRouteId={selectedRouteId}
              onRoutesReady={r => { setRoutes(r); setSelectedRouteId(r[0]?.id ?? null); }}
              onSelectRoute={setSelectedRouteId}
              onClose={() => { setDirectionsFor(null); setRoutes([]); setSelectedRouteId(null); }}
            />
          )}

          {/* Place card beside marker */}
          {!directionsFor && mapActivePlace && (
            <MapPlaceCard
              place={mapActivePlace}
              markerPx={markerPx}
              containerSize={mapContainerSize}
              onClose={() => setMapActiveId(null)}
              onViewDetails={() => { setDetailPlace(mapActivePlace); setMapActiveId(null); }}
              onDirections={() => openDirections(mapActivePlace)}
            />
          )}

          {/* Bottom mini strip */}
          {!directionsFor && !mapActivePlace && (
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-10 pointer-events-none"
              style={{ background: "linear-gradient(to top,rgba(0,0,0,0.2) 0%,transparent 100%)" }}>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide pointer-events-auto">
                {visiblePlaces.map(place => (
                  <button key={place.id}
                    onClick={() => { const c = mapContainerRef.current; setMarkerPx(c ? { x: c.offsetWidth / 2, y: c.offsetHeight / 2 } : { x: 200, y: 250 }); setMapActiveId(place.id); }}
                    className="bg-white rounded-xl border border-border p-2.5 min-w-44 shadow-lg hover:shadow-xl transition-all flex-shrink-0 text-left">
                    <div className="text-sm font-semibold line-clamp-1">{place.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{place.distance} · {place.category}</div>
                    <div className="flex items-center gap-1 mt-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-xs font-medium">{place.rating}</span></div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {detailPlace && (
        <PlaceDetail
          place={detailPlace}
          onClose={() => setDetailPlace(null)}
          onDirections={() => { openDirections(detailPlace); setDetailPlace(null); }}
        />
      )}
    </AppLayout>
  );
}
