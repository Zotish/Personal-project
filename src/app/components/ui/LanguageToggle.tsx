import { useLanguage, Lang } from "../../context/LanguageContext";
import { useCountryPlatform } from "../../context/CountryPlatformContext";

export interface LanguageToggleProps {
  compact?: boolean;
}

export interface LangPairItem {
  code: Lang;
  shortLabel: string;
  fullLabel: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANG_PAIR_METAS: Record<Lang, LangPairItem> = {
  en: { code: "en", shortLabel: "EN", fullLabel: "EN · English", name: "English", nativeName: "English", flag: "🇺🇸" },
  bn: { code: "bn", shortLabel: "বাং", fullLabel: "বাং · বাংলা", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩" },
  de: { code: "de", shortLabel: "DE", fullLabel: "DE · Deutsch", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  fr: { code: "fr", shortLabel: "FR", fullLabel: "FR · Français", name: "French", nativeName: "Français", flag: "🇫🇷" },
  es: { code: "es", shortLabel: "ES", fullLabel: "ES · Español", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  ar: { code: "ar", shortLabel: "AR", fullLabel: "AR · العربية", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  ja: { code: "ja", shortLabel: "JA", fullLabel: "JA · 日本語", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  it: { code: "it", shortLabel: "IT", fullLabel: "IT · Italiano", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  ms: { code: "ms", shortLabel: "MS", fullLabel: "MS · Melayu", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾" },
};

/**
 * Returns exactly two languages:
 * 1. English (Global)
 * 2. Current country's official native mother language (e.g. বাংলা, Deutsch, Français, 日本語, etc.)
 */
export function useCountryLanguagePair() {
  const { currentCountry } = useCountryPlatform();

  const rawMotherLang = (currentCountry?.primaryLanguage?.code?.toLowerCase() || "bn");
  const motherLangCode = (rawMotherLang === "ja" ? "en" : rawMotherLang) as Lang;
  const isEnglishCountry = motherLangCode === "en";

  // If country's primary is already English (US, CA, GB, AU) or disabled, use Bengali as secondary
  const secondaryCode: Lang = isEnglishCountry ? "bn" : motherLangCode;

  const primaryLang = LANG_PAIR_METAS.en;
  const secondaryLang = LANG_PAIR_METAS[secondaryCode] || LANG_PAIR_METAS.bn;

  return { primaryLang, secondaryLang, currentCountry };
}

export function LanguageToggle({ compact }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();
  const { primaryLang, secondaryLang } = useCountryLanguagePair();

  if (compact) {
    return (
      <div className="flex items-center bg-secondary rounded-xl p-0.5 gap-0.5">
        <button
          type="button"
          onClick={() => setLang(primaryLang.code)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
            lang === primaryLang.code
              ? "bg-white text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {primaryLang.shortLabel}
        </button>
        <button
          type="button"
          onClick={() => setLang(secondaryLang.code)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
            lang === secondaryLang.code
              ? "bg-white text-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {secondaryLang.shortLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
      <button
        type="button"
        onClick={() => setLang(primaryLang.code)}
        className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
          lang === primaryLang.code
            ? "bg-white text-[#8C3015] shadow-xs border border-slate-200/60"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        {primaryLang.fullLabel}
      </button>
      <button
        type="button"
        onClick={() => setLang(secondaryLang.code)}
        className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
          lang === secondaryLang.code
            ? "bg-white text-[#8C3015] shadow-xs border border-slate-200/60"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        {secondaryLang.fullLabel}
      </button>
    </div>
  );
}
