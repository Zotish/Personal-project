import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, MapPin, CheckCircle, Check, User, Loader2 } from "lucide-react";
import { GoldenBadge } from "../components/ui/GoldenBadge";

// Progress indicator
function OnboardingProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full flex-1 transition-all duration-300"
          style={{
            background: i <= step
              ? "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)"
              : "#E2E8F0",
            opacity: i <= step ? 1 : 0.6
          }}
        />
      ))}
    </div>
  );
}

// Step wrapper
function StepWrapper({ step, total, title, subtitle, children, onNext, onBack, onSkip, nextLabel = "Continue", nextDisabled = false }: {
  step: number; total: number; title: string; subtitle?: string; children: ReactNode;
  onNext: () => void; onBack?: () => void; onSkip?: () => void; nextLabel?: string; nextDisabled?: boolean;
}) {
  const navigate = useNavigate();

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      navigate("/feed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-2">
          {onBack ? (
            <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-[#D85A30] cursor-pointer transition">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}
          <span className="text-sm font-medium text-muted-foreground">Step {step} of {total}</span>
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
          className="w-full py-3.5 rounded-xl text-white font-semibold text-sm shadow-md hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer active:scale-[0.99]"
          style={{ background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)" }}
        >
          {nextLabel}
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-[#D85A30] font-medium transition cursor-pointer"
        >
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
  const [city, setCity] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      setCity("New York, NY");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const cityPart = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state_district || "Local City";
            const statePart = addr.state || addr.country || "USA";
            setCity(`${cityPart}, ${statePart}`);
          } else {
            setCity("New York, NY");
          }
        } catch {
          if (lat >= 20 && lat <= 27 && lng >= 88 && lng <= 93) {
            setCity("Dhaka, Bangladesh");
          } else if (lat >= 40.5 && lat <= 41.0 && lng >= -74.3 && lng <= -73.7) {
            setCity("New York, NY");
          } else {
            setCity("New York, NY");
          }
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.warn("Geolocation error:", error);
        setIsLocating(false);
        if (!city) {
          setCity("New York, NY");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

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
    <StepWrapper step={1} total={6} title="Where are you from?"
      onNext={() => navigate("/onboarding/status")} onBack={() => navigate("/verify-email")}>
      <div className="space-y-4">
        <div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
            {countries.map(({ flag, name }) => (
              <button
                key={name}
                onClick={() => setSelected(name)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer bg-transparent ${
                  selected === name
                    ? "border-[#D85A30] text-[#D85A30] font-semibold"
                    : "border-slate-300 text-slate-700 hover:border-slate-400"
                }`}
              >
                <span className="text-xl">{flag}</span>
                <span className="text-center leading-tight">{name}</span>
                {selected === name && <Check className="w-3 h-3 text-[#D85A30]" />}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Your Location</label>
          <div className="w-full min-h-[46px] flex items-center px-3.5 py-1.5 bg-transparent rounded-xl border border-slate-300 focus-within:border-[#D85A30] transition-all">
            <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
              {isLocating ? (
                <Loader2 className="w-4 h-4 text-[#D85A30] animate-spin flex-shrink-0" />
              ) : (
                <MapPin className={`w-4 h-4 flex-shrink-0 transition-colors ${city ? "text-[#D85A30]" : "text-muted-foreground"}`} />
              )}
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., New York, NY"
                className="w-full bg-transparent border-0 outline-none p-0 text-sm text-slate-900 placeholder:text-muted-foreground focus:ring-0"
              />
            </div>
            <button
              type="button"
              onClick={detectLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D85A30]/10 text-[#D85A30] hover:bg-[#D85A30]/20 active:scale-95 transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
              title="Auto detect current location"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Detecting...</span>
                </>
              ) : (
                <span>Auto Detect</span>
              )}
            </button>
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
    { id: "Student", label: "Student", desc: "F-1, J-1 or other student visa" },
    { id: "Worker", label: "Worker", desc: "H-1B, L-1, O-1 or work visa" },
    { id: "Permanent Resident", label: "Permanent Resident", desc: "Green card holder" },
    { id: "Asylum Seeker", label: "Asylum Seeker", desc: "Seeking protection in the USA" },
    { id: "Refugee", label: "Refugee", desc: "Admitted as a refugee" },
    { id: "Family Visa", label: "Family Visa", desc: "IR, CR, or family preference" },
    { id: "Tourist", label: "Tourist / Visitor", desc: "B-1/B-2 visa holder" },
    { id: "New Citizen", label: "New Citizen", desc: "Recently naturalized" },
  ];

  return (
    <StepWrapper step={2} total={6} title="What's your immigration status?"
      onNext={() => navigate("/onboarding/language")} onBack={() => navigate("/onboarding/country")}>
      <div className="grid grid-cols-1 gap-2">
        {statuses.map(({ id, label, desc }) => (
          <button
            key={id}
            onClick={() => setSelected(id)}
            className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer bg-transparent ${
              selected === id
                ? "border-[#D85A30]"
                : "border-slate-300 hover:border-slate-400"
            }`}
          >
            <div className="flex-1">
              <div className={`text-sm font-semibold ${selected === id ? "text-[#D85A30]" : "text-foreground"}`}>{label}</div>
              <div className="text-xs text-muted-foreground">{desc}</div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              selected === id ? "border-[#D85A30] bg-[#D85A30]" : "border-slate-300 bg-transparent"
            }`}>
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
    <StepWrapper step={3} total={6} title="What languages do you speak?"
      onNext={() => navigate("/onboarding/topics")} onBack={() => navigate("/onboarding/status")}>
      <div className="grid grid-cols-2 gap-2">
        {languages.map(({ name, native, flag }) => {
          const active = selected.includes(name);
          return (
            <button
              key={name}
              onClick={() => toggle(name)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer bg-transparent ${
                active ? "border-[#D85A30]" : "border-slate-300 hover:border-slate-400"
              }`}
            >
              <span className="text-xl">{flag}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${active ? "text-[#D85A30]" : "text-foreground"}`}>{name}</div>
                <div className="text-xs text-muted-foreground">{native}</div>
              </div>
              {active && <CheckCircle className="w-4 h-4 text-[#D85A30] flex-shrink-0" />}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-sm text-[#D85A30] mt-3 font-semibold">{selected.length} language{selected.length > 1 ? "s" : ""} selected</p>
      )}
    </StepWrapper>
  );
}

// Step 4: Topics of Interest
export function OnboardingTopics() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(["Immigration Help", "Jobs", "Housing", "Bangladeshi Community"]);
  const [showAll, setShowAll] = useState(false);

  const mainTopics = [
    "Immigration Help",
    "Jobs",
    "Housing",
    "Legal Help",
    "Health Care",
    "Bangladeshi Community",
  ];

  const moreTopics = [
    "Education",
    "Driving License",
    "Banking",
    "Taxes",
    "English Learning",
    "Religious Community",
    "Cultural Community",
    "Food & Grocery",
    "Local Events",
    "Student Life",
    "Family Support",
    "Emergency Help",
    "Government Services",
    "Small Business",
    "New York Immigrants",
    "Texas Immigrants",
    "California Immigrants",
    "Indian Community",
    "Latino Community",
    "Muslim Community",
    "Christian Community",
    "Hindu Community",
  ];

  const visibleTopics = showAll ? [...mainTopics, ...moreTopics] : mainTopics;

  const toggle = (label: string) => {
    setSelected(s => s.includes(label) ? s.filter(x => x !== label) : [...s, label]);
  };

  return (
    <StepWrapper step={4} total={6} title="What topics interest you?"
      onNext={() => navigate("/onboarding/people")} onBack={() => navigate("/onboarding/language")}
      nextDisabled={selected.length < 3}>
      <div className="flex flex-wrap gap-2">
        {visibleTopics.map((label) => {
          const active = selected.includes(label);
          return (
            <button
              key={label}
              onClick={() => toggle(label)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer bg-transparent ${
                active
                  ? "border-[#D85A30] text-[#D85A30]"
                  : "border-slate-300 text-slate-700 hover:border-slate-400"
              }`}
            >
              {label}
              {active && <Check className="w-3.5 h-3.5 text-[#D85A30]" />}
            </button>
          );
        })}
        {!showAll ? (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border border-dashed border-[#D85A30]/70 text-[#D85A30] hover:border-[#D85A30] transition-all cursor-pointer bg-transparent"
          >
            + More
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border border-dashed border-slate-300 text-slate-600 hover:border-slate-400 transition-all cursor-pointer bg-transparent"
          >
            - Less
          </button>
        )}
      </div>
      {selected.length > 0 && (
        <p className="text-sm text-[#D85A30] mt-4 font-semibold">{selected.length} topics selected</p>
      )}
    </StepWrapper>
  );
}

// Step 5: Suggested People
export function OnboardingPeople() {
  const navigate = useNavigate();
  const [followed, setFollowed] = useState<string[]>([]);

  const people = [
    { name: "Nadia Islam, Esq.", followers: "14.8K", verified: true },
    { name: "Carlos Rivera", followers: "8.2K", verified: false },
    { name: "Dr. Priya Menon", followers: "15.8K", verified: true },
    { name: "Ahmed Hassan", followers: "6.5K", verified: true },
    { name: "Maria Santos", followers: "9.1K", verified: false },
    { name: "Rahim Chowdhury", followers: "22.3K", verified: true },
  ];

  const toggle = (name: string) => {
    setFollowed(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);
  };

  return (
    <StepWrapper step={5} total={6} title="Who to follow?"
      onNext={() => navigate("/onboarding/communities")} onBack={() => navigate("/onboarding/topics")}
      nextLabel="Continue">
      <div className="space-y-2.5">
        {people.map((p) => {
          const isFollowing = followed.includes(p.name);
          return (
            <div
              key={p.name}
              className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 flex gap-3 items-center hover:border-[#D85A30]/40 transition shadow-2xs"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 truncate">{p.name}</span>
                  {p.verified && (
                    <GoldenBadge size={15} title="Verified Account" />
                  )}
                </div>
                <div className="text-xs text-slate-500">{p.followers} followers</div>
              </div>
              <button
                type="button"
                onClick={() => toggle(p.name)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all cursor-pointer active:scale-95 ${
                  isFollowing
                    ? "bg-[#D85A30] text-white border border-[#D85A30] shadow-xs"
                    : "bg-[#D85A30]/15 text-[#8C3015] border border-[#D85A30]/30 hover:bg-[#D85A30]/25"
                }`}
              >
                {isFollowing ? "Following ✓" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground mt-3 text-center">
        {followed.length > 0 ? (
          <span className="text-[#D85A30] font-semibold">{followed.length} people followed</span>
        ) : (
          "0 people followed"
        )}
      </p>
    </StepWrapper>
  );
}

// Step 6: Suggested Communities
export function OnboardingCommunities() {
  const navigate = useNavigate();
  const [joined, setJoined] = useState<string[]>(["Bangladeshi New Yorkers"]);

  const communities = [
    { name: "Bangladeshi New Yorkers", members: "14.2K", category: "Community" },
    { name: "International Students USA", members: "89.4K", category: "Education" },
    { name: "New Immigrants in Texas", members: "32.1K", category: "Settlement" },
    { name: "USA Job Help for Immigrants", members: "56.7K", category: "Jobs" },
    { name: "Immigration Legal Q&A", members: "28.3K", category: "Legal" },
    { name: "Muslim Community USA", members: "41.5K", category: "Religious" },
    { name: "Local Food & Grocery Help", members: "19.8K", category: "Food" },
  ];

  const toggle = (name: string) => {
    setJoined(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);
  };

  return (
    <StepWrapper step={6} total={6} title="Join communities"
      onNext={() => navigate("/feed")} onBack={() => navigate("/onboarding/people")}
      nextLabel="Finish Setup 🎉">
      <div className="space-y-2.5">
        {communities.map((c) => {
          const isJoined = joined.includes(c.name);
          return (
            <div
              key={c.name}
              className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 flex gap-3 items-center justify-between hover:border-[#D85A30]/40 transition shadow-2xs"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">{c.name}</div>
                <div className="text-xs text-slate-500">{c.members} members · {c.category}</div>
              </div>
              <button
                type="button"
                onClick={() => toggle(c.name)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all cursor-pointer active:scale-95 ${
                  isJoined
                    ? "bg-[#D85A30] text-white border border-[#D85A30] shadow-xs"
                    : "bg-[#D85A30]/15 text-[#8C3015] border border-[#D85A30]/30 hover:bg-[#D85A30]/25"
                }`}
              >
                {isJoined ? "Joined ✓" : "Join"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground mt-3 text-center">
        {joined.length > 0 ? (
          <span className="text-[#D85A30] font-semibold">{joined.length} communities joined</span>
        ) : (
          "0 communities joined"
        )}
      </p>
    </StepWrapper>
  );
}
