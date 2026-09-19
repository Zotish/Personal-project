import React, { useState } from "react";
import { Sparkles, AlertTriangle, CheckCircle2, Trash2, ShieldAlert, DollarSign } from "lucide-react";

interface FlaggedProduct {
  id: string;
  title: string;
  sellerName: string;
  price: string;
  flagReason: string;
  reportedTime: string;
  status: "flagged" | "reviewed";
}

const INITIAL_FLAGGED_PRODUCTS: FlaggedProduct[] = [
  {
    id: "PRD-902",
    title: "Prescription Antibiotics (Imported Batch)",
    sellerName: "Queens Corner Pharmacy Store",
    price: "$45.00",
    flagReason: "Prohibited Medical Item: Requires licensed US pharmacy dispatch permit.",
    reportedTime: "30m ago",
    status: "flagged",
  },
  {
    id: "PRD-811",
    title: "Pre-owned Solid Wood Dining Set (6 Chairs)",
    sellerName: "Gulshan Furniture Mart",
    price: "$280.00",
    flagReason: "Customer Delivery Dispute: Item received with broken table leg; seller uncontactable.",
    reportedTime: "2h ago",
    status: "flagged",
  },
];

export function ProductModeration() {
  const [products, setProducts] = useState<FlaggedProduct[]>(INITIAL_FLAGGED_PRODUCTS);

  const handleAction = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase text-emerald-600 font-bold tracking-wider">Marketplace Operations</span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Catalog Moderation & Buyer Disputes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect prohibited listing reports, trademark violations, and escrow order disputes.
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">Catalog Is Healthy!</h3>
          <p className="text-xs">No flagged products or buyer claims require moderation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(p => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-slate-300 transition">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">{p.id}</span>
                    <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.price}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Store: <strong className="text-slate-800">{p.sellerName}</strong>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-mono self-start">
                  Flagged {p.reportedTime}
                </span>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-3 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{p.flagReason}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleAction(p.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
                >
                  Dismiss & Retain Listing
                </button>
                <button
                  onClick={() => handleAction(p.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delist Product & Notify Seller
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
