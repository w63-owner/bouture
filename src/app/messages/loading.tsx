import { Skeleton } from "@/components/ui/skeleton";

function ConversationRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <Skeleton className="h-12 w-12 shrink-0 !rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-3 w-10 shrink-0" />
    </div>
  );
}

export default function MessagesLoading() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <header className="border-b border-neutral-100 px-5 py-4">
        <Skeleton className="h-6 w-24" />
      </header>

      <div className="divide-y divide-neutral-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <ConversationRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
