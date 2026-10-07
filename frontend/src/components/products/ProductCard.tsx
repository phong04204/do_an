"use client";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  sold?: number;
  category: string;
  type?: string;
  product_type?: "account" | "card" | "giftcode";
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;
  const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

  return (
    <div
      className="product-card"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: "18px",
        overflow: "hidden",
        border: "1px solid var(--border-light)",
        background: "var(--bg-card)",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Link
        href={`/san-pham/${product.id}?type=${product.product_type ?? "account"}`}
        style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}
      >
        {/* Media Container */}
        <div style={{ position: "relative", overflow: "hidden", width: "100%", aspectRatio: "16/10", background: "var(--bg-soft)" }}>
          {/* Game Category Badge */}
          {product.category && product.category !== "Khác" && (
            <div style={{
              position: "absolute", top: 10, left: 10,
              background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)",
              color: "#fff", fontSize: "0.72rem", fontWeight: 700,
              padding: "3px 9px", borderRadius: "8px", zIndex: 2,
              border: "1px solid rgba(255,255,255,0.12)", letterSpacing: "0.02em"
            }}>
              {product.category}
            </div>
          )}

          {/* Subtype Badge (VIP / Rank Cao / Mệnh giá) or Discount */}
          {discount ? (
            <div style={{
              position: "absolute", top: 10, right: 10,
              background: "linear-gradient(135deg, #EF4444, #DC2626)",
              color: "#fff", fontSize: "0.72rem", fontWeight: 800,
              padding: "3px 8px", borderRadius: "8px", zIndex: 2,
              boxShadow: "0 2px 8px rgba(239,68,68,0.35)"
            }}>
              -{discount}%
            </div>
          ) : product.type ? (
            <div style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(124, 58, 237, 0.85)", backdropFilter: "blur(8px)",
              color: "#fff", fontSize: "0.7rem", fontWeight: 700,
              padding: "3px 8px", borderRadius: "8px", zIndex: 2,
              border: "1px solid rgba(255,255,255,0.15)"
            }}>
              {product.type}
            </div>
          ) : null}

          {/* Image */}
          <img
            src={product.image}
            alt={product.name}
            className="product-card-img"
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.4s ease"
            }}
          />
        </div>

        {/* Card Body */}
        <div style={{
          padding: "1rem 1.1rem 1.1rem",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "space-between"
        }}>
          <div>
            <h3
              className="product-card-title"
              style={{
                fontSize: "0.92rem",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: "0.45rem",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                whiteSpace: "normal"
              }}
            >
              {product.name}
            </h3>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginBottom: "0.75rem"
            }}>
              {product.rating != null ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <span style={{ color: "#F59E0B", fontWeight: 700 }}>★</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{product.rating.toFixed(1)}</span>
                </span>
              ) : (
                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>Mã: #{product.id}</span>
              )}
              {product.sold != null && <span>Đã bán {product.sold}</span>}
            </div>
          </div>

          {/* Price & Action Row */}
          <div style={{
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--border-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: "1.05rem", fontWeight: 850, color: "var(--primary)", letterSpacing: "-0.01em" }}>
                {formatPrice(product.price)}
              </div>
              {product.oldPrice && (
                <div style={{ fontSize: "0.75rem", color: "var(--text-light)", textDecoration: "line-through" }}>
                  {formatPrice(product.oldPrice)}
                </div>
              )}
            </div>

            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--bg-soft)",
              border: "1px solid var(--border-light)",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}>
              <ArrowRight style={{ width: "15px", height: "15px" }} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
