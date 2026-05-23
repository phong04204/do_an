"use client";
import { Filter, Check } from "lucide-react";

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
  return (
    <aside style={{ position: "sticky", top: "100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--text)" }}>
        <Filter style={{ width: "20px", height: "20px" }} />
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>BỘ LỌC TÌM KIẾM</h3>
      </div>
      {/* Price Range */}
      <div style={{ marginBottom: "2rem" }}>
        <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>KHOẢNG GIÁ</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {priceFilters.map((f, i) => {
            const isActive = currentPriceRange?.min === f.min && currentPriceRange?.max === f.max;
            return (
              <button 
                key={i} 
                onClick={() => onPriceChange(isActive ? null : { min: f.min, max: f.max })}
                style={{
                  padding: "0.6rem 0.8rem", borderRadius: "10px", border: "1.5px solid",
                  borderColor: isActive ? "var(--primary)" : "var(--border-light)",
                  background: isActive ? "rgba(124,58,237,0.05)" : "var(--bg-soft)",
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                  fontSize: "0.85rem", fontWeight: 600, textAlign: "left", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Account Type */}
      <div style={{ marginBottom: "2rem" }}>
        <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
          {activeProductType === "card" 
            ? "MỆNH GIÁ THẺ" 
            : activeProductType === "giftcode" 
            ? "LOẠI VẬT PHẨM" 
            : "LOẠI TÀI KHOẢN"}
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {typeFilters.map((t, i) => {
            const isActive = selectedTypes.includes(t);
            return (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", userSelect: "none" }}>
                <div style={{
                  width: "18px", height: "18px", borderRadius: "4px", border: "2px solid",
                  borderColor: isActive ? "var(--primary)" : "var(--border)",
                  background: isActive ? "var(--primary)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
                }}>
                  {isActive && <Check style={{ width: "12px", height: "12px", color: "#fff" }} />}
                </div>
                <input type="checkbox" checked={isActive} onChange={() => onTypeToggle(t)} style={{ display: "none" }} />
                <span style={{ 
                  fontSize: "0.875rem", 
                  color: isActive ? "var(--text)" : "var(--text-muted)", 
                  fontWeight: isActive ? 600 : 500 
                }}>{t}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Clear All */}
      <button 
        onClick={onClearAll} 
        style={{
          width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1.5px solid var(--border)",
          color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", background: "none",
          transition: "all 0.2s"
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--text-light)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        Xóa tất cả bộ lọc
      </button>
    </aside>
  );
}
