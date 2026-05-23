"use client";
import HeroSection from "@/components/home/HeroSection";
import ProductCarousel from "@/components/home/ProductCarousel";
import CTASection from "@/components/home/CTASection";
import Link from "next/link";
import { ShieldCheck, Zap, PhoneCall, ChevronRight, Gamepad2, CreditCard, Gift } from "lucide-react";

// ── Mock data ─────────────────────────────────────────────────────────────
const FEATURED = [
  { id: 1,  name: "Acc LMHT Rank Kim Cương - Full tướng + 100 skin", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80", price: 450000, oldPrice: 900000, rating: 5.0, sold: 12, badge: "HOT", category: "lol" },
  { id: 10, name: "Acc VALORANT Bất Tử - 15+ Agent, Full súng", image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&q=80", price: 850000, oldPrice: 1500000, rating: 5.0, sold: 7, badge: "VIP", category: "valorant" },
  { id: 19, name: "Acc Free Fire Full - 1000+ skin, Kim Cương VIP", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80", price: 250000, oldPrice: 500000, rating: 5.0, sold: 54, badge: "NEW", category: "freefire" },
  { id: 30, name: "Acc Genshin Impact AR55 - C6 Hu Tao + Yelan", image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80", price: 1800000, oldPrice: 3000000, rating: 5.0, sold: 4, badge: "TOP", category: "genshin" },
  { id: 2,  name: "Acc LMHT Thách Đấu - Full tướng mùa 14", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80", price: 120000, rating: 4.9, sold: 5, category: "lol" },
  { id: 14, name: "Acc VALORANT Kim Cương - Skin siêu phẩm", image: "https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=400&q=80", price: 650000, oldPrice: 1200000, rating: 5.0, sold: 3, category: "valorant" },
];

export default function HomePage() {
  return (
    <div style={{ background: "var(--bg)", paddingBottom: "1rem" }}>
      <HeroSection />



      {/* Shopping Categories Showcase Grid */}
      <div className="container-main" style={{ padding: "2rem 1rem 3rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--text)", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>Danh Mục Mua Sắm Game</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Lựa chọn các loại sản phẩm game chất lượng, giao dịch tự động và uy tín hàng đầu</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {/* Card 1: Accounts */}
          <div className="card" style={{ 
            padding: "2rem 1.5rem", 
            borderRadius: "24px", 
            background: "var(--bg-soft)", 
            border: "1.5px solid var(--border-light)", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
          }}>
            <div>
              <div style={{ 
                width: "56px", height: "56px", borderRadius: "16px", 
                background: "rgba(139, 92, 246, 0.1)", color: "#8B5CF6", 
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" 
              }}>
                <Gamepad2 style={{ width: "28px", height: "28px" }} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.75rem" }}>Tài Khoản Game VIP</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                Mua bán tài khoản game đa dạng (Liên Minh, VALORANT, Genshin Impact, Free Fire) rank cao, skin VIP, thông tin trắng an toàn và bảo hành trọn đời 100%.
              </p>
            </div>
            <Link href="/san-pham?type=account" className="btn-primary" style={{ padding: "0.75rem 1.5rem", borderRadius: "12px", textAlign: "center", fontSize: "0.9rem", fontWeight: 700 }}>
              Khám phá tài khoản
            </Link>
          </div>

          {/* Card 2: Cards */}
          <div className="card" style={{ 
            padding: "2rem 1.5rem", 
            borderRadius: "24px", 
            background: "var(--bg-soft)", 
            border: "1.5px solid var(--border-light)", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
          }}>
            <div>
              <div style={{ 
                width: "56px", height: "56px", borderRadius: "16px", 
                background: "rgba(236, 72, 153, 0.1)", color: "#EC4899", 
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" 
              }}>
                <CreditCard style={{ width: "28px", height: "28px" }} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.75rem" }}>Thẻ Cào Game Giá Sỉ</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                Kho thẻ nạp sỉ lẻ Garena, Zing VNG, VTC Vcoin, Gate chiết khấu cực cao lên đến 6%, bàn giao mã nạp và số seri tự động an toàn bảo mật tức thì.
              </p>
            </div>
            <Link href="/san-pham?type=card" className="btn-primary" style={{ padding: "0.75rem 1.5rem", borderRadius: "12px", textAlign: "center", fontSize: "0.9rem", fontWeight: 700, background: "linear-gradient(to right, #EC4899, #F43F5E)" }}>
              Mua thẻ nạp ngay
            </Link>
          </div>

          {/* Card 3: Items/Giftcodes */}
          <div className="card" style={{ 
            padding: "2rem 1.5rem", 
            borderRadius: "24px", 
            background: "var(--bg-soft)", 
            border: "1.5px solid var(--border-light)", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
          }}>
            <div>
              <div style={{ 
                width: "56px", height: "56px", borderRadius: "16px", 
                background: "rgba(234, 179, 8, 0.1)", color: "#EAB308", 
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" 
              }}>
                <Gift style={{ width: "28px", height: "28px" }} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.75rem" }}>Vật Phẩm & Giftcode VIP</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                Sở hữu ngay các hòm súng VIP, kim cương Free fire, RP Liên Quân, Nguyên Thạch Genshin Impact nạp cực nhanh qua giftcode tự động nhận quà cực đã.
              </p>
            </div>
            <Link href="/san-pham?type=giftcode" className="btn-primary" style={{ padding: "0.75rem 1.5rem", borderRadius: "12px", textAlign: "center", fontSize: "0.9rem", fontWeight: 700, background: "linear-gradient(to right, #EAB308, #CA8A04)" }}>
              Khám phá vật phẩm
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products Carousel */}
      <ProductCarousel
        title="Sản Phẩm Nổi Bật"
        subtitle="Tuyển chọn các tài khoản game được đánh giá cao nhất"
        products={FEATURED}
        viewAllHref="/san-pham"
      />

      {/* Mua Ngay Button */}
      <div style={{ textAlign: "center", padding: "2rem 0 1.5rem" }}>
        <Link href="/san-pham" className="btn-primary" style={{ 
          padding: "1rem 3.5rem", fontSize: "1.1rem", 
          boxShadow: "0 10px 25px rgba(124, 58, 237, 0.3)",
          display: "inline-flex", alignItems: "center", gap: "0.75rem",
          marginBottom: "3rem"
        }}>
          XEM THÊM <ChevronRight style={{ width: "20px", height: "20px" }} />
        </Link>

        {/* Trust Badges */}
        <div className="container-main" style={{ padding: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "1.5rem" }}>
            <div style={{ padding: "2rem 1.75rem", borderRadius: "24px", background: "var(--bg-soft)", border: "1.5px solid var(--border-light)", display: "flex", gap: "1.25rem", alignItems: "center", textAlign: "left", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                <ShieldCheck style={{ width: "28px", height: "28px" }} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: "var(--text)", marginBottom: "0.25rem", fontSize: "1.1rem" }}>Bảo hành trọn đời</h4>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>An toàn tuyệt đối 100%</p>
              </div>
            </div>
            <div style={{ padding: "2rem 1.75rem", borderRadius: "24px", background: "var(--bg-soft)", border: "1.5px solid var(--border-light)", display: "flex", gap: "1.25rem", alignItems: "center", textAlign: "left", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                <Zap style={{ width: "28px", height: "28px" }} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: "var(--text)", marginBottom: "0.25rem", fontSize: "1.1rem" }}>Giao hàng tự động</h4>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Nhận tài khoản sau 30s</p>
              </div>
            </div>
            <div style={{ padding: "2rem 1.75rem", borderRadius: "24px", background: "var(--bg-soft)", border: "1.5px solid var(--border-light)", display: "flex", gap: "1.25rem", alignItems: "center", textAlign: "left", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                <PhoneCall style={{ width: "28px", height: "28px" }} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: "var(--text)", marginBottom: "0.25rem", fontSize: "1.1rem" }}>Liên hệ hỗ trợ</h4>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Giải đáp mọi thắc mắc 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CTASection />
    </div>
  );
}
