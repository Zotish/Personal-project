import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { GoldenBadge } from "../components/ui/GoldenBadge";
import { 
  Search, ArrowLeft, Heart, MessageCircle, Repeat2, Share2, 
  Bookmark, CheckCircle, Users, Briefcase, Home, BookOpen, 
  MapPin, Filter, Sparkles, Send, MessageSquare, MoreHorizontal, User
} from "lucide-react";

type Topic = {
  rank: number;
  tag: string;
  category: string;
  posts: string;
  hot: boolean;
  description: string;
};

const trendingTopics: Topic[] = [
  { rank: 1, tag: "USCIS Update", category: "Immigration", posts: "12.4K", hot: true, description: "USCIS announces major policy changes for F-1 students & work permits" },
  { rank: 2, tag: "NY Immigrants", category: "Community", posts: "8.9K", hot: false, description: "Community events, food banks and meetups in New York City" },
  { rank: 3, tag: "H1B Lottery", category: "Jobs", posts: "6.2K", hot: true, description: "H-1B cap lottery selection results and next steps guidance" },
  { rank: 4, tag: "Halal Food NYC", category: "Food", posts: "4.1K", hot: false, description: "Best halal restaurants, grocery stores & Deshi meat shops in NYC" },
  { rank: 5, tag: "AsylumHelp", category: "Legal", posts: "3.8K", hot: true, description: "Community legal guidance on asylum work permit application process" },
  { rank: 6, tag: "InternationalStudent", category: "Education", posts: "3.2K", hot: false, description: "Tips, CPT/OPT guides for new international students in the USA" },
  { rank: 7, tag: "GreenCardJourney", category: "Immigration", posts: "2.9K", hot: false, description: "Share your green card application timeline & interview experiences" },
  { rank: 8, tag: "ImmigrantJobs", category: "Jobs", posts: "2.7K", hot: false, description: "Cash & authorized job opportunities for new arrivals in USA" },
  { rank: 9, tag: "BengaliCommunity", category: "Community", posts: "2.3K", hot: true, description: "Bangladeshi community news, housing sublets & cultural events" },
  { rank: 10, tag: "TexasImmigrants", category: "Community", posts: "1.9K", hot: false, description: "Resources, job boards & community support for Texas immigrants" },
];

const people = [
  { name: "Nadia Islam", handle: "@nadia_nyc", avatar: "NI", color: "from-emerald-400 to-teal-500", bio: "Immigration attorney in NYC", followers: "12.4K", verified: true },
  { name: "Carlos Rivera", handle: "@carlos_helps", avatar: "CR", color: "from-amber-400 to-orange-500", bio: "Community helper & legal advocate", followers: "8.2K", verified: false },
  { name: "Dr. Priya Menon", handle: "@dr_priya_health", avatar: "PM", color: "from-purple-400 to-indigo-500", bio: "Healthcare navigator & Medicaid aid", followers: "15.8K", verified: true },
  { name: "Ahmed Hassan", handle: "@ahmed_taxes", avatar: "AH", color: "from-blue-400 to-cyan-500", bio: "CPA & tax consultant for immigrants", followers: "6.5K", verified: true },
];

const communities = [
  { name: "Bangladeshi New Yorkers", image: "🇧🇩", members: "14.2K", category: "Community" },
  { name: "USA Job Help for Immigrants", image: "💼", members: "56.7K", category: "Jobs" },
  { name: "Immigration Legal Q&A", image: "⚖️", members: "28.3K", category: "Legal" },
  { name: "International Students USA", image: "🎓", members: "89.4K", category: "Education" },
];

type PostItem = {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  time: string;
  content: string;
  verified: boolean;
  likes: number;
  comments: number;
  reposts: number;
  isLiked?: boolean;
  image?: string;
};

// Generate realistic posts for a topic (Twitter style)
function getPostsForTopic(topic: Topic): PostItem[] {
  const tagStr = `#${topic.tag}`;
  
  if (topic.tag.toLowerCase().includes("uscis")) {
    return [
      {
        id: "p1",
        author: "Tariq Rahman, Esq.",
        handle: "@tariq_law",
        avatar: "TR",
        time: "2h ago",
        content: `🚨 IMPORTANT ${tagStr}: USCIS has officially released updated processing guidelines for premium processing on F-1 OPT & STEM extensions! Make sure your filing includes the revised Form I-765 fee notice.`,
        verified: true,
        likes: 342,
        comments: 48,
        reposts: 89,
        image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=300&fit=crop&auto=format",
      },
      {
        id: "p2",
        author: "Samira Chen",
        handle: "@samira_c",
        avatar: "SC",
        time: "4h ago",
        content: `My Work Permit EAD status just updated to "Card Was Produced" today at the Vermont Service Center! 🎉 To everyone waiting under ${tagStr}, hang in there! Total wait time was 92 days.`,
        verified: false,
        likes: 512,
        comments: 64,
        reposts: 19,
      },
      {
        id: "p3",
        author: "NYC Immigrant Rights",
        handle: "@ny_rights",
        avatar: "NY",
        time: "7h ago",
        content: `Reminder for anyone filing paperwork under ${tagStr}: Always check the edition date on the bottom of the USCIS forms before mailing. Older editions will be rejected starting this week.`,
        verified: true,
        likes: 189,
        comments: 12,
        reposts: 45,
      },
    ];
  }

  if (topic.tag.toLowerCase().includes("ny") || topic.tag.toLowerCase().includes("bengali")) {
    return [
      {
        id: "p1",
        author: "Tanvir Ahmed",
        handle: "@tanvir_nyc",
        avatar: "TA",
        time: "1h ago",
        content: `Jackson Heights Community Center is hosting a free legal clinic & ESL registration drive this Saturday (10 AM - 3 PM)! Free MetroCards & Halal food provided for all attendees. ${tagStr}`,
        verified: true,
        likes: 420,
        comments: 31,
        reposts: 95,
        image: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=600&h=300&fit=crop&auto=format",
      },
      {
        id: "p2",
        author: "Deshi Foodie NYC",
        handle: "@deshi_food_ny",
        avatar: "DF",
        time: "5h ago",
        content: `New grocery & halal meat shop just opened near 73rd St, Jackson Heights with fresh Ilish fish & authentic spices! Check out their opening discounts. ${tagStr}`,
        verified: false,
        likes: 289,
        comments: 19,
        reposts: 33,
      },
    ];
  }

  if (topic.tag.toLowerCase().includes("h1b") || topic.tag.toLowerCase().includes("job")) {
    return [
      {
        id: "p1",
        author: "Tech & Visa Advice",
        handle: "@visa_tech_us",
        avatar: "TV",
        time: "3h ago",
        content: `USCIS announced initial selection notices for ${tagStr} have been sent to employer portals! Selected applicants should begin collecting LCA & degree transcripts immediately.`,
        verified: true,
        likes: 678,
        comments: 92,
        reposts: 142,
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&auto=format",
      },
      {
        id: "p2",
        author: "Rahim Chowdhury",
        handle: "@rahim_dev",
        avatar: "RC",
        time: "6h ago",
        content: `For tech newcomers looking for hiring sponsors under ${tagStr}: top companies hiring authorized applicants include Amazon, Microsoft, and several healthcare networks in NY & TX.`,
        verified: false,
        likes: 215,
        comments: 24,
        reposts: 56,
      },
    ];
  }

  // General fallback for all other topics
  return [
    {
      id: "p1",
      author: `${topic.category} Guide USA`,
      handle: `@${topic.tag.toLowerCase()}_info`,
      avatar: topic.tag.substring(0, 2).toUpperCase(),
      time: "2h ago",
      content: `Comprehensive update on ${tagStr}: ${topic.description}. Save this post & share with community members who need reliable guidance!`,
      verified: true,
      likes: 310,
      comments: 42,
      reposts: 78,
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=300&fit=crop&auto=format",
    },
    {
      id: "p2",
      author: "Immigrant Community Member",
      handle: "@community_voice",
      avatar: "CV",
      time: "5h ago",
      content: `Anyone else following ${tagStr}? Feel free to ask questions below or share your experiences in the comments!`,
      verified: false,
      likes: 145,
      comments: 28,
      reposts: 14,
    },
  ];
}

export function Explore() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [feedTab, setFeedTab] = useState<"top" | "latest" | "people" | "media">("top");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const toggleLike = (postId: string, initialLikes: number) => {
    setLikedPosts(prev => {
      const isCurrentlyLiked = !!prev[postId];
      const newLikedState = !isCurrentlyLiked;
      
      setLikeCounts(cPrev => ({
        ...cPrev,
        [postId]: (cPrev[postId] ?? initialLikes) + (newLikedState ? 1 : -1)
      }));

      return { ...prev, [postId]: newLikedState };
    });
  };

  // Filter topics based on search query
  const filteredTopics = trendingTopics.filter(t => 
    t.tag.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase()) ||
    t.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto min-h-screen bg-white border-x border-slate-200/80">
        
        {/* ─── HASHTAG DETAIL FEED VIEW (TWITTER STYLE) ───────────────────────── */}
        {selectedTopic ? (
          <div>
            {/* Hashtag Header */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 p-3.5 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-[#C04A22]/10 hover:text-[#8C3015] transition cursor-pointer active:scale-95 flex-shrink-0"
                  title="Back to Explore"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-lg font-normal text-slate-900 truncate">#{selectedTopic.tag}</h1>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {selectedTopic.posts} posts · Trending in {selectedTopic.category}
                  </p>
                </div>
              </div>
            </div>

            {/* Hashtag Feed Tabs (Twitter style: Top / Latest / People / Media) */}
            <div className="flex border-b border-slate-200/80 bg-white">
              {(["top", "latest", "people", "media"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFeedTab(tab)}
                  className={`flex-1 py-3 text-xs font-bold capitalize transition-all border-b-2 cursor-pointer ${
                    feedTab === tab
                      ? "border-[#C04A22] text-[#8C3015]"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Posts Feed matching HomeFeed style */}
            <div className="p-3 sm:p-4 space-y-3">
              {getPostsForTopic(selectedTopic).map(post => {
                const isLiked = !!likedPosts[post.id];
                const currentLikes = likeCounts[post.id] ?? post.likes;

                return (
                  <article 
                    key={post.id} 
                    className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 transition-all hover:shadow-sm cursor-pointer"
                  >
                    {/* Author Header matching HomeFeed */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        {/* Avatar matching HomeFeed */}
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs">
                          <User className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
                          <span className="text-sm font-bold text-slate-900 truncate">{post.author}</span>
                          {post.verified && (
                            <GoldenBadge size={16} title="Verified Account" />
                          )}
                          <span className="text-xs text-slate-400">· {post.time}</span>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content matching HomeFeed */}
                    <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* Post Image Attachment */}
                    {post.image && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100">
                        <img
                          src={post.image}
                          alt="Post attachment"
                          className="w-full max-h-64 sm:max-h-72 object-cover hover:scale-[1.01] transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Action Bar matching HomeFeed */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-slate-500">
                      <button 
                        onClick={() => toggleLike(post.id, post.likes)} 
                        className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                          isLiked ? "text-red-600 font-bold" : "hover:text-red-600"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? "fill-red-600 text-red-600" : ""}`} />
                        <span>{currentLikes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-xs hover:text-[#C04A22] transition-colors cursor-pointer">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-xs hover:text-emerald-600 transition-colors cursor-pointer">
                        <Repeat2 className="w-4 h-4" />
                        <span>{post.reposts}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-xs hover:text-[#C04A22] transition-colors cursor-pointer">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="flex items-center gap-1.5 text-xs hover:text-[#C04A22] transition-colors cursor-pointer">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          /* ─── MAIN EXPLORE TOPICS LIST VIEW ──────────────────────────────── */
          <div>
            {/* Search bar */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-4 border-b border-slate-200/80 shadow-2xs">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search topics, hashtags, people..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-100/90 rounded-2xl border border-slate-200/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C04A22]/30 focus:border-[#C04A22] transition shadow-2xs"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Tabs (Trending / People / Communities) */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-5 border border-slate-200/60">
                {(["trending", "people", "communities"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      activeTab === tab 
                        ? "bg-white text-[#8C3015] shadow-2xs border border-slate-200/60" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Trending Topics List */}
              {activeTab === "trending" && (
                <div className="space-y-3">
                  {filteredTopics.map(topic => (
                    <div 
                      key={topic.tag} 
                      onClick={() => setSelectedTopic(topic)}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 hover:border-[#C04A22]/40 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-500 font-medium">#{topic.rank} · {topic.category}</span>
                          </div>
                          
                          {/* Hashtag Title with Brand Coral Hover */}
                          <div className="text-base font-bold text-slate-900 group-hover:text-[#C04A22] transition-colors truncate">
                            #{topic.tag}
                          </div>
                          
                          <div className="text-sm text-slate-600 mt-0.5 line-clamp-1">
                            {topic.description}
                          </div>
                          
                          {/* Clicking post count opens topic feed as well */}
                          <div className="text-xs font-semibold text-slate-500 group-hover:text-[#C04A22] transition-colors mt-1.5 flex items-center gap-1">
                            <span>{topic.posts} posts</span>
                            <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">→ View Feed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredTopics.length === 0 && (
                    <div className="text-center py-10 text-slate-500 text-sm">
                      No topics found matching "{query}". Try searching another keyword!
                    </div>
                  )}
                </div>
              )}

              {/* People Tab */}
              {activeTab === "people" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-[#C04A22]" />
                    <h2 className="font-normal text-slate-900 text-sm">Suggested People to Follow</h2>
                  </div>
                  {people.map(p => (
                    <div key={p.name} className="bg-white rounded-2xl border border-slate-200/90 p-4 flex gap-3 items-center">
                      {/* Normal User Profile Avatar */}
                      <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900 truncate">{p.name}</span>
                          {p.verified && (
                            <GoldenBadge size={15} title="Verified Account" />
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{p.followers} followers</div>
                      </div>
                      <button className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#C04A22]/15 text-[#8C3015] border border-[#C04A22]/30 hover:bg-[#C04A22]/25 transition cursor-pointer active:scale-95 flex-shrink-0">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Communities Tab */}
              {activeTab === "communities" && (
                <div className="space-y-3">
                  {communities.map(c => (
                    <div key={c.name} className="bg-white rounded-2xl border border-slate-200/90 p-4 flex gap-3 items-center">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">{c.image}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.members} members · {c.category}</div>
                      </div>
                      <button className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#C04A22]/15 text-[#8C3015] border border-[#C04A22]/30 hover:bg-[#C04A22]/25 transition cursor-pointer active:scale-95 flex-shrink-0">
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
