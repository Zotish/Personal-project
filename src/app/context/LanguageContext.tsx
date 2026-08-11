import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "bn";

const STORAGE_KEY = "ic_lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === "bn" ? "bn" : "en") as Lang;
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: string): string => {
    const map = translations[lang];
    return map[key] ?? translations.en[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

// ─── Translation Strings ───────────────────────────────────────────────────────

type TranslationMap = Record<string, string>;

const en: TranslationMap = {
  // ── Navigation ──
  home: "Home",
  search: "Search",
  map: "Map",
  services: "Services",
  reels: "Reels",
  more: "More",
  communities: "Communities",
  messages: "Messages",
  notifications: "Notifications",
  profile: "Profile",
  saved: "Saved",
  qa: "Q&A",
  settings: "Settings",
  admin: "Admin",

  // ── HomeFeed tabs ──
  tab_foryou: "For You",
  tab_following: "Following",
  tab_map: "Map",
  tab_local: "Local",

  // ── PostComposer ──
  post_type_question: "Ask",
  post_type_tip: "Tip",
  post_type_need_help: "Need Help",
  post_placeholder_default: "What's happening in your community?",
  post_placeholder_question: "Ask the community something...",
  post_placeholder_tip: "Share a helpful local tip...",
  post_placeholder_need_help: "Describe what help you need...",
  post_btn: "Post",

  // ── Post labels ──
  label_emergency: "Emergency Alert",
  label_question: "Ask the Community",
  label_tip: "Local Tip",
  label_need_help: "Need Help",
  label_announcement: "Community Announcement",
  label_achievement: "Milestone",
  label_poll: "Community Poll",

  // ── Post actions ──
  action_comment: "Comment",
  action_repost: "Repost",
  action_share: "Share",
  action_bookmark: "Save",

  // ── Widgets ──
  widget_who_to_follow: "Who to Follow",
  widget_near_you: "Near You",
  widget_view_map: "View map",
  widget_follow: "Follow",
  widget_interested: "Interested 🙋",
  widget_see_more: "See more suggestions →",
  widget_view_map_arrow: "View map →",

  // ── Quick Access ──
  qa_box_title: "Quick Access",
  qa_box_subtitle: "Tap to visit · tap again to pin/unpin",
  qa_box_pinned: "Pinned",
  qa_box_all: "All Features",
  qa_box_add: "Add Shortcuts",
  qa_box_all_pinned: "All features pinned!",

  // ── Calendar ──
  cal_has_events: "Has events",
  cal_today: "Today",
  cal_no_events: "No events on this day",
  cal_no_events_hint: "Dates with a blue dot have community events.",
  cal_back: "Back to Feed",

  // ── Empty states ──
  empty_following: "No following yet",
  empty_following_sub: "Follow people to see their posts here",
  empty_local: "No local posts yet",
  empty_local_sub: "Posts from your area will appear here",

  // ── Following banner ──
  following_banner: "Showing latest posts from the 6 people you follow",

  // ── Weather ──
  weather_feels: "Feels like",
  weather_wind: "Wind",
  weather_humidity: "Humidity",
  weather_high: "High",
  weather_low: "Low",
  weather_loading: "Loading weather...",
  weather_locating: "Locating...",
  weather_error: "Could not load weather",
  weather_allow: "Allow location",

  // ── Language picker ──
  switch_language: "Switch Language",
  lang_en: "English",
  lang_bn: "বাংলা",
};

const bn: TranslationMap = {
  // ── Navigation ──
  home: "হোম",
  search: "খোঁজুন",
  map: "মানচিত্র",
  services: "সেবা",
  reels: "রিলস",
  more: "আরও",
  communities: "কমিউনিটি",
  messages: "বার্তা",
  notifications: "বিজ্ঞপ্তি",
  profile: "প্রোফাইল",
  saved: "সংরক্ষিত",
  qa: "প্রশ্নোত্তর",
  settings: "সেটিংস",
  admin: "অ্যাডমিন",

  // ── HomeFeed tabs ──
  tab_foryou: "আপনার জন্য",
  tab_following: "অনুসরণ",
  tab_map: "ম্যাপস",
  tab_local: "স্থানীয়",

  // ── PostComposer ──
  post_type_question: "জিজ্ঞেস",
  post_type_tip: "টিপস",
  post_type_need_help: "সাহায্য",
  post_placeholder_default: "আপনার কমিউনিটিতে কী হচ্ছে?",
  post_placeholder_question: "কমিউনিটিকে কিছু জিজ্ঞেস করুন...",
  post_placeholder_tip: "একটি স্থানীয় টিপস শেয়ার করুন...",
  post_placeholder_need_help: "আপনার কী সাহায্য দরকার বলুন...",
  post_btn: "পোস্ট করুন",

  // ── Post labels ──
  label_emergency: "জরুরি বিজ্ঞপ্তি",
  label_question: "কমিউনিটিকে জিজ্ঞেস করুন",
  label_tip: "স্থানীয় টিপস",
  label_need_help: "সাহায্য দরকার",
  label_announcement: "কমিউনিটি ঘোষণা",
  label_achievement: "মাইলফলক",
  label_poll: "কমিউনিটি ভোট",

  // ── Post actions ──
  action_comment: "মন্তব্য",
  action_repost: "রিপোস্ট",
  action_share: "শেয়ার",
  action_bookmark: "সংরক্ষণ",

  // ── Widgets ──
  widget_who_to_follow: "অনুসরণ করুন",
  widget_near_you: "কাছাকাছি",
  widget_view_map: "মানচিত্র দেখুন",
  widget_follow: "অনুসরণ",
  widget_interested: "আগ্রহী 🙋",
  widget_see_more: "আরও পরামর্শ দেখুন →",
  widget_view_map_arrow: "মানচিত্র দেখুন →",

  // ── Quick Access ──
  qa_box_title: "দ্রুত অ্যাক্সেস",
  qa_box_subtitle: "ট্যাপ করুন · আবার ট্যাপ করে পিন/আনপিন করুন",
  qa_box_pinned: "পিন করা",
  qa_box_all: "সব ফিচার",
  qa_box_add: "শর্টকাট যোগ করুন",
  qa_box_all_pinned: "সব ফিচার পিন করা!",

  // ── Calendar ──
  cal_has_events: "ইভেন্ট আছে",
  cal_today: "আজ",
  cal_no_events: "এই দিনে কোনো ইভেন্ট নেই",
  cal_no_events_hint: "নীল বিন্দু সহ তারিখে কমিউনিটি ইভেন্ট আছে।",
  cal_back: "ফিডে ফিরুন",

  // ── Empty states ──
  empty_following: "এখনও কাউকে অনুসরণ করেননি",
  empty_following_sub: "পোস্ট দেখতে মানুষদের অনুসরণ করুন",
  empty_local: "এখনও কোনো স্থানীয় পোস্ট নেই",
  empty_local_sub: "আপনার এলাকার পোস্ট এখানে দেখাবে",

  // ── Following banner ──
  following_banner: "আপনি যে ৬ জনকে অনুসরণ করেন তাদের সর্বশেষ পোস্ট দেখাচ্ছে",

  // ── Weather ──
  weather_feels: "অনুভূতি",
  weather_wind: "বাতাস",
  weather_humidity: "আর্দ্রতা",
  weather_high: "সর্বোচ্চ",
  weather_low: "সর্বনিম্ন",
  weather_loading: "আবহাওয়া লোড হচ্ছে...",
  weather_locating: "অবস্থান খোঁজা হচ্ছে...",
  weather_error: "আবহাওয়া লোড করা যায়নি",
  weather_allow: "অবস্থান অনুমতি দিন",

  // ── Language picker ──
  switch_language: "ভাষা পরিবর্তন",
  lang_en: "English",
  lang_bn: "বাংলা",
};

const translations: Record<Lang, TranslationMap> = { en, bn };
