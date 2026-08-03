import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  ArrowLeft, Heart, MessageCircle, Repeat2, Share2, Bookmark, MoreHorizontal,
  CheckCircle, MapPin, Send, Smile, Image, Flag, Ban, ThumbsUp, ChevronDown
} from "lucide-react";

const post = {
  id: 1,
  author: { name: "Nadia Islam", handle: "@nadia_nyc", avatar: "NI", color: "from-emerald-400 to-teal-500", verified: true, bio: "Immigration Attorney | Helping immigrants navigate the US system", followers: "12.4K" },
  time: "October 14, 2025 · 2:37 PM",
  content: `For everyone asking about the H-1B cap-exempt employers: universities, nonprofit research orgs, and government research orgs can hire H-1B workers WITHOUT waiting for the lottery. This is a massive opportunity for researchers and academics! 🎓

Here's a quick breakdown:
• Universities & affiliated nonprofits → Cap-exempt
• NIH, CDC, and government labs → Cap-exempt
• Nonprofit research orgs (must qualify) → Cap-exempt

If you're an international student or researcher, this opens up a HUGE range of employers you might not have considered.

I've seen too many people miss this because they only looked at private sector jobs. Please share with anyone who needs to know! 🙏`,
  likes: 1234,
  comments: 156,
  reposts: 567,
  views: 89234,
  location: "California, USA",
  tags: ["H-1B", "Jobs", "Immigration", "Research"],
};

const replies = [
  {
    id: 1,
    author: { name: "Priya Sharma", handle: "@priya_nyc", avatar: "PS", color: "from-orange-400 to-rose-500", verified: false },
    time: "2h ago",
    content: "This is SO helpful! I'm currently on F-1 OPT and didn't realize MIT Lincoln Laboratory was cap-exempt. Just applied! Thank you @nadia_nyc 🙏",
    likes: 234,
    replies: 12,
    liked: true,
    expertReply: false,
  },
  {
    id: 2,
    author: { name: "Dr. Ravi Kumar", handle: "@dr_ravi_md", avatar: "RK", color: "from-blue-400 to-indigo-500", verified: true },
    time: "3h ago",
    content: `Great point Nadia! To add some detail — for a nonprofit to qualify as cap-exempt, it must be affiliated with or related to a university. The key test is an "affiliation agreement" between the nonprofit and the university.

Also important: cap-exempt H-1B workers can CONCURRENTLY work at cap-subject employers for part-time hours. So you could work at a cap-exempt university AND do part-time consulting at a startup.`,
    likes: 891,
    replies: 34,
    liked: false,
    expertReply: true,
  },
  {
    id: 3,
    author: { name: "Carlos Mendoza", handle: "@carlos_researcher", avatar: "CM", color: "from-green-400 to-emerald-500", verified: false },
    time: "4h ago",
    content: "Does this apply to community colleges as well? I'm a lecturer at a community college and wondering if they can sponsor H-1B.",
    likes: 45,
    replies: 8,
    liked: false,
    expertReply: false,
  },
  {
    id: 4,
    author: { name: "Nadia Islam", handle: "@nadia_nyc", avatar: "NI", color: "from-emerald-400 to-teal-500", verified: true },
    time: "4h ago",
    content: "@carlos_researcher Yes! Community colleges are also cap-exempt as they are institutions of higher education. Your college can file an H-1B petition for you at any time of year without the lottery.",
    likes: 156,
    replies: 3,
    liked: false,
    expertReply: false,
    isAuthorReply: true,
  },
  {
    id: 5,
    author: { name: "Tanvir Rahman", handle: "@tanvir_bd", avatar: "TR", color: "from-purple-400 to-indigo-500", verified: false },
    time: "5h ago",
    content: "Shared this with my university's international student office! Every international student should know this. Thank you for making immigration information accessible 🌟",
    likes: 67,
    replies: 2,
    liked: false,
    expertReply: false,
  },
];

const relatedPosts = [
  { id: 10, author: "Ahmed H.", content: "OPT to H-1B: what to do if your employer doesn't want to sponsor...", likes: 432, time: "1d ago" },
  { id: 11, author: "Priya M.", content: "Top 10 universities that sponsor H-1B for international graduates", likes: 891, time: "3d ago" },
  { id: 12, author: "Carlos R.", content: "My H-1B cap-exempt journey from postdoc to full-time at MIT", likes: 567, time: "1w ago" },
];

function ReplyCard({ reply }: { reply: typeof replies[0]; key?: string | number }) {
  const [liked, setLiked] = useState(reply.liked);
  const [likeCount, setLikeCount] = useState(reply.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(c => liked ? c - 1 : c + 1);
  };

  return (
    <div className={`py-4 border-b border-border ${reply.isAuthorReply ? "bg-blue-50/30" : ""}`}>
      {reply.isAuthorReply && (
        <div className="flex items-center gap-1 text-xs text-primary font-medium mb-2 px-4">
          <CheckCircle className="w-3 h-3" />Author's reply
        </div>
      )}
      <div className="flex gap-3 px-4">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${reply.author.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
            {reply.author.avatar}
          </div>
          <div className="w-0.5 bg-border flex-1 my-2" />
        </div>
        <div className="flex-1 min-w-0 pb-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{reply.author.name}</span>
              {reply.author.verified && (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              {reply.expertReply && (
                <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                  <CheckCircle className="w-3 h-3" />Expert Answer
                </span>
              )}
              <span className="text-xs text-muted-foreground">{reply.author.handle} · {reply.time}</span>
            </div>
            <button className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-3">{reply.content}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
              {likeCount}
            </button>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="w-4 h-4" />
              {reply.replies}
            </button>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-600 transition-colors">
              <Repeat2 className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto">
              <ThumbsUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostDetails() {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReportMenu, setShowReportMenu] = useState(false);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-bold text-foreground text-lg">Post</h1>
        </div>

        {/* Main post */}
        <div className="bg-white border-b border-border">
          {/* Author */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${post.author.color} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
                {post.author.avatar}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-foreground">{post.author.name}</span>
                  {post.author.verified && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{post.author.handle} · {post.author.followers} followers</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-1.5 rounded-full border border-primary text-primary text-sm font-semibold hover:bg-blue-50 transition">
                Follow
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowReportMenu(!showReportMenu)}
                  className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {showReportMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-2xl shadow-lg z-10 w-48 overflow-hidden">
                    {[
                      { icon: Flag, label: "Report post", color: "text-foreground" },
                      { icon: Ban, label: "Block @nadia_nyc", color: "text-red-500" },
                      { icon: Share2, label: "Share post", color: "text-foreground" },
                    ].map(({ icon: Icon, label, color }) => (
                      <button
                        key={label}
                        onClick={() => setShowReportMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary transition-colors text-left"
                      >
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className={color}>{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-3">
            <p className="text-base text-foreground leading-relaxed whitespace-pre-line">{post.content}</p>
          </div>

          {/* Location + Tags */}
          <div className="px-4 pb-3 space-y-2">
            <div className="flex items-center gap-1.5 text-sm text-primary cursor-pointer hover:underline">
              <MapPin className="w-3.5 h-3.5" />
              {post.location}
            </div>
            <div className="flex gap-2 flex-wrap">
              {post.tags.map(t => (
                <span key={t} className="text-sm text-primary cursor-pointer hover:underline">#{t}</span>
              ))}
            </div>
          </div>

          {/* Timestamp */}
          <div className="px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">{post.time}</span>
          </div>

          {/* Stats */}
          <div className="px-4 py-3 border-t border-border flex gap-5">
            <button className="text-sm hover:underline">
              <span className="font-bold text-foreground">{post.reposts.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">Reposts</span>
            </button>
            <button className="text-sm hover:underline">
              <span className="font-bold text-foreground">{(post.likes + (liked ? 1 : 0)).toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">Likes</span>
            </button>
            <button className="text-sm hover:underline">
              <span className="font-bold text-foreground">{post.comments}</span>
              <span className="text-muted-foreground ml-1">Replies</span>
            </button>
            <button className="text-sm hover:underline">
              <span className="font-bold text-foreground">{post.views.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">Views</span>
            </button>
          </div>

          {/* Actions */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-around">
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-secondary">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-emerald-600 transition-colors p-2 rounded-full hover:bg-emerald-50">
              <Repeat2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1.5 transition-colors p-2 rounded-full ${liked ? "text-red-500 hover:bg-red-50" : "text-muted-foreground hover:text-red-500 hover:bg-red-50"}`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} />
            </button>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`flex items-center gap-1.5 transition-colors p-2 rounded-full ${bookmarked ? "text-primary hover:bg-blue-50" : "text-muted-foreground hover:text-primary hover:bg-blue-50"}`}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? "fill-primary" : ""}`} />
            </button>
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-secondary">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reply composer */}
        <div className="bg-white border-b border-border p-4 flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">RA</div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1.5">
              Replying to <span className="text-primary">@nadia_nyc</span>
            </div>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Post your reply..."
              rows={2}
              className="w-full text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
            />
            <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg text-primary hover:bg-secondary transition-colors"><Image className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-lg text-primary hover:bg-secondary transition-colors"><Smile className="w-4 h-4" /></button>
              </div>
              <button
                className="px-4 py-1.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
                disabled={replyText.length === 0}
              >
                Reply
              </button>
            </div>
          </div>
        </div>

        {/* Sort replies */}
        <div className="bg-background px-4 py-2.5 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">{post.comments} Replies</span>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            Sort by: Best <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Expert answer highlight */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2.5 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="text-xs text-emerald-700 font-medium">Highlighted expert reply from Dr. Ravi Kumar, verified immigration specialist</p>
        </div>

        {/* Replies */}
        <div className="bg-white">
          {replies.map(reply => <ReplyCard key={reply.id} reply={reply} />)}
        </div>

        {/* Related posts */}
        <div className="p-4 space-y-3">
          <div className="text-sm font-semibold text-foreground">Related Posts</div>
          {relatedPosts.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-border p-4 hover:shadow-sm transition-all cursor-pointer group">
              <div className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">{r.content}</div>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>{r.author}</span>
                <span>❤️ {r.likes}</span>
                <span>{r.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
