export interface LiveFoodListing {
  id: string;
  title: string;
  agency: string;
  agencyVerified: boolean;
  mealType: "Hot Cooked Meals" | "Grocery / Ration Pack" | "Free Breakfast" | "Soup Kitchen & Iftar" | "Emergency Food Box";
  timeSlot: "breakfast" | "lunch" | "dinner" | "grocery" | "all_day";
  timeText: string;
  cost: "100% Free" | "Free Ration" | "৳1 Token Meal" | "Free for Families";
  days: string;
  servings: string;
  menuItems: string[];
  eligibility: string;
  location: string;
  lat: number;
  lng: number;
  distance: string;
  distanceKm: number;
  isNearby: boolean;
  image: string;
  gallery: string[];
  description: string;
  contactPhone: string;
  contactEmail: string;
  guidelines: string[];
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
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
  return R * c;
}

export function formatDistance(distKm: number): string {
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m away`;
  }
  return `${distKm.toFixed(1)} km away`;
}

// ─── Free Food Data Generator ───────────────────────────────────────────────

const BASE_FOOD_DRIVES: Array<Omit<LiveFoodListing, "lat" | "lng" | "distance" | "distanceKm" | "isNearby">> = [
  {
    id: "food-1",
    title: "Ek Takay Ahar - Daily Hot Meal Distribution",
    agency: "Bidyanondo Foundation",
    agencyVerified: true,
    mealType: "Hot Cooked Meals",
    timeSlot: "lunch",
    timeText: "12:30 PM – 2:30 PM",
    cost: "৳1 Token Meal",
    days: "Daily (7 Days a Week)",
    servings: "600+ Hot Meals daily",
    menuItems: ["Egg Polao & Dal", "Chicken Khichuri", "Fresh Salad", "Bottled Drinking Water"],
    eligibility: "Open to All — Slum children, Rickshaw pullers & Needy individuals",
    location: "Near Central Rail Station & Slum Point",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Bidyanondo's flagship 'Ek Takay Ahar' program providing dignified, freshly prepared hot meals cooked in automated sanitary kitchens. Token distributed at the venue queue.",
    contactPhone: "+880 1878-116230",
    contactEmail: "info@bidyanondo.org",
    guidelines: [
      "Queue token distributed 30 minutes before meal time",
      "Dignified clean dining space with separate family section",
      "Bottled purified drinking water provided with every meal"
    ]
  },
  {
    id: "food-2",
    title: "Mastul Free Community Kitchen & Langar",
    agency: "Mastul Foundation",
    agencyVerified: true,
    mealType: "Hot Cooked Meals",
    timeSlot: "dinner",
    timeText: "6:30 PM – 8:30 PM",
    cost: "100% Free",
    days: "Daily (Monday – Sunday)",
    servings: "450+ Dinners nightly",
    menuItems: ["Steamed Rice", "Fish / Chicken Curry", "Lentil Dal", "Vegetables & Lemon"],
    eligibility: "Open to All — Day laborers, Jobseekers, Homeless & Low income families",
    location: "Community Center Road",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Mastul Foundation's permanent daily open kitchen providing nutritious, wholesome evening dinners. No questions asked, everyone is treated as a guest.",
    contactPhone: "+880 1730-353685",
    contactEmail: "help@mastul.org",
    guidelines: [
      "No registration or documentation required",
      "First come, first served dining hall",
      "Takeaway allowed for elderly and disabled family members"
    ]
  },
  {
    id: "food-3",
    title: "Monthly Family Grocery & Ration Distribution Drive",
    agency: "As-Sunnah Foundation",
    agencyVerified: true,
    mealType: "Grocery / Ration Pack",
    timeSlot: "grocery",
    timeText: "9:00 AM – 4:00 PM",
    cost: "Free for Families",
    days: "Every Friday & Saturday",
    servings: "350 Family Grocery Boxes",
    menuItems: ["15kg Miniket Rice", "3kg Masoor Dal", "3L Soybean Oil", "5kg Potatoes", "2kg Salt & Sugar", "Spices Pack"],
    eligibility: "Low-income families, Widows, Unemployment affected households",
    location: "District Welfare Field & Main Point",
    image: "https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Monthly dry ration support box containing a full month's essential food pantry supplies for underprivileged and newcomer families.",
    contactPhone: "+880 9610-001000",
    contactEmail: "info@assunnahfoundation.org",
    guidelines: [
      "Bring a sturdy shopping bag or trolley for grocery packages",
      "Priority assistance for single mothers, widows, and senior citizens",
      "Pre-verified SMS or on-spot volunteer token verification"
    ]
  },
  {
    id: "food-4",
    title: "Free Morning Nutritious Breakfast Drive",
    agency: "JAAGO Foundation",
    agencyVerified: true,
    mealType: "Free Breakfast",
    timeSlot: "breakfast",
    timeText: "7:30 AM – 9:30 AM",
    cost: "100% Free",
    days: "Sunday – Thursday (School & Workdays)",
    servings: "300+ Breakfast Packs",
    menuItems: ["Boiled Eggs", "Banana & Seasonal Fruits", "Fresh Milk Pack", "Fortified Bread / Porridge"],
    eligibility: "Slum School Students, Street Vendors, Early-morning jobseekers",
    location: "JAAGO Community Learning Point",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Healthy morning breakfast initiative to combat malnutrition among children and low-wage workers starting early work shifts.",
    contactPhone: "+880 1766-666654",
    contactEmail: "volunteer@jaago.com.bd",
    guidelines: [
      "Available from 7:30 AM sharp until supplies last",
      "Special priority queue for mothers and small kids",
      "Hygienic packed take-and-eat packs"
    ]
  },
  {
    id: "food-5",
    title: "Emergency Food Relief & Warm Soup Kitchen",
    agency: "Sajida Foundation",
    agencyVerified: true,
    mealType: "Hot Cooked Meals",
    timeSlot: "lunch",
    timeText: "1:00 PM – 3:00 PM",
    cost: "100% Free",
    days: "Daily (7 Days)",
    servings: "500+ Hot Meals",
    menuItems: ["Beef/Soy Khichuri", "Egg Curry", "Mixed Vegetables", "Purified Water"],
    eligibility: "Open to All in need",
    location: "Sajida Hospital Relief Gate",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Daily cooked meal program serving hospital attendees, attendant families, and neighborhood distressed communities.",
    contactPhone: "+880 2-8878051",
    contactEmail: "info@sajidafoundation.org",
    guidelines: [
      "Hospital patient attendants receive direct coupon",
      "Queue line opens at 12:45 PM"
    ]
  },
  {
    id: "food-6",
    title: "Community Red Crescent Food Pantry",
    agency: "Red Crescent Society",
    agencyVerified: true,
    mealType: "Emergency Food Box",
    timeSlot: "grocery",
    timeText: "10:00 AM – 3:00 PM",
    cost: "Free Ration",
    days: "Monday, Wednesday, Saturday",
    servings: "250 Emergency Relief Packs",
    menuItems: ["10kg Rice", "2kg Lentils", "2L Cooking Oil", "Nutritional Biscuits", "Water Purification Tablets"],
    eligibility: "Disaster impacted families, Urban poor & Low income households",
    location: "Red Crescent Youth Center",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Official humanitarian emergency pantry distribution providing dry rations for families facing sudden financial distress or relocation.",
    contactPhone: "+880 2-9330188",
    contactEmail: "info@bdrcs.org",
    guidelines: [
      "One package per family unit per distribution cycle",
      "Wheelchair and disabled priority access lane available"
    ]
  },
  {
    id: "food-7",
    title: "GoodyBro Evening Dawat - Free Hot Dinner",
    agency: "GoodyBro Community Kitchen",
    agencyVerified: true,
    mealType: "Hot Cooked Meals",
    timeSlot: "dinner",
    timeText: "7:00 PM – 9:00 PM",
    cost: "100% Free",
    days: "Every Friday, Saturday & Tuesday",
    servings: "400+ Meals",
    menuItems: ["Mutton Tehari", "Chicken Biryani", "Borhani", "Sweet Firni"],
    eligibility: "Open to All with respect & love",
    location: "GoodyBro Kitchen, Block C",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Youth-led community kitchen distributing festival-quality Biryani and hot meals with dignity to street workers and jobseekers.",
    contactPhone: "+880 1911-223344",
    contactEmail: "volunteer@goodybro.org",
    guidelines: [
      "Sit-and-eat hot meal service",
      "Unlimited second servings for hunger satisfaction"
    ]
  },
  {
    id: "food-8",
    title: "Chhaya Food Bank - Student & Senior Grocery Shelf",
    agency: "Chhaya Food Bank",
    agencyVerified: true,
    mealType: "Grocery / Ration Pack",
    timeSlot: "grocery",
    timeText: "11:00 AM – 5:00 PM",
    cost: "100% Free",
    days: "Daily (Sun – Fri)",
    servings: "200 Grocery Hampers",
    menuItems: ["Atta (Flour) 5kg", "Rice 5kg", "Eggs 1 Dozen", "Dal 1kg", "Milk & Tea Pack"],
    eligibility: "Unemployed youth, Mess students, Senior citizens",
    location: "Chhaya Resource Center",
    image: "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Community grocery shelf where anyone in need can pick up fresh staples and essentials with total privacy and dignity.",
    contactPhone: "+880 1819-998877",
    contactEmail: "support@chhayabd.org",
    guidelines: [
      "Pick your required items directly from shelves",
      "Clean carry bags available for free"
    ]
  },
  {
    id: "food-9",
    title: "Daily Free Lunch for Slum Kids & Workers",
    agency: "Al-Khidmat Foundation",
    agencyVerified: true,
    mealType: "Hot Cooked Meals",
    timeSlot: "lunch",
    timeText: "12:00 PM – 2:00 PM",
    cost: "100% Free",
    days: "Daily (Monday – Sunday)",
    servings: "350 Meals",
    menuItems: ["Plain Rice", "Chicken Curry", "Dal", "Salad & Green Chili"],
    eligibility: "Open to All",
    location: "Al-Khidmat Relief Center",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Consistent lunchtime community meal drive ensuring nobody goes hungry in the local neighborhood.",
    contactPhone: "+880 1711-445566",
    contactEmail: "dhaka@alkhidmat.org",
    guidelines: [
      "Freshly cooked daily meals served hot",
      "Drinking water dispenser on site"
    ]
  },
  {
    id: "food-10",
    title: "Anjuman Community Langar & Iftar Program",
    agency: "Anjuman Mufidul Islam",
    agencyVerified: true,
    mealType: "Soup Kitchen & Iftar",
    timeSlot: "dinner",
    timeText: "5:30 PM – 7:30 PM",
    cost: "100% Free",
    days: "Daily (All Year)",
    servings: "500+ Daily Meals",
    menuItems: ["Khichuri & Boiled Eggs", "Dates & Fruits", "Chola Bhuna & Jilapi", "Sherbet"],
    eligibility: "Open to All — Travelers, Needy & Homeless",
    location: "Anjuman Central Complex",
    image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Centuries-old humanitarian organization providing daily evening meals and emergency dry food to vulnerable people.",
    contactPhone: "+880 2-7111222",
    contactEmail: "info@anjumanbd.org",
    guidelines: [
      "Special sitting area for elderly citizens and women",
      "Clean sanitized dining area"
    ]
  },
  {
    id: "food-11",
    title: "Community Mosque Friday Jumu'ah Tabarruk & Meal",
    agency: "Direct Volunteer / Community Mosque",
    agencyVerified: true,
    mealType: "Hot Cooked Meals",
    timeSlot: "lunch",
    timeText: "1:30 PM – 3:30 PM",
    cost: "100% Free",
    days: "Every Friday",
    servings: "800+ Plates",
    menuItems: ["Beef Kacchi Biryani", "Chicken Roast & Polao", "Salad", "Borhani"],
    eligibility: "Open to All Friday worshippers, Travellers & Local needy",
    location: "Grand Jame Mosque Complex",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Weekly Friday afternoon grand meal distribution organized through community contributions and volunteers.",
    contactPhone: "+880 1844-001122",
    contactEmail: "jumuah@grandmosque.org",
    guidelines: [
      "Served right after Friday prayer concludes",
      "Takeaway packets available for families"
    ]
  },
  {
    id: "food-12",
    title: "Spandan Slum Morning Egg & Bread Box",
    agency: "Spandan NGO Bangladesh",
    agencyVerified: true,
    mealType: "Free Breakfast",
    timeSlot: "breakfast",
    timeText: "7:00 AM – 9:00 AM",
    cost: "100% Free",
    days: "Daily (Monday – Saturday)",
    servings: "250 Breakfast Packs",
    menuItems: ["Boiled Egg", "Milk Bun", "Fresh Banana", "Fruit Juice"],
    eligibility: "Children, Daily wage laborers, Elderly",
    location: "Railway Colony Primary Yard",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Targeted morning nutrition drive for street children and slum families before school and work hours.",
    contactPhone: "+880 1788-990011",
    contactEmail: "contact@spandanbd.org",
    guidelines: [
      "Hand sanitization before meal collection",
      "Tokens provided in order of arrival"
    ]
  }
];

const GEO_OFFSETS = [
  { lat: 0.0035, lng: 0.0028, isNearby: true },
  { lat: -0.0042, lng: 0.0055, isNearby: true },
  { lat: 0.0068, lng: -0.0038, isNearby: true },
  { lat: -0.0055, lng: -0.0062, isNearby: true },
  { lat: 0.0088, lng: 0.0075, isNearby: true },
  { lat: -0.0092, lng: 0.0045, isNearby: true },
  { lat: 0.0145, lng: -0.0118, isNearby: false },
  { lat: -0.0162, lng: 0.0155, isNearby: false },
  { lat: 0.0210, lng: 0.0185, isNearby: false },
  { lat: -0.0245, lng: -0.0210, isNearby: false },
  { lat: 0.0285, lng: -0.0255, isNearby: false },
  { lat: -0.0320, lng: 0.0295, isNearby: false }
];

export function generateLiveLocationFreeFood(
  userLat: number,
  userLng: number,
  userArea: string = "Dhaka Area",
  userCity: string = "Dhaka"
): LiveFoodListing[] {
  return BASE_FOOD_DRIVES.map((base, idx) => {
    const offset = GEO_OFFSETS[idx % GEO_OFFSETS.length];
    const lat = userLat + offset.lat;
    const lng = userLng + offset.lng;
    const distKm = getDistanceKm(userLat, userLng, lat, lng);
    const isNearby = offset.isNearby;

    let dynamicLocation = base.location;
    if (isNearby) {
      dynamicLocation = `${userArea}, ${userCity}`;
    } else {
      dynamicLocation = `${userCity} Metro Area`;
    }

    return {
      ...base,
      lat,
      lng,
      distance: formatDistance(distKm),
      distanceKm: distKm,
      isNearby,
      location: dynamicLocation
    };
  });
}

// ─── Smart Natural Language Query Matcher ───────────────────────────────────

const STOP_WORDS = new Set([
  "i", "want", "need", "looking", "for", "a", "an", "the", "in", "at", "near", "around",
  "some", "any", "please", "help", "me", "find", "get", "give", "show", "can", "is",
  "are", "to", "and", "or", "of", "with", "food", "free", "khabar", "meal", "drive"
]);

export function matchFreeFoodQuery(listing: LiveFoodListing, query: string): boolean {
  if (!query || !query.trim()) return true;

  const normalizedQuery = query.toLowerCase().trim();

  // 1. Direct Substring Match
  if (
    listing.title.toLowerCase().includes(normalizedQuery) ||
    listing.agency.toLowerCase().includes(normalizedQuery) ||
    listing.mealType.toLowerCase().includes(normalizedQuery) ||
    listing.timeSlot.toLowerCase().includes(normalizedQuery) ||
    listing.timeText.toLowerCase().includes(normalizedQuery) ||
    listing.cost.toLowerCase().includes(normalizedQuery) ||
    listing.location.toLowerCase().includes(normalizedQuery) ||
    listing.eligibility.toLowerCase().includes(normalizedQuery) ||
    listing.description.toLowerCase().includes(normalizedQuery) ||
    listing.menuItems.some(item => item.toLowerCase().includes(normalizedQuery))
  ) {
    return true;
  }

  // 2. Tokenize and filter stop words
  const rawWords = normalizedQuery
    .replace(/[^\w\s\d]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 1);

  if (rawWords.length === 0) return true;

  const keywords = rawWords.filter(w => !STOP_WORDS.has(w));
  const searchTokens = keywords.length > 0 ? keywords : rawWords;

  const titleLower = listing.title.toLowerCase();
  const agencyLower = listing.agency.toLowerCase();
  const mealTypeLower = listing.mealType.toLowerCase();
  const timeTextLower = listing.timeText.toLowerCase();
  const costLower = listing.cost.toLowerCase();
  const locationLower = listing.location.toLowerCase();
  const descLower = listing.description.toLowerCase();
  const menuJoined = listing.menuItems.join(" ").toLowerCase();

  return searchTokens.some(token => {
    // Time matching
    if (token === "breakfast" || token === "morning" || token === "shokal") {
      return listing.timeSlot === "breakfast" || timeTextLower.includes("am");
    }
    if (token === "lunch" || token === "noon" || token === "dupur") {
      return listing.timeSlot === "lunch" || timeTextLower.includes("pm");
    }
    if (token === "dinner" || token === "night" || token === "evening" || token === "raat" || token === "iftar") {
      return listing.timeSlot === "dinner" || mealTypeLower.includes("iftar");
    }
    if (token === "grocery" || token === "ration" || token === "rice" || token === "dal" || token === "tel" || token === "chal") {
      return listing.mealType.includes("Grocery") || listing.mealType.includes("Ration") || menuJoined.includes("rice");
    }
    if (token === "bidyanondo" || token === "1taka" || token === "ek" || token === "taka") {
      return agencyLower.includes("bidyanondo") || costLower.includes("৳1");
    }
    if (token === "mastul" || token === "assunnah" || token === "sunnah" || token === "jaago" || token === "sajida") {
      return agencyLower.includes(token);
    }

    return (
      titleLower.includes(token) ||
      agencyLower.includes(token) ||
      mealTypeLower.includes(token) ||
      timeTextLower.includes(token) ||
      costLower.includes(token) ||
      locationLower.includes(token) ||
      descLower.includes(token) ||
      menuJoined.includes(token)
    );
  });
}
