import { useState } from "react";
import {
  X, Bookmark, BookmarkCheck, Share2, Briefcase,
  GraduationCap, Gift, CheckCircle2, Navigation, ExternalLink
} from "lucide-react";
import type { LiveJobListing } from "../../data/jobsData";

interface JobDetailsModalProps {
  job: LiveJobListing | null;
  onClose: () => void;
  onShowDirection?: (job: LiveJobListing) => void;
  savedJobIds?: string[];
  onToggleSave?: (id: string) => void;
}

export function JobDetailsModal({
  job,
  onClose,
  onShowDirection,
  savedJobIds = [],
  onToggleSave
}: JobDetailsModalProps) {
  const [localSaved, setLocalSaved] = useState(false);

  if (!job) return null;

  const isSaved = onToggleSave ? savedJobIds.includes(job.id) : localSaved;
  const toggleSave = () => {
    if (onToggleSave) {
      onToggleSave(job.id);
    } else {
      setLocalSaved(s => !s);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pt-5 pb-24 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[calc(100dvh-150px)] sm:max-h-[82vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header: Actions & Top-Right Controls */}
        <div className="px-5 pt-4 pb-2 sm:px-6 sm:pt-5 flex-shrink-0 bg-white">
          {/* Action Controls: Save, Share, Close */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleSave}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#C04A22] flex items-center justify-center transition cursor-pointer"
                title={isSaved ? "Saved" : "Save Job"}
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
                      title: job.title,
                      text: `Job Opportunity: ${job.title} at ${job.company}`,
                      url: window.location.href
                    }).catch(() => {});
                  }
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                title="Share Job"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Highlight Stats Row: Experience & Deadline */}
          <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-2">
            <div className="bg-slate-50 rounded-2xl p-3 text-center sm:text-left">
              <div className="text-[11px] text-slate-500 font-medium">Experience</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">{job.experience}</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 text-center sm:text-left">
              <div className="text-[11px] text-slate-500 font-medium">Deadline</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">{job.deadline || "Open / Rolling"}</div>
            </div>
          </div>
        </div>

        {/* Modal Body: 3 Structured Point-by-Point Sections (Scrollable) */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* 1. Responsibilities Section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-xl bg-[#C04A22]/12 text-[#8C3015] flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-4 h-4 text-[#C04A22]" />
              </div>
              <span>Key Responsibilities</span>
            </div>
            <ul className="space-y-2 pl-2">
              {job.responsibilities?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C04A22] mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Qualifications Section */}
          <div className="space-y-2.5 pt-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-xl bg-[#C04A22]/12 text-[#8C3015] flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-[#C04A22]" />
              </div>
              <span>Requirements & Qualifications</span>
            </div>

            {/* Skills Tag Pills */}
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pl-2 mb-2">
                {job.skills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-xl bg-orange-50/80 text-[#8C3015] border border-orange-100/60 text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <ul className="space-y-2 pl-2">
              {job.qualifications?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C04A22] mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. What We Offer Section */}
          <div className="space-y-2.5 pt-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-xl bg-[#C04A22]/12 text-[#8C3015] flex items-center justify-center flex-shrink-0">
                <Gift className="w-4 h-4 text-[#C04A22]" />
              </div>
              <span>What We Offer & Benefits</span>
            </div>
            <ul className="space-y-2 pl-2">
              {job.whatWeOffer?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sticky Modal Bottom Footer */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50/95 flex items-center justify-between gap-3 flex-shrink-0">
          {onShowDirection ? (
            <button
              type="button"
              onClick={() => {
                const j = job;
                onClose();
                onShowDirection(j);
              }}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-orange-50 text-slate-700 hover:text-[#C04A22] text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer active:scale-98"
            >
              <Navigation className="w-4 h-4 text-[#C04A22]" />
              <span>View Route on Map</span>
            </button>
          ) : (
            <div />
          )}

          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-2xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <span>Apply</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
