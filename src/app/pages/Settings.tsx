import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  User, Lock, Globe, MapPin, Bell, Link, Shield, Ban, Database,
  HelpCircle, LogOut, ChevronRight, ChevronLeft, Eye, EyeOff,
  Check, AlertTriangle, Languages, Smartphone, Mail, Phone,
  Trash2, Download, RefreshCw, Plus, X, CheckCircle,
  Monitor, Tablet, Wifi, Key, Camera, Search, MessageSquare,
  FileText, ExternalLink, ChevronDown, ToggleLeft
} from "lucide-react";

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 cursor-pointer ${on ? "bg-[#E05236]" : "bg-border"}`}>
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-all ${on ? "left-6" : "left-1"}`} />
    </button>
  );
}

// ── Back header ───────────────────────────────────────────────────────────────
function BackHeader({ title, onBack, action }: { title: string; onBack: () => void; action?: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-border px-4 py-3 flex items-center gap-3">
      <button onClick={onBack} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition cursor-pointer">
        <ChevronLeft className="w-4 h-4 text-slate-700" />
      </button>
      <h2 className="flex-1 font-bold text-foreground text-base">{title}</h2>
      {action}
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function SectionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-border overflow-hidden ${className}`}>{children}</div>;
}

function Row({ label, desc, right, border = true }: { label: string; desc?: string; right?: ReactNode; border?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3.5 ${border ? "border-b border-border last:border-0" : ""}`}>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {desc && <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>}
      </div>
      {right}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ACCOUNT INFORMATION
// ══════════════════════════════════════════════════════════════════════════════
function AccountInfoSection({ onBack }: { onBack: () => void }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "Rafiq Ahmed", username: "rafiq_ahmed", email: "rafiq.ahmed@email.com", phone: "+1 (718) 555-0192", bio: "New immigrant from Bangladesh 🇧🇩 | Living in Queens, NYC | F-1 Student" });

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  return (
    <AppLayout>
      <BackHeader title="Account Information" onBack={onBack}
        action={<button onClick={handleSave} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${saved ? "bg-emerald-500 text-white" : "bg-[#E05236] hover:bg-[#8C3015] text-white shadow-xs"}`}>{saved ? "✓ Saved" : "Save"}</button>}
      />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
              <User className="w-10 h-10 text-slate-400" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#E05236] hover:bg-[#8C3015] flex items-center justify-center border-2 border-white shadow cursor-pointer">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Tap to change photo</p>
        </div>

        <SectionCard>
          {[
            { key: "name", label: "Full Name", icon: User },
            { key: "username", label: "Username", icon: User, prefix: "@" },
            { key: "email", label: "Email Address", icon: Mail },
            { key: "phone", label: "Phone Number", icon: Phone },
          ].map(({ key, label, icon: Icon, prefix }) => (
            <div key={key} className="border-b border-border last:border-0 px-4 py-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
              <div className="flex items-center gap-2 mt-1">
                <Icon className="w-4 h-4 text-slate-600 flex-shrink-0" />
                {prefix && <span className="text-muted-foreground text-sm">{prefix}</span>}
                <input
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="flex-1 text-sm text-foreground bg-transparent outline-none"
                />
              </div>
            </div>
          ))}
          <div className="px-4 py-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full mt-1 text-sm text-foreground bg-transparent outline-none resize-none"
            />
            <div className="text-right text-xs text-muted-foreground">{form.bio.length}/160</div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="px-4 py-3 border-b border-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Visa Status</div>
            <select className="w-full text-sm text-foreground bg-transparent outline-none">
              {["F-1 Student", "H-1B Work", "Green Card", "Refugee/Asylum", "Tourist/Visitor", "Other"].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="px-4 py-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Country of Origin</div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🇧🇩</span>
              <span className="text-sm text-foreground">Bangladesh</span>
              <ChevronDown className="w-4 h-4 text-slate-500 ml-auto" />
            </div>
          </div>
        </SectionCard>
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PASSWORD & SECURITY
// ══════════════════════════════════════════════════════════════════════════════
function PasswordSection({ onBack }: { onBack: () => void }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saved, setSaved] = useState(false);

  const strong = newPw.length >= 8 && /[A-Z]/.test(newPw) && /[0-9]/.test(newPw);

  return (
    <AppLayout>
      <BackHeader title="Password & Security" onBack={onBack} />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <SectionCard>
          <div className="px-4 pt-4 pb-2 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Change Password</p>
            {[
              { label: "Current password", val: current, set: setCurrent, show: showCurrent, toggle: () => setShowCurrent(s => !s) },
              { label: "New password", val: newPw, set: setNewPw, show: showNew, toggle: () => setShowNew(s => !s) },
              { label: "Confirm new password", val: confirm, set: setConfirm, show: showNew, toggle: () => {} },
            ].map(({ label, val, set, show, toggle }) => (
              <div key={label} className="mb-3">
                <label className="text-xs text-muted-foreground">{label}</label>
                <div className="flex items-center border border-border rounded-xl px-3 py-2.5 mt-1 bg-secondary/30">
                  <input type={show ? "text" : "password"} value={val} onChange={e => set(e.target.value)}
                    className="flex-1 text-sm bg-transparent outline-none" placeholder="••••••••" />
                  <button onClick={toggle} className="text-slate-500 cursor-pointer">
                    {show ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
              </div>
            ))}
            {newPw.length > 0 && (
              <div className="mb-3">
                <div className="flex gap-1 mb-1">
                  {[newPw.length >= 8, /[A-Z]/.test(newPw), /[0-9]/.test(newPw), /[^a-zA-Z0-9]/.test(newPw)].map((ok, i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full ${ok ? "bg-emerald-500" : "bg-border"}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{strong ? "Strong password ✓" : "Include 8+ chars, uppercase & number"}</p>
              </div>
            )}
            <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
              disabled={!strong || confirm !== newPw || !current}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold mb-3 transition-all cursor-pointer ${strong && confirm === newPw && current ? "bg-[#E05236] hover:bg-[#8C3015] text-white shadow-xs" : "bg-secondary text-muted-foreground cursor-not-allowed"}`}>
              {saved ? "✓ Password Updated" : "Update Password"}
            </button>
          </div>

          <Row label="Two-Factor Authentication" desc={twoFA ? "Enabled via SMS" : "Add extra security to your account"} right={<Toggle on={twoFA} onClick={() => setTwoFA(s => !s)} />} />
          <Row label="Login Alerts" desc="Get notified of new sign-ins" right={<Toggle on={loginAlerts} onClick={() => setLoginAlerts(s => !s)} />} border={false} />
        </SectionCard>

        <SectionCard>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary transition border-b border-border cursor-pointer">
            <Key className="w-4 h-4 text-slate-600" />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">Passkey Login</div>
              <div className="text-xs text-muted-foreground">Use Face ID or fingerprint instead</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary transition text-red-600 cursor-pointer">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium">Sign out all other devices</span>
          </button>
        </SectionCard>
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONNECTED DEVICES
// ══════════════════════════════════════════════════════════════════════════════
function DevicesSection({ onBack }: { onBack: () => void }) {
  const [devices, setDevices] = useState([
    { id: 1, name: "iPhone 14 Pro", type: "mobile", location: "Queens, NY", lastActive: "Now · Current", current: true },
    { id: 2, name: "MacBook Air", type: "laptop", location: "Queens, NY", lastActive: "2 hours ago", current: false },
    { id: 3, name: "iPad Air", type: "tablet", location: "Brooklyn, NY", lastActive: "Yesterday at 8:42 PM", current: false },
    { id: 4, name: "Chrome · Windows PC", type: "desktop", location: "Manhattan, NY", lastActive: "3 days ago", current: false },
  ]);

  function remove(id: number) { setDevices(d => d.filter(x => x.id !== id)); }

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === "mobile") return <Smartphone className="w-5 h-5 text-slate-600 flex-shrink-0" />;
    if (type === "tablet") return <Tablet className="w-5 h-5 text-slate-600 flex-shrink-0" />;
    return <Monitor className="w-5 h-5 text-slate-600 flex-shrink-0" />;
  };

  return (
    <AppLayout>
      <BackHeader title="Connected Devices" onBack={onBack} />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <p className="text-sm text-muted-foreground">Devices currently logged in to your account. Remove any you don't recognise.</p>
        <SectionCard>
          {devices.map((d, i) => (
            <div key={d.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < devices.length - 1 ? "border-b border-border" : ""}`}>
              <TypeIcon type={d.type} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{d.name}</span>
                  {d.current && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">This device</span>}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />{d.location} · {d.lastActive}
                </div>
              </div>
              {!d.current && (
                <button onClick={() => remove(d.id)} className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition cursor-pointer">
                  <X className="w-3.5 h-3.5 text-red-500" />
                </button>
              )}
            </div>
          ))}
        </SectionCard>
        {devices.length > 1 && (
          <button onClick={() => setDevices(d => d.filter(x => x.current))}
            className="w-full py-3 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition cursor-pointer">
            Sign out all other devices
          </button>
        )}
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LANGUAGE
// ══════════════════════════════════════════════════════════════════════════════
function LanguageSection({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState("Bengali");
  const langs = [
    { code: "en", name: "English", native: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", native: "Español", flag: "🇲🇽" },
    { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇧🇩" },
    { code: "hi", name: "Hindi", native: "हिंदी", flag: "🇮🇳" },
    { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
    { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
    { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷" },
    { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
    { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  ];
  return (
    <AppLayout>
      <BackHeader title="Language" onBack={onBack} />
      <div className="max-w-lg mx-auto p-4">
        <p className="text-sm text-muted-foreground mb-4">Choose the language for the app interface.</p>
        <SectionCard>
          {langs.map((l, i) => (
            <button key={l.code} onClick={() => setSelected(l.name)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary transition cursor-pointer ${i > 0 ? "border-t border-border" : ""}`}>
              <span className="text-2xl">{l.flag}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{l.name}</div>
                <div className="text-xs text-muted-foreground">{l.native}</div>
              </div>
              {selected === l.name && <div className="w-5 h-5 rounded-full bg-[#E05236] flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
            </button>
          ))}
        </SectionCard>
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT PREFERENCES
// ══════════════════════════════════════════════════════════════════════════════
function ContentSection({ onBack }: { onBack: () => void }) {
  const [prefs, setPrefs] = useState({ legal: true, housing: true, jobs: false, health: true, education: true, events: false, food: false, transport: true });
  const [feedType, setFeedType] = useState("nearby");
  const topics = [
    { key: "legal", label: "Legal & Immigration", emoji: "⚖️" },
    { key: "housing", label: "Housing & Rent", emoji: "🏠" },
    { key: "jobs", label: "Jobs & Work", emoji: "💼" },
    { key: "health", label: "Health & Clinics", emoji: "🏥" },
    { key: "education", label: "Education & Schools", emoji: "📚" },
    { key: "events", label: "Community Events", emoji: "🎉" },
    { key: "food", label: "Food & Restaurants", emoji: "🍽️" },
    { key: "transport", label: "Transit & Transport", emoji: "🚌" },
  ];
  return (
    <AppLayout>
      <BackHeader title="Content Preferences" onBack={onBack} />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Feed Type</p>
          <SectionCard>
            {[{ id: "nearby", label: "Nearby", desc: "Show content from your area" }, { id: "following", label: "Following", desc: "Only people you follow" }, { id: "trending", label: "Trending", desc: "Popular in immigrant communities" }].map((f, i) => (
              <button key={f.id} onClick={() => setFeedType(f.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary transition cursor-pointer ${i > 0 ? "border-t border-border" : ""}`}>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.desc}</div>
                </div>
                {feedType === f.id && <div className="w-5 h-5 rounded-full bg-[#E05236] flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
              </button>
            ))}
          </SectionCard>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Topic Interests</p>
          <div className="flex flex-wrap gap-2">
            {topics.map(t => {
              const on = prefs[t.key as keyof typeof prefs];
              return (
                <button
                  key={t.key}
                  onClick={() => setPrefs(p => ({ ...p, [t.key]: !on }))}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                    on
                      ? "bg-[#FFF7F4] text-[#8C3015] border-[#E05236]/30 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-[#FFF7F4]/60 hover:text-[#8C3015] hover:border-[#E05236]/30"
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                  {on && <X className="w-3.5 h-3.5 ml-0.5 text-[#E05236]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LOCATION SETTINGS
// ══════════════════════════════════════════════════════════════════════════════
function LocationSection({ onBack }: { onBack: () => void }) {
  const [locOn, setLocOn] = useState(true);
  const [precise, setPrecise] = useState(false);
  const [sharePost, setSharePost] = useState(true);
  const [radius, setRadius] = useState("5");

  return (
    <AppLayout>
      <BackHeader title="Location Settings" onBack={onBack} />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="bg-[#FFF7F4] border border-[#E05236]/30 rounded-2xl p-4 flex gap-3">
          <MapPin className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#E05236]">Current Location</p>
            <p className="text-xs text-slate-700 mt-0.5">Queens, New York 11373</p>
          </div>
        </div>

        <SectionCard>
          <Row label="Location Services" desc="Allow app to use your location" right={<Toggle on={locOn} onClick={() => setLocOn(s => !s)} />} />
          <Row label="Precise Location" desc="Exact GPS vs approximate area" right={<Toggle on={precise} onClick={() => setPrecise(s => !s)} />} />
          <Row label="Location in Posts" desc="Attach location when posting" right={<Toggle on={sharePost} onClick={() => setSharePost(s => !s)} />} border={false} />
        </SectionCard>

        <SectionCard>
          <div className="px-4 py-3.5">
            <div className="text-sm font-medium text-foreground mb-1">Nearby search radius</div>
            <div className="text-xs text-muted-foreground mb-3">Show services within this distance</div>
            <div className="flex gap-2">
              {["1", "2", "5", "10", "20"].map(r => (
                <button key={r} onClick={() => setRadius(r)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${radius === r ? "bg-[#E05236] text-white shadow-xs" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {r} km
                </button>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════
function NotificationsSection({ onBack }: { onBack: () => void }) {
  const [notifs, setNotifs] = useState({
    newFollower: true, replies: true, likes: false,
    communityInvites: true, nearbyServices: true,
    eventReminders: true, emergencyAlerts: true, legalUpdates: true,
  });
  const groups = [
    {
      title: "Social", items: [
        { key: "newFollower", label: "New followers", desc: "When someone follows you" },
        { key: "replies", label: "Replies to my posts", desc: "Comments and reactions" },
        { key: "likes", label: "Post likes", desc: "Can be frequent — off by default" },
        { key: "communityInvites", label: "Community invitations", desc: "When invited to join groups" },
      ],
    },
    {
      title: "Services & Local", items: [
        { key: "nearbyServices", label: "Nearby service recommendations", desc: "Places relevant to you" },
        { key: "eventReminders", label: "Event reminders", desc: "Upcoming events you saved" },
      ],
    },
    {
      title: "Important", items: [
        { key: "emergencyAlerts", label: "Emergency alerts", desc: "Critical safety — highly recommended" },
        { key: "legalUpdates", label: "Legal & immigration updates", desc: "Policy changes that affect you" },
      ],
    },
  ];
  return (
    <AppLayout>
      <BackHeader title="Push Notifications" onBack={onBack} />
      <div className="max-w-lg mx-auto p-4 space-y-5">
        {groups.map(g => (
          <div key={g.title}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{g.title}</p>
            <SectionCard>
              {g.items.map((item, i) => (
                <div key={item.key} className={`flex items-center justify-between gap-3 px-4 py-3.5 ${i < g.items.length - 1 ? "border-b border-border" : ""}`}>
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <Toggle on={notifs[item.key as keyof typeof notifs]} onClick={() => setNotifs(s => ({ ...s, [item.key]: !s[item.key as keyof typeof notifs] }))} />
                </div>
              ))}
            </SectionCard>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EMAIL NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════
function EmailNotifsSection({ onBack }: { onBack: () => void }) {
  const [emailPrefs, setEmailPrefs] = useState({ weeklyDigest: true, importantUpdates: true, marketing: false, legalNews: true });
  const [frequency, setFrequency] = useState("weekly");

  return (
    <AppLayout>
      <BackHeader title="Email Notifications" onBack={onBack} />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <SectionCard>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-muted-foreground mb-0.5">Sending to</p>
            <p className="text-sm font-medium text-foreground">rafiq.ahmed@email.com</p>
          </div>
          <Row label="Weekly Community Digest" desc="Best posts and updates from your community" right={<Toggle on={emailPrefs.weeklyDigest} onClick={() => setEmailPrefs(s => ({ ...s, weeklyDigest: !s.weeklyDigest }))} />} />
          <Row label="Important Account Updates" desc="Security, policy, and account changes" right={<Toggle on={emailPrefs.importantUpdates} onClick={() => setEmailPrefs(s => ({ ...s, importantUpdates: !s.importantUpdates }))} />} />
          <Row label="Legal & Immigration News" desc="Policy changes relevant to immigrants" right={<Toggle on={emailPrefs.legalNews} onClick={() => setEmailPrefs(s => ({ ...s, legalNews: !s.legalNews }))} />} />
          <Row label="Promotions & Tips" desc="Feature announcements and tips" right={<Toggle on={emailPrefs.marketing} onClick={() => setEmailPrefs(s => ({ ...s, marketing: !s.marketing }))} />} border={false} />
        </SectionCard>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Digest Frequency</p>
          <SectionCard>
            {[{ id: "daily", l: "Daily" }, { id: "weekly", l: "Weekly" }, { id: "monthly", l: "Monthly" }].map((f, i) => (
              <button key={f.id} onClick={() => setFrequency(f.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-left hover:bg-secondary transition cursor-pointer ${i > 0 ? "border-t border-border" : ""}`}>
                {f.l}
                {frequency === f.id && <div className="w-5 h-5 rounded-full bg-[#E05236] flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
              </button>
            ))}
          </SectionCard>
        </div>
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INTEGRATED SERVICES
// ══════════════════════════════════════════════════════════════════════════════
function ServicesSection({ onBack }: { onBack: () => void }) {
  const [connected, setConnected] = useState<Set<string>>(new Set(["google"]));
  const services = [
    { id: "google", name: "Google", icon: "🔵", desc: "Sign in & calendar sync" },
    { id: "apple", name: "Apple", icon: "🍎", desc: "Sign in with Apple" },
    { id: "facebook", name: "Facebook", icon: "📘", desc: "Import contacts & groups" },
    { id: "whatsapp", name: "WhatsApp", icon: "💬", desc: "Share content to WhatsApp" },
    { id: "maps", name: "Google Maps", icon: "🗺️", desc: "Open directions in Maps" },
  ];
  function toggle(id: string) {
    setConnected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  return (
    <AppLayout>
      <BackHeader title="Integrated Services" onBack={onBack} />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <p className="text-sm text-muted-foreground">Connect third-party services to enhance your experience.</p>
        <SectionCard>
          {services.map((s, i) => {
            const isOn = connected.has(s.id);
            return (
              <div key={s.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < services.length - 1 ? "border-b border-border" : ""}`}>
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
                <button onClick={() => toggle(s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${isOn ? "bg-secondary text-foreground border border-border hover:bg-red-50 hover:text-red-500 hover:border-red-200" : "bg-[#E05236] hover:bg-[#8C3015] text-white shadow-xs"}`}>
                  {isOn ? "Connected" : "Connect"}
                </button>
              </div>
            );
          })}
        </SectionCard>
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTO-TRANSLATION
// ══════════════════════════════════════════════════════════════════════════════
function TranslationSection({ onBack }: { onBack: () => void }) {
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [targetLang, setTargetLang] = useState("Bengali");
  const langs = ["English", "Bengali", "Hindi", "Spanish", "Arabic", "Chinese", "Korean"];

  return (
    <AppLayout>
      <BackHeader title="Language Translation" onBack={onBack} />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <SectionCard>
          <Row label="Auto-Translate Posts" desc="Automatically translate non-English content" right={<Toggle on={autoTranslate} onClick={() => setAutoTranslate(s => !s)} />} />
          <Row label="Show Original Text" desc="Display source text below translation" right={<Toggle on={showOriginal} onClick={() => setShowOriginal(s => !s)} />} border={false} />
        </SectionCard>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Translate To</p>
          <SectionCard>
            {langs.map((l, i) => (
              <button key={l} onClick={() => setTargetLang(l)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left hover:bg-secondary transition cursor-pointer ${i > 0 ? "border-t border-border" : ""}`}>
                {l}
                {targetLang === l && <div className="w-5 h-5 rounded-full bg-[#E05236] flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
              </button>
            ))}
          </SectionCard>
        </div>
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SAFETY
// ══════════════════════════════════════════════════════════════════════════════
function SafetySection({ onBack }: { onBack: () => void }) {
  const [safety, setSafety] = useState({ scamWarnings: true, sensitiveContent: false, safeMessaging: true, locationWarnings: true });
  return (
    <AppLayout>
      <BackHeader title="Safety" onBack={onBack} />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <SectionCard>
          <Row label="Scam & Fraud Warnings" desc="Alert when posts look like scams" right={<Toggle on={safety.scamWarnings} onClick={() => setSafety(s => ({ ...s, scamWarnings: !s.scamWarnings }))} />} />
          <Row label="Sensitive Content Filter" desc="Hide potentially sensitive posts" right={<Toggle on={safety.sensitiveContent} onClick={() => setSafety(s => ({ ...s, sensitiveContent: !s.sensitiveContent }))} />} />
          <Row label="Safe Messaging Mode" desc="Screen messages from unknown users" right={<Toggle on={safety.safeMessaging} onClick={() => setSafety(s => ({ ...s, safeMessaging: !s.safeMessaging }))} />} />
          <Row label="Location Safety Alerts" desc="Warn about ICE activity reports" right={<Toggle on={safety.locationWarnings} onClick={() => setSafety(s => ({ ...s, locationWarnings: !s.locationWarnings }))} />} border={false} />
        </SectionCard>
        <SectionCard>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary transition border-b border-border cursor-pointer">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Report a Safety Issue</div>
              <div className="text-xs text-muted-foreground">Contact our safety team</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary transition cursor-pointer">
            <FileText className="w-4 h-4 text-slate-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Community Guidelines</div>
              <div className="text-xs text-muted-foreground">Our rules and standards</div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </button>
        </SectionCard>
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOCKED USERS
// ══════════════════════════════════════════════════════════════════════════════
function BlockedSection({ onBack }: { onBack: () => void }) {
  const [blocked, setBlocked] = useState([
    { id: 1, name: "Spam Account", handle: "@spam_account_123", avatar: "SA", color: "from-gray-400 to-gray-500" },
    { id: 2, name: "Fake Helper", handle: "@fake_helper_nyc", avatar: "FH", color: "from-red-400 to-rose-500" },
  ]);
  const [query, setQuery] = useState("");

  return (
    <AppLayout>
      <BackHeader title="Blocked Users" onBack={onBack} />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search blocked users…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E05236] transition" />
        </div>
        {blocked.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="font-semibold text-foreground">No blocked users</p>
            <p className="text-sm text-muted-foreground mt-1">Your blocked list is empty</p>
          </div>
        ) : (
          <SectionCard>
            {blocked.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.handle.toLowerCase().includes(query.toLowerCase())).map((u, i) => (
              <div key={u.id} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${u.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>{u.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.handle}</div>
                </div>
                <button onClick={() => setBlocked(b => b.filter(x => x.id !== u.id))}
                  className="px-3 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-secondary transition cursor-pointer">
                  Unblock
                </button>
              </div>
            ))}
          </SectionCard>
        )}
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PRIVACY
// ══════════════════════════════════════════════════════════════════════════════
function PrivacySection({ onBack }: { onBack: () => void }) {
  const [privacy, setPrivacy] = useState({ publicProfile: true, showLocation: true, showLanguages: true, allowMessages: true, showCommunities: true, showFollowers: true });
  const items = [
    { key: "publicProfile", title: "Public profile", desc: "Anyone can view your profile" },
    { key: "showLocation", title: "Show location", desc: "Display your city/state on profile" },
    { key: "showLanguages", title: "Show languages", desc: "Display languages spoken" },
    { key: "allowMessages", title: "Allow direct messages", desc: "Anyone can message you" },
    { key: "showCommunities", title: "Show communities", desc: "Display communities you've joined" },
    { key: "showFollowers", title: "Show follower count", desc: "Others can see your follower count" },
  ];
  return (
    <AppLayout>
      <BackHeader title="Privacy" onBack={onBack} />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <p className="text-sm text-muted-foreground">Control who can see your information and interact with you.</p>
        <SectionCard>
          {items.map((item, i) => (
            <div key={item.key} className={`flex items-center justify-between gap-3 px-4 py-3.5 ${i < items.length - 1 ? "border-b border-border" : ""}`}>
              <div>
                <div className="text-sm font-medium text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
              <Toggle on={privacy[item.key as keyof typeof privacy]} onClick={() => setPrivacy(s => ({ ...s, [item.key]: !s[item.key as keyof typeof privacy] }))} />
            </div>
          ))}
        </SectionCard>
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DATA & PRIVACY
// ══════════════════════════════════════════════════════════════════════════════
function DataSection({ onBack }: { onBack: () => void }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  function handleDownload() {
    setDownloading(true);
    setTimeout(() => { setDownloading(false); setDownloaded(true); }, 2000);
  }

  return (
    <AppLayout>
      <BackHeader title="Data & Privacy" onBack={onBack} />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <SectionCard>
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">Download Your Data</div>
                <div className="text-xs text-muted-foreground mt-0.5 mb-3">Get a copy of all your posts, settings, and account information.</div>
                <button onClick={handleDownload} disabled={downloading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${downloaded ? "bg-emerald-100 text-emerald-700" : "bg-[#E05236] hover:bg-[#8C3015] text-white shadow-xs"}`}>
                  {downloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : downloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5 text-white" />}
                  {downloading ? "Preparing…" : downloaded ? "Download Ready" : "Request Data"}
                </button>
              </div>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary transition border-b border-border cursor-pointer">
            <FileText className="w-4 h-4 text-slate-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">Privacy Policy</div>
              <div className="text-xs text-muted-foreground">Read our full privacy policy</div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary transition cursor-pointer">
            <FileText className="w-4 h-4 text-slate-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">Terms of Service</div>
              <div className="text-xs text-muted-foreground">Our terms and conditions</div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </button>
        </SectionCard>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-700">Delete Account</span>
          </div>
          <p className="text-xs text-red-600 mb-3">This will permanently delete your account, posts, and all data. This cannot be undone.</p>
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)} className="px-4 py-2 rounded-xl border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-100 transition cursor-pointer">
              I want to delete my account
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-red-700 font-medium">Type DELETE to confirm:</p>
              <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder='Type "DELETE"'
                className="w-full px-3 py-2 rounded-xl border border-red-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white" />
              <div className="flex gap-2">
                <button onClick={() => { setShowDelete(false); setDeleteInput(""); }} className="flex-1 py-2 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition cursor-pointer">Cancel</button>
                <button disabled={deleteInput !== "DELETE"} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${deleteInput === "DELETE" ? "bg-red-500 text-white hover:bg-red-600" : "bg-red-200 text-red-400 cursor-not-allowed"}`}>Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HELP CENTER
// ══════════════════════════════════════════════════════════════════════════════
function HelpSection({ onBack }: { onBack: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: "How do I change my visa status?", a: "Go to Account Information and select your current visa status from the dropdown. This helps us show relevant services and updates." },
    { q: "Is my location data shared with anyone?", a: "No. Your location is only used to show nearby services. We never sell your location data to third parties." },
    { q: "How do I report a scam?", a: "Tap the three dots (···) on any post and select 'Report'. Choose 'Scam or Fraud' and provide details. Our team reviews within 24 hours." },
    { q: "Can I use the app without sharing my location?", a: "Yes. Location is optional. You can manually enter your neighborhood in Location Settings to still get local results." },
    { q: "How do I find legal help for free?", a: "Go to Services → Legal Aid, or search 'legal' in Map Discovery. All listed legal providers offer free or low-cost services for immigrants." },
    { q: "How do I delete my account?", a: "Go to Settings → Data & Privacy → Delete Account. Note: this is permanent and cannot be undone." },
  ];
  return (
    <AppLayout>
      <BackHeader title="Help Center" onBack={onBack} />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input placeholder="Search help articles…" className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E05236] transition" />
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Frequently Asked Questions</p>
          <SectionCard>
            {faqs.map((faq, i) => (
              <div key={i} className={i > 0 ? "border-t border-border" : ""}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-secondary transition cursor-pointer">
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3.5 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </SectionCard>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact Us</p>
          <SectionCard>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary transition border-b border-border cursor-pointer">
              <MessageSquare className="w-4 h-4 text-slate-600" />
              <div className="flex-1">
                <div className="text-sm font-medium">Live Chat</div>
                <div className="text-xs text-muted-foreground">Avg response: 5 min</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary transition cursor-pointer">
              <Mail className="w-4 h-4 text-slate-600" />
              <div className="flex-1">
                <div className="text-sm font-medium">Email Support</div>
                <div className="text-xs text-muted-foreground">support@immigrantconnect.us</div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </button>
          </SectionCard>
        </div>
      </div>
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SETTINGS PAGE
// ══════════════════════════════════════════════════════════════════════════════
const settingsSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Account Information", desc: "Name, email, username", path: "account" },
      { icon: Lock, label: "Password & Security", desc: "Change password, 2FA", path: "password" },
      { icon: Smartphone, label: "Connected Devices", desc: "Manage logged-in devices", path: "devices" },
    ],
  },
  {
    title: "Personalization",
    items: [
      { icon: Languages, label: "Language", desc: "English, Español, বাংলা, हिंदी, العربية", path: "language" },
      { icon: Globe, label: "Content Preferences", desc: "Feed, topics, communities", path: "content" },
      { icon: MapPin, label: "Location Settings", desc: "Manage location permissions", path: "location" },
    ],
  },
  {
    title: "Notifications",
    items: [
      { icon: Bell, label: "Push Notifications", desc: "Control what alerts you receive", path: "notifications" },
      { icon: Mail, label: "Email Notifications", desc: "Weekly digest and updates", path: "email-notifs" },
    ],
  },
  {
    title: "Connected Services",
    items: [
      { icon: Link, label: "Integrated Services", desc: "Manage third-party connections", path: "services" },
      { icon: Globe, label: "Language Translation", desc: "Auto-translate settings", path: "translation" },
    ],
  },
  {
    title: "Privacy & Safety",
    items: [
      { icon: Shield, label: "Safety", desc: "Scam warnings, sensitive content", path: "safety" },
      { icon: Ban, label: "Blocked Users", desc: "Manage blocked accounts", path: "blocked" },
      { icon: Eye, label: "Privacy", desc: "Who can see your profile", path: "privacy" },
      { icon: Database, label: "Data & Privacy", desc: "Download your data, delete account", path: "data" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help Center", desc: "FAQs, contact support", path: "help" },
    ],
  },
];

export function Settings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sectionMap: Record<string, ReactNode> = {
    account:      <AccountInfoSection onBack={() => setActiveSection(null)} />,
    password:     <PasswordSection onBack={() => setActiveSection(null)} />,
    devices:      <DevicesSection onBack={() => setActiveSection(null)} />,
    language:     <LanguageSection onBack={() => setActiveSection(null)} />,
    content:      <ContentSection onBack={() => setActiveSection(null)} />,
    location:     <LocationSection onBack={() => setActiveSection(null)} />,
    notifications: <NotificationsSection onBack={() => setActiveSection(null)} />,
    "email-notifs": <EmailNotifsSection onBack={() => setActiveSection(null)} />,
    services:     <ServicesSection onBack={() => setActiveSection(null)} />,
    translation:  <TranslationSection onBack={() => setActiveSection(null)} />,
    safety:       <SafetySection onBack={() => setActiveSection(null)} />,
    blocked:      <BlockedSection onBack={() => setActiveSection(null)} />,
    privacy:      <PrivacySection onBack={() => setActiveSection(null)} />,
    data:         <DataSection onBack={() => setActiveSection(null)} />,
    help:         <HelpSection onBack={() => setActiveSection(null)} />,
  };

  if (activeSection && sectionMap[activeSection]) return <>{sectionMap[activeSection]}</>;

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <div className="p-4 bg-white border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>

        {/* Profile summary */}
        <div className="bg-white border-b border-border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
            <User className="w-6 h-6 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-foreground text-base leading-tight">Rafiq Ahmed</div>
            <div className="text-xs text-muted-foreground mt-0.5">@rafiq_ahmed</div>
          </div>
          <button onClick={() => setActiveSection("account")} className="text-sm text-[#E05236] hover:text-[#8C3015] hover:underline font-bold cursor-pointer">Edit</button>
        </div>

        {settingsSections.map(section => (
          <div key={section.title}>
            <div className="px-4 pt-5 pb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.title}</div>
            <div className="bg-white">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button key={item.path} onClick={() => setActiveSection(item.path)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-secondary transition-colors active:bg-secondary cursor-pointer ${i > 0 ? "border-t border-border" : ""}`}>
                    <Icon className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.desc}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="p-4 pb-8">
          <button onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer active:scale-95">
            <LogOut className="w-4 h-4" /> Log Out
          </button>
          <p className="text-center text-xs text-muted-foreground mt-3">PathaSathi v2.1.0 · Terms · Privacy</p>
        </div>
      </div>
    </AppLayout>
  );
}
