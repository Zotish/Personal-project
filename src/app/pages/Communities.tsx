import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Users, Search, CheckCircle, MapPin, MessageCircle, ArrowLeft, Pin,
  Bell, Settings, Plus, Globe, X, Lock, ChevronRight, Hash,
  Image, AlertCircle, Smile, Languages, Shield, Eye, EyeOff,
  Heart, Repeat2, Share2, Bookmark, Calendar, Clock, MoreHorizontal,
  Crown, BadgeCheck, Sparkles
} from "lucide-react";
import { EventRegistrationModal } from "../components/events/EventRegistrationModal";

const allCommunities = [
  { id: 1, name: "Bangladeshi New Yorkers", image: "🇧🇩", members: 14200, tags: ["Community", "Culture", "Bengali"], desc: "The largest Bangladeshi community network in New York. Events, help, and connections for Bangladeshis in NYC and surrounding areas.", joined: true, city: "New York, NY", moderators: 8 },
  { id: 2, name: "International Students USA", image: "🎓", members: 89400, tags: ["Student Life", "Education", "F-1"], desc: "Support network for international students across all US universities. OPT, CPT, internships, and campus life advice.", joined: true, city: "National", moderators: 24 },
  { id: 3, name: "New Immigrants in Texas", image: "⭐", members: 32100, tags: ["Texas", "Settlement", "Local"], desc: "Resources, meetups, and mutual support for immigrants settling in Texas. Dallas, Houston, Austin, and more.", joined: false, city: "Texas", moderators: 12 },
  { id: 4, name: "USA Job Help for Immigrants", image: "💼", members: 56700, tags: ["Jobs", "Career", "H-1B"], desc: "Job postings, resume help, interview tips, and networking for immigrants. All visa types welcome.", joined: false, city: "National", moderators: 16 },
  { id: 5, name: "Immigration Legal Q&A", image: "⚖️", members: 28300, tags: ["Legal Help", "Immigration", "Asylum"], desc: "Ask immigration attorneys and experienced community members your legal questions. Verified lawyers active daily.", joined: true, city: "National", moderators: 9 },
  { id: 6, name: "Muslim Community USA", image: "☪️", members: 41500, tags: ["Religious", "Muslim", "Halal"], desc: "Islamic centers, halal food, prayer times, and community events across the US. Connecting Muslims nationwide.", joined: false, city: "National", moderators: 18 },
  { id: 7, name: "Local Food & Grocery Help", image: "🛒", members: 19800, tags: ["Food", "Local", "Grocery"], desc: "Find ethnic grocery stores, restaurants, and food-related recommendations near you. Your local food community.", joined: false, city: "National", moderators: 6 },
  { id: 8, name: "New York City Immigrants", image: "🗽", members: 76200, tags: ["New York", "NYC", "Local"], desc: "For all immigrants living in New York City. Housing, jobs, events, and community support in the 5 boroughs.", joined: false, city: "New York, NY", moderators: 20 },
  { id: 9, name: "Indian Community USA", image: "🇮🇳", members: 52300, tags: ["Indian", "Desi", "Community"], desc: "Connecting Indians across the USA. Culture, festivals, business networking, and settlement support.", joined: false, city: "National", moderators: 15 },
  { id: 10, name: "Latino Immigrant Network", image: "🌮", members: 48900, tags: ["Latino", "Spanish", "Community"], desc: "Red de apoyo para inmigrantes latinos en USA. Recursos, trabajo, vivienda y comunidad.", joined: false, city: "National", moderators: 14 },
];

// ─── Community-level data ─────────────────────────────────────────────────────

const communityPostsData = [
  { id: 1, pinned: true, type: "announcement", author: { name: "Rahim Chowdhury", handle: "@rahim_bd", avatar: "RC", color: "from-green-400 to-emerald-500", mod: true }, time: "2h ago", content: "📢 Monthly community meetup this Saturday! We'll be at Flushing Meadows Park at 2 PM. Bringing food and family. All Bangladeshis welcome! Reply below if you're coming 🙋", likes: 89, comments: 34, reposts: 22 },
  { id: 2, pinned: false, type: "question", author: { name: "Fatima Begum", handle: "@fatima_b", avatar: "FB", color: "from-pink-400 to-rose-500", mod: false }, time: "5h ago", content: "Does anyone know a good Bangladeshi grocery store in the Bronx? The one on Fordham Road closed last month and I'm struggling to find hilsa fish 🐟", likes: 23, comments: 67, reposts: 5 },
  { id: 3, pinned: false, type: "tip", author: { name: "Mohammed Ali", handle: "@mo_ali", avatar: "MA", color: "from-blue-400 to-cyan-500", mod: false }, time: "1d ago", content: "Good news friends! I finally got my driver's license after 3 attempts. The DMV in Jamaica has Bengali staff on Wednesdays — that made all the difference! Don't give up 💪🇧🇩", likes: 156, comments: 12, reposts: 78 },
  { id: 4, pinned: false, type: "regular", author: { name: "Nusrat Jahan", handle: "@nusrat_j", avatar: "NJ", color: "from-violet-400 to-purple-500", mod: false }, time: "2d ago", content: "Sharing free legal clinic info — Immigration attorney will be at Jackson Heights library this Thursday 4–7 PM. First-come first-served, no appointment needed. Spread the word! ⚖️", likes: 312, comments: 45, reposts: 189 },
];

const communityEventsData = [
  { id: 1, emoji: "🌳", title: "Monthly Community Picnic", date: "Sat, Jul 19 · 2:00 PM", location: "Flushing Meadows Park, Queens", organizer: "Rahim Chowdhury", attendees: 89, color: "bg-emerald-50 border-emerald-200", tags: ["Outdoor", "Family", "Free"] },
  { id: 2, emoji: "⚖️", title: "Free Immigration Legal Clinic", date: "Thu, Jul 24 · 4:00 PM", location: "Jackson Heights Library, NY", organizer: "Community Mods", attendees: 134, color: "bg-cyan-50 border-cyan-200", tags: ["Legal", "Free", "Walk-in"] },
  { id: 3, emoji: "🎓", title: "ESL English Practice Session", date: "Mon, Jul 28 · 6:00 PM", location: "Online (Zoom)", organizer: "Fatima Begum", attendees: 56, color: "bg-blue-50 border-blue-200", tags: ["English", "Education", "Free"] },
  { id: 4, emoji: "🍛", title: "Bangladeshi Food & Culture Fair", date: "Sun, Aug 3 · 12:00 PM", location: "Corona Park, Queens", organizer: "Nusrat Jahan", attendees: 420, color: "bg-amber-50 border-amber-200", tags: ["Food", "Culture", "Festival"] },
  { id: 5, emoji: "📋", title: "Document Help Workshop", date: "Wed, Aug 6 · 5:00 PM", location: "Community Center, Astoria", organizer: "Community Mods", attendees: 67, color: "bg-purple-50 border-purple-200", tags: ["Documents", "Workshop", "Free"] },
];

const communityMembersData = [
  { id: 1, name: "Rahim Chowdhury", handle: "@rahim_bd", avatar: "RC", color: "from-green-400 to-emerald-500", role: "admin", bio: "Community founder · Jackson Heights", joined: "2021" },
  { id: 2, name: "Fatima Begum", handle: "@fatima_b", avatar: "FB", color: "from-pink-400 to-rose-500", role: "moderator", bio: "Social worker · The Bronx", joined: "2022" },
  { id: 3, name: "Mohammed Ali", handle: "@mo_ali", avatar: "MA", color: "from-blue-400 to-cyan-500", role: "moderator", bio: "IT professional · Queens", joined: "2022" },
  { id: 4, name: "Nusrat Jahan", handle: "@nusrat_j", avatar: "NJ", color: "from-violet-400 to-purple-500", role: "member", bio: "Student at CUNY · Brooklyn", joined: "2023" },
  { id: 5, name: "Karim Hossain", handle: "@karim_h", avatar: "KH", color: "from-teal-400 to-cyan-500", role: "member", bio: "Restaurant owner · Flushing", joined: "2023" },
  { id: 6, name: "Roksana Akter", handle: "@roksana_a", avatar: "RA", color: "from-rose-400 to-pink-500", role: "member", bio: "Healthcare worker · Manhattan", joined: "2023" },
  { id: 7, name: "Jahangir Alam", handle: "@jahangir_a", avatar: "JA", color: "from-amber-400 to-orange-500", role: "member", bio: "Uber driver · Staten Island", joined: "2024" },
  { id: 8, name: "Sharmin Sultana", handle: "@sharmin_s", avatar: "SS", color: "from-indigo-400 to-blue-500", role: "member", bio: "Nursing student · The Bronx", joined: "2024" },
];

// ─── CommunityDetail ──────────────────────────────────────────────────────────

function CommunityDetail({ community, onBack }: { community: typeof allCommunities[0]; onBack: () => void }) {
  const [joined, setJoined] = useState(community.joined);
  const [activeTab, setActiveTab] = useState("posts");
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);
  const [interestedEvents, setInterestedEvents] = useState<number[]>([]);
  const [registeringCommunityEvent, setRegisteringCommunityEvent] = useState<any>(null);
  const [followedMembers, setFollowedMembers] = useState<number[]>([]);
  const [memberFilter, setMemberFilter] = useState<"all" | "mods">("all");

  const grad = communityGradients[community.id] ?? "from-blue-400 to-indigo-500";

  const typeLabel: Record<string, ReactNode> = {
    announcement: <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 mb-1.5 uppercase tracking-wide">📢 Announcement</div>,
    question: <div className="flex items-center gap-1 text-[10px] font-semibold text-primary mb-1.5 uppercase tracking-wide">🙋 Question</div>,
    tip: <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mb-1.5 uppercase tracking-wide">💡 Tip</div>,
    regular: null,
  };
  const typeBg: Record<string, string> = {
    announcement: "bg-indigo-50 border-indigo-100",
    question: "bg-blue-50 border-blue-100",
    tip: "bg-emerald-50 border-emerald-100",
    regular: "bg-white border-border",
  };

  const visibleMembers = memberFilter === "mods"
    ? communityMembersData.filter(m => m.role !== "member")
    : communityMembersData;

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Cover ── */}
      <div className={`relative h-36 bg-gradient-to-br ${grad} overflow-hidden`}>
        {/* Subtle geometric overlay for depth */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
        <button
          onClick={onBack}
          className="absolute top-3 left-3 w-9 h-9 bg-black/25 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/45 transition"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* ── Info section ── */}
      <div className="bg-white border-b border-border px-4 pb-4">
        {/* Avatar + action buttons row */}
        <div className="flex items-start justify-between">
          {/* Avatar — overlaps cover with negative margin */}
          <div className={`mt-2 w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} border-3 border-white shadow-md flex items-center justify-center text-2xl flex-shrink-0`}>
            {community.image}
          </div>
          {/* Action buttons — sit below cover, no overlap */}
          <div className="flex items-center gap-2 pt-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-white hover:bg-secondary transition-colors shadow-sm">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-white hover:bg-secondary transition-colors shadow-sm">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setJoined(!joined)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${joined
                  ? "border border-primary text-primary bg-white hover:bg-red-50 hover:text-red-500 hover:border-red-300"
                  : "bg-primary text-white hover:opacity-90"
                }`}
            >
              {joined ? "✓ Joined" : "Join"}
            </button>
          </div>
        </div>
        <div className="mt-3">
          <h2 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            {community.name}
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(community.members / 1000).toFixed(1)}K members</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{community.city}</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-primary" />{community.moderators} mods</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{community.desc}</p>
          <div className="flex gap-1.5 flex-wrap">
            {community.tags.map(t => (
              <span key={t} className="text-xs bg-blue-50 text-primary px-2.5 py-1 rounded-full font-medium">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="sticky top-0 z-20 flex border-b border-border bg-white">
        {(["posts", "events", "members"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-all ${activeTab === tab
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
          >
            {tab === "posts" ? `Posts` :
              tab === "events" ? `Events (${communityEventsData.length})` :
                `Members (${communityMembersData.length})`}
          </button>
        ))}
      </div>

      {/* ── POSTS tab ── */}
      {activeTab === "posts" && (
        <div className="p-4 space-y-3">
          {/* Composer */}
          <div className="bg-white rounded-2xl border border-border p-3 flex gap-2.5 items-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">RA</div>
            <button className="flex-1 text-left px-3 py-2.5 bg-secondary rounded-xl text-sm text-muted-foreground hover:bg-border/60 transition-colors">
              Share something with the community...
            </button>
            <button className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition">Post</button>
          </div>

          {communityPostsData.map(post => (
            <div key={post.id} className={`rounded-2xl border p-4 ${typeBg[post.type]}`}>
              {post.pinned && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">
                  <Pin className="w-3 h-3" /> Pinned post
                </div>
              )}
              {typeLabel[post.type]}
              <div className="flex gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${post.author.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {post.author.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{post.author.name}</span>
                      {post.author.mod && (
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">MOD</span>
                      )}
                      <span className="text-xs text-muted-foreground">{post.author.handle} · {post.time}</span>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-white/60 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
                  <div className="flex items-center gap-4 mt-3 pt-2 border-t border-white/40">
                    <button
                      onClick={() => setLikedPosts(s => s.includes(post.id) ? s.filter(x => x !== post.id) : [...s, post.id])}
                      className={`flex items-center gap-1 text-xs transition-colors ${likedPosts.includes(post.id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${likedPosts.includes(post.id) ? "fill-red-500" : ""}`} />
                      {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                    </button>
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" />{post.comments}
                    </button>
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-600 transition-colors">
                      <Repeat2 className="w-3.5 h-3.5" />{post.reposts}
                    </button>
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSavedPosts(s => s.includes(post.id) ? s.filter(x => x !== post.id) : [...s, post.id])}
                      className={`flex items-center gap-1 text-xs transition-colors ${savedPosts.includes(post.id) ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${savedPosts.includes(post.id) ? "fill-primary" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EVENTS tab ── */}
      {activeTab === "events" && (
        <div className="px-1 sm:px-3 py-4 space-y-3 w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C04A22]" /> Upcoming Events
            </p>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-98">
              <Plus className="w-3.5 h-3.5" /> Add Event
            </button>
          </div>

          {communityEventsData.map(ev => (
            <div key={ev.id} className="rounded-2xl border border-slate-200/90 hover:border-orange-200/90 bg-white p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm sm:text-base font-bold text-foreground group-hover:text-[#8C3015] transition-colors leading-snug">{ev.title}</span>
              </div>
              <div className="space-y-1.5 my-3">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-[#C04A22] flex-shrink-0" />
                  <span className="font-medium text-slate-800">{ev.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-[#C04A22] flex-shrink-0" />
                  <span>{ev.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Users className="w-3.5 h-3.5 text-[#C04A22] flex-shrink-0" />
                  <span><strong className="text-[#8C3015] font-semibold">{ev.attendees}</strong> going · by {ev.organizer}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (interestedEvents.includes(ev.id)) {
                      setInterestedEvents(s => s.filter(x => x !== ev.id));
                    } else {
                      setRegisteringCommunityEvent(ev);
                    }
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-bold transition shadow-2xs active:scale-98 cursor-pointer ${
                    interestedEvents.includes(ev.id)
                      ? "bg-emerald-600 text-white"
                      : "bg-[#C04A22] hover:bg-[#8C3015] text-white"
                  }`}
                >
                  {interestedEvents.includes(ev.id) ? "Registered ✓" : "Interested"}
                </button>
                <button className="w-10 h-9 rounded-2xl bg-[#C04A22]/10 hover:bg-[#C04A22]/20 border border-[#C04A22]/25 text-[#8C3015] flex items-center justify-center transition cursor-pointer flex-shrink-0" title="Share Event">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {registeringCommunityEvent && (
            <EventRegistrationModal
              isOpen={!!registeringCommunityEvent}
              onClose={() => setRegisteringCommunityEvent(null)}
              event={{
                id: registeringCommunityEvent.id,
                title: registeringCommunityEvent.title,
                time: registeringCommunityEvent.date,
                location: registeringCommunityEvent.location,
                organizer: registeringCommunityEvent.organizer,
              }}
              onSuccess={() => {
                setInterestedEvents(s => [...s, registeringCommunityEvent.id]);
              }}
            />
          )}
        </div>
      )}

      {/* ── MEMBERS tab ── */}
      {activeTab === "members" && (
        <div className="p-4 space-y-3">
          {/* Filter */}
          <div className="flex gap-2">
            {(["all", "mods"] as const).map(f => (
              <button
                key={f}
                onClick={() => setMemberFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${memberFilter === f
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-border text-muted-foreground hover:text-primary hover:border-primary"
                  }`}
              >
                {f === "all" ? `All Members (${communityMembersData.length})` : `Mods & Admins (${communityMembersData.filter(m => m.role !== "member").length})`}
              </button>
            ))}
          </div>

          {visibleMembers.map(member => (
            <div key={member.id} className="bg-white rounded-2xl border border-border p-3 flex items-center gap-3">
              {/* Avatar */}
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {member.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{member.name}</span>
                  {member.role === "admin" && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                      <Crown className="w-2.5 h-2.5" /> Admin
                    </span>
                  )}
                  {member.role === "moderator" && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      <BadgeCheck className="w-2.5 h-2.5" /> Mod
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">{member.bio}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{member.handle} · Joined {member.joined}</div>
              </div>

              {/* Follow button */}
              <button
                onClick={() => setFollowedMembers(s => s.includes(member.id) ? s.filter(x => x !== member.id) : [...s, member.id])}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all border ${followedMembers.includes(member.id)
                    ? "border-primary text-primary bg-blue-50"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
              >
                {followedMembers.includes(member.id) ? "Following" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Gradient colours per community ──────────────────────────────────────────
const communityGradients: Record<number, string> = {
  1: "from-green-400 to-emerald-600",
  2: "from-violet-400 to-indigo-500",
  3: "from-amber-400 to-orange-500",
  4: "from-blue-400 to-cyan-500",
  5: "from-cyan-400 to-teal-500",
  6: "from-emerald-400 to-green-600",
  7: "from-orange-400 to-red-400",
  8: "from-blue-500 to-indigo-600",
  9: "from-orange-500 to-rose-500",
  10: "from-red-400 to-pink-500",
};

// ─── Joined community card ────────────────────────────────────────────────────
function JoinedCard({
  community,
  onOpen,
  onLeave,
}: {
  community: typeof allCommunities[0];
  onOpen: () => void;
  onLeave: () => void;
  key?: string | number;
}) {
  const grad = communityGradients[community.id] ?? "from-[#C04A22] to-amber-500";
  const lastActive = ["2m ago", "15m ago", "1h ago", "3h ago", "Today"][community.id % 5];

  return (
    <div
      className="bg-white rounded-2xl border border-border hover:shadow-md transition-all cursor-pointer group overflow-hidden p-4"
      onClick={onOpen}
    >
      <div className="flex gap-3">
            {/* Icon box */}
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
              {community.image}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground group-hover:text-[#C04A22] transition-colors leading-snug">
                    {community.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {(community.members / 1000).toFixed(1)}K members
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      Active {lastActive}
                    </span>
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onLeave(); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex-shrink-0 cursor-pointer"
                >
                  ✓ Joined
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed max-w-[70%]">
                {community.desc}
              </p>
            </div>
      </div>
    </div>
  );
}

// ─── Discover community card ──────────────────────────────────────────────────
function DiscoverCard({
  community,
  onOpen,
  onJoin,
  reason,
}: {
  community: typeof allCommunities[0];
  onOpen: () => void;
  onJoin: () => void;
  reason: string;
  key?: string | number;
}) {
  return (
    <div
      className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-sm transition-all cursor-pointer group"
      onClick={onOpen}
    >
      <div className="p-4 flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
          {community.image}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground group-hover:text-[#C04A22] transition-colors truncate">
                {community.name}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{(community.members / 1000).toFixed(1)}K members</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{community.city}</span>
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onJoin(); }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#C04A22]/15 text-[#8C3015] border border-[#C04A22]/30 hover:bg-[#C04A22]/25 transition-all flex-shrink-0 cursor-pointer active:scale-95"
            >
              + Join
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed max-w-[70%]">{community.desc}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Create Community Modal ───────────────────────────────────────────────────

const EMOJI_OPTIONS = ["🌍", "🇧🇩", "🇮🇳", "🇵🇰", "🇲🇽", "🇧🇷", "🇨🇳", "🇵🇭", "🇻🇳", "🇰🇷", "🇳🇬", "🇪🇹", "🇸🇦", "🇹🇷", "🇷🇺", "🏘️", "💼", "⚖️", "🎓", "🏥", "🕌", "⛪", "🛕", "🌮", "🍛", "🏠", "🚀", "🤝", "📚", "🌟"];

const CATEGORY_OPTIONS = ["Immigration", "Legal Help", "Jobs & Career", "Housing", "Education", "Healthcare", "Food & Culture", "Religious", "Community", "Tech & IT", "Business", "Language", "Family", "Youth", "Women", "Seniors", "LGBTQ+", "Sports", "Arts"];

const LANGUAGE_OPTIONS = ["English", "Bengali", "Spanish", "Hindi", "Arabic", "Mandarin", "Urdu", "Portuguese", "Tagalog", "Vietnamese", "Korean", "French", "Haitian Creole", "Russian", "Somali", "Amharic", "Pashto", "Punjabi"];

type Step = 1 | 2 | 3;

function CreateCommunityModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (name: string, emoji: string) => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [emoji, setEmoji] = useState("🌍");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [location, setLocation] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
  const [rules, setRules] = useState(["Be respectful to all members", "No spam or self-promotion", "Stay on topic"]);
  const [newRule, setNewRule] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [showPublicPreview, setShowPublicPreview] = useState(false);

  const toggleCategory = (c: string) =>
    setSelectedCategories(s => s.includes(c) ? s.filter(x => x !== c) : s.length < 3 ? [...s, c] : s);

  const toggleLanguage = (l: string) =>
    setSelectedLanguages(s => s.includes(l) ? s.filter(x => x !== l) : [...s, l]);

  const addRule = () => {
    if (newRule.trim()) { setRules(s => [...s, newRule.trim()]); setNewRule(""); }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); }, 1400);
  };

  const canNext1 = name.trim().length >= 3 && desc.trim().length >= 10;
  const canNext2 = selectedCategories.length >= 1 && selectedLanguages.length >= 1;

  const steps = [
    { n: 1, label: "Basics" },
    { n: 2, label: "Details" },
    { n: 3, label: "Rules" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pb-16 sm:pb-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full sm:max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Create Community
            </h2>
            <p className="text-xs text-muted-foreground">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-700 transition cursor-pointer active:scale-95">
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-slate-100 flex-shrink-0">
          <div
            className="h-full bg-[#C04A22] transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Success screen */}
        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-4xl shadow-md mb-5">
              {emoji}
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-4 -mt-4 ml-12">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{name} is live! 🎉</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Your community has been created. Share it with your network to start growing your member base.
            </p>
            <button
              onClick={() => { onCreate(name, emoji); onClose(); }}
              className="w-full py-3 rounded-2xl bg-[#C04A22] text-white font-semibold hover:bg-[#8C3015] transition cursor-pointer"
            >
              Go to My Community
            </button>
          </div>
        ) : (

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

            {/* ── STEP 1: Basics ── */}
            {step === 1 && (
              <>
                {/* Emoji picker */}
                <div className="flex flex-col items-center gap-2 pb-2">
                  <button
                    onClick={() => setShowEmojiPicker(s => !s)}
                    className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-4xl shadow-md hover:scale-105 transition-transform relative"
                  >
                    {emoji}
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center text-xs shadow-xs">✏️</span>
                  </button>
                  <p className="text-xs text-muted-foreground">Tap to choose icon</p>
                  {showEmojiPicker && (
                    <div className="grid grid-cols-10 gap-1.5 p-3 bg-secondary rounded-2xl w-full">
                      {EMOJI_OPTIONS.map(e => (
                        <button
                          key={e}
                          onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg hover:bg-white transition-colors ${emoji === e ? "bg-white shadow-xs ring-2 ring-[#C04A22]" : ""}`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Community Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={50}
                    placeholder="e.g. Bangladeshi New Yorkers"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-secondary text-sm focus:outline-none focus:border-[#C04A22]/50 focus:shadow-[0_0_10px_rgba(192,74,34,0.2)] focus:bg-white transition-all"
                  />
                  <div className="flex justify-between mt-1">
                    {name.length > 0 && name.length < 3 && <p className="text-xs text-red-500">At least 3 characters required</p>}
                    <span className="text-xs text-muted-foreground ml-auto">{name.length}/50</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Description <span className="text-red-500">*</span></label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    maxLength={300}
                    rows={3}
                    placeholder="What is this community about? Who should join?"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-secondary text-sm resize-none focus:outline-none focus:border-[#C04A22]/50 focus:shadow-[0_0_10px_rgba(192,74,34,0.2)] focus:bg-white transition-all"
                  />
                  <span className="text-xs text-muted-foreground float-right">{desc.length}/300</span>
                </div>

                {/* Privacy */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Privacy</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { val: "public", icon: Globe, label: "Public", sub: "Anyone can find & join" },
                      { val: "private", icon: Lock, label: "Private", sub: "Invite-only membership" },
                    ] as const).map(({ val, icon: Icon, label, sub }) => (
                      <button
                        key={val}
                        onClick={() => setPrivacy(val)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${privacy === val ? "border-[#C04A22]/50 bg-[#C04A22]/10 shadow-[0_0_10px_rgba(192,74,34,0.18)]" : "border-slate-200 bg-secondary hover:border-[#C04A22]/30"
                          }`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${privacy === val ? "text-[#8C3015]" : "text-muted-foreground"}`} />
                        <div>
                          <div className={`text-xs font-semibold ${privacy === val ? "text-[#8C3015]" : "text-foreground"}`}>{label}</div>
                          <div className="text-[10px] text-muted-foreground">{sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Location <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. New York, NY or National"
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-secondary text-sm focus:outline-none focus:border-[#C04A22]/50 focus:shadow-[0_0_10px_rgba(192,74,34,0.2)] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 2: Details ── */}
            {step === 2 && (
              <>
                {/* Categories */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-slate-900 block">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map(c => {
                      const active = selectedCategories.includes(c);
                      const maxed = !active && selectedCategories.length >= 3;
                      return (
                        <button
                          key={c}
                          onClick={() => !maxed && toggleCategory(c)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border duration-150 cursor-pointer active:scale-95 ${active
                              ? "bg-[#C04A22]/15 text-[#8C3015] border-[#C04A22]/40 font-semibold shadow-2xs"
                              : maxed
                                ? "bg-slate-100 text-slate-400 border-slate-200/50 cursor-not-allowed"
                                : "bg-slate-50 text-slate-700 border-slate-200/90 hover:border-[#C04A22]/50 hover:bg-white hover:text-[#8C3015]"
                            }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-2.5 pt-1">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-[#C04A22]" /> Community Languages <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map(l => {
                      const active = selectedLanguages.includes(l);
                      return (
                        <button
                          key={l}
                          onClick={() => toggleLanguage(l)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border duration-150 cursor-pointer active:scale-95 ${active
                              ? "bg-[#C04A22]/15 text-[#8C3015] border-[#C04A22]/40 shadow-2xs"
                              : "bg-slate-50 text-slate-700 border-slate-200/90 hover:border-[#C04A22]/50 hover:bg-white hover:text-[#8C3015]"
                            }`}
                        >
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="bg-gradient-to-br from-slate-50 to-orange-50/40 rounded-2xl border border-slate-200/90 p-4 shadow-2xs pt-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C04A22]" /> Live Preview
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex gap-3 shadow-xs">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-2xl flex-shrink-0 shadow-2xs">
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{name || "Community Name"}</div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">
                        {selectedCategories.join(", ") || "No categories selected"} · {privacy === "public" ? "Public" : "Private"}
                      </div>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {selectedLanguages.slice(0, 3).map(l => (
                          <span key={l} className="text-[10px] font-semibold bg-[#C04A22]/10 text-[#8C3015] border border-[#C04A22]/20 px-2 py-0.5 rounded-full">{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 3: Rules ── */}
            {step === 3 && (
              <>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 block">Community Rules</label>
                  <div className="space-y-2">
                    {rules.map((rule, i) => (
                      <div key={i} className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5">
                        <span className="w-5.5 h-5.5 rounded-full bg-[#C04A22]/15 text-[#8C3015] border border-[#C04A22]/30 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-xs text-foreground flex-1">{rule}</span>
                        <button
                          onClick={() => setRules(s => s.filter((_, j) => j !== i))}
                          className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add rule */}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={newRule}
                      onChange={e => setNewRule(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addRule()}
                      placeholder="Add a new rule..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-secondary text-xs focus:outline-none focus:border-[#C04A22]/50 focus:shadow-[0_0_10px_rgba(192,74,34,0.2)] focus:bg-white transition-all"
                    />
                    <button
                      onClick={addRule}
                      disabled={!newRule.trim()}
                      className="px-3 py-2 rounded-xl bg-[#C04A22]/15 text-[#8C3015] border border-[#C04A22]/30 hover:bg-[#C04A22]/25 text-xs font-semibold disabled:opacity-40 transition cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </>
            )}
          </div>
        )}

        {/* Footer buttons */}
        {!done && (
          <div className="px-5 py-4 border-t border-border flex gap-2 flex-shrink-0 bg-white">
            {step === 3 ? (
              <div className="flex items-center justify-between gap-2 w-full">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer active:scale-95 flex-shrink-0"
                >
                  Back
                </button>
                <button
                  onClick={() => setShowPublicPreview(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#C04A22]/15 text-[#8C3015] border border-[#C04A22]/30 hover:bg-[#C04A22]/25 text-xs font-bold transition cursor-pointer active:scale-95 shadow-2xs flex items-center justify-center gap-1.5 flex-shrink-0"
                >
                  <Eye className="w-4 h-4 text-[#C04A22]" /> Preview
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#C04A22] text-white text-xs font-bold hover:bg-[#8C3015] disabled:opacity-70 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] shadow-xs"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating…
                    </>
                  ) : "🚀 Create Community"}
                </button>
              </div>
            ) : (
              <>
                {step > 1 && (
                  <button
                    onClick={() => setStep(s => (s - 1) as Step)}
                    className="px-4 py-3 rounded-xl border border-border text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => setStep(s => (s + 1) as Step)}
                  disabled={step === 1 ? !canNext1 : !canNext2}
                  className="flex-1 py-3 rounded-xl bg-[#C04A22] text-white text-sm font-semibold hover:bg-[#8C3015] disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Public View Preview Modal Popup ── */}
      {showPublicPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200">
            {/* Header Banner */}
            <div className="h-24 bg-gradient-to-r from-orange-500 via-[#C04A22] to-amber-600 relative p-4 flex justify-between items-start flex-shrink-0">
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border border-white/30">
                <Eye className="w-3 h-3" /> Public Preview Mode
              </span>
              <button
                onClick={() => setShowPublicPreview(false)}
                className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Body */}
            <div className="px-5 py-4 flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 shadow-xs flex items-center justify-center text-3xl flex-shrink-0">
                  {emoji}
                </div>
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#C04A22]/15 text-[#8C3015] border border-[#C04A22]/30 flex items-center gap-1">
                  + Join Community
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {name || "Community Name"}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap font-medium">
                  <span>1 member (You)</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    {privacy === "public" ? <Globe className="w-3.5 h-3.5 text-slate-400" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                    {privacy === "public" ? "Public Community" : "Private Community"}
                  </span>
                  {location && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {location}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {desc || "No description provided yet."}
                </p>
              </div>

              {/* Categories & Languages */}
              <div className="space-y-2">
                {selectedCategories.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mr-1">Categories:</span>
                    {selectedCategories.map(c => (
                      <span key={c} className="text-xs bg-[#C04A22]/15 text-[#8C3015] border border-[#C04A22]/30 px-2.5 py-0.5 rounded-full font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {selectedLanguages.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mr-1">Languages:</span>
                    {selectedLanguages.map(l => (
                      <span key={l} className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                        🌐 {l}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rules Section Preview */}
              {rules.length > 0 && (
                <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#C04A22]" /> Community Rules ({rules.length})
                  </h4>
                  <div className="space-y-1.5">
                    {rules.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-[#C04A22]/15 text-[#8C3015] font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowPublicPreview(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer active:scale-95"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function Communities() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"discover" | "joined">("discover");
  const [selected, setSelected] = useState<typeof allCommunities[0] | null>(null);
  const [joinedIds, setJoinedIds] = useState<number[]>([1, 2, 5]);
  const [showCreate, setShowCreate] = useState(false);

  const discoverReasons: Record<number, string> = {
    3: "Popular in Texas",
    4: "Based on your job interest",
    6: "Suggested for you",
    7: "Near your location",
    8: "NYC locals",
    9: "South Asian community",
    10: "Spanish speakers",
  };

  const joinedCommunities = allCommunities.filter(c => joinedIds.includes(c.id));
  const discoverCommunities = allCommunities.filter(c => !joinedIds.includes(c.id));

  const filterFn = (c: typeof allCommunities[0]) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

  const visibleJoined = joinedCommunities.filter(filterFn);
  const visibleDiscover = discoverCommunities.filter(filterFn);

  const join = (id: number) => setJoinedIds(s => [...s, id]);
  const leave = (id: number) => setJoinedIds(s => s.filter(x => x !== id));

  if (selected) {
    return (
      <AppLayout>
        <CommunityDetail community={selected} onBack={() => setSelected(null)} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Sticky header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-border">
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                Communities
              </h1>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C04A22]/15 text-[#8C3015] border border-[#C04A22]/30 hover:bg-[#C04A22]/25 text-xs font-semibold transition cursor-pointer active:scale-95 flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Create
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search communities..."
                className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-xl border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary focus:bg-white transition"
              />
            </div>

            {/* Tabs — screenshot style: two big pill buttons */}
            <div className="flex gap-2 bg-secondary rounded-2xl p-1">
              <button
                onClick={() => setActiveTab("discover")}
                className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${activeTab === "discover"
                    ? "bg-white text-[#8C3015] font-bold shadow-xs"
                    : "text-slate-600 hover:text-[#8C3015] font-medium"
                  }`}
              >
                Discover
              </button>
              <button
                onClick={() => setActiveTab("joined")}
                className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${activeTab === "joined"
                    ? "bg-white text-[#8C3015] font-bold shadow-xs"
                    : "text-slate-600 hover:text-[#8C3015] font-medium"
                  }`}
              >
                Joined ({joinedIds.length})
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* ── JOINED TAB ── */}
          {activeTab === "joined" && (
            <>
              {visibleJoined.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border p-12 text-center">
                  <div className="text-4xl mb-3">🏘️</div>
                  <p className="font-semibold text-foreground mb-1">No communities yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Switch to Discover to find communities to join</p>
                  <button
                    onClick={() => setActiveTab("discover")}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition"
                  >
                    Discover Communities
                  </button>
                </div>
              ) : (
                visibleJoined.map(c => (
                  <JoinedCard
                    key={c.id}
                    community={c}
                    onOpen={() => setSelected(c)}
                    onLeave={() => leave(c.id)}
                  />
                ))
              )}
            </>
          )}

          {/* ── DISCOVER TAB ── */}
          {activeTab === "discover" && (
            <>
              {visibleDiscover.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border p-12 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="font-semibold text-foreground mb-1">No communities found</p>
                  <p className="text-sm text-muted-foreground">Try a different search term</p>
                </div>
              ) : (
                visibleDiscover.map(c => (
                  <DiscoverCard
                    key={c.id}
                    community={c}
                    onOpen={() => setSelected(c)}
                    onJoin={() => join(c.id)}
                    reason={discoverReasons[c.id] ?? "Suggested for you"}
                  />
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Community Modal */}
      {showCreate && (
        <CreateCommunityModal
          onClose={() => setShowCreate(false)}
          onCreate={(name, emoji) => {
            const newId = Date.now();
            setJoinedIds(s => [...s, newId]);
            setActiveTab("joined");
          }}
        />
      )}
    </AppLayout>
  );
}
