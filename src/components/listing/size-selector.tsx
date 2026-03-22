"use client";

import { Chip } from "@/components/ui/chip";
import type { ListingSize } from "@/lib/types/listing";

const SIZE_OPTIONS: { value: ListingSize; label: string }[] = [
  { value: "graine", label: "Graine" },
  { value: "tubercule", label: "Tubercule" },
  { value: "xs", label: "XS" },
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL" },
  { value: "xxl", label: "XXL" },
];

interface SizeSelectorProps {
  value: ListingSize | undefined;
  onChange: (size: ListingSize) => void;
  error?: string;
}

export function SizeSelector({ value, onChange, error }: SizeSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-neutral-900">
        Taille
      </label>
      <div className="flex flex-wrap gap-2">
        {SIZE_OPTIONS.map((opt) => (
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
