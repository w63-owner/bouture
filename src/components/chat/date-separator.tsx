interface DateSeparatorProps {
  date: string;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor(
    (today.getTime() - msgDay.getTime()) / 86_400_000,
  );

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
  });
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 border-t border-neutral-200" />
      <span className="text-xs text-neutral-600 font-medium">
        {formatDateLabel(date)}
      </span>
      <div className="flex-1 border-t border-neutral-200" />
    </div>
  );
}
