import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { GoldenBadge } from "../components/ui/GoldenBadge";
import {
  MapPin, Link as LinkIcon, Calendar, CheckCircle, Edit3, Users, Globe, MessageCircle,
  Bookmark, Building, Heart, Repeat2, Share2, MoreHorizontal, Image as ImageIcon,
  HelpCircle, Zap, UserPlus, BarChart2, X, Search, UserCheck, ChevronRight, User,
  ArrowLeft, Mail, Bell, BellOff, Flag, UserX, VolumeX, Sparkles, Check, Play,
  Download, Eye, MessageSquare, ExternalLink, ShieldCheck, GraduationCap, Briefcase, Languages,
  Video, Smile
} from "lucide-react";

export interface UserProfileData {
  id: string | number;
  name: string;
  handle: string;
  avatarImage?: string;
  bannerImage: string;
  verified: boolean;
  role: string;
  roleType: "member" | "advisor" | "student" | "advocate";
  visaStatus: string;
  originCountry: string;
  location: string;
  website: string;
  joinedDate: string;
  bio: string;
  languages: string[];
  followingCount: number;
  followersCount: number;
  mutualFollowersPreview: string;
  isFollowing?: boolean;
  isMuted?: boolean;
  isNotificationsOn?: boolean;
}

export interface TweetPost {
  id: number;
  author: {
    name: string;
    handle: string;
    avatarImage?: string;
    verified: boolean;
  };
  time: string;
  content: string;
  tags?: string[];
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  reposts: number;
  views: string;
  isLiked?: boolean;
  isReposted?: boolean;
  isBookmarked?: boolean;
  isPinned?: boolean;
  repostedBy?: string;
}

export interface TweetReply {
  id: number;
  parentPost: {
    author: { name: string; handle: string; verified: boolean };
    time: string;
    content: string;
  };
  reply: {
    time: string;
    content: string;
    likes: number;
    reposts: number;
    comments: number;
    views: string;
    isLiked?: boolean;
  };
}

export const formatStatusShort = (status?: string) => {
  if (!status) return "";
  const s = status.toLowerCase();
  if (s.includes("student") || s.includes("f-1") || s.includes("opt")) return "Student";
  if (s.includes("citizen")) return "Citizen";
  if (s.includes("resident") || s.includes("green card") || s.includes("pr")) return "Resident";
  if (s.includes("asylum")) return "Asylum";
  if (s.includes("work") || s.includes("ead") || s.includes("employ") || s.includes("h-1b")) return "Employed";
  return status.split(" ")[0] || "Member";
};

// ─── Universal Mock Users Database (Twitter Profiles) ──────────────────────────────
export const mockUniversalUsers: Record<string, UserProfileData> = {
  "rafiq_ahmed": {
    id: "rafiq_ahmed",
    name: "Rafiq Ahmed",
    handle: "@rafiq_ahmed",
    bannerImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=400&fit=crop",
    verified: true,
    role: "Community Member",
    roleType: "member",
    visaStatus: "Student",
    originCountry: "Bangladesh 🇧🇩",
    location: "Queens, New York",
    website: "https://rafiqahmed.dev",
    joinedDate: "Joined August 2024",
    bio: "New immigrant from Bangladesh 🇧🇩 | Living in Queens, NYC | F-1 Student at Queens College | Sharing my USA journey and helping others navigate the system 🤝 #NewYork #F1Student #Tech",
    languages: ["Bengali", "English", "Hindi"],
    followingCount: 238,
    followersCount: 1429,
    mutualFollowersPreview: "Followed by Rahim Chowdhury, Sadia Islam, and 14 others you know",
    isFollowing: false,
  },
  "nadia_islam_nyc": {
    id: "nadia_islam_nyc",
    name: "Nadia Islam, Esq.",
    handle: "@nadia_islam_nyc",
    bannerImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=400&fit=crop",
    verified: true,
    role: "Immigration Attorney",
    roleType: "advisor",
    visaStatus: "Citizen",
    originCountry: "Bangladesh / USA 🇧🇩🇺🇸",
    location: "Brooklyn, New York",
    website: "https://nadialaw.nyc",
    joinedDate: "Joined January 2023",
    bio: "Licensed Immigration Attorney in NYC ⚖️ | Specializing in H-1B, EB-2 NIW, Asylum & Family Petitions | Free community workshops every Thursday! 🗽 #ImmigrationLaw #NYC",
    languages: ["Bengali", "English", "Spanish"],
    followingCount: 412,
    followersCount: 14820,
    mutualFollowersPreview: "Followed by Rahim Chowdhury, Carlos Mendoza, and 38 others you know",
    isFollowing: true,
  },
  "rahim_bdconnect": {
    id: "rahim_bdconnect",
    name: "Rahim Chowdhury",
    handle: "@rahim_bdconnect",
    bannerImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop",
    verified: true,
    role: "Community Organizer",
    roleType: "advocate",
    visaStatus: "Resident",
    originCountry: "Bangladesh 🇧🇩",
    location: "Jackson Heights, Queens",
    website: "https://bdconnectnyc.org",
    joinedDate: "Joined March 2023",
    bio: "Founder of Bangladeshi New Yorkers 🇧🇩 | Helping new immigrants find housing, jobs, and community support in Jackson Heights | DM is always open! 🤝 #Community #NewYork",
    languages: ["Bengali", "English", "Urdu"],
    followingCount: 589,
    followersCount: 8430,
    mutualFollowersPreview: "Followed by Sadia Islam, Priya Sharma, and 29 others you know",
    isFollowing: true,
  },
  "sadia_islam_nyc": {
    id: "sadia_islam_nyc",
    name: "Sadia Islam",
    handle: "@sadia_islam_nyc",
    bannerImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=400&fit=crop",
    verified: true,
    role: "Social Worker & Advocate",
    roleType: "advocate",
    visaStatus: "Resident",
    originCountry: "Bangladesh 🇧🇩",
    location: "Brooklyn, NY",
    website: "https://nycimmigrantadvocacy.org",
    joinedDate: "Joined May 2023",
    bio: "Social Worker & Community Advocate | Helping newly arrived immigrant families with schools, healthcare, and IDNYC 🌟 #Brooklyn #ImmigrantSupport",
    languages: ["Bengali", "English", "Arabic"],
    followingCount: 320,
    followersCount: 2190,
    mutualFollowersPreview: "Followed by Rahim Chowdhury, Tariq Hussain, and 12 others you know",
    isFollowing: false,
  },
  "priya_sharma_usa": {
    id: "priya_sharma_usa",
    name: "Priya Sharma",
    handle: "@priya_sharma_usa",
    bannerImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=400&fit=crop",
    verified: false,
    role: "Graduate Student (NYU)",
    roleType: "student",
    visaStatus: "Student",
    originCountry: "India 🇮🇳",
    location: "Manhattan, NY",
    website: "https://priyasharma.substack.com",
    joinedDate: "Joined September 2023",
    bio: "F-1 Graduate Student at NYU 🎓 | Tech & AI enthusiast | Sharing international student tips, OPT guides, and life in Manhattan 🗽 #InternationalStudents #STEM",
    languages: ["English", "Hindi", "Punjabi"],
    followingCount: 210,
    followersCount: 1940,
    mutualFollowersPreview: "Followed by Carlos Mendoza, Wei Zhang, and 8 others you know",
    isFollowing: false,
  },
  "carlos_mx_nyc": {
    id: "carlos_mx_nyc",
    name: "Carlos Mendoza",
    handle: "@carlos_mx_nyc",
    bannerImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop",
    verified: false,
    role: "Chef & Food Creator",
    roleType: "member",
    visaStatus: "Employed",
    originCountry: "Mexico 🇲🇽",
    location: "Corona, Queens, NY",
    website: "https://carlosculinary.com",
    joinedDate: "Joined February 2024",
    bio: "Chef & Food Blogger 🌮 | Mexican immigrant in Queens | Sharing authentic recipes and halal Mexican fusion cuisine in NYC! #QueensEats #Foodie",
    languages: ["Spanish", "English"],
    followingCount: 450,
    followersCount: 5720,
    mutualFollowersPreview: "Followed by Priya Sharma, Omar Sheikh, and 16 others you know",
    isFollowing: true,
  },
  "soraya_h": {
    id: "soraya_h",
    name: "Soraya Hosseini",
    handle: "@soraya_h",
    bannerImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=400&fit=crop",
    verified: false,
    role: "Community Member",
    roleType: "member",
    visaStatus: "Asylum",
    originCountry: "Iran 🇮🇷",
    location: "New York, NY",
    website: "https://sorayahosseini.art",
    joinedDate: "Joined November 2023",
    bio: "Designer & Writer 🎨 | Immigrant in NYC | Exploring coffee shops and documenting the immigrant experience in America ☕ #Design #NYC #Storytelling",
    languages: ["Persian", "English"],
    followingCount: 184,
    followersCount: 3510,
    mutualFollowersPreview: "Followed by Nadia Islam, Rahim Chowdhury, and 9 others you know",
    isFollowing: false,
  }
};

// ─── Tweets Database per User ──────────────────────────────────────────────────────
const userPostsDatabase: Record<string, TweetPost[]> = {
  "rafiq_ahmed": [
    {
      id: 101,
      author: { name: "Rafiq Ahmed", handle: "@rafiq_ahmed", verified: true },
      time: "4h",
      content: "Has anyone applied for a New York State ID (IDNYC) without a Social Security Number? I'm on an F-1 visa and need some form of local ID for banking. Process took only 20 minutes at Jamaica Library! 🗽 #NewYork #Banking #ImmigrantTips",
      likes: 156,
      comments: 89,
      reposts: 34,
      views: "4.2K",
      isPinned: true,
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop",
    },
    {
      id: 102,
      author: { name: "Rafiq Ahmed", handle: "@rafiq_ahmed", verified: true },
      time: "1d",
      content: "Passed my US driving test at the Staten Island DMV testing center! 🚗 Huge thanks to the practice tips shared in the Bangladeshi New Yorkers group. For anyone taking it: parallel parking between real cars is tested, so practice with cones first!",
      likes: 890,
      comments: 112,
      reposts: 78,
      views: "18.9K",
    },
    {
      id: 103,
      author: { name: "Rafiq Ahmed", handle: "@rafiq_ahmed", verified: true },
      time: "3d",
      content: "Just joined the Bangladeshi New Yorkers community on PathaSathi! Amazing to find so many warm people from home here. Special thanks to @rahim_bdconnect for welcoming me 🇧🇩❤️ #Community #NewYork",
      likes: 234,
      comments: 18,
      reposts: 12,
      views: "6.1K",
    },
    {
      id: 104,
      author: { name: "Rafiq Ahmed", handle: "@rafiq_ahmed", verified: true },
      time: "1w",
      content: "Pro tip for new students in NYC: CUNY colleges provide free MetroCards for qualifying international and low-income students through the Accelerate program. Check with your International Student Office! 🎓",
      likes: 567,
      comments: 45,
      reposts: 89,
      views: "14.3K",
    }
  ],
  "nadia_islam_nyc": [
    {
      id: 201,
      author: { name: "Nadia Islam, Esq.", handle: "@nadia_islam_nyc", verified: true },
      time: "2h",
      content: "🚨 CRITICAL UPDATE: USCIS has announced an automatic 90-day extension on pending I-765 (EAD) renewal filings! If your work authorization was expiring soon, check your receipt notice (Form I-797C) for eligibility. Here is what you need to know 🧵👇",
      likes: 2450,
      comments: 342,
      reposts: 1120,
      views: "68.4K",
      isPinned: true,
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop",
    },
    {
      id: 202,
      author: { name: "Nadia Islam, Esq.", handle: "@nadia_islam_nyc", verified: true },
      time: "1d",
      content: "For everyone asking about H-1B cap-exempt employers: universities, nonprofit research orgs, and government research entities can sponsor H-1B WITHOUT waiting for the lottery! This is a massive opportunity for researchers and academics 🎓 #H1B #VisaGuide",
      likes: 1840,
      comments: 215,
      reposts: 640,
      views: "42.1K",
    },
    {
      id: 203,
      author: { name: "Nadia Islam, Esq.", handle: "@nadia_islam_nyc", verified: true },
      time: "4d",
      content: "Hosting our Free Immigration Legal Workshop this Thursday at 6 PM EST via Zoom. Topics: H-1B to Green Card roadmap, STEM OPT transition, and asylum defense. Link in bio to register! 🗽⚖️",
      likes: 920,
      comments: 88,
      reposts: 310,
      views: "23.5K",
    }
  ],
  "rahim_bdconnect": [
    {
      id: 301,
      author: { name: "Rahim Chowdhury", handle: "@rahim_bdconnect", verified: true },
      time: "5h",
      content: "💡 LOCAL TIP: The DMV in Jamaica, Queens now has Bengali-speaking staff every Wednesday! If you are from Bangladesh and taking your driving test, go on Wednesdays. Pass this along to your community friends 🙏🇧🇩 #Queens #JamaicaDMV",
      likes: 892,
      comments: 67,
      reposts: 445,
      views: "21.2K",
      isPinned: true,
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=450&fit=crop",
    },
    {
      id: 302,
      author: { name: "Rahim Chowdhury", handle: "@rahim_bdconnect", verified: true },
      time: "2d",
      content: "Annual Bangladeshi Community Picnic is set for next Saturday at Flushing Meadows Park! Bringing homemade Biryani, live acoustic music, and free job networking sessions for newcomers. Everyone is welcome! 🍛🌳",
      likes: 1200,
      comments: 145,
      reposts: 380,
      views: "34.8K",
    }
  ],
  "sadia_islam_nyc": [
    {
      id: 401,
      author: { name: "Sadia Islam", handle: "@sadia_islam_nyc", verified: true },
      time: "3h",
      content: "🗽 Important reminder for NYC families: Enrollment for 3-K and Pre-K is open regardless of immigration status. Free translation services available at all Family Welcome Centers! #NYCImmigrants #Education",
      likes: 540,
      comments: 32,
      reposts: 110,
      views: "8.4K",
      isPinned: true,
      image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=450&fit=crop",
    },
    {
      id: 402,
      author: { name: "Sadia Islam", handle: "@sadia_islam_nyc", verified: true },
      time: "2d",
      content: "Distributed winter jackets and school supplies to 120 newcomer families in Sunset Park today. Thank you to everyone from the Bangladeshi New Yorkers group who contributed! 🧣📦❤️",
      likes: 890,
      comments: 65,
      reposts: 210,
      views: "14.2K",
    }
  ],
  "priya_sharma_usa": [
    {
      id: 501,
      author: { name: "Priya Sharma", handle: "@priya_sharma_usa", verified: false },
      time: "6h",
      content: "🎓 STEM OPT Extension Guide 2024: Make sure to apply up to 90 days before your initial 12-month post-completion OPT expires. Must have Form I-983 training plan signed by employer! #F1Visa #STEMOPT #NYU",
      likes: 720,
      comments: 94,
      reposts: 310,
      views: "19.5K",
      isPinned: true,
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=450&fit=crop",
    },
    {
      id: 502,
      author: { name: "Priya Sharma", handle: "@priya_sharma_usa", verified: false },
      time: "3d",
      content: "First year of graduate school at NYU done! Manhattan rent is insane, but the community libraries and student discounts make it worth it 🍎📚",
      likes: 380,
      comments: 24,
      reposts: 15,
      views: "5.6K",
    }
  ],
  "carlos_mx_nyc": [
    {
      id: 601,
      author: { name: "Carlos Mendoza", handle: "@carlos_mx_nyc", verified: false },
      time: "8h",
      content: "🌮 Secret to authentic Birria tacos in Queens: Slow-cooked for 6 hours with guajillo and ancho chiles. Available this weekend at our community food popup in Corona Plaza! #QueensEats #MexicanFood",
      likes: 1140,
      comments: 118,
      reposts: 420,
      views: "28.3K",
      isPinned: true,
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=450&fit=crop",
    },
    {
      id: 602,
      author: { name: "Carlos Mendoza", handle: "@carlos_mx_nyc", verified: false },
      time: "4d",
      content: "Started with a pushcart in 2021, today signed the lease for our kitchen space. Never give up on your American dream! 🇺🇸✨",
      likes: 2150,
      comments: 230,
      reposts: 680,
      views: "51.2K",
    }
  ],
  "soraya_h": [
    {
      id: 701,
      author: { name: "Soraya Hosseini", handle: "@soraya_h", verified: false },
      time: "1d",
      content: "☕ Documenting immigrant stories across NYC coffee shops. Today's interview was with an Iranian artist in Greenwich Village who moved here 30 years ago. Every story is resilient and beautiful. #ImmigrantVoices #NYC",
      likes: 640,
      comments: 52,
      reposts: 140,
      views: "11.8K",
      isPinned: true,
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=450&fit=crop",
    },
    {
      id: 702,
      author: { name: "Soraya Hosseini", handle: "@soraya_h", verified: false },
      time: "5d",
      content: "Art exhibition opening this Friday in Brooklyn showcasing immigrant artists from 12 countries. Link in bio! 🎨🗽",
      likes: 490,
      comments: 38,
      reposts: 95,
      views: "9.1K",
    }
  ]
};

export const getUserPosts = (user: UserProfileData): TweetPost[] => {
  const key = (user.id as string).toLowerCase().replace("@", "");
  if (userPostsDatabase[key]) {
    return userPostsDatabase[key];
  }
  return [
    {
      id: Date.now(),
      author: { name: user.name, handle: user.handle, verified: user.verified },
      time: "1d",
      content: `Hello everyone! Glad to be part of the ImmigrantConnect community. Connecting from ${user.location || "USA"} and excited to support one another! 🤝🗽 #ImmigrantCommunity #NewYork`,
      likes: 38,
      comments: 6,
      reposts: 3,
      views: "620",
    }
  ];
};

// ─── Replies Database ─────────────────────────────────────────────────────────────
const userRepliesDatabase: Record<string, TweetReply[]> = {
  "rafiq_ahmed": [
    {
      id: 501,
      parentPost: {
        author: { name: "Nadia Islam, Esq.", handle: "@nadia_islam_nyc", verified: true },
        time: "1d",
        content: "For everyone asking about H-1B cap-exempt employers: universities, nonprofit research orgs, and government research entities can sponsor H-1B without lottery..."
      },
      reply: {
        time: "18h",
        content: "This is super helpful Nadia! Does this also apply to affiliated hospitals linked with medical schools in New York?",
        likes: 42,
        reposts: 4,
        comments: 6,
        views: "1.2K",
      }
    },
    {
      id: 502,
      parentPost: {
        author: { name: "Rahim Chowdhury", handle: "@rahim_bdconnect", verified: true },
        time: "3d",
        content: "Annual Bangladeshi Community Picnic is set for next Saturday at Flushing Meadows Park..."
      },
      reply: {
        time: "2d",
        content: "Count me in! Will bring traditional sweets from Jackson Heights 🇧🇩✨",
        likes: 28,
        reposts: 2,
        comments: 3,
        views: "890",
      }
    }
  ],
  "nadia_islam_nyc": [
    {
      id: 601,
      parentPost: {
        author: { name: "Rafiq Ahmed", handle: "@rafiq_ahmed", verified: true },
        time: "18h",
        content: "This is super helpful Nadia! Does this also apply to affiliated hospitals linked with medical schools in New York?"
      },
      reply: {
        time: "16h",
        content: "Yes, Rafiq! Teaching hospitals that have formal university affiliation agreements qualify as cap-exempt employers under INA 214(g)(5)(A).",
        likes: 115,
        reposts: 14,
        comments: 8,
        views: "3.4K",
      }
    }
  ]
};

export const getUserReplies = (user: UserProfileData): TweetReply[] => {
  const key = (user.id as string).toLowerCase().replace("@", "");
  if (userRepliesDatabase[key]) {
    return userRepliesDatabase[key];
  }
  return [
    {
      id: Date.now() + 1,
      parentPost: {
        author: { name: "Rahim Chowdhury", handle: "@rahim_bdconnect", verified: true },
        time: "2d",
        content: "Annual Bangladeshi Community Picnic is set for next Saturday at Flushing Meadows Park..."
      },
      reply: {
        time: "1d",
        content: "Excited for this! Looking forward to meeting everyone in person. 🤝✨",
        likes: 19,
        reposts: 2,
        comments: 1,
        views: "480",
      }
    }
  ];
};

const QUICK_EMOJIS = ["👍", "❤️", "🔥", "🎉", "👏", "🙌", "😊", "🗽", "🇺🇸", "🇧🇩", "🤝", "💡"];

export function Profile() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  // Identify target user
  const routeUserKey = (params.userId || params.username || searchParams.get("user") || searchParams.get("handle") || "rafiq_ahmed")
    .replace("@", "")
    .toLowerCase();

  const activeUser: UserProfileData = mockUniversalUsers[routeUserKey] || {
    id: routeUserKey,
    name: routeUserKey.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    handle: `@${routeUserKey}`,
    bannerImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=400&fit=crop",
    verified: false,
    role: "Community Member",
    roleType: "member",
    visaStatus: "Member",
    originCountry: "USA / Global 🌐",
    location: "New York, NY",
    website: `https://pathasathi.com/u/${routeUserKey}`,
    joinedDate: "Joined 2024",
    bio: `Active member of the PathaSathi ImmigrantConnect community. Connecting, sharing knowledge, and supporting fellow immigrants. 🤝`,
    languages: ["English"],
    followingCount: 154,
    followersCount: 620,
    mutualFollowersPreview: "Followed by Rahim Chowdhury and other community members",
    isFollowing: false,
  };

  const isSelf = activeUser.handle === "@rafiq_ahmed";

  // Interactive States
  const [activeTab, setActiveTab] = useState<"posts" | "replies" | "likes" | "orders">("posts");
  const [isFollowing, setIsFollowing] = useState<boolean>(activeUser.isFollowing || false);
  const [followersCount, setFollowersCount] = useState<number>(activeUser.followersCount);
  const [isNotificationsOn, setIsNotificationsOn] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [peopleModal, setPeopleModal] = useState<"following" | "followers" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // User Profile editable state
  const [profileData, setProfileData] = useState<UserProfileData>(activeUser);

  // Posts State
  const [postsList, setPostsList] = useState<TweetPost[]>(() => getUserPosts(activeUser));
  const [newPostText, setNewPostText] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  };

  const insertEmoji = (emoji: string) => {
    setNewPostText(prev => prev + emoji);
    setEmojiPickerOpen(false);
  };

  // Re-sync states whenever routeUserKey or activeUser changes
  useEffect(() => {
    setProfileData(activeUser);
    setPostsList(getUserPosts(activeUser));
    setIsFollowing(activeUser.isFollowing || false);
    setFollowersCount(activeUser.followersCount);
    setActiveTab("posts");
    setShowMoreMenu(false);
  }, [routeUserKey, activeUser.id]);

  const userReplies = useMemo(() => getUserReplies(profileData), [profileData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Follow / Unfollow Action
  const handleToggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount(prev => Math.max(0, prev - 1));
      showToast(`Unfollowed ${activeUser.handle}`);
    } else {
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      showToast(`Following ${activeUser.handle}`);
    }
  };

  // Like Tweet Action
  const handleToggleLike = (postId: number) => {
    setPostsList(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  // Repost Tweet Action
  const handleToggleRepost = (postId: number) => {
    setPostsList(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isReposted = !p.isReposted;
          showToast(isReposted ? "Reposted to your profile" : "Removed repost");
          return {
            ...p,
            isReposted,
            reposts: isReposted ? p.reposts + 1 : p.reposts - 1,
          };
        }
        return p;
      })
    );
  };

  // Bookmark Action
  const handleToggleBookmark = (postId: number) => {
    setPostsList(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isBookmarked = !p.isBookmarked;
          showToast(isBookmarked ? "Saved to your Bookmarks" : "Removed from Bookmarks");
          return { ...p, isBookmarked };
        }
        return p;
      })
    );
  };

  // Create Tweet Action
  const handleCreatePost = () => {
    if (!newPostText.trim() && !mediaPreview) return;
    const newTweet: TweetPost = {
      id: Date.now(),
      author: {
        name: profileData.name,
        handle: profileData.handle,
        verified: profileData.verified,
      },
      time: "Just now",
      content: newPostText,
      likes: 0,
      comments: 0,
      reposts: 0,
      views: "1",
      isPinned: false,
      image: mediaPreview || undefined,
    };
    setPostsList([newTweet, ...postsList]);
    setNewPostText("");
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("Your post was published!");
  };

  // Copy Profile Link
  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowMoreMenu(false);
    showToast("Profile link copied to clipboard!");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto min-h-screen bg-white border-x border-border/80 shadow-xs relative pb-20">
        
        {/* ── Toast Notification Banner ── */}
        {toastMessage && (
          <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-fadeIn border border-slate-700">
            <Sparkles className="w-4 h-4 text-[#C04A22]" /> {toastMessage}
          </div>
        )}

        {/* ── Top Sticky Twitter Header Bar ── */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border px-4 py-2.5 flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-slate-100 transition cursor-pointer text-slate-700 active:scale-95"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-tight">
                {profileData.name}
              </h2>
              {profileData.verified && (
                <GoldenBadge size={16} title="Verified Community Member" />
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {postsList.length} {postsList.length === 1 ? "Post" : "Posts"}
            </p>
          </div>
        </div>

        {/* ── Cover / Banner Image ── */}
        <div className="relative h-36 sm:h-52 w-full bg-slate-900 overflow-hidden group">
          {profileData.bannerImage ? (
            <img
              src={profileData.bannerImage}
              alt="Profile Banner"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#C04A22] to-[#8C3015] opacity-90" />
          )}
          
          {/* Subtle Banner Overlay */}
          <div className="absolute inset-0 bg-black/10" />

          {isSelf && (
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-xs transition cursor-pointer text-xs flex items-center gap-1.5 font-medium shadow-md"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Change Header
            </button>
          )}
        </div>

        {/* ── Profile Header Details (Twitter Layout) ── */}
        <div className="px-4 sm:px-5 pb-4 bg-white">
          
          {/* Avatar and Top Actions Row */}
          <div className="flex items-end justify-between -mt-14 sm:-mt-18 mb-4 relative z-10">
            {/* Avatar with thick white border (Default clean icon when no custom photo) */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-200 border-4 border-white shadow-xl flex items-center justify-center text-slate-500 overflow-hidden relative">
                {profileData.avatarImage ? (
                  <img src={profileData.avatarImage} alt={profileData.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500" />
                )}
              </div>
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Online" />
            </div>

            {/* Right Side Action Buttons */}
            <div className="flex items-center gap-2 pb-1">
              {isSelf ? (
                /* Edit Profile Button for Own Profile */
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-5 py-2 rounded-full border border-slate-300 font-bold text-xs sm:text-sm text-slate-800 hover:bg-slate-100 transition-all cursor-pointer active:scale-95 shadow-2xs"
                >
                  Edit profile
                </button>
              ) : (
                /* Actions when viewing another Universal User */
                <>
                  {/* More Options Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className="p-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer active:scale-95"
                      title="More options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showMoreMenu && (
                      <div className="absolute right-0 top-10 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-40 animate-fadeIn text-xs font-semibold text-slate-700">
                        <button
                          onClick={handleCopyProfileLink}
                          className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition text-left cursor-pointer"
                        >
                          <Share2 className="w-4 h-4 text-slate-500" /> Copy link to profile
                        </button>
                        <button
                          onClick={() => {
                            setIsMuted(!isMuted);
                            setShowMoreMenu(false);
                            showToast(isMuted ? `Unmuted ${activeUser.handle}` : `Muted ${activeUser.handle}`);
                          }}
                          className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition text-left cursor-pointer"
                        >
                          <VolumeX className="w-4 h-4 text-slate-500" /> {isMuted ? `Unmute ${activeUser.handle}` : `Mute ${activeUser.handle}`}
                        </button>
                        <button
                          onClick={() => {
                            setShowMoreMenu(false);
                            showToast(`Blocked ${activeUser.handle}`);
                          }}
                          className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-red-50 text-red-600 transition text-left cursor-pointer"
                        >
                          <UserX className="w-4 h-4 text-red-500" /> Block {activeUser.handle}
                        </button>
                        <button
                          onClick={() => {
                            setShowMoreMenu(false);
                            showToast("Report submitted to moderation");
                          }}
                          className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-red-50 text-red-600 transition text-left cursor-pointer"
                        >
                          <Flag className="w-4 h-4 text-red-500" /> Report {activeUser.handle}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notification Toggle Button */}
                  <button
                    onClick={() => {
                      setIsNotificationsOn(!isNotificationsOn);
                      showToast(isNotificationsOn ? `Turned off notifications for ${activeUser.handle}` : `Turned on notifications for ${activeUser.handle}`);
                    }}
                    className={`p-2 rounded-full border transition cursor-pointer active:scale-95 ${
                      isNotificationsOn
                        ? "border-[#C04A22] bg-[#C04A22]/10 text-[#C04A22]"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                    title={isNotificationsOn ? "Notifications On" : "Turn on Notifications"}
                  >
                    {isNotificationsOn ? <Bell className="w-4 h-4 fill-[#C04A22]" /> : <Bell className="w-4 h-4" />}
                  </button>

                  {/* Direct Message Envelope Button */}
                  <button
                    onClick={() => navigate(`/messages?user=${profileUser.handle?.replace('@', '') || ''}`)}
                    className="p-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer active:scale-95"
                    title="Direct Message"
                  >
                    <Mail className="w-4 h-4" />
                  </button>

                  {/* Twitter Follow / Following Pill Button */}
                  <button
                    onClick={handleToggleFollow}
                    className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 shadow-sm ${
                      isFollowing
                        ? "border border-slate-300 bg-white text-slate-900 hover:bg-red-50 hover:text-red-600 hover:border-red-200 group/btn"
                        : "bg-slate-950 text-white hover:bg-slate-800"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <span className="group-hover/btn:hidden">Following</span>
                        <span className="hidden group-hover/btn:inline">Unfollow</span>
                      </>
                    ) : (
                      "Follow"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Name & Handle */}
          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {profileData.name}
              </h1>
              {profileData.verified && (
                <GoldenBadge size={20} title="Verified Community Member" />
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-slate-500 font-medium">{profileData.handle}</span>
              {!isSelf && (
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  Follows you
                </span>
              )}
            </div>
          </div>

          {/* Bio text with clickable hashtags */}
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line mb-3 font-normal">
            {profileData.bio}
          </p>

          {/* Twitter Metadata List */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-500 font-medium mb-3">
            {profileData.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{profileData.location}</span>
              </div>
            )}
            {profileData.visaStatus && (
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                <span>{formatStatusShort(profileData.visaStatus)}</span>
              </div>
            )}
            {profileData.languages && profileData.languages.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-slate-400" />
                <span>{profileData.languages.join(", ")}</span>
              </div>
            )}
          </div>

          {/* Following & Followers Counts */}
          <div className="flex items-center gap-5 text-xs sm:text-sm font-medium mb-3">
            <button
              onClick={() => setPeopleModal("following")}
              className="hover:underline cursor-pointer transition"
            >
              <strong className="text-slate-900 font-extrabold">{profileData.followingCount}</strong>{" "}
              <span className="text-slate-500">Following</span>
            </button>
            <button
              onClick={() => setPeopleModal("followers")}
              className="hover:underline cursor-pointer transition"
            >
              <strong className="text-slate-900 font-extrabold">{followersCount}</strong>{" "}
              <span className="text-slate-500">Followers</span>
            </button>
          </div>

          {/* Mutual Followers Preview Bar */}
          {!isSelf && profileData.mutualFollowersPreview && (
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-slate-500"><User className="w-3 h-3 text-slate-500" /></div>
                <div className="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-slate-500"><User className="w-3 h-3 text-slate-500" /></div>
                <div className="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-slate-500"><User className="w-3 h-3 text-slate-500" /></div>
              </div>
              <span className="truncate">{profileData.mutualFollowersPreview}</span>
            </div>
          )}
        </div>

        {/* ── Twitter Navigation Tabs Bar ── */}
        <div className="flex border-b border-border bg-white sticky top-12 z-20 overflow-x-auto no-scrollbar">
          {[
            { id: "posts", label: "Posts" },
            { id: "replies", label: "Replies" },
            { id: "likes", label: "Likes" },
            ...(isSelf ? [{ id: "orders", label: "📦 My Orders" }] : []),
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[75px] py-3.5 text-center text-xs sm:text-sm font-semibold transition relative cursor-pointer ${
                activeTab === tab.id
                  ? "text-slate-900 font-bold"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-1 bg-[#C04A22] rounded-full animate-fadeIn" />
              )}
            </button>
          ))}
        </div>

        {/* ── Tabs Content Feed ── */}
        <div className="divide-y divide-border/80">

          {/* ── 1. POSTS TAB ── */}
          {activeTab === "posts" && (
            <div>
              {/* Tweet Composer (when viewing own profile) */}
              {isSelf && (
                <div className="p-3.5 sm:p-4 border-b border-border/80 bg-white">
                  <div className="flex gap-3 items-start">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs mt-0.5">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <textarea
                        value={newPostText}
                        onChange={e => setNewPostText(e.target.value)}
                        placeholder="What is happening in your community?!"
                        rows={2}
                        className="w-full resize-none text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-none leading-relaxed focus:outline-none min-h-[52px] pt-1"
                      />

                      {/* Media Preview Box */}
                      {mediaPreview && (
                        <div className="relative my-2.5 rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 group">
                          <img src={mediaPreview} alt="Media preview" className="w-full max-h-60 object-cover" />
                          <button
                            type="button"
                            onClick={() => setMediaPreview(null)}
                            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors shadow-md cursor-pointer"
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

                      {/* Bottom Action Bar matching HomeFeed */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-2">
                        <div className="flex gap-1 items-center relative">
                          {/* Photo Button */}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-xl text-slate-700 hover:text-[#8C3015] hover:bg-[#C04A22]/10 transition-colors cursor-pointer"
                            title="Upload Photo"
                          >
                            <ImageIcon className="w-5 h-5 text-[#C04A22]" />
                          </button>

                          {/* Video Button */}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-xl text-slate-700 hover:text-[#8C3015] hover:bg-[#C04A22]/10 transition-colors cursor-pointer"
                            title="Upload Video"
                          >
                            <Video className="w-5 h-5 text-[#C04A22]" />
                          </button>

                          {/* Emoji Button & Picker Popover */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setEmojiPickerOpen(v => !v)}
                              className="p-2 rounded-xl text-slate-700 hover:text-[#8C3015] hover:bg-[#C04A22]/10 transition-colors cursor-pointer"
                              title="Add Emoji"
                            >
                              <Smile className="w-5 h-5 text-[#C04A22]" />
                            </button>

                            {emojiPickerOpen && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={() => setEmojiPickerOpen(false)} />
                                <div className="absolute left-0 bottom-11 z-40 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 flex items-center gap-1 sm:gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                                  {QUICK_EMOJIS.map(emo => (
                                    <button
                                      key={emo}
                                      type="button"
                                      onClick={() => insertEmoji(emo)}
                                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl hover:bg-[#C04A22]/10 flex items-center justify-center text-base sm:text-lg transition-transform hover:scale-125 cursor-pointer"
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
                            onClick={() => showToast("Location tagging available!")}
                            className="p-2 rounded-xl text-slate-700 hover:text-[#8C3015] hover:bg-[#C04A22]/10 transition-colors cursor-pointer"
                            title="Tag Location"
                          >
                            <MapPin className="w-5 h-5 text-[#C04A22]" />
                          </button>

                          {/* Poll Button */}
                          <button
                            type="button"
                            onClick={() => showToast("Poll creation available!")}
                            className="p-2 rounded-xl text-slate-700 hover:text-[#8C3015] hover:bg-[#C04A22]/10 transition-colors cursor-pointer"
                            title="Create Poll"
                          >
                            <BarChart2 className="w-5 h-5 text-[#C04A22]" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleCreatePost}
                          disabled={!newPostText.trim() && !mediaPreview}
                          className={`px-5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shadow-xs ${
                            newPostText.trim() || mediaPreview
                              ? "bg-[#C04A22] text-white hover:bg-[#8C3015] active:scale-95"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tweets Stream List */}
              {postsList.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-semibold">No posts yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/80">
                  {postsList.map(tweet => (
                    <article
                      key={tweet.id}
                      className="p-4 hover:bg-slate-50/70 transition cursor-pointer border-b border-border/80"
                      onClick={() => navigate(`/post/${tweet.id}`)}
                    >
                      {/* Pinned Tweet Badge */}
                      {tweet.isPinned && (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1.5 pl-8 sm:pl-10">
                          <span className="text-[#C04A22]">📌</span> Pinned Post
                        </div>
                      )}

                      <div className="flex gap-3 items-start">
                        {/* Left Column: Author Avatar (Default User Icon) */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${tweet.author.handle.replace("@", "")}`);
                          }}
                          className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs hover:opacity-90 mt-0.5"
                        >
                          <User className="w-5 h-5 text-slate-500" />
                        </div>

                        {/* Right Column: Tweet Details */}
                        <div className="flex-1 min-w-0">
                          {/* Header: Name, Badge, Handle, Time - centered vertically with avatar */}
                          <div className="flex items-center justify-between min-h-[38px] mb-1">
                            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/profile/${tweet.author.handle.replace("@", "")}`);
                                }}
                                className="font-bold text-sm text-slate-900 truncate hover:underline"
                              >
                                {tweet.author.name}
                              </span>
                              {tweet.author.verified && (
                                <GoldenBadge size={15} title="Verified Account" />
                              )}
                              <span className="text-xs text-slate-500">{tweet.author.handle}</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-xs text-slate-400">{tweet.time}</span>
                            </div>

                            {/* More Options dropdown */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showToast("Post options");
                              }}
                              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Tweet Content */}
                          <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-line font-normal">
                            {tweet.content}
                          </p>

                          {/* Attached Image / Media */}
                          {tweet.image && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxImage(tweet.image || null);
                              }}
                              className="mt-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 cursor-zoom-in max-h-80"
                            >
                              <img
                                src={tweet.image}
                                alt="Post attachment"
                                className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                              />
                            </div>
                          )}

                          {/* Action Bar - shifted left on mobile for balanced spacing and breathing room */}
                          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100/80 -ml-13 sm:ml-0 w-[calc(100%+52px)] sm:w-auto max-w-md">
                            {/* Reply */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/post/${tweet.id}?focus=comment`);
                              }}
                              className="flex items-center gap-1 sm:gap-1.5 transition group cursor-pointer hover:text-[#C04A22]"
                            >
                              <div className="p-1.5 rounded-full group-hover:bg-[#C04A22]/10">
                                <MessageCircle className="w-4 h-4" />
                              </div>
                              <span className="font-semibold">{tweet.comments}</span>
                            </button>

                            {/* Repost */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleRepost(tweet.id);
                              }}
                              className={`flex items-center gap-1 sm:gap-1.5 transition group cursor-pointer ${
                                tweet.isReposted ? "text-emerald-600 font-bold" : "hover:text-emerald-600"
                              }`}
                            >
                              <div className="p-1.5 rounded-full group-hover:bg-emerald-50">
                                <Repeat2 className="w-4 h-4" />
                              </div>
                              <span className="font-semibold">{tweet.reposts}</span>
                            </button>

                            {/* Like */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleLike(tweet.id);
                              }}
                              className={`flex items-center gap-1 sm:gap-1.5 transition group cursor-pointer ${
                                tweet.isLiked ? "text-rose-600 font-bold" : "hover:text-rose-600"
                              }`}
                            >
                              <div className="p-1.5 rounded-full group-hover:bg-rose-50">
                                <Heart className={`w-4 h-4 ${tweet.isLiked ? "fill-rose-600 text-rose-600" : ""}`} />
                              </div>
                              <span className="font-semibold">{tweet.likes}</span>
                            </button>

                            {/* Views */}
                            <div className="flex items-center gap-1 text-slate-400">
                              <Eye className="w-3.5 h-3.5" />
                              <span className="font-semibold">{tweet.views}</span>
                            </div>

                            {/* Bookmark */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleBookmark(tweet.id);
                              }}
                              className={`p-1.5 rounded-full hover:bg-[#C04A22]/10 transition cursor-pointer ${
                                tweet.isBookmarked ? "text-[#C04A22]" : "hover:text-[#C04A22]"
                              }`}
                            >
                              <Bookmark className={`w-4 h-4 ${tweet.isBookmarked ? "fill-[#C04A22] text-[#C04A22]" : ""}`} />
                            </button>

                            {/* Share */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(window.location.origin + `/post/${tweet.id}`);
                                showToast("Post link copied to clipboard");
                              }}
                              className="p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 2. REPLIES TAB (Twitter Thread Cards) ── */}
          {activeTab === "replies" && (
            <div className="divide-y divide-border/80">
              {userReplies.map(replyItem => (
                <div key={replyItem.id} className="p-4 hover:bg-slate-50/70 transition">
                  {/* Parent Tweet */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs">
                        <User className="w-4.5 h-4.5 text-slate-500" />
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                    </div>
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{replyItem.parentPost.author.name}</span>
                        <span className="text-[11px] text-slate-500">{replyItem.parentPost.author.handle} · {replyItem.parentPost.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{replyItem.parentPost.content}</p>
                    </div>
                  </div>

                  {/* User Reply */}
                  <div className="flex gap-3 pt-1">
                    <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs">
                      <User className="w-4.5 h-4.5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{profileData.name}</span>
                        <span className="text-[11px] text-slate-500">{profileData.handle} · {replyItem.reply.time}</span>
                      </div>
                      <p className="text-xs text-slate-900 mt-1 font-medium leading-relaxed">{replyItem.reply.content}</p>
                      
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500" /> {replyItem.reply.likes}</span>
                        <span className="flex items-center gap-1"><Repeat2 className="w-3 h-3 text-emerald-500" /> {replyItem.reply.reposts}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {replyItem.reply.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 3. LIKES TAB ── */}
          {activeTab === "likes" && (
            <div className="p-4 divide-y divide-slate-100">
              <p className="text-xs text-slate-500 font-medium mb-3">Posts liked by {profileData.handle}:</p>
              {postsList.slice(0, 3).map(likedTweet => (
                <div key={likedTweet.id} className="py-3 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="font-bold text-slate-900">{likedTweet.author.name}</span>
                      <span className="text-slate-400">{likedTweet.author.handle}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">{likedTweet.content}</p>
                    <div className="flex items-center gap-1 text-[11px] text-rose-600 font-bold mt-1.5">
                      <Heart className="w-3 h-3 fill-rose-600" /> Liked by {profileData.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 6. ORDERS TAB (Buyer Universal User Only) ── */}
          {activeTab === "orders" && isSelf && (
            <div className="p-4 space-y-4">
              <div className="bg-gradient-to-r from-[#8C3015] via-[#C04A22] to-[#D85A30] text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-bold text-sm">Package Tracking & Escrow Vault</h4>
                  <p className="text-xs text-orange-100 mt-0.5">Track purchases, verify rider delivery OTPs & escrow</p>
                </div>
                <button
                  onClick={() => navigate("/orders")}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-[#8C3015] font-bold text-xs hover:bg-orange-50 transition cursor-pointer shadow-xs"
                >
                  View All
                </button>
              </div>

              {/* Sample Order */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&h=300&fit=crop" alt="Item" className="w-12 h-12 rounded-xl object-cover border" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">#ORD-902</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C04A22]/15 text-[#8C3015] border border-[#C04A22]/30">In Transit</span>
                      </div>
                      <h5 className="text-xs font-semibold text-slate-700">Solid Oak Dining Table with 6 Chairs</h5>
                    </div>
                  </div>
                  <span className="font-extrabold text-emerald-600 text-sm">$350.00</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Escrow Vault</span>
                    <span className="font-bold text-emerald-900 text-[11px]">$350.00 Protected</span>
                  </div>
                  <div className="bg-[#C04A22]/10 p-2.5 rounded-xl border border-[#C04A22]/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#8C3015] uppercase block">Delivery OTP</span>
                      <span className="text-[10px] text-slate-600">Provide to rider</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-[#C04A22] text-white font-mono font-bold text-xs">427189</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Pathao Express Rider #R-902</span>
                  <button
                    onClick={() => navigate("/orders")}
                    className="text-[#C04A22] font-bold hover:text-[#8C3015] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Track Package <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Edit Profile Modal (Twitter Style) ── */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowEditModal(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-600 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="font-bold text-base text-slate-900">Edit Profile</h3>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    showToast("Profile saved successfully!");
                  }}
                  className="px-4 py-1.5 rounded-full bg-[#C04A22] text-white text-xs font-bold hover:bg-[#8C3015] transition cursor-pointer"
                >
                  Save
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#C04A22]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#C04A22] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Location</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={e => setProfileData({ ...profileData, location: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#C04A22]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Visa / Status</label>
                    <input
                      type="text"
                      value={profileData.visaStatus}
                      onChange={e => setProfileData({ ...profileData, visaStatus: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#C04A22]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Followers & Following Modal (Twitter Style) ── */}
        {peopleModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <h3 className="font-bold text-base text-slate-900 capitalize">{peopleModal}</h3>
                <button onClick={() => setPeopleModal(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {Object.values(mockUniversalUsers).map(u => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setPeopleModal(null);
                      navigate(`/profile/${u.handle.replace("@", "")}`);
                    }}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-xs text-slate-900 truncate">{u.name}</span>
                          {u.verified && <GoldenBadge size={14} title="Verified" />}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{u.handle}</p>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">{u.bio}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`Follow status toggled for ${u.handle}`);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer flex-shrink-0 ml-2"
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Image Lightbox Modal ── */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/40 rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Full view"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
