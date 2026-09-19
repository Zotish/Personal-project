import { useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router";
import { trackVisit, trackSearch } from "../../utils/myBox";

const ROUTE_LABELS: Record<string, { name: string; type: "service" | "page" | "provider" }> = {
  "/explore": { name: "Explore", type: "page" },
  "/map": { name: "Map", type: "page" },
  "/services/jobs": { name: "Jobs", type: "service" },
  "/services/housing": { name: "Housing", type: "service" },
  "/services/free-food": { name: "Free Food", type: "service" },
  "/services/food-bank": { name: "Free Food", type: "service" },
  "/services/legal": { name: "Legal Aid", type: "service" },
  "/services/legal-aid": { name: "Legal Aid", type: "service" },
  "/services/embassy": { name: "Embassy", type: "service" },
  "/services/consulate": { name: "Embassy", type: "service" },
  "/services/schools": { name: "Education", type: "service" },
  "/services/religious": { name: "Religion", type: "service" },
  "/services/religion": { name: "Religion", type: "service" },
  "/services/community-hospital": { name: "Hospital", type: "service" },
  "/services/hospitals": { name: "Hospital", type: "service" },
  "/services/pharmacy": { name: "Pharmacy", type: "service" },
  "/services/free-medicine": { name: "Free Medicine", type: "service" },
  "/services/social-services": { name: "Social Aid", type: "service" },
  "/services/social-aid": { name: "Social Aid", type: "service" },
  "/services/petrol": { name: "Gas & EV", type: "service" },
  "/services/gas": { name: "Gas & EV", type: "service" },
  "/services/sports": { name: "Sports", type: "service" },
  "/services/checklist": { name: "Immigration Checklist", type: "service" },
  "/services/food": { name: "Halal Food", type: "service" },
  "/services/home-kitchen": { name: "Halal Food", type: "service" },
  "/communities": { name: "Communities", type: "page" },
  "/qa": { name: "Q&A", type: "page" },
  "/reels": { name: "Reels", type: "page" },
  "/saved": { name: "Saved", type: "page" },
  "/messages": { name: "Messages", type: "page" },
  "/notifications": { name: "Notifications", type: "page" },
  "/orders": { name: "Orders", type: "page" },
  "/seller-dashboard": { name: "Seller Dashboard", type: "page" },
};

const IGNORED_PREFIXES = [
  "/",
  "/login",
  "/signup",
  "/landing",
  "/verify-email",
  "/onboarding",
  "/admin",
];

export function AutoFavouriteTracker() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const lastTrackedPath = useRef<string>("");

  // Track page visits
  useEffect(() => {
    const path = location.pathname;

    // Avoid double counting same path on hot reload or query changes
    if (lastTrackedPath.current === path) return;
    lastTrackedPath.current = path;

    // Check if ignored
    if (path === "/" || IGNORED_PREFIXES.some(prefix => prefix !== "/" && path.startsWith(prefix))) {
      return;
    }

    // Check exact known routes
    if (ROUTE_LABELS[path]) {
      const info = ROUTE_LABELS[path];
      trackVisit({
        id: `route-${path.replace(/\//g, "-")}`,
        name: info.name,
        path,
        type: info.type,
      });
      return;
    }

    // Dynamic service detail: /services/:id
    if (path.startsWith("/services/")) {
      const id = path.replace("/services/", "");
      const cleanName = id
        .split("-")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      trackVisit({
        id: `service-${id}`,
        name: `${cleanName} Service`,
        path,
        type: "service",
      });
      return;
    }

    // Dynamic store / seller: /seller/:id or /store/:id
    if (path.startsWith("/seller/") || path.startsWith("/store/")) {
      const id = path.split("/")[2] || "profile";
      trackVisit({
        id: `seller-${id}`,
        name: `Store #${id}`,
        path,
        type: "provider",
      });
    }
  }, [location.pathname]);

  // Track search queries from URL params
  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q") || searchParams.get("query");
    if (q && q.trim().length >= 2) {
      trackSearch(q.trim());
    }
  }, [searchParams]);

  // Listen to custom search event
  useEffect(() => {
    const handleSearchEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string; path?: string }>;
      if (customEvent.detail?.query) {
        trackSearch(customEvent.detail.query, customEvent.detail.path);
      }
    };

    window.addEventListener("track-search", handleSearchEvent);
    return () => window.removeEventListener("track-search", handleSearchEvent);
  }, []);

  return null;
}
