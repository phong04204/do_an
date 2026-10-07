"use client";
import { Filter, Check, RotateCcw, ShieldCheck, Zap, Headphones } from "lucide-react";

interface PriceRange {
  min: number;
  max: number;
}

interface FilterSidebarProps {
  priceFilters: { label: string; min: number; max: number }[];
  typeFilters: string[];
  currentPriceRange: PriceRange | null;
  selectedTypes: string[];
  onPriceChange: (range: PriceRange | null) => void;
  onTypeToggle: (type: string) => void;
  onClearAll: () => void;
  activeProductType?: "account" | "card" | "giftcode";
}

export default function FilterSidebar({
  priceFilters,
  typeFilters,
  currentPriceRange,
  selectedTypes,
  onPriceChange,
  onTypeToggle,
  onClearAll,
  activeProductType
}: FilterSidebarProps) {
  const hasActiveFilters = Boolean(currentPriceRange || selectedTypes.length > 0);
  const activeCount = (currentPriceRange ? 1 : 0) + selectedTypes.length;

  return (
    <aside style={{ position: "sticky", top: "90px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Main Filter Card */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: "20px",
        padding: "1.5rem",
        boxShadow: "var(--shadow-card)",
        transition: "box-shadow 0.2s"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "1rem",
          marginBottom: "1.25rem",
          borderBottom: "1px solid var(--border-light)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text)" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "rgba(124, 58, 237, 0.1)", color: "var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Filter style={{ width: "16px", height: "16px" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, letterSpacing: "-0.01em", margin: 0 }}>
                BỘ LỌC TÌM KIẾM
              </h3>
              {hasActiveFilters && (
                <span style={{ fontSize: "0.72rem", color: "var(--primary)", fontWeight: 600 }}>
                  Đang lọc {activeCount} tiêu chí
                </span>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              title="Đặt lại bộ lọc"
              style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                background: "none", border: "none", color: "var(--text-muted)",
                fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                padding: "4px 8px", borderRadius: "6px", transition: "all 0.15s"
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
            >
              <RotateCcw style={{ width: "12px", height: "12px" }} />
              Xóa
            </button>
          )}
        </div>

        {/* Price Range */}
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{
            fontSize: "0.8rem", fontWeight: 750, color: "var(--text)",
            textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.75rem"
          }}>
            Khoảng Giá
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {priceFilters.map((f, i) => {
              const isActive = currentPriceRange?.min === f.min && currentPriceRange?.max === f.max;
              return (
                <button
                  key={i}
                  onClick={() => onPriceChange(isActive ? null : { min: f.min, max: f.max })}
                  style={{
                    padding: "0.65rem 0.85rem",
                    borderRadius: "10px",
                    border: "1.5px solid",
                    borderColor: isActive ? "var(--primary)" : "var(--border-light)",
                    background: isActive ? "rgba(124, 58, 237, 0.08)" : "var(--bg-soft)",
                    color: isActive ? "var(--primary)" : "var(--text)",
                    fontSize: "0.82rem",
                    fontWeight: isActive ? 700 : 550,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.35)";
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.borderColor = "var(--border-light)";
                  }}
                >
                  <span>{f.label}</span>
                  {isActive && (
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)" }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Account / Product Subtype */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{
            fontSize: "0.8rem", fontWeight: 750, color: "var(--text)",
            textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.75rem"
          }}>
            {activeProductType === "card"
              ? "Mệnh Giá Thẻ"
              : activeProductType === "giftcode"
              ? "Loại Vật Phẩm"
              : "Phân Loại Acc"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {typeFilters.map((t, i) => {
              const isActive = selectedTypes.includes(t);
              return (
                <label
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.65rem",
                    borderRadius: "8px",
                    background: isActive ? "rgba(124, 58, 237, 0.05)" : "transparent",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg-soft)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{
                    fontSize: "0.84rem",
                    color: isActive ? "var(--primary)" : "var(--text)",
                    fontWeight: isActive ? 700 : 500
                  }}>
                    {t}
                  </span>
                  <div style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "5px",
                    border: "2px solid",
                    borderColor: isActive ? "var(--primary)" : "var(--border)",
                    background: isActive ? "var(--primary)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease"
                  }}>
                    {isActive && <Check style={{ width: "12px", height: "12px", color: "#fff", strokeWidth: 3 }} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => onTypeToggle(t)}
                    style={{ display: "none" }}
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Clear Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            style={{
              width: "100%",
              padding: "0.65rem",
              borderRadius: "10px",
              border: "1.5px solid var(--border-light)",
              color: "var(--text-muted)",
              fontSize: "0.82rem",
              fontWeight: 650,
              cursor: "pointer",
              background: "var(--bg-soft)",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.color = "var(--primary)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border-light)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <RotateCcw style={{ width: "13px", height: "13px" }} />
            Xóa tất cả bộ lọc ({activeCount})
          </button>
        )}
      </div>

      {/* Trust Mini Card */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: "18px",
        padding: "1.25rem",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
      }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 750, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.85rem" }}>
          Cam Kết Mua Hàng
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <Zap style={{ width: "15px", height: "15px", color: "#F59E0B", flexShrink: 0 }} />
            <span>Bàn giao tự động chỉ trong <strong>3s</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <ShieldCheck style={{ width: "15px", height: "15px", color: "#10B981", flexShrink: 0 }} />
            <span>Bảo hành <strong>1 đổi 1</strong> trọn đời</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <Headphones style={{ width: "15px", height: "15px", color: "var(--primary)", flexShrink: 0 }} />
            <span>Hỗ trợ kỹ thuật <strong>24/7</strong></span>
          </div>
        </div>
      </div>
    </aside>
  );
}
