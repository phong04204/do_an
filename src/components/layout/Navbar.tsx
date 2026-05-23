"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, ShoppingCart, Sun, Moon, Menu, X, ChevronDown, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useTheme } from "next-themes";



export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { logout } = useAuthStore();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { totalItems } = useCartStore();
  const { theme, setTheme } = useTheme();

  const cartItemsCount = mounted ? totalItems() : 0;

  useEffect(() => {
    setMounted(true);
    setCurrentUser(useAuthStore.getState().user);
    
    // Subscribe to store updates to keep the local state completely synchronized
    const unsub = useAuthStore.subscribe((state) => {
      setCurrentUser(state.user);
    });

    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => {
      unsub();
      window.removeEventListener("scroll", fn);
    };
  }, []);

  return (
    <>
      {/* Marquee strip */}
      <div className="marquee-strip">
        <div className="marquee-content">
          &nbsp;&nbsp;🔐 Bảo mật thông tin người dùng &nbsp;|&nbsp; ⚡ Mua hàng nhanh chóng &nbsp;|&nbsp; 🛡️ Bảo hành 1 đổi 1 &nbsp;|&nbsp; 💬 Hỗ trợ nhiệt tình 24/7 &nbsp;|&nbsp; 🎮 Hơn 10,000+ tài khoản game &nbsp;|&nbsp; ✅ Uy tín - An toàn - Chất lượng &nbsp;&nbsp;
          &nbsp;&nbsp;🔐 Bảo mật thông tin người dùng &nbsp;|&nbsp; ⚡ Mua hàng nhanh chóng &nbsp;|&nbsp; 🛡️ Bảo hành 1 đổi 1 &nbsp;|&nbsp; 💬 Hỗ trợ nhiệt tình 24/7 &nbsp;|&nbsp; 🎮 Hơn 10,000+ tài khoản game &nbsp;|&nbsp; ✅ Uy tín - An toàn - Chất lượng &nbsp;&nbsp;
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className="navbar"
        style={{ boxShadow: scrolled ? "0 2px 16px rgba(124,58,237,0.08)" : "none" }}
      >
        <div className="container-main">
          <div style={{ display: "flex", alignItems: "center", height: "64px", gap: "1rem" }}>
            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.25rem", textDecoration: "none", flexShrink: 0 }}>
              <span style={{ fontWeight: 900, fontSize: "1.35rem", color: "#7C3AED", letterSpacing: "-0.02em" }}>
                GAME<span style={{ color: "#06B6D4" }}>ACC</span>
              </span>
              <span style={{
                fontSize: "0.6rem", fontWeight: 700, padding: "0.1rem 0.4rem",
                background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                color: "#fff", borderRadius: "4px", marginLeft: "2px", letterSpacing: "0.05em"
              }}>SHOP</span>
            </Link>

            {/* Search */}
            <div style={{ flex: 1, maxWidth: "460px", position: "relative" }}>
              <Search style={{
                position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                width: "16px", height: "16px", color: "#9CA3AF"
              }} />
              <input
                type="text"
                placeholder="Tìm tài khoản game..."
                style={{
                  width: "100%", padding: "0.55rem 1rem 0.55rem 2.5rem",
                  border: "1.5px solid #E5E7EB", borderRadius: "9999px",
                  fontSize: "0.875rem", outline: "none", background: "#F9F8FF",
                  color: "#1a1a2e", transition: "all 0.2s"
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.background = "#fff"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#F9F8FF"; }}
              />
            </div>

            {/* Desktop nav */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginLeft: "auto" }}>
              <Link href="/san-pham" style={{ 
                padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 700, 
                color: "var(--text)", textDecoration: "none", borderRadius: "10px",
                transition: "all 0.2s"
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-soft)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                Cửa Hàng
              </Link>

              {/* Cart */}
              <Link href="/gio-hang" style={{
                width: "38px", height: "38px", borderRadius: "50%",
                background: "var(--bg-soft)", border: "1.5px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", color: "var(--text)", textDecoration: "none", transition: "all 0.2s"
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#7C3AED"; (e.currentTarget as HTMLElement).style.color = "#7C3AED"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
              title="Giỏ hàng"
              >
                <ShoppingCart style={{ width: "17px", height: "17px" }} />
                {cartItemsCount > 0 && (
                  <span style={{
                    position: "absolute", top: "-4px", right: "-4px",
                    width: "18px", height: "18px", background: "#06B6D4", color: "#fff",
                    borderRadius: "50%", fontSize: "0.65rem", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>{cartItemsCount}</span>
                )}
              </Link>

              {/* Auth */}
              {mounted && currentUser ? (
                <div style={{ position: "relative" }}>
                  <button onClick={() => setUserOpen(!userOpen)} style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                    border: "none",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 14px rgba(124, 58, 237, 0.25)",
                    transition: "all 0.2s ease-in-out"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(6, 182, 212, 0.4)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(124, 58, 237, 0.25)";
                  }}
                  title={`Hồ sơ của ${currentUser.name}`}
                  >
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User style={{ width: "17px", height: "17px" }} />}
                  </button>
                  {userOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0,
                      background: "#fff", border: "1px solid #E5E7EB",
                      borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      minWidth: "180px", padding: "0.5rem", zIndex: 200
                    }}>
                      <div style={{ padding: "0.5rem 0.75rem 0.75rem", borderBottom: "1px solid #F3F4F6", marginBottom: "0.25rem" }}>
                        <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1a1a2e" }}>{currentUser.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{currentUser.email}</div>
                      </div>
                      {(currentUser.role === "admin" || currentUser.role === "seller"
                        ? [
                            { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
                            { icon: User, label: "Hồ sơ", href: "/dashboard/profile" },
                          ]
                        : [
                            { icon: User, label: "Hồ sơ", href: "/dashboard/profile" },
                          ]
                      ).map(({ icon: Icon, label, href }) => (
                        <a key={href} href={href} onClick={() => setUserOpen(false)} style={{
                          display: "flex", alignItems: "center", gap: "0.5rem",
                          padding: "0.5rem 0.75rem", fontSize: "0.875rem", color: "#374151",
                          textDecoration: "none", borderRadius: "8px", transition: "all 0.15s"
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#F5F3FF")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <Icon style={{ width: "15px", height: "15px" }} /> {label}
                        </a>
                      ))}
                      <button onClick={() => { logout(); setUserOpen(false); }} style={{
                        display: "flex", alignItems: "center", gap: "0.5rem", width: "100%",
                        padding: "0.5rem 0.75rem", fontSize: "0.875rem", color: "#EF4444",
                        background: "none", border: "none", cursor: "pointer", borderRadius: "8px",
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#FFF0F0")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <LogOut style={{ width: "15px", height: "15px" }} /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : mounted ? (
                <>
                  <Link href="/login" style={{
                    padding: "0.45rem 1rem", fontSize: "0.875rem", fontWeight: 600,
                    color: "#374151", textDecoration: "none", border: "1.5px solid #E5E7EB",
                    borderRadius: "9999px", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#7C3AED"; (e.currentTarget as HTMLElement).style.color = "#7C3AED"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.color = "#374151"; }}
                  >
                    Đăng nhập
                  </Link>
                  <Link href="/register" className="btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.875rem" }}>
                    Đăng ký
                  </Link>
                </>
              ) : (
                <div style={{ width: "160px", height: "38px" }} />
              )}

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{
                  width: "38px", height: "38px", borderRadius: "50%",
                  background: "var(--bg-soft)", border: "1.5px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--text)", transition: "all 0.2s"
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                title="Đổi giao diện"
              >
                {!mounted ? <Sun style={{ width: "17px", height: "17px" }} /> : 
                  theme === "dark" ? <Sun style={{ width: "17px", height: "17px" }} /> : <Moon style={{ width: "17px", height: "17px" }} />}
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: "none", padding: "0.5rem", border: "none", background: "transparent", cursor: "pointer" }}
              className="mobile-menu-btn"
            >
              {menuOpen ? <X style={{ width: "20px", height: "20px" }} /> : <Menu style={{ width: "20px", height: "20px" }} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay close */}
      {userOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => { setUserOpen(false); }} />
      )}
    </>
  );
}
