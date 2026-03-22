import { createClient } from "@/lib/supabase/client";

export interface SpeciesResult {
  id: number;
  common_name: string;
  scientific_name: string | null;
}

export interface SpeciesRow {
  id: number;
  common_name: string;
  scientific_name: string | null;
  family: string | null;
  illustration_url: string | null;
  visual_category: string | null;
}

export async function searchSpecies(
  query: string,
  signal?: AbortSignal,
): Promise<SpeciesResult[]> {
  if (!query.trim()) return [];

  const supabase = createClient();
  const pattern = `%${query.trim()}%`;

  const { data, error } = await supabase
    .from("species")
    .select("id, common_name, scientific_name")
    .ilike("common_name", pattern)
    .order("common_name")
    .limit(10)
    .abortSignal(signal!);

  if (error) throw error;
  return data ?? [];
}

const SPECIES_PAGE_SIZE = 30;

export async function getAllSpecies(
  page: number = 0,
  search?: string,
): Promise<{ data: SpeciesRow[]; hasMore: boolean }> {
  const supabase = createClient();
  const from = page * SPECIES_PAGE_SIZE;
  const to = from + SPECIES_PAGE_SIZE;

  let query = supabase
    .from("species")
    .select("id, common_name, scientific_name, family, illustration_url, visual_category")
    .order("common_name");

  if (search?.trim()) {
    query = query.ilike("common_name", `%${search.trim()}%`);
  }

  const { data, error } = await query.range(from, to);

  if (error) throw error;

  const rows = data ?? [];
  const hasMore = rows.length > SPECIES_PAGE_SIZE;

  return {
    data: hasMore ? rows.slice(0, SPECIES_PAGE_SIZE) : rows,
    hasMore,
  };
}
