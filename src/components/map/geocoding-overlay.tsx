"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, MapPin, Clock, X } from "lucide-react";
import {
  geocodeSearch,
  getRecentSearches,
  addRecentSearch,
  type GeocodingResult,
  type RecentSearch,
} from "@/lib/utils/geocoding";
import { useMapStore } from "@/lib/stores/map-store";

const DEBOUNCE_MS = 300;

interface GeocodingOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function GeocodingOverlay({ open, onClose }: GeocodingOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flyTo = useMapStore((s) => s.flyTo);
  const setSearchLabel = useMapStore((s) => s.setSearchLabel);

  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const search = useCallback((q: string) => {
    abortRef.current?.abort();

    if (!q.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    abortRef.current = new AbortController();
    setIsSearching(true);

    geocodeSearch(q, abortRef.current.signal)
      .then((data) => {
        setResults(data);
        setIsSearching(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setIsSearching(false);
      });
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(value), DEBOUNCE_MS);
    },
    [search],
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const selectResult = useCallback(
    (label: string, center: [number, number]) => {
      addRecentSearch({ label, center });
      setSearchLabel(label);
      flyTo?.({ lng: center[0], lat: center[1], zoom: 14 });
      onClose();
    },
    [flyTo, setSearchLabel, onClose],
  );

  const showRecent = query.trim() === "" && recentSearches.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header with input */}
          <div className="flex items-center gap-3 px-4 pt-[max(env(safe-area-inset-top),16px)] pb-3 border-b border-neutral-300/50">
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Ville, adresse, code postal..."
                className="w-full rounded-input bg-neutral-100 py-2.5 pl-10 pr-10 text-base text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {isSearching && (
              <div className="px-6 py-8 text-center text-sm text-neutral-600">
                Recherche en cours...
              </div>
            )}

            {!isSearching && query.trim() !== "" && results.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-neutral-600">
                Aucun résultat pour &ldquo;{query}&rdquo;
              </div>
            )}

            {!isSearching && results.length > 0 && (
              <ul>
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => selectResult(r.placeName || r.text, r.center)}
                      className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-neutral-100 active:bg-neutral-100"
                    >
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {r.text}
                        </p>
                        {r.context && (
                          <p className="text-xs text-neutral-600 truncate mt-0.5">
                            {r.context}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {showRecent && (
              <div>
                <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Recherches récentes
                </p>
                <ul>
                  {recentSearches.map((s, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => selectResult(s.label, s.center)}
                        className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-neutral-100 active:bg-neutral-100"
                      >
                        <Clock className="h-4 w-4 shrink-0 text-neutral-600" />
                        <span className="text-sm text-neutral-900 truncate">
                          {s.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
