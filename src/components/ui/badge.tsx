import type { ListingSize } from "@/lib/types/listing";

const SIZE_CONFIG: Record<ListingSize, { label: string; color: string }> = {
  graine: { label: "Graine", color: "bg-amber-100 text-amber-800" },
  tubercule: { label: "Tubercule", color: "bg-orange-100 text-orange-800" },
  xs: { label: "XS", color: "bg-emerald-100 text-emerald-800" },
  s: { label: "S", color: "bg-green-100 text-green-800" },
  m: { label: "M", color: "bg-teal-100 text-teal-800" },
  l: { label: "L", color: "bg-cyan-100 text-cyan-800" },
  xl: { label: "XL", color: "bg-blue-100 text-blue-800" },
  xxl: { label: "XXL", color: "bg-indigo-100 text-indigo-800" },
};

interface SizeBadgeProps {
  size: ListingSize;
  className?: string;
}

export function SizeBadge({ size, className = "" }: SizeBadgeProps) {
  const config = SIZE_CONFIG[size] ?? { label: size, color: "bg-neutral-100 text-neutral-600" };

  return (
    <span
      className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${config.color} ${className}`}
    >
      {config.label}
    </span>
  );
}
