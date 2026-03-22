import { createClient } from "@/lib/supabase/client";

export interface SpeciesResult {
  id: number;
  common_name: string;
  scientific_name: string | null;
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
