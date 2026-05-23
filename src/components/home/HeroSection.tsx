"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight } from "lucide-react";

const HERO_IMAGE = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&q=80&auto=format&fit=crop";

const FEATURED_GAMES = [
  { name: "Liên Minh Huyền Thoại", icon: "⚔️", count: "2,341 acc", href: "/san-pham?cat=lol" },
  { name: "VALORANT", icon: "🔫", count: "1,205 acc", href: "/san-pham?cat=valorant" },
  { name: "Free Fire", icon: "🔥", count: "3,871 acc", href: "/san-pham?cat=freefire" },
  { name: "Liên Quân Mobile", icon: "🏆", count: "987 acc", href: "/san-pham?cat=lienquan" },
  { name: "Genshin Impact", icon: "🌟", count: "654 acc", href: "/san-pham?cat=genshin" },
  { name: "PUBG Mobile", icon: "🎯", count: "432 acc", href: "/san-pham?cat=pubg" },
];



export default function HeroSection() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/san-pham?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <section className="hero-bg" style={{ padding: "2rem 0 0" }}>
      <div className="container-main">
        {/* Hero image banner */}
        <div style={{
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          marginBottom: "2rem",
          boxShadow: "0 8px 40px rgba(124,58,237,0.2)",
        }}>
          <img
            src={HERO_IMAGE}
            alt="Game Account Marketplace"
            style={{ width: "100%", height: "380px", objectFit: "cover", display: "block" }}
          />
          {/* Overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(124,58,237,0.7) 0%, rgba(17,24,39,0.5) 60%, transparent 100%)",
            display: "flex", alignItems: "center",
          }}>
            <div style={{ padding: "2.5rem 3rem", maxWidth: "540px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)", borderRadius: "9999px",
                padding: "0.3rem 0.875rem", marginBottom: "1rem"
              }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
                  🎮 MARKETPLACE #1 VIỆT NAM
                </span>
              </div>
              <h1 style={{
                fontSize: "2.5rem", fontWeight: 900, color: "#fff",
                lineHeight: 1.15, marginBottom: "0.875rem", letterSpacing: "-0.02em"
              }}>
                Thế Giới<br />Tài Khoản Game
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Mua bán tài khoản game uy tín với hệ thống Escrow bảo đảm. Hàng nghìn tài khoản chất lượng, giá tốt nhất thị trường.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link href="/san-pham" className="btn-primary">
                  Xem Thêm
                </Link>
                <Link href="/register" style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.75rem 1.75rem", borderRadius: "9999px",
                  background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
                  border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff",
                  fontSize: "0.9rem", fontWeight: 600, textDecoration: "none", transition: "all 0.2s"
                }}>
                  Đăng ký
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Heading + search */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{
            fontSize: "2rem", fontWeight: 900, color: "#1a1a2e",
            marginBottom: "0.5rem", letterSpacing: "-0.02em"
          }}>
            <span style={{
              background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>Thế Giới Tài Khoản Game Premium</span>
          </h2>
          <p style={{ color: "#6B7280", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            Cung cấp tài khoản game chất lượng cao với chi phí tối ưu nhất cho game thủ Việt.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ maxWidth: "520px", margin: "0 auto 1.5rem", position: "relative" }}>
            <Search style={{
              position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)",
              width: "18px", height: "18px", color: "#9CA3AF"
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text"
              placeholder="Tìm tài khoản game..."
              style={{
                width: "100%", padding: "0.875rem 1rem 0.875rem 3rem",
                border: "2px solid #E5E7EB", borderRadius: "9999px",
                fontSize: "0.95rem", outline: "none", background: "#fff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)", transition: "all 0.2s"
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,58,237,0.15)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
            />
            <button type="submit" style={{
              position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)",
              background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
              color: "#fff", border: "none", borderRadius: "9999px",
              padding: "0.55rem 1.25rem", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem"
            }}>
              Tìm
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}
