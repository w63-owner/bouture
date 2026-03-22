"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { KeyRound, Mail, ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const resetSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  async function onSubmit(data: ResetFormData) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });

    if (error) {
      if (error.message.includes("Too many requests")) {
        setServerError(
          "Trop de tentatives. Veuillez réessayer dans quelques minutes.",
        );
        return;
      }
      setServerError("Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    setSentEmail(data.email);
    setEmailSent(true);
  }

  if (emailSent) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-neutral-900">
            Email envoyé
          </h1>
          <p className="mt-3 text-sm text-neutral-600">
            Si un compte existe pour{" "}
            <span className="font-semibold text-neutral-900">{sentEmail}</span>,
            vous recevrez un lien pour réinitialiser votre mot de passe.
          </p>
          <p className="mt-4 text-xs text-neutral-600">
            Vous ne trouvez pas l&apos;email ? Vérifiez vos spams.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          Mot de passe oublié
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {serverError && (
          <div className="rounded-btn bg-error/10 px-4 py-3 text-sm text-error" role="alert">
            {serverError}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="vous@exemple.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          <KeyRound className="h-4 w-4" />
          Envoyer le lien
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
      </p>
    </Card>
  );
}
