// ─── MyBox shared localStorage utilities ─────────────────────────────────────

export type MyBoxFavourite = {
  id: string;
  name: string;
  emoji: string;
  type: "service" | "provider";
  path: string;
  subtitle?: string;
};

const FAV_KEY = "ic_mybox_favourites";

export function getFavourites(): MyBoxFavourite[] {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); }
  catch { return []; }
}

export function saveFavourites(items: MyBoxFavourite[]) {
  localStorage.setItem(FAV_KEY, JSON.stringify(items));
}

export function addFavourite(item: MyBoxFavourite): MyBoxFavourite[] {
  const current = getFavourites();
  if (current.some(f => f.id === item.id)) return current;
  const next = [...current, item];
  saveFavourites(next);
  return next;
}

export function removeFavourite(id: string): MyBoxFavourite[] {
  const next = getFavourites().filter(f => f.id !== id);
  saveFavourites(next);
  return next;
}

export function isFavourited(id: string): boolean {
  return getFavourites().some(f => f.id === id);
}

// ─── Quick feature shortcuts (existing storage) ────────────────────────────────

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
