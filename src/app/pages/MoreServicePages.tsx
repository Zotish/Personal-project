import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Search, MapPin, Star, Clock, ChevronLeft, Phone, Globe, CheckCircle,
  GraduationCap, Heart, Building, Navigation, Bookmark, Share2, MessageCircle,
  ExternalLink, Filter, Languages, DollarSign, Users, Calendar, ArrowRight
} from "lucide-react";

// ─── School / University Finder ────────────────────────────────────────────

const schools = [
  {
    id: 1, name: "Queens College – CUNY", type: "Public University", distance: "1.2 mi", rating: 4.3, reviews: 1820,
    open: true, address: "65-30 Kissena Blvd, Queens, NY 11367", phone: "+1 (718) 997-5000",
    languages: ["English", "Spanish", "Bengali", "Mandarin"], immigrantFriendly: true,
    programs: ["ESL", "Business", "Computer Science", "Nursing"], tuition: "$7,340/yr (in-state)",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=200&fit=crop",
    desc: "CUNY's Queens College serves one of the most diverse student populations in the nation. Free tuition available for qualifying low-income students."
  },
  {
    id: 2, name: "Jackson Heights Adult Learning Center", type: "ESL / Adult Ed", distance: "0.4 mi", rating: 4.8, reviews: 342,
    open: true, address: "37-11 80th St, Jackson Heights, NY 11372", phone: "+1 (718) 779-7700",
    languages: ["Bengali", "Spanish", "Hindi", "Nepali", "English"], immigrantFriendly: true,
    programs: ["ESL", "GED", "Citizenship Prep", "Digital Literacy"], tuition: "Free",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=200&fit=crop",
    desc: "Free ESL and adult education classes for immigrants. Evening and weekend sessions available."
  },
  {
    id: 3, name: "LaGuardia Community College", type: "Community College", distance: "2.8 mi", rating: 4.1, reviews: 2103,
    open: true, address: "31-10 Thomson Ave, Long Island City, NY 11101", phone: "+1 (718) 482-7200",
    languages: ["English", "Spanish", "Mandarin", "French"], immigrantFriendly: true,
    programs: ["Nursing", "Business", "Engineering", "Liberal Arts"], tuition: "$5,210/yr (in-state)",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=200&fit=crop",
    desc: "Affordable community college with strong immigrant support services, tutoring, and career counseling."
  },
  {
    id: 4, name: "PS 69 Elementary School", type: "Public Elementary", distance: "0.7 mi", rating: 4.0, reviews: 218,
    open: true, address: "5802 Ondaatje Ave, Maspeth, NY 11378", phone: "+1 (718) 894-5535",
    languages: ["English", "Spanish", "Bengali"], immigrantFriendly: true,
    programs: ["Bilingual Education", "ESL Support", "After School"], tuition: "Free",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop",
    desc: "Welcoming elementary school with bilingual teachers and strong parent community."
  },
];

const schoolCategories = [
  { id: "all", label: "All", emoji: "🏫" },
  { id: "university", label: "University", emoji: "🎓" },
  { id: "community", label: "Community College", emoji: "📚" },
  { id: "esl", label: "ESL / Adult Ed", emoji: "🔤" },
  { id: "elementary", label: "K-12", emoji: "✏️" },
];

export function SchoolFinder() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [savedIds, setSavedIds] = useState<number[]>([]);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="p-4 bg-white border-b border-border">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ChevronLeft className="w-4 h-4" />Back
          </button>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Find Schools & Colleges</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Public schools, colleges, ESL programs, and universities near you</p>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search schools, programs..." className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {schoolCategories.map(({ id, label }) => (
              <button key={id} onClick={() => setActiveCategory(id)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${activeCategory === id ? "bg-primary text-white shadow-sm" : "bg-white border border-border text-muted-foreground hover:text-primary"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {schools.map(school => (
            <div key={school.id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-all group cursor-pointer">
              <div className="relative h-36 bg-muted overflow-hidden">
                <img src={school.image} alt={school.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {school.immigrantFriendly && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />Immigrant-Friendly
                  </div>
                )}
                <button
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition"
                  onClick={e => { e.stopPropagation(); setSavedIds(s => s.includes(school.id) ? s.filter(x => x !== school.id) : [...s, school.id]); }}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${savedIds.includes(school.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                </button>
                <div className="absolute bottom-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg">{school.tuition}</div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="font-semibold text-foreground">{school.name}</h3>
                    <div className="text-xs text-muted-foreground">{school.type}</div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{school.rating}</span>
                    <span className="text-xs text-muted-foreground">({school.reviews})</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3" />{school.address} · {school.distance}
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{school.desc}</p>
                <div className="mb-2">
                  <div className="text-xs font-medium text-foreground mb-1">Programs</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {school.programs.map(p => <span key={p} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{p}</span>)}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="text-xs font-medium text-foreground mb-1">Languages</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {school.languages.map(l => <span key={l} className="text-xs bg-blue-50 text-primary px-2 py-0.5 rounded-full">{l}</span>)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition">
                    <Navigation className="w-3 h-3" />Get Directions
                  </button>
                  <button className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition">
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition">
                    <Globe className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Hospital / Clinic Finder ──────────────────────────────────────────────

const hospitals = [
  {
    id: 1, name: "Elmhurst Hospital Center", type: "Public Hospital", distance: "1.4 mi", rating: 4.2, reviews: 1204,
    open: true, openUntil: "24 hours", address: "79-01 Broadway, Elmhurst, NY 11373", phone: "+1 (718) 334-4000",
    languages: ["Spanish", "Bengali", "Mandarin", "Arabic", "Hindi", "English"], immigrantFriendly: true,
    specialties: ["Emergency", "Maternity", "Pediatrics", "Mental Health"],
    insurance: ["Medicaid", "Medicare", "Uninsured OK"], sliding: true,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=200&fit=crop",
    desc: "The most diverse hospital in New York. Free interpreter services in 150+ languages. Sliding scale fees for uninsured."
  },
  {
    id: 2, name: "Community Health Center – Jackson Heights", type: "Community Clinic", distance: "0.6 mi", rating: 4.6, reviews: 567,
    open: true, openUntil: "7:00 PM", address: "80-12 Northern Blvd, Jackson Heights, NY 11372", phone: "+1 (718) 699-2100",
    languages: ["Bengali", "Spanish", "Hindi", "Nepali", "English"], immigrantFriendly: true,
    specialties: ["Primary Care", "Women's Health", "Dental", "Mental Health"],
    insurance: ["Medicaid", "CHIP", "Sliding Scale", "Uninsured OK"], sliding: true,
    image: "https://images.unsplash.com/photo-1588776814546-1ffbb4b45c5b?w=400&h=200&fit=crop",
    desc: "Low-cost community health clinic serving immigrants. Appointments and walk-ins welcome. No insurance required."
  },
  {
    id: 3, name: "Mount Sinai Queens", type: "Private Hospital", distance: "3.2 mi", rating: 4.4, reviews: 892,
    open: true, openUntil: "24 hours", address: "25-10 30th Ave, Astoria, NY 11102", phone: "+1 (718) 267-4000",
    languages: ["English", "Spanish", "Greek", "Bengali"], immigrantFriendly: true,
    specialties: ["Cardiology", "Oncology", "Orthopedics", "Emergency"],
    insurance: ["All major insurance", "Medicaid", "Medicare"], sliding: false,
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=200&fit=crop",
    desc: "Full-service hospital with specialist care. Financial assistance available for uninsured patients."
  },
];

export function HospitalFinder() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="p-4 bg-white border-b border-border">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ChevronLeft className="w-4 h-4" />Back
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-red-500" />
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Find Hospitals & Clinics</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Multilingual healthcare for immigrants. Many offer sliding scale fees and free interpreter services.</p>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search hospitals, clinics, specialties..." className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[{ id: "all", label: "All", e: "🏥" }, { id: "hospital", label: "Hospital", e: "🏨" }, { id: "clinic", label: "Clinic", e: "🩺" }, { id: "uninsured", label: "No Insurance OK", e: "💚" }, { id: "sliding", label: "Sliding Scale", e: "💲" }].map(({ id, label, e }) => (
              <button key={id} onClick={() => setFilter(id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${filter === id ? "bg-primary text-white" : "bg-white border border-border text-muted-foreground hover:text-primary"}`}>
                <span>{e}</span>{label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Emergency Banner */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🆘</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-red-700">Medical Emergency?</div>
              <div className="text-xs text-red-600">Call 911 immediately. Emergency services are required by law to treat all patients regardless of immigration status.</div>
            </div>
          </div>

          {hospitals.map(h => (
            <div key={h.id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-all group cursor-pointer">
              <div className="relative h-36 overflow-hidden">
                <img src={h.image} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {h.immigrantFriendly && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />Immigrant-Friendly
                  </div>
                )}
                <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${h.open ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                  <Clock className="w-3 h-3" />{h.open ? `Open · ${h.openUntil}` : "Closed"}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="font-semibold text-foreground">{h.name}</h3>
                    <div className="text-xs text-muted-foreground">{h.type} · {h.distance}</div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{h.rating}</span>
                    <span className="text-xs text-muted-foreground">({h.reviews})</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{h.desc}</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xs font-medium text-foreground mb-1">Specialties</div>
                    <div className="flex gap-1 flex-wrap">
                      {h.specialties.slice(0, 3).map(s => <span key={s} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-foreground mb-1">Insurance</div>
                    <div className="flex gap-1 flex-wrap">
                      {h.insurance.slice(0, 2).map(i => <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{i}</span>)}
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="text-xs font-medium text-foreground mb-1">Languages Available</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {h.languages.slice(0, 4).map(l => <span key={l} className="text-xs bg-blue-50 text-primary px-2 py-0.5 rounded-full">{l}</span>)}
                    {h.languages.length > 4 && <span className="text-xs text-muted-foreground">+{h.languages.length - 4} more</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition">
                    <Calendar className="w-3.5 h-3.5" />Book Appointment
                  </button>
                  <button className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition">
                    <Navigation className="w-3.5 h-3.5" />
                  </button>
                  <button className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition">
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Religious Institution Finder (Re-exported from Religion.tsx) ───────────
export { ReligiousFinder } from "./Religion";

// ─── Restaurant / Grocery Finder ───────────────────────────────────────────

const foodPlaces = [
  {
    id: 1, name: "Little Bangladesh Restaurant", type: "Bangladeshi Cuisine", category: "restaurant",
    distance: "0.5 mi", rating: 4.8, reviews: 612, open: true, openUntil: "10:30 PM",
    address: "73-20 37th Ave, Jackson Heights, NY", phone: "+1 (718) 335-1234",
    languages: ["Bengali", "English"], halal: true, price: "$$",
    emoji: "🍛", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=200&fit=crop",
    tags: ["Halal", "Dine-in", "Takeout", "Delivery"],
    desc: "Authentic Bangladeshi food — hilsa fish, biryani, bhuna, and more. Halal certified."
  },
  {
    id: 2, name: "Patel Brothers", type: "South Asian Grocery", category: "grocery",
    distance: "1.2 mi", rating: 4.6, reviews: 1834, open: true, openUntil: "9:00 PM",
    address: "42-92 Main St, Flushing, NY", phone: "+1 (718) 461-4888",
    languages: ["Hindi", "Gujarati", "Bengali", "English"], halal: false, price: "$",
    emoji: "🛒", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop",
    tags: ["South Asian Spices", "Fresh Produce", "Indian Snacks", "Bulk"],
    desc: "Largest South Asian grocery chain. Find all Indian, Pakistani, and Bangladeshi spices, lentils, and snacks."
  },
  {
    id: 3, name: "La Paloma Mexican Restaurant", type: "Mexican Cuisine", category: "restaurant",
    distance: "0.8 mi", rating: 4.5, reviews: 423, open: true, openUntil: "11:00 PM",
    address: "84-15 Northern Blvd, Jackson Heights, NY", phone: "+1 (718) 639-5000",
    languages: ["Spanish", "English"], halal: false, price: "$$",
    emoji: "🌮", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=200&fit=crop",
    tags: ["Authentic Mexican", "Dine-in", "Takeout", "Family-friendly"],
    desc: "Authentic Mexican restaurant with homemade tortillas and traditional recipes from Oaxaca."
  },
  {
    id: 4, name: "Halal Co. Supermarket", type: "Halal Grocery Store", category: "grocery",
    distance: "0.3 mi", rating: 4.7, reviews: 289, open: true, openUntil: "10:00 PM",
    address: "86-01 Parsons Blvd, Jamaica, NY", phone: "+1 (718) 739-0100",
    languages: ["Bengali", "Arabic", "Urdu", "English"], halal: true, price: "$",
    emoji: "🏪", image: "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?w=400&h=200&fit=crop",
    tags: ["Halal Certified", "Fresh Meat", "Exotic Vegetables", "Bengali Products"],
    desc: "Full-service halal supermarket with fresh halal meat, Bangladeshi imported goods, and South Asian produce."
  },
];

const foodCategories = [
  { id: "all", label: "All", emoji: "🍽️" },
  { id: "restaurant", label: "Restaurants", emoji: "🍛" },
  { id: "grocery", label: "Grocery", emoji: "🛒" },
  { id: "halal", label: "Halal", emoji: "☪️" },
  { id: "bangladeshi", label: "Bangladeshi", emoji: "🇧🇩" },
  { id: "indian", label: "Indian", emoji: "🇮🇳" },
  { id: "mexican", label: "Mexican", emoji: "🇲🇽" },
  { id: "chinese", label: "Chinese", emoji: "🇨🇳" },
];

export function RestaurantGroceryFinder() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="p-4 bg-white border-b border-border">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ChevronLeft className="w-4 h-4" />Back
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🍽️</span>
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Food & Grocery</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Find ethnic restaurants, halal food, and import grocery stores near you.</p>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search restaurants, grocery stores..." className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {foodCategories.map(({ id, label }) => (
              <button key={id} onClick={() => setActiveCategory(id)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${activeCategory === id ? "bg-primary text-white" : "bg-white border border-border text-muted-foreground hover:text-primary"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {foodPlaces.map(place => (
            <div key={place.id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-all cursor-pointer group">
              <div className="relative h-36 overflow-hidden">
                <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {place.halal && (
                  <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />Halal
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 text-foreground text-xs font-semibold px-2 py-1 rounded-full">
                  {place.price}
                </div>
                <div className={`absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${place.open ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                  <Clock className="w-3 h-3" />{place.open ? `Open · ${place.openUntil}` : "Closed"}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{place.emoji}</span>
                      <h3 className="font-semibold text-foreground">{place.name}</h3>
                    </div>
                    <div className="text-xs text-muted-foreground">{place.type}</div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{place.rating}</span>
                    <span className="text-xs text-muted-foreground">({place.reviews})</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3" />{place.address} · {place.distance}
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{place.desc}</p>
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {place.tags.map(t => <span key={t} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition">
                    <Navigation className="w-3 h-3" />Directions
                  </button>
                  <button className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition">
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition text-primary">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
