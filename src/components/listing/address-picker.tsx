"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { geocodeSearch, type GeocodingResult } from "@/lib/utils/geocoding";

interface AddressPickerProps {
  profileCity: string | null;
  profileLat: number | null;
  profileLng: number | null;
  value: { city: string; lat: number; lng: number } | null;
  onChange: (city: string, lat: number, lng: number) => void;
  error?: string;
}

const DEBOUNCE_MS = 300;

export function AddressPicker({
  profileCity,
  profileLat,
  profileLng,
  value,
  onChange,
  error,
}: AddressPickerProps) {
  const hasProfile = profileCity && profileLat != null && profileLng != null;
  const [useOther, setUseOther] = useState(!hasProfile);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasProfile && !useOther && !value) {
      onChange(profileCity!, profileLat!, profileLng!);
    }
  }, [hasProfile, useOther, value, onChange, profileCity, profileLat, profileLng]);

  const handleToggle = useCallback(() => {
    setUseOther((prev) => {
      const next = !prev;
      if (!next && hasProfile) {
        onChange(profileCity!, profileLat!, profileLng!);
        setQuery("");
        setResults([]);
      }
      return next;
    });
  }, [hasProfile, onChange, profileCity, profileLat, profileLng]);

  const doSearch = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setSearching(true);
    try {
      const data = await geocodeSearch(q, ac.signal);
      if (!ac.signal.aborted) {
        setResults(data);
        setOpen(true);
      }
    } catch {
      // ignore
    } finally {
      if (!ac.signal.aborted) setSearching(false);
    }
  }, []);

  const handleInput = useCallback(
    (text: string) => {
      setQuery(text);
      if (timerRef.current) clearTimeout(timerRef.current);

      if (text.trim().length < 3) {
        setResults([]);
        setOpen(false);
        return;
      }
      timerRef.current = setTimeout(() => doSearch(text), DEBOUNCE_MS);
    },
    [doSearch],
  );

  const selectResult = useCallback(
    (r: GeocodingResult) => {
      const city = r.text || r.placeName;
      setQuery(city);
      onChange(city, r.center[1], r.center[0]);
      setOpen(false);
    },
    [onChange],
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const displayCity = value?.city || profileCity || "";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-neutral-900">
        Localisation
      </label>

      {hasProfile && (
        <div className="flex items-center gap-3 rounded-card bg-neutral-100 px-4 py-3">
          <MapPin className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-900">
              {useOther ? (value?.city || "—") : displayCity}
            </p>
            <p className="text-xs text-neutral-600">
              {useOther ? "Adresse personnalisée" : "Adresse de votre profil"}
            </p>
          </div>
        </div>
      )}

      {hasProfile && (
        <button
          type="button"
          onClick={handleToggle}
          className="self-start text-sm font-medium text-primary hover:underline"
        >
          {useOther ? "Utiliser l'adresse de mon profil" : "Utiliser une autre adresse"}
        </button>
      )}

      {useOther && (
        <div ref={containerRef} className="relative">
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setOpen(true);
              }}
              placeholder="Rechercher une ville…"
              autoComplete="off"
              className={`
                w-full rounded-input border-[1.5px] bg-neutral-100 py-3 pl-10 pr-10
                text-base text-neutral-900 placeholder:text-neutral-300
                transition-colors duration-150
                focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20
                ${error ? "border-error" : "border-neutral-300"}
              `}
            />
            {searching && (
              <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-600" />
            )}
          </div>

          {open && results.length > 0 && (
            <ul className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-card border border-neutral-300 bg-white shadow-card">
              {results.map((r) => (
                <li
                  key={r.id}
                  onMouseDown={() => selectResult(r)}
                  className="cursor-pointer px-4 py-2.5 text-sm text-neutral-900 transition-colors hover:bg-neutral-100"
                >
                  <span className="font-medium">{r.text}</span>
                  {r.context && (
                    <span className="ml-1 text-neutral-600">{r.context}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
