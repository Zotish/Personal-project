import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  ChevronLeft, ChevronRight, Star, Heart, MessageCircle,
  Repeat2, Share2, Bookmark, ExternalLink,
  BadgeCheck, Zap, Users, HelpCircle, Filter,
  Search, Phone, Globe, LayoutGrid, Check, MapPin,
  Navigation, Map, Layers, RefreshCw
} from "lucide-react";
import { addFavourite, removeFavourite, isFavourited } from "../utils/myBox";
import { useCountryPlatform } from "../context/CountryPlatformContext";
import {
  loadBkoiGL,
  BARIKOI_API_KEY,
  getMapStyleForLocation,
  bariKoiTransformRequest,
  attachMapboxFallbackOnError
} from "../services/barikoiService";

// ─── Service meta ──────────────────────────────────────────────────────────────

type ServiceMeta = {
  label: string;
  emoji: string;
  color: string;
  bg: string;
  heroDesc: string;
  ctaLabel: string;
};

const serviceMeta: Record<string, ServiceMeta> = {
  "medical-courier":   { label: "Medical Courier Service",      emoji: "📦", color: "#0284c7", bg: "#e0f2fe", heroDesc: "Fast medicine delivery, diagnostic reports, and emergency healthcare transport in Dhaka", ctaLabel: "Book Courier" },
  "pharmacy":          { label: "Pharmacy & Medicines",         emoji: "💊", color: "#10b981", bg: "#ecfdf5", heroDesc: "Find nearby 24-hour pharmacies, prescription medicines, and home delivery",         ctaLabel: "View Pharmacy" },
  "money-exchange":    { label: "Money Exchange & Remittance",  emoji: "💱", color: "#059669", bg: "#ecfdf5", heroDesc: "Live exchange rates, bKash remittance points & authorized foreign currency changers",ctaLabel: "Compare Rates" },
  "used-furniture":    { label: "Furniture Marketplace",        emoji: "🛋️", color: "#b45309", bg: "#fffbeb", heroDesc: "Buy & sell quality beds, sofas, almirahs & office desks across Dhaka",              ctaLabel: "Browse Furniture" },
  "home-kitchen":      { label: "Home Kitchen & Tiffin",        emoji: "🍲", color: "#ea580c", bg: "#fff7ed", heroDesc: "Authentic homemade Bangladeshi meals, daily office tiffins & weekend catering",      ctaLabel: "Order Meal" },
  "free-medicine":     { label: "Free & Subsidized Medicine",   emoji: "🏥", color: "#e11d48", bg: "#ffe4e6", heroDesc: "Charity dispensaries, Red Crescent free clinics & diabetes insulin support",         ctaLabel: "Check Eligibility" },
  "petrol":            { label: "Gas, EV & Fuel Stations",      emoji: "⛽", color: "#d97706", bg: "#fef3c7", heroDesc: "Compare Octane prices, EV DC fast chargers, CNG stations & 24h marts",             ctaLabel: "Get Directions" },
  "scholarship":       { label: "Scholarships & Grants",        emoji: "🎓", color: "#7c3aed", bg: "#f5f3ff", heroDesc: "Undergraduate, graduate and vocational scholarships for meritorious students",     ctaLabel: "Apply Scholarship" },
  "admission":         { label: "College & University Admission",emoji: "🏫", color: "#4f46e5", bg: "#e0e7ff", heroDesc: "Public & private universities, HSC colleges & international study guidance",       ctaLabel: "Apply Now" },
  "jobs-agency":       { label: "Employment & Staffing Agency", emoji: "🤝", color: "#2563eb", bg: "#eff6ff", heroDesc: "IT, corporate, banking, retail & driver placements across Dhaka",                  ctaLabel: "Apply Job" },
  "movie-hall":        { label: "Movie Theaters & Multiplex",   emoji: "🎬", color: "#db2777", bg: "#fce7f3", heroDesc: "Star Cineplex, Blockbuster Cinemas showtimes, IMAX 3D & online seat booking",       ctaLabel: "Book Ticket" },
  "travel-agency":     { label: "Travel & Flight Booking",      emoji: "✈️", color: "#0891b2", bg: "#cffafe", heroDesc: "Biman Bangladesh, US-Bangla, international flight tickets & Umrah packages",      ctaLabel: "Get Flight Quote" },
  "metro":             { label: "Dhaka Metro Rail (MRT-6)",     emoji: "🚆", color: "#0284c7", bg: "#e0f2fe", heroDesc: "MRT Line 6 stations, live arrival schedule, Rapid Pass & fare chart",             ctaLabel: "Plan Route" },
  "subway":            { label: "Dhaka Metro & Transit",        emoji: "🚇", color: "#475569", bg: "#f1f5f9", heroDesc: "Real-time MRT arrivals, station exits, connecting bus routes & train alerts",      ctaLabel: "View Station Map" },
  "community-hospital":{ label: "Hospitals & Emergency Care",   emoji: "🩺", color: "#dc2626", bg: "#fee2e2", heroDesc: "24/7 Trauma centers, tertiary hospitals, specialist doctors & ambulances",           ctaLabel: "Book Visit" },
  "social-services":   { label: "Community & Social Aid",       emoji: "🏛️", color: "#059669", bg: "#d1fae5", heroDesc: "BRAC, Red Crescent, emergency relief, micro-finance & welfare programs",          ctaLabel: "Access Service" },
  "buy-sell":          { label: "Buy & Sell Marketplace",       emoji: "🛍️", color: "#6366f1", bg: "#eef2ff", heroDesc: "Verified second-hand electronics, vehicles, and household items",                 ctaLabel: "View Listing" },
  "cars":              { label: "Cars & Automotive Center",     emoji: "🚗", color: "#f97316", bg: "#fff7ed", heroDesc: "Navana Toyota, reconditioned Japanese hybrid car showrooms & BRTA service",       ctaLabel: "See Vehicles" },
  "services":          { label: "Repairs & Home Services",      emoji: "🔧", color: "#0891b2", bg: "#ecfeff", heroDesc: "Verified electricians, plumbers, AC technicians & home cleaners near you",        ctaLabel: "Hire Now" },
  "electronics":       { label: "Electronics & Tech Markets",   emoji: "💻", color: "#3b82f6", bg: "#eff6ff", heroDesc: "Multiplan, Bashundhara City laptop shops, smartphones & official warranties",     ctaLabel: "Browse Items" },
  "fashion":           { label: "Fashion & Lifestyle",          emoji: "👗", color: "#ec4899", bg: "#fdf2f8", heroDesc: "Traditional sarees, panjabis, western wear & boutique designers",                 ctaLabel: "Shop Now" },
  "rentals":           { label: "Equipment & Vehicle Rentals",  emoji: "🔑", color: "#0891b2", bg: "#ecfeff", heroDesc: "Rent cars, microbuses, generators, and sound systems for events",               ctaLabel: "Rent Now" },
  "translate":         { label: "Document Translation & Notary",emoji: "🌐", color: "#7c3aed", bg: "#f5f3ff", heroDesc: "Certified English, Bengali & Arabic document translation & embassy notary",        ctaLabel: "Get Translation" },
};

// ─── Provider data generator ───────────────────────────────────────────────────

export type Provider = {
  id: number;
  initials: string;
  color: string;
  name: string;
  type: string;
  desc: string;
  tags: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  pro: boolean;
  languages: string[];
  lat: number;
  lng: number;
  address: string;
  phone: string;
};

function getProviders(serviceId: string): Provider[] {
  const base: Record<string, Provider[]> = {
    "medical-courier": [
      { id: 1, initials: "PE", color: "from-sky-500 to-blue-600", name: "Paperfly & Pathao Express Healthcare", type: "Medical Courier", desc: "Same-day cold-chain prescription and lab sample pickup with temperature-controlled delivery across Dhaka.", tags: ["Medical Express","Cold Chain","Lab Reports","Urgent"], rating: 4.9, reviews: 1420, verified: true, pro: true, languages: ["Bengali","English"], lat: 23.7745, lng: 90.3970, address: "Mohakhali Commercial Area, Dhaka", phone: "+880 1711-234001" },
      { id: 2, initials: "RX", color: "from-teal-500 to-emerald-600", name: "Lazz Pharma Home Rx Delivery", type: "Pharmacy Dispatch", desc: "Official rapid doorstep medicine delivery service from Kalabagan Central Hub 24/7.", tags: ["24/7 Delivery","Prescription","Emergency Saline"], rating: 4.8, reviews: 890, verified: true, pro: false, languages: ["Bengali","English"], lat: 23.7510, lng: 90.3805, address: "Kalabagan, Mirpur Road, Dhaka", phone: "+880 1711-234002" },
      { id: 3, initials: "MD", color: "from-indigo-400 to-purple-500", name: "MediCourier Hospital Express", type: "Hospital Logistics", desc: "Scheduled blood sample, biopsy transport, and critical hospital report delivery between medical facilities.", tags: ["Hospital Sample","Secure Cold Box","Biopsy"], rating: 4.7, reviews: 630, verified: true, pro: false, languages: ["Bengali","English"], lat: 23.7485, lng: 90.3890, address: "Panthapath, Dhaka", phone: "+880 1711-234003" },
    ],
    "movie-hall": [
      { id: 1, initials: "SC", color: "from-pink-600 to-rose-700", name: "Star Cineplex – Bashundhara City", type: "Multiplex Cinema", desc: "Premier 3D multiplex theater showing the latest Hollywood blockbusters and celebrated Bangladeshi films.", tags: ["IMAX 3D","Dolby Atmos","VIP Seating","Halal Snacks"], rating: 4.9, reviews: 4890, verified: true, pro: true, languages: ["Bengali","English"], lat: 23.7510, lng: 90.3905, address: "Level 8, Bashundhara City Mall, Panthapath, Dhaka", phone: "+880 2-9111440" },
      { id: 2, initials: "SM", color: "from-purple-600 to-indigo-700", name: "Star Cineplex – Sony Square Mirpur", type: "Multiplex Cinema", desc: "Modern multi-screen cinema with spacious seating, 4K laser projection, and comfortable lounges.", tags: ["4K Laser","Mirpur 2","Blockbuster","Online Booking"], rating: 4.8, reviews: 3120, verified: true, pro: true, languages: ["Bengali","English"], lat: 23.8060, lng: 90.3620, address: "Sony Square, Mirpur 2, Dhaka", phone: "+880 2-9011223" },
      { id: 3, initials: "BC", color: "from-red-500 to-orange-600", name: "Blockbuster Cinemas – Jamuna Future Park", type: "Luxury Cinema", desc: "Largest cinema complex with 7 screens including Club Royale, 3D, and dedicated South Asian film premieres.", tags: ["7 Screens","Club Royale","Jamuna Future Park"], rating: 4.7, reviews: 2980, verified: true, pro: false, languages: ["Bengali","English"], lat: 23.8135, lng: 90.4240, address: "Jamuna Future Park, Progoti Shoroni, Dhaka", phone: "+880 2-8416040" },
    ],
    "scholarship": [
      { id: 1, initials: "PM", color: "from-purple-600 to-indigo-700", name: "Prime Minister's Fellowship & Trust", type: "National Fellowship", desc: "Prestigious government scholarship funding Masters and PhD programs at world's top 100 QS-ranked universities.", tags: ["Govt Fellowship","Full Funding","PhD & Masters","Merit Based"], rating: 4.9, reviews: 3120, verified: true, pro: true, languages: ["Bengali","English"], lat: 23.7700, lng: 90.3780, address: "Cabinet Division, Agargaon, Dhaka", phone: "+880 2-55006600" },
      { id: 2, initials: "BS", color: "from-violet-500 to-purple-600", name: "British Council Bangladesh IELTS Scholarship", type: "International Grant", desc: "Annual academic financial grant awarded to high-achieving IELTS examinees studying abroad.", tags: ["British Council","Study in UK","IELTS Award"], rating: 4.8, reviews: 2190, verified: true, pro: false, languages: ["English","Bengali"], lat: 23.7870, lng: 90.4130, address: "5 Fuller Road, DU Campus / Gulshan 1, Dhaka", phone: "+880 9666-773377" },
    ],
    "services": [
      { id: 1, initials: "SH", color: "from-blue-600 to-indigo-700", name: "Sheba.xyz Verified Home Solutions", type: "Home Services Hub", desc: "Background-checked master technicians for home AC repair, plumbing, electrical rewiring, and appliance care.", tags: ["Verified Expert","7 Day Warranty","AC Repair","Plumbing"], rating: 4.8, reviews: 4120, verified: true, pro: true, languages: ["Bengali","English"], lat: 23.7915, lng: 90.4075, address: "Gulshan 1 Circle, Dhaka", phone: "+880 9638-888000" },
      { id: 2, initials: "FS", color: "from-emerald-500 to-teal-600", name: "FastFix Electric & AC Servicing Center", type: "AC & Electrician", desc: "Emergency 24-hour inverter AC gas recharge, compressor overhaul, and short-circuit repair.", tags: ["24/7 Callout","Inverter AC","Short Circuit"], rating: 4.7, reviews: 1890, verified: true, pro: false, languages: ["Bengali"], lat: 23.7460, lng: 90.3750, address: "Satmasjid Road, Dhanmondi, Dhaka", phone: "+880 1711-445566" },
    ],
    "translate": [
      { id: 1, initials: "GT", color: "from-purple-600 to-indigo-700", name: "Govt Notary Public & Certified Translation", type: "Certified Legal Translation", desc: "Notarized and certified translations of NID, Academic Transcripts, Nikahnama & Birth Certificates for embassies.", tags: ["US Embassy Certified","UKVI Accepted","Notary Public","Nikahnama"], rating: 4.9, reviews: 3210, verified: true, pro: true, languages: ["Bengali","English","Arabic"], lat: 23.7310, lng: 90.4060, address: "Dhaka Bar Association, Judge Court Road, Dhaka", phone: "+880 1711-667788" },
      { id: 2, initials: "AL", color: "from-teal-500 to-cyan-600", name: "Alliance Française & German Translation Desk", type: "European Language Hub", desc: "Embassy accredited certified translation for French, German, and Italian visa files.", tags: ["Embassy Accredited","Schengen Visa","Certified"], rating: 4.8, reviews: 1540, verified: true, pro: false, languages: ["French","German","Bengali","English"], lat: 23.7420, lng: 90.3840, address: "Mirpur Road, Dhanmondi, Dhaka", phone: "+880 2-9675249" },
    ]
  };

  const defaults: Provider[] = [
    { id: 1, initials: "BC", color: "from-blue-500 to-indigo-600", name: "Dhaka Central Community Service Hub", type: "Service Provider", desc: "Verified community service provider operating in Dhaka. Transparent pricing, expert staff, and high satisfaction rating.", tags: ["Verified","Dhaka Center","Prompt Service"], rating: 4.8, reviews: 1203, verified: true, pro: true, languages: ["Bengali","English"], lat: 23.7808, lng: 90.4150, address: "Gulshan Avenue, Dhaka", phone: "+880 1711-001122" },
    { id: 2, initials: "DH", color: "from-emerald-500 to-teal-600", name: "Dhanmondi Professional Center", type: "Service Hub", desc: "Reliable local business serving Dhaka residents with high-standard customer service and satisfaction guarantees.", tags: ["Dhanmondi","Reliable","Affordable"], rating: 4.7, reviews: 876, verified: true, pro: false, languages: ["Bengali","English"], lat: 23.7465, lng: 90.3760, address: "Road 27, Dhanmondi, Dhaka", phone: "+880 1711-002233" },
    { id: 3, initials: "UT", color: "from-violet-400 to-purple-500", name: "Uttara North Community Network", type: "Service Agency", desc: "Connecting city residents with trusted, background-checked local service professionals and certified assistance.", tags: ["Uttara","Trusted","Verified"], rating: 4.6, reviews: 543, verified: true, pro: true, languages: ["Bengali","English"], lat: 23.8720, lng: 90.3980, address: "Sector 3, Uttara, Dhaka", phone: "+880 1711-003344" },
  ];

  const key = Object.keys(base).find(k => serviceId?.includes(k));
  return key ? base[key] : defaults;
}

// ─── Community Posts ───────────────────────────────────────────────────────────

type Post = { id: number; author: string; handle: string; avatar: string; color: string; verified: boolean; time: string; content: string; likes: number; comments: number; reposts: number; type: string };

function getPosts(serviceId: string): Post[] {
  return [
    { id: 1, author: "Tanvir Ahmed", handle: "@tanvir_dhaka", avatar: "TA", color: "from-emerald-400 to-teal-500", verified: true, time: "1h ago", type: "tip", content: "💡 TIP: When taking Metro Rail or booking community services in Dhaka, make sure to check the BariKoi live map location to avoid street congestion and save time! 🙏", likes: 342, comments: 28, reposts: 112 },
    { id: 2, author: "Farhana Yasmin", handle: "@farhana_bd", avatar: "FY", color: "from-blue-400 to-indigo-500", verified: false, time: "3h ago", type: "question", content: "🙋 Has anyone visited this center recently? The real BariKoi map shows it's right by the main avenue. Looking for recommendations for family visits.", likes: 89, comments: 45, reposts: 14 },
    { id: 3, author: "Rahim Chowdhury", handle: "@rahim_c", avatar: "RC", color: "from-violet-400 to-purple-500", verified: true, time: "5h ago", type: "regular", content: "Great experience using the interactive BariKoi map! The live directions and pin locations matched the exact house and road numbers in Dhaka. ✅", likes: 521, comments: 62, reposts: 189 }
  ];
}

// ─── Main Component: ServiceDetail ─────────────────────────────────────────────

export function ServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { countryCode } = useCountryPlatform();

  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [viewMode, setViewMode] = useState<"split" | "map" | "cards">("split");

  const id = serviceId ?? "services";
  const meta = serviceMeta[id] ?? {
    label: id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    emoji: "🔧",
    color: "#2563eb",
    bg: "#eff6ff",
    heroDesc: "Find trusted verified providers in Dhaka, Bangladesh",
    ctaLabel: "Contact Provider",
  };

  const allProviders = getProviders(id);
  const providers = allProviders.filter(p =>
    search === "" ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.desc.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  // Map Container & Instance
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Default center coordinates (Dhaka)
  const defaultCoords: [number, number] = [23.8103, 90.4125];

  // Initialize BariKoi Map
  useEffect(() => {
    let isMounted = true;
    loadBkoiGL().then((bkoigl: any) => {
      if (!isMounted || !mapContainerRef.current) return;
      try {
        const key = BARIKOI_API_KEY;
        if (bkoigl) {
          bkoigl.accessToken = key;
          bkoigl.apiKey = key;
        }

        const mapStyle = getMapStyleForLocation(defaultCoords[0], defaultCoords[1], countryCode);
        const map = new bkoigl.Map({
          container: mapContainerRef.current,
          center: [defaultCoords[1], defaultCoords[0]], // [lng, lat]
          zoom: 12.8,
          maxZoom: 18,
          minZoom: 5,
          style: mapStyle,
          transformRequest: bariKoiTransformRequest,
          accessToken: key,
          apiKey: key,
          attributionControl: false
        });

        // Gracefully handle missing sprite images from style
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
          if (!isMounted) return;
          mapInstanceRef.current = map;
          updateMarkers(map, providers, null, bkoigl);
        });
      } catch (err) {
        console.warn("ServiceDetail map initialization error:", err);
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_) {}
      }
    };
  }, []);

  // Update Markers on Map
  const updateMarkers = useCallback((map: any, items: Provider[], activeItem: Provider | null, bkoiglInstance?: any) => {
    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bkoi = bkoiglInstance || (window as any).bkoigl;
    if (!bkoi || !map) return;

    items.forEach(item => {
      const isSelected = activeItem?.id === item.id;
      const el = document.createElement("div");
      el.className = "barikoi-service-marker";
      el.style.cursor = "pointer";
      el.innerHTML = `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;transition:transform 0.2s ease;">
          <div style="background:${isSelected ? '#9333ea' : meta.color};color:white;width:${isSelected ? 36 : 30}px;height:${isSelected ? 36 : 30}px;border-radius:50%;border:2px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;transform:${isSelected ? 'scale(1.15)' : 'scale(1)'};">
            ${item.initials}
          </div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid ${isSelected ? '#9333ea' : meta.color};margin-top:-1px;"></div>
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedProvider(item);
        map.flyTo({ center: [item.lng, item.lat], zoom: 14.5, speed: 1.2 });
      });

      const marker = new bkoi.Marker({ element: el })
        .setLngLat([item.lng, item.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [meta.color]);

  // Sync Markers when selected provider or providers change
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers(mapInstanceRef.current, providers, selectedProvider);
    }
  }, [providers, selectedProvider, updateMarkers]);

  // Center map on selected provider
  const handleSelectProvider = (p: Provider) => {
    setSelectedProvider(p);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({ center: [p.lng, p.lat], zoom: 14.8, speed: 1.2 });
    }
  };

  const posts = getPosts(id);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-12">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition flex-shrink-0"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 shadow-sm" style={{ background: meta.bg }}>
              {meta.emoji}
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-foreground truncate" style={{ fontFamily: "var(--font-display)" }}>
                {meta.label}
              </h1>
              <p className="text-xs text-muted-foreground truncate">{meta.heroDesc}</p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-secondary/80 p-0.5 rounded-xl text-xs font-semibold flex-shrink-0">
            <button
              onClick={() => { setViewMode("split"); setTimeout(() => mapInstanceRef.current?.resize(), 100); }}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${viewMode === "split" ? "bg-white text-primary shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => { setViewMode("map"); setTimeout(() => mapInstanceRef.current?.resize(), 100); }}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${viewMode === "map" ? "bg-white text-primary shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${viewMode === "cards" ? "bg-white text-primary shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>

        {/* Real Interactive BariKoi Map View (Live Vector Tiles) */}
        {viewMode !== "cards" && (
          <div className="px-4 pt-4">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-xs bg-slate-100">
              <div
                ref={mapContainerRef}
                className={`w-full transition-all duration-300 ${viewMode === "map" ? "h-[500px]" : "h-[260px] sm:h-[320px]"}`}
              />

              {/* BariKoi Live Badge */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-border/80 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>BariKoi Live Map · Dhaka</span>
              </div>

              {/* Reset Map Center */}
              <button
                onClick={() => {
                  setSelectedProvider(null);
                  mapInstanceRef.current?.flyTo({ center: [defaultCoords[1], defaultCoords[0]], zoom: 12.8 });
                }}
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-xl shadow-xs border border-border transition text-xs font-medium flex items-center gap-1"
                title="Reset View"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Selected Provider Floating Mini-Card */}
              {selectedProvider && (
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-border shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">{selectedProvider.name}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                      <span>{selectedProvider.address}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <a
                      href={`tel:${selectedProvider.phone}`}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1 hover:bg-emerald-100 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Call</span>
                    </a>
                    <button
                      onClick={() => handleSelectProvider(selectedProvider)}
                      className="px-2.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1 hover:opacity-90 transition"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Focus</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${meta.label.toLowerCase()} in Dhaka…`}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>
            <button className="px-3.5 py-2.5 bg-white border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary transition flex items-center gap-1.5">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Filter</span>
            </button>
          </div>

          {/* Provider Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              {providers.length} Verified Providers on Map
            </p>
            <span className="text-xs text-muted-foreground">Dhaka, Bangladesh</span>
          </div>

          {/* Provider Cards Grid */}
          {providers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-10 text-center">
              <div className="text-4xl mb-3">{meta.emoji}</div>
              <p className="font-semibold text-foreground mb-1">No verified providers found</p>
              <p className="text-sm text-muted-foreground">Try searching for a different keyword or location</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {providers.map(p => {
                const isSelected = selectedProvider?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProvider(p)}
                    className={`bg-white rounded-2xl border p-4 transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 shadow-md"
                        : "border-border hover:shadow-md hover:border-border/80"
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-xs`}>
                          {p.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-foreground">{p.name}</span>
                            {p.verified && (
                              <div className="flex items-center gap-0.5 bg-blue-50 text-primary px-1.5 py-0.5 rounded-full">
                                <BadgeCheck className="w-3 h-3" />
                                <span className="text-[10px] font-semibold">Verified</span>
                              </div>
                            )}
                            {p.pro && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">PRO</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{p.type}</div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{p.desc}</p>

                      {/* Location address */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="truncate">{p.address}</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {p.tags.map(t => (
                          <span key={t} className="text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1.5 mb-4">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.floor(p.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-foreground">{p.rating}</span>
                        <span className="text-xs text-muted-foreground">({p.reviews.toLocaleString()} reviews)</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-border/40" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleSelectProvider(p)}
                        className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition flex items-center justify-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>View on Map</span>
                      </button>
                      <a
                        href={`tel:${p.phone}`}
                        className="px-3 py-2 rounded-xl border border-border text-muted-foreground hover:text-emerald-600 hover:border-emerald-300 transition flex items-center justify-center"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Community Discussion Feed */}
          <div className="flex items-center gap-3 pt-6 pb-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-semibold text-muted-foreground px-2">Community Tips & Updates</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl border border-border p-4 hover:shadow-xs transition">
                <div className="flex gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${post.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{post.author}</span>
                      {post.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                      <span className="text-xs text-muted-foreground">{post.handle}</span>
                      <span className="text-xs text-muted-foreground">· {post.time}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
