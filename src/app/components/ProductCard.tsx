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
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingOffer, setIsEditingOffer] = useState(false);
  const [isEditingCondition, setIsEditingCondition] = useState(false);

  const [titleInput, setTitleInput] = useState(product.name);
  const [descInput, setDescInput] = useState(product.description || "");
  const [priceInput, setPriceInput] = useState(product.price.toString());

  const hasOffer = Boolean(
    product.offerTag &&
    product.offerTag.toLowerCase() !== "none" &&
    product.offerTag.toLowerCase() !== "no offer"
  );

  // Calculate strikethrough price if offer exists
  const originalPrice = product.originalPrice || (hasOffer ? product.price * 1.25 : undefined);

  // Helper to handle inline state update
  const triggerUpdate = (fields: Partial<Product>) => {
    if (onUpdateProduct) {
      onUpdateProduct({ ...product, ...fields });
    }
  };

  const handleOfferChange = (newOffer: string) => {
    const isNoOffer = newOffer === "none" || newOffer === "";
    const updatedOfferTag = isNoOffer ? undefined : newOffer;
    const updatedOriginalPrice = isNoOffer ? undefined : (product.originalPrice || product.price * 1.25);

    triggerUpdate({
      offerTag: updatedOfferTag,
      originalPrice: updatedOriginalPrice,
    });
    setIsEditingOffer(false);
  };

  const handleCategoryChange = (newCategory: string) => {
    triggerUpdate({ category: newCategory });
    setIsEditingCategory(false);
  };

  const handleConditionChange = (newCondition: "New" | "Gently Used" | "Refurbished") => {
    triggerUpdate({ condition: newCondition });
    setIsEditingCondition(false);
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

        {/* CONDITION PILL BADGE (Top Left) - SELECTABLE DROPDOWN IN SELLER VIEW */}
        <div className="absolute top-3 left-3 z-20">
          {isSellerView ? (
            <div className="relative inline-block">
              <select
                value={product.condition || "Gently Used"}
                onChange={(e) => handleConditionChange(e.target.value as any)}
                className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-sm border border-slate-200/60 backdrop-blur-xs cursor-pointer outline-none appearance-none pr-6 hover:bg-white transition"
                title="Click to change condition"
              >
                <option value="Gently Used">Gently Used</option>
                <option value="New">New (Brand New)</option>
                <option value="Refurbished">Refurbished</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-sm border border-slate-200/60 backdrop-blur-xs">
              {product.condition || "Gently Used"}
            </span>
          )}
        </div>

        {/* OFFER / DISCOUNT PILL BADGE (Top Right) - SCREENSHOT 1 & 2 STYLED (NO OVERLAP) */}
        <div className="absolute top-3 right-3 z-20 max-w-[135px]">
          {isSellerView ? (
            <div className="relative inline-block w-full">
              {/* Styled Pill Display */}
              <div className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-md flex items-center justify-between gap-1 border transition ${
                hasOffer
                  ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white border-white/40"
                  : "bg-slate-900/80 text-white border-slate-700 hover:bg-slate-900"
              }`}>
                <span className="truncate">{hasOffer ? `🔥 ${product.offerTag}` : "+ Offer"}</span>
                <ChevronDown className="w-3 h-3 flex-shrink-0 opacity-80" />
              </div>

              {/* Invisible native select overlaid on top to pick offer without ugly expansion */}
              <select
                value={product.offerTag || "none"}
                onChange={(e) => handleOfferChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs font-bold"
                title="Click to select offer discount"
              >
                <option value="none">No Offer (Regular Price - Screenshot 2)</option>
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
              <span className="px-3 py-1 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-rose-500 to-amber-500 shadow-md flex items-center gap-1 border border-white/30 truncate">
                🔥 {product.offerTag}
              </span>
            )
          )}
        </div>

        {/* Seller Trash Icon Button (Bottom Right Overlay) */}
        {isSellerView && onDelete && (
          <button
            onClick={() => onDelete(product.id)}
            className="absolute bottom-3 right-3 z-10 p-2 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white transition backdrop-blur-xs shadow-md"
            title="Remove Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Card Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Category Tag, Title & Description */}
        <div className="space-y-2">
          
          {/* DIRECTLY CLICKABLE CATEGORY TAG */}
          <div>
            {isSellerView ? (
              <div className="relative inline-block">
                <select
                  value={product.category || "USED FURNITURE"}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 hover:text-blue-800 bg-blue-50/60 hover:bg-blue-100/80 px-2 py-0.5 rounded-lg border border-blue-200/60 cursor-pointer outline-none appearance-none pr-5 transition"
                  title="Click to select category"
                >
                  <option value="USED FURNITURE">USED FURNITURE</option>
                  <option value="GROCERY & FOOD">GROCERY & FOOD</option>
                  <option value="ELECTRONICS & TECH">ELECTRONICS & TECH</option>
                  <option value="SERVICES & RENTALS">SERVICES & RENTALS</option>
                  <option value="CLOTHING & FASHION">CLOTHING & FASHION</option>
                  <option value="HOME APPLIANCES">HOME APPLIANCES</option>
                </select>
                <ChevronDown className="w-3 h-3 text-blue-600 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 block">
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
                    className="w-full font-bold text-slate-900 text-sm px-2 py-1 border-2 border-blue-500 rounded-lg bg-blue-50/50 outline-none"
                  />
                  <button onClick={handleSaveTitle} className="p-1 rounded-lg bg-emerald-600 text-white">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <h3
                  onClick={() => setIsEditingTitle(true)}
                  className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 hover:text-blue-600 cursor-pointer transition-colors border-b border-transparent hover:border-blue-400"
                  title="Click to edit title"
                >
                  {product.name}
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
                  className="text-xs text-slate-500 line-clamp-2 leading-relaxed cursor-pointer hover:text-slate-900 hover:bg-slate-50 p-1 rounded transition"
                  title="Click to edit details"
                >
                  {product.description || "Click to add product description..."}
                </p>
              )
            ) : (
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {product.description || "High quality item listed on marketplace. Great condition and ready for pickup or delivery."}
              </p>
            )}
          </div>

        </div>

        {/* Price & Add to Cart Action Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-end justify-between gap-3">
          
          {/* DIRECTLY CLICKABLE / INPUTABLE PRICE BOX WITH MATCHED SCREENSHOT 1 & 2 STYLING */}
          <div>
            {isSellerView && isEditingPrice ? (
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-emerald-600">$</span>
                <input
                  type="number"
                  step="0.01"
                  autoFocus
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSavePrice()}
                  onBlur={handleSavePrice}
                  className="w-20 px-2 py-1 font-extrabold text-emerald-600 text-sm border-2 border-emerald-500 rounded-lg bg-emerald-50 outline-none"
                />
                <button onClick={handleSavePrice} className="p-1 rounded-lg bg-emerald-600 text-white">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => isSellerView && setIsEditingPrice(true)}
                className={isSellerView ? "cursor-pointer hover:opacity-85 transition" : ""}
                title={isSellerView ? "Click to edit price" : ""}
              >
                {hasOffer ? (
                  /* SCREENSHOT 1: DISCOUNTED OFFER PRICE VIEW */
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      OFFER PRICE
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xl font-extrabold text-emerald-600 leading-none tracking-tight">
                        ${product.price.toFixed(2)}
                      </span>
                      {originalPrice && (
                        <span className="text-xs font-bold text-rose-500 line-through tracking-tight mt-0.5">
                          ${originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* SCREENSHOT 2: REGULAR PRICE VIEW */
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      REGULAR PRICE
                    </span>
                    <span className="text-xl font-extrabold text-emerald-600 leading-none tracking-tight block">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add to Cart Button (Identical Size & Style for Both Screens) */}
          <button
            onClick={() => onAddToCart && onAddToCart(product)}
            className="px-4 py-2.5 rounded-2xl text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>

        </div>

      </div>

    </div>
  );
}
