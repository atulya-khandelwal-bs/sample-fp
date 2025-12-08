import {
  Product,
  RecommendedProductsPayload,
  RecommendedProduct,
} from "../../../common/types/chat";
import React from "react";

interface FPProductMessageViewProps {
  products?: Product[];
  recommendedProducts?: RecommendedProductsPayload;
  formatCurrency: (amount: number) => string;
}

export default function FPProductMessageView({
  products,
  recommendedProducts,
  formatCurrency,
}: FPProductMessageViewProps): React.JSX.Element {
  // Render a product card (handles both Product and RecommendedProduct formats)
  const renderProduct = (
    product: Product | RecommendedProduct,
    index: number
  ): React.JSX.Element => {
    // Determine if this is a RecommendedProduct (has action_id, actual_amount, selling_amount)
    const isRecommendedProduct =
      "action_id" in product || "actual_amount" in product;

    // Extract product data based on type
    const productTitle = isRecommendedProduct
      ? (product as RecommendedProduct).title || "Product"
      : (product as Product).name || (product as Product).title || "Product";

    const productDescription = isRecommendedProduct
      ? (product as RecommendedProduct).description || ""
      : (product as Product).description || "";

    const productImage = isRecommendedProduct
      ? (product as RecommendedProduct).image_url || ""
      : (product as Product & { image?: string; imageUrl?: string }).image ||
        (product as Product & { image?: string; imageUrl?: string }).imageUrl ||
        (product as Product).photoUrl ||
        "";

    const sellingPrice = isRecommendedProduct
      ? (product as RecommendedProduct).selling_amount || 0
      : (product as Product).price ||
        (product as Product & { currentPrice?: number }).currentPrice ||
        (product as Product & { originalPrice?: number }).originalPrice ||
        0;

    const actualPrice = isRecommendedProduct
      ? (product as RecommendedProduct).actual_amount || 0
      : (product as Product).discountedPrice ||
        (product as Product & { originalPrice?: number }).originalPrice ||
        0;

    const hasDiscount = actualPrice > 0 && actualPrice < sellingPrice;
    const redirectionUrl = isRecommendedProduct
      ? (product as RecommendedProduct).redirection_url || ""
      : "";

    const hasDescription = Boolean(
      productDescription && productDescription.trim()
    );

    const productId = isRecommendedProduct
      ? (product as RecommendedProduct).action_id || `product-${index}`
      : (product as Product).id || `product-${index}`;

    // If product has description, use wider card layout (280px width)
    if (hasDescription) {
      return (
        <div
          key={productId}
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
                textAlign: "left",
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
                textAlign: "left",
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
                textAlign: "left",
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
        key={productId}
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
              textAlign: "left",
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
            textAlign: "left",
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

  // Handle recommended products format (with title/description)
  if (recommendedProducts) {
    const productList = recommendedProducts.product_list || [];
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
        }}
      >
        {/* Title and Description */}
        {(recommendedProducts.title || recommendedProducts.description) && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {recommendedProducts.title && (
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  lineHeight: "1.4em",
                  color: "#0A1F34",
                }}
                dangerouslySetInnerHTML={{ __html: recommendedProducts.title }}
              />
            )}
            {recommendedProducts.description && (
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "1.4em",
                  color: "#6C7985",
                }}
                dangerouslySetInnerHTML={{
                  __html: recommendedProducts.description,
                }}
              />
            )}
          </div>
        )}

        {/* Product List */}
        {productList.length > 0 && (
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
              }}
            >
              {productList.length} product{productList.length !== 1 ? "s" : ""}
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
              }}
            >
              {productList.map((product, index) =>
                renderProduct(product, index)
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Handle legacy products format (Product[] array)
  if (products && Array.isArray(products) && products.length > 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          maxWidth: "100%",
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
            marginBottom: "6px",
          }}
        >
          {products.length} product{products.length !== 1 ? "s" : ""}
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
          }}
        >
          {products.map((product, index) => renderProduct(product, index))}
        </div>
      </div>
    );
  }

  return <div>No products to display</div>;
}
