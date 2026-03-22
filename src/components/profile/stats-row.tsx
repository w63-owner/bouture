import { Card } from "@/components/ui/card";

interface StatItem {
  label: string;
  value: number;
}

interface StatsRowProps {
  stats: StatItem[];
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-3 px-5">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex flex-col items-center gap-1 py-4 px-2">
          <span className="text-2xl font-display font-bold text-primary">
            {stat.value}
          </span>
          <span className="text-center text-xs text-neutral-600 leading-tight">
            {stat.label}
          </span>
        </Card>
      ))}
    </div>
  );
}
