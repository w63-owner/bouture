"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sprout, ArrowRight, Camera, MapPin, Loader2, Check, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { compressAvatar } from "@/lib/utils/image-compression";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

type Step = 1 | 2 | 3;

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 2 state
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 3 state
  const [city, setCity] = useState("");
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "done" | "denied">("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Username validation + uniqueness check (debounced)
  const checkUsername = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      const trimmed = value.trim().toLowerCase();
      if (trimmed.length < 3) {
        setUsernameStatus(trimmed.length === 0 ? "idle" : "invalid");
        return;
      }
      if (!/^[a-z0-9_]+$/.test(trimmed)) {
        setUsernameStatus("invalid");
        return;
      }

      setUsernameStatus("checking");
      debounceRef.current = setTimeout(async () => {
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", trimmed)
          .maybeSingle();

        setUsernameStatus(data ? "taken" : "available");
      }, 500);
    },
    [supabase],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setUsername(val);
    checkUsername(val);
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    setAvatarFile(file);
  }

  function removeAvatar() {
    setAvatarFile(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleGeolocation() {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoStatus("done");
        if (!city) {
          setCity(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        }
      },
      () => {
        setGeoStatus("denied");
        toast.error("Impossible d'accéder à votre position. Entrez votre ville manuellement.");
      },
    );
  }

  function canProceedStep2(): boolean {
    return username.trim().length >= 3 && usernameStatus === "available";
  }

  function canProceedStep3(): boolean {
    return city.trim().length >= 2;
  }

  async function handleFinish() {
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        router.push("/auth/login");
        return;
      }

      let avatarUrl: string | null = null;

      if (avatarFile) {
        const compressed = await compressAvatar(avatarFile);
        const ext = "webp";
        const path = `${user.id}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, compressed, {
            contentType: "image/webp",
            upsert: true,
          });

        if (uploadError) {
          console.error("Avatar upload error:", uploadError);
          toast.error("Erreur lors de l'upload de l'avatar. Votre profil sera créé sans avatar.");
        } else {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      }

      const trimmedUsername = username.trim().toLowerCase();

      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          username: trimmedUsername,
          avatar_url: avatarUrl,
          address_city: city.trim() || null,
          address_lat: coords?.lat ?? null,
          address_lng: coords?.lng ?? null,
        },
        { onConflict: "id" },
      );

      if (upsertError) {
        console.error("Profile upsert error:", upsertError);
        if (upsertError.message.includes("unique") || upsertError.code === "23505") {
          toast.error("Ce nom d'utilisateur est déjà pris. Veuillez en choisir un autre.");
          setStep(2);
          setUsernameStatus("taken");
          return;
        }
        toast.error("Erreur lors de la création du profil. Veuillez réessayer.");
        return;
      }

      toast.success("Bienvenue sur bouture ! 🌱");
      router.push("/carte");
      router.refresh();
    } catch {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              s === step
                ? "w-8 bg-primary"
                : s < step
                  ? "w-2 bg-primary/60"
                  : "w-2 bg-neutral-300"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Welcome */}
      {step === 1 && (
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Sprout className="h-12 w-12 text-primary" strokeWidth={1.5} />
          </div>

          <h1 className="font-display text-2xl font-semibold text-neutral-900">
            Bienvenue sur bouture !
          </h1>
          <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
            Quelques étapes rapides pour configurer votre profil et commencer à
            échanger des boutures près de chez vous.
          </p>

          <Button onClick={() => setStep(2)} className="mt-8 w-full">
            Commencer
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 2: Profile */}
      {step === 2 && (
        <div className="flex flex-col">
          <h2 className="mb-1 font-display text-xl font-semibold text-neutral-900 text-center">
            Votre profil
          </h2>
          <p className="mb-6 text-center text-sm text-neutral-600">
            Choisissez un pseudo et un avatar
          </p>

          {/* Avatar */}
          <div className="mb-6 flex flex-col items-center">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-neutral-300 bg-neutral-100 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-neutral-600 group-hover:text-primary">
                  <Camera className="h-6 w-6" />
                  <span className="mt-1 text-[10px] font-medium">Photo</span>
                </div>
              )}
            </button>
            {avatarPreview && (
              <button
                type="button"
                onClick={removeAvatar}
                className="mt-2 flex items-center gap-1 text-xs text-neutral-600 hover:text-error transition-colors"
              >
                <X className="h-3 w-3" />
                Supprimer
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="mt-2 text-xs text-neutral-600">Optionnel</p>
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <Input
              label="Nom d'utilisateur"
              placeholder="ex: plantlover42"
              value={username}
              onChange={handleUsernameChange}
              autoComplete="off"
              hint="Au moins 3 caractères, lettres minuscules, chiffres et _"
              error={
                usernameStatus === "taken"
                  ? "Ce pseudo est déjà pris"
                  : usernameStatus === "invalid"
                    ? "Lettres minuscules, chiffres et _ uniquement (min. 3)"
                    : undefined
              }
            />
            {usernameStatus === "checking" && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                Vérification…
              </div>
            )}
            {usernameStatus === "available" && (
              <div className="flex items-center gap-1.5 text-xs text-success">
                <Check className="h-3 w-3" />
                Disponible
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">
              Retour
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!canProceedStep2()}
              className="flex-1"
            >
              Suivant
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Location */}
      {step === 3 && (
        <div className="flex flex-col">
          <h2 className="mb-1 font-display text-xl font-semibold text-neutral-900 text-center">
            Votre localisation
          </h2>
          <p className="mb-6 text-center text-sm text-neutral-600">
            Pour trouver des boutures près de chez vous
          </p>

          <div className="mb-4 flex h-32 items-center justify-center rounded-card bg-neutral-100">
            <MapPin className="h-10 w-10 text-neutral-300" />
          </div>

          <Input
            label="Ville"
            placeholder="ex: Paris, Lyon, Marseille…"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoComplete="address-level2"
          />

          <button
            type="button"
            onClick={handleGeolocation}
            disabled={geoStatus === "loading"}
            className="mt-3 flex items-center gap-2 self-start text-sm font-medium text-primary transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {geoStatus === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {geoStatus === "done"
              ? "Position détectée"
              : geoStatus === "denied"
                ? "Accès refusé — entrez manuellement"
                : "Utiliser ma position"}
          </button>

          <p className="mt-4 text-xs text-neutral-600 leading-relaxed">
            Votre adresse exacte n'est jamais partagée. Seule la ville est
            visible par les autres utilisateurs.
          </p>

          <div className="mt-8 flex gap-3">
            <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">
              Retour
            </Button>
            <Button
              onClick={handleFinish}
              disabled={!canProceedStep3()}
              loading={isSubmitting}
              className="flex-1"
            >
              Terminer
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
