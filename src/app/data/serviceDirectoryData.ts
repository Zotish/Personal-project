// ─── SERVICE DIRECTORY DATA & REALISTIC GENERATORS ───────────────────────────
// For: Halal Food, Legal Aid, Hospital, Pharmacy, Free Medicine, Social Aid, Gas & EV, Sports

export interface ServiceListing {
  id: string;
  title: string;
  subtitle: string; // Company / Org / Provider
  type: string;
  category: string;
  distance: string;
  distanceKm: number;
  lat: number;
  lng: number;
  location: string;
  address: string;
  rating: number;
  reviews: number;
  verified: boolean;
  image: string;
  contactPhone: string;
  hours: string;
  website?: string;
  primaryHighlight: string; // e.g. "$12 - $25", "Free Aid", "$3.19/gal", "100% Halal"
  price?: string; // e.g. "$750", "$49", "Free Aid"
  badge?: string; // e.g. "15% OFF", "FREE AID", "TOP #1", "NEW"
  tag?: "discounted" | "new" | "popular" | "all";
  tags: string[];
  badges: string[];
  features: { label: string; value: string }[];
  overview: string;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ─── 1. HALAL FOOD & DESI RESTAURANTS ──────────────────────────────────────────
export function generateHalalFoodListings(lat: number, lng: number, area = "Jackson Heights", city = "Queens"): ServiceListing[] {
  const templates = [
    {
      title: "Halal Grocery Pack",
      subtitle: "Fresh Deshi Fish, Meat & Spice Box",
      type: "Grocery & Meat",
      category: "grocery-meat",
      badge: "15% OFF",
      price: "$49",
      tag: "discounted",
      primaryHighlight: "15% OFF",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&auto=format&fit=crop&q=80",
      hours: "8:00 AM – 10:00 PM (Daily)",
      contactPhone: "+1 (718) 898-1122",
      tags: ["Deshi Grocery", "Padma Ilish", "Halal Beef", "Home Delivery"],
      badges: ["15% OFF", "Fresh Delivery", "Zabihah Halal"],
      features: [
        { label: "Delivery", value: "Same-Day Doorstep Delivery" },
        { label: "Package", value: "Meat, Fish, Spices, Rice Bundle" },
        { label: "Discount", value: "15% Instant Newcomer Discount" }
      ],
      overview: "Fresh Deshi fish, meat & spice grocery box delivered home. Includes imported Padma Ilish, fresh halal beef cuts, Radhuni spices and Chinigura rice."
    },
    {
      title: "Deshi Kitchen Subscription",
      subtitle: "Daily Homemade Bangladeshi Meal Plan",
      type: "Desi Kitchen",
      category: "desi-kitchen",
      badge: "NEW KITCHEN",
      price: "$85/wk",
      tag: "new",
      primaryHighlight: "$85/wk",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80",
      hours: "9:00 AM – 9:00 PM",
      contactPhone: "+1 (718) 672-9900",
      tags: ["Daily Tiffin", "Home Cooked", "Bangladeshi", "Weekly Plan"],
      badges: ["NEW KITCHEN", "Low Oil", "Halal Certified"],
      features: [
        { label: "Frequency", value: "Lunch & Dinner, 6 Days/Week" },
        { label: "Taste", value: "Authentic Home Style Deshi Taste" },
        { label: "Trial", value: "3-Day Trial Pack Available" }
      ],
      overview: "Fresh homemade daily Bangladeshi meal delivery plan. Authentic family recipes cooked with minimal oil, rotating weekly dishes including fish curry, dal, bhorta and beef bhuna."
    },
    {
      title: "Kabab King & Halal Diner",
      subtitle: "Authentic Desi & Zabihah Grill",
      type: "Restaurant",
      category: "restaurant",
      badge: "TOP #1",
      price: "$14.99",
      tag: "popular",
      primaryHighlight: "100% Zabihah Halal",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&auto=format&fit=crop&q=80",
      hours: "10:00 AM – 2:00 AM (Daily)",
      contactPhone: "+1 (718) 457-5464",
      tags: ["Biryani", "Seekh Kabab", "Fresh Naan", "Dine-in", "Takeout"],
      badges: ["Zabihah Halal", "Top Rated", "Late Night"],
      features: [
        { label: "Halal Certification", value: "HMS Zabihah Certified" },
        { label: "Cuisine", value: "Bangladeshi & Pakistani" },
        { label: "Price Range", value: "$$ ($12–$25 per meal)" },
        { label: "Seating", value: "Family Hall & Prayer Space" }
      ],
      overview: "Renowned immigrant spot famous for piping hot kacchi biryani, freshly clay-oven baked garlic naan, and spicy mutton karahi. Dedicated family booths and clean prayer room available."
    },
    {
      title: "Dhaka Kacchi Ghar & Sweets",
      subtitle: "Old Dhaka Style Kacchi & Rasgulla",
      type: "Desi Kitchen",
      category: "desi-kitchen",
      badge: "POPULAR",
      price: "$12 - $20",
      tag: "popular",
      primaryHighlight: "$14.99 Kacchi Platter",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80",
      hours: "11:00 AM – 11:30 PM",
      contactPhone: "+1 (718) 728-3330",
      tags: ["Kacchi Biryani", "Mishti", "Borhani", "Catering"],
      badges: ["Authentic Dhaka", "Halal Certified", "Home Delivery"],
      features: [
        { label: "Specialty", value: "Traditional Basmati Dum Kacchi" },
        { label: "Dessert Counter", value: "25+ Fresh Bengali Sweets" },
        { label: "Catering", value: "Weddings, Milad & Community Events" },
        { label: "Delivery", value: "DoorDash, UberEats & Direct" }
      ],
      overview: "Authentic Old Dhaka aromatic Dum Kacchi Biryani cooked in traditional copper degh. Fresh Borhani, Chomchom, and sweet curd (Mishti Doi) prepared daily by master chefs."
    },
    {
      title: "Madina Halal Supermarket & Butcher",
      subtitle: "Fresh Zabihah Meat & Desi Groceries",
      type: "Grocery & Meat",
      category: "grocery-meat",
      badge: "SAVE 20%",
      price: "$25",
      tag: "discounted",
      primaryHighlight: "Fresh Goat & Beef Cut",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&auto=format&fit=crop&q=80",
      hours: "8:30 AM – 10:00 PM (Daily)",
      contactPhone: "+1 (718) 898-1122",
      tags: ["Zabihah Meat", "Ilish Fish", "Pran & Radhuni", "EBT Accepted"],
      badges: ["Hand Slaughtered", "EBT / SNAP", "Fresh Daily"],
      features: [
        { label: "Butcher Service", value: "Custom cuts: Biryani, Curry, Mince" },
        { label: "Fish Section", value: "Imported Padma Ilish, Rui, Katla" },
        { label: "Spices", value: "100% Desi spices & mustard oils" },
        { label: "Payment", value: "EBT/SNAP, Cards, Cash" }
      ],
      overview: "One-stop immigrant halal market. Hand-slaughtered fresh goat, beef, and country chicken cut to your specification. Frozen river fish from Bangladesh and bulk Basmati rice bags."
    },
    {
      title: "Al-Noor Home Kitchen & Tiffin",
      subtitle: "Daily Homemade Tiffin & Meal Plans",
      type: "Home Kitchen",
      category: "desi-kitchen",
      badge: "JUST IN",
      price: "$150/mo",
      tag: "new",
      primaryHighlight: "$150/Month Tiffin (Lunch+Dinner)",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80",
      hours: "9:00 AM – 9:00 PM",
      contactPhone: "+1 (718) 672-9900",
      tags: ["Monthly Tiffin", "Bachelors & Students", "Low Oil", "Home Delivery"],
      badges: ["Homemade", "Budget Friendly", "Doorstep Delivery"],
      features: [
        { label: "Meal Plan", value: "Rice, Daal, Sabzi, Fish/Meat daily" },
        { label: "Health", value: "Low oil, home cooked, no MSG" },
        { label: "Coverage", value: "Queens, Brooklyn & Manhattan" },
        { label: "Trial", value: "3-Day Trial Pack Available" }
      ],
      overview: "Homestyle nutritious meals specially crafted for immigrant students, bachelor tech workers, and busy families. Hot doorstep lunch and dinner delivery with daily rotating menus."
    },
    {
      title: "Desi Fried Chicken & Burgers",
      subtitle: "Halal Crispy Fast Food & Wings",
      type: "Fast Food",
      category: "fast-food",
      badge: "$8.99 DEAL",
      price: "$8.99",
      tag: "discounted",
      primaryHighlight: "$8.99 Meal Deal",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80",
      hours: "11:00 AM – 3:00 AM",
      contactPhone: "+1 (718) 424-7788",
      tags: ["Halal Crispy Chicken", "Naga Wings", "Burgers", "Halal Loaded Fries"],
      badges: ["100% Halal", "Late Night", "Spicy Naga"],
      features: [
        { label: "Signature", value: "Ghost Pepper Naga Wings & Crunch Burger" },
        { label: "Halal Status", value: "All Chicken & Beef 100% Halal" },
        { label: "Late Night", value: "Open till 3 AM on weekends" }
      ],
      overview: "American fast food comfort with an authentic Desi spicy twist. Naga crispy chicken tenders, smash beef burgers with house garlic aioli, and masala seasoned curly fries."
    },
    {
      title: "Bonoful Sweets & Bakery",
      subtitle: "Traditional Bengali Sweets & Pitha",
      type: "Bakery & Sweets",
      category: "sweets-bakery",
      badge: "POPULAR",
      price: "$10",
      tag: "popular",
      primaryHighlight: "Fresh Kalojam & Singara",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=700&auto=format&fit=crop&q=80",
      hours: "8:00 AM – 10:30 PM",
      contactPhone: "+1 (718) 507-4400",
      tags: ["Hot Singara", "Chai", "Rasmalai", "Custom Cakes"],
      badges: ["Traditional Bakery", "Fresh Pitha", "Morning Breakfast"],
      features: [
        { label: "Morning Breakfast", value: "Paratha, Dal, Halwa & Karak Chai" },
        { label: "Evening Snacks", value: "Crispy Singara, Mughlai Paratha" },
        { label: "Celebrations", value: "Halal Birthday & Anniversary Cakes" }
      ],
      overview: "Beloved neighborhood tea house and confectionery. Famous for flaky Bengali singaras, fresh jalebi straight from the pan, and customized halal cakes for special occasions."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 2. LEGAL AID & IMMIGRATION ATTORNEYS ──────────────────────────────────────
export function generateLegalAidListings(lat: number, lng: number, area = "Jamaica", city = "Queens"): ServiceListing[] {
  const templates = [
    {
      title: "Asylum & Free Legal Aid",
      subtitle: "Immigrant Defense & Pro-Bono Counsel",
      type: "Free Legal Aid",
      category: "free-aid",
      badge: "TOP #1",
      price: "Pro-Bono",
      tag: "popular",
      primaryHighlight: "100% Free / Pro Bono",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=700&auto=format&fit=crop&q=80",
      hours: "Mon – Fri: 9:00 AM – 5:00 PM",
      contactPhone: "+1 (718) 391-1332",
      tags: ["Asylum", "Work Permit", "TPS", "Deportation Defense"],
      badges: ["Free Legal Aid", "Government Funded", "Pro Bono"],
      features: [
        { label: "Cost", value: "Free for qualifying low-income immigrants" },
        { label: "Languages", value: "Bengali, Spanish, Hindi, English" },
        { label: "Practice Areas", value: "Asylum, EAD, DACA, Green Card, VAWA" }
      ],
      overview: "Free pro-bono immigration attorney consultation & TPS aid. Representation before immigration courts, credible fear interview preparation and fee waiver filings."
    },
    {
      title: "AI Legal Doc Translator",
      subtitle: "Certified USCIS Translation Service",
      type: "Immigration Attorneys",
      category: "immigration-lawyer",
      badge: "NEW AI",
      price: "Instant",
      tag: "new",
      primaryHighlight: "Certified Instant Translation",
      image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=700&auto=format&fit=crop&q=80",
      hours: "24/7 Digital Intake",
      contactPhone: "+1 (800) 555-0199",
      tags: ["NID Translation", "Passport", "Birth Certificate", "USCIS Accepted"],
      badges: ["NEW AI", "Certified Notary", "Instant"],
      features: [
        { label: "Turnaround", value: "Under 10 Minutes with Certified Stamp" },
        { label: "Acceptance", value: "100% USCIS, Embassy & NVC Compliant" }
      ],
      overview: "Instant certified NID, Passport & certificate translation accepted by USCIS and local consulates with official certifier seal and notary signature."
    },
    {
      title: "USCIS Case Tracker 2.0",
      subtitle: "Automated Immigrant Notification Aid",
      type: "Citizenship & Fee Waivers",
      category: "citizenship",
      badge: "NEW V2.0",
      price: "Free",
      tag: "new",
      primaryHighlight: "Automated SMS Tracking",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&auto=format&fit=crop&q=80",
      hours: "24/7 Real-Time Alerts",
      contactPhone: "+1 (800) 555-0144",
      tags: ["Case Tracker", "EAD Alerts", "Green Card", "Receipt Status"],
      badges: ["NEW V2.0", "Free Tool", "Live Updates"],
      features: [
        { label: "Alerts", value: "Instant SMS & Email when status changes" },
        { label: "Helpline", value: "Direct connection to legal volunteer navigators" }
      ],
      overview: "Automated real-time SMS status updates for Green Card & EAD work authorization petitions with direct access to pro bono helpline."
    },
    {
      title: "Queens Legal Services (Immigration Unit)",
      subtitle: "Nonprofit Pro-Bono Legal Assistance",
      type: "Free Legal Aid",
      category: "free-aid",
      badge: "PRO BONO",
      price: "Free Aid",
      tag: "popular",
      primaryHighlight: "100% Free / Pro Bono",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&auto=format&fit=crop&q=80",
      hours: "Mon – Fri: 9:00 AM – 5:00 PM",
      contactPhone: "+1 (718) 391-1332",
      tags: ["Asylum", "Work Permit", "TPS", "Deportation Defense", "Bengali Interpreters"],
      badges: ["Free Legal Aid", "Government Funded", "Sliding Scale"],
      features: [
        { label: "Cost", value: "Free for qualifying low-income immigrants" },
        { label: "Languages", value: "Bengali, Spanish, Hindi, English" },
        { label: "Practice Areas", value: "Asylum, EAD, DACA, Green Card, VAWA" }
      ],
      overview: "Dedicated civil legal organization providing free representation in immigration court, work permit renewals, asylum documentation, and family reunification petitions without fear of status check."
    },
    {
      title: "CUNY Citizenship Now! Legal Center",
      subtitle: "Free University Immigration Assistance Clinic",
      type: "Legal Clinic",
      category: "free-aid",
      badge: "FEE WAIVER",
      price: "$0 Fee",
      tag: "discounted",
      primaryHighlight: "Free Application Assistance",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&auto=format&fit=crop&q=80",
      hours: "Mon – Fri: 9:30 AM – 4:30 PM",
      contactPhone: "+1 (646) 664-9400",
      tags: ["Citizenship N-400", "Green Card Renewal", "Fee Waiver", "DACA"],
      badges: ["CUNY Clinic", "Free Aid", "Fee Waiver Help"],
      features: [
        { label: "Services", value: "N-400, I-90, I-765, USCIS Fee Waivers" },
        { label: "Attorneys", value: "Licensed Immigration Attorneys & DOJ Accredited" }
      ],
      overview: "Largest university-based legal assistance program in the USA. Certified attorneys assist newcomer immigrants with citizenship filing, green card renewals, and USCIS fee waiver applications."
    },
    {
      title: "Chowdhury & Partners Immigration Law",
      subtitle: "Immigrant Rights & Business Visa Law Firm",
      type: "Private Law Firm",
      category: "immigration-lawyer",
      badge: "POPULAR",
      price: "$150/hr",
      tag: "popular",
      primaryHighlight: "Free 15-Min Consultation",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=700&auto=format&fit=crop&q=80",
      hours: "Mon – Sat: 10:00 AM – 6:30 PM",
      contactPhone: "+1 (718) 555-8910",
      tags: ["Asylum Defense", "EAD / Work Auth", "H-1B & EB-2", "Court Appeals"],
      badges: ["Top Rated Attorney", "Bengali Fluent", "Payment Plans"],
      features: [
        { label: "Consultation", value: "Free initial assessment" },
        { label: "Payment Plans", value: "Flexible monthly installment plans" }
      ],
      overview: "Experienced immigration law practice specializing in asylum hearings, master calendar court defense, hardship waivers, and employment-based immigration for South Asian newcomers."
    },
    {
      title: "Immigrant Fee Waiver Clinic",
      subtitle: "Free USCIS Application Fee Assistance",
      type: "Fee Waiver Help",
      category: "free-aid",
      badge: "FREE AID",
      price: "$0 Aid",
      tag: "discounted",
      primaryHighlight: "100% Fee Waiver Support",
      image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=700&auto=format&fit=crop&q=80",
      hours: "Mon – Fri: 10:00 AM – 4:00 PM",
      contactPhone: "+1 (718) 555-0144",
      tags: ["I-912 Fee Waiver", "N-400 Aid", "Pro Bono", "No Cost"],
      badges: ["FREE AID", "Fee Waiver", "Volunteer Lawyers"],
      features: [
        { label: "Savings", value: "Save up to $725 in USCIS filing fees" },
        { label: "Eligibility", value: "Medicaid, SNAP, or income under 150% FPL" }
      ],
      overview: "Dedicated pro bono legal volunteers assisting low-income immigrants in qualifying and applying for full USCIS fee waivers on citizenship and work permits."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 3. HOSPITALS & MEDICAL CENTERS ───────────────────────────────────────────
export function generateHospitalListings(lat: number, lng: number, area = "Elmhurst", city = "Queens"): ServiceListing[] {
  const templates = [
    {
      title: "NYC Health + Hospitals / Elmhurst",
      subtitle: "Level 1 Trauma & 24/7 Emergency Hospital",
      type: "Public Hospital",
      category: "emergency-247",
      badge: "24/7 ER",
      price: "NYC Care",
      tag: "popular",
      primaryHighlight: "NYC Care & Medicaid Accepted",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=700&auto=format&fit=crop&q=80",
      hours: "Emergency Room: 24 Hours Open (7 Days)",
      contactPhone: "+1 (718) 334-4000",
      tags: ["24/7 ER", "NYC Care", "No Insurance OK", "Maternity", "Bengali Interpreters"],
      badges: ["24/7 Emergency", "Public Hospital", "Sliding Scale"],
      features: [
        { label: "Emergency Room", value: "Open 24/7/365 — Treats regardless of status" },
        { label: "Insurance", value: "Medicaid, Medicare, NYC Care & Uninsured OK" },
        { label: "Interpreter Services", value: "Free live in-person translation in 150+ languages" }
      ],
      overview: "The premier public healthcare hub for Queens immigrants. By law and hospital policy, emergency and outpatient treatment is provided to all residents regardless of immigration or insurance status."
    },
    {
      title: "Community Healthcare Network – Queens Health Center",
      subtitle: "Walk-in Neighborhood Community Clinic",
      type: "Walk-in Clinic",
      category: "walk-in-clinic",
      badge: "FREE VISIT",
      price: "$0 - $20",
      tag: "discounted",
      primaryHighlight: "Sliding Scale ($20 Visits)",
      image: "https://images.unsplash.com/photo-1588776814546-1ffbb4b45c5b?w=700&auto=format&fit=crop&q=80",
      hours: "Mon – Sat: 8:00 AM – 6:30 PM",
      contactPhone: "+1 (718) 657-7088",
      tags: ["Primary Care", "Dental", "Mental Health", "Vaccines", "Pediatrics"],
      badges: ["Walk-in Welcome", "Sliding Scale", "Uninsured Welcome"],
      features: [
        { label: "Appointment", value: "Walk-in same day & online booking" },
        { label: "Cost", value: "$0 – $20 based on income; no one turned away" }
      ],
      overview: "Affordable community health clinic offering primary care doctor visits, dental checkups, child immunizations, and prenatal checkups for immigrant families without health insurance."
    },
    {
      title: "Mount Sinai Queens Medical Pavilion",
      subtitle: "Comprehensive Acute Care & Specialty Hospital",
      type: "Full Service Hospital",
      category: "community-hospital",
      badge: "TOP HOSPITAL",
      price: "Medicaid",
      tag: "popular",
      primaryHighlight: "Comprehensive Specialty Care",
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=700&auto=format&fit=crop&q=80",
      hours: "24/7 Emergency Department",
      contactPhone: "+1 (718) 932-1000",
      tags: ["Stroke Center", "Cardiology", "Orthopedics", "Emergency Care"],
      badges: ["Mount Sinai Network", "Advanced Tech", "Multilingual"],
      features: [
        { label: "ER Capacity", value: "Rapid triage & board-certified emergency physicians" },
        { label: "Financial Aid", value: "Sliding-scale financial assistance program available" }
      ],
      overview: "Modern acute hospital equipped with an advanced emergency wing, robotic surgery center, cardiac outpatient suites, and compassionate multilingual healthcare providers."
    },
    {
      title: "Jackson Heights Multi-Specialty Clinic",
      subtitle: "Bilingual Immigrant Health Center",
      type: "Walk-in Clinic",
      category: "walk-in-clinic",
      badge: "NEW CLINIC",
      price: "Low-Cost",
      tag: "new",
      primaryHighlight: "Multilingual Doctors Onsite",
      image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=700&auto=format&fit=crop&q=80",
      hours: "8:30 AM – 7:00 PM (Daily)",
      contactPhone: "+1 (718) 899-2233",
      tags: ["Bengali Doctors", "Walk-in", "Lab Onsite", "Pediatric"],
      badges: ["NEW CLINIC", "Multilingual Staff", "Walk-in"],
      features: [
        { label: "Doctors", value: "Bengali, Spanish, Hindi speaking MDs" },
        { label: "Pharmacy", value: "Direct onsite prescription fulfillment" }
      ],
      overview: "Welcoming neighborhood walk-in clinic dedicated to newcomer families. General physician consultations, blood testing, pediatric care and women's health."
    },
    {
      title: "Elmhurst Immigrant Urgent Care",
      subtitle: "Affordable Walk-in Emergency & Family Clinic",
      type: "Walk-in Clinic",
      category: "walk-in-clinic",
      badge: "50% OFF",
      price: "$15 Copay",
      tag: "discounted",
      primaryHighlight: "50% Discount for Uninsured",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=700&auto=format&fit=crop&q=80",
      hours: "8:00 AM – 11:00 PM (Daily)",
      contactPhone: "+1 (718) 334-5500",
      tags: ["Urgent Care", "X-Ray", "No Insurance", "Low Cost Copay"],
      badges: ["50% OFF", "Walk-in", "Lab Onsite"],
      features: [
        { label: "Copay", value: "$15 flat rate for immigrant newcomer visits" },
        { label: "Wait Time", value: "Average under 15 minutes" }
      ],
      overview: "Community-supported urgent care center providing walk-in treatment for minor injuries, fevers, lab testing, and X-rays with generous sliding-scale discounts."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 4. PHARMACIES ─────────────────────────────────────────────────────────────
export function generatePharmacyListings(lat: number, lng: number, area = "Jackson Heights", city = "Queens"): ServiceListing[] {
  const templates = [
    {
      title: "24h Urgent Pharmacy Finder",
      subtitle: "Medicaid OTC & Round-The-Clock Dispensary",
      type: "Community Pharmacy",
      category: "24-hours",
      badge: "MOST USED",
      price: "24/7",
      tag: "popular",
      primaryHighlight: "Open 24/7 • Free Delivery",
      image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=700&auto=format&fit=crop&q=80",
      hours: "24 Hours (7 Days a Week)",
      contactPhone: "+1 (718) 478-6500",
      tags: ["24/7 Open", "Free Rx Delivery", "Bengali Pharmacist", "OTC Medicines"],
      badges: ["24/7 Open", "Medicaid & EBT", "Free Delivery"],
      features: [
        { label: "Refills", value: "Quick 10-minute refill & WhatsApp order" },
        { label: "Insurance", value: "Accepts Medicaid, Medicare, NYC Care & Cash" }
      ],
      overview: "Medicaid OTC items, flu shots & 24/7 neighborhood clinics. Bilingual pharmacists ready to assist with rapid prescription dispensing and free home delivery."
    },
    {
      title: "Prescription Rx Medicine",
      subtitle: "Free Home Delivery & Rx Discounts",
      type: "Discount Pharmacy",
      category: "discount-pharmacy",
      badge: "FREE AID",
      price: "Free Aid",
      tag: "discounted",
      primaryHighlight: "$4 Generic Prescriptions",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop&q=80",
      hours: "Mon – Sat: 9:00 AM – 8:00 PM",
      contactPhone: "+1 (718) 335-9000",
      tags: ["$4 Generics", "Senior Discount", "Asthma Inhalers", "Diabetes Supplies"],
      badges: ["FREE AID", "Lowest Cash Price", "No Insurance OK"],
      features: [
        { label: "Uninsured Program", value: "30-day generic supplies starting at $0-$4" },
        { label: "Diabetes Supplies", value: "Test strips, lancets & monitors at wholesale cost" }
      ],
      overview: "Free home delivery & Rx discount card for uninsured immigrants. Up to 85% discount on brand and generic maintenance medications."
    },
    {
      title: "Deshi Care 24/7 Community Pharmacy",
      subtitle: "Bengali & English Speaking Pharmacists",
      type: "Community Pharmacy",
      category: "24-hours",
      badge: "POPULAR",
      price: "Medicaid",
      tag: "popular",
      primaryHighlight: "Open 24/7 • Free Delivery",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=700&auto=format&fit=crop&q=80",
      hours: "24 Hours (7 Days a Week)",
      contactPhone: "+1 (718) 478-6500",
      tags: ["24/7 Open", "Free Rx Delivery", "Bengali Pharmacist"],
      badges: ["24/7 Open", "Medicaid & EBT", "Free Delivery"],
      features: [
        { label: "Refills", value: "Quick 10-minute refill & WhatsApp order" },
        { label: "Delivery", value: "Free same-day delivery to your doorstep" }
      ],
      overview: "Trusted immigrant community pharmacy open around the clock. Prescription refills, generic alternatives that save up to 80%, flu shots, and blood pressure checkups."
    },
    {
      title: "CVS Pharmacy & MinuteClinic",
      subtitle: "Full-Service Retail & Clinic Pharmacy",
      type: "Chain Pharmacy",
      category: "retail-pharmacy",
      badge: "TOP RATED",
      price: "Express Rx",
      tag: "new",
      primaryHighlight: "Vaccines & Express Rx",
      image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=700&auto=format&fit=crop&q=80",
      hours: "8:00 AM – 10:00 PM (Clinic: 9am-7pm)",
      contactPhone: "+1 (718) 899-7000",
      tags: ["Flu Shot", "MinuteClinic", "Drive-thru", "OTC Discounts"],
      badges: ["MinuteClinic", "COVID & Flu Vaccines"],
      features: [
        { label: "Services", value: "Vaccines, rapid strep test, OTC cards accepted" },
        { label: "Refill App", value: "Sync prescriptions automatically" }
      ],
      overview: "Full-line pharmacy with walk-in MinuteClinic. On-the-spot vaccinations, birth control consultations, minor illness treatment, and easy electronic prescription transfers."
    },
    {
      title: "Immigrant Rx Discount Club",
      subtitle: "Low-Cost Generic Prescription Program",
      type: "Discount Pharmacy",
      category: "discount-pharmacy",
      badge: "80% OFF",
      price: "$4 Rx",
      tag: "discounted",
      primaryHighlight: "Generics Starting at $4",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop&q=80",
      hours: "9:00 AM – 9:00 PM",
      contactPhone: "+1 (718) 898-4422",
      tags: ["Generic Meds", "Cardio Rx", "Antibiotics", "Wholesale Price"],
      badges: ["80% OFF", "Rx Discount", "No Insurance"],
      features: [
        { label: "Discount", value: "Up to 80% off retail pharmacy prices" },
        { label: "Accepted", value: "Instant mobile membership, no SSN needed" }
      ],
      overview: "Free prescription savings program offering steep wholesale discounts on over 500 essential generic medications for newcomer families."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 5. FREE MEDICINE & PRESCRIPTION AID ──────────────────────────────────────
export function generateFreeMedicineListings(lat: number, lng: number, area = "Corona", city = "Queens"): ServiceListing[] {
  const templates = [
    {
      title: "Prescription Rx Medicine",
      subtitle: "Free Home Delivery & Rx Discounts",
      type: "Free Dispensary",
      category: "free-medicine",
      badge: "FREE AID",
      price: "Free Aid",
      tag: "discounted",
      primaryHighlight: "100% Free Medications",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop&q=80",
      hours: "Mon – Thu: 9:30 AM – 4:30 PM",
      contactPhone: "+1 (718) 592-2300",
      tags: ["100% Free Rx", "Insulin Aid", "Blood Pressure", "No Fee At All"],
      badges: ["FREE AID", "Charity Funded", "No Insurance Needed"],
      features: [
        { label: "Eligibility", value: "Uninsured individuals under 300% Federal Poverty Line" },
        { label: "Available Meds", value: "Insulin, Metformin, Lisinopril, Antibiotics, Inhalers" }
      ],
      overview: "Free home delivery & Rx discount card for uninsured immigrants. Charitably funded essential antibiotics, blood pressure and cardiovascular medication dispensaries."
    },
    {
      title: "Medical Courier Express",
      subtitle: "Same-Day Door Delivery For Prescriptions",
      type: "Direct Mail Programs",
      category: "mail-delivery",
      badge: "JUST IN",
      price: "$15",
      tag: "new",
      primaryHighlight: "Same-Day Door Delivery",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=700&auto=format&fit=crop&q=80",
      hours: "8:00 AM – 8:00 PM (Daily)",
      contactPhone: "+1 (800) 555-0188",
      tags: ["Doorstep Courier", "Temperature Controlled", "Prescriptions", "Fast Delivery"],
      badges: ["JUST IN", "Cold Chain", "Same Day"],
      features: [
        { label: "Speed", value: "Within 2-4 Hours Across Boroughs" },
        { label: "Safety", value: "Insulated & Temperature Monitored Delivery" }
      ],
      overview: "Same-day prescription & medical report door delivery for low mobility and senior community members across the metropolitan area."
    },
    {
      title: "Dispensary of Hope Community Clinic",
      subtitle: "100% Free Prescription Medication Program",
      type: "Free Dispensary",
      category: "free-medicine",
      badge: "100% FREE",
      price: "$0 Cost",
      tag: "popular",
      primaryHighlight: "100% Free Medications",
      image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=700&auto=format&fit=crop&q=80",
      hours: "Mon – Thu: 9:30 AM – 4:30 PM",
      contactPhone: "+1 (718) 592-2300",
      tags: ["100% Free Rx", "Insulin Aid", "Blood Pressure", "No Fee At All"],
      badges: ["100% Free", "Charity Funded", "No Insurance Needed"],
      features: [
        { label: "Eligibility", value: "Uninsured individuals under 300% Federal Poverty Line" },
        { label: "Available Meds", value: "Insulin, Metformin, Lisinopril, Antibiotics, Inhalers" }
      ],
      overview: "Charitable pharmacy partnership distributing donated brand and generic medications completely free of charge to uninsured immigrant patients with a valid doctor's prescription."
    },
    {
      title: "RxOutreach Immigrant Medicine Fund",
      subtitle: "Mail-Order Free & Low-Cost Medication Charity",
      type: "Charitable Pharmacy",
      category: "free-medicine",
      badge: "MAIL ORDER",
      price: "$0 – $10",
      tag: "discounted",
      primaryHighlight: "$0 – $10 Mail Delivery",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop&q=80",
      hours: "Customer Help: 8:00 AM – 6:00 PM EST",
      contactPhone: "+1 (888) 796-1234",
      tags: ["Mail Order", "Chronic Illness", "Direct to Home", "Free Consultation"],
      badges: ["National Charity", "Home Delivery"],
      features: [
        { label: "Coverage", value: "Delivers to all 50 states directly to your address" },
        { label: "Meds Covered", value: "Over 1,000 FDA-approved chronic medications" }
      ],
      overview: "Licensed nonprofit mail-order pharmacy dedicated to assisting low-income immigrants who cannot afford crucial medications for asthma, diabetes, heart disease, and mental health."
    },
    {
      title: "Insulin & Diabetic Care Aid",
      subtitle: "Emergency Free Insulin & Testing Supplies",
      type: "Diabetes & Insulin Aid",
      category: "insulin-aid",
      badge: "FREE AID",
      price: "$0 Aid",
      tag: "discounted",
      primaryHighlight: "100% Free Insulin Relief",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop&q=80",
      hours: "Mon – Fri: 9:00 AM – 5:00 PM",
      contactPhone: "+1 (800) 555-0166",
      tags: ["Free Insulin", "Glucometers", "Test Strips", "Emergency Relief"],
      badges: ["FREE AID", "Diabetic Support", "Charity"],
      features: [
        { label: "Supplies", value: "Monthly insulin vials & free digital glucose meter" },
        { label: "Approval", value: "Same-day emergency supply voucher" }
      ],
      overview: "Emergency charitable program supplying free life-saving insulin, lancets, and blood glucose testing strips to uninsured diabetic newcomers."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 6. SOCIAL AID & GOVERNMENT SERVICES ──────────────────────────────────────
export function generateSocialAidListings(lat: number, lng: number, area = "Woodside", city = "Queens"): ServiceListing[] {
  const templates = [
    {
      title: "Emergency Food Pantries",
      subtitle: "Community Halal Food Bank & Nutrition",
      type: "Culturally Specific Pantries",
      category: "food-security",
      badge: "24/7 AID",
      price: "Free",
      tag: "popular",
      primaryHighlight: "Culturally Appropriate Food Pantry",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=700&auto=format&fit=crop&q=80",
      hours: "Mon – Fri: 9:30 AM – 5:00 PM",
      contactPhone: "+1 (718) 321-7929",
      tags: ["South Asian Food Pantry", "Health Insurance Help", "Senior Programs"],
      badges: ["24/7 AID", "Halal Food Pantry", "Community Organization"],
      features: [
        { label: "Pantry Items", value: "Halal meat, Basmati rice, lentils (Daal), oil, flour" },
        { label: "Health Navigators", value: "Enrollment in Medicaid & Essential Plan" }
      ],
      overview: "Free food bank, halal groceries & community kitchens. Weekly emergency pantry boxes with rice, lentils, cooking oil, and milk for newcomer families."
    },
    {
      title: "Winter Clothing Aid",
      subtitle: "Warm Coats, Boots & Thermals Drive",
      type: "Emergency Rent Relief",
      category: "rent-relief",
      badge: "50% OFF",
      price: "$15 / Free",
      tag: "discounted",
      primaryHighlight: "Warm Winter Wear Distribution",
      image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=700&auto=format&fit=crop&q=80",
      hours: "Mon – Sat: 10:00 AM – 6:00 PM",
      contactPhone: "+1 (718) 555-0133",
      tags: ["Winter Coats", "Boots", "Children Gloves", "New Arrivals Aid"],
      badges: ["50% OFF", "Newcomer Support", "Winter Drive"],
      features: [
        { label: "Items", value: "Brand new heavy winter down jackets & thermal socks" },
        { label: "Cost", value: "Free vouchers for low income; $15 thrift tier" }
      ],
      overview: "Brand new coats, boots & thermals for new immigrant families. Warm winter clothing drives and vouchers for newcomers in need."
    },
    {
      title: "Community Moving Aid",
      subtitle: "Vetted Immigrant Movers & Van Rentals",
      type: "Family Support",
      category: "family-support",
      badge: "JUST IN",
      price: "$40/hr",
      tag: "new",
      primaryHighlight: "Affordable Moving & Van Service",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&auto=format&fit=crop&q=80",
      hours: "7:00 AM – 9:00 PM (Daily)",
      contactPhone: "+1 (718) 555-0149",
      tags: ["Moving Truck", "Furniture Transport", "New Immigrant Friendly"],
      badges: ["JUST IN", "Affordable", "Trusted Community Movers"],
      features: [
        { label: "Van Sizes", value: "Cargo Vans, 10ft & 16ft Box Trucks" },
        { label: "Help", value: "Loading, unloading & furniture assembly" }
      ],
      overview: "Vetted newcomer movers & van rentals across NY/NJ/TX. Budget-friendly moving aid for families relocating to new apartments."
    },
    {
      title: "Queens Community House – Immigrant Services Hub",
      subtitle: "Comprehensive Benefits & Public Aid Assistance",
      type: "Community Social Center",
      category: "social-services",
      badge: "SNAP & RENT",
      price: "Free Help",
      tag: "popular",
      primaryHighlight: "SNAP, Cash & Rental Aid",
      image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=700&auto=format&fit=crop&q=80",
      hours: "Mon – Fri: 9:00 AM – 5:30 PM",
      contactPhone: "+1 (718) 592-5757",
      tags: ["SNAP / Food Stamps", "One-Shot Rental Aid", "HEAP Heating Aid", "Family Counseling"],
      badges: ["Free Social Aid", "Bengali Navigators", "Confidential"],
      features: [
        { label: "SNAP Application", value: "Step-by-step submission & interview preparation" },
        { label: "Eviction Prevention", value: "One-Shot Deal emergency back-rent assistance" },
        { label: "Languages", value: "Bengali, Spanish, Nepali, Tibetan, English" }
      ],
      overview: "Government-accredited community agency helping new immigrant families apply for food stamps (SNAP), emergency rental support, winter utility heating grants (HEAP), and free childcare vouchers."
    },
    {
      title: "Newcomer Household Starter Kits",
      subtitle: "Essential Kitchen & Home Goods Aid",
      type: "Family Support",
      category: "family-support",
      badge: "SAVE 70%",
      price: "$20 / Free",
      tag: "discounted",
      primaryHighlight: "Complete Kitchen & Bedding Kit",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=700&auto=format&fit=crop&q=80",
      hours: "10:00 AM – 5:00 PM",
      contactPhone: "+1 (718) 555-0155",
      tags: ["Kitchenware", "Blankets", "Starter Box", "New Immigrants"],
      badges: ["SAVE 70%", "Community Donated", "Household Aid"],
      features: [
        { label: "Kit Contents", value: "Cookware, plates, cutlery, bedsheets, blankets" },
        { label: "Voucher", value: "Free for asylum seekers with case number" }
      ],
      overview: "Community donation drive furnishing newly arrived immigrant households with essential cooking pots, pans, dish sets, and winter bedding."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 7. GAS & EV CHARGING STATIONS ────────────────────────────────────────────
export function generateGasEVListings(lat: number, lng: number, area = "Astoria", city = "Queens"): ServiceListing[] {
  const templates = [
    {
      title: "Gas & EV Station Finder",
      subtitle: "Live Petrol Prices & High-Speed EV Portal",
      type: "Gas & EV Station",
      category: "cheap-gas",
      badge: "JUST IN",
      price: "Live Rates",
      tag: "new",
      primaryHighlight: "Live Lowest Fuel Rates",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=700&auto=format&fit=crop&q=80",
      hours: "Open 24 Hours",
      contactPhone: "+1 (718) 278-4500",
      tags: ["24/7 Gas", "Tesla Supercharger", "Live Prices", "EV Fast Charging"],
      badges: ["JUST IN", "24/7 Open", "Live Petrol Rates"],
      features: [
        { label: "Regular Cash", value: "$3.15/gal (Lowest in neighborhood)" },
        { label: "EV Plugs", value: "8x 250kW Supercharger + 4x CCS Ports" }
      ],
      overview: "Live cheap petrol prices & EV charging stations near zip. Compare regular, diesel and rapid electric charging station rates in real time."
    },
    {
      title: "Mobil Express & Tesla Supercharger",
      subtitle: "24-Hour Fuel & High-Speed EV Hub",
      type: "Gas & EV Station",
      category: "gas-ev",
      badge: "TOP EV",
      price: "$3.19/gal",
      tag: "popular",
      primaryHighlight: "Regular: $3.19/gal • 250kW EV",
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&auto=format&fit=crop&q=80",
      hours: "Open 24 Hours (7 Days)",
      contactPhone: "+1 (718) 278-4500",
      tags: ["24/7 Gas", "Tesla Supercharger", "Air & Vacuum", "Deli & Coffee"],
      badges: ["Cheap Fuel", "24/7 Open", "EV Fast Charging"],
      features: [
        { label: "Gas Prices", value: "Reg: $3.19 | Mid: $3.49 | Prem: $3.79 | Diesel: $3.89" },
        { label: "EV Chargers", value: "8x 250kW Tesla Superchargers + 4x CCS Fast Plugs" },
        { label: "Amenities", value: "24h Convenience Store, Free Tire Air with Fuel, ATM" }
      ],
      overview: "Clean, illuminated 24-hour service station with competitive gas prices, modern EV fast charging bays, touchless car wash, tire air pump, and hot halal coffee/snacks."
    },
    {
      title: "Discount Petrol & Soft Car Wash",
      subtitle: "Full Service Gas, Diesel & Auto Wash",
      type: "Gas Station",
      category: "cheap-gas",
      badge: "SAVE $0.20",
      price: "$3.15/gal",
      tag: "discounted",
      primaryHighlight: "Regular: $3.15/gal • EVgo 150kW",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=700&auto=format&fit=crop&q=80",
      hours: "Open 24 Hours",
      contactPhone: "+1 (718) 726-1200",
      tags: ["Lowest Price", "EVgo Charging", "Car Wash", "Pay at Pump"],
      badges: ["SAVE $0.20", "Top Value Gas", "Car Wash"],
      features: [
        { label: "Prices", value: "Regular: $3.15 cash | Diesel: $3.85" },
        { label: "EVgo Station", value: "CCS & CHAdeMO fast charging (20 min to 80%)" }
      ],
      overview: "High-volume station with great cash discount pricing on unleaded gasoline, dual EVgo charging pedestals, and automatic soft-cloth car wash tunnel."
    },
    {
      title: "BP Connect & 150kW Fast EV Charger",
      subtitle: "Discount Gas, Diesel & EV Fast Plugs",
      type: "Fuel & EV Charging",
      category: "gas-ev",
      badge: "15¢ OFF",
      price: "$3.12/gal",
      tag: "discounted",
      primaryHighlight: "15¢/gal App Cash Discount",
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&auto=format&fit=crop&q=80",
      hours: "Open 24 Hours (7 Days)",
      contactPhone: "+1 (718) 726-8800",
      tags: ["Cheap Gas", "EV Fast Charging", "24/7 Mart", "Pay In App"],
      badges: ["15¢ OFF", "24/7 Open", "Cash Discount"],
      features: [
        { label: "Fuel Price", value: "Regular: $3.12 cash | Diesel: $3.79" },
        { label: "EV Hub", value: "4x 150kW CCS Fast Chargers" }
      ],
      overview: "Well-lit 24-hour service station with generous cash discounts on fuel, rapid electric vehicle charging pedestals, and convenient convenience store."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 8. SPORTS & COMMUNITY GROUNDS ─────────────────────────────────────────────
export function generateSportsListings(lat: number, lng: number, area = "Flushing", city = "Queens"): ServiceListing[] {
  const templates = [
    {
      title: "Immigrant Cricket League",
      subtitle: "NYC Weekend Tape & Leather Tournament",
      type: "Cricket Leagues",
      category: "cricket-league",
      badge: "TOP LEAGUE",
      price: "Free Entry",
      tag: "popular",
      primaryHighlight: "6 Turf Pitches • Free Access",
      image: "https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=700&auto=format&fit=crop&q=80",
      hours: "Weekend Matches: 8:00 AM – 7:00 PM",
      contactPhone: "+1 (718) 760-6565",
      tags: ["Cricket Pitch", "Tape Ball Leagues", "Night Floodlights"],
      badges: ["TOP LEAGUE", "Free Entry", "Trophies"],
      features: [
        { label: "Teams", value: "32 Community Clubs from NY, NJ, CT" },
        { label: "Pitches", value: "Standard 22-yard turf and synthetic pitches" }
      ],
      overview: "Weekend leather & tape-ball cricket tournaments with trophies and community gatherings across Flushing Meadows and Baisley Pond Park."
    },
    {
      title: "Community Youth Soccer Club",
      subtitle: "Free Coaching & Weekend Leagues",
      type: "Soccer & Football",
      category: "soccer",
      badge: "NEW 2026",
      price: "Free Aid",
      tag: "new",
      primaryHighlight: "Free Youth Coaching & Equipment",
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=700&auto=format&fit=crop&q=80",
      hours: "Sat & Sun: 9:00 AM – 5:00 PM",
      contactPhone: "+1 (718) 555-0177",
      tags: ["Youth Soccer", "Free Uniforms", "Certified Coaches"],
      badges: ["NEW 2026", "Free Coaching", "Youth League"],
      features: [
        { label: "Ages", value: "Boys & Girls ages 6 to 17" },
        { label: "Gear", value: "Free soccer cleats, jerseys and shin guards provided" }
      ],
      overview: "Free youth football coaching, turf access & equipment. Certified coaches providing weekend training sessions for newcomer children."
    },
    {
      title: "Queens Badminton & Indoor Sports Arena",
      subtitle: "Indoor Air-Conditioned Courts & Gym",
      type: "Indoor Arena",
      category: "sports",
      badge: "POPULAR",
      price: "$20/hr",
      tag: "discounted",
      primaryHighlight: "8 Professional Yonex Courts",
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=700&auto=format&fit=crop&q=80",
      hours: "7:00 AM – 11:30 PM (Daily)",
      contactPhone: "+1 (718) 888-2345",
      tags: ["Badminton", "Table Tennis", "Coaching", "Equipment Rental"],
      badges: ["POPULAR", "Air Conditioned", "Pro Courts"],
      features: [
        { label: "Courts", value: "8 Matched Olympic-standard Taraflex Badminton Courts" },
        { label: "Pricing", value: "$20/hour per court; student and senior discount" }
      ],
      overview: "Modern indoor facility designed for year-round sports regardless of winter weather. Offers professional badminton courts, table tennis tables, racket stringing, and evening community leagues."
    },
    {
      title: "NYC Desi Volleyball & Table Tennis Club",
      subtitle: "Indoor Community Sports & Tournaments",
      type: "Indoor Sports",
      category: "sports",
      badge: "50% OFF",
      price: "$5 Entry",
      tag: "discounted",
      primaryHighlight: "50% Off Newcomer Day Pass",
      image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=700&auto=format&fit=crop&q=80",
      hours: "Mon – Sun: 10:00 AM – 10:00 PM",
      contactPhone: "+1 (718) 555-0192",
      tags: ["Volleyball", "Table Tennis", "Community Tournament", "Free Coaching"],
      badges: ["50% OFF", "Indoor Arena", "Family Friendly"],
      features: [
        { label: "Day Pass", value: "$5 entry with full racket & ball rental" },
        { label: "Leagues", value: "Weekend friendly tournaments with medals" }
      ],
      overview: "Vibrant community indoor recreation center featuring table tennis tables, volleyball courts, carrom boards, and youth sports clinics."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── HELPER: MAP TEMPLATES TO LAT/LNG OFFSETS ──────────────────────────────────
function generateMappedListings(
  centerLat: number,
  centerLng: number,
  areaName: string,
  cityName: string,
  templates: any[]
): ServiceListing[] {
  const offsets = [
    { dLat: 0.0035, dLng: 0.0042 },
    { dLat: -0.0048, dLng: 0.0031 },
    { dLat: 0.0062, dLng: -0.0051 },
    { dLat: -0.0028, dLng: -0.0045 },
    { dLat: 0.0085, dLng: 0.0068 },
    { dLat: -0.0072, dLng: 0.0089 },
    { dLat: 0.0105, dLng: -0.0082 },
    { dLat: -0.0118, dLng: -0.0065 },
  ];

  return templates.map((tmpl, idx) => {
    const offset = offsets[idx % offsets.length];
    const itemLat = centerLat + offset.dLat;
    const itemLng = centerLng + offset.dLng;
    const distKm = getDistanceKm(centerLat, centerLng, itemLat, itemLng);

    return {
      id: `svc-${tmpl.category || "item"}-${idx + 1}`,
      title: tmpl.title,
      subtitle: tmpl.subtitle,
      type: tmpl.type,
      category: tmpl.category,
      distance: formatDistance(distKm),
      distanceKm: distKm,
      lat: itemLat,
      lng: itemLng,
      location: `${areaName}, ${cityName}`,
      address: `${100 + idx * 24} Broadway, ${areaName}, NY`,
      rating: 4.6 + (idx % 4) * 0.1,
      reviews: 120 + idx * 85,
      verified: true,
      image: tmpl.image,
      contactPhone: tmpl.contactPhone || "+1 (718) 555-0199",
      hours: tmpl.hours || "Open Daily",
      website: tmpl.website || "https://immigrantconnect.org",
      primaryHighlight: tmpl.primaryHighlight,
      price: tmpl.price || tmpl.primaryHighlight,
      badge: tmpl.badge || tmpl.badges?.[0] || tmpl.type,
      tag: tmpl.tag || (idx % 3 === 0 ? "discounted" : idx % 3 === 1 ? "new" : "popular"),
      tags: tmpl.tags || [],
      badges: tmpl.badges || [],
      features: tmpl.features || [],
      overview: tmpl.overview || ""
    };
  });
}
