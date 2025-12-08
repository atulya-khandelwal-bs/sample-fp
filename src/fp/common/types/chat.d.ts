// Chat-related type definitions

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastSeen?: string;
  lastMessage?: string | object;
  timestamp?: Date | null;
  lastMessageFrom?: string | null;
  conversationId?: string;
  messageCount?: number;
  unreadCount?: number;
  filterState?: string;
  description?: string;
  replyCount?: number;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isIncoming: boolean;
  messageType?: string;
  imageUrl?: string;
  imageData?: string;
  audioUrl?: string;
  audioDurationMs?: number;
  fileUrl?: string;
  fileName?: string;
  fileMime?: string;
  fileSizeBytes?: number;
  fileSize?: string;
  products?: Product[];
  recommendedProducts?: RecommendedProductsPayload;
  callType?: string;
  callDurationSeconds?: number | undefined;
  audioTranscription?: string;
  label?: string;
  avatar?: string;
  system?: SystemMessageData;
  createdAt?: string | Date;
  peerId?: string;
  callAction?: string;
  channel?: string;
}

export interface Product {
  id: string;
  title: string;
  name?: string;
  photoUrl: string;
  price: number;
  discountedPrice: number;
  description: string;
}

// New product format for recommended_products action_type
export interface RecommendedProduct {
  title?: string;
  description?: string;
  actual_amount?: number;
  selling_amount?: number;
  image_url?: string;
  action_id?: string;
  redirection_url?: string; // Also support correct spelling
  cta_details?: {
    text?: string;
    text_color?: string;
    bg_color?: string;
  };
}

// System message payload for recommended_products
export interface RecommendedProductsPayload {
  action_type: "recommended_products";
  title?: string;
  description?: string;
  product_list?: RecommendedProduct[];
}

// Icons details for coach messages
export interface IconsDetails {
  left_icon?: string;
  right_icon?: string;
}

// Redirection details for coach messages
export interface RedirectionDetail {
  cta_details?: {
    text?: string;
    text_color?: string;
    bg_color?: string;
  };
  redirect_url?: string;
  action_id?: string;
}

// Coach assigned message payload
export interface CoachAssignedPayload {
  action_type: "coach_assigned";
  title?: string;
  description?: string;
  icons_details?: IconsDetails;
  redirection_details?: RedirectionDetail[];
}

// Coach details message payload
export interface CoachDetailsPayload {
  action_type: "coach_details";
  title?: string;
  description?: string;
  icons_details?: IconsDetails;
  redirection_details?: RedirectionDetail[];
}

export interface SystemMessageData {
  kind?: string;
  name?: string;
  title?: string;
  profilePhoto?: string;
  payload?: {
    id?: string;
    name?: string;
    title?: string;
    profilePhoto?: string;
  };
  // Support for new format with action_type
  action_type?: string;
  product_list?: RecommendedProduct[];
  icons_details?: IconsDetails;
  redirection_details?: RedirectionDetail[];
  [key: string]: unknown;
}

export interface DraftAttachment {
  type: "image" | "audio" | "file";
  url: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  duration?: number;
}

export interface CoachInfo {
  name: string;
  profilePhoto: string;
}

export interface LogEntry {
  log?: string;
  timestamp?: Date;
} 
