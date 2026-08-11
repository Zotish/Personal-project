import { useState } from "react";
import { useNavigate } from "react-router";
import { Globe, Eye, EyeOff, Mail, Lock, User, ChevronLeft, CheckCircle, Smartphone, ChevronDown, Store, ShieldCheck, Briefcase } from "lucide-react";

// Brand icons
const GoogleIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export function Login() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [countryCode, setCountryCode] = useState("+1");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [role, setRole] = useState<"user" | "seller">("user");
  
  // OTP state
  const [otp, setOtp] = useState(["4", "2", "7", "1", "8", "9"]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSendOtp = () => {
    setErrorMsg("");
    setStep("otp");
  };

  const handleVerifyOtp = () => {
    const fullCode = otp.join("").trim();
    if (fullCode.length === 6 && fullCode === "427189") {
      if (role === "seller") {
        navigate("/seller-dashboard");
      } else {
        navigate("/feed");
      }
    } else {
      setErrorMsg("Invalid OTP verification code. Please enter valid code (e.g. 427189) to proceed.");
    }
  };

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <button
            onClick={() => { setStep("form"); setErrorMsg(""); }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Login
          </button>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            {role === "seller" ? "Seller OTP Verification" : "OTP Verification"}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Enter the 6-digit code sent to your {method === "email" ? "email" : "phone number"}
          </p>

          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-8">
            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 text-left flex items-start gap-2 animate-in fade-in">
                <span className="flex-shrink-0">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex gap-2 justify-center mb-6">
              {otp.map((v, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={v}
                  className="w-11 h-12 text-center text-lg font-bold border-2 rounded-xl focus:outline-none focus:border-primary transition bg-input-background"
                  style={{ borderColor: v ? "var(--primary)" : "var(--border)" }}
                  onChange={(e) => {
                    const next = [...otp];
                    next[i] = e.target.value;
                    setOtp(next);
                    if (errorMsg) setErrorMsg("");
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-sm hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
            >
              Verify OTP & Log In
            </button>

            <div className="mt-4 text-xs text-muted-foreground">
              Didn't receive code?{" "}
              <button
                onClick={() => { setOtp(["4", "2", "7", "1", "8", "9"]); setErrorMsg(""); }}
                className="text-primary font-semibold hover:underline"
              >
                Resend OTP
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-foreground">
            {role === "seller" ? "Seller Login" : "Login"}
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-5 sm:p-6">
          <div className="space-y-4">
            
            {/* 0. Account Type Side-by-Side Segmented Selector */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/80 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${role === "user"
                      ? "bg-white text-primary shadow-xs border border-border/40"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Member</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("seller")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${role === "seller"
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Seller</span>
                </button>
              </div>
            </div>
            {/* Unified Contact Field with Dropdown Method Box */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Login method
              </label>
              <div className="flex gap-2">
                {/* Method Selector Dropdown */}
                <div className="relative flex-shrink-0">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as "email" | "phone")}
                    className="h-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition appearance-none cursor-pointer pr-8 font-medium shadow-xs"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>

                {/* Dynamic Input Field */}
                <div className="relative flex-1">
                  {method === "email" ? (
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        defaultValue="rafiq.ahmed@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition shadow-xs"
                      />
                    </div>
                  ) : (
                    /* Single Combined Box for Country Code Selector + Phone Number Input */
                    <div className="flex items-center bg-input-background rounded-xl border border-border focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition shadow-xs overflow-hidden">
                      <div className="relative border-r border-border bg-secondary/30 flex-shrink-0">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="h-full py-2.5 pl-2.5 pr-7 bg-transparent text-sm text-foreground font-semibold focus:outline-none cursor-pointer appearance-none"
                        >
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+880">🇧🇩 +880</option>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+52">🇲🇽 +52</option>
                          <option value="+92">🇵🇰 +92</option>
                          <option value="+44">🇬🇧 +44</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      </div>
                      <input
                        type="tel"
                        placeholder="555 019 2834"
                        className="w-full px-3 py-2.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-input-background rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" defaultChecked />
                <span className="text-xs text-muted-foreground font-medium">Remember me</span>
              </label>
              <button className="text-xs text-primary font-semibold hover:underline">Forgot password?</button>
            </div>

            <button
              onClick={handleSendOtp}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-sm hover:opacity-90 transition mt-2"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
            >
              Log In
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">or log in with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Social Login Options at Bottom */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSendOtp}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground hover:bg-secondary transition shadow-xs"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                onClick={handleSendOtp}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground hover:bg-secondary transition shadow-xs"
              >
                <FacebookIcon />
                Facebook
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          New to ImmigrantConnect?{" "}
          <button onClick={() => navigate("/signup")} className="text-primary font-semibold hover:underline">
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}

export function SignUp() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [countryCode, setCountryCode] = useState("+1");

  // Role & Seller Onboarding State
  const [role, setRole] = useState<"user" | "seller">("user");
  const [sellerType, setSellerType] = useState<"individual" | "business">("individual");
  const [businessCategory, setBusinessCategory] = useState("furniture");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-foreground">
            {role === "seller" ? "Create Seller Account" : "Create your account"}
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-5 sm:p-6">
          {/* Form Input Fields */}
          <div className="space-y-4">

            {/* 0. Account Type Side-by-Side Segmented Selector */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/80 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${role === "user"
                      ? "bg-white text-primary shadow-xs border border-border/40"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Member</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("seller")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${role === "seller"
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Seller</span>
                </button>
              </div>
            </div>

            {/* BUSINESS / MERCHANT SPECIFIC ONBOARDING UI */}
            {role === "seller" && (
              <div className="space-y-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <Store className="w-3.5 h-3.5" /> Merchant / Shop Profile Mode
                  </span>
                  <span className="text-[10px] bg-blue-100 text-primary font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Anti-Scam Protected
                  </span>
                </div>

                {/* Business Name Field for Shop Owners */}
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Business / Shop Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Queens Used Furniture & Resale"
                    className="w-full px-3 py-2 bg-white rounded-lg border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition shadow-xs"
                  />
                </div>

                {/* Business Category Selection */}
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Business Category</label>
                  <div className="relative">
                    <select
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-border text-xs font-medium text-foreground focus:outline-none cursor-pointer appearance-none pr-7 shadow-xs"
                    >
                      <option value="furniture">🪑 Used Furniture & Resale</option>
                      <option value="grocery">🛒 Grocery & Supermarket</option>
                      <option value="legal">⚖️ Legal & Immigration Services</option>
                      <option value="electronics">🔌 Electronics & Appliances</option>
                      <option value="general">📦 General Thrift & Goods</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* ITIN / EIN Optional Tax Field for Business Verification */}
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">ITIN or EIN Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 9XX-XX-XXXX (For Verified Shop Badge)"
                    className="w-full px-3 py-2 bg-white rounded-lg border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition shadow-xs"
                  />
                </div>
              </div>
            )}

            {/* 1. First Name & Last Name (or Owner Name for Business) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  {role === "seller" && sellerType === "business" ? "Owner first name" : "First name"}
                </label>
                <input
                  type="text"
                  placeholder="Rafiq"
                  className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  {role === "seller" && sellerType === "business" ? "Owner last name" : "Last name"}
                </label>
                <input
                  type="text"
                  placeholder="Ahmed"
                  className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
                />
              </div>
            </div>

            {/* 2. Unified Contact Field with Prefix Dropdown Method Box */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Sign up method
              </label>
              <div className="flex gap-2">
                {/* Method Dropdown Box (Email vs Phone) */}
                <div className="relative flex-shrink-0">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as "email" | "phone")}
                    className="h-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition appearance-none cursor-pointer pr-8 font-medium shadow-xs"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>

                {/* Dynamic Input Field */}
                <div className="relative flex-1">
                  {method === "email" ? (
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition shadow-xs"
                      />
                    </div>
                  ) : (
                    /* Single Combined Box for Country Code Selector + Phone Number Input */
                    <div className="flex items-center bg-input-background rounded-xl border border-border focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition shadow-xs overflow-hidden">
                      <div className="relative border-r border-border bg-secondary/30 flex-shrink-0">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="h-full py-2.5 pl-2.5 pr-7 bg-transparent text-sm text-foreground font-semibold focus:outline-none cursor-pointer appearance-none"
                        >
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+880">🇧🇩 +880</option>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+52">🇲🇽 +52</option>
                          <option value="+92">🇵🇰 +92</option>
                          <option value="+44">🇬🇧 +44</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      </div>
                      <input
                        type="tel"
                        placeholder="555 019 2834"
                        className="w-full px-3 py-2.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Password */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-input-background rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms notice with Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer bg-blue-50/80 p-3 rounded-xl border border-blue-100/80 hover:bg-blue-50 transition">
              <input
                type="checkbox"
                defaultChecked
                className="mt-0.5 w-4 h-4 rounded border-primary/40 text-primary focus:ring-primary cursor-pointer flex-shrink-0"
              />
              <p className="text-xs text-primary leading-relaxed">
                {role === "seller"
                  ? "By creating a seller account, you agree to our Seller Code of Conduct, Escrow Policy, and Anti-Scam Protection terms."
                  : "By creating an account, you agree to our Terms of Service and Privacy Policy. Your data is safe and never sold."}
              </p>
            </label>

            {/* Submit Button */}
            <button
              onClick={() => navigate(role === "seller" ? "/seller-dashboard" : method === "email" ? "/verify-email" : "/onboarding/country")}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-sm hover:opacity-90 transition mt-2 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
            >
              {role === "seller" ? <Store className="w-4 h-4" /> : null}
              <span>{role === "seller" ? "Create Seller Account" : "Create Account"}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {role === "seller" ? "or sign up seller with" : "or sign up with"}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Social Sign Up Options (Google & Facebook) at Bottom */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate(method === "email" ? "/verify-email" : "/onboarding/country")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground hover:bg-secondary transition shadow-xs"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>

              <button
                onClick={() => navigate(method === "email" ? "/verify-email" : "/onboarding/country")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border bg-white text-sm font-medium text-foreground hover:bg-secondary transition shadow-xs"
              >
                <FacebookIcon />
                <span>Facebook</span>
              </button>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-primary font-semibold hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

export function EmailVerification() {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <button onClick={() => navigate("/signup")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>Check your email</h1>
        <p className="text-muted-foreground mb-2 text-sm">We sent a 6-digit verification code to</p>
        <p className="font-semibold text-semibold text-foreground mb-8">rafiq.ahmed@gmail.com</p>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          <p className="text-sm text-muted-foreground mb-5">Enter the 6-digit code</p>
          <div className="flex gap-2 justify-center mb-6">
            {code.map((v, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={i === 0 ? "4" : i === 1 ? "2" : i === 2 ? "7" : v}
                className="w-11 h-12 text-center text-lg font-bold border-2 rounded-xl focus:outline-none focus:border-primary transition bg-input-background"
                style={{ borderColor: i < 3 ? "var(--primary)" : "var(--border)" }}
                onChange={(e) => {
                  const next = [...code];
                  next[i] = e.target.value;
                  setCode(next);
                }}
              />
            ))}
          </div>
          <button
            onClick={() => navigate("/onboarding/country")}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-sm hover:opacity-90 transition"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
          >
            Verify Email
          </button>
          <div className="mt-4 text-sm text-muted-foreground">
            Didn't receive it?{" "}
            <button className="text-primary font-medium hover:underline">Resend code</button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Code expires in 10:00 minutes</p>
        </div>
      </div>
    </div>
  );
}
