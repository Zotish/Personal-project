import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Store, Star, MapPin, Phone, Mail, MessageSquare, Share2, ShieldCheck,
  Search, Filter, ShoppingBag, ShoppingCart, Check, ChevronRight, X,
  Clock, ArrowLeft, Heart, CheckCircle2, Truck, Plus, Minus
} from "lucide-react";
import { INITIAL_SELLER_PRODUCTS, Product } from "./SellerDashboard";
import { DeliverySecurityModal } from "../components/DeliverySecurityModal";
import { ProductCard } from "../components/ProductCard";

export function SellerProfile() {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [products] = useState<Product[]>(INITIAL_SELLER_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [savedShop, setSavedShop] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [activeQuickView, setActiveQuickView] = useState<Product | null>(null);

  // Shop details
  const shop = {
    id: sellerId || "28",
    name: "Gulshan Premium Furniture & Resale Mart",
    owner: "Tanvir Rahman",
    verified: true,
    rating: 4.8,
    reviewsCount: 312,
    address: "Road 11, Gulshan-1, Dhaka",
    phone: "+880 1711-424998",
    hours: "Open • 8:00 AM - 9:00 PM",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000&h=400&fit=crop",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    bio: "Certified immigrant-friendly seller offering pre-owned solid wood furniture, second-hand home setups, and authentic Bangladeshi groceries.",
    joinedDate: "Member since Jan 2024",
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (id: number, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === id) {
            const nextQty = item.qty + delta;
            return nextQty > 0 ? { ...item, qty: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; qty: number }[];
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50/50 pb-20">
        
        {/* Banner Cover */}
        <div className="relative h-48 sm:h-64 lg:h-80 w-full overflow-hidden bg-slate-900">
          <img src={shop.image} alt={shop.name} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-white transition shadow-sm flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Map / Feed
          </button>
        </div>

        {/* Store Header Info Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-lg">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Shop Avatar */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={shop.avatar} alt={shop.name} className="w-full h-full object-cover" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">{shop.name}</h1>
                    {shop.verified && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Business
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">{shop.bio}</p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {shop.rating} ({shop.reviewsCount} reviews)
                    </span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {shop.address}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {shop.hours}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button
                  onClick={() => setSavedShop(!savedShop)}
                  className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                    savedShop ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${savedShop ? "fill-rose-500 text-rose-500" : ""}`} />
                  {savedShop ? "Saved Store" : "Save Store"}
                </button>

                <button
                  onClick={() => navigate("/messages")}
                  className="px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold shadow-sm hover:opacity-95 transition flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
                >
                  <MessageSquare className="w-4 h-4" /> Contact Seller
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Main Store Products Catalog */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products in this store..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Items" },
                { id: "Used Furniture", label: "🪑 Used Furniture" },
                { id: "Grocery & Food", label: "🛒 Groceries & Food" },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

        </div>

        {/* Floating Cart Button */}
        {cartItemCount > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 px-5 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl hover:bg-slate-800 transition flex items-center gap-3 border border-slate-700 active:scale-95 cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#C04A22] text-white text-[11px] font-extrabold flex items-center justify-center">
                {cartItemCount}
              </span>
            </div>
            <span>View Cart (${cartTotal.toFixed(2)})</span>
          </button>
        )}

        {/* Shopping Cart Drawer (Ends above mobile bottom navbar) */}
        {isCartOpen && (
          <div className="fixed top-0 bottom-16 lg:bottom-0 left-0 right-0 z-40 bg-slate-900/60 backdrop-blur-xs flex justify-end">
            <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
              
              {/* Drawer Header */}
              <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#C04A22]" />
                  <h3 className="font-bold text-slate-900 text-base">Your Cart ({cartItemCount})</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition shadow-2xs">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-200" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                      <span className="text-xs font-extrabold text-[#C04A22]">${(item.product.price * item.qty).toFixed(2)}</span>
                      
                      {/* Quantity Selector: Minus / Qty / Plus */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white shadow-2xs overflow-hidden">
                          <button
                            onClick={() => handleUpdateQty(item.product.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer active:scale-95 text-xs font-bold"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800 select-none">{item.qty}</span>
                          <button
                            onClick={() => handleUpdateQty(item.product.id, 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer active:scale-95 text-xs font-bold"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-400">(${item.product.price.toFixed(2)} ea)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.product.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer self-start"
                      title="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Your cart is currently empty.
                  </div>
                )}
              </div>

              {/* Drawer Footer & Checkout (Visible across all devices with safe padding) */}
              {cart.length > 0 && (
                <div className="p-4 sm:p-6 pb-6 sm:pb-6 border-t border-slate-100 bg-white space-y-3 shadow-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-semibold">Subtotal</span>
                    <span className="text-xl font-extrabold text-slate-900">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsSecurityModalOpen(true);
                      setCart([]);
                    }}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    style={{ background: "linear-gradient(135deg, #C04A22 0%, #8C3015 100%)" }}
                  >
                    <ShieldCheck className="w-4.5 h-4.5" />
                    <span>Place Order & Escrow Lock</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ESCROW & DELIVERY SECURITY VOIP MODAL (BUYER PORTAL VIEW) */}
        <DeliverySecurityModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
          role="buyer"
          orderId="ORD-902"
          itemTitle="Solid Oak Dining Table with 6 Chairs"
          totalPrice={`$${cartTotal > 0 ? cartTotal.toFixed(2) : "350.00"}`}
        />

      </div>
    </AppLayout>
  );
}
