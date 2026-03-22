"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/carte";

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      const message = mapAuthError(error.message);
      setServerError(message);
      return;
    }

    router.push(returnTo);
    router.refresh();
  }

  return (
    <Card>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          Se connecter
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Retrouvez vos boutures et vos échanges
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex justify-end">
          <Link
            href="/auth/reset"
            className="text-sm text-primary hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          <LogIn className="h-4 w-4" />
          Se connecter
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Pas encore de compte ?{" "}
        <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </Card>
  );
}

function mapAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (message.includes("Email not confirmed")) {
    return "Votre email n'a pas encore été vérifié. Vérifiez votre boîte de réception.";
  }
  if (message.includes("Too many requests")) {
    return "Trop de tentatives. Veuillez réessayer dans quelques minutes.";
  }
  return "Une erreur est survenue. Veuillez réessayer.";
}
