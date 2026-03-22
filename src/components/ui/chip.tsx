"use client";

import { X } from "lucide-react";

interface ChipProps {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function Chip({
  label,
  selected = false,
  onToggle,
  onRemove,
  className = "",
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        inline-flex items-center gap-1.5
        rounded-pill px-3.5 py-2
        text-sm font-medium
        transition-all duration-150 ease-out
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
        ${
          selected
            ? "bg-primary text-white shadow-btn"
            : "bg-neutral-100 text-neutral-900 hover:bg-neutral-300/50"
        }
        ${className}
      `}
    >
      <span>{label}</span>
      {onRemove && selected && (
        <span
          role="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onRemove();
            }
          }}
          className="ml-0.5 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 hover:bg-white/40"
        >
          <X className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
