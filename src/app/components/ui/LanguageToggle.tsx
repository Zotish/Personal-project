import { useLanguage } from "../../context/LanguageContext";

interface LanguageToggleProps {
  compact?: boolean;
}

export function LanguageToggle({ compact }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();

  if (compact) {
    return (
      <div className="flex items-center bg-secondary rounded-xl p-0.5 gap-0.5">
        <button
          onClick={() => setLang("en")}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
            lang === "en"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLang("bn")}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
            lang === "bn"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          বাং
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-secondary rounded-xl p-0.5 gap-0.5 flex-1">
        <button
          onClick={() => setLang("en")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            lang === "en"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          EN · English
        </button>
        <button
          onClick={() => setLang("bn")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            lang === "bn"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          বাং · বাংলা
        </button>
      </div>
    </div>
  );
}
