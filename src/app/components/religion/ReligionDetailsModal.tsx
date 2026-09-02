import React, { useState } from "react";
import {
  X, Bookmark, BookmarkCheck, Share2, Building,
  ShieldCheck, Phone, Globe, CheckCircle2,
  Navigation, MapPin, Clock, Star, Heart
} from "lucide-react";
import type { LiveReligionListing } from "../../data/religionData";
import { buildMapShareUrl, shareOrCopy } from "../../utils/shareUtils";

interface ReligionDetailsModalProps {
  listing: LiveReligionListing | null;
  onClose: () => void;
  savedIds?: string[];
  onToggleSave?: (id: string) => void;
  onShowDirection?: (listing: LiveReligionListing) => void;
}

export function ReligionDetailsModal({
  listing,
  onClose,
  savedIds = [],
  onToggleSave,
  onShowDirection
}: ReligionDetailsModalProps) {
  const [localSaved, setLocalSaved] = useState(false);

  if (!listing) return null;

  const isSaved = onToggleSave ? savedIds.includes(listing.id) : localSaved;
  const toggleSave = () => {
    if (onToggleSave) {
      onToggleSave(listing.id);
    } else {
      setLocalSaved(s => !s);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pt-5 pb-20 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[calc(100dvh-100px)] sm:max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header: Actions & Top-Right Controls */}
        <div className="px-5 pt-4 pb-3 sm:px-6 sm:pt-5 flex-shrink-0 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Type Badge & Verified */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl leading-none">{listing.emoji}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {listing.type}
                  </span>
                  {listing.isVerified && (
                    <span title="Verified Institution" className="inline-flex items-center flex-shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Controls: Save, Share, Close */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleSave}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#C04A22] flex items-center justify-center transition cursor-pointer"
                title={isSaved ? "Saved" : "Save Place"}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 text-[#C04A22]" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={async () => {
                  const url = buildMapShareUrl({
                    id: listing.id,
                    name: listing.name,
                    lat: listing.lat,
                    lng: listing.lng,
                    category: `${listing.emoji} ${listing.type}`,
                    address: listing.address,
                    image: (listing as any).image,
                    phone: listing.phone,
                    description: `${listing.name} (${listing.type}) in ${listing.city}`,
                  });
                  await shareOrCopy({
                    title: listing.name,
                    text: `${listing.name} (${listing.type}) in ${listing.city}`,
                    url,
                  });
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#C04A22] flex items-center justify-center transition cursor-pointer"
                title="Share on Map"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5 custom-scrollbar">
          {/* Main Photo Banner */}
          <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
            <img
              src={listing.image}
              alt={listing.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2.5 left-2.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{listing.distance}</span>
            </div>
            <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
              {listing.openStatus}
            </div>
          </div>

          {/* Place Title & Address */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 leading-snug">
                {listing.name}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium mt-1">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{listing.address}</span>
            </div>

            {/* Ratings & Hours */}
            <div className="flex flex-wrap items-center gap-3 text-xs mt-2.5 pt-2.5 border-t border-slate-100">
              <div className="flex items-center gap-1 font-semibold text-slate-800">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{listing.rating}</span>
                <span className="text-slate-400 font-normal">({listing.reviews} reviews)</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-slate-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{listing.hours}</span>
              </div>
            </div>
          </div>

          {/* Prayer / Service Schedule Box */}
          {listing.prayerTimes && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Daily Prayer & Service Schedule
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {listing.prayerTimes.fajr && (
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                    <div className="text-[10px] text-slate-500 font-medium">Fajr</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">{listing.prayerTimes.fajr}</div>
                  </div>
                )}
                {listing.prayerTimes.dhuhr && (
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                    <div className="text-[10px] text-slate-500 font-medium">Dhuhr</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">{listing.prayerTimes.dhuhr}</div>
                  </div>
                )}
                {listing.prayerTimes.asr && (
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                    <div className="text-[10px] text-slate-500 font-medium">Asr</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">{listing.prayerTimes.asr}</div>
                  </div>
                )}
                {listing.prayerTimes.maghrib && (
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                    <div className="text-[10px] text-slate-500 font-medium">Maghrib</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">{listing.prayerTimes.maghrib}</div>
                  </div>
                )}
                {listing.prayerTimes.isha && (
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                    <div className="text-[10px] text-slate-500 font-medium">Isha</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">{listing.prayerTimes.isha}</div>
                  </div>
                )}
                {listing.prayerTimes.jummah && (
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/60 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-emerald-800 font-bold">Jumu'ah Prayer</div>
                    <div className="text-xs font-bold text-emerald-950 truncate">{listing.prayerTimes.jummah}</div>
                  </div>
                )}
                {listing.prayerTimes.dailyPuja && (
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 col-span-2 sm:col-span-3">
                    <div className="text-[10px] text-amber-800 font-bold">Daily Puja Timings</div>
                    <div className="text-xs font-bold text-amber-950">{listing.prayerTimes.dailyPuja}</div>
                  </div>
                )}
                {listing.prayerTimes.sundayMass && (
                  <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 col-span-2 sm:col-span-3">
                    <div className="text-[10px] text-indigo-800 font-bold">Sunday Mass Schedule</div>
                    <div className="text-xs font-bold text-indigo-950">{listing.prayerTimes.sundayMass}</div>
                  </div>
                )}
                {listing.prayerTimes.langarHours && (
                  <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-200 col-span-2 sm:col-span-3">
                    <div className="text-[10px] text-orange-800 font-bold">Free Langar Meal Service</div>
                    <div className="text-xs font-bold text-orange-950">{listing.prayerTimes.langarHours}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">About This Center</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {listing.description}
            </p>
          </div>

          {/* Facilities & Services */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Facilities & Programs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {listing.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Languages Supported */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Languages Spoken</h3>
            <div className="flex flex-wrap gap-1.5">
              {listing.languages.map(lang => (
                <span key={lang} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            onClick={() => {
              onClose();
              onShowDirection?.(listing);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <Navigation className="w-4 h-4" />
            <span>Get Directions</span>
          </button>
          <a
            href={`tel:${listing.phone}`}
            className="py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Phone className="w-4 h-4 text-slate-600" />
            <span>Call</span>
          </a>
        </div>
      </div>
    </div>
  );
}
