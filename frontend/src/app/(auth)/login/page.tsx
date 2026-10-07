"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  ShieldCheck,
  Zap,
  Sparkles,
  Star,
  Gamepad2,
  CheckCircle2,
  Loader2,
  Home,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const { login, isLoading, error } = useAuthStore();
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const err = new URLSearchParams(window.location.search).get("error");
      if (err) setUrlError(decodeURIComponent(err));
    }
  }, []);

  const isDark = !mounted || resolvedTheme === "dark";

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
    window.location.href = `${backendUrl}/api/auth/google/redirect`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email: username, password });
      if (useAuthStore.getState().user) {
        router.push("/");
      }
    } catch {
      // Handled in store
    }
  };

  const c = isDark
    ? {
        outerBg: "#0c0d18",
        cardBg: "#151627",
        cardBorder: "rgba(167, 139, 250, 0.18)",
        cardShadow: "0 25px 70px rgba(0, 0, 0, 0.65)",
        heading: "#ffffff",
        sub: "#94a3b8",
        label: "#cbd5e1",
        inpBg: "rgba(255, 255, 255, 0.05)",
        inpBorder: "rgba(255, 255, 255, 0.12)",
        inpColor: "#ffffff",
        inpPlaceholder: "#64748b",
        inpFocusBorder: "#8b5cf6",
        googleBtnBg: "rgba(255, 255, 255, 0.04)",
        googleBtnBorder: "rgba(255, 255, 255, 0.12)",
        googleBtnHover: "rgba(255, 255, 255, 0.08)",
        dividerLine: "rgba(255, 255, 255, 0.08)",
        dividerText: "#64748b",
        tabBg: "rgba(255, 255, 255, 0.05)",
        tabBorder: "rgba(255, 255, 255, 0.08)",
        tabInactive: "#94a3b8",
        footerText: "#64748b",
      }
    : {
        outerBg: "#f3f0fc",
        cardBg: "#ffffff",
        cardBorder: "#e9d5ff",
        cardShadow: "0 20px 60px rgba(124, 58, 237, 0.12)",
        heading: "#1e1b4b",
        sub: "#64748b",
        label: "#334155",
        inpBg: "#f8faff",
        inpBorder: "#e2e8f0",
        inpColor: "#0f172a",
        inpPlaceholder: "#94a3b8",
        inpFocusBorder: "#7c3aed",
        googleBtnBg: "#ffffff",
        googleBtnBorder: "#e2e8f0",
        googleBtnHover: "#f8fafc",
        dividerLine: "#e2e8f0",
        dividerText: "#94a3b8",
        tabBg: "#f1f5f9",
        tabBorder: "#e2e8f0",
        tabInactive: "#64748b",
        footerText: "#94a3b8",
      };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
        background: c.outerBg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Glow Orbs */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "5%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(45px)",
        }}
      />

      {/* Main Card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "1020px",
          borderRadius: "28px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          background: c.cardBg,
          border: `1px solid ${c.cardBorder}`,
          boxShadow: c.cardShadow,
        }}
      >
        {/* ── LEFT SHOWCASE BANNER ── */}
        <div
          style={{
            flex: "1 1 380px",
            minHeight: "560px",
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(155deg, #2c0b6b 0%, #1a0840 50%, #0c0420 100%)",
            padding: "2.75rem 2.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "#ffffff",
          }}
        >
          {/* Top Branding */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 16px rgba(139, 92, 246, 0.4)",
                  }}
                >
                  <Gamepad2 size={24} color="#ffffff" />
                </div>
                <span style={{ fontSize: "1.45rem", fontWeight: 900, letterSpacing: "0.04em" }}>
                  GAME<span style={{ color: "#c084fc" }}>ACC</span>
                </span>
              </div>

              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "99px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#ffffff",
                  background: "rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  textDecoration: "none",
                }}
              >
                <Home size={14} /> Trang chủ
              </Link>
            </div>

            <div
              style={{
                marginTop: "2.2rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "6px 14px",
                borderRadius: "99px",
                background: "rgba(168, 85, 247, 0.2)",
                border: "1px solid rgba(192, 132, 252, 0.35)",
                color: "#e9d5ff",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              <Sparkles size={14} color="#d8b4fe" />
              SÀN GIAO DỊCH GAME UY TÍN #1 VN
            </div>

            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1.35, marginTop: "1.2rem" }}>
              Khám phá kho tài khoản game đỉnh cao
            </h2>
            <p style={{ fontSize: "0.88rem", color: "rgba(233, 213, 255, 0.75)", lineHeight: 1.6, marginTop: "0.6rem" }}>
              Giao dịch hoàn toàn tự động 24/7, xác minh bảo mật nhiều lớp và bảo hành trọn đời mọi giao dịch.
            </p>
          </div>

          {/* Feature Highlights */}
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "12px", margin: "1.5rem 0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                padding: "12px 16px",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  padding: "8px",
                  borderRadius: "12px",
                  background: "rgba(147, 51, 234, 0.25)",
                  color: "#d8b4fe",
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>Bảo hiểm 100% giao dịch</h4>
                <p style={{ fontSize: "0.78rem", color: "rgba(233, 213, 255, 0.7)", margin: "3px 0 0 0" }}>
                  Cam kết bồi hoàn 1 đổi 1 hoặc hoàn tiền ngay nếu có sự cố
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                padding: "12px 16px",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  padding: "8px",
                  borderRadius: "12px",
                  background: "rgba(245, 158, 11, 0.25)",
                  color: "#fcd34d",
                }}
              >
                <Zap size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>Bàn giao tự động trong 30s</h4>
                <p style={{ fontSize: "0.78rem", color: "rgba(233, 213, 255, 0.7)", margin: "3px 0 0 0" }}>
                  Hệ thống bot bàn giao tài khoản và thẻ cào ngay tức khắc
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              paddingTop: "1rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "#fbbf24" }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#fbbf24" color="#fbbf24" />
              ))}
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", marginLeft: "6px" }}>4.9/5</span>
            </div>
            <span style={{ fontSize: "0.8rem", color: "rgba(233, 213, 255, 0.7)" }}>50,000+ Game thủ tin dùng</span>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div
          style={{
            flex: "1 1 480px",
            padding: "2.75rem 2.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: c.cardBg,
          }}
        >
          {/* Header & Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "1.75rem",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: c.heading, margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
                Chào mừng trở lại! 👋
              </h1>
              <p style={{ fontSize: "0.88rem", color: c.sub, margin: 0 }}>
                Nhập thông tin để tiếp tục trải nghiệm
              </p>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "inline-flex",
                padding: "4px",
                borderRadius: "12px",
                background: c.tabBg,
                border: `1px solid ${c.tabBorder}`,
                gap: "4px",
              }}
            >
              <button
                type="button"
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(124, 58, 237, 0.35)",
                  cursor: "default",
                }}
              >
                Đăng nhập
              </button>
              <Link
                href="/register"
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: c.tabInactive,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Đăng ký
              </Link>
            </div>
          </div>

          {/* Error Alert */}
          {(error || urlError) && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
              <span>{error || urlError}</span>
            </div>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "14px",
              border: `1px solid ${c.googleBtnBorder}`,
              background: c.googleBtnBg,
              color: c.heading,
              fontSize: "0.92rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#8b5cf6";
              e.currentTarget.style.background = c.googleBtnHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = c.googleBtnBorder;
              e.currentTarget.style.background = c.googleBtnBg;
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Tiếp tục với Google</span>
          </button>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              margin: "1.5rem 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: c.dividerLine }} />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: c.dividerText,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              hoặc đăng nhập bằng tài khoản
            </span>
            <div style={{ flex: 1, height: "1px", background: c.dividerLine }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {/* Username / Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: c.label,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "6px",
                }}
              >
                Tên đăng nhập hoặc Email
              </label>
              <div style={{ position: "relative", width: "100%" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: c.inpPlaceholder,
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@gameacc.vn hoặc tên tài khoản"
                  required
                  style={{
                    width: "100%",
                    height: "46px",
                    paddingLeft: "44px",
                    paddingRight: "14px",
                    borderRadius: "12px",
                    background: c.inpBg,
                    border: `1px solid ${c.inpBorder}`,
                    color: c.inpColor,
                    fontSize: "0.9rem",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = c.inpFocusBorder)}
                  onBlur={(e) => (e.target.style.borderColor = c.inpBorder)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <label
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: c.label,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Mật khẩu
                </label>
                <Link
                  href="/forgot-password"
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#a855f7",
                    textDecoration: "none",
                  }}
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div style={{ position: "relative", width: "100%" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: c.inpPlaceholder,
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Lock size={18} />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    height: "46px",
                    paddingLeft: "44px",
                    paddingRight: "44px",
                    borderRadius: "12px",
                    background: c.inpBg,
                    border: `1px solid ${c.inpBorder}`,
                    color: c.inpColor,
                    fontSize: "0.9rem",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = c.inpFocusBorder)}
                  onBlur={(e) => (e.target.style.borderColor = c.inpBorder)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: c.inpPlaceholder,
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "4px",
                    accentColor: "#7c3aed",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontSize: "0.82rem", color: c.sub }}>Ghi nhớ đăng nhập</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                height: "48px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                color: "#ffffff",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: "0 6px 20px rgba(124, 58, 237, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "0.4rem",
                transition: "opacity 0.2s",
                opacity: isLoading ? 0.75 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập ngay</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Security */}
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.25rem",
              borderTop: `1px solid ${c.dividerLine}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "0.78rem",
              color: c.footerText,
            }}
          >
            <CheckCircle2 size={15} color="#22c55e" />
            <span>Mã hóa bảo mật SSL 256-bit chuẩn quốc tế</span>
          </div>
        </div>
      </div>
    </div>
  );
}
