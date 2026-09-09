import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Send,
  X,
  Sparkles,
  MapPin,
  ArrowRight,
  Compass,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { places, Place } from "../../pages/MapDiscovery";

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

// Quick Shortcut Chips
const QUICK_CHIPS = [
  { id: "map", label: "লাইভ ম্যাপ", emoji: "🗺️", targetId: "map" },
  { id: "jobs", label: "চাকরি", emoji: "💼", targetId: "jobs" },
  { id: "food", label: "খাবার", emoji: "🍽️", targetId: "halal_food" },
  { id: "housing", label: "বাসা ভাড়া", emoji: "🏢", targetId: "housing" },
  { id: "cart", label: "আমার কার্ট / অর্ডার", emoji: "📦", targetId: "cart" },
  { id: "reels", label: "রিলস ভিডিও", emoji: "🎬", targetId: "reels" },
  { id: "legal", label: "আইনি ও ভিসা", emoji: "⚖️", targetId: "legal" },
  { id: "religion", label: "মসজিদ", emoji: "🕌", targetId: "religion" },
  { id: "hospital", label: "হাসপাতাল", emoji: "🏥", targetId: "hospital" },
  { id: "furniture", label: "ফার্নিচার", emoji: "🪑", targetId: "furniture" },
  { id: "flights", label: "বিমান টিকিট", emoji: "✈️", targetId: "flights" },
  { id: "transport", label: "সাবওয়ে ও বাস", emoji: "🚇", targetId: "transport" },
];

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "bot",
      text: "আসসালামু আলাইকুম! 👋 আপনি কোথায় যেতে চান?\nযে কোনো সার্ভিস, পেজ, চাকরি বা লোকেশন লিখুন—সরাসরি নিয়ে যাব!",
      time: "এখন",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  if (!isOpen) return null;

  // Direct Match & Navigation to App Target
  const handleSelectTarget = (target: NavigationTarget) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: `${target.emoji} ${target.name}`,
      time: "এইমাত্র",
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `🧭 "${target.name}"-এ নিয়ে যাচ্ছি...`,
        time: "এইমাত্র",
        destination: {
          name: target.name,
          route: target.route,
        },
      };
      setMessages((prev) => [...prev, botReply]);

      setTimeout(() => {
        const actionEvt = target.actionEvent;
        const actionPayload = target.actionPayload;

        if (actionEvt) {
          navigate(target.route);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent(actionEvt, { detail: actionPayload }));
            if (actionEvt === "open-post-composer") {
              window.dispatchEvent(new CustomEvent("open-post-modal"));
            }
          }, 200);
        } else {
          navigate(target.route);
        }
        onClose();
      }, 350);
    }, 200);
  };

  // Smart Multilingual Query Engine (Bangla, English, Banglish) with Instant Auto-Navigation
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputText.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      time: "এইমাত্র",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const matched = matchNavigationIntent(query);

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `🧭 "${matched.destinationName}"-এ নিয়ে যাচ্ছি...`,
        time: "এইমাত্র",
        destination: {
          name: matched.destinationName,
          route: matched.route,
          place: matched.place || undefined,
          state: matched.state,
        },
      };

      setMessages((prev) => [...prev, botReply]);

      // Snappy automatic navigation to the target
      setTimeout(() => {
        const actionEvt = matched.actionEvent || matched.target?.actionEvent;
        const actionPayload = matched.actionPayload || matched.target?.actionPayload;

        if (actionEvt) {
          navigate(matched.route, { state: matched.state });
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent(actionEvt, { detail: actionPayload }));
            if (actionEvt === "open-post-composer") {
              window.dispatchEvent(new CustomEvent("open-post-modal"));
            }
          }, 200);
        } else if (matched.state) {
          navigate(matched.route, { state: matched.state });
        } else {
          navigate(matched.route);
        }
        onClose();
      }, 350);
    }, 200);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "init",
        sender: "bot",
        text: "আসসালামু আলাইকুম! 👋 আপনি কোথায় যেতে চান?\nযে কোনো সার্ভিস, পেজ, চাকরি বা লোকেশন লিখুন—সরাসরি নিয়ে যাব!",
        time: "এখন",
      },
    ]);
  };

  return (
    <div
      className={`fixed z-[9999] w-[310px] sm:w-[340px] max-w-[calc(100vw-24px)] h-[320px] sm:h-[350px] max-h-[350px] bg-white/98 backdrop-blur-md rounded-3xl shadow-2xl border border-orange-200/90 overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
        isFeed
          ? "bottom-20 right-3 sm:right-6 xl:right-[340px]"
          : "bottom-[96px] sm:bottom-20 right-3 sm:right-6"
      }`}
    >
      {/* ── Chat Header (Clean & Compact) ── */}
      <div className="px-3.5 py-2 bg-gradient-to-r from-orange-500 via-[#E05236] to-[#C04A22] text-white flex items-center justify-between shadow-xs flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full bg-white/20 p-0.5 border border-white/60 overflow-hidden flex-shrink-0">
            <img
              src="/doll_assistant.jpg"
              alt="Doll"
              className="w-full h-full object-cover rounded-full"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border border-white rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetChat}
            className="p-1.5 text-orange-100 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            title="নতুন করে শুরু করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-orange-100 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Chat Messages Body ── */}
      <div className="p-2.5 space-y-2 overflow-y-auto flex-1 bg-slate-50/70 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-end gap-1.5 max-w-[90%]">
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
                className={`p-2 rounded-2xl shadow-2xs leading-relaxed whitespace-pre-line text-xs ${
                  msg.sender === "user"
                    ? "bg-[#C04A22] text-white rounded-br-xs"
                    : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs"
                }`}
              >
                {msg.text}

                {/* Direct navigation jump button */}
                {msg.destination && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#C04A22] truncate">
                      {msg.destination.name}
                    </span>
                    <button
                      onClick={() => {
                        if (msg.destination?.state) {
                          navigate(msg.destination.route, { state: msg.destination.state });
                        } else if (msg.destination?.route) {
                          navigate(msg.destination.route);
                        }
                        onClose();
                      }}
                      className="px-2 py-0.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#C04A22] border border-orange-200 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer flex-shrink-0"
                    >
                      <span>যান</span>
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

        {/* Quick Suggestion Chips (Available immediately) */}
        {messages.length <= 2 && (
          <div className="mt-1.5 pt-1.5 border-t border-slate-200/60">
            <p className="text-[10px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#C04A22]" />
              <span>জনপ্রিয় অপশনগুলো বেছে নিন:</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_CHIPS.map((chip) => {
                const target = APP_NAVIGATION_TARGETS.find(t => t.id === chip.targetId);
                return (
                  <button
                    key={chip.id}
                    onClick={() => target && handleSelectTarget(target)}
                    className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white hover:bg-orange-50 text-slate-700 hover:text-[#C04A22] border border-slate-200/80 hover:border-orange-300 text-[11px] font-medium transition text-left cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <span className="text-sm leading-none flex-shrink-0">
                      {chip.emoji}
                    </span>
                    <span className="truncate">{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Box ── */}
      <form
        onSubmit={handleSendMessage}
        className="p-2 bg-white border-t border-slate-200 flex items-center gap-1.5 flex-shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="বাংলা, English বা Banglish-এ লিখুন..."
          className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition outline-none text-slate-800 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-[#C04A22] hover:from-orange-600 hover:to-[#8C3015] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition cursor-pointer flex-shrink-0 shadow-xs active:scale-95"
          title="যান"
        >
          <Send className="w-3.5 h-3.5" />
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
