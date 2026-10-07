"use client";
import { useState, useEffect } from "react";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import ProductCarousel from "@/components/home/ProductCarousel";
import HowItWorks from "@/components/home/HowItWorks";
import CTASection from "@/components/home/CTASection";
import Link from "next/link";
import {
  ShieldCheck, Zap, Headphones, ChevronRight,
  Gamepad2, CreditCard, Gift, Flame, Sparkles, Lock,
  ArrowRight, Check
} from "lucide-react";
import apiClient from "@/lib/api-client";
import ProductCard, { Product } from "@/components/products/ProductCard";

// ── Mock data fallback ────────────────────────────────────────────────────
const FALLBACK_FEATURED = [
  { id: 20, name: "FC Online - Đội Hình Real Madrid 350.000 Tỷ BP - Full ICON TM", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600", price: 2450000, oldPrice: 3500000, rating: 5.0, sold: 18, badge: "HOT", category: "FC Online", product_type: "account" as const },
  { id: 21, name: "Genshin Impact AR 60 - C6R5 Hu Tao + C6 Furina + C2 Raiden Shogun", image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80", price: 2890000, oldPrice: 4200000, rating: 5.0, sold: 14, badge: "VIP", category: "Genshin", product_type: "account" as const },
  { id: 23, name: "VALORANT Radiant Server APAC - Full Bundle Kuronami + Reaver", image: "https://media.valorant-api.com/playercards/1a127cbf-4131-3581-da59-529b7e0d9495/wideart.png", price: 3150000, oldPrice: 4500000, rating: 5.0, sold: 26, badge: "TOP", category: "VALORANT", product_type: "account" as const },
  { id: 24, name: "LMHT Thách Đấu Máy Chủ VN - 550+ Trang Phục - 25 Skin Hàng Hiệu", image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_14.jpg", price: 1950000, oldPrice: 2800000, rating: 4.9, sold: 31, badge: "HOT", category: "LMHT", product_type: "account" as const },
  { id: 25, name: "PUBG Mobile Chiến Thần - M416 Băng Tuyết Lv8 + Siêu Xe Koenigsegg", image: "/images/accounts/pubg_m416_glacier.jpg", price: 3800000, oldPrice: 5500000, rating: 5.0, sold: 19, badge: "VIP", category: "PUBG", product_type: "account" as const },
  { id: 26, name: "Free Fire Quỷ Dạ Xoa - Full 10 Súng Tiến Hóa Max Lv7", image: "/images/accounts/ff_mp40_cobra.jpg", price: 3200000, oldPrice: 4800000, rating: 5.0, sold: 42, badge: "HOT", category: "Free Fire", product_type: "account" as const },
];

const POPULAR_CARDS = [
  { name: "Thẻ Garena 100.000đ", discount: "5%", price: "95.000đ", oldPrice: "100.000đ", icon: "🔥", link: "/san-pham?type=card" },
  { name: "Thẻ Garena 200.000đ", discount: "5%", price: "190.000đ", oldPrice: "200.000đ", icon: "⚡", link: "/san-pham?type=card" },
  { name: "Thẻ Zing VNG 200.000đ", discount: "5%", price: "190.000đ", oldPrice: "200.000đ", icon: "⭐", link: "/san-pham?type=card" },
  { name: "Thẻ Zing VNG 500.000đ", discount: "5%", price: "475.000đ", oldPrice: "500.000đ", icon: "💎", link: "/san-pham?type=card" },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>(FALLBACK_FEATURED);
  const [latestAccounts, setLatestAccounts] = useState<Product[]>([]);

  useEffect(() => {
    // 1. Fetch featured accounts
    apiClient.get("/game-accounts")
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.slice(0, 8).map((a: any) => ({
            id: a.id,
            name: a.title,
            image: Array.isArray(a.images) && a.images.length > 0
              ? a.images[0]
              : "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80",
            price: Number(a.price),
            oldPrice: Math.round(Number(a.price) * 1.35),
            rating: 5.0,
            sold: Math.floor(Math.random() * 20) + 5,
            badge: Number(a.price) > 1500000 ? "VIP" : "HOT",
            category: "Tài khoản",
            product_type: "account" as const
          }));
          setFeatured(mapped);
          setLatestAccounts(mapped.slice(0, 4));
        }
      })
      .catch(err => {
        console.error("Failed to fetch featured accounts on home page:", err);
      });
  }, []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* 1. HERO SECTION (Visual stage + Search + Quick Game Tags) */}
      <HeroSection />

      {/* 2. STATS BAR (Social proof metrics) */}
      <StatsSection />

      {/* 3. THREE MAIN SHOPPING CATEGORY PORTALS */}
      <section className="container-main" style={{ maxWidth: 1200, padding: "1.5rem 1rem 3rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(124, 58, 237, 0.08)", border: "1px solid rgba(124, 58, 237, 0.2)",
            borderRadius: 99, padding: "4px 14px", fontSize: "0.75rem", fontWeight: 800,
            color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8
          }}>
            <Sparkles size={13} />
            Hệ sinh thái sản phẩm
          </div>
          <h2 style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>
            Danh Mục Dịch Vụ Nổi Bật
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: 6, maxWidth: 540, margin: "6px auto 0" }}>
            Lựa chọn loại sản phẩm game chất lượng, giao dịch tự động và uy tín hàng đầu
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem"
        }}>
          {/* Card 1: Game Accounts */}
          <div
            className="card"
            style={{
              padding: "2.25rem 1.85rem",
              borderRadius: "24px",
              background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{
              position: "absolute", top: 0, right: 0, width: "120px", height: "120px",
              background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
              pointerEvents: "none"
            }} />

            <div>
              <div style={{
                width: "56px", height: "56px", borderRadius: "18px",
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.08))",
                color: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1.5rem", border: "1px solid rgba(139, 92, 246, 0.3)"
              }}>
                <Gamepad2 style={{ width: "28px", height: "28px" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text)", margin: 0 }}>
                  Tài Khoản Game VIP
                </h3>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, background: "rgba(139, 92, 246, 0.15)", color: "var(--primary)", padding: "2px 7px", borderRadius: 99 }}>
                  HOT NHẤT
                </span>
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.75rem" }}>
                Kho tài khoản đa dạng FC Online, LMHT, VALORANT, Genshin, Free Fire, Liên Quân. Rank cao, skin báu vật, thông tin trắng và bảo hành 1 đổi 1.
              </p>
            </div>
            <Link
              href="/san-pham?type=account"
              className="btn-primary"
              style={{
                padding: "0.85rem 1.5rem", borderRadius: "14px", textAlign: "center",
                fontSize: "0.92rem", fontWeight: 800, textDecoration: "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}
            >
              <span>Xem Kho Tài Khoản</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 2: Game Cards */}
          <div
            className="card"
            style={{
              padding: "2.25rem 1.85rem",
              borderRadius: "24px",
              background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{
              position: "absolute", top: 0, right: 0, width: "120px", height: "120px",
              background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
              pointerEvents: "none"
            }} />

            <div>
              <div style={{
                width: "56px", height: "56px", borderRadius: "18px",
                background: "linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(244, 63, 94, 0.08))",
                color: "#EC4899", display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1.5rem", border: "1px solid rgba(236, 72, 153, 0.3)"
              }}>
                <CreditCard style={{ width: "28px", height: "28px" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text)", margin: 0 }}>
                  Thẻ Cào Game Giá Sỉ
                </h3>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, background: "rgba(236, 72, 153, 0.15)", color: "#EC4899", padding: "2px 7px", borderRadius: 99 }}>
                  GIẢM 5%
                </span>
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.75rem" }}>
                Kho thẻ nạp sỉ lẻ Garena, Zing VNG, VTC Vcoin, Gate, Viettel chiết khấu cực cao. Trả mã nạp và số seri tự động an toàn bảo mật tức thì.
              </p>
            </div>
            <Link
              href="/san-pham?type=card"
              style={{
                padding: "0.85rem 1.5rem", borderRadius: "14px", textAlign: "center",
                fontSize: "0.92rem", fontWeight: 800, textDecoration: "none", color: "#fff",
                background: "linear-gradient(135deg, #EC4899, #F43F5E)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 6px 20px rgba(236, 72, 153, 0.3)"
              }}
            >
              <span>Mua Thẻ Nạp Ngay</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 3: Giftcodes & Items */}
          <div
            className="card"
            style={{
              padding: "2.25rem 1.85rem",
              borderRadius: "24px",
              background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{
              position: "absolute", top: 0, right: 0, width: "120px", height: "120px",
              background: "radial-gradient(circle, rgba(234,179,8,0.15) 0%, transparent 70%)",
              pointerEvents: "none"
            }} />

            <div>
              <div style={{
                width: "56px", height: "56px", borderRadius: "18px",
                background: "linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.08))",
                color: "#EAB308", display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1.5rem", border: "1px solid rgba(234, 179, 8, 0.3)"
              }}>
                <Gift style={{ width: "28px", height: "28px" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text)", margin: 0 }}>
                  Vật Phẩm & Giftcode
                </h3>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, background: "rgba(234, 179, 8, 0.15)", color: "#EAB308", padding: "2px 7px", borderRadius: 99 }}>
                  ĐỘC QUYỀN
                </span>
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.75rem" }}>
                Code 5.000 Nguyên Thạch Genshin, 1.500 Quân Huy Liên Quân, Kim Cương Free Fire, VP Valorant nạp cực nhanh qua cổng đổi thưởng chính thức.
              </p>
            </div>
            <Link
              href="/san-pham?type=giftcode"
              style={{
                padding: "0.85rem 1.5rem", borderRadius: "14px", textAlign: "center",
                fontSize: "0.92rem", fontWeight: 800, textDecoration: "none", color: "#fff",
                background: "linear-gradient(135deg, #EAB308, #CA8A04)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 6px 20px rgba(234, 179, 8, 0.3)"
              }}
            >
              <span>Săn Giftcode VIP</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS CAROUSEL */}
      <section style={{ padding: "1rem 0" }}>
        <ProductCarousel
          title="Tài Khoản Game Tuyển Chọn"
          subtitle="Các tài khoản rank cao, skin VIP được bảo hành trọn đời"
          products={featured}
          viewAllHref="/san-pham"
        />
      </section>

      {/* 5. QUICK GAME CARDS SHOWCASE (Thẻ nạp chiết khấu nhanh) */}
      <section className="container-main" style={{ maxWidth: 1200, padding: "3rem 1rem" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)",
          border: "1.5px solid rgba(124, 58, 237, 0.2)", borderRadius: "24px", padding: "2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 10 }}>
            <div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span>Thẻ Nạp Nhanh Chiết Khấu Cao</span>
                <span style={{ fontSize: "0.75rem", background: "rgba(239,68,68,0.15)", color: "#ef4444", padding: "3px 8px", borderRadius: 6, fontWeight: 800 }}>
                  GIẢM 5%
                </span>
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.86rem", marginTop: 4 }}>
                Nhận số seri và mã cào trực tiếp trên màn hình ngay sau khi thanh toán
              </p>
            </div>
            <Link
              href="/san-pham?type=card"
              style={{
                fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)",
                textDecoration: "none", display: "flex", alignItems: "center", gap: 4
              }}
            >
              Xem tất cả mệnh giá <ChevronRight size={15} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {POPULAR_CARDS.map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--bg-card)", border: "1px solid var(--border-light)",
                  borderRadius: "16px", padding: "1.25rem", display: "flex", flexDirection: "column",
                  justifyContent: "space-between", gap: 12, transition: "transform 0.2s, border-color 0.2s"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: "1.2rem" }}>{card.icon}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "rgba(16, 185, 129, 0.12)", color: "#10B981", padding: "2px 8px", borderRadius: 99 }}>
                      Tiết kiệm {card.discount}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text)", marginBottom: 6 }}>
                    {card.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--primary)" }}>
                      {card.price}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                      {card.oldPrice}
                    </span>
                  </div>
                </div>
                <Link
                  href={card.link}
                  style={{
                    display: "block", textAlign: "center", padding: "0.65rem",
                    borderRadius: "10px", background: "rgba(124, 58, 237, 0.08)",
                    border: "1px solid rgba(124, 58, 237, 0.2)", color: "var(--primary)",
                    fontSize: "0.85rem", fontWeight: 700, textDecoration: "none",
                    transition: "all 0.15s"
                  }}
                >
                  Mua Ngay
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (Quy trình mua bán an toàn 4 bước) */}
      <HowItWorks />

      {/* 7. TRUST BADGES & GUARANTEES (4 balanced columns) */}
      <section className="container-main" style={{ maxWidth: 1200, padding: "1rem 1rem 3.5rem" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem"
        }}>
          {[
            {
              icon: <ShieldCheck size={26} />,
              color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)",
              title: "Bảo hành trọn đời",
              desc: "Cam kết hoàn tiền 100% hoặc đổi mới nếu tài khoản có tranh chấp"
            },
            {
              icon: <Zap size={26} />,
              color: "#06B6D4", bg: "rgba(6, 182, 212, 0.1)",
              title: "Giao hàng 3 giây",
              desc: "Hệ thống tự động hiển thị tài khoản ngay sau khi thanh toán"
            },
            {
              icon: <Lock size={26} />,
              color: "#10B981", bg: "rgba(16, 185, 129, 0.1)",
              title: "Thông tin trắng 100%",
              desc: "Chưa liên kết SĐT/CCCD, dễ dàng đổi mật khẩu và cài 2FA cá nhân"
            },
            {
              icon: <Headphones size={26} />,
              color: "#EC4899", bg: "rgba(236, 72, 153, 0.1)",
              title: "Hỗ trợ 24/7",
              desc: "Đội ngũ kỹ thuật viên trực tuyến sẵn sàng giải đáp thắc mắc liên tục"
            },
          ].map((b, i) => (
            <div
              key={i}
              style={{
                padding: "1.75rem 1.5rem", borderRadius: "20px",
                background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                display: "flex", gap: "1rem", alignItems: "flex-start",
                boxShadow: "0 6px 20px rgba(0,0,0,0.03)"
              }}
            >
              <div style={{
                width: "50px", height: "50px", borderRadius: "14px",
                background: b.bg, display: "flex", alignItems: "center", justifyContent: "center",
                color: b.color, flexShrink: 0
              }}>
                {b.icon}
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: "var(--text)", marginBottom: "0.25rem", fontSize: "1rem" }}>
                  {b.title}
                </h4>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CALL TO ACTION SECTION */}
      <CTASection />
    </div>
  );
}
