import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useCountryPlatform } from "./CountryPlatformContext";

export interface SponsoredAd {
  id: string;
  title: string;
  sponsorName: string;
  sponsorHandle?: string;
  sponsorAvatar?: string;
  badgeText?: string; // "Sponsored", "Featured Partner", "Promoted"
  description: string;
  mediaUrl?: string;
  ctaText: string;
  ctaUrl: string;
  targetCountry: string; // "ALL" or "US", "BD", "DE", "FR", "CA", "GB", etc.
  targetPlacement: "all" | "feed" | "explore" | "services" | "qna";
  status: "active" | "paused";
  impressions: number;
  clicks: number;
  createdAt: string;
  category: "Legal" | "Financial" | "Housing" | "Jobs" | "Education" | "Food" | "General";
}

const STORAGE_KEY = "ic_platform_sponsored_ads";

export const INITIAL_ADS: SponsoredAd[] = [
  {
    id: "ad-remit-01",
    title: "Send Money Home with $0 Fees & Guaranteed Best Exchange Rates",
    sponsorName: "RemitGlobal Wire",
    sponsorHandle: "@remitglobal",
    sponsorAvatar: "https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?w=120&h=120&fit=crop",
    badgeText: "Sponsored",
    description: "Support your family in Bangladesh, India, Mexico & across 140+ countries. Instant mobile wallet & direct bank deposits. First 3 transfers are 100% free for ImmigrantConnect members!",
    mediaUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=400&fit=crop",
    ctaText: "Learn More",
    ctaUrl: "https://www.remitly.com",
    targetCountry: "ALL",
    targetPlacement: "all",
    status: "active",
    impressions: 24820,
    clicks: 1940,
    createdAt: "Sep 10, 2026",
    category: "Financial",
  },
  {
    id: "ad-legal-02",
    title: "Free 30-Minute Confidential Immigration Legal & Asylum Evaluation",
    sponsorName: "ImmigrantJustice Legal Group, PC",
    sponsorHandle: "@justice_legal",
    sponsorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop",
    badgeText: "Featured Partner",
    description: "Need help with USCIS RFE notices, work permit (EAD) delays, family petitions or asylum defense? Speak with certified attorneys fluent in English, Bengali, Spanish, and Arabic.",
    mediaUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&h=400&fit=crop",
    ctaText: "Book Free Consultation",
    ctaUrl: "/services/legal",
    targetCountry: "ALL",
    targetPlacement: "all",
    status: "active",
    impressions: 31200,
    clicks: 2840,
    createdAt: "Sep 12, 2026",
    category: "Legal",
  },
  {
    id: "ad-health-03",
    title: "Affordable Healthcare & Dental Aid for Immigrant Families",
    sponsorName: "MetroCare Community Clinic",
    sponsorHandle: "@metrocare_ny",
    sponsorAvatar: "https://images.unsplash.com/photo-1594824813585-645c3a372138?w=120&h=120&fit=crop",
    badgeText: "Community Partner",
    description: "Quality medical care regardless of immigration status or insurance coverage. Low-cost checkups, vaccinations, prenatal visits, and sliding-scale pharmacy discounts.",
    mediaUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&h=400&fit=crop",
    ctaText: "Find Nearest Clinic",
    ctaUrl: "/services/hospital",
    targetCountry: "ALL",
    targetPlacement: "all",
    status: "active",
    impressions: 18450,
    clicks: 1220,
    createdAt: "Sep 14, 2026",
    category: "General",
  },
  {
    id: "ad-edu-04",
    title: "Free Evening ESL & High-Income CDL Driver Training Programs",
    sponsorName: "New Horizons Career Institute",
    sponsorHandle: "@newhorizons_edu",
    sponsorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
    badgeText: "Sponsored Course",
    description: "Start earning $70k+/yr! Bilingual instructors help you ace DMV commercial license tests and English workplace communication. 100% job placement assistance upon graduation.",
    mediaUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop",
    ctaText: "Enroll for Free",
    ctaUrl: "/services/school",
    targetCountry: "ALL",
    targetPlacement: "all",
    status: "active",
    impressions: 14210,
    clicks: 1080,
    createdAt: "Sep 15, 2026",
    category: "Education",
  },
];

interface AdsContextType {
  ads: SponsoredAd[];
  activeAds: SponsoredAd[];
  addAd: (newAd: Omit<SponsoredAd, "id" | "impressions" | "clicks" | "createdAt">) => SponsoredAd;
  updateAd: (id: string, updates: Partial<SponsoredAd>) => void;
  deleteAd: (id: string) => void;
  toggleAdStatus: (id: string) => void;
  trackImpression: (id: string) => void;
  trackClick: (id: string) => void;
  getSlotAd: (slotIndex: number, placement?: "all" | "feed" | "explore" | "services" | "qna") => SponsoredAd | null;
}

const AdsContext = createContext<AdsContextType | null>(null);

export function AdsProvider({ children }: { children: ReactNode }) {
  const { currentCountry } = useCountryPlatform();

  const [ads, setAds] = useState<SponsoredAd[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: SponsoredAd) => ({
            ...item,
            ctaText: item.ctaText === "Claim $0 Fee Transfer" ? "Learn More" : item.ctaText,
          }));
        }
      }
    } catch (e) {
      console.warn("Failed to load ads from localStorage", e);
    }
    return INITIAL_ADS;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
    } catch (e) {
      console.warn("Failed to save ads to localStorage", e);
    }
  }, [ads]);

  const activeAds = ads.filter(a => a.status === "active");

  const addAd = (newAdData: Omit<SponsoredAd, "id" | "impressions" | "clicks" | "createdAt">): SponsoredAd => {
    const created: SponsoredAd = {
      ...newAdData,
      id: `ad-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      impressions: 0,
      clicks: 0,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    };
    setAds(prev => [created, ...prev]);
    return created;
  };

  const updateAd = (id: string, updates: Partial<SponsoredAd>) => {
    setAds(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAd = (id: string) => {
    setAds(prev => prev.filter(a => a.id !== id));
  };

  const toggleAdStatus = (id: string) => {
    setAds(prev =>
      prev.map(a => (a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a))
    );
  };

  const trackImpression = (id: string) => {
    setAds(prev => prev.map(a => (a.id === id ? { ...a, impressions: a.impressions + 1 } : a)));
  };

  const trackClick = (id: string) => {
    setAds(prev => prev.map(a => (a.id === id ? { ...a, clicks: a.clicks + 1 } : a)));
  };

  /**
   * Retrieves an appropriate active ad for a given scroll slot.
   * Matches targeting by country or "ALL", and placement.
   */
  const getSlotAd = (
    slotIndex: number,
    placement: "all" | "feed" | "explore" | "services" | "qna" = "all"
  ): SponsoredAd | null => {
    if (activeAds.length === 0) return null;

    const currentCode = currentCountry?.code?.toUpperCase() || "US";

    // Filter candidate ads for current country and placement
    const candidates = activeAds.filter(a => {
      const matchCountry = a.targetCountry === "ALL" || a.targetCountry.toUpperCase() === currentCode;
      const matchPlacement = a.targetPlacement === "all" || a.targetPlacement === placement;
      return matchCountry && matchPlacement;
    });

    const pool = candidates.length > 0 ? candidates : activeAds;
    if (pool.length === 0) return null;

    // Pick cyclically based on slotIndex
    const adIndex = Math.abs(slotIndex) % pool.length;
    return pool[adIndex];
  };

  return (
    <AdsContext.Provider
      value={{
        ads,
        activeAds,
        addAd,
        updateAd,
        deleteAd,
        toggleAdStatus,
        trackImpression,
        trackClick,
        getSlotAd,
      }}
    >
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const ctx = useContext(AdsContext);
  if (!ctx) {
    throw new Error("useAds must be used within an AdsProvider");
  }
  return ctx;
}
