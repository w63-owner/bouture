"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface PhotoViewerProps {
  src: string;
  onClose: () => void;
}

export function PhotoViewer({ src, onClose }: PhotoViewerProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo en plein écran"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        aria-label="Fermer"
      >
        <X className="h-5 w-5" />
      </button>

      <img
        src={src}
        alt="Photo en plein écran"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] max-w-[95vw] rounded-lg object-contain"
      />
    </div>
  );
}
