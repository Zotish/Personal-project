import { useState } from "react";
import { useNavigate } from "react-router";
import { Globe, Eye, EyeOff, Mail, Lock, User, ChevronLeft, CheckCircle, Smartphone } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate("/")} className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}>
              <Globe className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>ImmigrantConnect USA</span>
          </button>
          <h1 className="text-2xl font-bold text-foreground mt-6 mb-1">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Log in to your community</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  defaultValue="rafiq.ahmed@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
                />
              </div>
            </div>
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
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <button className="text-sm text-primary font-medium hover:underline">Forgot password?</button>
            </div>
            <button
              onClick={() => navigate("/onboarding/country")}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-sm hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
            >
              Log In
            </button>

            <div className="relative flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-white text-sm font-medium hover:bg-secondary transition">
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                Google
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-white text-sm font-medium hover:bg-secondary transition">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                Phone
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={() => navigate("/")} className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}>
              <Globe className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>ImmigrantConnect USA</span>
          </button>
          <h1 className="text-2xl font-bold text-foreground mt-6 mb-1">Create your account</h1>
          <p className="text-muted-foreground text-sm">Join 250,000+ immigrants in the USA</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">First name</label>
                <input type="text" placeholder="Rafiq" className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Last name</label>
                <input type="text" placeholder="Ahmed" className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPw ? "text" : "password"} placeholder="At least 8 characters" className="w-full pl-10 pr-10 py-2.5 bg-input-background rounded-xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition" />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 flex gap-2">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-primary leading-relaxed">
                By creating an account, you agree to our Terms of Service and Privacy Policy. Your data is safe and never sold.
              </p>
            </div>
            <button
              onClick={() => navigate("/verify-email")}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-sm hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
            >
              Create Account
            </button>
          </div>
        </div>

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
        <p className="font-semibold text-foreground mb-8">rafiq.ahmed@gmail.com</p>

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
