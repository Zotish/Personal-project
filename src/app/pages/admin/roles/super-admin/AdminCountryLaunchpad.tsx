import React, { useState } from "react";
import {
  Globe, CheckCircle2, AlertCircle, Play, Pause, Eye,
  Sliders, Plus, Search, Filter, Shield, Phone, Sparkles,
  ExternalLink, ArrowRight, X, RefreshCw, Layers, MapPin,
  Copy, Check, Link2, Share2, Send
} from "lucide-react";
import { useCountryPlatform, CountryConfig } from "../../../../context/CountryPlatformContext";

export function AdminCountryLaunchpad() {
  const {
    countries,
    launchedCountries,
    toggleLaunchCountry,
    updateCountryConfig,
    addNewCountry,
    currentCountry,
    setCurrentCountry,
    getCountryLaunchUrl,
    getCountrySubdomainUrl,
  } = useCountryPlatform();

  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "launched" | "pending">("all");
  const [launchFeedback, setLaunchFeedback] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Modals state
  const [previewCountry, setPreviewCountry] = useState<CountryConfig | null>(null);
  const [justLaunchedCountry, setJustLaunchedCountry] = useState<CountryConfig | null>(null);
  const [editingCountry, setEditingCountry] = useState<CountryConfig | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Country Form state
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newNativeName, setNewNativeName] = useState("");
  const [newFlag, setNewFlag] = useState("🌐");
  const [newRegion, setNewRegion] = useState<CountryConfig["region"]>("Europe");
  const [newLangCode, setNewLangCode] = useState("en");
  const [newLangLabel, setNewLangLabel] = useState("English");
  const [newCurrencyCode, setNewCurrencyCode] = useState("USD");
  const [newCurrencySymbol, setNewCurrencySymbol] = useState("$");
  const [newEmergency, setNewEmergency] = useState("112");
  const [newImmigrationBody, setNewImmigrationBody] = useState("");
  const [newTagline, setNewTagline] = useState("");

  const handleCopyLink = (url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2500);
    }
  };

  const handleToggleLaunch = (c: CountryConfig) => {
    toggleLaunchCountry(c.code);
    const willBeLaunched = !c.isLaunched;
    if (willBeLaunched) {
      const updated = { ...c, isLaunched: true, launchedAt: "Just now" };
      setJustLaunchedCountry(updated);
      setLaunchFeedback(
        `🚀 Platform launched for ${c.flag} ${c.name}! Portal link has been generated below.`
      );
    } else {
      setLaunchFeedback(`⏸️ Platform deployment paused for ${c.flag} ${c.name}.`);
    }
    setTimeout(() => setLaunchFeedback(null), 6000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCountry) return;
    updateCountryConfig(editingCountry.code, editingCountry);
    setEditingCountry(null);
    setLaunchFeedback(`Settings updated for ${editingCountry.flag} ${editingCountry.name}.`);
    setTimeout(() => setLaunchFeedback(null), 4000);
  };

  const handleCreateCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const created: CountryConfig = {
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      nativeName: newNativeName.trim() || newName.trim(),
      flag: newFlag.trim() || "🌐",
      region: newRegion,
      primaryLanguage: { code: newLangCode.trim(), label: newLangLabel.trim() },
      supportedLanguages: [newLangLabel.trim(), "English"],
      currency: { code: newCurrencyCode.trim().toUpperCase(), symbol: newCurrencySymbol.trim(), name: `${newName} Currency` },
      emergencyNumber: newEmergency.trim(),
      immigrationBody: newImmigrationBody.trim() || "National Immigration & Foreign Affairs Service",
      isLaunched: true,
      launchedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      activeUsers: "10.0K",
      localizedTagline: newTagline.trim() || `Connecting and empowering immigrants in ${newName}.`,
      defaultCoords: [0, 0],
      defaultZoom: 11,
    };

    addNewCountry(created);
    setIsAddModalOpen(false);
    // Reset form
    setNewCode("");
    setNewName("");
    setNewNativeName("");
    setNewFlag("🌐");
    setNewImmigrationBody("");
    setNewTagline("");
    setLaunchFeedback(`✨ Added and launched ${created.flag} ${created.name} worldwide!`);
    setTimeout(() => setLaunchFeedback(null), 5000);
  };

  const regions = ["all", "North America", "South Asia", "Europe", "Middle East", "Asia Pacific", "Latin America", "Africa"];

  const filteredCountries = countries.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.primaryLanguage.label.toLowerCase().includes(search.toLowerCase()) ||
      c.currency.code.toLowerCase().includes(search.toLowerCase());

    const matchesRegion = selectedRegion === "all" || c.region === selectedRegion;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "launched" && c.isLaunched) ||
      (statusFilter === "pending" && !c.isLaunched);

    return matchesSearch && matchesRegion && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase text-[#C04A22] font-bold tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> Super Admin Exclusive • Global Architecture
          </span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Worldwide Country Launchpad & Multi-Tenant OS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
            Deploy ImmigrantConnect / PathaSathi across any country in real-time. Enabling a nation dynamically provisions native language localization, local currency pricing, emergency dispatch hotlines, and regional legal assistance directories.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#C04A22] hover:bg-[#A83D1B] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sovereign Country</span>
          </button>
        </div>
      </div>

      {/* Launch Feedback Banner */}
      {launchFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{launchFeedback}</span>
          </div>
          <button onClick={() => setLaunchFeedback(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Live Deployed Nations</span>
            <Globe className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {launchedCountries.length} <span className="text-xs font-normal text-slate-400">/ {countries.length} Available</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(launchedCountries.length / countries.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Global Immigrant Reach</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">241.2K</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Across {launchedCountries.length} active sovereign regions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Auto-Localization Engine</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">Active • 100%</div>
          <div className="text-[11px] text-slate-500 mt-1">Native scripts, currencies & hotlines</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Next Recommended Rollout</span>
            <MapPin className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">🇨🇦 Canada (IRCC)</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">52.1K pre-registered diaspora queue</div>
        </div>
      </div>

      {/* Filters & Search Control */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search country, language, currency, or ISO code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C04A22] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  statusFilter === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({countries.length})
              </button>
              <button
                onClick={() => setStatusFilter("launched")}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                  statusFilter === "launched" ? "bg-white text-emerald-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live ({launchedCountries.length})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  statusFilter === "pending" ? "bg-white text-amber-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending ({countries.length - launchedCountries.length})
              </button>
            </div>
          </div>
        </div>

        {/* Region Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedRegion === r
                  ? "bg-[#C04A22] text-white font-bold shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              {r === "all" ? "All Regions" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Country Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCountries.map(country => {
          const isCurrentActive = currentCountry.code === country.code;
          return (
            <div
              key={country.code}
              className={`bg-white border rounded-3xl p-5 transition-all flex flex-col justify-between shadow-xs ${
                country.isLaunched
                  ? "border-emerald-200 ring-1 ring-emerald-100"
                  : "border-slate-200 opacity-90"
              }`}
            >
              <div>
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl shadow-2xs flex-shrink-0">
                      {country.flag}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-black text-slate-900 leading-tight">
                          {country.name}
                        </h3>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          {country.code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">{country.nativeName}</div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 block">
                        {country.region}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {country.isLaunched ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200">
                        Ready to Launch
                      </span>
                    )}
                  </div>
                </div>

                {/* Auto-Configured Local Specs Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Primary Language:</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                      {country.primaryLanguage.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Local Currency:</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs font-mono">
                      {country.currency.symbol} ({country.currency.code})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Emergency Dispatch:</span>
                    <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200 flex items-center gap-1 font-mono">
                      <Phone className="w-2.5 h-2.5" /> {country.emergencyNumber}
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium mb-0.5">Immigration & Legal Authority:</div>
                    <div className="font-bold text-slate-800 line-clamp-1 text-[11px]" title={country.immigrationBody}>
                      {country.immigrationBody}
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium mb-0.5">Localized Welcome Message:</div>
                    <p className="text-[11px] text-slate-700 italic line-clamp-2 leading-relaxed font-medium">
                      "{country.localizedTagline}"
                    </p>
                  </div>
                </div>

                {/* Live Portal URL Display for Launched Country */}
                {country.isLaunched && (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 mb-3 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Platform URL
                      </span>
                      <span className="font-mono text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.2 rounded">
                        Ready
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 bg-white p-1.5 rounded-xl border border-emerald-200">
                      <span className="font-mono text-[11px] text-slate-800 font-bold truncate select-all">
                        {getCountryLaunchUrl(country.code)}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(getCountryLaunchUrl(country.code))}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Copy Link to Clipboard"
                        >
                          {copiedUrl === getCountryLaunchUrl(country.code) ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <a
                          href={getCountryLaunchUrl(country.code)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded-lg bg-[#C04A22] hover:bg-[#A83D1B] text-white text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Open Country Portal in New Tab"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between font-mono pt-0.5">
                      <span className="truncate">Subdomain: {getCountrySubdomainUrl(country.code)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                {/* Primary Launch/Pause Toggle Button */}
                <button
                  onClick={() => handleToggleLaunch(country)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    country.isLaunched
                      ? "bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200"
                      : "bg-[#C04A22] hover:bg-[#A83D1B] text-white shadow-xs"
                  }`}
                >
                  {country.isLaunched ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Platform for {country.name}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Launch for {country.name}</span>
                    </>
                  )}
                </button>

                {/* Secondary Actions: Preview Simulator & Settings */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewCountry(country)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Live Simulator</span>
                  </button>

                  <button
                    onClick={() => setEditingCountry(country)}
                    className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Configure Regional Settings"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tune</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Country Simulator Modal */}
      {previewCountry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{previewCountry.flag}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Live Client App Simulation ({previewCountry.name})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Demonstrating auto-localization, language, currency, and emergency hotlines.
                  </p>
                </div>
              </div>
              <button onClick={() => setPreviewCountry(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mock Phone Frame */}
            <div className="bg-slate-900 rounded-3xl p-3 shadow-inner text-white max-w-sm mx-auto overflow-hidden border-4 border-slate-800">
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-3 py-1 font-mono">
                <span>09:41</span>
                <span>{previewCountry.code} 5G • 100%</span>
              </div>

              {/* Mock App Header */}
              <div className="bg-slate-850 p-3 rounded-2xl mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{previewCountry.flag}</span>
                  <div>
                    <div className="text-xs font-bold leading-tight">ImmigrantConnect</div>
                    <div className="text-[10px] text-slate-400">{previewCountry.name} Hub</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C04A22] text-white">
                  {previewCountry.primaryLanguage.label}
                </span>
              </div>

              {/* Emergency Banner tuned to Country */}
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-2.5 mb-2 text-red-200 text-xs flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-[11px] text-white">Local Emergency Dispatch: {previewCountry.emergencyNumber}</div>
                  <div className="text-[10px] text-red-300">Instant connection to 24/7 medical and police aid.</div>
                </div>
              </div>

              {/* Localized Welcome Banner */}
              <div className="bg-slate-800 p-3 rounded-xl mb-2 text-xs">
                <div className="font-bold text-amber-400 text-[11px] mb-1">Diaspora Network Notice</div>
                <p className="text-[11px] text-slate-200 leading-relaxed font-medium italic">
                  "{previewCountry.localizedTagline}"
                </p>
              </div>

              {/* Mock Services & Marketplace Pricing */}
              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded-xl bg-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] font-bold">Immigration & Asylum Advice</div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    Free / {previewCountry.currency.symbol}0
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] font-bold">Halal Grocery & Food Basket</div>
                  <span className="text-[10px] text-white font-mono font-bold">
                    {previewCountry.currency.symbol}35.00 {previewCountry.currency.code}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] font-bold">Language Translation Session</div>
                  <span className="text-[10px] text-white font-mono font-bold">
                    {previewCountry.currency.symbol}20.00 / hr
                  </span>
                </div>
              </div>

              {/* Authority verification footer */}
              <div className="mt-3 pt-2 border-t border-slate-800 text-center">
                <span className="text-[9px] text-slate-400">
                  Compliant with {previewCountry.immigrationBody}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setPreviewCountry(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                Close Preview
              </button>
              <a
                href={getCountryLaunchUrl(previewCountry.code)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Live Link</span>
              </a>
              <button
                onClick={() => {
                  setCurrentCountry(previewCountry.code);
                  setPreviewCountry(null);
                  setLaunchFeedback(`Switched platform test instance to ${previewCountry.flag} ${previewCountry.name}.`);
                  setTimeout(() => setLaunchFeedback(null), 4000);
                }}
                className="px-4 py-2 rounded-xl bg-[#C04A22] hover:bg-[#A83D1B] text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Set as Active Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration & Direct Link Generation Modal */}
      {justLaunchedCountry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl text-slate-900 relative overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl shadow-xs flex-shrink-0">
                  {justLaunchedCountry.flag}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Platform Live
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono">({justLaunchedCountry.code})</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    {justLaunchedCountry.name} Portal is Live!
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setJustLaunchedCountry(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              The platform has been dynamically provisioned for <strong>{justLaunchedCountry.name}</strong>. Immigrants and diaspora members accessing this link will automatically experience the app configured for this nation with local language, currency, and emergency dispatch services.
            </p>

            {/* Direct Portal Link Box */}
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 mb-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-emerald-600" /> Direct Launched Portal URL:
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full font-mono">
                  Ready to Share
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-emerald-300 shadow-2xs">
                <span className="font-mono text-xs text-slate-900 font-bold truncate select-all">
                  {getCountryLaunchUrl(justLaunchedCountry.code)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyLink(getCountryLaunchUrl(justLaunchedCountry.code))}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer flex-shrink-0"
                >
                  {copiedUrl === getCountryLaunchUrl(justLaunchedCountry.code) ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-mono pt-1 flex items-center justify-between">
                <span>Production Domain: {getCountrySubdomainUrl(justLaunchedCountry.code)}</span>
              </div>
            </div>

            {/* Config summary */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Active Language:</span>
                <span className="font-bold text-slate-800">{justLaunchedCountry.primaryLanguage.label}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Local Currency:</span>
                <span className="font-bold text-slate-800">{justLaunchedCountry.currency.symbol} ({justLaunchedCountry.currency.code})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Emergency Hotline:</span>
                <span className="font-bold text-red-700">🚨 {justLaunchedCountry.emergencyNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Legal Authority:</span>
                <span className="font-bold text-slate-800 truncate block">{justLaunchedCountry.immigrationBody.split(" ")[0]}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setJustLaunchedCountry(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                Done
              </button>
              <a
                href={getCountryLaunchUrl(justLaunchedCountry.code)}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 rounded-xl bg-[#C04A22] hover:bg-[#A83D1B] text-xs font-bold text-white transition flex items-center gap-1.5 shadow-md shadow-[#C04A22]/20 cursor-pointer"
              >
                <span>Open Live Portal Now</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Configure Regional Settings Modal */}
      {editingCountry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C04A22]" /> Tune {editingCountry.flag} {editingCountry.name} Settings
              </h3>
              <button onClick={() => setEditingCountry(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Local Emergency Dial Number</label>
                <input
                  type="text"
                  required
                  value={editingCountry.emergencyNumber}
                  onChange={(e) => setEditingCountry({ ...editingCountry, emergencyNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Immigration & Legal Authority</label>
                <input
                  type="text"
                  required
                  value={editingCountry.immigrationBody}
                  onChange={(e) => setEditingCountry({ ...editingCountry, immigrationBody: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Currency Symbol</label>
                <input
                  type="text"
                  required
                  value={editingCountry.currency.symbol}
                  onChange={(e) => setEditingCountry({
                    ...editingCountry,
                    currency: { ...editingCountry.currency, symbol: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Localized Immigrant Welcome Tagline</label>
                <textarea
                  rows={2}
                  required
                  value={editingCountry.localizedTagline}
                  onChange={(e) => setEditingCountry({ ...editingCountry, localizedTagline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCountry(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C04A22] hover:bg-[#A83D1B] text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Country Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#C04A22]" /> Register & Launch Sovereign Country
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCountry} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-xs text-slate-700 font-semibold block mb-1">Flag Emoji</label>
                  <input
                    type="text"
                    required
                    placeholder="🇳🇿"
                    value={newFlag}
                    onChange={(e) => setNewFlag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg focus:outline-none focus:border-[#C04A22] focus:bg-white"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs text-slate-700 font-semibold block mb-1">ISO Code</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="NZ"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold text-xs focus:outline-none focus:border-[#C04A22] focus:bg-white"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs text-slate-700 font-semibold block mb-1">Emergency</label>
                  <input
                    type="text"
                    required
                    placeholder="111"
                    value={newEmergency}
                    onChange={(e) => setNewEmergency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-xs focus:outline-none focus:border-[#C04A22] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Country Name (English)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Zealand"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Native Name / Script</label>
                <input
                  type="text"
                  placeholder="e.g. Aotearoa"
                  value={newNativeName}
                  onChange={(e) => setNewNativeName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-700 font-semibold block mb-1">Primary Language</label>
                  <input
                    type="text"
                    required
                    placeholder="English / Māori"
                    value={newLangLabel}
                    onChange={(e) => setNewLangLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-semibold block mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    required
                    placeholder="NZ$ ($)"
                    value={newCurrencySymbol}
                    onChange={(e) => setNewCurrencySymbol(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Immigration & Visa Authority</label>
                <input
                  type="text"
                  placeholder="e.g. Immigration New Zealand (INZ)"
                  value={newImmigrationBody}
                  onChange={(e) => setNewImmigrationBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C04A22] hover:bg-[#A83D1B] text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Deploy Country
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
