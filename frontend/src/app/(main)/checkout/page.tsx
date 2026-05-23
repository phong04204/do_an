"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Copy, 
  Eye, 
  EyeOff, 
  Clock, 
  Check, 
  Info,
  Sparkles
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";

interface DeliveredAccount {
  id: number;
  name: string;
  username: string;
  password: string;
  email: string;
  backupCode: string;
}

function formatPrice(p: number) {
  return p.toLocaleString("vi-VN") + "đ";
}

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "zalopay" | "vnpay">("momo");
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isPaid, setIsPaid] = useState(false);
  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({});
  const [orderId] = useState(() => "GAMEACC-" + Math.floor(100000 + Math.random() * 900000));
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deliveredAccounts, setDeliveredAccounts] = useState<DeliveredAccount[]>([]);

  const { items, totalPrice, clearCart, addItem } = useCartStore();

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("test") === "true" && useCartStore.getState().items.length === 0) {
          addItem({
            id: 999,
            name: "Tài Khoản Test Game VIP - Cấp 30 Full Tướng (Demo)",
            image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80",
            price: 150000,
            quantity: 1,
            product_type: "account"
          });
        }
      }
    });
  }, [addItem]);

  // Timer logic
  useEffect(() => {
    if (!mounted || isPaid) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mounted, isPaid]);

  if (!mounted) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div className="skeleton" style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 1rem" }} />
          <div className="skeleton" style={{ width: "120px", height: "20px", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  // If cart is empty and not paid, redirect back to cart
  if (items.length === 0 && !isPaid) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: "1rem" }}>Giỏ hàng của bạn đang trống!</h2>
          <Link href="/san-pham" className="btn-primary">Quay lại cửa hàng</Link>
        </div>
      </div>
    );
  }

  const subtotal = totalPrice();
  const insuranceFee = Math.round(subtotal * 0.015); // Escrow Insurance (1.5%)
  const finalTotal = subtotal + insuranceFee;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const togglePasswordVisibility = (itemId: number) => {
    setShowPassword((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handlePaymentConfirm = () => {
    if (!name || !email || !phone) {
      alert("Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại liên hệ!");
      return;
    }
    const mockAccs = items.map((item) => ({
      id: item.id,
      name: item.name,
      username: `account_game_${item.id}`,
      password: `gameacc@pass_${Math.floor(10000 + Math.random() * 90000)}`,
      email: `clean_acc${item.id}_owner@gmail.com`,
      backupCode: `BACKUP-${Math.floor(100000 + Math.random() * 900000)}`
    }));
    setDeliveredAccounts(mockAccs);
    setIsPaid(true);
  };

  const handleBackToHome = () => {
    clearCart();
    router.push("/");
  };

  // ── SUCCESSFUL PAYMENT SCREEN ────────────────────────────────────────
  if (isPaid) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "3rem 0 5rem" }}>
        <div className="container-main animate-fade-in-up" style={{ maxWidth: "800px" }}>
          
          {/* Header Success Section */}
          <div className="card" style={{ 
            padding: "3rem 2rem", 
            textAlign: "center", 
            background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(124,58,237,0.05) 100%)",
            borderColor: "rgba(16,185,129,0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
            marginBottom: "2rem"
          }}>
            <div style={{ 
              width: "80px", height: "80px", borderRadius: "50%", 
              background: "#10B981", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)"
            }}>
              <CheckCircle2 style={{ width: "42px", height: "42px" }} />
            </div>

            <div>
              <h1 className="text-gradient" style={{ fontSize: "2.25rem", fontWeight: 900, background: "linear-gradient(135deg, #10B981, #7C3AED)" }}>
                Thanh Toán Thành Công!
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
                Đơn hàng <strong style={{ color: "var(--text)" }}>{orderId}</strong> của bạn đã được duyệt tự động. Dưới đây là thông tin bàn giao tài khoản.
              </p>
            </div>

            <div style={{ 
              padding: "0.75rem 1.5rem", borderRadius: "8px", background: "var(--bg-soft)", 
              fontSize: "0.85rem", color: "var(--text-muted)", border: "1px solid var(--border-light)"
            }}>
              Một bản sao thông tin tài khoản và hóa đơn đã được gửi về email: <strong style={{ color: "var(--text)" }}>{email}</strong>
            </div>
          </div>

          {/* Account Delivery Table */}
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles style={{ width: "20px", height: "20px", color: "var(--primary)" }} /> Thông Tin Tài Khoản Bàn Giao
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "3rem" }}>
            {deliveredAccounts.map((acc) => (
              <div key={acc.id} className="card" style={{ background: "var(--bg-card)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ 
                  background: "var(--bg-soft)", padding: "1rem 1.5rem", 
                  borderBottom: "1px solid var(--border-light)", display: "flex", 
                  justifyContent: "space-between", alignItems: "center" 
                }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{acc.name}</span>
                  <span style={{ fontSize: "0.75rem", background: "rgba(16,185,129,0.15)", color: "#10B981", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                    Bàn giao thành công
                  </span>
                </div>

                {/* Details list */}
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[
                    { label: "Tên đăng nhập (Username)", value: acc.username, isCopy: true },
                    { label: "Mật khẩu (Password)", value: acc.password, isCopy: true, isPassword: true },
                    { label: "Email gốc đi kèm (Original Email)", value: acc.email, isCopy: true },
                    { label: "Mã khôi phục (Backup Code)", value: acc.backupCode, isCopy: true },
                  ].map((field, fIdx) => (
                    <div key={fIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--border-light)", paddingBottom: "0.75rem" }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.15rem" }}>{field.label}</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)", fontFamily: "monospace" }}>
                          {field.isPassword && !showPassword[acc.id] ? "••••••••••••••" : field.value}
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {field.isPassword && (
                          <button 
                            onClick={() => togglePasswordVisibility(acc.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.25rem" }}
                          >
                            {showPassword[acc.id] ? <EyeOff style={{ width: "16px", height: "16px" }} /> : <Eye style={{ width: "16px", height: "16px" }} />}
                          </button>
                        )}
                        {field.isCopy && (
                          <button 
                            onClick={() => handleCopy(field.value, `${acc.id}-${fIdx}`)}
                            style={{ 
                              background: "none", border: "none", cursor: "pointer", 
                              color: copiedField === `${acc.id}-${fIdx}` ? "#10B981" : "var(--text-muted)", 
                              padding: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem"
                            }}
                          >
                            {copiedField === `${acc.id}-${fIdx}` ? <Check style={{ width: "14px", height: "14px" }} /> : <Copy style={{ width: "14px", height: "14px" }} />}
                            {copiedField === `${acc.id}-${fIdx}` ? "Đã copy" : "Copy"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleBackToHome} className="btn-primary" style={{ width: "100%", padding: "1rem", borderRadius: "12px", fontSize: "1rem" }}>
            Hoàn tất & Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  // ── PENDING PAYMENT STATE ───────────────────────────────────────────
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "2.5rem 0 5rem" }}>
      <div className="container-main animate-fade-in">
        
        {/* Navigation Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", fontSize: "0.875rem" }}>
          <Link href="/gio-hang" style={{ color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <ArrowLeft style={{ width: "16px", height: "16px" }} /> Quay lại giỏ hàng
          </Link>
          <span style={{ color: "var(--text-light)" }}>/</span>
          <span style={{ color: "var(--text)", fontWeight: 600 }}>Thanh toán</span>
        </div>

        {/* Title */}
        <h1 className="text-gradient" style={{ fontSize: "2.25rem", fontWeight: 900, marginBottom: "2rem", letterSpacing: "-0.03em" }}>
          Thanh Toán Đơn Hàng
        </h1>

        {/* 2 Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "2.5rem", alignItems: "start" }} className="checkout-grid">
          
          {/* Left Column: Form & Payment methods */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Contact Info Card */}
            <div className="card" style={{ padding: "1.75rem", background: "var(--bg-card)" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "1.25rem", color: "var(--text)" }}>
                1. Thông tin liên hệ nhận tài khoản
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                    Họ và tên *
                  </label>
                  <input 
                    type="text" 
                    placeholder="VD: Nguyễn Văn A" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: "100%", padding: "0.75rem 1rem", border: "1.5px solid var(--border)",
                      borderRadius: "10px", outline: "none", background: "var(--bg-soft)", color: "var(--text)", fontSize: "0.9rem"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-row">
                  <div>
                    <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                      Địa chỉ Email nhận thông tin acc *
                    </label>
                    <input 
                      type="email" 
                      placeholder="VD: name@domain.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        width: "100%", padding: "0.75rem 1rem", border: "1.5px solid var(--border)",
                        borderRadius: "10px", outline: "none", background: "var(--bg-soft)", color: "var(--text)", fontSize: "0.9rem"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                      Số điện thoại *
                    </label>
                    <input 
                      type="tel" 
                      placeholder="VD: 0987654321" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      style={{
                        width: "100%", padding: "0.75rem 1rem", border: "1.5px solid var(--border)",
                        borderRadius: "10px", outline: "none", background: "var(--bg-soft)", color: "var(--text)", fontSize: "0.9rem"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                    Lời nhắn / Ghi chú (nếu có)
                  </label>
                  <textarea 
                    placeholder="Những yêu cầu đặc biệt khác..." 
                    rows={3}
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      width: "100%", padding: "0.75rem 1rem", border: "1.5px solid var(--border)",
                      borderRadius: "10px", outline: "none", background: "var(--bg-soft)", color: "var(--text)", fontSize: "0.9rem", resize: "none"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="card" style={{ padding: "1.75rem", background: "var(--bg-card)" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "1.25rem", color: "var(--text)" }}>
                2. Chọn phương thức thanh toán
              </h3>

              {/* Selector grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }} className="payment-grid">
                
                {/* MoMo */}
                <div 
                  onClick={() => setPaymentMethod("momo")}
                  style={{
                    padding: "1rem", borderRadius: "12px", border: "2px solid", cursor: "pointer",
                    borderColor: paymentMethod === "momo" ? "#D82D8B" : "var(--border-light)",
                    background: paymentMethod === "momo" ? "rgba(216,45,139,0.03)" : "transparent",
                    transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem"
                  }}
                >
                  <span style={{ fontSize: "1.75rem" }}>🌸</span>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: paymentMethod === "momo" ? "#D82D8B" : "var(--text)" }}>Ví MoMo</div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center" }}>Duyệt tự động sau 10s</span>
                </div>

                {/* ZaloPay */}
                <div 
                  onClick={() => setPaymentMethod("zalopay")}
                  style={{
                    padding: "1rem", borderRadius: "12px", border: "2px solid", cursor: "pointer",
                    borderColor: paymentMethod === "zalopay" ? "#0068FF" : "var(--border-light)",
                    background: paymentMethod === "zalopay" ? "rgba(0,104,255,0.03)" : "transparent",
                    transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem"
                  }}
                >
                  <span style={{ fontSize: "1.75rem" }}>💚</span>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: paymentMethod === "zalopay" ? "#0068FF" : "var(--text)" }}>Ví ZaloPay</div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center" }}>Duyệt tự động sau 10s</span>
                </div>

                {/* VNPAY */}
                <div 
                  onClick={() => setPaymentMethod("vnpay")}
                  style={{
                    padding: "1rem", borderRadius: "12px", border: "2px solid", cursor: "pointer",
                    borderColor: paymentMethod === "vnpay" ? "#005BAA" : "var(--border-light)",
                    background: paymentMethod === "vnpay" ? "rgba(0,91,170,0.03)" : "transparent",
                    transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem"
                  }}
                >
                  <span style={{ fontSize: "1.75rem" }}>💳</span>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: paymentMethod === "vnpay" ? "#005BAA" : "var(--text)" }}>Cổng VNPAY</div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center" }}>Thẻ ATM, QR, Visa</span>
                </div>

              </div>

              {/* Dynamic QR instruction block */}
              <div style={{ 
                padding: "1.5rem", borderRadius: "12px", 
                background: "var(--bg-soft)", border: "1.5px solid var(--border)" 
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }} className="qr-container">
                  
                  {/* Left sub-column: scan details */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)" }}>
                      <Clock style={{ width: "16px", height: "16px" }} />
                      <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                        Mã QR hiệu lực trong: <strong style={{ color: "#EF4444" }}>{formatTime(timeLeft)}</strong>
                      </span>
                    </div>

                    <div className="divider" style={{ margin: "0.25rem 0" }} />

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {[
                        { label: "Ngân hàng nhận", val: paymentMethod === "vnpay" ? "Vietcombank (VCB)" : paymentMethod === "momo" ? "Ví điện tử MoMo" : "Ví điện tử ZaloPay", key: "bank" },
                        { label: "Số tài khoản / ví", val: paymentMethod === "vnpay" ? "1029481923" : "0348274123", key: "acc" },
                        { label: "Chủ tài khoản", val: "CONG TY GAMEACC SHOP", key: "owner" },
                        { label: "Số tiền chuyển", val: formatPrice(finalTotal), key: "amount" },
                        { label: "Nội dung chuyển", val: orderId, key: "desc" },
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "0.825rem" }}>
                          <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
                          <span style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                            <strong style={{ color: "var(--text)", fontFamily: "monospace" }}>{item.val}</strong>
                            {(item.key === "acc" || item.key === "desc" || item.key === "amount") && (
                              <button 
                                onClick={() => handleCopy(item.val.replace("đ", "").replace(/\./g, ""), item.key)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: copiedField === item.key ? "#10B981" : "var(--text-light)" }}
                                title="Copy"
                              >
                                {copiedField === item.key ? <Check style={{ width: "13px", height: "13px" }} /> : <Copy style={{ width: "13px", height: "13px" }} />}
                              </button>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ 
                      marginTop: "0.5rem", padding: "0.75rem", borderRadius: "8px", 
                      background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)",
                      display: "flex", gap: "0.5rem" 
                    }}>
                      <Info style={{ width: "16px", height: "16px", color: "var(--primary)", flexShrink: 0, marginTop: "2px" }} />
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                        <strong>Lưu ý:</strong> Vui lòng giữ nguyên <strong>Nội dung chuyển</strong> là <strong style={{ color: "var(--primary)" }}>{orderId}</strong> để hệ thống duyệt tự động bàn giao acc lập tức qua email của bạn.
                      </p>
                    </div>
                  </div>

                  {/* Right sub-column: Mock QR code visualizer */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                    <div style={{ 
                      width: "160px", height: "160px", background: "#fff", border: "4px solid",
                      borderColor: paymentMethod === "momo" ? "#D82D8B" : paymentMethod === "zalopay" ? "#0068FF" : "#005BAA",
                      borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.06)"
                    }}>
                      {/* Styled Vector QR Placeholder */}
                      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="36" height="36" fill="#1A1A2E" />
                        <rect x="8" y="8" width="20" height="20" fill="#FFF" />
                        <rect x="92" y="0" width="36" height="36" fill="#1A1A2E" />
                        <rect x="100" y="8" width="20" height="20" fill="#FFF" />
                        <rect x="0" y="92" width="36" height="36" fill="#1A1A2E" />
                        <rect x="8" y="100" width="20" height="20" fill="#FFF" />
                        {/* QR Patterns */}
                        <path d="M48 8h12v12H48zm16 16h12v12H64zm-16 16h12v12H48zm32-32h12v12H80zm0 32h12v12H80zm16-16h12v12H96z" fill="#1A1A2E" />
                        <path d="M48 64h12v12H48zm16 16h12v12H64zm16-16h12v12H80zm16 16h12v12H96zm16-16h12v12H112z" fill="#1A1A2E" />
                        <path d="M0 48h12v12H0zm16 16h12v12H16zm16-16h12v12H32zm16 32h12v12H48zm32 0h12v12H80zm16-16h12v12H96zm16 16h12v12H112z" fill="#1A1A2E" />
                        <path d="M64 48h12v12H64zm16 16h12v12H80zm16-16h12v12H96zm16 16h12v12H112z" fill="#1A1A2E" />
                      </svg>
                      {/* Brand Logo overlay inside QR */}
                      <div style={{
                        position: "absolute", width: "28px", height: "28px", borderRadius: "50%",
                        background: "#fff", border: "2px solid",
                        borderColor: paymentMethod === "momo" ? "#D82D8B" : paymentMethod === "zalopay" ? "#0068FF" : "#005BAA",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 900
                      }}>
                        {paymentMethod === "momo" ? "🌸" : paymentMethod === "zalopay" ? "💚" : "💳"}
                      </div>
                      
                      {/* Scanner scanning light effect */}
                      <div style={{
                        position: "absolute", left: 0, right: 0, height: "2px", background: "rgba(6,182,212,0.8)",
                        top: `${20 + (timeLeft % 10) * 12}px`, boxShadow: "0 0 8px rgba(6,182,212,1)",
                        pointerEvents: "none", transition: "top 0.1s linear"
                      }} />
                    </div>

                    <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", fontWeight: 600, textAlign: "center" }}>
                      Quét mã QR để thanh toán nhanh
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Pay */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="card" style={{ padding: "1.75rem", background: "var(--bg-card)" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.25rem", borderBottom: "1.5px solid var(--border-light)", paddingBottom: "0.75rem" }}>
                Đơn Hàng Đang Mua
              </h2>

              {/* Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ width: "52px", height: "40px", borderRadius: "6px", objectFit: "cover", border: "1px solid var(--border-light)", flexShrink: 0 }} 
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.825rem", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Số lượng: {item.quantity} • {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider" style={{ marginBottom: "1.25rem" }} />

              {/* Pricing detail breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <span>Tạm tính</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{formatPrice(subtotal)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    Phí bảo hiểm trung gian <ShieldCheck style={{ width: "14px", height: "14px", color: "var(--primary)" }} />
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{formatPrice(insuranceFee)}</span>
                </div>

                <div className="divider" />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "0.25rem" }}>
                  <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>Tổng thanh toán</span>
                  <span style={{ fontWeight: 900, fontSize: "1.45rem", color: "var(--primary)" }}>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Pay trigger button */}
              <button 
                onClick={handlePaymentConfirm}
                className="btn-primary" 
                style={{ 
                  width: "100%", padding: "0.9rem", fontSize: "1.05rem", 
                  borderRadius: "12px", display: "flex", alignItems: "center", 
                  justifyContent: "center", gap: "0.5rem",
                  boxShadow: "0 6px 24px rgba(124, 58, 237, 0.25)"
                }}
              >
                <CreditCard style={{ width: "20px", height: "20px" }} />
                Xác nhận đã chuyển khoản
              </button>
            </div>

            {/* Secures list */}
            <div className="card" style={{ padding: "1.25rem", background: "var(--bg-soft)", border: "1.5px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "var(--primary)", fontWeight: 700, fontSize: "0.875rem" }}>
                <ShieldCheck style={{ width: "18px", height: "18px" }} />
                Hệ Thống Thanh Toán Bảo Mật
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                GameAcc Shop sử dụng hệ thống Escrow giữ tiền an toàn 100%. Giao dịch của bạn được mã hóa hoàn toàn. Nick sẽ được bàn giao ngay lập tức sau khi xác nhận chuyển khoản.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
