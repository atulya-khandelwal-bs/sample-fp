import { RefObject } from "react";
import FPImageMessageView from "./messages/FPImageMessageView";
import FPAudioMessageView from "./messages/FPAudioMessageView";
import FPFileMessageView from "./messages/FPFileMessageView";
import FPProductMessageView from "./messages/FPProductMessageView";
import FPCallMessage from "./messages/FPCallMessage";
import FPTextMessageView from "./messages/FPTextMessageView";
import { Message, Contact } from "../../common/types/chat";
import React from "react";

interface FPMessageBubbleProps {
  msg: Message;
  selectedContact: Contact | null;
  userId: string;
  openImageViewer: (url: string, alt?: string) => void;
  currentlyPlayingAudioRef: RefObject<HTMLAudioElement | null>;
  formatCurrency: (amount: number) => string;
}

export default function FPMessageBubble({
  msg,
  selectedContact,
  userId,
  openImageViewer,
  currentlyPlayingAudioRef,
  formatCurrency,
}: FPMessageBubbleProps): React.JSX.Element {
  const renderMessageContent = (): React.JSX.Element => {
    if (msg.messageType === "image" && (msg.imageData || msg.imageUrl)) {
      return (
        <FPImageMessageView
          imageUrl={msg.imageData || msg.imageUrl || ""}
          fileName={msg.fileName}
          openImageViewer={openImageViewer}
        />
      );
    }

    if (msg.messageType === "audio" && msg.audioUrl) {
      return (
        <FPAudioMessageView
          audioUrl={msg.audioUrl}
          audioTranscription={msg.audioTranscription}
          currentlyPlayingAudioRef={currentlyPlayingAudioRef}
        />
      );
    }

    if (msg.messageType === "file" && (msg.fileUrl || msg.fileName)) {
      return (
        <FPFileMessageView
          fileUrl={msg.fileUrl}
          fileName={msg.fileName}
          fileMime={msg.fileMime}
          fileSizeBytes={msg.fileSizeBytes}
          fileSize={msg.fileSize}
        />
      );
    }

    if (msg.messageType === "products" && Array.isArray(msg.products)) {
      return (
        <FPProductMessageView
          products={msg.products}
          formatCurrency={formatCurrency}
        />
      );
    }

    if (msg.messageType === "recommended_products" && msg.recommendedProducts) {
      return (
        <FPProductMessageView
          recommendedProducts={msg.recommendedProducts}
          formatCurrency={formatCurrency}
        />
      );
    }

    if (msg.messageType === "call") {
      return (
        <FPCallMessage
          callType={msg.callType as "video" | "audio" | undefined}
          callDurationSeconds={msg.callDurationSeconds}
        />
      );
    }

    // Fallback: try to parse JSON content for media
    try {
      if (
        typeof msg.content === "string" &&
        msg.content.trim().startsWith("{")
      ) {
        const obj = JSON.parse(msg.content) as {
          type?: string;
          url?: string;
          fileName?: string;
          mimeType?: string;
          size?: number;
          callType?: string;
          duration?: number;
        };
        if (obj && typeof obj === "object" && obj.type) {
          const t = String(obj.type).toLowerCase();
          if (t === "image" && obj.url) {
            return (
              <FPImageMessageView
                imageUrl={obj.url}
                fileName={obj.fileName}
                openImageViewer={openImageViewer}
              />
            );
          }
          if (t === "file" && obj.url) {
            return (
              <FPFileMessageView
                fileUrl={obj.url}
                fileName={obj.fileName}
                fileMime={obj.mimeType}
                fileSizeBytes={obj.size}
              />
            );
          }
          if (t === "call") {
            return (
              <FPCallMessage
                callType={obj.callType as "video" | "audio" | undefined}
                callDurationSeconds={obj.duration}
              />
            );
          }
        }
      }
    } catch {
      // Ignore parse errors
    }

    // Default: render as text
    return <FPTextMessageView content={msg.content} />;
  };

  return (
    <div
      className={`message-wrapper ${msg.isIncoming ? "incoming" : "outgoing"}`}
    >
      {/* Avatar before message for incoming */}
      {msg.isIncoming && (
        <div className="message-avatar">
          <img src={msg.avatar || ""} alt={msg.sender} />
        </div>
      )}
      <div className="message-content">
        {msg.label && !msg.isIncoming && (
          <div className="message-label">{msg.label}</div>
        )}
        <div className="message-bubble">
          <div className="message-sender-name">
            {msg.isIncoming
              ? selectedContact?.name || msg.sender
              : msg.sender || userId}
          </div>
          {renderMessageContent()}
        </div>
        <div className="message-time">{msg.timestamp}</div>
      </div>
      {/* Avatar after message for outgoing */}
      {!msg.isIncoming && (
        <div className="message-avatar">
          <img src={msg.avatar || ""} alt={msg.sender} />
        </div>
      )}
    </div>
  );
}
