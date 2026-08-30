export interface PrayerTimes {
  fajr?: string;
  dhuhr?: string;
  asr?: string;
  maghrib?: string;
  isha?: string;
  jummah?: string;
  dailyPuja?: string;
  sundayMass?: string;
  langarHours?: string;
}

export interface LiveReligionListing {
  id: string;
  name: string;
  type: "Mosque" | "Hindu Temple" | "Church" | "Gurdwara" | "Buddhist Temple" | "Synagogue";
  category: "mosque" | "temple" | "church" | "gurdwara" | "other";
  emoji: string;
  distance: string;
  distanceKm: number;
  address: string;
  city: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  openStatus: "Open" | "Prayer Time Soon" | "Closed";
  hours: string;
  phone: string;
  website: string;
  image: string;
  imageAlt?: string;
  languages: string[];
  features: string[];
  prayerTimes?: PrayerTimes;
  description: string;
  isNearby: boolean;
  isVerified: boolean;
  hasWomenSection: boolean;
  hasFreeFood: boolean;
}

// Distance helper
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
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

// Base seed religious places across NYC & USA
const BASE_RELIGIOUS_PLACES: Array<Omit<LiveReligionListing, "distance" | "distanceKm" | "isNearby">> = [
  {
    id: "rel-1",
    name: "Masjid At-Taqwa",
    type: "Mosque",
    category: "mosque",
    emoji: "🕌",
    address: "1266 Bedford Ave, Brooklyn, NY 11216",
    city: "Brooklyn, NY",
    lat: 40.6833,
    lng: -73.9547,
    rating: 4.9,
    reviews: 580,
    openStatus: "Open",
    hours: "5:00 AM – 10:00 PM (Daily)",
    phone: "+1 (718) 622-0800",
    website: "https://masjidattaqwa.org",
    image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&auto=format&fit=crop&q=80",
    languages: ["Arabic", "Bengali", "English", "Urdu"],
    features: ["Jumu'ah 1:15 PM", "Women's Section", "Islamic Weekend School", "Wudu Area", "Food Pantry"],
    prayerTimes: {
      fajr: "5:15 AM",
      dhuhr: "1:00 PM",
      asr: "4:45 PM",
      maghrib: "7:42 PM",
      isha: "9:05 PM",
      jummah: "1:15 PM & 2:00 PM"
    },
    description: "Historic community mosque with vibrant multi-ethnic congregation. Offers daily 5 times prayer, dual Jumu'ah shifts, women's prayer hall, and Saturday Islamic classes for kids.",
    isVerified: true,
    hasWomenSection: true,
    hasFreeFood: true
  },
  {
    id: "rel-2",
    name: "Jamaica Muslim Center (JMC)",
    type: "Mosque",
    category: "mosque",
    emoji: "🕌",
    address: "85-37 168th St, Jamaica, NY 11432",
    city: "Queens, NY",
    lat: 40.7103,
    lng: -73.7961,
    rating: 4.8,
    reviews: 1240,
    openStatus: "Open",
    hours: "Open 24 Hours for Prayers",
    phone: "+1 (718) 739-3182",
    website: "https://jamaicamuslimcenter.org",
    image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=600&auto=format&fit=crop&q=80",
    languages: ["Bengali", "English", "Arabic"],
    features: ["Jumu'ah (3 Shifts)", "Hifz Madrasa", "Halal Funeral Service", "Large Women Hall", "Immigrant Advice"],
    prayerTimes: {
      fajr: "5:20 AM",
      dhuhr: "1:15 PM",
      asr: "4:50 PM",
      maghrib: "7:40 PM",
      isha: "9:00 PM",
      jummah: "12:30 PM, 1:30 PM, 2:30 PM"
    },
    description: "One of the largest Bangladeshi American mosques and community centers in North America. Features comprehensive religious, educational, and social welfare services.",
    isVerified: true,
    hasWomenSection: true,
    hasFreeFood: true
  },
  {
    id: "rel-3",
    name: "Hindu Temple Society of North America (Ganesh Temple)",
    type: "Hindu Temple",
    category: "temple",
    emoji: "🛕",
    address: "45-57 Bowne St, Flushing, NY 11355",
    city: "Flushing, Queens, NY",
    lat: 40.7538,
    lng: -73.8217,
    rating: 4.8,
    reviews: 940,
    openStatus: "Open",
    hours: "8:00 AM – 8:30 PM (Daily)",
    phone: "+1 (718) 460-8484",
    website: "https://nyganeshtemple.org",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80",
    languages: ["Hindi", "Bengali", "Tamil", "English"],
    features: ["Daily Puja 9 AM & 6 PM", "Prasad Canteen", "Sanskrit Classes", "Cultural Audition Hall"],
    prayerTimes: {
      dailyPuja: "Morning 9:00 AM | Evening 6:30 PM"
    },
    description: "The oldest established traditional Hindu temple in North America. Offers daily Archana, Abhishekam, Prasad canteen with traditional vegetarian meals, and cultural festivals.",
    isVerified: true,
    hasWomenSection: true,
    hasFreeFood: true
  },
  {
    id: "rel-4",
    name: "St. Teresa of Avila Catholic Church",
    type: "Church",
    category: "church",
    emoji: "⛪",
    address: "563 Sterling Pl, Brooklyn, NY 11238",
    city: "Brooklyn, NY",
    lat: 40.6756,
    lng: -73.9602,
    rating: 4.7,
    reviews: 310,
    openStatus: "Open",
    hours: "7:00 AM – 7:00 PM",
    phone: "+1 (718) 622-4371",
    website: "https://stteresabrooklyn.org",
    image: "https://images.unsplash.com/photo-1548252539-48eb4ad5ae4d?w=600&auto=format&fit=crop&q=80",
    languages: ["English", "Spanish", "Haitian Creole"],
    features: ["Sunday Mass 9 AM & 11 AM", "Immigrant Outreach", "Weekly Food Bank", "Free ESL Classes"],
    prayerTimes: {
      sundayMass: "Sunday: 9:00 AM (Eng) | 11:30 AM (Spanish)"
    },
    description: "Welcoming Catholic parish with deep roots in supporting newcomers and immigrant families. Provides weekly food pantry, ESL tutoring, and community counseling.",
    isVerified: true,
    hasWomenSection: true,
    hasFreeFood: true
  },
  {
    id: "rel-5",
    name: "Sikh Cultural Center (Gurdwara)",
    type: "Gurdwara",
    category: "gurdwara",
    emoji: "🏛️",
    address: "95-30 118th St, Richmond Hill, NY 11419",
    city: "Richmond Hill, Queens, NY",
    lat: 40.6938,
    lng: -73.8295,
    rating: 4.9,
    reviews: 720,
    openStatus: "Open",
    hours: "Open 24 Hours",
    phone: "+1 (718) 846-8900",
    website: "https://sikhculturalcenter.com",
    image: "https://images.unsplash.com/photo-1590080876212-efba3f1e5e20?w=600&auto=format&fit=crop&q=80",
    languages: ["Punjabi", "Hindi", "English"],
    features: ["Free Langar 24/7", "Daily Kirtan", "Emergency Shelter Aid", "Community Legal Help"],
    prayerTimes: {
      langarHours: "24/7 Free Warm Meals"
    },
    description: "Traditional Gurdwara serving continuous free hot vegetarian meals (Langar) to everyone regardless of faith or background. Active newcomer community assistance.",
    isVerified: true,
    hasWomenSection: true,
    hasFreeFood: true
  },
  {
    id: "rel-6",
    name: "Parkchester Islamic Center",
    type: "Mosque",
    category: "mosque",
    emoji: "🕌",
    address: "1482 White Plains Rd, Bronx, NY 10462",
    city: "Bronx, NY",
    lat: 40.8372,
    lng: -73.8614,
    rating: 4.8,
    reviews: 430,
    openStatus: "Open",
    hours: "5:00 AM – 10:30 PM",
    phone: "+1 (718) 829-0525",
    website: "https://parkchesteric.org",
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop&q=80",
    languages: ["Bengali", "Arabic", "English"],
    features: ["Jumu'ah 1:30 PM", "Quran Classes", "Separate Women Hall", "Zakat Distribution"],
    prayerTimes: {
      fajr: "5:15 AM",
      dhuhr: "1:15 PM",
      asr: "4:45 PM",
      maghrib: "7:41 PM",
      isha: "9:00 PM",
      jummah: "1:30 PM"
    },
    description: "Prominent Bronx community mosque serving the Parkchester immigrant neighborhood. Offers 5 times daily prayers, family youth programs, and food donation.",
    isVerified: true,
    hasWomenSection: true,
    hasFreeFood: true
  },
  {
    id: "rel-7",
    name: "Eldridge Street Synagogue & Museum",
    type: "Synagogue",
    category: "other",
    emoji: "✡️",
    address: "12 Eldridge St, New York, NY 10002",
    city: "Manhattan, NY",
    lat: 40.7149,
    lng: -73.9939,
    rating: 4.7,
    reviews: 290,
    openStatus: "Open",
    hours: "10:00 AM – 5:00 PM",
    phone: "+1 (212) 219-0888",
    website: "https://eldridgestreet.org",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
    languages: ["Hebrew", "Yiddish", "English", "Mandarin"],
    features: ["Historic Sanctuary", "Community Tours", "Cultural Lectures", "Interfaith Workshops"],
    description: "National Historic Landmark preserving immigrant Jewish history in Lower East Side with interfaith community programs and cultural events.",
    isVerified: true,
    hasWomenSection: true,
    hasFreeFood: false
  },
  {
    id: "rel-8",
    name: "Mahamevnawa Buddhist Meditation Monastery",
    type: "Buddhist Temple",
    category: "other",
    emoji: "☸️",
    address: "349 S 3rd Ave, Mount Vernon, NY 10550",
    city: "Mount Vernon, NY",
    lat: 40.9082,
    lng: -73.8341,
    rating: 4.9,
    reviews: 180,
    openStatus: "Open",
    hours: "7:00 AM – 8:00 PM",
    phone: "+1 (914) 668-2340",
    website: "https://mahamevnawaboston.org",
    image: "https://images.unsplash.com/photo-1609137144822-26d9bc561845?w=600&auto=format&fit=crop&q=80",
    languages: ["Sinhala", "Bengali", "English"],
    features: ["Daily Meditation 6 PM", "Dhamma Talks", "Mindfulness Retreats", "Vegetarian Food"],
    description: "Peaceful Buddhist meditation center offering daily Theravada mindfulness practice, meditation classes, and guided wellness sessions.",
    isVerified: true,
    hasWomenSection: true,
    hasFreeFood: true
  }
];

// ─── DYNAMIC LOCATION-AWARE GENERATOR ───────────────────────────────────────
export function generateLiveLocationReligious(
  userLat: number,
  userLng: number,
  areaName: string = "Queens",
  cityName: string = "New York"
): LiveReligionListing[] {
  return BASE_RELIGIOUS_PLACES.map((base, idx) => {
    // Generate realistic nearby coordinate offset if dynamic
    const latOffset = (idx % 2 === 0 ? 1 : -1) * (0.004 * (idx + 1));
    const lngOffset = (idx % 3 === 0 ? -1 : 1) * (0.005 * (idx + 1));
    const placeLat = idx < 4 ? userLat + latOffset : base.lat;
    const placeLng = idx < 4 ? userLng + lngOffset : base.lng;

    const distanceKm = getDistanceKm(userLat, userLng, placeLat, placeLng);
    const isNearby = distanceKm <= 5.0;

    return {
      ...base,
      lat: placeLat,
      lng: placeLng,
      distanceKm,
      distance: formatDistance(distanceKm),
      isNearby,
      city: idx < 4 ? `${areaName}, ${cityName}` : base.city
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

// ─── QUERY MATCHER ──────────────────────────────────────────────────────────
export function matchReligionQuery(listing: LiveReligionListing, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();

  return (
    listing.name.toLowerCase().includes(q) ||
    listing.type.toLowerCase().includes(q) ||
    listing.city.toLowerCase().includes(q) ||
    listing.address.toLowerCase().includes(q) ||
    listing.languages.some(l => l.toLowerCase().includes(q)) ||
    listing.features.some(f => f.toLowerCase().includes(q)) ||
    listing.description.toLowerCase().includes(q)
  );
}
