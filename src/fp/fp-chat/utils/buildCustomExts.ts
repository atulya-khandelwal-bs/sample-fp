/**
 * Helper function to build customExts based on message payload
 * Used when sending custom messages (images, files, audio, etc.)
 */

interface ImagePayload {
  type: "image";
  url: string;
  height?: number;
  width?: number;
}

interface AudioPayload {
  type: "audio";
  url: string;
  duration?: number;
  transcription?: string;
}

interface FilePayload {
  type: "file";
  url: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
}

interface MealPlanPayload {
  type: "meal_plan_updated";
}

interface ProductsPayload {
  type: "products";
  products?: unknown[];
}

interface CallPayload {
  type: "call";
  callType?: "video" | "audio" | "voice";
  channel?: string;
  from?: string;
  to?: string;
  action?: "initiate" | "accept" | "reject" | "end";
  duration?: number | string;
}

interface SystemPayload {
  type: "system";
  action_type?: string;
  title?: string;
  description?: string;
  product_list?: unknown[];
  [key: string]: unknown;
}

type MessagePayload =
  | ImagePayload
  | AudioPayload
  | FilePayload
  | MealPlanPayload
  | ProductsPayload
  | CallPayload
  | SystemPayload
  | { type: string; [key: string]: unknown };

interface CustomExts {
  type: string;
  [key: string]: string | unknown[] | undefined;
}

export function buildCustomExts(
  payload: MessagePayload | null | undefined
): CustomExts | null {
  if (!payload || typeof payload !== "object" || !payload.type) {
    return null;
  }

  const type = String(payload.type).toLowerCase();

  switch (type) {
    case "image": {
      const imagePayload = payload as ImagePayload;
      console.log("payload", imagePayload);
      console.log("payload.height", typeof imagePayload.height);
      console.log("payload.width", typeof imagePayload.width);
      return {
        type: "image",
        url: imagePayload.url,
        height: (imagePayload.height ?? 720).toString(),
        width: (imagePayload.width ?? 1280).toString(),
      };
    }

    case "audio": {
      const audioPayload = payload as AudioPayload;
      // Convert duration to milliseconds if it appears to be in seconds (< 3600)
      let durationMs = audioPayload.duration;
      if (typeof durationMs === "number" && durationMs < 3600) {
        durationMs = durationMs * 1000; // Convert seconds to milliseconds
      }
      return {
        type: "audio",
        url: audioPayload.url,
        transcription: audioPayload.transcription || "",
        duration:
          typeof durationMs === "number" ? (durationMs / 1000).toString() : "0", // in milliseconds, default to 0 if not provided
      };
    }

    case "file": {
      const filePayload = payload as FilePayload;
      return {
        type: "file",
        url: filePayload.url,
        fileName: filePayload.fileName || "",
        mimeType: filePayload.mimeType || "application/octet-stream",
        size:
          typeof filePayload.size === "number"
            ? filePayload.size.toString()
            : "0", // in bytes
      };
    }

    case "meal_plan_updated":
      return {
        type: "meal_plan_updated",
      };

    case "products": {
      const productsPayload = payload as ProductsPayload;
      return {
        type: "products",
        products: Array.isArray(productsPayload.products)
          ? productsPayload.products
          : [],
      };
    }

    case "call": {
      const callPayload = payload as CallPayload;
      // Ensure duration is always included as a number
      const callDuration =
        callPayload.duration !== undefined && callPayload.duration !== null
          ? Number(callPayload.duration)
          : 0;

      const callExts: CustomExts = {
        type: "call",
        callType: callPayload.callType || "video", // "voice" or "video"
        channel: callPayload.channel || "",
        from: callPayload.from || "",
        to: callPayload.to || "",
        action: callPayload.action || "initiate", // "initiate", "accept", "reject", "end"
        duration: callDuration.toString(), // in seconds (0 for initiate, actual duration when call ends)
      };

      // Log for debugging call end messages
      if (callPayload.action === "end") {
        console.log("📞 buildCustomExts - Call end message:", {
          originalPayload: callPayload,
          builtExts: callExts,
          durationValue: callDuration,
          durationType: typeof callDuration,
        });
      }

      return callExts;
    }

    case "system": {
      const systemPayload = payload as SystemPayload;
      const systemExts: CustomExts = {
        type: "system",
        action_type: systemPayload.action_type || "",
        title: systemPayload.title || "",
        description: systemPayload.description || "",
        product_list: Array.isArray(systemPayload.product_list)
          ? systemPayload.product_list
          : [],
      };
      return systemExts;
    }

    default:
      // For unknown types, return the payload as-is
      return payload as CustomExts;
  }
}
