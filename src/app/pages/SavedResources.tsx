import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Bookmark, MapPin, FileText, Users, Link, Trash2, Search,
  Globe, Scale, Briefcase, Home, GraduationCap, Heart, ChevronRight
} from "lucide-react";

type SavedItem = {
  id: number;
  type: "place" | "post" | "resource" | "community" | "service";
  title: string;
  subtitle: string;
  emoji: string;
  savedAt: string;
  tag?: string;
};

const savedItems: SavedItem[] = [
  { id: 1, type: "place", title: "Queens Legal Services", subtitle: "⚖️ Legal Aid · 0.8 mi · Jamaica, Queens", emoji: "⚖️", savedAt: "2h ago", tag: "Legal" },
  { id: 2, type: "post", title: "H-1B Cap-Exempt Employers: Full Guide", subtitle: "Nadia Islam · @nadia_nyc · 1.2K likes", emoji: "📌", savedAt: "5h ago", tag: "Immigration" },
  { id: 3, type: "resource", title: "USCIS Form I-765 (EAD Application)", subtitle: "Official USCIS document · Updated 2024", emoji: "📄", savedAt: "1d ago", tag: "Forms" },
  { id: 4, type: "place", title: "Masjid At-Taqwa", subtitle: "🕌 Mosque · 0.3 mi · Brooklyn", emoji: "🕌", savedAt: "2d ago", tag: "Religious" },
  { id: 5, type: "community", title: "Bangladeshi New Yorkers", subtitle: "14.2K members · Community", emoji: "🇧🇩", savedAt: "3d ago", tag: "Community" },
  { id: 6, type: "resource", title: "2025 Visa Bulletin — Priority Dates", subtitle: "US Department of State · Monthly update", emoji: "📅", savedAt: "4d ago", tag: "Immigration" },
  { id: 7, type: "service", title: "NYC Free Legal Aid Directory", subtitle: "Community resource · Verified", emoji: "📋", savedAt: "5d ago", tag: "Legal" },
  { id: 8, type: "post", title: "How I got my NY Driver's License as H-1B", subtitle: "Rahim Chowdhury · 892 likes", emoji: "🚗", savedAt: "1w ago", tag: "Driving" },
  { id: 9, type: "place", title: "Little Bangladesh Grocery", subtitle: "🛒 Grocery · 1.1 mi · Jackson Heights", emoji: "🛒", savedAt: "1w ago", tag: "Food" },
  { id: 10, type: "resource", title: "NYC Immigrant Benefits Guide 2025", subtitle: "NYC Government · Official resource", emoji: "🏛️", savedAt: "2w ago", tag: "Government" },
];

const filterTabs = ["All", "Places", "Posts", "Resources", "Communities", "Services"];

const tagColors: Record<string, string> = {
  Legal: "bg-cyan-50 text-cyan-700",
  Immigration: "bg-blue-50 text-blue-700",
  Forms: "bg-purple-50 text-purple-700",
  Religious: "bg-orange-50 text-orange-700",
  Community: "bg-emerald-50 text-emerald-700",
  Driving: "bg-slate-50 text-slate-700",
  Food: "bg-amber-50 text-amber-700",
  Government: "bg-indigo-50 text-indigo-700",
};

const typeIcons: Record<string, React.FC<{ className?: string }>> = {
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
  const [items, setItems] = useState(savedItems);

  const filtered = items.filter(item => {
    const matchesTab = activeTab === "All" || item.type === activeTab.toLowerCase().slice(0, -1);
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const remove = (id: number) => setItems(s => s.filter(i => i.id !== id));

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark className="w-5 h-5 text-primary fill-primary" />
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Saved Resources</h1>
            <span className="ml-auto text-sm text-muted-foreground">{items.length} saved</span>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search saved items..."
              className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {filterTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                  activeTab === tab ? "bg-primary text-white shadow-sm" : "bg-white border border-border text-muted-foreground hover:text-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Collections shortcuts */}
          <div className="grid grid-cols-2 gap-3 mb-1">
            {[
              { label: "Legal Resources", icon: Scale, color: "from-cyan-400 to-blue-500", count: 3 },
              { label: "Immigration Forms", icon: FileText, color: "from-purple-400 to-indigo-500", count: 4 },
              { label: "Jobs & Career", icon: Briefcase, color: "from-blue-400 to-primary", count: 2 },
              { label: "Housing Help", icon: Home, color: "from-emerald-400 to-teal-500", count: 2 },
            ].map(({ label, icon: Icon, color, count }) => (
              <button key={label} className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-border hover:shadow-sm transition-all text-left group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{label}</div>
                  <div className="text-xs text-muted-foreground">{count} items</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between py-1">
            <h2 className="text-sm font-semibold text-foreground">
              {activeTab === "All" ? "All Saved" : activeTab} ({filtered.length})
            </h2>
            <button className="text-xs text-muted-foreground hover:text-red-500 transition-colors">Clear all</button>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-foreground font-medium">No saved items found</p>
              <p className="text-sm text-muted-foreground mt-1">Items you save will appear here</p>
            </div>
          ) : (
            filtered.map(item => {
              const TypeIcon = typeIcons[item.type] || Globe;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{item.title}</span>
                      {item.tag && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${tagColors[item.tag] || "bg-secondary text-muted-foreground"}`}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <TypeIcon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground capitalize">{item.type} · Saved {item.savedAt}</span>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); remove(item.id); }}
                    className="p-2 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
