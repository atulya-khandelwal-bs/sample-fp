import UserCheckIcon from "../assets/UserCheck.svg";
import SealCheckIcon from "../assets/SealCheck.svg";
import ForkKnifeIcon from "../assets/ForkKnife.svg";
import {
  Message,
  RecommendedProduct,
  CoachAssignedPayload,
  CoachDetailsPayload,
} from "../../common/types/chat";
import React from "react";

interface FPSystemMessageProps {
  msg: Message;
}

export default function FPSystemMessage({
  msg,
}: FPSystemMessageProps): React.JSX.Element {
  // Special handling for recommended_products
  if (
    msg.system?.action_type === "recommended_products" ||
    msg.recommendedProducts
  ) {
    const payload = msg.recommendedProducts || {
      action_type: "recommended_products" as const,
      title: msg.system?.title,
      description: msg.system?.description,
      product_list: msg.system?.product_list || [],
    };

    const formatCurrency = (amount: number): string => {
      // Format without decimals for whole numbers, with decimals otherwise
      if (amount % 1 === 0) {
        return `₹${amount.toFixed(0)}`;
      }
      return `₹${amount.toFixed(2)}`;
    };

    const renderProduct = (product: RecommendedProduct, index: number) => {
      const productTitle = product.title || "Product";
      const productDescription = product.description || "";
      const productImage = product.image_url || "";
      const sellingPrice = product.selling_amount || 0;
      const actualPrice = product.actual_amount || 0;
      const hasDiscount = actualPrice > sellingPrice && actualPrice > 0;
      const redirectionUrl = product.redirection_url || "";
      const hasDescription = Boolean(
        productDescription && productDescription.trim()
      );

      // If product has description, use wider card layout (280px width)
      if (hasDescription) {
        return (
          <div
            key={product.action_id || index}
            style={{
              width: "280px",
              height: "126px",
              background: "rgba(35, 37, 52, 0.08)",
              borderRadius: "10px",
              padding: "4px",
              boxShadow: "0px 2px 6px 0px rgba(35, 37, 52, 0.06)",
              display: "flex",
              flexDirection: "row",
              position: "relative",
              flexShrink: 0,
              cursor: redirectionUrl ? "pointer" : "default",
            }}
            onClick={() => {
              if (redirectionUrl) {
                window.open(redirectionUrl, "_blank");
              }
              console.log("Product clicked:", product);
            }}
          >
            {/* Product Image */}
            <div
              style={{
                width: "118px",
                height: "118px",
                borderRadius: "10px",
                overflow: "hidden",
                background: "#FFFFFF",
                border: "1px solid #E7E9EB",
                flexShrink: 0,
              }}
            >
              {productImage ? (
                <img
                  src={productImage}
                  alt={productTitle}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9CA3AF",
                    fontSize: "12px",
                  }}
                >
                  No Image
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                paddingLeft: "10px",
                paddingRight: "4px",
                justifyContent: "space-between",
                minWidth: 0,
              }}
            >
              {/* Title */}
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  lineHeight: "1.14em",
                  color: "#0A1F34",
                  marginBottom: "4px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {productTitle}
              </div>

              {/* Description */}
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "1.33em",
                  color: "#6C7985",
                  marginBottom: "4px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  flex: 1,
                }}
              >
                {productDescription}
              </div>

              {/* Price Section */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "1em",
                    letterSpacing: "0.014em",
                    color: "#0A1F34",
                  }}
                >
                  {formatCurrency(sellingPrice)}
                </div>
                {hasDiscount && (
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "1em",
                      letterSpacing: "0.014em",
                      color: "#6C7985",
                      textDecoration: "line-through",
                    }}
                  >
                    {formatCurrency(actualPrice)}
                  </div>
                )}
              </div>
            </div>

            {/* Right Arrow Icon - Always show */}
            <div
              style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                width: "12px",
                height: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-hidden="true"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.5 2.25L7.5 6L4.5 9.75"
                  stroke="#232534"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        );
      }

      // If no description, use narrower card layout (120px width)
      return (
        <div
          key={product.action_id || index}
          style={{
            width: "120px",
            height: "208px",
            background: "rgba(35, 37, 52, 0.08)",
            borderRadius: "10px",
            padding: "4px",
            boxShadow: "0px 2px 6px 0px rgba(35, 37, 52, 0.06)",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            flexShrink: 0,
            cursor: redirectionUrl ? "pointer" : "default",
          }}
          onClick={() => {
            if (redirectionUrl) {
              window.open(redirectionUrl, "_blank");
            }
            console.log("Product clicked:", product);
          }}
        >
          {/* Product Image */}
          <div
            style={{
              width: "112px",
              height: "112px",
              borderRadius: "10px",
              overflow: "hidden",
              background: "#FFFFFF",
              border: "1px solid #E7E9EB",
              marginBottom: "4px",
            }}
          >
            {productImage ? (
              <img
                src={productImage}
                alt={productTitle}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9CA3AF",
                  fontSize: "12px",
                }}
              >
                No Image
              </div>
            )}
          </div>

          {/* Product Title */}
          <div
            style={{
              padding: "0 6px",
              marginTop: "auto",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "1.14em",
                color: "#0A1F34",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: "32px",
              }}
            >
              {productTitle}
            </div>
          </div>

          {/* Price Section */}
          <div
            style={{
              padding: "0 6px",
              marginBottom: "4px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "1em",
                letterSpacing: "0.014em",
                color: "#0A1F34",
              }}
            >
              {formatCurrency(sellingPrice)}
            </div>
            {hasDiscount && (
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "1em",
                  letterSpacing: "0.014em",
                  color: "#6C7985",
                  textDecoration: "line-through",
                }}
              >
                {formatCurrency(actualPrice)}
              </div>
            )}
          </div>

          {/* Right Arrow Icon - Always show */}
          <div
            style={{
              position: "absolute",
              bottom: "4px",
              right: "4px",
              width: "12px",
              height: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-hidden="true"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.5 2.25L7.5 6L4.5 9.75"
                stroke="#232534"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      );
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          margin: "0.75rem 0",
          width: "100%",
        }}
      >
        {/* Title and Description */}
        {(payload.title || payload.description) && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              padding: "0 12px",
            }}
          >
            {payload.title && (
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  lineHeight: "1.4em",
                  color: "#0A1F34",
                }}
                dangerouslySetInnerHTML={{ __html: payload.title }}
              />
            )}
            {payload.description && (
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "1.4em",
                  color: "#6C7985",
                }}
                dangerouslySetInnerHTML={{ __html: payload.description }}
              />
            )}
          </div>
        )}

        {/* Product List */}
        {payload.product_list && payload.product_list.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {/* Product count label */}
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                lineHeight: "1.2em",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#6C7985",
                padding: "0 12px",
              }}
            >
              {payload.product_list.length} product
              {payload.product_list.length !== 1 ? "s" : ""}
            </div>
            {/* Horizontal scrollable product cards */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                overflowX: "auto",
                overflowY: "hidden",
                scrollbarWidth: "none",
                paddingBottom: "4px",
                paddingLeft: "12px",
                paddingRight: "12px",
              }}
            >
              {payload.product_list.map((product, index) =>
                renderProduct(product, index)
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Special handling for coach_assigned and coach_details
  if (msg.system && msg.system !== null) {
    const systemData = msg.system;
    const actionType =
      (Array.isArray(systemData) && systemData[0]?.action_type) ||
      (systemData as { action_type?: string })?.action_type;

    if (actionType === "coach_assigned") {
      const payload: CoachAssignedPayload = Array.isArray(systemData)
        ? (systemData[0] as CoachAssignedPayload)
        : (systemData as unknown as CoachAssignedPayload);

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            margin: "0.75rem 0",
            width: "100%",
          }}
        >
          {/* Horizontal line with centered notification bubble */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              position: "relative",
              margin: "0.5rem 0",
            }}
          >
            {/* Left line */}
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "#E5E7EB",
              }}
            />
            {/* Notification bubble */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                margin: "0 12px",
                background: "white",
                color: "#0A1F34",
                borderRadius: "20px",
                padding: "8px 16px",
                width: "fit-content",
                border: "1px solid #E7E9EB",
                boxShadow: "0px 1px 2px 0px rgba(35, 37, 52, 0.06)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Left icon if available */}
              {payload.icons_details && payload.icons_details.left_icon && (
                <img
                  src={payload.icons_details.left_icon}
                  alt="Left icon"
                  style={{
                    width: "16px",
                    height: "16px",
                    flexShrink: 0,
                  }}
                />
              )}
              {(!payload.icons_details || !payload.icons_details.left_icon) && (
                <img
                  src={UserCheckIcon}
                  alt="User check"
                  style={{
                    width: "16px",
                    height: "16px",
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "1.2em",
                  color: "#0A1F34",
                }}
              >
                {payload.title || "Nutritionist Assigned"}
              </span>
              {/* Right icon if available */}
              {payload.icons_details && payload.icons_details.right_icon && (
                <img
                  src={payload.icons_details.right_icon}
                  alt="Right icon"
                  style={{
                    width: "16px",
                    height: "16px",
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
            {/* Right line */}
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "#E5E7EB",
              }}
            />
          </div>
        </div>
      );
    }

    // Special handling for coach_details
    if (actionType === "coach_details") {
      const payload: CoachDetailsPayload = Array.isArray(systemData)
        ? (systemData[0] as CoachDetailsPayload)
        : (systemData as unknown as CoachDetailsPayload);

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            margin: "0.75rem 0",
            width: "100%",
          }}
        >
          {/* Coach details card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "white",
              borderRadius: "12px",
              padding: "12px",
              border: "1px solid #E7E9EB",
              boxShadow: "0px 1px 2px 0px rgba(35, 37, 52, 0.06)",
              cursor:
                payload.redirection_details &&
                payload.redirection_details.length > 0
                  ? "pointer"
                  : "default",
              width: "100%",
            }}
            onClick={() => {
              if (
                payload.redirection_details &&
                payload.redirection_details.length > 0
              ) {
                const redirectUrl = payload.redirection_details[0].redirect_url;
                if (redirectUrl) {
                  // Handle navigation - could be a route or external URL
                  console.log("Navigate to:", redirectUrl);
                }
              }
            }}
          >
            {/* Left icon if available */}
            {payload.icons_details && payload.icons_details.left_icon && (
              <img
                src={payload.icons_details.left_icon}
                alt="Left icon"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            )}
            {/* Coach info */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "1.2em",
                  color: "#0A1F34",
                }}
              >
                {payload.title || "Coach"}
              </div>
              {payload.description && (
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.2em",
                    color: "#6C7985",
                  }}
                >
                  {payload.description}
                </div>
              )}
            </div>
            {/* Right arrow icon - Always show */}
            {payload.icons_details && payload.icons_details.right_icon ? (
              <img
                src={payload.icons_details.right_icon}
                alt="Right icon"
                style={{
                  width: "24px",
                  height: "24px",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "#6C7985",
                }}
                aria-hidden="true"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.5 2.25L7.5 6L4.5 9.75"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // Other system messages (meal_plan_updated, etc.)
  const contentText =
    typeof msg.content === "string"
      ? msg.content
      : typeof msg.content === "object"
      ? (msg.content as { body?: string }).body || JSON.stringify(msg.content)
      : String(msg.content || "");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        position: "relative",
        margin: "0.5rem 0",
      }}
    >
      {/* Left line */}
      <div
        style={{
          flex: 1,
          height: "1px",
          background: "#E5E7EB",
        }}
      />
      {/* Message bubble */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          margin: "0 12px",
          background: "#f3f4f6",
          color: "#111827",
          borderRadius: "9999px",
          padding: "0.4rem 0.75rem",
          width: "fit-content",
          boxShadow: "inset 0 0 0 1px #e5e7eb",
          position: "relative",
          zIndex: 1,
        }}
      >
        <img
          src={ForkKnifeIcon}
          alt="Fork and knife"
          style={{
            width: "16px",
            height: "16px",
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
          {contentText}
        </span>
        <span aria-hidden style={{ marginLeft: 4, color: "#9ca3af" }}>
          ›
        </span>
      </div>
      {/* Right line */}
      <div
        style={{
          flex: 1,
          height: "1px",
          background: "#E5E7EB",
        }}
      />
    </div>
  );
}
