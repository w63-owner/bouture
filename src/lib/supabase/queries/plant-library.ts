import { createClient } from "../client";
import type { Database } from "@/lib/types/database.types";

type PlantStatus = Database["public"]["Enums"]["plant_status"];

export interface PlantLibraryItem {
  id: string;
  species_name: string;
  species_id: number | null;
  photos: string[];
  notes: string | null;
  status: PlantStatus;
  created_at: string;
}

export async function getUserPlants(
  userId: string,
): Promise<PlantLibraryItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("plant_library")
    .select("id, species_name, species_id, photos, notes, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch plants: ${error.message}`);
  return data ?? [];
}

export async function getPlantById(
  plantId: string,
): Promise<PlantLibraryItem | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("plant_library")
    .select("id, species_name, species_id, photos, notes, status, created_at")
    .eq("id", plantId)
    .single();

  if (error) return null;
  return data;
}

export interface AddPlantData {
  species_name: string;
  species_id: number | null;
  photos: string[];
  notes: string;
}

export async function addPlant(
  userId: string,
  data: AddPlantData,
): Promise<string> {
  const supabase = createClient();

  const { data: result, error } = await supabase
    .from("plant_library")
    .insert({
      user_id: userId,
      species_name: data.species_name,
      species_id: data.species_id,
      photos: data.photos,
      notes: data.notes || null,
      status: "collection" as PlantStatus,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to add plant: ${error.message}`);
  return result.id;
}

export async function updatePlant(
  plantId: string,
  data: Partial<{
    species_name: string;
    species_id: number | null;
    photos: string[];
    notes: string | null;
    status: PlantStatus;
  }>,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("plant_library")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", plantId);

  if (error) throw new Error(`Failed to update plant: ${error.message}`);
}

export async function deletePlant(plantId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("plant_library")
    .delete()
    .eq("id", plantId);

  if (error) throw new Error(`Failed to delete plant: ${error.message}`);
}

export async function getUserOwnedSpeciesIds(
  userId: string,
): Promise<Set<number>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("plant_library")
    .select("species_id")
    .eq("user_id", userId)
    .not("species_id", "is", null);

  if (error) throw new Error(`Failed to fetch owned species: ${error.message}`);

  return new Set(
    (data ?? []).map((row) => row.species_id).filter((id): id is number => id !== null),
  );
}

export async function getUserCollectionPlants(
  userId: string,
): Promise<PlantLibraryItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("plant_library")
    .select("id, species_name, species_id, photos, notes, status, created_at")
    .eq("user_id", userId)
    .eq("status", "collection")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch collection plants: ${error.message}`);
  return data ?? [];
}

/** Maps species_id → first plant_library.id for quick navigation */
export async function getUserPlantsBySpecies(
  userId: string,
): Promise<Map<number, string>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("plant_library")
    .select("id, species_id")
    .eq("user_id", userId)
    .not("species_id", "is", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch plant map: ${error.message}`);

  const map = new Map<number, string>();
  for (const row of data ?? []) {
    if (row.species_id !== null && !map.has(row.species_id)) {
      map.set(row.species_id, row.id);
    }
  }
  return map;
}
