"use client";
import { Users, ShoppingBag, CheckCircle, Clock } from "lucide-react";

const STATS = [
  { icon: Users,        value: "50.000+", label: "Game thủ tin cậy",      color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)",  border: "rgba(139, 92, 246, 0.2)" },
  { icon: ShoppingBag,  value: "120.000+", label: "Giao dịch thành công", color: "#ec4899", bg: "rgba(236, 72, 153, 0.1)", border: "rgba(236, 72, 153, 0.2)" },
  { icon: CheckCircle,  value: "99.8%",   label: "Đánh giá 5 sao",        color: "#10b981", bg: "rgba(16, 185, 129, 0.1)",  border: "rgba(16, 185, 129, 0.2)" },
  { icon: Clock,        value: "3 Giây",  label: "Bàn giao tự động 24/7", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.1)",   border: "rgba(6, 182, 212, 0.2)" },
];

export default function StatsSection() {
  return (
    <section className="container-main" style={{ maxWidth: 1200, paddingBottom: "2rem" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem"
      }}>
        {STATS.map(({ icon: Icon, value, label, color, bg, border }) => (
          <div
            key={label}
            style={{
              display: "flex", alignItems: "center", gap: "1rem",
              padding: "1.1rem 1.25rem", borderRadius: "18px",
              background: "var(--bg-card)", border: `1.5px solid ${border}`,
              boxShadow: "0 6px 20px rgba(0,0,0,0.04)", transition: "transform 0.2s"
            }}
          >
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px",
              background: bg, display: "flex", alignItems: "center", justifyContent: "center",
              color: color, flexShrink: 0
            }}>
              <Icon style={{ width: "22px", height: "22px" }} />
            </div>
            <div>
              <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--text)", lineHeight: 1.1 }}>{value}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px", fontWeight: 600 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
