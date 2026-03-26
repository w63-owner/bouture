"use client";

import { useCallback, useState, useTransition } from "react";
import { Repeat2, Check, X, Clock, Loader2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateTransactionStatus } from "@/lib/supabase/mutations/transactions";
import { PlantCaptureAnimation } from "@/components/animations/plant-capture-animation";
import type { TransactionWithListings } from "@/lib/supabase/queries/transactions";

type TransactionStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "giver_confirmed"
  | "receiver_confirmed"
  | "completed";

interface TransactionCardProps {
  transaction: TransactionWithListings;
  currentUserId: string;
}

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; bg: string; border: string; icon: string }
> = {
  pending: {
    label: "En attente",
    bg: "bg-warning/10",
    border: "border-warning/30",
    icon: "⏳",
  },
  accepted: {
    label: "Accepté",
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: "✓",
  },
  rejected: {
    label: "Refusé",
    bg: "bg-neutral-100",
    border: "border-neutral-300/50",
    icon: "✗",
  },
  cancelled: {
    label: "Annulé",
    bg: "bg-neutral-100",
    border: "border-neutral-300/50",
    icon: "✗",
  },
  giver_confirmed: {
    label: "Donneur a confirmé",
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: "✓",
  },
  receiver_confirmed: {
    label: "Receveur a confirmé",
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: "✓",
  },
  completed: {
    label: "Terminé",
    bg: "bg-emerald-50",
    border: "border-emerald-300/50",
    icon: "🌱",
  },
};

export function TransactionCard({
  transaction,
  currentUserId,
}: TransactionCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showCaptureAnimation, setShowCaptureAnimation] = useState(false);
  const status = transaction.status as TransactionStatus;
  const config = STATUS_CONFIG[status];

  const isGiver = currentUserId === transaction.giver_id;
  const isReceiver = currentUserId === transaction.receiver_id;

  const plantImageUrl =
    transaction.listing?.photos?.[0] ?? "";

  const handleStatusUpdate = useCallback(
    (newStatus: TransactionStatus) => {
      startTransition(async () => {
        try {
          await updateTransactionStatus(transaction.id, newStatus);

          if (newStatus === "completed" && isReceiver) {
            setShowCaptureAnimation(true);
          }
        } catch (e) {
          console.error("Failed to update transaction:", e);
        }
      });
    },
    [transaction.id, isReceiver],
  );

  return (
    <>
      <div
        className={`mx-4 mt-2 rounded-card border ${config.border} ${config.bg} p-4`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Repeat2 className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-neutral-900">
            Échange proposé
          </span>
        </div>

        {/* Two listings side by side */}
        <div className="flex items-center gap-3 mb-3">
          {/* Listing A (target) */}
          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            {transaction.listing?.photos?.[0] ? (
              <img
                src={transaction.listing.photos[0]}
                alt={transaction.listing.species_name}
                className="h-16 w-16 rounded-xl object-cover ring-1 ring-neutral-200"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-200">
                <Repeat2 className="h-6 w-6 text-neutral-400" />
              </div>
            )}
            <p className="text-xs font-medium text-neutral-900 text-center truncate w-full">
              {transaction.listing?.species_name ?? "Annonce"}
            </p>
            <p className="text-[10px] text-neutral-600">
              @{transaction.giver?.username}
            </p>
          </div>

          {/* Swap arrow */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <Repeat2 className="h-4 w-4 text-accent" />
          </div>

          {/* Listing B (offered) */}
          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            {transaction.offered_listing?.photos?.[0] ? (
              <img
                src={transaction.offered_listing.photos[0]}
                alt={transaction.offered_listing.species_name}
                className="h-16 w-16 rounded-xl object-cover ring-1 ring-neutral-200"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-200">
                <Repeat2 className="h-6 w-6 text-neutral-400" />
              </div>
            )}
            <p className="text-xs font-medium text-neutral-900 text-center truncate w-full">
              {transaction.offered_listing?.species_name ?? "Annonce"}
            </p>
            <p className="text-[10px] text-neutral-600">
              @{transaction.receiver?.username}
            </p>
          </div>
        </div>

        {/* Status line */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs">{config.icon}</span>
          <span className="text-xs font-medium text-neutral-700">
            {getStatusLabel(status, isGiver)}
          </span>
        </div>

        {/* Action buttons */}
        {isPending ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        ) : (
          <TransactionActions
            status={status}
            isGiver={isGiver}
            isReceiver={isReceiver}
            onUpdate={handleStatusUpdate}
          />
        )}
      </div>

      {showCaptureAnimation && plantImageUrl && (
        <PlantCaptureAnimation
          plantImageUrl={plantImageUrl}
          onComplete={() => setShowCaptureAnimation(false)}
        />
      )}
    </>
  );
}

function getStatusLabel(status: TransactionStatus, isGiver: boolean): string {
  switch (status) {
    case "pending":
      return isGiver ? "Nouvelle proposition reçue" : "Proposition envoyée";
    case "accepted":
      return "Échange accepté — organisez la remise";
    case "rejected":
      return isGiver ? "Vous avez refusé" : "Proposition refusée";
    case "cancelled":
      return isGiver ? "Proposition annulée" : "Vous avez annulé";
    case "giver_confirmed":
      return isGiver ? "En attente de confirmation" : "Le donneur a confirmé — confirmez la réception";
    case "receiver_confirmed":
      return isGiver ? "Le receveur a confirmé" : "En attente de confirmation";
    case "completed":
      return "Échange terminé 🌱";
    default:
      return "";
  }
}

function TransactionActions({
  status,
  isGiver,
  isReceiver,
  onUpdate,
}: {
  status: TransactionStatus;
  isGiver: boolean;
  isReceiver: boolean;
  onUpdate: (status: TransactionStatus) => void;
}) {
  if (status === "pending" && isGiver) {
    return (
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={() => onUpdate("accepted")}
        >
          <Check className="h-4 w-4" />
          Accepter
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onUpdate("rejected")}
        >
          <X className="h-4 w-4" />
          Refuser
        </Button>
      </div>
    );
  }

  if (status === "pending" && isReceiver) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => onUpdate("cancelled")}
      >
        <Clock className="h-4 w-4" />
        Annuler la proposition
      </Button>
    );
  }

  if (status === "accepted" && isGiver) {
    return (
      <Button
        variant="primary"
        size="sm"
        className="w-full"
        onClick={() => onUpdate("giver_confirmed")}
      >
        <PackageCheck className="h-4 w-4" />
        J&apos;ai donné la plante
      </Button>
    );
  }

  if (status === "giver_confirmed" && isReceiver) {
    return (
      <Button
        variant="primary"
        size="sm"
        className="w-full"
        onClick={() => onUpdate("completed")}
      >
        <Check className="h-4 w-4" />
        Confirmer la réception
      </Button>
    );
  }

  return null;
}
