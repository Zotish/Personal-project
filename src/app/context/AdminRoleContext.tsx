import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AdminRole =
  | "super_admin"
  | "moderator"
  | "verifier"
  | "marketplace_admin"
  | "resource_editor"
  | "support_agent";

export type AdminPermission =
  | "manage_system"
  | "manage_countries"
  | "manage_roles"
  | "manage_flags"
  | "view_audit_logs"
  | "moderate_content"
  | "manage_ai_flags"
  | "verify_credentials"
  | "grant_badges"
  | "manage_sellers"
  | "moderate_products"
  | "manage_ads"
  | "edit_directory"
  | "send_broadcasts"
  | "handle_tickets"
  | "lookup_users";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: AdminRole;
  department: string;
  lastActive: string;
}

export interface RoleConfig {
  id: AdminRole;
  title: string;
  bnTitle: string;
  badgeColor: string;
  description: string;
  defaultPath: string;
  permissions: AdminPermission[];
}

export const ROLE_CONFIGS: Record<AdminRole, RoleConfig> = {
  super_admin: {
    id: "super_admin",
    title: "Super Admin",
    bnTitle: "সুপার অ্যাডমিন (Platform Owner)",
    badgeColor: "bg-red-50 text-red-700 border-red-200",
    description: "Full root access to system settings, team roles, feature flags, and audit logs.",
    defaultPath: "/admin",
    permissions: [
      "manage_system",
      "manage_countries",
      "manage_roles",
      "manage_flags",
      "view_audit_logs",
      "moderate_content",
      "manage_ai_flags",
      "verify_credentials",
      "grant_badges",
      "manage_sellers",
      "moderate_products",
      "manage_ads",
      "edit_directory",
      "send_broadcasts",
      "handle_tickets",
      "lookup_users",
    ],
  },
  moderator: {
    id: "moderator",
    title: "Trust & Safety Moderator",
    bnTitle: "কমিউনিটি ও কন্টেন্ট মডারেটর",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Reviews reported feed content, AI scam alerts, user warnings, and shadowbans.",
    defaultPath: "/admin/moderation",
    permissions: ["moderate_content", "manage_ai_flags"],
  },
  verifier: {
    id: "verifier",
    title: "Verification & Compliance Officer",
    bnTitle: "ভেরিফিকেশন অফিসার (Legal & Medical)",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Inspects attorney Bar IDs, physician licenses, and grants verified advisor badges.",
    defaultPath: "/admin/verifications",
    permissions: ["verify_credentials", "grant_badges"],
  },
  marketplace_admin: {
    id: "marketplace_admin",
    title: "Marketplace & Commerce Admin",
    bnTitle: "মার্কেটপ্লেস ও সেলার ম্যানেজার",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Approves immigrant store applications, monitors product catalogs, and resolves disputes.",
    defaultPath: "/admin/sellers",
    permissions: ["manage_sellers", "moderate_products", "manage_ads"],
  },
  resource_editor: {
    id: "resource_editor",
    title: "Resource & Directory Manager",
    bnTitle: "রিসোর্স ও ম্যাপ ডিরেক্টরি এডিটর",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    description: "Manages local hospital, food bank, and mosque listings; publishes emergency broadcasts.",
    defaultPath: "/admin/directory",
    permissions: ["edit_directory", "send_broadcasts"],
  },
  support_agent: {
    id: "support_agent",
    title: "Support & Helpdesk Agent",
    bnTitle: "ইউজার সাপোর্ট ও হেল্পডেস্ক",
    badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
    description: "Assists users with account recovery, ticket replies, and general customer care.",
    defaultPath: "/admin/tickets",
    permissions: ["handle_tickets", "lookup_users"],
  },
};

export const ROUTE_PERMISSION_MAP: Record<string, AdminPermission | null> = {
  "/admin": null, // Overview accessible to all admin roles
  "/admin/countries": "manage_countries",
  "/admin/system-health": "manage_system",
  "/admin/staff-roles": "manage_roles",
  "/admin/feature-flags": "manage_flags",
  "/admin/audit-logs": "view_audit_logs",
  "/admin/moderation": "moderate_content",
  "/admin/ai-flags": "manage_ai_flags",
  "/admin/verifications": "verify_credentials",
  "/admin/badges": "grant_badges",
  "/admin/sellers": "manage_sellers",
  "/admin/products": "moderate_products",
  "/admin/ads": "manage_ads",
  "/admin/directory": "edit_directory",
  "/admin/broadcasts": "send_broadcasts",
  "/admin/tickets": "handle_tickets",
  "/admin/user-lookup": "lookup_users",
};

interface AdminRoleContextType {
  activeRole: AdminRole;
  currentAdminUser: AdminUser;
  switchRole: (role: AdminRole) => void;
  hasPermission: (permission: AdminPermission) => boolean;
  canAccessRoute: (routePath: string) => boolean;
  availableRoles: RoleConfig[];
}

const STORAGE_ADMIN_ROLE = "ic_admin_active_role";

const DEFAULT_ADMIN_USERS: Record<AdminRole, AdminUser> = {
  super_admin: {
    id: "ADM-001",
    name: "Tanvir Rahman",
    email: "tanvir.lead@pathasathi.org",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    role: "super_admin",
    department: "Platform Engineering & Security",
    lastActive: "Active now",
  },
  moderator: {
    id: "ADM-002",
    name: "Fatima Zahra",
    email: "fatima.mod@pathasathi.org",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    role: "moderator",
    department: "Trust & Safety Team",
    lastActive: "2m ago",
  },
  verifier: {
    id: "ADM-003",
    name: "Shahriar Kabir, Esq.",
    email: "compliance@pathasathi.org",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    role: "verifier",
    department: "Legal & Regulatory Compliance",
    lastActive: "15m ago",
  },
  marketplace_admin: {
    id: "ADM-004",
    name: "Arif Hossain",
    email: "commerce@pathasathi.org",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    role: "marketplace_admin",
    department: "Merchant Operations & Catalog",
    lastActive: "5m ago",
  },
  resource_editor: {
    id: "ADM-005",
    name: "Nusrat Jahan",
    email: "resources@pathasathi.org",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    role: "resource_editor",
    department: "Civic Resource & Map Directory",
    lastActive: "1h ago",
  },
  support_agent: {
    id: "ADM-006",
    name: "Kamrul Islam",
    email: "support@pathasathi.org",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    role: "support_agent",
    department: "Customer Care & Helpdesk",
    lastActive: "Just now",
  },
};

const AdminRoleContext = createContext<AdminRoleContextType | undefined>(undefined);

export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<AdminRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ADMIN_ROLE) as AdminRole;
      if (saved && ROLE_CONFIGS[saved]) return saved;
    } catch (_) {}
    return "super_admin";
  });

  const switchRole = (role: AdminRole) => {
    setActiveRole(role);
    try {
      localStorage.setItem(STORAGE_ADMIN_ROLE, role);
    } catch (_) {}
  };

  const hasPermission = (permission: AdminPermission): boolean => {
    const config = ROLE_CONFIGS[activeRole];
    if (!config) return false;
    if (activeRole === "super_admin") return true;
    return config.permissions.includes(permission);
  };

  const canAccessRoute = (routePath: string): boolean => {
    if (activeRole === "super_admin") return true;
    const requiredPermission = ROUTE_PERMISSION_MAP[routePath];
    if (!requiredPermission) return true; // Public inside admin
    return hasPermission(requiredPermission);
  };

  const currentAdminUser = DEFAULT_ADMIN_USERS[activeRole] || DEFAULT_ADMIN_USERS.super_admin;
  const availableRoles = Object.values(ROLE_CONFIGS);

  return (
    <AdminRoleContext.Provider
      value={{
        activeRole,
        currentAdminUser,
        switchRole,
        hasPermission,
        canAccessRoute,
        availableRoles,
      }}
    >
      {children}
    </AdminRoleContext.Provider>
  );
}

export function useAdminRole() {
  const context = useContext(AdminRoleContext);
  if (!context) {
    throw new Error("useAdminRole must be used within an AdminRoleProvider");
  }
  return context;
}
