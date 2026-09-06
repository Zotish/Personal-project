import { useState } from "react";
import {
  X, Store, ShieldCheck, CheckCircle2, ArrowLeftRight,
  Sparkles, Lock, MapPin, Phone, Building2
} from "lucide-react";
import { useAccountMode } from "../../context/AccountModeContext";

export function SellerMigrationModal() {
  const {
    user,
    isMigrateModalOpen,
    closeMigrateModal,
    migrateToSeller,
    switchMode,
  } = useAccountMode();

  const [shopName, setShopName] = useState("");
  const [category, setCategory] = useState("Food & Groceries");
  const [phone, setPhone] = useState(user.phone || "");
  const [safeZone, setSafeZone] = useState("Jackson Heights Community Safe-Zone (Queens, NY)");
  const [agreed, setAgreed] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isMigrateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !agreed) return;

    setLoading(true);
    setTimeout(() => {
      migrateToSeller({
        shopName,
        category,
        phone,
        safeZone,
      });
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleFinishAndSwitch = () => {
    closeMigrateModal();
    setSubmitted(false);
    switchMode("seller");
  };

  const handleFinishStay = () => {
    closeMigrateModal();
    setSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#C04A22]/10 text-[#8C3015] flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                Migrate to Seller Account
              </h3>
              <p className="text-xs text-slate-500">
                Single Login · 1-Tap Account Switch
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!loading) {
                closeMigrateModal();
                setSubmitted(false);
              }
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          /* Celebratory Success View */
          <div className="p-8 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs animate-in zoom-in-75 duration-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
                <Sparkles className="w-3.5 h-3.5" /> Migration Completed!
              </div>
              <h4 className="text-xl font-bold text-slate-900">
                Seller Account Activated!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your existing account (<strong className="text-slate-800">{user.handle}</strong>) now has full Merchant capabilities. You can seamlessly switch between Member and Seller modes anytime.
              </p>
            </div>

            {/* Account Card Preview */}
            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/70 text-left space-y-2 max-w-sm mx-auto">
              <div className="flex items-center justify-between text-xs font-bold text-[#8C3015]">
                <span>🏪 {shopName}</span>
                <span className="text-[10px] bg-[#C04A22] text-white px-2 py-0.5 rounded-full font-semibold">Active Seller</span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                <span>Category: {category}</span>
                <span>•</span>
                <span>Owner: {user.name}</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 pt-1 border-t border-orange-100">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero-Leak Immigrant Privacy Shield Active
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 max-w-sm mx-auto">
              <button
                type="button"
                onClick={handleFinishStay}
                className="flex-1 py-2.5 px-4 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Stay as Member
              </button>
              <button
                type="button"
                onClick={handleFinishAndSwitch}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Go to Seller Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Migration Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {/* Identity Notice Box */}
            <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#8C3015] flex items-center justify-center flex-shrink-0 mt-0.5">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900">
                  Dual-Profile Integration
                </div>
                <div className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
                  Migrating allows you to sell while keeping your current login (<strong className="text-slate-800">{user.email}</strong>). No separate credentials needed.
                </div>
              </div>
            </div>

            {/* Business / Shop Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#C04A22]" />
                Store or Business Name <span className="text-[#C04A22]">*</span>
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Gulshan Resale & Grocery Mart"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#C04A22] focus:ring-1 focus:ring-[#C04A22] transition-colors"
              />
            </div>

            {/* Business Category */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Business Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#C04A22] focus:ring-1 focus:ring-[#C04A22] bg-white transition-colors cursor-pointer"
              >
                <option value="Food & Groceries">🍛 Food, Groceries & Halal Sweets</option>
                <option value="Used Furniture & Household">🛋️ Used Furniture & Household Items</option>
                <option value="Tech & Electronics">📱 Electronics, Phones & Computer Repair</option>
                <option value="Fashion & Ethnic Crafts">👗 Clothing, Sarees & Ethnic Crafts</option>
                <option value="Legal & Advisory Services">⚖️ Legal, Notary & Immigration Help</option>
                <option value="Other Local Services">🛠️ Other Community Services</option>
              </select>
            </div>

            {/* Business Phone or WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#C04A22]" />
                Contact Phone / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (718) 555-0192"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#C04A22] focus:ring-1 focus:ring-[#C04A22] transition-colors"
              />
            </div>

            {/* Safe Pickup Zone & Anti-Doxxing Notice */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C04A22]" />
                  Designated Safe Pickup Area / Neighborhood
                </label>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Address Shielded
                </span>
              </div>
              <input
                type="text"
                value={safeZone}
                onChange={(e) => setSafeZone(e.target.value)}
                placeholder="e.g. Jackson Heights Safe-Zone (Queens, NY)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#C04A22] focus:ring-1 focus:ring-[#C04A22] transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Anti-Harassment Protection:</strong> Your exact residential street address will NEVER be visible to public buyers.
                </span>
              </p>
            </div>

            {/* Code of Conduct Agreement */}
            <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#C04A22] focus:ring-[#C04A22] cursor-pointer flex-shrink-0"
              />
              <span className="text-[11px] text-slate-600 leading-relaxed font-medium">
                I agree to the <strong>Immigrant Seller Code of Conduct</strong>, Community Safety Guidelines, and Anti-Scam Protection rules.
              </span>
            </label>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={closeMigrateModal}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !shopName.trim() || !agreed}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Migrating Account...</span>
                ) : (
                  <>
                    <Store className="w-4 h-4" />
                    <span>Activate Seller Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
