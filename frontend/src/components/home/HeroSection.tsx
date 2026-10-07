"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, ArrowRight } from "lucide-react";

const HERO_IMAGE = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80&auto=format&fit=crop";


export default function HeroSection() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/san-pham?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <section className="hero-bg" style={{ padding: "1.5rem 0 2rem" }}>
      <div className="container-main" style={{ maxWidth: 1200 }}>
        {/* Main Visual Banner */}
        <div style={{
          position: "relative",
          borderRadius: "24px",
          overflow: "hidden",
          marginBottom: "2.5rem",
          boxShadow: "0 12px 45px rgba(124,58,237,0.25)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <img
            src={HERO_IMAGE}
            alt="Game Account Marketplace"
            style={{ width: "100%", height: "390px", objectFit: "cover", display: "block" }}
          />
          {/* Ambient Lighting Overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(124, 58, 237, 0.65) 50%, rgba(6, 182, 212, 0.35) 100%)",
            display: "flex", alignItems: "center",
          }}>
            <div style={{ padding: "2.5rem 3rem", maxWidth: "600px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.25)", borderRadius: "9999px",
                padding: "0.35rem 1rem", marginBottom: "1.25rem"
              }}>
                <Sparkles style={{ width: 14, height: 14, color: "#facc15" }} />
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Hệ Thống Mua Bán Game Tự Động #1
                </span>
              </div>

              <h1 style={{
                fontSize: "2.6rem", fontWeight: 900, color: "#fff",
                lineHeight: 1.18, marginBottom: "1rem", letterSpacing: "-0.03em"
              }}>
                Sàn Giao Dịch <br />
                <span style={{
                  background: "linear-gradient(135deg, #a78bfa, #38bdf8)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>Tài Khoản & Thẻ Game</span>
              </h1>

              <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.75rem" }}>
                Kho tài khoản đa dạng FC Online, LMHT, Valorant, Free Fire, Liên Quân. Nạp thẻ tự động, nhận acc trong 3 giây với bảo hiểm 100%.
              </p>

              <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", alignItems: "center" }}>
                <Link href="/san-pham" className="btn-primary" style={{
                  padding: "0.85rem 1.85rem", fontSize: "0.95rem", fontWeight: 800,
                  display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 14
                }}>
                  <span>Khám Phá Sản Phẩm</span>
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
                <Link href="/san-pham?type=card" style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.85rem 1.75rem", borderRadius: "14px",
                  background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.25)", color: "#fff",
                  fontSize: "0.9rem", fontWeight: 700, textDecoration: "none", transition: "all 0.2s"
                }}>
                  Mua Thẻ Chiết Khấu Cao
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Center Search Bar & Quick Categories */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{
            fontSize: "1.8rem", fontWeight: 900, color: "var(--text)",
            marginBottom: "1.25rem", letterSpacing: "-0.02em"
          }}>
            Tìm Kiếm Tài Khoản Theo Sở Thích
          </h2>

          {/* Search Form */}
          <form onSubmit={handleSearch} style={{ maxWidth: "560px", margin: "0 auto 1.25rem", position: "relative" }}>
            <Search style={{
              position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)",
              width: "18px", height: "18px", color: "var(--text-muted)"
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text"
              placeholder="Nhập tên game, tướng, skin hoặc mã cần tìm..."
              style={{
                width: "100%", padding: "0.95rem 1rem 0.95rem 3.1rem",
                border: "1.5px solid var(--border-light)", borderRadius: "9999px",
                fontSize: "0.92rem", outline: "none", background: "var(--bg-card)",
                color: "var(--text)", boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                transition: "all 0.2s", boxSizing: "border-box"
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 6px 25px rgba(124,58,237,0.25)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.06)"; }}
            />
            <button type="submit" style={{
              position: "absolute", right: "7px", top: "50%", transform: "translateY(-50%)",
              background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
              color: "#fff", border: "none", borderRadius: "9999px",
              padding: "0.6rem 1.4rem", cursor: "pointer", fontWeight: 700, fontSize: "0.88rem",
              boxShadow: "0 4px 12px rgba(124,58,237,0.35)"
            }}>
              Tìm Kiếm
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
