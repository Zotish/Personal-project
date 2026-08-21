import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  ShoppingBag, Package, Lock, Key, Truck, PhoneCall, ShieldCheck,
  ChevronRight, ArrowLeft, Clock, MapPin, CheckCircle2, ShieldAlert,
  AlertTriangle, RefreshCw, MessageSquare
} from "lucide-react";
import { DeliverySecurityModal } from "../components/DeliverySecurityModal";

export function BuyerOrders() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed">("active");
  const [selectedOrderModal, setSelectedOrderModal] = useState<any | null>(null);

  const buyerOrders = [
    {
      id: "ORD-902",
      item: "Solid Oak Dining Table with 6 Chairs",
      seller: "Gulshan Premium Furniture Mart",
      price: "$350.00",
      date: "Today, 4:15 PM",
      status: "In Transit",
      otp: "427189",
      escrowStatus: "$350.00 Locked in Escrow Vault",
      courier: "Pathao Express Logistics",
      rider: "Rider #R-902 (Ariful Islam)",
      timeline: [
        { label: "Order Placed & Escrow Locked", time: "4:15 PM", done: true },
        { label: "Seller Packed & Courier Handover", time: "5:30 PM", done: true },
        { label: "Out for Delivery by Rider #R-902", time: "6:10 PM", done: true },
        { label: "Buyer OTP Inspection & Fund Release", time: "Pending", done: false },
      ],
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&h=300&fit=crop",
    },
    {
      id: "ORD-899",
      item: "Deshi Basmati Rice 5kg Pack x 2",
      seller: "Dhaka Halal Grocery & Mart",
      price: "$37.00",
      date: "Yesterday, 2:30 PM",
      status: "Completed",
      otp: "771904",
      escrowStatus: "Escrow Released to Seller",
      courier: "Steadfast Express",
      rider: "Rider #R-412 (Tanvir Ahmed)",
      timeline: [
        { label: "Order Placed & Escrow Locked", time: "2:30 PM", done: true },
        { label: "Seller Packed & Courier Handover", time: "3:10 PM", done: true },
        { label: "Out for Delivery", time: "4:00 PM", done: true },
        { label: "Delivered & OTP Verified", time: "4:45 PM", done: true },
      ],
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=300&fit=crop",
    },
  ];

  const filteredOrders = buyerOrders.filter(order => {
    if (activeFilter === "active") return order.status === "In Transit";
    if (activeFilter === "completed") return order.status === "Completed";
    return true;
  });

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50/50 pb-20">
        
        {/* Header */}
        <div className="bg-white border-b border-border sticky top-0 z-30 shadow-xs">
          <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 sm:p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition flex-shrink-0 cursor-pointer active:scale-95"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-foreground truncate">
                  My Orders & Package Tracking
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2 border-b border-border pb-3">
            {[
              { id: "active", label: "Active (1)" },
              { id: "completed", label: "Completed (1)" },
              { id: "all", label: "All (2)" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === tab.id
                    ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/30 shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-[#C04A22]/10 hover:text-[#8C3015]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders Cards List */}
          <div className="space-y-5">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-3xl border border-border shadow-xs overflow-hidden">
                
                {/* Order Top Bar */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={order.image} alt={order.item} className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-500 text-xs block">#{order.id.replace(/^#/, '')}</span>
                      <h4 className="text-xs font-semibold text-slate-800 mt-0.5 truncate">{order.item}</h4>
                    </div>
                  </div>

                  <span className="font-extrabold text-emerald-600 text-sm flex-shrink-0">{order.price}</span>
                </div>

                {/* Order Body Details */}
                <div className="p-4 sm:p-5 space-y-4 text-xs">
                  
                  {/* Escrow & OTP Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Escrow Status Box */}
                    <div className="bg-[#C04A22]/10 border border-[#C04A22]/20 rounded-2xl p-3.5 flex items-center gap-3">
                      <Lock className="w-5 h-5 text-[#8C3015] flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-[#8C3015] uppercase tracking-wider block">Escrow Status</span>
                        <span className="font-extrabold text-[#8C3015] text-xs">{order.escrowStatus}</span>
                      </div>
                    </div>

                    {/* Buyer Secret Delivery OTP Box */}
                    <div className="bg-[#C04A22]/10 border border-[#C04A22]/20 rounded-2xl p-3.5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#8C3015] uppercase tracking-wider block">Your Delivery OTP</span>
                        <span className="text-[11px] text-slate-600">Give to rider at delivery</span>
                      </div>
                      <span className="px-3 py-1 rounded-xl text-base font-mono font-extrabold bg-[#C04A22] text-white shadow-xs">
                        {order.otp}
                      </span>
                    </div>

                  </div>

                  {/* Tracking Timeline */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#C04A22]" /> Package Tracking Timeline
                    </h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                      {order.timeline.map((step, idx) => (
                        <div key={idx} className="flex flex-col space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-1.5">
                            {step.done ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#C04A22] flex-shrink-0" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            )}
                            <span className={`text-[11px] font-bold ${step.done ? "text-slate-900" : "text-slate-400"}`}>
                              Step {idx + 1}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-700 leading-tight line-clamp-2">{step.label}</span>
                          <span className="text-[10px] text-slate-400">{step.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action: Track & Security Details Button */}
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => setSelectedOrderModal(order)}
                      className="px-4 py-2 rounded-xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
                    >
                      Track & Security Details
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>

        {/* BUYER SECURITY & MASKED CALL MODAL */}
        {selectedOrderModal && (
          <DeliverySecurityModal
            isOpen={!!selectedOrderModal}
            onClose={() => setSelectedOrderModal(null)}
            role="buyer"
            orderId={selectedOrderModal.id}
            itemTitle={selectedOrderModal.item}
            totalPrice={selectedOrderModal.price}
          />
        )}

      </div>
    </AppLayout>
  );
}
