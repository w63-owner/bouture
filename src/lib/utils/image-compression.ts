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

export async function compressAvatar(file: File): Promise<File> {
  return imageCompression(file, {
    ...AVATAR_DEFAULTS,
    useWebWorker: true,
  });
}

export async function compressListingPhoto(file: File): Promise<File> {
  return imageCompression(file, {
    ...LISTING_DEFAULTS,
    useWebWorker: true,
  });
}

export const compressChatPhoto = compressListingPhoto;
