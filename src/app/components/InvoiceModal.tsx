import React from "react";
import { X, Printer, CheckCircle2, FileText } from "lucide-react";
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
    <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-hidden print:p-0 print:bg-white animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-200/90 w-full max-w-xl flex flex-col h-full max-h-[88dvh] sm:max-h-[90vh] overflow-hidden z-10 animate-in zoom-in-95 duration-200 print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* ── Fixed Header Bar ── */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF7F4] text-[#E05236] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                Invoice
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                Order #{invoice.orderId.replace(/^#/, "")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              title="Print Invoice"
            >
              <Printer className="w-3.5 h-3.5" /> 
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition cursor-pointer active:scale-95 ml-1"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body Area ── */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-slate-800 font-sans overscroll-contain">
          
          {/* Top Brand & Status Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
            <div>
              <Logo size="md" />
            </div>
            <div className="sm:text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID IN FULL
              </span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-1">{invoiceNumber}</p>
              <p className="text-[10px] text-slate-400">{currentDate}</p>
            </div>
          </div>

          {/* Parties: Billed To (Buyer) & Sold By (Seller) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To (Buyer)
              </span>
              <p className="font-extrabold text-slate-900 text-sm">{invoice.buyerName || "Rafiq Ahmed"}</p>
              <p className="text-slate-600 text-[11px] mt-0.5">{invoice.deliveryAddress || "Queens, New York, NY 11375"}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">Phone: +1 (800) 555-0199 (Proxy Verified)</p>
            </div>
            <div className="border-t sm:border-t-0 sm:border-l border-slate-200/80 pt-2.5 sm:pt-0 sm:pl-3.5">
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
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2.5 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">{invoice.itemTitle}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Order ID: #{invoice.orderId.replace(/^#/, "")}</p>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-slate-700">{invoice.quantity || 1}</td>
                  <td className="py-3 px-2.5 text-right font-medium text-slate-700">${numericPrice.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">${numericPrice.toFixed(2)}</td>
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
              <span className="text-[#E05236] text-base">${numericPrice.toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* ── Fixed Footer Close Button Row ── */}
        <div className="flex-shrink-0 p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#E05236] hover:bg-[#8C3015] text-white font-extrabold text-xs shadow-md transition cursor-pointer active:scale-95 flex-shrink-0"
          >
            Close Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
