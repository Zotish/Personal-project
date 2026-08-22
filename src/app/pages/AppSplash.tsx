import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Logo } from "../components/ui/Logo";
import { Sparkles, ShieldCheck, Users, ArrowRight } from "lucide-react";

export function AppSplash() {
  const navigate = useNavigate();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show splash for 1.3s then fade out and navigate to Login
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1300);

    const navTimer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1650);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div
      onClick={() => navigate("/login", { replace: true })}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-[#FFF7F4] via-white to-[#FFF2EC] p-6 sm:p-10 select-none cursor-pointer transition-opacity duration-350 ease-out ${
        fading ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      <style>{`
        @keyframes splashPop {
          0% { transform: scale(0.75); opacity: 0; }
          60% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ringPulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 0.15; }
          100% { transform: scale(0.9); opacity: 0.7; }
        }
        @keyframes shimmerLine {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      {/* Top spacer / Skip */}
      <div className="w-full pt-4 flex items-center justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/login", { replace: true });
          }}
          className="text-xs font-semibold text-slate-400 hover:text-[#C04A22] flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full hover:bg-[#C04A22]/5"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Logo with Animated Glow Rings */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        <div className="relative mb-6 flex items-center justify-center">
          {/* Animated Ambient Pulse Rings */}
          <div
            className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[#E05236]/15 blur-xl pointer-events-none"
            style={{ animation: "ringPulse 2.4s ease-in-out infinite" }}
          />
          <div
            className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-[#E05236]/20 pointer-events-none rotate-6"
            style={{ animation: "ringPulse 2.4s ease-in-out infinite 0.3s" }}
          />

          {/* Main App Logo */}
          <div
            className="relative z-10 p-2 transform transition-transform duration-500 hover:scale-105"
            style={{ animation: "splashPop 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          >
            <Logo size="xl" showText={false} />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div
          className="space-y-2 max-w-xs sm:max-w-sm"
          style={{ animation: "splashPop 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both" }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Pathasathi
            </span>
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed px-2">
            Your Trusted Community &amp; Logistics Companion in the USA
          </p>
        </div>

        {/* Feature Badges */}
        <div
          className="flex items-center justify-center gap-2 sm:gap-3 mt-6 flex-wrap"
          style={{ animation: "splashPop 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both" }}
        >
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white/90 border border-slate-200/80 px-2.5 py-1 rounded-full shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-[#C04A22]" /> Escrow Verified
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white/90 border border-slate-200/80 px-2.5 py-1 rounded-full shadow-2xs">
            <Users className="w-3 h-3 text-[#C04A22]" /> 50K+ Immigrants
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white/90 border border-slate-200/80 px-2.5 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#C04A22]" /> Fast &amp; Secure
          </span>
        </div>
      </div>

      {/* Bottom Loading Progress Bar & Version info */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3 pb-4">
        <div className="w-36 sm:w-44 h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#d4522a] via-[#E05236] to-[#C04A22]"
            style={{ animation: "shimmerLine 1.4s ease-in-out forwards" }}
          />
        </div>
        <span className="text-[10px] font-mono text-slate-400">Loading Pathasathi App…</span>
      </div>
    </div>
  );
}
