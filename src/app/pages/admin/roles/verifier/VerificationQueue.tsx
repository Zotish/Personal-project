import React, { useState } from "react";
import { Award, FileText, CheckCircle2, XCircle, Eye, ShieldCheck, ExternalLink, X } from "lucide-react";

interface VerificationApplicant {
  id: number;
  name: string;
  handle: string;
  profession: string;
  jurisdiction: string;
  licenseNumber: string;
  badgeToGrant: string;
  submittedAt: string;
  documents: { name: string; size: string; type: "pdf" | "image" }[];
  notes: string;
}

const INITIAL_APPLICANTS: VerificationApplicant[] = [
  {
    id: 1,
    name: "Nadia Islam",
    handle: "@nadia_legal",
    profession: "Licensed Immigration Attorney",
    jurisdiction: "New York State Unified Court System",
    licenseNumber: "NY Bar Registration #456789 (Active / Good Standing)",
    badgeToGrant: "Verified Legal Advisor",
    submittedAt: "3 hours ago",
    documents: [
      { name: "NY_State_Bar_Card_2026.pdf", size: "1.4 MB", type: "pdf" },
      { name: "Government_Issued_Photo_ID.jpg", size: "2.8 MB", type: "image" },
    ],
    notes: "Specializes in Asylum, TPS, and Special Immigrant Juvenile (SIJ) petitions for Bangladeshi community in Jackson Heights.",
  },
  {
    id: 2,
    name: "Dr. Priya Menon",
    handle: "@dr_priya",
    profession: "Physician & Community Healthcare Navigator",
    jurisdiction: "NYS Board for Medicine",
    licenseNumber: "Medical License #MD-2024-8902",
    badgeToGrant: "Verified Healthcare Provider",
    submittedAt: "1 day ago",
    documents: [
      { name: "NYS_Medical_License_Renewal.pdf", size: "980 KB", type: "pdf" },
      { name: "Hospital_Affiliation_Letter.pdf", size: "1.1 MB", type: "pdf" },
    ],
    notes: "Offers multilingual free clinic guidance for uninsured diaspora families across Brooklyn & Queens.",
  },
  {
    id: 3,
    name: "Ahmed Hassan, CPA",
    handle: "@ahmed_tax",
    profession: "Certified Public Accountant",
    jurisdiction: "NY State Board for Public Accountancy",
    licenseNumber: "CPA Certificate #NY-092341",
    badgeToGrant: "Verified Tax & Financial Advisor",
    submittedAt: "2 days ago",
    documents: [
      { name: "CPA_State_Certificate_Scan.pdf", size: "1.6 MB", type: "pdf" },
    ],
    notes: "Assists undocumented immigrants with ITIN number applications and small business tax compliance.",
  },
];

export function VerificationQueue() {
  const [applicants, setApplicants] = useState<VerificationApplicant[]>(INITIAL_APPLICANTS);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleApprove = (id: number, name: string, badge: string) => {
    setApplicants(prev => prev.filter(a => a.id !== id));
    setFeedback(`Approved! ${name} is now verified with the "${badge}" badge.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleReject = (id: number, name: string) => {
    setApplicants(prev => prev.filter(a => a.id !== id));
    setFeedback(`Application for ${name} has been rejected with request for resubmission.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase text-blue-700 font-bold tracking-wider">Compliance & Trust Module</span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Professional Credential Verification Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect state bar licenses, medical certifications, and grant official verified advisor badges.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold self-start sm:self-auto">
          {applicants.length} Pending Review
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)}><X className="w-3.5 h-3.5 text-emerald-700" /></button>
        </div>
      )}

      {/* Applicant Cards */}
      {applicants.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">All Credentials Verified!</h3>
          <p className="text-xs">No pending professional license submissions at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map(item => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-slate-300 transition">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">{item.handle}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Target: {item.badgeToGrant}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.profession} • <span className="text-slate-800 font-semibold">{item.jurisdiction}</span>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-mono self-start">
                  Submitted {item.submittedAt}
                </span>
              </div>

              {/* License registry match */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-3 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">License / Bar Number</span>
                  <span className="font-mono text-emerald-700 font-bold">{item.licenseNumber}</span>
                </div>
                <button
                  onClick={() => window.open(`https://iapps.courts.state.ny.us/attorneyservices`, "_blank")}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 font-semibold transition flex items-center gap-1 shadow-2xs"
                >
                  <span>Verify Registry</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Attached documents */}
              <div className="mb-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Submitted Official Proofs</span>
                <div className="flex flex-wrap gap-2">
                  {item.documents.map((doc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDoc(doc.name)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 transition flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>{doc.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({doc.size})</span>
                      <Eye className="w-3 h-3 text-slate-500 ml-1" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleReject(item.id, item.name)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
                >
                  Reject & Request More Proof
                </button>
                <button
                  onClick={() => handleApprove(item.id, item.name, item.badgeToGrant)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs shadow-emerald-600/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Issue Official Badge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simulated Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Document Viewer: {selectedDoc}
              </h3>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center min-h-[220px] flex flex-col items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-emerald-600 mb-3 animate-pulse" />
              <div className="text-sm font-bold text-slate-800">Verified Official Government PDF</div>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Encrypted scan verified with New York State Digital Seal watermark.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
