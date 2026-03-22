"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";

interface PhotoCarouselProps {
  photos: string[];
  alt?: string;
  aspectRatio?: string;
  className?: string;
}

export function PhotoCarousel({
  photos,
  alt = "Photo",
  aspectRatio = "4/3",
  className = "",
}: PhotoCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [currentIndex, setCurrentIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (photos.length === 0) {
    return (
      <div
        className={`bg-neutral-100 flex items-center justify-center ${className}`}
        style={{ aspectRatio }}
      >
        <span className="text-neutral-300 text-sm">Aucune photo</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {photos.map((src, i) => (
            <div key={src} className="flex-[0_0_100%] min-w-0">
              <img
                src={src}
                alt={`${alt} ${i + 1}`}
                className="w-full object-cover"
                style={{ aspectRatio }}
                loading={i === 0 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {photos.length > 1 && (
        <div className="absolute bottom-3 right-3 rounded-pill bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {currentIndex + 1}/{photos.length}
        </div>
      )}
    </div>
  );
}
