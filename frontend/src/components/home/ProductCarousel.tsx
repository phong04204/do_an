"use client";
import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ProductCard from "@/components/products/ProductCard";

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  rating: number;
  sold: number;
  badge?: string;
  category: string;
}

interface ProductCarouselProps {
  title: string;
  subtitle: string;
  products: Product[];
  viewAllHref?: string;
}

export default function ProductCarousel({ title, subtitle, products, viewAllHref = "/san-pham" }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return;
    const w = trackRef.current.clientWidth;
    trackRef.current.scrollBy({ left: dir === "left" ? -w * 0.8 : w * 0.8, behavior: "smooth" });
  };

  return (
    <section style={{ padding: "2.5rem 0 0" }}>
      <div className="container-main">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div>
            <h2 className="section-title">{title}</h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>{subtitle}</p>
          </div>
          <Link href={viewAllHref} style={{
            display: "flex", alignItems: "center", gap: "0.25rem",
            fontSize: "0.875rem", fontWeight: 600, color: "#7C3AED",
            textDecoration: "none", whiteSpace: "nowrap"
          }}>
            Xem tất cả <ChevronRight style={{ width: "16px", height: "16px" }} />
          </Link>
        </div>

        {/* Carousel */}
        <div className="carousel-wrapper">
          <button className="carousel-btn carousel-btn-prev" onClick={() => scroll("left")} aria-label="Previous">
            <ChevronLeft style={{ width: "18px", height: "18px" }} />
          </button>
          <div ref={trackRef} className="carousel-track">
            {products.map(p => (
              <div key={p.id} className="carousel-item">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <button className="carousel-btn carousel-btn-next" onClick={() => scroll("right")} aria-label="Next">
            <ChevronRight style={{ width: "18px", height: "18px" }} />
          </button>
        </div>
      </div>
    </section>
  );
}
