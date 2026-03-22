import { Skeleton } from "@/components/ui/skeleton";

export default function GlobalLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <Skeleton className="h-12 w-12 !rounded-full" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
