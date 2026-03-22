"use client";

import { useState, useRef, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Camera, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compressAvatar } from "@/lib/utils/image-compression";
import { uploadAvatar } from "@/lib/supabase/storage";
import { updateProfile } from "@/lib/supabase/queries/profile";
import { toast } from "@/components/ui/toast";

interface EditProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  onSaved: () => void;
}

const BIO_MAX = 200;

export function EditProfileSheet({
  open,
  onOpenChange,
  userId,
  username: initialUsername,
  avatarUrl: initialAvatar,
  bio: initialBio,
  onSaved,
}: EditProfileSheetProps) {
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio ?? "");
  const [avatarPreview, setAvatarPreview] = useState(initialAvatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setCompressing(true);
      try {
        const compressed = await compressAvatar(file);
        setAvatarFile(compressed);
        setAvatarPreview(URL.createObjectURL(compressed));
      } catch {
        toast.error("Erreur lors de la compression de l'image");
      } finally {
        setCompressing(false);
      }
    },
    [],
  );

  const handleSave = useCallback(async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      toast.error("Le nom d'utilisateur est requis");
      return;
    }

    setSaving(true);
    try {
      let newAvatarUrl: string | undefined;

      if (avatarFile) {
        newAvatarUrl = await uploadAvatar(userId, avatarFile);
      }

      await updateProfile(userId, {
        username: trimmedUsername !== initialUsername ? trimmedUsername : undefined,
        bio: bio.trim() || undefined,
        avatar_url: newAvatarUrl,
      });

      toast.success("Profil mis à jour !");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  }, [
    username,
    bio,
    avatarFile,
    userId,
    initialUsername,
    onSaved,
    onOpenChange,
  ]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-sheet bg-white px-5 pb-8 pt-4 shadow-sheet focus:outline-none safe-area-bottom data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom">
          {/* Handle */}
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-neutral-300" />

          <Dialog.Title className="text-lg font-heading font-semibold text-neutral-900">
            Modifier le profil
          </Dialog.Title>

          <div className="mt-5 flex flex-col gap-5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative"
                disabled={compressing}
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover ring-2 ring-neutral-300"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-2 ring-neutral-300">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-btn">
                  {compressing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </div>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <span className="text-xs text-neutral-600">
                Changer la photo
              </span>
            </div>

            {/* Username */}
            <Input
              label="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
            />

            {/* Bio */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-semibold text-neutral-900">
                  Bio
                </label>
                <span
                  className={`text-xs tabular-nums ${bio.length > BIO_MAX ? "text-error" : "text-neutral-600"}`}
                >
                  {bio.length}/{BIO_MAX}
                </span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={BIO_MAX}
                rows={3}
                placeholder="Parlez-nous de vous et de vos plantes…"
                className="w-full resize-none rounded-input border-[1.5px] border-neutral-300 bg-neutral-100 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-300 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {/* Save */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={saving}
              onClick={handleSave}
            >
              Enregistrer
            </Button>
          </div>

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
