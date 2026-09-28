import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { ExternalLink, CheckCircle2, ChevronRight } from "lucide-react";
import { useAds, SponsoredAd } from "../../context/AdsContext";

interface SponsoredAdCardProps {
  ad: SponsoredAd;
  variant?: "feed" | "card" | "compact";
}

export function SponsoredAdCard({ ad, variant = "feed" }: SponsoredAdCardProps) {
  const navigate = useNavigate();
  const { trackImpression, trackClick } = useAds();

  useEffect(() => {
    trackImpression(ad.id);
  }, [ad.id]);

  const handleAction = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    trackClick(ad.id);
    if (ad.ctaUrl.startsWith("http://") || ad.ctaUrl.startsWith("https://")) {
      window.open(ad.ctaUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(ad.ctaUrl);
    }
  };

  if (variant === "card") {
    return (
      <div
        onClick={() => handleAction()}
        className="bg-white rounded-none sm:rounded-2xl border-0 sm:border sm:border-border hover:border-slate-300 shadow-none sm:shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group relative"
      >
        {/* Top Tag */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            {ad.badgeText || "Sponsored"}
          </span>
        </div>

        {ad.mediaUrl && (
          <div className="relative h-36 w-full overflow-hidden bg-slate-100">
            <img
              src={ad.mediaUrl}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
          </div>
        )}

        <div className="p-3.5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              {ad.sponsorAvatar ? (
                <img src={ad.sponsorAvatar} alt={ad.sponsorName} className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-[9px] font-bold text-amber-800">
                  {ad.sponsorName.slice(0, 1)}
                </div>
              )}
              <span className="text-[11px] font-semibold text-slate-600 truncate">{ad.sponsorName}</span>
              <CheckCircle2 className="w-3 h-3 text-amber-600 flex-shrink-0" />
            </div>

            <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#C04A22] transition-colors line-clamp-2 leading-snug">
              {ad.title}
            </h4>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end">
            <button
              type="button"
              onClick={handleAction}
              className="px-2.5 py-1 rounded-lg bg-amber-50 group-hover:bg-amber-100 text-amber-900 text-[11px] font-bold transition flex items-center gap-1"
            >
              <span>{ad.ctaText}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Default Feed Variant (Native Post Style) ──
  return (
    <article className="bg-white rounded-none sm:rounded-2xl border-0 sm:border border-b border-slate-100/90 sm:border-border hover:border-slate-300 shadow-none sm:shadow-2xs hover:shadow-sm transition-all duration-200 overflow-hidden relative group">
      <div className="p-4 space-y-3">
        {/* Sponsor Profile Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {ad.sponsorAvatar ? (
              <img
                src={ad.sponsorAvatar}
                alt={ad.sponsorName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black flex items-center justify-center text-sm shadow-2xs flex-shrink-0">
                {ad.sponsorName.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-black text-slate-900 truncate">{ad.sponsorName}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span className="text-[11px] font-bold text-amber-700">
                  {ad.badgeText || "Sponsored"}
                </span>
              </div>
              {ad.sponsorHandle && (
                <span className="text-xs text-slate-400 font-medium">{ad.sponsorHandle}</span>
              )}
            </div>
          </div>
        </div>

        {/* Content Headline */}
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
            {ad.title}
          </h3>
        </div>

        {/* Image Banner with Transparent Floating CTA Button */}
        {ad.mediaUrl && (
          <div
            onClick={handleAction}
            className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl overflow-hidden border-y sm:border border-slate-200 cursor-pointer relative group/img max-h-72 bg-slate-100"
          >
            <img
              src={ad.mediaUrl}
              alt={ad.title}
              className="w-full h-full object-cover group-hover/img:scale-[1.02] transition-transform duration-300 max-h-72"
            />

            {/* Transparent Floating CTA Button on Photo */}
            <div className="absolute bottom-3 right-3 z-10">
              <button
                type="button"
                onClick={handleAction}
                className="px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/25 shadow-md active:scale-95 cursor-pointer"
              >
                <span>{ad.ctaText || "Learn More"}</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/90" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Action Ribbon (Only shown if no photo) */}
        {!ad.mediaUrl && (
          <div className="pt-2 flex items-center justify-end border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={handleAction}
              className="font-bold text-[#C04A22] hover:text-[#8C3015] flex items-center gap-1 cursor-pointer"
            >
              <span>{ad.ctaText || "Learn More"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Convenience component that automatically loads the active ad for a slot.
 * Returns null if no active ad exists.
 */
export function SponsoredFeedAd({
  slotIndex,
  placement = "all",
  variant = "feed",
}: {
  slotIndex: number;
  placement?: "all" | "feed" | "explore" | "services" | "qna";
  variant?: "feed" | "card" | "compact";
}) {
  const { getSlotAd } = useAds();
  const ad = getSlotAd(slotIndex, placement);

  if (!ad) return null;

  return <SponsoredAdCard ad={ad} variant={variant} />;
}
