import React from "react";
interface FPFileMessageViewProps {
  fileUrl?: string;
  fileName?: string;
  fileMime?: string;
  fileSizeBytes?: number;
  fileSize?: string;
}

export default function FPFileMessageView({
  fileUrl,
  fileName,
  fileMime,
  fileSizeBytes,
  fileSize,
}: FPFileMessageViewProps): React.JSX.Element {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr 28px",
        gap: 10,
        alignItems: "center",
        maxWidth: 380,
      }}
    >
      <div
        aria-hidden
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: "#fee2e2", // light red
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#b91c1c",
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        {fileMime && fileMime.includes("pdf") ? "PDF" : "FILE"}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            color: "#0f172a",
          }}
        >
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#2563eb" }}
              download={fileName || undefined}
            >
              {fileName || fileUrl}
            </a>
          ) : (
            fileName
          )}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          {(fileMime || "file").toUpperCase()}
          {fileSizeBytes != null
            ? ` • ${Math.round(fileSizeBytes / 1024)} KB`
            : fileSize
            ? ` • ${fileSize} KB`
            : ""}
        </div>
      </div>
      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            background: "#064e3b",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
          }}
          title="Download"
          download={fileName || undefined}
        >
          ⬇
        </a>
      )}
    </div>
  );
}
