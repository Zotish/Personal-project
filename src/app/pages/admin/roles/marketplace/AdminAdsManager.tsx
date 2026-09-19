import React, { useState } from "react";
import { Link } from "react-router";
import {
  Sparkles, Plus, Search, Filter, Play, Pause, Trash2, Edit3,
  ExternalLink, Eye, MousePointerClick, TrendingUp, CheckCircle2,
  AlertTriangle, Globe, X, Check, Image as ImageIcon, ArrowUpRight
} from "lucide-react";
import { useAds, SponsoredAd } from "../../../../context/AdsContext";
import { useCountryPlatform } from "../../../../context/CountryPlatformContext";
import { SponsoredAdCard } from "../../../../components/ads/SponsoredAdCard";

export function AdminAdsManager() {
  const { ads, activeAds, addAd, updateAd, deleteAd, toggleAdStatus } = useAds();
  const { countries } = useCountryPlatform();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "paused">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<SponsoredAd | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formSponsorName, setFormSponsorName] = useState("");
  const [formSponsorHandle, setFormSponsorHandle] = useState("@brand_official");
  const [formSponsorAvatar, setFormSponsorAvatar] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop");
  const [formBadgeText, setFormBadgeText] = useState("Sponsored");
  const [formDescription, setFormDescription] = useState("");
  const [formMediaUrl, setFormMediaUrl] = useState("https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=400&fit=crop");
  const [formCtaText, setFormCtaText] = useState("Learn More");
  const [formCtaUrl, setFormCtaUrl] = useState("https://example.com");
  const [formTargetCountry, setFormTargetCountry] = useState("ALL");
  const [formTargetPlacement, setFormTargetPlacement] = useState<"all" | "feed" | "explore" | "services" | "qna">("all");
  const [formCategory, setFormCategory] = useState<SponsoredAd["category"]>("Financial");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Preset image templates for 1-click setup
  const PRESET_TEMPLATES = [
    {
      label: "Remittance & Money",
      title: "Send Money Abroad with Zero Hidden Fees & Best Rates",
      sponsor: "Apex Express Wire",
      category: "Financial" as const,
      media: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=400&fit=crop",
      cta: "Send Money Now",
      url: "https://www.remitly.com",
    },
    {
      label: "Legal Consultation",
      title: "Asylum, Green Card & Work Permit Legal Assistance",
      sponsor: "Global Rights Law LLC",
      category: "Legal" as const,
      media: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&h=400&fit=crop",
      cta: "Book Free Session",
      url: "/services/legal",
    },
    {
      label: "ESL & Careers",
      title: "Fast-Track Job Training & Bilingual ESL Certifications",
      sponsor: "FutureCareers USA",
      category: "Education" as const,
      media: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop",
      cta: "Enroll Free",
      url: "/services/school",
    },
    {
      label: "Halal Grocery & Food",
      title: "Order Authentic Deshi Spices, Meat & Fresh Produce Delivered",
      sponsor: "Deshi Bazar Direct",
      category: "Food" as const,
      media: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop",
      cta: "Get $20 Off Order",
      url: "/services/halal-food",
    },
  ];

  const applyTemplate = (t: typeof PRESET_TEMPLATES[0]) => {
    setFormTitle(t.title);
    setFormSponsorName(t.sponsor);
    setFormCategory(t.category);
    setFormMediaUrl(t.media);
    setFormCtaText(t.cta);
    setFormCtaUrl(t.url);
    setFormDescription(`Connect with verified ${t.sponsor} specialists. Exclusive special rates and priority onboarding for newly arrived immigrants and community members.`);
  };

  const handleOpenCreate = () => {
    applyTemplate(PRESET_TEMPLATES[0]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (ad: SponsoredAd) => {
    setEditingAd(ad);
    setFormTitle(ad.title);
    setFormSponsorName(ad.sponsorName);
    setFormSponsorHandle(ad.sponsorHandle || "");
    setFormSponsorAvatar(ad.sponsorAvatar || "");
    setFormBadgeText(ad.badgeText || "Sponsored");
    setFormDescription(ad.description);
    setFormMediaUrl(ad.mediaUrl || "");
    setFormCtaText(ad.ctaText);
    setFormCtaUrl(ad.ctaUrl);
    setFormTargetCountry(ad.targetCountry);
    setFormTargetPlacement(ad.targetPlacement);
    setFormCategory(ad.category);
  };

  const handleSaveAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSponsorName || !formDescription) {
      showToast("Please fill in the title, sponsor name, and ad copy.");
      return;
    }

    if (editingAd) {
      updateAd(editingAd.id, {
        title: formTitle,
        sponsorName: formSponsorName,
        sponsorHandle: formSponsorHandle,
        sponsorAvatar: formSponsorAvatar,
        badgeText: formBadgeText,
        description: formDescription,
        mediaUrl: formMediaUrl,
        ctaText: formCtaText,
        ctaUrl: formCtaUrl,
        targetCountry: formTargetCountry,
        targetPlacement: formTargetPlacement,
        category: formCategory,
      });
      showToast(`Updated campaign for "${formSponsorName}"`);
      setEditingAd(null);
    } else {
      addAd({
        title: formTitle,
        sponsorName: formSponsorName,
        sponsorHandle: formSponsorHandle,
        sponsorAvatar: formSponsorAvatar,
        badgeText: formBadgeText,
        description: formDescription,
        mediaUrl: formMediaUrl,
        ctaText: formCtaText,
        ctaUrl: formCtaUrl,
        targetCountry: formTargetCountry,
        targetPlacement: formTargetPlacement,
        category: formCategory,
        status: "active",
      });
      showToast(`Published new sponsored ad: "${formTitle}"! Automatically showing after every 2-3 posts.`);
      setIsCreateModalOpen(false);
    }
  };

  // Filtered ads list
  const filteredAds = ads.filter(ad => {
    const matchSearch =
      ad.title.toLowerCase().includes(search.toLowerCase()) ||
      ad.sponsorName.toLowerCase().includes(search.toLowerCase()) ||
      ad.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || ad.status === filterStatus;
    const matchCategory = filterCategory === "all" || ad.category === filterCategory;
    const matchCountry = filterCountry === "all" || ad.targetCountry === filterCountry;
    return matchSearch && matchStatus && matchCategory && matchCountry;
  });

  const totalImpressions = ads.reduce((acc, a) => acc + a.impressions, 0);
  const totalClicks = ads.reduce((acc, a) => acc + a.clicks, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";

  // Mock preview ad object for modal preview
  const previewAd: SponsoredAd = {
    id: "preview",
    title: formTitle || "Sample Ad Headline",
    sponsorName: formSponsorName || "Verified Sponsor",
    sponsorHandle: formSponsorHandle || "@sponsor",
    sponsorAvatar: formSponsorAvatar,
    badgeText: formBadgeText || "Sponsored",
    description: formDescription || "Your persuasive ad description will appear here.",
    mediaUrl: formMediaUrl,
    ctaText: formCtaText || "Learn More",
    ctaUrl: formCtaUrl || "#",
    targetCountry: formTargetCountry,
    targetPlacement: formTargetPlacement,
    status: "active",
    impressions: 1200,
    clicks: 84,
    createdAt: "Today",
    category: formCategory,
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)}><X className="w-3.5 h-3.5 text-emerald-600" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase text-[#C04A22] font-bold tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Growth & Revenue Engine
          </span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Sponsored Ads & Campaign Publisher
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Post ads that automatically inject after every 2–3 posts and cards across Home Feed, Explore, Services, and Community feeds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/feed"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>View in Home Feed</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-[#C04A22] hover:bg-[#A83D1B] text-xs font-bold text-white transition flex items-center gap-2 shadow-md shadow-[#C04A22]/20 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Post New Sponsored Ad
          </button>
        </div>
      </div>

      {/* Live Telemetry Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Active Campaigns</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {activeAds.length} <span className="text-xs font-normal text-slate-400">/ {ads.length} total</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Delivering every 2–3 posts automatically
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Delivered Impressions</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalImpressions.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Recorded scroll appearances</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Verified Clicks</span>
            <MousePointerClick className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">Direct external & internal conversions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Average CTR Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {avgCtr}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">3.4x industry social ad benchmark</div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ads by headline, sponsor, or copy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C04A22] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Status filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filterStatus === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
              }`}
            >
              All ({ads.length})
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filterStatus === "active" ? "bg-white text-emerald-700 shadow-2xs font-bold" : "text-slate-600"
              }`}
            >
              Active ({activeAds.length})
            </button>
            <button
              onClick={() => setFilterStatus("paused")}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filterStatus === "paused" ? "bg-white text-slate-700 shadow-2xs font-bold" : "text-slate-600"
              }`}
            >
              Paused ({ads.length - activeAds.length})
            </button>
          </div>

          {/* Country filter */}
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Targets</option>
            <option value="ALL">Worldwide (ALL)</option>
            {countries.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ads List Card Grid */}
      <div className="space-y-3">
        {filteredAds.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No campaigns found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create a new sponsored ad to begin monetizing or promoting critical diaspora services.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 bg-[#C04A22] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              + Create First Ad
            </button>
          </div>
        ) : (
          filteredAds.map((ad) => {
            const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : "0.0";
            const isLive = ad.status === "active";

            return (
              <div
                key={ad.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-4 shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Main Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {ad.mediaUrl ? (
                    <img
                      src={ad.mediaUrl}
                      alt={ad.title}
                      className="w-20 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0 bg-slate-100"
                    />
                  ) : (
                    <div className="w-20 h-16 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-amber-500" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isLive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isLive ? "● LIVE ACTIVE" : "PAUSED"}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                        {ad.badgeText || "Sponsored"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Target: {ad.targetCountry === "ALL" ? "🌍 Worldwide" : `📍 ${ad.targetCountry}`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Category: {ad.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 truncate leading-snug">
                      {ad.title}
                    </h3>

                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      <strong className="text-slate-700">{ad.sponsorName}</strong>: {ad.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 font-mono">
                      <span>CTA: <strong className="text-slate-800">"{ad.ctaText}"</strong></span>
                      <span>URL: <span className="text-blue-600 underline truncate max-w-xs">{ad.ctaUrl}</span></span>
                    </div>
                  </div>
                </div>

                {/* Right: Metrics & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="flex items-center gap-4 text-center text-xs">
                    <div>
                      <div className="font-mono font-bold text-slate-800 text-sm">{ad.impressions.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Views</div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-purple-700 text-sm">{ad.clicks.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Clicks</div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-emerald-700 text-sm">{ctr}%</div>
                      <div className="text-[10px] text-slate-400 uppercase">CTR</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => {
                        toggleAdStatus(ad.id);
                        showToast(`Campaign "${ad.title.slice(0, 20)}..." is now ${isLive ? "paused" : "live"}`);
                      }}
                      className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        isLive
                          ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                      }`}
                      title={isLive ? "Pause this ad" : "Activate this ad"}
                    >
                      {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(ad)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                      title="Edit Ad Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete sponsored ad "${ad.title}"?`)) {
                          deleteAd(ad.id);
                          showToast("Sponsored ad removed.");
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                      title="Delete ad"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {(isCreateModalOpen || editingAd) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto my-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#C04A22] font-bold">
                  {editingAd ? "Modify Campaign" : "New Sponsored Ad Publisher"}
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {editingAd ? "Edit Sponsored Ad" : "Create & Post Sponsored Ad"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingAd(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector (Only on New) */}
            {!editingAd && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-xs font-bold text-slate-700 block mb-2">⚡ 1-Click Fast Templates:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-orange-50 hover:text-[#C04A22] text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveAd} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Fields Column */}
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ad Title / Headline *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Zero-Fee Instant Wire Transfers to Home"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sponsor / Brand Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Remitly Global"
                        value={formSponsorName}
                        onChange={(e) => setFormSponsorName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Social Handle</label>
                      <input
                        type="text"
                        placeholder="@brand_official"
                        value={formSponsorHandle}
                        onChange={(e) => setFormSponsorHandle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Category</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="Financial">Financial</option>
                        <option value="Legal">Legal</option>
                        <option value="Housing">Housing</option>
                        <option value="Jobs">Jobs</option>
                        <option value="Education">Education</option>
                        <option value="Food">Food</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Badge Tag</label>
                      <input
                        type="text"
                        placeholder="Sponsored"
                        value={formBadgeText}
                        onChange={(e) => setFormBadgeText(e.target.value)}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Target Country</label>
                      <select
                        value={formTargetCountry}
                        onChange={(e) => setFormTargetCountry(e.target.value)}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="ALL">🌍 All Countries</option>
                        {countries.map(c => (
                          <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ad Copy / Body Text *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Write descriptive, engaging text for newcomers..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Banner Media URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formMediaUrl}
                      onChange={(e) => setFormMediaUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">CTA Button Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Learn More / Claim 50% Off"
                        value={formCtaText}
                        onChange={(e) => setFormCtaText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">CTA Target Link</label>
                      <input
                        type="text"
                        placeholder="https://... or /services/..."
                        value={formCtaUrl}
                        onChange={(e) => setFormCtaUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#C04A22] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview Column */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-600">
                      <span>📱 Live Feed Ad Preview</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full font-mono">
                        Auto-Inserted Every 2–3 Posts
                      </span>
                    </div>

                    <div className="max-w-md mx-auto">
                      <SponsoredAdCard ad={previewAd} variant="feed" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 text-slate-500 text-[11px] leading-relaxed">
                    💡 This ad will automatically be rendered in standard feed stream after every 2–3 community posts. Clicking the CTA directs users to your chosen link with full attribution tracking.
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingAd(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C04A22] hover:bg-[#A83D1B] text-xs font-bold text-white transition flex items-center gap-1.5 shadow-md shadow-[#C04A22]/20 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAd ? "Save Changes" : "Publish Ad to Feeds"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
