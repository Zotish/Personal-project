import React, { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  HelpCircle, ChevronUp, ChevronDown, CheckCircle2, MessageCircle,
  Eye, Search, Plus, Tag, User, Sparkles, Shield, Filter,
  Share2, Send, Bookmark, ThumbsUp, ArrowLeft, X, Check,
  Award, Clock, Building, Landmark, Scale, Briefcase, GraduationCap
} from "lucide-react";

interface AnswerItem {
  id: number;
  author: {
    name: string;
    handle: string;
    avatar: string;
    color: string;
    badge?: string;
    isExpert?: boolean;
  };
  time: string;
  body: string;
  votes: number;
  isAccepted?: boolean;
}

interface QuestionItem {
  id: number;
  title: string;
  body: string;
  category: string;
  votes: number;
  views: number;
  author: {
    name: string;
    handle?: string;
    avatar: string;
    color: string;
    anonymous: boolean;
  };
  time: string;
  answered: boolean;
  bestAnswer?: boolean;
  tags: string[];
  answers: AnswerItem[];
}

function formatShortTime(time: string): string {
  if (!time) return "now";
  return time
    .replace(/\s*hours?\s*ago/i, "h ago")
    .replace(/\s*days?\s*ago/i, "d ago")
    .replace(/\s*mins?\s*ago/i, "m ago")
    .replace(/\s*weeks?\s*ago/i, "w ago")
    .replace(/\s*months?\s*ago/i, "mo ago")
    .replace(/\s*years?\s*ago/i, "y ago")
    .replace(/Just now/i, "just now");
}

function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

function getFirstName(fullName: string): string {
  if (!fullName) return "";
  if (fullName.toLowerCase() === "anonymous") return "Anonymous";
  return fullName.split(" ")[0].replace(/,.*$/, "");
}

const INITIAL_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    title: "Can I work in the USA on a tourist visa (B-2)?",
    body: "I'm currently in New York on a B-2 tourist visa and have been here for 3 months. A local restaurant offered me a part-time job. Is this legal under immigration law? What are the risks of unauthorized work?",
    category: "Legal & Immigration",
    votes: 234,
    views: 2847,
    author: { name: "Anonymous", avatar: "A", color: "from-slate-400 to-slate-500", anonymous: true },
    time: "2 hours ago",
    answered: true,
    bestAnswer: true,
    tags: ["tourist-visa", "work-authorization", "B-2", "immigration"],
    answers: [
      {
        id: 101,
        author: {
          name: "Nadia Islam, Esq.",
          handle: "@nadia_islam_nyc",
          avatar: "NI",
          color: "from-amber-500 to-[#E05236]",
          badge: "Licensed Immigration Attorney",
          isExpert: true,
        },
        time: "1 hour ago",
        body: "No, working on a B-1/B-2 tourist visa is strictly prohibited under US Immigration Law (INA § 214(b)). Engaging in unauthorized employment will automatically violate your non-immigrant status, making you subject to deportation and future visa denials. If you wish to work, you must transition to an authorized work visa (e.g. H-1B, L-1, O-1, or apply for an EAD if eligible under another pending application).",
        votes: 89,
        isAccepted: true,
      },
      {
        id: 102,
        author: {
          name: "Rahim Chowdhury",
          handle: "@rahim_bdconnect",
          avatar: "RC",
          color: "from-blue-500 to-indigo-600",
          badge: "Community Leader",
        },
        time: "45 mins ago",
        body: "Please do not risk your legal status. Talk to a verified legal advisor first before taking any informal cash jobs.",
        votes: 24,
      }
    ],
  },
  {
    id: 2,
    title: "How do I open a US bank account without a Social Security Number (SSN)?",
    body: "I just arrived in NYC on an F-1 student visa and haven't received an SSN yet. I need to deposit tuition fees and receive money from my family back in Bangladesh. Which banks accept passport or ITIN?",
    category: "Banking & Finance",
    votes: 189,
    views: 1923,
    author: { name: "Tanvir Rahman", handle: "@tanvir_r", avatar: "TR", color: "from-blue-500 to-cyan-500", anonymous: false },
    time: "5 hours ago",
    answered: true,
    bestAnswer: true,
    tags: ["banking", "SSN", "ITIN", "F-1", "student"],
    answers: [
      {
        id: 201,
        author: {
          name: "Carlos Rivera",
          handle: "@carlos_helps",
          avatar: "CR",
          color: "from-emerald-500 to-teal-600",
          badge: "Financial & Housing Advisor",
          isExpert: true,
        },
        time: "3 hours ago",
        body: "Major banks like Bank of America, Chase, and TD Bank allow non-residents to open accounts with: 1) Your valid foreign Passport with US Visa, 2) Form I-20, 3) Proof of local US address (e.g. lease agreement, university dorm letter, or utility bill). You do NOT need an SSN to open a student checking account.",
        votes: 62,
        isAccepted: true,
      }
    ],
  },
  {
    id: 3,
    title: "What documents do I need to get a New York State Driver's License as an immigrant?",
    body: "I live in Jackson Heights, NY. Under the Green Light Law, can all immigrants apply for a standard driver's license regardless of immigration status? What proof of identity is needed at the DMV?",
    category: "Driver's License",
    votes: 156,
    views: 1456,
    author: { name: "Farhan Ahmed", handle: "@farhan_ny", avatar: "FA", color: "from-orange-500 to-rose-500", anonymous: false },
    time: "1 day ago",
    answered: true,
    bestAnswer: false,
    tags: ["driver-license", "DMV", "NY", "green-light-law"],
    answers: [
      {
        id: 301,
        author: {
          name: "Sadia Islam",
          handle: "@sadia_islam_nyc",
          avatar: "SI",
          color: "from-purple-500 to-pink-500",
          badge: "Community Navigator",
        },
        time: "18 hours ago",
        body: "Yes! NY's Green Light Law allows everyone to apply. You need to provide 6 points of ID (e.g. valid unexpired foreign passport = 4 points, foreign birth certificate = 2 points) plus proof of NY state residency (bank statement or utility bill with your name).",
        votes: 41,
        isAccepted: true,
      }
    ],
  },
  {
    id: 4,
    title: "Can asylum seekers enroll their children in public schools for free?",
    body: "We recently moved to Brooklyn and our asylum application is currently pending with USCIS. Are our children (ages 8 and 11) entitled to attend NYC public schools while we wait?",
    category: "Education & Schools",
    votes: 98,
    views: 876,
    author: { name: "Anonymous", avatar: "A", color: "from-slate-400 to-slate-500", anonymous: true },
    time: "2 days ago",
    answered: true,
    bestAnswer: true,
    tags: ["asylum", "education", "schools", "NYC", "children"],
    answers: [
      {
        id: 401,
        author: {
          name: "Dr. Priya Menon",
          handle: "@dr_priya_health",
          avatar: "PM",
          color: "from-teal-500 to-emerald-600",
          badge: "Community Health & Education Advisor",
          isExpert: true,
        },
        time: "1 day ago",
        body: "Yes, 100%! Under the US Supreme Court ruling (Plyler v. Doe), all children in the United States have a constitutional right to free public education from K-12, regardless of immigration status. NYC schools will never ask for or report immigration status.",
        votes: 55,
        isAccepted: true,
      }
    ],
  },
  {
    id: 5,
    title: "What is the difference between an ITIN and SSN? Can I use ITIN to file taxes?",
    body: "I don't have an SSN yet, but I earned income and want to pay taxes responsibly. Can I apply for an Individual Taxpayer Identification Number (ITIN)? Does filing taxes help my future green card case?",
    category: "Taxes & IRS",
    votes: 267,
    views: 3201,
    author: { name: "Amara Khan", handle: "@amara_k", avatar: "AK", color: "from-violet-500 to-purple-600", anonymous: false },
    time: "3 days ago",
    answered: true,
    bestAnswer: true,
    tags: ["taxes", "ITIN", "IRS", "SSN", "good-moral-character"],
    answers: [
      {
        id: 501,
        author: {
          name: "Nadia Islam, Esq.",
          handle: "@nadia_islam_nyc",
          avatar: "NI",
          color: "from-amber-500 to-[#E05236]",
          badge: "Licensed Immigration Attorney",
          isExpert: true,
        },
        time: "2 days ago",
        body: "An ITIN is issued by the IRS for tax processing for individuals not eligible for an SSN. You can submit Form W-7 with your federal tax return. Paying taxes with an ITIN is strongly encouraged because it establishes a track record of 'Good Moral Character' for any future immigration applications.",
        votes: 112,
        isAccepted: true,
      }
    ],
  },
];

const CATEGORIES = [
  "All Categories",
  "Legal & Immigration",
  "Banking & Finance",
  "Driver's License",
  "Education & Schools",
  "Taxes & IRS",
  "Housing & Rent",
  "Healthcare",
  "Jobs & Work",
];

export function QandA() {
  const navigate = useNavigate();
  const [questionsList, setQuestionsList] = useState<QuestionItem[]>(INITIAL_QUESTIONS);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState<"helpful" | "newest" | "unanswered">("helpful");
  const [showAskModal, setShowAskModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [userVotedMap, setUserVotedMap] = useState<{ [qId: number]: number }>({});
  const [newAnswerText, setNewAnswerText] = useState("");
  
  // Truncation states for Question Preview & Answers
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<number[]>([]);
  const [expandedAnswerIds, setExpandedAnswerIds] = useState<number[]>([]);

  const toggleExpandQ = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setExpandedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleExpandAns = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setExpandedAnswerIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleVote = (e: React.MouseEvent, qId: number, delta: number) => {
    e.stopPropagation();
    setUserVotedMap(prev => {
      const current = prev[qId] || 0;
      const next = current === delta ? 0 : delta;
      
      setQuestionsList(qList =>
        qList.map(q => {
          if (q.id === qId) {
            return { ...q, votes: q.votes - current + next };
          }
          return q;
        })
      );

      if (selectedQuestion && selectedQuestion.id === qId) {
        setSelectedQuestion(prevQ => prevQ ? { ...prevQ, votes: prevQ.votes - current + next } : null);
      }

      return { ...prev, [qId]: next };
    });
  };

  const handleAddQuestion = (newQ: { title: string; body: string; category: string; tags: string[]; anonymous: boolean }) => {
    const created: QuestionItem = {
      id: Date.now(),
      title: newQ.title,
      body: newQ.body,
      category: newQ.category,
      votes: 1,
      views: 12,
      author: {
        name: newQ.anonymous ? "Anonymous" : "Rafiq Ahmed",
        handle: newQ.anonymous ? undefined : "@rafiq_ahmed",
        avatar: newQ.anonymous ? "A" : "RA",
        color: newQ.anonymous ? "from-slate-400 to-slate-500" : "from-[#E05236] to-[#8C3015]",
        anonymous: newQ.anonymous,
      },
      time: "Just now",
      answered: false,
      tags: newQ.tags.length > 0 ? newQ.tags : ["community-help"],
      answers: [],
    };
    setQuestionsList(prev => [created, ...prev]);
    setShowAskModal(false);
  };

  const handleAddAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerText.trim() || !selectedQuestion) return;

    const answerObj: AnswerItem = {
      id: Date.now(),
      author: {
        name: "Rafiq Ahmed",
        handle: "@rafiq_ahmed",
        avatar: "RA",
        color: "from-[#E05236] to-[#8C3015]",
        badge: "Community Member",
      },
      time: "Just now",
      body: newAnswerText.trim(),
      votes: 0,
    };

    const updatedQ: QuestionItem = {
      ...selectedQuestion,
      answered: true,
      answers: [...selectedQuestion.answers, answerObj],
    };

    setQuestionsList(prev => prev.map(q => q.id === selectedQuestion.id ? updatedQ : q));
    setSelectedQuestion(updatedQ);
    setNewAnswerText("");
  };

  // Filter questions
  const filteredQuestions = questionsList
    .filter(q => {
      const matchCat = activeCategory === "All Categories" || q.category === activeCategory;
      const matchSearch =
        !search ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.body.toLowerCase().includes(search.toLowerCase()) ||
        q.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });

  return (
    <AppLayout activeTab="more">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* ── 1. Top Header Banner with Pathasathi Branding ── */}
        <div className="bg-gradient-to-br from-[#FFF7F4] via-white to-orange-50/40 rounded-3xl p-4 sm:p-6 border border-[#E05236]/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E05236] text-white flex items-center justify-center shadow-md shadow-[#E05236]/25 flex-shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Community Q&amp;A
              </h1>
            </div>
          </div>

          <button
            onClick={() => setShowAskModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#E05236] hover:bg-[#8C3015] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#E05236]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Ask a Question</span>
          </button>
        </div>

        {/* ── 2. Search & Category Filters Bar ── */}
        <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-2xs space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search immigration, banking, licenses, legal questions..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#E05236] transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Horizontal Category Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {CATEGORIES.map(cat => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                    active
                      ? "bg-[#E05236] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. Questions Feed ── */}
        <div className="space-y-3 sm:space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FFF7F4] text-[#E05236] flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">No questions found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Couldn't find any questions matching "{search}". Be the first to ask the community!
              </p>
              <button
                onClick={() => setShowAskModal(true)}
                className="px-4 py-2 rounded-xl bg-[#E05236] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                + Ask this Question
              </button>
            </div>
          ) : (
            filteredQuestions.map(q => {
              const myVote = userVotedMap[q.id] || 0;
              const isExpanded = expandedQuestionIds.includes(q.id);
              const isShort = q.body.length <= 60;

              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestion(q)}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-[#E05236]/40 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group space-y-3"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Vote Column */}
                    <div className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 sm:p-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => handleVote(e, q.id, 1)}
                        className={`p-1 rounded-lg transition active:scale-90 cursor-pointer ${
                          myVote === 1
                            ? "bg-[#E05236] text-white shadow-2xs"
                            : "text-slate-400 hover:text-[#E05236] hover:bg-slate-100"
                        }`}
                        title="Upvote"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className={`text-xs font-extrabold my-0.5 ${
                        myVote !== 0 ? "text-[#E05236]" : "text-slate-800"
                      }`}>
                        {q.votes}
                      </span>
                      <button
                        onClick={(e) => handleVote(e, q.id, -1)}
                        className={`p-1 rounded-lg transition active:scale-90 cursor-pointer ${
                          myVote === -1
                            ? "bg-slate-700 text-white"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                        title="Downvote"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#E05236] transition leading-snug">
                          {q.title}
                        </h3>
                        {q.bestAnswer && (
                          <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Solved
                          </span>
                        )}
                      </div>

                      {/* Half-line short question preview with ... See more */}
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {isExpanded || isShort ? (
                          <span>
                            {q.body}
                            {!isShort && (
                              <button
                                onClick={(e) => toggleExpandQ(e, q.id)}
                                className="text-xs font-semibold text-[#E05236] hover:underline ml-1.5 cursor-pointer inline"
                              >
                                Show less
                              </button>
                            )}
                          </span>
                        ) : (
                          <span>
                            {q.body.slice(0, 52)}
                            <button
                              onClick={(e) => toggleExpandQ(e, q.id)}
                              className="text-xs font-semibold text-[#E05236] hover:underline ml-1 cursor-pointer inline"
                            >
                              ... See more
                            </button>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom Meta Info (Equal Alignment & Spacing) */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-3.5 sm:gap-5 flex-shrink-0">
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-bold leading-none">
                        <MessageCircle className="w-3.5 h-3.5 text-[#E05236]" />
                        <span>{q.answers.length} ans</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium leading-none">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatCompactNumber(q.views)}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs flex-shrink-0">
                      {q.author.anonymous ? (
                        <span className="text-slate-500 leading-none">Anonymous</span>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 font-bold text-slate-800 leading-none">
                          <div className={`w-4.5 h-4.5 rounded-full bg-gradient-to-br ${q.author.color} flex items-center justify-center text-white text-[9px] font-extrabold flex-shrink-0`}>
                            {q.author.avatar}
                          </div>
                          <span className="truncate max-w-[90px] sm:max-w-[130px]">{getFirstName(q.author.name)}</span>
                        </div>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 leading-none">{formatShortTime(q.time)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── 4. Full Question & Expert Answers Detail View Modal ── */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Detail Top Navigation */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#E05236] bg-[#FFF7F4] border border-[#E05236]/20 px-2.5 py-0.5 rounded-full">
                  {selectedQuestion.category}
                </span>
                <span className="text-xs text-slate-400">• {selectedQuestion.time}</span>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Detail Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* Question Section */}
              <div className="space-y-3 pb-5 border-b border-slate-100">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {selectedQuestion.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedQuestion.body}
                </p>

                <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Asked by:</span>
                    <span>{selectedQuestion.author.name}</span>
                  </div>
                  <span>{selectedQuestion.views} views</span>
                </div>
              </div>

              {/* Verified Answers Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#E05236]" />
                    <span>{selectedQuestion.answers.length} Answers</span>
                  </h3>
                </div>

                {selectedQuestion.answers.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 border border-slate-100">
                    No answers yet. Be the first to help with an answer below!
                  </div>
                ) : (
                  selectedQuestion.answers.map(ans => {
                    const isAnsExpanded = expandedAnswerIds.includes(ans.id);
                    const isAnsShort = ans.body.length <= 110;

                    return (
                      <div
                        key={ans.id}
                        className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                          ans.isAccepted
                            ? "bg-[#FFF7F4]/60 border-[#E05236]/30 shadow-2xs"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        {/* Answer Author Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${ans.author.color} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                              {ans.author.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs sm:text-sm text-slate-900">{ans.author.name}</span>
                                {ans.author.isExpert && (
                                  <span className="flex items-center gap-1 text-[10px] font-extrabold text-[#E05236] bg-[#FFF7F4] border border-[#E05236]/30 px-2 py-0.5 rounded-full">
                                    <Award className="w-3 h-3 text-[#E05236]" /> Verified Attorney
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">{ans.author.badge || "Community Member"} • {ans.time}</span>
                            </div>
                          </div>

                          {ans.isAccepted && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Accepted Answer
                            </span>
                          )}
                        </div>

                        {/* Answer Text with ... See more toggle */}
                        <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {isAnsExpanded || isAnsShort ? (
                            <span>
                              {ans.body}
                              {!isAnsShort && (
                                <button
                                  onClick={(e) => toggleExpandAns(e, ans.id)}
                                  className="text-xs sm:text-sm font-semibold text-[#E05236] hover:underline ml-1.5 cursor-pointer inline"
                                >
                                  Show less
                                </button>
                              )}
                            </span>
                          ) : (
                            <span>
                              {ans.body.slice(0, 105)}
                              <button
                                onClick={(e) => toggleExpandAns(e, ans.id)}
                                className="text-xs sm:text-sm font-semibold text-[#E05236] hover:underline ml-1 cursor-pointer inline"
                              >
                                ... See more
                              </button>
                            </span>
                          )}
                        </div>

                        {/* Answer Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                          <span className="font-bold text-slate-600">{ans.votes} found this helpful</span>
                          <button
                            onClick={() => alert("Thank you for your feedback!")}
                            className="flex items-center gap-1 text-slate-500 hover:text-[#E05236] font-bold cursor-pointer transition"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Submit Answer Form */}
              <form onSubmit={handleAddAnswer} className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                  Your Answer
                </h4>
                <textarea
                  rows={4}
                  value={newAnswerText}
                  onChange={e => setNewAnswerText(e.target.value)}
                  placeholder="Write clear and respectful guidance to help this community member..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#E05236] resize-none placeholder:text-slate-400"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Remember to adhere to community safety rules.</span>
                  <button
                    type="submit"
                    disabled={!newAnswerText.trim()}
                    className="px-5 py-2 rounded-2xl bg-[#E05236] hover:bg-[#8C3015] disabled:opacity-40 text-white font-extrabold text-xs shadow-md transition cursor-pointer active:scale-95"
                  >
                    Post Answer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Ask Question Modal ── */}
      {showAskModal && (
        <AskQuestionModal
          onClose={() => setShowAskModal(false)}
          onSubmit={handleAddQuestion}
        />
      )}
    </AppLayout>
  );
}

// ── Ask a Question Modal ───────────────────────────────────────────────────────
function AskQuestionModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (q: { title: string; body: string; category: string; tags: string[]; anonymous: boolean }) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("Legal & Immigration");
  const [tagsInput, setTagsInput] = useState("");
  const [isAnon, setIsAnon] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(",")
      .map(t => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    onSubmit({
      title: title.trim(),
      body: body.trim(),
      category,
      tags,
      anonymous: isAnon,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF7F4] text-[#E05236] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Ask Community Question</h3>
              <p className="text-[10px] text-slate-500">Get answers from attorneys &amp; peers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Question Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Can I travel abroad while my I-485 is pending?"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#E05236] placeholder:text-slate-400 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#E05236] font-medium"
            >
              {CATEGORIES.filter(c => c !== "All Categories").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Details &amp; Context
            </label>
            <textarea
              rows={4}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Provide background context: your current visa, state/city, and what specific advice you need..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#E05236] resize-none placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Tags (separate by comma)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g. immigration, I-131, advance-parole"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 outline-none focus:border-[#E05236] placeholder:text-slate-400"
            />
          </div>

          {/* Anonymous Toggle */}
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Post Anonymously</span>
              <span className="text-[10px] text-slate-500">Your profile and identity will be completely hidden</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAnon(!isAnon)}
              className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                isAnon ? "bg-[#E05236]" : "bg-slate-300"
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                isAnon ? "left-6" : "left-1"
              }`} />
            </button>
          </div>

          {/* Legal Notice */}
          <div className="bg-[#FFF7F4] border border-[#E05236]/20 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
            <Shield className="w-4 h-4 text-[#E05236] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Community Q&amp;A is for informational support. For critical legal filing, consult a verified attorney.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 py-3 rounded-2xl bg-[#E05236] hover:bg-[#8C3015] disabled:opacity-40 text-white font-extrabold text-xs shadow-md transition cursor-pointer active:scale-95"
            >
              Post Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
