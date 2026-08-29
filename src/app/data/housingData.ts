// ─── Live Dynamic Housing & Real Estate Listings Model ────────────────────────

export interface LiveHousingListing {
  id: string;
  title: string;
  purpose: "Rent" | "Purchase";
  agency: string;
  agencyVerified: boolean;
  agencyLogo?: string;
  price: string;
  priceRaw: number;
  beds: string;
  baths: string;
  sqft: string;
  location: string;
  area: string;
  city: string;
  distance: string;
  distanceKm: number;
  lat: number;
  lng: number;
  image: string;
  gallery: string[];
  features: string[];
  propertyType: "Apartment" | "Studio" | "Duplex" | "Penthouse" | "Sublet" | "Building" | "Commercial";
  furnished: "Fully Furnished" | "Semi-Furnished" | "Unfurnished";
  description: string;
  contactPhone: string;
  contactEmail: string;
  isNearby: boolean;
  postedTime: string;
}

// ─── Distance Formatter ─────────────────────────────────────────────────────

export function formatDistance(distKm: number): string {
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m away`;
  }
  return `${distKm.toFixed(1)} km away`;
}

// ─── Smart Multi-Word & Natural Language Sentence Housing Matcher ───────────

const SEARCH_STOP_WORDS = new Set([
  "i", "me", "my", "we", "our", "you", "your", "he", "she", "it", "they",
  "am", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did",
  "a", "an", "the", "and", "or", "but", "if", "because", "as", "until", "while",
  "of", "at", "by", "for", "with", "about", "against", "between", "into", "through",
  "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under",
  "want", "need", "looking", "look", "seeking", "find", "search", "pls", "please", "can", "get",
  "urgent", "urgently", "now", "today", "any", "some", "good", "flat", "house", "room",
  // Bengali stop words & conversational particles
  "ami", "amra", "tumi", "apni", "amar", "amader", "ekta", "kono", "chai", "dorkar", "khujchi", "ache", "ki", "kothay", "hobe", "lagbe", "khujtechi", "basa", "bari"
]);

export function matchHousingQuery(listing: LiveHousingListing, query: string): boolean {
  if (!query || !query.trim()) return true;

  const normalizedQuery = query.toLowerCase().trim();

  // 1. Direct exact or substring match
  if (
    listing.title.toLowerCase().includes(normalizedQuery) ||
    listing.agency.toLowerCase().includes(normalizedQuery) ||
    listing.purpose.toLowerCase().includes(normalizedQuery) ||
    listing.location.toLowerCase().includes(normalizedQuery) ||
    listing.propertyType.toLowerCase().includes(normalizedQuery) ||
    listing.beds.toLowerCase().includes(normalizedQuery) ||
    listing.features.some(f => f.toLowerCase().includes(normalizedQuery))
  ) {
    return true;
  }

  // 2. Tokenize user sentence into individual words
  const rawWords = normalizedQuery
    .replace(/[^\w\s\u0980-\u09FF]/g, " ")
    .split(/\s+/)
    .filter(w => w.trim().length > 0);

  if (rawWords.length === 0) return true;

  // Filter out stop words if there are multiple words
  const nonStopWords = rawWords.filter(w => w.length >= 2 && !SEARCH_STOP_WORDS.has(w));
  const tokens = nonStopWords.length > 0 ? nonStopWords : rawWords.filter(w => w.length >= 2);

  if (tokens.length === 0) {
    return rawWords.some(w => listing.title.toLowerCase().includes(w) || listing.agency.toLowerCase().includes(w));
  }

  const titleLower = listing.title.toLowerCase();
  const agencyLower = listing.agency.toLowerCase();
  const purposeLower = listing.purpose.toLowerCase();
  const locationLower = listing.location.toLowerCase();
  const typeLower = listing.propertyType.toLowerCase();
  const bedsLower = listing.beds.toLowerCase();
  const featuresLower = listing.features.map(f => f.toLowerCase());
  const descLower = listing.description.toLowerCase();

  // Match if ANY token matches title, agency, purpose, location, beds, or features
  return tokens.some(token => {
    return (
      titleLower.includes(token) ||
      agencyLower.includes(token) ||
      purposeLower.includes(token) ||
      locationLower.includes(token) ||
      typeLower.includes(token) ||
      bedsLower.includes(token) ||
      featuresLower.some(f => f.includes(token)) ||
      descLower.includes(token)
    );
  });
}

// ─── Dynamic Live Location Housing Generator ────────────────────────────────

export function generateLiveLocationHousing(lat: number, lng: number, areaName: string, cityName: string): LiveHousingListing[] {
  const area = areaName || "Near You";
  const city = cityName || "Dhaka";

  const templateList = [
    {
      title: "Modern 3-BHK Furnished Luxury Apartment",
      purpose: "Rent" as const,
      agency: "Bproperty.com",
      agencyVerified: true,
      price: "৳38,000/mo",
      priceRaw: 38000,
      beds: "3 Beds",
      baths: "3 Baths",
      sqft: "1,650 sqft",
      propertyType: "Apartment" as const,
      furnished: "Fully Furnished" as const,
      features: ["Lift & Generator", "Car Parking", "24/7 Security", "South Facing", "CCTV", "Gas Connection"],
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=380&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=380&fit=crop",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=380&fit=crop",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=380&fit=crop"
      ],
      description: "Spacious 3-bedroom apartment with premium fittings, large living area, imported tiles, modern modular kitchen, and double balconies offering open breeze.",
      contactPhone: "+880 1711-234567",
      contactEmail: "rentals@bproperty.com"
    },
    {
      title: "Ready 3-BHK Luxury Flat for Sale",
      purpose: "Purchase" as const,
      agency: "Shanta Holdings",
      agencyVerified: true,
      price: "৳1.85 Crore",
      priceRaw: 18500000,
      beds: "3 Beds",
      baths: "4 Baths",
      sqft: "2,150 sqft",
      propertyType: "Apartment" as const,
      furnished: "Semi-Furnished" as const,
      features: ["Rooftop Garden", "Swimming Pool", "Gymnasium", "2 Car Parking", "Community Hall", "Sub-station"],
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=380&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=380&fit=crop",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=380&fit=crop"
      ],
      description: "Architect-designed signature residential apartment with luxury Italian marble flooring, high ceilings, full fire protection system, and world-class building amenities.",
      contactPhone: "+880 1819-876543",
      contactEmail: "sales@shantaholdings.com"
    },
    {
      title: "Cosy Studio Apartment with Balcony",
      purpose: "Rent" as const,
      agency: "Direct Owner / Verified",
      agencyVerified: true,
      price: "৳16,500/mo",
      priceRaw: 16500,
      beds: "Studio / 1 Bed",
      baths: "1 Bath",
      sqft: "650 sqft",
      propertyType: "Studio" as const,
      furnished: "Fully Furnished" as const,
      features: ["Wifi Included", "Separate Kitchen", "Attached Bath", "AC Installed", "Fridge & Stove", "No Broker Fee"],
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=380&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=380&fit=crop",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=380&fit=crop"
      ],
      description: "Ideal for singles, students, or newly married couples. Fully furnished with double bed, wardrobe, high-speed WiFi, microwave, water heater, and 24-hour water supply.",
      contactPhone: "+880 1912-345678",
      contactEmail: "owner.property@gmail.com"
    },
    {
      title: "Brand New 2-BHK Family Apartment for Purchase",
      purpose: "Purchase" as const,
      agency: "Sheltech Real Estate",
      agencyVerified: true,
      price: "৳95 Lakh",
      priceRaw: 9500000,
      beds: "2 Beds",
      baths: "2 Baths",
      sqft: "1,220 sqft",
      propertyType: "Apartment" as const,
      furnished: "Unfurnished" as const,
      features: ["RAJUK Approved", "Bank Loan Support", "Lift", "Generator", "Intercom", "Titanium Fitting"],
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=380&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=380&fit=crop",
        "https://images.unsplash.com/photo-1502005229762-ee1b2da7c5d6?w=600&h=380&fit=crop"
      ],
      description: "Prime location brand new apartment ready for immediate handover. Full title clearance, RAJUK registered, all utility lines completed. Up to 70% home loan processing support.",
      contactPhone: "+880 1713-998877",
      contactEmail: "inquiry@sheltech-bd.com"
    },
    {
      title: "Spacious 2-BHK Family Flat",
      purpose: "Rent" as const,
      agency: "Assure Group",
      agencyVerified: true,
      price: "৳24,000/mo",
      priceRaw: 24000,
      beds: "2 Beds",
      baths: "2 Baths",
      sqft: "1,150 sqft",
      propertyType: "Apartment" as const,
      furnished: "Semi-Furnished" as const,
      features: ["2 Large Verandas", "Dining Space", "Elevator", "Backup Generator", "Day & Night Guard"],
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=380&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=380&fit=crop",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=380&fit=crop"
      ],
      description: "Well-ventilated 2-bed apartment located on 4th floor with wide road access. Close to schools, supermarkets, mosques, and main transit stations.",
      contactPhone: "+880 1844-556677",
      contactEmail: "info@assuregroupbd.com"
    },
    {
      title: "Luxury 4-BHK Penthouse with Lake View",
      purpose: "Purchase" as const,
      agency: "Rangs Properties",
      agencyVerified: true,
      price: "৳3.40 Crore",
      priceRaw: 34000000,
      beds: "4 Beds",
      baths: "5 Baths",
      sqft: "3,400 sqft",
      propertyType: "Penthouse" as const,
      furnished: "Fully Furnished" as const,
      features: ["Private Terrace", "Jacuzzi", "Double Height Ceiling", "3 Dedicated Parking", "Smart Home Automation"],
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=380&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=380&fit=crop",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=380&fit=crop"
      ],
      description: "Exclusive top-floor penthouse with unobstructed 360-degree panoramic lake and skyline views. Features private landscaped rooftop terrace, imported German kitchen, and smart touch controls.",
      contactPhone: "+880 1714-112233",
      contactEmail: "penthouse@rangsproperties.com"
    },
    {
      title: "Master Bed Sublet with Attached Bathroom",
      purpose: "Rent" as const,
      agency: "Direct Owner / Verified",
      agencyVerified: true,
      price: "৳9,500/mo",
      priceRaw: 9500,
      beds: "Sublet / 1 Room",
      baths: "1 Bath",
      sqft: "280 sqft",
      propertyType: "Sublet" as const,
      furnished: "Fully Furnished" as const,
      features: ["Attached Bath & Balcony", "Gas & Electricity Included", "High Speed Wifi", "Shared Kitchen", "Safe & Quiet"],
      image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&h=380&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&h=380&fit=crop"
      ],
      description: "Large south-facing master bedroom with private attached bath and personal veranda. Suitable for executive jobholders or university students. Utilities included in rent.",
      contactPhone: "+880 1755-667788",
      contactEmail: "sublet.dhaka@gmail.com"
    },
    {
      title: "Duplex Villa with Rooftop Terrace for Sale",
      purpose: "Purchase" as const,
      agency: "Navana Real Estate",
      agencyVerified: true,
      price: "৳2.65 Crore",
      priceRaw: 26500000,
      beds: "4 Beds",
      baths: "4 Baths",
      sqft: "2,850 sqft",
      propertyType: "Duplex" as const,
      furnished: "Semi-Furnished" as const,
      features: ["Private Duplex Entry", "Internal Wooden Staircase", "Rooftop BBQ Zone", "2 Car Garage", "CCTV & Security"],
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=380&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=380&fit=crop",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=380&fit=crop"
      ],
      description: "Elegant duplex home spanning two upper floors. Elegant double-height lounge, private rooftop lawn with BBQ deck, independent power backup, and modern designer kitchen.",
      contactPhone: "+880 1817-123456",
      contactEmail: "sales@navanarealestate.com"
    },
    {
      title: "Executive 3-BHK Lake-Facing Flat",
      purpose: "Rent" as const,
      agency: "Bproperty.com",
      agencyVerified: true,
      price: "৳45,000/mo",
      priceRaw: 45000,
      beds: "3 Beds",
      baths: "3 Baths",
      sqft: "1,800 sqft",
      propertyType: "Apartment" as const,
      furnished: "Fully Furnished" as const,
      features: ["Lake View", "Servant Room & Bath", "Central Water Heater", "Gym & Play Area", "2 Elevators"],
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=380&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=380&fit=crop"
      ],
      description: "High-floor apartment with panoramic lake views. Fully furnished with modern furniture, smart TV, split ACs in all rooms, built-in oven, and dedicated servant quarter.",
      contactPhone: "+880 1711-234567",
      contactEmail: "rentals@bproperty.com"
    },
    {
      title: "Affordable 2-BHK Apartment for Purchase",
      purpose: "Purchase" as const,
      agency: "Concord Real Estate",
      agencyVerified: true,
      price: "৳78 Lakh",
      priceRaw: 7800000,
      beds: "2 Beds",
      baths: "2 Baths",
      sqft: "1,050 sqft",
      propertyType: "Apartment" as const,
      furnished: "Unfurnished" as const,
      features: ["Ready Handover", "Gas Line Active", "Lift & Generator", "Corner Plot", "Open View"],
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=380&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=380&fit=crop"
      ],
      description: "Excellent value 2-bed apartment in a developed residential community. Clear land registration, wide roads, 24/7 security guard, and nearby primary schools & hospitals.",
      contactPhone: "+880 1712-445566",
      contactEmail: "sales@concordgroupbd.com"
    },
    {
      title: "Furnished 1-BHK Bachelor / Couple Flat",
      purpose: "Rent" as const,
      agency: "Direct Owner / Verified",
      agencyVerified: true,
      price: "৳14,000/mo",
      priceRaw: 14000,
      beds: "1 Bed",
      baths: "1 Bath",
      sqft: "550 sqft",
      propertyType: "Apartment" as const,
      furnished: "Fully Furnished" as const,
      features: ["Separate Dining", "Veranda", "Fridge & Stove", "WiFi Ready", "CCTV Protected"],
      image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=380&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=380&fit=crop"
      ],
      description: "Clean and peaceful 1-bed flat with separate drawing-dining and kitchen. Ideal for working professionals or couples seeking a quiet living atmosphere.",
      contactPhone: "+880 1911-001122",
      contactEmail: "dhaka.rentals1@gmail.com"
    },
    {
      title: "Commercial Office Floor / Showroom Space for Rent",
      purpose: "Rent" as const,
      agency: "Asset Developments",
      agencyVerified: true,
      price: "৳85,000/mo",
      priceRaw: 85000,
      beds: "Open Floor",
      baths: "2 Baths",
      sqft: "2,500 sqft",
      propertyType: "Commercial" as const,
      furnished: "Unfurnished" as const,
      features: ["Main Road Facing", "Commercial Meter", "Central AC Provision", "Visitor Parking", "High Speed Lift"],
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=380&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=380&fit=crop"
      ],
      description: "Front-facing commercial open floor suitable for corporate offices, IT firms, diagnostics, or luxury fashion showrooms on main commercial avenue.",
      contactPhone: "+880 1715-334455",
      contactEmail: "commercial@asset.com.bd"
    }
  ];

  // Geographically scatter listings around user GPS coordinates
  const offsets = [
    { dLat: 0.0028, dLng: 0.0031, dist: 0.42 },
    { dLat: -0.0035, dLng: 0.0042, dist: 0.58 },
    { dLat: 0.0048, dLng: -0.0036, dist: 0.72 },
    { dLat: -0.0052, dLng: -0.0048, dist: 0.85 },
    { dLat: 0.0068, dLng: 0.0058, dist: 1.1 },
    { dLat: -0.0078, dLng: 0.0065, dist: 1.35 },
    { dLat: 0.0092, dLng: -0.0074, dist: 1.6 },
    { dLat: -0.0105, dLng: -0.0088, dist: 1.85 },
    { dLat: 0.0125, dLng: 0.0112, dist: 2.2 },
    { dLat: -0.0142, dLng: 0.0128, dist: 2.6 },
    { dLat: 0.0165, dLng: -0.0145, dist: 3.1 },
    { dLat: -0.0188, dLng: -0.0162, dist: 3.8 }
  ];

  return templateList.map((tpl, i) => {
    const off = offsets[i % offsets.length];
    const itemLat = Number((lat + off.dLat).toFixed(5));
    const itemLng = Number((lng + off.dLng).toFixed(5));
    const distanceKm = off.dist;

    return {
      id: `prop-${i + 1}`,
      title: tpl.title,
      purpose: tpl.purpose,
      agency: tpl.agency,
      agencyVerified: tpl.agencyVerified,
      price: tpl.price,
      priceRaw: tpl.priceRaw,
      beds: tpl.beds,
      baths: tpl.baths,
      sqft: tpl.sqft,
      location: `${area}, ${city}`,
      area,
      city,
      distance: formatDistance(distanceKm),
      distanceKm,
      lat: itemLat,
      lng: itemLng,
      image: tpl.image,
      gallery: tpl.gallery,
      features: tpl.features,
      propertyType: tpl.propertyType,
      furnished: tpl.furnished,
      description: tpl.description,
      contactPhone: tpl.contactPhone,
      contactEmail: tpl.contactEmail,
      isNearby: distanceKm <= 1.5,
      postedTime: `${(i % 5) + 1}d ago`
    };
  });
}
