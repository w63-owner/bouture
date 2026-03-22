import { Check, CheckCheck, Loader2 } from "lucide-react";
import type { Database } from "@/lib/types/database.types";

type Status = Database["public"]["Enums"]["message_status"];

export function MessageStatus({ status }: { status: Status }) {
  switch (status) {
    case "sending":
      return <Loader2 className="h-3 w-3 animate-spin text-white/50" />;
    case "sent":
      return <Check className="h-3 w-3 text-white/60" />;
    case "delivered":
      return <CheckCheck className="h-3 w-3 text-white/60" />;
    case "read":
      return <CheckCheck className="h-3 w-3 text-sky-200" />;
  }
}
