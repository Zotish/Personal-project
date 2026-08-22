import React, { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Bookmark, MapPin, FileText, Users, Link, Trash2, Search,
  Globe, Scale, Briefcase, Home, GraduationCap, Heart, ChevronRight,
  Sparkles, ExternalLink, Plus, FolderHeart, X, Check
} from "lucide-react";

type SavedItem = {
  id: number;
  type: "place" | "post" | "resource" | "community" | "service";
  title: string;
  subtitle: string;
  emoji: string;
  savedAt: string;
  tag?: string;
  link?: string;
};

const INITIAL_SAVED_ITEMS: SavedItem[] = [
  { id: 1, type: "place", title: "Queens Legal Services", subtitle: "Legal Aid · 0.8 mi · Jamaica, Queens", emoji: "⚖️", savedAt: "2h ago", tag: "Legal", link: "/map" },
  { id: 2, type: "post", title: "H-1B Cap-Exempt Employers: Full Guide", subtitle: "Nadia Islam · @nadia_islam_nyc · 1.2K likes", emoji: "📌", savedAt: "5h ago", tag: "Immigration", link: "/explore" },
  { id: 3, type: "resource", title: "USCIS Form I-765 (EAD Application)", subtitle: "Official USCIS document · Updated 2026", emoji: "📄", savedAt: "1d ago", tag: "Forms", link: "/services" },
  { id: 4, type: "place", title: "Masjid At-Taqwa & Community Center", subtitle: "Mosque & Social Services · 0.3 mi · Brooklyn", emoji: "🕌", savedAt: "2d ago", tag: "Community", link: "/map" },
  { id: 5, type: "community", title: "Bangladeshi New Yorkers Hub", subtitle: "14.2K members · Active Community", emoji: "🇧🇩", savedAt: "3d ago", tag: "Community", link: "/communities" },
  { id: 6, type: "resource", title: "2026 Visa Bulletin — Priority Dates", subtitle: "US Department of State · Monthly update", emoji: "📅", savedAt: "4d ago", tag: "Immigration", link: "/services" },
  { id: 7, type: "service", title: "NYC Free Legal Aid Directory", subtitle: "Verified Community Legal Resources", emoji: "📋", savedAt: "5d ago", tag: "Legal", link: "/services" },
  { id: 8, type: "post", title: "How I got my NY Driver's License as H-1B", subtitle: "Rahim Chowdhury · 892 likes", emoji: "🚗", savedAt: "1w ago", tag: "Driving", link: "/qa" },
  { id: 9, type: "place", title: "Little Bangladesh Grocery & Halal Mart", subtitle: "Halal Grocery · 1.1 mi · Jackson Heights", emoji: "🛒", savedAt: "1w ago", tag: "Food", link: "/map" },
  { id: 10, type: "resource", title: "NYC Immigrant Benefits & Cash Assistance 2026", subtitle: "NYC Government · Official Welfare Guide", emoji: "🏛️", savedAt: "2w ago", tag: "Government", link: "/services" },
];

const FILTER_TABS = ["All", "Places", "Posts", "Resources", "Communities", "Services"];

const TAG_STYLES: Record<string, string> = {
  Legal: "bg-[#FFF7F4] text-[#E05236] border border-[#E05236]/20",
  Immigration: "bg-[#FFF7F4] text-[#E05236] border border-[#E05236]/20",
  Forms: "bg-purple-50 text-purple-700 border border-purple-200",
  Community: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Driving: "bg-blue-50 text-blue-700 border border-blue-200",
  Food: "bg-amber-50 text-amber-700 border border-amber-200",
  Government: "bg-slate-100 text-slate-700 border border-slate-200",
};

const TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  place: MapPin,
  post: FileText,
  resource: Link,
  community: Users,
  service: Globe,
};

export function SavedResources() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<SavedItem[]>(INITIAL_SAVED_ITEMS);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = items.filter(item => {
    const matchesTab =
      activeTab === "All" ||
      item.type.toLowerCase() === activeTab.toLowerCase().slice(0, -1) ||
      (activeTab === "Communities" && item.type === "community") ||
      (activeTab === "Services" && item.type === "service");

    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      (item.tag && item.tag.toLowerCase().includes(search.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
    setShowClearConfirm(false);
  };

  return (
    <AppLayout activeTab="more">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        


        {/* ── 2. Search & Category Filter Pills ── */}
        <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-2xs space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search saved articles, forms, places, or communities..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#E05236] transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {FILTER_TABS.map(tab => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                    active
                      ? "bg-[#E05236] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. Quick Collections Shortcuts ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            { label: "Legal Aid", icon: Scale, count: 2, path: "/services" },
            { label: "Immigration", icon: FileText, count: 3, path: "/services" },
            { label: "Places & Halal", icon: MapPin, count: 3, path: "/map" },
            { label: "Communities", icon: Users, count: 2, path: "/communities" },
          ].map(({ label, icon: Icon, count, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex items-center gap-2.5 p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-200/90 hover:border-[#E05236]/40 hover:shadow-sm transition-all text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FFF7F4] text-[#E05236] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 group-hover:text-[#E05236] transition-colors truncate">
                  {label}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {count} saved
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── 4. Saved Items List ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-extrabold text-slate-700">
              {activeTab === "All" ? "All Bookmarks" : activeTab} ({filtered.length})
            </span>
            {items.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-slate-400 hover:text-red-600 font-semibold transition cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FFF7F4] text-[#E05236] flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">No saved items found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {search ? `No results for "${search}".` : "Items and resources you bookmark will appear here."}
              </p>
              <button
                onClick={() => navigate("/services")}
                className="px-5 py-2 rounded-2xl bg-[#E05236] hover:bg-[#8C3015] text-white text-xs font-extrabold shadow-xs transition cursor-pointer active:scale-95"
              >
                Explore Resources
              </button>
            </div>
          ) : (
            filtered.map(item => {
              const TypeIcon = TYPE_ICONS[item.type] || Globe;
              return (
                <div
                  key={item.id}
                  onClick={() => item.link && navigate(item.link)}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-[#E05236]/40 p-4 flex items-center gap-3.5 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#FFF7F4] border border-[#E05236]/20 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    {item.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-[#E05236] transition-colors">
                        {item.title}
                      </span>
                      {item.tag && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold flex-shrink-0 ${TAG_STYLES[item.tag] || "bg-slate-100 text-slate-600"}`}>
                          {item.tag}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 truncate">
                      {item.subtitle}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1 capitalize font-medium text-slate-600">
                        <TypeIcon className="w-3 h-3 text-[#E05236]" />
                        {item.type}
                      </span>
                      <span>•</span>
                      <span>Saved {item.savedAt}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer active:scale-95 flex-shrink-0"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Clear All Confirmation Modal ── */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-sm w-full space-y-4 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Clear all saved items?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove all {items.length} bookmarked items? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer active:scale-95"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
