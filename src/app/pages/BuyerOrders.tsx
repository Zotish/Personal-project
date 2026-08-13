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
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-foreground">My Orders & Package Tracking</h1>
                <p className="text-xs text-muted-foreground">Real-time status, Escrow security & Delivery OTPs</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/profile")}
              className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" /> Profile Orders
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          
          {/* Escrow Buyer Protection Info Box */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white rounded-3xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Buyer Protection Guarantee</h3>
                <p className="text-xs text-blue-100 mt-0.5 max-w-lg leading-relaxed">
                  Your payments are safely locked in Escrow. Give your 6-digit Secret OTP to the delivery rider only after inspecting your parcel at your doorstep.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 border-b border-border pb-3">
            {[
              { id: "active", label: "Active & In-Transit Orders (1)" },
              { id: "completed", label: "Completed Orders (1)" },
              { id: "all", label: "All Orders (2)" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeFilter === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
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
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
                  <div className="flex items-center gap-3">
                    <img src={order.image} alt={order.item} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-sm">{order.id}</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          {order.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mt-0.5">{order.item}</h4>
                      <p className="text-xs text-slate-500">{order.seller} • <span className="font-extrabold text-emerald-600">{order.price}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrderModal(order)}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" /> Track & Security Details
                    </button>
                  </div>
                </div>

                {/* Order Body Details */}
                <div className="p-4 sm:p-5 space-y-4 text-xs">
                  
                  {/* Escrow & OTP Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Escrow Status Box */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
                      <Lock className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Escrow Status</span>
                        <span className="font-extrabold text-emerald-900 text-xs">{order.escrowStatus}</span>
                      </div>
                    </div>

                    {/* Buyer Secret Delivery OTP Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Your Delivery OTP</span>
                        <span className="text-[11px] text-blue-900">Give to rider at delivery</span>
                      </div>
                      <span className="px-3 py-1 rounded-xl text-base font-mono font-extrabold bg-blue-600 text-white shadow-xs">
                        {order.otp}
                      </span>
                    </div>

                  </div>

                  {/* Tracking Timeline */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-blue-600" /> Package Tracking Timeline
                    </h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                      {order.timeline.map((step, idx) => (
                        <div key={idx} className="flex flex-col space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-1.5">
                            {step.done ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
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
