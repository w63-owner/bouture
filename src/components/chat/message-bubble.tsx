import { MessageStatus } from "./message-status";
import { PhotoMessage } from "./photo-message";
import type { Database } from "@/lib/types/database.types";

type MessageType = Database["public"]["Enums"]["message_type"];
type Status = Database["public"]["Enums"]["message_status"];

interface MessageBubbleProps {
  content: string | null;
  type: MessageType;
  imageUrl: string | null;
  isMine: boolean;
  timestamp: string;
  status: Status;
}

export function MessageBubble({
  content,
  type,
  imageUrl,
  isMine,
  timestamp,
  status,
}: MessageBubbleProps) {
  const time = new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isImage = type === "image" && imageUrl;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl ${
          isImage ? "p-1" : "px-3.5 py-2.5"
        } ${
          isMine
            ? "bg-primary text-white rounded-br-md"
            : "bg-neutral-100 text-neutral-900 rounded-bl-md"
        }`}
      >
        {isImage ? (
          <PhotoMessage imageUrl={imageUrl} isMine={isMine} />
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
        )}

        <div
          className={`flex items-center gap-1 ${
            isImage ? "px-2.5 pb-1.5 pt-1" : "mt-1"
          } ${isMine ? "justify-end" : ""}`}
        >
          <span
            className={`text-[10px] ${
              isMine ? "text-white/70" : "text-neutral-600"
            }`}
          >
            {time}
          </span>
          {isMine && <MessageStatus status={status} />}
        </div>
      </div>
    </div>
  );
}
