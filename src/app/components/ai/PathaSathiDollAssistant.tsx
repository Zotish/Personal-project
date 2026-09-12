import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Send,
  X,
  Sparkles,
  MapPin,
  ArrowRight,
  RotateCcw,
  ExternalLink,
  Compass,
  Navigation,
  Building2,
  CheckCircle2,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { places, Place } from "../../pages/MapDiscovery";
import { useLanguage } from "../../context/LanguageContext";

// ── App Navigation Targets (Every Page, Service & Feature) ────────────────────
export interface NavigationTarget {
  id: string;
  name: string;
  emoji: string;
  route: string;
  description: string;
  keywords: string[];
  isAction?: boolean;
  actionEvent?: string;
  actionPayload?: any;
}

export const APP_NAVIGATION_TARGETS: NavigationTarget[] = [
  // ── Header & Main Tabs (Exact UI Screenshot Icons) ──
  {
    id: "header_menu",
    name: "মেন্যু ও অপশন (More Menu / ≡)",
    emoji: "☰",
    route: "/more",
    description: "প্রধান মেন্যু বার ও সাইডবার",
    isAction: true,
    actionEvent: "open-smart-sidebar",
    keywords: [
      "menu", "more", "more menu", "hamburger", "3 lines", "3 line", "three lines", "sidebar", "nav", "options",
      "মেনু", "মেন্যু", "তিন দাগ", "৩ দাগ", "মেনু বার", "সাইডবার", "অপশন", "মোর মেনু", "মোর"
    ]
  },
  {
    id: "header_logo",
    name: "পথসাথী হোম (Pathasathi Home)",
    emoji: "🏠",
    route: "/feed",
    description: "পথসাথী লোগো ও মূল হোম ফিড",
    keywords: [
      "pathasathi", "pathashathi", "pathasathi logo", "logo", "brand", "home", "feed",
      "পথসাথী", "লোগো", "হোম", "ফিড", "হোম পেজ", "প্রথম পাতা"
    ]
  },
  {
    id: "weather",
    name: "আবহাওয়া ও তাপমাত্রা (Weather / 🌡️)",
    emoji: "🌡️",
    route: "/feed?open=weather",
    description: "লাইভ আবহাওয়া ও তাপমাত্রা পপআপ",
    isAction: true,
    actionEvent: "open-weather-modal",
    keywords: [
      "thermometer", "weather", "temperature", "temp", "celsius", "fahrenheit", "forecast", "climate", "abohawa", "tapmatra", "tharmomitar", "abohaoa",
      "থার্মোমিটার", "আবহাওয়া", "আবহাওয়া", "তাপমাত্রা", "ওয়েদার", "ঠান্ডা", "গরম", "বৃষ্টি", "আজকের আবহাওয়া", "থার্মোমিটার আইকন", "ওয়েদার"
    ]
  },
  {
    id: "tab_star",
    name: "ফর ইউ ও স্টার ট্যাব (For You / ⭐)",
    emoji: "⭐",
    route: "/feed?tab=for-you",
    description: "স্টার আইকন ও আপনার পছন্দের পোস্টসমূহ",
    isAction: true,
    actionEvent: "select-feed-tab",
    actionPayload: { tab: "for-you" },
    keywords: [
      "star", "star icon", "for you", "foryou", "favorites", "taraka", "tara", "featured", "recommended",
      "স্টার", "স্টার আইকন", "তারা", "তারা আইকন", "ফর ইউ", "ফেভারিট", "প্রথম ট্যাব", "পছন্দের"
    ]
  },
  {
    id: "tab_mybox",
    name: "মাইবক্স ও কুইক অ্যাক্সেস (MyBox / 📦 Cube)",
    emoji: "📦",
    route: "/feed?open=box",
    description: "৩ডি বক্স আইকন, শর্টকাট ও ড্রয়ার",
    isAction: true,
    actionEvent: "open-mybox-drawer",
    keywords: [
      "box", "box icon", "cube", "cube icon", "3d box", "mybox", "my box", "quick access", "shortcuts", "cube box",
      "বক্স", "বক্স আইকন", "বাক্স", "কিউব", "কিউব আইকন", "মাইবক্স", "মাই বক্স", "কুইক এক্সেস", "বক্স ট্যাব", "দ্বিতীয় ট্যাব"
    ]
  },
  {
    id: "tab_post",
    name: "পোস্ট তৈরি ও কলম আইকন (Create Post / 📝)",
    emoji: "✍️",
    route: "/feed?open=post",
    description: "কলম আইকন ও নতুন পোস্ট ক্রিয়েটর",
    isAction: true,
    actionEvent: "open-post-composer",
    keywords: [
      "pen", "pen icon", "pencil", "pencil icon", "post", "post icon", "squarepen", "notepad", "write", "compose", "status", "kolom", "likhbo", "post box",
      "পেন", "পেন আইকন", "কলম", "কলম আইকন", "পেন্সিল", "পোস্ট", "পোস্ট আইকন", "লেখা", "নতুন পোস্ট", "পোস্ট তৈরি", "খাতা কলম", "পোস্ট বক্স", "স্ট্যাটাস"
    ]
  },
  {
    id: "tab_calendar",
    name: "ক্যালেন্ডার ও ইভেন্ট (Calendar / 📅)",
    emoji: "📅",
    route: "/feed?open=calendar",
    description: "ক্যালেন্ডার আইকন, তারিখ ও শিডিউল",
    isAction: true,
    actionEvent: "open-calendar-modal",
    keywords: [
      "calendar", "calendar icon", "date", "tarikh", "schedule", "events", "event", "today", "somoy", "kalendar",
      "ক্যালেন্ডার", "ক্যালেন্ডার আইকন", "তারিখ", "তারিখ আইকন", "ইভেন্ট", "ইভেন্টস", "দিন", "দিনপঞ্জি", "সিডিউল", "ক্যালেন্ডার দেখাও"
    ]
  },
  {
    id: "tab_apps_grid",
    name: "অ্যাপস ও ৪ বক্স গ্রিড (Apps & Tools / 㗊)",
    emoji: "㗊",
    route: "/feed?tab=local",
    description: "৪ বক্স গ্রিড আইকন ও সকল টুলস",
    isAction: true,
    actionEvent: "open-smart-sidebar",
    keywords: [
      "4 box", "four box", "4 boxes", "4ta box", "grid", "grid icon", "layout grid", "apps", "tools", "smart sidebar", "local", "char box", "charta ghor", "charta box",
      "৪ বক্স", "চার বক্স", "৪টা বক্স", "চারটা ঘর", "গ্রিড", "গ্রিড আইকন", "অ্যাপস", "টুলস", "লোকাল", "চার কোনা", "চারটি বক্স", "অ্যাপস গ্রিড", "পঞ্চম ট্যাব"
    ]
  },
  {
    id: "feed",
    name: "হোম ফিড (Home Feed)",
    emoji: "🏠",
    route: "/feed",
    description: "প্রধান হোম ফিড ও সর্বশেষ পোস্ট",
    keywords: [
      "home", "feed", "newsfeed", "post", "posts", "wall", "community feed", "start", "main page",
      "হোম", "ফিড", "পোস্ট", "প্রধান পাতা", "প্রথম পাতা", "শুরু", "পোস্টসমূহ",
      "home feed", "notun post", "feed dekhao", "home page"
    ]
  },
  {
    id: "post_create",
    name: "নতুন পোস্ট তৈরি (Create Post)",
    emoji: "✍️",
    route: "/feed?open=post",
    description: "নতুন স্ট্যাটাস বা পোস্ট লিখুন",
    isAction: true,
    actionEvent: "open-post-composer",
    keywords: [
      "post", "new post", "create post", "write post", "post modal", "write", "compose", "tweet",
      "পোস্ট তৈরি", "নতুন পোস্ট", "পোস্ট লিখব", "পোস্ট করব", "স্ট্যাটাস", "লেখা",
      "notun post", "post korbo", "post likhbo", "post open", "create post", "post box"
    ]
  },
  {
    id: "services_hub",
    name: "সকল সার্ভিস হাব (Services Hub)",
    emoji: "🧰",
    route: "/services",
    description: "সকল সেবার ডিরেক্টরি ও হাব",
    keywords: [
      "services", "service", "hub", "directory", "all services", "service list",
      "সব সেবা", "সার্ভিস", "সেবা", "সেবাসমূহ", "ডিরেক্টরি", "সার্ভিস হাব",
      "service hub", "sob seba", "seba", "services koi", "seba shohayota", "all service"
    ]
  },
  {
    id: "jobs",
    name: "চাকরি ও ক্যারিয়ার (Jobs)",
    emoji: "💼",
    route: "/services/jobs",
    description: "নতুন চাকরির নিয়োগ ও কর্মসংস্থান",
    keywords: [
      "job", "jobs", "career", "careers", "work", "employment", "hiring", "salary", "full time", "part time", "find job", "looking for job", "vacancy",
      "চাকরি", "কাজ", "কর্মসংস্থান", "নিয়োগ", "বেতন", "ক্যারিয়ার", "কাজ চাই", "চাকরি দরকার", "কাম", "ফুল টাইম", "পার্ট টাইম", "ডেলিভারি কাজ", "চাকরির খবর",
      "chakri", "chakrir", "chakri khujchi", "chakri chai", "chakri lagbe", "sakri", "kormo", "kaj", "kajer", "kaj chai", "kaj lagbe", "kam", "kam dorkar", "kam lagbe"
    ]
  },
  {
    id: "housing",
    name: "বাসা ও আবাসন (Housing)",
    emoji: "🏢",
    route: "/services/housing",
    description: "বাসা ভাড়া, ফ্ল্যাট, রুম ও মেস",
    keywords: [
      "housing", "house", "apartment", "rent", "rental", "flat", "room", "sublet", "lease", "tenant", "landlord", "roommate", "find room", "living",
      "বাসা", "ভাড়া", "ফ্ল্যাট", "রুম", "মেস", "ঘর", "আবাসন", "বাড়ি", "বাসা চাই", "ভাড়া", "সাবলেট", "টু লেট", "থাকার জায়গা",
      "basha", "basa", "bashay", "basha vara", "basa bhara", "bari", "barite", "mes", "mess", "mess lagbe", "flat vara", "room vara", "sublet lagbe", "thakar jayga", "tolet", "to let"
    ]
  },
  {
    id: "halal_food",
    name: "খাবার ও রেস্টুরেন্ট (Halal Food)",
    emoji: "🍽️",
    route: "/services/food",
    description: "দেশি রেস্টুরেন্ট ও হালাল খাবার",
    keywords: [
      "food", "restaurant", "restaurants", "halal", "biryani", "dine", "dining", "kitchen", "hotel", "lunch", "dinner", "breakfast", "eatery", "cafe", "meal",
      "খাবার", "রেস্টুরেন্ট", "হালাল", "বিরিয়ানি", "হোটেল", "দেশি খাবার", "কাচ্চি", "খিচুড়ি", "মিষ্টি", "ভাত", "চা", "খাবারের দোকান", "নাস্তা", "খাবার খাব",
      "khabar", "khawa", "khabo", "kacchi", "biriyani", "tehari", "vat", "bhat", "cha", "deshi khabar", "bangla khabar", "khabar dukan", "restora", "hotel koi", "khabar khabo", "khabar lagbe"
    ]
  },
  {
    id: "free_food",
    name: "ফ্রি খাবার ও ফুড ব্যাংক (Free Food)",
    emoji: "🍲",
    route: "/services/free-food",
    description: "বিনামূল্যে খাদ্য সহায়তা ও ফুড প্যান্ট্রি",
    keywords: [
      "free food", "food bank", "pantry", "food pantry", "charity food", "soup kitchen", "food assistance", "donation food", "relief",
      "ফ্রি খাবার", "খাদ্য সহায়তা", "ফুড ব্যাংক", "বিনামূল্যে খাবার", "ত্রাণ", "রিলিফ", "দাতব্য খাবার", "খাদ্য দান",
      "free khabar", "food bank", "tran", "khaddo shohayota", "binamulle khabar", "charity food", "tran shohayota", "free te khabar"
    ]
  },
  {
    id: "transport",
    name: "ট্রান্সপোর্ট ও সাবওয়ে (Transport & Subway)",
    emoji: "🚇",
    route: "/services/subway",
    description: "MTA সাবওয়ে, বাস ও লাইভ শিডিউল",
    keywords: [
      "transport", "transit", "metro", "subway", "bus", "mta", "omny", "train", "commute", "travel",
      "ট্রান্সপোর্ট", "যাতায়াত", "বাস", "সাবওয়ে", "মেট্রো", "ট্রেন", "বাসের রাস্তা", "এমটিএ",
      "subway", "bus", "metro", "train", "mta", "transport", "gari", "jatayat"
    ]
  },
  {
    id: "education",
    name: "শিক্ষা ও স্কুল (Education & Schools)",
    emoji: "🏫",
    route: "/services/schools",
    description: "স্কুল, কলেজ, ESL ও ইংরেজি শিক্ষা",
    keywords: [
      "education", "school", "schools", "college", "colleges", "university", "universities", "campus", "study", "admission", "esl", "english", "ged",
      "শিক্ষা", "স্কুল", "কলেজ", "বিশ্ববিদ্যালয়", "ভর্তি", "ইংরেজি", "পড়াশোনা", "বাচ্চাদের স্কুল",
      "school", "college", "varsity", "university", "porashona", "admission", "vorti", "esl", "english"
    ]
  },
  {
    id: "religion",
    name: "মসজিদ ও ধর্মীয় সেবা (Religion & Mosque)",
    emoji: "🕌",
    route: "/services/religious",
    description: "নামাজের সময়সূচি, মসজিদ ও ধর্মীয় কেন্দ্র",
    keywords: [
      "religion", "mosque", "masjid", "prayer", "prayer time", "azan", "adhan", "islamic", "church", "temple", "worship", "friday prayer", "quran", "jummah",
      "নামাজ", "মসজিদ", "আজান", "ইসলামিক", "ধর্মীয়", "গির্জা", "মন্দির", "ওয়াক্ত", "জুম্মা", "কোরআন", "নামাজের সময়",
      "namaz", "namaj", "namajer somoy", "masjid", "mosque", "azan", "ajan", "jumma", "jummah", "dhorom"
    ]
  },
  {
    id: "embassy",
    name: "দূতাবাস ও কনস্যুলেট (Embassy & Consulate)",
    emoji: "🏛️",
    route: "/services/embassy",
    description: "বাংলাদেশ দূতাবাস, পাসপোর্ট ও কনস্যুলার সেবা",
    keywords: [
      "embassy", "consulate", "consular", "passport", "passport renewal", "visa renewal", "high commission", "nid",
      "দূতাবাস", "কনস্যুলেট", "পাসপোর্ট নবায়ন", "হাইকমিশন", "বাংলাদেশ দূতাবাস", "পাসপোর্ট অফিস",
      "embassy", "consulate", "passport", "dutabash", "dutabas", "bangladesh embassy", "passport renewal"
    ]
  },
  {
    id: "furniture",
    name: "ব্যবহৃত ফার্নিচার (Used Furniture)",
    emoji: "🪑",
    route: "/services/used-furniture",
    description: "কমদামে খাট, সোফা, ডাইনিং টেবিল ও ফার্নিচার",
    keywords: [
      "furniture", "used furniture", "bed", "sofa", "mattress", "desk", "table", "chair", "resale", "thrift", "wardrobe",
      "ফার্নিচার", "ব্যবহৃত ফার্নিচার", "খাট", "সোফা", "তোশক", "আলমারি", "টেবিল", "চেয়ার", "আসবাবপত্র",
      "furniture", "used furniture", "sofa", "bed", "khat", "table", "chair", "mattress", "almari"
    ]
  },
  {
    id: "legal",
    name: "আইনি সহায়তা ও ভিসা (Legal Aid & Visa)",
    emoji: "⚖️",
    route: "/services/legal",
    description: "ইমিগ্রেশন, ভিসা, গ্রিন কার্ড ও আইনি পরামর্শ",
    keywords: [
      "legal", "legal aid", "lawyer", "attorney", "visa", "immigration", "uscis", "asylum", "ead", "green card", "work permit", "deportation", "consultation",
      "আইন", "আইনি", "উকিল", "ভিসা", "ইমিগ্রেশন", "পাসপোর্ট", "অ্যাসাইলাম", "গ্রিন কার্ড", "কেস", "পরামর্শ", "লইয়ার", "আইনি পরামর্শ",
      "ukil", "okil", "lawyer", "ain", "aini", "visa", "visa apply", "immigration", "asylum", "green card", "ead", "work permit"
    ]
  },
  {
    id: "free_medicine",
    name: "বিনামূল্যে ঔষধ সেবা (Free Medicine)",
    emoji: "🩺",
    route: "/services/free-medicine",
    description: "ফ্রি প্রেসক্রিপশন, মেডিক্যেইড ও দাতব্য চিকিৎসা",
    keywords: [
      "free medicine", "charity medicine", "medicaid", "free prescription", "clinic aid", "donated medicine",
      "বিনামূল্যে ঔষধ", "ফ্রি ঔষধ", "দাতব্য চিকিৎসা", "বিনা খরচে ওষুধ", "মেডিকেড",
      "free medicine", "free osudh", "binamulle osudh", "charity medicine", "medicaid", "free daktar"
    ]
  },
  {
    id: "remittance",
    name: "রেমিট্যান্স ও মানি এক্সচেঞ্জ (Remittance)",
    emoji: "💸",
    route: "/services/money-exchange",
    description: "বাংলাদেশে টাকা পাঠানো, বিকাশ ও এক্সচেঞ্জ রেট",
    keywords: [
      "remittance", "money exchange", "bkash", "send money", "taka", "dollar", "exchange rate", "currency", "money transfer",
      "রেমিট্যান্স", "মানি এক্সচেঞ্জ", "টাকা পাঠানো", "বিকাশ", "ডলার", "টাকা ট্রান্সফার",
      "remittance", "bkash", "money exchange", "taka pathabo", "dollar rate", "send money"
    ]
  },
  {
    id: "flights",
    name: "বিমান টিকিট ও ট্রাভেল (Flights & Travel)",
    emoji: "✈️",
    route: "/services/travel-agency",
    description: "ঢাকা ফ্লাইট, বিমান টিকিট ও ট্রাভেল এজেন্সি",
    keywords: [
      "flight", "flights", "air ticket", "airline", "travel agency", "dhaka flight", "umrah", "biman", "tickets", "airways",
      "ফ্লাইট", "বিমান টিকিট", "ট্রাভেল", "টিকিট", "উমরাহ", "ঢাকা ফ্লাইট", "বিমান",
      "flight", "biman", "travel agency", "ticket", "dhaka flight", "umrah", "biman ticket"
    ]
  },
  {
    id: "pharmacy",
    name: "ফার্মেসি ও ঔষধ (Pharmacy & Medicine)",
    emoji: "💊",
    route: "/services/pharmacy",
    description: "কাছের ফার্মেসি, ঔষধ ও প্রেসক্রিপশন",
    keywords: [
      "pharmacy", "medicine", "drug", "drugstore", "chemist", "prescription", "pills", "otc", "refills",
      "ঔষধ", "ফার্মেসি", "ওষুধ", "প্রেসক্রিপশন", "ওষুধের দোকান", "ট্যাবলেট",
      "pharmacy", "medicine", "osudh", "oushodh", "osud", "farmacy", "dawai", "tablet", "paracetamol"
    ]
  },
  {
    id: "hospital",
    name: "হাসপাতাল ও ডাক্তার (Hospital & Doctors)",
    emoji: "🏥",
    route: "/services/community-hospital",
    description: "জরুরি চিকিৎসা, ডাক্তার ও কমিউনিটি ক্লিনিক",
    keywords: [
      "hospital", "hospitals", "clinic", "doctor", "doctors", "medical", "physician", "emergency", "ambulance", "healthcare", "urgent care", "patient",
      "হাসপাতাল", "ডাক্তার", "ক্লিনিক", "চিকিৎসা", "মেডিকেল", "জরুরি", "অ্যাম্বুলেন্স", "রোগী", "অসুস্থ", "ডাক্তার দেখাব",
      "hospital", "daktar", "doctor", "clinic", "aspatal", "haspatal", "daktar dekhabo", "chikitsa", "emergency", "ambulance"
    ]
  },
  {
    id: "translation",
    name: "ডকুমেন্ট অনুবাদ ও নোটারি (Translation)",
    emoji: "🌐",
    route: "/services/translate",
    description: "NID, সার্টিফিকেট ও পাসপোর্টের সত্যায়িত অনুবাদ",
    keywords: [
      "translation", "translate", "notary", "certified translation", "nid translation", "passport translation", "document translation",
      "অনুবাদ", "ট্রান্সলেশন", "নোটারি", "সার্টিফিকেট অনুবাদ", "দলিল অনুবাদ",
      "translate", "translation", "notary", "onubad", "nid translate"
    ]
  },
  {
    id: "social_aid",
    name: "সামাজিক সহায়তা (Social Aid)",
    emoji: "🤝",
    route: "/services/social-services",
    description: "ফুড প্যান্ট্রি, ভাড়া সহায়তা, SNAP ও সরকারি বেনিফিট",
    keywords: [
      "social aid", "social services", "snap", "food stamps", "rental aid", "benefits", "assistance",
      "সামাজিক সহায়তা", "ফুড স্ট্যাম্প", "ভাড়া সহায়তা", "সরকারি সহায়তা",
      "social aid", "snap", "food stamp", "social service", "shohayota"
    ]
  },
  {
    id: "cars",
    name: "গাড়ি ও DMV (Cars & Vehicles)",
    emoji: "🚗",
    route: "/services/cars",
    description: "ব্যবহৃত গাড়ি ক্রয়-বিক্রয় ও ড্রাইভিং লাইসেন্স",
    keywords: [
      "cars", "car", "used car", "dmv", "vehicle", "auto", "driving", "driving license", "buy car",
      "গাড়ি", "ব্যবহৃত গাড়ি", "গাড়ি কেনাবেচা", "ডিএমভি", "ড্রাইভিং লাইসেন্স",
      "car", "cars", "used car", "gari", "gari kinbo", "dmv", "driving"
    ]
  },
  {
    id: "petrol",
    name: "গ্যাস ও EV চার্জিং (Gas & EV)",
    emoji: "⛽",
    route: "/services/petrol",
    description: "কাছের জ্বালানি পাম্প ও EV চার্জিং স্টেশন",
    keywords: [
      "gas", "petrol", "fuel", "ev", "charging", "gas station", "cng", "diesel", "pump",
      "গ্যাস", "পেট্রোল", "জ্বালানি", "চার্জিং", "পাম্প", "সিএনজি", "তেল", "গ্যাসের দাম",
      "gas", "petrol", "fuel", "cng", "ev", "charging", "pump", "petrol pump", "gari charge"
    ]
  },
  {
    id: "electronics",
    name: "ইলেকট্রনিক্স ও মোবাইল (Electronics & Gadgets)",
    emoji: "📱",
    route: "/services/electronics",
    description: "ল্যাপটপ, ফোন, 5G সিম ও কম্পিউটার",
    keywords: [
      "electronics", "laptop", "laptops", "phone", "mobile", "sim", "5g", "gadget", "computer", "tech",
      "ইলেকট্রনিক্স", "ফোন", "ল্যাপটপ", "সিম কার্ড", "কম্পিউটার", "মোবাইল",
      "electronics", "phone", "mobile", "laptop", "sim", "computer"
    ]
  },
  {
    id: "repairs",
    name: "মেরামত ও সার্ভিস (Repairs & Handyman)",
    emoji: "🔧",
    route: "/services/local",
    description: "প্লাম্বিং, ইলেকট্রিশিয়ান ও হোম সার্ভিস",
    keywords: [
      "repairs", "repair", "plumber", "plumbing", "electrician", "handyman", "cleaning", "mechanic",
      "মেরামত", "প্লাম্বার", "ইলেকট্রিশিয়ান", "ক্লিনিং", "হোম সার্ভিস",
      "repairs", "repair", "plumber", "electrician", "cleaning", "mechanic"
    ]
  },
  {
    id: "scholarship",
    name: "স্কলারশিপ ও অনুদান (Scholarships)",
    emoji: "🎓",
    route: "/services/scholarship",
    description: "শিক্ষার্থী স্কলারশিপ ও অনুদান",
    keywords: [
      "scholarship", "scholarships", "grant", "grants", "financial aid", "student aid", "fellowship",
      "বৃত্তি", "স্কলারশিপ", "শিক্ষা অনুদান", "ছাত্র সহায়তা",
      "scholarship", "britti", "grant", "student aid"
    ]
  },
  {
    id: "buy_sell",
    name: "কেনাবেচা ও মার্কেটপ্লেস (Buy & Sell)",
    emoji: "🛍️",
    route: "/services/buy-sell",
    description: "কমিউনিটির ভেতরে কেনাবেচা",
    keywords: [
      "buy sell", "buy and sell", "marketplace", "classifieds", "second hand",
      "কেনাবেচা", "বেচাকেনা", "মার্কেটপ্লেস",
      "buy sell", "becha", "bikri", "kenabecha"
    ]
  },
  {
    id: "rentals",
    name: "রেন্টাল সার্ভিস (Rentals)",
    emoji: "🔑",
    route: "/services/rentals",
    description: "গাড়ি, ফার্নিচার ও সরঞ্জাম ভাড়া",
    keywords: [
      "rentals", "rental", "equipment rental", "car rental",
      "রেন্টাল", "ভাড়া নেওয়া", "সরঞ্জাম ভাড়া",
      "rentals", "rental", "vara"
    ]
  },
  {
    id: "sports",
    name: "খেলাধুলা ও জিম (Sports & Fitness)",
    emoji: "⚽",
    route: "/services/sports",
    description: "কাছের মাঠ, খেলাধুলা, ক্রিকেট ও ফিটনেস সেন্টার",
    keywords: [
      "sports", "gym", "football", "cricket", "fitness", "workout", "soccer", "stadium", "field",
      "খেলাধুলা", "ক্রিকেট", "ফুটবল", "জিম", "ব্যায়াম", "মাঠ", "ফিটনেস",
      "sports", "cricket", "football", "gym", "fitness", "khela", "math"
    ]
  },
  {
    id: "fashion",
    name: "পোশাক ও ফ্যাশন (Fashion & Clothing)",
    emoji: "👕",
    route: "/services/fashion",
    description: "দেশি পোশাক, শীতের জ্যাকেট ও ফ্যাশন",
    keywords: [
      "fashion", "clothing", "clothes", "winter coat", "jacket", "dress", "apparel",
      "পোশাক", "জামাকাপড়", "উইন্টার কোট", "জ্যাকেট", "ফ্যাশন",
      "fashion", "clothes", "jacket", "coat", "dress", "poshak"
    ]
  },
  {
    id: "tickets",
    name: "সিনেমা ও ইভেন্ট টিকিট (Tickets & Shows)",
    emoji: "🎟️",
    route: "/services/movie-hall",
    description: "সিনেমা, কনসার্ট ও নাটকের টিকিট",
    keywords: [
      "tickets", "ticket", "movie", "cinema", "concert", "show", "event tickets", "theater",
      "টিকিট", "সিনেমা", "মুভি", "কনসার্ট", "শো",
      "tickets", "ticket", "movie", "cinema", "concert"
    ]
  },
  {
    id: "checklist",
    name: "ইমিগ্রেশন চেকলিস্ট (Checklist)",
    emoji: "📋",
    route: "/services/checklist",
    description: "ভিসা ও বসবাসের প্রয়োজনীয় চেকলিস্ট",
    keywords: [
      "checklist", "document", "documents", "papers", "paperwork", "requirements",
      "চেকলিস্ট", "কাগজপত্র", "ডকুমেন্ট", "ভিসা পেপার",
      "checklist", "document", "documents", "papers", "kagoj", "kagojpotro"
    ]
  },
  {
    id: "cart",
    name: "আমার অর্ডার ও কার্ট (Cart & Orders)",
    emoji: "📦",
    route: "/orders",
    description: "অর্ডার ট্র্যাকিং, পার্সেল ও শপিং কার্ট",
    keywords: [
      "cart", "my cart", "shopping cart", "order", "orders", "my orders", "delivery", "parcel", "purchases", "checkout", "bag",
      "কার্ট", "শপিং কার্ট", "অর্ডার", "আমার অর্ডার", "পার্সেল", "ডেলিভারি", "কেনাকাটা",
      "cart", "order", "orders", "amar order", "parcel", "delivery", "shopping cart"
    ]
  },
  {
    id: "seller",
    name: "সেলার ড্যাশবোর্ড ও শপ (Seller Dashboard)",
    emoji: "🏪",
    route: "/seller-dashboard",
    description: "দোকান পরিচালনা, পণ্য বিক্রি ও ব্যবসা",
    keywords: [
      "seller", "seller dashboard", "store", "shop", "vendor", "merchant", "sell products", "business",
      "বিক্রেতা", "দোকান", "সেলার", "মার্কেটপ্লেস", "পণ্য বিক্রি", "দোকানদার", "ব্যবসা",
      "seller", "store", "shop", "dokan", "dokandar", "dokandari", "mal bikri", "product sell", "amar dokan"
    ]
  },
  {
    id: "map",
    name: "লাইভ ম্যাপ (Live Map)",
    emoji: "🗺️",
    route: "/map",
    description: "কাছের সেবা ও ইন্টারেক্টিভ মানচিত্র",
    keywords: [
      "map", "maps", "live map", "location", "locations", "gps", "direction", "directions", "navigation", "route", "routes",
      "ম্যাপ", "মানচিত্র", "লোকেশন", "ন্যাভিগেশন", "রাস্তা", "পথ", "দিক", "কোথায় যাব",
      "map", "location", "gps", "direction", "rasta", "kothay jabo", "dik"
    ]
  },
  {
    id: "reels",
    name: "রিলস ও ভিডিও (Reels & Shorts)",
    emoji: "🎬",
    route: "/reels",
    description: "কমিউনিটি রিলস ও জনপ্রিয় ভিডিও",
    keywords: [
      "reels", "reel", "video", "videos", "shorts", "tiktok", "clips", "entertainment", "watch video",
      "রিলস", "রিল", "ভিডিও", "শর্টস", "ক্লিপ", "টিকটক", "গান", "নাটক", "বিনোদন",
      "reels", "reel", "video", "shorts", "tiktok", "gan", "natok", "video dekhbo"
    ]
  },
  {
    id: "explore",
    name: "এক্সপ্লোর (Explore)",
    emoji: "🧭",
    route: "/explore",
    description: "নতুন বিষয় ও কন্টেন্ট আবিষ্কার",
    keywords: [
      "explore", "discover", "trending", "whats new", "trends",
      "এক্সপ্লোর", "আবিष्कार", "ট্রেন্ডিং", "নতুন কিছু",
      "explore", "discover", "trending", "notun"
    ]
  },
  {
    id: "communities",
    name: "কমিউনিটি ও গ্রুপ (Communities)",
    emoji: "👥",
    route: "/communities",
    description: "প্রবাসী বাংলা গ্রুপ ও কমিউনিটি ফোরাম",
    keywords: [
      "community", "communities", "group", "groups", "forum", "association",
      "কমিউনিটি", "গ্রুপ", "প্রবাসী", "সমিতি", "দল", "প্রবাসী ফোরাম",
      "community", "group", "somiti", "dol", "probashi"
    ]
  },
  {
    id: "messages",
    name: "মেসেজ ও ইনবক্স (Messages & Chat)",
    emoji: "💬",
    route: "/messages",
    description: "ইনবক্স ও কথোপকথন",
    keywords: [
      "message", "messages", "chat", "inbox", "dm", "conversation", "sms",
      "মেসেজ", "চ্যাট", "ইনবক্স", "বার্তা", "কথোপকথন", "এসএমএস",
      "message", "messages", "chat", "inbox", "dm", "kotha", "sms"
    ]
  },
  {
    id: "notifications",
    name: "নোটিফিকেশন (Notifications)",
    emoji: "🔔",
    route: "/notifications",
    description: "সর্বশেষ সতর্কতা ও নোটিফিকেশন",
    keywords: [
      "notification", "notifications", "alert", "alerts", "bell",
      "নোটিফিকেশন", "সতর্কতা", "ঘণ্টা", "আপডেট",
      "notification", "notifications", "alert", "ghonta"
    ]
  },
  {
    id: "profile",
    name: "আমার প্রোফাইল (Profile)",
    emoji: "👤",
    route: "/profile",
    description: "ব্যক্তিগত তথ্য, পোস্ট ও বায়ো",
    keywords: [
      "profile", "my profile", "account", "user", "bio", "avatar", "me",
      "প্রোফাইল", "অ্যাকাউন্ট", "আমার একাউন্ট", "আমার প্রোফাইল", "বায়ো",
      "profile", "account", "amar profile", "amar account", "bio"
    ]
  },
  {
    id: "qa",
    name: "প্রশ্নোত্তর ফোরাম (Q&A)",
    emoji: "❓",
    route: "/qa",
    description: "জিজ্ঞাসা ও বিশেষজ্ঞদের উত্তর",
    keywords: [
      "qa", "q&a", "question", "answer", "questions", "answers", "faq", "help",
      "প্রশ্ন", "উত্তর", "জিজ্ঞাসা", "সহায়তা", "ফোরাম", "প্রশ্নোত্তর",
      "qa", "question", "answer", "proshno", "uttor", "help"
    ]
  },
  {
    id: "saved",
    name: "সংরক্ষিত রিসোর্স (Saved)",
    emoji: "🔖",
    route: "/saved",
    description: "বুকমার্ক করা পোস্ট ও দরকারি লিঙ্ক",
    keywords: [
      "saved", "bookmark", "bookmarks", "favorites", "save",
      "সেভ", "বুকমার্ক", "সংরক্ষিত", "পছন্দ",
      "saved", "bookmark", "favorite", "save"
    ]
  },
  {
    id: "settings",
    name: "সেটিংস (Settings)",
    emoji: "⚙️",
    route: "/settings",
    description: "অ্যাপ সেটিংস, ভাষা ও নিরাপত্তা",
    keywords: [
      "settings", "setting", "preference", "preferences", "password", "security", "language",
      "সেটিংস", "পাসওয়ার্ড", "নিরাপত্তা", "ভাষা", "কনফিগারেশন",
      "settings", "setting", "preference", "password", "security", "bhasha"
    ]
  },
  {
    id: "admin",
    name: "অ্যাডমিন প্যানেল (Admin)",
    emoji: "🛡️",
    route: "/admin",
    description: "অ্যাডমিন ও মডারেশন প্যানেল",
    keywords: [
      "admin", "dashboard", "moderation", "panel",
      "অ্যাডমিন", "মডারেশন",
      "admin", "moderator"
    ]
  },
];

// ── Specific Job Roles & Company Cards Matching Dictionary ───────────────────
export const SPECIFIC_JOB_ROLES = [
  // Developer / Software / Tech
  {
    keywords: ["developer", "react", "nextjs", "next.js", "frontend", "backend", "fullstack", "software", "coder", "programmer", "web developer", "typescript", "javascript", "techhive", "ডেভেলপার", "সফটওয়্যার"],
    label: "Senior Frontend Developer (React / Next.js)",
    query: "developer"
  },
  // Chef / Kitchen / Culinary
  {
    keywords: ["chef", "cook", "kitchen", "culinary", "restaurant job", "hotel job", "heritage dine", "ranna", "baburchi", "kitchen supervisor", "শেফ", "বাবুর্চি", "কুক"],
    label: "Executive Chef & Kitchen Supervisor Job",
    query: "chef"
  },
  // Accounts / Finance / Tally
  {
    keywords: ["accounts", "accountant", "accounting", "finance", "tally", "quickbooks", "tax", "taxation", "audit", "payroll", "apex business", "apex", "হিসাবরক্ষক", "অ্যাকাউন্টস"],
    label: "Accounts & Financial Officer Job",
    query: "accounts"
  },
  // Rider / Delivery / Courier
  {
    keywords: ["rider", "delivery", "courier", "bike rider", "cycle rider", "delivery boy", "quickdrop", "parcel delivery", "delivery rider", "pathao", "foodpanda", "রাইডার", "ডেলিভারি"],
    label: "Express Delivery Rider Job (Bike/Cycle)",
    query: "rider"
  },
  // Pharmacist / Chemist / Medicine
  {
    keywords: ["pharmacist", "chemist", "dispensing", "pharmacy job", "careplus", "b.pharm", "pharma", "ফার্মাসিস্ট"],
    label: "Registered Pharmacist / Chemist Job",
    query: "pharmacist"
  },
  // Sales / Retail / Mart
  {
    keywords: ["sales", "showroom", "retail", "prime retail", "cashier", "customer relations", "store executive", "merchandising", "বিক্রয় প্রতিনিধি", "সেলস"],
    label: "Sales & Customer Relations Executive Job",
    query: "sales"
  },
  // Designer / UI UX / Figma
  {
    keywords: ["designer", "ui ux", "ui/ux", "figma", "visual designer", "pixelcraft", "graphic designer", "prototyping", "ডিজাইনার"],
    label: "UI/UX & Visual Designer Job",
    query: "designer"
  },
  // Warehouse / Logistics / Supervisor
  {
    keywords: ["warehouse", "supervisor", "logistics", "operations", "national logistics", "dispatch", "hub supervisor", "সুপারভাইজার", "ওয়্যারহাউস"],
    label: "Branch Operations Supervisor Job",
    query: "supervisor"
  },
  // Digital Marketing / SEO / Content
  {
    keywords: ["marketing", "digital marketing", "seo", "content writer", "growthwave", "social media manager", "copywriting", "মার্কেটিং"],
    label: "Digital Marketing & Content Specialist Job",
    query: "marketing"
  },
  // Technician / Electrician
  {
    keywords: ["technician", "electrician", "maintenance", "mechanic", "ইলেকট্রিশিয়ান", "টেকনিশিয়ান"],
    label: "Technician & Electrician Job",
    query: "technician"
  },
];

export interface ServiceTypeSuggestion {
  id: string;
  title: string;
  bnTitle: string;
  category: string;
  searchQuery: string;
  typeLabel?: string;
  bnTypeLabel?: string;
}

export interface LocationPinpoint {
  id: string | number;
  name: string;
  category: string;
  address: string;
  distance?: string;
  lat: number;
  lng: number;
  phone?: string;
  rating?: number;
  description?: string;
  badge?: string;
  highlight?: string;
  bnHighlight?: string;
}

export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  serviceTypes?: ServiceTypeSuggestion[];
  pinpoints?: LocationPinpoint[];
  destination?: {
    name: string;
    route: string;
    place?: Place;
    state?: any;
  };
}

// ── Smart Natural Language Matching Utility (Bangla, English & Banglish) ─────
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s,.\-?!:;।/()_+]+/g, " ")
    .trim();
}

// Convert phonetic Banglish differences into unified stems
export function phoneticBanglish(text: string): string {
  return text
    .toLowerCase()
    .replace(/sh/g, "s")
    .replace(/z/g, "j")
    .replace(/bh/g, "v")
    .replace(/kh/g, "k")
    .replace(/ch/g, "c")
    .replace(/ph/g, "f")
    .replace(/ee+/g, "i")
    .replace(/oo+/g, "u")
    .replace(/aa+/g, "a")
    .replace(/([a-z])\1+/g, "$1");
}

// Action prefixes to strip so commands like "open X", "X khulo", "X e jabo" isolate "X"
const ACTION_COMMANDS = [
  "open koro", "open korun", "open", "show", "go to", "goto", "view", "visit", "take me to", "navigate to", "launch",
  "khulo", "khulun", "dekhao", "dekhan", "cholo", "jabo", "niye jao", "niye cholo", "jachhi", "jete chai", "kinbo",
  "khujtechi", "khujchi", "khuji", "lagbe", "dorkar", "chai", "dekhbo", "porbo",
  "খোলো", "খুলুন", "খুলো", "ওপেন করো", "ওপেন করুন", "ওপেন", "যাবো", "যাব", "চলো", "নিয়ে চলো", "নিয়ে যাও", "দেখাও", "দেখান", "চাই", "লাগবে", "দরকার", "কিনব", "কিনবো", "দেখব", "দেখবো"
];

// Clean action words from query
function cleanActionWords(query: string): string {
  let cleaned = query.toLowerCase();
  for (const cmd of ACTION_COMMANDS) {
    if (/[\u0980-\u09FF]/.test(cmd)) {
      cleaned = cleaned.split(cmd).join(" ");
    } else {
      const regex = new RegExp(`\\b${cmd}\\b`, "gi");
      cleaned = cleaned.replace(regex, " ");
    }
  }
  // Strip common Banglish / Bengali locative suffixes e.g. " e", " a", " te", " এ", " তে"
  cleaned = cleaned.replace(/\b(e|a|te|tey)\b/gi, " ");
  cleaned = cleaned.replace(/(^|\s)(এ|তে|য়)($|\s)/g, " ");
  return cleaned.trim().replace(/\s+/g, " ");
}

// Conversational stopwords / fillers
const CONVERSATIONAL_FILLERS = new Set([
  // Bangla
  "আমি", "আমার", "আমাদের", "আমাকে", "একটি", "একটা", "দরকার", "চাই", "খুঁজছি", "খুঁজি", "কোথায়", "কোথায়", "কোন", "কখন", "কিভাবে", "যেতে", "যাব", "যাবো", "নিয়ে", "নিয়ে", "চলো", "দেখান", "দেখাও", "বলো", "বলুন", "প্লিজ", "একটু", "কাছে", "কাছের", "আছে", "কী", "কি", "হবে", "পাব", "পাবো", "করব", "করবো", "দেখব", "দেখবো", "লাগবে", "সন্ধান", "এ", "তে", "য়",
  // Banglish
  "ami", "amar", "amader", "amake", "ekta", "akta", "ekti", "dorkar", "chai", "chay", "khujchi", "khoj", "kothay", "koi", "kokhon", "kivabe", "kibhabe", "jete", "jabo", "niye", "cholo", "dekhao", "dekhan", "bolo", "bolen", "please", "plz", "ektu", "kache", "kacher", "lagbe", "pabo", "ase", "ache", "ki", "hobe", "parbo", "jani", "jante", "bhalo", "valo", "korbo", "dekhbo", "shunte", "kinbo", "e", "a", "te", "tey",
  // English
  "i", "me", "my", "we", "our", "need", "want", "looking", "find", "search", "where", "how", "to", "go", "show", "tell", "please", "near", "nearby", "the", "a", "an", "is", "are", "for", "can", "you", "good", "best", "some", "any", "get", "take", "bring"
]);

export function matchNavigationIntent(query: string): {
  target: NavigationTarget | null;
  place: Place | null;
  destinationName: string;
  route: string;
  state?: any;
  isAction?: boolean;
  actionEvent?: string;
  actionPayload?: any;
} {
  const normQuery = normalizeText(query);
  const cleanQuery = cleanActionWords(normQuery);
  const words = normQuery.split(" ").filter(Boolean);
  const cleanWords = cleanQuery.split(" ").filter(Boolean);
  const coreWords = words.filter((w) => !CONVERSATIONAL_FILLERS.has(w));
  const effectiveWords = cleanWords.length > 0 ? cleanWords : (coreWords.length > 0 ? coreWords : words);
  const phoneticQuery = phoneticBanglish(normQuery);
  const phoneticClean = phoneticBanglish(cleanQuery);
  const has = (k: string) => words.includes(k) || cleanWords.includes(k) || normQuery.includes(k);

  // ── High-Priority Matchers for Header & Tab Icons (Exact UI Screenshot) ──

  // 0. Recents / Multitasking Switcher / Customize Recents
  if (
    /\b(recent|recents|recent tab|recent apps|multitasking|task switcher|switch app)\b/i.test(normQuery) ||
    has("রিসেন্ট") || has("রিসেন্ট অ্যাপ") || has("রিসেন্ট ট্যাব") || has("রিসেন্ট পেজ")
  ) {
    const isAdd = /\b(add|rekhe dao|rakho|save|যুক্ত)\b/i.test(normQuery) || has("যোগ");
    return {
      target: null,
      place: null,
      destinationName: isAdd ? "রিসেন্টে যোগ করুন (Add to Recents)" : "রিসেন্ট অ্যাপস সুইচ (Recents)",
      route: "/feed",
      isAction: true,
      actionEvent: isAdd ? "add-to-recent-apps" : "open-recent-apps",
    };
  }

  // 1. Weather / Thermometer (UI Screenshot Icon 3)
  if (
    /\b(weather|thermometer|temperature|temp|celsius|fahrenheit|abohawa|tapmatra|tharmomitar|abohaoa)\b/i.test(normQuery) ||
    has("ওয়েদার") || has("আবহাওয়া") || has("আবহাওয়া") || has("তাপমাত্রা") || has("থার্মোমিটার")
  ) {
    const tgt = APP_NAVIGATION_TARGETS.find((t) => t.id === "weather");
    return {
      target: tgt || null,
      place: null,
      destinationName: "আবহাওয়া ও তাপমাত্রা (Weather / 🌡️)",
      route: "/feed?open=weather",
      state: { open: "weather" },
      isAction: true,
      actionEvent: "open-weather-modal",
    };
  }

  // 2. Calendar / Events / Tarikh (UI Screenshot Icon 4 in Tab Bar)
  if (
    /\b(calendar|date|tarikh|schedule|events|event|today|somoy|kalendar)\b/i.test(normQuery) ||
    has("ক্যালেন্ডার") || has("তারিখ") || has("দিনপঞ্জি") || has("ইভেন্ট") || has("ইভেন্টস") || has("সিডিউল")
  ) {
    const tgt = APP_NAVIGATION_TARGETS.find((t) => t.id === "tab_calendar");
    return {
      target: tgt || null,
      place: null,
      destinationName: "ক্যালেন্ডার ও ইভেন্ট (Calendar / 📅)",
      route: "/feed?open=calendar",
      state: { open: "calendar" },
      isAction: true,
      actionEvent: "open-calendar-modal",
    };
  }

  // 3. 4 Box / Grid / LayoutGrid / Apps & Tools (UI Screenshot Icon 5 in Tab Bar)
  if (
    /\b(4 box|four box|4 boxes|4ta box|char box|charta ghor|charta box|grid|layout grid|apps|tools)\b/i.test(normQuery) ||
    normQuery === "grid" || cleanQuery === "grid" ||
    has("৪ বক্স") || has("চার বক্স") || has("৪টা বক্স") || has("চারটা ঘর") || has("গ্রিড") || has("অ্যাপস") || has("টুলস") || has("চার কোনা") || has("চারটি বক্স")
  ) {
    const tgt = APP_NAVIGATION_TARGETS.find((t) => t.id === "tab_apps_grid");
    return {
      target: tgt || null,
      place: null,
      destinationName: "অ্যাপস ও ৪ বক্স গ্রিড (Apps & Tools / 㗊)",
      route: "/feed?tab=local",
      state: { tab: "local" },
      isAction: true,
      actionEvent: "open-smart-sidebar",
    };
  }

  // 4. MyBox / 3D Cube / Box (UI Screenshot Icon 2 in Tab Bar)
  if (
    /\b(mybox|my box|cube|3d box|cube box|quick access)\b/i.test(normQuery) ||
    normQuery === "box" || cleanQuery === "box" || normQuery === "cube" || cleanQuery === "cube" ||
    has("বক্স") || has("মাইবক্স") || has("কিউব") || has("বাক্স") || normQuery.includes("box icon")
  ) {
    const tgt = APP_NAVIGATION_TARGETS.find((t) => t.id === "tab_mybox");
    return {
      target: tgt || null,
      place: null,
      destinationName: "মাইবক্স ও কুইক অ্যাক্সেস (MyBox / 📦 Cube)",
      route: "/feed?open=box",
      state: { open: "box" },
      isAction: true,
      actionEvent: "open-mybox-drawer",
    };
  }

  // 5. Star / For You (UI Screenshot Icon 1 in Tab Bar)
  if (
    /\b(star|for you|foryou|favorites|taraka|tara)\b/i.test(normQuery) ||
    normQuery === "star" || cleanQuery === "star" || normQuery.includes("star icon") ||
    has("স্টার") || has("তারা") || has("ফর ইউ") || has("ফেভারিট")
  ) {
    const tgt = APP_NAVIGATION_TARGETS.find((t) => t.id === "tab_star");
    return {
      target: tgt || null,
      place: null,
      destinationName: "ফর ইউ ও স্টার ট্যাব (For You / ⭐)",
      route: "/feed?tab=for-you",
      state: { tab: "for-you" },
      isAction: true,
      actionEvent: "select-feed-tab",
      actionPayload: { tab: "for-you" },
    };
  }

  // 6. Pen / Post / SquarePen (UI Screenshot Icon 3 in Tab Bar)
  if (
    /\b(pen|pencil|squarepen|kolom|likhbo|status|compose|post)\b/i.test(normQuery) ||
    normQuery === "pen" || cleanQuery === "pen" || normQuery === "post" || cleanQuery === "post" ||
    has("পেন") || has("পেন্সিল") || has("কলম") || has("লেখা") || has("পোস্ট") || has("নতুন পোস্ট")
  ) {
    const tgt = APP_NAVIGATION_TARGETS.find((t) => t.id === "tab_post");
    return {
      target: tgt || null,
      place: null,
      destinationName: "পোস্ট তৈরি ও কলম আইকন (Create Post / 📝)",
      route: "/feed?open=post",
      state: { open: "post" },
      isAction: true,
      actionEvent: "open-post-composer",
    };
  }

  // 7. Hamburger Menu / 3 Lines / More (UI Screenshot Top Left Icon)
  if (
    /\b(menu|more|more menu|hamburger|3 lines|3 line|three lines|sidebar|nav menu)\b/i.test(normQuery) ||
    normQuery === "menu" || cleanQuery === "menu" || normQuery === "more" || cleanQuery === "more" ||
    has("তিন দাগ") || has("৩ দাগ") || has("মেনু") || has("মেন্যু") || has("মেনু বার") || has("সাইডবার") || has("মোর মেনু")
  ) {
    const tgt = APP_NAVIGATION_TARGETS.find((t) => t.id === "header_menu");
    return {
      target: tgt || null,
      place: null,
      destinationName: "মেন্যু ও অপশন (More Menu / ≡)",
      route: "/more",
      isAction: true,
      actionEvent: "open-smart-sidebar",
    };
  }

  // 8. Bell / Notifications (UI Screenshot Top Right Icon)
  if (
    /\b(bell|notification|notifications|ghonta|ghonti|alert|alerts|ring)\b/i.test(normQuery) ||
    normQuery === "bell" || cleanQuery === "bell" ||
    has("বেল") || has("ঘণ্টা") || has("ঘন্টি") || has("নোটিফিকেশন") || has("সতর্কতা")
  ) {
    const tgt = APP_NAVIGATION_TARGETS.find((t) => t.id === "notifications");
    return {
      target: tgt || null,
      place: null,
      destinationName: "নোটিফিকেশন ও অ্যালার্ট (Notifications / 🔔)",
      route: "/notifications",
    };
  }

  // 9. Pathasathi Logo (UI Screenshot Header Text)
  if (
    normQuery === "pathasathi" || normQuery === "logo" || cleanQuery === "pathasathi" ||
    has("পথসাথী") || has("লোগো")
  ) {
    const tgt = APP_NAVIGATION_TARGETS.find((t) => t.id === "header_logo");
    return {
      target: tgt || null,
      place: null,
      destinationName: "পথসাথী হোম (Pathasathi Home)",
      route: "/feed",
    };
  }

  // 10. Check Cart & My Orders ("cart", "my cart", "open cart", "amar order", "order list", "কার্ট", "অর্ডার")
  if (
    normQuery === "cart" ||
    normQuery === "kart" ||
    cleanQuery === "cart" ||
    cleanQuery === "kart" ||
    normQuery.includes("cart") ||
    normQuery.includes("kart") ||
    normQuery.includes("কার্ট") ||
    normQuery.includes("my orders") ||
    normQuery.includes("amar order") ||
    normQuery.includes("আমার অর্ডার") ||
    normQuery.includes("shopping cart")
  ) {
    return {
      target: APP_NAVIGATION_TARGETS.find((t) => t.id === "cart") || null,
      place: null,
      destinationName: "আমার কার্ট ও অর্ডার (Cart & Orders)",
      route: "/orders",
    };
  }

  // 3. Check Specific Job Roles / Job Card Matches ("developer", "chef", "cook", "accounts", "rider", "CarePlus", etc.)
  for (const role of SPECIFIC_JOB_ROLES) {
    if (
      role.keywords.some(
        (k) =>
          normQuery.includes(k) ||
          cleanQuery.includes(k) ||
          phoneticQuery.includes(phoneticBanglish(k)) ||
          effectiveWords.includes(k)
      )
    ) {
      return {
        target: APP_NAVIGATION_TARGETS.find((t) => t.id === "jobs") || null,
        place: null,
        destinationName: `চাকরি: ${role.label}`,
        route: `/services/jobs?q=${encodeURIComponent(role.query)}`,
        state: { searchQuery: role.query },
      };
    }
  }

  // 4. Check General Job Queries with custom terms (e.g. "driver job", "salesman job", "hotel chakri", "delivery kaj")
  const isJobKeyword = /\b(job|jobs|chakri|sakri|kaj|kam|hiring|vacancy|career|চাকরি|কাজ|কাম|নিয়োগ|ক্যারিয়ার)\b/i.test(normQuery);
  if (isJobKeyword) {
    const rawJobQuery = cleanQuery
      .replace(/\b(job|jobs|chakri|sakri|kaj|kam|hiring|vacancy|career|lagbe|chai|dorkar|khujchi|khuji|ache|ase|ekta|akta|চাকরি|কাজ|কাম|নিয়োগ|ক্যারিয়ার|লাগবে|চাই|দরকার|আছে|একটি|একটা)\b/gi, "")
      .trim();
    return {
      target: APP_NAVIGATION_TARGETS.find((t) => t.id === "jobs") || null,
      place: null,
      destinationName: rawJobQuery ? `চাকরি: ${rawJobQuery}` : "চাকরি ও ক্যারিয়ার (Jobs)",
      route: rawJobQuery ? `/services/jobs?q=${encodeURIComponent(rawJobQuery)}` : "/services/jobs",
      state: rawJobQuery ? { searchQuery: rawJobQuery } : undefined,
    };
  }

  // 5. Check General Housing / Rent Queries (e.g. "flat vara", "2 bedroom apartment", "sublet lagbe", "room vara")
  const isHousingKeyword = /\b(housing|house|apartment|rent|flat|room|sublet|mess|tolet|to let|বাসা|ভাড়া|ভাড়া|ফ্ল্যাট|রুম|মেস|সাবলেট|টুলেট)\b/i.test(normQuery);
  if (isHousingKeyword) {
    const rawHouseQuery = cleanQuery
      .replace(/\b(housing|house|apartment|rent|flat|room|sublet|mess|tolet|to let|basha|basa|bari|vara|bhara|lagbe|chai|dorkar|khujchi|ache|ase|ekta|akta|বাসা|ভাড়া|ভাড়া|ফ্ল্যাট|রুম|মেস|সাবলেট|টুলেট|বাড়ি|বাড়ি|লাগবে|চাই|দরকার|আছে|একটি|একটা)\b/gi, "")
      .trim();
    return {
      target: APP_NAVIGATION_TARGETS.find((t) => t.id === "housing") || null,
      place: null,
      destinationName: rawHouseQuery ? `বাসা ও আবাসন: ${rawHouseQuery}` : "বাসা ও আবাসন (Housing)",
      route: rawHouseQuery ? `/services/housing?q=${encodeURIComponent(rawHouseQuery)}` : "/services/housing",
      state: rawHouseQuery ? { searchQuery: rawHouseQuery } : undefined,
    };
  }

  // 3. Check Specific Database Places (e.g. Unimart, KFC, Square Hospital, Mosque)
  let bestPlace: Place | null = null;
  let highestPlaceScore = 0;

  for (const p of places) {
    let pScore = 0;
    const pNameNorm = normalizeText(p.name);
    const pNamePhonetic = phoneticBanglish(pNameNorm);

    // Exact place name match
    if (pNameNorm === normQuery || pNameNorm === cleanQuery || normQuery.includes(pNameNorm)) {
      pScore += 160;
    } else if (pNamePhonetic === phoneticQuery || phoneticQuery.includes(pNamePhonetic)) {
      pScore += 130;
    } else {
      const pWords = pNameNorm.split(" ");
      for (const w of effectiveWords) {
        if (w.length >= 3) {
          if (pWords.includes(w)) pScore += 70;
          else if (pNameNorm.includes(w)) pScore += 45;
          else if (pNamePhonetic.includes(phoneticBanglish(w))) pScore += 35;
        }
      }
    }

    if (p.address && normalizeText(p.address).includes(normQuery)) pScore += 25;

    if (pScore > highestPlaceScore) {
      highestPlaceScore = pScore;
      bestPlace = p;
    }
  }

  // 4. Check App Navigation Targets (All 44 Services, Tabs & Icons)
  let bestTarget: NavigationTarget | null = null;
  let highestTargetScore = 0;

  for (const target of APP_NAVIGATION_TARGETS) {
    let score = 0;
    const targetNameNorm = normalizeText(target.name);
    const targetNamePhonetic = phoneticBanglish(targetNameNorm);

    if (targetNameNorm === normQuery || targetNameNorm === cleanQuery) {
      score += 170;
    } else if (targetNameNorm.includes(cleanQuery) || (cleanQuery && targetNameNorm.includes(cleanQuery))) {
      score += 110;
    } else if (phoneticClean.length >= 3 && targetNamePhonetic.includes(phoneticClean)) {
      score += 90;
    }

    for (const kw of target.keywords) {
      const kwNorm = normalizeText(kw);
      const kwPhonetic = phoneticBanglish(kwNorm);

      // Exact phrase match in keywords
      if (normQuery === kwNorm || cleanQuery === kwNorm) {
        score += 150;
      } else if (normQuery.includes(kwNorm) || cleanQuery.includes(kwNorm)) {
        score += 85;
      } else if (phoneticClean.includes(kwPhonetic)) {
        score += 70;
      }

      // Check effective words against keyword
      for (const w of effectiveWords) {
        if (w.length >= 2) {
          if (w === kwNorm) {
            score += 60;
          } else if (phoneticBanglish(w) === kwPhonetic) {
            score += 50;
          } else if (w.length >= 4 && (kwNorm.includes(w) || w.includes(kwNorm))) {
            score += 30;
          }
        }
      }
    }

    if (score > highestTargetScore) {
      highestTargetScore = score;
      bestTarget = target;
    }
  }

  // Resolution:
  // If specific place matched strongly (e.g. Unimart, KFC, Square Hospital)
  if (highestPlaceScore >= 50 && bestPlace && highestPlaceScore > highestTargetScore) {
    return {
      target: null,
      place: bestPlace,
      destinationName: bestPlace.name,
      route: `/map?placeId=${bestPlace.id}&lat=${bestPlace.lat}&lng=${bestPlace.lng}&category=${encodeURIComponent(
        bestPlace.category
      )}&name=${encodeURIComponent(bestPlace.name)}`,
      state: {
        selectedPlaceId: bestPlace.id,
        userLocation: [bestPlace.lat, bestPlace.lng],
        activeCategory: "all",
      },
    };
  }

  // If app target matched (Bangla, English, or Banglish)
  if (highestTargetScore >= 20 && bestTarget) {
    return {
      target: bestTarget,
      place: null,
      destinationName: bestTarget.name,
      route: bestTarget.route,
      isAction: bestTarget.isAction,
    };
  }

  // Fallback: Live Map Search for any custom query in any language
  return {
    target: null,
    place: null,
    destinationName: `অনুসন্ধান: "${query}"`,
    route: `/map?q=${encodeURIComponent(query)}`,
    state: { searchQuery: query, activeCategory: "all" },
  };
}

// ── Doll Assistant Trigger Bubble ─────────────────────────────────────────────
export function DollAssistantTrigger({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen?: boolean;
}) {
  return (
    <div className="relative inline-flex items-center group/doll z-30">
      {/* Speech prompt bubble with gentle float */}
      <button
        type="button"
        onClick={onClick}
        className="hidden xs:flex items-center gap-1.5 mr-2 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-[#C04A22] text-white text-[11px] font-semibold shadow-md shadow-orange-500/20 hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/40 select-none animate-pulse"
        title="কোথায় যেতে চান? ক্লিক করুন"
      >
        <Sparkles className="w-3 h-3 text-yellow-200 animate-spin" style={{ animationDuration: "4s" }} />
        <span>সহায়তা চাই</span>
      </button>

      {/* 3D Doll Avatar Bubble */}
      <button
        type="button"
        onClick={onClick}
        className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-[#E05236] to-[#C04A22] shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C04A22] focus:ring-offset-2"
        title="পথসাথী স্মার্ট সাথী (ক্লিক করে চ্যাটবক্স খুলুন)"
      >
        {/* Outer pulsating ring */}
        <span className="absolute -inset-1 rounded-full bg-orange-400/30 animate-ping pointer-events-none" style={{ animationDuration: "3s" }} />

        {/* Doll Image inner wrapper */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-orange-100 border-2 border-white flex items-center justify-center">
          <img
            src="/doll_assistant.jpg"
            alt="PathaSathi AI Doll"
            className="w-full h-full object-cover object-center transform hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-xl pointer-events-none -z-10">
            🧸
          </span>
        </div>

        {/* Online Status Green Indicator Badge */}
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-white rounded-full" />
        </span>

        {/* Active badge overlay if open */}
        {isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C04A22] border-2 border-white rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            ✓
          </span>
        )}
      </button>
    </div>
  );
}

// ── Verified Service Types & Categories (Types of Services & Jobs) ───────────
export const VERIFIED_SERVICE_TYPES: Record<string, ServiceTypeSuggestion[]> = {
  jobs: [
    {
      id: "job-warehouse",
      title: "Warehouse & Logistics jobs",
      bnTitle: "ওয়্যারহাউস ও লজিস্টিকস জব",
      typeLabel: "Warehouse & Logistics",
      bnTypeLabel: "ওয়্যারহাউস ও প্যাকেজিং",
      category: "jobs",
      searchQuery: "warehouse",
    },
    {
      id: "job-delivery",
      title: "Driver & Delivery jobs",
      bnTitle: "ড্রাইভার ও ডেলিভারি জব",
      typeLabel: "Delivery & Courier",
      bnTypeLabel: "ড্রাইভিং ও ফুড ডেলিভারি",
      category: "jobs",
      searchQuery: "delivery driver",
    },
    {
      id: "job-restaurant",
      title: "Restaurant & Kitchen staff jobs",
      bnTitle: "রেস্তোরাঁ ও কিচেন জব",
      typeLabel: "Restaurant & Kitchen",
      bnTypeLabel: "রেস্তোরাঁ ও ফুড সার্ভিস",
      category: "jobs",
      searchQuery: "restaurant cook kitchen",
    },
    {
      id: "job-retail",
      title: "Retail Store & Cashier jobs",
      bnTitle: "রিটেইল স্টোর ও ক্যাশিয়ার জব",
      typeLabel: "Retail & Sales",
      bnTypeLabel: "গ্রোসারি ও রিটেইল সেলস",
      category: "jobs",
      searchQuery: "retail cashier sales",
    },
    {
      id: "job-technician",
      title: "Maintenance & Technician jobs",
      bnTitle: "কনস্ট্রাকশন ও টেকনিশিয়ান জব",
      typeLabel: "Technician & Labor",
      bnTypeLabel: "টেকনিশিয়ান ও মেইনটেন্যান্স",
      category: "jobs",
      searchQuery: "technician maintenance",
    },
  ],
  greencard_legal: [
    {
      id: "legal-family",
      title: "Family Green Card & I-130 Petition services",
      bnTitle: "পারিবারিক গ্রিন কার্ড ও আই-১৩০ আবেদন সেবা",
      typeLabel: "Family Green Card",
      bnTypeLabel: "পারিবারিক গ্রিন কার্ড",
      category: "lawyer",
      searchQuery: "green card lawyer",
    },
    {
      id: "legal-asylum",
      title: "Asylum & Work Permit (EAD) legal defense",
      bnTitle: "রাজনৈতিক আশ্রয় ও ওয়ার্ক পারমিট (EAD) আইনি সেবা",
      typeLabel: "Asylum & Work Permit",
      bnTypeLabel: "অ্যাসাইলাম ও ওয়ার্ক পারমিট",
      category: "lawyer",
      searchQuery: "asylum legal aid",
    },
    {
      id: "legal-probono",
      title: "Free Pro-Bono Legal Aid & Court defense",
      bnTitle: "ফ্রি লিগ্যাল এইড ও কোর্ট ডিফেন্স সেবা",
      typeLabel: "Free Pro-Bono Aid",
      bnTypeLabel: "ফ্রি লিগ্যাল এইড",
      category: "lawyer",
      searchQuery: "legal aid",
    },
    {
      id: "legal-citizenship",
      title: "Citizenship & Fee Waiver clinic services",
      bnTitle: "সিটিজেনশিপ প্রসেসিং ও আবেদন ফি মওকুফ সেবা",
      typeLabel: "Citizenship Clinic",
      bnTypeLabel: "সিটিজেনশিপ ও ফি মওকুফ",
      category: "lawyer",
      searchQuery: "citizenship clinic",
    },
  ],
  asylum_tps: [
    {
      id: "asylum-filing",
      title: "Political Asylum (Form I-589) filing services",
      bnTitle: "পলিটিক্যাল অ্যাসাইলাম (I-589) আবেদন সেবা",
      typeLabel: "Asylum Application",
      bnTypeLabel: "অ্যাসাইলাম আবেদন",
      category: "lawyer",
      searchQuery: "asylum defense",
    },
    {
      id: "asylum-ead",
      title: "Work Permit (Form I-765) renewal services",
      bnTitle: "ওয়ার্ক পারমিট (EAD) নবায়ন ও ফি মওকুফ সেবা",
      typeLabel: "Work Permit EAD",
      bnTypeLabel: "ওয়ার্ক পারমিট নবায়ন",
      category: "lawyer",
      searchQuery: "work permit ead",
    },
    {
      id: "asylum-court",
      title: "Immigration Court & Deportation Defense",
      bnTitle: "ইমিগ্রেশন কোর্ট ও ডিপোর্টেশন ডিফেন্স সেবা",
      typeLabel: "Court Defense",
      bnTypeLabel: "কোর্ট ডিফেন্স",
      category: "lawyer",
      searchQuery: "court defense lawyer",
    },
  ],
  dmv_license: [
    {
      id: "dmv-greenlight",
      title: "Green Light Driver License services (any status)",
      bnTitle: "গ্রিন লাইট ড্রাইভিং লাইসেন্স সেবা (যেকোনো স্ট্যাটাস)",
      typeLabel: "Green Light License",
      bnTypeLabel: "গ্রিন লাইট লাইসেন্স",
      category: "dmv",
      searchQuery: "dmv green light license",
    },
    {
      id: "dmv-permit",
      title: "Learner Permit Written Exam testing services",
      bnTitle: "লার্নার পারমিট ও লিখিত পরীক্ষা সেবা",
      typeLabel: "Learner Permit",
      bnTypeLabel: "লার্নার পারমিট টেস্ট",
      category: "dmv",
      searchQuery: "dmv permit test",
    },
    {
      id: "dmv-stateid",
      title: "Non-Driver NY State ID Card services",
      bnTitle: "নিউইয়র্ক নন-ড্রাইভার স্টেট আইডি কার্ড সেবা",
      typeLabel: "State ID Card",
      bnTypeLabel: "স্টেট আইডি কার্ড",
      category: "dmv",
      searchQuery: "dmv state id",
    },
  ],
  halal_food: [
    {
      id: "halal-meat",
      title: "Fresh Zabiha Halal Meat markets",
      bnTitle: "তাজা জবিহা হালাল মাংস ও দেশি গ্রোসারি",
      typeLabel: "Halal Meat & Market",
      bnTypeLabel: "হালাল মাংস ও গ্রোসারি",
      category: "groceries",
      searchQuery: "halal meat grocery",
    },
    {
      id: "halal-fish",
      title: "Bangladeshi Padma Ilish & imported grocery stores",
      bnTitle: "পদ্মার ইলিশ ও আমদানিকৃত বাংলাদেশি গ্রোসারি",
      typeLabel: "Bangladeshi Grocery",
      bnTypeLabel: "দেশি মাছ ও নিত্যপণ্য",
      category: "groceries",
      searchQuery: "bangladeshi grocery",
    },
    {
      id: "halal-dining",
      title: "Authentic Halal Restaurants & Biryani spots",
      bnTitle: "খাঁটি সাউথ এশিয়ান হালাল খাবার ও বিরিয়ানি",
      typeLabel: "Halal Dining",
      bnTypeLabel: "হালাল বিরিয়ানি ও রেস্তোরাঁ",
      category: "restaurant",
      searchQuery: "halal restaurant biryani",
    },
  ],
  healthcare: [
    {
      id: "health-nyccare",
      title: "NYC Care low-cost doctor & primary healthcare",
      bnTitle: "NYC কেয়ার স্বল্পমূল্যে ডাক্তার ও প্রাথমিক চিকিৎসা সেবা",
      typeLabel: "NYC Care Doctor",
      bnTypeLabel: "NYC কেয়ার ডাক্তার",
      category: "hospital",
      searchQuery: "nyc care clinic",
    },
    {
      id: "health-emergency",
      title: "Emergency Room treatment without status check",
      bnTitle: "স্ট্যাটাস যাচাই ছাড়াই জরুরি হাসপাতাল চিকিৎসা সেবা",
      typeLabel: "Emergency Hospital",
      bnTypeLabel: "জরুরি হাসপাতাল সেবা",
      category: "hospital",
      searchQuery: "emergency hospital",
    },
    {
      id: "health-clinic",
      title: "Community Free Clinics & prescription support",
      bnTitle: "বিনামূল্যে হেলথ চেকআপ ও প্রেসক্রিপশন সেবা",
      typeLabel: "Free Health Clinic",
      bnTypeLabel: "ফ্রি হেলথ ক্লিনিক",
      category: "hospital",
      searchQuery: "free health clinic",
    },
  ],
  housing: [
    {
      id: "housing-sublet",
      title: "Room rentals & sublets without credit check",
      bnTitle: "ক্রেডিট হিস্টোরি ছাড়া রুম ও সাবলেট আবাসন",
      typeLabel: "Sublet & Rooms",
      bnTypeLabel: "রুম ও সাবলেট ভাড়া",
      category: "housing",
      searchQuery: "sublet housing",
    },
    {
      id: "housing-rights",
      title: "Free Tenant Rights & Eviction Defense counseling",
      bnTitle: "ভাড়াটিয়াদের আইনি অধিকার ও উচ্ছেদ প্রতিরোধ সেবা",
      typeLabel: "Tenant Protections",
      bnTypeLabel: "ভাড়াটিয়ার আইনি অধিকার",
      category: "housing",
      searchQuery: "tenant rights housing",
    },
  ],
  mosque: [
    {
      id: "mosque-prayer",
      title: "Daily 5x Prayer & Friday Jummah congregational services",
      bnTitle: "দৈনিক ৫ ওয়াক্ত নামাজ ও জুম্মা জামাত",
      typeLabel: "Daily Prayer & Jummah",
      bnTypeLabel: "দৈনিক নামাজ ও জুম্মা",
      category: "mosque",
      searchQuery: "mosque prayer",
    },
    {
      id: "mosque-community",
      title: "Newcomer immigrant halal food pantry & social services",
      bnTitle: "নতুন প্রবাসীদের সহায়তা ও হালাল ফুড প্যান্ট্রি",
      typeLabel: "Community Services",
      bnTypeLabel: "সোশ্যাল সার্ভিস ও প্যান্ট্রি",
      category: "mosque",
      searchQuery: "islamic community center",
    },
  ],
};

// ── Verified Service Location Pinpoints for Immigrant Support ──────────────────
export const VERIFIED_SERVICE_PINPOINTS: Record<string, LocationPinpoint[]> = {
  greencard_legal: [
    {
      id: "qls-imm",
      name: "Queens Legal Services (Immigration Unit)",
      category: "⚖️ Free Legal Aid",
      address: "89-00 Sutphin Blvd, Jamaica, NY 11435",
      distance: "0.8 mi",
      lat: 40.7042,
      lng: -73.8078,
      phone: "+1 (718) 391-1332",
      rating: 4.9,
      description: "Free pro-bono immigration attorney counsel, Green Card & Adjustment of Status (Form I-485) assistance.",
      badge: "PRO BONO",
      highlight: "Bengali-speaking immigration lawyers & free legal aid",
      bnHighlight: "বাংলাভাষী আইনজীবী ও ফ্রি লিগ্যাল এইড পেতে",
    },
    {
      id: "uscis-nyc",
      name: "USCIS New York District & Field Office",
      category: "🏛️ Federal Immigration Center",
      address: "26 Federal Plaza, New York, NY 10278",
      distance: "1.5 mi",
      lat: 40.7153,
      lng: -74.0039,
      phone: "+1 (800) 375-5283",
      rating: 4.8,
      description: "Official federal office for I-485 Adjustment of Status, biometric appointments, and Green Card interviews.",
      badge: "OFFICIAL USCIS",
      highlight: "Official Green Card interviews & biometrics center",
      bnHighlight: "গ্রিন কার্ড ইন্টারভিউ ও বায়োমেট্রিক্স সার্ভিস দিতে",
    },
    {
      id: "cuny-cit",
      name: "CUNY Citizenship Now! Legal Center",
      category: "⚖️ University Legal Clinic",
      address: "31-10 Thomson Ave, Long Island City, NY 11101",
      distance: "2.1 mi",
      lat: 40.7441,
      lng: -73.9351,
      phone: "+1 (646) 664-9400",
      rating: 4.9,
      description: "Free high-quality immigration legal services, fee waiver assistance, and naturalization clinics.",
      badge: "FREE AID",
      highlight: "Free citizenship clinics & fee waiver legal assistance",
      bnHighlight: "ফ্রি সিটিজেনশিপ ও আবেদন ফি মওকুফ ক্লিনিক পেতে",
    },
  ],
  asylum_tps: [
    {
      id: "asylum-defense",
      name: "Asylum & Free Legal Aid Defense",
      category: "⚖️ Immigrant Defense",
      address: "120-46 Queens Blvd, Kew Gardens, NY 11415",
      distance: "1.2 mi",
      lat: 40.7092,
      lng: -73.8242,
      phone: "+1 (718) 391-1332",
      rating: 4.9,
      description: "Pro-bono counsel for political asylum (Form I-589), credible fear interviews, and deportation defense.",
      badge: "PRO BONO",
      highlight: "Pro-bono political asylum & court defense lawyers",
      bnHighlight: "পলিটিক্যাল অ্যাসাইলাম ও কোর্ট ডিফেন্স আইনজীবী পেতে",
    },
    {
      id: "qls-imm",
      name: "Queens Legal Services (Immigration Unit)",
      category: "⚖️ Free Legal Aid",
      address: "89-00 Sutphin Blvd, Jamaica, NY 11435",
      distance: "0.8 mi",
      lat: 40.7042,
      lng: -73.8078,
      phone: "+1 (718) 391-1332",
      rating: 4.9,
      description: "Free immigration court defense and EAD work permit renewals.",
      badge: "FREE AID",
      highlight: "Bengali-speaking asylum counsel & work permit renewals",
      bnHighlight: "বাংলাভাষী অ্যাসাইলাম ও ওয়ার্ক পারমিট আইনজীবী পেতে",
    },
  ],
  dmv_license: [
    {
      id: "dmv-jamaica",
      name: "Jamaica DMV Office (NY State)",
      category: "🚗 DMV Center",
      address: "168-46 91st Ave, 2nd Fl, Jamaica, NY 11432",
      distance: "0.6 mi",
      lat: 40.7065,
      lng: -73.7942,
      phone: "+1 (718) 966-6155",
      rating: 4.6,
      description: "Official NY DMV issuing Green Light Law driver licenses regardless of immigration status.",
      badge: "GREEN LIGHT",
      highlight: "Green Light driver license & learner permit for all immigrants",
      bnHighlight: "গ্রিন লাইট ড্রাইভিং লাইসেন্স ও লার্নার পারমিট পেতে",
    },
    {
      id: "dmv-queens-west",
      name: "Queens West DMV Office",
      category: "🚗 DMV Center",
      address: "30-56 Whitestone Expy, Flushing, NY 11354",
      distance: "2.8 mi",
      lat: 40.7712,
      lng: -73.8341,
      phone: "+1 (718) 966-6155",
      rating: 4.5,
      description: "Full service motor vehicle office for permit tests, licenses, and non-driver IDs.",
      highlight: "Non-driver State ID card & road test appointments",
      bnHighlight: "নিউইয়র্ক স্টেট আইডি ও ড্রাইভিং লাইসেন্স পেতে",
    },
  ],
  halal_food: [
    {
      id: "halal-mart-jh",
      name: "Little Bangladesh Grocery & Halal Mart",
      category: "🛒 Halal Grocery",
      address: "73-12 37th Ave, Jackson Heights, NY 11372",
      distance: "0.5 mi",
      lat: 40.7491,
      lng: -73.8912,
      phone: "+1 (718) 898-1122",
      rating: 4.9,
      description: "Fresh halal meat, imported Padma Ilish, Bangladeshi spices, and daily staples.",
      badge: "ZABIHAH",
      highlight: "Fresh Zabiha halal meat, Padma Ilish & Bangladeshi food",
      bnHighlight: "তাজা হালাল মাংস, পদ্মার ইলিশ ও দেশি বাজার পেতে",
    },
    {
      id: "kabab-king",
      name: "Kabab King & Halal Diner",
      category: "🍽️ Halal Restaurant",
      address: "73-01 37th Ave, Jackson Heights, NY 11372",
      distance: "0.5 mi",
      lat: 40.7490,
      lng: -73.8916,
      phone: "+1 (718) 457-5855",
      rating: 4.8,
      description: "Famous authentic South Asian halal kababs, biryani, curries, and fresh naan.",
      highlight: "Authentic halal kacchi biryani, tandoori kababs & dining",
      bnHighlight: "খাঁটি হালাল কাচ্চি বিরিয়ানি ও কাবাব খেতে",
    },
  ],
  healthcare: [
    {
      id: "hosp-elmhurst",
      name: "NYC Health + Hospitals / Elmhurst",
      category: "🏥 Public Hospital",
      address: "79-01 Broadway, Elmhurst, NY 11373",
      distance: "1.1 mi",
      lat: 40.7447,
      lng: -73.8856,
      phone: "+1 (718) 334-4000",
      rating: 4.8,
      description: "NYC Care certified public hospital offering low-cost/free emergency care to all immigrants regardless of status.",
      badge: "NYC CARE",
      highlight: "NYC Care free/low-cost hospital treatment (no status check)",
      bnHighlight: "NYC কেয়ার ফ্রি/স্বল্পমূল্যে জরুরি ডাক্তার ও চিকিৎসা পেতে",
    },
    {
      id: "comm-health-clinic",
      name: "Community Free Health Clinic",
      category: "🏥 Community Clinic",
      address: "97-04 Sutphin Blvd, Jamaica, NY 11435",
      distance: "0.7 mi",
      lat: 40.7011,
      lng: -73.8075,
      phone: "+1 (718) 657-7088",
      rating: 4.7,
      description: "Sliding-scale healthcare, free preventive checkups, and prescription assistance.",
      highlight: "Free community doctor checkup & prescription assistance",
      bnHighlight: "বিনামূল্যে হেলথ চেকআপ ও প্রেসক্রিপশন সেবা পেতে",
    },
  ],
  jobs: [
    {
      id: "nys-dol-career",
      name: "NYS Department of Labor Career Center",
      category: "💼 Career Center",
      address: "168-25 Jamaica Ave, 2nd Fl, Jamaica, NY 11432",
      distance: "0.5 mi",
      lat: 40.7061,
      lng: -73.7951,
      phone: "+1 (718) 557-6755",
      rating: 4.7,
      description: "Free job placement, resume review, career workshops, and vocational training for immigrants.",
      badge: "FREE CAREER",
      highlight: "Free job placement, resume review & career workshops",
      bnHighlight: "বিনামূল্যে চাকরি খোঁজা, রেজুমে ও জব ট্রেইনিং পেতে",
    },
    {
      id: "queens-job-hub",
      name: "Queens Job Help & Placement Hub",
      category: "💼 Employment Agency",
      address: "90-04 161st St, Jamaica, NY 11432",
      distance: "0.7 mi",
      lat: 40.7055,
      lng: -73.7995,
      phone: "+1 (718) 523-2288",
      rating: 4.8,
      description: "Connecting immigrants to verified legal employment, warehouse, logistics, and hospitality positions.",
      highlight: "Verified legal employment in warehouse, logistics & hospitality",
      bnHighlight: "ইমিগ্র্যান্টদের জন্য ভেরিফায়েড কর্মসংস্থান ও জব প্লেসমেন্ট পেতে",
    },
  ],
  mosque: [
    {
      id: "masjid-altaqwa",
      name: "Masjid Al-Taqwa & Community Center",
      category: "🕌 Mosque & Community",
      address: "1266 Bedford Ave, Brooklyn, NY 11216",
      distance: "1.8 mi",
      lat: 40.6819,
      lng: -73.9536,
      phone: "+1 (718) 622-0800",
      rating: 4.9,
      description: "Vibrant community mosque offering Islamic education, Halal food distributions, and newcomer social services.",
      badge: "COMMUNITY",
      highlight: "Daily 5x prayer, Jummah & newcomer community support",
      bnHighlight: "দৈনিক পাঁচ ওয়াক্ত জামাত, জুম্মা ও হালাল ফুড প্যান্ট্রি পেতে",
    },
    {
      id: 1,
      name: "Baitul Mukarram National Mosque",
      category: "🕌 Mosque",
      address: "Paltan, Dhaka",
      distance: "0.3 km",
      lat: 23.7315,
      lng: 90.4075,
      phone: "+880 2-9556000",
      rating: 4.9,
      description: "National mosque with daily 5 times prayer and community services.",
      highlight: "National mosque daily prayers & Islamic gatherings",
      bnHighlight: "দৈনিক জামাতে নামাজ ও ইসলামিক সোশ্যাল সার্ভিস পেতে",
    },
  ],
  housing: [
    {
      id: "qch-housing",
      name: "Queens Community House (Housing Assistance)",
      category: "🏠 Housing Assistance",
      address: "108-25 62nd Dr, Forest Hills, NY 11375",
      distance: "1.9 mi",
      lat: 40.7301,
      lng: -73.8524,
      phone: "+1 (718) 592-5757",
      rating: 4.8,
      description: "Free counseling for finding affordable apartments, lease protections, and tenant rights.",
      badge: "TENANT RIGHTS",
      highlight: "Tenant rights, emergency shelter & rental subsidy help",
      bnHighlight: "ভাড়াটিয়াদের আইনি অধিকার ও জরুরি আবাসন সহায়তা পেতে",
    },
  ],
};

// Search places from MapDiscovery
function findMapPlaces(query: string): LocationPinpoint[] {
  const q = query.toLowerCase();
  const matched = places.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
  );
  return matched.slice(0, 2).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    address: p.address,
    distance: p.distance,
    lat: p.lat,
    lng: p.lng,
    phone: p.phone,
    rating: p.rating,
    description: p.description,
    highlight: p.description ? p.description.slice(0, 50) : `${p.category} services`,
    bnHighlight: p.description ? p.description.slice(0, 50) : `${p.category} সেবা পেতে`,
  }));
}

// ── ChatGPT-Style AI Query & Response Engine with Service Type Suggestions ────
export function generateChatGPTAnswerAndPinpoints(
  rawQuery: string,
  userLang: string
): {
  text: string;
  serviceTypes?: ServiceTypeSuggestion[];
  pinpoints?: LocationPinpoint[];
  destination?: { name: string; route: string; state?: any };
} {
  const query = rawQuery.toLowerCase().trim();
  const isBangla =
    /[\u0980-\u09FF]/.test(rawQuery) ||
    userLang === "bn" ||
    /\b(ami|tumi|apni|chai|kivabe|korbo|koro|pabo|lagbe|ache|achhe|ki|kothay|dekhao|bolo)\b/i.test(rawQuery);

  // 1. Green Card / Permanent Residency (User's primary request)
  if (
    /green\s*card|greencard|permanent\s*resident|i-485|i-130|adjustment\s*of\s*status|গ্রিন\s*কার্ড|গ্রিনকার্ড|পিআর|স্থায়ী\s*বাসিন্দা/i.test(
      query
    )
  ) {
    if (isBangla) {
      return {
        text: `যুক্তরাষ্ট্রে **গ্রিন কার্ড (Permanent Resident Card)** পাওয়ার প্রধান নিয়ম ও ধাপসমূহ:

**১. আবেদনের প্রধান মাধ্যমসমূহ:**
• **পারিবারিক স্পন্সরশিপ (Family):** মার্কিন নাগরিকের স্পাউস (স্বামী/স্ত্রী), ২১ বছরের কম বয়সী অবিবাহিত সন্তান বা পিতা-মাতা (Immediate Relative)।
• **চাকরিভিত্তিক (Employment):** EB-1 (এক্সট্রাঅর্ডিনারি অ্যাবিলিটি), EB-2 (National Interest Waiver / অ্যাডভান্সড ডিগ্রি), অথবা নিয়োগকর্তা কর্তৃক স্পন্সরকৃত EB-3।
• **অ্যাসাইলাম বা শরণার্থী:** রাজনৈতিক আশ্রয় অনুমোদনের ঠিক ১ বছর পূর্ণ হলে গ্রিন কার্ডের আবেদন করা যায়।
• **ডিভি লটারি (Diversity Visa):** যোগ্য দেশের নাগরিকদের জন্য বার্ষিক অনলাইন লটারি।

**২. মূল আবেদন প্রক্রিয়া ও ধাপ:**
১. **পিটিশন দাখিল:** স্পন্সর Form I-130 (পরিবার) বা Form I-140 (কর্মসংস্থান) ইউএসসিআইএসে দাখিল করবেন।
২. **স্ট্যাটাস অ্যাডজাস্টমেন্ট (AOS):** আপনি বৈধভাবে যুক্তরাষ্ট্রে অবস্থান করলে **Form I-485** জমা দিন (দেশের বাইরে থাকলে কনস্যুলার প্রসেসিং DS-260)।
৩. **ওয়ার্ক ও ট্রাভেল পারমিট:** একই সাথে কাজের জন্য **Form I-765 (EAD)** এবং দেশে যাওয়ার জন্য **Form I-131 (Advance Parole)** জমা দিন।
৪. **বায়োমেট্রিক ও মেডিকেল:** সিভিল সার্জন কর্তৃক সিলগালা করা **Form I-693** মেডিকেল রিপোর্ট জমা দিন ও ফিঙ্গারপ্রিন্ট সম্পন্ন করুন।
৫. **ইন্টারভিউ ও অনুমোদন:** লোকাল USCIS ফিল্ড অফিসে নির্ধারিত ইন্টারভিউ সফলভাবে সম্পন্ন হলে গ্রিন কার্ড ইস্যু হবে।

💡 **পরামর্শ:** যে কোনো ফর্ম জমা দেওয়ার আগে অনুমোদিত ফ্রি লিগ্যাল এইড ক্লিনিক অথবা বিশ্বস্ত ইমিগ্রেশন অ্যাটর্নির পরামর্শ নিন। নিচে প্রয়োজনীয় সার্ভিসের ধরন ও সুযোগের লিংক দেওয়া হলো:`,
        serviceTypes: VERIFIED_SERVICE_TYPES.greencard_legal,
      };
    }

    return {
      text: `Here is a complete guide on **how to get a U.S. Green Card (Permanent Residency)**:

**1. Primary Eligibility Pathways:**
• **Family-Sponsored:** Immediate relative of a U.S. citizen (spouse, unmarried children under 21, or parents) or Family Preference categories.
• **Employment-Based:** EB-1 (extraordinary ability), EB-2 / NIW (advanced degrees or national interest), or EB-3 (skilled workers sponsored by a U.S. employer via PERM labor certification).
• **Asylum & Refugee Status:** You can apply for a Green Card exactly 1 year after your asylum grant date.
• **Diversity Visa (DV Lottery):** Free annual visa lottery program for qualifying countries.

**2. Step-by-Step Application Process:**
1. **Immigrant Petition:** Your sponsor files **Form I-130** (family) or **Form I-140** (employment) with USCIS.
2. **Adjustment of Status (AOS):** If you are lawfully inside the U.S. and your priority date is current, file **Form I-485**. (If outside the U.S., apply via Consular Processing Form DS-260).
3. **Work & Travel Authorization:** Concurrently submit **Form I-765 (EAD)** for work authorization and **Form I-131 (Advance Parole)** for emergency travel.
4. **Biometrics & Medical Exam:** Complete fingerprinting and the sealed medical examination (**Form I-693**) signed by a designated Civil Surgeon.
5. **Interview & Card Issuance:** Attend your in-person interview at the local USCIS Field Office, answer questions honestly, and receive your Green Card!

⚠️ **Crucial Advice:** Never pay unauthorized "notarios". Verified pro-bono immigration clinics provide free help filing these forms. Explore the available service types below:`,
      serviceTypes: VERIFIED_SERVICE_TYPES.greencard_legal,
    };
  }

  // 2. Asylum & TPS (রাজনৈতিক আশ্রয়)
  if (
    /asylum|refugee|i-589|credible\s*fear|deportation|tps|অ্যাসাইলাম|আশ্রয়|শরণার্থী|কেস|ই-৫৮৯/i.test(
      query
    )
  ) {
    if (isBangla) {
      return {
        text: `যুক্তরাষ্ট্রে **অ্যাসাইলাম (রাজনৈতিক আশ্রয়)** আবেদনের জরুরি নিয়ম ও ধাপ:

**১. এক বছরের সময়সীমা (1-Year Deadline):**
• যুক্তরাষ্ট্রে পৌঁছানোর **১ বছরের মধ্যে Form I-589** দাখিল করা বাধ্যতামূলক (ব্যতিক্রম প্রমাণযোগ্য কারণ ছাড়া)।
**২. অ্যাফারমেটিভ বনাম ডিফেন্সিভ অ্যাসাইলাম:**
• আপনি কোনো ডিপোর্টেশন কেইসে না থাকলে সরাসরি USCIS-এ আবেদন করবেন। কোর্ট প্রসিডিংসে থাকলে ইমিগ্রেশন জজের কাছে শুনানি হবে।
**৩. কাজের অনুমতি (EAD Work Permit):**
• Form I-589 জমার ১৫০ দিন পর আপনি ক্যাটাগরি (c)(8)-এর আওতায় ওয়ার্ক পারমিটের (Form I-765) আবেদন করতে পারবেন এবং ১৮০ দিনের ঘড়িতে অনুমোদন পাবেন।
**৪. আইনি সহায়তা:**
• কোর্টে একা যাবেন না। লিগ্যাল এইড সংস্থাগুলি বিনামূল্যে পরামর্শ ও ডিফেন্স প্রদান করে। প্রয়োজনীয় সার্ভিসের সুযোগের লিংক নিচে দেওয়া হলো:`,
        serviceTypes: VERIFIED_SERVICE_TYPES.asylum_tps,
      };
    }

    return {
      text: `Here is what you need to know about the **U.S. Political Asylum Process**:

**1. One-Year Filing Deadline:**
• You must submit **Form I-589** within **1 year** of your arrival in the United States, unless you prove extraordinary circumstances.
**2. Affirmative vs. Defensive Asylum:**
• **Affirmative:** Filed with USCIS if you are in lawful status or not facing immigration court removal proceedings.
• **Defensive:** Presented in front of an Immigration Judge (EOIR) if you were issued a Notice to Appear (NTA).
**3. Work Authorization (EAD Clock):**
• 150 days after USCIS receives your complete I-589, you are eligible to file **Form I-765** under category (c)(8). It can be granted once 180 days have accrued on the asylum clock.
**4. Free Legal Defense:**
• Do not attend hearings alone. Nonprofit pro-bono legal teams provide free credible fear interview prep and court representation. Explore the service options below:`,
      serviceTypes: VERIFIED_SERVICE_TYPES.asylum_tps,
    };
  }

  // 3. Driver's License & DMV (গ্রিন লাইট ল)
  if (
    /driver|driving|license|dmv|permit|learner|green\s*light|ড্রাইভিং|লাইসেন্স|ডিএমভি|গাড়ি\s*চালানো/i.test(
      query
    )
  ) {
    if (isBangla) {
      return {
        text: `নিউইয়র্কে ইমিগ্রেশন স্ট্যাটাস বা SSN ছাড়াও **ড্রাইভিং লাইসেন্স** পাওয়ার নিয়ম:

**১. গ্রিন লাইট ল (Green Light Law):**
• ১৬ বছর বা তদূর্ধ্ব যেকোনো অভিবাসী সোশ্যাল সিকিউরিটি নম্বর (SSN) ছাড়াই বৈধ স্ট্যান্ডার্ড ড্রাইভার লাইসেন্স নিতে পারেন।
**২. প্রয়োজনীয় ডকুমেন্টস (৬ পয়েন্ট আইডি):**
• মূল বিদেশি পাসপোর্ট (Foreign Passport) অথবা কনস্যুলার আইডি কার্ড।
• নিউইয়র্কের ঠিকানার প্রমাণ (লেটার, বিদ্যুৎ/গ্যাস বিল, বা ব্যাংক স্টেটমেন্ট)।
• এসএসএন না থাকলে DMV Form NSS-1A নো-এসএসএন হলফনামা।
**৩. ডিএমভিতে করণীয় ধাপ:**
১. অনলাইনে ডিএমভিতে লার্নার পারমিট টেস্ট বুক করুন।
২. লিখিত ও দৃষ্টি পরীক্ষায় পাস করে লার্নার পারমিট নিন।
৩. ৫ ঘণ্টার প্রি-লাইসেন্সিং কোর্স করুন ও রোড টেস্ট পাস করে লাইসেন্স গ্রহণ করুন।

লাইসেন্স ও আইডি সংক্রান্ত সার্ভিসের সুযোগের লিংক নিচে দেওয়া হলো:`,
        serviceTypes: VERIFIED_SERVICE_TYPES.dmv_license,
      };
    }

    return {
      text: `How to get a **Driver's License in New York** regardless of immigration status:

**1. NY Green Light Law (Driver's License Access & Privacy Act):**
• All residents age 16+ can apply for a standard driver's license without needing a Social Security Number (SSN) or proof of lawful immigration status.
**2. Required Identification (6 Points of ID):**
• Valid Foreign Passport or Consular Identification Card.
• Proof of NY State residency (lease agreement, utility bills, or bank statements).
• Form NSS-1A (Affidavit stating you have never been issued an SSN).
**3. Steps at the DMV:**
1. Study the NY Driver's Manual and book an online permit appointment.
2. Pass the written knowledge and vision test to get your Learner Permit.
3. Complete the mandatory 5-Hour Pre-Licensing course.
4. Schedule and pass your Road Test to receive your official driver's license!

Relevant driver license and DMV service links are listed below:`,
      serviceTypes: VERIFIED_SERVICE_TYPES.dmv_license,
    };
  }

  // 4. Halal Food & Groceries (হালাল খাবার)
  if (
    /halal|food|grocery|meat|ilish|restaurant|eating|dining|haalal|হালাল|খাবার|ইলিশ|মাংস|রেস্টুরেন্ট|বাজার|গ্রোসারি/i.test(
      query
    )
  ) {
    if (isBangla) {
      return {
        text: `সেরা **হালাল খাবার ও দেশি গ্রোসারি** শপ এবং রেস্তোরাঁ:

• **জ্যাকসন হাইটস ও ব্রঙ্কস:** তাজা জবিহা হালাল গরুর মাংস, খাসি এবং বাংলাদেশ থেকে আমদানিকৃত পদ্মা নদীর ইলিশ মাছ পাওয়া যায়।
• **হোম ডেলিভারি ও প্যাকেজ:** বেশিরভাগ দেশি গ্রোসারি শপ একই দিনে ফ্রেশ কাটিং ও হোম ডেলিভারি দিয়ে থাকে।
• **রেস্টুরেন্ট:** খাঁটি কাচ্চি বিরিয়ানি, চাপ, কাবাব ও তাজা নানের জন্য বিখ্যাত হালাল স্পটসমূহ।

নিচে প্রয়োজনীয় হালাল খাদ্য ও গ্রোসারি সার্ভিসের সুযোগের লিংক দেওয়া হলো:`,
        serviceTypes: VERIFIED_SERVICE_TYPES.halal_food,
      };
    }

    return {
      text: `Top **Halal Food & Bangladeshi Grocery** services:

• **Fresh Halal Meat & Seafood:** Authentic Zabihah certified beef, goat, and fresh imported Padma Ilish (Hilsa fish) with daily custom cuts.
• **Authentic Dining:** Traditional Kacchi Biryani, seekh kababs, bhorta platters, and clay oven naans.
• Direct service category links are provided below:`,
      serviceTypes: VERIFIED_SERVICE_TYPES.halal_food,
    };
  }

  // 5. Hospital, Doctor & Healthcare (স্বাস্থ্যসেবা ও ডাক্তার)
  if (
    /hospital|doctor|medicine|clinic|health|sick|emergency|ill|treatment|হাসপাতাল|ডাক্তার|ওষুধ|ক্লিনিক|চিকিৎসা|জরুরী|অসুখ/i.test(
      query
    )
  ) {
    if (isBangla) {
      return {
        text: `অভিবাসীদের জন্য **বিনামূল্যে ও স্বল্পমূল্যে স্বাস্থ্যসেবা (NYC Care)**:

• **NYC Care প্রকল্প:** আপনার কোনো ইন্স্যুরেন্স বা বৈধ স্ট্যাটাস না থাকলেও NYC হেলথ + হসপিটালে একজন স্থায়ী প্রাইমারি ডাক্তার এবং স্বল্পমূল্যে প্রেসক্রিপশনের ওষুধ পাবেন।
• **ইমার্জেন্সি মেডিকেইড:** হাসপাতালে জরুরি বা প্রসবকালীন চিকিৎসায় সম্পূর্ণ বিনা খরচে ইমার্জেন্সি মেডিকেইড কভার করে। কোনো অভিবাসন তথ্য যাচাই করা হয় না।

স্বাস্থ্যসেবা ও ক্লিনিক সার্ভিসের সুযোগের লিংক নিচে দেওয়া হলো:`,
        serviceTypes: VERIFIED_SERVICE_TYPES.healthcare,
      };
    }

    return {
      text: `Essential **Healthcare & Hospital Access** for Immigrants:

• **NYC Care Program:** Guaranteed low-cost or free healthcare through NYC Health + Hospitals regardless of your immigration status or ability to pay. Includes a dedicated doctor and affordable prescriptions.
• **Emergency Medicaid:** Emergency Room care and maternal/labor delivery are 100% covered with zero immigration consequence under confidentiality protections.
• Direct links to primary healthcare and clinic services are provided below:`,
      serviceTypes: VERIFIED_SERVICE_TYPES.healthcare,
    };
  }

  // 6. Work Permit / EAD (কাজের অনুমতি)
  if (
    /work\s*permit|ead|i-765|employment\s*authorization|কাজের\s*অনুমতি|ওয়ার্ক\s*পারমিট|ইএড/i.test(
      query
    )
  ) {
    if (isBangla) {
      return {
        text: `যুক্তরাষ্ট্রে **ওয়ার্ক পারমিট (Employment Authorization Document - EAD)** গাইড:

**১. আবেদনের ফরম ও ক্যাটাগরি:**
• আবেদন করতে হয় **Form I-765** দিয়ে।
• অ্যাসাইলাম আবেদনকারীদের জন্য ক্যাটাগরি **(c)(8)** (আবেদনের ১৫০ দিন পর দাখিলযোগ্য)।
• গ্রিন কার্ড অ্যাডজাস্টমেন্ট আবেদনকারীদের জন্য ক্যাটাগরি **(c)(9)**।
• স্টুডেন্টদের OPT/CPT-এর জন্য ক্যাটাগরি **(c)(3)**।
**২. ফি ও ফি ছাড় (Fee Waiver):**
• যাদের আয় কম তারা **Form I-912** দাখিল করে ফি মওকুফ পেতে পারেন।
**৩. প্রসেসিং ও অটোমেটিক এক্সটেনশন:**
• নির্দিষ্ট কিছু ক্যাটাগরির জন্য মেয়াদোত্তীর্ণ হওয়ার পর ৫৪০ দিন পর্যন্ত স্বয়ংক্রিয় কাজের অনুমতি বলবৎ থাকে।

ওয়ার্ক পারমিট ও আইনি সহায়তার সুযোগের লিংক নিচে দেওয়া হলো:`,
        serviceTypes: VERIFIED_SERVICE_TYPES.asylum_tps,
      };
    }

    return {
      text: `Comprehensive Guide to the **U.S. Work Permit (Form I-765 EAD)**:

**1. Eligibility Categories:**
• **Asylum Pending (c)(8):** File 150 days after your complete I-589 is clocked by USCIS.
• **Adjustment of Status (c)(9):** Concurrently filed with Form I-485 Green Card application.
• **F-1 Student OPT (c)(3):** Applied within 90 days before graduation.
**2. Filing Fees & Fee Waivers:**
• If you meet low-income guidelines or receive public benefits, file **Form I-912** to waive the USCIS filing fee.
**3. Automatic Extensions:**
• USCIS provides up to a 540-day automatic work permit extension for timely filed renewals under eligible categories.

Work authorization service links are listed below:`,
      serviceTypes: VERIFIED_SERVICE_TYPES.asylum_tps,
    };
  }

  // 7. Jobs & Employment (চাকরি ও কাজ - Types of Jobs Suggestion)
  if (
    /job|jobs|employment|hiring|career|chackri|chari|চাকরি|কাজ|কর্মসংস্থান|নিয়োগ/i.test(
      query
    )
  ) {
    if (isBangla) {
      return {
        text: `অভিবাসীদের জন্য **চাকরি খোঁজা ও কর্মসংস্থান সহায়তা**:

• **ক্যারিয়ার সেন্টার ও ফ্রি ট্রেনিং:** স্টেট ডিপার্টমেন্ট অব লেবার ও কমিউনিটি সেন্টারগুলো বিনামূল্যে সিভি/রেজুমে তৈরি এবং ইন্টারভিউ প্রস্তুতিতে সাহায্য করে।
• **জনপ্রিয় সেক্টর:** ওয়্যারহাউস, ডেলিভারি, রেস্তোরাঁ ও কিচেন, রিটেইল স্টোর এবং টেকনিশিয়ান ক্যাটাগরিতে প্রচুর কাজের সুযোগ রয়েছে।
• বিভিন্ন ধরণের কাজের সরাসরি লিংক নিচে দেওয়া হলো:`,
        serviceTypes: VERIFIED_SERVICE_TYPES.jobs,
      };
    }

    return {
      text: `Top **Immigrant Employment & Job Opportunities**:

• **Free Job Matching & Training:** State Departments of Labor and nonprofit immigrant centers provide free resume translation, OSHA certifications, and direct employer placements.
• **High Demand Fields:** Logistics, warehouse fulfillment, driving & delivery, food service, retail sales, and technician roles.
• Direct links to explore available job types are provided below:`,
      serviceTypes: VERIFIED_SERVICE_TYPES.jobs,
    };
  }

  // 8. Mosque & Religious Places (মসজিদ)
  if (
    /mosque|namaz|prayer|jummah|church|temple|masjid|salat|মসজিদ|নামাজ|জুম্মা|প্রার্থনা/i.test(
      query
    )
  ) {
    if (isBangla) {
      return {
        text: `নিকটস্থ **মসজিদ ও ইসলামিক কমিউনিটি সেন্টার**:

• প্রতিদিন ৫ ওয়াক্ত জামাত ও শুক্রবার জুম্মার নামাজের বিশেষ জামাত অনুষ্ঠিত হয়।
• নতুন আগত প্রবাসীদের জন্য হালাল খাদ্য সহায়তা, ফ্যামিলি কাউন্সেলিং এবং ফ্রি ল্যাঙ্গুয়েজ ক্লাসের ব্যবস্থা রয়েছে।

মসজিদ ও কমিউনিটি সার্ভিসের সুযোগের লিংক নিচে দেওয়া হলো:`,
        serviceTypes: VERIFIED_SERVICE_TYPES.mosque,
      };
    }

    return {
      text: `Nearby **Mosques & Community Religious Centers**:

• Offering daily 5-times congregational prayers, Friday Jummah prayers, and youth Quranic education.
• Active community centers provide newcomer social support, halal food distributions, and family counseling.
• Direct service category links are provided below:`,
      serviceTypes: VERIFIED_SERVICE_TYPES.mosque,
    };
  }

  // 9. Housing & Renting (বাসা ভাড়া)
  if (
    /house|rent|apartment|room|housing|tenant|landlord|বাসা|ভাড়া|রুম|আবাসন/i.test(
      query
    )
  ) {
    if (isBangla) {
      return {
        text: `যুক্তরাষ্ট্রে **বাসা ভাড়া ও আবাসন গাইড**:

• **ক্রেডিট স্কোর ছাড়া ভাড়া:** নতুন প্রবাসীদের জন্য অনেকেই ৩ মাসের অ্যাডভান্স বা সাবলেট পদ্ধতিতে বাসা ভাড়া দেয়। কোনো দালালকে অগ্রিম ক্যাশ দেওয়ার আগে চাবি ও চুক্তি নিশ্চিত করুন।
• **ভাড়াটিয়াদের আইনি অধিকার:** আপনার ইমিগ্রেশন স্ট্যাটাস যা-ই হোক, নোটিস ছাড়া কোনো বাড়িওয়ালা আপনাকে বের করে দিতে পারে না। হিটিং ও গরম পানি নিশ্চিত করা তাদের আইনি দায়িত্ব।

আবাসন ও ভাড়াটিয়া সহায়তা সার্ভিসের সুযোগের লিংক নিচে দেওয়া হলো:`,
        serviceTypes: VERIFIED_SERVICE_TYPES.housing,
      };
    }

    return {
      text: `Important Guide to **Housing & Tenant Rights for Immigrants**:

• **Renting Without U.S. Credit History:** Look for community listings, lease guarantors, or sublets. Never transfer advance funds before inspecting the unit in person.
• **Tenant Protections:** Landlords cannot legally evict you or threaten immigration authorities regardless of legal status. Heat and hot water are legally guaranteed.
• Housing advocacy and rental assistance links are provided below:`,
      serviceTypes: VERIFIED_SERVICE_TYPES.housing,
    };
  }

  // 10. Check if this is an explicit direct navigation command (e.g., "open settings", "go to feed")
  const matchedNav = matchNavigationIntent(rawQuery);
  if (
    matchedNav.target &&
    !["How can I help you?", "how i can get"].some((s) => query.includes(s.toLowerCase())) &&
    (query.startsWith("go") || query.startsWith("open") || query.includes("খোলো") || query.includes("যাব"))
  ) {
    return {
      text: isBangla
        ? `🧭 "${matchedNav.destinationName}" পেজে যাওয়ার লিংক নিচে দেওয়া হলো। সরাসরি ক্লিক করে চলে যেতে পারেন:`
        : `🧭 Here is your direct shortcut to "${matchedNav.destinationName}":`,
      destination: {
        name: matchedNav.destinationName,
        route: matchedNav.route,
        state: matchedNav.state,
      },
      serviceTypes: VERIFIED_SERVICE_TYPES.jobs.slice(0, 2),
    };
  }

  // 11. General / Natural Generative Fallback for all other immigrant questions
  let matchedService = VERIFIED_SERVICE_TYPES.jobs;
  if (/law|legal|court|আইন|কোর্ট|উকিল/i.test(query)) {
    matchedService = VERIFIED_SERVICE_TYPES.greencard_legal;
  } else if (/car|license|গাড়ি|লাইসেন্স/i.test(query)) {
    matchedService = VERIFIED_SERVICE_TYPES.dmv_license;
  } else if (/food|খাবার|মাংস|রেস্টুরেন্ট/i.test(query)) {
    matchedService = VERIFIED_SERVICE_TYPES.halal_food;
  } else if (/doctor|medical|চিকিৎসা|হাসপাতাল/i.test(query)) {
    matchedService = VERIFIED_SERVICE_TYPES.healthcare;
  } else if (/rent|home|বাসা|ভাড়া/i.test(query)) {
    matchedService = VERIFIED_SERVICE_TYPES.housing;
  }

  if (isBangla) {
    return {
      text: `আপনার প্রশ্নের প্রেক্ষিতে **পথসাথী স্মার্ট গাইড**:

• **প্রশ্ন বিশ্লেষণ:** "${rawQuery}" সম্পর্কিত যেকোনো তথ্য ও প্রাতিষ্ঠানিক সহায়তা পেতে আপনি সঠিক জায়গায় এসেছেন।
• **প্রধান করণীয়:** যুক্তরাষ্ট্রের সরকারি ও সামাজিক সুবিধাগুলোতে নতুন অভিবাসীদের জন্য বিশেষ ফ্রি পরামর্শ কেন্দ্র রয়েছে।
• **সরাসরি সহায়তা:** কোনো ফি ছাড়াই বিশেষজ্ঞ আইনি ও সোশ্যাল সার্ভিসেস কর্মীদের সাথে যোগাযোগ করতে পারেন।

📍 আপনার সুবিধার জন্য প্রয়োজনীয় সার্ভিসের ধরন ও সুযোগের লিংক নিচে দেওয়া হলো:`,
      serviceTypes: matchedService,
    };
  }

  return {
    text: `Here is helpful guidance for your inquiry on **"${rawQuery}"**:

• **Overview:** ImmigrantConnect provides verified resources, pro-bono legal support, and civic guidance across New York and nationwide.
• **Key Recommendation:** Always ensure you consult certified non-profit organizations or accredited Department of Justice (DOJ) legal representatives.
• **Free Assistance:** You can access free community navigators who speak English, Bengali, Spanish, and other native languages.

📍 Recommended service opportunity links are provided below:`,
    serviceTypes: matchedService,
  };
}

// ── Markdown-like Chat Formatter Component ─────────────────────────────────────
function FormatChatContent({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-xs leading-relaxed">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lIdx} className="h-1.5" />;
        }

        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-");
        const isNumbered = /^\d+\./.test(trimmed);

        const content = isBullet ? trimmed.replace(/^[•\-]\s*/, "") : trimmed;
        const parts = content.split(/(\*\*.*?\*\*)/g);

        const renderedContent = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={pIdx} className="font-bold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={pIdx}>{part}</span>;
        });

        if (isBullet) {
          return (
            <div key={lIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="text-orange-500 font-bold leading-tight flex-shrink-0">•</span>
              <div className="flex-1 min-w-0">{renderedContent}</div>
            </div>
          );
        }

        if (isNumbered) {
          return (
            <div key={lIdx} className="pl-1 my-0.5 font-medium text-slate-800">
              {renderedContent}
            </div>
          );
        }

        return <p key={lIdx}>{renderedContent}</p>;
      })}
    </div>
  );
}

// ── Doll Chatbox Window (Universal Intelligent App Navigator) ─────────────────
export function DollChatboxWindow({
  isOpen,
  onClose,
  isFeed = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  isFeed?: boolean;
}) {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const getInitialMessage = (currentLang: string) => {
    if (currentLang === "bn") {
      return "আসসালামু আলাইকুম! 👋 আমি কীভাবে সাহায্য করতে পারি?\nচাকরি, গ্রিন কার্ড, লাইসেন্স বা যেকোনো প্রশ্ন লিখুন — বিস্তারিত পরামর্শ ও সার্ভিসের লিংক দিয়ে দেব।";
    }
    return "How can I help you? Ask about jobs, green cards, licenses, or any newcomer service.";
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "init",
      sender: "bot",
      text: getInitialMessage(lang),
      time: lang === "bn" ? "এখন" : "Now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic language synchronization for initial message
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "init") {
        return [
          {
            id: "init",
            sender: "bot",
            text: getInitialMessage(lang),
            time: lang === "bn" ? "এখন" : "Now",
          },
        ];
      }
      return prev;
    });
  }, [lang]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  if (!isOpen) return null;

  // ChatGPT-style AI query processing with Service Type Suggestions
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputText.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      time: lang === "bn" ? "এইমাত্র" : "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Natural ChatGPT thinking delay
    setTimeout(() => {
      setIsTyping(false);
      const aiReply = generateChatGPTAnswerAndPinpoints(query, lang);

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: aiReply.text,
        time: lang === "bn" ? "এইমাত্র" : "Just now",
        serviceTypes: aiReply.serviceTypes,
        pinpoints: aiReply.pinpoints,
        destination: aiReply.destination,
      };

      setMessages((prev) => [...prev, botReply]);
    }, 550);
  };

  // Directly navigate to Map with specific Service / Job Type filter
  const handleOpenServiceTypeOnMap = (item: ServiceTypeSuggestion) => {
    const queryParams = new URLSearchParams({
      q: item.searchQuery,
      query: item.searchQuery,
      category: item.category || "all",
    });

    navigate(`/map?${queryParams.toString()}`, {
      state: {
        searchQuery: item.searchQuery,
        activeCategory: item.category || "all",
      },
    });
    onClose();
  };

  // Directly navigate to exact pinpoint on Map (if any)
  const handleOpenLocationOnMap = (pin: LocationPinpoint) => {
    const queryParams = new URLSearchParams({
      placeId: String(pin.id),
      lat: String(pin.lat),
      lng: String(pin.lng),
      name: pin.name,
      address: pin.address,
      category: pin.category,
      desc: pin.description || "",
      phone: pin.phone || "",
    });

    navigate(`/map?${queryParams.toString()}`, {
      state: {
        selectedPlaceId: pin.id,
        userLocation: [pin.lat, pin.lng],
        searchQuery: pin.name,
      },
    });
    onClose();
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "init",
        sender: "bot",
        text: getInitialMessage(lang),
        time: lang === "bn" ? "এখন" : "Now",
      },
    ]);
  };

  return (
    <div
      className={`fixed z-[9999] w-[calc(100vw-24px)] sm:w-[440px] md:w-[480px] max-w-[500px] h-[480px] sm:h-[530px] md:h-[570px] max-h-[calc(100vh-100px)] bg-white/98 backdrop-blur-md rounded-3xl shadow-2xl border border-orange-200/90 overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
        isFeed
          ? "bottom-20 right-3 sm:right-6 xl:right-[340px]"
          : "bottom-[96px] sm:bottom-20 right-3 sm:right-6"
      }`}
    >
      {/* ── Chat Header (Expanded & Clean) ── */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-orange-500 via-[#E05236] to-[#C04A22] text-white flex items-center justify-between shadow-xs flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full bg-white/20 p-0.5 border border-white/60 overflow-hidden flex-shrink-0">
            <img
              src="/doll_assistant.jpg"
              alt="Doll"
              className="w-full h-full object-cover rounded-full"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border border-white rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-tight leading-tight">
              {lang === "bn" ? "পাঠসাথী অ্যাসিস্ট্যান্ট" : "Pathasathi Assistant"}
            </span>
            <span className="text-[10px] text-orange-100 flex items-center gap-1 font-medium leading-none mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              {lang === "bn" ? "অনলাইন" : "Online"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetChat}
            className="p-1.5 text-orange-100 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            title={lang === "bn" ? "নতুন করে শুরু করুন" : "Reset chat"}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-orange-100 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            title={lang === "bn" ? "বন্ধ করুন" : "Close"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Chat Messages Body ── */}
      <div className="p-3.5 space-y-3 overflow-y-auto flex-1 bg-slate-50/70 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-end gap-1.5 max-w-[94%]">
              {msg.sender === "bot" && (
                <div className="w-6 h-6 rounded-full overflow-hidden bg-orange-100 border border-orange-200 flex-shrink-0 mb-0.5">
                  <img
                    src="/doll_assistant.jpg"
                    alt="Bot"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className={`p-3 rounded-2xl shadow-2xs leading-relaxed text-xs ${
                  msg.sender === "user"
                    ? "bg-[#C04A22] text-white rounded-br-xs"
                    : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs"
                }`}
              >
                {msg.sender === "user" ? (
                  <p className="whitespace-pre-line">{msg.text}</p>
                ) : (
                  <FormatChatContent text={msg.text} />
                )}

                {/* Service Types Suggestion Links (Format: Ei (link a click-red only) korle tumi ei type er job pabe) */}
                {msg.serviceTypes && msg.serviceTypes.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100/80 space-y-2">
                    <p className="font-semibold text-slate-800 text-[11.5px] flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                      <span>
                        {lang === "bn" || /[\u0980-\u09FF]/.test(msg.text)
                          ? "সার্ভিসের ধরন ও সুযোগের লিংক:"
                          : "Available Service Types & Direct Links:"}
                      </span>
                    </p>

                    <div className="space-y-1.5 pl-0.5">
                      {msg.serviceTypes.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-2 text-[11.5px] leading-relaxed text-slate-700 py-0.5 group"
                        >
                          <div className="flex items-start gap-1.5 min-w-0 flex-1">
                            <span className="text-red-500 font-bold leading-tight flex-shrink-0 mt-0.5">
                              •
                            </span>
                            <div className="flex-1 whitespace-normal break-words text-slate-700">
                              {lang === "bn" || /[\u0980-\u09FF]/.test(msg.text) ? (
                                <span>
                                  এই{" "}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenServiceTypeOnMap(item)}
                                    className="inline font-bold text-red-600 hover:text-red-700 underline decoration-red-500/70 hover:decoration-red-700 decoration-1 underline-offset-2 transition-colors cursor-pointer"
                                    title={`ম্যাপে ${item.bnTitle} খুঁজুন`}
                                  >
                                    লিংকে ক্লিক
                                  </button>{" "}
                                  করলে আপনি <strong>{item.bnTitle}</strong> পাবেন।
                                </span>
                              ) : (
                                <span>
                                  By{" "}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenServiceTypeOnMap(item)}
                                    className="inline font-bold text-red-600 hover:text-red-700 underline decoration-red-500/70 hover:decoration-red-700 decoration-1 underline-offset-2 transition-colors cursor-pointer"
                                    title={`Search ${item.title} on map`}
                                  >
                                    clicking this link
                                  </button>
                                  , you will find <strong>{item.title}</strong>.
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right-side direct action icon */}
                          <button
                            type="button"
                            onClick={() => handleOpenServiceTypeOnMap(item)}
                            className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors flex-shrink-0 cursor-pointer flex items-center justify-center mt-0.5"
                            title={lang === "bn" ? "ম্যাপে দেখুন" : "Explore on map"}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct navigation jump button */}
                {msg.destination && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#C04A22] truncate">
                      {msg.destination.name}
                    </span>
                    <button
                      onClick={() => {
                        if (msg.destination?.state) {
                          navigate(msg.destination.route, {
                            state: msg.destination.state,
                          });
                        } else if (msg.destination?.route) {
                          navigate(msg.destination.route);
                        }
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#C04A22] border border-orange-200 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer flex-shrink-0"
                    >
                      <span>{lang === "bn" ? "যান" : "Go"}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <span className="text-[9px] text-slate-400 mt-1 px-1">
              {msg.time}
            </span>
          </div>
        ))}

        {/* Bot Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-orange-100 border border-orange-200 flex-shrink-0">
              <img
                src="/doll_assistant.jpg"
                alt="Bot"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-xs px-3 py-2 shadow-2xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Box ── */}
      <form
        onSubmit={handleSendMessage}
        className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            lang === "bn"
              ? "যেকোনো প্রশ্ন বা জিজ্ঞাসা লিখুন..."
              : "Ask anything (e.g. How to get Green Card?)..."
          }
          className="flex-1 text-xs px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition outline-none text-slate-800 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-9 h-9 rounded-2xl bg-gradient-to-r from-orange-500 to-[#C04A22] hover:from-orange-600 hover:to-[#8C3015] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition cursor-pointer flex-shrink-0 shadow-xs active:scale-95"
          title={lang === "bn" ? "পাঠান" : "Send"}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

// ── Global Doll Assistant (Rendered on every page) ────────────────────────────
export function GlobalDollAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Hide on splash and onboarding screens
  const hiddenPaths = ["/", "/landing", "/login", "/signup", "/verify-email"];
  const isHidden =
    hiddenPaths.includes(location.pathname) ||
    location.pathname.startsWith("/onboarding");

  if (isHidden) return null;

  const isFeed = location.pathname === "/feed";

  return (
    <>
      <div
        className={`fixed z-40 pointer-events-auto transition-all duration-300 ${
          isFeed
            ? "bottom-[98px] right-4 sm:right-6 xl:right-[340px]"
            : "bottom-[88px] sm:bottom-6 right-4 sm:right-6"
        }`}
      >
        <DollAssistantTrigger
          isOpen={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        />
      </div>

      <DollChatboxWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isFeed={isFeed}
      />
    </>
  );
}
