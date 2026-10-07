"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import {
  ChevronLeft, ShoppingCart, Share2, CheckCircle2,
  ShieldCheck, Zap, Lock, Headphones, Sparkles, Copy, Check,
  Clock, ArrowRight, Award, Flame
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import apiClient from "@/lib/api-client";
import ProductCard, { Product } from "@/components/products/ProductCard";

function formatPrice(p: number) {
  return p.toLocaleString("vi-VN") + "đ";
}

const IMG_DEFAULT = "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80";
const IMG_CARD = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80";
const IMG_GC = "https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&q=80";

const ENDPOINT: Record<string, string> = {
  account: "game-accounts",
  card: "game-cards",
  giftcode: "game-giftcodes",
};

const CATEGORY_LABEL: Record<string, string> = {
  account: "Tài khoản Game",
  card: "Thẻ Cào Game",
  giftcode: "Vật phẩm & Giftcode",
};

// Component format mô tả thành các box chuyên nghiệp
function FormattedDescription({ text }: { text: string }) {
  if (!text) {
    return (
      <p style={{ color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
        Người bán chưa cung cấp mô tả chi tiết cho sản phẩm này.
      </p>
    );
  }

  const lines = text.split("\n");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", lineHeight: 1.75 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} style={{ height: 6 }} />;
        }

        // Header check: starts with emoji header or section title
        const isHeader = /^([🌟💎🛡️📜📌🎮⚡🎁📋🔥✨💡🏆]\s*|[A-ZÀ-Ỹ\s]{4,}:)/u.test(trimmed);
        if (isHeader) {
          return (
            <div
              key={idx}
              style={{
                marginTop: idx === 0 ? 0 : 14,
                marginBottom: 4,
                padding: "8px 14px",
                borderRadius: 10,
                background: "rgba(124, 58, 237, 0.08)",
                borderLeft: "3px solid var(--primary)",
                fontWeight: 800,
                fontSize: "0.92rem",
                color: "var(--text)",
                letterSpacing: "0.2px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {trimmed}
            </div>
          );
        }

        // Bullet point check
        if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const bulletText = trimmed.replace(/^[•\-\*]\s*/, "");
          const [titlePart, ...restParts] = bulletText.split(":");
          const hasColon = restParts.length > 0;

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                paddingLeft: 4,
                fontSize: "0.9rem",
                color: "var(--text-muted)",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--primary)",
                  marginTop: 9,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                {hasColon ? (
                  <>
                    <strong style={{ color: "var(--text)", fontWeight: 700 }}>
                      {titlePart}:
                    </strong>
                    <span> {restParts.join(":")}</span>
                  </>
                ) : (
                  bulletText
                )}
              </div>
            </div>
          );
        }

        return (
          <p
            key={idx}
            style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "var(--text-muted)",
            }}
          >
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

function ProductDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, setBuyNowItem } = useCartStore();

  const productType = (searchParams.get("type") ?? "account") as "account" | "card" | "giftcode";

  const [product, setProduct] = useState<any>(null);
  const [activeImg, setActiveImg] = useState<string>("");
  const [activeImgIdx, setActiveImgIdx] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [copied, setCopied] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    if (!id) return;
    const endpoint = ENDPOINT[productType] ?? "game-accounts";
    setLoading(true);
    setProduct(null);
    setNotFound(false);

    apiClient.get(`/${endpoint}/${id}`)
      .then(res => {
        const raw = res.data?.data ?? res.data;
        if (!raw) {
          setNotFound(true);
          return;
        }
        const defaultImg = productType === "card" ? IMG_CARD : productType === "giftcode" ? IMG_GC : IMG_DEFAULT;
        const images = Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : [defaultImg];
        setProduct({
          id: raw.id,
          name: raw.title,
          images,
          price: Number(raw.price),
          description: raw.description ?? "",
          status: raw.status ?? "available",
          category: CATEGORY_LABEL[productType] ?? "Sản phẩm",
          product_type: productType,
        });
        setActiveImg(images[0]);
        setActiveImgIdx(0);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    // Fetch related items
    apiClient.get(`/${endpoint}`)
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        const filtered = list
          .filter((item: any) => String(item.id) !== String(id))
          .slice(0, 4)
          .map((item: any) => ({
            id: item.id,
            name: item.title,
            image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : IMG_DEFAULT,
            price: Number(item.price),
            category: CATEGORY_LABEL[productType] ?? "Game",
            product_type: productType,
          }));
        setRelatedProducts(filtered);
      })
      .catch(() => {});
  }, [id, productType]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, image: activeImg, price: product.price, quantity: 1, product_type: product.product_type });
    showToast("Đã thêm sản phẩm vào giỏ hàng!");
  };

  const handleBuyNow = () => {
    if (!product) return;
    setBuyNowItem({ id: product.id, name: product.name, image: activeImg, price: product.price, quantity: 1, product_type: product.product_type });
    router.push("/checkout");
  };

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast("Đã sao chép liên kết sản phẩm!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "var(--primary)", animation: "spin 1s linear infinite", margin: "0 auto 1.25rem" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ fontSize: "1rem", fontWeight: 600 }}>Đang tải thông tin sản phẩm...</div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🔍</div>
          <h2 style={{ color: "var(--text)", fontWeight: 800, marginBottom: "0.5rem" }}>Không tìm thấy sản phẩm</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Sản phẩm này có thể đã bị gỡ hoặc không tồn tại trên hệ thống.</p>
          <Link href="/san-pham" className="btn-primary" style={{ padding: "0.75rem 1.75rem", borderRadius: 12, textDecoration: "none", display: "inline-flex" }}>
            ← Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const available = product.status === "available";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "1.5rem 0 5rem" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .thumb-btn { opacity: 0.6; transition: all .2s; border: 2px solid transparent; }
        .thumb-btn:hover { opacity: 0.9; }
        .thumb-btn.active { opacity: 1; border-color: var(--primary); box-shadow: 0 0 12px rgba(124, 58, 237, 0.4); }
        .spec-item { transition: transform .2s, border-color .2s; }
        .spec-item:hover { transform: translateY(-2px); border-color: rgba(124, 58, 237, 0.3) !important; }
      `}</style>

      <div className="container-main" style={{ maxWidth: 1200 }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            <Link href="/san-pham" style={{ color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
              <ChevronLeft style={{ width: 16, height: 16 }} /> Cửa hàng
            </Link>
            <span style={{ color: "var(--border)" }}>/</span>
            <span style={{ color: "var(--text-muted)" }}>{product.category}</span>
            <span style={{ color: "var(--border)" }}>/</span>
            <span style={{ color: "var(--text)", fontWeight: 700, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              #{product.id}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 700,
              background: available ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
              color: available ? "#10B981" : "#EF4444",
              border: `1px solid ${available ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              {available ? "Sẵn sàng giao dịch" : "Đã có người mua"}
            </span>
            <span style={{
              fontSize: "0.75rem", padding: "4px 10px", borderRadius: 8,
              background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-light)",
              color: "var(--text-muted)", fontWeight: 600
            }}>
              Mã: #{product.id}
            </span>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 410px", gap: "2rem", alignItems: "start" }}>

          {/* LEFT COLUMN: Gallery, Specs & Rich Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* 1. Main Visual Gallery */}
            <div style={{
              background: "var(--bg-card)", borderRadius: 20, padding: 14,
              border: "1px solid var(--border-light)", boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
            }}>
              {/* Main Image Stage */}
              <div style={{
                borderRadius: 14, overflow: "hidden", position: "relative",
                aspectRatio: "16/9.5", background: "#0a0c10",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <img
                  src={activeImg}
                  alt={product.name}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    display: "block", transition: "opacity 0.25s ease-in-out"
                  }}
                />

                {/* Status Overlay if Sold */}
                {!available && (
                  <div style={{
                    position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(2px)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <div style={{
                      color: "#fff", fontWeight: 900, fontSize: "1.3rem", letterSpacing: 2,
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      padding: "0.5rem 1.75rem", borderRadius: 99,
                      boxShadow: "0 8px 25px rgba(239,68,68,0.5)"
                    }}>
                      ĐÃ BÁN
                    </div>
                  </div>
                )}

                {/* Badge: Verification Seal */}
                <div style={{
                  position: "absolute", top: 12, left: 12,
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 20,
                  background: "rgba(10, 12, 16, 0.75)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#10b981", fontSize: "0.75rem", fontWeight: 700
                }}>
                  <CheckCircle2 style={{ width: 14, height: 14 }} />
                  Đã Kiểm Duyệt
                </div>

                {/* Badge: Image counter */}
                {product.images.length > 1 && (
                  <div style={{
                    position: "absolute", bottom: 12, right: 12,
                    padding: "4px 10px", borderRadius: 20,
                    background: "rgba(10, 12, 16, 0.75)", backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#e2e8f0", fontSize: "0.75rem", fontWeight: 700
                  }}>
                    {activeImgIdx + 1} / {product.images.length} ảnh
                  </div>
                )}
              </div>

              {/* Thumbnails list */}
              {product.images.length > 1 && (
                <div style={{ display: "flex", gap: 10, marginTop: 12, overflowX: "auto", paddingBottom: 4 }}>
                  {product.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setActiveImg(img); setActiveImgIdx(i); }}
                      className={`thumb-btn ${activeImg === img ? "active" : ""}`}
                      style={{
                        width: 76, height: 56, borderRadius: 10, overflow: "hidden",
                        padding: 0, background: "#0a0c10", cursor: "pointer", flexShrink: 0
                      }}
                    >
                      <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Key Specs Quick Summary Bar */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12
            }}>
              {[
                { icon: <Award style={{ width: 18, height: 18, color: "#8b5cf6" }} />, label: "Phân Loại", val: product.category },
                { icon: <Zap style={{ width: 18, height: 18, color: "#f59e0b" }} />, label: "Bàn Giao", val: "Tự động 3s" },
                { icon: <Lock style={{ width: 18, height: 18, color: "#10b981" }} />, label: "Bảo Mật", val: "Thông tin trắng" },
                { icon: <ShieldCheck style={{ width: 18, height: 18, color: "#3b82f6" }} />, label: "Bảo Hành", val: "1 đổi 1 trọn đời" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="spec-item"
                  style={{
                    background: "var(--bg-card)", border: "1px solid var(--border-light)",
                    borderRadius: 14, padding: "12px 14px",
                    display: "flex", flexDirection: "column", gap: 4
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>
                    {item.val}
                  </div>
                </div>
              ))}
            </div>

            {/* 3. Detailed Structured Description Card */}
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border-light)",
              borderRadius: 20, padding: "1.75rem", boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingBottom: "1rem", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-light)"
              }}>
                <h2 style={{
                  fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", margin: 0,
                  display: "flex", alignItems: "center", gap: 8
                }}>
                  <Sparkles style={{ width: 18, height: 18, color: "var(--primary)" }} />
                  Thông Tin Chi Tiết Sản Phẩm
                </h2>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Cập nhật gần nhất</span>
              </div>

              {/* Formatted Content */}
              <FormattedDescription text={product.description} />
            </div>

            {/* 4. Automated Buying Process Steps (Quy trình nhận nick tự động) */}
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border-light)",
              borderRadius: 20, padding: "1.5rem", display: "flex", flexDirection: "column", gap: 14
            }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                <Clock style={{ width: 16, height: 16, color: "#10b981" }} />
                Quy Trình Mua & Nhận Tài Khoản Tự Động
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                {[
                  { step: "01", title: "Đặt mua", desc: "Bấm Mua ngay và kiểm tra giỏ hàng" },
                  { step: "02", title: "Thanh toán", desc: "Quét mã QR VNPay / Chuyển khoản" },
                  { step: "03", title: "Nhận tài khoản", desc: "Hệ thống tự động hiển thị mật khẩu tức thì" },
                  { step: "04", title: "Đổi bảo mật", desc: "Đổi pass và thêm email cá nhân" },
                ].map((s, idx) => (
                  <div key={idx} style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-light)",
                    borderRadius: 12, padding: 12
                  }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)", marginBottom: 3 }}>BƯỚC {s.step}</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Purchase & Security Commitment Box */}
          <div style={{ position: "sticky", top: "85px", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* 1. Main Action / Buy Card */}
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border-light)",
              borderRadius: 22, padding: "1.75rem", boxShadow: "0 10px 35px rgba(0,0,0,0.15)",
              display: "flex", flexDirection: "column", gap: 18
            }}>

              {/* Tag & Title */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{
                    background: "rgba(124,58,237,0.12)", color: "var(--primary)",
                    fontSize: "0.72rem", fontWeight: 800, padding: "3px 10px", borderRadius: 99,
                    letterSpacing: "0.4px", textTransform: "uppercase"
                  }}>
                    {product.category}
                  </span>
                  <span style={{
                    background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b",
                    fontSize: "0.72rem", fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                    display: "inline-flex", alignItems: "center", gap: 3
                  }}>
                    <Flame style={{ width: 11, height: 11 }} /> VIP
                  </span>
                </div>

                <h1 style={{
                  fontSize: "1.35rem", fontWeight: 900, color: "var(--text)",
                  lineHeight: 1.35, margin: 0
                }}>
                  {product.name}
                </h1>
              </div>

              {/* Price Box */}
              <div style={{
                padding: "14px 16px", borderRadius: 14,
                background: "rgba(124, 58, 237, 0.05)", border: "1px solid rgba(124, 58, 237, 0.15)"
              }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>
                  Giá bán ưu đãi
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{
                    fontSize: "2.2rem", fontWeight: 900, lineHeight: 1,
                    color: "var(--primary)"
                  }}>
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>

              {/* Purchase & Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!available}
                  className="btn-primary"
                  style={{
                    width: "100%", padding: "0.95rem", fontSize: "1.05rem", fontWeight: 800,
                    borderRadius: 14, cursor: available ? "pointer" : "not-allowed",
                    opacity: available ? 1 : 0.45, display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(124,58,237,0.35)"
                  }}
                >
                  <span>MUA NGAY BÂY GIỜ</span>
                  <ArrowRight style={{ width: 18, height: 18 }} />
                </button>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!available}
                    style={{
                      flex: 1, padding: "0.85rem", borderRadius: 12, fontWeight: 700, fontSize: "0.88rem",
                      border: "1.5px solid var(--border)", background: "transparent", color: "var(--text)",
                      cursor: available ? "pointer" : "not-allowed", opacity: available ? 1 : 0.45,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      transition: "all .2s"
                    }}
                    onMouseEnter={e => { if (available) { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}
                  >
                    <ShoppingCart style={{ width: 16, height: 16 }} />
                    <span>Thêm vào giỏ</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    title="Sao chép liên kết"
                    style={{
                      width: 46, borderRadius: 12, border: "1.5px solid var(--border)",
                      background: "transparent", color: copied ? "#10b981" : "var(--text-muted)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    {copied ? <Check style={{ width: 16, height: 16 }} /> : <Share2 style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
              </div>

              {/* Trust & Guarantee Bullet List */}
              <div style={{
                paddingTop: 12, borderTop: "1px solid var(--border-light)",
                display: "flex", flexDirection: "column", gap: 10
              }}>
                {[
                  { icon: <Zap size={14} color="#f59e0b" />, text: "Giao dịch tức thì trong 3 giây tự động" },
                  { icon: <Lock size={14} color="#10b981" />, text: "Bảo mật tài khoản tuyệt đối, email trắng" },
                  { icon: <ShieldCheck size={14} color="#8b5cf6" />, text: "Bảo hành 1 đổi 1 hoặc hoàn tiền 100%" },
                  { icon: <Headphones size={14} color="#06b6d4" />, text: "Hỗ trợ kỹ thuật & giải đáp 24/7 trực tuyến" },
                ].map((g, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.04)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      {g.icon}
                    </div>
                    <span>{g.text}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* 2. Mini Support Contact Banner */}
            <div style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.08))",
              border: "1px solid rgba(124,58,237,0.2)", borderRadius: 16, padding: "14px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, background: "var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#fff"
                }}>
                  <Headphones size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text)" }}>Cần tư vấn thêm?</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Hỗ trợ qua Zalo & Hotline</div>
                </div>
              </div>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)",
                  background: "rgba(255,255,255,0.08)", padding: "6px 12px", borderRadius: 8,
                  textDecoration: "none", border: "1px solid rgba(124,58,237,0.3)"
                }}
              >
                Chat ngay
              </a>
            </div>

          </div>

        </div>

        {/* 3. RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: "4.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--text)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Sản Phẩm Tương Tự</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--primary)", background: "rgba(124,58,237,0.1)", padding: "2px 8px", borderRadius: 6 }}>
                    Gợi ý
                  </span>
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 4 }}>
                  Các tài khoản và sản phẩm cùng loại bạn có thể quan tâm
                </p>
              </div>
              <Link
                href="/san-pham"
                style={{
                  fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)",
                  textDecoration: "none", display: "flex", alignItems: "center", gap: 4
                }}
              >
                Xem tất cả <ChevronLeft style={{ width: 14, height: 14, transform: "rotate(180deg)" }} />
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
              {relatedProducts.map(p => (
                <ProductCard key={`${p.product_type}-${p.id}`} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed", bottom: "2rem", right: "2rem", background: "var(--bg-card)",
          border: "1.5px solid #10B981", color: "var(--text)", padding: "0.875rem 1.5rem",
          borderRadius: 16, boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center",
          gap: "0.75rem", zIndex: 9999, pointerEvents: "none", animation: "fadeUp .3s ease"
        }}>
          <CheckCircle2 style={{ width: 20, height: 20, color: "#10B981" }} />
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "var(--bg)", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "var(--primary)", animation: "spin 1s linear infinite", margin: "0 auto 1.25rem" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ fontSize: "1rem", fontWeight: 600 }}>Đang tải sản phẩm...</div>
        </div>
      </div>
    }>
      <ProductDetailContent />
    </Suspense>
  );
}
