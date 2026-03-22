"use client";

import { Bell, BellOff, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePushSubscription } from "@/lib/hooks/use-push-subscription";
import { Button } from "@/components/ui/button";

export default function ParametresPage() {
  const { state, subscribing, subscribe, unsubscribe } =
    usePushSubscription();

  return (
    <div className="flex flex-1 flex-col pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <Link
          href="/profil"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100"
        >
          <ChevronLeft className="h-5 w-5 text-neutral-700" />
        </Link>
        <h1 className="text-lg font-semibold text-neutral-900">Paramètres</h1>
      </div>

      <div className="mt-4 px-5">
        <div className="overflow-hidden rounded-card bg-white shadow-card">
          {/* Notifications section */}
          <div className="px-4 py-4">
            <h2 className="text-sm font-semibold text-neutral-900">
              Notifications
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Recevez une notification lorsque vous avez un nouveau message.
            </p>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {state === "granted" ? (
                  <Bell className="h-5 w-5 text-primary" />
                ) : (
                  <BellOff className="h-5 w-5 text-neutral-400" />
                )}
                <span className="text-sm font-medium text-neutral-800">
                  Notifications push
                </span>
              </div>

              {state === "unsupported" && (
                <span className="text-xs text-neutral-400">
                  Non supporté
                </span>
              )}

              {state === "denied" && (
                <span className="text-xs text-red-500">
                  Bloqué dans le navigateur
                </span>
              )}

              {state === "loading" && (
                <div className="h-8 w-20 animate-pulse rounded-btn bg-neutral-100" />
              )}

              {state === "prompt" && (
                <Button
                  size="sm"
                  variant="secondary"
                  loading={subscribing}
                  onClick={subscribe}
                >
                  Activer
                </Button>
              )}

              {state === "granted" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={unsubscribe}
                >
                  Désactiver
                </Button>
              )}
            </div>

            {state === "denied" && (
              <p className="mt-3 text-xs text-neutral-500">
                Vous avez bloqué les notifications. Pour les réactiver,
                modifiez les permissions du site dans les paramètres de votre
                navigateur.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
