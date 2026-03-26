"use client";

import { Chip } from "@/components/ui/chip";
import type { TransactionType } from "@/lib/types/listing";

const OPTIONS: { value: TransactionType; label: string }[] = [
  { value: "don_uniquement", label: "Donner uniquement" },
  { value: "echange_uniquement", label: "Échanger uniquement" },
  { value: "les_deux", label: "Don et Échange" },
];

interface TransactionTypeSelectorProps {
  value: TransactionType | undefined;
  onChange: (type: TransactionType) => void;
  error?: string;
}

export function TransactionTypeSelector({
  value,
  onChange,
  error,
}: TransactionTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-neutral-900">
        Type de transaction
      </label>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            selected={value === opt.value}
            onToggle={() => onChange(opt.value)}
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
