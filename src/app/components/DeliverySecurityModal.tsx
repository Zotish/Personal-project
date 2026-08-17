import { useState, useEffect } from "react";
import {
  ShieldCheck, Lock, PhoneCall, PhoneOff, Mic, MicOff, Volume2,
  CheckCircle2, AlertTriangle, Key, Trash2, Clock, MapPin, Truck,
  Check, X, RefreshCw, Sparkles, UserCheck, ShieldAlert, EyeOff, User, Store
} from "lucide-react";

interface DeliverySecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: "buyer" | "seller";
  orderId?: string;
  itemTitle?: string;
  totalPrice?: string;
}

export function DeliverySecurityModal({
  isOpen,
  onClose,
  role: initialRole = "buyer",
  orderId = "ORD-902",
  itemTitle = "Solid Oak Dining Table with 6 Chairs",
  totalPrice = "$350.00",
}: DeliverySecurityModalProps) {
  const [currentRole, setCurrentRole] = useState<"buyer" | "seller">(initialRole);
  const [callState, setCallState] = useState<"idle" | "calling" | "connected" | "ended">("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [inputOtp, setInputOtp] = useState(["", "", "", "", "", ""]);
  const [deliveryStatus, setDeliveryStatus] = useState<"in_transit" | "delivering" | "completed">("delivering");
  const [isHistoryWiped, setIsHistoryWiped] = useState(false);
  const [showRiderSim, setShowRiderSim] = useState(false);

  const BUYER_SECRET_OTP = "427189";
  const SELLER_PICKUP_OTP = "8942";

  useEffect(() => {
    setCurrentRole(initialRole);
  }, [initialRole, isOpen]);

  // Call timer simulation
  useEffect(() => {
    let interval: any;
    if (callState === "connected") {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  if (!isOpen) return null;

  const handleStartMaskedCall = () => {
    setCallState("calling");
    setTimeout(() => {
      setCallState("connected");
    }, 2000);
  };

  const handleEndCall = () => {
    setCallState("ended");
    setTimeout(() => {
      setCallState("idle");
    }, 1500);
  };

  const handleVerifyOtp = () => {
    const entered = inputOtp.join("").trim();
    if (entered === BUYER_SECRET_OTP) {
      setDeliveryStatus("completed");
      setIsHistoryWiped(true);
      setShowRiderSim(false);
    } else {
      alert("Invalid OTP code. Please enter valid 6-digit code (427189).");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Hero Banner Header */}
        <div className={`p-5 text-white relative overflow-hidden ${
          currentRole === "buyer"
            ? "bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700"
            : "bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900"
        }`}>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base">
                    {currentRole === "buyer" ? "Escrow & Delivery Center" : "Seller Logistics Hub"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-slate-950 uppercase tracking-wider">
                    {currentRole === "buyer" ? "Buyer Portal" : "Seller Portal"}
                  </span>
                </div>
                <p className="text-xs text-blue-100 mt-0.5">Order #{orderId} • {totalPrice}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* ========================================================================= */}
          {/* BUYER PERSPECTIVE VIEW */}
          {/* ========================================================================= */}
          {currentRole === "buyer" && (
            <>
              {/* 1. BUYER ESCROW VAULT BANNER */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Escrow Payment Locked</h4>
                    <span className="text-xs font-extrabold text-emerald-700">{totalPrice} Secured</span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Your money is safely locked in Escrow vault. Funds will only be released to the seller after you inspect the parcel and share your Secret Delivery OTP with the Rider.
                  </p>
                </div>
              </div>

              {/* 2. BUYER SECRET DELIVERY OTP CARD */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-600" />
                    <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                      Your Secret Delivery OTP
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-mono font-extrabold bg-blue-600 text-white shadow-sm border border-blue-500 animate-pulse">
                    {BUYER_SECRET_OTP}
                  </span>
                </div>

                <p className="text-xs text-blue-900 leading-relaxed pt-1">
                  <strong>Instructions for Buyer:</strong> When Rider #R-902 arrives at your doorstep, inspect your package. Tell or read this 6-digit OTP code <code className="bg-blue-200 px-1 py-0.5 rounded font-bold font-mono">{BUYER_SECRET_OTP}</code> to the rider so they can input it in the Rider App.
                </p>
              </div>

              {/* 3. LOGISTICS RIDER INFO & NUMBER MASKED VOIP CALL */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Pathao Express Delivery Partner</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                    deliveryStatus === "completed"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-blue-100 text-blue-800 border-blue-300"
                  }`}>
                    {deliveryStatus === "completed" ? "✓ Delivered & Verified" : "🚚 Rider Approaching"}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                      R
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Rider #R-902 (Ariful Islam)</h5>
                      <p className="text-[11px] text-slate-500">Pathao Courier Express</p>
                    </div>
                  </div>

                  {deliveryStatus !== "completed" && (
                    <button
                      onClick={handleStartMaskedCall}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Call via Proxy
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-blue-50/80 p-2.5 rounded-xl border border-blue-100">
                  <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    <strong>Privacy Guarantee:</strong> Calls route through PathaSathi Proxy. Rider sees proxy number <code className="bg-white px-1 py-0.5 rounded font-mono font-bold">+1 (800) 555-0199</code>. Your personal mobile number is 100% hidden.
                  </span>
                </div>
              </div>

              {/* SIMULATED RIDER APP VERIFICATION MODAL TRIGGER */}
              {deliveryStatus !== "completed" && (
                <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 space-y-2 text-center">
                  <span className="text-xs font-bold text-slate-700 block">
                    🧪 Interactive Test: Simulate Rider App Entering Buyer OTP
                  </span>
                  {!showRiderSim ? (
                    <button
                      onClick={() => setShowRiderSim(true)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition"
                    >
                      Simulate Rider App OTP Entry
                    </button>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <p className="text-[11px] text-slate-600">Enter Buyer's OTP (427189) into Rider App simulation:</p>
                      <div className="flex items-center justify-center gap-2">
                        {[0, 1, 2, 3, 4, 5].map(index => (
                          <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={inputOtp[index]}
                            onChange={e => {
                              const next = [...inputOtp];
                              next[index] = e.target.value;
                              setInputOtp(next);
                            }}
                            className="w-9 h-11 text-center text-base font-bold border-2 rounded-xl bg-white border-slate-300 focus:border-blue-600 focus:outline-none"
                          />
                        ))}
                      </div>
                      <button
                        onClick={handleVerifyOtp}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Validate OTP in Rider App
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* SELLER PERSPECTIVE VIEW */}
          {/* ========================================================================= */}
          {currentRole === "seller" && (
            <>
              {/* 1. SELLER PAYOUT GUARANTEE BANNER */}
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Escrow Payout Pending</h4>
                    <span className="text-xs font-extrabold text-purple-700">{totalPrice} Guaranteed</span>
                  </div>
                  <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                    Escrow payout will be automatically transferred to your bank/bKash account as soon as Pathao Express rider completes the delivery verification.
                  </p>
                </div>
              </div>

              {/* 2. SELLER PICKUP HANDOVER OTP CARD */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-purple-600" />
                    <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider">
                      Seller Pickup Handover OTP
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-mono font-extrabold bg-purple-600 text-white shadow-sm border border-purple-500">
                    {SELLER_PICKUP_OTP}
                  </span>
                </div>

                <p className="text-xs text-purple-900 leading-relaxed pt-1">
                  <strong>Instructions for Seller:</strong> When the courier pickup rider arrives at your store to pick up the package, give this Pickup OTP <code className="bg-purple-200 px-1 py-0.5 rounded font-bold font-mono">{SELLER_PICKUP_OTP}</code> to the rider as proof of handover.
                </p>
              </div>

              {/* 3. WEIGHT AUDIT & SECURITY SEAL PROOF */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Pre-Shipment Audit & Package Record
                </h4>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Hub Measured Weight</span>
                    <span className="font-bold text-slate-800 text-xs">12.4 KG (Verified)</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Security Packaging</span>
                    <span className="font-bold text-emerald-600 text-xs">✓ Sealed Barcode</span>
                  </div>
                </div>
              </div>

              {/* 4. BUYER SECRET OTP - HIDDEN FOR SELLER SECURITY */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
                <EyeOff className="w-6 h-6 text-rose-600 flex-shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-rose-900">Buyer Delivery Secret OTP: 🔒 HIDDEN</h5>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    Buyer's delivery OTP is hidden from seller for anti-collusion fraud prevention. Only the buyer holds their secret code.
                  </p>
                </div>
              </div>

              {/* 5. CALL COURIER PICKUP RIDER VIA PROXY */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Pickup Rider #R-902</h5>
                    <p className="text-[11px] text-slate-500">Pathao Logistics Pickup Partner</p>
                  </div>
                </div>

                <button
                  onClick={handleStartMaskedCall}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call Pickup Rider
                </button>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* SIMULATED LIVE VOIP CALL OVERLAY */}
          {/* ========================================================================= */}
          {callState !== "idle" && (
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  🔒 Encrypted In-App VoIP Call Gateway
                </span>
                <h4 className="text-base font-extrabold">
                  {currentRole === "buyer" ? "Calling Delivery Rider #R-902" : "Calling Pickup Rider #R-902"}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  {callState === "calling" ? "Connecting through PathaSathi Proxy..." : `Connected • ${formatTime(callDuration)}`}
                </p>
              </div>

              {/* Wave visualizer */}
              <div className="flex items-center justify-center gap-1 py-2">
                {[40, 70, 30, 90, 50, 80, 40].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-emerald-400 rounded-full animate-pulse"
                    style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full border ${isMuted ? "bg-amber-500 text-white border-amber-400" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"}`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* POST-DELIVERY CALL LOG AUTO-WIPING NOTICE */}
          {/* ========================================================================= */}
          {isHistoryWiped && (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 text-emerald-400">
                <Trash2 className="w-4 h-4" />
                <h5 className="text-xs font-extrabold uppercase tracking-wider">
                  Post-Delivery Call History Wiped Clean
                </h5>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                As per PathaSathi Privacy & Anti-Stalking Policy, all call records, virtual proxy numbers, and contact links between you and Rider #R-902 have been <strong>permanently deleted and expired</strong>.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
