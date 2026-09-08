import React from "react";
import {
  Utensils, Scale, Building2, Heart, Shield, Car, Trophy,
  Briefcase, Gift, DollarSign, Users, Award, Sparkles, MapPin
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
  generateSportsListings
} from "../data/serviceDirectoryData";

// ─── 1. HALAL FOOD & DESI RESTAURANTS ──────────────────────────────────────────
export function HalalFoodServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Halal Food"
      serviceIcon={Utensils}
      bannerPlaceholder="Search halal biryani, meat shops, desi tiffin..."
      defaultAreaName="Jackson Heights"
      defaultCityName="Queens"
      filterTabs={[
        { id: "all", label: "All Halal" },
        { id: "restaurant", label: "Restaurants" },
        { id: "desi-kitchen", label: "Desi Kitchen & Tiffin" },
        { id: "grocery-meat", label: "Butcher & Grocery" },
        { id: "fast-food", label: "Halal Fast Food" },
        { id: "sweets-bakery", label: "Bakery & Sweets" }
      ]}
      generateListings={generateHalalFoodListings}
    />
  );
}

// ─── 2. LEGAL AID & IMMIGRATION LAWYERS ────────────────────────────────────────
export function LegalAidServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Legal Aid"
      serviceIcon={Scale}
      bannerPlaceholder="Search asylum help, work permits, deportation defense..."
      defaultAreaName="Jamaica"
      defaultCityName="Queens"
      filterTabs={[
        { id: "all", label: "All Legal Aid" },
        { id: "free-aid", label: "Pro Bono & Free Clinics" },
        { id: "immigration-lawyer", label: "Immigration Attorneys" },
        { id: "asylum", label: "Asylum Defense" },
        { id: "citizenship", label: "Citizenship & Fee Waivers" }
      ]}
      generateListings={generateLegalAidListings}
    />
  );
}

// ─── 3. HOSPITALS & COMMUNITY CLINICS ─────────────────────────────────────────
export function HospitalServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Hospital"
      serviceIcon={Building2}
      bannerPlaceholder="Search 24/7 ER, Medicaid clinics, walk-in centers..."
      defaultAreaName="Elmhurst"
      defaultCityName="Queens"
      filterTabs={[
        { id: "all", label: "All Facilities" },
        { id: "emergency-247", label: "24/7 Emergency Room" },
        { id: "community-hospital", label: "Community Hospitals" },
        { id: "walk-in-clinic", label: "Walk-in Clinics" },
        { id: "uninsured", label: "No Insurance / NYC Care" }
      ]}
      generateListings={generateHospitalListings}
    />
  );
}

// ─── 4. PHARMACIES & PRESCRIPTION REFILLS ─────────────────────────────────────
export function PharmacyServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Pharmacy"
      serviceIcon={Heart}
      bannerPlaceholder="Search 24-hour pharmacies, generic discounts, delivery..."
      defaultAreaName="Jackson Heights"
      defaultCityName="Queens"
      filterTabs={[
        { id: "all", label: "All Pharmacies" },
        { id: "24-hours", label: "Open 24/7" },
        { id: "retail-pharmacy", label: "Retail & Vaccines" },
        { id: "discount-pharmacy", label: "Discount Generics ($4)" },
        { id: "delivery", label: "Free Home Delivery" }
      ]}
      generateListings={generatePharmacyListings}
    />
  );
}

// ─── 5. FREE MEDICINE & PRESCRIPTION AID ──────────────────────────────────────
export function FreeMedicineServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Free Medicine"
      serviceIcon={Heart}
      bannerPlaceholder="Search free prescription dispensaries, insulin aid..."
      defaultAreaName="Corona"
      defaultCityName="Queens"
      filterTabs={[
        { id: "all", label: "All Free Medicine" },
        { id: "free-medicine", label: "100% Free Dispensaries" },
        { id: "insulin-aid", label: "Diabetes & Insulin Aid" },
        { id: "chronic-illness", label: "Chronic Illness Programs" },
        { id: "mail-delivery", label: "Direct Mail Programs" }
      ]}
      generateListings={generateFreeMedicineListings}
    />
  );
}

// ─── 6. SOCIAL AID & GOVERNMENT ASSISTANCE ────────────────────────────────────
export function SocialAidServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Social Aid"
      serviceIcon={Users}
      bannerPlaceholder="Search SNAP food stamps, rental aid, HEAP grants..."
      defaultAreaName="Woodside"
      defaultCityName="Queens"
      filterTabs={[
        { id: "all", label: "All Social Aid" },
        { id: "social-services", label: "Benefits & SNAP Navigators" },
        { id: "rent-relief", label: "Emergency Rent Relief" },
        { id: "food-security", label: "Culturally Specific Pantries" },
        { id: "family-support", label: "Family & Senior Circles" }
      ]}
      generateListings={generateSocialAidListings}
    />
  );
}

// ─── 7. GAS & EV STATIONS ─────────────────────────────────────────────────────
export function GasEVServicePage() {
  return (
    <ServiceMapDirectory
      serviceName="Gas & EV"
      serviceIcon={Car}
      bannerPlaceholder="Search cheap gas prices, Tesla Superchargers, 24h marts..."
      defaultAreaName="Astoria"
      defaultCityName="Queens"
      filterTabs={[
        { id: "all", label: "All Stations" },
        { id: "gas-ev", label: "Fuel & EV Fast Charging" },
        { id: "cheapest", label: "Lowest Price (<$3.20)" },
        { id: "24-hours", label: "Open 24/7" },
        { id: "car-wash", label: "Car Wash & Air Pump" }
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
      bannerPlaceholder="Search cricket grounds, soccer turfs, badminton courts..."
      defaultAreaName="Flushing"
      defaultCityName="Queens"
      filterTabs={[
        { id: "all", label: "All Sports Grounds" },
        { id: "sports", label: "Cricket Grounds & Leagues" },
        { id: "soccer", label: "Soccer & Football Turfs" },
        { id: "indoor-badminton", label: "Indoor Badminton & Gyms" },
        { id: "free-access", label: "Free Public Access" }
      ]}
      generateListings={generateSportsListings}
    />
  );
}
