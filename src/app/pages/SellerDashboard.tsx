import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Store, Plus, Edit, Trash2, Package, DollarSign, ShoppingCart, TrendingUp,
  Eye, Star, Search, Filter, CheckCircle2, AlertCircle, Clock, MapPin,
  Phone, Mail, Globe, Image as ImageIcon, ChevronRight, Settings, BarChart2,
  X, Check, ShieldCheck, ArrowUpRight, ArrowDownRight, MessageSquare, ExternalLink,
  Tag, RefreshCw, Upload, ToggleLeft, ToggleRight, Lock, Key, LayoutGrid, List
} from "lucide-react";
import { DeliverySecurityModal } from "../components/DeliverySecurityModal";
import { ProductCard } from "../components/ProductCard";

export type Product = {
  id: number;
  name: string;
  price: number;              // Selling / Discounted Price
  originalPrice?: number;     // Original Price before discount
  offerTag?: string;          // e.g. "20% OFF", "HOT DEAL", "SPECIAL DISCOUNT"
  category: string;
  condition: "New" | "Gently Used" | "Refurbished";
  stock: number;
  salesCount: number;
  image: string;
  description: string;
  status: "active" | "draft" | "out_of_stock";
  createdAt: string;
};

export const INITIAL_SELLER_PRODUCTS: Product[] = [
  {
    id: 101,
    name: "Solid Oak Dining Table with 6 Chairs",
    price: 350,
    originalPrice: 450,
    offerTag: "22% OFF",
    category: "Used Furniture",
    condition: "Gently Used",
    stock: 1,
    salesCount: 4,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&h=300&fit=crop",
    description: "Gently used solid oak dining set in excellent condition. Scratch-resistant polish. Perfect for family dining.",
    status: "active",
    createdAt: "2026-08-01",
  },
  {
    id: 102,
    name: "IKEA Sectional Sofa - Charcoal Gray",
    price: 280,
    originalPrice: 360,
    offerTag: "20% OFF",
    category: "Used Furniture",
    condition: "Gently Used",
    stock: 2,
    salesCount: 12,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=300&fit=crop",
    description: "Washable fabric covers, pet-free home. Super comfortable 4-seater modular sofa.",
    status: "active",
    createdAt: "2026-08-03",
  },
  {
    id: 103,
    name: "Deshi Basmati Rice 5kg Pack",
    price: 18.50,
    originalPrice: 22.00,
    offerTag: "SPECIAL DEAL",
    category: "Grocery & Food",
    condition: "New",
    stock: 45,
    salesCount: 189,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=300&fit=crop",
    description: "Premium long-grain aromatic Basmati rice imported directly from Bangladesh.",
    status: "active",
    createdAt: "2026-08-05",
  },
  {
    id: 104,
    name: "Ergonomic Office Chair with Lumbar Support",
    price: 95,
    originalPrice: 130,
    offerTag: "SAVE $35",
    category: "Used Furniture",
    condition: "Gently Used",
    stock: 5,
    salesCount: 8,
    image: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=500&h=300&fit=crop",
    description: "Adjustable height, breathable mesh back, 360-degree swivel wheels.",
    status: "active",
    createdAt: "2026-08-08",
  },
  {
    id: 105,
    name: "Fresh Halal Mutton Meat (Per KG)",
    price: 16.99,
    category: "Grocery & Food",
    condition: "New",
    stock: 20,
    salesCount: 94,
    image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&h=300&fit=crop",
    description: "100% Certified Zabiha Halal fresh tender mutton meat cut to order.",
    status: "active",
    createdAt: "2026-08-10",
  },
];

export function SellerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "messages" | "settings">("overview");
  const [products, setProducts] = useState<Product[]>(INITIAL_SELLER_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Add / Edit Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formOfferTag, setFormOfferTag] = useState("none");
  const [formCategory, setFormCategory] = useState("USED FURNITURE");
  const [formCondition, setFormCondition] = useState<"New" | "Gently Used" | "Refurbished">("Gently Used");
  const [formStock, setFormStock] = useState("1");
  const [formImage, setFormImage] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Shop Info State
  const [shopName, setShopName] = useState("Gulshan Resale & Grocery Mart");
  const [shopDescription, setShopDescription] = useState("Leading supplier of authentic groceries, halal food, and pre-owned household furniture for newcomer families in Dhaka & NYC.");
  const [shopPhone, setShopPhone] = useState("+880 1711-424998");
  const [shopAddress, setShopAddress] = useState("Road 11, Gulshan-1, Dhaka, Bangladesh");
  const [storeStatus, setStoreStatus] = useState<"open" | "busy" | "closed">("open");

  // Dynamic Conversations State
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Kamrul Islam",
      initials: "KI",
      time: "4:15 PM",
      unread: true,
      item: "Solid Oak Dining Table ($350.00)",
      status: "Online",
      messages: [
        { id: 101, text: "Hello! I placed order #ORD-902 for the Solid Oak Dining Table. Is pickup available today before 6 PM?", time: "4:15 PM", sender: "buyer" },
        { id: 102, text: "Yes, pickup is available today. Feel free to come by!", time: "4:18 PM", sender: "seller" }
      ]
    },
    {
      id: 2,
      name: "Sofia Rahman",
      initials: "SR",
      time: "1:20 PM",
      unread: false,
      item: "Deshi Basmati Rice 5kg ($37.00)",
      status: "Online",
      messages: [
        { id: 201, text: "Hi! Do you have extra bags of Deshi Basmati Rice 5kg pack in stock?", time: "1:15 PM", sender: "buyer" },
        { id: 202, text: "Thank you for the quick delivery!", time: "1:20 PM", sender: "buyer" }
      ]
    },
    {
      id: 3,
      name: "Tariqul Hasan",
      initials: "TH",
      time: "Yesterday",
      unread: false,
      item: "IKEA Sectional Sofa ($280.00)",
      status: "Offline",
      messages: [
        { id: 301, text: "Can I inspect the sofa condition before making final payment?", time: "Yesterday, 3:45 PM", sender: "buyer" },
        { id: 302, text: "Sure! You can test it at our store anytime between 10 AM and 8 PM.", time: "Yesterday, 4:00 PM", sender: "seller" }
      ]
    }
  ]);

  const [selectedChatId, setSelectedChatId] = useState<number>(1);
  const [replyText, setReplyText] = useState("");

  const handleSelectChat = (id: number) => {
    setSelectedChatId(id);
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, unread: false } : c))
    );
  };

  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim()) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setConversations(prev =>
      prev.map(c => {
        if (c.id === selectedChatId) {
          return {
            ...c,
            messages: [
              ...c.messages,
              { id: Date.now(), text: replyText.trim(), time: nowTime, sender: "seller" }
            ]
          };
        }
        return c;
      })
    );
    setReplyText("");
  };

  const activeChat = conversations.find(c => c.id === selectedChatId) || conversations[0];
  const unreadCount = conversations.filter(c => c.unread).length;

  // File Reader for Image Uploads
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormImage(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open modal for creating product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormOfferTag("none");
    setFormCategory("USED FURNITURE");
    setFormCondition("Gently Used");
    setFormStock("1");
    setFormImage("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=300&fit=crop");
    setFormDescription("");
    setIsModalOpen(true);
  };

  // Open modal for editing product
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormPrice(p.price.toString());
    setFormOriginalPrice(p.originalPrice ? p.originalPrice.toString() : "");
    setFormOfferTag(p.offerTag || "none");
    setFormCategory(p.category);
    setFormCondition(p.condition);
    setFormStock(p.stock.toString());
    setFormImage(p.image);
    setFormDescription(p.description);
    setIsModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) return;

    const parsedPrice = parseFloat(formPrice) || 0;
    const hasOffer = formOfferTag !== "none" && formOfferTag !== "";
    const selectedOffer = hasOffer ? formOfferTag : undefined;
    const parsedOriginalPrice = hasOffer
      ? (formOriginalPrice ? parseFloat(formOriginalPrice) : parsedPrice * 1.25)
      : undefined;

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        name: formName,
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        offerTag: selectedOffer,
        category: formCategory,
        condition: formCondition,
        stock: parseInt(formStock) || 0,
        image: formImage || p.image,
        description: formDescription,
      } : p));
    } else {
      const newProduct: Product = {
        id: Date.now(),
        name: formName,
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        offerTag: selectedOffer,
        category: formCategory,
        condition: formCondition,
        stock: parseInt(formStock) || 1,
        salesCount: 0,
        image: formImage || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=300&fit=crop",
        description: formDescription,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setProducts(prev => [newProduct, ...prev]);
    }

    setIsModalOpen(false);
  };

  // In-place Product Update from Card
  const handleUpdateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  // Delete Product
  const handleDeleteProduct = (id: number) => {
    if (confirm("Are you sure you want to delete this product listing?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Toggle Out of Stock
  const handleToggleStatus = (id: number) => {
    setProducts(prev => prev.map(p => p.id === id ? {
      ...p,
      status: p.status === "active" ? "out_of_stock" : "active"
    } : p));
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.salesCount), 0);
  const totalSalesCount = products.reduce((sum, p) => sum + p.salesCount, 0);

  return (
    <AppLayout variant="seller" activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-6">
        
        {/* Top SaaS Header Banner Card - Flush attached to top edge */}
        <div className="bg-white rounded-b-2xl border-b border-x border-border shadow-xs p-5 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Shop Profile Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)" }}>
                🏪
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{shopName}</h1>
                  <div
                    className="w-5 h-5 rounded-full text-white flex items-center justify-center shadow-xs flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)" }}
                    title="Verified Seller"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {shopAddress}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {shopPhone}</span>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => navigate("/seller/28")}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-slate-500" /> Public View
              </button>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold shadow-sm hover:opacity-95 transition flex items-center gap-2 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)" }}
              >
                <Plus className="w-4 h-4" /> Add Products
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Main Body */}
        <div>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Sales Revenue</span>
                    <DollarSign className="w-5 h-5 text-[#D85A30]" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    <span className="ml-2 text-xs font-semibold text-emerald-600 flex items-inline gap-0.5"><ArrowUpRight className="w-3 h-3 inline" /> +14.2%</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Orders Completed</span>
                    <ShoppingCart className="w-5 h-5 text-[#D85A30]" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-slate-900">{totalSalesCount}</span>
                    <span className="ml-2 text-xs font-semibold text-[#D85A30] flex items-inline gap-0.5"><ArrowUpRight className="w-3 h-3 inline" /> +8.5%</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Active Listings</span>
                    <Package className="w-5 h-5 text-[#D85A30]" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-slate-900">{products.filter(p => p.status === "active").length}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Store Rating</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Star className="w-4 h-4 fill-amber-400" /></div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="text-2xl font-bold text-slate-900">4.9</span>
                    <div className="flex text-amber-400">★★★★★</div>
                    <span className="text-xs text-slate-400">(312 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Top Selling Products List */}
              <div className="bg-white rounded-2xl border border-border shadow-xs p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Top Selling Products</h2>
                  </div>
                  <button onClick={() => setActiveTab("products")} className="text-xs font-semibold text-[#D85A30] hover:underline flex items-center gap-1">
                    Manage All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.slice(0, 3).map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/50">
                      <img src={p.image} alt={p.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#D85A30] uppercase tracking-wider">{p.category}</span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-bold text-emerald-600">${p.price}</span>
                          <span className="text-[11px] text-slate-500 font-medium">{p.salesCount} sold</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG (SaaS CORE: ADD / UPDATE / REMOVE) */}
          {activeTab === "products" && (
            <div className="space-y-6">
              
              {/* Control Bar: Search, Category Filter & Add Button */}
              <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
                  
                  {/* Search bar */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#D85A30]"
                    />
                  </div>

                  {/* Category dropdown filter */}
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="USED FURNITURE">Used Furniture</option>
                    <option value="GROCERY & FOOD">Grocery & Food</option>
                  </select>

                </div>

                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold shadow-sm hover:opacity-95 transition flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)" }}
                >
                  <Plus className="w-4 h-4" /> Add Products
                </button>
              </div>

              {/* PRODUCTS DISPLAY: PRODUCT CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSellerView={true}
                    onUpdateProduct={handleUpdateProduct}
                    onDelete={handleDeleteProduct}
                  />
                ))}

                {filteredProducts.length === 0 && (
                  <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm text-slate-600">No products found matching your search.</p>
                    <p className="text-xs text-slate-400 mt-1">Click "Add New Product" to list an item in your store.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-2xl border border-border shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Customer Orders</h2>
                </div>
                <button
                  onClick={() => setIsSecurityModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#D85A30]/10 text-[#D85A30] border border-[#D85A30]/30 text-xs font-bold flex items-center gap-1.5 hover:bg-[#D85A30]/20 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-[#D85A30]" /> Security & Proxy Call Center
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { id: "ORD-902", buyer: "Kamrul Islam", item: "Solid Oak Dining Table", price: "$350.00", date: "Today, 4:15 PM", status: "Pending Pickup", courier: "Pathao Express #R-902", otp: "8942" },
                  { id: "ORD-901", buyer: "Sofia Rahman", item: "Deshi Basmati Rice 5kg x 2", price: "$37.00", date: "Today, 1:20 PM", status: "Completed", courier: "Steadfast Courier", otp: "7719" },
                  { id: "ORD-899", buyer: "Tariqul Hasan", item: "IKEA Sectional Sofa", price: "$280.00", date: "Yesterday", status: "Completed", courier: "RedX Logistics", otp: "3104" },
                ].map(order => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/50 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D85A30]/10 text-[#D85A30] flex items-center justify-center font-bold text-sm">
                        {order.buyer[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{order.buyer}</span>
                          <span className="text-xs text-slate-400">({order.id})</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            🔒 Escrow Secured
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{order.item} • <span className="font-bold text-emerald-600">{order.price}</span></p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Courier: <strong>{order.courier}</strong></span>
                          <span>Pickup OTP: <code className="bg-slate-200 px-1 rounded font-bold text-slate-800">{order.otp}</code></span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 flex-wrap">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.status}
                      </span>
                      <button
                        onClick={() => setIsSecurityModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-[#D85A30] text-white text-xs font-bold hover:bg-[#c24f28] transition flex items-center gap-1 shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Logistics Portal
                      </button>
                      <button onClick={() => setActiveTab("messages")} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-100 transition flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> Chat Buyer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BUYER MESSAGES & CUSTOMER INQUIRIES */}
          {activeTab === "messages" && (
            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Messages</h2>
                </div>
                {unreadCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-[#D85A30]/10 text-[#D85A30] border border-[#D85A30]/20 font-bold text-xs">
                    {unreadCount} Unread Chat{unreadCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 min-h-[450px]">
                
                {/* Conversations List */}
                <div className="p-3 space-y-2 bg-slate-50/50">
                  {conversations.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        chat.id === selectedChatId
                          ? "bg-[#D85A30]/10 border-[#D85A30] shadow-xs"
                          : chat.unread
                          ? "bg-[#D85A30]/5 border-[#D85A30]/40"
                          : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {chat.unread && (
                          <span className="w-2 h-2 rounded-full bg-[#D85A30] flex-shrink-0 animate-pulse" />
                        )}
                        <span className={`text-xs ${chat.id === selectedChatId || chat.unread ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
                          {chat.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{chat.time}</span>
                    </div>
                  ))}
                </div>

                {/* Active Chat Screen */}
                <div className="md:col-span-2 p-5 flex flex-col justify-between space-y-4">
                  
                  {/* Chat Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#D85A30] text-white font-bold flex items-center justify-center text-xs">
                        {activeChat.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{activeChat.name}</h4>
                        <span className="text-[11px] text-slate-500">Inquiring about: <strong>{activeChat.item}</strong></span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      activeChat.status === "Online" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    }`}>
                      {activeChat.status}
                    </span>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2">
                    {activeChat.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-2xl max-w-sm text-xs space-y-1 ${
                          msg.sender === "seller"
                            ? "bg-[#D85A30] text-white ml-auto"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span className={`text-[10px] block text-right ${
                          msg.sender === "seller" ? "text-orange-100" : "text-slate-400"
                        }`}>{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Input Box */}
                  <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${activeChat.name}...`}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D85A30]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-[#D85A30] hover:bg-[#c24f28] text-white text-xs font-bold transition active:scale-95"
                    >
                      Send Reply
                    </button>
                  </form>

                </div>

              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl border border-border shadow-xs p-6 max-w-3xl">
              
              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Shop Name</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#D85A30]"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Store Bio & Description</label>
                  <textarea
                    rows={3}
                    value={shopDescription}
                    onChange={e => setShopDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#D85A30]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={shopPhone}
                      onChange={e => setShopPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#D85A30]"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Physical Store Address</label>
                    <input
                      type="text"
                      value={shopAddress}
                      onChange={e => setShopAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#D85A30]"
                    />
                  </div>
                </div>

                <button
                  onClick={() => alert("Shop settings updated successfully!")}
                  className="px-5 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm bg-[#D85A30] hover:bg-[#c24f28] transition"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

        </div>

        {/* CREATE / EDIT PRODUCT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-border w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Ultra-Simple Add Product Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📷</span>
                  <h3 className="font-bold text-slate-900 text-base">Add New Product</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Minimal Form Body */}
              <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs sm:text-sm">
                
                {/* 1. Photo Upload (Device or Camera) */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-900 block">Product Photo (From Device or Camera) *</label>
                  
                  <label className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#D85A30] bg-slate-50 hover:bg-[#D85A30]/5 flex flex-col items-center justify-center cursor-pointer transition p-4 text-center">
                    <Upload className="w-7 h-7 text-[#D85A30] mb-1" />
                    <span className="font-bold text-slate-800 text-xs">Click to Upload Photo / Take Camera Picture</span>
                    <span className="text-[11px] text-slate-400">Supports JPG, PNG, WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Thumbnail Preview */}
                  {formImage && (
                    <div className="flex items-center gap-3 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <img src={formImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-emerald-300" />
                      <div>
                        <span className="text-xs font-bold text-emerald-800 block">✓ Photo Selected & Ready</span>
                        <span className="text-[10px] text-emerald-600">Will be displayed on product card</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Product Name */}
                <div>
                  <label className="font-bold text-slate-900 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solid Oak Dining Table with 6 Chairs"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-[#D85A30]"
                  />
                </div>

                {/* 3. Product Price */}
                <div>
                  <label className="font-bold text-slate-900 block mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 350.00"
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold text-base focus:outline-none focus:border-[#D85A30]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-white font-bold shadow-md hover:opacity-95 transition"
                    style={{ background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)" }}
                  >
                    Publish Product
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* LOGISTICS ANTI-FRAUD & PROXY CALL CENTER MODAL (SELLER PORTAL VIEW) */}
        <DeliverySecurityModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
          role="seller"
          orderId="ORD-902"
          itemTitle="Solid Oak Dining Table with 6 Chairs"
          totalPrice="$350.00"
        />

      </div>
    </AppLayout>
  );
}
