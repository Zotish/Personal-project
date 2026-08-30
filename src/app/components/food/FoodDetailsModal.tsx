import { useState } from "react";
import {
  X, MapPin, Clock, Calendar, Utensils, CheckCircle,
  Phone, Mail, Heart, ChevronLeft, ChevronRight,
  Package, Users, AlertCircle, Share2
} from "lucide-react";
import { LiveFoodListing } from "../../data/freeFoodData";

interface FoodDetailsModalProps {
  food: LiveFoodListing;
  onClose: () => void;
  onShowDirection?: (food: LiveFoodListing) => void;
}

export function FoodDetailsModal({ food, onClose, onShowDirection }: FoodDetailsModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const images = food.gallery && food.gallery.length > 0 ? food.gallery : [food.image];

  const handleNextImage = () => {
    setActiveImageIdx(prev => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIdx(prev => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal Header with Close & Share ── */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: food.title, text: `${food.agency} - ${food.title}`, url: window.location.href });
              }
            }}
            className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-[#C04A22] transition cursor-pointer"
            title="Share Free Food Program"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {/* Photo Gallery Banner */}
          <div className="relative w-full h-56 sm:h-72 bg-slate-900 select-none overflow-hidden">
            <img
              src={images[activeImageIdx]}
              alt={food.title}
              className="w-full h-full object-cover transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Left/Right Carousel Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        activeImageIdx === idx ? "w-5 bg-[#C04A22]" : "w-1.5 bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Corner Badge: Agency Name */}
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 text-xs font-bold text-slate-800 shadow-md">
                {food.agency}
              </span>
            </div>

            {/* Bottom Title & Cost on image */}
            <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-sm">
                  {food.cost}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
                  {food.distance}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black leading-tight drop-shadow-md">
                {food.title}
              </h2>
            </div>
          </div>

          {/* Details Content */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-xs text-[#C04A22] font-semibold mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Serving Time</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{food.timeText}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold mb-1">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Meal Type</span>
                </div>
                <div className="text-sm font-bold text-slate-900 line-clamp-1">{food.mealType}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-center col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Daily Capacity</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{food.servings}</div>
              </div>
            </div>

            {/* Days & Schedule */}
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-[#C04A22] flex-shrink-0" />
              <div>
                <span className="font-semibold text-slate-900">Schedule: </span>
                <span>{food.days}</span>
              </div>
            </div>

            {/* Location & Address */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700">
              <MapPin className="w-4 h-4 text-[#C04A22] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Distribution Point: </span>
                <span>{food.location}</span>
                <div className="text-xs text-slate-500 mt-0.5">Approx. {food.distance}</div>
              </div>
            </div>

            {/* Menu & Food Items Included */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#C04A22]" />
                <span>Food & Meal Items Included</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {food.menuItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-orange-50/80 text-[#8C3015] border border-orange-200/60 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle className="w-3 h-3 text-[#C04A22]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Eligibility & Guidelines */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#C04A22]" />
                <span>Eligibility & Guidelines</span>
              </h3>
              <div className="text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50/80 border border-emerald-200/70 p-2.5 rounded-xl">
                ✓ {food.eligibility}
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 pl-1">
                {food.guidelines.map((guide, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#C04A22] font-bold">•</span>
                    <span>{guide}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Program Description */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                About This Community Initiative
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {food.description}
              </p>
            </div>

            {/* Contact Details & Direct Actions */}
            <div className="p-4 rounded-2xl bg-orange-50/40 border border-[#C04A22]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#C04A22] fill-[#C04A22]" />
                  <span>Organized by {food.agency}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Free food distribution helpline: {food.contactPhone}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`tel:${food.contactPhone}`}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Helpline</span>
                </a>
                {food.contactEmail && (
                  <a
                    href={`mailto:${food.contactEmail}`}
                    className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center shadow-2xs active:scale-95 cursor-pointer"
                    title="Send Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
