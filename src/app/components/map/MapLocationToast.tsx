import React, { useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";

export type LocationToastType = "permission_denied" | "location_off" | "turned_off" | "unavailable";

export interface MapLocationToastInfo {
  type: LocationToastType;
  title?: string;
  message?: string;
}

export interface MapLocationToastProps {
  toast: MapLocationToastInfo | null;
  onClose: () => void;
  onClick?: () => void;
  duration?: number;
  className?: string;
}

export function MapLocationToast({
  toast,
  onClose,
  onClick,
  duration = 4500,
  className = "",
}: MapLocationToastProps) {
  const { lang } = useLanguage();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const isBn = lang === "bn";

  const getDefaultContent = () => {
    switch (toast.type) {
      case "permission_denied":
        return {
          message: isBn ? "লোকেশন পারমিশন দিন" : "Location Permission Denied",
        };
      case "location_off":
        return {
          message: isBn ? "ডিভাইস লোকেশন বন্ধ" : "Device Location Off",
        };
      case "turned_off":
        return {
          message: isBn ? "লাইভ লোকেশন বন্ধ" : "Live Location Off",
        };
      case "unavailable":
      default:
        return {
          message: isBn ? "লোকেশন পাওয়া যায়নি" : "Location Not Found",
        };
    }
  };

  const content = getDefaultContent();
  const displayMessage = toast.message || toast.title || content.message;

  const handleToastClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    // Default mobile phone location activation & instruction
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          onClose();
        },
        (err) => {
          if (err.code === 1) {
            alert(
              isBn
                ? "অনুগ্রহ করে আপনার মোবাইল ফোনের ব্রাউজার সেটিংসে গিয়ে লোকেশন পারমিশন অন করুন।"
                : "Please allow location access in your mobile phone / browser settings."
            );
          } else {
            alert(
              isBn
                ? "অনুগ্রহ করে আপনার মোবাইল ফোনের লোকেশন (GPS) চালু করুন।"
                : "Please turn on Location / GPS in your mobile phone settings."
            );
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert(
        isBn
          ? "অনুগ্রহ করে আপনার মোবাইল ফোনের লোকেশন (GPS) চালু করুন।"
          : "Please turn on Location / GPS in your mobile phone settings."
      );
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-[1000] pointer-events-auto select-none ${className}`}
    >
      <button
        type="button"
        onClick={handleToastClick}
        title={isBn ? "মোবাইলের লোকেশন অন করতে ট্যাপ করুন" : "Tap to turn on mobile location"}
        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full px-4 py-2 sm:py-2.5 shadow-lg flex items-center justify-center text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-900 active:scale-95 transition-all cursor-pointer border-0"
      >
        <span className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
          {displayMessage}
        </span>
      </button>
    </div>
  );
}
