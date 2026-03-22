import imageCompression from "browser-image-compression";

interface CompressOptions {
  maxWidthOrHeight?: number;
  maxSizeMB?: number;
  fileType?: string;
}

const AVATAR_DEFAULTS: Required<CompressOptions> = {
  maxWidthOrHeight: 400,
  maxSizeMB: 0.1,
  fileType: "image/webp",
};

const LISTING_DEFAULTS: Required<CompressOptions> = {
  maxWidthOrHeight: 1200,
  maxSizeMB: 0.3,
  fileType: "image/webp",
};

async function ensureFile(result: File | Blob, originalName: string): Promise<File> {
  if (result instanceof File) return result;
  return new File([result], originalName, { type: result.type });
}

export async function compressAvatar(file: File): Promise<File> {
  const result = await imageCompression(file, {
    ...AVATAR_DEFAULTS,
    useWebWorker: true,
  });
  return ensureFile(result, file.name);
}

export async function compressListingPhoto(file: File): Promise<File> {
  const result = await imageCompression(file, {
    ...LISTING_DEFAULTS,
    useWebWorker: true,
  });
  return ensureFile(result, file.name);
}

export const compressChatPhoto = compressListingPhoto;
