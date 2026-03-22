"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Loader2,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateAddress } from "@/lib/supabase/mutations/profile";
import {
  geocodeSearch,
  type GeocodingResult,
} from "@/lib/utils/geocoding";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface ProfileAddress {
  city: string | null;
  lat: number | null;
  lng: number | null;
}

const DEBOUNCE_MS = 300;

export default function AdressePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [current, setCurrent] = useState<ProfileAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedLat, setSelectedLat] = useState(0);
  const [selectedLng, setSelectedLng] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      supabase
        .from("profiles")
        .select("address_city, address_lat, address_lng")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setCurrent({
              city: data.address_city,
              lat: data.address_lat,
              lng: data.address_lng,
            });
            if (data.address_city) {
              setSelectedCity(data.address_city);
              setSelectedLat(data.address_lat ?? 0);
              setSelectedLng(data.address_lng ?? 0);
            }
          }
          setLoading(false);
        });
    });
  }, []);

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
      // aborted
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

  const selectResult = useCallback((r: GeocodingResult) => {
    const city = r.text || r.placeName;
    setQuery(city);
    setSelectedCity(city);
    setSelectedLat(r.center[1]);
    setSelectedLng(r.center[0]);
    setHasChanges(true);
    setOpen(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!userId || !selectedCity) return;

    setSaving(true);
    try {
      await updateAddress(userId, {
        address_city: selectedCity,
        address_lat: selectedLat,
        address_lng: selectedLng,
      });
      toast.success("Adresse mise à jour !");
      setCurrent({ city: selectedCity, lat: selectedLat, lng: selectedLng });
      setHasChanges(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  }, [userId, selectedCity, selectedLat, selectedLng]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-300/50 bg-background/80 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-900" />
          </button>
          <h1 className="text-lg font-display font-semibold text-neutral-900">
            Mon adresse
          </h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-5 pt-5 pb-8">
        {/* Current address */}
        {current?.city && (
          <div className="flex items-center gap-3 rounded-card bg-white px-4 py-4 shadow-card">
            <MapPin className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-900">
                {current.city}
              </p>
              <p className="text-xs text-neutral-600">Adresse actuelle</p>
            </div>
          </div>
        )}

        {/* Geocoding search */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-neutral-900">
            Changer d&apos;adresse
          </label>

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
                className="w-full rounded-input border-[1.5px] border-neutral-300 bg-neutral-100 py-3 pl-10 pr-10 text-base text-neutral-900 placeholder:text-neutral-300 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
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
                      <span className="ml-1 text-neutral-600">
                        {r.context}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Selected result preview */}
        {hasChanges && selectedCity && (
          <div className="flex items-center gap-3 rounded-card border-2 border-primary/20 bg-primary/5 px-4 py-4">
            <MapPin className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-900">
                {selectedCity}
              </p>
              <p className="text-xs text-neutral-600">Nouvelle adresse</p>
            </div>
          </div>
        )}

        {/* Privacy notice */}
        <div className="flex gap-3 rounded-card bg-neutral-100 px-4 py-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs text-neutral-600 leading-relaxed">
            Votre adresse exacte n&apos;est jamais partagée publiquement. Seul
            un point approximatif (~200m) est affiché sur la carte.
          </p>
        </div>

        {/* Save button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          loading={saving}
          disabled={!hasChanges || !selectedCity}
          onClick={handleSave}
        >
          Mettre à jour
        </Button>
      </div>
    </div>
  );
}
