"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, ImagePlus, Image, Loader2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { compressListingPhoto } from "@/lib/utils/image-compression";

interface PhotoItem {
  id: string;
  file: File;
  previewUrl: string;
  compressing: boolean;
}

interface PhotoUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  error?: string;
  max?: number;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export function PhotoUpload({
  value,
  onChange,
  error,
  max = 5,
}: PhotoUploadProps) {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const dragIdxRef = useRef<number | null>(null);
  const dragOverIdxRef = useRef<number | null>(null);

  useEffect(() => {
    if (value.length === 0) {
      setItems((prev) => {
        if (prev.length > 0) {
          prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
          return [];
        }
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.length]);

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
    // Only on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) =>
        ACCEPTED_TYPES.includes(f.type),
      );
      const available = max - items.length;
      const toProcess = files.slice(0, available);
      if (toProcess.length === 0) return;

      const newItems: PhotoItem[] = toProcess.map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        previewUrl: URL.createObjectURL(f),
        compressing: true,
      }));

      const merged = [...items, ...newItems];
      setItems(merged);

      const compressed = await Promise.all(
        newItems.map(async (item) => {
          try {
            const result = await compressListingPhoto(item.file);
            return { ...item, file: result, compressing: false };
          } catch {
            return { ...item, compressing: false };
          }
        }),
      );

      setItems((prev) => {
        const updated = prev.map((p) => {
          const match = compressed.find((c) => c.id === p.id);
          return match ?? p;
        });
        queueMicrotask(() => onChange(updated.map((u) => u.file)));
        return updated;
      });
    },
    [items, max, onChange],
  );

  const removePhoto = useCallback(
    (id: string) => {
      setItems((prev) => {
        const target = prev.find((p) => p.id === id);
        if (target) URL.revokeObjectURL(target.previewUrl);
        const updated = prev.filter((p) => p.id !== id);
        queueMicrotask(() => onChange(updated.map((u) => u.file)));
        return updated;
      });
    },
    [onChange],
  );

  const handleDragStart = useCallback((idx: number) => {
    dragIdxRef.current = idx;
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, idx: number) => {
      e.preventDefault();
      dragOverIdxRef.current = idx;
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const from = dragIdxRef.current;
      const to = dragOverIdxRef.current;

      if (from === null || to === null || from === to) return;

      setItems((prev) => {
        const copy = [...prev];
        const [moved] = copy.splice(from, 1);
        copy.splice(to, 0, moved);
        queueMicrotask(() => onChange(copy.map((c) => c.file)));
        return copy;
      });

      dragIdxRef.current = null;
      dragOverIdxRef.current = null;
    },
    [onChange],
  );

  const handleDropzone = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-neutral-900">
        Photos
        <span className="ml-1 font-normal text-neutral-600">
          ({items.length}/{max})
        </span>
      </label>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="relative aspect-square overflow-hidden rounded-card bg-neutral-100"
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={handleDrop}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.previewUrl}
              alt={`Photo ${idx + 1}`}
              className="h-full w-full object-cover"
            />

            {idx === 0 && (
              <span className="absolute bottom-1 left-1 rounded-pill bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                Couverture
              </span>
            )}

            {item.compressing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}

            <button
              type="button"
              onClick={() => removePhoto(item.id)}
              className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {items.length < max && (
          <button
            type="button"
            onClick={() => setSourcePickerOpen(true)}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={handleDropzone}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-card border-2 border-dashed border-neutral-300 bg-neutral-100 text-neutral-600 transition-colors hover:border-primary hover:text-primary"
          >
            {items.length === 0 ? (
              <>
                <Camera className="h-6 w-6" />
                <span className="text-xs font-medium">Ajouter</span>
              </>
            ) : (
              <ImagePlus className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <Dialog.Root open={sourcePickerOpen} onOpenChange={setSourcePickerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-sheet focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300" />
            <Dialog.Title className="sr-only">
              Ajouter une photo
            </Dialog.Title>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-neutral-100 active:bg-neutral-100"
                onClick={() => {
                  setSourcePickerOpen(false);
                  requestAnimationFrame(() => cameraInputRef.current?.click());
                }}
              >
                <Camera className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-neutral-900">
                  Prendre une photo
                </span>
              </button>
              <button
                type="button"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-neutral-100 active:bg-neutral-100"
                onClick={() => {
                  setSourcePickerOpen(false);
                  requestAnimationFrame(() => galleryInputRef.current?.click());
                }}
              >
                <Image className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-neutral-900">
                  Choisir dans la galerie
                </span>
              </button>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="mt-2 w-full rounded-xl bg-neutral-100 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-200"
              >
                Annuler
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
