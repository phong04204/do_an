"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/auth-store";

export default function RegisterPage() {
  const [form, setForm] = useState({ fullname: "", dob: "", phone: "", email: "", username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const { register: registerUser, isLoading, error } = useAuthStore();
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme === "dark";

  const c = isDark ? {
    outerBg:   "#1c1b2e",
    cardBg:    "#252438",
    cardShadow:"0 30px 80px rgba(0,0,0,0.5)",
    heading:   "#ffffff",
    sub:       "rgba(255,255,255,0.45)",
    inpBg:     "rgba(255,255,255,0.06)",
    inpBorder: "rgba(255,255,255,0.08)",
    inpColor:  "#ffffff",
    inpFocus:  "rgba(167,139,250,0.6)",
    eyeColor:  "rgba(255,255,255,0.35)",
    cbBorder:  "rgba(255,255,255,0.25)",
    remText:   "rgba(255,255,255,0.5)",
    linkColor: "#a78bfa",
  } : {
    outerBg:   "#ede9fe",
    cardBg:    "#ffffff",
    cardShadow:"0 30px 80px rgba(124,58,237,0.12)",
    heading:   "#1a1a2e",
    sub:       "#6b7280",
    inpBg:     "#f8f7ff",
    inpBorder: "#e5e7eb",
    inpColor:  "#1a1a2e",
    inpFocus:  "rgba(124,58,237,0.5)",
    eyeColor:  "#9ca3af",
    cbBorder:  "#d1d5db",
    remText:   "#6b7280",
    linkColor: "#7c3aed",
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const cleanUsername = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/\s+/g, "")
      .toLowerCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    try {
      useAuthStore.getState().clearError();
      const cleanUser = cleanUsername(form.username);
      await registerUser({
        name: form.username,
        email: `${cleanUser}@gameacc.vn`,
        password: form.password,
        password_confirmation: form.password,
        phone: form.phone,
        dob: form.dob,
        role: "buyer",
      });

      // Clear automatic auth from register action
      useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
      localStorage.removeItem("auth_token");

      setSuccess("Đăng ký tài khoản thành công! Hệ thống đang chuyển hướng bạn sang trang đăng nhập...");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch {
      // Handled by auth store error state
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "0.8rem 1rem",
    background: c.inpBg,
    border: `1px solid ${c.inpBorder}`,
    borderRadius: "10px", outline: "none",
    color: c.inpColor, fontSize: "0.9rem",
    transition: "border-color 0.15s",
    colorScheme: isDark ? "dark" : "light",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: c.outerBg, padding: "1.5rem",
      fontFamily: "system-ui, -apple-system, sans-serif",
      transition: "background 0.3s",
    }}>
      <div style={{
        width: "100%", maxWidth: "960px", minHeight: "560px",
        background: c.cardBg, borderRadius: "20px",
        overflow: "hidden", display: "flex",
        boxShadow: c.cardShadow, transition: "background 0.3s, box-shadow 0.3s",
      }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: "42%", flexShrink: 0, position: "relative",
          background: "linear-gradient(160deg, #6b21e8 0%, #4c1d8f 40%, #1a0a3c 70%, #0d0820 100%)",
          display: "flex", flexDirection: "column", padding: "2rem",
          overflow: "hidden",
        }}>
          {/* Decorative shapes */}
          <div style={{ position:"absolute", top:"-60px", right:"-60px", width:"220px", height:"220px", borderRadius:"50%", background:"rgba(139,92,246,0.25)", filter:"blur(40px)" }} />
          <div style={{ position:"absolute", bottom:"60px", left:"-40px", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(109,40,217,0.3)", filter:"blur(50px)" }} />
          {/* Dune shape */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"55%", background:"linear-gradient(to top, #0d0820 0%, #1a0a3c 40%, transparent 100%)", borderRadius:"0 0 0 0" }} />
          <svg style={{ position:"absolute", bottom:"80px", left:0, right:0, width:"100%", opacity:0.5 }} viewBox="0 0 400 160" preserveAspectRatio="none">
            <path d="M0 160 Q100 60 200 100 Q300 140 400 40 L400 160 Z" fill="#0d0820" />
          </svg>
          <svg style={{ position:"absolute", bottom:"40px", left:0, right:0, width:"100%", opacity:0.7 }} viewBox="0 0 400 120" preserveAspectRatio="none">
            <path d="M0 120 Q80 20 180 70 Q280 120 400 30 L400 120 Z" fill="#100c28" />
          </svg>

          {/* Logo */}
          <div style={{ position:"relative", zIndex:1, fontWeight:900, fontSize:"1.5rem", color:"#fff", letterSpacing:"0.05em" }}>
            GAME<span style={{ color:"#a78bfa" }}>ACC</span>
          </div>

          {/* Back to website */}
          <Link href="/" style={{
            position:"absolute", top:"1.75rem", right:"1.75rem", zIndex:1,
            display:"inline-flex", alignItems:"center", gap:"6px",
            background:"rgba(255,255,255,0.12)", backdropFilter:"blur(8px)",
            border:"1px solid rgba(255,255,255,0.15)", borderRadius:"99px",
            padding:"6px 14px", fontSize:"0.8rem", color:"#fff", textDecoration:"none",
            fontWeight:500, transition:"background 0.15s",
          }}>
            Về trang chủ <ArrowRight size={13} />
          </Link>

          {/* Bottom text */}
          <div style={{ position:"relative", zIndex:1, marginTop:"auto" }}>
            <p style={{ fontSize:"1.4rem", fontWeight:700, color:"#fff", lineHeight:1.35, marginBottom:"1.25rem" }}>
              Mua bán tài khoản<br />game uy tín #1 VN
            </p>
            {/* Dots */}
            <div style={{ display:"flex", gap:"6px" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ height:"4px", borderRadius:"2px", background: i===2 ? "#fff" : "rgba(255,255,255,0.3)", width: i===2 ? "24px" : "12px", transition:"all 0.3s" }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          flex: 1, padding: "2.5rem 2.75rem",
          display: "flex", flexDirection: "column", justifyContent: "center",
          background: c.cardBg, transition: "background 0.3s",
        }}>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 800, color: c.heading, marginBottom: "0.35rem", letterSpacing: "-0.02em", transition: "color 0.3s" }}>
            Tạo tài khoản
          </h1>
          <p style={{ fontSize: "0.875rem", color: c.sub, marginBottom: "1.5rem", transition: "color 0.3s" }}>
            Đã có tài khoản?{" "}
            <Link href="/login" style={{ color: c.linkColor, fontWeight: 600, textDecoration: "none" }}>
              Đăng nhập
            </Link>
          </p>

          {error && (
            <div style={{
              padding: "0.7rem 1rem", borderRadius: "10px", marginBottom: "1rem",
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171", fontSize: "0.85rem",
            }}>{error}</div>
          )}

          {success && (
            <div style={{
              padding: "0.7rem 1rem", borderRadius: "10px", marginBottom: "1rem",
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
              color: "#34d399", fontSize: "0.85rem",
            }}>{success}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            {/* Row 1: Họ tên + Ngày sinh */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem" }}>
              <input
                value={form.fullname} onChange={set("fullname")} placeholder="Họ và tên"
                required style={inp}
                onFocus={e => (e.target.style.borderColor = c.inpFocus)}
                onBlur={e => (e.target.style.borderColor = c.inpBorder)}
              />
              <input
                type="text" value={form.dob} onChange={set("dob")}
                placeholder="Ngày sinh (VD: 20/10/2004)"
                required style={inp}
                onFocus={e => (e.target.style.borderColor = c.inpFocus)}
                onBlur={e => (e.target.style.borderColor = c.inpBorder)}
              />
            </div>

            {/* Row 2: Số điện thoại */}
            <input
              type="tel" value={form.phone} onChange={set("phone")} placeholder="Số điện thoại"
              style={inp}
              onFocus={e => (e.target.style.borderColor = c.inpFocus)}
              onBlur={e => (e.target.style.borderColor = c.inpBorder)}
            />

            {/* Row 3: Tên đăng nhập */}
            <input
              value={form.username} onChange={set("username")} placeholder="Tên đăng nhập"
              required style={inp}
              onFocus={e => (e.target.style.borderColor = c.inpFocus)}
              onBlur={e => (e.target.style.borderColor = c.inpBorder)}
            />

            {/* Row 4: Mật khẩu */}
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"} value={form.password} onChange={set("password")}
                placeholder="Mật khẩu" required
                style={{ ...inp, paddingRight: "3rem" }}
                onFocus={e => (e.target.style.borderColor = c.inpFocus)}
                onBlur={e => (e.target.style.borderColor = c.inpBorder)}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: c.eyeColor,
                display: "flex", alignItems: "center", padding: 0,
              }}>
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {/* Terms */}
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", marginTop: "0.1rem" }}>
              <div onClick={() => setAgreed(!agreed)} style={{
                width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                background: agreed ? "#7c3aed" : "transparent",
                border: agreed ? "none" : `1.5px solid ${c.cbBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s",
              }}>
                {agreed && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{ fontSize: "0.83rem", color: c.remText }}>
                Tôi đồng ý với{" "}
                <Link href="/terms" style={{ color: c.linkColor, textDecoration: "none" }}>Điều khoản dịch vụ</Link>
              </span>
            </label>

            <button type="submit" disabled={isLoading || !agreed} style={{
              width: "100%", padding: "0.85rem",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none", borderRadius: "10px",
              color: "#fff", fontSize: "0.95rem", fontWeight: 700,
              cursor: isLoading || !agreed ? "not-allowed" : "pointer",
              opacity: !agreed ? 0.55 : 1,
              boxShadow: "0 4px 18px rgba(124,58,237,0.45)",
              transition: "all 0.2s", marginTop: "0.3rem",
            }}
              onMouseEnter={e => { if (!isLoading && agreed) e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = agreed ? "1" : "0.55"; }}
            >
              {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

