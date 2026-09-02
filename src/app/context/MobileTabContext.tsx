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
    title: "Live GPS Map",
    shortName: "Map",
    icon: "🗺️",
    iconBg: "bg-emerald-600",
    category: "Navigation",
    themeColor: "#059669",
    previewGradient: "from-emerald-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/jobs": {
    title: "Jobs & Careers",
    shortName: "Jobs",
    icon: "💼",
    iconBg: "bg-purple-600",
    category: "Employment",
    themeColor: "#7C3AED",
    previewGradient: "from-purple-600/20 via-slate-900/90 to-slate-950",
  },
  "/orders": {
    title: "My Orders",
    shortName: "Orders",
    icon: "🛍️",
    iconBg: "bg-orange-600",
    category: "Store",
    themeColor: "#EA580C",
    previewGradient: "from-orange-600/20 via-slate-900/90 to-slate-950",
  },
  "/reels": {
    title: "Immigrant Stories & Reels",
    shortName: "Reels",
    icon: "🎬",
    iconBg: "bg-pink-600",
    category: "Videos",
    themeColor: "#DB2777",
    previewGradient: "from-pink-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/free-food": {
    title: "Free Food & Pantries",
    shortName: "Food Bank",
    icon: "🍲",
    iconBg: "bg-green-700",
    category: "Aid & Relief",
    themeColor: "#15803D",
    previewGradient: "from-green-700/20 via-slate-900/90 to-slate-950",
  },
  "/services/food-bank": {
    title: "Free Food & Pantries",
    shortName: "Food Bank",
    icon: "🥫",
    iconBg: "bg-green-700",
    category: "Aid & Relief",
    themeColor: "#15803D",
    previewGradient: "from-green-700/20 via-slate-900/90 to-slate-950",
  },
  "/services/housing": {
    title: "Housing & Rooms",
    shortName: "Housing",
    icon: "🏡",
    iconBg: "bg-cyan-600",
    category: "Shelter",
    themeColor: "#0891B2",
    previewGradient: "from-cyan-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/legal": {
    title: "Legal Aid & Asylum",
    shortName: "Legal Aid",
    icon: "⚖️",
    iconBg: "bg-rose-600",
    category: "Legal",
    themeColor: "#E11D48",
    previewGradient: "from-rose-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/checklist": {
    title: "Immigration Checklist",
    shortName: "Checklist",
    icon: "📋",
    iconBg: "bg-amber-600",
    category: "Legal",
    themeColor: "#D97706",
    previewGradient: "from-amber-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/religion": {
    title: "Places of Worship",
    shortName: "Worship",
    icon: "🕌",
    iconBg: "bg-amber-600",
    category: "Community",
    themeColor: "#D97706",
    previewGradient: "from-amber-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/religious": {
    title: "Places of Worship",
    shortName: "Worship",
    icon: "🕌",
    iconBg: "bg-amber-600",
    category: "Community",
    themeColor: "#D97706",
    previewGradient: "from-amber-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/schools": {
    title: "Schools & ESL Classes",
    shortName: "Education",
    icon: "🎓",
    iconBg: "bg-violet-600",
    category: "Education",
    themeColor: "#7C3AED",
    previewGradient: "from-violet-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/hospitals": {
    title: "Healthcare & Free Clinics",
    shortName: "Health",
    icon: "🏥",
    iconBg: "bg-red-600",
    category: "Healthcare",
    themeColor: "#DC2626",
    previewGradient: "from-red-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/food": {
    title: "Halal & Ethnic Grocery",
    shortName: "Groceries",
    icon: "🛒",
    iconBg: "bg-yellow-600",
    category: "Food",
    themeColor: "#CA8A04",
    previewGradient: "from-yellow-600/20 via-slate-900/90 to-slate-950",
  },
  "/services/embassy": {
    title: "Embassy & Consulates",
    shortName: "Embassy",
    icon: "🏛️",
    iconBg: "bg-slate-700",
    category: "Diplomatic",
    themeColor: "#334155",
    previewGradient: "from-slate-700/20 via-slate-900/90 to-slate-950",
  },
  "/services": {
    title: "Services Hub",
    shortName: "Services",
    icon: "⚡",
    iconBg: "bg-amber-500",
    category: "Services",
    themeColor: "#F59E0B",
    previewGradient: "from-amber-500/20 via-slate-900/90 to-slate-950",
  },
  "/messages": {
    title: "Direct Messages",
    shortName: "Messages",
    icon: "💬",
    iconBg: "bg-teal-600",
    category: "Chat",
    themeColor: "#0D9488",
    previewGradient: "from-teal-600/20 via-slate-900/90 to-slate-950",
  },
  "/explore": {
    title: "Explore Search",
    shortName: "Explore",
    icon: "🔍",
    iconBg: "bg-sky-600",
    category: "Search",
    themeColor: "#0284C7",
    previewGradient: "from-sky-600/20 via-slate-900/90 to-slate-950",
  },
  "/communities": {
    title: "Diaspora Communities",
    shortName: "Communities",
    icon: "👥",
    iconBg: "bg-indigo-600",
    category: "Social",
    themeColor: "#4F46E5",
    previewGradient: "from-indigo-600/20 via-slate-900/90 to-slate-950",
  },
  "/qa": {
    title: "Q&A Forum",
    shortName: "Q&A",
    icon: "❓",
    iconBg: "bg-emerald-700",
    category: "Forum",
    themeColor: "#047857",
    previewGradient: "from-emerald-700/20 via-slate-900/90 to-slate-950",
  },
  "/saved": {
    title: "Saved Resources",
    shortName: "Saved",
    icon: "🔖",
    iconBg: "bg-yellow-600",
    category: "Bookmarks",
    themeColor: "#CA8A04",
    previewGradient: "from-yellow-600/20 via-slate-900/90 to-slate-950",
  },
  "/profile": {
    title: "User Profile",
    shortName: "Profile",
    icon: "👤",
    iconBg: "bg-slate-700",
    category: "Account",
    themeColor: "#334155",
    previewGradient: "from-slate-700/20 via-slate-900/90 to-slate-950",
  },
  "/more": {
    title: "All Features Menu",
    shortName: "All Apps",
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
  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
  return {
    title: capitalized,
    shortName: capitalized.split(" ")[0],
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
}

const MobileTabContext = createContext<MobileTabContextType | null>(null);

const STORAGE_KEY = "android_recent_tasks_v4";

export function MobileTabProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<AndroidAppTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: any) => {
            const meta = getTaskMeta(t.path || "/feed");
            return {
              ...t,
              title: meta.title,
              shortName: meta.shortName,
              icon: meta.icon,
              iconBg: meta.iconBg,
              category: meta.category,
              themeColor: meta.themeColor,
              previewGradient: meta.previewGradient,
            };
          });
        }
      }
    } catch (_) {}

    // Varied distinct open tasks matching common app features
    const feedMeta = getTaskMeta("/feed");
    const mapMeta = getTaskMeta("/map");
    const jobsMeta = getTaskMeta("/services/jobs");
    const ordersMeta = getTaskMeta("/orders");

    return [
      {
        id: "task-feed",
        path: "/feed",
        title: feedMeta.title,
        shortName: feedMeta.shortName,
        icon: feedMeta.icon,
        iconBg: feedMeta.iconBg,
        category: feedMeta.category,
        themeColor: feedMeta.themeColor,
        previewGradient: feedMeta.previewGradient,
        timestamp: Date.now() - 40000,
      },
      {
        id: "task-map",
        path: "/map",
        title: mapMeta.title,
        shortName: mapMeta.shortName,
        icon: mapMeta.icon,
        iconBg: mapMeta.iconBg,
        category: mapMeta.category,
        themeColor: mapMeta.themeColor,
        previewGradient: mapMeta.previewGradient,
        timestamp: Date.now() - 25000,
      },
      {
        id: "task-jobs",
        path: "/services/jobs",
        title: jobsMeta.title,
        shortName: jobsMeta.shortName,
        icon: jobsMeta.icon,
        iconBg: jobsMeta.iconBg,
        category: jobsMeta.category,
        themeColor: jobsMeta.themeColor,
        previewGradient: jobsMeta.previewGradient,
        timestamp: Date.now() - 10000,
      },
      {
        id: "task-orders",
        path: "/orders",
        title: ordersMeta.title,
        shortName: ordersMeta.shortName,
        icon: ordersMeta.icon,
        iconBg: ordersMeta.iconBg,
        category: ordersMeta.category,
        themeColor: ordersMeta.themeColor,
        previewGradient: ordersMeta.previewGradient,
        timestamp: Date.now(),
      },
    ];
  });

  const [activeTaskId, setActiveTaskId] = useState<string>(() => {
    return tasks[0]?.id || "task-feed";
  });

  const [isRecentsOpen, setIsRecentsOpen] = useState(false);
  const [activeTaskToast, setActiveTaskToast] = useState<string | null>(null);

  // Sync tasks
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (_) {}
  }, [tasks]);

  // Track location changes and add task
  useEffect(() => {
    const currentPath = location.pathname;
    if (
      currentPath === "/" ||
      currentPath === "/landing" ||
      currentPath === "/login" ||
      currentPath === "/signup" ||
      currentPath.startsWith("/onboarding") ||
      currentPath === "/verify-email"
    ) {
      return;
    }

    setTasks(prev => {
      const existing = prev.find(t => t.path === currentPath);
      if (existing) {
        setActiveTaskId(existing.id);
        return prev.map(t => t.id === existing.id ? { ...t, timestamp: Date.now() } : t);
      }

      const meta = getTaskMeta(currentPath);
      const newTask: AndroidAppTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        path: currentPath,
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
      if (updated.length > 8) {
        updated.shift();
      }
      setActiveTaskId(newTask.id);
      return updated;
    });
  }, [location.pathname]);

  const showToast = useCallback((msg: string) => {
    setActiveTaskToast(msg);
    setTimeout(() => {
      setActiveTaskToast(null);
    }, 1400);
  }, []);

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
      if (prev.length <= 1) {
        const meta = getTaskMeta("/feed");
        const defaultTask: AndroidAppTask = {
          id: `task-feed-${Date.now()}`,
          path: "/feed",
          title: meta.title,
          shortName: meta.shortName,
          icon: meta.icon,
          iconBg: meta.iconBg,
          category: meta.category,
          themeColor: meta.themeColor,
          previewGradient: meta.previewGradient,
          timestamp: Date.now(),
        };
        navigate("/feed");
        setActiveTaskId(defaultTask.id);
        return [defaultTask];
      }

      const filtered = prev.filter(t => t.id !== taskId);
      if (activeTaskId === taskId) {
        const next = filtered[filtered.length - 1];
        if (next) {
          setActiveTaskId(next.id);
          navigate(next.path);
        }
      }
      return filtered;
    });
  }, [activeTaskId, navigate]);

  const clearAllTasks = useCallback(() => {
    const meta = getTaskMeta("/feed");
    const defaultTask: AndroidAppTask = {
      id: `task-feed-${Date.now()}`,
      path: "/feed",
      title: meta.title,
      shortName: meta.shortName,
      icon: meta.icon,
      iconBg: meta.iconBg,
      category: meta.category,
      themeColor: meta.themeColor,
      previewGradient: meta.previewGradient,
      timestamp: Date.now(),
    };
    setTasks([defaultTask]);
    setActiveTaskId(defaultTask.id);
    setIsRecentsOpen(false);
    navigate("/feed");
  }, [navigate]);

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
