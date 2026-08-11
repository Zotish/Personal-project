import React, { useState, type ElementType, type MouseEvent } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Briefcase, Home, GraduationCap, Heart, Building, Scale, Languages,
  BookOpen, ClipboardList, Users, Calendar, AlertTriangle, MapPin,
  ChevronRight, ExternalLink, Star, CheckCircle, FileText, Globe,
  ShoppingCart, Bus, Building2, ArrowRight, ShoppingBag, Car,
  Wrench, Cpu, Shirt, Armchair, Dumbbell, Plane, Leaf, Laptop,
  Store, Truck, KeyRound, BarChart2, LayoutGrid, Check, Film
} from "lucide-react";
import { addFavourite, isFavourited, removeFavourite } from "../utils/myBox";

const serviceCategories = [
  { id: "medical-courier",   icon: Truck,         label: "Medical Courier",    desc: "Medicine, prescription & report delivery",         color: "#0284c7", bg: "#e0f2fe", link: "/services/medical-courier",   featured: false },
  { id: "pharmacy",          icon: Heart,         label: "Pharmacy",           desc: "24h pharmacies, OTC, flu shots & refills",        color: "#10b981", bg: "#ecfdf5", link: "/services/pharmacy",          featured: false },
  { id: "money-exchange",    icon: BarChart2,     label: "Money Exchange",     desc: "Live exchange rates, bKash & remittances",         color: "#059669", bg: "#ecfdf5", link: "/services/money-exchange",    featured: false },
  { id: "used-furniture",    icon: Armchair,      label: "Used Furniture",     desc: "Beds, sofas, desks & free pickup options",        color: "#b45309", bg: "#fffbeb", link: "/services/used-furniture",    featured: false },
  { id: "home-kitchen",      icon: ShoppingCart,  label: "Home Kitchen",       desc: "Bangladeshi, Halal & Middle Eastern meal plans",   color: "#ea580c", bg: "#fff7ed", link: "/services/home-kitchen",      featured: false },
  { id: "free-medicine",     icon: Heart,         label: "Free Medicine",      desc: "Free & discounted prescription medicine aid",      color: "#e11d48", bg: "#ffe4e6", link: "/services/free-medicine",     featured: false },
  { id: "petrol",            icon: Car,           label: "Gas & Petrol",       desc: "Live gas prices, EV charging & 24h stations",     color: "#d97706", bg: "#fef3c7", link: "/services/petrol",            featured: false },
  { id: "scholarship",       icon: GraduationCap, label: "Scholarships",       desc: "Scholarships for STEM, ESL & immigrant students",  color: "#7c3aed", bg: "#f5f3ff", link: "/services/scholarship",       featured: false },
  { id: "admission",         icon: BookOpen,      label: "College Admission",  desc: "Universities, ESL & certification programs",       color: "#4f46e5", bg: "#e0e7ff", link: "/services/admission",         featured: false },
  { id: "jobs-agency",       icon: Briefcase,     label: "Newcomer Jobs",      desc: "Entry-level jobs, visa sponsorship & hiring",     color: "#2563eb", bg: "#eff6ff", link: "/services/jobs-agency",       featured: true  },
  { id: "movie-hall",        icon: Film,          label: "Movie Hall",         desc: "Cinemas, showtimes, Bengali & Desi movies",       color: "#db2777", bg: "#fce7f3", link: "/services/movie-hall",        featured: false },
  { id: "travel-agency",     icon: Plane,         label: "Flight Agency",      desc: "Bangladesh flights, Umrah & ticket deals",        color: "#0891b2", bg: "#cffafe", link: "/services/travel-agency",     featured: false },
  { id: "metro",             icon: Bus,           label: "Metro Transit",      desc: "Metro routes, live updates & fare calculator",    color: "#0284c7", bg: "#e0f2fe", link: "/services/metro",             featured: false },
  { id: "subway",            icon: MapPin,        label: "Subway Navigation",  desc: "Real-time arrivals, transfers & exit info",       color: "#475569", bg: "#f1f5f9", link: "/services/subway",            featured: false },
  { id: "community-hospital",icon: Heart,         label: "Community Hospital", desc: "Affordable healthcare, Medicaid & walk-in clinics", color: "#dc2626", bg: "#fee2e2", link: "/services/community-hospital",featured: false },
  { id: "social-services",   icon: Building,      label: "Social Services",    desc: "Food pantries, rental aid, SNAP & legal help",     color: "#059669", bg: "#d1fae5", link: "/services/social-services",   featured: true  },
  { id: "buy-sell",   icon: ShoppingBag,  label: "Buy & Sell",        desc: "Buy and sell goods in your community",             color: "#6366f1", bg: "#eef2ff", link: "/services/buy-sell",   featured: false },
  { id: "property",  icon: Building2,    label: "Property",           desc: "Apartments and rental resources for immigrants",   color: "#10b981", bg: "#ecfdf5", link: "/services/housing",    featured: false },
  { id: "cars",      icon: Car,          label: "Cars & Vehicles",    desc: "Buy, sell or rent cars and vehicles",              color: "#f97316", bg: "#fff7ed", link: "/services/cars",       featured: false },
  { id: "jobs",      icon: Briefcase,    label: "Jobs",               desc: "Immigrant-friendly job listings and career",       color: "#2563eb", bg: "#eff6ff", link: "/services/jobs",       featured: true  },
  { id: "services",  icon: Wrench,       label: "Services",           desc: "Local services: plumbing, cleaning, repairs",      color: "#0891b2", bg: "#ecfeff", link: "/services/local",      featured: false },
  { id: "electronics",icon: Cpu,         label: "Electronics",        desc: "Phones, laptops, and gadgets near you",            color: "#3b82f6", bg: "#eff6ff", link: "/services/electronics",featured: false },
  { id: "fashion",   icon: Shirt,        label: "Fashion",            desc: "Clothes, shoes, and accessories for all cultures", color: "#ec4899", bg: "#fdf2f8", link: "/services/fashion",    featured: false },
  { id: "furniture", icon: Armchair,     label: "Furniture",          desc: "Affordable furniture for your new home",           color: "#b45309", bg: "#fffbeb", link: "/services/furniture",  featured: false },
  { id: "food",      icon: ShoppingCart, label: "Food & Dining",      desc: "Halal, ethnic restaurants and grocery stores",     color: "#f59e0b", bg: "#fffbeb", link: "/services/food",       featured: false },
  { id: "health",    icon: Dumbbell,     label: "Health & Fitness",   desc: "Gyms, clinics, and wellness centers near you",     color: "#ef4444", bg: "#fef2f2", link: "/services/hospitals",  featured: false },
  { id: "schools",   icon: GraduationCap,label: "Education",          desc: "Public schools, colleges, and ESL programs",       color: "#8b5cf6", bg: "#f5f3ff", link: "/services/schools",    featured: false },
  { id: "travel",    icon: Plane,        label: "Travel",             desc: "Flights, visa services, and travel tips",          color: "#06b6d4", bg: "#ecfeff", link: "/services/travel",     featured: false },
  { id: "events",    icon: Calendar,     label: "Events",             desc: "Community events, meetups, and cultural festivals",color: "#7c3aed", bg: "#f5f3ff", link: "/explore",             featured: false },
  { id: "garden",    icon: Leaf,         label: "Garden & Outdoor",   desc: "Plants, gardening tools, and outdoor supplies",    color: "#16a34a", bg: "#f0fdf4", link: "/services/garden",     featured: false },
  { id: "freelancers",icon: Laptop,      label: "Freelancers",        desc: "Hire or offer freelance skills in your community", color: "#6366f1", bg: "#eef2ff", link: "/services/freelancers",featured: false },
  { id: "local-shops",icon: Store,       label: "Local Shops",        desc: "Small immigrant-owned shops near you",             color: "#d97706", bg: "#fffbeb", link: "/services/shops",      featured: false },
  { id: "moving",    icon: Truck,        label: "Moving Services",    desc: "Affordable movers and relocation help",            color: "#64748b", bg: "#f8fafc", link: "/services/moving",     featured: false },
  { id: "rentals",   icon: KeyRound,     label: "Rentals",            desc: "Furniture, car, and equipment rentals",            color: "#0891b2", bg: "#ecfeff", link: "/services/rentals",    featured: false },
  { id: "business",  icon: BarChart2,    label: "Business Services",  desc: "LLC setup, accounting, and business support",      color: "#2563eb", bg: "#eff6ff", link: "/services/business",   featured: false },
  { id: "community", icon: Users,        label: "Community",          desc: "Get advice from experienced immigrants",           color: "#10b981", bg: "#ecfdf5", link: "/qa",                  featured: false },
  { id: "legal",     icon: Scale,        label: "Legal Help",         desc: "Free and low-cost immigration legal aid",          color: "#0891b2", bg: "#ecfeff", link: "/services/legal",      featured: true  },
  { id: "religious", icon: Building,     label: "Religious Places",   desc: "Mosques, temples, churches near your area",        color: "#f97316", bg: "#fff7ed", link: "/services/religious",  featured: false },
  { id: "hospitals", icon: Heart,        label: "Find Hospitals",     desc: "Clinics and hospitals with multilingual staff",    color: "#ef4444", bg: "#fef2f2", link: "/services/hospitals",  featured: false },
  { id: "translate", icon: Languages,    label: "Translate Docs",     desc: "Certified document translation services",          color: "#7c3aed", bg: "#f5f3ff", link: "/services/translate",  featured: false },
  { id: "english",   icon: BookOpen,     label: "Learn English",      desc: "Free ESL classes and language resources",          color: "#0d9488", bg: "#f0fdfa", link: "/services/english",    featured: false },
  { id: "checklist", icon: ClipboardList,label: "Doc Checklist",      desc: "Personalized checklist for your visa type",        color: "#dc2626", bg: "#fef2f2", link: "/services/checklist",  featured: true  },
  { id: "emergency", icon: AlertTriangle,label: "Emergency Help",     desc: "Immediate help for urgent situations",             color: "#ef4444", bg: "#fef2f2", link: "/emergency",           featured: true  },
];

const thirdPartyServices = [
  { name: "USCIS Case Status", desc: "Track your immigration application", icon: "🏛️", category: "Government", external: true },
  { name: "BLS Job Search", desc: "Bureau of Labor Statistics job listings", icon: "💼", category: "Jobs", external: true },
  { name: "HUD Housing", desc: "US Dept of Housing assistance programs", icon: "🏠", category: "Housing", external: true },
  { name: "Google Translate", desc: "Translate text in 100+ languages", icon: "🌐", category: "Tools", external: false },
  { name: "Zillow Rentals", desc: "Find apartments and rental homes", icon: "🔑", category: "Housing", external: false },
  { name: "Indeed Jobs", desc: "Job search with 200M+ listings", icon: "🔍", category: "Jobs", external: false },
  { name: "Duolingo", desc: "Learn English free with daily lessons", icon: "📱", category: "Education", external: false },
  { name: "IRS Free File", desc: "File federal taxes for free", icon: "📋", category: "Government", external: true },
];

const quickChecklist = [
  { label: "Get a Social Security Number", done: true, priority: "high" },
  { label: "Open a bank account", done: true, priority: "high" },
  { label: "Get a state ID or driver's license", done: false, priority: "high" },
  { label: "Register children in school", done: false, priority: "medium" },
  { label: "Find a primary care doctor", done: false, priority: "medium" },
  { label: "File taxes (if working)", done: false, priority: "medium" },
  { label: "Join immigrant community groups", done: true, priority: "low" },
];

// ─── MyBox Service Card ───────────────────────────────────────────────────────

function ServiceCard({
  id, icon: Icon, label, desc, bg, color, link, emoji,
}: {
  id: string; icon: ElementType; label: string; desc: string;
  bg: string; color: string; link: string; emoji: string;
  key?: string | number;
}) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() => isFavourited(`svc-${id}`));
  const [flash, setFlash] = useState(false);

  const toggleMyBox = (e: MouseEvent) => {
    e.stopPropagation();
    const favId = `svc-${id}`;
    if (saved) {
      removeFavourite(favId);
      setSaved(false);
    } else {
      addFavourite({ id: favId, name: label, emoji, type: "service", path: link, subtitle: desc.split(" ").slice(0, 5).join(" ") + "…" });
      setSaved(true);
      setFlash(true);
      setTimeout(() => setFlash(false), 1200);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={() => navigate(link)}
        className="w-full flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-border hover:border-primary/40 hover:shadow-md transition-all text-center"
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: bg }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <span className="text-xs font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">{label}</span>
        <span className="text-[10px] text-muted-foreground leading-tight line-clamp-1">{desc.split(" ").slice(0, 3).join(" ")}…</span>
      </button>

      {/* MyBox pin button — top-right overlay */}
      <button
        onClick={toggleMyBox}
        title={saved ? "Remove from MyBox" : "Add to MyBox"}
        className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-all z-10 ${
          saved
            ? "bg-primary text-primary-foreground opacity-100"
            : "bg-white border border-border text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-secondary hover:text-primary"
        } ${flash ? "scale-125" : "scale-100"}`}
      >
        {saved ? <Check className="w-3 h-3" /> : <LayoutGrid className="w-3 h-3" />}
      </button>

      {/* Flash toast */}
      {flash && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-medium px-2 py-1 rounded-lg whitespace-nowrap shadow-lg z-10 animate-in fade-in slide-in-from-bottom-1 duration-150">
          Added to MyBox ✓
        </div>
      )}
    </div>
  );
}

// ─── Service emoji map ────────────────────────────────────────────────────────

const serviceEmojis: Record<string, string> = {
  "buy-sell": "🛍️", "property": "🏢", "cars": "🚗", "jobs": "💼",
  "services": "🔧", "electronics": "💻", "fashion": "👗", "furniture": "🪑",
  "food": "🍛", "health": "🏋️", "schools": "🎓", "travel": "✈️",
  "events": "🎉", "garden": "🌿", "freelancers": "🧑‍💻", "local-shops": "🏪",
  "moving": "🚚", "rentals": "🔑", "business": "📊", "community": "👥",
  "legal": "⚖️", "religious": "🕌", "hospitals": "🏥", "translate": "🌐",
  "english": "📚", "checklist": "📋", "emergency": "🚨",
};

export function ServicesHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const featured = serviceCategories.filter(s => s.featured);
  const all = serviceCategories;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">

        <div className="p-4 space-y-6">

          {/* Seller SaaS Portal CTA Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-5 sm:p-6 shadow-lg border border-blue-500/20 relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-xs text-white uppercase tracking-wider">
                  🏪 Seller SaaS Marketplace
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold mt-2">Are you a Merchant or Reseller?</h3>
                <p className="text-xs text-blue-100 mt-1 max-w-md">
                  Manage products, stock, pricing, and orders like Amazon/Daraz. Your products will appear on Map & Marketplace.
                </p>
              </div>
              <button
                onClick={() => navigate("/seller-dashboard")}
                className="px-5 py-3 rounded-2xl bg-white text-blue-700 font-extrabold text-xs sm:text-sm hover:bg-blue-50 transition shadow-md whitespace-nowrap flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4" /> Open Seller SaaS Portal
              </button>
            </div>
          </div>

          {/* All Services — grid style like screenshot */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground">All Services</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {all.map(s => (
                <ServiceCard
                  key={s.id}
                  id={s.id}
                  icon={s.icon}
                  label={s.label}
                  desc={s.desc}
                  bg={s.bg}
                  color={s.color}
                  link={s.link}
                  emoji={serviceEmojis[s.id] || "📌"}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
