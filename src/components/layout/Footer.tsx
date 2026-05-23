"use client";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <>
      <footer className="footer-bg" style={{ marginTop: "auto" }}>
        <div className="container-main" style={{ padding: "3rem 2rem 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2.5rem", marginBottom: "2.5rem" }}>
            {/* Brand */}
            <div>
              <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", textDecoration: "none", marginBottom: "0.875rem" }}>
                <span style={{ fontWeight: 900, fontSize: "1.35rem", color: "var(--primary)" }}>
                  GAME<span style={{ color: "#06B6D4" }}>ACC</span>
                </span>
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700, padding: "0.1rem 0.4rem",
                  background: "linear-gradient(135deg, var(--primary), #06B6D4)", color: "#fff",
                  borderRadius: "4px", marginLeft: "2px"
                }}>SHOP</span>
              </Link>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "1rem", maxWidth: "260px" }}>
                Nền tảng mua bán tài khoản game uy tín với chính sách bảo hành rõ ràng, xử lý tự động hoá 100%.
              </p>
              {/* Social icons */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[
                  { label: "Facebook", icon: "f" },
                  { label: "Telegram", icon: "t" },
                  { label: "Zalo", icon: "z" },
                  { label: "Discord", icon: "d" },
                ].map(s => (
                  <a key={s.label} href="#" title={s.label} style={{
                    width: "34px", height: "34px", borderRadius: "8px",
                    border: "1.5px solid var(--border)", background: "var(--bg-card)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)",
                    textDecoration: "none", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLElement).style.color = "var(--primary)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
                  >
                    {s.icon.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>

            {/* Dịch vụ */}
            <div>
              <h4 style={{ fontWeight: 700, color: "var(--text)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>DỊCH VỤ</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { label: "Trang Chủ", href: "/" },
                  { label: "Tất Cả Sản Phẩm", href: "/san-pham" },
                  { label: "Liên Minh Huyền Thoại", href: "/san-pham?cat=lol" },
                  { label: "VALORANT", href: "/san-pham?cat=valorant" },
                  { label: "Free Fire", href: "/san-pham?cat=freefire" },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                    >{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chính sách */}
            <div>
              <h4 style={{ fontWeight: 700, color: "var(--text)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>CHÍNH SÁCH & HỖ TRỢ</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { label: "Điều Khoản Dịch Vụ", href: "/terms" },
                  { label: "Bảo Mật Thông Tin", href: "/privacy" },
                  { label: "Chế Độ Bảo Hành", href: "/warranty" },
                  { label: "Hướng Dẫn Mua Hàng", href: "/guide" },
                  { label: "Khiếu Nại Giao Dịch", href: "/complaints" },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                    >{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Liên hệ */}
            <div>
              <h4 style={{ fontWeight: 700, color: "var(--text)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>THÔNG TIN LIÊN HỆ</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>Hotline / Zalo (24/7)</div>
                  <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.95rem" }}>0123 456 789</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>Email Hỗ Trợ</div>
                  <div style={{ fontWeight: 600, color: "var(--primary)", fontSize: "0.9rem" }}>support@gameacc.vn</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>Thương Hiệu</div>
                  <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.9rem" }}>GAMEACC.SHOP</div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </footer>

      {/* Zalo float button */}
      <a href="https://zalo.me" target="_blank" className="float-chat" title="Chat Zalo">
        <MessageCircle style={{ width: "26px", height: "26px" }} />
      </a>
    </>
  );
}
