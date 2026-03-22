import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilLoading() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Header skeleton */}
      <div className="flex flex-col items-center gap-3 px-6 pt-10 pb-6">
        <Skeleton className="h-24 w-24 !rounded-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>

      {/* Stats row skeleton */}
      <div className="flex gap-3 px-6 pb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 flex-1" />
        ))}
      </div>

      {/* Nav items skeleton */}
      <div className="space-y-1 px-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
