"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { searchSpecies, type SpeciesResult } from "@/lib/supabase/queries/species";

interface SpeciesAutocompleteProps {
  value: string;
  speciesId: number | null;
  onChange: (name: string, id: number | null) => void;
  error?: string;
}

const DEBOUNCE_MS = 200;

export function SpeciesAutocomplete({
  value,
  speciesId,
  onChange,
  error,
}: SpeciesAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SpeciesResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const doSearch = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    try {
      const data = await searchSpecies(q, ac.signal);
      if (!ac.signal.aborted) {
        setResults(data);
        setOpen(true);
        setHighlightIdx(-1);
      }
    } catch {
      // aborted or network error — ignore
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (speciesId !== null) {
        onChange(text, null);
      }

      if (timerRef.current) clearTimeout(timerRef.current);

      if (text.trim().length < 2) {
        setResults([]);
        setOpen(false);
        return;
      }

      timerRef.current = setTimeout(() => doSearch(text), DEBOUNCE_MS);
    },
    [doSearch, onChange, speciesId],
  );

  const selectSpecies = useCallback(
    (sp: SpeciesResult) => {
      setQuery(sp.common_name);
      onChange(sp.common_name, sp.id);
      setOpen(false);
    },
    [onChange],
  );

  const selectFreeText = useCallback(() => {
    onChange(query.trim(), null);
    setOpen(false);
  }, [onChange, query]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;

      const itemCount = results.length + (query.trim().length >= 2 ? 1 : 0);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((i) => (i + 1) % itemCount);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((i) => (i - 1 + itemCount) % itemCount);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightIdx >= 0 && highlightIdx < results.length) {
          selectSpecies(results[highlightIdx]);
        } else if (highlightIdx === results.length || results.length === 0) {
          selectFreeText();
        }
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [open, results, highlightIdx, selectSpecies, selectFreeText, query],
  );

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

  const showFreeTextOption =
    query.trim().length >= 2 &&
    !results.some(
      (r) => r.common_name.toLowerCase() === query.trim().toLowerCase(),
    );

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-neutral-900">
        Espèce
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || query.trim().length >= 2) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Monstera, Pothos, Ficus…"
          autoComplete="off"
          className={`
            w-full rounded-input
            border-[1.5px] bg-neutral-100 py-3 pl-10 pr-10
            text-base text-neutral-900 placeholder:text-neutral-300
            transition-colors duration-150
            focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20
            ${error ? "border-error focus:border-error focus:ring-error/20" : "border-neutral-300"}
          `}
          aria-expanded={open}
          aria-autocomplete="list"
          role="combobox"
        />
        {loading && (
          <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-600" />
        )}
      </div>
      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {open && (results.length > 0 || showFreeTextOption) && (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 max-h-60 overflow-y-auto rounded-card border border-neutral-300 bg-white shadow-card"
        >
          {results.map((sp, idx) => (
            <li
              key={sp.id}
              role="option"
              aria-selected={highlightIdx === idx}
              onMouseDown={() => selectSpecies(sp)}
              onMouseEnter={() => setHighlightIdx(idx)}
              className={`
                flex cursor-pointer flex-col gap-0.5 px-4 py-2.5 transition-colors
                ${highlightIdx === idx ? "bg-primary/5" : "hover:bg-neutral-100"}
              `}
            >
              <span className="text-sm font-medium text-neutral-900">
                {sp.common_name}
              </span>
              {sp.scientific_name && (
                <span className="text-xs italic text-neutral-600">
                  {sp.scientific_name}
                </span>
              )}
            </li>
          ))}
          {showFreeTextOption && (
            <li
              role="option"
              aria-selected={highlightIdx === results.length}
              onMouseDown={selectFreeText}
              onMouseEnter={() => setHighlightIdx(results.length)}
              className={`
                flex cursor-pointer items-center gap-2 px-4 py-2.5 transition-colors
                ${highlightIdx === results.length ? "bg-primary/5" : "hover:bg-neutral-100"}
              `}
            >
              <Plus className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Utiliser &quot;{query.trim()}&quot;
              </span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
