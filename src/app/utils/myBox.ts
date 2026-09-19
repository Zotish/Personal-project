// ─── MyBox shared localStorage utilities ─────────────────────────────────────

export type MyBoxFavourite = {
  id: string;
  name: string;
  emoji?: string;
  type: "service" | "provider" | "search" | "page";
  path: string;
  subtitle?: string;
  autoAdded?: boolean;
  visitCount?: number;
};

const FAV_KEY = "ic_mybox_favourites";
const VISIT_TRACK_KEY = "ic_visit_frequency";
const SEARCH_TRACK_KEY = "ic_search_frequency";
export const AUTO_FAVOURITE_THRESHOLD = 5; // 5-6 times threshold

export const DEFAULT_FAVOURITES: MyBoxFavourite[] = [
  { id: "fav-hospital", name: "Hospital", type: "service", path: "/services/community-hospital" },
  { id: "fav-legal", name: "Legal Aid", type: "service", path: "/services/legal" },
  { id: "fav-jobs", name: "Jobs", type: "service", path: "/services/jobs" },
  { id: "fav-housing", name: "Housing", type: "service", path: "/services/housing" },
];

// ─── Deduplicate favourites by name, path, or id ─────────────────────────────
export function deduplicateFavourites(items: MyBoxFavourite[]): MyBoxFavourite[] {
  const seenNames = new Set<string>();
  const seenPaths = new Set<string>();
  const seenIds = new Set<string>();
  const unique: MyBoxFavourite[] = [];

  for (const item of items) {
    if (!item || !item.name) continue;
    const nameKey = item.name.trim().toLowerCase();
    const pathKey = item.path ? item.path.trim().toLowerCase() : "";
    const idKey = item.id ? item.id.trim().toLowerCase() : "";

    // If duplicate by name, path, or id, skip
    if (seenNames.has(nameKey) || (pathKey && seenPaths.has(pathKey)) || (idKey && seenIds.has(idKey))) {
      continue;
    }

    seenNames.add(nameKey);
    if (pathKey) seenPaths.add(pathKey);
    if (idKey) seenIds.add(idKey);

    // Clean any legacy visit count subtitle
    const cleanItem = { ...item };
    delete cleanItem.subtitle;
    unique.push(cleanItem);
  }

  return unique;
}

// ─── Smart destination resolver for searches to direct sections ──────────────
export function resolveSearchDestination(query: string): { name: string; path: string; type: "service" | "page" | "search" } {
  const q = query.trim().toLowerCase();

  // Hospital / Health / Doctor / Clinic
  if (/hospital|clinic|doctor|medicaid|uninsured|daktar|health/i.test(q)) {
    return { name: "Hospital", path: "/services/community-hospital", type: "service" };
  }
  // Job / Work
  if (/job|work|career|hiring|cash|employment|resume|interview|part time|full time|kaj|chakri/i.test(q)) {
    return { name: "Jobs", path: "/services/jobs", type: "service" };
  }
  // Housing / Rent
  if (/hous|rent|room|flat|apartment|sublet|tenant|shelter|basha|bari|roommate/i.test(q)) {
    return { name: "Housing", path: "/services/housing", type: "service" };
  }
  // Free Food / Food bank / Halal
  if (/free food|food bank|pantry|bhandar|khabar/i.test(q)) {
    return { name: "Free Food", path: "/services/free-food", type: "service" };
  }
  if (/halal|grocery|groceries|fish|meat|store|deshi|bazar|masala|kitchen/i.test(q)) {
    return { name: "Halal Food", path: "/services/home-kitchen", type: "service" };
  }
  // Legal Aid / Immigration
  if (/legal|lawyer|attorney|immigration|asylum|green card|tps|ead|visa|work permit|uscis|law|court|ukil/i.test(q)) {
    return { name: "Legal Aid", path: "/services/legal", type: "service" };
  }
  // Embassy / Consulate / Passport / NID
  if (/embassy|consulate|passport|nid|power of attorney|nvr|high commission/i.test(q)) {
    return { name: "Embassy", path: "/services/embassy", type: "service" };
  }
  // Pharmacy / Medicine
  if (/medicine|rx|prescription|pharmacy/i.test(q)) {
    return { name: "Pharmacy", path: "/services/pharmacy", type: "service" };
  }
  // Religion / Mosque
  if (/mosque|masjid|temple|church|religion|faith|namaz|jummah|prayer/i.test(q)) {
    return { name: "Religion", path: "/services/religious", type: "service" };
  }
  // Education / ESL / Schools
  if (/esl|english|ged|school|college|admission|class|course|porashona/i.test(q)) {
    return { name: "Education", path: "/services/schools", type: "service" };
  }
  // Map / Nearby
  if (/map|nearby|near me|location|kothay|direction/i.test(q)) {
    return { name: "Map", path: "/map", type: "page" };
  }
  // Community / Groups
  if (/community|communities|group|association|probashi|shomiti/i.test(q)) {
    return { name: "Communities", path: "/communities", type: "page" };
  }
  // Q&A / Questions
  if (/question|ask|qa|q&a|help|proshno/i.test(q)) {
    return { name: "Q&A", path: "/qa", type: "page" };
  }
  // Reels
  if (/reel|video|clip|short/i.test(q)) {
    return { name: "Reels", path: "/reels", type: "page" };
  }
  // Transit / Subway
  if (/subway|mta|bus|transit|metro|train|omny/i.test(q)) {
    return { name: "Transport", path: "/services/subway", type: "service" };
  }

  // Capitalize query for general search
  const cleanTitle = query
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return {
    name: cleanTitle,
    path: `/services?search=${encodeURIComponent(query.trim())}`,
    type: "search"
  };
}

export function getFavourites(): MyBoxFavourite[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    let items: MyBoxFavourite[] = raw ? JSON.parse(raw) : [...DEFAULT_FAVOURITES];

    // Clean up generic "Services Hub" container
    items = items.filter(f => f.name !== "Services Hub" && f.id !== "route--services");

    // Strictly deduplicate by name, path, and ID
    const unique = deduplicateFavourites(items);

    // If list had duplicates, persist clean version back to localStorage
    if (raw && unique.length !== items.length) {
      localStorage.setItem(FAV_KEY, JSON.stringify(unique));
    }

    return unique;
  }
  catch { return [...DEFAULT_FAVOURITES]; }
}

export function saveFavourites(items: MyBoxFavourite[]) {
  const unique = deduplicateFavourites(items);
  localStorage.setItem(FAV_KEY, JSON.stringify(unique));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("favourites-updated"));
  }
}

export function addFavourite(item: MyBoxFavourite): MyBoxFavourite[] {
  const current = getFavourites();
  const itemNormName = (item.name || "").trim().toLowerCase();
  const itemNormPath = item.path ? item.path.trim().toLowerCase() : "";

  // Check if item already exists by ID, name, or path
  const existingIdx = current.findIndex(f => {
    if (f.id === item.id) return true;
    if (f.name && f.name.trim().toLowerCase() === itemNormName) return true;
    if (itemNormPath && f.path && f.path.trim().toLowerCase() === itemNormPath) return true;
    return false;
  });

  let next: MyBoxFavourite[];
  if (existingIdx >= 0) {
    next = [...current];
    // Consolidate into existing entry without creating a duplicate
    next[existingIdx] = {
      ...next[existingIdx],
      ...item,
      id: next[existingIdx].id, // preserve existing ID
      name: item.name || next[existingIdx].name,
      path: item.path || next[existingIdx].path,
      type: item.type || next[existingIdx].type,
      subtitle: undefined,
    };
  } else {
    next = [{ ...item, subtitle: undefined }, ...current];
  }

  const unique = deduplicateFavourites(next);
  saveFavourites(unique);
  return unique;
}

export function removeFavourite(id: string): MyBoxFavourite[] {
  const next = getFavourites().filter(f => f.id !== id);
  saveFavourites(next);
  return next;
}

export function isFavourited(id: string): boolean {
  return getFavourites().some(f => f.id === id);
}

// ─── Auto-favourite tracking for visits (5-6 visits triggers automatic favourite) ───

export function trackVisit(item: {
  id: string;
  name: string;
  path: string;
  subtitle?: string;
  type?: "service" | "provider" | "page";
}) {
  if (!item || !item.id || !item.name) return;
  try {
    const raw = localStorage.getItem(VISIT_TRACK_KEY);
    const visits: Record<string, { count: number; name: string; path: string; subtitle?: string; type: "service" | "provider" | "page" }> = raw ? JSON.parse(raw) : {};

    const existing = visits[item.id] || {
      count: 0,
      name: item.name,
      path: item.path,
      subtitle: item.subtitle,
      type: item.type || "service",
    };

    existing.count = (existing.count || 0) + 1;
    existing.name = item.name;
    existing.path = item.path;
    visits[item.id] = existing;

    localStorage.setItem(VISIT_TRACK_KEY, JSON.stringify(visits));

    // If visited 5 or more times, auto-add to MyBox favourites without displaying visit counts
    if (existing.count >= AUTO_FAVOURITE_THRESHOLD) {
      addFavourite({
        id: item.id,
        name: item.name,
        type: existing.type,
        path: item.path,
        autoAdded: true,
        visitCount: existing.count,
      });
    }
  } catch (e) {
    console.error("trackVisit error:", e);
  }
}

// ─── Auto-favourite tracking for searches (5-6 searches triggers automatic favourite) ───

export function trackSearch(query: string, searchPath?: string) {
  if (!query || query.trim().length < 2) return;
  const cleanQuery = query.trim();
  const queryKey = cleanQuery.toLowerCase();

  try {
    const raw = localStorage.getItem(SEARCH_TRACK_KEY);
    const searches: Record<string, { count: number; query: string; path: string }> = raw ? JSON.parse(raw) : {};

    const resolved = resolveSearchDestination(cleanQuery);
    const targetPath = searchPath || resolved.path;
    const resolvedName = resolved.name;

    const existing = searches[queryKey] || { count: 0, query: cleanQuery, path: targetPath };
    existing.count = (existing.count || 0) + 1;
    existing.path = targetPath;
    searches[queryKey] = existing;

    localStorage.setItem(SEARCH_TRACK_KEY, JSON.stringify(searches));

    // If searched 5 or more times, auto-add to MyBox favourites without displaying visit counts
    if (existing.count >= AUTO_FAVOURITE_THRESHOLD) {
      addFavourite({
        id: `search-${encodeURIComponent(queryKey)}`,
        name: resolvedName,
        type: resolved.type,
        path: existing.path,
        autoAdded: true,
        visitCount: existing.count,
      });
    }
  } catch (e) {
    console.error("trackSearch error:", e);
  }
}

// ─── Quick feature shortcuts storage (legacy compatibility) ─────────────────────

const PIN_KEY   = "ic_quick_pinned";
const USAGE_KEY = "ic_feature_usage";

export function getPinnedShortcuts(): string[] {
  try { return JSON.parse(localStorage.getItem(PIN_KEY) || "[]"); }
  catch { return []; }
}

export function getUsageCounts(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(USAGE_KEY) || "{}"); }
  catch { return {}; }
}
