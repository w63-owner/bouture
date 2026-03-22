const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

export interface GeocodingResult {
  id: string;
  placeName: string;
  text: string;
  center: [number, number]; // [lng, lat]
  context: string;
}

export async function geocodeSearch(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodingResult[]> {
  if (!query.trim() || !MAPTILER_KEY) return [];

  const encoded = encodeURIComponent(query.trim());
  const url = `https://api.maptiler.com/geocoding/${encoded}.json?key=${MAPTILER_KEY}&language=fr&limit=5`;

  const res = await fetch(url, { signal });

  if (!res.ok) {
    throw new Error(`Geocoding request failed: ${res.status}`);
  }

  const data = await res.json();

  return (data.features ?? []).map(
    (f: {
      id: string;
      place_name: string;
      text: string;
      center: [number, number];
      context?: { text: string }[];
    }) => ({
      id: f.id,
      placeName: f.place_name,
      text: f.text,
      center: f.center,
      context: (f.context ?? []).map((c) => c.text).join(", "),
    }),
  );
}

const RECENT_KEY = "bouture_recent_searches";
const MAX_RECENT = 5;

export interface RecentSearch {
  label: string;
  center: [number, number];
}

export function getRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(search: RecentSearch) {
  const existing = getRecentSearches().filter(
    (s) => s.label !== search.label,
  );
  const updated = [search, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}
