import { useState } from "react";
import { AppLayout } from "../components/layout/AppLayout";
import {
  HelpCircle, ChevronUp, ChevronDown, CheckCircle, MessageCircle,
  Eye, Search, Plus, Tag, User, Sparkles, Shield, Filter
} from "lucide-react";

const questions = [
  {
    id: 1,
    title: "Can I work in the USA on a tourist visa (B-2)?",
    body: "I'm currently on a B-2 tourist visa and have been here for 3 months. A friend offered me a job at their restaurant. Is this legal? What are the risks?",
    category: "Legal / Immigration",
    votes: 234,
    answers: 8,
    views: 2847,
    author: { name: "Anonymous", avatar: "A", color: "from-gray-400 to-gray-500", anonymous: true },
    time: "2 hours ago",
    answered: true,
    bestAnswer: true,
    tags: ["tourist-visa", "work-authorization", "B-2"],
  },
  {
    id: 2,
    title: "How do I open a bank account without a Social Security Number?",
    body: "I just arrived in the US on an F-1 student visa but don't have my SSN yet. I need to receive money from my parents back home. Which banks accept ITIN or passport?",
    category: "Banking",
    votes: 189,
    answers: 12,
    views: 1923,
    author: { name: "Tanvir R.", avatar: "TR", color: "from-blue-400 to-cyan-500", anonymous: false },
    time: "5 hours ago",
    answered: true,
    bestAnswer: true,
    tags: ["banking", "SSN", "ITIN", "F-1"],
  },
  {
    id: 3,
    title: "What documents do I need to get a New York State driver's license as an immigrant?",
    body: "I have an H-1B visa and want to get a NY state driver's license. I've heard the requirements changed. Can someone who went through this recently guide me?",
    category: "Driving License",
    votes: 156,
    answers: 6,
    views: 1456,
    author: { name: "Priya S.", avatar: "PS", color: "from-orange-400 to-rose-500", anonymous: false },
    time: "1 day ago",
    answered: true,
    bestAnswer: false,
    tags: ["driving-license", "NY", "H-1B"],
  },
  {
    id: 4,
    title: "Can asylum seekers enroll their children in public school?",
    body: "We entered the US at the southern border and our asylum case is pending. We have two children (ages 8 and 11). Are they allowed to go to public school while we wait?",
    category: "Education",
    votes: 98,
    answers: 4,
    views: 876,
    author: { name: "Anonymous", avatar: "A", color: "from-gray-400 to-gray-500", anonymous: true },
    time: "2 days ago",
    answered: false,
    bestAnswer: false,
    tags: ["asylum", "education", "children", "public-school"],
  },
  {
    id: 5,
    title: "What is the difference between ITIN and SSN? Can I use ITIN for taxes?",
    body: "I'm a new immigrant and don't have an SSN yet. My employer says I need to file taxes. Someone told me I can use an ITIN. How do I apply and what can I use it for?",
    category: "Taxes",
    votes: 267,
    answers: 15,
    views: 3201,
    author: { name: "Amara K.", avatar: "AK", color: "from-purple-400 to-indigo-500", anonymous: false },
    time: "3 days ago",
    answered: true,
    bestAnswer: true,
    tags: ["taxes", "ITIN", "SSN"],
  },
];

const categories = ["All", "Legal", "Banking", "Housing", "Jobs", "Education", "Health", "Driving", "Taxes", "Culture"];

function QuestionCard({ q, onClick }: { q: typeof questions[0]; onClick: () => void }) {
  const [voted, setVoted] = useState(0);

  return (
    <div className="bg-white rounded-2xl border border-border p-4 hover:shadow-sm transition-all cursor-pointer group" onClick={onClick}>
      <div className="flex gap-3">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setVoted(v => v === 1 ? 0 : 1); }}
            className={`p-1 rounded-lg transition-colors ${voted === 1 ? "text-primary bg-blue-50" : "text-muted-foreground hover:text-primary hover:bg-secondary"}`}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <span className={`text-sm font-bold ${voted !== 0 ? "text-primary" : "text-foreground"}`}>{q.votes + voted}</span>
          <button
            onClick={e => { e.stopPropagation(); setVoted(v => v === -1 ? 0 : -1); }}
            className={`p-1 rounded-lg transition-colors ${voted === -1 ? "text-red-500 bg-red-50" : "text-muted-foreground hover:text-red-500 hover:bg-red-50/50"}`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug flex-1">{q.title}</h3>
            {q.bestAnswer && (
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                <CheckCircle className="w-3 h-3" />Solved
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{q.body}</p>

          <div className="flex flex-wrap gap-1 mb-3">
            <span className="text-xs bg-blue-50 text-primary px-2 py-0.5 rounded-full font-medium">{q.category}</span>
            {q.tags.map(t => (
              <span key={t} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">#{t}</span>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />{q.answers} answers
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />{q.views.toLocaleString()} views
            </div>
            <div className="flex items-center gap-1 ml-auto">
              {q.author.anonymous ? (
                <><User className="w-3 h-3" />Anonymous</>
              ) : (
                <>
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${q.author.color} flex items-center justify-center text-white text-[8px] font-bold`}>
                    {q.author.avatar}
                  </div>
                  {q.author.name}
                </>
              )}
              <span>· {q.time}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AskQuestionModal({ onClose }: { onClose: () => void }) {
  const [isAnon, setIsAnon] = useState(false);
  const [category, setCategory] = useState("Legal / Immigration");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <h2 className="font-bold text-foreground">Ask a Question</h2>
          <button
            onClick={onClose}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Post
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Question title</label>
            <input
              type="text"
              placeholder="What do you need help with? Be specific."
              className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Details (optional)</label>
            <textarea
              rows={4}
              placeholder="Provide more context about your situation. The more details, the better the answers."
              className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
            >
              {["Legal / Immigration", "Banking", "Housing", "Jobs", "Education", "Health", "Driving License", "Taxes", "Culture & Community"].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between p-3.5 bg-secondary rounded-xl">
            <div>
              <div className="text-sm font-medium text-foreground">Post anonymously</div>
              <div className="text-xs text-muted-foreground">Your name won't be shown on this question</div>
            </div>
            <button
              onClick={() => setIsAnon(!isAnon)}
              className={`w-11 h-6 rounded-full transition-all relative ${isAnon ? "bg-primary" : "bg-border"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isAnon ? "left-6" : "left-1"}`} />
            </button>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
            <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Community answers are for informational purposes only. For legal or medical decisions, always consult a licensed professional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QandA() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAsk, setShowAsk] = useState(false);
  const [sortBy, setSortBy] = useState("votes");

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Community Q&A</h1>
            </div>
            <button
              onClick={() => setShowAsk(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition"
            >
              <Plus className="w-3.5 h-3.5" />Ask
            </button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                  activeCategory === cat ? "bg-primary text-white" : "bg-white border border-border text-muted-foreground hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Sort */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{questions.length} questions</div>
            <div className="flex gap-1">
              {["votes", "newest", "unanswered"].map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    sortBy === s ? "bg-primary text-white" : "bg-white border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Expert answer highlight */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-emerald-700">🎓 Verified Expert Answers Available</div>
              <div className="text-xs text-emerald-600">Immigration attorneys and licensed professionals answer questions marked with a green badge</div>
            </div>
          </div>

          {questions.map(q => (
            <QuestionCard key={q.id} q={q} onClick={() => {}} />
          ))}
        </div>
      </div>

      {showAsk && <AskQuestionModal onClose={() => setShowAsk(false)} />}
    </AppLayout>
  );
}
