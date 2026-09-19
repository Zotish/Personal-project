import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "react-router";
import { useLanguage, Lang } from "./LanguageContext";

export interface CountryConfig {
  code: string; // ISO 2-letter (e.g. US, BD, CA, GB)
  name: string; // English name
  nativeName: string; // Native script name
  flag: string; // Emoji
  region: "North America" | "South Asia" | "Europe" | "Middle East" | "Asia Pacific" | "Africa" | "Latin America";
  primaryLanguage: {
    code: string; // en, bn, fr, de, ja, ar, it, ms, es, etc.
    label: string; // e.g. "English", "বাংলা", "Français"
  };
  supportedLanguages: string[];
  currency: {
    code: string; // USD, BDT, CAD, GBP, EUR, AED, JPY, etc.
    symbol: string; // $, ৳, €, £, د.إ, ¥
    name: string; // "US Dollar", "Bangladeshi Taka", etc.
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

export const INITIAL_COUNTRIES: CountryConfig[] = [
  {
    code: "US",
    name: "United States",
    nativeName: "United States of America",
    flag: "🇺🇸",
    region: "North America",
    primaryLanguage: { code: "en", label: "English" },
    supportedLanguages: ["English", "Spanish", "Bengali", "Chinese"],
    currency: { code: "USD", symbol: "$", name: "US Dollar" },
    emergencyNumber: "911",
    immigrationBody: "USCIS & Executive Office for Immigration Review (EOIR)",
    isLaunched: true,
    launchedAt: "Jan 15, 2024",
    activeUsers: "142.8K",
    localizedTagline: "Empowering immigrants with trusted legal, medical, and community hubs across the USA.",
    defaultCoords: [40.7128, -74.006],
    defaultZoom: 12,
  },
  {
    code: "BD",
    name: "Bangladesh",
    nativeName: "বাংলাদেশ",
    flag: "🇧🇩",
    region: "South Asia",
    primaryLanguage: { code: "bn", label: "বাংলা (Bengali)" },
    supportedLanguages: ["বাংলা", "English"],
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
  {
    code: "CA",
    name: "Canada",
    nativeName: "Canada",
    flag: "🇨🇦",
    region: "North America",
    primaryLanguage: { code: "en", label: "English / Français" },
    supportedLanguages: ["English", "Français", "Punjabi", "Tagalog"],
    currency: { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    emergencyNumber: "911",
    immigrationBody: "Immigration, Refugees and Citizenship Canada (IRCC)",
    isLaunched: false,
    activeUsers: "52.1K",
    localizedTagline: "Supporting newcomer settlement, Express Entry advisors, and multicultural diaspora in Canada.",
    defaultCoords: [43.6532, -79.3832], // Toronto
    defaultZoom: 12,
  },
  {
    code: "GB",
    name: "United Kingdom",
    nativeName: "United Kingdom",
    flag: "🇬🇧",
    region: "Europe",
    primaryLanguage: { code: "en", label: "English" },
    supportedLanguages: ["English", "Bengali", "Urdu", "Polish"],
    currency: { code: "GBP", symbol: "£", name: "British Pound" },
    emergencyNumber: "999",
    immigrationBody: "UK Visas and Immigration (UKVI) & Home Office",
    isLaunched: false,
    activeUsers: "44.6K",
    localizedTagline: "Comprehensive NHS navigation, indefinite leave to remain guidance, and local diaspora networks.",
    defaultCoords: [51.5074, -0.1278], // London
    defaultZoom: 12,
  },
  {
    code: "DE",
    name: "Germany",
    nativeName: "Deutschland",
    flag: "🇩🇪",
    region: "Europe",
    primaryLanguage: { code: "de", label: "Deutsch" },
    supportedLanguages: ["Deutsch", "English", "Turkish", "Arabic"],
    currency: { code: "EUR", symbol: "€", name: "Euro" },
    emergencyNumber: "112",
    immigrationBody: "Federal Office for Migration and Refugees (BAMF)",
    isLaunched: false,
    activeUsers: "36.2K",
    localizedTagline: "Integration, Aufenthaltserlaubnis Beratung und multikulturelle Gemeinschaften in Deutschland.",
    defaultCoords: [52.52, 13.405], // Berlin
    defaultZoom: 12,
  },
  {
    code: "AU",
    name: "Australia",
    nativeName: "Australia",
    flag: "🇦🇺",
    region: "Asia Pacific",
    primaryLanguage: { code: "en", label: "English" },
    supportedLanguages: ["English", "Mandarin", "Arabic", "Vietnamese"],
    currency: { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    emergencyNumber: "000",
    immigrationBody: "Department of Home Affairs (Immigration & Citizenship)",
    isLaunched: false,
    activeUsers: "29.7K",
    localizedTagline: "Bridging Australian skilled migration, Medicare access, and vibrant immigrant communities.",
    defaultCoords: [-33.8688, 151.2093], // Sydney
    defaultZoom: 12,
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    nativeName: "دولة الإمارات العربية المتحدة",
    flag: "🇦🇪",
    region: "Middle East",
    primaryLanguage: { code: "ar", label: "العربية (Arabic)" },
    supportedLanguages: ["العربية", "English", "Hindi", "Bengali"],
    currency: { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
    emergencyNumber: "999",
    immigrationBody: "Federal Authority for Identity, Citizenship, Customs and Port Security (ICP)",
    isLaunched: false,
    activeUsers: "88.9K",
    localizedTagline: "منصة شاملة للجاليات المغتربة وتصاريح العمل والخدمات القانونية والمجتمعية في الإمارات.",
    defaultCoords: [25.2048, 55.2708], // Dubai
    defaultZoom: 12,
  },
  {
    code: "JP",
    name: "Japan",
    nativeName: "日本",
    flag: "🇯🇵",
    region: "Asia Pacific",
    primaryLanguage: { code: "ja", label: "日本語 (Japanese)" },
    supportedLanguages: ["日本語", "English", "Chinese", "Vietnamese"],
    currency: { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    emergencyNumber: "110",
    immigrationBody: "Immigration Services Agency of Japan (出入国在留管理庁)",
    isLaunched: false,
    activeUsers: "18.3K",
    localizedTagline: "日本在住の外国人・移民コミュニティのためのビザ相談、医療、多言語生活サポート。",
    defaultCoords: [35.6762, 139.6503], // Tokyo
    defaultZoom: 12,
  },
  {
    code: "FR",
    name: "France",
    nativeName: "France",
    flag: "🇫🇷",
    region: "Europe",
    primaryLanguage: { code: "fr", label: "Français" },
    supportedLanguages: ["Français", "English", "Arabic"],
    currency: { code: "EUR", symbol: "€", name: "Euro" },
    emergencyNumber: "112",
    immigrationBody: "Office Français de l'Immigration et de l'Intégration (OFII)",
    isLaunched: false,
    activeUsers: "24.5K",
    localizedTagline: "Accompagnement pour titre de séjour, aides sociales et solidarité pour les nouveaux arrivants.",
    defaultCoords: [48.8566, 2.3522], // Paris
    defaultZoom: 12,
  },
  {
    code: "IT",
    name: "Italy",
    nativeName: "Italia",
    flag: "🇮🇹",
    region: "Europe",
    primaryLanguage: { code: "it", label: "Italiano" },
    supportedLanguages: ["Italiano", "English", "Bengali", "Spanish"],
    currency: { code: "EUR", symbol: "€", name: "Euro" },
    emergencyNumber: "112",
    immigrationBody: "Ministero dell'Interno (Permesso di Soggiorno & Immigrazione)",
    isLaunched: false,
    activeUsers: "31.4K",
    localizedTagline: "Guida al permesso di soggiorno, sanità pubblica e supporto per comunità di immigrati in Italia.",
    defaultCoords: [41.9028, 12.4964], // Rome
    defaultZoom: 12,
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    nativeName: "المملكة العربية السعودية",
    flag: "🇸🇦",
    region: "Middle East",
    primaryLanguage: { code: "ar", label: "العربية (Arabic)" },
    supportedLanguages: ["العربية", "English", "Urdu", "Bengali"],
    currency: { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
    emergencyNumber: "911",
    immigrationBody: "Jawazat - General Directorate of Passports & Ministry of Human Resources",
    isLaunched: false,
    activeUsers: "76.2K",
    localizedTagline: "خدمات الإقامة، التأشيرات، رعاية العمالة المغتربة وشبكات الدعم التكافلي في السعودية.",
    defaultCoords: [24.7136, 46.6753], // Riyadh
    defaultZoom: 12,
  },
  {
    code: "MY",
    name: "Malaysia",
    nativeName: "Malaysia",
    flag: "🇲🇾",
    region: "Asia Pacific",
    primaryLanguage: { code: "ms", label: "Bahasa Melayu" },
    supportedLanguages: ["Bahasa Melayu", "English", "Bengali", "Tamil"],
    currency: { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
    emergencyNumber: "999",
    immigrationBody: "Jabatan Imigresen Malaysia (JIM)",
    isLaunched: false,
    activeUsers: "48.3K",
    localizedTagline: "Sokongan permit kerja, khidmat kebajikan pekerja migran dan jaringan komuniti ekspatriat di Malaysia.",
    defaultCoords: [3.139, 101.6869], // Kuala Lumpur
    defaultZoom: 12,
  },
  {
    code: "ES",
    name: "Spain",
    nativeName: "España",
    flag: "🇪🇸",
    region: "Europe",
    primaryLanguage: { code: "es", label: "Español" },
    supportedLanguages: ["Español", "English", "Arabic"],
    currency: { code: "EUR", symbol: "€", name: "Euro" },
    emergencyNumber: "112",
    immigrationBody: "Secretaría de Estado de Migraciones & Extranjería",
    isLaunched: false,
    activeUsers: "27.8K",
    localizedTagline: "Trámites de arraigo, empadronamiento y asesoría legal gratuita para migrantes en España.",
    defaultCoords: [40.4168, -3.7038], // Madrid
    defaultZoom: 12,
  },
  {
    code: "IN",
    name: "India",
    nativeName: "भारत",
    flag: "🇮🇳",
    region: "South Asia",
    primaryLanguage: { code: "en", label: "English / हिन्दी" },
    supportedLanguages: ["English", "हिन्दी", "বাংলা", "தமிழ்"],
    currency: { code: "INR", symbol: "₹", name: "Indian Rupee" },
    emergencyNumber: "112",
    immigrationBody: "Bureau of Immigration & Ministry of External Affairs",
    isLaunched: false,
    activeUsers: "33.5K",
    localizedTagline: "Cross-border diaspora resources, consular advisory, and regional community networks.",
    defaultCoords: [28.6139, 77.209], // New Delhi
    defaultZoom: 12,
  },
];

const STORAGE_COUNTRIES_KEY = "ic_platform_countries";
const STORAGE_ACTIVE_COUNTRY_KEY = "ic_platform_active_country";

interface CountryPlatformContextType {
  countries: CountryConfig[];
  launchedCountries: CountryConfig[];
  currentCountry: CountryConfig;
  setCurrentCountry: (code: string) => void;
  toggleLaunchCountry: (code: string) => void;
  updateCountryConfig: (code: string, updates: Partial<CountryConfig>) => void;
  addNewCountry: (country: CountryConfig) => void;
  getCountryByCode: (code: string) => CountryConfig | undefined;
  getCountryLaunchUrl: (code: string) => string;
  getCountrySubdomainUrl: (code: string) => string;
}

const CountryPlatformContext = createContext<CountryPlatformContextType | null>(null);

export function CountryPlatformProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { lang, setLang } = useLanguage();

  const [countries, setCountries] = useState<CountryConfig[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_COUNTRIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to read countries from localStorage", e);
    }
    return INITIAL_COUNTRIES;
  });

  const [currentCountryCode, setCurrentCountryCode] = useState<string>(() => {
    try {
      // Check URL query first (e.g. ?country=ca)
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const qCountry = params.get("country");
        if (qCountry) return qCountry.toUpperCase();
      }
      const stored = localStorage.getItem(STORAGE_ACTIVE_COUNTRY_KEY);
      if (stored) return stored;
    } catch (e) {
      console.warn("Failed to read active country from localStorage", e);
    }
    return "US";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COUNTRIES_KEY, JSON.stringify(countries));
    } catch (e) {
      console.warn("Failed to persist countries", e);
    }
  }, [countries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_COUNTRY_KEY, currentCountryCode);
    } catch (e) {
      console.warn("Failed to persist active country", e);
    }
  }, [currentCountryCode]);

  // Sync with React Router location.search or deep links
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(location.search || window.location.search);
      const qCountry = params.get("country");
      if (qCountry) {
        const match = countries.find(c => c.code.toLowerCase() === qCountry.toLowerCase());
        if (match) {
          if (match.code !== currentCountryCode) {
            setCurrentCountryCode(match.code);
          }
          const targetLang = match.primaryLanguage.code.toLowerCase() as Lang;
          if (targetLang && targetLang !== lang) {
            setLang(targetLang);
          }
        }
      }
    }
  }, [location.search, countries]);

  // When active country changes, ensure system language switches to country primary language
  useEffect(() => {
    const match = countries.find(c => c.code.toUpperCase() === currentCountryCode.toUpperCase());
    if (match && match.primaryLanguage?.code) {
      const targetLang = match.primaryLanguage.code.toLowerCase() as Lang;
      if (targetLang && targetLang !== lang) {
        setLang(targetLang);
      }
    }
  }, [currentCountryCode, countries]);

  const launchedCountries = countries.filter(c => c.isLaunched);

  const currentCountry = countries.find(c => c.code === currentCountryCode) || countries[0];

  const setCurrentCountry = (code: string) => {
    const exists = countries.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (exists) {
      setCurrentCountryCode(exists.code);
      const targetLang = exists.primaryLanguage.code.toLowerCase() as Lang;
      if (targetLang && targetLang !== lang) {
        setLang(targetLang);
      }
    }
  };

  const toggleLaunchCountry = (code: string) => {
    setCountries(prev =>
      prev.map(c => {
        if (c.code === code) {
          const nextState = !c.isLaunched;
          return {
            ...c,
            isLaunched: nextState,
            launchedAt: nextState
              ? new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
              : undefined,
          };
        }
        return c;
      })
    );
  };

  const updateCountryConfig = (code: string, updates: Partial<CountryConfig>) => {
    setCountries(prev =>
      prev.map(c => (c.code === code ? { ...c, ...updates } : c))
    );
  };

  const addNewCountry = (newCountry: CountryConfig) => {
    setCountries(prev => [newCountry, ...prev.filter(c => c.code !== newCountry.code)]);
  };

  const getCountryByCode = (code: string) => {
    return countries.find(c => c.code.toLowerCase() === code.toLowerCase());
  };

  const getCountryLaunchUrl = (code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
    const country = countries.find(c => c.code.toLowerCase() === code.toLowerCase());
    const langCode = country?.primaryLanguage?.code ? country.primaryLanguage.code.toLowerCase() : "en";
    return `${origin}/feed?country=${code.toLowerCase()}&lang=${langCode}`;
  };

  const getCountrySubdomainUrl = (code: string) => {
    return `https://${code.toLowerCase()}.immigrantconnect.org`;
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
