/**
 * Universal Map Share & Deep Linking Utility (Google Maps Style)
 * Generates rich shareable map URLs containing coordinates, name, category,
 * address and image so any recipient opening the link will immediately
 * fly to the exact location and see the pinned place card.
 */

export interface ShareablePlaceItem {
  id?: string | number;
  name?: string;
  title?: string;
  lat: number;
  lng: number;
  category?: string;
  address?: string;
  location?: string;
  image?: string;
  phone?: string;
  description?: string;
}

export function buildMapShareUrl(item: ShareablePlaceItem): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const params = new URLSearchParams();

  if (item.id !== undefined && item.id !== null) {
    params.set("placeId", String(item.id));
  }
  params.set("lat", String(item.lat));
  params.set("lng", String(item.lng));

  const displayName = item.name || item.title || "Shared Location";
  params.set("name", displayName);

  if (item.category) params.set("category", item.category);
  const displayAddress = item.address || item.location;
  if (displayAddress) params.set("address", displayAddress);
  if (item.image) params.set("image", item.image);
  if (item.phone) params.set("phone", item.phone);
  if (item.description) params.set("desc", item.description);

  return `${origin}/map?${params.toString()}`;
}

export async function shareOrCopy(item: {
  title: string;
  text?: string;
  url: string;
}): Promise<"shared" | "copied" | "failed"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: item.title,
        text: item.text || `Check out ${item.title} on Pathasathi Map!`,
        url: item.url,
      });
      return "shared";
    } catch (_) {
      // If user cancels or browser rejects share, fall back to clipboard
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(item.url);
      return "copied";
    } catch (_) {
      return "failed";
    }
  }

  return "failed";
}
