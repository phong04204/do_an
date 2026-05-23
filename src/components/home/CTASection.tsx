"use client";

export default function CTASection() {
  return (
    <>
      {/* CTA Banner */}
      <section style={{ padding: "1.5rem 0 2rem" }}>
        <div className="container-main">
          <div style={{
            borderRadius: "24px",
            background: "var(--bg-soft)",
            border: "1.5px solid var(--border)",
            padding: "3rem",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: "2rem", flexWrap: "wrap",
            boxShadow: "var(--shadow-card)"
          }}>
            <div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--text)", marginBottom: "0.5rem" }}>
                Sẵn sàng trải nghiệm dịch vụ?
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Tham gia cùng hàng nghìn khách hàng đang sử dụng tài khoản game chất lượng tại GameAcc.
              </p>

            </div>
            <div style={{
              width: "120px", height: "120px",
              background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.15))",
              borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}>
              <span style={{ fontSize: "4rem" }}>🎮</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
