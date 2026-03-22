import { createClient } from "./client";

export async function uploadListingPhoto(
  userId: string,
  listingId: string,
  file: File,
  index: number,
): Promise<string> {
  const supabase = createClient();
  const ext = "webp";
  const path = `${userId}/${listingId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("listings")
    .upload(path, file, {
      contentType: "image/webp",
      upsert: false,
    });

  if (error) throw new Error(`Upload failed for photo ${index}: ${error.message}`);

  const { data } = supabase.storage.from("listings").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadListingPhotos(
  userId: string,
  listingId: string,
  files: File[],
): Promise<string[]> {
  return Promise.all(
    files.map((file, i) => uploadListingPhoto(userId, listingId, file, i)),
  );
}

export async function deleteListingPhotos(
  userId: string,
  listingId: string,
): Promise<void> {
  const supabase = createClient();
  const prefix = `${userId}/${listingId}`;

  const { data: files } = await supabase.storage
    .from("listings")
    .list(prefix);

  if (files && files.length > 0) {
    const paths = files.map((f) => `${prefix}/${f.name}`);
    await supabase.storage.from("listings").remove(paths);
  }
}

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<string> {
  const supabase = createClient();
  const path = `${userId}/${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) throw new Error(`Avatar upload failed: ${error.message}`);

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPlantPhoto(
  userId: string,
  file: File,
): Promise<string> {
  const supabase = createClient();
  const path = `${userId}/${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage
    .from("plant-library")
    .upload(path, file, {
      contentType: "image/webp",
      upsert: false,
    });

  if (error) throw new Error(`Plant photo upload failed: ${error.message}`);

  const { data } = supabase.storage.from("plant-library").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPlantPhotos(
  userId: string,
  files: File[],
): Promise<string[]> {
  return Promise.all(files.map((file) => uploadPlantPhoto(userId, file)));
}

export async function uploadChatImage(
  conversationId: string,
  file: File,
): Promise<string> {
  const supabase = createClient();
  const path = `${conversationId}/${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage
    .from("chat-images")
    .upload(path, file, {
      contentType: "image/webp",
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
}
