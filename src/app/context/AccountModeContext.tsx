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
  isMigrateModalOpen: boolean;
  openMigrateModal: () => void;
  closeMigrateModal: () => void;
  migrateToSeller: (data: {
    shopName: string;
    category: string;
    phone?: string;
    safeZone?: string;
  }) => void;
  switchMode: (targetMode?: "member" | "seller") => void;
  ghostBlockedUsers: string[];
  toggleGhostBlock: (userIdOrHandle: string) => void;
  isGhostBlocked: (userIdOrHandle: string) => boolean;
}

const AccountModeContext = createContext<AccountModeContextType | undefined>(undefined);

const STORAGE_HAS_SELLER = "pathasathi_has_seller_account";
const STORAGE_SELLER_PROFILE = "pathasathi_seller_profile_data";
const STORAGE_ACCOUNT_MODE = "pathasathi_current_account_mode";
const STORAGE_GHOST_BLOCKS = "pathasathi_ghost_blocked_users";

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

  // Has migrated to seller
  const [hasSellerAccount, setHasSellerAccount] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_HAS_SELLER) === "true";
    } catch {
      return false;
    }
  });

  // Seller profile data
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SELLER_PROFILE);
      if (saved) return JSON.parse(saved);
      // If user had seller enabled previously, default to Gulshan Mart
      if (localStorage.getItem(STORAGE_HAS_SELLER) === "true") {
        return {
          shopName: "Gulshan Resale & Grocery Mart",
          category: "Food & Groceries / Furniture",
          phone: "+1 (718) 555-0192",
          safeZone: "Jackson Heights Community Safe-Zone (Queens, NY)",
          rating: 4.9,
          reviewsCount: 312,
          verified: true,
          createdAt: "2024",
        };
      }
      return null;
    } catch {
      return null;
    }
  });

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

  // Open / Close Migration Modal
  const openMigrateModal = () => setIsMigrateModalOpen(true);
  const closeMigrateModal = () => setIsMigrateModalOpen(false);

  // Complete Seller Migration
  const migrateToSeller = (data: {
    shopName: string;
    category: string;
    phone?: string;
    safeZone?: string;
  }) => {
    const newProfile: SellerProfile = {
      shopName: data.shopName.trim() || "My Immigrant Community Shop",
      category: data.category || "Food & Groceries",
      phone: data.phone?.trim() || user.phone,
      safeZone: data.safeZone?.trim() || "Jackson Heights Safe Pickup Point, Queens, NY",
      rating: 5.0,
      reviewsCount: 1,
      verified: true,
      createdAt: new Date().getFullYear().toString(),
    };

    setSellerProfile(newProfile);
    setHasSellerAccount(true);

    try {
      localStorage.setItem(STORAGE_HAS_SELLER, "true");
      localStorage.setItem(STORAGE_SELLER_PROFILE, JSON.stringify(newProfile));
    } catch (e) {
      console.error(e);
    }
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
        isMigrateModalOpen,
        openMigrateModal,
        closeMigrateModal,
        migrateToSeller,
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
