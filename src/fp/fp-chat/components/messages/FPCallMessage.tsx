import React from "react";
import { Video } from "lucide-react";

interface FPCallMessageProps {
  callType?: "video" | "audio";
  callDurationSeconds?: number | null;
}

export default function FPCallMessage({
  callType,
  callDurationSeconds,
}: FPCallMessageProps): React.JSX.Element | null {
  const formatDuration = (seconds: number): string => {
    if (seconds == null) return "";
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <Video
        size={18}
        style={{
          color: "#2563eb",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontWeight: 600,
          color: "var(--text)",
        }}
      >
        {callType === "video" ? "Video call" : "Audio call"}
      </span>
      {callDurationSeconds != null && (
        <span
          style={{
            fontSize: "0.8rem",
            color: "#6b7280",
            marginLeft: "0.25rem",
          }}
        >
          {formatDuration(callDurationSeconds)}
        </span>
      )}
    </div>
  );
}
