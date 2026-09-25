// ─── Mapbox & Global Mapping / Geocoding Fallback Service ───────────────────────
// Provides seamless worldwide mapping, reverse geocoding, and place discovery
// when BariKoi is unavailable or when operating in countries outside Bangladesh (e.g. USA, UK, Canada).

import { BariKoiAddressInfo, CuratedPlace, BARIKOI_API_KEY, isBariKoiAvailable, triggerBariKoiCooldown } from "./barikoiService";

// Mapbox Token from environment, with optional user token support
export const MAPBOX_TOKEN: string =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_MAPBOX_TOKEN || import.meta.env?.VITE_MAPBOX_API_KEY)) ||
  "";

// ─── Geographic Boundary Detection ───────────────────────────────────────────
// Bounding box for Bangladesh: Lat ~20.57 to 26.63, Lng ~88.01 to 92.67
export function isLocationInBangladesh(lat: number, lng: number): boolean {
  return lat >= 20.5 && lat <= 26.7 && lng >= 88.0 && lng <= 92.7;
}

// Check if a country code is Bangladesh
export function isBangladeshCountry(countryCode?: string): boolean {
  if (!countryCode) return false;
  const c = countryCode.trim().toUpperCase();
  return c === "BD" || c === "BANGLADESH";
}

// Check if a country code is USA
export function isUsaCountry(countryCode?: string): boolean {
  if (!countryCode) return false;
  const c = countryCode.trim().toUpperCase();
  return c === "US" || c === "USA" || c === "UNITED STATES";
}

// Geographic bounding box for USA (including Contiguous US, Alaska, Hawaii, Puerto Rico)
export function isLocationInUSA(lat: number, lng: number): boolean {
  // Contiguous US & Puerto Rico
  if (lat >= 17.5 && lat <= 50.0 && lng >= -126.0 && lng <= -65.0) return true;
  // Alaska
  if (lat >= 50.0 && lat <= 72.0 && lng >= -179.5 && lng <= -129.0) return true;
  // Hawaii
  if (lat >= 18.0 && lat <= 23.5 && lng >= -161.0 && lng <= -154.0) return true;
  return false;
}

/**
 * Retrieves the currently active country code from platform storage or URL.
 */
export function getActivePlatformCountryCode(): string {
  return "BD";
}

/**
 * Returns true as BariKoi is used for Bangladesh (the only supported country).
 */
export function isBarikoiSupportedCountry(_countryCode?: string, _lat?: number, _lng?: number): boolean {
  return true;
}

// ─── Global Vector & Raster Map Styles ────────────────────────────────────────
// Mapbox raster style object compatible with MapLibre GL / bkoi-gl (bypasses mapbox:// protocol limitations)
export function getMapboxRasterStyle(): any {
  const token = MAPBOX_TOKEN ? MAPBOX_TOKEN.trim() : "";
  if (token && token.length > 10) {
    return {
      version: 8,
      name: "Mapbox Streets",
      sources: {
        "mapbox-streets": {
          type: "raster",
          tiles: [
            `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${token}`
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        }
      },
      layers: [
        {
          id: "mapbox-streets-layer",
          type: "raster",
          source: "mapbox-streets",
          minzoom: 0,
          maxzoom: 22
        }
      ]
    };
  }
  return getOsmRasterStyle();
}

// Universal OpenStreetMap raster style for MapLibre GL / bkoi-gl
export function getOsmRasterStyle(): any {
  return {
    version: 8,
    name: "OpenStreetMap",
    sources: {
      "osm-tiles": {
        type: "raster",
        tiles: [
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        ],
        tileSize: 256,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }
    },
    layers: [
      {
        id: "osm-layer",
        type: "raster",
        source: "osm-tiles",
        minzoom: 0,
        maxzoom: 19
      }
    ]
  };
}

let isBariKoiTileServerBroken = false;

// Clear stale tile server outage flag on load so BariKoi is always given first priority!
try {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem("bkoi_tiles_down");
  }
} catch (_) {}

export function markBariKoiTileServerBroken() {
  isBariKoiTileServerBroken = true;
}

export function resetBariKoiTileServerStatus() {
  isBariKoiTileServerBroken = false;
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("bkoi_tiles_down");
    }
  } catch (_) {}
}

export type MapWatermarkProvider = "barikoi" | "mapbox" | "osm";

/**
 * Creates and mounts a custom watermark badge (BariKoi, Mapbox, or OpenStreetMap) at the bottom-left
 * of the map, completely replacing the default MapLibre logo.
 */
export function setupMapWatermark(map: any, forcedProvider?: MapWatermarkProvider): {
  setProvider: (provider: MapWatermarkProvider) => void;
  cleanup: () => void;
} {
  const center = map?.getCenter?.();
  const isBkoiSupported = center && typeof center.lat === "number" && typeof center.lng === "number"
    ? isBarikoiSupportedCountry(undefined, center.lat, center.lng)
    : isBarikoiSupportedCountry();

  const determineProvider = (_activeMap: any): MapWatermarkProvider => {
    if (forcedProvider) return forcedProvider;
    if (isBariKoiTileServerBroken) {
      return (MAPBOX_TOKEN && MAPBOX_TOKEN.trim().length > 10) ? "mapbox" : "osm";
    }
    return "barikoi";
  };

  let currentProvider: MapWatermarkProvider = forcedProvider || "barikoi";
  let watermarkElement: HTMLElement | null = null;
  let observer: MutationObserver | null = null;

  const getContainer = (): HTMLElement | null => {
    try {
      if (typeof map.getContainer === "function") return map.getContainer();
      if (map._container) return map._container;
    } catch (_) {}
    return null;
  };

  const removeDefaultMapLibreLogo = () => {
    const container = getContainer();
    if (!container) return;
    const logos = container.querySelectorAll(".maplibregl-ctrl-logo, .bkoi-gl-ctrl-logo");
    logos.forEach((el) => {
      (el as HTMLElement).style.display = "none";
      (el as HTMLElement).style.visibility = "hidden";
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.pointerEvents = "none";
      if (el.parentElement && el.parentElement.children.length === 1) {
        (el.parentElement as HTMLElement).style.display = "none";
      }
    });

    // If outside Bangladesh, suppress any rogue BariKoi elements injected by CDN SDK
    if (!isBkoiSupported) {
      const rogue = container.querySelectorAll("a[href*='barikoi.com'], .bkoi-watermark");
      rogue.forEach((el) => {
        if (!watermarkElement || !watermarkElement.contains(el)) {
          (el as HTMLElement).style.display = "none";
          (el as HTMLElement).style.visibility = "hidden";
        }
      });
    }
  };

  const renderBadgeHTML = (provider: MapWatermarkProvider): string => {
    if (provider === "barikoi") {
      return `
        <a href="https://barikoi.com" target="_blank" rel="noopener noreferrer" class="map-provider-watermark bkoi-watermark" title="Powered by BariKoi" aria-label="BariKoi logo">
          <svg class="bkoi-pin-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#00A86B"/>
            <path d="M12 6.5L8.5 9.7v4.3h2.2v-2.7h2.6v2.7h2.2V9.7L12 6.5z" fill="#FFFFFF"/>
          </svg>
          <span class="brand-text"><span class="brand-dark">bari</span><span class="brand-green">koi</span></span>
        </a>
      `;
    }
    if (provider === "mapbox") {
      return `
        <a href="https://www.mapbox.com" target="_blank" rel="noopener noreferrer" class="map-provider-watermark mapbox-watermark" title="Powered by Mapbox" aria-label="Mapbox logo">
          <svg class="mapbox-box-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7.5L12 13L21 7.5L12 2Z" fill="#4264FB" fill-opacity="0.9"/>
            <path d="M3 10.5L12 16L21 10.5M3 14.5L12 20L21 14.5" stroke="#4264FB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="brand-text brand-mapbox">mapbox</span>
        </a>
      `;
    }
    return `
      <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" class="map-provider-watermark osm-watermark" title="Powered by OpenStreetMap" aria-label="OpenStreetMap logo">
        <svg class="osm-globe-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="#0284c7" stroke-width="2"/>
          <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 000 18 14 14 0 000-18z" stroke="#0284c7" stroke-width="2"/>
        </svg>
        <span class="brand-text"><span class="brand-osm" style="color: #0284c7; font-weight: 700;">OpenStreetMap</span></span>
      </a>
    `;
  };

  const mountOrUpdate = () => {
    const container = getContainer();
    if (!container) return;

    removeDefaultMapLibreLogo();

    // Look for .maplibregl-ctrl-bottom-left
    let ctrlBottomLeft = container.querySelector(".maplibregl-ctrl-bottom-left") as HTMLElement | null;

    if (!watermarkElement) {
      watermarkElement = document.createElement("div");
      watermarkElement.className = "maplibregl-ctrl map-provider-ctrl";
    }

    watermarkElement.innerHTML = renderBadgeHTML(currentProvider);

    if (ctrlBottomLeft) {
      if (!ctrlBottomLeft.contains(watermarkElement)) {
        ctrlBottomLeft.appendChild(watermarkElement);
      }
    } else {
      // If .maplibregl-ctrl-bottom-left is not ready yet or on Leaflet, attach to container with fallback styling
      if (!container.contains(watermarkElement)) {
        watermarkElement.style.position = "absolute";
        watermarkElement.style.bottom = "8px";
        watermarkElement.style.left = "8px";
        watermarkElement.style.zIndex = "10";
        container.appendChild(watermarkElement);
      }
    }
  };

  const setProvider = (newProvider: MapWatermarkProvider) => {
    currentProvider = newProvider;
    mountOrUpdate();
  };

  // Mount initially
  mountOrUpdate();

  // Retry after short delays in case MapLibre DOM initializes asynchronously
  const t1 = setTimeout(mountOrUpdate, 50);
  const t2 = setTimeout(mountOrUpdate, 300);
  const t3 = setTimeout(mountOrUpdate, 1000);

  // Listen to map events
  const onStyleLoad = () => {
    removeDefaultMapLibreLogo();
    try {
      const nextProvider = determineProvider(map);
      setProvider(nextProvider);
    } catch (_) {
      mountOrUpdate();
    }
  };

  try {
    map.on?.("style.load", onStyleLoad);
    map.on?.("load", mountOrUpdate);
  } catch (_) {}

  // Observe container for dynamically inserted MapLibre logo elements to suppress them
  const container = getContainer();
  if (container && typeof MutationObserver !== "undefined") {
    observer = new MutationObserver(() => {
      removeDefaultMapLibreLogo();
      if (watermarkElement && !container.contains(watermarkElement)) {
        mountOrUpdate();
      }
    });
    observer.observe(container, { childList: true, subtree: true });
  }

  return {
    setProvider,
    cleanup: () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (observer) observer.disconnect();
      try {
        map.off?.("style.load", onStyleLoad);
        map.off?.("load", mountOrUpdate);
      } catch (_) {}
      if (watermarkElement && watermarkElement.parentNode) {
        watermarkElement.parentNode.removeChild(watermarkElement);
      }
    },
  };
}

/**
 * Intercepts requests destined for broken BariKoi vector sub-layers (barikoi_admin, poi)
 * on tiles.bmapsbd.com which return 502 Bad Gateway without CORS headers.
 * Resolves them to empty data URIs in-memory so the browser never initiates failing network calls.
 */
export function bariKoiTransformRequest(url: string, resourceType?: string): { url: string } {
  if (!url) return { url };

  // 1. Intercept glyphs/font requests from broken tiles.bmapsbd.com/font/
  // Redirect to Mapbox's high-speed, official vector font protobufs (or MapLibre demotiles)
  if (resourceType === "Glyphs" || url.includes("/font/")) {
    const match = url.match(/\/([^/?#]+\.pbf)(\?.*)?$/i);
    const range = match ? match[1] : "0-255.pbf";
    const token = MAPBOX_TOKEN ? MAPBOX_TOKEN.trim() : "";
    if (token && token.length > 10) {
      return {
        url: `https://api.mapbox.com/fonts/v1/mapbox/Roboto%20Regular,Arial%20Unicode%20MS%20Regular/${range}?access_token=${token}`
      };
    }
    return {
      url: `https://demotiles.maplibre.org/font/Noto%20Sans%20Regular/${range}`
    };
  }

  // 2. Intercept the broken tile layers on tiles.bmapsbd.com (excluding planet and sprite which work)
  const isBrokenVectorEndpoint =
    url.includes("tiles.bmapsbd.com/") &&
    !url.includes("planet.tiles.bmapsbd.com") &&
    !url.includes("/sprite") &&
    !url.includes("/font");

  if (isBrokenVectorEndpoint) {
    // Any Source definition or non-coordinate URL resolves to empty TileJSON so MapLibre never fetches broken tiles
    if (resourceType === "Source" || !/\/\d+\/\d+\/\d+/.test(url)) {
      return {
        url: "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
          tilejson: "2.2.0",
          tiles: [],
          minzoom: 0,
          maxzoom: 22
        }))
      };
    }
    // For individual vector tile coordinates: return empty vector tile buffer
    return {
      url: "data:application/x-protobuf;base64,"
    };
  }

  return { url };
}

/**
 * Official BariKoi GL JS Loader with automatic CORS & 502 error interception.
 * Automatically injects MapLibre CSS, loads bkoi-gl, and patches Map constructor
 * so that broken upstream vector tile endpoints (tiles.bmapsbd.com/barikoi_admin, /poi)
 * never cause CORS blocks or console errors.
 */
export function loadBkoiGL(): Promise<any> {
  return new Promise((resolve, reject) => {
    const patchBkoiglMap = (bkoigl: any) => {
      if (!bkoigl || !bkoigl.Map || (bkoigl.Map as any).__patched) return;
      const OrigMap = bkoigl.Map;
      function PatchedMap(this: any, options: any) {
        const userTransform = options?.transformRequest;
        const mergedOptions = {
          ...options,
          transformRequest: (url: string, resourceType: string) => {
            const transformed = bariKoiTransformRequest(url, resourceType);
            if (userTransform) {
              return userTransform(transformed.url, resourceType);
            }
            return transformed;
          }
        };
        return new OrigMap(mergedOptions);
      }
      PatchedMap.prototype = OrigMap.prototype;
      Object.assign(PatchedMap, OrigMap);
      (PatchedMap as any).__patched = true;
      bkoigl.Map = PatchedMap;
    };

    if (typeof window === "undefined") {
      resolve(null);
      return;
    }

    if ((window as any).bkoigl) {
      const bkoigl = (window as any).bkoigl;
      patchBkoiglMap(bkoigl);
      resolve(bkoigl);
      return;
    }

    if (!document.getElementById("maplibre-gl-css")) {
      const css = document.createElement("link");
      css.id = "maplibre-gl-css";
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
      document.head.appendChild(css);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/bkoi-gl@latest/dist/iife/bkoi-gl.js";
    script.onload = () => {
      const bkoigl = (window as any).bkoigl;
      patchBkoiglMap(bkoigl);
      resolve(bkoigl);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Auto-patch window.bkoigl if already present on script evaluation
if (typeof window !== "undefined" && (window as any).bkoigl) {
  try {
    loadBkoiGL();
  } catch (_) {}
}

/**
 * Attaches a robust error listener to a bkoi-gl / MapLibre map instance.
 * If BariKoi style or tiles fail (e.g. 502 Bad Gateway, CORS, network error, or missing source layers),
 * it seamlessly switches the map to Mapbox Streets raster style and updates the watermark to Mapbox!
 */
export function attachMapboxFallbackOnError(map: any, countryCode?: string): () => void {
  let hasFallenBack = false;

  const center = map?.getCenter?.();
  const isBkoiSupported = isBarikoiSupportedCountry(
    countryCode,
    typeof center?.lat === "number" ? center.lat : undefined,
    typeof center?.lng === "number" ? center.lng : undefined
  );
  const initialProvider: MapWatermarkProvider = isBariKoiTileServerBroken
    ? (MAPBOX_TOKEN && MAPBOX_TOKEN.trim().length > 10 ? "mapbox" : "osm")
    : "barikoi";
  const watermark = setupMapWatermark(map, initialProvider);

  const triggerMapboxFallback = () => {
    if (hasFallenBack) return;
    hasFallenBack = true;
    markBariKoiTileServerBroken();
    watermark.setProvider((MAPBOX_TOKEN && MAPBOX_TOKEN.trim().length > 10) ? "mapbox" : "osm");
    console.warn("BariKoi tile server unavailable. Automatically falling back to global map...");
    try {
      map.setStyle(getMapboxRasterStyle());
    } catch (e) {
      console.error("Failed to switch to global fallback style:", e);
    }
  };

  const onError = (e: any) => {
    const url = (e?.error?.url || e?.url || e?.tile?.url || "").toLowerCase();
    const status = e?.error?.status || e?.status;
    const msg = (e?.error?.message || e?.message || "").toLowerCase();

    // 1. Ignore benign 404 on sparse vector layers (e.g. village, missing sprites)
    if (status === 404 || msg.includes("404")) {
      return;
    }

    // 2. Trigger fallback on true server outage (502 Bad Gateway, 503, 504, 500)
    const isServerOutage =
      status === 502 ||
      status === 503 ||
      status === 504 ||
      status === 500;

    // 3. Detect CORS block or network failure on primary BariKoi tiles / styles
    const isBariKoiTarget =
      url.includes("bmapsbd.com") ||
      url.includes("barikoi.com") ||
      msg.includes("bmapsbd.com") ||
      msg.includes("barikoi.com");

    const isNetworkOrCors =
      msg.includes("cors") ||
      msg.includes("failed to fetch") ||
      msg.includes("network") ||
      msg.includes("access-control") ||
      status === 0;

    const isPrimaryTileOutage =
      url.includes("planet") ||
      url.includes("style.json") ||
      !url;

    if (isServerOutage || (isNetworkOrCors && isBariKoiTarget && isPrimaryTileOutage)) {
      triggerMapboxFallback();
      return;
    }
  };

  map.on("error", onError);

  return () => {
    try {
      map.off("error", onError);
    } catch (_) {}
    watermark.cleanup();
  };
}


// Returns the optimal style for MapLibre / bkoi-gl based on location & provider availability
// Only Bangladesh is supported, using BariKoi official map style.
export function getMapStyleForLocation(_lat?: number, _lng?: number, _countryCode?: string): any {
  if (isBariKoiTileServerBroken) {
    return getMapboxRasterStyle();
  }
  return `https://map.barikoi.com/styles/barkoi_green_pl/style.json?key=${BARIKOI_API_KEY}`;
}

// Returns Leaflet TileLayer configuration using BariKoi
export function getLeafletTileConfig(_lat?: number, _lng?: number, _countryCode?: string) {
  if (!isBariKoiTileServerBroken) {
    return {
      url: `https://map.barikoi.com/styles/barkoi_green_pl/style.json?key=${BARIKOI_API_KEY}`,
      attribution: '&copy; <a href="https://barikoi.com">BariKoi</a>',
      maxZoom: 19,
      isVector: true,
    };
  }

  return {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    isVector: false,
  };
}

// ─── Major Global Diaspora Hubs (Fallback reverse geocode if offline) ─────────
interface GlobalHub {
  name: string;
  city: string;
  district: string;
  postCode: string;
  country: string;
  lat: number;
  lng: number;
}

const GLOBAL_DIASPORA_HUBS: GlobalHub[] = [
  // USA - New York
  { name: "Jackson Heights", city: "Queens, New York", district: "Queens County", postCode: "11372", country: "United States", lat: 40.7557, lng: -73.8831 },
  { name: "Midtown Manhattan", city: "New York", district: "New York County", postCode: "10001", country: "United States", lat: 40.7484, lng: -73.9857 },
  { name: "Jamaica", city: "Queens, New York", district: "Queens County", postCode: "11432", country: "United States", lat: 40.7027, lng: -73.7890 },
  { name: "Astoria", city: "Queens, New York", district: "Queens County", postCode: "11102", country: "United States", lat: 40.7644, lng: -73.9235 },
  { name: "Kensington / Little Bangladesh", city: "Brooklyn, New York", district: "Kings County", postCode: "11218", country: "United States", lat: 40.6385, lng: -73.9772 },
  { name: "Parkchester", city: "Bronx, New York", district: "Bronx County", postCode: "10462", country: "United States", lat: 40.8385, lng: -73.8617 },
  // USA - Other Major Cities
  { name: "Hamtramck", city: "Detroit", district: "Wayne County", postCode: "48212", country: "United States", lat: 42.3928, lng: -83.0538 },
  { name: "Little India / Devon", city: "Chicago", district: "Cook County", postCode: "60659", country: "United States", lat: 41.9981, lng: -87.6917 },
  { name: "Hillcroft / Mahatma Gandhi District", city: "Houston", district: "Harris County", postCode: "77036", country: "United States", lat: 29.7185, lng: -95.5005 },
  { name: "Fremont", city: "San Francisco Bay Area", district: "Alameda County", postCode: "94538", country: "United States", lat: 37.5485, lng: -121.9886 },
  { name: "Arlington / Alexandria", city: "Washington D.C. Area", district: "Arlington County", postCode: "22201", country: "United States", lat: 38.8816, lng: -77.0910 },
  // Canada
  { name: "Danforth / Greektown & Little Bangladesh", city: "Toronto", district: "Ontario", postCode: "M4C 1H8", country: "Canada", lat: 43.6865, lng: -79.3090 },
  { name: "Downtown Toronto", city: "Toronto", district: "Ontario", postCode: "M5H 2N2", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { name: "Côte-des-Neiges", city: "Montreal", district: "Quebec", postCode: "H3S 1W4", country: "Canada", lat: 45.4984, lng: -73.6267 },
  // United Kingdom
  { name: "Whitechapel / Brick Lane", city: "London", district: "Tower Hamlets", postCode: "E1 6QL", country: "United Kingdom", lat: 51.5175, lng: -0.0715 },
  { name: "Stratford", city: "London", district: "Newham", postCode: "E15 1AZ", country: "United Kingdom", lat: 51.5416, lng: -0.0034 },
  { name: "Central London", city: "London", district: "Greater London", postCode: "SW1A 1AA", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { name: "Sparkbrook", city: "Birmingham", district: "West Midlands", postCode: "B11 1AR", country: "United Kingdom", lat: 52.4612, lng: -1.8745 },
  // Norway
  { name: "Grønland / Tøyen", city: "Oslo", district: "Gamle Oslo", postCode: "0188", country: "Norway", lat: 59.9127, lng: 10.7622 },
  { name: "Oslo Sentrum", city: "Oslo", district: "Sentrum", postCode: "0154", country: "Norway", lat: 59.9115, lng: 10.7579 },
  { name: "Majorstuen", city: "Oslo", district: "Frogner", postCode: "0368", country: "Norway", lat: 59.9298, lng: 10.7135 },
  { name: "Bergen Sentrum", city: "Bergen", district: "Vestland", postCode: "5014", country: "Norway", lat: 60.3913, lng: 5.3221 },
];

function getFallbackGlobalAddress(lat: number, lng: number): BariKoiAddressInfo {
  let closest = GLOBAL_DIASPORA_HUBS[0];
  let minD = Infinity;

  for (const hub of GLOBAL_DIASPORA_HUBS) {
    const d = Math.hypot(hub.lat - lat, hub.lng - lng);
    if (d < minD) {
      minD = d;
      closest = hub;
    }
  }

  // If within reasonable proximity (e.g. ~50km)
  if (minD < 0.5) {
    return {
      address: `${closest.name}, ${closest.city}, ${closest.country}`,
      area: closest.name,
      district: closest.district,
      postCode: closest.postCode,
      city: closest.city,
      sub_district: closest.name,
    };
  }

  return {
    address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    area: "Local Neighborhood",
    district: closest.district || "Region",
    postCode: closest.postCode || "10001",
    city: closest.city || "International Hub",
    sub_district: "Local Neighborhood",
  };
}

// ─── Global Reverse Geocoding with Mapbox & Nominatim Fallback ──────────────────
const globalGeocodeCache = new Map<string, BariKoiAddressInfo>();

const inFlightGeocodeRequests = new Map<string, Promise<BariKoiAddressInfo>>();

export async function reverseGeocodeWithMapboxFallback(
  lat: number,
  lng: number,
  countryCode?: string
): Promise<BariKoiAddressInfo> {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  if (globalGeocodeCache.has(cacheKey)) {
    return globalGeocodeCache.get(cacheKey)!;
  }

  if (inFlightGeocodeRequests.has(cacheKey)) {
    return inFlightGeocodeRequests.get(cacheKey)!;
  }

  const requestPromise = (async () => {
    try {
      const isBkoiSupported = isBarikoiSupportedCountry(countryCode, lat, lng);

      // 1. Try BariKoi for BD and USA
      if (isBkoiSupported && isBariKoiAvailable(lat, lng, countryCode)) {
        try {
          const bkoiUrl = `https://barikoi.xyz/v2/api/search/reverse/geocode?api_key=${BARIKOI_API_KEY}&longitude=${lng}&latitude=${lat}&district=true&post_code=true&country=true&sub_district=true&union=true&pauroshova=true&location_type=true&division=true&address=true&area=true&bangla=true`;
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3500);

          const res = await fetch(bkoiUrl, { signal: controller.signal });
          clearTimeout(timeout);

          if (res.status === 429) {
            triggerBariKoiCooldown(30_000);
          } else if (res.ok) {
            const data = await res.json();
            if (data?.place) {
              const info: BariKoiAddressInfo = {
                address: data.place.address || data.place.area || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                area: data.place.area || "",
                district: data.place.district || data.place.city || "",
                postCode: data.place.postCode || "",
                city: data.place.city || data.place.division || data.place.country || "",
                sub_district: data.place.sub_district || "",
              };
              globalGeocodeCache.set(cacheKey, info);
              return info;
            }
          }
        } catch (_) {
          // Fall through to Mapbox/Nominatim
        }
      }

  // 2. Mapbox Reverse Geocoding (Global)
  if (MAPBOX_TOKEN && MAPBOX_TOKEN.trim().length > 10) {
    try {
      const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN.trim()}&types=address,neighborhood,locality,place,district,region,country,poi&limit=1`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(mapboxUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const feat = data?.features?.[0];
        if (feat) {
          const context = feat.context || [];
          const getContext = (prefix: string) => context.find((c: any) => c.id?.startsWith(prefix))?.text || "";

          const info: BariKoiAddressInfo = {
            address: feat.place_name || feat.text || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            area: feat.text || getContext("neighborhood") || getContext("locality") || "",
            district: getContext("district") || getContext("region") || "",
            postCode: getContext("postcode") || "",
            city: getContext("place") || getContext("locality") || feat.text || "",
            sub_district: getContext("neighborhood") || "",
          };
          globalGeocodeCache.set(cacheKey, info);
          return info;
        }
      }
    } catch (_) {
      // Fall through to Nominatim
    }
  }

  // 3. OpenStreetMap Nominatim Reverse Geocoding (Universal Global Fallback, 0 API key required)
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(osmUrl, {
      headers: { "User-Agent": "PathaSathi-ImmigrantConnect/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data?.address) {
        const a = data.address;
        const street = [a.house_number, a.road].filter(Boolean).join(" ");
        const suburb = a.suburb || a.neighbourhood || a.quarter || "";
        const city = a.city || a.town || a.village || a.municipality || "";
        const state = a.state || a.county || "";
        const country = a.country || "";

        const fullAddr = [street, suburb, city, state, country].filter(Boolean).join(", ") || data.display_name;

        const info: BariKoiAddressInfo = {
          address: fullAddr || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          area: suburb || city,
          district: a.county || state,
          postCode: a.postcode || "",
          city: city || state,
          sub_district: suburb || "",
        };
        globalGeocodeCache.set(cacheKey, info);
        return info;
      }
    }
  } catch (_) {}

      // 4. Offline / Hub Fallback
      const fb = getFallbackGlobalAddress(lat, lng);
      globalGeocodeCache.set(cacheKey, fb);
      return fb;
    } finally {
      inFlightGeocodeRequests.delete(cacheKey);
    }
  })();

  inFlightGeocodeRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

// ─── Curated Global Diaspora Resources (USA, Canada, UK, Norway) ───────────────────────
export const CURATED_GLOBAL_DIASPORA_PLACES: CuratedPlace[] = [
  // 🏥 Hospitals & Immigrant Centers (Norway - Oslo)
  {
    id: "no-hosp-1",
    name: "Oslo universitetssykehus (Ullevål)",
    category: "🏥 Hospital",
    lat: 59.9365,
    lng: 10.7329,
    rating: 4.8,
    reviews: 1250,
    open: true,
    openUntil: "24h Akuttmottak (Emergency)",
    address: "Kirkeveien 166, 0450 Oslo, Norway",
    phone: "+47 915 02 770",
    languages: ["Norsk", "English", "العربية", "Somali", "Urdu"],
    immigrantFriendly: true,
    description: "Norway's largest university hospital with comprehensive multilingual interpretation and emergency healthcare services.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&h=300&fit=crop",
  },
  {
    id: "no-legal-1",
    name: "Caritas Ressurssenter Oslo",
    category: "⚖️ Legal Aid",
    lat: 59.9142,
    lng: 10.7548,
    rating: 4.9,
    reviews: 860,
    open: true,
    openUntil: "5:00 PM",
    address: "Storgata 38, 0182 Oslo, Norway",
    phone: "+47 22 60 76 60",
    languages: ["Norsk", "English", "Polski", "Español", "العربية", "Bengali"],
    immigrantFriendly: true,
    description: "Essential immigrant resource center offering free legal advice, UDI guidance, Norwegian language cafes, and job search counseling.",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500&h=300&fit=crop",
  },
  {
    id: "no-legal-2",
    name: "UDI & Service Centre for Foreign Workers (SUA)",
    category: "⚖️ Legal Aid",
    lat: 59.9103,
    lng: 10.7634,
    rating: 4.6,
    reviews: 940,
    open: true,
    openUntil: "3:30 PM",
    address: "Schweigaards gate 17, 0191 Oslo, Norway",
    phone: "+47 22 80 66 00",
    languages: ["Norsk", "English"],
    immigrantFriendly: true,
    description: "Official government service center where the Police, UDI, Tax Administration, and Labour Inspection collaborate for fast-track residence and tax cards.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&h=300&fit=crop",
  },
  {
    id: "no-relig-1",
    name: "Islamic Cultural Centre Norway (ICC)",
    category: "🕌 Mosque / Community",
    lat: 59.9131,
    lng: 10.7645,
    rating: 4.9,
    reviews: 1120,
    open: true,
    openUntil: "Open for 5 Daily Prayers",
    address: "Tøyenbekken 24, 0188 Oslo, Norway",
    phone: "+47 22 17 00 40",
    languages: ["Norsk", "English", "العربية", "Urdu"],
    immigrantFriendly: true,
    description: "Historic cultural centre and mosque in Grønland, Oslo providing community welfare, youth activities, and halal food pantry distributions.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&h=300&fit=crop",
  },
  {
    id: "no-groc-1",
    name: "Grønland Basar & Asian Supermarket",
    category: "🛒 Grocery",
    lat: 59.9126,
    lng: 10.7618,
    rating: 4.8,
    reviews: 1450,
    open: true,
    openUntil: "9:00 PM",
    address: "Tøyenbekken 21, 0188 Oslo, Norway",
    phone: "+47 22 17 48 90",
    languages: ["Norsk", "English", "Bengali", "Hindi", "Urdu", "Arabic"],
    immigrantFriendly: true,
    description: "Bustling international supermarket in Grønland stocking authentic halal meats, Asian and Middle Eastern staples, fresh produce, and spices.",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&h=300&fit=crop",
  },
  {
    id: "no-bank-1",
    name: "DNB Bank Oslo Sentrum",
    category: "🏦 Bank",
    lat: 59.9118,
    lng: 10.7512,
    rating: 4.7,
    reviews: 790,
    open: true,
    openUntil: "4:00 PM",
    address: "Karl Johans gate 27, 0159 Oslo, Norway",
    phone: "+47 915 04 800",
    languages: ["Norsk", "English"],
    immigrantFriendly: true,
    description: "Major branch assisting international newcomers with BankID setup, foreigner bank account creation, and overseas money transfers.",
    image: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=500&h=300&fit=crop",
  },
  // 🏥 Hospitals & Medical Centers (USA - New York)
  {
    id: "us-hosp-1",
    name: "NYC Health + Hospitals / Elmhurst",
    category: "🏥 Hospital",
    lat: 40.7445,
    lng: -73.8855,
    rating: 4.7,
    reviews: 1840,
    open: true,
    openUntil: "24h Emergency",
    address: "79-01 Broadway, Elmhurst, Queens, NY 11373",
    phone: "+1 718-334-4000",
    languages: ["English", "Spanish", "Bengali", "Hindi", "Urdu"],
    immigrantFriendly: true,
    description: "Major public hospital in Queens offering free and sliding-scale healthcare with dedicated Bengali and multilingual medical interpreters.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&h=300&fit=crop",
  },
  {
    id: "us-hosp-2",
    name: "Mount Sinai Queens",
    category: "🏥 Hospital",
    lat: 40.7712,
    lng: -73.9189,
    rating: 4.8,
    reviews: 1420,
    open: true,
    openUntil: "24h Emergency",
    address: "25-10 30th Ave, Astoria, NY 11102",
    phone: "+1 718-932-1000",
    languages: ["English", "Greek", "Bengali", "Spanish"],
    immigrantFriendly: true,
    description: "State-of-the-art hospital campus with multi-lingual emergency, cardiology, and international patient coordination.",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500&h=300&fit=crop",
  },
  {
    id: "us-hosp-3",
    name: "NYC Health + Hospitals / Bellevue",
    category: "🏥 Hospital",
    lat: 40.7391,
    lng: -73.9757,
    rating: 4.6,
    reviews: 2100,
    open: true,
    openUntil: "24h",
    address: "462 1st Ave, New York, NY 10016",
    phone: "+1 212-562-4141",
    languages: ["English", "Spanish", "Bengali", "Mandarin"],
    immigrantFriendly: true,
    description: "Historic Manhattan flagship public hospital. Renowned trauma center with complete immigrant healthcare access regardless of status.",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&h=300&fit=crop",
  },

  // 🏦 Banks & Remittance Centers (USA)
  {
    id: "us-bank-1",
    name: "Chase Bank - Jackson Heights Hub",
    category: "🏦 Bank",
    lat: 40.7485,
    lng: -73.8885,
    rating: 4.7,
    reviews: 410,
    open: true,
    openUntil: "5:00 PM (ATM 24h)",
    address: "37-29 82nd St, Jackson Heights, NY 11372",
    phone: "+1 718-478-4300",
    languages: ["English", "Spanish", "Bengali"],
    immigrantFriendly: true,
    description: "Full service branch with bilingual advisors. Welcomes ITIN account openers, international wire transfers, and newcomer credit cards.",
    image: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=500&h=300&fit=crop",
  },
  {
    id: "us-bank-2",
    name: "Bank of America Financial Center - Jamaica",
    category: "🏦 Bank",
    lat: 40.7025,
    lng: -73.7995,
    rating: 4.6,
    reviews: 350,
    open: true,
    openUntil: "4:00 PM",
    address: "161-01 Jamaica Ave, Jamaica, NY 11432",
    phone: "+1 718-657-3000",
    languages: ["English", "Bengali", "Spanish"],
    immigrantFriendly: true,
    description: "Newcomer-friendly checking and savings accounts, notary services, foreign exchange, and direct diaspora remittance setup.",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&h=300&fit=crop",
  },
  {
    id: "us-bank-3",
    name: "Standard Chartered / Sonali Exchange NY",
    category: "🏦 Bank",
    lat: 40.7512,
    lng: -73.8895,
    rating: 4.9,
    reviews: 620,
    open: true,
    openUntil: "6:00 PM",
    address: "37-18 73rd St, Jackson Heights, NY 11372",
    phone: "+1 718-424-4000",
    languages: ["Bengali", "English"],
    immigrantFriendly: true,
    description: "Official Bangladeshi bank remittance facility offering instant zero-fee transfers to all banks in Bangladesh with government incentive.",
    image: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=500&h=300&fit=crop",
  },

  // 🍽️ Halal Restaurants & Desi Food
  {
    id: "us-food-1",
    name: "Jackson Diner",
    category: "🍽️ Restaurant",
    lat: 40.7488,
    lng: -73.8912,
    rating: 4.8,
    reviews: 2450,
    open: true,
    openUntil: "10:30 PM",
    address: "37-47 74th St, Jackson Heights, NY 11372",
    phone: "+1 718-672-1232",
    languages: ["English", "Hindi", "Bengali"],
    immigrantFriendly: true,
    description: "Iconic South Asian dining destination serving traditional biryanis, samosas, tandoori specialties, and vegetarian thalis.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=300&fit=crop",
  },
  {
    id: "us-food-2",
    name: "Haatbazaar Halal Meat & Bengali Food",
    category: "🍽️ Restaurant",
    lat: 40.7479,
    lng: -73.8920,
    rating: 4.9,
    reviews: 1890,
    open: true,
    openUntil: "11:00 PM",
    address: "37-11 73rd St, Jackson Heights, NY 11372",
    phone: "+1 718-458-5400",
    languages: ["Bengali", "English"],
    immigrantFriendly: true,
    description: "Authentic Bengali homestyle kitchen with hilsa fish, kacchi biryani, shutki bhorta, roshogolla, and 100% zabiha halal meats.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop",
  },
  {
    id: "us-food-3",
    name: "The Halal Guys - Original Cart",
    category: "🍽️ Restaurant",
    lat: 40.7618,
    lng: -73.9798,
    rating: 4.8,
    reviews: 9800,
    open: true,
    openUntil: "4:00 AM",
    address: "W 53rd St & 6th Ave, New York, NY 10019",
    phone: "+1 212-555-0199",
    languages: ["English", "Arabic", "Bengali"],
    immigrantFriendly: true,
    description: "World-famous NYC street food pioneer offering gyro and chicken platters over yellow rice with signature white sauce and hot sauce.",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&h=300&fit=crop",
  },

  // 🛒 Grocery & Desi Supermarkets
  {
    id: "us-groc-1",
    name: "Patel Brothers Supermarket",
    category: "🛒 Grocery",
    lat: 40.7483,
    lng: -73.8916,
    rating: 4.7,
    reviews: 3100,
    open: true,
    openUntil: "9:00 PM",
    address: "37-27 74th St, Jackson Heights, NY 11372",
    phone: "+1 718-672-0248",
    languages: ["English", "Gujarati", "Bengali", "Hindi"],
    immigrantFriendly: true,
    description: "Comprehensive diaspora grocery carrying imported spices, basmati rice, lentils, atta, snacks, paneer, and seasonal mangoes.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&h=300&fit=crop",
  },

  // ⚖️ Legal Aid & Immigration Attorneys
  {
    id: "us-legal-1",
    name: "The Legal Aid Society - Immigration Law Unit",
    category: "⚖️ Legal Aid",
    lat: 40.7065,
    lng: -74.0085,
    rating: 4.9,
    reviews: 840,
    open: true,
    openUntil: "5:00 PM",
    address: "199 Water St, 3rd Floor, New York, NY 10038",
    phone: "+1 212-577-3300",
    languages: ["English", "Spanish", "Bengali", "Mandarin", "French"],
    immigrantFriendly: true,
    description: "Free legal representation for asylum, green card, work authorization renewals, deportation defense, and citizenship applications.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&h=300&fit=crop",
  },
  {
    id: "us-legal-2",
    name: "Make the Road New York - Immigrant Justice Center",
    category: "⚖️ Legal Aid",
    lat: 40.7495,
    lng: -73.8765,
    rating: 4.9,
    reviews: 1120,
    open: true,
    openUntil: "6:00 PM",
    address: "92-10 Roosevelt Ave, Jackson Heights, NY 11372",
    phone: "+1 718-565-8500",
    languages: ["English", "Spanish", "Bengali", "Nepali"],
    immigrantFriendly: true,
    description: "Grassroots legal support, DACA assistance, workplace rights defense, housing tenant clinic, and English ESL classes.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&h=300&fit=crop",
  },

  // 🏛️ Community Centers & Organizations
  {
    id: "us-comm-1",
    name: "Chhaya Community Development Corporation",
    category: "🏛️ Community Center",
    lat: 40.7481,
    lng: -73.8899,
    rating: 4.9,
    reviews: 730,
    open: true,
    openUntil: "5:30 PM",
    address: "37-43 77th St, 2nd Floor, Jackson Heights, NY 11372",
    phone: "+1 718-478-3848",
    languages: ["Bengali", "English", "Tibetan", "Hindi"],
    immigrantFriendly: true,
    description: "Advocating for South Asian and diaspora housing rights, tenant counseling, first-time homebuyer grants, and civic empowerment.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=300&fit=crop",
  },

  // 🕌 Mosques & Religious Institutions
  {
    id: "us-rel-1",
    name: "Islamic Cultural Center of New York (ICCNY)",
    category: "🕌 Mosque",
    lat: 40.7865,
    lng: -73.9515,
    rating: 4.9,
    reviews: 3200,
    open: true,
    openUntil: "Open for all 5 daily prayers",
    address: "1711 3rd Ave, New York, NY 10029",
    phone: "+1 212-722-5234",
    languages: ["English", "Arabic", "Bengali", "Urdu"],
    immigrantFriendly: true,
    description: "Manhattan's premier Islamic center with grand prayer hall, weekend Islamic school, zakat distribution, and newcomer family guidance.",
    image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=500&h=300&fit=crop",
  },
  {
    id: "us-rel-2",
    name: "Jamaica Muslim Center (JMC)",
    category: "🕌 Mosque",
    lat: 40.7075,
    lng: -73.7990,
    rating: 4.9,
    reviews: 2800,
    open: true,
    openUntil: "Open for all 5 prayers",
    address: "85-37 168th St, Jamaica, NY 11432",
    phone: "+1 718-739-3182",
    languages: ["Bengali", "English", "Arabic"],
    immigrantFriendly: true,
    description: "One of the largest Bangladeshi community mosques in North America. Organizes annual Eid gatherings, food pantry, and youth programs.",
    image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=500&h=300&fit=crop",
  },

  // 🚌 Transit Hubs
  {
    id: "us-tran-1",
    name: "Jackson Heights - Roosevelt Ave / 74th St Subway Station",
    category: "🚌 Transit",
    lat: 40.7468,
    lng: -73.8913,
    rating: 4.5,
    reviews: 5200,
    open: true,
    openUntil: "24/7 Subway Service",
    address: "Roosevelt Ave & 74th St, Jackson Heights, NY 11372",
    phone: "+1 511",
    languages: ["English", "Spanish", "Bengali"],
    immigrantFriendly: true,
    description: "Major Queens transit nexus connecting subway lines (7, E, F, M, R) and Q33/Q47 buses to LaGuardia Airport (LGA) and Manhattan.",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&h=300&fit=crop",
  },
  {
    id: "us-tran-2",
    name: "Grand Central Terminal",
    category: "🚌 Transit",
    lat: 40.7527,
    lng: -73.9772,
    rating: 4.9,
    reviews: 14800,
    open: true,
    openUntil: "5:15 AM - 2:00 AM",
    address: "89 E 42nd St, New York, NY 10017",
    phone: "+1 212-340-2583",
    languages: ["English", "Spanish"],
    immigrantFriendly: true,
    description: "World-famous rail terminal connecting Metro-North trains to upstate NY, Connecticut, and MTA subway lines (4, 5, 6, 7, S).",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&h=300&fit=crop",
  }
];

// ─── Adaptive Filter for Curated Places (BD vs. Global) ────────────────────────
export function getUnifiedCuratedPlaces(
  userLat: number,
  userLng: number,
  category = "all",
  countryCode?: string
): any[] {
  const isBD = isLocationInBangladesh(userLat, userLng) || isBangladeshCountry(countryCode);
  const placesPool = isBD ? [] : CURATED_GLOBAL_DIASPORA_PLACES; // if BD, caller combines with BD places

  const cat = category.toLowerCase();
  const filtered = placesPool.filter((p) => {
    if (cat === "all") return true;
    const pc = p.category.toLowerCase();
    if (cat === "hospital" || cat === "health") return pc.includes("hospital") || pc.includes("clinic");
    if (cat === "bank") return pc.includes("bank") || pc.includes("atm");
    if (cat === "restaurant" || cat === "food") return pc.includes("restaurant") || pc.includes("food");
    if (cat === "grocery") return pc.includes("grocery");
    if (cat === "legal") return pc.includes("legal");
    if (cat === "community") return pc.includes("community");
    if (cat === "religious") return pc.includes("mosque") || pc.includes("religious");
    if (cat === "transport" || cat === "transit") return pc.includes("transit") || pc.includes("transport");
    return pc.includes(cat);
  });

  return filtered
    .map((p) => {
      const distMeters = Math.hypot(p.lat - userLat, p.lng - userLng) * 111_000;
      const distStr = distMeters < 1000 ? `${Math.round(distMeters)} m` : `${(distMeters / 1000).toFixed(1)} km`;

      return {
        ...p,
        distance: distStr,
        _distMeters: distMeters,
      };
    })
    .sort((a, b) => a._distMeters - b._distMeters);
}

// ─── Global Directions / Routing with Mapbox & OSRM Fallback ──────────────────
export async function fetchGlobalRoute(
  from: [number, number], // [lat, lng]
  to: [number, number],   // [lat, lng]
  mode: "car" | "bike" | "walk" = "car"
): Promise<{ coordinates: [number, number][]; distanceMeters: number; durationSeconds: number } | null> {
  const mapboxProfile = mode === "walk" ? "walking" : mode === "bike" ? "cycling" : "driving";

  // 1. Mapbox Directions API (Turn-by-turn worldwide routing)
  if (MAPBOX_TOKEN && MAPBOX_TOKEN.trim().length > 10) {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/${mapboxProfile}/${from[1]},${from[0]};${to[1]},${to[0]}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN.trim()}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        const route = data?.routes?.[0];
        if (route?.geometry?.coordinates) {
          const coords: [number, number][] = route.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          );
          return {
            coordinates: coords,
            distanceMeters: route.distance,
            durationSeconds: route.duration,
          };
        }
      }
    } catch (_) {}
  }

  // 2. OSRM Universal Global Routing Fallback
  const osrmProfile = mode === "walk" ? "foot" : mode === "bike" ? "bike" : "driving";
  try {
    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      const route = data?.routes?.[0];
      if (route?.geometry?.coordinates) {
        const coords: [number, number][] = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );
        return {
          coordinates: coords,
          distanceMeters: route.distance,
          durationSeconds: route.duration,
        };
      }
    }
  } catch (_) {}

  return null;
}
