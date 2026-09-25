import React from "react";
import {
  Utensils, Scale, Building2, Heart, Shield, Car, Trophy,
  Briefcase, Gift, DollarSign, Users, Award, Sparkles, MapPin,
  GraduationCap, Bus, Store, Armchair, BarChart2, Plane, Cpu
} from "lucide-react";
import { ServiceMapDirectory } from "../components/services/ServiceMapDirectory";
import {
  generateHalalFoodListings,
  generateLegalAidListings,
  generateHospitalListings,
  generatePharmacyListings,
  generateFreeMedicineListings,
  generateSocialAidListings,
  generateGasEVListings,
  generateSportsListings,
  generateSchoolListings,
  generateTransitMetroListings,
  generateGroceryShopListings,
  generateFurnitureListings,
  generateMoneyExchangeListings,
  generateTravelFlightListings,
  generateCarsAutoListings,
  generateElectronicsListings
} from "../data/serviceDirectoryData";

// ─── 1. HALAL FOOD & RESTAURANTS ──────────────────────────────────────────────
export function HalalFoodServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Halal Food"
      serviceIcon={Utensils}
      bannerPlaceholder="Search biryani, kacchi, tiffin, sweets..."
      defaultAreaName="Gulshan"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Halal" },
        { id: "restaurant", label: "Restaurants & Kacchi" },
        { id: "desi-kitchen", label: "Desi Kitchen & Tiffin" },
        { id: "fast-food", label: "Halal Fast Food" },
        { id: "sweets-bakery", label: "Bakery & Sweets" }
      ]}
      generateListings={generateHalalFoodListings}
    />
  );
}

// ─── 2. LEGAL AID & PRO BONO ADVOCACY ─────────────────────────────────────────
export function LegalAidServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Legal Aid"
      serviceIcon={Scale}
      bannerPlaceholder="Search BLAST, human rights, tenancy disputes, court aid..."
      defaultAreaName="Kakrail"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Legal Aid" },
        { id: "free-aid", label: "Pro Bono & Free Clinics" },
        { id: "labor-rights", label: "Worker & Tenant Rights" },
        { id: "supreme-court", label: "Supreme Court Desk" }
      ]}
      generateListings={generateLegalAidListings}
    />
  );
}

// ─── 3. HOSPITALS & EMERGENCY HEALTHCARE ──────────────────────────────────────
export function HospitalServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Hospital"
      serviceIcon={Building2}
      bannerPlaceholder="Search 24/7 ER, trauma care, specialist hospitals..."
      defaultAreaName="Panthapath"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Hospitals" },
        { id: "emergency-247", label: "24/7 Emergency & ICU" },
        { id: "community-hospital", label: "Specialty Hospitals" },
        { id: "walk-in-clinic", label: "Outpatient & Clinics" }
      ]}
      generateListings={generateHospitalListings}
    />
  );
}

// ─── 4. PHARMACIES & DISPENSARIES ─────────────────────────────────────────────
export function PharmacyServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Pharmacy"
      serviceIcon={Heart}
      bannerPlaceholder="Search 24-hour pharmacies, prescription medicines, delivery..."
      defaultAreaName="Kalabagan"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Pharmacies" },
        { id: "24-hours", label: "Open 24/7" },
        { id: "retail-pharmacy", label: "Retail & Cold Chain" },
        { id: "discount-pharmacy", label: "Discount Prescriptions" }
      ]}
      generateListings={generatePharmacyListings}
    />
  );
}

// ─── 5. FREE MEDICINE & COMMUNITY CLINICS ─────────────────────────────────────
export function FreeMedicineServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Free Medicine"
      serviceIcon={Heart}
      bannerPlaceholder="Search free dispensaries, insulin aid, Red Crescent..."
      defaultAreaName="Moghbazar"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Free Aid" },
        { id: "free-medicine", label: "100% Free Dispensaries" },
        { id: "insulin-aid", label: "Diabetes & Insulin Aid" }
      ]}
      generateListings={generateFreeMedicineListings}
    />
  );
}

// ─── 6. SOCIAL AID & COMMUNITY SUPPORT ────────────────────────────────────────
export function SocialAidServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Social Aid"
      serviceIcon={Users}
      bannerPlaceholder="Search BRAC, Ahsania Mission, disaster relief, micro-aid..."
      defaultAreaName="Mohakhali"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Social Aid" },
        { id: "social-services", label: "Community Development" },
        { id: "relief", label: "Emergency Food & Relief" }
      ]}
      generateListings={generateSocialAidListings}
    />
  );
}

// ─── 7. GAS, EV & PETROL STATIONS ─────────────────────────────────────────────
export function GasEVServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Gas & EV"
      serviceIcon={Car}
      bannerPlaceholder="Search Octane, EV fast charging, CNG stations, 24h marts..."
      defaultAreaName="Tejgaon"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Stations" },
        { id: "gas-ev", label: "Octane & EV Fast Charge" },
        { id: "cng", label: "High Pressure CNG" },
        { id: "24-hours", label: "Open 24/7" }
      ]}
      generateListings={generateGasEVListings}
    />
  );
}

// ─── 8. SPORTS & COMMUNITY GROUNDS ────────────────────────────────────────────
export function SportsServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Sports"
      serviceIcon={Trophy}
      bannerPlaceholder="Search cricket stadium, football arena, lake turf..."
      defaultAreaName="Mirpur"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Sports Venues" },
        { id: "stadium", label: "Cricket Stadiums" },
        { id: "football", label: "Football Arenas" },
        { id: "community-club", label: "Community Grounds & Turf" }
      ]}
      generateListings={generateSportsListings}
    />
  );
}

// ─── 9. SCHOOLS, COLLEGES & UNIVERSITIES ──────────────────────────────────────
export function SchoolServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Education & Schools"
      serviceIcon={GraduationCap}
      themeColor="#7C3AED"
      bannerPlaceholder="Search Dhaka University, BUET, NSU, Notre Dame, Scholastica..."
      defaultAreaName="Ramna"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Institutions" },
        { id: "university", label: "Public & Private Universities" },
        { id: "college", label: "Colleges & HSC" },
        { id: "english-medium", label: "English Medium O/A Levels" }
      ]}
      generateListings={generateSchoolListings}
    />
  );
}

// ─── 10. TRANSIT, METRO & SUBWAY ──────────────────────────────────────────────
export function TransitServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Transport & Metro"
      serviceIcon={Bus}
      themeColor="#0284C7"
      bannerPlaceholder="Search MRT-6 Metro stations, Kamalapur Railway, Mohakhali bus..."
      defaultAreaName="Motijheel"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Transit Hubs" },
        { id: "metro-rail", label: "MRT Line 6 Metro Stations" },
        { id: "railway", label: "Intercity Railway Stations" },
        { id: "bus-terminal", label: "Highway Bus Terminals" }
      ]}
      generateListings={generateTransitMetroListings}
    />
  );
}

// ─── 11. GROCERY & SUPERSTORES ────────────────────────────────────────────────
export function GroceryShopServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Grocery & Superstores"
      serviceIcon={Store}
      themeColor="#D97706"
      bannerPlaceholder="Search Shwapno, Unimart, Agora, Meena Bazar, Karwan Bazar..."
      defaultAreaName="Gulshan"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Superstores" },
        { id: "superstore", label: "Retail Superstores" },
        { id: "wholesale-market", label: "Wholesale Fresh Markets" }
      ]}
      generateListings={generateGroceryShopListings}
    />
  );
}

// ─── 12. USED & NEW FURNITURE ─────────────────────────────────────────────────
export function FurnitureServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Furniture"
      serviceIcon={Armchair}
      themeColor="#B45309"
      bannerPlaceholder="Search Hatil, solid teak wood, Panthapath furniture market..."
      defaultAreaName="Panthapath"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Furniture" },
        { id: "furniture", label: "Brand Showrooms & Teak" }
      ]}
      generateListings={generateFurnitureListings}
    />
  );
}

// ─── 13. MONEY EXCHANGE & REMITTANCE ──────────────────────────────────────────
export function MoneyExchangeServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Money Exchange & Remittance"
      serviceIcon={BarChart2}
      themeColor="#059669"
      bannerPlaceholder="Search bKash hubs, foreign currency exchange, Western Union..."
      defaultAreaName="Motijheel"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Remittance" },
        { id: "remittance", label: "bKash & Nagad Hubs" },
        { id: "money-exchange", label: "Foreign Currency Changers" }
      ]}
      generateListings={generateMoneyExchangeListings}
    />
  );
}

// ─── 14. TRAVEL & FLIGHT TICKETING ────────────────────────────────────────────
export function TravelFlightServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Flights & Travel"
      serviceIcon={Plane}
      themeColor="#0891B2"
      bannerPlaceholder="Search Biman Bangladesh, US-Bangla, Airport ticketing..."
      defaultAreaName="Kurmitola"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Travel Agencies" },
        { id: "airline", label: "Airlines Sales Counters" },
        { id: "travel-agency", label: "Travel & Visa Agencies" }
      ]}
      generateListings={generateTravelFlightListings}
    />
  );
}

// ─── 15. CARS & AUTOMOTIVE ────────────────────────────────────────────────────
export function CarsAutoServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Cars & Automotive"
      serviceIcon={Car}
      themeColor="#EA580C"
      bannerPlaceholder="Search Navana Toyota, reconditioned car showrooms, BRTA..."
      defaultAreaName="Tejgaon"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Automobile" },
        { id: "cars-auto", label: "Showrooms & 3S Service" }
      ]}
      generateListings={generateCarsAutoListings}
    />
  );
}

// ─── 16. ELECTRONICS & GADGETS ────────────────────────────────────────────────
export function ElectronicsServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Electronics & Tech"
      serviceIcon={Cpu}
      themeColor="#2563EB"
      bannerPlaceholder="Search Multiplan Computer City, Bashundhara City tech mall..."
      defaultAreaName="Elephant Road"
      defaultCityName="Dhaka"
      filterTabs={[
        { id: "all", label: "All Tech Markets" },
        { id: "electronics", label: "Laptops, Mobiles & Gadgets" }
      ]}
      generateListings={generateElectronicsListings}
    />
  );
}
