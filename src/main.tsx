
// Silence rogue third-party browser extension / VPN injected script errors (e.g. 200.js reading 'M_ID')
if (typeof window !== "undefined") {
  const isExtensionOrMidError = (msg?: string, stack?: string) => {
    const s = `${msg || ""} ${stack || ""}`.toLowerCase();
    return (
      s.includes("m_id") ||
      s.includes("200.js") ||
      s.includes("chrome-extension://") ||
      s.includes("moz-extension://")
    );
  };

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const reason = event.reason;
      const msg = (reason && (reason.message || reason.stack)) || String(reason || "");
      const stack = (reason && reason.stack) || "";
      if (isExtensionOrMidError(msg, stack)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    "error",
    (event) => {
      const msg = event.message || "";
      const stack = `${event.filename || ""} ${event.error?.stack || ""}`;
      if (isExtensionOrMidError(msg, stack)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    },
    true
  );
}

import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register PWA Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("PWA Service Worker registered with scope:", registration.scope);
      })
      .catch((error) => {
        console.warn("PWA Service Worker registration failed:", error);
      });
  });
}

  