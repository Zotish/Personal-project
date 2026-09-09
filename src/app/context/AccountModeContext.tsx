import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router";

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email: string;
  phone: string;
  city: string;
  avatar: string;
}

export interface SellerProfile {
  id: string;
  shopName: string;
  category: string;
  phone: string;
  safeZone: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  createdAt: string;
}

interface AccountModeContextType {
  user: UserProfile;
  currentMode: "member" | "seller";
  hasSellerAccount: boolean;
  sellerProfile: SellerProfile | null;
  sellerProfiles: SellerProfile[];
  activeSellerId: string;
  isMigrateModalOpen: boolean;
  openMigrateModal: () => void;
  closeMigrateModal: () => void;
  migrateToSeller: (data: {
    shopName: string;
    category: string;
    phone?: string;
    safeZone?: string;
  }) => void;
  switchActiveSeller: (sellerId: string, andSwitchMode?: boolean) => void;
  updateActiveSellerProfile: (updates: Partial<SellerProfile>) => void;
  switchMode: (targetMode?: "member" | "seller") => void;
  ghostBlockedUsers: string[];
  toggleGhostBlock: (userIdOrHandle: string) => void;
  isGhostBlocked: (userIdOrHandle: string) => boolean;
}

const AccountModeContext = createContext<AccountModeContextType | undefined>(undefined);

const STORAGE_HAS_SELLER = "pathasathi_has_seller_account";
const STORAGE_ALL_SELLER_PROFILES = "pathasathi_all_seller_profiles";
const STORAGE_ACTIVE_SELLER_ID = "pathasathi_active_seller_id";
const STORAGE_SELLER_PROFILE = "pathasathi_seller_profile_data";
const STORAGE_ACCOUNT_MODE = "pathasathi_current_account_mode";
const STORAGE_GHOST_BLOCKS = "pathasathi_ghost_blocked_users";

const DEFAULT_SELLER_PROFILE: SellerProfile = {
  id: "biz_default",
  shopName: "Gulshan Resale & Grocery Mart",
  category: "Food & Groceries / Furniture",
  phone: "+1 (718) 555-0192",
  safeZone: "Jackson Heights Community Safe-Zone (Queens, NY)",
  rating: 4.9,
  reviewsCount: 312,
  verified: true,
  createdAt: "2024",
};

export function AccountModeProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  // Unified Base Member User (Default: Rafiq Ahmed)
  const [user] = useState<UserProfile>({
    id: "usr_rafiq",
    name: "Rafiq Ahmed",
    handle: "@rafiq_ahmed",
    email: "rafiq.ahmed@email.com",
    phone: "+1 (718) 555-0192",
    city: "Jackson Heights, Queens, NY",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
  });

  // Multiple Seller Profiles List
  const [sellerProfiles, setSellerProfiles] = useState<SellerProfile[]>(() => {
    try {
      const savedList = localStorage.getItem(STORAGE_ALL_SELLER_PROFILES);
      if (savedList) {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Check legacy single profile
      const savedSingle = localStorage.getItem(STORAGE_SELLER_PROFILE);
      if (savedSingle) {
        const parsed = JSON.parse(savedSingle);
        return [{ ...parsed, id: parsed.id || "biz_default" }];
      }
      // Default: if user had seller enabled previously
      if (localStorage.getItem(STORAGE_HAS_SELLER) === "true") {
        return [DEFAULT_SELLER_PROFILE];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Active Seller ID
  const [activeSellerId, setActiveSellerId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_SELLER_ID);
      if (saved) return saved;
      const savedList = localStorage.getItem(STORAGE_ALL_SELLER_PROFILES);
      if (savedList) {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      }
      return "biz_default";
    } catch {
      return "biz_default";
    }
  });

  // Has migrated to seller (true if at least 1 business account exists)
  const hasSellerAccount = sellerProfiles.length > 0;

  // Currently active seller profile (computed)
  const sellerProfile: SellerProfile | null =
    sellerProfiles.find(s => s.id === activeSellerId) || sellerProfiles[0] || null;

  // Current active mode (member vs seller)
  const [currentMode, setCurrentMode] = useState<"member" | "seller">(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACCOUNT_MODE) as "member" | "seller";
      return saved === "seller" ? "seller" : "member";
    } catch {
      return "member";
    }
  });

  // Migration modal visibility
  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false);

  // Ghost blocked users list (anti-harassment)
  const [ghostBlockedUsers, setGhostBlockedUsers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GHOST_BLOCKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync seller profiles to localStorage whenever updated
  useEffect(() => {
    try {
      if (sellerProfiles.length > 0) {
        localStorage.setItem(STORAGE_ALL_SELLER_PROFILES, JSON.stringify(sellerProfiles));
        localStorage.setItem(STORAGE_HAS_SELLER, "true");
        if (sellerProfile) {
          localStorage.setItem(STORAGE_SELLER_PROFILE, JSON.stringify(sellerProfile));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [sellerProfiles, sellerProfile]);

  // Open / Close Migration Modal
  const openMigrateModal = () => setIsMigrateModalOpen(true);
  const closeMigrateModal = () => setIsMigrateModalOpen(false);

  // Complete Seller Migration or Create Additional Business Account
  const migrateToSeller = (data: {
    shopName: string;
    category: string;
    phone?: string;
    safeZone?: string;
  }) => {
    const newProfile: SellerProfile = {
      id: "biz_" + Date.now(),
      shopName: data.shopName.trim() || "My Immigrant Community Shop",
      category: data.category || "Food & Groceries",
      phone: data.phone?.trim() || user.phone,
      safeZone: data.safeZone?.trim() || "Jackson Heights Safe Pickup Point, Queens, NY",
      rating: 5.0,
      reviewsCount: 1,
      verified: true,
      createdAt: new Date().getFullYear().toString(),
    };

    setSellerProfiles(prev => {
      const updated = [...prev, newProfile];
      try {
        localStorage.setItem(STORAGE_ALL_SELLER_PROFILES, JSON.stringify(updated));
        localStorage.setItem(STORAGE_HAS_SELLER, "true");
        localStorage.setItem(STORAGE_ACTIVE_SELLER_ID, newProfile.id);
        localStorage.setItem(STORAGE_SELLER_PROFILE, JSON.stringify(newProfile));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setActiveSellerId(newProfile.id);
  };

  // Switch Active Seller Profile
  const switchActiveSeller = (sellerId: string, andSwitchMode = true) => {
    const target = sellerProfiles.find(s => s.id === sellerId);
    if (!target) return;

    setActiveSellerId(sellerId);
    try {
      localStorage.setItem(STORAGE_ACTIVE_SELLER_ID, sellerId);
      localStorage.setItem(STORAGE_SELLER_PROFILE, JSON.stringify(target));
    } catch (e) {
      console.error(e);
    }

    if (andSwitchMode) {
      setCurrentMode("seller");
      try {
        localStorage.setItem(STORAGE_ACCOUNT_MODE, "seller");
      } catch (e) {
        console.error(e);
      }
      navigate("/seller-dashboard");
    }
  };

  // Update Active Seller Profile Details
  const updateActiveSellerProfile = (updates: Partial<SellerProfile>) => {
    if (!sellerProfile) return;
    setSellerProfiles(prev =>
      prev.map(p => (p.id === sellerProfile.id ? { ...p, ...updates } : p))
    );
  };

  // Switch between Member and Seller
  const switchMode = (targetMode?: "member" | "seller") => {
    const nextMode = targetMode || (currentMode === "member" ? "seller" : "member");

    // If attempting to switch to seller but hasn't migrated yet, prompt migration modal
    if (nextMode === "seller" && !hasSellerAccount) {
      openMigrateModal();
      return;
    }

    setCurrentMode(nextMode);
    try {
      localStorage.setItem(STORAGE_ACCOUNT_MODE, nextMode);
    } catch (e) {
      console.error(e);
    }

    if (nextMode === "seller") {
      navigate("/seller-dashboard");
    } else {
      navigate("/feed");
    }
  };

  // Ghost Block toggle for anti-harassment
  const toggleGhostBlock = (userIdOrHandle: string) => {
    setGhostBlockedUsers(prev => {
      const exists = prev.includes(userIdOrHandle);
      const updated = exists ? prev.filter(u => u !== userIdOrHandle) : [...prev, userIdOrHandle];
      try {
        localStorage.setItem(STORAGE_GHOST_BLOCKS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const isGhostBlocked = (userIdOrHandle: string) => {
    return ghostBlockedUsers.includes(userIdOrHandle);
  };

  return (
    <AccountModeContext.Provider
      value={{
        user,
        currentMode,
        hasSellerAccount,
        sellerProfile,
        sellerProfiles,
        activeSellerId,
        isMigrateModalOpen,
        openMigrateModal,
        closeMigrateModal,
        migrateToSeller,
        switchActiveSeller,
        updateActiveSellerProfile,
        switchMode,
        ghostBlockedUsers,
        toggleGhostBlock,
        isGhostBlocked,
      }}
    >
      {children}
    </AccountModeContext.Provider>
  );
}

export function useAccountMode() {
  const context = useContext(AccountModeContext);
  if (!context) {
    throw new Error("useAccountMode must be used within an AccountModeProvider");
  }
  return context;
}
