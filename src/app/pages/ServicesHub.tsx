import React, { useState, useEffect, type ElementType } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Scale, Briefcase, Home, Heart, BarChart2, Plane, ShoppingCart, GraduationCap,
  Languages, AlertTriangle, Store, Bus, Building2, FileText, Sparkles, Search,
  LayoutGrid, Truck, BookOpen, Car, Armchair, Film, Cpu, Shirt, Building,
  ShoppingBag, Leaf, Laptop, KeyRound, Users, Wrench, Award, ShieldCheck, Gift, MapPin, Map, Calendar,
  Tag, TrendingUp, ChevronUp, Landmark, Trophy, Ticket
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// ─── MASTER SERVICES DATA (ALL 42+ IMMIGRANT & COMMUNITY SERVICES) ─────────

type ServiceItem = {
  id: string;
  name: string;
  desc: string;
  icon: ElementType;
  link: string;
  category: "legal" | "jobs" | "housing" | "health" | "finance" | "travel" | "education" | "utility";
};

const allServices: ServiceItem[] = [
  // ─── PAGE 1 / USER SPECIFIED TOP PRIORITY (10 FOR WEB, FIRST 8 FOR MOBILE) ─────
  // Row 1:
  { id: "newcomer-jobs", name: "Jobs", desc: "Entry-level jobs, cash & authorized hiring", icon: Briefcase, link: "/services/jobs", category: "jobs" },
  { id: "housing-rentals", name: "Housing", desc: "Sublets, rooms & no-credit-check apartments", icon: Home, link: "/services/housing", category: "housing" },
  { id: "local-shops", name: "Grocery", desc: "Deshi grocery stores & halal meat shops", icon: Store, link: "/services/shops", category: "utility" },
  { id: "food-bank", name: "Free Food", desc: "Free food bank & community food pantries", icon: Gift, link: "/services/social-services", category: "health" },
  // Row 2:
  { id: "metro-transit", name: "Transit", desc: "MTA bus/subway maps, OMNY & live schedules", icon: Bus, link: "/services/subway", category: "travel" },
  { id: "esl-education", name: "Education", desc: "Free English classes, college admission & GED", icon: GraduationCap, link: "/services/english", category: "education" },
  { id: "religious", name: "Religion", desc: "Mosques, temples, churches near your area", icon: Building, link: "/services/religious", category: "utility" },
  { id: "high-commission", name: "High Commission", desc: "Embassy, Consulate, Passport & NID services", icon: Landmark, link: "/services/legal", category: "legal" },

  // ─── PAGE 2 (ITEMS 9–16 FOR MOBILE): USER FURNITURE, LEGAL AID, HALAL FOOD, FREE MEDICINE, REMITTANCE, FLIGHT, PHARMACY, HOSPITAL ─────
  // Page 2 Row 1:
  { id: "used-furniture", name: "Used Furniture", desc: "Beds, sofas, desks & free pickup options", icon: Armchair, link: "/services/used-furniture", category: "utility" },
  { id: "legal-aid", name: "Legal Aid", desc: "Free immigration lawyers, Work Permit & TPS aid", icon: Scale, link: "/services/legal", category: "legal" },
  { id: "halal-groceries", name: "Halal Food", desc: "Deshi fish, meat, spice stores & home delivery", icon: ShoppingCart, link: "/services/home-kitchen", category: "housing" },
  { id: "health-medicine", name: "Free Medicine", desc: "Medicaid, free prescription aid & clinics", icon: Heart, link: "/services/free-medicine", category: "health" },
  // Page 2 Row 2:
  { id: "remittance-exchange", name: "Remittance", desc: "Send money to Bangladesh, bKash & best rates", icon: BarChart2, link: "/services/money-exchange", category: "finance" },
  { id: "flight-tickets", name: "Flights", desc: "Dhaka flights, Umrah packages & visa help", icon: Plane, link: "/services/travel-agency", category: "travel" },
  { id: "pharmacy", name: "Pharmacy", desc: "24h pharmacies, OTC, flu shots & refills", icon: Heart, link: "/services/pharmacy", category: "health" },
  { id: "community-hospital", name: "Hospital", desc: "Affordable healthcare, Medicaid & walk-in clinics", icon: Building2, link: "/services/community-hospital", category: "health" },

  // ─── PAGE 3 AND SUBSEQUENT ────────────────────────────────────────────────
  { id: "doc-translation", name: "Translation", desc: "Certified NID, Passport & Certificate translation", icon: Languages, link: "/services/translate", category: "legal" },
  { id: "subway", name: "Subway", desc: "Real-time arrivals, transfers & exit info", icon: MapPin, link: "/services/subway", category: "travel" },

  // ─── TIER 3: SOCIAL AID, CARS, UTILITIES & EDUCATION ──────────────────────
  { id: "social-services", name: "Social Aid", desc: "Food pantries, rental aid, SNAP & legal help", icon: Building, link: "/services/social-services", category: "legal" },
  { id: "cars", name: "Cars & DMV", desc: "Buy, sell or rent cars and vehicles", icon: Car, link: "/services/cars", category: "utility" },
  { id: "petrol", name: "Gas & EV", desc: "Live gas prices, EV charging & 24h stations", icon: Car, link: "/services/petrol", category: "utility" },
  { id: "furniture", name: "Furniture", desc: "Affordable furniture for your new home", icon: Armchair, link: "/services/furniture", category: "utility" },
  { id: "electronics", name: "Electronics", desc: "Phones, laptops, and gadgets near you", icon: Cpu, link: "/services/electronics", category: "utility" },
  { id: "services", name: "Repairs", desc: "Local services: plumbing, cleaning, repairs", icon: Wrench, link: "/services/local", category: "utility" },
  { id: "scholarship", name: "Scholarships", desc: "Scholarships for STEM, ESL & immigrant students", icon: Award, link: "/services/scholarship", category: "education" },

  // ─── TIER 4: COMMUNITY & LIFESTYLE ─────────────────────────────────────────
  { id: "buy-sell", name: "Buy & Sell", desc: "Buy and sell goods in your community", icon: ShoppingBag, link: "/services/buy-sell", category: "utility" },
  { id: "rentals", name: "Rentals", desc: "Furniture, car, and equipment rentals", icon: KeyRound, link: "/services/rentals", category: "housing" },
  { id: "sports", name: "Sports", desc: "Cricket, soccer leagues, tournaments & local clubs", icon: Trophy, link: "/explore", category: "utility" },
  { id: "fashion", name: "Fashion", desc: "Clothes, shoes, and accessories for all cultures", icon: Shirt, link: "/services/fashion", category: "utility" },
  { id: "event-tickets", name: "Tickets", desc: "Concerts, events, movie & show tickets", icon: Ticket, link: "/services/movie-hall", category: "utility" },
];

// ─── FEATURED CATALOG DATA (DISCOUNTED, NEW ARRIVAL, POPULAR) ────────────────

// ─── FEATURED CATALOG DATA (DISCOUNTED, NEW ARRIVAL, POPULAR) ────────────────

type FeaturedProduct = {
  id: string;
  title: string;
  desc: string;
  tag: "discounted" | "new" | "popular";
  badge: string;
  image: string;
  price?: string;
  link: string;
};

const featuredProducts: FeaturedProduct[] = [
  // DISCOUNTED
  { 
    id: "d1", 
    title: "Flights to Dhaka", 
    desc: "$150 instant discount for newcomer families on all US-BD routes", 
    tag: "discounted", 
    badge: "15% OFF", 
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=80", 
    price: "$750", 
    link: "/services/travel-agency" 
  },
  { 
    id: "d2", 
    title: "Prescription Rx Medicine", 
    desc: "Free home delivery & Rx discount card for uninsured immigrants", 
    tag: "discounted", 
    badge: "FREE AID", 
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80", 
    price: "Free Aid", 
    link: "/services/free-medicine" 
  },
  { 
    id: "d3", 
    title: "Pre-owned Furniture Set", 
    desc: "Bed, mattress, desk & sofa bundle deal with free local pickup", 
    tag: "discounted", 
    badge: "SAVE 30%", 
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80", 
    price: "$120", 
    link: "/services/used-furniture" 
  },
  { 
    id: "d4", 
    title: "Immigrant SIM & Data Plan", 
    desc: "Unlimited 5G data plan with special bKash cash-back deal", 
    tag: "discounted", 
    badge: "20% OFF", 
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80", 
    price: "$25/mo", 
    link: "/services/electronics" 
  },
  { 
    id: "d5", 
    title: "Used Car & Vehicle Sales", 
    desc: "Clean title cars with easy financing & immigrant auto aid", 
    tag: "discounted", 
    badge: "$500 OFF", 
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop&q=80", 
    price: "$3,500", 
    link: "/services/cars" 
  },
  { 
    id: "d6", 
    title: "Halal Grocery Pack", 
    desc: "Fresh Deshi fish, meat & spice grocery box delivered home", 
    tag: "discounted", 
    badge: "15% OFF", 
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80", 
    price: "$49", 
    link: "/services/home-kitchen" 
  },
  { 
    id: "d7", 
    title: "Refurbished Tech Laptops", 
    desc: "Tested Core i7 laptops for ESL students & remote workers", 
    tag: "discounted", 
    badge: "40% OFF", 
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80", 
    price: "$199", 
    link: "/services/electronics" 
  },
  { 
    id: "d8", 
    title: "Winter Clothing Aid", 
    desc: "Brand new coats, boots & thermals for new immigrant families", 
    tag: "discounted", 
    badge: "50% OFF", 
    image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=500&auto=format&fit=crop&q=80", 
    price: "$15", 
    link: "/emergency" 
  },

  // NEW ARRIVAL
  { 
    id: "n1", 
    title: "AI Legal Doc Translator", 
    desc: "Instant certified NID, Passport & certificate translation", 
    tag: "new", 
    badge: "NEW AI", 
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500&auto=format&fit=crop&q=80", 
    price: "Instant", 
    link: "/services/translate" 
  },
  { 
    id: "n2", 
    title: "Medical Courier Express", 
    desc: "Same-day prescription & medical report door delivery", 
    tag: "new", 
    badge: "JUST IN", 
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80", 
    price: "$15", 
    link: "/services/medical-courier" 
  },
  { 
    id: "n3", 
    title: "STEM Scholarship 2026", 
    desc: "Full funding grant portal for international & ESL students", 
    tag: "new", 
    badge: "NEW 2026", 
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80", 
    price: "Grant", 
    link: "/services/scholarship" 
  },
  { 
    id: "n4", 
    title: "Deshi Kitchen Subscription", 
    desc: "Fresh homemade Bangladeshi daily meal delivery plan", 
    tag: "new", 
    badge: "NEW KITCHEN", 
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80", 
    price: "$85/wk", 
    link: "/services/home-kitchen" 
  },
  { 
    id: "n5", 
    title: "MTA Subway Live Assistant", 
    desc: "Real-time subway arrivals, transfers & exit guidance", 
    tag: "new", 
    badge: "NEW APP", 
    image: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500&auto=format&fit=crop&q=80", 
    price: "Free", 
    link: "/services/subway" 
  },
  { 
    id: "n6", 
    title: "Gas & EV Station Finder", 
    desc: "Live cheap petrol prices & EV charging stations near zip", 
    tag: "new", 
    badge: "JUST IN", 
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=80", 
    price: "Live", 
    link: "/services/petrol" 
  },
  { 
    id: "n7", 
    title: "USCIS Case Tracker 2.0", 
    desc: "Automated real-time SMS status updates for Green Card & EAD", 
    tag: "new", 
    badge: "NEW V2.0", 
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=80", 
    price: "Free", 
    link: "/services/checklist" 
  },
  { 
    id: "n8", 
    title: "Community Moving Aid", 
    desc: "Vetted newcomer movers & van rentals across NY/NJ/TX", 
    tag: "new", 
    badge: "JUST IN", 
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=80", 
    price: "$40/hr", 
    link: "/services/moving" 
  },

  // POPULAR (TOP PRODUCT)
  { 
    id: "p1", 
    title: "Asylum & Free Legal Aid", 
    desc: "Free pro-bono immigration attorney consultation & TPS aid", 
    tag: "popular", 
    badge: "TOP #1", 
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80", 
    price: "Pro-Bono", 
    link: "/services/legal" 
  },
  { 
    id: "p2", 
    title: "Newcomer Cash Jobs", 
    desc: "No-experience restaurant, retail & warehouse entry hiring", 
    tag: "popular", 
    badge: "HOT JOB", 
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=500&auto=format&fit=crop&q=80", 
    price: "$18-$25/hr", 
    link: "/services/jobs" 
  },
  { 
    id: "p3", 
    title: "Queens & Brooklyn Sublets", 
    desc: "No SSN or credit check required rooms & apartments", 
    tag: "popular", 
    badge: "POPULAR", 
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format&fit=crop&q=80", 
    price: "$650/mo", 
    link: "/services/housing" 
  },
  { 
    id: "p4", 
    title: "bKash Instant Remittance", 
    desc: "Send money to Bangladesh instantly with best live rate", 
    tag: "popular", 
    badge: "TOP RATE", 
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80", 
    price: "Best Rate", 
    link: "/services/money-exchange" 
  },
  { 
    id: "p5", 
    title: "24h Urgent Pharmacy Finder", 
    desc: "Medicaid OTC items, flu shots & 24/7 neighborhood clinics", 
    tag: "popular", 
    badge: "MOST USED", 
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=500&auto=format&fit=crop&q=80", 
    price: "24/7", 
    link: "/services/pharmacy" 
  },
  { 
    id: "p6", 
    title: "ESL & GED Free Classes", 
    desc: "Public school & college adult English learning programs", 
    tag: "popular", 
    badge: "FREE AID", 
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&auto=format&fit=crop&q=80", 
    price: "Free Aid", 
    link: "/services/english" 
  },
  { 
    id: "p7", 
    title: "Immigrant Business LLC", 
    desc: "Fast LLC formation, EIN & tax setup for small businesses", 
    tag: "popular", 
    badge: "TOP BIZ", 
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80", 
    price: "$99", 
    link: "/services/business" 
  },
  { 
    id: "p8", 
    title: "Emergency Food Pantries", 
    desc: "Free food bank, halal groceries & community kitchens", 
    tag: "popular", 
    badge: "24/7 AID", 
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&auto=format&fit=crop&q=80", 
    price: "Free", 
    link: "/services/social-services" 
  },
];

export function ServicesHub() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [featuredTab, setFeaturedTab] = useState<"discounted" | "new" | "popular">("discounted");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredServices = allServices.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Responsive chunking: 8 items per page on Mobile (4 cols x 2 rows), 10 on Desktop (5 cols x 2 rows)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  const servicesScrollRef = React.useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleServicesScroll = () => {
    if (servicesScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = servicesScrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress(Math.min(Math.max(scrollLeft / maxScroll, 0), 1));
      }
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chunkSize = isMobile ? 8 : 10;
  const servicePages: ServiceItem[][] = [];
  for (let i = 0; i < filteredServices.length; i += chunkSize) {
    servicePages.push(filteredServices.slice(i, i + chunkSize));
  }

  // Filter products by active tab
  const activeTabProducts = featuredProducts.filter(prod => prod.tag === featuredTab);
  
  // Desktop pagination: 6 items per page (3 cols x 2 rows)
  const featuredChunkSize = 6;
  const featuredProductPages: FeaturedProduct[][] = [];
  for (let i = 0; i < activeTabProducts.length; i += featuredChunkSize) {
    featuredProductPages.push(activeTabProducts.slice(i, i + featuredChunkSize));
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4 pb-12 pt-3 sm:pt-5 px-1 sm:px-0">

        {/* QUICK SEARCH BAR + MAP LAUNCHER BUTTON */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search services"
              className="w-full pl-11 pr-4 py-3.5 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200/90 shadow-2xs focus:outline-none focus:border-[#C04A22] transition"
            />
          </div>

          <button
            onClick={() => navigate("/map")}
            className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-white border border-slate-200/90 text-slate-800 text-xs sm:text-sm shadow-2xs hover:bg-[#C04A22]/10 hover:border-[#C04A22]/40 hover:text-[#8C3015] transition whitespace-nowrap cursor-pointer active:scale-95"
            title="Open Live Map"
          >
            <Map className="w-4.5 h-4.5 text-[#C04A22]" />
            <span className="font-normal">Map</span>
          </button>
        </div>

        {/* 🌟 MASTER SERVICES SWIPE CAROUSEL (8 ITEMS ON MOBILE, 10 ON DESKTOP) */}
        <div className="bg-white rounded-3xl border border-border p-4 sm:p-6 shadow-2xs">

          <div
            ref={servicesScrollRef}
            onScroll={handleServicesScroll}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory pt-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {servicePages.map((pageItems, pageIdx) => (
              <div
                key={pageIdx}
                className="w-full flex-shrink-0 grid grid-cols-4 sm:grid-cols-5 gap-y-4 gap-x-1 sm:gap-x-3 snap-center px-1"
              >
                {pageItems.map(service => {
                  const Icon = service.icon;
                  return (
                    <button
                      key={service.id}
                      onClick={() => navigate(service.link)}
                      className="group flex flex-col items-center text-center p-2 rounded-2xl hover:bg-[#C04A22]/10 transition-all duration-200 cursor-pointer active:scale-95"
                    >
                      {/* Clean Coral Vector Icon */}
                      <div className="p-1.5 sm:p-2 flex items-center justify-center transition-all duration-200 mb-1">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#C04A22] group-hover:text-[#8C3015] group-hover:scale-110 transition-all duration-200" />
                      </div>

                      {/* Short & Clear Name */}
                      <span className="text-[11px] sm:text-xs font-normal text-slate-900 group-hover:text-[#8C3015] leading-tight truncate w-full transition-colors">
                        {service.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Always Visible Ultra-Thin 2.5px Scroll Line */}
          {servicePages.length > 1 && (
            <div className="w-24 sm:w-32 mx-auto h-[2.5px] bg-slate-200/80 rounded-full overflow-hidden mt-3 relative">
              <div
                className="h-full bg-[#C04A22] rounded-full transition-all duration-75"
                style={{
                  width: `${100 / servicePages.length}%`,
                  transform: `translateX(${scrollProgress * (servicePages.length - 1) * 100}%)`,
                }}
              />
            </div>
          )}
        </div>

        {/* 🌟 FEATURED SERVICES & PRODUCTS CATALOG WITH INTERACTIVE FILTER TABS */}
        <div className="bg-white rounded-3xl border border-border p-4 sm:p-6 shadow-2xs space-y-4">
          
          {/* FILTER TABS HEADER (EQUAL DISTANCE 3 BUTTONS - NO ICONS) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full pb-3 border-b border-slate-100">
            {[
              { id: "discounted", label: "Discounted" },
              { id: "new", label: "New Arrival" },
              { id: "popular", label: "Popular" },
            ].map(tab => {
              const active = featuredTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFeaturedTab(tab.id as any)}
                  className={`w-full py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
                    active
                      ? "bg-[#C04A22]/15 text-[#8C3015] border border-[#C04A22]/40 shadow-2xs shadow-[#C04A22]/20"
                      : "bg-slate-100/80 text-slate-700 border border-transparent hover:bg-[#C04A22]/10 hover:text-[#8C3015]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* PRODUCT CARDS: MOBILE = 1 CARD PER ROW (VERTICAL LIST, NO HORIZONTAL SCROLL), DESKTOP = SWIPE CAROUSEL */}
          {isMobile ? (
            <div className="space-y-3.5 pt-1">
              {activeTabProducts.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => navigate(prod.link)}
                  className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md hover:border-[#C04A22]/40 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Photo Header with Badge Overlay */}
                    <div className="relative w-full h-36 overflow-hidden bg-slate-100">
                      <img
                        src={prod.image}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 right-2.5 text-[10px] font-extrabold text-[#8C3015] bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-2xs border border-[#C04A22]/20 whitespace-nowrap">
                        {prod.badge}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-3.5 space-y-1.5">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#8C3015] transition-colors leading-snug">
                        {prod.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {prod.desc}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 flex items-center justify-between mt-1">
                    <span className="text-xs font-extrabold text-[#8C3015] bg-[#C04A22]/10 px-2.5 py-0.5 rounded-lg whitespace-nowrap">
                      {prod.price}
                    </span>
                    <span className="text-xs font-semibold text-[#C04A22] group-hover:underline">
                      Explore →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto ultra-thin-scrollbar snap-x snap-mandatory pt-1 pb-5">
              {featuredProductPages.map((pageItems, pageIdx) => (
                <div
                  key={pageIdx}
                  className="w-full flex-shrink-0 grid grid-cols-3 gap-4 snap-center px-0.5 items-start"
                >
                  {pageItems.map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => navigate(prod.link)}
                      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md hover:border-[#C04A22]/40 transition-all cursor-pointer flex flex-col justify-between h-[285px]"
                    >
                      <div>
                        {/* Photo Header with Badge Overlay */}
                        <div className="relative w-full h-36 overflow-hidden bg-slate-100">
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2.5 right-2.5 text-[10px] font-extrabold text-[#8C3015] bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-2xs border border-[#C04A22]/20 whitespace-nowrap">
                            {prod.badge}
                          </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-3.5 space-y-1.5">
                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#8C3015] transition-colors leading-snug">
                            {prod.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {prod.desc}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 flex items-center justify-between mt-1">
                        <span className="text-[11px] font-extrabold text-[#8C3015] bg-[#C04A22]/10 px-2 py-0.5 rounded-lg whitespace-nowrap">
                          {prod.price}
                        </span>
                        <span className="text-xs font-semibold text-[#C04A22] group-hover:underline">
                          Explore →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 🌟 FLOATING BACK-TO-TOP UP ARROW BUTTON (Mobile only, hidden on desktop) */}
      {isMobile && showScrollTop && (
        <button
          onClick={scrollToTop}
          className="sm:hidden fixed bottom-20 right-4 z-50 p-2.5 rounded-full bg-[#C04A22] text-white shadow-xl hover:bg-[#8C3015] active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer border border-white/30"
          title="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </AppLayout>
  );
}
