import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  ArrowLeft, Heart, MessageCircle, Repeat2, Share2, Bookmark, MoreHorizontal,
  MapPin, Image, Flag, Ban, ThumbsUp, ChevronDown, User, Smile, Send, X
} from "lucide-react";

import { GoldenBadge } from "../components/ui/GoldenBadge";

const post = {
  id: 1,
  author: { name: "Nadia Islam", handle: "@nadia_nyc", avatar: "NI", color: "from-emerald-400 to-teal-500", verified: true, bio: "Immigration Attorney | Helping immigrants navigate the US system" },
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

interface ReplyItem {
  id: number;
  author: { name: string; handle: string; verified?: boolean };
  time: string;
  content: string;
  likes: number;
  liked?: boolean;
  image?: string;
}

const initialReplies: ReplyItem[] = [
  {
    id: 1,
    author: { name: "Priya Sharma", handle: "@priya_nyc", verified: false },
    time: "2h",
    content: "This is SO helpful! I'm currently on F-1 OPT and didn't realize MIT Lincoln Laboratory was cap-exempt. Just applied! Thank you Nadia 🙏",
    likes: 234,
    liked: true,
  },
  {
    id: 2,
    author: { name: "Dr. Ravi Kumar", handle: "@dr_ravi_md", verified: true },
    time: "3h",
    content: `Great point Nadia! To add some detail — for a nonprofit to qualify as cap-exempt, it must be affiliated with or related to a university. The key test is an "affiliation agreement" between the nonprofit and the university.

Also important: cap-exempt H-1B workers can CONCURRENTLY work at cap-subject employers for part-time hours. So you could work at a cap-exempt university AND do part-time consulting at a startup.`,
    likes: 891,
    liked: false,
  },
  {
    id: 3,
    author: { name: "Carlos Mendoza", handle: "@carlos_researcher", verified: false },
    time: "4h",
    content: "Does this apply to community colleges as well? I'm a lecturer at a community college and wondering if they can sponsor H-1B.",
    likes: 45,
    liked: false,
  },
  {
    id: 4,
    author: { name: "Nadia Islam", handle: "@nadia_nyc", verified: true },
    time: "4h",
    content: "Yes! Community colleges are also cap-exempt as they are institutions of higher education. Your college can file an H-1B petition for you at any time of year without the lottery.",
    likes: 156,
    liked: false,
  },
  {
    id: 5,
    author: { name: "Tanvir Rahman", handle: "@tanvir_bd", verified: false },
    time: "5h",
    content: "Shared this with my university's international student office! Every international student should know this. Thank you for making immigration information accessible 🌟",
    likes: 67,
    liked: false,
  },
];



const QUICK_EMOJIS = ["👍", "❤️", "🔥", "🎉", "👏", "🙌", "😊", "💡"];

function FacebookCommentCard({
  reply,
  onReplyClick,
}: {
  reply: ReplyItem;
  onReplyClick?: (name: string) => void;
  key?: string | number;
}) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(reply.liked || false);
  const [likeCount, setLikeCount] = useState(reply.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(c => liked ? c - 1 : c + 1);
  };

  return (
    <div className="flex gap-2.5 sm:gap-3 py-3 px-4 group hover:bg-slate-50/60 transition-colors">
      {/* User Avatar */}
      <div
        onClick={() => navigate(`/profile/${reply.author.handle.replace('@', '')}`)}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs cursor-pointer hover:opacity-85 mt-0.5"
        title={`View ${reply.author.name}'s Profile`}
      >
        <User className="w-5 h-5 text-slate-500" />
      </div>

      {/* Facebook Comment Bubble & Actions */}
      <div className="flex-1 min-w-0">
        {/* Comment Bubble */}
        <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl px-3.5 py-2.5 inline-block max-w-full shadow-2xs border border-slate-200/50">
          <div
            onClick={() => navigate(`/profile/${reply.author.handle.replace('@', '')}`)}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-85"
          >
            <span className="text-xs sm:text-sm font-bold text-slate-900 hover:underline">{reply.author.name}</span>
            {reply.author.verified && (
              <GoldenBadge size={13} title="Verified Member" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line mt-1 font-normal">
            {reply.content}
          </p>
          {reply.image && (
            <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-white max-h-48">
              <img src={reply.image} alt="Comment attachment" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Facebook-style Micro-actions below bubble */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 pl-2">
          <span className="text-[11px] text-slate-400 font-normal">{reply.time}</span>
          <button
            onClick={handleLike}
            className={`text-[11px] font-semibold transition-colors cursor-pointer ${
              liked ? "text-[#C04A22]" : "text-slate-600 hover:underline"
            }`}
          >
            Like
          </button>
          <button
            onClick={() => onReplyClick?.(reply.author.name)}
            className="text-[11px] font-semibold text-slate-600 hover:underline cursor-pointer"
          >
            Reply
          </button>

          {/* Floating Reaction Pill */}
          {likeCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-200/90 shadow-2xs rounded-full px-2 py-0.5 ml-auto">
              <span className="text-rose-500 text-[11px]">❤️</span> {likeCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function PostDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentList, setCommentList] = useState<ReplyItem[]>(initialReplies);
  const [replyText, setReplyText] = useState("");
  const [commentMedia, setCommentMedia] = useState<string | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const focusComment = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
      commentInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    if (searchParams.get("focus") === "comment") {
      setTimeout(focusComment, 300);
    }
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCommentMedia(url);
    }
  };

  const handleAddComment = () => {
    if (!replyText.trim() && !commentMedia) return;
    const newComment: ReplyItem = {
      id: Date.now(),
      author: {
        name: "Rafiq Ahmed",
        handle: "@rafiq_ahmed",
        verified: true,
      },
      time: "Just now",
      content: replyText,
      likes: 0,
      liked: false,
      image: commentMedia || undefined,
    };
    setCommentList([newComment, ...commentList]);
    setReplyText("");
    setCommentMedia(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-bold text-foreground text-lg">Post</h1>
        </div>

        {/* Main post with full-width responsive layout */}
        <div className="bg-white border-b border-border p-4 sm:p-5">
          {/* Top Row: Author Avatar + Name & Follow (Vertically Centered) */}
          <div className="flex items-center justify-between">
            <div
              onClick={() => navigate(`/profile/${post.author.handle.replace('@', '')}`)}
              className="flex items-center gap-3 min-w-0 cursor-pointer group"
              title={`View ${post.author.name}'s Profile`}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs group-hover:opacity-85 transition">
                <User className="w-6 h-6 text-slate-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-slate-900 group-hover:underline truncate">{post.author.name}</span>
                  {post.author.verified && (
                    <GoldenBadge size={16} title="Verified Account" />
                  )}
                </div>
                <div className="text-xs text-slate-500">{post.author.handle}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className="px-4 py-1.5 rounded-full border border-[#C04A22]/40 text-[#8C3015] hover:bg-[#C04A22]/10 bg-transparent text-xs font-bold transition cursor-pointer"
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowReportMenu(!showReportMenu)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
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
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 transition-colors text-left cursor-pointer"
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

          {/* Post Content: Starts full-width from below the logo with clean left alignment */}
          <p className="text-sm sm:text-base text-slate-900 leading-relaxed whitespace-pre-line text-left mt-3.5 font-normal">
            {post.content}
          </p>

          {/* Location + Tags in brand coral color without background */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#C04A22] font-medium cursor-pointer hover:underline">
              <MapPin className="w-3.5 h-3.5 text-[#C04A22]" />
              {post.location}
            </div>
            <div className="flex gap-2 flex-wrap">
              {post.tags.map(t => (
                <span key={t} className="text-xs sm:text-sm text-[#C04A22] font-medium cursor-pointer hover:underline">#{t}</span>
              ))}
            </div>
          </div>

              {/* Timestamp */}
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                {post.time}
              </div>

              {/* Actions with inline counts matching Twitter / Facebook */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-slate-500 max-w-md">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-1.5 transition-colors p-1.5 sm:p-2 rounded-full cursor-pointer ${
                    liked ? "text-rose-600 hover:bg-rose-50" : "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                  }`}
                  title="Like"
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${liked ? "fill-rose-600 text-rose-600" : ""}`} />
                  <span className="text-xs sm:text-sm font-semibold">{(post.likes + (liked ? 1 : 0)).toLocaleString()}</span>
                </button>

                <button
                  onClick={focusComment}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-[#C04A22] transition-colors p-1.5 sm:p-2 rounded-full hover:bg-[#C04A22]/10 cursor-pointer"
                  title="Comment"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-semibold">{commentList.length}</span>
                </button>

                <button
                  className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-emerald-50 cursor-pointer"
                  title="Repost"
                >
                  <Repeat2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-semibold">{post.reposts.toLocaleString()}</span>
                </button>

                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`flex items-center gap-1.5 transition-colors p-1.5 sm:p-2 rounded-full cursor-pointer ${
                    bookmarked ? "text-[#C04A22] hover:bg-[#C04A22]/10" : "text-slate-500 hover:text-[#C04A22] hover:bg-[#C04A22]/10"
                  }`}
                  title="Bookmark"
                >
                  <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${bookmarked ? "fill-[#C04A22] text-[#C04A22]" : ""}`} />
                </button>

                <button
                  className="flex items-center gap-1.5 text-slate-500 hover:text-[#C04A22] transition-colors p-1.5 sm:p-2 rounded-full hover:bg-slate-100 cursor-pointer"
                  title="Share"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

        {/* Facebook-style Comment Input Box */}
        <div className="bg-white border-b border-border p-3.5 sm:p-4">
          <div className="flex gap-2.5 sm:gap-3 items-start">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs mt-0.5">
              <User className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0 bg-slate-100 hover:bg-slate-100/90 focus-within:bg-white focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-[#C04A22]/15 rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 transition-all">
              <textarea
                ref={commentInputRef}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                placeholder="Write a comment..."
                rows={1}
                className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-none resize-none leading-relaxed min-h-[36px]"
              />

              {/* Media Preview Box if image is attached */}
              {commentMedia && (
                <div className="relative my-2 rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-950">
                  <img src={commentMedia} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCommentMedia(null)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-1 relative">
                <div className="flex items-center gap-1 text-[#C04A22]">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 hover:bg-[#C04A22]/10 rounded-xl transition cursor-pointer text-[#C04A22]"
                    title="Attach Photo"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                      className="p-1.5 hover:bg-[#C04A22]/10 rounded-xl transition cursor-pointer text-[#C04A22]"
                      title="Insert Emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    {emojiPickerOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setEmojiPickerOpen(false)} />
                        <div className="absolute left-0 bottom-9 z-40 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150">
                          {QUICK_EMOJIS.map(emo => (
                            <button
                              key={emo}
                              type="button"
                              onClick={() => {
                                setReplyText(prev => prev + emo);
                                setEmojiPickerOpen(false);
                              }}
                              className="w-7 h-7 rounded-xl hover:bg-[#C04A22]/10 flex items-center justify-center text-base transition-transform hover:scale-125 cursor-pointer"
                            >
                              {emo}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!replyText.trim() && !commentMedia}
                  className={`p-1.5 sm:px-3.5 sm:py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    replyText.trim() || commentMedia
                      ? "bg-[#C04A22] text-white hover:bg-[#8C3015] active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Header Bar */}
        <div className="bg-slate-50/70 px-4 py-2.5 border-b border-border flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Comments ({commentList.length})</span>
          <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer">
            Most relevant <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Facebook-style Comment List */}
        <div className="bg-white divide-y divide-slate-100/80">
          {commentList.map(reply => (
            <FacebookCommentCard
              key={reply.id}
              reply={reply}
              onReplyClick={(authorName) => {
                setReplyText(`@${authorName} `);
                focusComment();
              }}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
