import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX,
  Play, MoreHorizontal, MapPin, ChevronUp, ChevronDown,
  CheckCircle, Send, X, Search, Flag, Link, Globe, Music2,
  Clapperboard, TrendingUp, Flame, Clock, Star, ArrowLeft,
  Plus, Video, Upload, Eye, EyeOff, MessageSquareOff, Loader2, CheckCircle2,
  RefreshCw
} from "lucide-react";

// ── Data ───────────────────────────────────────────────────────────────────────
const reels = [
  {
    id: 1,
    author: { name: "Sadia Islam", handle: "@sadia_nyc", avatar: "SI", color: "from-pink-400 to-rose-500", verified: true },
    video: "https://videos.pexels.com/video-files/5699481/5699481-uhd_1440_2560_30fps.mp4",
    poster: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=720&fit=crop",
    caption: "5 things I wish I knew before moving to New York as an immigrant 🗽 Save this if you're planning to come!",
    audio: "Original Audio · Sadia Islam",
    likes: 12400, comments: 834, shares: 2100, saves: 5600,
    location: "Queens, New York",
    tags: ["ImmigrantLife", "NewYork", "Tips"],
    duration: 30, views: "248K",
  },
  {
    id: 2,
    author: { name: "Rahim Chowdhury", handle: "@rahim_bdconnect", avatar: "RC", color: "from-emerald-400 to-teal-500", verified: true },
    video: "https://videos.pexels.com/video-files/3195394/3195394-uhd_1440_2560_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=400&h=720&fit=crop",
    caption: "How to open a US bank account without SSN 🏦 Step by step guide for new immigrants!",
    audio: "Trending Sound · Finance Tips",
    likes: 8900, comments: 1240, shares: 3400, saves: 9800,
    location: "Jackson Heights, NY",
    tags: ["Banking", "Immigrant", "USA"],
    duration: 45, views: "189K",
  },
  {
    id: 3,
    author: { name: "Priya Sharma", handle: "@priya_sharma_usa", avatar: "PS", color: "from-violet-400 to-purple-500", verified: false },
    video: "https://videos.pexels.com/video-files/7699325/7699325-hd_1080_1920_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=720&fit=crop",
    caption: "F-1 Student life in NYC 🎓 Balancing studies, culture shock, and finding community.",
    audio: "Original Audio · Priya Sharma",
    likes: 21000, comments: 2100, shares: 4500, saves: 7200,
    location: "Manhattan, New York",
    tags: ["F1Student", "InternationalStudent", "NYU"],
    duration: 28, views: "412K",
  },
  {
    id: 4,
    author: { name: "Carlos Mendoza", handle: "@carlos_mx_nyc", avatar: "CM", color: "from-amber-400 to-orange-500", verified: false },
    video: "https://videos.pexels.com/video-files/6985793/6985793-uhd_1440_2560_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=720&fit=crop",
    caption: "Authentic Mexican food spots in Queens that remind me of home 🌮❤️",
    audio: "La Bamba · Ritchie Valens",
    likes: 34000, comments: 876, shares: 8900, saves: 15000,
    location: "Corona, Queens",
    tags: ["QueensFood", "MexicanFood"],
    duration: 22, views: "673K",
  },
  {
    id: 5,
    author: { name: "Fatima Al-Hassan", handle: "@fatima_legal_help", avatar: "FA", color: "from-sky-400 to-blue-500", verified: true },
    video: "https://videos.pexels.com/video-files/8728380/8728380-hd_1080_1920_30fps.mp4",
    poster: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=720&fit=crop",
    caption: "Know your rights as an immigrant in the US 🇺🇸⚖️ Share with someone who needs it.",
    audio: "Original Audio · Fatima Al-Hassan",
    likes: 56000, comments: 3400, shares: 28000, saves: 45000,
    location: "The Bronx, NY",
    tags: ["ImmigrantRights", "Legal"],
    duration: 60, views: "1.2M",
  },
  {
    id: 6,
    author: { name: "Wei Zhang", handle: "@wei_flushing", avatar: "WZ", color: "from-red-400 to-rose-500", verified: false },
    video: "https://videos.pexels.com/video-files/4812212/4812212-uhd_1440_2560_24fps.mp4",
    poster: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=720&fit=crop",
    caption: "Flushing Chinatown hidden gems 🏮 Places no tourist knows about!",
    audio: "Night Market Vibes · Trending",
    likes: 18500, comments: 690, shares: 4200, saves: 8100,
    location: "Flushing, Queens",
    tags: ["Flushing", "Chinatown", "NYC"],
    duration: 35, views: "334K",
  },
  {
    id: 7,
    author: { name: "Amara Diallo", handle: "@amara_diallo_bk", avatar: "AD", color: "from-lime-400 to-green-500", verified: false },
    video: "https://videos.pexels.com/video-files/6894429/6894429-uhd_1440_2560_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=720&fit=crop",
    caption: "From refugee to running my own business in Brooklyn 💪🏿 My 3-year journey.",
    audio: "Rise Up · Andra Day",
    likes: 89000, comments: 7800, shares: 34000, saves: 62000,
    location: "Flatbush, Brooklyn",
    tags: ["Refugee", "Entrepreneur", "Brooklyn"],
    duration: 52, views: "2.1M",
  },
  {
    id: 8,
    author: { name: "Min-Ji Park", handle: "@minji_park_nyc", avatar: "MP", color: "from-orange-400 to-amber-500", verified: false },
    video: "https://videos.pexels.com/video-files/5699481/5699481-uhd_1440_2560_30fps.mp4",
    poster: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=720&fit=crop",
    caption: "Korean street food I make at home 🍜 Recipe in comments!",
    audio: "K-Food Vibes · Trending",
    likes: 44000, comments: 3100, shares: 9800, saves: 22000,
    location: "Flushing, Queens",
    tags: ["KoreanFood", "Cooking", "Immigrant"],
    duration: 40, views: "890K",
  },
  {
    id: 9,
    author: { name: "Omar Sheikh", handle: "@omar_sheikh_qns", avatar: "OS", color: "from-teal-400 to-cyan-500", verified: false },
    video: "https://videos.pexels.com/video-files/3195394/3195394-uhd_1440_2560_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=720&fit=crop",
    caption: "My first week driving in NYC as a new immigrant 😅 Everything I learned the hard way.",
    audio: "Original Audio · Omar Sheikh",
    likes: 6700, comments: 540, shares: 1200, saves: 3400,
    location: "Jamaica, Queens",
    tags: ["NYCDriving", "NewImmigrant"],
    duration: 35, views: "112K",
  },
];

type Reel = typeof reels[0];

const categories = [
  { id: "all", label: "For You", icon: Star },
  { id: "trending", label: "Trending", icon: Flame },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "top", label: "Top", icon: TrendingUp },
];

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ── Comment Sheet ─────────────────────────────────────────────────────────────
const sampleComments = [
  { id: 1, user: "Nadia R.", avatar: "NR", color: "from-fuchsia-400 to-pink-500", text: "This is exactly what I needed!! Thank you 🙏", likes: 234, time: "2h" },
  { id: 2, user: "Omar S.", avatar: "OS", color: "from-teal-400 to-cyan-500", text: "Can you make a video about ITIN applications?", likes: 89, time: "3h" },
  { id: 3, user: "Lucia F.", avatar: "LF", color: "from-rose-400 to-red-500", text: "Sharing this with my whole community group 🔥", likes: 156, time: "4h" },
  { id: 4, user: "Tariq H.", avatar: "TH", color: "from-indigo-400 to-blue-500", text: "Bro this saved my life fr. Was about to make a huge mistake 😅", likes: 312, time: "5h" },
  { id: 5, user: "Min-Ji P.", avatar: "MP", color: "from-orange-400 to-amber-500", text: "Please do a part 2!! I have so many questions", likes: 67, time: "6h" },
];

function CommentSheet({ reel, onClose }: { reel: Reel; onClose: () => void }) {
  const [text, setText] = useState("");
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div className="bg-[#1c1c1e] rounded-t-3xl flex flex-col max-h-[78vh]" onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1"><div className="w-9 h-1 rounded-full bg-white/20" /></div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <span className="font-bold text-white text-sm">{fmt(reel.comments)} comments</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {sampleComments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{c.avatar}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-white/80 text-xs font-semibold mr-1.5">{c.user}</span>
                    <span className="text-xs text-white/40">{c.time}ago</span>
                    <p className="text-white text-sm mt-0.5 leading-snug">{c.text}</p>
                    <button className="text-white/40 text-xs mt-1 hover:text-white/70 transition">Reply</button>
                  </div>
                  <button onClick={() => setLikedComments(p => { const n = new Set(p); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; })}
                    className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <Heart className={`w-4 h-4 transition ${likedComments.has(c.id) ? "fill-red-500 text-red-500" : "text-white/40"}`} />
                    <span className="text-white/40 text-[10px]">{likedComments.has(c.id) ? c.likes + 1 : c.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">RA</div>
          <div className="flex-1 flex items-center bg-white/10 rounded-full px-4 py-2.5 gap-2">
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Add a comment…"
              className="flex-1 text-sm bg-transparent outline-none text-white placeholder:text-white/40" />
            {text.trim() && (
              <button onClick={() => setText("")} className="text-[#C04A22] hover:text-[#d4522a] font-bold text-xs">Post</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Share Sheet ───────────────────────────────────────────────────────────────
function ShareSheet({ onClose }: { onClose: () => void }) {
  const opts = [
    { icon: MessageCircle, label: "Send in Chat", sub: "Share privately", color: "bg-[#C04A22]/20 text-[#d4522a]" },
    { icon: Link, label: "Copy Link", sub: "Copy to clipboard", color: "bg-white/10 text-white" },
    { icon: Globe, label: "Share to Feed", sub: "Post on your feed", color: "bg-white/10 text-white" },
    { icon: Flag, label: "Report", sub: "Report this reel", color: "bg-red-500/20 text-red-400" },
  ];
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div className="bg-[#1c1c1e] rounded-t-3xl px-4 pt-3 pb-8" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center mb-4"><div className="w-9 h-1 rounded-full bg-white/20" /></div>
        <p className="text-white font-bold text-sm mb-4 px-1">Share</p>
        <div className="grid grid-cols-2 gap-2.5">
          {opts.map(({ icon: Icon, label, sub, color }) => (
            <button key={label} onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition hover:opacity-80 ${color} bg-white/5`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">{label}</div>
                <div className="text-[10px] text-white/40">{sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Single Reel Player ────────────────────────────────────────────────────────
function ReelPlayer({ reel, active, muted, onMuteToggle }: {
  reel: Reel; active: boolean; muted: boolean; onMuteToggle: () => void; key?: React.Key;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.currentTime = 0;
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause(); v.currentTime = 0;
      setPlaying(false); setProgress(0);
    }
  }, [active]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }

  function doubleTap() {
    setLiked(true);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 700);
  }

  function handleTap() {
    if (tapTimer.current) {
      clearTimeout(tapTimer.current); tapTimer.current = null; doubleTap();
    } else {
      tapTimer.current = setTimeout(() => { tapTimer.current = null; togglePlay(); }, 230);
    }
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video ref={videoRef} src={reel.video} poster={reel.poster}
        loop muted={muted} playsInline
        onTimeUpdate={e => { const v = e.currentTarget; if (v.duration) setProgress((v.currentTime / v.duration) * 100); }}
        className="absolute inset-0 w-full h-full object-cover" />

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 pointer-events-none" />

      {/* Tap zone */}
      <div className="absolute inset-0 z-10" onClick={handleTap} />

      {/* Double-tap heart */}
      {likeAnim && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <Heart className="w-32 h-32 fill-white text-white drop-shadow-2xl"
            style={{ animation: "heartPop 0.7s ease-out forwards" }} />
        </div>
      )}

      {/* Pause overlay */}
      {!playing && active && !likeAnim && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Right action bar */}
      <div className="absolute right-3 bottom-32 z-20 flex flex-col items-center gap-6">
        {[
          {
            icon: <Heart className={`w-7 h-7 drop-shadow transition-all ${liked ? "fill-red-500 text-red-500 scale-110" : "text-white"}`} />,
            count: fmt(liked ? reel.likes + 1 : reel.likes),
            onClick: () => setLiked(l => !l),
          },
          {
            icon: <MessageCircle className="w-7 h-7 text-white drop-shadow" />,
            count: fmt(reel.comments),
            onClick: () => setShowComments(true),
          },
          {
            icon: <Share2 className="w-7 h-7 text-white drop-shadow" />,
            count: fmt(reel.shares),
            onClick: () => setShowShare(true),
          },
          {
            icon: <Bookmark className={`w-7 h-7 drop-shadow transition-all ${saved ? "fill-yellow-400 text-yellow-400" : "text-white"}`} />,
            count: fmt(saved ? reel.saves + 1 : reel.saves),
            onClick: () => setSaved(s => !s),
          },
        ].map((btn, i) => (
          <button key={i} className="flex flex-col items-center gap-1.5"
            onClick={e => { e.stopPropagation(); btn.onClick(); }}>
            {btn.icon}
            <span className="text-white text-[11px] font-semibold drop-shadow">{btn.count}</span>
          </button>
        ))}
        <button className="w-10 h-10 rounded-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
          <MoreHorizontal className="w-6 h-6 text-white drop-shadow" />
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-16 z-20 px-4 pb-5">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${reel.author.color} flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-lg flex-shrink-0`}>
            {reel.author.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold text-sm drop-shadow">{reel.author.name}</span>
              {reel.author.verified && <CheckCircle className="w-3.5 h-3.5 fill-[#C04A22] text-white" />}
            </div>
            <span className="text-white/60 text-xs">{reel.author.handle}</span>
          </div>
          <button className="px-4 py-1.5 rounded-full border border-white/70 text-white text-xs font-bold hover:bg-[#C04A22] hover:border-[#C04A22] transition-all cursor-pointer">
            Follow
          </button>
        </div>

        {/* Caption */}
        <p className={`text-white text-sm leading-relaxed drop-shadow mb-1 ${captionExpanded ? "" : "line-clamp-2"}`}>
          {reel.caption}
        </p>
        {reel.caption.length > 80 && (
          <button onClick={e => { e.stopPropagation(); setCaptionExpanded(c => !c); }}
            className="text-white/60 text-xs mb-2 hover:text-white/90 transition">
            {captionExpanded ? "less" : "more"}
          </button>
        )}

        {/* Tags */}
        <div className="flex gap-2 flex-wrap mb-2">
          {reel.tags.map(t => <span key={t} className="text-white/80 text-xs font-semibold">#{t}</span>)}
        </div>

        {/* Audio */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-white/20 flex items-center justify-center">
            <Music2 className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-white/70 text-xs">{reel.audio}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-[2px] bg-white/20">
        <div className="h-full bg-[#C04A22] transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>

      {showComments && <CommentSheet reel={reel} onClose={() => setShowComments(false)} />}
      {showShare && <ShareSheet onClose={() => setShowShare(false)} />}

      <style>{`
        @keyframes heartPop {
          0%   { transform: scale(0.5); opacity: 1; }
          50%  { transform: scale(1.1); opacity: 1; }
          80%  { transform: scale(0.95); opacity: 0.9; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Grid Thumbnail ────────────────────────────────────────────────────────────
function ReelThumb({ reel, onClick }: { reel: Reel; onClick: () => void; key?: React.Key }) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hovered) { v.muted = true; v.play().catch(() => {}); }
    else { v.pause(); v.currentTime = 0; }
  }, [hovered]);

  return (
    <div
      className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group bg-black"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Poster always visible */}
      <img src={reel.poster} alt={reel.author.name} className="absolute inset-0 w-full h-full object-cover" />

      {/* Video plays on hover */}
      <video ref={videoRef} src={reel.video} muted playsInline loop
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`} />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Play icon when not hovered */}
      {!hovered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-0 transition">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Hover play indicator */}
      {hovered && (
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
          <Volume2 className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        {/* Views */}
        <div className="flex items-center gap-1 mb-2">
          <Play className="w-3 h-3 text-white/80 fill-white/80" />
          <span className="text-white/80 text-xs font-semibold">{reel.views}</span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-1.5">
          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${reel.author.color} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
            {reel.author.avatar[0]}
          </div>
          <span className="text-white text-xs font-semibold truncate">{reel.author.name}</span>
          {reel.author.verified && <CheckCircle className="w-3 h-3 fill-[#C04A22] text-white flex-shrink-0" />}
        </div>

        {/* Caption preview */}
        <p className="text-white/70 text-[11px] mt-1 line-clamp-2 leading-snug">{reel.caption}</p>
      </div>

      {/* Like count top-left */}
      <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
        <Heart className="w-3 h-3 text-red-400 fill-red-400" />
        <span className="text-white text-[10px] font-semibold">{fmt(reel.likes)}</span>
      </div>
    </div>
  );
}

// ── Reel Upload Modal ─────────────────────────────────────────────────────────
type UploadStep = "select" | "edit" | "processing" | "done";
type Visibility = "everyone" | "followers" | "only_me";

function ReelUploadModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<UploadStep>("select");
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Edit form state
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>(["ImmigrantLife", "NYC", "Community"]);
  const [location, setLocation] = useState("Queens, New York");
  const [audioName, setAudioName] = useState("Original Sound · Rafiq Ahmed");
  const [visibility, setVisibility] = useState<Visibility>("everyone");
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URL on unmount
  useEffect(() => () => { if (videoUrl) URL.revokeObjectURL(videoUrl); }, [videoUrl]);

  // Auto-advance from processing to done
  useEffect(() => {
    if (step === "processing") {
      const t = setTimeout(() => setStep("done"), 2200);
      return () => clearTimeout(t);
    }
  }, [step]);

  function handleFile(f: File) {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setStep("edit");
  }

  function handleHashtagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === " " || e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = hashtagInput.trim().replace(/^#/, "");
      if (tag && !hashtags.includes(tag)) {
        setHashtags(prev => [...prev, tag]);
      }
      setHashtagInput("");
    }
  }

  function removeHashtag(tag: string) {
    setHashtags(prev => prev.filter(t => t !== tag));
  }

  function reset() {
    setStep("select");
    setFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setTitle("");
    setCaption("");
    setHashtagInput("");
    setHashtags(["ImmigrantLife", "NYC"]);
    setLocation("Queens, New York");
    setAudioName("Original Sound · Rafiq Ahmed");
    setVisibility("everyone");
    setAllowComments(true);
    setAllowDuet(true);
    setIsDragging(false);
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <style>{`
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Modal Container with Clean White Background */}
      <div className="bg-white w-full max-w-3xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-900">

        {/* ── Step: Select / Upload Video ── */}
        {step === "select" && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#C04A22]/10 text-[#C04A22] flex items-center justify-center font-bold">
                  <Video className="w-4 h-4 text-[#C04A22]" />
                </div>
                <h2 className="text-slate-900 font-extrabold text-base sm:text-lg">Create New Reel</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Zone */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 gap-6 bg-slate-50/40">
              <div
                className={`w-full max-w-md aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 bg-white ${
                  isDragging
                    ? "border-[#C04A22] bg-[#C04A22]/5 scale-[1.02] shadow-md"
                    : "border-slate-300 hover:border-[#C04A22] hover:bg-[#C04A22]/5 shadow-2xs"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDragging(false);
                  const f = e.dataTransfer.files[0];
                  if (f?.type.startsWith("video/")) handleFile(f);
                }}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-[#C04A22]/20" : "bg-[#C04A22]/10"}`}>
                  <Video className="w-8 h-8 text-[#C04A22]" />
                </div>
                <div className="text-center px-4">
                  <p className="text-slate-900 font-bold text-base mb-1">
                    {isDragging ? "Drop your video here" : "Tap or Drag & Drop to upload video"}
                  </p>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Share your story, immigration tip, or community highlight
                  </p>
                  <p className="text-slate-400 text-[11px] mt-1 font-mono">MP4, MOV, WebM · Max 60 seconds</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition">
                  <Upload className="w-3.5 h-3.5 text-slate-700" />
                  <span className="text-slate-700 text-xs font-bold">Browse local files</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />

              {/* Quick Action Buttons */}
              <div className="flex gap-3 w-full max-w-md">
                <button
                  onClick={() => alert("Camera recording feature active! Select a video clip to continue.")}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold hover:bg-slate-100 shadow-2xs transition cursor-pointer active:scale-95"
                >
                  <Video className="w-4 h-4 text-[#C04A22]" />
                  Record Video
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  Select from Device
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step: Edit Form with Comprehensive Information Inputs ── */}
        {step === "edit" && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white flex-shrink-0">
              <button onClick={reset} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer" title="Back">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-slate-900 font-extrabold text-base sm:text-lg">Reel Details & Information</h2>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer" title="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50">
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
                
                {/* Left Side: Video Preview (Phone Aspect Ratio) */}
                {videoUrl && (
                  <div className="md:w-64 lg:w-72 p-5 flex flex-col items-center justify-start bg-white flex-shrink-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 self-start">Video Preview</span>
                    <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-md border border-slate-200">
                      <video
                        src={videoUrl}
                        controls
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 text-xs font-bold text-[#C04A22] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Change Video
                    </button>
                  </div>
                )}

                {/* Right Side: Form Inputs */}
                <div className="flex-1 p-5 sm:p-6 space-y-4 bg-white">
                  
                  {/* 1. Title Input */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <span>Reel Title</span>
                      <span className="text-[#C04A22]">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. 5 Things I Wish I Knew Before Moving to New York 🗽"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-[#C04A22] focus:bg-white transition"
                    />
                  </div>

                  {/* 2. Description / Caption Textarea */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 block">
                      Description / Caption
                    </label>
                    <textarea
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      placeholder="Write your story, helpful guide, tips or message for the community..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-[#C04A22] focus:bg-white resize-none transition"
                    />
                  </div>

                  {/* 3. Music / Audio Track Input with Quick Presets */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Music2 className="w-3.5 h-3.5 text-[#C04A22]" />
                      <span>Music &amp; Audio Track</span>
                    </label>
                    <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus-within:border-[#C04A22] focus-within:bg-white transition">
                      <Music2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <input
                        value={audioName}
                        onChange={e => setAudioName(e.target.value)}
                        placeholder="e.g. Original Audio · Your Name or Trending Beat"
                        className="flex-1 bg-transparent text-slate-900 text-sm placeholder:text-slate-400 outline-none"
                      />
                    </div>
                    {/* Audio Quick Suggestions */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      <span className="text-[10px] font-bold text-slate-400">Popular:</span>
                      {[
                        "🎙️ Original Voice",
                        "🎵 NYC Chill Beats",
                        "🎶 Deshi Folk Acoustic",
                        "🎧 Trending Lo-Fi"
                      ].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAudioName(preset)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#C04A22]/10 hover:text-[#C04A22] text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Hashtags */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 block">
                      Hashtags
                    </label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus-within:border-[#C04A22] focus-within:bg-white transition">
                      <span className="text-slate-400 font-bold text-sm">#</span>
                      <input
                        value={hashtagInput}
                        onChange={e => setHashtagInput(e.target.value)}
                        onKeyDown={handleHashtagKey}
                        placeholder="Type tag &amp; press Enter (e.g. USATips, Foodie)"
                        className="flex-1 bg-transparent text-slate-900 text-sm placeholder:text-slate-400 outline-none"
                      />
                    </div>
                    {hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {hashtags.map(tag => (
                          <span key={tag} className="flex items-center gap-1 bg-[#C04A22]/10 border border-[#C04A22]/30 text-[#8C3015] text-xs font-bold px-2.5 py-1 rounded-lg">
                            #{tag}
                            <button onClick={() => removeHashtag(tag)} className="hover:text-red-600 transition cursor-pointer ml-0.5">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 5. Location */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C04A22]" />
                      <span>Location</span>
                    </label>
                    <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus-within:border-[#C04A22] focus-within:bg-white transition">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="Add location (e.g. Queens, Jackson Heights, Manhattan)"
                        className="flex-1 bg-transparent text-slate-900 text-sm placeholder:text-slate-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* 6. Visibility & Audience */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 block">
                      Who can watch this reel?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { id: "everyone", label: "Everyone", icon: Globe },
                        { id: "followers", label: "Followers", icon: Eye },
                        { id: "only_me", label: "Only Me", icon: EyeOff },
                      ] as { id: Visibility; label: string; icon: typeof Globe }[]).map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setVisibility(id)}
                          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            visibility === id
                              ? "bg-[#C04A22]/12 border-[#C04A22] text-[#8C3015] shadow-2xs"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 7. Engagement Settings */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <MessageCircle className="w-4 h-4 text-slate-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Allow Comments</p>
                          <p className="text-[10px] text-slate-500">{allowComments ? "Anyone can write a comment" : "Comments turned off"}</p>
                        </div>
                      </div>
                      <div
                        onClick={() => setAllowComments(c => !c)}
                        className={`w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 flex items-center px-0.5 ${allowComments ? "bg-[#C04A22]" : "bg-slate-300"}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${allowComments ? "translate-x-5" : "translate-x-0"}`} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-2.5">
                        <Share2 className="w-4 h-4 text-slate-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Allow Shares &amp; Reposts</p>
                          <p className="text-[10px] text-slate-500">Enable community members to share this reel</p>
                        </div>
                      </div>
                      <div
                        onClick={() => setAllowDuet(d => !d)}
                        className={`w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 flex items-center px-0.5 ${allowDuet ? "bg-[#C04A22]" : "bg-slate-300"}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${allowDuet ? "translate-x-5" : "translate-x-0"}`} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 flex-shrink-0">
              <button
                onClick={reset}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer active:scale-95"
              >
                Back
              </button>
              <button
                onClick={() => setStep("processing")}
                className="px-7 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm transition hover:opacity-95 shadow-md shadow-[#C04A22]/20 cursor-pointer active:scale-95"
                style={{ background: "linear-gradient(135deg, #d4522a 0%, #C04A22 100%)" }}
              >
                Publish Reel
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Processing ── */}
        {step === "processing" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-10 text-center bg-white">
            <div style={{ animation: "pulse-slow 1.5s ease-in-out infinite" }}>
              <div className="w-20 h-20 rounded-3xl bg-[#C04A22]/10 text-[#C04A22] flex items-center justify-center shadow-xs">
                <Clapperboard className="w-10 h-10 text-[#C04A22]" />
              </div>
            </div>

            <div className="text-center space-y-1.5">
              <h2 className="text-slate-900 font-extrabold text-xl">Publishing your reel...</h2>
              <p className="text-slate-500 text-xs">Optimizing video quality and audio synchronization</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs space-y-2">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #d4522a 0%, #C04A22 100%)",
                    animation: "progressFill 2s ease-in-out forwards",
                  }}
                />
              </div>
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C04A22]" />
                <span>Processing upload…</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Step: Done ── */}
        {step === "done" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-10 text-center bg-white">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-200" style={{ animation: "scaleIn 0.4s ease-out both" }}>
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div style={{ animation: "scaleIn 0.4s ease-out 0.1s both" }} className="space-y-1.5">
              <h2 className="text-slate-900 font-extrabold text-2xl">Reel Published!</h2>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                Your reel is now live on the Discovery feed and shared with your community.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 w-full max-w-xs" style={{ animation: "scaleIn 0.4s ease-out 0.2s both" }}>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-white font-bold text-xs sm:text-sm transition hover:opacity-95 shadow-md shadow-[#C04A22]/20 cursor-pointer active:scale-95"
                style={{ background: "linear-gradient(135deg, #d4522a 0%, #C04A22 100%)" }}
              >
                View Reel
              </button>
              <button
                onClick={reset}
                className="w-full py-2.5 rounded-xl text-slate-700 font-bold text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer active:scale-95"
              >
                Upload Another
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Discovery Grid ────────────────────────────────────────────────────────────
function ReelsGrid({ onSelectReel, onUpload }: { onSelectReel: (idx: number) => void; onUpload: () => void }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filtered = reels.filter(r =>
    !searchQuery.trim() ||
    r.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl xl:max-w-4xl mx-auto min-h-screen flex flex-col py-3 sm:py-5 px-3 sm:px-4 space-y-4">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3">
          <div className="flex items-center gap-2.5">
            <button onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition flex-shrink-0 cursor-pointer">
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4522a] to-[#C04A22] flex items-center justify-center shadow-xs">
              <Clapperboard className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">Reels</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSearch(s => !s)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${showSearch ? "bg-[#C04A22] text-white" : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"}`}>
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={onUpload}
              className="w-9 h-9 rounded-full bg-[#C04A22] hover:bg-[#8C3015] flex items-center justify-center text-white shadow-xs transition cursor-pointer active:scale-95"
              title="Upload Reel"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="px-4 sm:px-5 pb-3">
            <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-3.5 py-2.5">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search reels, creators, topics…"
                className="flex-1 bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400" />
              {searchQuery && <button onClick={() => setSearchQuery("")}><X className="w-4 h-4 text-slate-400" /></button>}
            </div>
          </div>
        )}

        {/* Category tabs */}
        <div className="flex gap-1.5 px-4 sm:px-5 pb-3 overflow-x-auto scrollbar-hide">
          {categories.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveCategory(id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                activeCategory === id
                  ? "bg-[#C04A22] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}>
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured reel — top hero */}
      {!searchQuery && (
        <div className="relative rounded-3xl overflow-hidden cursor-pointer h-44 sm:h-52 group shadow-sm border border-slate-200/60"
          onClick={() => onSelectReel(0)}>
          <img src={reels[0].poster} alt="Featured" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#d4522a] to-[#C04A22] text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 w-fit shadow-xs">
              <Flame className="w-3 h-3" /> FEATURED
            </div>
            <h2 className="text-white font-bold text-base sm:text-lg leading-tight max-w-md line-clamp-2 drop-shadow">{reels[0].caption}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${reels[0].author.color} flex items-center justify-center text-white text-[10px] font-bold shadow-xs`}>{reels[0].author.avatar[0]}</div>
              <span className="text-white/90 text-xs font-medium">{reels[0].author.name}</span>
              <span className="text-white/50 text-xs">·</span>
              <span className="text-white/70 text-xs font-medium">{reels[0].views} views</span>
            </div>
          </div>
          <div className="absolute right-5 bottom-5">
            <div className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="pb-16 flex-1">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-2xs">
            <Search className="w-10 h-10 text-slate-300 mb-3" />
            <p className="font-bold text-slate-800 text-sm">No reels found</p>
            <p className="text-xs text-slate-500 mt-1">Try a different keyword or category</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {searchQuery ? `${filtered.length} results found` : "Suggested for you"}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((reel) => (
                <ReelThumb key={reel.id} reel={reel} onClick={() => onSelectReel(reels.indexOf(reel))} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Full-screen Player Feed ───────────────────────────────────────────────────
function ReelsFeed({ startIdx, onClose }: { startIdx: number; onClose: () => void }) {
  const [activeIdx, setActiveIdx] = useState(startIdx);
  const [muted, setMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  const goTo = useCallback((idx: number) => {
    if (idx >= 0 && idx < reels.length) setActiveIdx(idx);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") goTo(activeIdx + 1);
      if (e.key === "ArrowUp") goTo(activeIdx - 1);
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIdx, goTo, onClose]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (e.deltaY > 50) goTo(activeIdx + 1);
      else if (e.deltaY < -50) goTo(activeIdx - 1);
    }
    function onTouchStart(e: TouchEvent) { startY.current = e.touches[0].clientY; }
    function onTouchEnd(e: TouchEvent) {
      const dy = startY.current - e.changedTouches[0].clientY;
      if (dy > 60) goTo(activeIdx + 1);
      else if (dy < -60) goTo(activeIdx - 1);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [activeIdx, goTo]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center overflow-hidden">
      {/* Ambient Blurred Background for Desktop View */}
      <div
        className="absolute inset-0 opacity-25 blur-3xl pointer-events-none scale-125 hidden lg:block transition-all duration-700"
        style={{
          backgroundImage: `url(${reels[activeIdx]?.poster})`,
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      />

      {/* Desktop Nav Arrows (Up / Down on Desktop) */}
      <div className="absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
        <button
          onClick={() => goTo(activeIdx - 1)}
          disabled={activeIdx === 0}
          className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition disabled:opacity-20 cursor-pointer shadow-lg active:scale-95"
          title="Previous Reel"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={() => goTo(activeIdx + 1)}
          disabled={activeIdx === reels.length - 1}
          className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition disabled:opacity-20 cursor-pointer shadow-lg active:scale-95"
          title="Next Reel"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Video Container Frame: Mobile = 100% full screen; Desktop = Sleek 9:16 Centered Phone Frame */}
      <div className="relative w-full h-full lg:w-[420px] lg:h-[90vh] lg:max-h-[840px] lg:rounded-3xl lg:overflow-hidden lg:shadow-2xl lg:border lg:border-white/15 bg-black flex flex-col">
        
        {/* Inside Video Top Overlay: Close (X) + Location Badge on Right of X + Sound Button */}
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition cursor-pointer active:scale-95 shadow-md flex-shrink-0"
              title="Close player"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Location Tag on the Right Side of X Button */}
            {reels[activeIdx]?.location && (
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                <MapPin className="w-3.5 h-3.5 text-[#C04A22] flex-shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{reels[activeIdx].location}</span>
              </div>
            )}
          </div>

          {/* Sound / Mute Button at Right Top Corner of Video */}
          <button
            onClick={() => setMuted(m => !m)}
            className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition cursor-pointer active:scale-95 shadow-md flex-shrink-0"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <Volume2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
          </button>
        </div>

        <div ref={containerRef} className="flex-1 relative overflow-hidden">
          <div
            className="flex flex-col transition-transform duration-[420ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            style={{ transform: `translateY(-${activeIdx * 100}%)`, height: `${reels.length * 100}%` }}
          >
            {reels.map((reel, i) => (
              <div key={reel.id} className="w-full flex-shrink-0" style={{ height: `${100 / reels.length}%` }}>
                <ReelPlayer reel={reel} active={i === activeIdx} muted={muted} onMuteToggle={() => setMuted(m => !m)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Entry point ───────────────────────────────────────────────────────────────
export function Reels() {
  const [playerIdx, setPlayerIdx] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <AppLayout hideNav={playerIdx !== null}>
      <ReelsGrid onSelectReel={idx => setPlayerIdx(idx)} onUpload={() => setShowUpload(true)} />
      {playerIdx !== null && (
        <ReelsFeed startIdx={playerIdx} onClose={() => setPlayerIdx(null)} />
      )}
      {showUpload && <ReelUploadModal onClose={() => setShowUpload(false)} />}
    </AppLayout>
  );
}
