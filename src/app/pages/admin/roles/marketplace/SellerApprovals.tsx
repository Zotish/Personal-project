import React, { useState } from "react";
import { Store, CheckCircle2, XCircle, MapPin, Phone, ShieldCheck, Eye, X } from "lucide-react";

interface SellerApplication {
  id: string;
  shopName: string;
  ownerName: string;
  category: string;
  location: string;
  phone: string;
  submittedDate: string;
  itemsCount: number;
  safeZone: string;
  status: "pending" | "approved" | "rejected";
}

const INITIAL_SELLER_APPS: SellerApplication[] = [
  {
    id: "APP-01",
    shopName: "Bangla Supermarket & Fish Market",
    ownerName: "Abdul Mannan",
    category: "Grocery & Halal Meat",
    location: "73-12 37th Ave, Jackson Heights, Queens, NY",
    phone: "+1 (718) 555-0199",
    submittedDate: "4 hours ago",
    itemsCount: 42,
    safeZone: "Jackson Heights NYPD Safe Trade Zone",
    status: "pending",
  },
  {
    id: "APP-02",
    shopName: "Dhaka Home Kitchen & Catering",
    ownerName: "Rokeya Begum",
    category: "Home Kitchen & Halal Meals",
    location: "Kew Gardens Hills, Queens, NY",
    phone: "+1 (347) 555-0142",
    submittedDate: "1 day ago",
    itemsCount: 15,
    safeZone: "Queens Public Library Pickup Zone",
    status: "pending",
  },
];

export function SellerApprovals() {
  const [apps, setApps] = useState<SellerApplication[]>(INITIAL_SELLER_APPS);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleApprove = (id: string, name: string) => {
    setApps(prev => prev.filter(a => a.id !== id));
    setFeedback(`Store Approved: "${name}" is now live on ImmigrantConnect Marketplace!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleReject = (id: string, name: string) => {
    setApps(prev => prev.filter(a => a.id !== id));
    setFeedback(`Store application for "${name}" has been returned with revision notes.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase text-emerald-600 font-bold tracking-wider">Marketplace Operations</span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Immigrant Merchant Store Applications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review diaspora storefront registrations, verify pickup safe zones, and approve seller profiles.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold self-start sm:self-auto">
          {apps.length} Applications Pending
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)}><X className="w-3.5 h-3.5 text-emerald-700" /></button>
        </div>
      )}

      {/* List */}
      {apps.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No Pending Seller Stores</h3>
          <p className="text-xs">All storefront applications have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map(app => (
            <div key={app.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-slate-300 transition">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{app.shopName}</h3>
                      <div className="text-xs text-slate-500">Owner: {app.ownerName} • <span className="text-emerald-700 font-semibold">{app.category}</span></div>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-mono self-start">
                  Submitted {app.submittedDate}
                </span>
              </div>

              {/* Location & Safe Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Physical Shop Location</span>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{app.location}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Designated Safe Trade Zone</span>
                  <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{app.safeZone}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Initial Catalog: <strong>{app.itemsCount} products</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReject(app.id, app.shopName)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
                  >
                    Request Modification
                  </button>
                  <button
                    onClick={() => handleApprove(app.id, app.shopName)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Storefront
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
