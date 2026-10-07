"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  CheckCircle2, 
  XCircle,
  Save,
  ArrowLeft,
  Sparkles,
  X
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function ProfileEditPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, updateProfile, fetchMe } = useAuthStore();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchMe().catch(() => {});
  }, [fetchMe]);

  // Sync state with store user data
  useEffect(() => {
    if (mounted && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [mounted, user]);

  // Auth protection redirect
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login?redirect=/dashboard/profile/edit");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !user) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7C3AED", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Đang tải thông tin tài khoản...
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage("Họ và tên / Tên đăng nhập không được để trống.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Địa chỉ email không được để trống.");
      return;
    }
    if (password && password.length < 6) {
      setErrorMessage("Mật khẩu mới phải chứa ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Xác nhận mật khẩu mới không trùng khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name,
        email,
        phone
      };
      if (password) {
        payload.password = password;
      }

      await updateProfile(payload);
      
      // Clear password fields on success
      setPassword("");
      setConfirmPassword("");
      
      setSuccessMessage("Cập nhật thông tin cá nhân và mật khẩu thành công!");
    } catch (err: any) {
      console.error("Profile update failed:", err);
      const msg = err.response?.data?.message || err.message || "Có lỗi xảy ra trong quá trình lưu thông tin.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const userAvatar = user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || "user")}`;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "3rem 0 6rem" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          width: 18px;
          height: 18px;
          color: var(--text-light);
          pointer-events: none;
        }
        .form-input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 2.75rem;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          background: var(--bg-soft);
          color: var(--text);
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s ease-in-out;
        }
        .form-input:focus {
          border-color: var(--primary);
          background: var(--bg-card);
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.08);
        }
      `}</style>

      <div className="container-main animate-fade-in" style={{ maxWidth: "850px" }}>
        
        {/* Back Link */}
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/dashboard/profile" style={{ color: "var(--text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", fontWeight: 600 }}>
            <ArrowLeft style={{ width: "16px", height: "16px" }} /> Quay lại hồ sơ tài khoản
          </Link>
        </div>

        {/* 2-Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "2.5rem", alignItems: "start" }} className="profile-grid">
          
          {/* Left Column: Avatar & Overview Card */}
          <div className="card" style={{ 
            padding: "2.5rem 1.5rem", 
            background: "var(--bg-card)", 
            textAlign: "center", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            gap: "1.5rem",
            borderRadius: "20px"
          }}>
            {/* Avatar container */}
            <div style={{ position: "relative" }}>
              <div style={{ 
                width: "120px", height: "120px", borderRadius: "50%", 
                overflow: "hidden", border: "4px solid var(--primary)",
                boxShadow: "0 8px 24px rgba(124, 58, 237, 0.2)",
                background: "var(--bg-soft)"
              }}>
                <img 
                  src={userAvatar} 
                  alt={name} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              </div>
              <span style={{
                position: "absolute", bottom: "4px", right: "4px",
                width: "28px", height: "28px", borderRadius: "50%",
                background: "#10B981", color: "#fff", display: "flex",
                alignItems: "center", justifyContent: "center", border: "3px solid var(--bg-card)",
                fontSize: "0.75rem", fontWeight: 700
              }} title="Đang hoạt động">✓</span>
            </div>

            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text)", margin: "0 0 0.25rem" }}>
                {user.name}
              </h2>
              <span style={{ 
                fontSize: "0.75rem", background: "rgba(124,58,237,0.12)", color: "var(--primary)",
                fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "99px",
                textTransform: "uppercase", letterSpacing: "0.05em"
              }}>
                {(user.role as string) === "admin" ? "Quản trị viên" : (user.role as string) === "seller" ? "Người bán" : "Khách hàng"}
              </span>
            </div>
          </div>

          {/* Right Column: Form Edit */}
          <form onSubmit={handleSubmit} className="card" style={{ 
            padding: "2.5rem", 
            background: "var(--bg-card)", 
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "2rem"
          }}>
            
            {/* Header info */}
            <div>
              <h1 className="text-gradient" style={{ fontSize: "1.85rem", fontWeight: 900, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles style={{ width: "26px", height: "26px", color: "var(--primary)" }} /> Chỉnh Sửa Thông Tin
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                Thay đổi các thiết lập thông tin cá nhân cơ bản và cập nhật mật khẩu của bạn.
              </p>
            </div>

            <div className="divider" />

            {/* Basic Info Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text)", margin: 0, borderLeft: "4px solid var(--primary)", paddingLeft: "0.6rem" }}>
                Thông tin cá nhân cơ bản
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="profile-form-row">
                {/* Name */}
                <div className="input-group">
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>Họ và tên / Tên đăng nhập</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập họ tên đầy đủ..." 
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="input-group">
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>Địa chỉ Email</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com" 
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }} className="profile-form-row">
                {/* Phone */}
                <div className="input-group">
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>Số điện thoại liên hệ</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" />
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại..." 
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="divider" style={{ borderStyle: "dashed" }} />

            {/* Security Section (Password) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text)", margin: "0 0 0.25rem", borderLeft: "4px solid var(--primary)", paddingLeft: "0.6rem" }}>
                  Đổi mật khẩu bảo mật
                </h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, paddingLeft: "0.85rem" }}>
                  Bỏ trống các ô bên dưới nếu bạn không có nhu cầu thay đổi mật khẩu đăng nhập.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="profile-form-row">
                {/* New Password */}
                <div className="input-group">
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>Mật khẩu mới</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới..." 
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="input-group">
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>Xác nhận mật khẩu mới</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Xác nhận mật khẩu mới..." 
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "1.25rem" }}>
              <Link 
                href="/dashboard/profile" 
                className="btn-primary"
                style={{ 
                  flex: 1, padding: "1rem", fontSize: "1rem", 
                  borderRadius: "12px", display: "flex", alignItems: "center", 
                  justifyContent: "center", gap: "0.5rem", fontWeight: 700,
                  background: "transparent", border: "1.5px solid var(--border)",
                  color: "var(--text)", boxShadow: "none", textDecoration: "none"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#EF4444"; e.currentTarget.style.color = "#EF4444"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}
              >
                <X style={{ width: "20px", height: "20px" }} />
                Hủy bỏ
              </Link>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isSubmitting}
                style={{ 
                  flex: 2, padding: "1rem", fontSize: "1rem", 
                  borderRadius: "12px", display: "flex", alignItems: "center", 
                  justifyContent: "center", gap: "0.5rem", fontWeight: 700,
                  boxShadow: "0 6px 20px rgba(124, 58, 237, 0.25)",
                  opacity: isSubmitting ? 0.65 : 1
                }}
              >
                <Save style={{ width: "20px", height: "20px" }} />
                {isSubmitting ? "Đang tiến hành lưu..." : "Lưu Thay Đổi"}
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* Premium Notification Modal (ERROR) */}
      {errorMessage && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10, 10, 18, 0.65)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          animation: "fadeIn 0.25s ease-out"
        }}>
          <div className="card animate-scale-up" style={{
            maxWidth: "450px",
            width: "90%",
            padding: "2.5rem 2rem",
            background: "var(--bg-card)",
            border: "1.5px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "20px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), 0 0 40px rgba(239, 68, 68, 0.08)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.25rem"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              color: "#EF4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)"
            }}>
              <XCircle style={{ width: "36px", height: "36px" }} />
            </div>

            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>
                Thực Hiện Thất Bại
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
                {errorMessage}
              </p>
            </div>

            <button
              onClick={() => setErrorMessage(null)}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "12px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #EF4444, #7C3AED)",
                border: "none",
                boxShadow: "0 6px 20px rgba(239, 68, 68, 0.25)",
                cursor: "pointer",
                color: "#fff"
              }}
            >
              Đóng & Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Premium Notification Modal (SUCCESS) */}
      {successMessage && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10, 10, 18, 0.65)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          animation: "fadeIn 0.25s ease-out"
        }}>
          <div className="card animate-scale-up" style={{
            maxWidth: "450px",
            width: "90%",
            padding: "2.5rem 2rem",
            background: "var(--bg-card)",
            border: "1.5px solid rgba(16, 185, 129, 0.25)",
            borderRadius: "20px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), 0 0 40px rgba(16, 185, 129, 0.08)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.25rem"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.12)",
              color: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)"
            }}>
              <CheckCircle2 style={{ width: "36px", height: "36px" }} />
            </div>

            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text)", margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>
                Thao Tác Thành Công
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
                {successMessage}
              </p>
            </div>

            <button
              onClick={() => {
                setSuccessMessage(null);
                router.push("/dashboard/profile");
              }}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "12px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #10B981, #7C3AED)",
                border: "none",
                boxShadow: "0 6px 20px rgba(16, 185, 129, 0.25)",
                cursor: "pointer",
                color: "#fff"
              }}
            >
              Hoàn tất & Quay lại hồ sơ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
