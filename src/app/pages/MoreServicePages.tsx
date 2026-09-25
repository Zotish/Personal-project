import React from "react";
import { SchoolServicePage, HospitalServicePage, HalalFoodServicePage } from "./ServiceDirectoryPages";

// ─── School / University Finder (Powered by Real BariKoi Map) ────────────────
export function SchoolFinder() {
  return <SchoolServicePage />;
}

// ─── Hospital / Clinic Finder (Powered by Real BariKoi Map) ──────────────────
export function HospitalFinder() {
  return <HospitalServicePage />;
}

// ─── Religious Institution Finder (Re-exported from Religion.tsx) ───────────
export { ReligiousFinder } from "./Religion";

// ─── Restaurant / Grocery Finder (Powered by Real BariKoi Map) ───────────────
export function RestaurantGroceryFinder() {
  return <HalalFoodServicePage />;
}
