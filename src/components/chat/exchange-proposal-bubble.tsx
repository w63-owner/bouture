"use client";

import { useCallback, useState, useTransition } from "react";
import {
  Repeat2,
  Check,
  CheckCheck,
  X,
  Clock,
  Loader2,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateTransactionStatus } from "@/lib/supabase/mutations/transactions";
import type { TransactionWithListings } from "@/lib/supabase/queries/transactions";
import type { Database } from "@/lib/types/database.types";

type Status = Database["public"]["Enums"]["message_status"];
type TransactionStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "giver_confirmed"
  | "receiver_confirmed"
  | "completed";

export interface ExchangeProposalMetadata {
  transaction_id: string;
  proposer_username: string;
  offered_listing: {
    id: string;
    species_name: string;
    photo: string | null;
  };
  requested_listing: {
    id: string;
    species_name: string;
    photo: string | null;
  };
}

interface ExchangeProposalBubbleProps {
  metadata: ExchangeProposalMetadata;
  isMine: boolean;
  timestamp: string;
  messageStatus: Status;
  transaction: TransactionWithListings | null;
  currentUserId: string;
  onTransactionUpdate: () => void;
}

const TX_STATUS_STYLES: Record<
  TransactionStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "En attente de réponse",
    className: "text-amber-700 bg-amber-50",
    icon: <Clock className="h-3 w-3" />,
  },
  accepted: {
    label: "Échange accepté",
    className: "text-emerald-700 bg-emerald-50",
    icon: <Check className="h-3 w-3" />,
  },
  rejected: {
    label: "Échange refusé",
    className: "text-neutral-500 bg-neutral-100",
    icon: <X className="h-3 w-3" />,
  },
  cancelled: {
    label: "Proposition annulée",
    className: "text-neutral-500 bg-neutral-100",
    icon: <X className="h-3 w-3" />,
  },
  giver_confirmed: {
    label: "Remise confirmée",
    className: "text-emerald-700 bg-emerald-50",
    icon: <Check className="h-3 w-3" />,
  },
  receiver_confirmed: {
    label: "Réception confirmée",
    className: "text-emerald-700 bg-emerald-50",
    icon: <Check className="h-3 w-3" />,
  },
  completed: {
    label: "Échange terminé",
    className: "text-emerald-700 bg-emerald-50",
    icon: <Leaf className="h-3 w-3" />,
  },
};

function PlantThumbnail({
  photo,
  name,
}: {
  photo: string | null;
  name: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
      {photo ? (
        <img
          src={photo}
          alt={name}
          className="h-20 w-20 rounded-2xl object-cover ring-1 ring-black/5 shadow-sm"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-100">
          <Leaf className="h-7 w-7 text-neutral-300" />
        </div>
      )}
      <p className="text-xs font-medium text-neutral-800 text-center truncate w-full max-w-[90px]">
        {name}
      </p>
    </div>
  );
}

export function ExchangeProposalBubble({
  metadata,
  isMine,
  timestamp,
  messageStatus,
  transaction,
  currentUserId,
  onTransactionUpdate,
}: ExchangeProposalBubbleProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] =
    useState<TransactionStatus | null>(null);

  const txStatus = (optimisticStatus ??
    transaction?.status ??
    "pending") as TransactionStatus;
  const statusConfig = TX_STATUS_STYLES[txStatus];

  const isGiver = transaction
    ? currentUserId === transaction.giver_id
    : !isMine;
  const isReceiver = transaction
    ? currentUserId === transaction.receiver_id
    : isMine;

  const time = new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleAction = useCallback(
    (newStatus: TransactionStatus) => {
      if (!transaction) return;
      setOptimisticStatus(newStatus);
      startTransition(async () => {
        try {
          await updateTransactionStatus(transaction.id, newStatus);
          onTransactionUpdate();
        } catch {
          setOptimisticStatus(null);
        }
      });
    },
    [transaction, onTransactionUpdate],
  );

  const isTerminal = ["rejected", "cancelled", "completed"].includes(txStatus);

  return (
    <div className="flex justify-center my-2">
      <div className="w-full max-w-[85%] rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-3.5 pb-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10">
            <Repeat2 className="h-3.5 w-3.5 text-accent" />
          </div>
          <span className="text-sm font-semibold text-neutral-900">
            Proposition d&apos;échange
          </span>
        </div>

        {/* Plant cards side by side */}
        <div className="flex items-center gap-2 px-4 py-3">
          <PlantThumbnail
            photo={metadata.offered_listing.photo}
            name={metadata.offered_listing.species_name}
          />

          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10">
            <Repeat2 className="h-3.5 w-3.5 text-accent" />
          </div>

          <PlantThumbnail
            photo={metadata.requested_listing.photo}
            name={metadata.requested_listing.species_name}
          />
        </div>

        {/* Status badge */}
        <div className="px-4 pb-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${statusConfig.className}`}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>

        {/* Actions (only for giver when pending, or receiver to cancel) */}
        {!isTerminal && !isPending && transaction && (
          <div className="px-4 pb-3">
            {txStatus === "pending" && isGiver && (
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAction("accepted")}
                >
                  <Check className="h-4 w-4" />
                  Accepter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAction("rejected")}
                >
                  <X className="h-4 w-4" />
                  Refuser
                </Button>
              </div>
            )}

            {txStatus === "pending" && isReceiver && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-neutral-500"
                onClick={() => handleAction("cancelled")}
              >
                Annuler la proposition
              </Button>
            )}

            {txStatus === "accepted" && isGiver && (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => handleAction("giver_confirmed")}
              >
                <Check className="h-4 w-4" />
                J&apos;ai donné la plante
              </Button>
            )}

            {txStatus === "giver_confirmed" && isReceiver && (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => handleAction("completed")}
              >
                <Check className="h-4 w-4" />
                Confirmer la réception
              </Button>
            )}
          </div>
        )}

        {isPending && (
          <div className="flex items-center justify-center pb-3">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-1 justify-end px-4 pb-2.5">
          <span className="text-[10px] text-neutral-400">{time}</span>
          {isMine && (
            <span className="text-neutral-400">
              {messageStatus === "sending" && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              {messageStatus === "sent" && <Check className="h-3 w-3" />}
              {messageStatus === "delivered" && (
                <CheckCheck className="h-3 w-3" />
              )}
              {messageStatus === "read" && (
                <CheckCheck className="h-3 w-3 text-sky-500" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
