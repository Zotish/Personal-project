import { useNavigate } from "react-router";
import {
  Globe, Users, Map, Shield, MessageCircle, Star,
  ChevronRight, CheckCircle, ArrowRight, Languages,
  Briefcase, Heart, BookOpen, AlertTriangle
} from "lucide-react";

const languages = ["English", "Español", "বাংলা", "हिंदी", "العربية"];

const features = [
  { icon: Users, title: "Connect with Your Community", desc: "Find people from your home country, join communities, share experiences and get real advice from those who've been there.", color: "#2563eb" },
  { icon: Map, title: "Discover Nearby Services", desc: "Find mosques, temples, schools, hospitals, grocery stores, legal aid, and more — all filtered for immigrants.", color: "#10b981" },
  { icon: Briefcase, title: "Jobs & Housing", desc: "Immigrant-friendly job listings and housing resources with guidance through the application process.", color: "#f97316" },
  { icon: Shield, title: "Legal Help & Immigration", desc: "Step-by-step checklists, verified legal advisors, document guides, and community Q&A for your visa journey.", color: "#8b5cf6" },
  { icon: Languages, title: "Multilingual Platform", desc: "Use the platform in your native language. Content and services available in English, Spanish, Bengali, Hindi, and Arabic.", color: "#f59e0b" },
  { icon: Heart, title: "Safe & Trustworthy", desc: "Verified community moderators, scam warnings, and safety features to protect you from fraud and misinformation.", color: "#ef4444" },
];

const stats = [
  { value: "250K+", label: "Immigrants Connected" },
  { value: "50+", label: "Cities Covered" },
  { value: "5", label: "Languages Supported" },
  { value: "10K+", label: "Verified Services" },
];

const testimonials = [
  {
    name: "Fatima Al-Hassan",
    origin: "🇸🇾 Syria → Texas",
    avatar: "FA",
    color: "from-emerald-400 to-teal-500",
    text: "ImmigrantConnect helped me find a halal grocery store and a lawyer for my asylum case in the same week. The community Q&A gave me answers I couldn't find anywhere else.",
  },
  {
    name: "Priya Sharma",
    origin: "🇮🇳 India → California",
    avatar: "PS",
    color: "from-orange-400 to-rose-500",
    text: "As an H-1B holder, the immigration checklist feature saved me from missing important deadlines. The Desi community here is incredibly supportive.",
  },
  {
    name: "Carlos Mendoza",
    origin: "🇲🇽 Mexico → New York",
    avatar: "CM",
    color: "from-blue-400 to-indigo-500",
    text: "The map feature showed me all the Spanish-speaking clinics near my apartment. Huge relief when my daughter got sick and I didn't know where to go.",
  },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}>
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>ImmigrantConnect <span className="text-primary">USA</span></span>
          </div>
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="hidden md:flex items-center gap-1 text-muted-foreground text-sm">
              <Languages className="w-4 h-4" />
              <select className="bg-transparent text-sm border-none outline-none cursor-pointer">
                {languages.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-foreground hover:text-primary px-3 py-1.5 rounded-lg transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-sm font-medium px-4 py-1.5 rounded-xl text-white transition-all hover:opacity-90 shadow-sm"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
            >
              Join Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f0f4ff 50%, #fdf4ff 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <CheckCircle className="w-4 h-4" />
                Your trusted community for life in the USA
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight mb-4" style={{ fontFamily: "var(--font-display)" }}>
                New to the USA?<br />
                <span style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  You're Not Alone.
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Connect with your community, discover immigrant-friendly services, get legal help, find jobs and housing — all in one safe, welcoming platform.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => navigate("/signup")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
                >
                  Get Started — It's Free
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/feed")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-foreground border border-border hover:bg-secondary transition-all"
                >
                  Browse Community
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Available in: {languages.join(" · ")}
              </p>
            </div>
            {/* Hero visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Background circle */}
                <div className="absolute inset-4 rounded-full opacity-10" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }} />
                {/* Floating cards */}
                <div className="absolute top-8 right-0 bg-white rounded-2xl shadow-lg p-4 w-52 border border-border animate-pulse">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">FA</div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">Fatima A.</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-600" />Verified Advisor</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">"Just helped 3 families find halal grocers this week! 🌟"</p>
                </div>
                <div className="absolute bottom-12 left-0 bg-white rounded-2xl shadow-lg p-4 w-48 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Map className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Near You</span>
                  </div>
                  <div className="space-y-1.5">
                    {["Islamic Center · 0.3mi", "Bangladeshi Restaurant · 0.5mi", "Legal Aid · 1.2mi"].map(p => (
                      <div key={p} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl" style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}>
                  <Globe className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>{value}</div>
              <div className="text-blue-200 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: "var(--font-display)" }}>Everything You Need to Thrive in the USA</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">One platform. All the resources, connections, and support you need for your new life.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-border hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}18` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                <div className="mt-4 flex items-center text-sm font-medium gap-1 group-hover:gap-2 transition-all" style={{ color }}>
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>Real Stories from Real Immigrants</h2>
            <p className="text-muted-foreground">Join thousands who found their community here.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-background rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold`}>{t.avatar}</div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.origin}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Start Your Journey Today</h2>
          <p className="text-blue-200 mb-8 text-lg">Free to join. No credit card needed. Your community is waiting.</p>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-4 rounded-xl bg-white font-bold text-primary text-base shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Join ImmigrantConnect USA — Free
          </button>
          <p className="text-blue-200 text-sm mt-4">Available in: English · Español · বাংলা · हिंदी · العربية</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-6 justify-between items-center">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>ImmigrantConnect USA</span>
          </div>
          <div className="text-sm text-slate-400">© 2025 ImmigrantConnect USA. All rights reserved.</div>
          <div className="flex gap-4 text-sm text-slate-400">
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-white cursor-pointer">Terms</span>
            <span className="hover:text-white cursor-pointer">Safety</span>
            <span className="hover:text-white cursor-pointer">Help</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
