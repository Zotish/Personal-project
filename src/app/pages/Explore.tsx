import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { Search, TrendingUp, Flame, Users, MapPin, BookOpen, Briefcase, Home, CheckCircle, Filter } from "lucide-react";

const trendingTopics = [
  { rank: 1, tag: "USCIS Update", category: "Immigration", posts: "12.4K", hot: true, description: "USCIS announces major policy changes for F-1 students" },
  { rank: 2, tag: "NY Immigrants", category: "Community", posts: "8.9K", hot: false, description: "Community events and meetups in New York City" },
  { rank: 3, tag: "H1B Lottery", category: "Jobs", posts: "6.2K", hot: true, description: "H-1B cap lottery results and what to do next" },
  { rank: 4, tag: "Halal Food NYC", category: "Food", posts: "4.1K", hot: false, description: "Best halal restaurants and grocery stores in NYC" },
  { rank: 5, tag: "AsylumHelp", category: "Legal", posts: "3.8K", hot: true, description: "Community guidance on asylum application process" },
  { rank: 6, tag: "InternationalStudent", category: "Education", posts: "3.2K", hot: false, description: "Tips for new international students in the USA" },
  { rank: 7, tag: "GreenCardJourney", category: "Immigration", posts: "2.9K", hot: false, description: "Share your green card application experiences" },
  { rank: 8, tag: "ImmigrantJobs", category: "Jobs", posts: "2.7K", hot: false, description: "Job opportunities and career advice for immigrants" },
  { rank: 9, tag: "BengaliCommunity", category: "Community", posts: "2.3K", hot: true, description: "Bangladeshi community news and events" },
  { rank: 10, tag: "TexasImmigrants", category: "Community", posts: "1.9K", hot: false, description: "Resources and community for Texas immigrants" },
];

const categories = [
  { label: "All", icon: Search },
  { label: "Immigration", icon: CheckCircle },
  { label: "Jobs", icon: Briefcase },
  { label: "Housing", icon: Home },
  { label: "Education", icon: BookOpen },
  { label: "Community", icon: Users },
  { label: "Local", icon: MapPin },
];

const people = [
  { name: "Nadia Islam", handle: "@nadia_nyc", avatar: "NI", color: "from-emerald-400 to-teal-500", bio: "Immigration attorney", followers: "12.4K", verified: true },
  { name: "Carlos Rivera", handle: "@carlos_helps", avatar: "CR", color: "from-orange-400 to-rose-400", bio: "Community helper", followers: "8.2K", verified: false },
  { name: "Dr. Priya Menon", handle: "@dr_priya_health", avatar: "PM", color: "from-purple-400 to-indigo-500", bio: "Healthcare navigator", followers: "15.8K", verified: true },
  { name: "Ahmed Hassan", handle: "@ahmed_taxes", avatar: "AH", color: "from-blue-400 to-cyan-400", bio: "CPA for immigrants", followers: "6.5K", verified: true },
];

const communities = [
  { name: "Bangladeshi New Yorkers", image: "🇧🇩", members: "14.2K", category: "Community" },
  { name: "USA Job Help for Immigrants", image: "💼", members: "56.7K", category: "Jobs" },
  { name: "Immigration Legal Q&A", image: "⚖️", members: "28.3K", category: "Legal" },
  { name: "International Students USA", image: "🎓", members: "89.4K", category: "Education" },
];

export function Explore() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("trending");

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Search bar */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search topics, people, communities..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition shadow-sm"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-secondary text-muted-foreground">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-5">
            {["trending", "people", "communities"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Trending Topics */}
          {activeTab === "trending" && (
            <div className="space-y-3">
              {trendingTopics.map(topic => (
                <div key={topic.tag} className="bg-white rounded-2xl border border-border p-4 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-medium">#{topic.rank} · {topic.category}</span>
                      </div>
                      <div className="text-base font-bold text-foreground group-hover:text-primary transition-colors">#{topic.tag}</div>
                      <div className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{topic.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">{topic.posts} posts</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)" }}>
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* People */}
          {activeTab === "people" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-foreground">Suggested People to Follow</h2>
              </div>
              {people.map(p => (
                <div key={p.name} className="bg-white rounded-2xl border border-border p-4 flex gap-3 items-center">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {p.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">{p.name}</span>
                      {p.verified && (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.handle} · {p.followers} followers</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.bio}</div>
                  </div>
                  <button className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:opacity-90 transition flex-shrink-0">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Communities */}
          {activeTab === "communities" && (
            <div className="space-y-3">
              {communities.map(c => (
                <div key={c.name} className="bg-white rounded-2xl border border-border p-4 flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">{c.image}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.members} members · {c.category}</div>
                  </div>
                  <button className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:opacity-90 transition flex-shrink-0">
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
