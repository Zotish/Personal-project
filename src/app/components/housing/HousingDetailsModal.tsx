import { useState } from "react";
import {
  X, Bookmark, BookmarkCheck, Share2, Building,
  Home, ShieldCheck, Phone, Mail, CheckCircle2,
  ExternalLink, Compass, Bed, Bath, Maximize2, MapPin
} from "lucide-react";
import type { LiveHousingListing } from "../../data/housingData";

interface HousingDetailsModalProps {
  listing: LiveHousingListing | null;
  onClose: () => void;
  savedIds?: string[];
  onToggleSave?: (id: string) => void;
}

export function HousingDetailsModal({
  listing,
  onClose,
  savedIds = [],
  onToggleSave
}: HousingDetailsModalProps) {
  const [localSaved, setLocalSaved] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!listing) return null;

  const isSaved = onToggleSave ? savedIds.includes(listing.id) : localSaved;
  const toggleSave = () => {
    if (onToggleSave) {
      onToggleSave(listing.id);
    } else {
      setLocalSaved(s => !s);
    }
  };

  const photos = listing.gallery && listing.gallery.length > 0 ? listing.gallery : [listing.image];

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pt-5 pb-24 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[calc(100dvh-120px)] sm:max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header: Actions & Top-Right Controls */}
        <div className="px-5 pt-4 pb-3 sm:px-6 sm:pt-5 flex-shrink-0 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Agency Badge */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#C04A22] flex-shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {listing.agency}
                  </span>
                  {listing.agencyVerified && (
                    <span title="Verified Agency" className="inline-flex items-center flex-shrink-0">
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
                title={isSaved ? "Saved" : "Save Property"}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 text-[#C04A22]" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: listing.title,
                      text: `${listing.title} - ${listing.price} via ${listing.agency}`,
                      url: window.location.href
                    }).catch(() => {});
                  }
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#C04A22] flex items-center justify-center transition cursor-pointer"
                title="Share Property"
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

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Main Photo & Thumbnail Selector */}
          <div className="space-y-2.5">
            <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
              <img
                src={photos[activePhotoIndex] || listing.image}
                alt={listing.title}
                className="w-full h-full object-cover"
              />

              {/* Bottom Left: Distance */}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{listing.distance}</span>
              </div>
            </div>

            {/* Photo Thumbnails */}
            {photos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {photos.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition flex-shrink-0 cursor-pointer ${
                      activePhotoIndex === idx ? "border-[#C04A22] ring-2 ring-[#C04A22]/20" : "border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {listing.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{listing.location}</span>
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="px-4 py-2 rounded-2xl bg-orange-50/90 text-[#C04A22] font-black text-lg sm:text-xl border border-orange-200/80 shadow-2xs inline-block">
                {listing.price}
              </div>
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center text-[#C04A22] mb-1">
                <Bed className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">{listing.beds}</div>
              <div className="text-[10px] text-slate-500 font-medium">Bedrooms</div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center text-[#C04A22] mb-1">
                <Bath className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">{listing.baths}</div>
              <div className="text-[10px] text-slate-500 font-medium">Bathrooms</div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center text-[#C04A22] mb-1">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">{listing.sqft}</div>
              <div className="text-[10px] text-slate-500 font-medium">Super Builtup</div>
            </div>
          </div>

          {/* Property Overview Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Type: {listing.propertyType}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Furnishing: {listing.furnished}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Agency: {listing.agency}
            </span>
          </div>

          {/* Features & Amenities */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Features & Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {listing.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Property Details</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/60">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Modal Footer: Contact Agency */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50/95 flex items-center justify-between gap-3 border-t border-slate-200/80 flex-shrink-0">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${listing.contactPhone}`}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call Agency</span>
            </a>
          </div>

          <a
            href={`mailto:${listing.contactEmail}?subject=Inquiry regarding ${encodeURIComponent(listing.title)}`}
            className="px-6 py-2.5 rounded-2xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <span>Inquire Now</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
