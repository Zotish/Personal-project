import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

export interface AndroidAppTask {
  id: string;
  path: string;
  title: string;
  shortName: string;
  icon: string;
  iconBg: string;
  category: string;
  themeColor: string;
  previewGradient: string;
  timestamp: number;
}

export const ANDROID_APP_REGISTRY: Record<string, {
  title: string;
  shortName: string;
  icon: string;
  iconBg: string;
  category: string;
  themeColor: string;
  previewGradient: string;
}> = {
  "/feed": {
    title: "Pathasathi",
    shortName: "Pathasathi",
    icon: "📍",
    iconBg: "bg-[#C04A22]",
    category: "Home",
    themeColor: "#C04A22",
    previewGradient: "from-[#C04A22]/20 via-slate-900/90 to-slate-950",
  },
  "/map": {
    title: "Map",
    shortName: "Map",
    icon: "🗺️",
    iconBg: "bg-emerald-600",
    category: "Navigation",
    themeColor: "#059669",
    previewGradient: "from-emerald-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/jobs": {
    title: "Jobs",
    shortName: "Jobs",
    icon: "💼",
    iconBg: "bg-purple-600",
    category: "Employment",
    themeColor: "#7C3AED",
    previewGradient: "from-purple-600/20 via-slate-900/90 to-slate-950",
  },
  "/orders": {
    title: "Orders",
    shortName: "Orders",
    icon: "🛍️",
    iconBg: "bg-orange-600",
    category: "Store",
    themeColor: "#EA580C",
    previewGradient: "from-orange-600/20 via-slate-900/90 to-slate-950",
  },
  "/reels": {
    title: "Reels",
    shortName: "Reels",
    icon: "🎬",
    iconBg: "bg-pink-600",
    category: "Videos",
    themeColor: "#DB2777",
    previewGradient: "from-pink-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/free-food": {
    title: "Food",
    shortName: "Food",
    icon: "🍲",
    iconBg: "bg-green-700",
    category: "Aid & Relief",
    themeColor: "#15803D",
    previewGradient: "from-green-700/20 via-slate-900/90 to-slate-950",
  },
  "/services/food-bank": {
    title: "Food",
    shortName: "Food",
    icon: "🥫",
    iconBg: "bg-green-700",
    category: "Aid & Relief",
    themeColor: "#15803D",
    previewGradient: "from-green-700/20 via-slate-900/90 to-slate-950",
  },
  "/services/housing": {
    title: "Housing",
    shortName: "Housing",
    icon: "🏡",
    iconBg: "bg-cyan-600",
    category: "Shelter",
    themeColor: "#0891B2",
    previewGradient: "from-cyan-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/legal": {
    title: "Legal",
    shortName: "Legal",
    icon: "⚖️",
    iconBg: "bg-rose-600",
    category: "Legal",
    themeColor: "#E11D48",
    previewGradient: "from-rose-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/checklist": {
    title: "Checklist",
    shortName: "Checklist",
    icon: "📋",
    iconBg: "bg-amber-600",
    category: "Legal",
    themeColor: "#D97706",
    previewGradient: "from-amber-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/religion": {
    title: "Worship",
    shortName: "Worship",
    icon: "🕌",
    iconBg: "bg-amber-600",
    category: "Community",
    themeColor: "#D97706",
    previewGradient: "from-amber-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/religious": {
    title: "Worship",
    shortName: "Worship",
    icon: "🕌",
    iconBg: "bg-amber-600",
    category: "Community",
    themeColor: "#D97706",
    previewGradient: "from-amber-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/schools": {
    title: "Schools",
    shortName: "Schools",
    icon: "🎓",
    iconBg: "bg-violet-600",
    category: "Education",
    themeColor: "#7C3AED",
    previewGradient: "from-violet-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/hospitals": {
    title: "Health",
    shortName: "Health",
    icon: "🏥",
    iconBg: "bg-red-600",
    category: "Healthcare",
    themeColor: "#DC2626",
    previewGradient: "from-red-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/food": {
    title: "Groceries",
    shortName: "Groceries",
    icon: "🛒",
    iconBg: "bg-yellow-600",
    category: "Food",
    themeColor: "#CA8A04",
    previewGradient: "from-yellow-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/embassy": {
    title: "Embassy",
    shortName: "Embassy",
    icon: "🏛️",
    iconBg: "bg-slate-700",
    category: "Diplomatic",
    themeColor: "#334155",
    previewGradient: "from-slate-700/20 via-slate-900/90 to-slate-950",
  },
  "/services": {
    title: "Services",
    shortName: "Services",
    icon: "⚡",
    iconBg: "bg-amber-500",
    category: "Services",
    themeColor: "#F59E0B",
    previewGradient: "from-amber-500/20 via-slate-900/90 to-slate-950",
  },
  "/messages": {
    title: "Messages",
    shortName: "Messages",
    icon: "💬",
    iconBg: "bg-teal-600",
    category: "Chat",
    themeColor: "#0D9488",
    previewGradient: "from-teal-600/20 via-slate-900/90 to-slate-950",
  },
  "/explore": {
    title: "Explore",
    shortName: "Explore",
    icon: "🔍",
    iconBg: "bg-sky-600",
    category: "Search",
    themeColor: "#0284C7",
    previewGradient: "from-sky-600/20 via-slate-900/90 to-slate-950",
  },
  "/communities": {
    title: "Communities",
    shortName: "Communities",
    icon: "👥",
    iconBg: "bg-indigo-600",
    category: "Social",
    themeColor: "#4F46E5",
    previewGradient: "from-indigo-600/20 via-slate-900/90 to-slate-950",
  },
  "/qa": {
    title: "Q&A",
    shortName: "Q&A",
    icon: "❓",
    iconBg: "bg-emerald-700",
    category: "Forum",
    themeColor: "#047857",
    previewGradient: "from-emerald-700/20 via-slate-900/90 to-slate-950",
  },
  "/saved": {
    title: "Saved",
    shortName: "Saved",
    icon: "🔖",
    iconBg: "bg-yellow-600",
    category: "Bookmarks",
    themeColor: "#CA8A04",
    previewGradient: "from-yellow-600/20 via-slate-900/90 to-slate-950",
  },
  "/profile": {
    title: "Profile",
    shortName: "Profile",
    icon: "👤",
    iconBg: "bg-slate-700",
    category: "Account",
    themeColor: "#334155",
    previewGradient: "from-slate-700/20 via-slate-900/90 to-slate-950",
  },
  "/more": {
    title: "Menu",
    shortName: "Menu",
    icon: "✨",
    iconBg: "bg-slate-800",
    category: "System",
    themeColor: "#1E293B",
    previewGradient: "from-slate-800/20 via-slate-900/90 to-slate-950",
  },
};

export function getTaskMeta(pathname: string) {
  if (ANDROID_APP_REGISTRY[pathname]) return ANDROID_APP_REGISTRY[pathname];
  const matchKey = Object.keys(ANDROID_APP_REGISTRY).find(k => k !== "/services" && pathname.startsWith(k));
  if (matchKey) return ANDROID_APP_REGISTRY[matchKey];

  const clean = pathname.replace("/", "").replace(/-/g, " ") || "Home";
  const oneWord = clean.trim().split(" ")[0] || "Home";
  const capitalized = oneWord.charAt(0).toUpperCase() + oneWord.slice(1);
  return {
    title: capitalized,
    shortName: capitalized,
    icon: "📱",
    iconBg: "bg-indigo-600",
    category: "App",
    themeColor: "#4F46E5",
    previewGradient: "from-indigo-600/20 via-slate-900/90 to-slate-950",
  };
}

interface MobileTabContextType {
  tasks: AndroidAppTask[];
  activeTaskId: string;
  isRecentsOpen: boolean;
  setIsRecentsOpen: (open: boolean) => void;
  openTask: (path: string) => void;
  closeTask: (taskId: string) => void;
  clearAllTasks: () => void;
  switchTask: (taskId: string) => void;
  switchToNextTask: () => void;
  switchToPrevTask: () => void;
  activeTaskToast: string | null;
  isCurrentPageInRecents: boolean;
  addPageToRecents: (path?: string) => void;
  removePageFromRecents: (path?: string) => void;
  togglePageInRecents: (path?: string) => boolean;
  showToast: (msg: string) => void;
}

const MobileTabContext = createContext<MobileTabContextType | null>(null);

const STORAGE_KEY = "android_recent_tasks_v5";

export function MobileTabProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<AndroidAppTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => {
            const meta = getTaskMeta(item.path);
            return {
              id: item.id || `task-${Date.now()}-${Math.random()}`,
              path: item.path,
              title: item.title || meta.title,
              shortName: item.shortName || meta.shortName,
              icon: item.icon || meta.icon,
              iconBg: item.iconBg || meta.iconBg,
              category: item.category || meta.category,
              timestamp: item.timestamp || Date.now(),
              themeColor: meta.themeColor,
              previewGradient: meta.previewGradient,
            };
          });
        }
      }
    } catch (_) {}

    // Initially NO tabs in recents! (User manually adds tabs)
    return [];
  });

  const [activeTaskId, setActiveTaskId] = useState<string>(() => {
    return tasks[0]?.id || "";
  });

  const [isRecentsOpen, setIsRecentsOpen] = useState(false);
  const [activeTaskToast, setActiveTaskToast] = useState<string | null>(null);

  // Sync tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (_) {}
  }, [tasks]);

  // Track location changes: only update activeTaskId if route ALREADY exists in tasks.
  // NEVER auto-add routes (user manually customizes recents via bubble)
  useEffect(() => {
    setTasks(prev => {
      const existing = prev.find(t => t.path === location.pathname);
      if (existing) {
        setActiveTaskId(existing.id);
        return prev.map(t => (t.id === existing.id ? { ...t, timestamp: Date.now() } : t));
      }
      // If not in recents, do NOT automatically add it!
      return prev;
    });
  }, [location.pathname]);

  const showToast = useCallback((msg: string) => {
    setActiveTaskToast(msg);
    setTimeout(() => {
      setActiveTaskToast(null);
    }, 1800);
  }, []);

  // Check if current route is saved in recents
  const isCurrentPageInRecents = tasks.some(t => t.path === location.pathname);

  // Manual Add page to recents
  const addPageToRecents = useCallback((customPath?: string) => {
    const targetPath = customPath || location.pathname;
    if (
      targetPath === "/" ||
      targetPath === "/landing" ||
      targetPath === "/login" ||
      targetPath === "/signup" ||
      targetPath.startsWith("/onboarding") ||
      targetPath === "/verify-email"
    ) {
      return;
    }

    const meta = getTaskMeta(targetPath);
    setTasks(prev => {
      const existing = prev.find(t => t.path === targetPath);
      if (existing) {
        setActiveTaskId(existing.id);
        showToast(`Already in Recents: ${existing.title}`);
        return prev;
      }

      const newTask: AndroidAppTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        path: targetPath,
        title: meta.title,
        shortName: meta.shortName,
        icon: meta.icon,
        iconBg: meta.iconBg,
        category: meta.category,
        themeColor: meta.themeColor,
        previewGradient: meta.previewGradient,
        timestamp: Date.now(),
      };

      const updated = [...prev, newTask];
      if (updated.length > 12) {
        updated.shift();
      }
      setActiveTaskId(newTask.id);
      showToast(`✅ Added to Recent: ${meta.title}`);
      return updated;
    });
  }, [location.pathname, showToast]);

  // Manual Remove page from recents
  const removePageFromRecents = useCallback((customPath?: string) => {
    const targetPath = customPath || location.pathname;
    setTasks(prev => {
      const match = prev.find(t => t.path === targetPath);
      if (!match) return prev;
      showToast(`Removed from Recents: ${match.title}`);
      const filtered = prev.filter(t => t.path !== targetPath);
      if (activeTaskId === match.id) {
        const next = filtered[filtered.length - 1];
        if (next) {
          setActiveTaskId(next.id);
        } else {
          setActiveTaskId("");
        }
      }
      return filtered;
    });
  }, [location.pathname, activeTaskId, showToast]);

  // Toggle page in recents
  const togglePageInRecents = useCallback((customPath?: string): boolean => {
    const targetPath = customPath || location.pathname;
    const exists = tasks.some(t => t.path === targetPath);
    if (exists) {
      removePageFromRecents(targetPath);
      return false;
    } else {
      addPageToRecents(targetPath);
      return true;
    }
  }, [location.pathname, tasks, addPageToRecents, removePageFromRecents]);

  const switchTask = useCallback((taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;
    setActiveTaskId(target.id);
    setIsRecentsOpen(false);
    if (location.pathname !== target.path) {
      navigate(target.path);
    }
  }, [tasks, location.pathname, navigate]);

  const openTask = useCallback((path: string) => {
    setIsRecentsOpen(false);
    navigate(path);
  }, [navigate]);

  const closeTask = useCallback((taskId: string) => {
    setTasks(prev => {
      const filtered = prev.filter(t => t.id !== taskId);
      if (activeTaskId === taskId) {
        const next = filtered[filtered.length - 1];
        if (next) {
          setActiveTaskId(next.id);
        } else {
          setActiveTaskId("");
        }
      }
      return filtered;
    });
  }, [activeTaskId]);

  const clearAllTasks = useCallback(() => {
    setTasks([]);
    setActiveTaskId("");
    setIsRecentsOpen(false);
    showToast("Cleared all recent tabs");
  }, [showToast]);

  // Swipe Left -> Next App
  const switchToNextTask = useCallback(() => {
    if (tasks.length <= 1) return;
    const currentIndex = tasks.findIndex(t => t.id === activeTaskId);
    const nextIndex = (currentIndex + 1) % tasks.length;
    const target = tasks[nextIndex];
    if (target) {
      setActiveTaskId(target.id);
      navigate(target.path);
      showToast(`${target.icon} ${target.title}`);
    }
  }, [tasks, activeTaskId, navigate, showToast]);

  // Swipe Right -> Prev App
  const switchToPrevTask = useCallback(() => {
    if (tasks.length <= 1) return;
    const currentIndex = tasks.findIndex(t => t.id === activeTaskId);
    const prevIndex = (currentIndex - 1 + tasks.length) % tasks.length;
    const target = tasks[prevIndex];
    if (target) {
      setActiveTaskId(target.id);
      navigate(target.path);
      showToast(`${target.icon} ${target.title}`);
    }
  }, [tasks, activeTaskId, navigate, showToast]);

  return (
    <MobileTabContext.Provider
      value={{
        tasks,
        activeTaskId,
        isRecentsOpen,
        setIsRecentsOpen,
        openTask,
        closeTask,
        clearAllTasks,
        switchTask,
        switchToNextTask,
        switchToPrevTask,
        activeTaskToast,
        isCurrentPageInRecents,
        addPageToRecents,
        removePageFromRecents,
        togglePageInRecents,
        showToast,
      }}
    >
      {children}
    </MobileTabContext.Provider>
  );
}

export function useMobileTabs() {
  const context = useContext(MobileTabContext);
  if (!context) {
    throw new Error("useMobileTabs must be used within a MobileTabProvider");
  }
  return context;
}
