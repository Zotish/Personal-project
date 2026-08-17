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
    <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
      <button
        onClick={() => setLang("en")}
        className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
          lang === "en"
            ? "bg-white text-[#8C3015] shadow-sm border border-slate-200/60"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        EN · English
      </button>
      <button
        onClick={() => setLang("bn")}
        className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
          lang === "bn"
            ? "bg-white text-[#8C3015] shadow-sm border border-slate-200/60"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        বাং · বাংলা
      </button>
    </div>
  );
}
