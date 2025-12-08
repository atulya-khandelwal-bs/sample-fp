import config from "../../common/config.ts";
import {
  Contact,
  Message,
  CoachInfo,
  SystemMessageData,
  Product,
  RecommendedProductsPayload,
  CoachAssignedPayload,
  CoachDetailsPayload,
} from "../../common/types/chat";

interface AgoraMessage {
  id?: string;
  from?: string;
  to?: string;
  time?: number;
  type?: string;
  msg?: string;
  msgContent?: string;
  data?: string;
  body?: string | object;
  customExts?: object;
  "v2:customExts"?: object;
  ext?: {
    type?: string;
    url?: string;
    fileName?: string;
    mimeType?: string;
    size?: number | string;
    duration?: number | string;
    transcription?: string;
    data?: string | object;
    [key: string]: unknown;
  };
  sender_photo?: string;
  createdAt?: number | Date;
  chat_type?: string;
  conversation_id?: string;
  message_id?: string;
  from_user?: string;
  to_user?: string;
  sender_name?: string;
  message_type?: string;
  created_at?: string | number;
  created_at_ms?: number;
  [key: string]: unknown;
}

interface CustomMessageData {
  type?: string;
  url?: string;
  fileName?: string;
  mimeType?: string;
  size?: number | string;
  duration?: number | string;
  transcription?: string;
  products?: Product[] | string;
  callType?: string;
  channel?: string;
  action?: string;
  id?: string;
  name?: string;
  title?: string;
  profilePhoto?: string;
  [key: string]: unknown;
}

interface ApiMessage {
  message_id?: string;
  conversation_id?: string;
  from_user?: string;
  to_user?: string;
  sender_name?: string;
  sender_photo?: string;
  message_type?: string;
  body?: string | object;
  created_at?: string | number;
  created_at_ms?: number;
  chat_type?: string;
}

interface SystemPayload {
  kind: "meal_plan_updated";
  payload: {
    type?: string;
    id?: string;
    name?: string;
    title?: string;
    profilePhoto?: string;
    [key: string]: unknown;
  };
}

// Helper function to extract custom message data from Agora Chat message
export const extractCustomMessageData = (
  msg: AgoraMessage
): CustomMessageData | null => {
  let paramsData = null;

  // Try customExts at top level
  if (msg.customExts && typeof msg.customExts === "object") {
    paramsData = msg.customExts;
  }
  // Try v2:customExts at top level
  else if (msg["v2:customExts"] && typeof msg["v2:customExts"] === "object") {
    paramsData = msg["v2:customExts"];
  }
  // Try body.customExts
  else if (msg.body && typeof msg.body === "object") {
    const bodyObj = msg.body as {
      customExts?: object;
      "v2:customExts"?: object;
    };
    if (bodyObj.customExts) {
      paramsData = bodyObj.customExts;
    }
    // Try body.v2:customExts
    else if (bodyObj["v2:customExts"]) {
      paramsData = bodyObj["v2:customExts"];
    }
  }
  // Try ext properties directly
  else if (msg.ext && typeof msg.ext === "object") {
    if (
      msg.ext.type &&
      (msg.ext.type === "image" ||
        msg.ext.type === "file" ||
        msg.ext.type === "audio")
    ) {
      paramsData = {
        type: msg.ext.type,
        url: msg.ext.url,
        fileName: msg.ext.fileName,
        mimeType: msg.ext.mimeType,
        size: msg.ext.size,
        duration: msg.ext.duration,
        transcription: msg.ext.transcription,
      };
    } else if (msg.ext.data) {
      try {
        paramsData =
          typeof msg.ext.data === "string"
            ? JSON.parse(msg.ext.data)
            : msg.ext.data;
      } catch {}
    }
  }

  return paramsData as CustomMessageData | null;
};

// Helper function to parse system payload
export const parseSystemPayload = (
  rawContent: string
): SystemPayload | null => {
  try {
    const obj = JSON.parse(rawContent);
    if (!obj || typeof obj !== "object" || !obj.type) return null;
    const normalizedType = String(obj.type).toLowerCase();
    if (
      normalizedType === "meal_plan_updated" ||
      normalizedType === "mealplanupdated" ||
      normalizedType === "meal_plan_update"
    ) {
      return { kind: "meal_plan_updated", payload: obj };
    }
    return null;
  } catch {
    return null;
  }
};

// Helper: label text for system payload cards
export const getSystemLabel = (
  system: SystemMessageData | null | undefined
): string => {
  if (!system) return "";
  switch (system.kind) {
    case "meal_plan_updated":
      return "Meal plan updated";
    default:
      return "System message";
  }
};

// Helper function to format a message from Agora Chat SDK
export const formatMessage = (
  msg: AgoraMessage | ApiMessage | string | null | undefined,
  userId: string,
  peerId: string,
  selectedContact: Contact | null,
  coachInfo: CoachInfo
): Message | null => {
  // Check if this is a backend API message format (has keys like body, chat_type, conversation_id, etc.)
  if (
    msg &&
    typeof msg === "object" &&
    !("id" in msg && msg.id) &&
    !("from" in msg && msg.from) &&
    !("time" in msg && msg.time) &&
    (("body" in msg && msg.body !== undefined) ||
      ("chat_type" in msg && msg.chat_type !== undefined) ||
      ("conversation_id" in msg && msg.conversation_id !== undefined) ||
      ("message_id" in msg && msg.message_id !== undefined))
  ) {
    // This is a backend API message format - convert it to Agora format
    const backendMsg = msg as ApiMessage;
    // Ensure body is a string
    let bodyContent = backendMsg.body || "";
    if (typeof bodyContent !== "string") {
      if (bodyContent && typeof bodyContent === "object") {
        bodyContent = JSON.stringify(bodyContent);
      } else {
        bodyContent = String(bodyContent);
      }
    }
    const agoraMsg: AgoraMessage = {
      id: backendMsg.message_id || `backend-${Date.now()}-${Math.random()}`,
      from: backendMsg.from_user || backendMsg.sender_name || userId,
      to: backendMsg.to_user || peerId,
      time:
        typeof backendMsg.created_at_ms === "number"
          ? backendMsg.created_at_ms
          : typeof backendMsg.created_at === "number"
          ? backendMsg.created_at
          : typeof backendMsg.created_at === "string"
          ? new Date(backendMsg.created_at).getTime()
          : Date.now(),
      type: backendMsg.message_type === "text" ? "txt" : "custom",
      msg: bodyContent,
      msgContent: bodyContent,
      data: bodyContent,
    };
    msg = agoraMsg;
  }

  // Ensure msg has required properties
  if (!msg || typeof msg !== "object" || typeof msg === "string") {
    console.warn("Invalid message format:", msg);
    return {
      id: `invalid-${Date.now()}`,
      sender: "Unknown",
      content: typeof msg === "string" ? msg : JSON.stringify(msg || {}),
      createdAt: new Date(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isIncoming: true,
      peerId,
      avatar: config.defaults.avatar,
      messageType: "text",
    };
  }

  // At this point, msg should be AgoraMessage (converted from ApiMessage if needed)
  const agoraMsg = msg as AgoraMessage;

  // Determine avatar: use sender_photo from API if available, otherwise use defaults
  let messageAvatar: string | null = null;
  if (agoraMsg.sender_photo) {
    // Use sender_photo from API message (for both incoming and outgoing)
    messageAvatar = agoraMsg.sender_photo;
  } else if (agoraMsg.from === userId) {
    // Outgoing message from current user - use coach's profile photo
    messageAvatar = coachInfo?.profilePhoto || config.defaults.userAvatar;
  } else {
    // Incoming message - use selectedContact avatar or default
    messageAvatar = selectedContact?.avatar || config.defaults.avatar;
  }

  const baseMessage = {
    id: agoraMsg.id || `msg-${Date.now()}-${Math.random()}`,
    sender: agoraMsg.from === userId ? "You" : agoraMsg.from || "Unknown",
    createdAt: new Date(agoraMsg.time || agoraMsg.createdAt || Date.now()),
    timestamp: new Date(
      agoraMsg.time || agoraMsg.createdAt || Date.now()
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isIncoming: agoraMsg.from !== userId,
    peerId,
    avatar: messageAvatar,
  };

  // Handle custom messages
  if (agoraMsg.type === "custom") {
    const customData = extractCustomMessageData(agoraMsg);

    if (customData && customData.type) {
      const type = String(customData.type).toLowerCase();

      // Filter out unwanted message types (healthCoachChanged, mealPlanUpdate)
      if (
        type === "healthcoachchanged" ||
        type === "mealplanupdate" ||
        type === "healthcoachchangedate" ||
        type === "mealplanupdate" ||
        type === "healthCoachChanged" ||
        type === "mealPlanUpdate"
      ) {
        return null; // Don't show these messages on UI
      }

      const content = JSON.stringify(customData);

      if (type === "image") {
        return {
          ...baseMessage,
          content,
          messageType: "image",
          imageUrl: customData.url || "",
          fileName: customData.fileName,
        };
      } else if (type === "audio") {
        // Convert duration to milliseconds if it appears to be in seconds (< 3600)
        let durationMs: number | string | undefined = customData.duration;
        if (typeof durationMs === "number" && durationMs < 3600) {
          durationMs = durationMs * 1000; // Convert seconds to milliseconds
        }
        return {
          ...baseMessage,
          content,
          messageType: "audio",
          audioUrl: customData.url || "",
          audioDurationMs:
            typeof durationMs === "number"
              ? durationMs
              : typeof durationMs === "string"
              ? parseFloat(durationMs) * 1000
              : undefined,
          audioTranscription: customData.transcription,
          fileName: customData.fileName,
        };
      } else if (type === "file") {
        return {
          ...baseMessage,
          content,
          messageType: "file",
          fileUrl: customData.url || "",
          fileName: customData.fileName,
          fileMime: customData.mimeType,
          fileSizeBytes:
            typeof customData.size === "number"
              ? customData.size
              : typeof customData.size === "string"
              ? parseInt(customData.size, 10)
              : undefined,
        };
      } else if (type === "call") {
        // Only show call messages in chat if:
        // It's an end action with duration > 0 (both users connected)
        // Hide initiate messages - they will only appear after call ends with both users
        // If only nutritionist or only client was in call, do NOT show the message
        if (customData.action === "initiate") {
          // Don't show initiate messages immediately
          return null;
        }
        const duration =
          typeof customData.duration === "number"
            ? customData.duration
            : typeof customData.duration === "string"
            ? parseFloat(customData.duration)
            : 0;
        if (
          customData.action === "end" &&
          (!customData.duration || duration <= 0)
        ) {
          // Don't show call end message if no duration or duration <= 0
          // This means only one user (nutritionist or client) was in the call
          return null;
        }

        return {
          ...baseMessage,
          content,
          messageType: "call",
          callType: customData.callType || "video",
          channel: customData.channel,
          callAction: customData.action,
          callDurationSeconds:
            typeof customData.duration === "number"
              ? customData.duration
              : typeof customData.duration === "string"
              ? parseFloat(customData.duration)
              : undefined,
        };
      } else if (type === "products") {
        // Handle case where products might be a stringified JSON string
        let productsArray: Product[] = [];
        if (Array.isArray(customData.products)) {
          productsArray = customData.products as Product[];
        } else if (typeof customData.products === "string") {
          try {
            const parsed = JSON.parse(customData.products);
            productsArray = Array.isArray(parsed) ? (parsed as Product[]) : [];
          } catch {
            productsArray = [];
          }
        }

        // Filter out products messages with 0 products
        if (productsArray.length === 0) {
          return null; // Don't show products messages with no products
        }

        return {
          ...baseMessage,
          content,
          messageType: "products",
          products: productsArray,
        };
      } else if (type === "meal_plan_updated") {
        return {
          ...baseMessage,
          content: "Meal plan updated",
          messageType: "system",
          system: { kind: "meal_plan_updated" },
        };
      } else if (type === "system") {
        // Handle system messages with action_type (including recommended_products)
        const systemData = customData as {
          action_type?: string;
          title?: string;
          description?: string;
          product_list?: unknown[];
          [key: string]: unknown;
        };

        if (systemData.action_type === "recommended_products") {
          const recommendedProductsPayload: RecommendedProductsPayload = {
            action_type: "recommended_products",
            title: systemData.title,
            description: systemData.description,
            product_list: Array.isArray(systemData.product_list)
              ? (systemData.product_list as RecommendedProductsPayload["product_list"])
              : [],
          };

          return {
            ...baseMessage,
            content,
            messageType: "recommended_products",
            recommendedProducts: recommendedProductsPayload,
          };
        }
      }
    }

    // Fallback for custom messages without valid data
    let fallbackContent =
      agoraMsg.msg || agoraMsg.msgContent || agoraMsg.data || "";
    // Ensure content is always a string
    if (typeof fallbackContent !== "string") {
      if (fallbackContent && typeof fallbackContent === "object") {
        // If it's an object, try to extract body or stringify it
        const contentObj = fallbackContent as { body?: string };
        fallbackContent = contentObj.body || JSON.stringify(fallbackContent);
      } else {
        fallbackContent = String(fallbackContent);
      }
    }
    return {
      ...baseMessage,
      content: fallbackContent,
      messageType: "custom",
    };
  }

  // Handle text messages - check if it's JSON with a type field
  let textContent = agoraMsg.msg || agoraMsg.msgContent || agoraMsg.data || "";
  // Ensure textContent is always a string
  if (typeof textContent !== "string") {
    if (textContent && typeof textContent === "object") {
      // If it's an object, try to extract body or stringify it
      const contentObj = textContent as { body?: string };
      textContent = contentObj.body || JSON.stringify(textContent);
    } else {
      textContent = String(textContent);
    }
  }
  try {
    const parsed = JSON.parse(textContent);

    // Handle new recommended_products format (array with action_type)
    if (Array.isArray(parsed) && parsed.length > 0) {
      const firstItem = parsed[0];
      if (
        firstItem &&
        typeof firstItem === "object" &&
        firstItem.action_type === "recommended_products"
      ) {
        const recommendedProductsPayload: RecommendedProductsPayload = {
          action_type: "recommended_products",
          title: firstItem.title,
          description: firstItem.description,
          product_list: Array.isArray(firstItem.product_list)
            ? firstItem.product_list
            : [],
        };

        return {
          ...baseMessage,
          content: textContent,
          messageType: "recommended_products",
          recommendedProducts: recommendedProductsPayload,
        };
      }

      // Handle coach_assigned format
      if (
        firstItem &&
        typeof firstItem === "object" &&
        firstItem.action_type === "coach_assigned"
      ) {
        const coachAssignedPayload: CoachAssignedPayload = {
          action_type: "coach_assigned",
          title: firstItem.title,
          description: firstItem.description,
          icons_details: firstItem.icons_details,
          redirection_details: firstItem.redirection_details,
        };

        return {
          ...baseMessage,
          content: textContent,
          messageType: "system",
          system: {
            action_type: "coach_assigned",
            title: coachAssignedPayload.title,
            description: coachAssignedPayload.description,
            icons_details: coachAssignedPayload.icons_details,
            redirection_details: coachAssignedPayload.redirection_details,
          } as SystemMessageData,
        };
      }

      // Handle coach_details format
      if (
        firstItem &&
        typeof firstItem === "object" &&
        firstItem.action_type === "coach_details"
      ) {
        const coachDetailsPayload: CoachDetailsPayload = {
          action_type: "coach_details",
          title: firstItem.title,
          description: firstItem.description,
          icons_details: firstItem.icons_details,
          redirection_details: firstItem.redirection_details,
        };

        return {
          ...baseMessage,
          content: textContent,
          messageType: "system",
          system: {
            action_type: "coach_details",
            title: coachDetailsPayload.title,
            description: coachDetailsPayload.description,
            icons_details: coachDetailsPayload.icons_details,
            redirection_details: coachDetailsPayload.redirection_details,
          } as SystemMessageData,
        };
      }
    }

    if (parsed && typeof parsed === "object" && parsed.type) {
      const type = String(parsed.type).toLowerCase();
      if (type === "products") {
        // Handle case where products might be a stringified JSON string
        let productsArray: Product[] = [];
        if (Array.isArray(parsed.products)) {
          productsArray = parsed.products as Product[];
        } else if (typeof parsed.products === "string") {
          try {
            const parsedProducts = JSON.parse(parsed.products);
            productsArray = Array.isArray(parsedProducts)
              ? (parsedProducts as Product[])
              : [];
          } catch {
            productsArray = [];
          }
        }

        // Filter out products messages with 0 products
        if (productsArray.length === 0) {
          return null; // Don't show products messages with no products
        }

        return {
          ...baseMessage,
          content: textContent,
          messageType: "products",
          products: productsArray,
        };
      }

      // Filter out unwanted message types (healthCoachChanged, mealPlanUpdate)
      if (
        type === "healthcoachchanged" ||
        type === "mealplanupdate" ||
        type === "mealplanupdated" ||
        type === "healthCoachChanged" ||
        type === "mealPlanUpdate"
      ) {
        return null; // Don't show these messages on UI
      }

      if (type === "products") {
        return {
          ...baseMessage,
          content: textContent,
          messageType: "products",
          products: Array.isArray(parsed.products)
            ? (parsed.products as Product[])
            : [],
        };
      } else if (type === "meal_plan_updated") {
        return {
          ...baseMessage,
          content: "Meal plan updated",
          messageType: "system",
          system: { kind: "meal_plan_updated" },
        };
      }
    }
  } catch {
    // Not JSON, treat as regular text
  }

  // Regular text message
  return {
    ...baseMessage,
    content: textContent,
    messageType: "text",
  };
};

// Helper function to convert API message format to formatMessage format
export const convertApiMessageToFormat = (
  apiMsg: ApiMessage
): AgoraMessage | null => {
  // Convert API response message to format expected by formatMessage
  // The API returns: { message_id, conversation_id, from_user, to_user, sender_name, sender_photo, message_type, body, created_at, created_at_ms }
  // formatMessage expects: { id, from, to, time, type, msg, msgContent, data, body, chat_type, conversation_id, message_id, ... }

  // Check if body has a type field to determine if it's a custom message
  let bodyObj: string | object | null | undefined = apiMsg.body;

  // Handle case where body is a string (parse it first)
  if (typeof bodyObj === "string") {
    try {
      bodyObj = JSON.parse(bodyObj);
    } catch {
      // If parsing fails, treat as plain text
      bodyObj = bodyObj;
    }
  }

  // 🟢 FIX: Handle nested payloads such as {"data":"{...}","type":"mealPlanUpdate"}
  if (bodyObj && typeof bodyObj === "object") {
    const bodyObjTyped = bodyObj as {
      data?: string;
      type?: string;
      products?: Product[] | string;
    };
    if (bodyObjTyped.data && typeof bodyObjTyped.data === "string") {
      try {
        const nested = JSON.parse(bodyObjTyped.data);
        if (nested && typeof nested === "object") {
          // Use the nested object, but preserve the outer type if nested doesn't have one
          bodyObj = {
            ...nested,
            type: (nested as { type?: string }).type || bodyObjTyped.type, // Prefer nested type, fallback to outer type
          };
        }
      } catch {
        // If parsing fails, keep bodyObj as is
      }
    }
  }

  // Filter out unwanted message types (healthCoachChanged, mealPlanUpdate)
  if (bodyObj && typeof bodyObj === "object") {
    const bodyObjTyped = bodyObj as { type?: string };
    if (bodyObjTyped.type) {
      const type = String(bodyObjTyped.type).toLowerCase();
      if (
        type === "healthcoachchanged" ||
        type === "mealplanupdate" ||
        type === "mealplanupdated" ||
        type === "healthCoachChanged" ||
        type === "mealPlanUpdate"
      ) {
        // Return null to filter out these messages - they should not appear on UI
        return null;
      }
    }
  }

  // 🟢 NORMALIZE products messages: Convert stringified products to array format
  // This ensures both formats (array and stringified) become the same before formatMessage
  if (bodyObj && typeof bodyObj === "object") {
    const bodyObjTyped = bodyObj as {
      type?: string;
      products?: Product[] | string;
    };
    if (bodyObjTyped.type === "products" && bodyObjTyped.products) {
      if (typeof bodyObjTyped.products === "string") {
        try {
          const parsed = JSON.parse(bodyObjTyped.products);
          if (Array.isArray(parsed)) {
            (bodyObj as { products?: Product[] | string }).products = parsed; // Replace string with array
          }
        } catch {
          // If parsing fails, keep as is
        }
      }
    }
  }

  const bodyObjTyped =
    bodyObj && typeof bodyObj === "object"
      ? (bodyObj as { type?: string; message?: string })
      : null;
  const isTextMessage = bodyObjTyped && bodyObjTyped.type === "text";
  const isCustomMessage =
    bodyObjTyped && bodyObjTyped.type && bodyObjTyped.type !== "text";

  // Convert body object to string if it's an object
  let bodyContent: string;
  if (bodyObj && typeof bodyObj === "object") {
    // For text messages, extract just the message field
    if (isTextMessage && bodyObjTyped?.message !== undefined) {
      bodyContent = String(bodyObjTyped.message);
    } else {
      // For custom messages, stringify the entire object
      bodyContent = JSON.stringify(bodyObj);
    }
  } else if (bodyObj === null || bodyObj === undefined) {
    bodyContent = "";
  } else {
    bodyContent = String(bodyObj);
  }

  const apiMessageId =
    apiMsg.message_id || `api-${Date.now()}-${Math.random()}`;

  return {
    id: apiMessageId,
    from: String(apiMsg.from_user || ""),
    to: String(apiMsg.to_user || ""),
    time:
      apiMsg.created_at_ms ||
      new Date(apiMsg.created_at || Date.now()).getTime(),
    // Determine type: if body has a type field and it's not "text", treat as custom
    type: isCustomMessage ? "custom" : "txt",
    msg: bodyContent,
    msgContent: bodyContent,
    data: bodyContent,
    // Include backend API fields for formatMessage to detect backend format
    body: bodyContent,
    chat_type: apiMsg.chat_type,
    conversation_id: apiMsg.conversation_id,
    message_id: apiMsg.message_id,
    from_user: apiMsg.from_user,
    to_user: apiMsg.to_user,
    sender_name: apiMsg.sender_name,
    sender_photo: apiMsg.sender_photo,
    message_type: apiMsg.message_type,
    created_at: apiMsg.created_at,
    created_at_ms: apiMsg.created_at_ms,
    // For custom messages, also include the body object in ext.data so extractCustomMessageData can find it
    ...(isCustomMessage && bodyObj ? { ext: { data: bodyObj } } : {}),
  };
};
