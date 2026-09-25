import React, { useState } from "react";

interface ExpandablePostTextProps {
  text: string;
  maxChars?: number;
  className?: string;
  buttonClassName?: string;
}

export function ExpandablePostText({
  text,
  maxChars = 135,
  className = "text-sm text-foreground leading-relaxed whitespace-pre-line text-left mt-3 font-normal",
  buttonClassName = "font-semibold text-slate-500 hover:text-[#C04A22] transition-colors cursor-pointer inline-flex items-center gap-0.5 text-xs sm:text-sm select-none",
}: ExpandablePostTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const lines = text.split("\n");
  const hasMultipleLines = lines.length > 2;
  const isOverLength = text.length > maxChars;

  // If text is short (within ~2.5 lines), render clean paragraph without button
  if (!isOverLength && !hasMultipleLines) {
    return <p className={className}>{text}</p>;
  }

  // Calculate preview text truncated cleanly at a word boundary
  let previewText = text;
  if (hasMultipleLines) {
    const firstTwoLines = lines.slice(0, 2).join("\n");
    if (firstTwoLines.length > maxChars) {
      const sub = firstTwoLines.slice(0, maxChars);
      const lastSpace = sub.lastIndexOf(" ");
      previewText = (lastSpace > 50 ? sub.slice(0, lastSpace) : sub).trim();
    } else {
      previewText = firstTwoLines.trim();
    }
  } else if (isOverLength) {
    const sub = text.slice(0, maxChars);
    const lastSpace = sub.lastIndexOf(" ");
    previewText = (lastSpace > 50 ? sub.slice(0, lastSpace) : sub).trim();
  }

  // Ensure trailing punctuation doesn't awkwardly clash with ellipsis
  const cleanPreview = previewText.replace(/[.,;:\s]+$/, "");

  return (
    <p className={className}>
      {isExpanded ? text : cleanPreview}
      {!isExpanded && <span className="text-slate-400">... </span>}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }}
        className={`${buttonClassName} ${isExpanded ? "ml-2" : "ml-1"}`}
        aria-label={isExpanded ? "Show less text" : "See more text"}
      >
        {isExpanded ? "See less" : "See more"}
      </button>
    </p>
  );
}
