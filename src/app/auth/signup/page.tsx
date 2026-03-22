"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { UserPlus, Mail, ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const signupSchema = z
  .object({
    email: z.string().min(1, "L'email est requis").email("Email invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormData) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      const message = mapSignupError(error.message);
      setServerError(message);
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
            Vérifiez votre email
          </h1>
          <p className="mt-3 text-sm text-neutral-600">
            Un lien de vérification a été envoyé à{" "}
            <span className="font-semibold text-neutral-900">{sentEmail}</span>.
            <br />
            Cliquez sur le lien pour activer votre compte.
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
          Créer un compte
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Rejoignez la communauté et partagez vos boutures
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

        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          hint="Au moins 8 caractères, 1 majuscule et 1 chiffre"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          <UserPlus className="h-4 w-4" />
          Créer mon compte
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Déjà un compte ?{" "}
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </Card>
  );
}

function mapSignupError(message: string): string {
  if (message.includes("User already registered") || message.includes("already been registered")) {
    return "Un compte existe déjà avec cet email.";
  }
  if (message.includes("Password should be at least")) {
    return "Le mot de passe est trop court.";
  }
  if (message.includes("Too many requests")) {
    return "Trop de tentatives. Veuillez réessayer dans quelques minutes.";
  }
  return "Une erreur est survenue. Veuillez réessayer.";
}
