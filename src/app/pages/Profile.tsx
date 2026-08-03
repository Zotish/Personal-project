import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  MapPin, Link, Calendar, CheckCircle, Edit3, Users, Globe, MessageCircle,
  Bookmark, Building, Heart, Repeat2, Share2, MoreHorizontal, Image as ImageIcon,
  HelpCircle, Zap, UserPlus, BarChart2, X, Search, UserCheck
} from "lucide-react";

const userPosts = [
  { id: 1, content: "Has anyone applied for a New York State ID without a Social Security Number? I'm on a tourist visa and need some form of ID to open a bank account. Would love to hear your experiences! #NewYork #Banking", likes: 156, comments: 89, reposts: 34, time: "4h ago", tags: ["Banking", "ID", "New York"] },
  { id: 2, content: "🆘 NEED HELP: My family is looking for a 2BR apartment in the Bronx under $1,800/month. We have 2 adults and 1 child. Does anyone know of any landlords who accept ITIN instead of SSN?", likes: 43, comments: 127, reposts: 89, time: "6h ago", tags: ["Housing", "Rental"] },
  { id: 3, content: "Just joined the Bangladeshi New Yorkers community on ImmigrantConnect! Amazing to find so many people from home here. Special thanks to @rahim_bdconnect for welcoming me 🇧🇩❤️", likes: 234, comments: 18, reposts: 12, time: "2d ago", tags: ["Bangladeshi Community"] },
];

const followingList = [
  { id: 1,  name: "Sadia Islam",        handle: "@sadia_islam_nyc",   avatar: "SI", color: "from-pink-400 to-rose-500",     verified: true,  bio: "Social worker | Helping immigrants settle in NYC",          mutual: false, location: "Brooklyn, NY",      followers: "2.1K" },
  { id: 2,  name: "Rahim Chowdhury",    handle: "@rahim_bdconnect",   avatar: "RC", color: "from-emerald-400 to-teal-500",  verified: true,  bio: "Community organizer | Bangladeshi New Yorkers founder",     mutual: true,  location: "Jackson Heights",   followers: "8.4K" },
  { id: 3,  name: "Priya Sharma",       handle: "@priya_sharma_usa",  avatar: "PS", color: "from-violet-400 to-purple-500", verified: false, bio: "F-1 student at NYU | Sharing the international life 🌍",   mutual: true,  location: "Manhattan, NY",     followers: "943"  },
  { id: 4,  name: "Carlos Mendoza",     handle: "@carlos_mx_nyc",     avatar: "CM", color: "from-amber-400 to-orange-500",  verified: false, bio: "Chef & food blogger | Mexican immigrant in Queens",         mutual: false, location: "Corona, Queens",    followers: "5.7K" },
  { id: 5,  name: "Fatima Al-Hassan",   handle: "@fatima_legal_help", avatar: "FA", color: "from-sky-400 to-blue-500",      verified: true,  bio: "Immigration attorney | Free consultations on Thursdays",    mutual: false, location: "Bronx, NY",         followers: "12.3K"},
  { id: 6,  name: "Wei Zhang",          handle: "@wei_zhang_flushing",avatar: "WZ", color: "from-red-400 to-rose-500",      verified: false, bio: "Flushing local | Restaurant owner | Chinese-American",      mutual: true,  location: "Flushing, NY",      followers: "3.2K" },
  { id: 7,  name: "Amara Diallo",       handle: "@amara_diallo_bk",   avatar: "AD", color: "from-lime-400 to-green-500",    verified: false, bio: "West African community advocate | Helping newcomers",        mutual: false, location: "Flatbush, Brooklyn", followers: "1.8K" },
  { id: 8,  name: "ImmigrantConnect",   handle: "@immigrantconnect",  avatar: "IC", color: "from-blue-500 to-indigo-600",   verified: true,  bio: "Official ImmigrantConnect account 🌐 Connecting communities", mutual: false, location: "New York, NY",      followers: "48.9K"},
];

const followersList = [
  { id: 1,  name: "Nadia Rahman",       handle: "@nadia_rahman_bx",   avatar: "NR", color: "from-fuchsia-400 to-pink-500",  verified: false, bio: "Nurse & new mom | Bangladeshi immigrant in the Bronx",      mutual: true,  location: "The Bronx, NY",     followers: "412"  },
  { id: 2,  name: "Omar Sheikh",        handle: "@omar_sheikh_qns",   avatar: "OS", color: "from-teal-400 to-cyan-500",     verified: false, bio: "Uber driver | Pakistani immigrant | Sharing my story",      mutual: false, location: "Jamaica, Queens",   followers: "267"  },
  { id: 3,  name: "Lucia Fernandez",    handle: "@lucia_f_nyc",       avatar: "LF", color: "from-rose-400 to-red-500",      verified: true,  bio: "ESL teacher | Helping immigrants learn English 📚",         mutual: true,  location: "Astoria, Queens",   followers: "3.9K" },
  { id: 4,  name: "Tariq Hussain",      handle: "@tariq_h_brooklyn",  avatar: "TH", color: "from-indigo-400 to-blue-500",   verified: false, bio: "IT professional | H-1B visa holder | Tech & immigration",   mutual: false, location: "Flatbush, Brooklyn", followers: "1.1K" },
  { id: 5,  name: "Min-Ji Park",        handle: "@minji_park_nyc",    avatar: "MP", color: "from-orange-400 to-amber-500",  verified: false, bio: "K-beauty enthusiast | Korean-American | Queens local",      mutual: true,  location: "Flushing, NY",      followers: "6.2K" },
  { id: 6,  name: "Rahim Chowdhury",    handle: "@rahim_bdconnect",   avatar: "RC", color: "from-emerald-400 to-teal-500",  verified: true,  bio: "Community organizer | Bangladeshi New Yorkers founder",     mutual: true,  location: "Jackson Heights",   followers: "8.4K" },
  { id: 7,  name: "Aisha Musa",         handle: "@aisha_musa_harlem", avatar: "AM", color: "from-purple-400 to-violet-500", verified: false, bio: "Somali refugee turned entrepreneur | Inspiring journey",     mutual: false, location: "Harlem, NY",        followers: "2.7K" },
  { id: 8,  name: "David Chen",         handle: "@david_chen_finance",avatar: "DC", color: "from-sky-400 to-blue-500",      verified: true,  bio: "Financial advisor | Helping immigrants build credit 💳",     mutual: false, location: "Midtown, NY",       followers: "15.6K"},
  { id: 9,  name: "Priya Sharma",       handle: "@priya_sharma_usa",  avatar: "PS", color: "from-violet-400 to-purple-500", verified: false, bio: "F-1 student at NYU | Sharing the international life 🌍",   mutual: true,  location: "Manhattan, NY",     followers: "943"  },
  { id: 10, name: "José Rivera",        handle: "@jose_rivera_bronx", avatar: "JR", color: "from-amber-400 to-yellow-500",  verified: false, bio: "Construction worker | Puerto Rican pride 🇵🇷 | Bronx born", mutual: false, location: "The Bronx, NY",     followers: "334"  },
];

type UserItem = typeof followingList[0];

function PeopleModal({
  title, list, onClose,
}: { title: string; list: UserItem[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [followed, setFollowed] = useState<Set<number>>(new Set());

  const filtered = list.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.handle.toLowerCase().includes(query.toLowerCase())
  );

  function toggleFollow(id: number) {
    setFollowed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="w-8" />
          <h2 className="font-bold text-base text-foreground">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2.5 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search people…"
              className="w-full pl-9 pr-4 py-2 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-10 h-10 text-border mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No results found</p>
            </div>
          ) : filtered.map(user => {
            const isFollowed = followed.has(user.id);
            return (
              <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                    {user.avatar}
                  </div>
                  {user.verified && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center border-2 border-white">
                      <CheckCircle className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-sm font-semibold text-foreground leading-tight">{user.name}</span>
                    {user.mutual && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
                        <UserCheck className="w-2.5 h-2.5" /> Mutual
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{user.handle}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{user.bio}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />{user.location}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" />{user.followers} followers
                    </span>
                  </div>
                </div>

                {/* Follow button */}
                <button
                  onClick={() => toggleFollow(user.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isFollowed
                      ? "bg-secondary text-foreground border border-border hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                      : "bg-primary text-white hover:opacity-90 shadow-sm"
                  }`}
                >
                  {isFollowed ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const communities = [
  { name: "Bangladeshi New Yorkers", image: "🇧🇩", members: "14.2K" },
  { name: "International Students USA", image: "🎓", members: "89.4K" },
  { name: "Immigration Legal Q&A", image: "⚖️", members: "28.3K" },
];

const savedPlaces = [
  { name: "Masjid At-Taqwa", category: "🕌 Mosque", distance: "0.3 mi" },
  { name: "Queens Legal Services", category: "⚖️ Legal Aid", distance: "0.8 mi" },
  { name: "Little Bangladesh Grocery", category: "🛒 Grocery", distance: "1.1 mi" },
];

function EditProfileModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button onClick={onClose} className="text-sm text-foreground hover:text-primary">Cancel</button>
          <h2 className="font-bold text-foreground">Edit Profile</h2>
          <button className="text-sm font-semibold text-primary hover:underline" onClick={onClose}>Save</button>
        </div>
        {/* Cover photo */}
        <div className="relative h-24 bg-gradient-to-r from-blue-400 to-purple-500">
          <button className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
            <ImageIcon className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="relative -mt-10 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold border-4 border-white">RA</div>
            <button className="absolute inset-0 w-20 h-20 rounded-full flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
              <ImageIcon className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { label: "Name", value: "Rafiq Ahmed" },
              { label: "Username", value: "@rafiq_ahmed" },
              { label: "Bio", value: "New immigrant from Bangladesh 🇧🇩 | In New York City | Student | Sharing my journey", multiline: true },
              { label: "Location", value: "Queens, NY" },
            ].map(({ label, value, multiline }) => (
              <div key={label}>
                <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
                {multiline ? (
                  <textarea defaultValue={value} rows={3} className="w-full px-3 py-2 bg-input-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition resize-none" />
                ) : (
                  <input type="text" defaultValue={value} className="w-full px-3 py-2 bg-input-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);
  const [peopleModal, setPeopleModal] = useState<"following" | "followers" | null>(null);
  const [postType, setPostType] = useState<"post" | "ask" | "tip" | "help">("post");
  const [postText, setPostText] = useState("");

  const postTypes = [
    { id: "post" as const, label: "Post",      icon: Globe },
    { id: "ask"  as const, label: "Ask",       icon: HelpCircle },
    { id: "tip"  as const, label: "Tip",       icon: Zap },
    { id: "help" as const, label: "Need Help", icon: UserPlus },
  ];

  const placeholders: Record<string, string> = {
    post: "What's happening in your community?",
    ask:  "Ask a question to your community…",
    tip:  "Share a helpful tip with immigrants…",
    help: "Describe what help you need…",
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Cover photo */}
        <div className="h-36 sm:h-48 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%)" }}>
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=200&fit=crop)", backgroundSize: "cover", backgroundPosition: "center" }} />
          </div>
        </div>

        {/* Profile info */}
        <div className="px-4 pb-4 bg-white border-b border-border">
          <div className="flex items-end justify-between -mt-12 mb-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">RA</div>
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Rafiq Ahmed</h1>
              <div className="flex items-center gap-1 bg-blue-100 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                <CheckCircle className="w-3 h-3" />
                Community Member
              </div>
            </div>
            <div className="text-muted-foreground text-sm">@rafiq_ahmed</div>
          </div>

          <p className="text-sm text-foreground leading-relaxed mb-3">
            New immigrant from Bangladesh 🇧🇩 | Living in Queens, NYC | F-1 Student at Queens College | Sharing my USA journey and helping others navigate the system 🤝
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Queens, New York</div>
            <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />From Bangladesh 🇧🇩</div>
            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Student Visa (F-1)</div>
            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Joined August 2024</div>
          </div>

          <div className="flex gap-1.5 flex-wrap mb-3">
            {["Bengali", "English", "Hindi"].map(l => (
              <span key={l} className="text-xs bg-blue-50 text-primary px-2.5 py-1 rounded-full font-medium">{l}</span>
            ))}
          </div>

          <div className="flex gap-5 text-sm">
            <button onClick={() => setPeopleModal("following")} className="hover:underline">
              <span className="font-bold text-foreground">238</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </button>
            <button onClick={() => setPeopleModal("followers")} className="hover:underline">
              <span className="font-bold text-foreground">1,429</span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-white sticky top-0 z-10">
          {["posts", "replies", "communities", "saved"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-all ${
                activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {/* Post composer — only on posts tab */}
          {activeTab === "posts" && (
            <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
              {/* Type tabs */}
              <div className="flex gap-1.5 flex-wrap mb-3">
                {postTypes.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPostType(id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      postType === id
                        ? "bg-primary text-white shadow-sm"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3 h-3" /> {label}
                  </button>
                ))}
              </div>

              {/* Text area */}
              <textarea
                value={postText}
                onChange={e => setPostText(e.target.value)}
                placeholder={placeholders[postType]}
                rows={3}
                className="w-full resize-none text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
                <div className="flex items-center gap-3">
                  <button className="text-primary hover:text-primary/80 transition"><ImageIcon className="w-5 h-5" /></button>
                  <button className="text-primary hover:text-primary/80 transition"><MapPin className="w-5 h-5" /></button>
                  <button className="text-primary hover:text-primary/80 transition"><BarChart2 className="w-5 h-5" /></button>
                </div>
                <button
                  onClick={() => setPostText("")}
                  disabled={!postText.trim()}
                  className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    postText.trim()
                      ? "bg-primary text-white hover:opacity-90 shadow-sm"
                      : "bg-primary/30 text-white/70 cursor-not-allowed"
                  }`}
                >
                  Post
                </button>
              </div>
            </div>
          )}

          {/* Posts tab */}
          {activeTab === "posts" && userPosts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl border border-border p-4">
              <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {post.tags.map(t => (
                  <span key={t} className="text-xs text-primary bg-blue-50 px-2 py-0.5 rounded-full cursor-pointer">#{t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" />{post.likes}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="w-4 h-4" />{post.comments}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-600 transition-colors">
                  <Repeat2 className="w-4 h-4" />{post.reposts}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground">{post.time}</span>
              </div>
            </div>
          ))}

          {/* Communities tab */}
          {activeTab === "communities" && communities.map(c => (
            <div key={c.name} className="bg-white rounded-2xl border border-border p-4 flex gap-3 items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">{c.image}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.members} members</div>
              </div>
              <button className="px-3 py-1.5 rounded-full text-xs font-semibold border border-primary text-primary hover:bg-blue-50 transition">Joined</button>
            </div>
          ))}

          {/* Saved tab */}
          {activeTab === "saved" && savedPlaces.map(p => (
            <div key={p.name} className="bg-white rounded-2xl border border-border p-4 flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">{p.category.split(" ")[0]}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.category} · {p.distance}</div>
              </div>
              <Bookmark className="w-4 h-4 text-primary fill-primary" />
            </div>
          ))}

          {activeTab === "replies" && (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No replies yet</p>
            </div>
          )}
        </div>
      </div>

      {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}

      {peopleModal === "following" && (
        <PeopleModal title="Following" list={followingList} onClose={() => setPeopleModal(null)} />
      )}
      {peopleModal === "followers" && (
        <PeopleModal title="Followers" list={followersList} onClose={() => setPeopleModal(null)} />
      )}
    </AppLayout>
  );
}
