"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setErrorMessage(decodeURIComponent(error));
      return;
    }

    if (token) {
      setAuth(token)
        .then(() => {
          setStatus("success");
          setTimeout(() => {
            window.location.href = "/";
          }, 500);
        })
        .catch((err) => {
          console.error("Lỗi khi tải thông tin tài khoản:", err);
          setStatus("error");
          setErrorMessage("Không thể xác thực thông tin tài khoản Google.");
        });
    } else {
      setStatus("error");
      setErrorMessage("Không tìm thấy mã xác thực (token) từ máy chủ.");
    }
  }, [searchParams, router, setAuth]);

  const isDark = !mounted || resolvedTheme === "dark";

  const c = isDark
    ? {
        bg: "#1c1b2e",
        cardBg: "#252438",
        cardShadow: "0 25px 60px rgba(0,0,0,0.5)",
        heading: "#ffffff",
        sub: "rgba(255,255,255,0.6)",
        border: "rgba(255,255,255,0.08)",
      }
    : {
        bg: "#ede9fe",
        cardBg: "#ffffff",
        cardShadow: "0 25px 60px rgba(124,58,237,0.12)",
        heading: "#1a1a2e",
        sub: "#6b7280",
        border: "#e5e7eb",
      };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: c.bg,
        padding: "1.5rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: c.cardBg,
          borderRadius: "20px",
          padding: "2.5rem 2rem",
          boxShadow: c.cardShadow,
          border: `1px solid ${c.border}`,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {status === "loading" && (
          <>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(124, 58, 237, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem",
              }}
            >
              <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color: c.heading,
                marginBottom: "0.5rem",
              }}
            >
              Đang xác thực Google...
            </h2>
            <p style={{ fontSize: "0.9rem", color: c.sub, margin: 0 }}>
              Vui lòng chờ trong giây lát, chúng tôi đang kết nối tài khoản của bạn.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(34, 197, 94, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color: c.heading,
                marginBottom: "0.5rem",
              }}
            >
              Đăng nhập thành công!
            </h2>
            <p style={{ fontSize: "0.9rem", color: c.sub, margin: 0 }}>
              Đang chuyển hướng về trang chủ...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem",
              }}
            >
              <AlertCircle size={32} color="#ef4444" />
            </div>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color: c.heading,
                marginBottom: "0.5rem",
              }}
            >
              Đăng nhập thất bại
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#ef4444",
                marginBottom: "1.75rem",
                maxWidth: "380px",
                lineHeight: 1.5,
              }}
            >
              {errorMessage || "Có lỗi xảy ra trong quá trình xác thực tài khoản Google."}
            </p>
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                borderRadius: "10px",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
                boxShadow: "0 4px 15px rgba(124, 58, 237, 0.35)",
              }}
            >
              Quay lại đăng nhập <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1c1b2e",
            color: "#ffffff",
          }}
        >
          <Loader2 className="animate-spin text-purple-500" size={32} />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
