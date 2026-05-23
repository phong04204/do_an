"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { ChevronLeft, Heart, ShoppingCart, Share2, CheckCircle2 } from "lucide-react"; // CheckCircle2 still used in toast
import { useFavoritesStore } from "@/store/favorites-store";
import { useCartStore } from "@/store/cart-store";
import apiClient from "@/lib/api-client";

function formatPrice(p: number) { return p.toLocaleString("vi-VN") + "đ"; }

const IMG_DEFAULT = "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80";
const IMG_CARD    = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80";
const IMG_GC      = "https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&q=80";

const ENDPOINT: Record<string, string> = {
  account:  "game-accounts",
  card:     "game-cards",
  giftcode: "game-giftcodes",
};

const CATEGORY_LABEL: Record<string, string> = {
  account:  "Tài khoản Game",
  card:     "Thẻ Cào Game",
  giftcode: "Vật phẩm & Giftcode",
};

function ProductDetailContent() {
  const { id } = useParams();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();

  const productType = (searchParams.get("type") ?? "account") as "account" | "card" | "giftcode";

  const [product, setProduct]     = useState<any>(null);
  const [activeImg, setActiveImg] = useState<string>("");
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!id) return;
    const endpoint = ENDPOINT[productType] ?? "game-accounts";
    setLoading(true);
    setProduct(null);
    setNotFound(false);
    apiClient.get(`/${endpoint}/${id}`)
      .then(res => {
        const raw = res.data?.data ?? res.data;
        if (!raw) { setNotFound(true); return; }
        const defaultImg = productType === "card" ? IMG_CARD : productType === "giftcode" ? IMG_GC : IMG_DEFAULT;
        const images = Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : [defaultImg];
        setProduct({
          id:           raw.id,
          name:         raw.title,
          images,
          price:        Number(raw.price),
          description:  raw.description ?? "",
          status:       raw.status ?? "available",
          category:     CATEGORY_LABEL[productType] ?? "Sản phẩm",
          product_type: productType,
        });
        setActiveImg(images[0]);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, productType]);

  const fav = product ? isFavorite(product.id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, image: activeImg, price: product.price, quantity: 1, product_type: product.product_type });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, image: activeImg, price: product.price, quantity: 1, product_type: product.product_type });
    router.push("/checkout");
  };

  if (loading) return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7C3AED", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        Đang tải sản phẩm...
      </div>
    </div>
  );

  if (notFound || !product) return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>😕</div>
        <h2 style={{ color: "var(--text)", marginBottom: "0.5rem" }}>Không tìm thấy sản phẩm</h2>
        <Link href="/san-pham" style={{ color: "var(--primary)", fontWeight: 700 }}>← Quay lại cửa hàng</Link>
      </div>
    </div>
  );

  const available = product.status === "available";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "1.75rem 0 5rem" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .thumb-img { opacity: 0.55; transition: opacity .2s, border-color .2s; }
        .thumb-img:hover, .thumb-img.active { opacity: 1; }
      `}</style>

      <div className="container-main">
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.75rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          <Link href="/san-pham" style={{ color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Cửa hàng
          </Link>
          <span style={{ color: "var(--border)" }}>›</span>
          <span>{product.category}</span>
          <span style={{ color: "var(--border)" }}>›</span>
          <span style={{ color: "var(--text)", fontWeight: 600 }}>{product.name}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "2.5rem", alignItems: "start" }}>

          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Main image */}
            <div style={{ borderRadius: 18, overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border-light)", aspectRatio: "16/10", position: "relative" }}>
              <img
                src={activeImg}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity .25s" }}
              />
              {!available && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", letterSpacing: 1, background: "rgba(239,68,68,0.85)", padding: "0.4rem 1.25rem", borderRadius: 99 }}>ĐÃ BÁN</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {product.images.map((img: string, i: number) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className={`thumb-img${activeImg === img ? " active" : ""}`}
                    onClick={() => setActiveImg(img)}
                    style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", cursor: "pointer", border: `2px solid ${activeImg === img ? "var(--primary)" : "var(--border-light)"}` }}
                  />
                ))}
              </div>
            )}

            {/* Description */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "1.5rem" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.9rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border-light)" }}>
                Mô tả chi tiết
              </h3>
              <div style={{ color: "var(--text-muted)", lineHeight: 1.85, fontSize: "0.9rem" }}>
                {product.description
                  ? <p style={{ whiteSpace: "pre-line", margin: 0 }}>{product.description}</p>
                  : <p style={{ color: "var(--text-light)", fontStyle: "italic", margin: 0 }}>Người bán chưa cung cấp mô tả chi tiết.</p>
                }
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div style={{ position: "sticky", top: "90px", display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Info card */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Category + fav */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ background: "rgba(124,58,237,0.1)", color: "var(--primary)", fontSize: "0.72rem", fontWeight: 700, padding: "0.3rem 0.85rem", borderRadius: 99, letterSpacing: "0.3px" }}>
                  {product.category}
                </span>
                <button
                  onClick={() => toggleFavorite({ id: product.id, title: product.name, price: product.price, images: [activeImg], category: { id: 0, name: product.category, slug: "account", icon: "", filter_schema: [] } } as any)}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", fontWeight: 600, color: fav ? "#EF4444" : "var(--text-muted)", padding: "0.3rem 0.6rem", borderRadius: 8, transition: "background .15s" }}
                >
                  <Heart style={{ width: 16, height: 16, fill: fav ? "#EF4444" : "none" }} />
                  {fav ? "Đã thích" : "Yêu thích"}
                </button>
              </div>

              {/* Title */}
              <h1 style={{ fontSize: "1.55rem", fontWeight: 900, color: "var(--text)", lineHeight: 1.25, margin: 0 }}>
                {product.name}
              </h1>

              {/* Status */}
              <div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "0.35rem",
                  padding: "0.3rem 0.85rem", borderRadius: 99, fontSize: "0.8rem", fontWeight: 700,
                  background: available ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  color: available ? "#10B981" : "#EF4444",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                  {available ? "Còn hàng" : "Đã bán"}
                </span>
              </div>

              <div style={{ height: 1, background: "var(--border-light)" }} />

              {/* Price */}
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Giá bán</p>
                <span style={{ fontSize: "2.4rem", fontWeight: 900, color: "var(--primary)", lineHeight: 1 }}>
                  {formatPrice(product.price)}
                </span>
              </div>

              <div style={{ height: 1, background: "var(--border-light)" }} />

              {/* Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <button
                  onClick={handleBuyNow}
                  className="btn-primary"
                  disabled={!available}
                  style={{ width: "100%", padding: "0.9rem", fontSize: "1rem", fontWeight: 800, borderRadius: 12, opacity: available ? 1 : 0.45 }}
                >
                  Mua ngay
                </button>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={handleAddToCart}
                    disabled={!available}
                    style={{
                      flex: 1, padding: "0.85rem", borderRadius: 12, fontWeight: 700, fontSize: "0.9rem",
                      border: "1.5px solid var(--border)", background: "transparent", color: "var(--text)",
                      cursor: available ? "pointer" : "not-allowed", opacity: available ? 1 : 0.45,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                      transition: "border-color .2s, color .2s",
                    }}
                    onMouseEnter={e => { if (available) { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}
                  >
                    <ShoppingCart style={{ width: 18, height: 18 }} /> Giỏ hàng
                  </button>
                  <button
                    style={{
                      width: 48, borderRadius: 12, border: "1.5px solid var(--border)",
                      background: "transparent", color: "var(--text-muted)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "border-color .2s, color .2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    <Share2 style={{ width: 17, height: 17 }} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", background: "var(--bg-card)", border: "1.5px solid #10B981", color: "var(--text)", padding: "0.875rem 1.5rem", borderRadius: 16, boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: "0.75rem", zIndex: 9999, pointerEvents: "none", animation: "fadeUp .3s ease" }}>
          <CheckCircle2 style={{ width: 20, height: 20, color: "#10B981" }} />
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Đã thêm vào giỏ hàng!</span>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7C3AED", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Đang tải sản phẩm...
        </div>
      </div>
    }>
      <ProductDetailContent />
    </Suspense>
  );
}
