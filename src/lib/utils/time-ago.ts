export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffD === 1) return "Hier";
  if (diffD < 30) return `Il y a ${diffD} jours`;
  const diffM = Math.floor(diffD / 30);
  if (diffM < 12) return `Il y a ${diffM} mois`;
  return `Il y a ${Math.floor(diffM / 12)} an${Math.floor(diffM / 12) > 1 ? "s" : ""}`;
}
