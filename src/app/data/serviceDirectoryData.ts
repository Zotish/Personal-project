// ─── SERVICE DIRECTORY DATA & REALISTIC GENERATORS ───────────────────────────
// For all services in Bangladesh (Dhaka default centered with BariKoi maps)

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
  primaryHighlight: string;
  price?: string;
  badge?: string;
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

// ─── 1. HALAL FOOD & RESTAURANTS ──────────────────────────────────────────────
export function generateHalalFoodListings(lat: number, lng: number, area = "Gulshan", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "Kacchi Bhai – Special Basmati Kacchi",
      subtitle: "Authentic Dum Biryani, Borhani & Firni",
      type: "Restaurant",
      category: "restaurant",
      badge: "TOP #1",
      price: "৳ 450",
      tag: "popular",
      primaryHighlight: "Famous Basmati Kacchi",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80",
      hours: "11:30 AM – 11:00 PM (Daily)",
      contactPhone: "+880 1711-234567",
      address: `Road 11, Block D, ${area}, ${city}`,
      tags: ["Kacchi Biryani", "Borhani", "Beef Rezala", "Zabihah Halal"],
      badges: ["100% Halal", "Top Rated", "Dine-in & Delivery"],
      features: [
        { label: "Specialty", value: "Premium Basmati Rice & Tender Mutton" },
        { label: "Borhani", value: "Traditional spicy curd borhani included" },
        { label: "Delivery", value: "Foodi, Pathao Food & In-house delivery" }
      ],
      overview: "One of Dhaka's most loved kacchi destinations, serving fragrant basmati rice slow-cooked with tender marinated mutton cuts, aloo bukhara, and golden potatoes."
    },
    {
      title: "Sultan's Dine – Kacchi Platter",
      subtitle: "Royal Kacchi Feast & Traditional Jorda",
      type: "Restaurant",
      category: "restaurant",
      badge: "POPULAR",
      price: "৳ 490",
      tag: "popular",
      primaryHighlight: "Royal Kacchi Platter",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&auto=format&fit=crop&q=80",
      hours: "12:00 PM – 10:30 PM",
      contactPhone: "+880 1722-345678",
      address: `Green Akshay Plaza, Satmasjid Road, ${area}, ${city}`,
      tags: ["Kacchi Platter", "Jorda", "Chicken Roast", "Family Hall"],
      badges: ["Royal Feast", "Top Choice", "Dine-in"],
      features: [
        { label: "Platter", value: "Mutton Kacchi + Chicken Roast + Borhani + Jorda" },
        { label: "Ambience", value: "Spacious air-conditioned family seating" },
        { label: "Catering", value: "Bulk orders for parties and family programs" }
      ],
      overview: "Renowned royal dining experience offering signature mutton kacchi platters with rich chicken roast, creamy borhani, and traditional sweet jorda."
    },
    {
      title: "Star Kabab & Restaurant",
      subtitle: "Legendary Mutton Leg Roast, Nehari & Naan",
      type: "Desi Kitchen",
      category: "desi-kitchen",
      badge: "LEGENDARY",
      price: "৳ 220 - ৳ 650",
      tag: "popular",
      primaryHighlight: "Authentic Star Kabab",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=700&auto=format&fit=crop&q=80",
      hours: "6:30 AM – 11:30 PM (Breakfast to Dinner)",
      contactPhone: "+880 1733-456789",
      address: `House 42, Road 11, ${area}, ${city}`,
      tags: ["Mutton Kebab", "Nehari", "Khichuri", "Tandoori Naan"],
      badges: ["Dhaka Icon", "Breakfast Khichuri", "Halal"],
      features: [
        { label: "Breakfast", value: "Morning Khichuri, Nehari, Payaza & Faluda" },
        { label: "Dinner", value: "Boti Kabab, Sheekh, Tikka & Butter Naan" },
        { label: "Seating", value: "Multi-floor family and AC dining" }
      ],
      overview: "A timeless Dhaka culinary landmark serving sizzling seekh kebabs, clay-oven garlic naans, legendary mutton leg roast, and fresh faluda."
    },
    {
      title: "Deshi Kitchen Daily Tiffin",
      subtitle: "Homestyle Bangladeshi Lunch & Dinner Subscription",
      type: "Home Kitchen",
      category: "desi-kitchen",
      badge: "NEW KITCHEN",
      price: "৳ 4,500/mo",
      tag: "new",
      primaryHighlight: "৳4,500/Month Tiffin (Lunch+Dinner)",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80",
      hours: "8:00 AM – 9:00 PM",
      contactPhone: "+880 1819-123456",
      address: `Road 4, Sector 7, ${area}, ${city}`,
      tags: ["Monthly Tiffin", "Fish Curry", "Bhorta", "Low Oil"],
      badges: ["Home Cooked", "Nutritious", "Doorstep Delivery"],
      features: [
        { label: "Menu", value: "Rice, Dal, 2 Bhortas, Rui/Katla Fish or Beef" },
        { label: "Health", value: "Cooked with mustard/rice bran oil, no MSG" },
        { label: "Coverage", value: "Gulshan, Banani, Dhanmondi, Uttara & Mirpur" }
      ],
      overview: "Nutritious home-cooked daily meal service for office professionals, students, and bachelor residents with hot doorstep delivery every lunch and dinner."
    },
    {
      title: "Bonoful Sweets & Confectionery",
      subtitle: "Fresh Singara, Kalojam & Traditional Pitha",
      type: "Bakery & Sweets",
      category: "sweets-bakery",
      badge: "POPULAR",
      price: "৳ 20 - ৳ 450",
      tag: "popular",
      primaryHighlight: "Hot Singara & Mishti",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=700&auto=format&fit=crop&q=80",
      hours: "7:00 AM – 10:30 PM",
      contactPhone: "+880 1744-567890",
      address: `Plot 18, Block B, ${area}, ${city}`,
      tags: ["Hot Singara", "Kalojam", "Rasgulla", "Chai"],
      badges: ["Traditional Sweets", "Freshly Baked", "Tea Stall"],
      features: [
        { label: "Breakfast", value: "Hot Paratha, Dal, Halwa & Milk Tea" },
        { label: "Snacks", value: "Crispy beef & vegetable singaras" },
        { label: "Sweets Counter", value: "30+ varieties of authentic Bengali mishti" }
      ],
      overview: "Neighborhood bakery and confectionery famous for crisp tea-time singaras, freshly fried jalebis, chomchom, and sweet Bogura curd."
    },
    {
      title: "Dhaka Fried Chicken & Wings",
      subtitle: "Halal Crispy Naga Wings & Smash Burgers",
      type: "Fast Food",
      category: "fast-food",
      badge: "৳ 299 DEAL",
      price: "৳ 299",
      tag: "discounted",
      primaryHighlight: "৳299 Combo Meal",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80",
      hours: "11:00 AM – 2:00 AM",
      contactPhone: "+880 1755-678901",
      address: `Road 27, Dhanmondi / ${area}, ${city}`,
      tags: ["Naga Wings", "Crispy Chicken", "Smash Burger", "Loaded Fries"],
      badges: ["100% Halal", "Late Night", "Spicy Naga"],
      features: [
        { label: "Specialty", value: "Ghost Pepper Naga wings & garlic dip" },
        { label: "Burger", value: "Double beef patty with melted cheese" },
        { label: "Late Night", value: "Open till 2:00 AM on weekends" }
      ],
      overview: "Hot and spicy Dhaka-style fried chicken, loaded fries, and juicy smash burgers served with house-made naga chili sauce."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 2. LEGAL AID & ADVOCACY ───────────────────────────────────────────────────
export function generateLegalAidListings(lat: number, lng: number, area = "Kakrail", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "BLAST – Bangladesh Legal Aid and Services Trust",
      subtitle: "National Pro Bono Legal Aid & Rights Advocacy",
      type: "Legal Aid NGO",
      category: "free-aid",
      badge: "PRO BONO",
      price: "Free Aid",
      tag: "popular",
      primaryHighlight: "100% Free / Pro Bono",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=700&auto=format&fit=crop&q=80",
      hours: "Sun – Thu: 9:00 AM – 5:00 PM",
      contactPhone: "+880 2-8313650",
      address: `1/1 Pioneer Road, Kakrail, ${city}`,
      tags: ["Free Legal Aid", "Worker Rights", "Tenancy Disputes", "Family Law"],
      badges: ["Non-Profit", "Bar Association Partner", "Free Consultation"],
      features: [
        { label: "Services", value: "Civil, Criminal, Family & Human Rights Assistance" },
        { label: "Cost", value: "Completely free for low-income citizens" },
        { label: "Lawyers", value: "Over 500 panel lawyers across Bangladesh" }
      ],
      overview: "The largest specialized legal services non-governmental organization in Bangladesh providing free legal representation, advice, and mediation."
    },
    {
      title: "Ain o Salish Kendra (ASK)",
      subtitle: "Legal Aid & Human Rights Documentation Center",
      type: "Human Rights & Legal",
      category: "free-aid",
      badge: "TOP AID",
      price: "Free",
      tag: "popular",
      primaryHighlight: "Free Legal Advocacy",
      image: "https://images.unsplash.com/photo-1453733197781-79b8a8b16c14?w=700&auto=format&fit=crop&q=80",
      hours: "Sun – Thu: 9:30 AM – 5:30 PM",
      contactPhone: "+880 2-8126047",
      address: `2/16 Block B, Lalmatia, ${city}`,
      tags: ["Labor Rights", "Gender Justice", "Free Counseling", "Litigation Support"],
      badges: ["Human Rights", "Free Clinic", "Court Representation"],
      features: [
        { label: "Focus", value: "Women rights, child welfare, migrant worker support" },
        { label: "Mediation", value: "Alternative dispute resolution (ADR)" }
      ],
      overview: "A national legal aid and human rights organization committed to providing free legal advice, court counseling, and community advocacy."
    },
    {
      title: "Supreme Court Legal Aid Committee",
      subtitle: "Government Free Legal Support at Apex Court",
      type: "Government Legal Aid",
      category: "free-aid",
      badge: "GOVT AID",
      price: "Government Free",
      tag: "popular",
      primaryHighlight: "Supreme Court Representation",
      image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=700&auto=format&fit=crop&q=80",
      hours: "Sun – Thu: 9:00 AM – 4:30 PM",
      contactPhone: "+880 2-9562844",
      address: `Supreme Court Compound, Ramna, ${city}`,
      tags: ["High Court Division", "Appellate Division", "Bail Petitions", "Writ"],
      badges: ["National Legal Aid", "Supreme Court", "100% Free"],
      features: [
        { label: "Coverage", value: "High Court Division & Appellate Division legal aid" },
        { label: "Eligibility", value: "Low-income citizens, distressed workers & prisoners" }
      ],
      overview: "Official Government of Bangladesh legal aid committee providing free advocate representation before the High Court and Appellate divisions."
    },
    {
      title: "BNWLA Legal Assistance Desk",
      subtitle: "Bangladesh National Woman Lawyers' Association",
      type: "Advocacy & Support",
      category: "free-aid",
      badge: "SPECIALIZED",
      price: "Free",
      tag: "new",
      primaryHighlight: "Shelter & Legal Counseling",
      image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=700&auto=format&fit=crop&q=80",
      hours: "Sun – Thu: 9:00 AM – 5:00 PM",
      contactPhone: "+880 2-9122394",
      address: `Agargaon / Sher-e-Bangla Nagar, ${city}`,
      tags: ["Family Court", "Maintenance", "Shelter Support", "Counseling"],
      badges: ["Women Empowerment", "Legal Clinic", "Hotline 24/7"],
      features: [
        { label: "Hotline", value: "Dedicated 24/7 emergency legal helpline" },
        { label: "Counseling", value: "Psychosocial support alongside legal filing" }
      ],
      overview: "Pioneering organization dedicated to creating equal rights and legal empowerment through free legal clinics, crisis intervention, and advocacy."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 3. HOSPITALS & HEALTHCARE ────────────────────────────────────────────────
export function generateHospitalListings(lat: number, lng: number, area = "Panthapath", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "Square Hospital Dhaka",
      subtitle: "Tertiary Care Hospital & 24/7 Emergency Center",
      type: "Tertiary Hospital",
      category: "emergency-247",
      badge: "24/7 ER",
      price: "Inpatient / OPD",
      tag: "popular",
      primaryHighlight: "International Standard Emergency",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=700&auto=format&fit=crop&q=80",
      hours: "Emergency: 24/7 Open | OPD: 8:00 AM – 10:00 PM",
      contactPhone: "+880 2-8159457",
      address: `18/F Bir Uttam Qazi Nuruzzaman Sarak, Panthapath, ${city}`,
      tags: ["24/7 Emergency", "Cardiology", "Trauma Care", "ICU / CCU", "Cath Lab"],
      badges: ["JCI Standard", "24/7 Trauma", "Ambulance 10616"],
      features: [
        { label: "Emergency Hotline", value: "10616 — 24/7 Rapid ambulance service" },
        { label: "Departments", value: "Cardiology, Oncology, Neurology, Orthopedics" },
        { label: "Diagnostic", value: "Modern MRI, CT, Pathology & 24/7 Blood Bank" }
      ],
      overview: "One of the most advanced private healthcare hospitals in Bangladesh with world-class medical infrastructure, rapid response emergency trauma care, and specialist clinics."
    },
    {
      title: "United Hospital Limited",
      subtitle: "Multispecialty Healthcare & Cardiac Center",
      type: "Private Hospital",
      category: "community-hospital",
      badge: "TOP HOSPITAL",
      price: "Inpatient / OPD",
      tag: "popular",
      primaryHighlight: "Premier Cardiac & Stroke Care",
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=700&auto=format&fit=crop&q=80",
      hours: "24 Hours Emergency Service",
      contactPhone: "+880 2-8836444",
      address: `Plot 15, Road 71, Gulshan 2, ${city}`,
      tags: ["Cardiac Center", "Neurology", "ICU", "Dialysis", "Emergency"],
      badges: ["Premier Care", "Gulshan 2", "Hotline 10666"],
      features: [
        { label: "Cardiac Unit", value: "Pioneering bypass surgery & coronary stenting" },
        { label: "Emergency", value: "Equipped with cardiac monitors & life support ICU" }
      ],
      overview: "Leading multidisciplinary super-specialty hospital located in Gulshan 2, renowned for state-of-the-art cardiology, renal care, and intensive therapy units."
    },
    {
      title: "Evercare Hospital Dhaka",
      subtitle: "JCI Accredited Multispecialty Hospital",
      type: "Super Specialty",
      category: "community-hospital",
      badge: "JCI ACCREDITED",
      price: "Comprehensive",
      tag: "popular",
      primaryHighlight: "JCI Accredited Facility",
      image: "https://images.unsplash.com/photo-1588776814546-1ffbb4b45c5b?w=700&auto=format&fit=crop&q=80",
      hours: "Emergency Room: 24/7 Open",
      contactPhone: "+880 2-8431661",
      address: `Plot 81, Block E, Bashundhara R/A, ${city}`,
      tags: ["JCI Accredited", "Transplant Unit", "Pediatrics", "Oncology"],
      badges: ["Accredited", "Bashundhara", "Hotline 10678"],
      features: [
        { label: "Accreditation", value: "Joint Commission International (JCI) Certified" },
        { label: "Transplant", value: "Renal and bone marrow transplant centers" }
      ],
      overview: "Comprehensive 425-bed tertiary care super-specialty hospital with state-of-the-art facilities, multidisciplinary specialist boards, and dedicated 24-hour trauma units."
    },
    {
      title: "Dhaka Medical College & Hospital (DMCH)",
      subtitle: "Government Apex Hospital & Emergency Center",
      type: "Public Hospital",
      category: "emergency-247",
      badge: "PUBLIC APEX",
      price: "Nominal / Free",
      tag: "popular",
      primaryHighlight: "Govt Subsidized / Free Care",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=700&auto=format&fit=crop&q=80",
      hours: "24 Hours Emergency (365 Days)",
      contactPhone: "+880 2-55165088",
      address: `Secretariat / Bakshibazar, Ramna, ${city}`,
      tags: ["Burn & Plastic", "Trauma", "Free Treatment", "Medical College"],
      badges: ["National Apex", "Low Cost", "Open 24/7"],
      features: [
        { label: "Emergency", value: "Highest volume trauma and emergency unit in South Asia" },
        { label: "Affordability", value: "Subsidized government treatment for all citizens" }
      ],
      overview: "The historic apex public hospital of Bangladesh, providing round-the-clock emergency medical services, trauma surgery, and affordable specialized treatment."
    },
    {
      title: "Labaid Specialized Hospital",
      subtitle: "Cardiovascular, Gastro & Diagnostic Center",
      type: "Specialized Hospital",
      category: "walk-in-clinic",
      badge: "POPULAR",
      price: "OPD & Diagnostics",
      tag: "discounted",
      primaryHighlight: "Fast Diagnostic & OPD",
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=700&auto=format&fit=crop&q=80",
      hours: "7:00 AM – 11:00 PM (Emergency 24/7)",
      contactPhone: "+880 1711-006633",
      address: `House 6, Road 4, Dhanmondi, ${city}`,
      tags: ["Cardiac OPD", "Endoscopy", "Ultrasound", "Dhanmondi"],
      badges: ["Labaid Care", "Dhanmondi", "Hotline 10606"],
      features: [
        { label: "Gastroenterology", value: "Advanced endoscopy and colonoscopy suites" },
        { label: "Diagnostics", value: "Same-day routine and specialized laboratory tests" }
      ],
      overview: "Prestigious center situated on Dhanmondi Road 4, famous for cardiac interventions, endoscopy, expert outpatient consultations, and accurate diagnostics."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 4. PHARMACIES & DISPENSARIES ─────────────────────────────────────────────
export function generatePharmacyListings(lat: number, lng: number, area = "Kalabagan", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "Lazz Pharma – Kalabagan (24 Hours)",
      subtitle: "Bangladesh's Largest 24-Hour Retail Pharmacy",
      type: "24/7 Pharmacy",
      category: "24-hours",
      badge: "OPEN 24/7",
      price: "MRP / Discount",
      tag: "popular",
      primaryHighlight: "24/7 Genuine Medicines",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop&q=80",
      hours: "Open 24 Hours (365 Days)",
      contactPhone: "+880 2-9118021",
      address: `64/3 Lake Circus, Kalabagan, Mirpur Road, ${city}`,
      tags: ["Open 24h", "Prescription Drugs", "Cold Chain Insulin", "Emergency"],
      badges: ["100% Genuine", "Open 24/7", "Home Delivery"],
      features: [
        { label: "Availability", value: "Rare life-saving cancer & cardiac drugs" },
        { label: "Quality", value: "Temperature controlled refrigeration for insulin & vaccines" },
        { label: "Home Delivery", value: "Emergency delivery across Dhaka city" }
      ],
      overview: "The most trusted 24-hour retail pharmacy in Bangladesh, guaranteeing 100% authentic pharmaceuticals, vaccines, surgical items, and diabetes care."
    },
    {
      title: "Tashfi Pharmacy & Healthcare",
      subtitle: "Gulshan Circle Pharmacy & Medical Supplies",
      type: "Retail Pharmacy",
      category: "retail-pharmacy",
      badge: "VERIFIED",
      price: "Govt MRP",
      tag: "popular",
      primaryHighlight: "Gulshan 1 Drug Store",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=700&auto=format&fit=crop&q=80",
      hours: "8:00 AM – 12:00 Midnight",
      contactPhone: "+880 1711-889900",
      address: `Gulshan 1 DDC Market, Gulshan Avenue, ${city}`,
      tags: ["Imported OTC", "Baby Nutrition", "Surgical Goods", "Free BP Check"],
      badges: ["Gulshan Area", "Certified Pharmacist", "Cash & Card"],
      features: [
        { label: "Pharmacist", value: "Graduate 'A' Grade Pharmacist on duty" },
        { label: "Payment", value: "bKash, Nagad, Credit Cards & Cash" }
      ],
      overview: "Full-service pharmacy located at Gulshan 1, providing complete prescription medicines, medical grade masks, nebulizers, and maternal health products."
    },
    {
      title: "Tamanna Pharmacy Dhanmondi",
      subtitle: "Dhanmondi Central Neighborhood Pharmacy",
      type: "Discount Pharmacy",
      category: "discount-pharmacy",
      badge: "DISCOUNT",
      price: "Up to 10% Off",
      tag: "discounted",
      primaryHighlight: "10% Discount on Prescriptions",
      image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=700&auto=format&fit=crop&q=80",
      hours: "8:00 AM – 11:30 PM",
      contactPhone: "+880 1722-112233",
      address: `Road 7, Dhanmondi R/A, ${city}`,
      tags: ["Prescription Discount", "Diabetes Care", "Blood Pressure", "Home Delivery"],
      badges: ["Discount Card", "Fast Counter", "Genuine"],
      features: [
        { label: "Discount", value: "Flat 7% to 10% discount on regular chronic medicines" },
        { label: "Consultation", value: "Free blood glucose & blood pressure checkup" }
      ],
      overview: "Community pharmacy serving Dhanmondi residents with discounted monthly medicine packs for elderly patients, hypertension, and diabetes management."
    },
    {
      title: "Green Life Hospital Pharmacy",
      subtitle: "24 Hours Hospital In-house Pharmacy",
      type: "Hospital Pharmacy",
      category: "24-hours",
      badge: "OPEN 24/7",
      price: "MRP",
      tag: "new",
      primaryHighlight: "Green Road 24h Counter",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop&q=80",
      hours: "24 Hours (Daily)",
      contactPhone: "+880 2-9612345",
      address: `32 Green Road, Dhanmondi, ${city}`,
      tags: ["Hospital Supply", "Emergency Injections", "IV Fluids", "24/7"],
      badges: ["Hospital Counter", "24 Hours", "Emergency"],
      features: [
        { label: "Emergency Stocks", value: "Saline, IV cannulas, critical cardiac injections" }
      ],
      overview: "Reliable 24-hour pharmacy situated on Green Road, ensuring prompt availability of emergency drugs, baby formula, and critical care essentials."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 5. FREE MEDICINE & COMMUNITY AID ─────────────────────────────────────────
export function generateFreeMedicineListings(lat: number, lng: number, area = "Moghbazar", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "Red Crescent Bangladesh Free Medical Clinic",
      subtitle: "Free Essential Medicines & Primary Health Care",
      type: "Charity Health Clinic",
      category: "free-medicine",
      badge: "100% FREE",
      price: "Free Aid",
      tag: "popular",
      primaryHighlight: "100% Free Prescription Aid",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop&q=80",
      hours: "Sun – Thu: 9:00 AM – 3:30 PM",
      contactPhone: "+880 2-9330188",
      address: `684-686 Bara Moghbazar, ${city}`,
      tags: ["Free Medicine", "Disaster Aid", "Red Crescent", "Antibiotics", "Vitamins"],
      badges: ["Humanitarian", "Free Dispensary", "Community Health"],
      features: [
        { label: "Eligibility", value: "Free for low-income, rickshaw pullers & laborers" },
        { label: "Supplies", value: "Antibiotics, oral rehydration, fever & chronic drugs" }
      ],
      overview: "Bangladesh Red Crescent Society's urban health dispensary providing free doctor checkups and complimentary prescription pharmaceuticals."
    },
    {
      title: "Anjuman Mufidul Islam Free Dispensary",
      subtitle: "Humanitarian Medical Relief & Free Medicines",
      type: "Community Dispensary",
      category: "free-medicine",
      badge: "FREE AID",
      price: "Free",
      tag: "popular",
      primaryHighlight: "Charity Medicine Dispenser",
      image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=700&auto=format&fit=crop&q=80",
      hours: "Sat – Thu: 9:00 AM – 4:00 PM",
      contactPhone: "+880 2-9334003",
      address: `Anjuman Bhaban, Kakrail, ${city}`,
      tags: ["Free Clinic", "Elderly Care", "Charity", "Essential Drugs"],
      badges: ["Historic Charity", "Free Health", "Non-Profit"],
      features: [
        { label: "Services", value: "Outpatient primary doctor checkup and free medicine issue" },
        { label: "Community", value: "Serving underprivileged urban families since 1905" }
      ],
      overview: "Historic charitable welfare organization providing free healthcare checkups and dispensing free essential daily medicines to underprivileged families."
    },
    {
      title: "BIRDEM Free Diabetes & Insulin Program",
      subtitle: "Subsidized & Free Insulin for Low-Income Patients",
      type: "Insulin Assistance",
      category: "insulin-aid",
      badge: "INSULIN AID",
      price: "Subsidized / Free",
      tag: "popular",
      primaryHighlight: "Free & Subsidized Insulin",
      image: "https://images.unsplash.com/photo-1588776814546-1ffbb4b45c5b?w=700&auto=format&fit=crop&q=80",
      hours: "Sun – Thu: 8:00 AM – 2:00 PM",
      contactPhone: "+880 2-9661551",
      address: `122 Kazi Nazrul Islam Avenue, Shahbagh, ${city}`,
      tags: ["Insulin Aid", "Diabetes Care", "Glucose Strips", "Shahbagh"],
      badges: ["BIRDEM", "Subsidized", "Registered Patients"],
      features: [
        { label: "Registration", value: "BADAS subsidized registration card holders" },
        { label: "Package", value: "Regular monthly insulin vials and syringe supplies" }
      ],
      overview: "Diabetic Association of Bangladesh (BADAS) social welfare wing supplying free and heavily subsidized insulin to registered low-income patients."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 6. SOCIAL AID & COMMUNITY SUPPORT ────────────────────────────────────────
export function generateSocialAidListings(lat: number, lng: number, area = "Mohakhali", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "BRAC Urban Development & Social Support Center",
      subtitle: "Community Empowerment, Micro-grants & Skills Training",
      type: "Social Aid NGO",
      category: "social-services",
      badge: "GLOBAL NGO",
      price: "Free Community Aid",
      tag: "popular",
      primaryHighlight: "World's #1 Social Organization",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=700&auto=format&fit=crop&q=80",
      hours: "Sun – Thu: 9:00 AM – 5:00 PM",
      contactPhone: "+880 2-222281265",
      address: `BRAC Centre, 75 Mohakhali, ${city}`,
      tags: ["Skills Training", "Micro-loans", "Women Empowerment", "Legal Aid"],
      badges: ["BRAC", "Community First", "Empowerment"],
      features: [
        { label: "Programs", value: "Ultra-poor graduation, skill development, microfinance" },
        { label: "Support", value: "Assistance for migrant families and informal sector workers" }
      ],
      overview: "Flagship social development hub offering vocational education, emergency cash assistance, women's empowerment initiatives, and youth entrepreneurship guidance."
    },
    {
      title: "Dhaka Ahsania Mission Welfare Desk",
      subtitle: "Humanitarian Relief, Vocational Aid & Drug Rehab",
      type: "Social Welfare",
      category: "social-services",
      badge: "COMMUNITY AID",
      price: "Free Assistance",
      tag: "popular",
      primaryHighlight: "Community Welfare & Relief",
      image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=700&auto=format&fit=crop&q=80",
      hours: "Sat – Thu: 9:00 AM – 5:00 PM",
      contactPhone: "+880 2-8119521",
      address: `House 19, Road 12, Dhanmondi R/A, ${city}`,
      tags: ["Disaster Relief", "Education Stipends", "Vocational Training", "Shelter"],
      badges: ["Ahsania Mission", "Youth Aid", "Non-Profit"],
      features: [
        { label: "Education", value: "Stipends and textbook support for underprivileged youth" },
        { label: "Skill Centers", value: "Tailoring, computer literacy, electrical training" }
      ],
      overview: "Renowned social welfare organization running education support, emergency relief distribution, and free vocational trade training programs."
    },
    {
      title: "Al-Markazul Islami Relief Center",
      subtitle: "Emergency Ambulance, Burial & Humanitarian Aid",
      type: "Charitable Trust",
      category: "social-services",
      badge: "EMERGENCY AID",
      price: "Free / Subsidized",
      tag: "popular",
      primaryHighlight: "24/7 Ambulance & Relief",
      image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?w=700&auto=format&fit=crop&q=80",
      hours: "24/7 Emergency Helpline",
      contactPhone: "+880 1711-567890",
      address: `Ring Road, Mohammadpur, ${city}`,
      tags: ["Emergency Ambulance", "Free Medical Camp", "Food Relief", "24/7"],
      badges: ["Hotline 24/7", "Relief Hub", "Mohammadpur"],
      features: [
        { label: "Ambulance", value: "24/7 free and low-cost emergency ambulance fleet" },
        { label: "Food Pack", value: "Dry food ration distribution to urban slum families" }
      ],
      overview: "Dedicated humanitarian welfare institution providing low-cost and free emergency ambulance transports, disaster food aid, and free medical camps."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 7. GAS, EV & PETROL STATIONS ─────────────────────────────────────────────
export function generateGasEVListings(lat: number, lng: number, area = "Tejgaon", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "Trust Filling Station & EV Supercharge Hub",
      subtitle: "Army Welfare Trust 24/7 Multi-Fuel & EV Fast Charging",
      type: "Fuel & EV Station",
      category: "gas-ev",
      badge: "24/7 EV CHARGE",
      price: "Octane ৳125/L | EV ৳8/unit",
      tag: "popular",
      primaryHighlight: "EV DC Fast Charging & Octane",
      image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=700&auto=format&fit=crop&q=80",
      hours: "Open 24 Hours (7 Days)",
      contactPhone: "+880 2-8878901",
      address: `Tejgaon Industrial Area, Shaheed Tajuddin Ahmed Sarani, ${city}`,
      tags: ["Octane 95", "Diesel", "EV Fast Charger", "Car Wash", "Air Pump"],
      badges: ["Army Welfare Trust", "24/7 Open", "EV 60kW DC"],
      features: [
        { label: "EV Charger", value: "60 kW Dual Gun CCS2 Fast DC Charging" },
        { label: "Fuel Quality", value: "100% Certified pure Octane, Diesel, Petrol" },
        { label: "Convenience", value: "Automated car wash, tyre inflation, convenience mart" }
      ],
      overview: "Dhaka's leading multi-fuel station featuring high-speed 60kW CCS2 electric vehicle DC chargers, automated car wash, pure imported octane, and 24-hour air service."
    },
    {
      title: "Clean Fuel CNG & Petrol Pump",
      subtitle: "High Pressure CNG Filling & Modern Auto Gas",
      type: "CNG & Fuel Station",
      category: "gas-ev",
      badge: "HIGH PRESSURE",
      price: "CNG ৳43/m³ | Octane ৳125/L",
      tag: "popular",
      primaryHighlight: "Fast CNG & Octane",
      image: "https://images.unsplash.com/photo-1527018607616-a6fe78f2441c?w=700&auto=format&fit=crop&q=80",
      hours: "6:00 AM – 11:00 PM (Govt Schedule)",
      contactPhone: "+880 1711-334455",
      address: `Mohakhali Commercial Area, Near Flyover, ${city}`,
      tags: ["CNG Refill", "Octane", "Mobil 1 Oil", "Wheel Alignment"],
      badges: ["High Pressure", "Mohakhali", "Fast Line"],
      features: [
        { label: "CNG Compressors", value: "4 Multi-line dispensers with steady pressure" },
        { label: "Engine Oil", value: "Genuine Mobil 1, Castrol, Total lubricants" }
      ],
      overview: "High-volume CNG and petrol station located strategically at Mohakhali, offering quick automated fueling, engine lubricants, and vehicle maintenance."
    },
    {
      title: "Padma Oil & EV Station Airport Road",
      subtitle: "State-owned Padma Petroleum & Quick Service Point",
      type: "Filling Station",
      category: "gas-ev",
      badge: "GOVT CERTIFIED",
      price: "Govt Regulated",
      tag: "discounted",
      primaryHighlight: "Govt Regulated Fuel Rates",
      image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=700&auto=format&fit=crop&q=80",
      hours: "Open 24 Hours",
      contactPhone: "+880 2-8901234",
      address: `Airport Road, Kurmitola / Uttara, ${city}`,
      tags: ["Airport Route", "Diesel Bulk", "Octane", "24/7 Service"],
      badges: ["State Owned", "Open 24h", "Highway Fuel"],
      features: [
        { label: "Location", value: "Conveniently located on Dhaka-Mymensingh Highway" },
        { label: "Payment", value: "Cards, bKash, Cash accepted" }
      ],
      overview: "24-hour government-certified petrol and diesel station providing reliable fuel measurements, vehicle wash bays, and fast refueling before entering the highway."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 8. SPORTS, STADIUMS & RECREATION ─────────────────────────────────────────
export function generateSportsListings(lat: number, lng: number, area = "Mirpur", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "Sher-e-Bangla National Cricket Stadium",
      subtitle: "Home of Cricket & National Sports Complex",
      type: "Cricket Stadium",
      category: "stadium",
      badge: "ICC VENUE",
      price: "Match Tickets / Tours",
      tag: "popular",
      primaryHighlight: "Home of Bangladesh Cricket",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=700&auto=format&fit=crop&q=80",
      hours: "Match Days & Academy: 8:00 AM – 7:00 PM",
      contactPhone: "+880 2-9008980",
      address: `Sector 2, Mirpur, ${city}`,
      tags: ["ICC Venue", "BCB Academy", "Cricket Matches", "Mirpur 2"],
      badges: ["National Stadium", "Capacity 26,000", "Floodlights"],
      features: [
        { label: "Capacity", value: "26,000 spectators with modern grandstands" },
        { label: "Academy", value: "BCB indoor training nets and fitness gymnasium" }
      ],
      overview: "The legendary home of cricket in Bangladesh, hosting international test, ODI and T20 matches, BPL tournaments, and youth cricket development camps."
    },
    {
      title: "Bashundhara Kings Arena (Sports Complex)",
      subtitle: "International Standard Football Stadium",
      type: "Football Stadium",
      category: "football",
      badge: "FIFA VENUE",
      price: "BPL Match Tickets",
      tag: "popular",
      primaryHighlight: "AFC & FIFA Standard Turf",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=700&auto=format&fit=crop&q=80",
      hours: "9:00 AM – 9:00 PM",
      contactPhone: "+880 2-8432000",
      address: `Bashundhara Sports Complex, Block N, Bashundhara R/A, ${city}`,
      tags: ["Football Stadium", "Bashundhara Kings", "AFC Cup", "Gym"],
      badges: ["State of the Art", "Natural Turf", "Modern Arena"],
      features: [
        { label: "Facilities", value: "Natural grass pitch, VIP galleries, floodlight system" },
        { label: "Tournaments", value: "Bangladesh Premier League, AFC Cup and international friendlies" }
      ],
      overview: "Premier private football venue in Bangladesh, purpose-built with international specifications, natural grass turf, and world-class athletic facilities."
    },
    {
      title: "Dhanmondi Club Sports Field (Sheikh Jamal)",
      subtitle: "Community Cricket, Football & Morning Walk Turf",
      type: "Community Sports Ground",
      category: "community-club",
      badge: "COMMUNITY CLUB",
      price: "Public / Member",
      tag: "popular",
      primaryHighlight: "Dhanmondi Lake & Sports Field",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&auto=format&fit=crop&q=80",
      hours: "5:30 AM – 9:00 PM",
      contactPhone: "+880 1711-445566",
      address: `Road 8, Dhanmondi Lake Front, ${city}`,
      tags: ["Jogging Track", "Cricket Practice", "Morning Walk", "Lake View"],
      badges: ["Green Turf", "Lakeside", "Family Friendly"],
      features: [
        { label: "Track", value: "Dedicated rubberized morning walking and running track" },
        { label: "Cricket Nets", value: "Daily practice sessions for junior cricket academy" }
      ],
      overview: "Popular sports hub and green open space by Dhanmondi Lake, popular with morning runners, youth cricket trainees, and neighborhood families."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 9. SCHOOLS, COLLEGES & UNIVERSITIES ──────────────────────────────────────
export function generateSchoolListings(lat: number, lng: number, area = "Ramna", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "University of Dhaka (DU)",
      subtitle: "The Oxford of the East – Premier Public University",
      type: "Public University",
      category: "university",
      badge: "TOP #1 UNIVERSITY",
      price: "Subsidized Govt Tuition",
      tag: "popular",
      primaryHighlight: "Highest Ranked Public University",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=700&auto=format&fit=crop&q=80",
      hours: "Sun – Thu: 8:00 AM – 5:00 PM",
      contactPhone: "+880 2-9661900",
      address: `Nilkhet Road, Dhaka University Campus, ${city}`,
      tags: ["Public University", "Research", "Curzon Hall", "Arts & Sciences"],
      badges: ["Historic Heritage", "Top Ranked", "Campus 600 Acres"],
      features: [
        { label: "Faculties", value: "13 Faculties, 83 Departments, 12 Institutes" },
        { label: "Campus", value: "Historic Curzon Hall, Central Library & TSC" },
        { label: "Admission", value: "Merit-based through central national admission test" }
      ],
      overview: "Bangladesh's oldest and most prestigious university, founded in 1921. DU has been the intellectual and cultural heart of the nation for over a century."
    },
    {
      title: "BUET – Bangladesh University of Engineering & Tech",
      subtitle: "Apex Engineering & Architecture Institution",
      type: "Engineering University",
      category: "university",
      badge: "TOP ENGINEERING",
      price: "Govt Subsidized",
      tag: "popular",
      primaryHighlight: "Premier Engineering Institute",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=700&auto=format&fit=crop&q=80",
      hours: "Sun – Thu: 8:00 AM – 5:00 PM",
      contactPhone: "+880 2-9665650",
      address: `Palashi, Polashi Campus, Ramna, ${city}`,
      tags: ["Engineering", "Computer Science", "Architecture", "Civil"],
      badges: ["Apex Engineering", "Top STEM", "High Placement"],
      features: [
        { label: "Departments", value: "CSE, EEE, Mechanical, Civil, Architecture, Chemical" },
        { label: "Placement", value: "Global top tier graduate programs & tech placements" }
      ],
      overview: "The most competitive engineering institution in Bangladesh, producing world-class researchers, civil leaders, and global software architects."
    },
    {
      title: "North South University (NSU)",
      subtitle: "First Private University in Bangladesh",
      type: "Private University",
      category: "university",
      badge: "TOP PRIVATE",
      price: "৳ 6,500/credit",
      tag: "popular",
      primaryHighlight: "Global Ranking #1 Private",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?w=700&auto=format&fit=crop&q=80",
      hours: "Sat – Thu: 8:30 AM – 6:00 PM",
      contactPhone: "+880 2-55668200",
      address: `Plot 15, Block B, Bashundhara R/A, ${city}`,
      tags: ["BBA", "Computer Science", "Pharmacy", "Bashundhara"],
      badges: ["QS Ranked", "Modern Campus", "US Curriculum"],
      features: [
        { label: "Accreditation", value: "ACBSP accredited School of Business, ABET in progress" },
        { label: "Campus", value: "6.5-acre modern campus with digital libraries and laboratories" }
      ],
      overview: "Ranked as the top private university in Bangladesh, offering North American standard undergraduate and graduate degrees in Business, Engineering, and Life Sciences."
    },
    {
      title: "Notre Dame College Dhaka",
      subtitle: "Prestigious Higher Secondary College for Boys",
      type: "Higher Secondary College",
      category: "college",
      badge: "EXCELLENCE",
      price: "Affordable",
      tag: "popular",
      primaryHighlight: "Top HSC Results in Bangladesh",
      image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=700&auto=format&fit=crop&q=80",
      hours: "Sun – Thu: 7:30 AM – 3:30 PM",
      contactPhone: "+880 2-7192325",
      address: `Toyenbee Circular Road, Motijheel, ${city}`,
      tags: ["HSC Science", "Business Studies", "Notre Dame", "Motijheel"],
      badges: ["Highest Merit", "Character Building", "Historic"],
      features: [
        { label: "Tradition", value: "Founded by Holy Cross Congregation in 1949" },
        { label: "Success", value: "Over 99% GPA 5.00 in National HSC Board Examinations" }
      ],
      overview: "Pinnacle of higher secondary education in Bangladesh, renowned for strict academic discipline, extracurricular excellence, and peerless board examination records."
    },
    {
      title: "Viqarunnisa Noon School & College",
      subtitle: "Premier Higher Secondary Institution for Girls",
      type: "School & College",
      category: "college",
      badge: "TOP GIRLS COLLEGE",
      price: "Standard Board Fee",
      tag: "popular",
      primaryHighlight: "Leading Female Education",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&auto=format&fit=crop&q=80",
      hours: "Sun – Thu: 7:30 AM – 2:00 PM",
      contactPhone: "+880 2-9334180",
      address: `1/A New Bailey Road, Ramna, ${city}`,
      tags: ["Girls School", "HSC & SSC", "Bailey Road", "English Version"],
      badges: ["Premier Girls", "Bailey Road", "Top Board Results"],
      features: [
        { label: "Curriculum", value: "Bangla & English Version National Curriculum" },
        { label: "Campuses", value: "Main Bailey Road, Dhanmondi, Azimpur & Bashundhara" }
      ],
      overview: "Historic girls school and college renowned for generating the highest number of board toppers, nationwide debate champions, and women leaders."
    },
    {
      title: "Scholastica Senior Campus Uttara",
      subtitle: "Top British Curriculum English Medium School",
      type: "English Medium School",
      category: "english-medium",
      badge: "CAMBRIDGE / EDEXCEL",
      price: "International",
      tag: "popular",
      primaryHighlight: "O & A Levels Cambridge School",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700&auto=format&fit=crop&q=80",
      hours: "Sun – Thu: 7:45 AM – 2:30 PM",
      contactPhone: "+880 2-8956550",
      address: `Plot 2, Sector 13, Uttara, ${city}`,
      tags: ["Cambridge O/A Levels", "Swimming Pool", "Auditorium", "Uttara"],
      badges: ["English Medium", "Global Placement", "Top Infrastructure"],
      features: [
        { label: "Board", value: "Cambridge Assessment International Education" },
        { label: "Facilities", value: "Olympic swimming pool, gymnasium, professional theater" }
      ],
      overview: "Leading English-medium institution offering Cambridge IGCSE and A Levels, known for modern sports complexes and graduates at Ivy League and Russell Group universities."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 10. TRANSIT, METRO & SUBWAY ──────────────────────────────────────────────
export function generateTransitMetroListings(lat: number, lng: number, area = "Motijheel", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "Dhaka Metro Rail: Motijheel Station (MRT-6)",
      subtitle: "Southern Terminus Station – Dhaka Mass Rapid Transit",
      type: "Metro Rail Station",
      category: "metro-rail",
      badge: "MRT LINE 6",
      price: "৳ 20 - ৳ 100",
      tag: "popular",
      primaryHighlight: "Fast Air-Conditioned Metro",
      image: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=700&auto=format&fit=crop&q=80",
      hours: "7:10 AM – 9:40 PM (Daily except Friday)",
      contactPhone: "+880 2-55138000",
      address: `Bangladesh Bank Circle, Motijheel Commercial Area, ${city}`,
      tags: ["MRT Line 6", "Rapid Transit Card", "Air Conditioned", "Escalators"],
      badges: ["MRT Line 6", "Zero Traffic", "Accessible"],
      features: [
        { label: "Transit Time", value: "Motijheel to Uttara in only 32 minutes" },
        { label: "Payment", value: "Rapid Pass & MRT Pass card with 10% fare discount" },
        { label: "Frequency", value: "Trains every 6 to 8 minutes during peak hours" }
      ],
      overview: "The central commercial terminal of Dhaka Metro Rail (MRT Line 6), revolutionizing transit between South Dhaka (Motijheel) and North Dhaka (Uttara) in 32 minutes."
    },
    {
      title: "Dhaka Metro Rail: Farmgate Station",
      subtitle: "Central High-Volume Transit & Transfer Hub",
      type: "Metro Rail Station",
      category: "metro-rail",
      badge: "BUS & METRO",
      price: "৳ 20 - ৳ 60",
      tag: "popular",
      primaryHighlight: "Central Interchange Station",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=700&auto=format&fit=crop&q=80",
      hours: "7:15 AM – 9:45 PM",
      contactPhone: "+880 2-55138000",
      address: `Ananda Cinema Hall Road, Farmgate, Tejgaon, ${city}`,
      tags: ["Farmgate Hub", "MRT Line 6", "Overpass Direct Access", "Elevators"],
      badges: ["Major Hub", "Bus Connection", "Modern"],
      features: [
        { label: "Connections", value: "Direct footbridge link to Farmgate bus terminals" },
        { label: "Accessibility", value: "Tactile paving, elevators for disabled passengers" }
      ],
      overview: "Busiest intermediate station on MRT Line 6, linking university students, government staff, and daily commuters with major city bus routes."
    },
    {
      title: "Dhaka Metro Rail: Mirpur 10 Station",
      subtitle: "Mirpur Central Interchange & Transit Station",
      type: "Metro Rail Station",
      category: "metro-rail",
      badge: "MIRPUR HUB",
      price: "৳ 20 - ৳ 80",
      tag: "popular",
      primaryHighlight: "Mirpur 10 Roundabout Terminal",
      image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=700&auto=format&fit=crop&q=80",
      hours: "7:10 AM – 9:40 PM",
      contactPhone: "+880 2-55138000",
      address: `Mirpur 10 Golchokkor, Mirpur, ${city}`,
      tags: ["Mirpur 10", "Stadium Access", "Shopping Hub", "MRT Line 6"],
      badges: ["High Traffic", "Elevated Station", "Rapid Pass"],
      features: [
        { label: "Access", value: "Direct proximity to Sher-e-Bangla National Cricket Stadium" },
        { label: "Security", value: "Baggage scanners and MRT police unit on duty" }
      ],
      overview: "Elevated modern station over Mirpur 10 roundabout providing swift, jam-free transit for residents of Mirpur, Pallabi, and Senpara."
    },
    {
      title: "Dhaka Metro Rail: Uttara North Station",
      subtitle: "Northern Terminus & Depot Complex (Diabari)",
      type: "Metro Rail Station",
      category: "metro-rail",
      badge: "UTTARA TERMINUS",
      price: "৳ 20 - ৳ 100",
      tag: "popular",
      primaryHighlight: "Diabari Depot & Terminus",
      image: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=700&auto=format&fit=crop&q=80",
      hours: "7:10 AM – 9:40 PM",
      contactPhone: "+880 2-55138000",
      address: `Diabari, Sector 15, Uttara, ${city}`,
      tags: ["Diabari", "Uttara North", "Depot", "Parking Available"],
      badges: ["Terminus", "Park & Ride", "Clean"],
      features: [
        { label: "Park & Ride", value: "Ample parking for cars, bikes, and rickshaws" },
        { label: "Depot", value: "Main operational maintenance depot of MRT Line 6" }
      ],
      overview: "Northern gateway terminus in scenic Diabari, Uttara. Features park-and-ride facilities, automated ticket vending machines, and direct feeder buses."
    },
    {
      title: "Kamalapur Central Railway Station",
      subtitle: "Bangladesh Railway Principal Intercity Station",
      type: "Railway Station",
      category: "railway",
      badge: "CENTRAL RAILWAY",
      price: "Intercity Train Fares",
      tag: "popular",
      primaryHighlight: "National Rail Network Hub",
      image: "https://images.unsplash.com/photo-1532105956626-9569c03602f6?w=700&auto=format&fit=crop&q=80",
      hours: "Open 24 Hours (Train Schedules)",
      contactPhone: "+880 2-9358634",
      address: `Atish Dipankar Road, Kamalapur, Motijheel, ${city}`,
      tags: ["Subarna Express", "Cox's Bazar Express", "E-Ticket", "Platforms 1-9"],
      badges: ["Iconic Architecture", "Cox's Bazar Train", "Intercity"],
      features: [
        { label: "Key Trains", value: "Subarna, Sonar Bangla, Cox's Bazar Express, Parabat" },
        { label: "Facilities", value: "Online e-ticketing verification, VIP lounge, cloak rooms" }
      ],
      overview: "The central railway terminal of Bangladesh connecting Dhaka to Chittagong, Cox's Bazar, Sylhet, Rajshahi, and Khulna via high-speed express trains."
    },
    {
      title: "Mohakhali Inter-District Bus Terminal",
      subtitle: "Northern & Eastern Bangladesh Highway Bus Terminal",
      type: "Bus Terminal",
      category: "bus-terminal",
      badge: "BUS TERMINUS",
      price: "Standard Bus Fares",
      tag: "popular",
      primaryHighlight: "Mymensingh, Sylhet & Tangail Routes",
      image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=700&auto=format&fit=crop&q=80",
      hours: "Open 24 Hours",
      contactPhone: "+880 1711-667788",
      address: `Bir Uttam A.K. Khandakar Road, Mohakhali, ${city}`,
      tags: ["Ena Transport", "Shyamoli", "BRTC AC", "24/7 Departure"],
      badges: ["High Frequency", "24/7 Bus Hub", "Highway"],
      features: [
        { label: "Destinations", value: "Mymensingh, Bogura, Sylhet, Kishoreganj, Tangail" },
        { label: "Operators", value: "Ena, Shyamoli Paribahan, BRTC AC Bus services" }
      ],
      overview: "Major inter-district bus station serving millions of highway travelers traveling to Northern Bangladesh, Sylhet, and greater Mymensingh."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 11. GROCERY & SUPERSTORES ────────────────────────────────────────────────
export function generateGroceryShopListings(lat: number, lng: number, area = "Gulshan", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "Shwapno Flagship Superstore",
      subtitle: "Fresh Fish, Meat, Organic Vegetables & Household",
      type: "Superstore",
      category: "superstore",
      badge: "BEST VALUE",
      price: "Retail MRP & Deals",
      tag: "popular",
      primaryHighlight: "Daily Discounts & Fresh Food",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&auto=format&fit=crop&q=80",
      hours: "8:00 AM – 10:30 PM (Daily)",
      contactPhone: "+880 9612-374927",
      address: `Gulshan 1 Circle, Road 134, ${city}`,
      tags: ["Fresh Fish", "Halal Beef", "Radhuni Spices", "Pran", "Home Delivery"],
      badges: ["Superstore", "Reward Points", "Fast Checkout"],
      features: [
        { label: "Fresh Market", value: "Fresh country chicken, live fish cleaning, organic vegetables" },
        { label: "Points", value: "Earn and redeem Shwapno loyalty reward points" },
        { label: "Payment", value: "All credit/debit cards, bKash, Nagad, Cash" }
      ],
      overview: "Bangladesh's largest retail superstore chain offering farm-fresh produce, authentic spices, toiletries, dairy, and certified hand-cut halal meat."
    },
    {
      title: "Unimart Gulshan Hypermarket",
      subtitle: "Premium International Hypermarket & Gourmet Food Hall",
      type: "Hypermarket",
      category: "superstore",
      badge: "PREMIUM",
      price: "Gourmet & Retail",
      tag: "popular",
      primaryHighlight: "Huge Gourmet Hypermarket",
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=700&auto=format&fit=crop&q=80",
      hours: "8:30 AM – 11:00 PM",
      contactPhone: "+880 2-9844444",
      address: `Gulshan Centre Point, Road 90, Gulshan 2, ${city}`,
      tags: ["Imported Cheeses", "Organic Veg", "Food Hall", "Live Bakery"],
      badges: ["Premier Experience", "Underground Parking", "Food Court"],
      features: [
        { label: "Selection", value: "Largest collection of imported snacks, condiments, and specialty coffee" },
        { label: "Live Bakery", value: "Fresh croissants, artisan sourdough breads, cakes baked hourly" }
      ],
      overview: "State-of-the-art 40,000 sq ft hypermarket with extensive international imports, live butcher counters, fish aquariums, and an artisanal dining food hall."
    },
    {
      title: "Agora Superstore Dhanmondi",
      subtitle: "Pioneer Quality Supermarket in Bangladesh",
      type: "Superstore",
      category: "superstore",
      badge: "QUALITY",
      price: "Standard Retail",
      tag: "popular",
      primaryHighlight: "Pioneer Retail Supermarket",
      image: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=700&auto=format&fit=crop&q=80",
      hours: "8:00 AM – 10:00 PM",
      contactPhone: "+880 2-8119854",
      address: `Plot 27, Road 16 (Old 27), Dhanmondi, ${city}`,
      tags: ["Chinigura Rice", "Mustard Oil", "Baby Care", "Bakery"],
      badges: ["Quality Assured", "Dhanmondi 27", "Reliable"],
      features: [
        { label: "History", value: "The first modern supermarket chain in Bangladesh (est. 2001)" },
        { label: "Fresh Guarantee", value: "Strict quality checks on all dairy and perishable goods" }
      ],
      overview: "Trusted household destination for over two decades, delivering quality groceries, premium local spices, clean pulses, and personal care products."
    },
    {
      title: "Karwan Bazar Central Wholesale Market",
      subtitle: "Largest Wholesale Fish, Vegetable & Spice Market",
      type: "Wholesale Market",
      category: "wholesale-market",
      badge: "BEST PRICES",
      price: "Wholesale Rates",
      tag: "discounted",
      primaryHighlight: "Lowest Wholesale Prices",
      image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=700&auto=format&fit=crop&q=80",
      hours: "Open 24 Hours (Midnight to Dawn Peak)",
      contactPhone: "+880 1711-998877",
      address: `Kazi Nazrul Islam Avenue, Karwan Bazar, ${city}`,
      tags: ["Wholesale Prices", "Padma Ilish", "Direct Farmers", "Fresh Veg"],
      badges: ["Wholesale Hub", "Farmers Direct", "Cash"],
      features: [
        { label: "Pricing", value: "Up to 30% to 50% cheaper than retail supermarkets" },
        { label: "Variety", value: "Direct trucks arriving from all 64 districts every midnight" }
      ],
      overview: "The beating commercial heart of Dhaka's food supply. Direct farmer arrivals every midnight ensure the freshest fish, vegetables, fruits, and spices at rock-bottom prices."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 12. USED & NEW FURNITURE ─────────────────────────────────────────────────
export function generateFurnitureListings(lat: number, lng: number, area = "Panthapath", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "Hatil Furniture Flagship Showroom",
      subtitle: "Smart & Ergonomic Wood Furniture Solutions",
      type: "Furniture Showroom",
      category: "furniture",
      badge: "TOP BRAND",
      price: "৳ 8,000 - ৳ 95,000",
      tag: "popular",
      primaryHighlight: "Premium Oak & Beech Wood",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&auto=format&fit=crop&q=80",
      hours: "10:00 AM – 8:30 PM (Daily)",
      contactPhone: "+880 9678-442845",
      address: `Bir Uttam Qazi Nuruzzaman Sarak, Panthapath, ${city}`,
      tags: ["Living Room", "Bed & Mattress", "Ergonomic Sofa", "Home Office"],
      badges: ["Hatil Original", "Warranty 1 Year", "Free Delivery"],
      features: [
        { label: "Material", value: "Solid German beech wood and engineered veneer" },
        { label: "Warranty", value: "12-month free service and lifetime hardware support" }
      ],
      overview: "Bangladesh's flagship furniture export brand, famous for space-saving modular sofas, solid wood dining tables, ergonomic executive chairs, and comfortable bedroom sets."
    },
    {
      title: "Panthapath Wooden Furniture Market",
      subtitle: "Bazaar for Solid Teak (Segun) & Budget Beds",
      type: "Furniture Bazaar",
      category: "furniture",
      badge: "BARGAIN DEALS",
      price: "৳ 4,000 - ৳ 45,000",
      tag: "discounted",
      primaryHighlight: "Chittagong Teak & Custom Work",
      image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=700&auto=format&fit=crop&q=80",
      hours: "9:30 AM – 9:30 PM",
      contactPhone: "+880 1711-554433",
      address: `Panthapath Main Road, Near Square Hospital, ${city}`,
      tags: ["Solid Segun", "Bargain Price", "Custom Carpentry", "Dressing Table"],
      badges: ["Direct Craftsmen", "Negotiable", "Delivery Van"],
      features: [
        { label: "Custom Work", value: "Order custom designs built to exact room dimensions" },
        { label: "Price", value: "Negotiable pricing direct from manufacturing artisans" }
      ],
      overview: "Dhaka's renowned furniture street with over 150 workshops crafting solid Chittagong Teak (Segun) beds, almirahs, dining sets, and affordable office desks."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 13. MONEY EXCHANGE & REMITTANCE ──────────────────────────────────────────
export function generateMoneyExchangeListings(lat: number, lng: number, area = "Motijheel", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "bKash & Nagad Central Customer Care Hub",
      subtitle: "Official Digital Remittance, Cashout & Verification",
      type: "Remittance Hub",
      category: "remittance",
      badge: "INSTANT bKash",
      price: "Lowest Cashout Fee",
      tag: "popular",
      primaryHighlight: "Instant bKash & Foreign Inward Remittance",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=700&auto=format&fit=crop&q=80",
      hours: "9:00 AM – 7:00 PM (Customer Center)",
      contactPhone: "+880 2-16247",
      address: `Sena Kalyan Bhaban, 195 Motijheel C/A, ${city}`,
      tags: ["bKash Cashout", "2.5% Remittance Incentive", "Nagad", "NID Verification"],
      badges: ["Govt 2.5% Incentive", "Instant Transfer", "Official"],
      features: [
        { label: "Govt Incentive", value: "Instant 2.5% government cash incentive credited directly" },
        { label: "Global Partners", value: "Western Union, Remitly, WorldRemit, TapTap Send" }
      ],
      overview: "Official central remittance care center offering instant foreign currency disbursement directly into bKash & Nagad wallets with full 2.5% government cash incentives."
    },
    {
      title: "Motijheel Central Money Changer",
      subtitle: "Bangladesh Bank Authorized Foreign Currency Exchange",
      type: "Money Exchange",
      category: "money-exchange",
      badge: "BB AUTHORIZED",
      price: "Live Interbank Rates",
      tag: "popular",
      primaryHighlight: "Official USD, EUR, GBP, SAR Rates",
      image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=700&auto=format&fit=crop&q=80",
      hours: "9:30 AM – 5:30 PM (Sun – Thu)",
      contactPhone: "+880 2-9556677",
      address: `Dilkusha Commercial Area, Motijheel, ${city}`,
      tags: ["Passport Endorsement", "USD Buy/Sell", "Euro", "Saudi Riyal"],
      badges: ["Central Bank Approved", "Passport Endorse", "Cash"],
      features: [
        { label: "Licence", value: "Bangladesh Bank Authorized Dealer Money Changer" },
        { label: "Endorsement", value: "Hajj/Umrah, medical, student, and tourist travel quota" }
      ],
      overview: "Authorized foreign currency exchange bureau providing live exchange rates for US Dollars, Euros, British Pounds, and Saudi Riyals with instant passport endorsements."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 14. TRAVEL & FLIGHT AGENCIES ─────────────────────────────────────────────
export function generateTravelFlightListings(lat: number, lng: number, area = "Kurmitola", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "Biman Bangladesh Airlines (Balaka Head Office)",
      subtitle: "National Flag Carrier Ticketing & Sales Center",
      type: "Airline Office",
      category: "airline",
      badge: "NATIONAL CARRIER",
      price: "Domestic & Global Flights",
      tag: "popular",
      primaryHighlight: "Official Biman Bangladesh Flights",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=700&auto=format&fit=crop&q=80",
      hours: "9:00 AM – 5:30 PM (Daily)",
      contactPhone: "+880 2-8901600",
      address: `Balaka Bhaban, Kurmitola, Hazrat Shahjalal Airport, ${city}`,
      tags: ["Direct London/NY", "Umrah Flights", "Dhaka to Cox's Bazar", "Baggage Service"],
      badges: ["Flag Carrier", "Boeing 787 Fleet", "Official"],
      features: [
        { label: "Routes", value: "Non-stop flights to London Heathrow, Toronto, Middle East & Asia" },
        { label: "Domestic", value: "Daily connections to Sylhet, Chittagong, Cox's Bazar, Saidpur" }
      ],
      overview: "Central sales counter of Bangladesh's national flag carrier operating modern Boeing 787 Dreamliners to the UK, North America, Middle East, and domestic hubs."
    },
    {
      title: "ShareTrip Travel & Flight Hub",
      subtitle: "Online Flight Booking, Visa Processing & Holiday Packages",
      type: "Travel Agency",
      category: "travel-agency",
      badge: "TOP AGENCY",
      price: "Special Discount Fares",
      tag: "popular",
      primaryHighlight: "Instant Air Ticket Booking",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=700&auto=format&fit=crop&q=80",
      hours: "9:00 AM – 8:00 PM (Support 24/7)",
      contactPhone: "+880 9617-617617",
      address: `Plot 50, Kamal Ataturk Avenue, Banani, ${city}`,
      tags: ["Umrah Packages", "Thailand/Malaysia Visa", "Student Airfare", "Hotel Deals"],
      badges: ["IATA Accredited", "24/7 Hotline", "EMI 0%"],
      features: [
        { label: "Visa Help", value: "Assistance for Tourist, Medical, and Student Visas" },
        { label: "Payment", value: "0% EMI on all major credit cards up to 12 months" }
      ],
      overview: "IATA-accredited travel agency offering discount flight deals on Emirates, Qatar Airways, Singapore Airlines, and Biman, with visa processing services."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 15. CARS & AUTOMOTIVE ────────────────────────────────────────────────────
export function generateCarsAutoListings(lat: number, lng: number, area = "Tejgaon", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "Navana Toyota 3S Center Tejgaon",
      subtitle: "Authorized Sales, Service & Genuine Spare Parts",
      type: "Automobile Center",
      category: "cars-auto",
      badge: "AUTHORIZED TOYOTA",
      price: "Official Pricing",
      tag: "popular",
      primaryHighlight: "Official Toyota Dealer & 3S Service",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=700&auto=format&fit=crop&q=80",
      hours: "9:00 AM – 6:00 PM (Sat – Thu)",
      contactPhone: "+880 2-8870500",
      address: `205-207 Tejgaon Industrial Area, ${city}`,
      tags: ["Toyota Corolla Cross", "Hybrid Service", "Genuine Parts", "Warranty"],
      badges: ["Navana Original", "Authorized 3S", "Diagnostic Computer"],
      features: [
        { label: "Service", value: "Computerized engine diagnostic, hybrid battery check" },
        { label: "Parts", value: "100% genuine Toyota imported oil filters, brake pads" }
      ],
      overview: "The official Toyota 3S (Sales, Service, Spare Parts) authorized center in Dhaka, equipped with modern hydraulic lifts and trained technicians."
    },
    {
      title: "Baridhara Car Mart (Pragati Sarani)",
      subtitle: "Reconditioned Japanese Hybrid Car Showroom",
      type: "Car Showroom",
      category: "cars-auto",
      badge: "AUCTION GRADE 4.5+",
      price: "৳ 18.5 Lac – ৳ 65 Lac",
      tag: "popular",
      primaryHighlight: "Japanese Reconditioned Cars",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=700&auto=format&fit=crop&q=80",
      hours: "10:00 AM – 9:00 PM",
      contactPhone: "+880 1711-223344",
      address: `Progoti Shoroni, Baridhara / Kuril, ${city}`,
      tags: ["Toyota Premio", "Axio Hybrid", "Honda Vezel", "Bank Loan 80%"],
      badges: ["Auction Sheet Verified", "Bank Loan", "Showroom"],
      features: [
        { label: "Inspection", value: "Verified original Japan auction sheets provided" },
        { label: "Loan", value: "Up to 80% bank auto loans processed within 5 working days" }
      ],
      overview: "Premium auto showroom showcasing auction-grade verified Japanese hybrid vehicles (Premio, Allion, Axio, Grace, Vezel, Harrier) with bank financing options."
    }
  ];

  return generateMappedListings(lat, lng, area, city, templates);
}

// ─── 16. ELECTRONICS & GADGETS ────────────────────────────────────────────────
export function generateElectronicsListings(lat: number, lng: number, area = "Elephant Road", city = "Dhaka"): ServiceListing[] {
  const templates = [
    {
      title: "Multiplan Computer City Center",
      subtitle: "Largest IT, Laptop & Desktop Computer Market",
      type: "Computer Market",
      category: "electronics",
      badge: "TECH HUB",
      price: "Wholesale & Retail",
      tag: "popular",
      primaryHighlight: "16 Floors of IT & Gadgets",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop&q=80",
      hours: "10:00 AM – 8:30 PM (Closed Tuesday)",
      contactPhone: "+880 2-9660000",
      address: `69-71 New Elephant Road, ${city}`,
      tags: ["Laptops", "Graphics Cards", "Monitor", "Repair & Upgrades"],
      badges: ["Asia's Largest IT Mall", "1000+ Shops", "Official Warranty"],
      features: [
        { label: "Brands", value: "Apple, Asus, HP, Dell, Lenovo, Acer, MSI, Gigabyte" },
        { label: "Services", value: "Laptop screen repair, thermal paste replacement, SSD upgrades" }
      ],
      overview: "South Asia's premier IT shopping complex with over 1,000 tech stores offering laptops, gaming rigs, monitors, printers, networking hardware, and repair services."
    },
    {
      title: "Bashundhara City Mobile & Gadget Mall",
      subtitle: "Smartphone Flagship Stores & Genuine Accessories",
      type: "Gadget Market",
      category: "electronics",
      badge: "OFFICIAL WARRANTY",
      price: "Best Market Price",
      tag: "popular",
      primaryHighlight: "Smartphones & Wearables",
      image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=700&auto=format&fit=crop&q=80",
      hours: "10:00 AM – 9:00 PM (Closed Tuesday)",
      contactPhone: "+880 2-9111440",
      address: `Panthapath, Bashundhara City Level 5 & 6, ${city}`,
      tags: ["iPhone", "Samsung Galaxy", "Xiaomi", "Smartwatch", "Earbuds"],
      badges: ["Level 5 & 6", "Official Brand Stores", "Exchange Offers"],
      features: [
        { label: "Official Stores", value: "Samsung, Apple Authorized, Xiaomi, Realme, Vivo" },
        { label: "Trade-in", value: "Exchange your old phone for instant upgrade discount" }
      ],
      overview: "The most visited consumer smartphone hub in Bangladesh. Official warranty devices, screen protectors, phone covers, and repair workshops."
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
  // Realistic cluster coordinates around centerLat / centerLng
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
      address: tmpl.address || `House ${12 + idx * 8}, Road ${4 + (idx % 12)}, ${areaName}, ${cityName}`,
      rating: tmpl.rating || 4.6 + (idx % 4) * 0.1,
      reviews: tmpl.reviews || 120 + idx * 85,
      verified: true,
      image: tmpl.image,
      contactPhone: tmpl.contactPhone || `+880 1711-${200000 + idx * 11111}`,
      hours: tmpl.hours || "Open Daily",
      website: tmpl.website || "https://barikoi.com",
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
