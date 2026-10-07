"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles,
  Edit,
  Clock
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, fetchMe } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    fetchMe().catch(() => {});
  }, [fetchMe]);

  // Auth protection redirect
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login?redirect=/dashboard/profile");
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

  const userAvatar = user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || "user")}`;
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Chưa xác định";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "3rem 0 6rem" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        
        .info-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding: 1rem 1.25rem;
          background: var(--bg-soft);
          border: 1px solid var(--border-light);
          border-radius: 12px;
        }
        .info-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          fontWeight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .info-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text);
        }
      `}</style>

      <div className="container-main animate-fade-in" style={{ maxWidth: "850px" }}>
        
        {/* Back Link */}
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", fontWeight: 600 }}>
            <ArrowLeft style={{ width: "16px", height: "16px" }} /> Quay lại trang chủ
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
                  alt={user.name} 
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
                {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
              </span>
            </div>
          </div>

          {/* Right Column: Display Information */}
          <div className="card" style={{ 
            padding: "2.5rem", 
            background: "var(--bg-card)", 
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "2rem"
          }}>
            
            {/* Header info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1 className="text-gradient" style={{ fontSize: "1.85rem", fontWeight: 900, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Sparkles style={{ width: "26px", height: "26px", color: "var(--primary)" }} /> Thông Tin Tài Khoản
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                  Xem thông tin chi tiết hồ sơ thành viên của bạn trên hệ thống GameAcc Shop.
                </p>
              </div>
            </div>

            <div className="divider" />

            {/* Read-Only Info Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="profile-form-row">
                {/* Name */}
                <div className="info-field-group">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--primary)" }}>
                    <User style={{ width: 14, height: 14 }} />
                    <span className="info-label">Tên hiển thị / Username</span>
                  </div>
                  <div className="info-value">{user.name}</div>
                </div>

                {/* Email */}
                <div className="info-field-group">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--primary)" }}>
                    <Mail style={{ width: 14, height: 14 }} />
                    <span className="info-label">Địa chỉ Email</span>
                  </div>
                  <div className="info-value">{user.email}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="profile-form-row">
                {/* Phone */}
                <div className="info-field-group">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--primary)" }}>
                    <Phone style={{ width: 14, height: 14 }} />
                    <span className="info-label">Số điện thoại liên hệ</span>
                  </div>
                  <div className="info-value">{user.phone || <em style={{ color: "var(--text-light)" }}>Chưa bổ sung</em>}</div>
                </div>

                {/* Created at */}
                <div className="info-field-group">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--primary)" }}>
                    <Clock style={{ width: 14, height: 14 }} />
                    <span className="info-label">Ngày tham gia hệ thống</span>
                  </div>
                  <div className="info-value">{formatDate(user.created_at)}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }} className="profile-form-row">
                {/* Account Security status */}
                <div className="info-field-group">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--primary)" }}>
                    <ShieldCheck style={{ width: 14, height: 14 }} />
                    <span className="info-label">Trạng thái bảo mật</span>
                  </div>
                  <div className="info-value" style={{ color: "#10B981", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} /> Đã bảo vệ an toàn
                  </div>
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Action buttons */}
            <Link 
              href="/dashboard/profile/edit" 
              className="btn-primary" 
              style={{ 
                width: "100%", padding: "1rem", fontSize: "1rem", 
                borderRadius: "12px", display: "flex", alignItems: "center", 
                justifyContent: "center", gap: "0.5rem", fontWeight: 700,
                boxShadow: "0 6px 20px rgba(124, 58, 237, 0.25)",
                textDecoration: "none"
              }}
            >
              <Edit style={{ width: "20px", height: "20px" }} />
              Chỉnh Sửa Thông Tin Cá Nhân
            </Link>

          </div>

        </div>
      </div>
    </div>
  );
}
