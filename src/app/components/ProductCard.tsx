import React, { useState } from "react";
import { ShoppingCart, Trash2, Check, ChevronDown } from "lucide-react";
import { Product } from "../pages/SellerDashboard";

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  isSellerView?: boolean;
  onUpdateProduct?: (updatedProduct: Product) => void;
  onDelete?: (id: number) => void;
  onAddToCart?: (product: Product) => void;
}

// Deep Coral Vector Writing Pen / Hand Icon Component
function DeepCoralHandPen({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8C3015"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
    >
      <title>Click to edit field</title>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" fill="#8C3015" fillOpacity="0.25" />
    </svg>
  );
}


export function calculateOfferPrice(mainPrice: number, offerTag?: string): {
  hasOffer: boolean;
  offerPrice: number;
  mainPrice: number;
} {
  const hasOffer = Boolean(
    offerTag &&
    offerTag.toLowerCase() !== "none" &&
    offerTag.toLowerCase() !== "no offer"
  );

  if (!hasOffer || !offerTag) {
    return {
      hasOffer: false,
      offerPrice: mainPrice,
      mainPrice: mainPrice,
    };
  }

  let calculatedOfferPrice = mainPrice;

  // Percentage discount: e.g. "20% OFF", "22% OFF", "50% OFF", "5% OFF"
  const percentMatch = offerTag.match(/(\d+)%/);
  if (percentMatch && percentMatch[1]) {
    const discountPercent = parseInt(percentMatch[1], 10);
    if (discountPercent > 0 && discountPercent < 100) {
      calculatedOfferPrice = mainPrice * (1 - discountPercent / 100);
    }
  }
  // Dollar discount: e.g. "SAVE $35"
  else {
    const saveMatch = offerTag.match(/SAVE \$?(\d+)/i);
    if (saveMatch && saveMatch[1]) {
      const saveAmount = parseFloat(saveMatch[1]);
      calculatedOfferPrice = Math.max(0, mainPrice - saveAmount);
    } else if (offerTag.toUpperCase().includes("SPECIAL")) {
      calculatedOfferPrice = mainPrice * 0.80;
    }
  }

  return {
    hasOffer: true,
    offerPrice: Math.round(calculatedOfferPrice * 100) / 100,
    mainPrice: Math.round(mainPrice * 100) / 100,
  };
}

export function ProductCard({
  product,
  isSellerView = false,
  onUpdateProduct,
  onDelete,
  onAddToCart,
}: ProductCardProps) {
  // Inline Edit States for Seller View
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  const [titleInput, setTitleInput] = useState(product.name);
  const [descInput, setDescInput] = useState(product.description || "");
  const [priceInput, setPriceInput] = useState(product.price.toString());

  const priceDetails = calculateOfferPrice(product.price, product.offerTag);
  const hasOffer = priceDetails.hasOffer;

  const triggerUpdate = (fields: Partial<Product>) => {
    if (onUpdateProduct) {
      onUpdateProduct({ ...product, ...fields });
    }
  };

  const handleOfferChange = (newOffer: string) => {
    const isNoOffer = newOffer === "none" || newOffer === "";
    const updatedOfferTag = isNoOffer ? undefined : newOffer;
    triggerUpdate({ offerTag: updatedOfferTag });
  };

  const handleCategoryChange = (newCategory: string) => {
    triggerUpdate({ category: newCategory });
  };

  const handleConditionChange = (newCondition: "New" | "Gently Used" | "Refurbished") => {
    triggerUpdate({ condition: newCondition });
  };

  const handleSavePrice = () => {
    const parsed = parseFloat(priceInput);
    if (!isNaN(parsed) && parsed > 0) {
      triggerUpdate({ price: parsed });
    }
    setIsEditingPrice(false);
  };

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      triggerUpdate({ name: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDesc = () => {
    triggerUpdate({ description: descInput.trim() });
    setIsEditingDesc(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group relative">
      
      {/* Top Image Section with Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=350&fit=crop";
          }}
        />

        {/* Top Badges Bar: Condition (Left) & Offer (Right) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-1.5 pointer-events-none">
          
          {/* CONDITION PILL BADGE (Top Left) */}
          <div className="pointer-events-auto max-w-[50%] min-w-0">
            {isSellerView ? (
              <div className="relative inline-block w-full">
                <select
                  value={product.condition || "Gently Used"}
                  onChange={(e) => handleConditionChange(e.target.value as any)}
                  className="w-full px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-slate-800 shadow-sm border border-slate-200/60 backdrop-blur-xs cursor-pointer outline-none appearance-none pr-5 hover:bg-white transition truncate"
                  title="Click to change condition"
                >
                  <option value="Gently Used">Gently Used</option>
                  <option value="New">New</option>
                  <option value="Refurbished">Refurbished</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-slate-800 shadow-sm border border-slate-200/60 backdrop-blur-xs block truncate">
                {product.condition || "Gently Used"}
              </span>
            )}
          </div>

          {/* OFFER / DISCOUNT PILL BADGE (Top Right) */}
          <div className="pointer-events-auto max-w-[50%] min-w-0">
            {isSellerView ? (
              <div className="relative inline-block w-full">
                <div className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-md flex items-center justify-between gap-1 border transition ${
                  hasOffer
                    ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white border-white/40"
                    : "bg-slate-900/80 text-white border-slate-700 hover:bg-slate-900"
                }`}>
                  <span className="truncate">{hasOffer ? `🔥 ${product.offerTag}` : "+ Offer"}</span>
                  <ChevronDown className="w-2.5 h-2.5 flex-shrink-0 opacity-80" />
                </div>

                <select
                  value={product.offerTag || "none"}
                  onChange={(e) => handleOfferChange(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[11px] font-bold"
                  title="Click to select offer discount"
                >
                  <option value="none">No Offer (Regular Price)</option>
                  <option value="5% OFF">🔥 5% OFF</option>
                  <option value="10% OFF">🔥 10% OFF</option>
                  <option value="15% OFF">🔥 15% OFF</option>
                  <option value="20% OFF">🔥 20% OFF</option>
                  <option value="22% OFF">🔥 22% OFF</option>
                  <option value="25% OFF">🔥 25% OFF</option>
                  <option value="30% OFF">🔥 30% OFF</option>
                  <option value="40% OFF">🔥 40% OFF</option>
                  <option value="50% OFF">🔥 50% OFF</option>
                  <option value="60% OFF">🔥 60% OFF</option>
                  <option value="70% OFF">🔥 70% OFF</option>
                  <option value="80% OFF">🔥 80% OFF</option>
                  <option value="SPECIAL DEAL">🔥 SPECIAL DEAL</option>
                  <option value="SAVE $35">🔥 SAVE $35</option>
                </select>
              </div>
            ) : (
              hasOffer && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold text-white bg-gradient-to-r from-rose-500 to-amber-500 shadow-md flex items-center gap-1 border border-white/30 truncate block">
                  🔥 {product.offerTag}
                </span>
              )
            )}
          </div>

        </div>

      </div>

      {/* Card Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">

        {/* Category Tag, Title & Description */}
        <div className="space-y-2">

          {/* DIRECTLY CLICKABLE CATEGORY TAG */}
          <div>
            {isSellerView ? (
              <div className="relative inline-block group">
                <select
                  value={product.category || "USED FURNITURE"}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 hover:text-[#D85A30] bg-transparent px-2 py-0.5 rounded-lg border border-slate-200 hover:border-[#D85A30] cursor-pointer outline-none appearance-none pr-5 transition-all"
                  title="Click to select category"
                >
                  <option value="USED FURNITURE">USED FURNITURE</option>
                  <option value="GROCERY & FOOD">GROCERY & FOOD</option>
                  <option value="ELECTRONICS & TECH">ELECTRONICS & TECH</option>
                  <option value="SERVICES & RENTALS">SERVICES & RENTALS</option>
                  <option value="CLOTHING & FASHION">CLOTHING & FASHION</option>
                  <option value="HOME APPLIANCES">HOME APPLIANCES</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-700 group-hover:text-[#D85A30] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
              </div>
            ) : (
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 block">
                {product.category || "USED FURNITURE"}
              </span>
            )}
          </div>

          {/* DIRECTLY CLICKABLE / INPUTABLE TITLE */}
          <div>
            {isSellerView ? (
              isEditingTitle ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                    onBlur={handleSaveTitle}
                    className="w-full font-bold text-slate-900 text-sm px-2 py-1 border-2 border-slate-300 rounded-lg bg-slate-50 outline-none"
                  />
                  <button onClick={handleSaveTitle} className="p-1 rounded-lg bg-slate-800 text-white">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <h3
                  onClick={() => setIsEditingTitle(true)}
                  className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 cursor-pointer flex items-center justify-between gap-1 group/title"
                  title="Click to edit title"
                >
                  <span className="truncate">{product.name}</span>
                  <DeepCoralHandPen size={15} className="group-hover/title:scale-125 transition-transform" />
                </h3>
              )
            ) : (
              <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                {product.name}
              </h3>
            )}
          </div>

          {/* DIRECTLY CLICKABLE / INPUTABLE DESCRIPTION */}
          <div>
            {isSellerView ? (
              isEditingDesc ? (
                <div className="flex flex-col gap-1">
                  <textarea
                    rows={2}
                    autoFocus
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    onBlur={handleSaveDesc}
                    className="w-full text-xs text-slate-800 p-2 border-2 border-blue-500 rounded-lg bg-blue-50/50 outline-none resize-none"
                  />
                  <button onClick={handleSaveDesc} className="self-end px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                    Save Details
                  </button>
                </div>
              ) : (
                <p
                  onClick={() => setIsEditingDesc(true)}
                  className="text-xs text-slate-500 line-clamp-2 leading-relaxed cursor-pointer hover:text-slate-900 hover:bg-slate-50 p-1 rounded transition flex items-start justify-between gap-1 group/desc"
                  title="Click to edit details"
                >
                  <span className="flex-1 min-w-0">{product.description || "Click to add product description..."}</span>
                  <DeepCoralHandPen size={14} className="mt-0.5 group-hover/desc:scale-125 transition-transform" />
                </p>
              )
            ) : (
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {product.description || "High quality item listed on marketplace."}
              </p>
            )}
          </div>

        </div>

        {/* Price & Action Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">

          {/* PRICE BOX */}
          <div>
            {isSellerView && isEditingPrice ? (
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-[#404040]">$</span>
                <input
                  type="number"
                  step="0.01"
                  autoFocus
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSavePrice()}
                  onBlur={handleSavePrice}
                  className="w-20 px-2 py-1 font-extrabold text-[#404040] text-sm border-2 border-slate-400 rounded-lg bg-slate-50 outline-none"
                />
                <button onClick={handleSavePrice} className="p-1 rounded-lg bg-slate-800 text-white">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => isSellerView && setIsEditingPrice(true)}
                className={isSellerView ? "cursor-pointer hover:opacity-85 transition group/price" : ""}
                title={isSellerView ? "Click to edit main price" : ""}
              >
                {priceDetails.hasOffer ? (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <span>PRICE</span>
                      {isSellerView && <DeepCoralHandPen size={12} className="group-hover/price:scale-125 transition-transform" />}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-normal text-[#404040] leading-none tracking-tight">
                        ${priceDetails.offerPrice.toFixed(2)}
                      </span>
                      <span className="text-xs font-normal text-[#D85A30] line-through tracking-tight mt-0.5">
                        ${priceDetails.mainPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <span>PRICE</span>
                      {isSellerView && <DeepCoralHandPen size={12} className="group-hover/price:scale-125 transition-transform" />}
                    </span>
                    <span className="text-xl font-normal text-[#404040] leading-none tracking-tight block">
                      ${priceDetails.mainPrice.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delete Button for Seller */}
          {isSellerView && onDelete && (
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 rounded-xl text-[#D85A30] hover:text-[#993C1D] hover:bg-[#D85A30]/10 transition-all flex items-center justify-center active:scale-95 cursor-pointer group"
              title="Delete Product"
            >
              <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          )}

          {/* Add to Cart Button for Buyers */}
          {!isSellerView && (
            <button
              onClick={() => onAddToCart && onAddToCart(product)}
              className="px-4 py-2.5 rounded-2xl text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #e6653c 0%, #D85A30 100%)" }}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
