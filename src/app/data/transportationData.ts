// ─── USA Immigrant Transportation Data Model & Services ─────────────────────
// Supports Bus, Train, and Subway with stations, timetables, real-time seat availability,
// and official booking provider links (Greyhound, FlixBus, Megabus, Amtrak, MTA OMNY).

export type TransitCategory = "bus" | "train" | "subway";

export interface TransitStation {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  coords: [number, number]; // [lat, lng]
  category: TransitCategory | "all";
  lines: string[];
  address: string;
  isMajorHub?: boolean;
}

export interface TransitRide {
  id: string;
  category: TransitCategory;
  operator: string;
  operatorCode: string;
  vehicleNumber: string; // "BN" in flowchart (e.g. Greyhound #GL-1042)
  vehicleType: string; // e.g. "Express Motorcoach", "Amtrak Regional Train", "MTA Express Subway"
  operatorLogo: string; // Brand color or initial
  operatorBadgeColor: string;
  fromStationId: string;
  fromStationName: string;
  toStationId: string;
  toStationName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  durationMinutes: number;
  price: number;
  originalPrice?: number;
  seatsLeft: number; // "Seat left" in flowchart
  seatStatus: "critical" | "filling" | "available" | "unlimited";
  transfers: number; // 0 = Direct / Non-stop
  amenities: string[];
  rating: number;
  reviewsCount: number;
  tag?: "cheapest" | "fastest" | "best-value" | "popular";
  externalBookingUrl: string; // "another page / External" in flowchart
  officialProviderName: string;
  routeCoords?: [number, number][];
}

// ── 1. USA STATIONS DIRECTORY (Bus, Train, Subway) ───────────────────────────

export const USA_TRANSIT_STATIONS: TransitStation[] = [
  // ── BUS STATIONS ──
  {
    id: "bus_pabt_nyc",
    name: "Port Authority Bus Terminal",
    code: "PABT",
    city: "New York",
    state: "NY",
    coords: [40.7569, -73.9903],
    category: "bus",
    lines: ["Greyhound", "FlixBus", "Megabus", "Peter Pan", "NJ Transit Bus"],
    address: "625 8th Ave, New York, NY 10018",
    isMajorHub: true,
  },
  {
    id: "bus_south_bos",
    name: "South Station Bus Terminal",
    code: "BOS-BUS",
    city: "Boston",
    state: "MA",
    coords: [42.3523, -71.0552],
    category: "bus",
    lines: ["Greyhound", "Peter Pan", "FlixBus", "Megabus"],
    address: "700 Atlantic Ave, Boston, MA 02110",
    isMajorHub: true,
  },
  {
    id: "bus_30th_phl",
    name: "30th Street Station Bus Terminal",
    code: "PHL-BUS",
    city: "Philadelphia",
    state: "PA",
    coords: [39.9558, -75.1820],
    category: "bus",
    lines: ["Megabus", "FlixBus", "Greyhound"],
    address: "30th & Market St, Philadelphia, PA 19104",
    isMajorHub: true,
  },
  {
    id: "bus_union_was",
    name: "Washington Union Station Bus Deck",
    code: "WAS-BUS",
    city: "Washington",
    state: "DC",
    coords: [38.8973, -77.0063],
    category: "bus",
    lines: ["Greyhound", "Megabus", "Peter Pan", "FlixBus", "BestBus"],
    address: "50 Massachusetts Ave NE, Washington, DC 20002",
    isMajorHub: true,
  },
  {
    id: "bus_newark_nj",
    name: "Newark Penn Bus Plaza",
    code: "EWR-BUS",
    city: "Newark",
    state: "NJ",
    coords: [40.7342, -74.1643],
    category: "bus",
    lines: ["NJ Transit", "Coach USA", "Greyhound"],
    address: "1 Raymond Plaza W, Newark, NJ 07102",
  },
  {
    id: "bus_baltimore_md",
    name: "Baltimore Downtown Bus Terminal",
    code: "BAL-BUS",
    city: "Baltimore",
    state: "MD",
    coords: [39.2847, -76.6205],
    category: "bus",
    lines: ["Greyhound", "FlixBus", "Megabus"],
    address: "2110 Haines St, Baltimore, MD 21230",
  },
  {
    id: "bus_atlantic_nj",
    name: "Atlantic City Bus Terminal",
    code: "ACY-BUS",
    city: "Atlantic City",
    state: "NJ",
    coords: [39.3621, -74.4338],
    category: "bus",
    lines: ["NJ Transit 551", "Greyhound Express"],
    address: "1901 Atlantic Ave, Atlantic City, NJ 08401",
  },

  // ── TRAIN STATIONS (Amtrak, Commuter Rail) ──
  {
    id: "train_penn_nyc",
    name: "Moynihan Train Hall / Penn Station",
    code: "NYP",
    city: "New York",
    state: "NY",
    coords: [40.7505, -73.9934],
    category: "train",
    lines: ["Amtrak Acela", "Northeast Regional", "NJ Transit Rail", "LIRR"],
    address: "390 9th Ave, New York, NY 10001",
    isMajorHub: true,
  },
  {
    id: "train_south_bos",
    name: "Boston South Station Amtrak",
    code: "BOS",
    city: "Boston",
    state: "MA",
    coords: [42.3519, -71.0551],
    category: "train",
    lines: ["Amtrak Acela", "Northeast Regional", "Lake Shore Limited", "MBTA"],
    address: "700 Atlantic Ave, Boston, MA 02110",
    isMajorHub: true,
  },
  {
    id: "train_30th_phl",
    name: "William H. Gray III 30th St Station",
    code: "PHL",
    city: "Philadelphia",
    state: "PA",
    coords: [39.9556, -75.1818],
    category: "train",
    lines: ["Amtrak Acela", "Northeast Regional", "Keystone Service", "SEPTA"],
    address: "2955 Market St, Philadelphia, PA 19104",
    isMajorHub: true,
  },
  {
    id: "train_union_was",
    name: "Washington Union Station (Amtrak)",
    code: "WAS",
    city: "Washington",
    state: "DC",
    coords: [38.8974, -77.0065],
    category: "train",
    lines: ["Amtrak Acela", "Northeast Regional", "Silver Meteor", "MARC", "VRE"],
    address: "50 Massachusetts Ave NE, Washington, DC 20002",
    isMajorHub: true,
  },
  {
    id: "train_newark_nj",
    name: "Newark Penn Station (Amtrak/NJ Transit)",
    code: "NWK",
    city: "Newark",
    state: "NJ",
    coords: [40.7344, -74.1645],
    category: "train",
    lines: ["Amtrak Regional", "NJ Transit Northeast Corridor", "PATH Train"],
    address: "1 Raymond Plaza W, Newark, NJ 07102",
  },
  {
    id: "train_stamford_ct",
    name: "Stamford Transportation Center",
    code: "STM",
    city: "Stamford",
    state: "CT",
    coords: [41.0469, -73.5425],
    category: "train",
    lines: ["Amtrak Northeast Regional", "Metro-North New Haven Line"],
    address: "Washington Blvd, Stamford, CT 06902",
  },
  {
    id: "train_newhaven_ct",
    name: "New Haven Union Station",
    code: "NHV",
    city: "New Haven",
    state: "CT",
    coords: [41.2974, -72.9268],
    category: "train",
    lines: ["Amtrak", "Metro-North", "Shore Line East", "Hartford Line"],
    address: "50 Union Ave, New Haven, CT 06519",
  },

  // ── SUBWAY STATIONS (NYC MTA, Commuter Metro) ──
  {
    id: "subway_times_sq",
    name: "Times Square - 42nd St Subway",
    code: "MTA-TSQ",
    city: "New York",
    state: "NY",
    coords: [40.7557, -73.9866],
    category: "subway",
    lines: ["1", "2", "3", "7", "N", "Q", "R", "W", "S"],
    address: "Broadway & 42nd St, New York, NY 10036",
    isMajorHub: true,
  },
  {
    id: "subway_grand_central",
    name: "Grand Central - 42nd St Subway",
    code: "MTA-GC",
    city: "New York",
    state: "NY",
    coords: [40.7527, -73.9772],
    category: "subway",
    lines: ["4", "5", "6", "7", "S Shuttle"],
    address: "Park Ave & 42nd St, New York, NY 10017",
    isMajorHub: true,
  },
  {
    id: "subway_fulton_st",
    name: "Fulton Center Transit Hub",
    code: "MTA-FLT",
    city: "New York",
    state: "NY",
    coords: [40.7100, -74.0080],
    category: "subway",
    lines: ["2", "3", "4", "5", "A", "C", "J", "Z"],
    address: "200 Broadway, New York, NY 10038",
    isMajorHub: true,
  },
  {
    id: "subway_jackson_heights",
    name: "Jackson Heights - Roosevelt Ave / 74th St",
    code: "MTA-JH74",
    city: "New York",
    state: "NY",
    coords: [40.7466, -73.8913],
    category: "subway",
    lines: ["7", "E", "F", "M", "R"],
    address: "Roosevelt Ave & 74th St, Queens, NY 11372",
    isMajorHub: true,
  },
  {
    id: "subway_atlantic_ave",
    name: "Atlantic Ave - Barclays Center",
    code: "MTA-ATL",
    city: "New York",
    state: "NY",
    coords: [40.6841, -73.9785],
    category: "subway",
    lines: ["2", "3", "4", "5", "B", "D", "N", "Q", "R"],
    address: "Atlantic Ave & Flatbush Ave, Brooklyn, NY 11217",
    isMajorHub: true,
  },
  {
    id: "subway_flushing_main",
    name: "Flushing - Main Street (Line 7)",
    code: "MTA-FLSH",
    city: "New York",
    state: "NY",
    coords: [40.7596, -73.8300],
    category: "subway",
    lines: ["7 Local", "7 Express"],
    address: "Main St & Roosevelt Ave, Queens, NY 11354",
  },
  {
    id: "subway_coney_island",
    name: "Coney Island - Stillwell Ave",
    code: "MTA-CI",
    city: "New York",
    state: "NY",
    coords: [40.5774, -73.9812],
    category: "subway",
    lines: ["D", "F", "N", "Q"],
    address: "Stillwell Ave & Surf Ave, Brooklyn, NY 11224",
  },
];

// ── 2. REALISTIC MASTER RIDES & TIMETABLES ───────────────────────────────────

export const MASTER_TRANSIT_RIDES: TransitRide[] = [
  // ═════════════════════════════════════════════════════════════════════════════
  // BUS RIDES (Greyhound, FlixBus, Megabus, Peter Pan)
  // ═════════════════════════════════════════════════════════════════════════════
  {
    id: "ride_bus_gh_1042",
    category: "bus",
    operator: "Greyhound Express",
    operatorCode: "GH",
    vehicleNumber: "Bus #GL-1042",
    vehicleType: "Luxury Motorcoach",
    operatorLogo: "🐕",
    operatorBadgeColor: "#0284C7",
    fromStationId: "bus_pabt_nyc",
    fromStationName: "Port Authority Bus Terminal (NYC)",
    toStationId: "bus_30th_phl",
    toStationName: "30th Street Station (Philadelphia)",
    departureTime: "07:30 AM",
    arrivalTime: "09:40 AM",
    duration: "2h 10m",
    durationMinutes: 130,
    price: 18.50,
    originalPrice: 26.00,
    seatsLeft: 4,
    seatStatus: "critical",
    transfers: 0,
    amenities: ["Free High-speed Wi-Fi", "AC Power Outlets", "Restroom Onboard", "Reclining Seats", "2 Free Bags"],
    rating: 4.6,
    reviewsCount: 1420,
    tag: "cheapest",
    externalBookingUrl: "https://www.greyhound.com",
    officialProviderName: "Greyhound Lines Inc.",
    routeCoords: [
      [40.7569, -73.9903],
      [40.7342, -74.1643],
      [40.4862, -74.4518],
      [40.2206, -74.7597],
      [39.9558, -75.1820],
    ],
  },
  {
    id: "ride_bus_flix_302",
    category: "bus",
    operator: "FlixBus USA",
    operatorCode: "FLIX",
    vehicleNumber: "Bus #FX-302",
    vehicleType: "Green Eco-Coach",
    operatorLogo: "🟢",
    operatorBadgeColor: "#16A34A",
    fromStationId: "bus_pabt_nyc",
    fromStationName: "Port Authority Bus Terminal (NYC)",
    toStationId: "bus_30th_phl",
    toStationName: "30th Street Station (Philadelphia)",
    departureTime: "08:45 AM",
    arrivalTime: "10:50 AM",
    duration: "2h 05m",
    durationMinutes: 125,
    price: 21.00,
    seatsLeft: 12,
    seatStatus: "filling",
    transfers: 0,
    amenities: ["Wi-Fi & Media Lounge", "USB Charger", "Extra Legroom", "Restroom", "Overhead Storage"],
    rating: 4.7,
    reviewsCount: 980,
    tag: "fastest",
    externalBookingUrl: "https://www.flixbus.com",
    officialProviderName: "FlixMobility USA",
    routeCoords: [
      [40.7569, -73.9903],
      [40.6976, -74.2045],
      [40.1834, -74.8321],
      [39.9558, -75.1820],
    ],
  },
  {
    id: "ride_bus_mega_21",
    category: "bus",
    operator: "Megabus USA",
    operatorCode: "MEGA",
    vehicleNumber: "Bus #MB-21X",
    vehicleType: "Double-Decker Express",
    operatorLogo: "🚍",
    operatorBadgeColor: "#2563EB",
    fromStationId: "bus_pabt_nyc",
    fromStationName: "Port Authority Bus Terminal (NYC)",
    toStationId: "bus_union_was",
    toStationName: "Washington Union Station (DC)",
    departureTime: "09:15 AM",
    arrivalTime: "01:45 PM",
    duration: "4h 30m",
    durationMinutes: 270,
    price: 24.50,
    originalPrice: 34.00,
    seatsLeft: 7,
    seatStatus: "filling",
    transfers: 0,
    amenities: ["Panoramic Upper Deck", "Power Outlets", "Air Conditioned", "Wi-Fi", "Luggage Hold"],
    rating: 4.5,
    reviewsCount: 2150,
    tag: "best-value",
    externalBookingUrl: "https://us.megabus.com",
    officialProviderName: "Megabus North America",
    routeCoords: [
      [40.7569, -73.9903],
      [40.7342, -74.1643],
      [39.9558, -75.1820],
      [39.2847, -76.6205],
      [38.8973, -77.0063],
    ],
  },
  {
    id: "ride_bus_peterpan_88",
    category: "bus",
    operator: "Peter Pan Bus Lines",
    operatorCode: "PP",
    vehicleNumber: "Bus #PP-88",
    vehicleType: "New England Coach",
    operatorLogo: "🪶",
    operatorBadgeColor: "#059669",
    fromStationId: "bus_pabt_nyc",
    fromStationName: "Port Authority Bus Terminal (NYC)",
    toStationId: "bus_south_bos",
    toStationName: "South Station Bus Terminal (Boston)",
    departureTime: "10:00 AM",
    arrivalTime: "02:15 PM",
    duration: "4h 15m",
    durationMinutes: 255,
    price: 28.00,
    originalPrice: 38.00,
    seatsLeft: 18,
    seatStatus: "available",
    transfers: 0,
    amenities: ["Guaranteed Seating", "Wi-Fi Streaming", "Power Plugs", "Climate Control", "Carry-on Allowed"],
    rating: 4.8,
    reviewsCount: 1640,
    tag: "popular",
    externalBookingUrl: "https://peterpanbus.com",
    officialProviderName: "Peter Pan Bus Lines",
    routeCoords: [
      [40.7569, -73.9903],
      [41.0469, -73.5425],
      [41.2974, -72.9268],
      [41.8240, -71.4128],
      [42.3523, -71.0552],
    ],
  },
  {
    id: "ride_bus_gh_1210",
    category: "bus",
    operator: "Greyhound Express",
    operatorCode: "GH",
    vehicleNumber: "Bus #GL-1210",
    vehicleType: "Midday Coach",
    operatorLogo: "🐕",
    operatorBadgeColor: "#0284C7",
    fromStationId: "bus_pabt_nyc",
    fromStationName: "Port Authority Bus Terminal (NYC)",
    toStationId: "bus_union_was",
    toStationName: "Washington Union Station (DC)",
    departureTime: "01:30 PM",
    arrivalTime: "05:55 PM",
    duration: "4h 25m",
    durationMinutes: 265,
    price: 22.00,
    seatsLeft: 3,
    seatStatus: "critical",
    transfers: 0,
    amenities: ["Free Wi-Fi", "USB Ports", "Restroom", "2 Bags Included", "Live Bus Tracking"],
    rating: 4.6,
    reviewsCount: 1100,
    tag: "cheapest",
    externalBookingUrl: "https://www.greyhound.com",
    officialProviderName: "Greyhound Lines Inc.",
    routeCoords: [
      [40.7569, -73.9903],
      [40.7342, -74.1643],
      [39.9558, -75.1820],
      [39.2847, -76.6205],
      [38.8973, -77.0063],
    ],
  },
  {
    id: "ride_bus_flix_905",
    category: "bus",
    operator: "FlixBus USA",
    operatorCode: "FLIX",
    vehicleNumber: "Bus #FX-905",
    vehicleType: "Express Night Owl",
    operatorLogo: "🟢",
    operatorBadgeColor: "#16A34A",
    fromStationId: "bus_pabt_nyc",
    fromStationName: "Port Authority Bus Terminal (NYC)",
    toStationId: "bus_south_bos",
    toStationName: "South Station Bus Terminal (Boston)",
    departureTime: "03:15 PM",
    arrivalTime: "07:30 PM",
    duration: "4h 15m",
    durationMinutes: 255,
    price: 25.00,
    seatsLeft: 22,
    seatStatus: "available",
    transfers: 0,
    amenities: ["Free Wi-Fi", "Restroom", "Power Plugs", "Spacious Seats"],
    rating: 4.7,
    reviewsCount: 750,
    externalBookingUrl: "https://www.flixbus.com",
    officialProviderName: "FlixMobility USA",
    routeCoords: [
      [40.7569, -73.9903],
      [41.0469, -73.5425],
      [41.2974, -72.9268],
      [42.3523, -71.0552],
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // TRAIN RIDES (Amtrak Acela, Northeast Regional, Commuter Rail)
  // ═════════════════════════════════════════════════════════════════════════════
  {
    id: "ride_train_amtrak_171",
    category: "train",
    operator: "Amtrak Northeast Regional",
    operatorCode: "AMTK",
    vehicleNumber: "Train #171",
    vehicleType: "Electric Intercity Rail",
    operatorLogo: "🚅",
    operatorBadgeColor: "#1E3A8A",
    fromStationId: "train_penn_nyc",
    fromStationName: "Moynihan Train Hall / Penn Station (NYC)",
    toStationId: "train_30th_phl",
    toStationName: "30th Street Station (Philadelphia)",
    departureTime: "07:05 AM",
    arrivalTime: "08:26 AM",
    duration: "1h 21m",
    durationMinutes: 81,
    price: 34.00,
    originalPrice: 48.00,
    seatsLeft: 14,
    seatStatus: "available",
    transfers: 0,
    amenities: ["High-speed Amtrak Wi-Fi", "Cafe Car / Hot Meals", "120V Outlets at Every Seat", "Quiet Car Available", "No Middle Seats"],
    rating: 4.8,
    reviewsCount: 3840,
    tag: "best-value",
    externalBookingUrl: "https://www.amtrak.com",
    officialProviderName: "National Railroad Passenger Corp.",
    routeCoords: [
      [40.7505, -73.9934],
      [40.7344, -74.1645],
      [40.2206, -74.7597],
      [39.9556, -75.1818],
    ],
  },
  {
    id: "ride_train_acela_2150",
    category: "train",
    operator: "Amtrak Acela Express",
    operatorCode: "ACELA",
    vehicleNumber: "Acela #2150",
    vehicleType: "High-Speed Rail (150 mph)",
    operatorLogo: "⚡",
    operatorBadgeColor: "#0D9488",
    fromStationId: "train_penn_nyc",
    fromStationName: "Moynihan Train Hall / Penn Station (NYC)",
    toStationId: "train_union_was",
    toStationName: "Washington Union Station (DC)",
    departureTime: "08:00 AM",
    arrivalTime: "10:55 AM",
    duration: "2h 55m",
    durationMinutes: 175,
    price: 89.00,
    originalPrice: 115.00,
    seatsLeft: 6,
    seatStatus: "filling",
    transfers: 0,
    amenities: ["150 mph High Speed", "First Class & Business", "At-Seat Dining", "Ultra Fast Wi-Fi", "Conference Tables"],
    rating: 4.9,
    reviewsCount: 5210,
    tag: "fastest",
    externalBookingUrl: "https://www.amtrak.com",
    officialProviderName: "Amtrak Acela Fleet",
    routeCoords: [
      [40.7505, -73.9934],
      [40.7344, -74.1645],
      [39.9556, -75.1818],
      [39.2847, -76.6205],
      [38.8974, -77.0065],
    ],
  },
  {
    id: "ride_train_amtrak_86",
    category: "train",
    operator: "Amtrak Northeast Regional",
    operatorCode: "AMTK",
    vehicleNumber: "Train #86",
    vehicleType: "Coastal Corridor Rail",
    operatorLogo: "🚅",
    operatorBadgeColor: "#1E3A8A",
    fromStationId: "train_penn_nyc",
    fromStationName: "Moynihan Train Hall / Penn Station (NYC)",
    toStationId: "train_south_bos",
    toStationName: "Boston South Station Amtrak",
    departureTime: "09:30 AM",
    arrivalTime: "01:45 PM",
    duration: "4h 15m",
    durationMinutes: 255,
    price: 42.00,
    originalPrice: 58.00,
    seatsLeft: 9,
    seatStatus: "filling",
    transfers: 0,
    amenities: ["Amtrak Connect Wi-Fi", "Cafe Lounge", "Spacious Reclining Seats", "Overhead & End Bins", "Clean Restrooms"],
    rating: 4.7,
    reviewsCount: 2900,
    tag: "popular",
    externalBookingUrl: "https://www.amtrak.com",
    officialProviderName: "National Railroad Passenger Corp.",
    routeCoords: [
      [40.7505, -73.9934],
      [41.0469, -73.5425],
      [41.2974, -72.9268],
      [41.8240, -71.4128],
      [42.3519, -71.0551],
    ],
  },
  {
    id: "ride_train_amtrak_143",
    category: "train",
    operator: "Amtrak Northeast Regional",
    operatorCode: "AMTK",
    vehicleNumber: "Train #143",
    vehicleType: "Evening Corridor Train",
    operatorLogo: "🚅",
    operatorBadgeColor: "#1E3A8A",
    fromStationId: "train_penn_nyc",
    fromStationName: "Moynihan Train Hall / Penn Station (NYC)",
    toStationId: "train_union_was",
    toStationName: "Washington Union Station (DC)",
    departureTime: "01:05 PM",
    arrivalTime: "04:30 PM",
    duration: "3h 25m",
    durationMinutes: 205,
    price: 39.00,
    seatsLeft: 24,
    seatStatus: "available",
    transfers: 0,
    amenities: ["Free Wi-Fi", "Cafe Bar", "Power Outlets", "Generous Luggage Allowance"],
    rating: 4.8,
    reviewsCount: 1850,
    tag: "cheapest",
    externalBookingUrl: "https://www.amtrak.com",
    officialProviderName: "National Railroad Passenger Corp.",
    routeCoords: [
      [40.7505, -73.9934],
      [40.7344, -74.1645],
      [39.9556, -75.1818],
      [38.8974, -77.0065],
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // SUBWAY RIDES (NYC MTA Subway Lines, Express Metro)
  // ═════════════════════════════════════════════════════════════════════════════
  {
    id: "ride_subway_line_7_exp",
    category: "subway",
    operator: "MTA Subway Line 7 Express",
    operatorCode: "MTA",
    vehicleNumber: "MTA #7-Exp (Diamond 7)",
    vehicleType: "Rapid Transit Express Subway",
    operatorLogo: "🟣",
    operatorBadgeColor: "#9333EA",
    fromStationId: "subway_times_sq",
    fromStationName: "Times Square - 42nd St",
    toStationId: "subway_jackson_heights",
    toStationName: "Jackson Heights - Roosevelt Ave",
    departureTime: "Every 4 mins",
    arrivalTime: "18 min ride",
    duration: "18m",
    durationMinutes: 18,
    price: 2.90,
    seatsLeft: 150,
    seatStatus: "unlimited",
    transfers: 0,
    amenities: ["Tap & Go OMNY Contactless", "Air Conditioned Cars", "Automated Audio Stops", "Elevator Accessible"],
    rating: 4.7,
    reviewsCount: 8900,
    tag: "cheapest",
    externalBookingUrl: "https://omny.info",
    officialProviderName: "MTA New York City Transit",
    routeCoords: [
      [40.7557, -73.9866],
      [40.7527, -73.9772],
      [40.7480, -73.9450],
      [40.7466, -73.8913],
    ],
  },
  {
    id: "ride_subway_line_a_exp",
    category: "subway",
    operator: "MTA Subway Line A Express",
    operatorCode: "MTA",
    vehicleNumber: "MTA #A-Express",
    vehicleType: "8th Ave Express Subway",
    operatorLogo: "🔵",
    operatorBadgeColor: "#2563EB",
    fromStationId: "subway_times_sq",
    fromStationName: "Times Square - 42nd St",
    toStationId: "subway_fulton_st",
    toStationName: "Fulton Center Transit Hub",
    departureTime: "Every 5 mins",
    arrivalTime: "12 min ride",
    duration: "12m",
    durationMinutes: 12,
    price: 2.90,
    seatsLeft: 180,
    seatStatus: "unlimited",
    transfers: 0,
    amenities: ["OMNY Mobile Tap", "Free Bus Transfer within 2h", "Security Cameras", "Express Bypass Tracks"],
    rating: 4.6,
    reviewsCount: 7400,
    tag: "fastest",
    externalBookingUrl: "https://omny.info",
    officialProviderName: "MTA New York City Transit",
    routeCoords: [
      [40.7557, -73.9866],
      [40.7400, -74.0000],
      [40.7250, -74.0050],
      [40.7100, -74.0080],
    ],
  },
  {
    id: "ride_subway_line_2_3",
    category: "subway",
    operator: "MTA Subway Lines 2 / 3 Express",
    operatorCode: "MTA",
    vehicleNumber: "MTA #2-Exp / #3-Exp",
    vehicleType: "7th Ave Express Subway",
    operatorLogo: "🔴",
    operatorBadgeColor: "#DC2626",
    fromStationId: "subway_times_sq",
    fromStationName: "Times Square - 42nd St",
    toStationId: "subway_atlantic_ave",
    toStationName: "Atlantic Ave - Barclays Center",
    departureTime: "Every 4 mins",
    arrivalTime: "20 min ride",
    duration: "20m",
    durationMinutes: 20,
    price: 2.90,
    seatsLeft: 140,
    seatStatus: "unlimited",
    transfers: 0,
    amenities: ["OMNY Fare Capping (12 rides = Free week)", "Direct Transfer to LIRR", "Full Wheelchair Access"],
    rating: 4.8,
    reviewsCount: 6300,
    tag: "best-value",
    externalBookingUrl: "https://omny.info",
    officialProviderName: "MTA New York City Transit",
    routeCoords: [
      [40.7557, -73.9866],
      [40.7350, -73.9990],
      [40.7130, -74.0070],
      [40.6841, -73.9785],
    ],
  },
  {
    id: "ride_subway_line_7_local",
    category: "subway",
    operator: "MTA Subway Line 7 Local",
    operatorCode: "MTA",
    vehicleNumber: "MTA #7-Local",
    vehicleType: "Flushing Line Subway",
    operatorLogo: "🟣",
    operatorBadgeColor: "#9333EA",
    fromStationId: "subway_grand_central",
    fromStationName: "Grand Central - 42nd St",
    toStationId: "subway_flushing_main",
    toStationName: "Flushing - Main Street",
    departureTime: "Every 3 mins",
    arrivalTime: "28 min ride",
    duration: "28m",
    durationMinutes: 28,
    price: 2.90,
    seatsLeft: 160,
    seatStatus: "unlimited",
    transfers: 0,
    amenities: ["OMNY Tap", "Air Conditioning", "Connects to Queens Community"],
    rating: 4.6,
    reviewsCount: 4200,
    externalBookingUrl: "https://omny.info",
    officialProviderName: "MTA New York City Transit",
    routeCoords: [
      [40.7527, -73.9772],
      [40.7466, -73.8913],
      [40.7500, -73.8500],
      [40.7596, -73.8300],
    ],
  },
];

// ── 3. HELPER FUNCTIONS ──────────────────────────────────────────────────────

// Calculate Haversine distance in miles
export function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of Earth in miles
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

// Find nearest station from user GPS coordinates ("detect request by" in flowchart)
export function findNearestStation(
  userLat: number,
  userLng: number,
  category: TransitCategory | "all" = "all"
): { station: TransitStation; distanceMiles: number } {
  const stations = USA_TRANSIT_STATIONS.filter(
    s => category === "all" || s.category === category || s.category === "all"
  );

  let nearest = stations[0];
  let minDistance = Infinity;

  stations.forEach(st => {
    const d = getDistanceMiles(userLat, userLng, st.coords[0], st.coords[1]);
    if (d < minDistance) {
      minDistance = d;
      nearest = st;
    }
  });

  return {
    station: nearest,
    distanceMiles: Math.round(minDistance * 10) / 10,
  };
}

// Convert "08:30 AM" to minutes from midnight
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || timeStr.toLowerCase().includes("every")) return -1;
  const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!match) return -1;
  let hour = parseInt(match[1], 10);
  const min = parseInt(match[2], 10);
  const isPM = match[3].toLowerCase() === "pm";
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  return hour * 60 + min;
}

// Query rides matching criteria
export function queryTransitRides(params: {
  category?: TransitCategory | "all";
  fromStationId?: string;
  toStationId?: string;
  sortBy?: "price_low_high" | "duration_fast" | "departure_early" | "seats_left";
  searchQuery?: string;
  timeSlot?: "all" | "morning" | "afternoon" | "evening" | "night";
  customTime?: string; // "HH:MM" 24h format (e.g. "08:30")
}): TransitRide[] {
  let results = [...MASTER_TRANSIT_RIDES];

  // Category filter
  if (params.category && params.category !== "all") {
    results = results.filter(r => r.category === params.category);
  }

  // From station filter
  if (params.fromStationId) {
    const fromMatches = results.filter(r => r.fromStationId === params.fromStationId);
    if (fromMatches.length > 0) results = fromMatches;
  }

  // To station filter
  if (params.toStationId) {
    const toMatches = results.filter(r => r.toStationId === params.toStationId);
    if (toMatches.length > 0) results = toMatches;
  }

  // Search keyword filter
  if (params.searchQuery && params.searchQuery.trim().length > 0) {
    const q = params.searchQuery.toLowerCase().trim();
    results = results.filter(
      r =>
        r.operator.toLowerCase().includes(q) ||
        r.vehicleNumber.toLowerCase().includes(q) ||
        r.fromStationName.toLowerCase().includes(q) ||
        r.toStationName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }

  // Custom Exact Time filter (departures at or after customTime)
  if (params.customTime && params.customTime.trim()) {
    const [h, m] = params.customTime.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const targetMin = h * 60 + m;
      results = results.filter(r => {
        const depMin = parseTimeToMinutes(r.departureTime);
        if (depMin === -1) return true; // Subway runs continuously
        return depMin >= targetMin;
      });
    }
  } else if (params.timeSlot && params.timeSlot !== "all") {
    // Time Slot filter
    results = results.filter(r => {
      const depMin = parseTimeToMinutes(r.departureTime);
      if (depMin === -1) return true; // Subway
      const hour24 = Math.floor(depMin / 60);

      if (params.timeSlot === "morning") return hour24 >= 5 && hour24 < 12;
      if (params.timeSlot === "afternoon") return hour24 >= 12 && hour24 < 18;
      if (params.timeSlot === "evening") return hour24 >= 18 && hour24 < 24;
      if (params.timeSlot === "night") return hour24 >= 0 && hour24 < 5;
      return true;
    });
  }

  // Sorting - specifically supporting "low to high price" from diagram!
  switch (params.sortBy) {
    case "price_low_high":
      results.sort((a, b) => a.price - b.price);
      break;
    case "duration_fast":
      results.sort((a, b) => a.durationMinutes - b.durationMinutes);
      break;
    case "seats_left":
      results.sort((a, b) => b.seatsLeft - a.seatsLeft);
      break;
    case "departure_early":
    default:
      // default keep order or sort by price
      break;
  }

  return results;
}
