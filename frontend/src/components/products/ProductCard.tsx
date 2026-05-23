"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/store/favorites-store";

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
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const fav = isFavorite(product.id);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;

  const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

  return (
    <div className="product-card" style={{ height: "100%" }}>
      {discount && <div className="product-card-badge">-{discount}%</div>}
      <button 
        onClick={e => {
          e.preventDefault();
          toggleFavorite({
            id: product.id,
            title: product.name,
            price: product.price,
            images: [product.image],
            category: {
              id: 0,
              name: product.category,
              slug: product.category.toLowerCase(),
              icon: "",
              filter_schema: []
            }
          } as Parameters<typeof toggleFavorite>[0]);
        }} 
        className="product-card-wish"
        style={{ color: fav ? "#EF4444" : "var(--text-light)" }}
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart style={{ width: "15px", height: "15px", fill: fav ? "#EF4444" : "none" }} />
      </button>
      <Link href={`/san-pham/${product.id}?type=${product.product_type ?? "account"}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ position: "relative", overflow: "hidden", borderRadius: "16px 16px 0 0" }}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="product-card-img" 
            loading="lazy"
          />
        </div>
        <div className="product-card-body">
          <h3 className="product-card-title">{product.name}</h3>
          <div className="product-card-meta">
            {product.rating != null && (
              <span className="stars">
                {"★".repeat(Math.floor(product.rating))}
                <span style={{ color: "#D1D5DB" }}>{"★".repeat(5 - Math.floor(product.rating))}</span>
                <span style={{ marginLeft: "4px", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                  ({product.rating.toFixed(1)})
                </span>
              </span>
            )}
            {product.sold != null && <span>Đã bán {product.sold}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginTop: "0.25rem" }}>
            <span className="product-card-price">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="product-card-price-old">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
