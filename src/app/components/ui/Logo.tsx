import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "white" | "dark" | "icon-only";
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Logo({
  size = "md",
  variant = "default",
  showText = true,
  className = "",
  onClick,
}: LogoProps) {
  // Size dimensions
  const iconSizes = {
    sm: "w-8 h-8 rounded-xl",
    md: "w-10 h-10 rounded-2xl",
    lg: "w-12 h-12 rounded-2xl",
    xl: "w-16 h-16 rounded-3xl",
  };

  const textSizes = {
    sm: "text-lg font-bold",
    md: "text-xl sm:text-2xl font-bold",
    lg: "text-2xl sm:text-3xl font-bold",
    xl: "text-3xl sm:text-4xl font-bold",
  };

  // Color matches Deep Coral: #E05236
  const textColor = variant === "white" ? "text-white" : "text-[#E05236]";

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${
        onClick ? "cursor-pointer hover:opacity-95 transition-opacity" : ""
      } ${className}`}
    >
      {/* Deep Coral Squircle Icon (#E05236) */}
      <div
        className={`${iconSizes[size]} bg-[#E05236] flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-sm transition-transform active:scale-95`}
      >
        <svg
          className="w-full h-full p-1.5"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Location Pin */}
          <path
            d="M50 18C36.745 18 26 28.745 26 42C26 58.5 50 78 50 78C50 78 74 58.5 74 42C74 28.745 63.255 18 50 18ZM50 51C45.029 51 41 46.971 41 42C41 37.029 45.029 33 50 33C54.971 33 59 37.029 59 42C59 46.971 54.971 51 50 51Z"
            fill="white"
          />
          {/* Bottom Left Trail Dots */}
          <rect x="25" y="70" width="10" height="5" rx="2.5" transform="rotate(-38 25 70)" fill="white" />
          <rect x="35" y="62" width="10" height="5" rx="2.5" transform="rotate(-38 35 62)" fill="white" />
        </svg>
      </div>

      {/* English Brand Name: Pathasathi (Deep Coral #E05236 color) */}
      {showText && variant !== "icon-only" && (
        <span className={`${textSizes[size]} ${textColor} font-sans font-bold tracking-tight leading-none flex items-center`}>
          Pathasathi
        </span>
      )}
    </div>
  );
}
