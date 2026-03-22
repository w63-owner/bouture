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
