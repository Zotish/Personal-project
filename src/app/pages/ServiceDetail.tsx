import { useState, useRef, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  ChevronLeft, ChevronRight, Star, Heart, MessageCircle,
  Repeat2, Share2, Bookmark, ExternalLink,
  BadgeCheck, Zap, Users, HelpCircle, Filter,
  Search, Phone, Globe, LayoutGrid, Check
} from "lucide-react";
import { addFavourite, removeFavourite, isFavourited } from "../utils/myBox";

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
  "medical-courier":   { label: "Medical Courier Service",      emoji: "📦", color: "#0284c7", bg: "#e0f2fe", heroDesc: "Send & receive medicines, prescriptions, reports, cold-chain & emergency healthcare deliveries", ctaLabel: "Book Courier" },
  "pharmacy":          { label: "Pharmacy",                     emoji: "💊", color: "#10b981", bg: "#ecfdf5", heroDesc: "Locate nearby 24-hour pharmacies, OTC medicines, flu shots, refills & home delivery",             ctaLabel: "View Pharmacy" },
  "money-exchange":    { label: "Money Exchange",               emoji: "💱", color: "#059669", bg: "#ecfdf5", heroDesc: "Live exchange rates, fee comparison & international transfers (Bangladesh, bKash, cash pickup)", ctaLabel: "Compare Rates" },
  "used-furniture":    { label: "Used Furniture Marketplace",   emoji: "🛋️", color: "#b45309", bg: "#fffbeb", heroDesc: "Buy & sell affordable beds, sofas, desks & mattresses with free pickup & delivery options",    ctaLabel: "Browse Furniture" },
  "home-kitchen":      { label: "Home Kitchen Food",            emoji: "🍲", color: "#ea580c", bg: "#fff7ed", heroDesc: "Homemade Bangladeshi, Halal, Indian & Middle Eastern meal plans & daily food delivery",           ctaLabel: "Order Meal" },
  "free-medicine":     { label: "Free & Discounted Medicine",   emoji: "🏥", color: "#e11d48", bg: "#ffe4e6", heroDesc: "Find nonprofits, charities & government clinics offering free or discounted prescription medicines",ctaLabel: "Check Eligibility" },
  "petrol":            { label: "Gas & Petrol Stations",        emoji: "⛽", color: "#d97706", bg: "#fef3c7", heroDesc: "Compare live gas prices (Regular, Premium, Diesel), EV charging, car wash & 24h stations",         ctaLabel: "Get Directions" },
  "scholarship":       { label: "Scholarships",                 emoji: "🎓", color: "#7c3aed", bg: "#f5f3ff", heroDesc: "Discover scholarships for immigrant students, STEM, ESL, undergrad, graduate & low-income programs",ctaLabel: "Apply Scholarship" },
  "admission":         { label: "School & College Admission",   emoji: "🏫", color: "#4f46e5", bg: "#e0e7ff", heroDesc: "Colleges, universities, vocational certification, ESL schools & international student support",    ctaLabel: "Apply Now" },
  "jobs-agency":       { label: "Newcomer Jobs Agency",         emoji: "🤝", color: "#2563eb", bg: "#eff6ff", heroDesc: "Entry-level employment, visa sponsorship filters, warehouse, retail & immediate hiring jobs",     ctaLabel: "Apply Job" },
  "movie-hall":        { label: "Movie Hall & Cinemas",         emoji: "🎬", color: "#db2777", bg: "#fce7f3", heroDesc: "Discover nearby cinemas showing Bengali, Hindi & English movies with IMAX & showtimes",             ctaLabel: "Book Ticket" },
  "travel-agency":     { label: "Travel & Flight Ticket Agency",emoji: "✈️", color: "#0891b2", bg: "#cffafe", heroDesc: "Bangladesh flights, USA domestic, group tickets, Umrah/Hajj packages & visa assistance",           ctaLabel: "Get Flight Quote" },
  "metro":             { label: "Metro Rail Transit",           emoji: "🚆", color: "#0284c7", bg: "#e0f2fe", heroDesc: "Metro navigation, live service alerts, fare calculator & route planner",                          ctaLabel: "Plan Route" },
  "subway":            { label: "Subway Navigation",            emoji: "🚇", color: "#475569", bg: "#f1f5f9", heroDesc: "Real-time subway arrivals, station maps, exit info, transfers & delay alerts",                     ctaLabel: "View Map" },
  "community-hospital":{ label: "Community Hospital",          emoji: "🩺", color: "#dc2626", bg: "#fee2e2", heroDesc: "Affordable healthcare, emergency, walk-in clinics, Medicaid accepted & multilingual doctors",      ctaLabel: "Book Visit" },
  "social-services":   { label: "Social & Government Services",  emoji: "🏛️", color: "#059669", bg: "#d1fae5", heroDesc: "Food pantries, SNAP/WIC benefits, rental assistance, free healthcare, legal aid & disaster relief",ctaLabel: "Access Service" },
  "buy-sell":    { label: "Buy & Sell",       emoji: "🛍️", color: "#6366f1", bg: "#eef2ff", heroDesc: "Find great deals from your immigrant community",        ctaLabel: "View Listing"    },
  "property":    { label: "Property",         emoji: "🏢", color: "#10b981", bg: "#ecfdf5", heroDesc: "ITIN-friendly housing and rental resources",             ctaLabel: "View Property"   },
  "cars":        { label: "Cars & Vehicles",  emoji: "🚗", color: "#f97316", bg: "#fff7ed", heroDesc: "Buy, sell, or rent vehicles near you",                  ctaLabel: "See Vehicles"    },
  "jobs":        { label: "Jobs",             emoji: "💼", color: "#2563eb", bg: "#eff6ff", heroDesc: "Immigrant-friendly employers and career resources",      ctaLabel: "Find Jobs"       },
  "services":    { label: "Services",         emoji: "🔧", color: "#0891b2", bg: "#ecfeff", heroDesc: "Trusted local service providers in your area",           ctaLabel: "Hire Now"        },
  "electronics": { label: "Electronics",      emoji: "💻", color: "#3b82f6", bg: "#eff6ff", heroDesc: "Phones, laptops, and gadgets at great prices",           ctaLabel: "Browse Items"    },
  "fashion":     { label: "Fashion",          emoji: "👗", color: "#ec4899", bg: "#fdf2f8", heroDesc: "Clothing and accessories for every culture and style",   ctaLabel: "Shop Now"        },
  "furniture":   { label: "Furniture",        emoji: "🪑", color: "#b45309", bg: "#fffbeb", heroDesc: "Affordable furniture for your new home",                 ctaLabel: "Browse Furniture"},
  "food":        { label: "Food & Dining",    emoji: "🍛", color: "#f59e0b", bg: "#fffbeb", heroDesc: "Halal, ethnic, and international food near you",         ctaLabel: "Order / Visit"   },
  "health":      { label: "Health & Fitness", emoji: "🏋️", color: "#ef4444", bg: "#fef2f2", heroDesc: "Gyms, clinics, and wellness centers near you",           ctaLabel: "Book Now"        },
  "schools":     { label: "Education",        emoji: "🎓", color: "#8b5cf6", bg: "#f5f3ff", heroDesc: "Schools, colleges, and ESL programs near you",           ctaLabel: "Enroll Now"      },
  "travel":      { label: "Travel",           emoji: "✈️", color: "#06b6d4", bg: "#ecfeff", heroDesc: "Flights, visa services, and travel tips for immigrants", ctaLabel: "Book Trip"       },
  "garden":      { label: "Garden & Outdoor", emoji: "🌿", color: "#16a34a", bg: "#f0fdf4", heroDesc: "Plants, tools, and outdoor supplies near you",           ctaLabel: "Browse Items"    },
  "freelancers": { label: "Freelancers",      emoji: "🧑‍💻", color: "#6366f1", bg: "#eef2ff", heroDesc: "Hire skilled immigrant freelancers or offer your skills",ctaLabel: "Hire / Apply"   },
  "local-shops": { label: "Local Shops",      emoji: "🏪", color: "#d97706", bg: "#fffbeb", heroDesc: "Discover immigrant-owned local businesses near you",     ctaLabel: "Visit Shop"      },
  "moving":      { label: "Moving Services",  emoji: "🚚", color: "#64748b", bg: "#f8fafc", heroDesc: "Affordable movers and relocation help for immigrants",   ctaLabel: "Get Quote"       },
  "rentals":     { label: "Rentals",          emoji: "🔑", color: "#0891b2", bg: "#ecfeff", heroDesc: "Furniture, car, and equipment rentals near you",         ctaLabel: "Rent Now"        },
  "business":    { label: "Business Services",emoji: "📊", color: "#2563eb", bg: "#eff6ff", heroDesc: "LLC setup, accounting, and support for immigrant entrepreneurs", ctaLabel: "Get Started" },
  "legal":       { label: "Legal Help",       emoji: "⚖️", color: "#0891b2", bg: "#ecfeff", heroDesc: "Free and low-cost immigration legal aid near you",       ctaLabel: "Contact Now"     },
  "hospitals":   { label: "Find Hospitals",   emoji: "🏥", color: "#ef4444", bg: "#fef2f2", heroDesc: "Clinics and hospitals with multilingual staff",           ctaLabel: "Book Appointment"},
  "religious":   { label: "Religious Places", emoji: "🕌", color: "#f97316", bg: "#fff7ed", heroDesc: "Mosques, temples, churches near your area",              ctaLabel: "Get Directions"  },
  "translate":   { label: "Translate Docs",   emoji: "🌐", color: "#7c3aed", bg: "#f5f3ff", heroDesc: "Certified document translation services",                ctaLabel: "Get Quote"       },
  "english":     { label: "Learn English",    emoji: "📚", color: "#0d9488", bg: "#f0fdfa", heroDesc: "Free ESL classes and language learning resources",       ctaLabel: "Enroll Free"     },
  "checklist":   { label: "Doc Checklist",    emoji: "📋", color: "#dc2626", bg: "#fef2f2", heroDesc: "Personalized document checklist for your visa type",     ctaLabel: "Start Checklist" },
  "shopping":    { label: "Shopping",         emoji: "🛒", color: "#f59e0b", bg: "#fffbeb", heroDesc: "Great deals from stores near you",                       ctaLabel: "Shop Now"        },
};

// ─── Provider data generator ───────────────────────────────────────────────────

type Provider = {
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
};

function getProviders(serviceId: string): Provider[] {
  const base: Record<string, Provider[]> = {
    "medical-courier": [
      { id: 1, initials: "RX", color: "from-sky-500 to-blue-600", name: "RxExpress NYC Medical Courier", type: "Medical Delivery", desc: "Same-day medicine, prescription pickup, cold-chain transport, and hospital report delivery across NYC.", tags: ["Medical","Same-day","Cold-chain","Prescription Pickup"], rating: 4.9, reviews: 1420, verified: true, pro: true, languages: ["English","Bengali","Spanish"] },
      { id: 2, initials: "MT", color: "from-teal-500 to-emerald-600", name: "MediTrans Emergency Delivery", type: "Urgent Courier", desc: "Emergency medical equipment and urgent report pickup from clinics and pharmacies 24/7.", tags: ["Medical","Emergency 24/7","Hospital Pickup"], rating: 4.8, reviews: 890, verified: true, pro: false, languages: ["English","Spanish","Arabic"] },
      { id: 3, initials: "CF", color: "from-indigo-400 to-purple-500", name: "CareFlow Scheduled Courier", type: "Healthcare Delivery", desc: "Scheduled medicine delivery for senior immigrants and chronic illness patients with live tracking.", tags: ["Medical","Scheduled","Tracking","Sliding Fee"], rating: 4.7, reviews: 630, verified: true, pro: false, languages: ["English","Bengali","Hindi"] },
    ],
    "pharmacy": [
      { id: 1, initials: "QP", color: "from-emerald-500 to-teal-600", name: "Queens 24/7 Community Pharmacy", type: "Retail & Rx Pharmacy", desc: "Open 24 hours. Prescription refills, generic alternatives, OTC medicines, flu shots, and home delivery.", tags: ["Pharmacy","Open 24h","Flu Shots","Insurance Accepted"], rating: 4.9, reviews: 2150, verified: true, pro: true, languages: ["Bengali","Spanish","English","Hindi"] },
      { id: 2, initials: "MR", color: "from-blue-500 to-cyan-600", name: "MetroRx Discount Pharmacy", type: "Discount Pharmacy", desc: "Low-cost generic medicines, refill reminders, OTC healthcare items, and free local home delivery.", tags: ["Pharmacy","Generic Alt","Home Delivery","EBT Accepted"], rating: 4.7, reviews: 1240, verified: true, pro: false, languages: ["English","Spanish","Urdu"] },
      { id: 3, initials: "HF", color: "from-rose-400 to-red-500", name: "HealthFirst Care Pharmacy", type: "Rx & Vaccine Center", desc: "Vaccinations, online prescription ordering, side effect consultations, and Medicaid acceptance.", tags: ["Pharmacy","Vaccines","Medicaid","Online Order"], rating: 4.8, reviews: 980, verified: true, pro: false, languages: ["English","Mandarin","Bengali"] },
    ],
    "money-exchange": [
      { id: 1, initials: "BE", color: "from-emerald-600 to-teal-700", name: "Bangladesh Express Remittance", type: "Money Exchange", desc: "Best exchange rates today (1 USD = 119.5 BDT). Direct transfer to bKash, Nagad, and bank accounts instantly.", tags: ["Money Exchange","Best Rate Today","bKash","0 Fee First Transfer"], rating: 4.9, reviews: 3410, verified: true, pro: true, languages: ["Bengali","English","Hindi"] },
      { id: 2, initials: "GD", color: "from-amber-500 to-orange-600", name: "Global Desi Remittance & Cash", type: "Exchange Center", desc: "Fastest transfer (5 minutes). Cash pickup at thousands of locations across Bangladesh and South Asia.", tags: ["Money Exchange","Fastest Transfer","Cash Pickup","Fee Comparison"], rating: 4.8, reviews: 2890, verified: true, pro: false, languages: ["Bengali","Urdu","Hindi","English"] },
      { id: 3, initials: "AC", color: "from-blue-500 to-indigo-600", name: "Americas Currency Exchange", type: "Currency Exchange", desc: "Live exchange rates, foreign currency conversion, low fees, and ITIN customer support.", tags: ["Money Exchange","Lowest Fee","Live Calculator","ITIN Friendly"], rating: 4.7, reviews: 1560, verified: true, pro: true, languages: ["English","Spanish","Bengali"] },
    ],
    "used-furniture": [
      { id: 1, initials: "NF", color: "from-amber-600 to-yellow-600", name: "Newcomer Furniture Hub", type: "Used Furniture Store", desc: "Clean beds, mattresses, sofas, and dining sets for new arrivals. Free local pickup and affordable delivery.", tags: ["Furniture","Bed & Mattress","Free Pickup","Delivery Available"], rating: 4.8, reviews: 1120, verified: true, pro: true, languages: ["Bengali","English","Spanish"] },
      { id: 2, initials: "DH", color: "from-orange-500 to-red-500", name: "Desi Home Furniture Bazaar", type: "Furniture Marketplace", desc: "Desk, TV stands, office & baby furniture. Price negotiation accepted with direct chat seller features.", tags: ["Furniture","Price Negotiation","Verified Seller","Chat Seller"], rating: 4.7, reviews: 780, verified: true, pro: false, languages: ["English","Bengali","Hindi"] },
    ],
    "home-kitchen": [
      { id: 1, initials: "AK", color: "from-orange-500 to-amber-600", name: "Amma's Bangladeshi Home Kitchen", type: "Home Kitchen Food", desc: "Authentic homemade Bangladeshi Halal meals: Kacchi Biryani, Tehari, Fish Curry, and weekly meal plans.", tags: ["Home Kitchen","Bangladeshi","Halal Food","Weekly Meal Plans"], rating: 4.9, reviews: 1890, verified: true, pro: true, languages: ["Bengali","English"] },
      { id: 2, initials: "DF", color: "from-rose-500 to-pink-600", name: "Desi Flavors Homemade Snacks", type: "Homemade Catering", desc: "Fresh samosas, pitha, sweets, and Indian/Pakistani vegetarian/non-veg catering. Hygiene badge verified.", tags: ["Home Kitchen","Snacks","Hygiene Badge","Delivery Available"], rating: 4.8, reviews: 1340, verified: true, pro: false, languages: ["Bengali","Urdu","Hindi","English"] },
    ],
    "free-medicine": [
      { id: 1, initials: "FM", color: "from-rose-600 to-red-700", name: "NYC Health Free Medicine Program", type: "Nonprofit Aid", desc: "Free prescription medicines and insulin for low-income and uninsured immigrants. Eligibility check online.", tags: ["Free Medicine","Nonprofit","Low Income","No Insurance Needed"], rating: 4.9, reviews: 2450, verified: true, pro: false, languages: ["English","Bengali","Spanish","Mandarin"] },
      { id: 2, initials: "IR", color: "from-teal-500 to-emerald-600", name: "Islamic Relief Free Rx Clinic", type: "Charity Pharmacy", desc: "Free essential medicines, diabetes supplies, and blood pressure medication for community members.", tags: ["Free Medicine","Charity","Free Pickup","Required Docs Support"], rating: 4.8, reviews: 1670, verified: true, pro: false, languages: ["English","Arabic","Bengali","Urdu"] },
    ],
    "petrol": [
      { id: 1, initials: "JH", color: "from-amber-500 to-yellow-600", name: "Jackson Heights Gas & EV Station", type: "Fuel & EV Station", desc: "Current price comparison: Regular $3.39/gal, Premium $3.89/gal, Diesel $3.79/gal. EV fast charging & car wash.", tags: ["Petrol","Current Price Comparison","EV Charging","Car Wash","Open 24h"], rating: 4.7, reviews: 1980, verified: true, pro: false, languages: ["English","Bengali","Spanish"] },
      { id: 2, initials: "QF", color: "from-blue-500 to-cyan-600", name: "Queens Fuel & Convenience Express", type: "Fuel Station", desc: "Lowest price today on Regular & Diesel. Free air pump, 24/7 convenience store, and navigation integration.", tags: ["Petrol","Lowest Price Today","Air Pump","Convenience Store"], rating: 4.6, reviews: 1430, verified: true, pro: false, languages: ["English","Spanish","Hindi"] },
    ],
    "scholarship": [
      { id: 1, initials: "NI", color: "from-purple-600 to-indigo-700", name: "New Immigrant Future Scholarship", type: "Educational Grant", desc: "$5,000 annual scholarship for immigrant undergrad & grad students. STEM, ESL, and low-income categories.", tags: ["Scholarship","$5,000 Funding","Undergrad","STEM & ESL","Low Income"], rating: 4.9, reviews: 3120, verified: true, pro: true, languages: ["English","Bengali","Spanish"] },
      { id: 2, initials: "SD", color: "from-violet-500 to-purple-600", name: "South Asian Diaspora Student Fund", type: "Community Scholarship", desc: "$10,000 grants for international students, community college transfers, and PhD candidates. Deadline reminders.", tags: ["Scholarship","$10,000 Grant","International OK","Calendar Reminder"], rating: 4.8, reviews: 2190, verified: true, pro: false, languages: ["English","Bengali","Hindi"] },
    ],
    "admission": [
      { id: 1, initials: "CU", color: "from-indigo-600 to-blue-700", name: "CUNY Immigrant Student Admissions", type: "University Admissions", desc: "Higher education, undergraduate, graduate, and ESL admission support for new immigrants and DACA students.", tags: ["Admission","Undergrad & Grad","ESL Courses","DACA Friendly"], rating: 4.8, reviews: 4520, verified: true, pro: false, languages: ["English","Spanish","Bengali","Mandarin"] },
      { id: 2, initials: "NV", color: "from-teal-500 to-blue-600", name: "NYC Vocational & Trade Institute", type: "Certification Center", desc: "Short-term certification programs: HVAC, Electrician, Medical Assistant, IT. Job placement support included.", tags: ["Admission","Vocational","Job Placement","Tuition Assistance"], rating: 4.7, reviews: 1870, verified: true, pro: true, languages: ["English","Bengali","Spanish"] },
    ],
    "jobs-agency": [
      { id: 1, initials: "NE", color: "from-blue-600 to-indigo-700", name: "Newcomer Employment Agency", type: "Job Placement Agency", desc: "Immediate hiring for warehouse, retail, restaurant, delivery, driving & cleaning. Visa sponsorship filters available.", tags: ["Jobs Agency","No Experience Needed","Visa Sponsorship","Immediate Hiring"], rating: 4.9, reviews: 5210, verified: true, pro: true, languages: ["English","Bengali","Spanish","Hindi"] },
      { id: 2, initials: "ME", color: "from-emerald-500 to-teal-600", name: "Metro Entry Jobs & Resume Builder", type: "Staffing Agency", desc: "Entry-level job placements with free resume builder, interview preparation tips, and verified employer badges.", tags: ["Jobs Agency","Resume Builder","Nearby Jobs","Verified Agency"], rating: 4.8, reviews: 3410, verified: true, pro: false, languages: ["English","Bengali","Urdu"] },
    ],
    "movie-hall": [
      { id: 1, initials: "RJ", color: "from-pink-600 to-rose-700", name: "Regal Jackson Heights Cinema", type: "Movie Theater", desc: "Showing latest Bangladeshi, Hindi, and English movies. IMAX 3D, online seat booking, and halal snacks.", tags: ["Movie Hall","Bengali Movies","Hindi Movies","IMAX 3D","Seat Booking"], rating: 4.8, reviews: 2890, verified: true, pro: false, languages: ["Bengali","Hindi","English"] },
      { id: 2, initials: "AM", color: "from-red-500 to-orange-600", name: "AMC Fresh Meadows Desi Screenings", type: "Cinema", desc: "Dedicated screenings for South Asian blockbusters, student discount tickets, and reserved seating.", tags: ["Movie Hall","Desi Blockbusters","Student Discount","Parking"], rating: 4.7, reviews: 1980, verified: true, pro: false, languages: ["English","Hindi","Bengali"] },
    ],
    "travel-agency": [
      { id: 1, initials: "BW", color: "from-cyan-600 to-blue-700", name: "Biman & World Travel Agency", type: "Flight & Travel Agency", desc: "Best flight deals to Bangladesh (Dhaka/Sylhet), USA domestic tickets, Umrah/Hajj packages & visa support.", tags: ["Travel Agency","Bangladesh Flights","Umrah & Hajj","Group Tickets"], rating: 4.9, reviews: 4120, verified: true, pro: true, languages: ["Bengali","English"] },
      { id: 2, initials: "DE", color: "from-teal-500 to-cyan-600", name: "Desi Express Flight & Ticket Hub", type: "Travel Agency", desc: "Special student flight discounts, travel insurance, instant ticket price comparison, and 24/7 hotline.", tags: ["Travel Agency","Student Discount","Ticket Comparison","Visa Assistance"], rating: 4.8, reviews: 2780, verified: true, pro: false, languages: ["Bengali","Hindi","English"] },
    ],
    "metro": [
      { id: 1, initials: "MR", color: "from-sky-600 to-blue-700", name: "NYC Metro Rail Navigation", type: "Transit System", desc: "Metro route planner, fare calculator ($2.90), live service delay alerts, and accessibility station maps.", tags: ["Metro","Route Planner","Fare Calculator","Live Updates"], rating: 4.8, reviews: 8910, verified: true, pro: false, languages: ["English","Bengali","Spanish"] },
    ],
    "subway": [
      { id: 1, initials: "MS", color: "from-slate-600 to-gray-800", name: "MTA Subway Real-Time Tracker", type: "Subway Transit", desc: "Real-time train arrival countdowns, transfer advice, station exit info, and instant delay notifications.", tags: ["Subway","Real-time Arrival","Station Map","Delays & Transfers"], rating: 4.7, reviews: 12400, verified: true, pro: false, languages: ["English","Spanish","Bengali","Mandarin"] },
    ],
    "community-hospital": [
      { id: 1, initials: "EH", color: "from-red-600 to-rose-700", name: "Elmhurst Community Hospital & Clinic", type: "Public Community Hospital", desc: "Emergency 24/7, walk-in urgent care, free consultation days, Medicaid & uninsured patients accepted.", tags: ["Community Hospital","Emergency 24/7","Medicaid Accepted","Multilingual Doctors"], rating: 4.8, reviews: 6780, verified: true, pro: true, languages: ["Bengali","Spanish","English","Hindi","Arabic"] },
      { id: 2, initials: "JH", color: "from-blue-600 to-indigo-700", name: "Jamaica Community Health Center", type: "Affordable Care Center", desc: "Affordable care, walk-in clinic, primary care doctors, appointment booking, and low income assistance.", tags: ["Community Hospital","Walk-in Clinic","Free Consultation","Appointment Booking"], rating: 4.7, reviews: 4320, verified: true, pro: false, languages: ["English","Bengali","Spanish"] },
    ],
    "social-services": [
      { id: 1, initials: "HR", color: "from-emerald-600 to-teal-700", name: "NYC Social Services & Benefits Office", type: "Government Assistance", desc: "Food assistance (SNAP/WIC, Food Pantry), Financial assistance (Rental & Utility Aid), Medicaid, and Emergency Shelter.", tags: ["Social Services","SNAP & WIC","Rental Assistance","Medicaid","Legal Aid"], rating: 4.9, reviews: 9850, verified: true, pro: false, languages: ["English","Bengali","Spanish","Mandarin","Arabic"] },
      { id: 2, initials: "MR", color: "from-blue-500 to-teal-600", name: "Make The Road NY Social Assistance", type: "Nonprofit Social Org", desc: "Free grocery food pantry, citizenship & ESL classes, disaster relief, community grants, and career center.", tags: ["Social Services","Free Grocery","Citizenship Classes","Disaster Relief","Career Center"], rating: 4.8, reviews: 5410, verified: true, pro: true, languages: ["Spanish","Bengali","English"] },
    ],
    jobs: [
      { id: 1, initials: "IC", color: "from-blue-500 to-indigo-600", name: "ImmigrantHire NYC",      type: "Recruitment Agency", desc: "Placing 500+ immigrant professionals per year across tech, finance, and marketing. H-1B and OPT sponsorship available.", tags: ["Jobs","New York","H-1B Sponsor","Remote-friendly"], rating: 4.8, reviews: 2134, verified: true,  pro: true,  languages: ["English","Bengali","Hindi"] },
      { id: 2, initials: "JS", color: "from-emerald-500 to-teal-600", name: "JobScope USA",          type: "Job Board",          desc: "Top employers actively hiring immigrants. 23,000+ active postings with visa sponsorship filters.", tags: ["Jobs","Nationwide","Visa Sponsor"], rating: 4.9, reviews: 8921, verified: true,  pro: true,  languages: ["English","Spanish","Mandarin"] },
      { id: 3, initials: "NT", color: "from-violet-500 to-purple-600", name: "NovaTalent Headhunters",type: "Headhunter",         desc: "Executive and specialist recruitment for tech, finance and healthcare. Confidential search for all visa types.", tags: ["Jobs","Tech","Finance","NYC & Remote"], rating: 4.7, reviews: 543, verified: true,  pro: false, languages: ["English","Hindi"] },
      { id: 4, initials: "QB", color: "from-orange-400 to-rose-500", name: "QuickBridge Staffing",  type: "Staffing Agency",    desc: "Fast hiring for businesses and candidates. Temporary staffing, direct hire across all industries.", tags: ["Jobs","Queens","Brooklyn","Same-day"], rating: 4.6, reviews: 389, verified: true,  pro: false, languages: ["English","Spanish","Bengali"] },
    ],
    legal: [
      { id: 1, initials: "QL", color: "from-cyan-500 to-blue-600", name: "Queens Legal Services",   type: "Nonprofit Legal Aid",desc: "Free immigration legal aid for low-income immigrants. Asylum, green card, deportation defense.", tags: ["Legal","Queens","Free","Nonprofit"], rating: 4.9, reviews: 1203, verified: true,  pro: false, languages: ["English","Spanish","Bengali","Hindi"] },
      { id: 2, initials: "IL", color: "from-indigo-500 to-violet-600", name: "ImmigrationLaw NYC",  type: "Law Firm",           desc: "Full-service immigration law firm. H-1B, family petitions, DACA, asylum, citizenship applications.", tags: ["Legal","Manhattan","Consultations"], rating: 4.7, reviews: 876, verified: true,  pro: true,  languages: ["English","Spanish","Arabic"] },
      { id: 3, initials: "CN", color: "from-blue-400 to-cyan-500", name: "CUNY Citizenship Now",   type: "Nonprofit Legal Aid", desc: "Free citizenship and immigration legal help through CUNY. Walk-in clinics available across all boroughs.", tags: ["Legal","Citywide","Free","Citizenship"], rating: 4.8, reviews: 2341, verified: true,  pro: false, languages: ["English","Spanish","Bengali","Mandarin","Arabic"] },
      { id: 4, initials: "AA", color: "from-teal-500 to-emerald-600", name: "Atlas Advocates",     type: "Immigration Attorney",desc: "Boutique immigration law firm specializing in employment visas, green cards, and appeals.", tags: ["Legal","Bronx","Sliding Scale Fee"], rating: 4.5, reviews: 312, verified: true,  pro: true,  languages: ["English","Spanish"] },
    ],
    food: [
      { id: 1, initials: "BG", color: "from-amber-400 to-orange-500", name: "Bismillah Grocery",   type: "Halal Grocery",     desc: "Largest Bangladeshi and South Asian grocery store in Queens. Fresh produce, spices, halal meat.", tags: ["Halal","Jackson Heights","Open 7 days"], rating: 4.8, reviews: 1876, verified: true,  pro: false, languages: ["Bengali","English","Hindi","Urdu"] },
      { id: 2, initials: "KS", color: "from-red-400 to-rose-500", name: "La Cocina Latina",        type: "Latin Restaurant",  desc: "Authentic Mexican and Central American cuisine. SNAP/EBT accepted. Family-owned since 2009.", tags: ["Latino","Bronx","EBT Accepted"], rating: 4.7, reviews: 934, verified: true,  pro: false, languages: ["Spanish","English"] },
      { id: 3, initials: "ZH", color: "from-green-400 to-emerald-500", name: "Zaika House",        type: "Desi Restaurant",   desc: "Best Pakistani and Indian halal food in Brooklyn. Biryani, karahi, BBQ. Catering available.", tags: ["Halal","Desi","Brooklyn","Catering"], rating: 4.9, reviews: 2103, verified: true,  pro: true,  languages: ["Urdu","Hindi","Bengali","English"] },
      { id: 4, initials: "PM", color: "from-yellow-400 to-amber-500", name: "Pho & More",          type: "Asian Restaurant",  desc: "Vietnamese, Thai, and Cambodian cuisine. Quick lunch specials. Southeast Asian community hub.", tags: ["Asian","Flushing","Lunch Specials"], rating: 4.6, reviews: 567, verified: false, pro: false, languages: ["Vietnamese","Mandarin","English"] },
    ],
    hospitals: [
      { id: 1, initials: "NH", color: "from-red-500 to-rose-600", name: "NYC Health + Hospitals",  type: "Public Hospital System",desc: "Sliding-scale fees for uninsured immigrants. Multilingual staff across 11 hospitals in all 5 boroughs.", tags: ["Health","Citywide","Sliding-scale","No Insurance OK"], rating: 4.6, reviews: 5421, verified: true,  pro: false, languages: ["English","Spanish","Bengali","Mandarin","Arabic","Hindi"] },
      { id: 2, initials: "CI", color: "from-blue-400 to-indigo-500", name: "Coney Island Hospital",type: "Hospital",           desc: "Full-service hospital with immigrant-friendly services. Interpreters for 60+ languages on request.", tags: ["Health","Brooklyn","60+ Languages"], rating: 4.4, reviews: 2109, verified: true,  pro: false, languages: ["English","Russian","Spanish","Bengali"] },
      { id: 3, initials: "FC", color: "from-emerald-400 to-teal-500", name: "Family Care Clinic",  type: "Community Clinic",   desc: "Low-cost primary care for immigrants. ITIN accepted. Mental health services in Bengali and Spanish.", tags: ["Health","Queens","Low-cost","Mental Health"], rating: 4.8, reviews: 876, verified: true,  pro: true,  languages: ["English","Spanish","Bengali","Hindi"] },
      { id: 4, initials: "MC", color: "from-violet-400 to-purple-500", name: "MetroCare Walk-In",  type: "Walk-in Clinic",     desc: "No appointment needed. $30 flat fee for uninsured patients. Open 7 days including weekends.", tags: ["Health","Manhattan","$30 Flat Fee","Walk-in"], rating: 4.5, reviews: 1234, verified: true,  pro: false, languages: ["English","Spanish","Mandarin"] },
    ],
    schools: [
      { id: 1, initials: "IS", color: "from-violet-500 to-purple-600", name: "International School NYC", type: "Public School", desc: "Dedicated ESL program for new immigrant students K-12. Bilingual teachers in 8 languages. Free tutoring.", tags: ["Education","Queens","ESL","K-12","Free"], rating: 4.8, reviews: 1203, verified: true,  pro: false, languages: ["English","Spanish","Bengali","Mandarin","Hindi"] },
      { id: 2, initials: "QC", color: "from-blue-400 to-indigo-500", name: "CUNY Queens College",        type: "University",    desc: "Affordable public university with strong immigrant student support. DACA and undocumented student aid available.", tags: ["Education","Queens","DACA Friendly","Financial Aid"], rating: 4.7, reviews: 3421, verified: true,  pro: false, languages: ["English","Spanish","Multiple"] },
      { id: 3, initials: "NA", color: "from-teal-400 to-emerald-500", name: "NYC Adult Literacy Program", type: "ESL Program",   desc: "Free English classes for adults at all levels. Morning, evening, and weekend sessions. Childcare available.", tags: ["Education","Citywide","Free ESL","Childcare"], rating: 4.9, reviews: 2876, verified: true,  pro: false, languages: ["All levels welcome"] },
      { id: 4, initials: "DC", color: "from-orange-400 to-amber-500", name: "Dream Career Academy",      type: "Vocational School",desc: "Vocational training: electrician, plumbing, HVAC, IT. Job placement after graduation. Payment plans available.", tags: ["Education","Brooklyn","Vocational","Job Placement"], rating: 4.6, reviews: 654, verified: true,  pro: true,  languages: ["English","Spanish","Bengali"] },
    ],
    housing: [
      { id: 1, initials: "IH", color: "from-emerald-500 to-teal-600", name: "ImmigrantHomes NYC",  type: "Real Estate Agency", desc: "Specializes in helping immigrants find ITIN-friendly rentals. No SSN required. 500+ listings in all boroughs.", tags: ["Housing","Citywide","ITIN OK","No SSN"], rating: 4.8, reviews: 1543, verified: true,  pro: true,  languages: ["English","Spanish","Bengali","Hindi"] },
      { id: 2, initials: "AH", color: "from-blue-400 to-indigo-500", name: "Affordable Homes QNS", type: "Rental Agency",      desc: "Affordable apartments in Queens for immigrant families. Works with all income levels and visa types.", tags: ["Housing","Queens","Affordable","Family-friendly"], rating: 4.6, reviews: 876, verified: true,  pro: false, languages: ["English","Spanish","Bengali","Hindi"] },
      { id: 3, initials: "BH", color: "from-violet-400 to-purple-500", name: "Brooklyn Renters Aid",type: "Nonprofit Housing",  desc: "Nonprofit helping immigrants navigate NYC rental market. Know your rights workshops and tenant advocacy.", tags: ["Housing","Brooklyn","Nonprofit","Tenants Rights"], rating: 4.7, reviews: 1021, verified: true,  pro: false, languages: ["English","Spanish","Russian","Haitian Creole"] },
      { id: 4, initials: "HS", color: "from-amber-400 to-orange-500", name: "HomeShare Community",  type: "Room Sharing",       desc: "Connect with immigrant roommates in your area. Verified profiles, shared apartments from $600/month.", tags: ["Housing","Shared Room","From $600/mo"], rating: 4.5, reviews: 432, verified: false, pro: false, languages: ["Multiple"] },
    ],
    religious: [
      { id: 1, initials: "AT", color: "from-emerald-500 to-teal-600", name: "Masjid At-Taqwa",     type: "Mosque",             desc: "Welcoming mosque in Brooklyn serving Muslim immigrants from all backgrounds. Friday prayers, Quran classes, social services.", tags: ["Muslim","Brooklyn","All Welcome","Social Services"], rating: 4.9, reviews: 3421, verified: true,  pro: false, languages: ["English","Arabic","Bengali","Urdu"] },
      { id: 2, initials: "IH", color: "from-blue-400 to-indigo-500", name: "Islamic Center of NYC", type: "Islamic Center",    desc: "Large Islamic center in Manhattan with daily prayers, halal food pantry, and immigration assistance services.", tags: ["Muslim","Manhattan","Food Pantry","Immigration Help"], rating: 4.7, reviews: 2109, verified: true,  pro: false, languages: ["English","Arabic","Urdu","Bengali","Somali"] },
      { id: 3, initials: "GH", color: "from-amber-400 to-orange-500", name: "Ganesha Hindu Temple", type: "Hindu Temple",      desc: "Largest Hindu temple in Queens. Daily puja, cultural events, language classes, and community dinners.", tags: ["Hindu","Flushing","Cultural Events","Classes"], rating: 4.8, reviews: 1654, verified: true,  pro: false, languages: ["English","Hindi","Tamil","Telugu","Bengali"] },
      { id: 4, initials: "SC", color: "from-purple-400 to-violet-500", name: "Sacred Heart Church",  type: "Catholic Church",  desc: "Spanish and English mass. Immigration legal aid clinic every Thursday. Food pantry on Saturdays.", tags: ["Catholic","Bronx","Spanish Mass","Legal Aid"], rating: 4.6, reviews: 987, verified: true,  pro: false, languages: ["English","Spanish","Haitian Creole"] },
    ],
  };

  // Default providers for unspecified services
  const defaults: Provider[] = [
    { id: 1, initials: "IS", color: "from-blue-500 to-indigo-600",   name: "ImmigrantServe NYC",   type: "Service Provider", desc: "Trusted service provider serving the immigrant community in NYC. Multilingual staff, immigrant-friendly pricing.", tags: ["Local","NYC","Multilingual","Verified"], rating: 4.8, reviews: 1203, verified: true,  pro: true,  languages: ["English","Spanish","Bengali"] },
    { id: 2, initials: "CP", color: "from-emerald-500 to-teal-600",  name: "Community Pro Services",type: "Service Provider", desc: "Immigrant-run business serving the community since 2015. Affordable rates, flexible payment options.",             tags: ["Local","Queens","Affordable"],           rating: 4.7, reviews: 876,  verified: true,  pro: false, languages: ["English","Spanish","Hindi"] },
    { id: 3, initials: "UA", color: "from-violet-400 to-purple-500", name: "United Assist Group",  type: "Service Provider", desc: "Connecting immigrants with trusted local services. Background-checked providers, satisfaction guaranteed.",     tags: ["Citywide","Trusted","Background Checked"], rating: 4.6, reviews: 543, verified: true,  pro: true,  languages: ["English","Multiple"] },
    { id: 4, initials: "FH", color: "from-orange-400 to-rose-500",   name: "FreshStart Hub",       type: "Service Provider", desc: "New immigrant support services. Free consultation for first-time clients. Walk-ins welcome.",                   tags: ["Brooklyn","Free Consult","Walk-in"],     rating: 4.5, reviews: 312,  verified: false, pro: false, languages: ["English","Spanish","Bengali","Arabic"] },
  ];

  const key = Object.keys(base).find(k => serviceId?.includes(k));
  return key ? base[key] : defaults;
}

// ─── Community Posts ───────────────────────────────────────────────────────────

type Post = { id: number; author: string; handle: string; avatar: string; color: string; verified: boolean; time: string; content: string; likes: number; comments: number; reposts: number; type: string };

function getPosts(serviceId: string): Post[] {
  const allPosts: Post[] = [
    { id: 1, author: "Rahim Chowdhury",  handle: "@rahim_bd",    avatar: "RC", color: "from-emerald-400 to-teal-500",   verified: false, time: "2h ago",  type: "tip",      content: "💡 TIP: Always ask service providers if they offer sliding-scale fees or payment plans. Many immigrant-friendly businesses will work with you on pricing. Never be afraid to ask — the worst they can say is no! 🙏",                                                                          likes: 892,  comments: 67,  reposts: 445 },
    { id: 2, author: "Sofia Gutierrez",  handle: "@sofia_nyc",   avatar: "SG", color: "from-orange-400 to-amber-500",   verified: false, time: "4h ago",  type: "question", content: "🙋 Has anyone used any of these service providers before? Looking for personal recommendations specifically for a Bronx-area family. We just arrived last month and need help navigating everything from scratch. Any advice appreciated! 🙏",                                                likes: 134,  comments: 89,  reposts: 34  },
    { id: 3, author: "Nadia Islam",      handle: "@nadia_nyc",   avatar: "NI", color: "from-violet-400 to-indigo-500",  verified: true,  time: "6h ago",  type: "regular",  content: "Proud to say I've helped over 200 immigrant families connect with verified service providers through this community this year. The key is to always check reviews, ask for references, and never pay full upfront. DM me if you need guidance! ✅",                                               likes: 1234, comments: 156, reposts: 567 },
    { id: 4, author: "Carlos Rivera",    handle: "@carlos_h",    avatar: "CR", color: "from-blue-400 to-cyan-500",      verified: false, time: "8h ago",  type: "tip",      content: "🚨 WARNING: Be careful of scammers who pose as 'immigration consultants' and charge hundreds of dollars for things you can do for free. Always verify credentials. If they promise a green card guarantee — run! Share to spread awareness. 🙏",                                              likes: 2847, comments: 324, reposts: 1203 },
    { id: 5, author: "Priya Menon",      handle: "@dr_priya",    avatar: "PM", color: "from-purple-400 to-violet-500",  verified: true,  time: "12h ago", type: "regular",  content: "Community reminder: many providers in this section are verified by PathaSathi volunteers. Look for the blue ✅ badge. Verified providers have been vetted for legitimate credentials and fair practices. Stay safe out there! 💙",                                                      likes: 1876, comments: 134, reposts: 763 },
    { id: 6, author: "Ahmad Al-Khalil",  handle: "@ahmad_bklyn", avatar: "AH", color: "from-green-400 to-emerald-500", verified: false, time: "1d ago",  type: "need_help","content": "🆘 NEED HELP: I'm a new arrival from Syria and don't speak much English yet. Does anyone know if any of these providers have Arabic-speaking staff? I need help urgently and don't want to miss something important due to a language barrier. JazakAllah Khair 🤲",                      likes: 89,   comments: 156, reposts: 78  },
  ];
  return allPosts;
}

// ─── Provider Card ─────────────────────────────────────────────────────────────

function ProviderCard({ p, cta, serviceId }: { p: Provider; cta: string; serviceId: string; key?: string | number }) {
  const favId = `prov-${serviceId}-${p.id}`;
  const [inMyBox, setInMyBox] = useState(() => isFavourited(favId));
  const [flash, setFlash]     = useState(false);

  const toggleMyBox = () => {
    if (inMyBox) {
      removeFavourite(favId);
      setInMyBox(false);
    } else {
      addFavourite({
        id: favId,
        name: p.name,
        emoji: "🏢",
        type: "provider",
        path: `/services/${serviceId}`,
        subtitle: p.type,
      });
      setInMyBox(true);
      setFlash(true);
      setTimeout(() => setFlash(false), 1400);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-4 hover:shadow-md transition-all flex flex-col justify-between h-full">
      <div>
        {/* Top Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
            {p.initials}
          </div>

          {/* Name + badges */}
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

          {/* MyBox button */}
          <div className="relative flex-shrink-0">
            <button
              onClick={toggleMyBox}
              title={inMyBox ? "Remove from MyBox Favourites" : "Add to MyBox Favourites"}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                inMyBox
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              }`}
            >
              {inMyBox ? <Check className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{inMyBox ? "Saved" : "MyBox"}</span>
            </button>
            {flash && (
              <div className="absolute -top-8 right-0 bg-foreground text-background text-[10px] font-medium px-2 py-1 rounded-lg whitespace-nowrap shadow-lg z-10 animate-in fade-in slide-in-from-bottom-1 duration-150">
                Added to Favourites ✓
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{p.desc}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {p.tags.map(t => (
            <span key={t} className="text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>

        {/* Languages */}
        <div className="flex items-center gap-1.5 mb-3">
          <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span className="text-[10px] text-muted-foreground">{p.languages.join(" · ")}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.floor(p.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
            ))}
          </div>
          <span className="text-xs font-semibold text-foreground">{p.rating}</span>
          <span className="text-xs text-muted-foreground">({p.reviews.toLocaleString()} reviews)</span>
        </div>
      </div>

      {/* CTA Buttons - Pushed to bottom of card */}
      <div className="flex gap-2 pt-2 mt-auto border-t border-border/40">
        <button className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition">
          {cta}
        </button>
        <button className="px-3 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary transition">
          <Phone className="w-4 h-4" />
        </button>
        <button className="px-3 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary transition">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Post Card ─────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post; key?: string | number }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const typeLabel: Record<string, ReactNode> = {
    tip:      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mb-1.5"><Zap className="w-3 h-3" />Tip</div>,
    question: <div className="flex items-center gap-1 text-xs font-semibold text-primary mb-1.5"><HelpCircle className="w-3 h-3" />Question</div>,
    need_help:<div className="flex items-center gap-1 text-xs font-semibold text-amber-600 mb-1.5"><Users className="w-3 h-3" />Need Help</div>,
    regular:  null,
  };
  const typeBg: Record<string, string> = {
    tip:      "bg-emerald-50 border-emerald-100",
    question: "bg-blue-50 border-blue-100",
    need_help:"bg-amber-50 border-amber-100",
    regular:  "bg-white border-border",
  };

  return (
    <div
      className={`border rounded-2xl p-4 ${typeBg[post.type] ?? "bg-white border-border"} cursor-pointer hover:shadow-sm transition-all`}
      onClick={() => navigate("/post/1")}
    >
      {typeLabel[post.type]}
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
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-white/50" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLiked(!liked)} className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}>
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500" : ""}`} />{post.likes + (liked ? 1 : 0)}
            </button>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="w-3.5 h-3.5" />{post.comments}
            </button>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-600 transition-colors">
              <Repeat2 className="w-3.5 h-3.5" />{post.reposts}
            </button>
            <button className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setBookmarked(!bookmarked)} className={`flex items-center gap-1 text-xs transition-colors ${bookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-primary" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function ServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const id = serviceId ?? "jobs";
  const meta = serviceMeta[id] ?? {
    label: id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    emoji: "🔧",
    color: "#2563eb",
    bg: "#eff6ff",
    heroDesc: "Find trusted service providers in your area",
    ctaLabel: "Learn More",
  };

  const allProviders = getProviders(id);
  const providers = allProviders.filter(p =>
    search === "" ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.desc.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const CARDS_PER_SLIDE = 2;
  const [slideIndex, setSlideIndex] = useState(0);
  const totalSlides = Math.ceil(providers.length / CARDS_PER_SLIDE);
  const slideRef = useRef<HTMLDivElement>(null);

  const goTo = (idx: number) => {
    const next = Math.max(0, Math.min(idx, totalSlides - 1));
    setSlideIndex(next);
    if (slideRef.current) {
      slideRef.current.scrollTo({ left: next * slideRef.current.offsetWidth, behavior: "smooth" });
    }
  };

  const currentSlice = providers.slice(
    slideIndex * CARDS_PER_SLIDE,
    slideIndex * CARDS_PER_SLIDE + CARDS_PER_SLIDE
  );

  const posts = getPosts(id);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ background: meta.bg }}>
            {meta.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-foreground truncate" style={{ fontFamily: "var(--font-display)" }}>
              {meta.label}
            </h1>
            <p className="text-xs text-muted-foreground truncate">{meta.heroDesc}</p>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Search + Filter bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setSlideIndex(0); }}
                placeholder={`Search ${meta.label.toLowerCase()}…`}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
              />
            </div>
            <button className="px-3 py-2.5 bg-white border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary transition flex items-center gap-1.5">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Filter</span>
            </button>
          </div>

          {/* Provider count + nav */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              {providers.length} Verified Providers
            </p>
            {totalSlides > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goTo(slideIndex - 1)}
                  disabled={slideIndex === 0}
                  className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary disabled:opacity-30 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground font-medium">{slideIndex + 1} / {totalSlides}</span>
                <button
                  onClick={() => goTo(slideIndex + 1)}
                  disabled={slideIndex === totalSlides - 1}
                  className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary disabled:opacity-30 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Slideshow: 2 cards per slide */}
          {providers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-10 text-center">
              <div className="text-4xl mb-3">{meta.emoji}</div>
              <p className="font-semibold text-foreground mb-1">No providers found</p>
              <p className="text-sm text-muted-foreground">Try a different search term</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentSlice.map(p => <ProviderCard key={p.id} p={p} cta={meta.ctaLabel} serviceId={serviceId ?? "service"} />)}
              </div>

              {/* Dot indicators */}
              {totalSlides > 1 && (
                <div className="flex justify-center gap-1.5 pt-1">
                  {Array.from({ length: totalSlides }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`rounded-full transition-all duration-200 ${
                        i === slideIndex
                          ? "w-5 h-2 bg-primary"
                          : "w-2 h-2 bg-border hover:bg-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-semibold text-muted-foreground px-2">Community Posts</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Community Posts */}
          <div className="space-y-3">
            {posts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
