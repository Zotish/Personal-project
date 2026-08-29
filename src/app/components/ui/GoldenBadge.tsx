import React from "react";

interface GoldenBadgeProps {
  size?: number;
  className?: string;
  title?: string;
}

export function GoldenBadge({ size = 16, className = "", title = "Verified" }: GoldenBadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 drop-shadow-[0_2px_5px_rgba(217,119,6,0.45)] ${className}`}
    >
      <title>{title}</title>
      <defs>

        <linearGradient id="gold-verified-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="25%" stopColor="#F59E0B" />
          <stop offset="65%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      {/* Twitter / Telegram Starburst Badge Geometry */}
      <path
        d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4z"
        fill="url(#gold-verified-grad)"
      />
      {/* Crisp White Inner Checkmark */}
      <path
        d="M9.75 16.2L5.85 12.3l1.4-1.4 2.5 2.5 7.1-7.1 1.4 1.4-8.5 8.5z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
