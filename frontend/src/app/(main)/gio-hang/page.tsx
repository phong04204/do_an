"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  ShoppingCart,
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Plus,
  Minus,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";

function formatPrice(p: number) {
  return p.toLocaleString("vi-VN") + "đ";
}

function BrandThumbnail({ name, productType }: { name: string; productType?: string }) {
  const n = name.toLowerCase();
  let bg = "#6366f1", text = "GC";
  if (n.includes("garena"))                    { bg = "#FF6B00"; text = "GAR"; }
  else if (n.includes("zing"))                 { bg = "#E5002B"; text = "ZING"; }
  else if (n.includes("vcoin") || n.includes("vtc")) { bg = "#7B0EA0"; text = "VTC"; }
  else if (n.includes("gate"))                 { bg = "#0080FF"; text = "GATE"; }
  else if (n.includes("valorant") || n.includes("vpoints")) { bg = "#FF4655"; text = "VAL"; }
  else if (n.includes("free fire") || (n.includes("kim cương") && productType === "giftcode")) { bg = "#FF6B00"; text = "FF"; }
  else if (n.includes("genshin"))              { bg = "#C8A84B"; text = "GI"; }
  else if (n.includes("liên quân"))            { bg = "#0066CC"; text = "LQ"; }
  else if (productType === "giftcode")         { bg = "#8B5CF6"; text = "GC"; }
  else                                          { bg = "#0ea5e9"; text = "CARD"; }

  return (
    <div style={{
      width: "90px", height: "90px", borderRadius: "12px",
      background: `linear-gradient(135deg, ${bg} 0%, ${bg}99 100%)`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      boxShadow: `0 4px 14px ${bg}55`,
    }}>
      <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff", letterSpacing: "0.05em" }}>
        {text}
      </span>
    </div>
  );
}

const TYPE_BADGE = {
  account:  { label: "Tài khoản", bg: "#EF4444", color: "#fff" },
  card:     { label: "Thẻ cào",   bg: "#3B82F6", color: "#fff" },
  giftcode: { label: "Giftcode",  bg: "#8B5CF6", color: "#fff" },
} as const;

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { items, addItem, decreaseItem, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  // Sync selectedIds when items list changes (new items auto-selected, removed items dropped)
  useEffect(() => {
    setSelectedIds(prev => {
      const validIds = new Set(items.map(i => i.id));
      const next = new Set<number>();
      // Keep existing selections that are still valid
      prev.forEach(id => { if (validIds.has(id)) next.add(id); });
      // Auto-select newly added items (ones not in prev)
      items.forEach(i => { if (!prev.has(i.id) && mounted) next.add(i.id); });
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = items.length > 0 && items.every(i => selectedIds.has(i.id));
  const someSelected = items.some(i => selectedIds.has(i.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const handleRemove = (id: number) => {
    removeItem(id);
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  const handleClearCart = () => {
    clearCart();
    setSelectedIds(new Set());
  };

  if (!mounted) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div className="skeleton" style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 1rem" }} />
          <div className="skeleton" style={{ width: "120px", height: "20px", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  const selectedItems = items.filter(i => selectedIds.has(i.id));
  const subtotal = selectedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const finalTotal = subtotal;

  // ── EMPTY CART ──────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div style={{
        background: "var(--bg)", minHeight: "85vh",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 0",
      }}>
        <div className="container-main" style={{ maxWidth: "600px", textAlign: "center" }}>
          <div className="card animate-fade-in-up" style={{
            padding: "4rem 2rem", display: "flex", flexDirection: "column",
            alignItems: "center", gap: "1.5rem",
            background: "var(--gradient-card)", border: "1.5px dashed var(--border)",
          }}>
            <div style={{
              width: "100px", height: "100px", borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.15) 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--primary)", boxShadow: "0 8px 32px rgba(124, 58, 237, 0.1)",
              animation: "float 4s ease-in-out infinite",
            }}>
              <ShoppingCart style={{ width: "42px", height: "42px" }} />
            </div>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 900, marginBottom: "0.5rem" }}>Giỏ Hàng Trống!</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "400px", margin: "0 auto", lineHeight: 1.6 }}>
                Bạn chưa chọn bất kỳ sản phẩm nào vào giỏ hàng. Hãy khám phá hàng ngàn sản phẩm game cực chất của chúng tôi nhé!
              </p>
            </div>
            <Link href="/san-pham" className="btn-primary" style={{ marginTop: "1rem", padding: "0.85rem 2.25rem", borderRadius: "12px" }}>
              <ArrowLeft style={{ width: "18px", height: "18px" }} /> Quay lại cửa hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── FILLED CART ──────────────────────────────────────────────────────
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "2.5rem 0 5rem" }}>
      <div className="container-main animate-fade-in">

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", fontSize: "0.875rem" }}>
          <Link href="/san-pham" style={{ color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <ArrowLeft style={{ width: "16px", height: "16px" }} /> Cửa hàng
          </Link>
          <span style={{ color: "var(--text-light)" }}>/</span>
          <span style={{ color: "var(--text)", fontWeight: 600 }}>Giỏ hàng</span>
        </div>

        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.75rem" }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: "2.25rem", fontWeight: 900, letterSpacing: "-0.03em" }}>
              Giỏ Hàng Của Bạn
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Đang có <strong style={{ color: "var(--primary)" }}>{items.length}</strong> sản phẩm trong giỏ hàng
            </p>
          </div>
          <button
            onClick={handleClearCart}
            style={{
              background: "none", border: "none", color: "#EF4444",
              fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "0.3rem",
            }}
          >
            <Trash2 style={{ width: "15px", height: "15px" }} /> Xóa tất cả
          </button>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "2rem", alignItems: "start" }}>

          {/* ── LEFT COLUMN: Cart items (70%) ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Select-all row */}
            <div style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.75rem 1.25rem",
              background: "var(--bg-card)", borderRadius: "12px",
              border: "1px solid var(--border-light)",
            }}>
              {/* Checkbox */}
              <div
                onClick={toggleAll}
                style={{
                  width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
                  background: allSelected ? "var(--primary)" : someSelected ? "var(--primary)" : "transparent",
                  border: (allSelected || someSelected) ? "none" : "2px solid #94a3b8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {allSelected && (
                  <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                    <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {someSelected && !allSelected && (
                  <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
                    <path d="M1 1H9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", cursor: "pointer", userSelect: "none" }} onClick={toggleAll}>
                Chọn tất cả
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "auto" }}>
                Đã chọn <strong style={{ color: "var(--primary)" }}>{selectedIds.size}</strong>/{items.length} sản phẩm
              </span>
            </div>

            {items.map((item) => {
              const pType = (item.product_type) || "account";
              const badge = TYPE_BADGE[pType] ?? TYPE_BADGE.account;
              const isAccount = pType === "account";
              const isSelected = selectedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    gap: "1.25rem",
                    alignItems: "center",
                    background: isSelected ? "var(--bg-card)" : "var(--bg-soft)",
                    border: isSelected ? "1.5px solid var(--primary)" : "1.5px solid var(--border-light)",
                    opacity: isSelected ? 1 : 0.65,
                    transition: "all 0.2s",
                  }}
                >
                  {/* Checkbox */}
                  <div
                    onClick={() => toggleSelect(item.id)}
                    style={{
                      width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
                      background: isSelected ? "var(--primary)" : "transparent",
                      border: isSelected ? "none" : "2px solid #94a3b8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {isSelected && (
                      <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                        <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div style={{ width: "90px", height: "90px", borderRadius: "12px", overflow: "hidden", flexShrink: 0, border: "1px solid var(--border-light)" }}>
                    {isAccount
                      ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <BrandThumbnail name={item.name} productType={pType} />
                    }
                  </div>

                  {/* Product info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: "1rem", fontWeight: 700, color: "var(--text)",
                      lineHeight: 1.4, marginBottom: "0.5rem",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {item.name}
                    </h3>
                    <span style={{
                      display: "inline-block",
                      padding: "0.2rem 0.65rem",
                      borderRadius: "5px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      background: badge.bg,
                      color: badge.color,
                      letterSpacing: "0.04em",
                    }}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Quantity + Price + Delete */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexShrink: 0 }}>

                    {/* Quantity */}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.35rem", letterSpacing: "0.04em" }}>
                        SỐ LƯỢNG
                      </div>
                      {isAccount ? (
                        <div style={{
                          fontSize: "0.75rem", fontWeight: 700, color: "var(--text-light)",
                          background: "var(--bg-muted)", padding: "0.3rem 0.75rem",
                          borderRadius: "6px", whiteSpace: "nowrap",
                        }}>
                          Độc nhất
                        </div>
                      ) : (
                        <div style={{
                          display: "flex", alignItems: "center",
                          border: "1.5px solid var(--border)", borderRadius: "8px", overflow: "hidden",
                        }}>
                          <button
                            onClick={() => decreaseItem(item.id)}
                            style={{
                              width: "30px", height: "30px",
                              background: "var(--bg-soft)", border: "none",
                              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                              color: "var(--text-muted)",
                            }}
                          >
                            <Minus style={{ width: "12px", height: "12px" }} />
                          </button>
                          <span style={{
                            minWidth: "34px", textAlign: "center",
                            fontSize: "0.9rem", fontWeight: 700, color: "var(--text)",
                          }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addItem(item)}
                            style={{
                              width: "30px", height: "30px",
                              background: "var(--bg-soft)", border: "none",
                              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                              color: "var(--text-muted)",
                            }}
                          >
                            <Plus style={{ width: "12px", height: "12px" }} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: "right", minWidth: "100px" }}>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.35rem", letterSpacing: "0.04em" }}>
                        GIÁ TIỀN
                      </div>
                      <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--primary)" }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      title="Xóa khỏi giỏ hàng"
                      style={{
                        width: "34px", height: "34px", borderRadius: "8px",
                        border: "1px solid #FEE2E2", background: "#FEF2F2",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", color: "#EF4444", flexShrink: 0,
                      }}
                    >
                      <Trash2 style={{ width: "15px", height: "15px" }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── RIGHT COLUMN: Order summary sticky (30%) ── */}
          <div style={{ position: "sticky", top: "88px", display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Summary card */}
            <div className="card" style={{ padding: "1.5rem", background: "var(--bg-card)" }}>

              {/* Price breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>
                    Tạm tính ({selectedItems.reduce((a, i) => a + i.quantity, 0)} sản phẩm đã chọn)
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{formatPrice(subtotal)}</span>
                </div>

                {/* Total */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingTop: "0.85rem", borderTop: "1.5px dashed var(--border-light)",
                }}>
                  <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text)" }}>Tổng tiền</span>
                  <span style={{
                    fontWeight: 900, fontSize: "1.65rem",
                    background: "linear-gradient(135deg, #f97316, #ef4444)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={() => selectedIds.size > 0 && router.push("/checkout")}
                disabled={selectedIds.size === 0}
                style={{
                  width: "100%", padding: "1rem 0.5rem",
                  background: selectedIds.size > 0
                    ? "linear-gradient(135deg, #f97316 0%, #ef4444 100%)"
                    : "var(--bg-muted)",
                  border: "none", borderRadius: "12px",
                  color: selectedIds.size > 0 ? "#fff" : "var(--text-muted)",
                  fontSize: "0.95rem", fontWeight: 800,
                  cursor: selectedIds.size > 0 ? "pointer" : "not-allowed",
                  letterSpacing: "0.05em",
                  boxShadow: selectedIds.size > 0 ? "0 6px 24px rgba(249, 115, 22, 0.4)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  transition: "opacity 0.2s, transform 0.15s",
                }}
                onMouseEnter={e => { if (selectedIds.size > 0) { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <CreditCard style={{ width: "19px", height: "19px" }} />
                {selectedIds.size > 0 ? "TIẾN HÀNH THANH TOÁN NGAY" : "Chưa chọn sản phẩm"}
                {selectedIds.size > 0 && <ChevronRight style={{ width: "17px", height: "17px" }} />}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
