import React, { useState, useRef, useEffect } from "react";
import {
  X, Image, Video, BarChart2, Smile, MapPin, Shield,
  Globe, Users, ChevronDown, Check, Sparkles, AlertTriangle,
  HelpCircle, Zap, Plus, Trash2
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAccountMode } from "../../context/AccountModeContext";

interface TwitterPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostSuccess?: (newPost: any) => void;
}

const QUICK_EMOJIS = ["😊", "🚀", "❤️", "👍", "🎉", "🙏", "💡", "✨", "🔥", "💯", "🤝", "🇧🇩", "🇺🇸"];
const MAX_CHARS = 280;

export function TwitterPostModal({ isOpen, onClose, onPostSuccess }: TwitterPostModalProps) {
  const { t, lang: language } = useLanguage();
  const { user } = useAccountMode();

  // Form states
  const [text, setText] = useState("");
  const [postType, setPostType] = useState<"regular" | "question" | "tip" | "need_help">("regular");
  const [audience, setAudience] = useState<"everyone" | "community" | "local">("everyone");
  const [showAudienceMenu, setShowAudienceMenu] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Attachments
  const [mediaFile, setMediaFile] = useState<{ url: string; type: "image" | "video"; name: string } | null>(null);
  const [locationTag, setLocationTag] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  // Poll
  const [pollActive, setPollActive] = useState(false);
  const [pollChoices, setPollChoices] = useState<string[]>(["", ""]);
  const [pollDays, setPollDays] = useState("1 day");

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith("video/");
      setMediaFile({
        url,
        type: isVideo ? "video" : "image",
        name: file.name,
      });
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const insertEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
    setEmojiPickerOpen(false);
    textareaRef.current?.focus();
  };

  // Poll Choice Handlers
  const handlePollChoiceChange = (index: number, val: string) => {
    const updated = [...pollChoices];
    updated[index] = val;
    setPollChoices(updated);
  };

  const addPollChoice = () => {
    if (pollChoices.length < 4) {
      setPollChoices([...pollChoices, ""]);
    }
  };

  const removePollChoice = (index: number) => {
    if (pollChoices.length > 2) {
      setPollChoices(pollChoices.filter((_, i) => i !== index));
    }
  };

  // Character Counter Calculations
  const charsRemaining = MAX_CHARS - text.length;
  const charPercentage = Math.min(100, (text.length / MAX_CHARS) * 100);
  const isNearLimit = charsRemaining <= 20;
  const isOverLimit = charsRemaining < 0;

  // Progress Circle Color
  const getCircleColor = () => {
    if (isOverLimit) return "#ef4444";
    if (isNearLimit) return "#f59e0b";
    return "#D85A30";
  };

  // Circumference for 20px radius circle: 2 * PI * 10 = ~62.8
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (charPercentage / 100) * circumference;

  // Submit Handler
  const handleSubmit = () => {
    if ((!text.trim() && !mediaFile && !pollActive) || isOverLimit) return;

    const pollData = pollActive && pollChoices.filter(c => c.trim().length > 0).length >= 2
      ? {
          question: text.trim() || "Community Poll",
          options: pollChoices.filter(c => c.trim().length > 0).map(c => ({ label: c, pct: 0 }))
        }
      : undefined;

    const newPost = {
      id: Date.now(),
      type: pollActive ? "poll" : postType,
      author: {
        name: isAnonymous ? "Anonymous Neighbor (বেনামী সদস্য)" : (user?.name || "Rafiq Ahmed"),
        handle: isAnonymous ? "@anonymous_neighbor" : (user?.handle || "@rafiq_ahmed"),
        avatar: isAnonymous ? "🛡️" : "RA",
        color: isAnonymous ? "from-slate-800 to-slate-900" : "from-[#e6653c] to-[#D85A30]",
        verified: !isAnonymous,
      },
      time: "Just now",
      content: text,
      likes: 0,
      comments: 0,
      reposts: 0,
      location: locationTag || undefined,
      image: mediaFile?.type === "image" ? mediaFile.url : undefined,
      video: mediaFile?.type === "video" ? mediaFile.url : undefined,
      poll: pollData,
      communityName: audience === "community" ? "Bangladeshi Immigrants USA" : undefined,
      communityEmoji: audience === "community" ? "🇧🇩" : undefined,
    };

    // Save to localStorage for persistence
    try {
      const existingStr = localStorage.getItem("immigrantconnect_custom_posts");
      const existing = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem("immigrantconnect_custom_posts", JSON.stringify([newPost, ...existing]));
    } catch (e) {
      console.warn("Could not save post to localStorage", e);
    }

    // Dispatch global event so HomeFeed receives it in real-time
    window.dispatchEvent(new CustomEvent("new-post-created", { detail: newPost }));

    if (onPostSuccess) {
      onPostSuccess(newPost);
    }

    // Show temporary confirmation toast
    setToastMessage(language === "bn" ? "পোস্ট সফলভাবে প্রকাশিত হয়েছে!" : "Your post was published!");
    setTimeout(() => {
      setToastMessage(null);
      // Reset form & close
      setText("");
      setMediaFile(null);
      setLocationTag(null);
      setPollActive(false);
      setPollChoices(["", ""]);
      setIsAnonymous(false);
      onClose();
    }, 600);
  };

  const getPlaceholder = () => {
    if (language === "bn") {
      switch (postType) {
        case "question": return "আপনার প্রশ্নটি এখানে লিখুন... সম্প্রদায় সাহায্য করবে";
        case "tip": return "নতুন অভিবাসীদের জন্য একটি সহায়ক টিপস দিন...";
        case "need_help": return "আপনার কী ধরণের সাহায্য প্রয়োজন? (আইনি, চাকরি, বাসা...)";
        default: return "আপনার সম্প্রদায়ে কী ঘটছে? কিছু শেয়ার করুন...";
      }
    }
    switch (postType) {
      case "question": return "Ask the immigrant community a question...";
      case "tip": return "Share a helpful local tip for fellow immigrants...";
      case "need_help": return "What kind of assistance do you need? (Legal, housing, job...)";
      default: return "What is happening in your community?!";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-8 sm:pt-14 px-3 sm:px-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-[600px] overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-200 my-auto"
      >
        {/* Top Header: Close Button + Immigrant Topic Pills + Drafts */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Post Category / Topic Tabs */}
            <div className="flex items-center gap-1">
              {[
                { id: "regular", label: language === "bn" ? "পোস্ট" : "Post", icon: Globe },
                { id: "question", label: language === "bn" ? "প্রশ্ন" : "Question", icon: HelpCircle },
                { id: "tip", label: language === "bn" ? "টিপস" : "Tip", icon: Zap },
                { id: "need_help", label: language === "bn" ? "সাহায্য" : "Help", icon: Users },
              ].map(tab => {
                const Icon = tab.icon;
                const active = postType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPostType(tab.id as any)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-[#D85A30]/15 text-[#8C3015] border border-[#D85A30]/30 shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-[#D85A30]" : "text-slate-500"}`} />
                    <span className="hidden xs:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setText("Draft saved in memory!");
              }}
              className="text-xs font-bold text-[#D85A30] hover:text-[#8C3015] hover:underline px-2 py-1 transition cursor-pointer"
            >
              {language === "bn" ? "ড্রাফটস" : "Drafts"}
            </button>
          </div>
        </div>

        {/* Composer Main Content Area */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            {/* Avatar Column */}
            <div className="flex-shrink-0 pt-0.5">
              {isAnonymous ? (
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-sm" title="Anonymous Profile">
                  🛡️
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e6653c] to-[#D85A30] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  RA
                </div>
              )}
            </div>

            {/* Right Column: Audience Selector + Textarea + Attachments */}
            <div className="flex-1 min-w-0">
              {/* Audience Dropdown (Twitter Style) */}
              <div className="relative inline-block mb-2">
                <button
                  type="button"
                  onClick={() => setShowAudienceMenu(!showAudienceMenu)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#8C3015] bg-[#D85A30]/10 border border-[#D85A30]/25 hover:bg-[#D85A30]/20 transition cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-[#D85A30]" />
                  <span>
                    {audience === "everyone"
                      ? (language === "bn" ? "সকলের জন্য ▾" : "Everyone ▾")
                      : audience === "community"
                      ? (language === "bn" ? "বাংলাদেশী সম্প্রদায় ▾" : "Bangladeshi Community ▾")
                      : (language === "bn" ? "স্থানীয় জ্যাকসন হাইটস ▾" : "Local Jackson Heights ▾")}
                  </span>
                </button>

                {showAudienceMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowAudienceMenu(false)} />
                    <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {language === "bn" ? "কারা এই পোস্ট দেখতে পাবে?" : "Who can view this post?"}
                      </div>
                      {[
                        { id: "everyone", title: "Everyone (Public)", desc: "Anyone on or off ImmigrantConnect", icon: Globe },
                        { id: "community", title: "Bangladeshi USA", desc: "Members of Bangladeshi diaspora", icon: Users },
                        { id: "local", title: "Queens / NYC Local", desc: "Neighbors near Jackson Heights", icon: MapPin },
                      ].map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setAudience(item.id as any);
                            setShowAudienceMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer ${
                            audience === item.id ? "bg-[#D85A30]/10 text-[#8C3015]" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="w-4 h-4 text-[#D85A30]" />
                            <div>
                              <div className="text-xs font-bold">{item.title}</div>
                              <div className="text-[10px] text-slate-500">{item.desc}</div>
                            </div>
                          </div>
                          {audience === item.id && <Check className="w-4 h-4 text-[#D85A30]" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full text-base sm:text-lg text-slate-900 placeholder:text-slate-400 resize-none border-none outline-none focus:outline-none focus:ring-0 min-h-[110px] sm:min-h-[130px] p-0 bg-transparent leading-relaxed"
                rows={3}
              />

              {/* Immigrant Privacy Shield Active Banner */}
              {isAnonymous && (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-900 text-slate-100 text-xs mt-2 border border-slate-800 shadow-sm animate-in fade-in">
                  <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-emerald-400">
                      {language === "bn" ? "বেনামী অভিবাসী সুরক্ষা সক্রিয়" : "Immigrant Privacy Shield Active"}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5 leading-normal">
                      {language === "bn"
                        ? "আপনার আসল নাম, ছবি এবং প্রোফাইল সম্পূর্ণ গোপন থাকবে। এটি 'বেনামী সদস্য' হিসেবে প্রদর্শিত হবে।"
                        : "Your real name, profile photo, and identity are hidden from public view to protect against retaliation and harassment."}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
                    title="Disable Anonymous"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Location Tag Chip (if active) */}
              {locationTag && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-full text-xs font-semibold mt-2 animate-in fade-in">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{locationTag}</span>
                  <button
                    type="button"
                    onClick={() => setLocationTag(null)}
                    className="hover:text-red-600 ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Media Preview Box */}
              {mediaFile && (
                <div className="relative mt-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 group">
                  {mediaFile.type === "image" ? (
                    <img src={mediaFile.url} alt="Media preview" className="w-full max-h-72 object-cover" />
                  ) : (
                    <video src={mediaFile.url} controls className="w-full max-h-72 object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-red-600 text-white transition-colors shadow-md cursor-pointer"
                    title="Remove media"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Poll Builder (Twitter Style) */}
              {pollActive && (
                <div className="mt-3 p-3.5 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1 border-b border-slate-200">
                    <span className="flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-[#D85A30]" />
                      {language === "bn" ? "পোল তৈরি করুন" : "Create a Community Poll"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPollActive(false)}
                      className="text-red-500 hover:text-red-700 hover:underline font-semibold cursor-pointer"
                    >
                      {language === "bn" ? "পোল বাতিল" : "Remove poll"}
                    </button>
                  </div>

                  {pollChoices.map((choice, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={choice}
                          onChange={(e) => handlePollChoiceChange(idx, e.target.value)}
                          placeholder={`${language === "bn" ? "বিকল্প" : "Choice"} ${idx + 1}`}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#D85A30] transition"
                        />
                        <span className="absolute right-3 top-2.5 text-[10px] text-slate-400">
                          {25 - choice.length}
                        </span>
                      </div>
                      {pollChoices.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollChoice(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                          title="Remove option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {pollChoices.length < 4 && (
                    <button
                      type="button"
                      onClick={addPollChoice}
                      className="text-xs font-bold text-[#D85A30] hover:text-[#8C3015] flex items-center gap-1 transition py-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === "bn" ? "+ আরেকটি বিকল্প যোগ করুন" : "+ Add another choice"}</span>
                    </button>
                  )}

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                    <span>{language === "bn" ? "পোলের সময়সীমা:" : "Poll length:"}</span>
                    <select
                      value={pollDays}
                      onChange={(e) => setPollDays(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-none focus:border-[#D85A30] cursor-pointer"
                    >
                      <option value="1 day">1 day</option>
                      <option value="3 days">3 days</option>
                      <option value="7 days">7 days</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />

          {/* Location Picker Popover (Queens & NYC Spots) */}
          {showLocationPicker && (
            <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in">
              <div className="text-xs font-bold text-slate-700 mb-1.5 px-1">
                {language === "bn" ? "জনপ্রিয় অভিবাসী এলাকা সিলেক্ট করুন:" : "Select Immigrant Hub / Location:"}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Jackson Heights, Queens, NY",
                  "Jamaica, Queens, NY",
                  "Parkchester, Bronx, NY",
                  "Astoria, Queens, NY",
                  "Kensington, Brooklyn, NY",
                  "Paterson, NJ",
                ].map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setLocationTag(loc);
                      setShowLocationPicker(false);
                    }}
                    className="px-2.5 py-1 rounded-full text-xs bg-white border border-slate-200 text-slate-700 hover:bg-[#D85A30]/10 hover:border-[#D85A30]/30 hover:text-[#8C3015] transition cursor-pointer"
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* "Everyone can reply" row (Twitter signature) */}
          <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-slate-100 text-xs font-semibold text-[#D85A30] select-none cursor-pointer group">
            <Globe className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            <span>{language === "bn" ? "সকলেই উত্তর দিতে পারবে" : "Everyone can reply"}</span>
          </div>

          {/* Bottom Action Bar (Twitter Style) */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
            {/* Left Icons: Media, Poll, Emoji, Location, Anonymous Shield */}
            <div className="flex items-center gap-0.5 sm:gap-1 text-slate-600 relative">
              {/* Media Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-[#8C3015] hover:bg-[#D85A30]/10 transition-colors cursor-pointer"
                title="Add Photos or Video"
              >
                <Image className="w-5 h-5 text-[#D85A30]" />
              </button>

              {/* Poll Button */}
              <button
                type="button"
                onClick={() => setPollActive(!pollActive)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  pollActive ? "bg-[#D85A30]/15 text-[#8C3015]" : "text-slate-600 hover:text-[#8C3015] hover:bg-[#D85A30]/10"
                }`}
                title="Create a Poll"
              >
                <BarChart2 className="w-5 h-5 text-[#D85A30]" />
              </button>

              {/* Emoji Picker Button & Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-[#8C3015] hover:bg-[#D85A30]/10 transition-colors cursor-pointer"
                  title="Add Emoji"
                >
                  <Smile className="w-5 h-5 text-[#D85A30]" />
                </button>

                {emojiPickerOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setEmojiPickerOpen(false)} />
                    <div className="absolute left-0 bottom-11 z-40 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 flex items-center gap-1 sm:gap-1.5 animate-in fade-in zoom-in-95">
                      {QUICK_EMOJIS.map(emo => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => insertEmoji(emo)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl hover:bg-[#D85A30]/10 flex items-center justify-center text-base sm:text-lg transition-transform hover:scale-125 cursor-pointer"
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Location Button */}
              <button
                type="button"
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  locationTag ? "bg-amber-100 text-amber-800" : "text-slate-600 hover:text-[#8C3015] hover:bg-[#D85A30]/10"
                }`}
                title="Tag Location"
              >
                <MapPin className="w-5 h-5 text-[#D85A30]" />
              </button>

              {/* Immigrant Anonymous Shield Toggle */}
              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isAnonymous
                    ? "bg-slate-900 text-emerald-400 shadow-xs border border-slate-700"
                    : "text-slate-600 hover:text-[#8C3015] hover:bg-[#D85A30]/10"
                }`}
                title="Post Anonymously (Hide your identity for safety)"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="hidden sm:inline">
                  {isAnonymous
                    ? (language === "bn" ? "বেনামী ✓" : "Anonymous ✓")
                    : (language === "bn" ? "বেনামী" : "Anonymous")}
                </span>
              </button>
            </div>

            {/* Right: Circular Progress Meter + Divider + Post Button */}
            <div className="flex items-center gap-3">
              {/* Circular Progress Ring (Twitter Style) */}
              {text.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="relative w-7 h-7 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 24 24">
                      {/* Background circle */}
                      <circle
                        cx="12"
                        cy="12"
                        r={radius}
                        stroke="#e2e8f0"
                        strokeWidth="2.5"
                        fill="none"
                      />
                      {/* Progress filling circle */}
                      <circle
                        cx="12"
                        cy="12"
                        r={radius}
                        stroke={getCircleColor()}
                        strokeWidth="2.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-150"
                      />
                    </svg>
                  </div>

                  {/* Near limit character number display */}
                  {isNearLimit && (
                    <span className={`text-xs font-bold ${isOverLimit ? "text-red-500" : "text-amber-500"}`}>
                      {charsRemaining}
                    </span>
                  )}
                </div>
              )}

              {/* Vertical separator */}
              <div className="w-px h-6 bg-slate-200" />

              {/* Twitter-style Post Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={(!text.trim() && !mediaFile && !pollActive) || isOverLimit}
                className="px-5 py-2 rounded-full font-bold text-white text-sm shadow-sm hover:shadow-md transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)",
                }}
              >
                {t("post_btn") || (language === "bn" ? "পোস্ট করুন" : "Post")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Twitter-style bottom confirmation toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-60 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-[#e6653c]" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
