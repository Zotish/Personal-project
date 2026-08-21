import React from "react";
import { X, Printer, Download, CheckCircle2, ShieldCheck, FileText, Store, User, MapPin } from "lucide-react";
import { Logo } from "./ui/Logo";

export interface InvoiceData {
  orderId: string;
  invoiceNo?: string;
  date?: string;
  buyerName: string;
  sellerName: string;
  itemTitle: string;
  itemImage?: string;
  price: string;
  quantity?: number;
  deliveryMethod?: string;
  paymentMethod?: string;
  deliveryAddress?: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
}

export function InvoiceModal({ isOpen, onClose, invoice }: InvoiceModalProps) {
  if (!isOpen || !invoice) return null;

  const invoiceNumber = invoice.invoiceNo || `INV-2026-${invoice.orderId.replace(/[^0-9]/g, "") || "902"}`;
  const currentDate = invoice.date || "August 21, 2026 • 4:15 PM";
  const numericPrice = parseFloat(invoice.price.replace(/[^0-9.]/g, "")) || 350.00;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header Bar */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C04A22]" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">Official Cash Memo / Invoice</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              title="Print Cash Memo"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Cash Memo Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 font-sans">
          
          {/* Top Brand & Status Row */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <Logo size="md" />
              <p className="text-[11px] text-slate-500 mt-1 font-medium">ImmigrantConnect USA Marketplace</p>
              <p className="text-[10px] text-slate-400">Licensed & Escrow Secured Platform</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID IN FULL
              </span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-1.5">{invoiceNumber}</p>
              <p className="text-[10px] text-slate-400">{currentDate}</p>
            </div>
          </div>

          {/* Parties: Billed To (Buyer) & Sold By (Seller) */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To (Buyer)
              </span>
              <p className="font-extrabold text-slate-900 text-sm">{invoice.buyerName || "Rafiq Ahmed"}</p>
              <p className="text-slate-600 text-[11px] mt-0.5">{invoice.deliveryAddress || "Queens, New York, NY 11375"}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">Phone: +1 (800) 555-0199 (Proxy Verified)</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Sold By (Merchant)
              </span>
              <p className="font-extrabold text-slate-900 text-sm">{invoice.sellerName || "Gulshan Premium Furniture Mart"}</p>
              <p className="text-slate-600 text-[11px] mt-0.5">Jackson Heights, NY</p>
              <p className="text-emerald-700 text-[10px] font-bold mt-0.5">✓ Verified Merchant</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">Item Description</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3.5">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{invoice.itemTitle}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Order ID: #{invoice.orderId.replace(/^#/, '')}</p>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-slate-700">{invoice.quantity || 1}</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700">${numericPrice.toFixed(2)}</td>
                  <td className="py-3 px-3.5 text-right font-bold text-slate-900">${numericPrice.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="flex flex-col items-end space-y-1.5 text-xs pt-1">
            <div className="flex justify-between w-48 sm:w-56 text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">${numericPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 sm:w-56 text-slate-600">
              <span>Courier Delivery:</span>
              <span className="font-semibold text-emerald-600">Free ($0.00)</span>
            </div>
            <div className="flex justify-between w-48 sm:w-56 text-slate-600">
              <span>Escrow Security Fee:</span>
              <span className="font-semibold text-emerald-600">$0.00</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between w-48 sm:w-56 text-sm font-extrabold text-slate-900">
              <span>Total Paid:</span>
              <span className="text-[#C04A22] text-base">${numericPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Escrow Guarantee Footer Note */}
          <div className="bg-[#C04A22]/8 border border-[#C04A22]/20 rounded-2xl p-3.5 flex items-center gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-[#C04A22] flex-shrink-0" />
            <div className="text-[11px] text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Escrow Security Guaranteed:</strong> This cash memo serves as authentic proof of purchase and delivery. Payments are held in PathaSathi Escrow Vault until delivery confirmation.
            </div>
          </div>

        </div>

        {/* Footer Close / Print Button Row (Hidden in Print Mode) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-[11px] text-slate-500">Thank you for supporting community commerce!</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer active:scale-95"
          >
            Close Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
