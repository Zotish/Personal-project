import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useLocation } from "react-router";
import { useLanguage, Lang } from "./LanguageContext";

export interface CountryConfig {
  code: string; // ISO 2-letter (e.g. US, BD, NO, CA, GB, DE)
  name: string; // English name
  nativeName: string; // Native script name
  flag: string; // Emoji
  flagEmoji?: string; // Optional alias for flag
  region: "North America" | "South Asia" | "Europe" | "Middle East" | "Asia Pacific" | "Africa" | "Latin America";
  primaryLanguage: {
    code: string; // en, bn, no, fr, de, ja, ar, it, ms, es, etc.
    label: string; // e.g. "English", "বাংলা", "Norsk", "Français"
  };
  supportedLanguages: string[];
  currency: {
    code: string; // USD, BDT, NOK, CAD, GBP, EUR, AED, JPY, etc.
    symbol: string; // $, ৳, kr, €, £, د.إ, ¥
    name: string; // "US Dollar", "Bangladeshi Taka", "Norwegian Krone", etc.
  };
  emergencyNumber: string; // 911, 999, 112, etc.
  immigrationBody: string; // Legal & visa authority
  isLaunched: boolean;
  launchedAt?: string;
  activeUsers: string; // Simulated diaspora audience metric
  localizedTagline: string; // Welcome banner in native language
  defaultCoords: [number, number]; // lat, lng for map
  defaultZoom: number;
}

export function getCountryFlagEmoji(code: string): string {
  try {
    return code
      .toUpperCase()
      .split("")
      .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join("");
  } catch (_) {
    return "🌐";
  }
}

export const INITIAL_COUNTRIES: CountryConfig[] = [
  {
    code: "BD",
    name: "Bangladesh",
    nativeName: "বাংলাদেশ",
    flag: "🇧🇩",
    flagEmoji: "🇧🇩",
    region: "South Asia",
    primaryLanguage: { code: "en", label: "English" },
    supportedLanguages: ["English", "বাংলা"],
    currency: { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
    emergencyNumber: "999",
    immigrationBody: "Ministry of Expatriates' Welfare & Overseas Employment",
    isLaunched: true,
    launchedAt: "Feb 01, 2024",
    activeUsers: "98.4K",
    localizedTagline: "প্রবাসীদের স্বজন ও অভিবাসন সেবা, আইনি সহায়তা ও জরুরি ডিরেক্টরি।",
    defaultCoords: [23.8103, 90.4125],
    defaultZoom: 13,
  },
];

export function resolveOrGenerateCountry(
  _code?: string,
  _meta?: any
): CountryConfig {
  return INITIAL_COUNTRIES[0];
}

const STORAGE_COUNTRIES_KEY = "ic_platform_countries";
const STORAGE_ACTIVE_COUNTRY_KEY = "ic_platform_active_country";
const STORAGE_MANUAL_LOCK_KEY = "ic_platform_manual_selection_lock";

interface CountryPlatformContextType {
  countries: CountryConfig[];
  launchedCountries: CountryConfig[];
  currentCountry: CountryConfig;
  setCurrentCountry: (code: string, isManual?: boolean) => void;
  toggleLaunchCountry: (code: string) => void;
  updateCountryConfig: (code: string, updates: Partial<CountryConfig>) => void;
  addNewCountry: (country: CountryConfig) => void;
  getCountryByCode: (code: string) => CountryConfig | undefined;
  getCountryLaunchUrl: (code: string) => string;
  getCountrySubdomainUrl: (code: string) => string;
  isDetectingLocation: boolean;
  autoDetectCountry: () => Promise<CountryConfig | null>;
  isManualLocked: boolean;
  unlockManualSelection: () => void;
}

const CountryPlatformContext = createContext<CountryPlatformContextType | null>(null);

export function CountryPlatformProvider({ children }: { children: ReactNode }) {
  const [countries, setCountries] = useState<CountryConfig[]>(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_COUNTRIES_KEY, JSON.stringify(INITIAL_COUNTRIES));
        localStorage.setItem(STORAGE_ACTIVE_COUNTRY_KEY, "BD");
        localStorage.removeItem(STORAGE_MANUAL_LOCK_KEY);
      }
    } catch (_) {}
    return INITIAL_COUNTRIES;
  });

  const [currentCountryCode, setCurrentCountryCode] = useState<string>("BD");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isManualLocked, setIsManualLocked] = useState<boolean>(false);

  const unlockManualSelection = useCallback(() => {
    setIsManualLocked(false);
  }, []);

  const autoDetectCountry = useCallback(async (): Promise<CountryConfig | null> => {
    setIsDetectingLocation(false);
    setCurrentCountryCode("BD");
    try {
      localStorage.setItem(STORAGE_ACTIVE_COUNTRY_KEY, "BD");
      localStorage.setItem("bkoi_last_user_coords", JSON.stringify([23.8103, 90.4125]));
    } catch (_) {}
    return INITIAL_COUNTRIES[0];
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COUNTRIES_KEY, JSON.stringify(INITIAL_COUNTRIES));
      localStorage.setItem(STORAGE_ACTIVE_COUNTRY_KEY, "BD");
    } catch (_) {}
  }, []);

  const launchedCountries = countries.filter(c => c.isLaunched);
  const currentCountry = countries[0] || INITIAL_COUNTRIES[0];

  const setCurrentCountry = useCallback((_code: string, _isManual = false) => {
    setCurrentCountryCode("BD");
    try {
      localStorage.setItem(STORAGE_ACTIVE_COUNTRY_KEY, "BD");
    } catch (_) {}
  }, []);

  const toggleLaunchCountry = (_code: string) => {};
  const updateCountryConfig = (_code: string, _updates: Partial<CountryConfig>) => {};
  const addNewCountry = (_newCountry: CountryConfig) => {};
  const getCountryByCode = (_code: string) => INITIAL_COUNTRIES[0];

  const getCountryLaunchUrl = (_code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5174";
    return `${origin}/feed?country=bd&lang=en`;
  };

  const getCountrySubdomainUrl = (_code: string) => {
    return "https://bd.immigrantconnect.org";
  };

  return (
    <CountryPlatformContext.Provider
      value={{
        countries,
        launchedCountries,
        currentCountry,
        setCurrentCountry,
        toggleLaunchCountry,
        updateCountryConfig,
        addNewCountry,
        getCountryByCode,
        getCountryLaunchUrl,
        getCountrySubdomainUrl,
        isDetectingLocation,
        autoDetectCountry,
        isManualLocked,
        unlockManualSelection,
      }}
    >
      {children}
    </CountryPlatformContext.Provider>
  );
}

export function useCountryPlatform() {
  const ctx = useContext(CountryPlatformContext);
  if (!ctx) {
    throw new Error("useCountryPlatform must be used within a CountryPlatformProvider");
  }
  return ctx;
}
