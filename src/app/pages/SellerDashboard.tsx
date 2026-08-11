import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Store, Plus, Edit, Trash2, Package, DollarSign, ShoppingCart, TrendingUp,
  Eye, Star, Search, Filter, CheckCircle2, AlertCircle, Clock, MapPin,
  Phone, Mail, Globe, Image as ImageIcon, ChevronRight, Settings, BarChart2,
  X, Check, ShieldCheck, ArrowUpRight, ArrowDownRight, MessageSquare, ExternalLink,
  Tag, RefreshCw, Upload, ToggleLeft, ToggleRight
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "settings">("overview");
  const [products, setProducts] = useState<Product[]>(INITIAL_SELLER_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Add / Edit Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formOfferTag, setFormOfferTag] = useState("");
  const [formCategory, setFormCategory] = useState("Used Furniture");
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

  // Open modal for creating product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormOfferTag("");
    setFormCategory("Used Furniture");
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
    setFormOfferTag(p.offerTag || "");
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
    const parsedOriginalPrice = formOriginalPrice ? parseFloat(formOriginalPrice) : undefined;

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        name: formName,
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        offerTag: formOfferTag || undefined,
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
        offerTag: formOfferTag || undefined,
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
    <AppLayout>
      <div className="min-h-screen bg-slate-50/50 pb-16">
        
        {/* Top SaaS Header Banner */}
        <div className="bg-white border-b border-border shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              
              {/* Shop Profile Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white flex-shrink-0">
                  🏪
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{shopName}</h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Seller SaaS
                    </span>
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
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-4 h-4 text-slate-500" /> Public Storefront View
                </button>
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold shadow-sm hover:opacity-95 transition flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
                >
                  <Plus className="w-4 h-4" /> Add New Product
                </button>
              </div>

            </div>

            {/* Nav Tabs */}
            <div className="flex items-center gap-2 mt-6 border-t border-slate-100 pt-4 overflow-x-auto">
              {[
                { id: "overview", label: "Dashboard Overview", icon: BarChart2 },
                { id: "products", label: `Product Catalog (${products.length})`, icon: Package },
                { id: "orders", label: "Customer Orders (14)", icon: ShoppingCart },
                { id: "settings", label: "Store Settings", icon: Settings },
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                      active
                        ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-blue-600" : "text-slate-400"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dashboard Main Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Sales Revenue</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><DollarSign className="w-4 h-4" /></div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    <span className="ml-2 text-xs font-semibold text-emerald-600 flex items-inline gap-0.5"><ArrowUpRight className="w-3 h-3 inline" /> +14.2%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Updated in real-time from orders</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Orders Completed</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><ShoppingCart className="w-4 h-4" /></div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-slate-900">{totalSalesCount}</span>
                    <span className="ml-2 text-xs font-semibold text-blue-600 flex items-inline gap-0.5"><ArrowUpRight className="w-3 h-3 inline" /> +8.5%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Across all product categories</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Active Listings</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Package className="w-4 h-4" /></div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-slate-900">{products.filter(p => p.status === "active").length}</span>
                    <span className="ml-2 text-xs font-medium text-slate-500">({products.length} total)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">In stock & visible to buyers</p>
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
                  <p className="text-[11px] text-slate-400 mt-1">Top-Rated Immigrant Seller</p>
                </div>
              </div>

              {/* Top Selling Products List */}
              <div className="bg-white rounded-2xl border border-border shadow-xs p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Top Selling Products</h2>
                    <p className="text-xs text-slate-500">Your most popular items listed on Marketplace</p>
                  </div>
                  <button onClick={() => setActiveTab("products")} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                    Manage All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.slice(0, 3).map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/50">
                      <img src={p.image} alt={p.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{p.category}</span>
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
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Category dropdown filter */}
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="Used Furniture">Used Furniture</option>
                    <option value="Grocery & Food">Grocery & Food</option>
                  </select>

                </div>

                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold shadow-sm hover:opacity-95 transition flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Product details</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Price</th>
                        <th className="py-3.5 px-4">Stock</th>
                        <th className="py-3.5 px-4">Condition</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          
                          {/* Name & Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3 min-w-[200px]">
                              <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
                              <div>
                                <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</h3>
                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{p.description}</p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                              {p.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-extrabold text-emerald-600 text-sm">${p.price.toFixed(2)}</span>
                                {p.originalPrice && p.originalPrice > p.price && (
                                  <span className="text-xs text-rose-500 font-bold line-through tracking-tight">${p.originalPrice.toFixed(2)}</span>
                                )}
                              </div>
                              {p.offerTag && (
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-700 w-max border border-rose-200">
                                  🔥 {p.offerTag}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Stock */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`font-semibold ${p.stock > 0 ? "text-slate-700" : "text-rose-600"}`}>
                              {p.stock} units
                            </span>
                          </td>

                          {/* Condition */}
                          <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-600">
                            {p.condition}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleStatus(p.id)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 transition ${
                                p.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${p.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                              {p.status === "active" ? "Active" : "Out of Stock"}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
                                title="Edit Product"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                                title="Remove Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}

                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            No products found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-2xl border border-border shadow-xs p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Customer Orders & Inquiries</h2>
              <div className="space-y-3">
                {[
                  { id: "ORD-902", buyer: "Kamrul Islam", item: "Solid Oak Dining Table", price: "$350.00", date: "Today, 4:15 PM", status: "Pending Pickup" },
                  { id: "ORD-901", buyer: "Sofia Rahman", item: "Deshi Basmati Rice 5kg x 2", price: "$37.00", date: "Today, 1:20 PM", status: "Completed" },
                  { id: "ORD-899", buyer: "Tariqul Hasan", item: "IKEA Sectional Sofa", price: "$280.00", date: "Yesterday", status: "Completed" },
                ].map(order => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/50 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {order.buyer[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{order.buyer}</span>
                          <span className="text-xs text-slate-400">({order.id})</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{order.item} • <span className="font-bold text-emerald-600">{order.price}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.status}
                      </span>
                      <button onClick={() => navigate("/messages")} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-100 transition flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> Chat Buyer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl border border-border shadow-xs p-6 max-w-3xl">
              <h2 className="text-base font-bold text-slate-900 mb-4">Shop Settings & Storefront Configuration</h2>
              
              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Shop Name</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Store Bio & Description</label>
                  <textarea
                    rows={3}
                    value={shopDescription}
                    onChange={e => setShopDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={shopPhone}
                      onChange={e => setShopPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Physical Store Address</label>
                    <input
                      type="text"
                      value={shopAddress}
                      onChange={e => setShopAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={() => alert("Shop settings updated successfully!")}
                  className="px-5 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 transition"
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
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-900 text-base">
                  {editingProduct ? "Edit Product Listing" : "Add New Product"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs sm:text-sm">
                
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solid Wood Dining Table"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Offer Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="99.99"
                      value={formPrice}
                      onChange={e => setFormPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Original Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="120.00 (Optional)"
                      value={formOriginalPrice}
                      onChange={e => setFormOriginalPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      placeholder="1"
                      value={formStock}
                      onChange={e => setFormStock(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Offer Tag / Discount Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. 20% OFF, HOT DEAL, SAVE $20"
                    value={formOfferTag}
                    onChange={e => setFormOfferTag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="Used Furniture">Used Furniture</option>
                      <option value="Grocery & Food">Grocery & Food</option>
                      <option value="Electronics & Goods">Electronics & Goods</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Item Condition</label>
                    <select
                      value={formCondition}
                      onChange={e => setFormCondition(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="Gently Used">Gently Used</option>
                      <option value="New">Brand New</option>
                      <option value="Refurbished">Refurbished</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formImage}
                    onChange={e => setFormImage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe item condition, measurements, pickup/delivery details..."
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-white font-semibold shadow-sm hover:opacity-95 transition"
                    style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
                  >
                    {editingProduct ? "Update Product" : "Publish Product"}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
