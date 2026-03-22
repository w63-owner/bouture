"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { sendMessage, sendImageMessage } from "@/app/messages/actions";
import { compressChatPhoto } from "@/lib/utils/image-compression";
import { uploadChatImage } from "@/lib/supabase/storage";
import { toast } from "@/components/ui/toast";

interface MessageInputProps {
  conversationId: string;
  onTyping?: () => void;
}

export function MessageInput({ conversationId, onTyping }: MessageInputProps) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const clearImage = useCallback(() => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Seules les images sont acceptées");
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    },
    [],
  );

  const handleSendImage = useCallback(async () => {
    if (!imageFile || isUploading) return;

    setIsUploading(true);
    try {
      const compressed = await compressChatPhoto(imageFile);
      const path = await uploadChatImage(conversationId, compressed);
      await sendImageMessage(conversationId, path);
      clearImage();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Erreur lors de l'envoi de la photo",
      );
    } finally {
      setIsUploading(false);
    }
  }, [imageFile, isUploading, conversationId, clearImage]);

  const handleSend = useCallback(() => {
    if (imageFile) {
      handleSendImage();
      return;
    }

    const trimmed = value.trim();
    if (!trimmed || isPending) return;

    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    startTransition(async () => {
      try {
        await sendMessage(conversationId, trimmed);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Erreur lors de l'envoi",
        );
        setValue(trimmed);
      }
    });
  }, [value, isPending, conversationId, imageFile, handleSendImage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const isSendDisabled =
    isUploading || isPending || (!value.trim() && !imageFile);

  return (
    <div className="sticky bottom-0 z-10 border-t border-neutral-100 bg-white/95 backdrop-blur-sm px-4 py-3 safe-area-bottom">
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <img
            src={imagePreview}
            alt="Aperçu"
            className="h-20 w-20 rounded-lg object-cover border border-neutral-200"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-white shadow-sm"
            aria-label="Supprimer la photo"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-40"
          aria-label="Joindre une photo"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            adjustHeight();
            onTyping?.();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Votre message..."
          rows={1}
          disabled={isUploading}
          className="flex-1 resize-none rounded-input border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-600/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-60"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={isSendDisabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-all hover:bg-primary-light active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Envoyer"
        >
          {isUploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
