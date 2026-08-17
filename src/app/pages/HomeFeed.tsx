import React, { useState, useEffect, Fragment, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { Logo } from "../components/ui/Logo";
import { GoldenBadge } from "../components/ui/GoldenBadge";
import { useLanguage } from "../context/LanguageContext";
import { getFavourites, removeFavourite, type MyBoxFavourite } from "../utils/myBox";
import { MapDiscoveryContent } from "./MapDiscovery";
import {
  Heart, MessageCircle, Repeat2, Share2, Bookmark, MoreHorizontal,
  Image, BarChart2, MapPin, Map, HelpCircle, AlertTriangle, CheckCircle,
  Globe, Users, Bell, Zap, ChevronLeft, ChevronRight, ChevronDown,
  Calendar, Clock, X, MapPin as MapPinIcon, UserCheck, Building2,
  Megaphone, Star, TrendingUp, Lock, Hash, Pin, Award, User, Video, Film, Smile,
  Wind, Droplets, Thermometer, ArrowUp, Loader2, CloudSun, Plus, LayoutGrid,
  Cloud, CloudRain, CloudSnow, Sun, CloudLightning
} from "lucide-react";

// ─── Weather Widget ───────────────────────────────────────────────────────────
type WeatherData = {
  temp: number; feelsLike: number; humidity: number;
  windSpeed: number; tempMax: number; tempMin: number;
  weatherCode: number; cityName: string;
};

function weatherIcon(code: number, size = "w-10 h-10") {
  if (code === 0) return <Sun className={`${size} text-amber-400`} />;
  if (code <= 2)  return <CloudSun className={`${size} text-amber-300`} />;
  if (code <= 3)  return <Cloud className={`${size} text-slate-400`} />;
  if (code <= 67) return <CloudRain className={`${size} text-blue-400`} />;
  if (code <= 77) return <CloudSnow className={`${size} text-sky-300`} />;
  return <CloudLightning className={`${size} text-violet-400`} />;
}

function weatherDesc(code: number) {
  if (code === 0) return "Clear Sky";
  if (code <= 2)  return "Partly Cloudy";
  if (code <= 3)  return "Overcast";
  if (code <= 51) return "Drizzle";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  return "Thunderstorm";
}

function WeatherWidget() {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load(lat: number, lon: number, city: string) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
          `&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
        const res = await fetch(url);
        const data = await res.json();
        const c = data.current;
        setWeather({
          temp: Math.round(c.temperature_2m),
          feelsLike: Math.round(c.apparent_temperature),
          humidity: Math.round(c.relative_humidity_2m),
          windSpeed: Math.round(c.wind_speed_10m),
          tempMax: Math.round(data.daily.temperature_2m_max[0]),
          tempMin: Math.round(data.daily.temperature_2m_min[0]),
          weatherCode: c.weather_code,
          cityName: city,
        });
      } catch { setError(true); }
      finally { setLoading(false); }
    }

    navigator.geolocation?.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        // Reverse-geocode city name via Open-Meteo / nominatim
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          .then(r => r.json())
          .then(d => {
            const city = d.address?.city || d.address?.town || d.address?.suburb || "Your Location";
            load(lat, lon, city);
          })
          .catch(() => load(lat, lon, "Your Location"));
      },
      () => load(40.7282, -73.8582, "Queens, NY") // fallback
    );
  }, []);

  if (loading) return (
    <div className="bg-gradient-to-br from-slate-100 via-slate-50 to-white border border-border rounded-2xl p-4 flex items-center justify-center gap-2 text-slate-400 min-h-[120px]">
      <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Getting weather…</span>
    </div>
  );

  if (error || !weather) return null;

  const wcode = weather.weatherCode;
  return (
    <div className="bg-gradient-to-br from-slate-100 via-slate-50 to-white rounded-2xl p-4 border border-border shadow-sm overflow-hidden relative">
      {/* decorative circles */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-slate-200/60" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-slate-200/40" />

      <div className="relative">
        {/* top row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">{weather.cityName}</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-5xl font-bold tracking-tight leading-none text-slate-800">{weather.temp}°</span>
              <span className="text-lg text-slate-400 mb-1">C</span>
            </div>
            <div className="text-sm text-slate-600 mt-1 font-medium">{weatherDesc(wcode)}</div>
            <div className="text-xs text-slate-400 mt-0.5">{t("weather_feels")} {weather.feelsLike}°C</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            {weatherIcon(wcode)}
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <ArrowUp className="w-3 h-3" />{weather.tempMax}°
              <span className="text-slate-300">·</span>
              <span className="text-slate-400">{weather.tempMin}°</span>
            </div>
          </div>
        </div>

        {/* stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Droplets,    label: t("weather_humidity"), value: `${weather.humidity}%`,      color: "text-sky-500"    },
            { icon: Wind,        label: t("weather_wind"),     value: `${weather.windSpeed} km/h`, color: "text-slate-600"},
            { icon: Thermometer, label: t("weather_high"),     value: `${weather.tempMax}°C`,      color: "text-amber-500"  },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white/80 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center gap-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-[11px] font-bold text-slate-700 leading-none">{value}</span>
              <span className="text-[9px] text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Post = {
  id: number;
  type: "emergency" | "question" | "tip" | "need_help" | "regular" | "announcement" | "poll" | "achievement";
  author: { name: string; handle: string; avatar: string; color: string; verified: boolean };
  time: string;
  content: string;
  likes: number;
  comments: number;
  reposts: number;
  location?: string;
  tags?: string[];
  image?: string;
  video?: string;
  poll?: { question: string; options: { label: string; pct: number }[] };
  communityName?: string;
  communityEmoji?: string;
  pinned?: boolean;
};

// ─── Event Data ──────────────────────────────────────────────────────────────

const today = new Date();
const y = today.getFullYear();
const m = today.getMonth();

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

type CalEvent = {
  id: number;
  title: string;
  time: string;
  location: string;
  category: string;
  emoji: string;
  color: string;
  organizer: string;
  desc: string;
  attendees: number;
  tags: string[];
};

const eventsByDate: Record<string, CalEvent[]> = {
  [dateKey(y, m, 3)]: [
    { id: 1, title: "Free Immigration Q&A Webinar", time: "6:00 PM – 8:00 PM", location: "Online (Zoom)", category: "Legal", emoji: "⚖️", color: "bg-cyan-50 border-cyan-200", organizer: "Queens Legal Services", desc: "Live Q&A session with licensed immigration attorneys. Asylum, green card, H-1B questions welcome. Bengali and Spanish interpreters available.", attendees: 342, tags: ["Legal", "Immigration", "Free"] },
  ],
  [dateKey(y, m, 7)]: [
    { id: 2, title: "Bangladeshi Community Meetup 🇧🇩", time: "2:00 PM – 6:00 PM", location: "Flushing Meadows Park, Queens", category: "Community", emoji: "🇧🇩", color: "bg-emerald-50 border-emerald-200", organizer: "Bangladeshi New Yorkers", desc: "Monthly community picnic for Bangladeshis in NYC. Bring your family! Food, music, and networking. New arrivals especially welcome.", attendees: 189, tags: ["Community", "Bangladeshi", "Family"] },
    { id: 3, title: "ESL English Practice Session", time: "10:00 AM – 12:00 PM", location: "Jackson Heights Library, NY", category: "Education", emoji: "📚", color: "bg-blue-50 border-blue-200", organizer: "NYC Adult Literacy Program", desc: "Free English conversation practice for immigrants at all levels. Native speakers volunteer to help. Come as you are!", attendees: 67, tags: ["English", "Education", "Free"] },
  ],
  [dateKey(y, m, 12)]: [
    { id: 4, title: "Halal Food & Culture Festival", time: "12:00 PM – 8:00 PM", location: "Prospect Park, Brooklyn", category: "Culture", emoji: "🍛", color: "bg-amber-50 border-amber-200", organizer: "Muslim Community USA", desc: "Annual halal food festival celebrating cultures from across the Muslim world. 50+ food vendors, live music, and crafts.", attendees: 2400, tags: ["Food", "Halal", "Muslim", "Free"] },
  ],
  [dateKey(y, m, 15)]: [
    { id: 5, title: "Know Your Rights — Immigrant Workshop", time: "4:00 PM – 6:30 PM", location: "CUNY Queens College, NY", category: "Legal", emoji: "🏛️", color: "bg-purple-50 border-purple-200", organizer: "CUNY Citizenship Now!", desc: "Learn your legal rights as an immigrant. Topics: workplace rights, encounters with police, immigration enforcement, and more.", attendees: 215, tags: ["Legal", "Rights", "Education"] },
    { id: 6, title: "Desi Professionals Networking Night", time: "7:00 PM – 10:00 PM", location: "Midtown Manhattan, NY", category: "Career", emoji: "💼", color: "bg-indigo-50 border-indigo-200", organizer: "South Asian Network USA", desc: "Networking event for Indian, Pakistani, Bangladeshi, and Sri Lankan professionals. All industries welcome.", attendees: 156, tags: ["Networking", "Career", "South Asian"] },
  ],
  [dateKey(y, m, 19)]: [
    { id: 7, title: "H-1B & OPT Info Session", time: "5:30 PM – 7:00 PM", location: "Online (Google Meet)", category: "Immigration", emoji: "📋", color: "bg-blue-50 border-blue-200", organizer: "International Student Hub", desc: "Everything you need to know about OPT, STEM OPT extension, and transitioning to H-1B. Live Q&A with an immigration attorney.", attendees: 498, tags: ["H-1B", "OPT", "Immigration"] },
  ],
  [dateKey(y, m, 22)]: [
    { id: 8, title: "Latino Community Health Fair", time: "9:00 AM – 3:00 PM", location: "Corona Plaza, Queens", category: "Health", emoji: "🏥", color: "bg-red-50 border-red-200", organizer: "NYC Health + Hospitals", desc: "Free health screenings, vaccinations, and health resources for the Latino community. Spanish-speaking doctors on site.", attendees: 834, tags: ["Health", "Latino", "Free", "Bilingual"] },
  ],
  [dateKey(y, m, 26)]: [
    { id: 9, title: "Small Business Workshop for Immigrants", time: "2:00 PM – 5:00 PM", location: "SBDC Queens, Jamaica NY", category: "Business", emoji: "🏪", color: "bg-orange-50 border-orange-200", organizer: "NYC Small Business Services", desc: "How to start your own business in the US: LLC, EIN, business bank account, and marketing. All visa types welcome.", attendees: 112, tags: ["Business", "Entrepreneur", "Free"] },
    { id: 10, title: "Eid Celebration & Potluck 🌙", time: "6:00 PM – 10:00 PM", location: "Masjid At-Taqwa, Brooklyn", category: "Religious", emoji: "🌙", color: "bg-emerald-50 border-emerald-200", organizer: "Masjid At-Taqwa", desc: "Community Eid celebration with potluck dinner. All are welcome regardless of faith. Bring a dish to share!", attendees: 320, tags: ["Muslim", "Eid", "Community"] },
  ],
};

// ─── FOR YOU Posts ────────────────────────────────────────────────────────────

const forYouPosts: Post[] = [
  {
    id: 1, type: "emergency",
    author: { name: "PathaSathi Official", handle: "@pathasathi_official", avatar: "PS", color: "from-[#e6653c] to-[#D85A30]", verified: true },
    time: "2h ago",
    content: "🚨 EMERGENCY ALERT: USCIS has announced a 90-day extension for all pending I-765 (EAD) renewals. If your work permit expires before December 2025, you are now covered. Check the Services Hub for more info and your case status.",
    likes: 2847, comments: 324, reposts: 1203,
    location: "National",
    tags: ["Immigration", "USCIS", "EAD"],
  },
  {
    id: 2, type: "question",
    author: { name: "Soraya Hosseini", handle: "@soraya_h", avatar: "SH", color: "from-purple-400 to-pink-500", verified: false },
    time: "4h ago",
    content: "🙋 Has anyone applied for a New York State ID without a Social Security Number? I'm on a tourist visa and need some form of ID to open a bank account. Would love to hear your experiences! #NewYork #Banking",
    likes: 156, comments: 89, reposts: 34,
    location: "New York, NY",
    tags: ["Banking", "ID", "New York"],
  },
  {
    id: 3, type: "tip",
    author: { name: "Rahim Chowdhury", handle: "@rahim_bdconnect", avatar: "RC", color: "from-green-400 to-emerald-500", verified: false },
    time: "5h ago",
    content: "💡 LOCAL TIP: Just found out that the DMV in Jamaica, Queens now has Bengali-speaking staff every Wednesday! If you're from Bangladesh and need your driving test, go on Wednesdays. Pass this along to your community friends 🙏",
    likes: 892, comments: 67, reposts: 445,
    location: "Queens, NY",
    tags: ["Driving License", "Bangladeshi Community", "Queens"],
  },
  {
    id: 4, type: "need_help",
    author: { name: "Amira Khalil", handle: "@amira_k", avatar: "AK", color: "from-orange-400 to-amber-500", verified: false },
    time: "6h ago",
    content: "🆘 NEED HELP: My family is looking for a 2BR apartment in the Bronx under $1,800/month. We have 2 adults and 1 child. Does anyone know of any landlords who accept ITIN instead of SSN?",
    likes: 43, comments: 127, reposts: 89,
    location: "The Bronx, NY",
    tags: ["Housing", "Rental"],
  },
  {
    id: 5, type: "regular",
    author: { name: "Carlos Rivera", handle: "@carlos_helps", avatar: "CR", color: "from-orange-400 to-rose-400", verified: false },
    time: "8h ago",
    content: "Proud moment today — just helped 12 families from Latin America complete their I-589 asylum applications! The process is long but so worth it. If you need help with asylum paperwork in Houston, DM me 🇺🇸❤️",
    likes: 567, comments: 43, reposts: 123,
    location: "Houston, TX",
    tags: ["Asylum", "Legal Help"],
    image: "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=600&h=340&fit=crop&auto=format",
  },
  {
    id: 6, type: "tip",
    author: { name: "Jannat Ara", handle: "@jannat_queens", avatar: "JA", color: "from-pink-400 to-rose-500", verified: false },
    time: "9h ago",
    content: "💡 Jackson Heights Community Garden is open to ALL immigrants — no documents needed. They provide free plots, seeds, and tools. Growing your own vegetables saves money and connects you with neighbors. Come visit! 🌱",
    likes: 743, comments: 58, reposts: 312,
    location: "Jackson Heights, Queens",
    tags: ["Community", "Garden", "Free"],
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=360&fit=crop&auto=format",
  },
  {
    id: 7, type: "regular",
    author: { name: "Priya Sharma", handle: "@priya_nyc", avatar: "PS", color: "from-violet-400 to-indigo-500", verified: true },
    time: "10h ago",
    content: "For everyone asking about H-1B cap-exempt employers: universities, nonprofit research orgs, and government research orgs can hire H-1B workers without waiting for the lottery. Full guide in the comments 👇",
    likes: 1234, comments: 156, reposts: 567,
    location: "California",
    tags: ["H-1B", "Jobs", "Immigration"],
  },
  {
    id: 8, type: "need_help",
    author: { name: "Dilnoza Yusupova", handle: "@dilnoza_nyc", avatar: "DY", color: "from-teal-400 to-cyan-500", verified: false },
    time: "11h ago",
    content: "🆘 Can anyone identify what this notice is? Got it on my door this morning. My English isn't strong enough to fully understand it and I'm worried it might be from the landlord or a government agency. Any help appreciated! 🙏",
    likes: 211, comments: 178, reposts: 95,
    location: "Brooklyn, NY",
    tags: ["Housing", "Help", "Translation"],
    image: "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&h=400&fit=crop&auto=format",
  },
];

// ─── FOLLOWING Posts ──────────────────────────────────────────────────────────

const followingPosts: Post[] = [
  {
    id: 101, type: "achievement",
    author: { name: "Nadia Islam", handle: "@nadia_nyc", avatar: "NI", color: "from-emerald-400 to-teal-500", verified: true },
    time: "1h ago",
    content: "🎉 Big news — I just passed the NY Bar Exam! After 3 years of studying while working full-time as an immigrant in this country, this means everything. To every immigrant grinding in silence: it's possible. Don't give up. 🙌",
    likes: 3412, comments: 289, reposts: 892,
    tags: ["Milestone", "LawSchool", "Immigrant"],
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=360&fit=crop&auto=format",
  },
  {
    id: 102, type: "tip",
    author: { name: "Dr. Priya Menon", handle: "@dr_priya", avatar: "PM", color: "from-purple-400 to-indigo-500", verified: true },
    time: "3h ago",
    content: "💊 Healthcare tip for new immigrants: Most NYC Health + Hospital clinics offer sliding-scale fees based on income. You do NOT need insurance. Many also have translators for Bengali, Spanish, Mandarin, and Arabic. Please share with your community.",
    likes: 1876, comments: 134, reposts: 763,
    tags: ["Healthcare", "Free", "Immigrant"],
  },
  {
    id: 103, type: "question",
    author: { name: "Tariq Al-Hassan", handle: "@tariq_atty", avatar: "TA", color: "from-blue-400 to-cyan-500", verified: true },
    time: "5h ago",
    content: "Quick poll for my followers — what is the BIGGEST challenge you faced in your first 6 months in the US?",
    likes: 245, comments: 198, reposts: 67,
    poll: {
      question: "Biggest first-6-month challenge?",
      options: [
        { label: "Finding housing 🏠", pct: 38 },
        { label: "Language barrier 🗣️", pct: 26 },
        { label: "Getting a bank account 🏦", pct: 21 },
        { label: "Understanding healthcare 🏥", pct: 15 },
      ],
    },
    tags: ["Poll", "NewImmigrant"],
  },
  {
    id: 104, type: "regular",
    author: { name: "Fatima Al-Zahra", handle: "@fatima_boston", avatar: "FZ", color: "from-rose-400 to-pink-500", verified: false },
    time: "7h ago",
    content: "Just attended the Know Your Rights workshop in Queens — honestly life-changing. I had no idea I have the right to remain silent even if ICE shows up at my door. Everyone MUST know this. Sharing the recording link in comments 👇",
    likes: 2103, comments: 312, reposts: 1456,
    location: "Queens, NY",
    tags: ["KnowYourRights", "ICE", "Immigration"],
  },
  {
    id: 105, type: "regular",
    author: { name: "Rahim Chowdhury", handle: "@rahim_bdconnect", avatar: "RC", color: "from-green-400 to-emerald-500", verified: false },
    time: "9h ago",
    content: "Scored a Software Engineer role at a cap-exempt research lab after 2 H-1B lottery losses. The cap-exempt route is REAL and underused. Happy to share how I found them — drop a 🙋 in the comments and I'll DM you the list of 200+ employers.",
    likes: 4234, comments: 567, reposts: 1893,
    tags: ["H-1B", "CapExempt", "TechJobs", "Immigration"],
  },
  {
    id: 106, type: "regular",
    author: { name: "Meera Nair", handle: "@meera_nair_md", avatar: "MN", color: "from-teal-400 to-emerald-500", verified: true },
    time: "12h ago",
    content: "To all IMG doctors navigating the USMLE + residency match process: You are not alone. I matched into Internal Medicine after 4 tries. The system is hard but there's a path. Starting a weekly Twitter Space — Sundays 8 PM EST. See you there.",
    likes: 1567, comments: 203, reposts: 645,
    tags: ["IMG", "USMLE", "Residency", "MedTwitter"],
  },
];

// ─── COMMUNITY Posts ──────────────────────────────────────────────────────────

const communityPosts: Post[] = [
  {
    id: 201, type: "announcement",
    author: { name: "Bangladeshi New Yorkers", handle: "@bdny_official", avatar: "BD", color: "from-green-500 to-emerald-600", verified: true },
    time: "30m ago",
    content: "📢 ANNOUNCEMENT: Our community document drive is open! Bring your I-94, passport, and any pending USCIS notices to our community center this Saturday 10am–2pm. Volunteers will help you organize and understand your documents. All free. 🇧🇩",
    communityName: "Bangladeshi New Yorkers",
    communityEmoji: "🇧🇩",
    pinned: true,
    likes: 678, comments: 45, reposts: 234,
    location: "Jackson Heights, Queens",
    tags: ["Community", "Documents", "Free"],
  },
  {
    id: 202, type: "regular",
    author: { name: "Khalid Mansour", handle: "@khalid_m", avatar: "KM", color: "from-amber-400 to-orange-500", verified: false },
    time: "2h ago",
    content: "Brothers and sisters in the Muslim Community USA group — the new Halal restaurant near the Jamaica Ave mosque now accepts EBT/SNAP! Great news for our families who are still getting settled. Owner is from Egypt and speaks Arabic, Bengali, and Urdu.",
    communityName: "Muslim Community USA",
    communityEmoji: "☪️",
    likes: 489, comments: 67, reposts: 156,
    location: "Jamaica, Queens",
    tags: ["Halal", "Food", "Muslim"],
  },
  {
    id: 203, type: "question",
    author: { name: "Sofia Gutierrez", handle: "@sofia_g_nyc", avatar: "SG", color: "from-orange-400 to-yellow-500", verified: false },
    time: "4h ago",
    content: "¡Hola comunidad! / Hi Latino NYC members — does anyone know of a lawyer who specializes in DACA renewals and is fluent in Spanish? Looking for Queens or Brooklyn area. Bilingual recommendation only please 🙏",
    communityName: "Latino NYC Network",
    communityEmoji: "🌮",
    likes: 134, comments: 89, reposts: 67,
    location: "Queens, NY",
    tags: ["DACA", "Legal", "Spanish", "Latino"],
  },
  {
    id: 204, type: "tip",
    author: { name: "South Asian Network USA", handle: "@sana_usa", avatar: "SA", color: "from-orange-500 to-red-500", verified: true },
    time: "6h ago",
    content: "📌 Pinned Resource: Complete guide to ITIN application (W-7 form) for South Asian community members who can't get an SSN yet. Bank of America and Chase both accept ITINs for basic checking. Link in bio. Spread this! 🇮🇳🇵🇰🇧🇩🇱🇰",
    communityName: "South Asian Network USA",
    communityEmoji: "🇮🇳",
    pinned: true,
    likes: 2341, comments: 198, reposts: 1203,
    tags: ["ITIN", "Banking", "SouthAsian", "Finance"],
  },
  {
    id: 205, type: "announcement",
    author: { name: "NYC Tech Immigrants", handle: "@nyctech_immigrants", avatar: "NT", color: "from-blue-500 to-violet-500", verified: true },
    time: "8h ago",
    content: "🚀 Our monthly virtual meetup is TOMORROW at 7 PM EST. Topic: Negotiating salary as an H-1B holder — what you can and cannot do. Special guest: an immigration attorney + tech recruiter duo. Register link in bio. Free for all members!",
    communityName: "NYC Tech Immigrants",
    communityEmoji: "💻",
    likes: 567, comments: 89, reposts: 234,
    tags: ["Tech", "H-1B", "Salary", "Career"],
  },
  {
    id: 206, type: "regular",
    author: { name: "Arun Krishnan", handle: "@arun_krishnan", avatar: "AK", color: "from-indigo-400 to-blue-500", verified: false },
    time: "11h ago",
    content: "Just got my Green Card after 11 years on H-1B EB-2 India queue! 🟩 The wait is brutal but real. Sharing my full timeline in the Indian Professionals group — hope it helps someone plan better. Priority Date: Dec 2013. Final approval: this week.",
    communityName: "Indian Professionals USA",
    communityEmoji: "🇮🇳",
    likes: 8934, comments: 1023, reposts: 4521,
    tags: ["GreenCard", "EB2", "India", "LongWait"],
  },
];

// ─── LOCAL Posts ──────────────────────────────────────────────────────────────

const localPosts: Post[] = [
  {
    id: 301, type: "tip",
    author: { name: "Jannatul Ferdous", handle: "@jannatul_queens", avatar: "JF", color: "from-teal-400 to-cyan-500", verified: false },
    time: "45m ago",
    content: "🗺️ Queens tip: The Jackson Heights branch of the Queens Public Library just got a new Bengali-language section. Over 200 books + free computer access. Perfect for kids doing homework or adults studying for the citizenship test. 37th Ave & 77th St.",
    likes: 543, comments: 38, reposts: 289,
    location: "Jackson Heights, Queens, NY",
    tags: ["Library", "Bengali", "Queens", "Free"],
  },
  {
    id: 302, type: "need_help",
    author: { name: "Mohammed Hossain", handle: "@mo_hossain_bx", avatar: "MH", color: "from-blue-400 to-indigo-500", verified: false },
    time: "2h ago",
    content: "🆘 Emergency: A family in my building (Bangladeshi, just arrived last month) is about to be evicted. 3 children, mother is 7 months pregnant. Looking for emergency housing assistance in Bronx area. Anyone know who to call? Calling 311 now.",
    likes: 89, comments: 156, reposts: 234,
    location: "The Bronx, NY",
    tags: ["Emergency", "Housing", "Eviction", "Help"],
  },
  {
    id: 303, type: "regular",
    author: { name: "Rosa Mendez", handle: "@rosa_bklyn", avatar: "RM", color: "from-pink-400 to-rose-500", verified: false },
    time: "3h ago",
    content: "Sunset Park, Brooklyn has a new FREE legal clinic every Thursday 5–8 PM at the community center on 5th Ave. Immigration, tenants rights, employment issues — all covered. No appointment needed. Bring a friend who might need help! 🙏",
    likes: 1234, comments: 78, reposts: 567,
    location: "Sunset Park, Brooklyn, NY",
    tags: ["Legal", "Free", "Brooklyn", "Clinic"],
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&h=250&fit=crop&auto=format",
  },
  {
    id: 304, type: "regular",
    author: { name: "Ahmad Khalil", handle: "@ahmad_astoria", avatar: "AH", color: "from-green-400 to-teal-500", verified: false },
    time: "5h ago",
    content: "Astoria Greek Festival is this weekend but did you know there's also a massive Middle Eastern grocery market happening Sunday at Steinway St? Fresh produce from halal vendors, Egyptian pastries, Yemeni honey. Cash only. 10 AM – 6 PM.",
    likes: 678, comments: 45, reposts: 123,
    location: "Astoria, Queens, NY",
    tags: ["Food", "Halal", "Market", "Queens"],
  },
  {
    id: 305, type: "tip",
    author: { name: "Dilnoza Yusupova", handle: "@dilnoza_bklyn", avatar: "DY", color: "from-violet-400 to-purple-500", verified: false },
    time: "7h ago",
    content: "Heads up for Central Asian community in Brooklyn: The Uzbek Cultural Center on Brighton Beach Ave is offering free ESL classes Monday/Wednesday evenings. Also Russian-language health navigators at Coney Island Hospital — ask at reception for 'patient advocate'.",
    likes: 456, comments: 34, reposts: 198,
    location: "Brighton Beach, Brooklyn, NY",
    tags: ["Uzbek", "ESL", "Brooklyn", "Healthcare"],
  },
  {
    id: 306, type: "question",
    author: { name: "Linh Nguyen", handle: "@linh_flushing", avatar: "LN", color: "from-orange-300 to-amber-400", verified: false },
    time: "9h ago",
    content: "Does anyone know which subway lines have multilingual staff during rush hour? I use the 7 train (Flushing line) and sometimes the announcements are unclear. Also, is there a transit app in Vietnamese? My parents are visiting next month 🙏",
    likes: 234, comments: 112, reposts: 56,
    location: "Flushing, Queens, NY",
    tags: ["Transit", "MTA", "Vietnamese", "Queens"],
  },
];

const suggestedPeople = [
  { name: "Nadia Islam", handle: "@nadia_nyc", avatar: "NI", color: "from-emerald-400 to-teal-500", bio: "Immigration Attorney" },
  { name: "Dr. Priya Menon", handle: "@dr_priya", avatar: "PM", color: "from-purple-400 to-indigo-500", bio: "Healthcare Navigator" },
];

// ─── Mini Calendar ────────────────────────────────────────────────────────────

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function MiniCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: string | null;
  onSelect: (key: string | null) => void;
}) {
  const { t } = useLanguage();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-3 group cursor-pointer">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-600 group-hover:text-[#8C3015] transition-colors" />
          <h3 className="font-semibold text-sm text-foreground">
            {MONTHS[viewMonth]} {viewYear}
          </h3>
        </div>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const key = dateKey(viewYear, viewMonth, day);
          const hasEvents = !!eventsByDate[key];
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const isSelected = selectedDate === key;

          return (
            <button
              key={key}
              onClick={() => onSelect(isSelected ? null : key)}
              className={`relative flex flex-col items-center justify-center h-8 w-full rounded-lg text-xs font-medium transition-all duration-150 ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : isToday
                  ? "bg-blue-50 text-primary font-bold"
                  : hasEvents
                  ? "hover:bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              {day}
              {hasEvents && (
                <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-primary"}`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          {t("cal_has_events")}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-5 h-4 rounded bg-blue-50 inline-block border border-blue-100" />
          {t("cal_today")}
        </div>
      </div>
    </div>
  );
}

// ─── Event Card ────────────────────────────────────────────────────────────────

function EventCard({ event }: { event: CalEvent; key?: string | number }) {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);
  return (
    <div className={`border rounded-2xl p-4 ${event.color} transition-all hover:shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
          {event.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-sm font-bold text-foreground leading-snug">{event.title}</span>
            <button onClick={() => setSaved(s => !s)} className={`flex-shrink-0 p-1 rounded-lg transition-colors ${saved ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
              <Bookmark className={`w-4 h-4 ${saved ? "fill-primary" : ""}`} />
            </button>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="w-3 h-3 flex-shrink-0" />{event.time}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPinIcon className="w-3 h-3 flex-shrink-0" />{event.location}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="w-3 h-3 flex-shrink-0" />{event.attendees.toLocaleString()} attending · by {event.organizer}</div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{event.desc}</p>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {event.tags.map(t => (
              <span key={t} className="text-xs bg-white/70 text-muted-foreground px-2 py-0.5 rounded-full border border-border/40">{t}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition">{t("widget_interested")}</button>
            <button className="px-3 py-2 rounded-xl border border-border bg-white/70 text-xs font-medium hover:bg-white transition"><Share2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ─────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post; key?: string | number }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [votedOption, setVotedOption] = useState<number | null>(null);

  const typeColors: Record<string, string> = {
    emergency: "bg-white border-border shadow-2xs",
    question: "bg-white border-border shadow-2xs",
    tip: "bg-white border-border shadow-2xs",
    need_help: "bg-white border-border shadow-2xs",
    announcement: "bg-white border-border shadow-2xs",
    achievement: "bg-white border-border shadow-2xs",
    poll: "bg-white border-border shadow-2xs",
    regular: "bg-white border-border shadow-2xs",
  };

  const typeLabel: Record<string, ReactNode> = {
    emergency: <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 mb-2"><AlertTriangle className="w-3.5 h-3.5" />Emergency Alert</div>,
    question: <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-2"><HelpCircle className="w-3.5 h-3.5 text-emerald-600" />Ask the Community</div>,
    tip: <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-2"><Zap className="w-3.5 h-3.5" />Local Tip</div>,
    need_help: <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 mb-2"><Users className="w-3.5 h-3.5" />Need Help</div>,
    announcement: <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 mb-2"><Megaphone className="w-3.5 h-3.5" />Community Announcement</div>,
    achievement: <div className="flex items-center gap-1.5 text-xs font-semibold text-yellow-600 mb-2"><Award className="w-3.5 h-3.5" />Milestone</div>,
    poll: <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 mb-2"><BarChart2 className="w-3.5 h-3.5" />Community Poll</div>,
    regular: null,
  };

  return (
    <div
      className={`border rounded-2xl p-3 sm:p-4 ${typeColors[post.type] ?? "bg-white border-border"} transition-all hover:shadow-sm cursor-pointer`}
      onClick={() => navigate("/post/1")}
    >
      {/* Pinned badge */}
      {post.pinned && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <Pin className="w-3 h-3" /> Pinned post
        </div>
      )}

      {/* Community badge */}
      {post.communityName && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-base leading-none">{post.communityEmoji}</span>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">{post.communityName}</span>
        </div>
      )}

      {/* Author Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs">
            <User className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
            <span className="text-sm font-bold text-foreground">{post.author.name}</span>
            {post.author.verified && (
              <GoldenBadge size={16} title="Verified Account" />
            )}
            <span className="text-xs text-muted-foreground">· {post.time}</span>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-white/60 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-foreground leading-relaxed">{post.content}</p>

          {post.image && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-border/50 bg-muted">
              <img
                src={post.image}
                alt="Post attachment"
                className="w-full object-cover max-h-64 sm:max-h-72 hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          )}

          {post.video && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-border/50 bg-slate-950">
              <video
                src={post.video}
                controls
                className="w-full object-cover max-h-64 sm:max-h-80"
              />
            </div>
          )}

          {/* Poll */}
          {post.poll && (
            <div className="mt-3 space-y-2" onClick={e => e.stopPropagation()}>
              {post.poll.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setVotedOption(idx)}
                  className={`w-full text-left rounded-xl border overflow-hidden transition-all ${votedOption === idx ? "border-primary" : "border-border"}`}
                >
                  <div className="relative px-3 py-2">
                    <div
                      className={`absolute inset-0 ${votedOption === idx ? "bg-primary/10" : "bg-secondary/60"}`}
                      style={{ width: votedOption !== null ? `${opt.pct}%` : "0%", transition: "width 0.6s ease" }}
                    />
                    <div className="relative flex items-center justify-between">
                      <span className={`text-xs font-medium ${votedOption === idx ? "text-primary" : "text-foreground"}`}>{opt.label}</span>
                      {votedOption !== null && <span className="text-xs text-muted-foreground font-semibold">{opt.pct}%</span>}
                    </div>
                  </div>
                </button>
              ))}
              <p className="text-xs text-muted-foreground pl-1">{votedOption !== null ? "You voted · " : ""}Tap to vote</p>
            </div>
          )}

          {post.location && (
            <div className="flex items-center gap-1 mt-2">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{post.location}</span>
            </div>
          )}

          {post.tags && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {post.tags.map(t => (
                <span key={t} className="text-xs font-semibold text-foreground cursor-pointer hover:text-[#D85A30]">#{t}</span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/40" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLiked(!liked)} className={`flex items-center gap-1 sm:gap-1.5 text-xs transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}>
              <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
              <span className="hidden sm:inline">{post.likes + (liked ? 1 : 0)}</span>
              <span className="sm:hidden">{post.likes + (liked ? 1 : 0) > 999 ? `${Math.round((post.likes + (liked ? 1 : 0)) / 1000)}k` : post.likes + (liked ? 1 : 0)}</span>
            </button>
            <button className="flex items-center gap-1 sm:gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="w-4 h-4" /><span className="hidden sm:inline">{post.comments}</span><span className="sm:hidden">{post.comments > 999 ? `${Math.round(post.comments / 1000)}k` : post.comments}</span>
            </button>
            <button className="flex items-center gap-1 sm:gap-1.5 text-xs text-muted-foreground hover:text-emerald-600 transition-colors">
              <Repeat2 className="w-4 h-4" /><span className="hidden sm:inline">{post.reposts}</span><span className="sm:hidden">{post.reposts > 999 ? `${Math.round(post.reposts / 1000)}k` : post.reposts}</span>
            </button>
            <button className="flex items-center gap-1 sm:gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={() => setBookmarked(!bookmarked)} className={`flex items-center gap-1 sm:gap-1.5 text-xs transition-colors ${bookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
              <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-primary" : ""}`} />
            </button>
          </div>
    </div>
  );
}

// ─── Post Composer ─────────────────────────────────────────────────────────────

function PostComposer({ onAddPost }: { onAddPost?: (newPost: any) => void }) {
  const { t } = useLanguage();
  const [postType, setPostType] = useState("regular");
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState<{ url: string; type: "image" | "video"; name: string } | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const QUICK_EMOJIS = ["😊", "🚀", "❤️", "👍", "🎉", "🙏", "💡", "✨", "🔥", "💯"];

  const postTypes = [
    { id: "regular",   tKey: "post_btn",            icon: Globe },
    { id: "question",  tKey: "post_type_question",  icon: HelpCircle },
    { id: "tip",       tKey: "post_type_tip",        icon: Zap },
    { id: "need_help", tKey: "post_type_need_help",  icon: Users },
  ];

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
  };

  const handlePostSubmit = () => {
    if (!text.trim() && !mediaFile) return;
    if (onAddPost) {
      onAddPost({
        id: Date.now(),
        author: {
          name: "PathaSathi User",
          handle: "@pathasathi_user",
          avatar: "U",
          color: "from-[#e6653c] to-[#D85A30]",
          verified: true,
        },
        time: "Just now",
        content: text,
        image: mediaFile?.type === "image" ? mediaFile.url : undefined,
        video: mediaFile?.type === "video" ? mediaFile.url : undefined,
        likes: 0,
        comments: 0,
        reposts: 0,
      });
    }
    setText("");
    setMediaFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-3 sm:p-4 mb-3 sm:mb-4">
      {/* Top Header: Avatar + Post Type Buttons vertically centered */}
      <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0">
          <User className="w-5 h-5 text-slate-500" />
        </div>
        <div className="flex gap-1.5 sm:gap-2 flex-wrap items-center flex-1">
          {postTypes.map(({ id, tKey, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPostType(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all group ${
                postType === id
                  ? "bg-[#C04A22]/15 text-[#8C3015] border border-[#C04A22]/40 font-bold shadow-2xs"
                  : "bg-slate-100/90 text-slate-700 font-semibold border border-transparent hover:bg-[#C04A22]/10 hover:text-[#8C3015] hover:border-[#C04A22]/30"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 transition-colors ${postType === id ? "text-[#C04A22]" : "text-[#C04A22] group-hover:text-[#8C3015]"}`} />
              <span className="hidden xs:inline sm:inline">{t(tKey)}</span>
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={
          postType === "question" ? t("post_placeholder_question")
          : postType === "tip" ? t("post_placeholder_tip")
          : postType === "need_help" ? t("post_placeholder_need_help")
          : t("post_placeholder_default")
        }
        className="w-full text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[60px]"
        rows={2}
      />

      {/* Media Preview Box */}
      {mediaFile && (
        <div className="relative mt-2.5 rounded-2xl overflow-hidden border border-border/80 bg-slate-950 group">
          {mediaFile.type === "image" ? (
            <img src={mediaFile.url} alt="Media preview" className="w-full max-h-60 object-cover" />
          ) : (
            <video src={mediaFile.url} controls className="w-full max-h-60 object-cover" />
          )}
          <button
            type="button"
            onClick={removeMedia}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors shadow-md"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-2.5 border-t border-border mt-2">
        <div className="flex gap-1 items-center relative">
          {/* Photo Button (Icon Only) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-slate-700 hover:text-[#8C3015] hover:bg-[#C04A22]/10 transition-colors"
            title="Upload Photo"
          >
            <Image className="w-5 h-5 text-[#C04A22]" />
          </button>

          {/* Video Button (Icon Only) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-slate-700 hover:text-[#8C3015] hover:bg-[#C04A22]/10 transition-colors"
            title="Upload Video"
          >
            <Video className="w-5 h-5 text-[#C04A22]" />
          </button>

          {/* Emoji Button & Picker Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setEmojiPickerOpen(v => !v)}
              className="p-2 rounded-xl text-slate-700 hover:text-[#8C3015] hover:bg-[#C04A22]/10 transition-colors"
              title="Add Emoji"
            >
              <Smile className="w-5 h-5 text-[#C04A22]" />
            </button>

            {emojiPickerOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setEmojiPickerOpen(false)} />
                <div className="absolute left-0 bottom-11 z-40 bg-white rounded-2xl shadow-xl border border-border p-2 flex items-center gap-1 sm:gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                  {QUICK_EMOJIS.map(emo => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => insertEmoji(emo)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl hover:bg-[#C04A22]/10 flex items-center justify-center text-base sm:text-lg transition-transform hover:scale-125"
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Location Icon */}
          <button type="button" className="p-2 rounded-xl text-slate-700 hover:text-[#8C3015] hover:bg-[#C04A22]/10 transition-colors" title="Add Location">
            <MapPin className="w-5 h-5 text-[#C04A22]" />
          </button>

          {/* Poll Icon */}
          <button type="button" className="p-2 rounded-xl text-slate-700 hover:text-[#8C3015] hover:bg-[#C04A22]/10 transition-colors" title="Create Poll">
            <BarChart2 className="w-5 h-5 text-[#C04A22]" />
          </button>
        </div>

        <button
          type="button"
          onClick={handlePostSubmit}
          className="px-5 py-1.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-40 shadow-xs"
          style={{ background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)" }}
          disabled={!text.trim() && !mediaFile}
        >
          {t("post_btn")}
        </button>
      </div>
    </div>
  );
}

// ─── Tab Empty States ──────────────────────────────────────────────────────────

function FollowingEmpty() {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-2xl border border-border p-10 text-center">
      <UserCheck className="w-12 h-12 text-emerald-600 mx-auto mb-3 opacity-40" />
      <p className="font-semibold text-foreground mb-1">{t("empty_following")}</p>
      <p className="text-sm text-muted-foreground">{t("empty_following_sub")}</p>
    </div>
  );
}

function CommunityBanner() {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-3 sm:p-4 flex items-center gap-3 mb-1">
      <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-indigo-900">Posts from your communities</div>
        <div className="text-xs text-indigo-600">You are in 4 communities · Showing latest updates</div>
      </div>
      <button onClick={() => navigate("/communities")} className="text-xs text-indigo-600 font-medium hover:underline flex-shrink-0">Manage</button>
    </div>
  );
}

function LocalBanner() {
  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 sm:p-4 flex items-center gap-3 mb-1 group cursor-pointer">
      <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-slate-600 group-hover:text-[#8C3015] transition-colors flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-900">Posts near you</div>
        <div className="text-xs text-slate-600">📍 Showing posts from Queens, Brooklyn & NYC area</div>
      </div>
      <button className="text-xs text-slate-600 font-medium hover:underline flex-shrink-0">Change</button>
    </div>
  );
}

// ─── Right Panel ──────────────────────────────────────────────────────────────

function RightPanel({
  selectedDate,
  onDateSelect,
}: {
  selectedDate: string | null;
  onDateSelect: (key: string | null) => void;
}) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="space-y-4 pt-4 pb-8 sticky top-4">
      <MiniCalendar selectedDate={selectedDate} onSelect={onDateSelect} />

      <WeatherWidget />

      <div className="bg-white rounded-2xl border border-border p-4 group cursor-pointer">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-slate-600 group-hover:text-[#8C3015] transition-colors" />
          <h3 className="font-semibold text-sm text-foreground">{t("widget_who_to_follow")}</h3>
        </div>
        <div className="space-y-3">
          {suggestedPeople.map(p => (
            <div key={p.name} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs">
                <User className="w-4.5 h-4.5 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.bio}</div>
              </div>
              <button className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition flex-shrink-0">
                {t("widget_follow")}
              </button>
            </div>
          ))}
        </div>
      </div>


      <div className="bg-white rounded-2xl border border-border p-4 group cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-600 group-hover:text-[#8C3015] transition-colors" />
            <h3 className="font-semibold text-sm text-foreground">{t("widget_near_you")}</h3>
          </div>
          <button onClick={() => navigate("/map")} className="text-xs text-primary hover:underline">{t("widget_view_map")}</button>
        </div>
        <div className="space-y-2">
          {["🕌 Islamic Center · 0.3 mi", "🏛️ Legal Aid NYC · 0.8 mi", "🛒 Bangladeshi Grocery · 1.1 mi", "🏥 City Clinic · 1.4 mi"].map(p => (
            <button key={p} className="w-full text-left text-xs text-muted-foreground hover:text-foreground flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TAB_CONFIG = [
  { id: "for-you",    tKey: "tab_foryou",    icon: Star },
  { id: "map",        tKey: "tab_map",       icon: Map },
  { id: "following",  tKey: "tab_following", icon: UserCheck },
  { id: "local",      tKey: "tab_local",     icon: MapPin },
];

// ─── Home Feed ────────────────────────────────────────────────────────────────

// ─── Quick Access Box ─────────────────────────────────────────────────────────
const ALL_QUICK_FEATURES = [
  { id: "search",        label: "Search",       icon: "🔍", path: "/search"        },
  { id: "map",           label: "Map",           icon: "🗺️", path: "/map"           },
  { id: "reels",         label: "Reels",         icon: "🎬", path: "/reels"         },
  { id: "messages",      label: "Messages",      icon: "💬", path: "/messages"      },
  { id: "notifications", label: "Notifs",        icon: "🔔", path: "/notifications" },
  { id: "profile",       label: "Profile",       icon: "👤", path: "/profile"       },
  { id: "services",      label: "Services",      icon: "🛠️", path: "/services"      },
  { id: "communities",   label: "Communities",   icon: "👥", path: "/communities"   },
  { id: "saved",         label: "Saved",         icon: "🔖", path: "/saved"         },
  { id: "qa",            label: "Q&A",           icon: "❓", path: "/qa"            },
  { id: "settings",      label: "Settings",      icon: "⚙️", path: "/settings"      },
  { id: "admin",         label: "Admin",         icon: "📊", path: "/admin"         },
];

const QA_STORAGE_KEY = "ic_quick_pinned";
const QA_USAGE_KEY   = "ic_feature_usage";
const AUTO_PIN_THRESHOLD = 3;

function getUsage(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(QA_USAGE_KEY) || "{}"); } catch { return {}; }
}
function getPinned(): string[] {
  try { return JSON.parse(localStorage.getItem(QA_STORAGE_KEY) || "[]"); } catch { return []; }
}
function setPinned(ids: string[]) {
  localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(ids));
}

// variant="mobile" = icon button in quick-bar, variant="desktop" = tab-style trigger in tab bar
function QuickAccessBox({ navigate, variant = "mobile" }: { navigate: (p: string) => void; variant?: "mobile" | "desktop" }) {
  const { t } = useLanguage();
  const [pinned, setPinnedState]  = useState<string[]>(() => getPinned());
  const [usage]                   = useState<Record<string, number>>(() => getUsage());
  const [open, setOpen]           = useState(false);
  const [boxTab, setBoxTab]       = useState<"shortcuts" | "favourites">("shortcuts");
  const [favs, setFavs]           = useState<MyBoxFavourite[]>(() => getFavourites());
  const popupRef                  = useRef<HTMLDivElement>(null);

  // Refresh favourites whenever popup opens
  useEffect(() => { if (open) setFavs(getFavourites()); }, [open]);

  // Auto-pin heavily used features
  useEffect(() => {
    const current = getPinned();
    let changed = false;
    Object.entries(usage).forEach(([id, count]) => {
      if ((count as number) >= AUTO_PIN_THRESHOLD && !current.includes(id)) { current.push(id); changed = true; }
    });
    if (changed) { setPinned(current); setPinnedState([...current]); }
  }, [usage]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const togglePin = (id: string) => {
    const next = pinned.includes(id) ? pinned.filter(p => p !== id) : [...pinned, id];
    setPinned(next); setPinnedState(next);
  };

  const trackAndGo = (id: string, path: string) => {
    const u = getUsage();
    u[id] = (u[id] || 0) + 1;
    localStorage.setItem(QA_USAGE_KEY, JSON.stringify(u));
    setOpen(false); navigate(path);
  };

  const removeFav = (id: string) => {
    const next = removeFavourite(id);
    setFavs([...next]);
  };

  const pinnedFeatures = ALL_QUICK_FEATURES.filter(f => pinned.includes(f.id));
  const unpinned       = ALL_QUICK_FEATURES.filter(f => !pinned.includes(f.id));

  const trigger = variant === "desktop" ? (
    <button
      onClick={() => setOpen(v => !v)}
      className={`w-full h-full flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-3 sm:py-3.5 px-3 text-xs font-medium transition-all group ${
        open ? "text-[#8C3015] border-b-2 border-[#C04A22] font-bold" : "text-slate-600 hover:text-[#8C3015] hover:bg-slate-50"
      }`}
    >
      <LayoutGrid className={`w-4 h-4 sm:w-3.5 sm:h-3.5 transition-colors ${open ? "text-[#C04A22]" : "text-slate-600 group-hover:text-[#8C3015]"}`} />
      <span className="hidden sm:block">MyBox</span>
    </button>
  ) : (
    <button
      onClick={() => setOpen(v => !v)}
      className={`w-full h-11 rounded-2xl flex items-center justify-center border transition-all shadow-sm ${
        open ? "bg-[#C04A22]/10 border-[#C04A22]/30 shadow-md" : "bg-white border-border hover:shadow-md hover:bg-slate-50"
      }`}
    >
      <LayoutGrid className={`w-5 h-5 transition-colors ${open ? "text-[#C04A22]" : "text-slate-600 group-hover:text-[#8C3015]"}`} />
    </button>
  );

  return (
    <div ref={popupRef} className={variant === "mobile" ? "relative flex-1 mx-2" : "relative w-full h-full flex-1 flex flex-col justify-center"}>
      {trigger}

      {open && (
        <>
          {/* Full-screen backdrop (mobile only to not block tab interactions) */}
          <div className="fixed inset-0 z-40 xl:hidden" onClick={() => setOpen(false)} />
          <div
            className={`absolute z-50 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-top-3 fade-in duration-200 ${
              variant === "desktop"
                ? "left-1/2 -translate-x-1/2 top-full mt-2 w-[min(340px,calc(100vw-2rem))]"
                : "left-1/2 -translate-x-1/2 top-14 w-[min(320px,calc(100vw-2rem))]"
            }`}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-foreground">{t("qa_box_title")}</span>
                </div>
                <button onClick={() => setOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Tab switcher */}
              <div className="flex items-center bg-secondary rounded-xl p-0.5 mb-3">
                <button
                  onClick={() => setBoxTab("shortcuts")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    boxTab === "shortcuts" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ⚡ Shortcuts
                </button>
                <button
                  onClick={() => setBoxTab("favourites")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                    boxTab === "favourites" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ⭐ Favourites
                  {favs.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                      {favs.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ── SHORTCUTS TAB ── */}
            {boxTab === "shortcuts" && (
              <div className="max-h-72 overflow-y-auto">
                {pinnedFeatures.length > 0 && (
                  <div className="px-4 pb-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("qa_box_pinned")}</p>
                    <div className="flex flex-wrap gap-2">
                      {pinnedFeatures.map(f => (
                        <div key={f.id} className="relative">
                          <button
                            onClick={() => trackAndGo(f.id, f.path)}
                            className="flex flex-col items-center gap-1 w-14 p-2 rounded-xl bg-secondary ring-1 ring-border hover:bg-secondary/80 transition-all"
                          >
                            <span className="text-xl leading-none">{f.icon}</span>
                            <span className="text-[9px] font-medium text-foreground leading-tight text-center">{f.label}</span>
                          </button>
                          <button onClick={() => togglePin(f.id)} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="px-4 pt-1 pb-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {pinnedFeatures.length > 0 ? t("qa_box_all") : t("qa_box_add")}
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {unpinned.map(f => {
                      const useCount = usage[f.id] || 0;
                      return (
                        <div key={f.id} className="relative group">
                          <button onClick={() => trackAndGo(f.id, f.path)} className="flex flex-col items-center gap-1 w-full p-2 rounded-xl hover:bg-secondary transition-all">
                            <span className="text-xl leading-none">{f.icon}</span>
                            <span className="text-[9px] font-medium text-foreground leading-tight text-center">{f.label}</span>
                            {useCount >= 2 && <span className="text-[8px] text-amber-500 font-bold leading-none">Hot</span>}
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); togglePin(f.id); }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Pin"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {unpinned.length === 0 && <p className="text-[11px] text-muted-foreground text-center py-2">{t("qa_box_all_pinned")}</p>}
                </div>
                <div className="px-4 pb-3 border-t border-border pt-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Frequently used features are auto-pinned ✨</p>
                </div>
              </div>
            )}

            {/* ── FAVOURITES TAB ── */}
            {boxTab === "favourites" && (
              <div className="max-h-72 overflow-y-auto">
                {favs.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="text-3xl mb-2">⭐</div>
                    <p className="text-sm font-semibold text-foreground mb-1">No favourites yet</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Visit Services to add categories and providers here for quick access.
                    </p>
                    <button
                      onClick={() => { setOpen(false); navigate("/services"); }}
                      className="mt-3 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
                    >
                      Browse Services →
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-3 space-y-1.5 pb-4">
                    {/* Group by type */}
                    {(["service", "provider"] as const).map(type => {
                      const group = favs.filter(f => f.type === type);
                      if (group.length === 0) return null;
                      return (
                        <div key={type}>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            {type === "service" ? "📂 Service Categories" : "🏢 Providers & Profiles"}
                          </p>
                          <div className="space-y-1">
                            {group.map(fav => (
                              <div key={fav.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-secondary transition-colors group">
                                <button
                                  onClick={() => { setOpen(false); navigate(fav.path); }}
                                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                                >
                                  <span className="text-xl leading-none flex-shrink-0">{fav.emoji}</span>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-semibold text-foreground truncate">{fav.name}</div>
                                    {fav.subtitle && <div className="text-[10px] text-muted-foreground truncate">{fav.subtitle}</div>}
                                  </div>
                                </button>
                                <button
                                  onClick={() => removeFav(fav.id)}
                                  className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-red-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function HomeFeed() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("for-you");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [mobileCalOpen, setMobileCalOpen] = useState(false);
  const [mobileWeatherOpen, setMobileWeatherOpen] = useState(false);
  const [customPosts, setCustomPosts] = useState<any[]>([]);

  const handleAddPost = (newPost: any) => {
    setCustomPosts(prev => [newPost, ...prev]);
  };

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];
  const hasEvents = selectedEvents.length > 0;

  const formatDate = (key: string) => {
    const [yr, mo, d] = key.split("-").map(Number);
    const date = new Date(yr, mo - 1, d);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  const feedContent = (() => {
    switch (activeTab) {
      case "following":  return followingPosts;
      case "community":  return communityPosts;
      case "local":      return localPosts;
      default:           return forYouPosts;
    }
  })();

  const displayPosts = [...customPosts, ...feedContent];

  return (
    <AppLayout rightPanel={
      <RightPanel selectedDate={selectedDate} onDateSelect={setSelectedDate} />
    }>
      {/* Mobile-only header — hidden on desktop (sidebar handles nav) */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs">
          <User className="w-4.5 h-4.5 text-slate-500" />
        </div>
        <Logo size="sm" onClick={() => navigate("/feed")} />
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary group">
          <Bell className="w-5 h-5 text-slate-600 group-hover:text-[#8C3015] transition-colors" />
        </button>
      </div>

      {/* Main content: constrained width, centered */}
      <div className="w-full max-w-2xl mx-auto lg:max-w-none">
        {/* Sticky tabs bar */}
        {!selectedDate && (
          <div className="sticky top-0 lg:top-0 z-20 bg-white/90 backdrop-blur-md border-b border-border">
            <div className="grid grid-cols-5 w-full items-stretch">
              {/* 1. For You */}
              <button
                onClick={() => setActiveTab("for-you")}
                className={`w-full flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-3 sm:py-3.5 text-xs font-medium transition-all group ${
                  activeTab === "for-you"
                    ? "text-[#8C3015] font-bold border-b-2 border-[#C04A22]"
                    : "text-slate-600 hover:text-[#8C3015] hover:bg-slate-50"
                }`}
              >
                <Star className={`w-5 h-5 sm:w-3.5 sm:h-3.5 flex-shrink-0 transition-colors ${activeTab === "for-you" ? "text-[#C04A22]" : "text-slate-600 group-hover:text-[#8C3015]"}`} />
                <span className="hidden sm:inline truncate">{t("tab_foryou")}</span>
              </button>

              {/* 2. MyBox */}
              <div className="w-full flex items-stretch">
                <QuickAccessBox navigate={navigate} variant="desktop" />
              </div>

              {/* 3. Map */}
              <button
                onClick={() => setActiveTab("map")}
                className={`w-full flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-3 sm:py-3.5 text-xs font-medium transition-all group ${
                  activeTab === "map"
                    ? "text-[#8C3015] font-bold border-b-2 border-[#C04A22]"
                    : "text-slate-600 hover:text-[#8C3015] hover:bg-slate-50"
                }`}
              >
                <Map className={`w-5 h-5 sm:w-3.5 sm:h-3.5 flex-shrink-0 transition-colors ${activeTab === "map" ? "text-[#C04A22]" : "text-slate-600 group-hover:text-[#8C3015]"}`} />
                <span className="hidden sm:inline truncate">{t("tab_map")}</span>
              </button>

              {/* 4. Following */}
              <button
                onClick={() => setActiveTab("following")}
                className={`w-full flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-3 sm:py-3.5 text-xs font-medium transition-all group ${
                  activeTab === "following"
                    ? "text-[#8C3015] font-bold border-b-2 border-[#C04A22]"
                    : "text-slate-600 hover:text-[#8C3015] hover:bg-slate-50"
                }`}
              >
                <UserCheck className={`w-5 h-5 sm:w-3.5 sm:h-3.5 flex-shrink-0 transition-colors ${activeTab === "following" ? "text-[#C04A22]" : "text-slate-600 group-hover:text-[#8C3015]"}`} />
                <span className="hidden sm:inline truncate">{t("tab_following")}</span>
              </button>

              {/* 5. Local */}
              <button
                onClick={() => setActiveTab("local")}
                className={`w-full flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-3 sm:py-3.5 text-xs font-medium transition-all group ${
                  activeTab === "local"
                    ? "text-[#8C3015] font-bold border-b-2 border-[#C04A22]"
                    : "text-slate-600 hover:text-[#8C3015] hover:bg-slate-50"
                }`}
              >
                <MapPin className={`w-5 h-5 sm:w-3.5 sm:h-3.5 flex-shrink-0 transition-colors ${activeTab === "local" ? "text-[#C04A22]" : "text-slate-600 group-hover:text-[#8C3015]"}`} />
                <span className="hidden sm:inline truncate">{t("tab_local")}</span>
              </button>
            </div>
          </div>
        )}

        <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
          {selectedDate ? (
            <>
              {/* Date filter header */}
              <div className="flex items-center justify-between bg-white rounded-2xl border border-border px-3 sm:px-4 py-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">{formatDate(selectedDate)}</div>
                    <div className="text-xs text-muted-foreground">
                      {hasEvents ? `${selectedEvents.length} event${selectedEvents.length > 1 ? "s" : ""} on this day` : "No events scheduled"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-xl hover:bg-secondary transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              </div>

              {hasEvents ? (
                selectedEvents.map(event => <EventCard key={event.id} event={event} />)
              ) : (
                <div className="bg-white rounded-2xl border border-border p-8 sm:p-10 text-center">
                  <div className="text-4xl mb-3">📅</div>
                  <div className="text-base font-semibold text-foreground mb-1">{t("cal_no_events")}</div>
                  <div className="text-sm text-muted-foreground mb-4">{t("cal_no_events_hint")}</div>
                  <button onClick={() => setSelectedDate(null)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
                    {t("cal_back")}
                  </button>
                </div>
              )}
            </>
          ) : activeTab === "map" ? (
            <MapDiscoveryContent embedded={true} />
          ) : (
            <>
              <PostComposer onAddPost={handleAddPost} />

              {/* Mobile quick-access icon bar — icon-only buttons with floating popup */}
              <div className="xl:hidden flex items-center justify-between">
                {/* Calendar icon → popup */}
                <div className="relative">
                  <button
                    onClick={() => { setMobileCalOpen(v => !v); setMobileWeatherOpen(false); }}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm group ${
                      mobileCalOpen
                        ? "bg-secondary border border-border shadow-md"
                        : "bg-white border border-border hover:shadow-md"
                    }`}
                  >
                    <Calendar className="w-5 h-5 text-slate-600 group-hover:text-[#8C3015] transition-colors" />
                  </button>

                  {mobileCalOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMobileCalOpen(false)}
                      />
                      {/* Floating popup */}
                      <div className="absolute left-0 top-14 z-50 w-[min(340px,calc(100vw-1.5rem))] bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-top-3 fade-in duration-200">
                        <MiniCalendar selectedDate={selectedDate} onSelect={(d) => { setSelectedDate(d); setMobileCalOpen(false); }} />
                      </div>
                    </>
                  )}
                </div>

                {/* Quick Access Center Box */}
                <QuickAccessBox navigate={navigate} />

                {/* Weather icon → popup */}
                <div className="relative">
                  <button
                    onClick={() => { setMobileWeatherOpen(v => !v); setMobileCalOpen(false); }}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm group ${
                      mobileWeatherOpen
                        ? "bg-secondary border border-border shadow-md"
                        : "bg-white border border-border hover:shadow-md"
                    }`}
                  >
                    <Thermometer className="w-5 h-5 text-slate-600 group-hover:text-[#8C3015] transition-colors" />
                  </button>

                  {mobileWeatherOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMobileWeatherOpen(false)}
                      />
                      {/* Floating popup */}
                      <div className="absolute right-0 top-14 z-50 w-[min(360px,calc(100vw-1.5rem))] bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-top-3 fade-in duration-200">
                        <WeatherWidget />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Tab-specific banner */}
              {activeTab === "community" && <CommunityBanner />}
              {activeTab === "local" && <LocalBanner />}

              {/* Following: show "suggested people" strip before posts */}
              {activeTab === "following" && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground font-medium">{t("following_banner")}</p>
                </div>
              )}

              {/* Local: location note */}
              {activeTab === "local" && feedContent.length === 0 && (
                <div className="bg-white rounded-2xl border border-border p-8 sm:p-10 text-center">
                  <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-foreground mb-1">{t("empty_local")}</p>
                  <p className="text-sm text-muted-foreground">{t("empty_local_sub")}</p>
                </div>
              )}

              {displayPosts.map((post, idx) => (
                <Fragment key={post.id}>
                  <PostCard post={post} />

                  {/* Who to Follow — injected after 2nd post, mobile only */}
                  {idx === 1 && (
                    <div className="xl:hidden bg-white rounded-2xl border border-border p-4 group cursor-pointer">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-slate-600 group-hover:text-[#8C3015] transition-colors" />
                        <h3 className="font-semibold text-sm text-foreground">{t("widget_who_to_follow")}</h3>
                      </div>
                      <div className="space-y-3">
                        {suggestedPeople.slice(0, 4).map(p => (
                          <div key={p.name} className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs">
                              <User className="w-4.5 h-4.5 text-slate-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{p.bio}</div>
                            </div>
                            <button className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition flex-shrink-0">
                              {t("widget_follow")}
                            </button>
                          </div>
                        ))}
                        <button className="w-full text-center text-xs text-muted-foreground font-medium py-1.5 hover:bg-secondary rounded-xl transition-colors">
                          {t("widget_see_more")}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Near You — injected after 4th post, mobile only */}
                  {idx === 3 && (
                    <div className="xl:hidden bg-white rounded-2xl border border-border p-4 group cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-600 group-hover:text-[#8C3015] transition-colors" />
                          <h3 className="font-semibold text-sm text-foreground">{t("widget_near_you")}</h3>
                        </div>
                        <a href="/map" className="text-xs text-primary hover:underline font-medium">{t("widget_view_map_arrow")}</a>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { emoji: "🕌", name: "Islamic Center", dist: "0.3 mi" },
                          { emoji: "🏛️", name: "Legal Aid NYC", dist: "0.8 mi" },
                          { emoji: "🛒", name: "Bangladeshi Grocery", dist: "1.1 mi" },
                          { emoji: "🏥", name: "City Clinic", dist: "1.4 mi" },
                        ].map(p => (
                          <button key={p.name} className="flex items-center gap-2 p-2.5 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors text-left">
                            <span className="text-base leading-none">{p.emoji}</span>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-foreground truncate">{p.name}</div>
                              <div className="text-[10px] text-muted-foreground">{p.dist}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </Fragment>
              ))}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
