"use client";
import { ShoppingCart, CreditCard, Package, CheckCircle, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: ShoppingCart,
    title: "1. Chọn Sản Phẩm",
    desc: "Khám phá hàng nghìn tài khoản game, thẻ cào hoặc giftcode VIP và thêm vào giỏ hàng.",
    gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    glow: "0 8px 24px rgba(59, 130, 246, 0.3)",
  },
  {
    step: "02",
    icon: CreditCard,
    title: "2. Thanh Toán Nhanh",
    desc: "Quét mã QR VNPay / Chuyển khoản ngân hàng 24/7 an toàn và hoàn toàn tự động.",
    gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    glow: "0 8px 24px rgba(139, 92, 246, 0.3)",
  },
  {
    step: "03",
    icon: Package,
    title: "3. Nhận Tài Khoản",
    desc: "Hệ thống tự động hiển thị mật khẩu, mã thẻ hoặc giftcode ngay tại màn hình sau 3 giây.",
    gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
    glow: "0 8px 24px rgba(6, 182, 212, 0.3)",
  },
  {
    step: "04",
    icon: CheckCircle,
    title: "4. Đổi Bảo Mật",
    desc: "Đăng nhập, đổi mật khẩu và liên kết thông tin cá nhân. Nhận bảo hành trọn đời 100%.",
    gradient: "linear-gradient(135deg, #10b981, #047857)",
    glow: "0 8px 24px rgba(16, 185, 129, 0.3)",
  },
];

export default function HowItWorks() {
  return (
    <section className="container-main" style={{ maxWidth: 1200, padding: "3.5rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.85rem", fontWeight: 900, color: "var(--text)", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
          Quy Trình Mua Bán <span style={{
            background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>Tự Động & An Toàn</span>
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", maxWidth: "520px", margin: "0 auto" }}>
          Quy trình mua hàng tối giản 4 bước, bàn giao thông tin tức thì và bảo mật thông tin tuyệt đối
        </p>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1.5rem", position: "relative"
      }}>
        {STEPS.map(({ step, icon: Icon, title, desc, gradient, glow }) => (
          <div
            key={step}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
              padding: "2rem 1.5rem", borderRadius: "22px", background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)", boxShadow: "0 8px 25px rgba(0,0,0,0.03)",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
          >
            {/* Step Icon */}
            <div style={{
              width: "64px", height: "64px", borderRadius: "18px",
              background: gradient, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: glow, marginBottom: "1.25rem", color: "#fff", position: "relative"
            }}>
              <Icon style={{ width: "30px", height: "30px" }} />
              <span style={{
                position: "absolute", top: -8, right: -8,
                background: "var(--bg-card)", border: "1px solid var(--border-light)",
                borderRadius: "99px", padding: "2px 7px", fontSize: "0.68rem", fontWeight: 800,
                color: "var(--primary)"
              }}>
                {step}
              </span>
            </div>

            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.5rem" }}>
              {title}
            </h3>
            <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
