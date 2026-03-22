"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PhotoViewer } from "@/components/ui/photo-viewer";

interface PhotoMessageProps {
  imageUrl: string;
  isMine: boolean;
}

const SIGNED_URL_EXPIRY = 3600;

export function PhotoMessage({ imageUrl, isMine }: PhotoMessageProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchUrl() {
      const supabase = createClient();
      const { data } = await supabase.storage
        .from("chat-images")
        .createSignedUrl(imageUrl, SIGNED_URL_EXPIRY);

      if (!cancelled && data) {
        setSrc(data.signedUrl);
      }
    }

    fetchUrl();
    return () => { cancelled = true; };
  }, [imageUrl]);

  return (
    <>
      <button
        type="button"
        onClick={() => src && setViewerOpen(true)}
        className="block overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {!loaded && (
          <div
            className={`w-[240px] h-[180px] rounded-xl animate-pulse ${
              isMine ? "bg-white/20" : "bg-neutral-200"
            }`}
          />
        )}
        {src && (
          <img
            src={src}
            alt="Photo"
            onLoad={() => setLoaded(true)}
            className={`max-w-[240px] rounded-xl object-cover transition-opacity ${
              loaded ? "opacity-100" : "opacity-0 h-0"
            }`}
          />
        )}
      </button>

      {viewerOpen && src && (
        <PhotoViewer src={src} onClose={() => setViewerOpen(false)} />
      )}
    </>
  );
}
