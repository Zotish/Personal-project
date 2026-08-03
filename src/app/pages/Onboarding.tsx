import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, ChevronLeft, Globe, MapPin, CheckCircle, Languages, Users, Heart, Check } from "lucide-react";

// Progress indicator
function OnboardingProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full flex-1 transition-all duration-300"
          style={{ background: i < step ? "var(--primary)" : i === step ? "var(--ring)" : "var(--border)" }}
        />
      ))}
    </div>
  );
}

// Step wrapper
function StepWrapper({ step, total, title, subtitle, children, onNext, onBack, nextLabel = "Continue", nextDisabled = false }: {
  step: number; total: number; title: string; subtitle?: string; children: ReactNode;
  onNext: () => void; onBack?: () => void; nextLabel?: string; nextDisabled?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-2">
          {onBack ? (
            <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}
          <span className="text-sm text-muted-foreground">Step {step} of {total}</span>
        </div>
        <OnboardingProgress step={step - 1} total={total} />
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>
        <div className="mb-8">{children}</div>
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="w-full py-3.5 rounded-xl text-white font-semibold text-sm shadow-sm hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
        >
          {nextLabel} <ChevronRight className="w-4 h-4" />
        </button>
        <button className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition">
          Skip for now
        </button>
      </div>
    </div>
  );
}

// Step 1: Country of origin
export function OnboardingCountry() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("Bangladesh");
  const [city, setCity] = useState("New York, NY");

  const countries = [
    { flag: "🇧🇩", name: "Bangladesh" }, { flag: "🇮🇳", name: "India" }, { flag: "🇲🇽", name: "Mexico" },
    { flag: "🇵🇭", name: "Philippines" }, { flag: "🇨🇳", name: "China" }, { flag: "🇳🇬", name: "Nigeria" },
    { flag: "🇸🇾", name: "Syria" }, { flag: "🇻🇳", name: "Vietnam" }, { flag: "🇰🇷", name: "South Korea" },
    { flag: "🇪🇹", name: "Ethiopia" }, { flag: "🇯🇲", name: "Jamaica" }, { flag: "🇬🇭", name: "Ghana" },
    { flag: "🇵🇰", name: "Pakistan" }, { flag: "🇷🇺", name: "Russia" }, { flag: "🇧🇷", name: "Brazil" },
    { flag: "🇪🇬", name: "Egypt" }, { flag: "🇺🇦", name: "Ukraine" }, { flag: "🇻🇪", name: "Venezuela" },
    { flag: "🇸🇴", name: "Somalia" }, { flag: "🇸🇳", name: "Senegal" },
  ];

  return (
    <StepWrapper step={1} total={6} title="Where are you from?" subtitle="This helps us connect you with your home community."
      onNext={() => navigate("/onboarding/status")} onBack={() => navigate("/verify-email")}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Country of origin</label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
            {countries.map(({ flag, name }) => (
              <button
                key={name}
                onClick={() => setSelected(name)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all ${
                  selected === name ? "border-primary bg-blue-50 text-primary" : "border-border bg-white text-muted-foreground hover:border-primary/40"
                }`}
              >
                <span className="text-xl">{flag}</span>
                <span className="text-center leading-tight">{name}</span>
                {selected === name && <Check className="w-3 h-3 text-primary" />}
              </button>
            ))}
          </div>
          {selected && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Selected: {selected}</span>
            </div>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Your current US city/state</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g., New York, NY"
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
            />
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}

// Step 2: Immigration Status
export function OnboardingStatus() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("Student");

  const statuses = [
    { id: "Student", icon: "🎓", label: "Student", desc: "F-1, J-1 or other student visa" },
    { id: "Worker", icon: "💼", label: "Worker", desc: "H-1B, L-1, O-1 or work visa" },
    { id: "Permanent Resident", icon: "🏡", label: "Permanent Resident", desc: "Green card holder" },
    { id: "Asylum Seeker", icon: "🕊️", label: "Asylum Seeker", desc: "Seeking protection in the USA" },
    { id: "Refugee", icon: "⛺", label: "Refugee", desc: "Admitted as a refugee" },
    { id: "Family Visa", icon: "👨‍👩‍👧", label: "Family Visa", desc: "IR, CR, or family preference" },
    { id: "Tourist", icon: "✈️", label: "Tourist / Visitor", desc: "B-1/B-2 visa holder" },
    { id: "New Citizen", icon: "🇺🇸", label: "New Citizen", desc: "Recently naturalized" },
    { id: "Other", icon: "❓", label: "Other / Unsure", desc: "I'll share more later" },
  ];

  return (
    <StepWrapper step={2} total={6} title="What's your immigration status?" subtitle="We'll personalize guidance and resources for your specific situation."
      onNext={() => navigate("/onboarding/language")} onBack={() => navigate("/onboarding/country")}>
      <div className="grid grid-cols-1 gap-2">
        {statuses.map(({ id, icon, label, desc }) => (
          <button
            key={id}
            onClick={() => setSelected(id)}
            className={`flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all ${
              selected === id ? "border-primary bg-blue-50" : "border-border bg-white hover:border-primary/40"
            }`}
          >
            <span className="text-2xl">{icon}</span>
            <div className="flex-1">
              <div className={`text-sm font-semibold ${selected === id ? "text-primary" : "text-foreground"}`}>{label}</div>
              <div className="text-xs text-muted-foreground">{desc}</div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected === id ? "border-primary bg-primary" : "border-border"}`}>
              {selected === id && <Check className="w-3 h-3 text-white" />}
            </div>
          </button>
        ))}
      </div>
    </StepWrapper>
  );
}

// Step 3: Language Selection
export function OnboardingLanguage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(["Bengali", "English"]);

  const languages = [
    { code: "en", name: "English", native: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", native: "Español", flag: "🇲🇽" },
    { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇧🇩" },
    { code: "hi", name: "Hindi", native: "हिंदी", flag: "🇮🇳" },
    { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
    { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
    { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
    { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷" },
    { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
    { code: "tl", name: "Tagalog", native: "Tagalog", flag: "🇵🇭" },
    { code: "vi", name: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
    { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  ];

  const toggle = (name: string) => {
    setSelected(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);
  };

  return (
    <StepWrapper step={3} total={6} title="What languages do you speak?" subtitle="Choose all that apply. Your feed will include content in these languages."
      onNext={() => navigate("/onboarding/topics")} onBack={() => navigate("/onboarding/status")}>
      <div className="grid grid-cols-2 gap-2">
        {languages.map(({ name, native, flag }) => {
          const active = selected.includes(name);
          return (
            <button
              key={name}
              onClick={() => toggle(name)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                active ? "border-primary bg-blue-50" : "border-border bg-white hover:border-primary/40"
              }`}
            >
              <span className="text-xl">{flag}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>{name}</div>
                <div className="text-xs text-muted-foreground">{native}</div>
              </div>
              {active && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-sm text-primary mt-3 font-medium">{selected.length} language{selected.length > 1 ? "s" : ""} selected</p>
      )}
    </StepWrapper>
  );
}

// Step 4: Topics of Interest
export function OnboardingTopics() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(["Immigration Help", "Jobs", "Housing", "Bangladeshi Community"]);

  const topics = [
    { label: "Immigration Help", icon: "📋" }, { label: "Jobs", icon: "💼" },
    { label: "Housing", icon: "🏠" }, { label: "Education", icon: "📚" },
    { label: "Health Care", icon: "🏥" }, { label: "Legal Help", icon: "⚖️" },
    { label: "Driving License", icon: "🚗" }, { label: "Banking", icon: "🏦" },
    { label: "Taxes", icon: "📊" }, { label: "English Learning", icon: "📖" },
    { label: "Religious Community", icon: "🕌" }, { label: "Cultural Community", icon: "🎭" },
    { label: "Food & Grocery", icon: "🛒" }, { label: "Local Events", icon: "📅" },
    { label: "Student Life", icon: "🎓" }, { label: "Family Support", icon: "👨‍👩‍👧" },
    { label: "Emergency Help", icon: "🆘" }, { label: "Government Services", icon: "🏛️" },
    { label: "Small Business", icon: "🏪" }, { label: "New York Immigrants", icon: "🗽" },
    { label: "Texas Immigrants", icon: "⭐" }, { label: "California Immigrants", icon: "🌴" },
    { label: "Bangladeshi Community", icon: "🇧🇩" }, { label: "Indian Community", icon: "🇮🇳" },
    { label: "Latino Community", icon: "🌮" }, { label: "Muslim Community", icon: "☪️" },
    { label: "Christian Community", icon: "✝️" }, { label: "Hindu Community", icon: "🕉️" },
  ];

  const toggle = (label: string) => {
    setSelected(s => s.includes(label) ? s.filter(x => x !== label) : [...s, label]);
  };

  return (
    <StepWrapper step={4} total={6} title="What topics interest you?" subtitle="Pick at least 3 topics to personalize your feed and recommendations."
      onNext={() => navigate("/onboarding/people")} onBack={() => navigate("/onboarding/language")}
      nextDisabled={selected.length < 3}>
      <div className="flex flex-wrap gap-2">
        {topics.map(({ label, icon }) => {
          const active = selected.includes(label);
          return (
            <button
              key={label}
              onClick={() => toggle(label)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
                active
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-border bg-white text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <span>{icon}</span>
              {label}
              {active && <Check className="w-3 h-3" />}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-sm text-primary mt-4 font-medium">{selected.length} topics selected</p>
      )}
    </StepWrapper>
  );
}

// Step 5: Suggested People
export function OnboardingPeople() {
  const navigate = useNavigate();
  const [followed, setFollowed] = useState<string[]>([]);

  const people = [
    { name: "Nadia Islam", handle: "@nadia_nyc", avatar: "NI", color: "from-emerald-400 to-teal-500", bio: "Immigration attorney. Helping Bangladeshi families navigate the US system. Free Q&A every Friday.", location: "New York, NY", topics: ["Legal Help", "Immigration"], verified: true, followers: "12.4K" },
    { name: "Carlos Rivera", handle: "@carlos_helps", avatar: "CR", color: "from-orange-400 to-rose-400", bio: "I moved from Mexico 5 years ago. Now I help new arrivals find jobs and housing in Texas. DMs open!", location: "Houston, TX", topics: ["Jobs", "Housing"], verified: false, followers: "8.2K" },
    { name: "Dr. Priya Menon", handle: "@dr_priya_health", avatar: "PM", color: "from-purple-400 to-indigo-500", bio: "Healthcare navigator for South Asian immigrants. Helping you understand insurance and find the right doctor.", location: "California", topics: ["Health Care", "Education"], verified: true, followers: "15.8K" },
    { name: "Ahmed Hassan", handle: "@ahmed_taxes", avatar: "AH", color: "from-blue-400 to-cyan-400", bio: "CPA specializing in immigrant tax returns. ITIN applications, FBAR, and more. Free consult for new followers.", location: "Chicago, IL", topics: ["Taxes", "Banking"], verified: true, followers: "6.5K" },
    { name: "Maria Santos", handle: "@maria_studentlife", avatar: "MS", color: "from-pink-400 to-rose-500", bio: "International student coordinator at NYU. Tips on OPT, CPT, and student life for new internationals.", location: "New York, NY", topics: ["Student Life", "Education"], verified: false, followers: "9.1K" },
    { name: "Rahim Chowdhury", handle: "@rahim_bdconnect", avatar: "RC", color: "from-green-400 to-emerald-500", bio: "Connecting Bangladeshis in the USA. Community leader, restaurant owner in Queens. Join our WhatsApp group!", location: "Queens, NY", topics: ["Bangladeshi Community", "Food & Grocery"], verified: false, followers: "22.3K" },
  ];

  const toggle = (name: string) => {
    setFollowed(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);
  };

  return (
    <StepWrapper step={5} total={6} title="Who to follow?" subtitle="Based on your topics and community — follow people who can help you."
      onNext={() => navigate("/onboarding/communities")} onBack={() => navigate("/onboarding/topics")}
      nextLabel="Continue">
      <div className="space-y-3">
        {people.map((p) => {
          const isFollowing = followed.includes(p.name);
          return (
            <div key={p.name} className="bg-white rounded-2xl border border-border p-4 flex gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {p.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">{p.name}</span>
                      {p.verified && (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.handle} · {p.followers} followers</div>
                  </div>
                  <button
                    onClick={() => toggle(p.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
                      isFollowing
                        ? "bg-secondary text-primary border border-primary"
                        : "bg-primary text-white hover:opacity-90"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{p.bio}</p>
                <div className="flex items-center gap-1 mt-2">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{p.location}</span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {p.topics.map(t => (
                    <span key={t} className="text-xs bg-secondary text-primary px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground mt-3 text-center">{followed.length} people followed</p>
    </StepWrapper>
  );
}

// Step 6: Suggested Communities
export function OnboardingCommunities() {
  const navigate = useNavigate();
  const [joined, setJoined] = useState<string[]>(["Bangladeshi New Yorkers"]);

  const communities = [
    { name: "Bangladeshi New Yorkers", image: "🇧🇩", members: "14.2K", tags: ["Community", "Culture"], desc: "The largest Bangladeshi community network in New York. Events, help, and connections." },
    { name: "International Students USA", image: "🎓", members: "89.4K", tags: ["Student Life", "Education"], desc: "Support network for international students across all US universities." },
    { name: "New Immigrants in Texas", image: "⭐", members: "32.1K", tags: ["Texas", "Settlement"], desc: "Resources, meetups, and mutual support for immigrants settling in Texas." },
    { name: "USA Job Help for Immigrants", image: "💼", members: "56.7K", tags: ["Jobs", "Career"], desc: "Job postings, resume help, interview tips, and networking for immigrants." },
    { name: "Immigration Legal Q&A", image: "⚖️", members: "28.3K", tags: ["Legal Help", "Immigration"], desc: "Ask immigration attorneys and experienced community members your legal questions." },
    { name: "Muslim Community USA", image: "☪️", members: "41.5K", tags: ["Religious", "Muslim"], desc: "Islamic centers, halal food, prayer times, and community events across the US." },
    { name: "Local Food & Grocery Help", image: "🛒", members: "19.8K", tags: ["Food", "Local"], desc: "Find ethnic grocery stores, restaurants, and food-related recommendations near you." },
  ];

  const toggle = (name: string) => {
    setJoined(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);
  };

  return (
    <StepWrapper step={6} total={6} title="Join communities" subtitle="Find your people. Join communities based on your background and interests."
      onNext={() => navigate("/feed")} onBack={() => navigate("/onboarding/people")}
      nextLabel="Finish Setup 🎉">
      <div className="space-y-3">
        {communities.map((c) => {
          const isJoined = joined.includes(c.name);
          return (
            <div key={c.name} className="bg-white rounded-2xl border border-border p-4 flex gap-3 items-start">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">
                {c.image}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.members} members</div>
                  </div>
                  <button
                    onClick={() => toggle(c.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
                      isJoined
                        ? "bg-secondary text-primary border border-primary"
                        : "bg-primary text-white hover:opacity-90"
                    }`}
                  >
                    {isJoined ? "Joined ✓" : "Join"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{c.desc}</p>
                <div className="flex gap-1 mt-2">
                  {c.tags.map(t => (
                    <span key={t} className="text-xs bg-secondary text-primary px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground mt-3 text-center">{joined.length} communities joined</p>
    </StepWrapper>
  );
}
